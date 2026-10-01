---
metadata:
  version: 1.0.0
---

## Capability

Write integration tests for one plan task from its Contract alone.

## Inputs

### current_task

The plan task under test — its Contract (Signatures, Behaviours, Error cases, Acceptance) is the only specification this technique may read. Goal, deliverables and approach text are out of scope.

### contract_tests_path

Worktree the test files are written into.

## Outputs

### contract_tests_changed_paths

Repository-relative paths this task's contract tests wrote.

## Protocol

### 1. Read the Contract Only

- Read `{current_task}` Contract fields: Signatures, Behaviours, Error cases, Acceptance
- Do not read the task's Goal, Deliverables, or any implementation plan section outside that Contract
- Do not read source under `{target_path}` or any implementation checkout

### 2. Write Tests

- Write integration tests under `{contract_tests_path}` that assert the Contract's Signatures, Behaviours, Error cases and Acceptance
- Place them in files of their own (a path the implement branch does not write), named for the task id
- Emit `{contract_tests_changed_paths}` as the paths written

## Rules

### contract-alone

The Contract is the only input that shapes the tests. Reading implementation source or the rest of the plan is a conformance violation.
