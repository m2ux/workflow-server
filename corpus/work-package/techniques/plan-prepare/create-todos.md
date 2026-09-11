---
metadata:
  version: 1.1.0
---

## Capability

The plan's task breakdown carried into the harness TODO list implementation is tracked against.

## Inputs

### plan_document

Work package plan; its task breakdown, dependencies, and ordering are the source for the TODO list.

## Protocol

### 1. Create Todos

- Register one TODO per task in `{plan_document.tasks}`, in the plan's own order and carrying its dependencies
- The plan's [Implementation Tasks](../../resources/wp-plan.md#template) section already governs what a task may be; a TODO adds tracking, not a second breakdown
