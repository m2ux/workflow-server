# work-package — Design Session

**Created:** 2026-07-13  
**Mode:** Update  
**Status:** Planning

---

## 🎯 Executive Summary

Implements PR 2 (workflows corpus) of epic [#224 — work-package planning-artifact verbosity reduction](https://github.com/m2ux/workflow-server/issues/224): items V1–V3, V5–V8 across clusters 1, 3, 4, 5. Restructures the work-package templates and coupled techniques to eliminate template-mandated cross-document duplication (target 30–40% fewer markdown lines per run), adds a finalize-boundary conformance gate, consolidates the review artifact cluster, converts agent-state artifacts to structured data, and codifies the anti-patterns into workflow-design.

---

## Design Decisions

- **V5 deferred** — depends on server-side V4 (PR 1), which doesn't exist yet; scope is V1, V2, V3, V6, V7, V8.
- **V1 gate** — new `manage-artifacts::verify-artifact-conforms` op bound in `12-strategic-review` beside `verify-readme`; verify + fix in place, no checkpoint/loop/vars (#197/#218 precedent). Tail artifacts (13/14) conform at write time via their rewritten techniques.
- **V3 canonical-home map** — Problem Statement / Scope / Success Criteria → `requirements-elicitation.md`; Assumptions → `assumptions-log.md`; Design Decisions + planning Risks → `wp-plan.md`; `design-philosophy.md` keeps Problem Classification + 2–4 sentence ticket-derived statement. Map lives once in `manage-artifacts/TECHNIQUE.md`.
- **V6 merge mechanism** — optional findings-destination input on prism `structural-analysis` / ponytail review ops (default = own artifact); work-package call sites point at `code-review.md`. `manual-diff-review.md` merges into `code-review.md`. Consolidated review renders findings by ID + disposition. New lazily-created `deferred-items.md` register.
- **Versioning** — minor bumps: work-package → 3.29.0, workflow-design → 1.8.0 (V8 APs ≈86–89).

Full decision record: [03-assumptions-log.md](03-assumptions-log.md).

---

## Compliance Findings

Quality review (expressiveness / conformance / rule-hygiene / rule-enforcement): 7 findings, all Low — 5 documentation-voice divergences fixed in place (comparative phrasings rewritten as positive declarative), 2 justified rule-imperatives kept. No Critical/High; fix cycle not entered.

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Low | Comparative voice ("instead of / rather than / — not") on 5 added lines | prism/structural-analysis, ponytail/review-over-engineering, manual-diff-review.md, manage-artifacts/TECHNIQUE.md, review-code.md | Rewritten positive-declarative |

---

## Scope Manifest

36 files (34 modified, 2 added) across 4 staged commits in worktree `workflow/224-verbosity-pr2` — full block index with per-file rationale: [06-draft-review.md](06-draft-review.md).

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 05 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ◐ In Progress |
| 10 | Post-Update Review | Update | ⬚ Pending |
| 11 | Retrospective | Create, Update | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Secondary target (V8) | `workflows/workflow-design/` |
| Epic | [m2ux/workflow-server#224](https://github.com/m2ux/workflow-server/issues/224) |
| Related workflow | [workflow-design](../../../../workflows/workflow-design/README.md) |

---

**Status:** Validate and commit — audits clean, awaiting commit sign-off
