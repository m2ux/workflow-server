# Project configuration authority

User selected A: evaluate configuration at the revision being checked and report missing configuration explicitly.

## Contract

- Resolve the evaluated subject to a commit. Record repository, commit and configuration path.
- Epic sync reads the epic-base commit; merged-delivery verification reads the merged commit. A general check requires the evaluated revision explicitly identified. Before an epic base exists, base preparation evaluates its selected long-lived source commit. A missing or ambiguous subject revision is unevaluable.
- The main worktree may locate the repository, but does not choose configuration. Uncommitted files do not override the pinned source.
- Missing, empty or unreadable declarations are unevaluable and name the checks they prevent. No alternate ref, working tree, branch-name derivation or project-default fallback supplies values.
- Multiple evaluated revisions each carry their own configuration provenance; conflicting declarations are reported with those sources rather than silently selecting one.

## Ownership and supersession

- E09 W06 owns source selection, AC10/AC12. W07 owns explicit failure reporting, AC11/AC13, after W06. Splitting avoids combining four criteria in one task.
- Revised AC10 and AC11 are unchecked pending evidence and owned solely by W06/W07. W05 retains AC9 in its current Coverage cell and PR #1265 retains historical completion; original coverage is preserved in the before snapshot. The main-worktree and inferred-branch behavior is superseded by this decision.
- E13 W02 owns required-criteria reading at the evaluated commit using W01's declaration schema. Its criterion still requires generic declared identifiers; no project-specific defaults are introduced.
- E13 decision D2 and the active work items use the same authority rule. Source-selection fixtures cover divergent revisions, same-commit reads across worktrees, dirty files, missing/empty declarations and unavailable revisions.
- No cross-epic code dependency is invented: both tasks conform to this contract; shared implementation can be selected during delivery if justified.
- F17 is reconciled at plan level. This does not claim implementation completion or a passing verdict without configuration.

Published E09 and E13 bodies match exact live readbacks.
