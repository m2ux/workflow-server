# F13 Review Notes

## Review at 5a9ccd2c1

Agent re-review of [#1705](https://github.com/m2ux/workflow-server/pull/1705) at 5a9ccd2c1 against `workspace`, after F12 changed beneath it. The reviewed change runs from the merge base 39bb3ee0a, F12's ready head, to the head. The [review record](agent-review.json)'s first entry holds the scope, criteria and validation.

- **Merge.** 5a9ccd2c1 brings in F12 at 39bb3ee0a. The test README conflict resolves to F12's rows, with Test Plan added to test_documents' subject and its count 28; test_documents.py keeps both TestPlanHome and ProposalsBoardHome under one module docstring.
- **Stack rules.** No file F13 changes links `SKILL.md`, links a kind artifact outside the plan hierarchy (Proposal, Proposal Body, Standalone Body, Hot-fix, Hot-fix Body), or links an anchor F12 removes. sync-mode's one Create Proposals Board link targets `proposals-board.md`.
- **Own change.** The Test Plan artifact, the `testplan` reader, the retired converter and their callers read as at 173a069da; no import is left unused, and no file names a removed operation, command, function or anchor.
- **Findings.** None.

## Review at 173a069da

Agent review of [#1705](https://github.com/m2ux/workflow-server/pull/1705) at 173a069da against `workspace`. The reviewed change runs from the merge base 19be51e10, F12's reviewed head, to the head. The [review record](agent-review.json) holds the scope, criteria and validation.

### Findings

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | `testplan.rows` read every pipe-led line in the section as one table, so a second table was read as rows, though [Plan Table](https://github.com/m2ux/workflow-server/blob/skill/test-plan-artifact/skills/work-planner/artifacts/test-plan.md#plan-table) makes such a section unreadable. | nonblocking | `rows` requires the table lines to be contiguous; `test_testplan.py` adds a second-table case to the unreadable sections. |
| 2 | Align's Coverage ran Check Test Plan, which reads one pull request record, with the collection Read Delivery Evidence provides. | nonblocking | Align saves each task pull request's record on its own as [Pull Request Record](https://github.com/m2ux/workflow-server/blob/skill/test-plan-artifact/skills/work-planner/artifacts/test-plan.md#pull-request-record), which now says it holds one pull request alone in its file. |
| 3 | The pull request body listed Task Merge among Test Plan's linking readers and placed F10 on `i17/e02/workspace`. | nonblocking | The body names Merge Task Pull Requests and F10 targeting `workspace`. |

Fix 1 is in [ba85ac622](https://github.com/m2ux/workflow-server/commit/ba85ac622fed7a0b7abd2bb13452eee28134dea6), and fix 2 in [173a069da](https://github.com/m2ux/workflow-server/commit/173a069daf22b1d16953814bf34840b585ff56c7).

### Checked and Clear

- **One home.** Plan Table, Plan Columns, Result Evidence and Passed Plan are defined only in Test Plan; no file in the repository names Repair Test Plan, Convert Test Plan, `align.py plan` or the removed `pull-request-body.md` anchors.
- **One reader.** `deliver.ready_merges`, `sync.passed_criteria` and `sync.plan_agreement` read through `testplan`; `format.cited` is the one Coverage-cell reader, and no import is left unused.
- **Passing rule.** `passed` and `claims` share `ticked`, a tick linked to web evidence, so a bare ✓ is incomplete, as agreed.
- **Merge.** F12 merged in as 8c1ae75d6 with one conflict, the test README counts, resolved to test_plan_mode 14 and test_documents 23.
