# Requirements Refinement — substrate-node-security-audit gitnexus/prism update

**Mode:** Update · **Change spec:** [08-quality-review.md](08-quality-review.md) (8 findings, user-approved "fix all")

## Design dimensions (update mode)

| Dimension | Captured requirement | Confirmed |
|-----------|----------------------|-----------|
| **Purpose** | Unchanged — fully automated multi-phase AI security audit for Substrate-based blockchain node codebases. gitnexus adoption is **additive analysis capability**, not a purpose/domain/value change. | ✅ (delegated) |
| **Activity list** | Unchanged set — 7 main-flow + 7 sub-agent activities; **no activity added, removed, or renamed**; transition graph and `initialActivity` (`scope-setup`) preserved. Edits land inside existing activities: F2 adds an index step to `scope-setup`; F3 enriches `reconnaissance`; F4/F5/F6/F7/F8 touch techniques + resources those activities bind. | ✅ (delegated) |
| **Checkpoints** | Unchanged — **0 user checkpoints; the workflow stays FULLY AUTOMATED by design**. Every gitnexus step gates on the structural boolean `gitnexus_available` (set by `analyze`), NOT on a new user decision gate. | ✅ (delegated) |
| **Artifacts** | Unchanged — audit report + gap analysis. gitnexus enrichment changes *how* recon/analysis data is produced, not *which* run artifacts exist; none added, none removed. | ✅ (delegated) |
| **Rules** | **Touched:** add one workflow rule mandating graph-first structural analysis with grep/manual fallback (mirrors `meta.gitnexus-operations.must-use-operations` at the workflow level); F7 codifies the grep↔gitnexus boundary in `static-analysis-patterns`; F8 preserves the full-file-read stance. One new gate variable `gitnexus_available`. | ✅ (delegated) |

**Version bump:** minor (4.17.0 → 4.18.0) — additive, gated, no schema/contract break, no activity add/remove/rename, no variable-contract break.

**Delegated-authority note:** the change spec was pre-confirmed by the user's "fix all" disposition, so the five dimension-confirmed gates were resolved from the spec (internal technical gates), not surfaced as fresh user questions. Material/outward-facing gates (final draft approval, commit/push/PR) remain reserved for the user at scope-and-draft / validate-and-commit.

## Design assumptions log

| ID | Category | Assumption | Risk | Resolvability | Outcome |
|----|----------|------------|------|---------------|---------|
| RA-1 | Schema Construct Choice | Version bump is **minor** (4.17.0 → 4.18.0): all edits additive/gated within the existing schema. | Low | Reversible | **Accept** |
| RA-2 | Rule Scope | All gitnexus paths gate on `gitnexus_available`, with the existing grep/manual method retained as the fallback branch (non-destructive, Principle 12). | Low | Reversible | **Accept** |
| RA-3 | Technique Selection | gitnexus enrichment scope = `map-codebase` + `analyze-architecture` (recon), `build-function-registry` (enumeration), `verify-sub-agent-output` (coverage denominator), and the **structural subset** of mechanical checks (Ch1/3/5/15/16/17/29/31/32 + storage-lifecycle pairing). grep retained for pattern-presence. | Medium | Reversible | **Accept** — boundary from [08-quality-review.md](08-quality-review.md) Inventory B classification |
| RA-4 | Schema Construct Choice | Reference form: canonical hyperlink `[gitnexus-operations](...)::[op](...)` in technique prose (Form A); `technique: { name: gitnexus-operations::<op>, inputs }` in activity YAML (Form B). Per AP-48/AP-53 + prism-audit precedent. | Low | Reversible | **Accept** |
| RA-5 | Activity Boundaries | `analyze` indexes the **monorepo root** (one unified index per `gitnexus-operations` rule), while the audit scopes to `target_submodule`. Reconcile by pointing `analyze` at the repo root and scoping queries to the in-scope submodule paths. | Medium | Reversible | **Accept** — reconciliation recorded for scope-and-draft |
| RA-6 | Activity Boundaries | No new activities; F2's index-build step is added to the existing `scope-setup` activity (alongside `setup-audit-target`). | Low | Reversible | **Accept** |
| RA-7 | Rule Scope | The deliberate "read full function bodies / >200-line coverage gate" philosophy is **preserved**; gitnexus augments enumeration + relational tracing, never replaces body-reading for pattern-absence findings (F8). | Low | Reversible | **Accept** |

No assumptions deferred; all are internal technical design judgements resolvable from the change spec and evidence. Goal-1 (no prism rebuild) is a settled decision, not an open assumption.

**Requirements confirmed** across all five update-mode dimensions.
