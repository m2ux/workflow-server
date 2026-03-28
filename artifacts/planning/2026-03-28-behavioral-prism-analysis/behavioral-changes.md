---
target: src/
analysis_date: 2026-03-28
lens: evolution
---

# Behavioral Prism Analysis: Invisible Handshakes, Poison Propagation & Fragility Atlas

**Codebase**: workflow-server (TypeScript MCP server for workflow orchestration)
**Scope**: All 36 source files in `src/` (~3k LOC)

---

## Step 1: Trace Invisible Handshakes

### HC-1: The Cryptographic Key Singleton

**Origin**: `src/utils/crypto.ts:14` — module-level `let keyPromise: Promise<Buffer> | null = null`

The server's entire identity and trust model rests on a lazily-initialized, module-scoped promise that caches a 256-bit key from `~/.workflow-server/secret`. Every function that touches session tokens, trace tokens, or encrypted state flows through `getOrCreateServerKey()` (crypto.ts:16-23), which returns this cached promise.

**Dependent functions** (all implicitly coupled to the singleton):
- `encode()` → `getOrCreateServerKey()` (session.ts:26-31)
- `decode()` → `getOrCreateServerKey()` (session.ts:45-70)
- `createSessionToken()` → `encode()` (session.ts:72-84)
- `decodeSessionToken()` → `decode()` (session.ts:86-88)
- `advanceToken()` → `decode()` + `encode()` (session.ts:90-103)
- `createTraceToken()` → `getOrCreateServerKey()` (trace.ts:107-113)
- `decodeTraceToken()` → `getOrCreateServerKey()` (trace.ts:136-152)
- `save_state` handler → `getOrCreateServerKey()` (state-tools.ts:64)
- `restore_state` handler → `getOrCreateServerKey()` (state-tools.ts:128)

**Unwritten rule**: All crypto operations assume key identity across the process lifetime. The key is loaded once from disk and never re-read. If the key file is rotated while the server runs, or if a second process creates a new key between the first process's reads, the cached promise diverges from on-disk truth silently.

---

### HC-2: Config Object Mutation Before Server Construction

**Origin**: `src/index.ts:21-22`

```typescript
const config = loadConfig();
config.schemaPreamble = await buildSchemaPreamble(config.schemasDir);
```

`loadConfig()` (config.ts:28-35) returns a `ServerConfig` where `schemaPreamble` is `undefined`. The caller mutates it before passing to `createServer()`. Inside `createServer()` (server.ts:14), the fallback `config.schemaPreamble ?? ''` silently degrades to empty string if the mutation was missed.

**Dependent functions**:
- `createServer()` (server.ts:10-28) — spreads config into `ResolvedServerConfig`
- `get_workflow` handler (workflow-tools.ts:81-83) — checks `if (config.schemaPreamble)` to prepend schema context
- `buildSchemaPreamble()` (schema-preamble.ts:11-37) — reads schema files from disk, builds markdown preamble

**Unwritten rule**: `loadConfig()` → mutation of `schemaPreamble` → `createServer()` must execute in this exact order. The type system allows `schemaPreamble?: string` on `ServerConfig` but demands `schemaPreamble: string` on `ResolvedServerConfig`, yet the bridge between them is procedural convention in `main()`, not type enforcement at the call site.

---

### HC-3: TraceStore Cursor-Based Segment State

**Origin**: `src/trace.ts:62-63` — `private sessions = new Map<string, TraceEvent[]>()` and `private cursors = new Map<string, number>()`

The `TraceStore` holds mutable per-session event arrays and cursor positions. Multiple tool handlers share this store through `config.traceStore`:

| Operation | Method | Mutates State | Called By |
|-----------|--------|---------------|-----------|
| Initialize | `initSession()` (trace.ts:70-81) | Creates session + cursor entries | `start_session` (resource-tools.ts:54-55) |
| Append | `append()` (trace.ts:84-87) | Pushes to session array | `appendTraceEvent()` (logging.ts:77) via `withAuditLog` |
| Read all | `getEvents()` (trace.ts:89-91) | None (copies array) | `get_trace` handler (workflow-tools.ts:266) |
| Segment | `getSegmentAndAdvanceCursor()` (trace.ts:97-103) | **Advances cursor** | `next_activity` handler (workflow-tools.ts:157) |

**Unwritten rules**:
1. `initSession(sid)` MUST be called before `append(sid, event)`. The `append` method guards with `if (events)` (trace.ts:86) — if the session wasn't initialized, events are silently dropped.
2. `getSegmentAndAdvanceCursor()` is **destructive** — it advances the cursor, so a segment of events can only be consumed once. This creates an implicit happens-before ordering: `next_activity` is the sole consumer of segments and must not be called concurrently for the same session.
3. The eviction policy (trace.ts:72-77) deletes the oldest session when `maxSessions` is exceeded. Any tools still holding a reference to the evicted `sid` will silently lose their trace history.

---

### HC-4: Session Token as Implicit State Machine

**Origin**: `src/utils/session.ts:5-15` — `SessionPayload` fields encode agent progress

The session token carries `wf`, `act`, `skill`, `cond`, `seq`, `sid`, `aid` — but these fields control validation branching across multiple functions without being explicit state machine transitions:

| Token State | Meaning | Functions That Branch On It |
|-------------|---------|---------------------------|
| `act === ''` | No activity entered yet | `validateActivityTransition` returns null (validation.ts:24), `validateTransitionCondition` returns null (validation.ts:107), `get_activities` throws (workflow-tools.ts:211), `next_activity` skips step_manifest validation (workflow-tools.ts:122) |
| `act !== ''` | Activity in progress | Full transition validation enabled |
| `wf !== workflow_id` | Workflow mismatch | `validateWorkflowConsistency` returns warning string (validation.ts:17-19) |
| `v !== workflow.version` | Version drift | `validateWorkflowVersion` returns warning string (validation.ts:55-58) |

**Unwritten rule**: The first `next_activity` call after `start_session` bypasses ALL transition validation because `token.act` is empty. Any activity can be the entry point, not just `workflow.initialActivity`. The `initialActivity` field on the workflow schema (workflow.schema.ts:53) is informational metadata, not enforced by the server.

---

### HC-5: `decodeToon<T>()` — Unsafe Generic Cast Without Validation

**Origin**: `src/utils/toon.ts:8-9`

```typescript
export function decodeToon<T = unknown>(content: string): T {
  return decode(content) as T;
}
```

This function casts the TOON decode output to an arbitrary type `T`. The compile-time type is a lie — at runtime, the object is whatever the TOON parser produced. Callers split into two categories:

**Callers that validate after decode** (safe):
- `loadWorkflow()` → `safeValidateWorkflow()` (workflow-loader.ts:106)
- `loadActivitiesFromDir()` → `safeValidateActivity()` (workflow-loader.ts:42)
- `readActivityFromWorkflow()` → `safeValidateActivity()` (activity-loader.ts:115) — **but falls back to raw on failure** (activity-loader.ts:120)
- `save_state` → `NestedWorkflowStateSchema.safeParse()` (state-tools.ts:54)
- `restore_state` → `StateSaveFileSchema.safeParse()` (state-tools.ts:121)

**Callers that do NOT validate** (unsafe):
- `readRules()` → `decodeToon<Rules>(content)` — no validation (rules-loader.ts:43)
- `tryLoadSkill()` → `decodeToon<Skill>(content)` — no validation (skill-loader.ts:78)
- `readResource()` → `decodeToon<Resource>(content)` — no validation (resource-loader.ts:107)

**Unwritten rule**: TOON files for rules, skills, and resources are trusted to conform to their TypeScript interfaces. If they don't, structurally invalid objects flow through the system with the correct TypeScript type, causing field-access failures or silent undefined propagation downstream.

---

### HC-6: `artifactPrefix` — Server-Computed Field Silently Overwritten

**Origin**: `src/loaders/workflow-loader.ts:48` and `src/loaders/activity-loader.ts:123-126`

After Zod validation succeeds, the loader mutates the validated object:

```typescript
activity.artifactPrefix = parsed.index;  // workflow-loader.ts:48
```

The schema declares `artifactPrefix` as optional (activity.schema.ts:172) with a comment "Server-computed — do not set in TOON files." But if a TOON file includes this field, Zod validation passes it through, and the loader immediately overwrites it.

**Dependent functions**:
- `loadActivitiesFromDir()` (workflow-loader.ts:28-57) — sets prefix from filename
- `readActivityFromWorkflow()` (activity-loader.ts:83-148) — sets prefix from filename
- Any consumer of `Activity.artifactPrefix` trusts it matches the filename index

**Unwritten rule**: `artifactPrefix` is always derived from the `{NN}-` filename prefix via `parseActivityFilename()`, never from TOON content. The schema allows it; the runtime ignores it.

---

### HC-7: `process.cwd()` as Security Boundary

**Origin**: `src/tools/state-tools.ts:19-26`

```typescript
export function validateStatePath(inputPath: string): string {
  const root = process.cwd();
  const resolved = resolve(inputPath);
  if (resolved !== root && !resolved.startsWith(root + sep)) {
    throw new Error(`Path validation failed: "${inputPath}" resolves outside the workspace root`);
  }
  return resolved;
}
```

This function reads `process.cwd()` on every call — not from `config` or any injected parameter. The security boundary is entirely determined by the process's working directory at invocation time.

**Dependent functions**:
- `save_state` handler (state-tools.ts:60) — validates `planning_folder_path`
- `restore_state` handler (state-tools.ts:117) — validates `file_path`

**Unwritten rule**: The server must be started from the workspace root. If started from `/tmp`, `/home`, or any other directory, the path validation boundary shifts, potentially allowing reads/writes outside the intended workspace.

---

### HC-8: `session_token` Parameter Name as Stringly-Typed Contract

**Origin**: `src/logging.ts:63`

```typescript
const tokenStr = params['session_token'];
if (typeof tokenStr !== 'string') return;
```

The `appendTraceEvent()` function extracts the session token from tool parameters by the literal key `'session_token'`. This is the bridge between `withAuditLog`'s generic parameter type `T extends Record<string, unknown>` and the trace system.

**Dependent functions**:
- `withAuditLog()` (logging.ts:83-105) — wraps every tool handler
- `appendTraceEvent()` (logging.ts:54-81) — extracts token by string key
- All tool registrations that pass `traceOpts` to `withAuditLog`

**Unwritten rule**: Every tool that wants tracing must include `session_token` as a parameter name. The `sessionTokenParam` export (session.ts:105-108) enforces this via Zod, but there's no compile-time link between the Zod schema key and the runtime string lookup in `appendTraceEvent`.

---

### HC-9: `loadSkillResources` — Loose Coupling via `resources` Array

**Origin**: `src/tools/resource-tools.ts:15-27`

```typescript
async function loadSkillResources(workflowDir: string, workflowId: string, skillValue: unknown): Promise<StructuredResource[]> {
  if (typeof skillValue !== 'object' || skillValue === null) return [];
  const resources_field = (skillValue as Record<string, unknown>)['resources'];
  if (!Array.isArray(resources_field)) return [];
  const skillResources = resources_field.filter((v): v is string => typeof v === 'string');
  // ...
```

This function receives the skill as `unknown`, manually extracts the `resources` field, and filters for strings. It bypasses the `Skill` type entirely — the function doesn't know or care whether Zod validated the skill.

**Unwritten rule**: Skills are treated as untyped bags of properties when loading resources. The `Skill.resources` field (skill.schema.ts:169) defines resource indices as strings, but `loadSkillResources` re-discovers this at runtime via property access. If the field name changes in the schema, this function silently returns empty.

---

### HC-10: Workflow Activity Loading — Schema Property Consumption and Deletion

**Origin**: `src/loaders/workflow-loader.ts:88-103`

```typescript
const existingActivities = rawWorkflow['activities'] as Activity[] | undefined;
if (!existingActivities || existingActivities.length === 0) {
  const activitiesDirName = rawWorkflow.activitiesDir ?? 'activities';
  // ... load activities from directory ...
  if (rawWorkflow.activitiesDir) {
    delete rawWorkflow.activitiesDir;  // line 102
  }
}
```

The `activitiesDir` property is read from the raw TOON decode, used to locate the activities directory, then **deleted** from the object before Zod validation. This is a consume-and-destroy pattern: the property exists only in the TOON file, never in the validated `Workflow` type.

**Unwritten rule**: `activitiesDir` is a meta-property of the serialized form, not the runtime form. It must be processed before Zod validation (which would reject unknown properties in strict mode). The deletion ensures schema compliance but erases provenance information.

---

## Step 2: Propagate the Poison

### P-1: Server Key Divergence (from HC-1)

**Smallest mutation**: Delete `~/.workflow-server/secret` while the server runs. A second server instance (or the same server after restart) creates a new key.

**Contamination path**:

1. **`getOrCreateServerKey()`** (crypto.ts:16) — Running server returns cached old key; new server creates/caches new key
2. **`decode()`** (session.ts:52-53) — `hmacVerify(b64, sig, key)` returns `false` for tokens signed with the other key
3. **`decodeSessionToken()`** (session.ts:86) — throws `Error('Invalid session token: signature verification failed')`
4. **Every tool handler** (workflow-tools.ts:71, 115, 189, 209, 237; resource-tools.ts:93, 149; state-tools.ts:46, 115) — receives thrown error
5. **`withAuditLog`** (logging.ts:89-95) — catches error, logs audit event with `result: 'error'`, re-throws
6. **MCP framework** — returns error response to client

**Wrong behavior**: Agent receives `"Invalid session token: signature verification failed"` despite holding a legitimately-issued token. The error message implies the token is forged. The agent cannot distinguish key rotation from token tampering. Recovery requires starting a new session, losing all accumulated state. Saved state files encrypted with the old key become permanently unrecoverable (`restore_state` throws the error from state-tools.ts:131-134).

---

### P-2: Silent Schema Preamble Degradation (from HC-2)

**Smallest mutation**: Remove the `config.schemaPreamble = await buildSchemaPreamble(...)` line in `index.ts:22`.

**Contamination path**:

1. **`createServer()`** (server.ts:14) — `config.schemaPreamble ?? ''` resolves to `''`
2. **`get_workflow` handler** (workflow-tools.ts:81) — `if (config.schemaPreamble)` evaluates falsy, skips the `content.push` for preamble
3. **Agent receives workflow** — Response contains workflow definition but no schema documentation
4. **Agent interprets TOON structures** — Without schema context, agent cannot correctly interpret condition types, transition semantics, or checkpoint effects

**Wrong behavior**: `get_workflow` returns a valid response with complete workflow data but zero schema context. The agent processes the workflow as raw JSON without understanding field semantics. Transitions with conditions may be misinterpreted; checkpoint effects may be ignored. No error is logged. No warning is emitted. The `health_check` tool reports `status: 'healthy'`.

---

### P-3: TraceStore Silent Event Dropping (from HC-3)

**Smallest mutation**: Remove `config.traceStore.initSession(decoded.sid)` from `start_session` handler (resource-tools.ts:55).

**Contamination path**:

1. **`TraceStore.append(sid, event)`** (trace.ts:84-87) — `this.sessions.get(sid)` returns `undefined`, `if (events)` guard prevents push. Event silently dropped.
2. **`appendTraceEvent()`** (logging.ts:77) — Called by `withAuditLog` for every subsequent tool call. Every event for this session is dropped.
3. **`next_activity` handler** (workflow-tools.ts:157) — `getSegmentAndAdvanceCursor(token.sid)` returns `{ events: [], fromIndex: 0, toIndex: 0 }`. No trace token is generated.
4. **`_meta.trace_token`** — Missing from `next_activity` responses. Agent accumulates no trace tokens.
5. **`get_trace` handler** (workflow-tools.ts:266) — `getEvents(token.sid)` returns `[]`. Reports `event_count: 0`.
6. **Agent's perspective**: Session appears to have no execution history. Audit events still log to stderr (separate from trace), but the structured trace is completely empty.

**Wrong behavior**: `get_trace` returns `{ tracing_enabled: true, event_count: 0, events: [] }` — tracing appears enabled but captured nothing. The agent believes no tools were traced. If the agent uses trace data for self-correction or reporting, it operates on zero history.

---

### P-4: First Activity Bypasses All Transition Validation (from HC-4)

**Smallest mutation**: Agent calls `next_activity` with `activity_id: "final-review"` (the last activity) immediately after `start_session`, skipping all prior activities.

**Contamination path**:

1. **`decodeSessionToken()`** — Token has `act: ''` (set at session creation, session.ts:75)
2. **`validateActivityTransition(token, workflow, 'final-review')`** (validation.ts:24) — `if (!token.act) return null` — validation skipped entirely
3. **`validateTransitionCondition()`** (validation.ts:107) — `if (!token.act) return null` — validation skipped
4. **Step manifest validation** (workflow-tools.ts:122) — `if (step_manifest && token.act)` — `token.act` is empty, no validation
5. **`buildValidation()`** — All validators returned `null`, validation result is `{ status: 'valid', warnings: [] }`
6. **Token advanced** to `act: 'final-review'` — Agent is now "in" the final activity with full validation status

**Wrong behavior**: Agent skips directly to any activity with `status: 'valid'` and zero warnings. The `initialActivity` field in the workflow definition is advisory only. The server permits arbitrary activity entry on the first transition. An agent could skip required activities, miss prerequisite data gathering, and produce artifacts without the context built by earlier activities.

---

### P-5: Unvalidated Rules Propagation (from HC-5)

**Smallest mutation**: `meta/rules.toon` contains `sectons` (typo) instead of `sections`.

**Contamination path**:

1. **`readRules()`** (rules-loader.ts:43) — `decodeToon<Rules>(content)` casts successfully (runtime cast to wrong shape)
2. **`rules.sections`** — `undefined` (the property is misspelled as `sectons`)
3. **`logInfo('Rules loaded', { sectionCount: rules.sections?.length ?? 0 })`** (rules-loader.ts:44) — Logs `sectionCount: 0`. No warning emitted.
4. **`start_session` handler** (resource-tools.ts:65-66) — Returns `{ rules: rulesResult.value, ... }` where `rules.sections` is `undefined`
5. **Agent receives rules** — Sees rules object with no `sections` array. Agent proceeds without behavioral constraints.

**Wrong behavior**: `start_session` returns a rules object where `sections` is missing. The agent receives no behavioral rules despite rules being "loaded successfully." The log shows `sectionCount: 0` which looks like a legitimate empty ruleset, not a parse failure. The agent operates unconstrained.

---

### P-6: Activity Validation Fallback to Raw Object (from HC-5)

**Smallest mutation**: Activity TOON file has `version = "1.0"` (invalid semver — missing patch segment).

**Contamination path**:

1. **`safeValidateActivity(decoded)`** (activity-loader.ts:115) — Returns `{ success: false }` due to version regex failure
2. **`const activity = validation.success ? validation.data : decoded`** (activity-loader.ts:120) — Uses raw `decoded` object
3. **Zod defaults not applied** — `required` (defaults to `true`), `isDefault` on transitions (defaults to `false`), `blocking` on checkpoints (defaults to `true`) are all missing
4. **`readActivityFromWorkflow` returns** the raw object as `ActivityWithGuidance`
5. **Downstream consumers** — `getValidTransitions()` iterates `activity.transitions?.forEach(t => ...)` — transitions exist but `isDefault` is `undefined` instead of `false`
6. **`getTransitionList()`** (workflow-loader.ts:197) — Returns `isDefault: undefined` in `TransitionEntry`
7. **`validateTransitionCondition()`** (validation.ts:120) — `matchingTransition.isDefault || !matchingTransition.condition` — `undefined || !cond` evaluates correctly for most cases but loses the semantic distinction between "explicitly not default" and "unspecified"

**Wrong behavior**: Activity metadata is returned with missing default values. `logWarn` is emitted (activity-loader.ts:117) but the activity is still served. Steps missing `required: true` default appear as `required: undefined`, which downstream code may treat as optional. Checkpoint `blocking` defaults are absent. The activity appears valid to the agent but has subtly different semantics than a properly-validated activity.

---

### P-7: Working Directory Security Boundary Shift (from HC-7)

**Smallest mutation**: Start server with `cd /tmp && node /path/to/dist/index.js` instead of from the workspace root.

**Contamination path**:

1. **`validateStatePath(inputPath)`** (state-tools.ts:20) — `const root = process.cwd()` resolves to `/tmp`
2. **`save_state` with `planning_folder_path: "/tmp/attacker-controlled"`** — `resolve("/tmp/attacker-controlled")` starts with `/tmp` + sep, passes validation
3. **`writeFile(filePath, toonContent)`** (state-tools.ts:84) — Writes workflow state (potentially containing encrypted session tokens, variable values) to attacker-accessible location
4. **`restore_state` with `file_path: "/tmp/malicious-state.toon"`** — `resolve("/tmp/malicious-state.toon")` passes validation, server reads and serves crafted state

**Wrong behavior**: State files can be written to and read from any path under the process working directory instead of the workspace root. If the working directory is broad (e.g., `/home/user` or `/tmp`), the security boundary expands to encompass unrelated directories. No warning is emitted about the unexpected root path.

---

### P-8: Trace Event Loss via Parameter Name Mismatch (from HC-8)

**Smallest mutation**: A new tool is registered with `{ token: z.string() }` instead of `{ ...sessionTokenParam }` and passed to `withAuditLog` with `traceOpts`.

**Contamination path**:

1. **`appendTraceEvent()`** (logging.ts:63-64) — `params['session_token']` is `undefined` (parameter is named `token`)
2. **`if (typeof tokenStr !== 'string') return`** — Function exits silently
3. **`withAuditLog`** — Audit log still written to stderr, but trace event not captured
4. **`TraceStore`** — Missing events for this tool's invocations
5. **`get_trace`** — Returns trace with gaps: other tools' events appear but this tool's calls are invisible

**Wrong behavior**: `get_trace` returns a trace timeline with holes. The agent sees gaps in execution history — tools were called (visible in audit log on stderr) but not traced (invisible in `get_trace` response). The trace appears consistent (no errors) but incomplete.

---

### P-9: `loadSkillResources` Silent Failure on Schema Rename (from HC-9)

**Smallest mutation**: Rename `Skill.resources` to `Skill.resourceIndices` in the schema.

**Contamination path**:

1. **`loadSkillResources()`** (resource-tools.ts:17) — `(skillValue as Record<string, unknown>)['resources']` returns `undefined`
2. **`if (!Array.isArray(resources_field)) return []`** — Returns empty array
3. **`get_skills` handler** (resource-tools.ts:111) — `allResources` stays empty
4. **`get_skill` handler** (resource-tools.ts:161) — `resources` array is empty
5. **Agent receives skill** — Skill definition includes `resourceIndices: ["02", "04"]` but the response has `resources: []`

**Wrong behavior**: Skills are returned with zero associated resources despite the skill declaring them. The agent proceeds without reference materials. No error, no warning — the response shape is valid, just empty where it shouldn't be.

---

### P-10: Segment Cursor Double-Advance (from HC-3)

**Smallest mutation**: Network retry causes `next_activity` to execute twice for the same request (or agent accidentally calls it twice in sequence).

**Contamination path**:

1. **First `next_activity` call** — `getSegmentAndAdvanceCursor(sid)` returns events `[0, N)`, advances cursor to `N`
2. **Second `next_activity` call** (same `sid`, same or different `activity_id`) — `getSegmentAndAdvanceCursor(sid)` returns events `[N, M)` where `M` may equal `N` if no events were appended between calls
3. **First response's `trace_token`** — Contains segment `[0, N)` with all events
4. **Second response's `trace_token`** — Contains segment `[N, N)` — zero events, or a tiny subset

**Wrong behavior**: The agent accumulates trace tokens where later tokens may be empty or contain only the `next_activity` call itself. When `get_trace` reassembles from tokens, the timeline has a segment with all accumulated events followed by near-empty segments. The total event count is correct, but the per-segment distribution is skewed, making segment-level analysis misleading.

---

## Step 3: The Fragility Atlas

Ranked by cascade size (number of functions corrupted and breadth of wrong behavior):

| Hidden Contract | Functions Corrupted | Wrong Behavior Produced | Architectural Cause | Explicitness Cost |
|---|---|---|---|---|
| **HC-1: Crypto Key Singleton** (`crypto.ts:14`) | 14+ (every session-dependent tool handler, all token encode/decode paths, state save/restore) | All token operations fail with "signature verification failed"; saved state becomes permanently unrecoverable; agents cannot distinguish key rotation from token tampering | Module-scoped promise cache avoids repeated disk I/O; no key versioning or rotation protocol exists | Key versioning (embed key ID in tokens) adds 8-16 bytes per token; rotation protocol requires migration tooling for saved states; dependency injection of key provider replaces singleton |
| **HC-4: Session Token State Machine** (`session.ts:5-15`, `validation.ts:16-133`) | 10+ (all validation functions, every tool handler, transition/manifest validators) | First activity bypasses all transition validation; any activity reachable on first call; `initialActivity` is advisory only; agents can skip required activities with `status: 'valid'` | Validation functions use early-return-null on empty `act` for clean "first call" semantics; no explicit "session phase" concept separates pre-activity from in-activity state | Add explicit session phases (e.g., `initialized`, `active`, `completing`) to token; enforce `initialActivity` on first `next_activity`; breaks backward compatibility with existing tokens |
| **HC-5: `decodeToon<T>` Unsafe Cast** (`toon.ts:8-9`) | 8+ (rules loader, skill loader, resource loader, activity loader fallback, all downstream consumers) | Structurally invalid objects propagate with correct TypeScript types; missing fields surface as `undefined` at point-of-use, not at parse time; rules can have zero sections without warning | Generic cast provides ergonomic API; validation is caller's responsibility but not enforced; some callers validate, some don't | Require Zod schema parameter in `decodeToon<T>(content, schema)` — forces validation at call site; removes generic type parameter convenience; adds ~5 LOC per call site |
| **HC-3: TraceStore Mutable State** (`trace.ts:62-63`) | 6+ (`append`, `getSegmentAndAdvanceCursor`, `getEvents`, `next_activity`, `get_trace`, `appendTraceEvent`) | Events silently dropped if `initSession` not called; segment cursor advances destructively; double-call produces empty segments; eviction silently destroys active session history | In-process store avoids external dependency; cursor-based segments avoid re-sending events; Map-based eviction is FIFO but not LRU | External trace backend (file, DB) eliminates cursor coupling; make segments idempotent via event IDs; add `initSession` guard that auto-initializes on first `append` |
| **HC-2: Config Mutation Ordering** (`index.ts:21-22`) | 3 (`createServer`, `get_workflow` handler, `buildSchemaPreamble`) | `get_workflow` returns data without schema context; agents misinterpret TOON structures; conditions/transitions/checkpoints processed without semantic documentation | `ServerConfig` uses optional fields to allow incremental construction; mutation bridges optional→required via `ResolvedServerConfig` | Builder pattern or factory function that requires all fields; alternatively, make `buildSchemaPreamble` part of `createServer` internally — costs ~3 LOC refactor |
| **HC-7: `process.cwd()` Security Boundary** (`state-tools.ts:19-26`) | 2 (`save_state`, `restore_state`) | State files written to/read from outside intended workspace when server started from wrong directory; encrypted session tokens potentially exposed to unintended filesystem locations | Path validation uses ambient process state for simplicity; avoids threading workspace root through config | Add `workspaceRoot` to `ServerConfig` and pass to `validateStatePath`; or compute once at startup from `PROJECT_ROOT` in `config.ts`; costs 1 new config field + 2 call-site changes |
| **HC-8: `session_token` Parameter Name Contract** (`logging.ts:63`) | 1-2 per misnamed tool (trace silent skip) | Trace timeline has invisible gaps; tools appear in audit log but not in structured trace; `get_trace` returns consistent but incomplete data | String-based parameter extraction avoids type coupling between Zod schemas and trace infrastructure | Type-level enforcement via branded type or shared constant; alternatively, pass extracted token from handler to trace function; costs refactoring `withAuditLog` signature |
| **HC-9: `loadSkillResources` Dynamic Property Access** (`resource-tools.ts:15-27`) | 2 (`get_skills`, `get_skill`) | Skills returned with empty resources array despite declaring resource indices; agents proceed without reference materials | Function accepts `unknown` to avoid tight coupling to `Skill` type; re-discovers `resources` field at runtime | Accept `Skill` type directly (requires upstream validation guarantee); or use `SkillSchema.shape.resources` for type-safe extraction; costs type dependency |
| **HC-6: `artifactPrefix` Overwrite** (`workflow-loader.ts:48`, `activity-loader.ts:123-126`) | 2 (both loader paths) | TOON-specified `artifactPrefix` silently discarded; if filename convention changes, prefix computation diverges from expectation | Server-computed fields ensure consistency with filesystem naming | Document in schema as `readonly`/computed; or strip from Zod schema entirely and add post-validation; costs schema change |
| **HC-10: `activitiesDir` Consumption and Deletion** (`workflow-loader.ts:88-103`) | 1 (`loadWorkflow`) | Provenance of activity source directory is erased; debugging loaded workflows cannot determine where activities came from | Non-schema property bridges serialized→runtime forms; deletion ensures Zod compliance | Preserve as metadata outside the validated object; or add to schema as optional informational field; costs minor type change |

---

## Architectural Observations

### Conservation Laws

The fragility atlas reveals three conservation laws governing this codebase:

1. **The Validation Tax**: Every instance of removing implicit coupling (HC-1, HC-4, HC-5) requires either (a) threading a dependency through more function signatures, increasing arity and coupling breadth, or (b) adding validation gates that reject currently-accepted inputs, breaking backward compatibility. Making the key rotation explicit costs token size. Making `initialActivity` enforced breaks agents that skip activities intentionally. Making TOON decoding safe costs API ergonomics.

2. **The Statefulness Budget**: The TraceStore (HC-3) and session token (HC-4) contain the system's stateful complexity budget. Eliminating mutable shared state requires either an external store (operational complexity) or immutable event sourcing (computational complexity). The cursor-based segment model is an optimization that trades idempotency for efficiency — making segments repeatable requires event IDs and deduplication.

3. **The Trust Boundary Gradient**: The system has no sharp trust boundary. TOON files are trusted (HC-5), the filesystem path is trusted relative to `cwd` (HC-7), parameter names are trusted (HC-8), and the first tool call is trusted (HC-4). Each boundary could be hardened independently, but the aggregate cost of hardening all boundaries simultaneously would approximately double the validation code volume without changing any external behavior.

### Highest-Impact Remediation Targets

1. **HC-5 (`decodeToon` unsafe cast)**: Lowest cost, highest breadth. Adding a mandatory schema parameter to `decodeToon` would eliminate three entire poison paths (P-5, P-6, P-9) and enforce validation consistency at the type level.

2. **HC-4 (first-activity bypass)**: Adding `initialActivity` enforcement to `next_activity` when `token.act === ''` would close the transition validation gap with a single conditional check (~5 LOC).

3. **HC-3 (TraceStore `initSession` guard)**: Auto-initializing sessions on first `append` call would eliminate silent event dropping with a single `if (!this.sessions.has(sid)) this.initSession(sid)` guard (~2 LOC).
