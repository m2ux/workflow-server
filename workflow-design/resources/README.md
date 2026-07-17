# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Ten markdown resources providing the design principles, construct inventories, anti-pattern catalogs, mode-specific guidance, the planning-folder README and completion-summary templates, and the design-assumption and elicitation guides used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose |
|-------|----------|---------|
| `00` | [Design Principles](design-principles.md) | Condensed reference of all 15 design principles with enforcement mechanisms |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, technique, and condition schemas |
| `02` | [Anti-Patterns](anti-patterns.md) | 92 prohibited patterns (kebab-case names) organized by category: structural, interaction, schema expressiveness, rule hygiene, description hygiene, coupling, tool-technique-doc consistency, execution, output economy |
| `03` | [Update Mode Guide](update-mode-guide.md) | Content preservation rules, impact analysis procedure, side-effect detection patterns |
| `04` | [Review Mode Guide](review-mode-guide.md) | Supplementary guide: activation, activity flow, compliance report template, transition-to-update-mode contract. **The audit procedure itself is canonical in the quality-review activity's `audit-*` technique protocols** — this resource does not duplicate it. |
| `05` | [Design Context README](design-context-readme.md) | Template + guidelines for the planning-folder `README.md` seeded at intake; the workflow-design counterpart of the work-package [readme](../../work-package/resources/readme.md) guide. |
| `06` | [Completion Artifact](completion-artifact.md) | Template + guidelines for the `COMPLETE.md` completion summary; the workflow-design counterpart of the work-package [complete-wp](../../work-package/resources/complete-wp.md) guide, with design-authoring sections in place of code/test sections. |
| `07` | [Design Assumptions](design-assumptions.md) | Assumption categories and log template for surfacing and reviewing design assumptions during requirements-refinement; reuses the work-package [assumptions-review](../../work-package/resources/assumptions-review.md) methodology cross-workflow. |
| `08` | [Design Assumption Reconciliation](design-assumption-reconciliation.md) | How workflow-design reconciles audit-resolvable assumptions via its own audit techniques, in place of work-package's code analysis. |
| `09` | [Elicitation Guide](elicitation-guide.md) | Per-dimension question bank for the one-dimension-at-a-time elicitation; the counterpart of the work-package [requirements-elicitation](../../work-package/resources/requirements-elicitation.md) guide. |

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

92 prohibited patterns organized into nine categories (cite by kebab-case **name**, not numeric designators):

| Category | Count | Examples |
|----------|-------|---------|
| Structural | 4 | `no-inline-content`, `schema-is-constraint`, `no-partial-implementation`, `no-invented-naming` |
| Interaction | 4 | `atomic-checkpoints`, `no-assumption-execution`, `scope-reverify-completion`, `one-question-per-message` |
| Schema expressiveness | 9 | `checkpoint-not-prose`, `loop-not-prose`, `procedure-in-protocol`, `pure-technique-binding` |
| Rule hygiene | 6 | `no-rule-protocol-restatement`–`no-one-step-rules` (incl. worker-visibility carve-out on `single-rule-authority`) |
| Description hygiene | 14 | `no-rationale-in-description`–`role-rules-not-description`, `no-hand-authored-artifacts`, `techniques-list-disjoint`, `readme-orients-not-transcribes` |
| Coupling | 23 | `io-agnostic-contract`, `canonical-technique-reference`, `anchored-protocol-references`, `technique-stage-agnostic`, `no-activity-prose-rules` |
| Tool-technique-doc consistency | 6 | `no-false-resource-delivery`–`no-redundant-tools` |
| Execution | 7 | `approach-before-impl`, `structure-backed-constraints`, `work-through-activities`, `accept-correction` |
| Output economy | 19 | `single-closeout-artifact`–`lifecycle-row-update`, `canonical-fact-home`–`artifact-audience-declared`, `link-named-artifacts`–`no-caption-only-message`, `runtime-rules-only`, `no-technique-resource-dual-home` |

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

How workflow-design reconciles audit-resolvable assumptions — mapping each kind of assumption to the audit technique that settles it (`audit-schema-validation`, `audit-conformance`, `audit-consistency`, `audit-principles`) — in place of work-package's GitNexus-backed code analysis. The audit-technique mapping is owned by the `reconcile-design-assumptions` technique protocol; this guide carries the supplementary framing.

### 09 — Elicitation Guide

Per-dimension question bank for the guided, one-dimension-at-a-time elicitation in requirements-refinement: goal and anchor questions per dimension (purpose, activity list, model, checkpoints, artifacts, variables, techniques, rules), plus a minimum-viable-elicitation note.

---

## Cross-Workflow Access

These resources can be loaded by any workflow via:

```
get_resource({ session_index, resource_id: "workflow-design/design-principles" })            # Design principles
get_resource({ session_index, resource_id: "workflow-design/schema-construct-inventory" })    # Construct inventory
get_resource({ session_index, resource_id: "workflow-design/anti-patterns" })                 # Anti-patterns
```

This is useful for workflows that want to self-audit against the design principles without running the full review mode.
