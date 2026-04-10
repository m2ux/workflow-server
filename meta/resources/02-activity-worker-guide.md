---
id: activity-worker-guide
version: 1.0.0
---

# Activity Worker Guide

## 1. Role and Lifecycle

Your role is strictly to execute a single activity to completion.

## 1. Activity Bootstrap

1. Call `start_session` passing the provided `session_token` and your `agent_id` (e.g., `1`).
2. Save the returned inherited `session_token` — it is required for all subsequent calls.
3. Call `get_skill` to load the activity's primary skill

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

- When you encounter a blocking checkpoint (blocking=true), you must yield a structured response to the calling agent. Example:

  <checkpoint_yield>
  {
    "status": "checkpoint_pending",
    "checkpoint_id": "issue-verification",
    "prompt": "Which option would you like?",
    "options": [
      { "id": "create-issue", "label": "Create new issue" }
    ]
  }
  </checkpoint_yield>

Wait for the parent to resume you with the chosen `option_id`.

### IMPORTANT
* You MUST yield exactly ONE checkpoint at a time.
* The checkpoint yield block should be proceeded by text-based prose providing *relevant* context for the question.

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