---
name: create-plan
description: Design the implementation approach and produce work-package-plan.md.
metadata:
  ontology: legacy
  kind: skill
  version: 2.1.0
  order: 8
  legacy_id: 8
---

# Create Plan

## Capability

Create work package plan with task breakdown, dependencies, and ordering

## Inputs

### design-philosophy

Design philosophy artifact with problem classification and workflow path

### requirements

Elicited requirements from elicitation activity

### analysis-findings

*(optional)* Implementation analysis findings (baselines, gaps)

### research-findings

*(optional)* Research findings from knowledge base and web

## Protocol

### 1. Verify Inputs

- Verify design_philosophy and requirements are available
- Confirm prerequisite activities completed before proceeding

### 2. Load Guidance

- Use attached resource 10 (wp-plan) for plan template and guidance
- Review design_philosophy, requirements, analysis_findings, research_findings

### 3. Apply Design Framework

- Apply design framework to structure implementation approach
- Document assumptions in planning decisions
- Break work into atomic tasks with explicit dependencies
- Define task ordering — never assume ordering is obvious
- When the target symbols are knowable, use `gitnexus_impact({target, direction: 'upstream'})` to bound task scope and order tasks by dependency depth (edit leaves before callers). See resource 27.

### 4. Write Plan

- Create work-package-plan.md artifact in planning folder
- Include task breakdown, dependencies, ordering
- Document design decisions and assumptions

### 5. Create Todos

- Break plan into actionable TODO tasks for implementation
- Ensure each task is atomic (implementable, testable, committable independently)

## Outputs

### plan-document

Work package plan with task breakdown and dependencies

- **artifact**: `work-package-plan.md`
- **tasks**: Atomic tasks with explicit dependencies and ordering
- **design_decisions**: Approach and rationale with documented assumptions

## Rules

### tasks-are-code-changes-only

Plan tasks describe CODE OR ARTIFACT CHANGES — the source edits, schema changes, doc updates, etc. that must be made to satisfy the goal. Tasks MUST NOT describe verification work (compile, test, lint, format) as separate items: verification runs after every task automatically via the implement activity's task-cycle (run-tests step → cargo-operations::test) and at the validate activity (cargo-operations::check / ::fmt-check / ::clippy). Adding 'Verify compilation', 'Verify tests pass', 'Run cargo X', or similar as a task duplicates that built-in cycle and is forbidden.

### no-raw-commands-in-plan

Plan content MUST NEVER contain raw command invocations/specification

## Errors

### missing_inputs

**Cause:** Design philosophy or analysis not completed

**Recovery:** Prompt user to complete prerequisite activities before planning

## Resources

- [wp-plan](skill:legacy/work-package/resources/wp-plan)
- [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference)
