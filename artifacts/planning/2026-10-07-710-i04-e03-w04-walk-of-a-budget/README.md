# Walk of a Budget Spent After Open — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A batched dispatch can open an activity and only then spend the fetch budget, on lazy reads the activity makes after it has started. The walk this task adds shows that case yielding a respawn: the context that opened the activity does not continue into the next one.

The bound is what the advance counts, and a fetch that happens after open is part of that count. A continue taken from a reading made before those fetches would carry a context past the point its budget allows, which is the fault this walk is there to catch.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E03] Worker Continuation | https://github.com/m2ux/workflow-server/issues/710 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
