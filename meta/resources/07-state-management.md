---
id: state-management
version: 1.0.0
---

# State Management Reference

Reference material for workflow state initialization, update patterns, and resumption. State structure and field definitions are in `state.schema.json` — this document defines HOW to use the schema at runtime.

## Numeric Format

State uses activity IDs for navigation, step indices within activities.

| Field | Example |
|-------|---------|
| `currentActivity` | `"start-work-package"` (activity ID from workflow) |
| `currentStep` | `1` (1-based index within activity) |
| `completedActivities` | `["start-work-package", "design-philosophy"]` |
| `completedSteps` | `{ "start-work-package": [1, 2, 3], "design-philosophy": [1, 2] }` |

## Initialization

**Trigger:** On workflow start (`get_workflow`)

Set initial state:
- `workflowId`: workflow.id
- `workflowVersion`: workflow.version
- `stateVersion`: 1
- `startedAt`, `updatedAt`: now()
- `currentActivity`: workflow.initialActivity
- `currentStep`: 1
- `completedActivities`, `skippedActivities`: []
- `completedSteps`, `checkpointResponses`, `decisionOutcomes`: {}
- `activeLoops`: []
- `variables`: workflow.variables.defaults
- `history`: [{ timestamp: now(), type: workflow_started, activity: initialActivity }]
- `status`: running

## Update Patterns

### activity_transition
Move to a new activity: add previous activity to `completedActivities`, set `currentActivity`, reset `currentStep` to 1, log `activity_entered`.

### step_completion
Complete a step: add step index to `completedSteps[currentActivity]`, increment `currentStep`, log `step_completed`.

### checkpoint_response
User responds to checkpoint: record in `checkpointResponses` with key `"activity-checkpoint"`, apply effects (`setVariable`, `transitionTo`, `skipActivities`), log `checkpoint_response`.

### decision_outcome
Decision branch taken: record in `decisionOutcomes` with key `"activity-decision"`, store `branchId` and `transitionedTo`, log `decision_branch_taken`.

### workflow_completion
Workflow finishes: set `completedAt`, set status to `completed`, log `workflow_completed`. If `parentWorkflow` exists, return context to parent.

### workflow_trigger
Activity triggers another workflow: set status to `suspended`, log `workflow_triggered`, record in `triggeredWorkflows`, initialize new workflow state with `parentWorkflow` reference, pass context variables from `triggers.passContext`.

### workflow_return
Triggered workflow completes: update `triggeredWorkflows` entry with `returnedContext`, set parent status back to `running`, resume at `returnTo` position, merge returned context, log `workflow_returned`.

## Resumption

To resume a workflow from persisted state:
1. Load the state object
2. Verify `workflowId` and `workflowVersion` match available workflow
3. Set status to `running` if it was `paused`
4. Load the activity at `currentActivity`
5. Continue from `currentStep` within that activity
6. Present any pending checkpoints

The `history` array provides context for what was previously completed.
