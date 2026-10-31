# Review Pull Request

The draft pull request and body that present one epic base's delivered changes for review.

## Prerequisites

Read these files first.

- [Pull Request](../artifacts/pull-request.md)
- [Pull Request Body](../artifacts/pull-request-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)

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
   - Return its cited-versus-actual merge findings with the review identity. The session recording each task merge owns this update.
