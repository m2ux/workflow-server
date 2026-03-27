# Checkpoint Enforcement Reliability — Implementation Plan

**Date:** 2026-03-12  
**Priority:** HIGH  
**Status:** Planning  
**Estimated Effort:** 2-3h agentic + 1h review

---

## Overview

### Problem Statement

The orchestrator/worker execution model relies on prompt instructions for checkpoint enforcement. The worker sub-agent frequently bypasses required blocking checkpoints due to LLM completion bias, and the orchestrator accepts the result without validating checkpoint coverage. Users are locked out of workflow decisions the system was designed to surface.

### Scope

**In Scope:**
- Server-side validation tool for activity completion (`validate_activity_completion`)
- Orchestrator skill updates to use validation tool and enumerate blocking checkpoints
- Worker skill updates to enumerate and reinforce blocking checkpoint yield behavior
- Architecture evaluation document (stateful gates, decomposition, prerequisite migration)
- Tests for new validation tool

**Out of Scope:**
- MCP protocol changes
- Stateful server-side checkpoint gates (evaluated, not implemented)
- Prerequisite migration from strings to structured conditions (evaluated, not implemented)
- Activity decomposition (evaluated, not implemented)
- Changes to LLM provider behavior

---

## Proposed Approach

### Solution Design

Implement defense-in-depth across three layers:

1. **Server-side validation tool**: A deterministic `validate_activity_completion` tool that cross-references `checkpoints_responded` against required blocking checkpoints from the activity definition. This moves the critical validation from prompt instructions (unreliable) to server code (deterministic).

2. **Orchestrator skill hardening**: Update `orchestrate-workflow` skill to (a) call `validate_activity_completion` in the `process-result` step, and (b) enumerate blocking checkpoints in the worker dispatch prompt.

3. **Worker skill hardening**: Update `execute-activity` skill to (a) enumerate blocking checkpoints during bootstrap, and (b) include explicit checkpoint coverage requirements in the completion output format.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Prompt-only enforcement (skill TOON changes only) | No server code changes; simple | Still relies on LLM compliance for validation; orchestrator can skip the validation step | Rejected as sole approach |
| Server-side validation tool + skill hardening | Deterministic validation; defense-in-depth | Requires TypeScript changes to `src/` | **Selected** |
| Full stateful server-side gates | Strongest enforcement; impossible to bypass | Breaks stateless architecture; requires session management, persistence, cleanup | Deferred to evaluation |
| Activity decomposition | Eliminates multi-checkpoint activities | Fragments workflow definitions; high authoring cost | Deferred to evaluation |

### Key Design Decisions

1. **Validation tool is read-only** — It accepts checkpoint data and returns pass/fail. It does not track state or block tool calls. This preserves the stateless server architecture.

2. **Prerequisite handling is pragmatic** — The tool reports which checkpoints have prerequisites (as metadata) but does not evaluate string prerequisites. The orchestrator uses context to determine which prerequisite-dependent checkpoints are applicable.

3. **Blocking checkpoint enumeration in dispatch** — The orchestrator includes the list of required blocking checkpoints in the worker prompt. This gives the worker explicit, machine-readable knowledge of where it must yield.

4. **Backward compatibility** — No schema changes. The new tool is additive. Skill TOON changes are backward-compatible (existing orchestrators/workers will continue to work; they just won't call the new tool).

---

## Implementation Tasks

### Task 1: Add `getBlockingCheckpoints` Helper (15-20 min)

**Goal:** Extract required blocking checkpoints from a loaded activity definition.  
**Dependencies:** None  
**Deliverables:**
- `src/loaders/workflow-loader.ts` — New exported function `getBlockingCheckpoints(workflow, activityId)` that returns an array of `{ id, name, hasPrerequisite, prerequisite }` for all checkpoints where `required: true` and `blocking: true` (or defaults)

### Task 2: Add `validate_activity_completion` Tool (20-30 min)

**Goal:** Server-side deterministic validation of activity completion against required checkpoints and steps.  
**Dependencies:** Task 1  
**Deliverables:**
- `src/tools/workflow-tools.ts` — New tool registration for `validate_activity_completion`
  - Parameters: `workflow_id`, `activity_id`, `checkpoints_responded` (string[]), `steps_completed` (string[])
  - Returns: `{ valid, missing_checkpoints, missing_steps, blocking_checkpoints_total }`
- `src/server.ts` — Update tool list in logging

### Task 3: Add Tests for Validation Tool (20-30 min)

**Goal:** Verify validation logic handles all checkpoint scenarios correctly.  
**Dependencies:** Task 2  
**Deliverables:**
- `tests/mcp-server.test.ts` — New test describe block for `validate_activity_completion`
  - Test: all blocking checkpoints responded → valid
  - Test: missing blocking checkpoint → invalid with missing list
  - Test: non-blocking checkpoints not required → valid even if absent
  - Test: activity with no checkpoints → valid
  - Test: missing required steps → invalid with missing list
  - Test: prerequisite metadata included in response

### Task 4: Update `orchestrate-workflow` Skill (20-30 min)

**Goal:** Make orchestrator validation deterministic by calling the server-side tool and by enumerating blocking checkpoints in worker dispatch.  
**Dependencies:** Task 2  
**Deliverables:**
- `workflows/meta/skills/04-orchestrate-workflow.toon` — Updates to:
  - `dispatch-activity` protocol: extract and pass blocking checkpoint enumeration to worker
  - `process-result` protocol: call `validate_activity_completion` before accepting `activity_complete`
  - `tools` section: add `validate_activity_completion` tool definition
  - `rules` section: add `checkpoint-validation-mandatory` rule

### Task 5: Update `execute-activity` Skill (15-20 min)

**Goal:** Make worker aware of which checkpoints are blocking and reinforce yield behavior.  
**Dependencies:** None (can parallel with Tasks 1-3)  
**Deliverables:**
- `workflows/meta/skills/05-execute-activity.toon` — Updates to:
  - `bootstrap-activity` protocol: add step to enumerate blocking checkpoints from loaded activity definition
  - `yield-checkpoint` protocol: clarify blocking vs non-blocking handling
  - `report-completion` protocol: require explicit blocking checkpoint coverage in output
  - `rules` section: strengthen `checkpoint-yield` rule with enumeration requirement

### Task 6: Architecture Evaluation Document (15-20 min)

**Goal:** Document evaluation of deeper architectural approaches per US-3.  
**Dependencies:** None (can parallel with implementation tasks)  
**Deliverables:**
- `.engineering/artifacts/planning/2026-03-12-checkpoint-enforcement-reliability/06-architecture-evaluation.md`
  - Evaluation of stateful server-side checkpoint gates
  - Evaluation of activity decomposition for high-checkpoint-density activities
  - Evaluation of prerequisite field migration to ConditionSchema
  - Trade-off analysis and recommendations for each

---

## Task Dependency Graph

```
Task 1 (helper) ──→ Task 2 (tool) ──→ Task 3 (tests)
                                    ──→ Task 4 (orchestrator skill)
Task 5 (worker skill)  [independent]
Task 6 (arch eval doc)  [independent]
```

Tasks 5 and 6 can execute in parallel with Tasks 1-4.

---

## Success Criteria

### Functional Requirements

- [ ] `validate_activity_completion` tool returns `valid: false` when required blocking checkpoints are missing from `checkpoints_responded` (US-1)
- [ ] `validate_activity_completion` tool returns `valid: true` when all required blocking checkpoints are present (US-1)
- [ ] Non-blocking checkpoints are excluded from validation (US-1)
- [ ] Orchestrator skill calls `validate_activity_completion` before accepting `activity_complete` (US-1)
- [ ] Worker prompt enumerates blocking checkpoints per activity (US-2)
- [ ] Worker skill requires explicit checkpoint coverage in completion output (US-2)
- [ ] Architecture evaluation completed with trade-offs documented (US-3)

### Quality Requirements

- [ ] All existing tests pass (no regressions)
- [ ] New validation tool has test coverage for all described scenarios
- [ ] TypeScript strict mode compliance (`npm run typecheck`)
- [ ] Backward compatibility with existing workflow definitions

---

## Testing Strategy

### Unit Tests
- `getBlockingCheckpoints` helper: activities with checkpoints, without checkpoints, with mixed blocking/non-blocking
- `validate_activity_completion` tool: valid completion, missing checkpoints, missing steps, prerequisite metadata

### Integration Tests
- MCP tool call through client: `validate_activity_completion` end-to-end via `InMemoryTransport`

### Manual Validation
- Execute a work-package workflow and verify the orchestrator calls `validate_activity_completion` before accepting activity_complete

---

## Dependencies & Risks

### Requires (Blockers)
- [x] Codebase comprehension complete (checkpoint inventory, schema understanding)
- [x] Design philosophy complete (problem classification, success criteria)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Orchestrator LLM ignores validation tool call | HIGH | MEDIUM | Tool is defense-in-depth alongside prompt hardening; reduces but doesn't eliminate the risk |
| Skill TOON changes increase context window usage | LOW | LOW | Changes are small additions to existing skill definitions |
| String prerequisites prevent complete server-side validation | MEDIUM | HIGH | Tool reports prerequisite metadata; orchestrator handles filtering; prerequisite migration deferred |

---

**Status:** Ready for review
