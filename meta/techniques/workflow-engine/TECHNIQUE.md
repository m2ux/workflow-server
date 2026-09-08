---
metadata:
  version: 6.12.0
---

## Capability

Contract and rules for executing a workflow's structured flow — sessions, activities, agents, Progress, and checkpoints. Every rule here is one both an orchestrator and a worker can act on; the boundaries a single role carries belong to that role's own operation.

## Rules

### session-index-passes-on-each-call

EVERY authenticated tool call (anything other than `discover`, `list_workflows`, `start_session`, `health_check`) requires a `session_index` parameter — the 6-character base32 string returned by `start_session`. The index is stable across all calls within a session; there is no rotation discipline.

### validation-warnings

Check `_meta.validation` in each response. Warnings are advisory but should be addressed.

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

The delivery ledger is keyed on agent context, not on the session. `agent_id` on `get_activity`, `get_technique` and `get_resource` names that context — the worker agent identity bound into the stub that dispatches or continues the agent — and each context reads and writes its own ledger. A first dispatch under a new `agent_id` holds no prior deliveries, so it takes full delivery; the same `agent_id` calling again is that context resumed, and what it already received arrives as unchanged markers — on `get_activity` when the call carries `bundle: "reference"`, and on a repeat `get_technique` or `get_resource` whether or not it does ([fetch-costs-what-it-delivers](#fetch-costs-what-it-delivers)). The session's own identity is the exception, whether a call passes it or omits `agent_id` and falls back to it: several contexts can hold it at once, so under it a name is no evidence of one context and a repeat collapses only where the call declares reference delivery — which is what a solo walk, the one context that legitimately owns that identity, does.

### force-full-after-summarization

When this agent context no longer holds previously delivered content (e.g. after summarization), force full re-delivery with `get_activity { bundle: "full" }`, `get_technique { full: true }`, or `get_resource { full: true }`. Unchanged-references are valid only for content this same agent already received. Each escape is for a call its reader makes.
