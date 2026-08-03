# Hierarchical Dispatch Model

The Workflow Server utilizes a **Hierarchical Dispatch Model** to execute workflows. This architecture leverages multi-agent delegation, where specialized agents spawn sub-agents to handle specific scopes of work, ensuring clear boundaries between high-level user interaction, workflow state management, and low-level task execution.

The model is host-agnostic: any IDE or agent harness that supports spawning background sub-agents can drive it (Cursor's `Task` tool is one such mechanism). For environments without sub-agent support, see "Environment Considerations" at the bottom of this document.

## The Three Layers of Orchestration

### 1. Meta Orchestrator (Level 0)
- **Role:** The user-facing top-level agent. It discovers workflows, handles high-level user goals, and dispatches the appropriate client workflows.
- **Responsibilities:**
  - Finding and selecting workflows (`discover`, `list_workflows`).
  - Starting sessions via `start_session({ agent_id })` (optionally with `planning_slug` once a planning folder exists).
  - Dispatching workflow orchestrators via `start_session` with `parent_planning_slug` to establish parent-child trace correlation.
  - Acting as the sole interface for user prompts (e.g., presenting checkpoints).
  - **Never** executes domain work or tracks detailed workflow state.

### 2. Workflow Orchestrator (Level 1)
- **Role:** A persistent background sub-agent dedicated to managing a single client workflow from start to finish.
- **Responsibilities:**
  - Evaluating state variables and determining the `next_activity` to execute.
  - Dispatching Activity Workers to perform the actual steps.
  - Managing Git artifacts, state persistence, and mechanical/semantic tracing.
  - Relaying checkpoints yielded by workers up to the Meta Orchestrator.
  - Checking workflow status via `get_workflow_status`.

### 3. Activity Worker (Level 2)
- **Role:** An ephemeral sub-sub-agent dispatched to execute one specific activity.
- **Responsibilities:**
  - Loading activity definitions via `get_activity` and executing steps sequentially.
  - Using domain-specific tools to write code, review PRs, or modify files.
  - Yielding execution when hitting a blocking checkpoint via `yield_checkpoint`.
  - Returning a structured result containing modified variables and created artifacts.

---

## Mechanics of Dispatch

The dispatch process safely hands off execution from one layer to the next. Each session has a 6-character `session_index` (base32, deterministically derived from the planning slug); agents pass the index — not a token — on every authenticated call. The canonical state lives in the server-owned `session.json` (see [State Management](state_management_model.md#5-persistence)).

### Dispatching the Workflow Orchestrator (L0 → L1)
When the Meta Orchestrator decides to start a workflow (e.g., `work-package`), it calls `start_session` with the parent's `planning_slug`:

```javascript
start_session({
  workflow_id: "work-package",
  planning_slug: "<child_slug>",
  parent_planning_slug: "<meta_slug>",
  agent_id: "workflow-orchestrator"
})
```

This creates a **child session** under the child planning folder; the server snapshots the parent's `session.json` (after seal-verifying it) under the child's `parentSession` field for trace correlation and recursive parent traversal. A trace event in the parent's trace store links the two sessions. The response includes a `session_index` for the child session.

The Meta Orchestrator then uses the host's sub-agent spawn mechanism (e.g., Cursor's `Task` tool) to start a background workflow orchestrator:
```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are a workflow orchestrator. Your session_index is: <child_index>..."
})
```

### Dispatching the Activity Worker (L1 → L2)
The Workflow Orchestrator evaluates the workflow, determines the next activity to run, and passes its own `session_index` to the worker.

Unlike the L0 → L1 transition (which creates a new child session), the L1 → L2 transition **shares the same `session_index`**. The worker uses this index directly to call `get_activity`, `get_technique`, and `next_activity`; the server resolves the index to the same `session.json` the orchestrator is reading, so both agents see a single canonical state.

The Workflow Orchestrator uses the host's sub-agent spawn mechanism to spawn the Activity Worker:
```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are an autonomous worker agent... session_index: <orchestrator_index>... Activity: implement..."
})
```

### Batching a Run of Activities (#407)

One dispatch may carry a **run** of activities rather than exactly one. The worker walks them under a single `agent_id`, so it pays the harness's context establishment — system prompt, project instructions, tool schemas — once for the run rather than once an activity. On the profiled setup walk that is where the saving is: about five to eight times more of it comes from not re-paying establishment than from delivered content collapsing.

The run pauses at every activity boundary, because the orchestrator owns the commit that boundary requires, and at every gate, because the orchestrator owns the answer. It **resumes in place** across both, under the identity its dispatch bound, so the pauses cost a round trip rather than a respawn.

**The server bounds the run.** A batch is not declared — it is the run of activities one delivery scope takes delivery of, so the server sees one with no orchestrator cooperation and a worker that omits a parameter does not escape it. (The scope itself is the caller's `agent_id`, which is not authenticated, so this bounds a cooperating topology rather than an adversarial one.) Two limits apply, both read off the session history:

| Limit | Derivation | Default |
|---|---|---|
| Cumulative delivered characters | `context_tokens × BATCH_HEADROOM_FRACTION × BUNDLE_CHARS_PER_TOKEN` | fraction `0.35` |
| Distinct activities | `BATCH_MAX_ACTIVITIES` | `3` |

The character budget carries a headroom fraction of its own because `BUNDLE_HEADROOM_FRACTION` answers a different question — how much of one activity's window may go to inlined step techniques — and at `0.80` the arithmetic admits thirteen of the main workflow's fifteen activities into one context. The activity cap covers what a character count is blind to: the establishment the server never delivers, the code the worker reads, the artifacts it drafts, and degradation across a long walk.

The fraction is set from `npm run bench:batch` over the analysis run through the middle of the main workflow, whose three activities deliver 154,699 characters into one context, 132,891 of them by the end of the second. At a 200,000-token window `0.35` gives 280,000 characters, so that run is admitted and the activity cap is what closes it — the intended relationship, with the cap doing the routine work and the budget catching a run of unusually heavy activities.

Both limits count each delivery once. An `activity_dispatched` size is the whole `get_activity` response, so the techniques and resources it bundled eagerly are already inside it and their own observability events are not added again; what counts on top is only what the worker went back for lazily. Counting the bundled entries twice inflated one activity of the main workflow by 48% and a run of three by 70%, which made a nominal 280,000-character budget bind at 164,540.

`get_activity` reports where a context stands in `_meta.batch` (`activities`, `max_activities`, `delivered_chars`, `budget_chars`, `remaining_chars`, `may_continue`), so the ordinary end of a batch is the worker stopping. Asking past the bound is refused with the payload undelivered and a `batch_refused` history event naming the limit — recorded once per scope, activity and limit, so the tally counts how often a limit bound rather than how often a worker retried. That tally is what the starting settings are revised from.

`may_continue` is answered as of that delivery, and the worker then fetches techniques and resources lazily while it runs the activity, drawing down the same budget. So a batch reported as having room can still be refused at the next boundary; `remaining_chars` is the headroom those fetches eat into. The refusal is an expected outcome rather than an error, and the orchestrator handles it by releasing the identity and dispatching a replacement — which must carry a **new** `agent_id`, since the bound is keyed on the identity and a fresh context under a used one would receive markers for content it does not hold.

Two carve-outs keep the bound aimed at what it is for:

- **An activity the context already holds is always served.** That is a worker resuming after a gate asking for the payload it is sitting on, and thirteen of the main workflow's fifteen activities carry a gate.
- **The session's own agent is unbounded.** A scope equal to `session.agentId` is the context that owns the whole walk by construction, which is what `contextMode: "persistent"` describes; its run is the session, not a batch.

**A failed resume costs one activity, not the batch.** The worker reports each activity as it completes, so the session cursor tracks the run. A replacement worker picks up the current activity, takes full delivery, and re-crosses already-answered gates silently — checkpoint responses are keyed `activityId-checkpointId`, with no agent component, so `yield_checkpoint` replays them for any worker.

**Cost keeps its per-activity resolution.** `record_usage` records one `activity_usage` row per activity a dispatch covered, sharing an `agent_id`, rather than one figure per dispatch attributed to whichever activity the orchestrator names. Without that, a batch size cannot be calibrated from real runs.

## Workflow Status Polling

The meta orchestrator can poll the status of a dispatched workflow using `get_workflow_status`:

```javascript
get_workflow_status({ session_index: "<child_index>" })
```

This returns:
- `status`: `active`, `blocked`, or `completed`
- `current_activity`: The activity the sub-agent is executing
- `completed_activities`: Activities finished so far (derived from `session.json` + trace)
- `last_checkpoint`: The most recent resolved checkpoint
- `parent`: If the session was dispatched, the parent's session info derived from `parentSession` in `session.json`

The status is determined from the session state: `blocked` when `activeCheckpoint` is set in `session.json`, `completed` when the workflow has no more activities, and `active` otherwise.

## Resuming Sub-Agents

When an agent pauses (e.g., waiting for a checkpoint resolution), it doesn't die. Hosts that support sub-agents typically expose a `resume` mechanism that re-enters a previously spawned sub-agent with new instructions appended to its existing context (Cursor's `Task` tool, for example, accepts a `resume` parameter keyed on the sub-agent's ID).

When the parent agent needs to wake the sub-agent back up, it calls the host's resume primitive:
```javascript
Task({
  resume: "<sub_agent_id>",
  prompt: "The checkpoint has been resolved. The user selected option 'proceed'. Please continue."
})
```
This appends the new instructions directly to the sub-agent's existing context window, allowing it to seamlessly continue its execution loop without losing its memory of the codebase or workflow state.

## Environment Considerations (Inline Fallback)

The Hierarchical Dispatch Model is optimised for hosts that support background sub-agents (e.g., Cursor's `Task` tool).

In environments that do not support sub-agent spawning, the top-level agent must execute the workflow **inline**. A single agent sequentially adopts the personas of the Meta Orchestrator, Workflow Orchestrator, and Activity Worker, executing all instructions within a single contiguous conversation thread. The server's enforcement layers (HMAC tokens, checkpoint gates, manifests, trace tokens) function identically in either mode — only the persona-switching mechanism changes.
