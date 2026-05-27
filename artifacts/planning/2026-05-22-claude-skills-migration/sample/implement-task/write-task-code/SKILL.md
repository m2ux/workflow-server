---
name: write-task-code
description: >
  Make code edits scoped to a single work-package task, conforming to
  the conventions and acceptance criteria recorded in the context
  summary. Produces the actual diff.
metadata:
  ontology: workflow-canonical
  kind: technique
---

# Write task code

## Pre-conditions

- A context summary exists in agent state (output of
  [understand-task-context](../understand-task-context/SKILL.md)).
- If the codebase is GitNexus-indexed, an upstream impact report has
  been obtained via [impact](../../gitnexus/impact/SKILL.md) and reviewed;
  HIGH/CRITICAL findings have been resolved with the user before this
  technique runs.
- Workspace has no uncommitted changes — the diff produced by this
  technique should be the only diff against `HEAD`.

## Invariants

- **Single-task focus.** No edits beyond what the context summary
  covers. Out-of-scope improvements are captured as separate plan
  entries, not silently bundled in.
- **Convention matching.** Naming, error handling, module structure,
  logging, comment style — match the surrounding code, not the agent's
  defaults.
- **TDD for Rust.** When the change is in a Rust crate,
  [tdd-design-rust](../../testing/tdd-design-rust/SKILL.md) is applied —
  failing test first, then implementation that makes it pass, then
  refactor with tests green.

## Procedure

1. **Re-read the context summary.** Confirm scope, affected files,
   criteria, and conventions are still accurate after the impact check.

2. **Edit the affected files.** Make the smallest changes that satisfy
   the acceptance criteria. Follow the conventions captured in the
   context summary precisely.

3. **Match conventions on each edit.** Re-read the surrounding code as
   the edit is being made; do not introduce new patterns silently.

4. **Stay in scope.** Resist refactoring adjacent code, fixing unrelated
   TODOs, or improving patterns not in the task.

5. **Self-review the diff.** Read it as a whole. Confirm every change
   traces to an acceptance criterion or an impact-report finding; no
   unrelated changes; conventions match.

## Output

Code changes to the affected files, present in the workspace as a
working diff against `HEAD`, ready for
[verify-task-locally](../verify-task-locally/SKILL.md).

## Refusal paths

- **Conventions conflict with criteria.** If the criteria cannot be met
  without breaking convention, surface to user — let them decide
  whether to break convention, update the plan, or amend the criteria.
- **Out-of-scope refactoring genuinely required.** If a refactor is
  actually required to land this task safely, surface and let the user
  authorise the scope expansion.
- **Impact report contradicts the context summary.** If the report
  reveals callers/dependencies the summary missed, return to
  [understand-task-context](../understand-task-context/SKILL.md)
  to rewrite the summary before editing.
