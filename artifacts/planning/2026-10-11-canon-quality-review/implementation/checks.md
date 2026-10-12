# Checks

Evidence for the test plan on [#1297](https://github.com/m2ux/workflow-server/pull/1297). Each section states the procedure, the revisions it ran against, what it observed, and what it does not establish.

Corpus under test: `workflow/technique-vocabulary` at `67c48725`, cut from `origin/workflows` at `d5e2ace11c66`. Engine: a detached `origin/main` worktree at `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e`, with `node_modules` linked to an installed checkout whose `package-lock.json` hash matches.

## Guard delta

**Procedure.** `WORKFLOWS_DIR=<corpus> npm run check:all` in the engine worktree, once against a detached worktree at `origin/workflows` for the baseline and once against this branch.

**Observed.** `origin/workflows` runs 60 guards, 60 pass, 0 fail, 0 unmeasured. This branch runs the same 60 and passes all of them, exit 0. There is no delta to attribute: the branch introduces no guard failure and leaves none behind.

**Does not establish.** The guards parse definitions and resolve links; they do not read criterion prose. A clean run says the corpus still parses and every reference resolves, not that a rewritten criterion judges its subject correctly.

**Superseded baseline.** An earlier run of this work measured against `e70b4477`, where ten guards failed as standing debt. That debt is absent from `origin/workflows`, which is the comparison that counts. The earlier numbers in [guard baseline](guard-baseline.md) describe the superseded base and are kept as the record of what was measured at the time.

**Unmeasured by the registered hook.** `.project/main` is 195 commits behind `origin/main` with an empty `node_modules`, so the edit hook could not measure any edit in this work until its dependencies were linked, and it still runs guards at that stale revision. Mid-rebase it also miscomputes the branch point and reports a pre-existing `refs` failure as introduced. Every result above comes from the `origin/main` worktree instead.

## Recommendation evidence

**Procedure.** [verify_applied.py](verify_applied.py) reads the 95 reconciled candidates and resolves each retained one's scoped entries to their names at the reviewed revision, since the scope ids address that revision. It then requires at least one of those entries to differ between `origin/workflows` and this branch. A retired entry counts as evidence of its own recommendation.

**Observed.** `unevidenced=0` across all 93 retained recommendations, measured against `origin/workflows`.

An earlier run against the superseded base reported one unevidenced recommendation: AE-21, which a commit named in its message and did not carry. It is applied, and the check is what found it.

**Does not establish.** The check proves an entry in scope changed, not that the change says what the recommendation prescribed. Fidelity of wording rests on the reconciled text in the recommendation files.

## Catalog numbering

**Procedure.** [renumber.py](renumber.py) assigns `AP-XX` by file order, keying on the stable entry name rather than the old number. Duplicate and gap detection over the rendered headings; the `resource-anchors` guard resolves every relative `.md#anchor` link against a rendered heading.

**Observed.** 164 entries, numbered `AP-01` through `AP-164` with no duplicate and no gap: upstream's 166, less the three retired, plus `validate-committed-bytes`. The script reported no unresolved anchor and `resource-anchors` passes.

Citing files needed no edit. Upstream had already moved `schema-construct-inventory.md` and `reconcile-design-assumptions.md` off `#ap-NN-name` anchors onto bare kebab names, so renumbering carries no citation cost and this change touches two files rather than four.

**Does not establish.** Anchors resolving is not the same as each citation still naming the entry a reader needs; citations are by kebab name and none changed, which is the reason to expect that holds.

## Branch current with its target

**Procedure.** `git rev-list --left-right --count origin/workflows...HEAD`, and a search of both canon homes for the constructs upstream has retired.

**Observed.** 0 behind, 9 ahead. No occurrence of the activity-level `decision` construct, and none of the three retired entry names, remains in the corpus.

An earlier state of this branch failed this check: it was 343 commits behind, carried five sentences naming the retired `decision` construct, and did not merge cleanly. [Integration drift](integration-drift.md) records what that measured and how each item was settled.

**Does not establish.** Being current with `origin/workflows` at `d5e2ace11c66` is a fact about that revision. It does not establish that the rewritten criteria have been re-applied to the definitions they judge, which remains the review's own stated limit.
