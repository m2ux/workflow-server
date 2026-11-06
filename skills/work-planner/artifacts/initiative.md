# Initiative

An initiative's epic delivery, criterion verification and completion state.

## Fields

### Identity

An initiative is identified by its repository and issue number. It groups and tracks its epics, with no branch or delivery pull request of its own.

### Delivery State

The state records every linked epic's completion, each initiative criterion's verification and tick, and the complete Development-linked pull request set and merge states. Each finding retains its source identity and evidence revision.

An epic is delivered when its issue is closed as completed. An open or cancelled epic remains undelivered, including when all initiative criteria are ticked. An epic the run was not given is unchecked: its row's Done cell stands, the sync reports the row unchanged, and completion stays unconfirmed. Criterion readiness and premature ticks are [Delivery Findings](#delivery-findings); delivery alone does not verify a criterion.

Initiative completion requires every linked epic to be closed as completed, every criterion verified and ticked, and every Development-linked pull request merged. Incomplete evidence leaves completion unconfirmed. The result names each missing condition.

### Delivery Findings

| Finding | Condition in the Supplied Initiative and Epic Records |
| --- | --- |
| Ready to verify | The initiative criterion is unticked and every epic whose Coverage cites it is delivered. |
| Ticked early | The initiative criterion is ticked and an epic whose Coverage cites it is undelivered. |

Epic delivery must follow [Delivery State](#delivery-state). Each finding names the criterion and the supporting or missing epic evidence.

### Initiative Record

The supplied current initiative JSON.

### Epic Records

Every linked epic's current JSON.

### Verification Evidence

The supplied criterion verification evidence and its delivery revisions.

### Development Evidence

The current complete Development-link and linked pull-request records, including merge states.
