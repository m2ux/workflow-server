# Original Issue

> Bold Leads: Every Lead Within the Width Limit · issue #1322 · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W11] Bold Leads: Every Lead Within the Width Limit` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The gitnexus skill does not pass the shared skill-file check. One bold lead in its CLI skill file runs 119 characters against the limit of 100, so a run of the check over every skill in the repository ends non-zero on a skill no current epic touches.

## Problem

- **One bold lead exceeds the width the shared layout rule sets.**
  The shared guidelines put a bold label and its body on one line only when the two fit within 100 characters, indent included, and a longer body on the next line indented under the bullet. [`gitnexus/gitnexus-cli/SKILL.md`](https://github.com/m2ux/workflow-server/blob/fae97e9e/skills/gitnexus/gitnexus-cli/SKILL.md#L82) carries both on one line of 119.
- **It is the only finding gitnexus carries, and it keeps the run red.**
  The shared check reports nothing else against the skill, including under the two layout rules the check gained for command placement and mode sections. A run over all four skills cannot distinguish gitnexus being clean from gitnexus being unchecked while this stands.

## Proposal

- **The body moves to its own line under the bullet.**
  The label keeps its line and the sentence beneath it is indented under the bullet, which is what the shared guidelines state for a body too long to share the line.
- **The check settles it.**
  `skills/scripts/check_skill_files.py` reports no finding for the gitnexus skill afterwards.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports no finding for the gitnexus skill, as a run of that check over the skill's folder shows.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) — the bold-lead width rule the file departs from.
- **R2.** [Shared skill-file check](https://github.com/m2ux/workflow-server/blob/workspace/skills/scripts/check_skill_files.py) — the instrument that reports it.


