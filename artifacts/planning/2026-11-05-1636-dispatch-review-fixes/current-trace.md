# PR 1645 Bounded Continuation Readback

## Reviewed Snapshot

Read-only review of the working conflict reconciliation in `md-composer/.worktrees/workflow-server/skill/1636-dispatch-review-fixes`. Branch HEAD is `7d7247529525eda7f799eea4b2dec779fea36909`; the merged workspace input is `52fd426468cf3c860cf163f351e0f26c0568203c`. The merge is not yet committed. The source hashes below identify the reviewed terminal-correction contents independently of the pending merge commit.

| Source | SHA-256 |
| --- | --- |
| `modes/deliver-mode.md` | `13ddfc926db7c36eacbaf72f2a02c849411d3e5fe624c8e73510505a96370473` |
| `protocols/unit-dispatch.md` | `8125eb69dda8887d72f83b0a00bdda1ea884fa6dcb89275233be3e3863a13ebf` |
| `artifacts/delivery-branches.md` | `8e8f082506f909c4a3da5fe0e2f98dc483f2e3e6d899e65bd6f882d8604bfc76` |
| `artifacts/dispatch-batch.md` | `8dff31b9bb84ba7ec88241fde34b94875845653cced9dc0ba399774737d62b65` |
| `artifacts/delivery-plan.md` | `b5f28eb1a4df9fc1f74e40241a910305d8de93aabb4706e239bd993edf863109` |
| `artifacts/board-queue.md` | `f9574dc7756f7f0d7f1a4abec7117904636b984f6332510d222b2f0acfdbfc34` |

## 1. Run Blocker Before a Hold

Captured inputs: a selected three-unit batch, available capacity, and an unresolved run blocker whose observed reason is missing sub-agent dispatch capability.

Source-selected continuation:

1. `Dispatch Delivery Units / Check Current Blockers` reads the blocker collection.
2. Its line 148 selects immediate provision of the run blocker and stops the dispatch round before any unit starts.
3. Unit Dispatch, record publication, hold acquisition, checkout creation and worker start are not selected.
4. When missing capability is first discovered inside Unit Dispatch, its line 13 supplies the run blocker before a hold and stops that unit; the coordinator's Run Blocker branch records it and stops the round.
5. Refill lines 119 and 129 provide the run blocker and stop the refill round; they do not continue into a fresh start selection.

Machine observation: the actual `dispatch.batch` returns `{"action":"stop","units":[],"pending":0}` for these blockers, and `check_start` rejects a stale previously selected entry with `start has an unresolved dispatch blocker`.

## 2. Run Blocker Returned Mid-Round

Captured inputs: the first unit has an observed running session; a later Unit Dispatch returns a run blocker; one independent selected unit remains in the round.

Source-selected continuation:

1. The first Started Session result records its actual session identity and removes any corresponding retained preparation.
2. The later Run Blocker result at lines 165–167 records the blocker, provides it immediately, and stops the round before another unit starts.
3. It reaches neither the remaining unit's Unit Dispatch nor a speculative worker creation.
4. The existing running session remains observed; no invented completion or hold release occurs.

Machine observation: a refill with the recorded blocker returns `stop` even while the existing session is running; `check_start` rejects the remaining unit. This is a stop on new starts, not a claim that an already running worker was terminated.

## 3. Unit Blocker Followed by Independent Work

Captured inputs: W01 is blocked by a missing required criterion; W02 is independent, authorized and admitted; one worker slot is free.

Source-selected continuation:

1. A known unit blocker is excluded by Check Current Blockers line 149.
2. When first discovered during Unit Dispatch, its criterion gate line 20 stops that unit before record/hold/start continuation and returns the unit blocker.
3. The coordinator's Unit Blocker branch at lines 169–171 retains that blocker and continues with independent units.
4. W02 may proceed through its own current-evidence gates. Nothing in this trace establishes those later gates passed without their actual results.
5. The next survey retains W01's blocker until fresh evidence resolves its reason.

Machine observation: the actual batch selects W02 and excludes W01. Existing joined-row blocker tests also cover overlap with retained preparations; the blocker is not limited to an exact joined-unit string.

## 4. Capacity Wait and Retained Resume

Captured inputs: W01 already has a published record, confirmed live hold, prepared checkout/brief and original selected batch; capacity falls to zero before start. Later capacity returns, with the same selected unit/context and fresh hold evidence.

Source-selected continuation:

1. Check Dispatch Start refuses zero free slots. Unit Dispatch's capacity-only branch at line 98 provides the retained preparation, rather than creating a worker.
2. Dispatch Delivery Units' Capacity Wait branch at lines 161–163 retains that preparation for another refill round.
3. The retained path selects `Check Task Worktree` directly at Unit Dispatch line 82 for each recorded checkout, supplying the project repository, path, task branch and full preparation head.
4. A mismatch stops the unit while preserving checkout and hold; it selects neither Add Task Worktree nor worker creation. A verified retained checkout reaches brief preparation and the current start gate.
5. Current batch/session/blocker/capacity evidence must pass before starting. The Started Session branch then records the observed session and removes the retained preparation.
6. The new-unit alternative alone selects Fetch Remote Branch → Add Task Worktree → Read Checkout Revision, recording the full preparation head at creation. It is not selected for retained reuse.

Machine observations: zero capacity rejects start; retained preparation keeps the batch action at `wait`; returning capacity permits `check_start` to return the exact same unit. Once its session is observed running, the refill remains `wait` without a duplicate offered unit. The real-git retained-worktree fixtures separately verify repository registration, branch/full-SHA matching, detached/foreign/dirty rejection and preservation of checkout contents.

## Evidence and Limits

- `upstream-dispatch-observations.json` contains actual read-only calls to the current dispatch functions using the stated captured inputs; `upstream_dispatch_observations.py` is their reproduction helper.
- This receipt is a reader's source-selected continuation trace combined with actual pure-function observations. It is not a general prose executor, live tracker mutation, actual worker dispatch or fresh-context independent trial. The reviewer inherited earlier task context and discloses that limitation.
- Existing task-worktree tests provide real local git evidence; they do not themselves execute the complete Unit Dispatch prose route. The trace keeps those evidence types separate.
- No pause/cascade behavior, unrelated policy correction, source mutation, commit or tracker write is part of this review.
