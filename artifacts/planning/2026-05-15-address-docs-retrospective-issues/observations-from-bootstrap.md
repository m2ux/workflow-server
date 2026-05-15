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

## 2. Sub-agents lack the `Task` primitive — workflow-orchestrator can't spawn its own worker

**Symptom:** When the meta-orchestrator spawned the `work-package` orchestrator (a depth-1 sub-agent) and that orchestrator tried to spawn a worker for `start-work-package` via `harness-compat::spawn-agent`, the spawn failed: depth-1 sub-agents in this Claude Code harness do not have access to the `Task` tool. The orchestrator's only option was to emit the composed worker prompt as text and ask the parent (meta-orchestrator) to perform the actual dispatch.

**Effect on the workflow:** The `harness-compat::spawn-agent` operation's `foreground-always` rule states "Background dispatch silently breaks checkpoint delivery" — but the harness reality is stricter: foreground spawn is only available at the top orchestrator depth. In practice this means the `dispatch-client-workflow` meta-activity's pattern (spawn client orchestrator → client orchestrator runs activity loop → mediate checkpoints) collapses into "meta-orchestrator runs the activity loop itself, including transitions on the client session," with all the rule violations that entails (e.g., calling `next_activity` on the client session from outside a client orchestrator agent).

**Suggested fix shape:**
- Document the depth constraint explicitly in `harness-compat::spawn-agent` so future workflow authors don't design around the assumption that sub-agents recursively spawn.
- Either (a) collapse `meta` and the client workflow orchestrator into a single agent (meta runs the client loop inline), or (b) define a different harness primitive — for example, a "checkpoint-bounded continuation" where the meta-orchestrator hands control to the worker prompt directly, no intermediate orchestrator agent.
- Audit `workflow-engine` operation procedures that implicitly assume nested orchestrator agents and rewrite them for a single-agent loop.

This finding may be the more important of the two — it indicates the orchestrator/worker layering currently in the meta workflow doesn't match what the harness actually supports.
