# Assumptions Log

**Work Package:** Rule-to-Skill Migration (#88)  
**Created:** 2026-03-31  
**Last Updated:** 2026-03-31

---

## Reconciliation Summary

Total: 19 | Validated: 12 | Invalidated: 1 | Partially Validated: 0 | Open: 6  
Convergence iterations: 3 (1 per activity) | Newly surfaced: 0  
**Stakeholder corrections applied**: A-04-01 invalidated (orchestration models are family-specific, not universal)

---

## Activity: Design Philosophy (02)

### A-02-01: list_workflows does not currently filter meta  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `list_workflows` tool returns meta alongside all other workflows, and there is no existing filter mechanism.  
**Evidence:** `listWorkflows()` in `src/loaders/workflow-loader.ts:119-157` iterates all entries in the workflow directory — any directory containing `workflow.toon` is listed. No `META_WORKFLOW_ID` check exists in this function, unlike `skill-loader.ts` which explicitly excludes meta in several places (lines 59, 107, 201, 269).  
**Risk if wrong:** If meta were already filtered, the list_workflows change would be unnecessary.

### A-02-02: start_session returns the full rules.toon content  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Every `start_session` call loads and returns the entire `meta/rules.toon` content (all 85 rules across 16 sections) regardless of which workflow is being started.  
**Evidence:** `start_session` in `src/tools/resource-tools.ts:40-79` calls `readRules(config.workflowDir)` which loads from `meta/rules.toon` (rules-loader.ts:19-42). The full parsed result is placed directly in the response as `rules: rulesResult.value`. No filtering, workflow-specific subsetting, or lazy loading occurs.  
**Risk if wrong:** If rules were already partially loaded, the slimming scope would differ.

### A-02-03: Skills in meta/skills/ are automatically available to all workflows  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Any skill placed in `meta/skills/` is discoverable by `readSkill()` for any workflow through the universal fallback.  
**Evidence:** `readSkill()` in `src/loaders/skill-loader.ts:101-134` follows a layered search: (1) workflow-specific directory, (2) universal directory (`meta/skills/`), (3) cross-workflow scan. The universal fallback at line 116 ensures meta skills are available to all workflows without explicit declaration.  
**Risk if wrong:** Extracted skills would need per-workflow registration rather than automatic discovery.

### A-02-04: The rules schema supports minimal content  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `meta/rules.toon` can be reduced to a minimal file (e.g., a single section with a bootstrap instruction) while remaining schema-valid.  
**Evidence:** `RulesSchema` in `src/schema/rules.schema.ts:10-17` requires: `id` (string), `version` (string), `title` (string), `description` (string), `precedence` (string), `sections` (array of objects with `id` and `title`). `RulesSectionSchema` uses `.passthrough()` and `rules` is optional. A file with one section and zero rules is valid. Test confirms this in `tests/rules-loader.test.ts:136-156`.  
**Risk if wrong:** Slimming rules.toon would require schema changes.

### A-02-05: Existing tests cover rules loading and start_session  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Tests exist that verify the current rules loading behavior and start_session response shape, which will need updating after changes.  
**Evidence:** `tests/rules-loader.test.ts` has 7 test cases covering readRules and readRulesRaw with real and synthetic data. `tests/mcp-server.test.ts` initializes a full MCP server in beforeAll and calls `start_session` in beforeEach (line 41-46), parsing the response for session_token. These tests assert on the current rules structure (`id: 'agent-rules'`, sections array).  
**Risk if wrong:** If no tests existed, we could make changes without updating test expectations. Since they do exist, tests must be updated.

### A-02-06: No external consumers depend on the start_session rules response shape  
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Only the MCP client agents consume `start_session` responses, and no external tooling or integrations parse the `rules` field programmatically.  
**What would resolve it:** Stakeholder confirmation that no external systems or scripts depend on the `start_session` response shape.  
**Risk if wrong:** Changing the rules response shape could break unknown consumers. However, the change is easily reversible — the `readRules()` function can be restored.

### A-02-07: Priority ordering (P1 → P2 → P3) is the correct migration sequence  
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Extracting the highest-duplication rule groups first (orchestrator-discipline at ~24, worker-execution-discipline at ~12) maximizes early value and validates the migration pattern.  
**What would resolve it:** Stakeholder confirmation that impact-based prioritization is preferred over risk-based or dependency-based ordering.  
**Risk if wrong:** A different ordering might reduce risk or unblock other work. However, the ordering is easily reversible — any group can be extracted independently.

### A-02-08: The 85-rule payload in start_session is a context efficiency concern  
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** The monolithic 85-rule payload returned by `start_session` consumes significant agent context window space and would be more efficiently delivered on-demand via `get_skills`.  
**What would resolve it:** Empirical measurement of token counts or stakeholder judgment on context budget allocation.  
**Risk if wrong:** If the payload is small relative to agent context windows, slimming may not provide meaningful benefit. However, the architectural improvement (structured skills vs prose rules) has value independent of payload size.

### A-02-09: Workflow-specific unique rules should remain in workflow.toon  
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Rules that are genuinely unique to a single workflow (e.g., "PREREQUISITE: Agents MUST read AGENTS.md") should remain as workflow-level rules rather than being extracted into skills.  
**What would resolve it:** Architectural decision on whether ALL rules should eventually live in skills or whether workflow.toon rules serve a legitimate purpose for workflow-specific constraints.  
**Risk if wrong:** Leaving some rules in workflow.toon creates a hybrid model where agents must check both places. This is path-committing — migrating from a hybrid model later requires revisiting all workflows again.

---

## Activity: Research (04)

### A-04-01: Orchestrator-discipline rules can be merged into existing orchestrate-workflow skill  
**Status:** Invalidated (corrected by stakeholder)  
**Resolvability:** Code-analyzable  
**Assumption:** The orchestrator-discipline rules duplicated across workflow.toon files are semantically equivalent to rules already present in the `orchestrate-workflow` skill, making merge (not separate skill creation) the correct approach.  
**Evidence:** Code analysis confirmed semantic overlap in rule text. However, stakeholder correction revealed the critical flaw: three distinct orchestration models exist (persistent-worker in work-package, disposable-worker in prism-family, concurrent-dispatch in security audits). Merging into a single universal skill would confuse agents running workflows with different patterns. The `orchestrate-workflow` skill already targets the persistent-worker model.  
**Resolution:** Orchestration discipline should be family-specific, not universal. Options: (1) workflow-family skills (e.g., `prism-orchestration`, `audit-orchestration`), (2) keep orchestration rules workflow-level but deduplicate within each family, (3) parameterized skill with model-specific protocol branches.  
**Risk if wrong:** A universal orchestration skill would cause agents to apply persistent-worker patterns to disposable-worker workflows (or vice versa), breaking analytical isolation in prism or context preservation in work-package.

### A-04-02: Worker-execution rules can be merged into existing execute-activity skill  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The worker-execution-discipline rules duplicated across workflow.toon files are semantically equivalent to rules already present in the `execute-activity` skill.  
**Evidence:** The execute-activity skill in `meta/skills/05-execute-activity.toon` has 7 rules covering: self-bootstrap, report-state-changes, preserve-context, complete-all-steps, checkpoint-yield, artifact-prefixing, readme-progress-mandatory. These map to the worker execution rules found in workflow.toon files. The skill also has a detailed protocol covering bootstrap, step execution, and completion reporting.  
**Risk if wrong:** Would require a new separate skill instead of merging.

### A-04-03: Session-protocol rules must stay in start_session due to bootstrap dependency  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The session-protocol section (11 rules about token usage, step manifests, resource access) cannot be moved to skills because agents need these rules BEFORE they can call `get_skills`.  
**Evidence:** The bootstrap flow is: `start_session` → (agent reads rules) → `get_skills`. The session-protocol rules teach agents: (1) how to pass session_token to subsequent calls, (2) to use the updated token from `_meta.session_token`, (3) that step_manifest is required for next_activity. Without these rules, agents wouldn't know the protocol for calling `get_skills` correctly. Rule 11 ("RESOURCE USAGE") explains how to find resources in get_skills responses — needed before the first get_skills call.  
**Risk if wrong:** If rules could be loaded independently of the token protocol, all rules could move to skills.

### A-04-04: No server code changes needed for meta/rules.toon slimming  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Reducing `meta/rules.toon` content requires only editing the TOON file, with no changes to `rules-loader.ts` or `resource-tools.ts` — the loader reads whatever is in the file.  
**Evidence:** `readRules()` in `rules-loader.ts:19-42` reads the file, decodes TOON, validates against `RulesSchema`, and returns the result. The code imposes no minimum on section or rule count. `start_session` in `resource-tools.ts:64-74` returns `rulesResult.value` verbatim. Reducing the file content is sufficient — no code path changes needed.  
**Risk if wrong:** Would require both file and code changes, increasing scope.

### A-04-05: Prism-specific skills should go in prism/skills/ rather than meta/skills/  
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Skills like `analytical-isolation` and `prism-report-formatting` that apply only to prism-family workflows should be scoped to `prism/skills/` rather than placed universally in `meta/skills/`.  
**What would resolve it:** Architectural decision on skill scoping. Currently `prism/skills/` does not exist as a directory — it would need to be created.  
**Risk if wrong:** Placing them in meta/skills/ makes them available to all workflows (unnecessary but harmless). Placing them in prism/skills/ makes them available only to the prism workflow — prism-audit and prism-evaluate would need cross-workflow resolution (tier 3 search). This is easily reversible.

### A-04-06: ~29 guardrail rules should remain in rules.toon rather than becoming skills  
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Generic behavioral rules (communication standards, documentation standards, task management, error recovery, build commands, domain tool discipline, context management) are better served as upfront guardrails in rules.toon than as skills, because they apply universally and don't benefit from skill structure (protocol, inputs, outputs).  
**What would resolve it:** Stakeholder decision on whether to keep a hybrid model (some rules in rules.toon, protocols in skills) or to move everything into skills for a unified model.  
**Risk if wrong:** If all rules should be skills, the scope expands significantly. This is path-committing — the hybrid vs unified decision affects the end-state architecture.

---

## Activity: Plan & Prepare (06)

### A-06-01: Workflow rules array is optional in the schema  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Removing or reducing the `rules[]` array in workflow.toon files will not cause schema validation failures.  
**Evidence:** `workflow.schema.json` line 220: `required: ["id", "version", "title", "executionModel", "activities"]`. `rules` is not in the required list. Workflows with zero rules are schema-valid.  
**Risk if wrong:** Workflows with reduced rules would fail to load.

### A-06-02: New skill files in meta/skills/ auto-register without code changes  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Placing new `.toon` files in `meta/skills/` is sufficient for `readSkill()` to discover them — no registry or configuration needed.  
**Evidence:** `skill-loader.ts:24-37` `findSkillFile()` scans the directory with `readdir()` and matches by filename. `getUniversalSkillDir()` returns `meta/skills/`. No explicit registration required.  
**Risk if wrong:** New skills would need additional configuration.

### A-06-03: Deleting workflow-execution.toon won't break any activity skill references  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** No activity in any workflow references `workflow-execution` as a primary or supporting skill, so deleting it won't break `get_skills` calls.  
**Evidence:** Searched all activity TOON files across all workflows. `workflow-execution` is a meta-level skill loaded via the initial `get_skills` call (before any activity is entered — the token-driven scope logic). It's not referenced as `skills.primary` or `skills.supporting` in any activity definition. Agents load it implicitly during bootstrap, not explicitly per-activity.  
**Risk if wrong:** An activity referencing it would fail to load skills.

### A-06-04: Phase ordering (extract-then-remove) prevents behavioral gaps  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Creating/augmenting skills before removing source rules ensures agents always have access to behavioral constraints during the transition.  
**Evidence:** The skill-loader resolves skills on-demand per `get_skills` call. New skills placed in `meta/skills/` are immediately available to all subsequent `get_skills` calls. The workflow.toon rules are loaded during `get_workflow` / `next_activity` — they remain available until explicitly removed. Both paths coexist without conflict during the transition window.  
**Risk if wrong:** Agents would lose constraints during migration. The phased approach eliminates this risk.
