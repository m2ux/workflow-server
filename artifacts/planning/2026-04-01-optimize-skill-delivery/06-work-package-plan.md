# Optimize Skill Delivery - Implementation Plan

**Date:** 2026-04-01  
**Priority:** HIGH  
**Status:** Ready  
**Estimated Effort:** 2-3h agentic + 1h review

---

## Overview

### Problem Statement
The workflow server delivers skill content in bulk at session bootstrap and requires agents to pass explicit `skill_id` parameters when loading step-level skills. This forces agents to parse activity definitions to extract skill IDs, hold multiple management skills in context simultaneously, and process voluminous content to find the guidance relevant to their current step.

### Scope
**In Scope:**
- Replace `skill_id` parameter on `get_skill` with `step_id` for step-scoped resolution
- Implement server-side step→skill lookup using activity definition from session context
- Consolidate 5 workflow-level management skills into 2 role-based skills
- Update schemas, validation, and tests

**Out of Scope:**
- TOON schema format changes (skill references remain declarative in activity definitions)
- Workflow transition logic or checkpoint mechanics
- Creating new skills — this restructures existing skill delivery
- Deprecating `get_skills` (continues for backward compatibility)

---

## Proposed Approach

### Solution Design

Replace the current agent-directed skill loading model (`get_skill(skill_id)`) with a step-scoped model (`get_skill(step_id)`) where the server resolves which skill to deliver based on the activity definition.

The server already has all necessary context: `token.act` identifies the current activity, the activity definition contains step-to-skill mappings, and the skill loader can resolve any skill by ID. The change adds a lookup step before the existing `readSkill` call.

Management skills are consolidated per execution role (orchestrator vs worker) so that each role loads a single management skill at bootstrap instead of 3-5 separate skills.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `step_id` only (remove `skill_id`) | Simple, unambiguous API. Agent calls `get_skill` with step context. | Breaking change to existing `get_skill` callers | **Selected** — user requirement for simplicity |
| `step_id` + `skill_id` (both accepted) | Backward compatible | Confusing — two ways to identify a skill | Rejected — user explicitly rejected |
| Implicit step tracking (server auto-delivers) | No agent action needed | Complex state management, removes agent control | Rejected — too invasive |
| Single monolithic management skill | Simplest consolidation | ~50% irrelevant content per role | Rejected — per-role keeps payloads focused |

---

## Implementation Tasks

### Task 1: Modify `get_skill` API — Replace `skill_id` with `step_id` (30-45 min)

**Goal:** Change the `get_skill` tool to accept `step_id` instead of `skill_id`. The server resolves the skill from the activity definition.

**Deliverables:**
- `src/tools/resource-tools.ts` — Replace `skill_id` parameter with `step_id` in tool registration. Add step→skill resolution logic: load workflow via `loadWorkflow`, get activity via `getActivity` using `token.act`, find step by `step_id`, extract `step.skill`, call `readSkill` with extracted skill ID.
- `src/tools/resource-tools.ts` — Return error if `step_id` not found in activity or if `token.act` is not set.
- `src/tools/resource-tools.ts` — Update `advanceToken` call to pass the resolved `skill_id` (preserving trace/audit behavior).

**Dependencies:** None — this is the foundational change.

### Task 2: Update Validation for Step-Scoped Resolution (20-30 min)

**Goal:** Adapt validation logic to work with step-based skill loading.

**Deliverables:**
- `src/utils/validation.ts` — `validateSkillAssociation` no longer needed in its current form (the server resolves the skill from the step, so association is guaranteed). Either remove or simplify to validate that the step exists in the activity.
- `src/utils/validation.ts` — Add `validateStepExists(activity, stepId)` function that checks whether the step ID exists in the activity's steps or loop steps.

**Dependencies:** Task 1 (API change defines what validation is needed).

### Task 3: Update Schemas and Tool Descriptors (15-20 min)

**Goal:** Update JSON schema definitions and MCP tool descriptors to reflect the new API.

**Deliverables:**
- Update MCP tool descriptor for `get_skill` — change parameter from `skill_id` to `step_id` with updated description.
- Verify `schemas/skill.schema.json` does not need changes (skill format is unchanged).
- Verify `schemas/activity.schema.json` does not need changes (step.skill field already exists).

**Dependencies:** Task 1 (API design finalized).

### Task 4: Update Tests (30-45 min)

**Goal:** Update existing tests and add new tests for step-scoped skill resolution.

**Deliverables:**
- `tests/mcp-server.test.ts` — Update `get_skill` tests to use `step_id` instead of `skill_id`. Add tests for: valid step with skill, step not found in activity, no activity in session token, step in loop.
- `tests/validation.test.ts` — Update skill association tests or replace with step existence validation tests.
- `tests/skill-loader.test.ts` — No changes expected (skill loading itself is unchanged).

**Dependencies:** Tasks 1-3 (implementation must exist before tests can run).

### Task 5: Consolidate Management Skills (45-60 min)

**Goal:** Merge 5 workflow-level management skills into 2 role-based skills.

**Deliverables:**
- `workflows/meta/skills/` — Create `orchestrator-management.toon` by merging: orchestrate-workflow (from work-package/skills/24), session-protocol (00), state-management (03), agent-conduct (01). Organize with clear section boundaries.
- `workflows/meta/skills/` — Create `worker-management.toon` by merging: execute-activity (02), session-protocol (00), agent-conduct (01). Organize with clear section boundaries.
- `workflows/work-package/workflow.toon` — Update `skills:` array to reference the 2 new consolidated skills instead of 5.
- Retain original skill files during migration period for other workflows that may reference them individually.

**Dependencies:** Tasks 1-4 (server changes should be working before restructuring skill content).

### Task 6: End-to-End Validation (15-20 min)

**Goal:** Verify the complete flow works end-to-end.

**Deliverables:**
- Run `npm run typecheck` to verify type safety.
- Run `npm test` to verify all tests pass.
- Manual smoke test: start session → next_activity → get_skill with step_id → verify correct skill returned.

**Dependencies:** Tasks 1-5 (all changes implemented).

---

## Success Criteria

### Functional Requirements
- [ ] `get_skill` accepts `step_id` (not `skill_id`) and returns the correct skill for that step
- [ ] Server resolves step→skill mapping from the activity definition using `token.act`
- [ ] Error returned when step_id not found or no activity in session
- [ ] Management skills consolidated into 2 role-based skills (orchestrator, worker)
- [ ] `get_skills` continues to work for backward compatibility
- [ ] All existing tests pass (updated for new API)

### Performance Targets
- [ ] `get_skill` response time: no measurable regression (one additional `getActivity` lookup)
- [ ] Skill content per bootstrap load: 1 skill (down from 3-5)

### Quality Requirements
- [ ] All tests passing (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] No new linting errors

### Measurement Strategy
- Run test suite before and after changes
- Compare `get_skill` response content between old (`skill_id`) and new (`step_id`) modes to verify identical skill content is returned

---

## Dependencies & Risks

### Requires (Blockers)
- [ ] No external dependencies — all changes are internal to the workflow server

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing `get_skill` callers that pass `skill_id` | HIGH | MEDIUM | Coordinate migration; document the API change clearly |
| Management skill consolidation produces oversized payloads | MEDIUM | LOW | Per-role split limits size; resources can be trimmed if needed |
| Step-to-skill resolution adds latency | LOW | LOW | Activity definitions are already loaded by `next_activity`; additional lookup is a dictionary search |
| Other workflows still reference individual management skills | MEDIUM | MEDIUM | Retain original skill files during migration; update other workflows incrementally |

---

**Status:** Ready for implementation
