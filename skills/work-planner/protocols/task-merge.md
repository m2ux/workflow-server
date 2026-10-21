# Task Merge

What the task, epic, board and initiative records become after one confirmed task merge.

## Prerequisites

Read these files first.

- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Board Delivery](../artifacts/board-delivery.md)
- [Issue Delivery](issue-delivery.md)
- [Issue Closure](issue-closure.md)
- [Review Pull Request](review-pull-request.md)
- [Epic Integration](epic-integration.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Initiative Issue Body](../artifacts/initiative-issue-body.md)

## Procedure

1. **Read and record.**
   Follow [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence).
   - Follow [Issue Delivery](issue-delivery.md) for the delivered unit.
   - Close an eligible task issue through [Issue Closure](issue-closure.md).
2. **Review.**
   Follow [Review Pull Request](review-pull-request.md) for the affected epic base, with the epic's issue and the repository setting confirmed for the session.
3. **Complete when ready.**
   When every task and criterion is complete:
   - Run [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) with the epic identity and the supplied board identity. The board shows the epic at In Review before the user is asked to mark its review ready.
   - Report an absent board item. Integration is not gated on the board.
   - Follow [Epic Integration](epic-integration.md) with the epic identity and body, review identity, project checkout, current delivery records, complete issue-link snapshot and criterion verification evidence. A draft or unmet merge condition stays pending.
4. **Close the epic.**
   After every epic base has merged:
   - Refresh the evidence.
   - Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with the epic JSON, the body file it was read from, pull request records, complete issue-link snapshot, task issue records, project checkout, and output body file.
   - Follow [Issue Closure](issue-closure.md) when eligible.
   - Run [Record Initiative Delivery](../artifacts/initiative-issue-body.md#record-initiative-delivery) with the current initiative and every linked epic record. Initiative completion does not gate an epic merge. The epic entering review is the one board change a task merge makes, and the initiative is left to its own sync.
