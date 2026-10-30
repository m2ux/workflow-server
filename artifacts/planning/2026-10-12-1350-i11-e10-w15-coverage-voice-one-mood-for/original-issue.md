# Original Issue

> [Coverage Voice: One Mood for Parallel Selections](https://github.com/m2ux/workflow-server/issues/1350) · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W15] Coverage Voice: One Mood for Parallel Selections` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

`skills/workflow-canon/references/coverage.md` states what coverage a kind of change requires in four parallel sections. Three of them say so in the third person and one says so as a command to the reader, and nothing in the file distinguishes the two. A reader following the imperative one runs the commands it names; a reader following its siblings selects observations. Settling the file on one voice makes the selection readable as a selection, which is the distinction the step rule leaves to the prose.

## Problem

- **One file states the same kind of thing in two moods.**
  [`## Main Coverage`](https://github.com/m2ux/workflow-server/blob/d1dea57e/skills/workflow-canon/references/coverage.md#L80-L82) reads "Install Engine Dependencies, Run Engine Checks and Run Delivery Gate establish the baseline", and [`## Docker Coverage`](https://github.com/m2ux/workflow-server/blob/d1dea57e/skills/workflow-canon/references/coverage.md#L115-L117) reads "Check Shell Syntax for changed helpers and Validate Compose with disposable paths". Both select the coverage a kind of change requires.
- **The imperative section carries words that read as an order of work.**
  Its *then* and *after* state that one command depends on another, and an imperative sentence carrying *then* is what a route looks like. A reader cannot tell a dependency from an instruction here.
- **The step rule does not reach this.**
  A section calls the commands it names where its author wrote them as steps, so none of these four calls anything. The rule makes the file's silence correct and leaves the ambiguity in the prose it does not read.

## Proposal

- **The four coverage sections take one voice.**
  Each states what the commands establish for the kind of change it names, as `## Main Coverage` and `## Workspace Coverage` already do, so the file reads as a selection throughout.
- **A dependency between commands is stated as one.**
  Where an image must be built before a container can be exercised, the sentence says that, rather than leaving *then* to carry it.
- **A section that does direct the reader states numbered steps.**
  Should any of the four turn out to be a route, it becomes a procedure under the shared rule rather than keeping an imperative sentence.

## Acceptance Criteria

- [ ] **AC1.** Every top-level section of `skills/workflow-canon/references/coverage.md` that selects coverage states what its commands establish rather than instructing the reader to run them, and any section that does instruct the reader states its commands as numbered steps.

## References

- **R1.** [Planning record for the Workflow Canon routes](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-1341-i11-e12-w12-workflow-canon-routes-stated) — the survey that judged each of these sections, and the reason `## Docker Coverage` was left as prose.

