# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Eleven markdown resources providing the design principles, construct inventories, anti-pattern catalog, convention-conformance checklist, mode-specific guidance, the planning-folder README and completion-summary templates, and the design-assumption and elicitation guides used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose |
|-------|----------|---------|
| `00` | [Design Principles](design-principles.md) | Positive framing principles (stance only) |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, technique, and condition schemas |
| `02` | [Anti-Patterns](anti-patterns.md) | Prohibited-pattern catalog (AP-XX + kebab-case name) by category |
| `03` | [Update Mode Guide](update-mode-guide.md) | Change-request category vocabulary for update mode |
| `04` | [Compliance Report](compliance-report.md) | Review-mode compliance report template |
| `05` | [Design Context README](design-context-readme.md) | Planning-folder `README.md` seed template (design-session sections) |
| `06` | [Completion Artifact](completion-artifact.md) | `COMPLETE.md` close-out template |
| `07` | [Design Assumptions](design-assumptions.md) | Assumption categories and log template |
| `08` | [Design Assumption Reconciliation](design-assumption-reconciliation.md) | Audit vs open resolvability vocabulary |
| `09` | [Elicitation Guide](elicitation-guide.md) | Mode dimension sets + per-dimension capture/question bank |
| `10` | [Convention Conformance](convention-conformance.md) | Reference conventions (naming, field order, structure) vs sibling workflows |

---

## Resource Details

### 00 — Design Principles

Positive framing principles — stance only. Detect lives in the anti-pattern catalog and construct inventory; structural gates live in activity YAML.

### 01 — Schema Construct Inventory

Four mapping tables that translate informal prose patterns into their formal schema equivalents:

| Table | Schema | Constructs Covered |
|-------|--------|-------------------|
| Activity-level | `activity.schema.json` | A unified `steps[]` with kinds (technique, action, checkpoint, loop), activity-level decisions and transitions, triggers, outcomes, step gates, rules |
| Workflow-level | `workflow.schema.json` | Variables, workflow rules, inherited techniques, initial activity |
| Technique-level | `technique.schema.json` | Protocol, inputs, output, rules (failure handling is inline in the triggering protocol step) |
| Condition-level | `condition.schema.json` | Simple comparisons, AND/OR/NOT combinators, existence checks |

Also includes checkpoint effect types (`setVariable`, `transitionTo`, `skipActivities`) and action types (`log`, `validate`, `set`, `emit`, `message`).

### 02 — Anti-Patterns

Prohibited patterns organized by category. Cite by kebab-case **name** (stable); each entry also carries a monotonic **AP-XX** list designator. Do not cite the catalog size.

| Category | Examples |
|----------|----------|
| Structural | `no-inline-content`, `schema-is-constraint`, `no-partial-implementation`, `no-invented-naming` |
| Interaction | `atomic-checkpoints`, `no-assumption-execution`, `scope-reverify-completion`, `one-question-per-message` |
| Schema expressiveness | `checkpoint-not-prose`, `loop-not-prose`, `procedure-in-protocol`, `bound-step-no-description`, `no-monolith-masking-steps` |
| Technique protocol | `numbered-protocol-phases`, `technique-outputs-declared`, `prefer-meta-capability` |
| Rule hygiene | `no-rule-protocol-restatement`–`no-one-step-rules`, `single-rule-authority`, `worker-rule-reach` |
| Description hygiene | `no-rationale-in-description`–`role-rules-not-description`, `no-hand-authored-artifacts`, `techniques-list-disjoint`, `readme-orients-not-transcribes`, `documentation-voice-positive` |
| Coupling | `io-agnostic-contract`, `no-delivery-mechanism-narration`, `no-tool-usage-prescription`, `canonical-technique-reference`, `anchored-protocol-references`, `technique-stage-agnostic`, `no-activity-prose-rules` |
| Tool-technique-doc consistency | `no-false-resource-delivery`–`no-redundant-tools` |
| Execution | `approach-before-impl`, `structure-backed-constraints`, `work-through-activities`, `accept-correction` |
| Output economy | `single-closeout-artifact`–`lifecycle-row-update`, `canonical-fact-home`–`artifact-audience-declared`, `link-named-artifacts`–`no-caption-only-message`, `runtime-rules-only`, `no-technique-resource-dual-home` |
| Canon hygiene | `cited-home-owns-claim`, `operative-criteria-need-a-home`, `no-shadow-audit-pass`, `canon-layer-cites-not-restates`, `bind-site-is-orchestration-truth` |

### 03 — Update Mode Guide

Change-request category vocabulary (activity, technique, resource, metadata, structural refactor).

### 04 — Compliance Report

Review-mode compliance report template.

### 05 — Design Context README

Planning-folder `README.md` seed template and design-session section rules. Progress rows are seeded from the workflow activity list — not hard-coded here.

### 06 — Completion Artifact

`COMPLETE.md` close-out template and section rules.

### 07 — Design Assumptions

Assumption categories and log template. Shared methodology from work-package assumptions-review.

### 08 — Design Assumption Reconciliation

Resolvability vocabulary (`audit` vs `open`). Subject→audit mapping stays in the reconciling operation.

### 09 — Elicitation Guide

Mode dimension sets and per-dimension capture/question bank.

### 10 — Convention Conformance

Reference-convention checklist (naming, field order, structure). Definition prose voice lives in the anti-patterns catalog. YAML syntax literacy is out of scope.

---

## Cross-Workflow Access

Other workflows may consult these by resource id (harness load mechanics live in meta tool guidance, not here):

- `workflow-design/design-principles` — [Design principles](./design-principles.md)
- `workflow-design/schema-construct-inventory` — [Construct inventory](./schema-construct-inventory.md)
- `workflow-design/anti-patterns` — [Anti-patterns](./anti-patterns.md)

Useful for workflows that self-audit against the design principles without running full review mode.
