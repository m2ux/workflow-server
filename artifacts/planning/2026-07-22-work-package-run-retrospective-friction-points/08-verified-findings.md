# Verified Findings — `workflow-design` / #272 draft

**Mode:** update · **Date:** 2026-07-22
**Pass:** verified (post fix-cycle re-audit)
**Target:** work-package + meta + workflow-design (draft worktree)

## Findings

| ID | Severity | Finding | Location | Fix | Status |
|----|----------|---------|----------|-----|--------|
| C-1 | Low | Bare artifact-prefix cite | `write-artifact.md` | markdown link | **fixed** |
| C-2 | Low | Bare dispatch-activity cite | `finalize-activity.md` | restore link | **fixed** |
| H-1 | Medium | AP-19 relay-harness-usage | `dispatch-activity.md` | delete rule → Protocol | **fixed** |
| H-2 | Medium | AP-19 accumulate-trace-tokens | same | fold into Protocol | **fixed** |
| H-3 | Medium | AP-25 step-manifest-required | same | fold into Protocol | **fixed** |
| H-4 | Medium | AP-19 post-activity-persist | `workflow-orchestrator.md` | Protocol owns; delete rule | **fixed** |
| H-5 | Medium | AP-22 meta domain-work rule | `meta/workflow.yaml` | delete; agent-conduct owns | **fixed** |
| H-6 | Medium | AP-22 depth-1 spawn bullets | `claude-code.md`, `cursor.md` | delete; spawn-agent owns | **fixed** |
| E-1 | High | git-tree text-only rule | `02-resolve-target.yaml` | validate action after resolve | **fixed** |
| E-2 | Medium | corrections-must-persist | `workflow-design/workflow.yaml` | defer structural log | **deferred** |
| E-3 | Medium | tasks-are-code-changes-only | `plan-prepare` | defer validate | **deferred** |
| E-4 | Medium | no-raw-commands-in-plan | same | defer with E-3 | **deferred** |

**Finding count:** 12 (9 fixed · 3 deferred · 0 Critical · expressiveness 0 · re-audit open must-fix 0)

## Notes

- `needs_audit_fixes`: **false**
- `has_critical_finding`: **false**
- Blocker gate → `validate-and-commit`
