# Design Philosophy — Session Token Size Optimization

**Work Package:** session-token-size-optimization
**Date:** 2026-05-13
**Branch:** `enhancement/session-token-size-optimization`

---

## Problem Statement

The MCP session token is the single piece of state that every workflow tool call carries on the wire. Today it is a base64url-encoded JSON `SessionPayload` plus a 64-character hex HMAC-SHA-256 signature — roughly 480 bytes per call. The payload embeds the full conversation state directly: workflow id, activity id, skill name, condition string, sequence counter, timestamps, parent-session pointers, and identifiers. Because every server-bound tool call must echo the token verbatim, the cost compounds across the lifetime of a session.

Two concrete pain points motivate this work package:

1. **Transcription drift.** The PR #1466 incident showed an agent emit a token whose `psid` field had two extra hex characters inserted mid-string. HMAC verification rejected the call and the session could not recover. Long, opaque base64url strings are easy for an LLM to corrupt during reproduction; shorter wire strings reduce that surface.
2. **State authority is muddled.** The wire token *is* the state. There is no independent server record to compare it against, so the server cannot distinguish a legitimately advancing session from one whose state has drifted relative to the agent's view. Tampering, transcription corruption, and concurrent advance all collapse into the same opaque HMAC failure mode.

### System Understanding

The fields that grow with workflow depth (`wf`, `act`, `skill`, `cond`, `aid`, `pwf`, `pact`, `psid`, `pv`) are the dominant size contributors; the fields that genuinely *must* travel on the wire to identify a session (`sid`, `seq`, `ts`) are small and fixed-width. Two fields — `skill` and `cond` — are dead per the post-tier-A audit: nothing in the engine branches on them at request time.

### Success Criteria

- Wire token shrinks from ~480 bytes to ~115–140 bytes (≥70 % reduction).
- The server has an authoritative `SessionRecord` keyed by `sid`; the wire token carries only the fingerprint needed to bind itself to that record.
- The server can distinguish four failure classes that today all surface as "HMAC failure": (a) key rotation, (b) state drift, (c) missing state, (d) concurrent advance.
- Legacy JSON-format tokens migrate cleanly on first contact.
- No regression in the 308 tests that pass on the feature branch as of phase 2.

### Constraints

- Must not change the `start_session` / advance / yield / resume / respond MCP contract.
- Must work in-place inside the existing `src/utils/session.ts` lifecycle; no engine rewrite.
- Wire encoding must be implementable without adding a runtime dependency (CBOR encoder/decoder for a fixed 5-field map fits in ~80 lines).

---

## Problem Classification

**Category:** Enhancement / Reliability
**Specific problem, known cause, moderate complexity.**

The problem (token bloat, transcription fragility, no state authority) and its cause (state lives on the wire in a verbose encoding) are both well-understood. The fix space was deliberately enumerated as three tiers; this work implements the third. The pre-resolved orchestrator context records `problem_type=specific-problem-cause-known` for this reason.

---

## Design Rationale

### Principle: Server-side State, Wire-side Attestation

State moves server-side into a new `SessionStore` so the wire can shrink to a fingerprint. The wire keeps just enough — `sid` to look up the record, `seq` and `ts` for debuggability and replay resistance, an optional `bcp` for the checkpoint flow, and `sh` (a 128-bit truncated SHA-256 over the canonical record concatenated with `seq`) to bind the wire to the server's view of state. Defense against drift is by hash equality, not by trusting the agent.

### Principle: HMAC Is Unforgeability; `sh` Is Drift Detection

The two cryptographic primitives in play do different jobs. HMAC over the wire payload guarantees that the wire token was produced by this server (or a server holding the same key). `sh` guarantees that the agent's view of state matches the server's record *for this specific session at this specific seq*. Mixing the two roles is what made the legacy "HMAC verifies, state is fine" / "HMAC fails, restart" binary too coarse. Splitting them gives the catalogue below.

128 bits is sufficient for accidental-drift collision resistance; the unforgeability boundary is HMAC, not `sh`. Truncating SHA-256 from 32 B to 16 B halves the on-wire cost of attestation.

### Principle: CBOR Over MessagePack or Handcrafted Binary

CBOR (RFC 8949) is the IETF standard, has a well-defined canonical form for deterministic encoding, and a fixed 5-field map with integer keys encodes in ~80 lines of hand-written code. No runtime dependency, no schema-evolution gymnastics. Integer keys (`1=sid`, `2=seq`, `3=ts`, `4=bcp`, `5=sh`) are shorter than string keys and stable across encoders. Base64url over the signed CBOR plus base64url HMAC keeps the whole thing URL-safe and copyable.

### Principle: Drop Dead Fields, Keep Auditable Fields

`skill` and `cond` are dropped entirely (no engine branch reads them at request time). `seq` is kept on the wire even though the legacy `cond`-vs-`seq` branching is gone, because including it in the `sh` input gives every advance a unique fingerprint that is debuggable in logs and resistant to replay. `ts` similarly stays — it costs almost nothing in CBOR and is invaluable for staleness diagnosis.

### Principle: Recoverable Failure Modes, Catalogued

The new error catalogue makes each failure mode explicit and gives each its own recovery path:

| HMAC | State | `sh` | Outcome |
|------|-------|------|---------|
| pass | present | match | Normal advance. |
| pass | present | mismatch | Reject — concurrent advance or external mutation. |
| pass | missing | — | Reject — planning folder moved/deleted; restart required. |
| fail | present | match | **Adopt** — re-sign with current key, preserve `sid`/`seq`/`ts`/`bcp`. (Server-key rotation recovery.) |
| fail | present | mismatch | Reject — state drift; restart required. |
| fail | missing | — | Reject — restart required. |
| legacy JSON token detected | — | — | One-shot migrate: create SessionRecord, re-issue CBOR wire token. |

Adopt-on-key-rotation is the only path that recovers a wire token across a server-key change. It is safe specifically because `sh` matches: the agent's view and the server's record agree on what the session is, only the signing key has changed.

### Principle: Planning-folder-bound Storage with Global Fallback

`SessionRecord` is written to `<planning_folder>/.workflow/session.json` when the planning folder is known (via a new `bind_session_path` MCP tool that the work-package workflow calls after `target_path` is resolved), with a global fallback at `~/.workflow-server/sessions/<sid>.json` and a `sid → path` index at `~/.workflow-server/sessions/<sid>.path`. This keeps a session's authoritative state co-located with the work it describes (so deleting the planning folder cleanly invalidates the session), while still giving the server a fallback location for sessions that have not yet bound a path.

---

## Complexity Assessment

**Moderate.** The change touches the session token's core lifecycle and adds one new MCP tool, but it does not change the workflow-engine contract or the surface area of any other tool. The bulk of the work is contained within `src/utils/session.ts`, a new `src/utils/session-store.ts`, a new `src/utils/wire-token.ts`, a new `src/utils/state-hash.ts`, the `bind_session_path` registration site, and text-only updates in the meta-skill of the workflows submodule.

Phases 1 and 2 are committed and demonstrate that the call-site sweep converges — 308 tests pass on the feature branch. The remaining work (phases 3–6 plus an E2E test) follows the same shape and risk profile as the work already landed.

### Risk Concentration

The single highest-risk surface is `start_session` because it now has three sub-flows — fresh, worker-dispatch, adoption / legacy migration — and the legacy migration path runs exactly once per pre-existing session in the wild. Phase 3 isolates this in `adoptStaleToken` and `migrateLegacyToken` helpers with their own test file (`tests/staleness.test.ts`) precisely so the logic stays inspectable.

### Stakeholder Assumptions

None pending — the design is concrete and the orchestrator context confirms no requirements-elicitation, research, or implementation-analysis is needed.

---

## Workflow Path

**Skip optional activities path with comprehension also skipped.** Per orchestrator pre-resolution: `skip_optional_activities=true`, `needs_comprehension=false`. The codebase has already been comprehended (phase 2's call-site sweep is empirical evidence) and the plan is concrete enough to enter `plan-prepare` directly.

Activities expected to run after this one:

- `plan-prepare` — formalize phases 3–6 + E2E test as a work-package plan and test plan.
- implementation activities — phases 3, 4, 5, 6 + E2E test.
- review activities — code review, test review, strategic review, validation.
- `submit-for-review` — PR creation (PR is not skipped).

Activities skipped: requirements-elicitation, research, implementation-analysis, codebase-comprehension. Issue creation is also skipped (`issue_skipped=true`); the work package is self-targeting.
