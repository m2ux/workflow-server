# State Management & Deterministic Transitions

The Workflow Server strictly enforces **deterministic state machine transitions**. Instead of relying on an LLM to probabilistically "guess" what to do next based on conversational context, the system utilizes a rigid variable-based state evaluation model.

## 1. Variable Initialization

Every workflow defines a set of schema-validated state variables in its `workflow.toon` file. When a new session is bootstrapped by the Meta Orchestrator, the Workflow Orchestrator initializes its internal state dictionary using these default values.

Example `workflow.toon` variables:
```yaml
variables:
  - name: is_monorepo
    type: boolean
    defaultValue: false
  - name: review_mode
    type: boolean
    defaultValue: false
  - name: planning_folder_path
    type: string
    required: true
```

The `VariableDefinitionSchema` supports types: `string`, `number`, `boolean`, `array`, `object`.

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
When an Activity Worker successfully completes an activity, it returns a structured result. This payload includes any variables the worker programmatically determined needed updating based on its domain logic (e.g., setting `has_critical_bugs` to true after running tests).

## 3. Transition Evaluation

When an activity is fully complete, the Workflow Orchestrator consults the `transitions` array defined in the activity's `.toon` file.

Example transition block:
```yaml
transitions:
  - to: "select-submodule"
    condition:
      type: simple
      variable: is_monorepo
      operator: ==
      value: true
  - to: "analyze-codebase"
    isDefault: true
```

Transitions can also be defined via:
- **Decision branches** — `decisionBranch.transitionTo` fields
- **Checkpoint options** — `checkpointOption.effect.transitionTo` fields

**The Rule of Determinism:** The Workflow Orchestrator *must not* ask the user or the LLM what to do next. It evaluates the transitions in array order against its current internal variable state. The first condition that evaluates to `true` determines the next activity ID. It then automatically calls `next_activity` with that ID.

The `evaluateCondition()` function in `condition.schema.ts` handles structured `Condition` objects:
- `simple` — variable comparison with operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `exists`, `notExists`
- `and` / `or` — boolean combinations of nested conditions
- `not` — negation of a single condition

## 4. Mode Overrides

Workflows can define execution `modes` that modify standard behavior. Each mode has:
- `activationVariable` — the variable that activates this mode when true
- `skipActivities` — activity IDs to skip entirely in this mode
- `defaults` — default variable values when the mode is active
- `resource` — optional path to a resource file with detailed mode guidance

Activities can define `modeOverrides` that override steps, checkpoints, rules, or transitions for specific modes.

## 5. Persistence

After each activity completion and state mutation, the Workflow Orchestrator must persist the current variable dictionary, session token, and trace tokens to disk.

The session token is opaque — agents must never decode the token payload to extract session identity (decoding tokens risks corruption). Session identity is embedded within the HMAC-signed token itself; there is no separate `session_id` or `sessionId` field.

This enables the session to be safely paused, terminated, or resumed at any point without losing its place in the state machine. If a session is resumed, the Workflow Orchestrator reads the saved state, passes the saved `sessionToken` to `start_session(agent_id, session_token=saved_token)`, and the server either inherits the session (HMAC valid), adopts it by re-signing (HMAC invalid due to server restart, but payload intact — returns `adopted: true`), or falls back to a fresh session (payload corrupted — returns `recovered: true`). When `recovered: true` is returned, the orchestrator must reconstruct state by transitioning to the `currentActivity` and restoring variables from the saved state file.
