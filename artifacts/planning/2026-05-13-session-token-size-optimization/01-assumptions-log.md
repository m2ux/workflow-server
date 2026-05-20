# Assumptions Log — Session Token Size Optimization

**Work Package:** session-token-size-optimization
**Date:** 2026-05-13

This log captures assumptions made during design-philosophy. It is updated in subsequent activities as further assumptions surface and are resolved.

---

## Categories

- **Problem Interpretation** — what the problem actually is and what counts as fixing it.
- **Complexity Assessment** — how risky / how big the change is.
- **Workflow Path** — which optional activities to run.

---

| ID | Assumption | Category | Resolution | Status |
|----|-----------|----------|------------|--------|
| A1 | The tier-C wire-format change (CBOR + base64url HMAC + server-side `SessionRecord` + 128-bit `sh`) is the right scope for this work package — not a smaller tier-A field-trim or a tier-B JSON-only diet. | Problem Interpretation | Confirmed in prior conversation; orchestrator pre-resolved `problem_type=specific-problem-cause-known` and `complexity=moderate` on that basis. Phases 1 and 2 have already landed implementing tier C. | Confirmed |
| A2 | The `skill` and `cond` fields on `SessionAdvance` / `SessionPayload` are dead — no request-time engine branch reads them. | Problem Interpretation | Code-resolvable. Verified during phase-2 call-site sweep: 308 tests pass with the fields dropped from the wire payload. Phase 6 will drop them from the `SessionAdvance` type as well. | Confirmed |
| A3 | 128 bits of truncated SHA-256 is sufficient collision resistance for `sh` to detect accidental state drift. | Problem Interpretation | The unforgeability boundary is HMAC; `sh` only needs accidental-drift collision resistance, for which 2^64 work to find a collision is far beyond what an unintentional client could produce. | Accepted |
| A4 | Adopt-on-key-rotation (HMAC fails, state present, `sh` matches → re-sign with current key) is safe. | Problem Interpretation | `sh` matching means the agent's record of session state and the server's record of session state agree. The only thing that changed is the signing key. Re-signing with the new key preserves session continuity exactly. | Accepted |
| A5 | The work touches only `src/utils/session.ts`, three new utility modules (`session-store.ts`, `wire-token.ts`, `state-hash.ts`), the `bind_session_path` registration site, and meta-skill text — no other server source. | Complexity Assessment | Code-resolvable. Phase 2's commit (`f7a4cd8`) demonstrates the call-site sweep is fully contained; 308 tests pass without touching the engine, transitions, resolver, or any tool other than what's listed. | Confirmed |
| A6 | The codebase has been sufficiently comprehended already; no separate `codebase-comprehension` activity is needed. | Workflow Path | Orchestrator pre-resolved `needs_comprehension=false`. Phase 2's empirically-passing call-site sweep is the evidence. | Accepted |
| A7 | No requirements elicitation or external research is needed; the problem is bounded and the prior-art space (CBOR RFC 8949, HKDF, HMAC-SHA-256 truncation) is well-established. | Workflow Path | Orchestrator pre-resolved `skip_optional_activities=true`. CBOR is RFC 8949; SHA-256 truncation is standard practice; no novel cryptographic design is being introduced. | Accepted |
| A8 | Legacy JSON-format tokens still in the wild are rare enough that a one-shot migrate-on-first-contact path is acceptable (no parallel-format support window required). | Problem Interpretation | Sessions are short-lived in practice (single work package). A one-shot migration that runs once per pre-existing session is sufficient and avoids carrying two parsers for an extended period. | Accepted |
| A9 | `planning_folder_path` is a stable anchor for `SessionRecord` storage — it does not move during a session's lifetime. | Complexity Assessment | The work-package workflow establishes `planning_folder_path` early (in `setup-context`) and never relocates it. The global fallback at `~/.workflow-server/sessions/<sid>.json` handles the pre-bind window. | Accepted |
| A10 | The `bind_session_path` MCP tool can be introduced without breaking existing workflow consumers that have not yet been updated to call it. | Complexity Assessment | The tool is additive. Sessions that never call `bind_session_path` simply use the global fallback location indefinitely; there is no required call-order. Meta-skill text in the workflows submodule will be updated in phase 5 to insert the call in `work-package` setup. | Accepted |
| A11 | Task ordering (1: adoption/migration → 2: `bind_session_path` → 3: meta-skill → 4: cleanup → 5: E2E) is correct: each task's runtime surface is consumed only by later tasks, never the reverse. | Task Breakdown | Code-resolvable from import direction in the proposed deliverables. The meta-skill (Task 3) is the only consumer of `bind_session_path` (Task 2); cleanup (Task 4) removes only symbols already replaced by Tasks 1-2; the E2E fixture (Task 5) exercises the public surface that Tasks 1-2 define. | Confirmed |
| A12 | Verification work (typecheck, test) should not appear as standalone tasks in the plan. | Task Breakdown | Per the `create-plan` skill's `tasks-are-code-changes-only` rule, verification runs automatically via the implement activity's task-cycle after every task. Listing it would duplicate the built-in cycle and is forbidden by the skill. | Confirmed |
| A13 | The new `bind_session_path` MCP tool counts as an additive change, not a breaking change to the MCP contract. | Scope Decisions | The `start_session` / `next_activity` / `get_workflow` / `get_resource` / yield / present / respond / resume surfaces remain byte-for-byte identical. Adding a new tool is additive: existing clients that do not call it are unaffected, and the new tool is opt-in via meta-skill update. | Accepted |
| A14 | A single E2E test fixture (`workflows/e2e-session-token/`) is sufficient to exercise every changed code path. | Test Strategy | The changed surface is narrow (one new tool, one rewritten `start_session` handler, one new recovery path with two sub-paths). A fixture with 2-3 activities and 1 checkpoint covers each path with one trace; per-path unit tests in `tests/staleness.test.ts`, `tests/bind-path.test.ts`, and `tests/planning-folder-deleted.test.ts` provide the focused coverage. | Accepted |
| A15 | The legacy-token migration set of fields is closed and known from the phase-2 sweep — there is no risk of dropping a field some pre-existing legacy session relied on. | Scope Decisions | The phase-2 commit (`f7a4cd8`) enumerated every legacy `SessionPayload` field at every call site. `skill` and `cond` were proven dead. The remaining fields (`wf`, `act`, `aid`, `sid`, `seq`, `ts`, `pwf`, `pact`, `psid`, `pv`, `bcp`) all have explicit homes in the new model (record fields or wire fields). | Confirmed |
| A16 | The wire-size target (≤140 bytes, ≥70% reduction) is achievable on a representative 10-deep parent-stack session given the chosen CBOR + base64url HMAC layout. | Scope Decisions | The 5-field CBOR map with integer keys encodes to roughly 60-70 bytes for the payload (`sid` 16 B + `seq` 1-2 B + `ts` 5 B + optional `bcp` ~25 B + `sh` 16 B + CBOR overhead). Base64url-encoded payload (~95 B) plus `.` plus base64url HMAC tag (44 B) sums to ~140 B inclusive of separators. No parent-stack growth, since parent state lives in the record, not the wire. | Accepted |
| A17 | `npm run typecheck` and `npm test` after each task commit are sufficient verification — no additional lint/format step is required between tasks. | Test Strategy | The repository does not run a lint step as a build gate. The implement activity's task-cycle already runs typecheck + test after every task. No additional gate is needed at the planning stage. | Accepted |

---

## Planning-phase assumption resolution

A11, A12, A13, A14, A15, A16, A17 were introduced during `plan-prepare`. They classify as:

- **Code-analyzable (resolved by code inspection / phase-2 evidence):** A11, A12, A15.
- **Stakeholder-/design-dependent (resolved by design rationale or skill rule):** A13, A14, A16, A17.

Reconciliation: no code-resolvable planning-phase assumptions remain in the Open state. The reconciliation loop converges immediately.

---

## Resolution legend

- **Confirmed** — resolved by direct code inspection or by test evidence already on the branch.
- **Accepted** — resolved by design rationale or by referencing established prior art / pre-resolved orchestrator context.
- **Open** — not yet resolved; will be revisited in a later activity.

No assumptions are currently in the **Open** state.
