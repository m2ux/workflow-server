# Change Block Index

**PR:** [#60](https://github.com/m2ux/workflow-server/pull/60)  
**Branch:** `enhancement/59-rename-mcp-tools`  
**Base:** `main`  
**Diff stats:** 20 files changed, +1336/−374 lines  
**Commits:** 36  
**Tests:** 145/145 passing, typecheck clean  
**HEAD:** `4067e23`  
**Generated:** 2026-03-25 (post-impl review; supersedes index at `1a18129`)

---

## Summary of Changes

This PR delivers MCP tool renames, session handling, and validation aids:

- **Removed tools** (vs. pre-PR surface): `match_goal`, `get_activities`, `get_rules`, legacy `get_activity`, **`get_skills`**, **`list_skills`**
- **Renamed tools**: `get_workflow_activity` → **`get_activity`**, `list_workflow_resources` → **`list_resources`**
- **Added tools**: `help`, `start_session`, **`next_activity`** (transition list with conditions from `token.act`)
- **Session token (validation aid)**: Explicit `workflow_id` / `activity_id` (and related params) restored on tools; token records last call context. **HMAC-SHA256** over base64url payload (`wf`, `act`, `skill`, `v`, `seq`, `ts`). Returned/updated via `_meta.session_token`
- **Four validators** (+ step manifest): workflow consistency, activity transition, skill–activity association, version drift; **`validateStepManifest`** for optional `step_manifest` on `get_activity` / `validate_transition`; warnings in `_meta.validation`
- **`get_workflow`**: **`summary` defaults to `true`** (lightweight metadata); `summary=false` returns full definition
- **Encrypted at-rest**: Session token encrypted via AES-256-GCM in state files
- **Loader**: Workflow/activity loading and **`getTransitionList`** live in **`workflow-loader.ts`** (consumed by `next_activity` and validation)

---

## File Index

| Row | Path | +/− | Category |
|-----|------|-----|----------|
| 1 | `tests/mcp-server.test.ts` | +460/−93 | Integration tests: session token, validation, step manifest, `next_activity`, `get_workflow` summary, removed tools |
| 2 | `docs/api-reference.md` | +77/−80 | Tool tables, session protocol, step manifest, `next_activity`, summary default |
| 3 | `src/tools/workflow-tools.ts` | +182/−21 | `help`, `get_workflow` + `summary`, `get_activity`, `validate_transition`, **`next_activity`**, token + validation |
| 4 | `src/tools/resource-tools.ts` | +96/−123 | `start_session`, `get_skill`, `list_resources` / `get_resource` / `discover_resources`; removed skill list tools |
| 5 | `src/utils/validation.ts` | +118 (new) | Four validators + `validateStepManifest` + `buildValidation` |
| 6 | `src/utils/session.ts` | +82 (new) | Payload, encode/decode with **HMAC**, `createSessionToken`, `decodeSessionToken`, `advanceToken` |
| 7 | `src/utils/crypto.ts` | +58 (new) | Server key, AES-256-GCM, `hmacSign` / `hmacVerify` |
| 8 | `tests/session.test.ts` | +139 (new) | Unit tests for session token + HMAC |
| 9 | `README.md` | +20/−17 | Architecture / execution model, bootstrap, tool counts |
| 10 | `docs/ide-setup.md` | +20/−20 | Bootstrap steps, tool reference, token notes |
| 11 | `src/tools/state-tools.ts` | +34/−5 | `save_state` / `restore_state`: token param, encrypt/decrypt at rest, `_meta` |
| 12 | `src/loaders/workflow-loader.ts` | +39 | `loadWorkflow`, `listWorkflows`, getters, **`getTransitionList`**, `validateTransition` |
| 13 | `src/server.ts` | +3/−3 | Registered tool list (**15** tools including `next_activity`) |
| 14 | `src/loaders/activity-loader.ts` | +2/−2 | `next_action.tool`: `get_rules` → `start_session` |
| 15 | `.cursor/rules/workflow-server.mdc` | +1/−5 | Bootstrap rule → `help` |
| 16 | `.engineering` | +1/−1 | Submodule pointer |
| 17 | `AGENTS.md` | +1/−1 | `get_rules` → `start_session` |
| 18 | `SETUP.md` | +1/−1 | Bootstrap: `get_rules` → `start_session` |
| 19 | `schemas/README.md` | +1/−1 | Activity matching: `get_activities` → `list_workflows` + `start_session` |
| 20 | `tests/skill-loader.test.ts` | +1/−1 | Tool name: `get_workflow_activity` → `get_activity` |

---

## Change Block Detail

### Row 1 — `tests/mcp-server.test.ts` (613 lines)

| Block | Description |
|-------|-------------|
| Setup | `sessionToken` / `beforeAll` via `start_session` |
| `help` | Bootstrap and `session_protocol` shape |
| `start_session` | Rules, workflow stub, token; unknown workflow rejection |
| Token lifecycle | Opaque token, `_meta` on tools, reject missing/invalid token; exempt tools |
| Removed tools | `get_activities`, `get_rules`, `match_goal`, **`get_skills`**, **`list_skills`** rejected |
| `get_workflow` | **`summary` default** vs full workflow; session + validation |
| `get_activity` / checkpoint / transition / resources | Renamed tools, `session_token`, **`step_manifest`** warnings |
| **`next_activity`** | Transition list from `token.act`; requires prior activity |
| `get_resource` / `discover_resources` | Token + validation |
| Token validation suites | Workflow mismatch, invalid transition, manifest cases |
| Step manifest suites | Missing steps, order, non-blocking warnings |

### Row 2 — `docs/api-reference.md`

| Block | Description |
|-------|-------------|
| Bootstrap / workflow / skill / resource / state tables | Renamed tools, session params, removed list skills |
| Session token section | Lifecycle, validation checks, manifest JSON, exempt tools |
| **`next_activity`** | Documented transition list + conditions |
| **`get_workflow`** | **`summary` default** documented |

### Row 3 — `src/tools/workflow-tools.ts` (215 lines)

| Block | Lines (approx.) | Description |
|-------|-----------------|-------------|
| Imports + `stepManifestSchema` | 1–14 | Loader + session + validation |
| `help` | 18–47 | Bootstrap + `session_protocol` (explicit params + validation copy) |
| `list_workflows` | 49–52 | Unchanged pattern |
| `get_workflow` | 54–93 | **`summary` default true**; summary object vs full JSON; token advance |
| `get_activity` | 95–128 | Explicit ids + `step_manifest`; transition + manifest validators |
| `get_checkpoint` | 130–153 | Token + consistency + version |
| `validate_transition` | 155–178 | `step_manifest` optional; manifest validation when present |
| **`next_activity`** | 180–203 | `getTransitionList`, `current_activity`, requires `token.act` |
| `health_check` | 205–214 | No session token |

### Row 4 — `src/tools/resource-tools.ts` (169 lines)

| Block | Description |
|-------|-------------|
| `start_session` | Rules + workflow metadata + `createSessionToken` |
| `get_skill` | Explicit `workflow_id` + token; **skill association** + version validators |
| `list_resources` / `get_resource` / `discover_resources` | Renamed from `list_workflow_resources` pattern; token + validation |

### Row 5 — `src/utils/validation.ts` (118 lines)

| Block | Description |
|-------|-------------|
| Full file | `validateWorkflowConsistency`, `validateActivityTransition` (uses `getValidTransitions`), `validateSkillAssociation`, `validateWorkflowVersion`, **`validateStepManifest`**, `buildValidation` |

### Row 6 — `src/utils/session.ts` (82 lines)

| Block | Description |
|-------|-------------|
| Full file | `SessionPayload` (`wf`, `act`, `skill`, `v`, `seq`, `ts`); **HMAC** sign/verify on `base64url.payload`; `createSessionToken`, `decodeSessionToken`, `advanceToken`, `sessionTokenParam` |

### Row 7 — `src/utils/crypto.ts` (58 lines)

| Block | Description |
|-------|-------------|
| Full file | `~/.workflow-server/secret`, AES-256-GCM for token at rest, **HMAC** helpers with constant-time verify |

### Row 8 — `tests/session.test.ts` (139 lines)

| Block | Description |
|-------|-------------|
| Full file | Roundtrip, tamper rejection, `advanceToken`, **HMAC** integrity |

### Row 9 — `README.md`

| Block | Description |
|-------|-------------|
| Intro / diagram / table | Tool and activity counts, bootstrap to `start_session` / `help` |

### Row 10 — `docs/ide-setup.md`

| Block | Description |
|-------|-------------|
| Rules + steps + table | `help`, token on subsequent calls, renamed tools |

### Row 11 — `src/tools/state-tools.ts` (108 lines)

| Block | Description |
|-------|-------------|
| `save_state` / `restore_state` | Token encrypt/decrypt in variables; `_meta` |

### Row 12 — `src/loaders/workflow-loader.ts` (227 lines)

| Block | Lines (approx.) | Description |
|-------|-----------------|-------------|
| Activity loading + `loadWorkflow` | 1–129 | Directory vs inline activities, validation |
| `listWorkflows` | 131–157 | Manifest discovery |
| Getters + transitions | 159–178 | `getActivity`, `getCheckpoint`, `getValidTransitions` |
| **`getTransitionList`** + `conditionToString` | 180–217 | **Transition list with conditions** for `next_activity` |
| `validateTransition` | 219–226 | Shared with MCP tool |

### Row 13 — `src/server.ts`

| Block | Description |
|-------|-------------|
| Logged tool list | Includes **`next_activity`**; 15 tools total |

### Rows 14–20 — Mechanical / small

| Row | Description |
|-----|-------------|
| 14 | `activity-loader` usage / `next_action` → `start_session` |
| 15–19 | Doc/rule/submodule string updates |
| 20 | Skill loader assertion rename |

---

## Priority Review Targets

1. **`src/utils/session.ts`** (Row 6) — HMAC signing, decode/verify, advance semantics  
2. **`src/utils/crypto.ts`** (Row 7) — Key file, AES-256-GCM, constant-time HMAC verify  
3. **`src/utils/validation.ts`** (Row 5) — All validators + **step manifest** behavior  
4. **`src/loaders/workflow-loader.ts`** (Row 12) — **`getTransitionList`** / condition stringification (feeds **`next_activity`**)  
5. **`src/tools/workflow-tools.ts`** (Row 3) — **`get_workflow` summary default**, **`next_activity`**, manifest on `get_activity`  
6. **`src/tools/resource-tools.ts`** (Row 4) — `start_session`, **`get_skill`** association checks  
7. **`src/tools/state-tools.ts`** (Row 11) — Token encryption at rest  
8. **`tests/mcp-server.test.ts`** (Row 1) — Integration coverage for the above  

Rows 13–20 are mostly registration, loader hints, or documentation — lower risk.

---

## checkpoint_pending

**file-index-table (BLOCKING)** — Manual diff review against `main...HEAD` using the table above. Confirm high-churn rows (1–12) and doc alignment (2, 9–10) before closing the post-impl review.

Suggested command for line-by-line review:

```bash
git diff main...HEAD -- tests/mcp-server.test.ts src/tools/workflow-tools.ts src/tools/resource-tools.ts src/utils/
```

When satisfied, dismiss this checkpoint from the work-package workflow UI (do not proceed on assumption if the checkpoint was skipped).
