---
metadata:
  version: 1.3.1
---

## Capability

View an existing pull request via REST.

## Inputs

### pr_number

Pull request number.

### field_projection

*(optional)* `gh api --jq` expression selecting fields from the pull object. When set, only that slice is fetched and structured outputs below that depend on the full object are left unset.

## Outputs

### base_branch

Base branch ref the PR targets (`.base.ref`).

### head_sha

Full head commit SHA (`.head.sha`).

### pr_body

PR description body (`.body`).

### pr_url

HTML URL of the pull (`.html_url`).

### reviewed_code_base_url

Permanent blob-URL prefix for citing the head commit — `https://github.com/` plus head owner login, head repo name, `/blob/`, and the full head SHA.

## Protocol

### 1. Fetch Pull

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}` with `--jq {field_projection}` when `{field_projection}` is set.
3. When `{field_projection}` is unset, set `{base_branch}` from `.base.ref`, `{head_sha}` from `.head.sha`, `{pr_body}` from `.body`, `{pr_url}` from `.html_url`, and `{reviewed_code_base_url}` to `https://github.com/{.head.repo.owner.login}/{.head.repo.name}/blob/{.head.sha}`.
