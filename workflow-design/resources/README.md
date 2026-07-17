# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Eleven markdown resources providing the design principles, construct inventories, anti-pattern catalog, convention-conformance checklist, mode-specific guidance, the planning-folder README and completion-summary templates, and the design-assumption and elicitation guides used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose |
|-------|----------|---------|
| `00` | [Design Principles](design-principles.md) | Condensed reference of all 15 design principles with enforcement mechanisms |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, technique, and condition schemas |
| `02` | [Anti-Patterns](anti-patterns.md) | Prohibited-pattern catalog (AP-XX + kebab-case name) by category: structural, interaction, schema expressiveness, rule hygiene, description hygiene, coupling, tool-technique-doc consistency, execution, output economy, canon hygiene |
| `03` | [Update Mode Guide](update-mode-guide.md) | Update-mode activation and key differences from create; impact/preservation owned by the impact-analysis technique |
| `04` | [Review Mode Guide](review-mode-guide.md) | Supplementary guide: activation, activity flow, compliance report template, transition-to-update-mode contract. Audit procedure is canonical in quality-review / post-update bound techniques. |
| `05` | [Design Context README](design-context-readme.md) | Template + guidelines for the planning-folder `README.md` seeded at intake; the workflow-design counterpart of the work-package [readme](../../work-package/resources/readme.md) guide. |
| `06` | [Completion Artifact](completion-artifact.md) | Template + guidelines for the `COMPLETE.md` completion summary; the workflow-design counterpart of the work-package [complete-wp](../../work-package/resources/complete-wp.md) guide, with design-authoring sections in place of code/test sections. |
| `07` | [Design Assumptions](design-assumptions.md) | Assumption categories and log template for surfacing and reviewing design assumptions during requirements-refinement; reuses the work-package [assumptions-review](../../work-package/resources/assumptions-review.md) methodology cross-workflow. |
| `08` | [Design Assumption Reconciliation](design-assumption-reconciliation.md) | Framing for audit-resolvable assumptions; mapping owned by reconcile-design-assumptions |
| `09` | [Elicitation Guide](elicitation-guide.md) | Mode dimension sets + per-dimension capture/question bank; counterpart of work-package requirements-elicitation |
| `10` | [Convention Conformance](convention-conformance.md) | Reference conventions and documentation-voice criteria for `audit-conformance` |

---

## Resource Details

### 00 — Design Principles

The 15 design principles derived from analysis of 175+ historical workflow creation sessions across two projects. Each principle entry includes the rule statement and the structural enforcement mechanism that backs it. This resource is the authoritative checklist for design-principle compliance.

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
| Rule hygiene | `no-rule-protocol-restatement`–`no-one-step-rules`, `single-rule-authority`, `worker-rule-reach` |
| Description hygiene | `no-rationale-in-description`–`role-rules-not-description`, `no-hand-authored-artifacts`, `techniques-list-disjoint`, `readme-orients-not-transcribes`, `documentation-voice-positive` |
| Coupling | `io-agnostic-contract`, `no-delivery-mechanism-narration`, `no-tool-usage-prescription`, `canonical-technique-reference`, `anchored-protocol-references`, `technique-stage-agnostic`, `no-activity-prose-rules` |
| Tool-technique-doc consistency | `no-false-resource-delivery`–`no-redundant-tools` |
| Execution | `approach-before-impl`, `structure-backed-constraints`, `work-through-activities`, `accept-correction` |
| Output economy | `single-closeout-artifact`–`lifecycle-row-update`, `canonical-fact-home`–`artifact-audience-declared`, `link-named-artifacts`–`no-caption-only-message`, `runtime-rules-only`, `no-technique-resource-dual-home` |
| Canon hygiene | `cited-home-owns-claim`, `operative-criteria-need-a-home`, `no-shadow-audit-pass`, `canon-layer-cites-not-restates`, `bind-site-is-orchestration-truth` |

### 03 — Update Mode Guide

Covers the update-specific workflow concerns:

- Activation and key differences from create mode

The impact-analysis procedure, content-preservation rules, and side-effect detection are owned by the `impact-analysis` technique; this guide points to them rather than duplicating them.

### 04 — Review Mode Guide

Supplementary guide for review mode. The audit procedure itself is canonical in the quality-review activity's `audit-*` technique protocols; this resource carries only the material that doesn't fit naturally as protocol bullets:

- Activation patterns and shortened activity flow
- Compliance report structure template (markdown skeleton with severity table and per-pass finding sections)
- Transition-to-update-mode contract (variable changes, finding-to-change-spec handoff)

### 05 — Design Context README

Template and section guidelines for the `README.md` entry-point of a workflow-design session's planning folder. Conforms to the canonical [meta planning-readme guide](../../meta/resources/planning-readme.md) — shared with the work-package readme guide — and appends the design-session sections. Sections: header (mode · created · status), Executive Summary, Problem Overview, Solution Overview, Design Decisions, Compliance Findings, Scope Manifest, Progress table, Links.

### 06 — Completion Artifact

Template and section guidelines for the `COMPLETE.md` completion summary — the single terminal artifact of a design session. Sections: header (workflow id / mode / status), Summary, What Was Delivered, Design Decisions, Scope Outcome, Known Limitations & Deferrals, Lessons Learned, Workflow Retrospective. Design-authoring sections replace the work-package guide's code/test sections.

### 07 — Design Assumptions

Assumption categories (Activity Boundaries, Checkpoint Necessity, Technique Selection, Rule Scope, Variable State, Schema Construct Choice) and the assumptions-log template for the design-assumption lifecycle that requirements-refinement runs (collect → reconcile → interview → record). The shared methodology — sources of false assumptions, risk assessment, judgement-augmentation review — is reused from the work-package [assumptions-review](../../work-package/resources/assumptions-review.md) guide; this resource adds only the workflow-design categories and log shape.

### 08 — Design Assumption Reconciliation

Supplementary framing for audit-resolvable design assumptions. The assumption→audit-technique mapping is owned by the `reconcile-design-assumptions` technique protocol; this guide does not duplicate it.

### 09 — Elicitation Guide

Per-dimension question bank and mode dimension sets for one-dimension-at-a-time elicitation: Capture column + anchor questions per dimension, create vs update dimension sets, minimum-viable-elicitation note.

### 10 — Convention Conformance

Reference-convention checklist (naming, field order, version, transitions, checkpoints, techniques) and documentation-voice criteria for the `audit-conformance` pass. YAML drafting mechanics stay in `yaml-authoring`.

---

## Cross-Workflow Access

Other workflows may consult these by resource id (harness load mechanics live in meta tool guidance, not here):

- `workflow-design/design-principles` — [Design principles](./design-principles.md)
- `workflow-design/schema-construct-inventory` — [Construct inventory](./schema-construct-inventory.md)
- `workflow-design/anti-patterns` — [Anti-patterns](./anti-patterns.md)

Useful for workflows that self-audit against the design principles without running full review mode.
