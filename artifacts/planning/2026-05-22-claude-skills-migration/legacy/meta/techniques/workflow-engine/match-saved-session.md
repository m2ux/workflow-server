# match-saved-session

Pick the saved-session candidate that best matches an identifying context.

## Inputs

### context

Identifying context from [extract-identifying-context](extract-identifying-context.md)

### candidates

Saved sessions from [scan-saved-sessions](scan-saved-sessions.md)

## Output

### match

Best matching candidate `{ planning_slug, sessionIndex, savedAt }`, or null when none match

## Procedure

1. Score each candidate by overlap between its variables (`issue_number`, `branch_name`, `pr_number`, work-package description, planning-folder name) and `context`; pick the most recently-updated by `savedAt` on ties; return null when no candidate has any overlap.
