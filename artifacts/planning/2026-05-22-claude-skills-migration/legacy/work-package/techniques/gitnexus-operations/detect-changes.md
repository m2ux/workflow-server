# detect-changes

Map the current git diff to the changed-symbol set and the execution flows it affects. The canonical pre-commit and diff-driven-review entry point.

## Inputs

- **scope** — `'staged'`, `'unstaged'`, or `'all'` (default `'all'`)

## Output

- **change_report** — changed symbols, changed files, affected execution flows, risk level

## Procedure

- Call `gitnexus_detect_changes({scope})`.
- Pre-commit: confirm the changes affect only the expected symbols and flows.
- Diff-driven review: use the changed-symbol set as the basis for coverage, scope, and severity work (see the composite operations below).

## Tools

- **mcp:** gitnexus

## Errors

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
