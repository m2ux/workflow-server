# Shared Check Gains the Two Layout Rules — October 2026

> Planning record · Created 2026-10-12

## Executive Summary

Epic I11 E12 moves each command specification into the file whose procedure runs it and fixes the set of top-level sections a mode file may carry. Both rules are decidable by reading the skill's own files, and `skills/scripts/check_skill_files.py` already reads them for every skill in the repository. This task adds the two rules to that check, with a specimen skill carrying each fault so the check's test suite shows the report rather than asserting it.

It matters because the rules land before the restructures that satisfy them. W02, W03 and W04 all depend on this task: each is a large move across many files, and the check is the instrument that says whether the move landed whole. A rule stated in the guidelines and policed by whoever remembers it is the fault I11 was raised to fix, so the check comes first and the moves are measured against it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W01](w01.md) | The work item: overview, problem, proposal and the parts of the work |

## Links

| Resource | Link |
| --- | --- |
| Epic I11 E12 Skill Layout | [#1319](https://github.com/m2ux/workflow-server/issues/1319) |
| Initiative I11 Work Planner | [#1166](https://github.com/m2ux/workflow-server/issues/1166) |
| Epic planning record | [2026-10-12-work-planner-skill-layout](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-work-planner-skill-layout) |
| Shared skill guidelines | [skills/guidelines.md](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) |
