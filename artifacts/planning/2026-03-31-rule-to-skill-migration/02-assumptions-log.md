# Assumptions Log

**Work Package:** Rule-to-Skill Migration (#88)  
**Created:** 2026-03-31  
**Last Updated:** 2026-03-31

---

## Reconciliation Summary

Total: 9 | Validated: 5 | Invalidated: 0 | Partially Validated: 0 | Open: 4  
Convergence iterations: 1 | Newly surfaced: 0

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
