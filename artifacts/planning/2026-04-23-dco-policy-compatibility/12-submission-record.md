# 12 — Submission Record

**Activity:** `submit-for-review` (v1.3.0)
**Session:** `MJ3XF4`
**Mode:** resume / non-review (`is_review_mode=false`)
**Date:** 2026-05-20

---

## PR identity

| Field | Value |
|-------|-------|
| PR | [#109](https://github.com/m2ux/workflow-server/pull/109) |
| Title | feat(work-package): DCO policy compatibility |
| Base branch | `workflows` |
| Head branch | `feat/dco-policy-compatibility` |
| Head SHA | `2d93abc3ed359c61f3391c7def7f1093a1528d1e` |
| State | OPEN |
| Draft | false (ready for review) |

---

## Per-step status

The active activity definition is v1.3.0 of `submit-for-review`. The PR itself (the SUBJECT of this work package) introduces work-package v3.12.1, which removes `verify-commit-signatures` and adds `dco-sign-off` + `merge-strategy-reminder`. The orchestrator is still driving the v1.3.0 definition because the live `workflows` submodule has not yet absorbed the PR. Steps were handled as follows:

| # | Step ID | Status | Rationale |
|---|---------|--------|-----------|
| 1 | `consolidate-review-findings` | SKIP | Gated on `is_review_mode == true`; this is a submit-author run, not a review run. |
| 2 | `generate-review-summary` | SKIP | Gated on `is_review_mode == true`. |
| 3 | `present-summary-to-user` | SKIP | Gated on `is_review_mode == true`. |
| 4 | `post-pr-review` | SKIP | Gated on `is_review_mode == true`. |
| 5 | `verify-commit-signatures` | **SKIP (policy override)** | See "Verify-commit-signatures skip" below. |
| 6 | `push-commits` | SKIP | Branch already pushed; remote at HEAD `2d93abc`. No new local commits to push. |
| 7 | `update-description` | SKIP | PR description was edited earlier in this session to point the Engineering link at the correct README; current and conformant. No further changes warranted. |
| 8 | `mark-ready` | SKIP | PR is already non-draft (`isDraft=false`). |
| 9 | `await-review` | **ACTIVE — yielded** | `review-received` blocking checkpoint fired; worker yielded and stopped. |
| 10 | `process-review-comments` | DEFERRED | Cannot run until human reviewers have actually commented. |
| 11 | `determine-review-outcome` | DEFERRED | Same. |
| 12 | `analyze-review-outcome` | DEFERRED | Same; will fire `review-outcome` checkpoint after step 10–11. |

---

## Verify-commit-signatures skip

The v1.3.0 step description is literally:

> `manage-git::gpg-resign-range(target_path: {target_path})`

That protocol is the very thing PR #109 removes. The PR implements the DCO-Safe Agentic Coding Policy, under which:

- Per-commit GPG signatures on the feature branch are **not** load-bearing. The squash-merge commit on the `workflows` base branch is the auditable attestation.
- The squash-merge is performed locally by the human with `git merge --squash` (or `gh pr merge --squash`) followed by `git commit -s -S`, producing both a DCO sign-off and a GPG signature on a single commit the human authored.
- The agent must **not** rewrite branch history to add signatures on the human's behalf, because doing so makes the agent the source of the attestation that the DCO regime is meant to capture from the human.

The PR branch's commits are therefore intentionally unsigned. The user has GPG configured (verified during `start-work-package`) and will sign the squash-merge at merge time. Running `gpg-resign-range` here would:

1. Force-push a rewritten history to the open PR.
2. Make the agent the GPG signer on every commit.
3. Directly contradict the policy that this very PR implements.

Step skipped with rationale recorded. No deviation from intent — the v1.3.0 definition is being driven against a subject that already supersedes it.

---

## Active checkpoint

**Step 9 — `await-review`** yields the `review-received` blocking checkpoint. Options:

- `yes-review` — Review comments received; proceed to analyze and respond.
- `no-waiting` — Still waiting; continue waiting.

Variables set on entry:

- `pr_url` = `https://github.com/m2ux/workflow-server/pull/109`
- `pr_status` = `ready`

`review_requires_changes` is intentionally **not** set yet — it is the effect of the downstream `review-outcome` checkpoint, after a human has actually reviewed.

---

## Status

**Yielded** at `review-received`. No further worker action until the orchestrator resumes with the human's checkpoint response.
