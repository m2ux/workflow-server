# Test Plan — Server-Side Transition Evaluation

**Created:** 2026-03-25
**Related:** [Implementation plan](11-work-package-plan.md)

---

## 1. Unit Tests — `evaluateTransitions()`

### 1.1 Basic Transition Evaluation

**File:** `tests/workflow-loader.test.ts` (extend) or `tests/transition-evaluation.test.ts` (new)

Test fixtures: minimal `Workflow` objects with controlled transition structures.

**Fixture: simple-linear**
```
activity A → transitions: [{ to: "B", isDefault: true }]
activity B → transitions: [{ to: "C", isDefault: true }]
activity C → (no transitions, terminal)
```

**Fixture: conditional-branch**
```
activity A → transitions: [
  { to: "B", condition: { type: "simple", variable: "has_blocker", operator: "==", value: true } },
  { to: "C", isDefault: true }
]
```

**Fixture: decision-branch**
```
activity A → decisions: [{
  id: "route-decision",
  name: "Route",
  branches: [
    { id: "fast", condition: { type: "simple", variable: "complexity", operator: "==", value: "simple" }, transitionTo: "B" },
    { id: "full", isDefault: true, transitionTo: "C" }
  ]
}]
```

| # | Test Case | Activity | Variables | Expected |
|---|-----------|----------|-----------|----------|
| E1 | Single default transition | A (simple-linear) | `{}` | `next_activity: "B"`, 1 candidate, `is_default: true` |
| E2 | Terminal activity (no transitions) | C (simple-linear) | `{}` | `next_activity: null`, 0 candidates |
| E3 | Conditional match → takes conditional | A (conditional-branch) | `{ has_blocker: true }` | `next_activity: "B"`, condition_met: true |
| E4 | Conditional miss → falls to default | A (conditional-branch) | `{ has_blocker: false }` | `next_activity: "C"`, first candidate condition_met: false, second is_default |
| E5 | Conditional miss (variable absent) → falls to default | A (conditional-branch) | `{}` | `next_activity: "C"` |
| E6 | Decision branch match | A (decision-branch) | `{ complexity: "simple" }` | `next_activity: "B"`, source: "decision" |
| E7 | Decision branch miss → default branch | A (decision-branch) | `{ complexity: "complex" }` | `next_activity: "C"`, source: "decision" |
| E8 | Activity not found | "nonexistent" | `{}` | `next_activity: null`, summary contains "not found" |

### 1.2 Complex Condition Evaluation

**Fixture: compound-conditions**
```
activity A → transitions: [
  { to: "B", condition: {
    type: "and",
    conditions: [
      { type: "simple", variable: "review_passed", operator: "==", value: true },
      { type: "simple", variable: "tests_passing", operator: "==", value: true }
    ]
  }},
  { to: "C", isDefault: true }
]
```

| # | Test Case | Variables | Expected |
|---|-----------|-----------|----------|
| E9 | AND condition — both true | `{ review_passed: true, tests_passing: true }` | `next_activity: "B"` |
| E10 | AND condition — one false | `{ review_passed: true, tests_passing: false }` | `next_activity: "C"` (default) |
| E11 | AND condition — both false | `{ review_passed: false, tests_passing: false }` | `next_activity: "C"` (default) |

### 1.3 Multiple Conditional Transitions (First-Match Semantics)

**Fixture: multi-conditional**
```
activity A → transitions: [
  { to: "B", condition: { type: "simple", variable: "priority", operator: "==", value: "high" } },
  { to: "C", condition: { type: "simple", variable: "priority", operator: "==", value: "low" } },
  { to: "D", isDefault: true }
]
```

| # | Test Case | Variables | Expected |
|---|-----------|-----------|----------|
| E12 | First conditional matches | `{ priority: "high" }` | `next_activity: "B"` |
| E13 | Second conditional matches | `{ priority: "low" }` | `next_activity: "C"` |
| E14 | Neither matches → default | `{ priority: "medium" }` | `next_activity: "D"` |
| E15 | All candidates reported | `{ priority: "high" }` | 3 candidates in result, first has condition_met: true |

### 1.4 Mixed Sources (Transitions + Decisions)

**Fixture: mixed-sources**
```
activity A →
  transitions: [{ to: "B", isDefault: true }]
  decisions: [{
    id: "override",
    branches: [
      { id: "skip", condition: { ... variable: "fast_track" ... }, transitionTo: "C" },
      { id: "normal", isDefault: true, transitionTo: "B" }
    ]
  }]
```

| # | Test Case | Variables | Expected |
|---|-----------|-----------|----------|
| E16 | Decision condition met overrides default transition | `{ fast_track: true }` | `next_activity: "C"`, source: "decision" |
| E17 | Decision condition not met, default transition used | `{ fast_track: false }` | `next_activity: "B"` |

### 1.5 Edge Cases

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| E18 | Empty variables object | `{}` with conditional transitions | All conditions evaluate against `undefined`; falls to default |
| E19 | Nested variable path | condition on `config.mode`, variables: `{ config: { mode: "fast" } }` | `getVariableValue` resolves correctly |
| E20 | Decision branch without transitionTo | branch matched but `transitionTo` is undefined | Branch excluded from candidates (terminal branch) |
| E21 | Transition `to` references nonexistent activity | Condition matches but `to: "deleted-activity"` | `next_activity` is the match (validation is separate from evaluation) |

---

## 2. Unit Tests — `toWorkflowSummary()`

**File:** `tests/workflow-loader.test.ts`

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| S1 | Summary preserves metadata | Full workflow object | `id`, `version`, `title`, `description`, `author`, `tags` present |
| S2 | Summary preserves rules | Workflow with 12 rules | `rules` array has 12 entries |
| S3 | Summary preserves variables | Workflow with 56 variables | `variables` array has 56 entries |
| S4 | Summary preserves modes | Workflow with 1 mode | `modes` array has 1 entry |
| S5 | Summary preserves artifactLocations | Workflow with 4 locations | `artifactLocations` has 4 keys |
| S6 | Summary preserves initialActivity | Workflow with initialActivity | `initialActivity` present |
| S7 | Activities reduced to stubs | 14 full activities | 14 stubs with only `id`, `name`, `description`, `required`, `estimatedTime` |
| S8 | Stubs omit steps | Full activities with steps | No `steps` field in stubs |
| S9 | Stubs omit transitions | Full activities with transitions | No `transitions` field in stubs |
| S10 | Stubs omit checkpoints | Full activities with checkpoints | No `checkpoints` field in stubs |
| S11 | Stubs omit decisions | Full activities with decisions | No `decisions` field in stubs |
| S12 | Summary JSON size smaller | work-package workflow | Summary JSON < 3KB (full is ~13KB) |

---

## 3. Integration Tests — `evaluate_transitions` Tool

**File:** `tests/mcp-server.test.ts`

| # | Test Case | Action | Expected |
|---|-----------|--------|----------|
| I1 | Basic transition evaluation | `start_session` → `get_activity("A")` → `evaluate_transitions("A", { })` | Returns `next_activity` matching default transition; valid token |
| I2 | Conditional transition evaluation | `evaluate_transitions("post-impl-review", { has_critical_blocker: true })` | `next_activity: "implement"` |
| I3 | Conditional miss → default | `evaluate_transitions("post-impl-review", { has_critical_blocker: false })` | `next_activity: "validate"` |
| I4 | Token advances correctly | Check returned token | `token.act` is unchanged (evaluation doesn't change current activity) |
| I5 | Validation warnings included | Call with workflow_id mismatch in token | `_meta.validation.warnings` includes consistency warning |
| I6 | Step manifest validated | Include `step_manifest` for current activity | Manifest validation runs alongside transition evaluation |
| I7 | Invalid session token | Tampered token | Error: signature verification failed |
| I8 | Workflow not found | `workflow_id: "nonexistent"` | Error response |

---

## 4. Integration Tests — `get_workflow` Summary Mode

**File:** `tests/mcp-server.test.ts`

| # | Test Case | Action | Expected |
|---|-----------|--------|----------|
| W1 | Default mode returns full workflow | `get_workflow(workflow_id)` without summary param | Response includes full activity definitions |
| W2 | Summary mode returns lightweight | `get_workflow(workflow_id, summary=true)` | Response has activity stubs (no steps/transitions/checkpoints) |
| W3 | Summary preserves rules | `get_workflow(summary=true)` | `rules` array present and complete |
| W4 | Summary preserves variables | `get_workflow(summary=true)` | `variables` array present with all definitions |
| W5 | Summary mode with valid token | Normal session flow | Token validates and advances |
| W6 | `summary=false` is identical to omitting param | Both calls | Identical responses |

---

## 5. Combined Integration Tests

| # | Test Case | Action | Expected |
|---|-----------|--------|----------|
| C1 | Full orchestration flow (new pattern) | `start_session` → `get_workflow(summary=true)` → `get_activity("start-work-package")` → complete → `evaluate_transitions("start-work-package", vars)` → `get_activity(result.next_activity)` | Each step succeeds; transitions evaluated server-side |
| C2 | Transition evaluation + manifest | Complete activity A with manifest → `evaluate_transitions("A", vars, manifest)` | Both manifest and transitions validated |
| C3 | Token continuity through new flow | Full flow with 3+ transitions | Token seq increments correctly; no validation warnings |

---

## 6. Test Infrastructure Notes

- **Mock workflows for unit tests:** Construct minimal `Workflow` objects with just enough structure (2–3 activities, known transitions/conditions) rather than loading from disk. This keeps tests fast and isolated.
- **Real workflows for integration tests:** Use the actual `work-package` workflow to test realistic transition evaluation (conditional transitions on `has_critical_blocker`, decision branches on `complexity`, etc.).
- **Variable fixtures:** Create standard variable sets that exercise different condition paths (all-true, all-false, partial, nested paths).
- **Backward compatibility:** Verify that existing tests still pass without modification — `get_workflow` without `summary` and `validate_transition` should be unaffected.

---

## 7. Coverage Goals

| Area | Target | Metric |
|------|--------|--------|
| `evaluateTransitions()` | 100% branch | All condition types, match/miss/default paths |
| `toWorkflowSummary()` | 100% branch | Metadata preservation, activity reduction |
| `evaluate_transitions` tool | Key paths | Happy path, condition match/miss, token validation, manifest |
| `get_workflow` summary mode | Key paths | Full vs. summary, metadata preservation |
| Combined flow | E2E | New orchestration pattern works end-to-end |
