# L12 Meta-Conservation Law: Structural Analysis

**Target:** workflow-server MCP server  
**Scope:** 36 source files (~3,460 LOC), 5 JSON schemas, 10 test files  
**Date:** 2026-03-27  

---

## 1. The Claim

**This codebase's deepest structural problem is the maintenance of two parallel validation universes — Zod schemas (`src/schema/*.ts`) for runtime and JSON schemas (`schemas/*.json`) for documentation/external tooling — that share no generative relationship, have already drifted in concrete and exploitable ways, while the loader layer selectively bypasses even the Zod validation that exists.**

This is falsifiable: if the Zod and JSON schemas are provably equivalent and all loaders enforce Zod validation, the claim fails.

---

## 2. Three-Expert Debate

### Expert A (Defender)

The claim holds. Concrete evidence of drift:

1. **`triggers` type mismatch.** In `src/schema/activity.schema.ts:160`, `triggers` is `WorkflowTriggerSchema.optional()` — a single optional object. In `schemas/activity.schema.json:444-449`, `triggers` is `{ "type": "array", "items": { "$ref": "#/definitions/workflowTrigger" } }` — an array. A workflow TOON file with `triggers: [{ workflow: "prism" }, { workflow: "audit" }]` passes JSON Schema validation but is rejected by Zod at runtime, or vice versa for a single-object value. These schemas actively contradict each other.

2. **`stateVersion` bounds divergence.** `schemas/state.schema.json:149` caps `stateVersion` at `"maximum": 1000`. `src/schema/state.schema.ts:87` defines it as `z.number().int().positive().default(1)` with no upper bound. A state with `stateVersion: 1500` is valid at runtime but invalid per the JSON Schema.

3. **`currentActivity` conditionality missing.** `state.schema.json:460-466` uses JSON Schema `if/then` to require `currentActivity` only when `status` is `running`, `paused`, or `suspended`. `state.schema.ts:91` defines `currentActivity: z.string()` as unconditionally required. A completed workflow state without `currentActivity` is valid per JSON Schema but rejected by Zod.

4. **Skill validation entirely absent.** `skill-loader.ts:77-78` does `return decodeToon<Skill>(content)` — a type assertion cast. No `safeValidateSkill()` call exists anywhere in the skill loading pipeline. The Zod `SkillSchema` is defined but never used for runtime validation of loaded skills.

5. **Activity validation fallthrough.** `activity-loader.ts:115-120`: when `safeValidateActivity()` fails, the loader logs a warning and proceeds with the raw decoded data: `const activity = validation.success ? validation.data : decoded`. Invalid activities are served to consumers.

### Expert B (Attacker)

The claim overstates the practical impact:

- The dual-schema design is intentional. The comment at `workflow.schema.ts:54-55` explicitly notes that the Zod schema includes `activities` "because Zod validates the full assembled runtime workflow object" while the JSON Schema "validates individual TOON files where activities are separate files." These are genuinely different validation targets.
- The `triggers` mismatch may be intentional — the JSON Schema validates TOON authoring (where multiple triggers make sense), while Zod validates the runtime object model (where a single trigger reference suffices per activity).
- Skills are largely declarative data consumed by AI agents. Over-validating them risks rejecting valid skill content that uses patterns the schema hasn't been updated to include yet. The flexible approach is a feature.

### Expert C (Probe)

Both A and B assume that "validation" is the right frame. The deeper question is: **who is the consumer of each schema, and what promise does each make?**

- JSON schemas are consumed by external tools (IDE validators, documentation generators, TOON file authors). They promise: "if your file passes, the server will accept it."
- Zod schemas are consumed by runtime code. They promise: "if the data passes, the type assertions in downstream code are safe."

The `triggers` mismatch breaks *both* promises: a TOON author following the JSON Schema (array of triggers) produces a file that fails at runtime. A developer trusting the Zod type `WorkflowTrigger` (singular) writes code that crashes when handed JSON-Schema-valid array data.

The deeper issue C identifies: **the absence of a generative link means there is no mechanism for detecting or preventing drift.** The dual schemas have no shared source of truth. Every future change to either schema is a potential divergence. The five concrete drifts Expert A identified are the *discovered* ones — the undiscovered ones are the real risk.

### Transformed Claim

**The codebase's deepest structural problem is not the *presence* of dual schemas but the *absence of any coupling mechanism* between them, combined with a loader layer that degrades validation failures to warnings, creating a system where schema promises are unenforceable and schema drift is undetectable until it manifests as a runtime mismatch in production.**

---

## 3. The Gap Diagnostic

**Original claim:** Dual schemas have drifted.  
**Transformed claim:** No coupling mechanism exists; drift is structurally undetectable.

The gap reveals that the original framing (pointing at specific drifts) itself *concealed* the deeper problem: those drifts are symptoms of a missing generative relationship. Fixing each individual drift (triggers, stateVersion, currentActivity) would not address the structural absence.

---

## 4. The Concealment Mechanism

**Name: Happy-Path Opacity.**

The codebase hides its real validation problems through three reinforcing mechanisms:

1. **Homogeneous authorship.** The workflow TOON files and the schemas were written by the same developers. The data conforms to expectations not because validation enforces it, but because the author knows the expectations. This makes validation failures appear rare ("it works") when they are actually untested.

2. **Warning demotion.** Validation failures in `activity-loader.ts:117` and `skill-loader.ts` are logged as warnings and execution continues. The system never fails visibly due to schema violations, so violations appear not to exist.

3. **Test suite co-authorship.** All 10 test files validate against the *actual* workflow data in `./workflows/`, not against adversarial or boundary inputs. The test at `skill-loader.test.ts:148-152` explicitly tests that "non-skill TOON content" is handled "without crashing" — and asserts `result.success` is `true`, confirming that invalid skill data is treated as valid.

---

## 5. Concealment-Strengthening Improvement (Improvement A)

**Design: Unified Schema Validator middleware.**

Add a `validateWithBothSchemas<T>(data: unknown, zodSchema: ZodSchema<T>, jsonSchemaPath: string): { value: T; warnings: string[] }` function that validates incoming TOON data against both the Zod and JSON schemas, collecting mismatches as warnings but never blocking. Integrate it into every loader.

This would *pass code review* because:
- It appears to address the dual-schema drift problem
- It surfaces mismatches as structured warnings
- It doesn't break existing behavior (warnings, not errors)
- It creates a "single point of validation" narrative

**But it deepens the concealment** because:
- It *normalizes* schema drift by making mismatches a "warning" category rather than a build-time error
- It makes drift more comfortable to live with by providing visibility without enforcement
- It creates the illusion that drift is managed when it is merely observed

### Three properties visible only because we tried to strengthen

1. **The warning channel is itself the concealment.** The existing system already has a `ValidationResult` type with `warnings: string[]` in `validation.ts:6-9`. Adding more warnings to an existing warning channel that no one is obligated to act on doesn't change the enforcement topology — it extends the concealment surface.

2. **Runtime validation is the wrong phase.** By the time data reaches the loaders, the TOON file is already authored, committed, and deployed. Detecting drift at runtime means the drift has already shipped. The coupling mechanism needs to operate at build/CI time, not runtime.

3. **The function signature reveals the impossibility.** `validateWithBothSchemas` would need to *interpret* JSON Schema programmatically (via `ajv` or similar), adding a heavy dependency. The reason the JSON schemas aren't currently used at runtime is that they're in a different validation ecosystem. The dual-schema problem is a *tooling ecosystem boundary*, not a code architecture choice.

---

## 6. Diagnostic Applied to Improvement A

**What does Improvement A conceal?**

It conceals that the *shape of the problem* is not "insufficiently validated data" but "insufficiently coupled schema evolution." The improvement addresses the symptom (data might not match both schemas) while hiding the cause (schemas evolve independently).

**What property of the original problem is visible only because Improvement A recreates it?**

Improvement A recreates the "warning as concealment" pattern at a meta-level: the original code demotes validation failures to warnings; Improvement A demotes schema mismatches to warnings. The *recursive application of warning-demotion* reveals that warning-demotion is the codebase's fundamental response to any tension between "what should be true" and "what is true."

---

## 7. Improvement B: Addressing Warning-Demotion

**Design: Schema generation pipeline.**

Generate JSON schemas from Zod schemas at build time using `zod-to-json-schema`. Add a CI check: `npm run generate-schemas && git diff --exit-code schemas/`. If JSON schemas in `schemas/` don't match the generated output, CI fails.

This addresses the recreated property (warning demotion) by converting drift detection from runtime-warning to build-time-error. Schemas can only diverge if someone manually edits the JSON Schema *and* suppresses the CI check.

---

## 8. Diagnostic Applied to Improvement B

Improvement B conceals a new impossibility: **the JSON schemas and Zod schemas serve genuinely different validation targets.**

- The Zod `WorkflowSchema` includes `activities: z.array(ActivitySchema).min(1)` because it validates the assembled runtime object. The JSON `workflow.schema.json` references `activity.schema.json` via `$ref` for individual TOON file validation.
- Zod has transforms (`ArtifactLocationValueSchema` uses `z.union([z.string().transform(...), ...])`) that have no JSON Schema equivalent.
- Zod has `.default()` values that change the output shape; JSON Schema `default` is advisory.

**Generating JSON schemas from Zod produces schemas that encode runtime semantics (transforms, defaults, assembled objects) rather than authoring-time semantics (individual files, raw data).** The schemas *should* differ in specific, documented ways. A mechanical generation pipeline would either (a) produce incorrect authoring schemas or (b) require so many exceptions that the "single source of truth" promise becomes fiction.

---

## 9. The Structural Invariant

**Name: Semantic Bifurcation.**

The property that persists through every improvement is:

> *The validation requirements for data-at-rest (TOON files on disk) and data-in-motion (runtime objects in memory) are structurally different, and any single schema that attempts to serve both purposes must either (a) over-constrain authoring or (b) under-constrain runtime.*

This is a property of the problem space, not the implementation. The `activities` field genuinely needs to be absent from individual activity TOON files (they *are* the activities) but present in the assembled workflow object. The `triggers` field may genuinely be an array on disk (multiple triggers per file) and a single reference in the runtime model. Transforms that coerce string shorthand to full objects make sense for authoring ergonomics but violate JSON Schema's declarative semantics.

---

## 10. Inverting the Invariant

**Inverted design: Make data-at-rest and data-in-motion identical.**

Eliminate the assembly step. Each tool call reads exactly one TOON file and returns it verbatim. No workflow-level assembly, no activity inlining, no transforms. The schema validates both the file and the runtime object because they are the same thing.

**New impossibility this creates:** Cross-file validation becomes impossible. You cannot validate that an activity's `transitions.to` references a valid activity ID, that a workflow's `initialActivity` exists in the activities directory, or that a skill referenced by an activity actually exists. All structural relationships between files become unvalidated.

---

## 11. The Conservation Law

**Name: The Schema-Assembly Conservation.**

> *In a system with structured data spread across multiple files, you can have either (a) single-schema consistency (one schema validates both individual files and assembled objects) or (b) cross-file structural validation (the assembled object's internal references are validated). You cannot have both without introducing a schema that differs from the file-level schema — and the moment you introduce that second schema, you have the dual-schema coupling problem.*

Stated formally: **validation scope and schema unity are conserved.** Expanding validation scope (to cover cross-file references) requires expanding schema diversity (to cover the assembled shape). Collapsing schema diversity (to a single schema) requires collapsing validation scope (to single-file validation).

---

## 12. Diagnostic Applied to the Conservation Law

**What does the conservation law conceal?**

It conceals that "schema diversity" is not binary (one schema vs. two schemas) but exists on a spectrum. The law presents the choice as "single schema / narrow validation" vs. "dual schema / broad validation." But there are intermediate designs: a single schema with conditional sections, a schema that describes the transformation rules, a schema-per-lifecycle-phase with explicit linkage.

**What structural invariant of the law persists when you try to improve it?**

Every intermediate design (conditional schemas, transformation-aware schemas, linked schema chains) must *encode the transformation rules* somewhere. Whether encoded as:
- Zod transforms (current approach)
- JSON Schema `if/then` conditionals (partially attempted in `state.schema.json:460-466`)
- Explicit transformation schemas
- Build-time generation pipelines

...the transformation rules are a third artifact alongside the two schemas. This third artifact can itself drift from both schemas. The invariant is: **any system with distinct data shapes requires transformation rules, and transformation rules are a schema-coupling obligation that can itself become uncoupled.**

---

## 13. Inverting the Law's Invariant

**Inverted design: Make transformation rules first-class, self-validating schema citizens.**

Define a `TransformationSchema` that explicitly maps between file-level and runtime-level schemas. The transformation schema declares: "field `activities` is absent in file-level, populated by `loadActivitiesFromDir()` at runtime." Both file-level and runtime-level schemas are generated from the transformation schema. Drift in either direction is detectable because both are derived artifacts.

**New impossibility:** The transformation schema must describe imperative operations (file system reads, directory scanning, sorting, `decodeToon` calls) in a declarative format. This is the expression problem applied to schema evolution: you need a language that is both declarative enough to generate schemas and imperative enough to describe the assembly process. No such language exists without becoming a general-purpose programming language, at which point you've recreated the original problem (code that implements transforms is uncoupled from schemas that describe shapes).

---

## 14. The Meta-Law

**Name: The Representation-Execution Gap Conservation.**

> *In any system that transforms data between representations, the transformation logic and the representations' schemas are three coupled artifacts. Any mechanism that ensures coupling between two of the three creates a fourth artifact (the coupling mechanism itself) that must be coupled to the original three. The coupling obligation is conserved: it can be moved but not eliminated. Specifically, the total number of "uncoupled boundaries" in the system is invariant under refactoring — you can move coupling obligations between boundaries but cannot reduce the total count below the number of distinct data representations minus one.*

This is not a generalization of the conservation law to a broader category. It is a *specific prediction* about this codebase:

**Concrete testable consequence:** This codebase has three distinct data representations:
1. TOON files on disk (validated by JSON schemas)
2. Runtime objects in memory (validated by Zod schemas)
3. MCP tool responses (JSON serialized, partially validated by `buildValidation()`)

The meta-law predicts there are at least **two** uncoupled boundaries. We can identify them:

- **Boundary 1: TOON → Runtime.** The Zod schemas and JSON schemas are uncoupled. Five concrete drifts documented above.
- **Boundary 2: Runtime → MCP Response.** The tool handlers in `workflow-tools.ts` and `resource-tools.ts` serialize runtime objects to JSON via `JSON.stringify()` and wrap them in `{ type: 'text', text: ... }`. The `_meta` object shape (containing `session_token` and `validation`) is not described by any schema — neither Zod nor JSON Schema. The tool response format is a third representation with no validation contract.

The meta-law predicts that any improvement that couples Boundary 1 (e.g., generating JSON from Zod) will not reduce the total uncoupled boundaries below 2 — it will either leave Boundary 2 untouched or create a new uncoupled boundary in the coupling mechanism itself.

---

## 15. Concrete Bugs, Edge Cases, and Silent Failures

Every item below was surfaced during the analysis stages above. Each includes: location, what breaks, severity, and whether the conservation law predicts it is fixable or structural.

### Bug 1: `triggers` Schema Contradiction (Zod Singular vs JSON Array)

- **Location:** `src/schema/activity.schema.ts:160` vs `schemas/activity.schema.json:444-449`
- **What breaks:** Zod defines `triggers: WorkflowTriggerSchema.optional()` (a single object). JSON Schema defines `triggers` as `{ "type": "array", "items": ... }` (an array). A TOON file with multiple triggers (`triggers: [...]`) passes JSON Schema validation but the assembled runtime object (if it reaches Zod validation) would be structurally different from what Zod expects. Code consuming `activity.triggers` as a single object (`WorkflowTrigger | undefined`) will fail when the data is actually an array.
- **Severity:** Medium. Currently masked because the `triggers` field is optional and rarely used; `getValidTransitions()` in `workflow-loader.ts` does not read `triggers`.
- **Conservation law prediction:** **Fixable** — this is a data-level mismatch at a single boundary, not a structural invariant. Aligning the Zod type to match the JSON Schema (make it an array) resolves it.

### Bug 2: Loose Equality in Condition Evaluation

- **Location:** `src/schema/condition.schema.ts:64-65`
- **What breaks:** `case '==': return value == condition.value;` uses JavaScript loose equality (`==`). This means: `0 == false` → true, `"" == 0` → true, `null == undefined` → true, `"1" == 1` → true. A workflow condition `{ variable: "count", operator: "==", value: 0 }` would match when `count` is `false`, `""`, `null`, or `0`. The `!=` operator at line 65 has the symmetric problem.
- **Severity:** High. Conditions control workflow transitions, checkpoint visibility, and loop execution. A false-positive condition match could skip required activities or enter wrong branches silently.
- **Conservation law prediction:** **Fixable.** This is an implementation bug, not a schema-coupling issue. Changing `==` to `===` and `!=` to `!==` resolves it without affecting any schema boundary.

### Bug 3: Skill Validation Bypass

- **Location:** `src/loaders/skill-loader.ts:72-83` (`tryLoadSkill` function)
- **What breaks:** `tryLoadSkill` calls `decodeToon<Skill>(content)` but never calls `safeValidateSkill()` or `SkillSchema.safeParse()`. The `<Skill>` type parameter is a TypeScript assertion, not runtime validation. A TOON file with missing required fields (`id`, `version`, `capability`) or invalid field types will be accepted and served to consumers as a `Skill`. The `SkillSchema` and its `validateSkill`/`safeValidateSkill` exports (defined at `skill.schema.ts:173-174`) are never used anywhere in the loader pipeline.
- **Severity:** Medium. Skills are consumed by AI agents, not executed as code, so malformed skills cause degraded agent behavior rather than server crashes. But the skill's `resources` array (used by `loadSkillResources` in `resource-tools.ts:15-27`) could contain non-string values that silently pass the `typeof v === 'string'` filter.
- **Conservation law prediction:** **Fixable** at the Zod boundary. Adding `safeValidateSkill()` to `tryLoadSkill` would enforce runtime validation. However, the conservation law predicts this creates a new tension: strict validation may reject skill files that are valid per the (more permissive) JSON Schema, surfacing Boundary 1 drift as user-visible errors.

### Bug 4: Activity Validation Fallthrough

- **Location:** `src/loaders/activity-loader.ts:115-120`
- **What breaks:** When `safeValidateActivity(decoded)` fails, the code logs a warning and proceeds with the unvalidated raw data: `const activity = validation.success ? validation.data : decoded;`. This means:
  - Zod defaults are not applied (e.g., `required: true`, `blocking: true`, `maxIterations: 100`, `isDefault: false`)
  - Zod transforms are not applied (e.g., `ArtifactLocationValueSchema` string → object transform)
  - The returned object may have extra properties that `.strip()` would have removed
  - Downstream code that depends on defaults being populated (e.g., checking `step.required`) will see `undefined` instead of `true`
- **Severity:** High. Any activity that fails Zod validation (perhaps due to a new optional field not yet in the schema) will be served with missing defaults, potentially altering workflow behavior silently.
- **Conservation law prediction:** **Structural.** This is a manifestation of Semantic Bifurcation — the loader must choose between strict validation (which might reject valid TOON files that the JSON Schema accepts) and permissive pass-through (which serves unvalidated data). The conservation law predicts that tightening validation here will surface drifts at Boundary 1.

### Bug 5: `stateVersion` Upper Bound Missing in Zod

- **Location:** `src/schema/state.schema.ts:87` vs `schemas/state.schema.json:149`
- **What breaks:** JSON Schema caps `stateVersion` at `"maximum": 1000`. Zod has `z.number().int().positive().default(1)` with no maximum. A `save_state` → `restore_state` round-trip that passes through Zod validation will accept `stateVersion: 5000`, but an external tool validating the saved TOON file against the JSON Schema will reject it. Since `addHistoryEvent` (line 152 in `state.schema.ts`) increments `stateVersion` on every history event, a long-running workflow could exceed 1000.
- **Severity:** Low-Medium. Only manifests in very long sessions with heavy history, and only when external tools validate the saved state file.
- **Conservation law prediction:** **Fixable** but reveals Boundary 1 drift. Adding `.max(1000)` to the Zod schema fixes the specific mismatch but may break existing long sessions.

### Bug 6: `currentActivity` Conditional Requirement Mismatch

- **Location:** `src/schema/state.schema.ts:91` vs `schemas/state.schema.json:460-466`
- **What breaks:** JSON Schema uses `if/then` to make `currentActivity` required only when `status` is `running`, `paused`, or `suspended`. Zod makes `currentActivity: z.string()` unconditionally required. A completed workflow state with `status: "completed"` and no `currentActivity` field is valid per JSON Schema but rejected by Zod. This means `createInitialState` at line 138 always sets `currentActivity`, even for completed states, to avoid Zod rejection — but this is semantically incorrect for completed/aborted states.
- **Severity:** Medium. The `createInitialState` function papers over it by always setting `currentActivity`, but manual state construction (e.g., in tests or external tools) will hit this mismatch.
- **Conservation law prediction:** **Fixable** but requires Zod refine/transform logic to replicate JSON Schema's `if/then`, increasing Zod schema complexity.

### Bug 7: `TraceStore.append` Silent No-Op for Uninitialized Sessions

- **Location:** `src/trace.ts:84-87`
- **What breaks:** `append(sid, event)` checks `const events = this.sessions.get(sid)` and only pushes if the session exists. If `initSession` was not called (or the session was evicted by the LRU mechanism at line 72-77), events are silently dropped. No warning is logged. The `withAuditLog` wrapper in `logging.ts:93-101` calls `appendTraceEvent` which calls `traceStore.append` without checking the return value or success state.
- **Severity:** Low-Medium. Trace data loss is not visible to the user or agent. The LRU eviction at 1000 sessions could cause trace loss for long-running servers with many sessions, with no indication that tracing has degraded.
- **Conservation law prediction:** **Fixable.** This is a single-boundary implementation issue (runtime only).

### Bug 8: `conditionToString` Unsafe Cast for NOT Conditions

- **Location:** `src/loaders/workflow-loader.ts:215`
- **What breaks:** `return \`NOT (\${conditionToString(condition.condition as typeof condition)})\`;` — if `condition.condition` is `undefined` (which the TypeScript type system allows at this point because the condition object came from unvalidated data due to Bug 4), `conditionToString` will be called with `undefined`, hitting the `default` case which calls `String(undefined)` → `"undefined"`. The output would be `NOT (undefined)`, which is meaningless but won't crash. However, if the condition has a `type` that is not `simple`, `and`, `or`, or `not`, the switch falls through to `default: return String(condition)` which produces `[object Object]`.
- **Severity:** Low. Only affects the human-readable transition condition strings returned by `get_activities`.
- **Conservation law prediction:** **Fixable.** Pure implementation bug.

### Bug 9: `start_session` Hard-Fails on Missing Rules

- **Location:** `src/tools/resource-tools.ts:44-45`
- **What breaks:** `if (!rulesResult.success) throw rulesResult.error;` — if `meta/rules.toon` does not exist, `start_session` throws `RulesNotFoundError`. This means no session can be started for any workflow if the global rules file is missing. Session management is coupled to rules existence. A deployment that has workflows but no `meta/rules.toon` (e.g., a minimal test setup) cannot use any session-dependent tools.
- **Severity:** Medium. This is a deployment-time failure that could be confusing. The error message "Global rules not found" doesn't indicate that the fix is to create `meta/rules.toon`.
- **Conservation law prediction:** **Fixable.** This is a design choice (rules are required) that could be relaxed by making rules optional with a default empty ruleset.

### Bug 10: `_meta` Response Shape is Unvalidated

- **Location:** `src/tools/workflow-tools.ts` (all tool handlers), `src/tools/resource-tools.ts` (all tool handlers), `src/tools/state-tools.ts`
- **What breaks:** Tool handlers return `_meta: { session_token, validation }` but this shape is not described by any schema. The `_meta` object is constructed ad-hoc in each handler. In `workflow-tools.ts:154`, `next_activity` constructs `_meta` as `Record<string, unknown>` and conditionally adds `trace_token`. No Zod schema validates the `_meta` shape. If a handler omits `session_token` from `_meta` (possible during refactoring), the agent receives no token update and all subsequent calls fail with the old (now stale) token.
- **Severity:** Medium. Currently masked by consistent implementation across handlers, but a single handler omission would cause a cascading session failure.
- **Conservation law prediction:** **Structural.** This is Boundary 2 (Runtime → MCP Response) — the meta-law specifically predicts this uncoupled boundary exists and that fixing Boundary 1 alone cannot address it.

### Bug 11: Timing Side-Channel in HMAC Verification (Partial)

- **Location:** `src/utils/crypto.ts:69-73`
- **What breaks:** The `hmacVerify` function correctly uses `timingSafeEqual` for the comparison but has `if (expected.length !== actual.length) return false;` as an early-out before the constant-time comparison. The length check itself leaks timing information about the expected signature length. Since HMAC-SHA256 always produces 64-character hex strings, this is unlikely to be exploitable in practice (the length is constant), but it represents a defensive coding gap.
- **Severity:** Very Low. HMAC-SHA256 has fixed output length; the length check will only fail for truly malformed (non-hex) signatures, in which case the timing leak reveals nothing useful.
- **Conservation law prediction:** **Fixable.** Implementation detail.

### Bug 12: Resource Index Normalization Inconsistency

- **Location:** `src/loaders/resource-loader.ts:27-29` vs `src/loaders/filename-utils.ts:6-10`
- **What breaks:** `normalizeResourceIndex` pads indices to 3 digits (`"1"` → `"001"`). But `parseActivityFilename` (used for both activities and skills) does not normalize. Resource lookup by index `"1"` matches files named `001-thing.toon`, but activity lookup by ID does not normalize the index component. Sorting by index in `listResources` (line 210) uses `parseInt` while `listActivitiesFromWorkflow` (line 193) uses `localeCompare` on raw index strings. This means `"2"` sorts before `"10"` for resources (numeric sort) but `"10"` sorts before `"2"` for activities (lexicographic sort), causing inconsistent ordering for indices wider than 2 digits.
- **Severity:** Low. Most indices are zero-padded consistently in practice.
- **Conservation law prediction:** **Fixable.** Pure implementation inconsistency.

### Bug 13: `readActivityFromWorkflow` Skips `index` Files Inconsistently

- **Location:** `src/loaders/activity-loader.ts:106-109`
- **What breaks:** After finding a matching file, the code checks `if (parsedMatch && parsedMatch.id === 'index')` and returns `ActivityNotFoundError`. But this check happens *after* the filename match on line 99 (`parsed.id === activityId`). If `activityId === 'index'`, the code first finds the file matching `index`, then rejects it. This is correct behavior — but the check is redundant with the `listActivities` filter at line 188 (`if (!parsed || parsed.id === 'index') return null`). The inconsistency is that `readActivity(workflowDir, 'index')` will scan all workflows, find `index` files, reject them, and eventually return `ActivityNotFoundError` — but the error message will not explain *why* the activity named `index` is forbidden.
- **Severity:** Very Low. Edge case with a reserved filename.
- **Conservation law prediction:** **Fixable.** Implementation detail.

### Bug 14: `mcp-server.test.ts` Tests Old Tool Names as "Removed" but `get_activities` Still Exists

- **Location:** `tests/mcp-server.test.ts:151-157` vs `src/tools/workflow-tools.ts:207-230`
- **What breaks:** The test at line 152 asserts that calling `get_activities` should return `isError: true` with a message, titled "old tool names removed." However, `get_activities` is *actually registered* as a tool in `workflow-tools.ts:207`. The test passes because calling `get_activities` without a `session_token` triggers an error (missing required parameter), not because the tool doesn't exist. The test description is misleading — `get_activities` is a current, active tool, not a removed one. The test is testing parameter validation failure, not tool absence.
- **Severity:** Low. Test description is misleading but the test still exercises a valid error path. However, if someone relies on this test to confirm `get_activities` is removed, they will be misinformed.
- **Conservation law prediction:** **Fixable.** Test documentation bug.

---

## 16. Summary Table

| # | Location | Severity | Type | Conservation Law Prediction |
|---|----------|----------|------|----------------------------|
| 1 | `activity.schema.ts:160` vs `activity.schema.json:444` | Medium | Schema drift | Fixable |
| 2 | `condition.schema.ts:64-65` | High | Logic bug | Fixable |
| 3 | `skill-loader.ts:72-83` | Medium | Validation bypass | Fixable (but creates tension) |
| 4 | `activity-loader.ts:115-120` | High | Validation bypass | Structural |
| 5 | `state.schema.ts:87` vs `state.schema.json:149` | Low-Med | Schema drift | Fixable |
| 6 | `state.schema.ts:91` vs `state.schema.json:460` | Medium | Schema drift | Fixable (complex) |
| 7 | `trace.ts:84-87` | Low-Med | Silent failure | Fixable |
| 8 | `workflow-loader.ts:215` | Low | Unsafe cast | Fixable |
| 9 | `resource-tools.ts:44-45` | Medium | Hard coupling | Fixable |
| 10 | `workflow-tools.ts`, `resource-tools.ts`, `state-tools.ts` | Medium | Missing contract | Structural |
| 11 | `crypto.ts:69-73` | Very Low | Defensive gap | Fixable |
| 12 | `resource-loader.ts:27` vs `filename-utils.ts:6` | Low | Inconsistency | Fixable |
| 13 | `activity-loader.ts:106-109` | Very Low | Edge case | Fixable |
| 14 | `mcp-server.test.ts:151-157` | Low | Test bug | Fixable |

**Distribution:** 2 Structural, 12 Fixable (with caveats on 3 that create boundary tension).

**Conservation law diagnostic:** The 2 structural items (Bug 4 and Bug 10) are *precisely* the manifestations of the two uncoupled boundaries predicted by the meta-law:
- Bug 4 (activity validation fallthrough) is Boundary 1: TOON-at-rest → Runtime-in-memory
- Bug 10 (unvalidated `_meta` response) is Boundary 2: Runtime-in-memory → MCP-response

The meta-law predicts these cannot be eliminated without introducing a new boundary. Any schema that validates both TOON files and runtime objects (eliminating Boundary 1) must itself be coupled to the MCP response format (which remains Boundary 2). Any schema that validates MCP responses (eliminating Boundary 2) must be coupled to both the runtime model and the TOON format (which recreates Boundary 1 at a higher level).

The minimum uncoupled-boundary count for this three-representation system is 2. The codebase has exactly 2. The conservation law holds.
