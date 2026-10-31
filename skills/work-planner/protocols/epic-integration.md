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

## Procedure

1. **Prepare the evidence.**
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
   - Run [Ready Epic Review](../artifacts/pull-request.md#ready-epic-review) with the confirmed epic readiness and review identity.
   - Follow [Fetch Merge Readiness](../artifacts/pull-request.md#fetch-merge-readiness) for the exact current head and target. A conflict, failed or pending check, unmet epic condition or incomplete evidence leaves integration blocked.
3. **Merge or hand off.**
   Pass the confirmed epic readiness, verified head, target requirements, repository prerequisite and passing evidence to [Merge Delivery Pull Request](../artifacts/pull-request.md#merge-delivery-pull-request) with delivery kind epic, without asking for further confirmation.
   - Return its handoff when a human reviewer must merge. A changed head requires fresh verification; a merge refusal returns to the readiness checks, and a repeated refusal is reported without retrying.
4. **Confirm the result.**
   Run [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) to confirm the merged state, verified head, target and merge commit.
   - Return the result or blocker. Draft and blocked pull requests remain open.
