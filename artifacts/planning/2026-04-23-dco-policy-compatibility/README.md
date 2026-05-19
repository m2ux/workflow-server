# DCO Policy Compatibility - April 2026

**Created:** 2026-04-23
**Status:** In Review (PR open, rebased onto current `workflows` 2026-05-18)
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Align the `work-package` workflow with the DCO-Safe Agentic Coding Policy. The existing workflow re-signed every branch commit with GPG before submission, which required force-pushes and could only be performed by the agent on behalf of the human — directly conflicting with the policy requirement that humans make their own attestations. This work replaces the per-commit resign infrastructure with a squash-merge-time signing model, adds a provenance log per work package, and gates PR submission on a human DCO sign-off checkpoint.

---

## Problem Overview

The previous DCO posture in `work-package` had three structural problems. First, the `verify-commit-signatures` step in `submit-for-review` invoked `gpg-resign-range` on the agent's behalf, rewriting branch history (`rebase --exec 'git commit --amend --no-edit -S'`) and force-pushing the result. That made the agent — not the human contributor — the source of the GPG attestation on every commit, which is the opposite of what a DCO regime is meant to capture. Second, the workflow scanned for unsigned commits in `validate`, surfaced a prompt at `strategic-review`, and offered a resign option there too — three separate places where the human could acquiesce to an attestation the agent had set up. Third, every artifact commit was forced to `--no-gpg-sign` so the workflow could run unattended; that worked but left a permanently unsigned audit trail on the engineering branch and entangled the agent in commit-signing decisions that belong to the human and the merge tool.

The DCO-Safe Agentic Coding Policy resolves this by relocating attestation to a single, deliberate human action: the squash-merge commit. GitHub's web-UI squash merge is unsigned, so the policy prescribes a local squash-merge with `-s -S` that is both DCO-signed-off and GPG-signed. Per-commit signatures on the feature branch are no longer load-bearing — the squash commit is the auditable artefact.

---

## Solution Overview

The PR makes the workflow stop doing per-commit signing work on the human's behalf and adds explicit human gates around the squash-merge attestation instead. Four shifts:

1. **Detect the merge strategy up-front.** `start-work-package` gains a `detect-merge-strategy` step that calls the GitHub API for `allow_squash_merge` and sets `squash_merge_available`. That flag drives downstream UX: when squash-merge is available, the workflow steers the human toward the signed local squash flow; when it is not, the workflow declines to invent a substitute attestation path.

2. **Capture provenance during research and implementation.** `04-research` adds a `declare-context-scope` checkpoint (repo-only | web-retrieval | mixed). `08-implement` gains a `provenance-log.md` artifact and a `log-provenance` step per task that appends one row per task (task ID, assistant, model, prompt class, context scope, description). The PR description's `## AI Assistance` section interpolates the same values so reviewers can read the provenance summary without leaving the PR.

3. **Strengthen the per-block rationale confirmation.** `09-post-impl-review`'s `file-index-table` checkpoint now records the human's rationale confirmation per change block as a provenance attestation, and a `rationale-amendment` checkpoint lets the human correct any agent-written rationale paragraph before the diff goes to automated review. The corrections land in `manual-diff-review-report.md` as the human's own provenance statement, not the agent's.

4. **Gate PR submission on a human DCO sign-off.** `12-submit-for-review` adds a blocking `dco-sign-off` checkpoint that surfaces a 6-item certification (right to submit, understood the diff, clean provenance, can explain origin, tests run, willing to take responsibility). A non-blocking `merge-strategy-reminder` checkpoint walks the human through the local squash-merge-with-`-s -S` flow when `squash_merge_available` is true. The `verify-commit-signatures` step that called `gpg-resign-range` is removed.

The cleanup follows: `10-validate` drops the GPG preflight scan, `11-strategic-review` drops the `unsigned-commits-prompt` checkpoint and the `resign-unsigned-pr-commits` step, `13-complete` drops the `resign-artifact-commits` step, and `15-manage-git` drops the `gpg-resign-range` protocol and the `--no-gpg-sign` mandate on artifact commits. A new `code-commits` protocol adds the `Co-authored-by:` trailer so GitHub renders both the human and the assistant in the commit byline, with harness-aware guidance (Claude Code injects it automatically; other assistants must add it explicitly).

The supporting variable surface shrinks: `unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, and `unsigned_commit_list_summary` are removed; `squash_merge_available` and `context_scope` are added. A new `dco-provenance` skill (work-package skill 25) owns the provenance-log schema, attestation recording, and context-scope classification.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| — | Authoring | Initial PR drafted directly (no start-work-package run) | 2-4h | ✅ Complete |
| — | Rebase | Reconcile with `workflows` HEAD `a2645ca` (2026-05-18 sweep + cargo-operations + worktree refactor) | 1-2h | ✅ Complete |
| — | Validation | `npx tsx scripts/validate-workflow-toon.ts` on merged work-package; `npm run typecheck` and full test suite | 10-20m | ✅ Complete |
| 01 | Design Philosophy | `01-design-philosophy.md` — problem classification, complexity, workflow path | 10-20m | ✅ Complete |
| 01 | Assumptions Log | `01-assumptions-log.md` — initial assumptions from design-philosophy | — | ✅ Complete |
| 06 | Work Package Plan | `06-wp-plan.md` — 13-task breakdown reverse-engineered from PR #109 | 20-45m | ✅ Complete |
| 06 | Test Plan | `06-test-plan.md` — schema validation, typecheck, vitest verification surface | — | ✅ Complete |
| 07 | Assumptions Review | `07-assumptions-review.md` — resume-mode reconciliation: no open or deferred assumptions | 10-20m | ✅ Complete |
| 08 | Implementation | `08-implement-record.md` — resume-mode task→commit map for 13 tasks across 6 commits on `feat/dco-policy-compatibility` | — | ✅ Complete |
| — | PR review | External review feedback cycle | TBD | ⏳ In progress |
| — | Merge | Squash-merge with `-s -S` on `workflows` branch | — | ⏳ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| PR | [#109](https://github.com/m2ux/workflow-server/pull/109) |
| Base branch | `workflows` |
| Head branch | `feat/dco-policy-compatibility` |
| Driving policy | DCO-Safe Agentic Coding Policy |

---

**Status:** PR rebased onto current `workflows` (2026-05-18). All schema validation, server typecheck, and tests green. Awaiting human review.
