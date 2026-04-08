---
id: activity-execution
version: 1.0.0
---

# Execute Activity Reference

Reference material for the execute-activity skill. Contains the metamodel, goal resolution strategy, detailed phase guidance, output format specifications, and semantic trace format.

## Metamodel

Goals resolve to workflows; workflows contain activities; activities resolve to skills. Goals NEVER resolve directly to skills.

| Layer | Domain | Resolution |
|-------|--------|------------|
| User Goal | Problem domain | → Workflow |
| Workflow → Activity | Solution domain | → Skill(s) |
| Skill | Execution domain | → Tools |

**Gap detection:** If a goal matches a skill but no workflow/activity exists, this indicates a missing workflow or activity — do not bypass the workflow layer.

## Goal Resolution Strategy

Compare the user's goal to workflow descriptions returned by `list_workflows`. If multiple workflows could match, ask the user to clarify. NEVER skip workflow matching to use a skill directly. If no workflow matches, inform the user — this is a design gap, not a user error.

## Phase: update-readme-progress

MANDATORY before returning `activity_complete`. Read the planning folder `README.md`.

1. In the Progress table, mark each artifact produced by this activity as `✅ Complete`. If the activity itself represents a progress row (e.g., Implementation, Validation), update that row's status too.
2. Update descriptive text in the Status column to reflect what was done (e.g., "Code quality review (4/5, M1-M3 fixed)").
3. Update the footer status line to reflect the current workflow position (e.g., "Implementation complete — PR submitted for review").
4. Write the updated `README.md` back to disk. The orchestrator will include it in the same commit as the activity's artifacts.

## Output Formats

### activity-complete

Final result when all steps and checkpoints are done.

| Field | Description |
|-------|-------------|
| `result_type` | `"activity_complete"` |
| `variables_changed` | Map of variable names to new values (only variables that changed) |
| `checkpoints_responded` | Array of checkpoint responses with option IDs and effects |
| `artifacts_produced` | Array of artifacts with IDs and file paths |
| `steps_completed` | Array of completed step IDs |
| `transition_override` | Activity ID to transition to (if a checkpoint effect specified `transitionTo`) |

### checkpoint-pending

Intermediate result when a blocking checkpoint is reached — execution is paused.

| Field | Description |
|-------|-------------|
| `result_type` | `"checkpoint_pending"` |
| `checkpoint_id` | ID of the blocking checkpoint |
| `checkpoint_message` | The checkpoint prompt text |
| `checkpoint_options` | Array of options with id, label, description, effect |
| `steps_completed_so_far` | Steps completed before this checkpoint |
| `partial_variables_changed` | Any variables changed by steps before this checkpoint |
| `artifacts_produced_so_far` | Any artifacts produced before this checkpoint |
