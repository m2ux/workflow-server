# Change Overview

The published architecture overview, planning record and pull request link that explain one pull request's change.

## Prerequisites

Read these files first.

- [Pull Request](../artifacts/pull-request.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Repository Graph](../artifacts/repository-graph.md)
- [Planning Record](../artifacts/planning-record.md)
- [Architecture Overview](../artifacts/architecture-overview.md)
- [Pull Request Body](../artifacts/pull-request-body.md)

## Procedure

1. **Prepare the evidence.**
   Read the supplied pull request's identity, title, base and verified head through [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state).
   - Call [Create Pull Request Worktree](../artifacts/delivery-branches.md#create-pull-request-worktree) with the repository checkout, pull request number and verified head.
   - On a changed-head finding:
     - Repeat Read Pull Request State for the same pull request.
     - Repeat Create Pull Request Worktree using its new verified head.
   - Continue to measurement only when the worktree matches that head.
   - Obtain its changed paths through [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state).
   - Call [Measure Repository Change](../artifacts/repository-graph.md#measure-repository-change) with that worktree, head and base.
   - On stale index evidence, repeat Measure Repository Change after its index update.
   - On a changed revision:
     - Repeat Read Pull Request State.
     - Rebuild the worktree evidence.
   - Return any unresolved freshness blocker before writing the overview.
2. **Write the overview.**
   Locate any existing overview record for this pull request number before creating a record.
   - Reuse its folder identity when one exists; otherwise choose a planning-folder identity whose reference is the pull request number and whose slug comes from its title.
   - Call [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record) to prepare that folder.
   - Run [Populate Architecture Overview](../artifacts/architecture-overview.md#populate-architecture-overview) with the measured structure and flows, verified head, pinned code links and overview path. A repeat replaces its overview while preserving the record's other content.
3. **Register the overview.**
   Call [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record) with the record identity, folder, overview file and pull request link. The overview is its one Artifacts row and the pull request is under Links.
4. **Publish and link.**
   Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder, so the overview resolves.
   - Call [Link Architecture Overview](../artifacts/pull-request-body.md#link-architecture-overview) with the current body and published overview URL.
   - Publish the returned file through [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request).
   - Return the pull request, record folder, published overview, diagrams and References row to the caller.
