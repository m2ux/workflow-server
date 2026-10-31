# Issue Closure

Fresh closure evidence assembled across an issue and its linked pull requests, and the closure it permits.

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Pull Request](../artifacts/pull-request.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Epic](../artifacts/epic.md)
- [Initiative](../artifacts/initiative.md)

## Procedure

1. **Issue.**
   - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the issue selected by the delivery checks.
   - Run [Capture Issue Development](../artifacts/issue.md#capture-issue-development) for that issue.
2. **Pull requests.**
   Run [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for every captured link, across repositories and all states.
   - Use a fresh destination file so an earlier snapshot cannot supply membership.
3. **Check delivery completion.**
   - For a task:
     - Retain the task delivery result its delivering pull request established.
   - For an epic:
     - Run [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches) for the complete expected bases.
     - Run [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for their merge evidence.
     - Run [Check Epic Completion](../artifacts/epic.md#check-epic-completion) with the current epic JSON, delivery records, complete issue-link snapshot, criterion verification evidence and those base records.
   - For an initiative:
     - Refresh every linked epic through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).
     - Run [Check Initiative Completion](../artifacts/initiative.md#check-initiative-completion) with the current initiative JSON, all linked epic records, criterion verification evidence and captured Development-link and pull-request records.
   - Return any incomplete or failed result before closure.
4. **Close.**
   Pass the successful normal delivery result, issue JSON, complete Development snapshot, confirmed repository setting and fresh pull request records to [Close Tracker Issue](../artifacts/issue.md#close-tracker-issue).
   - If the operation reports a changed link set or missing evidence:
     - Refresh those inputs.
     - Repeat the completion check before trying again.
   - Report any unmerged link or unmet criterion.
