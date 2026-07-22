# Enforcement Findings — `workflow-design` / #272 draft

**Mode:** update · **Date:** 2026-07-22
**Pass:** enforcement (re-audit after apply-audit-fixes)
**Target:** work-package + meta + workflow-design (draft worktree)

## Findings

| ID | Severity | Finding | Location | Fix | Status |
|----|----------|---------|----------|-----|--------|
| E-1 | High | Text-only: `target_path` MUST be a working git tree | `meta/activities/02-resolve-target.yaml` | `validate-git-tree` after resolve | **fixed** |
| E-2 | Medium | Text-only: corrections must persist | `workflow-design/workflow.yaml` | Structural `corrections_log` | **deferred** → [follow-ups F-2](follow-ups.md) |
| E-3 | Medium | Text-only: tasks-are-code-changes-only | `plan-prepare/TECHNIQUE.md` | Validate after plan | **deferred** → [follow-ups F-3](follow-ups.md) |
| E-4 | Medium | Text-only: no-raw-commands-in-plan | same | Validate after plan | **deferred** → [follow-ups F-3](follow-ups.md) |

**Finding count (open must-fix):** 0  
**Deferred (accepted this cycle):** 3 (E-2 Medium downgraded; E-3/E-4)

## Notes

- E-1 independently re-derived then fixed with `validate` action after submodule-selection.
- Deferred items are not Critical and are out of #272 primary friction scope; tracked in follow-ups.
