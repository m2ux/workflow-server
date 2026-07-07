# State Management & Deterministic Transitions

The Workflow Server strictly enforces **deterministic state machine transitions**. Instead of relying on an LLM to probabilistically "guess" what to do next based on conversational context, the system utilizes a rigid variable-based state evaluation model.

## 1. Variable Initialization

Every workflow defines a set of schema-validated state variables in its `workflow.yaml` file. When a new session is bootstrapped by the Meta Orchestrator, the Workflow Orchestrator initializes its internal state dictionary using these default values.

Example `workflow.yaml` variables:
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

When an activity is fully complete, the Workflow Orchestrator consults the `transitions` array defined in the activity's `.yaml` file.

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

## 4. Conditional Execution

A workflow varies its path through ordinary state. A boolean **activation variable** (e.g. `is_review_mode`), set by a detection step or checkpoint early in the workflow, marks the variant; conditional `transitions` and step `when` / `condition` gates branch on it to skip or redirect activities. Because the variable lives in the single state bag, the variant persists across activities automatically — work-package's review mode and workflow-design's update/review modes are built this way.

## 5. Persistence

**State persistence is server-managed.** The server owns the canonical session state and writes it to disk atomically on every authenticated tool call. Agents do not read or write session state themselves — they only pass a 6-character `session_index` on every call.

For each session, the server maintains two files under the planning folder (`<workspace>/.engineering/artifacts/planning/<slug>/`):

* **`session.json`** — Plaintext, JSON-Schema-validated session state (`schemas/session-file.schema.json`). Contains `sessionIndex`, `workflowId`, `workflowVersion`, `agentId`, `seq`, `currentActivity`, `currentTechnique`, `condition`, `activeCheckpoint`, `variables`, `completedActivities`, `skippedActivities`, `checkpointResponses`, `history`, `triggeredWorkflows`, and (for child workflows) a snapshot of the parent under `parentSession`. The file is human-inspectable and reproducible from the workflow definition.
* **`.session-token`** — A sealed, HMAC-signed envelope binding the `session.json` contents to the workspace + server signing key. Verified on every read; any mismatch between `session.json` and `.session-token` raises a hard `SealMismatchError`.

Writes are atomic (write-temp + rename) and ordered: `session.json` first, then `.session-token`. Reads verify the seal before returning state.

The `session_index` is deterministically derived from the planning slug (a single-segment slug for the planning folder under `<workspace>/.engineering/artifacts/planning/<slug>/`). For the full file shape, see the JSON Schema (`schemas/session-file.schema.json`).

This enables the session to be safely paused, terminated, or resumed at any point without losing its place in the state machine. Resume is a single call: `start_session({ agent_id, planning_slug })` — the server loads `session.json`, verifies the seal, and returns the same `session_index`. Because state lives in `session.json` (not in the token), server restarts are transparent and there is no "adoption" or "recovery" step for the agent to handle.
