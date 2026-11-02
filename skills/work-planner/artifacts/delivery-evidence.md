# Delivery Evidence

The pull request records and issue links that establish what an initiative's epics have delivered, with the per-epic findings that evidence yields.

## Prerequisites

Read these files first.

- [Pull Request](pull-request.md)
- [Epic](epic.md)

## Operations

### *Read* Delivery Evidence

The pull requests and issue links that establish current delivery.

**Inputs:** Selected repositories and initiative prefix, the fetched initiative, epic and task issue JSON, authenticated access and destination snapshot files.

1. Fetch the pull requests and their links.
   - Run [Read Initiative Pull Requests](pull-request.md#read-initiative-pull-requests) with the fetched issue files.
   - Run [Fetch Pull Request Issue Links](pull-request.md#fetch-pull-request-issue-links).
   - Use [Access Development Links](pull-request.md#access-development-links) for the actual complete link sets.
2. Run [Inspect Epic Delivery](epic.md#inspect-epic-delivery) with the epic JSON, pull request records and complete issue-link snapshot.
   - Route the returned [Delivery Findings](epic.md#delivery-findings) to matching, verification or user decisions.
3. Repair each reported missing-prefix title of a merged pull request linked directly by an epic task row, meeting [Named Delivery](#named-delivery).
   - The row identifies its owning epic; preserve the title purpose and set that epic prefix without another confirmation. A title already naming another epic remains a conflict requiring reconciliation.
   - Run [Publish Pull Request](pull-request.md#publish-pull-request) with the confirmed epic prefix and purpose.
   - Repeat the fetch and match steps with the saved title before returning.
4. Return the current pull request records, complete issue-link snapshot and per-epic findings to the caller, reporting incomplete evidence as a blocker.

## Fields

- **Pull request records.**
  Every pull request carrying the initiative prefix, across the selected repositories, and every pull request a Work Breakdown row or a Development link of the initiative's issues names, whatever its title and repository, in all states.
- **Issue-link snapshot.**
  The complete set of Development links between those pull requests and the issues they deliver, read through the access that exposes them whole.
- **Findings.** The per-epic [Delivery Findings](epic.md#delivery-findings) the evidence yields.

### Completeness

Evidence is complete when every pull request the plan links has a record, which [Read Initiative Pull Requests](pull-request.md#read-initiative-pull-requests) fetches whatever its title. Incomplete evidence is a blocker, not a partial result.

### Named Delivery

A pull request that delivers an epic carries that epic's reference in its title, as `[I07:E00] Purpose`. A merged delivery linked by an epic task row whose title has no prefix or only a matching initiative or task prefix receives that row's epic prefix before the evidence returns. Correct titles remain unchanged; a title naming another epic is a conflict. Publish the repaired title and fetch it again before treating the prefix as verified.
