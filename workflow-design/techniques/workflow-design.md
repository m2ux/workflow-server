---
name: workflow-design
description: Primary technique for the workflow-design workflow.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 0
  legacy_id: 0
---

## Capability

Guide agents through designing and drafting workflow definitions that maximize schema expressiveness and follow established conventions

## Inputs

### user-description

Free-form description of the workflow the user wants to create or modify

### target-workflow-id

*(optional)* Existing workflow ID to modify (update mode) or to audit (review mode)

## Protocol

### 1. Intake

- Accept the user's free-form description and summarize key design intent
- Classify as create or update based on whether an existing workflow is referenced (for update mode, see [update-mode-guide](../resources/update-mode-guide.md))
- Set mode variables and present classification for confirmation

### 2. Context Loading

- Fetch workflow-server://schemas MCP resource to load all five JSON schema definitions (workflow, activity, technique, condition, state)
- Read schemas/README.md for the full schema ontology, entity relationships, field tables, examples, and validation guidance
- Call list_workflows and get_workflow for 2+ reference workflows
- Read existing TOON files to confirm format understanding
- Cross-reference schema field tables to identify applicable constructs with correct field names, types, and constraints
- Verify TOON format comprehension by reading existing files before drafting.

### 3. Elicitation

- Elicit one design dimension at a time with a dedicated checkpoint per question
- Capture purpose, activity list, activity model, checkpoints, artifacts, variables, techniques, rules
- Present accumulated design after each answer so the user can track progress
- Each elicitation question is a separate checkpoint. Never combine multiple questions.

### 4. Pattern Analysis

- Extract structural and content patterns from 2+ reference workflows
- Present patterns alongside proposed structure for comparison

### 5. Scope Definition

- Enumerate every file to create/modify/remove with full paths
- Verify the workflows worktree is available
- Present file manifest and structural design for confirmation

### 6. Content Drafting

- Draft files in order — workflow.toon, activities, techniques, resources, README
- Present approach before each file and get confirmation
- Use formal schema constructs for all structured information
- Validate each TOON file against its schema immediately after drafting

### 7. Audit Principle Compliance

- Audit the workflow against each of the 14 design principles from [design-principles](../resources/design-principles.md) (when auditing an existing workflow in review mode, see [review-mode-guide](../resources/review-mode-guide.md))
- For each principle, classify as compliant, partially compliant, or violating; record file, field, and line references
- Cross-reference against workflow.schema.json, activity.schema.json, technique.schema.json, and condition.schema.json to verify field usage

### 8. Audit Anti Pattern Scan

- Walk every anti-pattern in [anti-patterns](../resources/anti-patterns.md) (currently 40 entries across 7 categories); for each finding, record file, content, and recommended fix

### 9. Audit Schema Validation

- Run `npx tsx scripts/validate-workflow-toon.ts <workflow-path>` on every TOON file (workflow.toon, activity files, technique files)
- Record pass/fail per file with the validator's error message

### 10. Audit Tool Technique Doc Consistency

- Verify every tool name in technique tools/protocol sections exists as an actual tool
- Verify return-value descriptions in techniques and bootstrap resources match actual tool behaviour
- Verify bootstrap sequences provide a complete path from session start to first meaningful action — no gaps
- Verify multiple techniques describing the same operation use the same tool name (canonical name only)
- Verify behavioural guidance is not duplicated across techniques and tool descriptions
- Verify no tool's output is a strict subset of another's (redundant tool detection)
- Verify docs (workflow READMEs, technique protocols) use current tool names and descriptions; cross-check against anti-patterns 30-35

### 11. Audit Expressiveness

- Walk every prose passage in workflow.toon, activity files, and technique files against the schema construct inventory in [schema-construct-inventory](../resources/schema-construct-inventory.md)
- Flag every instance where prose substitutes for: steps, checkpoints, decisions, loops, transitions, conditions, triggers, actions, artifacts, variables, modes, inputs, outputs, or protocol phases
- For each flagged instance, rewrite the prose as the formal construct or move it to a field that fits

### 12. Audit Conformance

- Compare against reference workflows for file naming (NN-name.toon), field ordering, version format (X.Y.Z), transition patterns, checkpoint structure, and technique structure
- Flag every divergence; for each, decide whether the divergence is justified or should be brought into conformance

### 13. Audit Rule Hygiene

- Protocol restatement (AP-24): does the rule verbatim copy a protocol phase in the same technique? If so, flag for removal
- Apparent contradictions (AP-25): do sibling rules within the same technique conflict?
- Cross-level duplication (AP-27): does the same rule appear at multiple levels (workflow / activity / technique)?
- Worker-visibility carve-out for AP-27: workers receive get_activity and get_technique responses but never workflow.toon; behavioural rules workers must follow cannot be lifted to the workflow root. Per-technique duplication of worker-directed rules is correct, not a violation. Only flag cross-level duplication when the rule is orchestrator-only (variable management, transitions, commit policy, mode handling)
- Flat prefix patterns (AP-26): do rule keys share a common prefix (foo-bar, foo-baz)? Flag for grouped array refactoring
- Ambiguity (AP-25): could a rule be interpreted in contradictory ways without its group context?
- Single-step rules (AP-29): does the rule apply to only one protocol step? If so, fold into the step's description and delete the standalone rule

### 14. Audit Rule To Structure

- For every rules[] entry in workflow.toon and activity files, ask: can this rule be violated by ignoring it? If yes, verify a structural mechanism (checkpoint, condition, validate action) backs it
- Flag any critical rule that relies solely on text

### 15. Compile Compliance Report

- Compile findings into a structured report: Executive Summary (pass/fail counts by severity), Schema Expressiveness Findings, Convention Conformance Findings, Rule Enforcement Findings, Anti-Pattern Findings, Schema Validation Results, Tool-Technique-Doc Consistency Findings, Recommended Fixes
- Present the report with severity-rated findings and recommended fixes

### 16. Validation

- Run schema validator on all TOON files
- Re-verify scope manifest completeness
- Commit to workflows worktree with signed commit

## Outputs

### workflow-file-set

Complete workflow definition: workflow.toon, activity files, technique files, resource files, README

- **workflow-toon**: Root workflow definition with metadata, modes, variables, rules, artifactLocations
- **activity-files**: One .toon file per activity with steps, checkpoints, transitions
- **technique-files**: One .toon file per technique with protocol, inputs, output, rules
- **resource-files**: Markdown resource files for agent guidance
- **readme**: Workflow README with description, activity table, and usage

## Rules

### workflow-rules-authoritative

Cross-cutting design invariants live in workflow.toon rules[] (14 items). Apply those as the single source of truth; this technique does not duplicate them.

### resource-loading

Use get_resource(session_token, resource_index) for each entry in a technique's _resources after get_technique — refs are lightweight until loaded.

### tool-usage

list_workflows requires no params and no session token

## Errors

### schema_validation_failure

**Cause:** Drafted TOON file does not conform to its schema

**Recovery:** Read the validation error, identify the non-conforming field, fix the content, and re-validate

### format_error

**Cause:** TOON file uses invalid syntax (JSON arrays, YAML nesting, Python quotes)

**Recovery:** Read an existing valid TOON file of the same type, compare syntax, and rewrite

### convention_divergence

**Cause:** Drafted content uses different naming or structural patterns than existing workflows

**Recovery:** Compare against reference workflows, identify the divergence, and align with established conventions

### missing_construct

**Cause:** Prose is used where a formal schema construct exists

**Recovery:** Check the schema construct inventory ([schema-construct-inventory](../resources/schema-construct-inventory.md)) and replace prose with the formal construct
