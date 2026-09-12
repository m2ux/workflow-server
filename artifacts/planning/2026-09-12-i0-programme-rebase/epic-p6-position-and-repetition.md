## Summary

The session file records what has happened but not which step a run is on. When the server delivers an activity it marks every included step as started at the same instant, and the uniqueness key records nothing about order, so position cannot be derived from the history either. Nothing anywhere drives a declared loop: the end-to-end walker walks a loop body exactly once, on purpose, and the comment says iterating is the runner's job. History event types for a loop starting and a loop iterating exist and are never emitted.

This epic adds a durable cursor to the live session file — the current step, with a frame per enclosing loop carrying the iteration index and the bound item — and something that drives iteration against the loop's declared limit. An interrupted run continues at the next unexecuted unit. A report for a position already recorded is a no-op or a refusal. A session whose position record is missing is refused outright, with a documented way back.

It follows write authority, because a cursor that names a step whose outputs have not landed is a cursor that cannot decide the next gate. It precedes the runner package, because a program that walks the tree has to have somewhere to stand.

This epic covers one work item per gap.

## The three gaps

**Position is underivable.** The live session carries a frontier of activity instances, which is what graph-level fans need. It does not carry a step. The unused session-state schema still declares a current step and a stack of active loops; live sessions do not use those fields. Reviving them would put the cursor on a schema nothing persists.

**Nothing repeats a loop.** A workflow can declare that a body repeats over a collection, or until a condition holds. The walker reads `continueWhile` to decide whether a `while` loop enters at all, and then walks the body once. The iteration type, the collection, the item variable and the iteration limit are not carried out. Repetition is the one capability written from scratch.

**A missing position record would look like tampering.** The session schema quietly discards what it does not declare. A server build that does not know about the cursor would erase one and leave a valid signature behind, which later reports as a signature mismatch. Seven existing optional fields are already exposed to this. A missing position record on a running session has to be a hard refusal, not a guessed restart at the activity's first step.

## The work

**W1 — The live session carries a cursor, with a frame per enclosing loop.** The current step, the iteration index, the bound item, and the declared limit. Added to the live session file, not to the unused state schema. A fold or a reload reaches a place a run can be resumed from.

**W2 — Iteration is driven and bounded.** A `forEach` walks its collection; a `while` takes its test before a pass; a `doWhile` is owed one pass and then takes `continueWhile`. The declared limit is held. The existing history event types start being emitted.

**W3 — Resume, repeat, and a missing record.** An interrupted run continues at the next unexecuted unit. A report for a position already recorded is a no-op or a refusal. A running session whose position record is missing is refused, with a documented way back.

## Why now is cheap

Write authority has made the bag current at the step, so a cursor has something to stand on. The loop-shape work already split entry from continuation, so the driver is not also inventing where the test lives. The walker already names the one-pass bound as the runner's job.

## Acceptance criteria

- [ ] The live session file carries the current step and a frame per enclosing loop, and a reload reaches that place.
- [ ] A `forEach`, a `while` and a `doWhile` each run as their kind declares, against the declared limit, on at least one fixture walk each.
- [ ] An interrupted run continues at the next unexecuted unit; an already-answered decision is not re-reached.
- [ ] A second report for a recorded position is a no-op or a refusal, not a second execution.
- [ ] A running session whose position record is missing is refused, and the way back is documented.

## Non-goals

- **The runner package, prompt composition, or the three-shaped reply.** [#532](https://github.com/m2ux/workflow-server/issues/532).
- **The append-only event log.** The cursor lives in the snapshot until [#533](https://github.com/m2ux/workflow-server/issues/533) changes the snapshot's shape. This epic does not wait on that.
- **Graph-level fans.** Activity-instance frontiers already exist. This epic is the step inside one activity.
- **Reviving the unused state-schema fields.** The cursor is a live session field.

## Tracking

Each work item is delivered as its own pull request when picked up.

| | Work item | Agent time | Gate |
|---|---|---|---|
| [ ] | **W1** — the live session carries a cursor | 4–6 h | Write-authority W3 |
| [ ] | **W2** — iteration is driven and bounded | 6–10 h | W1 |
| [ ] | **W3** — resume, repeat, and a missing record | 3–5 h | W1 |
| | **Epic total** | **2–4 days** | |

Carries specification REQ-F003, REQ-F005, REQ-F006, REQ-F007, REQ-F055 and REQ-NF022.

## Investigation detail

The rebase that created this epic, and why the unused state-schema fields are a trap:
**[2026-09-12-i0-programme-rebase](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-12-i0-programme-rebase)**

The position investigation and the loop-continuation landing:
**[2026-08-28-runner-execution-protocol](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-28-runner-execution-protocol)**,
[#594](https://github.com/m2ux/workflow-server/issues/594)
