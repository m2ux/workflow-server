---
name: review-mode-guide
description: Guidance for auditing existing workflows against the 15 design principles.
metadata:
  order: 4
  legacy_id: 4
---

# Review Mode Guide

Guidance for auditing existing workflows against the 15 design principles. Review mode produces a compliance report without modifying the target workflow(s), then offers to switch to update mode for remediation.

This guide carries the **supplementary** material for review mode: activation/flow framing, the compliance report template, and the transition-to-update-mode contract. The **audit procedure itself** is canonical in the `quality-review` activity's bound `audit-*` techniques — the worker loads each via `get_technique` and executes its protocol. This file does not restate the procedure.

---

## Activation

`intake-classification` classifies the request as review when it matches recognition signals such as "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", or "evaluate workflow", and produces `operation_type` = `review` with `is_review_mode` = `true` as its declared outputs (landed via the worker's `variables-changed` channel). These signals inform the classification; the mode flag is set structurally by the technique's outputs, not by this prose.

Multi-target review is first-class: name one or more workflow ids in the request. Intake sets `target_workflow_ids` (array) and seeds `target_workflow_id` to the first element. Single-target review is a one-element list on that array.

## Activity Flow

Review mode follows a shortened activity sequence:

1. **Intake and Context** — Load each target workflow in `target_workflow_ids`, enumerate contents, internalize the schemas as the audit baseline, then the `review-scope-confirmed` checkpoint (blocking) confirms the full target set before continuing.
2. **Quality Review** — `forEach` over `target_workflow_ids`, binding each id to `target_workflow_id` and running the audit passes (reload, principles, anti-patterns, schema validation, consistency, verify-high-findings, compile-report). The `review-disposition` checkpoint runs once after all targets. This is the core of review mode.
3. **Validate and Commit** — Save the compliance report as an artifact.
4. **Retrospective** — Capture a session retrospective.

`requirements-refinement`, `pattern-analysis`, `impact-analysis`, and `scope-and-draft` are skipped — there is no design or drafting in review mode.

## Audit Procedure

Canonical location: the `audit-*` techniques bound by the `quality-review` activity — `audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement`, `audit-principles`, `audit-anti-patterns`, `audit-schema-validation`, `audit-consistency` — plus `compile-report`.

Each technique's protocol is the executable procedure. The `quality-review` and `post-update-review` activities bind these techniques at their steps; the worker loads each via `get_technique` and executes its protocol. This file deliberately does not duplicate the bullets — there is one canonical source.

References cited by the audit techniques:

- [design-principles](./design-principles.md) — design principles (input for `audit-principles`)
- [schema-construct-inventory](./schema-construct-inventory.md) — schema construct inventory (input for `audit-expressiveness`)
- [anti-patterns](./anti-patterns.md) — anti-pattern catalog (input for `audit-anti-patterns` and `audit-rule-hygiene`)

## Compliance Report Structure

The compliance report follows this structure:

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

## Schema Expressiveness Findings
(per-file findings with before/after recommendations)

## Convention Conformance Findings
(per-convention pass/fail with details)

## Rule Hygiene Findings
(per-rule violations from `no-rule-protocol-restatement`–`no-one-step-rules` with file, rule key, recommended action)

## Rule Enforcement Findings
(per-rule text-only vs. structurally enforced)

## Anti-Pattern Findings
(per-entry **name** matches with locations)

## Schema Validation Results
(per-file pass/fail)

## Tool-Technique-Doc Consistency Findings
(per-check pass/fail with specific mismatches)

## Recommended Fixes
(prioritized list of changes, grouped by severity)
```

## Transitioning to Update Mode

If the user opts to fix identified issues (`fix-issues` or `selective-fixes`), the disposition sets:

1. `is_review_mode` = `false`, `is_update_mode` = `true`
2. `update_seeded_from_review` = `true` — intake skips `mode-confirmation` and `change-request-confirmed` (the compliance report is already the change spec)
3. Transition back to `intake-and-context`, which clears `update_seeded_from_review` before leaving so a later update cycle can re-confirm normally
