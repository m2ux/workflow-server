---
metadata:
  version: 1.0.0
---

## Capability

Settle, for every member of a repository group, whether a concern reaches it — by the edges its graph holds, by a derivation the graph cannot hold, or not at all — and say which instrument answered for each.

## Inputs

### group_members

The group's members, each with its graph name, its tree, and whether it is the concern's home.

### boundary_symbols

The names a member could hold a reference to, each with its kind.

### member_probes

One entry per member and boundary symbol probed: the member's graph name, the symbol, and what depends on it in that graph.

### group_query_report

Execution flows drawn from the group's members for the concern, each carrying the member it came from.

### home_repo

The graph name of the member the concern was raised in.

## Outputs

### group_reach_report

One entry per member, in the group's order, every entry naming the graph it answers for.

#### entry

##### graph

The member's graph name.

##### reach

`home` for the member the concern was raised in; `graph` where a probe found a dependent through the member's edges; `hand-derived` where the graph held no edge and a search of the member's tree found the name; `none` where neither did; `unanswerable` where the member has no graph and no tree to search.

##### instrument

`graph` where the reach rests on the member's edges; `grep` where it rests on a search of the tree; both where the search confirmed an empty graph answer; empty where nothing could be asked.

##### evidence

The dependents the probes found, or the files the search found, or the statement that both were empty.

##### surfaced_by_search

True where `{group_query_report}` carries a flow from this member.

## Protocol

### 1. Mark the Home

- Take the entry of `{group_members}` whose name is `{home_repo}` and record it with reach `home`, instrument `graph`, and its own radius as evidence.

### 2. Read Each Member's Probes

- For every other member, read its entries of `{member_probes}`. Where any probe carries a depth-1 dependent, record reach `graph`, instrument `graph`, and those dependents as evidence.

### 3. Derive by Hand Where the Graph Is Silent

- For a member whose probes all came back empty, the empty answer is absence of evidence rather than evidence of absence — `gitnexus.edges-the-parser-cannot-see`. Search the member's tree for each name in `{boundary_symbols}` (`grep -rln`, leaving out the tree's `.git` and dependency folders), and record the files found as evidence with instrument `grep`: reach `hand-derived` where a file names the symbol, `none` where no file does. The instrument is recorded either way, so a reader can tell a searched member from one nobody looked at.
  > A member with an empty tree has nothing to search: record reach `unanswerable` with an empty instrument, and name it so the run's caller knows a member went unmeasured.

### 4. Note the Search

- For every member, set `surfaced_by_search` from whether `{group_query_report}` carries a flow from it. A member the ranking surfaced and the probes missed is the reader's first candidate for a reach the graph cannot see.
