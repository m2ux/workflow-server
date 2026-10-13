# Walk Results — Retrieval Per Mode Over Both Layouts

> Recorded 2026-10-13

## Method

[walk.py](walk.py) counts, for each mode of a skill, what a reader retrieves to run that mode. It imports `skills/scripts/check_skill_files.py` from the after layout and reuses that check's `scan`, `specifications` and `specification_spans`, so "a command specification" means the same thing over both layouts and the counting rule is the epic's own instrument rather than this walk's.

- **The traversal.**
  Depth one: `SKILL.md` to select the mode, the mode file whole, and each distinct further file the mode file cites. Links standing inside the mode file's own command specifications are excluded, because a specification states how one command runs and a reader reading it has already arrived.
- **M1, files opened.**
  `SKILL.md`, the mode file, and each distinct further file it cites.
- **M2, in file against link out.**
  The command specifications the mode cites that stand in the mode file, against those standing in another file.
- **M3, lines loaded.**
  The total line count of the files M1 names. A reader that opens a file reads it whole, so a catalog's size is a retrieval cost.
- **Layouts.**
  Before is `fae97e9e`, the commit the epic's issue body cites as the pre-change state, read in a detached worktree. After is `f2c26048`, the epic base.

- **Commands.**

  ```bash
  cd <engineering> && <workspace>/scripts/sbx python3 .../walk.py <after>/skills/scripts/check_skill_files.py <layout>/skills/work-planner
  ```

  Run four times: each skill against each layout.

## T1 The Walk Over Both Layouts

### Work Planner

| Mode | M1 before | M1 after | M2 in file before | M2 in file after | M2 link out before | M2 link out after | M3 before | M3 after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Advance | 6 | 7 | 0 | 1 | 5 | 4 | 1548 | 1303 |
| Align | 10 | 11 | 0 | 2 | 18 | 16 | 2023 | 1836 |
| Deliver | 10 | 12 | 0 | 4 | 15 | 11 | 1701 | 1602 |
| Hoist | 9 | 10 | 0 | 3 | 13 | 10 | 1828 | 1507 |
| Plan | 13 | 14 | 0 | 0 | 8 | 8 | 2040 | 1831 |
| Propose | 8 | 9 | 0 | 5 | 10 | 5 | 1738 | 1433 |
| Revise | 6 | 6 | 0 | 1 | 1 | 0 | 1357 | 533 |
| Standup | 6 | 7 | 0 | 1 | 3 | 2 | 1406 | 1053 |
| Sync | 8 | 9 | 0 | 8 | 24 | 16 | 1752 | 1574 |
| Understand | 8 | 9 | 0 | 8 | 11 | 3 | 1714 | 1514 |
| **Total** | **84** | **94** | **0** | **33** | **108** | **75** | **17107** | **14186** |

Files opened rise by 10, a tenth more. Operations reached by a link out fall by 33, a little under a third. Lines loaded fall by 2921, a sixth.

Where the remaining link-outs land, after: `commands.md` holds 74 of the 75, and `understand-mode.md` the one Deliver reaches. Before: `commands.md` held all 108.

### Workflow Canon

| Mode | M1 before | M1 after | M2 in file before | M2 in file after | M2 link out before | M2 link out after | M3 before | M3 after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Audit | 7 | 8 | 0 | 2 | 1 | 0 | 840 | 890 |
| Author | 7 | 7 | 0 | 0 | 0 | 0 | 836 | 803 |
| Review | 6 | 6 | 11 | 11 | 0 | 0 | 639 | 641 |
| Revise | 7 | 6 | 7 | 8 | 1 | 0 | 705 | 482 |
| **Total** | **27** | **27** | **18** | **21** | **2** | **0** | **3020** | **2816** |

Workflow Canon's localisation landed in pull request #1296, which is the before commit itself, so this table measures only what epic E12 did to that skill — the section set, the routes stated as steps, and the ten specifications that move followed. Its before layout already carried 18 operations in file and reached only 2 by a link out, so the margin it could move was two operations wide.

## Findings

- **No mode opens fewer files, and nine of ten open one more.**
  Work Planner's M1 rises from 84 to 94. Every rise but Deliver's is the one file `references/command-conventions.md`, which each mode now opens for the execution conventions. Deliver rises by two, the second being a link to Understand mode that the epic's other work added.
- **The conventions file is a net new file for every mode that still opens the catalog.**
  Before, the conventions stood at the head of `commands.md`, which every mode opened anyway, so reaching them cost no file of its own. After, nine of the ten modes open both `command-conventions.md` and `commands.md`. Splitting the conventions out buys a smaller read and costs a file, for every mode but Revise.
- **Only Revise stopped opening the catalog.**
  It is the single mode of either skill whose operations are now wholly in file: 1 link-out to 0, and 1357 lines loaded to 533, a drop of three fifths. It is also the mode that cited the fewest operations to begin with.
- **Plan mode is worse on this measure and better on none of it.**
  It opens one more file, localises no operation, and reaches the same 8 operations through the catalog as before. All 8 are cited from more than one file, so the rule that moved a specification left every one of them where it was. Its lines loaded fall a tenth, which is the catalog shrinking under it rather than anything Plan mode gained.
- **Canon's Audit mode got worse on two counts of three.**
  It opens one more file, `canon-map.md`, and loads 50 more lines, against 2 operations gained in file and 1 link-out removed.
- **The claim holds for a minority of operation reaches.**
  The epic's Proposal says the reader meets the operation at the point of use rather than through a link out. Across Work Planner, 33 of 108 operation reaches became in-file, 31 percent. The other 69 percent are still reached through `commands.md`, which 9 of 10 modes open exactly as they did before.
- **The reduction that is real is volume, not reach.**
  Lines loaded fall 17 percent for Work Planner and 7 percent for Workflow Canon. That is the catalog's 870 lines falling to 374 arriving in the retrieval count, and it is a genuine gain for every mode that opens the catalog. It is a smaller version of the arithmetic the epic already had, not an independent confirmation of the readability claim.

### Verdict

On this evidence the epic's claim is **partly supported and weaker than the epic states it**. A reader meets roughly a third of the operations a mode runs at the point of use, and reads a sixth less to do it. A reader also opens one more file than before for nine of Work Planner's ten modes, and no mode of either skill opens fewer. The restructure moved operations closer to their callers without removing the catalog from any mode's path but one, so "rather than through a link out" describes a minority of reaches rather than the shape of the layout.

### Limitations

- **Depth one.**
  The count reads the files a mode sends a reader to, not the files those send them to in turn. A specification that moved into a mode file and still cites the catalog counts as reached in file.
- **The conventions are charged once per mode.**
  `command-conventions.md` is written to be read once a session. A session running several modes pays it once, not once per mode, so M1's rise overstates the cost of a long session and states it correctly for a session running one mode, which is how this epic's own units ran.
- **M2's before column is structurally zero.**
  The before layout gave mode files no Commands section, so no operation could stand in file. The informative half of M2 is the link-out column, which fell on its own terms.
- **Canon's before layout is already restructured.**
  Its localisation is the before commit, so its margin was two operations wide and its table carries little weight.

## T2 Shared Skill-File Check

`check_skill_files.py` over the two skills the epic restructured, at the measured revision `f2c26048`:

```bash
cd <worktree> && <workspace>/scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon
```

```text
58 files checked, 0 findings
```

Over `skills` whole the run reports 6 findings, all in `skills/gitnexus`, which the epic's record places outside its scope.

## T3 No Skill File Changed

```bash
cd <worktree> && git diff --stat f2c26048..HEAD
```

Empty: this branch changes no file under `skills/`. The walk is a measurement and fixes nothing it found.
