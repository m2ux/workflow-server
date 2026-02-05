# Test Plan: Navigation-Based Workflow Engine

**Created:** 2026-01-29
**Issue:** [#34](https://github.com/m2ux/workflow-server/issues/34)

---

## Test Strategy

### Approach
- **Unit tests** for each module (codec, compute, transition)
- **Integration tests** for navigation tools
- **End-to-end tests** for complete workflow traversal
- **Existing tests** must continue to pass (regression)

### Framework
- Vitest (already in use)
- Test files in `tests/` directory

---

## Unit Tests

### 1. State Codec Tests
**File:** `tests/navigation/state-codec.test.ts`

| Test Case | Description |
|-----------|-------------|
| `encodes state to opaque token` | WorkflowState → string starting with "v1.gzB64." |
| `decodes token back to state` | Round-trip: encode → decode → equal |
| `token is not human-readable` | Encoded payload is not valid JSON |
| `detects invalid token format` | Missing version prefix → error |
| `detects corrupted payload` | Invalid base64 → error |
| `detects decompression failure` | Invalid gzip → error |
| `validates state structure on decode` | Invalid state schema → error |
| `handles empty state correctly` | Minimal valid state works |
| `compression reduces size` | Encoded < JSON.stringify length |

### 2. Navigation Computation Tests
**File:** `tests/navigation/compute.test.ts`

| Test Case | Description |
|-----------|-------------|
| `computes position for initial activity` | Returns correct activity and step |
| `computes position within loop` | Returns loop iteration info |
| `identifies required actions` | Steps that must be completed |
| `identifies optional actions` | Available but not required |
| `identifies blocked actions with reasons` | Cannot proceed + why |
| `checkpoint blocks further progress` | When checkpoint active, steps blocked |
| `checkpoint appears in required actions` | respond_to_checkpoint is required |
| `loop iteration prevents batching` | Only current iteration step available |
| `decision branch is selected` | Correct branch based on variables |
| `handles activity with no steps` | Works with empty steps array |

### 3. State Transition Tests
**File:** `tests/navigation/transition.test.ts`

| Test Case | Description |
|-----------|-------------|
| `advances to next step` | currentStep increments |
| `records step in completedSteps` | Step ID added to record |
| `adds history entry on step completion` | History grows |
| `updates updatedAt timestamp` | Timestamp changes |
| `increments stateVersion` | Version increments |
| `rejects invalid step completion` | Wrong step ID → error |
| `rejects completion when checkpoint blocking` | Must respond first → error |
| `records checkpoint response` | Response in checkpointResponses |
| `applies checkpoint effects` | Variables set from effect |
| `transitions to next activity` | When all steps complete |
| `handles loop iteration advance` | Iteration increments |
| `handles loop completion` | Loop exits when done |
| `rejects invalid checkpoint response` | Wrong option ID → error |

---

## Integration Tests

### 4. Navigation Tools Tests
**File:** `tests/navigation-tools.test.ts`

| Test Case | Description |
|-----------|-------------|
| `start_workflow returns initial position` | Activity, step, actions present |
| `start_workflow returns opaque state` | Token format correct |
| `start_workflow returns available actions` | Required/optional/blocked present |
| `get_position decodes and returns situation` | Same as start for same state |
| `get_position rejects invalid state` | Corrupted token → error |
| `complete_step advances and returns new state` | Position changes |
| `complete_step rejects when blocked` | Checkpoint active → error |
| `respond_to_checkpoint records and advances` | Checkpoint cleared |
| `respond_to_checkpoint applies effects` | Variables changed |
| `invalid workflow_id returns error` | Clear error message |
| `mismatched workflow in state returns error` | State from different workflow |

---

## End-to-End Tests

### 5. Workflow Traversal Tests
**File:** `tests/navigation/e2e.test.ts`

| Test Case | Description |
|-----------|-------------|
| `complete simple activity` | Start → complete all steps → transition |
| `checkpoint blocks until responded` | Cannot proceed without response |
| `loop executes all iterations` | Each iteration in sequence |
| `decision branches correctly` | Condition evaluated, correct branch taken |
| `full workflow from start to finish` | Traverse work-package workflow |
| `resume from saved state` | Save state, load, continue |
| `state version migration` | Old version state handled (future) |

---

## Regression Tests

### 6. Existing Functionality
**File:** Existing test files

| Test Case | Description |
|-----------|-------------|
| `existing workflow tools still work` | list_workflows, get_workflow, etc. |
| `existing resource tools still work` | get_activities, get_resource, etc. |
| `workflow loading unchanged` | Workflows load correctly |
| `activity loading unchanged` | Activities load correctly |

---

## Test Data

### Mock Workflow
Create minimal test workflow with:
- 2 activities
- 3 steps in first activity
- 1 checkpoint (blocking)
- 1 loop (2 iterations)
- 1 decision point
- Transition to second activity

### Test Fixtures
- Valid WorkflowState objects
- Invalid state tokens (corrupted, wrong version)
- Workflow definitions for edge cases

---

## Coverage Targets

| Module | Target Coverage |
|--------|-----------------|
| state-codec.ts | 95% |
| compute.ts | 90% |
| transition.ts | 90% |
| navigation-tools.ts | 85% |

---

## Test Execution

```bash
# Run all tests
npm test

# Run navigation tests only
npm test -- navigation

# Run with coverage
npm test -- --coverage

# Watch mode during development
npm test -- --watch
```

---

## Success Criteria

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] All existing tests pass (no regression)
- [ ] Coverage targets met
- [ ] No flaky tests
