# Code Review — PR #60 Session Management Redesign

**Reviewer:** automated (post-impl-review)  
**Date:** 2026-03-25  
**Scope:** All implementation changes across 8 source files  
**Verdict:** Approve with observations (no blockers)

---

## 1. `src/utils/session.ts` — Session Token Utilities

**Overall:** Clean, well-structured module. Good separation of public/private API.

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| S1 | Info | 19–25 | `encode` signs base64url payload with HMAC. Format is `{b64payload}.{hmac_hex}`. No dots in base64url or hex, so the `.` delimiter is unambiguous. Correct. |
| S2 | Info | 28 | `decode` uses `lastIndexOf('.')` — correct given the format guarantees a single dot. |
| S3 | Info | 39–51 | `decode` validates field types manually after JSON.parse. This provides schema enforcement without a Zod dependency in the hot path. Pragmatic choice. |
| S4 | Info | 48–51 | Error wrapping re-throws as `Invalid session token: {original}`. The catch block handles both JSON parse failures and field validation uniformly. |
| S5 | Info | 69–75 | `advanceToken` decodes, mutates the payload, and re-encodes. Safe because `decode` returns a fresh object per call. |
| S6 | Observation | 54–62 | `createSessionToken` sets `ts` (epoch seconds) but no consumer enforces TTL. This is by design per planning doc `08-token-as-validation-aid.md` — the timestamp is informational, not a security gate. |

**No issues found.**

---

## 2. `src/utils/crypto.ts` — Cryptographic Primitives

**Overall:** Correct use of AES-256-GCM and HMAC-SHA256. Two minor findings.

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| C1 | Low | 2 | **Unused import:** `chmod` is imported from `node:fs/promises` but never used anywhere in the file. Dead import — should be removed. |
| C2 | Observation | 14–23 | `getOrCreateServerKey` uses `existsSync` (sync) then async `readFile`. TOCTOU race if two server instances start simultaneously and both see the key file as absent. Low risk for single-instance dev server, but worth noting for production. |
| C3 | Observation | 50–57 | `hmacVerify` implements constant-time comparison manually via XOR loop. Functionally correct. Node.js provides `crypto.timingSafeEqual` as the idiomatic alternative, but the manual implementation is equivalent. |
| C4 | Observation | 43 | `decryptToken`: `decipher.update(ciphertext)` returns a `Buffer` when called with `Buffer` input. The expression `decipher.update(ciphertext) + decipher.final('utf8')` relies on implicit `Buffer.toString()` coercion for the left operand. Works correctly but is non-obvious. Passing explicit encoding (`decipher.update(ciphertext, undefined, 'utf8')`) would be clearer. |
| C5 | Info | 7–8 | Key stored at `~/.workflow-server/secret` with 0o600 permissions. Appropriate for single-user dev context. Directory created with 0o700. Both correct. |

**Action items:** C1 (remove `chmod` import) is trivial cleanup, not blocking.

---

## 3. `src/utils/validation.ts` — Validation Engine

**Overall:** Stateless, pure-function validators. Clean design.

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| V1 | Observation | 25–26 | `validateActivityTransition` returns `null` when `getValidTransitions` returns an empty array. This means terminal activities (no declared transitions) silently pass any transition check. Correct for `meta` workflow (independent activities). Could theoretically mask a misconfigured sequential activity missing its transitions block. |
| V2 | Observation | 44–48 | `validateSkillAssociation` casts `skills` to `{ primary: string; supporting?: string[] }` via runtime type-checking. This mirrors the Activity schema shape but uses raw type assertions rather than the schema type. If the schema's skills structure changes, this code won't get compile-time type errors. |
| V3 | Observation | 76 | `validateStepManifest` casts activity to `Record<string, unknown>` to access `steps`. Same pattern as V2 — bypasses the typed Activity schema. This exists because the Activity type may not expose `steps` directly on the TS type. |
| V4 | Info | 93–98 | Step order validation breaks after the first mismatch. Correct — further position comparisons are meaningless once order diverges. |
| V5 | Info | 109–117 | `buildValidation` is a clean variadic aggregator. Null filtering handles optional validators elegantly. |

**No blockers.**

---

## 4. `src/tools/resource-tools.ts` — Session + Skill + Resource Tools

**Overall:** Consistent pattern application. One architectural observation.

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| R1 | Observation | 17–45 | `start_session` is registered in `resource-tools.ts`, which historically held `get_rules`. Semantically it's a bootstrap/session tool, not a resource tool. The naming of the file no longer fully reflects its contents. Not blocking. |
| R2 | Observation | 57–73 | `get_skill` loads the workflow (via `loadWorkflow`) solely for validation (version drift, skill association), even though skill resolution (`readSkill`) doesn't need it. This means every `get_skill` call does two filesystem traversals (skill + workflow). Low perf impact but could be optimized if needed. |
| R3 | Info | 130–131 | `discover_resources` decodes the token (HMAC check) but doesn't use the payload for validation. Returns `buildValidation()` (always valid). Consistent — discovery is a read-only listing operation. |
| R4 | Info | 43 | `start_session` response wraps token in the content body (JSON), not in `_meta`. This is correct — the initial token is data for the caller, not metadata of an ongoing session. |

**No blockers.**

---

## 5. `src/tools/workflow-tools.ts` — Workflow Navigation Tools

**Overall:** Most complex file. Clean validation orchestration. Two observations.

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| W1 | Observation | 81–106 | `get_activity`: manifest is validated against `token.act` (the *previous* activity), not `activity_id` (the current one). Correct — the manifest reports completion of the activity being exited. When `token.act` is empty (first activity), no manifest validation or warning occurs. |
| W2 | Observation | 134–157 | `validate_transition`: Does **not** emit a "no manifest" warning when `step_manifest` is absent, unlike `get_activity` (line 92–93). This asymmetry is arguably intentional — `validate_transition` is a check, not a navigational step — but it means agents won't get a reminder to provide manifests when using `validate_transition` before `get_activity`. |
| W3 | Observation | 134–155 | `validate_transition`: The `from_activity` parameter is used for manifest validation and transition checking, but the token's `act` field is **not** compared against `from_activity`. A caller can claim to be transitioning from an activity the token doesn't reflect. The token is also not updated with `from_activity` — only `wf` is passed to `advanceToken`. This means the token's activity tracking may lag behind actual navigation when `validate_transition` is used. |
| W4 | Info | 10–13 | `stepManifestSchema` defined at module level, shared between `get_activity` and `validate_transition`. Clean. |
| W5 | Info | 18–47 | `help` tool dynamically lists workflows. Response structure is self-describing. Well designed for agent consumption. |

**W3 is the most notable finding** — it's a consistency gap rather than a bug, since the token is a validation aid, not an authority.

---

## 6. `src/tools/state-tools.ts` — State Persistence Tools

**Overall:** Clean encrypt-on-save, decrypt-on-restore flow.

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| ST1 | Info | 40–44 | Encrypt logic checks `typeof state.variables['session_token'] === 'string'`. Convention-based: if the caller stores the token under a different variable name, it won't be encrypted. Acceptable — the key name `session_token` is well documented. |
| ST2 | Info | 43 | Sets `_session_token_encrypted = true` flag alongside the encrypted value. Clean sentinel for symmetric decrypt on restore. |
| ST3 | Info | 96–99 | Restore checks the flag before decrypting. Correctly deletes the flag after decryption so the restored state looks identical to what was originally saved. |
| ST4 | Info | 73, 104 | Both tools return `buildValidation()` (always valid). Appropriate — state operations don't involve workflow navigation. |

**No issues found.**

---

## 7. `src/server.ts` — Tool Registration List

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| SV1 | Info | 20–24 | Tool list updated from 17 to 14 entries. Matches the actual registered tools. Verified: `help` + `list_workflows` + `get_workflow` + `validate_transition` + `get_activity` + `get_checkpoint` + `health_check` + `start_session` + `get_skill` + `list_resources` + `get_resource` + `discover_resources` + `save_state` + `restore_state` = 14. Correct. |

---

## 8. `src/loaders/activity-loader.ts` — Mechanical Update

| # | Severity | Line(s) | Finding |
|---|----------|---------|---------|
| AL1 | Info | 272, 274 | `usage` and `next_action.tool` updated from `get_rules` to `start_session`. Note: `readActivityIndex` and the activity index are still built but no tool exposes them (the `get_activities` tool was removed). The function is still called by other loaders so it's not dead code. |

---

## Summary

| Severity | Count | Action |
|----------|-------|--------|
| Blocking | 0 | — |
| Low | 1 | C1: Remove unused `chmod` import |
| Observation | 10 | Documented for awareness |
| Info | 13 | No action needed |

**Recommendation:** Approve. The single low-severity finding (unused import) is trivial cleanup. The observations around type casting (V2, V3), validate_transition token tracking (W3), and key caching (C2) are worth tracking for a future iteration but do not block merge.
