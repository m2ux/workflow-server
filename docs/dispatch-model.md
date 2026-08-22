# Dispatch Model

One agent cannot run a whole workflow well. Talking to the user, tracking where a long run has got to, and writing code are three different jobs, and an agent doing all three fills its context with material irrelevant to whichever one it is currently doing. So the work is handed down a chain: each agent spawns the next for a narrower scope and takes its report back. That is the dispatch model.

Any IDE or agent harness that can spawn background sub-agents can drive it — Cursor's `Task` tool is one such mechanism. Hosts without sub-agents run the same workflow inline, described at the end of this document.

## The three roles

**The user-facing agent** is the only one that talks to the person. It finds and selects workflows, opens a session, spawns an orchestrator for the chosen workflow, and presents every question the run raises. It executes no domain work and tracks no step-level state.

**The orchestrator** runs in the background and owns one workflow from start to finish. It reads the state variables, decides which activity comes next, dispatches a worker to run it, commits the artifacts that come back, and passes any question the worker raises upward without trying to answer it.

**The worker** is dispatched to run activities and nothing else. It loads each activity, executes its steps in order using whatever tools the work needs, pauses at any gate it reaches, and returns a structured result naming the variables it changed and the artifacts it wrote.

The boundaries are the point. The user-facing agent never holds step detail, the orchestrator never does domain work, and the worker never talks to the user.

---

## Mechanics of dispatch

The dispatch process safely hands off execution from one layer to the next. Each session has a 6-character `session_index` (base32, deterministically derived from the planning slug); agents pass the index — not a token — on every authenticated call. The canonical state lives in the server-owned `session.json` (see [State Management](state-management-model.md#persistence)).

### Spawning the orchestrator

When the user-facing agent decides to start a workflow (e.g., `work-package`), it calls `start_session` with the parent's `planning_slug`:

```javascript
start_session({
  workflow_id: "work-package",
  planning_slug: "<child_slug>",
  parent_planning_slug: "<meta_slug>",
  agent_id: "workflow-orchestrator"
})
```

This creates a **child session** under the child planning folder; the server snapshots the parent's `session.json` (after seal-verifying it) under the child's `parentSession` field for trace correlation and recursive parent traversal. A trace event in the parent's trace store links the two sessions. The response includes a `session_index` for the child session.

The user-facing agent then uses the host's spawn mechanism to start the orchestrator in the background:
```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are a workflow orchestrator. Your session_index is: <child_index>..."
})
```

### Spawning a worker

The orchestrator reads the state, decides which activity runs next, and passes its own session index to the worker.

Spawning a worker does not create a session. The worker **shares the orchestrator's index**, so both resolve to the same state file and neither can drift from the other. Spawning an orchestrator is the opposite case: it opens a child session of its own.

The orchestrator spawns the worker the same way:
```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are an autonomous worker agent... session_index: <orchestrator_index>... Activity: implement..."
})
```

### Batching a run of activities

One dispatch may carry a **run** of activities rather than exactly one. The worker walks them under a single `agent_id`, so it pays the harness's context establishment — system prompt, project instructions, tool schemas — once for the run rather than once an activity. On the profiled setup walk that is where the saving is: skipping two respawns saves roughly two to four times what the delivered content collapsing saves, once the establishment figures are counted once per response.

The run pauses at every activity boundary, because the orchestrator owns the commit that boundary requires, and at every gate, because the orchestrator owns the answer. It **resumes in place** across both, under the identity its dispatch bound, so the pauses cost a round trip rather than a respawn.

**The server bounds the run.** A batch is not declared — it is the run of activities one delivery scope takes delivery of, so the server sees one with no orchestrator cooperation and a worker that omits a parameter does not escape it. (The scope itself is the caller's `agent_id`, which is not authenticated, so this bounds a cooperating topology rather than an adversarial one.) Two limits apply, both read off the session history:

| Limit | Derivation | Default |
|---|---|---|
| Cumulative delivered characters | `context_tokens × BATCH_HEADROOM_FRACTION × BUNDLE_CHARS_PER_TOKEN` | fraction `0.35` |
| Distinct activities | `BATCH_MAX_ACTIVITIES` | `3` |

The character budget takes a headroom fraction of its own rather than reusing the bundling one. The bundling fraction answers a different question — how much of a single activity's window may go to inlined step techniques — and at 0.80 it would admit thirteen of the main workflow's fifteen activities into one context.

The activity cap covers what a character count cannot see: the context the harness establishes and the server never delivers, the code the worker reads, the artifacts it drafts, and the degradation that comes with a long walk.

**Which limit binds depends on the workflow, and both cases are wanted.** The two rest on different evidence. `npm run bench:batch` measures activity payloads only and never fetches a technique or resource lazily, so its figure is a floor: the least a batch can cost, counting only what arrives eagerly. What a batch really accumulates includes everything the worker goes back for, and that half is usually the larger one.

At a 200,000-token window, giving a 280,000-character budget, **the cap binds first on measured content**. The benchmark's three activities cost 159,093 characters batched — 78,128, then 58,588, then 22,377 — which is 57% of budget, because a batch's second and later activities collapse the invariant blocks and the ancestor contract their techniques share (see [Reference delivery](resource-resolution-model.md#reference-delivery)). Standalone, the same three cost 232,954. Reaching the budget takes roughly seven activities of that weight, and a worker declaring a smaller window is bounded proportionally: the budget takes over below roughly 114,000 declared tokens on this workload.

Admission is checked *before* a delivery rather than after, so the admitted activity can carry a batch past the budget by up to one heavy activity. Refusing after composing would pay the composition and still not un-deliver it.

**Revising either value needs evidence a byte count cannot supply.** The cap covers the context establishment the server never delivers, the code the worker reads and the artifacts it drafts — so `batch_refused` counts and per-activity usage rows over real runs are what a revision rests on, not a benchmark that only sees payloads.

Both limits count each delivery once. A dispatch's recorded size is the whole activity response, so anything it bundled eagerly is already inside that figure; what counts on top is only what the worker went back for lazily. Counting a bundled entry both ways would overstate a single activity by 48% and a run of three by 70%, binding a nominal 280,000-character budget at 164,540.

`get_activity` reports where a context stands in `_meta.batch` (`activities`, `max_activities`, `delivered_chars`, `budget_chars`, `may_continue`), so the ordinary end of a batch is the worker stopping. Asking past the bound is refused with the payload undelivered and a `batch_refused` history event naming the limit — recorded once per scope, activity and limit, so the tally counts how often a limit bound rather than how often a worker retried. That tally is what the starting settings are revised from.

`may_continue` on `get_activity` is answered as of that delivery, and the worker then fetches techniques and resources lazily while it runs the activity, drawing down the same budget. So a batch reported as having room can still be refused at the next boundary. `next_activity` answers the same question at the boundary instead — pass the exiting worker's `agent_id` and `context_tokens` and its `_meta.batch` counts those lazy fetches, which is the reading a continue-or-respawn decision wants. The refusal is an expected outcome rather than an error, and the orchestrator handles it by releasing the identity and dispatching a replacement — which must carry a **new** `agent_id`, since the bound is keyed on the identity and a fresh context under a used one would receive markers for content it does not hold.

Three carve-outs keep the bound aimed at what it is for:

- **A context that has taken no activity is always admitted its first.** Lazy reads draw down the same budget, so a scope that read past it before taking any activity would otherwise be refused the work it was spawned to do.
- **An activity the context already holds is always served.** That is a worker resuming after a gate asking for the payload it is sitting on, and thirteen of the main workflow's fifteen activities carry a gate.
- **The session's own agent is unbounded.** A scope equal to `session.agentId` is the context that owns the whole walk by construction, which is what `contextMode: "persistent"` describes; its run is the session, not a batch. Note that `agentId` is caller-set: `dispatch_child` defaults it to `"worker"`, and a resume rebinds it to the resuming caller's `agent_id`. So a dispatched worker that passes the session's own identity is unbounded, and which context holds the exemption can move across a resume. Minting one identity per dispatch, which the corpus already requires, is what keeps the exemption where it belongs.

**A refusal pins the session to this server version.** The refusal is recorded as a history event, and loading a session validates every event in the file against a strict list. An older server meeting an event it does not know fails that validation, and the failure surfaces as `SEAL_MISMATCH` — the error usually read as tampering or a rotated key. Downgrading therefore means stripping those events or retiring the session. Reading an older session on this server is unaffected.

**A failed resume costs one activity, not the batch.** The worker reports each activity as it completes, so the session cursor tracks the run. A replacement worker picks up the current activity, takes full delivery, and re-crosses already-answered gates silently — checkpoint responses are keyed `activityId-checkpointId`, with no agent component, so `yield_checkpoint` replays them for any worker.

**Cost keeps its per-activity resolution.** `record_usage` records one `activity_usage` row per activity a dispatch covered, sharing an `agent_id`, rather than one figure per dispatch attributed to whichever activity the orchestrator names. Without that, a batch size cannot be calibrated from real runs.

## Workflow status polling

The user-facing agent can poll the status of a dispatched workflow using `get_workflow_status`:

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

## Resuming sub-agents

When an agent pauses (e.g., waiting for a checkpoint resolution), it doesn't die. Hosts that support sub-agents typically expose a `resume` mechanism that re-enters a previously spawned sub-agent with new instructions appended to its existing context (Cursor's `Task` tool, for example, accepts a `resume` parameter keyed on the sub-agent's ID).

When the parent agent needs to wake the sub-agent back up, it calls the host's resume primitive:
```javascript
Task({
  resume: "<sub_agent_id>",
  prompt: "The checkpoint has been resolved. The user selected option 'proceed'. Please continue."
})
```
This appends the new instructions directly to the sub-agent's existing context window, allowing it to seamlessly continue its execution loop without losing its memory of the codebase or workflow state.

## Environment considerations (inline fallback)

The Hierarchical Dispatch Model is optimised for hosts that support background sub-agents (e.g., Cursor's `Task` tool).

In environments that do not support sub-agent spawning, the top-level agent must execute the workflow **inline**. One agent takes each of the three roles in turn within a single conversation. Everything the server enforces — the seal over session state, the checkpoint gate, the manifests and the trace — behaves identically either way. Only the way the roles change hands differs.
