# Change Block Index — feat/112-interceptor-cli

**Activity:** post-impl-review (manual-diff-review step)
**Date:** 2026-05-13
**Branch:** `feat/112-interceptor-cli`
**Base:** `main`
**Commits:** 8 (1 chore-seed, 1 docs-planning, 6 task implementations + submodule pointer bumps)
**Diff stat:** 21 files changed, 1436 insertions(+), 69 deletions(-)

This index enumerates every change block (file + logical hunk) on the
branch with a one-line description of intent. Use it as the spine for a
side-by-side diff review. Block numbers are referenced by the
`code-review.md` and `test-suite-review.md` artifacts.

---

## Source code

| #  | Path | Lines | Intent |
|----|------|-------|--------|
| 01 | `src/hooks/cli.ts` | +296 / -0 | NEW — interceptor CLI: `inject` + `capture` subcommands; stdlib-only; failure-safe (exit 0 unconditionally); sid extraction via base64url+JSON.parse+UUID-strip; dual-write to per-sid file and `current.token` (mode `0600`, dir `0700`, atomic `.tmp`+rename). |
| 02 | `src/logging.ts:1-33` | +20 / -1 | Add `REDACTED_PARAM_KEYS = {session_token, checkpoint_handle}` set + `REDACTED_SENTINEL = "[redacted]"` + `redactParams()` helper. Module docstring explains why redaction is shallow. |
| 03 | `src/logging.ts:109-131` | +2 / -2 | `withAuditLog` success-path and error-path each route `params` through `redactParams()` before `logAuditEvent`. Trace path still gets the raw params (token is needed for `decodeSessionToken`). |
| 04 | `src/tools/workflow-tools.ts:250-285` (`yield_checkpoint`) | -1 / -1 | Tool description text updated: `checkpoint_handle` → `session_token`. Response body unchanged (already returned `session_token`). |
| 05 | `src/tools/workflow-tools.ts:287-310` (`resume_checkpoint`) | (no net change — description previously named `session_token`) | n/a (unchanged in this PR). |
| 06 | `src/tools/workflow-tools.ts:312-339` (`present_checkpoint`) | -10 / -2 | Drop `checkpoint_handle` from Zod schema; drop `handle = checkpoint_handle ?? session_token` fallback line; response body returns `session_token` directly (no `checkpoint_handle` field). Tool description updated. |
| 07 | `src/tools/workflow-tools.ts:343-441` (`respond_checkpoint`) | -20 / -8 | Same shape as `present_checkpoint`: drop `checkpoint_handle` from Zod input; response body uses `session_token` (no `checkpoint_handle` alias). Tool description softened. |
| 08 | `src/utils/session.ts:75-82` | +3 / -4 | HMAC-failure error message rewritten to acknowledge the interceptor as the primary fix; keep server-restart / tamper / staleness as the fallback diagnosis; collapse the legacy "re-yield the checkpoint_handle" sentence. |
| 09 | `src/utils/session.ts:188-191` | +1 / -1 | `session_token` parameter description softened: now reads "Managed automatically by the MCP-host harness interceptor when installed... Pass explicitly when running without the interceptor". |
| 10 | `src/utils/session.ts:201-205` | +1 / -1 | `assertCheckpointsResolved` error text: `checkpoint_handle` → `session_token` (matches collapsed API). |
| 11 | `src/tools/resource-tools.ts:36-45` | +2 / -2 | `start_session` description's `STRICT PARAMETERS` and `STALENESS RECOVERY POLICY` notices each suffixed "applies when running without the harness interceptor". Substance preserved for the no-interceptor fallback. |

## Tests

| #  | Path | Lines | Intent |
|----|------|-------|--------|
| 12 | `tests/hooks-cli.test.ts` | +379 / -0 | NEW — 33 test cases (TC-01..TC-29 with sub-suffixes) covering inject branches (happy, skip on start_session / existing token / existing handle / non-ws target / missing pointer / empty pointer / malformed stdin / unreadable pointer / per-sid not scanned) and capture branches (sid extraction, dual write, multi-sid, current=latest, in-place overwrite, sid-extraction fallback (3 sub-cases), 0700 dir, 0600 file mode, missing `_meta`, missing token, null/number/boolean token, empty string, malformed stdin, fs error, no leftover .tmp, wrapped `tool_response._meta`, shebang, bin entry). |
| 13 | `tests/logging-redaction.test.ts` | +96 / -0 | NEW — 6 cases (TC-30/31/32/32b/32c) covering session_token redaction, checkpoint_handle redaction, shallow-redaction invariant, error-path redaction, no-op when no sensitive keys. |
| 14 | `tests/mcp-server.test.ts` (resolveCheckpoints helper, ~L66-75) | +3 / -3 | Test helper updated to consume `session_token` from `yield_checkpoint` / `respond_checkpoint` response bodies (was reading `checkpoint_handle`). |
| 15 | `tests/mcp-server.test.ts:372` | +1 / -1 | yield_checkpoint response shape assertion: `content.session_token` instead of `content.checkpoint_handle`. |
| 16 | `tests/mcp-server.test.ts` (respond_checkpoint argument calls, ~L1120-1318) | +6 / -6 | Six `respond_checkpoint` invocations now pass `session_token: cpHandle` instead of `checkpoint_handle: cpHandle`. |
| 17 | `tests/mcp-server.test.ts:1320-1352` | +3 / -2 | TC-33 (renamed from "present_checkpoint should accept session_token"): asserts `response.session_token` defined AND `response.checkpoint_handle` undefined (Option 9A). |
| 18 | `tests/mcp-server.test.ts:1356-1380` | +3 / -2 | TC-34 (renamed from "respond_checkpoint should accept session_token"): same Option 9A assertions on respond_checkpoint response. |
| 19 | `tests/mcp-server.test.ts:1383-1390` | +1 / -2 | TC-35a: `present_checkpoint` rejects when `session_token` is omitted; removed assertion on legacy "Either checkpoint_handle or session_token" message. |
| 20 | `tests/mcp-server.test.ts:1392-1395` | +1 / -2 | TC-35b: `respond_checkpoint` rejects when `session_token` is omitted; same legacy-text removal as 19. |
| 21 | `tests/mcp-server.test.ts:1397-1407` | +11 / -0 | NEW — TC-35c: `present_checkpoint` rejects when only `checkpoint_handle` is provided (collapsed API removes the alias from the schema). |

## Documentation and examples

| #  | Path | Lines | Intent |
|----|------|-------|--------|
| 22 | `README.md:82-85` | +4 / -0 | NEW section "Install the Token Interceptor (Recommended)" pointing at `docs/interceptor-recipe.md`. |
| 23 | `docs/interceptor-recipe.md` | +343 / -0 | NEW — full recipe doc: what/why (§1), prerequisites (§2), per-harness config (§3-7: Claude Code, Cursor, OpenCode, Codex CLI, Claude Agent SDK), verification (§8), troubleshooting (§9). |
| 24 | `examples/interceptor/README.md` | +20 / -0 | NEW — table of examples with where-it-goes pointers. |
| 25 | `examples/interceptor/claude-code-settings.json` | +20 / -0 | NEW — minimal hooks block fragment. |
| 26 | `examples/interceptor/cursor-hooks.json` | +14 / -0 | NEW — `beforeMCPExecution` / `afterMCPExecution` example. |
| 27 | `examples/interceptor/opencode-plugin.ts` | +46 / -0 | NEW — TS plugin using `tool.execute.before/after` and spawnSync. |
| 28 | `examples/interceptor/codex-hooks.json` | +16 / -0 | NEW — Codex CLI `PreToolUse`/`PostToolUse` example. |
| 29 | `examples/interceptor/claude-agent-sdk-callback.ts` | +100 / -0 | NEW — TS helpers `injectSessionToken` / `captureSessionToken` + Python equivalent in trailing comment. |

## Packaging

| #  | Path | Lines | Intent |
|----|------|-------|--------|
| 30 | `package.json:5-19` | +9 / -0 | Add `bin.workflow-server-interceptor = "dist/hooks/cli.js"` and `files = [dist, schemas, README.md, LICENSE]`. |

## Submodule pointers

| #  | Path | Lines | Intent |
|----|------|-------|--------|
| 31 | `workflows` | submodule pointer | Bump to commit `161ff0d` on `feat/112-meta-skill-prune`: meta-skill rule prune (4 token rules softened with "applies when running without an MCP-client interceptor" prefix; `checkpoint-handle-distinct-from-session` removed; `thread-resumed-token` updated to reference `session_token`; new `explicit-session-on-resume` rule added on `harness-compat::spawn-agent`; `pending_checkpoint_handle` variable renamed to `pending_checkpoint_session_token`; operation parameter bindings updated). |
| 32 | `.engineering` | submodule pointer | Bump for planning README updates. |
| 33 | `AGENTS.md`, `CLAUDE.md` | +1 / -1 each | Pointer bumps for engineering submodule. |

---

## Coverage map

- **Plan task 1** (CLI implementation): block 01.
- **Plan task 2** (bin / shebang / build wiring): blocks 01 (shebang), 30 (bin / files).
- **Plan task 3** (unit tests): block 12.
- **Plan task 4** (recipe doc): block 23.
- **Plan task 5** (per-harness examples): blocks 24-29.
- **Plan task 6** (audit redaction): blocks 02, 03, 13.
- **Plan task 7** (doc cleanup pass): blocks 08, 09, 11, 22.
- **Plan task 8** (meta-skill rule pruning): block 31.
- **Plan task 9** (collapsed API): blocks 04, 06, 07, 10, 14-21.
- **Plan task 10** (tier-C revert): on separate branch `enhancement/session-token-size-optimization` (commits `36fb736` and `8c46f8d` — not part of this PR diff). Closes that branch with no PR per Option 10A.

All 10 plan tasks accounted for. No orphan changes.

---

## Reviewer guidance

1. Open the diff side-by-side in your tool of choice (or `git diff main..HEAD` per file).
2. Walk blocks 01-12 first (source + new tests) — these carry the implementation weight.
3. Walk blocks 13-21 (test diffs) to confirm collapsed-API rename completeness.
4. Blocks 22-30 (docs/examples/packaging) are mechanical; spot-check.
5. Blocks 31-33 are submodule pointers; verify `git submodule status` resolves cleanly on the parent's `feat/112-interceptor-cli`.

Flag the block index by row number if you find an issue (e.g., "block 07
line 423 still has a dead branch"). "None" if all clean.
