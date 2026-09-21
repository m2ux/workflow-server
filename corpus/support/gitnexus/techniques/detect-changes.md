---
metadata:
  version: 1.5.0
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

### diff_worktree

*(optional)* Absolute path of the linked git worktree holding the diff, where the checkout under change is one the graph's server was launched outside of.

## Outputs

### change_report

changed symbols, changed files, affected execution flows, risk level, and whether the answer is whole

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

The counts — `changed_count` symbols, affected flows, changed files — and the `risk_level` they add up to, which is `unknown` where the answer is partial.

#### partial

Whether a step inside the answer failed and was swallowed, leaving the answer incomplete: a failed symbol query degrades every count, and a failed process lookup degrades only the affected flows and the rating read off them.

#### truncated

Whether the `changed_symbols` list was capped, in which case `summary.changed_count` and not the list's length is the number of symbols the diff moved.

## Protocol

### 1. Produce the Change Report

- Call `gitnexus_detect_changes { scope: diff_scope, base_ref, worktree: diff_worktree, repo: repo_name }` to produce the `{change_report}` (changed symbols, changed files, affected flows, risk level).
   > - A `'compare'` scope with no `{base_ref}` measures against nothing and answers about nothing, so the two travel together.
   > - The diff is taken in the checkout the graph's server was launched from, so a change made in a linked worktree elsewhere measures as no change at all — an empty answer carrying neither `partial` nor `truncated`, in the shape of a clean one. Name that worktree in `{diff_worktree}`, and confirm the checkout diffed is the checkout edited before an empty `{change_report}` is read as clean.
   > - An answer with `{change_report}.partial` set is not a clean check whatever its counts say; take it again before the diff is treated as measured.
