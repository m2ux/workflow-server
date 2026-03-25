# Completion Summary — Issue #59 / PR #60

**Date:** 2026-03-25  
**Issue:** [#59](https://github.com/m2ux/workflow-server/issues/59)  
**PR:** [#60](https://github.com/m2ux/workflow-server/pull/60) — merged `2026-03-25T12:22:28Z`

---

## Deliverables summary

The work package delivered a **session-first MCP tool model** for workflow-server, not only renaming confusing entry points but also wiring **opaque, HMAC-signed session tokens** through the tool surface, **validation-as-warnings** on each call, **AES-256-GCM encryption** for tokens persisted in saved state, and a **`help` bootstrap** that documents the protocol for agents.

Concrete outcomes:

- **`start_session`** replaces `get_rules`, returning rules, workflow metadata, and a session token for the chosen workflow.
- **Discovery** uses **`help`** (bootstrap narrative) and **`list_workflows`** (no token); agents then call **`start_session`** with a `workflow_id`.
- **Token-bearing tools** accept `session_token`, decode/verify it, run domain logic, and return an **advanced** token plus **`_meta.validation`** (warnings only; execution is not blocked by validation).
- **State tools** encrypt `session_token` inside saved TOON state and decrypt on restore.
- **Documentation and tests** were updated to match the final names and session protocol; workflow TOON data and IDE-facing rules were aligned where in scope.

---

## Final tool surface (11 session tools + health_check; 12 registered, down from 17)

`tools/list` exposes **twelve** registered tools (net **five** fewer than the pre-change baseline of **seventeen**). **Eleven** participate in the workflow/session protocol; **`health_check`** is the twelfth—an operational probe that does not use a session token.

| Tool | Role |
|------|------|
| `help` | Bootstrap: how to use the server and session protocol |
| `list_workflows` | Discover workflows (pre-session) |
| `start_session` | Start session: rules + workflow stub + token |
| `get_workflow` | Full or summary workflow definition |
| `get_activity` | Activity detail; accepts transition condition + step manifest for validation |
| `get_checkpoint` | Checkpoint detail |
| `next_activity` | Transition list from token’s current activity |
| `get_skills` | All skills + inlined resources for an activity |
| `get_skill` | Single skill + resources |
| `save_state` / `restore_state` | Persist/resume state with encrypted token at rest |
| `health_check` | Liveness / metadata (no session token) |

Removed or consolidated capabilities from the older surface include goal-matching as a separate tool (replaced by human/agent selection from `list_workflows` + `start_session`), redundant listing tools, and separate resource-discovery tools in favor of **`get_skills`** / **`get_skill`** inlining.

---

## Four-layer enforcement stack

Session correctness is built in four layers (see [06-architecture-summary.md](06-architecture-summary.md)):

1. **Cryptography (`crypto.ts`)** — Server key at `~/.workflow-server/secret`; **HMAC-SHA256** for token integrity; **AES-256-GCM** for token fields at rest in state files.
2. **Session lifecycle (`session.ts`)** — Create signed token; **decode + verify** on each call; **advance** payload (`wf`, `act`, `skill`, monotonic `seq`, etc.) and return updated token in `_meta`.
3. **Stateless validation (`validation.ts`)** — **Workflow consistency**, **activity transition validity**, **skill–activity association**, **version drift**, **step completion manifest** checks, and **transition condition** consistency where applicable. All produce **warnings** aggregated via `buildValidation`; they do not hard-fail normal tool execution.
4. **Tool handlers + audit** — Shared pattern: decode token → work → `buildValidation` → response with **`_meta.session_token`** and **`_meta.validation`**; **`withAuditLog`** records parameters for traceability.

---

## Test coverage

- **149 tests** across **9** test files, all passing after merge (Vitest run at completion time).
- Coverage spans MCP integration (bootstrap, token lifecycle, renamed/removed tools), validation paths, crypto/session helpers, loaders, and state save/restore including encryption round-trips.

---

## Key design decisions

| Topic | Decision |
|--------|-----------|
| Breaking change | **Clean break** — old tool names removed; clients must adopt `help` / `list_workflows` / `start_session` and pass `session_token` on guarded tools. |
| Token semantics | **Opaque signed blob** — agents must not parse or forge tokens; server is source of truth after `start_session`. |
| Validation strictness | **Warnings only** — validators guide agents and reviewers; they are not an authorization gate. |
| Discovery model | **`list_workflows` + goal match by agent** — avoids overloading the word “activity” with a separate `match_goal` tool. |
| Skill loading | **`get_skills`** preferred for one round-trip load of primary/supporting skills and resources; **`get_skill`** retained for single-skill access. |
| Persistence | **Encrypt** `session_token` in variables before writing TOON; **decrypt** on restore so disk never holds plaintext tokens. |
| Bootstrap UX | **`help`** documents the procedure; IDE rules were slimmed to point at **`help`** instead of duplicating full protocol text. |

---

## Deferred and follow-up

| Item | Notes |
|------|--------|
| **Orphaned resources (02 / 13)** | Follow-up to reconcile legacy **MCP resource** or planning references that still assume the pre-merge tool/resource matrix (e.g. stale descriptors or docs tied to old numbering). |
| **Optional step refactoring** | Step manifest validation is in place; a deeper **refactor of step representation** (schema, orchestrator contract, or TOON shape) is **out of scope** for this merge and can be a future package. |
| **Planning / PR narrative** | [07-strategic-review.md](07-strategic-review.md) noted PR body and planning README drift during development; this completion summary and README refresh close the planning-folder gap; PR description on GitHub may still be updated manually for archival clarity. |
| **Further roadmap items** | Plans **10** and **11** in this folder (additional HMAC/manifest hardening, server-side transition evaluation) describe **future** work; not all items were required to close #59. |

---

## Closure

- **PR #60** merged; **issue #59** closed (`2026-03-25T12:22:30Z`).
- This artifact records **what shipped**, **how session enforcement is layered**, and **what was intentionally left for later**.
