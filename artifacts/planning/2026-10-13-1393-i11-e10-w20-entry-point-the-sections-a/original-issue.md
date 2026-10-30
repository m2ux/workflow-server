# Original Issue

> Entry Point: The Sections a SKILL.md Takes, Measured · issue #1393 · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W20] Entry Point: The Sections a SKILL.md Takes, Measured` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

A skill's entry point has a named structure in the shared guidelines — Opening, Modes, Rules, Dependencies and Commands — and no check measures it. The section rule that binds every file carrying a procedure passes SKILL.md over for exactly that reason, so the one file every reader opens first is the one file whose shape nothing holds.

## Problem

- **Three entry points carry sections no rule names.**
  `gitnexus/gitnexus-cli/SKILL.md`, `gitnexus/gitnexus-guide/SKILL.md` and `server-in-the-loop/SKILL.md` carry numbered steps and headings such as After Indexing, Troubleshooting, Typical flow and Trees under test. Widening the section rule to every file carrying a procedure reported 21 findings against them before SKILL.md was excluded.
- **The exclusion is stated in the check, not measured.**
  The check passes SKILL.md over because the guidelines name a different structure for it. Nothing then reads the entry point against that structure, so the exclusion removes a measurement rather than deferring it.
- **An entry point decides whether a skill loads at all.**
  Its description and its Modes list are what a session reads before anything else, and a departure there costs every mode.

## Proposal

- **Measure the entry point against the structure the guidelines give it.**
  The shared check reads SKILL.md's top-level sections against the named set for an entry point, as it reads a procedure file against the procedure-file set.
- **State the set as a set.**
  The guidelines' SKILL.md structure section names its sections as prose about each one. It names them as a set and an order, so a check can read it and an author can place a heading by reading it.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports a SKILL.md whose top-level sections depart from the set the shared guidelines name for an entry point, or from their order, as the check's own test suite shows.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) — SKILL.md structure, and the procedure-file section set that cites it.
- **R2.** [Section rule work item](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-1354-i11-e12-w16-the-section-set-binds/w16.md) — where the set did not fit, and why the entry point is excluded by name.

Assisted-by: AI <noreply@ai-assistant>


