# Review

The goal, consistency and ordering passes over the material written for the split, and where each finding is resolved.

## Findings

| Finding | Resolution |
| --- | --- |
| I13 AC9 named the operation-contract check; the class is held by `check-tool-call-shape` | Criterion names the tool-call-shape check |
| I13 AC10 reached every catalogue entry and every derivation, wider than E04 delivers | Narrowed to an input whose description must satisfy both the catalogue and the derivation |
| I14 AC14 said "every required check" while E07 delivers two workflows | Reworded to each check a pull request requires |
| I14 AC15 joined two conditions: reporting unmeasured, and naming the reason | Split, with the reason as AC17, and E07 Coverage carries both |
| I14 AC16 covered recurrence only; E04 W05 and W06 are a check reading half its class | Widened to a class measured across the whole of what its entry states |
| I15 and I14 each carried Problem bullets with no count or code link | Each bullet carries the measurement or the link behind it |
| I14:E04 W09 and I14:E07 W04 named a dependency another already implied | Trimmed to the rows that bind them |
| I13:E00 W04 and W05 could share a pull request and did not name each other | Joined |

The I14 non-goal bounding what a guard grades was checked against E04 W05, W06 and E08 W01 and does not conflict with them: those rows extend a guard to the whole of what its own entry names.

## Re-measurement of the red trunk

#1277 was raised on 2026-10-09 stating that both workflows fail on every branch. Measured again on 2026-10-13:

- The engine registers `planning_slug` on `start_session`, and `corpus/meta/resources/bootstrap-protocol.md` passes it, so the undeclared-argument finding is closed.
- `metadata_status` appears nowhere on `workflows`.
- `main` concluded success on Verify, the full coverage walk and the Docker build at 05:04. The remaining failures are on feature branches and belong to the work on them.

What survives is the gating, and the decision taken is that the definitions-call-the-tools step reports its own verdict and the suite and the delivery-cost gate run whatever it concludes. The task is rewritten to that, I14:E07 carries it as AC5, and the initiative carries it as AC18.

## Board

Three initiatives hold open review pull requests against their epics, so each is In Progress while that work is live, and the priority order takes effect as it drains. I14:E02 returns to In Progress with the initiative, its criteria being unticked and its rows undelivered.

Forty-three closed pull requests naming an epic were retitled to the epic's new id, since an epic's pull requests are found by that prefix. Two closed integration pull requests, 1225 and 1226, name the retired initiative and target branches that no longer exist; they keep their titles as the record of what was open against them.

## Verification of the criteria sync reported ready

Twelve criteria across five epics had merged delivery and no tick. Each was read against the instrument it names, on the branch that carries the work. None holds.

| Criterion | Verdict | What the instrument says |
| --- | --- | --- |
| I15:E01 AC1, AC2, AC4 | does not hold | `tests/batch-loop-gates.test.ts` fails on `i15/e01/main`, one file of 144, including the case that decides nothing from a continue field on the envelope |
| I14:E04 AC1, AC2, AC4 | does not hold | `check-role-barred-calls.ts` imports three names `src/loaders/core-ops.ts` does not export, so the guard cannot load and the tools typecheck fails |
| I14:E02 AC3 | does not hold | the run-record instruction pins identity from the reload and the container labels, both read before the walk |
| I13:E01 AC1, AC2, AC3 | unconfirmed | the guard sweep carrying the inherited-input guard fails on `i13/e01/workflows` |
| I15:E02 AC12 | unconfirmed | the test job fails on `i15/e02/main` and the sweep on `i15/e02/workflows` |
| I14:E04 AC3 | half | the sweep passes on `i14/e04/workflows`, so the corpus half holds; the historical fire rides the failing test job |

I15:E01's W02 and W03 lose their delivery marks, a row not being delivered while a criterion it covers is unticked.

I14:E04's W01 depends on I14:E07:W01: the guard whose registration AC1 asserts is the guard whose imports that task repairs.

## Carried, not resolved

- Twelve criteria on the closed epics I15:E00, I14:E00 and I14:E01 are covered by a merged pull request that names no test. The epics stay closed.
- The observing-test rows of I14:E03, I14:E04 and I13:E01 carry an empty Coverage cell, which the format check reports for a decision. The shape predates the split and is the same in all three.
- Four open questions wait for their epic to be readied: the gitnexus chain input, the group readings, the workflow a walk test moves to, and the source a newer `gh` comes from.
