---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 9
  legacy_id: 9
---

## Capability

Create test strategy and test plan with cases and acceptance criteria

## Inputs

### requirements

Elicited requirements with success criteria

### plan-tasks

Atomic task breakdown with dependencies and ordering for the work package

## Protocol

### 1. Load Guidance

- Use attached [test-plan](../resources/test-plan.md) for test plan template and guidance

### 2. Define Strategy

- Define test strategy for the work package (unit, integration, e2e), using the `plan-tasks` breakdown to scope coverage to each task and its dependencies
- If requirements are not available, prompt the user to complete elicitation before continuing with test planning
- Identify which requirements need which types of tests
- Determine test infrastructure needs (fixtures, mocks, test doubles)

### 3. Create Test Cases

- Create specific test cases for each requirement
- Include boundary conditions, error paths, and edge cases
- Link each test case to its requirement and acceptance criterion
- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[query](./gitnexus-operations/query.md) `{query: <concept>}` to find existing test patterns for related concepts and [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[context](./gitnexus-operations/context.md) `{name: <symbol>}` to identify error-path callees as edge-case test candidates.

### 4. Write Artifact

- Create the test-plan-document artifact in planning folder
- Structure with strategy, test cases, and acceptance criteria matrix

## Outputs

### test-plan-document

Test [strategy](../resources/test-plan.md#test-plan-structure) and acceptance criteria

#### artifact

`test-plan.md`

#### test_strategy

What to test, how, and pass criteria

#### test_cases

Specific test cases linked to requirements

#### acceptance_matrix

Requirements-to-tests traceability

## Rules

### lifecycle-phases

Test plans have two phases: (1) Initial placeholder at PR creation — objectives only, no source links; (2) Finalized after implementation — hyperlinks to actual test source locations added by finalize-documentation technique.

### skip-conditions

Skip formal test plan for: simple bug fixes with obvious test cases, documentation-only changes, single-test changes, refactoring with existing coverage.
