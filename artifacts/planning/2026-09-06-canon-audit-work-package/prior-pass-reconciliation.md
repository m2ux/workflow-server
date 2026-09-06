# Reconciliation against the 2026-09-05 pass

The [previous register](../2026-09-05-canon-audit-work-package/findings-register.md) audited `work-package` at `75777ca2453d788acf52d8ab69778c9491686436` and left 13 open findings. Nineteen commits across PRs #620, #622 and #623 then landed, touching 63 of the target's files, and this pass measures the result at `c1d07a291510eb13d9ec6e49c73a5aed55b3c538`.

## Disposition of the 13 prior findings

| Prior ID | Entry | Now | Evidence |
|---|---|---|---|
| C1 | guard failure — `option-coverage` (`correct-assumption` unreachable at the `research` bind) | **closed** by PR #621, then inverted | #621 placed the option in the exemption group whose reason covers it. Corpus PRs #622 and #623 then made it reachable, so the ratchet now fires the other way: five work-package entries are covered and must leave the list. That is an adoption move, not a corpus defect |
| C2 | guard failure — `option-coverage` stamp | **not a defect at the pinned corpus** | The stamp names `69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6`, which is the corpus `main` pins. Both this pass and the prior one read it against the shared checkout's `workflows` branch, 35 commits ahead. In a provisioned worktree the stamp test passes |
| 1 | `unproduced-value-read` — `validation_results` readers off the producer's path | **closed** by `a62b78a9` | `activities/11-validate.yaml` now gates `document-failures` on `is_review_mode == true && project_type == 'rust-substrate' && run_local_validation == true`, and `fix-revalidate-cycle.continueWhile` is an `and` including `project_type == 'rust-substrate'`. Both readers now share their producer's gate |
| 2 | `operative-criteria-need-a-home` — canonical-home map with no resource | **closed** by `adf96e09` | `resources/canonical-home-map.md` exists and carries its own index row; `activities/12-strategic-review.yaml` binds `canonical_home_map: work-package/canonical-home-map`, which resolves |
| 3 | `bind-site-is-orchestration-truth` — `REVIEW-MODE.md` checkpoint inventory | **closed** by `4a3baa18` and `b2954932` | The per-activity inventory and its three phantom construct names (`analysis-confirmed`, `switch-model-*`, `rationale-confirmed`) are gone. The file now says "Which constructs each activity gates is declared in that activity's own `activities/NN-<id>.yaml`" |
| 4 | `cited-home-owns-claim` — `techniques/README.md` attributing a technique-to-activity table to the workflow README | **closed** by `0b1c1d85` | The citation is gone from the file |
| 5 | `bind-site-is-orchestration-truth` — "Technique groups by area" table naming eight absent groups | **closed by substitution** — see below | The table is gone; the `## Layout` section that replaced it is finding 12 of this register |
| 6 | `stale-restatement-after-change` — `README.md` describing an ungated review-mode confirm | **closed** | The README now states review mode as ordinary state and points at `REVIEW-MODE.md`, which describes the derive-first path and its two gap gates accurately |
| 7 | `bind-site-is-orchestration-truth` — review-mode flow omitting `codebase-comprehension` | **closed** by `18fd1938` | Both diagrams are drawn from the binds and carry `codebase-comprehension` |
| 8 | `avoidance-voice-in-definitions` — `resources/readme-deprecated-notice.md` | **closed** by deletion | The file and its index row are gone |
| 9 | `technique-stage-agnostic` — `create-issue.md` naming the `platform-selection` and `jira-project-selection` gates | **closed by substitution** — see below | The gate names are gone; the sentence that replaced one of them is finding 17 of this register |
| 10 | `link-named-artifacts` — bare `{change_block_index}` path in a checkpoint message | **closed** | `activities/10-post-impl-review.yaml:91` now reads `"[Change-block index]({change_block_index}), its block titles linking to file:line."` |
| 11 | `value-set-in-prose` — `project_type` with no declared `values` | **closed** by `288baad4` | `activities/01-start-work-package.yaml` declares `values: [rust-substrate, other]` |

Eleven of thirteen closed outright. The two guard failures are both properties of the corpus branch running ahead of the pointer `main` pins, which a provisioned worktree settles: at the pinned corpus all 36 guards and both walk tests pass. Neither pass established which tree it was measuring before recording a Critical, and this one repeated the error before catching it.

## Two fixes that traded one entry for another

The canon's own constraint on remediation is that a fix is subject to the criteria it was made under: replacement text is walked by the entry that prescribed it and by every unit its file kind routes to, and an application that leaves new findings behind has moved the defect rather than closed it. Two of the fixes above did that.

**Prior finding 5 → finding 12.** The old `techniques/README.md` carried a "Technique groups by area" table that named eight local groups the folder does not hold. Deleting it was right: folder contents are the membership. What replaced it teaches the reader how membership is derived —

> A capability with one operation is a standalone `<op>.md` in this folder. A capability with several is a directory holding a group `TECHNIQUE.md` for the shared contract and one file per operation, which an activity binds as `<group>::<op>`. The directory listing is the membership of both sets.

— which is a standalone-versus-group placement lecture plus folder-implied membership, both of which `platform-semantics-in-capability` names, and both of which `meta/resources/workflow-canonical.md` and the schema construct inventory already own. The stale list became a correct restatement of somebody else's contract. The remedy the entry prescribes is deletion, not correction.

**Prior finding 9 → finding 17.** The old `create-issue.md` said `{issue_platform}` "carries the choice made at the `platform-selection` gate, which the activity presents before this technique runs" — a technique naming a checkpoint and its position. It now says:

> `{issue_platform}` arrives bound. Use it as given; do not re-ask.

The gate is gone, and with it the stage coupling. What remains tells the agent how the input is satisfied, which is the bind home's contract, and adds a session prohibition the technique cannot enforce. The declared input is already the whole contract; the sentence is the residue of the one that was removed.

Neither is a criticism of the remediation's direction. Both are the ordinary cost of rewriting rather than deleting, and both are one-line deletions now.

## What this pass found that the prior one did not

Seven of this register's findings sit in files the prior pass listed as `swept` rather than read whole, which is where its own coverage section said its walk stopped: "The YAML and README layer is fully covered; the technique and resource bodies are not." Findings 3, 4, 5, 8, 9, 16 and 17 are all in technique bodies.

One finding is in a file the prior pass did read, and neither pass caught it until this one read the operation it binds. Finding 7 — `activities/08-implement.yaml` binding `manage-git::artifact-commits` for the per-task source commit — is visible only by opening `artifact-commits.md` and reading what it commits and where. The activity YAML alone shows a plausible bind to a plausibly-named op. The claim that a bind is wrong is a claim about the operation, and the file holding the bind does not answer it.

Two findings sit in activities neither pass's change surface reached: `13-submit-for-review.yaml` was untouched by the remediation and holds findings 14 and 20.

## The walk against the fix branch

The prior pass ran the walk to completion in 1,466 seconds against the corpus branch and took both of its failures as Criticals. This pass ran it twice.

**Against the corpus branch at `c1d07a291510eb13d9ec6e49c73a5aed55b3c538`** — 1,579 seconds, exit 1, both tests failing: the stamp names a different corpus, and five work-package options are covered while still listed unreachable. Both are the pointer gap, not defects.

**Against the fix branch in a provisioned worktree** — 1,677 seconds, exit 1, both tests failing, and the failures are the measurement the adoption commit needs. The stamp names the pinned corpus, as before. The option check reports seven entries the exemption list holds for constructs the fix branch retired: the two `push-confirmation` options and the two `private-remote-confirmation` options, both folded into one `private-push-confirmation` gate; the two `build-artifact-handoff` options and the `build-artifact-check=regen-needed` option, folded into one three-option gate.

That check runs before the covered-but-listed check, so this run never reached the five the earlier one named. Both groups go, and a third walk over the corrected list is what says whether the four option keys this change introduces need reasons of their own. The [register's adoption section](./findings-register.md#adoption) carries all twelve keys.

The lesson generalises past this change: an exemption list is measured against one corpus, and every entry in it is a claim about a construct that may since have been renamed, retired or made reachable. Three walks against three trees produced three different lists, and none of them could be derived from reading the definitions.

## A note on reading a wrapper's exit

The prior pass recorded that its walk wrapper reported exit 0 because the compound's last command was an `echo`, and that reading the check's exit before anything filters it is what separated a clean-looking result from two findings. This pass hit the same shape twice — once on the guard suite, once on the walk — and both times the real exit was in a `WALK_EXIT`-style capture rather than the wrapper's. The lesson holds and is worth keeping where it already sits.
