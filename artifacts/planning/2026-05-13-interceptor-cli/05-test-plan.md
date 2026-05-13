# Test Plan: MCP-Client Interceptor CLI

**Engineering:** [README.md](README.md)
**Design philosophy:** [01-design-philosophy.md](01-design-philosophy.md)
**Work package plan:** [05-work-package-plan.md](05-work-package-plan.md)
**Branch:** `feat/112-interceptor-cli`
**PR:** [#113](https://github.com/m2ux/workflow-server/pull/113)

---

## Overview

This test plan validates the `workflow-server-interceptor` CLI (tasks 1-5) and the redundancy-cleanup pass that ships in the same PR (tasks 6-10): audit-log redaction, the collapsed `present_checkpoint`/`respond_checkpoint` parameter API, verification of the tier-C revert, and the cross-session boundary correctness contract enforced by the new `explicit-session-on-resume` meta-rule.

Interceptor-CLI key behaviours to validate:

1. **Inject happy path** — token from `current.token` is merged into `arguments.session_token` for `mcp__workflow-server__*` calls.
2. **Inject skip rules** — pass-through for `start_session`, for pre-existing `session_token`, for pre-existing `checkpoint_handle`, and for non-workflow-server targets.
3. **Inject failure-safe defaults** — pass-through when `current.token` is missing, empty, or stdin is malformed. Inject reads only the pointer file, never the per-sid files.
4. **Capture happy path** — `_meta.session_token` written to **both** `<STATE_DIR>/<sid-hex>.token` and `<STATE_DIR>/current.token` with `0600` permissions; state directory created at `0700` if missing.
5. **Capture sid extraction** — `sid` is decoded from the token payload (base64url + JSON.parse + dash strip) and used as the per-sid filename component (32 lowercase hex characters).
6. **Capture multi-sid layout** — multiple distinct sids each produce their own `<sid-hex>.token` file; `current.token` reflects the most recently captured token.
7. **Capture sid-extraction fallback** — when sid extraction fails (malformed token, missing `sid`, non-UUID), capture still writes `current.token` and exits 0 without creating a spurious per-sid file.
8. **Capture skip rules** — silent no-op when `_meta` is absent, when `_meta.session_token` is missing, non-string, or empty.
9. **Atomic-write invariant** — concurrent reads never see a partially-written file; no leftover `.tmp` on success for either the per-sid file or the pointer.
10. **Exit-code invariant** — the CLI never exits non-zero, regardless of input shape, so a hook misconfiguration never blocks an MCP call.

Cleanup-pass key behaviours to validate:

11. **Audit-log redaction** — `withAuditLog` replaces `session_token` and `checkpoint_handle` values with `"[redacted]"` before `logAuditEvent`; the literal token characters never appear in the captured audit-event payload; other keys are preserved verbatim.
12. **Collapsed-API acceptance** — `present_checkpoint({ session_token, ... })` and `respond_checkpoint({ session_token, option_id, ... })` succeed under the new schema.
13. **Collapsed-API rejection** — `present_checkpoint({ checkpoint_handle, ... })` and `respond_checkpoint({ checkpoint_handle, ... })` are rejected (or warn with a deprecation message if Option 9B's alias is shipped).
14. **Tier-C revert correctness** — `npm test` and `npm run typecheck` pass on `enhancement/session-token-size-optimization` after the two reverts; legacy `decodeSessionToken` export shape is restored.
15. **Cross-session boundary correctness** — when a sub-agent is spawned with its own session_token in the prompt and later returns to its parent, the interceptor does not clobber the child's token mid-flight, and the parent's first post-return workflow-server call explicitly passes its own session_token (validates the new `explicit-session-on-resume` rule).

---

## Test Strategy

- **Unit tests** in `tests/hooks-cli.test.ts` cover every branch of the inject and capture logic. Tests invoke the built CLI via `child_process.execFile` against a per-test temporary `HOME` so the state file path is isolated. The same Node binary (`process.execPath`) is used for the subprocess, matching how harnesses spawn it.
- **Manual verification** documented in `docs/interceptor-recipe.md` provides the end-to-end live-harness check. v1 does not include an automated integration test against a real harness; the unit tests exercise the literal JSON shapes each harness emits, which is the same protection point.
- **Build verification** confirms the shebang survives compilation and the bin entry resolves on `npm pack` / `npm install -g`.

Test infrastructure conventions:

- Vitest, matching the rest of the test suite.
- Per-test temporary directory via `fs.mkdtempSync` rooted at `os.tmpdir()` and used as `HOME` for the subprocess.
- Subprocess invocation: `execFileSync(process.execPath, ['dist/hooks/cli.js', 'inject'], { input: jsonString, env: { ...process.env, HOME: tmpDir } })`.
- Mode assertions: `(fs.statSync(path).mode & 0o777) === 0o600` for token files, `0o700` for the state directory.
- **Token-builder helper:** a small in-test function constructs realistic session tokens for capture inputs. Given a `sid` (UUID string) and arbitrary additional payload fields, it returns `<base64url(JSON.stringify(payload))>.<dummy-signature>`. Used by sid-extraction, dual-write, multi-sid, and overwrite tests so they exercise the literal payload-decode path the CLI runs.

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| TC-01 | Verify `inject` happy path — `current.token` content is merged into `updatedInput.session_token` for a `mcp__workflow-server__get_activity` call with no pre-existing token | Unit |
| TC-02 | Verify `inject` preserves other fields in `tool_input` when injecting the token | Unit |
| TC-03 | Verify `inject` is a no-op (pass-through) when `tool_name === 'mcp__workflow-server__start_session'` | Unit |
| TC-04 | Verify `inject` is a no-op when `tool_input.session_token` is already a non-empty string (agent-supplied token never clobbered) | Unit |
| TC-05 | Verify `inject` is a no-op when `tool_input.checkpoint_handle` is already a non-empty string (agent-supplied handle never clobbered) | Unit |
| TC-06 | Verify `inject` is a no-op when `tool_name` does not start with `mcp__workflow-server__` (other MCP servers are untouched) | Unit |
| TC-07 | Verify `inject` is a pass-through when `~/.claude/workflow-server-tokens/current.token` does not exist | Unit |
| TC-08 | Verify `inject` is a pass-through when `current.token` exists but is empty (zero bytes) | Unit |
| TC-09 | Verify `inject` is a pass-through when stdin is malformed (non-JSON); exit code is `0` | Unit |
| TC-10 | Verify `inject` exits `0` on any filesystem error (e.g., `current.token` unreadable due to permissions) | Unit |
| TC-11 | Verify `inject` reads only `current.token`, never a per-sid file — when `<sid-hex>.token` exists but `current.token` does not, expect pass-through | Unit |
| TC-12 | Verify `capture` happy path with sid extraction — given a token whose payload decodes to `{"sid":"f921c0ed-f333-4579-a2aa-bc9f84efcbf4", …}`, expect a file at `<STATE_DIR>/f921c0edf3334579a2aabc9f84efcbf4.token` containing the full token, mode `0600` | Unit |
| TC-13 | Verify `capture` dual write — same input as TC-12, expect both `<STATE_DIR>/<sid-hex>.token` and `<STATE_DIR>/current.token` to exist and contain the identical token string, each with mode `0600` | Unit |
| TC-14 | Verify `capture` creates the state directory at `~/.claude/workflow-server-tokens` with mode `0700` when it does not exist | Unit |
| TC-15 | Verify `capture` produces multiple per-sid files for distinct sids — capture two tokens with different `sid` values; expect two `<sid-hex>.token` files plus `current.token` containing the **second** token (most recent capture wins) | Unit |
| TC-16 | Verify `current.token` always reflects the most recent capture — capture token A then token B; `current.token` content matches B, not A; per-sid files for both sids still exist | Unit |
| TC-17 | Verify `capture` overwrites an existing per-sid file in place — capture T1 for sid S, then T2 for the same sid S; expect `<S-hex>.token` content matches T2, no leftover `.tmp` files anywhere in the directory | Unit |
| TC-18 | Verify sid-extraction fallback — given `_meta.session_token = "not.a.valid.payload"` (or a payload that JSON-parses but lacks `sid`, or has a non-UUID `sid`), expect `current.token` written with the supplied token, no per-sid `<*>.token` file created, exit 0 | Unit |
| TC-19 | Verify `capture` is a no-op when the response has no `_meta` field | Unit |
| TC-20 | Verify `capture` is a no-op when `_meta` is present but `_meta.session_token` is missing | Unit |
| TC-21 | Verify `capture` is a no-op when `_meta.session_token` is `null` | Unit |
| TC-22 | Verify `capture` is a no-op when `_meta.session_token` is a number or boolean (non-string) | Unit |
| TC-23 | Verify `capture` is a no-op when `_meta.session_token` is an empty string | Unit |
| TC-24 | Verify `capture` exits `0` when stdin is malformed (non-JSON) | Unit |
| TC-25 | Verify `capture` exits `0` on any filesystem error (e.g., state directory cannot be created) | Unit |
| TC-26 | Verify atomic write — no `current.token.tmp` and no `<sid-hex>.token.tmp` are left behind after a successful capture (covers both writes in the dual-write path) | Unit |
| TC-27 | Verify mode invariant — every token file written by capture (both per-sid and pointer) has `(statSync(file).mode & 0o777) === 0o600` | Unit |
| TC-28 | Verify the built CLI has a `#!/usr/bin/env node` shebang preserved in `dist/hooks/cli.js` and is executable | Unit / Build |
| TC-29 | Verify `package.json` lists `workflow-server-interceptor` in `bin` and points at `dist/hooks/cli.js` | Unit / Build |
| TC-30 | Verify `withAuditLog` redacts `session_token` from `params` before `logAuditEvent` — for a representative `start_session` call params containing a `session_token`, the captured audit event has `session_token: "[redacted]"` and the original token's character sequence does not appear anywhere in the captured payload | Unit |
| TC-31 | Verify `withAuditLog` redacts `checkpoint_handle` from `params` — for a `respond_checkpoint` call params containing a `checkpoint_handle`, the captured audit event has `checkpoint_handle: "[redacted]"` and the original handle does not appear in the captured payload | Unit |
| TC-32 | Verify `withAuditLog` redaction is shallow and preserves other keys — non-token params (e.g., `workflow_id`, `option_id`, `agent_id`) are preserved verbatim; nested params are untouched | Unit |
| TC-33 | Verify `present_checkpoint({ session_token, ... })` is accepted under the collapsed-parameter schema (Task 9) | Unit |
| TC-34 | Verify `respond_checkpoint({ session_token, option_id, ... })` is accepted under the collapsed-parameter schema (Task 9); response body uses the field shape decided by Task 9 (Option 9A: `session_token` only; Option 9B: both `session_token` and `checkpoint_handle` with the alias marked deprecated) | Unit |
| TC-35 | Verify `present_checkpoint({ checkpoint_handle, ... })` is rejected under the collapsed-parameter schema — the Zod schema returns a validation error citing the missing required `session_token` parameter and the unknown `checkpoint_handle` key. If Option 9B's alias is shipped, this test asserts a deprecation warning is emitted instead of an outright rejection. | Unit |
| TC-36 | Verify tier-C revert leaves `npm test` and `npm run typecheck` green on `enhancement/session-token-size-optimization` after both reverts (`f7a4cd8` and `1cd7d56`); the post-revert tree has no references to `SessionStore`, `state_hash`, or the CBOR codec apart from history | Verification (run on the sibling branch) |
| TC-37 | Verify cross-session boundary correctness — spawn a sub-agent with its own session_token threaded through the spawn prompt; assert capture does not clobber the parent's `current.token` mid-flight in a way that breaks the child's interim calls (per-sid file isolation provides the safety net); assert the parent's first workflow-server call after sub-agent return explicitly passes its own session_token (validates `explicit-session-on-resume` rule per A-20 / E6) | Integration |

---

## Acceptance Matrix

| Success criterion | Validated by |
|-------------------|--------------|
| Inject happy path injects `current.token` content | TC-01, TC-02 |
| `start_session` is always skipped | TC-03 |
| Agent-supplied tokens / handles never clobbered | TC-04, TC-05 |
| Non-workflow-server targets pass through | TC-06 |
| Missing or empty `current.token` degrades to status quo | TC-07, TC-08 |
| Inject never crashes on malformed input or FS error | TC-09, TC-10 |
| Inject reads pointer only, not per-sid files | TC-11 |
| Capture extracts `sid` from token payload and writes the per-sid file at the correct hex filename | TC-12 |
| Capture dual write — per-sid file and `current.token` both written with matching content | TC-13 |
| Capture creates state directory with `0700` permissions | TC-14 |
| Multiple distinct sids produce multiple per-sid files; `current.token` reflects most recent | TC-15, TC-16 |
| In-place per-sid overwrite — same sid captures overwrite the same file, no leftover `.tmp` | TC-17 |
| Sid-extraction failure degrades gracefully to pointer-only write | TC-18 |
| Capture skip rules cover all malformed-response shapes | TC-19, TC-20, TC-21, TC-22, TC-23 |
| Capture never crashes on malformed input or FS error | TC-24, TC-25 |
| Atomic write — no leftover `.tmp` for either the per-sid file or the pointer | TC-26 |
| Capture writes all token files with `0600` permissions | TC-27 |
| Bin entry installs and resolves on `PATH` | TC-28, TC-29 |
| Audit-log redaction strips token values while preserving field presence and other keys | TC-30, TC-31, TC-32 |
| Collapsed `present_checkpoint`/`respond_checkpoint` schema accepts `session_token` only | TC-33, TC-34 |
| Collapsed schema rejects (or deprecation-warns) on `checkpoint_handle` | TC-35 |
| Tier-C revert leaves the sibling branch green | TC-36 |
| Cross-session boundary correctness under `explicit-session-on-resume` rule | TC-37 |
| ≥ 36 new tests added | TC-01 through TC-37 (37 cases) |
| `npm run typecheck` clean | Verified after each task commit by the implement activity's task-cycle |
| `npm test` green | Verified after each task commit by the implement activity's task-cycle |

---

## Mapping to Assumptions

Each open assumption from [01-assumptions-log.md](01-assumptions-log.md) closes with a corresponding test:

| Assumption | Closing test(s) |
|------------|-----------------|
| B1 — Implementation fits in 300–500 LOC (extended to ≤ 350 LOC with sid extraction) | Verified by `wc -l src/hooks/cli.ts` after Task 1; reported in Task 1 completion summary |
| D1 — Per-sid files survive concurrent captures; inject uses pointer | TC-13, TC-15, TC-16, TC-17 (per-sid layout + multi-sid behaviour); TC-11 (inject reads pointer, not per-sid) |
| D2 — Missing state file recovers cleanly | TC-07, TC-08 |
| D4 — Agent-supplied tokens are never clobbered | TC-04, TC-05 |
| D5 — `start_session` always skips injection | TC-03 |
| D6 — `sid` extractable from wire token payload; graceful fallback on extraction failure | TC-12 (extraction happy path), TC-18 (fallback) |
| E1 — Audit-log redaction uses `"[redacted]"` rather than stripping | TC-30, TC-31, TC-32 |
| E2 — `present_checkpoint`/`respond_checkpoint` have no external consumers we need to preserve | TC-33, TC-34, TC-35 (validates the collapsed-API contract; external-consumer assumption itself is stakeholder-dependent) |
| E3 — Tier-C revert leaves no functional regression | TC-36 |
| E4 — Collapsed-parameter API does not break checkpoint resumption under the interceptor | TC-33, TC-34 (collapsed schema acceptance under interceptor-injected token); TC-37 (cross-session boundary) |
| E5 — Meta-rule pruning preserves correctness on no-interceptor fallback | Code review of the meta-skill diff in the implement activity; rule text inspection is the validating step |
| E6 — `explicit-session-on-resume` rule is necessary and sufficient | TC-37 |
| A-20 — Cross-session boundary handling under the interceptor | TC-37 |

---

## Running Tests

```bash
# Build first so dist/hooks/cli.js exists
npm run build

# Run the full suite
npm test

# Run just the hooks-cli tests
npm test -- tests/hooks-cli.test.ts

# Typecheck
npm run typecheck

# Verify the bin entry resolves after install
npm pack --dry-run | grep dist/hooks/cli.js
```

### Manual end-to-end check (live harness)

After install:

```bash
# 1. Confirm the bin is callable.
workflow-server-interceptor --help 2>&1 || true   # CLI doesn't need help output; just confirm it runs

# 2. Smoke-test inject with a sample PreToolUse JSON.
echo '{"tool_name":"mcp__workflow-server__get_activity","tool_input":{}}' \
  | workflow-server-interceptor inject

# 3. Wire the hook into the host harness per docs/interceptor-recipe.md.
# 4. Run a workflow that issues at least one MCP call after start_session.
# 5. Confirm ~/.claude/workflow-server-tokens/current.token exists and contains the latest token.
# 6. Confirm at least one ~/.claude/workflow-server-tokens/<sid-hex>.token file exists
#    and contains the same token as current.token (per-sid layout is in place).
# 7. Optional: list ~/.claude/workflow-server-tokens/ to inspect which sessions are alive
#    locally; verify permissions are 0700 on the directory and 0600 on each .token file.
```
