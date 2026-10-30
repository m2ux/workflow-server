# Original Issue

> [Body Comparison: A Section Carried Whole](https://github.com/m2ux/workflow-server/issues/1353) · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W17] Body Comparison: A Section Carried Whole` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

Nothing measures whether a section's text survived a move. A restructure that carries specifications between files is reviewed by checks that read placement, links, headings and behaviour, none of which read the carried body, so a specification damaged in transit reads as correct to every instrument. A comparison of section bodies between a branch and its base closes that gap and makes the review of a move mechanical.

## Problem

- **Damage has passed the full battery.**
  A restructure of the Workflow Canon skill corrupted four command specifications. A link check, 71 tests and a structural check all passed over the damage, and it was found by a person reading the files.
- **Each move since has carried the comparison by hand.**
  The Work Planner move and the Workflow Canon move each wrote a one-off comparison, ran it once and recorded its output in a planning record. The instrument is rewritten per move and kept nowhere.
- **A retarget is indistinguishable from an edit without normalisation.**
  A moved specification's links must change, because an anchor whose holding file changed must name the file that now holds it, so a raw diff of the two bodies reports every move as a difference and buries a real one.

## Proposal

- **A script compares the section bodies of two revisions.**
  Every third-level section in a given path is extracted at each revision, keyed by its heading, and its body compared. A section that changed file is still compared with itself, so a move reports as a move.
- **Link targets are reduced to their fragments.**
  A markdown link target keeps only its anchor for the comparison, so a retarget reads as a retarget and any other change reads as a difference.
- **The output is the review's evidence.**
  It names each section as identical, moved, added, removed or differing, prints a unified diff for each difference, and ends with the section count at each revision, so a section lost or emptied in the move is visible in the count alone.
- **It is run as a check.**
  It stands with the other skill scripts and is cited by the revise procedure that restructures a skill, so the next move runs it rather than writing it again.

## Acceptance Criteria

- [ ] **AC1.** A shared script reports every third-level section of a given path as identical, moved, added, removed or differing between two revisions, with link targets reduced to their fragments, as its own test suite shows against specimens carrying a retarget, a reworded body, a moved section and a removed one.

## References

- **R1.** [Shared skill-file check](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/scripts/check_skill_files.py) — the checks that read placement and links, and read no body.

Assisted-by: AI <noreply@ai-assistant>

