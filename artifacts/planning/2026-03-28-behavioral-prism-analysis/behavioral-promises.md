---
target: /home/mike/dev/workflow-server/src/
analysis_date: 2026-03-28
lens: api-surface
---

# Behavioral Promises Analysis — workflow-server

Systematic behavioral lens pass on the TypeScript MCP server codebase (~3k LOC).
Every public export is examined for promise-vs-reality divergence.

---

## Step 1: Trace The Promise

### `src/utils/crypto.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `getOrCreateServerKey()` | Get existing server key or create one | `Promise<Buffer>` (32-byte key) | Filesystem write on first call | None |
| `encryptToken(token, key)` | Encrypt a token string | Encrypted string | None | Valid key buffer |
| `decryptToken(encrypted, key)` | Decrypt an encrypted token | Plaintext string | None | Valid encrypted format, correct key |
| `hmacSign(payload, key)` | Produce HMAC signature | Hex signature string | None | Valid key buffer |
| `hmacVerify(payload, signature, key)` | Verify HMAC signature | Boolean (valid/invalid) | None | Valid key buffer |

### `src/utils/session.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `createSessionToken(workflowId, workflowVersion)` | Create a new session token | `Promise<string>` (opaque token) | None | Valid workflow ID and version |
| `decodeSessionToken(token)` | Decode a session token to its payload | `Promise<SessionPayload>` | None | Valid token string |
| `advanceToken(token, updates?)` | Advance a session token to next state | `Promise<string>` (new token) | None | Valid current token |
| `sessionTokenParam` | Zod parameter definition for session tokens | Static object | N/A | N/A |

### `src/utils/validation.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `validateWorkflowConsistency(token, workflowId)` | Validate workflow is consistent with session | `string \| null` (error or pass) | None | Valid token and workflow ID |
| `validateActivityTransition(token, workflow, activityId)` | Validate that a transition to this activity is legal | `string \| null` | None | Valid workflow with transitions |
| `validateSkillAssociation(workflow, activityId, skillId)` | Validate skill belongs to activity | `string \| null` | None | Valid workflow and IDs |
| `validateWorkflowVersion(token, workflow)` | Validate version hasn't drifted | `string \| null` | None | Token and workflow with versions |
| `validateStepManifest(manifest, workflow, activityId)` | Validate step manifest completeness | `string[]` (warnings) | None | Manifest array, valid workflow |
| `validateTransitionCondition(token, workflow, activityId, claimedCondition)` | Validate claimed condition matches workflow transitions | `string \| null` | None | Valid token, workflow, activity |
| `validateActivityManifest(manifest, workflow)` | Validate activity manifest against workflow | `string[]` (warnings) | None | Manifest array, valid workflow |
| `buildValidation(...warnings)` | Build a ValidationResult from warning strings | `ValidationResult` | None | String or null warnings |
| `buildErrorValidation(error, ...warnings)` | Build a ValidationResult with error status | `ValidationResult` | None | Error string |
| `buildMeta(sessionToken, validation)` | Build a MetaResponse | `MetaResponse` | None | Valid token and validation |

### `src/utils/toon.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `decodeToon<T>(content)` | Decode TOON string to type T | `T` (type-safe decoded value) | None | Valid TOON string |
| `encodeToon(value)` | Encode a value to TOON string | `string` | None | Serializable value |

### `src/tools/workflow-tools.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `registerWorkflowTools(server, config)` | Register workflow-related tools on the MCP server | `void` | Mutates server (adds tools) | Valid McpServer, valid config |
| `help` (tool) | Explain how to use the server | Bootstrap procedure + protocol guide | None | None |
| `list_workflows` (tool) | List all available workflows | Workflow manifest entries | None | None |
| `get_workflow` (tool) | Get a workflow definition | Full workflow object | Token advancement | Valid session token, workflow ID |
| `next_activity` (tool) | Transition to next activity | Activity definition | Token advancement, trace emission | Valid token, workflow, activity IDs |
| `get_checkpoint` (tool) | Get checkpoint details | Checkpoint object | Token advancement | Valid token, workflow, activity, checkpoint IDs |
| `get_activities` (tool) | Get list of possible next activities | Activity list | Token advancement | Valid token with current activity |
| `get_trace` (tool) | Get execution trace | Trace events | Token advancement | Valid token |
| `health_check` (tool) | Check server health | Health status | None | None |

### `src/tools/resource-tools.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `registerResourceTools(server, config)` | Register resource-related tools | `void` | Mutates server | Valid McpServer, config |
| `start_session` (tool) | Start a workflow session | Rules + workflow metadata + session token | Trace store initialization | Valid workflow ID |
| `get_skills` (tool) | Get all skills for an activity | Skills map | Token advancement | Valid token, workflow, activity IDs |
| `get_skill` (tool) | Get a single skill | Skill object | Token advancement | Valid token, workflow, skill IDs |

### `src/tools/state-tools.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `validateStatePath(inputPath)` | Validate that a path is within workspace | Boolean-like (pass/fail) | None | String path |
| `registerStateTools(server, config)` | Register state management tools | `void` | Mutates server | Valid McpServer, config |
| `save_state` (tool) | Save workflow state to file | Save confirmation | Writes TOON file to disk | Valid token, JSON state, folder path |
| `restore_state` (tool) | Restore workflow state from file | Restored state object | None | Valid token, file path |

### `src/server.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects | Implied Preconditions |
|---|---|---|---|---|
| `createServer(config)` | Create an MCP server | `McpServer` | Creates TraceStore if missing | Valid ServerConfig |

### `src/errors.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `WorkflowNotFoundError(workflowId)` | Error indicating workflow not found | Error with code and workflowId |
| `ResourceNotFoundError(resourceId, workflowId?)` | Error indicating resource not found | Error with code and resourceId |
| `WorkflowValidationError(workflowId, issues)` | Error indicating workflow validation failed | Error with code, workflowId, issues |
| `SkillNotFoundError(skillId)` | Error indicating skill not found | Error with code and skillId |
| `ActivityNotFoundError(activityId, workflowId?)` | Error indicating activity not found | Error with code and activityId |
| `RulesNotFoundError()` | Error indicating rules not found | Error with code |

### `src/result.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects |
|---|---|---|---|
| `ok(value)` | Create a success Result | `Result<T, never>` | None |
| `err(error)` | Create a failure Result | `Result<never, E>` | None |
| `unwrap(result)` | Extract value or throw error | `T` | Throws on failure |

### `src/trace.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects |
|---|---|---|---|
| `createTraceEvent(...)` | Create a trace event object | `TraceEvent` | None |
| `TraceStore.initSession(sid)` | Initialize a session for tracing | `void` | Evicts oldest session if at capacity |
| `TraceStore.append(sid, event)` | Append a trace event to a session | `void` | Adds event to session's event list |
| `TraceStore.getEvents(sid)` | Get all events for a session | `TraceEvent[]` (defensive copy) | None |
| `TraceStore.getSegmentAndAdvanceCursor(sid)` | Get events since last cursor and advance | Segment with events and indices | Advances internal cursor |
| `createTraceToken(payload)` | Create an HMAC-signed trace token | `Promise<string>` | None |
| `decodeTraceToken(token)` | Decode and verify a trace token | `Promise<TraceTokenPayload>` | None |

### `src/logging.ts`

| Name | Promised Behavior | Implied Return | Implied Side Effects |
|---|---|---|---|
| `logAuditEvent(event)` | Log an audit event | `void` | Writes to stderr |
| `logInfo(message, data?)` | Log an info message | `void` | Writes to stderr |
| `logWarn(message, data?)` | Log a warning message | `void` | Writes to stderr |
| `logError(message, error?, data?)` | Log an error message | `void` | Writes to stderr |
| `withAuditLog(toolName, handler, traceOpts?)` | Wrap handler with audit logging | Wrapped handler `(params) => Promise<R>` | Logging side effects |

### `src/loaders/workflow-loader.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `loadWorkflow(workflowDir, workflowId)` | Load a workflow from disk | `Promise<Result<Workflow>>` |
| `listWorkflows(workflowDir)` | List available workflows | `Promise<WorkflowManifestEntry[]>` |
| `getActivity(workflow, activityId)` | Get an activity by ID | `Activity \| undefined` |
| `getCheckpoint(workflow, activityId, checkpointId)` | Get a checkpoint by ID | `Checkpoint \| undefined` |
| `getValidTransitions(workflow, fromActivityId)` | Get all valid transition targets | `string[]` (activity IDs) |
| `getTransitionList(workflow, fromActivityId)` | Get transitions with human-readable conditions | `TransitionEntry[]` |
| `validateTransition(workflow, from, to)` | Validate a specific transition | `{ valid: boolean; reason?: string }` |

### `src/loaders/activity-loader.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `readActivity(workflowDir, activityId, workflowId?)` | Read a single activity | `Promise<Result<ActivityWithGuidance>>` |
| `listActivities(workflowDir, workflowId?)` | List activities | `Promise<ActivityEntry[]>` |
| `readActivityIndex(workflowDir)` | Read the activity index | `Promise<Result<ActivityIndex>>` |

### `src/loaders/skill-loader.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `readSkill(skillId, workflowDir, workflowId?)` | Read a skill by ID | `Promise<Result<Skill>>` |
| `listUniversalSkills(workflowDir)` | List universal skills (from meta) | `Promise<SkillEntry[]>` |
| `listWorkflowSkills(workflowDir, workflowId)` | List workflow-specific skills | `Promise<SkillEntry[]>` |
| `listSkills(workflowDir)` | List all skills | `Promise<SkillEntry[]>` |
| `readSkillIndex(workflowDir)` | Read the skill index | `Promise<Result<SkillIndex>>` |

### `src/loaders/resource-loader.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `readResource(workflowDir, workflowId, resourceIndex)` | Read a resource by index | `Promise<Result<Resource \| string>>` |
| `readResourceRaw(workflowDir, workflowId, resourceIndex)` | Read raw resource content | `Promise<Result<{ content; format }>>` |
| `readResourceStructured(workflowDir, workflowId, resourceIndex)` | Read resource with structured metadata | `Promise<Result<StructuredResource>>` |
| `listResources(workflowDir, workflowId)` | List all resources for a workflow | `Promise<ResourceEntry[]>` |
| `getResourceEntry(workflowDir, workflowId, resourceIndex)` | Get resource metadata without content | `Promise<ResourceEntry \| null>` |
| `listWorkflowsWithResources(workflowDir)` | List workflows that have resources | `Promise<string[]>` |

### `src/loaders/rules-loader.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `readRules(workflowDir)` | Read global agent rules | `Promise<Result<Rules, RulesNotFoundError>>` |
| `readRulesRaw(workflowDir)` | Read raw rules content | `Promise<Result<string, RulesNotFoundError>>` |

### `src/loaders/filename-utils.ts`

| Name | Promised Behavior | Implied Return |
|---|---|---|
| `parseActivityFilename(filename)` | Parse an activity filename into index + id | `{ index; id } \| null` |

### `src/schema/*.ts` (Schema Files)

| Name | Promised Behavior |
|---|---|
| `evaluateCondition(condition, variables)` | Evaluate a condition expression against variables |
| `createInitialState(workflowId, version, initialActivity, vars?)` | Create initial workflow state object |
| `addHistoryEvent(state, type, details?)` | Append a history event to state |
| `validate*` / `safeValidate*` functions | Parse-validate data against Zod schemas |

---

## Step 2: Hunt The Lies

### LIE-01: `readSkill` returns unvalidated data (NARROWING)

**File:** `src/loaders/skill-loader.ts` L72–83, L92–126
**Promise:** `Result<Skill, SkillNotFoundError>` — a validated `Skill` type conforming to `SkillSchema`.
**Reality:** `tryLoadSkill` calls `decodeToon<Skill>(content)` which performs an unsafe `as T` cast with zero Zod validation. Compare to `loadActivitiesFromDir` in `workflow-loader.ts` (L42–43) which calls `safeValidateActivity(decoded)`.
**Lie type:** NARROWING — promises type-safe Skill, delivers unvalidated cast.
**Bug written:** "Called `readSkill('my-skill', dir, wfId)` assuming the returned `Skill` was validated, so I accessed `result.value.capability` without null-checking. A malformed TOON file returned successfully with `capability` undefined, producing `undefined` in the JSON response."

### LIE-02: `TraceStore.append` silently drops events (NARROWING)

**File:** `src/trace.ts` L84–87
**Promise:** "Append a trace event to a session" — the event will be stored.
**Reality:** If `initSession(sid)` was never called, `this.sessions.get(sid)` returns `undefined`, and the event is silently discarded. No error, no warning, no return value indicating failure.
**Lie type:** NARROWING — promises append, delivers silent discard.
**Bug written:** "Called `traceStore.append(sid, event)` in an error recovery path where `initSession` hadn't been called yet, so I wrote code assuming trace events would be available for debugging. The events vanished."

### LIE-03: `getTransitionList` vs `getValidTransitions` — inconsistent transition scope (NARROWING)

**File:** `src/loaders/workflow-loader.ts` L170–178 vs L187–202
**Promise:** Both names promise "transitions from an activity." `getValidTransitions` returns all reachable target IDs. `getTransitionList` promises "the transition list with human-readable conditions."
**Reality:** `getValidTransitions` collects from `transitions`, `decisions`, and `checkpoints` (L173–176). `getTransitionList` reads ONLY `activity.transitions` (L193–201), ignoring decisions and checkpoints entirely. `validateActivityTransition` (validation.ts L27) uses `getValidTransitions`, but `validateTransitionCondition` (validation.ts L110) uses `getTransitionList`. A transition through a decision branch passes `validateActivityTransition` but `validateTransitionCondition` cannot find it.
**Lie type:** NARROWING — `getTransitionList` promises the list of transitions but delivers only a subset.
**Bug written:** "Called `getTransitionList` to build a complete transition map for routing, assuming it matched `getValidTransitions` scope. Missed transitions from decisions and checkpoints, so the routing table was incomplete."

### LIE-04: `readRules` masks parse errors as "not found" (DIRECTION)

**File:** `src/loaders/rules-loader.ts` L34–50
**Promise:** `Result<Rules, RulesNotFoundError>` — either rules are returned, or they weren't found.
**Reality:** When the file exists but TOON parsing fails (L47), the catch block returns `err(new RulesNotFoundError())`. The error type claims "not found" when the actual problem is malformed content.
**Lie type:** DIRECTION — reports "not found" when the reality is "found but unparseable."
**Bug written:** "Handled `RulesNotFoundError` by creating default rules, assuming the file was missing. The file existed with a syntax error, so defaults silently replaced corrupted data instead of surfacing the parse failure."

### LIE-05: `decodeToon<T>` implies type-safe decoding (NARROWING)

**File:** `src/utils/toon.ts` L8–9
**Promise:** Generic `<T>` on the return type implies the decoded value conforms to type `T` at runtime.
**Reality:** The body is `return decode(content) as T` — a bare type assertion with no runtime validation. The JSDoc comment ("The caller is responsible for validating") documents this, but the type signature contradicts it.
**Lie type:** NARROWING — the type signature promises `T`, but delivers `unknown` dressed as `T`.
**Bug written:** "Called `decodeToon<Activity>(content)` in a new code path without adding Zod validation (existing callers all validate, but the type signature doesn't enforce it). Accessed `.skills.primary` on the result and got `undefined`."

### LIE-06: `readActivity` uses unvalidated data on validation failure (WIDENING)

**File:** `src/loaders/activity-loader.ts` L114–120
**Promise:** Returns `Result<ActivityWithGuidance>` — implies validated data.
**Reality:** When `safeValidateActivity` fails (L117), the function logs a warning but returns the raw decoded data anyway (L120: `const activity = validation.success ? validation.data : decoded`). The `Result` is `ok(...)` — a success — with potentially invalid data.
**Lie type:** WIDENING — delivers more than promised by accepting invalid data as valid.
**Bug written:** "Called `readActivity` and checked `result.success` to gate downstream processing. The activity file had a missing `version` field, validation failed, but `result.success` was `true`. Code that required `activity.version` crashed."

### LIE-07: `registerResourceTools` contains `start_session` (DIRECTION)

**File:** `src/tools/resource-tools.ts` L29, L34–80
**Promise:** "Register resource-related tools" — tools for accessing resources.
**Reality:** Registers `start_session` (session initialization), `get_skills`, and `get_skill`. Session initialization is not a resource operation.
**Lie type:** DIRECTION — session management tool placed in resource tools module.
**Bug written:** "Searched `state-tools.ts` and `workflow-tools.ts` for `start_session` registration. Couldn't find it. Eventually grepped the whole codebase and found it in `resource-tools.ts`."

### LIE-08: `get_activities` tool returns transitions, not activities (NARROWING)

**File:** `src/tools/workflow-tools.ts` L207–230
**Promise:** Tool name `get_activities` — "Get the list of possible next activities."
**Reality:** Returns `{ current_activity, transitions }` where `transitions` is a `TransitionEntry[]` (target ID + condition + isDefault). Does not return `Activity` objects — returns transition metadata. Also inherits LIE-03: only returns `transitions` array transitions, not decision/checkpoint transitions.
**Lie type:** NARROWING — promises activities, delivers transition stubs.
**Bug written:** "Called `get_activities` expecting Activity objects with names, steps, and skills. Wrote UI code to display activity details. Got transition entries with only `to`, `condition`, and `isDefault` fields."

### LIE-09: `readActivityIndex` / `readSkillIndex` are build operations named as reads (DIRECTION)

**File:** `src/loaders/activity-loader.ts` L226–286, `src/loaders/skill-loader.ts` L232–303
**Promise:** "Read the activity/skill index" — implies reading a pre-built index file from disk.
**Reality:** Dynamically scans all activity/skill files, loads each one, extracts metadata, and constructs the index in memory. These are O(n) build operations, not file reads.
**Lie type:** DIRECTION — "read" implies retrieval; reality is computation.
**Bug written:** "Added disk-based caching around `readActivityIndex` assuming it was a file read. The cache prevented newly added activities from appearing because the function was supposed to scan and build dynamically."

### LIE-10: `validateStatePath` resolves AND validates (WIDENING)

**File:** `src/tools/state-tools.ts` L19–26
**Promise:** "Validate" a path — implies boolean/void checking.
**Reality:** Returns the resolved absolute path string. Throws on invalid. Performs both validation AND path resolution (transformation).
**Lie type:** WIDENING — does more than validation; also transforms the input.
**Bug written:** "Called `validateStatePath(input)` and discarded the return value, assuming it was a void validator. Used the original `input` path for the file write. The file ended up at a different location than intended because the original relative path wasn't resolved."

### LIE-11: `withAuditLog` also captures traces (WIDENING)

**File:** `src/logging.ts` L83–105
**Promise:** "Wrap handler with audit logging" — implies logging only.
**Reality:** When `traceOpts` is provided, also decodes the session token and appends trace events to the TraceStore. The trace capture involves crypto operations (HMAC verification) on every tool call.
**Lie type:** WIDENING — performs tracing in addition to audit logging.
**Bug written:** "Benchmarked tool call latency and found unexplained ~2ms overhead from `withAuditLog`. The HMAC decode for trace capture was hidden behind what looked like a logging wrapper."

### LIE-12: `validateSkillAssociation` silently passes on missing activity (NARROWING)

**File:** `src/utils/validation.ts` L36–52
**Promise:** "Validate skill belongs to activity" — implies checking the association.
**Reality:** If `activityId` is empty (L37) or the activity doesn't exist (L40), returns `null` (pass). A missing activity is treated identically to a valid association.
**Lie type:** NARROWING — validates less than named; missing activities bypass the check entirely.
**Bug written:** "Called `validateSkillAssociation(wf, 'nonexistent-activity', 'some-skill')` expecting a warning about the activity not existing. Got `null` (valid). The invalid activity ID propagated silently."

### LIE-13: `parseActivityFilename` used for skills (WIDENING)

**File:** `src/loaders/filename-utils.ts` L6–10, imported as `parseSkillFilename` in `src/loaders/skill-loader.ts` L9
**Promise:** "Parse an activity filename" — specific to activities.
**Reality:** The function parses any `{digits}-{name}.toon` pattern. It's imported as `parseSkillFilename` in skill-loader.ts to parse skill filenames. The function is general-purpose but named for a specific domain.
**Lie type:** WIDENING — works for more than activity filenames despite the name.
**Bug written:** "Needed to modify activity filename parsing rules (e.g., allow non-numeric prefixes). Changed `parseActivityFilename` not realizing it's aliased as `parseSkillFilename` and used for skill file resolution too. Broke skill loading."

### LIE-14: `decodeSessionToken` verifies, not just decodes (WIDENING)

**File:** `src/utils/session.ts` L45–70 (via internal `decode`)
**Promise:** "Decode a session token" — implies parsing/deserialization only.
**Reality:** Also performs HMAC signature verification (L53) and Zod schema validation (L60). Throws on tampered tokens. More accurately: "verify and decode."
**Lie type:** WIDENING — does cryptographic verification beyond decoding.
**Bug written:** "Called `decodeSessionToken` in a diagnostic path expecting it to always succeed on well-formed base64 strings. It threw because the HMAC signature didn't match after a server key rotation, crashing the diagnostic tool."

---

## Step 3: Name The Cost

### The Most Dangerous Lie: LIE-01 (`readSkill` returns unvalidated data)

**Production scenario:** A workflow author edits a skill TOON file and introduces a typo in the `capability` field name (e.g., `capbility` instead of `capability`). The `readSkill` function returns successfully with `Result<Skill>` where `success: true`. Downstream code in `get_skill` and `get_skills` serializes this to JSON and sends it to the agent. The agent receives a skill object missing expected fields. Unlike activities (which are Zod-validated in `loadActivitiesFromDir` and fall back to raw data in `readActivity`), skills have NO validation checkpoint at any level.

**Design choice that created it:** The `decodeToon<T>` function provides generic-typed returns via unsafe cast. Most callers (workflow-loader, activity-loader) added Zod validation after decoding. The skill-loader was written to match the pattern but omitted the validation step. The type system doesn't enforce validation because `decodeToon<Skill>` already returns `Skill`.

**Amplifying factor:** LIE-03 (`getTransitionList` inconsistency) could combine with LIE-01 in a scenario where a skill's execution triggers a transition through a decision branch. The agent follows the skill's instructions to transition, `validateActivityTransition` passes (uses `getValidTransitions` which includes decisions), but `validateTransitionCondition` fails to find the matching condition (uses `getTransitionList` which excludes decisions). The agent receives a spurious validation warning on a legal transition.

### Conservation Law Analysis

| Fix | Real Cost |
|---|---|
| Add `safeValidateSkill()` to `readSkill` (fixes LIE-01) | Existing malformed skill files that currently load successfully will start failing. Requires an audit of all skill TOON files and potentially a migration. Adds ~1ms per skill load for schema validation. |
| Make `getTransitionList` include decisions/checkpoints (fixes LIE-03) | Changes `TransitionEntry[]` shape. Decision branches and checkpoint effects don't have the same condition structure as transitions, so `conditionToString` needs new code paths. Consumers expecting only transition-sourced entries may break. |
| Auto-initialize sessions in `TraceStore.append` (fixes LIE-02) | Masks bugs where `initSession` was supposed to be called explicitly. The session eviction logic in `initSession` won't run, potentially growing the session map unbounded. Alternative: throw on unknown sid — but that crashes the audit pipeline for a non-critical concern. |
| Return `WorkflowValidationError` from `readRules` on parse failure (fixes LIE-04) | Callers must handle two error types instead of one. `start_session` (resource-tools.ts L44–45) catches only `RulesNotFoundError`; adding a new error type requires updating all catch sites. Alternatively, create `RulesParseError` — adds a new error class and changes the `Result` type signature. |
| Rename `readActivityIndex`→`buildActivityIndex` (fixes LIE-09) | Breaks all call sites and any external consumers. The MCP resource URI `concept-rag://activities` may reference this function. Requires coordinated rename across resource registrations. |
| Split `withAuditLog` into `withAuditLog` + `withTracing` (fixes LIE-11) | Every tool registration site must compose two wrappers instead of one. Increases registration boilerplate. Alternative: rename to `withAuditLogAndTracing` — breaks no behavior but every tool registration reference changes. |

---

## Summary Table

| # | Name | Promise | Reality | Lie Type | Bug Written | Conservation Law |
|---|---|---|---|---|---|---|
| LIE-01 | `readSkill` (skill-loader.ts L92–126) | Returns validated `Skill` type | Returns unvalidated `decodeToon<Skill>` cast — no Zod validation | NARROWING | "Accessed `skill.capability` without null-check; malformed TOON returned `undefined`" | Adding validation breaks currently-loading malformed skill files; requires TOON file audit |
| LIE-02 | `TraceStore.append` (trace.ts L84–87) | Appends event to session | Silently discards if `initSession` never called | NARROWING | "Trace events vanished in error recovery path where session wasn't initialized" | Auto-init masks missing `initSession` bugs; throw crashes audit pipeline |
| LIE-03 | `getTransitionList` (workflow-loader.ts L187–202) | All transitions with conditions | Only `activity.transitions`; excludes decisions and checkpoints (unlike `getValidTransitions`) | NARROWING | "Built routing table from `getTransitionList`; missed decision/checkpoint transitions" | Including decisions/checkpoints changes `TransitionEntry[]` shape; requires new `conditionToString` paths |
| LIE-04 | `readRules` (rules-loader.ts L34–50) | `RulesNotFoundError` means file absent | Also returns `RulesNotFoundError` on parse failure | DIRECTION | "Created default rules on `RulesNotFoundError`; silently replaced corrupted file" | New error type changes `Result` signature; all catch sites need updating |
| LIE-05 | `decodeToon<T>` (toon.ts L8–9) | Generic `T` implies validated decode | Unsafe `as T` cast with no runtime check | NARROWING | "Omitted Zod validation in new code path; `T` fields were `undefined`" | Removing generic forces explicit validation at every call site; increases boilerplate |
| LIE-06 | `readActivity` (activity-loader.ts L114–120) | Returns validated activity on success | Returns unvalidated raw data when Zod fails, still as `ok(...)` | WIDENING | "`result.success` was `true` but activity was missing required `version` field" | Failing on validation error breaks activities with minor schema deviations |
| LIE-07 | `registerResourceTools` (resource-tools.ts L29) | Registers resource tools | Also registers `start_session` (session management) | DIRECTION | "Searched workflow and state tools for `start_session`; found it in resource-tools" | Moving `start_session` to its own file adds a module; changes import graph |
| LIE-08 | `get_activities` tool (workflow-tools.ts L207–230) | Returns list of activities | Returns `TransitionEntry[]` (target IDs + conditions), not `Activity` objects | NARROWING | "Expected Activity objects; got transition stubs with only `to`/`condition`/`isDefault`" | Returning full Activity objects increases response payload; may exceed context windows |
| LIE-09 | `readActivityIndex` / `readSkillIndex` | Reads pre-built index from disk | Dynamically builds index by scanning all files | DIRECTION | "Cached result assuming file read; new files didn't appear" | Rename breaks call sites and resource URI references |
| LIE-10 | `validateStatePath` (state-tools.ts L19–26) | Validates a path (boolean-like check) | Returns resolved absolute path; throws on invalid | WIDENING | "Discarded return value; used unresolved input path for file write" | Splitting into `validatePath` (void/throw) + `resolvePath` (string) doubles call-site code |
| LIE-11 | `withAuditLog` (logging.ts L83–105) | Wraps handler with audit logging | Also captures trace events when `traceOpts` provided (HMAC decode per call) | WIDENING | "Unexplained ~2ms overhead from what looked like a logging wrapper" | Splitting adds composition boilerplate to every tool registration |
| LIE-12 | `validateSkillAssociation` (validation.ts L36–52) | Validates skill belongs to activity | Returns `null` (pass) when activity is missing | NARROWING | "Expected warning for nonexistent activity; got silent pass" | Flagging missing activities adds warnings to tools called before activity context is set |
| LIE-13 | `parseActivityFilename` (filename-utils.ts L6–10) | Parses activity filenames | General `{digits}-{name}.toon` parser; aliased as `parseSkillFilename` for skills | WIDENING | "Modified activity parsing rules; unknowingly broke skill file resolution" | Renaming to `parseToonFilename` breaks existing imports; splitting creates near-identical functions |
| LIE-14 | `decodeSessionToken` (session.ts L45–70) | Decodes a session token | Also verifies HMAC signature and validates Zod schema | WIDENING | "Called in diagnostic path; threw on key mismatch instead of returning parsed data" | Adding a `decodeWithoutVerify` exposes unsigned payload parsing; security surface grows |
