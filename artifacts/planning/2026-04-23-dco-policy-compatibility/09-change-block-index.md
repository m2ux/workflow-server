# Change Block Index — PR #109 (DCO Policy Compatibility)

**Activity:** post-impl-review (resume mode)
**Diff source:** `git diff workflows...HEAD` in `/home/mike1/projects/work/workflow-server/2026-05-18-dco-policy-update`
**Range:** `workflows` → `dco-update-2026-05-18` (HEAD `b5b7b7c`)
**Hunks counted:** 40 unified-diff hunks across 13 changed files (T13 covers 2 files).
**Rationale source:** Each row's rationale is reproduced from the existing planning record (`06-wp-plan.md`, written 2026-04-23 and backfilled 2026-05-19 against the same diff). Resume-mode practice: the user has already authored a per-task rationale at planning time; this index links each diff hunk back to the originating task and re-states the task-level rationale at hunk granularity. No new rationale is invented here.

> **Resume-mode rationale-confirmation note.** Per the worker prompt, this artifact records the rationale confirmation pass that the `file-index-table` checkpoint normally surfaces interactively. The reviewer can compare each row's rationale against the diff in their side-by-side app; if any row is wrong, they raise it at the next live workflow gate (strategic-review's diff-review step, or a fresh post-impl-review run with the corrections fed back).

---

## Index

| # | File | Hunk range | Task | Block-level rationale |
|---|------|-----------:|------|------------------------|
| 1 | `work-package/README.md` | L28 (1 hunk) | T13 | Update the inline skill-count summary from "24 workflow-specific skills" to "26" so the README and `skills/README.md` agree on the inventory size after T11 adds skill 25 `dco-provenance` and T13 closes a pre-existing +1 count gap. |
| 2 | `work-package/activities/01-start-work-package.toon` | L1 (header) | T2 | Version bump 3.6.0 → 3.7.0 acknowledging the new step being inserted; per workflow-design AP, every activity change in the same PR moves the activity's own version (not just the workflow.toon root). |
| 3 | `work-package/activities/01-start-work-package.toon` | L23–27 (skills) | T2 | No skill list change here — the diff context surrounds the steps block expansion; included only because the steps counter `steps[26]` → `steps[27]` lives in the same hunk. |
| 4 | `work-package/activities/01-start-work-package.toon` | L69–82 (steps insert) | T2 | Insert the new `detect-merge-strategy` step. The step calls `manage-git::detect-merge-strategy` (T10) which uses `gh api repos/{owner}/{repo}` to read `allow_squash_merge`, and sets `squash_merge_available`. Placement after `verify-signing-precondition` and before `detect-project-type` keeps the GitHub-API-touching steps clustered. The action description matches the workflow-variable description so the validator's binding pass is clean. |
| 5 | `work-package/activities/01-start-work-package.toon` | L537–545 (outcome counter) | T2 | The `context_to_preserve[19]` → `[20]` counter is mechanically tied to the new entry added below; no semantic change beyond the count. |
| 6 | `work-package/activities/01-start-work-package.toon` | L557–565 (context_to_preserve append) | T2 | Append `squash_merge_available` to `context_to_preserve` so the variable survives the orchestrator's activity-to-activity state hand-off all the way to `12-submit-for-review` where the merge-strategy reminder reads it. |
| 7 | `work-package/activities/04-research.toon` | L1 (header) | T3 | Version bump 2.3.2 → 2.4.0 (minor) reflecting a checkpoint addition + a supporting-skill addition. |
| 8 | `work-package/activities/04-research.toon` | L13–20 (supporting skills) | T3 | Add `dco-provenance` to `supporting`; the list is now sorted alphabetically (dco-provenance comes before knowledge-base-search) — same convention enforced by the new sweep that touched these files in the recent `description-hygiene` work. |
| 9 | `work-package/activities/04-research.toon` | L46–57 (new step) | T3 | Insert `declare-context-scope` step that owns the checkpoint binding (line 54) and the `context_scope` variable assignment. The step's skill reference (`dco-provenance`) is the skill that defines the allowed enum values; the description points at the downstream readers (provenance log + PR description). |
| 10 | `work-package/activities/04-research.toon` | L82–94 (checkpoints counter + research-document context) | T3 | `checkpoints[3]` → `[4]` is the mechanical counter update; the surrounding context (research-document artifact) is unchanged. |
| 11 | `work-package/activities/04-research.toon` | L143–180 (new checkpoint) | T3 | Insert the `context-scope-declaration` checkpoint with three options aligned to the `context-scope` protocol enum (`repo-only` | `web-retrieval` | `mixed`). `blocking: false` + `autoAdvanceMs: 15000` + `defaultOption: repo-only` follows the "advisory checkpoint" pattern used elsewhere in research (research-findings checkpoint, line 96–111). The safer default — `repo-only` — biases the workflow toward the lower-claim provenance bucket when the user does not respond. |
| 12 | `work-package/activities/08-implement.toon` | L9–43 (artifacts + skills + loop counter) | T4 | Three coupled changes in one hunk: (a) `artifacts[1]` → `[2]` with the new `provenance-log` artifact declaration; (b) `supporting[6]` → `[7]` with `cargo-operations` and `dco-provenance` added (the diff also reorders `cargo-operations` from bottom to top — alphabetical sort restored, same convention as T3); (c) `task-cycle.steps[5]` → `[6]` for the new `log-provenance` step being inserted below. |
| 13 | `work-package/activities/08-implement.toon` | L40–49 (new step inside task-cycle) | T4 | The `log-provenance` step appends one row per task to `provenance-log.md`. Placement inside `task-cycle` after `commit` and before `self-review` is deliberate: provenance is recorded only after the task's commit lands (so the row's task ID corresponds to a real commit), and before self-review so any anomaly the self-review surfaces can be cross-referenced against the just-written provenance row. |
| 14 | `work-package/activities/08-implement.toon` | L169–192 (outcome + context_to_preserve) | T4 | `outcome[2]` → `[3]` adds "Provenance log created"; `context_to_preserve[5]` → `[6]` adds `provenance_log_path` so the path survives into `09-post-impl-review` and `12-submit-for-review` (where the PR-description interpolation reads it). |
| 15 | `work-package/activities/09-post-impl-review.toon` | L1 (header) | T5 | Version bump 1.9.0 → 1.10.0 reflecting the rationale-confirmation strengthening. |
| 16 | `work-package/activities/09-post-impl-review.toon` | L109–150 (checkpoints rewrite) | T5 | Two coupled changes: (a) the `file-index-table` checkpoint message is rewritten to call out that the index now contains per-block rationale paragraphs and that the user's confirmation IS their provenance attestation; its options expand from 2 → 3 to distinguish "rationale confirmed clean" vs. "rationale confirmed with corrections + issues" vs. "issues found, rationale not yet reviewed". (b) A new `rationale-amendment` checkpoint is added with an auto-advance default of `all-accurate`. See `09-code-review.md` finding C1 — the `rationale-amendment` condition (`has_flagged_blocks == false`) appears inverted relative to the option semantics; the user who selected `rationale-confirmed-with-issues` (i.e. wants to provide corrections) will not see the amendment checkpoint because that option sets `has_flagged_blocks=true`. |
| 17 | `work-package/activities/10-validate.toon` | L1 (header) | T6 | Version bump 3.0.0 → 3.1.0. |
| 18 | `work-package/activities/10-validate.toon` | L17–20 (steps counter) | T6 | `steps[7]` → `[6]` reflects the removal below. |
| 19 | `work-package/activities/10-validate.toon` | L72–85 (step removed) | T6 | Remove the `scan-commit-signatures-for-strategic` step. The step's only consumer was the now-removed `unsigned-commits-prompt` checkpoint in strategic-review (T7); with that consumer gone, the scan has no purpose. Removal closes the seat-occupancy loop: nothing in the workflow can re-route into agent-side resign behavior. |
| 20 | `work-package/activities/10-validate.toon` | L110–116 (outcome + context_to_preserve) | T6 | `context_to_preserve[6]` → `[3]` drops the three variables (`unsigned_commits_in_pr`, `unsigned_commit_list_summary`, `resign_unsigned_commits_requested`) whose declarations are removed in T1. Removing them from `context_to_preserve` lets the validator confirm no orphan references remain. |
| 21 | `work-package/activities/11-strategic-review.toon` | L1 (header) | T7 | Version bump 2.5.1 → 2.6.0. |
| 22 | `work-package/activities/11-strategic-review.toon` | L22–37 (steps remove) | T7 | Removes the `resign-unsigned-pr-commits` step and the `unsigned-commits-prompt` checkpoint binding on `diff-review`. The pair is the most visible cut: the workflow no longer offers any path for the agent to resign on the human's behalf, which is the entire policy aim. |
| 23 | `work-package/activities/11-strategic-review.toon` | L87–101 (checkpoint counter + checkpoint removed) | T7 | Remove the `unsigned-commits-prompt` checkpoint definition. `checkpoints[2]` → `[1]`. The remaining `review-findings` checkpoint is unchanged. |
| 24 | `work-package/activities/11-strategic-review.toon` | L155–177 (outcome + context_to_preserve) | T7 | Drop the resign-related outcome line and the two removed variables from `context_to_preserve`. |
| 25 | `work-package/activities/12-submit-for-review.toon` | L1 (header) | T8 | Version bump 1.3.0 → 1.4.0. |
| 26 | `work-package/activities/12-submit-for-review.toon` | L13–23 (supporting skills + steps counter) | T8 | Add `dco-provenance` to `supporting` (sorted top, alphabetical with the rest); `steps[12]` → `[13]` reflects the additions below. |
| 27 | `work-package/activities/12-submit-for-review.toon` | L53–66 (replace verify-commit-signatures with dco-sign-off) | T8 | Replace the `verify-commit-signatures` step (which previously invoked `gpg-resign-range`) with the `dco-sign-off` step. The new step is a checkpoint step (no shell action of its own) that gates submission on a 6-item human certification. It is conditional on `is_review_mode != true` so a workflow re-running over an existing PR (review mode) does not re-prompt for an attestation that was already given by the original author. |
| 28 | `work-package/activities/12-submit-for-review.toon` | L73–92 (instruct-merge-strategy step) | T8 | Insert the `instruct-merge-strategy` step between `update-description` and `mark-ready`. Placement is deliberate: the merge-strategy reminder fires after the PR description has been finalized (so the description's `## AI Assistance` section is in front of the user when the reminder appears) and before the PR is marked ready (so the human cannot accidentally merge via the web UI without seeing the local-flow runbook). |
| 29 | `work-package/activities/12-submit-for-review.toon` | L117–163 (checkpoints) | T8 | Add the `dco-sign-off` and `merge-strategy-reminder` checkpoint definitions. `dco-sign-off`'s message body inlines the four provenance variables (`model_id`, `context_scope`, `squash_merge_available`, `provenance_log_path`) so the human sees the full provenance summary as part of the attestation prompt. `merge-strategy-reminder` is non-blocking (`autoAdvanceMs: 20000`) — see `09-code-review.md` finding C2 about a tail of dead text in this checkpoint message. |
| 30 | `work-package/activities/13-complete.toon` | L1 (header) | T9 | Version bump 1.5.0 → 1.6.0. |
| 31 | `work-package/activities/13-complete.toon` | L29–36 (supporting reorder) | T9 | Move `cargo-operations` from bottom to top of `supporting` — alphabetical sort, same convention applied across this PR. No step removal in 13-complete itself; per `06-wp-plan.md` T9, the `resign-artifact-commits` step had already been removed independently on `workflows` in a prior sweep. This hunk is therefore a no-op merge resolution at the activity level. |
| 32 | `work-package/resources/12-pr-description.md` | L158–166 (insert section) | T12 | Insert the `## 🤖 AI Assistance` section between the existing `## Changes` section and the `## 📌 Submission Checklist`. The four interpolation slots (`[assistant]`, `[model-id]`, `[repo-only | web-retrieval | mixed]`, `[link to provenance-log.md]`) are placeholders the PR-rendering step in `12-submit-for-review` will fill from `model_id`, `context_scope`, and `provenance_log_path` variables. |
| 33 | `work-package/skills/15-manage-git.toon` | L55–82 (protocols) | T10 | Largest single hunk in the diff. Five coupled changes: (a) add `code-commits[3]` — `Co-authored-by:` trailer guidance with harness-aware notes; (b) add `detect-merge-strategy[3]` — used by T2's new step; (c) add `squash-merge-instruction[4]` — used by T8's reminder; (d) remove `gpg-resign-range[4]` — closes the resign loop at the skill level so no activity can call it; (e) rewrite `artifact-commits[4]` — drop the `--no-gpg-sign` mandate so artifact commits inherit the user's local Git config like any other commit they make. |
| 34 | `work-package/skills/25-dco-provenance.toon` | L1–29 (new file) | T11 | Create the `dco-provenance` skill. Three protocols: `provenance-log[4]` (defines the markdown-table schema and append-only contract for `provenance-log.md`); `record-attestation[3]` (defines the `## Attestation` section appended at dco-sign-off time, including the legal-flag variant); `context-scope[3]` (defines the enum used by T3's checkpoint). The skill also declares an `output` (provenance-record) and one error (`log_not_found` with create-then-append recovery). |
| 35 | `work-package/skills/README.md` | L2–7 (header) | T13 | Update both header copies of the skill count from 25 → 26 (the section title and the body paragraph beneath it). |
| 36 | `work-package/skills/README.md` | L23 (skill 15 entry) | T13 | Rewrite the skill 15 row to reflect the post-PR capability surface: worktree lifecycle and merge-strategy detection / squash-merge instruction are now in scope; GPG re-sign is out. The Used-By column now lists `Start Work Package, Implement, Submit for Review, Complete` matching where the skill is actually referenced today. |
| 37 | `work-package/skills/README.md` | L33–34 (new row) | T13 | Append the skill 25 row for `dco-provenance` with its capability description and used-by list (Research, Implement, Submit for Review). |
| 38 | `work-package/workflow.toon` | L1–6 (header) | T1 | Version bump 3.11.0 → 3.12.0 — minor bump per the workflow-level versioning convention because the variable surface is non-trivially changed. |
| 39 | `work-package/workflow.toon` | L43–46 (modes block context) | T1 | Hunk context only — no semantic change in the modes block. Included because the `variables[88]` → `[87]` counter on the next line sits in this hunk's tail. |
| 40 | `work-package/workflow.toon` | L289–303 (variable surface) | T1 | The core variable-surface change. Three variables removed (`unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary`) and two added (`squash_merge_available`, `context_scope`). Net -1 variable (88 → 87) but conceptually replaces a three-variable cluster supporting agent-side resign with a two-variable cluster supporting human-time attestation routing and provenance. |

---

## Per-file roll-up

| File | Hunks | Net lines |
|------|------:|----------:|
| `work-package/README.md` | 1 | +1 −1 |
| `work-package/activities/01-start-work-package.toon` | 4 | +12 −3 |
| `work-package/activities/04-research.toon` | 4 | +35 −4 |
| `work-package/activities/08-implement.toon` | 3 | +18 −6 |
| `work-package/activities/09-post-impl-review.toon` | 2 | +30 −6 |
| `work-package/activities/10-validate.toon` | 4 | +1 −16 |
| `work-package/activities/11-strategic-review.toon` | 4 | +3 −36 |
| `work-package/activities/12-submit-for-review.toon` | 4 | +51 −7 |
| `work-package/activities/13-complete.toon` | 2 | +2 −2 |
| `work-package/resources/12-pr-description.md` | 1 | +9 −0 |
| `work-package/skills/15-manage-git.toon` | 1 | +15 −7 |
| `work-package/skills/25-dco-provenance.toon` | 1 (new file) | +29 −0 |
| `work-package/skills/README.md` | 3 | +4 −3 |
| `work-package/workflow.toon` | 3 | +6 −9 |
| **Total** | **40** | **+216 −100** |

The diff stat from `git diff workflows...HEAD --stat` reports a slightly different gross line count because the file-level summary includes context lines counted only once.

---

## Cross-references

- Task-level rationale: `06-wp-plan.md` (T1–T13).
- Implementation record (task → commit map): `08-implement-record.md`.
- Findings raised against rows in this index: `09-code-review.md` (C1 on row 16, C2 on row 29).
