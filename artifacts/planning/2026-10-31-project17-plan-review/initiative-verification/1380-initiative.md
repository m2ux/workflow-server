## Overview

This initiative pays down the cost the instruments carry: the guards, the tests, the walks and the checks that gate a merge. A check reports a finding only where the defect is, a walk reads every step the definitions hold and is served the tree its session bound, and a red check stops the merge it fails.

## Problem

- **The walks do not lock the records.**
  The artifact contract is the union of technique `#### artifact` declarations, [deduped by filename](https://github.com/m2ux/workflow-server/blob/ab680d9d/src/tools/workflow-tools.ts#L336-L339). The [review-mode snapshot](https://github.com/m2ux/workflow-server/blob/ab680d9d/tests/e2e/snapshot.test.ts#L139) asserts that create-mode checkpoints stay unpresented.
- **Three reader-found classes have no sweep.**
  No guard flags an instruction a role cannot act on, or a fallback stated only in a description. [AP-156](https://github.com/m2ux/workflow-server/blob/6355c392/corpus/canon/resources/anti-patterns.md#L2289) is in the canon, and the [rule-hygiene audit](https://github.com/m2ux/workflow-server/blob/6355c392/corpus/workflow-design/techniques/audit-rule-hygiene.md#L33) does not name it.
- **The full coverage walk has two missing triggers.**
  [coverage.yml](https://github.com/m2ux/workflow-server/blob/6355c392/.github/workflows/coverage.yml#L13-L15) runs on pull request and manual dispatch. A pull request whose scope step reports nothing [skips the walk](https://github.com/m2ux/workflow-server/blob/6355c392/.github/workflows/coverage.yml#L128).
- **One sidecar bind serves every session.**
  The experiment instance is one name and one port, so a reload moves the bind for every session reaching it, and a walk served another unit's corpus returns plausible output.
- **A red check does not stop a merge.**
  The protection call for `main` and for `workflows` both answer `Branch not protected`, so a red merge needs no override and leaves no record. The [corpus job](https://github.com/m2ux/workflow-server/blob/38bc4aea/.github/workflows/verify-corpus.yml#L104-L108) names two server test files, and the suite holds further tests that read corpus files.
- **Each harness enforces its own command policy.**
  146 of the command grants live in [.claude/settings.template.json](https://github.com/m2ux/workflow-server/blob/7485622d0102c583f11575c9846b523e408a74ff/.claude/settings.template.json), and [deploy-workspace.sh](https://github.com/m2ux/workflow-server/blob/7485622d0102c583f11575c9846b523e408a74ff/scripts/deploy-workspace.sh) registers no hook, so no command check runs for a Codex session.

## Proposal

- **Walks lock both records.**
  The all-workflows walk fails a delivered contract that announces one findings file twice. The review-mode snapshot walk fails a recorded assumption outcome.
- **A check for each class a reader found.**
  An instruction a role cannot act on, a fallback stated only in a description, and a rule that carries more than one constraint each have a check, and none of those checks reports a finding against the corpus.
- **The full walk runs off the pull request.**
  A pull request whose diff cannot move option coverage does not walk. A push to the default branch runs the full walk.
- **A check measures its subject.**
  A guard reports a finding only where the corpus carries the defect, and a walk model reads every step the definitions hold.
- **A walk is served the tree its session bound.**
  A reload names the corpus it displaces, a walk record cites the bind that answered it, and a dispatched unit holds an instance of its own.
- **A red check blocks its merge.**
  Branch protection holds a failed required check, and every server test that reads the corpus runs in the corpus job.
- **One command policy.**
  Every harness the workspace deploys to enforces the same policy, whatever the session runs under.
- **Every check green on its own subject.**
  Each workflow concludes on what it was asked to grade, no test pins a corpus path the corpus does not resolve, and no check decides whether another one runs.
- **A guard that cannot reach its subject says so.**
  An instrument that inspected nothing reports that it could not measure, and the reason it records names the condition it met.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/711) | Coverage Walk | AC1, AC2 | | ✓ |
| [E01](https://github.com/m2ux/workflow-server/issues/1160) | Honest Checks | AC3, AC4 | | ✓ |
| [E02](https://github.com/m2ux/workflow-server/issues/1242) | Sidecar Contention | AC5, AC6 | | |
| [E03](https://github.com/m2ux/workflow-server/issues/707) | Wrong Records | AC7, AC8 | | |
| [E04](https://github.com/m2ux/workflow-server/issues/708) | Missing Checks | AC9, AC10, AC14, AC16 | | |
| [E05](https://github.com/m2ux/workflow-server/issues/1159) | Merge Gate | AC11, AC12 | | |
| [E06](https://github.com/m2ux/workflow-server/issues/1301) | Harness Parity | AC13 | | |
| [E07](https://github.com/m2ux/workflow-server/issues/1395) | Red Trunk | AC14, AC18 | | ✓ |
| [E08](https://github.com/m2ux/workflow-server/issues/1396) | Measured Reasons | AC15, AC17 | | |
| [E09](https://github.com/m2ux/workflow-server/issues/1417) | Green Integration | AC14 | | |
| [E10](https://github.com/m2ux/workflow-server/issues/1443) | Guard Reach | AC16 | | |

## Acceptance Criteria

- [x] **AC1.** A pull request whose diff cannot move option coverage runs no coverage walk, as the coverage workflow shows.
- [x] **AC2.** A push to the default branch runs the full coverage walk, as the coverage workflow's triggers show.
- [x] **AC3.** No check reports a finding the corpus does not carry, as the standard sweep and a verify run of the server suite report.
- [x] **AC4.** A walk model that omits a step the definitions carry fails, as the batch-loop walk tests show.
- [ ] **AC5.** Sessions dispatched at once each walk the corpus their own session bound, as a pair of concurrent walks shows.
- [ ] **AC6.** A walk record cites the corpus the serving instance reported on that walk, as that record against the instance's labels shows.
- [ ] **AC7.** Every findings file an audit produces is announced once on the delivered artifact contract, as the all-workflows walk shows.
- [ ] **AC8.** A review-mode run records no assumption answer, as the review-mode walk of the snapshot suite shows.
- [ ] **AC9.** An instruction a receiving role cannot act on, a fallback stated only in a description, and a rule carrying more than one constraint under one heading each have a check or catalogue entry that fires on its historical instance, as each check's guard test and a rule-hygiene audit at the unsplit rule show.
- [ ] **AC10.** No check or catalogue entry for those classes reports a finding against the current corpus, as the standard sweep and a rule-hygiene audit of the corpus report.
- [ ] **AC11.** A pull request whose required check concluded failure cannot merge without an override GitHub records, as the branch protection of `main` and `workflows` shows.
- [ ] **AC12.** Every server test that reads the corpus runs in the corpus job, as that job's test selection shows.
- [ ] **AC13.** Every harness the workspace deploys to enforces one command policy, as a session in each harness shows.
- [ ] **AC14.** Each check a pull request requires concludes success on the default branch and on each integration branch, as those checks' latest runs show.
- [ ] **AC15.** A guard that cannot reach the corpus it grades reports that it could not measure, as the sweep's report and exit show.
- [ ] **AC16.** A defect class a catalogue entry names is measured across the whole of what that entry states, or the entry records the part that is unmeasured, as the guard registry and the catalogue show.
- [ ] **AC17.** The reason a guard records for not measuring names the condition that guard met, as the sweep's report shows.
- [x] **AC18.** No check decides whether another check runs, as a pull request whose definition verification concluded failure still carrying its suite and cost-gate results shows.

## Non-Goals

- Deciding where fan-out is allowed.
- Changing what a guard grades, beyond the classes its own entry names.

## References

- **R1.** [Coverage walk](https://github.com/m2ux/workflow-server/issues/686) — When a review pays for a full-corpus walk.
- **R2.** [Replan record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-03-706-i04-replan/README.md) — The evidence, the trace, and the decisions behind the walk and guard work.
- **R3.** [Align and sync record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-08-board-11-align-sync/README.md) — What each instrument reported at the integration tips, and the findings that follow.
- **R4.** [Split record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-706-i04-split/README.md) — The areas debt is carried by, and the decisions that drew the boundary.
