# Design Principles: Workflow Creation Workflow

This document translates the misalignment patterns identified in [00-history-analysis.md](00-history-analysis.md) into concrete design principles, rules, and structural requirements for a "workflow creation workflow" — a meta-workflow that guides agents through producing new or modified workflow definitions.

---

## Governing Insight

> Misalignment scales with interpretive freedom. Every structural or ontological decision left to agent discretion is a point of failure. The workflow must reduce interpretive freedom to zero for structural decisions while preserving creative latitude for domain-specific content.

---

## Principle 1: Internalize Before Producing

**Problem addressed:** Architectural / ontological misunderstanding (9 occurrences across 5 sessions)

The agent must demonstrate understanding of the project's conceptual model *before* producing any workflow content. In every historical failure involving structural misalignment, the agent began producing content before internalizing the architecture.

### Rules

1. **Mandatory comprehension gate.** Before any content is drafted, the agent must load and summarize the following, presenting the summary to the user for confirmation:
   - The Goal → Activity → Skill hierarchy and how the new workflow fits within it
   - The distinction between schema concerns and runtime/loader concerns
   - The distinction between inline and modular content (modular is always correct)
   - The existing workflow conventions (naming, folder structure, file types)
   - The existing workflows to understand patterns and avoid duplication

2. **Existing pattern audit.** The agent must examine at least two existing workflows of similar type and extract their structural patterns before proposing a structure for the new workflow. The patterns must be presented to the user alongside the proposed structure.

3. **Terminology verification.** Any new terms introduced must be explicitly confirmed with the user. Domain terminology changes require a dedicated confirmation checkpoint with a description of the term's semantic scope and relationship to existing terms.

---

## Principle 2: Define Complete Scope Before Execution

**Problem addressed:** Incomplete scope coverage (11 occurrences across 7 sessions)

In every historical failure involving incomplete changes, the agent began execution before enumerating all locations that would be affected. The multi-worktree setup was a particular blind spot.

### Rules

1. **Scope enumeration checkpoint.** Before any modification begins, the agent must produce a complete list of:
   - All files that will be created (with full paths)
   - All files that will be modified (with full paths)
   - All files that will become obsolete and should be removed
   - All locations where parallel changes are needed (worktrees, branches, README files, template files, schema files, test files)

2. **Worktree awareness.** The scope enumeration must explicitly include the `workflows` worktree if any workflow content is being created or modified. The agent must verify the worktree is checked out and on the correct branch before proceeding.

3. **Post-execution scope verification.** After all changes are complete, the agent must re-verify the scope enumeration list, confirming each item was addressed. Any items not addressed must be flagged to the user before declaring completion.

---

## Principle 3: One Question at a Time, One Checkpoint per Decision

**Problem addressed:** Checkpoint / interaction pattern violations (6 occurrences across 3 sessions)

The agent collapsed multiple decisions into single checkpoints and presented multiple questions simultaneously, despite explicit rules prohibiting this.

### Rules

1. **Atomic checkpoints.** Each decision point must be a separate blocking checkpoint. If two steps can be independently skipped, they must have independent checkpoints. No compound checkpoints.

2. **Sequential presentation.** Checkpoints must be presented one at a time. The agent must wait for the user's response to one checkpoint before presenting the next.

3. **Show before asking.** Any checkpoint that asks for confirmation of content (assumptions, analysis, design decisions) must display the full content before asking for the user's decision. The content must be in the same message as the question.

---

## Principle 4: Maximize Schema Expressiveness — Formal Over Informal

**Problem addressed:** Schema / format misuse (4 occurrences across 3 sessions), plus a pervasive anti-pattern where agents encode structured information as prose descriptions when the schema provides dedicated formal constructs for that exact purpose.

The schema system provides a rich vocabulary of formal constructs — steps, checkpoints, decisions, loops, transitions, conditions, triggers, actions, artifacts, variables, modes, skills with protocols/inputs/outputs — each designed to represent a specific kind of workflow information. When an agent writes a prose paragraph saying "ask the user whether to proceed" instead of defining a checkpoint with options and effects, or writes "repeat for each item in the list" instead of defining a forEach loop, the workflow loses its machine-readability, its ability to be validated, and its ability to be executed deterministically.

This is the most structurally important principle for the workflow creation workflow: **every piece of workflow information must be encoded using the most specific formal construct the schema provides.**

### Rules

1. **Schema construct audit before drafting.** Before writing any workflow content, the agent must review the schema construct inventory (below) and confirm which constructs are applicable to the workflow being created. This audit must be presented to the user.

2. **Formal-over-informal mandate.** If the schema provides a dedicated construct for a piece of information, that construct must be used. Prose is only acceptable for content that has no formal schema equivalent — namely `description` fields, `problem` statements, and `recognition` patterns, which are inherently natural-language.

3. **Construct-by-construct validation.** During content review, each piece of workflow content must be checked against the construct mapping below. Any prose that maps to a formal construct must be flagged and rewritten.

### Schema Construct Inventory

The following table maps informal patterns (what agents tend to write as prose) to their formal schema equivalents. The workflow creation workflow must enforce the formal column.

#### Activity-Level Constructs (`activity.schema.json`)

| Informal Pattern (prose) | Formal Construct | Schema Fields |
|---|---|---|
| "Do X, then do Y, then do Z" | **Steps** | `steps[].id`, `steps[].name`, `steps[].description`, `steps[].skill`, `steps[].actions` |
| "Ask the user whether to proceed" | **Checkpoint** | `checkpoints[].id`, `.name`, `.message`, `.options[]` with `.effect` (setVariable, transitionTo, skipActivities) |
| "If X then do A, otherwise do B" (automated) | **Decision** with branches | `decisions[].branches[]` with `.condition` and `.transitionTo` |
| "Repeat for each item" / "do until done" | **Loop** | `loops[].type` (forEach/while/doWhile), `.variable`, `.over`, `.condition`, `.maxIterations`, `.breakCondition`, `.steps` |
| "Then move on to the next phase" | **Transition** | `transitions[].to`, `.condition`, `.isDefault` |
| "This triggers the X workflow" | **WorkflowTrigger** | `triggers.workflow`, `.description`, `.passContext` |
| "When entering this activity, log a message" | **Entry/exit actions** | `entryActions[]` / `exitActions[]` with `.action` (log/validate/set/emit/message) |
| "This activity produces a report file" | **Artifact** | `artifacts[].id`, `.name`, `.location`, `.description`, `.action` (create/update) |
| "The expected result is X" | **Outcome** | `outcome[]` (string array) |
| "This step should only run when X is true" | **Step condition** | `steps[].condition` (references `condition.schema.json`) |
| "In fast mode, skip steps 2 and 3" | **Mode overrides** | `modeOverrides.{mode}.skipSteps[]`, `.steps[]`, `.checkpoints[]`, `.rules[]` |
| "The agent must follow these constraints" | **Activity rules** | `rules[]` (string array of constraints) |

#### Workflow-Level Constructs (`workflow.schema.json`)

| Informal Pattern (prose) | Formal Construct | Schema Fields |
|---|---|---|
| "Track whether the user confirmed" | **Variable** | `variables[].name`, `.type`, `.description`, `.defaultValue`, `.required` |
| "This workflow can run in fast or thorough mode" | **Mode** | `modes[].id`, `.name`, `.description`, `.activationVariable`, `.recognition`, `.skipActivities`, `.defaults`, `.resource` |
| "The agent must always do X throughout" | **Workflow rules** | `rules[]` (string array, enforced across all activities) |
| "Artifacts go in the planning folder" | **Artifact location** | `artifactLocations.{key}.path`, `.description`, `.gitignored` |
| "Start with the first activity" | **Initial activity** | `initialActivity` (activity ID) |

#### Skill-Level Constructs (`skill.schema.json`)

| Informal Pattern (prose) | Formal Construct | Schema Fields |
|---|---|---|
| "First do A, then do B, then do C" (procedure) | **Protocol** | `protocol.{step-id}[]` — phase-keyed arrays of imperative bullets |
| "This skill needs a checklist path as input" | **Inputs** | `inputs[].id`, `.description`, `.required`, `.default` |
| "This skill produces an audit report" | **Output** | `output[].id`, `.description`, `.components`, `.artifact.name` |
| "Never modify the schema during this skill" | **Rules** | `rules.{rule-name}` — flat name-value pairs |
| "Use the get_workflow tool to load data" | **Tools** | `tools.{name}.when`, `.params`, `.returns`, `.next`, `.preserve` |
| "If the workflow is not found, list available ones" | **Errors** | `errors.{name}.cause`, `.recovery`, `.detection`, `.resolution` |
| "How to interpret checkpoints during execution" | **Interpretation** | `interpretation.transitions`, `.checkpoints`, `.decisions`, `.loops`, `.resources` |
| "How to resume after a session restart" | **Resumption** | `resumption.description`, `.steps[]`, `.note` |

#### Condition Constructs (`condition.schema.json`)

| Informal Pattern (prose) | Formal Construct | Schema Fields |
|---|---|---|
| "If status equals approved" | **Simple condition** | `type: "simple"`, `variable`, `operator` (==, !=, >, <, >=, <=), `value` |
| "If the variable is defined" | **Existence check** | `operator: "exists"` or `"notExists"` |
| "If A and B are both true" | **AND combinator** | `type: "and"`, `conditions[]` |
| "If either A or B is true" | **OR combinator** | `type: "or"`, `conditions[]` |
| "If X is not the case" | **NOT combinator** | `type: "not"`, `condition` |

### Checkpoint Effects — Use Them

A particularly common failure is defining checkpoints with options that have no `effect`. The schema provides three effect types that should be used whenever a checkpoint option has consequences:

| Effect | Purpose | Example |
|---|---|---|
| `setVariable` | Set workflow variables based on user choice | `{ "setVariable": { "approved": true } }` |
| `transitionTo` | Jump to a specific activity based on user choice | `{ "transitionTo": "rejected" }` |
| `skipActivities` | Skip downstream activities based on user choice | `{ "skipActivities": ["research", "analysis"] }` |

If a checkpoint option changes workflow state, navigates to a different activity, or skips downstream work, the corresponding effect must be declared formally — not left for the agent to interpret from prose.

### Actions — Use Them

Entry/exit actions and step actions are another frequently neglected construct. The schema provides five action types:

| Action | Purpose | When to Use |
|---|---|---|
| `log` | Record a message to execution history | Activity entry/exit, significant state changes |
| `validate` | Check a condition and fail if not met | Pre-conditions for an activity or step |
| `set` | Assign a variable value | Computed state changes (e.g., setting a timestamp) |
| `emit` | Signal an event | Cross-workflow communication, hooks |
| `message` | Display markdown content to the user | Presenting formatted information during execution |

---

## Principle 5: Convention Over Invention

**Problem addressed:** Convention / pattern non-adherence (8 occurrences across 6 sessions)

The agent repeatedly invented new naming conventions, structural patterns, or field names when established conventions existed.

### Rules

1. **No new naming without justification.** The agent must not introduce any new naming pattern (field names, file names, folder names, term names) without first searching for an existing convention that serves the same purpose. If an existing convention exists, it must be used. If no convention exists, the proposed name must be presented to the user for approval before use.

2. **Convention conformance checkpoint.** Before committing any new workflow content, the agent must compare the produced content against at least one existing workflow of the same type and flag any structural divergences to the user.

---

## Principle 6: Never Modify Upward

**Problem addressed:** Wrong direction of fix (3 occurrences across 2 sessions)

When the agent's output didn't comply with the schema, it attempted to modify the schema to match the output rather than fixing the output.

### Rules

1. **Schema is immutable during workflow creation.** Unless the user explicitly requests a schema change, the schema is treated as a fixed constraint. All content must conform to the schema as-is.

2. **Loader conventions are immutable during workflow creation.** Runtime conventions (e.g., `activitiesDir` resolution, skill discovery paths) are not part of the schema and must not be proposed as schema additions. If the agent encounters a gap between what it needs and what the schema provides, it must ask the user whether this is a schema gap or a convention the loader should handle.

3. **Direction-of-fix checkpoint.** When the agent encounters a compliance issue, it must present the issue to the user with two options: (a) fix the content to match the constraint, or (b) flag the constraint as potentially incorrect. The agent must not choose option (b) autonomously.

---

## Principle 7: Confirm Before Irreversible Changes

**Problem addressed:** Unverified assumptions and premature execution (7 occurrences across 5 sessions)

The agent executed domain terminology changes, structural reorganizations, and architectural decisions without confirmation, leading to costly reverts.

### Rules

1. **Irreversibility classification.** Changes are classified as:
   - **Reversible:** File content edits, additions (can be reverted with git)
   - **Semi-reversible:** Multi-file renames, cross-worktree changes (can be reverted but painful)
   - **Effectively irreversible:** Domain terminology changes, schema modifications, published API changes

2. **Confirmation gates by class.** Reversible changes proceed with normal checkpoint flow. Semi-reversible changes require an explicit confirmation checkpoint listing all affected locations. Effectively irreversible changes require a dedicated decision checkpoint with semantic impact analysis.

3. **No speculative execution.** The agent must not execute changes "to see how they look." If the user makes a speculative suggestion (especially during post-implementation review), the agent must ask for explicit confirmation before acting.

---

## Principle 8: Corrections Must Persist

**Problem addressed:** Failure to learn from corrections (4 occurrences across 3 sessions)

The agent repeated identical errors within the same session after explicit correction.

### Rules

1. **Correction log.** When the user corrects the agent, the agent must acknowledge the correction, restate the rule it violated, and record the corrected rule as an active constraint for the remainder of the session.

2. **Pre-commit compliance check.** Before committing any content, the agent must verify that none of the session's recorded corrections are violated by the content being committed.

3. **Pattern generalization.** When a correction applies to one instance, the agent must proactively check whether the same pattern exists elsewhere and apply the correction broadly. The scope of generalization must be presented to the user.

---

## Principle 9: Modular Over Inline, Always

**Problem addressed:** Content duplication (5 occurrences across 3 sessions) and architectural misunderstanding

The agent's default instinct was to inline content — embedding activities in workflows, templates in resources, skill definitions in activity files — when the project's design philosophy is strictly modular.

### Rules

1. **No inline content.** Workflow definitions must never contain inline activity definitions, inline skill definitions, or inline resource content. All content must be in separate files in the appropriate folders.

2. **Reference-only workflow files.** The workflow TOON file defines metadata, activity sequencing, and references. Activity details, skill details, and resource content live in their respective folders and are resolved by the loader.

3. **Migration completeness.** When extracting content from one location to another (e.g., moving inline activities to an `activities/` folder), the agent must verify that the source location no longer contains the extracted content. Content must exist in exactly one location.

---

## Principle 10: Encode Constraints as Structure, Not Text

**Problem addressed:** Rules loaded but not followed (3 occurrences across 3 sessions — midnight-agent-eng)

The most damaging finding from the supplementary analysis: agents demonstrably call `get_rules()`, load and acknowledge workflow rules, then violate them in their very next action. Text-based rules — whether in TOON `rules[]` arrays, skill `rules` objects, or markdown guidance — are necessary for context but insufficient for enforcement.

### Rules

1. **Critical constraints must be structural.** Any rule whose violation would produce incorrect or irreversible output must be encoded as a structural enforcement mechanism, not merely as rule text. The schema provides: checkpoints (force user decision), conditions (gate transitions), validate actions (check pre-conditions), and decisions (automated branching). Use these.

2. **Rule-to-structure audit.** During content drafting, the agent must review every `rules[]` entry (both workflow-level and activity-level) and ask: "Can this rule be violated by ignoring it?" If yes, the rule must be supplemented with a structural mechanism that prevents the violation (a checkpoint that cannot be skipped, a condition that gates the transition, or a validate action that fails the step).

3. **Defense-in-depth layering.** For the highest-severity constraints, use multiple enforcement layers: rule text (for context) + checkpoint (for user visibility) + validate action (for automated checking). No single-layer enforcement for critical constraints.

---

## Principle 11: Plan Before Acting

**Problem addressed:** Act first, plan later (3 occurrences across 2 sessions — midnight-agent-eng)

Agents move to implement changes without first presenting *how* they plan to address the task, forcing the user to intervene and halt premature execution.

### Rules

1. **Mandatory approach presentation.** Before any modification to workflow content begins, the agent must present its planned approach — what it will change, how, and in what order — and receive user confirmation. The plan must be explicit enough for the user to identify incorrect assumptions.

2. **No draft-as-exploration.** The agent must not create or modify files "to see how they look." All modifications must follow a confirmed plan. If the plan needs revision, the revision is presented to the user before resuming.

3. **Approach checkpoint in every activity.** Every activity in the workflow creation workflow must include an approach-confirmed checkpoint before its implementation steps begin.

---

## Principle 12: Non-Destructive Updates

**Problem addressed:** Destructive updates (3 occurrences across 3 sessions) — agents overwrite existing content, losing valuable material without warning.

### Rules

1. **Content preservation audit.** Before overwriting any existing file, the agent must compare the new content against the existing content and identify any material being removed. Removed material must be explicitly flagged to the user before the overwrite proceeds.

2. **No net-negative updates.** An update that reduces content (e.g., a README that drops from 642 to 272 lines) must never proceed without explicit user confirmation of what is being removed and why.

3. **Additive-by-default.** When updating existing workflow files, the agent should default to additive changes (adding new content, extending existing structures) rather than replacing entire sections. Replacement requires a checkpoint.

---

## Principle 13: Format Literacy Before Content

**Problem addressed:** Format/syntax illiteracy (1 occurrence, critical — midnight-agent-eng) and schema validation failures (multiple occurrences across both projects)

Agents authored TOON files using invalid syntax (JSON inline arrays, Python triple-quotes, YAML-style nesting), producing files that couldn't parse at all. This cascaded into complete execution failure in subsequent sessions.

### Rules

1. **Format validation before commit.** All workflow files must be validated against the schema before being committed. The workflow creation workflow must include a validation step that runs the schema validator (`npx tsx scripts/validate-workflow.ts`) on every produced file.

2. **TOON format comprehension gate.** Before drafting any TOON file content, the agent must demonstrate understanding of TOON format rules by reading at least one existing valid TOON file of the same type and confirming the format conventions. The agent must not proceed if it cannot produce syntactically valid TOON.

3. **Schema-aware drafting.** During content drafting, each file must be tested against its schema. If a file fails validation, the error must be fixed immediately — not deferred to a later step.

---

## Principle 14: Complete Documentation Structure

**Problem addressed:** Workflows produced without README files in subfolders lack discoverability and self-documentation, forcing agents to read TOON files to understand the workflow's contents.

Every workflow must include documentation that follows the established structure used by mature workflows (e.g., prism, work-package). This documentation is part of the workflow deliverable — not an afterthought.

### Rules

1. **Root README required.** Every workflow must have a `README.md` at its root documenting: workflow overview, modes, activity sequence (with Mermaid diagram), activities table, skills table, resources table, variables table, execution model, and file structure tree.

2. **Subfolder READMEs required.** Each subfolder (`activities/`, `skills/`, `resources/`) must have its own `README.md` documenting the contents of that folder:
   - `activities/README.md` — Per-activity documentation with purpose, skills, steps, checkpoints, transitions, mode overrides.
   - `skills/README.md` — Per-skill documentation with protocol phases, rules, error recovery. Include Mermaid diagrams for complex protocols.
   - `resources/README.md` — Resource index with purpose, usage context, and cross-workflow access examples.

3. **Follow established style.** README format and depth must follow the patterns established in the prism and work-package workflows. Each subfolder README opens with a back-link to the parent README (`> Part of the [Workflow Name](../README.md)`).

4. **Scope manifest inclusion.** All README files (root and subfolder) must be included in the scope manifest during the scope-and-structure activity. They are part of the deliverable, not optional.

---

## Structural Requirements for the Workflow

Based on these principles, the workflow creation workflow should include the following activity sequence:

| # | Activity | Key Checkpoints | Purpose |
|---|----------|-----------------|---------|
| 1 | **Context gathering** | comprehension-confirmed | Ensure agent understands the project's conceptual model, existing workflows, schema, and conventions |
| 2 | **Format and schema literacy** | format-confirmed, constructs-confirmed | Verify TOON format comprehension by reading existing files; review all schema constructs and identify which are applicable |
| 3 | **Requirements elicitation** | requirements-confirmed | Capture what the workflow should do, its activities, and success criteria — one question at a time |
| 4 | **Existing pattern analysis** | patterns-confirmed | Audit existing workflows of similar type to extract reusable structural patterns |
| 5 | **Scope definition** | scope-confirmed | Enumerate all files to be created/modified/removed, including worktree content |
| 6 | **Terminology review** | terminology-confirmed | Review any new terms, ensuring they don't conflict with or duplicate existing terms |
| 7 | **Structure design** | approach-confirmed, structure-confirmed | Present planned approach for confirmation; propose folder structure, activity decomposition, and file layout |
| 8 | **Content drafting** | approach-confirmed (per file), per-file-review | Present approach before each file; draft content using formal schema constructs; validate against schema immediately |
| 9 | **Rule-to-structure audit** | enforcement-confirmed | Review all rules[] entries and verify critical constraints are backed by structural enforcement (checkpoints, conditions, validate actions) |
| 10 | **Schema expressiveness review** | expressiveness-confirmed | Audit all drafted content for prose that should be a formal construct; verify construct coverage per the inventory |
| 11 | **Convention conformance check** | conformance-confirmed | Compare all produced content against existing workflows and flag divergences |
| 12 | **Content preservation check** | preservation-confirmed | For modifications: compare new content against existing, flag any material being removed |
| 13 | **Scope verification** | scope-verified | Re-verify the scope enumeration, confirming all items addressed |
| 14 | **Commit and validation** | validation-passed | Validate all files against schema, commit changes, run typecheck/tests, verify across worktrees |

### Cross-Cutting Concerns

- **Plan-before-act enforcement:** Every activity includes an approach-confirmed checkpoint before implementation begins (Principle 11)
- **Schema expressiveness enforcement:** Active during content drafting (activity 8) and as a dedicated review (activity 10); every prose block must be checked against the construct inventory (Principle 4)
- **Rule-to-structure audit:** Active during activity 9; every text-based rule checked for structural enforcement viability (Principle 10)
- **Format validation:** Active during content drafting and at commit time; all TOON files validated against schema (Principle 13)
- **Content preservation:** Active during any modification to existing files; net-negative changes require explicit approval (Principle 12)
- **Correction tracking:** Active throughout all activities; corrections recorded and enforced at every checkpoint (Principle 8)
- **Direction-of-fix gating:** Active during content drafting and conformance checking (Principle 6)
- **Generalization prompts:** Active after any correction — check for similar patterns elsewhere (Principle 8)
- **Irreversibility classification:** Active before any commit or multi-file change (Principle 7)

---

## Anti-Patterns to Explicitly Prohibit

The workflow's rules/guidance documents should explicitly prohibit these patterns observed in history:

### Structural Anti-Patterns
1. **"Let me just inline that"** — No content embedding in parent files
2. **"Let me adjust the schema to match"** — Schema is a fixed constraint during workflow creation
3. **"I'll fix the rest later"** — No partial implementations; scope must be fully addressed
4. **"I'll name it [new_thing]"** — No new naming without convention search and user approval

### Interaction Anti-Patterns
5. **"Skip/combine these checkpoints"** — Each checkpoint is atomic and independent
6. **"The user probably means..."** — No assumption-based execution; ask when uncertain
7. **"Done!"** (without scope re-verification) — Completion requires scope checklist verification
8. **"Here are three questions..."** — One question per message, always

### Schema Expressiveness Anti-Patterns
9. **"Ask the user whether to proceed"** (as prose in a description) — Use a `checkpoint` with `options` and `effects`
10. **"Repeat this for each item"** (as prose in a step description) — Use a `loop` with `type: "forEach"` and `over`
11. **"If X then do A, otherwise B"** (as prose) — Use a `decision` with `branches` and `conditions`, or a `transition` with `condition`
12. **"This produces a report"** (buried in a description) — Use an `artifact` with `id`, `name`, `location`, and `action`
13. **"Track whether the user approved"** (as a comment or implicit) — Use a `variable` with `type`, `defaultValue`, and wire it to checkpoint `effects`
14. **"In fast mode, skip the research steps"** (as a rule string) — Use a `mode` with `skipActivities` and activity-level `modeOverrides`
15. **"First load the workflow, then get the activity"** (as prose in a skill) — Use the skill's `protocol` with step-keyed imperative bullets
16. **"This skill needs a file path"** (buried in description) — Use skill `inputs[]` with `id`, `description`, `required`

### Execution Anti-Patterns (from midnight-agent-eng)
17. **"I'll just start implementing"** — Present approach and receive confirmation before any modification (Principle 11)
18. **"Here's what I recommend..."** (without doing it) — Recommendations must be followed by implementation in the same session; analysis without action is incomplete
19. **"The agent must never do X"** (as rule text only) — Critical constraints must be backed by structural enforcement, not just text (Principle 10)
20. **Updated README** (that removes diagrams/content) — Content-reducing updates require explicit preservation audit and user confirmation (Principle 12)
21. **Writing TOON with JSON/YAML syntax** — Verify format literacy before drafting; validate all files before commit (Principle 13)
22. **Executing work outside the workflow's formal structure** — All work must flow through defined activities; informal combination of results is prohibited
23. **Defending output when corrected** — Re-examine the output; never push back on a user correction without evidence
