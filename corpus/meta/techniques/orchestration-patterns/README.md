# Orchestration Patterns

> Part of [techniques](../README.md)

Shared Inputs, Outputs, and domain invariants for mid-phase multi-agent orchestration patterns.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`assess-research-gaps`](assess-research-gaps.md) | Judge whether synthesis (and gathered results) leave material gaps against the goal, and optionally emit follow-up work units |
| [`classify-request`](classify-request.md) | Classify the goal against a fixed lane roster and select exactly one lane — the routing half of supervisor |
| [`compose-worker-briefs`](compose-worker-briefs.md) | Compose an ordered worker-briefs array from work units — one brief per unit under the same brief rules as the single-unit compose op |
| [`decompose-work-units`](decompose-work-units.md) | Analyse the goal (and optional context) into an ordered work-units list |
| [`dispatch-workers`](dispatch-workers.md) | Dispatch an ordered set of worker briefs one at a time, inside the calling worker, and return harness results in input order |
| [`execute-plan-step`](execute-plan-step.md) | Execute one current step from an execution plan and record its result, signalling whether the plan still holds |
| [`gather-results`](gather-results.md) | Build an ordered keyed collection from dispatched worker outputs and a completeness manifest against the expected work-unit (or brief) ids |
| [`invoke-as-tool`](invoke-as-tool.md) | Run one bounded sub-agent behind a function-shaped boundary and return only the tool result (agent-as-tool) |
| [`plan-research-questions`](plan-research-questions.md) | Turn a research goal into parallel research questions as work units — the plan half of lead-researcher |
| [`plan-steps`](plan-steps.md) | Produce an inspectable ordered execution plan of steps for the goal — the plan half of plan-and-execute |
| [`replan`](replan.md) | Revise the execution plan in light of the replan reason and prior step results, producing a new plan for remaining work |
| [`synthesise-results`](synthesise-results.md) | Combine gathered results into a single synthesis under caller-supplied criteria — the consolidate step every scatter ends in, whether the units ran in one worker or in branches of their own |
| [`verify-output-files`](verify-output-files.md) | Confirm every expected output file persisted into the planning folder, re-dispatching the worker whose file is missing |
