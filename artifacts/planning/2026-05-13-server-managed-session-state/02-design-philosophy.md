# 02 - Design Philosophy

**Work package:** Server-managed session state with workspace-aware MCP server
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**Date:** 2026-05-13
**Status:** Draft (pre-elicitation)

---

## 1. Problem statement

Workflow session state currently lives in two places at once:

1. **An opaque HMAC-signed token** (`SessionPayload` in `src/utils/session.ts`) threaded on every authenticated MCP call's `session_token` parameter and returned in every response's `_meta.session_token`. Encodes `wf`, `act`, `skill`, `cond`, `v`, `seq`, `ts`, `sid`, `aid`, an optional `bcp` (blocking checkpoint), and at most one parent level (`psid`, `pwf`, `pact`, `pv`).
2. **A `workflow-state.json` + sibling `.session-token` pair** in the planning folder. The agent writes both files via the harness `Write` tool, following procedures encoded in `workflows/meta/skills/00-workflow-engine.toon` (`workflow-engine::persist` and `workflow-engine::restore`).

This split has surfaced concrete frictions:

- **Token transcription drift.** The token is a long opaque base64url string. Models occasionally truncate or otherwise corrupt it when carrying it across a tool boundary, producing mid-workflow HMAC failure. The codebase has accumulated explicit recovery paths for this (`decodePayloadOnly`, the staleness re-signing branch in `start_session`, the long error strings in `decode`).
- **Schema is agent-enforced.** The shape of `workflow-state.json` is described in TOON rules (the `state-format`, `no-token-duplication`, `no-derived-fields`, `omit-empty-collections`, `variables-canonical-home` rules in the persist operation). The server cannot detect schema drift, accidental field duplication, or hand-edits.
- **Single-level parent context.** `SessionPayload` flattens the parent chain into four fields. A grandparent dispatch (A → B → C) cannot be represented. `start_session`'s `parent_session_token` branch reads exactly one ancestor.
- **Resume requires file-shaped knowledge.** The agent must know to read `.session-token` (with legacy fallback to a `sessionToken` field inside `workflow-state.json`) and pass it to `start_session` under the canonical `session_token` parameter — a known foot-gun the rules explicitly call out (`start-session-strict-params`, `parameter-vs-variable`).
- **Token is the system of record while also being the diff hotspot.** The `persist` rule documents that the token is split off into a sibling file specifically because it changes on every save and would otherwise dominate diffs. That is a workaround, not a clean separation of concerns.

## 2. Design intent

Make the MCP server **workspace-aware** and have it **own session state end-to-end**:

- The server is launched with a workspace argument (CLI flag or environment variable) and uses that workspace as the root for all per-session storage.
- For each session the server owns two files under `<workspace>/.engineering/artifacts/planning/<slug>/`:
  - `session.json` — the full session state (the union of what is in today's token and what is in today's `workflow-state.json`, plus a recursive `parentSession`).
  - `.session-token` — an HMAC over `session.json` bytes, using the server's `~/.workflow-server/secret` key, written atomically alongside every state mutation.
- The agent receives only a six-character deterministic `session_index` (`base32(HMAC(folder_path, secret_key)[0..4])`) and passes it on every authenticated tool call. The server resolves the index back to a folder by enumeration.
- The agent **may read** `session.json` via the harness `Read` tool to situate itself in the workflow, but **never writes** either file. Any write would invalidate the HMAC seal.

## 3. Design ethos

The philosophy underlying this refactor:

### 3.1 Single source of truth

Session state lives in exactly one place — the server, projected onto disk in a single canonical file. The token-as-state and file-as-state duality is collapsed. The agent reads but does not write. The seal is computed by the server alone.

### 3.2 Authority belongs with the integrity-checker

The HMAC secret is the authority. Today, the token carries state AND the secret-derived signature, so the server can verify any token presented to it. Under the new design, the server still owns the secret, but now also owns the *write path* for the artifact under verification. Authority and write capability are co-located. The workspace becomes incapable of forging a consistent `(state, seal)` pair.

### 3.3 Transcription-safe agent surface

Anything the LLM has to type back verbatim must be short enough to type reliably. Six base32 characters is the upper bound demonstrated to survive transcription across tool calls without drift. Long opaque blobs (the current token) are server-internal only.

### 3.4 Server is stateless across calls

The server holds no in-memory session registry between calls. Per-call flow is: resolve index → read files → verify seal → execute → write files → write seal. Restart is free; concurrent processes are coherent up to filesystem semantics. The only persistent server-side state is `~/.workflow-server/secret`.

### 3.5 Recursive parent chain, no flattening

Nested workflow dispatch (A → B → C → …) is first-class. `parentSession` is the same shape as the session it lives inside, recursively. No depth ceiling, no information loss at any level.

### 3.6 Boundary placed at the agent's natural seam

The agent already operates with a sense of "this folder is my planning folder". The slug — the basename of the planning folder — is the natural address. `start_session(planning_slug, agent_id)` for both fresh and resume; the server tells which case applies by checking whether files exist.

### 3.7 Tampering is detected, not prevented

The threat model is **incoherent state**, not malicious actors. The HMAC seal does not stop a user with workspace-write access from editing `session.json` — it ensures the next authenticated call fails fast with a clear error rather than proceeding on inconsistent state. Manual edits, branch checkouts that revert one file but not the other, concurrent processes racing, accidental cross-workspace file copies — all surface as a single failure mode at the next tool call.

## 4. Invariants

Properties the design must preserve, in order of importance:

| # | Invariant | Why it matters |
|---|-----------|----------------|
| I1 | The seal is verifiable only by something holding the secret. The workspace cannot forge `(session.json, .session-token)` pairs. | Defines the security boundary; everything else assumes this. |
| I2 | Every authenticated tool call verifies the seal before acting and writes a fresh seal after any state mutation. | Without this, tampering goes undetected and the seal becomes decorative. |
| I3 | `state.sessionIndex` inside `session.json` equals the `session_index` passed by the caller. | Prevents a caller from presenting one session's index against another session's files (cross-folder confusion). |
| I4 | Every state mutation is atomic: write tmp file, fsync, rename. Neither `session.json` nor `.session-token` is observed in a partially-written state by a concurrent reader. | Without atomicity the seal-check race window becomes large enough to matter. |
| I5 | The agent has read but not write access to `session.json` and `.session-token`. Filesystem mode bits enforce the directory (`0700`) and the files (`0600`). | The model agent runs as the same user as the server in current deployments, so this is advisory not enforced — but the boundary is documented. |
| I6 | `parentSession` is recursive and preserves the full ancestor chain. No information is lost at dispatch time. | Without recursion, grandparent context can only be reconstructed by the agent, defeating the purpose. |
| I7 | `session_index` derivation is deterministic over `folder_path`. Calling `start_session` twice against the same slug returns the same index. | Resume is a single call; the agent does not need to cache anything beyond knowing its planning folder. |
| I8 | The server is stateless across tool calls. No process-local registry of active sessions exists. | Restart safety; horizontal scalability; predictable failure modes. |
| I9 | Unauthenticated tools (`discover`, `list_workflows`, `health_check`) take neither token nor index. | Bootstrap path must remain accessible without prior session. |

## 5. Non-goals

What this refactor explicitly does **not** address:

- **Cross-workspace sessions.** Each server instance is workspace-scoped. A session that needs to span two workspaces is out of scope; the migration path for such cases is a separate design.
- **Server-side enforcement of checkpoint semantics.** The server validates the protocol — `bcp` set on yield, cleared on respond, signature integrity — but does not gate which `option_id` the user is allowed to pick. That stays a meta-orchestrator concern.
- **Encryption of session state at rest.** `session.json` is plain JSON; `.session-token` is plain HMAC-hex. Confidentiality of workflow variables is not part of the threat model. (If a future use case demands it, the seal mechanism is forward-compatible: encrypt-then-MAC.)
- **Authentication of the agent.** Anything with workspace-write access and the ability to call the MCP server is treated as the legitimate agent. There is no per-agent identity or revocation.
- **Multi-tenant servers.** One server instance, one workspace, one user. Multi-tenancy is a different problem.
- **Replacing TOON workflow definitions.** Workflow definitions, skill files, resources, and validators are unchanged. Only the session-state plumbing moves.
- **Backwards compatibility with old `workflow-state.json` files in arbitrary states.** A one-shot converter handles in-flight workflows at upgrade time (phase 9); after migration the old format is removed from the read path.

## 6. Success criteria

The refactor is complete when:

1. **No agent-side token threading.** No authenticated tool's zod schema accepts `session_token`. All accept `session_index` (six characters) instead.
2. **No agent-side state writes.** The harness `Write` tool is not invoked by `workflow-engine::persist` or any equivalent. `persist` becomes a no-op or is removed; `restore` becomes a thin wrapper over `start_session(planning_slug, agent_id)`.
3. **Server owns the file pair.** Every authenticated tool that mutates state writes both `session.json` and `.session-token` atomically before returning success.
4. **Tampering is detected.** Editing `session.json` by hand between two tool calls causes the second call to fail with a clear `seal mismatch` error.
5. **Nested parents are recursive.** A workflow dispatching three levels of sub-workflow records all three parent levels in `session.json` and can resume from any depth.
6. **Resume is one call.** `start_session(planning_slug, agent_id)` against an existing folder returns the existing `session_index` and the agent proceeds. No `.session-token` file is read by the agent.
7. **Idempotent index derivation.** `start_session` called twice against the same slug returns the same `session_index`.
8. **Server restart is transparent.** Restarting the server between two tool calls is invisible to the caller — no staleness re-signing branch, no warning text — because the seal is over `session.json` bytes, not server uptime.
9. **Test coverage is comprehensive.** Schema validation, HMAC sealing, atomic write semantics, index resolution including collision handling, nested-parent recording, resume flow, and migration of legacy `workflow-state.json` files are all covered.
10. **Documentation reflects the new model.** `docs/api-reference.md`, `schemas/README.md`, the meta-workflow skill (`00-workflow-engine.toon`), and `CLAUDE.md` token-discipline rules are updated. References to `session_token` threading are removed from worker-facing rules.

## 7. Constraints

Hard constraints the design must respect:

- **Workspace argument is required at server launch.** The server cannot infer the workspace from session-time information (the slug alone is insufficient — multiple workspaces can have identically named slugs).
- **`~/.workflow-server/secret` is a single global key.** The same key seals every session for every workspace this user runs. Rotation invalidates every in-flight session.
- **File permissions are the only access control.** The directory is `0700`, the files are `0600`. Anyone with read access to `~/.workflow-server/secret` can forge seals.
- **Index length is bounded by transcription reliability.** Six base32 characters (30 bits) is the chosen budget. Collision probability at realistic session counts is low but non-zero; enumeration-based resolution must handle collisions deterministically (defined behaviour: first-match by folder mtime, error if ambiguous).
- **MCP protocol surface is unchanged.** Tools are still registered the same way against the SDK; only their input schemas change. Existing callers (Claude Code harness, the IDE rules) require coordinated updates.
- **Backwards-incompatible.** This is a breaking change to every authenticated tool's input schema. The migration phase (phase 9) handles in-flight workflows; new workflows after the cut-over use only the new shape. There is no dual-mode period.

## 8. Risks and open questions

Flagged for the elicitation and research activities to refine:

- **Workspace argument semantics.** CLI flag vs. environment variable vs. both. Behaviour when neither is provided (error vs. fallback to cwd). Behaviour when the path does not exist or is not a directory.
- **Secret key lifecycle.** Where does rotation come from? What is the user-facing recovery story if `~/.workflow-server/secret` is lost or rotated mid-workflow?
- **Index collisions.** With 30 bits and (say) a thousand sessions per user lifetime, collision probability is small but real. The resolution policy needs to be defined and tested.
- **Atomicity on shared filesystems.** `rename(2)` is atomic on local POSIX filesystems but weaker on NFS, SMB, and some FUSE backends. The design assumes local FS; the constraint should be documented.
- **Concurrent server processes.** Two MCP servers launched against the same workspace will race. Detection (lock file? PID file?) is unspecified.
- **Performance.** Folder enumeration on every authenticated call is O(N) over planning folders. For workspaces with hundreds of historical sessions this may become a hot path.
- **`session_index` exposure.** The index is visible to the user (they pass it around in transcripts). Is six characters enough to avoid accidental ambiguity in chat logs? Is it too short to feel like a "real" identifier?
- **Migration window.** Phase 9 converts legacy files. What happens if a user resumes a workflow whose `workflow-state.json` was written by the old code but the server has been upgraded? The converter must be idempotent and detect-on-read.

## 9. Approach posture

This is a **complex inventive-goal** classification: an improvement to existing infrastructure (not a bug), affecting many components (every authenticated tool, persistence, meta-workflow rules, agent-facing documentation), with non-trivial design decisions still open (collision policy, workspace-arg semantics, secret-key lifecycle). The full workflow path applies — elicitation will refine the open questions above, research will survey HMAC-sealed-file patterns and atomic write conventions, plan-prepare will sequence the ten implementation phases into a concrete work package.

## 10. Related artifacts

- [02-assumptions-log.md](02-assumptions-log.md) — Assumptions surfaced during this activity, with reconciliation status.
- [Issue #115](https://github.com/m2ux/workflow-server/issues/115) — Authoritative problem statement.
- `src/utils/session.ts` — Current token implementation (to be partially superseded).
- `src/utils/crypto.ts` — HMAC primitives (reused).
- `workflows/meta/skills/00-workflow-engine.toon` — Current `persist` and `restore` operations (to be simplified or removed).
