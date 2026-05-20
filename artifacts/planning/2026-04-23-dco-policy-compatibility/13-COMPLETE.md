# Work Package: DCO Policy Compatibility — Complete

**Date:** 2026-05-20
**Type:** Enhancement (workflow content)
**Status:** COMPLETE — pending human squash-merge on `workflows`
**Branch:** `feat/dco-policy-compatibility`
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109) (approved at HEAD `2d93abc`)
**ADR:** [ADR-0004](../../adr/0004-dco-policy-compatibility.md)

---

## Summary

The `work-package` workflow is realigned with the DCO-Safe Agentic Coding Policy. Per-commit GPG signing by the agent is removed; attestation is relocated to a single human-driven squash-merge with `-s -S`. The workflow adds a provenance log captured during research and implementation, a strengthened per-block rationale-confirmation gate, and a blocking `dco-sign-off` human checkpoint at PR submission. PR #109 is approved (no GitHub-side reviews; review conducted in-conversation with the user as reviewer); the squash-merge itself is the human's job and is deliberately not performed by the workflow.

---

## Deliverables

PR #109 changes the work-package workflow definition, eight activities, two skills, and one resource template. No `src/` or `schemas/` source is touched.

### Workflow definition

- [`work-package/workflow.toon`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/workflow.toon) — `3.11.0 → 3.12.1`. Variable surface: `unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary` removed; `squash_merge_available`, `context_scope`, `rationale_confirmed` added.

### Activities

- [`01-start-work-package`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/01-start-work-package.toon) — new `detect-merge-strategy` step (T2).
- [`04-research`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/04-research.toon) — new `declare-context-scope` checkpoint (T3).
- [`08-implement`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/08-implement.toon) — new `provenance-log` artifact and per-task `log-provenance` step (T4).
- [`09-post-impl-review`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/09-post-impl-review.toon) — `file-index-table` checkpoint records rationale-confirmation provenance; `rationale-amendment` checkpoint added (T5; C1 fix `1d490c8` introduced the explicit `rationale_confirmed` boolean).
- [`10-validate`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/10-validate.toon) — GPG preflight scan removed (T6).
- [`11-strategic-review`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/11-strategic-review.toon) — `unsigned-commits-prompt` checkpoint and `resign-unsigned-pr-commits` step removed (T7).
- [`12-submit-for-review`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/12-submit-for-review.toon) — `verify-commit-signatures` step removed; blocking `dco-sign-off` checkpoint and non-blocking `merge-strategy-reminder` checkpoint added (T8).
- [`13-complete`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/13-complete.toon) — `resign-artifact-commits` step removed (T9).

### Skills

- [`15-manage-git`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/skills/15-manage-git.toon) — `gpg-resign-range` protocol removed; `--no-gpg-sign` mandate on artifact commits removed; new `code-commits` protocol with `Co-authored-by:` trailer and harness-aware guidance (T10).
- [`12-review-strategy`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/skills/12-review-strategy.toon) — orphan `commit-signatures` protocol removed (strategic-review S1 fix, commit `5369ef9`).
- [`25-dco-provenance`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/skills/25-dco-provenance.toon) — NEW. Owns provenance-log schema, attestation recording, and context-scope classification (T11).

### Resources

- [`12-pr-description.md`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/resources/12-pr-description.md) — new `## AI Assistance` section interpolating provenance values (T12).

### Documentation

- [`work-package/activities/README.md`](https://github.com/m2ux/workflow-server/blob/feat/dco-policy-compatibility/workflows/work-package/activities/README.md) — refreshed for PR #109 scope (strategic-review S2 fix, commit `2d93abc`).
- Skill-inventory README counts adjusted from 24 to 25 (T13).

---

## Task-by-Task Status

| Task | Description | Status | Notes |
|------|-------------|:------:|-------|
| T1 | Variable-surface cleanup (3 removed, 3 added) | ✅ | Reflected across workflow.toon and all referencing activities. |
| T2 | `detect-merge-strategy` step in `01-start-work-package` | ✅ | Sets `squash_merge_available`. |
| T3 | `declare-context-scope` checkpoint in `04-research` | ✅ | Three options: `repo-only`, `web-retrieval`, `mixed`. |
| T4 | `provenance-log` artifact + `log-provenance` step in `08-implement` | ✅ | Per-task append; values interpolated into PR description in T12. |
| T5 | Rationale-confirmation strengthening in `09-post-impl-review` | ✅ | Includes C1 fix (`1d490c8`): explicit `rationale_confirmed` boolean gating `rationale-amendment` checkpoint. |
| T6 | Drop GPG preflight scan from `10-validate` | ✅ | |
| T7 | Drop `unsigned-commits-prompt` and `resign-unsigned-pr-commits` from `11-strategic-review` | ✅ | |
| T8 | `dco-sign-off` + `merge-strategy-reminder` in `12-submit-for-review`; remove `verify-commit-signatures` | ✅ | DCO checkpoint blocking; merge-strategy reminder non-blocking, conditional on `squash_merge_available`. |
| T9 | Drop `resign-artifact-commits` from `13-complete` | ✅ | |
| T10 | `15-manage-git` protocol changes: remove `gpg-resign-range`, remove `--no-gpg-sign`, add `code-commits` with `Co-authored-by:` | ✅ | Harness-aware guidance documents Claude Code auto-injection vs explicit add for other harnesses. |
| T11 | New `25-dco-provenance` skill | ✅ | Provenance-log schema, attestation recording, context-scope classification. |
| T12 | PR-description `## AI Assistance` section | ✅ | Interpolates provenance values. |
| T13 | Skill-inventory README count update (24 → 25) | ✅ | |

---

## In-Conversation Review Log

There were no formal GitHub PR reviews on #109 (confirmed via `gh api repos/m2ux/workflow-server/pulls/109/reviews` and `…/comments` — both empty). The user served as reviewer; four directives were issued at the `review-received` checkpoint, two of which required code commits. Two earlier review-findings fix cycles (one from post-impl-review code review, one from strategic review) also produced commits.

| # | Severity | Feedback | Resolution | Commit |
|---|----------|----------|------------|--------|
| 1 | Major | Rebase the PR onto current `workflows` HEAD `a2645ca` (2026-05-18 sweep: cargo-operations, worktree refactor). | Merged `workflows` into `feat/dco-policy-compatibility`; resolved 11 conflicts (workflow.toon, activities 04/08/09/10/11/12, manage-git skill, review-strategy skill, validate-workflow-toon script). Re-ran validator (11/11 green), typecheck (clean), vitest (322/322). | `b5b7b7c` |
| 2 | Minor | Engineering link in PR body pointed at the root of the `workflows` branch rather than the planning folder README on the `engineering` branch. | Updated PR-body link to target `tree/engineering/.engineering/artifacts/planning/2026-04-23-dco-policy-compatibility`. | PR description edit |
| 3 | Minor | C1 finding (post-impl-review code review): `rationale-amendment` checkpoint condition was inverted — fired when the human had already confirmed, not when amendment was requested. | Introduced explicit `rationale_confirmed` boolean; rewrote condition to gate on `rationale_confirmed == false`. workflow.toon `3.12.0 → 3.12.1`; activity `09` `1.10.0 → 1.11.0`. Validator + typecheck green. | `1d490c8` |
| 4 | Informational | S2 finding (strategic review): `work-package/activities/README.md` narrative drifted from PR #109 scope. | Refreshed README to match the activity TOON definitions touched by this PR. No schema or behaviour change. | `2d93abc` |
| 5 | Informational | "Do workflows pass schema validation?" — pre-merge sanity check. | Ran `npx tsx scripts/validate-workflow-toon.ts`; 11/11 workflows green. | (verification only) |

Earlier fix cycle within strategic review:

| # | Severity | Feedback | Resolution | Commit |
|---|----------|----------|------------|--------|
| S1 | Minor | Orphan `commit-signatures` protocol in `review-strategy` skill (no longer referenced after T7). | Removed the orphan protocol. | `5369ef9` |

All directives actioned inline; no outstanding items at review close. Recommended outcome `approved`; `review_requires_changes = false`.

---

## Validation Status

All three verification commands ran clean at PR HEAD `2d93abc` (recorded in `10-validation-record.md` and re-confirmed at strategic-review fix-pass close):

| Command | Result | Notes |
|---------|--------|-------|
| `npx tsx scripts/validate-workflow-toon.ts work-package` | ✅ all-valid | No errors, no warnings beyond pre-existing advisory output. |
| `npm run typecheck` | ✅ clean | No regressions. |
| `npm test` | ✅ 322/322 (4 skipped) | 13/13 test files, 28.63s wall. |

Strategic review concluded `acceptable` (1 Minor fixed in-place, 1 Informational deferred and then addressed); code review reported 1 Minor (C1, fixed) and 2 Nit (C2, C3); structural-findings review reported no Critical or Major.

---

## Deferred Items

None material. The work package landed end-to-end; no deferred functionality, no partial implementations, no follow-up tasks blocked behind this PR.

---

## Known Limitations

1. **Squash-merge required for the prescribed attestation flow.** When a repository disables `allow_squash_merge`, the workflow surfaces the DCO checkpoint but cannot offer the local-squash flow. By design — no automatic substitute is provided.
2. **Human-in-the-loop at PR submission.** The blocking `dco-sign-off` checkpoint means `12-submit-for-review` cannot run unattended. Workflows previously dispatched headlessly through submit are now interrupted by this gate.
3. **Provenance-log row discipline is not server-enforced.** The validator catches missing variable or skill references but cannot catch a missing `log-provenance` row for a task. If a task is recorded without a provenance entry, the audit story regresses silently. Mitigation is human review at the `file-index-table` and `dco-sign-off` gates.
4. **`Co-authored-by:` trailer behaviour varies by harness.** Claude Code injects automatically; other harnesses must add the trailer explicitly. The new `code-commits` protocol documents this but cannot enforce it; verifying actual harness behaviour requires running each harness end-to-end.

---

## Follow-Up Items

- **Worktree cleanup.** The worktree at `/home/mike1/projects/work/workflow-server/2026-05-18-dco-policy-update` is preserved for the human-driven squash-merge `-s -S`. Post-merge, run `git -C /home/mike1/projects/main/workflow-server worktree remove /home/mike1/projects/work/workflow-server/2026-05-18-dco-policy-update` (or equivalent) to clean it up.
- **End-to-end exercise.** The new `detect-merge-strategy` step, `dco-sign-off` checkpoint, and `merge-strategy-reminder` checkpoint are exercised only by static validation and unit tests in this PR; a real run on a target repo would confirm the full UX path. Assumptions D1, F2, F3 in `01-assumptions-log.md` flag the gap.
- **PR-description Markdown rendering.** The `## AI Assistance` section is not exercised by automated tests; visual verification at first real-run is in scope for the next work package that submits a PR through the updated workflow.

---

## Worktree Status

**Preserved.** The worktree at `/home/mike1/projects/work/workflow-server/2026-05-18-dco-policy-update` is NOT removed by this activity. It is required for the human-driven squash-merge with `git commit -s -S` per the new DCO model — the whole point of this PR. Cleanup is the human's job post-merge, either by hand or via the `git worktree remove` command shown under "Follow-Up Items" above.

The `worktree_created` session variable remains `true` for this reason. The `remove-worktree` step (gated on `worktree_created == true`) is deliberately skipped in this completion activity.

---

## Next Work Package

None on deck.

---

**Status:** PR #109 approved at HEAD `2d93abc`; awaiting human squash-merge with `-s -S` onto `workflows`. Worktree preserved.
