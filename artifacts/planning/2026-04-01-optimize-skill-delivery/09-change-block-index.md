# Change Block Index

**PR:** [#97](https://github.com/m2ux/workflow-server/pull/97)  
**Branch:** enhancement/96-optimize-skill-delivery  
**Generated:** 2026-04-01

---

## Summary

| Metric | Value |
|--------|-------|
| Files changed | 4 (2 source, 2 submodule refs) |
| Lines added | 172 |
| Lines removed | 35 |
| Net change | +137 |

---

## File Index

| # | File | Change Type | Lines | Description |
|---|------|------------|-------|-------------|
| 1 | `src/tools/resource-tools.ts` | Modified | +57 -14 | Replace `skill_id` with `step_id` on `get_skill`, add step→skill resolution |
| 2 | `tests/mcp-server.test.ts` | Modified | +146 -28 | Update all `get_skill` tests to use `step_id`, add new test cases |
| 3 | `.engineering` | Submodule | +1 -1 | Engineering artifacts submodule reference update |
| 4 | `workflows` | Submodule | +1 -1 | Workflows worktree reference (consolidated management skills) |

---

## Block Detail

### Block 1: `src/tools/resource-tools.ts` — Import changes (lines 6, 11)
- Added `getActivity` to workflow-loader import
- Removed `validateSkillAssociation` from validation import

### Block 2: `src/tools/resource-tools.ts` — `get_skill` tool handler (lines 151-220)
- Replaced `skill_id` parameter with `step_id` in Zod schema
- Added `token.act` validation (error if no activity in session)
- Added activity loading via `loadWorkflow` + `getActivity`
- Added step lookup in `activity.steps[]` and `activity.loops[].steps[]`
- Added error handling for missing step, skill-less step
- Resolved `skillId` from step, then calls existing `readSkill`
- Updated `advanceToken` to use resolved `skillId`
- Removed `validateSkillAssociation` from validation pipeline

### Block 3: `tests/mcp-server.test.ts` — `get_skill` test suite (lines 247-330)
- Renamed test suite to "tool: get_skill (step-scoped)"
- All tests now call `next_activity` first to set `token.act`
- Use `step_id` parameter instead of `skill_id`
- Added: error when no activity, error when step not found, error when skill-less step
- Added: loop step resolution, token advancement verification

### Block 4: `tests/mcp-server.test.ts` — Structured resources tests (lines 335-410)
- Updated to use `step_id` with activity context
- Same assertions, different API call pattern

### Block 5: `tests/mcp-server.test.ts` — `get_skills` tests (lines 418-445)
- Updated expected skill names: `orchestrator-management`, `worker-management` instead of individual skills

### Block 6: `tests/mcp-server.test.ts` — Cross-workflow resource tests (lines 488-525)
- Cross-workflow (`meta/NN`) test now uses `get_skills` (tests workflow-level skill resources)
- Bare index test uses `step_id` with activity context

### Block 7: `workflows/` submodule — New skill files + workflow.toon update
- `work-package/skills/25-orchestrator-management.toon` — Consolidated orchestrator skill
- `work-package/skills/26-worker-management.toon` — Consolidated worker skill
- `work-package/workflow.toon` — `skills[2]` instead of `skills[5]`

---

**Review estimate:** 15-25 minutes for manual side-by-side diff review
