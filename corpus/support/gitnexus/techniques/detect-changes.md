---
metadata:
  version: 1.2.0
---

## Capability

Map a git diff to the changed-symbol set and the execution flows it affects. The canonical pre-commit and diff-driven-review entry point.

## Inputs

### diff_scope

*(optional)* Which diff the answer is taken from: `'unstaged'`, `'staged'`, `'all'`, or `'compare'`. `'compare'` measures the working tree against `{base_ref}` — the branch diff a pull-request review reads.

#### default

`all`

### base_ref

*(optional)* The branch or commit a `'compare'` scope measures against, such as `'main'`.

## Outputs

### change_report

changed symbols, changed files, affected execution flows, risk level

#### symbols

The indexed symbols the diff's hunks land in, each with the file it sits in.

#### files

The files the diff touches.

#### processes

The execution flows the changed symbols participate in.

#### risk_level

LOW, MEDIUM, HIGH or CRITICAL, from the breadth of the symbols and flows reached.

## Protocol

1. Call `gitnexus_detect_changes { scope: diff_scope, base_ref, repo: repo_name }` to produce the `{change_report}` (changed symbols, changed files, affected flows, risk level). If the index is out of date, run `npx gitnexus analyze`, then retry.
   > A `'compare'` scope with no `{base_ref}` measures against nothing and answers about nothing, so the two travel together.
2. Pre-commit: confirm the changes affect only the expected symbols and flows.
3. Diff-driven review: use the changed-symbol set as the basis for coverage, scope, and severity work.
