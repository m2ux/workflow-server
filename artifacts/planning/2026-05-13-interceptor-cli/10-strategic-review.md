# Strategic Review — feat/112-interceptor-cli

**Activity:** strategic-review
**Date:** 2026-05-13
**Reviewer:** strategic-review worker
**Work Package:** MCP-Client Interceptor CLI
**Issue:** [#112](https://github.com/m2ux/workflow-server/issues/112)
**Branch:** `feat/112-interceptor-cli` (HEAD `57ac257`)
**PR:** [#113](https://github.com/m2ux/workflow-server/pull/113)
**Base for comparison:** `origin/main`
**Files Changed:** 21 (per `06-change-block-index.md`)
**Lines Changed:** +1436 / -69

---

## 1. Review Scope and Posture

This branch is the **intended parent for a stacked series of follow-on PRs**
(Moves #1..#7 in `01-design-philosophy.md` §6, plus the deferred items
called out in the post-impl-review artifacts). The user has explicitly
chosen **not** to merge PR #113 standalone. Strategic-review framing is
therefore "what should the parent branch satisfy as a foundation for
stacked children", **not** "what blocks immediate merge to `main`".

Scoping consequence: findings that would block a direct-to-main merge
are still surfaced below, but their disposition leans toward "address
on this branch only when fixing here is cheaper than splitting onto a
child branch". History-rewriting actions (e.g., re-signing commits)
carry an additional cost on a parent branch because every stacked
child must rebase.

---

## 2. Findings Summary

| Severity | Count | Source |
|----------|-------|--------|
| Critical | 0 | — |
| Major | 0 | — |
| Minor | 1 | code-review M1 (api-reference + checkpoint_model doc staleness) |
| Informational | 5 | code-review N1-N4; validation §8 (no CI, no lint); test-suite N1-N3 |
| **Total** | **6** | |

`needs_strategic_fixes = false`. None of the findings rise to a
quality-gate failure for this branch in its role as a stacked-PR
parent. The Minor doc-drift item is cheap to fix here and is
recommended; the rest are either out-of-scope deferrals already
documented in the planning record or genuine v2 concerns.

---

## 3. Alignment with Design and Plan

### 3.1 Code-architecture alignment

The implementation conforms to existing project conventions:

- **File layout.** New CLI lives at `src/hooks/cli.ts`; built artifact
  at `dist/hooks/cli.js`. Tests live at `tests/hooks-cli.test.ts` and
  `tests/logging-redaction.test.ts`. Examples live at
  `examples/interceptor/`. All paths follow existing repo patterns
  (no new top-level directories outside `examples/`).
- **Module boundaries.** The CLI is stdlib-only (`node:fs`,
  `node:path`, `node:os`); zero runtime dependencies; zero coupling to
  the server source tree. The audit-log redaction lives entirely
  inside `src/logging.ts` (single-file change scope); the collapsed
  API touches only `src/tools/workflow-tools.ts`, `src/utils/session.ts`,
  and `src/tools/resource-tools.ts`.
- **Naming.** `redactParams`, `REDACTED_PARAM_KEYS`,
  `REDACTED_SENTINEL`, `extractSidHex`, `writeTokenFile`,
  `ensureStateDir`, `readPointerToken` all read in line with the
  surrounding code's snake-camelCase mix; no naming surprises.
- **Error handling.** The CLI's failure-safe contract is consistent
  with the design philosophy §3.4. Every parse/fs/payload error
  degrades to a pass-through emit or silent no-op; `process.exit(0)`
  is unconditional. Server-side error handling for the collapsed API
  matches the existing tool-handler shape.
- **Testing style.** Vitest with per-test `mkdtempSync` HOME
  isolation; literal mode-bit assertions (`& 0o777`); both presence
  and absence assertions on redaction sentinels. Matches the existing
  `tests/` patterns.

No architectural drift. The implementation reads as a natural
extension of the existing module structure.

### 3.2 Design-document fidelity

Cross-checked against `01-design-philosophy.md` §1.4, §3.4, §3.5,
§5.1, §5.2, §6.1-6.5:

| Design item | Status |
|-------------|--------|
| §1.4(1) — `workflow-server-interceptor` ships as a `bin` entry | ✅ `package.json` `bin` field |
| §1.4(2) — Sample `~/.claude/settings.json` hook config in `docs/interceptor-recipe.md` | ✅ Present (commit `c1fe2b1`) |
| §1.4(3) — Every `mcp__workflow-server__*` call auto-injects `session_token`; per-sid + `current.token` files | ✅ `src/hooks/cli.ts` + 33 tests |
| §1.4(4) — Per-harness samples for Cursor, OpenCode, Codex CLI, Claude Agent SDK | ✅ `examples/interceptor/` |
| §3.4 — All 5 failure modes (state file missing, multi-session race, agent-supplied token, start_session, hook absent) handled and tested (except "hook absent" which is the pre-interceptor status quo) | ✅ |
| §3.5 — `<sid-hex>.token` + `current.token`, mode `0700`/`0600`, atomic writes | ✅ |
| §5.1 — All 7 in-scope items present | ✅ |
| §5.2 — No out-of-scope item leaked into the implementation | ✅ |
| §6.1 — Audit-log redaction (`session_token`, `checkpoint_handle`) | ✅ |
| §6.1 — Collapsed `present_checkpoint` / `respond_checkpoint` (Option 9A clean rename) | ✅ |
| §6.1 — Tier-C revert (Option 10A on `enhancement/session-token-size-optimization` branch, no PR) | ✅ |
| §6.2 — Soften `start_session` description, `session_token` parameter description, HMAC-failure error message | ✅ |
| §6.3 — Soften 4 token-handling rules, remove `checkpoint-handle-distinct-from-session`, update `thread-resumed-token`, add `explicit-session-on-resume` | ✅ Submodule pointer `161ff0d` |
| §6.4 — Checkpoint flow re-analysed; collapsed API is safe | ✅ Implemented and tested |
| §6.5 — Scope widening accepted; effort 4.5-6h | ✅ Landed within envelope |

Design fidelity is complete. No design items are unimplemented or
substituted.

### 3.3 Plan-task alignment

Tasks 1-10 in `05-work-package-plan.md` all map to landed change
blocks per `06-change-block-index.md` §"Coverage map". No orphan
changes. No missed tasks.

---

## 4. Cross-Cutting Concerns

### 4.1 Security

| Concern | Assessment |
|---------|------------|
| Credential exposure in audit log | **Mitigated.** `redactParams` replaces `session_token` and `checkpoint_handle` with `[redacted]` on both success and error paths; trace path keeps raw params (needed for `decodeSessionToken`) but trace events are not the audit log. Verified by TC-30..TC-32c. |
| File permissions on state directory | **Tightened.** `ensureStateDir` creates `~/.claude/workflow-server-tokens/` at mode `0700`; `writeTokenFile` writes per-sid and pointer files at mode `0600`, with belt-and-braces double-chmod against umask leaks and rename-side mode carry-over. Asserted with literal `& 0o777` checks (TC-13, TC-14, TC-27). |
| Path traversal via `sid` | **Mitigated.** `extractSidHex` constrains `sid` to 32 lowercase hex chars via UUID regex; the filename component cannot escape the state dir. |
| TOCTOU on file mode | **Bounded.** Atomic `.tmp` + `renameSync`; race window is between `openSync(mode 0o600)` and `chmodSync(0o600)`, which is on the `.tmp` file inside a `0700` directory — not externally observable. |
| Token in stderr / logs / error messages | **Audited.** The CLI never echoes the token; redaction covers the audit-log code path. `logInfo` / `logWarn` / `logError` are not used to log token values. No `console.log` of tokens anywhere in the diff. |
| Cross-user leakage on shared machines | **Mitigated.** State dir mode `0700` + file mode `0600` mean another user on the same host cannot read the tokens through the filesystem. Documented in the recipe. |

No security regression. Net security posture **improves** vs `main`
because token values were previously logged unredacted by
`logAuditEvent` via `withAuditLog`.

### 4.2 Performance

| Concern | Assessment |
|---------|------------|
| Per-call cold-start cost | ~50 ms Node spawn per inject + per capture. Accepted v1 trade-off per `01-design-philosophy.md` §5.2. Latency overhead is dominated by Node startup; the CLI's own work is stdlib syscalls on ≤4 KB payloads. |
| Audit-log redaction cost | Shallow clone of `params` plus a small `Set` membership check on two keys per call. O(1) in practice; immeasurable next to JSON serialization of the event. |
| State-directory growth | Per-sid files accumulate without TTL. A long-lived host will gradually grow the directory with one ~480-byte file per workflow-server session ever observed. Not flagged as a finding (the budget is per-user, on local disk, and the recipe documents the location for manual cleanup). |
| Concurrent capture races on `current.token` | Documented v1 limitation. Per-sid files survive; manual recovery is per-file. Not a performance bug; a multi-active-session correctness scope deferral. |

No performance regression. The hooked path adds ~100 ms (inject +
capture) per MCP call; acceptable for v1.

### 4.3 Observability

| Concern | Assessment |
|---------|------------|
| Audit redaction is intentional but not over-broad | **Verified.** TC-32 explicitly embeds the token verbatim inside a nested `step_manifest` element and asserts the nested copy is **preserved** — the redaction is scoped to two top-level keys, not a deep walk. This pins the contract: redaction does not silently swallow tokens that appear in non-redaction-key positions. |
| Field presence preserved | **Verified.** The `[redacted]` sentinel keeps "did this call include a token?" answerable from the audit log. |
| Trace path retains raw token | **Verified.** `withAuditLog` routes `params` through `redactParams` for the audit-log call only; the trace event still receives the raw `params` (`decodeSessionToken` needs the actual token to populate trace context). Asymmetry is intentional and worth a one-line comment in `withAuditLog` for future readers (echoed in `06-code-review.md` §"Strengths #4"). |
| CLI logging surface | The CLI itself never logs (no `console.error`, no stderr writes). It is a pure-stdin/stdout filter. This is appropriate for a hook process — host harnesses already capture spawn-process diagnostics if they need them. |

No over-redaction or under-redaction. Observability posture is
sound for v1.

---

## 5. Detailed Findings

### 5.1 Minor

**S1. Static documentation outside Task 7 scope still describes the dual-parameter API.** *(carries `06-code-review.md` M1 forward.)*

`docs/api-reference.md` (lines 31-34, 105-110) and the whole of
`docs/checkpoint_model.md` still describe `present_checkpoint` /
`respond_checkpoint` as accepting `checkpoint_handle` and returning
`checkpoint_handle` in the yield response body. Under the collapsed
API (change blocks 06/07) these descriptions are inaccurate.

- **Why it surfaces here as Minor, not just code-review-M1.** This is
  the parent branch for stacked follow-ons. Each child branch's
  reviewer will be reading `docs/api-reference.md` and
  `docs/checkpoint_model.md` while reviewing — leaving the legacy
  API shape in those docs sets a misleading baseline for every
  downstream review.
- **Estimated fix cost.** ~10 lines across two files; no code
  changes; existing tests already cover the wire shape so there is
  no risk of regression.
- **Recommended action.** Fix on this branch in a small follow-up
  commit before any child branches are opened. Alternatively, fold
  into the first child branch as its opening commit.

### 5.2 Informational

**I1. State directory is hard-coded under `~/.claude/`.** *(carries `06-code-review.md` N1 forward.)*

`src/hooks/cli.ts:32` resolves `STATE_DIR` from `os.homedir() + '.claude' + 'workflow-server-tokens'`. Three of the five supported harnesses (OpenCode, Codex CLI, Cursor) do not use `~/.claude/` as their config root. The recipe documents the location explicitly, so the doc-level coupling matches the code-level coupling, but a future env-var override (e.g., `WORKFLOW_SERVER_STATE_DIR`) would decouple the CLI from one harness's directory convention.

- **Disposition.** Accept for v1; flagged as a candidate for a child branch.

**I2. `process.exit(0)` after `main()` short-circuits any pending I/O.** *(carries `06-code-review.md` N2 forward.)*

All current writes are synchronous; this is safe today. Latent if the CLI ever gains async work.

- **Disposition.** Accept; the synchronous-only contract is the design intent and a comment would suffice if added.

**I3. No `--help` / `--version` switches.** *(carries `06-code-review.md` N3 forward.)*

A user invoking `workflow-server-interceptor` without an argument gets `{}\n` on stdout (by the fail-safe contract) and exits 0. Flags would aid discoverability.

- **Disposition.** Accept; small UX follow-up, not a quality gate.

**I4. `readPointerToken` trims but `writeTokenFile` doesn't append a newline.** *(carries `06-code-review.md` N4 forward.)*

Defensive coverage for the hand-edited recovery case (a user manually copying a per-sid file over `current.token`). Worth a one-line comment in `readPointerToken`. Not a defect.

- **Disposition.** Accept; one-line comment is the entire fix if taken.

**I5. No GitHub CI workflow configured for this branch / repo.** *(carries `09-validation-report.md` §8(2) forward.)*

`gh pr checks 113` returns "no checks reported"; the PR is `MERGEABLE` with `statusCheckRollup: []`. Local `npm test` / `npm run typecheck` / `npm run build` are the authoritative validation signal. For a stacked-PR parent this is acceptable; for direct-to-`main` merge it would warrant a remediation step. Flagged as a structural gap to address before direct merge (separate from this work package's scope).

- **Disposition.** Accept for this work package; surface as a follow-up consideration.

**I6. No automated lint / format step.** *(carries `09-validation-report.md` §8(3) forward.)*

The project relies on `tsc --noEmit` strict mode as the lint authority; no `eslint` or `prettier` script is declared in `package.json`. Out of scope for this work package; not a regression introduced by this branch.

- **Disposition.** Accept.

---

## 6. Investigation-Artifact / Over-Engineering / Orphaned-Infrastructure Audit

Per the `strategic-review` guide §"Common Patterns to Watch For":

| Category | Items found | Notes |
|----------|-------------|-------|
| Investigation Artifacts | 0 | No debug logging, no verbose error messages added for debugging, no temporary workarounds in the diff. The CLI's stdlib-only design rules out exploratory deps; the audit-log redaction commit is purpose-built, not a debugging vestige. |
| Over-Engineering | 0 | The CLI is 296 LOC (≤350 target); `redactParams` is 5 lines of logic plus a docstring; the collapsed API is a strict subtraction (no new abstraction surface). The per-sid-files-plus-pointer design is documented as v2-graceful, not speculative — single-active-session behaviour is identical to a single-file design. |
| Orphaned Infrastructure | 1 | The sibling `enhancement/session-token-size-optimization` branch (Tier-C revert) remains as an open ref with no PR. Per Option 10A this is intentional — the branch records the revert decision in git history. Surface for the user to decide whether to keep the ref for archival or delete it post-merge of #113. Not a finding against this PR's content. |

No cleanup actions required on `feat/112-interceptor-cli` itself.

---

## 7. README Conformance Check (verify-readme step)

`/home/mike1/projects/main/workflow-server/.engineering/artifacts/planning/2026-05-13-interceptor-cli/README.md` follows the standard work-package README template:

- Title, Created/Status/Type header ✓
- Executive Summary ✓
- Problem Overview ✓
- Solution Overview ✓
- Progress table (numbered + linked) ✓
- Implementation outcomes (Tier-C decision) ✓
- Links table ✓

Two informational observations:

- **README progress row #07** lists `[Strategic review](07-strategic-review.md)`; this artifact is being written at `10-strategic-review.md` (following the 09-validation-report numbering progression). Update the README's row #07 link to `10-strategic-review.md` and mark Status ✅ Complete in the exitActions step.
- The "Status" footer at line 99 still reads "Ready. Plan and test plan complete... Ready for implementation activity." — this is stale relative to current progress (implementation, post-impl-review, and validation are all complete). Update at exitActions time.

No structural drift requiring an extra strategic-review row.

---

## 8. Change-Fragment Check (verify-change-fragment step)

No `changes/` directory exists at the root of `target_path`
(`/home/mike1/projects/main/workflow-server/`). The repo does not use
a Towncrier-style fragment convention.

- `fragment_references_issue = null` (no `changes/` directory at target_path root → skip).
- The `ensure-changes-folder-entry` step is therefore a no-op.

---

## 9. Tech-Debt Assessment

This PR introduces **net negative** tech debt:

**Removed / reduced:**
- The dual-parameter shape on `present_checkpoint` / `respond_checkpoint` was a known wart kept solely for LLM ergonomics. Collapsing it is a real surface-area reduction.
- The LLM-discipline meta-rules (`token-passes-on-each-call`, `use-most-recent-token`, `start-session-strict-params`, `parameter-vs-variable`) shift from "must follow" to "applies when running without an MCP-client interceptor". The rules are still present for the no-interceptor fallback but are no longer load-bearing for correctness; less cognitive load on the workflow definitions.
- `checkpoint-handle-distinct-from-session` is removed entirely — the distinction it described has been collapsed at the wire level.
- Audit log no longer accumulates HMAC-signed credentials.

**Added (acknowledged):**
- `src/hooks/cli.ts` is a new file (296 LOC) — pure addition; lives in its own module; zero coupling to server source. Maintenance burden is bounded and proportional to the value (eliminates the token-corruption failure mode entirely).
- Five per-harness example configs under `examples/interceptor/` — these will drift over time as the harnesses evolve (Cursor and Codex CLI hook APIs are still developing). The recipe doc and example files will need periodic refresh. Acceptable cost; flagged for awareness.
- The `~/.claude/` directory coupling (I1) is a small piece of inertia that will need to be retired before any harness besides Claude Code becomes a primary supported configuration.

**Deferred (documented):**
- True multi-active-session inject (concurrent sessions racing on `current.token`).
- Cross-session boundary integration test (relies on workflow-engine rule `explicit-session-on-resume` rather than runtime assertion).
- Native (Rust) build of the CLI to reduce per-call cold-start.
- Env-var override for state directory.
- Tightened TC-35c assertion (currently asserts `isError === true` without inspecting which error).

Overall: the tech-debt ledger improves materially with this PR.

---

## 10. Unsigned-Commits Decision (resign-unsigned-pr-commits)

**Pre-resolved state:** `unsigned_commits_in_pr = true` — all 9 commits in `origin/main..HEAD` show `%G? == N` (no GPG signature). The full list is in `09-validation-report.md` §6.

**Recommendation: surface the decision to the user via the `unsigned-commits-prompt` checkpoint without prejudgement.** The activity definition routes this through the checkpoint by design; the worker should not auto-resolve. Context to inform the user's choice:

| Consideration | Direction it points |
|---------------|---------------------|
| Branch is intentionally a stacked-PR parent. Children will rebase off `HEAD`. | **Lean toward NOT re-signing**: each re-sign rewrites SHAs, forcing every child branch to rebase. The pain compounds with the stack depth. |
| `main` enforces signed commits (project convention) | **Lean toward re-signing**: even though this branch is a parent for children, eventually those children's merge commits or the parent itself need signed history to land on `main`. Deferring the re-sign just moves the cost. |
| 9 commits is small and contiguous | **Lean toward re-signing**: `git rebase --exec 'git commit --amend --no-edit -S' origin/main` is mechanical, no merge conflicts expected. |
| Push is `--force-with-lease` on a feature branch with an open PR | **Neutral**: standard for force-with-lease on author-owned feature branches; reviewers expect history rewrites on a parent that's not yet ready to merge. |
| Children may already exist | **Pivotal**: if any child branches have been cut off `feat/112-interceptor-cli` before this strategic-review, re-signing now invalidates their base; the rebase cost falls on the user. If no children exist yet, re-signing now is the cheapest moment. |

**Net recommendation:** if no child branches have been cut yet, **re-sign now** — it's the cheapest moment and the parent is destined for `main` eventually. If even one child branch is already in flight, **decline re-sign for now** and re-sign as part of the final merge prep (squash-merge or signed merge commit) after all children land. The user has the visibility on child-branch state that the worker does not.

The checkpoint will be surfaced; the user decides.

---

## 11. Minimality Assessment

| Question | Answer | Notes |
|----------|--------|-------|
| Is every changed file necessary? | Yes | All 21 files map to plan tasks 1-10 per `06-change-block-index.md` §"Coverage map". No orphan changes. |
| Is every added line necessary? | Yes | The CLI is at 296/350 LOC budget; `redactParams` is 5 lines of logic plus a docstring; collapsed-API changes are strict subtractions; doc changes are minimal substitutions ("session_token" for "checkpoint_handle"). |
| Are all new dependencies required? | N/A | Zero new runtime deps. The CLI is stdlib-only; no `package.json` additions besides the additive `bin` and `files` keys. |
| Are all config changes required? | Yes | `package.json` `bin` and `files` keys are needed for the install-shim contract (TC-28, TC-29). No other config changes. |
| Is the solution as simple as it could be? | Yes | The interceptor is a single-file CLI with two subcommands and a documented failure-safe contract; the cleanup pass is a strict simplification (subtraction, not addition). Alternative approaches (tier-C, stateful server, SEP-2624) were each rejected for documented reasons in `01-design-philosophy.md` §3.2. |

---

## 12. Strategic-Review Result

**Outcome:** Passed — no strategic-level changes required on this branch.

**Rationale:** Implementation is minimal, focused, and faithful to
the design. Cross-cutting concerns (security, performance,
observability) are addressed and net-improved vs `main`. No
investigation artifacts, no over-engineering, no orphaned
infrastructure beyond the intentional Tier-C revert branch. The one
Minor finding (static-docs drift) is cheap to fix here and worth
fixing on this branch given its role as a stacked-PR parent.

**Recommended action option:** `acceptable` — findings noted, no
changes required for this PR's role as a stacked-PR parent.

**Variables:**

```
review_passed = true
needs_strategic_fixes = false
needs_cleanup = false
recommended_strategic_option = acceptable
items_removed = []
fragment_references_issue = null
```

**Resign-unsigned-pr-commits decision:** Surface via the
`unsigned-commits-prompt` checkpoint with the cost-of-stacked-rebase
context summarized in §10. The user decides.

**Next step:** Surface the `unsigned-commits-prompt` checkpoint first
(condition `unsigned_commits_in_pr == true` is met), then the
`review-findings` checkpoint.
