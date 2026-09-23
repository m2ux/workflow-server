# GitNexus Routines

> Part of the [GitNexus namespace](../README.md)

Each run here is a named sequence of the namespace's [operations](../techniques/README.md), declared with the inputs it needs and the values it produces. An activity reaches one with a `kind: routine` step; the loader substitutes the site's arguments through the body, prefixes every identifier from the step's id, and splices ordinary steps in its place. This file orients — the signature and the body live in the per-run `.yaml`.

A run lands here rather than in a workflow because its body composes this namespace's own operations. Callers may sit in any workflow, or arrive later.

---

## Over a diff

[`narrow-to-changed`](narrow-to-changed.yaml) takes a caller-supplied `MATCH`, writes the change's files into it, and runs it. [`orphan-scan`](orphan-scan.yaml) supplies the unreferenced `MATCH` so a work package never authors Cypher. [`public-api-enum`](public-api-enum.yaml) is the same shape over the visibility filter.

| Routine | Reached for |
|---------|-------------|
| [`diff-coverage-map`](diff-coverage-map.yaml) | Which changed symbols no test reaches, and whose tests the change outran |
| [`diff-taint-pass`](diff-taint-pass.yaml) | Which taint flows the diff opened, and which it inherited, from a graph carrying its taint layer |
| [`public-api-enum`](public-api-enum.yaml) | The exported surface a diff moved |
| [`scope-discipline-check`](scope-discipline-check.yaml) | Whether the diff stayed inside what the work was for |
| [`narrow-to-changed`](narrow-to-changed.yaml) | A caller's own graph query, bounded to the files this change touched |
| [`orphan-scan`](orphan-scan.yaml) | Which unreferenced symbols this work introduced or touched |
| [`package-diagram-source`](package-diagram-source.yaml) | The functional areas a change reaches, with their members |
| [`sequence-diagram-source`](sequence-diagram-source.yaml) | The ordered traces of the flows a change runs through |
| [`change-risk-assessment`](change-risk-assessment.yaml) | The one rating a reviewer acts on, against the traced whole |

## Over a codebase

| Routine | Reached for |
|---------|-------------|
| [`area-comprehension`](area-comprehension.yaml) | What an area is made of, read from a graph current with its tree |
| [`symptom-trace`](symptom-trace.yaml) | Where a symptom lives, and what reaches it |
| [`restructure-surface`](restructure-surface.yaml) | Everything a symbol touches, in both directions |
| [`api-surface-review`](api-surface-review.yaml) | The routes a tree serves, and where their consumers disagree with them |
| [`tool-surface`](tool-surface.yaml) | The MCP and RPC tools a tree declares, and where each is handled |

## Over a documentation tree

| Routine | Reached for |
|---------|-------------|
| [`doc-heading-lookup`](doc-heading-lookup.yaml) | Where a heading lives in a documentation tree |
| [`doc-reference-surface`](doc-reference-surface.yaml) | What needs reading if each file of a set changes meaning |

## Over a repository group

| Routine | Reached for |
|---------|-------------|
| [`group-concept-search`](group-concept-search.yaml) | Which members of a group implement a concept |
| [`group-radius`](group-radius.yaml) | How far a concern in one member reaches into every other, each answer naming its graph and the instruments — registry, graph, tree search — that answered |

## Over an index

| Routine | Reached for |
|---------|-------------|
| [`graph-for-tree`](graph-for-tree.yaml) | The name of a tree's graph, built where the tree has none |
| [`index-refresh`](index-refresh.yaml) | A graph current with the tree it was built from |
| [`roster-refresh`](roster-refresh.yaml) | Every tree a roster names carrying a graph current with it, the checkouts brought to their named revisions first where the caller asks for it |
| [`component-scan`](component-scan.yaml) | Which components a host declares that the roster of trees to index does not cover, and which roster entries no declared component answers |
| [`group-refresh`](group-refresh.yaml) | A group current with its members, its contract registry included |

## Stopping for a decision

A technique is session-blind, so a run that puts something in front of a person is the one shape only a routine holds.

| Routine | Gates on |
|---------|----------|
| [`pre-edit-impact-gate`](pre-edit-impact-gate.yaml) | A measured blast radius, where the rating is high, critical or unknown, before an edit lands |
| [`api-change-gate`](api-change-gate.yaml) | A route's measured consumer surface, where a consumer reads a key the response omits, before the change lands |
| [`guarded-rename`](guarded-rename.yaml) | The previewed edit list, before the rename writes it |

---

## Reference convention

A run is reached **qualified** — `gitnexus::<run>` — from anywhere outside the namespace, and its body names this namespace's operations qualified too, because a bare reference resolves in the workflow the run is spliced into rather than here.
