# Test Suite Review — feat/112-interceptor-cli

**Activity:** post-impl-review (test-suite-review step)
**Date:** 2026-05-13
**Reviewer:** post-impl-review worker
**Scope:** Test changes on `feat/112-interceptor-cli` against `main`.

---

## Verdict

Test coverage exceeds the planned envelope (≥36 cases target; 44 net
new/changed cases observed). Branch coverage of the CLI is exhaustive
(every documented inject and capture branch has a dedicated case).
Redaction tests cover both code paths (success and error) and the
shallow-redaction invariant. The collapsed-API rename is exercised on
both acceptance and rejection sides. No anti-patterns observed (no
mock-heavy unit tests, no shared mutable state between cases — each
test gets a fresh `mkdtemp` `HOME`).

`needs_test_improvements = false` — see "Findings" below.

---

## Coverage matrix

### `tests/hooks-cli.test.ts` (33 cases against the CLI)

**Inject branches (11 cases):**

| Case | Branch | Notes |
|------|--------|-------|
| TC-01 | happy path — merges current.token into updatedInput.session_token | baseline |
| TC-02 | preserves other tool_input fields | regression guard against overwrite |
| TC-03 | skip on `start_session` | mandated by §3.4 |
| TC-04 | skip on pre-existing `session_token` | mandated by §3.4 |
| TC-05 | skip on pre-existing `checkpoint_handle` | defensive (legacy compat) |
| TC-06 | skip on non-workflow-server target | prefix-match guard |
| TC-07 | pass-through on missing pointer file | mandated by §3.4 |
| TC-08 | pass-through on empty pointer file | edge case |
| TC-09 | pass-through on malformed stdin | failure-safe guard |
| TC-10 | exit 0 on unreadable pointer file | fs-error guard |
| TC-11 | inject reads pointer, not per-sid file | architectural assertion |

**Capture branches (20 cases):**

| Case | Branch | Notes |
|------|--------|-------|
| TC-12 | sid extraction → per-sid file with correct hex filename | baseline |
| TC-13 | dual write at mode 0600 | mode + content assertion |
| TC-14 | state directory created at mode 0700 when missing | first-run case |
| TC-15 | multiple distinct sids produce multiple per-sid files; current=latest | concurrency support assertion |
| TC-16 | current.token reflects most recent capture | latest-wins assertion |
| TC-17 | in-place overwrite for same sid; no leftover .tmp | atomic rename |
| TC-18 | sid-extraction fallback → pointer-only when payload malformed | graceful degradation |
| TC-18b | sid-extraction fallback when payload lacks sid | graceful degradation |
| TC-18c | sid-extraction fallback when sid is not a UUID | graceful degradation |
| TC-19 | no-op when response has no `_meta` | guard |
| TC-20 | no-op when `_meta.session_token` missing | guard |
| TC-21 | no-op when `_meta.session_token` is null | type guard |
| TC-22 | no-op when token is a number | type guard |
| TC-22b | no-op when token is a boolean | type guard |
| TC-23 | no-op when token is empty string | length guard |
| TC-24 | exit 0 on malformed stdin | failure-safe guard |
| TC-25 | exit 0 on fs error (state dir cannot be created) | failure-safe guard |
| TC-26 | no .tmp files after successful dual write | atomic-write invariant |
| TC-27 | every written token file is mode 0600 | mode invariant |
| TC-27b | captures from wrapped `tool_response._meta.session_token` | Claude Code wrapper shape |

**Build / packaging (2 cases):**

| Case | Branch | Notes |
|------|--------|-------|
| TC-28 | built CLI has `#!/usr/bin/env node` shebang | install-shim verification |
| TC-29 | package.json bin entry points at `dist/hooks/cli.js` | install-shim verification |

### `tests/logging-redaction.test.ts` (5 cases against `withAuditLog`)

| Case | Branch | Notes |
|------|--------|-------|
| TC-30 | session_token redacted on success path | `[redacted]` sentinel + verbatim-absent assertion |
| TC-31 | checkpoint_handle redacted on success path | same pair of assertions |
| TC-32 | shallow redaction — other top-level keys preserved verbatim, nested object containing the same token verbatim preserved | scope assertion |
| TC-32b | redaction on error path | guards against half-implemented redaction |
| TC-32c | params with no sensitive keys passed through verbatim | no-op guard |

### `tests/mcp-server.test.ts` (collapsed-API delta, 9 cases touched + 1 new)

| Case | Branch | Notes |
|------|--------|-------|
| L66-75 (`resolveCheckpoints` helper) | reads `session_token` from response bodies | test helper rename — exercised by every checkpoint integration test downstream |
| L372 (yield_checkpoint shape) | asserts `content.session_token` | response-body field rename verification |
| Six `respond_checkpoint` call sites | each now passes `session_token: cpHandle` | wire-level rename verification |
| TC-33 (present_checkpoint accept) | asserts response.session_token defined AND response.checkpoint_handle undefined | Option 9A assertion |
| TC-34 (respond_checkpoint accept) | same dual assertion | Option 9A assertion |
| TC-35a (present_checkpoint reject) | rejects when session_token omitted | schema strictness |
| TC-35b (respond_checkpoint reject) | rejects when session_token omitted | schema strictness |
| TC-35c (present_checkpoint reject with legacy param) | NEW — rejects when only checkpoint_handle provided | collapsed-API strictness |

### Aggregate

- 33 + 5 + 6 = 44 net new/changed cases on this branch.
- Plan target was ≥ 36 cases (29 interceptor + 7+ cleanup).
- Coverage exceeds target by ~22 %.

---

## Findings

### Critical

None.

### Major

None.

### Minor

None.

### Nit / Informational

**N1. TC-35c indirectly tests the collapsed-API rejection.**

TC-35c (mcp-server.test.ts:1397-1407) submits `{checkpoint_handle: "some-value"}` and asserts the call fails. The reason it fails is that `session_token` is missing (the MCP SDK rejects the unknown key OR the Zod schema rejects the missing required key — either way, the result is `isError === true`). The test does NOT assert that the failure is specifically due to the unknown key OR the missing required key, only that the call fails. This is sufficient for the planned guarantee ("legacy parameter alone is no longer accepted") but a stricter assertion on the error message would prevent a regression where some future change makes `checkpoint_handle` a silent no-op rather than an outright failure.

- **Impact:** Latent — the test would still pass under the regression described, even though the regression is not what we want.
- **Fix-or-accept:** Accept for v1. The shape of the assertion is in line with sibling tests (TC-35a, TC-35b) which also assert `isError === true` without inspecting the message. Tightening would be a small follow-up.

**N2. Cross-session boundary integration test not present.**

Plan §"Testing Strategy" lists a "Cross-session boundary integration"
test ("spawn sub-agent with its own session_token in prompt; assert
interceptor does not clobber; assert parent's first call after
sub-agent return uses parent's token explicitly — validates
`explicit-session-on-resume` rule"). This test is not in the diff.
The rule itself is added to the workflows submodule (`harness-compat::spawn-agent`)
and is workflow-engine-level discipline, so the validation is
documentation-and-rule rather than runtime-asserted. The test would
have required a live MCP harness with hooks installed; v1 explicitly
defers integration testing against real harnesses (plan §"Out of
Scope").

- **Impact:** The cross-session boundary correctness relies on agent
  discipline per the new rule rather than on a regression test.
- **Fix-or-accept:** Accept. Documented gap; matches plan's out-of-scope.
  A unit-level proxy could be added (e.g., simulate a yield-then-resume
  cycle with two `current.token` values) but adds little signal beyond
  what TC-04 (skip on existing session_token) already exercises.

**N3. Tier-C revert-verification test not present in this PR.**

Plan §"Testing Strategy" lists "Tier-C revert verification: `npm test`
passes on `enhancement/session-token-size-optimization` after revert;
legacy `decodeSessionToken` exports restored." This verification lives
on the separate (closed) `enhancement/session-token-size-optimization`
branch, not on `feat/112-interceptor-cli`. The interceptor PR diff is
clean of tier-C references.

- **Impact:** None. The verification is by construction (the revert
  commits restored the pre-tier-C state; `npm test` was run on the
  reverted branch before closing it).
- **Fix-or-accept:** Accept. The verification scope is correct.

---

## Strengths worth noting

1. **Per-test isolation via `mkdtempSync`.** Every test gets its own
   `HOME` directory; no cross-test state leakage. The `afterEach`
   cleanup uses `recursive: true, force: true` so a partial test
   never leaves grit behind.

2. **CLI invoked via `execFileSync` with `process.execPath`.** The
   tests run the actual built CLI (`dist/hooks/cli.js`) using the
   same Node binary the host harness would. This catches shebang,
   permission, and module-resolution issues that an in-process test
   would not.

3. **Realistic token shape.** `buildToken` helper produces a
   `<base64url(JSON)>.<dummy-signature>` string with all the
   payload fields the real server emits. Sid-extraction tests
   exercise the actual decoding path, not a mocked one.

4. **Mode assertions are literal, not approximate.** TC-13, TC-14,
   TC-27 use `statSync(path).mode & 0o777` and assert exact octal
   values (`0o600`, `0o700`). This catches umask leaks and
   permission-carry-over bugs that "file exists" assertions would
   miss.

5. **Permission-stripping test (TC-10) gracefully handles
   non-POSIX / root contexts.** The test wraps `chmodSync` in
   try/catch so it still asserts exit code 0 even when the
   permission strip is a no-op (e.g., running as root or on a
   filesystem that ignores mode bits).

6. **Redaction tests assert both presence and absence.** TC-30, TC-31,
   TC-32b each (a) assert the sensitive key is replaced with
   `'[redacted]'` AND (b) assert the verbatim token string does NOT
   appear anywhere in the stringified audit event. This catches
   half-implemented redactions (e.g., replacing the value but leaving
   it logged in a separate field).

7. **Shallow-redaction test (TC-32) explicitly preserves nested copies.**
   TC-32 deliberately embeds the token string inside a nested
   `step_manifest` element to confirm the redaction is scoped to
   top-level keys and does NOT descend. This pins the contract —
   if a future change adds deep redaction, this test catches the
   behavior shift.

---

## Recommended actions

1. **Accept the test suite as-is.** `needs_test_improvements = false`.
2. **Nits N1-N3 — defer to follow-ups** if any are taken; none are
   quality-gate failures.
