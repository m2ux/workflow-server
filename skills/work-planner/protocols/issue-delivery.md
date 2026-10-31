# Issue Delivery

The task and epic bodies brought to what one pull request's delivery establishes.

## Prerequisites

Read these files first.

- [Task Body](../artifacts/task-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Epic](../artifacts/epic.md)
- [Acceptance Criteria](../artifacts/acceptance-criteria.md)
- [Issue](../artifacts/issue.md)

## Procedure

1. **Task issues.**
   Run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) for each criterion the delivered task covers, with its current body, delivery findings, delivery revisions, named instruments and the project checkout.
   - Pass the returned verified criterion ids to [Record Task Delivery](../artifacts/task-body.md#record-task-delivery).
   - Supply the issue JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids, and output body file.
2. **Epic rows.**
   Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with the epic JSON, pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, and output body file.
   - Retain the returned epic body for criterion recording and publication.
   - Interpret the returned [Delivery Findings](../artifacts/epic.md#delivery-findings).
   - Run [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body) for a confirmed unplaced task.
   - Repeat Record Epic Delivery with the refreshed epic JSON and the same pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, and output body file.
3. **Coverage agreement.**
   Report the coverage disagreements returned in [Delivery Findings](../artifacts/epic.md#delivery-findings), including each pull request and row.
   - Continue recording links, verified criteria and Done.
4. **Criteria and bodies.**
   Use the epic body returned by Record Epic Delivery.
   - When verified criterion ids remain unticked in that body, run [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with its updated JSON, pull request records, complete issue-link snapshot, those remaining ids and output body path.
     - Retain its returned epic body.
   - Publish the retained epic body and each task body returned by Record Task Delivery through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
   - Return the saved identities and findings to the caller.
