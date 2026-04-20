# State Management & Deterministic Transitions

The Workflow Server strictly enforces **deterministic state machine transitions**. Instead of relying on an LLM to probabilistically "guess" what the next activity should be based on conversational context, the system utilizes a rigid variable-based state evaluation model.

## 1. Variable Initialization
Every workflow defines a set of schema-validated state variables in its `workflow.toon` file. When a new session is bootstrapped by the Meta Orchestrator, the Workflow Orchestrator initializes its internal state dictionary using these default values.

Example `workflow.toon` variables:
```yaml
variables:
  is_monorepo: false
  review_mode: false
  has_critical_bugs: false
```

## 2. State Mutation
State variables can be mutated in two primary ways during an activity's lifecycle:

### A. Checkpoint Effects
When a worker encounters a blocking checkpoint (e.g., asking the user to confirm if a repository is a monorepo), the user selects an option via the Meta Orchestrator. 
The server's response (`respond_checkpoint`) may contain predefined `effects`:
```json
"effect": {
  "setVariable": { "is_monorepo": true }
}
```
The Meta Orchestrator passes these variable updates down to the Workflow Orchestrator, which applies them to its internal state dictionary before passing them down to the worker.

### B. Worker Outputs
When an Activity Worker successfully completes an activity, it returns an `activity_complete` payload. This payload includes a `variables_changed` object containing any variables the worker programmatically determined needed updating based on its domain logic (e.g., setting `has_critical_bugs` to true after running tests).

## 3. Transition Evaluation
When an activity is fully complete, the Workflow Orchestrator consults the `transitions` array defined in the activity's `.toon` file.

Example transition block:
```yaml
transitions:
  - condition: "is_monorepo == true"
    to: "select-submodule"
  - condition: "default"
    to: "analyze-codebase"
```

**The Rule of Determinism:** The Workflow Orchestrator *must not* ask the user or the LLM what to do next. It evaluates the transitions in array order against its current internal variable state. The first condition that evaluates to `true` determines the next activity ID. It then automatically calls `next_activity` with that ID.

## 4. Persistence (`workflow-state.json`)
After each activity completion and state mutation, the Workflow Orchestrator must persist the current variable dictionary, session token, and trace tokens to a `workflow-state.json` file inside the planning folder.

The session token is opaque — agents must never decode the token payload to extract session identity (decoding tokens risks corruption). Session identity is embedded within the HMAC-signed token itself; there is no separate `session_id` or `sessionId` field. 

This enables the session to be safely paused, terminated, or resumed at any point without losing its place in the state machine. If a session is resumed, the Workflow Orchestrator reads `workflow-state.json`, passes the saved `sessionToken` to `start_session(agent_id, session_token=saved_token)`, and the server either inherits the session (HMAC valid), adopts it by re-signing (HMAC invalid due to server restart, but payload intact — returns `adopted: true`), or falls back to a fresh session (payload corrupted — returns `recovered: true`). When `recovered: true` is returned, the orchestrator must reconstruct state by transitioning to the `currentActivity` and restoring variables from the saved state file. Stale-session detection is handled by the server: the `adopted` and `recovered` flags in the `start_session` response indicate whether the session was inherited, adopted (re-signed), or recovered (fresh session).