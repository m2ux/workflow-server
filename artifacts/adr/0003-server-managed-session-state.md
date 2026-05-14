# ADR-0003: Server-Managed Session State with Workspace-Aware MCP Server

**Status:** Accepted
**Date:** 2026-05-14
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**PR:** [#116](https://github.com/m2ux/workflow-server/pull/116)
**Companion PR (workflows):** [#117](https://github.com/m2ux/workflow-server/pull/117)

---

## Context

Workflow session state was stored in two places at once:

1. An opaque HMAC-signed `session_token` threaded on every authenticated MCP call's `session_token` parameter and returned in every response's `_meta.session_token`. The token encoded `wf`, `act`, `skill`, `cond`, `v`, `seq`, `ts`, `sid`, `aid`, an optional `bcp` (blocking checkpoint), and at most one parent level (`psid`, `pwf`, `pact`, `pv`).
2. A `workflow-state.json` + sibling `.session-token` pair in the planning folder. The agent wrote both files via the harness `Write` tool, following procedures encoded in `workflows/meta/skills/00-workflow-engine.toon` (`workflow-engine::persist` and `workflow-engine::restore`).

This split surfaced five concrete frictions:

1. **Token transcription drift.** Models occasionally corrupted the long opaque base64url token across tool boundaries, producing mid-workflow HMAC failures. The codebase had accumulated explicit recovery paths (`decodePayloadOnly`, the staleness re-signing branch in `start_session`, long error strings).
2. **Schema enforced by agent rules.** `workflow-state.json` shape was described in TOON rules (the `state-format`, `no-token-duplication`, `no-derived-fields`, `omit-empty-collections`, `variables-canonical-home` rules of the persist operation). The server could not detect schema drift, accidental field duplication, or hand-edits.
3. **Single-level parent context.** `SessionPayload` flattened the parent chain into four fields. A grandparent dispatch (A → B → C) could not be represented; `start_session`'s `parent_session_token` branch read exactly one ancestor.
4. **Resume required file-shaped knowledge.** The agent had to know to read `.session-token` (with legacy fallback to a `sessionToken` field inside `workflow-state.json`) and pass it under the canonical `session_token` parameter — a known foot-gun the rules explicitly called out (`start-session-strict-params`, `parameter-vs-variable`).
5. **The token was both system-of-record and diff hotspot.** The `persist` rule documented that the token was split off into a sibling file specifically because it changed on every save and would otherwise dominate diffs. That was a workaround, not a clean separation of concerns.

## Decision

Make the MCP server **workspace-aware** and have it **own session state end-to-end**.

- The server is launched with a workspace argument (`--workspace=PATH` CLI flag or `WORKFLOW_WORKSPACE` environment variable; CLI wins; startup error when neither is present) and uses that workspace as the root for all per-session storage.
- For each session, the server owns two files under `<workspace>/.engineering/artifacts/planning/<slug>/`:
  - `session.json` — the full session state (the union of what was in the old token and the old `workflow-state.json`, plus a recursive `parentSession`). Validated by a `SessionFile` Zod schema.
  - `.session-token` — a raw HMAC-SHA256 (hex) over the bytes of `session.json`, using the server's `~/.workflow-server/secret` key, written atomically alongside every state mutation.
- The agent receives only a six-character deterministic `session_index` derived as `base32(HMAC-SHA256(realpath(folder_path), secret_key)[0..4])` and passes it on every authenticated tool call. The server resolves the index back to a folder by enumeration of the workspace's planning directories.
- The agent **may read** `session.json` via the harness `Read` tool to situate itself in the workflow, but **never writes** either file. Any write would invalidate the HMAC seal.
- Nested workflow parents are recursive: `parentSession` is the same shape as the enclosing session, with no depth ceiling. A → B → C → D dispatch preserves every level.
- A one-shot migration converter (Phase 9) detects the legacy `(workflow-state.json, .session-token)` pair on first authenticated call against a planning folder and converts it in place to the new `session.json` + new-seal pair. Idempotent on second invocation; clean cutover with no coexistence period.

### Key Design Choices

| Choice | Decision | Alternatives Considered |
|--------|----------|------------------------|
| Agent-visible handle | Six-character base32 `session_index` derived from folder path | Keep long opaque token; use folder slug as handle; use UUID |
| State location | One canonical `session.json` per planning folder, owned by the server | Keep dual file/token model; in-memory server registry; database |
| Integrity primitive | HMAC-SHA256 raw hex over `session.json` bytes, in sibling `.session-token` | Sign payload inside `session.json`; encrypt-then-MAC; no integrity check |
| Parent chain representation | Recursive `parentSession` field, same shape as enclosing session | Keep flattened single-level (`psid`/`pwf`/`pact`/`pv`); array of ancestors |
| Resume mechanism | Single `start_session(planning_slug, agent_id)` call; server decides fresh vs resume by file existence | Explicit `resume_session` tool; agent reads `.session-token` and re-passes |
| Workspace argument | Required at server launch (CLI flag or env var, CLI wins) | Infer workspace from session-time slug (ambiguous across workspaces) |
| Index collision policy | Deterministic first-match by folder mtime; error with both candidate paths when ambiguous | Random tie-break; longer index (lower collision probability) |
| Atomic write semantics | tmp file + fsync + rename (with EXDEV fallback to copy+unlink) | Direct write; lock files; database transactions |
| Server statelessness | No process-local registry of active sessions; every call reloads from disk | Cache in memory with invalidation; LRU |
| Legacy migration | Detect-on-read in-place converter; idempotent; one-shot at upgrade time | Dual-read period; manual migration tool; break in-flight workflows |
| Back-compat for `session_token` parameter | Clear error pointing at `session_index`; no silent failure | Accept both for a transition window; silent reject |
| Test ID convention | `PR116-TC-NN` anchored in test code during development; stripped before merge | Permanent IDs in source; no IDs |

### Rationale

The design prioritises **server authority over a single canonical state** and **transcription-safe agent surface**. The HMAC secret is the authority, and the server holds both the secret and the write path for the artifact under verification — authority and write capability are co-located, so the workspace becomes incapable of forging a consistent `(state, seal)` pair without the secret. The six-character `session_index` is short enough to type back reliably across tool calls; the long opaque token is server-internal and never re-typed.

Statelessness across calls (no in-memory session registry) makes server restart free and concurrent processes coherent up to filesystem semantics. The recursive `parentSession` field eliminates information loss at dispatch time, supporting unbounded nesting depth.

The threat model is **incoherent state**, not malicious actors. The HMAC seal does not stop a user with workspace-write access from editing `session.json` — it ensures the next authenticated call fails fast with a clear error rather than proceeding on inconsistent state. Manual edits, branch checkouts that revert one file but not the other, concurrent processes racing, and accidental cross-workspace file copies all surface as a single failure mode at the next tool call.

## Consequences

### Positive

- Token transcription drift is eliminated as a failure mode (long opaque token retired from the agent surface).
- `workflow-state.json` schema drift is impossible — the `SessionFile` Zod schema is the single source of truth, enforced server-side.
- Grandparent and deeper dispatch chains are first-class (recursive `parentSession`); preserved across A → B → C → D in tests TC-24 and TC-30.
- Server restart is transparent — no staleness re-signing branch, no warning text — because the seal is over `session.json` bytes, not server uptime.
- Resume is one call (`start_session(planning_slug, agent_id)`); the agent does not read `.session-token` directly.
- Authenticated tool surface is uniform: every authenticated tool takes `session_index` (six chars) and nothing else session-related.
- Test count rose from 256 (pre-refactor baseline) to 315 (`+59` tests) with no new skipped tests; SC-1 through SC-18 all satisfied.
- The interceptor pattern (the previous mitigation for transcription drift) is sunset; no `interceptor-recipe.md`, no docs references.

### Negative

- **Breaking change** to every authenticated tool's input schema (`session_token` → `session_index`). The migration converter handles in-flight workflows at upgrade time, but there is no dual-mode period; coordinated update of the Claude Code harness and IDE rules is required.
- **Workspace argument is required at server launch.** The server cannot run without `--workspace=PATH` or `WORKFLOW_WORKSPACE`; this is a deployment-time requirement that did not exist before.
- **Filesystem authority.** Anyone with workspace-write access and read access to `~/.workflow-server/secret` can forge seals. File permissions (`0700` on directory, `0600` on files) are advisory in current deployments where the model agent runs as the same user as the server.
- **Six-character index has finite collision space.** At 30 bits, collision probability is low but non-zero at high session counts; enumeration-based resolution must handle the collision case deterministically (first-match by folder mtime, error with both candidates if ambiguous).

### Neutral

- Five v2 deferrals are explicit in the design and recorded in `02-design-philosophy.md` §5: cross-workspace sessions, encryption at rest, per-agent auth, multi-tenant servers, NFS support. None was implicitly required for the V1 design to be coherent.
- The session-related utilities are grouped under `src/utils/session/` (`crypto`, `derivation`, `migration`, `params`, `resolver`, `store`) with a barrel export; this grouping was driven by review feedback (commit `0af3f8c`) and has no behavioural impact.
- Planning-related references (`Phase N`, `PR116-TC-XX`, `PD-N`, `SC-N`) that were anchored in source and tests during development are stripped before merge (commit `ad23820`); planning artefacts retain them.

## Related

- [#115](https://github.com/m2ux/workflow-server/issues/115) — Server-managed session state with workspace-aware MCP server (this work package)
- [#117](https://github.com/m2ux/workflow-server/pull/117) — Companion workflows-side PR (`feat/115-server-managed-session-state-meta`): meta-workflow TOON prose alignment, `workflow-engine::adopt-session`/`restore`/`persist` removed
- [Design philosophy](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-05-13-server-managed-session-state/02-design-philosophy.md)
- [Work package plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-05-13-server-managed-session-state/05-work-package-plan.md)
- [Validation report](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-05-13-server-managed-session-state/10-validation-report.md)
- [Strategic review](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-05-13-server-managed-session-state/11-strategic-review.md)
