# MCP-Client Interceptor CLI — Implementation Plan

**Date:** 2026-05-13
**Priority:** MEDIUM
**Status:** Ready
**Estimated Effort:** 4.5-6h agentic + 45-75m human review (widened from 2.5-3.5h to fold in the redundancy-cleanup pass — see design philosophy §6)

---

## Overview

### Problem Statement

When an MCP agent executes a workflow hosted by this server, every call after `start_session` must echo the server's HMAC-signed `session_token` back verbatim. The token is roughly 480 characters of opaque base64url; the LLM is a reliable-but-not-infallible copyist and occasionally emits a near-copy with a small number of characters altered. HMAC verification then fails and the workflow halts mid-step with a "signature verification failed" error, throwing away any cumulative progress. The corruption surface is structural — putting a human-style copy-paste operation in the middle of an automated pipeline — so no amount of "be more careful" instruction to the agent fixes it.

The remedy is to eliminate the LLM's role in passing the token. MCP-host harnesses (Claude Code, Cursor, OpenCode, Codex CLI, Claude Agent SDK) all ship lifecycle hooks (`PreToolUse` / `PostToolUse` or their per-harness equivalent) that can intercept outgoing tool calls and inspect incoming responses. A small CLI wired into those hooks owns the full token lifecycle: it captures the token the server returns and injects it into the next outbound call's `arguments`. The LLM never sees the token in the outbound argument list.

### Scope

**In Scope (v1):**

- `workflow-server-interceptor` TypeScript CLI shipped as a `bin` entry of `@m2ux/workflow-server`. Single file at `src/hooks/cli.ts` with two subcommands: `inject` (PreToolUse) and `capture` (PostToolUse).
- Pure stdlib implementation (`node:fs`, `node:path`, `node:os`); no new runtime dependencies.
- State directory at `~/.claude/workflow-server-tokens/` containing one `<sid-hex>.token` file per workflow-server session observed plus a shared `current.token` pointer file.
- Capture writes to **both** locations: the per-sid file and `current.token`. Inject reads only `current.token`.
- `sid` extraction from the captured token payload (base64url-decode the segment before the `.`, JSON.parse, read `sid`, strip dashes → 32-character hex).
- State directory created with mode `0700` if missing; all token files written with mode `0600`.
- Skip-injection rules: `start_session` tool, `session_token` already present in `arguments`, `checkpoint_handle` already present in `arguments`.
- `package.json` `bin` entry with shebang and build wiring so the CLI is callable via `PATH` after install.
- Unit tests at `tests/hooks-cli.test.ts` covering all branches: inject happy path, skip-on-`start_session`, skip-on-pre-existing-token, skip-on-pre-existing-handle, pass-through on missing state file, pass-through on empty state file, sid extraction from a realistic token shape, capture dual write (per-sid file + `current.token`), per-sid filename correctness, multiple distinct sids producing multiple files, `current.token` reflects most recent capture, existing-file overwrite, capture happy path with `0600` permission assertion, state-directory creation at `0700` when absent, capture pass-through on missing `_meta`, capture pass-through on missing or non-string `_meta.session_token`, and capture graceful fallback when `sid` extraction fails (writes only `current.token`).
- `docs/interceptor-recipe.md`: end-to-end recipe documenting what the hook does, why, and how to wire it across the five target harnesses.
- `examples/interceptor/`: copy-pasteable configuration files for each harness, with a README explaining each variant's deployment.

**Out of Scope (v1):**

- **Native (Rust) build.** TypeScript executable invoked via Node is acceptable; the ~50 ms cold-start per call is within budget. Documented in design philosophy §5.2.
- **Server-side state attestation (`sh` state-hash on the wire).** Separate work, tracked under the session-token-size-optimization branch.
- **Wire-format changes.** The interceptor is a pure client-side overlay; the wire token and server endpoints are untouched.
- **True multi-active-session inject** (selecting per-sid on PreToolUse). The per-sid files survive concurrent captures, but inject still uses `current.token`, so concurrent-active-session sessions race on the pointer. Recovery is manual (copy the desired `<sid-hex>.token` over `current.token`). Promoting inject to per-sid selection requires a sid hint that the current MCP tool-call context does not expose.
- **Integration tests against real harnesses.** The unit tests exercise the exact JSON shapes each harness emits; live-harness validation is left to manual verification per the recipe document.

---

## Research & Analysis

*See companion planning artifacts for full details:*

- **Design philosophy:** [01-design-philosophy.md](01-design-philosophy.md) — problem framing, alternatives considered, harness inventory, failure-mode catalogue.
- **Assumptions log:** [01-assumptions-log.md](01-assumptions-log.md) — A1–D5; six entries `accepted` or `resolved`, three `open` and to be closed by this plan's tests.

### Key Findings Summary

- **The corruption surface is the LLM's own output stream**, not the network or the server. The hook runs after the LLM has emitted the call and before the harness forwards it — exactly the right injection point (design philosophy §1.2).
- **All five target harnesses expose the necessary lifecycle hooks today** (design philosophy §3.3). The CLI ships once; per-harness wiring is documentation, not code.
- **The failure-safe default is the status quo.** If the hook is absent, mis-installed, or the state file is missing, the system behaves exactly as it does today — the LLM transcribes the token directly. The interceptor never makes things worse (design philosophy §3.4, assumptions D2/D3).
- **The skip rules are narrow and well-defined.** Three independent conditions trigger pass-through: target is `start_session`, `arguments.session_token` is already set, or `arguments.checkpoint_handle` is already set. Each is independently testable (assumptions D4/D5).

---

## Proposed Approach

### Solution Design

A single-file Node CLI executable invoked twice per workflow call by the host harness:

- **`workflow-server-interceptor inject`** reads the harness's PreToolUse JSON from stdin, decides whether to inject (target is `mcp__workflow-server__*` and is not `start_session` and no token/handle is already supplied), reads the latest token from the state file if present, and emits an `updatedInput` JSON to stdout with `arguments.session_token` populated. On any short-circuit condition it emits a pass-through response that leaves the call untouched.
- **`workflow-server-interceptor capture`** reads the PostToolUse JSON from stdin, extracts `_meta.session_token` from the response if present and a non-empty string, writes it to the state file with `0600` permissions (creating the directory at `0700` if missing), and emits a pass-through response. On any short-circuit (no `_meta`, no token, non-string token) it emits the pass-through and exits successfully.

The state file location is the conventional `~/.claude/workflow-server-tokens/current.token`. The directory and file are created with strict permissions (`0700` / `0600`) so the token is never world-readable. Both subcommands degrade to no-op on filesystem error rather than aborting the call.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Single CLI with two subcommands | One executable, one `bin` entry, one shipping unit | Slight argv parsing overhead | **Selected** |
| Two separate executables (`inject` and `capture`) | Marginally simpler argv handling per binary | Two `bin` entries, two install paths, twice the surface to keep in sync | Rejected |
| Bash script with `jq` | Smallest dependencies, fastest cold start | Adds `jq` as a required external dependency; cross-platform is awkward (Windows) | Rejected |
| Native (Rust) binary | Fastest cold start, no Node dependency | Requires multi-arch builds and a separate release pipeline; out of scope for v1 | Deferred to v2 if latency proves a problem |
| In-process plugin (per-harness SDK) | No subprocess overhead | Would require five separate code paths; current goal is cross-harness uniformity | Rejected |
| Inline server-side session lookup (drop `session_token` from the wire) | Zero client work | Forfeits server statelessness; rewrites the resume-from-saved-token contract; out of scope per design philosophy §3.2 | Rejected |
| State directory keyed by `sid` (per-session capture files + shared `current.token` inject pointer) | Survives concurrent captures, enables targeted cleanup and inspection, foundation for future per-sid inject without on-disk rework, identical behavior to a single-file design in the common single-active-session case | Slightly more capture-side logic (sid extraction + dual write); residual race on `current.token` for concurrent-active-session inject | **Selected (v1)** |
| True multi-active-session inject (per-sid selection on PreToolUse) | Eliminates residual `current.token` race | Requires a sid hint in the MCP tool-call context that does not currently exist | Deferred to v2 (graceful upgrade — capture-side layout already accommodates it) |

---

## Implementation Tasks

Tasks are ordered by dependency. Each task is independently committable; verification (`npm run typecheck`, `npm test`) runs after each task as part of the implement activity's task-cycle.

### Task 1: CLI implementation — `src/hooks/cli.ts` (45-60 min)

**Goal:** Single-file CLI with two subcommands implementing the inject / capture lifecycle, with capture writing per-sid files plus a shared pointer.

**Depends on:** None.

**Deliverables:**

- `src/hooks/cli.ts` — single TypeScript file using only `node:fs`, `node:path`, `node:os` from the Node stdlib (Buffer is used for base64url decode). Exports nothing; module entry point reads `process.argv[2]` to dispatch between `inject` and `capture`. Reads stdin to end, parses JSON, applies the relevant logic, writes JSON to stdout, exits 0.
- **`inject` behaviour:**
  - Parse stdin as JSON; on parse failure, emit a pass-through `{}` and exit 0 (never break the host harness).
  - Read the tool name from `tool_name` (Claude Code shape; the same field is used by Cursor's `beforeMCPExecution` and Codex CLI's `PreToolUse`). If the name does not start with `mcp__workflow-server__`, emit pass-through.
  - If `tool_name === 'mcp__workflow-server__start_session'`, emit pass-through.
  - Read `tool_input` (Claude Code) or its per-harness equivalent. If `tool_input.session_token` is a non-empty string, emit pass-through. If `tool_input.checkpoint_handle` is a non-empty string, emit pass-through.
  - Read the pointer file at `~/.claude/workflow-server-tokens/current.token`. (Inject deliberately uses the shared pointer, not a per-sid file — it has no sid hint in the tool-call context to select with.) If missing or empty, emit pass-through. Otherwise emit `{ "updatedInput": { ...tool_input, session_token: <token> } }`.
- **`capture` behaviour:**
  - Parse stdin as JSON; on parse failure, exit 0 silently.
  - Locate `_meta.session_token` in the tool response. The exact JSON path depends on the harness; the CLI looks at the top-level `_meta` first, then at the conventional `tool_response._meta` fallback. If neither is present or the value is not a non-empty string, exit 0.
  - **Sid extraction.** Split the token on `.`; take the first segment. Base64url-decode it to a UTF-8 string. JSON.parse the result. Read the `sid` field. If `sid` is a string matching the UUID shape, strip the dashes to produce a 32-character lowercase hex string (`sid-hex`). If sid extraction fails at any step (no `.` in token, base64url decode error, JSON parse error, missing/non-string `sid`, malformed UUID), set `sid-hex = null` and fall through to the pointer-only branch.
  - Ensure the state directory `~/.claude/workflow-server-tokens/` exists with mode `0700` (create with `fs.mkdirSync(dir, { recursive: true, mode: 0o700 })` if missing; on POSIX the mode is honored).
  - **Dual write.** When `sid-hex` is non-null, write the token atomically to `<STATE_DIR>/<sid-hex>.token` with mode `0600` (`.tmp` sibling + `rename`). Then write the token atomically to `<STATE_DIR>/current.token` with mode `0600`. When `sid-hex` is null (extraction failed), write only `<STATE_DIR>/current.token`. Both writes use the same atomic pattern and the same `0600` mode.
  - Exit 0. The PostToolUse contract requires no stdout body.
- **Error handling:** All filesystem errors are caught and converted to silent pass-through (capture) or pass-through emit (inject). The CLI never throws and never exits non-zero — host harnesses interpret non-zero as "block the call," which would be worse than the status quo. Sid-extraction failures specifically degrade to pointer-only capture, not error: the user still gets `current.token` updated.
- **Sid extraction helper.** Implemented inline (or as a small private function) — does not introduce a new dependency. Base64url decoding uses `Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64')` with implicit padding tolerance, or `Buffer.from(input, 'base64url')` on Node ≥ 16 (preferred — the repo's minimum supported Node is already 18+).

### Task 2: Package wiring — `bin` entry, build, shebang (15-20 min)

**Goal:** Make `workflow-server-interceptor` callable from `PATH` after `npm install -g @m2ux/workflow-server` (or via `npx`).

**Depends on:** Task 1.

**Deliverables:**

- `package.json` — add a `bin` entry: `"workflow-server-interceptor": "dist/hooks/cli.js"`. Confirm `files` (if present) includes `dist/`.
- `src/hooks/cli.ts` — first line is the shebang `#!/usr/bin/env node`. TypeScript preserves the shebang in emitted JS when it is the first line of the source file (verified by the build).
- `tsconfig.json` review — confirm `src/hooks/cli.ts` is included by the existing `include` glob (it is, since `src/**/*.ts` is the convention). No tsconfig changes expected.
- Build verification: `npm run build` produces `dist/hooks/cli.js` with the shebang intact. The CLI is then executable directly (`node dist/hooks/cli.js inject < input.json`). On install, npm sets the `+x` bit and creates the bin shim automatically.
- `npm pack --dry-run` (or equivalent inspection) confirms `dist/hooks/cli.js` is in the published tarball.

### Task 3: Unit tests — `tests/hooks-cli.test.ts` (45-60 min)

**Goal:** Cover every branch of the inject and capture logic — including sid extraction and dual write — against the exact JSON shapes each target harness emits. Sufficient confidence to ship without a live-harness integration test in v1.

**Depends on:** Task 1.

**Deliverables:**

- `tests/hooks-cli.test.ts` — vitest test file. Uses `child_process.execFile` (or `spawn`) to invoke the built CLI with `process.execPath` so the tests run against the same Node binary as the harness would. Uses a per-test temporary `HOME` (via `process.env.HOME` override) so the state directory path is isolated. A small helper builds realistic tokens: given a `sid` and arbitrary other payload fields, it produces a `<base64url(JSON)>.<dummy-signature>` string for use in capture inputs and as the `current.token` content for inject inputs.
- **Inject cases:**
  - Happy path: `current.token` contains token `T`; `tool_name` is `mcp__workflow-server__get_activity`; `tool_input` has no `session_token`. Expect `updatedInput.session_token === T` and other fields preserved.
  - Skip on `start_session`: `tool_name` is `mcp__workflow-server__start_session`. Expect pass-through (no `updatedInput` or `updatedInput` absent).
  - Skip on existing `session_token`: `tool_input` already has `session_token: "X"`. Expect pass-through; the agent-supplied token is never clobbered.
  - Skip on existing `checkpoint_handle`: `tool_input` has `checkpoint_handle: "Y"`. Expect pass-through.
  - Skip on non-workflow-server target: `tool_name` is `mcp__other__foo`. Expect pass-through.
  - Pass-through on missing pointer file: `current.token` does not exist. Expect pass-through, exit 0.
  - Pass-through on empty pointer file: `current.token` exists but is zero bytes. Expect pass-through, exit 0.
  - Pass-through on malformed stdin: `inject` receives non-JSON. Expect pass-through, exit 0.
  - Inject reads pointer, not per-sid file: a `<sid-hex>.token` file exists but `current.token` does not. Expect pass-through (inject does not scan the directory for per-sid files).
- **Capture cases — sid extraction and layout:**
  - Sid extraction from a realistic token: capture input has `_meta.session_token` = a token whose payload decodes to `{"sid":"f921c0ed-f333-4579-a2aa-bc9f84efcbf4", ...}`. Expect a file at `<STATE_DIR>/f921c0edf3334579a2aabc9f84efcbf4.token` containing the full token, mode `0600`. Filename uses lowercase hex with no dashes.
  - Dual write: same input — expect **both** `<STATE_DIR>/<sid-hex>.token` and `<STATE_DIR>/current.token` to exist and contain the identical token string, each with mode `0600`.
  - Multiple distinct sids produce multiple files: capture twice with two different `sid` values. Expect two `<sid-hex>.token` files present, plus `current.token` containing the **second** token (most recent capture wins).
  - `current.token` reflects most recent capture: capture token A then token B. Expect `current.token` content matches B, not A. Per-sid files for both sids still exist.
  - Existing-file overwrite: capture token T1 for sid S, then capture token T2 for the same sid S. Expect `<S-hex>.token` content matches T2 (in-place overwrite), no `.tmp` files left in the directory.
  - Graceful fallback on sid-extraction failure: capture input has `_meta.session_token = "not.a.valid.payload"` (or a payload that JSON-parses but lacks `sid`, or a `sid` that is not a UUID). Expect `current.token` written with the supplied token; expect no spurious `<*>.token` file. Exit 0.
- **Capture cases — filesystem and skip behaviour:**
  - State directory created when absent: state directory does not exist before the call. Expect directory created with mode `0700` (`(statSync(dir).mode & 0o777) === 0o700`).
  - Permission assertion on tokens: every written `.token` file (per-sid and pointer) has `(statSync(file).mode & 0o777) === 0o600`.
  - Pass-through on missing `_meta`: response has no `_meta` field. Expect no files written, exit 0.
  - Pass-through on missing `_meta.session_token`: `_meta` present, no token. Expect no files written, exit 0.
  - Pass-through on non-string token: `_meta.session_token` is `null`, `false`, `42`. Expect no files written, exit 0.
  - Pass-through on empty-string token: `_meta.session_token === ""`. Expect no files written, exit 0.
  - Pass-through on malformed stdin: `capture` receives non-JSON. Expect no files written, exit 0.
  - Atomic write: pre-existing pointer file is overwritten in place without being truncated to zero bytes mid-write (verified by checking that `current.token.tmp` and `<sid-hex>.token.tmp` are not left behind after a successful capture).
- All tests assert exit code is `0` regardless of input — the CLI must never block the call.

**Expected test count:** ~28–30 cases across inject (9) and capture (19+). Test count grows from the original 22 by adding sid-extraction, dual-write, multi-sid, fallback, and inject-reads-pointer cases.

### Task 4: Recipe documentation — `docs/interceptor-recipe.md` (30-45 min)

**Goal:** A reviewer or installer can wire the hook into their harness of choice without reading source.

**Depends on:** Task 2 (the bin name and invocation shape must be settled).

**Deliverables:**

- `docs/interceptor-recipe.md` with the following sections:
  1. **What the hook does and why** — two paragraphs summarising the design philosophy (the LLM no longer copies the token; the hook owns the lifecycle).
  2. **Prerequisites** — `npm install -g @m2ux/workflow-server` (or local install + PATH); confirm `workflow-server-interceptor` resolves.
  3. **Claude Code** — `~/.claude/settings.json` snippet wiring `PreToolUse` and `PostToolUse` matchers for `mcp__workflow-server__*` to the inject and capture subcommands.
  4. **Cursor (≥1.7)** — `beforeMCPExecution` hook configuration with the equivalent wiring.
  5. **OpenCode** — `tool.execute.before` plugin handler snippet.
  6. **Codex CLI** — `PreToolUse` hook configuration (per PR #18385 contract).
  7. **Claude Agent SDK** — programmatic hook registration in TypeScript and Python.
  8. **Verification** — steps to confirm the hook is wired: invoke `workflow-server-interceptor inject` with a sample PreToolUse JSON on stdin and assert the `updatedInput.session_token` is present; check the state file exists at `~/.claude/workflow-server-tokens/current.token` after a workflow call; tail the state file to confirm it is updated as the workflow advances.
  9. **Troubleshooting** — what to check if the hook is silent (state file permissions, harness log indicating the hook ran, the `inject` short-circuit conditions).

### Task 5: Per-harness example configs — `examples/interceptor/` (30 min)

**Goal:** Copy-paste-ready configuration files so a user does not need to translate the recipe document into a working file by hand.

**Depends on:** Task 4 (the recipe authoritative; examples mirror it).

**Deliverables:**

- `examples/interceptor/README.md` — one paragraph per file explaining what it is, where it goes, and which harness it targets. References back to `docs/interceptor-recipe.md` for the conceptual model.
- `examples/interceptor/claude-code-settings.json` — minimal `~/.claude/settings.json` fragment with just the `hooks` block for `mcp__workflow-server__*`.
- `examples/interceptor/cursor-hooks.json` — Cursor's `beforeMCPExecution` configuration.
- `examples/interceptor/opencode-plugin.ts` — TypeScript plugin file for OpenCode's `tool.execute.before` hook.
- `examples/interceptor/codex-hooks.json` — Codex CLI's `PreToolUse` hook configuration.
- `examples/interceptor/claude-agent-sdk-callback.ts` — Claude Agent SDK programmatic registration example.
- All files use realistic placeholder values (`workflow-server-interceptor inject` / `capture`) so they work as-shipped if dropped into the expected location.

---

### Task 6: Audit log redaction — `src/logging.ts` (20 min)

**Goal:** Stop `withAuditLog` from logging the auto-injected `session_token` and `checkpoint_handle` to the audit log. The interceptor makes those values machine-managed; logging them is gratuitous credential exposure.

**Depends on:** None (independent of the CLI surface).

**Deliverables:**

- `src/logging.ts:82-104` — modify `withAuditLog` to redact `session_token` and `checkpoint_handle` keys from the `params` object before calling `logAuditEvent`. Implementation: clone the `params` object (`{...params}`) and replace the two keys with the literal string `"[redacted]"` when present. Preserve the field's presence — the goal is "did the call include a token?" debuggability, not "what was the token value?".
- Unit test confirming that for a representative `params` object containing both `session_token` and `checkpoint_handle`, neither token's verbatim characters appear anywhere in the captured `logAuditEvent` payload; both keys are present with the literal value `"[redacted]"`.
- A second unit test confirming the redaction is shallow — nested params (if any) are untouched, and other keys (e.g., `workflow_id`, `option_id`) are preserved verbatim.

**Verification:** `npm test` reports 2 new test cases passing; `npm run typecheck` clean.

### Task 7: Documentation cleanup pass (30 min)

**Goal:** Soften LLM-guidance text across tool descriptions, parameter descriptions, and error messages to acknowledge the interceptor as the recommended fix. The text was written assuming the LLM constructs the wire JSON; under the interceptor it does not.

**Depends on:** Task 9 (so the tool descriptions reference the collapsed-parameter shape rather than the dual-parameter shape).

**Deliverables:**

- `src/tools/resource-tools.ts` — `start_session` tool description's `STRICT PARAMETERS` and `STALENESS RECOVERY POLICY` notices: soften to "applies when running without the harness interceptor". Keep the substance for the no-interceptor fallback path.
- `src/utils/session.ts:188-192` — `session_token` parameter `.describe(...)` text: soften from "REQUIRED. The session token string..." to language acknowledging the interceptor: "Session token. Managed automatically by the harness interceptor (recommended); pass explicitly when running without the interceptor or when resuming a saved session through `start_session`."
- `src/utils/session.ts:75-82` — HMAC-failure error message: keep the message but acknowledge the interceptor as the primary fix. New text shape: "Invalid session token: HMAC signature verification failed. The interceptor (workflow-server-interceptor) prevents this failure mode by managing the token automatically — if you are seeing this without the interceptor installed, recover by going through start_session with the saved token." (Final wording determined at implement time; the substance is what matters.)
- `src/tools/workflow-tools.ts` — after Task 9 collapses the dual-parameter shape, update `present_checkpoint` and `respond_checkpoint` tool descriptions to drop "or `checkpoint_handle`" mentions and replace with single-parameter language; if a deprecation alias is shipped (decided in Task 9), note it as deprecated.
- `README.md` — add a top-level documentation pointer to `docs/interceptor-recipe.md` near the existing Quick Start so installers find the hook recipe without grepping.

**Verification:** `npm test` and `npm run typecheck` still pass; the descriptions render in `discover` output without truncation or formatting glitches.

### Task 8: Meta-skill rule pruning (workflows submodule branch) (30-40 min)

**Goal:** Reflect the interceptor's correctness invariants in the meta workflow's `workflow-engine` skill: rules that exist only to discipline the LLM into token-handling correctness are softened to "applies when running without an MCP-client interceptor"; rules that are made moot by the collapsed-parameter API are removed; one new rule is added to handle the cross-session boundary on parent resume.

**Depends on:** Task 9 (the collapsed-parameter API determines which rules become moot).

**Branch strategy:** Operate inside the `workflows` submodule. Create a fresh branch off `workflows` (TBD name; likely `feat/interceptor-rule-pruning` or similar). Do **not** reuse `enhancement/session-token-size-optimization-meta`, which is associated with the now-reverted tier-C work. Commit + push the submodule branch, then bump the parent repo's submodule pointer in a parent-side commit on `feat/112-interceptor-cli`.

**Deliverables (in `meta/skills/00-workflow-engine.toon`):**

- Mark these four rules as "applies when running without an MCP-client interceptor": `token-passes-on-each-call`, `use-most-recent-token`, `start-session-strict-params`, `parameter-vs-variable` (the latter only insofar as it discusses tokens).
- Remove `checkpoint-handle-distinct-from-session` (under collapsed-parameter API, the distinction no longer exists at the wire level).
- Update `thread-resumed-token` to reference `session_token` (the collapsed-API field name) rather than `checkpoint_handle`. The semantics — "the orchestrator must thread the post-respond_checkpoint token down to the worker on resume" — are unchanged; only the field name in the rule text changes.
- ADD a new rule `explicit-session-on-resume` near the existing `token-in-prompt` rule:
  > When a parent agent regains control after a sub-agent dispatch, its next workflow-server tool call must explicitly pass its own session_token (not rely on the interceptor's `current.token` pointer, which is still holding the sub-agent's last captured token). The capture hook then overwrites `current.token` with the parent's token, restoring single-pointer correctness for subsequent calls.
- The existing `token-in-prompt` rule (INBOUND session-boundary handoff) remains as-is — it covers the complementary direction.

**Verification (submodule):** Resource regeneration if applicable (workflow data is TOON, not generated code). Commit + push the submodule branch. Bump the parent repo's submodule pointer; verify `git submodule status` resolves cleanly on the parent's `feat/112-interceptor-cli`.

### Task 9: Collapse `checkpoint_handle` / `session_token` dual-parameter API (BREAKING) (45-60 min)

**Goal:** Eliminate the dual-parameter shape on `present_checkpoint` and `respond_checkpoint`. The shape existed to give the LLM two recognizable names for one token slot; under the interceptor, that ergonomic justification disappears. Collapse to a single `session_token` parameter (required on both tools).

**Depends on:** None for the core code change; the workflows submodule update piece depends on Task 8's branch setup.

**Breaking change:** This is an MCP tool-surface breaking change. User has explicitly approved. Document in the PR description and release notes.

**Deliverables:**

- `src/tools/workflow-tools.ts` — `present_checkpoint`:
  - Remove `checkpoint_handle` from the Zod input schema.
  - Make `session_token` required.
  - Remove the `handle = checkpoint_handle ?? session_token` line; pass `session_token` directly to downstream logic.
  - Update the tool description string to drop the dual-parameter language.
- `src/tools/workflow-tools.ts` — `respond_checkpoint`: same set of changes as `present_checkpoint`.
- **Response-body field naming (decision required):** The current `yield_checkpoint` and `respond_checkpoint` response bodies return a `checkpoint_handle` field. Two options:
  - **Option 9A**: Rename the response field to `session_token` for consistency with the input. Cleanest. Breaks any consumer that reads `checkpoint_handle` off the response body.
  - **Option 9B**: Keep both fields populated on the response body for one release: `session_token` (canonical) AND `checkpoint_handle` (deprecation alias, same value). Allows a softer migration.
  - **Recommendation:** Option 9A, since the whole point of this task is to retire the duality; a one-release alias defeats the cleanup. Final decision deferred to the implement activity.
- Update all tests in `tests/mcp-server.test.ts` (and any other test file under `tests/`) that pass `checkpoint_handle: ...` to use `session_token: ...`. Likewise for assertions on response shape if Option 9A is taken.
- Update the workflows submodule's `meta/skills/00-workflow-engine.toon` operations — specifically `workflow-engine::present-checkpoint-to-user` and `workflow-engine::respond-checkpoint` — to use the renamed parameter at the operation-level parameter binding. This change ships on the same submodule branch as Task 8.

**Verification:** `npm run typecheck` and `npm test` pass after both the server-side and submodule-side updates land. Collapsed-API tests in the test plan (see test-plan.md TC-30, TC-31, TC-32) confirm the new shape; rejection tests confirm the old `checkpoint_handle` parameter is no longer accepted.

### Task 10: Revert tier-C commits (30-45 min)

**Goal:** Revert the two tier-C commits on `enhancement/session-token-size-optimization` (`1cd7d56` "feat(session): add SessionStore, CBOR wire codec, state_hash modules" and `f7a4cd8` "feat(session): switch wire format to CBOR; move state to SessionStore"). The interceptor eliminates the transcription-corruption motivation for tier-C; the modules become dead weight pending a future, separately-motivated need.

**Depends on:** None (separate branch; can run in parallel with the rest of the work).

**Branch strategy:** This task operates on `enhancement/session-token-size-optimization`, **not** on `feat/112-interceptor-cli`. The interceptor PR does NOT include the revert directly. However, the revert is documented as part of THIS work package because it shares the same redundancy-analysis motivation.

**Two options for how the revert lands** (decision deferred to the implement activity):

- **Option 10A (clean):** Revert commits land on the existing `enhancement/session-token-size-optimization` branch; that branch is closed (no PR, branch deleted). The `main` branch never sees tier-C and never sees its revert — the history is clean.
- **Option 10B (traceable):** Open a separate PR that reverts the commits and merges to `main`. History records the change explicitly. Useful if tier-C had any visibility on `main` (it does not, as of this work package start).

**Recommendation:** Option 10A. Tier-C never reached `main`; reverting on an unmerged branch and abandoning the branch is the cleanest outcome.

**Deliverables:**

- On `enhancement/session-token-size-optimization`, run `git revert 1cd7d56 f7a4cd8` (or two separate reverts in dependency order — `f7a4cd8` first if it depends on `1cd7d56`'s exports; `git revert` will surface the correct ordering through conflict resolution).
- Resolve any revert conflicts by hand; the goal is to restore the pre-tier-C state precisely.
- `npm run typecheck` and `npm test` pass after revert. This is the bulk of the time budget — verifying no other branch depends on tier-C exports.
- If Option 10A is taken: close the branch and delete it locally + remote.
- If Option 10B is taken: open a revert PR with body explaining the redundancy-analysis motivation, link back to this work package.

**Verification:** `npm test` green; `npm run typecheck` clean; no references to `SessionStore`, `state_hash`, or the CBOR codec remain in the post-revert tree (apart from history).

---

## Success Criteria

### Functional Requirements

**Interceptor (tasks 1-5):**

- [ ] `workflow-server-interceptor` is callable from `PATH` after `npm install -g @m2ux/workflow-server`.
- [ ] `inject` injects the `current.token` token into `mcp__workflow-server__*` calls when no token is already present.
- [ ] `inject` is a no-op for `start_session`.
- [ ] `inject` never clobbers an agent-supplied `session_token` or `checkpoint_handle`.
- [ ] `inject` is a no-op (pass-through) when `current.token` is missing or empty.
- [ ] `capture` extracts the response token from `_meta.session_token` and writes it to the per-sid file `<STATE_DIR>/<sid-hex>.token` and the shared `<STATE_DIR>/current.token`, each with `0600` permissions.
- [ ] `capture` extracts `sid` from the token payload (base64url-decode + JSON.parse + strip dashes) and uses the resulting 32-character hex as the per-sid filename component.
- [ ] `capture` degrades gracefully when sid extraction fails: it still writes `current.token`; no spurious per-sid file is created.
- [ ] `capture` creates the state directory with `0700` permissions when missing.
- [ ] `capture` is a no-op when the response has no `_meta` or no token.
- [ ] Multiple distinct sids each get their own `<sid-hex>.token` file; `current.token` reflects the most recent capture.
- [ ] All filesystem errors are caught — neither subcommand ever exits non-zero or blocks the call.

**Redundancy cleanup (tasks 6-10):**

- [ ] `withAuditLog` redacts `session_token` and `checkpoint_handle` from the audit log; the literal token characters never appear verbatim in the captured `logAuditEvent` payload.
- [ ] `start_session` description, `session_token` parameter description, and HMAC-failure error message reference the interceptor as the recommended fix.
- [ ] `README.md` has a top-level pointer to `docs/interceptor-recipe.md`.
- [ ] Meta workflow's `workflow-engine` skill has four token-handling rules softened to "applies when running without an MCP-client interceptor"; `checkpoint-handle-distinct-from-session` removed; `thread-resumed-token` updated to reference `session_token`; new `explicit-session-on-resume` rule added.
- [ ] `present_checkpoint` and `respond_checkpoint` accept only `session_token` (required); `checkpoint_handle` is no longer in the input schema.
- [ ] Workflows submodule's `present-checkpoint-to-user` and `respond-checkpoint` operations use the renamed parameter; parent repo's submodule pointer bumped.
- [ ] Tier-C commits `1cd7d56` and `f7a4cd8` reverted on `enhancement/session-token-size-optimization`; `npm test` and `npm run typecheck` pass on the post-revert branch.

### Quantitative Targets

- [ ] **Test count:** ≥ 36 new test cases (29 interceptor cases from TC-01..TC-29 plus 7+ cleanup cases from TC-30..TC-36+: audit-redaction, collapsed-API acceptance, collapsed-API rejection, tier-C revert verification, cross-session boundary integration).
- [ ] **Implementation size:** `src/hooks/cli.ts` ≤ 350 LOC including comments; `src/logging.ts` redaction adds ≤ 15 LOC; combined task 6-10 source-line delta is bounded by the breaking-change collapse (which is mostly deletions) plus the doc-string softening (mostly text).
- [ ] **Dependency footprint:** zero new runtime dependencies in `package.json`.

### Quality Requirements

- [ ] `npm run typecheck` clean.
- [ ] `npm test` green (existing tests plus new hooks-cli tests).
- [ ] No new TODOs introduced.
- [ ] `docs/interceptor-recipe.md` covers all five target harnesses with verified configuration snippets.
- [ ] `examples/interceptor/` files are syntactically valid (JSON parses; TypeScript compiles in isolation).

### Measurement Strategy

- **Branch coverage:** Each test case maps to exactly one inject or capture branch; the test plan's acceptance matrix confirms every branch has a corresponding test.
- **Permission assertions:** Capture tests use `statSync(path).mode & 0o777` to assert literal mode bits, not just "file exists."
- **No-regression check:** `npm test` reports total count; compare before and after.

---

## Testing Strategy

The detailed test plan with case-by-case objectives is in [05-test-plan.md](05-test-plan.md). The high-level shape:

### Unit Tests

- Inject branches: 9 cases (happy, skip-on-start_session, skip-on-existing-token, skip-on-existing-handle, skip-on-non-workflow-target, missing-pointer-file, empty-pointer-file, malformed-stdin, inject-reads-pointer-not-per-sid).
- Capture branches: ~19 cases — sid extraction and layout (sid extraction, dual write, multi-sid → multi-file, current-reflects-most-recent, existing-file overwrite, sid-extraction-fallback) plus filesystem and skip behaviour (state-dir creation at `0700`, `0600` token-file mode, missing `_meta`, missing token, non-string token, empty-string token, malformed stdin, atomic-write no-temp-leftover).
- Audit redaction: 2-4 cases (redact `session_token` from `start_session` params, redact from `next_activity` params, redact `checkpoint_handle` from `respond_checkpoint` params, shallow-redaction invariant).
- Collapsed-API: 3-4 cases (`present_checkpoint({ session_token })` accepted; `present_checkpoint({ checkpoint_handle })` rejected — or warns if a deprecation alias is shipped per Task 9; `respond_checkpoint({ session_token, option_id })` accepted; response-body field shape matches Task 9 decision).
- Tier-C revert verification: `npm test` passes on `enhancement/session-token-size-optimization` after revert; legacy `decodeSessionToken` exports restored.
- Cross-session boundary integration: 1 case — spawn sub-agent with its own session_token in prompt; assert interceptor does not clobber; assert parent's first call after sub-agent return uses parent's token explicitly (validates `explicit-session-on-resume` rule).

### Integration / Manual Verification

- A reviewer following `docs/interceptor-recipe.md`'s verification steps end-to-end against one configured harness (Claude Code, since it is the canonical target). Not automated in v1; tracked as a manual checklist on the PR.

---

## Dependencies & Risks

### Requires (Blockers)

- [x] Design philosophy committed (`01-design-philosophy.md`).
- [x] Assumptions log committed (`01-assumptions-log.md`).
- [x] PR #113 open against `feat/112-interceptor-cli`.

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Per-harness JSON field names differ enough that the inject heuristic misses a target | MEDIUM | LOW | Task 3 tests use the literal shapes each harness emits, sourced from the design-philosophy harness inventory. Any mismatch is caught by unit tests before shipping. |
| `current.token` pointer races between concurrent active workflow-server sessions | LOW | LOW | Per-sid files (v1, in scope) survive concurrent captures; only the `current.token` pointer is affected. Manual recovery (copy desired `<sid-hex>.token` over `current.token`) is documented. True per-sid inject is a v2-graceful upgrade. |
| Wire token shape changes break sid extraction | MEDIUM | LOW | Capture's sid-extraction failure path is a documented graceful fallback — `current.token` is still written, no per-sid file is created, and the CLI exits 0. Covered by a unit test against a malformed-payload token. |
| Cold-start cost of spawning Node per call is noticeable | LOW | MEDIUM | Assumption B3 accepts ~50 ms as the v1 trade-off. Native build is a documented v2 option. |
| Atomic-rename write is not atomic on Windows | LOW | LOW | Node's `fs.renameSync` is atomic on the same FS on Windows for non-existing destinations, and overwrites are atomic on POSIX. The capture's `.tmp` + `rename` pattern is the standard portable idiom. |
| A future harness changes its PreToolUse JSON shape | MEDIUM | LOW | The CLI's pass-through-on-unknown-shape contract means a shape change causes no-op rather than corruption. Re-tested on harness version bump. |
| `npm install -g` not in user's preferred install path | LOW | MEDIUM | The recipe documents `npx workflow-server-interceptor` as an alternative invocation; the bin entry supports both. |
| Collapsed-parameter API breaks an external consumer (Task 9) | MEDIUM | LOW | Breaking change is explicitly approved by user (A-19); documented in PR description and release notes. One-release deprecation alias on the response body is a feasible softening if a consumer surfaces — Option 9B in the task description. |
| Tier-C revert leaves dangling references on a sibling branch (Task 10) | LOW | LOW | `npm run typecheck` and `npm test` after revert catch every dangling reference. Tier-C was strictly additive (E3), so the post-revert state is precisely the pre-tier-C state. |
| Audit-log redaction breaks a downstream log consumer that expected token values (Task 6) | LOW | LOW | No downstream consumer of token values in the audit log is identified at planning time. The redaction preserves the field's presence so "did the call include a token?" remains answerable. |
| Cross-session boundary correctness depends on agent discipline rather than mechanical enforcement | MEDIUM | LOW | A new meta-rule (`explicit-session-on-resume`) + an integration test together close the gap. Mechanical enforcement (e.g., interceptor detecting cross-session boundaries) would require sid-hint awareness in the inject hook, which is the v2-deferred work. |
| Meta-rule pruning lands in a separate submodule branch from the interceptor source (Task 8) | LOW | LOW | Standard submodule update flow: commit on submodule branch, push, bump parent pointer. `git submodule status` verifies the bump on the parent's branch. |

---

**Status:** Ready for implementation.
