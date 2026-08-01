# Scope Manifest — Bind gitnexus graph operations into workflow-authoring

**Target:** `workflow-authoring` v1.1.0 → v1.2.0 · **Mode:** Update
**Basis:** [Change brief](01-change-brief.md) · [Impact analysis](01-impact-analysis.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-workflow-authoring-pr-375/` — present, on branch `workflow/workflow-authoring-gitnexus-bindings` (off `origin/workflows` @ 46bc1811; `workflow-authoring/` byte-identical there to the brief's 703817ef baseline)

0 files created, 11 modified, 0 removed. Preserved instead of removed: 0 — the [removals inventory](01-impact-analysis.md#3-removals-inventory) is empty.

---

## File manifest

| # | Path (under `workflow-authoring/`) | Kind | Action | One-line change |
|---|-------------------------------------|------|--------|-----------------|
| 1 | `workflow.yaml` | root | modify | Version 1.1.0 → 1.2.0; declare the eight graph-op variables the new bindings land (`gitnexus_indexed`, `index_stale`, `graph_stats`, `query_report`, `scope_findings`, `impact_report`, `orphan_candidates`, `change_report`) |
| 2 | `activities/01-intake-and-context.yaml` | activity | modify | Add `verify-graph-index` step (`gitnexus-operations::verify-index`, `repo_name` literal `workflows`, step action sets `gitnexus_indexed`) after `derive-target-path`, and `survey-prior-art` step (`gitnexus-operations::query`, `search_query` template `{workflow_id}`) before `synthesize-change-brief`, gated update-mode + indexed; bump version |
| 3 | `activities/06-scope-and-draft.yaml` | activity | modify | Add `check-scope-discipline` step (`gitnexus-operations::scope-discipline-check`, `requirements_scope` ← `scope_manifest`) after the file-drafting loop, gated on confirmed manifest + indexed; bump version |
| 4 | `activities/08-quality-review.yaml` | activity | modify | Add `scan-orphans` (`gitnexus-operations::orphan-scan`, same-name `changed_files` from `reload-workflow`) and `map-consumer-impact` (`gitnexus-operations::impact`, `target` ← `target_workflow_id`, `direction` literal `upstream`) inside the target-sweep loop between `rebind-target-baseline` and `resolve-consumer-surface`, gated on indexed; bump version |
| 5 | `activities/09-validate-and-commit.yaml` | activity | modify | Add `detect-graph-changes` step (`gitnexus-operations::detect-changes`) directly before `verify-scope-manifest`, gated on the same commit-path conditions + indexed; bump version |
| 6 | `techniques/workflow-definition/intake-classification.md` | technique | modify | `## Rules` gains a graph-first-baseline rule: reference/usage claims for the baseline come from the bound graph ops when `{gitnexus_indexed}`, prose claims stay with text search; bump metadata version |
| 7 | `techniques/workflow-definition/audit-canon.md` | technique | modify | `## Rules` gains a graph-evidence rule: consumer-surface and reference traversal take `{impact_report}` and `{orphan_candidates}` as evidence when present, prose criteria stay read-based; bump metadata version |
| 8 | `techniques/workflow-definition/scope-verification.md` | technique | modify | `## Rules` gains a changed-set-source rule: the direction-2 changed-file set comes from `{change_report}` when present, else from git diff; bump metadata version |
| 9 | `techniques/workflow-definition/commit-verification.md` | technique | modify | Add `## Rules` with a completeness cross-check rule: the commit's file list is checked against `{change_report}`'s changed files when present; bump metadata version |
| 10 | `techniques/README.md` | readme | modify | Shared-operations table gains a `gitnexus-operations` row naming the six bound ops |
| 11 | `README.md` | readme | modify | Blockquote version line to v1.2.0; add a one-line graph-tooling note (graph-first structural reasoning via `gitnexus-operations`, gated on `{gitnexus_indexed}`) |

**Out of scope this pass:**

- `meta/techniques/gitnexus-operations/` — excluded by the [change brief](01-change-brief.md) (issue #310 items 2–3)
- `techniques/workflow-definition/verify-high-findings.md` — re-derivation stays independent of graph evidence by design; no directive added
- `activities/README.md`, `techniques/TECHNIQUE.md`, `techniques/workflow-definition/TECHNIQUE.md`, all `resources/*` — prose altitude unaffected, per the [impact analysis](01-impact-analysis.md#1-impact-classification)
- Bindings in any other workflow; server code; schemas; `embeddings: 0` investigation (#310 Part 2)
- `scripts/binding-fidelity-triage.json` (host repo, main-branch side) — the guard suite wants three new `harmless`/`shared-op-caller-argument` entries and three stale `dead-output` deletions for the newly consumed op outputs; outside the workflows-branch surface this run commits

---

## Structural design

```
workflow-authoring/   # layout unchanged — no file is created, moved or removed
```

**Flow:** transition topology unchanged — no activity added, removed or reordered; all new steps are `when`-gated additions inside existing activities.

Design decisions closing the brief's [open judgements](01-change-brief.md#open-judgements):

1. **Op set (J1):** six ops, one per structural question the activities already ask — `verify-index` + `query` (intake), `scope-discipline-check` (draft), `orphan-scan` + `impact` (review), `detect-changes` (commit); `analyze` is reached only through `verify-index`'s own protocol, never bound directly.
2. **Graph-vs-text scoping (J2):** every added directive scopes graph use to path/reference/structure questions and leaves prose claims to text search, citing `gitnexus-operations`' own `query-not-grep` rule rather than restating it.
3. **Staleness gating (J3):** `verify-index` runs once at intake and lands `{gitnexus_indexed}`; every graph-bound step gates `when: gitnexus_indexed == true` (work-package precedent), and staleness-sensitive ops rely on the group's `index-freshness-first` rule plus each op's in-protocol stale handling; change detection still runs on the commit path.

| Convention | This change |
|------------|-------------|
| File naming | No new files; existing `NN-name.yaml` / kebab-case `.md` names untouched |
| Field ordering | New steps follow sibling step shape (`kind`, `id`, `technique`, `when`, `actions`) |
| Version format | Semantic bumps — workflow 1.2.0 (minor), modified activities 1.1.0, modified technique metadata 1.1.0 |
| Transition patterns | Untouched |
| Checkpoint structure | Untouched — no checkpoint added or changed |
| Technique structure | New directives land as named `## Rules` entries on receiving surfaces (AP-23 placement); no `workflow.yaml` rule additions |
| Cross-group references | Written qualified — `gitnexus-operations::<op>`; structured `step.technique` carries only deviations |

---

## Drafting order

1. **Root definition** (`workflow.yaml`) — declares the variables every new binding lands, so no step references an undeclared name
2. **Activities** (`01`, `06`, `08`, `09`) — the graph-op-bound steps that land those variables
3. **Techniques** (four rule surfaces) — directives citing the outputs the steps land
4. **READMEs** (`techniques/README.md`, then root `README.md`) — catalogs state what the tree then contains
