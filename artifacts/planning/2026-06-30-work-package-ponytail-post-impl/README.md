# work-package — Design Session

**Created:** 2026-06-30  
**Mode:** Update  
**Status:** Planning

---

## 🎯 Executive Summary

This session updates the `work-package` workflow to add a new post-implementation **ponytail** lean-coding-audit stage that runs after the `implement` activity. The stage applies the existing standalone `ponytail` workflow's over-engineering review and ponytail-debt harvest to the just-implemented change, so deliberate leanness is reviewed and tracked before the work proceeds to validation and strategic review.

---

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses (activity sequencing, checkpoint necessity, technique bindings, rule enforcement). Left as placeholder until requirements refinement populates it.*

Initial context observations (to be confirmed and elaborated in requirements refinement):

- **Distinction from `strategic-review`.** `work-package` already has a `strategic-review` activity (`11-strategic-review.yaml`) whose `review-scope` step ensures "changes are minimal and focused" and removes over-engineering. The new ponytail stage is NOT that: strategic-review judges whether the *scope* of the change matches the issue (was anything extraneous added). Ponytail instead applies the lazy-senior-developer *lean-coding* lens — tag the change against the over-engineering taxonomy (delete / stdlib / native / yagni / shrink), produce a net-lines scoreboard, and harvest deliberate simplifications as tracked `ponytail:` debt markers — against a non-negotiable safety floor. The two are complementary, not duplicative; the design must articulate this boundary explicitly.
- **Placement.** Requested to run after `implement`. The `implement` activity transitions to `post-impl-review`, which transitions to `validate`, then `strategic-review`. Exact insertion point (immediately after implement vs. after post-impl-review) is a requirements-refinement decision.
- **Integration pattern (convention).** `work-package` activities bind cross-workflow techniques directly via `<workflow>::<technique>` references (e.g. `cargo-operations::run-suite`, `review-assumptions::reconcile`, `gitnexus-operations::detect-changes`). `dispatch_child` is used only by the `meta` orchestrator, not inside `work-package`. The convention-following design for the ponytail stage is a new `work-package` activity that binds `ponytail`'s standalone techniques cross-workflow (`ponytail::review-over-engineering`, `ponytail::harvest-debt`, `ponytail::report-gain`, etc.), reusing `ponytail/resources/*`, rather than dispatching ponytail as a child workflow.

---

## Compliance Findings

*Severity-rated findings from quality review / post-update review, populated when those activities run. "No findings" until then.*

6 findings (0 Critical) — all dispositioned `revise` and Fixed; re-audited clean. Full detail in [08-quality-review.md](08-quality-review.md).

| Severity | Finding | Location | Fix applied | Status |
|----------|---------|----------|-------------|--------|
| Major | `has_debt_markers` description names nonexistent step `harvest-markers` | `workflow.yaml` | renamed to `harvest-debt` (+ mirrored in remediate-vuln) | ✅ Fixed |
| Major | `simplification-apply-cycle` doWhile is single-pass; `maxIterations: 3` is dead | `09-lean-coding-audit.yaml` | `reset-simplification-flag` → `reassess-simplification` (re-scores, re-raises flag) — real bounded cycle | ✅ Fixed |
| Major | apply-cycle could mutate code in review mode (un-gated) | `09-lean-coding-audit.yaml` | checkpoint `condition` + loop `when` gated on `is_review_mode != true`; read-only steps still run; review-mode.md updated | ✅ Fixed |
| Moderate | rule `audit-after-implement-before-review` restates transition order (AP-24/38) | `workflow.yaml` | deleted | ✅ Fixed |
| Minor | activity `description` paragraph restates step sequence (AP-38) | `09-lean-coding-audit.yaml` | reduced to one WHAT line | ✅ Fixed |
| Minor | `outcome[]` entries carry consumer/loop-mechanics tails (AP-66) | `09-lean-coding-audit.yaml` | rewritten as delivered value | ✅ Fixed |

---

## Scope Manifest

Authored during scope-and-draft. 12 files in the confirmed manifest + 2 follow-on files surfaced by validation. Full detail in [06-scope-and-draft.md](06-scope-and-draft.md). Non-destructive throughout — one new activity + renumber + additive rules/variables/doc rows; no existing content removed.

| File | Action |
|------|--------|
| `workflows/work-package/workflow.yaml` | modify — v3.13.0→3.14.0; +5 rules; +3 variables |
| `workflows/work-package/activities/09-lean-coding-audit.yaml` | create — NEW activity |
| `workflows/work-package/activities/08-implement.yaml` | modify — transition →lean-coding-audit |
| `09-/10-/11-/12-/13-/14-*.yaml` (6 downstream) | rename (git mv) →10-/11-/12-/13-/14-/15- |
| `workflows/work-package/README.md` | modify — tables, mermaid, prefixes, version |
| `workflows/work-package/activities/README.md` | modify — new §09 + renumber 10-15 |
| `workflows/work-package/resources/review-mode.md` | modify — renumber 2 activity-file refs |
| `workflows/remediate-vuln/workflow.yaml` | modify (follow-on) — repoint 4 imports, splice lean-coding-audit, +3 variables |
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | regenerate (follow-on) — 6 work-package walk baselines |

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Pattern Analysis | Create, Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ⬚ Pending |
| 10 | Post-Update Review | Update | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Related workflow (source of stage) | [ponytail](../../../../workflows/ponytail/README.md) |

---

**Status:** Quality review complete — disposition `revise` applied. All 6 findings (0 Critical) Fixed via the bounded audit-fix-cycle and re-audited clean (`needs_audit_fixes = false`, `has_critical_finding = false`). All guards + schema validation + `check-all-refs` green; `tsc --noEmit` clean; `vitest run` 363 passed / 0 failed; e2e snapshot regenerated (review-mode lean-coding-audit checkpoint now suppressed). No blocker — blocker-gate clears to validate-and-commit. Ready to transition.
