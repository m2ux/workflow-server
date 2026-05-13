# Assumptions Log — MCP-Client Interceptor CLI

**Issue:** [#112](https://github.com/m2ux/workflow-server/issues/112)
**Branch:** `feat/112-interceptor-cli`
**PR:** [#113](https://github.com/m2ux/workflow-server/pull/113)
**Started:** 2026-05-13 (design-philosophy)

This log tracks assumptions made across the work package. Each entry records the assumption, the activity that introduced it, its resolvability class, current status, and any resolving evidence.

Resolvability:
- **code-analyzable** — answerable by inspecting this repo or a dependent harness's source.
- **stakeholder-dependent** — needs human input (preference, policy, scope).
- **external-validation** — needs a real installed harness or end-to-end run.

Status:
- `open` — not yet investigated.
- `resolved` — investigated; conclusion captured.
- `accepted` — left open intentionally; flagged as a known risk or deferral.

---

## A. Problem Interpretation

### A1. Transcription drift is the dominant failure mode

**Assumption:** The dominant failure mode for `session_token` validation in production traffic is LLM transcription drift, not transport corruption, server-side bugs, or token-expiry boundary cases.

**Resolvability:** stakeholder-dependent (corroborated by PR #1466 incident reports).
**Status:** accepted.
**Evidence:** PR #1466 documented a representative incident (UUID gained two stray hex characters mid-string). The character-insertion pattern is consistent with LLM attention artifacts, not bitflips or framing errors. No competing explanation has surfaced.
**Risk if wrong:** The interceptor would still be a useful structural defense, but the framing in the design doc would need adjustment.

### A2. The corrupted character almost always comes from the LLM, not the harness

**Assumption:** The harness (Claude Code, Cursor, etc.) does not itself mutate the `session_token` field between the LLM's emission and the MCP transport boundary.

**Resolvability:** code-analyzable (Claude Code, Cursor source) / external-validation.
**Status:** accepted.
**Evidence:** The hook injection point is by design upstream of any further harness processing — `PreToolUse` runs after the LLM has produced the call and before the harness forwards it. If the harness were the source of corruption, hooks would not help; the design assumes (consistent with reported incidents) that they will.
**Risk if wrong:** Hooks would not prevent the corruption pattern; this would be discovered in integration testing.

---

## B. Complexity Assessment

### B1. Single CLI file plus tests fits in 300–500 LOC

**Assumption:** The interceptor implementation, including a `PreToolUse` injector, `PostToolUse` capturer, state-file IO, skip rules for `start_session` and pre-supplied tokens, and a small integration test, fits within roughly 300–500 lines of TypeScript.

**Resolvability:** code-analyzable (will become certain during plan-prepare and implementation).
**Status:** open — reassess after plan-prepare lays out file structure.
**Risk if wrong:** Complexity classification slips from `simple` to `moderate`. The workflow path would still be valid since `skip_optional_activities = true` does not foreclose adding scoped work later.

### B2. No workflow-server source-code modification is required

**Assumption:** The interceptor lives entirely in a new file (plus `package.json` `bin` registration). No changes are needed in `src/`, `schemas/`, or workflow content.

**Resolvability:** code-analyzable.
**Status:** resolved.
**Evidence:** The interceptor is a separate CLI executable. The wire protocol is unchanged. The `bin` entry is metadata, not source modification.

### B3. Cold-start cost of ~50 ms per call via Node is acceptable

**Assumption:** Spawning Node to run the interceptor on every MCP tool call adds approximately 50 ms of latency per call, and this is acceptable for v1.

**Resolvability:** external-validation (measure on the target machine).
**Status:** accepted as a v1 trade-off.
**Risk if wrong:** If real-world latency materially exceeds 50 ms or if user-perceived responsiveness suffers, the design doc already flags a native (Rust) build as out-of-scope-for-v1 but not architecturally precluded.

---

## C. Workflow Path

### C1. No elicitation needed

**Assumption:** Requirements are fully captured by issue #112 plus the design content carried in the activity instructions; no additional stakeholder discovery is needed before planning.

**Resolvability:** stakeholder-dependent.
**Status:** resolved by pre-resolved variable `needs_elicitation = false`.
**Evidence:** Problem statement, solution approach, scope boundaries, and success criteria are all pinned in section 1–5 of `01-design-philosophy.md`.

### C2. No research needed

**Assumption:** The hook capability is known to exist in the five listed harnesses, the relevant API surfaces are documented (in those harnesses' own docs), and the design does not require investigating unfamiliar patterns or third-party prior art.

**Resolvability:** code-analyzable / external-validation.
**Status:** resolved by pre-resolved variable `needs_research = false`.
**Evidence:** Harness inventory in design doc section 3.3 lists each mechanism by name with version where applicable. The implementation pattern (read input JSON, mutate `arguments.session_token`, write back) is mechanically straightforward in each.

### C3. No comprehension needed

**Assumption:** No reading of existing workflow-server source is required to design or implement the interceptor.

**Resolvability:** code-analyzable.
**Status:** resolved by pre-resolved variable `needs_comprehension = false`.
**Evidence:** The interceptor reads and writes only the wire-level `arguments` field; it does not invoke server code. The only server-side artifact it consumes is the response token, which is already a public part of the wire contract.

---

## D. Hook Behaviour Edge Cases

### D1. Per-sid state files survive concurrent captures; inject still uses a shared pointer

**Assumption:** A per-sid file layout (`<sid-hex>.token` per observed session, plus a shared `current.token` pointer used by inject) provides enough isolation for v1: concurrent captures never destroy each other's state, and recovery from interleaved-session pointer races is per-file rather than a wholesale wipe. True multi-active-session inject (selecting per-sid on PreToolUse) requires a sid hint that the MCP tool-call context does not currently expose and remains a v2 concern.

**Resolvability:** code-analyzable (capture writes both files; inject reads the pointer) plus external-validation (concurrent-session recovery is observed in practice).
**Status:** resolved — keyed-by-sid promoted into v1 scope (see design philosophy §3.5 and §5.1).
**Evidence:** The capture-side dual write (per-sid file + pointer) is independently testable; the per-sid file name is derived deterministically from the token payload's `sid` field. The remaining residual race is on `current.token` only, with documented manual recovery (copy the desired `<sid-hex>.token` over `current.token`).
**Mitigation for the residual race:** Documented in design philosophy §3.4 and §5.2; flagged as the v2-graceful upgrade path.

### D2. Missing state file recovers cleanly

**Assumption:** When the state file is missing (first run, manual deletion, fresh machine), the `PreToolUse` hook passes the call through untouched and the first MCP response repopulates the state file.

**Resolvability:** code-analyzable (will be enforced by implementation and covered by an integration test).
**Status:** open — to be locked in during implementation.

### D3. Hook script absent ⇒ status quo, not regression

**Assumption:** When the hook script is absent or mis-installed at the harness level, the system behaves exactly as it does today — the LLM transcribes the token directly, with the occasional corruption that motivated this work.

**Resolvability:** code-analyzable / external-validation.
**Status:** accepted by design (failure-safe default).

### D4. Agent-supplied tokens are never clobbered

**Assumption:** When the agent explicitly passes a `session_token` or `checkpoint_handle` in the tool call (e.g., for a deliberate resume from a saved token), the `PreToolUse` hook detects the existing value and skips injection.

**Resolvability:** code-analyzable.
**Status:** open — to be enforced by implementation and covered by a test case.

### D5. `start_session` always skips injection

**Assumption:** The `PreToolUse` hook unconditionally skips injection for `mcp__workflow-server__start_session`, because the caller may be legitimately resuming with a saved token.

**Resolvability:** code-analyzable.
**Status:** open — to be enforced by implementation and covered by a test case.

### D6. `sid` is extractable from the wire token payload without server cooperation

**Assumption:** The workflow-server `session_token` is a JWT-style two-segment string `<payload>.<signature>`. The payload segment is base64url-encoded JSON that contains a `sid` field whose value is a UUID string (dashed form, e.g., `f921c0ed-f333-4579-a2aa-bc9f84efcbf4`). Stripping the dashes yields a 32-character hex string suitable for use as a filename component.

**Resolvability:** code-analyzable (token shape is observable in `src/lib/session-token.ts` and confirmed by the example token surfaced in the activity bootstrap).
**Status:** open — to be enforced by capture-side implementation and covered by a unit test against a representative token shape.
**Evidence:** The token resumed into this activity decodes to `{"wf":"work-package","act":"plan-prepare", ..., "sid":"428e26de-24cc-4c9b-8cf0-d78e92aab0dd", ...}`. The payload-extraction technique is purely client-side — no server endpoint is invoked.
**Risk if wrong:** If the wire token format changes (e.g., payload encryption, a non-UUID `sid`, or a different field name), `sid` extraction would fail and capture would have to fall back to writing only `current.token`. The CLI must degrade to that fallback rather than erroring; this is an explicit test case in the test plan.

---

## E. Redundancy Cleanup (Cascading Scope)

### E1. Audit-log redaction is the correct shape for tokens

**Assumption:** Tokens flowing through `withAuditLog`'s captured `params` object should be redacted to `"[redacted]"` rather than stripped entirely. Preserving the field's presence (rather than its value) keeps "did the call include a token at all?" answerable from the audit log without exposing the credential itself.

**Resolvability:** code-analyzable.
**Status:** open — to be enforced by Task 6 implementation and covered by a unit test asserting the literal `"[redacted]"` value appears in place of the original token string.
**Risk if wrong:** If downstream audit-log consumers (none identified at planning time) depend on the actual token value, redaction breaks them. Mitigation: the change is local to `withAuditLog`; a follow-up can reintroduce a hash-of-token field if the call-shape inspection is genuinely needed.

### E2. `present_checkpoint` / `respond_checkpoint` have no external consumers we need to preserve

**Assumption:** The dual-parameter shape (`checkpoint_handle` OR `session_token`, with `handle ?? session_token` collapsing them server-side) is consumed only by the meta workflow's own `workflow-engine::present-checkpoint-to-user` and `workflow-engine::respond-checkpoint` operations — no third-party tooling, no external integration tests, no documented public consumers. Therefore collapsing to a single `session_token` parameter is safe to ship as a breaking change in this PR.

**Resolvability:** code-analyzable (workflow-server source + workflows submodule operations) plus stakeholder-dependent (user's awareness of any private consumers).
**Status:** open — to be reviewed at the approach-confirmed checkpoint. User has indicated breaking changes are explicitly approved in this PR, which encompasses E2.

### E3. Tier-C revert leaves no functional regression

**Assumption:** Reverting commits `1cd7d56` and `f7a4cd8` on `enhancement/session-token-size-optimization` restores the pre-tier-C wire format (~480-char tokens) without breaking any other functionality, because tier-C was strictly additive (new modules, an opt-in wire format switch) rather than replacing existing behavior. After revert, `npm test` and `npm run typecheck` pass on the branch.

**Resolvability:** code-analyzable (inspect the two commits' surface area) plus external-validation (run the suite after revert).
**Status:** open — to be verified during Task 10 of the implement activity.
**Risk if wrong:** If a later commit on a different branch already depends on tier-C exports (e.g., `decodeSessionToken` having a different signature), the revert leaves dangling references. Mitigation: `npm run typecheck` after revert catches all such cases.

### E4. The collapsed-parameter API does not break checkpoint resumption under the interceptor

**Assumption:** Removing `checkpoint_handle` from the `present_checkpoint` and `respond_checkpoint` schemas does not break any checkpoint resumption path, because the interceptor injects `session_token` (not `checkpoint_handle`), and the server's existing `handle ?? session_token` line already accepts the injected token. All transitions stay within one `sid` / one `current.token` slot (see design philosophy §6.4).

**Resolvability:** code-analyzable.
**Status:** open — to be locked in by Task 9 and validated by the collapsed-API tests in the test plan.
**Risk if wrong:** Some checkpoint path in the meta workflow constructs `checkpoint_handle` literally and the interceptor cannot inject a substitute. Mitigation: the workflows submodule update in Task 8 renames any such operation-level parameter binding from `checkpoint_handle` to `session_token`, so the wire JSON the orchestrator emits matches the new schema.

### E5. Meta-rule pruning preserves correctness on no-interceptor fallback

**Assumption:** Softening `token-passes-on-each-call`, `use-most-recent-token`, `start-session-strict-params`, and `parameter-vs-variable` (for tokens) to "applies when running without an MCP-client interceptor" does not weaken correctness, because all four rules describe behaviors the interceptor handles automatically. Agents running without the interceptor see the same guidance they see today.

**Resolvability:** code-analyzable (rule application paths in the workflow-engine skill).
**Status:** open — to be reviewed at approach-confirmed; rule text wording finalized in Task 8.

### E6. The `explicit-session-on-resume` rule is necessary and sufficient for cross-session boundary correctness

**Assumption:** When a parent agent regains control after a sub-agent dispatch, the interceptor's `current.token` still points at the sub-agent's last captured token (because capture is parent-process-blind). To correct this, the parent's next workflow-server call must explicitly pass its own session_token, which capture then writes back to `current.token`. A single rule (`explicit-session-on-resume`) added to the workflow-engine skill is enough — no server-side change needed, no interceptor logic change needed.

**Resolvability:** code-analyzable (the rule is a workflow-engine-level invariant) plus external-validation (cross-session boundary integration test).
**Status:** open — to be enforced by Task 8 (rule added) and validated by the cross-session boundary integration test in the test plan.

---

## F. Effort & Scope

### F1. Cascading scope is acceptable in one PR

**Assumption:** Folding tasks 6–10 (audit redaction, doc cleanup, meta-rule pruning, collapsed API, tier-C revert) into the interceptor PR rather than splitting them across multiple PRs is the right trade-off. The redundancy analysis is rooted in the same insight as the interceptor; the cleanup carries no incremental risk over the interceptor itself; and the user has explicitly approved this widening.

**Resolvability:** stakeholder-dependent.
**Status:** resolved by user approval communicated at the second approach-confirmed revision cycle.

### F2. Effort estimate widens to 4.5–6h total

**Assumption:** The added tasks (6–10) add roughly 2–2.5h of agentic work to the original 2.5–3.5h estimate. Audit redaction (~20m), doc cleanup (~30m), meta-rule pruning (~30-40m), collapsed-API breaking change (~45-60m), tier-C revert (~30-45m).

**Resolvability:** external-validation (measured during the implement activity).
**Status:** accepted as the planning-phase estimate; reassess if the implement activity overruns by more than 50%.

### A-19. Collapsed-API risk: breaking change in MCP tool surface

**Assumption:** The dual-parameter shape on `present_checkpoint` and `respond_checkpoint` may have external consumers we don't know about. Accepted; the breaking change is explicitly approved in this PR; documented in the PR description and release notes.

**Resolvability:** stakeholder-dependent.
**Status:** accepted.
**Risk if wrong:** External consumers break on upgrade. Mitigation: documented breaking change in release notes; one-release deprecation of the `checkpoint_handle` parameter name on the response body is a feasible softening if needed (deferred — implement activity decides).

### A-20. Cross-session boundary handling under the interceptor

**Assumption:** Cross-session-boundary handling under the interceptor depends on (a) agents following the existing `token-in-prompt` rule for spawned children — pass the child's session_token via the spawn prompt rather than relying on `current.token` — AND (b) the new `explicit-session-on-resume` rule for returning to a parent — the parent's next workflow-server call after a sub-agent dispatch must explicitly pass its own session_token to overwrite the interceptor's stale `current.token`. Together these two rules resolve cross-session boundary correctness without server-side or interceptor changes.

**Resolvability:** code-analyzable (rule definitions in the workflow-engine skill) plus external-validation (cross-session boundary integration test).
**Status:** resolved by adding the new rule to the meta workflow's workflow-engine skill (task 8) and validated by the cross-session boundary integration test in the test plan.

---

## Reconciliation — assumptions-review activity (2026-05-13)

Final pass against plan v3 (`05-work-package-plan.md` and `05-test-plan.md`). No new assumptions surfaced from the plan revisions; the redundancy-cleanup additions (E1–E6, A-19, A-20) and the breaking-change framing are already captured above.

**Stakeholder-input audit:** No assumption in this log is awaiting external stakeholder input. The two assumptions that were originally stakeholder-dependent — E2 (no external consumers of the dual-parameter API) and A-19 (breaking-change risk in the MCP tool surface) — have been resolved by the user's explicit approval of breaking changes in this PR, recorded under F1.

**Open-status reclassification:** Assumptions presently flagged `open` (B1, D2, D4, D5, D6, E1, E3, E4, E5, E6) are all `code-analyzable` or `external-validation` and each is mapped to a closing test or implementation gate in `05-test-plan.md` §"Mapping to Assumptions". They are not gated on stakeholder interview and remain `open` only in the sense of "not yet enforced by code". The implement activity closes each one mechanically. No interview-style resolution is required.

**Conclusion:** `has_open_assumptions = false` for the purposes of this activity's interview loop. `stakeholder_review_complete = true`. No deferred-assumption summary needs posting to the issue tracker.
