---
metadata:
  version: 1.0.0
---

## Capability

Mark the PR ready for review once its description is finalized.

## Inputs

### pr_number

The PR to mark ready for review via `gh pr ready` (inherited from the [update-pr](./TECHNIQUE.md) group root).

## Output

### updated_pr

PR updated and marked ready for review

#### pr_url

URL to the PR

#### pr_status

Status after update (e.g., ready for review)

## Protocol

1. Ensure the description is finalized before marking ready.
2. Mark the `{pr_number}` PR ready for review using `gh pr ready`, yielding `{updated_pr}` with its URL and status.
