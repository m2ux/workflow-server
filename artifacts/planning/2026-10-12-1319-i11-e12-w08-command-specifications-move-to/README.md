# Command Specifications Move to Their Callers — October 2026

> Planning record · Created 2026-10-12

## Executive Summary

Work Planner states its command specifications in one catalog, `references/commands.md`, and every mode file links into that catalog to reach the few operations its procedure runs. The shared skill-file check reports 36 of them as run by exactly one procedure, each named with the file whose procedure runs it. This task moves each of those to that file, leaves the catalog holding what several procedures share, and takes the execution conventions into a file of their own so reaching them costs the conventions alone.

It matters because the reader currently meets an operation through a link out of the file they are reading, into a catalog holding 79 specifications across 870 lines. The rule and its instrument are settled: W01 built the check, W05 and W07 corrected it, and the number it reports is what this move is measured against. What remains is the move itself, and a move of this kind is where specifications get corrupted.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W08](w08.md) | The work item: the move, its order and the parts of the work |

## Links

| Resource | Link |
| --- | --- |
| Epic I11 E12 Skill Layout | [#1319](https://github.com/m2ux/workflow-server/issues/1319) |
| Initiative I11 Work Planner | [#1166](https://github.com/m2ux/workflow-server/issues/1166) |
| Epic planning record | [2026-10-12-work-planner-skill-layout](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-work-planner-skill-layout) |
| W07 planning record | [2026-10-12-1319-i11-e12-w07-the-exclusion-names-a](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-1319-i11-e12-w07-the-exclusion-names-a) |
| Shared skill guidelines | [skills/guidelines.md](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) |
