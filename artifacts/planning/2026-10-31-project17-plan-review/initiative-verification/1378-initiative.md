## Overview

This initiative pays down the cost the server itself carries: a continue path that mints a replacement worker the boundary reading never asked for, a step that can be gated two ways, a session store that opens a run in a folder named for nothing, and a session projection that fails its own result schema rather than answering. The engine advances a run, gates a step, names a session and answers a question one way each.

## Problem

- **Continue-batch mints a replacement.**
  [finalize-activity](https://github.com/m2ux/workflow-server/blob/6355c392/corpus/meta/techniques/workflow-engine/finalize-activity.md#L28-L30) copies `may_continue` from `get_activity` onto the envelope. [continue-batch](https://github.com/m2ux/workflow-server/blob/6355c392/corpus/meta/techniques/workflow-engine/continue-batch.md#L60) mints a worker when that envelope is missing.
- **A step can be gated two ways.**
  [`when`](https://github.com/m2ux/workflow-server/blob/ab680d9d/src/schema/activity.schema.ts#L59) gates a step. [`condition`](https://github.com/m2ux/workflow-server/blob/ab680d9d/src/schema/activity.schema.ts#L64) gates a step and, on a checkpoint, permits dismissal.
- **A session opens in a folder named before its work is known.**
  `start_session` names a folder as soon as it has a working directory, so nine of the last thirteen folders a session created are named for the workflow id: `2026-09-14-meta` through `2026-10-07-meta`, with collisions walking to `-2`.

- **A session projection answers an absent name with a protocol error.**
  `inspect_session` with `view: variables` and a name the bag does not hold returns a content item carrying no `text`, so the caller receives `MCP error -32602` describing a union mismatch rather than an answer about the variable it asked for.

## Proposal

- **Continue from the boundary reading.**
  The worker continues or respawns from the `next_activity` batch reading, and a continuation does not mint a replacement.
- **One step gate.**
  A structured step condition becomes the equivalent `when` expression, or it is removed where its test cannot be false. Dismissal leaves the response tool.
- **A folder is named for its work.**
  The planning folder a session opens in is named for the work that session holds, and no run waits on a promotion.
- **A question about a session gets an answer.**
  Every projection the session tool offers returns a result its caller can read, and a name the bag does not hold is reported as absent rather than as a fault.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/528) | Safe Ground | AC1, AC2 | | ✓ |
| [E01](https://github.com/m2ux/workflow-server/issues/710) | Worker Continuation | AC3, AC4, AC5 | | |
| [E02](https://github.com/m2ux/workflow-server/issues/750) | Inline Gates | AC6, AC7 | | |
| [E03](https://github.com/m2ux/workflow-server/issues/1199) | Session Naming | AC8, AC9 | | |
| [E04](https://github.com/m2ux/workflow-server/issues/1435) | Session Inspection | AC10 | | |

## Acceptance Criteria

- [x] **AC1.** A second dispatch into an occupied folder is refused and the session file is left untouched, as the server-owned session setup tests show.
- [x] **AC2.** Every delivery records the path that drove the session and emits one cost-summary line, as the delivery cost record shows.
- [ ] **AC3.** Continue-or-respawn follows the batch reading taken at the activity boundary, as a batched-dispatch walk shows when fetches after activity open exhaust the budget.
- [ ] **AC4.** A continuation mints no replacement worker, as a batch-loop walk of a missing envelope, a refusal, and a failed continue shows.
- [ ] **AC5.** A second advance onto the activity already current is refused and records no completion, as the server-owned advance tests show.
- [ ] **AC6.** No activity or routine step carries a structured condition, as the standard sweep shows.
- [ ] **AC7.** Every structured step gate holds as an inline gate, or is removed where a recorded measurement shows the test could not be false, as each converted gate's differential test shows.
- [ ] **AC8.** A planning folder the server creates is named for the work it holds, as the planning root shows.
- [ ] **AC9.** No session opens in a temporary folder awaiting promotion, as the session store shows.
- [ ] **AC10.** Every session projection returns a result its caller can read, for a name the bag holds and for one it does not, as a run over each `view` with present and absent arguments shows.

## Non-Goals

- Graph destinations that name several activities, which are a new capability.
- Deciding where fan-out is allowed.
- Changing the activity bound, its cap, its budget, or resume across a gate.
- Evaluating gates on the server, which stay agent-evaluated.
- Retiring the step kind discriminator.

## References

- **R1.** [Activity batching](https://github.com/m2ux/workflow-server/issues/692) — How a worker is continued.
- **R2.** [Concurrent execution](https://github.com/m2ux/workflow-server/issues/634) — The home for where fan-out is allowed.
- **R3.** [Replan record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-03-706-i04-replan/README.md) — The evidence, the trace, and the decisions behind the continuation and gate work.
- **R4.** [Split record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-706-i04-split/README.md) — The areas debt is carried by, and the decisions that drew the boundary.
