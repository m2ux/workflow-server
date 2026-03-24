# Implementation Analysis

**Work Package:** Rename MCP Tools  
**Issue:** [#59](https://github.com/m2ux/workflow-server/issues/59)  
**Created:** 2026-03-24

---

## Current Implementation Review

### Tool Registration Architecture

The server registers 17 tools across 3 modules, all following the same pattern:

```typescript
server.tool(name, description, zodSchema, withAuditLog(name, handler))
```

| Module | Tools | Count |
|--------|-------|-------|
| `resource-tools.ts` (196 lines) | match_goal*, get_activity, start_session*, get_skills, list_skills, get_skill, list_workflow_resources, get_resource, discover_resources | 9 |
| `workflow-tools.ts` (54 lines) | list_workflows, get_workflow, validate_transition, get_workflow_activity, get_checkpoint, health_check | 6 |
| `state-tools.ts` (79 lines) | save_state, restore_state | 2 |
| **Total** | | **17** |

*\* Names shown as post-rename targets*

### Entry-Point Tools — Current State

**`get_activities` (resource-tools.ts:17-30):**
- Calls `readActivityIndex(config.workflowDir)` from `activity-loader.ts`
- Falls back to `listActivities()` on failure
- Returns `ActivityIndex` with `next_action.tool: 'get_rules'` hardcoded at `activity-loader.ts:274`
- No parameters; no session context

**`get_rules` (resource-tools.ts:45-54):**
- Calls `readRules(config.workflowDir)` from `rules-loader.ts`
- Reads `meta/rules.toon`, decodes TOON, returns `Rules` object
- No parameters; no session context
- No test coverage

### Activity Index Builder — `readActivityIndex()`

Located at `activity-loader.ts:229-283`. Builds the index dynamically:

1. `listActivities()` discovers all `.toon` files across all workflow directories
2. For each activity, loads and validates via Zod, extracts `recognition` → `quick_match`
3. Returns `ActivityIndex` with hardcoded references:
   - `usage: 'Call the tool in next_action first (get_rules)...'` (line 272)
   - `next_action: { tool: 'get_rules', parameters: {} }` (lines 273-275)

Both string references need updating to `start_session`.

### State Management — save_state / restore_state

**State schema (`state.schema.ts`, 165 lines):**
- `WorkflowState` has a `variables: z.record(z.unknown())` field — arbitrary key-value pairs
- `StateSaveFile` wraps `WorkflowState` with metadata: `id`, `savedAt`, `description`, `workflowId`, `workflowVersion`, `planningFolder`
- `NestedWorkflowStateSchema` extends state to support nested child workflow states

**save_state (`state-tools.ts:18-61`):**
- Accepts `state` (JSON string), `planning_folder_path`, optional `description`
- Validates against `NestedWorkflowStateSchema`
- Writes to `{planning_folder_path}/workflow-state.toon` via TOON encoder
- Does not modify the state — writes exactly what the caller provides

**restore_state (`state-tools.ts:63-78`):**
- Reads from a file path, decodes TOON, validates against `StateSaveFileSchema`
- Returns the full state object for resumption

**Session token integration path:** The `variables` field can hold `session_token` naturally. When the orchestrator saves state, the token persists automatically. No schema changes needed for basic persistence. However, the new requirement that `start_session` writes the token to the state file would require `start_session` to either:
- (a) Accept a `planning_folder_path` parameter and write to the state file directly, or
- (b) Return the token and rely on the orchestrator to call `save_state` (current pattern)

Option (b) preserves the existing separation of concerns. Option (a) couples session creation with state persistence.

### Audit Logging — withAuditLog

`logging.ts:8-20`: Higher-order function wrapping every tool handler. Logs:
- `timestamp`, `tool` (name), `parameters` (full param record), `result` (success/error), `duration_ms`

Since `session_token` will be a regular tool parameter, it automatically appears in audit logs under `parameters.session_token`. No changes to the wrapper needed.

### discover_resources Tool

`resource-tools.ts:144-195`: Returns discovery payload including:
- `activities: { tool: 'get_activities', description: '...' }` (line 155) — must change to `match_goal`
- Lists all workflows, resources, and skills

---

## Effectiveness Evaluation

### What Works Well

1. **Consistent registration pattern**: Every tool follows the same `server.tool(name, desc, schema, withAuditLog(name, handler))` pattern. Adding `session_token` to parameter schemas is mechanical.
2. **Audit logging is automatic**: The `withAuditLog` wrapper logs all parameters, so session_token will appear in logs without wrapper changes.
3. **State persistence is flexible**: `variables: z.record(z.unknown())` can hold any key-value pair, including session tokens.
4. **TOON round-trip is tested**: The state-persistence tests verify encode/decode fidelity.

### Current Gaps

1. **No session concept**: No tool produces or consumes a session identifier. Every call is independent.
2. **No test for `get_rules`**: Zero test coverage for the tool being replaced by `start_session`.
3. **Hardcoded cross-tool references**: The activity index builder hardcodes `get_rules` as a string in `next_action`. Tool name changes require source code updates, not configuration.
4. **discover_resources hardcodes tool names**: The discovery payload uses string literals for tool names.
5. **Tool parameter schemas have no shared base**: Each tool defines its own parameters independently. Adding `session_token` to 14 tools requires 14 separate schema modifications (no shared parameter mixin).

---

## Baseline Metrics

| Metric | Current Value | Measurement Method |
|--------|--------------|-------------------|
| Total tests | 101 (across 8 test files) | `npm test` |
| Tests passing | 101/101 (100%) | `npm test` exit code |
| Test duration | 1.33s | `npm test` output |
| `get_activities` tests | 1 test | `mcp-server.test.ts:170-181` |
| `get_rules` tests | 0 tests | grep for `get_rules` in test files |
| `discover_resources` tests | 0 tests | grep in test files |
| State persistence tests | 10 tests | `state-persistence.test.ts` (297 lines) |
| Source lines (tools/) | 332 lines | `wc -l src/tools/*.ts` |
| Source lines (total affected) | ~2,229 lines | `wc -l` across src/tools/, src/loaders/, src/schema/ |
| Tool count | 17 | `server.tool()` registrations |
| Old name references (source) | ~15 | grep across src/ |
| Old name references (docs) | ~12 | grep across docs/, README, SETUP |
| Old name references (.toon) | 17 | grep across workflows/ |
| Old name references (total) | ~44 | sum of above |

### Tool Parameter Schema Inventory

| Tool | Current Params | Needs session_token |
|------|---------------|-------------------|
| match_goal (was get_activities) | `{}` | No (entry point) |
| get_activity | `{ activity_id }` | Yes |
| start_session (was get_rules) | `{}` | No (creates token) |
| get_skills | `{}` | Yes |
| list_skills | `{ workflow_id? }` | Yes |
| get_skill | `{ skill_id, workflow_id? }` | Yes |
| list_workflow_resources | `{ workflow_id }` | Yes |
| get_resource | `{ workflow_id, index }` | Yes |
| discover_resources | `{}` | Yes |
| list_workflows | `{}` | Yes |
| get_workflow | `{ workflow_id }` | Yes |
| validate_transition | `{ workflow_id, from_activity, to_activity }` | Yes |
| get_workflow_activity | `{ workflow_id, activity_id }` | Yes |
| get_checkpoint | `{ workflow_id, activity_id, checkpoint_id }` | Yes |
| health_check | `{}` | No (server probe) |
| save_state | `{ state, planning_folder_path, description? }` | Yes |
| restore_state | `{ file_path }` | Yes |

**Summary**: 14 tools need `session_token` added as a required parameter.

---

## Implementation Strategy Notes

### Session Token Generator

New utility function needed:

```typescript
function generateSessionToken(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  return `wfs_${timestamp}_${uuid}`;
}
```

### Session Token Validator

Format validation regex for use in tool handlers:

```typescript
const SESSION_TOKEN_PATTERN = /^wfs_\d+_[0-9a-f]{8}$/;

function validateSessionToken(token: string): boolean {
  return SESSION_TOKEN_PATTERN.test(token);
}
```

### Shared Session Token Parameter

To avoid repeating the schema 14 times, define a shared Zod schema:

```typescript
const sessionTokenParam = {
  session_token: z.string()
    .regex(/^wfs_\d+_[0-9a-f]{8}$/, 'Invalid session token format')
    .describe('Session token from start_session')
};
```

Then spread into each tool's parameter schema: `{ ...sessionTokenParam, workflow_id: z.string() }`.

### start_session Response Shape

```typescript
{
  rules: Rules,
  session: {
    token: string,       // wfs_<timestamp>_<uuid8>
    created_at: string,  // ISO 8601
    server_version: string
  }
}
```

### State File Integration

The session token can be stored in `WorkflowState.variables.session_token` by the orchestrator. When `save_state` is called, it persists automatically. When `restore_state` is called, it's available in the restored state. No schema changes needed — the `variables` field is `z.record(z.unknown())`.

---

## Assumptions from Analysis

| # | Category | Assumption | Resolvability | Status |
|---|----------|-----------|---------------|--------|
| A-IA-1 | Current Behavior | The `withAuditLog` wrapper doesn't need changes for session logging | Code-analyzable | Validated — logs all parameters automatically |
| A-IA-2 | Dependency Understanding | No Zod schema changes needed for state persistence of session tokens | Code-analyzable | Validated — `variables` is `z.record(z.unknown())` |
| A-IA-3 | Gap Identification | A shared `sessionTokenParam` can be spread into tool schemas without type conflicts | Code-analyzable | Validated — Zod's `z.object()` accepts spread for composition |
| A-IA-4 | Current Behavior | `start_session` should return token + rules, not write to state file directly | Stakeholder-dependent | Open — user said "stored in state file" but the existing pattern is for orchestrators to call `save_state`. Needs clarification: does `start_session` accept a `planning_folder_path` and write directly, or does the orchestrator handle persistence? |
| A-IA-5 | Current Behavior | `crypto.randomUUID()` is available in the Node.js runtime | Code-analyzable | Validated — available since Node.js 19+ and this project targets Node.js 18+ (with `--experimental-global-webcrypto` flag or `node:crypto` import) |

---

## Success Criteria Linkage

| Requirement | Gap | Success Criterion | Baseline |
|-------------|-----|-------------------|----------|
| R1: match_goal | Tool named `get_activities` | SC-1: match_goal callable, returns updated ActivityIndex | 1 test exists (needs rename) |
| R2: start_session | Tool named `get_rules`, no session token | SC-2: start_session returns rules + session | 0 tests exist |
| R3: session_token required | No tools accept session_token | SC-3: 14 tools reject calls without valid token | 0 tests exist |
| R3: token format | No token generator | SC-4: Token matches `wfs_\d+_[0-9a-f]{8}` | N/A (new) |
| R3: audit correlation | session_token not in logs | SC-5: Audit logs include session_token | Automatic via withAuditLog |
| R4: .toon updates | 17 old-name references | SC-7: Zero old-name references in .toon | 17 references |
| R5: doc updates | ~12 old-name references in docs | SC-6: Zero old-name references in source/docs | ~15+12 references |
