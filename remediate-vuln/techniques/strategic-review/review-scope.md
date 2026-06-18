---
metadata:
  version: 1.0.0
---

## Capability

Examine all changes on the security feature branch and assess them for scope discipline, orphaned symbols, investigation artifacts, and over-engineering — the combined diff-review and artifact-identification pass that surfaces every finding for the review document.

## Outputs

### review_findings

Categorized findings from the pass — scope creep, orphaned symbols, investigation artifacts, and over-engineering — to be written into `{strategic_review_doc}`.

### unsigned_commits_in_pr

Boolean — `true` when any commit in the branch range carries no valid GPG signature.

### unsigned_commit_list_summary

Short human-readable summary of the commits in the branch range that carry no valid GPG signature.

## Protocol

### 1. Examine Scope

- Examine all changes on `{branch_name}` with `` `git diff` `` and `` `git log` `` for scope and relevance to the vulnerability remediation.
- Record any change unrelated to the remediation as scope creep into `{review_findings}`.
- Scan commit signatures in the branch range with `` `git log --format='%h %G?' {branch_name}` ``; set `{unsigned_commits_in_pr}` to `true` when any commit reports `N` or `B`, and capture the offending commits into `{unsigned_commit_list_summary}`.

### 2. Identify Artifacts

- Look for investigation artifacts: extra logging, debug messages, temporary workarounds.
- Look for over-engineering: generic abstractions for a specific problem, unused config options.
- Look for orphaned infrastructure: commented-out code, unused utilities, duplicate functionality.
- Collect every finding into `{review_findings}`.
