# Change Block Index

**PR:** [#60](https://github.com/m2ux/workflow-server/pull/60)  
**Branch:** `enhancement/59-rename-mcp-tools`  
**Base:** `main`  
**Diff stats:** 19 files changed, +1115/−372 lines  
**Commits:** 30  
**Tests:** 137/137 passing, typecheck clean  
**Generated:** 2026-03-25

---

## Summary of Changes

This PR started as a two-tool rename and expanded into a session management redesign:

- **Removed 6 tools** (17 → 14): `match_goal`, `get_activities`, `get_rules`, old `get_activity`, `get_skills`, `list_skills`
- **Renamed 2 tools**: `get_workflow_activity` → `get_activity`, `list_workflow_resources` → `list_resources`
- **Added 2 tools**: `help` (self-describing bootstrap), `start_session` (returns rules + workflow + opaque token)
- **Session token**: Base64url payload + HMAC-SHA256 signature, carrying wf/act/skill/seq/ts
- **4 validators**: workflow consistency, activity transition, skill association, version drift — warnings in `_meta.validation`
- **Step completion manifest**: Optional `step_manifest` on `get_activity` and `validate_transition`
- **Encrypted at-rest**: Session token encrypted via AES-256-GCM in state files

---

## File Index

| Row | Path | +/− | Category |
|-----|------|-----|----------|
| 1 | `src/utils/session.ts` | +82 (new) | Session token — create, decode, advance, HMAC sign/verify |
| 2 | `src/utils/crypto.ts` | +58 (new) | AES-256-GCM encrypt/decrypt, HMAC helpers, server key management |
| 3 | `src/utils/validation.ts` | +118 (new) | 4 validators + step manifest validation + buildValidation helper |
| 4 | `src/tools/resource-tools.ts` | +40/−89 | Remove 5 tools, add start_session, session token to get_skill/list_resources/get_resource/discover_resources |
| 5 | `src/tools/workflow-tools.ts` | +125/−30 | Add help tool, session token to get_workflow/get_activity/get_checkpoint/validate_transition, step manifest support |
| 6 | `src/tools/state-tools.ts` | +27/−12 | Session token params, encrypt token on save, decrypt on restore |
| 7 | `src/server.ts` | +3/−3 | Update registered tool name list (17 → 14 entries) |
| 8 | `src/loaders/activity-loader.ts` | +2/−2 | `next_action.tool`: `get_rules` → `start_session` |
| 9 | `tests/mcp-server.test.ts` | +315/−106 | Full rewrite: session token lifecycle, validation, step manifest, old-tool-removed checks |
| 10 | `tests/session.test.ts` | +139 (new) | Unit tests: createSessionToken, decodeSessionToken, advanceToken, HMAC integrity |
| 11 | `tests/skill-loader.test.ts` | +1/−1 | Tool name assertion: `get_workflow_activity` → `get_activity` |
| 12 | `docs/api-reference.md` | +79/−77 | Rewritten tool tables, session protocol section, step manifest docs |
| 13 | `docs/ide-setup.md` | +18/−19 | Bootstrap steps rewritten, tool quick reference updated |
| 14 | `README.md` | +19/−18 | Architecture section rewritten, execution model replaced, activity count updated |
| 15 | `AGENTS.md` | +1/−1 | Boundary instruction: `get_rules` → `start_session` |
| 16 | `SETUP.md` | +1/−1 | Bootstrap instruction: `get_rules` → `start_session` |
| 17 | `schemas/README.md` | +1/−1 | Activity matching reference: `get_activities` → `list_workflows` + `start_session` |
| 18 | `.cursor/rules/workflow-server.mdc` | +1/−4 | Bootstrap rule simplified to single `help` tool call |
| 19 | `.engineering` | +1/−1 | Submodule pointer update |

---

## Change Block Detail

### Row 1 — `src/utils/session.ts` (new file, 82 lines)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 1–82 | Full file: `SessionPayload` interface (wf/act/skill/v/seq/ts), `SessionAdvance` interface, private `encode`/`decode` with HMAC sign/verify, public `createSessionToken`, `decodeSessionToken`, `advanceToken`, `sessionTokenParam` Zod schema |

### Row 2 — `src/utils/crypto.ts` (new file, 58 lines)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 1–58 | Full file: AES-256-GCM constants, `getOrCreateServerKey` (reads/creates `~/.workflow-server/secret`), `encryptToken`/`decryptToken` (iv:authTag:ciphertext hex format), `hmacSign`/`hmacVerify` (constant-time comparison) |

### Row 3 — `src/utils/validation.ts` (new file, 118 lines)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 1–118 | Full file: `ValidationResult` type, `validateWorkflowConsistency` (token wf vs explicit wf), `validateActivityTransition` (token act vs workflow transitions), `validateSkillAssociation` (skill declared by activity), `validateWorkflowVersion` (token v vs current version), `StepManifestEntry` type, `validateStepManifest` (missing/unexpected/order/empty-output checks), `buildValidation` (variadic warnings aggregator) |

### Row 4 — `src/tools/resource-tools.ts` (33 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1–4 | 6–13 | Imports: drop activity-loader/skill-index imports, add session/validation/crypto imports |
| 5–9 | 15–43 | **Remove** `get_activities`, `get_activity`, `get_rules` tools; **add** `start_session` tool (loads workflow + rules, creates session token, returns combined response) |
| 10–11 | 47–55 | **Remove** `get_skills` and `list_skills` tools |
| 12–18 | 57–96 | Rewrite `get_skill`: add `sessionTokenParam`, decode token, run workflow consistency/version/skill-association validators, return `_meta` with updated token + validation |
| 19–22 | 103–131 | Rename `list_workflow_resources` → `list_resources`: add session token, decode, workflow consistency validation, return `_meta` |
| 23–26 | 135–155 | `get_resource`: add session token, decode, workflow consistency validation, return `_meta` |
| 27–33 | 156–166 | `discover_resources`: add session token, decode, restructure output (activities → bootstrap), remove per-item tool suggestions, return `_meta` |

### Row 5 — `src/tools/workflow-tools.ts` (10 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1–3 | 6–57 | Imports: add session/validation. Define `stepManifestSchema` (Zod). **Add** `help` tool (returns bootstrap procedure + session protocol + available workflows). Update `list_workflows` description. |
| 4–5 | 60–71 | `get_workflow`: add session token, decode, workflow consistency + version validators, return `_meta` |
| 6–7 | 74–106 | Rename `get_workflow_activity` → `get_activity`: add session token + `step_manifest` param, decode, step manifest validation, activity transition + workflow consistency + version validators, return `_meta` |
| 8 | 109–117 | `get_checkpoint`: add session token, decode, workflow consistency + version validators, return `_meta` |
| 9 | 122–156 | `validate_transition`: add session token + `step_manifest` param, decode, step manifest validation, workflow consistency + version validators, return `_meta` |
| 10 | 162–167 | `health_check`: reformat content output (cosmetic, no session token added) |

### Row 6 — `src/tools/state-tools.ts` (9 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 9–11 | Imports: add session, validation, crypto utilities |
| 2–5 | 23–32 | `save_state`: add `sessionTokenParam` to schema, decode token |
| 5 | 40–45 | Encrypt session token in state variables via AES-256-GCM before writing |
| 6–7 | 71–87 | `save_state` response: return `_meta` with updated token + validation. `restore_state`: add session token param, decode |
| 8–9 | 94–105 | `restore_state`: decrypt session token from state variables on restore, return `_meta` |

### Row 7 — `src/server.ts` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 21–23 | Tool registration list updated: remove `get_activities`, `get_rules`, `get_skills`, `list_skills`, `get_workflow_activity`, `list_workflow_resources`; add `help`, `start_session`; rename to `get_activity`, `list_resources` |

### Row 8 — `src/loaders/activity-loader.ts` (2 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 272 | `usage` string: `get_rules` → `start_session` |
| 2 | 274 | `next_action.tool`: `get_rules` → `start_session` |

### Row 9 — `tests/mcp-server.test.ts` (52 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1–3 | 10–22 | Add `sessionToken` variable. Create session in `beforeAll` via `start_session` call |
| 4–5 | 30–58 | **New** `help` test suite: validates bootstrap/session_protocol structure. **Updated** `list_workflows` test: renamed, removed detailed assertions |
| 6–8 | 60–64 | Whitespace/formatting cleanup |
| 9 | 71–119 | **New** `start_session` test suite (returns rules/workflow/token, rejects unknown workflow_id). **New** session token lifecycle suite (opaque, _meta returned, reject missing/invalid token, health_check exempt) |
| 10 | 124–167 | **New** old-tool-removed suite (`get_activities`, `get_rules`, `match_goal` all rejected). **Updated** `get_workflow` tests: add session_token, simplify assertions |
| 11–15 | 169–179 | Formatting/whitespace adjustments around test transitions |
| 16–29 | 183–255 | `get_activity` (renamed from `get_workflow_activity`), `get_checkpoint`, `validate_transition`, `list_resources` (renamed from `list_workflow_resources`): all tests add `session_token`, simplify assertions |
| 30–51 | 259–478 | `get_resource`, `discover_resources` updated. **New** `token validation` suite (workflow mismatch warning, invalid transition warning, valid transition with manifest, warnings non-blocking). **New** `step completion manifest` suite (no manifest warning, missing steps, wrong order, non-blocking) |

### Row 10 — `tests/session.test.ts` (new file, 139 lines)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 1–139 | Full file: `createSessionToken` (opaque output, encodes wf/v/act/skill/seq, sets ts), `decodeSessionToken` (roundtrip, rejects garbage/empty/tampered/wrong-structure), `advanceToken` (increments seq, updates act/skill, preserves fields, produces different strings, valid HMAC), token opacity + HMAC (no readable wf in b64, dot separator, rejects modified signature) |

### Row 11 — `tests/skill-loader.test.ts` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 89 | Assertion: `get_workflow_activity` → `get_activity` |

### Row 12 — `docs/api-reference.md` (32 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1–3 | 5–14 | Section header: "Workflow Tools" → "Bootstrap Tools". Tool table rewritten: `help`, `list_workflows`, `start_session`, `health_check` |
| 4–6 | 16–29 | "Activity Tools" and "Rules Tools" sections removed. New "Workflow Tools" section with session_token required. `get_workflow`, `get_activity` (with step_manifest), `get_checkpoint`, `validate_transition` |
| 7–8 | 35–36 | Skill tools table: `get_skills`/`list_skills` removed; `get_skill` now takes session_token + workflow_id (required) |
| 9–10 | 42–44 | Resource tools: renamed, session_token added |
| 11–12 | 46–53 | Discovery tool: session_token added. **New** "State Tools" section: `save_state`/`restore_state` |
| 13–18 | 55–85 | **Replaced** Activities/Skills prose with "Session Token" section: lifecycle (5-step), validation (6 checks), step completion manifest (JSON example), token-exempt tools |
| 19–26 | 87–118 | Skills section trimmed: removed meta workflow details, skill contents list, cross-workflow triggering. Kept resolution and key skills |
| 27–32 | 123–139 | Workflow table updated (activity count 11 → 14). Removed workflow types and cross-workflow triggering subsections |

### Row 13 — `docs/ide-setup.md` (5 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 6 | Rule text: 5-line bootstrap → single `help` tool instruction |
| 2 | 11–17 | 7-step bootstrap rewritten: help → list_workflows → start_session → get_workflow → get_activity → get_skill → execute (with token protocol) |
| 3–4 | 29–37 | Tool quick reference table: removed `get_rules`/`get_activities`/`list_skills`; added `help`/`start_session`/`get_checkpoint`/`validate_transition`/`save_state`/`restore_state`/`health_check`; renamed entries |
| 5 | 40–41 | Added token-exempt note for `save_state`/`restore_state` |

### Row 14 — `README.md` (7 blocks)

| Block | Lines | Description |
|-------|-------|-------------|
| 1–3 | 18–25 | Introduction rewritten: removed 3-step agent flow, added "How It Works" (4-step: discover/start/navigate/execute) |
| 4–5 | 27–39 | "Execution Model" (problem/solution domain) replaced with ASCII architecture diagram + bullet descriptions of workflows/activities/skills/tools |
| 6 | 45 | Workflow table: activity count `11` → `14` |
| 7 | 110 | Fallback bootstrap instruction: `get_rules` → `start_session` |

### Row 15 — `AGENTS.md` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 32 | Boundary instruction: `get_rules` → `start_session` |

### Row 16 — `SETUP.md` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 75 | Bootstrap instruction: `get_rules` → `start_session` |

### Row 17 — `schemas/README.md` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 1187 | Activity matching: `get_activities` → `list_workflows` and `start_session` |

### Row 18 — `.cursor/rules/workflow-server.mdc` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 8 | Bootstrap rule: 5-line multi-step → single line `call the help tool` |

### Row 19 — `.engineering` (1 block)

| Block | Lines | Description |
|-------|-------|-------------|
| 1 | 1 | Submodule pointer update (commit hash change) |

---

## Priority Review Targets

1. **`src/utils/session.ts`** (Row 1) — Core session token logic. HMAC signing, base64url encoding, advance semantics.
2. **`src/utils/crypto.ts`** (Row 2) — Server key management, AES-256-GCM encrypt/decrypt, constant-time HMAC comparison.
3. **`src/utils/validation.ts`** (Row 3) — All 4 validators + step manifest validation. Determines warning behavior.
4. **`src/tools/resource-tools.ts`** (Row 4) — Highest churn file. `start_session` tool, 5 tool removals, session token plumbing.
5. **`src/tools/workflow-tools.ts`** (Row 5) — `help` tool, `get_activity` with step manifest, `validate_transition` with step manifest.
6. **`src/tools/state-tools.ts`** (Row 6) — Token encryption/decryption at rest.
7. **`tests/mcp-server.test.ts`** (Row 9) — Full integration test rewrite with session lifecycle, validation, manifest coverage.
8. **`tests/session.test.ts`** (Row 10) — Unit test coverage for session token utilities.

Rows 7–8, 11–19 are mechanical string replacements or doc updates — low risk.
