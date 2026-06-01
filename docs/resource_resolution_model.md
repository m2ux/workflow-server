# Technique, Operation & Resource Resolution Architecture

LLM context windows are precious. Loading an entire workflow's worth of instructions, rules, and system prompts into an agent's context window on bootstrap leads to context degradation, high latency, and increased costs.

The Workflow Server solves this via a **lazy-loading resource architecture** layered on top of an **operation-focused technique model**.

## 1. Canonical IDs (Slugs)

Techniques and resources are stored on disk as markdown files whose **slug** is the canonical id. A standalone technique is `techniques/{slug}.md`; a grouped technique is `techniques/{group}/TECHNIQUE.md` plus one `{op}.md` per operation; a resource is `resources/{slug}.md`. The slug equals the filename (and the frontmatter `name:`).

* File: `techniques/workflow-engine.md`
* Canonical ID: `workflow-engine`

Agents always reference techniques, operations, and resources by their canonical slugs.

## 2. Techniques

A technique is a markdown file (or grouped folder) defining a capability, plus optional named elements:

* **`operations`** — individual `{op}.md` files within a grouped technique, each with `inputs`, `output`, a `## Protocol` step list, `tools`, optional per-operation `resources`, `errors`, `rules`, and `prose`.
* **`rules`** — behavioural invariants (single rule or grouped array) that apply across the technique.
* **`errors`** — failure-mode definitions with `cause`, `recovery`, `detection`, and `resolution` steps.

A technique's published shape is `id`, `version`, `capability`, plus optional `inputs`, `protocol`, `output`, `rules`, and `errors`. It has no `description`, `resources`, or `operations` field on the technique itself — operations are separate `{op}.md` files addressed `{group}::{op}`, and resource refs live per-operation.

The `tools` map keys an MCP server name (e.g. `workflow-server`, `atlassian`, `gitnexus`) or one of the reserved keys `shell` / `harness`.

## 3. Operation References

Activities and workflows compose behaviour by listing operation references in a flat `operations:` array:

```yaml
operations:
  - workflow-engine::dispatch-activity
  - workflow-engine::evaluate-transition
  - agent-conduct::checkpoint-discipline
  - meta/agent-conduct::file-sensitivity     # workflow-prefixed
```

Each ref is `group::element-name`, optionally workflow-prefixed (`workflow-id/group::element-name`). The operation `group::op` resolves to the file `{group}/{op}.md`. An element name may map to an `operation`, `rule`, or `error` in the target technique — the resolver tries them in that order.

Inline operation invocations also appear inside step descriptions:

```yaml
steps:
  - id: dispatch-worker
    description: "workflow-engine::dispatch-activity(activity_id: {next}, agent_id: 'worker')"
```

The inline form is just a sugar pointing at the same operation body — agents read the operation from the bundled response, not by re-fetching it.

## 4. Resolution Pipeline (`resolve_operations`)

The server tool `resolve_operations` takes a list of refs and returns one entry per ref:

```json
{
  "operations": [
    {
      "ref": "workflow-engine::dispatch-activity",
      "source": "workflow-engine",
      "workflow": null,
      "name": "dispatch-activity",
      "type": "operation",
      "body": { ... }
    }
  ]
}
```

Resolution lookup order for each ref:

1. Locate the technique — if the ref carries a workflow prefix, load from that workflow; otherwise load from the session's workflow with a `meta/` fallback.
2. Match `name` against the technique's operations (the `{group}/{op}.md` files). If found, return type `operation`.
3. Otherwise match `name` against the technique's `rules`. If found, return type `rule`.
4. Otherwise match `name` against the technique's `errors`. If found, return type `error`.
5. Otherwise emit a `not-found` entry — the resolver never silently drops missing refs.

**Auto-inclusion of technique rules.** When at least one element from a technique is successfully resolved, the resolver auto-appends that technique's remaining global rules (those not already explicitly requested) with type `rule`. This lets an activity reference a single operation and still receive the technique's invariants without enumerating every rule.

`resolve_operations` requires no session token — it is a structural lookup. Most clients invoke it indirectly through the bundles that `get_workflow` and `get_activity` produce.

## 5. Operation Bundling at Workflow / Activity Granularity

The server pre-resolves operations for the two main bootstrap calls so agents never need to chain `resolve_operations` themselves at runtime.

### `get_workflow` — orchestrator bundle

The response is structured as:

```
<primary technique body, if any>

<TOON operations bundle>

---

<workflow summary or raw body>
```

The operations bundle is the union of `workflow.operations` (workflow-declared refs) and `CORE_ORCHESTRATOR_OPS` — the engine traversal, checkpoint flow, persistence, and orchestrator discipline ops every orchestrator needs. Duplicates are deduplicated.

### `get_activity` — worker bundle

The response is structured as:

```
<TOON operations bundle>

---

<raw activity body>
```

The bundle is the union of `activity.operations` (activity-declared refs) and `CORE_WORKER_OPS` — yield/resume checkpoint, finalize-activity, plus worker-side `agent-conduct` rules. The activity body retains its declared `operations` array so the worker can re-resolve refs locally if needed.

### Core operation sets (`src/loaders/core-ops.ts`)

| Set | Operations |
|-----|-----------|
| `CORE_ORCHESTRATOR_OPS` | `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `handle-sub-workflow`, `present-checkpoint-to-user`, `respond-checkpoint`, `bubble-checkpoint-up`; `agent-conduct::orchestrator-discipline`, `checkpoint-discipline`, `operational-discipline` |
| `CORE_WORKER_OPS` | `workflow-engine::yield-checkpoint`, `resume-from-checkpoint`, `finalize-activity`; `agent-conduct::checkpoint-discipline`, `operational-discipline`, `file-sensitivity`, `code-commentary` |

## 6. Universal Technique Fallback

Not every workflow needs to redefine standard agent behaviours (workflow engine procedures, agent conduct rules, etc.).

When resolving a technique (via `get_technique` or the resolver inside `resolve_operations`), the server uses a fallback path:

1. **Local Scope:** look in the current workflow's technique folder (e.g., `workflows/work-package/techniques/`).
2. **Universal Scope:** if not found locally, fall back to `workflows/meta/techniques/` and then to a cross-workflow scan.

This lets workflows inherit standard meta capability techniques (`workflow-engine`, `agent-conduct`, `atlassian-operations`, …) for free while still being able to override them when specialised behaviour is needed.

## 7. Workflow-Level Primary Technique

Workflows may declare a `techniques.primary` field. When present, that technique's composed body is returned by `get_technique` (before any activity) and is included as the pre-bundle preamble of `get_workflow`. Workflows are encouraged to compose behaviour via `operations` arrays referencing capability techniques rather than maintaining a monolithic primary technique.

## 8. The `resources` Array

Even with operations and techniques tightly scoped, large reference material (Git CLI tutorials, API guides, templates) doesn't belong inline. Individual operations declare a `resources` array of lightweight references:

```yaml
resources:
  - "review-mode"                  # bare slug — resolves within the session workflow
  - "meta/activity-worker-prompt"  # prefixed — resolves by slug from the meta workflow
```

Resource refs live per-operation. Server responses do not bundle resource bodies — agents call `get_resource` only when they actually need a resource.

## 9. Lazy Loading via `get_resource`

When the agent encounters an operation that needs a resource, it calls:

```javascript
get_resource({ session_index, resource_id: "meta/activity-worker-prompt" })
```

The server resolves the reference using `parseResourceRef`:

* Bare slugs (e.g., `"review-mode"`) resolve within the session's workflow.
* Prefixed references (e.g., `"meta/activity-worker-prompt"`) resolve from the named workflow.

The full content is loaded from `workflows/{workflow}/resources/{slug}.md` and returned alongside the resource `id` and `version`.

### Benefits

* **Context Economy:** Agents only load the exact Markdown guides they need for the operation they are currently performing.
* **Modularity:** Reference guides (PR formatting, Git CLI usage, etc.) live in single markdown files and are referenced from many operations across many workflows without duplication.
* **Cross-workflow sharing:** The `meta/{slug}` prefix lets operations in any workflow pull from a shared resource library in the `meta` workflow.
