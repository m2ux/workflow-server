# workflow-design — Design Session

**Created:** 2026-07-10
**Mode:** Update (via Review — fix-issues)
**Status:** Planning

---

## 🎯 Executive Summary

Self-audit of the workflow-design workflow (v1.6.0) against current library conventions (work-package v3.28.0 baseline, AP-1..85 catalog) produced 30 compliance findings. The user selected fix-issues (fix ALL identified issues), flipping the session to update mode: the compliance report is now the change specification for a full remediation update of `workflows/workflow-design/`.

---

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses (activity sequencing, checkpoint necessity, technique bindings, rule enforcement). Left as placeholder until requirements refinement populates it.*

---

## Compliance Findings

30 findings (0 Critical / 8 High / 13 Medium / 9 Low) — authoritative list with locations and fixes in the [compliance report](08-compliance-review.md).

| Severity | Count | Headline items |
|----------|-------|----------------|
| High | 8 | H1 scrambled drafting loop, H2 inverted scope gate, H3 dead preservation guard, H4/H5 undeclared outputs, H6 activity rules blocks (AP-62), H7 worker-role conflict, H8 misfiled worker rules (AP-71) |
| Medium | 13 | M1–M13: orphaned variables, `{create/update}` interpolation, monolith technique, doc drift, AP-44/84/85 resource findings, double commit, gate-flip hazard |
| Low | 9 | L1–L9: vestigial markers, stale vocabulary, baselined binding debt, template gaps |

---

## Scope Manifest

*Files to create, modify, or remove for this workflow, confirmed during scope-and-draft. Left as placeholder until then.*

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ⬚ Pending |
| 05 | Impact Analysis | Update | ⬚ Pending |
| 06 | Scope and Draft | Create, Update | ⬚ Pending |
| 08 | Quality Review | All | ✅ Complete — [compliance report](08-compliance-review.md) (review pass) |
| 09 | Validate and Commit | All | ⬚ Pending |
| 10 | Post-Update Review | Update | ⬚ Pending |
| 11 | Retrospective | All | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/workflow-design/` |
| Reference baseline | [work-package](../../../../workflows/work-package/README.md) (v3.28.0) |

---

**Status:** Intake complete — ready for requirements refinement (update pass)
