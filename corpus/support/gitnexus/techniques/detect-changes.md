---
metadata:
  version: 1.3.0
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

#### changed_symbols

The indexed symbols the diff's hunks land in.

##### id

The symbol's graph identifier, its kind naming the first segment.

##### name

The symbol's name.

##### filePath

The file it sits in.

##### change_type

What the hunk did to it.

#### affected_processes

The execution flows those symbols participate in. A flow is named by its `name` here, as a symbol's context names it, and not by the `summary` a ranked query uses.

##### id

The flow's graph identifier.

##### name

What names the flow end to end.

##### process_type

`intra_community` or `cross_community`.

##### step_count

How many steps the flow runs.

##### changed_steps

Where the change lands in the flow — each entry naming the `symbol` and its `step`.

#### summary

The counts — changed symbols, affected flows, changed files — and the `risk_level` they add up to.

## Protocol

1. Call `gitnexus_detect_changes { scope: diff_scope, base_ref, repo: repo_name }` to produce the `{change_report}` (changed symbols, changed files, affected flows, risk level). If the index is out of date, run `npx gitnexus analyze`, then retry.
   > A `'compare'` scope with no `{base_ref}` measures against nothing and answers about nothing, so the two travel together.
2. Pre-commit: confirm the changes affect only the expected symbols and flows.
3. Diff-driven review: use the changed-symbol set as the basis for coverage, scope, and severity work.
