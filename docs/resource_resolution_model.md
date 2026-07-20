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
* **`outputs`** (optional) — an array of entries, each with `id`, `description`, optional `components`, and an optional `artifact` carrying a `name` (the filename produced when the output is persisted).
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
2. **Whole-technique reference** (no nested segment) — deliver the technique's own body (capability, flow, inputs, protocol, outputs) and auto-include its rules.
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

The server resolves an activity's `techniques[]` and bundles them into the `techniques`, `rules`, and `unresolved` buckets, so agents never chain resolution calls themselves at runtime.

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

## 8. Workflow-Level Techniques

A workflow declares techniques partitioned by audience (mirroring `rules`): `techniques.workflow` for the orchestrator and `techniques.activity` for techniques inherited by every activity. The composed body of the first `techniques.workflow` entry is returned by `get_technique` (before any activity); those orchestrator techniques are also covered by the `get_workflow` technique bundle rather than appearing as a separate preamble. The `techniques.activity` references are injected into every `get_activity` technique bundle ahead of the activity's own `techniques[]`, so a technique common to all activities (e.g. variable-binding) is declared once at the workflow level instead of duplicated per activity. Workflows compose behaviour by referencing capability techniques rather than maintaining a monolithic technique.

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

Under `context_mode: "persistent"`, a byte-identical refetch of the same exact `resource_id` (including any `#section`) returns a short `{ delivery: "unchanged", content_hash }` marker instead of the body — the same reference-delivery contract as `get_technique` (see [Reference Delivery](#11-reference-delivery)). Bare and sectioned ids are independent ledger keys. Pass `full: true` to force the full body when the calling context no longer holds the earlier delivery. Fresh/default sessions always receive the full resource body. Each call still appends a `resource_fetched` history event (observability only), including when the answer is an unchanged marker.

### Benefits

* **Context Economy:** Agents load only the exact Markdown guides they need for the technique they are currently performing; persistent sessions avoid re-paying unchanged templates on later fetches.
* **Modularity:** Reference guides (PR formatting, Git CLI usage, etc.) live in single markdown files and are referenced from many techniques across many workflows without duplication.
* **Cross-workflow sharing:** The `{workflow}/{slug}` prefix lets techniques in any workflow pull from a shared resource library in the `meta` workflow.

## 11. Reference Delivery

Full delivery on every call is the default: in disposable-worker topologies each `get_activity` lands in a fresh agent context, and the repeated bundle is load-bearing. A session in which a **single agent context** executes the whole walk can opt into reference delivery instead — content the session+agent has already received is replaced by a short marker rather than repeated.

- **Opt-in:** `start_session { context_mode: "persistent" }` (also accepted by `dispatch_child` for the child session), or per call via `get_activity { bundle: "reference" }`. The per-call opt-in exists only on `get_activity`; `get_technique` and `get_resource` delta mode follow the session's `context_mode`.
- **Ledger:** the server records a per-agent hash of every `get_activity` bundle technique, rules block, `activity_rules` block, full `get_technique` payload, full `get_resource` payload, and `get_workflow` orchestrator ops bundle it delivers (in `session.json#deliveredContent`, keyed by `agentId`). Recording happens in every mode, so a per-call `bundle: "reference"` can refer back to content delivered under the default full mode. Content keys are namespaced by delivery channel (`bundle:*`, `technique:*`, `activity_rules:*`, `workflow_bundle:*`, `resource:*`) so a marker only ever references content delivered in that same channel.
- **`get_workflow` ops-bundle slimming:** under `context_mode: "persistent"`, the orchestrator ops bundle (above the `---` separator) is content-keyed under `workflow_bundle:<hash>`; on a resume where this agent already holds it, the whole bundle collapses to a single `{ delivery: "unchanged", content_hash }` marker while the post-separator workflow summary stays full. Fresh/default sessions always receive the ops bundle in full.
- **`get_activity` reference mode:** the response carries `bundle_mode: reference` plus a `bundle_note`; each bundle technique whose composed content is byte-identical to a prior delivery collapses to `{ delivery: "unchanged", content_hash }`, as do the `rules` and `activity_rules` blocks. Techniques new to the activity (or whose content changed) arrive in full, and within a full eagerly-inlined `step_techniques` entry the shared contract/rules blocks may themselves be markers (see Block-level delivery below). The activity body itself is always delivered.
- **`get_technique` delta mode:** active when the session's `context_mode` is `"persistent"`; a byte-identical refetch returns `delivery: unchanged` + `content_hash` instead of the composed technique. Step-bound provenance annotations (`source:`/`destination:`) are part of the composed content; they are static per corpus and step, so a same-step refetch stays byte-identical and collapses, while fetching the same op from a *different* step (different binding context) re-delivers in full rather than answering with a stale reference.
- **`get_resource` delta mode:** active when the session's `context_mode` is `"persistent"`; a byte-identical refetch of the same `resource_id` returns `delivery: unchanged` + `content_hash` instead of the body. The ledger key is the exact caller `resource_id`, including any `#section` anchor, so `pr-description` and `pr-description#templates` are independent slots. Fresh/default sessions always receive the full resource body.
- **Block-level delivery:** finer-grained than the whole-technique collapse above. A not-yet-seen technique's shared blocks — the contract-inherited `inherited_inputs` / `inherited_outputs` and the merged `rules` — are content-keyed individually (`technique:<block>:<hash>`). When such a block was already delivered by a sibling technique that shares the workflow contract, it collapses to a `{ delivery: "unchanged", content_hash }` marker at its position in the payload while the technique-specific core stays full. This applies on both the `get_technique` full-delivery path and each eagerly-inlined `get_activity` `step_techniques` entry. Content-keying keeps it stale-free: a block annotated with binding-seam provenance hashes differently and correctly delivers in full. `get_technique { full: true }` / `get_activity { bundle: "full" }` re-deliver every block.
- **Full-content escapes:** `get_activity { bundle: "full" }`, `get_technique { full: true }`, and `get_resource { full: true }` force full delivery — use them when the calling context no longer holds the earlier payload (e.g. it was summarized away).
- **Agent scoping:** the ledger is keyed by the session's recorded `agentId`; resuming a session under a different `agent_id` starts that agent from an empty ledger, so its first deliveries are full even in reference mode.
- **Benchmark:** to compare delivery cost on a fixed `work-package` walk against the frozen pre-optimisation A0 reference, run `npm run bench:token` ([`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts); see [development.md](development.md#token-delivery-benchmark)). Default output includes `vsReference.deliveryCostIndex` (A0 = 100, lower is better).

## 12. Hybrid Technique Bundling

Eager step-technique bundling is **automatic and corpus-wide**: `get_activity` inlines the composed content of every activity's small, ungated step-bound techniques under a `step_techniques` map, so those steps execute without a fetch round-trip. There is no per-activity opt-in — the worker's REQUIRED `context_tokens` sizes the bundle.

- **Budget:** the eager-delivery budget is a **cumulative per-activity character budget** = `context_tokens × headroomFraction × charsPerToken`, where `headroomFraction` (default 0.80) and `charsPerToken` (default 4) are server config (env-overridable: `BUNDLE_HEADROOM_FRACTION`, `BUNDLE_CHARS_PER_TOKEN`). The budget accounts for **technique body sizes only** — a technique's resource link text counts, but not resolved resource bodies (those use a separate sibling map; see below). Ungated technique steps are inlined in document order until adding the next would overflow the budget; the remainder stay lazy.
- **What is bundled:** each ungated technique-kind step, in document order, until the cumulative budget is exhausted. A `when`/`condition` on the step itself or on an enclosing loop keeps it lazy, so bundling never delivers content for a step that may not execute. A per-activity `bundleTechniques: { maxChars: <n> }` is an explicit **per-technique size cap** layered on the budget (any single technique larger than `maxChars` stays lazy); `maxChars: 0` opts the activity out of eager bundling entirely. Everything not inlined remains a `get_technique { step_id }` fetch.
- **Eager resources (sibling map):** after step techniques are chosen, `get_activity` collects unique `resource_id`s linked from those bundled techniques and delivers their bodies under a sibling ops `resources` map (keyed by exact `resource_id`, including `#section`). Bodies are **not** nested inside `step_techniques` (avoids per-technique duplication). Oversized single resources (default cap 80 000 chars) stay lazy via `get_resource`. Under `context_mode: "persistent"`, entries share the `resource:<id>` ledger with `get_resource` and may collapse to unchanged markers. `_meta.bundled_resources` lists the ids; each delivery records a `resource_fetched` history event.
- **Response shape:** bundled techniques arrive under `step_techniques`, keyed by step id. Each entry leads with a discrete `▼ STEP <step_id> · technique <name>` arrival marker, then the step's full composition — identical to the step-bound `get_technique` fetch. A `step_techniques_note` and optional `resources_note` prescribe reuse of the sibling `resources` map. `_meta.bundled_steps` lists bundled step ids.
- **Intentional stepping:** the *act* of calling `get_technique` is a deliberate "I now turn to this step" beat. Inlining removes that call, so the worker substitutes for it: process inlined `step_techniques` strictly in step order and, on reaching each step, EMIT a one-line `▶ step <step_id>` begin-beat before executing it. That emitted beat carries the intentional act and **is** the stepwise observability trace for bundled steps — the worker does NOT ping the server per bundled step; the delivery-time `technique_bundled` events already record coverage.
- **Ledger interplay:** bundled entries share the `technique:<resolvedId>` ledger key with `get_technique`, so in a persistent-context session a bundled delivery collapses a later step-bound refetch to an unchanged-reference — and reference-mode re-delivery of the activity collapses already-delivered bundled entries to `{ delivery: "unchanged", content_hash }` markers (the `▼ STEP` marker rides along). `bundle: "full"` re-delivers everything.
- **Fidelity:** each bundled step is recorded as a `technique_bundled` history event and counts as delivery coverage for `next_activity`'s manifest fidelity check — see [Workflow Fidelity](workflow-fidelity.md).
