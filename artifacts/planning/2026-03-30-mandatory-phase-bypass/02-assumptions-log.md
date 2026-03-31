# Assumptions Log

**Work Package:** Mandatory Phase Bypass Fix  
**Issue:** [#86](https://github.com/m2ux/workflow-server/issues/86)  
**Created:** 2026-03-30  
**Last Updated:** 2026-03-30

---

## Summary

Total: 12 | Validated: 8 | Invalidated: 2 | Partially Validated: 1 | Resolved (user): 1 | Open: 0  
Convergence iterations: 3 | Newly surfaced: 1 (from design-philosophy)  
Stakeholder review: 2 assumptions accepted (A-02-05, A-02-07)

---

## Assumptions

### A-02-01: Missing skill files are the root cause

**Status:** Invalidated  
**Category:** Problem Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** The `execute-activity` and `orchestrate-workflow` skills referenced in workflow rule #9 (EXECUTION MODEL) do not exist as formal TOON files.  
**Finding:** Both skills exist as well-defined universal TOON files in `workflows/meta/skills/`:  
- `04-orchestrate-workflow.toon` (v4.0.0, 160 lines) — full orchestrator protocol  
- `05-execute-activity.toon` (v2.0.0, 137 lines) — full worker protocol including `write-semantic-trace` (MANDATORY)  
**Evidence:** `workflows/meta/skills/05-execute-activity.toon:52-56` defines the `write-semantic-trace` phase; `workflows/meta/skills/04-orchestrate-workflow.toon:88` defines the `skill-loading-boundary` rule. Skills README (`workflows/work-package/skills/README.md:36`) confirms they are universal skills in `meta/skills/`.  
**Resolution:** Invalidated — iteration 1.

### A-02-02: Semantic trace has no formal definition

**Status:** Invalidated  
**Category:** Problem Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** The "semantic trace" described in `workflow-fidelity.md` has no corresponding skill step requiring agents to produce it.  
**Finding:** The `execute-activity` skill (lines 52-56) defines a mandatory `write-semantic-trace` phase with specific requirements: file path `{planning_folder_path}/{artifactPrefix}-semantic-trace.json`, JSON format with `activity_id`, `started_at`, `completed_at`, and `events` array capturing step outputs, checkpoint responses, decision branches, loop iterations, and variable changes.  
**Evidence:** `workflows/meta/skills/05-execute-activity.toon:52-56`.  
**Resolution:** Invalidated — iteration 1.

### A-02-03: Skill schema supports execute-activity protocol

**Status:** Validated  
**Category:** Complexity Assessment  
**Resolvability:** Code-analyzable  
**Assumption:** The existing skill TOON schema has sufficient constructs to represent the execute-activity protocol.  
**Finding:** Both meta skills already exist and validate against the schema. The `protocol` field is the active mechanism.  
**Evidence:** `schemas/skill.schema.json:341-348`; both meta skills load successfully via skill-loader.  
**Resolution:** Validated — iteration 1.

### A-02-04: Changes limited to new skill files and rule updates

**Status:** Resolved (user)  
**Category:** Scope Boundary  
**Resolvability:** Not code-resolvable  
**Assumption:** The fix can be implemented without modifying server source (`src/`), schemas, or existing skill files.  
**Resolution:** User confirmed server-source changes ARE in scope. Directed approach: add `skills` field to workflow schema, extend `get_skills` to accept workflow_id without activity_id, remove dead code from skill-loader.ts. This invalidates the original assumption — server changes are explicitly in scope.  
**Resolved by:** User scope direction (research activity transition)

### A-02-05: Orchestrator pre-digestion is addressable through behavioral guidance

**Status:** Validated (user-accepted)  
**Category:** Problem Interpretation  
**Resolvability:** Not code-resolvable  
**Assumption:** The orchestrator's habit of pre-digesting worker instructions can be corrected by improving skill protocols and rules.  
**Resolution:** Accepted during assumptions review. The violation correlates with missing discoverability, not behavioral defiance. Once orchestrate-workflow is discoverable via workflow-level skills, its `skill-loading-boundary` rule becomes enforceable through guidance. Easily reversible — server enforcement (#65) can be added later if needed.  
**Resolved by:** User acceptance (assumptions-review activity)

### A-02-06: Worker self-bootstrap is technically feasible

**Status:** Validated  
**Category:** Complexity Assessment  
**Resolvability:** Code-analyzable  
**Assumption:** A worker sub-agent can call MCP tools directly. No role-based restrictions exist.  
**Finding:** The `aid` field is purely for attribution, not access control. Any agent can call any tool.  
**Evidence:** `src/trace.ts:15`, `src/utils/session.ts:14`, `src/logging.ts:74`.  
**Resolution:** Validated — iteration 1.

### A-02-07: Semantic trace format can be standardized

**Status:** Validated (user-accepted)  
**Category:** Workflow Path  
**Resolvability:** Not code-resolvable  
**Assumption:** A single standardized semantic trace format can serve all activities.  
**Resolution:** Accepted during assumptions review. The format (JSON with activity_id, timestamps, events array of 5 typed entries) has been successfully used across 6 activities in this work package. The events array is extensible — new event types can be added without breaking existing traces. Easily reversible.  
**Resolved by:** User acceptance (assumptions-review activity)

### A-02-08: get_skills does not return universal meta-skills

**Status:** Partially Validated  
**Category:** Problem Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** `get_skills` returns only activity-declared skills, not universal meta-skills like `execute-activity`.  
**Finding:** Confirmed at `src/tools/resource-tools.ts:100`. Universal fallback exists in `readSkill` (skill-loader.ts:116) but is only triggered by `get_skill`, not `get_skills`.  
**Evidence:** `src/tools/resource-tools.ts:100`, `src/loaders/skill-loader.ts:115-119`.  
**Resolution:** Partially Validated — iteration 1.

### A-03-01: meta/rules.toon references worker behavior but not the execute-activity skill

**Status:** Validated  
**Category:** Requirement Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** The orchestration-execution rules in `meta/rules.toon` describe worker behavior in prose (line 190: "The worker self-bootstraps each activity from next_activity and get_skills") but do not reference the formal `execute-activity` skill by name.  
**Finding:** Confirmed. Lines 186-196 of `meta/rules.toon` define 9 orchestration-execution rules. None mention `execute-activity` or `orchestrate-workflow` by skill ID. The rules describe behaviors but don't connect them to the formal skill definitions.  
**Evidence:** `workflows/meta/rules.toon:186-196`. Grep for `execute.activity` and `orchestrate.workflow` in the file returns no matches.  
**Resolution:** Validated — iteration 2.

### A-03-02: help tool bootstrap procedure doesn't reference universal skills

**Status:** Validated  
**Category:** Requirement Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** The `help` tool's bootstrap procedure doesn't mention universal skills or the execute-activity protocol.  
**Finding:** Confirmed. The help tool returns a two-step bootstrap: (1) `list_workflows`, (2) `start_session`. It describes session protocol (token handling, validation) but does not mention universal skills, `execute-activity`, or `orchestrate-workflow`.  
**Evidence:** `src/tools/workflow-tools.ts:27-57` (help handler), lines 33-54 (bootstrap and session_protocol objects).  
**Resolution:** Validated — iteration 2.

### A-03-03: Three implementation approaches exist for the discoverability fix

**Status:** Validated  
**Category:** Scope Boundaries  
**Resolvability:** Code-analyzable  
**Assumption:** The discoverability gap can be fixed via (A) server-side `get_skills` modification, (B) TOON-only rule/skill updates to instruct explicit `get_skill('execute-activity')` calls, or (C) a hybrid of both.  
**Finding:** All three approaches are technically feasible:  
- **A:** Modify `resource-tools.ts:100` to append universal skills from `listUniversalSkills()` — the function already exists in `skill-loader.ts:140`.  
- **B:** Update `orchestrate-workflow` dispatch-activity and `meta/rules.toon` to instruct `get_skill('execute-activity')` — the skill is already servable via `readSkill` fallback.  
- **C:** Both A and B for defense-in-depth.  
**Evidence:** `src/loaders/skill-loader.ts:140-160` (`listUniversalSkills` exists), `src/tools/resource-tools.ts:100` (injection point for approach A), `workflows/meta/skills/04-orchestrate-workflow.toon:29-30` (dispatch-activity protocol, injection point for approach B).  
**Resolution:** Validated — iteration 2. User selected a variant of approach C: add workflow-level `skills` field + extend `get_skills` API + update meta skills and rules.

### A-04-01: Workflow schema skills field should be optional

**Status:** Validated  
**Category:** Pattern Applicability  
**Resolvability:** Code-analyzable  
**Assumption:** The new `skills` field on the workflow schema should be optional to maintain backward compatibility with workflows that don't use workflow-level skills.  
**Finding:** The workflow schema consistently uses optional fields for non-essential properties: `description`, `author`, `tags`, `rules`, `variables`, `modes`, `artifactLocations`, `initialActivity` are all optional. Only `id`, `version`, `title`, `executionModel`, and `activities` are required.  
**Evidence:** `src/schema/workflow.schema.ts:54-71` — optional fields use `.optional()`; `schemas/workflow.schema.json:220` — required array has only 5 entries.  
**Resolution:** Validated — iteration 3.
