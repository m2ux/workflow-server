---
metadata:
  version: 6.12.0
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

The delivery ledger is keyed on agent context, not on the session. `agent_id` on `get_activity`, `get_technique` and `get_resource` names that context — the worker agent identity bound into the stub that dispatches or continues the agent — and each context reads and writes its own ledger. A first dispatch under a new `agent_id` holds no prior deliveries, so it takes full delivery; the same `agent_id` calling again is that context resumed, and what it already received arrives as unchanged markers — on `get_activity` when the call carries `bundle: "reference"`, and on a repeat `get_technique` or `get_resource` whether or not it does ([fetch-costs-what-it-delivers](#fetch-costs-what-it-delivers)). The session's own identity is the exception, whether a call passes it or omits `agent_id` and falls back to it: several contexts can hold it at once, so under it a name is no evidence of one context and a repeat collapses only where the call declares reference delivery — which is what a solo walk, the one context that legitimately owns that identity, does.

### force-full-after-summarization

When this agent context no longer holds previously delivered content (e.g. after summarization), force full re-delivery with `get_activity { bundle: "full" }`, `get_technique { full: true }`, or `get_resource { full: true }`. Unchanged-references are valid only for content this same agent already received.

### verify-dispatched-activity

Before executing any step, confirm the activity `id` returned by the `get_activity` call your current stub instructed — not an earlier response this context still holds — equals the `{activity_id}` that dispatch or continuation bound. A worker carrying a batch re-checks this on every activity of the run, against the id the continuation named rather than the id the run opened with. On mismatch, STOP — execute no steps — and report a pointer mismatch (expected vs returned), which is the whole of the remedy available from here. Do not proceed on the wrong activity.

### run-status-shape

A status emission during a run carries exactly three things, in this order:

1. A link to the artifact the completed activity produced.
2. One line summarising it.
3. The activity checklist, complete.

The checklist is a markdown task list. Each item's text is the row number and name from the planning README's Progress table — not an artifact filename, whose numeric prefixes repeat across rows and which several rows do not have — and that text **is** the hyperlink, targeting the artifact's remote URL on the session branch:

```markdown
- [x] [13 Assumptions review](https://github.com/owner/repo/blob/{branch}/{planning_path}/07-assumptions-log.md)
- [ ] [14 Implementation](…)
```

The list is complete on every emission: every activity, run and unrun alike. Never roll the unrun tail into one summarising item. Any other enumeration in the emission is a bullet list rather than a semicolon run-on.

Two boundaries decide what else may appear:

- **Workflow mechanics stay out.** Which activity is dispatched to whom, worker resumes and identities, how much room a batch has left, usage recording, commit bookkeeping. None of it is actionable, and the checklist already carries where the run stands.
- **What the user needs in order to decide stays in, at whatever length it takes.** A gate's substance, an option's trade-off, what a finding turns on. The distinction is the decision, not the length.

A multi-paragraph restatement of what an artifact already records is the failure this shape prevents: a paraphrase drifts from the artifact it paraphrases, and a reader has no way to tell which is authoritative.

### progressive-step-technique-load

A step's bound technique loads as that step is reached; the whole activity is never pre-fetched. `get_technique { session_index, step_id }` serves steps not already inlined, and where `get_activity` carries `step_techniques` or a sibling `resources` map, those response notes govern — begin-beat, reuse map, lazy remainder — rather than bundling policy re-derived in prose. An inlined step is read from the bundle; re-fetching it pays the round trip for content the response already delivered ([fetch-costs-what-it-delivers](#fetch-costs-what-it-delivers)).
