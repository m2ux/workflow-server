# Comprehension: Utils Layer

**Date:** 2026-04-26
**Last updated:** 2026-06-18
**Coverage:** `src/utils/` — `validation.ts`, `toon.ts`, `index.ts`, and the `session/` subdirectory (`crypto.ts`, `derivation.ts`, `params.ts`, `resolver.ts`, `store.ts`, `migration.ts`, `index.ts`)

## Architecture

The utils layer provides foundational services consumed by every other module in the workflow server:

- **session/** — Session lifecycle. Session state is a JSON file (`session.json`) sealed by an HMAC over its canonical bytes (`.session-token`), living in a planning folder under `.engineering/artifacts/planning/`. A session is addressed by a stable 6-character base32 `session_index` derived (HMAC-SHA-256) from the folder's canonical path. The subdirectory splits the concern across:
  - `crypto.ts` — Server key management. A 32-byte key is stored at `~/.workflow-server/secret` (mode `0600`, dir `0700`); HMAC-SHA-256 signing (`hmacSign`) and timing-safe verification (`hmacVerify`). Consumed by `store.ts`/`derivation.ts` for seal + index derivation and by `trace.ts` for trace-token signing.
  - `derivation.ts` — Pure index derivation. RFC 4648 base32 (uppercase, no padding) encoding of an HMAC digest truncated to 30 bits → 6 chars. `computeSessionIndex(folder)` and `computeEmbeddedSessionIndex(folder, jsonPath)` (plus `*Sync` variants taking a pre-loaded key). `isSessionIndex` / `SESSION_INDEX_REGEX` validate the shape.
  - `store.ts` — On-disk session store. Canonical JSON serialisation (`canonicaliseJson`, deterministic key order via `TOP_LEVEL_KEY_PRIORITY`), atomic write (`writeSessionFile` — stage tmp → fsync → rename, EXDEV fallback), seal write/verify (`writeSeal`, `verifySeal`), folder resolution (`resolveSessionLocation`, `resolveSessionIndex`, `findPlanningFolderBySlug`), folder creation (`ensurePlanningFolder`, `ensureNestedPlanningFolder`), and the transient (`os.tmpdir()`) bootstrap-session registry. `SessionStoreError` carries a `code` (`NOT_FOUND` / `COLLISION` / `SEAL_MISMATCH` / `INVALID_INDEX` / `WORKSPACE_INVALID`).
  - `resolver.ts` — Load/mutate/persist orchestration over the store: `loadSessionForTool`, `advanceSession` (bumps `seq` + `ts`, applies a mutator over a clone), `saveSessionForTool`, the `withSession` convenience wrapper, `navigatePath`/`replacePath` for embedded children, the `sessionView()` adapter (projects a `SessionFile` onto the validation-layer `SessionView`), and `describeSessionStoreError`.
  - `params.ts` — The shared `sessionIndexParam` Zod spread (the `session_index` parameter on every authenticated tool) and `assertNoActiveCheckpoint`, the checkpoint gate.
  - `migration.ts` — Detect-on-read converter from the `workflow-state.json` + token format to the `session.json` + seal pair. Idempotent; surfaces `MigrationError` on a corrupt `workflow-state.json` envelope.
- **validation.ts** — Workflow consistency checks: workflow/activity/technique associations, step manifests, activity manifests, transition conditions. Helpers operate on the storage-agnostic `SessionView` (a `{ wf, act, v }` projection of `SessionFile`). Builds the `_meta.validation` `ValidationResult` (and the full `MetaResponse` envelope via `buildMeta`).
- **toon.ts** — Thin wrapper around `@toon-format/toon` encode/decode for TOON file format. `decodeToonRaw()` returns `unknown`; `decodeToon(content, schema)` validates against Zod; `encodeToon(value)` encodes.
- **index.ts** — Barrel export (`./toon.js`, `./session/index.js`, `./validation.js`). The `session/` barrel re-exports `params`, `derivation`, `store`, `resolver`, `migration`, `crypto`.

## Key Abstractions

- `SessionFile` (`schema/session.schema.ts`) — The authoritative on-disk session state. ~20 fields: `schemaVersion` (literal `1`), `sessionIndex`, `workflowId`, `workflowVersion`, `agentId`, `seq`, `ts`, `startedAt`, `currentActivity`, `currentTechnique`, `condition`, `activeCheckpoint?`, `variables`, `completedActivities`, `skippedActivities`, `checkpointResponses`, `history`, `status` (`running`/`completed`/`aborted`), `triggeredWorkflows`, `parentSession?`, `planningFolderPath?`. Recursive: `parentSession` (upward) and `triggeredWorkflows[i].state` (downward children) both reference `SessionFileSchema` via `z.lazy()`, so one file captures the whole work-package tree.
- `SessionView` (`validation.ts`) — `{ wf, act, v }` minimal projection of `SessionFile` consumed by the validation helpers; produced by `sessionView()` in `resolver.ts`. Keeps the validation surface storage-agnostic.
- `ActiveCheckpoint` (`schema/session.schema.ts`) — `{ checkpointId, activityId, yieldedAt }`. When set on `SessionFile.activeCheckpoint`, all authenticated tools (except `respond_checkpoint`/`present_checkpoint`) are gated.
- `EmbeddedSessionRef` (`schema/session.schema.ts`) — A `triggeredWorkflows[]` entry: navigation metadata (`workflowId`, `sessionIndex`, `triggeredAt`, `triggeredFrom`, `status`, `completedAt?`, `returnedContext?`) plus the recursively-embedded child `state?: SessionFile`.
- `SessionJsonPath` (`derivation.ts`) — `ReadonlyArray<string | number>` addressing a sub-state inside a `session.json` (e.g. `["triggeredWorkflows", 0, "state"]`). `[]` addresses the root.
- `LoadedSession` (`resolver.ts`) — `{ state, folderAbsPath, bytes, jsonPath, topState }` returned by `loadSessionForTool`; `topState` + `jsonPath` let `saveSessionForTool` re-insert a mutated embedded sub-state before re-sealing.
- `ValidationResult` — `{ status: 'valid' | 'warning' | 'error', warnings: string[], errors?: string[] }`. Validated by `ValidationResultSchema`.
- `MetaResponse` — `{ session_index?: string, validation: ValidationResult }` (validated by `MetaResponseSchema`); the `_meta` envelope every authenticated tool returns. Built by `buildMeta(sessionIndex, validation)`.
- `StepManifestEntry` (`{ step_id, output }`) / `ActivityManifestEntry` (`{ activity_id, outcome, transition_condition? }`) — Structures for validating step/activity completion.
- `SessionStoreError` / `MigrationError` — Domain-tagged error types for the store and the `workflow-state.json` migrator.

## Dependency Graph

```
tool handlers → validation.ts → workflow-loader.ts, activity.schema.ts
tool handlers → session/resolver.ts → session/store.ts → session/crypto.ts
session/store.ts, session/derivation.ts → session/crypto.ts (key + HMAC)
session/resolver.ts → session/store.ts, schema/session.schema.ts, validation.ts (SessionView)
session/migration.ts → session/store.ts, session/derivation.ts, schema/session.schema.ts
trace.ts → session/crypto.ts
loaders (workflow/activity/technique) → toon.ts
```

## Consumer Analysis

- **validation.ts** consumers: `workflow-tools.ts` (~22 references across the validation helpers + `buildMeta`/`buildValidation`), `resource-tools.ts` (~6 references)
- **session/ store + resolver** consumers: tool modules via `loadSessionForTool` / `withSession` / `advanceSession` / `sessionView` / `assertNoActiveCheckpoint` / `sessionIndexParam` / `describeSessionStoreError`; `resource-tools.ts` uses `computeSessionIndex` directly
- **session/crypto.ts** consumers: `session/store.ts`, `session/derivation.ts`, `trace.ts`
- **toon.ts** consumers: `loaders/workflow-loader.ts`, `loaders/activity-loader.ts`, `loaders/technique-loader.ts`, `tools/workflow-tools.ts`

## Session Lifecycle

Session state is server-managed in `session.json`. A tool resolves the caller's `session_index` to a planning folder, verifies the seal, mutates the parsed `SessionFile`, then re-canonicalises, re-seals, and atomically writes both files. The `session_index` is stable for the life of a session.

### loadSessionForTool (resolver.ts)
```
workspaceDir, sessionIndex
→ resolveSessionLocation: { folder, jsonPath } (transient registry first, else walk planning root matching stored sessionIndex)
→ verifySeal(folder): rehash session.json bytes, timing-safe-compare against .session-token
→ safeValidateSessionFile(parsed top state)
→ state = jsonPath empty ? topState : navigatePath(topState, jsonPath)
→ LoadedSession { state, folderAbsPath, bytes, jsonPath, topState }
```

### advanceSession (resolver.ts)
```
state, mutate?
→ next = { ...state, seq: seq + 1, ts: now-seconds }
→ deep-clone (JSON round-trip) → draft
→ mutate(draft) if provided
→ restore draft.seq / draft.ts → return draft (NOT persisted)
```

### saveSessionForTool (resolver.ts)
```
loaded, newState
→ newTopState = jsonPath empty ? newState : replacePath(loaded.topState, jsonPath, newState)
→ writeSessionFile(folderAbsPath, newTopState): canonicaliseJson → computeSeal → atomic write session.json then .session-token
→ { bytes, seal }
```

### computeSessionIndex (derivation.ts)
```
folderAbsPath
→ realpathSync(folder)  (symlink-stable; throws if path missing)
→ HMAC-SHA-256(canonicalPath) under server key
→ base32-truncate digest to 30 bits → 6 uppercase RFC 4648 chars (A-Z, 2-7)
```

### verifySeal (store.ts)
```
folderAbsPath
→ readSessionFile → { state, bytes }; NOT_FOUND if session.json missing
→ read .session-token (SEAL_MISMATCH if missing → unsealed)
→ computeSeal(bytes) and timing-safe-compare against stored hex
→ SEAL_MISMATCH on any drift (hand-edit, whitespace, torn write)
→ return { state, bytes }
```

### assertNoActiveCheckpoint (params.ts)
```
state with optional activeCheckpoint
→ if state.activeCheckpoint set: throw hard error (all tools gated until respond_checkpoint clears it)
→ otherwise: return void
```

Called in every authenticated tool handler EXCEPT `respond_checkpoint` (the resolution mechanism) and `present_checkpoint` (which loads the checkpoint definition while a checkpoint is active).

### workflow-state.json migration (migration.ts)
`migratePlanningFolder(folder)` is called by `start_session` before deciding resume-vs-create. Detect-on-read: short-circuits (`migrated: false`) if `session.json` already exists or no `workflow-state.json` artefacts are present. Otherwise it decodes the `workflow-state.json` envelope + `.session-token` payload (without HMAC verification), reconstructs a `SessionFile` (reading `technique` keys, falling back to `skill` keys), schema-validates it, writes `session.json` + seal, and deletes the `workflow-state.json` envelope.

## Validation Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `validateWorkflowConsistency` | Check session-vs-call workflow mismatch | `string \| null` |
| `validateActivityTransition` | Check transition validity (incl. `initialActivity` and terminal sentinel) | `string \| null` |
| `validateTechniqueAssociation` | Check technique is declared by activity (`activity.techniques` + step-bound techniques) | `string \| null` |
| `validateWorkflowVersion` | Check version drift | `string \| null` |
| `validateStepManifest` | Check step completeness/order/empty-output | `string[]` |
| `validateTransitionCondition` | Check claimed condition matches the declared transition | `string \| null` |
| `validateActivityManifest` | Check activity manifest validity | `string[]` |
| `buildValidation` | Aggregate warnings into `ValidationResult` | `ValidationResult` |
| `buildErrorValidation` | Aggregate warnings + error | `ValidationResult` |
| `buildMeta` | Wrap a `ValidationResult` (+ optional `session_index`) into the `_meta` envelope | `MetaResponse` |

## Crypto Functions

| Function | Purpose |
|----------|---------|
| `getOrCreateServerKey` | Load or generate the 32-byte key at `~/.workflow-server/secret` (`O_CREAT \| O_EXCL`, EEXIST → re-read for concurrency) |
| `hmacSign` | HMAC-SHA256 signature (hex string) over a string payload + key buffer |
| `hmacVerify` | Timing-safe HMAC verification |

## Open Questions

| # | Question | Status | Resolution | Section |
|---|----------|--------|------------|---------|
| 1 | Does any caller branch on ValidationResult.status? | Resolved | No. All callers pass it through to `_meta` via `buildMeta` / inline `{ validation }`. | Consumer Analysis |
| 2 | What types does @toon-format/toon encode accept? | Resolved | Any serializable value; `encodeToon` accepts `Record<string, unknown> \| unknown[] \| unknown` | toon.ts |
| 3 | Are there existing tests for utils modules? | Resolved | `tests/validation.test.ts` (25), `tests/session-store.test.ts` (29), `tests/session-index.test.ts` (14), `tests/session-schema.test.ts` (27), `tests/migration.test.ts` (17) | — |
| 4 | How does the server key load handle concurrent writes? | Resolved | `loadOrCreateKey` uses `O_CREAT \| O_EXCL`; on `EEXIST` it re-reads the existing key (and rejects a truncated one) | crypto.ts |
| 5 | What is the checkpoint gate semantics? | Resolved | `assertNoActiveCheckpoint` throws a hard error if `SessionFile.activeCheckpoint` is set; cleared by `respond_checkpoint` | params.ts |
| 6 | How is a `session_index` resolved to a folder, and what happens on collision? | Resolved | `resolveSessionIndex` / `resolveSessionLocation` walk the planning root (transient registry first) matching the stored `sessionIndex`; two matches → `SessionStoreError(COLLISION)`, zero → `NOT_FOUND` | store.ts |
| 7 | How are embedded child sessions (`triggeredWorkflows`) loaded and persisted? | Resolved | `loadSessionForTool` navigates to the addressed sub-state via `jsonPath`; `saveSessionForTool` uses `replacePath` to slot the mutation back into `topState` before re-sealing the whole file | resolver.ts |
| 8 | What is the on-disk seal/torn-write failure mode? | Open | `writeSessionFile` writes `session.json` then `.session-token`; a reader in the inter-rename window should observe a seal mismatch and fail fast. Concurrency under multiple server processes against one folder is not yet characterised. | store.ts |

---
*This artifact is part of a persistent knowledge base.*
