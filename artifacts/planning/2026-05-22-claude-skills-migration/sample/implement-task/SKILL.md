---
name: implement-task
description: >
  Produces a code change scoped to one task from a work-package plan.
  Trigger when the plan iterator yields a task and the workspace has no
  uncommitted changes.
metadata:
  ontology: workflow-canonical
  kind: technique
---

# Implement task

## Techniques

| Technique | Source | Purpose |
|---|---|---|
| [understand-task-context](understand-task-context/SKILL.md) | this skill | Build a written context summary for the task. |
| [write-task-code](write-task-code/SKILL.md) | this skill | Make the edits scoped to the task. |
| [verify-task-locally](verify-task-locally/SKILL.md) | this skill | Run typecheck and the affected tests. |
| [impact](../gitnexus/impact/SKILL.md) | gitnexus | Pre-edit upstream impact analysis on a target symbol. |
| [detect-changes](../gitnexus/detect-changes/SKILL.md) | gitnexus | Post-edit verification of change scope. |
| [tdd-design-rust](../testing/tdd-design-rust/SKILL.md) | testing | TDD discipline for Rust changes. |
| [dco-attest-commit](../workflow/dco-attest-commit/SKILL.md) | workflow | Sign-off and commit with DCO trailer. |
