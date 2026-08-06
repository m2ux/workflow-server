---
metadata:
  version: 6.11.0
---

## Capability

Contract and rules for executing a workflow's structured flow — sessions, activities, agents, Progress, and checkpoints.

## Rules

### session-index-passes-on-each-call

EVERY authenticated tool call (anything other than `discover`, `list_workflows`, `start_session`, `health_check`) requires a `session_index` parameter — the 6-character base32 string returned by `start_session`. The index is stable across all calls within a session; there is no rotation discipline.

### validation-warnings

Check `_meta.validation` in each response. Warnings are advisory but should be addressed.

### dispatch-topology

Client walks dispatch workers via [dispatch-activity](./dispatch-activity.md), each worker carrying a bounded run of activities and continued across each activity boundary by [continue-batch](./continue-batch.md). The bound is the server's, enforced at delivery — see [batch-is-bounded-by-the-server](./dispatch-activity.md#batch-is-bounded-by-the-server). Do not set `context_mode: "persistent"` on worker-dispatched sessions — see [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context).

### resource-loading-via-tool

Resource refs returned in operation bodies (e.g. `planning-readme`) are lightweight pointers. When `get_activity` includes a sibling `resources` map, reuse those bodies (or unchanged markers). Otherwise load via `get_resource { session_index, resource_id }`.

The ids come from the delivery: the `resources` map keys, `resource_refs`, and the refs in the operation bodies this response carried, each already qualified. Pass one of those verbatim. A ref that will not resolve is a definition defect to report, not a spelling to search for — an id guessed under another workflow prefix or another slug spelling costs a round trip and returns an error, and the id that would have worked was in the response already.

### fetch-costs-what-it-delivers

A fetch hands over the whole composed body — thousands of characters, whatever fraction of it a step reads — so ask for what the step needs and reuse what a response already carried.

A second ask is cheap rather than free, and cheap is not a licence: how to avoid it is [resource-section-or-whole](#resource-section-or-whole), when a marker comes back instead of a body is [agent-id-scopes-delivery](#agent-id-scopes-delivery), and a marker inside one response is explained by that response's own notes, which govern. Read a marker as the expected answer rather than an error, and where content has genuinely left this context, [force-full-after-summarization](#force-full-after-summarization) is how to get it back.

### resource-section-or-whole

Choose bare vs `#section` `resource_id` by how much of the resource this agent context will need. Prefer a `#section` anchor when the current step needs a single slice of a large resource. When the same agent context will need two or more sections from the same resource in the current activity (or in the immediate next steps of that activity), call `get_resource` once with the bare resource id and reuse that content — do not issue repeated section fetches for the same file. Bare and `#section` ids are distinct delivery keys: loading sections does not populate the whole-resource key, and loading the whole file does not collapse a later section fetch under a different key. In the eager `resources` map the file takes precedence — a bundled whole resource carries its own sections, so a technique citing both ways receives the file alone and its sections are read out of that body rather than fetched again. Unchanged-references and `full: true` follow [force-full-after-summarization](#force-full-after-summarization).

### variable-mutation-source

Variables mutate from two sources only: checkpoint option effects (`setVariable`) and worker `activity_complete` results (`variables-changed`). Never mutate state through ad-hoc reasoning.

### agent-id-scopes-delivery

The delivery ledger is keyed on agent context, not on the session. `agent_id` on `get_activity`, `get_technique` and `get_resource` names that context — the worker agent identity bound into the stub that dispatches or continues the agent — and each context reads and writes its own ledger. A first dispatch under a new `agent_id` holds no prior deliveries, so it takes full delivery; the same `agent_id` calling again is that context resumed, and what it already received arrives as unchanged markers — on `get_activity` when the call carries `bundle: "reference"`, and on a repeat `get_technique` or `get_resource` whether or not it does ([fetch-costs-what-it-delivers](#fetch-costs-what-it-delivers)). A solo walk is the one case carrying no `agent_id`, the session's own agent being its only context — and the one case where nothing collapses on a repeat, since sibling contexts would share that identity.

### force-full-after-summarization

When this agent context no longer holds previously delivered content (e.g. after summarization), force full re-delivery with `get_activity { bundle: "full" }`, `get_technique { full: true }`, or `get_resource { full: true }`. Unchanged-references are valid only for content this same agent already received.

### verify-dispatched-activity

Before executing any step, confirm the activity `id` returned by the `get_activity` call your current stub instructed — not an earlier response this context still holds — equals the `{activity_id}` that dispatch or continuation bound. A worker carrying a batch re-checks this on every activity of the run, against the id the continuation named rather than the id the run opened with. On mismatch, STOP — execute no steps — and report a pointer mismatch (expected vs returned), which is the whole of the remedy available from here. Do not proceed on the wrong activity.

### progressive-step-technique-load

A step's bound technique loads as that step is reached; the whole activity is never pre-fetched. `get_technique { session_index, step_id }` serves steps not already inlined, and where `get_activity` carries `step_techniques` or a sibling `resources` map, those response notes govern — begin-beat, reuse map, lazy remainder — rather than bundling policy re-derived in prose. An inlined step is read from the bundle; re-fetching it pays the round trip for content the response already delivered ([fetch-costs-what-it-delivers](#fetch-costs-what-it-delivers)).
