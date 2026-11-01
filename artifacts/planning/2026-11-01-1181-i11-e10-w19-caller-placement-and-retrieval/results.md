# Results — Callers, Reach and Retrieval Measurements

> Recorded 2026-11-01

## Revisions

| Role | Commit |
| --- | --- |
| Baseline skills tree | `04de875a8517dcf229462e3b939099e16ffe3e63` |
| Result skills tree, epic base `i11/e10/workspace` | `ba441c2b8159e81b37ee5ccbbec75b2d3a06d10d` |
| Instrument checker, `skills/scripts/check_skill_files.py` | commit `aa3fb6107451e5b74b8885073b684a2e67d4a669`, blob `4cf9a482b2b6f98d851791545c3942addc7ace77` |
| Tested branch head | `aa3fb6107451e5b74b8885073b684a2e67d4a669` |

## Instrument

| File | SHA-256 |
| --- | --- |
| [walk.py](walk.py) | `26e7749a24ae3198e5840dea04fe7da6f9be982e13b524fe477b787506673722` |
| [scenarios.json](scenarios.json) | `19a2d24d7d36c9d8f5f011ac7a7ab29f7fb4b70964a7a4f6be64dc37210e8931` |
| checker at the commit above | `9b91a96a887e74c754bded61b34e28d07cef0729230a29bc8fcfdd9f0eb51974` |

Each output file repeats these three digests under `instrument`, so a trace names the instrument that produced it.

### Commands

Extract each tree and the checker from the project checkout, then run the walk once per tree from this folder:

```bash
git archive 04de875a8517dcf229462e3b939099e16ffe3e63 skills | tar -x -C <trees>/04de875a
git archive ba441c2b8159e81b37ee5ccbbec75b2d3a06d10d skills | tar -x -C <trees>/ba441c2b
git show aa3fb6107:skills/scripts/check_skill_files.py > <scratch>/check_skill_files.py
python3 walk.py <scratch>/check_skill_files.py <trees>/04de875a/skills scenarios.json walk-04de875a.json
python3 walk.py <scratch>/check_skill_files.py <trees>/ba441c2b/skills scenarios.json walk-ba441c2b.json
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

`python3 -m pytest skills/test -q` at the tested head: 82 passed, 3 subtests passed.

The `CallersAndReach` class holds one specimen with each case:

- **Execution step.**
  A mode step running an artifact operation is classified `step`, is that operation's caller, and is in its reach.
- **Command-specification link.**
  A mode's operation citing an artifact command is classified `specification`: in the command's reach, not among its callers. Without `keeps_commands`, that reach asks for no move, while the same citation as a step is reported as one caller.
- **Subject-owned artifact command.**
  An artifact command with its own operation and one external caller stands with no finding, and its reach names both files.
- **Prerequisites.**
  A Prerequisites entry and a canonical `Read [...] first.` sentence are classified `prerequisite`; a descriptive link in Fields is neither caller nor reach.

Every one of the 76 earlier fixtures passes unchanged, so callers are what they were.

## T2 Shared Skill-File Check

`python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon` at the tested head: 79 files checked, 0 findings.

Over every skill, the check reports 6 findings, all in `skills/gitnexus/gitnexus-cli/SKILL.md`. The same 6 stand at the epic base before this change. E10 W11 and W13 own them.

## T3 Work Planner Suite

`python3 -m pytest skills/work-planner/test -q` at the tested head: 619 passed, 1 skipped, 1136 subtests passed.

## T4 Retrieval Measurements

Both runs measure every scenario, and neither reports a mode without a scenario or an unresolved citation. Rerunning both from the same inputs gives byte-identical output.

| Output | SHA-256 |
| --- | --- |
| [walk-04de875a.json](walk-04de875a.json) | `e7a0f2a9242e1827d4eb8f68d996574f629eab61bd153bf0f43e1de087f1a162` |
| [walk-ba441c2b.json](walk-ba441c2b.json) | `f205aa81457eb4e10ea4177ae1345c0d2a51fa0b699da8e696a2d0f5baf8dd38` |

Each scenario's `trace` is the ordered list of sections read, with the citation and kind that reached each one. `opened` is the distinct file list the count is taken from.

| Scenario | Files baseline | Files result | Difference | Lines baseline | Lines result | Files added |
| --- | --- | --- | --- | --- | --- | --- |
| wp-propose | 8 | 8 | 0 | 1395 | 1465 | none |
| wp-plan | 36 | 37 | +1 | 5270 | 5563 | `artifacts/agent-review.md` |
| wp-align | 23 | 24 | +1 | 3818 | 4058 | `artifacts/agent-review.md` |
| wp-sync | 27 | 29 | +2 | 4367 | 4731 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-advance | 30 | 32 | +2 | 4737 | 5102 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-deliver | 37 | 38 | +1 | 5244 | 5540 | `artifacts/agent-review.md` |
| wp-understand | 12 | 14 | +2 | 2497 | 2751 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-hoist | 19 | 20 | +1 | 3656 | 3871 | `artifacts/agent-review.md` |
| wp-standup | 29 | 31 | +2 | 4511 | 4875 | `artifacts/work-item.md`, `artifacts/agent-review.md` |
| wp-revise | 4 | 4 | 0 | 613 | 613 | none |
| wc-author | 10 | 10 | 0 | 973 | 973 | none |
| wc-audit | 9 | 9 | 0 | 914 | 914 | none |
| wc-review | 6 | 6 | 0 | 639 | 639 | none |
| wc-revise | 6 | 6 | 0 | 497 | 497 | none |

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
