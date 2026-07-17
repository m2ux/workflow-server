# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Ten markdown resources providing the design principles, construct inventories, anti-pattern catalogs, mode-specific guidance, the planning-folder README and completion-summary templates, and the design-assumption and elicitation guides used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose |
|-------|----------|---------|
| `00` | [Design Principles](design-principles.md) | Condensed reference of all 15 design principles with enforcement mechanisms |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, technique, and condition schemas |
| `02` | [Anti-Patterns](anti-patterns.md) | 93 prohibited patterns organized by category: structural, interaction, schema expressiveness, rule hygiene, description hygiene, coupling, tool-technique-doc consistency, execution, output economy |
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

82 prohibited patterns organized into nine categories:

| Category | Count | Examples |
|----------|-------|---------|
| Structural | 4 | Inline content, schema modification, partial implementations, invented naming |
| Interaction | 4 | Combined checkpoints, assumption-based execution, scope non-verification, multiple questions |
| Schema expressiveness | 9 | Prose checkpoints, prose loops, prose decisions, prose artifacts, implicit variables, prose modes, prose protocols, prose inputs, bound-step purity (description/name on a bound step) |
| Rule hygiene | 6 | Protocol-restating rules, ungrouped contradictory rules, flat prefix keys, cross-level duplication (with worker-visibility carve-out — workers receive get_activity + get_technique but never workflow.yaml, so behavioural rules workers must read cannot be lifted to the workflow root), contradictory siblings, single-step rules |
| Description hygiene | 14 | Rationale/process narration in description fields, justification tails on validate messages, prose-based sequence in description, prescribing user-environment modification, role-rule baked into description, bound-step description/name |
| Coupling | 23 | I/O contracts naming a workflow-internal producer/consumer, literal artifact names in protocol, raw tool names instead of canonical references, unanchored protocol references, identifier-shape and placement conventions, technique referencing activity-level constructs, prose rules at the activity level |
| Tool-technique-doc consistency | 6 | Inaccurate return-value descriptions, incomplete bootstrap sequences, inconsistent tool names across techniques, behavioural guidance duplicated across techniques, mechanics-not-value tool descriptions, redundant tools with subset outputs |
| Execution | 7 | Premature implementation, recommendations without action, text-only rules, destructive updates, invalid YAML syntax, informal execution, defending output |
| Output economy | 9 | Redundant artifacts, two-representation logs, vestigial marker steps, always-defaulted checkpoints, acknowledgment-only checkpoints, resource content duplicating technique protocol |

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
