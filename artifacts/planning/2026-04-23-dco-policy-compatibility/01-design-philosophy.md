# Design Philosophy — DCO Policy Compatibility

**Activity:** design-philosophy
**Date:** 2026-04-23 (backfilled 2026-05-19 from authored PR content)
**Branch:** `feat/dco-policy-compatibility`
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Driving policy:** DCO-Safe Agentic Coding Policy

---

## 1. Problem Statement

### 1.1 What is happening

The `work-package` workflow's DCO posture put the agent in the GPG-attestation seat on the human's behalf. Three structural problems compounded:

1. The `verify-commit-signatures` step in `submit-for-review` invoked `gpg-resign-range` against the feature branch, which executed `git rebase --exec 'git commit --amend --no-edit -S'` and force-pushed the rewritten history. The agent — not the human contributor — became the source of the GPG attestation on every commit. This is the opposite of what a DCO regime is meant to capture.
2. The workflow scanned for unsigned commits in `validate`, surfaced a prompt at `strategic-review`, and offered a resign option there too — three separate places where the human could rubber-stamp an attestation the agent had set up.
3. Every artifact commit was forced to `--no-gpg-sign` so the workflow could run unattended. That worked operationally but left a permanently unsigned audit trail on the engineering branch and entangled the agent in commit-signing decisions that belong to the human and the merge tool.

### 1.2 System understanding

- The previous design optimised for "every commit on the feature branch is GPG-signed by the time the PR opens." It achieved this by having the agent resign the range.
- The DCO-Safe Agentic Coding Policy reframes the goal: the auditable attestation is the **squash-merge commit**, not the per-commit signatures on the feature branch. GitHub's web-UI squash merge produces an unsigned commit, so the policy prescribes a **local squash-merge with `-s -S`** that is both DCO-signed-off and GPG-signed.
- Once the squash commit is the load-bearing artefact, per-commit signing on the feature branch stops carrying weight. The workflow does not need to manufacture per-commit signatures and must not pre-empt the human's squash-merge attestation.

### 1.3 Impact assessment

The previous posture broke the DCO promise: the human's nominal "sign-off" was on an agent-constructed signing chain, not on the diff itself. Workflows in this state cannot be honestly characterised as DCO-compliant. The fix has to (a) stop the agent from signing on the human's behalf, (b) make the squash-merge attestation a deliberate, gated human action, and (c) capture enough provenance during the run that the human can answer "where did this code come from" at sign-off time without re-reading the entire diff blind.

### 1.4 Success criteria

1. The `work-package` workflow no longer rewrites branch history to add GPG signatures on commits the agent authored.
2. A new `dco-sign-off` checkpoint at `12-submit-for-review` presents a 6-item certification and blocks PR submission until the human attests.
3. When the target repository allows squash-merge (`allow_squash_merge` via the GitHub API), the workflow surfaces a non-blocking `merge-strategy-reminder` checkpoint walking the human through the local `git merge --squash` + `git commit -s -S` flow.
4. Provenance is captured during the run (research context scope, per-task assistant/model/prompt-class log, per-change-block rationale confirmation) and rendered into both `provenance-log.md` and the PR description's `## AI Assistance` section.
5. All compensating signing infrastructure is removed: the `gpg-resign-range` protocol, the unsigned-commits scan in validate, the strategic-review resign prompt, the complete-activity resign step, and the `--no-gpg-sign` mandate on artifact commits.
6. The `Co-authored-by:` trailer is added to commit-creation guidance with harness-aware notes (Claude Code injects it automatically; other assistants must add it explicitly).

### 1.5 Constraints

- **No runtime server-source changes.** The change is entirely in workflow content (TOON edits under `work-package/` plus one cross-cutting skill update and a new skill file). No `src/` or `schemas/` modifications.
- **Single-PR scope.** All work-package activity changes (01, 04, 08, 09, 10, 11, 12, 13) plus the cross-cutting `15-manage-git` skill change land together; partial adoption would leave the workflow in an inconsistent DCO posture mid-transition.
- **No invented alternative attestation paths.** When `squash_merge_available` is false, the workflow declines to fabricate a substitute. The human handles merge attestation through whatever native mechanism the repo supports.

---

## 2. Problem Classification

**Type:** `inventive-improvement`

The driving policy (DCO-Safe Agentic Coding Policy) specifies the target end-state but the workflow surface that has to move there is novel — the previous resign-time model is removed wholesale and a new squash-merge-time gate is constructed with supporting provenance machinery. There is no isolated bug to fix; there is a workflow contract to rebuild around a different attestation locus.

**Complexity:** `complex`

- **Cross-cutting workflow surface.** 8 of the 14 work-package activities change (01, 04, 08, 09, 10, 11, 12, 13), plus one cross-cutting skill (`15-manage-git`).
- **Workflow contract change, not a feature addition.** The DCO posture inverts: from "agent re-signs branch history before submission" to "human signs at squash-merge time, agent never resigns." Compensating mechanisms (resign step, unsigned-commit scans, force-push protocol, `--no-gpg-sign` mandate) all retire in the same change set.
- **New skill surface.** A new `dco-provenance` skill (work-package skill 25) owns the provenance-log schema, attestation recording, and context-scope classification — pulling provenance concerns out of ad-hoc per-activity rules and into a named, reusable skill.
- **Variable-surface churn.** Three variables removed (`unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary`), two added (`squash_merge_available`, `context_scope`).
- **Downstream implications for real work-package runs.** Users running real packages encounter a fundamentally different DCO flow: no more agent-managed signing chain, an explicit human gate before PR submission, an explicit provenance log surfacing in the PR description.

Code-level risk is low (no runtime code changed). Workflow-design risk is meaningful: the change reshapes the human's interaction surface at submission time and must work coherently across all eight touched activities.

---

## 3. Solution Approach

### 3.1 Relocate attestation from resign-time to squash-merge-time

Stop having the agent re-sign the branch. Treat the **squash-merge commit** as the auditable artefact: a single, deliberate human-authored commit with `-s` (DCO) and `-S` (GPG). The agent's job becomes ensuring that commit happens under the right conditions, with the right evidence in front of the human, rather than producing the signatures itself.

Four shifts implement this:

1. **Detect the merge strategy up-front.** `start-work-package` gains a `detect-merge-strategy` step that calls the GitHub API for `allow_squash_merge` and sets `squash_merge_available`. That flag drives downstream UX: when squash-merge is available, the workflow steers the human toward the signed local squash flow; when it is not, the workflow declines to invent a substitute attestation path.

2. **Capture provenance during research and implementation.** `04-research` adds a `declare-context-scope` checkpoint (`repo-only` | `web-retrieval` | `mixed`). `08-implement` gains a `provenance-log.md` artifact and a `log-provenance` step per task that appends one row per task (task ID, assistant, model, prompt class, context scope, description). The PR description's `## AI Assistance` section interpolates the same values so reviewers can read the provenance summary without leaving the PR.

3. **Strengthen the per-block rationale confirmation.** `09-post-impl-review`'s `file-index-table` checkpoint now records the human's rationale confirmation per change block as a provenance attestation, and a `rationale-amendment` checkpoint lets the human correct any agent-written rationale paragraph before the diff goes to automated review. The corrections land in `manual-diff-review-report.md` as the human's own provenance statement, not the agent's.

4. **Gate PR submission on a human DCO sign-off.** `12-submit-for-review` adds a blocking `dco-sign-off` checkpoint that surfaces a 6-item certification (right to submit, understood the diff, clean provenance, can explain origin, tests run, willing to take responsibility). A non-blocking `merge-strategy-reminder` checkpoint walks the human through the local squash-merge-with-`-s -S` flow when `squash_merge_available` is true. The `verify-commit-signatures` step that called `gpg-resign-range` is removed.

### 3.2 Retire the compensating signing infrastructure

With attestation relocated, every mechanism whose job was to manufacture or scan for per-commit GPG signatures becomes either redundant or actively misleading. The cleanup follows the relocation in the same PR:

- `10-validate` drops the GPG preflight scan.
- `11-strategic-review` drops the `unsigned-commits-prompt` checkpoint and the `resign-unsigned-pr-commits` step.
- `13-complete` drops the `resign-artifact-commits` step.
- `15-manage-git` drops the `gpg-resign-range` protocol and the `--no-gpg-sign` mandate on artifact commits. A new `code-commits` protocol adds the `Co-authored-by:` trailer with harness-aware notes (Claude Code injects it automatically; other assistants must add it explicitly).

The variable surface shrinks accordingly: `unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, and `unsigned_commit_list_summary` are removed; `squash_merge_available` and `context_scope` are added.

### 3.3 Why this approach over the alternatives

**vs. keeping resign-time signing and adding a sign-off checkpoint on top.** A bolt-on sign-off would still leave the agent authoring the per-commit signing chain — the human would be attesting to an attestation the agent constructed. The DCO regime explicitly wants the human's signature on the diff, not on a derived artefact. Removing the resign infrastructure entirely is the only way to honour that.

**vs. unsigned squash-merge via the GitHub web UI.** GitHub's web-UI squash merge produces an unsigned commit. That works for projects that don't require signed merges; for projects that do (including this one and the policy's reference deployment), the local-squash flow with `-s -S` is the only path that produces both a DCO-signed-off and GPG-signed merge commit.

**vs. a custom merge bot or server-side signing.** Both reintroduce a third party between the human and the signature. The policy's design intent is that the human's local keychain is the only entity that signs on the human's behalf. A merge bot does not satisfy this; nor does a server-side signing service.

---

## 4. Workflow Path

**Path:** `skip-optional`

Pre-resolved on entry:
- `complexity = complex`
- `path_gating_complexity = complex`
- `needs_elicitation = false`
- `needs_research = false`
- `needs_comprehension = false`
- `skip_optional_activities = true`
- `skip_architecture_summary = false`

**Rationale:**

- **No elicitation.** Scope is fully specified by the DCO-Safe Agentic Coding Policy. The policy names the goal (squash-merge-time attestation), the mechanism (local squash with `-s -S`), the provenance surface (per-task log, PR description section), and the gates (human sign-off checkpoint). There is nothing left for elicitation to discover.
- **No research.** The driving policy is the canonical reference. The GitHub `allow_squash_merge` API surface is documented in the GitHub REST API; the local-squash-with-`-s -S` Git flow is standard. No external pattern survey is needed.
- **No comprehension.** The PR is already open (#109) and the implementation is on disk. The worker who authored the PR demonstrably comprehended the affected workflow surface; re-running comprehension would be redundant.
- **Skip optional activities (`skip_optional_activities = true`).** Follows directly from the three negatives above.
- **Keep architecture summary (`skip_architecture_summary = false`).** Although optional activities are skipped, the workflow has a substantive architecture story worth summarising for stakeholders in `strategic-review`: the resign-time → squash-merge-time relocation is a real architectural change in how the workflow handles attestation, and the new `dco-provenance` skill is a new structural element worth naming explicitly in the summary.

**Mode:** Resume mode. The PR is open and the implementation is on disk; this activity produces the design-philosophy artifact retroactively from the README's authored content so the planning folder has the canonical record the workflow expects.

---

## 5. Trade-offs

### 5.1 Single-PR scope vs. incremental rollout

A staged rollout (e.g., land the sign-off checkpoint first, then the provenance log, then the resign-infrastructure removal) would have lower per-PR risk but leave the workflow in an inconsistent DCO posture between stages — some activities scanning for unsigned commits while others have stopped requiring them, some artifacts captured under the old model and some under the new. Single-PR scope is chosen because the contract change is atomic at the workflow level: every activity needs to be coherent with the same attestation model at the same time.

### 5.2 Squash-merge dependency

The recommended flow assumes `allow_squash_merge` is enabled on the target repository. Where it is not, the workflow surfaces the `dco-sign-off` checkpoint but does not invent a fallback attestation path; the human handles merge attestation through whatever native mechanism the repo supports. This is a deliberate choice not to overgeneralise — the policy is opinionated about squash-merge being the canonical locus, and faking an alternative would re-introduce agent-side cleverness around attestation, which is exactly what this work removes.

### 5.3 Provenance verbosity

The per-task provenance log adds one row per implemented task, plus a context-scope checkpoint in research, plus per-block rationale confirmation in post-impl-review. For small work packages this is high relative overhead. The alternative — a single end-of-run provenance summary — was rejected because (a) per-task capture is the only way to answer "where did this specific change come from" without reconstructing memory at sign-off time, and (b) the PR description section materialises the same data without the human having to read the log directly.

### 5.4 No runtime code change

All changes are in workflow content (TOON edits, a new skill, a resource file). No `src/` or `schemas/` modifications. The trade-off is that the new DCO posture is enforced by workflow discipline rather than by hard server-side checks — a worker that ignored the sign-off checkpoint could in principle submit a PR without it. The mitigation is the meta-orchestrator's checkpoint discipline rules (workers yield, orchestrators bubble, only the meta-orchestrator resolves), which give the sign-off checkpoint the same operational weight as any other blocking gate.

---

## 6. Scope

### 6.1 In scope

- `work-package/01-start-work-package` — add `detect-merge-strategy` step that sets `squash_merge_available`.
- `work-package/04-research` — add `declare-context-scope` checkpoint setting `context_scope`.
- `work-package/08-implement` — add `provenance-log.md` artifact and `log-provenance` step.
- `work-package/09-post-impl-review` — strengthen `file-index-table` checkpoint as a per-block provenance attestation; add `rationale-amendment` checkpoint feeding `manual-diff-review-report.md`.
- `work-package/10-validate` — remove unsigned-commits scan.
- `work-package/11-strategic-review` — remove `unsigned-commits-prompt` checkpoint and `resign-unsigned-pr-commits` step.
- `work-package/12-submit-for-review` — add blocking `dco-sign-off` checkpoint with 6-item certification; add non-blocking `merge-strategy-reminder` checkpoint; remove `verify-commit-signatures` step.
- `work-package/13-complete` — remove `resign-artifact-commits` step.
- `work-package/15-manage-git` (cross-cutting skill) — remove `gpg-resign-range` protocol; remove `--no-gpg-sign` mandate on artifact commits; add `code-commits` protocol with `Co-authored-by:` trailer guidance.
- New skill: `work-package/skills/25-dco-provenance` — owns the provenance-log schema, attestation recording, and context-scope classification.
- New PR-description resource template for the `## AI Assistance` section.
- Variable surface: remove `unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary`; add `squash_merge_available`, `context_scope`.

### 6.2 Out of scope

- **Runtime server source changes.** All edits stay in workflow content.
- **GitHub API integration for verifying the squash-merge happened.** The workflow surfaces the merge-strategy reminder; it does not poll for completion or post-hoc verify the merge commit's signature.
- **Backporting the new DCO posture to non-work-package workflows.** Only the work-package workflow changes in this PR; other workflows (prism, audit, etc.) keep their existing DCO posture and would be migrated separately if and when needed.
- **A signed-merge bot or server-side signing service.** Explicitly rejected (see §3.3).
- **An alternative attestation path for repositories that disallow squash-merge.** Out of scope; handled by the human through whatever native mechanism the repo supports.

---

## 7. Resume-Mode Notes

This artifact is being produced **after** the PR was authored and opened (#109), as a backfill of the design-philosophy content that the original authoring run did not capture in artifact form. The substance was preserved in the planning folder's hand-written README; this document distils that material into the canonical structure the workflow expects (Problem Statement, Classification, Solution Approach, Workflow Path, Trade-offs, Scope).

No new design philosophy is introduced here. The classification (`complex`) and path-gating decisions (`skip_optional_activities = true`, `skip_architecture_summary = false`) are derived from the existing scope as observed in PR #109 and the README content, not from a fresh classification exercise.

Downstream activities (`requirements-elicitation`, `research`, `codebase-comprehension`, `implementation-analysis`) are all skipped per the path decision above. The next activity that produces a substantive artifact is `strategic-review`, which will produce the architecture summary referenced in §4.
