# Skill, Operation & Resource Resolution Architecture

LLM context windows are precious. Loading an entire workflow's worth of instructions, rules, and system prompts into an agent's context window on bootstrap leads to context degradation, high latency, and increased costs.

The Workflow Server solves this via a **lazy-loading resource architecture** layered on top of an **operation-focused skill model**.

## 1. Canonical IDs and Prefix Stripping

Skills, activities, and resources are stored on disk with numerical prefixes to enforce ordered visibility for humans (e.g., `00-workflow-engine.toon`, `02-design-philosophy.toon`).

The internal resolution system uses **Canonical IDs**. The server's `filename-utils` strips the `NN-` prefix during parsing.
* File: `00-workflow-engine.toon`
* Canonical ID: `workflow-engine`

Agents always reference skills, operations, and activities by their Canonical IDs.

## 2. Skills as Operation Containers

A skill is a container for three kinds of named elements:

* **`operations`** — short linear procedures, each with `inputs`, `output`, `procedure`, `tools`, optional per-operation `resources`, `errors`, `rules`, and `prose`.
* **`rules`** — behavioural invariants (single string or grouped array) that apply across the skill.
* **`errors`** — failure-mode definitions with `cause`, `recovery`, `detection`, and `resolution` steps.

Skills also keep top-level metadata (`id`, `version`, `capability`, `description`) and optional `inputs`, `protocol`, `output`, and `resources` fields used by the legacy `get_skill` path.

The `harness` field on operations was removed — implementation hints that used to live there are now folded into the operation's `procedure`, `prose`, and `tools` fields. The `tools` map keys an MCP server name (e.g. `workflow-server`, `atlassian`, `gitnexus`) or one of the reserved keys `shell` / `harness`.

## 3. Operation References

Activities and workflows compose behaviour by listing operation references in a flat `operations:` array:

```yaml
operations:
  - workflow-engine::dispatch-activity
  - workflow-engine::evaluate-transition
  - agent-conduct::checkpoint-discipline
  - meta/agent-conduct::file-sensitivity     # workflow-prefixed
```

Each ref is `skill-id::element-name`, optionally workflow-prefixed (`workflow-id/skill-id::element-name`). An element name may map to an `operation`, `rule`, or `error` in the target skill — the resolver tries them in that order.

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

1. Locate the skill — if the ref carries a workflow prefix, load from that workflow; otherwise load from the session's workflow with a `meta/` fallback.
2. Match `name` against the skill's `operations` map. If found, return type `operation`.
3. Otherwise match `name` against the skill's `rules` map. If found, return type `rule`.
4. Otherwise match `name` against the skill's `errors` map. If found, return type `error`.
5. Otherwise emit a `not-found` entry — the resolver never silently drops missing refs.

**Auto-inclusion of skill rules.** When at least one element from a skill is successfully resolved, the resolver auto-appends that skill's remaining global rules (those not already explicitly requested) with type `rule`. This lets an activity reference a single operation and still receive the skill's invariants without enumerating every rule.

`resolve_operations` requires no session token — it is a structural lookup. Most clients invoke it indirectly through the bundles that `get_workflow` and `get_activity` produce.

## 5. Operation Bundling at Workflow / Activity Granularity

The server pre-resolves operations for the two main bootstrap calls so agents never need to chain `resolve_operations` themselves at runtime.

### `get_workflow` — orchestrator bundle

The response is structured as:

```
<primary skill body, if any>

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
| `CORE_ORCHESTRATOR_OPS` | `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `handle-sub-workflow`, `present-checkpoint-to-user`, `respond-checkpoint`, `bubble-checkpoint-up`, `persist`; `agent-conduct::orchestrator-discipline`, `checkpoint-discipline`, `operational-discipline` |
| `CORE_WORKER_OPS` | `workflow-engine::yield-checkpoint`, `resume-from-checkpoint`, `finalize-activity`; `agent-conduct::checkpoint-discipline`, `operational-discipline`, `file-sensitivity`, `code-commentary` |

## 6. Universal Skill Fallback

Not every workflow needs to redefine standard agent behaviours (workflow engine procedures, agent conduct rules, etc.).

When resolving a skill (via `get_skill`, `get_skills`, or the resolver inside `resolve_operations`), the server uses a fallback path:

1. **Local Scope:** look in the current workflow's skill folder (e.g., `workflows/work-package/skills/`).
2. **Universal Scope:** if not found locally, fall back to `workflows/meta/skills/` and then to a cross-workflow scan.

This lets workflows inherit standard meta capability skills (`workflow-engine`, `agent-conduct`, `atlassian-operations`, …) for free while still being able to override them when specialised behaviour is needed.

## 7. Workflow-Level Primary Skill (Legacy)

Workflows may still declare a `skills.primary` field. When present, that skill's raw TOON is returned by `get_skills` and is included as the pre-bundle preamble of `get_workflow`. New workflows are encouraged to compose behaviour via `operations` arrays referencing capability skills rather than maintaining a monolithic primary skill.

## 8. The `resources` Array

Even with operations and skills tightly scoped, large reference material (Git CLI tutorials, API guides, templates) doesn't belong inline. Skills and individual operations declare a `resources` array of lightweight references:

```yaml
resources:
  - "04"            # bare index — resolves within the session workflow
  - "meta/03"       # prefixed — resolves from the meta workflow
```

Resource refs may live at the skill level or per-operation. Server responses do not bundle resource bodies — agents call `get_resource` only when they actually need a resource.

## 9. Lazy Loading via `get_resource`

When the agent encounters an operation that needs a resource, it calls:

```javascript
get_resource({ session_token, resource_id: "meta/03" })
```

The server resolves the reference using `parseResourceRef`:

* Bare indices (e.g., `"04"`) resolve within the session's workflow.
* Prefixed references (e.g., `"meta/03"`) resolve from the named workflow.

The full content is loaded from `workflows/{workflow}/resources/{NN}-{name}.md` (or `.toon`) and returned alongside the resource `id` and `version`.

### Benefits

* **Context Economy:** Agents only load the exact Markdown guides they need for the operation they are currently performing.
* **Modularity:** Reference guides (PR formatting, Git CLI usage, etc.) live in single markdown files and are referenced from many operations across many workflows without duplication.
* **Cross-workflow sharing:** The `meta/NN` prefix lets skills and operations in any workflow pull from a shared resource library in the `meta` workflow.
