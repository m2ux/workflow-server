---
metadata:
  version: 2.1.0
---

## Capability

Implementation planning — design approach, work-package plan, and actionable TODO tasks.

## Inputs

### design_philosophy_doc

Design philosophy [artifact](../../resources/design-framework.md#design-philosophy-artifact-template) with problem classification and workflow path

### analysis_findings

*(optional)* Implementation analysis findings (baselines, gaps)

### research_findings

*(optional)* Research findings from knowledge base and web

## Outputs

### plan_document

Work package [plan](../../resources/wp-plan.md#template) with task breakdown and dependencies


#### tasks

Atomic tasks with explicit dependencies and ordering


## Rules

### tasks-are-code-changes-only

A plan task names a code or artifact change — the source edits, schema changes and doc updates that satisfy the goal. Verification is not a task, and neither is a raw command; the forbidden shapes are listed under [Rules](../../resources/wp-plan.md#rules).
