---
name: implement-task
description: Implement a single task from the plan by writing code changes.
metadata:
  ontology: legacy
  kind: skill
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

- Run `gitnexus_impact({target: <symbol>, direction: 'upstream'})` on the target symbol before any edit
- Read the impact report; if HIGH or CRITICAL risk, surface it to the user before proceeding
- Use `gitnexus_context({name: <symbol>})` to understand callers/callees of the symbol — see resource 27 for the full reference

### 3. Write Code

- Implement the code changes for this task
- Follow existing code patterns and conventions in the target codebase
- For Rust projects, follow TDD best practices from resource 23 (tdd-concepts-rust)

### 4. Verify Locally

- Check for obvious regressions in affected code

### 5. Post Edit Verification

- Run `gitnexus_detect_changes()` before commit to confirm the changes affect only the expected symbols and execution flows

## Outputs

### task-implementation

Code changes for a single task

- **files_changed**: List of files modified
- **approach_summary**: Brief description of the implementation approach

## Rules

### single-task-focus

Implement exactly one task — do not scope-creep into adjacent tasks

### gitnexus-discipline

Implementations MUST execute the pre-edit-impact-check and post-edit-verification protocol phases on every task when the codebase is GitNexus-indexed. The phases describe the calls; this rule asserts they are non-negotiable.

## Errors

### compilation_failure

**Cause:** Code changes do not compile

**Recovery:** Review error messages, fix issues, and retry

### unclear_task

**Cause:** Task description is ambiguous or missing context

**Recovery:** Review plan document and ask user for clarification

## Resources

- [task-completion-review](skill:legacy/work-package/resources/task-completion-review)
- [tdd-concepts-rust](skill:legacy/work-package/resources/tdd-concepts-rust)
- [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference)
