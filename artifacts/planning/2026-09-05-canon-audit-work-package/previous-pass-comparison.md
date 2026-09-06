# Why the previous pass did not report these

Attribution of each finding in [findings-register.md](./findings-register.md) against PR #617, merged the same day at `75777ca2453d788acf52d8ab69778c9491686436` from branch point `677ca0445cfb1283d4b103d7697f29ce393c8b74`. That merge touched 42 `work-package` files across three commits: `efcc3a97`, `849f6fde`, `c379f335`.

That pass left no findings register and no coverage ledger — no planning folder matching `*canon*` exists — so its scope is reconstructed here from the merge diff and the commit bodies.

## Three causes

| Cause | Findings |
|---|---|
| Arrived with PR #617 — the pass introduced them | C1, 10, and the `rationale-confirmed` element of 3 |
| Not run by PR #617 | C2 |
| In files PR #617 never opened | 2, 3 (remainder), 4, 5, 8, 9 |
| In files PR #617 edited, and missed there | 1, 6, 7, 11 |

## The walk PR #617 did not run

The strongest single answer to "why were these not reported" is that PR #617 shipped a red option-coverage walk. Both of its tests fail at HEAD.

`efcc3a97` consolidated the assumption-decision gate onto the shared fragment, and its body records the addition: *"It takes the fragment, which gains the correction option the copy had."* The diff confirms it — `+ - id: correct-assumption` in `work-package/workflow.yaml`. That new option is unreachable at the `research` bind site (`activities/04-research.yaml:224-226`), which the walk detects and `tests/e2e/option-coverage.json` gives no reason for. Finding C1.

The stamp at `tests/e2e/__snapshots__/corpus-sha.json` still holds `69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6` against a checkout of `75777ca2453d788acf52d8ab69778c9491686436` — finding C2, and the same sha the `binding-fidelity` triage ledger carries. The canon's after-merge obligation names this: a definition change owes an adoption commit moving the pointer, the walk baseline, the stamp and every settled triage entry together.

The walk takes roughly 25 minutes and `npm run test:ci` skips it, which is how a change that reduces coverage passes every other check. This audit's own wrapper reported exit 0 for it — the compound's last command was an `echo`, and the walk's real exit was 1. Reading the check's exit before anything filters it is what separated a clean-looking result from two Criticals.

## Arrived with PR #617

`activities/10-post-impl-review.yaml` — the `file-index-table` checkpoint at the branch point:

```yaml
message: "Change-block index: {change_block_index}, Block titles link to file:line. Review the diff … (recorded in the [manual diff review report]({code_review_report})). …"
options:
  - id: rationale-confirmed
  - id: rationale-confirmed-with-issues
  - id: has-issues
```

and at HEAD:

```yaml
message: "Change-block index, its block titles linking to file:line: {change_block_index}"
options:
  - id: no-flagged-blocks
  - id: flagged-blocks
```

`efcc3a97` split one overloaded gate into two — a correct `atomic-checkpoints` fix, and its body says so. Two defects followed the split:

- The `[label]({path})` link was dropped and a declared path is now interpolated bare — finding 10.
- `rationale-confirmed` ceased to exist while `REVIEW-MODE.md:149` still names it — part of finding 3. `stale-restatement-after-change` fired on the commit that introduced it; its own test is occurrence count against the tree, not against the change's file list, and that sweep was not run.

## In files PR #617 never opened

Not in the 42-file diff: `REVIEW-MODE.md`, `techniques/README.md`, `resources/readme-deprecated-notice.md`, `techniques/create-issue.md`, `techniques/manage-artifacts/TECHNIQUE.md`, `activities/README.md`. Their most recent touches predate the branch point by many commits.

The entry did fire during that pass. `c379f335`'s body reads: *"A per-activity override table encoded review-mode when-gating and exit re-routing, and a prose inventory listed the six gates a review run pauses at, neither generated from the bind sites that declare them."* That is `bind-site-is-orchestration-truth`, applied to `README.md` alone, while `REVIEW-MODE.md` kept its per-activity override table (finding 3) and `techniques/README.md` kept its group inventory (finding 5). The entry was found and fixed at one site rather than swept across the target.

## In files PR #617 edited, and missed there

- `activities/11-validate.yaml` — the pass changed variable descriptions and deleted a duplicate `triage-reported-failures` step. It edited the `writes` block directly above `validation_results` without reaching the path-conditional read (finding 1). Its own body records catching a neighbouring shape — *"An action step validated a target named branch, which no activity or workflow variable declares, so the check could never evaluate"* — so the class was in view; the gate-path variant was not.
- `README.md` — rewritten by `c379f335`, yet the Activation paragraph and the review-mode flow line came through with zero diff lines. Findings 6 and 7 survived the commit whose subject is *"Orient the work-package README rather than transcribe its YAML."*
- `activities/12-strategic-review.yaml` — edited, with the unresolvable `canonical_home_map` bind untouched (finding 2).
- `activities/01-start-work-package.yaml` and `techniques/project-type-detection.md` — both edited, with the undeclared value set untouched (finding 11).

## The structural lesson

The pass audited a diff, not the target. Every finding in the second cause sits in a file that was in scope as a definition file of `work-package` and out of scope as a changed path. The canon's forbidden scopes name this directly: surface files are the whole target, touched files are discovered by the diff, and Detect is never bounded by hunks.

The first cause is the sharper one. A remediation is subject to the criteria it was made under, and a fix that leaves a new finding behind has moved the defect rather than closed it. Both defects here are entries the same pass was already applying elsewhere.
