# F16 Review Notes

## Review at fb06a8d02

Agent review of [#1712](https://github.com/m2ux/workflow-server/pull/1712) at fb06a8d02 against `workspace` at 5721e4aad, after the user had the branch slimmed to four files: the rule in rules.md, deliver.py, test_deliver and the test README. The other pages are as `workspace` holds them; agents apply the rule from rules.md. A fresh independent reviewer read the slimmed diff; the [review record](agent-review.json)'s first entry holds the scope, criteria and validation.

- **Change since 0b0949a42.** The branch is rewritten as c69a51165 (rules.md) and fb06a8d02 (deliver.py and its tests). The procedure-page changes reviewed at 0b0949a42, and their findings, are gone with those pages.
- **Findings.** One blocking, fixed. Three nonblocking observations need no change: work items are now read for every planned row, which is the only way to tell an engineering-only row in an epic of one or no base; a deliver.py capture shows AC3's merge side, as review pull requests follow epic bases; a legacy `i../engineering` base already in flight is still counted by sync.py, outside this scope.

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | In an epic with no base, a unit changing `engineering` and another branch, or joining an unplanned row to an `engineering` row, printed only `push engineering` and lost its branch. | blocking | A unit drops its branch only when the push is all it changes; `test_a_unit_of_an_epic_with_no_base_keeps_its_branch_beside_the_push` covers it, in [fb06a8d02](https://github.com/m2ux/workflow-server/commit/fb06a8d0225dfe5489f57c865a30d290cc1a39c4). |

## Review at 0b0949a42

Agent review of [#1712](https://github.com/m2ux/workflow-server/pull/1712) at 0b0949a42 against `workspace` at 5721e4aad. An independent reviewer read the whole diff of df114cfd1 and 3ddedb1f1 with its callers; the session re-read the fix delta in full. The [review record](agent-review.json) holds the scope, criteria and validation.

- **deliver.py.** Correct for one, zero and several bases, unplanned rows joined to engineering rows, and a legacy engineering base or pull request.
- **Findings.** Eight, all fixed in [0b0949a42](https://github.com/m2ux/workflow-server/commit/0b0949a420c0cac8311b83fdc9b77c872c775056) except 7, which the pull request body states.

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | Sync Epic's `compose_id` exits on a row holding an engineering commit when `--link` adds a pull request. | blocking | Only a unit changing `engineering` alone links a commit; a unit that also opens a pull request is delivered by its pull requests and links none, so `compose_id` never meets the pair. |
| 2 | A commit linked beside an open pull request delivered a mixed row before its pull request merged. | blocking | Same fix: a commit is linked only where it is the unit's one delivery. |
| 3 | An epic changing `engineering` alone had no route past Epic Integration. | nonblocking | Task Merge's Complete When Ready continues to Close the Epic for an epic with no base. |
| 4 | Deliver pushed `engineering` files before the unit's tests ran. | nonblocking | Implement pushes them once the tests pass; Fix the Debt pushes a later fix the same way. |
| 5 | Deliver's no-pull-request exception sat mid-list. | nonblocking | Open the Pull Request and Merge each open with the gate for a unit with no task branch. |
| 6 | Delivery Brief and Unit Dispatch assumed a task branch. | nonblocking | Each states that a unit changing `engineering` alone has no task branch or unit checkout. |
| 7 | One- and zero-base epics now read work items and need `--engineering`. | nonblocking | Stated in the pull request body's deliver.py changes. |
| 8 | Task Merge step 3 stated a fact rather than a step. | nonblocking | A bullet continues a push to Complete When Ready. |
