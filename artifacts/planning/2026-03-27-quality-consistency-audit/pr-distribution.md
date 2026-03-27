# PR Distribution — Quality & Consistency Audit Remediation

Derived from the 140 findings in REPORT.md. PRs are ordered by dependency — earlier PRs unblock later ones. Each PR targets a cohesive module or concern to keep diffs reviewable.

## Dependency Graph

```
PR-1 (security) ─────────────────────────────────────────────┐
PR-2 (JSON schemas) ──┬──> PR-4 (schema alignment) ─────────┤
PR-3 (Zod schemas) ───┘                                     ├──> PR-9 (tests)
PR-5 (loader errors) ──> PR-6 (loader determinism) ──────────┤
PR-7 (tools protocol) ───────────────────────────────────────┤
PR-8 (utils) ────────────────────────────────────────────────┘
PR-10 (server core) ─────────────────────────────────────────
PR-11 (scripts) ─────────────────────────────────────────────
PR-12 (docs) ─────────────────────────── runs last, reflects final state
```

PRs 1, 2, 3, 5, 7, 8, 10, 11 have no mutual dependencies and can run in parallel. PR-4 merges after 2+3. PR-6 merges after 5. PR-9 merges after 5–8. PR-12 merges last.

---

## PR-1: Security hardening for state tools

**Scope**: `src/tools/state-tools.ts`

| Finding | Description |
|---------|-------------|
| QC-003 | Path traversal — `save_state` / `restore_state` accept arbitrary filesystem paths |
| QC-004 | Encryption flag stored in user-accessible `variables` namespace |

**Rationale**: Security findings ship independently and first.

---

## PR-2: JSON Schema corrections

**Scope**: `schemas/*.json`, `schemas/README.md`

| Finding | Description |
|---------|-------------|
| QC-001 | Workflow schema missing `activities` property (Critical) |
| QC-013 | Condition `and`/`or` items accept any JSON — recursive validation defeated |
| QC-061 | Activity `additionalProperties: true` inconsistent with other schemas |
| QC-062 | Skill `additionalProperties: true` — same inconsistency |
| QC-065 | `currentActivity` required even for completed/aborted workflows |
| QC-066 | Relative `$ref` resolution breaks in bundled contexts |
| QC-067 | `setVariable` accepts any value type; no cross-schema type consistency |
| QC-068 | Condition `simple.value` excludes array/object but variables allow them |
| QC-069 | `rules` naming collision — string arrays vs key-value objects across schemas |
| QC-122 | `triggers` typed as single object despite plural naming |
| QC-123 | Ten skill sub-definitions use `additionalProperties: true` |
| QC-124 | `mode.defaults` asymmetric validation depth |
| QC-125 | `stateVersion` has no maximum |
| QC-126 | State `variables` untyped `additionalProperties` |
| QC-127 | `rules` incompatible types across workflow/activity vs skill schemas |

**Rationale**: All changes are in `schemas/` JSON files. Critical fix QC-001 anchors this PR.

---

## PR-3: Zod schema alignment

**Scope**: `src/schema/*.ts`

| Finding | Description |
|---------|-------------|
| QC-002 | Required-field mismatch between JSON Schema and Zod (Critical) |
| QC-012 | CheckpointSchema missing `defaultOption` and `autoAdvanceMs` |
| QC-040 | ArtifactSchema missing `action` field |
| QC-041 | ModeOverrideSchema missing `skipCheckpoints` |
| QC-042 | `.passthrough()` on skill schemas but not activity schemas |
| QC-043 | `evaluateSimpleCondition` uses `===` for `==` operator |
| QC-044 | Activity JSON allows extra properties; Zod strips them |
| QC-101 | SemanticVersionSchema regex defined 3 times independently |
| QC-102 | `getVariableValue` returns silent `undefined` on missing path segment |
| QC-103 | `createInitialState` accepts any string as `initialActivity` |
| QC-104 | `addHistoryEvent` spreads `details` without validation |

**Rationale**: All changes are in `src/schema/`. Critical fix QC-002 anchors this PR.

---

## PR-4: Cross-schema consistency enforcement

**Scope**: `schemas/`, `src/schema/`, `scripts/generate-schemas.ts`

**Depends on**: PR-2, PR-3

| Finding | Description |
|---------|-------------|
| QC-014 | ArtifactLocationValue string shorthand accepted by Zod, rejected by JSON Schema |
| QC-019 | `validate-workflow.ts` uses persisted JSON schema instead of Zod imports |
| QC-027 | Schema list hardcoded separately from `SCHEMA_IDS` |

**Rationale**: After both schema systems are individually fixed (PR-2, PR-3), this PR addresses the cross-schema synchronization gap. Evaluate whether `generate-schemas.ts` can derive JSON schemas from Zod to prevent future drift.

---

## PR-5: Loader error handling and validation

**Scope**: `src/loaders/*.ts`

| Finding | Description |
|---------|-------------|
| QC-005 | Corrupt skill TOON silently returns `null` |
| QC-006 | Raw decoded object used when validation fails |
| QC-009 | Catch-all converts ALL errors to ActivityNotFoundError |
| QC-010 | `listWorkflows` fully loads every workflow for 4 manifest fields |
| QC-011 | Invalid activity objects embedded into workflow |
| QC-022 | Parse error logged at `logInfo` instead of `logWarn`/`logError` |
| QC-023 | Empty `catch {}` in `listWorkflows` |
| QC-024 | `readResourceRaw` empty catch swallows all errors |
| QC-025 | `conditionToString` casts without `Array.isArray` guard |
| QC-026 | `parseFrontmatter` returns `''` for missing id/version |
| QC-028 | `index` activities filtered from listing but loadable by direct read |
| QC-031 | Intra-file error policy contradiction (`readResource` vs `readResourceRaw`) |

**Rationale**: The error-handling systemic pattern is concentrated in loaders. Fixing error transparency here is a prerequisite for the determinism PR (PR-6) — nondeterministic behavior is harder to diagnose when errors are swallowed. Includes the `listWorkflows` performance fix (QC-010) since it requires the same loader restructuring.

---

## PR-6: Loader determinism and deduplication

**Scope**: `src/loaders/*.ts`

**Depends on**: PR-5

| Finding | Description |
|---------|-------------|
| QC-007 | Cross-workflow activity search nondeterministic |
| QC-008 | Cross-workflow skill search nondeterministic |
| QC-021 | `parseActivityFilename` duplicated verbatim |
| QC-029 | Dual-format resource priority nondeterministic |
| QC-030 | Contradictory meta-workflow filtering |
| QC-084 | Sort re-parses filenames inside comparator |
| QC-085 | Regex inconsistency between resource and activity filename parsing |
| QC-086 | Unreachable defensive code in schema-loader |
| QC-087 | `DEFAULT_ACTIVITY_WORKFLOW` defined but unused |
| QC-088 | `readActivityIndex` repeats readdir calls |
| QC-089 | `readSkillIndex` double-readdir |
| QC-090 | `padStart(2, '0')` breaks for 3+ digit indices |

**Rationale**: After error handling is transparent (PR-5), determinism fixes become verifiable. Groups all remaining loader findings including low-severity cleanup.

---

## PR-7: Tools session protocol

**Scope**: `src/tools/*.ts`

| Finding | Description |
|---------|-------------|
| QC-032 | `get_skills` swallows skill-load failures silently |
| QC-033 | `JSON.parse` without try/catch in `save_state` |
| QC-034 | Hard-coded `'session_token'` key for encryption |
| QC-035 | Key rotation breaks decrypt with no migration path |
| QC-036 | State tools skip workflow consistency validation |
| QC-037 | `start_session` returns token in body, not `_meta` |
| QC-038 | `get_trace` indistinguishable "no events" vs "tracing disabled" |
| QC-039 | Index-based resource deduplication silently drops duplicates |
| QC-092 | `loadSkillResources` cast without runtime type guard |
| QC-093 | Redundant `initialActivity` type cast |
| QC-094 | Missing `activity_manifest` warning branch |
| QC-095 | Non-null assertions after length check |
| QC-096 | `help` tool hardcodes protocol description |
| QC-097 | `'0.0.0'` version fallback obscures warnings |
| QC-098 | Only `get_activities` checks `token.act` precondition |
| QC-099 | `encodeToon` double cast at serialization boundary |
| QC-100 | Trace `act` field uses previous activity after transition |

**Rationale**: All tool-layer findings, anchored by the protocol-declaration work (QC-032/036/037/038/098). Self-contained in `src/tools/`.

---

## PR-8: Utils hardening

**Scope**: `src/utils/*.ts`

| Finding | Description |
|---------|-------------|
| QC-015 | `ValidationResult` has no error/invalid state |
| QC-045 | TOCTOU race in `getOrCreateServerKey` |
| QC-046 | No validation that key is exactly 32 bytes |
| QC-047 | Manual field type checking independent of `SessionPayload` interface |
| QC-048 | Double cast through `unknown` erases type safety at decode boundary |
| QC-049 | Session timestamp never updated; no expiration check |
| QC-050 | Unsafe type assertions in `validateSkillAssociation` |
| QC-051 | Cast to `Record<string, unknown>` to access `steps` |
| QC-052 | `entry.output.trim()` throws on `undefined` input |
| QC-053 | `validateActivityManifest` ignores `transition_condition` |
| QC-054 | `decodeToon<T>` unsafe cast |
| QC-055 | Key generation writes without atomic rename |
| QC-105 | Implicit Buffer encoding conversion |
| QC-106 | `hmacVerify` length check is timing side-channel |
| QC-107 | Zod imported but used only for a single descriptor |
| QC-108 | `advanceToken` mutates decoded payload before re-encoding |
| QC-109 | `validateTransitionCondition` conflates empty/undefined/default |
| QC-110 | `encodeToon` silently narrows library capability |
| QC-111 | Barrel export re-exports only `toon.ts` |
| QC-112 | Step order validation stops at first mismatch |

**Rationale**: Self-contained in `src/utils/`. QC-015 (ValidationResult lacking error state) is foundational — it affects error handling across tools and loaders.

---

## PR-9: Test infrastructure

**Scope**: `tests/*.ts`

**Depends on**: PR-5, PR-6, PR-7, PR-8 (tests validate changes in those PRs)

| Finding | Description |
|---------|-------------|
| QC-016 | Shared mutable `sessionToken` cascades failures |
| QC-017 | No tests for malformed TOON data |
| QC-018 | Trace lifecycle sequential test dependencies |
| QC-070 | `toBe('3.4.0')` fails on version bumps |
| QC-071 | `toBe(14)` fails on activity count changes |
| QC-072 | `toBe(5)` fails on schema type additions |
| QC-073 | `JSON.parse(...)` cast repeated ~30 times |
| QC-074 | `encodeToon` double cast in tests |
| QC-075 | `get_skills` response token discarded; stale token used |
| QC-076 | Inconsistent path resolution (`process.cwd()` vs `import.meta.dirname`) |
| QC-077 | Schema tests don't verify loaders apply schemas |
| QC-078 | No test for concurrent session isolation |
| QC-128 | Tampered token test may pass for wrong reason |
| QC-129 | `readRules` called 5 times without caching |
| QC-130 | Dynamic import inconsistency in test body |
| QC-131 | Removed tool tests don't verify error message content |
| QC-132 | Duplicate data dependency with QC-070 |
| QC-133 | Tampered token test hardcodes field names |

**Rationale**: Tests should be updated after the modules they test are fixed. Structural findings QC-016/018 (shared mutable state causing cascading failures) are the highest-value fixes here.

---

## PR-10: Server core cleanup

**Scope**: `src/index.ts`, `src/server.ts`, `src/config.ts`, `src/errors.ts`, `src/logging.ts`, `src/trace.ts`, `src/result.ts`

| Finding | Description |
|---------|-------------|
| QC-056 | `createServer` mutates passed config |
| QC-057 | `TraceStore.sessions` grows without bound (memory leak) |
| QC-058 | `decodeTraceToken` validates only 2 of 8 fields |
| QC-059 | `appendTraceEvent` inside try block causes double-append on error |
| QC-060 | Concurrent `getOrCreateServerKey` calls may create two keys |
| QC-113 | Optional config fields always defined after startup |
| QC-114 | Double error handler in `main()` |
| QC-115 | `randomUUID().slice(0, 8)` truncates to 32 bits of entropy |
| QC-116 | Empty env var treated as valid config |
| QC-117 | Error code strings not type-safe |
| QC-118 | `logWarn` produces unbounded JSON output |
| QC-119 | `unwrap` loses `.code` and custom properties |
| QC-120 | Tool list logged as hardcoded string array |
| QC-121 | Audit event timestamp redundancy |

**Rationale**: Self-contained in root `src/` files. No dependency on other PRs.

---

## PR-11: Scripts cleanup

**Scope**: `scripts/*.ts`, `scripts/*.sh`

| Finding | Description |
|---------|-------------|
| QC-020 | Three independent validation paths for activity files |
| QC-079 | Network operations lack timeout/resilience |
| QC-080 | Inconsistent shebang lines |
| QC-081 | Inconsistent exit code semantics |
| QC-082 | Ajv `strict: false` suppresses schema warnings |
| QC-083 | Push access assumed but never verified |
| QC-134 | Deploy script deletes itself |
| QC-135 | Temp directory cleanup gaps |
| QC-136 | Shell input sanitization gaps |
| QC-137 | Emoji-dependent output parsing |
| QC-138 | Canonical directory structure assumption |
| QC-139 | Source TypeScript imports assume tsx-compatible modules |
| QC-140 | TOON decode output assumed schema-conformant |

**Rationale**: Self-contained in `scripts/`. No dependency on other PRs.

---

## PR-12: Documentation alignment

**Scope**: `schemas/README.md`

**Depends on**: All other PRs (reflects final state)

| Finding | Description |
|---------|-------------|
| QC-063 | README says checkpoint `blocking` is "Always true"; schema supports non-blocking |
| QC-064 | README Action enum lists 4 values; schema defines 5 |

**Rationale**: Documentation updates should reflect the final state of schemas and code after all fixes land.

---

## Summary

| PR | Scope | Findings | Severity coverage |
|----|-------|----------|-------------------|
| PR-1 | State tools security | 2 | 2 Security |
| PR-2 | JSON schemas | 15 | 1 Critical, 2 High, 7 Medium, 5 Low |
| PR-3 | Zod schemas | 11 | 1 Critical, 2 High, 4 Medium, 4 Low |
| PR-4 | Cross-schema sync | 3 | 1 High, 2 Medium |
| PR-5 | Loader errors | 12 | 6 High, 6 Medium |
| PR-6 | Loader determinism | 12 | 2 High, 2 Medium, 8 Low |
| PR-7 | Tools protocol | 17 | 8 Medium, 9 Low |
| PR-8 | Utils hardening | 20 | 1 High, 11 Medium, 8 Low |
| PR-9 | Tests | 18 | 2 High, 7 Medium, 9 Low |
| PR-10 | Server core | 14 | 5 Medium, 9 Low |
| PR-11 | Scripts | 13 | 2 High, 5 Medium, 6 Low |
| PR-12 | Documentation | 2 | 2 Medium |
| **Total** | | **139** | |

One finding (QC-091, design decision) is excluded — no action required.

## Parallelism

Maximum parallel lanes: **7** (PRs 1, 2, 3, 5, 7, 8, 10, 11 have no mutual dependencies).

Critical path: PR-2 + PR-3 → PR-4 → PR-12, or PR-5 → PR-6 → PR-9.
