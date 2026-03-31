# Change Block Index

**PR:** [#87](https://github.com/m2ux/workflow-server/pull/87)  
**Branch:** `bug/86-mandatory-phase-bypass`  
**Estimated review time:** ~3 minutes (9 files, ~96 additions, ~288 deletions)

---

| Row | File | Change Summary | Lines |
|-----|------|---------------|-------|
| 1 | `schemas/README.md` | Add `skills` to field table, optional properties table, mermaid diagram | +3 |
| 2 | `schemas/workflow.schema.json` | Add `skills` property to workflow definition | +7 |
| 3 | `src/schema/workflow.schema.ts` | Add `skills: z.array(z.string()).optional()` to WorkflowSchema | +1 |
| 4 | `src/tools/resource-tools.ts` | Make `activity_id` optional in `get_skills`, add branching for workflow-level skills | +15/-7 |
| 5 | `src/loaders/skill-loader.ts` | Remove dead code: SkillEntry, listUniversalSkills, listWorkflowSkills, listSkills, SkillIndex, readSkillIndex. Remove unused imports (stat, basename). | +2/-191 |
| 6 | `tests/mcp-server.test.ts` | Add 6 new tests for workflow-level `get_skills` | +65 |
| 7 | `tests/skill-loader.test.ts` | Remove test suites for dead code (listUniversalSkills, listSkills, readSkillIndex) | +1/-92 |
| 8 | `workflows/work-package/workflow.toon` | Add `skills[2]: [orchestrate-workflow, execute-activity]` | +3 (submodule) |
| 9 | `workflows/meta/skills/*.toon, meta/rules.toon` | Update dispatch, bootstrap, and rules to reference workflow-level skills | +5/-2 (submodule) |

---

**Note:** Rows 8-9 are in the workflows worktree (submodule). The parent repo diff shows only the submodule pointer change.
