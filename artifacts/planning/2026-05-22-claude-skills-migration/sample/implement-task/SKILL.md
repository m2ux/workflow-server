---
name: implement-task
description: >
  Produces a code change scoped to one task from a work-package plan.
  Trigger when the plan iterator yields a task and the workspace has no
  uncommitted changes.
metadata:
  ontology: workflow-canonical
  kind: deliverable
  produces: task-implementation
---

# Implement task

## Techniques

| Technique | Source | Purpose |
|---|---|---|
| [understand-task-context](skill:implement-task/understand-task-context) | this skill | Build a written context summary for the task. |
| [write-task-code](skill:implement-task/write-task-code) | this skill | Make the edits scoped to the task. |
| [verify-task-locally](skill:implement-task/verify-task-locally) | this skill | Run typecheck and the affected tests. |
| [impact](skill:gitnexus/impact) | gitnexus | Pre-edit upstream impact analysis on a target symbol. |
| [detect-changes](skill:gitnexus/detect-changes) | gitnexus | Post-edit verification of change scope. |
| [tdd-design-rust](skill:testing/tdd-design-rust) | testing | TDD discipline for Rust changes. |
| [dco-attest-commit](skill:workflow/dco-attest-commit) | workflow | Sign-off and commit with DCO trailer. |
