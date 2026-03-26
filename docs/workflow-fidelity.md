# Workflow Fidelity Enforcement

How the workflow server ensures agents follow workflows correctly.

## The Problem

AI agents executing multi-step workflows face two reliability challenges:

1. **Context degradation** — as conversations grow, earlier instructions (including workflow definitions) fall out of the model's effective attention window, leading to skipped steps, wrong transitions, and hallucinated procedures
2. **Behavioral drift** — without enforcement, agents may take shortcuts, skip checkpoints, or fabricate state rather than following the defined execution path

The workflow server addresses these through six layers of enforcement, each operating at a different granularity.

## Enforcement Layers

```
┌─────────────────────────────────────────────┐
│  Layer 1: Token Integrity (HMAC)            │
│  Every call — prevents fabrication           │
├─────────────────────────────────────────────┤
│  Layer 2: Cross-Activity Validation          │
│  Between activities — checks consistency     │
├─────────────────────────────────────────────┤
│  Layer 3: Transition Condition Tracking      │
│  At transitions — verifies condition logic   │
├─────────────────────────────────────────────┤
│  Layer 4: Step Completion Manifest           │
│  Within activities — verifies completeness   │
├─────────────────────────────────────────────┤
│  Layer 5: Activity Manifest                  │
│  Across activities — tracks workflow journey  │
├─────────────────────────────────────────────┤
│  Layer 6: Execution Trace                    │
│  Entire session — mechanical audit trail      │
└─────────────────────────────────────────────┘
```

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

**What it enforces:**
- Agents cannot fabricate tokens — the server rejects any token it didn't issue
- Agents cannot tamper with token fields — modifying any field invalidates the signature
- Each tool call produces a new token with an incremented counter, ensuring tokens are unique per exchange
- The `sid` field binds all tool calls to a single session, enabling trace correlation
- The `aid` field distinguishes orchestrator from worker calls in multi-agent execution patterns

**How it works:** The server verifies the HMAC signature on every tool call before processing. Invalid signatures cause immediate rejection.

### Layer 2: Cross-Activity Validation

When an agent makes a tool call, the server compares the token's recorded state (from the previous call) against the current call's explicit parameters. Warnings are returned in `_meta.validation`.

**Checks performed:**

| Check | What it detects |
|-------|----------------|
| Workflow consistency | Agent switched workflows mid-session without starting a new session |
| Activity transition | Agent jumped to an activity that isn't a valid transition from the previous one |
| Skill association | Agent loaded a skill not declared by the current activity |
| Version drift | Workflow definition changed on disk since the session started |

**Design principle:** Warnings don't block execution — the tool still returns its result. This allows agents to self-correct rather than being hard-blocked, while making violations visible. All validation warnings are captured in the execution trace (Layer 6).

### Layer 3: Transition Condition Tracking

When calling `next_activity` to transition to a new activity, agents can include a `transition_condition` parameter — the condition string (from `get_activities` output) that caused the transition.

**What it enforces:**
- The claimed condition actually maps to the target activity in the transition table
- Default transitions are correctly reported (no false condition claims)
- The condition is recorded in the HMAC-signed token, creating an immutable audit trail

**What it cannot verify in real-time:** Whether the condition is actually true in the agent's state. However, conditions are typically set by user choices at checkpoints, which are logged. Post-hoc review can cross-reference claimed conditions against checkpoint responses and trace data.

### Layer 4: Step Completion Manifest

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

### Layer 5: Activity Manifest

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

**Design principle:** Activity manifest validation is advisory — it produces warnings, not rejections. This matches the design principle of Layer 2. The manifest provides a workflow-level audit trail that complements the step-level detail of Layer 4, particularly in orchestrator/worker patterns where the orchestrator tracks the workflow journey and the worker tracks step execution.

### Layer 6: Execution Trace

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

### Server-Side Transition List

`get_activities` returns the transition list for the current activity with human-readable conditions. The agent matches conditions against its state variables using a fresh list from the server, rather than referencing a workflow definition loaded many exchanges ago.

```json
{
  "current_activity": "codebase-comprehension",
  "transitions": [
    { "to": "requirements-elicitation", "condition": "needs_elicitation == true" },
    { "to": "implementation-analysis", "isDefault": true }
  ]
}
```

### Batch Skill Loading

`get_skills(workflow_id, activity_id)` returns all skills and their referenced resources as a structured array. Each resource has `index`, `id`, `version`, and `content` fields — agents match resources by index or id, eliminating ambiguity. `get_skill` returns the same structured format for individual skill loads.

### Self-Describing Bootstrap

The `help` tool returns the complete bootstrap procedure and session protocol. Agents learn how to use the server from the server itself, reducing reliance on IDE-side configuration that may go stale.

### Trace Token Efficiency

Trace tokens use compressed field names and HMAC-signed opaque encoding. A 10-activity session produces ~3KB of accumulated tokens (~3,200 LLM tokens) — approximately 1.6% of a 200K context window. The agent stores tokens as opaque strings without parsing, keeping the mechanical trace out of the reasoning context until explicitly resolved via `get_trace`.

## At-Rest Token Security

When workflow state is persisted via `save_state`, the session token is encrypted using AES-256-GCM before writing to disk. `restore_state` decrypts it transparently. This prevents token extraction from state files.

## Limitations

- **Step execution is not provable** — the manifest validates that the agent *reported* each step, not that it *performed* the work. The output descriptions are agent-generated. However, the mechanical trace independently confirms which tool calls were made, providing corroborating evidence.
- **Condition truth is not verified** — the server checks that a claimed condition maps to the target activity, but cannot verify whether the condition is actually true in the agent's state. Post-hoc audit via checkpoint logs and trace data can cross-reference claimed conditions against observed behavior.
- **Replay is not detected** — an agent could present an old valid token. The HMAC proves authenticity but not freshness (the server is stateless). The `sid` field makes replay across sessions detectable, but within-session replay remains possible.
- **Warnings are advisory** — a confused agent may ignore validation warnings. The enforcement is detection-oriented, not prevention-oriented. Validation warnings are now captured in the execution trace, making ignored warnings visible in post-hoc review.
- **In-memory trace lifespan** — the `TraceStore` lives in server memory. On server restart, accumulated events are lost. Trace tokens issued before the restart remain valid as self-contained attestations (event data is embedded), but ad-hoc `get_trace` queries without tokens return empty results for prior sessions.
- **Semantic trace is agent-dependent** — the agent-written semantic trace (step outputs, checkpoint responses, variable changes) relies on agent discipline. The server cannot verify that the agent wrote it or that it is complete.

## Related

- [API Reference](api-reference.md) — tool parameters and validation response format
- [IDE Setup](ide-setup.md) — bootstrap configuration
