# GitNexus Techniques

> Part of the [GitNexus namespace](../README.md)

Each operation here is one capability a step binds, or a technique's Protocol names as the tool it reaches for. The authoritative capability, inputs, outputs and rules live in the per-operation `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](TECHNIQUE.md) holds the input every operation inherits and the rules every one of them is held to.

---

## Reading the graph

| Technique | Answers |
|-----------|---------|
| [`query`](query.md) | The execution flows a concept, symptom or error text lands in |
| [`context`](context.md) | One symbol's callers, callees and flow membership, and how complete that set is |
| [`impact`](impact.md) | What depends on a symbol, at depth 1/2/3, with a risk level |
| [`trace`](trace.md) | The shortest call path from one symbol to another, or where the chain breaks |
| [`detect-changes`](detect-changes.md) | The symbols a diff moved and the flows they sit on |
| [`check`](check.md) | The circular file imports a graph holds |
| [`cypher`](cypher.md) | Whatever the higher-level operations do not reach |
| [`read-cluster`](read-cluster.md) / [`read-clusters`](read-clusters.md) | One functional area's members; the whole area inventory |
| [`read-process`](read-process.md) / [`read-processes`](read-processes.md) | One flow's ordered trace; the whole flow inventory |
| [`heading-search`](heading-search.md) | Sections of a markdown tree, by heading text |
| [`reference-lookup`](reference-lookup.md) | The files whose links resolve to a given documentation file |

## Reading the program-dependence layer

A graph built with its program-dependence layers answers two questions the call graph cannot. Both answer with a note in place of findings where the graph was built without them.

| Technique | Answers |
|-----------|---------|
| [`explain`](explain.md) | The source-to-sink taint flows recorded in a file or a function, and across the calls between functions |
| [`pdg-query`](pdg-query.md) | Which predicates gate a statement, and where a variable's definitions flow, inside one function |

## Reading an API surface

| Technique | Answers |
|-----------|---------|
| [`api-impact`](api-impact.md) | What a route handler's change reaches — consumers, response keys, middleware, flows |
| [`route-map`](route-map.md) | Which file serves each route, behind what middleware, for which consumers |
| [`shape-check`](shape-check.md) | Where a route's response and its consumers' reads disagree |
| [`tool-map`](tool-map.md) | Which MCP and RPC tools a tree declares, and where each is handled |

## Managing an index

| Technique | Does |
|-----------|------|
| [`resolve-graph`](resolve-graph.md) | Names the graph an operation addresses, and what else is indexed |
| [`verify-index`](verify-index.md) | Reads what a graph holds and how far behind its tree it is |
| [`analyze`](analyze.md) | Rebuilds a tree's index, with or without its program-dependence layers |
| [`rename`](rename.md) | Reports or writes a graph-driven multi-file rename |

## Reading a repository group

A group is addressed through its members' graphs and two resources of its own. The ranked search reaches every member at once by addressing `repo` as `@<group>`; the contract registry and the per-member freshness are resources the group publishes.

| Technique | Answers |
|-----------|---------|
| [`group-freshness`](group-freshness.md) | Which members can answer at all, how old each answer is, and how far the registry can be trusted |
| [`group-search`](group-search.md) | One ranking merged across every member |
| [`group-contracts`](group-contracts.md) | What each member publishes, and what joins a publisher to a consumer |
| [`group-sync`](group-sync.md) | Rebuilds the contract registry, and says what it could not read |
| [`list-group-members`](list-group-members.md) | The group's members as a list a run can walk, each with its graph name, the tree its graph was built from, and whether it is a concern's home |

## Composing a query

A restriction the graph already holds — the files a change touched, the names a diff moved that a consumer can see — is written into a `MATCH` and executed. These operations produce that query string; the [run](../routines/README.md) that follows is what executes it.

| Technique | Composes |
|-----------|----------|
| [`compose-visibility-filter`](compose-visibility-filter.md) | The query keeping a changed set's exported surface |
| [`constrain-to-changed-files`](constrain-to-changed-files.md) | The query keeping a `MATCH` to the files this work changed |

## Settling a judgement

These end the [runs](../routines/README.md) — a routine carries no prose, so the reading each run closes on has its home here.

| Technique | Settles |
|-----------|---------|
| [`attribute-taint-findings`](attribute-taint-findings.md) | Which taint flows a change opened, and which it inherited |
| [`classify-test-coverage`](classify-test-coverage.md) | Which changed symbols no test reaches, and whose tests the change outran |
| [`compare-affected-scope`](compare-affected-scope.md) | Which reached flows fall outside what the work was for |
| [`extract-boundary-symbols`](extract-boundary-symbols.md) | The names by which a concern in one graph can be reached from another |
| [`judge-group-reach`](judge-group-reach.md) | Whether a concern reaches each member of a group, and which instrument settled it |
| [`judge-roster-coverage`](judge-roster-coverage.md) | Which components a host declares that the roster of trees to index does not cover, and which entries no component answers |
| [`select-affected-clusters`](select-affected-clusters.md) | Which functional areas a change reaches |
| [`select-stale-members`](select-stale-members.md) | Which members of a group a rebuild reaches, and the tree each one walks |
| [`weigh-change-risk`](weigh-change-risk.md) | The one rating a reviewer acts on |

---

## Reference convention

Every operation is a standalone file under this folder and is reached **qualified** — `gitnexus::<op>` — from anywhere outside the namespace, because a bare reference resolves in the referring workflow. A rule is named by its dotted address rather than invoked: `gitnexus.index-freshness-first`.
