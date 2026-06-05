---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.0
  order: 8
  legacy_id: 8
---

## Capability

Design the implementation approach and create a work package plan with task breakdown, dependencies, and ordering

## Inputs

### design-philosophy

Design philosophy [artifact](../resources/design-framework.md#design-philosophy-artifact-template) with problem classification and workflow path

### requirements

Elicited requirements with success criteria and scope

### analysis-findings

*(optional)* Implementation analysis findings (baselines, gaps)

### research-findings

*(optional)* Research findings from knowledge base and web

## Protocol

### 1. Verify Inputs

- Verify design_philosophy and requirements are available
- Confirm prerequisite activities completed before proceeding

### 2. Load Guidance

- Use attached [wp-plan](../resources/wp-plan.md) for plan template and guidance
- Review design_philosophy, requirements, analysis_findings, research_findings

### 3. Apply Design Framework

- Apply design framework to structure implementation approach
- Document assumptions in planning decisions
- Break work into atomic tasks with explicit dependencies
- Define task ordering — never assume ordering is obvious
- When the target symbols are knowable, apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[impact](./gitnexus-operations/impact.md) `{target, direction: 'upstream'}` to bound task scope and order tasks by dependency depth (edit leaves before callers).

### 4. Write Plan

- Create the plan-document artifact in planning folder
- Include task breakdown, dependencies, ordering
- Document design decisions and assumptions

### 5. Create Todos

- Break plan into actionable TODO tasks for implementation
- Ensure each task is atomic (implementable, testable, committable independently)

## Outputs

### plan-document

Work package [plan](../resources/wp-plan.md#section-guidelines) with task breakdown and dependencies

#### artifact

`work-package-plan.md`

#### tasks

Atomic tasks with explicit dependencies and ordering

#### design_decisions

Approach and rationale with documented assumptions

## Rules

### tasks-are-code-changes-only

Plan tasks describe CODE OR ARTIFACT CHANGES — the source edits, schema changes, doc updates, etc. that must be made to satisfy the goal. Tasks MUST NOT describe verification work (compile, test, lint, format) as separate items: verification runs after every task automatically via the implement activity's task-cycle (run-tests step → [cargo-operations](./cargo-operations/TECHNIQUE.md)::[test](./cargo-operations/test.md)) and at the validate activity ([cargo-operations](./cargo-operations/TECHNIQUE.md)::[check](./cargo-operations/check.md) / [fmt-check](./cargo-operations/fmt-check.md) / [clippy](./cargo-operations/clippy.md)). Adding 'Verify compilation', 'Verify tests pass', 'Run cargo X', or similar as a task duplicates that built-in cycle and is forbidden.

### no-raw-commands-in-plan

Plan content MUST NEVER contain raw command invocations/specification

## Errors

### missing_inputs

**Cause:** Design philosophy or analysis not completed

**Recovery:** Prompt user to complete prerequisite activities before planning
