---
metadata:
  version: 1.0.0
---

## Capability

Break the work package plan into actionable, atomic TODO tasks for implementation.

## Inputs

### plan_document

Work package plan from [plan](./plan.md); its task breakdown, dependencies, and ordering are the source for the TODO list.

### tasks

Atomic tasks with dependencies and ordering carried on `{plan_document}` (from [plan](./plan.md)); broken out into individual TODO items.

## Outputs

### todo_tasks

The actionable TODO task list for implementation — one item per atomic task, each implementable, testable, and committable independently.

## Protocol

### 1. Create Todos

- Break plan into actionable TODO tasks for implementation
- Ensure each task is atomic (implementable, testable, committable independently)
