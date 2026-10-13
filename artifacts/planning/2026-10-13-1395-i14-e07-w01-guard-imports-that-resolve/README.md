# Guard Imports and Pinned Paths — October 2026

> Delivery · Created 2026-10-13

## Executive Summary

I14:E07 W01 and W02 share one pull request. W01 makes the role-barred-calls guard import names `src/loaders/core-ops.js` exports, so `tsc -p tsconfig.tools.json` completes and `tests/role-barred-calls-guard.test.ts` loads and reports on its cases. W02 asserts the walk-protocol declarations over a workflow the corpus resolves, and extends `pinned-corpus-paths` to the spelling that let a retired pin reach the suite as a file-system error.

Both instruments fail on an untouched checkout, so neither reports on anything else it covers. Until they are green, a reviewer reading the tools typecheck or the suite learns nothing about the change in front of them, and the class of defect each guard exists to catch passes unmeasured.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W01](w01.md) | Guard imports that resolve |
| [W02](w02.md) | A walk test reading a path that resolves |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I14:E07 Red Trunk](https://github.com/m2ux/workflow-server/issues/1395) |
| W01 issue | [I14:E07:W01 Guard Imports](https://github.com/m2ux/workflow-server/issues/1283) |
| W02 issue | [I14:E07:W02 Pinned Paths](https://github.com/m2ux/workflow-server/issues/1276) |
