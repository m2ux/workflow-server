# Results — Callers, Reach and Retrieval Measurements

> Recorded 2026-11-01

## Revisions

| Role | Commit |
| --- | --- |
| Baseline skills tree | `04de875a8517dcf229462e3b939099e16ffe3e63` |
| Result skills tree, epic base `i11/e10/workspace` | `f0d01fd3fd84ff050fcddf0ff4ff985369ca2c43` |
| Instrument checker, `skills/scripts/check_skill_files.py` | commit `aa97fc255f705b2d1f009a8e3f13ada0d2286496`, blob `e4e794c27a165c31811d5f18488fa78e51556137` |
| Tested branch head | `43ed7f77ba620b0f85ba4155837a77cc63d23ed2`, the task branch merged with epic base `212bedd48`; its checker blob is the instrument's |

## Instrument

| File | SHA-256 |
| --- | --- |
| [walk.py](walk.py) | `26e7749a24ae3198e5840dea04fe7da6f9be982e13b524fe477b787506673722` |
| [scenarios.json](scenarios.json) | `19a2d24d7d36c9d8f5f011ac7a7ab29f7fb4b70964a7a4f6be64dc37210e8931` |
| checker at the commit above | `808fff903c50536d834b89503651c73af6717c4c85c637c573e018dbc28eab98` |

Each output file repeats these three digests under `instrument`, so a trace names the instrument that produced it.

### Commands

Extract each tree and the checker from the project checkout, then run the walk once per tree from this folder:

```bash
git archive 04de875a8517dcf229462e3b939099e16ffe3e63 skills | tar -x -C <trees>/04de875a
git archive f0d01fd3fd84ff050fcddf0ff4ff985369ca2c43 skills | tar -x -C <trees>/f0d01fd3
git show aa97fc255:skills/scripts/check_skill_files.py > <scratch>/check_skill_files.py
python3 walk.py <scratch>/check_skill_files.py <trees>/04de875a/skills scenarios.json walk-04de875a.json
python3 walk.py <scratch>/check_skill_files.py <trees>/f0d01fd3/skills scenarios.json walk-f0d01fd3.json
```

### Reading Rules

The walk's docstring states them; in short:

- The entry point is read whole, then the mode is run: its Prerequisites load, and each step's target runs.
- A step runs its target section, or a whole file's procedure where it names no section. A command specification's citations run where the specification runs. A prerequisite is read without running.
- A descriptive link is not followed, and each one is listed under `not_followed` with its kind.
- A mode read as another mode's prerequisite loads no Prerequisites of its own.
- Every step is taken. Deliver excludes `run-delivery-session`, which the dispatched session runs.
- Files are counted by normalised path. Non-Markdown required files are listed as `assets` and not counted.

## T1 Callers and Reach Fixtures

`python3 -m pytest skills/test -q` at the tested head: 90 passed, 3 subtests passed.

The `CallersAndReach` class holds one specimen with each case:

- **Execution step.**
  A mode step running an artifact operation is classified `step`, is that operation's caller, and is in its reach.
- **Command-specification link.**
  A mode's operation citing an artifact command is classified `specification`: in the command's reach, not among its callers. Without `keeps_commands`, that reach asks for no move, while the same citation as a step is reported as one caller.
- **Subject-owned artifact command.**
  An artifact command with its own operation and one external caller stands with no finding, and its reach names both files.
- **Prerequisites.**
  A Prerequisites entry and a canonical `Read [...] first.` sentence are classified `prerequisite`; a descriptive link in Fields is neither caller nor reach.

Every earlier placement fixture passes unchanged, so callers are what they were.

## T2 Shared Skill-File Check

`python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon` at the tested head: 68 files checked, 0 findings.

`python3 skills/scripts/check_skill_files.py skills`, over every skill and the shared guidelines: 77 files checked, 0 findings.

## T3 Work Planner Suite

`python3 -m pytest skills/work-planner/test -q` at the tested head: 645 passed, 1 skipped, 1137 subtests passed.

## T4 Retrieval Measurements

Both runs measure every scenario, and neither reports a mode without a scenario or an unresolved citation. Rerunning both from the same inputs gives byte-identical output.

| Output | SHA-256 |
| --- | --- |
| [walk-04de875a.json](walk-04de875a.json) | `929c807f43d195ce16267b0481163e746926661ce1776d26ae5292ba073bcc80` |
| [walk-f0d01fd3.json](walk-f0d01fd3.json) | `b6b9a05178bc5d58c55b8de6e9e18cbf1fb5e48f4caea079bbb43bd15220d4d9` |

Each scenario's `trace` is the ordered list of sections read, with the citation and kind that reached each one. `opened` is the distinct file list the count is taken from.

| Scenario | Files baseline | Files result | Difference | Lines baseline | Lines result | Files added |
| --- | --- | --- | --- | --- | --- | --- |
| wp-propose | 8 | 8 | 0 | 1395 | 1432 | none |
| wp-plan | 36 | 37 | +1 | 5270 | 5535 | `artifacts/agent-review.md` |
| wp-align | 23 | 24 | +1 | 3818 | 4030 | `artifacts/agent-review.md` |
| wp-sync | 27 | 29 | +2 | 4367 | 4703 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-advance | 30 | 32 | +2 | 4737 | 5074 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-deliver | 37 | 38 | +1 | 5244 | 5513 | `artifacts/agent-review.md` |
| wp-understand | 12 | 14 | +2 | 2497 | 2721 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-hoist | 19 | 20 | +1 | 3656 | 3844 | `artifacts/agent-review.md` |
| wp-standup | 29 | 31 | +2 | 4511 | 4847 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-revise | 4 | 4 | 0 | 613 | 613 | none |
| wc-author | 10 | 10 | 0 | 973 | 975 | none |
| wc-audit | 9 | 9 | 0 | 914 | 916 | none |
| wc-review | 6 | 6 | 0 | 639 | 640 | none |
| wc-revise | 6 | 6 | 0 | 497 | 498 | none |

No file is opened at the baseline and absent at the result. `artifacts/agent-review.md` is new since the baseline, added by `7e77333b7`. `artifacts/work-item.md` stands at both revisions, and a citation added since the baseline reaches it. The result tree is the epic base, not the settled E14 integration head.

## Scope of the Measurement

- **Supplied, not judged.**
  These are measurements for E14 W11, which owns the no-increase verdict over the final manifests. This record issues no verdict.
- **Re-measured for the verdict.**
  The final comparison reruns this instrument, unchanged, at the settled result revision. A change to `walk.py`, `scenarios.json` or the checker commit requires both sides to be rerun.
- **Conditions are not resolved.**
  The walk takes every step, so each count is the complete mode run's upper bound. A conditional branch is excluded only by a scenario's `exclude`, applied identically at both revisions.
- **Prose requirements outside the canonical forms.**
  A required read stated in prose rather than as a step, a specification or a prerequisite is not followed. It appears under `not_followed` as `descriptive`, where an audit can find it. Workflow Canon's entry-point sentence sending readers to `command-conventions.md` is one; that file is reached anyway through each mode's own citations.
