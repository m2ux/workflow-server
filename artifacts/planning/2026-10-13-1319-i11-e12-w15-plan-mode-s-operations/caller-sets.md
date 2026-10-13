# Caller Sets of Plan Mode's Eight Operations

The eight command specifications Plan mode reaches through `references/commands.md`, each read against the symmetric caller test the epic settled in `skills/guidelines.md`: a file is a caller where one of its *procedures* — a top-level section carrying a numbered step — carries the citation.

## The instrument

The caller sets are the shared check's own, not a hand count. `skills/scripts/check_skill_files.py` builds them in `citations()`, which separates every citing file from the subset whose procedures run the command, and `check()` reports a specification whose procedure-callers number exactly one when the holder is not that one.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner
```

Read at `d4b4c0eb`, the head of `i11/e12/workspace` this unit was cut from. The per-specification caller sets below are the same `citations()` result, printed per specification rather than filtered to the one-caller finding.

## The eight

Paths are relative to `skills/work-planner`. Cites lists every file whose prose or steps carry the citation; Runs lists the subset whose procedures run it, which is the caller set the rule reads.

| Operation | Runs (procedure-callers) | Cites but does not run |
| --- | --- | --- |
| [Add Planning Record](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#add-planning-record) | `deliver-mode.md`, `plan-mode.md`, `understand-mode.md` | `SKILL.md`, `hoist-mode.md`, `planning-layout.md` |
| [Check Dependencies](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#check-dependencies) | `align-mode.md`, `hoist-mode.md`, `plan-mode.md`, `review-passes.md` | `commands.md`, `review-criteria.md`, `work-breakdown.md` |
| [Check Format](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#check-format) | `align-mode.md`, `hoist-mode.md`, `plan-mode.md`, `propose-mode.md`, `review-passes.md`, `sync-mode.md`, `work-breakdown.md` | none |
| [Create Issue](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#create-issue) | `plan-mode.md`, `propose-mode.md` | `deliver-mode.md` |
| [Delivery State](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#delivery-state) | none | `align-mode.md`, `commands.md`, `deliver-mode.md`, `plan-mode.md`, `sync-mode.md`, `work-breakdown.md` |
| [Patch Body](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#patch-body) | `align-mode.md`, `deliver-mode.md`, `hoist-mode.md`, `plan-mode.md`, `sync-mode.md` | none |
| [Retarget Pull Request](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#retarget-pull-request) | `align-mode.md`, `plan-mode.md` | none |
| [Sync Epic](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md#sync-epic) | `align-mode.md`, `plan-mode.md`, `sync-mode.md`, `work-breakdown.md` | `commands.md`, `deliver-mode.md` |

## Check results

Run in the unit's worktree of `m2ux/workflow-server`, under `scripts/sbx`.

- **At `d4b4c0eb`, the base.**
  `skills/scripts/check_skill_files.py skills/work-planner` reports `28 files checked, 3 findings`, all three in `references/work-breakdown.md` at lines 118 to 120: inline bold leads of 230, 110 and 214 characters against the hundred-character limit. No finding names a command specification with one caller.
- **At `99abeb30`, the head.**
  `skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon` reports `57 files checked, 0 findings`.
- **The check's own suite.**
  `python3 -m unittest discover -s skills/test -p test_check_skill_files.py` runs 57 tests, all passing, at both revisions.

## What the sets decide

- **Seven are shared in fact.**
  Each of the seven Plan mode's procedure runs carries at least one further procedure-caller, so the catalog is the one file that serves them all and the localisation rule leaves each where it stands. Two is the narrowest set, held by Create Issue and Retarget Pull Request.
- **Delivery State is read, not run.**
  Plan mode cites it from Prerequisites, which carries no numbered step, and so do Align, Deliver and Sync. No procedure of any file runs it; six files cite it. It is a statement of what delivery state means, read before the operations that act on it, and the catalog is where every reader of it already looks.
- **The localisation rule reaches nothing here.**
  The rule fires on a specification whose procedure-callers number exactly one and whose holder is not that caller. None of the eight has a caller set of one, so no specification moves into `references/plan-mode.md` and the file keeps no Commands section.
- **The retrieval cost is a measured floor.**
  Plan mode opening `commands.md` buys it seven operations no other single file could give it, each shared with a mode that opens the same catalog for the same reason. That is the floor, not an unlocalised remainder.
