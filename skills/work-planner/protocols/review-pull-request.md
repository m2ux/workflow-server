# Review Pull Request

The draft pull request and body that present one epic base's delivered changes for review.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Find

- Use the review number in the supplied delivery findings.

#### Missing Review Number

- When the review number is absent:
- Run [Find Review Pull Request](../artifacts/pull-request.md#find-review-pull-request "ƒ") with the repository and epic base as head.
- Use its provided number or absence result.

#### Existing Review

- For an existing review, Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ").

### 2. Populate

Apply [Populate Review Body](../artifacts/pull-request-body.md#populate-review-body "ƒ") with the existing body when present and the actual task merges into the base.

### 3. Publish

- When an existing review needs its body updated, the first task merges, a draft is reported or an unmerged base has no review:
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with the provided file, supplying its number for an existing review, and for a new one the epic's issue with the repository setting the caller confirmed. The epic stays open until integration and closure checks pass.

### 4. Confirm

- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for the published review.
- Compare its complete body with the published file.
- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") with the current epic, refreshed review and task-merge records, the project checkout and the fetched epic bases.
- Retain its cited-versus-actual merge findings and its Changes path findings with the review identity. The session recording each task merge owns this update.

### 5. Review the Integration

- When the caller requests handoff and supplies confirmed epic readiness:
- Apply [Produce Agent Review](../artifacts/agent-review.md#produce-agent-review "ƒ") for the resulting head with fresh metadata and updated validation evidence.
- Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") with its provided record, and Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ").
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") to link that published record from the review body, preserving its task references and overview.
- Fetch the published record and fresh pull request metadata; Run [Validate Agent Review](../artifacts/agent-review.md#validate-agent-review "ƒ"). A blocker returns without handoff; current board delivery evidence holds the epic In Progress.
- Provide the confirmed review evidence with the review identity and delivery findings. Ordinary task-merge publication returns the draft identity without completing handoff.
