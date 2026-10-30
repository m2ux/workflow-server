# The Section Set Binds Any Procedure File — October 2026

> Planning record · Created 2026-10-13

## Executive Summary

The shared skill-file check fixes the top-level sections a mode file may carry and the order it carries them in, and selects the files it binds by the `-mode.md` suffix alone. A procedure is not confined to a mode file: the check reads a procedure as a top-level section carrying numbered steps, whatever its heading names it, so a reference file holding steps is a caller of the commands those steps run and receives their specifications under the placement rule. `audit-dispatch.md` is such a file. It carries a procedure, it now carries the three specifications its steps run, and the section rule measures none of it.

It matters because the author of the next such file has a precedent to copy rather than a rule to read. The placement of a Commands section in a file whose other sections are not the named set was argued in a planning record rather than read from a rule. This record selects the set by what a file carries rather than by what it is called, states the test once in the shared guidelines, and leaves a file carrying no procedure — a catalog, a context file, a contract file — to keep its own shape.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W16](w16.md) | The work item: the options weighed, the one taken and the parts of the work |
| [Tests](tests.md) | The two checks the work item names, with the output each produced |

## Links

| Resource | Link |
| --- | --- |
| Epic I11 E12 Skill Layout | [#1319](https://github.com/m2ux/workflow-server/issues/1319) |
| Initiative I11 Work Planner | [#1166](https://github.com/m2ux/workflow-server/issues/1166) |
| The section set task | [E12 W16](w16.md) |
| Epic planning record | [2026-10-12-work-planner-skill-layout](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-work-planner-skill-layout) |
| Workflow Canon specifications moved | [2026-10-12-1330-i11-e12-w13-workflow-canon-specifications-move](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-1330-i11-e12-w13-workflow-canon-specifications-move) |
