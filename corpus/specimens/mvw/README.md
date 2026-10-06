# Minimum Viable Workflow

The live sidecar's first walk: one orchestrator, one activity, one routine, one technique.

A miss here is a miss on the instance.

Walk it as `workflow_id: mvw`, through to `__terminal__`.

## What the walk checks

Five readings, each of which an instance can fail while every call still answers `ok`.

| Reading | Taken from | What a miss means |
|---|---|---|
| The open reports its opening activity, what the session stands on, and its lifecycle state | the `start_session` response | Every bootstrap is blind: nothing else tells an opener which activity to advance onto, or whether it has already been there |
| The dispatch was served every technique its activity binds as a step | `{unserved_applications}` on the dispatch | A technique that never arrived is improvised past rather than refused, so executing proves nothing about the contract |
| The step output reached the bag | `inspect_session { view: "variables" }` after the terminal advance | The manifest is accepted and discarded, so every value a walk produces is lost between the worker and the session |
| The advance was traced | `get_trace` after the advance | The trace is silently short, and anything resolving a run from it reports a walk that did not happen |
| The session completed | `inspect_session { view: "activities" }` after the terminal advance | The instance can dispatch but not finish, which no dispatch-only walk can tell apart from success |

The last four are the walker's own readings rather than the activity's: a worker sees its own
delivery and nothing else of the session.

## Copying from it

Take this when a live instance needs a cheap dispatch that still loads a routine and a technique. This specimen holds one of each. Extra activities, loops, fans, checkpoints or a second technique belong on a different specimen.
