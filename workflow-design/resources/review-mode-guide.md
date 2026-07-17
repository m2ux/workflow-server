---
name: review-mode-guide
description: Guidance for auditing existing workflows against the 15 design principles.
metadata:
  order: 4
  legacy_id: 4
---

# Review Mode Guide

Guidance for auditing existing workflows against the 15 design principles. Review mode produces a compliance report without modifying the target workflow(s), then offers to switch to update mode for remediation.

This guide carries the **supplementary** material for review mode: activation/flow framing, the compliance report template, and the transition-to-update-mode contract. The **audit procedure itself** is canonical in the `quality-review` activity's bound `audit-*` techniques — execute each technique's protocol. This file does not restate the procedure.

---

## Activation

`intake-classification` classifies the request as review when it matches recognition signals such as "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", or "evaluate workflow", and produces `operation_type` = `review` with `is_review_mode` = `true` as its declared outputs (landed via the worker's `variables-changed` channel). These signals inform the classification; the mode flag is set structurally by the technique's outputs, not by this prose.

Multi-target review is first-class: name one or more workflow ids in the request. Intake sets `target_workflow_ids` (array) and seeds `target_workflow_id` to the first element. Single-target review is a one-element list on that array.

## Activity Flow

Review mode follows a shortened activity sequence:

1. **Intake and Context** — Load each target workflow in `target_workflow_ids`, enumerate contents, internalize the schemas as the audit baseline, then the `review-scope-confirmed` checkpoint (blocking) confirms the full target set before continuing.
2. **Quality Review** — `forEach` over `target_workflow_ids`, binding each id to `target_workflow_id` and running the audit passes (reload, principles, anti-patterns, schema validation, verify-high-findings, compile-report). The `review-disposition` checkpoint runs once after all targets. This is the core of review mode.
3. **Validate and Commit** — Save the compliance report as an artifact.
4. **Retrospective** — Capture a session retrospective.

`requirements-refinement`, `pattern-analysis`, `impact-analysis`, and `scope-and-draft` are skipped — there is no design or drafting in review mode.

## Audit Procedure

**Review-mode loop** (bound in `quality-review` `multi-target-review-loop`): `reload-workflow` → `audit-principles` → `audit-anti-patterns` → `audit-schema-validation` → `verify-high-findings` → `compile-report`.

**Create/update drafting** (same activity, non-review path): `audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement` with per-pass checkpoints, then `verify-high-findings` and the fix cycle — criteria homes are the construct inventory, [convention-conformance](./convention-conformance.md), and the anti-pattern catalog (scoped or full).

**Post-update:** `run-audit-passes` applies expressiveness, conformance, principles, anti-patterns, and schema validation.

Each bound technique's protocol is the executable procedure. This file does not duplicate those bullets.

References:

- [design-principles](./design-principles.md) — `audit-principles`
- [schema-construct-inventory](./schema-construct-inventory.md) — `audit-expressiveness`
- [convention-conformance](./convention-conformance.md) — `audit-conformance`
- [anti-patterns](./anti-patterns.md) — `audit-anti-patterns` / `audit-rule-hygiene` / `audit-rule-enforcement`

## Compliance Report Structure

Review-mode `compile-report` follows this structure (create/update uses per-pass checkpoints instead):

```markdown
# Compliance Review: {workflow-id}

**Date:** YYYY-MM-DD
**Workflow:** {workflow-id} v{version}
**Files audited:** {count}

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | N |
| High     | N |
| Medium   | N |
| Low      | N |
| Pass     | N |

## Principle Compliance Findings
(per-principle Pass / Partial / Violation with file, field, and line references)

## Anti-Pattern Findings
(per-entry **name** matches with locations — includes Schema Expressiveness, Rule Hygiene, `structure-backed-constraints`, Tool-Technique-Doc Consistency, Output Economy, and the rest of the catalog; note harness-surface mismatches where those entries require them)

## Schema Validation Results
(per-file pass/fail)

## Recommended Fixes
(prioritized list of changes, grouped by severity)
```

## Transitioning to Update Mode

If the user opts to fix identified issues (`fix-issues` or `selective-fixes`), the disposition sets:

1. `is_review_mode` = `false`, `is_update_mode` = `true`
2. `update_seeded_from_review` = `true` — intake skips `mode-confirmation` and `change-request-confirmed` (the compliance report is already the change spec)
3. Transition back to `intake-and-context`, which clears `update_seeded_from_review` before leaving so a later update cycle can re-confirm normally
