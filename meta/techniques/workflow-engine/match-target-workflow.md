Match a user request against the workflow catalog and surface ambiguity.

## Inputs

### user_request

User's free-form request

### catalog

Array of workflow entries from [list-workflows](./list-workflows.md)

## Output

### target_workflow_id

Best-match workflow id, or null when no candidate matches

### ambiguous

true when more than one workflow matches with similar confidence

## Protocol

1. Score each catalog entry against `user_request` by title, description keywords, and recognition tags; return the top match and set `ambiguous` when the top scores are close.
