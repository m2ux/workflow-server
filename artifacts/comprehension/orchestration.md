# Orchestration — Comprehension Artifact

> **Last updated**: 2026-03-25 (fourth pass — execution trace surface)  
> **Work packages**: [#51 Checkpoint Enforcement Reliability](../planning/2026-03-12-checkpoint-enforcement-reliability/README.md), [#59 Rename MCP Tools](../planning/2026-03-24-rename-mcp-tools/README.md), [#63 Execution Traces](../planning/2026-03-25-execution-traces/README.md)  
> **Coverage**: Workflow server architecture, orchestrator/worker execution model, checkpoint enforcement chain, schema infrastructure, validation surface analysis, tool naming surface, session management gap, execution trace surface
> **Related artifacts**: [Assumptions Log](../planning/2026-03-12-checkpoint-enforcement-reliability/01-assumptions-log.md)

## Architecture Overview

### Project Structure

The workflow server is a TypeScript/Node.js MCP server (`@m2ux/workflow-server` v0.1.0). The source is organized into six functional layers:

```
src/
├── index.ts              # Entry point: config → server → transport
├── server.ts             # MCP server: tool + resource registration
├── config.ts             # ServerConfig: workflowDir, schemasDir, schemaPreamble
├── errors.ts             # Domain error types (WorkflowNotFoundError, etc.)
├── result.ts             # Result<T, E> monad: ok(), err(), unwrap()
├── logging.ts            # Structured JSON logging + audit event wrapper
├── tools/
│   ├── workflow-tools.ts # 6 tools: list_workflows, get_workflow, validate_transition,
│   │                     #          get_workflow_activity, get_checkpoint, health_check
│   └── resource-tools.ts # 9 tools: get_activities, get_activity, get_rules, get_skills,
│                         #          list_skills, get_skill, list_workflow_resources,
│                         #          get_resource, discover_resources
├── loaders/              # Data access layer (filesystem → validated objects)
│   ├── workflow-loader.ts  # Workflow + activity loading from TOON files
│   ├── activity-loader.ts  # Activity discovery, index building
│   ├── skill-loader.ts     # Skill resolution (workflow-specific → universal)
│   ├── resource-loader.ts  # Resource file discovery (TOON + markdown)
│   ├── rules-loader.ts     # Global rules from meta/rules.toon
│   ├── schema-loader.ts    # JSON schema loading (5 schemas)
│   └── schema-preamble.ts  # Schema preamble builder (cached at startup)
├── schema/               # Zod schema definitions → runtime validation
│   ├── workflow.schema.ts  # WorkflowSchema: variables, modes, activities
│   ├── activity.schema.ts  # ActivitySchema: steps, checkpoints, decisions, loops
│   ├── condition.schema.ts # ConditionSchema + evaluateCondition()
│   ├── skill.schema.ts     # SkillSchema: protocol, tools, rules, I/O
│   └── state.schema.ts     # WorkflowStateSchema: history, checkpoint responses
├── types/                # Re-export layer (types + schemas from schema/)
├── utils/toon.ts         # TOON decoder wrapper (@toon-format/toon)
└── resources/
    └── schema-resources.ts # MCP resource: workflow-server://schemas
```

Workflow data lives in a `workflows/` worktree (orphan branch) with this layout:

```
workflows/
├── meta/                            # Universal skills, activities, rules
│   ├── workflow.toon
│   ├── rules.toon                   # Global agent behavioral guidelines
│   ├── skills/                      # 9 universal skills
│   │   ├── 04-orchestrate-workflow.toon  # Orchestrator coordination skill
│   │   └── 05-execute-activity.toon      # Worker execution skill
│   ├── activities/                  # start/resume/end workflow
│   └── resources/
├── work-package/                    # Primary workflow (v3.4.0, 14 activities)
│   ├── workflow.toon
│   ├── activities/                  # 14 activity TOON files (01 through 14)
│   ├── skills/                      # 24 workflow-specific skills
│   └── resources/                   # 27+ resources (templates, guides)
├── work-packages/                   # Multi-package coordination workflow
├── prism/                           # Analysis/review workflow
├── substrate-node-security-audit/   # Security audit workflow
└── cicd-pipeline-security-audit/    # CI/CD audit workflow
```

### Module Map

| Module | Responsibility | Key Dependencies |
|--------|---------------|-----------------|
| `server.ts` | MCP server creation and tool/resource registration | `@modelcontextprotocol/sdk`, tools, resources |
| `tools/workflow-tools.ts` | Workflow navigation tools (read-only data access) | loaders/workflow-loader |
| `tools/resource-tools.ts` | Activity, skill, resource, rules tools | All loaders |
| `loaders/workflow-loader.ts` | Workflow + activity file I/O with TOON decoding and Zod validation | utils/toon, schema/workflow, schema/activity |
| `loaders/activity-loader.ts` | Activity file discovery across workflows, index building | utils/toon, schema/activity |
| `loaders/skill-loader.ts` | Skill resolution: workflow-specific → universal (meta/) fallback | utils/toon, schema/skill |
| `loaders/resource-loader.ts` | Resource file discovery (TOON + markdown), legacy `guides/` fallback | utils/toon |
| `schema/activity.schema.ts` | Zod schema for Activity, including CheckpointSchema | schema/condition |
| `schema/state.schema.ts` | Zod schema for WorkflowState including CheckpointResponseSchema | — |
| `schema/condition.schema.ts` | Condition evaluation engine (evaluateCondition) | — |

### Design Patterns

1. **Stateless Read-Only Server**: The server reads TOON files, validates with Zod, and returns JSON. It holds no runtime workflow state — no session, no in-progress tracking, no enforcement middleware. State management is delegated to the consuming agents.

2. **TOON Configuration Format**: Workflow definitions use TOON (decoded via `@toon-format/toon`), a custom format more concise than JSON/YAML for nested configuration. The `decodeToon<T>()` wrapper in `utils/toon.ts` converts TOON strings to typed objects.

3. **Zod Schema Validation**: Every loaded entity (workflow, activity, skill, condition, state) is validated against Zod schemas. Both `parse()` (throws) and `safeParse()` (returns result) patterns are used. Schemas serve double duty: runtime validation and TypeScript type inference via `z.infer<>`.

4. **Result Monad**: Loaders return `Result<T, E>` instead of throwing. Tools unwrap results and throw for MCP-level error responses. This separates error handling (loaders return errors) from error presentation (tools throw for MCP).

5. **Audit Logging Wrapper**: `withAuditLog()` wraps every tool handler to log structured audit events (tool name, parameters, duration, success/error) to stderr as JSON.

6. **Schema Preamble**: Built once at startup from JSON schema files and cached on `ServerConfig`. Prepended to `get_workflow` responses so consuming agents have schema context without separate requests.

7. **Two-Tier Skill Resolution**: Skills are resolved first in the workflow-specific directory (`{workflow}/skills/`), then in the universal directory (`meta/skills/`). This allows workflows to override universal skills.

## Key Abstractions

### Core Types

| Type | Module | Role |
|------|--------|------|
| `Workflow` | workflow.schema.ts | Top-level container: id, version, variables, modes, artifact locations, activities |
| `Activity` | activity.schema.ts | Unit of work: steps, checkpoints, decisions, loops, transitions, skills reference |
| `Checkpoint` | activity.schema.ts | User decision point within an activity: id, message, options, required, blocking |
| `CheckpointOption` | activity.schema.ts | A selectable choice at a checkpoint: id, label, description, effect (setVariable, transitionTo, skipActivities) |
| `Step` | activity.schema.ts | Atomic execution unit: id, name, description, optional skill reference, required flag |
| `Skill` | skill.schema.ts | Tool orchestration pattern: protocol, tools, rules, inputs, outputs |
| `Condition` | condition.schema.ts | Boolean evaluation: simple (variable comparison), and, or, not — used in transitions, loops, decisions |
| `Transition` | activity.schema.ts | Navigation between activities: target activity ID, optional condition, isDefault flag |
| `WorkflowState` | state.schema.ts | Runtime state: current activity, completed activities, checkpoint responses, decision outcomes, variables, history |
| `CheckpointResponse` | state.schema.ts | Record of a checkpoint response: optionId, respondedAt, effects applied |
| `Result<T, E>` | result.ts | Algebraic error handling: `{ success: true, value: T } \| { success: false, error: E }` |

### Checkpoint Schema (Critical for Issue #51)

```typescript
CheckpointSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),           // Prompt text for the user
  prerequisite: z.string().optional(), // Unstructured string condition
  options: z.array(CheckpointOptionSchema).min(1),
  required: z.boolean().default(true),
  blocking: z.boolean().default(true),
});
```

The `required` and `blocking` fields distinguish checkpoint types:
- `required: true, blocking: true` — Must be presented, must pause for user response
- `required: true, blocking: false` — Must be presented, auto-advances after timeout
- `required: false` — Optional, can be skipped

### State Tracking

`WorkflowState.checkpointResponses` uses string keys in format `"activityId-checkpointId"` mapping to `CheckpointResponse` objects. This provides the data needed for validation (which checkpoints were responded to) but no code enforces completeness.

### Error Handling

Domain-specific error classes (`WorkflowNotFoundError`, `SkillNotFoundError`, etc.) extend `Error` with a `code` field. Loaders return `Result<T, DomainError>` for predictable error flow. Tools call `unwrap()` or check `result.success` and throw on failure, converting to MCP error responses.

## Design Rationale

### Stateless Server Architecture

- **Observation**: The server has no session state, no checkpoint tracking middleware, no enforcement gates. It is purely a read-only data layer over TOON files.
- **Hypothesized rationale**: Simplicity and separation of concerns. The server provides the "what" (workflow definitions, schemas), while agents handle the "how" (execution, state, enforcement). This makes the server easy to test and deploy — no database, no session store, no concurrency concerns.
- **Trade-offs**: Optimizes for simplicity and testability. Sacrifices enforcement capability — the server cannot prevent an agent from claiming activity completion without having completed checkpoints. All enforcement is "advisory" (prompt-level).
- **Implications for issue #51**: Adding server-side checkpoint gates would require breaking the stateless model. This is the fundamental architectural tension the issue addresses.

### Orchestrator/Worker Split

- **Observation**: Two skill TOON files (`04-orchestrate-workflow.toon` and `05-execute-activity.toon`) define a two-agent pattern where one agent coordinates and another executes.
- **Hypothesized rationale**: Separation of coordination concerns (state management, transitions, user interaction) from domain work (code analysis, artifact production). The orchestrator has a simpler task (evaluate conditions, manage state, present checkpoints) while the worker handles complex, open-ended domain work.
- **Trade-offs**: Reduces the cognitive load on each agent but creates a trust boundary — the orchestrator must trust the worker's reported results, which is the root cause of the checkpoint enforcement problem.
- **Implications for issue #51**: The orchestrator's `process-result` step 4 is the validation point where `checkpoints_responded` should be cross-referenced against required blocking checkpoints. Currently this is a prompt instruction only.

### TOON Format for Workflow Definitions

- **Observation**: All workflow definitions use `.toon` files decoded by `@toon-format/toon`.
- **Hypothesized rationale**: TOON is more concise than JSON for deeply nested configuration. It preserves the structured nature of JSON while being more human-readable, which matters when workflow definitions are authored and maintained by humans.
- **Trade-offs**: Introduces a dependency on a less-standard format. Requires a dedicated parser. Limits ecosystem tooling (no native IDE support for TOON).

### Schema Validation Architecture

- **Observation**: Zod schemas validate data at load time, and JSON schemas (generated from Zod) are provided as a preamble to consuming agents.
- **Hypothesized rationale**: Dual validation strategy — Zod catches malformed definitions at server startup (fail fast), while JSON schema preambles give agents structural understanding of the data they receive.
- **Trade-offs**: Duplicated schema definitions (Zod + JSON). The preamble adds context window cost for agents but prevents schema interpretation errors.

### Unstructured Checkpoint Prerequisites

- **Observation**: `CheckpointSchema.prerequisite` is `z.string().optional()` — a free-text field (e.g., "Only present when on_feature_branch is true") rather than a structured `ConditionSchema`.
- **Hypothesized rationale**: Flexibility — prerequisites may reference complex conditions that are easier to describe in prose than encode in the condition schema. This was likely a pragmatic choice during initial development.
- **Trade-offs**: Prevents machine evaluation of prerequisites. The orchestrator cannot programmatically determine whether a checkpoint's prerequisite is met, which complicates validation — a checkpoint that is `required: true` but whose prerequisite is not met should arguably be excluded from mandatory validation.

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| Workflow | `WorkflowSchema` + `workflow.toon` | A structured process with ordered activities (e.g., work-package) |
| Activity | `ActivitySchema` + `NN-activity-id.toon` | A phase of work within a workflow (e.g., start-work-package, implement) |
| Checkpoint | `CheckpointSchema` within ActivitySchema | A user decision point that may block execution |
| Blocking Checkpoint | Checkpoint with `blocking: true` | Requires execution to pause and yield to the user |
| Non-Blocking Checkpoint | Checkpoint with `blocking: false` | Informational; auto-advances after timeout |
| Skill | `SkillSchema` + `NN-skill-id.toon` | Tool orchestration guidance for executing an activity |
| Transition | `TransitionSchema` | Conditional navigation between activities |
| Condition | `ConditionSchema` + `evaluateCondition()` | Boolean expression evaluated against state variables |
| Worker | Agent using `execute-activity` skill | Executes activity steps, yields at checkpoints |
| Orchestrator | Agent using `orchestrate-workflow` skill | Manages transitions, state, and user interaction |
| TOON | `@toon-format/toon` | Custom structured configuration format |
| MCP | `@modelcontextprotocol/sdk` | Model Context Protocol for AI tool communication |
| Schema Preamble | `buildSchemaPreamble()` | Pre-computed schema context prepended to workflow responses |
| Checkpoint Response | `CheckpointResponseSchema` | Record that a user responded to a checkpoint |
| Variable | `VariableDefinitionSchema` | Named state value tracked across the workflow |
| Mode | `ModeSchema` | Execution variant that modifies standard workflow behavior (e.g., review mode) |

### Domain Model

The server implements a hierarchical execution model:

```
Goal (user intent)
 └── Workflow (structured process)
      ├── Variables (state that flows across activities)
      ├── Modes (execution variants)
      └── Activities (ordered phases)
           ├── Steps (atomic work units)
           ├── Checkpoints (user decision points)
           ├── Decisions (conditional branches)
           ├── Loops (iteration constructs)
           ├── Transitions (navigation to next activity)
           └── Skills (execution guidance)
                ├── Protocol (step-by-step instructions)
                ├── Tools (which MCP tools to use)
                └── Rules (behavioral constraints)
```

The orchestrator/worker split maps to this model: the orchestrator navigates the Workflow → Activity → Transition layer, while the worker operates within a single Activity, following its Steps and Skills.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | How does the `prerequisite` field on checkpoints interact with checkpoint required/blocking validation? Should checkpoints whose prerequisites are not met be excluded from mandatory validation? | Resolved | Prerequisites are free-text strings, not machine-evaluable. Checkpoints with unmet prerequisites should be excluded from validation, but this requires parsing strings or migrating to structured conditions. | DD-1 |
| Q2 | Does the orchestrate-workflow skill's `process-result` step 4 validation happen in practice, or is it purely aspirational? | Resolved | Purely aspirational — the validation logic described in the prompt instruction is comprehensive but subject to the same LLM completion bias it tries to prevent. The issue confirms this doesn't happen reliably. | DD-2 |
| Q3 | Are there any existing server-side mechanisms in the MCP SDK that could be leveraged for checkpoint gates? | Resolved | No. `McpServer` has no middleware, interceptor, or hook patterns. Tool handlers are direct callbacks. Server-side enforcement would require a new validation tool, handler wrapping, or stateful server changes. | DD-3 |
| Q4 | How are non-blocking checkpoints (`blocking: false`) handled differently from blocking ones? | Resolved | Non-blocking checkpoints can be auto-resolved by the worker — presented as informational, then worker proceeds. Only blocking checkpoints require yield. Orchestrator validation should only check `checkpoints_responded` for blocking checkpoints. | DD-4 |
| Q5 | What is the complete list of required blocking checkpoints across work-package activities? | Resolved | 16 blocking, 14 non-blocking across 14 activities. 10 have prerequisites. Highest risk: start-work-package (7 blocking with prerequisites), implement (3 blocking), post-impl-review (2 blocking). | DD-5 |
| Q6 | Does `evaluateCondition()` apply to prerequisite evaluation? | Resolved | No — it operates on structured `Condition` objects. Prerequisites are strings. Migration to `ConditionSchema` is feasible (most prerequisites are simple variable checks) but requires updating all TOON activity files. | DD-6 |

## Initial Deep-Dive — 2026-03-12

### DD-1: Prerequisite-Checkpoint Interaction

The `prerequisite` field on `CheckpointSchema` is `z.string().optional()` — a free-text description, not a structured condition. Examples from the codebase:

- `"Only present when on_feature_branch is true"` (start-work-package: branch-check)
- `"Only present when needs_issue_creation is true"` (start-work-package: platform-selection, issue-type-selection, issue-review)
- `"Only present when has_open_questions is true. If all open questions were resolved..."` (codebase-comprehension: comprehension-sufficient)
- `"Repeats for each entry in flagged_block_indices"` (post-impl-review: block-interview)

The execute-activity skill instructs: "If a checkpoint has a prerequisite field, evaluate it against current state variables. If the prerequisite is not met, skip the checkpoint entirely — do not yield." This means a checkpoint with `required: true, blocking: true` might correctly be skipped if its prerequisite condition is false.

**Implication for orchestrator validation**: When validating `checkpoints_responded` against required blocking checkpoints, the orchestrator must account for prerequisites. A checkpoint whose prerequisite is not met should not be counted as "missing." But since prerequisites are strings, the orchestrator cannot programmatically determine this. Three resolution paths:

1. **Worker reports applicable checkpoints**: The worker includes a `checkpoints_applicable` field in its result, listing which blocking checkpoints had met prerequisites.
2. **Structured prerequisite migration**: Convert prerequisite strings to `ConditionSchema` objects. The orchestrator can then evaluate prerequisites using `evaluateCondition()`.
3. **Prerequisite-aware validation heuristic**: The orchestrator parses the prerequisite strings using pattern matching (most follow the "Only present when {variable} is {value}" pattern).

Path 2 is the most robust long-term solution. Path 1 is the most pragmatic for immediate implementation (it adds information to the existing worker result format without requiring TOON file changes).

### DD-2: Orchestrator Validation in Practice

The orchestrate-workflow skill's `process-result` step 4 states:

> "VALIDATE COMPLETION: Compare the worker's steps_completed against the activity definition's required steps, and checkpoints_responded against all required blocking checkpoints. If any required step or required blocking checkpoint is missing, do NOT accept the result — resume the worker with instructions to complete the remaining steps/checkpoints."

This is comprehensive validation logic, but it exists only as a prompt instruction to the orchestrator LLM. The orchestrator itself is an LLM agent subject to the same behavioral patterns as the worker:

- **Completion bias**: The orchestrator may accept `activity_complete` and proceed to transitions without performing the validation cross-reference.
- **Context overload**: By the time the orchestrator processes the worker's result, the activity definition (loaded during dispatch) may be far back in context, making the cross-reference harder to perform.
- **Optimistic assumption**: The orchestrator may trust the worker's self-reported result without independent verification.

The validation described is necessary but not sufficient — it needs to be either (a) enforced in server-side code rather than prompt instructions, or (b) structurally simplified so the orchestrator has less opportunity to skip it.

### DD-3: MCP SDK Capabilities

Examined `McpServer` type definition (`@modelcontextprotocol/sdk` v1.25.2). The class provides:

- `tool()` / `registerTool()` — Direct callback registration, no middleware chain
- `resource()` / `registerResource()` — Direct callback registration
- `prompt()` / `registerPrompt()` — Direct callback registration
- `server` property — Access to underlying `Server` instance
- No `use()`, `middleware()`, `before()`, `after()`, `intercept()`, or similar patterns

The underlying `Server` class exposes request handler registration but no interceptor chain. The `withAuditLog()` wrapper in the codebase is a manual workaround — a function that wraps each handler. This same pattern could be used to add validation logic to specific tools.

**Viable server-side approaches**:
1. **New validation tool**: Add `validate_activity_completion({ workflow_id, activity_id, checkpoints_responded, steps_completed })` that returns pass/fail.
2. **Handler wrapping**: Wrap the `get_workflow_activity` handler to include checkpoint metadata (list of required blocking checkpoints) in its response, making it trivial for the orchestrator to cross-reference.
3. **Stateful extension**: Add session state to the server (checkpoint tracking per workflow execution), but this breaks the stateless architecture.

### DD-4: Blocking vs Non-Blocking Checkpoint Handling

The distinction is encoded in two places:

1. **Activity TOON files**: `blocking: false` with `defaultOption` and `autoAdvanceMs: 30000` for non-blocking checkpoints.
2. **Execute-activity skill rule**: "All blocking checkpoints MUST cause execution to yield. NEVER auto-resolve a blocking checkpoint."

Non-blocking checkpoints (`blocking: false`) are used for:
- Informational confirmations ("Confirming in 30s unless you intervene")
- Low-stakes decisions where auto-advance is acceptable (research findings, analysis confirmation, review findings)

Blocking checkpoints (`blocking: true` or default) are used for:
- User decisions that materially affect workflow behavior (issue creation, branch selection, implementation confirmation)
- Points where user input is required (stakeholder response, review outcome, model switching)

The worker is expected to present non-blocking checkpoints as informational messages and proceed after the auto-advance period, without yielding. Only blocking checkpoints should appear in `checkpoints_responded`. This means orchestrator validation should filter the activity's checkpoint list to only `blocking: true` (or default, since `blocking` defaults to `true` in CheckpointSchema) before comparing.

### DD-5: Blocking Checkpoint Inventory

**Complete blocking checkpoint inventory for work-package workflow:**

| Activity | Checkpoint ID | Has Prerequisite |
|----------|--------------|-----------------|
| start-work-package | issue-verification | No |
| start-work-package | branch-check | Yes: `on_feature_branch == true` |
| start-work-package | pr-check | Yes: `pr_exists == true` |
| start-work-package | platform-selection | Yes: `needs_issue_creation == true` |
| start-work-package | jira-project-selection | Yes: `issue_platform == jira` |
| start-work-package | issue-type-selection | Yes: `needs_issue_creation == true` |
| start-work-package | pr-creation | Yes: `issue_cancelled == false` |
| design-philosophy | classification-and-path | No |
| requirements-elicitation | stakeholder-transcript | No |
| plan-prepare | assumptions-log-final | No |
| assumptions-review | stakeholder-response | Yes: `has_open_assumptions == true` |
| assumptions-review | feedback-triage | Yes: `has_stakeholder_comment == true` |
| implement | switch-model-pre-impl | No |
| implement | confirm-implementation | No |
| implement | switch-model-post-impl | No |
| post-impl-review | file-index-table | No |
| post-impl-review | block-interview | Yes: iterates over `flagged_block_indices` |
| submit-for-review | review-received | No |
| submit-for-review | review-outcome | No |

**Totals**: 19 blocking checkpoints across 8 activities. Of these, 9 have prerequisites and may legitimately be skipped. 10 are unconditional (always required when the activity executes).

**Highest-risk activities for bypass** (most blocking checkpoints per activity):
1. `start-work-package`: 7 blocking checkpoints (complex conditional logic)
2. `implement`: 3 blocking checkpoints (high step count increases completion bias)
3. `post-impl-review`: 2 blocking checkpoints (interactive user review)
4. `submit-for-review`: 2 blocking checkpoints (decision-critical)

### DD-6: evaluateCondition() Applicability

The `evaluateCondition()` function in `condition.schema.ts` handles structured `Condition` objects with type discriminant:

```typescript
type Condition =
  | { type: 'simple'; variable: string; operator: ComparisonOperator; value?: ... }
  | { type: 'and'; conditions: Condition[]; }
  | { type: 'or'; conditions: Condition[]; }
  | { type: 'not'; condition: Condition; };
```

Most existing checkpoint prerequisites follow a simple pattern: "Only present when `{variable}` is `{value}`". These map directly to `SimpleCondition`:

```typescript
{ type: "simple", variable: "on_feature_branch", operator: "==", value: true }
```

Migration feasibility:
- **8 of 10 prerequisites** follow the simple `variable == value` pattern — direct translation.
- **1 prerequisite** (`block-interview`: "Repeats for each entry in flagged_block_indices") describes iteration behavior, not a condition — this would need a different representation.
- **1 prerequisite** (`comprehension-sufficient`) contains a complex explanation — the condition portion could be extracted.

The migration would require updating all TOON activity files with prerequisites, changing `prerequisite: "..."` to `prerequisite: { type: "simple", variable: "...", operator: "==", value: ... }`. This is a schema-compatible change — `CheckpointSchema.prerequisite` would change from `z.string().optional()` to `ConditionSchema.optional()`.

### Portfolio Lens Analysis

#### Pedagogy Lens

The core pattern transfer in this codebase is **trust-based delegation**: the system instructs an agent (via prompt) and trusts its output. This pattern originates in simple LLM tool calling where a single tool call produces a single result. When transferred to multi-step protocol adherence with mandatory yield points, it creates a silent problem: the system appears functional (the LLM usually follows instructions) but fails unpredictably when completion bias overrides the yield instruction.

The transferred assumption is: *"Sufficiently clear instructions produce compliant behavior."* This is the pedagogy law at work — the constraint of LLM completion bias gets transferred as an assumption that better prompting can overcome it. In reality, no prompt instruction can structurally guarantee that an LLM will yield mid-generation. The instruction is fighting the model's fundamental training objective (complete the response).

The invisible transferred decision that fails first and is slowest to discover: **choosing prompt-level enforcement over structural enforcement for checkpoint handling.** It fails first because activities with many steps and checkpoints increase the probability of completion bias overriding yield instructions. It is slowest to discover because: (a) it works most of the time, creating false confidence, (b) when it fails, the orchestrator silently accepts the result (also due to prompt-level validation), and (c) the user sees the workflow "complete" without realizing they missed decision points.

#### Rejected-Paths Lens

Three design paths were implicitly rejected:

1. **Server-side state tracking**: Rejected in favor of a stateless server. If the server tracked which checkpoints had been responded to per workflow execution, it could refuse to serve certain tools (or return validation errors) until all required checkpoints are satisfied. This would prevent the problem but creates: session management complexity, persistence requirements, cleanup logic for abandoned workflows, and breaks the clean separation between data layer (server) and execution layer (agents).

2. **Activity decomposition**: Instead of activities with 7-13 steps and multiple checkpoints, each checkpoint could be its own micro-activity. The worker would naturally yield after completing a micro-activity (since that's what `activity_complete` means), and the orchestrator would dispatch the next one. This eliminates the "multiple yield points within one dispatch" problem. Rejected because: it fragments workflow definitions into many small activities, making TOON files harder to author and maintain, and increases orchestrator overhead (more transitions, more dispatches).

3. **Structured prerequisite conditions**: Using `ConditionSchema` for checkpoint prerequisites instead of free-text strings. This would allow machine evaluation of prerequisites, enabling the orchestrator to programmatically determine which checkpoints are applicable. Rejected in favor of human-readable strings. The visible problem this avoids: verbose condition syntax in TOON files. The invisible problem it creates: the orchestrator cannot validate checkpoint coverage without parsing natural language.

**Cross-lens synthesis**: Both lenses converge on the same structural gap: the system relies on LLM behavioral compliance for a guarantee that requires structural enforcement. The pedagogy lens reveals this as a transferred assumption from simpler tool-calling patterns. The rejected-paths lens reveals that the alternatives (state tracking, decomposition, structured conditions) were avoided for simplicity — but that simplicity has a cost that manifests as the checkpoint enforcement problem.

## Validation Surface Analysis (Second Pass — 2026-03-12)

This section identifies the specific code touch points relevant to implementing checkpoint enforcement, verified against all 29 source files.

### Enforcement Chain Gaps

The enforcement chain for checkpoint compliance has three layers, each with a specific gap:

1. **Server layer** (`src/tools/workflow-tools.ts`): The `get_workflow_activity` tool returns the full activity definition including checkpoints, but provides no validation or summary of which checkpoints are blocking. There is no `validate_activity_completion` tool. The server has no session state and no middleware hooks.

2. **Skill layer** (`workflows/meta/skills/`):
   - `04-orchestrate-workflow.toon` (v2.0.0): `process-result` step 4 describes validation in prose but the orchestrator LLM has no structural mechanism to perform it. The validation instruction competes with 5 other `process-result` steps and 8 protocol phases for context budget.
   - `05-execute-activity.toon` (v2.0.0): `yield-checkpoint` instructions are clear ("NEVER auto-resolve a blocking checkpoint") but the `report-completion` step does not require the worker to declare which blocking checkpoints were applicable and yielded at.

3. **Schema layer** (`src/schema/`): The data model supports enforcement — `CheckpointSchema` has `required`/`blocking` flags, `WorkflowStateSchema` has `checkpointResponses` — but no code connects these for validation. The `evaluateCondition()` function in `condition.schema.ts` is unused for prerequisite evaluation because prerequisites are strings, not `Condition` objects.

### Tool Registration Pattern (Implementation Reference)

Tool registration in `server.ts` follows this pattern:
```
registerWorkflowTools(server, config) → server.tool(name, description, zodSchema, withAuditLog(name, handler))
```

The `withAuditLog` wrapper (in `logging.ts`) is a higher-order function that wraps each handler for audit logging. This same pattern can be used to add pre/post-validation wrappers without modifying the MCP SDK. A new tool can be registered alongside existing ones with no infrastructure changes.

### Existing Helper Functions (Implementation Reference)

`workflow-loader.ts` exports reusable helpers:
- `getActivity(workflow, activityId)` → returns `Activity | undefined` — provides access to checkpoints
- `getCheckpoint(workflow, activityId, checkpointId)` → returns `Checkpoint | undefined`
- `getValidTransitions(workflow, fromActivityId)` → returns `string[]`
- `validateTransition(workflow, from, to)` → returns `{ valid, reason? }`

These can serve as building blocks for a `getBlockingCheckpoints()` helper without new type definitions (the `Checkpoint` type already has `required`, `blocking`, and `prerequisite` fields).

### Skill Schema as Behavioral Contract

`SkillSchema` (in `skill.schema.ts`) defines a behavioral contract with three enforcement-relevant components:
- `protocol`: Step-by-step instructions (keyed phases, each with ordered bullets) — this is where yield instructions live
- `rules`: Name-value pairs (e.g., `checkpoint-yield: "All blocking checkpoints MUST cause execution to yield"`) — these are behavioral constraints
- `output`: Structured result definitions with named components — this defines what the worker reports back

The skill's `output` definitions for `execute-activity` include both `activity-complete` and `checkpoint-pending` result types with specific component lists. However, these are descriptive, not enforced — the worker can return any shape. Adding a required `blocking_checkpoints_applicable` field to the `activity-complete` output definition would signal to the worker (via the skill contract) that it must enumerate applicable blocking checkpoints in its result.

## Tool Naming and Session Surface Analysis (Third Pass — 2026-03-24)

> **Work package**: [#59 Rename MCP Tools](../planning/2026-03-24-rename-mcp-tools/README.md)
> **Focus**: Entry-point tool naming (`get_activities`, `get_rules`), activity index builder, session management gap, cross-cutting reference inventory

### Entry-Point Tool Architecture

The server exposes 17 MCP tools across three registration modules. Two are designated "entry points" for agent bootstrap:

1. **`get_activities`** (`resource-tools.ts:17-30`): Calls `readActivityIndex()` which dynamically builds an `ActivityIndex` from all activity TOON files across all workflows. Returns:
   ```
   ActivityIndex {
     description: string        // "Match user goal to an activity..."
     usage: string              // "Call the tool in next_action first (get_rules)..."
     next_action: { tool: 'get_rules', parameters: {} }
     activities: ActivityIndexEntry[]   // id, workflowId, problem, primary_skill, next_action
     quick_match: Record<string, string>  // pattern → activityId
   }
   ```
   The `next_action` field at the index level hardcodes `get_rules` as the follow-up tool. Each activity entry also has a `next_action` pointing to `get_skill`.

2. **`get_rules`** (`resource-tools.ts:45-54`): Calls `readRules()` which reads `meta/rules.toon`. Returns:
   ```
   Rules {
     id: string, version: string, title: string, description: string,
     precedence: string, sections: RulesSection[]
   }
   ```
   Pure data return — no session context, no correlation identifier.

### Activity Index Builder Internals

`readActivityIndex()` in `activity-loader.ts:229-283` builds the index dynamically:
- Calls `listActivities()` to discover all `.toon` files across all workflow directories
- For each activity, calls `readActivity()` to load and validate via Zod
- Extracts `recognition` patterns into `quick_match` (lowercased pattern → activity ID)
- Extracts `problem` field (or falls back to `description` then `name`) into activity entries
- Hardcodes `next_action: { tool: 'get_rules', parameters: {} }` at the index level (line 274)

The hardcoded `get_rules` reference is the only place in the codebase where one tool's response directs agents to another tool by name at the data level (as opposed to documentation/skill files).

### Session Management Gap

The server is stateless by design (see Design Rationale above). No tool accepts or produces a session identifier:

| Existing Pattern | Purpose | Session-like? |
|-----------------|---------|---------------|
| `save_state` / `restore_state` | Cross-session resumption via `planning_folder_path` | No — these save/restore full workflow state to disk for later sessions, not intra-session correlation |
| `generateSaveId()` | Produces timestamp-based IDs (`state-2026-03-24T...`) | No — tied to state persistence, not session tracking |
| `withAuditLog()` | Wraps every tool handler for structured logging | Closest candidate — could log a session ID if one were provided, but currently logs only tool name and duration |

Adding session management would be the server's first stateful feature. The `start_session` tool would need to either: (a) generate a token and return it without storing anything server-side (stateless token), or (b) maintain an in-memory session registry. Option (a) preserves the stateless architecture.

### Test Coverage

| Tool | Test Exists | Test Location |
|------|-------------|---------------|
| `get_activities` | Yes | `tests/mcp-server.test.ts:170-181` — validates index structure (description, activities[], quick_match) |
| `get_rules` | No | No test coverage |
| `discover_resources` | No | No test coverage |

The `get_activities` test asserts on the `ActivityIndex` structure but not on `next_action.tool` value. `start_session` will need both a dedicated test and assertions on session token presence.

### Cross-Cutting Reference Inventory

References to `get_activities` and `get_rules` span three git contexts:

**Main branch (source + docs): 10 files, ~15 references**

| File | `get_activities` refs | `get_rules` refs |
|------|----------------------|-----------------|
| `src/tools/resource-tools.ts` | 4 (tool name, audit tag, description, discover_resources output) | 3 (tool name, description, audit tag) |
| `src/loaders/activity-loader.ts` | 0 | 2 (usage string, next_action.tool value) |
| `src/server.ts` | 1 (log list) | 1 (log list) |
| `tests/mcp-server.test.ts` | 2 (describe block, tool call) | 0 |
| `README.md` | 1 | 1 |
| `SETUP.md` | 0 | 1 |
| `docs/api-reference.md` | 2 | 1 |
| `docs/ide-setup.md` | 2 | 3 |
| `schemas/README.md` | 1 | 0 |
| `.cursor/rules/workflow-server.mdc` | 0 | 1 |

**Workflows worktree (currently on `prism-pipeline-modes-v2`): 9 files, 17 references**

| File | Tool | Count |
|------|------|-------|
| `meta/skills/00-activity-resolution.toon` | `get_activities` | 4 |
| `meta/workflow.toon` | `get_activities` | 1 |
| `meta/skills/04-orchestrate-workflow.toon` | `get_rules` | 1 |
| `meta/skills/05-execute-activity.toon` | `get_rules` | 2 |
| `substrate-node-security-audit/skills/02-execute-sub-agent.toon` | `get_rules` | 2 |
| `substrate-node-security-audit/skills/04-dispatch-sub-agents.toon` | `get_rules` | 1 |
| `cicd-pipeline-security-audit/skills/04-dispatch-scanners.toon` | `get_rules` | 4 |
| `cicd-pipeline-security-audit/skills/08-execute-sub-agent.toon` | `get_rules` | 2 |
| `cicd-pipeline-security-audit/workflow.toon` | `get_rules` | 1 |

**Total: 19 files, ~32 references** across two git contexts.

### Open Questions (Issue #59)

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | What is the complete response shape of `get_activities`? | Resolved | `ActivityIndex` with `description`, `usage`, `next_action: { tool: 'get_rules' }`, `activities[]`, `quick_match{}` | Tool Architecture |
| Q2 | What is the complete response shape of `get_rules`? | Resolved | `Rules` with `id`, `version`, `title`, `description`, `precedence`, `sections[]` — pure data, no session context | Tool Architecture |
| Q3 | Does any existing tool accept or produce a session-like identifier? | Resolved | No. `save_state`/`restore_state` use planning_folder_path for cross-session resumption, not intra-session correlation. Server is fully stateless. | Session Management Gap |
| Q4 | Will changing `next_action.tool` from `get_rules` to `start_session` require schema changes? | Resolved | No — `ActivityIndex.next_action` uses `{ tool: string; parameters: Record<string, unknown> }`. Changing the string value is sufficient. | Index Builder Internals |
| Q5 | What test coverage exists for these tools? | Resolved | `get_activities` has one test (structure validation). `get_rules` has none. New tests needed for both renamed tools. | Test Coverage |
| Q6 | Does `discover_resources` need updating? | Resolved | Yes — line 155 outputs `tool: 'get_activities'` in the discovery payload. Must change to `match_goal`. | Reference Inventory |
| Q7 | How does the activity-resolution skill reference these tools? | Resolved | `00-activity-resolution.toon` references `get_activities` in bootstrap, tools section, flow, and error recovery (4 occurrences). All need updating. | Reference Inventory |

All questions resolved through code analysis. No unresolved questions remain.

### Initial Deep-Dive — DD-7: Tool Bootstrap Flow

The agent bootstrap sequence is defined across three layers:

1. **IDE rules / AGENTS.md**: Instruct agents to call `get_rules` as the first tool. These are consumer-facing configuration files.
2. **Activity index (`get_activities` response)**: The `usage` field says "Call the tool in next_action first (get_rules)" and `next_action.tool` is `get_rules`. This programmatically directs agents from goal-matching to rules-loading.
3. **Workflow skills**: `00-activity-resolution.toon` defines the canonical flow as `get_activities → get_activity → get_skill`. The `04-orchestrate-workflow.toon` and `05-execute-activity.toon` skills instruct workers to "call get_rules() to load agent behavioral guidelines."

Renaming changes the flow to: `match_goal → start_session → get_workflow_activity → get_skill`. The `start_session` response would need to include both rules and a session token. The `match_goal` response would update `next_action.tool` from `get_rules` to `start_session`.

The activity-resolution skill's `flow` section defines a 5-step sequence. Step 1 references `get_activities` by name. The `tools` section has a full entry for `get_activities` with `when`, `params`, `returns`, `preserve`, and `usage` fields. These are all text content in TOON files — purely mechanical find-and-replace.

### Portfolio Lens Analysis (Issue #59)

#### Pedagogy Lens

The naming pattern `get_activities` was inherited from a prior rename (`get_intents` → `get_activities`, documented in `.engineering/history/2026-01-22`). The original name `get_intents` more closely matched the tool's purpose (matching user intent to workflows), but was renamed when the domain model shifted from "intents" to "activities." The constraint transferred was: *"Tool names should mirror the domain model's vocabulary."* This is generally sound, but it fails when a domain term is overloaded — `activity` means both "a workflow phase" and "an entry in the goal-matching index." The transferred assumption is that vocabulary alignment is always beneficial, but here it creates ambiguity because the same word names both a data-access tool and a domain concept.

The invisible transferred decision: naming the goal-matching tool after the data it returns (activities) rather than the action it performs (matching goals). When `get_intents` was renamed, the focus was on vocabulary consistency, not on distinguishing the tool's function from the domain concept.

#### Rejected-Paths Lens

One design path was implicitly rejected when `get_rules` was created as a standalone tool:

**Combined bootstrap tool**: A single tool that returns both the goal-matching index and the rules in one call. This would have reduced the bootstrap sequence from two calls to one. Rejected because: the separation keeps each tool focused on one concern, and not all consumers need both (an agent that already knows which activity to run might call `get_rules` without `get_activities`). The visible problem avoided: coupling unrelated data. The invisible problem created: no natural point to establish a session, since neither tool owns the "session start" concern.

**Cross-lens synthesis**: Both lenses converge on the same naming tension. The pedagogy lens reveals that vocabulary alignment transferred a naming problem from the domain model. The rejected-paths lens reveals that separating rules from the bootstrap flow removed the natural session-establishment point. The `start_session` rename addresses both: it gives the bootstrap tool a function-oriented name (starting a session) rather than a data-oriented name (getting rules), and it creates a natural point for session establishment.

## Execution Trace Surface — 2026-03-25

### Open Questions (Issue #63)

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Does the codebase already have trace/history infrastructure that can be leveraged? | Resolved | Yes — `state.schema.ts` defines `HistoryEventTypeSchema` (21 event types), `HistoryEntrySchema`, and `addHistoryEvent()`. `WorkflowState.history` is an array of history entries. However, these are agent-side constructs — the server never calls `addHistoryEvent()`. | DD-8 |
| Q2 | Are tool calls that lack a session token (help, list_workflows, health_check, start_session) traceable? | Resolved | `help`, `list_workflows`, `health_check` don't receive session tokens. `start_session` creates the token. These exempt tools (listed in the help response's `session_protocol.exempt_tools`) cannot be associated with a session for tracing. Only post-session tools are traceable. | DD-8 |
| Q3 | Can the session token's `ts` field (second-precision) reliably identify a session for trace keying? | Resolved | For the current single-process stdio architecture: yes, collisions require same workflow started in the same second. But second-precision is fragile — a dedicated session ID (UUID) in the token would be more robust and trivial to add. | DD-8 |
| Q4 | What data is already available in `withAuditLog` that could feed a trace? | Resolved | Tool name, full parameters object, result status (success/error), duration_ms, error message. Parameters include `session_token`, `workflow_id`, `activity_id`, `step_manifest`, `transition_condition` — rich workflow-semantic data. | DD-8 |
| Q5 | Does the server have any in-process state that persists across tool calls? | Resolved | Only `config.schemaPreamble` (computed once at startup). No Maps, no caches, no session stores. Adding in-process trace storage (e.g., `Map<string, TraceEvent[]>`) would be the first mutable runtime state in the server. | DD-8 |

### DD-8: Execution Trace Infrastructure Analysis

#### Existing History Schema (Agent-Side)

`src/schema/state.schema.ts` defines a comprehensive history event system designed for agent-side state management:

```typescript
HistoryEventTypeSchema = z.enum([
  'workflow_started', 'workflow_completed', 'workflow_aborted',
  'workflow_triggered', 'workflow_returned', 'workflow_suspended',
  'activity_entered', 'activity_exited', 'activity_skipped',
  'step_started', 'step_completed',
  'checkpoint_reached', 'checkpoint_response',
  'decision_reached', 'decision_branch_taken',
  'loop_started', 'loop_iteration', 'loop_completed', 'loop_break',
  'variable_set', 'error',
]);
```

`HistoryEntrySchema` includes: `timestamp` (ISO datetime), `type` (from above), `activity`, `step`, `checkpoint`, `decision`, `loop`, `data` (arbitrary), `error` (message + code).

`WorkflowState.history` is `z.array(HistoryEntrySchema).default([])`.

`addHistoryEvent()` creates an immutable state update appending a new entry.

`createInitialState()` seeds history with a `workflow_started` event.

**Critical gap**: The server never calls `addHistoryEvent()`. It is exported from `types/state.ts` but only consumed in tests (`state-persistence.test.ts`). The history system is designed for the orchestrator agent to maintain in its `WorkflowState` object and persist via `save_state`. The server is a passive data store for agent-managed state.

#### Server-Side Trace Interception Points

The `withAuditLog` wrapper in `src/logging.ts` is the universal interception point. It wraps all 12 tool handlers:

| Module | Tools | Count |
|--------|-------|-------|
| `workflow-tools.ts` | help, list_workflows, get_workflow, get_activity, get_checkpoint, next_activity, health_check | 7 |
| `resource-tools.ts` | start_session, get_skills, get_skill | 3 |
| `state-tools.ts` | save_state, restore_state | 2 |

The wrapper captures: tool name, full parameters, success/error status, duration. Parameters include workflow-semantic fields (`workflow_id`, `activity_id`, `step_manifest`, `transition_condition`, `checkpoint_id`, `skill_id`).

Current implementation logs to stderr and returns — no accumulation:

```typescript
export function withAuditLog<T, R>(toolName: string, handler: (params: T) => Promise<R>) {
  return async (params: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await handler(params);
      logAuditEvent({ timestamp: new Date().toISOString(), tool: toolName, parameters: params, result: 'success', duration_ms: Date.now() - start });
      return result;
    } catch (error) {
      logAuditEvent({ ... result: 'error', error_message: ... });
      throw error;
    }
  };
}
```

#### Session Identity

Session tokens encode `SessionPayload { wf, act, skill, cond, v, seq, ts }`. The `ts` field is `Math.floor(Date.now() / 1000)` — Unix seconds. Combined with `wf`, this identifies a session but with second-precision collision risk.

Session-exempt tools (`help`, `list_workflows`, `health_check`, `start_session`) cannot be traced to a session because they either don't accept a token or create one.

`start_session` is the natural trace-initialization point — it's when a session begins. The returned token's `ts` (or a new session ID field) can key the trace.

#### In-Process State Feasibility

The server has zero mutable runtime state today. Adding a `Map<string, TraceEvent[]>` would be the first. Given the stdio transport (single process, single connection, single agent), this is architecturally simple:

- Map lives in a module-level variable (or on ServerConfig)
- `start_session` initializes a trace entry
- `withAuditLog` (or a parallel `withTrace`) appends events
- A new `get_trace` tool reads the accumulated events
- Traces survive for the server's process lifetime (same as the session)

#### Design Decision: Server-Side vs Agent-Side Tracing

Two approaches are available:

| Approach | How It Works | Pros | Cons |
|----------|-------------|------|------|
| **Server-side** (new) | Server accumulates events in-process via `withAuditLog` augmentation | Automatic — no agent cooperation needed; captures all tool calls; traces even when agent doesn't maintain state | Breaks the purely-stateless server architecture; traces don't include agent-side details (step execution within activities) |
| **Agent-side** (existing schema) | Agent uses `addHistoryEvent()` on its `WorkflowState` and persists via `save_state` | Schema already exists; richer detail (step-level, checkpoint resolution, variable changes); no server changes | Requires agent discipline; traces lost if agent doesn't call `save_state`; only as complete as the agent makes them |

The issue's acceptance criteria favor server-side: "Every tool call in a workflow session is captured in the trace" and "Incomplete or failed executions still produce partial traces up to the point of failure." Agent-side tracing cannot guarantee either — if the agent crashes or doesn't maintain state, no trace exists.

A hybrid approach is possible: server-side captures tool-call-level events automatically, while the existing agent-side history schema captures richer semantic events (step completions, variable changes). The two can be correlated by session ID.

---
*This artifact is part of a persistent knowledge base. It is augmented across successive work packages to build cumulative codebase understanding.*
