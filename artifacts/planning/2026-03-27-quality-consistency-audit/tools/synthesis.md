---
target: src/tools/ (index.ts, workflow-tools.ts, resource-tools.ts, state-tools.ts)
loc: 541
analysis_date: 2026-03-27
lens: L12 synthesis
workflow: prism / synthesis-pass
prior_artifacts:
  - tools/structural-analysis.md (ANALYSIS 1)
  - tools/adversarial-analysis.md (ANALYSIS 2)
---

# L12 Synthesis — `src/tools/`

## 1. Refined Conservation Law

### Original (ANALYSIS 1)

> **Validation Specificity ↔ Parameter Obligation** — In any tool-registration framework for this protocol, the precision of validation (knowing which validations a tool SHOULD run) is conserved against the ability to enforce parameter requirements (knowing which parameters a tool MUST receive).

### Challenge (ANALYSIS 2)

ANALYSIS 2 defeated this law with a discriminated-union counter-design:

```typescript
type WorkflowNavRegistration = {
  category: 'workflow-nav';
  params: z.ZodObject<{ session_token: z.ZodString; workflow_id: z.ZodString }>;
  validates: readonly ['consistency', 'version'];
};
type ActivityNavRegistration = {
  category: 'activity-nav';
  params: z.ZodObject<{ ... ; activity_id: z.ZodString }>;
  validates: readonly ['consistency', 'version', 'transition'];
};
```

Each variant encodes BOTH the exact validation set AND the exact parameter obligations. TypeScript exhaustive matching enforces completeness. The trade-off dissolves: both specificity and obligation are fully encoded per variant. **This refutation is valid.** The original law holds only if you insist on a uniform `server.tool()` callback with optional fields — an implementation choice, not a structural constraint.

### Why the original was incomplete

The original law conflates two independent problems:

1. **Static mapping** (which tool needs which validators) — fully solvable by sum types, as ANALYSIS 2 demonstrates.
2. **Runtime conditionality** (which validators to run depends on session state at call time) — NOT solvable by sum types.

Evidence of runtime conditionality the original law ignores:

| Tool | Conditional validation | Condition |
|---|---|---|
| `next_activity` | `validateStepManifest` | Only when `token.act` exists (workflow-tools.ts:122) |
| `next_activity` | `validateTransitionCondition` | Only when `transition_condition !== undefined && token.act` (workflow-tools.ts:129) |
| `get_skill` | `validateSkillAssociation` | Only when `wfResult.success && token.act` (resource-tools.ts:140) |

These are not category-level requirements — they are per-invocation decisions based on session history.

### Corrected Conservation Law

> **Static Category Completeness ↔ Runtime Condition Expressiveness**
>
> Any tool-registration framework for this protocol can fully encode the static mapping of tools to validation sets and parameter obligations (via discriminated unions or equivalent). However, runtime-conditional validations — where the decision to validate depends on the session state at invocation time, not the tool's identity — resist static encoding because they couple validation to session history. The conservation is between **how much of the protocol can be declared statically** (category, params, base validators) and **how much must remain as runtime logic** (state-dependent validation branches). Centralizing the static portion eliminates the original law's trade-off entirely. The runtime portion is irreducible per-handler logic — but it is a much smaller surface than the original law claims.

### Why the correction holds

ANALYSIS 2's discriminated unions solve the static mapping problem completely. But they cannot express:

- "Validate step manifest IF a previous activity exists" (`next_activity`)
- "Validate skill association IF the workflow loaded AND a current activity exists" (`get_skill`)

These conditions depend on session state (`token.act`), not tool identity. A type system can say "this tool MAY validate step manifests" but cannot enforce "validate step manifests exactly when token.act is truthy." That predicate must live in runtime code. The conservation is real, but its scope is far narrower than ANALYSIS 1 claimed — it covers only the 3 conditional-validation sites above, not the entire validation layer.

---

## 2. Refined Meta-Law

### Original (ANALYSIS 1)

> **The Conditional Validation Paradox** — Validation requirements are conditional on session state. Any centralization will either lose the conditional branches or replicate per-handler logic.

### Challenge (ANALYSIS 2)

ANALYSIS 2 proposed a session-phase state machine:

```typescript
type SessionPhase = 'pre-session' | 'session-started' | 'in-activity';
const PHASE_VALIDATIONS: Record<SessionPhase, ValidationFn[]> = { ... };
```

The challenge: conditional branches map to session phases, which are a well-understood state machine pattern. Calling this a "paradox" overclaims.

### Where the challenge oversimplifies

The state machine captures phase transitions but not the WITHIN-PHASE variance. Within `in-activity`, tools require at least four distinct validation profiles:

| Profile | Tools | Validators |
|---|---|---|
| Navigation (read-only) | `get_workflow`, `get_activities`, `get_checkpoint` | consistency, version |
| Navigation (transition) | `next_activity` | consistency, version, transition, manifest (conditional), condition (conditional) |
| Resource access (bulk) | `get_skills` | consistency, version |
| Resource access (single) | `get_skill` | consistency, version, skill-association (conditional) |
| Trace retrieval | `get_trace` | none |
| State persistence | `save_state`, `restore_state` | none |

A state machine with 3 phases would need per-tool overrides within the `in-activity` phase. This recreates per-handler logic inside the state machine framework — exactly what ANALYSIS 1 predicted. ANALYSIS 2's state machine works for PHASE-LEVEL validation (pre-session gets nothing, session-started gets consistency+version), but within a phase, tool identity determines additional requirements.

### Corrected Meta-Law

> **The Two-Axis Validation Structure**
>
> Validation requirements in this codebase depend on two independent axes: **(1) session phase** (pre-session / session-started / in-activity) and **(2) tool semantic role** (navigation-read, navigation-transition, resource-bulk, resource-single, trace, state). The session phase determines the MINIMUM validator set. The tool role determines ADDITIONAL validators beyond the phase minimum. Any centralization that encodes only one axis (phase-only state machine OR role-only category system) will either over-validate (running unnecessary validators) or under-validate (missing role-specific checks). A correct centralization must encode both axes and their interaction.
>
> **Testable prediction**: If someone implements ANALYSIS 2's state machine with only 3 phases, `get_trace` and `save_state`/`restore_state` will be forced into `in-activity` (since they require a session token), inheriting consistency+version validation they currently don't run. This either (a) surfaces as test failures or behavioral changes (in-activity validation fails for state tools because they lack `workflow_id` as a parameter), or (b) requires adding `get_trace` and state tools as exceptions — which is a second axis emerging from the single-axis design.

---

## 3. Structural vs. Fixable — Definitive Classification

### Resolution methodology

For each disputed bug, I verified the claim and counter-claim against the actual source code. Where ANALYSIS 1 and ANALYSIS 2 disagree, the resolution cites specific lines.

### Resolved bug table

| # | Location | What breaks | Severity | A1 class | A2 class | **Definitive** | Evidence / fix |
|---|---|---|---|---|---|---|---|
| 1 | `resource-tools.ts:16` — `loadSkillResources` casts `skillValue` | Null crash if misused | Low | Fixable | Fixable (negligible) | **Fixable** | Add runtime type guard. Risk is negligible: callers always pass `result.value` from successful reads (lines 101, 143), but the guard costs nothing. |
| 2 | `resource-tools.ts:97–108` — `get_skills` swallows skill-load failures | Silent skill omission | Medium | Structural | Fixable | **Fixable** | A2 is correct: append failure strings to `buildValidation()`. The `buildValidation` function accepts arbitrary string warnings — no schema change needed. The conservation law does not apply because no new parameter obligation is created. |
| 3 | `resource-tools.ts:92,111–114` — `get_skills` omits skill-association validation | Alleged non-associated skill access | Medium | Structural | Not a bug | **Not a bug** | A2 is correct: `get_skills` builds its skill list FROM the activity's declared associations (`skillIds = [activity.skills.primary, ...(activity.skills.supporting ?? [])]` at line 92). Association is enforced by construction. `get_skill` needs explicit validation because it accepts an arbitrary `skill_id`. |
| 4 | `workflow-tools.ts:94` — `initialActivity` type cast | Type-system bypass | Low | Fixable | Fixable (misdescribed) | **Fixable** (misdescribed by A1) | Verified: `WorkflowSchema` includes `initialActivity: z.string().optional()` (workflow.schema.ts:54). The cast is redundant, not type-hiding. Fix: remove the cast and access `wf.initialActivity` directly. |
| 5 | `workflow-tools.ts:133–137` — missing `activity_manifest` warning | Inconsistent manifest warnings | Low | Structural | Fixable | **Fixable** | A2 is correct: add a 3-line `else if (!activity_manifest && token.act)` branch mirroring the `step_manifest` pattern at lines 125–127. No conservation law prevents this — it's a missing else-branch. |
| 6 | `workflow-tools.ts:161–162` — non-null assertions | Fragile access after length check | Low | Fixable | Fixable | **Fixable** | Both agree. Replace `segment.events[0]!` with optional chaining or safe indexing. |
| 7 | `state-tools.ts:36` — `JSON.parse` without try/catch | Raw `SyntaxError` to client | Medium | Fixable | Fixable | **Fixable** | Both agree. Wrap in try/catch with descriptive error message. |
| 8 | `state-tools.ts:43–47` — hard-coded `'session_token'` key | Silent encryption miss on key rename | Medium | Structural | Fixable | **Fixable** | A2 is correct: extract to `const ENCRYPTED_FIELDS = ['session_token'] as const`. The encryption layer can maintain its own field list without schema coupling. |
| 9 | `state-tools.ts:99–103` — key rotation breaks decrypt | Cryptographic error on key change | Medium | Structural | Fixable | **Fixable** | A2 is correct: key versioning (prefix encrypted blob with key ID, store historical keys) is standard engineering. Not structural impossibility — engineering effort. |
| 10 | `state-tools.ts:34,89` — state tools skip workflow consistency | Cross-workflow state drift | Medium | Structural | Fixable | **Fixable** | A1 is factually wrong: `state.workflowId` IS available (state.schema.ts:85, accessed at state-tools.ts:53). Fix: `buildValidation(validateWorkflowConsistency(token, state.workflowId))`. |
| 11 | `workflow-tools.ts:27–57` — `help` hardcodes protocol | Stale documentation | Low | Fixable | Fixable | **Fixable** | Both agree. Extract to shared constant or derive from registrations. |
| 12 | `resource-tools.ts:46` — `'0.0.0'` version fallback | Obscured version-drift warnings | Low | Fixable | Fixable | **Fixable** | Both agree. Warn or fail when workflow lacks version at session start. |
| 13 | `workflow-tools.ts:205` — only `get_activities` checks `token.act` | Missing precondition | Low | Structural | Fixable | **Fixable** | A2 is correct: extract a `requireCurrentActivity(token)` guard. The ad-hoc nature is code organization, not structural impossibility. |
| 14 | `state-tools.ts:43–47, 99–103` — `_session_token_encrypted` pollutes `state.variables` | Forgery vector; flag in user namespace | **Medium-High** | Not found | Fixable (security) | **Fixable (security)** | A2 discovered. The `_session_token_encrypted` boolean is written into the user's `variables` namespace. An agent could forge the flag to cause decrypt of plaintext (crash or corruption) or suppress decrypt of ciphertext (information leak). Fix: move the flag to a dedicated metadata field outside `variables`, or use a structured wrapper around the encrypted token value. |
| 15 | `state-tools.ts:59–62, 91` — no path validation | Arbitrary filesystem read/write | **High** | Not found | Fixable (security) | **Fixable (security — HIGHEST PRIORITY)** | A2 discovered. `save_state` writes to `join(planning_folder_path, STATE_FILENAME)` with `mkdir({ recursive: true })` — no sandboxing. `restore_state` reads from arbitrary `file_path`. Fix: validate paths against a workspace root or allowed directory list. |
| 16 | `resource-tools.ts:68–70` — `start_session` returns token in content, not `_meta` | Violates documented token-update contract | **Medium** | Not found | Fixable (design) | **Fixable (design — protocol violation)** | A2 discovered. The `help` tool documents "Every tool response includes an updated token in `_meta.session_token`" (workflow-tools.ts:48). `start_session` returns the token in the content JSON body at line 68. Fix: return token in `_meta.session_token` for consistency, or update protocol documentation to declare the exception. |
| 17 | `workflow-tools.ts:253` — `get_trace` silent degradation | Cannot distinguish "no events" from "tracing disabled" | **Medium** | Not found | Fixable | **Fixable** | A2 discovered. When `config.traceStore` is undefined, returns `{ events: [], source: 'memory' }` with no warning. Fix: add a `tracing_enabled: boolean` field or a validation warning. |
| 18 | `resource-tools.ts:95–106` — index-based resource deduplication | Silent resource override by load order | **Medium** | Not found | Fixable | **Fixable** | A2 discovered. First-encountered resource with a given index wins; subsequent resources with the same index are silently dropped. Fix: detect index conflicts and warn, or include source skill ID for disambiguation. |
| 19 | `state-tools.ts:61` — `encodeToon` double cast | Suppressed type-checking at serialization boundary | **Low-Medium** | Not found | Fixable | **Fixable** | A2 discovered. `as unknown as Record<string, unknown>` indicates type mismatch between `StateSaveFile` and `encodeToon`'s expected input. Fix: align `encodeToon` signature with the actual input types, or add runtime validation. |
| 20 | `workflow-tools.ts:157` — trace `act` field uses previous activity | Mislabeled trace segments after first transition | **Low-Medium** | Not found | Fixable | **Fixable** | A2 discovered. `act: token.act || activity_id` labels the trace segment with the activity being LEFT (previous), not ENTERED (target), for all calls after the first. Fix: use `activity_id` (the target) consistently. |
| 21 | `workflow-tools.ts:226–258` — `get_trace` entirely omitted from A1 | Unanalyzed tool with zero validation, dual-path logic | **Low** | Not found | Coverage gap | **Coverage gap** | A2 discovered. `get_trace` decodes the session token but runs `buildValidation()` with zero arguments. It has unique dual-path architecture (token-based vs memory-based) and self-excludes from tracing. Not a bug per se, but a significant omission from A1. |

### Summary statistics

- **Total findings**: 21 (13 from A1, 8 from A2)
- **Definitive bugs**: 19
- **Not a bug**: 1 (#3 — skill-association enforced by construction)
- **Coverage gap**: 1 (#21 — `get_trace` omitted from A1)
- **Fixable**: 19/19 (100%)
- **Structural**: 0/19 (0%)
- **Security-class**: 2 (#14 namespace pollution, #15 path traversal)
- **A1 structural → actually fixable**: 6 of 7 reclassified (bugs #2, #5, #8, #9, #10, #13)
- **A1 structural → not a bug**: 1 of 7 (#3)
- **A1 factual errors**: 2 (bug #4 `initialActivity` type claim, bug #10 `workflowId` availability claim)

### Classification of structural vs. fixable

ANALYSIS 2's position — that zero bugs are genuinely structural — is correct when "structural" means "no concrete fix exists." Every individual bug has a clear, implementable fix. ANALYSIS 1's conservation law failed to predict any actual structural impossibility.

However, the PATTERN of bugs is structural in a higher-order sense. 11 of 19 bugs are protocol-conformance violations (tools behaving inconsistently with respect to an implicit protocol). Fixing them individually is possible; preventing the same category of bug from recurring in future tools requires the protocol to become explicit. This is the synthesis insight developed below.

---

## 4. Deepest Finding

### What neither analysis alone could see

**ANALYSIS 1** correctly identified that per-tool validation composition is semantically meaningful — it encodes what protocol guarantees each tool provides. It saw the pattern and called it structural, attributing it to a fundamental conservation law.

**ANALYSIS 2** correctly defeated the conservation law, proved every bug fixable, and discovered 8 additional bugs including 2 security issues. It saw the fixes and called everything an implementation choice.

Neither analysis examined why the bugs exist as a coherent class.

### The three-pass finding

**The tools layer implements an undeclared protocol. Every bug in the table is a protocol-conformance violation undetectable without line-by-line handler inspection.**

The protocol exists only as prose in the `help` tool's hardcoded response (workflow-tools.ts:27–57):

```typescript
session_protocol: {
  token_usage: 'Pass the session_token to all subsequent tool calls...',
  token_update: 'Every tool response includes an updated token in _meta.session_token.',
  token_opacity: 'Treat the token as opaque...',
  validation: 'The server validates each call against the token: workflow consistency,
               activity transition validity, skill-activity association, and version drift.',
  exempt_tools: ['help', 'list_workflows', 'start_session', 'health_check'],
}
```

This prose specification is **both the only protocol definition and already incorrect**:

| Protocol claim | Violation | Bug # |
|---|---|---|
| "Every tool response includes an updated token in `_meta.session_token`" | `start_session` returns token in content body, not `_meta` | #16 |
| "The server validates each call against the token" | `get_trace`, `save_state`, `restore_state` validate nothing | #10, #17 |
| `exempt_tools` lists `start_session` | `start_session` creates tokens — it's not "exempt" but a different lifecycle role | — |
| `exempt_tools` omits `get_trace` | `get_trace` validates nothing, behaves identically to exempt tools | #21 |
| No mention of state tool obligations | State tools have no workflow consistency validation despite having `workflowId` available | #10 |

The protocol specification is prose-only, hardcoded in a response payload, and contradicts the actual implementation in at least 4 places. There is:
- No machine-readable protocol specification
- No protocol conformance type (no TypeScript type enforcing "session-aware tools must return `_meta.session_token`")
- No conformance tests (no test asserting "all non-exempt tools return `_meta`")
- No tool-registration abstraction that could enforce protocol rules

### Why this is the deepest finding

ANALYSIS 1's conservation law is a *description of what happens* when protocol enforcement is left to each handler independently. It's not a structural impossibility — it's a consequence of the missing protocol specification. When each handler independently interprets what the protocol requires, you get exactly the variance ANALYSIS 1 observed: different validation compositions, different token-return behaviors, different precondition checks.

ANALYSIS 2's fixes are all valid, but they treat each bug atomically. Fix bug #10 (add workflow consistency to state tools), fix #16 (move start_session token to `_meta`), fix #17 (warn when tracing disabled) — and you've patched 3 protocol violations while leaving the protocol undeclared. The next tool added to the codebase will face the same ambiguity: what should it validate? Should it return `_meta`? Is it exempt? The developer will reverse-engineer the protocol from existing handlers and likely reproduce the same categories of bugs.

### Testable predictions

1. **Regression prediction**: If a developer adds a new tool (e.g., `get_resources`) by copying an existing handler as a template, the probability of introducing at least one protocol-conformance bug is proportional to which handler they copy. Copying `get_workflow` (full skeleton) produces fewer conformance bugs than copying `get_trace` (degenerate skeleton) or `start_session` (unique lifecycle).

2. **Fix-durability prediction**: Individually fixing bugs #2, #5, #7, #10, #15, #16, #17 without introducing a protocol-conformance layer will leave the codebase with the same class of bugs in any new tool added within 6 months. The bug rate per new tool will match the current rate (~2 conformance violations per handler, based on 11 protocol violations across ~6 session-aware tools).

3. **Protocol-spec prediction**: Introducing a declarative protocol specification (as a TypeScript type or a configuration object that maps tool names to their protocol obligations) would make bugs #2, #5, #10, #13, #16, #17, and #21 detectable at compile time or by automated test. It would also surface the `start_session` lifecycle distinction as a first-class concept rather than a prose exception.

### The finding in one sentence

> The tools layer's bugs are not independent implementation mistakes but systematic symptoms of an undeclared protocol: the session protocol exists only as contradictory prose in the `help` response, and every handler independently interprets what that protocol requires, producing the validation inconsistencies ANALYSIS 1 observed and the fixable-but-recurring bugs ANALYSIS 2 catalogued.

---

## 5. Verification Notes

### Claims verified against source code

| Claim | Source | Verdict | Evidence |
|---|---|---|---|
| "10 repetitions of the skeleton" | A1 §2 | **Wrong** — 6 full, 3 degenerate, 4 none | workflow-tools.ts:28–57 (help: no skeleton), 59–62 (list_workflows: no skeleton), 260–269 (health_check: no skeleton), resource-tools.ts:38–71 (start_session: unique lifecycle) |
| "`initialActivity` bypasses type system" | A1 §12 #4 | **Wrong** — field exists on type | workflow.schema.ts:54 confirms `initialActivity: z.string().optional()` |
| "state tools have no `workflow_id` parameter" | A1 §12 #10 | **Wrong** — available from parsed state | state.schema.ts:85 `workflowId: z.string()`; state-tools.ts:53 accesses it |
| "`get_skills` omits skill-association validation [and this is a bug]" | A1 §12 #3 | **Wrong** — enforced by construction | resource-tools.ts:92 builds skill list from activity's declared associations |
| "No alignment across files" | A1 §2 Expert C | **Overstated** — internal section headers exist | resource-tools.ts:30 `// ============== Session Tools ==============`, line 74 `// ============== Skill Tools ==============` |
| "`get_trace` entirely omitted" | A2 WP-2 | **Correct** | No mention of `get_trace` in A1 bug table or dialectic |
| "Conservation law predictive power is zero" | A2 OC-1 | **Correct for individual bugs** — all fixable | Every proposed fix verified as viable against actual code |
| "State machine solves conditional validation" | A2 OC-3 | **Oversimplified** — 4+ profiles within `in-activity` | get_workflow (consistency+version), next_activity (+transition+manifest), get_skill (+skill-assoc), get_trace (none) |

### A1 accuracy scorecard

- **Correct observations**: Validation composition is semantically meaningful; file organization conceals semantic groupings; `advanceToken` has per-handler semantics; concealment mechanism identification (uniform handler signature)
- **Incorrect claims**: 2 factual errors (#4 type claim, #10 parameter availability); 1 non-bug classified as bug (#3); 6/7 structural classifications overturned; conservation law has no predictive power for fixability; tool count wrong (12 of 13 analyzed)

### A2 accuracy scorecard

- **Correct refutations**: All 5 wrong predictions verified; 6/7 structural reclassifications upheld; all 8 underclaims verified as real
- **Oversimplifications**: State-machine counter to meta-law doesn't account for within-phase variance; "zero structural bugs" is correct per-bug but misses the structural PATTERN

---

*Synthesis complete. 19 definitive bugs, all fixable. 2 security-class findings (path traversal, state namespace forgery). Zero genuinely structural bugs per the original conservation law's definition. The three-pass finding: an undeclared protocol is the root cause of all conformance bugs, and the conservation law is a description of that protocol's absence, not a fundamental constraint.*
