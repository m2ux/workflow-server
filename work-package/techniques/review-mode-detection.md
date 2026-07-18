---
metadata:
  version: 1.1.0
---

## Capability

Detect whether a request is a review of an existing pull request (review mode) rather than new implementation, and when it is, capture the PR reference and the branch and tracker ticket it carries — derive-first, with gap flags when mode or PR identity cannot be settled from the request alone.

## Inputs

### user_request

The originating user request and any context gathered so far — the signal source for whether this work package reviews an existing PR or starts new implementation.

### pr_reference

*(optional)* A pull-request number or URL supplied by the user. When absent in review mode and no reference can be parsed from `{user_request}`, set `review_pr_missing` so the activity can prompt.

## Outputs

### is_review_mode

`true` when the request is a clear review of an existing PR, `false` for clear new implementation. Leave unset when `review_mode_ambiguous` is `true` until the binding activity resolves the gap.

### review_mode_ambiguous

`true` only when review vs create intent cannot be derived confidently from `{user_request}` (rare). Common clear-intent paths leave this `false`.

### review_pr_url

*(optional)* The PR number or URL under review (set in review mode when known).

### pr_number

*(optional)* The numeric PR identifier resolved from the reference (set in review mode when known). Empty when unresolved.

### review_pr_missing

`true` when review mode is active (or will be after an ambiguity confirm) and no PR number or URL could be derived from `{pr_reference}` or `{user_request}`. `false` when a PR identity is already known.

### branch_name

*(optional)* The PR branch checked out in review mode.

### review_ticket_ref

*(optional)* The tracker ticket (Jira key or GitHub issue) extracted from the PR body or commits, when present.

## Protocol

1. Inspect `{user_request}` for signals that it is a review of an existing PR rather than new work (an explicit "review", a PR number or URL, "is this safe to merge", and similar). Prefer an immediate derive: clear "review" / review-intent language → review mode; clear create/implement intent without review signals → not review mode.
2. When intent is clear, set `is_review_mode` accordingly and set `review_mode_ambiguous` to `false`. When the signal is ambiguous, set `review_mode_ambiguous` to `true` and leave `is_review_mode` unset until the binding activity resolves it — do not invent a mode confirm when intent is already clear.
3. When `is_review_mode` is `true` (or will be after a gap confirm that selected review), obtain the PR reference in one pass: take `{pr_reference}` if supplied, else parse a PR number or URL from `{user_request}`. When a reference is present, record `review_pr_url` and `pr_number`, set `review_pr_missing` to `false`. When none can be derived, set `review_pr_missing` to `true` and leave `pr_number` / `review_pr_url` empty — do not prompt inside this technique; the activity gap-gates that confirm.
4. When a PR reference is known, check out the PR branch and record `branch_name` from it so downstream steps that skip branch derivation in review mode have it available.
5. Extract the associated tracker ticket from the PR body or commit messages (e.g. a Jira key or GitHub issue reference) and record it as `review_ticket_ref` when present.
