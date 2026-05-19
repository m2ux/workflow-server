# Work Package Plan — DCO Policy Compatibility

**Activity:** plan-prepare
**Date:** 2026-04-23 (backfilled 2026-05-19 from authored PR content)
**Branch:** `feat/dco-policy-compatibility`
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Mode:** Resume — plan reverse-engineered from the diff between `workflows` and `feat/dco-policy-compatibility`.

---

## Overview

This plan groups the 14 files touched by PR #109 into 13 implementation tasks. Every task is already executed on the branch; the plan exists to give the planning folder a faithful, retrospective record of the work that landed. No future work is implied here — the plan and the diff are in sync.

The thirteen tasks fall in four buckets:

- **Variable-surface and entry-point wiring** (T1–T2): retire three GPG-resign variables, introduce `squash_merge_available` and `context_scope`, and have `start-work-package` detect the squash-merge policy up-front.
- **Provenance capture** (T3–T5, T11–T12): new context-scope checkpoint in research, per-task provenance log in implement, rationale-amendment in post-impl-review, a new `dco-provenance` skill, and a PR-description section.
- **Compensating-infrastructure retirement** (T6–T9, T10): remove the unsigned-commits scan in validate, the resign prompt and step in strategic-review, the resign step in complete, the `verify-commit-signatures` step in submit-for-review, the `gpg-resign-range` protocol and `--no-gpg-sign` mandate in `15-manage-git`.
- **PR-submission gating and bookkeeping** (T8, T13): blocking `dco-sign-off` checkpoint and non-blocking `merge-strategy-reminder` checkpoint at submit-for-review; renumber the skill index and update skill counts.

All thirteen tasks were verified against the same three commands at rebase time: `npx tsx scripts/validate-workflow-toon.ts work-package`, `npm run typecheck`, and `npm test` (322 tests). All three green.

---

## Tasks

### T1 — Variable-surface cleanup in `work-package/workflow.toon`

**Status:** ✅ Done
**Files:** `work-package/workflow.toon`
**Variable count:** 88 → 87 (net -1: three removed, two added).

**Changes:**
- Remove `unsigned_commits_in_pr` (boolean; existed to gate the strategic-review resign prompt).
- Remove `resign_unsigned_commits_requested` (boolean; the human's response to the resign prompt).
- Remove `unsigned_commit_list_summary` (string; rendered into the prompt).
- Add `squash_merge_available` (boolean; set by the new `detect-merge-strategy` step in `01-start-work-package`).
- Add `context_scope` (string enum `repo-only | web-retrieval | mixed`; set by the new `declare-context-scope` checkpoint in `04-research`).

**Rationale:** The three removed variables only existed to support the agent-side resign infrastructure that is being retired (see T6, T7, T9, T10). The two added variables carry the new state that the squash-merge-time attestation model needs: detection of squash-merge availability up-front, and explicit declaration of research context scope for provenance.

**Verification:** TOON schema validator confirms the variable surface declared in `workflow.toon` matches what activities reference; vitest's schema-binding tests catch any orphan reference.

---

### T2 — `01-start-work-package`: insert `detect-merge-strategy` step

**Status:** ✅ Done
**Files:** `work-package/activities/01-start-work-package.toon`

**Changes:**
- Add new step `detect-merge-strategy` that calls the GitHub REST API for the target repo and reads `allow_squash_merge`.
- Set `squash_merge_available = true | false` from the API response.
- Default to `false` on detection failure (token scope, rate-limit, network error). This is the safer fallback: it surfaces the sign-off checkpoint without the squash-flow reminder, so the human is not steered toward a flow the repo may not actually support.

**Rationale:** Downstream UX in `submit-for-review` (T8) branches on `squash_merge_available`. Detecting it up-front in start lets later activities behave deterministically without re-querying the API and without surfacing a flow that won't work on the target repo.

**Verification:** activity validator confirms the step's variable writes match the workflow variable surface (T1).

---

### T3 — `04-research`: add `declare-context-scope` checkpoint

**Status:** ✅ Done
**Files:** `work-package/activities/04-research.toon`

**Changes:**
- Add new checkpoint `declare-context-scope` with three options: `repo-only`, `web-retrieval`, `mixed`.
- The checkpoint writes the selected value into `context_scope`.
- Add `dco-provenance` to the activity's supporting skills list (the skill defines the context-scope classification — see T11).

**Rationale:** `context_scope` is the coarse-grained provenance bucket the rest of the workflow surfaces in the per-task log and the PR description. Capturing it once at research time means the implement-phase log rows and the PR-description interpolation pull from a consistent declared value rather than guessing per-task.

**Verification:** activity validator confirms checkpoint option IDs and the variable write target the declared surface.

---

### T4 — `08-implement`: add `provenance-log` artifact and `log-provenance` step

**Status:** ✅ Done
**Files:** `work-package/activities/08-implement.toon`

**Changes:**
- Declare a new artifact `provenance-log` mapped to `provenance-log.md` in the planning folder.
- Add a `log-provenance` step inside the per-task implementation loop. The step appends one row to `provenance-log.md` per implemented task with: task ID, assistant, model, prompt class, context scope (from T3), description.
- Add `dco-provenance` to the activity's supporting skills list (the skill owns the log schema — see T11).

**Rationale:** Per-task capture is the right granularity for answering "where did this specific change come from" at sign-off time (see assumption E1 in `01-assumptions-log.md`). The per-task log is also what the PR description's `## AI Assistance` section interpolates from (see T12), so the verbosity does not bleed into reviewer experience.

**Verification:** activity validator confirms the artifact declaration matches the path it writes to; schema-binding tests confirm `dco-provenance` is a valid skill reference.

---

### T5 — `09-post-impl-review`: strengthen rationale confirmation

**Status:** ✅ Done
**Files:** `work-package/activities/09-post-impl-review.toon`

**Changes:**
- Strengthen the existing `file-index-table` checkpoint to capture the human's rationale confirmation per change block as a provenance attestation (rather than a free-form rationale paragraph).
- Add a new `rationale-amendment` checkpoint that lets the human correct any agent-written rationale paragraph before the diff goes to automated review.
- Corrected rationales land in `manual-diff-review-report.md` as the human's own provenance statement.

**Rationale:** The previous design captured rationale as agent-written prose with a human "approve" gate. Under the DCO posture, the rationale is the human's provenance statement — so the human must be able to edit the prose before it becomes the auditable record (see assumption E3).

**Verification:** activity validator confirms checkpoint binding and artifact path.

---

### T6 — `10-validate`: drop the GPG preflight scan

**Status:** ✅ Done
**Files:** `work-package/activities/10-validate.toon`

**Changes:**
- Remove the `scan-commit-signatures-for-strategic` step that walked the PR commit range and identified unsigned commits.
- Remove the associated `context_to_preserve` entries that carried the unsigned-commit summary forward to strategic-review (those variables are gone — see T1).

**Rationale:** With per-commit signing on the feature branch no longer load-bearing (the squash-merge commit is the auditable artefact — see assumption A3), there is nothing for the scan to gate. Keeping the scan would surface a problem the workflow no longer treats as a problem.

**Verification:** activity validator confirms no remaining references to the removed variables.

---

### T7 — `11-strategic-review`: drop `unsigned-commits-prompt` and `resign-unsigned-pr-commits`

**Status:** ✅ Done
**Files:** `work-package/activities/11-strategic-review.toon`

**Changes:**
- Remove the `unsigned-commits-prompt` checkpoint (previously asked the human to authorise the resign).
- Remove the `resign-unsigned-pr-commits` step (previously invoked `gpg-resign-range` if the human had assented).
- Preserve the `diff-review` step and other strategic-review surface unchanged.

**Rationale:** This is the most visible cut. The prompt + step pair existed to let the human "approve" an agent-constructed resign — exactly the seat-occupancy problem the policy is meant to fix (see assumption A2). Both retire together.

**Verification:** activity validator confirms no orphan checkpoint or step references; vitest's binding tests catch any stale skill reference.

---

### T8 — `12-submit-for-review`: add DCO sign-off and merge-strategy reminder; drop signature verification

**Status:** ✅ Done
**Files:** `work-package/activities/12-submit-for-review.toon`

**Changes:**
- Add blocking `dco-sign-off` checkpoint surfacing a 6-item certification: (1) right to submit, (2) understood the diff, (3) clean provenance, (4) can explain origin, (5) tests run, (6) willing to take responsibility. The checkpoint blocks PR submission until the human attests.
- Add non-blocking `merge-strategy-reminder` checkpoint that fires only when `squash_merge_available = true`. It walks the human through the local-squash + `-s -S` flow.
- Remove the `verify-commit-signatures` step (this is the entry point that previously called `gpg-resign-range`).
- Add `dco-provenance` to the activity's supporting skills list.

**Rationale:** This is the heart of the relocation. The blocking checkpoint is the human's explicit attestation gate. The non-blocking reminder is advisory because the merge itself happens outside the workflow on the human's machine; the workflow's role is to ensure the human has the right runbook in front of them at the right moment.

**Verification:** activity validator confirms checkpoint blocking flags, option IDs, and conditional firing on `squash_merge_available`.

---

### T9 — `13-complete`: drop `resign-artifact-commits`

**Status:** ✅ Done
**Files:** `work-package/activities/13-complete.toon`

**Changes:**
- Remove the `resign-artifact-commits` step that previously walked the artifact-commit range and resigned each commit.

**Rationale:** Artifact commits are made with the human's local Git config by the meta-orchestrator on the parent monorepo. With the `--no-gpg-sign` mandate also retired (T10), artifact commits inherit the human's signing config like any other commit they make in their own repo. No agent-side resign step is needed; in fact it would be wrong, for the same reasons cited in T7. (Note: the `workflows` branch had already removed this step independently in a prior sweep; the change here is a no-op merge resolution. Recorded as a task so the plan accounts for every block in the diff.)

**Verification:** activity validator confirms no references to the removed step.

---

### T10 — `15-manage-git`: drop resign + no-gpg-sign mandates; add code-commits and merge-strategy protocols

**Status:** ✅ Done
**Files:** `work-package/skills/15-manage-git.toon`

**Changes:**
- Remove the `gpg-resign-range` protocol (the implementation behind the now-deleted resign step in T7; also referenced by T8's removed step and T9's removed step).
- Remove the `--no-gpg-sign` mandate from the `artifact-commits` protocol. Artifact commits now follow the human's local Git config (signed if their config says so).
- Add a new `code-commits` protocol with three items: (1) author code commits with the human as author, (2) include `Co-authored-by: <assistant>` trailer, (3) note harness behaviour — Claude Code injects the trailer automatically; other assistants must add it explicitly.
- Add a new `detect-merge-strategy` protocol used by T2.
- Add a new `squash-merge-instruction` protocol used by T8's non-blocking reminder.

**Rationale:** This skill is the cross-cutting glue for every commit-shaped action the workflow takes. Retiring the resign protocol there is the only way to ensure it cannot be reintroduced piecemeal by another activity. Adding `Co-authored-by:` guidance closes the byline gap that the previous DCO model had been implicitly papering over.

**Verification:** skill validator confirms protocol references from activity steps (T2 → `detect-merge-strategy`, T8 → `squash-merge-instruction`, every commit-creating step → `code-commits`).

---

### T11 — New skill: `25-dco-provenance`

**Status:** ✅ Done
**Files:** `work-package/skills/25-dco-provenance.toon` (new file)

**Changes:**
- Author the new skill with three protocols:
  - `provenance-log`: defines the row schema for `provenance-log.md` (task ID, assistant, model, prompt class, context scope, description) and the append-only contract.
  - `record-attestation`: defines what each rationale-amendment landing in `manual-diff-review-report.md` looks like as a human attestation.
  - `context-scope`: defines the enum (`repo-only`, `web-retrieval`, `mixed`) and the classification heuristic used by T3's checkpoint.

**Rationale:** Pulling provenance concerns into a named, reusable skill (rather than scattering the same logic across eight activities) makes future revisions local: changing the log schema or adding a new context-scope value is a one-file edit (see assumption E2).

**Verification:** new skill is referenced by T3, T4, and T8's supporting-skill lists; schema validator confirms the skill file structure.

---

### T12 — `12-pr-description.md`: add `## AI Assistance` section

**Status:** ✅ Done
**Files:** `work-package/resources/12-pr-description.md`

**Changes:**
- Add a new `## AI Assistance` section to the PR description template.
- The section interpolates `model_id`, `context_scope` (from T3), and `provenance_log_path` (from T4) so reviewers see the provenance summary directly in the PR description without having to open the log.

**Rationale:** Materialising the provenance in the PR description means the reviewer-side experience is unchanged whether the underlying log is 1 row or 50; the section is constant size. The verbosity stays in the log artifact, the summary surfaces in the PR (see assumption E1).

**Verification:** resource is referenced by `12-submit-for-review` (T8); the activity validator confirms the resource binding.

---

### T13 — Skill-inventory renumbering and count updates

**Status:** ✅ Done
**Files:** `work-package/skills/README.md`, `work-package/README.md`

**Changes:**
- Add a new row in `work-package/skills/README.md` for `25-dco-provenance` (introduced by T11).
- Update the skill count in `work-package/skills/README.md` from 24 to 26 (the `+2` reflects the existing-but-undocumented count gap plus the new skill).
- Update the same count in `work-package/README.md` from 24 to 26.

**Rationale:** The README count is the surface most agents and reviewers see first; keeping it in sync with the actual skill directory is part of the workflow contract.

**Verification:** Manual inspection; no automated validator for README count consistency.

---

## Summary

| # | Task | Files | Status |
|---|------|-------|--------|
| T1 | Variable-surface cleanup | `workflow.toon` | ✅ Done |
| T2 | `01-start-work-package`: detect-merge-strategy | `activities/01-start-work-package.toon` | ✅ Done |
| T3 | `04-research`: declare-context-scope checkpoint | `activities/04-research.toon` | ✅ Done |
| T4 | `08-implement`: provenance-log artifact + log-provenance step | `activities/08-implement.toon` | ✅ Done |
| T5 | `09-post-impl-review`: rationale confirmation strengthening | `activities/09-post-impl-review.toon` | ✅ Done |
| T6 | `10-validate`: drop GPG preflight scan | `activities/10-validate.toon` | ✅ Done |
| T7 | `11-strategic-review`: drop unsigned-commit prompt + resign step | `activities/11-strategic-review.toon` | ✅ Done |
| T8 | `12-submit-for-review`: dco-sign-off + merge-strategy-reminder; drop verify-commit-signatures | `activities/12-submit-for-review.toon` | ✅ Done |
| T9 | `13-complete`: drop resign-artifact-commits | `activities/13-complete.toon` | ✅ Done |
| T10 | `15-manage-git`: drop gpg-resign-range and --no-gpg-sign; add code-commits + merge-strategy protocols | `skills/15-manage-git.toon` | ✅ Done |
| T11 | New skill `25-dco-provenance` | `skills/25-dco-provenance.toon` | ✅ Done |
| T12 | `12-pr-description.md`: add `## AI Assistance` section | `resources/12-pr-description.md` | ✅ Done |
| T13 | Skill inventory renumbering + count update | `skills/README.md`, `README.md` | ✅ Done |

**Total:** 13 tasks, 14 files (T13 covers both README files), all Done at rebase point.

---

## Resume-Mode Note

This plan was reverse-engineered from the actual diff between `workflows` and `feat/dco-policy-compatibility`, observed in the worktree at `/home/mike1/projects/work/workflow-server/2026-05-18-dco-policy-update`. No future work is planned here — every task is already on disk and verified by the validators listed in `06-test-plan.md`.
