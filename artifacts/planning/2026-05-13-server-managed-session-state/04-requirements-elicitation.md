# 04 - Requirements Elicitation: Server-Managed Session State

**Work package:** Server-managed session state with workspace-aware MCP server
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**Date:** 2026-05-13
**Status:** Confirmed (stakeholder transcript provided)
**Stakeholder source:** `Incoming/115-design-history.md` — design history document authored by the user, treated as the canonical stakeholder spec.

This artifact captures the elicited requirements, scope boundaries, and success criteria for issue #115. It supersedes the open questions surfaced in [02-assumptions-log.md](02-assumptions-log.md) where the stakeholder input provides a definitive answer, and forwards the remainder as plan-phase decisions.

---

## 1. Problem Statement

Workflow session state is currently split between (a) an opaque HMAC-signed token threaded on every authenticated MCP call by the agent, and (b) an agent-written `workflow-state.json` + `.session-token` pair in the planning folder. The split has produced concrete operational pain: LLMs occasionally mis-transcribe the long opaque token, breaking HMAC verification mid-workflow (PR #1466 incident); the file schema is agent-enforced and silently drifts from the server's Zod schema; the parent chain flattens to a single level so grandparent dispatch (A → B → C) cannot be reconstructed.

Two prior design directions were explored and rejected:

1. **Tier C** (CBOR-shrink the wire token + server-side SessionRecord + 128-bit state-hash attestation). Committed and reverted on `enhancement/session-token-size-optimization` — branch retained for salvageable state-hash logic.
2. **Interceptor CLI** (PR #113, closed without merging). PreToolUse/PostToolUse hooks would own the token at the harness layer, eliminating LLM transcription. Closed because PostToolUse hooks cannot rewrite responses — the token still appears in `_meta.session_token` and consumes inbound LLM context.

Issue #115 is the chosen direction: **remove token threading from the wire entirely**. The server owns `session.json` and a sibling `.session-token` seal in the planning folder; the agent passes only a six-character `session_index` on each authenticated call.

## 2. Goal

A workspace-aware MCP server that holds end-to-end authority over session state. The agent's surface is a short, transcription-safe identifier; the agent has read but not write access to the canonical state file; nested workflow parents are first-class and recursive; tampering is detected, not prevented.

---

## 3. Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Workflow agent (LLM, any harness) | Reliable, transcription-safe session identifier on every call; no manual file writes for state persistence; one-call resume from a planning folder slug | As an agent, I want to pass a six-character `session_index` instead of an opaque token so that I never break a workflow by mis-transcribing the identifier mid-session. |
| Workflow user (human running the harness) | Predictable failure mode if local state files get hand-edited, branch-checked-out, or stashed; clean restart of the MCP server without invalidating in-flight sessions | As a user, I want hand-editing `session.json` to fail the next tool call with a clear seal-mismatch error so that I do not silently proceed on inconsistent state. |
| Downstream consumer projects (e.g., midnight-node) | Migration path for in-flight workflows; advance notice of the breaking schema change; harness rule updates | As a consumer-project maintainer, I want a clear migration story for my in-flight planning folders so that the workflow-server upgrade does not strand my work-in-progress. |

### Secondary Stakeholders

- **Claude Code / MCP harness maintainers** — Harness rules referencing `session_token` (`.claude/rules/workflow-server.md`) need wording updates; the parameter rename is breaking.
- **Workflow definition authors** — TOON rules in `meta/skills/00-workflow-engine.toon` change (persist/restore become near-no-ops; token-discipline rules removed or rewritten).
- **Documentation consumers** — `docs/api-reference.md`, `docs/architecture.md`, `docs/checkpoint_model.md`, `docs/dispatch_model.md`, `docs/ide-setup.md`, `docs/development.md` all describe `session_token` and must be updated. The PR #113 interceptor doc (`docs/interceptor-recipe.md`) is deleted; PR #113 architecture additions are removed.

---

## 4. Context

### Integration Points

- **`~/.workflow-server/secret`** — Single 32-byte HMAC key, created on first server run with `O_CREAT|O_EXCL` and mode `0600` (per `src/utils/crypto.ts`). Unchanged in this refactor; used to derive `session_index` and to seal `session.json`.
- **Planning folder convention** — `<workspace>/.engineering/artifacts/planning/<slug>/` is the fixed layout. The slug (folder basename) is the natural address the agent passes.
- **MCP harness (`stdio`)** — The MCP server is launched as a subprocess by Claude Code (or another harness). It must be launched with a workspace argument; that argument cannot be inferred at session time because multiple workspaces can have identically named slugs.
- **`~/.workflow-server/secret`** is workspace-independent. The same key seals every session for every workspace this user runs.
- **Meta workflow (`workflows/meta/skills/00-workflow-engine.toon`)** — `persist`, `restore`, `commit-and-persist` operations and the associated TOON rules. Materially simplified (persist becomes near-no-op; restore becomes a thin `start_session(planning_slug, agent_id)` wrapper).

### Dependencies

- Node.js 18+ (existing runtime baseline).
- POSIX filesystem semantics on local mounts (atomic `rename(2)`). NFS, SMB, FUSE remain explicitly out of scope (constraint).
- Existing HMAC primitives in `src/utils/crypto.ts` (`hmacSign`, `hmacVerify`).

### Constraints

- **Technical:**
  - Six base32 characters (30 bits) is the chosen `session_index` budget. Length is fixed for V1 (not configurable; see §6 plan-phase decisions).
  - Server is stateless across calls (no in-memory registry). Folder enumeration on every authenticated call resolves the index.
  - Atomic write semantics (`write tmp` + `fsync` + `rename`) ordered as `session.json` first, then `.session-token`. Concurrent readers observing a torn pair see a seal mismatch and fail fast (correct behaviour).
  - Backwards-incompatible: every authenticated tool's schema changes. There is **no dual-mode period** beyond what the migration phase provides; this is confirmed in §6 below.
- **Timeline:** 1-3 days of agentic development time across the ten implementation phases, with the bulk of effort in phases 5-7 (index resolution, tool API, recursive parent) and phase 9 (migration).
- **Resources:** Single-developer plus AI-assisted; no external review gating except the standard PR review cycle.

---

## 5. Scope

### ✅ In Scope

1. **Workspace argument at server launch.** Both CLI flag (`--workspace=PATH`) and environment variable (`WORKFLOW_WORKSPACE=PATH`) are supported; CLI takes precedence when both are present. (See §6 plan-phase decision PD-1 for the exact precedence spec.)
2. **`start_session(planning_slug, agent_id)`** — server resolves `<workspace>/.engineering/artifacts/planning/<slug>/`, creates or loads `session.json`, returns a `session_index`. Idempotent: the same slug returns the same index on every call.
3. **Six-character base32 `session_index`** — derived as `base32(HMAC(absolute_folder_path, secret_key)[0..4])`. Deterministic and secret-bound. Absolute path used (not slug, not relative) to keep workspace-instance separation.
4. **`session.json` (server-written, agent-readable)** — full session state, including the union of today's `SessionPayload` fields and today's `workflow-state.json` envelope, plus a recursive `parentSession` of the same shape. JSON shape is the agent-facing contract.
5. **`.session-token` (server-written)** — contains only the raw HMAC hex over `session.json` bytes. No envelope, no JSON, no metadata. Anything that mutates `session.json` bytes (whitespace included) invalidates the seal — this is the intended convergence detector.
6. **Atomic write of both files** — `session.json.tmp` → fsync → rename, then `.session-token.tmp` → fsync → rename. Order is fixed: state first, seal second. A reader during the inter-rename window observes a seal mismatch and fails fast.
7. **Permissions** — `0700` on the planning folder, `0600` on `session.json` and `.session-token`. Single-user-machine assumption; permissions are documented intent, not enforced isolation.
8. **`session_index` on every authenticated tool** — replaces `session_token` on `get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `present_checkpoint`, `respond_checkpoint`, `resume_checkpoint`, `get_trace`, `get_workflow_status`, `get_skills`, `get_skill`, `get_resource`. Unauthenticated tools (`discover`, `list_workflows`, `health_check`, `resolve_operations`) are unchanged.
9. **Server-side validation pipeline on every authenticated call** — resolve `session_index` to a folder → read `session.json` and `.session-token` → verify `state.sessionIndex == passed_index` → verify `HMAC(session.json bytes, secret) == .session-token` → execute → write new state + new seal atomically.
10. **Recursive `parentSession`** — same shape as `SessionFile` itself, captured at child-dispatch time as a snapshot of the parent's `session.json`. Grandparent chain is preserved automatically. Co-exists with existing `triggeredWorkflows` (downward chain).
11. **`withAuditLog` re-resolution** — the audit-log wrapper accepts `session_index` and re-resolves it independently of the handler. Duplicate-resolution cost is accepted for V1.
12. **Migration converter (phase 9)** — one-shot reader that takes a legacy `workflow-state.json` + sibling `.session-token` pair and produces `session.json` + new `.session-token` seal. Idempotent and detect-on-read.
13. **Dead-code removal** — `encryptToken` / `decryptToken` in `src/utils/crypto.ts` (no reachable callers post-`state-tools.ts` removal) and `StateSaveFileSchema` in `src/schema/state.schema.ts` (stale 8-field schema that no current code path validates against the actual 3-field envelope) are removed in the same PR as the refactor.
14. **Salvage from Tier C** — canonical-serialization and atomic-write patterns from `enhancement/session-token-size-optimization` (specifically `state-hash.ts`'s canonicalisation logic and `session-store.ts`'s atomic-rename + EXDEV handling) are lifted into the new `src/utils/session-store.ts`. The CBOR codec is not salvaged (no wire format change in #115).
15. **Documentation updates** — `docs/api-reference.md`, `docs/architecture.md`, `docs/checkpoint_model.md`, `docs/dispatch_model.md`, `docs/development.md`, `docs/ide-setup.md`, `docs/state_management_model.md`, `docs/resource_resolution_model.md`, `docs/orchestra-specification.md`, `docs/artifact_management_model.md`, `docs/workflow-fidelity.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`. PR #113's `docs/interceptor-recipe.md` is deleted; PR #113 architecture additions are reverted/removed.
16. **Meta-workflow surface updates** — `meta/skills/00-workflow-engine.toon` (`persist` becomes no-op, `restore` becomes `start_session` wrapper, token-discipline rules removed), `meta/workflow.toon` variables (`saved_session_token`, `client_session_token`, `pending_checkpoint_handle`, flat parent fields replaced by recursive `parentSession` in `session.json`), and orchestrator/worker prompt resources.

### ❌ Out of Scope

1. **Cross-workspace sessions.** Each server instance is workspace-scoped. Sessions that need to span two workspaces are a separate design problem.
2. **Server-side enforcement of checkpoint semantics.** The server validates protocol integrity (`bcp` set on yield, cleared on respond, seal integrity) but does not gate which `option_id` the user is allowed to pick.
3. **Encryption of session state at rest.** `session.json` is plain JSON; `.session-token` is plain HMAC hex. Confidentiality of variables is not in the threat model. The seal mechanism is forward-compatible with encrypt-then-MAC if future requirements demand it.
4. **Per-agent authentication.** Anything with workspace-write access and the ability to call the MCP server is treated as the legitimate agent.
5. **Multi-tenant servers.** One server, one workspace, one user.
6. **Network filesystem support.** Atomic-rename semantics are local-POSIX only. NFS, SMB, FUSE are documented as unsupported.
7. **Concurrent-process locking.** Two MCP servers launched against the same workspace will race; the seal-mismatch failure mode is documented as the detection mechanism. No PID file or `flock` is added in V1.
8. **Secret key rotation protocol.** Manual rotation invalidates every in-flight session. No keyring, no prior-key fallback. Recovery story is "start over from the most recent commit." (Plan-phase may revisit; see PD-5.)
9. **Force-reseal escape hatch.** A user who intentionally hand-edits `session.json` to "rewind" the workflow does so at their own risk; the next call fails with a seal-mismatch error. There is no `start_session(slug, force_reseal=true)` mechanism in V1.
10. **Interceptor CLI files on `feat/112-interceptor-cli`.** That branch is parked / retained; its files do not live on `main`, so #115's PR has nothing to delete from `main` on that surface. Branch is preserved for posterity.
11. **Replacing TOON workflow definitions, skill files, resources, or validators.** Only session-state plumbing moves.
12. **Database (sqlite) backing for sessions.** Files in the planning folder remain the truth.
13. **Wider `session_index` than six chars in V1.** Configurability is deferred (see §6 PD-3).

### ⏳ Deferred

1. **Issue #98** ("Compress session tokens to reduce context window usage") — directly addressed by #115's removal of tokens from context. Close as superseded once #115 lands.
2. **Issue #101** ("Switch to HTTP/SSE transport to eliminate session token context bloat") — partially addressed by #115. Transport modernisation may still have value independent of token bloat; assess after #115 ships.
3. **LRU cache for folder enumeration** — accepted as V1 cost (folder count is typically tens to low hundreds). Add a cache only if profiling shows a hot path. Tracked by research-dependent assumption F4.
4. **Encrypted state at rest** — forward-compatible with the seal mechanism via encrypt-then-MAC. Defer until a threat model demands it.
5. **`session.json` schema versioning policy and deprecation cadence** — V1 includes a `schemaVersion` field but the deprecation cadence is not yet decided. Defer to first time a breaking schema change is proposed.
6. **Configurable index length** — if/when high-folder-count workspaces (>10⁴ planning folders) emerge, revisit the six-char budget. Trade-off is collision probability vs. transcription friction.

---

## 6. Plan-Phase Decisions (forwarded open questions)

These items are flagged for resolution during the plan-prepare activity (or via checkpoints during it). The transcript explicitly states: "These don't need to be answered before kickoff — they're flagged so plan-prepare can address them, possibly via checkpoints." Each has a recommendation; plan-prepare confirms or overrides.

| # | Decision | Recommendation | Source |
|---|----------|----------------|--------|
| PD-1 | Workspace-arg precedence: CLI flag vs env var when both present. | CLI flag wins; env var is the fallback; if neither is provided, server errors out at startup (does not silently fall back to `process.cwd()`). | E1, E2 in [02-assumptions-log.md](02-assumptions-log.md); transcript §5. |
| PD-2 | Migration strategy for in-flight `workflow-state.json` files. | One-shot converter (idempotent, detect-on-read) shipped with the same PR; no graceful coexistence period (cleaner blast radius, no dual-read code path). | Transcript §8 item 1; D3 in assumptions log. |
| PD-3 | `session_index` length: fixed six chars vs configurable. | Fixed at six (30 bits) for V1; collision policy detects ambiguity. Configurability deferred. | Transcript §10 item 1; F3 in assumptions log. |
| PD-4 | Collision policy when two folders hash to the same six-char index. | Error with both candidate paths in the response; require the agent to disambiguate by passing a longer prefix or by renaming. (Alternative: lengthen the index to eight chars and dispense with the policy. Plan-prepare chooses.) | F3 in assumptions log; transcript §6/§10. |
| PD-5 | Secret-key rotation protocol. | None in V1. Document recovery as "regenerate the secret; in-flight sessions are invalidated; resume by re-running `start_session` against the existing planning folder, which will re-seal the existing `session.json` with the new key on first authenticated call." Plan-prepare confirms acceptable. | E5 in assumptions log. |
| PD-6 | Maximum parent-chain depth. | No hard ceiling. Soft warning past 5 levels; validation messages may include depth. | G3 in assumptions log; transcript §10 item 3. |
| PD-7 | Whether to retain a deprecated `session_token` parameter alongside `session_index` for one release. | No. Clean break — smaller blast radius, smaller test matrix, lower documentation surface. Migration converter handles in-flight workflows. | Transcript §8 item 2. |
| PD-8 | Whether to address open issues #98 and #101 within #115's scope. | No. Close #98 as superseded; track #101 separately. | Transcript §8 item 3; §6 in this artifact. |
| PD-9 | `session.json` schema design: flat vs namespaced (server-managed vs domain-state sections). | Flat schema with a `schemaVersion: number` field at the root. Namespaced subdivision can be added later if drift becomes a problem. | B6 in assumptions log; transcript §8 item 5. |
| PD-10 | Force-reseal escape hatch for intentional hand-edits. | No. Hand-edits result in seal-mismatch; users restart from the most recent commit. | H2 in assumptions log. |
| PD-11 | Whether `present_checkpoint` and `respond_checkpoint` continue to accept either `session_index` or a separate `checkpoint_handle`. | Single `session_index` parameter only. The active checkpoint is read from `state.activeCheckpoint` inside `session.json`; no separate handle is yielded to the worker. Matches the collapse partially shipped in PR #113. | §7.1 of [03-codebase-comprehension.md](03-codebase-comprehension.md). |

These are the only items the elicitation activity forwards. All other previously-open assumptions are resolved by the transcript and are reclassified in the assumptions log update.

---

## 7. Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | No agent-side token threading: zero authenticated tool input schemas accept `session_token`. | `grep -rn "session_token" src/tools/` returns no occurrences after refactor (other than possibly migration converter for legacy reads). |
| SC-2 | No agent-side state writes: `workflow-engine::persist` either becomes a no-op or is removed; no `Write` calls on `session.json` or `.session-token` from any TOON operation. | `grep -rn "Write" workflows/meta/skills/00-workflow-engine.toon` returns no matches against state file paths. |
| SC-3 | Every authenticated tool that mutates state writes both `session.json` and `.session-token` atomically before returning. | Integration test: invoke each mutating tool, observe both files updated; observe rename order (state before seal); kill process between renames and verify reader correctly fails. |
| SC-4 | Tampering is detected: hand-edit `session.json` between two tool calls; second call returns a `seal mismatch` error with file path. | New `tests/session-store.test.ts` includes a tamper-injection case. |
| SC-5 | Nested parents are recursive: a workflow dispatching three levels (A → B → C → D) records the full chain in D's `session.json`; resuming from any depth surfaces the correct ancestors. | Updated `tests/dispatch.test.ts` covers three-level chains; assertion targets `parentSession.parentSession.parentSession`. |
| SC-6 | Resume is one call: `start_session(planning_slug, agent_id)` on an existing folder returns the existing `session_index` and `session.json` is unchanged. | `tests/mcp-server.test.ts` resume case. |
| SC-7 | Idempotent index derivation: `start_session` twice against the same slug returns the same index byte-for-byte. | `tests/session-index.test.ts` includes idempotence assertion. |
| SC-8 | Server restart is transparent: restarting between two tool calls does not require staleness recovery or re-signing. | Integration test: spawn server → start_session → SIGTERM → respawn → next authenticated call succeeds without explicit recovery branch. |
| SC-9 | Migration converter is idempotent and reversible-on-read: running it twice against the same folder is a no-op; running it against a folder already containing `session.json` short-circuits. | `tests/migration.test.ts` covers both cases; uses this work package's own `workflow-state.json` as a fixture. |
| SC-10 | Collision policy is deterministic: two folders that hash to the same index trigger a deterministic error (or, if PD-4 chooses 8 chars, the case becomes unreachable in practice). | `tests/session-index.test.ts` synthesises a collision pair and asserts the policy. |
| SC-11 | Documentation reflects the new model: zero references to `session_token` in `docs/`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `schemas/README.md` (other than historical/changelog notes). | Doc-level grep at the end of phase 10. |
| SC-12 | `withAuditLog` re-resolution is correct: every authenticated tool's trace event contains correct `sid`, `wf`, `act`, `aid` derived from re-resolved `session.json`. | `tests/trace.test.ts` updated; asserts trace event fields match `session.json` content after each call. |
| SC-13 | Dead-code removal is clean: `grep -rn "encryptToken\|decryptToken\|StateSaveFileSchema" src/` returns no hits after the refactor. | Final-state grep verification in PR review. |
| SC-14 | `npm run typecheck && npm test` passes with the new code in place; no skipped tests added beyond what existed pre-refactor (256 passed / 2 skipped, per the reverted Tier C baseline). | Standard `npm test` invocation as part of validation phase. |

---

## 8. Elicitation Log

### Source

The user provided a single comprehensive stakeholder spec at `/home/mike1/Incoming/115-design-history.md` (332 lines, 28 KB). This document was authored by the user as a transition aid from the prior interceptor design (PR #113, closed) to the current direction (issue #115). It serves as the authoritative stakeholder transcript for this elicitation activity.

### Questions Answered by the Transcript

| Domain | Question | Resolution |
|--------|----------|------------|
| Problem | What is the core problem and what triggered it? | PR #1466 token transcription incident (transcript §2). Three solution classes considered (reduce surface, eliminate transcription, tolerant decoding); issue #115 chooses (1) + (2) radicalised. |
| Problem | What workarounds exist today? | `decodePayloadOnly`, staleness re-signing in `start_session`, long error strings — all admissions of token brittleness (transcript §2; assumption A4). |
| Stakeholders | Who is affected by this change? | Workflow agent (LLM), workflow user, downstream consumer projects, Claude Code harness maintainers, workflow definition authors, doc consumers (transcript §1, §6). |
| Stakeholders | Are there external parties? | Downstream consumer projects (e.g., midnight-node) using the workflow-server as an MCP dependency (transcript §1 framing). |
| Context | What integrates with this surface? | `~/.workflow-server/secret`, planning folder convention, MCP harness, meta workflow operations (transcript §5). |
| Context | What technology constraints apply? | Node.js 18+, local POSIX FS, existing HMAC primitives (transcript §5; assumptions A7, A8). |
| Context | Timeline? | 1-3 days agentic dev time across the 10 phases (transcript §1; assumption C3). |
| Scope | What is in scope? | Workspace argument; `start_session(planning_slug, agent_id)`; `session_index`; `session.json` + `.session-token` server-owned; recursive `parentSession`; migration converter; dead-code removal; doc updates (transcript §5, §6, §8). |
| Scope | What is explicitly out of scope? | Cross-workspace sessions; checkpoint semantic enforcement; encryption at rest; per-agent auth; multi-tenant servers; network FS; concurrent-process locking; secret rotation; force-reseal; interceptor CLI on `main` (transcript §5 non-goals; §6 redundant features). |
| Scope | What can be deferred? | Issues #98 and #101; LRU cache; encryption; schema versioning policy; configurable index length (transcript §8 decision points). |
| Success | How will we know it works? | 14 success criteria SC-1 through SC-14 above, derived from transcript §5 invariants and §6 success criteria for the broader effort. |
| Success | What would a failure look like? | Token references remain in source after refactor (SC-1 inverse); agent-side writes persist (SC-2 inverse); tamper goes undetected (SC-4 inverse); migration is destructive or non-idempotent (SC-9 inverse). |

### Questions Forwarded to Plan-Prepare (Unresolved)

The transcript explicitly forwards a small set of decisions to plan-prepare; these are listed as PD-1 through PD-11 in §6 above. None are blocking for the research activity (which addresses B1, B2-partial, F4 — index transcription reliability and folder-enumeration performance).

### Anti-patterns Avoided

- Stakeholder discussion was not skipped (`has_stakeholder_input=true`). The transcript is rich enough that agent-led elicitation would have produced shallower answers.
- Questions were not asked one-at-a-time because the transcript answered every relevant question at once; iterating through the five default domains would have re-asked already-resolved items and risked drifting into solutioning rather than re-eliciting.
- Plan-phase decisions are forwarded as explicit decisions with recommendations, not buried as "TBD" — every PD entry has a recommendation that plan-prepare must accept or override.

---

## 9. Assumptions Reclassification

The following assumptions from [02-assumptions-log.md](02-assumptions-log.md) are reclassified after the elicitation:

| ID | Was | Now | Resolution |
|----|-----|-----|------------|
| B3 | open (stakeholder-dependent) | **confirmed** | Transcript §5: `.session-token` holds only the HMAC hex bytes, no envelope. |
| B5 | open (stakeholder-dependent) | **confirmed** | Transcript §5: HMAC over raw `session.json` bytes; whitespace and key-order changes invalidate the seal (intended behaviour). |
| B6 | open (stakeholder-dependent) | **refined → PD-9** | Flat schema with `schemaVersion` field; deprecation cadence deferred. |
| C3 | open (stakeholder-dependent) | **confirmed (soft)** | 1-3 days agentic time across the 10 phases. Single PR (PD-7 confirms no dual-mode). |
| D3 | open (stakeholder-dependent) | **confirmed → PD-2** | One-shot converter shipped in same PR; no coexistence period. |
| E1 | open (stakeholder-dependent) | **refined → PD-1** | CLI flag + env var both supported; CLI wins. |
| E2 | open (stakeholder-dependent) | **confirmed → PD-1** | Server errors out at startup if neither workspace arg is provided. |
| E4 | open (stakeholder-dependent) | **confirmed** | No locking in V1; seal-mismatch is the detection mechanism. Documented constraint. |
| E5 | open (stakeholder-dependent) | **refined → PD-5** | No rotation protocol in V1; document recovery story. |
| E6 | open (stakeholder-dependent) | **confirmed** | Network FS out of scope; documented constraint. |
| F3 | open (stakeholder-dependent) | **forwarded → PD-3, PD-4** | Six chars fixed for V1; collision policy chosen at plan-prepare. |
| G3 | open (stakeholder-dependent) | **refined → PD-6** | No hard ceiling; soft warning past 5 levels. |
| H2 | open (stakeholder-dependent) | **confirmed → PD-10** | No force-reseal; hand-edits cause seal mismatch. |
| Dead-code (Q5, §7.5 of comprehension) | open (recommendation) | **confirmed** | Remove `encryptToken`/`decryptToken` and `StateSaveFileSchema` in this PR. Transcript §3 implicitly supports this by listing them as redundant; transcript §6 documents the salvage scope from Tier C. |
| Research-dependent (B1, B2 partial, F4) | open | **unchanged** | Still to be addressed in the research activity. |

### New Assumptions Surfaced During Elicitation

| ID | Assumption | Resolvability | Status | Source |
|----|------------|---------------|--------|--------|
| R1 | The migration converter must successfully read this very work package's `workflow-state.json` (3-field envelope) and produce an equivalent `session.json`. | code-analyzable | confirmed (deferred to implementation as a test fixture) | Transcript §6 implicit; comprehension §7.6. |
| R2 | The collapsed `present_checkpoint` / `respond_checkpoint` API from PR #113 (single `session_token` parameter; no separate `checkpoint_handle`) carries forward — the new API takes only `session_index`, and the active checkpoint is read from `state.activeCheckpoint`. | code-analyzable | confirmed → PD-11 | Comprehension §7.1; transcript §4 ("collapsed checkpoint API was a useful intermediate"). |
| R3 | `_meta.session_token` is removed from every tool response envelope. `MetaResponseSchema` no longer carries `session_token`; either drop `_meta` entirely on authenticated tools or replace with non-session structural metadata. | code-analyzable | confirmed | Comprehension §7.1, validation.ts:218. Transcript §5 ("Token never appears in LLM context"). |
| R4 | The audit-log wrapper (`withAuditLog`) takes the new `session_index` parameter and re-resolves it independently. Duplicate-resolution cost is V1-acceptable. | code-analyzable | confirmed | Comprehension §7.2; transcript implicit in invariant I8 (statelessness). |
| R5 | `assertCheckpointsResolved` keeps its current logic but reads `state.activeCheckpoint` (from `session.json`) instead of `token.bcp`. | code-analyzable | confirmed | Comprehension §3.2 abstraction-replacement table. |
| R6 | `parentSession` is captured at child-dispatch time as a **snapshot** of the parent's `session.json`. Subsequent mutations of the parent do not propagate to the child's `parentSession`. | self-evident | confirmed | Transcript §5; assumption G2. |
| R7 | A workspace under `<workspace>/.engineering/artifacts/planning/<slug>/` may itself be a git submodule. The server treats the submodule directory exactly like any other planning folder — no special submodule handling. | self-evident | confirmed | Workspace convention §4; no explicit submodule logic in the design. |
| R8 | The interceptor CLI artifacts on `feat/112-interceptor-cli` are **not** touched by this PR (they are not on `main`). The branch remains parked. | self-evident | confirmed | Transcript §4, §7. |

---

## 10. Confirmation

**Confirmed by:** Stakeholder transcript (`Incoming/115-design-history.md`)
**Date:** 2026-05-13
**Notes:** The transcript is unusually comprehensive — it is the user's hand-curated transition aid from PR #113 to issue #115 and pre-answers most of the requirements-elicitation domain questions. Eleven items remain for plan-prepare to decide (PD-1 through PD-11); none are blockers for the next activity (research, which addresses transcription-reliability and enumeration-performance research-dependent assumptions B1, B2-partial, and F4).

---

## 11. Handoff

Outputs:

- This document — captured requirements, scope boundaries, success criteria, plan-phase decisions, reclassified assumptions.
- Updated [02-assumptions-log.md](02-assumptions-log.md) — entries B3, B5, B6, C3, D3, E1, E2, E4, E5, E6, F3, G3, H2, plus dead-code disposition, all reclassified per §9 above. New entries R1-R8 added.

Next activity: **research** (per workflow transition `elicitation_complete=true && needs_research=true`). Open research questions:

- B1: Six base32 characters' transcription reliability vs longer/shorter identifiers.
- B2 (partial): Survey of UUID-shortening conventions (`nanoid`, `base32`, etc.) and their HMAC-binding patterns.
- F4: Folder-enumeration performance benchmarks on representative workspace sizes (10s, 100s, 1000s of planning folders).
