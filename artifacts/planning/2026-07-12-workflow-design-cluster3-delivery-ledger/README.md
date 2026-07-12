# Cluster 3 — Delivery Ledger — Design Session

**Created:** 2026-07-12
**Mode:** Update (design of the workflow-server delivery engine)
**Status:** Planning

---

## 🎯 Executive Summary

Design session for **cluster 3** of epic [#189](https://github.com/m2ux/workflow-server/issues/189) (schema/technique/disclosure review repeat-pass backlog). Cluster 3 is server-only and covers two delivery-engine optimisations that share the same module chain:

- **C2 — block-level delivery ledger** (friction R2, ▲ high): the largest remaining repetition is *inside* composed `get_technique` payloads — the `inherited_inputs`/`rules`/`inherited_outputs` blocks differ per payload so B1's whole-payload hash never matches, re-delivering ≈131k chars/walk (~25% of technique delivery). Hash each block independently and emit unchanged-markers under the same persistent/opt-in semantics with a `full: true` escape.
- **C12 — get_workflow slimming** (friction R12, ○ low): the orchestrator bundle (55k wp / 33k ponytail) is always full, outside the ledger, re-paid on resume. Ledger it under persistent mode so resumes reference it.

This session produces a **server-feature design spec**; implementation ships as a separate server PR afterward (as clusters 1 & 2 did). The carried bits (C1's `get_technique` reference opt-in, C6's marker unification) already shipped in cluster 1 (#208).

---

## Design Decisions

Resolved under delegated authority (see [03-assumptions-log.md](03-assumptions-log.md); reversible, non-stakeholder-dependent). Consolidated design goes to the user at the design-approval gate.

- **C2 blocks** = inherited contract (`inherited_inputs` + `inherited_outputs`) + `rules`; technique-specific core stays whole (DP-1).
- **Content-keyed** block ledger (`contract:<hash>`, `rules:<hash>`), refining the eval report's id-keyed sketch — auto-invalidates on contract change, handles per-step annotation variance, matches existing content-keyed blocks (DP-2).
- **Opt-in** under B1 semantics (persistent / `bundle:reference`; `full:true` escape); default & worker sessions unchanged (DP-3).
- Reuses the canonical `unchangedMarker` shape — no new dialect (DP-4).
- **Layers under** the whole-technique key; applied at the **composition/projection layer** so get_technique + get_activity eager bundling both benefit (DP-5, DP-6).
- **C12**: single whole-ops-bundle content-key (`workflow_bundle:<hash>`) under persistent mode; minimal, channel-isolated, free when unused (DP-7, DP-8).

---

## Compliance Findings

*Severity-rated findings from quality review / post-update review, populated when those activities run.*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Low | Block-dedup helper should operate on the projected record, not the typed `Technique` | 06-design-spec.md §2.6 | Fixed |

---

## Scope Manifest

*Files/modules the design targets, confirmed during scope-and-draft. Placeholder until then.*

---

## 📊 Activity Progress

| # | Activity | Status |
|---|----------|--------|
| 01 | Intake and Context | ✅ Complete |
| 03 | Requirements Refinement | ✅ Complete |
| 05 | Impact Analysis | ✅ Complete |
| 06 | Scope and Draft (design spec) | ✅ Complete |
| 08 | Quality Review | ✅ Complete |
| 09 | Validate and Commit | ◐ In Progress |
| 10 | Post-Update Review | ⬚ Pending |
| 11 | Retrospective | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Epic | [#189](https://github.com/m2ux/workflow-server/issues/189) |
| Friction register | [evaluation-report.md](../2026-07-08-schema-technique-disclosure-review-repeat/evaluation-report.md) (R2, R12) |
| Measurements | [payload-measurements.md](../2026-07-08-schema-technique-disclosure-review-repeat/payload-measurements.md) (§5, §7) |
| Cluster 1 (sibling) | [design session](../2026-07-10-workflow-design-cluster1-guidance-docs/README.md) |

---

**Status:** Planning
