# Schema Hygiene Conformance

Live evidence for the session status, a declared checkpoint's yield, a bare `technique::rule` reference, a borrowed activity, the numeric gate comparison, and an immediate exit reaching a resumed worker.

`probe` binds the local `hygiene-probe` technique and names its `local-marker` rule by a bare reference. `dispatch` is borrowed from the minimum viable workflow. `gate-exit` runs two gated probes and stops at `stop-here`, whose `halt` option takes an immediate exit ahead of the `after-gate` step.

Walk it as `workflow_id: schema-hygiene-conformance`.

## Cases

- **Status.** The session reads `active` in an activity, `blocked` while `stop-here` is open, and `completed` once `gate-exit` takes its exit to `__terminal__`.
- **Declared yield.** `stop-here` yields by id alone. The same id carrying a `message`, or `options`, is refused.
- **Bare rule.** The `probe` bundle carries `local-marker` as a resolved rule, not an unresolved reference.
- **Borrowed activity.** `dispatch` is delivered from the minimum viable workflow, its bare routine reference resolving there, and its exit is bound in this workflow's graph.
- **Numeric gate.** `flag_on` is a boolean, so `flag_on > 0` answers false and `numeric-flag` is not bundled; `unit_count > 2` answers true and `numeric-count` is.
- **Immediate exit.** Answering `stop-here` with `halt`, `resume_checkpoint` returns the `halted` exit with `ends_activity`, the worker runs no `after-gate`, and a replayed yield of `stop-here` in the same visit returns the same exit. `get_workflow_status` names `stop-here` and `halt` as the last answer.

## Copying from it

Take this when a live instance needs to show a checkpoint answer ending its activity, a borrowed activity, or a gate comparing a non-number. Each case holds one construct. A second checkpoint, a loop or a fan belongs on a different specimen.
