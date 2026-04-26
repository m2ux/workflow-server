# Orchestration — Comprehension Artifact

> **Last updated**: 2026-04-26 (fifth pass — current source alignment)
> **Coverage**: Workflow server architecture, orchestrator/worker execution model, checkpoint enforcement chain, schema infrastructure, validation surface analysis, session management, execution trace surface
> **Related artifacts**: [workflow-server.md](workflow-server.md), [utils-layer.md](utils-layer.md), [zod-schemas.md](zod-schemas.md)

## Architecture Overview

### Project Structure

The workflow server is a TypeScript/Node.js MCP server (`@m2ux/workflow-server` v0.1.0). The source is organized into six functional layers:

```
src/
├── index.ts              # Entry point: config → server → transport
├── server.ts             # MCP server: tool + resource + TraceStore registration
├── config.ts             # ServerConfig: workflowDir, schemasDir, schemaPreamble, traceStore
├── errors.ts             # Domain error types (WorkflowNotFoundError, etc.)
├── result.ts             # Result<T, E> monad: ok(), err(), unwrap()
├── logging.ts            # Structured JSON logging + audit event wrapper
├── trace.ts              # TraceStore, TraceEvent, trace token encode/decode
├── tools/
│   ├── workflow-tools.ts # 11 tools: discover, list_workflows, get_workflow, next_activity,
│   │                     #          get_activity, yield_checkpoint, resume_checkpoint,
│   │                     #          present_checkpoint, respond_checkpoint, get_trace,
│   │                     #          health_check, get_workflow_status
│   └── resource-tools.ts # 4 tools: start_session, get_skills, get_skill, get_resource
├── loaders/              # Data access layer (filesystem → validated objects)
│   ├── workflow-loader.ts  # Workflow + activity loading from TOON files
│   ├── activity-loader.ts  # Activity discovery, index building, cross-workflow search
│   ├── skill-loader.ts     # Skill resolution (workflow-specific → universal fallback, prefixed skills)
│   ├── resource-loader.ts  # Resource file discovery (TOON + markdown), frontmatter parsing
│   ├── rules-loader.ts     # Global rules from meta/rules.toon
│   ├── schema-loader.ts    # JSON schema loading (5 schemas)
│   ├── schema-preamble.ts  # Schema preamble builder (cached at startup)
│   └── filename-utils.ts   # Canonical ID parsing (strips NN- prefix)
├── schema/               # Zod schema definitions → runtime validation
│   ├── common.ts           # SemanticVersionSchema (single source of truth)
│   ├── workflow.schema.ts  # WorkflowSchema: variables, modes, activities, skills
│   ├── activity.schema.ts  # ActivitySchema: steps, checkpoints, decisions, loops
│   ├── condition.schema.ts # ConditionSchema + evaluateCondition()
│   ├── skill.schema.ts     # SkillSchema: protocol, tools, rules, I/O, operations
│   ├── state.schema.ts     # WorkflowStateSchema: history, checkpoint responses, nested state
│   ├── resource.schema.ts  # ResourceSchema: minimal resource type
│   └── rules.schema.ts     # RulesSchema: global agent behavioral guidelines
├── types/                # Re-export layer (types + schemas from schema/)
├── utils/                # Foundational services
│   ├── toon.ts           # TOON decoder/encoder wrapper
│   ├── session.ts        # Session token lifecycle: create, decode, advance, decodePayloadOnly, assertCheckpointsResolved
│   ├── validation.ts     # Workflow consistency checks: transitions, manifests, conditions, skill association
│   ├── crypto.ts         # AES-256-GCM encryption, HMAC-SHA256 signing, server key management
│   └── index.ts          # Barrel exports
└── resources/
    └── schema-resources.ts # MCP resource: workflow-server://schemas/{id}
```

Workflow data lives in a `workflows/` worktree (orphan branch) with this layout:

```
workflows/
├── meta/                            # Universal skills, activities, rules
│   ├── workflow.toon
│   ├── rules.toon                   # Global agent behavioral guidelines
│   ├── skills/                      # Universal skills
│   ├── activities/                  # Meta workflow activities
│   └── resources/
├── work-package/                    # Primary workflow
│   ├── workflow.toon
│   ├── activities/                  # Activity TOON files
│   ├── skills/                      # Workflow-specific skills
│   └── resources/                   # Resources (templates, guides)
└── ...other workflows
```

### Module Map

| Module | Responsibility | Key Dependencies |
|--------|---------------|-----------------|
| `server.ts` | MCP server creation and tool/resource registration | `@modelcontextprotocol/sdk`, tools, resources, TraceStore |
| `tools/workflow-tools.ts` | Workflow navigation and checkpoint tools | loaders/workflow-loader, utils/session, utils/validation, trace |
| `tools/resource-tools.ts` | Session, skill, and resource tools | loaders/workflow-loader, loaders/skill-loader, loaders/resource-loader |
| `loaders/workflow-loader.ts` | Workflow + activity file I/O with TOON decoding and Zod validation | utils/toon, schema/workflow, schema/activity |
| `loaders/activity-loader.ts` | Activity file discovery across workflows, index building | utils/toon, schema/activity |
| `loaders/skill-loader.ts` | Skill resolution: workflow-specific → universal fallback, explicit prefix support | utils/toon, schema/skill |
| `loaders/resource-loader.ts` | Resource file discovery (TOON + markdown), frontmatter parsing | utils/toon, schema/resource |
| `schema/activity.schema.ts` | Zod schema for Activity, including CheckpointSchema | schema/condition |
| `schema/state.schema.ts` | Zod schema for WorkflowState including CheckpointResponseSchema | — |
| `schema/condition.schema.ts` | Condition evaluation engine (evaluateCondition) | — |
| `schema/skill.schema.ts` | Skill schema with operations, inputs, outputs, protocol | schema/common |
| `utils/session.ts` | Session token lifecycle with parent context and checkpoint gating | utils/crypto |
| `trace.ts` | In-memory trace store with cursor-based segment emission | utils/crypto |

### Design Patterns

1. **Stateless Read-Only Server**: The server reads TOON files, validates with Zod, and returns JSON. It holds no persistent workflow state — execution state is in the session token. The only mutable runtime state is the in-memory `TraceStore`.

2. **TOON Configuration Format**: Workflow definitions use TOON (decoded via `@toon-format/toon`), a custom format more concise than JSON/YAML for nested configuration. The `decodeToonRaw()` wrapper returns `unknown` — callers must validate afterward.

3. **Zod Schema Validation**: Every loaded entity (workflow, activity, skill, condition, state, resource, rules) is validated against Zod schemas. Both `parse()` (throws) and `safeParse()` (returns result) patterns are used. Schemas serve double duty: runtime validation and TypeScript type inference via `z.infer<>`.

4. **Result Monad**: Loaders return `Result<T, E>` instead of throwing. Tools unwrap results and throw for MCP-level error responses. This separates error handling (loaders return errors) from error presentation (tools throw for MCP).

5. **Audit Logging Wrapper**: `withAuditLog()` wraps every tool handler to log structured audit events (tool name, parameters, duration, success/error) to stderr as JSON, and also records `TraceEvent`s in the `TraceStore`.

6. **Schema Preamble**: Built once at startup from JSON schema files and cached on `ServerConfig`. Prepended to `get_workflow` responses so consuming agents have schema context without separate requests.

7. **Two-Tier Skill Resolution**: Skills are resolved first in the workflow-specific directory, then via cross-workflow search, then in the universal directory (`meta/skills/`). Explicit prefix syntax (`work-package/manage-git`) routes directly to a specific workflow.

8. **Checkpoint Hard Gate**: `assertCheckpointsResolved(token)` is called in nearly every tool handler. If `token.bcp` is set (active blocking checkpoint), it throws a hard error before the handler runs. Only `present_checkpoint` and `respond_checkpoint` are exempt.

9. **Parent Context Propagation**: `start_session` with `parent_session_token` embeds parent fields (`psid`, `pwf`, `pact`, `pv`) in the child token for trace correlation. The `TraceStore` records events in both parent and child traces.

## Key Abstractions

### Core Types

| Type | Module | Role |
|------|--------|------|
| `Workflow` | workflow.schema.ts | Top-level container: id, version, variables, modes, artifactLocations, skills, activities |
| `Activity` | activity.schema.ts | Unit of work: steps, checkpoints, decisions, loops, transitions, skills reference |
| `Checkpoint` | activity.schema.ts | User decision point: id, name, message, condition, options, defaultOption, autoAdvanceMs |
| `CheckpointOption` | activity.schema.ts | Selectable choice: id, label, description, effect (setVariable, transitionTo, skipActivities) |
| `Step` | activity.schema.ts | Atomic execution unit: id, name, description, skill, checkpoint, required, condition, actions, triggers, skill_args |
| `Skill` | skill.schema.ts | Tool orchestration pattern: protocol, tools, rules, inputs, outputs, operations |
| `Condition` | condition.schema.ts | Boolean evaluation: simple (variable comparison), and, or, not |
| `Transition` | activity.schema.ts | Navigation between activities: target activity ID, condition, isDefault |
| `WorkflowState` | state.schema.ts | Runtime state: current activity, completed activities, checkpoint responses, decision outcomes, variables, history, nested triggeredWorkflows |
| `CheckpointResponse` | state.schema.ts | Record of checkpoint response: optionId, respondedAt, effects |
| `Result<T, E>` | result.ts | Algebraic error handling: `{ success: true, value: T } \| { success: false, error: E }` |
| `SessionPayload` | session.ts | 13-field token: wf, act, skill, cond, v, seq, ts, sid, aid, bcp, psid, pwf, pact, pv |

### Checkpoint Schema (Current)

```typescript
CheckpointSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  condition: ConditionSchema.optional(),
  options: z.array(CheckpointOptionSchema).min(1),
  defaultOption: z.string().optional(),
  autoAdvanceMs: z.number().int().positive().optional(),
});
```

The `condition` field uses structured `ConditionSchema` (not free-text). If the condition evaluates to false, the checkpoint is skipped entirely.

### State Tracking

`WorkflowState.checkpointResponses` uses string keys in format `"activityId-checkpointId"` mapping to `CheckpointResponse` objects. `WorkflowState.triggeredWorkflows` supports nested state via `NestedTriggeredWorkflowRefSchema` with recursive `state` fields.

### Error Handling

Domain-specific error classes extend `Error` with a `code` field. Loaders return `Result<T, DomainError>` for predictable error flow. Tools call `unwrap()` or check `result.success` and throw on failure, converting to MCP error responses.

## Design Rationale

### Stateless Server Architecture

- **Observation**: The server has no persistent session state beyond the in-memory `TraceStore`. All session state is in the HMAC-signed token.
- **Rationale**: Simplicity and separation of concerns. The server provides the "what" (workflow definitions, schemas), while agents handle the "how" (execution, state, enforcement).
- **Trade-offs**: Optimizes for simplicity and testability. The `TraceStore` is the only mutable runtime state and is optional (evicts oldest sessions at capacity).

### Orchestrator/Worker Split

- **Observation**: The workflow defines a two-agent pattern where one agent coordinates and another executes.
- **Rationale**: Separation of coordination concerns (state management, transitions, user interaction) from domain work (code analysis, artifact production).
- **Implementation**: The orchestrator uses the workflow's primary skill (loaded via `get_skills`). The worker loads step skills via `get_skill(step_id)`. Both share the same session token.

### TOON Format for Workflow Definitions

- **Observation**: All workflow definitions use `.toon` files decoded by `@toon-format/toon`.
- **Rationale**: TOON is more concise than JSON for deeply nested configuration. It preserves structured nature while being more human-readable.
- **Trade-offs**: Introduces a dependency on a less-standard format. Requires a dedicated parser.

### Schema Validation Architecture

- **Observation**: Zod schemas validate data at load time, and JSON schemas are provided as a preamble to consuming agents.
- **Rationale**: Dual validation strategy — Zod catches malformed definitions at server startup (fail fast), while JSON schema preambles give agents structural understanding.
- **Trade-offs**: Duplicated schema definitions (Zod + JSON). The preamble adds context window cost.

### Session Token as State Carrier

- **Observation**: All session state (workflow, activity, skill, condition, version, sequence, timestamp, session ID, agent ID, blocking checkpoint, parent context) is encoded in a single HMAC-signed token.
- **Rationale**: No server-side session store needed. Tokens are self-contained and tamper-proof.
- **Trade-offs**: Token size grows with state. Parent context adds 4 fields. Tokens must be passed on every call.

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| Workflow | `WorkflowSchema` + `workflow.toon` | A structured process with ordered activities |
| Activity | `ActivitySchema` + `NN-activity-id.toon` | A phase of work within a workflow |
| Checkpoint | `CheckpointSchema` within ActivitySchema | A user decision point that may block execution |
| Skill | `SkillSchema` + `NN-skill-id.toon` | Tool orchestration guidance for executing an activity |
| Transition | `TransitionSchema` | Conditional navigation between activities |
| Condition | `ConditionSchema` + `evaluateCondition()` | Boolean expression evaluated against state variables |
| Worker | Sub-agent using step-level skills | Executes activity steps, yields at checkpoints |
| Orchestrator | Top-level agent using workflow primary skill | Manages transitions, state, and user interaction |
| TOON | `@toon-format/toon` | Custom structured configuration format |
| MCP | `@modelcontextprotocol/sdk` | Model Context Protocol for AI tool communication |
| Schema Preamble | `buildSchemaPreamble()` | Pre-computed schema context prepended to workflow responses |
| Checkpoint Response | `CheckpointResponseSchema` | Record that a user responded to a checkpoint |
| Variable | `VariableDefinitionSchema` | Named state value tracked across the workflow |
| Mode | `ModeSchema` | Execution variant that modifies standard workflow behavior |
| Artifact Location | `ArtifactLocation` | Named storage location for activity outputs |
| Parent Context | `ParentContext` in session.ts | Links dispatched child workflows to parent session |

### Domain Model

The server implements a hierarchical execution model:

```
Goal (user intent)
 └── Workflow (structured process)
      ├── Variables (state that flows across activities)
      ├── Modes (execution variants)
      ├── Artifact Locations (named storage paths)
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

## Tool Registration Pattern

Tool registration in `server.ts` follows this pattern:
```
registerWorkflowTools(server, config) → server.tool(name, description, zodSchema, withAuditLog(name, handler, traceOpts?))
```

The `withAuditLog` wrapper (in `logging.ts`) is a higher-order function that wraps each handler for audit logging and trace recording. The `traceOpts` parameter controls whether the tool is excluded from the trace (used for `get_trace` and `get_workflow_status` to avoid recursive trace entries).

## Session Management

### Token Fields

| Field | Set By | Used By |
|-------|--------|---------|
| `wf` | `createSessionToken` / `start_session` | All tools (determines workflow) |
| `act` | `next_activity` | `get_activity`, validation |
| `skill` | `get_skill` | Validation |
| `cond` | `next_activity` | Validation |
| `v` | `createSessionToken` | Version drift detection |
| `seq` | `advanceToken` | Sequence tracking |
| `ts` | `advanceToken` | Timing enforcement (checkpoints) |
| `sid` | `createSessionToken` | Trace correlation |
| `aid` | `start_session` | Agent identification in trace |
| `bcp` | `yield_checkpoint` | Checkpoint hard gate |
| `psid` | `start_session` (with parent) | Parent-child trace correlation |
| `pwf` | `start_session` (with parent) | Resume routing |
| `pact` | `start_session` (with parent) | Resume routing |
| `pv` | `start_session` (with parent) | Resume routing |

### Token Adoption on Server Restart

When `start_session` receives a token that fails HMAC verification:
1. **Auto-detect staleness**: Compare token age vs. server uptime. If token predates server startup, skip to re-signing.
2. **Decode payload only**: `decodePayloadOnly()` extracts the payload without HMAC verification.
3. **If payload valid**: Re-sign with current key, return `adopted: true` with warning.
4. **If payload corrupted**: Create fresh session, return `recovered: true` with warning.

## Validation Surface Analysis

### Enforcement Chain

The enforcement chain for checkpoint compliance has three layers:

1. **Server layer** (`src/tools/workflow-tools.ts`): The `next_activity` tool hard-blocks transitions when `bcp` is set. `assertCheckpointsResolved()` gates most other tools.

2. **Skill layer** (`workflows/meta/skills/`): The workflow's primary skill (loaded via `get_skills`) instructs the orchestrator on checkpoint handling.

3. **Schema layer** (`src/schema/`): The data model supports enforcement — `CheckpointSchema` has `condition`, `defaultOption`, `autoAdvanceMs`; `WorkflowStateSchema` has `checkpointResponses`.

### Existing Helper Functions

`workflow-loader.ts` exports reusable helpers:
- `getActivity(workflow, activityId)` → returns `Activity | undefined`
- `getCheckpoint(workflow, activityId, checkpointId)` → returns `Checkpoint | undefined`
- `getValidTransitions(workflow, fromActivityId)` → returns `string[]`
- `getTransitionList(workflow, fromActivityId)` → returns `TransitionEntry[]` with human-readable conditions
- `validateTransition(workflow, from, to)` → returns `{ valid, reason? }`

These serve as building blocks for validation without new type definitions.

### Skill Schema as Behavioral Contract

`SkillSchema` defines a behavioral contract with these enforcement-relevant components:
- `protocol`: Step-by-step instructions (keyed phases, each with ordered bullets)
- `rules`: Named key-value pairs (e.g., `checkpoint-yield: "All blocking checkpoints MUST cause execution to yield"`)
- `output`: Structured result definitions with named components
- `operations`: Named operations with harness-specific implementations

## Execution Trace Surface

### Trace Infrastructure

The `TraceStore` class (`trace.ts`) is an in-memory per-session event accumulator:
- `initSession(sid)` — initializes a new session entry
- `append(sid, event)` — adds a trace event
- `getEvents(sid)` — returns all events for a session
- `getSegmentAndAdvanceCursor(sid)` — returns events since last cursor position and advances cursor
- LRU eviction at `maxSessions` (default 1000)

### Trace Event Fields

| Field | Description |
|-------|-------------|
| `traceId` | Session UUID (`sid`) |
| `spanId` | Unique span ID (random UUID) |
| `name` | Tool name |
| `ts` | Timestamp (Unix seconds) |
| `ms` | Duration (milliseconds) |
| `s` | Status (`ok` or `error`) |
| `wf` | Workflow ID |
| `act` | Activity ID |
| `aid` | Agent ID |
| `err` | Error message (on failure) |
| `vw` | Validation warnings |
| `psid` | Parent session ID |

### Trace Token Packaging

On `next_activity`, the server packages events since the last transition into an HMAC-signed trace token (`createTraceToken`) returned in `_meta.trace_token`. Agents accumulate these and resolve them via `get_trace`.

## Open Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| Q1 | How does the `condition` field on checkpoints interact with validation? | Resolved | `condition` uses structured `ConditionSchema`. Checkpoints with unmet conditions are skipped. The server validates the condition field exists for `condition_not_met` resolution. |
| Q2 | Does the orchestrator skill's validation happen in practice? | Resolved | The server enforces checkpoint gates structurally (`bcp` hard-blocks transitions). Semantic validation (step completeness) is advisory via `step_manifest`. |
| Q3 | Are there server-side mechanisms for checkpoint gates? | Resolved | Yes — `assertCheckpointsResolved()` in tool handlers, plus `bcp` checks in `next_activity` and `yield_checkpoint`. |
| Q4 | How are non-blocking checkpoints handled? | Resolved | Non-blocking checkpoints have `defaultOption` and `autoAdvanceMs`. `respond_checkpoint` with `auto_advance: true` enforces the full timer. |
| Q5 | What is the complete list of required blocking checkpoints? | Resolved | Determined by activity TOON files. The server does not pre-compute this; it validates at yield time. |
| Q6 | Does `evaluateCondition()` apply to checkpoint conditions? | Resolved | Yes — checkpoint `condition` uses `ConditionSchema`, which `evaluateCondition()` can evaluate. |
| Q7 | How does `get_workflow_status` derive completed activities? | Resolved | Scans trace store for `next_activity` events with `s: 'ok'` and collects unique `act` values. |
| Q8 | What is the parent context propagation mechanism? | Resolved | `start_session` with `parent_session_token` embeds `psid`, `pwf`, `pact`, `pv` in child token. Trace events include `psid` for correlation. |

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
