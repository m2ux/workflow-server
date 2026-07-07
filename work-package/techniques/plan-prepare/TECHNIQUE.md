---
metadata:
  version: 2.1.0
---

## Capability

Design the implementation approach and create a work package plan with task breakdown, dependencies, and ordering, then break the plan into actionable TODO tasks. Operations inherit the shared inputs, outputs, and rules below.

## Inputs

### design_philosophy

Design philosophy [artifact](../../resources/design-framework.md#design-philosophy-artifact-template) with problem classification and workflow path

### analysis_findings

*(optional)* Implementation analysis findings (baselines, gaps)

### research_findings

*(optional)* Research findings from knowledge base and web

## Outputs

### plan_document

Work package [plan](../../resources/wp-plan.md#template) with task breakdown and dependencies

#### plan_artifact

`work-package-plan.md`

#### tasks

Atomic tasks with explicit dependencies and ordering

## Rules

### tasks-are-code-changes-only

Plan tasks describe CODE OR ARTIFACT CHANGES — the source edits, schema changes, doc updates, etc. that must be made to satisfy the goal. Tasks MUST NOT describe verification work (compile, test, lint, format) as separate items: verification runs automatically via the task-cycle (run-tests step → [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[test](../../../meta/techniques/cargo-operations/test.md)) and during final validation ([cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[check](../../../meta/techniques/cargo-operations/check.md) / [fmt-check](../../../meta/techniques/cargo-operations/fmt-check.md) / [clippy](../../../meta/techniques/cargo-operations/clippy.md)). Adding 'Verify compilation', 'Verify tests pass', 'Run cargo X', or similar as a task duplicates that built-in cycle and is forbidden.

### no-raw-commands-in-plan

Plan content MUST NEVER contain raw command invocations/specification
