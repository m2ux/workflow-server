---
target: src/tools/ (index.ts, workflow-tools.ts, resource-tools.ts, state-tools.ts)
loc: 541
analysis_date: 2026-03-27
lens: L12 adversarial
workflow: prism / adversarial-pass
prior_artifact: tools/structural-analysis.md
---

# L12 Adversarial Analysis — `src/tools/`

## WRONG PREDICTIONS

### WP-1: "The skeleton is repeated 10 times" — Actually 6 (or 9 counting partials)

**Claim** (structural analysis §2, Expert B): "This skeleton is repeated 10 times but never abstracted."

**What actually happens**: The full 7-step skeleton (decode → load → validate → work → advance → `_meta` → return) applies to exactly **6** tools: `get_workflow`, `next_activity`, `get_checkpoint`, `get_activities`, `get_skills`, `get_skill`. Three more tools (`get_trace`, `save_state`, `restore_state`) execute a degenerate form (decode → work → advance with empty validation → `_meta` → return). Four tools (`help`, `list_workflows`, `health_check`, `start_session`) follow none of the skeleton.

**Evidence**: `help` (workflow-tools.ts:28–57) returns content with no `_meta`. `list_workflows` (59–62) returns content with no `_meta`. `health_check` (260–269) returns content with no `_meta`. `start_session` (resource-tools.ts:38–71) returns the session token embedded in content JSON, not in `_meta.session_token`. `get_trace` (workflow-tools.ts:231–258) decodes the token but never loads a workflow and passes `buildValidation()` with zero arguments.

**Impact**: The "10 repetitions" count inflates the severity of the missing abstraction. The actual pattern has three tiers (full skeleton, degenerate skeleton, no skeleton), which means any single abstraction would cover at most 6 tools — less than half the API surface.

### WP-2: `get_trace` tool completely omitted from the analysis

**Claim** (structural analysis header): "target: src/tools/ (index.ts, workflow-tools.ts, resource-tools.ts, state-tools.ts)"

**What actually happens**: `get_trace` (workflow-tools.ts:226–258) is never mentioned anywhere in the structural analysis — not in the dialectic, not in the concealment mechanism discussion, not in the bug table. This is a tool that:

- Decodes session tokens but loads no workflow (line 232)
- Runs `buildValidation()` with zero validators (lines 249, 256)
- Has unique per-element error handling in a loop (lines 237–243)
- Has a dual-path architecture: token-based vs memory-based trace retrieval (lines 234–251 vs 253–257)
- Is explicitly excluded from tracing itself via `excludeFromTrace: true` (line 258)
- Advances the token with no workflow/activity args (lines 249, 256)

This is a 13th tool the analysis never counted. The analysis examined 12 of 13 tools and missed one entirely.

### WP-3: Bug #4 — `initialActivity` type cast is unnecessary, not type-hiding

**Claim** (structural analysis §12, bug #4): "`(wf as Record<string, unknown>)['initialActivity']` bypasses TypeScript's type system to access `initialActivity`. If the workflow type excludes this field, the cast hides a type mismatch."

**Disproof**: The `Workflow` type is `z.infer<typeof WorkflowSchema>` (workflow.schema.ts:57). The schema includes `initialActivity: z.string().optional()` (workflow.schema.ts:54). Therefore `wf.initialActivity` is a valid property access on the `Workflow` type. The cast is **unnecessary** — it doesn't bypass anything because the field already exists. The analysis's "if the workflow type excludes this field" conditional is false. The real bug is a redundant cast that adds confusion, not a type-system bypass that hides a mismatch.

### WP-4: Bug #3 is not a bug — skill-association validation in `get_skills` is enforced by construction

**Claim** (structural analysis §12, bug #3): "`get_skills` omits skill-association validation [unlike `get_skill`]. An activity could reference non-associated skills and `get_skills` would not warn."

**Disproof**: `get_skills` (resource-tools.ts:92) constructs its skill list from the activity definition itself:
```typescript
const skillIds = [activity.skills.primary, ...(activity.skills.supporting ?? [])];
```
Skills are loaded FROM the activity's declared associations. Association is enforced by construction — it is impossible to load a non-associated skill through this path. `get_skill`, by contrast, accepts an arbitrary `skill_id` parameter (resource-tools.ts:129), so it NEEDS explicit association validation. The asymmetry is correct design, not a bug.

### WP-5: Expert C's "no alignment" misses internal section headers

**Claim** (structural analysis §2, Expert C): "Four categories, three files, no alignment."

**Partial disproof**: `resource-tools.ts` uses explicit section comments: `// ============== Session Tools ==============` (line 30) and `// ============== Skill Tools ==============` (line 74). The file internally acknowledges the categorical split. The claim of "no alignment" overstates the disorganization — there is alignment within the file, just not across the file boundary.

---

## OVERCLAIMS

### OC-1: 6 of 7 "structural" classifications are fixable

The structural analysis classifies 7 bugs as structural, claiming the conservation law predicts their unfixability. I demonstrate fixes for 6 of them:

**Bug #2 — `get_skills` silently swallows skill-load failures**
- Classification: "Structural" → **Fixable**
- Analysis claims: "making failures visible requires per-skill error reporting in the response schema"
- Fix: Append failure messages to the existing `validation` array. No schema change needed.
```typescript
const failedSkills: string[] = [];
for (const sid of skillIds) {
  const result = await readSkill(sid, config.workflowDir, workflow_id);
  if (result.success) { ... } else { failedSkills.push(sid); }
}
const validation = buildValidation(
  ...failedSkills.map(sid => `Skill '${sid}' failed to load`),
  validateWorkflowConsistency(token, workflow_id),
  validateWorkflowVersion(token, wfResult.value),
);
```
The `buildValidation` function already accepts arbitrary string warnings. No new parameter obligation is created.

**Bug #5 — Asymmetric manifest warnings (missing `activity_manifest` generates no warning)**
- Classification: "Structural" → **Fixable**
- Analysis claims: "the two manifest types have different state predicates; the meta-law predicts this state-conditional asymmetry"
- Fix: Add an `else` branch mirroring the `step_manifest` pattern (workflow-tools.ts after line 137):
```typescript
if (!activity_manifest && token.act) {
  activityManifestWarnings.push(`No activity_manifest provided. Include a manifest to enable activity completion validation.`);
}
```
Three lines. No conservation law prevents this.

**Bug #8 — session_token encryption keyed on hard-coded string**
- Classification: "Structural" → **Fixable**
- Analysis claims: "static binding to dynamic schema; conservation law predicts the coupling cannot be eliminated"
- Fix: Extract a constant or annotate the schema with encryption-sensitive fields:
```typescript
const ENCRYPTED_FIELDS = ['session_token'] as const;
for (const field of ENCRYPTED_FIELDS) {
  if (typeof state.variables[field] === 'string') { ... }
}
```
This eliminates the hard-coding. The schema doesn't need to "become aware" of encryption — the encryption layer maintains its own field list.

**Bug #9 — `decryptToken` fails on server-key rotation**
- Classification: "Structural" → **Fixable**
- Analysis claims: "Both require a key-versioning scheme that doesn't exist"
- Fix: Key versioning is a standard pattern — prefix the encrypted blob with a key ID, store historical keys, try decryption with the matching key. This is engineering effort, not structural impossibility.

**Bug #10 — state tools decode token but never validate workflow consistency**
- Classification: "Structural" → **Fixable**
- Analysis claims: "state tools have no `workflow_id` parameter, so the validation CAN'T run"
- **Disproof**: `save_state` parses the state JSON and accesses `state.workflowId` (state-tools.ts:53). `restore_state` parses the file and accesses `restored.state.workflowId` (state-tools.ts:98). The workflow ID IS available from the parsed state in both tools. The analysis is factually wrong — the parameter exists, it's just in the state payload rather than as a top-level tool parameter.
- Fix:
```typescript
const validation = buildValidation(
  validateWorkflowConsistency(token, state.workflowId),
);
```

**Bug #13 — `get_activities` is the only tool that checks `token.act` existence**
- Classification: "Structural" → **Fixable with middleware**
- A simple `requireCurrentActivity(token)` guard function could be called at the top of any handler that needs `token.act`. The ad-hoc nature of the check is a code organization issue, not a conservation law prediction.

**Net result**: Of 7 "structural" bugs, only Bug #3 had a plausible structural argument — and as shown in WP-4, Bug #3 is not a bug at all. The conservation law's predictive power is **zero**: it correctly predicts none of the claimed structural impossibilities.

### OC-2: The Conservation Law is an implementation choice, not a structural invariant

**Claim**: "Validation Specificity ↔ Parameter Obligation — the precision of validation is conserved against the ability to enforce parameter requirements."

**Alternative design that violates the law**: TypeScript discriminated unions give both specificity AND obligation simultaneously:

```typescript
type WorkflowNavRegistration = {
  category: 'workflow-nav';
  params: z.ZodObject<{ session_token: z.ZodString; workflow_id: z.ZodString }>;
  validates: readonly ['consistency', 'version'];
};
type ActivityNavRegistration = {
  category: 'activity-nav';
  params: z.ZodObject<{ session_token: z.ZodString; workflow_id: z.ZodString; activity_id: z.ZodString }>;
  validates: readonly ['consistency', 'version', 'transition'];
};
type ExemptRegistration = {
  category: 'exempt';
  params: z.ZodObject<{}>;
  validates: readonly [];
};
type ToolRegistration = WorkflowNavRegistration | ActivityNavRegistration | ExemptRegistration;
```

Each variant specifies BOTH the exact validation set AND the exact parameter obligations. TypeScript's exhaustive switch enforces that new categories must define both. There is no conservation trade-off — both specificity and obligation are fully encoded per variant.

The analysis's "conservation" only holds if you insist on a single uniform registration type with optional fields. With sum types, the trade-off disappears. This makes the "law" a consequence of the current design choice (uniform `server.tool()` callback), not a structural property of the problem space.

### OC-3: The Meta-Law overstates "paradox" — state machines solve conditional validation

**Claim**: "Validation requirements are conditional on session state... Any attempt to centralize validation composition will either lose the conditional branches or replicate the per-handler logic."

**Counter-design**: A session phase state machine:

```typescript
type SessionPhase = 'pre-session' | 'session-started' | 'in-activity';

const PHASE_VALIDATIONS: Record<SessionPhase, ValidationFn[]> = {
  'pre-session': [],
  'session-started': [validateWorkflowConsistency, validateWorkflowVersion],
  'in-activity': [validateWorkflowConsistency, validateWorkflowVersion, validateActivityTransition, validateStepManifest],
};
```

The "conditional on session state" branches (`if (token.act)`) are exactly phase transitions. The state machine centralizes BOTH the phase detection and the validation set. The analysis calls this a "paradox" but it is a standard state machine design problem with well-known solutions.

### OC-4: Bug #1 severity is overstated for the actual call sites

**Claim**: "Runtime crash if `skillValue` is null, undefined, or a primitive."

**Context the analysis ignores**: `loadSkillResources` is only called at lines 101 and 143, both times with `result.value` from a successful `readSkill()` call (guarded by `result.success` check at line 99 or `throw` at line 134). The function's actual callers never pass null, undefined, or primitives. The "runtime crash" scenario requires a future caller to misuse the private function. Severity is Low at best, negligible in practice.

---

## UNDERCLAIMS

### UC-1: `_session_token_encrypted` flag pollutes user state namespace and creates a forgery vector

**Location**: state-tools.ts:43–47 (save) and 99–103 (restore)

The `save_state` handler writes a boolean flag `_session_token_encrypted = true` directly into `state.variables` — the user's own state namespace. On restore, line 99 checks this flag to decide whether to decrypt:

```typescript
if (restored.state.variables['_session_token_encrypted'] && typeof restored.state.variables['session_token'] === 'string') {
  ...decryptToken(restored.state.variables['session_token'] as string, key);
```

**Attack**: An agent could manually set `_session_token_encrypted = true` in its state variables while providing a plaintext `session_token` value. On restore, `decryptToken` would attempt to decrypt a plaintext string, producing either a crash (malformed ciphertext) or — worse — a corrupted but syntactically valid token. Alternatively, an agent could set `_session_token_encrypted = false` while the token IS encrypted, causing restore to return the encrypted blob as the session token (information leak of ciphertext).

**Severity**: Medium-High. The structural analysis mentions the hard-coded key name (bug #8) but completely misses the namespace pollution and forgery vector.

### UC-2: `save_state` and `restore_state` have no path validation — arbitrary filesystem read/write

**Location**: state-tools.ts:59–62 (write) and 91 (read)

`save_state`:
```typescript
const filePath = join(planning_folder_path, STATE_FILENAME);
await mkdir(dirname(filePath), { recursive: true });
await writeFile(filePath, toonContent, 'utf-8');
```

`restore_state`:
```typescript
const content = await readFile(file_path, 'utf-8');
```

There is no path validation, no sandboxing, no restriction to the workspace or planning directories. A caller can write state files to any path the Node.js process has write access to (e.g., `/tmp/`, `~/.ssh/`, overwrite other config files) and read from any path with read access. The `mkdir` call with `recursive: true` will create arbitrary directory structures.

**Severity**: High. This is a security concern the structural analysis entirely misses.

### UC-3: `start_session` returns token in content, not `_meta` — breaks the uniform token-update contract

**Location**: resource-tools.ts:68–70

```typescript
const response = { rules: rulesResult.value, workflow: { ... }, session_token: token };
return { content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }] };
```

Every other session-aware tool returns the updated token in `_meta.session_token`. `start_session` returns it in the content JSON body. The `help` tool's session protocol documentation (workflow-tools.ts:48) states: "Every tool response includes an updated token in `_meta.session_token`." This is false for `start_session` itself.

**Impact**: An agent following the documented protocol literally (always read `_meta.session_token`) would fail to obtain the initial token from `start_session`. The structural analysis identifies `start_session` as a "fundamentally different category" (§4) but never identifies this concrete contract violation.

### UC-4: `get_trace` has silent degradation when tracing is disabled

**Location**: workflow-tools.ts:253

```typescript
const events = config.traceStore ? config.traceStore.getEvents(token.sid) : [];
```

When `config.traceStore` is `undefined` (tracing disabled), `get_trace` returns `{ events: [], event_count: 0, source: 'memory' }` — a successful response with zero events. No warning, no indication that tracing is disabled. An agent calling `get_trace` has no way to distinguish "no events occurred" from "tracing is not configured."

**Severity**: Medium. This is a silent-degradation pattern that violates the principle of least surprise.

### UC-5: Resource deduplication in `get_skills` uses index-identity, creating a silent override

**Location**: resource-tools.ts:93–107

```typescript
const seenIndices = new Set<string>();
for (const r of resources) {
  if (!seenIndices.has(r.index)) {
    seenIndices.add(r.index);
    allResources.push(r);
  }
}
```

If two skills reference different resources that happen to share the same index string, only the first-encountered resource is returned. The second is silently dropped. This creates an implicit contract: resource identity is index-based, and skill load order determines which version wins (primary skill's resources take priority over supporting skills').

**Severity**: Medium. The structural analysis never mentions resource deduplication.

### UC-6: `encodeToon` double-cast reveals type mismatch

**Location**: state-tools.ts:61

```typescript
const toonContent = encodeToon(saveFile as unknown as Record<string, unknown>);
```

The `as unknown as Record<string, unknown>` double-cast is a TypeScript escape hatch indicating that `encodeToon`'s type signature does not accept `StateSaveFile`. This suggests the TOON encoder's type contract is narrower than its actual capability, or that `StateSaveFile` has properties incompatible with the encoder's expectations. Either way, the double-cast suppresses type checking at a serialization boundary — a high-risk location for data corruption.

**Severity**: Low-Medium. The structural analysis misses this entirely.

### UC-7: Three session-exempt tools (`help`, `list_workflows`, `health_check`) return no `_meta` at all

**Location**: workflow-tools.ts:28–57, 59–62, 260–269

These tools return `{ content: [...] }` with no `_meta` field. The structural analysis's Expert B describes the skeleton as including "_meta with updated token + validation" but never observes that exempt tools omit `_meta` entirely — not just validation, but the whole metadata envelope. An agent consuming responses uniformly (always reading `_meta`) would get `undefined` for these tools.

### UC-8: `next_activity` trace segment can produce stale activity ID

**Location**: workflow-tools.ts:157

```typescript
act: token.act || activity_id,
```

The trace token payload's `act` field uses `token.act` (the PREVIOUS activity, from before this transition) as its primary value, falling back to `activity_id` (the target activity) only if `token.act` is falsy. This means the trace segment is labeled with the activity being LEFT, not the activity being ENTERED. For the very first `next_activity` call (where `token.act` is empty), it correctly uses the target. For all subsequent calls, the trace is labeled with the previous activity. This labeling inconsistency could confuse trace consumers expecting the segment to reference the current activity.

**Severity**: Low-Medium. The structural analysis mentions the non-null assertions at line 161–162 (bug #6) but completely misses the semantic issue at line 157.

---

## REVISED BUG TABLE

| # | Location | What breaks | Severity | Original classification | My classification | Rationale |
|---|---|---|---|---|---|---|
| 1 | `resource-tools.ts:16` — `loadSkillResources` casts `skillValue` | Null/undefined crash | Low | Fixable | **Fixable (negligible risk)** | Callers always pass `result.value` from successful reads; the scenario requires future misuse of a private function |
| 2 | `resource-tools.ts:97–108` — `get_skills` swallows failures | Silent skill omission | Medium | Structural | **Fixable** | Add failure strings to `buildValidation()` — no schema change needed |
| 3 | `resource-tools.ts:111–114` — `get_skills` omits skill-association | N/A | N/A | Structural (bug) | **Not a bug** | Association is enforced by construction: skills are loaded from the activity's own skill list |
| 4 | `workflow-tools.ts:94` — `initialActivity` cast | Unnecessary cast | Low | Fixable | **Fixable (misdescribed)** | `Workflow` type already includes `initialActivity`; the cast is redundant, not type-hiding |
| 5 | `workflow-tools.ts:134–137` — missing activity-manifest warning | Inconsistent warnings | Low | Structural | **Fixable** | Add 3-line `else` branch mirroring step_manifest pattern |
| 6 | `workflow-tools.ts:161–162` — non-null assertions | Fragile access pattern | Low | Fixable | **Fixable** (agree) | — |
| 7 | `state-tools.ts:36` — `JSON.parse` without try/catch | Raw SyntaxError | Medium | Fixable | **Fixable** (agree) | — |
| 8 | `state-tools.ts:43–47` — hard-coded encryption key | Silent encryption bypass | Medium | Structural | **Fixable** | Extract field list to a constant; no schema coupling required |
| 9 | `state-tools.ts:99–103` — key rotation breaks decrypt | Cryptographic error | Medium | Structural | **Fixable** | Standard key-versioning pattern |
| 10 | `state-tools.ts:34, 89` — no workflow consistency check | Cross-workflow state drift | Medium | Structural | **Fixable** | `state.workflowId` is available from parsed state; validate against token |
| 11 | `workflow-tools.ts:27–57` — `help` hardcodes protocol | Stale documentation | Low | Fixable | **Fixable** (agree) | — |
| 12 | `resource-tools.ts:46` — `'0.0.0'` version fallback | Obscured version drift | Low | Fixable | **Fixable** (agree) | — |
| 13 | `workflow-tools.ts:205` — only `get_activities` checks `token.act` | Undefined behavior | Low | Structural | **Fixable** | Extract `requireCurrentActivity()` guard function |
| **14** | `state-tools.ts:43–47, 99–103` — `_session_token_encrypted` namespace pollution | Forgery vector; crash or information leak | **Medium-High** | **Not in analysis** | **Fixable (security)** | Move flag outside `variables` namespace or use a separate metadata field |
| **15** | `state-tools.ts:59–62, 91` — no path validation | Arbitrary filesystem read/write | **High** | **Not in analysis** | **Fixable (security)** | Add path validation/sandboxing |
| **16** | `resource-tools.ts:68–70` — `start_session` token in content, not `_meta` | Contract violation | **Medium** | **Not in analysis** | **Fixable (design)** | Return token in `_meta.session_token` for consistency, or document the exception |
| **17** | `workflow-tools.ts:253` — `get_trace` silent degradation | No indication tracing is disabled | **Medium** | **Not in analysis** | **Fixable** | Return a `tracing_enabled: false` field or a validation warning |
| **18** | `resource-tools.ts:93–107` — index-based resource deduplication | Silent resource override by load order | **Medium** | **Not in analysis** | **Fixable** | Detect conflicts and warn, or deduplicate by content hash |
| **19** | `state-tools.ts:61` — double type cast for `encodeToon` | Suppressed type checking at serialization | **Low-Medium** | **Not in analysis** | **Fixable** | Fix `encodeToon` signature or add runtime validation |
| **20** | `workflow-tools.ts:157` — trace `act` uses previous activity | Mislabeled trace segments | **Low-Medium** | **Not in analysis** | **Fixable** | Use `activity_id` (target) consistently |
| **21** | `workflow-tools.ts:226–258` — `get_trace` entirely unanalyzed | Tool with no validation, dual-path logic | **Low** | **Not in analysis** | **N/A (coverage gap)** | Include in analysis |

**Summary**: 21 total findings. Original analysis: 13 (6 fixable, 7 structural). Revised: 19 real bugs (all fixable), 1 non-bug (#3), 1 coverage gap (#21). Zero bugs are genuinely structural.

---

## VERDICT ON THE STRUCTURAL ANALYSIS

### Conservation Law — Defeated

"Validation Specificity ↔ Parameter Obligation" is an implementation artifact of the MCP SDK's `server.tool()` API, not a property of the problem space. Discriminated union types demonstrate that specificity and obligation can coexist without trade-off. The law correctly predicts zero structural impossibilities in the codebase.

### Meta-Law — Overstated

"The Conditional Validation Paradox" correctly observes that validation is state-dependent, but calling it a "paradox" overclaims. Session-phase state machines are a well-understood solution pattern. The meta-law's testable prediction (any centralization will lose conditional branches or replicate per-handler logic) is falsified by a state machine design that encodes phases explicitly.

### What the Analysis Got Right

1. The observation that per-tool validation composition is semantically meaningful (not boilerplate) is correct and insightful.
2. The dialectic structure (Expert A/B/C) surfaces real organizational issues in the file layout.
3. The concealment mechanism identification (uniform handler signature hiding different validation obligations) is accurate.
4. The observation that `advanceToken` has different semantics per handler is correct and underexplored.
5. Bug #7 (JSON.parse without try/catch) and Bug #12 (version fallback) are correctly identified and classified.

### What the Analysis Got Wrong

1. Missed an entire tool (`get_trace`), analyzing 12 of 13.
2. Classified a non-bug as a bug (Bug #3: `get_skills` skill-association).
3. Misclassified 6 of 7 structural bugs as unfixable when concrete fixes exist.
4. Missed 8 real bugs, including 2 security issues (path traversal, state namespace forgery).
5. The conservation law has zero predictive power for this codebase.
6. Factual error: claimed `initialActivity` is not on the `Workflow` type when it is.
7. Factual error: claimed state tools "have no `workflow_id` parameter" when `workflowId` is available from parsed state.

---

*Adversarial analysis complete. 21 findings total: 19 confirmed bugs (all fixable), 1 non-bug, 1 coverage gap. Original analysis's structural classification rate: 0/7 confirmed (0%). Two security-class findings missed entirely.*
