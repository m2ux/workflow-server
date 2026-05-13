# Server-Managed Session State - Implementation Plan

**Date:** 2026-05-13
**Priority:** HIGH
**Status:** Ready (revised after `approach-confirmed` revise — sweep phases for redundant prose added)
**Estimated Effort:** 17-25h agentic + 3-4h review (was 14-22h; +3h for the expanded TOON / docs sweep in Phases 8.1, 8.2, 10.1, 10.2)

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
- Documentation sweep: every doc referencing `session_token`, plus revert
  of PR #113 architecture additions. The `docs/interceptor-recipe.md` file
  is **already absent** from `main` HEAD (verified during the plan-revision
  sweep — S1); Phase 10.3 audits the sunset rather than deleting the file.
  See Appendix A for the per-file disposition table.
- Meta-workflow surface sweep: `meta/skills/00-workflow-engine.toon`
  (operations `adopt-session`, `restore`, `persist` deleted; rules
  `token-passes-on-each-call`, `use-most-recent-token`, `token-is-opaque`,
  `staleness-recovery-only-via-start-session`, `start-session-strict-params`,
  `parameter-vs-variable` deleted; remaining operations rewritten with
  `session_index` semantics — 50 `session_token` references → 0);
  `meta/workflow.toon` variables (`saved_session_token`, `client_session_token`,
  `pending_checkpoint_handle`, `session_recovered`, `session_adopted` renamed
  or dropped); `meta/activities/{00,01,03,04}*.toon` rewritten;
  `meta/skills/{01-agent-conduct,07-harness-compat}.toon` rewritten;
  `meta/resources/{00-bootstrap-protocol,01-activity-worker-prompt,02-workflow-orchestrator-prompt}.md`
  and `meta/README.md` rewritten. See Appendix A for the full file list.

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

The work package is sequenced into ten phases (with Phase 8 and Phase 10
each split into three sub-phases as a result of the plan-revision sweep).
Phases 1-3 are foundation (workspace, store, schema); 4-7 are surface
(tool API, dispatch, audit, checkpoint); 8 is the meta-workflow TOON
cleanup (8.1 = `00-workflow-engine.toon`, 8.2 = remaining TOON files,
8.3 = resources/READMEs); 9 is the legacy migration converter; 10 is
the docs sweep (10.1 = docs/, 10.2 = dead-code removal, 10.3 = interceptor
sunset audit). Appendix A enumerates every file affected with its
disposition.

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

### Phase 8: Meta-workflow surface update (2.5-3.5h, was 1-1.5h)

**Goal:** Meta-workflow operations, rules, variables, and prompts no longer
reference `session_token`, `workflow-state.json`, `.session-token`, or
instruct the agent to `Write` state files. Redundant prose generated to
defend the brittle token-threading contract is deleted.

The phase is split into three sub-phases so reviewers can read the diff in
domain order (skills → activities/workflow → resources/READMEs).

#### Phase 8.1: `workflows/meta/skills/00-workflow-engine.toon` (1.5-2h)

This file is the largest single concentration of redundant prose (50
`session_token` hits across operations and rules; see Appendix A for the
grep map). Specific operations and rules to edit:

**Operations to delete or rewrite (verbatim names from the TOON):**

| Operation | Disposition | Rationale |
|-----------|------------|-----------|
| `scan-saved-sessions` | **Rewrite.** Output shape changes from `{ sessionToken, planningFolder, savedAt, variables }` to `{ sessionIndex, planningFolder, savedAt, variables }`; remove the "read its workflow-state.toon" step (the server reads `session.json`); replace `workflow-state.toon` mention with `session.json` (state file change). | Saved-session matching now operates on server-readable `session.json`; agent no longer parses the envelope. |
| `match-saved-session` | **Rewrite.** Output candidate shape uses `sessionIndex` instead of `sessionToken`. Procedure prose unchanged except for the field rename. | Same shape rename. |
| `adopt-session` | **Delete entire operation.** | Adoption is no longer agent-driven; `start_session(planning_slug, agent_id)` performs the same role idempotently. All of `errors.strict_param_violation`, `errors.unrecoverable_token`, `rules.strict-params`, `rules.no-recovery-elsewhere` are removed with the operation. |
| `create-session` | **Rewrite.** Inputs become `(workflow_id, parent_planning_slug?)`; output becomes `session_index`. The strict-schema warning prose ("Do NOT pass session_token; the schema is strict and unknown keys are rejected") is deleted — strict-schema concerns no longer apply because the parameter shape is uniform. | `start_session` schema is simpler; the warning was generated by today's overloaded parameter set. |
| `restore` | **Delete entire operation.** | Restore is the server's job. The orchestrator-resume path collapses to `start_session(planning_slug, agent_id)`. |
| `persist` | **Delete entire operation.** | The agent never writes session state. The five rules (`state-format`, `token-in-sibling`, `no-token-duplication`, `no-derived-fields`, `omit-empty-collections`, `variables-canonical-home`) are deleted with the operation — every one of them was generated to constrain the agent's state writes. |
| `dispatch-activity` | **Rewrite.** `next_activity({ session_token, ... })` becomes `next_activity({ session_index, ... })` in the procedure step. No other change. | Direct parameter rename. |
| `handle-sub-workflow` | **Rewrite.** Inputs become `(workflow_id, parent_planning_slug)`; output becomes `child_session_index`. Strict-schema warning prose deleted. | Same simplification as `create-session`. |
| `commit-and-persist` | **Rewrite.** Drop the `workflow-engine::persist` step from the procedure. The git-commit choreography for source-side commits and engineering commits is retained. The engineering commit message no longer mentions `workflow-state.json` or `.session-token`; `session.json` may be committed alongside other engineering artifacts if it lives under `.engineering/artifacts/`, but is written by the server. The `persist-before-engineering-commit` rule is **deleted** (no persist call to order); `commit-after-activity` rule is **rewritten** to drop the explicit reference to persist. | The agent no longer persists; the rule's "skipping persist altogether makes the session unrecoverable" warning is moot. |
| `yield-checkpoint` | **Rewrite.** `yield_checkpoint({ session_token, checkpoint_id })` becomes `yield_checkpoint({ session_index, checkpoint_id })`. The `checkpoint-handle-distinct-from-session` rule prose ("yield_checkpoint returns a checkpoint_handle… present_checkpoint and respond_checkpoint take a checkpoint_handle parameter, NOT a session_token. Never substitute one for the other.") is **deleted** entirely — per PD-11, `present_checkpoint` and `respond_checkpoint` now take `session_index` and the active checkpoint is read from `state.activeCheckpoint`. | Checkpoint handle as a distinct token disappears. |
| `resume-from-checkpoint` | **Rewrite.** Inputs become `(session_index, effects)`; output becomes `session_index` (unchanged). The procedure step drops the "capture the new session_token from the response and use it for every subsequent call" prose — the index is stable across calls. The `checkpoint_still_active` and `hmac_failure` error blocks are **deleted** (no HMAC failure mode at the agent layer; staleness recovery is server-side). The `resume-uses-post-respond-token` rule is **deleted**. | Index stability eliminates token-rotation discipline. |
| `bubble-checkpoint-up` | **No change.** | The operation doesn't reference session tokens. |
| `present-checkpoint-to-user` | **Rewrite.** `present_checkpoint({ checkpoint_handle })` becomes `present_checkpoint({ session_index })`. The `checkpoint-handle-distinct-from-session` rule is **deleted**. The `invalid_checkpoint_handle` error is **rewritten** to refer to "Invalid session_index" with stale-folder recovery guidance. | PD-11. |
| `respond-checkpoint` | **Rewrite.** Same param rename. The output drops `resumed_session_token` (no longer returned). The `thread-resumed-token` rule is **deleted**. The procedure step "from the response, capture BOTH effects and the new checkpoint_handle field" is **rewritten** to "from the response, capture effects". | PD-11 + R3. |
| `compose-prompt`, `extract-checkpoint-handle`, `handle-workflow-complete`, `verify-outcomes`, `generate-summary`, `finalize-activity`, `evaluate-transition` | **No change.** | Don't reference session tokens. |

**Top-level rules to delete (verbatim names):**

| Rule | Disposition | Rationale |
|------|------------|-----------|
| `token-passes-on-each-call` | **Delete.** | Index replaces token; rule is rewritten conceptually as "every authenticated tool requires `session_index`" but lives in the new `session-index-passes-on-each-call` shape (one terse rule, not a discipline). |
| `use-most-recent-token` | **Delete.** | Index is stable; no rotation. |
| `token-is-opaque` | **Delete.** | Index is the visible identifier; the opacity concern goes away. The base32 string IS the identifier. |
| `validation-warnings` | **Keep, no change.** | Generic validation guidance independent of token shape. |
| `resource-loading-via-tool` | **Rewrite.** Replace `get_resource({ session_token, resource_id })` with `get_resource({ session_index, resource_id })`. | Direct rename. |
| `staleness-recovery-only-via-start-session` | **Delete.** | No staleness recovery exists. The rule is generated entirely by today's brittle token. |
| `start-session-strict-params` | **Delete.** | `start_session`'s schema is simpler post-refactor (`planning_slug`, `agent_id`, `parent_planning_slug?`); the strict-schema discipline is no longer load-bearing. |
| `parameter-vs-variable` | **Delete or shrink.** | The parameter-vs-variable confusion was specific to the `saved_session_token` workflow-variable vs `session_token` MCP-parameter case. With `session_index` as the canonical name on both sides, the discipline is no longer needed. If retained, shrink to a one-line generic note. |

**Net effect on `00-workflow-engine.toon`:** approximately **35-40% of the file by line count** is removed (~140-180 lines of redundant prose), and the remaining content is rewritten with `session_index` semantics. The 50 `session_token` references drop to zero.

#### Phase 8.2: `workflows/meta/{workflow,activities/*,skills/01-agent-conduct,skills/07-harness-compat}.toon` (0.5-0.75h)

**Files and dispositions:**

| File | Hits | Disposition |
|------|------|-------------|
| `workflows/meta/workflow.toon` | 2 | **Rewrite variables.** Replace `saved_session_token` → `saved_session_index`; replace `client_session_token` → `client_session_index`; replace `pending_checkpoint_handle` with single canonical `active_checkpoint_id` (or remove if dispatch-client-workflow no longer needs it because the active checkpoint is read from `state.activeCheckpoint`). The `session_recovered` / `session_adopted` variables are **deleted** (the recovery + adoption paths are server-internal and not surfaced to the agent). |
| `workflows/meta/activities/00-discover-session.toon` | 2 | **Rewrite.** `saved_session_token` variable + matching prose become `saved_session_index` (or directly `planning_slug` if the matched slug is what's threaded). The `record-match` step description is rewritten accordingly. |
| `workflows/meta/activities/01-initialize-session.toon` | 5 | **Heavy rewrite.** `adopt-session` operation reference is **deleted** (operation no longer exists). The `adopt-saved-session`, `create-fresh-session`, `detect-recovery`, `restore-state`, and `initialize-state` steps collapse into two: `start-or-resume-session` (single `start_session(planning_slug, agent_id, parent_planning_slug?)` call) and `derive-planning-folder` (unchanged). The `context_to_preserve` block drops `session_recovered`, `session_adopted`. |
| `workflows/meta/activities/03-dispatch-client-workflow.toon` | 7 | **Rewrite.** Step `compose-orchestrator-prompt` template substitution `session_token: {client_session_token}` → `session_index: {client_session_index}` (or `planning_slug`). The `respond-checkpoint` step's `actions[0]` block (the `set client_session_token = {resumed_session_token}` action) is **deleted** — the index doesn't change across checkpoint resolution. The `continue-orchestrator` step's prompt no longer mentions `bcp` or "use this resumed session_token". |
| `workflows/meta/activities/04-end-workflow.toon` | 1 | **Rewrite.** Drop the `workflow-engine::persist` operation from `operations[]` (operation no longer exists). Drop the `final-persist` step entirely — the server persists on every authenticated call, so a separate final-persist step is redundant. The outcome "Final state persisted to workflow-state.toon" is **rewritten** to "Final state persisted to `session.json` by the server". |
| `workflows/meta/skills/01-agent-conduct.toon` | 1 | **Rewrite.** The rule "Do NOT read workflow resource files directly from disk — load them via `get_resource({ session_token, resource_id })`" → replace `session_token` with `session_index`. No other change. |
| `workflows/meta/skills/07-harness-compat.toon` | 5 | **Rewrite.** The `spawn-agent::rules.token-in-prompt` rule prose ("When the spawned agent inherits a workflow session, ALWAYS include the session_token in the prompt") becomes "include the session_index in the prompt". The `continue-agent` operation's `session_token` input → `session_index`; same in its rule. |

#### Phase 8.3: `workflows/meta/resources/*.md` and `workflows/meta/README.md` (0.5-0.75h)

**Files and dispositions:**

| File | Hits | Disposition |
|------|------|-------------|
| `workflows/meta/resources/00-bootstrap-protocol.md` | 2 | **Rewrite.** "Save the returned `session_token`" → "Save the returned `session_index`". `get_workflow({ session_token })` → `get_workflow({ session_index })`. The bootstrap call shape uses `start_session(workflow_id: "meta", agent_id: "orchestrator")`. |
| `workflows/meta/resources/01-activity-worker-prompt.md` | Multiple | **Rewrite.** The `{session_token}` placeholder in the prompt template body becomes `{session_index}`. The `get_activity({ session_token })` and `get_resource({ session_token, resource_id })` calls in the body become `{ session_index, ... }`. The "Session token:" header field becomes "Session index:". |
| `workflows/meta/resources/02-workflow-orchestrator-prompt.md` | Multiple | **Heavy rewrite.** Same placeholder swap. The strict-schema "Call MCP tool `start_session` with EXACTLY these named parameters: `session_token` = ... bind to the canonical `session_token` parameter — do NOT invent a `saved_session_token` parameter, schema is strict and unknown keys are rejected" entire paragraph is **deleted**. The `recovered: true` / `adopted: true` branch handling prose is **deleted** (server resolves it). The resume detection step ("Call `get_workflow_status({ session_token })`") becomes `({ session_index })`. |
| `workflows/meta/README.md` | Multiple | **Rewrite.** Activity 01 description "Create a fresh child session via `start_session(parent_session_token)` or adopt the saved client session" → "Create a fresh or resume an existing session via `start_session(planning_slug, agent_id, parent_planning_slug?)`". Variables table: rename `saved_session_token` → `saved_session_index`, `client_session_token` → `client_session_index`; remove `pending_checkpoint_handle` row. Mermaid diagram labels updated. Sequence-diagram step "01 initialize-session<br/>(start_session(parent_session_token))" rewritten. The `skills/README.md` stale references to `02-state-management.toon` and `save_state`/`restore_state` MCP tools are corrected (S10 — these files/tools do not exist in the current codebase). |
| `workflows/meta/activities/README.md`, `workflows/meta/skills/README.md`, `workflows/meta/resources/README.md` | Various | **Rewrite.** Same renames; remove dead skill references; drop the `Workflow State Format` resource entry from any table (or rewrite to point at `schemas/session-file.schema.json`). |

**Depends on:** Phase 5 (`start_session` shape) for the new parameter contract. Phase 8.3 also depends on Phase 10.1 outputs to avoid duplicating effort (the meta README's diagram changes overlap with `docs/architecture.md`'s).

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

### Phase 10: Dead-code removal + documentation sweep (3-4h, was 1.5-2h)

**Goal:** Remove stale code; rewrite every `docs/` and top-level markdown
reference to `session_token`, `workflow-state.json`, or the threading
contract; verify the interceptor sunset (already executed by a prior
cleanup) is complete.

The phase is split into three sub-phases.

#### Phase 10.1: Documentation sweep (1.5-2h)

Per-file disposition (counts from `grep -cn session_token` against `main`
HEAD on 2026-05-13; full hit map in Appendix A):

| File | session_token hits | Disposition |
|------|---------------------|-------------|
| `docs/api-reference.md` | 18 | **Heavy rewrite.** Every tool signature in the table loses `session_token`. `start_session` signature row becomes `agent_id`, `planning_slug?`, `parent_planning_slug?` returning `session_index`, workflow info, and (no longer `inherited`/`adopted`/`recovered` flags — those are server-internal). All "**Token adoption on server restart**" prose is **deleted**. `get_workflow_status` row drops `session_token` from the response shape. The `_meta.session_token` field is **removed** from the example envelope (lines around 83). The "Token payload carries: `wf`, `act`, …" deep-dive paragraph (lines around 58) is **rewritten** to describe `session.json` shape with reference to `schemas/session-file.schema.json`. The bootstrap section (around line 64) becomes `start_session(agent_id)` for a fresh meta session, returning `session_index`. |
| `docs/architecture.md` | 1 | **Rewrite.** The Level-0/1/2 agent-model paragraph mentioning "how they share session state (via `start_session` with `parent_session_token`)" is rewritten to "(via `start_session` with `parent_planning_slug`)". |
| `docs/checkpoint_model.md` | 3 | **Rewrite.** All `yield_checkpoint({ session_token, ... })`, `present_checkpoint` (accepts `checkpoint_handle` or `session_token`), and `resume_checkpoint({ session_token: "<checkpoint_handle>" })` examples are rewritten to use `session_index`. The dual-acceptance prose ("Accepts either `checkpoint_handle` (preferred) or `session_token` — both are the same opaque token string") is **deleted** per PD-11. |
| `docs/development.md` | 2 | **Rewrite.** `get_skill { session_token, step_id }` examples → `{ session_index, step_id }`. |
| `docs/dispatch_model.md` | 6 | **Heavy rewrite.** All `parent_session_token` mentions become `parent_planning_slug`. The example `start_session({ parent_session_token: "<meta_token>", ... })` snippet is rewritten with the new shape. The "session_token" passing pattern in the orchestrator → worker handoff prose is rewritten to "session_index passing". |
| `docs/resource_resolution_model.md` | 1 | **Rewrite.** `get_resource({ session_token, resource_id: "meta/activity-worker-prompt" })` → `get_resource({ session_index, resource_id: ... })`. The `CORE_ORCHESTRATOR_OPS` table entry "`workflow-engine::commit-and-persist`, `persist`" → drop `persist` (operation removed in Phase 8.1). |
| `docs/state_management_model.md` | 1 | **Heavy rewrite or wholesale replacement.** The "State persistence is agent-managed" paragraph is **deleted**; the entire model becomes "State persistence is server-managed. The server writes `session.json` and `.session-token` (seal) atomically on every authenticated tool call." Adoption/recovery paragraph removed. If the doc as written is mostly about the old model, consider **replacing** the body wholesale with a short pointer to the new design in Phase 3 + Phase 4 of the implementation (and `schemas/session-file.schema.json`). |
| `docs/workflow-fidelity.md` | 1 | **Rewrite.** "State persistence is agent-managed. The orchestrator writes the session token (opaque, HMAC-signed) and its variable state to disk using its own file tools…" entire paragraph is **rewritten** to describe server-owned `session.json`. The "If the server has restarted… adopted… recovered…" prose is **deleted**. |
| `docs/ide-setup.md` | 0 | **Manual verification only.** No `session_token` references; verify it does not mention the interceptor or token-threading bootstrap. |
| `docs/artifact_management_model.md`, `docs/orchestra-specification.md` | 0 | **No change.** Verify zero hits remain. |
| `schemas/README.md` | 4 | **Rewrite.** Each `"params": "session_token, ..."` entry in the API specs is rewritten to `"params": "session_index, ..."`. Add a new `session-file.schema.json` schema documentation entry (per Phase 3 deliverable). |
| `README.md`, `SETUP.md`, `CLAUDE.md`, `AGENTS.md` | 0 | **Manual verification only.** No `session_token` references; verify on completion. |

#### Phase 10.2: Dead-code removal (1-1.5h)

- `src/utils/crypto.ts` — remove `encryptToken`, `decryptToken` (DR7, Q5).
- `src/schema/state.schema.ts` — remove `StateSaveFileSchema` and
  `StateSaveFile` type (Q6, DR8).
- `src/utils/session.ts` — file shrinks to `assertCheckpointsResolved` and
  any other still-live helpers (or is deleted entirely; the
  active-checkpoint helper moves into `session-store.ts`).
- PR #113 architecture additions identified in the codebase-comprehension
  artifact are reverted/removed in line with the new model.

#### Phase 10.3: Interceptor sunset audit (0.5h)

The interceptor (`docs/interceptor-recipe.md`) was scoped to compensate for
the brittleness of the `session_token` threading contract — it transparently
injected the token into every authenticated MCP call so the agent didn't
have to thread it manually. With server-managed state, the threading contract
is replaced by `session_index` passing, which the agent surfaces explicitly
on every call. The interceptor is no longer needed.

**Audit findings (S1):** The `docs/interceptor-recipe.md` file is **already
absent** from `main` HEAD (verified by `find . -name "interceptor-recipe*"`
returning no matches and `grep -ln "interceptor" docs/*.md README.md SETUP.md
CLAUDE.md` returning no matches). The sunset is documentation-only — there
is no file to delete.

**Deliverables:**

- Verify `find /home/mike1/projects/main/workflow-server -name
  "interceptor-recipe*"` returns no results before the PR opens.
- Verify the tool descriptions surfaced via `discover` / `get_resource`
  do not mention "interceptor" or "Managed automatically by the MCP-host
  harness interceptor when installed". (These prose snippets appear in
  the JSONSchema descriptions returned by `ToolSearch` today; they live
  in `src/tools/*.ts` and need to be regenerated as part of Phase 4 once
  the `sessionIndexParam` lands.)
- Verify the meta-workflow resources (`workflows/meta/resources/`) do not
  reference the interceptor — already handled by Phase 8.3.
- If any residual mentions appear during the sweep, append them to the
  Appendix A disposition log with status "removed during sweep".

**Depends on:** All preceding phases (10.1 follows 8.3 to avoid duplicating
diagram/example updates).

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
- [ ] **SC-11** — Documentation reflects new model (Phase 10.1 grep gates: PR116-TC-49, TC-61, TC-62, TC-63, TC-64, TC-65).
- [ ] **SC-12** — `withAuditLog` re-resolution correct (Phase 7 test).
- [ ] **SC-13** — Dead-code removal clean (Phase 10.2 grep + Phase 8 operation-removal gate: PR116-TC-67, TC-68).
- [ ] **SC-14** — `npm run typecheck && npm test` passes.
- [ ] **SC-15 (new, sweep)** — Phase 8 TOON cleanup: meta-workflow operations `adopt-session`, `restore`, `persist` are deleted; rules `token-passes-on-each-call`, `use-most-recent-token`, `token-is-opaque`, `staleness-recovery-only-via-start-session`, `start-session-strict-params` are deleted; variables `saved_session_token`, `client_session_token`, `pending_checkpoint_handle`, `session_recovered`, `session_adopted` are renamed/dropped (PR116-TC-66, TC-67, TC-68, TC-69, TC-70).
- [ ] **SC-16 (new, migration)** — Migration converter handles all three legacy variants: 3-field envelope + sibling token, embedded sessionToken field (older pre-split), and orphan `.session-token` (PR116-TC-51, TC-52, TC-53, TC-57, TC-58).
- [ ] **SC-17 (new, back-compat)** — Mid-migration agents passing the legacy `session_token` parameter receive a clear actionable error (PR116-TC-60).
- [ ] **SC-18 (new, interceptor sunset)** — `docs/interceptor-recipe.md` absent and zero references to "interceptor" in surfaced documentation or tool descriptions (PR116-TC-64, TC-65, S1).

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

---

## Appendix A — Grep-hit map and dispositions

This appendix enumerates every file in `workflows/` and `docs/` (plus
top-level markdown) that contains `session_token`, `workflow-state.json`,
`.session-token`, or related obsolete prose. Each row records the
disposition decided by the plan revision sweep. Hit counts are from
`grep -cn` against `main` HEAD on 2026-05-13.

### A.1 `workflows/meta/` — TOON files (Phase 8)

| File | session_token hits | workflow-state hits | Disposition | Phase |
|------|---------------------|--------------------|-------------|-------|
| `workflows/meta/skills/00-workflow-engine.toon` | 50 | several | **Heavy rewrite + delete `adopt-session`, `restore`, `persist` operations; delete rules `token-passes-on-each-call`, `use-most-recent-token`, `token-is-opaque`, `staleness-recovery-only-via-start-session`, `start-session-strict-params`, `parameter-vs-variable`; per-operation table in Phase 8.1.** | 8.1 |
| `workflows/meta/skills/01-agent-conduct.toon` | 1 | 0 | **Rewrite.** Single `get_resource` rule. | 8.2 |
| `workflows/meta/skills/07-harness-compat.toon` | 5 | 0 | **Rewrite.** `token-in-prompt` rule + `continue-agent` input rename. | 8.2 |
| `workflows/meta/skills/README.md` | several | 0 | **Rewrite.** Stale `02-state-management.toon` and `save_state`/`restore_state` references corrected (S10). | 8.3 |
| `workflows/meta/workflow.toon` | 2 | 0 | **Rewrite variables.** `saved_session_token`, `client_session_token`, `pending_checkpoint_handle` → `_index` equivalents or dropped. | 8.2 |
| `workflows/meta/activities/00-discover-session.toon` | 2 | 0 | **Rewrite.** `saved_session_token` variable + record-match step. | 8.2 |
| `workflows/meta/activities/01-initialize-session.toon` | 5 | 1 | **Heavy rewrite.** Collapses 6 steps to 2; drops `adopt-session`, `restore`, `persist` operation references. | 8.2 |
| `workflows/meta/activities/03-dispatch-client-workflow.toon` | 7 | 0 | **Rewrite.** Drops the post-respond `set client_session_token` action; rewrites continue-orchestrator prompt. | 8.2 |
| `workflows/meta/activities/04-end-workflow.toon` | 1 | 1 | **Rewrite.** Drops `persist` operation + `final-persist` step. | 8.2 |
| `workflows/meta/activities/README.md` | several | several | **Rewrite.** Activity descriptions and persist references. | 8.3 |
| `workflows/meta/resources/00-bootstrap-protocol.md` | 2 | 0 | **Rewrite.** Bootstrap snippet. | 8.3 |
| `workflows/meta/resources/01-activity-worker-prompt.md` | several | 0 | **Rewrite.** `{session_token}` placeholder → `{session_index}`. | 8.3 |
| `workflows/meta/resources/02-workflow-orchestrator-prompt.md` | several | 0 | **Heavy rewrite.** Strict-schema + recovery prose deleted. | 8.3 |
| `workflows/meta/resources/README.md` | several | 0 | **Rewrite.** Drop `Workflow State Format` entry. | 8.3 |
| `workflows/meta/README.md` | several | several | **Rewrite.** Activity descriptions, variables table, Mermaid diagrams, sequence-diagram step labels (S10). | 8.3 |

### A.2 `workflows/` — non-meta hits

| File | Disposition | Notes |
|------|-------------|-------|
| `workflows/README.md` | **Spot-rewrite.** | If the file describes the session contract; otherwise no-op. |
| `workflows/work-package/README.md` | **Verify no relevant hits.** | The `session` matches are on the word "session" in unrelated contexts; the `persist` match is on `persistent-artifacts`. |
| `workflows/work-package/skills/22-build-comprehension.toon` | **No change (S6).** | `persistent_failure`, `persistent-artifacts` false positives. |
| `workflows/work-package/skills/16-validate-build.toon` | **No change (S6).** | `persistent_failure` false positive. |
| `workflows/work-package/activities/01-start-work-package.toon` | **No change (S6).** | `restore issue_platform` false positive. |
| `workflows/work-package/activities/14-codebase-comprehension.toon` | **No change (S6).** | `persistent` false positive. |
| `workflows/work-package/skills/README.md` | **No change (S6).** | `persistent knowledge artifacts` false positive. |
| `workflows/workflow-design/workflow.toon`, `workflows/workflow-design/skills/00-workflow-design.toon`, `workflows/workflow-design/skills/README.md`, `workflows/workflow-design/resources/02-anti-patterns.md`, `workflows/workflow-design/README.md` | **Out of scope for #115 (S5).** | The `workflow-design` workflow describes the design DSL for designing workflows. The references to `session_token` in those files describe the wire-shape of MCP calls in the abstract; updating them is downstream of #115 (a separate concern about the design template). Track under follow-up issue. |
| `workflows/prism/**`, `workflows/prism-audit/**`, `workflows/prism-evaluate/**`, `workflows/prism-update/**` | **Out of scope (S5).** | Hits in prism workflows are unrelated to runtime session tokens (e.g., `state-audit.md`, `fix-cascade.md`); they describe persistence patterns at the application-domain layer. |
| `workflows/cicd-pipeline-security-audit/**`, `workflows/substrate-node-security-audit/**`, `workflows/remediate-vuln/**` | **Out of scope (S5).** | Hits on `persist`, `restore` in audit-workflow domain prose are false positives. |

### A.3 `docs/` and top-level markdown (Phase 10.1)

| File | session_token hits | Disposition | Phase |
|------|---------------------|-------------|-------|
| `docs/api-reference.md` | 18 | **Heavy rewrite.** Every tool signature in the table loses `session_token`; `start_session` row entirely rewritten; token-payload deep-dive paragraph replaced with `session.json` description. | 10.1 |
| `docs/architecture.md` | 1 | **Rewrite.** `parent_session_token` → `parent_planning_slug`. | 10.1 |
| `docs/checkpoint_model.md` | 3 | **Rewrite.** Tool examples; dual-acceptance prose deleted. | 10.1 |
| `docs/development.md` | 2 | **Rewrite.** `get_skill` examples. | 10.1 |
| `docs/dispatch_model.md` | 6 | **Heavy rewrite.** Parent dispatch snippet, orchestrator → worker handoff prose. | 10.1 |
| `docs/resource_resolution_model.md` | 1 | **Rewrite.** `get_resource` example + drop `persist` from `CORE_ORCHESTRATOR_OPS`. | 10.1 |
| `docs/state_management_model.md` | 1 | **Wholesale replacement.** "Agent-managed" entire paragraph replaced with server-managed model + pointer to `schemas/session-file.schema.json`. | 10.1 |
| `docs/workflow-fidelity.md` | 1 | **Heavy rewrite.** "Agent-managed" paragraph removed; adoption/recovery prose deleted. | 10.1 |
| `docs/ide-setup.md` | 0 | **Manual verify only.** | 10.1 |
| `docs/artifact_management_model.md` | 0 | **No change.** | n/a |
| `docs/orchestra-specification.md` | 0 | **No change.** | n/a |
| `schemas/README.md` | 4 | **Rewrite.** Tool params table; add `session-file.schema.json` entry. | 10.1 |
| `README.md` | 0 | **Manual verify only.** | 10.1 |
| `SETUP.md` | 0 | **Manual verify only.** | 10.1 |
| `CLAUDE.md` | 0 | **Manual verify only.** Project rules — update the `gitnexus` and project-instructions section only if examples reference `session_token`. | 10.1 |
| `AGENTS.md` | 0 | **Manual verify only.** | 10.1 |

### A.4 Interceptor sunset (Phase 10.3)

| Item | Status | Disposition |
|------|--------|-------------|
| `docs/interceptor-recipe.md` | **Already absent** in `main` HEAD | **No-op.** Verify absence at PR open. |
| `grep -ln "interceptor" docs/*.md README.md SETUP.md CLAUDE.md` | **Zero matches** | **Confirm at PR open.** |
| Tool description prose ("Managed automatically by the MCP-host harness interceptor when installed") in JSONSchema descriptions returned by `discover`/`get_resource` | **Lives in `src/tools/*.ts`** | **Rewrite during Phase 4.** When `sessionIndexParam` is introduced, regenerate the descriptions to drop the interceptor reference. |

### A.5 Disposition rollup

| Bucket | Count | Notes |
|--------|-------|-------|
| **Files in scope, heavy rewrite** | 6 | `00-workflow-engine.toon`, `01-initialize-session.toon`, `03-dispatch-client-workflow.toon`, `02-workflow-orchestrator-prompt.md`, `meta/README.md`, `api-reference.md` |
| **Files in scope, ordinary rewrite** | 16 | The remainder of the `workflows/meta/` and `docs/` rows above |
| **Files in scope, manual verify only** | 7 | `ide-setup.md`, `artifact_management_model.md`, `orchestra-specification.md`, `README.md`, `SETUP.md`, `CLAUDE.md`, `AGENTS.md` |
| **Files out of scope (S5, S6)** | 11 | `workflow-design/`, `prism*/`, `cicd-pipeline-security-audit/`, `substrate-node-security-audit/`, `work-package/` non-meta false positives |
| **Files deleted** | 0 | None — `interceptor-recipe.md` already absent (S1). The `adopt-session`, `restore`, `persist` operations are deleted from a file, not whole files. |

**Total in-scope file edits: 29.** Phase 8 covers 13 (the `workflows/meta/`
subtree). Phase 10 covers 16 (`docs/`, `schemas/README.md`, top-level
markdown). The blast radius is concentrated in `workflows/meta/skills/00-workflow-engine.toon` (50 hits) and `docs/api-reference.md` (18 hits); these two files alone account for ~70% of the redundant prose.
