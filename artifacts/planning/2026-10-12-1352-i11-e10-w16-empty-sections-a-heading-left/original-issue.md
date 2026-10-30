# Original Issue

> Empty Sections: A Heading Left Without Content · issue #1352 · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W16] Empty Sections: A Heading Left Without Content` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

A section heading whose body the author emptied passes every check the skill files are measured by. The shared skill-file check reads headings for their anchors, their order and their nesting, and reads each command specification for its callers, but nothing asks whether a heading still has content under it. A restructure that carries the last item out of a section leaves the heading promising something the reader will not find.

## Problem

- **An emptied heading has already shipped.**
  The Work Planner command move left `## Sources` and `## Sessions` standing with no specification under them. A [link check](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/scripts/check_skill_files.py), 57 of its own tests and the skill's suite all passed over that state, and a reader found it.
- **The check reads around the gap.**
  Its heading pass measures duplicate anchors and level jumps, its specification pass measures callers, and its line pass measures bullets, leads and prose runs. A heading followed immediately by another heading satisfies all three.
- **A move is where it happens.**
  Every restructure under the skill-layout work carries items between files, and the count of items a section holds afterwards is not read by any instrument.

## Proposal

- **A heading with no content of its own is reported.**
  A heading followed by nothing but whitespace before the next heading of its level or above draws a finding, naming the heading and its file.
- **A heading that only introduces sub-sections stays clean.**
  A section whose body is its sub-headings is the normal shape of a reference file, so the rule reads the span to the next heading of equal or higher level rather than to the next heading of any level.
- **The rule binds every skill.**
  It stands in the shared check beside the placement and section rules, so it is measured over every skill in the repository rather than remembered by the author of the next move.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports a heading carrying no content before the next heading of its level or above, as the check's own test suite shows against a specimen skill carrying that fault and one whose section holds only sub-sections.

## References

- **R1.** [Shared skill-file check](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/scripts/check_skill_files.py) — the heading, specification and line passes the rule would stand beside.
- **R2.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/9a461bab/skills/guidelines.md) — the layout rules the check measures.

Assisted-by: AI <noreply@ai-assistant>

