---
target: /home/mike/dev/workflow-server/src/
analysis_date: 2026-03-28
lens: error-resilience
---

# Behavioral Lens: Error Boundaries

Analysis of every catch, wrap, transform, and silence of failure across the workflow-server TypeScript codebase, tracing destroyed context through downstream decision branches to user-visible harm.

---

## Step 1: The Error Boundaries

### EB-01 — `main()` startup catch-all

**Location**: `src/index.ts:27–30`

```typescript
} catch (error) {
  logError('Failed to start server', error instanceof Error ? error : undefined);
  process.exit(1);
}
```

**Preserved**: `error.message`, `error.stack` (via `logError` → stderr JSON).

**Destroyed**: Error subclass identity (`WorkflowNotFoundError.workflowId`, `WorkflowValidationError.issues[]`, `RulesNotFoundError` vs permission error). The `instanceof Error` gate converts non-Error thrown values to `undefined`, losing the value entirely. `process.exit(1)` destroys in-flight async state, open file handles, and partial write buffers.

---

### EB-02 — `loadOrCreateKey()` race-condition fallback without validation

**Location**: `src/utils/crypto.ts:32–49`

```typescript
} catch (writeErr: unknown) {
  if (writeErr instanceof Error && 'code' in writeErr && (writeErr as NodeJS.ErrnoException).code === 'EEXIST') {
    return readFile(KEY_FILE);  // line 42 — no length check
  }
  throw writeErr;
}
```

**Preserved**: Detection of EEXIST race condition; original error rethrown for non-EEXIST.

**Destroyed**: Key length validation. The initial read path (line 28) validates `key.length !== KEY_LENGTH`, but the EEXIST fallback at line 42 calls `readFile(KEY_FILE)` without the same check. A partially-written key file (concurrent write in progress) is returned as-is. The `Buffer` length, the write progress of the competing process, and the key integrity guarantee are all destroyed.

---

### EB-03 — `getOrCreateServerKey()` promise cache reset on error

**Location**: `src/utils/crypto.ts:17–22`

```typescript
keyPromise = loadOrCreateKey().catch((err) => {
  keyPromise = null;
  throw err;
});
```

**Preserved**: Original error rethrown to caller.

**Destroyed**: The fact that a key load attempt occurred and failed. `keyPromise` resets to `null`, so the next caller retries from scratch. If the underlying cause is persistent (corrupt key file, permission denied), each caller independently re-discovers the failure — no circuit breaker, no accumulated retry count, no backoff state.

---

### EB-04 — Session token `decode()` inner re-wrapping

**Location**: `src/utils/session.ts:57–69`

```typescript
try {
  const json = Buffer.from(b64, 'base64url').toString('utf8');
  const parsed = JSON.parse(json);
  const result = SessionPayloadSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Missing or invalid token fields: ${issues}`);
  }
  return result.data;
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  throw new Error(`Invalid session token: ${msg}`);
}
```

**Preserved**: Error message string embedded in a new wrapper.

**Destroyed**: Original error class (JSON `SyntaxError` position data, Zod `ZodError.issues[]` array with path/code/expected/received fields, original stack trace). The outer `catch` wraps *everything* — including the already-wrapped Zod error from line 62 — so a Zod failure is double-wrapped: `"Invalid session token: Missing or invalid token fields: wf: Required"`. The original Zod issue's `code`, `expected`, `received`, and `path` array are flattened to a display string.

---

### EB-05 — `loadActivitiesFromDir()` per-file catch-and-skip

**Location**: `src/loaders/workflow-loader.ts:38–52`

```typescript
try {
  const content = await readFile(join(activitiesPath, file), 'utf-8');
  const decoded = decodeToon<Activity>(content);
  const validation = safeValidateActivity(decoded);
  if (!validation.success) {
    logWarn('Skipping invalid activity', { activityId: parsed.id, errors: validation.error.issues });
    continue;
  }
  // ...
} catch (error) {
  logWarn('Failed to load activity', { file, error: error instanceof Error ? error.message : 'Unknown error' });
}
```

**Preserved**: File name and error message in stderr log.

**Destroyed**: The TOON decode error position (byte offset, line/column), file content that failed, the relationship between this file and its parent workflow, the error type (TOON syntax error vs. filesystem error vs. encoding error). The activity is silently omitted from the workflow's activities array. The count of loaded activities vs. expected activities is never compared.

---

### EB-06 — `loadWorkflow()` outer catch reclassifies all errors as validation failures

**Location**: `src/loaders/workflow-loader.ts:113–116`

```typescript
} catch (error) {
  logError('Failed to load workflow', error instanceof Error ? error : undefined, { workflowId });
  return err(new WorkflowValidationError(workflowId, [error instanceof Error ? error.message : 'Unknown error']));
}
```

**Preserved**: Error message string.

**Destroyed**: Error class distinction. A filesystem `EACCES` permission error, a TOON syntax error, a `decodeToon` crash, and a genuine validation failure all become `WorkflowValidationError`. The original error's `code` field (for `ErrnoException`), the TOON decode position, and the stack trace are all destroyed. The `issues[]` array always contains exactly one string, losing the structured issue format that Zod provides.

---

### EB-07 — `listWorkflows()` inner per-workflow catch → silently omit

**Location**: `src/loaders/workflow-loader.ts:140–148`

```typescript
try {
  const content = await readFile(toonPath, 'utf-8');
  const raw = decodeToon<RawWorkflow>(content);
  if (raw.id && raw.title && raw.version) {
    manifests.push({ ... });
  }
} catch (error) {
  logWarn('Failed to read workflow manifest', { path: toonPath, error: error instanceof Error ? error.message : String(error) });
}
```

**Preserved**: File path and error message in log.

**Destroyed**: The workflow is silently omitted from the listing. The falsy guard `raw.id && raw.title && raw.version` (line 143) also silently omits workflows where any of these fields is empty string, `0`, or `false` — conflating "field present but empty" with "field absent".

---

### EB-08 — `listWorkflows()` outer catch → return empty array

**Location**: `src/loaders/workflow-loader.ts:153–156`

```typescript
} catch (error) {
  logWarn('Failed to list workflows', { workflowDir, error: ... });
  return [];
}
```

**Preserved**: workflowDir path and error message in log.

**Destroyed**: Everything downstream sees an empty array — indistinguishable from "no workflows exist." The `help` tool (workflow-tools.ts:29) calls `listWorkflows` and includes the result in `available_workflows`. An empty array here means the bootstrap guide shows zero available workflows, sending the agent into a dead end.

---

### EB-09 — Bare `catch {}` pattern (12 instances across loaders)

**Locations** (all return empty array or null, destroying entire error):
| # | File | Line | Function | Returns |
|---|------|------|----------|---------|
| 1 | `activity-loader.ts` | 50–52 | `findWorkflowsWithActivities()` | `[]` |
| 2 | `activity-loader.ts` | 194–196 | `listActivitiesFromWorkflow()` | `[]` |
| 3 | `activity-loader.ts` | 268 | `readActivityIndex()` inner loop | skip |
| 4 | `skill-loader.ts` | 33–35 | `findSkillFile()` | `null` |
| 5 | `skill-loader.ts` | 66–68 | `findWorkflowsWithSkills()` | `[]` |
| 6 | `skill-loader.ts` | 147–149 | `listUniversalSkills()` | `[]` |
| 7 | `skill-loader.ts` | 172–174 | `listWorkflowSkills()` | `[]` |
| 8 | `skill-loader.ts` | 198–199 | `listSkills()` inner | skip |
| 9 | `skill-loader.ts` | 282–283 | `readSkillIndex()` inner | skip |
| 10 | `resource-loader.ts` | 213–215 | `listResources()` | `[]` |
| 11 | `resource-loader.ts` | 301–303 | `listWorkflowsWithResources()` | `[]` |
| 12 | `rules-loader.ts` | 66–67 | `readRulesRaw()` | `RulesNotFoundError` |
| 13 | `schema-preamble.ts` | 16–17 | `buildSchemaPreamble()` header | `''` |

**Preserved**: Nothing — bare `catch {}` blocks.

**Destroyed**: Error type, error message, stack trace, filesystem error code (`EACCES`, `ENOENT`, `EMFILE`), the directory or file path that caused the failure, timing information. Every one of these returns a "success" result (empty array, null, or fallback value) making the failure completely invisible to callers.

---

### EB-10 — `readResource()` / `readResourceRaw()` catch → ResourceNotFoundError

**Location**: `src/loaders/resource-loader.ts:118–122` and `170–175`

**Preserved**: Error logged (logError or logWarn).

**Destroyed**: Error type reclassified. A TOON parse failure, filesystem permission error, or encoding error becomes `ResourceNotFoundError`. The resource file physically exists on disk but the error says "not found."

---

### EB-11 — `readRules()` parse error → RulesNotFoundError

**Location**: `src/loaders/rules-loader.ts:46–48`

```typescript
} catch (error) {
  logWarn('Rules parse error', { path: rulesPath, error: String(error) });
  return err(new RulesNotFoundError());
}
```

**Preserved**: Error stringified in log.

**Destroyed**: Error class. The file exists (it passed the `existsSync` check at line 37) but the error claims "not found". `RulesNotFoundError` constructor takes no arguments — no path, no parse position, no cause chain.

---

### EB-12 — Activity validation bypass in `readActivityFromWorkflow()`

**Location**: `src/loaders/activity-loader.ts:115–120`

```typescript
const validation = safeValidateActivity(decoded);
if (!validation.success) {
  logWarn('Activity validation failed, using raw content', { activityId, workflowId, errors: validation.error.issues });
}
const activity = validation.success ? validation.data : decoded;
```

**Preserved**: Validation issues logged.

**Destroyed**: Type safety. When validation fails, the raw `decoded` object (typed as `Activity` via `decodeToon<Activity>` unsafe cast) is used directly. Missing required fields (`skills.primary`, `id`, `version`, `name`) will exist as `undefined` at runtime despite the type system claiming they're `string`. The Zod `default()` transforms (e.g., `required: z.boolean().default(true)`) are also skipped — defaults not applied.

---

### EB-13 — `restore_state` decrypt bare catch

**Location**: `src/tools/state-tools.ts:127–134`

```typescript
try {
  const key = await getOrCreateServerKey();
  restored.state.variables[SESSION_TOKEN_KEY] = decryptToken(...);
} catch {
  throw new Error(
    'Failed to decrypt session token from saved state. This typically occurs when the server key has been rotated ...',
  );
}
```

**Preserved**: Nothing from original error.

**Destroyed**: The crypto error type (`ERR_OSSL_EVP_UNABLE_TO_DECRYPT`, auth tag mismatch, IV length error, malformed ciphertext). Replaced with a diagnostic guess ("server key has been rotated") that may be wrong — the actual cause could be file corruption, manual editing of the state file, encoding issues, or a truncated save.

---

### EB-14 — `appendTraceEvent()` silent return on missing token

**Location**: `src/logging.ts:63–64`

```typescript
const tokenStr = params['session_token'];
if (typeof tokenStr !== 'string') return;
```

**Preserved**: Nothing.

**Destroyed**: The fact that a tool call occurred without a session token. No log, no trace event. Creates an invisible gap in the execution trace.

---

### EB-15 — `TraceStore.append()` silent event drop

**Location**: `src/trace.ts:85–87`

```typescript
append(sid: string, event: TraceEvent): void {
  const events = this.sessions.get(sid);
  if (events) events.push(event);
}
```

**Preserved**: Nothing.

**Destroyed**: The entire trace event if the session was never initialized or was evicted. No log, no error, no return value indicating failure.

---

### EB-16 — `TraceStore.initSession()` silent eviction

**Location**: `src/trace.ts:71–77`

```typescript
if (this.sessions.size >= this.maxSessions) {
  const oldest = this.sessions.keys().next().value;
  if (oldest !== undefined) {
    this.sessions.delete(oldest);
    this.cursors.delete(oldest);
  }
}
```

**Preserved**: Nothing.

**Destroyed**: All trace events for the evicted session. Session ID. The eviction fact itself — no log, no callback, no eviction count metric. The oldest session's owner (if calling `get_trace` later) gets empty results with no explanation.

---

### EB-17 — `decodeToon<T>()` unsafe generic cast

**Location**: `src/utils/toon.ts:8–9`

```typescript
export function decodeToon<T = unknown>(content: string): T {
  return decode(content) as T;
}
```

**Preserved**: The decoded JavaScript value.

**Destroyed**: Any runtime type guarantee. The generic `T` is a compile-time fiction — at runtime, the value could be any valid TOON structure. Callers like `decodeToon<Activity>(content)` receive an `unknown` object wearing an `Activity` mask. Field access on missing properties returns `undefined` instead of throwing, enabling silent propagation of structurally invalid data.

---

### EB-18 — `envOrDefault()` empty-string coercion

**Location**: `src/config.ts:23–26`

```typescript
function envOrDefault(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}
```

**Preserved**: The fallback value.

**Destroyed**: The distinction between "environment variable not set" and "environment variable explicitly set to empty string." Both resolve to the fallback. A deliberate `WORKFLOW_DIR=""` (meaning current directory) is silently overridden to `'./workflows'`.

---

### EB-19 — `validateActivityTransition()` empty-transitions bypass

**Location**: `src/utils/validation.ts:24–28`

```typescript
export function validateActivityTransition(token: SessionPayload, workflow: Workflow, activityId: string): string | null {
  if (!token.act) return null;
  if (token.act === activityId) return null;
  const valid = getValidTransitions(workflow, token.act);
  if (valid.length === 0) return null;  // <-- unrestricted navigation
```

**Preserved**: The "no transitions" fact (by returning null = valid).

**Destroyed**: The structural constraint that transitions should be explicit. An activity with an empty transitions array (common when the activity is terminal or when the author forgot to define transitions) allows navigation to any other activity. The distinction between "terminal activity" and "unconstrained activity" is collapsed.

---

### EB-20 — `validateSkillAssociation()` cascading null-guards

**Location**: `src/utils/validation.ts:36–52`

```typescript
export function validateSkillAssociation(workflow: Workflow, activityId: string, skillId: string): string | null {
  if (!activityId) return null;     // empty activityId = valid
  const activity = getActivity(workflow, activityId);
  if (!activity) return null;       // missing activity = valid
  const { skills } = activity;
  if (!skills) return null;         // no skills declared = valid
```

**Preserved**: Nothing — each guard returns null (valid).

**Destroyed**: Three distinct error conditions are all treated as "valid": (1) empty activity ID in token (session state corruption), (2) activity not found in workflow (stale session or workflow mutation), (3) activity with no skills (schema violation since `skills` is required). Each should produce a different warning or error, but all produce no signal.

---

### EB-21 — `loadSkillResources()` silent resource omission

**Location**: `src/tools/resource-tools.ts:15–27`

```typescript
async function loadSkillResources(workflowDir: string, workflowId: string, skillValue: unknown): Promise<StructuredResource[]> {
  // ...
  for (const idx of skillResources) {
    const result = await readResourceStructured(workflowDir, workflowId, idx);
    if (result.success) resources.push(result.value);
    // else: silently omitted
  }
  return resources;
}
```

**Preserved**: Successfully loaded resources.

**Destroyed**: Which resource indices failed, why they failed (`ResourceNotFoundError` or deeper filesystem error), the count of expected vs. loaded resources. The caller (`get_skills`, `get_skill`) receives a partial resource array with no indication anything is missing.

---

### EB-22 — `next_activity` condition validation skip

**Location**: `src/tools/workflow-tools.ts:129–131`

```typescript
const condWarning = (transition_condition !== undefined && token.act)
  ? validateTransitionCondition(token, result.value, activity_id, transition_condition)
  : null;
```

**Preserved**: Validation runs when condition is explicitly provided.

**Destroyed**: When `transition_condition` is `undefined` (Zod `.optional()` allows this), condition validation is entirely skipped — even when the workflow defines mandatory conditions for this transition. The agent can navigate without declaring why, and no warning is emitted about the missing condition claim.

---

### EB-23 — `evaluateSimpleCondition()` silent type mismatch

**Location**: `src/schema/condition.schema.ts:60–70`

```typescript
case '>': return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value;
case '<': return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value;
```

**Preserved**: Returns a boolean (`false`).

**Destroyed**: The semantic intent of the comparison. When a variable holds string `"5"` (from TOON decode, which doesn't distinguish numeric strings from numbers) and is compared to number `3`, the type guard `typeof value === 'number'` fails and the operator returns `false`. No type mismatch signal, no coercion attempt. The wrong branch is taken silently.

---

### EB-24 — `get_trace` per-token error accumulation

**Location**: `src/tools/workflow-tools.ts:243–249`

```typescript
for (const tt of trace_tokens) {
  try {
    const payload = await decodeTraceToken(tt);
    allEvents.push(...payload.events);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }
}
```

**Preserved**: Error messages in `token_errors` array.

**Destroyed**: Error type, which specific token (by index or content prefix) failed, the token's session context (sid, act), original stack traces. The trace result includes events from successful tokens mixed with error messages for failed ones, with no way to identify which activity transitions are missing.

---

## Step 2: The Missing Context

### Trace A: Bare catch → empty array → "no workflows available" (EB-08 → EB-09)

1. **Origin**: `listWorkflows()` encounters `EACCES` on workflow directory (bare `catch {}` at `workflow-loader.ts:153–156`).
2. **Destroyed datum**: Filesystem error code `EACCES`, directory path, error message.
3. **Propagation**: Returns `[]`.
4. **Decision branch**: `help` tool handler (`workflow-tools.ts:29`) calls `listWorkflows(config.workflowDir)` → receives `[]` → includes `available_workflows: []` in guide response.
5. **Wrong branch taken**: Agent receives bootstrap guide showing zero available workflows. Agent concludes server has no workflows configured.
6. **User-visible harm**: Agent reports "no workflows are available" to user. User may reconfigure server, reinstall, or recreate workflow files. **Correct diagnosis** (permission denied) is never surfaced — not in the tool response, not in any error message the agent sees. The stderr log contains the truth but agents don't read stderr.

### Trace B: Activity silently skipped → "activity not found" → wrong remediation (EB-05 → EB-06)

1. **Origin**: Activity file `05-review.toon` has TOON syntax error. `loadActivitiesFromDir()` (`workflow-loader.ts:50–51`) logs warning, `continue`s.
2. **Destroyed datum**: Activity file existence, parse error position, content.
3. **Propagation**: Workflow loaded with 4/5 activities. `WorkflowSchema.parse()` passes (`.min(1)` satisfied).
4. **Decision branch**: Agent calls `next_activity` with `activity_id: "review"`. `getActivity()` returns `undefined`. Handler throws `Error('Activity not found: review')` (`workflow-tools.ts:119`).
5. **Wrong branch taken**: Agent receives "activity not found". Attempts to call `list_workflows` or `get_workflow` to find the correct activity ID. The activity ID is correct — the file exists — but its TOON content is malformed.
6. **User-visible harm**: Agent cannot advance workflow. May report the workflow is misconfigured or the activity was removed. **Correct fix**: edit `05-review.toon` to fix TOON syntax. No error message guides toward this fix.

### Trace C: Validation bypass → undefined skill reference → cascading not-found (EB-12)

1. **Origin**: Activity file decoded but Zod validation fails (e.g., `skills` field is `{primary_skill: "foo"}` instead of `{primary: "foo"}`).
2. **Destroyed datum**: Zod issue detailing `skills.primary: Required`.
3. **Propagation**: `readActivityFromWorkflow()` uses raw decoded content (`activity-loader.ts:120`). `activity.skills.primary` is `undefined`.
4. **Decision branch**: `ActivityWithGuidance.next_action.parameters.skill_id` is `undefined` (line 131). Agent calls `get_skill` with `skill_id: undefined`.
5. **Wrong branch taken**: `readSkill()` searches for skill with ID `undefined` → not found → `SkillNotFoundError('undefined')`.
6. **User-visible harm**: Agent sees "Skill not found: undefined". This appears to be a server bug or missing skill, not an activity schema error. **Correct fix**: rename `primary_skill` to `primary` in the activity TOON file. The "undefined" in the error message is the only clue, and it requires knowing the internal plumbing to interpret.

### Trace D: Rules parse error → "not found" → session startup blocked (EB-11)

1. **Origin**: `meta/rules.toon` exists but has TOON syntax error. `readRules()` catch block (`rules-loader.ts:46–48`) returns `RulesNotFoundError`.
2. **Destroyed datum**: Parse error details, file existence (existsSync passed), file content.
3. **Propagation**: `start_session` handler (`resource-tools.ts:44–45`): `if (!rulesResult.success) throw rulesResult.error`.
4. **Decision branch**: Agent receives `Error: Global rules not found`.
5. **Wrong branch taken**: Agent (or user) attempts to create the rules file or check the file path. The file exists — it's the content that's invalid.
6. **User-visible harm**: No workflow session can be started. Error message leads to wrong remediation. Every agent interaction is blocked at the bootstrap step.

### Trace E: Race-condition key → HMAC mismatch → "invalid session token" (EB-02)

1. **Origin**: Two server processes start concurrently. Second process reads partially-written key file (32-byte key with only N bytes written so far). Key cached in `keyPromise`.
2. **Destroyed datum**: Key length validation (not applied on EEXIST path).
3. **Propagation**: Process 2 signs session tokens with truncated key. Process 1 (or Process 2 after restart with correct key) cannot verify these tokens.
4. **Decision branch**: `hmacVerify()` returns `false`. Session `decode()` throws `"Invalid session token: signature verification failed"`.
5. **Wrong branch taken**: Every subsequent tool call fails with "invalid session token". Agent may attempt to start a new session, which works (new token signed with correct key on retry), but previously-saved state files with the old token are permanently unrecoverable.
6. **User-visible harm**: Intermittent session failures on multi-instance deployments. Saved workflow state (`save_state`) becomes permanently unrestorable because the encrypted session token inside was signed with the truncated key. Error message blames the token, not the key.

### Trace F: Empty transitions → unrestricted navigation → workflow fidelity violation (EB-19)

1. **Origin**: Activity `planning` has no `transitions` array (author intended it as a terminal activity, or forgot to add transitions).
2. **Destroyed datum**: The "terminal activity" semantic — collapsed into "no constraints."
3. **Propagation**: `getValidTransitions()` returns `[]`. `validateActivityTransition()` returns `null` (no warning).
4. **Decision branch**: Agent calls `next_activity` from `planning` to any activity ID. No validation warning generated.
5. **Wrong branch taken**: Agent skips required intermediate activities, jumps to final activity. Workflow executes out of order.
6. **User-visible harm**: Workflow outcomes are incomplete — steps are missed, artifacts not generated, quality gates bypassed. The session completes "successfully" with no warnings despite violating the workflow's intended sequence.

### Trace G: Type mismatch in condition evaluation → wrong branch → incorrect workflow path (EB-23)

1. **Origin**: TOON decode produces `variables.reviewCount = "3"` (string, not number). Workflow condition: `reviewCount > 0`.
2. **Destroyed datum**: Type mismatch signal (string vs number comparison).
3. **Propagation**: `evaluateSimpleCondition()` returns `false` (typeof "3" !== 'number').
4. **Decision branch**: Transition with this condition is not taken. Default branch (or no branch) executes.
5. **Wrong branch taken**: Activity with condition `reviewCount > 0` is skipped despite 3 reviews having occurred. Agent proceeds to a "no reviews" path.
6. **User-visible harm**: Workflow skips review-dependent activities. Output artifacts miss review-related content. No error, no warning — the condition simply evaluated to false.

### Trace H: Silent resource omission → partial skill context → degraded agent behavior (EB-21)

1. **Origin**: Skill declares `resources: ["02", "04", "08"]`. Resource `04` has TOON parse error.
2. **Destroyed datum**: Resource index `04` failure, parse error details.
3. **Propagation**: `loadSkillResources()` returns 2 of 3 resources. `get_skills` response includes partial resources array.
4. **Decision branch**: Agent receives skill with incomplete guidance. Missing resource may contain critical protocol steps, constraints, or templates.
5. **Wrong branch taken**: Agent executes skill without the missing resource's constraints. May produce non-compliant artifacts.
6. **User-visible harm**: Agent completes activity but violates resource-defined constraints (style guides, templates, validation rules). Output quality degrades with no indication that guidance was incomplete.

### Trace I: `restore_state` misdiagnosed decrypt error → wrong remediation (EB-13)

1. **Origin**: Saved state file has corrupted ciphertext (e.g., file manually edited, truncated during save).
2. **Destroyed datum**: Crypto error type (`ERR_OSSL_EVP_UNABLE_TO_AUTHENTICATE_DATA`), error message.
3. **Propagation**: Bare `catch {}` throws new Error about "server key has been rotated."
4. **Decision branch**: Agent receives key-rotation diagnosis.
5. **Wrong branch taken**: User deletes `~/.workflow-server/secret` to "reset" the key, making ALL previously saved states permanently unrecoverable.
6. **User-visible harm**: Destructive remediation. The actual fix (re-save the state from the running session) is not suggested. Deleting the key makes things worse.

### Trace J: `appendTraceEvent()` token decode failure → trace gap → incorrect audit trail (EB-14, EB-15)

1. **Origin**: `session_token` parameter is malformed or missing from a tool call.
2. **Destroyed datum**: The tool call occurrence, parameters, timing, result.
3. **Propagation**: `appendTraceEvent()` silently returns (line 64 or catch at line 78–80). No trace event recorded.
4. **Decision branch**: `get_trace` returns event array with gap. `next_activity` generates trace_token from `getSegmentAndAdvanceCursor()` — missing events.
5. **Wrong branch taken**: Audit/debugging assumes the missing tool call never happened.
6. **User-visible harm**: Trace-based debugging draws wrong conclusions. A tool call that actually caused a state change has no trace record.

---

## Step 3: The Impossible Fix

### Most Information-Destroying Boundary

**EB-09: Bare `catch {}` across 13 loader functions** — collectively destroys all error type, message, stack, filesystem code, and directory context across the entire loader layer, making every filesystem and parse failure invisible to callers.

### Fix A: Preserve error details via Result types

Replace all bare `catch {}` with typed error propagation:

```typescript
// Before:
async function listActivitiesFromWorkflow(workflowDir: string, workflowId: string): Promise<ActivityEntry[]> {
  // ...
  try { /* ... */ } catch { return []; }
}

// After (Fix A):
async function listActivitiesFromWorkflow(
  workflowDir: string, workflowId: string
): Promise<Result<ActivityEntry[], Error>> {
  try { /* ... */ }
  catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
```

**What Fix A preserves**: Error type, message, stack, filesystem code. Every caller can inspect the failure and decide how to handle it.

**What Fix A destroys**:
- **API ergonomics**: Every caller must unwrap `Result<T[], E>` instead of using a plain array. Call chains like `listActivities() → listActivitiesFromWorkflow()` become nested Result unwrapping.
- **Partial-result semantics**: Current design returns "whatever loaded successfully." Fix A forces an all-or-nothing choice: either propagate the first error (losing successful loads) or return a compound `{ items: T[], errors: E[] }` (complex API surface).
- **Caller simplicity**: 15+ call sites must add error handling branches.

### Fix B: Preserve API simplicity via error accumulator

Keep return types unchanged but accumulate errors in a shared diagnostics channel:

```typescript
// Before:
async function listActivitiesFromWorkflow(...): Promise<ActivityEntry[]> {
  try { /* ... */ } catch { return []; }
}

// After (Fix B):
async function listActivitiesFromWorkflow(
  ..., diagnostics?: DiagnosticAccumulator
): Promise<ActivityEntry[]> {
  try { /* ... */ }
  catch (error) {
    diagnostics?.add('listActivitiesFromWorkflow', error);
    return [];
  }
}
```

**What Fix B preserves**: API shape (return types unchanged). Callers that don't care about errors pass no accumulator. Callers that do can inspect diagnostics.

**What Fix B destroys**:
- **Error locality**: Errors accumulated in a flat list lose their call-site nesting (which function called which). A `readdir` error in `listActivitiesFromWorkflow` and a TOON parse error in `readActivityIndex` appear at the same level.
- **Error-to-result binding**: No way to know which successfully-returned items correspond to which error-free paths. If 3 of 5 activities loaded, you know 2 failed, but not which 2 without correlating IDs.
- **Mandatory participation**: The accumulator is optional. New code can still write bare `catch {}` without compiler enforcement.

### Structural Invariant

| Boundary | Destroyed | Wrong Decision | Harm | Fix A Destroys | Fix B Destroys | Invariant |
|----------|-----------|----------------|------|----------------|----------------|-----------|
| EB-09: 13× bare `catch {}` in loaders | Error type, message, stack, filesystem code, directory path | Caller treats empty result as "nothing exists" instead of "load failed" | Agent reports "no workflows/activities/skills available" when files exist but are unreadable; user follows wrong remediation path | API ergonomics: all callers must unwrap Result types; partial-result semantics lost (all-or-nothing vs best-effort); 15+ call sites require new error handling | Error locality: flat accumulator loses call nesting; error-to-result binding: can't correlate which items loaded vs which failed; optional accumulator means no compiler enforcement | **Loader functions are best-effort aggregators**: partial results are structurally preferred over atomic failure. Error observability and API ergonomics are inversely coupled at aggregation boundaries — preserving one necessarily degrades the other. The invariant is the *aggregation contract itself*: these functions promise "return what you can" rather than "succeed entirely or fail entirely." |

The structural invariant that survives both fixes: **error observability is inversely proportional to API ergonomics at aggregation boundaries**. The codebase has chosen (implicitly, via bare catches) that loader functions are *best-effort aggregators* — they return whatever was loadable rather than failing atomically. This is a coherent design philosophy for a server that must remain responsive even when workflow content is partially corrupt. The cost is that failures become invisible. Any fix must either sacrifice the best-effort contract (Fix A) or sacrifice error traceability guarantees (Fix B). The aggregation contract itself — "return what you can, swallow what you can't" — is the structural invariant that both fixes must work around rather than eliminate.

---

## Appendix: Cross-Reference Index

| Error Boundary | Files Affected | Downstream Traces |
|---------------|---------------|-------------------|
| EB-01 | `index.ts` | Terminal (process exits) |
| EB-02 | `crypto.ts` | Trace E |
| EB-03 | `crypto.ts` | Trace E (retry behavior) |
| EB-04 | `session.ts` | All tool calls using session tokens |
| EB-05 | `workflow-loader.ts` | Trace B |
| EB-06 | `workflow-loader.ts` | Trace B |
| EB-07 | `workflow-loader.ts` | Trace A |
| EB-08 | `workflow-loader.ts` | Trace A |
| EB-09 | 6 loader files | Traces A, B, C, D, F, H |
| EB-10 | `resource-loader.ts` | Trace H |
| EB-11 | `rules-loader.ts` | Trace D |
| EB-12 | `activity-loader.ts` | Trace C |
| EB-13 | `state-tools.ts` | Trace I |
| EB-14 | `logging.ts` | Trace J |
| EB-15 | `trace.ts` | Trace J |
| EB-16 | `trace.ts` | Trace J (eviction variant) |
| EB-17 | `toon.ts` | Traces B, C, G, H |
| EB-18 | `config.ts` | Trace A (misconfigured path) |
| EB-19 | `validation.ts` | Trace F |
| EB-20 | `validation.ts` | Trace F (related) |
| EB-21 | `resource-tools.ts` | Trace H |
| EB-22 | `workflow-tools.ts` | Trace F (related) |
| EB-23 | `condition.schema.ts` | Trace G |
| EB-24 | `workflow-tools.ts` | Trace J (related) |
