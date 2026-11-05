# Issue Delivery

The task and epic bodies, or a hot-fix's body, brought to what one pull request's delivery establishes.

**Runs in:** the project checkout.

## Prerequisites

Read these files first.

- [Task Body](../artifacts/task-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Epic](../artifacts/epic.md)
- [Acceptance Criteria](../artifacts/acceptance-criteria.md)
- [Issue](../artifacts/issue.md)
- [Hot-fix](../artifacts/hotfix.md)

## Procedure

1. **Hot-fix.**
   For a [hot-fix](../artifacts/hotfix.md), recorded as its [Delivery Record](../artifacts/hotfix.md#delivery-record) states:
   - Run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) for each criterion it carries, with its current body, the delivering pull request, its merged revision, named instruments and the project checkout.
   - Pass the returned verified criterion ids to [Record Hot-fix Delivery](../artifacts/hotfix.md#record-hot-fix-delivery), with the hot-fix JSON, pull request records, complete issue-link snapshot, delivering pull request number and output body file.
   - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
   - Return the saved identity and findings to the caller.
2. **Task issues.**
   Run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) for each criterion the delivered task covers, with its current body, delivery findings, delivery revisions, named instruments and the project checkout.
   - Pass the returned verified criterion ids to [Record Task Delivery](../artifacts/task-body.md#record-task-delivery).
   - Supply the issue JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids, and output body file.
3. **Epic rows.**
   Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with the epic JSON, pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, fetched epic bases, and output body file.
   - Retain the returned epic body for criterion recording and publication.
   - Interpret the returned [Delivery Findings](../artifacts/epic.md#delivery-findings).
   - Run [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body) for a confirmed unplaced task.
   - Repeat Record Epic Delivery with the refreshed epic JSON and the same pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, fetched epic bases, and output body file.
4. **Coverage agreement.**
   Report the coverage disagreements returned in [Delivery Findings](../artifacts/epic.md#delivery-findings).
   - Continue recording links, verified criteria and Done.
5. **Criteria and bodies.**
   Use the epic body returned by Record Epic Delivery.
   - When verified criterion ids remain unticked in that body, run [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with its updated JSON, pull request records, complete issue-link snapshot, those remaining ids and output body path.
     - Retain its returned epic body.
   - Publish the retained epic body and each task body returned by Record Task Delivery through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
   - Return the saved identities and findings to the caller.
