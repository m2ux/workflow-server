# Change Overview

The published architecture overview, planning record and pull request link that explain one pull request's change.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Prerequisites

Read these files first.

- [Pull Request](../artifacts/pull-request.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Repository Graph](../artifacts/repository-graph.md)
- [Planning Record](../artifacts/planning-record.md)
- [Architecture Overview](../artifacts/architecture-overview.md)
- [Pull Request Body](../artifacts/pull-request-body.md)

## Procedure

### 1. Prepare the Evidence

- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for the supplied pull request to obtain its identity, title, base and verified head.
- Apply [Create Pull Request Worktree](../artifacts/delivery-branches.md#create-pull-request-worktree "ƒ") with the project checkout, pull request number and verified head.

#### Changed Head

- On a changed-head finding:
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") again for the same pull request.
- Apply [Create Pull Request Worktree](../artifacts/delivery-branches.md#create-pull-request-worktree "ƒ") again with the project checkout, same pull request number and new verified head.

#### Matching Head

- Continue to measurement only when the worktree matches that head.
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for its changed paths.
- Apply [Measure Repository Change](../artifacts/repository-graph.md#measure-repository-change "ƒ") with the review checkout it returns, head and base.
- On stale index evidence, Apply [Measure Repository Change](../artifacts/repository-graph.md#measure-repository-change "ƒ") again with the review checkout, head and base after its index update.

#### Changed Revision

- On a changed revision:
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") again.
- Rebuild the worktree evidence.

#### Freshness Result

- Provide any unresolved freshness blocker before writing the overview.

### 2. Write the Overview

- Locate any existing overview record for this pull request number before creating a record.
- Reuse its folder identity when one exists; otherwise choose a planning-folder identity whose reference is the pull request number and whose slug comes from its title.
- Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") to prepare that folder.
- Apply [Populate Architecture Overview](../artifacts/architecture-overview.md#populate-architecture-overview "ƒ") with the measured structure and flows, verified head, pinned code links and overview path. A repeat replaces its overview while preserving the record's other content.

### 3. Register the Overview

Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") with the record identity, folder, overview file and pull request link. The overview is its one Artifacts row and the pull request is under Links.

### 4. Publish and Link

- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder, so the overview resolves.
- Apply [Link Architecture Overview](../artifacts/pull-request-body.md#link-architecture-overview "ƒ") with the current body and published overview URL.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with the provided file.
- Provide the pull request, record folder, published overview, diagrams and References row to the caller.
