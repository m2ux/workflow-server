---
metadata:
  version: 1.1.0
---

## Capability

Pick the saved-session candidate that best matches an identifying context.

## Inputs

### identifying_context

Map of identifiers to match against: `{ issue_number?, branch_name?, pr_number?, work_package? }`

### saved_session_candidates

Array of saved-session candidates `{ planning_slug, sessionIndex, savedAt, variables }` to choose among

## Outputs

### matched_session

Best matching candidate `{ planning_slug, sessionIndex, savedAt }`, or null when none match

## Protocol

1. Score each entry in `{saved_session_candidates}` by overlap between its variables (`issue_number`, `branch_name`, `pr_number`, work-package description, planning-folder name) and `{identifying_context}`; return the highest-scoring candidate as `{matched_session}`, breaking ties in favour of the most recently-updated by `savedAt`; return null as `{matched_session}` when no candidate has any overlap. `{mentioned_repo}` is deliberately outside this scoring — it is component context, not a session identifier, so a repository the request happens to name must never steer which session resumes ([host-is-derived-component-is-named](../version-control/TECHNIQUE.md#host-is-derived-component-is-named)). That is why [extract-identifying-context](./extract-identifying-context.md) emits it as a sibling of `{identifying_context}` rather than a field inside it.
