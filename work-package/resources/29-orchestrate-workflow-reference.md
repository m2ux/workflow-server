# Orchestrate Workflow Reference

Reference material for the orchestrate-workflow skill. Contains detailed phase guidance, state management procedures, checkpoint presentation protocol, and artifact commit procedures.

## Phase: initialize-state

1. Determine `planning_folder_path` from workflow variables or user request context.
2. Check for saved state: if `planning_folder_path` is known, check whether `{planning_folder_path}/workflow-state.toon` exists. If it does, call `restore_state({ file_path })` to load persisted state.
3. If state was restored: compare `state.workflowVersion` against the loaded workflow's version. If they differ, warn the user and offer to continue or start fresh. Adopt all restored fields (currentActivity, completedActivities, variables, checkpointResponses, history, status). Set `is_resuming = true`.
4. If no state file or user chose fresh: set all workflow variables to declared defaults, set `current_activity` to `initialActivity`, initialize empty collections. Set `is_resuming = false`.
5. Detect mode from user request (e.g., "review PR" activates review mode). If resuming, restored variables already encode the active mode — do not override unless the user explicitly requests a mode change.

## Phase: dispatch-activity

1. Call `next_activity({ workflow_id, activity_id: current_activity })` to load the activity definition.
2. Compose the worker prompt using attached resource 05 (worker-prompt-template). Fill in placeholders with current values. Do NOT add paraphrased skill content, tool parameter lists, or resource content beyond the template.
3. **SKILL-LOADING BOUNDARY:** Do NOT call `get_skill` or `get_skills` at the orchestrator level. The worker calls these itself during bootstrap.
4. First dispatch: use Task tool with `subagent_type=generalPurpose`. Subsequent dispatches: use `resume=worker_agent_id`.
5. For resumed workers: send only the new `activity_id`, updated state variables, and bootstrap instructions.
6. If `is_resuming` is true (first dispatch after state restoration): include a resumption context block listing completedActivities, key variable values, and prior checkpoint decisions. After this first dispatch completes, set `is_resuming = false`.

## Phase: process-result

1. Read worker output and check `result_type` field.
2. If `checkpoint_pending`: go to handle-checkpoint-yield.
3. If `activity_complete`: extract `variables_changed`, `checkpoints_responded`, `artifacts_produced`, `steps_completed`.
4. **Validation:** Compare worker's `steps_completed` against the activity's required steps, and `checkpoints_responded` against required blocking checkpoints. If any are missing, resume the worker to complete them — do not advance.
5. If validation passes: apply all variable changes, record activity in `completedActivities`.
6. **Trace tokens:** Check `next_activity` response's `_meta.trace_token`. If present, append to the `trace_tokens` array.

## Phase: handle-checkpoint-yield

1. Extract `checkpoint_id`, `checkpoint_message`, `checkpoint_options` from worker result.
2. Apply any `partial_variables_changed` to orchestrator state before presenting.
3. **Context first:** If the worker result includes contextual information (findings, summaries, drafted content), output it as a text message BEFORE the AskQuestion call.
4. **AskQuestion focused:** The AskQuestion call contains ONLY the checkpoint question and options. No contextual prose in the prompt.
5. Map `checkpoint_message` to prompt, `checkpoint_options` to selectable choices with `{id, label}`.
6. Resume the worker with `checkpoint_response: { checkpoint_id, selected_option_id, effects_applied }`.

## Phase: append-trace

MANDATORY after every `activity_complete`. Appends mechanical trace data to the unified trace file.

1. Call `get_trace({ session_token, trace_tokens })` to resolve accumulated trace tokens into mechanical events.
2. Read `{planning_folder_path}/workflow-trace.json` (the worker has already appended its semantic trace entry for this activity).
3. Append a new entry: `{ type: "mechanical", activity_id, event_count, events }`.
4. Write the updated array back to disk.
5. Clear the `trace_tokens` array for the next activity.

The unified trace file (`workflow-trace.json`) is a JSON array where each entry is either:
- `{ type: "semantic", activity_id, artifact_prefix, started_at, completed_at, events: [...] }` — written by the worker
- `{ type: "mechanical", activity_id, event_count, events: [...] }` — written by the orchestrator

Entries accumulate chronologically throughout the session. The file provides a complete record of both agent-side decisions and server-side tool call timing.

## Phase: commit-artifacts

1. Run `git status --porcelain .engineering/artifacts/` to detect uncommitted changes.
2. If changes exist: stage all changed files (verify README.md is staged).
3. Follow `.engineering/AGENTS.md` commit procedures (regular files commit directly; submodule paths require two-step commit-and-push).
4. Commit with conventional format: `docs(<workflow-id>): <activity-id> artifacts`.
5. Do NOT proceed to state persistence unless artifacts are committed or no changes detected.

## Phase: persist-state

1. Construct current workflow state as a JSON object (workflowId, workflowVersion, stateVersion, timestamps, currentActivity, completedActivities, variables, checkpointResponses, history, status).
2. Call `save_state` with state, `planning_folder_path`, and description.
3. The file at `{planning_folder_path}/workflow-state.toon` always reflects the latest state.
4. If `planning_folder_path` is not set, skip silently.

## Tool Reference

### save_state
- **When:** After every activity_complete, after artifacts committed
- **Params:** `state` (JSON string), `planning_folder_path`, `description` (optional)
- **Returns:** File path and summary

### restore_state
- **When:** Resuming a workflow from saved state
- **Params:** `file_path` (path to workflow-state.toon)
- **Returns:** Full nested state object as JSON

### get_trace
- **When:** After each activity_complete — resolve trace tokens for the completed segment
- **Params:** `session_token`, `trace_tokens` (array of opaque strings accumulated from `next_activity` responses)
- **Returns:** Mechanical trace events (tool calls, timing, validation warnings)
- **Usage:** Append the returned events to `{planning_folder_path}/workflow-trace.json` as a mechanical trace entry. Clear `trace_tokens` after each call.
