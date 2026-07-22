---
metadata:
  version: 1.1.0
---

## Capability

Match a user request against the workflow catalog and surface ambiguity.

## Inputs

### user_request

User's free-form request.

### workflow_catalog

Array of available workflow entries `{ id, title, description, tags }` to match against

## Outputs

### target_workflow_id

Best-match workflow id, or null when no candidate matches.

### match_ambiguous

true when more than one workflow matches with similar confidence

## Protocol

1. Score each catalog entry against `{user_request}` by title, description keywords, and `tags`; return the top match as `{target_workflow_id}` and set `{match_ambiguous}` when the top scores are close.
2. **Actionable-target tie-breaker:** When the request names a specific existing PR, issue, or implementation to review or act on (parseable `#NNNN` / PR URL / "review this PR"), favor the workflow that can carry that target end-to-end (e.g. `work-package` review mode) over a candidate that only shares a broad tag such as `review`. Tag overlap alone must not outrank a concrete actionable-target signal. Broad merge-readiness audits with no specific PR still prefer a dedicated review workflow when tags and description fit better.
