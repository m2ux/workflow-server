# Assumptions Log

**Work Package:** Mandatory Phase Bypass Fix  
**Issue:** [#86](https://github.com/m2ux/workflow-server/issues/86)  
**Created:** 2026-03-30  
**Last Updated:** 2026-03-30

---

## Summary

Total: 8 | Validated: 3 | Invalidated: 1 | Partially Validated: 1 | Open: 3  
Convergence iterations: 1 | Newly surfaced: 1

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
**Resolution:** Invalidated — iteration 1. The skills exist. The problem is that agents don't follow them, not that the definitions are missing.

### A-02-02: Semantic trace has no formal definition

**Status:** Invalidated  
**Category:** Problem Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** The "semantic trace" described in `workflow-fidelity.md` has no corresponding skill step requiring agents to produce it.  
**Finding:** The `execute-activity` skill (lines 52-56) defines a mandatory `write-semantic-trace` phase with specific requirements: file path `{planning_folder_path}/{artifactPrefix}-semantic-trace.json`, JSON format with `activity_id`, `started_at`, `completed_at`, and `events` array capturing step outputs, checkpoint responses, decision branches, loop iterations, and variable changes.  
**Evidence:** `workflows/meta/skills/05-execute-activity.toon:52-56` — four protocol bullets defining the complete trace specification.  
**Resolution:** Invalidated — iteration 1. The semantic trace is fully specified in the execute-activity skill.

### A-02-03: Skill schema supports execute-activity protocol

**Status:** Validated  
**Category:** Complexity Assessment  
**Resolvability:** Code-analyzable  
**Assumption:** The existing skill TOON schema has sufficient constructs to represent the execute-activity protocol.  
**Finding:** Both `04-orchestrate-workflow.toon` and `05-execute-activity.toon` already exist and validate against the schema. The `protocol` field (key-value map of phases to ordered steps) is used extensively. The `executionPattern` type is defined but unused — the `protocol` field is the active mechanism.  
**Evidence:** `schemas/skill.schema.json:341-348` (protocol definition); both meta skills parse and load successfully via the server's skill loader.  
**Resolution:** Validated — iteration 1.

### A-02-04: Changes limited to new skill files and rule updates

**Status:** Open  
**Category:** Scope Boundary  
**Resolvability:** Not code-resolvable  
**Assumption:** The fix can be implemented without modifying server source (`src/`), schemas, or existing skill files.  
**Risk if wrong:** Given A-02-08 (newly surfaced), the most effective fix may require modifying `get_skills` in `src/tools/resource-tools.ts` to automatically include the `execute-activity` universal skill — which would touch server source.  
**What would resolve it:** Stakeholder decision on whether server-source changes are in scope for this work package or should be deferred to #65.

### A-02-05: Orchestrator pre-digestion is addressable through behavioral guidance

**Status:** Open  
**Category:** Problem Interpretation  
**Resolvability:** Not code-resolvable  
**Assumption:** The orchestrator's habit of pre-digesting worker instructions can be corrected by improving the `orchestrate-workflow` skill protocol (formalizing what to pass and what not to pass).  
**Risk if wrong:** If behavioral guidance alone is insufficient (agents still ignore the skill protocol), server-side enforcement (#65) would be the actual solution.  
**What would resolve it:** Empirical testing — run a work package with the updated orchestrate-workflow skill and observe whether the orchestrator follows it.

### A-02-06: Worker self-bootstrap is technically feasible

**Status:** Validated  
**Category:** Complexity Assessment  
**Resolvability:** Code-analyzable  
**Assumption:** A worker sub-agent can call MCP tools (`next_activity`, `get_skills`, `get_skill`) directly. The workflow server does not restrict which agent can call specific tools.  
**Finding:** The `aid` field in session tokens is used purely for attribution (trace events at `src/trace.ts:15`), not access control. No role-based restrictions exist in any tool handler. Any agent (orchestrator or worker) can call any tool.  
**Evidence:** `src/trace.ts:15` (`aid` field in trace events), `src/utils/session.ts:14` (`aid` in token payload), `src/logging.ts:74` (`aid` passed to trace). Grep for `aid.*restrict|role.*enforc` returns no matches.  
**Resolution:** Validated — iteration 1.

### A-02-07: Semantic trace format can be standardized

**Status:** Open  
**Category:** Workflow Path  
**Resolvability:** Not code-resolvable  
**Assumption:** A single standardized semantic trace format can serve all activities without excessive context-window overhead.  
**Risk if wrong:** If the format is too verbose for complex activities, or too rigid for diverse activity types, the design needs activity-level customization.  
**What would resolve it:** Stakeholder decision on trace granularity and format, informed by the specification in `execute-activity` lines 52-56 which already defines a concrete format.

### A-02-08: get_skills does not return universal meta-skills (NEWLY SURFACED)

**Status:** Partially Validated  
**Category:** Problem Interpretation  
**Resolvability:** Code-analyzable  
**Assumption:** When a worker calls `get_skills(workflow_id, activity_id)`, the response includes only the activity-declared skills (primary + supporting) and does NOT include the `execute-activity` universal skill. The worker has no way to discover its execution protocol through the standard skill-loading API unless it explicitly calls `get_skill('execute-activity')`.  
**Finding:** `src/tools/resource-tools.ts:100` extracts `skillIds = [activity.skills.primary, ...(activity.skills.supporting ?? [])]` — only activity-declared skills. Universal skills are NOT included. However, `readSkill` (skill-loader.ts:116) falls back to universal skills, so `get_skill(skill_id='execute-activity', workflow_id='work-package')` WOULD return the skill.  
**Evidence:** `src/tools/resource-tools.ts:100` (skill ID extraction), `src/loaders/skill-loader.ts:115-119` (universal fallback in readSkill).  
**Partial validation:** The mechanism exists but is not triggered through the standard `get_skills` path. The worker needs explicit instructions to call `get_skill('execute-activity')`, which it would only know to do if the orchestrator's dispatch prompt includes this instruction — but `orchestrate-workflow`'s `dispatch-activity` protocol (line 30) says "call start_session, next_activity, get_skills" without mentioning `get_skill('execute-activity')`.  
**Resolution:** Partially Validated — iteration 1. The gap is confirmed: there is a discoverability problem. The execute-activity skill exists and is servable, but the standard bootstrap path doesn't surface it.
