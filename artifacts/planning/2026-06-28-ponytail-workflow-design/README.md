# ponytail — Design Session

**Created:** 2026-06-28  
**Mode:** Create  
**Status:** Committed — `workflow/ponytail` @ `76b607c3` (21 files), draft PR [#140](https://github.com/m2ux/workflow-server/pull/140) opened against `workflows`

---

## 🎯 Executive Summary

This session designs a new `ponytail` workflow that encodes the "lazy senior dev" discipline — lazy meaning efficient, not careless; the best code is code never written. The workflow guides an agent through the Ladder (YAGNI → reuse → stdlib → native → installed dep → one line → minimum code that works) while holding a non-negotiable safety floor (problem understanding, input validation, error handling, security, accessibility, the one runnable assert), then exposes the ponytail review/audit/debt/gain operations. The session is being run to translate the upstream ponytail skills and MCP-server single-source instruction model into a schema-correct workflow-server workflow.

---

## Design Decisions

Per-dimension design decisions and the full assumption reconciliation/interview record live in [03-assumptions-log.md](03-assumptions-log.md). Summary:

- **Purpose** — drive a coding task/change/repo to the leanest solution clearing a non-negotiable safety floor, with deferrals tracked as `ponytail:` debt.
- **Activities (5)** — `intake-and-scope` → `apply-ladder` → `over-engineering-review` → (`repo-audit`, optional, gated on `intensity == ultra` or `scope == repo`) → `harvest-debt-and-report`.
- **Checkpoints (3)** — `intensity-and-scope-confirmed` (intake), `safety-floor-cleared` (blocking, apply-ladder), no gates on the read-only reporting passes.
- **Variables** — `task_description`, `target_path`, `intensity` (lite/full/ultra, plain string), `scope` (change/repo), `safety_floor_cleared`, `has_debt_markers`.
- **Techniques** — workflow-local `ponytail-operations` group (apply-ladder, review-over-engineering, audit-repo, harvest-debt, report-gain) + reused meta `scatter-gather` / `variable-binding`.
- **Resources** — single-source `the-ladder.md`, `review-taxonomy.md`, `ponytail-marker-convention.md`, `honesty-boundary.md`.
- **Rules** — safety floor never simplified (structural checkpoint), understand-before-build (activity ordering), honesty boundary on reporting (technique rule + resource); output-discipline / root-cause / take-higher-rung as technique guidance.

Eight surfaced assumptions were settled autonomously by audit passes; four genuine design judgements (PA-10, PA-2, PA-11, PA-1) were presented at the assumption-interview checkpoints and all **accepted** — no assumption was rejected or deferred (`has_deferred_assumptions = false`).

---

## Compliance Findings

*Severity-rated findings from quality review / post-update review, populated when those activities run. "No findings" until then.*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Critical (F1) | Safety floor was a no-op gate — the sole exit transition was `isDefault: true` carrying `condition: safety_floor_cleared == true`; the engine ignores conditions on default transitions, so the workflow exited even when the floor was not cleared. | `02-apply-ladder.yaml` | ✅ Fixed — restructured into a `kind: loop` (`doWhile`, continuation `condition: safety_floor_cleared == false`, `maxIterations: 5`) wrapping climb + blocking checkpoint; exit transition is now unconditional. Re-climb is the next loop iteration. |
| Medium (F2) | Orphan `intensity_and_scope_confirmed` variable (YAGNI) — set by all 4 intake checkpoint options but read by no transition/condition; the intake checkpoint is already `blocking: true`. | `workflow.yaml`, `01-intake-and-scope.yaml`, `README.md` | ✅ Fixed — variable declaration, 4 `setVariable` entries, and README row removed. Intake decision still enforced by the blocking checkpoint. |

---

## Scope Manifest

The confirmed manifest and per-file drafting spec live in [06-scope-manifest.md](06-scope-manifest.md). All 20 entries under `workflows/ponytail/` were drafted (1 `workflow.yaml` + 5 activities + 1 group base + 6 op files + 4 resources + 4 READMEs) and pass schema validation and the binding/identifier/step-purity/artifact checks.

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Pattern Analysis / Impact Analysis | Create / Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete (re-entered — F1/F2 surgical fix applied) |
| 08 | Quality Review | All | ✅ Complete (re-audit passed) |
| 09 | Validate and Commit | All | ✅ Complete (committed `76b607c3`, draft PR #140) |
| 10 | Post-Update Review | Update | ⬚ Skipped (create mode) |
| 11 | Retrospective | All | ✅ Complete (completion summary + retrospective recorded) |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/ponytail/` |
| Related workflow | [prism](../../../../workflows/prism/README.md) |
| Branch | `workflow/ponytail` @ `76b607c3` |
| Pull request | [#140](https://github.com/m2ux/workflow-server/pull/140) (draft, base `workflows`) |
| Completion summary | [11-COMPLETE.md](11-COMPLETE.md) |
| Retrospective | [11-workflow-retrospective.md](11-workflow-retrospective.md) |

---

**Status:** Closed — design complete; `workflow/ponytail` @ `76b607c3` (21 files), draft PR [#140](https://github.com/m2ux/workflow-server/pull/140) against `workflows`. Completion summary + retrospective recorded ([11-COMPLETE.md](11-COMPLETE.md), [11-workflow-retrospective.md](11-workflow-retrospective.md)).
