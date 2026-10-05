# Meta Routines

> Part of [meta](../README.md)

What this folder holds, and what each member contributes. The order work runs in belongs to whatever binds them, not to this index.

| Routine | Reached for |
|---|---|
| [`activity-loop`](activity-loop.yaml) | Walk a session one activity at a time — enter the current activity and carry it, answer any checkpoint it yields, commit what it produced, and advance onto what its exit routes to — until… |
| [`dispatch-round`](dispatch-round.yaml) | Compose one brief per work unit, dispatch the briefs one at a time inside the calling worker, and gather the returns against an expectation list |
| [`persist-activity`](persist-activity.yaml) | Mark a completed activity, commit its source changes and engineering artifacts, push the engineering commit, and emit the run status once that push is on the remote |
