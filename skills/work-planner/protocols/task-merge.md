# Task Merge

What the task, epic, board and initiative records, or a hot-fix's issue, become after one confirmed task merge.

**Runs in:** the project checkout.

## Prerequisites

Read these files first.

- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Issue Delivery](issue-delivery.md)
- [Issue Closure](issue-closure.md)
- [Review Pull Request](review-pull-request.md)
- [Epic Integration](epic-integration.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Initiative Issue Body](../artifacts/initiative-issue-body.md)
- [Hot-fix](../artifacts/hotfix.md)

## Procedure

1. **Record a hot-fix.**
   For the merge of a [hot-fix](../artifacts/hotfix.md), recorded as its [Delivery Record](../artifacts/hotfix.md#delivery-record) states:
   - Follow [Issue Delivery](issue-delivery.md) for the hot-fix, with the merge result and the complete issue-link snapshot as its evidence.
   - Close the hot-fix issue through [Issue Closure](issue-closure.md) when eligible.
   - Run [Settle Hot-fix Board Status](../artifacts/hotfix.md#settle-hot-fix-board-status) with the supplied board and the hot-fix issue.
   - Return to the caller.
2. **Read and record.**
   Follow [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence).
   - Follow [Issue Delivery](issue-delivery.md) for the delivered unit.
   - Close an eligible task issue through [Issue Closure](issue-closure.md).
3. **Review.**
   Follow [Review Pull Request](review-pull-request.md) for the affected epic base, with the epic's issue, the project checkout, the fetched epic bases and the repository setting confirmed for the session.
4. **Complete when ready.**
   When every task and criterion is complete:
   - Follow [Epic Integration](epic-integration.md) with the epic identity and body, review identity, project checkout, current delivery records, complete issue-link snapshot, criterion verification evidence and supplied board identity. An unmet delivery or merge condition stays pending.
5. **Close the epic.**
   After every epic base has merged:
   - Refresh the evidence.
   - Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with the epic JSON, pull request records, complete issue-link snapshot, task issue records, project checkout, fetched epic bases, and output body file.
   - Follow [Issue Closure](issue-closure.md) when eligible.
   - Run [Record Initiative Delivery](../artifacts/initiative-issue-body.md#record-initiative-delivery) with the current initiative and every linked epic record. Initiative completion does not gate an epic merge. The epic entering review is the one board change a task merge makes, and the initiative is left to its own sync.
