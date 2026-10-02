---
metadata:
  version: 1.2.0
---

## Capability

Write integration tests for one plan task from its Contract alone.

## Inputs

### current_task

The plan task under test, including its Contract: Signatures, Behaviours, Error cases, Acceptance.

### contract_tests_path

Worktree the test files are written into.

## Outputs

### contract_tests_changed_paths

Repository-relative paths this task's contract tests wrote.

## Protocol

### 1. Read the Contract Only

- Read `{current_task}` Contract fields: Signatures, Behaviours, Error cases, Acceptance
- Goal, deliverables, and any plan section outside that Contract are out of scope
- Implementation source is out of scope

### 2. Write Tests

- Write integration tests under `{contract_tests_path}` that assert the Contract's Signatures, Behaviours, Error cases and Acceptance
- Place them in files of their own, named for the task id
- Emit `{contract_tests_changed_paths}` as the paths written
