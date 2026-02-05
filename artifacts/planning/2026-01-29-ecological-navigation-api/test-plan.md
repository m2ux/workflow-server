# Test Plan: Ecological Navigation API

**Work Package:** #36 - Ecological Navigation API  
**Date:** 2026-01-30

---

## Test Strategy

### Scope

| In Scope | Out of Scope |
|----------|--------------|
| Effectivity schema validation | Agent-side registry consumption |
| Agent registry schema validation | Sub-agent spawning behavior |
| Effectivity loader with includes | Full activity migration testing |
| Agent loader with variants | Performance benchmarking |
| Navigation response effectivities | Cross-workflow effectivity usage |

### Test Levels

1. **Unit Tests**: Schema validation, loader functions, compute functions
2. **Integration Tests**: Loader + schema, navigation + effectivities
3. **E2E Tests**: Complete navigation flow with effectivities

---

## Unit Tests

### 1. Effectivity Schema (`effectivity.schema.ts`)

**File:** `tests/effectivity-schema.test.ts`

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Valid base effectivity | Minimal valid effectivity definition | Passes validation |
| Valid extended effectivity | Effectivity with `includes` field | Passes validation |
| Missing required fields | Effectivity without `id` | Validation error |
| Invalid includes format | `includes` as string instead of array | Validation error |
| Empty includes array | `includes: []` | Passes (valid but empty) |
| Naming convention validation | `code-review_rust` format | Passes validation |
| Invalid name characters | `code review` with space | Validation error |

### 2. Agent Registry Schema (`agent.schema.ts`)

**File:** `tests/agent-schema.test.ts`

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Valid agent entry | Agent with effectivities and model | Passes validation |
| Multiple effectivities | Agent with array of effectivities | Passes validation |
| Missing effectivities | Agent without effectivities field | Validation error |
| Invalid model | Unknown model name | Validation error (or warning) |
| Empty tools array | `tools: []` | Passes (valid but empty) |

### 3. Effectivity Loader (`effectivity-loader.ts`)

**File:** `tests/effectivity-loader.test.ts`

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Load single effectivity | Load `code-review.toml` | Returns parsed effectivity |
| Load all effectivities | Load entire `effectivities/` folder | Returns all effectivities |
| Resolve single include | `code-review_rust` includes `code-review` | Merged effectivity returned |
| Resolve chain includes | `code-review_rust_substrate` → `_rust` → base | Full chain resolved |
| Circular include detection | A includes B includes A | Error thrown |
| Missing include target | Includes non-existent effectivity | Error with clear message |
| Parse TOML format | Valid TOML syntax | Correct object returned |
| Invalid TOML format | Malformed TOML | Error with line number |

### 4. Agent Loader (`agent-loader.ts`)

**File:** `tests/agent-loader.test.ts`

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Load default registry | Load `agents/default.toml` | Returns agent map |
| Load variant registry | Load `agents/minimal.toml` | Returns variant agents |
| Find agent by effectivity | Query for `code-review_rust` | Returns matching agent |
| No matching agent | Query for unknown effectivity | Returns null/undefined |
| Multiple agents match | Two agents have same effectivity | Returns first (or error) |
| Registry not found | Load non-existent variant | Error with clear message |

### 5. Navigation Compute (`compute.ts`)

**File:** `tests/navigation/compute.test.ts` (extend existing)

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Action includes effectivities | Step has effectivities defined | Action.effectivities populated |
| Action without effectivities | Step has no effectivities | Action.effectivities is empty/undefined |
| Multiple effectivities | Step requires two effectivities | Both in Action.effectivities |

---

## Integration Tests

### 6. Loader + Schema Integration

**File:** `tests/effectivity-integration.test.ts`

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Load and validate | Load effectivity, validate against schema | Both succeed |
| Load with invalid file | File fails schema validation | Clear error message |
| Load with includes | Resolve includes, validate merged result | Merged result valid |

### 7. Navigation + Effectivities Integration

**File:** `tests/navigation/effectivities.test.ts`

| Test Case | Description | Expected |
|-----------|-------------|----------|
| start-workflow with effectivities | Start workflow with effectivity-enabled activity | Response includes effectivities |
| resume-workflow with effectivities | Get situation for step with effectivities | availableActions include effectivities |
| advance-workflow with effectivity step | Complete step that has effectivities | Success, state advances |

---

## E2E Tests

### 8. Complete Workflow Flow

**File:** `tests/navigation/e2e.test.ts` (extend existing)

| Test Case | Description | Expected |
|-----------|-------------|----------|
| Workflow with effectivity steps | Navigate workflow with effectivity requirements | All steps complete, effectivities in responses |
| Mixed steps | Some steps have effectivities, some don't | Correct effectivities per step |

---

## Test Data

### Sample Effectivity (code-review.toml)

```toml
id = "code-review"
name = "Code Review"
version = "1.0.0"
description = "Comprehensive code review following established patterns"

[execution]
flow = [
  "Load code-review resource",
  "Review changed files",
  "Document findings",
  "Present summary"
]

[execution.tools]
get_resource = "Load review guidance"
read_file = "Examine implementation"
grep = "Search for patterns"
```

### Sample Extended Effectivity (code-review_rust.toml)

```toml
id = "code-review_rust"
name = "Rust Code Review"
version = "1.0.0"
description = "Rust-specific code review patterns"
includes = ["code-review"]

[applicability]
languages = ["rust"]

[execution]
flow = [
  "Run cargo clippy",
  "Check unsafe blocks",
  "Verify error handling patterns"
]
```

### Sample Agent Registry (default.toml)

```toml
[agents.code-reviewer]
effectivities = ["code-review", "code-review_rust", "code-review_rust_substrate"]
model = "fast"
instructions = "Perform code review following language-specific patterns"
tools = ["read_file", "grep", "get_resource"]

[agents.test-reviewer]
effectivities = ["test-review"]
model = "fast"
instructions = "Review test quality and coverage"
tools = ["shell", "read_file", "grep"]

[agents.pr-responder]
effectivities = ["pr-review-response"]
model = "fast"
instructions = "Analyze and respond to PR feedback"
tools = ["shell", "read_file", "edit"]
```

---

## Test Execution

### Commands

```bash
# Run all tests
npm test

# Run effectivity-specific tests
npm test -- --grep "effectivity"

# Run navigation tests with effectivities
npm test -- tests/navigation/effectivities.test.ts

# Run with coverage
npm test -- --coverage
```

### CI Integration

Tests will run as part of the existing Vitest configuration. No CI changes required.

---

## Acceptance Criteria

| Criterion | Metric |
|-----------|--------|
| Unit test coverage | >80% for new code |
| All tests passing | 100% green |
| No regressions | Existing navigation tests unchanged |
| Schema validation | All sample files validate |
| Loader resilience | Clear errors for invalid input |
