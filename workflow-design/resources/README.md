# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Five markdown resources providing the design principles, construct inventories, anti-pattern catalogs, and mode-specific guidance used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `00` | [Design Principles](00-design-principles.md) | Condensed reference of all 13 design principles with enforcement mechanisms | All activities — loaded during context-and-literacy, referenced throughout |
| `01` | [Schema Construct Inventory](01-schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, skill, and condition schemas | Quality review (expressiveness audit), content drafting (construct selection) |
| `02` | [Anti-Patterns](02-anti-patterns.md) | 23 prohibited patterns organized by category: structural, interaction, schema, execution | Quality review (anti-pattern scan), review mode (compliance audit) |
| `03` | [Update Mode Guide](03-update-mode-guide.md) | Content preservation rules, impact analysis procedure, side-effect detection patterns | Update mode activities (intake, impact-analysis, content-drafting) |
| `04` | [Review Mode Guide](04-review-mode-guide.md) | Compliance audit procedure, 5 audit passes, report structure template | Review mode activities (quality-review, validate-and-commit) |

---

## Resource Details

### 00 — Design Principles

The 13 design principles derived from analysis of 175+ historical workflow creation sessions across two projects. Each principle entry includes the rule statement and the structural enforcement mechanism that backs it. This resource is the authoritative checklist for the quality review activity.

### 01 — Schema Construct Inventory

Four mapping tables that translate informal prose patterns into their formal schema equivalents:

| Table | Schema | Constructs Covered |
|-------|--------|-------------------|
| Activity-level | `activity.schema.json` | Steps, checkpoints, decisions, loops, transitions, triggers, actions, artifacts, outcomes, conditions, mode overrides, rules |
| Workflow-level | `workflow.schema.json` | Variables, modes, workflow rules, artifact locations, initial activity |
| Skill-level | `skill.schema.json` | Protocol, inputs, outputs, rules, tools, errors, interpretation, resumption |
| Condition-level | `condition.schema.json` | Simple comparisons, AND/OR/NOT combinators, existence checks |

Also includes checkpoint effect types (`setVariable`, `transitionTo`, `skipActivities`) and action types (`log`, `validate`, `set`, `emit`, `message`).

### 02 — Anti-Patterns

23 prohibited patterns organized into four categories:

| Category | Count | Examples |
|----------|-------|---------|
| Structural | 4 | Inline content, schema modification, partial implementations, invented naming |
| Interaction | 4 | Combined checkpoints, assumption-based execution, scope non-verification, multiple questions |
| Schema expressiveness | 8 | Prose checkpoints, prose loops, prose decisions, prose artifacts, implicit variables, prose modes, prose protocols, prose inputs |
| Execution | 7 | Premature implementation, recommendations without action, text-only rules, destructive updates, invalid TOON syntax, informal execution, defending output |

### 03 — Update Mode Guide

Covers the update-specific workflow concerns:

- Activation and key differences from create mode
- Content preservation rules (flag removals, never silently remove, prefer additive changes)
- Impact analysis procedure (enumerate files, classify impact, check integrity)
- Side-effect detection patterns by change type

### 04 — Review Mode Guide

Covers the review-specific workflow concerns:

- Activation and shortened activity flow
- Five audit passes (expressiveness, conformance, rule enforcement, anti-patterns, schema validation)
- Compliance report structure template
- Transition to update mode for remediation

---

## Cross-Workflow Access

These resources can be loaded by any workflow via:

```
get_resource({ workflow_id: "workflow-design", index: "00" })   # Design principles
get_resource({ workflow_id: "workflow-design", index: "01" })   # Construct inventory
get_resource({ workflow_id: "workflow-design", index: "02" })   # Anti-patterns
```

This is useful for workflows that want to self-audit against the design principles without running the full review mode.
