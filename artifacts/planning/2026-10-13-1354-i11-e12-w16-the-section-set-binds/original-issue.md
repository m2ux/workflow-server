# Original Issue

> [Section Set: The Sections a File Carrying a Procedure Takes](https://github.com/m2ux/workflow-server/issues/1354) · opened 2026-10-12 · closed

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E12:W16] Section Set: The Sections a File Carrying a Procedure Takes` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | closed |
| Assignee | m2ux |

## Body

## Overview

A reference file that carries a procedure and the commands that procedure runs has no section set to conform to. The shared skill-file check fixes the top-level sections a mode file may carry, and applies that rule by the `-mode.md` suffix alone, so a file holding steps and specifications under any other name chooses its own section names and their order. The author of the next such file has a precedent to copy rather than a rule to read.

## Problem

- **A procedure is not confined to a mode file.**
  The check reads a procedure as a top-level section carrying numbered steps, [whatever its heading names it](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/scripts/check_skill_files.py), so a reference file is a caller of the commands its steps run and receives those specifications under the placement rule.
- **The section rule reaches only a file name.**
  The mode section set is applied where [the file name ends in `-mode.md`](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/scripts/check_skill_files.py). `audit-dispatch.md` carries a procedure, now carries the three specifications its steps run, and is measured by none of it.
- **The placement of its Commands section was a judgment.**
  Nothing stated where a Commands section goes in a file whose other sections are not the named set, so the choice was argued in a planning record rather than read from a rule.

## Proposal

- **The section rule reads what a file carries, not what it is called.**
  A file carrying a procedure takes the named set and its order, so the reader of any such file knows what it holds before opening it.
- **A file that carries no procedure keeps its own shape.**
  A catalog, a context file and a contract file state what a procedure consults, and nothing about them is a sequence, so the named set does not bind them.
- **The guidelines state the test once.**
  The shared guidelines name the condition that selects the set, so the next author places a heading by reading the rule rather than a sibling file.

## Acceptance Criteria

- [x] **AC1.** The shared skill-file check applies the named top-level section set and its order to every file carrying a procedure, whatever its name, as the check's own test suite shows against a specimen carrying a procedure outside a mode file and one carrying no procedure.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/guidelines.md) — the named section set and the command placement rule.
- **R2.** [Audit dispatch](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/workflow-canon/references/audit-dispatch.md) — a reference file carrying a procedure, its sizing input, its return contract and its commands.

Assisted-by: AI <noreply@ai-assistant>

