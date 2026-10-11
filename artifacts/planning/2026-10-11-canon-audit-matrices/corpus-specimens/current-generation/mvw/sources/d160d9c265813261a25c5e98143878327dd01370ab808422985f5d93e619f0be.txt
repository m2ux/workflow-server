---
metadata:
  version: 4.0.0
---

## Capability

Report, for every member of a repository group, how far its graph is behind the member's code, whether the member has a graph at all, and how far the group's contract registry can be trusted.

## Inputs

### group_name

Name of a configured repository group.

## Outputs

### group_freshness_report

The group's name, when its contract registry last synced (`lastSync`), one freshness entry per member, and the registry's own provenance.

#### repos

The members, keyed by each one's path within the group rather than listed, so a step iterating this field as a list iterates nothing. Every entry carries whether its index sits behind the member's HEAD (`indexStale`) and by how many commits (`commitsBehind`), the standing that count was read at (`status` — `current`, `behind`, `diverged` or `unknown`), whether the contracts extracted for it sit behind (`contractsStale`), whether it has no usable graph (`missing`), and which failure that is (`unresolvable`): false is a member absent from the registry of indexed graphs, true is a registry entry that could not be turned into a graph, with `unresolvableReason` saying why. A member with no graph carries no commit count. The key names a path inside the group and no graph; the group's configuration maps it to the registry name a graph is addressed by.

#### missingRepos

The members the last sync found no registry entry for, as the sync recorded them.

#### unreadableRepos

The members the last sync could not extract contracts from, in three states: absent where the sync never recorded which members it read, so every cross-member answer is a floor; an empty list where it measured none; a populated list naming them.

#### suppressedMatchStages

The matching stages the last sync was asked to skip, in the same three states — absent for a registry predating the field, empty where nothing was skipped, and populated where the cross-links are a lower bound by request.

## Protocol

### 1. Take the Freshness Report

- Read the MCP resource `gitnexus://group/{group_name}/status` and record it as the `{group_freshness_report}`.
   > An error naming the group arrives in place of a document where no group of that name is configured.

### 2. Read It Before Trusting a Group Answer

- Read the report before taking any group-wide answer as evidence.
   > - A member reported as missing has no graph. A group-wide search answers from the members that have one and reports nothing about the absence, so a result set that omits that component reads exactly like one where the component held no match.
   > - A member reported as behind answers from the commit it was indexed at. Its commits-behind count is the age of its evidence, and a member hundreds of commits behind is answering about a different codebase.
   > - A contract registry reported as behind describes cross-member links drawn before the members last moved, and one whose `unreadableRepos` is absent cannot say which members it read at all.
