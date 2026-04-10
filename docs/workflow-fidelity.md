# Workflow Fidelity Enforcement

How the workflow server ensures agents follow workflows correctly.

## The Problem

AI agents executing multi-step workflows face two reliability challenges:

1. **Context degradation** — as conversations grow, earlier instructions (including workflow definitions) fall out of the model's effective attention window, leading to skipped steps, wrong transitions, and hallucinated procedures
2. **Behavioral drift** — without enforcement, agents may take shortcuts, skip checkpoints, or fabricate state rather than following the defined execution path

The workflow server addresses these through seven layers of enforcement, each operating at a different granularity.

## Enforcement Layers

```
┌─────────────────────────────────────────────┐
│  Layer 1: Token Integrity (HMAC)            │
│  Every call — prevents fabrication           │
├─────────────────────────────────────────────┤
│  Layer 2: Checkpoint Gate                    │
│  At transitions — blocks until resolved      │
├─────────────────────────────────────────────┤
│  Layer 3: Cross-Activity Validation          │
│  Between activities — checks consistency     │
├─────────────────────────────────────────────┤
│  Layer 4: Transition Condition Tracking      │
│  At transitions — verifies condition logic   │
├─────────────────────────────────────────────┤
│  Layer 5: Step Completion Manifest           │
│  Within activities — verifies completeness   │
├─────────────────────────────────────────────┤
│  Layer 6: Activity Manifest                  │
│  Across activities — tracks workflow journey  │
├─────────────────────────────────────────────┤
│  Layer 7: Execution Trace                    │
│  Entire session — mechanical audit trail      │
└─────────────────────────────────────────────┘
```

### Enforcement Flow

The following diagram shows a typical two-activity progression through a workflow, annotating where each enforcement layer activates. Hard gates (blocking) are marked with solid borders; advisory checks (warnings) are marked with dashed borders.

```mermaid
flowchart TD
    subgraph bootstrap [Session Bootstrap]
        startSession["start_session(workflow_id, agent_id)"]
        getWorkflow["get_workflow(summary=true)"]
        startSession -->|"L1: HMAC signed token issued"| getWorkflow
    end

    subgraph actA [Activity A]
        nextA["next_activity(activity_id=A)"]
        cpGateA{{"L2: pcp populated
        with required checkpoints"}}
        toolsBlocked["All tools BLOCKED
        except get_checkpoint
        and respond_checkpoint"]
        respondCp["respond_checkpoint
        for each pending checkpoint"]
        cpTiming{{"L2: Timing enforced
        option validated against definition"}}
        pcpClear["pcp cleared — tools unblocked"]
        getSkill["get_skill(step_id) + get_resource"]
        executeSteps["Execute activity steps"]
    end

    subgraph transition [Transition A to B]
        nextB["next_activity(activity_id=B,
        step_manifest, activity_manifest,
        transition_condition)"]
        hardGate{{"L2: pcp empty?
        HARD GATE"}}
        transCheck["L3: A→B in transition graph?"]
        condCheck["L4: condition matches table?"]
        stepCheck["L5: step_manifest complete?"]
        actCheck["L6: activity_manifest valid?"]
        tracePackage["L7: Trace token packaged
        for Activity A"]
    end

    subgraph actB [Activity B]
        cpGateB{{"L2: pcp populated
        for Activity B checkpoints"}}
        continueB["Resolve checkpoints,
        execute steps..."]
    end

    getWorkflow -->|"L7: trace event"| nextA
    nextA --> cpGateA
    cpGateA --> toolsBlocked
    toolsBlocked --> respondCp
    respondCp --> cpTiming
    cpTiming -->|"Each checkpoint resolved"| respondCp
    cpTiming -->|"All checkpoints resolved"| pcpClear
    pcpClear --> getSkill
    getSkill -->|"L1: HMAC verified"| executeSteps

    executeSteps --> nextB
    nextB --> hardGate
    hardGate -->|"pcp non-empty"| toolsBlocked
    hardGate -->|"pcp empty"| transCheck
    transCheck -.- condCheck
    condCheck -.- stepCheck
    stepCheck -.- actCheck
    actCheck --> tracePackage
    tracePackage --> cpGateB
    cpGateB --> continueB
```

**Legend:**
- Double-bordered nodes (`{{...}}`) are hard enforcement gates — they block execution until satisfied
- Dashed lines (`-.-`) indicate advisory validation that produces warnings but does not block
- `L1` through `L7` reference the enforcement layers described below
- Every tool call in the diagram verifies the HMAC signature (L1) and records a trace event (L7); only the first occurrence is annotated to avoid clutter

### Layer 1: Token Integrity

Every session token is HMAC-SHA256 signed using a server-held key (`~/.workflow-server/secret`). The token format is `<base64url-payload>.<hmac-signature>`.

The token payload carries:

| Field | Purpose |
|-------|---------|
| `wf` | Workflow ID — locks the session to a single workflow |
| `act` | Current activity — records the agent's position |
| `skill` | Last loaded skill — tracks skill usage |
| `cond` | Last transition condition — records the agent's claimed reason for transitioning |
| `v` | Workflow version — detects definition drift |
| `seq` | Sequence counter — increments on every call, ensuring uniqueness |
| `ts` | Creation timestamp |
| `sid` | Session UUID — uniquely identifies this execution session across all tool calls |
| `aid` | Agent ID — identifies which agent (orchestrator vs. worker) made the call |
| `pcp` | Pending checkpoint IDs — gates activity transitions until resolved |
| `pcpt` | Checkpoint issuance timestamp — enables timing enforcement |

**What it enforces:**
- Agents cannot fabricate tokens — the server rejects any token it didn't issue
- Agents cannot tamper with token fields — modifying any field invalidates the signature
- Each tool call produces a new token with an incremented counter, ensuring tokens are unique per exchange
- The `sid` field binds all tool calls to a single session, enabling trace correlation
- The `aid` field distinguishes orchestrator from worker calls in multi-agent execution patterns
- The `pcp` field blocks activity transitions until all required checkpoints are resolved via `respond_checkpoint`

**How it works:** The server verifies the HMAC signature on every tool call before processing. Invalid signatures cause immediate rejection.

### Layer 2: Checkpoint Gate

When `next_activity` loads an activity with required checkpoints (`required: true`, the default), the server embeds those checkpoint IDs in the token's `pcp` field and records the issuance time in `pcpt`. The token then **hard-blocks** any transition to a different activity until all pending checkpoints are resolved.

**Resolution via `respond_checkpoint`:**

The agent must call `respond_checkpoint` for each pending checkpoint, using exactly one of three resolution modes:

| Mode | When to use | Timing enforcement |
|------|-------------|-------------------|
| `option_id` | User selected an option | Minimum response time (default 3s since `pcpt`) |
| `auto_advance` | Non-blocking checkpoint timer elapsed | Full `autoAdvanceMs` must elapse since `pcpt` |
| `condition_not_met` | Conditional checkpoint's condition is false | None (but checkpoint must have a `condition` field) |

**What it enforces:**
- Agents cannot skip checkpoints — `next_activity` throws a hard error if `pcp` is non-empty when transitioning to a different activity
- Agents cannot forge responses — `option_id` is validated against the checkpoint definition
- Agents cannot instant-auto-resolve — the server enforces minimum elapsed time for user-answered checkpoints and the full `autoAdvanceMs` timer for auto-advanced ones
- Agents cannot dismiss unconditional checkpoints — `condition_not_met` is rejected unless the checkpoint has a `condition` field
- Agents cannot tamper with `pcp` — the field is in the HMAC-signed token payload

**How it works:** `next_activity` populates `pcp` on the outgoing token. The agent calls `respond_checkpoint` for each entry, which removes it from `pcp` and returns effects (setVariable, transitionTo, skipActivities). Only when `pcp` is empty can the agent transition to the next activity.

**Anti-gaming:** The timing enforcement prevents the pathological case where an orchestrator calls `respond_checkpoint` immediately after `next_activity` without presenting the checkpoint to the user. In legitimate orchestrator-worker flows, worker execution naturally takes minutes, so the timing check is transparent. The `pcpt` timestamp is set once when `pcp` is populated and persists across all token advances until cleared.

### Layer 3: Cross-Activity Validation

When an agent makes a tool call, the server compares the token's recorded state (from the previous call) against the current call's explicit parameters. Warnings are returned in `_meta.validation`.

**Checks performed:**

| Check | What it detects |
|-------|----------------|
| Workflow consistency | Agent switched workflows mid-session without starting a new session |
| Activity transition | Agent jumped to an activity that isn't a valid transition from the previous one |
| Skill association | Agent loaded a skill not declared by the current activity |
| Version drift | Workflow definition changed on disk since the session started |

**Design principle:** Warnings don't block execution — the tool still returns its result. This allows agents to self-correct rather than being hard-blocked, while making violations visible. All validation warnings are captured in the execution trace (Layer 7).

### Layer 4: Transition Condition Tracking

When calling `next_activity` to transition to a new activity, agents can include a `transition_condition` parameter — the condition string (from the `transitions` field of the current activity's definition) that caused the transition.

**What it enforces:**
- The claimed condition actually maps to the target activity in the transition table
- Default transitions are correctly reported (no false condition claims)
- The condition is recorded in the HMAC-signed token, creating an immutable audit trail

**What it cannot verify in real-time:** Whether the condition is actually true in the agent's state. However, conditions are typically set by user choices at checkpoints, which are logged. Post-hoc review can cross-reference claimed conditions against checkpoint responses and trace data.

### Layer 5: Step Completion Manifest

When transitioning between activities via `next_activity`, agents include a `step_manifest` parameter — a structured summary of each step completed in the previous activity.

```json
{
  "step_manifest": [
    { "step_id": "resolve-target", "output": "Target verified at /path" },
    { "step_id": "initialize-target", "output": "Checked out main" },
    { "step_id": "detect-project-type", "output": "project_type=other" }
  ]
}
```

**What it enforces:**
- All required steps are present (missing steps produce a warning)
- Steps are in the correct order (out-of-order steps produce a warning)
- Each step has a non-empty output description (empty outputs produce a warning)

**Design constraint:** All steps within an activity are required. Optionality is handled at the activity level (via transition conditions), not at the step level. This simplifies enforcement — the validator checks for exact match against the expected step sequence.

### Layer 6: Activity Manifest

When transitioning between activities via `next_activity`, agents can include an `activity_manifest` — a structured summary of activities completed so far in the workflow.

```json
{
  "activity_manifest": [
    { "activity_id": "start-work-package", "outcome": "completed", "transition_condition": "default" },
    { "activity_id": "design-philosophy", "outcome": "completed", "transition_condition": "skip_optional_activities == true" },
    { "activity_id": "plan-prepare", "outcome": "revised", "transition_condition": "needs_research == true" }
  ]
}
```

**What it enforces (advisory):**
- Activity IDs reference activities that exist in the workflow definition
- Outcomes are non-empty
- The activity sequence is plausible given the transition table

**Design principle:** Activity manifest validation is advisory — it produces warnings, not rejections. This matches the design principle of Layer 3. The manifest provides a workflow-level audit trail that complements the step-level detail of Layer 5, particularly in orchestrator/worker patterns where the orchestrator tracks the workflow journey and the worker tracks step execution.

### Layer 7: Execution Trace

The server automatically captures a mechanical trace of every tool call in a session. Trace data is packaged as HMAC-signed trace tokens — opaque, compact references that the agent accumulates and can resolve via `get_trace`.

**What it captures automatically (via `withAuditLog`):**

| Field | Description |
|-------|-------------|
| `name` | Tool name |
| `ts` | Timestamp (Unix seconds) |
| `ms` | Duration (milliseconds) |
| `s` | Status (`ok` or `error`) |
| `wf`, `act`, `aid` | Workflow, activity, and agent ID from the decoded token |
| `err` | Error message (on failure) |
| `vw` | Validation warnings from `_meta.validation` |

**How trace tokens work:**

1. The server accumulates trace events in an in-memory `TraceStore` during the session
2. When `next_activity` is called (activity transition), the server packages all events since the last transition into an HMAC-signed trace token (~1.3KB) and returns it in `_meta.trace_token`
3. The agent accumulates these opaque tokens without parsing them (~300 bytes of context per token)
4. At any point, `get_trace` resolves the accumulated tokens into full event data

**What it enables:**
- **Post-execution audit** — the complete tool call sequence with timing, errors, and validation warnings
- **Failure diagnosis** — the last call before silence identifies where an agent got stuck
- **Multi-agent attribution** — the `aid` field distinguishes orchestrator from worker calls
- **Validation warning history** — every warning issued during the session is recorded, not just the most recent

**Two-layer trace architecture:** The server captures the mechanical trace (tool calls, timing, validation) automatically. Agents write a complementary semantic trace (step outputs, checkpoint responses, decision branches, variable changes) to the planning folder per workflow skill instructions. Together they provide complete execution visibility.

**Trace token properties:**
- Self-contained — full event data is embedded, not just references to in-memory state
- HMAC-signed — tamper-proof, uses the same signing mechanism as session tokens
- Compact — compressed field names minimize context window impact
- Degradation-resilient — tokens remain valid attestations even if the server restarts

## Context Pressure Mitigation

Beyond enforcement, the server reduces the context burden on agents:

### Summary Mode

`get_workflow(summary=true)` returns lightweight metadata (~2KB) instead of the full workflow definition (~13KB). The orchestrator gets rules, variables, and activity stubs without consuming its context window with step-level detail.

### Transitions in Activity Definitions

`next_activity` returns the complete activity definition including its `transitions` field with human-readable conditions. The agent matches conditions against its state variables to determine the next activity:

```json
{
  "transitions": [
    { "to": "requirements-elicitation", "condition": "needs_elicitation == true" },
    { "to": "implementation-analysis", "isDefault": true }
  ]
}
```

### Skill and Resource Loading

`get_skills` returns workflow-level behavioral protocols with `_resources` containing lightweight references (index, id, version). `get_skill` loads the skill for a specific step. Call `get_resource` with the resource index to load full content. Do not call `get_skill` on steps that lack a `skill` property.

### Self-Describing Bootstrap

The `discover` tool returns the complete bootstrap procedure and available workflows. Agents learn how to use the server from the server itself, reducing reliance on IDE-side configuration that may go stale.

### Trace Token Efficiency

Trace tokens use compressed field names and HMAC-signed opaque encoding. A 10-activity session produces ~3KB of accumulated tokens (~3,200 LLM tokens) — approximately 1.6% of a 200K context window. The agent stores tokens as opaque strings without parsing, keeping the mechanical trace out of the reasoning context until explicitly resolved via `get_trace`.

## State Persistence

State persistence is agent-managed. The orchestrator writes the session token (opaque, HMAC-signed) and its variable state to disk using its own file tools. To resume, the saved token is passed to `start_session(session_token=saved_token)`. The trace provides the audit trail via `get_trace`.

## Limitations

- **Step execution is not provable** — the manifest validates that the agent *reported* each step, not that it *performed* the work. The output descriptions are agent-generated. However, the mechanical trace independently confirms which tool calls were made, providing corroborating evidence.
- **Condition truth is not verified** — the server checks that a claimed condition maps to the target activity, but cannot verify whether the condition is actually true in the agent's state. Post-hoc audit via checkpoint logs and trace data can cross-reference claimed conditions against observed behavior.
- **Checkpoint user presence is not provable** — the checkpoint gate ensures the agent *calls* `respond_checkpoint` with a valid option, but cannot prove a human saw the checkpoint. The timing enforcement raises the bar (instant auto-resolve is rejected), and the trace records all checkpoint interactions for audit. However, an agent could wait the minimum time and then submit a fabricated response. This is an inherent limitation of agent-mediated systems where the agent controls the communication channel.
- **Conditional checkpoint dismissal relies on agent honesty** — when an agent calls `respond_checkpoint` with `condition_not_met`, the server validates that the checkpoint has a `condition` field but cannot verify the condition is actually false. The trace records the dismissal for post-hoc audit.
- **Replay is not detected** — an agent could present an old valid token. The HMAC proves authenticity but not freshness (the server is stateless). The `sid` field makes replay across sessions detectable, but within-session replay remains possible.
- **Warnings are advisory** — a confused agent may ignore validation warnings. The enforcement is detection-oriented, not prevention-oriented. Validation warnings are now captured in the execution trace, making ignored warnings visible in post-hoc review.
- **In-memory trace lifespan** — the `TraceStore` lives in server memory. On server restart, accumulated events are lost. Trace tokens issued before the restart remain valid as self-contained attestations (event data is embedded), but ad-hoc `get_trace` queries without tokens return empty results for prior sessions.
- **Semantic trace is agent-dependent** — the agent-written semantic trace (step outputs, checkpoint responses, variable changes) relies on agent discipline. The server cannot verify that the agent wrote it or that it is complete.

## Related

- [API Reference](api-reference.md) — tool parameters and validation response format
- [IDE Setup](ide-setup.md) — bootstrap configuration
