# Workflow Server — Quality & Consistency Audit Report

## Executive Summary

**Scope**: 8 analysis units covering the entire workflow-server codebase — loaders (`src/loaders/`), tools (`src/tools/`), schemas (`src/schema/`), utilities (`src/utils/`), server core (`src/*.ts`), JSON schemas (`schemas/`), tests (`tests/`), and scripts (`scripts/`).

**Total findings**: 140 (after cross-unit deduplication), plus 4 non-defect items classified separately.

| Severity | Count | Fixable | Structural |
|----------|-------|---------|------------|
| Critical | 2 | 2 | 0 |
| Security | 2 | 2 | 0 |
| High | 16 | 12 | 4 |
| Medium | 63 | 49 | 14 |
| Low | 57 | 48 | 8 |
| **Total** | **140** | **113** | **26** |

The Low category includes 2 Low-Medium findings, 1 Trivial finding, and 1 design decision (not a defect). Additionally: 2 non-bugs, 1 coverage gap, and 1 structural impossibility are classified as non-defect items outside the numbered findings.

**Core finding**: The codebase has two deep structural properties that affect every unit. In the loaders, accidental implementation bugs (empty catches, silent nulls, nondeterministic ordering) are indistinguishable from intentional design decisions, making the architecture unknowable until the bugs are fixed. In the tools, an undeclared session protocol — present only as contradictory prose in the `help` response — causes every handler to independently interpret protocol requirements, producing systematic conformance violations.

---

## Core Finding

### Loaders — Accidental inconsistency hides essential inconsistency

The loader modules contain two kinds of behavioral inconsistency that are currently indistinguishable in the code:

1. **Accidental inconsistency** — bugs from copy-paste, missing abstractions, and inattention: empty `catch {}` blocks, silent null returns, nondeterministic ordering, duplicate code, dead code, wrong log severity. These are fixable and have concrete remediation paths.

2. **Essential inconsistency** — cases where the same entity genuinely requires different treatment in different contexts: `loadActivitiesFromDir` must choose whether to include or exclude invalid activities; `listWorkflows` must choose how much to load for a manifest entry; `readSkill` must choose whether a scoped search falls back to global.

In the current codebase, it is impossible to determine which behavioral differences are intentional and which are bugs. For example, `findWorkflowsWithActivities` includes the meta-workflow while `findWorkflowsWithSkills` excludes it — and no comment, test, or documentation indicates whether this is deliberate. Fixing the 25 accidental bugs is a prerequisite for understanding which design tensions are real. The surviving behavioral differences after cleanup (estimated 2–4) will be the genuine architectural decisions the module must address.

### Tools — Undeclared protocol exists only as contradictory prose

The tools layer implements a session protocol that has no machine-readable specification. The protocol exists only as prose in the `help` tool's hardcoded response (`workflow-tools.ts:27–57`), and that prose already contradicts the implementation in at least four places:

| Protocol claim | Reality |
|---|---|
| "Every tool response includes an updated token in `_meta.session_token`" | `start_session` returns the token in the content body, not `_meta` |
| "The server validates each call against the token" | `get_trace`, `save_state`, `restore_state` validate nothing |
| `exempt_tools` lists `start_session` | `start_session` creates tokens — it has a different lifecycle role, not an exemption |
| `exempt_tools` omits `get_trace` | `get_trace` validates nothing, behaving identically to exempt tools |

There is no protocol-conformance type, no conformance tests, and no tool-registration abstraction that could enforce protocol rules. Every handler independently interprets what the protocol requires. The 11 protocol-conformance violations across 6 session-aware tools are not independent implementation mistakes — they are systematic symptoms of the protocol's absence. Any new tool added by copying an existing handler will reproduce the same categories of bugs.

---

## Findings by Severity

### Critical

**QC-001** — The workflow JSON schema's `workflow` definition (`schemas/workflow.schema.json`) has no `activities` property, combined with `additionalProperties: false`. Any workflow JSON containing activities — as documented in every README example — is actively rejected by the schema that claims to define it. The README's primary "Complete Example" is invalid according to the schema it documents. The most important field in the data model is unvalidatable via JSON Schema.

**QC-002** — The workflow JSON schema requires `["id", "version", "title"]` while the Zod schema requires `activities` with a minimum of 1 entry. A workflow with metadata but no activities passes JSON validation but fails Zod. The two schema systems disagree on what constitutes a minimal valid workflow.

### Security

**QC-003** — `save_state` writes to `join(planning_folder_path, STATE_FILENAME)` with `mkdir({ recursive: true })` and no path validation. `restore_state` reads from an arbitrary `file_path` parameter. No sandboxing or path-allowlist exists. An agent can read and write arbitrary filesystem locations. *Severity: High. Highest remediation priority.*

**QC-004** — The `_session_token_encrypted` boolean flag is stored in the user-accessible `variables` namespace of the state object (`state-tools.ts:43–47`). An agent can forge this flag to cause decryption of plaintext (crash or data corruption) or suppress decryption of ciphertext (information leak). The flag must be moved to a dedicated metadata field outside the user namespace. *Severity: Medium-High.*

### High

| ID | Unit | Finding | Classification |
|---|---|---|---|
| QC-005 | loaders | Corrupt skill TOON silently returns `null`; callers see "not found" for an existing-but-corrupt file (`skill-loader.ts:85–87`) | Fixable |
| QC-006 | loaders | Raw decoded object used when validation fails (`workflow-loader.ts:50–52`, `activity-loader.ts:120–125`); the `Activity` type annotation is a lie when validation fails | Fixable |
| QC-007 | loaders | Cross-workflow activity search order is nondeterministic — depends on `readdir` order (`activity-loader.ts:79–86`) | Fixable |
| QC-008 | loaders | Cross-workflow skill search order is nondeterministic — same mechanism as QC-007 (`skill-loader.ts:119–128`) | Fixable |
| QC-009 | loaders | Catch-all in `readActivityFromWorkflow` converts ALL errors (parse, IO, validation) to `ActivityNotFoundError` (`activity-loader.ts:149–151`) | Fixable |
| QC-010 | loaders | `listWorkflows` fully loads every workflow — all activities, full validation — to extract 4 manifest fields (`workflow-loader.ts:131–157`). Most severe performance issue in the module | Fixable |
| QC-011 | loaders | Invalid activity objects are embedded into the workflow and passed to `safeValidateWorkflow`; potential validation bypass (`workflow-loader.ts:48–55, 108, 118`) | Fixable |
| QC-012 | schema | `CheckpointSchema` is missing `defaultOption` and `autoAdvanceMs` fields that exist in the JSON schema (`activity.schema.ts:49–57`). Checkpoint auto-advance data authored against JSON Schema guidance is silently stripped by Zod at runtime | Fixable |
| QC-013 | schema, json-schemas | Condition `and`/`or` items use `"items": {}` and `not.condition` has no type constraint in the JSON schema (`condition.schema.json:64–65, 87–88, 107`). Composite conditions accept any JSON value — recursive validation is entirely defeated | Fixable |
| QC-014 | schema | `ArtifactLocationValueSchema` uses `z.string().transform()` to accept a string shorthand; JSON Schema only defines the object form (`workflow.schema.json:82–101`). Workflow files using the shorthand fail JSON Schema validation in IDEs | Structural |
| QC-015 | utils | `ValidationResult` has only `'valid'` and `'warning'` states — no `'error'` or `'invalid'` state (`validation.ts:5–8`). Every validation failure is downgraded to a warning. The module cannot express "this session is invalid and must be rejected" | Structural |
| QC-016 | tests | Shared mutable `sessionToken` and `traceSessionToken` variables are mutated across sequential tests in `mcp-server.test.ts` (lines 10, 769). A single test failure cascades into all subsequent failures | Structural |
| QC-017 | tests | No tests for malformed TOON data — tests cover file-not-found but not parse-failure paths in `skill-loader.test.ts` and `activity-loader.test.ts`. If the TOON parser silently swallows field errors, these tests will not detect it | Fixable |
| QC-018 | tests | Trace lifecycle `describe` block (`mcp-server.test.ts:740–917`) has sequential test dependencies. Token mutation in each `it` block makes root-cause diagnosis extremely difficult when failures cascade | Structural |
| QC-019 | scripts | `validate-workflow.ts` uses a persisted JSON schema from disk while all three other TypeScript validation scripts import Zod schemas directly. This is architecturally anomalous — it introduces a staleness vector the rest of the portfolio avoids | Fixable |
| QC-020 | scripts | Three independent validation paths exist for activity files: `loadWorkflow()`, per-file `safeValidateActivity()`, and per-file `validateActivityFile()`. These are code duplicates that will drift, producing contradictory validation results | Fixable |

### Medium

#### Loaders (11 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-021 | `parseActivityFilename` duplicated verbatim in `workflow-loader.ts:25` and `activity-loader.ts:22`; drift risk | Fixable |
| QC-022 | Parse error logged at `logInfo` instead of `logWarn`/`logError` in `rules-loader.ts:47` | Fixable |
| QC-023 | Empty `catch {}` in `listWorkflows` (`workflow-loader.ts:156`); filesystem errors invisible | Fixable |
| QC-024 | `readResourceRaw` empty catch swallows all errors (`resource-loader.ts:150–152`) | Fixable |
| QC-025 | `conditionToString` casts without `Array.isArray` guard (`workflow-loader.ts:209, 211, 213`) | Fixable |
| QC-026 | `parseFrontmatter` returns `''` for missing id/version instead of `undefined` (`resource-loader.ts:222–237`) | Fixable |
| QC-027 | Schema list hardcoded separately from `SCHEMA_IDS`; ordering differs (`schema-preamble.ts:30–34` vs `schema-loader.ts:16`) | Fixable |
| QC-028 | `index` activities filtered from listing but loadable by direct read — inconsistent accessibility (`activity-loader.ts:192` vs `106–108`) | Fixable |
| QC-029 | Dual-format resource (`.toon` + `.md`) priority is nondeterministic (`resource-loader.ts:91–107`) | Fixable |
| QC-030 | `findWorkflowsWithActivities` includes meta-workflow; `findWorkflowsWithSkills` excludes it — contradictory filtering (`activity-loader.ts:49–54` vs `skill-loader.ts:63`) | Fixable |
| QC-031 | `readResource` logs errors; `readResourceRaw` in the same file silently swallows them — intra-file policy contradiction (`resource-loader.ts:108–110` vs `150–152`) | Fixable |

#### Tools (8 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-032 | `get_skills` swallows skill-load failures silently (`resource-tools.ts:97–108`); failed skills omitted with no warning | Fixable |
| QC-033 | `JSON.parse` without try/catch in `save_state` (`state-tools.ts:36`); raw `SyntaxError` sent to client | Fixable |
| QC-034 | Hard-coded `'session_token'` key for encryption (`state-tools.ts:43–47`); silent encryption miss on key rename | Fixable |
| QC-035 | Key rotation breaks `decrypt` with no migration path (`state-tools.ts:99–103`) | Fixable |
| QC-036 | State tools skip workflow consistency validation despite `state.workflowId` being available (`state-tools.ts:34, 89`) | Fixable |
| QC-037 | `start_session` returns token in content body, not `_meta.session_token` — violates the documented token-update contract (`resource-tools.ts:68–70`) | Fixable |
| QC-038 | `get_trace` returns empty events with no warning when tracing is disabled; cannot distinguish "no events" from "tracing disabled" (`workflow-tools.ts:253`) | Fixable |
| QC-039 | Index-based resource deduplication silently drops resources with duplicate indices (`resource-tools.ts:95–106`) | Fixable |

#### Schema (5 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-040 | `ArtifactSchema` is missing the `action` field with enum `["create", "update"]` that exists in JSON schema (`activity.schema.ts:111–117`). Server cannot distinguish artifact creation from update at runtime | Fixable |
| QC-041 | `ModeOverrideSchema` is missing `skipCheckpoints` that exists in JSON schema (`activity.schema.ts:120–129`). Checkpoints fire even when the active mode says to skip them | Fixable |
| QC-042 | `.passthrough()` applied to 13 skill sub-schemas but zero activity sub-schemas — skills preserve unknown properties while activities silently strip them. Whether this is intentional is unknowable from the code (`skill.schema.ts` vs `activity.schema.ts`) | Structural |
| QC-043 | `evaluateSimpleCondition` uses `===` for the `==` operator (`condition.schema.ts:63`). String `"true"` does not match boolean `true`; string `"1"` does not match number `1` | Structural |
| QC-044 | Activity JSON schema uses `additionalProperties: true` while Zod uses default `.strip()` (`activity.schema.json:552`). Extra properties survive JSON validation but are silently removed by Zod parsing | Structural |

#### Utils (11 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-045 | TOCTOU race in `getOrCreateServerKey`: `existsSync` check followed by async `readFile` (`crypto.ts:15–17`) | Fixable |
| QC-046 | No validation that key read from disk is exactly 32 bytes; corrupted key produces confusing `createCipheriv` error (`crypto.ts:16`) | Fixable |
| QC-047 | Manual field type checking in `decode` is independent of `SessionPayload` interface; adding a field to the interface requires remembering to add the runtime check (`session.ts:48–52`) | Fixable |
| QC-048 | `return parsed as unknown as SessionPayload` — double cast through `unknown` erases type safety at the decode boundary (`session.ts:55`) | Structural |
| QC-049 | Session timestamp set at creation but never updated on `advanceToken`; no expiration check exists anywhere (`session.ts:70`) | Structural |
| QC-050 | Unsafe type assertions in `validateSkillAssociation` — `(skills as { primary: string }).primary` bypasses type safety (`validation.ts:44–47`) | Fixable |
| QC-051 | Cast to `Record<string, unknown>` to access `steps` property suggests type mismatch between schema and runtime data (`validation.ts:76`) | Fixable |
| QC-052 | `entry.output.trim().length === 0` assumes `output` is a string; `undefined` input throws `TypeError` (`validation.ts:100–103`) | Fixable |
| QC-053 | `validateActivityManifest` ignores the `transition_condition` field entirely (`validation.ts:144–161`). Manifest can claim arbitrary transition conditions without detection | Fixable |
| QC-054 | `decodeToon<T>` uses unsafe `decode(content) as T` cast; shape mismatches after successful parsing are silent (`toon.ts:8`) | Fixable |
| QC-055 | Key generation writes without atomic rename; partial key file possible on crash (`crypto.ts:19–22`) | Fixable |

#### Server Core (5 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-056 | `config.traceStore = new TraceStore()` mutates the passed config; calling `createServer` twice with the same config overwrites the first TraceStore, losing accumulated trace events (`server.ts:11`) | Fixable |
| QC-057 | `TraceStore.sessions` is a `Map` that grows without bound; `initSession` adds entries but nothing removes them; memory leak proportional to session count (`trace.ts:60–61`) | Structural |
| QC-058 | `decodeTraceToken` validates only `sid` and `events` fields; remaining fields (`from`, `to`, `n`, `t0`, `t1`, `ts`) are accepted without validation (`trace.ts:115–118`) | Fixable |
| QC-059 | In `withAuditLog`, `appendTraceEvent` is inside the `try` block; if it throws, the exception is caught as if the tool handler failed, and `appendTraceEvent` is called again in the error path (`logging.ts:69–71, 79`) | Structural |
| QC-060 | `getOrCreateServerKey()` called from both `createTraceToken` and `decodeTraceToken`; concurrent calls before initialization may create two keys (`trace.ts:96, 109`) | Fixable |

#### JSON Schemas (9 findings, after deduplication with schema unit)

| ID | Finding | Classification |
|---|---|---|
| QC-061 | Activity `additionalProperties: true` inconsistent with workflow/condition/state schemas that use `false` (`activity.schema.json:552`). Typos like `"trnasitions"` pass validation | Fixable |
| QC-062 | Skill `additionalProperties: true` — same inconsistency as QC-061, but potentially intentional for extensibility (`skill.schema.json:490`) | Fixable |
| QC-063 | README says checkpoint `blocking` is "Always true"; schema defines it as `default: true` with `autoAdvanceMs` and `defaultOption` for non-blocking operation (`README.md:313` vs `activity.schema.json:147–156`) | Fixable |
| QC-064 | README Action enum lists 4 values; schema defines 5 including `message` (`README.md:378–384` vs `activity.schema.json:12`) | Fixable |
| QC-065 | `currentActivity` is required in state schema even for `completed`/`aborted` workflows (`state.schema.json:447`) | Fixable |
| QC-066 | Relative `$ref` resolution in activity schema depends on validator's base URI; breaks in API-served or bundled contexts (`activity.schema.json:50–51`) | Structural |
| QC-067 | `checkpointOption.effect.setVariable` accepts any value type while `variable.type` constrains to 5 types; cross-schema type consistency gap (`activity.schema.json:87–89`) | Structural |
| QC-068 | Condition `simple.value` type excludes `array` and `object`, but workflow variables can be typed as `array`/`object`; these variables can never have meaningful equality checks (`condition.schema.json:37–43`) | Structural |
| QC-069 | `rules` naming collision: skills use key-value objects (`skill.schema.json:470`), activities/workflows use string arrays (`activity.schema.json:483–488`, `workflow.schema.json:137–143`). Same name, incompatible types | Structural |

#### Tests (9 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-070 | `toBe('3.4.0')` in `workflow-loader.test.ts:36` fails when workflow version bumps — tests data content, not parsing logic | Structural |
| QC-071 | `toBe(14)` in `workflow-loader.test.ts:47` fails when activities are added or removed — tests activity count, not array loading | Structural |
| QC-072 | `toBe(5)` in `schema-loader.test.ts:16` fails when a new schema type is added | Fixable |
| QC-073 | `JSON.parse((result.content[0] as { type: 'text'; text: string }).text)` repeated ~30 times in `mcp-server.test.ts`; unsafe cast, unhelpful error on type mismatch | Fixable |
| QC-074 | `encodeToon(saveFile as unknown as Record<string, unknown>)` double cast bypasses type checking in `state-persistence.test.ts:187` | Fixable |
| QC-075 | `get_skills` response token discarded; subsequent `next_activity` uses a stale token (`mcp-server.test.ts:853–863`) | Fixable |
| QC-076 | Inconsistent path resolution: some files use `process.cwd()`, others use `import.meta.dirname` — CWD-dependent tests fail when run from a different directory | Fixable |
| QC-077 | Schema tests (`schema-validation.test.ts`) don't verify that loaders actually apply schemas; a schema could be defined but never called | Structural |
| QC-078 | No test for concurrent session isolation at the integration level; unit-level `TraceStore` isolation is tested but MCP-level is not | Fixable |

#### Scripts (5 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-079 | Network operations lack timeout/resilience; all git operations except one `timeout 30 git push` are unguarded; CI hangs indefinitely on network issues | Fixable |
| QC-080 | Inconsistent shebang lines: `generate-schemas.ts` uses `tsx`, others use `npx tsx`; resolves to different versions under different PATH/npm configurations | Fixable |
| QC-081 | Inconsistent exit code semantics across shell and TypeScript scripts; function `return 1` propagates differently depending on caller context | Fixable |
| QC-082 | Ajv `strict: false` suppresses schema warnings that could surface schema drift (`validate-workflow.ts:34`) | Fixable |
| QC-083 | Push access to remote repositories assumed but never verified; failed push leaves deployment in partial state — local branches created, submodules referencing non-existent remote branches | Fixable |

### Low

#### Loaders (8 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-084 | Sort re-parses filenames inside comparator; O(n·m·log n) complexity (`workflow-loader.ts:64–69`) | Fixable |
| QC-085 | Regex `\d+` vs `\d{2}` inconsistency between resource and activity/skill filename parsing (`resource-loader.ts:35`) | Fixable |
| QC-086 | Outer try/catch in `schema-loader.ts:39–41` is unreachable defensive code | Fixable |
| QC-087 | `DEFAULT_ACTIVITY_WORKFLOW = 'meta'` defined but unused (`activity-loader.ts:11`) | Fixable |
| QC-088 | `readActivityIndex` repeats readdir calls; directory listings doubled (`activity-loader.ts:239–240`) | Fixable |
| QC-089 | `readSkillIndex` double-readdir; same pattern as QC-088 (`skill-loader.ts:242–254, 266–281`) | Fixable |
| QC-090 | `padStart(2, '0')` breaks for 3+ digit file indices; querying `"1"` for file `001-guide.toon` fails normalized match (`resource-loader.ts:86, 95–96`) | Fixable |
| QC-091 | Providing `workflowId` to `readSkill` searches fewer locations than omitting it — potentially intentional scope restriction, but undocumented (`skill-loader.ts:97–131`) | Design decision |

#### Tools (9 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-092 | `loadSkillResources` casts `skillValue` without runtime type guard; null crash if misused (`resource-tools.ts:16`) | Fixable |
| QC-093 | `initialActivity` type cast is redundant — field exists on the Zod type (`workflow-tools.ts:94`) | Fixable |
| QC-094 | Missing `activity_manifest` warning branch; inconsistent with `step_manifest` warning pattern (`workflow-tools.ts:133–137`) | Fixable |
| QC-095 | Non-null assertions after length check; fragile access pattern (`workflow-tools.ts:161–162`) | Fixable |
| QC-096 | `help` tool hardcodes protocol description; stale documentation risk (`workflow-tools.ts:27–57`) | Fixable |
| QC-097 | `'0.0.0'` version fallback obscures version-drift warnings (`resource-tools.ts:46`) | Fixable |
| QC-098 | Only `get_activities` checks `token.act` as a precondition; ad-hoc rather than systematic (`workflow-tools.ts:205`) | Fixable |
| QC-099 | `encodeToon` double cast suppresses type-checking at serialization boundary (`state-tools.ts:61`) | Fixable |
| QC-100 | Trace `act` field uses previous activity, not the one being entered, after first transition (`workflow-tools.ts:157`) | Fixable |

#### Schema (4 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-101 | `SemanticVersionSchema` regex defined 3 times independently across `workflow.schema.ts:4`, `skill.schema.ts:3`, `activity.schema.ts:4` | Fixable |
| QC-102 | `getVariableValue` returns silent `undefined` on missing path segment; indistinguishable from "path not found" (`condition.schema.ts:48–56`) | Fixable |
| QC-103 | `createInitialState` accepts any string as `initialActivity` without checking it exists in the workflow (`state.schema.ts:134–143`) | Fixable |
| QC-104 | `addHistoryEvent` spreads `details` without validation; arbitrary fields can bypass `HistoryEntrySchema` (`state.schema.ts:148–151`) | Fixable |

#### Utils (8 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-105 | Implicit `Buffer.toString('utf8')` encoding conversion via `+` operator (`crypto.ts:43`) | Fixable |
| QC-106 | `hmacVerify` length check is a timing side-channel; early return before constant-time comparison (`crypto.ts:52`) | Fixable |
| QC-107 | Zod imported but used only for a single descriptor; actual token validation is manual (`session.ts:1`) | Fixable |
| QC-108 | `advanceToken` mutates decoded payload in place; intermediate state was verified in original form but modified before re-encoding (`session.ts:80–88`) | Structural |
| QC-109 | `validateTransitionCondition` conflates empty string, `undefined`, and `'default'` as three representations of the same concept (`validation.ts:109`) | Structural |
| QC-110 | `encodeToon` accepts only `Record<string, unknown>`, silently narrowing the underlying library's capability (`toon.ts:15`) | Fixable |
| QC-111 | Barrel export `index.ts` re-exports only `toon.ts`; `crypto.ts`, `session.ts`, `validation.ts` bypassed — structurally misleading public API (`index.ts:1`) | Fixable |
| QC-112 | Step order validation stops at first mismatch and breaks; subsequent mismatches hidden (`validation.ts:93–98`) | Fixable |

#### Server Core (9 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-113 | Optional `traceStore?` and `schemaPreamble?` are always defined after startup; every consumer must guard unnecessarily (`config.ts:9,11`) | Fixable |
| QC-114 | Double error handler in `main()`: internal catch + outer `.catch()` — if `logError` throws, potential infinite loop or swallowed error (`index.ts:27–30, 33`) | Fixable |
| QC-115 | `randomUUID().slice(0, 8)` truncates to 32 bits of entropy; collision probability ~0.1% at 1,000 events per session (`trace.ts:45`) | Fixable |
| QC-116 | Empty env var `""` treated as valid config via `??` operator; server starts with wrong workflow directory (`config.ts:16`) | Fixable |
| QC-117 | Error code strings (`'WORKFLOW_NOT_FOUND'`, etc.) not type-safe; no shared union type; typos in catch blocks silently fail to match (`errors.ts`) | Fixable |
| QC-118 | `logWarn` produces unbounded JSON output to stderr on invalid tokens; no rate limiting or deduplication (`logging.ts:58`) | Structural |
| QC-119 | `result.ts` `unwrap` wraps non-Error values in `new Error(String(...))`, losing `.code` and custom properties (`result.ts:6`) | Fixable |
| QC-120 | `server.ts:23–29` logs tool list as hardcoded string array; diverges from actual registrations when tools are added | Fixable |
| QC-121 | Audit event timestamp redundancy — multiple potentially-different timestamps in the same log entry (`logging.ts:7–10, 68`) | Fixable |

#### JSON Schemas (6 findings, after deduplication)

| ID | Finding | Classification |
|---|---|---|
| QC-122 | `triggers` property typed as a single object despite plural naming; suggests collection but allows only one (`activity.schema.json:441–443`) | Fixable |
| QC-123 | Ten skill sub-definitions use `additionalProperties: true`, creating a validation void for extension points (`skill.schema.json:42–289`) | Structural |
| QC-124 | `mode.defaults` uses `additionalProperties: {}` (any-typed) inside a `additionalProperties: false` wrapper — asymmetric validation depth (`workflow.schema.json:71`) | Structural |
| QC-125 | `stateVersion` has `exclusiveMinimum: 0, default: 1` but no maximum (`state.schema.json:145–146`) | Fixable |
| QC-126 | State `variables` uses `additionalProperties: {}` with no type constraints; runtime variable types are unvalidated (`state.schema.json:308–309`) | Structural |
| QC-127 | Workflow/activity `rules` are string arrays; skill `rules` are key-value objects — same concept name with incompatible types across schemas (`workflow.schema.json:137–143` vs `skill.schema.json:470`) | Structural |

#### Tests (6 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-128 | Tampered token test appends `x` to base64; may trigger decode error rather than HMAC failure — passes for the wrong reason (`trace.test.ts:166–168`) | Fixable |
| QC-129 | `readRules(WORKFLOW_DIR)` called 5 times without `beforeAll` caching (`rules-loader.test.ts:10–51`) | Fixable |
| QC-130 | Dynamic `import('node:fs/promises')` inside test body while `readFile` is top-level import — inconsistent (`state-persistence.test.ts:261`) | Fixable |
| QC-131 | "Old tool names removed" tests don't verify error message content; generic vs. specific error indistinguishable (`mcp-server.test.ts:143–158`) | Fixable |
| QC-132 | `expect(workflow.version).toBe('3.4.0')` in `mcp-server.test.ts:171` duplicates the data dependency from QC-070; two files must update for one data change | Structural |
| QC-133 | Tampered token test hardcodes field names; if schema adds/removes fields, test passes for wrong reason (`session.test.ts:59`) | Fixable |

#### Scripts (7 findings)

| ID | Finding | Classification |
|---|---|---|
| QC-134 | Self-destructing deploy script deletes itself after successful deployment; no re-run capability, no audit trail (`deploy.sh:580–581`) | Fixable |
| QC-135 | Temp directory cleanup gaps in `ensure_history_branch()`; orphan directories persist on interruption (`deploy.sh:229–262`) | Fixable |
| QC-136 | Shell input sanitization gaps; user-supplied paths and URLs passed directly to `git clone` (`deploy.sh:306`) | Fixable |
| QC-137 | Emoji-dependent output parsing (✅, ❌, ⚠) breaks on terminals with limited Unicode support | Fixable |
| QC-138 | Canonical directory structure assumption — scripts hardcode expectations for `workflow.toon`, `activities/`, `skills/` paths (`validate-workflow-toon.ts:30–66`) | Fixable |
| QC-139 | Source TypeScript imports from `../src/` assume tsx-compatible modules at runtime (`generate-schemas.ts:6–8`) | Fixable |
| QC-140 | TOON decode output assumed schema-conformant; no validation between decode and schema check (`validate-workflow-toon.ts:51`, `validate-activities.ts:32`) | Fixable |

---

## Systemic Findings

### 1. Silent error swallowing across the entire codebase

Twelve findings across loaders, tools, server core, and utils share the same defect pattern: errors caught and silently discarded with no logging, no result propagation, and no way for callers to distinguish "not found" from "found but corrupt."

Affected findings: QC-005, QC-009, QC-023, QC-024, QC-031, QC-032, QC-033, QC-038, QC-058, QC-059, QC-118.

The pattern is not carelessness in any single module — it reflects the absence of a unified error-handling strategy. The `Result` type (`result.ts`) exists but is not consistently used. `ValidationResult` has no error state (QC-015). Error codes are not type-safe (QC-117). The system tolerates drift by design but provides no mechanism to distinguish tolerated drift from actual failures.

### 2. Schema dual-definition divergence

Fourteen findings across the schema and JSON-schemas units stem from the same root cause: the Zod schemas in `src/schema/` and the JSON schemas in `schemas/` describe the same domain model for different consumers but evolve independently with no synchronization mechanism.

Affected findings: QC-001, QC-002, QC-012, QC-013, QC-014, QC-040, QC-041, QC-042, QC-044, QC-061, QC-062, QC-063, QC-064.

The divergence follows a consistent pattern: fields get added to JSON Schema first (because that's where workflow authors work, guided by IDE completion), and the Zod schemas lag behind because runtime code only adds fields when it needs to consume them. The gap between "documented" and "implemented" widens monotonically.

### 3. Nondeterministic behavior in cross-entity operations

Four findings in the loaders produce nondeterministic results depending on filesystem `readdir` ordering or file-matching priority.

Affected findings: QC-007, QC-008, QC-029, QC-084.

All four are fixable by sorting before iteration. The pattern indicates that cross-entity operations (searching across workflows for a skill or resource) were added incrementally without considering ordering guarantees.

### 4. Type safety erosion at data boundaries

Eleven findings across utils, tools, schema, and tests involve unsafe type assertions (`as unknown as T`), double casts through `unknown`, or raw `Record<string, unknown>` access that bypass TypeScript's type system.

Affected findings: QC-048, QC-050, QC-051, QC-054, QC-074, QC-092, QC-093, QC-099, QC-104, QC-105, QC-110.

These casts cluster at external-data boundaries — where TOON content, JSON payloads, or decoded tokens enter the TypeScript type system. The casts hide the fundamental tension: the system ingests untyped external data and must assert it into typed representations, but the assertion mechanism (type cast) provides no runtime safety.

### 5. Test data coupling

Six findings across the test suite reflect coupling between test assertions and mutable workflow data values, making test failures indistinguishable from data evolution.

Affected findings: QC-016, QC-018, QC-070, QC-071, QC-077, QC-132.

The loaders expose functions like `loadWorkflow(dir, id)` that merge I/O, parsing, and validation into a single call. There is no `parseWorkflow(data)` function that could be tested with synthetic data. The test-data coupling is architectural, not a test-quality issue — it is a consequence of the loader API design.

### 6. Documentation-implementation drift

Six findings in the JSON-schemas unit reveal divergences between the README documentation and the actual schema/runtime behavior. These divergences already exist and are testable now.

Affected findings: QC-001, QC-063, QC-064, QC-065, QC-122, QC-127.

The README (1,443 lines) functions as the de facto specification. It contains strictly more information than the schemas — documenting properties the schemas don't define, describing constraints the schema contradicts. Anyone reading only the README never encounters the actual schema constraints.

---

## Corrections Required

Prioritized by impact and dependency ordering. Items marked with severity in parentheses.

### Priority 1 — Security (immediate)

1. **Add path validation to state tools** (QC-003, High). Validate `file_path` and `planning_folder_path` against a workspace root or directory allowlist before any filesystem operation. Reject path traversal sequences.
2. **Move encryption flag out of user namespace** (QC-004, Medium-High). Store `_session_token_encrypted` in a dedicated metadata field outside `state.variables`, or use a structured wrapper around the encrypted token value.

### Priority 2 — Schema alignment (Critical findings)

3. **Add `activities` and `activitiesDir` to workflow JSON schema** (QC-001, Critical). Add both properties to the `workflow` definition and adjust `additionalProperties` accordingly. Update or add `oneOf` to express the loading strategy alternatives.
4. **Align required fields between JSON Schema and Zod** (QC-002, Critical). Decide whether `activities` is required and enforce the decision consistently across both schema systems.
5. **Fix condition schema recursion** (QC-013, High). Replace `"items": {}` with `"items": {"$ref": "#/definitions/condition"}` in `and`/`or` definitions. Add `"$ref": "#/definitions/condition"` to the `not.condition` field.

### Priority 3 — Error transparency (High-severity cluster)

6. **Replace all silent error swallowing with logging + structured results** (QC-005, QC-009, QC-023, QC-024, QC-031). Add `logWarn`/`logError` in catch blocks. Return typed errors via `Result` or `LoadResult<T>`. This is a prerequisite for understanding all other loader issues.
7. **Stop using raw decoded objects when validation fails** (QC-006, QC-011). Either reject invalid entries or surface validation status explicitly via a result type. Do not embed unvalidated objects into typed data structures.

### Priority 4 — Protocol declaration (tools)

8. **Introduce a declarative session protocol specification** (addresses QC-032, QC-036, QC-037, QC-038, QC-098). Define a TypeScript type or configuration object that maps tool names to their protocol obligations (validation set, token return location, exempt status). This makes protocol-conformance violations detectable at compile time or by automated test.
9. **Add workflow consistency validation to state tools** (QC-036). Use `buildValidation(validateWorkflowConsistency(token, state.workflowId))`.

### Priority 5 — Deterministic ordering (loaders)

10. **Sort workflow IDs before cross-workflow iteration** (QC-007, QC-008). Sort `findWorkflowsWithActivities` and `findWorkflowsWithSkills` return values.
11. **Establish format priority for dual-format resources** (QC-029). Sort files before matching or define TOON-over-MD priority.

### Priority 6 — Schema drift reduction

12. **Add missing fields to Zod schemas** (QC-012, QC-040, QC-041). Add `defaultOption`/`autoAdvanceMs` to `CheckpointSchema`, `action` to `ArtifactSchema`, `skipCheckpoints` to `ModeOverrideSchema`.
13. **Align README with schema** (QC-063, QC-064). Update README to document non-blocking checkpoint support and the `message` action.
14. **Eliminate stale-schema validation vector** (QC-019). Make `validate-workflow.ts` import Zod schemas directly, matching the other validation scripts.

### Priority 7 — Shared utilities and deduplication

15. **Extract `parseActivityFilename` to shared module** (QC-021). Create `src/loaders/filename-utils.ts`.
16. **Extract schema ID list to single source** (QC-027). Import and iterate `SCHEMA_IDS` from `schema-loader.ts` in `schema-preamble.ts`.
17. **Consolidate duplicate validation logic in scripts** (QC-020). Extract shared decode-validate-report logic into a single module.

### Priority 8 — Performance

18. **Fix `listWorkflows` full-load issue** (QC-010). Decode only `workflow.toon`, extract manifest fields, skip activity loading. Most impactful single performance fix.
19. **Fix sort re-parse** (QC-084). Sort by `a.artifactPrefix.localeCompare(b.artifactPrefix)` instead of re-parsing filenames in the comparator.

### Priority 9 — Test infrastructure

20. **Add malformed TOON data tests** (QC-017). Create fixtures with missing required fields and wrong types that exercise parse-error paths.
21. **Standardize path resolution on `import.meta.dirname`** (QC-076). Replace all `process.cwd()` path resolution in test files.
22. **Extract `parseToolResponse` helper** (QC-073). Replace the ~30 repetitions of `JSON.parse((result.content[0] as ...).text)`.

---

## Traceability Appendix

Every finding maps to its source artifact, original finding identifier, severity, and classification.

| Report ID | Source Artifact | Original ID | Severity | Classification |
|---|---|---|---|---|
| QC-001 | schema/structural-analysis.md, json-schemas/structural-analysis.md | SCH #1, JSN #1, #2, #21 | Critical | Fixable |
| QC-002 | schema/structural-analysis.md | SCH #14 | Critical | Fixable |
| QC-003 | tools/synthesis.md | TLS #15 | High | Fixable (Security) |
| QC-004 | tools/synthesis.md | TLS #14 | Medium-High | Fixable (Security) |
| QC-005 | loaders/synthesis.md | LDR #2 | High | Fixable |
| QC-006 | loaders/synthesis.md | LDR #4 | High | Fixable |
| QC-007 | loaders/synthesis.md | LDR #8 | High | Fixable |
| QC-008 | loaders/synthesis.md | LDR #9 | High | Fixable |
| QC-009 | loaders/synthesis.md | LDR #21 | High | Fixable |
| QC-010 | loaders/synthesis.md | LDR #22 | High | Fixable |
| QC-011 | loaders/synthesis.md | LDR #25 | High | Fixable |
| QC-012 | schema/structural-analysis.md | SCH #2 | High | Fixable |
| QC-013 | schema/structural-analysis.md, json-schemas/structural-analysis.md | SCH #5, JSN #3, #4, #5 | High | Fixable |
| QC-014 | schema/structural-analysis.md | SCH #6 | High | Structural |
| QC-015 | utils/structural-analysis.md | UTL #10 | High | Structural |
| QC-016 | tests/structural-analysis.md | TST #4 | High | Structural |
| QC-017 | tests/structural-analysis.md | TST #14 | High | Fixable |
| QC-018 | tests/structural-analysis.md | TST #15 | High | Structural |
| QC-019 | scripts/portfolio-synthesis.md | SCR #1 | High | Fixable |
| QC-020 | scripts/portfolio-synthesis.md | SCR #3 | High | Fixable |
| QC-021 | loaders/synthesis.md | LDR #1 | Medium | Fixable |
| QC-022 | loaders/synthesis.md | LDR #3 | Medium | Fixable |
| QC-023 | loaders/synthesis.md | LDR #5 | Medium | Fixable |
| QC-024 | loaders/synthesis.md | LDR #10 | Medium | Fixable |
| QC-025 | loaders/synthesis.md | LDR #12 | Medium | Fixable |
| QC-026 | loaders/synthesis.md | LDR #15 | Medium | Fixable |
| QC-027 | loaders/synthesis.md | LDR #17 | Medium | Fixable |
| QC-028 | loaders/synthesis.md | LDR #18 | Medium | Fixable |
| QC-029 | loaders/synthesis.md | LDR #20 | Medium | Fixable |
| QC-030 | loaders/synthesis.md | LDR #23 | Medium | Fixable |
| QC-031 | loaders/synthesis.md | LDR #24 | Medium | Fixable |
| QC-032 | tools/synthesis.md | TLS #2 | Medium | Fixable |
| QC-033 | tools/synthesis.md | TLS #7 | Medium | Fixable |
| QC-034 | tools/synthesis.md | TLS #8 | Medium | Fixable |
| QC-035 | tools/synthesis.md | TLS #9 | Medium | Fixable |
| QC-036 | tools/synthesis.md | TLS #10 | Medium | Fixable |
| QC-037 | tools/synthesis.md | TLS #16 | Medium | Fixable |
| QC-038 | tools/synthesis.md | TLS #17 | Medium | Fixable |
| QC-039 | tools/synthesis.md | TLS #18 | Medium | Fixable |
| QC-040 | schema/structural-analysis.md | SCH #3 | Medium | Fixable |
| QC-041 | schema/structural-analysis.md | SCH #4 | Medium | Fixable |
| QC-042 | schema/structural-analysis.md | SCH #8 | Medium | Structural |
| QC-043 | schema/structural-analysis.md | SCH #9 | Medium | Structural |
| QC-044 | schema/structural-analysis.md | SCH #13 | Medium | Structural |
| QC-045 | utils/structural-analysis.md | UTL #1 | Medium | Fixable |
| QC-046 | utils/structural-analysis.md | UTL #2 | Medium | Fixable |
| QC-047 | utils/structural-analysis.md | UTL #5 | Medium | Fixable |
| QC-048 | utils/structural-analysis.md | UTL #6 | Medium | Structural |
| QC-049 | utils/structural-analysis.md | UTL #7 | Medium | Structural |
| QC-050 | utils/structural-analysis.md | UTL #11 | Medium | Fixable |
| QC-051 | utils/structural-analysis.md | UTL #12 | Medium | Fixable |
| QC-052 | utils/structural-analysis.md | UTL #13 | Medium | Fixable |
| QC-053 | utils/structural-analysis.md | UTL #15 | Medium | Fixable |
| QC-054 | utils/structural-analysis.md | UTL #16 | Medium | Fixable |
| QC-055 | utils/structural-analysis.md | UTL #20 | Medium | Fixable |
| QC-056 | server-core/structural-analysis.md | SRV #1 | Medium | Fixable |
| QC-057 | server-core/structural-analysis.md | SRV #4 | Medium | Structural |
| QC-058 | server-core/structural-analysis.md | SRV #6 | Medium | Fixable |
| QC-059 | server-core/structural-analysis.md | SRV #7 | Medium | Structural |
| QC-060 | server-core/structural-analysis.md | SRV #10 | Medium | Fixable |
| QC-061 | json-schemas/structural-analysis.md | JSN #6 | Medium | Fixable |
| QC-062 | json-schemas/structural-analysis.md | JSN #7 | Medium | Fixable |
| QC-063 | json-schemas/structural-analysis.md | JSN #10 | Medium | Fixable |
| QC-064 | json-schemas/structural-analysis.md | JSN #11 | Medium | Fixable |
| QC-065 | json-schemas/structural-analysis.md | JSN #12 | Medium | Fixable |
| QC-066 | json-schemas/structural-analysis.md | JSN #14 | Medium | Structural |
| QC-067 | json-schemas/structural-analysis.md | JSN #15 | Medium | Structural |
| QC-068 | json-schemas/structural-analysis.md | JSN #19 | Medium | Structural |
| QC-069 | json-schemas/structural-analysis.md | JSN #22 | Medium | Structural |
| QC-070 | tests/structural-analysis.md | TST #1 | Medium | Structural |
| QC-071 | tests/structural-analysis.md | TST #2 | Medium | Structural |
| QC-072 | tests/structural-analysis.md | TST #3 | Medium | Fixable |
| QC-073 | tests/structural-analysis.md | TST #5 | Medium | Fixable |
| QC-074 | tests/structural-analysis.md | TST #8 | Medium | Fixable |
| QC-075 | tests/structural-analysis.md | TST #9 | Medium | Fixable |
| QC-076 | tests/structural-analysis.md | TST #11 | Medium | Fixable |
| QC-077 | tests/structural-analysis.md | TST #12 | Medium | Structural |
| QC-078 | tests/structural-analysis.md | TST #16 | Medium | Fixable |
| QC-079 | scripts/portfolio-synthesis.md | SCR #2 | Medium | Fixable |
| QC-080 | scripts/portfolio-synthesis.md | SCR #5 | Medium | Fixable |
| QC-081 | scripts/portfolio-synthesis.md | SCR #8 | Medium | Fixable |
| QC-082 | scripts/portfolio-synthesis.md | SCR #10 | Medium | Fixable |
| QC-083 | scripts/portfolio-synthesis.md | SCR #13 | Medium | Fixable |
| QC-084 | loaders/synthesis.md | LDR #6 | Low | Fixable |
| QC-085 | loaders/synthesis.md | LDR #7 | Low | Fixable |
| QC-086 | loaders/synthesis.md | LDR #11 | Low | Fixable |
| QC-087 | loaders/synthesis.md | LDR #13 | Low | Fixable |
| QC-088 | loaders/synthesis.md | LDR #16 | Low | Fixable |
| QC-089 | loaders/synthesis.md | LDR #19 | Low | Fixable |
| QC-090 | loaders/synthesis.md | LDR #27 | Low | Fixable |
| QC-091 | loaders/synthesis.md | LDR #26 | Low | Design decision |
| QC-092 | tools/synthesis.md | TLS #1 | Low | Fixable |
| QC-093 | tools/synthesis.md | TLS #4 | Low | Fixable |
| QC-094 | tools/synthesis.md | TLS #5 | Low | Fixable |
| QC-095 | tools/synthesis.md | TLS #6 | Low | Fixable |
| QC-096 | tools/synthesis.md | TLS #11 | Low | Fixable |
| QC-097 | tools/synthesis.md | TLS #12 | Low | Fixable |
| QC-098 | tools/synthesis.md | TLS #13 | Low | Fixable |
| QC-099 | tools/synthesis.md | TLS #19 | Low-Medium | Fixable |
| QC-100 | tools/synthesis.md | TLS #20 | Low-Medium | Fixable |
| QC-101 | schema/structural-analysis.md | SCH #7 | Low | Fixable |
| QC-102 | schema/structural-analysis.md | SCH #10 | Low | Fixable |
| QC-103 | schema/structural-analysis.md | SCH #11 | Low | Fixable |
| QC-104 | schema/structural-analysis.md | SCH #12 | Low | Fixable |
| QC-105 | utils/structural-analysis.md | UTL #3 | Low | Fixable |
| QC-106 | utils/structural-analysis.md | UTL #4 | Low | Fixable |
| QC-107 | utils/structural-analysis.md | UTL #8 | Low | Fixable |
| QC-108 | utils/structural-analysis.md | UTL #9 | Low | Structural |
| QC-109 | utils/structural-analysis.md | UTL #14 | Low | Structural |
| QC-110 | utils/structural-analysis.md | UTL #17 | Low | Fixable |
| QC-111 | utils/structural-analysis.md | UTL #18 | Low | Fixable |
| QC-112 | utils/structural-analysis.md | UTL #19 | Low | Fixable |
| QC-113 | server-core/structural-analysis.md | SRV #2 | Low | Fixable |
| QC-114 | server-core/structural-analysis.md | SRV #3 | Low | Fixable |
| QC-115 | server-core/structural-analysis.md | SRV #5 | Low | Fixable |
| QC-116 | server-core/structural-analysis.md | SRV #8 | Low | Fixable |
| QC-117 | server-core/structural-analysis.md | SRV #9 | Low | Fixable |
| QC-118 | server-core/structural-analysis.md | SRV #11 | Low | Structural |
| QC-119 | server-core/structural-analysis.md | SRV #12 | Low | Fixable |
| QC-120 | server-core/structural-analysis.md | SRV #14 | Low | Fixable |
| QC-121 | server-core/structural-analysis.md | SRV #13 | Trivial | Fixable |
| QC-122 | json-schemas/structural-analysis.md | JSN #13 | Low | Fixable |
| QC-123 | json-schemas/structural-analysis.md | JSN #16 | Low | Structural |
| QC-124 | json-schemas/structural-analysis.md | JSN #17 | Low | Structural |
| QC-125 | json-schemas/structural-analysis.md | JSN #18 | Low | Fixable |
| QC-126 | json-schemas/structural-analysis.md | JSN #20 | Low | Structural |
| QC-127 | json-schemas/structural-analysis.md | JSN #23 | Low | Structural |
| QC-128 | tests/structural-analysis.md | TST #6 | Low | Fixable |
| QC-129 | tests/structural-analysis.md | TST #7 | Low | Fixable |
| QC-130 | tests/structural-analysis.md | TST #10 | Low | Fixable |
| QC-131 | tests/structural-analysis.md | TST #13 | Low | Fixable |
| QC-132 | tests/structural-analysis.md | TST #17 | Low | Structural |
| QC-133 | tests/structural-analysis.md | TST #18 | Low | Fixable |
| QC-134 | scripts/portfolio-synthesis.md | SCR #4 | Low | Fixable |
| QC-135 | scripts/portfolio-synthesis.md | SCR #6 | Low | Fixable |
| QC-136 | scripts/portfolio-synthesis.md | SCR #7 | Low | Fixable |
| QC-137 | scripts/portfolio-synthesis.md | SCR #9 | Low | Fixable |
| QC-138 | scripts/portfolio-synthesis.md | SCR #11 | Low | Fixable |
| QC-139 | scripts/portfolio-synthesis.md | SCR #12 | Low | Fixable |
| QC-140 | scripts/portfolio-synthesis.md | SCR #14 | Low | Fixable |

### Non-defect items

| Source | Original ID | Classification |
|---|---|---|
| loaders/synthesis.md | LDR #14 | Not a bug — TypeScript `Activity \| undefined` return type enforces null-checks at compile time |
| tools/synthesis.md | TLS #3 | Not a bug — `get_skills` skill-association enforced by construction |
| tools/synthesis.md | TLS #21 | Coverage gap — `get_trace` omitted from first-pass analysis |
| scripts/portfolio-synthesis.md | SCR #15 | Structural impossibility — developer convenience × operational reliability × canonical validation cannot coexist |

### Source artifact paths

All artifacts are relative to `.engineering/artifacts/prism-analysis/`:

| Short name | File path |
|---|---|
| loaders/synthesis.md | `loaders/synthesis.md` |
| loaders/structural-analysis.md | `loaders/structural-analysis.md` |
| loaders/adversarial-analysis.md | `loaders/adversarial-analysis.md` |
| tools/synthesis.md | `tools/synthesis.md` |
| tools/structural-analysis.md | `tools/structural-analysis.md` |
| tools/adversarial-analysis.md | `tools/adversarial-analysis.md` |
| schema/structural-analysis.md | `schema/structural-analysis.md` |
| utils/structural-analysis.md | `utils/structural-analysis.md` |
| server-core/structural-analysis.md | `server-core/structural-analysis.md` |
| json-schemas/structural-analysis.md | `json-schemas/structural-analysis.md` |
| tests/structural-analysis.md | `tests/structural-analysis.md` |
| scripts/portfolio-degradation.md | `scripts/portfolio-degradation.md` |
| scripts/portfolio-claim.md | `scripts/portfolio-claim.md` |
| scripts/portfolio-synthesis.md | `scripts/portfolio-synthesis.md` |
