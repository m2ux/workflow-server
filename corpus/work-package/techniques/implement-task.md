---
metadata:
  version: 2.5.2
---

## Capability

Implement a single task by writing code changes

## Inputs

### current_task

A single atomic task to implement — its goal, deliverables, dependencies, and Contract (Signatures, Behaviours, Error cases, Acceptance)

### test_plan

*(optional)* Test [plan](../resources/test-plan-guide.md#test-plan-structure) with strategy and acceptance criteria for guidance

### target_symbol

The function, class, or method this task changes.

### impact_report

Blast radius of that symbol: direct callers, the flows reached, and a risk level.

### context_report

Callers, callees, and the flows that symbol participates in.

## Outputs

### task_implementation

Code changes for a single task: a brief summary of the approach taken, a high or critical blast-radius rating and the symbols it names when the radius rates that high, residual ambiguity the task leaves, and tests left unrun.

### changed_paths

Repository-relative paths this task wrote, as the set a commit stages.

## Protocol

### 1. Read the task

- Read the `{current_task}` Contract first — Signatures, Behaviours, Error cases and Acceptance are the public specification this task must satisfy
- Read the `{current_task}` goal, deliverables and dependencies
- Before editing, read `{impact_report}` and emit the blast-radius note on `{task_implementation}`
- Read `{context_report}` for the callers and callees of `{target_symbol}`
- Review the `{test_plan}` for acceptance criteria relevant to this task
- Where the `{current_task}` Contract or description is ambiguous or missing context, read the plan document for what it leaves unstated, and record the residual ambiguity in `{task_implementation}`

### 2. Write Code

- Implement the code changes for this task
- Follow existing code patterns and conventions in the target codebase
- For Rust projects, follow TDD best practices from [tdd-concepts-rust](../resources/tdd-concepts-rust.md)

### 3. Verify Locally

- Check for obvious regressions in affected code
  > If the code changes do not compile, review the error messages, fix the issues, and retry
  > Where the suite cannot run here, update any test this diff invalidates on its own face — a reordered positional assertion, an assertion naming a renamed symbol — and record which tests remain unrun in `{task_implementation}`

### 4. Record

- Record the `{task_implementation}` for this task, capturing a brief summary of the approach taken
- Emit `{changed_paths}` as the repository-relative paths this task wrote

## Rules

### single-task-focus

Implement exactly one task — do not scope-creep into adjacent tasks

### comment-proportionality

Comment bulk stays proportional to the code it annotates, per [Comment proportionality](/ponytail/resources/review-taxonomy.md#comment-proportionality). Rationale already recorded in a plan or design artifact is cited rather than restated inline, so the two cannot drift apart.
