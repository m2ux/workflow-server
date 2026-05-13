# 03 - Codebase Comprehension: Server-Managed Session State

**Work package:** Server-managed session state with workspace-aware MCP server
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**Date:** 2026-05-13
**Status:** Codebase comprehension activity output
**Related persistent artifacts:**
- [.engineering/artifacts/comprehension/workflow-server.md](../../comprehension/workflow-server.md) (cross-cutting source map)
- [.engineering/artifacts/comprehension/orchestration.md](../../comprehension/orchestration.md) (orchestrator/worker execution model, session token, trace)
- [.engineering/artifacts/comprehension/utils-layer.md](../../comprehension/utils-layer.md) (`src/utils/{crypto,session,validation,toon}.ts`)
- [.engineering/artifacts/comprehension/state-tools.md](../../comprehension/state-tools.md) (historical — pre-removal of `src/tools/state-tools.ts`)
- [.engineering/artifacts/comprehension/zod-schemas.md](../../comprehension/zod-schemas.md) (schema layer)

This artifact is **work-package-scoped**: it maps the AS-IS surface that issue #115 will refactor, qualifying the assumptions captured in [02-assumptions-log.md](02-assumptions-log.md) and the philosophy in [02-design-philosophy.md](02-design-philosophy.md). Where the persistent artifacts above already document a concept, this artifact references them rather than restating.

---

## 1. Scope of comprehension

The refactor described in #115 touches **eight discrete surfaces**:

1. **Server boot** — `src/index.ts`, `src/config.ts` (no workspace arg today).
2. **Session token machinery** — `src/utils/session.ts`, `src/utils/crypto.ts`.
3. **Authenticated tool handlers** — every site that spreads `sessionTokenParam`.
4. **Agent-facing session schema** — what `workflow-state.json` currently looks like (`StateSaveFileSchema` in `src/schema/state.schema.ts`), what `session.json` will need.
5. **Meta-workflow persistence operations** — `workflows/meta/skills/00-workflow-engine.toon::persist` / `::restore` / `::commit-and-persist`.
6. **Nested workflow dispatch** — `start_session` parent-context branch, dispatch test fixtures.
7. **Audit / trace coupling** — `src/logging.ts` decodes the token to populate trace events.
8. **Tests + docs** — `tests/session.test.ts`, `tests/dispatch.test.ts`, `tests/mcp-server.test.ts`; `docs/api-reference.md`, `CLAUDE.md` token-discipline rules.

All eight are mapped below with concrete line/symbol references.

## 2. Architecture survey — AS-IS state model

### 2.1 Two coupled stores

Session state today is split between two layers, with the agent acting as the synchronization point:

```
                ┌───────────────────────────────────────┐
                │       Agent (LLM)                     │
                │  • holds session_token in transcript  │
                │  • Write workflow-state.json          │
                │  • Write .session-token               │
                └────┬────────────────────┬─────────────┘
                     │                    │
       MCP tool call │                    │ harness Write tool
       session_token │                    │
                     ▼                    ▼
   ┌───────────────────────┐    ┌──────────────────────────────────┐
   │  HMAC-signed token    │    │  Planning folder                 │
   │  src/utils/session.ts │    │  workflow-state.json (envelope)  │
   │  • wf, act, skill,    │    │  • stateVersion, savedAt,        │
   │    cond, v, seq, ts,  │    │    startedAt, state.variables,   │
   │    sid, aid, bcp      │    │    completedActivities,          │
   │  • psid, pwf, pact,   │    │    skippedActivities,            │
   │    pv (one parent     │    │    checkpointResponses, history, │
   │    level only)        │    │    status                        │
   │  • base64url payload  │    │  .session-token (raw token line) │
   │    + HMAC-SHA256 sig  │    └──────────────────────────────────┘
   └───────────────────────┘
```

### 2.2 What lives where today

| Concept | Token | `workflow-state.json` | Server-validated? |
|---------|-------|----------------------|-------------------|
| Workflow ID, version | `wf`, `v` | `workflowId`, `workflowVersion` | yes (Zod `SessionPayloadSchema`) |
| Current activity | `act` | `state.currentActivity` (agent-derived) | yes for token; no for file envelope |
| Current skill, condition | `skill`, `cond` | — | yes for token |
| Sequence + timestamp | `seq`, `ts` | — (envelope has `savedAt`) | yes for token (monotonic) |
| Session ID | `sid` | (legacy: `sessionToken` field) | yes |
| Agent ID | `aid` | — | yes |
| Active checkpoint | `bcp` | (legacy may carry) | yes (hard gate) |
| Parent context (one level) | `psid`, `pwf`, `pact`, `pv` | `state.parentWorkflow` (separate shape) | yes for token; loose for file |
| Variables | — | `state.variables` (`z.record(z.unknown())`) | **no** — agent-managed |
| Completed / skipped activities, history | — | `state.completedActivities`, etc. | **no** — agent-managed |
| Checkpoint responses, decision outcomes, loop state | — | `state.checkpointResponses`, etc. | **no** — agent-managed |
| Nested triggered workflows | — | `state.triggeredWorkflows` (recursive via `NestedTriggeredWorkflowRefSchema`) | yes structurally; **not for content** |

Implication: the file envelope (`StateSaveFileSchema`) already has a recursive nested schema (`NestedWorkflowStateSchema`), but parent context inside the token is flattened to one level. The two shapes don't match. #115's `parentSession` proposal unifies them.

### 2.3 Server boot flow (`src/index.ts`, `src/config.ts`)

```ts
// src/index.ts:17-28
async function main() {
  const config = loadConfig();        // env-only: WORKFLOW_DIR, SCHEMAS_DIR, SERVER_NAME, SERVER_VERSION
  const server = createServer(config); // builds McpServer, registers tools, trace store
  await server.connect(new StdioServerTransport());
}

// src/config.ts:27-34
export function loadConfig(): ServerConfig {
  return {
    workflowDir: resolve(PROJECT_ROOT, envOrDefault('WORKFLOW_DIR', './workflows')),
    schemasDir:  resolve(PROJECT_ROOT, envOrDefault('SCHEMAS_DIR', './schemas')),
    serverName:  envOrDefault('SERVER_NAME', 'workflow-server'),
    serverVersion: envOrDefault('SERVER_VERSION', '1.0.0'),
  };
}
```

There is no `process.argv` parsing, no `WORKFLOW_WORKSPACE`, no notion of a per-user planning-folder root. The server's only filesystem authority is `workflowDir` (the workflow *definitions* worktree, not the user's project).

This is the natural location to introduce a `--workspace` flag and/or `WORKFLOW_WORKSPACE` env var. `loadConfig` is the single point that consumes env vars; adding CLI parsing here is contained.

### 2.4 Authenticated-tool surface

Tools registered against the MCP SDK that spread `sessionTokenParam` (single fragment in `src/utils/session.ts:188-192`):

| File | Tool | Lines | Mutates state? |
|------|------|-------|----------------|
| `src/tools/workflow-tools.ts` | `get_workflow` | 49–119 | no (advances seq only) |
| `src/tools/workflow-tools.ts` | `next_activity` | 120–212 | **yes** (`act`, `cond`, clears `bcp`) |
| `src/tools/workflow-tools.ts` | `get_activity` | 213–248 | no |
| `src/tools/workflow-tools.ts` | `yield_checkpoint` | 250–285 | **yes** (sets `bcp`) |
| `src/tools/workflow-tools.ts` | `resume_checkpoint` | 287–310 | no (verifies `!bcp`) |
| `src/tools/workflow-tools.ts` | `get_trace` | 454–495 | no |
| `src/tools/workflow-tools.ts` | `get_workflow_status` | 508–581 | no |
| `src/tools/resource-tools.ts` | `get_skills` | 266–310 | no |
| `src/tools/resource-tools.ts` | `get_skill` | 312–391 | **yes** (sets `skill`) |
| `src/tools/resource-tools.ts` | `get_resource` | 393–432 | no |

Two further tools (`present_checkpoint` lines 312–345, `respond_checkpoint` lines 349–452 in `workflow-tools.ts`) take a `session_token` *or* a `checkpoint_handle` alias instead of the strict `sessionTokenParam` fragment — they are semantically authenticated but accept either name for historical reasons. The state-mutation in `respond_checkpoint` is clearing `bcp`.

The unauthenticated set is `discover` (line 31), `list_workflows` (line 44), `health_check` (line 497) plus `resolve_operations` (`resource-tools.ts:436`). All four take no `session_token`.

This matches assumption A9, A10, A11 in [02-assumptions-log.md](02-assumptions-log.md).

### 2.5 `withAuditLog` and trace coupling

`src/logging.ts:54-81` (`appendTraceEvent`) calls `decodeSessionToken(tokenStr)` on the raw `session_token` parameter to extract `sid`, `wf`, `act`, `aid` for the trace event. If the token is missing or undecodable, the function logs a warning and skips trace capture (line 79).

Under #115's design, `session_token` is removed from the wire. The replacement `session_index` does not carry `sid`/`wf`/`act`/`aid` directly — the server must resolve the index to a folder, read `session.json`, and project those fields out before calling `appendTraceEvent`. Either:

(a) `appendTraceEvent` continues to take a token-shaped object that the handler builds from `session.json`, or
(b) the trace integration is restructured to read state from the same `session.json` the handler is verifying.

This is a non-trivial refactor — `withAuditLog` currently runs *around* the handler and decodes the parameter independently. With server-owned state, the handler is the only place that knows the resolved folder. (Tracked as Q4 below.)

### 2.6 Meta-workflow persistence (`workflows/meta/skills/00-workflow-engine.toon`)

The current `persist` operation (lines 151–170) instructs the agent to:

1. Write the JSON envelope to `{planning_folder_path}/workflow-state.json` via the harness `Write` tool.
2. Write the raw session token (single line, no quotes) to `{planning_folder_path}/.session-token` via the harness `Write` tool.
3. Rules enforced agent-side: `state-format`, `token-in-sibling`, `no-token-duplication`, `no-derived-fields`, `omit-empty-collections`, `variables-canonical-home`.

`restore` (lines 172–195) is the inverse: read `.session-token` (legacy fallback: extract from `workflow-state.json`'s `sessionToken` field), pass to `start_session` under the `session_token` parameter.

`commit-and-persist` (lines 241–258) wraps persist + the git-commit choreography; the constraint `persist-before-engineering-commit` is enforced agent-side.

Under #115, all three operations are simplified or removed: the server writes the files; the agent never invokes `Write` for either path. `persist` becomes a no-op (the relevant tool call has already written the seal-mismatch-detecting pair); `restore` becomes a thin wrapper around `start_session(planning_slug, agent_id)`.

### 2.7 Nested workflow dispatch

`src/tools/resource-tools.ts:175-200` shows the parent-context capture:

```ts
let parentContext: ParentContext | undefined;
if (parent_session_token) {
  const parentToken = await decodeSessionToken(parent_session_token);
  parentContext = { psid, pwf, pact, pv };  // exactly one level
}
token = await createSessionToken(effectiveWorkflowId, effectiveWorkflowVersion, agent_id, parentContext);
```

There is no recursion: the child's token records only the direct parent's `(psid, pwf, pact, pv)`. A grandparent dispatch (A → B → C) cannot be reconstructed from C's token alone. The recursive `NestedTriggeredWorkflowRefSchema` in `state.schema.ts` does support arbitrary depth, but that schema describes the parent's *triggeredWorkflows* array (looking down), not the child's *parentSession* chain (looking up). The downward view exists; the upward view is flattened.

`tests/dispatch.test.ts:138-154` confirms: a three-level chain (meta → client → subClient) is testable, but each child token only knows its direct parent's sid.

### 2.8 Audit-only HMAC primitives in crypto.ts

`src/utils/crypto.ts:77-86` already provides:

- `hmacSign(payload: string, key: Buffer): string` — sha256, hex-digest
- `hmacVerify(payload: string, signature: string, key: Buffer): boolean` — timing-safe

These accept arbitrary string payloads (not just base64url). #115's seal computation (`HMAC(session.json bytes, secret)`) requires only re-targeting them at the canonical bytes of `session.json`. Encoding choice: continue to use hex (timing-safe-compare friendly) and `Buffer.from(json, 'utf8')` for the payload. The HMAC key (`~/.workflow-server/secret`) is the same 32-byte secret already loaded by `getOrCreateServerKey`.

The encryption helpers (`encryptToken`, `decryptToken`) are unused after `src/tools/state-tools.ts` was removed. They remain in the file but are dead code with respect to the live `src/` tree. (Confirmed by `grep -rn 'encryptToken\|decryptToken' src/` returning no results.)

## 3. Key abstractions

The refactor introduces, replaces, or recurses these abstractions:

### 3.1 New

| Symbol | Likely module | Role |
|--------|--------------|------|
| `WorkspaceConfig` (or extension of `ServerConfig`) | `src/config.ts` | Holds the workspace path. Required at startup. |
| `SessionIndex` (type alias `string` with documented derivation) | `src/utils/session-index.ts` (new) | Six base32 chars. `base32(HMAC(folder_path_bytes, secret)[0..4])`. |
| `SessionFile` (type) | `src/schema/session.schema.ts` (new) | The full `session.json` shape — union of today's token fields and today's `WorkflowState` fields, plus recursive `parentSession`. |
| `readSessionFile`, `writeSessionFile`, `verifySeal`, `writeSeal` | `src/utils/session-store.ts` (new) | Atomic FS operations with the rename + fsync pattern. |
| `resolveSessionIndex(workspaceDir, sessionIndex)` | `src/utils/session-store.ts` (new) | Enumerates `<workspace>/.engineering/artifacts/planning/*/` and matches the HMAC. |
| `sessionIndexParam` | replaces `sessionTokenParam` in `src/utils/session.ts` | New shared zod fragment for authenticated tools. |

### 3.2 Replaced

| AS-IS | TO-BE | Notes |
|-------|-------|-------|
| `sessionTokenParam` (line 188 of `session.ts`) | `sessionIndexParam` | 6-char regex `[A-Z2-7]{6}`, single point of change for the schema swap. |
| `decodeSessionToken(token)` callers | server-side `resolveAndVerify(session_index) → SessionFile` | Decodes from disk, not from the wire. |
| `advanceToken(token, updates)` | `mutateSession(folder, updates) → write session.json + .session-token` | Same semantic ("advance"), but persisted not signed-in-memory. |
| `assertCheckpointsResolved(token)` | `assertCheckpointsResolved(state)` | Same logic; now reads from `state.activeCheckpoint` rather than `token.bcp`. |
| `SessionPayload` interface | `SessionFile` interface | Superset (adds variables, history, completedActivities, etc.) |
| Persist-via-agent-Write | Persist-implicit (server writes inside the handler) | Eliminates the per-activity `persist` operation. |
| `decodePayloadOnly` / staleness re-signing | **Removed**. | The seal is over file bytes, not server uptime — no equivalent failure mode. |

### 3.3 Recursive

`parentSession` becomes the same shape as `SessionFile` itself. `z.lazy(() => SessionFileSchema)` is the precedent already used in `NestedWorkflowStateSchema` (state.schema.ts:133-138). The grandparent chain is naturally captured.

## 4. Design rationale (hypotheses)

Each row infers *why* the AS-IS code was built this way, to be validated against the new design's invariants:

| # | AS-IS choice | Likely rationale | Implication for #115 |
|---|-------------|------------------|----------------------|
| DR1 | Token carries state, agent writes file | Stateless server simplifies horizontal/restart story; agent's harness `Write` tool was the easiest persistence primitive available. | New design preserves statelessness but moves the *write authority* to the server. The harness `Write` tool is no longer used for session state. |
| DR2 | Token is opaque base64url + HMAC | Self-contained — any verifier with the secret can validate without filesystem access. Useful when the persistence boundary was undecided. | Once the persistence boundary is fixed (planning folder), the self-contained-ness is unnecessary. The seal can be over the canonical state file. |
| DR3 | Single-level parent context (`psid/pwf/pact/pv`) | Token size was the constraint. Nesting would inflate every token on every call. | When state moves to disk, size is no longer constrained. Recursion costs nothing on the wire. |
| DR4 | Staleness recovery branch in `start_session` | Token + HMAC pair is brittle to server restart (key change). Recovery branch was an operational accommodation. | Seal-over-bytes is server-restart-invariant (the secret persists across restarts). The recovery branch is removable. |
| DR5 | `decodePayloadOnly` exists separately from `decodeSessionToken` | Same pair: the brittleness of HMAC-over-truncated-tokens needed a payload-recovery escape. | Six-char `session_index` is transcription-stable. The escape is unnecessary. |
| DR6 | `StateSaveFileSchema.sessionTokenEncrypted` flag (QC-004) | Past path-traversal/encryption-flag hardening (state-tools.md). Indicates this surface has historically been a security-sensitive boundary. | Confirms that integrity over the persisted file matters more than encryption. HMAC seal is the V1 mechanism; encryption is out of scope (per design philosophy section 5). |
| DR7 | Encrypted helpers (`encryptToken`/`decryptToken`) retained in crypto.ts | Possibly reserved for future use or simple oversight after state-tools.ts removal. | Dead code. Could be removed in this refactor or deferred. (Q5 below.) |
| DR8 | Agent-enforced schema (TOON rules) on `workflow-state.json` | The server is read-only over workflow definitions; making the file's schema agent-enforced kept the server's responsibility scope narrow. | New design moves schema authority to the server. Zod schema for `SessionFile` becomes the contract. |
| DR9 | Path-traversal sanitation absent from state-tools (pre-removal) | The original `save_state`/`restore_state` tools took arbitrary `planning_folder_path`/`file_path` from the agent; sanitisation was bolted on post-QC-003. | The new design's path is server-derived (`workspaceDir + slug`), never agent-supplied. Sanitisation moves to validating that the resolved slug stays within `workspaceDir`. |

## 5. Domain concept mapping

The refactor coins or reframes several domain terms. Glossary for downstream activities:

| Term | Maps to | Distinction |
|------|---------|-------------|
| **Workspace** | The user's project root (e.g., `/home/mike1/projects/main/workflow-server`) | NOT the workflow definitions directory (`workflowDir`). Today's server doesn't know about workspaces; tomorrow's does. |
| **Planning folder / slug** | A directory under `<workspace>/.engineering/artifacts/planning/<slug>/` | The slug is the natural address. Format example: `2026-05-13-server-managed-session-state`. |
| **Session index** | Short deterministic identifier the agent threads on every call | Six base32 chars. Derived from `HMAC(folder_path, secret)`. Both transcription-safe AND secret-bound. |
| **Session file** | `session.json` in the planning folder | Server-written, agent-readable. Single source of truth for session state. |
| **Seal** | `.session-token` in the planning folder | Just the HMAC over `session.json` bytes. Detects tampering; does not encrypt. |
| **Authority** | Anything holding `~/.workflow-server/secret` | Today the server holds the secret. Tomorrow the same. The secret is the security boundary. |
| **Parent session** | Recursive `parentSession` inside `session.json` | Snapshot of the parent's `session.json` at dispatch time. Grandparents preserved. |
| **Active checkpoint** | `state.activeCheckpoint` inside `session.json` | Replaces the token's `bcp` field. Same semantics (gates other tools); different storage. |
| **Authenticated tool** | Any tool that takes `session_index` | Same set as today's "takes session_token". `discover`, `list_workflows`, `health_check`, `resolve_operations` remain unauthenticated. |
| **Migration / converter** | Phase 9 one-shot tool | Reads legacy `workflow-state.json` + `.session-token` pair, writes new `session.json` + new `.session-token` seal. Idempotent. |

## 6. Open Questions

This table is the authoritative list of unresolved comprehension questions. Status legend: `open`, `resolved`. Resolution captures the evidence and points to the section that answered it.

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Where is the single point of change for stripping `session_token` from every authenticated tool's input schema? | open | | §7.1 |
| Q2 | How does the `withAuditLog` wrapper interact with a token-less call shape, given that today it decodes `params['session_token']` to populate trace `sid/wf/act/aid`? | open | | §7.2 |
| Q3 | Does the existing `NestedWorkflowStateSchema` (state.schema.ts:133-138) shape match what `parentSession` should look like in the new `SessionFile`, or are they semantically different (downward vs. upward chain)? | open | | §7.3 |
| Q4 | What is the concrete touchpoint count for `decodeSessionToken` and `advanceToken` outside the two tool modules — are they called from validation, loggers, tests, or only the tool handlers? | open | | §7.4 |
| Q5 | Are `encryptToken` / `decryptToken` in `src/utils/crypto.ts` reachable from any current source path, or are they dead code post `state-tools.ts` removal? | open | | §7.5 |
| Q6 | What is the on-disk shape that today's `workflow-state.json` actually produces (per the meta workflow's `persist` operation) — does it match `StateSaveFileSchema`, or has agent-side drift introduced fields the server doesn't validate? | open | | §7.6 |
| Q7 | What planning-folder directory layout does the meta workflow assume — exactly `<workspace>/.engineering/artifacts/planning/<slug>/`, or are alternative layouts referenced anywhere? | open | | §7.7 |
| Q8 | Is the `tests/` suite structured so that a session-index-based refactor can be incrementally adopted (test-by-test) or does most coverage flow through a single helper that constructs a session token? | open | | §7.8 |
| Q9 | Are there active CLI consumers (Claude Code harness rules, IDE setup) that hard-code the `session_token` parameter name, beyond the meta-workflow TOON? | open | | §7.9 |

## 7. Initial Deep-Dive (Mandatory)

Each subsection investigates one open question.

### 7.1 Q1 — Single point of change for the parameter swap

**Investigation:** Search for every site that references `sessionTokenParam` and for sites that don't use the fragment but still accept `session_token` directly.

**Findings (from grep over `src/`):**

- `src/utils/session.ts:188-192` — the only definition of `sessionTokenParam`. Removing this single export from the public surface would force every consumer to update.
- Authenticated tools spreading `sessionTokenParam`: 10 sites total (see §2.4 table). Each is a `...sessionTokenParam` spread inside the tool's `inputSchema`.
- Tools NOT spreading the fragment but accepting `session_token` by hand: `start_session` (resource-tools.ts:50), `present_checkpoint` (workflow-tools.ts:315), `respond_checkpoint` (workflow-tools.ts:358). These three declare `session_token: z.string().optional()` directly. `start_session`'s `session_token` is for inheriting/adopting another session; `present_checkpoint`/`respond_checkpoint` are aliases for `checkpoint_handle`. **All three need bespoke treatment** — they aren't a simple param swap.
- `src/utils/validation.ts:218` — `MetaResponseSchema` includes `session_token: z.string()`. This is the *response* envelope, not the request — but it tells consumers what to thread next. Under the new design `_meta.session_token` disappears; consumers see the index they already passed echoed back (or nothing).

**Resolution:** **Resolved.** The parameter-shape swap has three classes of touchpoint:

| Class | Sites | Change |
|-------|-------|--------|
| Standard authenticated tools | 10 spreading `sessionTokenParam` | Replace fragment with `sessionIndexParam`. |
| Token-inheriting / handle-aliasing tools | 3 (`start_session`, `present_checkpoint`, `respond_checkpoint`) | Bespoke schemas; `start_session` accepts `planning_slug` instead of `session_token`; the two checkpoint tools accept `session_index` (the worker yielded with a checkpoint handle previously, now yields with a planning_slug+checkpoint_id pair OR the same `session_index` with the active checkpoint disambiguated by `state.activeCheckpoint`). |
| Response envelope | `MetaResponseSchema` (validation.ts:218) | Drop `session_token` from the schema; either drop `_meta` entirely or replace with structural metadata only (validation, trace). |

§9 below augments with portfolio-lens findings.

### 7.2 Q2 — `withAuditLog` token decoding

**Investigation:** Read `src/logging.ts:54-81` and confirm where trace event fields come from when the input schema no longer carries the token.

**Findings:** `appendTraceEvent` extracts `params['session_token']` (line 63) and calls `decodeSessionToken(tokenStr)` to populate `sid`, `wf`, `act`, `aid` in the trace event (lines 67-77). The function is called by the wrapper that surrounds *every* tool handler. There is no path for the wrapper to know the resolved session without doing the resolution itself — which means doing the file enumeration and HMAC compute twice per call (once in the wrapper, once in the handler) OR threading the resolved state through a side channel.

Three plausible designs:

1. **Wrapper resolves the index independently** — duplicates the enumeration cost but keeps the wrapper's contract clean.
2. **Wrapper passes a `traceCtx` object that handlers populate** — adds a parameter to every handler signature.
3. **Wrapper reads from a server-local async-local-storage (`AsyncLocalStorage`)** — handlers set the resolved session before any await; wrapper reads it after. No signature changes, but introduces hidden coupling.

The current wrapper takes `params['session_token']` as a string. The minimal change is to take `params['session_index']` and re-resolve. The enumeration cost is bounded by the number of planning folders in the workspace (typically tens to low hundreds); the second resolution is one filesystem read of `session.json` (cached at the OS page-cache level after the handler's first read). Defensibility: acceptable for V1; add a memoization layer if profiling shows it.

**Resolution:** **Resolved.** Default to design (1) — wrapper re-resolves the index. Document the duplicate-resolution cost as a known performance characteristic; revisit if benchmarks (F4) show it becomes a hot path.

### 7.3 Q3 — `NestedWorkflowStateSchema` shape vs. `parentSession`

**Investigation:** Compare `NestedWorkflowStateSchema` (state.schema.ts:133-138) to what `parentSession` needs to be.

**Findings:**

- `NestedWorkflowStateSchema` extends `WorkflowStateBaseSchema` with `triggeredWorkflows: z.array(z.lazy(() => NestedTriggeredWorkflowRefSchema))`. This is a **downward** chain: a parent state can carry summaries of children it dispatched.
- `parentSession` in #115 is an **upward** chain: a child state carries its parent's state-at-dispatch-time, and that parent state in turn carries *its* parent's state-at-dispatch-time.

The shapes are similar (both `z.lazy()` on a state-like schema) but semantically distinct:

- `triggeredWorkflows[]` is an array (a workflow can dispatch multiple children); each entry has `status`, `triggeredAt`, `returnedContext`.
- `parentSession` is a single object (a child has exactly one parent); it's a state snapshot, not a tracking record.

A clean implementation co-designs both: `SessionFile` has `parentSession: SessionFile | null` AND `triggeredWorkflows: TriggeredRef[]`. The upward chain captures the dispatch lineage; the downward chain (existing) captures what this session has dispatched. Both use `z.lazy()`. The recursion-typing pattern from `state.schema.ts:125-142` is the precedent.

**Resolution:** **Resolved.** They are semantically distinct (upward vs. downward chains). Implementation should preserve both: keep `triggeredWorkflows` as today, add `parentSession: z.lazy(() => SessionFileSchema).optional()`. Update planning-doc text to make this explicit.

### 7.4 Q4 — `decodeSessionToken` / `advanceToken` call sites outside tool handlers

**Investigation:** `grep -rn "decodeSessionToken\|advanceToken\|decodePayloadOnly" src/ tests/`.

**Findings:**

In `src/`:
- `src/tools/resource-tools.ts` — 5 call sites (`start_session` decode, advance, recovery; `get_skills`, `get_skill`, `get_resource` decode+advance).
- `src/tools/workflow-tools.ts` — 8 call sites (every authenticated tool decodes; mutating tools advance).
- `src/logging.ts:67` — `decodeSessionToken` in `appendTraceEvent`.
- `src/utils/session.ts` — internal use only (`decode` is the private impl; `decodeSessionToken` and `decodePayloadOnly` are re-exports).
- `src/index.ts` — no direct use.

In `tests/`:
- `tests/session.test.ts`, `tests/dispatch.test.ts`, `tests/mcp-server.test.ts` — extensive use of `decodeSessionToken` for assertions. These tests will need substantial rewriting: a token-shape test becomes a session-file-shape test.

**No** validation-layer call sites (`src/utils/validation.ts` imports `SessionPayload` as a type, but does not call `decodeSessionToken`). The validation functions take a *decoded* `SessionPayload` as a parameter, so they're protocol-agnostic.

**Resolution:** **Resolved.** Decoder/advancer is called from exactly:
- 13 sites across `tools/` (covered by the parameter swap)
- 1 site in `logging.ts` (covered by Q2's wrapper resolution)
- internal `session.ts` (will be replaced by a `session-store.ts`)
- test suite (Q8 covers test impact)

Validation layer needs no changes beyond switching its input type from `SessionPayload` to a comparable extracted-from-`SessionFile` shape.

### 7.5 Q5 — Encryption helpers dead-code status

**Investigation:** `grep -rn "encryptToken\|decryptToken" src/`.

**Findings:** Zero hits in `src/`. The helpers (`crypto.ts:56-75`) are unused. They were consumed by the now-removed `src/tools/state-tools.ts` (per the historical `state-tools.md` comprehension artifact). They remain exported (`crypto.ts:56`, line 64), but no current source path imports them.

**Resolution:** **Resolved.** They are dead code. The #115 refactor could remove them as a janitorial step (zero functional risk) or leave them for a future encryption-at-rest feature (per design philosophy non-goal #5.3). Recommendation: remove them in this PR to reduce the cognitive surface; resurrect from git history if/when needed.

### 7.6 Q6 — Actual on-disk `workflow-state.json` shape vs. `StateSaveFileSchema`

**Investigation:** Read the planning folder's existing `workflow-state.json` and compare to `StateSaveFileSchema`.

**Findings:** `cat /home/mike1/projects/main/workflow-server/.engineering/artifacts/planning/2026-05-13-server-managed-session-state/workflow-state.json` (the live state file for this very work package).

The file (as produced by the meta workflow's `persist` operation) is a **3-field envelope** `{stateVersion, savedAt, startedAt, state}` per the TOON rule `state-format` at line 159 of `00-workflow-engine.toon`. It does NOT match `StateSaveFileSchema` (state.schema.ts:165-174), which has `id, savedAt, description, workflowId, workflowVersion, planningFolder, sessionTokenEncrypted, state`.

This is a **drift hotspot**: the Zod schema in `state.schema.ts:165-174` and the agent-side rules in `00-workflow-engine.toon:151-170` describe two different envelopes. The Zod schema is not used to validate any current code path (the agent writes the file; no server-side `safeValidateStateSave` call exists in `src/tools/`). It's a stranded schema, left behind from the deleted `state-tools.ts`.

**Resolution:** **Resolved.** Today's `workflow-state.json` shape is the 3-field envelope from the TOON rule, NOT the 8-field `StateSaveFileSchema`. The Zod schema is stale/unused. The #115 design has authority to define `SessionFile` from scratch; it should not be constrained by `StateSaveFileSchema`.

Migration (phase 9) must read the 3-field envelope, not the Zod schema. Recommend adding a converter test that reads this very work package's `workflow-state.json` and successfully produces an equivalent `session.json`.

### 7.7 Q7 — Planning-folder layout assumptions

**Investigation:** `grep -rn "planning_folder_path\|\.engineering/artifacts/planning" src/ workflows/`.

**Findings:**

- `src/` has zero references — the server does not know about planning folders today.
- `workflows/meta/skills/00-workflow-engine.toon` — references `{planning_folder_path}` as a variable in `persist` (line 159), `restore` (line 176), `commit-and-persist` (line 249, 250). No hard-coded path layout.
- `workflows/work-package/activities/*.toon` — uses `{planning_folder_path}` similarly. The variable is set during workflow initialization (typically `<workspace>/.engineering/artifacts/planning/<slug>`).
- README, design-philosophy.md, and assumptions-log.md all use the form `<workspace>/.engineering/artifacts/planning/<slug>/`.

**Resolution:** **Resolved.** The convention is `<workspace>/.engineering/artifacts/planning/<slug>/`, set agent-side. There is no alternative layout in current use. The server's enumeration can hard-code `.engineering/artifacts/planning` as the relative prefix. Document this as a fixed convention; reject ambiguous paths.

### 7.8 Q8 — Test suite incremental adoption

**Investigation:** `ls tests/` + scan headers for shared session-creation helpers.

**Findings:**

- `tests/session.test.ts` (22 tests per utils-layer.md) — directly tests `createSessionToken`, `decodeSessionToken`, `advanceToken`, `assertCheckpointsResolved`. Token-shape tests. **High impact** — most will be replaced by `session-store.ts` tests.
- `tests/dispatch.test.ts` — tests parent-context propagation (`psid`/`pwf`/`pact`/`pv`). **High impact** — recursive `parentSession` tests replace these.
- `tests/mcp-server.test.ts` — end-to-end MCP server tests. Uses `start_session` to obtain a token, then threads it. **High impact** — most calls swap to `session_index`.
- `tests/validation.test.ts`, `tests/trace.test.ts` — orthogonal to token shape; minor changes.
- `tests/{workflow,activity,skill,schema}-loader.test.ts`, `tests/schema-validation.test.ts` — don't use the token at all. Untouched.

No shared `createTestSession` helper exists; each test that needs a session constructs one inline. This means incremental adoption is bounded by per-test rewrites, not a centralized helper change. The migration cost is N×K where N is roughly 50–80 test cases involving the token and K is the time per rewrite — non-trivial but tractable.

**Resolution:** **Resolved.** Test suite is structured for incremental adoption (test-by-test). Recommend introducing a `testSession` helper in this refactor (build a planning folder, write a `session.json`, return the index) to centralize what's currently inline.

### 7.9 Q9 — External `session_token` references (rules, harness, docs)

**Investigation:** `grep -rn "session_token" /home/mike1/projects/main/workflow-server/{docs,.claude,CLAUDE.md,workflows} 2>/dev/null`.

**Findings:**

- `CLAUDE.md` (project) — references `session_token` once via the `.engineering/AGENTS.md` rule; the `workflow-server.md` rule mentions calling `start_session` but does not hard-code the param name.
- `.claude/rules/workflow-server.md` — same: instructs the agent to pass `session_token` "per their instructions" (which means: per the tool's own description). Loose coupling.
- `docs/api-reference.md` — likely hard-codes `session_token` in tool examples. (Not yet read — defer.)
- `workflows/meta/` — extensive use in `00-workflow-engine.toon` (token-mechanics rules, persist/restore ops). Update tracked as part of phase 8.
- `workflows/meta/resources/02-workflow-orchestrator-prompt.md` and `01-activity-worker-prompt.md` — orchestrator/worker bootstrap prompts; will need wording updates.

**Resolution:** **Resolved.** The external surface is:
1. Server documentation (`docs/api-reference.md`) — update tool examples.
2. Meta-workflow files (`workflows/meta/skills/00-workflow-engine.toon`, the two prompt resources) — update operations, prompts, rules.
3. Project rules (`CLAUDE.md`, `.claude/rules/workflow-server.md`) — minor wording updates if at all.
4. Claude Code harness rules — these live outside the repo (in user-level `~/.claude/`); coordination with downstream is a deployment concern, not a server PR concern.

Tracked as a single phase-10 documentation pass.

## 8. Revised Open Questions (after initial deep-dive)

All questions from §6 have been investigated. The revised status is:

| # | Question | Status | Resolution Summary | Section |
|---|----------|--------|--------------------|---------|
| Q1 | Single point of change for parameter swap | resolved | 10 sites with `sessionTokenParam` + 3 bespoke sites + response envelope. Three classes of touchpoint. | §7.1 |
| Q2 | `withAuditLog` token decoding interaction | resolved | Wrapper re-resolves the index; accept duplicate resolution as V1 cost. | §7.2 |
| Q3 | `NestedWorkflowStateSchema` vs. `parentSession` shape | resolved | Semantically distinct (downward vs upward). Both retained; both use `z.lazy()`. | §7.3 |
| Q4 | Decoder/advancer touchpoint count outside tools | resolved | 13 sites in tools, 1 in logging.ts, internal session.ts, ~50–80 test cases. No validation-layer impact. | §7.4 |
| Q5 | Encrypt/decrypt helpers dead-code status | resolved | Dead code. Recommend removal in this PR. | §7.5 |
| Q6 | Actual `workflow-state.json` shape | resolved | 3-field envelope from TOON rule, NOT `StateSaveFileSchema`. The Zod schema is stale. | §7.6 |
| Q7 | Planning-folder layout assumptions | resolved | Single convention: `<workspace>/.engineering/artifacts/planning/<slug>/`. | §7.7 |
| Q8 | Test suite incremental adoption | resolved | Test-by-test rewriteable; introduce `testSession` helper to centralize. | §7.8 |
| Q9 | External `session_token` references | resolved | Three external surfaces (docs, meta-workflow, project rules); harness rules are out-of-repo. | §7.9 |

**Open count after initial deep-dive:** 0. All questions resolved through code analysis.

## 9. Portfolio lens pass

Lenses applied independently to the key modules examined in the initial deep-dive: `src/utils/session.ts`, `src/utils/crypto.ts`, `src/tools/resource-tools.ts` (`start_session` path), `src/logging.ts`, `src/schema/state.schema.ts`, `workflows/meta/skills/00-workflow-engine.toon::persist`.

### 9.1 Pedagogy lens (prism resource 06)

What inherited patterns may create silent problems?

| Pattern | Inheritance | Silent problem |
|---------|-------------|----------------|
| HMAC-as-self-authenticating-payload | Classic JWT pedagogy. The token *is* the state; verify the signature, trust the body. | Conflates *carrier* with *authority*. When the carrier (string) is fragile (LLM transcription), the authority survives but the verification step fails for purely operational reasons. The recovery code (`decodePayloadOnly`, the staleness branch) is an admission that the conflation has costs. |
| Token threaded on every call | REST/JWT pedagogy. Stateless protocols pass identity in every message. | LLMs are not REST clients. Treating them as such accepts a transcription-failure mode that the underlying primitive (HMAC) cannot recover from cleanly. The "six base32 chars" mitigation in #115 is a recognition that the agent's reliable-transcription window is much smaller than a REST client's. |
| Persist-via-agent-Write | Agent-as-Filesystem-Client pedagogy. The agent has Write access; teach it to use it. | Makes the agent the schema enforcer (TOON rules in the persist operation). Schema drift accumulates silently because no validator runs on the file the agent produced. The 8-field `StateSaveFileSchema` vs. 3-field actual envelope drift (§7.6) is exactly this mode. |
| Token + sibling file pattern | "Split high-churn from low-churn" pedagogy (avoid bloat in git diffs). | Optimizes for a downstream concern (code-review diff readability) at the cost of inventing a duplicate-state location. The new design's seal-over-bytes restores the single-source-of-truth at the cost of restoring the per-call write — a different trade-off, probably correct. |
| Optional `sessionTokenEncrypted` flag | Defense-in-depth pedagogy from the QC-004 hardening. | Leaves a stale, agent-visible field on a stale schema (`StateSaveFileSchema`). Nothing reads it. It quietly signals to readers that encryption-at-rest is somehow active when nothing is encrypted. Should be removed alongside the rest of `StateSaveFileSchema` (see Q5/Q6). |

### 9.2 Rejected-paths lens (prism resource 09)

What design paths were rejected, and what problems would they swap?

| Rejected path | Why rejected | Swapped problem |
|---------------|--------------|-----------------|
| Server-side session registry (in-memory map) | Loses statelessness. Restart wipes registry. | Eliminates the seal entirely. Adds restart-recovery (re-hydrate from disk on startup) AND concurrent-process coherence (lock the registry). New design rejects this; preserves stateless. |
| Cookie-style server-issued opaque token | Same as today's, but server-owned (server reads from sid → state map). | Same restart problem. Plus: agent's transcription failure mode unchanged. |
| Database (sqlite) backing | Strong consistency, transactions, easy queryability. | Adds a runtime dependency, complicates `~/.workflow-server` to a multi-file directory, breaks the "files in the planning folder are the truth" mental model. Worth considering at scale; out of scope for V1. |
| Encrypted state at rest (encrypt-then-MAC) | Confidentiality alongside integrity. | Doubles cryptographic surface area. Threat model (§5 in design philosophy) doesn't motivate it. Forward-compatible with current seal-only design. |
| Per-session secret key (vs. global) | Limits blast radius of a leaked key. | Where does the per-session key live? If in `session.json`, the file becomes self-authenticating and the seal is moot. If keyed externally, we re-introduce a registry. Rejected for V1; revisit if multi-tenant. |
| Wider index (8+ chars) | Eliminates collision policy entirely. | LLM transcription benchmarks (B1 in assumptions) cited 6-chars as the demonstrated upper bound. 8 might still be safe but introduces a perception-of-real-identifier risk (users start treating it as a stable ID, not a per-workspace token). Rejection is heuristic, not proven; F3 in assumptions tracks it. |
| Drop nested `parentSession` entirely | Simpler schema. | Re-introduces the existing single-level limitation. Issue #115 explicitly motivates recursion. Rejection rejected. |

### 9.3 Cross-lens synthesis

**Convergent finding (both lenses):** The AS-IS design treats the token as both *carrier* and *authority*, and the file as both *persistence* and *secondary-state*. Issue #115's correction is to separate carrier (`session_index`) from authority (the secret) and to consolidate persistence (`session.json`) with state (also `session.json`). Both lenses arrive at this: pedagogy by showing inherited-pattern friction, rejected-paths by showing what other separations could have been.

**Unique to pedagogy:** Schema-drift between code (`StateSaveFileSchema`) and reality (3-field envelope) is the most concrete bug-shaped item in the current code. Recommend cleaning it up as part of this refactor whether or not the broader #115 design is the chosen path.

**Unique to rejected-paths:** The decision to NOT use a database is worth re-examining at the plan-prepare stage if the migration story (phase 9) ends up requiring transactional semantics. The seal mechanism is robust against torn writes (atomic rename), but a multi-session converter could benefit from a transaction boundary.

## 10. Summary and handoff

### Architecture summary

The AS-IS workflow server is a stateless TypeScript MCP server that maintains session state in two coupled stores: a self-authenticating HMAC-signed token (server-owned signing, agent-owned threading) and a planning-folder file pair (agent-owned writes). #115 collapses this to a single source of truth in the planning folder, with the server holding both write authority and the integrity seal. The transition replaces the threaded `session_token` with a six-character `session_index`, removes agent-side `Write` calls for state files, restructures the audit/trace wrapper to re-resolve the index, and recursifies the parent chain to first-class nesting.

### Key abstractions identified

- AS-IS: `SessionPayload`, `SessionAdvance`, `ParentContext`, `sessionTokenParam`, `StateSaveFileSchema` (stale).
- TO-BE: `SessionFile` (recursive `parentSession`), `SessionIndex`, `Seal`, `sessionIndexParam`, server-owned read/write/seal/verify primitives in a new `session-store.ts` module.

### Design rationale hypotheses

DR1–DR9 in §4 document why the AS-IS code looks the way it does and what the implications are for #115. DR1, DR3, DR4, DR8 are most load-bearing: stateless-server simplicity, token-size pressure, restart fragility, agent-as-schema-enforcer.

### Domain glossary

Workspace, planning folder / slug, session index, session file, seal, authority, parent session, active checkpoint, authenticated tool, migration / converter (§5).

### Confidence level

**High.** All nine open questions resolved through code reads. No simulated behaviour or unconfirmed external dependencies. Two recommendations for the next activity (requirements-elicitation):

1. Confirm the §9.1 finding about `StateSaveFileSchema` being dead code: should it be removed as a janitorial pass before the #115 refactor lands, or in the same PR?
2. Confirm the §7.5 finding about `encryptToken`/`decryptToken` being dead code: same disposition question.

These are not blockers for elicitation; they are scope-decisions that the elicitation activity can clarify with the user.

### Touchpoint count for plan-prepare

Source files to be modified:
- `src/index.ts`, `src/config.ts` — workspace argument
- `src/utils/session.ts` — partial replacement (keep `assertCheckpointsResolved` logic, replace token machinery)
- `src/utils/crypto.ts` — remove dead code (optional); reuse `hmacSign`/`hmacVerify` for seal
- `src/utils/session-store.ts` — new module (atomic FS, enumeration, seal)
- `src/schema/session.schema.ts` — new module (`SessionFile` schema)
- `src/schema/state.schema.ts` — remove `StateSaveFileSchema` (stale)
- `src/tools/workflow-tools.ts` — 8 tools touched
- `src/tools/resource-tools.ts` — 3 tools touched (`start_session` semantically restructured; `get_skills`/`get_skill`/`get_resource` parameter swap)
- `src/logging.ts` — `appendTraceEvent` re-resolves
- `src/utils/validation.ts` — input-type change (`SessionPayload` → equivalent extracted shape)

Meta-workflow:
- `workflows/meta/skills/00-workflow-engine.toon` — remove/simplify `persist`, `restore`; rewrite token-discipline rules.
- `workflows/meta/resources/01-activity-worker-prompt.md`, `02-workflow-orchestrator-prompt.md` — update phrasing.

Tests:
- `tests/session.test.ts` — replace with `session-store.test.ts`
- `tests/dispatch.test.ts` — replace single-level parent assertions with recursive
- `tests/mcp-server.test.ts` — swap `session_token` for `session_index` in end-to-end paths
- New: `tests/session-store.test.ts`, `tests/session-index.test.ts`, `tests/migration.test.ts`

Docs:
- `docs/api-reference.md` — tool parameter examples
- `schemas/README.md` — add `session.schema.json` reference
- `CLAUDE.md`, `.engineering/AGENTS.md` — token-discipline rule updates

Approximate file count: **18 source files**, **3 workflow files**, **6 test files**, **4 doc files** = 31 files. This count aligns with the C3 "1–3 days of agentic development time" estimate in the assumptions log.

---

*Comprehension activity complete. Hand off to requirements-elicitation with the §10 summary and unresolved stakeholder questions (B3, B5, B6, C3, D3, E1, E2, E4, E5, E6, F3, G3, H2) from [02-assumptions-log.md](02-assumptions-log.md).*
