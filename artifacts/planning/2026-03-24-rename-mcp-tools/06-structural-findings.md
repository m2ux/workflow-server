# Structural Findings — PR #60

**Lens:** Single-pass structural analysis  
**Date:** 2026-03-25  
**Scope:** Changed source files (session.ts, crypto.ts, validation.ts, resource-tools.ts, workflow-tools.ts, state-tools.ts)

---

## 1. Consistent Handler Pattern

All 10 token-bearing tool handlers follow an identical structure:

```
decode token → business logic → build validation → return { content, _meta: { token, validation } }
```

This pattern is applied uniformly across `resource-tools.ts`, `workflow-tools.ts`, and `state-tools.ts`. The consistency reduces cognitive load and makes new tool additions predictable.

**Assessment:** Strong. No deviation across handlers.

---

## 2. Repeated Workflow Loading

Several tools load the workflow definition twice: once for business logic, once for validation.

| Tool | Business load | Validation load |
|------|--------------|-----------------|
| `get_skill` | `readSkill(skill_id, workflowDir, workflow_id)` | `loadWorkflow(workflowDir, workflow_id)` |
| `get_activity` | `loadWorkflow` + `getActivity` | Same result reused |
| `get_checkpoint` | `loadWorkflow` + `getCheckpoint` | Same result reused |

`get_skill` is the only tool that loads the workflow *solely* for validation (skill association + version drift). The workflow result isn't needed for skill resolution.

**Assessment:** Minor inefficiency. Workflow files are small and loaded from local filesystem. If this becomes a concern, a per-request cache or passing the workflow result to validators would resolve it.

---

## 3. Tool Registration File Split

| File | Tools |
|------|-------|
| `workflow-tools.ts` | `help`, `list_workflows`, `get_workflow`, `get_activity`, `get_checkpoint`, `validate_transition`, `health_check` |
| `resource-tools.ts` | `start_session`, `get_skill`, `list_resources`, `get_resource`, `discover_resources` |
| `state-tools.ts` | `save_state`, `restore_state` |

`start_session` is semantically a bootstrap/session tool but lives in `resource-tools.ts` (where `get_rules` used to be). The file name `resource-tools` no longer fully describes its contents.

**Assessment:** Cosmetic. Not worth a rename/move in this PR. If more session tools are added, a `session-tools.ts` split would be warranted.

---

## 4. Type Casting in Validators

Two validators bypass the TypeScript Activity type:

- `validateSkillAssociation` (validation.ts:44): Checks `typeof skills === 'object' && 'primary' in skills` then casts to `{ primary: string }`.
- `validateStepManifest` (validation.ts:76): Casts activity to `Record<string, unknown>` to access `steps`.

Both exist because the `Activity` TypeScript type (from `activity.schema.ts`) may not expose these nested structures directly. The validators do runtime shape checks, so they're safe at execution time.

**Assessment:** Works correctly. If the Activity schema adds/removes `steps` or changes `skills` structure, these validators won't catch it at compile time. Consider adding a `steps` accessor to the Activity type or the workflow-loader in a future iteration.

---

## 5. Unused Import

`crypto.ts` line 2 imports `chmod` from `node:fs/promises` but never uses it. Likely a leftover from an earlier iteration that considered explicitly setting permissions after key file creation (the current code uses the `{ mode: 0o600 }` option to `writeFile` instead).

**Assessment:** Trivial cleanup.

---

## 6. Key Management — No In-Memory Caching

`getOrCreateServerKey()` reads the key file from disk on every call. The call chain for a single tool invocation:

```
decodeSessionToken → decode → getOrCreateServerKey (read)  →  hmacVerify (check)
advanceToken       → decode → getOrCreateServerKey (read)  →  hmacVerify (check)
                   → encode → getOrCreateServerKey (read)  →  hmacSign (sign)
```

That's 3 filesystem reads per tool call (one for verify, two for advance). Node's filesystem cache mitigates this, but a module-level `let cachedKey: Buffer | null` would eliminate the I/O entirely.

**Assessment:** Low priority. Filesystem reads are fast and the key file is 32 bytes. Worth optimizing if the server handles high throughput.

---

## 7. validate_transition Token Tracking Gap

`validate_transition` accepts `from_activity` and `to_activity` as explicit parameters but does not compare `from_activity` against `token.act` and does not pass either activity to `advanceToken`. After calling `validate_transition`, the token's `act` field still reflects whatever it was before — it doesn't advance to track the validated transition.

By contrast, `get_activity` advances the token's `act` to the loaded activity. This means calling `validate_transition` then `get_activity` is fine (the `get_activity` call advances the token), but calling `validate_transition` alone doesn't leave a trail in the token.

**Assessment:** Consistent with the design intent (token as validation aid, not authority). The transition check is inherently a probe — it shouldn't mutate session state. Worth documenting as a known behavior if agents rely on token tracking.

---

## 8. Error Handling Consistency

All tools use a consistent error pattern:
- Schema validation failures → `throw new Error(message)` → surfaces as `isError: true` in MCP
- HMAC/token failures → `throw new Error('Invalid session token: ...')` → same surface
- Workflow/activity not found → `throw result.error` (typed error) → same surface

The MCP SDK wraps thrown errors into error responses. No custom error types were introduced; existing `Result<T, E>` pattern is preserved.

**Assessment:** Consistent and clean. The error messages are descriptive enough for agent self-correction.

---

## Summary

| Finding | Priority | Action |
|---------|----------|--------|
| Consistent handler pattern | — | Strength. Maintain. |
| Repeated workflow loading | Low | Optimize if perf matters |
| Tool file naming | Cosmetic | Defer to future PR |
| Type casting in validators | Low | Add typed accessors later |
| Unused `chmod` import | Trivial | Remove |
| No key caching | Low | Add module-level cache later |
| validate_transition gap | Informational | Document as known behavior |
| Error handling consistency | — | Strength. Maintain. |
