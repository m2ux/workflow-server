---
metadata:
  version: 1.0.0
---

## Capability

Detect whether the user supplied an issue reference and, when one is present, determine the platform from the key format and parse the issue id. A `#N` or bare number is GitHub; a `PROJ-N` key is Jira.

## Inputs

### issue_request

The user-supplied issue reference or request — the issue key, URL, or surrounding text the user provided when starting the work package.

## Outputs

### issue_present

Boolean — true when the user supplied an issue reference, false otherwise.

### issue_platform

`github` or `jira`, detected from the key format.

### issue_number

The parsed issue id (GitHub `#N` / bare number, or Jira `PROJ-N` key).

## Protocol

1. Scan `{issue_request}` for an issue reference (a key, a URL, or a bare number).
2. When no reference is found, set `{issue_present}` to false and leave `{issue_platform}` and `{issue_number}` unset; the missing-issue case is handled downstream.
3. When a reference is found, set `{issue_present}` to true and detect the platform from the key format: `#N` or a bare number is GitHub; `PROJ-N` (a project prefix and a hyphen) is Jira.
4. Set `{issue_platform}` to `github` or `jira` accordingly, and parse the issue id into `{issue_number}`.
