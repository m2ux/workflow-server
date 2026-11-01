# W18 Change List

The plan changes the W18 delivery session applied and held.

## Applied

None. The session changed no issue's scope, rows, criteria or priority beyond recording W18's own delivery.

## Held

- **Unclassified — repository ruleset `Default` (11937302), `workspace`.**
  Recommended: add the `Every skill in scope meets the shared skill guidelines` and `Every excluded skill still carries the findings that exclude it` jobs as required status checks for `refs/heads/workspace`, in a ruleset scoped to that branch alone, since `main`, `workflows` and `engineering` never run them. A repository setting matches no change kind, so it is left to the owner.
