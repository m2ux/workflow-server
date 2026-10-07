# Continue-Batch Only Continues — October 2026

> Work item · Created 2026-10-07

## Executive Summary

Continue-batch is the operation that acts on the batch reading. It advances the activity pointer, and it does not mint a replacement worker. When that continue fails, or the reading refuses the next activity, the replacement is a dispatch, and it happens only after the spent identity is released.

W02 left the batch reading as the only answer a worker is given. This task is the operation that obeys it: an advance that stays an advance, and a replacement that is a new dispatch rather than a second worker minted on the way through.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W03](w03.md) | The work item: the mint inside the advance, the design that leaves the advance as an advance, the two-half delivery and its merge order, and the test named for each criterion. |

## Links

| Resource | Link |
| --- | --- |
| [I04:E03] Worker Continuation | https://github.com/m2ux/workflow-server/issues/710 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
