# Session Token Size Optimization — Implementation Plan

**Date:** 2026-05-13
**Priority:** MEDIUM
**Status:** Ready
**Estimated Effort:** 3-5h agentic + 1-2h human review

---

## Overview

### Problem Statement

The MCP session token currently carries the entire conversation state on the wire as base64url-encoded JSON plus a 64-character hex HMAC — ~480 bytes per call. Every server-bound tool call must echo it back verbatim, so the cost compounds across the lifetime of a session. The string is long enough that LLMs occasionally corrupt it during reproduction (the PR #1466 transcription drift incident is the canonical example), and because the wire token *is* the state there is no independent server record to disambiguate "HMAC failed because the key rotated" from "HMAC failed because state drifted" from "HMAC failed because the token was corrupted."

### Scope

**In Scope:**

- Replace JSON+hex wire encoding with CBOR + base64url HMAC envelope (5-field fixed schema).
- Move authoritative state into a server-managed `SessionStore` keyed by `sid`, persisted at `<planning_folder>/.workflow/session.json` (with global fallback at `~/.workflow-server/sessions/<sid>.json`).
- Add a 128-bit truncated SHA-256 `sh` field on the wire that binds the wire token to the server's record for that `seq`.
- Catalogue the resulting error surface (HMAC × state × `sh` table) and route each failure to its own recovery path.
- Add a `bind_session_path` MCP tool that relocates a session's `SessionRecord` into the planning folder once `target_path` is known.
- One-shot migrate legacy JSON-format tokens still in the wild on first contact.
- Update the meta workflow (`workflows` submodule) to reflect the new error catalogue and to call `bind_session_path` from the work-package setup.
- Add a dedicated E2E test workflow that exercises every changed code path end-to-end.

**Out of Scope:**

- Changes to the MCP tool surface beyond adding `bind_session_path`. The `start_session` / advance / yield / resume / respond contracts stay byte-for-byte the same.
- Engine, transition, or resolver rewrites. The work is confined to the session-token lifecycle and its immediate call sites.
- A parallel-format compatibility window for legacy tokens. The migration is one-shot; sessions in the wild are short-lived in practice.
- Cryptographic key rotation policy beyond making adoption safe; the rotation mechanism itself is unchanged.

---

## Research & Analysis

*See companion planning artifacts for full details:*

- **Design philosophy:** [01-design-philosophy.md](01-design-philosophy.md) — problem framing, design rationale, complexity assessment.
- **Assumptions log:** [01-assumptions-log.md](01-assumptions-log.md) — A1–A10, all Confirmed or Accepted.

### Key Findings Summary

**From the design philosophy:**

- Wire growth is driven by the fields that scale with workflow depth (`wf`, `act`, `skill`, `cond`, `aid`, `pwf`, `pact`, `psid`, `pv`); the fields that genuinely must travel (`sid`, `seq`, `ts`) are small and fixed-width.
- `skill` and `cond` are dead — no engine branch reads them at request time. Phase 2's call-site sweep confirms this empirically (308 tests pass with the fields dropped from the wire payload).
- HMAC and `sh` do different jobs: HMAC is unforgeability of the envelope, `sh` is drift detection between agent view and server record. Splitting the two roles is what unlocks the failure-class catalogue.

**From phases 1 and 2 (already landed):**

- **Baseline:** ~480-byte wire token, JSON-payload state, single HMAC failure mode.
- **Phase 1 commit `1cd7d56`:** Added `src/utils/wire-token.ts`, `src/utils/state-hash.ts`, `src/utils/session-store.ts` with 53 unit tests. No behavior change.
- **Phase 2 commit `f7a4cd8`:** Rewrote `src/utils/session.ts` around the new modules; swept ~60 call sites; dropped `cond` from `advanceToken`; 308 tests pass.

---

## Proposed Approach

### Solution Design

**Server-side state, wire-side attestation.** State moves into `SessionStore`. The wire shrinks to a fingerprint: `sid` to look up the record, `seq` and `ts` for debuggability and replay resistance, an optional `bcp` for the checkpoint flow, and `sh` to bind the wire to the server's view. The wire encoding is CBOR with integer keys (`1=sid`, `2=seq`, `3=ts`, `4=bcp`, `5=sh`), base64url-encoded, with a base64url HMAC tag joined by `.`. Defense against drift is by hash equality on `sh`, not by trusting the agent.

The work splits into seven phases. Phases 1 and 2 are committed on `enhancement/session-token-size-optimization`. The plan below covers phases 3 through 6 plus a dedicated E2E test, plus the meta-skill update on the `workflows` submodule branch `enhancement/session-token-size-optimization-meta`.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Tier C — CBOR + server-side `SessionRecord` + 128-bit `sh` | Solves all three pain points (size, transcription fragility, failure-class coverage); no MCP-contract change | Largest blast radius; requires new module + migration path | **Selected** |
| Tier B — JSON-only diet (drop dead fields, trim casing) | Smaller diff | Does not address state-authority pain point; only ~30 % size reduction | Rejected |
| Tier A — field trim only | Trivial | Does not improve failure-class coverage; size reduction marginal | Rejected |
| MessagePack instead of CBOR | Slightly smaller | No canonical-form RFC; ecosystem split | Rejected |
| Handcrafted binary | Smallest | Custom encoder is bespoke and not auditable against a standard | Rejected |
| 256-bit `sh` | Slightly more collision resistance | Doubles attestation byte cost for no real safety gain (unforgeability is HMAC's job) | Rejected — truncate to 128 bits |
| Keep `skill` and `cond` on the wire | Backward-compatible | Dead fields; engine doesn't branch on them at request time | Rejected — drop |
| Parallel-format support window for legacy tokens | Gradual migration | Two parsers maintained indefinitely; sessions are short-lived anyway | Rejected — one-shot migrate |

---

## Implementation Tasks

Tasks are ordered by dependency. Each task is independently committable; verification (`npm run typecheck`, `npm test`) runs automatically via the implement activity's task-cycle after each task and is not duplicated here.

### Task 1: start_session adoption and legacy JSON migration (30-45 min)

**Goal:** Give the resume path three sub-flows — fresh, adopt-stale-token, migrate-legacy — and keep the worker-dispatch path intact.

**Depends on:** Phase 2 (committed).

**Deliverables:**

- `src/utils/session.ts` — add `adoptStaleToken(token, store?) → Promise<string>` that decodes wire-without-verify, looks up the `SessionRecord` by `sid`, compares `computeStateHash(record, seq)` against the wire `sh`, and on match re-signs with the current key while preserving `seq`/`ts`/`bcp`/`sh`. On mismatch or missing record, throw with a clear recovery message.
- `src/utils/session.ts` — add `decodeLegacyJsonToken(token) → LegacyTokenPayload | null` for the old JSON payload format.
- `src/utils/session.ts` — add `migrateLegacyToken(token, store?) → Promise<{ wireToken: string; view: SessionView }>` that decodes the legacy JSON, builds a `SessionRecord` (drops `skill`/`cond`), creates a `SessionStore` entry, and issues a new CBOR wire token. Preserve parent context and `bcp` on migration. Migration is idempotent (re-running on an already-migrated `sid` is a no-op).
- `src/tools/resource-tools.ts` — rewrite the `start_session` handler with three sub-flows: (a) fresh session creation, (b) worker dispatch via `parent_session_token`, (c) resume path that tries `loadSession` first, falls through to `adoptStaleToken` on HMAC failure, falls through to `migrateLegacyToken` on CBOR-decode failure, and falls through to fresh-session creation for terminally bad input.
- `tests/staleness.test.ts` — new test file covering: adoption happy path, `sh`-mismatch reject, missing-record reject, legacy migration round-trip, parent-context preservation across migration, `bcp` preservation across migration, migration idempotence.

### Task 2: bind_session_path MCP tool (20-30 min)

**Goal:** Let the work-package workflow relocate a session's `SessionRecord` from the global fallback into the planning folder.

**Depends on:** Task 1.

**Deliverables:**

- `src/tools/workflow-tools.ts` — add a `bind_session_path({ session_token, path })` tool. Validate that `path` is absolute and contains no `..` segments. Call `loadSession` for HMAC + `sh` verification. Call `sessionStore.relocate(sid, joinPath(path, '.workflow', 'session.json'))` to move the record (cross-FS-safe). Advance the wire token (seq+1) and return it via `_meta.session_token`. No state mutation beyond relocation.
- `tests/bind-path.test.ts` — happy path, absolute-path validation, `..`-segment rejection, idempotence on re-binding to the same path, cross-FS relocate.
- `tests/planning-folder-deleted.test.ts` — when the bound state file disappears between calls, the next tool call surfaces a clear "state file missing, restart required" error rather than an opaque HMAC failure.

### Task 3: Meta-skill updates (workflows submodule) (20-30 min)

**Goal:** Update the workflow engine's documented behavior to reflect the new error catalogue and to call `bind_session_path` at the right point in the work-package lifecycle.

**Depends on:** Task 2 (the tool must exist before the meta-skill references it).

**Branch:** `enhancement/session-token-size-optimization-meta` on the `workflows` submodule.

**Deliverables:**

- `meta/skills/00-workflow-engine.toon` — add `state-hash-mismatch-implies-restart` and `state-file-missing-implies-restart` to the staleness-recovery skill's error catalogue.
- `meta/skills/00-workflow-engine.toon` — update the `workflow-engine::persist` operation's description to note the sibling `.workflow/session.json` file (written by the server via `SessionStore`, not by the worker via `Write`).
- Whichever work-package activity establishes `planning_folder_path` (likely `start-work-package`) — add a `bind-planning-folder` step that calls `bind_session_path(session_token, planning_folder_path)` after the planning folder is created.
- Workflow-server parent commit — bump the `workflows` submodule pointer to the new branch HEAD.

### Task 4: Dead-code cleanup (15-20 min)

**Goal:** Remove the now-unused fields, types, and references that the earlier phases left in place to keep the diff focused.

**Depends on:** Task 3 (so the meta-skill stops referring to anything we are about to delete).

**Deliverables:**

- `src/utils/session.ts` — remove `SessionAdvance.skill` and `SessionAdvance.cond` from the interface; they have not been written to since phase 2.
- `src/utils/session.ts` and call sites — remove leftover references to `decodeSessionToken` and `decodePayloadOnly` (replaced by `loadSession` and `decodeWireTokenUnverified`).
- `src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts` — update tool description strings for `start_session`, `next_activity`, etc. to reflect the new error catalogue (mention the four failure classes by name).
- `AGENTS.md` and `CLAUDE.md` — refresh references to the wire-token + `SessionStore` model. Re-run `npx gitnexus analyze` if the index counts shift materially and update the count in `CLAUDE.md`.

### Task 5: Dedicated E2E test workflow (30-45 min)

**Goal:** Add a minimal end-to-end workflow fixture and an integration test that exercises every changed code path against an in-memory MCP server, so future regressions in this lifecycle are caught.

**Depends on:** Tasks 1, 2, 4 (the surface area must be stable).

**Deliverables:**

- `workflows/e2e-session-token/` — minimal workflow fixture with two or three activities and one checkpoint, designed to touch every changed code path.
- `tests/e2e-session-token.test.ts` — full lifecycle integration test that exercises the fixture against the in-memory MCP server, asserting:
  - wire-token shape (CBOR-decoded; 5 expected keys; `sh` length = 16 bytes; HMAC tag base64url-decodes to 32 bytes)
  - `SessionStore` presence in the global location pre-bind, in the planning folder post-bind, and absence after planning-folder deletion
  - `sh` verification on every advance
  - adoption recovery path triggered by simulating a server-key rotation between calls
  - legacy migration recovery path triggered by feeding the server a hand-crafted legacy JSON token
  - checkpoint flow (`yield_checkpoint` → `present_checkpoint` → `respond_checkpoint` → `resume_checkpoint`) end-to-end through the new wire format

---

## Success Criteria

*Baselines come from phase 0 (pre-work) and phase 2 (current branch HEAD).*

### Functional Requirements

- [ ] `start_session` distinguishes the four failure classes (key rotation → adopt; state drift → reject; missing state → reject; concurrent advance → reject) and surfaces a distinct recovery message for each.
- [ ] Legacy JSON-format tokens migrate cleanly on first contact, preserving parent context and `bcp`.
- [ ] `bind_session_path` relocates the `SessionRecord` from the global fallback into the planning folder; subsequent calls find it at the new location.
- [ ] The meta workflow calls `bind_session_path` after the planning folder is established.
- [ ] No regression in existing tests (308 currently passing on branch HEAD).

### Quantitative Targets

- [ ] **Wire token size:** Reduce from ~480 bytes to ≤140 bytes on a representative session (≥70 % reduction).
- [ ] **Failure-class distinction:** From 1 opaque HMAC-failure surface to 4 distinct named failure classes.
- [ ] **Test count:** Add ≥ 25 new unit and integration tests on top of phase 1's 53 and phase 2's 308 (target ≥ 333 passing post-implementation).

### Quality Requirements

- [ ] `npm run typecheck` clean on every commit.
- [ ] `npm test` green on every commit.
- [ ] No new TODOs introduced.
- [ ] The new error messages are intelligible without reading source — each surfaces the specific failure class and the recovery action.

### Measurement Strategy

- **Wire size:** measure on a synthetic 10-deep parent-stack session before-and-after (`scripts/generate-session-token.ts` already supports synthesis); record the resulting lengths in a comment on the E2E test.
- **Failure-class coverage:** `tests/staleness.test.ts` and `tests/e2e-session-token.test.ts` each cover one failure-class row of the catalogue table from the design philosophy; coverage is asserted by row.
- **Test count regression check:** `npm test` reports the total; compare before and after each phase commit.

---

## Testing Strategy

The detailed test plan with case-by-case objectives is in [05-test-plan.md](05-test-plan.md). The high-level shape:

### Unit Tests

- Adoption helper: happy path, `sh`-mismatch, missing record.
- Legacy migration helper: round-trip, parent-context preservation, `bcp` preservation, idempotence.
- `bind_session_path` tool: absolute-path validation, `..`-rejection, relocate, idempotence.

### Integration Tests

- `start_session` resume path with all three sub-flows wired together.
- Planning-folder deletion mid-session — verify the resulting error is clear, not opaque.
- Cross-filesystem relocate on `bind_session_path`.

### E2E Tests

- Full workflow lifecycle on a dedicated fixture (`workflows/e2e-session-token/`), exercising the changed paths through the public MCP surface.

---

## Dependencies & Risks

### Requires (Blockers)

- [x] Phase 1 committed (`1cd7d56`).
- [x] Phase 2 committed (`f7a4cd8`).
- [ ] `workflows` submodule branch `enhancement/session-token-size-optimization-meta` exists or is created during Task 3.

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Legacy migration drops a field that some pre-existing session relied on | MEDIUM | LOW | The migration explicitly reconstructs `SessionRecord` from documented legacy-payload fields; `tests/staleness.test.ts` covers parent-context and `bcp` preservation. The set of legacy fields is small and well-known from the phase-2 sweep. |
| `bind_session_path` race with concurrent advance | LOW | LOW | Relocate is atomic at the filesystem level (rename within FS; copy-then-fsync-then-unlink across FS). `loadSession` is called before relocate so the `sh` is verified against the source location first. |
| Meta-skill update lands ahead of the server feature | MEDIUM | LOW | Task ordering puts Task 2 (the tool) before Task 3 (the meta-skill reference). The submodule-pointer bump is the last step of Task 3. |
| Adoption path accidentally recovers a corrupted token | LOW | LOW | Adoption requires `sh` to match the server record exactly. A corrupted token whose `sh` happens to match the server record would require finding a 128-bit collision — far beyond accidental. |
| E2E fixture grows into a maintenance burden | LOW | MEDIUM | Keep the fixture minimal (two or three activities, one checkpoint). The fixture lives under `workflows/` and follows the existing TOON convention. |

---

**Status:** Ready for implementation.
