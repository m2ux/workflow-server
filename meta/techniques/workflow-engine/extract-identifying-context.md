---
metadata:
  version: 1.1.0
---

## Capability

Extract ticket, branch, PR, and work-package identifiers from a user request.

## Inputs

### user_request

User's free-form request.

## Outputs

### identifying_context

Map of any identifiers found: `{ issue_number?, branch_name?, pr_number?, work_package? }`

### mentioned_repo

`owner/repo` named in the request, typically the repository segment of a PR or issue URL — version-control.host-is-derived-component-is-named. Unset when the request names no repository.

## Protocol

1. Scan `{user_request}` for GitHub issue numbers (#N), Jira keys (PROJ-123), branch references, PR numbers, and work-package descriptions; collect any found into `{identifying_context}`.
2. Scan `{user_request}` for a repository reference — the `owner/repo` of a GitHub PR or issue URL, or a bare `owner/repo` — and set `{mentioned_repo}` to it. A repository named here identifies the component the user is talking about; it never determines which repository the session binds to.
