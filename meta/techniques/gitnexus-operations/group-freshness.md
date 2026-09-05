---
metadata:
  version: 1.0.0
---

## Capability

Report, for every member of a repository group, how far its graph is behind the member's code and whether the member has a graph at all.

## Inputs

### group_name

Name of a configured repository group.

## Outputs

### group_freshness_report

Per member: whether its index is behind the member's HEAD and by how many commits, whether the group's contract registry is behind, and whether the member has no index at all.

## Protocol

1. Call `gitnexus_group_status {group_name}` to produce the `{group_freshness_report}`.
2. Read the report before taking any group-wide answer as evidence.
   > - A member reported as missing has no index. A group-wide search answers from the members that have one and reports nothing about the absence, so a result set that omits that component reads exactly like one where the component held no match.
   > - A member reported as behind answers from the commit it was indexed at. Its commits-behind count is the age of its evidence, and a member hundreds of commits behind is answering about a different codebase.
3. Apply [analyze](./analyze.md) on each member whose staleness bears on the question, addressing that member's own tree.
