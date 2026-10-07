# Shared-Operation Guard Over Directly Bound Operations — October 2026

> Planning record · Created 2026-10-07

## Executive Summary

I08 E03 W07 gives the corpus a guard that fails when an operation more than one workflow binds directly, with the same outputs, sits outside a shared library. The guard is what keeps the hoists this epic made from being undone by the next workflow that re-teaches a call.

AC8 is observed by the guard's own fixtures: a seeded duplicate outside a library fails, and the same operation inside one passes.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [w07.md](w07.md) | The work item for this task |

## Links

| Resource | Link |
| --- | --- |
| Epic [I08:E03] Support Libraries | https://github.com/m2ux/workflow-server/issues/882 |
| Initiative [I08] Shared Libraries | https://github.com/m2ux/workflow-server/issues/946 |
