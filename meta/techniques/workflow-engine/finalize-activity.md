Compile the `activity_complete` result after all steps, checkpoints, and artifacts are done.

## Inputs

### steps_completed

Array of completed step entries

### checkpoints_responded

Array of checkpoint responses (`option_id` + effects)

### artifacts_produced

Array of artifact entries (`id`, `name`, `path`)

## Output

### result

`{ result_type: 'activity_complete', steps_completed, checkpoints_responded, variables_changed, artifacts_produced, transition_override? }`

## Protocol

1. Update the planning folder's `README.md` Progress table for each artifact produced and the footer status.
2. Compile and return the `activity_complete` object; include `transition_override` if a checkpoint effect specified `transitionTo`.
