# Checkpoint Dismissal Retired from the Response Tool — October 2026

> Work item · Created 2026-10-07

## Executive Summary

`respond_checkpoint` accepts exactly one of `option_id` or `auto_advance`. No schema description, tool description, or loader message describes dismissing a checkpoint or says which gate field confers dismissal. No `condition_not_met` input, `__condition_not_met__` record, or `dismissed` response field remains.

The corpus no longer carries a structured condition that dismissed a checkpoint. This task removes the server surface that still spoke as if that dismissal existed, so a caller cannot record an outcome the gate no longer produces.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W03](w03.md) | The work item: the two inputs that resolve a checkpoint, the option the answer records, and the checks that dismissal is gone from the response tool |

## Links

| Resource | Link |
| --- | --- |
| [I04:E05] Inline Gates | https://github.com/m2ux/workflow-server/issues/750 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
