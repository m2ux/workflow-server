# F16 Review Notes

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
