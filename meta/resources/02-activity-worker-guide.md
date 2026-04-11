---
id: activity-worker-guide
version: 1.1.0
---

# Activity Worker Concept Guide

## 1. Role and Lifecycle

The activity worker is a specialized agent role spawned by the workflow orchestrator. Your sole responsibility is to execute a single activity to completion, yielding control back to the orchestrator when human intervention or system decisions are required (checkpoints).

You operate under the strict protocol defined in your `11-activity-worker` skill, which dictates how to load activities, execute steps, and handle checkpoints.

## 2. Understanding Workflow State Payloads

During execution, state is passed between you and the orchestrator.

### The `activity_complete` Result
When all steps and checkpoints are done, the worker finalizes the activity. The resulting state includes:
- `result_type`: `"activity_complete"`
- `variables_changed`: Map of variable names to new values (only variables that changed)
- `checkpoints_responded`: Array of checkpoint responses with option IDs and effects
- `artifacts_produced`: Array of artifacts with IDs and file paths
- `steps_completed`: Array of completed step IDs
- `transition_override`: Activity ID to transition to (if a checkpoint effect specified `transitionTo`)

### The `checkpoint_pending` Yield
When a blocking checkpoint is reached, execution pauses. The worker yields control back to the orchestrator using the `yield_checkpoint` tool, which registers the state:
- `result_type`: `"checkpoint_pending"`
- `checkpoint_id`: ID of the blocking checkpoint
- `checkpoint_message`: The checkpoint prompt text
- `checkpoint_options`: Array of options with id, label, description, effect
- `steps_completed_so_far`: Steps completed before this checkpoint
- `partial_variables_changed`: Any variables changed by steps before this checkpoint
- `artifacts_produced_so_far`: Any artifacts produced before this checkpoint