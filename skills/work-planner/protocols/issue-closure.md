# Issue Closure

Fresh closure evidence assembled across an issue and its linked pull requests, and the closure it permits.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Pull Request](../artifacts/pull-request.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Epic](../artifacts/epic.md)
- [Initiative](../artifacts/initiative.md)

## Procedure

### 1. Issue

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the issue selected by the delivery checks.
- Apply [Capture Issue Development](../artifacts/issue.md#capture-issue-development) for that issue.

### 2. Pull Requests

Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for every captured link, across repositories and all states.
- Use a fresh destination file so an earlier snapshot cannot supply membership.

### 3. Check Delivery Completion

- For a task or a hot-fix, retain the task delivery result its delivering pull request established.

#### Epic Completion

For an epic:
- Apply [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches) in the project checkout for the complete expected bases, at the revision [Branches](../artifacts/delivery-branches.md#branches) names for a read of one epic.
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for their merge evidence.
- Apply [Check Epic Completion](../artifacts/epic.md#check-epic-completion) with the current epic JSON, delivery records, complete issue-link snapshot, criterion verification evidence and those base records.

#### Initiative Completion

For an initiative:
- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for every linked epic.
- Apply [Check Initiative Completion](../artifacts/initiative.md#check-initiative-completion) with the current initiative JSON, all linked epic records, criterion verification evidence and captured Development-link and pull-request records.

#### Completion Result

Return any incomplete or failed result before closure.

### 4. Close

Apply [Close Tracker Issue](../artifacts/issue.md#close-tracker-issue) with the issue identity and the successful normal delivery result.

#### Missing Evidence

If the operation reports missing evidence:
- Refresh those inputs.
- Repeat the completion check before trying again.

#### Incorrect Link

If the operation returns an abandoned or incorrect link:
- Obtain the user's decision on removing it.
- On a decision to remove, Apply [Access Development Links](../artifacts/pull-request.md#access-development-links) with the link's pull request and issue identities, the removal request, that decision and the confirmed repository setting.
- Repeat from the issue step.

#### Closure Result

Report any unmerged link or unmet criterion.
