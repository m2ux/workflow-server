# Orchestration — Comprehension Artifact

> **Last updated**: 2026-06-18
> **Coverage**: Workflow server architecture, orchestrator/worker execution model, checkpoint enforcement chain, schema infrastructure, validation surface analysis, session management, execution trace surface
> **Related artifacts**: [workflow-server.md](workflow-server.md), [utils-layer.md](utils-layer.md), [zod-schemas.md](zod-schemas.md)

## Architecture Overview

### Project Structure

The workflow server is a TypeScript/Node.js MCP server (`@m2ux/workflow-server` v0.1.0). The source is organized into six functional layers:

```
src/
├── index.ts              # Entry point: config → server → transport
├── server.ts             # MCP server: tool + resource + TraceStore registration
├── config.ts             # ServerConfig: workflowDir, schemasDir, workspaceDir, server name/version, traceStore
├── errors.ts             # Domain error types (WorkflowNotFoundError, etc.)
├── result.ts             # Result<T, E> monad: ok(), err()
├── logging.ts            # Structured JSON logging + audit event wrapper
├── trace.ts              # TraceStore, TraceEvent, trace token encode/decode
├── tools/
│   ├── workflow-tools.ts # discover, list_workflows, get_workflow, next_activity,
│   │                     #   get_activity, yield_checkpoint, resume_checkpoint,
│   │                     #   present_checkpoint, respond_checkpoint, get_trace,
│   │                     #   health_check, get_workflow_status
│   └── resource-tools.ts # start_session, dispatch_child, get_technique, get_resource
├── loaders/              # Data access layer (filesystem → validated objects)
│   ├── workflow-loader.ts          # Workflow + activity loading from TOON files; transition/checkpoint helpers
│   ├── activity-loader.ts          # Activity discovery, index building, cross-workflow search
│   ├── technique-loader.ts         # Technique resolution + recursive composition (`::` paths, inherited base contract)
│   ├── markdown-technique-loader.ts # Markdown-format technique parsing (protocol/inputs/outputs/rules sections)
│   ├── resource-loader.ts          # Resource file discovery (TOON + markdown), frontmatter parsing, #section anchors
│   ├── core-ops.ts                 # CORE_ORCHESTRATOR_TECHNIQUES / CORE_WORKER_TECHNIQUES baseline ref lists
│   ├── schema-loader.ts            # JSON schema loading (5 schemas: workflow, activity, condition, technique, state)
│   └── filename-utils.ts           # Canonical ID parsing (strips NN- prefix)
├── schema/               # Zod schema definitions → runtime validation
│   ├── common.ts            # SemanticVersionSchema (single source of truth)
│   ├── workflow.schema.ts   # WorkflowSchema: variables, techniques (by audience), rules (by audience), activities
│   ├── activity.schema.ts   # ActivitySchema: ordered kind-tagged steps[], decisions, transitions; StepSchema; Checkpoint interface
│   ├── condition.schema.ts  # ConditionSchema (inlines and/or/not via z.lazy) + evaluateCondition()
│   ├── technique.schema.ts  # TechniqueSchema: protocol, tools, inputs/outputs, rules, operations
│   ├── state.schema.ts      # WorkflowStateSchema: history, checkpoint responses, nested triggered-workflow state
│   ├── session.schema.ts    # SessionFileSchema: the disk session.json (recursive, embeds child sessions)
│   └── resource.schema.ts   # ResourceSchema: minimal resource type
├── types/                # Re-export layer (types + schemas from schema/)
├── utils/                # Foundational services
│   ├── toon.ts           # TOON decoder/encoder wrapper
│   ├── session/          # Session subsystem (disk-backed session.json + .session-token seal)
│   │   ├── params.ts       # sessionIndexParam, assertNoActiveCheckpoint()
│   │   ├── derivation.ts   # session_index derivation (6-char base32 from planning folder path)
│   │   ├── store.ts        # session.json + seal read/write, planning-folder resolution, transient folders
│   │   ├── resolver.ts     # loadSessionForTool/saveSessionForTool/advanceSession, sessionView() adapter
│   │   ├── migration.ts    # Legacy workflow-state.json → session.json in-place migration
│   │   └── crypto.ts       # HMAC-SHA256 signing, server key management
│   ├── validation.ts     # Workflow consistency checks: transitions, manifests, conditions, technique association
│   └── index.ts          # Barrel exports
└── resources/
    └── schema-resources.ts # MCP resource: workflow-server://schemas and workflow-server://schemas/{id}
```

Workflow data lives in a `workflows/` worktree (orphan branch) with this layout:

```
workflows/
├── meta/                            # Universal techniques, activities, rules
│   ├── workflow.toon                # Workflow-level rules/variables/techniques (rules live here, by audience)
│   ├── techniques/                  # Universal capability techniques (workflow-engine, agent-conduct, ...)
│   ├── activities/                  # Meta workflow activities
│   └── resources/
├── work-package/                    # Primary workflow
│   ├── workflow.toon
│   ├── activities/                  # Activity TOON files
│   ├── techniques/                  # Workflow-specific techniques (markdown + per-op directories)
│   └── resources/                   # Resources (templates, guides)
└── ...other workflows
```

Every workflow binds **techniques** (capabilities and per-operation protocols). A technique
resolves by `::` path (`group::operation`, bare op, or cross-workflow `workflow::group::op`) and is
COMPOSED recursively: a technique inherits its workflow-root `techniques/TECHNIQUE.md` base contract
(inputs/outputs/rules merged; ancestor Initial/Final protocol blocks wrap the descendant protocol).

### Module Map

| Module | Responsibility | Key Dependencies |
|--------|---------------|-----------------|
| `server.ts` | MCP server creation and tool/resource registration | `@modelcontextprotocol/sdk`, tools, resources, TraceStore |
| `tools/workflow-tools.ts` | Workflow navigation and checkpoint tools | loaders/workflow-loader, loaders/technique-loader, loaders/core-ops, utils/session, utils/validation, trace |
| `tools/resource-tools.ts` | Session lifecycle (start_session, dispatch_child), technique, and resource tools | loaders/workflow-loader, loaders/technique-loader, loaders/resource-loader, utils/session |
| `loaders/workflow-loader.ts` | Workflow + activity file I/O with TOON decoding and Zod validation; transition/checkpoint helpers | utils/toon, schema/workflow, schema/activity |
| `loaders/activity-loader.ts` | Activity file discovery across workflows, index building | utils/toon, schema/activity |
| `loaders/technique-loader.ts` | Technique resolution by `::` path with recursive base-contract composition; bundle formatting | loaders/markdown-technique-loader, utils/toon |
| `loaders/core-ops.ts` | Baseline orchestrator/worker technique ref lists bundled into get_workflow / get_activity | — |
| `loaders/resource-loader.ts` | Resource file discovery (TOON + markdown), frontmatter parsing, `#section` anchor slicing | utils/toon, schema/resource |
| `schema/activity.schema.ts` | Zod schema for Activity: ordered kind-tagged `steps[]`, `decisions`, `transitions`; StepSchema; `Checkpoint` TS interface + `activityCheckpoints()` | schema/condition |
| `schema/state.schema.ts` | Zod schema for WorkflowState including CheckpointResponseSchema; nested triggered-workflow state | — |
| `schema/session.schema.ts` | Zod schema for the on-disk `SessionFile` (session.json); recursive (embeds child + parent sessions) | schema/state |
| `schema/condition.schema.ts` | Condition evaluation engine (evaluateCondition); and/or/not inlined via z.lazy | — |
| `schema/technique.schema.ts` | Technique schema with operations, inputs, outputs, protocol, rules | schema/common |
| `utils/session/` | Disk-backed session lifecycle: session_index derivation, session.json + seal store, resolver, migration, crypto | utils/session/crypto |
| `trace.ts` | In-memory trace store with cursor-based segment emission | utils/session/crypto |

### Design Patterns

1. **Server-Managed Disk State**: The server reads TOON files, validates with Zod, and returns JSON. Execution state lives in a per-session `session.json` written under the workspace's `.engineering/artifacts/planning/<slug>/` folder, sealed by a sibling `.session-token` HMAC file. The server resolves a session by its stable 6-character base32 `session_index` (derived from the planning-folder path), reads/advances/writes `session.json`, and re-verifies the seal. The in-memory `TraceStore` is the only mutable in-process state; authoritative session state is on disk.

2. **TOON Configuration Format**: Workflow definitions use TOON (decoded via `@toon-format/toon`), a custom format more concise than JSON/YAML for nested configuration. The `decodeToonRaw()` wrapper returns `unknown` — callers must validate afterward.

3. **Zod Schema Validation**: Every loaded entity (workflow, activity, condition, technique, state, session, resource) is validated against Zod schemas. Both `parse()` (throws) and `safeParse()` (returns result) patterns are used. Schemas serve double duty: runtime validation and TypeScript type inference via `z.infer<>`.

4. **Result Monad**: Loaders return `Result<T, E>` rather than throwing. Tools branch on `result.success` and throw `result.error` for MCP-level error responses. This separates error handling (loaders return errors) from error presentation (tools throw for MCP).

5. **Audit Logging Wrapper**: `withAuditLog()` wraps every tool handler to log structured audit events (tool name, parameters, duration, success/error) to stderr as JSON, and also records `TraceEvent`s in the `TraceStore`.

6. **Technique Bundle Preamble**: `get_workflow` and `get_activity` responses begin with a resolved technique bundle followed by a `\n\n---\n\n` separator, then the workflow/activity body. `get_workflow` bundles the workflow's orchestrator-level technique refs (`techniques.workflow`) unioned with `CORE_ORCHESTRATOR_TECHNIQUES`; `get_activity` bundles the activity's own refs plus the workflow-inherited `techniques.activity` plus `CORE_WORKER_TECHNIQUES`. Schemas themselves are served separately via the `workflow-server://schemas` MCP resources.

7. **Technique Resolution & Composition**: A technique reference resolves by `::` path — `group::operation`, a bare op (resolved against the current activity group via activity-group shorthand), or cross-workflow `workflow::group::op`. The returned technique is fully COMPOSED: it inherits its own workflow-root `techniques/TECHNIQUE.md` base contract recursively (inputs/outputs/rules merged; ancestor Initial/Final protocol blocks wrap the descendant protocol with the server renumbering). `resolveTechniques()` + `formatTechniqueBundle()` (`technique-loader.ts`) build the bundle.

8. **Checkpoint Hard Gate**: `assertNoActiveCheckpoint(state)` (`utils/session/params.ts`) is called in nearly every authenticated tool handler. If `state.activeCheckpoint` is set, it throws a hard error before the handler runs. Only `respond_checkpoint` (the resolution mechanism) and `present_checkpoint` (which loads the checkpoint definition while it is active) are exempt. `next_activity` and `yield_checkpoint` enforce the same gate inline.

9. **Embedded Child Sessions**: Child workflows are dispatched via `dispatch_child({ session_index, workflow_id })`, which appends an entry under the parent's `triggeredWorkflows[]` with the child's full `SessionFile` embedded inline — the whole work-package tree lives inside the top-level `session.json`. Each `SessionFile` also carries an optional `parentSession` upward link (recursive via `z.lazy()`). The `TraceStore` correlates events via the trace `psid` field and a `pdepth` ancestor-count.

## Key Abstractions

### Core Types

| Type | Module | Role |
|------|--------|------|
| `Workflow` | workflow.schema.ts | Top-level container: id, version, title, description, variables, `techniques` (by audience), `rules` (by audience), initialActivity, activities |
| `Activity` | activity.schema.ts | Unit of work: ordered kind-tagged `steps[]`, decisions, transitions, triggers, `techniques` (activity-wide refs), outcome, rules |
| `Step` | activity.schema.ts | Ordered execution unit with REQUIRED `kind` (technique \| action \| checkpoint \| loop): id, description, technique (string or `TechniqueBinding`), required, when, condition, actions, triggers — plus per-kind fields (checkpoint: message/options/defaultOption/autoAdvanceMs/blocking; loop: loopType/variable/over/breakCondition/maxIterations/steps) |
| `TechniqueBinding` | activity.schema.ts | Structured per-step binding: `{ name, inputs?, outputs? }` (op ref + input deviations + output remaps) |
| `Checkpoint` | activity.schema.ts | TS interface (not a Zod object) that `activityCheckpoints()` synthesizes from kind:checkpoint steps: id, name, message, condition, options, defaultOption, autoAdvanceMs |
| `CheckpointOption` | activity.schema.ts | Selectable choice: id, label, description, effect (setVariable, transitionTo, skipActivities) |
| `Technique` | technique.schema.ts | Capability/operation pattern: protocol, tools, rules, inputs, outputs, operations |
| `Condition` | condition.schema.ts | Boolean evaluation: simple (variable comparison), and, or, not (and/or/not inlined via z.lazy) |
| `Decision` | activity.schema.ts | Activity-level branch point: id, name, branches (≥2, each with condition + transitionTo) |
| `Transition` | activity.schema.ts | Navigation between activities: target activity ID (`to`), condition, isDefault |
| `WorkflowState` | state.schema.ts | Runtime state: current activity, completed activities, checkpoint responses, decision outcomes, variables, history, nested triggeredWorkflows |
| `CheckpointResponse` | state.schema.ts | Record of checkpoint response: optionId, respondedAt, effects |
| `Result<T, E>` | result.ts | Algebraic error handling: `{ success: true, value: T } \| { success: false, error: E }` (constructed via `ok()` / `err()`) |
| `SessionFile` | session.schema.ts | On-disk session.json: schemaVersion, sessionIndex, workflowId/Version, agentId, seq, ts, currentActivity, currentTechnique, condition, activeCheckpoint, variables, completedActivities, checkpointResponses, history, status, triggeredWorkflows (embedded children), parentSession, planningFolderPath |

### Step Kinds & Inline Checkpoints

An activity is a SINGLE ordered `steps[]` where every step carries a REQUIRED `kind`
(`technique | action | checkpoint | loop`). `StepSchema` is one Zod object; per-kind required
fields are enforced in a `superRefine`. A checkpoint and a loop are step kinds that occupy a
concrete position in the sequence:

- **`kind: 'checkpoint'`** carries its definition inline: `message`, `options[]`, `defaultOption`,
  `autoAdvanceMs`, `blocking`. Its POSITION in `steps[]` is its presentation timing.
- **`kind: 'loop'`** is a compound step whose body is a nested `steps[]`, with `loopType`
  (`forEach | while | doWhile`, named to avoid clashing with `Condition.type`),
  plus `variable` / `over` / `breakCondition` / `maxIterations`.

`Checkpoint` is an explicit TS interface, and
`activityCheckpoints(activity)` (activity.schema.ts) synthesizes the checkpoint definitions by
filtering the flattened steps for `kind === 'checkpoint'`; the step's `id` becomes the stable
checkpoint-response replay key. The checkpoint `condition` field uses structured `ConditionSchema`;
a checkpoint with an unmet condition is skipped. `decisions[]` and `transitions[]`
are activity-level (orchestrator routing), separate from the worker step sequence.

### State Tracking

`WorkflowState.checkpointResponses` uses string keys in format `"activityId-checkpointId"` mapping to `CheckpointResponse` objects. `WorkflowState.triggeredWorkflows` supports nested state via `NestedTriggeredWorkflowRefSchema` with recursive `state` fields.

### Error Handling

Domain-specific error classes extend `Error` with a `code` field. Loaders return `Result<T, DomainError>` for predictable error flow. Tools check `result.success` and throw `result.error` on failure, converting to MCP error responses. `result.ts` exposes `ok()` / `err()` plus the `Result` type; handlers branch on `result.success` directly.

## Design Rationale

### Server-Managed Disk State

- **Observation**: Authoritative session state lives in a per-session `session.json` on disk (sealed by a `.session-token` HMAC file), resolved by a stable `session_index`. The only in-process state is the in-memory `TraceStore`.
- **Rationale**: A self-contained `session.json` under the workspace planning folder survives server restarts, is human-inspectable, and lets the whole work-package tree (parent + embedded children) live in one file. The server provides the "what" (workflow definitions, techniques, schemas) and owns the canonical "how" state, while agents drive execution against it.
- **Trade-offs**: Requires a workspace path (CLI `--workspace` or `WORKFLOW_WORKSPACE`) and disk I/O on every authenticated call, in exchange for durable, inspectable state. The `TraceStore` is optional (evicts oldest sessions at capacity).

### Orchestrator/Worker Split

- **Observation**: The workflow defines a two-agent pattern where one agent coordinates and another executes.
- **Rationale**: Separation of coordination concerns (state management, transitions, user interaction) from domain work (code analysis, artifact production).
- **Implementation**: The orchestrator receives the orchestrator-level technique bundle from `get_workflow` (the workflow's `techniques.workflow` plus `CORE_ORCHESTRATOR_TECHNIQUES`). The worker receives the worker-level bundle from `get_activity` (the activity's own techniques plus the inherited `techniques.activity` plus `CORE_WORKER_TECHNIQUES`), and can fetch a single composed technique via `get_technique(step_id?)`. Both authenticate with the same `session_index`.

### TOON Format for Workflow Definitions

- **Observation**: All workflow definitions use `.toon` files decoded by `@toon-format/toon`.
- **Rationale**: TOON is more concise than JSON for deeply nested configuration. It preserves structured nature while being more human-readable.
- **Trade-offs**: Introduces a dependency on a less-standard format. Requires a dedicated parser.

### Schema Validation Architecture

- **Observation**: Zod schemas validate data at load time, and JSON schemas are exposed on demand via the `workflow-server://schemas` MCP resources.
- **Rationale**: Dual validation strategy — Zod catches malformed definitions at load (fail fast), while JSON schema resources give agents structural understanding when requested. The JSON `activity.schema.json` is GENERATED from the Zod schema (`scripts/generate-schemas.ts`) so the two cannot drift.
- **Trade-offs**: Two schema representations exist, but generation keeps them in lockstep. Agents pull schemas only when they need them (no fixed per-response preamble cost).

### Disk Session File as State Carrier

- **Observation**: Session state (workflow id/version, agent id, sequence, timestamp, current activity/technique/condition, variables, completed/skipped activities, checkpoint responses, history, status, active checkpoint, embedded child sessions, parent link, planning-folder path) lives in `session.json` and is resolved by a 6-character base32 `session_index`. A `.session-token` seal file HMAC-protects the on-disk state against tampering.
- **Rationale**: Durable, inspectable, restart-surviving state; a single file captures an entire nested work-package tree; the index is a small stable handle agents pass on every call.
- **Trade-offs**: The server needs a bound workspace and performs disk I/O per call. State is mobile — if the planning folder is renamed within the planning root, the stored `planningFolderPath` is silently re-recorded on resume; lookup is always by `session_index`, not by path.

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| Workflow | `WorkflowSchema` + `workflow.toon` | A structured process with ordered activities |
| Activity | `ActivitySchema` + `NN-activity-id.toon` | A phase of work within a workflow |
| Step | `StepSchema` (kind-tagged) | An ordered execution unit: technique, action, checkpoint, or loop |
| Checkpoint | `kind: 'checkpoint'` step + `Checkpoint` interface | A user decision point at its concrete position in the step sequence |
| Technique | `TechniqueSchema` + technique markdown / `NN-op` dirs | Composed capability/operation guidance bound by a step or an activity |
| Technique Binding | `TechniqueBindingSchema` (`step.technique`) | Per-step op reference plus input deviations / output remaps |
| Transition | `TransitionSchema` | Conditional navigation between activities |
| Decision | `DecisionSchema` | Activity-level multi-branch routing point |
| Condition | `ConditionSchema` + `evaluateCondition()` | Boolean expression evaluated against state variables |
| Worker | Sub-agent using the activity's technique bundle | Executes activity steps, yields at checkpoints |
| Orchestrator | Top-level agent using the workflow's technique bundle | Manages transitions, state, and user interaction |
| TOON | `@toon-format/toon` | Custom structured configuration format |
| MCP | `@modelcontextprotocol/sdk` | Model Context Protocol for AI tool communication |
| Technique Bundle | `resolveTechniques()` + `formatTechniqueBundle()` | Composed technique protocols prepended (above a `---` separator) to get_workflow / get_activity |
| Checkpoint Response | `CheckpointResponseSchema` | Record that a user responded to a checkpoint, keyed `activityId-checkpointId` |
| Variable | `VariableDefinitionSchema` | Named state value tracked across the workflow |
| Session Index | `session_index` (`utils/session/derivation.ts`) | 6-char base32 handle resolving a planning folder's `session.json` |
| Embedded Child Session | `EmbeddedSessionRef` (`triggeredWorkflows[]`) | A dispatched child workflow's full `SessionFile` nested inside the parent |
| Parent Link | `SessionFile.parentSession` | Upward link from a child session to its parent (recursive) |

### Domain Model

The server implements a hierarchical execution model:

The model is **Goal → Activity → Technique → Tools** (activities bind techniques):

```
Goal (user intent)
 └── Workflow (structured process)
      ├── Variables (state that flows across activities)
      ├── Techniques (by audience: workflow / activity)
      ├── Rules (by audience: workflow / activity / universal)
      └── Activities (ordered phases)
           ├── Steps[] (single ordered, kind-tagged list)
           │    ├── kind: technique  (binds an operation via step.technique)
           │    ├── kind: action     (control-only)
           │    ├── kind: checkpoint  (inline user decision point at its position)
           │    └── kind: loop        (compound; nested steps[] body)
           ├── Decisions (activity-level conditional branches)
           ├── Transitions (navigation to next activity)
           └── Techniques (activity-wide capability refs)
                └── Technique (composed, recursively inheriting its base contract)
                     ├── Protocol (step-by-step instructions)
                     ├── Tools (which MCP tools to use)
                     ├── Inputs / Outputs (artifact contract)
                     └── Rules (behavioral constraints)
```

## Tool Registration Pattern

Tool registration follows this pattern (workflow-tools use `server.tool(...)`; the session tools
in resource-tools use the `server.registerTool(name, { description, inputSchema }, handler)` form):
```
registerWorkflowTools(server, config) → server.tool(name, description, zodSchema, withAuditLog(name, handler, traceOpts?))
```

The `withAuditLog` wrapper (in `logging.ts`) is a higher-order function that wraps each handler for audit logging and trace recording. Authenticated session-bearing tools additionally wrap with `withSessionStoreErrors(...)` to translate session-store failures into clear MCP errors. The `traceOpts` parameter controls whether the tool is excluded from the trace (used for `get_workflow_status`, which passes `excludeFromTrace: true`, to avoid recursive trace entries).

## Session Management

### SessionFile Fields (`session.json`)

Session state is a disk-backed `SessionFile` resolved by `session_index`. Key fields:

| Field | Set By | Used By |
|-------|--------|---------|
| `sessionIndex` | `start_session` / `dispatch_child` (derived from folder path) | Every authenticated tool (the `session_index` parameter) |
| `workflowId` / `workflowVersion` | `start_session` / `dispatch_child` | Workflow load, version-drift validation |
| `agentId` | `start_session` / `dispatch_child` (`agent_id`) | Agent identification in trace |
| `seq` | `advanceSession` (every state-mutating call) | Sequence tracking |
| `ts` | `advanceSession` | Timing enforcement (checkpoints) |
| `currentActivity` | `next_activity` | `get_activity`, validation |
| `currentTechnique` | `get_technique` | Validation |
| `condition` | `next_activity` | Validation |
| `activeCheckpoint` | `yield_checkpoint` (cleared by `respond_checkpoint`) | Checkpoint hard gate (`assertNoActiveCheckpoint`) |
| `variables` | checkpoint effects, workflow steps | Status rollup, condition evaluation |
| `checkpointResponses` | `respond_checkpoint` (keyed `activityId-checkpointId`) | Replay on resume |
| `history` | every state-mutating call | Audit, status |
| `status` | lifecycle transitions | `get_workflow_status` |
| `triggeredWorkflows[]` | `dispatch_child` | Embedded child sessions (full nested `SessionFile`) |
| `parentSession` | `dispatch_child` (on the child) | Upward parent link; trace `psid`/`pdepth` |
| `planningFolderPath` | `start_session` / `dispatch_child` | Canonical absolute artifact location surfaced to agents |

### Seal Verification & Migration

The session store seals `session.json` with a sibling `.session-token` HMAC file
(`utils/session/store.ts`). On load the seal is verified against the on-disk state; a `start_session`
that resolves an existing slug RESUMES the session (workflow id taken from stored state — a caller
cannot rebrand a live session). If the resolved folder still contains legacy `workflow-state.json`
plus `.session-token` artefacts, `migratePlanningFolder()` (`utils/session/migration.ts`) migrates
them to the `session.json` shape in place. When `start_session` is called with no `planning_folder`,
a transient meta-bootstrap session is created under `os.tmpdir()` and promoted onto a stable workspace
folder by the first `dispatch_child`.

## Validation Surface Analysis

### Enforcement Chain

The enforcement chain for checkpoint compliance has three layers:

1. **Server layer** (`src/tools/workflow-tools.ts`): The `next_activity` and `yield_checkpoint` tools hard-block when `state.activeCheckpoint` is set; `assertNoActiveCheckpoint(state)` gates all other authenticated tools (except `respond_checkpoint` and `present_checkpoint`).

2. **Technique layer** (`workflows/meta/techniques/`): The orchestrator's bundled checkpoint-flow techniques (`workflow-engine::present-checkpoint-to-user`, `::respond-checkpoint`, and the `agent-conduct::checkpoint-discipline` rules) instruct it on checkpoint handling.

3. **Schema layer** (`src/schema/`): The data model supports enforcement — a `kind: 'checkpoint'` step carries `condition`, `defaultOption`, `autoAdvanceMs`, `blocking` inline; `SessionFile`/`WorkflowState` carry `checkpointResponses` and `activeCheckpoint`.

### Existing Helper Functions

`workflow-loader.ts` exports reusable helpers:
- `getActivity(workflow, activityId)` → returns `Activity | undefined`
- `getCheckpoint(workflow, activityId, checkpointId)` → returns `Checkpoint | undefined`
- `getValidTransitions(workflow, fromActivityId)` → returns `string[]`
- `getTransitionList(workflow, fromActivityId)` → returns `TransitionEntry[]` with human-readable conditions
- `validateTransition(workflow, from, to)` → returns `{ valid, reason? }`

These serve as building blocks for validation without new type definitions.

### Technique Schema as Behavioral Contract

`TechniqueSchema` defines a behavioral contract with these enforcement-relevant components:
- `protocol`: Step-by-step instructions (keyed phases, each with ordered bullets); composed recursively from the inherited base contract
- `rules`: Named behavioral constraints (e.g., the `agent-conduct::checkpoint-discipline` rules)
- `inputs` / `outputs`: Structured artifact contract — `get_activity` SYNTHESIZES the activity's `artifacts[]` from the `## Outputs` of the techniques its steps bind (technique outputs own artifact identity, AP-43)
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
| `pdepth` | Ancestor count via `parentSession` at event time (populated by handlers with a loaded `SessionFile`, notably `start_session`) |

### Trace Token Packaging

On `next_activity`, the server packages events since the last transition into an HMAC-signed trace token (`createTraceToken`) returned in `_meta.trace_token`. Agents accumulate these and resolve them via `get_trace`.

## Open Questions

| # | Question | Answer |
|---|----------|--------|
| Q1 | How does the `condition` field on checkpoints interact with validation? | A `kind: 'checkpoint'` step's `condition` uses structured `ConditionSchema`. A checkpoint with an unmet condition is skipped; `respond_checkpoint` accepts `condition_not_met: true` only when the checkpoint has a `condition` field. |
| Q2 | Does the orchestrator technique's validation happen in practice? | The server enforces checkpoint gates structurally (`state.activeCheckpoint` hard-blocks transitions). Semantic validation (step completeness) is advisory via `step_manifest`. |
| Q3 | Are there server-side mechanisms for checkpoint gates? | Yes — `assertNoActiveCheckpoint(state)` in authenticated tool handlers, plus inline `state.activeCheckpoint` checks in `next_activity` and `yield_checkpoint`. |
| Q4 | How are non-blocking checkpoints handled? | A checkpoint step with `defaultOption` + `autoAdvanceMs` and `blocking` unset can auto-advance. `respond_checkpoint` with `auto_advance: true` uses the defaultOption and enforces the full timer. |
| Q5 | What is the complete list of required blocking checkpoints? | Determined by the `kind: 'checkpoint'` steps in activity TOON files (`activityCheckpoints()` synthesizes them). The server does not pre-compute the list; it validates at yield time. |
| Q6 | Does `evaluateCondition()` apply to checkpoint conditions? | Yes — the checkpoint step's `condition` uses `ConditionSchema`, which `evaluateCondition()` evaluates (and/or/not nested via z.lazy). |
| Q7 | How does `get_workflow_status` derive completed activities? | Reads `state.completedActivities` from authoritative session state; only if that is empty does it fall back to scanning trace `next_activity` events with `s: 'ok'`. |
| Q8 | What is the parent/child session linkage mechanism? | `dispatch_child` embeds the child's full `SessionFile` under the parent's `triggeredWorkflows[]` and sets the child's `parentSession`. Trace events carry `psid` and `pdepth` for correlation. |
| Q9 | How is a session resolved and protected on disk? | `session_index` (6-char base32 derived from the planning-folder path) resolves `session.json`; a `.session-token` HMAC seal verifies on-disk state. The full seal-mismatch recovery path (renamed/moved folders, key rotation across restarts) is not yet traced end-to-end here. |
| Q10 | How does technique composition resolve and renumber the inherited base contract? | `resolveTechniques()` composes a technique with its workflow-root `techniques/TECHNIQUE.md` base (inputs/outputs/rules merged; ancestor Initial/Final protocol blocks wrap the descendant, server-renumbered). The exact merge/renumber rules and cross-workflow `workflow::group::op` precedence live in `technique-loader.ts` and warrant a dedicated trace. |

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
