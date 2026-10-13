# Check Results — The Conventions Reached Without a Further File

> Recorded 2026-10-13

## Method

The instrument is [walk.py](../2026-10-13-1319-i11-e12-w11-disclosure-verification-over-each/walk.py) from the disclosure verification record, run unchanged. It imports `skills/scripts/check_skill_files.py` from the checkout given and reuses that check's `scan`, `specifications` and `specification_spans`, so a command specification means the same thing on every layout. It needed no change to run over this layout: a citation of `../SKILL.md#command-conventions` resolves to the entry point, which the walk already charges to every mode, so the file is not counted twice.

- **The traversal.**
  Depth one: `SKILL.md` to select the mode, the mode file whole, and each distinct further file the mode file cites outside its own command specifications.
- **M1, files opened.** `SKILL.md`, the mode file, and each distinct further file it cites.
- **M2, in file against link out.** The command specifications the mode cites that stand in the mode file, against those standing in another file.
- **M3, lines loaded.** The total line count of the files M1 names.
- **Revisions.**
  Base is `2fe04e7c`, the epic base this branch was cut from. Head is this branch's tip. Columns headed *before* are the pre-epic layout `fae97e9e`, carried from the disclosure verification record and not re-derived here.

- **Commands.**

  ```bash
  cd <worktree> && <workspace>/scripts/sbx python3 <record>/walk.py skills/scripts/check_skill_files.py skills/work-planner
  cd <worktree> && <workspace>/scripts/sbx python3 <record>/walk.py skills/scripts/check_skill_files.py skills/workflow-canon
  ```

  Run twice per revision: each skill at the base and at the head.

## T1 The Retrieval Walk Per Mode

### Work Planner

| Mode | M1 before | M1 base | M1 head | M3 base | M3 head | Opens the conventions as a further file |
| --- | --- | --- | --- | --- | --- | --- |
| Advance | 6 | 7 | 6 | 1303 | 1302 | no |
| Align | 10 | 11 | 10 | 1836 | 1835 | no |
| Deliver | 10 | 12 | 11 | 1602 | 1601 | no |
| Hoist | 9 | 10 | 9 | 1507 | 1506 | no |
| Plan | 13 | 14 | 13 | 1831 | 1830 | no |
| Propose | 8 | 9 | 8 | 1433 | 1432 | no |
| Revise | 6 | 6 | 5 | 533 | 532 | no |
| Standup | 6 | 7 | 6 | 1053 | 1052 | no |
| Sync | 8 | 9 | 8 | 1574 | 1573 | no |
| Understand | 8 | 9 | 8 | 1514 | 1513 | no |
| **Total** | **84** | **94** | **84** | **14186** | **14176** | |

- **Every mode opens one file fewer than at the base.**
  Files opened fall from 94 to 84, the file removed being `references/command-conventions.md` in each of the ten.
- **Lines loaded are flat.**
  14186 to 14176, one line per mode: the conventions arrive inside a file the mode already loads whole, and the retired file's title and lead do not.
- **Nine modes match the pre-epic layout and Revise beats it.**
  Revise falls to 5 against 6 before and 6 at the base, the one mode whose operations are wholly in file. Deliver stands at 11 against 10 before; its extra file is `understand-mode.md`, a link the epic's W10 added, not a conventions cost.
- **M2 is untouched.**
  33 operations in file and 75 by link out, at the base and at the head alike. This row moves no command specification.

### Workflow Canon

| Mode | M1 base | M1 head | M3 base | M3 head | Opens the conventions as a further file |
| --- | --- | --- | --- | --- | --- |
| Audit | 8 | 8 | 890 | 890 | does not reach them |
| Author | 7 | 7 | 803 | 803 | does not reach them |
| Review | 6 | 6 | 641 | 641 | no |
| Revise | 6 | 6 | 482 | 482 | no |
| **Total** | **27** | **27** | **2816** | **2816** | |

Unchanged: this row alters no Workflow Canon file. Review mode and Revise mode are the only two whose files cite `references/command-conventions.md`, and each cites `Run Project Check` in it from a step of its own procedure — Review at step 5 of its Procedure, Revise under Run Skill Checks. The file is opened for that operation whatever the conventions cost, so reaching the conventions opens no file the mode would not otherwise open. The file also stands at `fae97e9e`, the pre-epic commit, where pull request #1296 placed it.

### AC18

The criterion holds on this evidence for both skills. Work Planner's conventions stand in `SKILL.md`, which every mode opens to select itself; Workflow Canon's stand in a file both reaching modes open for an operation their procedures run.

## T2 Shared Skill-File Check

```bash
cd <worktree> && <workspace>/scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon
```

```text
57 files checked, 0 findings
```

0 findings at the head, as at the base. The file count falls from 58 to 57 with the retired conventions file.

## T3 Check Test Suite

```bash
cd <worktree> && <workspace>/scripts/sbx python3 -m unittest discover -s skills/test
```

```text
Ran 57 tests in 0.019s

OK
```

57 tests, none regressed.
