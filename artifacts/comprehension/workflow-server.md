# Workflow Server — Comprehension Artifact

> **Last updated**: 2026-07-20
> **Coverage**: Cross-cutting behavioral analysis of the current source tree (src/, tests/, schemas/); transport extension points (2026-07-20)
> **Related artifacts**: [orchestration.md](orchestration.md), [utils-layer.md](utils-layer.md), [zod-schemas.md](zod-schemas.md), [json-schemas.md](json-schemas.md)

## Architecture Overview

### Project Structure

TypeScript MCP server (`@m2ux/workflow-server` v0.1.0, 42 source files). The domain model is
**Goal → Activity → Technique → Tools** — activities bind *techniques* (markdown capability/operation
definitions). Session state is a server-owned `session.json` file in the bound workspace
(see "Session File Model" below), addressed by a stable 6-character `session_index`.

```
src/
├── index.ts              # Entry point: config → server → stdio transport
├── server.ts             # createServer: McpServer, registers tools + resources + TraceStore; binds audit workspace dir
├── config.ts             # ServerConfig: workflowDir, schemasDir, workspaceDir, serverName, serverVersion, traceStore?, minCheckpointResponseSeconds?; loadConfig parses --workspace / WORKFLOW_WORKSPACE
├── errors.ts             # Domain error types with error codes (WorkflowNotFound, ResourceNotFound, WorkflowValidation, TechniqueNotFound, ActivityNotFound)
├── result.ts             # Result<T, E> sum type: ok(), err() (no unwrap — tools branch on result.success)
├── logging.ts            # Structured JSON logging + audit/trace wrapper (withAuditLog, TraceOptions, setAuditWorkspaceDir)
├── trace.ts              # TraceStore (in-memory per-session), TraceEvent, trace token encode/decode
├── schema/               # Zod runtime schemas for validation
│   ├── common.ts         # SemanticVersionSchema (single source of truth)
│   ├── workflow.schema.ts   # WorkflowSchema + audience-partitioned WorkflowTechniquesSchema / WorkflowRulesSchema
│   ├── activity.schema.ts   # ActivitySchema, StepSchema (kind-tagged steps), Checkpoint interface, step-id helpers
│   ├── condition.schema.ts  # ConditionSchema (simple + inlined and/or/not via z.lazy)
│   ├── session.schema.ts    # SessionFileSchema (recursive), ActiveCheckpointSchema, EmbeddedSessionRefSchema, createInitialSessionFile
│   ├── technique.schema.ts  # Technique definition schema
│   ├── state.schema.ts      # Runtime state, CheckpointResponseSchema, HistoryEntrySchema
│   └── resource.schema.ts
├── loaders/              # Data access layer (filesystem → validated objects)
│   ├── workflow-loader.ts        # Workflow + activity assembly from TOON files; getValidTransitions/getActivity/getTransitionList/TERMINAL_SENTINEL
│   ├── activity-loader.ts        # Activity discovery, index building, cross-workflow search
│   ├── technique-loader.ts       # Technique resolution + recursive composition (composeTechnique, projectTechniqueToToon); `::` path refs
│   ├── markdown-technique-loader.ts  # Parse markdown TECHNIQUE.md / op files (inputs/outputs/protocol/rules)
│   ├── core-ops.ts               # CORE_ORCHESTRATOR_TECHNIQUES / CORE_WORKER_TECHNIQUES baseline refs bundled into get_workflow / get_activity
│   ├── resource-loader.ts        # Resource file discovery (TOON + markdown), frontmatter parsing (name/version)
│   ├── schema-loader.ts          # JSON schema loading (5 schemas: workflow, activity, condition, technique, state)
│   ├── filename-utils.ts         # Canonical ID parsing (strips NN- prefix)
│   └── index.ts                  # Barrel exports
├── tools/                # MCP tool registration
│   ├── workflow-tools.ts    # 12 tools: discover, list_workflows, get_workflow, next_activity, get_activity, yield_checkpoint, resume_checkpoint, present_checkpoint, respond_checkpoint, get_trace, health_check, get_workflow_status
│   └── resource-tools.ts    # 4 tools: start_session, dispatch_child, get_technique, get_resource
├── resources/            # MCP resource registration
│   └── schema-resources.ts  # workflow-server://schemas and workflow-server://schemas/{id}
├── types/                # Re-export layer (types + schemas)
│   ├── workflow.ts
│   └── state.ts
└── utils/                # Foundational services
    ├── toon.ts           # TOON encode/decode wrapper (@toon-format/toon)
    ├── session/          # Session-file subsystem (see "Session File Model")
    │   ├── crypto.ts        # HMAC-SHA256 signing/verify, server key management (getOrCreateServerKey)
    │   ├── derivation.ts    # session_index derivation: HMAC(realpath(folder)) → 6-char RFC4648 base32; embedded-index variant
    │   ├── store.ts         # session.json + .session-token seal: atomic write, seal verify, canonicaliseJson, planning-folder mgmt
    │   ├── resolver.ts      # session_index → on-disk location; loadSessionForTool/advanceSession/saveSessionForTool; sessionView adapter
    │   ├── migration.ts     # Migrate workflow-state.json + .session-token artefacts in place
    │   ├── params.ts        # sessionIndexParam Zod fragment; assertNoActiveCheckpoint
    │   └── index.ts         # Barrel exports
    ├── validation.ts     # Workflow consistency checks (transitions, manifests, conditions, technique association); SessionView, MetaResponse
    └── index.ts          # Barrel exports
```

### Layer Summary

```
┌─────────────────────────────────────┐
│  Tool Handlers (2 modules)          │
│  workflow-tools, resource-tools     │
├─────────────────────────────────────┤
│  Resources (1 module)               │
│  schema-resources                   │
├─────────────────────────────────────┤
│  Loaders (8 modules)                │
│  workflow, activity, technique,     │
│  markdown-technique, core-ops,      │
│  resource, schema, filename-utils   │
├─────────────────────────────────────┤
│  Schema (7 modules)                 │
│  workflow, activity, condition,     │
│  session, technique, state, resource│
├─────────────────────────────────────┤
│  Utils/Core (modules)               │
│  session/{crypto,derivation,store,  │
│  resolver,migration,params},        │
│  validation, trace, logging         │
└─────────────────────────────────────┘
```

### Data Flow: Tool Call Lifecycle

```
Agent → MCP SDK → tool handler (receives session_index, a 6-char base32 string)
  → withAuditLog(handler)
    → loadSessionForTool(workspaceDir, session_index)  ← resolve index → folder, read session.json, verify .session-token seal
    → assertNoActiveCheckpoint(state)                  ← HARD GATE if state.activeCheckpoint is set
    → handler(params)
      → loadWorkflow(workflowDir, state.workflowId)    ← readFile + decodeToonRaw + Zod safeParse
      → validation.validateXxx(sessionView(state), ...) ← consistency checks → warnings
      → JSON.stringify(response)                       ← compact (no pretty-print)
    → advanceSession(state, draft => …)                ← produce next state (seq++, ts, mutations)
    → saveSessionForTool(loaded, next)                 ← atomic write of session.json + re-seal .session-token
    → createTraceEvent(...)                            ← append to TraceStore
  ← { content: [...], _meta: { session_index, validation, trace_token? } }
```

Authoritative state lives in `session.json` on disk; the response `_meta` echoes the stable
`session_index`.

### Design Patterns

1. **Result Type**: Loaders return `Result<T, E>` (`{ success: true, value } | { success: false, error }`) — tools branch on `result.success` and `throw result.error` for MCP error responses (`result.ts` exposes `ok()` / `err()`). Separates error handling from error presentation.

2. **Best-Effort Aggregation**: List operations (listWorkflows, listActivities) catch all errors and return partial results. `logWarn` in catch blocks makes failures visible in stderr without breaking the aggregation contract.

3. **TOON → Type Pipeline**: File content goes through `readFile → decodeToonRaw → [optional: ZodSchema.safeParse] → Result<T>`. The `decodeToonRaw` step returns `unknown` — callers must add Zod validation afterward.

4. **Server-Owned Session File**: Every authenticated tool call receives a stable 6-character `session_index`. `loadSessionForTool` resolves it to a planning folder under `<workspaceDir>/.engineering/artifacts/planning/<slug>/`, reads `session.json`, and verifies the `.session-token` HMAC seal. The handler mutates a draft via `advanceSession` and persists with `saveSessionForTool` (atomic write + re-seal). The `SessionFile` carries the full state — workflowId, workflowVersion, agentId, seq, ts, currentActivity, currentTechnique, condition, activeCheckpoint, variables, completedActivities, skippedActivities, checkpointResponses, history, status, triggeredWorkflows (embedded children), parentSession — so a single `session.json` holds the entire work-package tree. `validation.ts` projects this onto a minimal `SessionView` (`wf`/`act`/`v`) so the validation surface stays storage-agnostic.

5. **Validation-as-Metadata**: `validateActivityTransition`, `validateTechniqueAssociation`, and other checks return `ValidationResult` objects passed through `_meta.validation`. Callers never branch on validation status — it's purely informational for the consuming agent.

6. **Checkpoint Hard Gate**: `assertNoActiveCheckpoint(state)` is called in nearly every tool handler. If `state.activeCheckpoint` is set, it throws a hard error before the handler runs. The checkpoint-resolution tools are exempt so the orchestrator can still inspect and clear it.

## Key Abstractions

### Core Types

| Type | Location | Role |
|------|----------|------|
| `Result<T, E>` | `result.ts` | Sum type: `{ success: true, value: T } \| { success: false, error: E }` |
| `SessionFile` | `schema/session.schema.ts` | Server-owned, recursive on-disk session state (`session.json`). Carries workflow identity, current position, variables, checkpointResponses, history, status, `activeCheckpoint`, `triggeredWorkflows[]` (embedded children) and an optional `parentSession` link. `schemaVersion: 1`. |
| `ActiveCheckpoint` | `schema/session.schema.ts` | `{ checkpointId, activityId, yieldedAt }` — the live-checkpoint marker that gates other tools. |
| `SessionView` | `utils/validation.ts` | Minimal `{ wf, act, v }` projection of a `SessionFile` (built by `sessionView()`), keeping validation storage-agnostic. |
| `ValidationResult` | `utils/validation.ts` | `{ status: 'valid'\|'warning'\|'error', warnings: string[], errors?: string[] }` |
| `TraceEvent` | `trace.ts` | Compressed-field event (traceId, spanId, name, ts, ms, s, wf, act, aid, err?, vw?, psid?, pdepth?) |
| `TraceStore` | `trace.ts` | In-memory per-session event accumulator with cursor-based segment emission and LRU eviction |
| `ServerConfig` | `config.ts` | workflowDir, schemasDir, **workspaceDir**, serverName, serverVersion, traceStore?, minCheckpointResponseSeconds? |

### Error Types

| Error | Code | Used By |
|-------|------|---------|
| `WorkflowNotFoundError` | WORKFLOW_NOT_FOUND | workflow-loader |
| `ActivityNotFoundError` | ACTIVITY_NOT_FOUND | activity-loader, workflow-loader |
| `TechniqueNotFoundError` | SKILL_NOT_FOUND | technique-loader (the code constant is the `SKILL_NOT_FOUND` string) |
| `ResourceNotFoundError` | RESOURCE_NOT_FOUND | resource-loader |
| `WorkflowValidationError` | WORKFLOW_VALIDATION_ERROR | workflow-loader |
| `WorkspaceConfigError` | (plain Error) | config (no resolvable `--workspace` / `WORKFLOW_WORKSPACE`) |
| `SessionStoreError` | NOT_FOUND \| COLLISION \| SEAL_MISMATCH \| INVALID_INDEX \| WORKSPACE_INVALID | session/store (mapped to user-facing text by `describeSessionStoreError`) |

`ERROR_CODES` in `errors.ts` defines: WORKFLOW_NOT_FOUND, RESOURCE_NOT_FOUND, WORKFLOW_VALIDATION_ERROR, SKILL_NOT_FOUND, ACTIVITY_NOT_FOUND. (`TechniqueNotFoundError` maps to the `SKILL_NOT_FOUND` code.)

### Error Handling Strategy

The codebase uses two distinct error patterns:

1. **Result-based**: Loaders return `Result<T, DomainError>`. Tools branch on `result.success` and `throw result.error` for MCP-level handling.
2. **Catch-and-suppress**: List/aggregation operations use `try/catch` with fallback returns (`[]`, `null`): `catch (error) { logWarn(...); return []; }`.

Session-store failures additionally flow through a `withSessionStoreErrors` wrapper in the tool modules,
which maps `SessionStoreError` codes onto actionable MCP responses via `describeSessionStoreError`.

## Design Rationale

### DR-1: Best-Effort Aggregation vs. Fail-Fast
- **Observation**: List operations suppress all errors to return partial results
- **Rationale**: An MCP server that returns zero workflows because of a permission error on one subdirectory is worse for agent UX than one that returns the workflows it can access.
- **Trade-offs**: Optimizes for agent resilience; sacrifices debuggability, cacheability, and error visibility
- **Mitigation**: `logWarn` in catch blocks makes failures visible in stderr without changing the aggregation contract

### DR-2: Validation-as-Metadata vs. Enforcement
- **Observation**: Validation results are passed through `_meta` without enforcement. No tool rejects a request based on validation warnings (except the checkpoint hard gate).
- **Rationale**: The server is a read-only data provider, not an orchestrator. Enforcement is the consuming agent's responsibility. Warnings guide agent behavior without blocking operations.
- **Trade-offs**: Optimizes for agent flexibility; sacrifices safety guarantees

### DR-3: Checkpoint Hard Gate
- **Observation**: A set `state.activeCheckpoint` hard-blocks most tool calls, not just transitions.
- **Rationale**: Once a checkpoint is yielded, the worker must not proceed with any work until the orchestrator resolves it. This prevents race conditions where a worker calls tools while a checkpoint is pending.
- **Trade-offs**: Strict enforcement prevents accidental progress past checkpoints; requires proper orchestrator behavior to resume

### DR-4: Embedded Child Sessions Under a Single Session File
- **Observation**: Child workflows are not created through `start_session`. The orchestrator calls `dispatch_child({ session_index, workflow_id })` from inside the parent session; the child is appended under the parent's `triggeredWorkflows[]` as a fully embedded `SessionFile` (`triggeredWorkflows[i].state`), and the child links back via `parentSession`. The whole work-package tree therefore lives inside the top-level `session.json`.
- **Rationale**: A single sealed file captures the entire dispatch tree, so parent/child correlation and resume need no separate server-side index. `parentChainDepth` walks `parentSession` for diagnostics (soft-warn past `PARENT_CHAIN_DEPTH_WARN_THRESHOLD = 5`). The `TraceStore` records events keyed by `sessionIndex`.
- **Trade-offs**: The file grows with tree depth; a transient orchestrator-bootstrap (meta) session created in `os.tmpdir()` is *promoted* onto a stable workspace planning folder at the first `dispatch_child`, retaining its original `session_index` for the server's lifetime.

## Data Flow and Operational Context

### Session File Model

The server is bound to a single workspace at startup (`--workspace=PATH` / `WORKFLOW_WORKSPACE`,
resolved by `loadConfig` into `ServerConfig.workspaceDir`). Each session is a folder under
`<workspaceDir>/.engineering/artifacts/planning/<slug>/` containing two files:

- **`session.json`** — the canonical, server-owned `SessionFile` (pretty-printed with a fixed
  top-level key order via `canonicaliseJson` for deterministic, human-friendly bytes; mode `0600`).
- **`.session-token`** — the seal: a hex HMAC-SHA-256 of the canonical `session.json` bytes under the
  server's secret key. Tampering with `session.json` invalidates the seal, which the server detects on
  the next authenticated call (`SEAL_MISMATCH`).

A session is addressed by its **`session_index`**: a 6-character RFC 4648 base32 string (uppercase,
`A-Z2-7`) derived as `base32(HMAC-SHA256(server_key, realpath(folder)))[:6]` (`derivation.ts`). The
index is symlink-stable and secret-bound. Embedded child sessions get an index derived from the same
folder plus their JSON path (`computeEmbeddedSessionIndex`). `resolver.ts` maps an index back to its
on-disk location (`loadSessionForTool`), mutates a draft (`advanceSession`), and re-seals on save
(`saveSessionForTool`). `workflow-state.json` + `.session-token` artefacts are migrated to `session.json`
in place by `migration.ts` on first touch.

### Loader Pipeline (All Content Types)

```
readFile(path) → decodeToonRaw(content) → [optional: Schema.safeParse()] → Result<T>
                  ↑ returns unknown         ↑ workflow, activity
                  ↑ no validation           ↑ resource (structured)
```

Techniques follow a separate path: `markdown-technique-loader.ts` parses `TECHNIQUE.md` / op
markdown files (frontmatter + Inputs/Outputs/protocol/rules sections), and `technique-loader.ts`
recursively *composes* a technique against its workflow-root base contract (`composeTechnique`),
projecting the result to TOON for `get_technique` (`projectTechniqueToToon`).

### Session Access Pipeline

```
Tool call received with session_index (6-char base32)
  ├── withAuditLog wraps the handler (audit + trace)
  ├── loadSessionForTool(workspaceDir, session_index)   ← resolve folder, read session.json, verify .session-token seal
  ├── assertNoActiveCheckpoint(state)                   ← hard gate unless exempt
  ├── handler reads state / sessionView(state)
  ├── advanceSession(state, draft => …)                 ← seq++, ts, mutations
  └── saveSessionForTool(loaded, next)                  ← atomic write + re-seal
```

### Trace Event Pipeline

```
withAuditLog wraps handler
  → start timer
  → handler executes
  → logAuditEvent({ tool, params, result, duration_ms })
  → createTraceEvent({ traceId: sessionIndex, name: tool, ms: duration, s: status, wf, act, aid, err?, vw?, psid?, pdepth? })
  → traceStore.append(sessionIndex, event)
  → on next_activity: traceStore.getSegmentAndAdvanceCursor(sessionIndex) → createTraceToken(payload) → _meta.trace_token
```

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| Workflow | `Workflow` type, `.toon` file | Structured process definition with activities, variables, audience-partitioned rules and techniques (`{ workflow, activity }`), and an `initialActivity` |
| Activity | `Activity` type, activity `.toon` file | Single phase of a workflow: a single ordered `steps[]` of kind-tagged steps, plus activity-level `decisions[]` and `transitions[]` (orchestrator routing) |
| Step | `Step` type (`StepSchema`) | A `kind`-tagged unit in the ordered list: `technique` (binds an op), `action` (control-only), `checkpoint` (inline decision point), or `loop` (compound, nested `steps[]`) |
| Technique | `.md` capability/operation definition, `::`-path ref | Reusable capability an activity binds (Goal → Activity → Technique → Tools). Resolved & recursively composed by `technique-loader.ts`; bound per-step via `step.technique` (bare op or `{ name, inputs?, outputs? }`) |
| Resource | Resource `.toon`/`.md` file | Reference material (templates, guides); identified by frontmatter `name:` slug, with optional `version` |
| Session Index | 6-char RFC 4648 base32 string | Stable handle that resolves to an on-disk `session.json` (see Session File Model) |
| Session File | `SessionFile`, `session.json` + `.session-token` seal | Server-owned authoritative session state in the bound workspace |
| Checkpoint | `kind:checkpoint` step (`Checkpoint` interface) | Inline user-decision point at its concrete position in `steps[]`; carries message/options/effects/defaultOption/autoAdvanceMs/blocking inline. `activityCheckpoints()` synthesizes `Checkpoint` records from them |
| Loop | `kind:loop` step | Compound step with `loopType` (forEach/while/doWhile) and a nested `steps[]` body |
| Decision | `Decision` in activity schema | Activity-level conditional branching point (orchestrator routing) |
| Transition | `Transition` in activity schema | Directed edge between activities with optional condition |
| TOON | `@toon-format/toon` library | Configuration file format for workflow definitions |
| Parent Session | `SessionFile.parentSession` / `triggeredWorkflows[]` | Embedded link between a dispatched child workflow and its parent, inside the one `session.json` |

## Tool Inventory

Authenticated tools take a `session_index` parameter. The "Index Required"
column marks tools that need a resolvable session; the "Checkpoint Gate" column marks tools whose
handler calls `assertNoActiveCheckpoint` (which throws if `state.activeCheckpoint` is set).

### Workflow Tools (registerWorkflowTools — 12 tools)

| Tool | Index Required | Checkpoint Gate | Description |
|------|----------------|-----------------|-------------|
| `discover` | No | N/A | Entry point — returns server info and bootstrap instructions |
| `list_workflows` | No | N/A | Lists all available workflow definitions |
| `health_check` | No | N/A | Server health status |
| `get_workflow` | Yes | Yes | Loads composed orchestrator technique bundle + `---` + lightweight workflow metadata (rules, variables, `initialActivity`, activity stubs); response carries `planning_folder_path` |
| `next_activity` | Yes | **Hard** | Validates + advances to the named activity on disk; returns `trace_token` (does NOT return the activity definition) |
| `get_activity` | Yes | Yes | Loads the complete activity definition for the current activity, with inherited `techniques.activity` injected |
| `yield_checkpoint` | Yes | N/A | Records the checkpoint as `state.activeCheckpoint`; returns the `session_index` to yield to the orchestrator |
| `resume_checkpoint` | Yes | **Hard** | Verifies no active checkpoint remains; returns variable updates to apply |
| `present_checkpoint` | Yes | N/A | Reads `state.activeCheckpoint` and returns the full checkpoint definition (exempt from gate) |
| `respond_checkpoint` | Yes | N/A | Resolves the checkpoint, clears `state.activeCheckpoint`, applies the chosen option's effect (exempt from gate) |
| `get_trace` | Yes | Yes | Resolves trace tokens or returns the in-memory trace |
| `get_workflow_status` | Yes | Yes | Returns session status (active/blocked/completed), current activity, completed activities, variables, last checkpoint, parent context |

### Resource Tools (registerResourceTools — 4 tools)

| Tool | Index Required | Checkpoint Gate | Description |
|------|----------------|-----------------|-------------|
| `start_session` | No | N/A | Starts or resumes the TOP-LEVEL session for a planning-folder slug; returns the `session_index` + `planning_folder_path`. Omitting `planning_folder` mints a transient meta-bootstrap session in `os.tmpdir()` |
| `dispatch_child` | Yes | N/A | Appends a child workflow under the parent's `triggeredWorkflows[]` (embedded inline); promotes a transient parent onto a stable workspace folder if needed |
| `get_technique` | Yes | Yes | Loads a single fully-composed technique for the current workflow/activity/step (`step_id` optional) |
| `get_resource` | Yes | Yes | Loads a resource by id (bare or `workflow/id`-prefixed), optionally narrowed to a `#section` anchor |

## Open Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | How is parent/child session context represented? | Resolved | A child is embedded under the parent's `triggeredWorkflows[]` (`EmbeddedSessionRef.state` is a full `SessionFile`) and links back via `SessionFile.parentSession`; the whole tree lives in one `session.json`. `parentChainDepth` walks the chain; the trace event carries `pdepth`. Set by `dispatch_child`, not `start_session`. |
| 2 | How does `get_workflow_status` derive completed activities? | Resolved | Reads `state.completedActivities` from the authoritative session file. Only when that is empty (e.g. tracing-derived recovery) does it fall back to scanning the trace store for `ok` `next_activity` events (`workflow-tools.ts:816`). |
| 3 | What happens when a checkpoint is active and a gated tool is called? | Resolved | `assertNoActiveCheckpoint(state)` throws a hard error when `state.activeCheckpoint` is set. Only the checkpoint-resolution tools are exempt, so the orchestrator can inspect/clear it. |
| 4 | How does technique resolution handle bare vs. `::`-qualified refs? | Resolved | `get_technique` tries the activity-group convention first: a bare op resolves against `<currentActivity>::<op>`; if no such op exists it falls back to the as-authored ref. Qualified `group::op` / `workflow::group::op` refs resolve as written (`resource-tools.ts:547`). |
| 5 | What is the resource frontmatter format? | Resolved | YAML frontmatter between `---` delimiters. The canonical id is the frontmatter `name:` (the folder slug); `version` is read from a top-level `version:` or a nested `  version:`. Body is the content after the frontmatter (`resource-loader.ts:186`). |
| 6 | How does `get_technique` resolve `step_id` across loops? | Resolved | `flattenActivitySteps(activity)` walks top-level steps and every `kind:loop` body recursively; `get_technique` finds the step by id in that flattened list and reads `techniqueName(step.technique)`. Loop bodies are nested `steps[]` within each `kind:loop` step. |
| 7 | How is session state persisted and tamper-checked? | Resolved | Server-owned `session.json` (canonicalised, mode 0600) plus a `.session-token` HMAC seal in the planning folder. `loadSessionForTool` verifies the seal on every authenticated call; `saveSessionForTool` writes atomically and re-seals. Sessions are addressed by a 6-char base32 `session_index` derived from the folder realpath. |
| 8 | What composes the technique bundle returned by `get_workflow` / `get_activity`? | Open | `core-ops.ts` defines `CORE_ORCHESTRATOR_TECHNIQUES` and `CORE_WORKER_TECHNIQUES` (baseline refs unioned with the workflow's `techniques.workflow` / each activity's declared + inherited `techniques.activity`). The exact merge/dedup order and how inline (non-re-resolved) refs like `compose-prompt` are forced into the bundle warrants a dedicated trace. |
| 9 | What is the transient→workspace promotion lifecycle for meta-bootstrap sessions? | Open | A `start_session` without `planning_folder` mints a tmp folder + synthetic UUID slug; the first `dispatch_child` promotes the parent onto a stable workspace folder while retaining the original `session_index`. The transient registry (`registerTransient` / `redirectTransientToWorkspace`) and its process-lifetime guarantees deserve a focused write-up. |
| 10 | Does `createServer` (or anything it calls) assume a single-connection process, in a way that would break under multiple concurrent HTTP connections? | Resolved | No. `createServer(config)` (`server.ts:10-27`) is a pure factory — it builds one `McpServer` and registers stateless tool/resource handlers against it; per-call state lives in `session.json` on disk (keyed by `session_index`), not in module-level or closure state. `TraceStore` is per-`ServerConfig` (one instance shared by whichever transport(s) hold that config), and `setAuditWorkspaceDir` is the only module-level mutable value in the request path — it is set once at startup from the single `workspaceDir`, not per-connection, so it is safe under concurrent HTTP requests as long as only one `workspaceDir` is served per process (true for both transports today). |

## Deep-Dive Sections

### Dual-Transport Extension Points — 2026-07-20

Investigated ahead of adding an HTTP transport alongside stdio (see [work-package-plan](../planning/2026-07-20-dual-transport/06-work-package-plan.md) once written). Findings that changed the assumed approach from a generic "add HTTP" plan:

- **Tool registration is already extracted and transport-agnostic.** `createServer(config: ServerConfig): McpServer` (`server.ts`) builds the `McpServer`, calls `registerWorkflowTools(server, resolvedConfig)`, `registerResourceTools(server, resolvedConfig)`, `registerSchemaResources(server, resolvedConfig)`, and returns the server *unconnected*. `index.ts` is the only place that calls `.connect(new StdioServerTransport())`. Adding HTTP requires no tool-registration refactor — only a second entry point that calls the same `createServer(config)` and connects a different transport.
- **CLI/env config parsing already has an established pattern to extend, not replace.** `config.ts` hand-rolls `parseWorkspaceFlag(argv)` / `resolveWorkspaceDir(argv)` (CLI-flag-over-env-var precedence, explicit `WorkspaceConfigError` on failure — never silently defaulting) plus `envOrDefault` / `envNumberOrDefault` helpers, all returning a plain `ServerConfig` object — no schema-validation library is used for config today, even though `zod` is already a project dependency (used only for the `schema/*.ts` runtime-validation layer, not CLI config). A `--transport` / `--port` / `--host` flag set should follow the same manual-parsing convention (a `parseTransportFlag`/`parsePortFlag` alongside `parseWorkspaceFlag`) rather than introducing a parallel zod-schema-based config path — one config-construction style avoids two inconsistent patterns in the same file.
- **Structured logging already exists and intentionally writes to stderr.** `logInfo` / `logWarn` / `logError` / `logAuditEvent` (`logging.ts`) all emit single-line JSON via `console.error`, never `console.log` — stdout is reserved for the JSON-RPC wire protocol under `StdioServerTransport`, so any code that logs to stdout would corrupt the stdio transport's framing. HTTP request/response logging should reuse these same functions (e.g. `logInfo('HTTP request', { method, path, status, durationMs, requestId })`) rather than adding a second logging convention — this keeps both transports' logs uniformly parseable and, more importantly, avoids ever routing HTTP diagnostic output to stdout by a different code path.
- **No REST/HTTP error-response convention exists yet** — `errors.ts` defines MCP-domain error classes (`WorkflowNotFoundError`, etc.) that tools `throw` for the MCP SDK to translate into protocol-level errors; there is nothing today shaping a JSON HTTP error body. A `{ error, message, requestId, timestamp }` shape for HTTP-only routes (health/ready/404/500) is a new, additive convention and does not collide with or duplicate the existing MCP error types.
- **`@modelcontextprotocol/sdk` is already pinned to `^1.25.2`**, which ships both `server/sse.js` (`SSEServerTransport`, kept for backwards compatibility with older clients, per its `@deprecated` notes on the DNS-rebinding options) and `server/streamableHttp.js` (`StreamableHTTPServerTransport`, the current Streamable HTTP transport — single endpoint, supports both SSE-streamed and direct-response modes, session ID generator for stateful/stateless mode). New HTTP transport work should use `StreamableHTTPServerTransport` on one `/mcp` endpoint rather than the older SSE-pair pattern (`GET /mcp` + `POST /mcp/message`) — it is the transport the SDK's own docs treat as current for this version.
- **`express` is not yet a dependency** (only `@modelcontextprotocol/sdk`, `yaml`, `zod`, `zod-to-json-schema`); it needs to be added for the HTTP transport, but `zod` does not.
- **Concurrency**: see Open Question #10 above — resolved; `createServer` and its registered tools carry no per-connection state, so one `McpServer` instance safely serves concurrent HTTP requests the same way MCP already handles concurrent stdio requests within a process.

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
