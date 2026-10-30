# Original Issue

> Caller Test: One Rule for Every Citing File · issue #1336 · opened 2026-10-12 · closed

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E12:W09] Caller Test: One Rule for Every Citing File` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | closed |
| Assignee | m2ux |

## Body

## Overview

The shared skill-file check decides where a command specification belongs by counting the files that cite it. It asks of the file holding the specification whether a Procedure section carries the citation, and asks nothing of any other citing file. A sibling specification or a passage of reference prose in another file therefore counts as a caller, although the shared guidelines state it is not one. The count becomes symmetric: a file counts among a specification's callers only where a procedure of that file cites it, whichever file it is.

## Problem

- **The exclusion was narrowed on one side only.**
  [`check_skill_files.py`](https://github.com/m2ux/workflow-server/blob/09475c1f/skills/scripts/check_skill_files.py#L170-L178) drops the holding file from the caller set unless a `## Procedure` of it cites the specification. Every other citing file enters the set from `cited()`, which reads every link with a fragment wherever it sits.
- **The guidelines say the two cases are the same.**
  The [placement rule](https://github.com/m2ux/workflow-server/blob/09475c1f/skills/guidelines.md#L107) states that a caller is a procedure that runs the command, and that a sibling specification or a passage of reference prose naming a command does not make the file holding it a caller. Nothing in it distinguishes the holding file from any other.
- **A correctly placed specification is reported as misplaced.**
  `Renumber Epics`, `Capture Issue Development` and `Merge Pull Request` sit with the procedures that run them, in `review-passes.md` and `work-breakdown.md`. Each is also named by a sibling specification left in `commands.md`, and the check reports that catalog as its one caller, naming a destination that would undo the placement.
- **A procedure under another heading is invisible.**
  The holding-file exclusion recognises only an h2 titled `Procedure`. `work-breakdown.md` runs its delivery procedure under `Delivery` and `review-passes.md` runs its under `Ordering Pass`, so neither counts as its own caller and a specification placed there is reported against the sibling that names it.
- **A file with no procedure at all absorbs a specification silently.**
  `SKILL.md` has no Procedure, so a specification moved into it is never reported, although the guidelines bar `SKILL.md` from holding a command of its own. `List Initiative Titles` is reported against `SKILL.md` today for the same reason in reverse: its Themes and Boards section names the command without running it.

## Proposal

- **One caller test, applied to every file.**
  A file counts among a specification's callers only where a procedure of that file carries the citation. The holding file stops being a special case, and `cited()` records the section each citation sits in rather than the file alone.
- **A procedure is recognised by what it is, not only by its heading.**
  The test admits a top-level section whose content is a numbered procedure, so `Delivery` and `Ordering Pass` count beside `Procedure`. The alternative — requiring every such guide to rename its section — changes files to suit the instrument.
- **A specification no procedure runs stands where it is.**
  Zero callers is already silent, and stays silent. The report names only a specification exactly one procedure elsewhere runs.
- **`SKILL.md` holds no command.**
  The check reports a command specification standing in a skill's entry point, so the guideline that `SKILL.md` carries none is measured rather than remembered.

## Acceptance Criteria

- [x] **AC1.** A file counts among a command specification's callers only where a procedure of that file cites the specification, whether or not that file holds the specification, as the check's own suite observes over a specimen of each case.
- [x] **AC2.** The check reports no command-specification finding over `skills/work-planner`, with `Renumber Epics`, `Capture Issue Development` and `Merge Pull Request` standing where they are.
- [x] **AC3.** A command specification standing in a skill's `SKILL.md` is reported, as the check's own suite observes over a specimen.

## References

- **R1.** [Planning record for the holding-file narrowing](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-1319-i11-e12-w07-the-exclusion-names-a) — the twenty suppressions classified, and the reading the narrowing rests on.
- **R2.** [Planning record for the move](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-1319-i11-e12-w08-command-specifications-move-to) — each specification's destination and the comparison of every moved body against its original.


