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

## 2. Sub-agents lack the `Task` primitive — IN SCOPE (un-retracted 2026-05-15)

Earlier in this work package this observation was retracted on the hypothesis that workers could be spawned at depth ≥ 1 if the `subagent_type` had `Task` in its allowed-tools list, and that the bootstrap failure was a per-subagent-type configuration issue rather than an architectural one. That hypothesis was wrong.

**Reproducer (run 2026-05-15):** `Agent({ subagent_type: "general-purpose", prompt: "report your tool list and attempt to spawn a sub-agent" })`. The depth-1 sub-agent reported its tool list as `Bash, Edit, Read, ShareOnboardingGuide, Skill, ToolSearch, Write` plus various MCP and utility tools, with **no Task or Agent tool** in either the directly-loaded set or the deferred-tool set.

**Authoritative confirmation (claude-code-guide, 2026-05-15):** sub-agents cannot spawn further sub-agents in any Claude Code harness. The Task/Agent tool is a session-control primitive gated at the harness level, not a permissionable tool, so adding it to a custom subagent's `allowed-tools` list does not enable nested spawning. The limit applies across CLI, IDE extensions, and the web app. Documented in Claude Code's [subagents](https://code.claude.com/docs/en/sub-agents.md) and [parallel agents](https://code.claude.com/docs/en/agents.md) docs — neither references multi-level hierarchies. Recommended primitives for hierarchical delegation are Agent View and the experimental Agent Teams.

**Operational evidence in this work package:** every activity dispatch in this conversation succeeded only when the meta orchestrator spawned the worker directly. When the meta orchestrator spawned a work-package orchestrator as a depth-1 sub-agent and asked it to dispatch its own worker, the work-package orchestrator returned text reporting it had no spawn primitive and asked the meta orchestrator to perform the dispatch on its behalf. The pattern of "meta spawns client orchestrator → client orchestrator spawns worker" was never functional in this run.

**Consequence:** the meta workflow's `dispatch-client-workflow` activity, as currently written, is architecturally incompatible with Claude Code. It must be revised so that one orchestrator agent drives all orchestrator-level work across all session levels, and each activity dispatches a fresh worker that lives only for that activity. The server-side session model (parent meta session + `triggeredWorkflows[]` lineage) remains valid — only the agent model collapses.

**Suggested fix shape:**

- `workflows/meta/skills/07-harness-compat.toon::spawn-agent` — add a rule documenting that `Task` is a harness-level session-control primitive available only to the calling agent; spawned agents do not inherit it. Spawn operates depth-1 only.
- `workflows/meta/skills/00-workflow-engine.toon::handle-sub-workflow` — drop the `spawn-agent` step. After `dispatch_child` returns the child `session_index`, the calling orchestrator drives the child workflow's activity loop directly using the existing activity-loop operations.
- `workflows/meta/skills/00-workflow-engine.toon::bubble-checkpoint-up` — delete. With no sub-agent orchestrator there is nothing to bubble between; the orchestrator presents checkpoints to the user directly.
- `workflows/meta/skills/00-workflow-engine.toon::extract-checkpoint-handle` — delete. With no orchestrator sub-agent text output to parse, this is obsolete.
- `workflows/meta/skills/00-workflow-engine.toon::handle-workflow-complete` — delete. No orchestrator sub-agent text result to apply.
- `workflows/meta/activities/03-dispatch-client-workflow.toon` — rewrite. The two-step "compose-orchestrator-prompt → dispatch-orchestrator" pattern plus the checkpoint-yield loop around an orchestrator sub-agent is replaced with a single activity loop over the client workflow's activities, using `dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `present-checkpoint-to-user`, `respond-checkpoint`.
