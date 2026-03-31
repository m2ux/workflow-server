# Change Block Index

**Work Package:** Rule-to-Skill Migration (#88)  
**Branch:** `enhancement/88-rule-to-skill-migration` vs `main`  
**Generated:** 2026-03-31

**Review estimate:** ~30 seconds per block × 21 blocks = ~10 minutes

---

## Parent Repo Changes (6 files, 24 insertions, 31 deletions)

| Row | File | Change | Lines |
|-----|------|--------|-------|
| 1 | `.engineering` | Submodule pointer update | 1 |
| 2 | `src/loaders/workflow-loader.ts` | Add `META_WORKFLOW_ID` constant | +2 |
| 3 | `src/loaders/workflow-loader.ts` | Add meta filter in `listWorkflows` loop | +1 |
| 4 | `tests/mcp-server.test.ts` | Expect meta NOT in list_workflows | ±1 |
| 5 | `tests/rules-loader.test.ts` | Expect rules version 2.0.0 | ±1 |
| 6 | `tests/skill-loader.test.ts` | listUniversalSkills: workflow-execution → execute-activity | ±1 |
| 7 | `tests/skill-loader.test.ts` | listSkills: workflow-execution → execute-activity | ±1 |
| 8 | `tests/skill-loader.test.ts` | readSkill: rename test to execute-activity | ±5 |
| 9 | `tests/skill-loader.test.ts` | readSkill: rewrite sections test for execute-activity | ±20 |
| 10 | `tests/skill-loader.test.ts` | readSkill: tool guidance → 'when' field only | ±4 |
| 11 | `tests/skill-loader.test.ts` | readSkill: error recovery → execute-activity | ±1 |
| 12 | `tests/skill-loader.test.ts` | readSkillIndex: workflow-execution → execute-activity | ±1 |
| 13 | `tests/workflow-loader.test.ts` | Expect work-package, NOT meta in listWorkflows | ±2 |

## Workflows Submodule Changes (pushed to `workflows` branch)

| Row | File | Change | Lines |
|-----|------|--------|-------|
| 14 | `meta/skills/01-workflow-execution.toon` | DELETED (absorbed into execute-activity) | -98 |
| 15 | `meta/skills/04-orchestrate-workflow.toon` | MOVED to work-package/skills/24-orchestrate-workflow.toon | 0 |
| 16 | `meta/skills/05-execute-activity.toon` | Added 6 rules (checkpoint-presentation, resource-usage, workflow-fidelity, etc.) | +7 |
| 17 | `meta/skills/10-version-control-protocol.toon` | NEW — extracted from meta/rules.toon | +38 |
| 18 | `meta/skills/11-engineering-artifacts-management.toon` | NEW — extracted from meta/rules.toon | +34 |
| 19 | `meta/skills/12-github-cli-protocol.toon` | NEW — extracted from meta/rules.toon | +28 |
| 20 | `meta/rules.toon` | Slimmed from 85→43 rules (removed 6 sections, added bootstrap) | -96,+7 |
| 21 | `meta/README.md` | Updated skills table, references | ±12 |
| 22 | `work-package/workflow.toon` | 13→8 rules (removed 5 duplicates) | -5 |
| 23 | `prism/workflow.toon` | 12→10 rules (removed 2 duplicates) | -2 |
| 24 | `prism-audit/workflow.toon` | 8→6 rules (removed 2 duplicates) | -2 |
| 25 | `prism-evaluate/workflow.toon` | 10→8 rules (removed 2 duplicates) | -2 |
| 26 | `cicd-pipeline-security-audit/workflow.toon` | 20→19 rules (removed 1 duplicate) | -1 |
| 27 | `substrate-node-security-audit/workflow.toon` | 27→26 rules (removed 1 duplicate) | -1 |
| 28 | `work-package/skills/24-orchestrate-workflow.toon` | MOVED here + added 2 rules | +2 |

---

**Total:** 28 change blocks across 18 files (6 parent repo + 12 workflows submodule)
