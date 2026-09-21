# Dispatch model

One agent cannot run a whole workflow well. Talking to the user, tracking where a long run has got to, and writing code are three different jobs. An agent doing all three fills its context with material irrelevant to whichever one it is currently doing.

So the work is handed down a chain. Each agent spawns the next for a narrower scope and takes its report back. Any harness that can spawn background sub-agents can drive this; Cursor's `Task` tool is one such mechanism. Hosts without sub-agents run the same workflow inline, described at the end.

## The three roles

**The user-facing agent** is the only one that talks to the person. It finds and selects workflows, opens a session, spawns an orchestrator, and presents every question the run raises. It executes no domain work and tracks no step-level state.

**The orchestrator** runs in the background and owns one workflow from start to finish. It reads the state variables, decides which activity comes next, dispatches a worker to run it, commits the artifacts that come back, and passes any question upward without trying to answer it.

**The worker** runs activities and nothing else. It loads each activity, executes its steps in order, pauses at any gate it reaches, and returns a structured result naming the variables it changed and the artifacts it wrote.

The boundaries are the point. The user-facing agent never holds step detail, the orchestrator never does domain work, and the worker never talks to the user.

## Mechanics of dispatch

Each session has a six-character `session_index`, derived deterministically from the planning slug. Agents pass that index — never a token — on every authenticated call. The canonical state lives in the server-owned `session.json` (see [state management](state-management-model.md#persistence)).

### Spawning the orchestrator

When the user-facing agent decides to start a workflow, it calls `dispatch_child` against its own session. `start_session` is top-level only and rejects a `session_index`, so it opens the bootstrap session and never a child.

```javascript
dispatch_child({
  session_index: "<meta_index>",
  workflow_id: "<workflow_id>",
  agent_id: "orchestrator",
  planning_slug: "<child_slug>",
  repo: "<owner>/<repo>"
})
```

This creates a **child session embedded in the parent's own `session.json`**, at `triggeredWorkflows[N].state`. The session-file schema is recursive, so a child is a sub-object of its parent's file rather than a file of its own. The parent gains a `triggeredWorkflows` entry naming the child's workflow, index and triggering activity, plus a `workflow_triggered` history event.

The response carries three values: the child's `session_index`, the canonical `planning_folder_path`, and `workflow.initialActivity`. The last exists because a session that has not yet entered an activity reports no current activity, leaving the parent no other route to the child's first activity id.

Two consequences follow from the embedding. A child inherits the parent's planning folder — the persistent-parent path creates no folder and seeds no README. And a child's place in the tree is its position in the file: the session above it is the one whose `triggeredWorkflows` entry holds it, and nothing on the child names it.

Where the parent is a transient meta bootstrap, the server first promotes it to an empty workspace planning folder. Promoting onto a folder that already holds a session is refused, and the existing files are left untouched. A persistent parent appends a second child.

The user-facing agent then starts the orchestrator in the background through the host's spawn mechanism:

```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are a workflow orchestrator. Your session_index is: <child_index>..."
})
```

### Spawning a worker

Spawning a worker does not create a session. The worker **shares the orchestrator's index**, so both resolve to the same state file and neither can drift from the other. Spawning an orchestrator is the opposite case: it opens a child session of its own.

```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are an autonomous worker agent... session_index: <orchestrator_index>... Activity: implement..."
})
```

### Batching a run of activities

One dispatch may carry a **run** of activities rather than exactly one, walked under a single `agent_id`. Two things about that belong to the topology rather than to the budget.

Such a run still pauses at every activity boundary and at every gate, because the orchestrator owns both the commit and the answer. It **resumes in place** across each pause, under the identity its dispatch bound, so the pause costs a round trip rather than a respawn. And a refused continuation is the orchestrator's cue to release the identity and dispatch a replacement under a **new** `agent_id`.

Why batching is worth doing, how far a run may go, and what refuses it are in [the batch budget](delivery-model.md#the-batch-budget), specified beside the other limits on what one context may hold.

### Fanning an exit across several branches

A graph destination may name several branches rather than one activity — several different activities, or one activity run once per element of a collection. They run together, one worker to each, all spawned in a single response turn.

**The frontier is the cursor.** The session record holds the activities in flight as a list: one entry on an ordinary walk, one per branch while a fan runs. An entry for one instance of a fanned activity carries its slot — `review-pass#1` — so entries stay distinct strings and a call naming an instance matches exactly one.

**There are two barrier points and neither is a call.** One call retires the exiting activity and opens every branch, so entering a fan cannot half-happen. Then each branch's return retires that branch and enters the destination if and only if the frontier is then empty, so the only call that can enter the meeting point is the one that empties it. Entering early is unrepresentable rather than refused, and a crashed and resumed orchestrator re-derives the barrier from the session file with no extra state.

**The per-scope batch bound does not limit a fan's width.** The bound exempts a scope with no activity yet and refuses only an activity a scope already holds, so a fresh branch asking for its first activity is admitted whatever the width. What bounds a fan is its own ceiling: the server's configured `DEFAULT_FAN_MAX_BRANCHES`, or a tighter `maxInstances` the destination declares. Either is measured against the branches it opens once every member is flattened, so a list, an instance fan and a mixture of the two answer to one number.

**Every branch takes full delivery.** Delivery scoping keys on the calling context's identity, which each branch carries, so nothing collapses to a reference marker. A fan pays each branch's payload in full and establishes one harness context per branch where a batch establishes one in total. The meeting point then takes a further fresh context and re-pays whatever the branches collectively held. While several activities are in flight, `get_activity` refuses an omitted identity, one equal to the session agent, and one that already holds a sibling; a resume of the same entry, and a replacement under a fresh identity for that entry, are served.

**So a fan is a wall-clock purchase, not an efficiency one.** Several long reasoning passes run inside one response turn instead of several sequential round trips. The wait is free, because a turn does not resume until every tool result returns — nothing polls, times out or is scheduled.

It also buys one thing a character count cannot see. The batch budget counts characters delivered, never characters generated, so nothing bounds how much reasoning accumulates inside one worker. A fan converts unbounded growth in one context into several bounded ones.

## Polling a dispatched workflow

The user-facing agent can poll a dispatched workflow with `get_workflow_status`:

```javascript
get_workflow_status({ session_index: "<child_index>" })
```

| Field | Meaning |
|-------|---------|
| `status` | `blocked` when `activeCheckpoint` is set, `completed` when no activities remain, `active` otherwise |
| `in_flight` | The activities the session is on — one on an ordinary walk, one per branch while a fan runs, empty when nothing is in flight |
| `completed_activities` | Activities finished so far |
| `last_checkpoint` | The most recent resolved checkpoint |

## Resuming sub-agents

An agent that pauses — waiting for a checkpoint resolution, say — does not die. Hosts that support sub-agents typically expose a resume mechanism that re-enters a previously spawned sub-agent with new instructions appended to its existing context. Cursor's `Task` tool, for example, accepts a `resume` parameter keyed on the sub-agent's id.

```javascript
Task({
  resume: "<sub_agent_id>",
  prompt: "The checkpoint has been resolved. The user selected option 'proceed'. Please continue."
})
```

The new instructions append to the sub-agent's existing context window, so it continues its execution loop without losing its memory of the codebase or the workflow state.

## Hosts without sub-agents

Where the harness cannot spawn sub-agents, the top-level agent executes the workflow **inline**: one agent takes each of the three roles in turn within a single conversation. Everything the server enforces — the seal over session state, the checkpoint gate, the manifests and the trace — behaves identically. Only the way the roles change hands differs.
