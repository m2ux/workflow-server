# Strategic Review — feat/115-server-managed-session-state

**Activity:** strategic-review
**Date:** 2026-05-14
**Reviewer:** strategic-review worker
**Work Package:** Server-managed session state with workspace-aware MCP server
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**Branch:** `feat/115-server-managed-session-state` (HEAD `3feed84` post re-sign)
**PR:** [#116](https://github.com/m2ux/workflow-server/pull/116)
**Base for comparison:** `origin/main` (merge-base `ff9a8ce`)
**Files Changed:** 44 (parent repo) plus 3 commits on `workflows` submodule and 15 commits on `engineering` submodule
**Lines Changed:** +4492 / -1527 (parent repo)
**Commits in PR range:** 25 (all signed after this activity)

---

## 1. Review Scope and Posture

This branch is the **direct-to-`main` PR for issue #115**. Unlike
`feat/112-interceptor-cli` (the previous parent-of-stack), no stacked
children depend on this branch. The strategic-review framing is
therefore the standard "what blocks merge to `main`", with no
stacked-rebase cost discount.

Three artefact streams are in the PR range:

1. **Parent repo (`feat/115-server-managed-session-state`):** 25 commits,
   25 of which are now signed after this activity's `resign-unsigned-commits`
   step. 9 source-tree commits (Phases 1-7, 10.1, 10.2) plus 13 planning-only
   submodule-pointer bumps plus 3 workflows-meta sub-phase commits.
2. **Workflows submodule (`workflows` branch):** 3 commits ahead of last
   shared parent (`087c95f`) — Phases 8.1 / 8.2 / 8.3 of the meta-workflow
   TOON cleanup. All now signed.
3. **Engineering submodule (`engineering` branch):** 15 commits ahead of
   last shared parent (`606b649a`) — the planning artefacts. All now
   signed.

The pre-resign HEADs were `3e2b4b8` (feature), `89dda5c` (workflows),
and `c155eb0` (engineering); the post-resign HEADs are `3feed84`,
`d21cf9b`, and `4185ce0` respectively. Feature-branch submodule
pointers were remapped during the re-sign so the parent commits
reference the new submodule SHAs rather than the orphaned originals.

---

## 2. Findings Summary

| Severity | Count | Source |
|----------|-------|--------|
| Critical | 0 | — |
| Major | 0 | — |
| Minor | 0 | validate confirmed all 18 success criteria pass |
| Informational | 3 | §5.1 (parent-chain warning thresholds), §5.2 (per-call enumeration cost), §5.3 (commit message accuracy of planning-bump commits) |
| **Total** | **3** | |

`needs_strategic_fixes = false`. Validation passed every functional
and quality gate (315 / 2 skipped tests; typecheck clean; SC-1..SC-18
verified). The three Informational items are non-blocking and either
documented v2 follow-ups or cosmetic.

---

## 3. Did We Solve the Right Problem?

**Yes.** The problem statement in `02-design-philosophy.md` §1 names
five concrete frictions of the dual-store, agent-threaded design:

1. Token transcription drift on tool boundaries.
2. Schema enforced by agent rules, not server.
3. Parent chain flattened to a single level.
4. Resume requires file-shaped knowledge held by the agent.
5. The token is both system-of-record and diff hotspot.

The implementation, as verified by `10-validation-report.md`,
eliminates the failure mode behind each friction:

| Friction | Resolution mechanism |
|----------|----------------------|
| #1 transcription drift | Six-char `session_index` derived from
folder path; not the system of record. Long opaque token retired. |
| #2 schema enforced by agent rules | `SessionFile` Zod schema
(Phase 3) is now the single source of truth; TOON rules retired in Phase 8.1. |
| #3 single-level parent chain | `parentSession` is recursive
(`z.lazy()`); validated by TC-24 (3-level round-trip) and TC-30 (A→B→C→D
dispatch chain). |
| #4 resume requires file knowledge | `start_session(planning_slug,
agent_id)` is a single call; server decides fresh vs resume by file
existence. |
| #5 token is both record and diff hotspot | `session.json` is the
record; `.session-token` is the seal; the slug and `session_index` are
the agent-visible surface. No element plays both roles. |

Validation's SC-1..SC-18 confirm each of these resolutions is
landed and tested. The five-friction problem statement is fully
addressed; no friction has been deferred.

The five out-of-scope items called out in §5.2 of the design
(`cross-workspace sessions`, `encryption at rest`, `per-agent auth`,
`multi-tenant`, `NFS support`) are appropriate v2 deferrals; none
of them was implicitly required to make the V1 design coherent.

---

## 4. Scope Discipline

### 4.1 In-scope adherence

`05-work-package-plan.md` enumerates 16 in-scope items. Spot-check
against the landed diff:

| In-scope item | Status |
|---------------|--------|
| Workspace argument at server launch (CLI + env, CLI wins, error if neither) | Landed in Phase 1; `tests/config.test.ts` covers precedence |
| `start_session(planning_slug, agent_id)` idempotent | Landed in Phase 5; TC-26..TC-28 |
| Six-char base32 `session_index` derivation | Landed in Phase 2; TC-06, TC-11 |
| `session.json` server-written / agent-readable | Phases 3+4 |
| `.session-token` raw HMAC, no envelope | Phase 2; TC-17 / TC-18 hand-edit detection |
| Atomic write of both files (state first, seal second) | Phase 2; TC-13 / TC-14 |
| Filesystem permissions `0700` / `0600` | Phase 2 (asserted in tests) |
| `session_index` swap on all 10 standard + 3 bespoke authenticated tools | Phase 4 |
| Recursive `parentSession` with soft warning past 5 levels (PD-6) | Phase 6 |
| `withAuditLog` re-resolution | Phase 7; TC-37, TC-38 |
| Migration converter (Phase 9) idempotent + detect-on-read | Phase 5 (renamed during execution; see Note below); TC-51..TC-59 |
| Dead-code removal (`encryptToken`, `decryptToken`, `StateSaveFileSchema`) | Phase 10.2 |
| Tier-C salvage (canonicalisation, atomic-rename, EXDEV) | Phase 2 |
| Documentation sweep | Phase 10.1 |
| Meta-workflow TOON sweep | Phases 8.1 / 8.2 / 8.3 on workflows branch |
| Phase 10.3 interceptor sunset audit | Landed; recorded in 05-work-package-plan §A.4 |

**Note on phase renumbering:** the plan originally separated
`Phase 5: start_session restructure` and `Phase 9: migration converter`.
During execution these landed together as Phase 5 (`b20d22e: feat
Phase 5 - start_session restructure + legacy-state migration`). The
combined landing is justified — the migration converter is invoked
as a branch of `start_session` and cannot ship independently — but
the README's progress table still shows the planned phase split. A
post-merge update to `05-work-package-plan.md` to reflect actual
phase boundaries would tighten the planning record but is **not**
required for this PR.

### 4.2 Out-of-scope adherence

Spot-check the seven explicitly out-of-scope items:

| Out-of-scope item | Landed? |
|-------------------|---------|
| Cross-workspace sessions | No |
| Server-side checkpoint-semantics enforcement | No |
| Encryption at rest | No |
| Per-agent authentication | No |
| Multi-tenant | No |
| Network filesystem support | No |
| Concurrent-process locking | No (seal mismatch is the detection mechanism, by design) |
| Secret-key rotation protocol | No |
| Force-reseal escape hatch | No (PD-10 confirmed reject) |
| Configurable `session_index` length | No (PD-3 confirmed reject) |
| #98 / #101 in this PR | No (PD-8 confirmed reject; close #98 as superseded post-merge) |
| `feat/112-interceptor-cli` back-compat | No (parked) |

No out-of-scope item leaked into the implementation.

### 4.3 Plan-decision faithfulness

All 11 plan-phase decisions (PD-1..PD-11) were resolved by the
revised plan and landed as stated. PD-10 (no force-reseal escape
hatch) and PD-7 (no deprecated `session_token` retention — clean
break) are particularly load-bearing for the design's coherence;
both are honoured. Back-compat for legacy `session_token` parameter
is provided via the SC-17 clear error message, not a dual-mode
period, which matches PD-7.

---

## 5. Detailed Findings

### 5.1 Informational

**I1. Parent-chain depth soft-warning threshold is hard-coded at 5.**

`Phase 6` lands the depth check in `src/schema/session.schema.ts`
with a constant threshold. PD-6 explicitly confirmed no hard
ceiling, with the soft warning kicking in past 5 levels. The
threshold is reasonable for current workflows (typical depth 2-3)
but is **not** configurable. Future workflows with deeper nesting
(e.g., orchestrator-of-orchestrators) would need a code change to
raise it.

- **Disposition.** Accept; small threshold-as-constant is the
  appropriate v1 design; making it configurable adds knobs without
  current need. Flagged for awareness when workflow depth grows.

**I2. Per-call folder enumeration cost is not cached.**

Per `05-research.md` F4, enumeration cost is sub-millisecond at
≤100 folders and ~5 ms at 1000 folders. PD-3 / B1 confirmed the
6-char index keeps collision probability bounded at expected sizes.
No cache was added in V1 (correctly, per the research conclusion).
If a future workspace grows past ~10⁴ planning folders, the
enumeration cost becomes a more meaningful share of authenticated
call latency.

- **Disposition.** Accept for V1; revisit if the
  `<workspace>/.engineering/artifacts/planning/` directory grows
  past ~1000 folders. A simple LRU cache keyed by `session_index`
  would fit cleanly; not designed-in.

**I3. Planning-only submodule-bump commit messages are misleading.**

13 of the 25 feature-branch commits carry the subject
`chore: bump workflows submodule pointer (<activity>)` but only
touch the `.engineering` submodule, not the `workflows`
submodule. Verified by `git show --stat` against each — see
the audit table below.

| Commit (post-resign) | Subject claims | Files touched | Reality |
|----------------------|----------------|---------------|---------|
| `e79d2bc` | workflows submodule pointer | `.engineering` | engineering bump |
| `759596b` | workflows submodule pointer (planning README) | `.engineering` | engineering bump |
| `932bf8a` | workflows submodule pointer (PR #116 in README) | `.engineering` | engineering bump |
| `dbcfef8` | workflows submodule pointer (design-philosophy) | `.engineering` | engineering bump |
| `3a63c12` | workflows submodule pointer (persist after design-philosophy) | `.engineering` | engineering bump |
| `ed572ca` | workflows submodule pointer (codebase-comprehension) | `.engineering` | engineering bump |
| `6317db1` | workflows submodule pointer (requirements-elicitation) | `.engineering` | engineering bump |
| `2c5fcb2` | workflows submodule pointer (research) | `.engineering` | engineering bump |
| `e87d06c` | workflows submodule pointer (state persist post-research) | `.engineering` | engineering bump |
| `4f853a1` | workflows submodule pointer (plan-prepare) | `.engineering` | engineering bump |
| `2f5ff76` | workflows submodule pointer (assumptions-review) | `.engineering` | engineering bump |
| `c9e6650` | workflows submodule pointer (Phase 10.3 attestation) | `.engineering` | engineering bump |
| `3feed84` | workflows submodule pointer (validate report) | `.engineering` | engineering bump |

This is a tooling drift in the planning workflow itself — the
`persist` activity step in the meta-workflow templated its commit
subject around the wrong submodule. The Phase 8.1 cleanup deletes
that operation, so the drift cannot recur post-merge.

- **Disposition.** Accept; rewriting these commit messages would
  rewrite SHAs (again) for cosmetic reasons. The next work package
  will not produce mis-named commits because the operation that
  generated them is gone in Phase 8.1. Future readers of `git log`
  on this PR will see the discrepancy but the diff content is
  unambiguous.

---

## 6. Investigation-Artifact / Over-Engineering / Orphaned-Infrastructure Audit

Per `strategic-review` guide §"Common Patterns to Watch For":

| Category | Items found | Notes |
|----------|-------------|-------|
| Investigation Artifacts | 0 | No exploratory logging, no temporary workarounds, no debug-mode flags left in the source tree. The Phase 10.2 dead-code removal (Tier-C salvage minus salvageable bits) is a strict subtraction. |
| Over-Engineering | 0 | The session store is 3 small files (`session-index.ts`, `session-store.ts`, `migration.ts`) plus the schema; total surface area smaller than what it replaces. No speculative abstraction surfaces (e.g., no `SessionBackend` interface, no `IndexAlgorithm` strategy, no `SealCipher` plugin). The `parentSession` recursion uses `z.lazy()` — a 5-line idiom already present in the codebase. |
| Orphaned Infrastructure | 0 | `encryptToken` / `decryptToken` / `StateSaveFileSchema` were all dead code prior to this PR; Phase 10.2 removes them. No new orphan code introduced. The `interceptor-recipe.md` file was already absent from `main` HEAD (verified during plan-revision sweep — Phase 10.3 audited the sunset rather than re-deleting). |

No cleanup actions required.

---

## 7. README Conformance Check

`README.md` follows the standard work-package template. Two
observations:

- **Strategic review row.** The progress table at line 46 reads
  `[Strategic review](07-strategic-review.md)`. This artefact is
  being written at `11-strategic-review.md` (numbered after the
  `10-validation-report.md` that already exists). The exitActions
  step should update the README's row #07 link to point at
  `11-strategic-review.md` and mark Status `✅ Complete`.
- **Status footer.** Line 63 reads `Ready — assumptions-review
  confirmed convergence (0 open); ready for implement activity`.
  This is stale (implementation, validation, and strategic review
  are all complete). The exitActions step should update to
  `Ready for PR review and merge`.

No structural drift requiring an extra strategic-review row.

---

## 8. Change-Fragment Check

No `changes/` directory exists at the root of `target_path`
(`/home/mike1/projects/work/workflow-server/2026-05-13-server-managed-session-state/`).
The repo does not use a Towncrier-style fragment convention.

- `fragment_references_issue = null` (no `changes/` directory → skip).
- The `ensure-changes-folder-entry` step is a no-op.

---

## 9. Tech-Debt Assessment

This PR introduces **substantial net-negative** tech debt:

**Removed / reduced:**

- The dual-store design (token-as-state plus file-as-state) is
  collapsed to a single source-of-truth on disk. The token's roles
  as transport, system-of-record, and integrity proof are
  separated into three different artefacts (`session_index`,
  `session.json`, `.session-token`).
- Six TOON meta-workflow rules retired (`token-passes-on-each-call`,
  `use-most-recent-token`, `token-is-opaque`,
  `staleness-recovery-only-via-start-session`,
  `start-session-strict-params`, `parameter-vs-variable`). Three
  operations retired (`adopt-session`, `restore`, `persist`).
  The agent no longer carries any responsibility for state
  consistency.
- The staleness re-signing branch in `start_session` and
  `decodePayloadOnly` (token-decode-without-verify) are removed —
  both existed solely to compensate for token brittleness.
- `encryptToken` / `decryptToken` / `StateSaveFileSchema` removed
  in Phase 10.2 (Tier-C salvage minus salvageable bits).
- The post-PR-#113 dual-parameter shape on the checkpoint tools
  is preserved unchanged (PR #113 already collapsed it; this PR
  doesn't disturb that).

**Added (acknowledged):**

- Three new files (`session-index.ts`, `session-store.ts`,
  `migration.ts`) totalling ~600 LOC of source. Maintenance burden
  bounded; all three have direct test coverage.
- `~/.workflow-server/secret` is a new on-disk artefact owned by
  the server. Documented in design philosophy §3.4; the secret-
  rotation protocol is explicitly deferred (PD-5).
- Per-call file I/O on every authenticated tool. Accepted v1
  trade-off; F4 research confirms sub-millisecond at typical sizes.

**Deferred (documented):**

- Concurrent-process locking (`05-work-package-plan` out-of-scope
  list).
- Cross-workspace sessions.
- Encryption at rest (forward-compatible with encrypt-then-MAC).
- Secret-key rotation protocol.
- Configurable `session_index` length.
- LRU cache for folder enumeration at ≥10⁴ planning folders.

Overall: the tech-debt ledger improves materially. The single
source-of-truth design retires entire categories of failure mode
(transcription corruption, schema drift, partial-state races,
parent-chain truncation) at the cost of a small set of well-
scoped V2 follow-ups.

---

## 10. Future Risks and Dependencies

| Risk | Likelihood | Impact | Disposition |
|------|------------|--------|-------------|
| Workspace path symlink mismatch between agent and server | Low | Medium | Mitigated — `fs.realpathSync` canonicalises before HMAC; documented in plan tactical decision. |
| Secret-file deletion or corruption | Low | High | Documented recovery: regenerate; in-flight sessions invalidated; `start_session` against existing folder re-seals on first authenticated call. Single-user-machine threat model accepted. |
| EXDEV on planning folder + tmp file cross-device | Very low | Low | Fallback path lifted from Tier C (copy + fsync + unlink). Defensive; not observed in normal use. |
| Concurrent processes writing same `session.json` | Low (single agent typically) | Medium | Seal mismatch is the detection mechanism; the second process's call fails fast with a clear error. Locking is out-of-scope V2. |
| Migration converter encountering an unknown legacy format | Low (codebase only has one in-flight) | Low | TC-57 / TC-58 cover corrupt-envelope and orphan-token cases; failure is fail-fast with a clear error. |
| `session_index` collisions in workspaces with ≥1000 folders | Very low (5×10⁻⁴ expected) | Low | PD-4 collision policy: error-with-disambiguation; deterministic, not silent. |
| `~/.workflow-server/secret` permissions wrong on multi-user host | Low | High (cross-user token forge) | Single-user-machine threat model documented; multi-tenant explicitly out-of-scope. |

Dependencies on outside-this-PR artefacts:

- **Workflows submodule** at `d21cf9b` (resigned). The feature
  branch's submodule pointer chain through Phases 8.1 / 8.2 / 8.3
  is preserved; the final pointer matches the resigned workflows
  HEAD.
- **Engineering submodule** at `4185ce0` (resigned). All planning
  artefacts referenced by this strategic review are on this
  submodule pointer.
- **`~/.workflow-server/secret`** must exist before the server
  starts. Documented in plan and design; first-launch script
  creates it if missing.
- **PR #116** is the merge surface. No stacked children.

No external service dependencies, no third-party API surface
changes, no schema-breaking changes to existing on-disk state
(migration converter handles the legacy format detect-on-read).

---

## 11. Simplifications Missed

Spot-check for "would a smaller design have sufficed?":

| Candidate simplification | Considered? | Decision |
|--------------------------|-------------|----------|
| Drop the recursive `parentSession`, keep single level | Yes — `02-design-philosophy` §3.5 considered and rejected | Reject — defeats #115 goal (single-level limitation is one of the five frictions). |
| Use a database (sqlite) instead of files | Yes — alternatives table | Reject — runtime dep; breaks "files in folder are truth". |
| Wider `session_index` (8+ chars) eliminates collision policy | Yes | Reject — research §1 confirmed 6 is the transcription budget. |
| In-memory session registry instead of per-call file I/O | Yes — alternatives table | Reject — loses statelessness; restart wipes registry. |
| Encrypt state at rest now | Yes — alternatives table | Reject — confidentiality not in V1 threat model; encrypt-then-MAC is forward-compatible. |
| Per-session secret key | Yes — alternatives table | Reject — re-introduces registry; doesn't fit single-user-machine model. |

The `Alternatives Considered` table in `05-work-package-plan.md`
enumerates seven candidates; each is rejected with a specific
rationale. No candidate simplification was overlooked.

One small "would have helped" observation: the migration converter
(planned as Phase 9, landed as part of Phase 5) is itself a small
piece of code that could have been deferred to a follow-up if no
in-flight workflows existed. Because this PR's own workflow is
the test fixture, the converter is load-bearing and ships in-
band — the right call.

---

## 12. Follow-Ups

These are the named V2 / follow-up items captured during this work
package. They are **not** required for this PR's merge:

1. **#98 close as superseded.** Per PD-8, close #98 once #115
   lands; track #101 separately.
2. **LRU cache for folder enumeration.** If a workspace grows past
   ~1000 planning folders, add a simple cache keyed by
   `session_index`. Not designed-in (PD-3 / F4).
3. **Secret-key rotation protocol.** Deferred per PD-5; documented
   in design §3.4. V2 if multi-host or multi-user deployments
   emerge.
4. **Configurable `session_index` length.** Deferred per PD-3.
5. **Concurrent-process locking.** Deferred per out-of-scope list.
   Seal mismatch is the V1 detection mechanism.
6. **Encryption at rest.** Forward-compatible with encrypt-then-MAC
   per design §3.7; deferred.
7. **`05-work-package-plan.md` post-merge phase-number correction.**
   Combine Phase 5 + Phase 9 in the plan record to match what
   landed. Cosmetic.
8. **Commit-message templating fix in meta-workflow's `persist`
   operation.** The drift in I3 cannot recur because Phase 8.1
   deletes that operation entirely; no follow-up required.

---

## 13. Minimality Assessment

| Question | Answer | Notes |
|----------|--------|-------|
| Is every changed file necessary? | Yes | All 44 parent-repo files map to plan phases 1-10. 3 workflows-branch files map to Phases 8.1 / 8.2 / 8.3. 15 engineering-branch files are the planning artefacts (this strategic review brings them to 16). |
| Is every added line necessary? | Yes | The new modules (`session-index.ts`, `session-store.ts`, `migration.ts`) total ~600 LOC of source against ~1500 LOC of focused test coverage. The doc sweep is largely substitution (`session_token` → `session_index`); the dead-code removal is strict subtraction. |
| Are all new dependencies required? | N/A | Zero new runtime deps. No `package.json` additions. The HMAC primitives, base32 encoding, and atomic-rename are all stdlib or already in the codebase. |
| Are all config changes required? | Yes | `--workspace=PATH` CLI flag and `WORKFLOW_WORKSPACE` env var are the single user-facing config change; both are required for workspace plumbing (Phase 1). |
| Is the solution as simple as it could be? | Yes | The session store is three small files; the schema is the existing recursive pattern; the swap is a single-fragment substitution at `sessionTokenParam`; the meta-workflow cleanup is strict subtraction. |

---

## 14. Strategic-Review Result

**Outcome:** Passed — no strategic-level changes required.

**Rationale:** Implementation is minimal, focused, and faithful to
the design philosophy. All 18 success criteria pass; tests are
green (315 / 2 skipped); typecheck is clean; the three submodule
pointer chains converge on resigned heads. Cross-cutting concerns
(security, performance, observability) are addressed at the design
level (§3 of `02-design-philosophy.md`) and validated. No
investigation artefacts, no over-engineering, no orphaned
infrastructure. The three Informational findings are documented
v2 follow-ups (or cosmetic in the case of I3) and do not warrant
a fix-this-branch action.

**Recommended action option:** `acceptable` — findings noted, no
changes required for this PR's merge to `main`.

**Variables:**

```
review_passed = true
needs_strategic_fixes = false
needs_cleanup = false
recommended_strategic_option = acceptable
items_removed = []
fragment_references_issue = null
unsigned_commits_in_pr = false   # resolved by resign-all in this activity
```

**Resign-unsigned-pr-commits decision:** Resolved during this
activity. All 25 feature-branch commits, all 3 workflows-branch
commits, and all 15 engineering-branch commits in the PR range
are now signed. Post-resign HEADs are `3feed84` / `d21cf9b` /
`4185ce0`. The feature-branch submodule pointers were remapped
during re-sign so the parent commits reference the resigned
submodule SHAs rather than the orphaned originals.

**Next step:** Surface the `review-findings` checkpoint (only
informational findings, so the default `acceptable` option is the
expected resolution), then transition to the next activity (PR
review / completion per the workflow definition).
