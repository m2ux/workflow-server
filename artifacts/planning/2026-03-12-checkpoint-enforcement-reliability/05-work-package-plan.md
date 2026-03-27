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
- Helper function to extract blocking checkpoints from activity definitions (`getBlockingCheckpoints`)
- Orchestrator skill updates to call validation tool and enumerate blocking checkpoints in worker dispatch
- Worker skill updates to enumerate blocking checkpoints during bootstrap and require explicit checkpoint coverage in completion output
- Architecture evaluation document (stateful gates, activity decomposition, prerequisite migration)
- Tests for new validation tool and helper

**Out of Scope:**
- MCP protocol changes or SDK modifications
- Stateful server-side checkpoint gates (evaluated, not implemented)
- Prerequisite migration from strings to structured `ConditionSchema` (evaluated, not implemented)
- Activity decomposition into micro-activities (evaluated, not implemented)
- Changes to LLM provider behavior or model selection

---

## Research & Analysis

*See companion artifacts for full details:*
- **Comprehension artifact:** [orchestration.md](../../comprehension/orchestration.md)
- **Design philosophy:** [01-design-philosophy.md](01-design-philosophy.md)
- **Assumptions log:** [01-assumptions-log.md](01-assumptions-log.md)

### Key Findings Summary

**From Comprehension:**
- The server is stateless and read-only — no enforcement middleware exists
- `CheckpointSchema` has `required`/`blocking` flags and `prerequisite` (string) — the data model supports enforcement but no code uses it
- `evaluateCondition()` operates on structured `Condition` objects; prerequisites are strings and cannot use it
- 19 blocking checkpoints across 8 activities in work-package; 9 have prerequisites
- `McpServer` has no middleware/interceptor pattern; enforcement requires a new tool or handler wrapping

**From Design Philosophy:**
- Problem classified as Specific Problem, Known Cause, Moderate Complexity
- Three-level defense-in-depth strategy: server validation → orchestrator hardening → worker hardening
- Backward compatibility and stateless architecture preservation are hard constraints

---

## Proposed Approach

### Solution Design

Implement defense-in-depth across three layers:

1. **Server-side validation tool** (`validate_activity_completion`): A deterministic tool that cross-references `checkpoints_responded` against required blocking checkpoints from the activity definition. Moves critical validation from prompt instructions (unreliable) to server code (deterministic). The tool is read-only — it accepts data, validates it, and returns a result without tracking state.

2. **Orchestrator skill hardening** (`04-orchestrate-workflow.toon`): Update the `process-result` protocol to call `validate_activity_completion` before accepting `activity_complete`. Update `dispatch-activity` to enumerate the activity's blocking checkpoints in the worker prompt, giving the worker explicit knowledge of where it must yield.

3. **Worker skill hardening** (`05-execute-activity.toon`): Update `bootstrap-activity` to enumerate blocking checkpoints from the loaded activity definition. Update `report-completion` to require explicit checkpoint coverage data in the output. Strengthen the `checkpoint-yield` rule.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Prompt-only (skill TOON changes only) | No server code changes | Still relies on LLM compliance for validation | Rejected as sole approach |
| Validation tool + skill hardening | Deterministic validation; defense-in-depth | Requires TypeScript changes to `src/` | **Selected** |
| Full stateful server-side gates | Strongest enforcement; impossible to bypass | Breaks stateless architecture; session management | Deferred to evaluation |
| Activity decomposition | Eliminates multi-checkpoint activities | Fragments workflow definitions; high authoring cost | Deferred to evaluation |

### Key Design Decisions

1. **Validation tool is read-only** — Accepts checkpoint data and returns pass/fail without tracking state. Preserves the stateless server architecture.

2. **Prerequisite handling is pragmatic** — The tool reports which checkpoints have prerequisites (as metadata) but does not evaluate string prerequisites. The orchestrator applies prerequisite knowledge from its context to determine which prerequisite-dependent checkpoints are applicable.

3. **Blocking checkpoint enumeration in dispatch** — The orchestrator includes required blocking checkpoints in the worker prompt. This gives the worker a machine-readable inventory of where it must yield, reducing reliance on the worker parsing the activity definition correctly.

4. **Backward compatibility** — No schema changes. The new tool is additive. Skill TOON changes are backward-compatible — existing orchestrators/workers continue to work without calling the new tool.

---

## Implementation Tasks

### Task 1: Add `getBlockingCheckpoints` Helper (15-20 min)

**Goal:** Extract required blocking checkpoints from a loaded activity definition.  
**Dependencies:** None  
**Deliverables:**
- `src/loaders/workflow-loader.ts` — New exported function `getBlockingCheckpoints(workflow, activityId)` returning an array of `{ id, name, hasPrerequisite, prerequisite }` for all checkpoints where `required !== false` and `blocking !== false`

### Task 2: Add `validate_activity_completion` Tool (20-30 min)

**Goal:** Server-side deterministic validation of activity completion against required checkpoints and steps.  
**Dependencies:** Task 1  
**Deliverables:**
- `src/tools/workflow-tools.ts` — New tool registration for `validate_activity_completion`
  - Input: `workflow_id`, `activity_id`, `checkpoints_responded` (string[]), `steps_completed` (string[])
  - Output: `{ valid, missing_checkpoints, missing_steps, blocking_checkpoints_total, blocking_checkpoints_with_prerequisite }`
- `src/server.ts` — Update tool count in registration logging (if applicable)

### Task 3: Add Tests for Validation Tool and Helper (20-30 min)

**Goal:** Verify validation logic handles all checkpoint scenarios correctly.  
**Dependencies:** Task 2  
**Deliverables:**
- `tests/mcp-server.test.ts` — New test describe block for `validate_activity_completion`:
  - All blocking checkpoints responded → valid
  - Missing blocking checkpoint → invalid with missing list
  - Non-blocking checkpoints not required → valid even if absent
  - Activity with no checkpoints → valid
  - Missing required steps → invalid with missing step list
  - Prerequisite metadata included in response
- `tests/mcp-server.test.ts` — New test describe block for `getBlockingCheckpoints`:
  - Returns blocking checkpoints from a real activity
  - Excludes non-blocking checkpoints
  - Returns empty array for no-checkpoint activities
  - Includes prerequisite metadata

### Task 4: Update `orchestrate-workflow` Skill (20-30 min)

**Goal:** Make orchestrator validation deterministic by calling the server-side tool and enumerating blocking checkpoints.  
**Dependencies:** Task 2 (tool must exist for skill to reference it)  
**Deliverables:**
- `workflows/meta/skills/04-orchestrate-workflow.toon` — Updates to:
  - `dispatch-activity` protocol: call `get_workflow_activity`, extract blocking checkpoints, include them in worker dispatch prompt
  - `process-result` protocol: call `validate_activity_completion` before accepting `activity_complete`; reject result if `valid: false`
  - `tools` section: add `validate_activity_completion` tool definition
  - `rules` section: add `checkpoint-validation-mandatory` rule

### Task 5: Update `execute-activity` Skill (15-20 min)

**Goal:** Make worker aware of which checkpoints are blocking and reinforce yield behavior.  
**Dependencies:** None (can execute in parallel with Tasks 1-3)  
**Deliverables:**
- `workflows/meta/skills/05-execute-activity.toon` — Updates to:
  - `bootstrap-activity` protocol: add step to enumerate blocking checkpoints from loaded activity definition and list them explicitly
  - `yield-checkpoint` protocol: clarify blocking vs non-blocking handling
  - `report-completion` protocol: require explicit `blocking_checkpoints_applicable` and `blocking_checkpoints_yielded` in completion output
  - `rules` section: strengthen `checkpoint-yield` rule with enumeration requirement

### Task 6: Architecture Evaluation Document (15-20 min)

**Goal:** Document evaluation of deeper architectural approaches per issue #51 US-3.  
**Dependencies:** None (can execute in parallel with implementation tasks)  
**Deliverables:**
- `.engineering/artifacts/planning/2026-03-12-checkpoint-enforcement-reliability/05-architecture-evaluation.md`
  - Evaluation of stateful server-side checkpoint gates (feasibility, trade-offs, effort)
  - Evaluation of activity decomposition for high-checkpoint-density activities
  - Evaluation of prerequisite field migration from strings to `ConditionSchema`
  - Prioritized recommendations

---

## Task Dependency Graph

```
Task 1 (helper) ──→ Task 2 (tool) ──→ Task 3 (tests)
                                   ──→ Task 4 (orchestrator skill)
Task 5 (worker skill)  [independent — parallel with 1-4]
Task 6 (arch eval doc)  [independent — parallel with 1-5]
```

Optimal execution order: Task 1 → Task 2 → Task 3, then Task 4. Tasks 5 and 6 can execute at any point.

---

## Success Criteria

### Functional Requirements

- [ ] `validate_activity_completion` returns `valid: false` when required blocking checkpoints are missing from `checkpoints_responded` (US-1)
- [ ] `validate_activity_completion` returns `valid: true` when all required blocking checkpoints are present (US-1)
- [ ] Non-blocking checkpoints are excluded from mandatory validation (US-1)
- [ ] Orchestrator skill calls `validate_activity_completion` before accepting `activity_complete` (US-1)
- [ ] Worker prompt enumerates blocking checkpoints per activity (US-2)
- [ ] Worker skill requires explicit checkpoint coverage in completion output (US-2)
- [ ] Architecture evaluation completed with trade-offs documented (US-3)

### Quality Requirements

- [ ] All existing tests pass (no regressions)
- [ ] New validation tool and helper have test coverage for all described scenarios
- [ ] TypeScript strict mode compliance (`npm run typecheck`)
- [ ] Backward compatibility with existing workflow definitions

### Measurement Strategy

- `npm test` — all test suites pass, including new validation tests
- `npm run typecheck` — zero type errors
- Manual workflow execution — verify orchestrator calls `validate_activity_completion`

---

## Testing Strategy

### Unit Tests
- `getBlockingCheckpoints`: activities with checkpoints, without checkpoints, with mixed blocking/non-blocking, prerequisite metadata
- `validate_activity_completion`: valid completion, missing checkpoints, missing steps, prerequisite metadata, empty activity

### Integration Tests
- MCP tool call through `InMemoryTransport` + `Client`: `validate_activity_completion` end-to-end
- Regression: existing tools (`get_workflow`, `get_checkpoint`) continue to function

### Manual Validation
- Execute a work-package workflow and verify the orchestrator calls `validate_activity_completion` before accepting `activity_complete`

---

## Dependencies & Risks

### Requires (Blockers)

- [x] Codebase comprehension complete (checkpoint inventory, schema understanding)
- [x] Design philosophy complete (problem classification, success criteria)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Orchestrator LLM ignores validation tool call instruction | HIGH | MEDIUM | Defense-in-depth: tool exists as a structural option; skill rules make it mandatory; worker-side hardening reduces bypass frequency |
| Skill TOON changes increase context window usage | LOW | LOW | Changes are small additions to existing skill definitions; net token increase is minimal |
| String prerequisites prevent complete server-side validation | MEDIUM | HIGH | Tool reports prerequisite metadata; orchestrator handles filtering; prerequisite migration documented in architecture evaluation |
| Worker ignores blocking checkpoint enumeration | MEDIUM | MEDIUM | Validation tool catches the bypass at the orchestrator level regardless |

---

**Status:** Ready for review
