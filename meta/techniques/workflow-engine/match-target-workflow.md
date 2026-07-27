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
   - **Actionable-target tie-breaker:** when the request names a specific existing PR, issue, or implementation to act on (parseable `#NNNN` / PR URL / "review this PR"), favor the entry whose `description` declares it carries such a target end-to-end over one that only shares a broad `tag`. A request with no specific target scores on `tags` and `description` fit alone.

## Rules

### actionable-target-outranks-tag-overlap

Tag overlap alone never outranks a concrete actionable-target signal in the request. An entry earns a named PR, issue, or implementation only by declaring in its `title` or `description` that it carries one end-to-end — never by sharing a broad tag with the request.
