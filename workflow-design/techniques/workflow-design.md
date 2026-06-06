---
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

- Accept the `user-description` and summarize key design intent
- Classify as create or update based on whether a `target-workflow-id` is supplied (for update mode, see [update-mode-guide](../resources/update-mode-guide.md))
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
- If a file uses invalid syntax (JSON arrays, YAML nesting, Python quotes), read an existing valid TOON file of the same type, compare syntax, and rewrite
- If a file fails to conform to its schema, read the validation error, identify the non-conforming field, fix the content, and re-validate

### 7. Audit Principle Compliance

- Audit the workflow against each of the 14 design principles from [design-principles](../resources/design-principles.md) (when auditing an existing workflow in review mode, see [review-mode-guide](../resources/review-mode-guide.md))
- For each principle, classify as compliant, partially compliant, or violating; record file, field, and line references
- Cross-reference against workflow.schema.json, activity.schema.json, technique.schema.json, and condition.schema.json to verify field usage

### 8. Audit Anti Pattern Scan

- Walk every anti-pattern in [anti-patterns](../resources/anti-patterns.md) (currently 48 entries across 8 categories); for each finding, record file, content, and recommended fix
- Protocol self-description (AP-47): for every technique except the workflow-engine group, scan `## Protocol` for sentences describing the delivery mechanism rather than an action — "Resources are attached to technique responses", "available in the `_resources` field", "loaded via `get_technique`", "in the technique response", "the worker self-bootstraps". Flag each; recommend deleting the mechanism narration and keeping only the imperative action plus the canonical resource/technique reference
- Raw tool reference (AP-48): for every technique except the operation wrappers (`gitnexus-operations`, `harness-compat`), scan `## Protocol` for raw tool names that invoke a capability another technique wraps — e.g. `gitnexus_context`, `gitnexus_impact`, `gitnexus_cypher`, `gitnexus_query`, `gitnexus_list_repos`. Flag each; recommend the canonical hyperlinked reference to the wrapping op (e.g. `[gitnexus-operations](path)::[context](path)`), preserving arguments
- Resource→caller coupling (AP-44): for every resource (under `resources/`), check it does NOT name or link a technique that produces/consumes/calls it — backlink prose ("produced by", "composed by", "used by", "consumed by" + a technique name), markdown links to `../techniques/...`, or "Used By" / "Referenced By" catalogue columns mapping the resource to its consumers. Forward references (a prompt resource directing its reader to execute a technique, "use technique X" cross-refs, ontology/model descriptions) are NOT violations. Flag reverse caller-references; recommend describing the resource by what it is
- Artifact-name contract (AP-43): check that every artifact a technique creates or consumes carries its concrete name in the I/O declaration — a literal, a `{token}`-template, or a discriminator-keyed note — and NOT hardcoded in a Protocol step; and that a technique consuming multiple artifacts declares them as individually-named Inputs, not one opaque `*-paths` array. Flag Protocol steps that embed a filename (literal or `{templated}`) the I/O declaration should carry, and opaque multi-artifact path-array inputs
- Canonical artifact reference (AP-42): for every technique, check that `## Protocol` references artifacts by their canonical Input/Output identifier, not a literal filename or path (`assumptions-log`, not `assumptions-log.md`); that Input/Output ids are canonical names rather than path-flavored proxies (a `-path` suffix is the signal); and that an artifact built from a template hyperlinks its noun to the template's resource section (`[noun](../resources/<id>.md#section)`). Flag literal-filename references in Protocol, `-path` input/output ids, and template-backed artifacts whose noun is not linked to its resource section
- Unresolved output reference (AP-46): for every technique, check that every Protocol step referencing an output names the specific output designator (`{output-id}` or `{output-id}.field`) — never "the output", "the result", "the artifact", or any other vague pronoun. Each step must be anchored to a declared `## Output` entry. Flag any step where the reader must infer which output is meant
- Redundant label + link (AP-45): scan every technique for occurrences of `word ([same-word](url))` where the plain-text word and the link display text are the same name (modulo case/hyphen). Flag each occurrence and recommend collapsing to a single `[word](url)` hyperlink. Exclude cases where the preceding label is semantically distinct from the link text (e.g. a role name preceding a resource id)
- I/O coupling (AP-41): for every technique, inspect its `## Inputs` and `## Output`/`## Outputs` sections — flag any entry that names or links a workflow-internal producer or consumer of the value (another technique, an activity, a step, a checkpoint, a loop, or a workflow/activity file) as its source or destination. Markdown links to another technique `.md` and prose forms ("from X", "produced by X", "consumed by X", "for X") are the signal. Exclude `## Protocol`/`## Capability` utilisation references (including an inline "apply technique X" error recovery), resource links, and descriptions of a value's intrinsic/external nature ("git diff output", "the user's request", "provided by the server"). For each finding, recommend rewriting the entry to describe the value generically and removing the source/destination naming

### 9. Audit Schema Validation

- Run `npx tsx scripts/validate-workflow-toon.ts <workflow-path>` on every TOON file (workflow.toon, activity files, technique files)
- Record pass/fail per file with the validator's error message

### 10. Audit Tool Technique Doc Consistency

- Verify every tool name in technique tools/protocol sections exists as an actual tool
- Verify return-value descriptions in techniques and bootstrap resources match actual tool behaviour
- Verify bootstrap sequences provide a complete path from session start to first meaningful action — no gaps
- Verify multiple techniques describing the same tool action use the same tool name (canonical name only)
- Verify behavioural guidance is not duplicated across techniques and tool descriptions
- Verify no tool's output is a strict subset of another's (redundant tool detection)
- Verify docs (workflow READMEs, technique protocols) use current tool names and descriptions; cross-check against anti-patterns 30-35

### 11. Audit Expressiveness

- Walk every prose passage in workflow.toon, activity files, and technique files against the schema construct inventory in [schema-construct-inventory](../resources/schema-construct-inventory.md)
- Flag every instance where prose substitutes for: steps, checkpoints, decisions, loops, transitions, conditions, triggers, actions, artifacts, variables, modes, inputs, outputs, or protocol phases
- For each flagged instance, rewrite the prose as the formal construct or move it to a field that fits
- If prose is used where a formal schema construct exists, check the schema construct inventory ([schema-construct-inventory](../resources/schema-construct-inventory.md)) and replace the prose with the formal construct

### 12. Audit Conformance

- Compare against reference workflows for file naming (NN-name.toon), field ordering, version format (X.Y.Z), transition patterns, checkpoint structure, and technique structure
- Flag every divergence; for each, decide whether the divergence is justified or should be brought into conformance
- If drafted content uses different naming or structural patterns than existing workflows, identify the divergence against the reference workflows and align with the established conventions

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
- Commit the completed `workflow-file-set` to the workflows worktree with a signed commit

## Outputs

### workflow-file-set

Complete workflow definition: workflow.toon, activity files, technique files, resource files, README

#### workflow-toon

Root workflow definition with metadata, modes, variables, rules, artifactLocations

#### activity-files

One .toon file per activity with steps, checkpoints, transitions

#### technique-files

One .toon file per technique with protocol, inputs, output, rules

#### resource-files

Markdown resource files for agent guidance

#### readme

Workflow README with description, activity table, and usage

## Rules

### workflow-rules-authoritative

Cross-cutting design invariants live in workflow.toon rules[] (14 items). Apply those as the single source of truth; this technique does not duplicate them.

### resource-loading

Use get_resource(session_token, resource_index) for each entry in a technique's _resources after get_technique — refs are lightweight until loaded.

### tool-usage

list_workflows requires no params and no session token
