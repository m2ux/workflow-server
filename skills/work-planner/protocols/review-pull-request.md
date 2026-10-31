# Review Pull Request

The draft pull request and body that present one epic base's delivered changes for review.

## Prerequisites

Read these files first.

- [Pull Request](../artifacts/pull-request.md)
- [Pull Request Body](../artifacts/pull-request-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Agent Review](../artifacts/agent-review.md)
- [Planning Record](../artifacts/planning-record.md)

## Procedure

1. **Find.**
   Use the review number in the supplied delivery findings.
   - When it is absent:
     - Run [Locate Review Pull Request](../artifacts/pull-request.md#locate-review-pull-request) with the repository and epic base as head.
     - Use its returned number or absence result.
   - Fetch an existing review through [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state).
2. **Populate.**
   Pass the existing body when present and the actual task merges into the base to [Populate Review Body](../artifacts/pull-request-body.md#populate-review-body).
3. **Publish.**
   When an existing review needs its body updated, the first task merges, a draft is reported or an unmerged base has no review:
   - Pass the returned file to [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request), supplying its number for an existing review, and for a new one the epic's issue with the repository setting the caller confirmed. The epic stays open until integration and closure checks pass.
4. **Confirm.**
   Run [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for the published review.
   - Compare its complete body with the published file.
   - Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with the current epic and refreshed review and task-merge records.
   - Retain its cited-versus-actual merge findings with the review identity. The session recording each task merge owns this update.
5. **Review the integration.**
   When the caller requests handoff and supplies confirmed epic readiness:
   - Run [Produce Agent Review](../artifacts/agent-review.md#produce-agent-review) with the fresh review metadata, checkout, epic criteria, validation evidence and planning destination.
   - Register and publish its returned record through [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record) and [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record).
   - Link that published record from the review body through [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request), preserving its task references and overview.
   - Fetch the published record and fresh pull request metadata; run [Check Agent Review](../artifacts/agent-review.md#check-agent-review). A blocker returns without handoff; current board delivery evidence holds the epic In Progress.
   - Return the confirmed review evidence with the review identity and delivery findings. Ordinary task-merge publication returns the draft identity without completing handoff.
