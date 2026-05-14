# Work Package: Server-Managed Session State — Complete ✅

**Date:** 2026-05-14
**Type:** Refactor
**Status:** COMPLETED
**Branch:** `feat/115-server-managed-session-state`
**PR:** [#116](https://github.com/m2ux/workflow-server/pull/116) (approved; awaiting merge)
**Companion PR (workflows):** [#117](https://github.com/m2ux/workflow-server/pull/117) (`feat/115-server-managed-session-state-meta`)
**ADR:** [ADR-0003](../../adr/0003-server-managed-session-state.md)

---

## Summary

The MCP server is now workspace-aware and owns workflow session state end-to-end via `session.json` plus an HMAC integrity seal in the planning folder. The error-prone agent-threaded `session_token` is replaced by a six-character `session_index`; agent-side state writes are removed; nested workflow parents are represented recursively (no depth ceiling). All 18 success criteria (SC-1 .. SC-18) verified; 315 tests passing (+59 over the pre-refactor baseline of 256); strategic review found 0 critical / 0 major / 0 minor (3 informational, non-blocking). PR #116 received an approving review; companion workflows-side PR #117 carries the matching meta-workflow changes.

---

## What Was Implemented

### Phase 1: Workspace argument plumbing ✅
**Deliverables:**
- [`src/config.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/config.ts) (workspace resolution: CLI `--workspace=PATH` wins over `WORKFLOW_WORKSPACE` env; startup error when neither present)
- [`tests/config.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/config.test.ts) (4 tests, PR116-TC-01 .. TC-04)

**Key features:**
- `WorkspaceConfig` parsed at server boot
- CLI flag takes precedence (PD-1)
- Clear startup error when no workspace is supplied

### Phase 2: Session store primitives ✅
**Deliverables:**
- [`src/utils/session/derivation.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/utils/session/derivation.ts) — `computeSessionIndex` (6-char base32 via HMAC-SHA256, symlink-canonicalised, secret-bound)
- [`src/utils/session/resolver.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/utils/session/resolver.ts) — `resolveSessionIndex` (folder enumeration, deterministic collision error with both paths)
- [`src/utils/session/store.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/utils/session/store.ts) — `writeSessionFile` / `writeSeal` / `verifySeal` (atomic tmp+fsync+rename, EXDEV fallback, `0700` dir / `0600` file modes)
- [`src/utils/session/crypto.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/utils/session/crypto.ts) — HMAC primitives (kept secret-side only)
- [`tests/session-index.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-index.test.ts) (PR116-TC-05 .. TC-09)
- [`tests/session-store.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-store.test.ts) (PR116-TC-10 .. TC-20)

**Key features:**
- Index is deterministic, secret-bound, symlink-canonical
- Base32 alphabet rejects ambiguous `0189OIL`
- Atomic two-file write: `session.json` then `.session-token`
- Tampering detected on next call (hand-edit + whitespace-only edits both fail)

### Phase 3: `SessionFile` Zod schema ✅
**Deliverables:**
- [`src/schema/session.schema.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/schema/session.schema.ts) — full `SessionFile` shape with recursive `parentSession` (via `z.lazy`)
- [`schemas/session-file.schema.json`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/schemas/session-file.schema.json) — JSON Schema export
- [`tests/session-schema.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-schema.test.ts) (PR116-TC-21 .. TC-25)

**Key features:**
- `schemaVersion: 1` root field
- `activeCheckpoint` inside state (replaces token-side `bcp`)
- 3-level `parentSession` round-trip verified

### Phase 4: Authenticated tool API swap ✅
**Deliverables:**
- [`src/tools/workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/tools/workflow-tools.ts) — every authenticated tool migrated from `session_token` to `session_index`
- [`src/tools/resource-tools.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/tools/resource-tools.ts) — same migration on resource tools
- [`src/utils/session/params.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/utils/session/params.ts) — shared input-parsing helpers
- [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/mcp-server.test.ts) (PR116-TC-32 .. TC-38, TC-60)

**Key features:**
- 13 authenticated tools accept `session_index` only
- Legacy `session_token` parameter returns a clear error pointing at `session_index` (no silent failure)
- Checkpoints route through `state.activeCheckpoint`
- `MetaResponseSchema` no longer carries a token

### Phase 5: `start_session` restructure + legacy migration ✅
**Deliverables:**
- [`src/utils/session/migration.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/utils/session/migration.ts) — legacy-state detect-and-convert (3-field envelope, pre-split envelope with embedded `sessionToken`, orphan `.session-token`)
- [`tests/migration.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/migration.test.ts) (PR116-TC-51 .. TC-59)
- Updated `start_session` in [`src/tools/workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/tools/workflow-tools.ts) — single call for fresh and resume (PR116-TC-26 .. TC-30)

**Key features:**
- Idempotent migration; detect-on-read short-circuit
- Clean cutover (legacy files removed; no coexistence period)
- Corrupt-envelope and orphan-token decode failures surface with the legacy path and recovery guidance

### Phase 6: Recursive parent chain + depth warning ✅
**Deliverables:**
- Recursive `parentSession` capture in [`src/tools/workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/tools/workflow-tools.ts) (start_session dispatch path)
- Soft warning emitted via `_meta.validation` when dispatch depth exceeds 5 (PR116-TC-31)

### Phase 7: `withAuditLog` re-resolution ✅
**Deliverables:**
- [`src/trace.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/src/trace.ts) — re-resolves `session_index` and projects `sid` / `wf` / `act` / `aid` from the resolved `session.json` after each authenticated tool
- [`tests/trace.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/trace.test.ts) (PR116-TC-37, TC-38)

### Phase 8: Meta-workflow TOON prose alignment ✅
**Deliverables (workflows-side PR #117):**
- `workflows/meta/skills/00-workflow-engine.toon` — `adopt-session`, `restore`, `persist` operations removed; `token-passes-on-each-call`, `use-most-recent-token`, `token-is-opaque`, `staleness-recovery-only-via-start-session`, `start-session-strict-params` rules retired
- `workflows/meta/workflow.toon` — variables `saved_session_token`, `client_session_token`, `pending_checkpoint_handle`, `session_recovered`, `session_adopted` removed
- `workflows/meta/resources/{01-activity-worker-prompt.md, 02-workflow-orchestrator-prompt.md, 00-bootstrap-protocol.md}` — `{session_token}` placeholders removed

### Phase 9: Migration converter (full coverage) ✅
**Deliverables:**
- Tests above (Phase 5 entry — PR116-TC-51 .. TC-59) cover the 3-field envelope, pre-split embedded `sessionToken`, orphan `.session-token`, and idempotent re-runs.

### Phase 10: Sweep ✅
**Deliverables:**
- **10.1 — Per-file docs disposition:** every reference to `session_token`, `workflow-state.json`, `.session-token`, `parent_session_token`, `interceptor` removed from `docs/`, `schemas/README.md`, `README.md`, `SETUP.md`, `CLAUDE.md`, `AGENTS.md`
- **10.2 — Dead-code removal:** `encryptToken`, `decryptToken`, `StateSaveFileSchema` removed from `src/`
- **10.3 — Interceptor sunset:** `docs/interceptor-recipe.md` deleted; all references to "interceptor" stripped from top-level markdown

---

## Test Results

| Component | Tests | Coverage |
|-----------|-------|----------|
| Workspace config (Phase 1) | 4 | Full |
| Session index derivation (Phase 2) | 5 | Full |
| Session store + resolver (Phase 2) | ~25 | Full |
| `SessionFile` Zod schema (Phase 3) | 5 | Full |
| MCP server / authenticated tool API (Phase 4–7) | ~40 | Full |
| Migration converter (Phase 9) | ~12 | Full |
| Other test files (loader, validation, etc.) | ~224 | Unchanged from baseline |
| **Total** | **315 passed / 2 skipped** | All 18 SCs verified |

**Test Summary:**
- ✅ All 315 tests passing (`npx vitest run`)
- ✅ Typecheck clean (`npm run typecheck`)
- ✅ 2 skipped tests pre-date the refactor (not newly skipped)
- ✅ `+59` tests over pre-refactor baseline of 256
- ✅ Every success criterion (SC-1 .. SC-18) satisfied — verified case-by-case in [10-validation-report.md](10-validation-report.md)

---

## Files Changed

Net diff stat across the parent repo (`feat/115-server-managed-session-state` vs `origin/main`): **44 files, +4492 / -1527**, plus 3 commits on the `workflows` submodule and 15 commits on the `engineering` submodule.

**New files (representative):**
- `src/utils/session/derivation.ts`, `src/utils/session/resolver.ts`, `src/utils/session/store.ts`, `src/utils/session/migration.ts`, `src/utils/session/params.ts`, `src/utils/session/crypto.ts`, `src/utils/session/index.ts` — session module (barrel export added in commit `0af3f8c` per review feedback)
- `src/schema/session.schema.ts` — `SessionFile` Zod schema
- `schemas/session-file.schema.json` — JSON Schema export
- `tests/session-index.test.ts`, `tests/session-schema.test.ts`, `tests/session-store.test.ts`, `tests/migration.test.ts`, `tests/config.test.ts` — new test files for the refactored modules
- `tests/fixtures/legacy-session/` — generic migration fixture (synthetic, per review feedback)

**Modified files (representative):**
- `src/tools/workflow-tools.ts` — every authenticated tool migrated to `session_index`; `start_session` restructured for fresh + resume + migration
- `src/tools/resource-tools.ts` — same `session_token` → `session_index` migration
- `src/trace.ts` — `withAuditLog` re-resolves `session_index` on every call
- `src/config.ts` — workspace argument plumbing
- `src/logging.ts`, `src/server.ts`, `src/index.ts` — boot-time wiring for `workspaceDir`
- `tests/mcp-server.test.ts` — large rewrite to exercise the new API surface end-to-end
- `docs/api-reference.md`, `docs/architecture.md`, `docs/checkpoint_model.md`, `docs/dispatch_model.md`, `docs/state_management_model.md`, `docs/development.md`, `docs/workflow-fidelity.md`, `docs/artifact_management_model.md`, `docs/resource_resolution_model.md`, `schemas/README.md` — doc-freshness sweep
- `.gitmodules` — workflows submodule retargeted to `feat/115-server-managed-session-state-meta` for review (to be reverted to `branch = workflows` after merging both PRs)

**Removed files:**
- `src/utils/session.ts` — replaced by `src/utils/session/*` module
- `src/schema/state.schema.ts` and `schemas/state.schema.json` — `StateSaveFileSchema` retired
- `tests/dispatch.test.ts`, `tests/session.test.ts` — replaced by the new test files above
- `docs/interceptor-recipe.md` — interceptor sunset

---

## Success Criteria Results

All 18 success criteria from `02-design-philosophy.md` §6 are satisfied. Each was verified by a mix of code-level grep gates, explicit test-case anchoring, and inspection of removed operations. Full case-by-case verification is in [`10-validation-report.md`](10-validation-report.md).

| SC | Description | Status |
|----|-------------|--------|
| SC-1 | No agent-side token threading | ✅ Pass (only 2 hits remain in JSDoc comments referencing migration context) |
| SC-2 | No agent-side state writes | ✅ Pass (persist operation removed in Phase 8.1) |
| SC-3 | Atomic state + seal write | ✅ Pass (TC-13, TC-14) |
| SC-4 | Tampering detected | ✅ Pass (TC-17, TC-18) |
| SC-5 | Nested parents recursive | ✅ Pass (TC-24, TC-30) |
| SC-6 | Resume is one call | ✅ Pass (TC-26, TC-27) |
| SC-7 | Idempotent index derivation | ✅ Pass (TC-06, TC-28) |
| SC-8 | Server restart transparent | ✅ Pass (TC-54, TC-59) |
| SC-9 | Migration converter idempotent | ✅ Pass (TC-56, TC-59) |
| SC-10 | Collision policy deterministic | ✅ Pass (TC-11) |
| SC-11 | Documentation reflects new model | ✅ Pass (zero refs to `session_token` in `docs/`, `schemas/README.md`, top-level markdown) |
| SC-12 | `withAuditLog` re-resolution | ✅ Pass (TC-37, TC-38) |
| SC-13 | Dead-code removal clean | ✅ Pass (Phase 10.2) |
| SC-14 | Build + tests green | ✅ Pass (315 / 2 skipped) |
| SC-15 | Phase 8 TOON cleanup | ✅ Pass (zero refs to retired operations/rules/variables) |
| SC-16 | Migration converter full coverage | ✅ Pass (TC-51 .. TC-58) |
| SC-17 | Back-compat error for legacy parameter | ✅ Pass (TC-60) |
| SC-18 | Interceptor sunset | ✅ Pass (Phase 10.3 attestation) |

---

## What Was NOT Implemented

The five non-goals from `02-design-philosophy.md` §5 are explicit v2 deferrals:

- ❌ **Cross-workspace sessions** — Each server instance is workspace-scoped. A session spanning two workspaces is out of scope; the migration path for such cases is a separate design.
- ❌ **Encryption of session state at rest** — `session.json` is plain JSON; `.session-token` is plain HMAC-hex. The seal mechanism is forward-compatible (encrypt-then-MAC) if confidentiality becomes part of the threat model.
- ❌ **Per-agent authentication** — Anything with workspace-write access and the ability to call the MCP server is treated as the legitimate agent. No per-agent identity or revocation.
- ❌ **Multi-tenant servers** — One server instance, one workspace, one user.
- ❌ **NFS support** — Atomic-rename semantics on NFS are filesystem-dependent; the design assumes a local filesystem with `rename(2)` semantics.

The strategic review also identified three Informational follow-ups (non-blocking):

- ℹ **Parent-chain depth warning threshold** — The current threshold of 5 is heuristic; revisit if real workflows routinely exceed it.
- ℹ **Per-call enumeration cost** — `resolveSessionIndex` scans the workspace's planning folders on every authenticated call. At realistic session counts this is fine; revisit if profiling shows it dominate per-call latency.
- ℹ **Planning-bump commit messages** — Several `chore: bump * submodule pointer` commits could carry more specific subjects; cosmetic.

---

## Design Decisions

Detailed rationale, alternatives considered, and trade-offs are in **[ADR-0003](../../adr/0003-server-managed-session-state.md)**. The key decisions in brief:

### Decision 1: Six-character `session_index` as the agent-visible handle
**Context:** Long opaque token transcription drift was the dominant failure mode.
**Decision:** Six-character base32 string derived from `HMAC-SHA256(realpath(folder_path), secret_key)[0..4]`.
**Rationale:** 30 bits is enough for collision tolerance at realistic session counts; six characters survive transcription across tool calls; deterministic over folder path so resume needs no agent caching.
**Alternatives:** Keep long opaque token (rejected — does not solve transcription); use folder slug as handle (rejected — slugs collide across workspaces); UUID (rejected — too long).

### Decision 2: One canonical state file, server-owned, sealed by HMAC
**Context:** Old dual-store design split state between token and `workflow-state.json`, agent-written.
**Decision:** `session.json` is the canonical state, written only by the server; `.session-token` is a raw HMAC-SHA256 hex seal over its bytes.
**Rationale:** Co-locates write authority and integrity authority; collapses token-as-state and file-as-state into one record; tampering surfaces as fail-fast on the next call.
**Alternatives:** Keep dual model (rejected — root cause of all five frictions); in-memory registry (rejected — breaks restart transparency); database (rejected — overkill, deployment burden).

### Decision 3: Recursive `parentSession`
**Context:** Old `SessionPayload` flattened the parent chain into four fields; grandparent dispatch unrepresentable.
**Decision:** `parentSession` is the same shape as the session it lives inside, recursively (`z.lazy()`), with no depth ceiling.
**Rationale:** First-class nested dispatch; no information loss; preserves agent-side reasoning about ancestor context.
**Alternatives:** Keep flattened single-level (rejected — primary friction #3); array of ancestors (rejected — schema asymmetry).

### Decision 4: Single `start_session(planning_slug, agent_id)` for fresh + resume
**Context:** Resume previously required the agent to read `.session-token` and pass it under the canonical parameter name.
**Decision:** One tool call; server decides fresh vs resume by file existence.
**Rationale:** Eliminates the file-shaped-knowledge foot-gun; matches the agent's natural seam (the planning folder).
**Alternatives:** Separate `resume_session` tool (rejected — extra cognitive load); agent reads `.session-token` directly (rejected — foot-gun).

### Decision 5: Migration converter — detect-on-read, in-place, idempotent, clean cutover
**Context:** In-flight workflows have legacy `(workflow-state.json, .session-token)` pairs.
**Decision:** On the first authenticated call against a planning folder, detect legacy artifacts and convert in place. Remove legacy files after successful conversion. Idempotent re-runs short-circuit.
**Rationale:** Zero-touch for users with in-flight workflows; clean cutover so the read path does not have to support both formats indefinitely.
**Alternatives:** Dual-read period (rejected — extends read complexity); manual migration tool (rejected — friction for in-flight users).

### Decision 6: Strip planning-related references from merged source
**Context:** Source and tests carried `Phase N`, `PR116-TC-XX`, `PD-N`, `SC-N` comments and the migration fixture hardcoded this work package's actual planning folder.
**Decision:** Strip all such references; replace fixture paths with synthetic placeholders.
**Rationale:** Source must survive after the PR merges; planning references belong in the PR description and planning artefacts, not in merged code.
**Alternatives:** Keep references as historical annotations (rejected — review feedback item #1 in commit `ad23820`).

### Decision 7: Group session-related utilities under `src/utils/session/`
**Context:** Six session-related files were siblings at `src/` root with no grouping.
**Decision:** Group under `src/utils/session/` with a barrel export (`index.ts`).
**Rationale:** Makes the module boundary explicit; no logic change.
**Alternatives:** Leave flat (rejected — review feedback item #2 in commit `0af3f8c`).

---

## Lessons Learned

### What Went Well

- **Phased implementation matched problem decomposition.** Phases 1–9 mapped to distinct architectural layers (config, primitives, schema, API swap, dispatch, audit, meta-workflow, migration). Each phase landed independently green; no cross-phase rollbacks were needed.
- **`PR116-TC-NN` IDs anchored test plan to test source during development.** Even though the IDs were stripped before merge per review feedback, they were valuable during the implementation cycle for tracking coverage against the test plan. The cost of stripping was small (one commit).
- **`SessionFile` Zod schema as single source of truth.** Replacing TOON-rule-enforced schema with code-enforced schema eliminated an entire category of drift bugs and made validation errors actionable.
- **Detect-on-read migration converter.** Zero-touch for users with in-flight workflows; no separate migration tool to discover, no transition window to manage.

### What Could Be Improved

- **Submodule branch tracking caused review-time friction.** The workflows submodule was pointing at the long-lived `workflows` branch while the feature work for #115 lived on `feat/115-server-managed-session-state-meta`. Reviewers needed the in-flight meta-workflow changes visible alongside the parent-repo changes; resolving this required opening PR #117 and a `.gitmodules` retarget that must be reverted post-merge. **Future work-packages affecting both repos should plan the submodule retarget at branch-creation time, not at review time.**
- **Planning references leaked into source and tests.** Even though they were intended to be stripped, they accumulated through the implementation phases and were caught only at review. **Future implementation skills should keep planning-side annotations out of merged source from the start** (or use a comment marker that grep can strip in a single commit, with the marker discipline enforced in the implement skill).
- **Migration fixture hardcoded a real workspace path.** The original migration test fixture used this very work package's planning folder (per requirement R1: "the migration converter must handle this work package's own legacy state"). That was useful for the implementation cycle, but the merged fixture had to be synthesised generically. **Synthetic fixtures should be the default; real-folder coverage can live in an integration test that is excluded from the merged test suite if needed.**
- **`workflow-state.json` fields not deterministically ordered before sealing.** Not an issue in practice (Node's stable JSON.stringify is deterministic for plain objects), but worth pinning explicitly in the schema layer to defend against future serialiser changes.

### Lessons for Future Work Packages

- When a refactor crosses repositories (parent + submodule), open both PRs together and retarget the submodule branch from the start.
- Planning-side cross-references (Phase / TC / PD / SC IDs) are valuable during implementation but must not survive to merge. Treat them like `// TODO` markers: useful temporarily, removed before review.
- For breaking schema changes, the back-compat path should be "clear error with parameter-name guidance," not silent acceptance. The TC-60 pattern (caller passes `session_token`, gets a clear pointer at `session_index`) caught at least three hand-update misses during development.
- A single canonical state file + HMAC seal is a forceful pattern for eliminating dual-store drift bugs. Apply when state is small enough to fit in one file and when the integrity check is cheap (HMAC of < 100 KB is trivially fast).

---

**Status:** ✅ COMPLETE AND TESTED — PR [#116](https://github.com/m2ux/workflow-server/pull/116) approved and awaiting merge.
