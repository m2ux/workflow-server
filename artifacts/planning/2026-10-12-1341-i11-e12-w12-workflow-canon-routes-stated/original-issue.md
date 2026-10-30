# Original Issue

> [Prose Routes: Canon Routes Stated as Steps](https://github.com/m2ux/workflow-server/issues/1341) · opened 2026-10-12 · closed

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E12:W12] Prose Routes: Canon Routes Stated as Steps` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | closed |
| Assignee | m2ux |

## Body

## Overview

The shared skill-file check finds a procedure by its numbered steps, which is the form the shared guidelines give one. Workflow Canon states several of its routes as prose — `audit-dispatch.md`'s Dispatch Route names three commands in a sentence — so those sections call nothing the check can see, and twelve specifications whose only caller is such a route are unmeasured. Stating each route as numbered steps makes the call visible and the placement measurable.

## Problem

- **A route stated as prose runs commands the check cannot count.**
  [`audit-dispatch.md#dispatch-route`](https://github.com/m2ux/workflow-server/blob/fb53546f/skills/workflow-canon/references/audit-dispatch.md#L19-L21) reads "Use Plan Audit Assignments, Bind Audit Agent, then Write Audit Packet", which is a procedure in every sense but its form.
- **Twelve specifications lost their only caller.**
  Over `skills/workflow-canon`, `canon-context.md` falls from eight findings to two and `change-surface.md` from six to none. Each dropped specification was cited from `walk-rules.md`, `coverage.md`, `canon-map.md`, `definition-scope.md` or `audit-dispatch.md` alone.
- **The silence is indistinguishable from correct placement.**
  Zero callers is the state of a specification no procedure runs, which stands where it is. A specification one prose route runs reads the same way, so a criterion resting on what the check reports over Workflow Canon measures less than it names.

## Proposal

- **Each route becomes numbered steps.**
  A section that tells the reader which commands to run, in what order, states them as a numbered procedure, so its calls are readable by a reader and countable by the check.
- **The placement is then measured, not inferred.**
  With the routes stated as steps, the check reports each specification standing away from the procedure that runs it, and the move has a scope it can be checked against.

## Acceptance Criteria

- [x] **AC1.** Every Workflow Canon section that directs the reader to run commands in order states them as numbered steps, as the shared skill-file check counts that section among the callers of each command it names.

## References

- **R1.** [Planning record for the caller test](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-12-1336-i11-e12-w09-every-citing-file-read) — the finding counts per file at each revision, and the files whose sections state routes in prose.

