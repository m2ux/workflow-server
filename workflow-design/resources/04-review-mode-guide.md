# Review Mode Guide

Guidance for auditing existing workflows against the 14 design principles. Review mode produces a compliance report without modifying the target workflow, then offers to switch to update mode for remediation.

---

## Activation

Review mode is activated by recognition patterns: "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", "evaluate workflow". The `is_review_mode` variable is set to `true`.

## Activity Flow

Review mode follows a shortened activity sequence:

1. **Intake** — Load the target workflow, enumerate its contents, then **`review-scope-confirmed` checkpoint**: user confirms `target_workflow_id` before continuing
2. **Context and Literacy** — Load schemas and construct inventory as the audit baseline
3. **Quality Review** — Run all audit passes against the existing workflow (core of review mode)
4. **Validate and Commit** — Save the compliance report as an artifact

Activities 3–7 (requirements-refinement, pattern-analysis, impact-analysis, scope-and-structure, content-drafting) are skipped — there is no design or drafting in review mode.

## Audit Procedure

### Pass 1: Schema Expressiveness Review

For every activity, step, and checkpoint in the workflow, check:

- Are there prose descriptions that encode information the schema has a formal construct for?
- Are there steps that describe user decision points instead of using checkpoints?
- Are there step descriptions that describe iteration instead of using loops?
- Are there step descriptions that describe conditional logic instead of using decisions or step conditions?
- Are there descriptions that mention artifacts without using the `artifacts[]` field?
- Are there implied variables that aren't declared in `variables[]`?

Reference: resource 01 (schema construct inventory) for the complete prose-to-construct mapping.

### Pass 2: Convention Conformance Review

Compare the workflow against established conventions:

| Convention | Check |
|---|---|
| File naming | Activities use `NN-name.toon`, skills use `NN-name.toon`, resources use `NN-name.md` |
| Folder structure | `activities/`, `skills/`, `resources/` subfolders present |
| Version format | All versions use `X.Y.Z` semantic versioning |
| Field ordering | Fields follow the established order (id, version, name, description, ...) |
| Transition patterns | Sequential workflows have `initialActivity` and transitions; independent workflows use recognition |
| Checkpoint structure | All checkpoints have id, name, message, options with effects |
| Skill structure | All skills have id, version, capability; protocol uses step-keyed arrays |
| Modular content | No inline activities in workflow.toon; all content in separate files |

### Pass 3: Rule-to-Structure Audit

For every `rules[]` entry (workflow-level and activity-level):

1. Read the rule text
2. Ask: can an agent violate this rule by simply ignoring it?
3. If yes, check whether a structural mechanism exists that prevents the violation:
   - A checkpoint that forces user confirmation
   - A condition that gates a transition
   - A validate action that checks a pre-condition
   - A decision that automates the branching
4. If no structural mechanism exists, flag the rule as "text-only enforcement"

### Pass 4: Anti-Pattern Scan

Check the workflow against all 23 anti-patterns from resource 02. For each match:

- Record the anti-pattern number and name
- Record the file and location where the violation occurs
- Record the recommended fix

### Pass 5: Schema Validation

Run the schema validator on every TOON file. Record pass/fail results.

### Pass 6: Tool-Skill-Doc Consistency

Audit the consistency boundary between tool descriptions, skill protocols, bootstrap resources, and documentation:

| Check | What to verify |
|---|---|
| Tool name accuracy | Every tool referenced in skill `tools` sections and protocol phases exists as an actual MCP tool |
| Return value accuracy | Skill `tools.returns` entries and protocol descriptions match what the tool actually returns |
| Bootstrap completeness | The bootstrap sequence (bootstrap resource + session-protocol start-session phase) provides a complete path from session start to first activity execution with no gaps |
| Cross-skill consistency | When multiple skills describe the same operation, they use the same tool name and parameter set |
| Duplication audit | Behavioral guidance (token handling, resource loading, sequencing) is stated once authoritatively; other locations reference it rather than duplicating |
| Tool surface overlap | No tool's output is a strict subset of another tool's response (redundant tools add selection ambiguity) |
| Doc-implementation parity | README files, API reference, and IDE setup docs use current tool names, parameters, and return descriptions |

Reference: anti-patterns 30–35 for specific violation patterns.

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

## Schema Expressiveness Findings
(per-file findings with before/after recommendations)

## Convention Conformance Findings
(per-convention pass/fail with details)

## Rule Enforcement Findings
(per-rule text-only vs. structurally enforced)

## Anti-Pattern Findings
(per-anti-pattern matches with locations)

## Schema Validation Results
(per-file pass/fail)

## Tool-Skill-Doc Consistency Findings
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
