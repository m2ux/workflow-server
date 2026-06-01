# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Five markdown resources providing the design principles, construct inventories, anti-pattern catalogs, and mode-specific guidance used by the workflow-design workflow.

---

## Resource Index

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `00` | [Design Principles](design-principles.md) | Condensed reference of all 14 design principles with enforcement mechanisms | All activities — loaded during [Context and Literacy](../activities/README.md#02-context-and-literacy), referenced throughout |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables for activity, workflow, skill, and condition schemas | [Quality Review](../activities/README.md#08-quality-review) (expressiveness audit), [Content Drafting](../activities/README.md#07-content-drafting) (construct selection) |
| `02` | [Anti-Patterns](anti-patterns.md) | 40 prohibited patterns organized by category: structural, interaction, schema, rule hygiene, description hygiene, tool-skill-doc consistency, execution | [Quality Review](../activities/README.md#08-quality-review) (anti-pattern scan), review mode (compliance audit) |
| `03` | [Update Mode Guide](update-mode-guide.md) | Content preservation rules, impact analysis procedure, side-effect detection patterns | Update mode: [Intake](../activities/README.md#01-intake), [Impact Analysis](../activities/README.md#05-impact-analysis), [Content Drafting](../activities/README.md#07-content-drafting) |
| `04` | [Review Mode Guide](review-mode-guide.md) | Supplementary guide: activation, activity flow, compliance report template, transition-to-update-mode contract. **The audit procedure itself is canonical in the `workflow-design` skill protocol's `audit-*` phases** — this resource does not duplicate it. | Review mode: [Quality Review](../activities/README.md#08-quality-review), [Validate and Commit](../activities/README.md#09-validate-and-commit) |

---

## Resource Details

### 00 — Design Principles

The 14 design principles derived from analysis of 175+ historical workflow creation sessions across two projects. Each principle entry includes the rule statement and the structural enforcement mechanism that backs it. This resource is the authoritative checklist for the quality review activity.

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

40 prohibited patterns organized into seven categories:

| Category | Count | Examples |
|----------|-------|---------|
| Structural | 4 | Inline content, schema modification, partial implementations, invented naming |
| Interaction | 4 | Combined checkpoints, assumption-based execution, scope non-verification, multiple questions |
| Schema expressiveness | 8 | Prose checkpoints, prose loops, prose decisions, prose artifacts, implicit variables, prose modes, prose protocols, prose inputs |
| Rule hygiene | 6 | Protocol-restating rules, ungrouped contradictory rules, flat prefix keys, cross-level duplication (with worker-visibility carve-out — workers receive get_activity + get_skill but never workflow.toon, so behavioural rules workers must read cannot be lifted to the workflow root), contradictory siblings, single-step rules |
| Description hygiene | 5 | Rationale/process narration in description fields, justification tails on validate messages, prose-based sequence in description, prescribing user-environment modification, role-rule baked into description |
| Tool-skill-doc consistency | 6 | Inaccurate return-value descriptions, incomplete bootstrap sequences, inconsistent tool names across skills, behavioural guidance duplicated across skills, mechanics-not-value tool descriptions, redundant tools with subset outputs |
| Execution | 7 | Premature implementation, recommendations without action, text-only rules, destructive updates, invalid TOON syntax, informal execution, defending output |

### 03 — Update Mode Guide

Covers the update-specific workflow concerns:

- Activation and key differences from create mode
- Content preservation rules (flag removals, never silently remove, prefer additive changes)
- Impact analysis procedure (enumerate files, classify impact, check integrity)
- Side-effect detection patterns by change type

### 04 — Review Mode Guide

Supplementary guide for review mode. The audit procedure itself is canonical in the `workflow-design` skill protocol (phases prefixed with `audit-`); this resource carries only the material that doesn't fit naturally as protocol bullets:

- Activation patterns and shortened activity flow
- Compliance report structure template (markdown skeleton with severity table and per-pass finding sections)
- Transition-to-update-mode contract (variable changes, finding-to-change-spec handoff)

---

## Cross-Workflow Access

These resources can be loaded by any workflow via:

```
get_resource({ workflow_id: "workflow-design", index: "00" })   # Design principles
get_resource({ workflow_id: "workflow-design", index: "01" })   # Construct inventory
get_resource({ workflow_id: "workflow-design", index: "02" })   # Anti-patterns
```

This is useful for workflows that want to self-audit against the design principles without running the full review mode.
