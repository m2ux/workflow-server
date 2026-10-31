# Understand Mode

Explains the named pull request's changes through a measured architecture overview and publishes that overview for its reviewer.

## Prerequisites

Read these files first.

- [Change Overview](../protocols/change-overview.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Select the change.**
   Require the pull request number or URL.
   - Ask and stop when none is supplied. Do not infer it from the current branch.
   - For several supplied pull requests, complete one overview per pull request. An initiative has no overview of its own.
2. **Explain each change.**
   Follow [Change Overview](../protocols/change-overview.md) for each selected pull request, resuming with what it returns.
3. **Report.**
   Report the pull request, record folder, diagrams and References row of each overview.

## Outcomes

- **The change explained.**
  The engineer reviewing the pull request has its structure and its flows, read at the head commit under review.
- **The pull request named.**
  The account is of the pull request the request names, of the open pull request a task in review names, or of each base an epic in review delivers. An initiative has none of its own.
- **One account.**
  The same pull request yields one account, and a later run replaces it with the current change.
