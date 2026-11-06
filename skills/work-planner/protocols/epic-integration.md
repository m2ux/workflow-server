# Epic Integration

One epic base merged into its long-lived branch, on current branch, epic and pull-request evidence.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Prepare the Evidence

- Before any preparation, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review "ƒ") for the supplied review identity and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review "ƒ") requesting In Progress with the epic, board identity, fresh pull request records, an empty review-record list and output paths. An absent board item is reported; it does not prevent validation.
- For any failed preparation or readiness gate before a classified merge outcome, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review "ƒ") and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review "ƒ") again with their preceding inputs before returning or retrying, including failures between ready and board writes. The confirmed absence of a board is the sole exception to board withdrawal.
- Apply [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close "ƒ") for the repository, which gates the merge this protocol makes.
- Follow [Review Pull Request](review-pull-request.md "ƒ") with the actual task merges, the epic's issue, the project checkout, the fetched epic bases and that confirmed setting.
- Follow [Change Overview](change-overview.md "ƒ") with the review pull request identity.
- Resume with its published overview so the complete review body cites the task merges and carries that overview.
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for the pull request.
- Confirm its head is the epic base and its target is the corresponding long-lived branch.

### 2. Refresh and Validate

- Apply [Update Epic Base](../artifacts/delivery-branches.md#update-epic-base "ƒ") with the project checkout and the epic base.
- Obtain current criterion verification for the updated result.
- Refresh the delivery records.
- Apply [Check Epic Readiness](../artifacts/epic.md#check-epic-readiness "ƒ") with the current epic, delivery records, complete issue-link snapshot and that verification evidence.

#### Changed Branch Content

- When the branch content changes, before checking merge readiness:
- Follow [Review Pull Request](review-pull-request.md "ƒ") again with the current task merges.
- Follow [Change Overview](change-overview.md "ƒ") again with the same pull request identity and updated head.

#### Current Review Handoff

- Follow [Review Pull Request](review-pull-request.md "ƒ") requesting handoff, with confirmed epic readiness, fresh metadata, checkout, criteria, validation evidence and planning destination. Resume only with current agent review evidence. If review fixes changed the head, refresh criterion verification, Apply [Check Epic Readiness](../artifacts/epic.md#check-epic-readiness "ƒ") again for that head and Follow [Change Overview](change-overview.md "ƒ") again for the updated integration diff.
- Use the confirmed epic readiness, review identity and published agent review records.

- Require [Epic Readiness](../artifacts/pull-request.md#epic-readiness) and Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for [Identity](../artifacts/pull-request.md#identity).

- Run [Validate Agent Review](../artifacts/agent-review.md#validate-agent-review "ƒ") with the fresh metadata and [Published Reviews](../artifacts/pull-request.md#published-reviews). On a finding, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review "ƒ") and stop. For a draft with passing evidence, Run [Mark Review Ready](../artifacts/pull-request.md#mark-review-ready "ƒ") with its node id.

- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") again with the same identity, then Run [Validate Agent Review](../artifacts/agent-review.md#validate-agent-review "ƒ") again with that fresh metadata and the same published records. For a changed revision, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review "ƒ") and report the discrepancy. Retain [Review State](../artifacts/pull-request.md#review-state) only with current evidence, or [Failure](../artifacts/pull-request.md#failure) for the changed revision or discrepancy. Target review requirements still govern the merge.

- On a readiness failure, stop this handoff before requesting In Review.
- Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review "ƒ") requesting In Review, with the epic, board identity, fresh pull request records and published agent review records. Report an absent board item; integration is not gated on board membership.
- Apply [Fetch Merge Readiness](../artifacts/pull-request.md#fetch-merge-readiness "ƒ") for the exact current head and target. A conflict, failed or pending check, unmet epic condition or incomplete evidence blocks handoff; Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review "ƒ") again and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review "ƒ") requesting In Progress before returning that blocker. Pending required human approval is provided to the next step as a human handoff, with merge blocked.

### 3. Merge or Hand Off

- Refresh the review metadata and Run [Validate Agent Review](../artifacts/agent-review.md#validate-agent-review "ƒ") with the published records; any failure returns to refresh and validate, withdrawing ready and In Review before resolving the finding.
- Apply [Merge Delivery Pull Request](../artifacts/pull-request.md#merge-delivery-pull-request "ƒ") with confirmed epic readiness, verified head, target requirements, repository prerequisite, passing evidence and delivery kind epic, without further confirmation.
- Select the continuation from its [Merge Result](../artifacts/pull-request.md#merge-result); an unclassified [Failure](../artifacts/pull-request.md#failure) withdraws readiness through the preparation failure route and returns its evidence without a merge-success readback.

#### Human Handoff

For `human-handoff`, provide the result to the reviewer and return. Make no further merge attempt or merged-success readback.

#### Harness Denial

For `harness-denial`, provide the observed refusal and current verified readiness and return. Follow the owning [Merge Permission](../artifacts/pull-request.md#merge-permission) boundary; make no same-run retry, approval request or merged-success readback.

#### GitHub Refusal

- For each `github-refusal`, Apply [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review "ƒ") and Apply [Record Epic Review](../artifacts/board-delivery.md#record-epic-review "ƒ") requesting In Progress with fresh pull request records and an empty review-record list, except when board absence is confirmed.
- After the first refusal, repeat Refresh and Validate with fresh branch, criterion, head, target, review and check evidence before one further merge attempt.
- If refreshed evidence fails, return that blocker without another attempt.
- If GitHub refuses that second attempt, provide the refusal and return without a further retry or merged-success readback; the pull request stays open.
- A retry result of `human-handoff`, `harness-denial` or unclassified failure takes its corresponding terminal route. Only `confirmed-merge` continues to confirm the result.

#### Confirmed Merge

For `confirmed-merge`, continue to confirm the result with that result's head, target and merge commit.

### 4. Confirm the Result

- Only after `confirmed-merge`, Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for the same pull request.
- Confirm merged state and compare its head, target and merge commit with the provided result.
- Provide the confirmed result, or the explicit discrepancy as a blocker without a merged-success assertion.
