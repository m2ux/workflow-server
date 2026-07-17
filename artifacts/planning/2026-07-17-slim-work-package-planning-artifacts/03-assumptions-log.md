# Design Assumptions Log

**Workflow:** work-package
**Mode:** Update
**Created:** 2026-07-17
**Last Updated:** 2026-07-17

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 1 | 0 | 1 | 0 | 0 |
| Checkpoint Necessity | 1 | 0 | 1 | 0 | 0 |
| Variable State | 1 | 0 | 1 | 0 | 0 |
| Technique Selection | 1 | 0 | 1 | 0 | 0 |
| Rule Scope | 1 | 1 | 0 | 0 | 0 |
| **Total** | **5** | **1** | **4** | **0** | **0** |

---

## Log

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Activity Boundaries | L | open | No activities added, removed, or reordered; slim work stays inside existing activities. | Change is checkpoint-message and persist-contract hygiene, not lifecycle redesign. Alternatives: new hygiene activity (rejected — overfit). | ✅ Confirmed | User (`spec-confirmed`) |
| A-2 | Checkpoint Necessity | L | open | Message/description text only — no options, effects, or routing change. | Topology stays intact per design intent. Alternatives: drop/merge gates (out of scope). | ✅ Confirmed | User (`spec-confirmed`) |
| A-3 | Variable State | M | open | Defer new `*_path` workflow variables; link only where a path var already exists (`change_block_index`, `provenance_log_path`). | Wiring path vars for remaining artifacts is a larger change than message-only. Alternatives: add `*_path` vars now (deferred follow-up). | ✅ Confirmed | User (`spec-confirmed`) |
| A-4 | Technique Selection | L | open | Persist-technique audit is confirm-only; edit protocols only if impact analysis finds drift from `manage-artifacts` rules. | work-package already has Output Economy backbone; gap is mainly gate messages. Alternatives: rewrite all persist protocols to match workflow-design PR #254 file-for-file (rejected — different baseline). | ✅ Confirmed | User (`spec-confirmed`) |
| A-5 | Rule Scope | L | audit | No new `workflow.yaml` `rules[]` slug — Output Economy already encoded in `manage-artifacts` rules. | Duplicate rule risks drift. Alternatives: add workflow-level rule now. | ✅ Validated | Audit: `techniques/manage-artifacts/TECHNIQUE.md` carries `single-source-and-link`, `canonical-home-map`, `exception-only-reporting`, `state-once-per-artifact`, `lean-header`, `omit-null-sections` |
