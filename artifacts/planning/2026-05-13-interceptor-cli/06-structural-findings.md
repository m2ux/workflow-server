# Structural Findings — feat/112-interceptor-cli

**Activity:** post-impl-review (structural-analysis-inline step)
**Date:** 2026-05-13
**Lens:** L12 inline structural pass (single-pass, complexity == simple)
**Scope:** Changed files on `feat/112-interceptor-cli`.

---

## Conservation Law

> **Token-handling responsibility is conserved across the LLM → harness → server pipeline. Removing the LLM as a token carrier requires that an equivalent carrier (the harness hook) take over the entire lifecycle — capture, persistence, injection — with the same correctness invariants the LLM was being asked to uphold (most-recent-token, no-corruption, no-clobber-on-explicit-pass).**

Every line of the diff respects this law:

- **Capture lifecycle** (`runCapture` in cli.ts) is the new owner of "most-recent-token" — what the meta-skill rule `use-most-recent-token` previously required the LLM to maintain.
- **Inject lifecycle** (`runInject` in cli.ts) is the new owner of "token-passes-on-each-call" — what the rule of the same name previously required the LLM to perform.
- **Skip-on-explicit-pass** (cli.ts:188-195) is the new mechanical enforcement of `agent-supplied-tokens-are-never-clobbered` (assumption D4).
- **Skip-on-`start_session`** (cli.ts:183-186) is the new mechanical enforcement of "the caller may legitimately be resuming with a saved token" (assumption D5).

The audit-log redaction (logging.ts) is the **dual** of conservation: the
auditing system, which previously logged tokens because the LLM was
constructing them and they were therefore observable in-context, no
longer needs them in the audit log because the LLM no longer touches
them. Logging them now would be gratuitous (the call source already has
them by other means — the file system).

The collapsed API (`present_checkpoint`, `respond_checkpoint`) is the
**reduction** of conservation: the dual-parameter shape existed to give
the LLM two surface names for one underlying slot. Under the
interceptor, the LLM never sees the surface; reducing two names to one
is therefore a lossless simplification.

---

## Meta-Law

> **In a layered system, redundancy in one layer often exists to compensate for fragility in an adjacent layer. Removing the fragility (LLM transcription drift) makes the redundancy load-bearing in reverse — it becomes the obstacle to a clean shape.**

The redundancy-cleanup pass (tasks 6-10) exists precisely because the
interceptor changes which layer owns the token. Specifically:

- The dual-parameter API existed to compensate for the LLM's
  difficulty reliably picking the right parameter name. With the
  interceptor doing the picking, the dual API has no consumer.
- The token-handling meta-rules existed to discipline the LLM into
  correct behavior. With the interceptor mechanically enforcing the
  same behavior, the rules become reminders for the no-interceptor
  fallback only.
- The audit-log token-logging existed because the LLM was the source
  of the value being logged. With the file system as the source, the
  audit log doesn't need to mirror it.
- The HMAC-failure error message led with "did you transcribe wrong?"
  recovery. With transcription corrupt-proofed, the error message
  leads with "install the interceptor" and demotes transcription to
  a fallback diagnosis.

Each of these is an instance of the meta-law: the fix at one layer
exposed compensating mechanisms at adjacent layers that no longer
need to do that work.

---

## Classified Bug Table

L12 scan against the diff. No bugs found at any severity. The
classification table is therefore enumerated by category with
"none observed" entries:

| Category | Severity range | Count | Notes |
|----------|---------------|-------|-------|
| Off-by-one / boundary | Critical / Major | 0 | sid extraction validates 32-hex output (UUID regex catches 7- or 9-digit hex); base64url decode tolerates padding (Buffer.from with `'base64url'` is padding-tolerant on Node ≥ 16). |
| Race / concurrency | Critical / Major | 0 | Atomic rename for both per-sid file and pointer; per-sid files survive concurrent captures by design (captures are independent). The known `current.token` pointer race is a documented v1 limitation, not a bug. |
| Resource leak (fd, memory) | Major | 0 | `writeTokenFile` uses try/finally to ensure `closeSync` runs; no async work means no unawaited promises. |
| Null / undefined dereference | Major / Minor | 0 | Every external read goes through `parseJsonSafe` (returns `null` on error), `extractSidHex` (returns `null` on any failure), or explicit typeof checks before use. |
| Type coercion / unexpected truthiness | Minor | 0 | All branches use explicit `typeof === 'string'` and `.length > 0` checks. The skip-on-existing-token and skip-on-existing-handle branches both require non-empty string, not just truthy. |
| Error swallowing without diagnostic | Minor | 0 | All catches are intentional and documented (the failure-safe contract requires silent swallowing). The trade-off is acknowledged in design philosophy §3.4. |
| Security — credential exposure | Critical / Major | 0 | Token files are mode `0600`; state dir is `0700`; audit log redacts tokens; the CLI never logs or echoes the token to stderr. |
| Security — TOCTOU on file mode | Minor | 0 | `writeTokenFile` uses `openSync` with explicit mode in one syscall plus a follow-up `chmodSync`; race window is bounded by atomic rename. |
| Privilege escalation / path traversal | Critical | 0 | sid is constrained to 32 lowercase hex chars by UUID regex; filename component cannot escape the state dir. |
| Cross-platform — Windows path / mode | Minor | 0 | The recipe explicitly notes Windows does not honor POSIX mode bits; the CLI's `chmodSync` calls are wrapped in try/catch and labeled "best-effort". |
| API contract violation | Major | 0 | Collapsed API is consistent on input schema, response body, tool description, error message, audit redaction key, meta-workflow operation binding, and integration test. |
| Test correctness | Major / Minor | 0 | All tests use isolated `mkdtemp` HOMEs; assert on literal mode bits; verify both presence and absence of redaction sentinel. |
| Test scope (false positive) | Minor | 0 | No tests rely on undocumented behavior; each maps to a design philosophy or plan checklist item. |
| Test scope (false negative — silent gaps) | Minor | 1 (N2 in test-suite-review) | Cross-session boundary correctness has no runtime regression test; relies on workflow-engine rule. Documented as accepted out-of-scope deferral. |
| Documentation drift | Minor | 1 (M1 in code-review) | `docs/api-reference.md` and `docs/checkpoint_model.md` still describe the dual-parameter API. Outside Task 7 scope; flagged as a small fix-or-defer. |
| Magic numbers / configuration coupling | Nit | 1 (N1 in code-review) | State directory is hard-coded under `~/.claude/` (Claude Code convention) even though the CLI is harness-agnostic. Documented in the recipe, so the doc-level coupling matches. |

---

## Diff-level structural observations

1. **The interceptor is a pure overlay.** Zero edits to wire format,
   tool schemas (other than the deliberate parameter collapse), or
   server endpoints. The change can be reverted by removing the
   `bin` entry and the hooks block from `~/.claude/settings.json`;
   the server continues to function as it did before.

2. **The cleanup pass is structurally consistent with the interceptor.**
   Every Task 6-10 change is downstream of "the LLM no longer
   constructs the token". This makes the cascading scope clean rather
   than opportunistic: every removed/modified piece was a
   compensation for the failure mode the interceptor eliminates.

3. **The collapsed API is the only externally-observable breaking
   change.** Approved by the user; documented in the PR description
   (to be confirmed at validate); covered by acceptance and
   rejection integration tests.

4. **Meta-workflow correctness is preserved across the boundary.**
   The four softened rules (`token-passes-on-each-call`,
   `use-most-recent-token`, `start-session-strict-params`,
   `parameter-vs-variable`) each preserve their full substance under
   "applies when running without an MCP-client interceptor". The new
   rule (`explicit-session-on-resume`) plugs the only correctness gap
   the cleanup introduces (parent-resume after sub-agent dispatch).

5. **Test coverage is asymmetric in the right direction.** The CLI
   (the new code) has 33 tests; the audit redaction has 5; the
   collapsed API has 9. The CLI's failure-safe contract is the
   load-bearing invariant of the whole feature; the bulk of test
   weight there is appropriate.

---

## Verdict

Implementation is structurally sound. Zero classified bugs.
Two informational drifts (M1 doc staleness, N2 cross-session
integration test deferral). The conservation and meta laws are
preserved end-to-end.

`needs_code_fixes = false`, `needs_test_improvements = false`.
