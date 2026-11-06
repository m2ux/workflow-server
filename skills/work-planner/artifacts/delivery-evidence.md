# Delivery Evidence

The pull request records and issue links that establish what an initiative's epics have delivered, with the per-epic findings that evidence yields.

## Operations

### Read Delivery Evidence

The pull requests and issue links that establish current delivery.

#### 1. Fetch Delivery Evidence

- Fetch the pull requests and links from [Selected Repositories](#selected-repositories) using [Authenticated Access](#authenticated-access), saving them at [Snapshot Paths](#snapshot-paths).
- Apply [Read Initiative Pull Requests](pull-request.md#read-initiative-pull-requests "ƒ") with the fetched issue files.
- Apply [Fetch Pull Request Issue Links](pull-request.md#fetch-pull-request-issue-links "ƒ").
- Apply [Access Development Links](pull-request.md#access-development-links "ƒ") for the actual complete link sets.

#### 2. Inspect Epic Delivery

- Apply [Inspect Epic Delivery](epic.md#inspect-epic-delivery "ƒ") with the epic JSON, pull request records and complete issue-link snapshot.
- Route the provided [Delivery Findings](epic.md#delivery-findings) to matching, verification or user decisions.

#### 3. Repair Missing Delivery Prefix

- Repair each reported missing-prefix title of a merged pull request linked directly by an epic task row, meeting [Named Delivery](#named-delivery).
- For a title with no prefix or only a matching initiative or task prefix, preserve its purpose and set the row’s owning epic prefix without another confirmation.
- A correct title requires no repair; a title naming another epic remains a conflict requiring reconciliation.
- Apply [Publish Pull Request](pull-request.md#publish-pull-request "ƒ") with the confirmed epic prefix and purpose.
- Apply [Read Delivery Evidence](#read-delivery-evidence "ƒ") again after saving the title, retaining the selected scope and snapshot destinations; provide its refreshed evidence and findings.

#### 4. Provide Complete Evidence

- Provide the current [Pull Request Records](#pull-request-records), [Issue-Link Snapshot](#issue-link-snapshot) and [Delivery Findings](#delivery-findings) to the requester, reporting incomplete evidence as [Failure](#failure).

- Evidence is complete when every pull request the plan links has a record, whatever its title. Incomplete evidence is a blocker, not a partial result.

## Fields

### Pull Request Records

Every pull request carrying the initiative prefix, across the selected repositories, and every pull request a Work Breakdown row or a Development link of the initiative's issues names, whatever its title and repository, in all states.

### Issue-Link Snapshot

The complete set of Development links between those pull requests and the issues they deliver, read through the access that exposes them whole.

### Delivery Findings

The per-epic [Delivery Findings](epic.md#delivery-findings) the evidence yields.

### Named Delivery

The reference to an epic-delivering pull request, whose title carries that epic's reference as `[I07:E00] Purpose`.

### Selected Repositories

The selected repositories whose delivery evidence is gathered.

### Initiative Prefix

The initiative reference prefix supplied to the pull request fetch.

### Issue Records

The fetched initiative, epic and task issue JSON files.

### Snapshot Paths

The destination pull request and issue-link snapshot files.

### Authenticated Access

Authenticated tracker access for the selected repositories.

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.
