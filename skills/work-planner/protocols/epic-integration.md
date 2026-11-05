# Epic Integration

One epic base merged into its long-lived branch, on current branch, epic and pull-request evidence.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Review Pull Request](review-pull-request.md)
- [Change Overview](change-overview.md)
- [Pull Request](../artifacts/pull-request.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Epic](../artifacts/epic.md)
- [Board Delivery](../artifacts/board-delivery.md)
- [Agent Review](../artifacts/agent-review.md)

## Procedure

### 1. Prepare the Evidence

- Before any preparation, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review) for the supplied review identity and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) requesting In Progress with the epic, board identity, fresh pull request records, an empty review-record list and output paths. An absent board item is reported; it does not prevent validation.
- For any failed gate or called operation through handoff, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review) and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) again with their preceding inputs before returning or retrying, including failures between ready and board writes. The confirmed absence of a board is the sole exception to board withdrawal.
- Apply [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close) for the repository, which gates the merge this protocol makes.
- Follow [Review Pull Request](review-pull-request.md) with the actual task merges, the epic's issue, the project checkout, the fetched epic bases and that confirmed setting.
- Follow [Change Overview](change-overview.md) with the review pull request identity.
- Resume with its published overview so the complete review body cites the task merges and carries that overview.
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for the pull request.
- Confirm its head is the epic base and its target is the corresponding long-lived branch.

### 2. Refresh and Validate

Apply [Update Epic Base](../artifacts/delivery-branches.md#update-epic-base) with the project checkout and the epic base.
- Obtain current criterion verification for the updated result.
- Refresh the delivery records.
- Apply [Check Epic Readiness](../artifacts/epic.md#check-epic-readiness) with the current epic, delivery records, complete issue-link snapshot and that verification evidence.

#### Changed Branch Content

When the branch content changes, before checking merge readiness:
- Follow [Review Pull Request](review-pull-request.md) again with the current task merges.
- Follow [Change Overview](change-overview.md) again with the same pull request identity and updated head.

#### Current Review Handoff

- Follow [Review Pull Request](review-pull-request.md) requesting handoff, with confirmed epic readiness, fresh metadata, checkout, criteria, validation evidence and planning destination. Resume only with current agent review evidence. If review fixes changed the head, refresh criterion verification, Apply [Check Epic Readiness](../artifacts/epic.md#check-epic-readiness) again for that head and Follow [Change Overview](change-overview.md) again for the updated integration diff.
- Apply [Ready Epic Review](../artifacts/pull-request.md#ready-epic-review) with the confirmed epic readiness, review identity and published agent review records.
- Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) requesting In Review, with the epic, board identity, fresh pull request records and published agent review records. Report an absent board item; integration is not gated on board membership.
- Apply [Fetch Merge Readiness](../artifacts/pull-request.md#fetch-merge-readiness) for the exact current head and target. A conflict, failed or pending check, unmet epic condition or incomplete evidence blocks handoff; Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review) again and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) requesting In Progress before returning that blocker. Pending required human approval is returned to the next step as a human handoff, with merge blocked.

### 3. Merge or Hand Off

Refresh the review metadata and Apply [Check Agent Review](../artifacts/agent-review.md#check-agent-review) with the published records; any failure returns to refresh and validate, withdrawing ready and In Review before resolving the finding. Apply [Merge Delivery Pull Request](../artifacts/pull-request.md#merge-delivery-pull-request) with the confirmed epic readiness, verified head, target requirements, repository prerequisite and passing evidence, and delivery kind epic, without asking for further confirmation.
- Return its handoff when a human reviewer must merge. A changed head requires fresh verification; a merge refusal returns to the readiness checks, and a repeated refusal is reported without retrying.

### 4. Confirm the Result

Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) to confirm the merged state, verified head, target and merge commit.
- Return the result or blocker. Draft and blocked pull requests remain open.
