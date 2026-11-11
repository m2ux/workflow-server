# I17 E02 Delta Review — Review Fixes A–H

> Review record · Created 2026-11-11

## Executive Summary

The fixes for findings A–H on the epic base, `bdfb52b0..c55646f4`, were re-reviewed over their change surface only: the diff and the direct callers of each changed function. The first pass found three regressions against `bdfb52b0`, each corrected with an observing test in `c55646f4..2088c7a3`. A second pass over the corrective commits found nothing. Nothing outside the change surface was reviewed or changed.

## Fixes Reviewed

| Finding | Commit | Change |
| --- | --- | --- |
| A | [fdd105f7](https://github.com/m2ux/workflow-server/commit/fdd105f7a) | `deps.read_components` reads each code span or path word as an entry, strips trailing punctuation and skips prose; the contention fixture declares bare paths again. |
| B, G | [903a1e65](https://github.com/m2ux/workflow-server/commit/903a1e651) | `requirements()` drops a same-file section edge only where the target's read span holds the requiring line; a fragment-only destination resolves to `path.resolve()`. |
| F | [42b934c1](https://github.com/m2ux/workflow-server/commit/42b934c1d) | `BEFORE_USE` ends the requirement at `first` as a whole word. |
| C, H | [64162e3d](https://github.com/m2ux/workflow-server/commit/64162e3dc) | Advance step 6 stops only on a decision held under an allowance; a decision put to the user continues with the answer. The walker reads whole sentences and asserts no `loop`. |
| D | [e2387cbd](https://github.com/m2ux/workflow-server/commit/e2387cbdb) | `epic_check` reads the epic title through `board.tags`; the dead task-title test is gone. |
| E, H | [c55646f4](https://github.com/m2ux/workflow-server/commit/c55646f44) | `check()` validates the base branch and passes `kinds.Tips` to the general rule and to `Kind.review`; the tips test is behavioural on both paths. |

## Pass 1 — `bdfb52b0..c55646f4`

### Change Surface and Callers

- **`deps.read_components`, `entries`.**
  Callers `deps.main` and `deliver.changed_bases`, which reads each entry's branch with `deps.BRANCH`.
- **`check_skill_files.requirements`, `BEFORE_USE`.**
  Caller `before_use_graph`, reached from `before_use_findings` and the installed Work Planner graph test.
- **`advance-mode.md` step 6.**
  Read by the `test_advance_decisions` walker; Held Change in `plan-change.md` routes a held decision.
- **`agent_review.epic_check`.**
  Callers `board.py` (Compute Board Changes CLI) and `deliver.py`.
- **`agent_review.check`, `review`; `Kind.review`; `hotfix.review`.**
  `check` is called by `main` and `epic_check`; `review` only by `check`; `Kind.review` only through `review`.

### Probes

- **Component corpus.**
  Every distinct Component line in the engineering planning records (108 lines) read by `read_components` at `bdfb52b0` and at the fixed head: no line changes its result.
- **Component scenarios.**
  The A inputs and synthetic prose beside `branch:path` entries, read at both revisions.
- **Before-use corpus.**
  `requirements()` over every Markdown file under `skills/` here and in the workspace skills and project corpus, at `bdfb52b0` and the fixed head: no edge gained or lost. The checker over each skill directory reports no before-use finding.
- **Before-use scenarios.**
  The B cross-section cycle at `bd5ccafc`, `bdfb52b0` and the fixed head; a relative and a symlinked caller path; each F form.
- **Callers.**
  Work Planner suite (board, deliver, hot-fix readiness and kind tests run `board.py` and `deliver.py` as programs) and shared suite.

### Findings

| # | Regression | Probe | Correction |
| --- | --- | --- | --- |
| R1 | A prose word holding a `/` beside `branch:path` entries became a file: `main:src/a.ts (reads/writes the cache), main:src/b.ts` declared `reads/writes`, where `bdfb52b0` declared two files. | Synthetic scenario. | [0601d75a](https://github.com/m2ux/workflow-server/commit/0601d75af): a bare word holding a `/` is a path only in a value declaring no branch. |
| R2 | An abbreviation or ratio beside entries became a file: `e.g.` gave `e.g` and `3:1` gave `3:1`. | Synthetic scenario. | [0601d75a](https://github.com/m2ux/workflow-server/commit/0601d75af): an abbreviation is no file extension and a branch opens with a letter. |
| R3 | A held decision put to the user that the user left unanswered had no route in step 6; at `bdfb52b0` it stopped with the pending queue. | Walker scenario `user`, `unanswered`. | [2088c7a3](https://github.com/m2ux/workflow-server/commit/2088c7a36): it stops the step as a decision held under an allowance does. |

While correcting R1, a first draft dropped bare extensionless paths; the Component corpus probe caught `config/branches` and `skills/work-planner` changing result, and the committed rule keeps them.

## Pass 2 — `c55646f4..2088c7a3`

- **Surface.**
  `deps.entries`, `on_branch`, `names_path` with `read_components`, `deps.main` and `deliver.changed_bases`; Advance step 6's held lines and the walker.
- **Probes.**
  The Component corpus (no line changes from `bdfb52b0`), every A scenario and the R1–R2 inputs; each walker disposition, including the unanswered user route and both mutation routes.
- **Outcome.**
  No finding.

## Validation at `2088c7a3`

- **Work Planner suite.**
  1230 tests OK, one opt-in skip ([log](planner-tests.log)).
- **Shared suite.**
  328 tests OK ([log](shared-tests.log)).
- **Skill check.**
  `check_skill_files.py` over Work Planner: 60 files, 0 findings ([log](skill-check.log)).
- **Whitespace.**
  `git diff --check bdfb52b0 2088c7a3` clean.
