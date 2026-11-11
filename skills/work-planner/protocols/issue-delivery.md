# Issue Delivery

The task and epic bodies, or the body of an issue whose kind records its own delivery, brought to what one pull request's delivery establishes.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Kind Delivery

- Apply [Record Delivery](../artifacts/work-kind.md#record-delivery "ƒ") for the selected issue, its delivering pull request and the selected criterion ids in the project checkout.
- On the [Work Kind Result](../artifacts/work-kind.md#work-kind-result) `unsupplied`, continue at [Task Issues](#2-task-issues).
- Provide the saved identity and findings to the caller.
- Return to the caller.

### 2. Task Issues

- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "ƒ") for the selected criterion ids against current delivery evidence in the project checkout.
- Run [Sync Task Issue](../artifacts/task-body.md#sync-task-issue "ƒ") with the provided verified criterion ids.
- Supply the issue JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids, and output body file.

### 3. Epic Rows

- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") for the current epic in the project checkout with the fetched epic bases, retaining the confirmed task-to-pull-request matches.
- Retain the provided epic body for criterion recording and publication.
- Interpret the provided [Delivery Findings](../artifacts/epic.md#delivery-findings).
- Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "ƒ") for a confirmed unplaced task.
- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") again for the refreshed epic evidence in the project checkout with the fetched epic bases, retaining the confirmed task-to-pull-request matches.

### 4. Coverage Agreement

- Report the coverage disagreements provided in [Delivery Findings](../artifacts/epic.md#delivery-findings).
- Continue recording links, verified criteria and Done.

### 5. Criteria and Bodies

- Use the epic body provided by Sync Epic.

#### Remaining Criteria

- When verified criterion ids remain unticked in that body:
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria "ƒ") for the provided verified criterion ids.
- Retain the body provided by that Tick Verified Criteria call.

#### Body Publication

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the retained epic body and each [task body](../artifacts/task-body.md#output-body) provided in [Task Issues](#2-task-issues).
- Provide the saved identities and findings to the caller.
