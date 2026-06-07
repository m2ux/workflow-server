# Technique & Resource Resolution Architecture

LLM context windows are precious. Loading an entire workflow's worth of instructions, rules, and system prompts into an agent's context window on bootstrap leads to context degradation, high latency, and increased costs.

The Workflow Server solves this via a **lazy-loading resource architecture** layered on top of a **technique model** in which all behaviour is composed from techniques.

## 1. Canonical IDs (Slugs)

Techniques and resources are stored on disk as markdown files whose **slug** is the canonical id. A standalone technique is `techniques/{slug}.md`; a grouped technique is a folder `techniques/{group}/TECHNIQUE.md` plus one `{sub}.md` per nested technique; a resource is `resources/{slug}.md`. The slug equals the filename (and the frontmatter `name:`).

* File: `techniques/workflow-engine.md`
* Canonical ID: `workflow-engine`

Agents reference techniques and resources by their canonical slugs.

## 2. Techniques

There is one kind of technique. A technique is a markdown file (standalone) or a grouped folder whose `TECHNIQUE.md` index contains nested techniques as sibling `{sub}.md` files. A **nested technique is itself a technique** — it has the same shape and is delivered the same way.

A technique's published shape is:

* **`id`**, **`version`**, **`capability`** — the identity and the capability statement.
* **`inputs`** (optional) — an array of entries, each with `id`, `description`, `required`, `default`, and optional `components` (named sub-members).
* **`output`** (optional) — an array of entries, each with `id`, `description`, optional `components`, and an optional `artifact` carrying a `name` (the filename produced when the output is persisted).
* **`protocol`** — an ordered list of blocks `{title?, steps[]}`. Steps are imperative bullets; failure handling is expressed inline within the relevant steps.
* **`rules`** — named behavioural invariants that apply across the technique. Each key is a rule name (or a group prefix); each value is a single rule string or an array of related rules.

The `tools` map keys an MCP server name (e.g. `workflow-server`, `atlassian`, `gitnexus`) or one of the reserved keys `shell` / `harness`.

## 3. Technique & Rule References

Activities and workflows compose behaviour by listing technique references. A reference is a `::`-delimited path:

```
[workflow::]technique[::nested…]
```

```yaml
techniques:
  primary: workflow-engine::dispatch-activity
  supporting:
    - workflow-engine::evaluate-transition
    - agent-conduct::checkpoint-discipline
    - meta::agent-conduct::file-sensitivity     # workflow-prefixed
```

A same-workflow reference omits the workflow segment; the current workflow is filled in at resolution. Include a leading workflow segment only to reach another workflow. A `workflow/technique` slash form is normalized to the `::` form.

A reference addresses one of two things:

* **A technique** — a standalone `{technique}.md`, a grouped `{group}/TECHNIQUE.md` index, or a nested `{group}/{sub}.md` file (addressed `{group}::{sub}`). A nested technique is a technique.
* **A rule** — when the trailing segment matches a rule name on the addressed technique. A bare group reference `{technique}::{group}` expands to every rule named `{group}-*` on that technique.

Inline technique invocations also appear inside step descriptions:

```yaml
steps:
  - id: dispatch-worker
    description: "workflow-engine::dispatch-activity(activity_id: {next}, agent_id: 'worker')"
```

The inline form points at the same technique body. Agents read the technique from the bundled response rather than re-fetching it.

## 4. Resolution

Each reference resolves as follows:

1. **Locate the technique.** If the reference carries a workflow segment, load from that workflow's `techniques/` folder. Otherwise resolve **current-workflow-first, then the `meta` shared layer** — the current workflow's technique shadows a same-named `meta` one.
2. **Whole-technique reference** (no nested segment) — deliver the technique's own body (capability, flow, inputs, protocol, output) and auto-include its rules.
3. **Nested reference** — try a `{group}/{sub}.md` nested technique first (current-workflow-first, then `meta`); deliver its body and auto-include its rules.
4. **Rule reference** — if no nested technique matches, match the trailing segment against the technique's rules. A direct name match resolves to that rule. A group prefix `{group}` expands to every `{group}-*` rule.
5. **Unresolved** — a reference that matches none of the above surfaces explicitly; it is never silently dropped.

**Auto-inclusion of technique rules.** When a technique is resolved, its remaining rules (those not already explicitly requested) are appended as rule entries. This lets an activity reference a single technique and still receive the technique's invariants without enumerating every rule.

The result of resolving a list of references is a bundle grouped into three buckets:

* **`techniques`** — keyed by full path (`{workflow}/{technique}` or `{technique}`, with `::{sub}` appended for a nested technique) → technique body.
* **`rules`** — a flat array of `[rule-name, rule-line]` tuples (one tuple per line).
* **`unresolved`** — references that did not resolve.

Empty buckets are omitted. The lookup is structural and requires no session token; most clients receive it indirectly through the bundles that `get_workflow` and `get_activity` produce.

## 5. Protocol Composition

When a technique is delivered, an ancestor container's `Initial` and `Final` protocol blocks wrap the descendant's protocol recursively. Every ancestor along the path — the workflow-root `TECHNIQUE.md` and each containing group's `TECHNIQUE.md` — contributes its `Initial` blocks (before) and `Final` blocks (after) the technique's own protocol. The server renumbers the combined sequence for display. Any other ancestor block is parent-only: it appears solely when that ancestor is referenced directly.

## 6. Delivery at Workflow / Activity Granularity

The server resolves an activity's `techniques.primary` plus its `techniques.supporting[]` and bundles them into the `techniques`, `rules`, and `unresolved` buckets, so agents never chain resolution calls themselves at runtime.

### `get_workflow` — orchestrator bundle

The response is the union of the workflow's declared technique references and the core orchestrator technique references the server auto-includes (`CORE_ORCHESTRATOR_TECHNIQUES` in `src/loaders/core-ops.ts`): the engine traversal, checkpoint flow, state-persistence, sub-agent dispatch, and orchestrator-discipline references every orchestrator needs. Duplicates are deduplicated.

### `get_activity` — worker bundle

The response is the union of the activity's declared technique references and the core worker technique references the server auto-includes (`CORE_WORKER_TECHNIQUES` in `src/loaders/core-ops.ts`): the yield/resume checkpoint, finalize-activity, and worker-side `agent-conduct` rule references every worker needs.

### Core technique reference sets (`src/loaders/core-ops.ts`)

| Set | Technique references |
|-----|----------------------|
| `CORE_ORCHESTRATOR_TECHNIQUES` | `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `handle-sub-workflow`, `compose-prompt`, `present-checkpoint-to-user`, `respond-checkpoint`; `version-control::commit-submodule`, `commit-regular-files`; `harness-compat::spawn-agent`, `continue-agent`; `agent-conduct::orchestrator`, `checkpoint-discipline`, `operational-discipline` |
| `CORE_WORKER_TECHNIQUES` | `workflow-engine::yield-checkpoint`, `resume-from-checkpoint`, `finalize-activity`; `agent-conduct::checkpoint-discipline`, `operational-discipline`, `file-sensitivity`, `code-commentary` |

## 7. Shared-Layer Technique Resolution

Standard agent behaviours (workflow engine procedures, agent conduct rules, etc.) live once in the `meta` shared layer, so a workflow need not redefine them.

When resolving a technique, the server uses a two-step path:

1. **Workflow-local scope:** look in the current workflow's technique folder (e.g. `workflows/work-package/techniques/`).
2. **Meta shared layer:** if not found locally, fall back to `workflows/meta/techniques/`.

This lets workflows inherit standard meta capability techniques (`workflow-engine`, `agent-conduct`, `atlassian-operations`, …) while still being able to override them — a workflow-local technique of the same id shadows the meta one.

## 8. Workflow-Level Primary Technique

A workflow may declare a `techniques.primary` field. That technique's composed body is returned by `get_technique` (before any activity) and is included as the preamble of `get_workflow`. Workflows compose behaviour by referencing capability techniques rather than maintaining a monolithic primary technique.

## 9. Resources

Even with techniques tightly scoped, large reference material (Git CLI tutorials, API guides, templates) does not belong inline. A technique references a resource by id through a normal markdown hyperlink in its content (for example, a template linked from an Input or Output). When the server projects a technique for delivery, it **rewrites those resource hyperlinks into `get_resource`-callable refs** — the bare id form `{id}[#section]`, or the cross-workflow form `{workflow}/{id}[#section]`. Technique links are left untouched.

Server responses do not bundle resource bodies. The agent loads a resource only when it actually needs it.

## 10. Lazy Loading via `get_resource`

When the agent encounters a resource reference it needs, it calls:

```javascript
get_resource({ session_index, resource_id: "meta/activity-worker-prompt" })
```

The server resolves the reference:

* **Bare slugs** (e.g. `"review-mode"`) resolve within the session's workflow.
* **Prefixed references** (e.g. `"meta/activity-worker-prompt"`) resolve from the named workflow.

An optional `#section` anchor (a GitHub-style heading slug) narrows the result to that section and its body — used to fetch just the template a technique references without the whole file. The content is loaded from `workflows/{workflow}/resources/{slug}.md` and returned alongside the resource `id` and `version`.

### Benefits

* **Context Economy:** Agents load only the exact Markdown guides they need for the technique they are currently performing.
* **Modularity:** Reference guides (PR formatting, Git CLI usage, etc.) live in single markdown files and are referenced from many techniques across many workflows without duplication.
* **Cross-workflow sharing:** The `{workflow}/{slug}` prefix lets techniques in any workflow pull from a shared resource library in the `meta` workflow.
