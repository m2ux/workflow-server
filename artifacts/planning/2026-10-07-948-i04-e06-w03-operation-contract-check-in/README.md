# Operation-Contract Check in the Sweep — October 2026

> Work item · Created 2026-10-07

## Executive Summary

`check-operation-contract` runs in the standard sweep. The guard registry holds no entry that exempts it. A declaration that calls a structure a scalar is then a finding of the sweep, not a check someone has to remember to run.

W02 settled the contracts the check reports on and showed the check is empty on that corpus. Until the sweep runs it, a later edit can put the class back and the sweep stays green. This task is the check taking its place in that sweep.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W03](./w03.md) | The work item: what the task delivers, the friction it answers, the design, and the parts of the work |

## Links

| Resource | Link |
| --- | --- |
| [I04:E06] Declared Shapes | https://github.com/m2ux/workflow-server/issues/948 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
