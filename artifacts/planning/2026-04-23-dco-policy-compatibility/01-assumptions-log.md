# Assumptions Log — DCO Policy Compatibility

**Branch:** `feat/dco-policy-compatibility`
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Started:** 2026-04-23 (backfilled 2026-05-19 from design-philosophy resume run)
**Driving policy:** DCO-Safe Agentic Coding Policy

This log tracks assumptions made during this work package. Each entry records the assumption, the activity that introduced it, its resolvability class, current status, and resolving evidence.

Resolvability:
- **code-analyzable** — answerable by inspecting this repo or related artifacts (PR diff, workflows submodule).
- **stakeholder-dependent** — needs human input (preference, policy interpretation, scope decision).
- **external-validation** — needs a real end-to-end run on a target repository.

Status:
- `open` — not yet investigated.
- `resolved` — investigated; conclusion captured.
- `accepted` — left open intentionally; flagged as a known risk or deferral.

---

## A. Problem Interpretation

### A1. The DCO-Safe Agentic Coding Policy is the canonical reference for this work

**Assumption:** The driving policy fully specifies the target end-state (squash-merge-time attestation with `-s -S`, per-task provenance log, human sign-off gate). No competing policy interpretation is in play.

**Resolvability:** stakeholder-dependent.
**Status:** resolved — pre-resolved by the activity bootstrap (`needs_research = false`, policy named as the canonical reference).
**Evidence:** README Executive Summary names the policy as the driver; the PR description's framing matches the policy's prescribed flow.

### A2. The previous resign-time model is incompatible with the policy

**Assumption:** The previous workflow's `gpg-resign-range`-based per-commit signing, executed by the agent on the human's behalf, is structurally incompatible with the policy's "human signs at squash-merge" intent. Patching the resign flow (e.g., adding a sign-off prompt on top) would not satisfy the policy.

**Resolvability:** stakeholder-dependent (policy interpretation).
**Status:** resolved.
**Evidence:** README Problem Overview enumerates three structural problems with the previous posture; all three derive from the agent occupying the attestation seat. The policy reassigns that seat to the human, requiring removal of the agent-side mechanism, not augmentation.

### A3. The squash-merge commit is the load-bearing attestation

**Assumption:** Once the workflow relocates attestation to squash-merge time, per-commit signatures on the feature branch carry no audit weight. The squash commit alone is sufficient as the auditable artefact.

**Resolvability:** stakeholder-dependent (policy interpretation).
**Status:** accepted.
**Evidence:** Policy prescribes local squash with `-s -S`; that single commit is both DCO-signed-off and GPG-signed. Reviewer-side verification (where required) verifies the squash commit, not the feature-branch history.

---

## B. Complexity Assessment

### B1. Cross-cutting scope justifies `complex` classification

**Assumption:** Touching 8 of 14 work-package activities (01, 04, 08, 09, 10, 11, 12, 13) plus a cross-cutting skill (`15-manage-git`) and adding a new skill (`25-dco-provenance`) puts this work in the `complex` band rather than `moderate`, even though no runtime code changes.

**Resolvability:** stakeholder-dependent (classification policy).
**Status:** resolved.
**Evidence:** 13 files changed in PR #109, all workflow surface. Removing one attestation model and replacing with another is a workflow-contract change, not a localised enhancement. The bootstrap's suggested classification (`complex`) is consistent with this reading.

### B2. No runtime code changes are required

**Assumption:** All changes land in workflow content (TOON edits under `work-package/`, one new skill file, one PR-description resource). No `src/`, `schemas/`, or other runtime server source is touched.

**Resolvability:** code-analyzable (PR diff).
**Status:** resolved.
**Evidence:** PR #109 diff is entirely under the workflows worktree plus a PR-description resource file. The bootstrap fact list confirms: "No server source changes."

### B3. The workflow-contract change is atomic at the workflow level

**Assumption:** Splitting the work across multiple PRs (e.g., one per activity, or one for the new gates and one for the resign-removal) would leave the workflow in an inconsistent DCO posture between PRs. Single-PR scope is the right unit.

**Resolvability:** stakeholder-dependent.
**Status:** resolved by user approval implicit in the existing single-PR shape of #109.
**Risk if wrong:** If reviewers request a split, the change-block index would have to be reorganised into per-PR slices; the substance does not change.

---

## C. Workflow Path

### C1. No elicitation needed

**Assumption:** Scope is fully specified by the DCO-Safe Agentic Coding Policy; no additional stakeholder discovery is needed before planning.

**Resolvability:** stakeholder-dependent.
**Status:** resolved by pre-resolved variable `needs_elicitation = false`.
**Evidence:** The policy names the goal, mechanism, provenance surface, and gates. Sections 3.1–3.2 of `01-design-philosophy.md` walk through each.

### C2. No research needed

**Assumption:** The driving policy is the canonical reference. The GitHub `allow_squash_merge` API and the local-squash-with-`-s -S` Git flow are standard surfaces; no external pattern survey is needed.

**Resolvability:** code-analyzable / external-validation.
**Status:** resolved by pre-resolved variable `needs_research = false`.
**Evidence:** Both surfaces are documented in their respective references (GitHub REST API; standard Git CLI). No competing pattern survives the policy's constraint that the human's local keychain be the only signer.

### C3. No comprehension needed

**Assumption:** No fresh reading of existing workflow content is required to design or implement the change. The worker who authored PR #109 demonstrably comprehended the workflow surface; running comprehension again would duplicate work already encoded in the PR.

**Resolvability:** code-analyzable.
**Status:** resolved by pre-resolved variable `needs_comprehension = false`.
**Evidence:** PR #109 makes coherent changes across 8 activities and one cross-cutting skill, demonstrating end-to-end comprehension of the affected surface.

### C4. Keep architecture summary in scope

**Assumption:** Although optional activities are skipped, the architecture-summary artifact produced in `strategic-review` is worth keeping. The resign-time → squash-merge-time relocation is a real architectural shift in the workflow's DCO posture and a new structural element (the `dco-provenance` skill) is added; both warrant a named summary for stakeholders.

**Resolvability:** stakeholder-dependent.
**Status:** resolved by pre-resolved variable `skip_architecture_summary = false`.
**Risk if wrong:** If stakeholders find the summary redundant with the PR description, it can be elided in a future revision without affecting the substantive work.

---

## D. Squash-Merge Strategy

### D1. `allow_squash_merge` is detectable up-front via the GitHub API

**Assumption:** Calling the GitHub REST API for the target repository returns `allow_squash_merge` reliably, allowing `start-work-package` to set `squash_merge_available` deterministically before any downstream UX branches on it.

**Resolvability:** code-analyzable (GitHub REST API documentation) / external-validation.
**Status:** accepted.
**Evidence:** The endpoint is part of the public GitHub REST API. The `detect-merge-strategy` step in `01-start-work-package` consumes it directly.
**Risk if wrong:** Token scopes or rate-limit failures degrade the detection. The mitigation is to default `squash_merge_available = false` on detection failure, which surfaces the sign-off checkpoint without the squash-flow reminder — the safer fallback.

### D2. Repositories that disallow squash-merge do not need a substitute attestation path

**Assumption:** When `squash_merge_available` is false, the workflow surfaces the `dco-sign-off` checkpoint but does not invent a fallback flow. The human handles merge attestation through whatever native mechanism the repo supports.

**Resolvability:** stakeholder-dependent (policy interpretation).
**Status:** accepted (deliberate scope decision).
**Evidence:** Section 5.2 of `01-design-philosophy.md` records the rationale. Faking a fallback would re-introduce agent-side cleverness around attestation, which is exactly what this work removes.

### D3. The local-squash-with-`-s -S` flow is the canonical path under squash-merge availability

**Assumption:** When `squash_merge_available = true`, the `merge-strategy-reminder` checkpoint guides the human through `git merge --squash` + `git commit -s -S` rather than GitHub's web-UI squash merge. The web-UI squash produces an unsigned commit; the local flow produces a DCO-signed-off and GPG-signed commit.

**Resolvability:** stakeholder-dependent (policy interpretation).
**Status:** resolved.
**Evidence:** The policy prescribes the local flow explicitly to obtain both signatures on the merge commit.

---

## E. Provenance Surface

### E1. Per-task provenance capture is the right granularity

**Assumption:** Capturing one row per implemented task (task ID, assistant, model, prompt class, context scope, description) is the right granularity. End-of-run summary alone is insufficient because it cannot answer "where did this specific change come from" without reconstructing memory at sign-off time.

**Resolvability:** stakeholder-dependent.
**Status:** resolved.
**Evidence:** Section 5.3 of `01-design-philosophy.md` records the rationale. The PR description's `## AI Assistance` section interpolates from the per-task log, so the verbosity does not bleed into reviewer experience.

### E2. The `dco-provenance` skill is the right home for provenance concerns

**Assumption:** Pulling provenance-log schema, attestation recording, and context-scope classification into a named, reusable skill (work-package skill 25) is preferable to scattering the same logic across the eight touched activities.

**Resolvability:** stakeholder-dependent.
**Status:** resolved.
**Evidence:** The skill consolidates the provenance contract in one place, so future revisions (e.g., adding a new context-scope value, changing the log schema) are local rather than cross-cutting.

### E3. The rationale-amendment checkpoint corrects agent-written prose into a human attestation

**Assumption:** Allowing the human to amend agent-written rationale paragraphs before the diff goes to automated review is the right shape for converting the rationale from agent commentary into a human provenance statement. The corrections land in `manual-diff-review-report.md` as the human's own statement.

**Resolvability:** stakeholder-dependent.
**Status:** resolved.
**Evidence:** Section 3.1, item 3 of `01-design-philosophy.md` records the rationale.

---

## F. Implementation Surface

### F1. The variable surface change is contained

**Assumption:** Removing `unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, and `unsigned_commit_list_summary` and adding `squash_merge_available` and `context_scope` does not require migration of saved session state from prior runs of the work-package workflow.

**Resolvability:** code-analyzable.
**Status:** accepted.
**Evidence:** Session state lives in `session.json` per planning folder; no cross-session state persists. New runs see the new variable surface; legacy planning folders are not re-run under the new workflow.

### F2. The `Co-authored-by:` trailer is harness-conditional in practice

**Assumption:** Claude Code injects `Co-authored-by:` automatically; other assistants (Cursor, OpenCode, Codex CLI, etc.) require explicit guidance to add it. The new `code-commits` protocol in `15-manage-git` documents both paths.

**Resolvability:** code-analyzable / external-validation.
**Status:** accepted.
**Evidence:** Claude Code's commit-creation guidance includes the trailer by default; the assumption is that other harnesses do not. The mitigation is explicit documentation in the protocol rather than runtime enforcement.

### F3. PR #109 already passes server-side validation and tests

**Assumption:** The implementation on disk (PR #109) already passes `npx tsx scripts/validate-workflow-toon.ts` on the merged work-package, `npm run typecheck`, and the full test suite.

**Resolvability:** code-analyzable / external-validation.
**Status:** resolved.
**Evidence:** README Progress table records "Validation: ✅ Complete" with the same three commands listed.

---

## G. Resume-Mode Specific

### G1. The README captures the substance of the design philosophy

**Assumption:** The hand-written README's Executive Summary, Problem Overview, and Solution Overview together contain the substance of the design philosophy. Distilling them into the canonical artifact structure does not require new design work.

**Resolvability:** code-analyzable (README content).
**Status:** resolved.
**Evidence:** `01-design-philosophy.md` extracts directly from those three README sections; no novel design content is introduced.

### G2. Skipping downstream optional activities is consistent with the existing scope

**Assumption:** `requirements-elicitation`, `research`, and `implementation-analysis` should all be skipped because the scope is fully specified by the policy, the policy is the canonical research reference, and the implementation is already complete.

**Resolvability:** stakeholder-dependent.
**Status:** resolved by the bootstrap-supplied path decisions.
**Evidence:** Bootstrap fact list explicitly enumerates these three skips with rationale.

### G3. The architecture summary will be produced later in strategic-review

**Assumption:** `skip_architecture_summary = false` means the architecture summary remains in scope and will be produced when `strategic-review` runs, not in this activity.

**Resolvability:** code-analyzable.
**Status:** resolved.
**Evidence:** Bootstrap fact list and section 4 of `01-design-philosophy.md` both record this. The substance for the summary is the resign-time → squash-merge-time relocation and the new `dco-provenance` skill.

---

## Reconciliation — design-philosophy activity (2026-05-19, resume run)

All assumptions in this log were either pre-resolved by the bootstrap (C1–C4, G1–G3) or are derived from observed properties of PR #109 and the planning folder README (A1–A3, B1–B3, D1–D3, E1–E3, F1–F3). No new code-analyzable assumption is open against the design philosophy itself; assumptions that depend on real-run validation (D1's GitHub API reliability, F2's harness behaviour, F3's test-suite green) have their evidence in the PR's existing state.

**Stakeholder-input audit:** No assumption in this log is awaiting external stakeholder input. The stakeholder-dependent assumptions (A1, A2, A3, B3, C1, C4, D2, D3, E1, E2, E3, G2) are resolved either by the policy itself (the canonical reference) or by the path-decision pre-resolutions in the bootstrap.

**Conclusion:** `has_open_assumptions = false` for this activity's interview loop. No deferred-assumption summary needs posting to the issue tracker. The log is ready to be carried forward and amended by subsequent activities as new assumptions surface.
