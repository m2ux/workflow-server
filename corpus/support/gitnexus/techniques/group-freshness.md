---
metadata:
  version: 3.1.0
---

## Capability

Report, for every member of a repository group, how far its graph is behind the member's code and whether the member has a graph at all.

## Inputs

### group_name

Name of a configured repository group.

## Outputs

### group_freshness_report

The group's name, when its contract registry last synced, and one freshness entry per member.

#### repos

The members, keyed by the name the registry gives each rather than listed, every entry carrying whether its index sits behind the member's HEAD (`indexStale`) and by how many commits (`commitsBehind`), whether the contracts extracted for it sit behind (`contractsStale`), and whether it has no index at all (`missing`). A member with no index carries no commit count. Each key is the registry name the group addresses that member by, which names a graph and no tree. A step iterating this field as a list iterates nothing, the entries being keys.

#### missingRepos

A member list the response carries alongside the entries, and which stands empty while an entry marks a member `missing` — so the entries are what a reader takes that answer from.

## Protocol

1. Call `gitnexus_group_status { name: group_name }` to produce the `{group_freshness_report}`.
2. Read the report before taking any group-wide answer as evidence.
   > - A member reported as missing has no index. A group-wide search answers from the members that have one and reports nothing about the absence, so a result set that omits that component reads exactly like one where the component held no match.
   > - A member reported as behind answers from the commit it was indexed at. Its commits-behind count is the age of its evidence, and a member hundreds of commits behind is answering about a different codebase.
   > - A contract registry reported as behind describes cross-member links drawn before the members last moved.
