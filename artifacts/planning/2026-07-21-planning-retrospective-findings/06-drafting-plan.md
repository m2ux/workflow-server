# Drafting Plan — Iterate Lap 2 (batch)

**Mode:** update · **Files:** 9 · **Worktree:** `/home/mike1/projects/work/workflows/2026-07-21-planning-retrospective-findings/`

## Per-file deltas

| # | File | Delta |
|---|------|-------|
| 1 | `10-post-update-review.yaml` | Add `*_finding_count > 0` on expressiveness/conformance persists; remove `post-update-disposition`; add `classify-post-update-fixes` + `post-update-remedia-cycle` while-loop (mirror QR); rebind snapshot to `write-artifact` → `report_path`; transitions: dirty→intake, remedia-success→validate-and-commit, clean→retrospective |
| 2 | `08-quality-review.yaml` | `persist-compliance-report` → bound `write-artifact` (`compliance-review.md`) with `written_artifact`→`report_path` |
| 3 | `09-validate-and-commit.yaml` | `save-compliance-report` same rebind |
| 4 | `persist-report.md` | **Remove** — no remaining call sites |
| 5 | `14-complete.yaml` | Message: `Retrospective interview complete for this item set.` |
| 6 | `workflow.yaml` | 1.29.0→1.30.0; drop disposition from headless rule; add `needs_recommit`; clarify `needs_audit_fixes` |
| 7–9 | READMEs | Orientation: auto-remedia, no `persist-report` catalog/tree |

**drafting_plan_path:** this artifact (updated in place for the lap batch).
