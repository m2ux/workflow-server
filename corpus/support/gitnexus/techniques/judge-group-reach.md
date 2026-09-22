---
metadata:
  version: 2.0.0
---

## Capability

Settle, for every member of a repository group, whether a concern reaches it — by the edges the member's own graph holds, by a derivation those edges cannot hold, or not at all — alongside whether the group's registry declares the member a consumer of the concern's home, and say which instruments answered for each.

## Inputs

### group_members

The group's members, each with its graph name, its tree, and whether it is the concern's home.

### boundary_symbols

The names a member could hold a reference to, each with its kind.

### boundary_packages

The names under which a member consumes the home tree as a library.

### contract_report

Each contract the group's registry holds with the member publishing it, its kind, and the member it cross-links to.

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

`home` for the member the concern was raised in; `graph` where a probe found a dependent through the member's own edges; `hand-derived` where a search of the member's tree found a boundary symbol; `none` where neither did; `unanswerable` where the member has no graph and no tree to ask.

##### dependency

`declared` where the group's registry cross-links the member to the home, naming the package the member consumes the home under; `undeclared` where it holds no such link. The home's own entry is `undeclared`, a registry joining one member to another and holding no link from a member to itself.

##### instruments

The instruments that answered for the member, in the order asked: `registry`, `graph`, `grep`. The registry settles `dependency`, and the graph and the search settle `reach`. Each is listed whether its answer was full or empty, so a reader can tell an empty answer from a question never put; empty where nothing could be asked.

##### evidence

The contracts the registry links the member by, the dependents the probes found with the file each hangs off, and the files the search found — or the statement that each was empty.

##### surfaced_by_search

True where `{group_query_report}` carries a flow from this member.

## Protocol

### 1. Mark the Home

- Take the entry of `{group_members}` whose name is `{home_repo}` and record it with reach `home`, dependency `undeclared`, instruments `graph`, and its own radius as evidence.

### 2. Read the Registry for Each Member

- For every other member, take the cross-links in `{contract_report}` that run from the member to the home, record their contract ids as evidence under `registry`, and set `dependency` to `declared`. A member with none is recorded with `registry` answering empty and `dependency` `undeclared`.
- A declared link is a fact about a package rather than about a concern: it says the member's manifest depends on the tree the concern sits in, which holds identically for every symbol that tree publishes. It establishes that the member *could* reach the concern, and the two instruments that read symbols settle whether it *does*.

### 3. Read Each Member's Probes

- Read the member's entries of `{member_probes}` and record under `graph` every definition of the boundary name the member's graph holds, each with its file and its depth-1 dependents. A probe answers in three shapes and the graph holds a different thing in each: a report, where the member defines the name once; candidates, where it defines it several times and each carries its own file and dependent count; and a not-found answer, where the member's tree defines it nowhere and the instrument is recorded as having found none.
- Each file recorded is in the member's own tree — the graph holds no node for a name the tree imports, per `edges-the-parser-cannot-see` — so a definition the probe found is one the member makes itself, and the file is what lets a reader tell a mirror of the home's symbol from a homonym.

### 4. Search Each Member's Tree

- Search the member's tree for each name in `{boundary_symbols}` and each name in `{boundary_packages}` (`grep -rln`, leaving out the tree's `.git` and dependency folders) and record the files found under `grep`, package hits and symbol hits told apart. The search runs for every member with a tree, linked or not, so every row carries what the tree holds.
  > A member with no graph and no tree has neither symbol instrument to ask: record reach `unanswerable` with no instruments beyond the registry's, and name it so the run's caller knows a member went unmeasured. Its `dependency` stands all the same, the registry answering from the group's configuration rather than from the member.

### 5. Settle the Reach

- Set the member's reach to `graph` where a definition the probe found carries a dependent, `hand-derived` where the search found a boundary symbol in the member's tree, and `none` where neither did. The instruments asked stay listed whichever settled it, the registry's answer among them.
- The package names the same search looked for answer what the member consumes rather than what it references, so they feed the dependency reading and not this one. A package name holds wherever the member depends on the concern's tree, which is the fact a declared link already carries.

### 6. Note the Search

- For every member, set `surfaced_by_search` from whether `{group_query_report}` carries a flow from it. A member the ranking surfaced and no instrument reached is the reader's first candidate for a coupling nothing here declares.
- A member other than the home whose `dependency` is `undeclared` and whose tree names a boundary package is a coupling the group's links do not declare: name it in the evidence, so the links can be completed and the registry answers for it next time. Where its reach is `graph` or `hand-derived` as well, the member references the concern too, and the evidence says so.
- A member whose `dependency` is `declared` and whose reach is `none` consumes the home as a library and holds no reference to the concern. Name it as that: the link bounds what the member could reach, both symbol instruments were asked, and neither found the concern in it.
