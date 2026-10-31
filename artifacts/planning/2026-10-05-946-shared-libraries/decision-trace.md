# Criterion decision trace

Reconstructed on 2026-10-31 from the records below. This date is the reconstruction date, not a claim that a new decision was approved on an earlier date. A merged design record establishes a design basis; it does not establish that a later smoke-run requirement has passed.

| Criteria | Recorded decision and source |
| --- | --- |
| AC1, AC2, AC6 | [PR925](https://github.com/m2ux/workflow-server/pull/925), merged 2026-09-24: label replacement removes all other family members and rereads exactly the requested label; project-field writes resolve an option ID and reread the landed ID. Its scratch run uses project 8 and issue 924. The confirmation scope is the label-family and project-board operations. |
| AC3, AC4, AC7, AC8 | [PR892](https://github.com/m2ux/workflow-server/pull/892), merged 2026-09-22: resolve a commit, tag or remote branch, refuse an unresolved or dirty pin, report the actual resulting HEAD, and apply readiness over a checkout/revision roster. Refusal is a result, not an aborted roster. |
| AC5, AC9, AC10 | [PR893](https://github.com/m2ux/workflow-server/pull/893) establishes per-member probing; [PR904](https://github.com/m2ux/workflow-server/pull/904) makes symbol identity explicit; [PR906](https://github.com/m2ux/workflow-server/pull/906), merged 2026-09-23, settles reach from symbols, distinguishes graph, tree-search, none and unanswerable readings, and records each member's instrument. Registry dependency is a separate reading and cannot establish symbol reach. PR906 supersedes that part of PR893. |
| AC3, AC4, AC5, AC7, AC8, AC9, AC10: observing instrument | [Meeting 2026-09-27, 161725](../../meetings/2026-09-27-b8c47927.md): the explicit choice is to add Specimen Smoke Runs and the support-library guard task. Earlier merged library PRs therefore do not tick these later smoke-run requirements. |
| AC11, AC12 | [Support Libraries #882](https://github.com/m2ux/workflow-server/issues/882), Proposal: reviewed destinations, content-preserving relocations, rebound referring workflows and a check of each surviving outcome. Its directly-bound/same-outputs scope explains why the two audit worker operations with different outputs keep separate homes. The meeting's guard decision supplies the observing check. |
| AC13, AC14 | [Support Libraries #882](https://github.com/m2ux/workflow-server/issues/882), Proposal, Grain: iteration and human stops belong to routines/checkpoints; consulted content belongs in resources. The [survey planning record](../2026-10-07-882-i08-e03-w01-hoist-and-grain-survey/README.md) requires a reviewed destination and grain verdict before moves. This is the survey's contract, not proof its missing work-item artifact or completed survey exists. |

## Evidence and boundaries

The [repository review](../2026-10-31-project17-plan-review/decision-trace/README.md) preserves the initiative and merged PR snapshots. PR descriptions are recorded design evidence; they are not represented as verbatim user decisions. The meeting's explicit decision and its agent summaries have different evidential weight.

PR925's historical exclusion of GraphQL describes that PR's scope. The current Work Planner contract uses REST where supported and current GraphQL for capabilities REST cannot provide. Deprecated Projects classic is excluded. This reconstruction does not reinstate a historical API restriction.

The survey README links a `w01.md` that is absent. That is a delivery/planning artifact gap, not evidence that a completed survey was reviewed. All existing initiative ticks remain as recorded.
