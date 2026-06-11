---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.3
  order: 10
  legacy_id: 10
---

## Capability

Implement a single task from the work package plan by writing code changes

## Inputs

### current_task

A single atomic task to implement (description, affected files, dependencies)

### test_plan

*(optional)* Test [plan](../resources/test-plan.md#test-plan-structure) with strategy and acceptance criteria for guidance

## Protocol

### 1. Understand Context

- Read the `{current_task}` description and requirements from the plan
- Identify affected files, dependencies, and related code
- Review the `{test_plan}` for acceptance criteria relevant to this task
- If the task description is ambiguous or missing context, review the plan document and ask the user for clarification before proceeding

### 2. Pre Edit Impact Check

- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: `{$target_symbol}`, direction: `upstream`) before any edit
- Read the resulting `impact_report`; if HIGH or CRITICAL risk, surface it to the user before proceeding
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{target_symbol}`) to understand callers/callees of the symbol

### 3. Write Code

- Implement the code changes for this task
- Follow existing code patterns and conventions in the target codebase
- For Rust projects, follow TDD best practices from [tdd-concepts-rust](../resources/tdd-concepts-rust.md)

### 4. Verify Locally

- Check for obvious regressions in affected code
- If the code changes do not compile, review the error messages, fix the issues, and retry
- Apply the [task-completion-review](../techniques/task-completion-review.md) technique to self-review the completed changes

### 5. Post Edit Verification

- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[detect-changes](../../meta/techniques/gitnexus-operations/detect-changes.md) before commit to confirm the changes affect only the expected symbols and execution flows
- Record the `{task_implementation}` for this task, capturing the files changed and a brief summary of the approach taken

## Outputs

### task_implementation

Code changes for a single task

## Rules

### single-task-focus

Implement exactly one task — do not scope-creep into adjacent tasks
