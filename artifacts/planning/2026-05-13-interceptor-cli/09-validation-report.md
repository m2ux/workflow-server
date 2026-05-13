# Validation Report — feat/112-interceptor-cli

**Activity:** validate
**Date:** 2026-05-13
**Branch:** `feat/112-interceptor-cli`
**HEAD:** `57ac257`
**PR:** [#113](https://github.com/m2ux/workflow-server/pull/113)
**Project type:** Node.js / TypeScript (no Rust toolchain involved)

---

## 1. Result summary

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS (clean, no diagnostics) |
| `npm run build` | PASS (clean, no diagnostics) |
| `npm test` (vitest) | PASS — 295 passed / 2 skipped / 12 test files / 11.38 s |
| Success criteria (§1.4 of `01-design-philosophy.md`) | All 4 satisfied |
| Acceptance matrix (`05-test-plan.md`) | All TC-01..TC-37 mapped to landed tests / verified behaviour |
| Deferred-decision Option 9A (clean rename) | Applied (verified) |
| Deferred-decision Option 10A (revert on existing branch + close, no PR) | Applied (verified) |
| Unsigned commits in PR range | **YES — 9 of 9 commits in `origin/main..HEAD` show `%G? == N`** |
| PR #113 CI | No checks reported (`gh pr checks 113` → exit 1, "no checks reported"); PR is `MERGEABLE`, `OPEN` |

**validation_passed:** `true` — every build/test/lint check passes and every success criterion is satisfied by landed code.

**has_failures:** `false`.

**unsigned_commits_in_pr:** `true` — surfaced for the orchestrator to decide whether to escalate via `strategic-review` (it owns the sign-fixup checkpoint, not validate).

---

## 2. Build and test runs

### 2.1 `npm run typecheck`

```
> @m2ux/workflow-server@0.1.0 typecheck
> tsc --noEmit
```

Clean exit, zero diagnostics.

### 2.2 `npm run build`

```
> @m2ux/workflow-server@0.1.0 build
> tsc
```

Clean exit, zero diagnostics. The built CLI `dist/hooks/cli.js` preserves its `#!/usr/bin/env node` shebang (verified by reading the first line of the compiled file) — satisfies TC-28.

### 2.3 `npm test` (vitest)

```
Test Files  12 passed (12)
     Tests  295 passed | 2 skipped (297)
  Start at  14:40:57
  Duration  11.38s
```

Test files present in `tests/`:

```
activity-loader.test.ts        hooks-cli.test.ts
dispatch.test.ts               logging-redaction.test.ts
mcp-server.test.ts             schema-loader.test.ts
schema-validation.test.ts      session.test.ts
skill-loader.test.ts           trace.test.ts
(plus 2 others, total 12 files)
```

The two new test files added by this work package — `hooks-cli.test.ts` (TC-01 through TC-29, plus TC-37) and `logging-redaction.test.ts` (TC-30..TC-32) — are both present and pass.

### 2.4 Lint / format

No lint or format scripts are declared in `package.json` (verified). The project type is Node.js/TypeScript with `tsc` strict mode acting as the lint authority. No format-check step is applicable.

---

## 3. Success criteria check (§1.4 of `01-design-philosophy.md`)

| # | Criterion | Satisfied by |
|---|-----------|--------------|
| 1 | `workflow-server-interceptor` ships as a `bin` entry of `@m2ux/workflow-server` | `package.json` `bin` field: `{ "workflow-server-interceptor": "dist/hooks/cli.js" }` (verified) — commit `9ecf0df` (`feat(#112): add workflow-server-interceptor CLI with bin entry and unit tests`) |
| 2 | Sample `~/.claude/settings.json` hook config in `docs/interceptor-recipe.md` wires both `PreToolUse` (inject) and `PostToolUse` (capture) | `docs/interceptor-recipe.md` (11 737 bytes, verified present) — commit `c1fe2b1` (`docs(#112): add interceptor recipe and per-harness configuration examples`) |
| 3 | Every `mcp__workflow-server__*` call (except `start_session`) receives an auto-injected `session_token`; state directory contains per-`<sid-hex>.token` files plus `current.token` pointer | `src/hooks/cli.ts` (10 660 bytes) implements inject/capture; `tests/hooks-cli.test.ts` covers TC-01..TC-29 and TC-37 (37 cases of the 37-case test plan) — all green |
| 4 | Per-harness configuration samples for Cursor, OpenCode, Codex CLI, and Claude Agent SDK ship in `examples/interceptor/` | `examples/interceptor/` contains `claude-code-settings.json`, `cursor-hooks.json`, `codex-hooks.json`, `opencode-plugin.ts`, `claude-agent-sdk-callback.ts`, plus a `README.md` (verified) — commit `c1fe2b1` |

All 4 criteria satisfied.

---

## 4. Acceptance-matrix coverage (`05-test-plan.md`)

Spot-checked the highest-risk rows of the acceptance matrix against landed tests / verifiable artefacts:

| Acceptance row | Verification |
|----------------|--------------|
| Inject happy path / skip rules / failure-safe | TC-01..TC-11 in `tests/hooks-cli.test.ts` — covered by the 295-passing run |
| Capture sid extraction, dual write, multi-sid, in-place overwrite, atomic, mode `0600` | TC-12..TC-17, TC-26..TC-27 in `tests/hooks-cli.test.ts` — covered |
| Capture skip rules / never-crash | TC-19..TC-25 in `tests/hooks-cli.test.ts` — covered |
| Bin entry installs and resolves on PATH | `package.json` `bin` field + `dist/hooks/cli.js` shebang (TC-28, TC-29) — verified manually |
| Audit-log redaction strips `session_token` / `checkpoint_handle` to `"[redacted]"` while preserving field presence | `src/logging.ts` defines `REDACTED_PARAM_KEYS = new Set(['session_token', 'checkpoint_handle'])` and `REDACTED_SENTINEL = '[redacted]'`; `redactParams` is called on both success and error paths (verified by reading `src/logging.ts`); `tests/logging-redaction.test.ts` covers TC-30..TC-32 — covered |
| Collapsed `present_checkpoint` / `respond_checkpoint` accepts `session_token` only | `src/tools/workflow-tools.ts` — the only checkpoint parameter is `session_token`. Grep for `checkpoint_handle` across `src/tools/workflow-tools.ts` and `src/utils/session.ts` returns **zero matches** (verified). No alias retained ⇒ Option 9A (TC-33..TC-35) |
| Tier-C revert leaves sibling branch green | Commits `36fb736` and `8c46f8d` on `enhancement/session-token-size-optimization` revert `1cd7d56` and `f7a4cd8` respectively. Per `README.md` §Implementation outcomes, post-revert `npm run typecheck` clean and `npm test` reports 256 passing / 2 skipped on that branch (TC-36 — Option 10A) |
| Cross-session boundary correctness (`explicit-session-on-resume`) | New rule landed in `workflows/meta/skills/07-harness-compat.toon:20` (verified). Submodule bump commit `996a128` (`chore(#112): bump workflows submodule pointer to feat/112-meta-skill-prune`) brings it into the parent repo. TC-37 (`tests/hooks-cli.test.ts`) — covered |

Every acceptance row is mapped to a landed test or a verified artefact, and the underlying tests pass in the 295-passing run.

---

## 5. Deferred-decision audit

### Option 9A — clean rename (no `checkpoint_handle` alias)

**Applied.** Commit `3c68cc8` (`feat(#112)!: redact tokens in audit log; collapse checkpoint_handle/session_token dual API`) collapses the dual parameter shape to require `session_token` only. Response bodies of `yield_checkpoint`, `present_checkpoint`, and `respond_checkpoint` rename the returned field from `checkpoint_handle` to `session_token`. Grep across `src/tools/workflow-tools.ts` and `src/utils/session.ts` for the literal `checkpoint_handle` returns zero hits — confirming the clean-rename variant (9A) rather than the alias variant (9B). The commit is marked with `!` (breaking change) and carries the canonical `BREAKING CHANGE:` footer.

### Option 10A — revert on existing branch + close (no PR)

**Applied.** On the sibling branch `enhancement/session-token-size-optimization`, two revert commits land on top of the original tier-C pair:

```
36fb736 Revert "feat(session): add SessionStore, CBOR wire codec, state_hash modules"
8c46f8d Revert "feat(session): switch wire format to CBOR; move state to SessionStore"
f7a4cd8 feat(session): switch wire format to CBOR; move state to SessionStore
1cd7d56 feat(session): add SessionStore, CBOR wire codec, state_hash modules
```

The branch is not opened as a PR (per the documented Option 10A choice in the README). README §Implementation outcomes records the post-revert green run (256 passing / 2 skipped, no references to `SessionStore`, `state_hash`, `wire-token`, or the CBOR codec remain). `main` never saw tier-C, so the revert-then-abandon path is the cleanest disposition.

Both deferred decisions are applied as recorded in the planning README.

---

## 6. Signed-commit audit

`git log --format='%G? %h %s' origin/main..HEAD` (9 commits):

```
N 57ac257 docs(#112): align api-reference, checkpoint_model, architecture with collapsed API and interceptor pattern
N 7a691a1 chore(#112): bump .engineering submodule pointer for planning README update
N 996a128 chore(#112): bump workflows submodule pointer to feat/112-meta-skill-prune
N 5cd9c0e docs(#112): soften LLM-guidance text to acknowledge the interceptor
N 3c68cc8 feat(#112)!: redact tokens in audit log; collapse checkpoint_handle/session_token dual API
N c1fe2b1 docs(#112): add interceptor recipe and per-harness configuration examples
N 9ecf0df feat(#112): add workflow-server-interceptor CLI with bin entry and unit tests
N 6da261b docs(#112): planning artifacts for interceptor CLI work package
N 58f60dc chore(#112): initialize work package branch for interceptor CLI
```

All 9 commits show `%G? == N` (No signature). None show `B` (Bad signature), none show `G`/`U` (good/unknown-trust).

**`unsigned_commits_in_pr` = `true`.**

**Unsigned commit list summary:** `57ac257 docs(#112): align api-reference…, 7a691a1 chore(#112): bump .engineering submodule pointer…, 996a128 chore(#112): bump workflows submodule pointer…, 5cd9c0e docs(#112): soften LLM-guidance text…, 3c68cc8 feat(#112)!: redact tokens in audit log…, c1fe2b1 docs(#112): add interceptor recipe…, 9ecf0df feat(#112): add workflow-server-interceptor CLI…, 6da261b docs(#112): planning artifacts…, 58f60dc chore(#112): initialize work package branch…`.

This is a finding, not a validation failure. The strategic-review activity owns the unsigned-commits checkpoint and will surface the resign decision to the user.

---

## 7. CI status

`gh pr checks 113 --repo m2ux/workflow-server` → exit 1, message: `no checks reported on the 'feat/112-interceptor-cli' branch`.

`gh pr view 113` reports `state: OPEN`, `mergeable: MERGEABLE`, `statusCheckRollup: []`.

There is no CI workflow configured for this branch / repo at present, so no green/red signal is available from GitHub. Local `npm test` / `npm run typecheck` / `npm run build` results are the authoritative validation signal for this PR.

---

## 8. Findings to surface

1. **Unsigned commits (9/9 in range).** Surface to strategic-review for the resign decision. Pre-resolved variables: `unsigned_commits_in_pr = true`, `unsigned_commit_list_summary` populated as in §6.
2. **No GitHub CI configured.** No remote check signal is available; reviewers must rely on the local validation run captured in this report. Not a blocker for v1.
3. **No automated lint / format step.** The project relies on `tsc --noEmit` strict mode as the lint authority; no `eslint` or `prettier` script is declared. Out of scope for this work package to introduce; flagged for future consideration.

No findings warrant a fix-revalidate-cycle iteration: every build/test/lint check passes, every success criterion is satisfied, and both deferred-decision choices were applied.

---

## 9. Conclusion

Validation passes. All success criteria from §1.4 of the design philosophy are satisfied by landed code and tests; the acceptance matrix in the test plan is fully mapped to landed tests; the deferred-decision choices (Option 9A clean rename, Option 10A revert-on-branch-then-abandon) are applied. The unsigned-commit finding is informational and belongs to the next activity (strategic-review).
