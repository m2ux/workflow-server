# GitNexus Routines

> Part of the [GitNexus namespace](../README.md)

Each run here is a named sequence of the namespace's [operations](../techniques/README.md), declared with the inputs it needs and the values it produces. An activity reaches one with a `kind: routine` step; the loader substitutes the site's arguments through the body, prefixes every identifier from the step's id, and splices ordinary steps in its place. This file orients — the signature and the body live in the per-run `.yaml`.

A run lands here rather than in a workflow because its body composes this namespace's own operations. Callers may sit in any workflow, or arrive later.

---

## Over a diff

| Routine | Runs |
|---------|------|
| [`diff-coverage-map`](diff-coverage-map.yaml) | The changed symbols, each one's callers, then which of them a test reaches |
| [`public-api-enum`](public-api-enum.yaml) | The changed symbols, the query that filters them to the visible ones, then the exported surface that query returns |
| [`scope-discipline-check`](scope-discipline-check.yaml) | The flows the diff reaches, held against the flows the work was for |
| [`orphan-scan`](orphan-scan.yaml) | Every unreferenced function and method, narrowed to the files this work changed |
| [`package-diagram-source`](package-diagram-source.yaml) | The change's bound, then the members of each functional area it touches |
| [`sequence-diagram-source`](sequence-diagram-source.yaml) | The change's bound, then the ordered trace of each flow it runs through |
| [`change-risk-assessment`](change-risk-assessment.yaml) | The symbol's blast radius, the diff's own rating, and both as a share of the traced whole |

## Over a codebase

| Routine | Runs |
|---------|------|
| [`area-comprehension`](area-comprehension.yaml) | Name the graph, bring it current, find the area's flows, read each symbol and each trace |
| [`symptom-trace`](symptom-trace.yaml) | Rank the symptom, read the suspect, trace its flows, and follow the chains that reach it |
| [`restructure-surface`](restructure-surface.yaml) | What the symbol reaches, and what reaches it |

## Over an index

| Routine | Runs |
|---------|------|
| [`graph-for-tree`](graph-for-tree.yaml) | Name the graph covering a tree, build one where the inventory covers it with none, name it again |
| [`index-refresh`](index-refresh.yaml) | Read the staleness, rebuild where it is behind, read again |
| [`group-refresh`](group-refresh.yaml) | Read how each member stands, pair the ones behind with the tree each sits in, rebuild those, then rebuild the contract registry |

## Stopping for a decision

A technique is session-blind, so a run that puts something in front of a person is the one shape only a routine holds.

| Routine | Gates on |
|---------|----------|
| [`pre-edit-impact-gate`](pre-edit-impact-gate.yaml) | A measured blast radius, where the rating is high or critical, before an edit lands |
| [`guarded-rename`](guarded-rename.yaml) | The previewed edit list, before the rename writes it |

---

## Reference convention

A run is reached **qualified** — `gitnexus::<run>` — from anywhere outside the namespace, and its body names this namespace's operations qualified too, because a bare reference resolves in the workflow the run is spliced into rather than here.
