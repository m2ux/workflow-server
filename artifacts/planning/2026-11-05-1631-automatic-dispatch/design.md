# Automatic Dispatch Design

## Scope

The implementation targets `workspace` from `skill/1631-automatic-dispatch`. It changes the Work Planner coordinator, its dispatch decision helper and observing fixtures. Existing I17 E03 delivery remains separate; lane admission belongs to the delivery survey.

## Coordinator

One authorization names the board, allowed initiative, epic, unit or hot-fix selectors, and requested lane. It remains fixed across refill rounds. Each round refreshes delivery evidence, applies the live queue, surveys available units and observes actual sessions and free harness slots. The coordinator starts only admitted units within that authorization, counts one joined unit as one session and resumes or reports existing sessions.

A dispatch-batch helper consumes machine-readable available units exported by the existing survey. It selects only authorized, free units, preserves survey order and rejects a survey from another board or requested lane. It never derives dependency, priority or lane admission independently. Every start requires published planning-record evidence, a matching reservation read back from the tracker, a current free slot and an inventory showing no existing session for that unit.

After a unit returns, the coordinator records its delivery result, releases the finished session's slot, refreshes and refills. A unit waiting for human review or blocked on external input stays held and visible while independent work proceeds. A worker slot becomes free only when the harness confirms the worker has finished or is suspended. The coordinator waits on running work or a capacity event while automatic progress remains possible; it reports a stable blocker when no such work or event can advance the scope.

## Verification

| Test | Observation | Coverage |
| --- | --- | --- |
| T1 | One authorization with successive completion and capacity events refills a dependency chain without duplicate starts or oversubscription. | AC1 |
| T2 | Real delivery surveys retain held, blocked and joined rows; batch fixtures enforce scope, board and requested-lane provenance. | AC2 |
| T3 | Start validation refuses unpublished, unreserved, mismatched or unverified records and permits execution only after ordered evidence. | AC3 |
| T4 | Mixed running, held, blocked and required-review states permit independent starts and expose the remaining blockers. | AC4 |
| T5 | Complete Work Planner suite, shared checker suite, skill-file check and representative disclosure traces. | |

The fixtures observe the coordinator's supplied-evidence boundary; live GitHub worker execution is separate evidence. Lane parsing and lane admission remain the existing survey's responsibility.

## Checklist

- [x] Inspect the issue, existing planning evidence, repository and current branches.
- [ ] Implement and verify continuous coordination and its observing fixtures.
- [ ] Publish validation evidence, push the change and open its pull request.
