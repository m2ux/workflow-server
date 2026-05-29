# Assumptions Log — Markdown Skills Migration Implementation

**Work Package:** markdown-skills-impl
**Date:** 2026-05-28

This log captures assumptions made during the design-philosophy activity. It is updated in subsequent activities as further assumptions surface and are resolved.

---

## Categories

- **Problem Interpretation** — what the problem actually is and what counts as fixing it.
- **Complexity Assessment** — how risky / how big the change is.
- **Workflow Path** — which optional activities to run.

---

| ID | Assumption | Category | Resolvability | Status |
|----|-----------|----------|---------------|--------|
| A-001 | The pre-migrated content at `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/{work-package,meta}/` is structurally complete and conforming to the conventions in `sample/resources/workflow-canonical/SKILL.md`. | Problem Interpretation | code-analyzable | Open |
| A-002 | The existing `workflow-server` source has a TOON loader and `get_skill` that delivers TOON-projected content; replacing the loader requires only swapping the parsing layer, not the public MCP surface. | Complexity Assessment | code-analyzable | Open |
| A-003 | `workflows/meta/{techniques,resources}/` content can serve dual purpose (meta-workflow's local content + cross-workflow shared content) without resolution ambiguity because precedence is workflow-local → `meta`. | Problem Interpretation | code-analyzable | Open |
| A-004 | The 10 workflow folders under `workflows/` each retain their existing `workflow.toon` + `activities/` unchanged; the migration adds sibling `techniques/` and `resources/` folders without disturbing them. | Complexity Assessment | judgement | Open |
| A-005 | Two-PR coordination (content first, source second) avoids a window where the server expects markdown but finds none, OR where content exists but the loader still reads TOON. | Workflow Path | judgement | Open |

---

## Reconciliation plan

- **A-001, A-002, A-003** are code-analyzable. They will be reconciled during the `codebase-comprehension` activity by direct inspection of the planning-folder `legacy/` trees and the existing `src/` loader/resolver code.
- **A-004, A-005** are judgement calls captured here for traceability. They will remain open until plan-prepare validates the task ordering and the no-touch boundary on the existing workflow files.

The `reconcile-assumptions` step of this activity does not yet have code-resolvable items to drive to convergence — comprehension has not run. The loop condition `has_resolvable_assumptions` is true (A-001/A-002/A-003 are resolvable), but resolution requires the next activity's findings; this log carries them forward.

---

## Resolution legend

- **Confirmed** — resolved by direct code inspection or by test evidence already on the branch.
- **Accepted** — resolved by design rationale or by referencing established prior art / pre-resolved orchestrator context.
- **Open** — not yet resolved; will be revisited in a later activity.

All five initial assumptions are currently in the **Open** state.
