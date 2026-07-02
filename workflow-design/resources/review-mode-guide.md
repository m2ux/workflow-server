---
name: review-mode-guide
description: Guidance for auditing existing workflows against the 15 design principles.
metadata:
  order: 4
  legacy_id: 4
---

# Review Mode Guide

Guidance for auditing existing workflows against the 15 design principles. Review mode produces a compliance report without modifying the target workflow, then offers to switch to update mode for remediation.

This guide carries the **supplementary** material for review mode: activation/flow framing, the compliance report template, and the transition-to-update-mode contract. The **audit procedure itself** is canonical in the `quality-review` activity's bound `audit-*` techniques — the worker loads each via `get_technique` and executes its protocol. This file does not restate the procedure.

---

## Activation

Review mode is activated by recognition patterns: "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", "evaluate workflow". The `is_review_mode` variable is set to `true`.

## Activity Flow

Review mode follows a shortened activity sequence:

1. **Intake and Context** — Load the target workflow, enumerate its contents, internalize the schemas as the audit baseline, then the `review-scope-confirmed` checkpoint (blocking) confirms `target_workflow_id` before continuing.
2. **Quality Review** — Run the audit passes against the existing workflow. This is the core of review mode.
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
(per-rule violations from AP-24–29 with file, rule key, recommended action)

## Rule Enforcement Findings
(per-rule text-only vs. structurally enforced)

## Anti-Pattern Findings
(per-anti-pattern matches with locations)

## Schema Validation Results
(per-file pass/fail)

## Tool-Technique-Doc Consistency Findings
(per-check pass/fail with specific mismatches)

## Recommended Fixes
(prioritized list of changes, grouped by severity)
```

## Transitioning to Update Mode

If the user opts to fix identified issues, the workflow transitions to update mode:

1. `is_review_mode` is set to `false`
2. `is_update_mode` is set to `true`
3. The compliance report findings become the change specification for update mode
4. The workflow restarts from the intake activity in update mode with the findings pre-loaded
