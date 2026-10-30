# Original Issue

> Entry Point: No Specification in a Skill File · issue #1342 · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W13] Entry Point: No Specification in a Skill File` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The shared skill guidelines state that a skill's `SKILL.md` holds no command of its own: a command the entry point names is specified in the file whose procedure runs it, or in the catalog. The GitNexus CLI skill states five command specifications in its entry point, so every reader of that skill loads all five to reach any one of them.

## Problem

- **Five specifications stand in the entry point.**
  [`gitnexus/gitnexus-cli/SKILL.md`](https://github.com/m2ux/workflow-server/blob/fb53546f/skills/gitnexus/gitnexus-cli/SKILL.md) carries `analyze`, `status`, `clean`, `wiki` and `list` under a Commands listing, which the shared skill-file check reports as `command specification in the entry point`.
- **A layout fault stands beside them.**
  The same file carries a 119-character inline bold lead against the 100-character limit.

## Proposal

- **The specifications move out of the entry point.**
  Into the file whose procedure runs each, or into a references catalog the skill's procedures link, so the entry point states purpose and routing and the reader loads one operation at a time.
- **The wide lead is wrapped.**
  Its body moves to the line beneath the bold statement, as the shared guidelines lay a bold lead out.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports no finding over `skills/gitnexus`.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) — the rule that the entry point holds no specification, and the layout rules the file is measured against.

