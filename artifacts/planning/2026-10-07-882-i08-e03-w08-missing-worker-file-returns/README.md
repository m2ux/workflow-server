# Missing Worker File Returns to Its Worker — October 2026

> Planning record · Created 2026-10-07

## Executive Summary

I08 E03 W08 makes the shared output-files check act on what it finds: a missing expected worker file is re-dispatched to the worker that owns it, rather than reported and left. Both audits that bind `orchestration-patterns::verify-output-files` get that behaviour from the one operation.

AC2 is observed by the corpus guard suite over the bound sites, with a walk that shows the re-dispatch reaching the owning worker.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [w08.md](w08.md) | The work item for this task |

## Links

| Resource | Link |
| --- | --- |
| Epic [I08:E03] Support Libraries | https://github.com/m2ux/workflow-server/issues/882 |
| Initiative [I08] Shared Libraries | https://github.com/m2ux/workflow-server/issues/946 |
