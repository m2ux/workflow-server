# Observations from bootstrap

Issues observed while running this work-package's own bootstrap (start-work-package → design-philosophy). They are NOT from the driving retrospective; they emerged from executing the workflow on 2026-05-15. Captured here so plan-prepare can decide whether to fold them into this work package's scope or spin them out.

## 1. `design-philosophy/classification-confirmed` checkpoint renders templated literals

**Symptom:** The checkpoint's message field is
`"Based on my analysis, this appears to be a {problem_type} with {complexity} complexity. Confirming in 30s unless you intervene."`
When the checkpoint was presented, the message arrived at the meta-orchestrator with `{problem_type}` and `{complexity}` unsubstituted — i.e., literal braces in the user-facing prompt — because the activity reaches the checkpoint without setting those two variables on session state.

**Root cause (suspected):** The activity definition has no step that writes `problem_type` and `complexity` to session variables before the checkpoint. The classification step exists conceptually (the worker reasoned about it) but does not persist to state via any tool surface the worker has at that point. The checkpoint's options also don't carry effects that set these variables.

**Constraint compounding the bug:** After a checkpoint becomes active, ALL authenticated workflow-server tools are gated on it (calls return "active checkpoint blocks ..."). `yield_checkpoint`'s schema accepts no `variables` field, so a worker that realizes mid-yield it hasn't set the variables can't fix it. The orchestrator can `respond_checkpoint`, but the option `effect.setVariable` is the only variable-setting surface available there, and the current option list doesn't use it for these two variables.

**Suggested fix shape:**
- Add explicit steps to `design-philosophy` that write `problem_type` and `complexity` before the checkpoint yields. The current taxonomy/enums (if any) should be elevated from the worker's prose into the activity definition so substitution is deterministic.
- Alternative: change the checkpoint message to not use template variables and instead let the worker emit a structured summary that the orchestrator passes to AskQuestion verbatim.
- Defensive: make `yield_checkpoint` accept an optional `variables` payload so workers can atomically set state + yield, closing the gap permanently.

## 2. ~~Sub-agents lack the `Task` primitive~~ — RETRACTED (2026-05-15)

The original observation here claimed depth-1 sub-agents could not spawn workers via `harness-compat::spawn-agent`, and proposed documenting a depth constraint plus an architectural collapse of meta + client orchestrators.

**This was incorrect.** Workers CAN be spawned as foreground tasks from depth ≥ 1 in this Claude Code harness. The bootstrap failure that prompted the original write-up was not a depth limit. The most likely actual causes are configuration-side, not architecture-side:

- The `subagent_type` used for the spawned client orchestrator did not include the `Task` tool in its allowed-tools list.
- The agent prompt did not pass the expected Task primitive through correctly.

These are per-subagent-type harness/permission configuration concerns, not workflow-content concerns. No `harness-compat::spawn-agent` doc edit is required; no `workflow-engine::dispatch-activity` inline-fallback note is required; the `dispatch-client-workflow` meta-activity's spawn-orchestrator → orchestrator-spawns-worker pattern is supported by the harness.

If a follow-up is needed, it is to ensure whichever subagent type runs the client orchestrator is configured with Task. That is out of scope for this work package, which is workflow-content only.
