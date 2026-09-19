---
metadata:
  version: 1.3.0
---

## Capability

Map a git diff to the changed-symbol set and the execution flows it affects.

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

#### changed_symbols

The indexed symbols the diff's hunks land in, each carrying its `name`, the `filePath` it sits in, and the `change_type` the hunk made.

#### affected_processes

The execution flows those symbols participate in, each carrying its `name` and the steps the change lands on.

#### summary

The counts — changed symbols, affected flows, changed files — and the `risk_level` they add up to.

## Protocol

1. Call `gitnexus_detect_changes { scope: diff_scope, base_ref, repo: repo_name }` to produce the `{change_report}` (changed symbols, changed files, affected flows, risk level).
   > A `'compare'` scope with no `{base_ref}` measures against nothing and answers about nothing, so the two travel together.
