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

When the user-facing agent decides to start a workflow (e.g., `work-package`), it calls `dispatch_child` against its own session. `start_session` is top-level only and rejects a `session_index`, so it opens the bootstrap session and never a child:

```javascript
dispatch_child({
  session_index: "<meta_index>",
  workflow_id: "work-package",
  agent_id: "orchestrator",
  planning_slug: "<child_slug>",
  repo: "<owner>/<repo>"
})
```

This creates a **child session embedded in the parent's own `session.json`**, at `triggeredWorkflows[N].state` — the session-file schema is recursive, so a child is a sub-object of its parent's file rather than a file of its own. The parent gains a `triggeredWorkflows` entry naming the child's workflow, index, and the activity it was triggered from, plus a `workflow_triggered` history event.

The response carries three values: the child's `session_index`, the canonical `planning_folder_path`, and `workflow.initialActivity` — the activity the child's first `next_activity` should name. The last of these exists because a session that has not yet entered an activity reports no current activity, so the parent has no other route to the child's first activity id.

Two consequences follow from the embedding, and both matter when reading the rest of this document. A child inherits the parent's planning folder — the persistent-parent path creates no folder and seeds no README for the child. And a child's place in the tree is its position in the file: the session above it is the one whose `triggeredWorkflows` entry holds it, and nothing is stored on the child that names it.

Where the parent is a transient meta bootstrap, the server first promotes it to a workspace planning folder, and re-dispatching into a folder that already holds a child of the same workflow replaces that child rather than continuing it. A persistent parent appends a second child instead.

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

At a 200,000-token window, giving a 280,000-character budget, **the cap binds first on measured content**. The benchmark's three activities cost 222,505 characters batched — 85,775, then 106,893, then 30,182 — which is 79% of budget, because a batch's second and later activities collapse the invariant blocks and the ancestor contract their techniques share (see [Reference delivery](resource-resolution-model.md#reference-delivery)). Standalone, the same three cost 261,971, so batching saves 15%. Reaching the budget takes roughly four activities of that weight, and a worker declaring a smaller window is bounded proportionally: the budget takes over below roughly 159,000 declared tokens on this workload.

These figures come from `npm run bench:batch` against the corpus at `5f92dc06`. They move whenever an activity's payload does, so re-run it rather than trusting the numbers here; the shape of the claim — cap before budget, at this window — is what the paragraph is for.

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

### Fanning an exit across several branches

A graph destination may name several branches rather than one activity — several different activities, or one activity run once per element of a collection. They run together, one worker to each, all spawned in a single response turn.

**The frontier is the cursor.** The session record holds the activities in flight as a list: one entry on an ordinary walk, one per branch while a fan runs. An entry for one instance of a fanned activity carries its slot — `challenge-pass#1` — so the entries are distinct strings and a call naming an instance matches exactly one.

**There are two barrier points and neither is a call.** One call retires the exiting activity and opens every branch, so entering a fan cannot half-happen. Then each branch's return retires that branch and enters the destination if and only if the frontier is then empty — so the only call that can enter the meeting point is the one that empties it. Entering early is unrepresentable rather than refused, and a crashed and resumed orchestrator re-derives the barrier from the session file with no extra state.

**The per-scope batch bound does not limit a fan's width.** The bound exempts a scope with no activity yet and refuses only an activity a scope already holds, so a fresh branch scope asking for its first activity is admitted whatever the width; on the retire call the batch reading reports one activity. What bounds a fan is its own ceiling — the server's configured `DEFAULT_FAN_MAX_BRANCHES`, or a tighter `maxInstances` the destination declares — measured against the branches it opens once every member is flattened, so a list, an instance fan and a mixture of the two answer to one number.

**Every branch takes full delivery, and the figures below are a floor.** Delivery scoping keys on the calling context's identity, which each branch carries, so nothing collapses to a reference marker: a fan pays each branch's payload in full and establishes one harness context per branch where a batch establishes one in total. The meeting point then takes a further fresh context and re-pays whatever the branches collectively held. While several activities are in flight, `get_activity` refuses an omitted identity, one equal to the session agent, and one that already holds a sibling; a resume of the same entry, and a replacement under a fresh identity for that same entry, are served.

No measured figure exists for a *fanned* activity's payload. Every number here is therefore a **substitution and a lower bound** — taken from the standalone activity benchmark, counting eager payloads only and never a lazy fetch — and is re-derived against a fresh benchmark run rather than carried forward. Against the run it replaces: a fan of several different activities is measured against one worker walking them as a batch, which collapses what the second and later activities share; a fan over a collection is measured against one worker looping N times, which pays a single delivery because a loop body's technique is bundled once and reused. Per unit of work the instance form is the more expensive of the two by a wide margin.

**So a fan is a wall-clock purchase, not an efficiency one.** Several long reasoning passes run inside one response turn instead of several sequential dispatch round trips, and the wait is free because a turn does not resume until every tool result returns — nothing polls, times out or is scheduled. It buys one thing a character count cannot see: the batch budget counts characters delivered, never characters generated, so nothing bounds how much reasoning accumulates inside one worker. A fan converts unbounded growth in one context into N bounded ones.

## Workflow status polling

The user-facing agent can poll the status of a dispatched workflow using `get_workflow_status`:

```javascript
get_workflow_status({ session_index: "<child_index>" })
```

This returns:
- `status`: `active`, `blocked`, or `completed`
- `in_flight`: the activities the session is on — one on an ordinary walk, one per branch while a fan runs, empty when nothing is in flight
- `completed_activities`: Activities finished so far (derived from `session.json` + trace)
- `last_checkpoint`: The most recent resolved checkpoint

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
