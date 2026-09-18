# GitNexus Techniques

> Part of the [GitNexus namespace](../README.md)

Each operation here is one capability a step binds, or a technique's Protocol names as the tool it reaches for. The authoritative capability, inputs, outputs and rules live in the per-operation `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](TECHNIQUE.md) holds the input every operation inherits and the rules every one of them is held to.

---

## Reading the graph

| Technique | Answers |
|-----------|---------|
| [`query`](query.md) | The execution flows a concept, symptom or error text lands in |
| [`context`](context.md) | One symbol's callers, callees and flow membership |
| [`impact`](impact.md) | What depends on a symbol, at depth 1/2/3, with a risk level |
| [`detect-changes`](detect-changes.md) | The symbols a diff moved and the flows they sit on |
| [`cypher`](cypher.md) | Whatever the higher-level operations do not reach |
| [`read-cluster`](read-cluster.md) / [`read-clusters`](read-clusters.md) | One functional area's members; the whole area inventory |
| [`read-process`](read-process.md) / [`read-processes`](read-processes.md) | One flow's ordered trace; the whole flow inventory |
| [`heading-search`](heading-search.md) | Sections of a markdown tree, by heading text |
| [`reference-lookup`](reference-lookup.md) | The files whose links resolve to a given documentation file |

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
| [`analyze`](analyze.md) | Rebuilds a tree's index |
| [`rename`](rename.md) | Reports or writes a graph-driven multi-file rename |

## Reading a repository group

| Technique | Answers |
|-----------|---------|
| [`group-freshness`](group-freshness.md) | Which members can answer at all, and how old each answer is |
| [`group-search`](group-search.md) | One ranking merged across every member |
| [`group-contracts`](group-contracts.md) | What each member publishes, and what joins a publisher to a consumer |
| [`group-sync`](group-sync.md) | Rebuilds the contract registry |

## Settling a judgement

These end the [runs](../routines/README.md) — a routine carries no prose, so the reading each run closes on has its home here.

| Technique | Settles |
|-----------|---------|
| [`classify-test-coverage`](classify-test-coverage.md) | Which changed symbols no test reaches, and whose tests the change outran |
| [`compare-affected-scope`](compare-affected-scope.md) | Which reached flows fall outside what the work was for |
| [`compose-visibility-filter`](compose-visibility-filter.md) | The query keeping a changed set's exported surface |
| [`intersect-orphan-candidates`](intersect-orphan-candidates.md) | Which unreferenced symbols this work introduced or touched |
| [`select-affected-clusters`](select-affected-clusters.md) | Which functional areas a change reaches |
| [`select-stale-members`](select-stale-members.md) | Which members of a group a rebuild reaches, and the tree each one walks |
| [`weigh-change-risk`](weigh-change-risk.md) | The one rating a reviewer acts on |

---

## Reference convention

Every operation is a standalone file under this folder and is reached **qualified** — `gitnexus::<op>` — from anywhere outside the namespace, because a bare reference resolves in the referring workflow. A rule is named by its dotted address rather than invoked: `gitnexus.index-freshness-first`.
