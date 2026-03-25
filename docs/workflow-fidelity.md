# Workflow Fidelity Enforcement

How the workflow server ensures agents follow workflows correctly.

## The Problem

AI agents executing multi-step workflows face two reliability challenges:

1. **Context degradation** — as conversations grow, earlier instructions (including workflow definitions) fall out of the model's effective attention window, leading to skipped steps, wrong transitions, and hallucinated procedures
2. **Behavioral drift** — without enforcement, agents may take shortcuts, skip checkpoints, or fabricate state rather than following the defined execution path

The workflow server addresses these through four layers of enforcement, each operating at a different granularity.

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
└─────────────────────────────────────────────┘
```

### Layer 1: Token Integrity

Every session token is HMAC-SHA256 signed using a server-held key (`~/.workflow-server/secret`). The token format is `<base64url-payload>.<hmac-signature>`.

**What it enforces:**
- Agents cannot fabricate tokens — the server rejects any token it didn't issue
- Agents cannot tamper with token fields (workflow ID, activity, sequence counter) — modifying any field invalidates the signature
- Each tool call produces a new token with an incremented counter, ensuring tokens are unique per exchange

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

**Design principle:** Warnings don't block execution — the tool still returns its result. This allows agents to self-correct rather than being hard-blocked, while making violations visible.

### Layer 3: Transition Condition Tracking

When calling `get_activity` to transition to a new activity, agents can include a `transition_condition` parameter — the condition string (from `next_activity` output) that caused the transition.

**What it enforces:**
- The claimed condition actually maps to the target activity in the transition table
- Default transitions are correctly reported (no false condition claims)
- The condition is recorded in the HMAC-signed token, creating an immutable audit trail

**What it cannot verify in real-time:** Whether the condition is actually true in the agent's state. However, conditions are typically set by user choices at checkpoints, which are logged. Post-hoc review can cross-reference claimed conditions against checkpoint responses.

### Layer 4: Step Completion Manifest

When transitioning between activities, agents can include a `step_manifest` parameter — a structured summary of each step completed in the previous activity.

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

## Context Pressure Mitigation

Beyond enforcement, the server reduces the context burden on agents:

### Summary Mode

`get_workflow(summary=true)` returns lightweight metadata (~2KB) instead of the full workflow definition (~13KB). The orchestrator gets rules, variables, and activity stubs without consuming its context window with step-level detail.

### Server-Side Transition List

`next_activity` returns the transition list for the current activity with human-readable conditions. The agent matches conditions against its state variables using a fresh list from the server, rather than referencing a workflow definition loaded many exchanges ago.

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

## At-Rest Token Security

When workflow state is persisted via `save_state`, the session token is encrypted using AES-256-GCM before writing to disk. `restore_state` decrypts it transparently. This prevents token extraction from state files.

## Limitations

- **Step execution is not provable** — the manifest validates that the agent *reported* each step, not that it *performed* the work. The output descriptions are agent-generated.
- **Condition truth is not verified** — the server checks that a claimed condition maps to the target activity, but cannot verify whether the condition is actually true in the agent's state. Post-hoc audit via checkpoint logs is possible.
- **Replay is not detected** — an agent could present an old valid token. The HMAC proves authenticity but not freshness (the server is stateless).
- **Warnings are advisory** — a confused agent may ignore validation warnings. The enforcement is detection-oriented, not prevention-oriented.

## Related

- [API Reference](api-reference.md) — tool parameters and validation response format
- [IDE Setup](ide-setup.md) — bootstrap configuration
