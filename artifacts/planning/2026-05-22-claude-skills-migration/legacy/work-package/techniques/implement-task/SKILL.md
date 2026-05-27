---
name: implement-task
description: Implement a single task from the plan by writing code changes.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.3
  order: 10
  legacy_id: 10
---

# Implement Task

## Capability

Implement a single task from the work package plan by writing code changes

## Inputs

### current-task

The task to implement from the plan (provided by the activity loop iterator)

### test-plan

*(optional)* Test plan with strategy and acceptance criteria for guidance

## Protocol

### 1. Understand Context

- Read the task description and requirements from the plan
- Identify affected files, dependencies, and related code
- Review test plan for acceptance criteria relevant to this task

### 2. Pre Edit Impact Check

- Apply the [gitnexus-operations](legacy/work-package/techniques/gitnexus-operations/SKILL.md) `impact` operation with `{target: <target-symbol>, direction: 'upstream'}` before any edit
- Read the resulting impact_report; if HIGH or CRITICAL risk, surface it to the user before proceeding
- Apply `gitnexus-operations::context` with `{name: <target-symbol>}` to understand callers/callees of the symbol

### 3. Write Code

- Implement the code changes for this task
- Follow existing code patterns and conventions in the target codebase
- For Rust projects, follow TDD best practices from [tdd-concepts-rust](legacy/work-package/resources/tdd-concepts-rust/SKILL.md)

### 4. Verify Locally

- Check for obvious regressions in affected code
- Apply the per-task completion review process from [task-completion-review](legacy/work-package/resources/task-completion-review/SKILL.md)

### 5. Post Edit Verification

- Apply `gitnexus-operations::detect-changes` before commit to confirm the changes affect only the expected symbols and execution flows

## Outputs

### task-implementation

Code changes for a single task

- **files_changed**: List of files modified
- **approach_summary**: Brief description of the implementation approach

## Rules

### single-task-focus

Implement exactly one task — do not scope-creep into adjacent tasks

## Errors

### compilation_failure

**Cause:** Code changes do not compile

**Recovery:** Review error messages, fix issues, and retry

### unclear_task

**Cause:** Task description is ambiguous or missing context

**Recovery:** Review plan document and ask user for clarification
