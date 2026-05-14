# Tracked Drift — Refresh Workflow-Server Docs

**Work package:** `2026-05-14-refresh-workflow-server-docs`
**Created:** 2026-05-14 (implement)
**Audience:** Maintainer-internal — this is **not** a user-facing doc surface.

---

## Purpose

The refresh in this work package aligns the workflow-server documentation against `main`. At the time of writing, `main` still uses the `session_token` terminology and the HMAC-signed opaque token contract. A separate feature branch (`feat/115-server-managed-session-state`) is in flight that replaces `session_token` with a server-managed `session_index`.

When that branch lands in `main`, every doc reference to `session_token` below will need a follow-up pass to either:

1. **Rename to `session_index`** where the field name is the only thing changing, OR
2. **Rewrite the surrounding paragraph** where the protocol changes (e.g., the HMAC adoption/recovery story disappears because state moves server-side).

This file enumerates every reference so the follow-up pass is mechanical, not investigative.

---

## Files with `session_token` references

Counts taken at commit `d447686` (post-schema-doc refresh). Numbers are total occurrences (each occurrence is a separate phrase or code fence, not a unique mention).

| File | Occurrences | Notes |
|---|---|---|
| `docs/api-reference.md` | 21 | Highest density — every tool entry mentions `session_token` as a required parameter; the "Session Token" reference section is the canonical description. After the merge, this file becomes a near-complete rewrite of that section plus a global rename. |
| `docs/dispatch_model.md` | 8 | Code fences show `start_session({ parent_session_token })` and `get_workflow_status({ session_token })`. After the merge, the parent context handling moves server-side and the code fences shrink to one-parameter calls. |
| `docs/workflow-fidelity.md` | 5 | Layer 1 (Token Integrity) and the `start_session` adoption story dominate the mentions. The merge eliminates HMAC token adoption — this whole section gets reshaped. |
| `docs/checkpoint_model.md` | 5 | `respond_checkpoint`/`resume_checkpoint` flow is described with the `session_token` parameter; updates are mostly mechanical renames. |
| `docs/state_management_model.md` | 3 | Persistence section ("the orchestrator writes the session token … to disk"). After the merge, persistence is server-side and this paragraph is rewritten end-to-end. |
| `docs/api-reference.md` Session Token section | (counted above) | The canonical lifecycle, validation, and checkpoint-enforcement narrative. Becomes the Session Index section after the merge. |
| `schemas/README.md` | 4 | Spot mentions inside the schema ontology examples. Rename pass. |
| `README.md` | 3 | "Skill, Operation & Resource Resolution Architecture" paragraph and the "How It Works" steps reference `session_token` indirectly through the bundled-operations description. Rename pass. |
| `docs/ide-setup.md` | 2 | The bootstrap rule and verification section. Update once the rule wording changes server-side. |
| `docs/resource_resolution_model.md` | 2 | `get_resource({ session_token, ... })` example. Rename pass. |
| `docs/architecture.md` | 2 | Closing paragraphs reference the "session token lifecycle". Rename pass. |
| `docs/development.md` | 2 | "Access via `get_skill { session_token, step_id }`" examples in the Adding Skills section. Rename pass. |

Files with **zero** occurrences (no follow-up needed):

- `SETUP.md`
- `AGENTS.md`
- `CLAUDE.md`
- `schemas/schema-header.md`
- `docs/artifact_management_model.md`
- `docs/orchestra-specification.md`

---

## Follow-up checklist (post-merge)

When `feat/115-server-managed-session-state` lands in `main`:

1. Re-run `grep -rl 'session_token\|session token' README.md SETUP.md AGENTS.md CLAUDE.md docs/ schemas/` from the repo root to recompute the occurrence list above.
2. Confirm the new field name (`session_index`) and the canonical parameter description in `src/tools/resource-tools.ts` (or its replacement).
3. Mechanical rename in the rename-only files listed above.
4. Rewrite the Session Token sections of `docs/api-reference.md`, `docs/workflow-fidelity.md` (Layer 1), and `docs/state_management_model.md` (Persistence) end-to-end to reflect the new protocol.
5. Update the bootstrap rule wording in `docs/ide-setup.md`, `AGENTS.md`, and `CLAUDE.md` if the discover-first protocol changes.
6. Update `schemas/schema-header.md` if the metamodel description changes.
7. Drop this file (or mark it `Resolved`) once the follow-up PR merges.

---

## Why this file exists

We deliberately did **not** translate `session_token` → `session_index` in this work package, because:

- `main` is still on `session_token`. Translating before the merge would make docs disagree with the runtime.
- The new branch is in flight but has not landed. Pre-emptively renaming would either be wrong (if the field name changes again before merge) or stale (if the merge slips).
- A "tracked drift" appendix is cheaper than re-aligning later from scratch.

See `A11` and `A12` in `01-assumptions-log.md` for the design-rationale audit trail.
