# Issue Delivery

The task and epic bodies, or a hot-fix's body, brought to what one pull request's delivery establishes.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure "operation"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Prerequisites

Read these files first.

- [Task Body](../artifacts/task-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Epic](../artifacts/epic.md)
- [Acceptance Criteria](../artifacts/acceptance-criteria.md)
- [Issue](../artifacts/issue.md)
- [Hot-fix](../artifacts/hotfix.md)

## Procedure

### 1. Hot-Fix

- For a [hot-fix](../artifacts/hotfix.md), recorded as its [Delivery Record](../artifacts/hotfix.md#delivery-record) states:
- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "operation") for each criterion it carries, with its current body, the delivering pull request, its merged revision, named instruments and the project checkout.
- Apply [Record Hot-fix Delivery](../artifacts/hotfix.md#record-hot-fix-delivery "operation") with the provided verified criterion ids, the hot-fix JSON, pull request records, complete issue-link snapshot, delivering pull request number and output body file.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "operation") with the provided body.
- Provide the saved identity and findings to the caller.

### 2. Task Issues

- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "operation") for each criterion the delivered task covers, with its current body, delivery findings, delivery revisions, named instruments and the project checkout.
- Apply [Record Task Delivery](../artifacts/task-body.md#record-task-delivery "operation") with the provided verified criterion ids.
- Supply the issue JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids, and output body file.

### 3. Epic Rows

- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery "operation") with the epic JSON, pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, fetched epic bases, and output body file.
- Retain the provided epic body for criterion recording and publication.
- Interpret the provided [Delivery Findings](../artifacts/epic.md#delivery-findings).
- Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "operation") for a confirmed unplaced task.
- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery "operation") again with the refreshed epic JSON and the same pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, fetched epic bases, and output body file.

### 4. Coverage Agreement

- Report the coverage disagreements provided in [Delivery Findings](../artifacts/epic.md#delivery-findings).
- Continue recording links, verified criteria and Done.

### 5. Criteria and Bodies

- Use the epic body provided by Record Epic Delivery.

#### Remaining Criteria

- When verified criterion ids remain unticked in that body:
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria "operation") with its updated JSON, pull request records, complete issue-link snapshot, those remaining ids and output body path.
- Retain the body provided by that Tick Verified Criteria call.

#### Body Publication

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "operation") with the retained epic body and each task body provided by Record Task Delivery.
- Provide the saved identities and findings to the caller.
