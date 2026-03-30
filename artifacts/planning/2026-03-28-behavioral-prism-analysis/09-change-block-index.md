# Change Block Index

**PR:** #83 — fix: resolve behavioral prism findings  
**Branch:** fix/behavioral-prism-findings → main  
**Files changed:** 17 (excl. .engineering submodule)  
**Total hunks:** 46  
**Estimated review time:** ~23 minutes (30 sec/hunk)

---

| Row | File | Hunk | Finding | Change Summary |
|-----|------|------|---------|---------------|
| 1 | `src/errors.ts` | L44 | BF-06 | RulesNotFoundError accepts optional message |
| 2 | `src/loaders/activity-loader.ts` | L47-48 | BF-02 | catch block: logWarn for findWorkflowsWithActivities |
| 3 | `src/loaders/activity-loader.ts` | L115-121 | BF-08 | readActivityFromWorkflow returns err() on validation failure |
| 4 | `src/loaders/activity-loader.ts` | L193-194 | BF-02 | catch block: logWarn for listActivitiesFromWorkflow |
| 5 | `src/loaders/activity-loader.ts` | L268 | BF-02 | catch block: logWarn for readActivityIndex |
| 6 | `src/loaders/resource-loader.ts` | L210-213 | BF-02 | catch block: logWarn for listResources |
| 7 | `src/loaders/resource-loader.ts` | L299-301 | BF-02 | catch block: logWarn for listWorkflowsWithResources |
| 8 | `src/loaders/rules-loader.ts` | L1-28 | BF-06 | New RulesSchema + RulesSectionSchema definitions |
| 9 | `src/loaders/rules-loader.ts` | L57-75 | BF-06 | readRules: Zod validation, distinct parse vs not-found errors |
| 10 | `src/loaders/rules-loader.ts` | L87-92 | BF-02 | catch block: logWarn for readRulesRaw |
| 11 | `src/loaders/skill-loader.ts` | L6-7 | BF-01 | Import safeValidateSkill |
| 12 | `src/loaders/skill-loader.ts` | L31-33 | BF-02 | catch block: logWarn for findSkillFile |
| 13 | `src/loaders/skill-loader.ts` | L65-72 | BF-02 | catch block: logWarn for findWorkflowsWithSkills |
| 14 | `src/loaders/skill-loader.ts` | L68-86 | BF-01 | tryLoadSkill: Zod validation via safeValidateSkill |
| 15 | `src/loaders/skill-loader.ts` | L153-155 | BF-02 | catch block: logWarn for listUniversalSkills |
| 16 | `src/loaders/skill-loader.ts` | L179-181 | BF-02 | catch block: logWarn for listWorkflowSkills |
| 17 | `src/loaders/skill-loader.ts` | L206-208 | BF-02 | catch block: logWarn for listSkills |
| 18 | `src/loaders/skill-loader.ts` | L290-292 | BF-02 | catch block: logWarn for readSkillIndex |
| 19 | `src/loaders/workflow-loader.ts` | L151 | BF-02 | catch block: enhanced error code for listWorkflows |
| 20 | `src/loaders/workflow-loader.ts` | L189-221 | BF-12 | getTransitionList: add decisions + checkpoints with dedup |
| 21 | `src/schema/condition.schema.ts` | L56-61 | BF-13 | New toNumber() helper for string-to-number coercion |
| 22 | `src/schema/condition.schema.ts` | L69-72 | BF-13 | Comparison operators use toNumber() coercion |
| 23 | `src/schema/skill.schema.ts` | L167 | BF-01 | SkillSchema: add .passthrough() |
| 24 | `src/tools/resource-tools.ts` | L73 | BF-15 | JSON.stringify compact (get_resource) |
| 25 | `src/tools/resource-tools.ts` | L132 | BF-15 | JSON.stringify compact (get_skills) |
| 26 | `src/tools/resource-tools.ts` | L166 | BF-15 | JSON.stringify compact (get_skill) |
| 27 | `src/tools/state-tools.ts` | L15-22 | BF-11 | validateStatePath: optional workspaceRoot param |
| 28 | `src/tools/state-tools.ts` | L98 | BF-15 | JSON.stringify compact (save_state) |
| 29 | `src/tools/state-tools.ts` | L127-136 | BF-14 | restore_state: preserve decrypt error |
| 30 | `src/tools/state-tools.ts` | L142 | BF-15 | JSON.stringify compact (restore_state) |
| 31 | `src/tools/workflow-tools.ts` | L53-56 | BF-15 | JSON.stringify compact (help, list_workflows) |
| 32 | `src/tools/workflow-tools.ts` | L94-97 | BF-15 | JSON.stringify compact (get_workflow summary/full) |
| 33 | `src/tools/workflow-tools.ts` | L174 | BF-15 | JSON.stringify compact (get_workflow_activity) |
| 34 | `src/tools/workflow-tools.ts` | L199 | BF-15 | JSON.stringify compact (get_checkpoint) |
| 35 | `src/tools/workflow-tools.ts` | L224 | BF-15 | JSON.stringify compact (next_activity) |
| 36 | `src/tools/workflow-tools.ts` | L251-268 | BF-15 | JSON.stringify compact (get_traces, 3 paths) |
| 37 | `src/tools/workflow-tools.ts` | L277 | BF-15 | JSON.stringify compact (health_check) |
| 38 | `src/trace.ts` | L1-3 | BF-05 | Import logWarn |
| 39 | `src/trace.ts` | L73-79 | BF-05 | TraceStore: eviction logging |
| 40 | `src/trace.ts` | L84-91 | BF-05 | TraceStore: auto-init on append |
| 41 | `src/utils/crypto.ts` | L39-47 | BF-10 | loadOrCreateKey: key length validation on EEXIST |
| 42 | `src/utils/session.ts` | L87-95 | BF-03p | advanceToken: optional pre-decoded payload param |
| 43 | `src/utils/validation.ts` | L21-29 | BF-04/09 | validateActivityTransition: initialActivity enforcement |
| 44 | `src/utils/validation.ts` | L39-48 | BF-04 | validateSkillAssociation: warning strings for missing data |
| 45 | `tests/skill-loader.test.ts` | L145-165 | BF-01 | Tests: validation failure for non-skill/empty TOON |
| 46 | `tests/trace.test.ts` | L55-60 | BF-05 | Test: auto-init on append to unknown session |
