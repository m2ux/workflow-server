---
metadata:
  version: 1.1.1
---

## Capability

Open a draft or ready pull request for a feature branch, or refresh the body of the existing open PR for that branch.

## Inputs

### branch_name

Head branch to open the PR from.

### base_branch

Base branch the PR targets (e.g. `main`, `workflows`).

### title

PR title.

### body

PR body markdown.

### as_draft

*(optional, default: true)* When true, open as a draft. When false, open ready for review.

## Outputs

### pr_number

The pull request number.

### pr_url

URL of the pull request.

## Protocol

### 1. Resolve Coordinates

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).

### 2. Reuse Existing Pull

1. `gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:{branch_name}" --jq '.[0]'`.
2. When a pull exists, set `{pr_number}` from `.number` and `{pr_url}` from `.html_url`, write `{body}` to a temp file, and `gh api repos/{owner}/{repo}/pulls/{pr_number} -X PATCH -F body=@<file>`; stop.

### 3. Create Pull

1. `gh api repos/{owner}/{repo}/pulls -f title="{title}" -f head="{branch_name}" -f base="{base_branch}" -f body="{body}" -F draft={as_draft}`.
2. Set `{pr_number}` from `.number` and `{pr_url}` from `.html_url`.
