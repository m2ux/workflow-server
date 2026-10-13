# A Verify Step That Reports Without Gating — October 2026

> Delivery · Created 2026-10-13

## Executive Summary

I14:E07 W03 stops one check in `verify.yml` deciding whether the others run. The definitions-call-the-tools step runs ahead of the suite and the delivery-cost gate, so a failure there leaves both skipped and the pull request carries no test result at all. The step reports its own pass or fail as a check of its own, and the suite and the gate run whatever it concludes.

The step measures the corpus against the tools the engine registers, and each side moves independently of the change under review. A pull request against `main` is paired with the `workflows` tip and one against `workflows` with the `main` tip, so drift on either side blanks out the results a reviewer reads. An undeclared `start_session` argument held the suite and the gate skipped on every pull request from 2026-10-07 to 2026-10-09.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W03](w03.md) | A verify step that reports without gating |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I14:E07 Red Trunk](https://github.com/m2ux/workflow-server/issues/1395) |
| W03 issue | [I14:E07:W03 Verify Gate](https://github.com/m2ux/workflow-server/issues/1277) |
