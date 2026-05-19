# Structural Findings — PR #109 (DCO Policy Compatibility)

**Activity:** post-impl-review (resume mode, structural-analysis-inline step)
**Mode:** Single-pass L12 structural lens applied inline. The workflow declares `complexity = complex`, which would normally route to `dispatch-prism` for a full 3-pass pipeline. Per the worker prompt, dispatching a sub-workflow during a resume-mode review of an already-final diff is impractical; instead this artifact is a single-pass structural read, with the scope choice documented for strategic-review to revisit if needed.
**Reviewer:** post-impl-review worker (single-pass, resume mode).

> **Scope choice and its implications.** A full prism pass would produce three artifacts (structural, adversarial, synthesis) with isolation between passes. A single-pass inline read is one author writing all three voices, so the adversarial voice is necessarily weaker. The L12 lens (conservation law + meta-law + classified bug table) is applied directly to the changed-files surface below; the adversarial reading is folded into the bug table's "Counter-arguments" column.

---

## L12 lens summary

The L12 structural lens asks three questions of a change set:

1. **What is conserved?** What invariant does the change preserve across the system surface it touches?
2. **What is the meta-law?** What more-general principle does the conserved quantity instantiate?
3. **What can break it?** Classified bug table — places where the conservation law could be locally violated, ranked.

### Conservation law (this PR)

> **"At every workflow surface where the agent could substitute itself for the human as the source of an attestation, the workflow now either delegates the attestation back to the human (gated by an explicit checkpoint) or removes the surface entirely. The agent never holds the pen on the human's behalf for any signed claim about provenance or commit authorship."**

The diff is the conservation law applied 13 ways:

- **Delegated to human (4 sites):** `dco-sign-off` checkpoint (T8), `rationale-amendment` checkpoint (T5), `context-scope-declaration` checkpoint (T3), `merge-strategy-reminder` advisory (T8). All four are explicit user-visible gates whose effects fire only on user selection.
- **Removed entirely (5 sites):** `scan-commit-signatures-for-strategic` in validate (T6), `unsigned-commits-prompt` checkpoint + `resign-unsigned-pr-commits` step in strategic-review (T7), `verify-commit-signatures` step in submit-for-review (T8), `resign-artifact-commits` in complete (T9), `gpg-resign-range` protocol in manage-git (T10), `--no-gpg-sign` mandate on artifact-commits (T10).
- **Replaced with structured capture, not agent-mediated attestation (3 sites):** `log-provenance` step + `provenance-log.md` artifact (T4), `dco-provenance` skill (T11), `## AI Assistance` section in PR description (T12).
- **Routing infrastructure to support the new model (1 site):** `detect-merge-strategy` step + `squash_merge_available` variable (T2 / T1).

Every block in the diff lands on one of those four buckets. The bucket assignment is the conservation law.

### Meta-law

> **"Attestation belongs to the entity that can be held responsible for the claim. The workflow's role is to (a) put the right facts in front of that entity, (b) make the act of attestation explicit and deliberate, and (c) preserve a durable record of the act — but not to act as the attester."**

The meta-law is broader than DCO. The same shape would govern security-policy attestations, license-grant attestations, code-of-conduct affirmations, etc. The DCO posture is one instance.

This connects neatly to the workflow-design retrospective work that recently landed AP-36/38/40 on description-hygiene: those APs prohibit role-rules embedded in declarative content for the same family of reason — the workflow document declares what is, it does not perform the human's role. The DCO refactor is the operational counterpart to the documentation-hygiene refactor.

### Classified bug table

Places the conservation law could be locally violated, ranked by gravity. Counter-arguments to each potential violation are folded in.

| # | Where | What could break the law | Counter-argument | Verdict |
|---|-------|--------------------------|------------------|---------|
| B1 | `09-post-impl-review`'s `file-index-table` checkpoint with the `rationale-confirmed-with-issues` option | The option's user-stated intent is "provide corrections to rationale paragraphs". The workflow today provides no follow-up checkpoint to land those corrections, because the conditional `rationale-amendment` checkpoint gates on `has_flagged_blocks == false` — the opposite state. So the user's attestation pen IS available, but the workflow forgets to hand them the paper. | The downstream strategic-review activity's `diff-review` step gives the user another bite; the corrections are not permanently lost. Auto-advance on `rationale-amendment` keeps the workflow moving for the clean case. | **Local violation of the conservation law's "make the act explicit" clause.** Tracked in `09-code-review.md` C1 (Minor). |
| B2 | `12-submit-for-review`'s `dco-sign-off` checkpoint when `is_review_mode == true` | The step is conditional on `is_review_mode != true`; in review mode the attestation is skipped. Could the workflow merge a PR in review mode without ever capturing an attestation? | Review mode runs against an existing PR — the original author already attested when they opened it. Re-prompting the reviewer for a DCO attestation on someone else's PR would be wrong (the reviewer is not the author). The skip is semantically correct. | **Not a violation.** Conservation law is intact: the attestation already exists for the artifact under review. |
| B3 | `15-manage-git`'s `artifact-commits` protocol after dropping `--no-gpg-sign` | Artifact commits now inherit the user's local Git config. If the user has `commit.gpgsign=true` and a misconfigured GPG agent, artifact commits will hang on pinentry — degrading the workflow from "runs unattended" to "halts mid-flow on every artifact commit". | The `verify-signing-precondition` step in `01-start-work-package` (line 65–71) validates that signing is configured before any other work. A misconfigured GPG agent would surface at that gate. Additionally, the artifact-commits protocol's prose explicitly notes the new posture ("Whether commits are GPG-signed is governed by the user's local git config — the workflow does not impose --no-gpg-sign or --gpg-sign overrides") so the user knows what to expect. | **Not a violation, with one caveat:** the verify-signing-precondition is in the *component* repo, not the *parent engineering* repo. The user's signing config could differ between the two if they have repo-local overrides. The hazard is small (repo-local signing config is rare) and the failure mode is loud (pinentry hang), so the bookkeeping is adequate. |
| B4 | The `code-commits` protocol on `15-manage-git` | The protocol says assistants other than Claude Code "must add [Co-authored-by] explicitly". If a different assistant fails to do so, the GitHub commit byline won't show co-authorship. | Co-authorship in the byline is a visibility feature, not an attestation. Missing it does not weaken the DCO position — the human is still the author. The protocol bullet is advisory hygiene, not load-bearing. | **Not a violation.** The conservation law concerns attestation, not byline rendering. Hygiene gap, not a structural one. |
| B5 | `04-research`'s `context-scope-declaration` autoAdvance default = `repo-only` | If the user blinks past the 15-second timer, the workflow records `context_scope = repo-only` even when external sources were used. The provenance log then carries an inaccurate value, and the PR description's `## AI Assistance` section reads `Context scope: repo-only` for a web-retrieval run. | The user has 15 seconds to override; the checkpoint is non-blocking by design ("research finished, default is the most-common case"). The downstream `rationale-amendment` checkpoint (when properly fired — see B1) lets the user correct the provenance record before submit. The DCO sign-off checkpoint at submit-time displays `context_scope` inline, giving a final chance to notice the value before attesting. | **Recoverable, not a violation.** Three downstream checkpoints display the value; the user has multiple chances to notice and correct. Sound design for "default-to-safer-claim". |
| B6 | The new `dco-provenance` skill's `record-attestation` protocol | The protocol says "Do not record attestation until the human explicitly selects the certify or flag-legal option at the dco-sign-off checkpoint" — but the actual write to `provenance-log.md` is the workflow's responsibility (the human is not editing the file). Could the workflow record an attestation for a human who later disputes the record? | The attestation is the human's selection of one of two options. The workflow's write is the durable record of that selection, not an independent claim. This is the same posture as the existing `assumptions-log.md` artifact — the agent writes prose summarizing the human's choice, and the durable record is signed by the choice being made on a tracked checkpoint. | **Not a violation.** Workflow as scribe is different from workflow as attester. The attestation is the human's act; the file is the record of the act. |
| B7 | The `merge-strategy-reminder` message tail (see `09-code-review.md` C2) | The "if not available" branch of the message is dead text — when `squash_merge_available == false`, the checkpoint does not fire and the user sees no merge-strategy guidance at all. The user could merge via the web UI without an unsigned-fallback runbook. | The web UI squash merge produces an unsigned commit but a DCO-compliant `Signed-off-by` if the trailer is present in the merge message (which GitHub renders from the squashed commit messages). For repos with `allow_squash_merge == false`, the merge is a rebase/merge-commit path that preserves per-commit signatures of the human's actual commits. So the absence of guidance is not catastrophic — the failure mode is the user not knowing the merge-time signing implications, not a workflow-side wrong action. | **Local UX gap, not a conservation violation.** Tracked in `09-code-review.md` C2 (Nit). |

No critical or major structural violations of the conservation law identified.

---

## Adversarial pass (single-author voice — caveat applies)

Strongest adversarial reading: **"The workflow has retreated from any commit-signing responsibility, but DCO compliance still requires that **some** entity certify the contribution. By removing the workflow's role entirely, has the PR over-corrected — does the workflow now produce so little ceremony that a careless human can submit a contribution without ever having read the DCO?"**

Counter: the `dco-sign-off` checkpoint is blocking and surfaces a 6-item certification list inline. The user cannot proceed without explicitly selecting `certify` or `flag-legal`; they cannot dismiss or auto-advance through it (no `defaultOption`, no `autoAdvanceMs`). Selecting `certify` requires reading 6 items and making an affirmative choice. The ceremony is small but real. By contrast, the previous workflow's `verify-commit-signatures` step did the resign without any user-facing certification at all — the only DCO ceremony was implicit in the act of opening the PR. The new posture has **more** explicit human ceremony, not less.

Strongest residual concern: **the language of the `dco-sign-off` checkpoint is generic, not project-specific.** A real-world OSS project may have a specific DCO format it requires (e.g., the Linux DCO at developercertificate.org). The checkpoint asks for a 6-item certification of substance but does not reproduce the actual DCO text. A reviewer could read the 6 items, certify, and not realize the project's CI also runs a `git interpret-trailers --parse` check requiring an exact `Signed-off-by:` trailer in the commit message — the runbook bullet in `15-manage-git`'s `squash-merge-instruction[4]` covers this (`git commit -s -S`), but the certification text itself doesn't tie back to a specific DCO document.

**Treatment:** Informational. Not promoted to a finding because the policy intent is broader than any single DCO text (the policy abstracts DCO + license + provenance + responsibility into one attestation gate). Tightening to a specific DCO would constrain the workflow to one project's posture. The existing posture is correct for a workflow that wants to be repo-agnostic. A specific project could fork the checkpoint message; the structure supports that.

---

## Synthesis

The PR is a structurally clean refactor. The conservation law holds across all 13 tasks. The two local violations identified (B1, B7) are both UX-tier — the conservation law's "delegate to human" clause has the right shape, but the workflow's choreography around when and how to receive the human's input has two rough edges. Both surface as code-review findings (`09-code-review.md` C1 Minor, C2 Nit) rather than structural blockers.

The variable-surface arithmetic (88 → 87, three out + two in) is a quiet structural improvement: the three removed variables (`unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary`) were all internal plumbing for the resign infrastructure — pure cost. The two added (`squash_merge_available`, `context_scope`) are externally meaningful — they are read by the PR-description template and the merge-strategy reminder. The replacement therefore trades opaque plumbing for visible state.

The new `dco-provenance` skill (T11) is the right factoring: pulling provenance concerns into a named skill rather than embedding them in 4–5 activities. The skill is small (3 protocols, 29 lines), self-contained, and used by exactly the three activities that need it (research, implement, submit). Cohesion is high; coupling is to the variable surface only, which is the appropriate seam.

The `code-commits` protocol on `15-manage-git` is the one place where the PR could have leaked agent-as-attester behavior back in (an automatic `Co-authored-by:` injection could be read as the agent "claiming" co-authorship). The protocol's harness-aware wording — Claude Code injects automatically, others must add explicitly — defuses that read: the injection is a render-time feature of the harness, not a workflow-mediated attestation. Good structural call.

---

## Variable assignments for `classify-and-route-findings`

This artifact does not directly set `needs_code_fixes` or `needs_test_improvements`; those are set by `09-code-review.md` and `09-test-suite-review.md`. The structural pass produced no Critical or Major findings; the two Minor / Nit findings it surfaced are already tracked in the code review.

- `has_critical_blocker` = **false**
- `prism_artifact_paths` = `["09-structural-findings.md"]` (single-pass inline; no separate adversarial/synthesis artifacts produced under the scope choice noted at top)
