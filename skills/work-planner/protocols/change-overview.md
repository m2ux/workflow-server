# Change Overview

The published architecture overview, planning record and pull request link that explain one pull request's change.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

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
- Take the graph [measurements](../artifacts/architecture-overview.md#measurements) from the evidence step and check the proposed diagrams.
- The diagrams must meet [Diagrams](../artifacts/architecture-overview.md#diagrams).

- Populate the overview from the [Template](../artifacts/architecture-overview.md#template) at the destination in [Overview File](../artifacts/architecture-overview.md#overview-file).
- All populated fields must meet [Fields](../artifacts/architecture-overview.md#fields).

- Pin each code reference to the [Pull Request Head](../artifacts/architecture-overview.md#pull-request-head).
- Each reference must meet [Code References](../artifacts/architecture-overview.md#code-references).

- Retain the completed [Overview File](../artifacts/architecture-overview.md#overview-file) for registration in its planning record.

- A repeat replaces its overview while preserving the record’s other content.

- The reader is an engineer meeting this codebase for the first time. A component, type or function carries the name the diff carries, so the document and the diff name one thing once. A term the codebase coins is defined where it first appears.

- A component diagram's areas and edges, and a sequence's step order, are the ones measured over the graph. A boundary taken from the directory layout, and a call order traced by hand, are each a defect.

- Items of one kind go in a bulleted list, never packed into a paragraph. Each opens with a bold lead naming the item, and its body is the line beneath.

- About two hundred lines, diagrams counted.

### 3. Register the Overview

Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") with the record identity, folder, overview file and pull request link. The overview is its one Artifacts row and the pull request is under Links.

### 4. Publish and Link

- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder, so the overview resolves.
- Use the current body and published overview URL.

- Add [Overview URL](../artifacts/pull-request-body.md#overview-url) as the Architecture Overview reference in the References of [Current Body](../artifacts/pull-request-body.md#current-body), creating that section in its [Template](../artifacts/pull-request-body.md#template) position when absent and writing to [Output Body](../artifacts/pull-request-body.md#output-body).

- Preserve an existing row already naming the overview. The link uses the engineering-artifacts base URL so later files resolve from the same record.

```markdown
- **R1.** [Architecture Overview](https://github.com/{owner}/{repo}/tree/engineering/artifacts/planning/2026-10-08-950-queue-placement/architecture-overview.md) — the change's structure, its flows, and the order to read the diff.
```

- Retain the complete [updated body](../artifacts/pull-request-body.md#output-body) file for publication.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with the provided file.
- Provide the pull request, record folder, published overview, diagrams and References row to the caller.
