# Task Merge

What the task, epic, board and initiative records, or the issue of a kind recording its own merge, become after one confirmed task merge.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Kind Merge

- Apply [Record Merge](../artifacts/work-kind.md#record-merge "ƒ") for the issue the merge delivers, with the merge result and the complete issue-link snapshot.
- On the [Work Kind Result](../artifacts/work-kind.md#work-kind-result) `unsupplied`, continue at [Read and Record](#2-read-and-record).
- Follow [Issue Closure](issue-closure.md "ƒ") for that issue when eligible.
- Apply [Settle Board Status](../artifacts/work-kind.md#settle-board-status "ƒ") with the supplied board and the issue.
- Return to the caller.

### 2. Read and Record

- Apply [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence "ƒ") with the fetched initiative, epic and task issue JSON.
- Follow [Issue Delivery](issue-delivery.md "ƒ") for the delivered unit.
- Follow [Issue Closure](issue-closure.md "ƒ") for an eligible task issue.

### 3. Review

Follow [Review Pull Request](review-pull-request.md "ƒ") for the affected epic base, with the epic's issue, the project checkout, the fetched epic bases and the repository setting confirmed for the session.

### 4. Complete When Ready

- When every task and criterion is complete:
- Follow [Epic Integration](epic-integration.md "ƒ") with the epic identity and body, review identity, project checkout, current delivery records, complete issue-link snapshot, criterion verification evidence and supplied board identity. An unmet delivery or merge condition stays pending.

### 5. Close the Epic

- After every epic base has merged:
- Refresh the evidence.
- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") for the current epic in the project checkout with the fetched epic bases.
- Follow [Issue Closure](issue-closure.md "ƒ") when eligible.
- Run [Sync Initiative](../artifacts/initiative-issue-body.md#sync-initiative "ƒ") with the current initiative and every linked epic record. Initiative completion does not gate an epic merge. The epic entering review is the one board change a task merge makes, and the initiative is left to its own sync.
