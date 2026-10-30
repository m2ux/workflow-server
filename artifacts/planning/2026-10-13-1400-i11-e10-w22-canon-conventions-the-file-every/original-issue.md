# Original Issue

> [Canon Conventions: The File Every Mode Opens a Second Time](https://github.com/m2ux/workflow-server/issues/1400) · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W22] Canon Conventions: The File Every Mode Opens a Second Time` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The Workflow Canon skill keeps its execution conventions in `references/command-conventions.md`, a file every mode is told to open before its first command specification. The sibling skill moved the same content into its entry point, on the measured grounds that a mode reaching conventions should open no file it would not otherwise open. The same file also holds a command specification the placement rule cannot see. This task brings the conventions to where a mode already is, and places the specification by the rule.

## Problem

- **Every mode pays a file open for the conventions.**
  `SKILL.md` instructs the reader to open `references/command-conventions.md` before the first command specification, and `review-mode.md`, `revise-mode.md` and `canon-context.md` each cite it again. Selecting a mode already opens `SKILL.md`; the conventions cost a second file.
- **The sibling skill states them in its entry point.**
  Work Planner's conventions are a section of its `SKILL.md`. Two skills under one set of guidelines answer the same question differently, and only one of the two answers rests on a measurement.
- **The file holds a command specification the rule cannot see.**
  `Run Project Check` is a level-2 heading in a file titled `Command Conventions`. A specification is a level-3 heading under a `## Commands` section or inside a catalog, so this one is neither counted nor placed.
- **It has exactly one procedure-caller.**
  Measured through the shared check's `citations()` over `skills/workflow-canon`: `common` and `run-project-check` are each cited by `canon-context.md`, `review-mode.md` and `revise-mode.md`, and `run-project-check` is run by the procedure of `review-mode.md` alone. Under the placement rule it would move there, were the rule able to read it.

## Proposal

- **The conventions stand in the entry point.**
  `## Common` becomes a section of `skills/workflow-canon/SKILL.md`, the one file every mode opens to select itself, so a procedure reaching the conventions opens no further file.
- **The specification is placed by the rule, not by the file it sits in.**
  `Run Project Check` has one procedure-caller, so it goes to `review-mode.md` under the rule the epic already states. The citations from `revise-mode.md` and `canon-context.md` are read against the caller test first, since a citation is not a run.
- **The conventions file goes.**
  With both its sections placed, nothing remains for it to hold, and the instruction to open it goes with it.

## Acceptance Criteria

- [ ] **AC1.** The Workflow Canon execution conventions stand where a mode reaching them opens no file it would not otherwise open, as a retrieval walk over each of that skill's modes records.
- [ ] **AC2.** Every command specification the Workflow Canon skill states that one procedure runs stands in that procedure's file, whatever heading level or file title holds it, as the shared skill-file check reports over that skill's files.

## References

- **R1.** [Shared skill guidelines](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) — the command placement rule and the section set both facets are read against.
- **R2.** [Retrieval walk over each mode](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-13-1319-i11-e12-w11-disclosure-verification-over-each) — the measure behind moving the sibling skill's conventions, and the per-mode counts it produced.

