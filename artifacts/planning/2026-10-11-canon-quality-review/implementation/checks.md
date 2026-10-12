# Checks

Evidence for the test plan on [#1297](https://github.com/m2ux/workflow-server/pull/1297). Each section states the procedure, the revisions it ran against, what it observed, and what it does not establish.

Corpus under test: `workflow/technique-vocabulary` at `65be29e4`, from `e70b44778f71d9d699f746f78a16b892531c82d3`. Engine: a detached `origin/main` worktree at `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e`, with `node_modules` linked to an installed checkout whose `package-lock.json` hash matches.

## Guard delta

**Procedure.** `WORKFLOWS_DIR=<corpus> npm run check:all` in the engine worktree, once at the branch point for the baseline and again after each commit. Per-guard violation counts extracted from the run and diffed against the baseline.

**Observed.** Ten guards fail at the branch point and are untouched debt: `activity-variables` 110, `fires-on-ids` 209, `gitnexus-tool-answers` 15, `routines` 20, `message-binding` 8, `resource-statement-home` 5, `harness-adapter-set` 4, `review-mode-gating` 2, `refs` 1, `tool-call-shape` 1. No commit on this branch introduced a guard failure. The single movement across the branch is `fires-on-ids` 209 to 207, from the two net removed entries. Counts and the run's conditions are in the [guard baseline](guard-baseline.md).

**Does not establish.** The guards parse definitions and resolve links; they do not read criterion prose. A clean run says the corpus still parses and every reference resolves, not that a rewritten criterion judges its subject correctly.

**Unmeasured by the registered hook.** `.project/main` is 195 commits behind `origin/main` with an empty `node_modules`, so the edit hook could not measure any edit in this work until its dependencies were linked, and it still runs guards at that stale revision. Every result above comes from the `origin/main` worktree instead.

## Recommendation evidence

**Procedure.** [verify_applied.py](verify_applied.py) reads the 95 reconciled candidates, resolves each retained one's scoped entries to their names at the reviewed revision, and requires at least one of them to differ from that revision in the current tree. A retired entry counts as evidence of its own recommendation.

**Observed.** The first run reported one unevidenced recommendation: AE-21, which commit `9ea3be34` named in its message and did not carry. `runtime-rules-only` was byte-identical to the reviewed revision. Applied at `65be29e4`; the check now reports `unevidenced=0` across all 93 retained recommendations.

**Does not establish.** The check proves an entry in scope changed, not that the change says what the recommendation prescribed. Fidelity of wording rests on the reconciled text in the recommendation files.

## Catalog numbering

**Procedure.** [renumber.py](renumber.py) assigns `AP-XX` by file order and repoints every citation, keying on the stable entry name rather than the old number. Duplicate and gap detection over the rendered headings; the `resource-anchors` guard resolves every relative `.md#anchor` link against a rendered heading.

**Observed.** 159 entries, numbered `AP-01` through `AP-159` with no duplicate and no gap. The script reported no unresolved anchor. 29 anchors in `schema-construct-inventory.md` and one in `reconcile-design-assumptions.md` were repointed. `resource-anchors` passes in the final run, as it does at the baseline.

**Does not establish.** Anchors resolving is not the same as each citation still naming the entry a reader needs; citations are by kebab name and none changed, which is the reason to expect that holds.

## Integration drift

**Procedure.** [drift.py](drift.py) compares the two canon homes between the reviewed revision and `origin/workflows`, discounting the `**Fires on:**` line the upstream index adds to every unit, and intersects the entries whose operative text moved with the entries this work rewrote.

**Observed.** Upstream carries 166 anti-patterns and 47 principles against this branch's 159 and 47. Operative text moved on eight anti-patterns and two principles; nine are entries this work also rewrote. The full finding, including the retired `decision` construct and the carve-outs a merge has to fold back, is in [integration drift](integration-drift.md).

**Does not establish.** This measures the two canon homes and the files citing them. It does not measure whether the 343 upstream commits changed definitions the rewritten criteria judge, and it does not predict how a merge resolves — only which entries both sides touched. The pull request is open in a conflicting state for that reason.
