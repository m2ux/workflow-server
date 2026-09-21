---
metadata:
  version: 1.1.0
---

## Capability

Settle, for every member of a repository group, whether a concern reaches it — by a link the group's registry holds, by the edges the member's own graph holds, by a derivation neither can hold, or not at all — and say which instruments answered for each.

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

`home` for the member the concern was raised in; `linked` where the registry holds a cross-link from the member to the home; `graph` where a probe found a dependent through the member's own edges; `hand-derived` where a search of the member's tree found a boundary name or a package name; `none` where none of these did; `unanswerable` where the member has no graph and no tree to search.

##### instruments

The instruments that answered for the member, in the order asked: `registry`, `graph`, `grep`. Each is listed whether its answer was full or empty, so a reader can tell an empty answer from a question never put; empty where nothing could be asked.

##### evidence

The contracts the registry links the member by, the dependents the probes found with the file each hangs off, and the files the search found — or the statement that each was empty.

##### surfaced_by_search

True where `{group_query_report}` carries a flow from this member.

## Protocol

### 1. Mark the Home

- Take the entry of `{group_members}` whose name is `{home_repo}` and record it with reach `home`, instruments `graph`, and its own radius as evidence.

### 2. Read the Registry for Each Member

- For every other member, take the cross-links in `{contract_report}` that run from the member to the home and record their contract ids as evidence under `registry`. A member with none is recorded with `registry` answering empty.

### 3. Read Each Member's Probes

- Read the member's entries of `{member_probes}` and record under `graph` each depth-1 dependent found, with the file the probed name is defined in. That file is in the member's own tree — the graph holds no node for a name the tree imports, per `edges-the-parser-cannot-see` — so what the probe found is a definition of the boundary name inside the member, and the file is what lets a reader tell a mirror of the home's symbol from a homonym.

### 4. Search Each Member's Tree

- Search the member's tree for each name in `{boundary_symbols}` and each name in `{boundary_packages}` (`grep -rln`, leaving out the tree's `.git` and dependency folders) and record the files found under `grep`, package hits and symbol hits told apart. The search runs for every member with a tree, linked or not, so every row carries what the tree holds.
  > A member with an empty tree has nothing to search: record reach `unanswerable` with no instruments, and name it so the run's caller knows a member went unmeasured.

### 5. Settle the Reach

- Set the member's reach to the first that holds: `linked` where the registry answered, `graph` where a probe found a dependent, `hand-derived` where the search found a file, `none` otherwise. The instruments asked stay listed whichever settled it.

### 6. Note the Search

- For every member, set `surfaced_by_search` from whether `{group_query_report}` carries a flow from it. A member the ranking surfaced and no instrument reached is the reader's first candidate for a coupling nothing here declares.
- A member whose registry answer was empty and whose tree search found a package name is a coupling the group's links do not declare: name it in the evidence, so the links can be completed and the registry answers for it next time.
