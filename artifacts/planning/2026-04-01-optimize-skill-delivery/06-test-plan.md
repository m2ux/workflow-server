# Test Plan: Optimize Skill Delivery

**Ticket:** [#96](https://github.com/m2ux/workflow-server/issues/96)  
**PR:** [#97](https://github.com/m2ux/workflow-server/pull/97)

---

## Overview

This test plan validates the step-scoped skill delivery optimization: replacing `skill_id` with `step_id` on the `get_skill` tool, server-side step→skill resolution, and management skill consolidation.

Key changes to validate:
1. `get_skill` tool handler — accepts `step_id`, resolves skill from activity definition
2. `validateSkillAssociation` / `validateStepExists` — updated validation logic
3. Management skill consolidation — 2 role-based skills replace 5 individual skills

---

## Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| [PR97-TC-01](../../../tests/mcp-server.test.ts#L248) | Verify `get_skill` with valid `step_id` returns the correct skill | Unit |
| [PR97-TC-02](../../../tests/mcp-server.test.ts#L337) | Verify `get_skill` with `step_id` includes bundled `_resources` | Unit |
| [PR97-TC-03](../../../tests/mcp-server.test.ts#L274) | Verify `get_skill` returns error when `step_id` not found in activity | Unit |
| [PR97-TC-04](../../../tests/mcp-server.test.ts#L266) | Verify `get_skill` returns error when no activity in session token | Unit |
| [PR97-TC-05](../../../tests/mcp-server.test.ts#L302) | Verify `get_skill` resolves skill from loop step | Unit |
| [PR97-TC-06](../../../tests/mcp-server.test.ts#L288) | Verify `get_skill` errors when step has no skill | Unit |
| [PR97-TC-07](../../../tests/mcp-server.test.ts#L274) | Verify step not found error includes available step IDs | Unit |
| [PR97-TC-08](../../../tests/mcp-server.test.ts#L420) | Verify `get_skills` returns consolidated workflow-level skills | Unit |
| [PR97-TC-09](../../../tests/mcp-server.test.ts#L420) | Verify `orchestrator-management` in `get_skills` response | Unit |
| [PR97-TC-10](../../../tests/mcp-server.test.ts#L420) | Verify `worker-management` in `get_skills` response | Unit |
| [PR97-TC-11](../../../tests/mcp-server.test.ts#L319) | Verify `get_skill` token advanced with resolved skill ID | Unit |
| [PR97-TC-12](../../../tests/mcp-server.test.ts#L510) | Verify bare-index resource resolves via step-scoped `get_skill` | Unit |

---

## Test Case Details

### PR97-TC-01: Step-scoped skill resolution — happy path
**Objective:** Verify `get_skill` with a valid `step_id` returns the correct skill for that step.
**Steps:**
1. Start session, advance to an activity with step-level skill declarations
2. Call `get_skill` with `step_id` matching a step that declares `skill: "classify-problem"`
3. Verify response contains the classify-problem skill definition
**Expected Result:** Response contains `{ skill: { id: "classify-problem", ... } }` with correct skill content.

### PR97-TC-02: Step-scoped skill with resources
**Objective:** Verify resources are resolved and bundled when loading via `step_id`.
**Steps:**
1. Start session, advance to an activity
2. Call `get_skill` with `step_id` for a step whose skill declares resource references
3. Verify `_resources` array is populated
**Expected Result:** Skill response includes `_resources` with resolved resource content.

### PR97-TC-03: Step not found
**Objective:** Verify error when `step_id` does not exist in the current activity.
**Steps:**
1. Start session, advance to an activity
2. Call `get_skill` with `step_id: "nonexistent-step"`
**Expected Result:** Error response indicating step not found in activity.

### PR97-TC-04: No activity in session
**Objective:** Verify error when calling `get_skill` without first entering an activity.
**Steps:**
1. Start session (no `next_activity` call)
2. Call `get_skill` with `step_id: "any-step"`
**Expected Result:** Error response indicating no current activity in session.

### PR97-TC-05: Loop step resolution
**Objective:** Verify `get_skill` resolves skills from steps inside loop definitions.
**Steps:**
1. Start session, advance to an activity with a loop containing steps with skill declarations
2. Call `get_skill` with `step_id` matching a loop step
3. Verify correct skill is returned
**Expected Result:** Skill from the loop step is returned correctly.

### PR97-TC-06: `skill_id` parameter rejected
**Objective:** Verify `get_skill` no longer accepts the old `skill_id` parameter.
**Steps:**
1. Call `get_skill` with `skill_id` instead of `step_id`
**Expected Result:** Parameter validation error — `skill_id` is not a recognized parameter.

### PR97-TC-07: Step existence validation
**Objective:** Verify step validation correctly identifies valid and invalid step IDs.
**Steps:**
1. Call `validateStepExists` with a valid step ID → returns null (valid)
2. Call `validateStepExists` with an invalid step ID → returns warning string
**Expected Result:** Valid steps return null, invalid steps return descriptive warning.

### PR97-TC-08: `get_skills` backward compatibility
**Objective:** Verify `get_skills` continues to return workflow-level skills unchanged.
**Steps:**
1. Start session
2. Call `get_skills` with `workflow_id`
3. Verify response contains the consolidated management skills
**Expected Result:** Response has `scope: "workflow"` with skills from `workflow.skills[]`.

### PR97-TC-09: Orchestrator management skill content
**Objective:** Verify the consolidated orchestrator-management skill contains all required content.
**Steps:**
1. Load orchestrator-management skill
2. Verify it contains protocol sections from: orchestrate-workflow, session-protocol, state-management, agent-conduct
**Expected Result:** All 4 original skill capabilities are present in the consolidated skill.

### PR97-TC-10: Worker management skill content
**Objective:** Verify the consolidated worker-management skill contains all required content.
**Steps:**
1. Load worker-management skill
2. Verify it contains protocol sections from: execute-activity, session-protocol, agent-conduct
**Expected Result:** All 3 original skill capabilities are present in the consolidated skill.

### PR97-TC-11: Token advancement with resolved skill
**Objective:** Verify the session token records the resolved skill ID after step-scoped loading.
**Steps:**
1. Call `get_skill` with `step_id` for a step declaring `skill: "create-plan"`
2. Examine `_meta.session_token` in the response
**Expected Result:** Advanced token's skill field contains "create-plan" (the resolved skill, not the step ID).

### PR97-TC-12: Cross-workflow skill resolution via step
**Objective:** Verify step-scoped resolution works when a step references a skill from a different workflow.
**Steps:**
1. Advance to an activity with a step whose skill exists in the meta/skills directory
2. Call `get_skill` with that step's `step_id`
3. Verify the universal skill is returned
**Expected Result:** Skill from meta/skills/ is found and returned via the standard resolution chain.

---

## Running Tests

*Commands will be added after implementation.*

```bash
# Run all tests
nice -n 19 npm test

# Run specific test file
nice -n 19 npm test -- tests/mcp-server.test.ts

# Type checking
nice -n 19 npm run typecheck
```

---

**Status:** Initial — source links and detailed steps to be finalized after implementation
