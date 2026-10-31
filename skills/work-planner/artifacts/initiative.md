# Initiative

An initiative's epic delivery, criterion verification and completion state.

## Operations

### *Check* Initiative Completion

The initiative's normal delivery result before tracker closure.

**Inputs:** Current initiative JSON, every linked epic's current JSON, criterion verification evidence and the current complete Development-link and linked pull-request records.

1. Evaluate the supplied evidence against [Delivery State](#delivery-state).
2. Identify each missing, open or cancelled epic, each unverified or unticked criterion, and each unmerged or unreadable Development-linked pull request. Incomplete link evidence leaves completion unconfirmed.
3. Return the completion result and its supporting issue identities, evidence revisions and blockers. Passing normal delivery checks supplies the caller's closure evidence; the tracker issue's current Development-link gate still governs the write.

## Fields

### Identity

An initiative is identified by its repository and issue number. It groups and tracks its epics, with no branch or delivery pull request of its own.

### Delivery State

The state records every linked epic's completion, each initiative criterion's verification and tick, and the complete Development-linked pull request set and merge states. Each finding retains its source identity and evidence revision.

An epic is delivered when its issue is closed as completed. A missing, open or cancelled epic remains undelivered, including when all initiative criteria are ticked. Criterion readiness and premature ticks are [Delivery Findings](#delivery-findings); delivery alone does not verify a criterion.

Initiative completion requires every linked epic to be closed as completed, every criterion verified and ticked, and every Development-linked pull request merged. Incomplete evidence leaves completion unconfirmed. The result names each missing condition.

### Delivery Findings

| Finding | Condition in the Supplied Initiative and Epic Records |
| --- | --- |
| Ready to verify | The initiative criterion is unticked and every epic whose Coverage cites it is delivered. |
| Ticked early | The initiative criterion is ticked and an epic whose Coverage cites it is undelivered. |

Epic delivery follows [Delivery State](#delivery-state). Each finding names the criterion and the supporting or missing epic evidence.
