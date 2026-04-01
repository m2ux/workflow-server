# Strategic Review — Optimize Skill Delivery

**PR:** [#97](https://github.com/m2ux/workflow-server/pull/97)  
**Date:** 2026-04-01  
**Review #:** 1

---

## Scope Assessment

### In-Scope Changes (Correctly Focused)

| File | Change | On-Target |
|------|--------|-----------|
| `src/tools/resource-tools.ts` | Step-scoped `get_skill` + backward-compat `get_step_skill` | Yes |
| `tests/mcp-server.test.ts` | Updated/new tests for step-scoped resolution | Yes |
| `scripts/validate-activities.ts` | Fix `decodeToon` → `decodeToonRaw` | Yes (bug fix found during implementation) |
| `scripts/validate-workflow-toon.ts` | Fix `decodeToon` → `decodeToonRaw` | Yes (same bug fix) |
| `workflows` (submodule) | Consolidated management skills, workflow.toon update | Yes |
| `.engineering` (submodule) | Planning artifacts | Yes |

### Scope Artifacts Identified

| # | File | Issue | Severity | Action |
|---|------|-------|----------|--------|
| SA-01 | `.specstory/.project.json` | Auto-generated Specstory config. Not related to this work package. | Low | Should be in `.gitignore`. Remove from PR or add to gitignore. |
| SA-02 | `.cursor/rules/workflow-server.mdc` | Renames `help` to `discover` tool reference. Legitimate fix but unrelated to skill delivery optimization. | Low | Acceptable to include — small, correct fix. Document as incidental. |

### Over-Engineering Check

| Area | Assessment |
|------|-----------|
| Step lookup logic | Appropriate — handles regular steps and loop steps, no unnecessary abstractions |
| Error messages | Appropriate — includes available step IDs for debugging, not verbose |
| Management skill consolidation | Appropriate — per-role split, not monolithic |
| Test coverage | Appropriate — 6 new tests cover key paths without excessive permutations |

### Investigation Artifacts

None found. No debug logging, temporary files, or exploratory code in the diff.

---

## Findings Summary

| Total Findings | Critical | High | Medium | Low |
|---------------|----------|------|--------|-----|
| 2 | 0 | 0 | 0 | 2 |

**SA-01** (`.specstory/.project.json`): Auto-generated file that should be gitignored. Low priority — does not affect functionality.

**SA-02** (`.cursor/rules/workflow-server.mdc`): Incidental fix renaming `help` to `discover`. Correct change but unrelated to this work package scope. Acceptable to keep.

---

## Verdict

Changes are minimal and focused. The two low-severity scope artifacts do not warrant rework. The PR correctly implements the planned 6 tasks with no over-engineering or investigation artifacts.

**Recommended action:** acceptable
