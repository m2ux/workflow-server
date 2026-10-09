# A Project Names Its Own Long-Lived Branches — October 2026

> Work item · Created 2026-10-09

## Executive Summary

Work Planner decides which branches an epic's work may reach, and which bases a unit is delivered on, from a set of long-lived branch names. That set is read today as the subfolder names of a `.project` directory in the main working tree. The directory is not reserved for branch names, so a project using it for component checkouts is answered confidently and wrongly, and a linked worktree, which holds no such directory, has no path that answers at all.

This work moves the set to a statement the project owns, `config/branches`, resolves a linked worktree through its main working tree, and reports the set unevaluable where no statement and no integration branch names a branch. Until it lands, an epic's closability is settled against branches that may not exist, and a unit's session must be handed the main working tree by hand.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Work Item](work-item.md) | The task, its criteria, the design and the tests that observe each criterion |

## Links

| Resource | Link |
| --- | --- |
| Task issue | [#1262](https://github.com/m2ux/workflow-server/issues/1262) |
| Parent epic | [#1176](https://github.com/m2ux/workflow-server/issues/1176) |
| Evidence | [midnight-agent-eng#80](https://github.com/shieldedtech/midnight-agent-eng/issues/80) |
