---
metadata:
  version: 1.1.1
---

## Capability

List issues via REST search or listing.

## Inputs

### search_text

*(optional)* Free-text search term (e.g. a Jira key). When set, uses the search API scoped to this repository's issues.

### list_query

*(optional)* Query string for the issues list when `{search_text}` is unset (e.g. `state=open&labels=bug`). Default `state=open`. Pull requests appear in the issues list endpoint unless filtered out in post-processing.

## Protocol

### 1. List Or Search Issues

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. When `{search_text}` is set: `gh api "search/issues?q={search_text}+repo:{owner}/{repo}+type:issue" --paginate`.
3. When `{search_text}` is unset: `gh api "repos/{owner}/{repo}/issues?{list_query}" --paginate` with `{list_query}` defaulting to `state=open`.
