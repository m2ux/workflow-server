# Guard baseline

The corpus guard suite at the branch point, captured before the first canon edit. Introduced failures are the difference from these counts; everything below is debt this work does not own.

## Run

| Field | Value |
| --- | --- |
| Command | `WORKFLOWS_DIR=<corpus> npm run check:all` |
| Engine checkout | `.project/main/.worktrees/canon-guards`, detached at `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e` |
| Corpus checkout | `.worktrees/workflow/technique-vocabulary`, `workflow/technique-vocabulary` at `e70b44778f71d9d699f746f78a16b892531c82d3` |
| Dependencies | `node_modules` linked to `.worktrees/engine-pin`; its `package-lock.json` hashes equal to the engine checkout's |
| Exit status | 1 |

`.project/main` is 195 commits behind `origin/main` and its `node_modules` is empty, so the registered edit hook cannot measure there. The guard worktree above replaces it for every check in this work.

## Failing guards

| Guard | Violations |
| --- | --- |
| activity-variables | 110 |
| fires-on-ids | 209 |
| gitnexus-tool-answers | 15 |
| harness-adapter-set | 4 |
| message-binding | 8 |
| refs | 1 |
| resource-statement-home | 5 |
| review-mode-gating | 2 |
| routines | 20 |
| tool-call-shape | 1 |

All other registered guards pass, including `resource-anchors`, `section-framing`, `citation-grain`, `duplicate-bodies` and `resource-statement-home`'s passing siblings. Those passes are the ones canon prose can break, so each post-edit run reads them first.

## Canon homes in the baseline

168 of the 209 `fires-on-ids` findings name `corpus/canon/resources/anti-patterns.md` or `corpus/canon/resources/design-principles.md`, each reporting that a unit carries no Fires-on line. That index is open initiative work and is not part of this change; an edited entry keeps whatever Fires-on line it already has.
