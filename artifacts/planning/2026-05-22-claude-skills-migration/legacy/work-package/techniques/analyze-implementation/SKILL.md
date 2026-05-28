---
name: analyze-implementation
description: Analyze the current implementation and establish quantitative baseline metrics.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 7
  legacy_id: 7
---

# Analyze Implementation

## Capability

Analyze current implementation to understand effectiveness, establish baselines, and identify improvement opportunities

## Inputs

### requirements

Elicited requirements from the elicitation activity

### problem-statement

Problem statement from design philosophy

### target-submodule

Target submodule for the work package (e.g., midnight-node, midnight-ledger)

## Protocol

### 1. Load Guidance

- Use attached [implementation-analysis](../../resources/implementation-analysis/SKILL.md) for full guidance
- Review requirements and problem_statement for analysis scope

### 2. Gitnexus First Locate

- When the target codebase has a GitNexus index, apply [gitnexus-operations](../gitnexus-operations/SKILL.md)::[query](../gitnexus-operations/query.md) (`{query: <concept>}`) to find execution flows by concept and [gitnexus-operations](../gitnexus-operations/SKILL.md)::[context](../gitnexus-operations/context.md) (`{name: <symbol>}`) for 360-degree symbol usage (callers, callees, process membership)
- Read `gitnexus://repo/{name}/clusters` to identify functional areas and `gitnexus://repo/{name}/processes` for end-to-end flow inventory
- Fall back to grep/Read/glob only when the codebase is not indexed or the index is stale.

### 3. Locate Implementation

- Apply [gitnexus-operations](../gitnexus-operations/SKILL.md)::[context](../gitnexus-operations/context.md) to identify where the feature/component is implemented (files, modules, entry points) — falls back to grep when not indexed
- Map usage and dependencies via [gitnexus-operations](../gitnexus-operations/SKILL.md)::[impact](../gitnexus-operations/impact.md) (`{target, direction: 'upstream'}`) and call-graph traversal; record architecture from cluster resources
- Document current structure and integration points

### 4. Evaluate Effectiveness

- Review logs, metrics, tests, issues, and code comments
- Assess current effectiveness and pain points
- Identify evidence of problems or improvement areas

### 5. Establish Baselines

- Establish quantitative baseline metrics (performance, quality, usage, reliability)
- Document how each metric was measured for reproducibility
- Record current values before any changes
- Link baseline metrics to success criteria from requirements

### 6. Identify Gaps

- Link gaps to measurable success criteria from requirements
- Document assumptions about current behavior
- Create implementation-analysis.md artifact

## Outputs

### analysis-document

Current implementation analysis with baselines and improvement opportunities

- **artifact**: `implementation-analysis.md`
- **current_state**: Location, usage, dependencies, architecture
- **baseline_metrics**: Quantitative baselines with measurement methods
- **gaps**: Identified gaps linked to success criteria
- **success_criteria**: Measurable criteria for improvement

## Rules

### measure-before-improve

You can't improve what you don't measure — establish quantitative baselines

## Errors

### no_existing_impl

**Cause:** No current implementation exists (new feature)

**Recovery:** Document baseline as N/A and focus on expected metrics for success criteria
