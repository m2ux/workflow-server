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

### plan_tasks

Atomic task breakdown with dependencies and ordering for the work package

## Protocol

### 1. Load Guidance

- Use attached [test-plan](../resources/test-plan.md) for test plan template and guidance

### 2. Define Strategy

- Define test strategy for the work package (unit, integration, e2e), using the `{plan_tasks}` breakdown to scope coverage to each task and its dependencies
- If `{requirements}` are not available, prompt the user to complete elicitation before continuing with test planning
- Identify which `{requirements}` need which types of tests
- Determine test infrastructure needs (fixtures, mocks, test doubles)

### 3. Create Test Cases

- Create specific test cases for each requirement
- Include boundary conditions, error paths, and edge cases
- Link each test case to its requirement and acceptance criterion
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md)(query: `{$concept}`) to find existing test patterns for related concepts and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) to identify error-path callees as edge-case test candidates.

### 4. Write Artifact

- Create the `{test_plan_document}` artifact in `{planning_folder_path}`
- Structure with strategy, test cases, and acceptance criteria matrix

## Outputs

### test_plan_document

Test [strategy](../resources/test-plan.md#test-plan-structure) and acceptance criteria

#### test_plan_artifact

`test-plan.md`

## Rules

### lifecycle-phases

Test plans have two phases: (1) Initial placeholder at PR creation — objectives only, no source links; (2) Finalized after implementation — hyperlinks to actual test source locations added by finalize-documentation technique.

### skip-conditions

Skip formal test plan for: simple bug fixes with obvious test cases, documentation-only changes, single-test changes, refactoring with existing coverage.
