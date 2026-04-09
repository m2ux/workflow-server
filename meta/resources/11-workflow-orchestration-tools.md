---
id: workflow-orchestration-tools
version: 1.0.0
---

# Workflow Orchestration MCP Tool Reference

Checklists, tool parameter details, and step-by-step procedures for interacting with the workflow-server MCP, specifically tailored for the **workflow-orchestrator** role.

---

## Contents

1. [Quick Reference](#1-quick-reference) — Core tools for orchestration
2. [Session Bootstrapping](#2-session-bootstrapping) — Initializing a workflow execution
3. [Activity Navigation](#3-activity-navigation) — Transitioning between workflow states
4. [Checkpoint Resolution](#4-checkpoint-resolution) — Handling interactive pauses

---

## 1. Quick Reference

### Bootstrap & Discovery (No Token Required)

| Tool | When to Use | Key Params | Returns |
|------|-------------|------------|---------|
| `discover` | First action to learn server usage and available workflows | none | Server info and bootstrap procedure |
| `list_workflows` | Matching user goal to a workflow | none | Available workflows |

### Core Session Operations (Token Required)

Every call after `start_session` requires the `session_token` parameter, which encodes the current state, workflow ID, and identity of the session.

| Tool | When to Use | Key Params | Returns |
|------|-------------|------------|---------|
| `start_session` | Initial dispatch to start or inherit a session | `workflow_id`, optional `session_token` (from orchestrator), optional `agent_id` | Initial `session_token` and metadata |
| `get_workflow` | Loading workflow structure | `session_token`, optional `summary` | Workflow details including `initialActivity` |
| `get_skills` | Loading workflow-level behavioral protocols | `session_token` | Universal and workflow-level skills |
| `next_activity` | Transitioning to the first or next activity | `session_token`, `activity_id` (MUST use `initialActivity` ID from `get_workflow` on first call; transitions for subsequent calls), optional `step_manifest` | Activity definition, trace token, embedded checkpoints |
| `get_resource` | Fetching text content for a resource reference | `session_token`, `resource_index` | Full resource text content |

---

## 2. Session Bootstrapping

### When to Use

- Starting a brand new top-level workflow.
- A sub-agent being dispatched to handle a specific client workflow.
- Resuming a previously paused workflow.

### Checklist

```
- [ ] Call `start_session` (pass `workflow_id` for new; pass existing `session_token` if resuming/inheriting)
- [ ] Save the returned `session_token` — it is required for all subsequent calls.
- [ ] Call `get_skills` to load the universal and workflow-level behavioral protocols.
- [ ] Call `get_workflow` to understand the structure and locate the `initialActivity`.
```

### Example: Starting a Meta Session

```
1. start_session({ workflow_id: "meta" })
   → Returns session_token: "tok_123abc..."

2. get_skills({ session_token: "tok_123abc..." })
   → Returns skills like 00-session-protocol, 10-meta-orchestrator

3. get_workflow({ session_token: "tok_123abc...", summary: true })
   → Returns workflow info, indicating initialActivity is "start-workflow"
```

---

## 3. Activity Navigation

### When to Use

- After bootstrapping, to begin the first activity.
- After completing an activity's steps, to transition to the next state.

### Checklist

```
- [ ] Identify target `activity_id` (`initialActivity` if first call, else from current activity's `transitions`).
- [ ] Compile `step_manifest` (if transitioning from a completed activity).
- [ ] Call `next_activity({ session_token, activity_id, step_manifest })`.
- [ ] Extract steps, loop definitions, and embedded checkpoints from the response.
- [ ] Check `_meta.validation` for any warnings (e.g., missing step manifests).
```

### Example: First Activity vs Subsequent Activity

**First Call:**
```
// We know initialActivity is "start-workflow" from get_workflow
1. next_activity({ session_token: "tok_123abc...", activity_id: "start-workflow" })
   → Returns activity definition, steps, etc.
```

**Subsequent Call (Transitioning):**
```
// Activity "start-workflow" has a transition to "resume-workflow"
1. next_activity({ 
     session_token: "tok_123abc...", 
     activity_id: "resume-workflow",
     step_manifest: [{ step_id: "init", status: "complete", summary: "Loaded UI" }]
   })
   → Returns next activity definition and embedded checkpoints in token.
```

---

## 4. Checkpoint Resolution

### When to Use

- An activity specifies a checkpoint that requires user interaction or a specific condition to be met before proceeding.
- An orchestrator receives a yielded `checkpoint_pending` signal from a sub-agent.

### Checklist (Orchestrator Role)

```
- [ ] Worker sub-agent yields `checkpoint_pending` with checkpoint ID and options.
- [ ] Orchestrator calls `get_checkpoint` (optional, if more details needed).
- [ ] Orchestrator presents options to the user (e.g., via `AskQuestion` tool).
- [ ] User selects an option.
- [ ] Orchestrator calls `respond_checkpoint({ session_token, checkpoint_id, option_id })`.
- [ ] Orchestrator resumes the worker sub-agent with the checkpoint response and effects.
```
