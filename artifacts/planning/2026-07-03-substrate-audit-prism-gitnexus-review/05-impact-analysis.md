# Impact Analysis — gitnexus/prism update (v4.17.0 → 4.18.0)

**Update mode confirmed.** All changes are **additive and gated on `gitnexus_available`**, with the existing grep/manual method retained as the fallback branch. **Zero content removals.**

## Files directly modified

| File | Finding | Change | Removal? |
|------|---------|--------|----------|
| `workflow.yaml` | F2/F7 | +`gitnexus_available` variable; +1 workflow rule (graph-first structural analysis w/ grep fallback, mirroring `meta.gitnexus-operations.must-use-operations`); version → 4.18.0 | No |
| `activities/01-scope-setup.yaml` | F2 | +1 step binding `gitnexus-operations::analyze` (`inputs.repo_path` = monorepo root) with a `set gitnexus_available` action; index-freshness via `verify-index` | No (new step) |
| `techniques/map-codebase.md` | F3 | +`gitnexus_available` input; +gitnexus-enrichment protocol bullets (component/cluster structure via `read-cluster`/`diagram-source-select`; functional areas/flows via `query`; boundaries/trust via `cypher` cross-community edges; fan-in via `context`), each gated + manual fallback | No (append) |
| `techniques/analyze-architecture.md` | F3 | +gitnexus enrichment for interaction model (cross-community edges = trust boundaries), privilege/candidate ranking via `context` fan-in + `impact` blast radius, gated | No (append) |
| `techniques/build-function-registry.md` | F4 | +gitnexus seeding of the registry (`cypher` enumeration by type/visibility when available), gated; registry base still full-read | No (append) |
| `techniques/apply-checklist.md` | F4 | l.56 `grep 'fn '` count crosscheck → prefer exact graph symbol count when `gitnexus_available` | No (reword) |
| `techniques/verify-sub-agent-output.md` | F5 | coverage-gate denominator sourced from gitnexus file/symbol inventory when available; reachability reconciliation via `context`/`impact` | No (append) |
| `techniques/scan-storage-lifecycle.md` | F6 | insert/remove pairing + cross-function invariant via `context`/`cypher` when available; grep declaration/site sweep retained as lead-gen | No (append) |
| `techniques/search-pattern-catalog.md` | F6/F7 | recognise a per-entry execution class: PRESENCE → grep; STRUCTURAL → route to gitnexus op | No (append) |
| `resources/static-analysis-patterns.md` | F6/F7 | preamble stating the grep↔gitnexus boundary; per-entry execution-class annotation on the structural checks (Ch1/3/5/15/16/17/29/31/32) | No (annotate) |
| `resources/audit-prompt-template.md` | F8 | one stance line: structure→graph, comprehension→full reads, presence→grep (preserves the read-EVERY-file philosophy) | No (add line) |
| `README.md` | F1/F3 | "Relationship to prism-audit" divergence note; techniques overview mentions the reused `gitnexus-operations` group | No (add) |
| `CHANGELOG.md` | all | v4.18.0 entry | No (add) |

## Files created / removed

- **Create:** none. **Reuse-first (AP-64):** every codebase-analysis need binds an *existing* `gitnexus-operations` meta op — no new technique files.
- **Remove:** none. Non-destructive by construction.

## Indirectly affected / references to verify

- **Cross-workflow refs:** new `gitnexus-operations::<op>` bindings (Form B in `activities/01-scope-setup.yaml`) and canonical hyperlinks (Form A in techniques) must resolve — from `techniques/*.md` the path is `../../meta/techniques/gitnexus-operations/<op>.md`. `check-all-refs.ts` must pass.
- **Binding fidelity:** `gitnexus_available` must be a declared `workflow.yaml` variable so `when` gates and `set` targets resolve; `check-binding-fidelity.ts` must show no new drift (re-baseline if the new gitnexus bindings are flagged as intentional).
- **Schema:** `validate-workflow-yaml.ts` on `workflow.yaml` + `activities/01-scope-setup.yaml` (new step must be a pure bound step per AP-64 — `kind`+`id`+`technique`+`actions`, no `description`/`name`).
- **No transition-graph change**, no `initialActivity` change, no activity add/remove/rename → main-flow wiring intact.
- **RA-5 reconciliation:** `analyze` indexes the monorepo root; queries scope to the in-scope submodule paths. The audit's `target_submodule`/`in_scope` variables are unchanged; `repo_path` for `analyze` resolves to the repo root.

## Impact-confirmed & Preservation-confirmed

- **Impact scope:** bounded to the 13 files above; blast radius contained (additive, gated); references known-intact once Form A/B paths are written correctly. **Confirmed** (internal technical gate — delegated).
- **Preservation:** **no content is removed or replaced** — every gitnexus path is an added, availability-gated branch beside the retained grep/manual method; grep stays for pattern-presence; full-file reading + coverage gate preserved (F8). No removals to confirm. **Confirmed** (delegated).

**Both impact-analysis checkpoints resolved under delegated authority** — no removals or scope surprises to surface. The material gate (final scope/approach + commit/PR) is reserved for scope-and-draft / validate-and-commit.
