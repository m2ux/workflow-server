# work-package — Design Session

**Created:** 2026-07-08  
**Mode:** Update  
**Status:** ✅ COMPLETE — close-out recorded ([11-COMPLETE.md](11-COMPLETE.md)). Committed (ca6ad520), pushed, draft PR [#192](https://github.com/m2ux/workflow-server/pull/192) open against `workflows`. Workflow finished.

---

## 🎯 Executive Summary

Fixing four findings in the `work-package` workflow's `strategic-review` activity (`activities/12-strategic-review.yaml`, checkpoint `review-findings`). A scoped compliance review found the checkpoint presents fix/defer/more-review options even when the review is finding-free, offers no priority-based selective disposition, silently auto-accepts real findings after 30s, and carries a `defer-findings` option behaviorally identical to `acceptable`. This update-mode session applies all four fixes.

---

## Design Decisions

Requirements refined; see [03-assumptions-log.md](03-assumptions-log.md) for the full reconciliation.

- **A1 (finding-free routing) — Option B, user-accepted:** the `strategic-findings-analysis` technique emits `review_passed: true` on the finding-free path; the `review-findings` checkpoint gains the `strategic_findings_summary != ""` condition so it auto-dismisses when clean. Workflow-level `review_passed` default stays `false`.
- **WP-SR-02:** add a `selective-fixes` option (mirror `workflow-design` `review-disposition`) setting `needs_strategic_fixes: true` + `strategic_fixes_selective: true`; per-priority selection deferred to the downstream fix path reading `strategic_findings_summary`.
- **WP-SR-03:** findings-present checkpoint becomes `blocking: true`, `autoAdvanceMs`/`defaultOption` removed.
- **WP-SR-04:** `defer-findings` retained but differentiated with `strategic_findings_deferred: true`.
- **Review-mode routing:** left unchanged (out of scope; existing intended behaviour).
- **New variables to declare in `workflow.yaml`:** `strategic_fixes_selective` (bool, default false), `strategic_findings_deferred` (bool, default false).

---

## Compliance Findings

Findings carried in from the scoped review ([08-compliance-review.md](08-compliance-review.md)). User elected to fix all four.

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | WP-SR-01 — checkpoint does not gate on finding-free state | `12-strategic-review.yaml:48–49` | Add `condition` gating on `strategic_findings_summary != ""`; ensure dismissal lands on `review_passed` proceed path |
| Medium | WP-SR-02 — no priority/selective disposition when findings exist | `12-strategic-review.yaml:60–81` | Add `selective-fixes` option mirroring `workflow-design`'s `review-disposition`, driven off `strategic_findings_summary` |
| Medium | WP-SR-03 — unsafe auto-advance when findings exist | `12-strategic-review.yaml:57–59` | Findings-present checkpoint `blocking: true`, drop `autoAdvanceMs`/`defaultOption` |
| Low | WP-SR-04 — `acceptable` and `defer-findings` are identical | `12-strategic-review.yaml:61–66` vs `73–78` | Differentiate `defer-findings` with its own effect, or remove it |

---

## Scope Manifest

*Edit set bounded by impact analysis ([05-impact-analysis.md](05-impact-analysis.md)); confirmed at both impact-confirmed and preservation-confirmed checkpoints. Final wording settled during scope-and-draft.*

Four files modified (impact analysis surfaced the README mermaid edit beyond the originally-anticipated single file):

| File | Change |
|------|--------|
| `workflows/work-package/activities/12-strategic-review.yaml` | `review-findings` checkpoint: add `condition` (`strategic_findings_summary != ""`), `blocking: true`, remove `autoAdvanceMs`/`defaultOption` + stale message line, add `selective-fixes` option, differentiate `defer-findings` effect. |
| `workflows/work-package/techniques/strategic-findings-analysis.md` | Add `review_passed` (boolean) output — `true` on finding-free path, unset when findings present. |
| `workflows/work-package/workflow.yaml` | Declare `strategic_fixes_selective` + `strategic_findings_deferred` (both boolean, default `false`) — mandatory under `check:variable-model`. `review_passed` declaration unchanged. |
| `workflows/work-package/activities/README.md` | Update mermaid edge labels (`:397–399`) so `defer-findings`→submit-for-review and `selective-fixes`→plan-prepare read truthfully. |

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete — committed ca6ad520, pushed, draft PR #192 |
| 10 | Post-Update Review | Update | ✅ Complete — clean audit; 0 new findings, scope clean, PR metadata correct |
| 11 | Retrospective | All | ✅ Complete — close-out ([11-COMPLETE.md](11-COMPLETE.md)); 2 out-of-scope items deferred to a future WP |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Target activity | `workflows/work-package/activities/12-strategic-review.yaml` |
| Reference pattern | `workflows/workflow-design/activities/08-quality-review.yaml` (`review-disposition` / `selective-fixes`) |

---

**Status:** ✅ COMPLETE — close-out recorded ([11-COMPLETE.md](11-COMPLETE.md)). Committed (ca6ad520), pushed, draft PR [#192](https://github.com/m2ux/workflow-server/pull/192) open against `workflows`. Workflow finished.
