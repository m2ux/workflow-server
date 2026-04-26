# Workflow Server — Comprehension Artifact

> **Last updated**: 2026-04-26
> **Coverage**: Cross-cutting behavioral analysis of the current source tree (src/, tests/, schemas/)
> **Related artifacts**: [orchestration.md](orchestration.md), [utils-layer.md](utils-layer.md), [zod-schemas.md](zod-schemas.md), [json-schemas.md](json-schemas.md)

## Architecture Overview

### Project Structure

TypeScript MCP server (`@m2ux/workflow-server` v0.1.0, ~3.5k LOC, 40+ source files).

```
src/
├── index.ts              # Entry point: config → server → stdio transport
├── server.ts             # Creates McpServer, registers tools + resources + TraceStore
├── config.ts             # ServerConfig: workflowDir, schemasDir, serverName, serverVersion, traceStore, minCheckpointResponseSeconds
├── errors.ts             # Domain error types with error codes
├── result.ts             # Result<T, E> monad: ok(), err(), unwrap()
├── logging.ts            # Structured JSON logging + audit event wrapper (withAuditLog)
├── trace.ts              # TraceStore (in-memory per-session), TraceEvent, trace token encode/decode
├── schema/               # Zod runtime schemas for validation
│   ├── common.ts         # SemanticVersionSchema (single source of truth)
│   ├── workflow.schema.ts
│   ├── activity.schema.ts
│   ├── skill.schema.ts
│   ├── condition.schema.ts
│   ├── state.schema.ts
│   ├── resource.schema.ts
│   └── rules.schema.ts
├── loaders/              # Data access layer (filesystem → validated objects)
│   ├── workflow-loader.ts   # Workflow + activity loading from TOON files
│   ├── activity-loader.ts   # Activity discovery, index building, cross-workflow search
│   ├── skill-loader.ts      # Skill resolution with cross-workflow fallback and explicit prefix support
│   ├── resource-loader.ts   # Resource file discovery (TOON + markdown), frontmatter parsing
│   ├── rules-loader.ts      # Global rules from meta/rules.toon
│   ├── schema-loader.ts     # JSON schema loading (5 schemas)
│   ├── schema-preamble.ts   # Schema preamble builder (cached at startup)
│   └── filename-utils.ts    # Canonical ID parsing (strips NN- prefix)
├── tools/                # MCP tool registration
│   ├── workflow-tools.ts    # 11 tools: discover, list_workflows, get_workflow, next_activity, get_activity, yield_checkpoint, resume_checkpoint, present_checkpoint, respond_checkpoint, get_trace, health_check, get_workflow_status
│   └── resource-tools.ts    # 4 tools: start_session, get_skills, get_skill, get_resource
├── resources/            # MCP resource registration
│   └── schema-resources.ts  # workflow-server://schemas/{id}
├── types/                # Re-export layer (types + schemas)
│   ├── workflow.ts
│   └── state.ts
└── utils/                # Foundational services
    ├── toon.ts           # TOON encode/decode wrapper (@toon-format/toon)
    ├── session.ts        # Session token lifecycle: create, decode, advance, decodePayloadOnly, assertCheckpointsResolved
    ├── validation.ts     # Workflow consistency checks (transitions, manifests, conditions, skill association)
    ├── crypto.ts         # AES-256-GCM encryption, HMAC-SHA256 signing, server key management
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
│  Loaders (7 modules)                │
│  workflow, activity, skill,         │
│  resource, rules, schema,           │
│  filename-utils                     │
├─────────────────────────────────────┤
│  Schema/Validation (7 modules)      │
│  workflow, activity, skill,         │
│  condition, state, resource, rules  │
├─────────────────────────────────────┤
│  Utils/Core (4 modules)             │
│  crypto, session, trace, logging    │
└─────────────────────────────────────┘
```

### Data Flow: Tool Call Lifecycle

```
Agent → MCP SDK → tool handler
  → withAuditLog(handler)
    → decodeSessionToken(token)       ← HMAC verify + Zod validate
    → assertCheckpointsResolved(token) ← HARD GATE if bcp is set
    → handler(params)
      → loader.readXxx(workflowDir)   ← readFile + decodeToonRaw + Zod safeParse
      → validation.validateXxx(...)   ← consistency checks → warnings
      → JSON.stringify(response)      ← compact (no pretty-print)
    → advanceToken(token, updates)    ← HMAC sign new token
    → createTraceEvent(...)           ← append to TraceStore
  ← { content: [...], _meta: { session_token, validation, trace_token? } }
```

### Design Patterns

1. **Result Monad**: Loaders return `Result<T, E>` — tools unwrap and throw for MCP error responses. Separates error handling from error presentation.

2. **Best-Effort Aggregation**: List operations (listWorkflows, listActivities) catch all errors and return partial results. `logWarn` in catch blocks makes failures visible in stderr without breaking the aggregation contract.

3. **TOON → Type Pipeline**: File content goes through `readFile → decodeToonRaw → [optional: ZodSchema.safeParse] → Result<T>`. The `decodeToonRaw` step returns `unknown` — callers must add Zod validation afterward.

4. **Session Token Threading**: Every tool call receives a session_token, decodes it, uses the payload for validation/context, advances the token, and returns the new token in `_meta`. The token carries workflow state (wf, act, skill, cond, version, seq, timestamp, session ID, agent ID, bcp, parent context).

5. **Validation-as-Metadata**: `validateActivityTransition`, `validateSkillAssociation`, and other checks return `ValidationResult` objects passed through `_meta.validation`. Callers never branch on validation status — it's purely informational for the consuming agent.

6. **Checkpoint Hard Gate**: `assertCheckpointsResolved(token)` is called in nearly every tool handler. If `token.bcp` is set, it throws a hard error before the handler runs. Only `present_checkpoint` and `respond_checkpoint` are exempt.

## Key Abstractions

### Core Types

| Type | Location | Role |
|------|----------|------|
| `Result<T, E>` | `result.ts` | Sum type: `{ success: true, value: T } \| { success: false, error: E }` |
| `SessionPayload` | `utils/session.ts` | 13-field token payload (wf, act, skill, cond, v, seq, ts, sid, aid, bcp, psid, pwf, pact, pv) |
| `ValidationResult` | `utils/validation.ts` | `{ status: 'valid'\|'warning'\|'error', warnings: string[], errors?: string[] }` |
| `TraceEvent` | `trace.ts` | Compressed-field event (traceId, spanId, name, ts, ms, s, wf, act, aid, err?, vw?, psid?) |
| `TraceStore` | `trace.ts` | In-memory per-session event accumulator with cursor-based segment emission and LRU eviction |
| `ServerConfig` | `config.ts` | workflowDir, schemasDir, serverName, serverVersion, traceStore?, minCheckpointResponseSeconds? |

### Error Types

| Error | Code | Used By |
|-------|------|---------|
| `WorkflowNotFoundError` | WORKFLOW_NOT_FOUND | workflow-loader |
| `ActivityNotFoundError` | ACTIVITY_NOT_FOUND | activity-loader, workflow-loader |
| `SkillNotFoundError` | SKILL_NOT_FOUND | skill-loader |
| `ResourceNotFoundError` | RESOURCE_NOT_FOUND | resource-loader |
| `RulesNotFoundError` | RULES_NOT_FOUND | rules-loader |
| `WorkflowValidationError` | WORKFLOW_VALIDATION_ERROR | workflow-loader |

### Error Handling Strategy

The codebase uses two distinct error patterns:

1. **Result-based**: Loaders return `Result<T, DomainError>`. Tools call `unwrap()` which throws the error for MCP-level handling.
2. **Catch-and-suppress**: List/aggregation operations use `try/catch` with fallback returns (`[]`, `null`). Post-fix: `catch (error) { logWarn(...); return []; }`.

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
- **Observation**: `bcp` (blocking checkpoint) hard-blocks most tool calls, not just transitions.
- **Rationale**: Once a checkpoint is yielded, the worker must not proceed with any work until the orchestrator resolves it. This prevents race conditions where a worker calls tools while a checkpoint is pending.
- **Trade-offs**: Strict enforcement prevents accidental progress past checkpoints; requires proper orchestrator behavior to resume

### DR-4: Parent Context in Session Token
- **Observation**: `start_session` with `parent_session_token` embeds parent context (`psid`, `pwf`, `pact`, `pv`) in the child token.
- **Rationale**: This enables trace correlation between parent and child sessions without server-side state tracking. The `TraceStore` records events in both parent and child traces.
- **Trade-offs**: Token size increases slightly; parent context is immutable once set

## Data Flow and Operational Context

### Loader Pipeline (All Content Types)

```
readFile(path) → decodeToonRaw(content) → [optional: Schema.safeParse()] → Result<T>
                  ↑ returns unknown         ↑ workflow, activity, skill
                  ↑ no validation           ↑ resource (structured), rules
```

### Session Token Pipeline

```
Tool call received with session_token string
  ├── withAuditLog: decodeSessionToken(token)  ← decode #1 (for trace)
  ├── handler: decodeSessionToken(token)       ← decode #2 (for business logic)
  └── advanceToken(token, updates, decoded?)   ← can skip decode if decoded passed
```

### Trace Event Pipeline

```
withAuditLog wraps handler
  → start timer
  → handler executes
  → logAuditEvent({ tool, params, result, duration_ms })
  → createTraceEvent({ traceId: sid, name: tool, ms: duration, s: status, wf, act, aid, err?, vw?, psid? })
  → traceStore.append(sid, event)
  → on next_activity: traceStore.getSegmentAndAdvanceCursor(sid) → createTraceToken(payload) → _meta.trace_token
```

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| Workflow | `Workflow` type, `.toon` file | Structured process definition with activities, variables, modes, skills |
| Activity | `Activity` type, activity `.toon` file | Single phase of a workflow with steps, checkpoints, decisions, loops, transitions |
| Skill | `Skill` type, skill `.toon` file | Reusable capability attached to activities or workflows |
| Resource | Resource `.toon`/`.md` file | Reference material (templates, guides) |
| Rules | `Rules` type, `meta/rules.toon` | Global behavioral guidelines for agents |
| Session Token | HMAC-signed base64url string | Carries workflow state across tool calls |
| Checkpoint | `Checkpoint` in activity schema | User-decision point during activity execution |
| Transition | `Transition` in activity schema | Directed edge between activities with optional condition |
| TOON | `@toon-format/toon` library | Configuration file format for workflow definitions |
| Mode | `ModeSchema` in workflow schema | Execution variant that modifies standard workflow behavior |
| Artifact Location | `ArtifactLocation` in workflow schema | Named storage location for activity outputs |
| Parent Context | `ParentContext` in session.ts | Links dispatched child workflows to parent session |

## Tool Inventory

### Workflow Tools (registerWorkflowTools)

| Tool | Session Required | Checkpoint Gate | Description |
|------|-----------------|-----------------|-------------|
| `discover` | No | N/A | Entry point — returns server info and bootstrap instructions |
| `list_workflows` | No | N/A | Lists all available workflow definitions |
| `health_check` | No | N/A | Server health status |
| `get_workflow` | Yes | Yes | Loads workflow definition (with primary skill prefix) |
| `next_activity` | Yes | **Hard** | Transitions to next activity, returns trace_token |
| `get_activity` | Yes | Yes | Loads complete activity definition for current activity |
| `yield_checkpoint` | Yes | N/A | Yields checkpoint, sets bcp |
| `resume_checkpoint` | Yes | **Hard** | Resumes after checkpoint resolution |
| `present_checkpoint` | Yes | N/A | Loads checkpoint details (exempt from gate) |
| `respond_checkpoint` | Yes | N/A | Resolves checkpoint, clears bcp (exempt from gate) |
| `get_trace` | Yes | Yes | Resolves trace tokens or returns in-memory trace |
| `get_workflow_status` | Yes | Yes | Returns session status, current activity, completed activities |

### Resource Tools (registerResourceTools)

| Tool | Session Required | Checkpoint Gate | Description |
|------|-----------------|-----------------|-------------|
| `start_session` | No | N/A | Creates/inherits/adopts session token |
| `get_skills` | Yes | Yes | Loads workflow primary skill as raw TOON |
| `get_skill` | Yes | Yes | Loads skill for current activity/step |
| `get_resource` | Yes | Yes | Loads resource content by index |

## Open Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | What is the complete set of parent context fields and their semantics? | Resolved | `psid` (parent session ID), `pwf` (parent workflow ID), `pact` (parent activity), `pv` (parent version). Set by `start_session` when `parent_session_token` is provided. |
| 2 | How does `get_workflow_status` derive completed activities? | Resolved | Scans the trace store for `next_activity` events with status `ok` and extracts unique `act` values. |
| 3 | What happens when `next_activity` is called with `bcp` set? | Resolved | Hard error: "Cannot transition to 'X': Active checkpoint 'Y' on activity 'Z'. The orchestrator must resolve it by calling respond_checkpoint." |
| 4 | How does the skill loader handle cross-workflow prefixed skills? | Resolved | `skillId.includes('/')` → split on first `/` → `[targetWorkflow, actualSkillId]` → search only that workflow's skills directory. |
| 5 | What is the resource frontmatter format? | Resolved | YAML frontmatter between `---` delimiters. Parsed fields: `id`, `version`. Body is the remaining content after frontmatter. |
| 6 | How does `get_skill` resolve step_id across loops? | Resolved | Searches `activity.steps` first, then `activity.loops[].steps`. Throws if step not found or step has no skill. |
| 7 | What does `get_skills` return now? | Resolved | Only the workflow's `primary` skill (from `workflow.skills.primary`), not all workflow-level skills. Returns raw TOON separated by `---` fences. |

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
