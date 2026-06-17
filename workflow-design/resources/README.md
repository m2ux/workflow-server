# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Five markdown resources providing the design principles, construct inventories, anti-pattern catalogs, and mode-specific guidance used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose |
|-------|----------|---------|
| `00` | [Design Principles](design-principles.md) | Condensed reference of all 14 design principles with enforcement mechanisms |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, technique, and condition schemas |
| `02` | [Anti-Patterns](anti-patterns.md) | 64 prohibited patterns organized by category: structural, interaction, schema expressiveness, rule hygiene, description hygiene, coupling, tool-technique-doc consistency, execution |
| `03` | [Update Mode Guide](update-mode-guide.md) | Content preservation rules, impact analysis procedure, side-effect detection patterns |
| `04` | [Review Mode Guide](review-mode-guide.md) | Supplementary guide: activation, activity flow, compliance report template, transition-to-update-mode contract. **The audit procedure itself is canonical in the quality-review activity's `audit-*` technique protocols** — this resource does not duplicate it. |

---

## Resource Details

### 00 — Design Principles

The 14 design principles derived from analysis of 175+ historical workflow creation sessions across two projects. Each principle entry includes the rule statement and the structural enforcement mechanism that backs it. This resource is the authoritative checklist for design-principle compliance.

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

64 prohibited patterns organized into eight categories:

| Category | Count | Examples |
|----------|-------|---------|
| Structural | 4 | Inline content, schema modification, partial implementations, invented naming |
| Interaction | 4 | Combined checkpoints, assumption-based execution, scope non-verification, multiple questions |
| Schema expressiveness | 9 | Prose checkpoints, prose loops, prose decisions, prose artifacts, implicit variables, prose modes, prose protocols, prose inputs, bound-step purity (description/name on a bound step) |
| Rule hygiene | 6 | Protocol-restating rules, ungrouped contradictory rules, flat prefix keys, cross-level duplication (with worker-visibility carve-out — workers receive get_activity + get_technique but never workflow.toon, so behavioural rules workers must read cannot be lifted to the workflow root), contradictory siblings, single-step rules |
| Description hygiene | 5 | Rationale/process narration in description fields, justification tails on validate messages, prose-based sequence in description, prescribing user-environment modification, role-rule baked into description |
| Coupling | 23 | I/O contracts naming a workflow-internal producer/consumer, literal artifact names in protocol, raw tool names instead of canonical references, unanchored protocol references, identifier-shape and placement conventions, technique referencing activity-level constructs, prose rules at the activity level |
| Tool-technique-doc consistency | 6 | Inaccurate return-value descriptions, incomplete bootstrap sequences, inconsistent tool names across techniques, behavioural guidance duplicated across techniques, mechanics-not-value tool descriptions, redundant tools with subset outputs |
| Execution | 7 | Premature implementation, recommendations without action, text-only rules, destructive updates, invalid TOON syntax, informal execution, defending output |

### 03 — Update Mode Guide

Covers the update-specific workflow concerns:

- Activation and key differences from create mode
- Content preservation rules (flag removals, never silently remove, prefer additive changes)
- Impact analysis procedure (enumerate files, classify impact, check integrity)
- Side-effect detection patterns by change type

### 04 — Review Mode Guide

Supplementary guide for review mode. The audit procedure itself is canonical in the quality-review activity's `audit-*` technique protocols; this resource carries only the material that doesn't fit naturally as protocol bullets:

- Activation patterns and shortened activity flow
- Compliance report structure template (markdown skeleton with severity table and per-pass finding sections)
- Transition-to-update-mode contract (variable changes, finding-to-change-spec handoff)

---

## Cross-Workflow Access

These resources can be loaded by any workflow via:

```
get_resource({ session_index, resource_id: "workflow-design/design-principles" })            # Design principles
get_resource({ session_index, resource_id: "workflow-design/schema-construct-inventory" })    # Construct inventory
get_resource({ session_index, resource_id: "workflow-design/anti-patterns" })                 # Anti-patterns
```

This is useful for workflows that want to self-audit against the design principles without running the full review mode.
