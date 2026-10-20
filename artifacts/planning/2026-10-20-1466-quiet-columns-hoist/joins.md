# Joins

Every eligible task pair in I11:E11 as its table now stands, and why each does not share a pull request. A pair is eligible when neither task depends on the other, directly or through a third. An empty Joins cell is correct only once this file names every such pair.

## The Table

Six rows. W02 depends on W01, W04 depends on W03, and W06 names W05 in Joins. That leaves twelve eligible pairs.

| | W03 | W04 | W05 | W06 |
| --- | --- | --- | --- | --- |
| **W01** | eligible | eligible | eligible | eligible |
| **W02** | eligible | eligible | eligible | eligible |
| **W03** | — | depends | eligible | eligible |
| **W04** | — | — | eligible | eligible |

## The One Pair That Shares a Pull Request

- **W05 and W06.**
  Both change what the dependency check prints and what the board queue does with an entry it cannot read. W05 gives the resolution verdict its third outcome and carries it into the queue; W06 rewrites the advisory the same run prints and adds the record check behind it. One file is edited twice either way, and splitting them puts two halves of one report behind two reviews. They name each other, and the pull request holds their order.

## The Pairs That Do Not

- **W01 and W02 against every other row.**
  W01 reads the Pass cell of a merged pull request's test plan and ticks the epic criteria those checks name; W02 repairs a plan written to an earlier shape, diagnoses an unreadable one and checks a private reference. Both work on the test plan a pull request carries, which the dependency check and the board queue never read. No file is shared, so joining them would put the plan-reading work behind the graph-reading work for no reason beyond a quieter advisory.
- **W03 and W04 against W05 and W06.**
  Both are delivered: W03 merged as [#1266](https://github.com/m2ux/workflow-server/pull/1266) and W04 as [#1289](https://github.com/m2ux/workflow-server/pull/1289). A merged row shares no pull request with an open one, so the pairs cannot be joined whatever their content.
- **W01 and W02 against W03 and W04.**
  The same closure applies, and it applied before these rows were added. The pairs stood unaccounted for while W03 and W04 were open, which is the gap [#1466](https://github.com/m2ux/workflow-server/issues/1466) names: the advisory printed them, nothing held the record to answering, and the column stayed empty on nobody's decision.
