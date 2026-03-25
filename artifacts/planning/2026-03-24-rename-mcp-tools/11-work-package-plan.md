# Work Package Plan — Server-Side Transition Evaluation

**Created:** 2026-03-25
**Related:** [Orchestrator context concern](07-orchestrator-context-concern.md), [Token as validation aid](08-token-as-validation-aid.md)
**Issue:** #59 | **PR:** #60

---

## Overview

The orchestrator currently loads the full workflow definition (~13KB / 253+ lines for work-package) via `get_workflow` at session start and holds it in context for the entire conversation. By activity 8–10, the definition falls out of effective attention, causing unreliable transition evaluation and degraded orchestration quality.

This plan addresses the problem with two complementary changes:

1. **`evaluate_transitions` tool** — a new MCP tool that evaluates transition conditions server-side. The orchestrator passes its current state variables and the server returns the recommended next activity. The orchestrator no longer needs to read or reason about the transition table.
2. **Workflow summary mode** — a `summary` parameter on `get_workflow` that returns lightweight metadata (rules, variables, modes, activity list) without full activity definitions. This reduces context consumption from ~13KB to ~2KB.

Together, these shift transition logic to the server and eliminate the need to hold the full workflow in context.

---

## Design Decisions

### Why a new tool, not enhance `validate_transition`?

`validate_transition` answers "is this specific transition allowed?" — a binary check after the agent has already decided. `evaluate_transitions` answers "what should the next activity be?" — the server makes the decision. These are fundamentally different operations with different inputs (the latter requires state variables). Keeping both avoids breaking existing agents.

### Why pass variables as a parameter?

The server is stateless by design (the token carries provenance, not state). The orchestrator tracks state variables across the conversation. Passing them per-call is consistent with the stateless model and avoids introducing server-side session storage.

### Checkpoint transitions excluded from evaluation

Checkpoint-driven transitions (`effect.transitionTo`) depend on user choices and are handled by the orchestrator after user input. The `evaluate_transitions` tool only evaluates condition-based transitions from the `transitions` and `decisions` arrays.

### Mode-based activity skipping deferred

Mode semantics (`skipActivities`) remain the orchestrator's responsibility for now. The server could handle this in a future version by accepting active mode IDs alongside variables.

---

## Tasks

### Task 1: `evaluateTransitions()` Function in `workflow-loader.ts`

**File:** `src/loaders/workflow-loader.ts`
**Depends on:** nothing
**Estimate:** 20m agentic + 10m review

Add a pure function that evaluates an activity's transitions against provided state variables.

**Signature:**
```typescript
export interface TransitionCandidate {
  to: string;
  source: 'transition' | 'decision';
  source_id?: string;
  condition_met: boolean | null;  // null = unconditional / default
  is_default: boolean;
}

export interface TransitionEvaluation {
  next_activity: string | null;
  candidates: TransitionCandidate[];
  summary: string;
}

export function evaluateTransitions(
  workflow: Workflow,
  activityId: string,
  variables: Record<string, unknown>,
): TransitionEvaluation
```

**Logic:**
1. Get the activity from the workflow. If not found, return `{ next_activity: null, candidates: [], summary: "Activity not found" }`.
2. Evaluate `activity.transitions[]`:
   - For each transition with a `condition`, call `evaluateCondition(condition, variables)`.
   - Record whether the condition was met. Note default transitions.
3. Evaluate `activity.decisions[]`:
   - For each decision, evaluate each branch's condition.
   - Record matched branches and their `transitionTo` values.
4. Determine `next_activity`:
   - If any conditional transition matched, use the first match.
   - Else if any decision branch matched, use its `transitionTo`.
   - Else use the default transition (or default decision branch).
   - Else `null`.
5. Build a human-readable `summary` explaining the evaluation.

Uses `evaluateCondition()` from `src/schema/condition.schema.ts` (already exists, supports simple/and/or/not).

---

### Task 2: New `evaluate_transitions` Tool in `workflow-tools.ts`

**File:** `src/tools/workflow-tools.ts`
**Depends on:** Task 1
**Estimate:** 20m agentic + 10m review

Register a new MCP tool:

```typescript
server.tool('evaluate_transitions',
  'Evaluate transition conditions for the current activity and return the recommended next activity. Pass your current state variables so the server can evaluate conditions.',
  {
    ...sessionTokenParam,
    workflow_id: z.string().describe('Workflow ID'),
    activity_id: z.string().describe('Current activity ID (the one just completed)'),
    variables: z.record(z.unknown()).describe('Current workflow state variables'),
    step_manifest: stepManifestSchema,
  },
  withAuditLog('evaluate_transitions', async ({ session_token, workflow_id, activity_id, variables, step_manifest }) => {
    // decode token, load workflow, evaluate transitions
    // validate consistency, manifest, version
    // return evaluation result with advanced token
  })
);
```

**Response shape:**
```json
{
  "content": [{
    "type": "text",
    "text": "{\"next_activity\":\"validate\",\"candidates\":[...],\"summary\":\"...\"}"
  }],
  "_meta": {
    "session_token": "<advanced>",
    "validation": { "status": "valid", "warnings": [] }
  }
}
```

The tool includes all existing validations (workflow consistency, version drift, step manifest) plus the transition evaluation.

---

### Task 3: Workflow Summary Mode on `get_workflow`

**File:** `src/tools/workflow-tools.ts`, `src/loaders/workflow-loader.ts`
**Depends on:** nothing
**Estimate:** 20m agentic + 10m review

Add an optional `summary` parameter to `get_workflow`:

```typescript
summary: z.boolean().default(false).describe(
  'When true, return lightweight metadata only (rules, variables, modes, activity list). '
  + 'Omits full activity definitions and transition tables. Use for orchestration.'
)
```

When `summary=true`, transform the workflow before returning:

```typescript
interface WorkflowSummary {
  id: string;
  version: string;
  title: string;
  description?: string;
  rules?: string[];
  variables?: VariableDefinition[];
  modes?: Mode[];
  artifactLocations?: Record<string, ArtifactLocation>;
  initialActivity?: string;
  activities: Array<{
    id: string;
    name: string;
    description?: string;
    required: boolean;
    estimatedTime?: string;
  }>;
}
```

Helper function in `workflow-loader.ts`:

```typescript
export function toWorkflowSummary(workflow: Workflow): WorkflowSummary
```

**Size impact estimate** (work-package workflow):
| Mode | Approximate JSON size |
|------|-----------------------|
| Full (`summary=false`) | ~13KB, 14 full activity definitions |
| Summary (`summary=true`) | ~2KB, metadata + 14 activity stubs |

---

### Task 4: Update `help` Tool Bootstrap Guidance

**File:** `src/tools/workflow-tools.ts`
**Depends on:** Tasks 2, 3
**Estimate:** 10m agentic + 5m review

Update the `help` tool's bootstrap sequence to recommend the new orchestration pattern:

```
step_1: list_workflows
step_2: start_session
step_3: get_workflow (summary=true) — load rules, variables, modes, activity list
step_4: get_activity — load the initial activity for execution
...
step_N: evaluate_transitions — after completing an activity, ask the server for the next one
```

Add `evaluate_transitions` to the tool documentation within the help response. Note that `get_workflow` without `summary=true` is still available for agents that need the full definition.

---

### Task 5: Unit Tests for `evaluateTransitions()`

**File:** `tests/workflow-loader.test.ts` (extend) or `tests/transition-evaluation.test.ts` (new)
**Depends on:** Task 1
**Estimate:** 25m agentic + 10m review

See [test plan](11-test-plan.md) for specific cases. Key scenarios:
- Single default transition (no conditions)
- Conditional transition that matches
- Conditional transition that doesn't match, falls through to default
- Decision branch evaluation
- Multiple transitions, first match wins
- No matching transitions (returns null)
- Activity not found
- Variables with nested paths

---

### Task 6: Integration Tests for `evaluate_transitions` Tool

**File:** `tests/mcp-server.test.ts`
**Depends on:** Tasks 2, 5
**Estimate:** 20m agentic + 10m review

See [test plan](11-test-plan.md). Tests the full MCP tool call path: token decode → workflow load → transition evaluation → response with validation.

---

### Task 7: Integration Tests for `get_workflow` Summary Mode

**File:** `tests/mcp-server.test.ts`
**Depends on:** Task 3
**Estimate:** 15m agentic + 5m review

See [test plan](11-test-plan.md). Verify summary response contains metadata but not full activity definitions.

---

### Task 8: Documentation Updates

**Files:** `README.md`, `docs/api-reference.md`
**Depends on:** Tasks 2, 3, 4
**Estimate:** 15m agentic + 5m review

- Document the `evaluate_transitions` tool (parameters, response shape, usage pattern).
- Document the `summary` parameter on `get_workflow`.
- Add a section on the recommended orchestration pattern (summary + evaluate_transitions).
- Note that `validate_transition` remains available but `evaluate_transitions` is preferred for orchestrators.

---

## Dependency Graph

```
Task 1 (evaluateTransitions function)
  └─► Task 2 (evaluate_transitions tool)
        └─► Task 4 (update help bootstrap)
        └─► Task 6 (integration tests)
        └─► Task 8 (documentation)

Task 1 ──► Task 5 (unit tests)

Task 3 (summary mode)
  └─► Task 4 (update help bootstrap)
  └─► Task 7 (integration tests)
  └─► Task 8 (documentation)
```

**Parallelizable:** Tasks 1+3 (independent), Tasks 5+7 (independent), Tasks 6+7 (independent).

---

## Total Estimates

| Phase | Agentic Time | Human Review |
|-------|-------------|--------------|
| Core logic (Tasks 1, 2) | 40m | 20m |
| Summary mode (Task 3) | 20m | 10m |
| Bootstrap update (Task 4) | 10m | 5m |
| Tests (Tasks 5, 6, 7) | 60m | 25m |
| Documentation (Task 8) | 15m | 5m |
| **Total** | **~2.5h** | **~1h** |

---

## Assumptions

1. **`evaluateCondition()` is reusable as-is.** The existing function in `condition.schema.ts` handles all condition types (simple, and, or, not) and accepts a `Record<string, unknown>` for variables. No modifications needed.
2. **Variables are passed flat.** The orchestrator's state variables use the same key names as defined in the workflow's `variables[]` section. Nested dot-path access is already handled by `getVariableValue()` in `condition.schema.ts`.
3. **Checkpoint transitions are not evaluated.** Checkpoint-driven transitions (`effect.transitionTo`) depend on user choices and remain the orchestrator's responsibility. The `evaluate_transitions` tool does not resolve them.
4. **Mode-based activity skipping stays agent-side.** Mode semantics (`modes[].skipActivities`) are not handled by `evaluate_transitions` in this iteration. The orchestrator applies mode skips after receiving the evaluation result.
5. **`validate_transition` is not deprecated.** It remains for backward compatibility and for agents that want explicit validation of a specific transition. It may be marked as deprecated in a future release.
6. **Summary mode is backward compatible.** The `summary` parameter defaults to `false`, so existing agents using `get_workflow` continue to receive the full definition.
7. **Server remains stateless.** Variables are passed per-call rather than stored server-side. This is consistent with the token-based stateless design.
8. **First-match semantics for conditional transitions.** When multiple conditional transitions match, the first one (in definition order) wins. This matches the linear evaluation model that agents currently use when reading the transition table.
