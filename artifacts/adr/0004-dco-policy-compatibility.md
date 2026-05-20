# ADR-0004: DCO Policy Compatibility — Human-Driven Squash-Merge Attestation

**Status:** Accepted
**Date:** 2026-05-20
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Driving policy:** DCO-Safe Agentic Coding Policy

---

## Context

The previous `work-package` workflow embedded three structural problems with respect to the Developer Certificate of Origin (DCO) regime.

1. **Agent-held attestation.** The `verify-commit-signatures` step in `12-submit-for-review` ran `gpg-resign-range`, which executed `git rebase --exec 'git commit --amend --no-edit -S'` and force-pushed the rewritten history. The GPG attestation on every feature-branch commit was therefore the AI agent's, not the human contributor's. DCO requires the contributor — the person who actually has the right to submit — to make their own attestation; having the agent stamp a signature on their behalf is the exact inversion of that requirement.
2. **Multiple acquiescence surfaces.** The workflow surfaced unsigned-commit prompts in three places — a preflight scan in `10-validate`, an `unsigned-commits-prompt` checkpoint and `resign-unsigned-pr-commits` step in `11-strategic-review`, and the resign step in `12-submit-for-review`. Each was a path where the human could click through to have the agent sign on their behalf, multiplying the surface where DCO intent could be subverted by routine clicks.
3. **Permanently unsigned engineering trail.** To run unattended, every engineering-branch artifact commit was forced to `--no-gpg-sign` by the `manage-git` skill. The combination — agent signs feature-branch commits, agent refuses to sign artifact commits — left an audit trail that captured neither the human's intent on the feature branch nor any contributor identity on the engineering branch.

GitHub's web-UI squash-merge button produces an unsigned merge commit, so simply "always squash-merge via the web UI" is not a solution either. The policy answer is to relocate attestation to a single, deliberate human action: a local squash-merge invoked with `git commit -s -S`, which produces a commit that is both DCO signed-off (`Signed-off-by:`) and GPG-signed in one step, with the human's identity. Per-commit signatures on the feature branch then stop being load-bearing — the squash commit is the auditable artefact, and the feature-branch history becomes a development trace rather than a chain of attestations.

## Decision

Relocate DCO attestation from agent-driven per-commit GPG signing to human-driven squash-merge `-s -S`, and reshape the work-package workflow around that single attestation point.

Four behavioural shifts implement the relocation:

1. **Detect the merge strategy up front.** `01-start-work-package` gains a `detect-merge-strategy` step that calls the GitHub REST API for `allow_squash_merge` and sets a new `squash_merge_available` boolean. The flag drives downstream UX: when squash-merge is available, the workflow steers the human toward the signed local squash flow; when it is not, the workflow declines to invent a substitute attestation path.
2. **Capture provenance during research and implementation.** `04-research` adds a `declare-context-scope` checkpoint that records `repo-only | web-retrieval | mixed`. `08-implement` adds a `provenance-log.md` artifact and a `log-provenance` step per task that appends one row per task (task ID, assistant, model, prompt class, context scope, description). The PR-description template's `## AI Assistance` section interpolates the same values so reviewers see the provenance summary without leaving the PR.
3. **Strengthen the per-block rationale confirmation.** `09-post-impl-review`'s `file-index-table` checkpoint now records the human's per-block rationale confirmation as a provenance attestation, and a `rationale-amendment` checkpoint (gated on a new `rationale_confirmed` boolean) lets the human correct any agent-written rationale paragraph before the diff goes to automated review. Corrections land in `manual-diff-review-report.md` as the human's own provenance statement.
4. **Gate PR submission on a human DCO sign-off.** `12-submit-for-review` adds a blocking `dco-sign-off` checkpoint with a 6-item certification (right to submit, understood the diff, clean provenance, can explain origin, tests run, willing to take responsibility). A non-blocking `merge-strategy-reminder` checkpoint walks the human through the local squash-merge-with-`-s -S` flow when `squash_merge_available` is true. The `verify-commit-signatures` step is removed.

The cleanup follows: `10-validate` drops the GPG preflight scan; `11-strategic-review` drops the `unsigned-commits-prompt` checkpoint and the `resign-unsigned-pr-commits` step; `13-complete` drops the `resign-artifact-commits` step; `15-manage-git` drops the `gpg-resign-range` protocol and the `--no-gpg-sign` mandate on artifact commits. A new `code-commits` protocol adds the `Co-authored-by:` trailer so GitHub renders both the human and the assistant in the commit byline (harness-aware: Claude Code injects automatically; other assistants must add explicitly).

The variable surface shrinks by three (`unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary` removed) and grows by three (`squash_merge_available`, `context_scope`, `rationale_confirmed`). A new `dco-provenance` skill (work-package skill 25) owns the provenance-log schema, attestation recording, and context-scope classification.

### Key design choices

| Choice | Decision | Alternatives considered |
|--------|----------|-------------------------|
| Attestation point | Single human squash-merge commit with `-s -S` | Per-commit human signing (impractical for long branches); always-via-web-UI squash (unsigned); agent re-signs with human's key (the current broken design); merge-commit instead of squash (loses single-commit auditability) |
| Detection strategy | GitHub API `allow_squash_merge` checked at start-of-work | Probe at submit time (too late to influence flow); leave to human (defeats UX gate); hard-code per repo (brittle) |
| Provenance log location | `08-implement/provenance-log.md` artifact, also surfaced in PR description | Inline per-task in `08-implement-record.md` only (not visible in PR); only in PR description (no canonical record); separate file under `.engineering/` outside the planning folder (splits artifacts) |
| Rationale-amendment gating | Explicit `rationale_confirmed` boolean, default false; checkpoint fires when false | Implicit gating on whether any rationale changed (ambiguous); always fire (annoying); never fire (no human gate) |
| DCO checkpoint shape | Single blocking checkpoint with 6-item certification | Six separate checkpoints (too granular); free-text confirmation (no structured record); silent gating on a config flag (no human attestation) |
| Merge-strategy reminder | Non-blocking, conditional on `squash_merge_available == true` | Always blocking (forces UX even when squash unavailable); always non-blocking (loses the discriminator); folded into the DCO checkpoint (overloads it) |
| Removal of per-commit signing | Full removal: `gpg-resign-range` protocol and the `--no-gpg-sign` mandate both gone | Keep as opt-in (preserves the surface that policy forbids); soft-deprecate (carries the dead code forward); replace with a warning instead of removing (no behavioural change) |
| New skill placement | `25-dco-provenance` as a dedicated work-package skill | Fold into `manage-git` (overloads it); fold into `review-strategy` (wrong responsibility); place in `meta/` (not workflow-specific) |
| `Co-authored-by:` policy | Mandate in commit protocol with harness-aware guidance | Leave to user (drift across harnesses); auto-inject server-side (out of scope, no commit path); only document, do not mandate (no enforcement surface) |

### Rationale

The design prioritises **human authority over a single, auditable attestation point** and **minimum agent involvement in cryptographic identity**. The agent's job is to record provenance and gate submission; it never holds, uses, or proxies the human's signing identity. The squash-merge `-s -S` flow gives every merged change exactly one commit on the target branch that is both DCO-signed-off and GPG-signed by the contributor — the audit primitive a DCO regime is built to produce.

Detection of `allow_squash_merge` up front means the workflow can refuse to invent a substitute attestation when the policy-prescribed path is unavailable, rather than silently degrading to an agent-signed posture. The non-blocking `merge-strategy-reminder` is paired with the blocking `dco-sign-off` so the human can review the merge plan without being forced through a modal sequence; the attestation itself remains a deliberate gate.

The provenance log is duplicated (artifact + PR description) by design: the artifact is the canonical record retained in `.engineering/`, and the PR-description section is the reviewer-visible projection. Both interpolate from the same values logged in `08-implement`.

## Consequences

### Positive

- DCO attestation is held by the human contributor, not the agent. There is exactly one signed, signed-off commit per merged work package on the target branch.
- The three acquiescence surfaces (preflight scan, unsigned-commits prompt, resign step) collapse to a single blocking human checkpoint with structured certification.
- Provenance is captured continuously during research and implementation, not reconstructed at PR time, and is visible both as a planning artifact and in the PR description.
- The engineering-branch audit trail stops being permanently unsigned: with `--no-gpg-sign` removed from the artifact-commit protocol, artifact commits inherit the user's normal signing configuration.
- The agent's surface area around GPG shrinks to zero — no resign protocol, no force-push for signing, no commit-amend rebase. The `gpg-resign-range` and `--no-gpg-sign` paths are gone, not soft-deprecated.
- The `Co-authored-by:` trailer makes both contributors (human and assistant) visible in GitHub's commit byline by default, with harness-aware guidance for assistants that do not inject it automatically.

### Negative

- **Squash-merge required.** The workflow's prescribed attestation flow only applies when `allow_squash_merge` is enabled on the repository. Repositories that disable squash-merge fall back to a degraded UX where the workflow surfaces the DCO checkpoint but cannot offer the local-squash flow. No automatic substitute is provided — by design, but operationally this is a constraint.
- **Human-in-the-loop at submit time.** The blocking `dco-sign-off` checkpoint means PR submission cannot be unattended. For workflows previously run headlessly through `12-submit-for-review`, the new gate is a hard interruption point.
- **Local-shell competence required.** The signed squash-merge flow assumes the human can run `git merge --squash` and `git commit -s -S` locally. Contributors who previously used the GitHub web-UI squash button must adopt the local flow to get a signed merge.
- **Variable-surface churn.** Three variables removed and three added (`squash_merge_available`, `context_scope`, `rationale_confirmed`); downstream tooling that read the removed variables must be updated.
- **Provenance-log discipline.** The `log-provenance` step runs per task in `08-implement`; if a task is recorded without a provenance entry, the audit story regresses silently. The schema validator catches missing references but cannot catch missing rows.

### Neutral

- The change is workflow-content only: no `src/`, no `schemas/`, no runtime server code is touched. The verification surface is the workflow TOON validator, the server typecheck (regression guard), and the existing 322-test vitest suite.
- The PR was authored before the work-package workflow itself was completed; verification ran in **resume mode**, where the planning artifacts are reverse-engineered from the actual diff. This is the model the workflow now supports for retrospective documentation of changes that pre-date the workflow.
- The new `dco-provenance` skill (work-package skill 25) joins an existing 24-skill set; the skill-inventory README counts were updated in T13.

## Related

- [PR #109](https://github.com/m2ux/workflow-server/pull/109) — `feat/dco-policy-compatibility` on `workflows` base, HEAD `2d93abc`
- [Work package README](https://github.com/m2ux/workflow-server/blob/engineering/.engineering/artifacts/planning/2026-04-23-dco-policy-compatibility/README.md)
- [Architecture summary](https://github.com/m2ux/workflow-server/blob/engineering/.engineering/artifacts/planning/2026-04-23-dco-policy-compatibility/11-architecture-summary.md)
- [Strategic review](https://github.com/m2ux/workflow-server/blob/engineering/.engineering/artifacts/planning/2026-04-23-dco-policy-compatibility/11-strategic-review-1.md)
- [Review analysis](https://github.com/m2ux/workflow-server/blob/engineering/.engineering/artifacts/planning/2026-04-23-dco-policy-compatibility/12-review-analysis.md)
- DCO-Safe Agentic Coding Policy (driving policy)
