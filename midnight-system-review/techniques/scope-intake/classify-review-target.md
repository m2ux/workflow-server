---
metadata:
  version: 1.0.0
---

## Capability

Classify a review target as a pull-request surface or a local change-set. Emits only classification flags — no GitHub calls and no git diff.

## Inputs

### review_target

PR number, GitHub PR URL, or local diff spec (branch, ref range, working tree).

## Outputs

### has_pr_surface

true when `{review_target}` is a pull-request number or a GitHub pull-request URL; false otherwise.

### pr_number

Pull-request number when `{has_pr_surface}` is true; unset for a local change-set.

## Protocol

### 1. Classify

1. When `{review_target}` is a decimal PR number, or a GitHub URL whose path contains `/pull/` followed by a number, set `{has_pr_surface}` true and `{pr_number}` to that number.
2. Otherwise set `{has_pr_surface}` false and leave `{pr_number}` unset.
