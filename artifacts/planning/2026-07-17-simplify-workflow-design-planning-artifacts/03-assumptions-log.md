# Design Assumptions Log

**Workflow:** workflow-design  
**Mode:** Update  
**Created:** 2026-07-17  
**Last Updated:** 2026-07-17

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 1 | 0 | 1 | 0 | 0 |
| Checkpoint Necessity | 1 | 0 | 1 | 0 | 0 |
| Technique Selection | 1 | 0 | 1 | 0 | 0 |
| Rule Scope | 1 | 1 | 0 | 0 | 0 |
| **Total** | **4** | **1** | **3** | **0** | **0** |

---

## Log

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Activity Boundaries | L | open | No activities are added, removed, or reordered; lean-artifact work stays inside existing activities. | Change is content-contract and checkpoint-surface hygiene, not lifecycle redesign. Alternatives: split a “planning-artifact hygiene” activity (rejected — overfit). | ✅ Confirmed | User (`spec-confirmed`) |
| A-2 | Checkpoint Necessity | M | open | Multi-finding gates (esp. quality-review) primary-link the rolled-up report (or verified findings); satellite finding files are not listed in the gate message. | Stacked peer links overload the decision. Alternatives: keep multi-link messages; merge all findings into one file only. | ✅ Confirmed | User (`spec-confirmed`) |
| A-3 | Technique Selection | M | open | Persist-step protocols name the decision-facing facts to write; they do not say “persist the full survey.” | Writers follow protocol text; vague “full” dumps recreate sprawl. Alternatives: lean templates only, leave protocols generic. | ✅ Confirmed | User (`spec-confirmed`) |
| A-4 | Rule Scope | L | audit | Encode Output Economy / lean-artifact constraints in `design-principles`, README/resources, and persist protocols — no new `workflow.yaml` `rules[]` slug unless drafting proves discoverability fails. | Principle §11 already owns the invariant; a duplicate rule risks drift. Alternatives: add a workflow-level rule now. | ✅ Validated | Audit: `resources/design-principles.md` §11 Output Economy present; strengthen in place per confirmed spec |
