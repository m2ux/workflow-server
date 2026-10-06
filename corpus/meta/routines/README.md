# Meta Routines

> Part of [meta](../README.md)

What this folder holds, and what each member contributes. The order work runs in belongs to whatever binds them, not to this index.

| Routine | Reached for |
|---|---|
| [`activity-loop`](activity-loop.yaml) | Walk a session activity by activity until it reaches the terminal |
| [`continue-entry`](continue-entry.yaml) | Advance once, continue the worker that holds the batch, and open a replacement when the continuation is not an accepted envelope |
| [`dispatch-entry`](dispatch-entry.yaml) | Persist entering, advance, announce, and open one worker |
| [`resume-entry`](resume-entry.yaml) | Continue a yielded worker with its checkpoint reply, and open a replacement when that continuation is not an accepted envelope |
| [`dispatch-round`](dispatch-round.yaml) | Compose one brief per work unit, dispatch the briefs one at a time inside the calling worker, and gather the returns against an expectation list |
| [`persist-activity`](persist-activity.yaml) | Mark a completed activity, commit its source changes and engineering artifacts, push the engineering commit, and emit the run status once that push is on the remote |
| [`persist-entering`](persist-entering.yaml) | Write the in-progress Progress mark, commit the planning README once, and push that commit before any spawn |
| [`open-worker`](open-worker.yaml) | Compose a stub for a fresh worker identity and spawn one agent with it |
| [`continue-worker`](continue-worker.yaml) | Compose a stub for a worker that already holds deliveries and continue its harness agent |
| [`open-branches`](open-branches.yaml) | Compose one stub per branch and emit them in one turn |
| [`finish-activity`](finish-activity.yaml) | Read the activity's exit destination and fold it into the activity_complete envelope |
| [`ensure-readme`](ensure-readme.yaml) | Measure the planning README, and seed it where it is absent |
