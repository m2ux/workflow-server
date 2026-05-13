# Server-Managed Session State - Implementation Plan

**Date:** 2026-05-13
**Priority:** HIGH
**Status:** Ready
**Estimated Effort:** 14-22h agentic + 3-4h review

---

## Overview

### Problem Statement

Workflow session state is split between two coupled stores: an opaque HMAC-signed
token threaded on every authenticated MCP call by the agent, and an
agent-written `workflow-state.json` + `.session-token` pair in the planning
folder. The split has produced operational pain: LLMs occasionally mis-transcribe
the long opaque token (the PR #1466 incident); the file schema is agent-enforced
and silently drifts from the server's Zod schema; the parent chain flattens to a
single level so grandparent dispatch (A → B → C) cannot be reconstructed; the
codebase carries explicit recovery code paths (`decodePayloadOnly`, the
staleness re-signing branch) that exist solely to compensate for the token's
brittleness.

This refactor makes the MCP server **workspace-aware** and gives it **end-to-end
authority over session state**. The server owns `session.json` plus a sibling
`.session-token` HMAC seal in the planning folder; the agent passes only a
six-character `session_index` on each authenticated call; the parent chain
becomes a recursive `parentSession` field rather than a single flattened level;
the staleness recovery branch and `decodePayloadOnly` are removed entirely.

### Scope

**In Scope:**

- Workspace argument at server launch (CLI flag `--workspace=PATH` plus env var
  `WORKFLOW_WORKSPACE`; CLI wins; error at startup if neither is provided).
- `start_session(planning_slug, agent_id)` — server resolves
  `<workspace>/.engineering/artifacts/planning/<slug>/`, creates or loads
  `session.json`, returns a `session_index`. Idempotent.
- Six-character base32 `session_index` derived as
  `base32(HMAC-SHA256(realpath(folder), secret)[0..4])`. Deterministic and
  secret-bound.
- `session.json` (server-written, agent-readable) — full session state union of
  today's `SessionPayload` fields and today's `workflow-state.json` envelope,
  plus a recursive `parentSession` of the same shape. Includes
  `schemaVersion: 1` at the root (PD-9).
- `.session-token` (server-written) — raw HMAC hex over `session.json` bytes.
  No envelope. Whitespace and key-order changes invalidate the seal (intended).
- Atomic write of both files: `session.json.tmp` → fsync → rename, then
  `.session-token.tmp` → fsync → rename. State first, seal second. A reader
  during the inter-rename window observes a seal mismatch and fails fast.
- Permissions: `0700` on the planning folder, `0600` on `session.json` and
  `.session-token`.
- `session_index` on every authenticated tool — replaces `session_token` on
  `get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`,
  `present_checkpoint`, `respond_checkpoint`, `resume_checkpoint`, `get_trace`,
  `get_workflow_status`, `get_skills`, `get_skill`, `get_resource`. Unauthenticated
  tools (`discover`, `list_workflows`, `health_check`, `resolve_operations`)
  unchanged.
- Server-side validation pipeline on every authenticated call: resolve
  `session_index` → folder → read `session.json` + `.session-token` → verify
  `state.sessionIndex == passed_index` → verify
  `HMAC(session.json bytes, secret) == .session-token` → execute → write new
  state + new seal atomically.
- Recursive `parentSession`: same shape as `SessionFile`, captured at
  child-dispatch time as a snapshot of the parent's `session.json`. No hard
  depth ceiling; soft warning past 5 levels (PD-6).
- `withAuditLog` re-resolution: the audit-log wrapper accepts `session_index`
  and re-resolves it independently. Duplicate-resolution cost is accepted for V1.
- Migration converter (Phase 9): one-shot reader that takes a legacy
  `workflow-state.json` + sibling `.session-token` pair and produces
  `session.json` + new `.session-token` seal. Idempotent and detect-on-read.
- Dead-code removal: `encryptToken` / `decryptToken` (no live callers) and
  `StateSaveFileSchema` (stale 8-field schema not validated against the actual
  3-field envelope) are removed in the same PR.
- Salvage from Tier C: canonical-serialization and atomic-write patterns
  (`state-hash.ts` canonicalisation, `session-store.ts` atomic-rename + EXDEV
  handling) lifted into the new `src/utils/session-store.ts`. CBOR codec is not
  salvaged (no wire format change in #115).
- Documentation updates: every doc referencing `session_token`, plus deletion
  of `docs/interceptor-recipe.md` and revert of PR #113 architecture additions.
- Meta-workflow surface updates: `meta/skills/00-workflow-engine.toon` (persist
  becomes no-op, restore becomes start_session wrapper, token-discipline rules
  removed), `meta/workflow.toon` variables, orchestrator/worker prompt resources.

**Out of Scope:**

- Cross-workspace sessions (separate design).
- Server-side enforcement of checkpoint semantics (server validates protocol
  integrity only).
- Encryption of session state at rest (seal mechanism is forward-compatible
  with encrypt-then-MAC).
- Per-agent authentication.
- Multi-tenant servers.
- Network filesystem support (NFS, SMB, FUSE).
- Concurrent-process locking (V1 uses seal mismatch as the detection
  mechanism).
- Secret-key rotation protocol (manual rotation invalidates in-flight sessions).
- Force-reseal escape hatch for intentional hand-edits.
- Configurable `session_index` length (fixed at six for V1).
- Replacing TOON workflow definitions, skill files, resources, or validators.
- Backwards compatibility with `feat/112-interceptor-cli` branch (parked).

---

## Research & Analysis

*See companion planning artifacts for full details:*

- **Design philosophy:** [02-design-philosophy.md](02-design-philosophy.md)
- **Codebase comprehension:** [03-codebase-comprehension.md](03-codebase-comprehension.md)
- **Requirements elicitation:** [04-requirements-elicitation.md](04-requirements-elicitation.md) (PD-1..PD-11)
- **Research findings:** [05-research.md](05-research.md) (B1, B2, F4)
- **Assumptions log:** [02-assumptions-log.md](02-assumptions-log.md)

### Key Findings Summary

**From comprehension:**

- **31 files** to be modified across 4 domains: 18 source files, 3 workflow
  files, 6 test files, 4 doc files.
- **10 standard authenticated tools** spread the `sessionTokenParam` fragment
  defined once at `src/utils/session.ts:188-192`. Replacing that fragment is the
  single-point change for the parameter swap.
- **3 bespoke authenticated tools** (`start_session`, `present_checkpoint`,
  `respond_checkpoint`) need bespoke schema changes.
- **`withAuditLog`** (`src/logging.ts:54-81`) decodes the token to populate
  `sid`/`wf`/`act`/`aid` in trace events. Under the new design it re-resolves
  the index — duplicate resolution accepted for V1.
- **`StateSaveFileSchema`** (`src/schema/state.schema.ts:165-174`) is stale
  8-field schema; the actual on-disk envelope is the 3-field
  `{stateVersion, savedAt, startedAt, state}` form. Dead code.
- **`encryptToken`/`decryptToken`** (`src/utils/crypto.ts:56-75`) are dead
  code post `state-tools.ts` removal.
- **HMAC primitives** (`hmacSign`/`hmacVerify` at `src/utils/crypto.ts:77-86`)
  already meet the seal requirements. Re-use them.
- **Existing recursive schema precedent**: `NestedWorkflowStateSchema`
  (`src/schema/state.schema.ts:133-138`) uses `z.lazy()` — same pattern for
  `parentSession`.

**From research:**

- **B1 — Six-char base32 sufficiency:** 30 bits is conservative for the
  per-workspace namespace (at 1000 folders expected collisions ≈ 5 × 10⁻⁴);
  transcription is empirically safer than the long opaque token (sidesteps
  boundary truncation and run-length substitution).
- **B2 — HMAC-SHA256 derivation:** Confirmed primitive (re-use `hmacSign`);
  input is `fs.realpathSync(absolute_folder_path)`; 5-byte truncation per
  RFC 2104 §5 (same security regime as HOTP).
- **F4 — Enumeration cost:** Sub-millisecond at typical sizes (≤ 100 folders);
  ~5 ms at 1000 folders. **No cache in V1.** Same order of magnitude as the
  existing per-call baseline.

---

## Proposed Approach

### Solution Design

A ten-phase sequenced refactor structured along the five abstraction layers
identified in comprehension: configuration, session store primitives, session
schema, authenticated tool API, and persistence/meta-workflow integration.
Phase ordering is dictated by data flow: configuration must land first because
every other module needs the workspace path; the session store must land before
any tool can call it; the schema must land before any handler can write a
`session.json`. Migration (Phase 9) and documentation (Phase 10) run last
because they consume the finished surface.

Each phase produces independently committable code. The PR is single (no
dual-mode period — PD-7) but the commit history is phased so a reviewer can
read the diff phase-by-phase. Test fixtures for migration use this very work
package's `workflow-state.json` (per R1).

### Plan-Phase Decision Resolution

The 11 forwarded decisions (PD-1..PD-11) are resolved as follows:

| # | Decision | Resolution | Rationale |
|---|----------|------------|-----------|
| PD-1 | Workspace-arg precedence | **Confirm recommendation.** CLI flag wins; env var fallback; startup error when neither is present. | Standard precedence ordering; explicit failure beats silent `cwd()` fallback. |
| PD-2 | Migration strategy | **Confirm recommendation.** One-shot converter shipped in the same PR; idempotent; detect-on-read. | Cleaner blast radius than coexistence; the codebase already has one in-flight workflow (this one) plus a small number of historical folders. |
| PD-3 | `session_index` length | **Confirm recommendation.** Fixed at six (30 bits) for V1. | Research §1 confirmed sufficiency; deferred configurability to V2 if folder counts grow. |
| PD-4 | Collision policy | **Confirm recommendation.** Error-with-disambiguation: return both candidate paths; require longer prefix or rename. **Do not** lengthen index to 8 chars. | At realistic sizes (≤ 1000 folders) expected collisions ≈ 5 × 10⁻⁴; a deterministic error is preferable to silent ambiguity. Keeps the 6-char transcription budget. |
| PD-5 | Secret-key rotation | **Confirm recommendation.** No rotation protocol in V1. Document recovery: regenerate secret; in-flight sessions invalidated; re-running `start_session` against the existing folder re-seals on first authenticated call. | Single-user-machine threat model; rotation is a power-user concern out of scope for V1. |
| PD-6 | Parent-chain depth | **Confirm recommendation.** No hard ceiling; soft warning past 5 levels included in validation messages. | Typical dispatch is 2-3 levels deep; pathological depth surfaces via warning, not crash. |
| PD-7 | Deprecated `session_token` parameter | **Confirm recommendation.** No. Clean break. | Smaller blast radius, smaller test matrix, lower documentation surface; migration converter handles in-flight workflows. |
| PD-8 | Address #98 / #101 in scope | **Confirm recommendation.** No. Close #98 as superseded once #115 lands; track #101 separately. | Scope discipline; #115 is already 1-3 days of work. |
| PD-9 | `session.json` schema design | **Confirm recommendation.** Flat schema with `schemaVersion: 1` at root. | Simplest forward-compatible design; namespacing can be added at first breaking change. |
| PD-10 | Force-reseal escape hatch | **Confirm recommendation.** No. Hand-edits result in seal mismatch; users restart from the most recent commit. | Threat model is incoherent state, not malicious actors; an escape hatch undermines the convergence detector. |
| PD-11 | Single `session_index` parameter on checkpoints | **Confirm recommendation.** Yes — single parameter; active checkpoint read from `state.activeCheckpoint`; no separate `checkpoint_handle`. | Already partially shipped on PR #113; agent's checkpoint discipline already routes through state, not an out-of-band handle. |

Additional tactical decisions made by this plan (not in the PD list):

- **Symlink resolution.** Always canonicalise via `fs.realpathSync` before
  HMAC. Avoids the "same folder, two indices" pitfall when the agent and
  server disagree about symlink resolution. (Forwarded from research §2.4.)
- **Encoding for index.** RFC 4648 base32 (`A-Z2-7`), case-insensitive on
  input, uppercase on output. Crockford was considered but rejected — the
  input regime is machine-emitted, not hand-typed.
- **Atomic write order.** State first (`session.json` → fsync → rename), seal
  second (`.session-token` → fsync → rename). A reader observing the
  inter-rename window sees a mismatched seal and fails fast.
- **HMAC over canonical bytes.** Canonicalise to UTF-8 sorted-key JSON before
  hashing (lifted from Tier C `state-hash.ts`). The agent reads
  `session.json` as-is; canonicalisation is server-internal at write time.
  The on-disk bytes ARE the canonical bytes — so what the agent reads matches
  what the seal verifies.
- **EXDEV fallback.** Atomic rename across devices fails on EXDEV. Lift Tier C
  fallback (copy + fsync + unlink) for that case; planning folder and tmp
  file are always on the same device in practice, but defensive.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Single source on disk (this design) | Server owns authority + write path; transcription-safe agent surface; recursive parents free | Per-call file I/O; folder enumeration on every call | **Selected** |
| Server-side in-memory session registry (sid → state map) | Avoids per-call file I/O | Loses statelessness (restart wipes registry); concurrent-process incoherence | Rejected |
| Cookie-style server-issued opaque token | Server-owned; same wire shape | Same transcription failure mode; restart fragility unchanged | Rejected |
| Database (sqlite) backing | Transactions; easy queryability | Runtime dependency; breaks "files in folder are truth" mental model | Rejected for V1 |
| Wider index (8+ chars) | Eliminates collision policy | Reduces transcription safety margin; perception-of-real-identifier risk | Rejected (research §1) |
| Encrypt state at rest | Confidentiality alongside integrity | Doubles cryptographic surface area; not in threat model | Rejected (forward-compatible) |
| Per-session secret key | Limits leak blast radius | Where does the per-session key live? Re-introduces registry | Rejected for V1 |
| Drop nested `parentSession` | Simpler schema | Re-introduces single-level limitation; defeats #115 goal | Rejected |

---

## Implementation Tasks

The work package is sequenced into ten phases. Phases 1-3 are foundation
(workspace, store, schema); 4-7 are surface (tool API, dispatch, audit,
checkpoint); 8-9 are migration (meta-workflow, legacy converter); 10 is
documentation.

### Phase 1: Workspace argument plumbing (1.5-2h)

**Goal:** Server accepts a workspace path at launch and exposes it through
config.

**Deliverables:**

- `src/config.ts` — extend `ServerConfig` with `workspaceDir: string`; add CLI
  parsing (`--workspace=PATH`) and env-var fallback (`WORKFLOW_WORKSPACE`);
  startup error when neither is provided (PD-1).
- `src/index.ts` — pass parsed args from `process.argv` into `loadConfig`.
- `tests/config.test.ts` — extend with workspace-arg precedence cases (CLI
  wins, env-only, neither = error).

**Depends on:** None.

### Phase 2: Session store primitives (3-4h)

**Goal:** New `src/utils/session-store.ts` module owns all session file
read/write/seal/verify operations.

**Deliverables:**

- `src/utils/session-index.ts` — `computeSessionIndex(folderAbsPath)`:
  `base32(hmacSha256(secret, fs.realpathSync(folderAbsPath))[0..4])`,
  6-char uppercase RFC 4648 base32.
- `src/utils/session-store.ts` — atomic-write primitives lifted from Tier C
  with EXDEV fallback; `canonicaliseJson` for stable serialisation;
  `readSessionFile(folder)`, `writeSessionFile(folder, state)`,
  `verifySeal(folder)`, `writeSeal(folder, jsonBytes)`,
  `resolveSessionIndex(workspaceDir, sessionIndex) → folderAbsPath`.
- `src/utils/session-store.ts` — folder-enumeration entry that hashes every
  `<workspace>/.engineering/artifacts/planning/*/` and matches the requested
  index; on collision, throw with both candidate paths (PD-4).
- Planning folder creation: `0700` directory mode; files written `0600`.

**Depends on:** Phase 1 (workspace path).

### Phase 3: `SessionFile` schema (1.5-2h)

**Goal:** New `src/schema/session.schema.ts` defines the canonical
`SessionFile` shape used by the server.

**Deliverables:**

- `src/schema/session.schema.ts` — Zod schema for `SessionFile`:
  - Root: `schemaVersion: z.literal(1)`, `sessionIndex: z.string()`,
    `workflowId`, `workflowVersion`, `agentId`, `seq`, `ts`, `startedAt`.
  - Per-session state: `currentActivity`, `currentSkill`, `condition`,
    `activeCheckpoint?`, `variables: z.record(z.unknown())`,
    `completedActivities`, `skippedActivities`, `checkpointResponses`,
    `history`, `triggeredWorkflows` (existing
    `NestedTriggeredWorkflowRefSchema`).
  - Recursive parent: `parentSession: z.lazy(() => SessionFileSchema).optional()`.
- `src/schema/session.schema.ts` — emit `SessionFileSchema`,
  `safeValidateSessionFile`, types.
- `schemas/session-file.schema.json` — generated JSON Schema for
  documentation/external consumers.

**Depends on:** Phase 1 (for schemaVersion stability); independent of Phase 2.

### Phase 4: Authenticated tool API swap (2-3h)

**Goal:** Replace `session_token` with `session_index` across every
authenticated tool.

**Deliverables:**

- `src/utils/session.ts` — replace `sessionTokenParam` with
  `sessionIndexParam` (6-char `[A-Z2-7]{6}` regex); update spread sites in
  `tools/workflow-tools.ts` (8 tools) and `tools/resource-tools.ts`
  (3 tools); remove `decodeSessionToken`, `decodePayloadOnly`,
  `advanceToken`, `createSessionToken`, `SessionPayload` (replaced by
  `SessionFile`); retain `assertCheckpointsResolved` but rewrite to read
  `state.activeCheckpoint` (R5).
- `src/utils/validation.ts` — `MetaResponseSchema` drops `session_token`; the
  authenticated-tool response envelope no longer threads the token (R3).
- `src/tools/workflow-tools.ts` — every authenticated handler resolves the
  index → folder → reads/verifies state → executes → writes/seals; clears
  staleness recovery branch.
- `src/tools/resource-tools.ts` — same for `get_skills`, `get_skill`,
  `get_resource`.
- `src/tools/workflow-tools.ts` (`present_checkpoint`, `respond_checkpoint`)
  — single `session_index` param; active checkpoint is read from
  `state.activeCheckpoint` (PD-11, R2); no `checkpoint_handle` shadow alias.

**Depends on:** Phase 2 (resolution), Phase 3 (schema).

### Phase 5: `start_session` restructure (2-3h)

**Goal:** `start_session` accepts `planning_slug` plus `agent_id`; resolves the
folder; creates or loads `session.json`; returns `session_index`.

**Deliverables:**

- `src/tools/resource-tools.ts` (`start_session`) — accept
  `planning_slug: string` and `agent_id: string`; resolve
  `<workspace>/.engineering/artifacts/planning/<slug>/`; if `session.json`
  exists, verify seal and return its `sessionIndex`; else create folder
  (mode 0700), write fresh `session.json` (with `parentSession?` if
  `parent_planning_slug` provided), compute and write seal, return index.
- `src/tools/resource-tools.ts` — remove `parent_session_token` parameter;
  add `parent_planning_slug?: string` (optional); parent snapshot is captured
  by reading the parent folder's current `session.json` (R6).
- `src/tools/resource-tools.ts` — remove staleness-recovery branch (DR4) and
  `decodePayloadOnly` path.

**Depends on:** Phase 4 (param-shape swap).

### Phase 6: Recursive parent chain (1.5-2h)

**Goal:** `parentSession` is captured at dispatch time and serialises
recursively.

**Deliverables:**

- `src/tools/resource-tools.ts` (`start_session`) — when `parent_planning_slug`
  is provided, read the parent's current `session.json` (verifying the seal)
  and store it as a deep snapshot under the child's `parentSession` field
  (R6). Soft-warn (`_meta.validation`) when depth exceeds 5 (PD-6).
- `src/schema/session.schema.ts` — `parentSession` recursion validated via
  `z.lazy()` (already present from Phase 3).
- Validation: depth-counter helper exposed for trace events (PD-6).

**Depends on:** Phase 3 (recursive schema), Phase 5 (`start_session`).

### Phase 7: Audit/trace re-resolution (1-1.5h)

**Goal:** `withAuditLog` re-resolves `session_index` and populates trace
events from the resolved `session.json`.

**Deliverables:**

- `src/logging.ts` (`appendTraceEvent`) — replace
  `decodeSessionToken(tokenStr)` with
  `resolveSessionIndex(workspaceDir, params.session_index)` → read
  `session.json` → extract `sid`, `wf`, `act`, `aid` (R4). Unauthenticated
  tools (no `session_index`) emit trace events without these fields, as
  today.
- `src/logging.ts` — accept duplicate resolution cost as V1 characteristic
  (research §3.4).

**Depends on:** Phase 2 (resolution), Phase 4 (parameter shape).

### Phase 8: Meta-workflow surface update (1-1.5h)

**Goal:** Meta-workflow operations and prompts no longer reference
`session_token` or instruct the agent to `Write` state files.

**Deliverables:**

- `workflows/meta/skills/00-workflow-engine.toon` — `persist` becomes a
  no-op (or is removed entirely); `restore` becomes a thin wrapper around
  `start_session(planning_slug, agent_id)`; `commit-and-persist` retains the
  git-commit choreography but drops the persist call; token-discipline rules
  (`token-passes-on-each-call`, `use-most-recent-token`, etc.) are removed
  or rewritten for `session_index`.
- `workflows/meta/workflow.toon` — variables `saved_session_token`,
  `client_session_token`, `pending_checkpoint_handle`, flat parent fields
  (`parent_session_token`, `pwf`, etc.) replaced by recursive
  `parent_planning_slug` or equivalent; `session_index` becomes the canonical
  variable.
- `workflows/meta/resources/01-activity-worker-prompt.md` and
  `02-workflow-orchestrator-prompt.md` — phrasing updated; references to
  threading and re-signing tokens removed; resume becomes a single
  `start_session(planning_slug, agent_id)` call.

**Depends on:** Phase 5 (`start_session` shape).

### Phase 9: Migration converter (2-3h)

**Goal:** One-shot reader that converts legacy
`workflow-state.json` + `.session-token` pairs to the new
`session.json` + new `.session-token` seal pair.

**Deliverables:**

- `src/utils/migration.ts` — `migratePlanningFolder(folderAbsPath)`:
  detect-on-read (presence of `session.json` short-circuits), read legacy
  3-field envelope, decode the legacy token (using the still-available
  decoder isolated to this module), map to `SessionFile` shape, write
  `session.json` + new seal atomically, delete legacy `workflow-state.json`
  (keep `.session-token` because it's overwritten in place).
- `src/utils/migration.ts` — idempotency: second call short-circuits (R1,
  SC-9).
- Migration is invoked automatically on every `start_session` against an
  existing folder that contains a legacy envelope but no `session.json`.
- Test fixture: a snapshot of this work package's own `workflow-state.json`
  is committed under `tests/fixtures/legacy-session/` and used by
  `tests/migration.test.ts`.

**Depends on:** Phase 2 (atomic write), Phase 3 (target schema).

### Phase 10: Dead-code removal + documentation (1.5-2h)

**Goal:** Remove stale code; update every doc and rule referencing
`session_token`.

**Deliverables:**

- `src/utils/crypto.ts` — remove `encryptToken`, `decryptToken` (DR7, Q5).
- `src/schema/state.schema.ts` — remove `StateSaveFileSchema` and
  `StateSaveFile` type (Q6, DR8).
- `src/utils/session.ts` — file shrinks to `assertCheckpointsResolved` and
  any other still-live helpers (or is deleted entirely; the
  active-checkpoint helper moves into `session-store.ts`).
- `docs/api-reference.md`, `docs/architecture.md`, `docs/checkpoint_model.md`,
  `docs/dispatch_model.md`, `docs/development.md`, `docs/ide-setup.md`,
  `docs/state_management_model.md`, `docs/resource_resolution_model.md`,
  `docs/orchestra-specification.md`, `docs/artifact_management_model.md`,
  `docs/workflow-fidelity.md`, `README.md`, `CLAUDE.md`, `AGENTS.md` —
  every reference to `session_token` updated to `session_index`; persist/restore
  prose updated to reflect server ownership.
- `docs/interceptor-recipe.md` — deleted.
- PR #113 architecture additions reverted/removed.
- `schemas/README.md` — `session-file.schema.json` documented.

**Depends on:** All preceding phases.

---

## Success Criteria

The 14 success criteria SC-1 through SC-14 are defined in
[04-requirements-elicitation.md §7](04-requirements-elicitation.md). The plan
maps phases to verification:

### Functional Requirements

- [ ] **SC-1** — No agent-side token threading (verified by Phase 4 +
      Phase 10 grep).
- [ ] **SC-2** — No agent-side state writes (Phase 8 grep).
- [ ] **SC-3** — Atomic state + seal write on every mutating tool (Phase 2 +
      Phase 4 integration test).
- [ ] **SC-4** — Tampering detected; seal mismatch error (Phase 2 test).
- [ ] **SC-5** — Nested parents recursive (Phase 6 test).
- [ ] **SC-6** — Resume is one call (Phase 5 test).
- [ ] **SC-7** — Idempotent index derivation (Phase 2 test).
- [ ] **SC-8** — Server restart transparent (Phase 2 test).
- [ ] **SC-9** — Migration converter idempotent (Phase 9 test).
- [ ] **SC-10** — Collision policy deterministic (Phase 2 test).
- [ ] **SC-11** — Documentation reflects new model (Phase 10 grep).
- [ ] **SC-12** — `withAuditLog` re-resolution correct (Phase 7 test).
- [ ] **SC-13** — Dead-code removal clean (Phase 10 grep).
- [ ] **SC-14** — `npm run typecheck && npm test` passes.

### Quality Requirements

- [ ] Test coverage at or above pre-refactor baseline (256 passed / 2 skipped
      per the reverted Tier C measurement).
- [ ] No new skipped tests beyond what existed pre-refactor.
- [ ] No new `// TODO` comments introduced (per submission checklist).

### Measurement Strategy

How we validate:

- **Functional success:** the SC-1..SC-14 verification methods are
  source-grep, integration tests, and unit tests embedded in the deliverables.
- **Performance:** post-refactor, run `npm test` and observe enumeration cost
  in `tests/performance/` (added as part of Phase 2 if useful). Research §3
  predicts sub-millisecond at realistic sizes.
- **Migration safety:** the migration test uses this work package's own
  `workflow-state.json` as a fixture (R1); running the converter twice is a
  no-op.

---

## Testing Strategy

Detailed test cases are listed in [05-test-plan.md](05-test-plan.md). High-level
coverage:

### Unit Tests

- `session-index.test.ts` — index derivation determinism; idempotence;
  collision synthesis.
- `session-store.test.ts` — atomic write semantics; seal verification;
  tamper-injection; EXDEV fallback.
- `session-schema.test.ts` — `SessionFile` Zod validation; recursive
  `parentSession` round-trip.
- `migration.test.ts` — legacy converter; idempotence; this-very-folder
  fixture.

### Integration Tests

- `mcp-server.test.ts` (updated) — every authenticated tool reads/writes the
  pair atomically; index parameter contract.
- `dispatch.test.ts` (updated) — three-level parent chain
  (A → B → C → D); recursive assertion.
- `trace.test.ts` (updated) — trace event fields derived from re-resolved
  `session.json`.

### E2E Tests

- Full work-package flow against a fresh planning folder: `start_session`
  → `next_activity` → `yield_checkpoint` → `respond_checkpoint` →
  `resume_checkpoint` → state survives across server restart.

---

## Dependencies & Risks

### Requires (Blockers)

- [ ] Node.js 18+ (existing runtime baseline).
- [ ] POSIX filesystem semantics on local mounts.
- [ ] `~/.workflow-server/secret` exists (auto-created on first run by
      existing `getOrCreateServerKey`).

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Atomic-rename failure on unusual filesystems (NFS, FUSE) | HIGH | LOW | Documented constraint (network FS unsupported); EXDEV fallback handles cross-device; surface clear error otherwise. |
| Migration converter loses state on edge-case envelopes | HIGH | MEDIUM | Idempotent + detect-on-read (SC-9); fixture from this work package's own state file (R1); manual conversion path documented as fallback. |
| Test rewrite scope larger than estimated (≈50-80 cases) | MEDIUM | MEDIUM | Introduce `testSession` helper (comprehension §7.8) to centralise inline session construction; phase-by-phase test updates align with phase landings. |
| Folder enumeration becomes hot path at large workspace sizes | LOW | LOW | Research §3 predicts sub-millisecond at realistic sizes; single-entry LRU stub call site reserved if profiling shows hot path. |
| Concurrent server processes against same workspace | MEDIUM | LOW | Documented unsupported (out-of-scope item 7); seal mismatch is the detection mechanism. |
| Secret-key rotation mid-workflow | HIGH | LOW | Documented recovery (PD-5); user must re-`start_session` against existing folder which re-seals on first authenticated call. |
| Harness rule update lag (downstream consumers) | LOW | MEDIUM | Rule files in this repo updated in Phase 10; user-level `~/.claude/` rules are deployment concern, not a server PR concern. |

---

**Status:** Ready for implementation.
