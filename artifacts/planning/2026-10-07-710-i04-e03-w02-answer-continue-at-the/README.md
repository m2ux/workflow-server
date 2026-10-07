# Answer Continue at the Boundary — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A worker that finishes an activity has to be told whether to carry the next one or hand back, and today that answer reaches it from two places: the batch reading on `next_activity`, and a continue field on the completion envelope. Two sources for one decision is a decision that can disagree with itself, and the envelope's copy is the one no caller is obliged to keep current.

This work makes the batch reading the only answer. The completion envelope stops carrying a continue field, so a worker reads its standing from the call that knows it, and a stale envelope can no longer send a context on past the point its budget allows.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E03] Worker Continuation | https://github.com/m2ux/workflow-server/issues/710 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
