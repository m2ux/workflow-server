# Original Issue

> [Heading Spacing: A Blank Line Above Every Heading](https://github.com/m2ux/workflow-server/issues/1327) · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W08] Heading Spacing: A Blank Line Above Every Heading` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

A heading written directly beneath a list item, with no blank line between them, renders as list text rather than as a heading in a strict CommonMark reader, and the shared skill-file check does not report it. One such heading stands in the Work Planner review criteria. The check should measure it, so a section cannot silently stop being one.

## Problem

- **A heading can be swallowed by the list above it.**
  [`review-criteria.md`](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/work-planner/references/review-criteria.md#L78-L79) puts `#### Whole` immediately after a bullet's continuation line. A reader that treats the run as one list item never sees the heading, so the section and its anchor are not there for it.
- **The check reads the line as a heading regardless.**
  [`scan`](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/scripts/check_skill_files.py#L54) matches a heading by its leading hashes alone, so a citation to `#whole` resolves for the check while a strict reader finds nothing.
- **Nothing else measures the spacing.**
  The check already measures a trailing blank line, bold-lead width, bullet shape and prose length, so file layout is its concern; this is the one spacing fault it passes over.

## Proposal

- **A heading needs a blank line above it.**
  The check reports a heading whose preceding line is neither blank nor the start of the file, naming the heading. A fenced block's contents stay exempt, as they are for every other layout rule.
- **The one heading that fails it is separated.**
  The `Whole` heading in the review criteria gets its blank line.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports a heading whose preceding line is neither blank nor the start of the file, as the check's own suite shows against a specimen carrying that fault.
- [ ] **AC2.** No heading in the repository's skills stands without a blank line above it, as the shared skill-file check reports over every skill.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/guidelines.md) — the Layout rules the check measures.

