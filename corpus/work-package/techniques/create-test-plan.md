---
metadata:
  version: 1.2.0
---

## Capability

Create test strategy and test plan with cases and acceptance criteria

## Inputs

### plan_document

The work package [plan](../resources/wp-plan.md#template), whose task breakdown scopes test coverage to each task and its dependencies.

## Outputs

### test_plan_document

Test [strategy](../resources/test-plan.md#test-plan-structure) and acceptance criteria

#### artifact

`test-plan.md`

#### audience

`human`

## Protocol

### 1. Load Guidance

- Take the artifact shape from the [test-plan templates](../resources/test-plan.md#templates) and the test-design principles from the same resource; the authoring rules below govern the content

### 2. Define Strategy

- Define test strategy for the work package (unit, integration, e2e), using `{plan_document.tasks}` to scope coverage to each task and its dependencies
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

## Rules

### skip-conditions

Skip formal test plan for: simple bug fixes with obvious test cases, documentation-only changes, single-test changes, refactoring with existing coverage.

### structure-and-fill

The artifact's section set, its table shape, its test-ID and test-case forms, its acceptance matrix and its content boundaries are the guide's [Rules](../resources/test-plan.md#rules). Symbol and test hyperlinks follow [manage-artifacts](./manage-artifacts/TECHNIQUE.md#hyperlink-conventions).
