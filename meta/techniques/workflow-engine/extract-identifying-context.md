---
metadata:
  version: 1.0.0
---

## Capability

Extract ticket, branch, PR, and work-package identifiers from a user request.

## Inputs

### user_request

User's free-form request.

## Output

### context

Map of any identifiers found: `{ issue_number?, branch_name?, pr_number?, work_package? }`

## Protocol

1. Scan `user-request` for GitHub issue numbers (#N), Jira keys (PROJ-123), branch references, PR numbers, and work-package descriptions; collect any found into `context`.
