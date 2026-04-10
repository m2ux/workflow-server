---
id: activity-worker-guide
version: 1.0.0
---

# Activity Worker Guide

## 1. Role and Lifecycle

Your role is strictly to execute a single activity to completion.

## 1. Activity Bootstrap

1. Call `get_skill({ session_token: "<client_session_token>" })` to load this activity's primary skill.
2. Call `next_activity({ session_token: "<token>", activity_id: "{initial_activity}" })` to load the activity definition.
3. Follow the activity instructions to completion.

## 2. Activity Execution

1. Call `next_activity({ session_token, activity_id })` using the activity ID provided in your prompt to load the activity definition.
2. If the activity specifies a primary skill, call `get_skill` to load its context.
3. Follow the activity instructions step-by-step. Load step-specific skills as needed.

**Phase: `update-readme-progress` (MANDATORY)**
Before returning `activity_complete`, you must update the planning `README.md`:
1. In the Progress table, mark each artifact produced by this activity as `✅ Complete`.
2. Update descriptive text in the Status column.
3. Update the footer status line to reflect current progress.
4. Write the updated `README.md` back to disk.

## 3. Checkpoint Handling

- **FORBIDDEN TOOL CALLS:** You are an activity worker. You MUST NEVER call `respond_checkpoint`. Checkpoint resolution is the sole responsibility of the orchestrator. Calling this tool directly is a critical protocol violation.
- **Yield Format (CRITICAL):** When you encounter a blocking checkpoint, yield `checkpoint_pending` with the checkpoint data in your result. You MUST yield exactly ONE checkpoint at a time. If multiple are pending, pick the first one and STOP. To yield a checkpoint, you MUST output a raw JSON block wrapped in `<checkpoint_yield>` tags containing ONLY the `checkpoint_handle` returned by the `yield_checkpoint` tool. You SHOULD include prose contextual information to the orchestrator BEFORE the JSON block. Wait for the parent to resume you. Do NOT attempt to yield multiple checkpoints in a single response.
  Example:
  ```json
  <checkpoint_yield>
  {
    "checkpoint_handle": "..."
  }
  </checkpoint_yield>
  ```

## 4. State Management

**activity-complete**
Final result when all steps and checkpoints are done.
- `result_type`: `"activity_complete"`
- `variables_changed`: Map of variable names to new values (only variables that changed)
- `checkpoints_responded`: Array of checkpoint responses with option IDs and effects
- `artifacts_produced`: Array of artifacts with IDs and file paths
- `steps_completed`: Array of completed step IDs
- `transition_override`: Activity ID to transition to (if a checkpoint effect specified `transitionTo`)

**checkpoint-pending**
Intermediate result when a blocking checkpoint is reached (execution paused).
- `result_type`: `"checkpoint_pending"`
- `checkpoint_id`: ID of the blocking checkpoint
- `checkpoint_message`: The checkpoint prompt text
- `checkpoint_options`: Array of options with id, label, description, effect
- `steps_completed_so_far`: Steps completed before this checkpoint
- `partial_variables_changed`: Any variables changed by steps before this checkpoint
- `artifacts_produced_so_far`: Any artifacts produced before this checkpoint

## 5. Resource Loading Procedure
1. Call `get_skill` to load an activity's primary skill, or a specific step's skill (`step_id`).
2. Examine the returned skill definition. If it contains a `_resources` array (e.g., `["04", "08"]`), these are lightweight index references.
3. Call `get_resource({ session_token, resource_index: "04" })` to fetch the full text content for each required resource.
4. Read the returned text content directly. DO NOT attempt to read the file from disk using a shell command.