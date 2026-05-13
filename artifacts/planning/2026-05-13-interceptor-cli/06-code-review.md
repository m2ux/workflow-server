# Code Review — feat/112-interceptor-cli

**Activity:** post-impl-review (code-review step)
**Date:** 2026-05-13
**Reviewer:** post-impl-review worker
**Scope:** Implementation changes on `feat/112-interceptor-cli` against `main`.

---

## Verdict

Implementation conforms to the design philosophy and the work-package
plan. Failure-safe contract holds end-to-end; audit-log redaction is
shallow and comprehensive; collapsed API is consistent across server,
tests, recipe, and meta workflows; sid extraction degrades to
pointer-only as designed. Net file delta is +1436/-69 across 21 files,
within the planned envelope.

`needs_code_fixes = false` — see "Findings" below for severity breakdown.

---

## Findings

### Critical

None.

### Major

None.

### Minor

**M1. Stale documentation outside the scope of Task 7 still describes
the dual-parameter API.**

`docs/api-reference.md` lines 31-34, 105-110 and the whole of
`docs/checkpoint_model.md` still describe `present_checkpoint` /
`respond_checkpoint` as accepting `checkpoint_handle` and returning a
`checkpoint_handle` in the yield response body. Under the collapsed
API (block 06/07) these descriptions are inaccurate. Task 7 explicitly
scoped doc updates to `start_session` (resource-tools), `session_token`
parameter description (session.ts), the HMAC error message (session.ts),
the `present_checkpoint`/`respond_checkpoint` tool descriptions
(workflow-tools), and `README.md`. The api-reference and
checkpoint_model files were not in the task list and are not part of
the LLM-facing tool surface — they are reviewer-facing static docs.

- **Impact:** Reader confusion only; no functional regression. Anyone
  consulting `docs/api-reference.md` or `docs/checkpoint_model.md`
  will see API shapes that no longer match the wire schema.
- **Fix-or-accept:** Fix in a small follow-up commit on this branch.
  ~10 line changes across two files; low risk; tightens the
  documentation surface while the redundancy-cleanup pass is fresh.
  Alternative: defer to a "docs sweep" follow-up PR.

### Nit / Informational

**N1. Hard-coded state directory under `~/.claude/`.**

`src/hooks/cli.ts:32` resolves `STATE_DIR` from `os.homedir() + '.claude' + 'workflow-server-tokens'`. Three harnesses (OpenCode, Codex CLI, Cursor) do not use `~/.claude/` as their config root; embedding the state under Claude Code's convention couples the CLI to one harness's directory convention even though the CLI itself is harness-agnostic.

- **Impact:** Cosmetic. The state directory is internal and not surfaced to the user except in the recipe; the recipe documents the location explicitly.
- **Fix-or-accept:** Accept for v1. A future iteration can add an env-var override (e.g., `WORKFLOW_SERVER_STATE_DIR`) without breaking the default. Not raised as Minor because the recipe explicitly documents `~/.claude/workflow-server-tokens/` as the state directory across all harnesses, so the coupling is at the doc level too.

**N2. `process.exit(0)` after `main()` short-circuits any pending I/O.**

`src/hooks/cli.ts:293` calls `process.exit(0)` unconditionally. All current writes are synchronous (`writeFileSync`, `renameSync`, `chmodSync`, `process.stdout.write` on a small payload), so this is safe today. If the CLI ever gains async work it must be allowed to drain before exit.

- **Impact:** None today; latent if the CLI is later extended to use async fs.
- **Fix-or-accept:** Accept. The synchronous-only contract is implicit in the design (cold-start budget is ~50 ms; no async benefit) and the failure-safe wrapper already covers exceptions.

**N3. Top-level `process.argv[2]` dispatch with no `--help` / `--version`.**

A user invoking `workflow-server-interceptor` without an argument
gets an empty `{}\n` on stdout and exits 0. This is by design (the
fail-safe contract), but `--help` / `--version` flags would aid
discoverability for someone who runs the binary out of curiosity.

- **Impact:** Cosmetic.
- **Fix-or-accept:** Accept for v1. Adding `--help` / `--version`
  switches is a follow-up enhancement; not required for the hook
  contract.

**N4. `readPointerToken` trims the file but `writeTokenFile` doesn't append a newline.**

Reading code (`src/hooks/cli.ts:139-148`) calls `.trim()` on the file
contents to be defensive against trailing whitespace introduced by
e.g. an editor. The writer (`writeTokenFile`) writes the raw token with
no trailing newline. The trim is therefore defensive coverage for the
hand-edited recovery case (a user copying one `<sid-hex>.token` over
`current.token` with `cp`, where some shells/editors append a newline).
This is correct but worth a one-line comment in `readPointerToken`
explaining "trim handles hand-edited recovery from per-sid copy".

- **Impact:** None.
- **Fix-or-accept:** Accept (or one-line comment).

---

## Strengths worth noting

1. **CLI failure-safe contract is consistent end-to-end.** Every parse
   error, fs error, malformed payload, and unknown subcommand routes
   to a pass-through emit; the final guard in `main()` (`src/hooks/cli.ts:287-291`) catches anything the
   subcommand bodies miss, and `process.exit(0)` is unconditional. This
   matches the design intent (§3.4) and is the load-bearing invariant
   of the whole feature.

2. **Atomic write with explicit mode handling.** `writeTokenFile`
   (`src/hooks/cli.ts:115-133`) opens the `.tmp` with `0o600`, writes,
   chmods the tmp to `0o600` again (defending against umask), then
   `rename`s, then chmods the destination one more time (defending
   against destination-side mode carry-over on some filesystems). This
   is deliberately belt-and-braces and reads cleanly.

3. **Sid extraction is well-bounded.** `extractSidHex`
   (`src/hooks/cli.ts:73-91`) validates each step (token type / length;
   presence of `.`; base64url decode; JSON.parse; object check; `sid`
   string check; UUID-pattern regex) and returns `null` on any failure.
   The capture path treats `null` as "write pointer only", which both
   the unit tests (TC-18, TC-18b, TC-18c) and the design (§3.5)
   explicitly require.

4. **Audit-log redaction is shallow and deliberate.** `redactParams`
   (`src/logging.ts:27-33`) shallow-clones and replaces only the two
   known top-level keys. The module-level docstring on
   `REDACTED_PARAM_KEYS` (lines 9-17) records the rationale ("preserve
   field presence for debuggability"). The trace path keeps the raw
   params because `decodeSessionToken` needs the actual token — this
   asymmetry is intentional and could merit a one-line comment in
   `withAuditLog` for future readers, but is not a defect.

5. **Collapsed-API rename is internally consistent.** Server schema
   (workflow-tools.ts blocks 06, 07), server response bodies (no
   `checkpoint_handle` field), session error message (`assertCheckpointsResolved`),
   integration tests (TC-33, TC-34, TC-35a, TC-35b, TC-35c), and the
   meta-workflow operation parameter bindings (submodule commit
   `161ff0d`) all use `session_token` uniformly. The only places
   `checkpoint_handle` still appears in `src/` are (a) the CLI's
   skip-on-existing-handle rule (intentional — fallback for any agent
   still constructing the legacy name) and (b) the audit-log redaction
   key set (intentional — defense in depth in case a stale caller
   passes the legacy name through). Both are documented behaviors.

6. **HMAC-failure error message is now interceptor-first without
   losing the staleness recovery path.** `src/utils/session.ts:75-82`
   leads with the interceptor recommendation, keeps the server-restart
   /tamper diagnosis as a secondary cause, and preserves the
   `start_session`-auto-adopt recovery path. The legacy
   "re-yield checkpoint_handle" sentence is correctly dropped (the
   field name no longer exists at the wire level).

7. **Recipe doc covers all five planned harnesses with the same
   pattern.** `docs/interceptor-recipe.md` walks through Claude Code,
   Cursor, OpenCode, Codex CLI, and Claude Agent SDK with consistent
   structure (config snippet → notes → pointer to copy-pasteable
   example file). The verification (§8) and troubleshooting (§9)
   sections are usable end-to-end.

---

## Compliance with design and plan

### Design philosophy alignment

- §3.4 failure modes — all five enumerated cases (state file missing,
  multi-session race, agent-supplied token, start_session, hook
  absent) have corresponding behavior in the CLI plus a test for
  each except "hook absent" (which is by definition tested by the
  pre-interceptor status quo).
- §3.5 state directory layout (`<sid-hex>.token` + `current.token`,
  `0700`/`0600` modes, atomic writes) matches the implementation
  exactly.
- §5.1 in-scope items — all 7 itemized items present.
- §5.2 out-of-scope items — none of the explicitly-deferred items
  (native build, server-side state attestation, wire-format change,
  true multi-active-session inject) leak into the implementation.
- §6.1-6.5 redundancy cleanup — all tasks landed; tier-C revert
  parked on the separate `enhancement/session-token-size-optimization`
  branch per Option 10A (closed, no PR).

### Plan task alignment (`05-work-package-plan.md`)

- Task 1 (CLI): file is 296 LOC including docstrings, under the
  ≤350 LOC budget.
- Task 2 (bin/shebang/build): `package.json` bin entry, `files` array,
  shebang preserved (verified by TC-28).
- Task 3 (tests): 33 cases (TC-01..TC-29 with sub-suffixes) vs the
  plan's ~28-30 target; coverage is broader than minimum.
- Task 4 (recipe doc): nine sections, all five harnesses.
- Task 5 (examples): five harness configs + README; all parse.
- Task 6 (audit redaction): `redactParams` + 5 redaction tests
  (TC-30, TC-31, TC-32, TC-32b, TC-32c).
- Task 7 (doc cleanup): four planned doc surfaces touched
  (resource-tools `start_session` description, `sessionTokenParam`
  description, `assertCheckpointsResolved` text, HMAC error message,
  README.md). See M1 for two additional surfaces not in the original
  plan list.
- Task 8 (meta-skill rules): submodule commit `161ff0d` matches the
  plan's six bullet points exactly (4 rules softened, 1 removed, 1
  updated, 1 added, operation parameters renamed).
- Task 9 (collapsed API): Option 9A executed (response field
  renamed to `session_token`, no `checkpoint_handle` alias on the
  response body). Integration tests cover acceptance and rejection.
- Task 10 (tier-C revert): on `enhancement/session-token-size-optimization`
  branch as `36fb736` and `8c46f8d`; branch closed (Option 10A).

### Success-criteria checkpoints (`05-work-package-plan.md` § Success Criteria)

All functional and quantitative bullets are satisfied except:
- Test count ≥ 36: 33 hooks-cli + 5 redaction + 6 collapsed-API
  changes in mcp-server.test.ts = 44 net new/changed test cases.
  Above the ≥ 36 target.
- Implementation size: `src/hooks/cli.ts` is 296 LOC (≤350 target);
  `src/logging.ts` redaction adds 27 LOC (≤15 target was nominal —
  the docstring and `REDACTED_PARAM_KEYS` constant account for the
  overshoot; the actual logic is 5 LOC).
- No new TODOs: confirmed (`grep -rn "TODO\|FIXME" src/hooks/ src/logging.ts src/utils/session.ts src/tools/`).
- Dependency footprint: zero new runtime deps (`package.json` shows
  only the additive `bin` and `files` keys).

---

## Recommended actions

1. **Accept the implementation as-is for the interceptor + cleanup pass.**
   `needs_code_fixes = false`.
2. **Optionally fix M1 (api-reference / checkpoint_model staleness)
   in a follow-up commit on this branch** before merging the PR. ~10
   lines across two files; brings the static docs into line with the
   collapsed API. Defer if a separate "docs sweep" is preferred.
3. **Nits N1-N4 — defer to follow-ups** if any are taken at all; none
   are quality-gate failures.
