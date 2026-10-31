# Epic Integration

One epic base merged into its long-lived branch, on current branch, epic and pull-request evidence.

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

1. **Prepare the evidence.**
   - Before any preparation, run [Hold Epic Review](../artifacts/pull-request.md#hold-epic-review) for the supplied review identity and [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) requesting In Progress with the epic, board identity, fresh pull request records, an empty review-record list and output paths. An absent board item is reported; it does not prevent validation.
   - For any failed gate or called operation through handoff, repeat those withdrawal operations before returning or retrying, including failures between ready and board writes. The confirmed absence of a board is the sole exception to board withdrawal.
   - Run [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close) for the repository, which gates the merge this protocol makes.
   - Follow [Review Pull Request](review-pull-request.md) with the actual task merges, the epic's issue and that confirmed setting.
   - Follow [Change Overview](change-overview.md) with the review pull request identity.
   - Resume with its published overview so the complete review body cites the task merges and carries that overview.
   - Read the pull request through [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state).
   - Confirm its head is the epic base and its target is the corresponding long-lived branch.
2. **Refresh and validate.**
   Run [Update Epic Base](../artifacts/delivery-branches.md#update-epic-base) with the project checkout and the epic base.
   - Obtain current criterion verification for the updated result.
   - Refresh the delivery records.
   - Call [Check Epic Readiness](../artifacts/epic.md#check-epic-readiness) with the current epic, delivery records, complete issue-link snapshot and that verification evidence.
   - When the branch content changes, before checking merge readiness:
     - Repeat Review Pull Request with the current task merges.
     - Repeat Change Overview with the same pull request identity and updated head.
   - Follow [Review Pull Request](review-pull-request.md) requesting handoff, with confirmed epic readiness, fresh metadata, checkout, criteria, validation evidence and planning destination. Resume only with current agent review evidence. If review fixes changed the head, refresh criterion verification, repeat Check Epic Readiness for that head and repeat Change Overview for the updated integration diff.
   - Run [Ready Epic Review](../artifacts/pull-request.md#ready-epic-review) with the confirmed epic readiness, review identity and published agent review records.
   - Run [Record Epic Review](../artifacts/board-delivery.md#record-epic-review) requesting In Review, with the epic, board identity, fresh pull request records and published agent review records. Report an absent board item; integration is not gated on board membership.
   - Follow [Fetch Merge Readiness](../artifacts/pull-request.md#fetch-merge-readiness) for the exact current head and target. A conflict, failed or pending check, unmet epic condition or incomplete evidence blocks handoff; run Hold Epic Review and Record Epic Review requesting In Progress before returning that blocker. Pending required human approval is returned to the next step as a human handoff, with merge blocked.
3. **Merge or hand off.**
   Refresh the review metadata and run [Check Agent Review](../artifacts/agent-review.md#check-agent-review) with the published records; any failure returns to refresh and validate, withdrawing ready and In Review before resolving the finding.
   Pass the confirmed epic readiness, verified head, target requirements, repository prerequisite and passing evidence to [Merge Delivery Pull Request](../artifacts/pull-request.md#merge-delivery-pull-request) with delivery kind epic, without asking for further confirmation.
   - Return its handoff when a human reviewer must merge. A changed head requires fresh verification; a merge refusal returns to the readiness checks, and a repeated refusal is reported without retrying.
4. **Confirm the result.**
   Run [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) to confirm the merged state, verified head, target and merge commit.
   - Return the result or blocker. Draft and blocked pull requests remain open.
