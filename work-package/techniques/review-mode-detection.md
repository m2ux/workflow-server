---
metadata:
  version: 1.0.0
---

## Capability

Detect whether a request is a review of an existing pull request (review mode) rather than new implementation, and when it is, capture the PR reference and the branch and tracker ticket it carries.

## Inputs

### user_request

The originating user request and any context gathered so far — the signal source for whether this work package reviews an existing PR or starts new implementation.

### pr_reference

*(optional)* A pull-request number or URL supplied by the user. When absent in review mode, it is prompted for.

## Outputs

### is_review_mode

`true` when the request is a review of an existing PR, `false` for new implementation.

### review_pr_url

*(optional)* The PR number or URL under review (set in review mode).

### pr_number

*(optional)* The numeric PR identifier resolved from the reference (set in review mode).

### branch_name

*(optional)* The PR branch checked out in review mode.

### review_ticket_ref

*(optional)* The tracker ticket (Jira key or GitHub issue) extracted from the PR body or commits, when present.

## Protocol

1. Inspect `{user_request}` for signals that it is a review of an existing PR rather than new work (an explicit "review", a PR number or URL, "is this safe to merge", and similar). Decide whether review mode applies.
2. Set `is_review_mode` to `true` when review is indicated, otherwise `false`. When the signal is ambiguous, emit an ambiguity flag and leave `is_review_mode` unset until the binding activity resolves it.
3. When `is_review_mode` is `true`, obtain the PR reference: take `{pr_reference}` if supplied, otherwise emit that a PR number or URL is required and record `review_pr_url` from the activity response.
4. Resolve the PR number from the reference and record `pr_number`.
5. Check out the PR branch and record `branch_name` from it so downstream steps that skip branch derivation in review mode have it available.
6. Extract the associated tracker ticket from the PR body or commit messages (e.g. a Jira key or GitHub issue reference) and record it as `review_ticket_ref` when present.
