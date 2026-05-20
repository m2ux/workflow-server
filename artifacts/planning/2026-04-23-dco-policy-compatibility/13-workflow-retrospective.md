# Workflow Retrospective — DCO Policy Compatibility

**Work Package:** DCO Policy Compatibility
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Date:** 2026-05-20
**Mode:** Resume — PR authored first, work-package workflow reverse-engineered around it

---

## Context

This work package was unusual in two ways. First, the substantive change is **to the work-package workflow itself**: PR #109 edits the very TOON definitions that the work-package workflow runs. Second, the PR was authored directly — outside the workflow — and the planning artifacts were produced in **resume mode** after the implementation was already a finished diff. The workflow's job in this run was therefore documentation and validation of pre-existing work, not authoring it.

The meta-irony is direct: a workflow that prescribes how AI agents and humans share DCO attestation responsibility was itself authored before the workflow could be used to author it, and then retrospectively wrapped in the very planning, review, and submission discipline that the PR was modifying. The workflow ran the workflow's own redefinition through the workflow.

---

## What Went Well

- **Resume mode held up under stress.** The work-package workflow was designed to support resuming work that already exists on disk; this run exercised that path end-to-end. Every activity from `01-start-work-package` through `13-complete` produced a real artifact, reverse-engineered from the actual PR diff rather than from a fresh authoring run. No activity was skipped, and no artifact was a no-op placeholder.
- **The C1 finding was caught by post-impl-review.** The `rationale-amendment` checkpoint condition was inverted — it would have fired when the human had already confirmed the rationale, not when amendment was requested. This is the kind of bug that ships silently: validation passes, typecheck passes, the test suite passes, and the inversion only manifests when a real run hits the checkpoint and the gating is wrong. It was caught because `09-post-impl-review` ran a code-review pass over the diff and the reviewer noticed the polarity. Had the workflow skipped that activity in resume mode, the inversion would have shipped with the PR.
- **Strategic review fix-findings worked.** Both S1 (orphan `commit-signatures` protocol in `review-strategy`) and S2 (stale `activities/README.md`) were found by strategic review and fixed in-place via the `fix-findings` checkpoint, producing commits `5369ef9` and `2d93abc`. The fix-findings path was previously aspirational in some runs; here it actually surfaced and resolved two real findings before they reached the user.
- **Rebase recovery was clean.** The PR was authored against an earlier shape of `workflows`, then rebased onto `a2645ca` mid-review. Eleven conflicts across the workflow.toon, six activities, two skills, and the validator script were resolved in a single pass; the post-rebase validator and test runs were green on first try. The workflow's `manage-git` skill carried the rebase mechanics; no ad-hoc git surgery was needed.
- **The validator caught the variable-surface churn.** Three variables removed and three added across eight activities is the kind of refactor that leaves orphan references in obscure places. The TOON validator's variable-reference check caught every stale reference during initial implementation; nothing slipped through to the test suite.

---

## What Could Improve

- **Resume-mode planning artifacts are reverse-engineered, not driven.** When the PR is authored before the planning run, the planning artifacts document what already exists rather than guiding what to build. This means the artifacts can rationalise after the fact — the `01-design-philosophy.md` is a description of the diff's intent rather than a prior decision that the diff implemented. The workflow does not currently distinguish between forward-mode and resume-mode artifacts; a future enhancement could mark resume-mode artifacts with a banner so reviewers know which decisions actually preceded the code.
- **The in-conversation review channel is asymmetric.** PR #109 received zero formal GitHub reviews; all reviewer feedback came through in-conversation directives at the `review-received` checkpoint. The `12-review-analysis.md` artifact handled this fine (clear table of directives, severities, resolutions, commits) but the workflow's review-handling steps are written assuming GitHub-side review comments. When the user is the reviewer in conversation, the steps work by analogy rather than by direct mapping.
- **Resume-mode validation has a blind spot for "silent reintroduction".** The PR removes the `gpg-resign-range` protocol and the `--no-gpg-sign` mandate. The validator catches orphan *references* but does not assert "no commit-signing protocol exists anywhere." If a future task accidentally reintroduces `gpg-resign-range` under a different name but does not reference it from any activity, the validator passes. This is noted in `06-test-plan.md` under Out-of-Scope Verification but worth flagging as a structural gap.
- **Provenance log discipline is not server-enforced.** The new `log-provenance` step is per-task in `08-implement`. If a task is recorded without a provenance entry, only human review at the `file-index-table` or `dco-sign-off` gates will catch it. A server-side assertion that every task in `08-implement-record.md` has a corresponding row in `provenance-log.md` is a natural follow-up.
- **The `13-complete` activity assumed PR was already merged.** The `remove-worktree` step is gated on `worktree_created == true` and otherwise runs unconditionally. For this work package — where the whole point is human-driven squash-merge — the worktree must NOT be removed by the workflow because the human still needs it. The current workflow handles this by the worker explicitly skipping the step with a note in the COMPLETE doc, but a cleaner solution would be a `defer_worktree_removal` variable set by the new DCO model that the `remove-worktree` step condition also checks. Otherwise every DCO-model work package has to remember to skip by hand.

---

## Lessons Learned

1. **Running the workflow on changes to the workflow exposes real bugs.** The C1 inverted condition would have shipped if `09-post-impl-review` had been skipped or short-circuited in resume mode. Workflow-modifying PRs deserve the workflow's full review surface, not a fast-path. The dogfooding paid for itself in one cycle.
2. **Resume mode is a coexisting peer of forward mode, not a degenerate of it.** The planning artifacts produced here are real documents that capture real decisions — they just capture them retrospectively. The workflow's value in resume mode is the discipline of producing them at all, not the discipline of producing them in order.
3. **Removing infrastructure is harder to validate than adding it.** The validator catches new orphan references; it cannot catch absence-of-thing. For this PR — which is dominantly a removal (resign infrastructure, preflight scans, force-push paths) — the verification surface is mostly negative: "nothing references the removed thing." Future workflow-removal PRs should consider adding an assertion-style check that names the removed thing and confirms it does not appear in any TOON file.
4. **The DCO regime is a single-attestation-point problem, not a per-commit problem.** The previous design tried to attest every commit on the feature branch; the new design attests once at squash-merge. Once that simplification is made, an entire layer of agent infrastructure becomes obsolete. The lesson generalises: when a policy regime forces multiple attestations from a system that has one human, look for a single human gate that subsumes them all.
5. **`Co-authored-by:` is the right place to put assistant identity, not GPG.** GitHub renders the trailer in commit bylines, the human's `Signed-off-by:` is the DCO record, and the human's GPG signature is the cryptographic attestation. Assigning each contributor exactly one role per commit clarifies the audit story; previously the agent's GPG signature was doing the work of all three, badly.
6. **Resume-mode COMPLETE documents are easier to write because everything actually happened.** Compared to forward-mode where the COMPLETE document is partly aspirational ("deferred items," "follow-ups," "limitations to watch"), resume-mode COMPLETE documents are bookkeeping: the PR exists, the diff is final, the validation results are recorded. The artifact is more accurate and less speculative.

---

## Meta-Observation

The single most valuable run-time observation of this work package is that **the workflow caught a bug in the change to itself**. The `rationale-amendment` inverted-condition finding (C1) was produced by the same activity (`09-post-impl-review`) that the PR was modifying. The activity ran over its own redefinition, noticed the polarity error in the new logic, and surfaced it at the post-impl-review code-review step. The user actioned the fix at the `apply-c1-now` checkpoint, the worker shipped commit `1d490c8`, validation passed, and the workflow continued.

Workflow systems that cannot review their own changes generally drift. This one did not, in this run, because the workflow was applied to the workflow without flinching. That is the result to remember.
