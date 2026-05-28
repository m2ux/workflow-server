---
name: create-test-plan
description: Define what to test, how to test it, and what constitutes passing.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 9
  legacy_id: 9
---

# Create Test Plan

## Capability

Create test strategy and test plan with cases and acceptance criteria

## Inputs

### requirements

Elicited requirements with success criteria

### plan-tasks

Task breakdown from create-plan skill

## Protocol

### 1. Load Guidance

- Use attached [test-plan](../../resources/test-plan/SKILL.md) for test plan template and guidance

### 2. Define Strategy

- Define test strategy for the work package (unit, integration, e2e)
- Identify which requirements need which types of tests
- Determine test infrastructure needs (fixtures, mocks, test doubles)

### 3. Create Test Cases

- Create specific test cases for each requirement
- Include boundary conditions, error paths, and edge cases
- Link each test case to its requirement and acceptance criterion
- Apply [gitnexus-operations](../gitnexus-operations/SKILL.md)::[query](../gitnexus-operations/query.md) (`{query: <concept>}`) to find existing test patterns for related concepts and [gitnexus-operations](../gitnexus-operations/SKILL.md)::[context](../gitnexus-operations/context.md) (`{name: <symbol>}`) to identify error-path callees as edge-case test candidates.

### 4. Write Artifact

- Create test-plan.md artifact in planning folder
- Structure with strategy, test cases, and acceptance criteria matrix

## Outputs

### test-plan-document

Test strategy and acceptance criteria

- **artifact**: `test-plan.md`
- **test_strategy**: What to test, how, and pass criteria
- **test_cases**: Specific test cases linked to requirements
- **acceptance_matrix**: Requirements-to-tests traceability

## Rules

### lifecycle-phases

Test plans have two phases: (1) Initial placeholder at PR creation — objectives only, no source links; (2) Finalized after implementation — hyperlinks to actual test source locations added by finalize-documentation skill.

### skip-conditions

Skip formal test plan for: simple bug fixes with obvious test cases, documentation-only changes, single-test changes, refactoring with existing coverage.

## Errors

### no_requirements

**Cause:** Requirements not available

**Recovery:** Prompt user to complete elicitation before test planning
