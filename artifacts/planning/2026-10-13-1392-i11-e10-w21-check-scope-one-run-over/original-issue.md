# Original Issue

> [Check Scope: One Run Over Every Skill That Reports Nothing](https://github.com/m2ux/workflow-server/issues/1392) · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W21] Check Scope: One Run Over Every Skill That Reports Nothing` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | none |

## Body

## Overview

The shared skill-file check reports six findings over `skills/gitnexus`, and has done so since the rules that catch them landed. The gitnexus skills are not written to the shared skill guidelines, so a run of the check over every skill cannot be read as a pass or a fail: a reader has to know which findings are expected before the exit status means anything.

## Problem

- **Six findings stand in one entry point.**
  `gitnexus/gitnexus-cli/SKILL.md` holds five command specifications, which the guidelines bar from an entry point, and one inline bold lead of 119 characters against the 100-character limit.
- **The exit status is unusable over the whole set.**
  The check exits 1 whenever any skill reports, so a session that runs it over every skill reads a non-zero exit that says nothing about the change it just made. Delivery sessions work around it by reading the findings and matching them against a remembered baseline.
- **Nothing states whether these skills are in scope.**
  The shared guidelines say every change to a skill follows them, and `skills/` holds gitnexus beside the two skills written to them. Whether the six findings are work or noise is unrecorded.

## Proposal

- **Decide the scope of the shared guidelines, and record it.**
  Either the gitnexus skills are in scope, and the six findings are fixed, or they are out of scope and the check's roots say so.
- **Make the whole-set run readable.**
  A run over every skill either reports nothing, or the skills it does not measure are named where the check is invoked rather than in a session's memory.

## Acceptance Criteria

- [ ] **AC1.** A run of `skills/scripts/check_skill_files.py` over every skill in `skills/` reports no finding.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) — what a skill's files follow, and the Verified rule that requires the check to report nothing.
- **R2.** [Section rule test evidence](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-1354-i11-e12-w16-the-section-set-binds/tests.md) — the six findings, measured before and after the section rule widened.

Assisted-by: AI <noreply@ai-assistant>


