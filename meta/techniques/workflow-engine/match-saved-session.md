---
metadata:
  version: 1.0.0
---

## Capability

Pick the saved-session candidate that best matches an identifying context.

## Inputs

### context

Map of identifiers to match against: `{ issue_number?, branch_name?, pr_number?, work_package? }`

### candidates

Array of saved-session candidates `{ planning_slug, sessionIndex, savedAt, variables }` to choose among

## Output

### match

Best matching candidate `{ planning_slug, sessionIndex, savedAt }`, or null when none match

## Protocol

1. Score each candidate by overlap between its variables (`issue_number`, `branch_name`, `pr_number`, work-package description, planning-folder name) and `context`; pick the most recently-updated by `savedAt` on ties; return null when no candidate has any overlap.
