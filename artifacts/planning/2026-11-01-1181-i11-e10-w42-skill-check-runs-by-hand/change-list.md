# Change List — W42

## Applied

- **Criteria retired on #1181.** AC24 (W18), AC51 (W35) and AC55 (W39) read "Retired as out of I11's scope, its work reverted by W42.", each on its original row.
- **Criteria reworded on #1181.** AC53 keeps the classic-API-URL and classic-mutation cases; AC57 keeps the byte-identical restore.
- **Proposal on #1181.** Final conformance runs the shared check by hand over each skill in I11's scope; the `EXCLUDED` clause is gone.
- **Row W42 and AC58 added to #1181.**
- **New review pull request.** [#1555](https://github.com/m2ux/workflow-server/pull/1555) merged `i11/e10/workspace` into `workspace` at `d7feec2dc`, so W42 reaches `workspace` through draft [#1589](https://github.com/m2ux/workflow-server/pull/1589), linked to #1181 under Development.

## Held

- **#1555's body.** It records what merged, the workflow and exclusion included, so its Changes are left as merged and W42's R-entry sits on #1589.
- **AC58's evidence.** It reads the epic base's `git ls-tree`, since `workspace` holds the workflow until #1589 merges.
- **Row titles.** W18, W35, W37 and W39 keep their delivered titles, as W41 kept those of the rows it reverted.
