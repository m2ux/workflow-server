# Original Issue

> Review Changes: Prose Measured Against the Branch It Fronts · issue #1402 · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W23] Review Changes: Prose Measured Against the Branch It Fronts` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

A review pull request's body is written across many sessions: each unit that merges into the epic base adds its own bullet under Changes and its own pull request under References. Sync Epic measures the References against the merges and reports a difference naming both sets. Nothing measures Changes, and a bullet written by one unit stands unrevised when a later unit makes it false.

## Problem

- **The procedure appends and never revises.**
  [Review Pull Request](https://github.com/m2ux/workflow-server/blob/i11/e12/workspace/skills/work-planner/references/work-breakdown.md#L178) says the merging session adds its unit's change under Changes and its pull request under References. No step asks whether the change contradicts a bullet already standing.
- **Only one of the two sections is measured.**
  [`review_references`](https://github.com/m2ux/workflow-server/blob/i11/e12/workspace/skills/work-planner/scripts/sync.py#L351-L355) compares the pull requests a review body cites with those merged into its base. It reads the References section alone, so Changes is unmeasured prose in a body a reviewer is asked to trust.
- **Two bullets of #1321 were false for two units.**
  Its Changes claimed forty-four specifications stood with their procedures and thirty-four remained in the catalog. A census at the branch head reports forty-nine and twenty-nine; #1391 moved five between them and neither number was revisited.
- **A bullet contradicted a reference in the same body.**
  Changes stated that Work Planner's execution conventions were a file of their own, `command-conventions.md`. R11 of the same body stated that they stand in the entry point, which #1360 delivered. The file named belongs to the sibling skill.
- **A count in a body is a measurement with no date.**
  The skill already requires that [a count comes from a command's output](https://github.com/m2ux/workflow-server/blob/i11/e12/workspace/skills/work-planner/SKILL.md#L189). It does not say where a count may be recorded, so one taken correctly at one merge reads as current at the next.

## Proposal

- **A path a Changes bullet names is measured against the branch.**
  Sync Epic reports a review pull request whose Changes names a file absent from the head of the base it fronts, naming the path. This is the part of the prose that can be checked, and it catches the class the `command-conventions.md` bullet fell into.
- **Changes carries no count of the corpus.**
  A bullet states what the branch does, not how many of something it has. Counts belong in the unit's planning record, where they carry the revision that produced them and no later reader mistakes them for current.
- **The merging session reads the bullets its change contradicts.**
  Update Review Pull Request states that the session restates any standing bullet its unit makes false, rather than only appending its own.

## Acceptance Criteria

- [ ] **AC1.** Sync Epic reports a review pull request whose Changes section names a file absent from the head of the base it fronts, naming that path, as the script's own test suite shows against a specimen body carrying one.
- [ ] **AC2.** The Review Pull Request rule states that a Changes bullet carries no count of the corpus, as a read of that rule shows.
- [ ] **AC3.** Update Review Pull Request states that the merging session restates each standing bullet its unit's change makes false, as a read of that specification shows.

## References

- **R1.** [Catalog listing census](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-13-1319-i11-e12-w17-catalog-listings) — where the specifications of one skill stand, measured at the branch head, which is what the two counts disagreed with.

