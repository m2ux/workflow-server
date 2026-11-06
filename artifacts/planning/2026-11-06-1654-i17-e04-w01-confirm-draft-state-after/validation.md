# Hot-Fix Draft Recovery Validation

## Revision

- Task head: `814eab99c949cc81b8c87c0a901e262c348e78b0`.
- Branch: `i17/e04/w01-confirm-draft-state-after`.
- Base: `i17/e04/workspace` at `9a924cfdda903ca64257449d8b5bf2ff762725ce`.
- Scope: I17 E04 W01, covering AC1, AC2 and AC3.
- Local validation ran in the isolated task worktree. The coordinator verifies the final merged revision separately.

## Ordered Recovery Fixtures

Command: `python3 -m unittest discover -s skills/work-planner/test -p test_hotfix_readiness.py -v` under the workspace sandbox.

Result: **12 tests passed**. [Complete output](e04-w01-focused.log).

| Coverage | Observed scenarios |
| --- | --- |
| AC1 | Invalid initial ready review; invalid initial draft review; changed head after ready; new review finding after ready; partially applied ready write with failed response. Ready failures select restoration from fresh metadata and confirm the draft before repair. |
| AC2 | Refused draft restoration, ready readback after successful restoration, unreadable restoration readback, unreadable or closed initial metadata. Terminal discrepancies reach neither repair nor merge. |
| AC3 | Passing draft and passing ready input each reach the normal merge call once after current review validation and ready-state readback. |

The bounded reader executes selected operation links and branch clauses from the installed Deliver Mode against captured REST-shaped tracker inputs. Agent review uses the installed `agent_review.check` function. A mutated-source control removes the draft-restoration call and observes the changed blocked result; the route cannot obtain its expected repair sequence from a hard-coded expected trace alone. These are offline route fixtures, distinct from the independent fresh-context readings below. No test writes a live tracker or performs a real merge.

## Regression Checks

| Check | Result | Output |
| --- | --- | --- |
| Full Work Planner suite | 971 tests, OK; one opt-in live check skipped | [Planner output](e04-w01-planner.log) |
| Shared skill-checker suite | 280 tests, OK | [Shared output](e04-w01-shared.log) |
| Installed skill model and contracts | 59 files checked, zero findings | [Checker output](e04-w01-skill-check.log) |
| Catalogue reconciliation | 13 tests, OK | [Catalogue output](e04-w01-catalogue.log) |
| Whitespace | `git diff --cached --check` passed before commit | Local command result |

The full planner suite includes the installed document interfaces, checkout contracts, command contracts and catalogue checks. The catalogue records a module's document coverage even when that module also imports an executable script; this permits the recovery fixtures to declare both Deliver Mode and its real review validator as observed subjects. Its inherited command-contract module's artifact coverage is recorded under the same rule.

## Fresh-Context Reading

Readers A and B independently interpret seven captured scenarios at the pinned task heads. Both select restoration/readback, terminal refusal/handoff, bounded retry and success-only confirmation as the source requires; see [reader A](recovery-reader-a.md) and [reader B](recovery-reader-b.md). These are fresh-agent source-reading trials, distinct from offline fixture execution and live tracker operations. Both recover truncated reads and report broad-context overhead. That pre-existing disclosure limitation remains in [Skill Separation](https://github.com/m2ux/workflow-server/issues/1615); no citation-efficacy, context-saving or complete disclosure-conformance claim is made.

## Review

Read the complete task diff, the surrounding hot-fix review and merge steps, the Pull Request state/draft command contracts, and Agent Review's current-evidence validator. The readiness failure routes retain the hold and findings; restoration uses fresh metadata, selects the owning draft command and reads its result. Failed or disagreeing restoration remains an explicit discrepancy. Only the successful ready/current-review route advances to merge.

Source search found no surviving claim in the changed recovery route that a requested restoration alone establishes draft state. E02 owns current prerequisite-boundary verification; a historical cycle does not establish a current defect. The Pull Request draft-command preamble's integration-only wording was reported to the parallel W02 owner for its shared-command contract revision.

## Plan Changes

Applied: none. Held: none. Catalogue support accompanies the observing fixtures within this unit's test scope.
