---
metadata:
  version: 1.2.0
---

## Capability

Rebuild a repository group's contract registry — the HTTP, RPC and messaging contracts its members publish, and the cross-links between them.

## Inputs

### group_name

Name of a configured repository group.

### exact_only

*(optional)* Whether cross-links are drawn on exact contract-id matches alone, skipping the wildcard service match. A registry built this way records the skipped stage.

## Outputs

### contract_registry_stats

What the rebuilt registry holds and what it could not reach: the contracts extracted per member, how many cross-link to another member, and the sync's own provenance.

#### registryOutcome

What happened to the registry file: `written` where this sync's contracts replaced it; `preserved` where nothing could be read and the previous contracts were kept with only the member lists refreshed; `superseded` where another sync replaced the file while this one waited, leaving this sync's lists unrecorded; `no-prior-registry` where nothing could be read and no earlier registry existed, so the group has none.

#### missingRepos

The configured members with no entry in the registry of indexed graphs.

#### unreadableRepos

The members whose graph could not be opened or extracted from, none of whose contracts this sync holds.

#### failedRepos

The members whose extraction threw, each with its `repo` path and the `reason`; each also appears in `unreadableRepos`.

#### degradedLinks

How many cross-links name a provider endpoint the provider's graph resolves to no symbol.

#### warnings

Run notes for an operator, such as a bridge write that failed after the registry was written; empty where the run raised none.

#### suppressedMatchStages

The matching stages this sync was asked to skip; empty where it skipped none.

## Protocol

### 1. Rebuild the Registry

- Call `gitnexus_group_sync { name: group_name, exactOnly: exact_only }` and record the `{contract_registry_stats}` it reports.
   > - The rebuild reads each member's own graph, so a member whose index is behind contributes contracts from the commit it was indexed at, and a registry built over members that are behind is behind with them.
   > - Read `{contract_registry_stats}.registryOutcome` before the counts: only `written` describes contracts this run extracted, `preserved` and `superseded` leave an older registry on disk, and `no-prior-registry` leaves none.

### 2. Read a Contract with No Cross-Link

- Read a contract with no cross-link as one whose counterpart the registry did not find, which is a publisher with no consumer in the group, a name the match did not reach, or a member in `{contract_registry_stats}.unreadableRepos` — not evidence that nothing consumes it.
