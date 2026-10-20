# Joins

Every eligible task pair in I11:E11 as its table now stands, and why each does not share a pull request. A pair is eligible when neither task depends on the other, directly or through a third. An empty Joins cell is correct only once this file names every such pair, and the dependency check reads this file for them: a line naming both ids accounts for that pair.

## The Table

Six rows. W02 depends on W01, W04 depends on W03, and W05 and W06 name each other in Joins. That leaves twelve eligible pairs, each named below.

## The Pair That Shares a Pull Request

- **E11:W05 and E11:W06.**
  Both change what the dependency check prints and what the board queue does with an entry it cannot read. W05 gives the resolution verdict its third outcome and carries it into the queue; W06 rewrites the advisory the same run prints and adds the record read behind it. One report is edited twice either way, so splitting them puts two halves of it behind two reviews. They name each other in Joins, and the pull request holds their order.

## The Pairs That Do Not

The test plan a pull request carries is read by neither the dependency check nor the board queue, so W01 and W02 share no file with the rows that read the graph.

- **E11:W01 and E11:W03.**
  W01 reads the Pass cell of a merged pull request's test plan; W03 reads a Work Breakdown row by the id at the head of its Task cell. Different files, and W03 is delivered.
- **E11:W01 and E11:W04.**
  Same parting, and W04 is delivered: a merged row shares no pull request with an open one.
- **E11:W01 and E11:W05.**
  W01 ticks criteria from a plan the queue never opens; W05 changes how the queue answers a dependency cell. Joining them would put the plan reading behind the graph reading for no reason beyond a quieter report.
- **E11:W01 and E11:W06.**
  W06 changes one advisory of the dependency check, which W01 does not call.
- **E11:W02 and E11:W03.**
  W02 repairs a plan written to an earlier shape and diagnoses an unreadable one; W03 is delivered.
- **E11:W02 and E11:W04.**
  Same parting, and W04 is delivered.
- **E11:W02 and E11:W05.**
  W02 works on the pull request's test plan, W05 on the epic table's dependency cell. No file is shared.
- **E11:W02 and E11:W06.**
  Same parting against the joins advisory.
- **E11:W03 and E11:W05.**
  W03 merged as [#1266](https://github.com/m2ux/workflow-server/pull/1266). A delivered row shares no pull request with an open one, whatever the two touch.
- **E11:W03 and E11:W06.**
  Same closure.
- **E11:W04 and E11:W05.**
  W04 merged as [#1289](https://github.com/m2ux/workflow-server/pull/1289). Same closure.
- **E11:W04 and E11:W06.**
  Same closure.

The four pairs among W01 to W04 stood unaccounted for while W03 and W04 were open, which is the gap [#1466](https://github.com/m2ux/workflow-server/issues/1466) names: the advisory printed them, nothing held a record to answering, and the column stayed empty on nobody's decision.
