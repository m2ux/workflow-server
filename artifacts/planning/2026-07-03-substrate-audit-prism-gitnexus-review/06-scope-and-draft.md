# Scope & Draft — gitnexus/prism update (v4.17.0 → 4.18.0)

**Worktree:** `/home/mike1/projects/work/workflow-server/substrate-audit-gitnexus`
**Branch:** `workflow/substrate-audit-gitnexus` (off `workflows` tip `e802ece2`)
**Drafting order:** workflow.yaml → activities → techniques → resources → README/CHANGELOG

## Scope Manifest (13 modify, 0 create, 0 remove)

| Order | File | Concrete edit |
|-------|------|---------------|
| 1 | `workflow.yaml` | version → 4.18.0; +`gitnexus_available` boolean variable (default false); +1 `rules.workflow` entry: structural analysis routes through `gitnexus-operations` when indexed, grep/full-read the fallback; grep stays for pattern-*presence*, full reads for pattern-*absence* |
| 2 | `activities/01-scope-setup.yaml` | +`kind: technique` step `index-codebase` binding `gitnexus-operations::analyze` (`inputs.repo_path: target_submodule`) with `set gitnexus_available` action (pure bound step, AP-64) |
| 3 | `techniques/map-codebase.md` | +optional `gitnexus_available` input; +`graph-first-when-indexed` rule; weave gitnexus refs into steps 1/3/4/6 (`read-cluster`/`diagram-source-select` cluster structure; `query` functional areas/flows; `cypher` cross-community=trust-boundary edges; `context` fan-in), each gated, manual retained |
| 4 | `techniques/analyze-architecture.md` | +gitnexus enrichment: interaction model / trust boundaries via `cypher` cross-community edges; candidate/privilege ranking via `context` fan-in + `impact` blast radius, gated |
| 5 | `techniques/build-function-registry.md` | +optional `gitnexus_available` input; +seed registry from graph via `cypher` (functions by type/visibility) when indexed; full-read enumeration retained as fallback + body source |
| 6 | `techniques/apply-checklist.md` | l.56 `grep 'fn '` count crosscheck → exact graph symbol count via `gitnexus-operations::cypher` when indexed, else grep |
| 7 | `techniques/verify-sub-agent-output.md` | coverage-gate denominator sourced from gitnexus file/symbol inventory when indexed; reachability reconciliation via `context`/`impact` |
| 8 | `techniques/scan-storage-lifecycle.md` | insert/remove pairing + cross-function invariant via `context`/`cypher` when indexed; grep declaration/site sweep retained as lead-gen |
| 9 | `techniques/search-pattern-catalog.md` | recognise per-entry execution class: PRESENCE → grep; STRUCTURAL → route to the wrapping gitnexus op |
| 10 | `resources/static-analysis-patterns.md` | preamble stating grep↔gitnexus boundary; execution-class annotation on structural checks (Ch1/3/5/15/16/17/29/31/32) |
| 11 | `resources/audit-prompt-template.md` | one stance line: structure→graph, comprehension→full reads, presence→grep (preserves read-EVERY-file philosophy) |
| 12 | `README.md` | "Relationship to prism-audit" divergence note; techniques overview names the reused `gitnexus-operations` group |
| 13 | `CHANGELOG.md` | v4.18.0 entry |

## Reference conventions (AP-48 / AP-53)
- Technique prose (Form A): `[gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[op](../../meta/techniques/gitnexus-operations/op.md)(arg: {var})`
- Activity YAML (Form B): `technique: { name: gitnexus-operations::<op>, inputs: {...} }`
- Rule citations: dotted address `meta.gitnexus-operations.<rule>` (never `::`)

## Guardrails
- **Non-destructive:** every gitnexus path is a `{gitnexus_available}`-gated addition beside the retained grep/manual method. No line of existing analysis logic is deleted.
- **Reuse-first (AP-64):** bind existing meta ops only; no new technique files.
- **Preserve philosophy (F8):** gitnexus augments enumeration + relationships; full-file reading + >200-line coverage gate for pattern-absence findings are untouched.
- **Validation:** after drafting, run `validate-workflow-yaml` (workflow.yaml + 01-scope-setup.yaml), `check-all-refs`, `check-binding-fidelity` against the **worktree** (not the main checkout).
