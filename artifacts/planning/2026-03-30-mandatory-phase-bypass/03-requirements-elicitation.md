# Requirements Elicitation: Mandatory Phase Bypass Fix

**Date:** 2026-03-30  
**Status:** ✅ Confirmed (agent-led, no stakeholder transcript)

---

## Problem Statement

The execute-activity (v2.0.0) and orchestrate-workflow (v4.0.0) universal skills define the complete orchestrator/worker execution protocol including mandatory phases (write-semantic-trace, update-readme-progress). Despite being formally specified as TOON files in `workflows/meta/skills/`, these skills are not discoverable through the standard `get_skills` API, creating a gap where agents never load or follow them.

## Goal

Make the execute-activity universal skill discoverable to worker agents through the standard bootstrap path, so that all mandatory phases — especially write-semantic-trace — are executed as part of every activity.

---

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Workflow operator | Reliable, auditable workflow execution | As a workflow operator, I want every activity execution to produce a semantic trace file so that I can verify the workflow was followed correctly |
| Workflow operator | Worker follows the authoritative protocol | As a workflow operator, I want the worker to discover its execution protocol from the server so that mandatory phases cannot be silently skipped |

### Secondary Stakeholders

- Future agent implementations — need a discoverable, machine-readable execution protocol
- Workflow auditors — need semantic traces and progress updates as evidence of compliance

---

## Context

### Integration Points

- **`get_skills` API** (`src/tools/resource-tools.ts:100`) — currently extracts only `[activity.skills.primary, ...(activity.skills.supporting ?? [])]`; does not include universal meta-skills
- **`readSkill` resolver** (`src/loaders/skill-loader.ts:115-119`) — already falls back to universal skills via `getUniversalSkillDir()`, so `get_skill('execute-activity')` works
- **`meta/rules.toon` orchestration-execution rules** (lines 186-196) — describe worker behavioral contract in prose but don't reference the formal execute-activity skill
- **`orchestrate-workflow` skill** (`workflows/meta/skills/04-orchestrate-workflow.toon`) — `dispatch-activity` protocol tells worker to call `start_session`, `next_activity`, `get_skills` but doesn't mention `get_skill('execute-activity')`
- **`execute-activity` skill** (`workflows/meta/skills/05-execute-activity.toon`) — defines the complete worker protocol including `write-semantic-trace` (MANDATORY, lines 52-56) and `update-readme-progress` (MANDATORY, lines 46-51)
- **`help` tool** (`src/tools/workflow-tools.ts:27-57`) — returns bootstrap procedure without mentioning universal skills

### Dependencies

- Existing skill TOON schema (`schemas/skill.schema.json`) — the protocol field supports the needed constructs
- Existing universal skill resolution in `skill-loader.ts` — the server can already serve execute-activity via `get_skill`
- Session token `aid` field — already supports orchestrator/worker attribution

### Constraints

- **Scope boundary:** Must not overlap with #65 (server-side structural enforcement) or #51 (checkpoint enforcement)
- **Backward compatibility:** Existing skills and activities must continue to work unchanged
- **Context budget:** Semantic trace format must be compact (defined in execute-activity lines 54-55 as JSON)
- **Schema stability:** Prefer not modifying TOON schema unless essential

---

## Scope

### ✅ In Scope

1. **Discoverability fix:** Ensure the worker discovers `execute-activity` during its standard bootstrap path
2. **Dispatch gap fix:** Update `orchestrate-workflow` dispatch-activity protocol to instruct the worker to load `execute-activity`
3. **Rules gap fix:** Update `meta/rules.toon` orchestration-execution rules to reference the `execute-activity` skill by name
4. **Trace production verification:** Verify that the semantic trace format specified in execute-activity lines 52-56 is complete and implementable
5. **End-to-end validation:** Confirm that a worker following the updated protocol produces semantic traces and updates README progress

### ❌ Out of Scope

1. Server-side enforcement of phase execution — tracked in #65
2. Checkpoint enforcement reliability — tracked in #51
3. TOON schema changes (unless essential for discoverability)
4. Runtime validation of trace file completeness
5. Changes to existing domain skills (create-issue, classify-problem, etc.)

### ⏳ Deferred

1. Server-side validation that trace file was written before accepting `next_activity` — future enforcement work (#65)
2. Automated trace analysis tooling — post-implementation
3. Trace file format evolution (currently JSON, may want structured TOON later)

---

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | Worker discovers execute-activity during bootstrap without explicit instruction from the orchestrator | Call `get_skills` or `get_skill` during standard bootstrap and verify execute-activity is returned |
| SC-2 | Semantic trace JSON file produced after every activity execution | Check for `{artifactPrefix}-semantic-trace.json` in planning folder after activity completion |
| SC-3 | README progress table updated by worker before reporting completion | Verify README.md has artifacts marked ✅ Complete after each activity |
| SC-4 | Orchestrator dispatch does not include skill protocol content or resource text | Inspect worker prompt to verify only session_token, activity_id, workflow_id, state variables, and bootstrap instructions are included |
| SC-5 | Meta rules reference execute-activity by name | Read meta/rules.toon and verify the orchestration-execution rules mention the execute-activity skill |

---

## Elicitation Log

### Questions Asked (Agent-Led)

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | What is the root cause of mandatory phases being skipped? | Discoverability gap: `get_skills` returns only activity-declared skills, not universal meta-skills. The execute-activity skill defines mandatory phases but workers never load it. |
| Problem | Are the skills actually missing or just not followed? | Skills exist as well-defined TOON files in `meta/skills/`. The server can serve them via `get_skill`. The gap is in the discovery path. |
| Context | Does `start_session` or `help` reference execute-activity? | No. `start_session` returns rules from `meta/rules.toon` which describe worker behavior in prose but don't reference the formal skill. `help` returns bootstrap steps without mentioning universal skills. |
| Context | Can the worker call `get_skill('execute-activity')` directly? | Yes — `readSkill` in `skill-loader.ts` falls back to universal skills. No role-based restrictions exist. |
| Scope | Does fixing discoverability require server-source changes? | **Approach A (server change):** Modify `get_skills` to auto-include universal meta-skills. Touches `src/tools/resource-tools.ts`. **Approach B (TOON-only):** Update `orchestrate-workflow` dispatch protocol and `meta/rules.toon` to instruct the worker to call `get_skill('execute-activity')`. No server changes. **Approach C (hybrid):** Both — server surfaces it automatically AND rules/skills reference it explicitly for belt-and-suspenders. |
| Scope | What should NOT be included? | Server-side enforcement (#65), checkpoint enforcement (#51), TOON schema changes, changes to existing domain skills. |
| Success | How will we know traces are being written? | Check for `{artifactPrefix}-semantic-trace.json` in the planning folder. The format is fully specified in execute-activity lines 54-55. |

### Clarifications Made

- **Discoverability vs enforcement:** This work package addresses discoverability (can the worker find the protocol?). Enforcement (does the server reject incomplete work?) is tracked in #65.
- **Three fix approaches identified:** Server-side inclusion in `get_skills`, TOON-only rule/skill updates, or hybrid. The approach decision is deferred to plan-prepare.

---

## Confirmation

**Confirmed by:** Agent-led elicitation (no stakeholder transcript)  
**Date:** 2026-03-30  
**Notes:** Requirements derived from codebase analysis and design-philosophy findings. Three implementation approaches identified; selection deferred to plan-prepare activity.
