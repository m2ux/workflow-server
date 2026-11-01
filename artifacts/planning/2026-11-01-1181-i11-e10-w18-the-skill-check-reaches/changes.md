# W18 Change List

The plan changes the W18 delivery session applied and held.

## Applied

None. The session changed no issue's scope, rows, criteria or priority beyond recording W18's own delivery.

## Held

- **Unclassified — repository ruleset `Default` (11937302), `workspace`.**
  Recommended: add the `Every skill in scope meets the shared skill guidelines` and `Every excluded skill still carries the findings that exclude it` jobs as required status checks for `refs/heads/workspace`, in a ruleset scoped to that branch alone, since `main`, `workflows` and `engineering` never run them. A repository setting matches no change kind, so it is left to the owner.

## Delivery

- **Pull request.**
  [#1550](https://github.com/m2ux/workflow-server/pull/1550) merged into `i11/e10/workspace` at `64b9fa049`. W18 is Done and AC24 ticked on [#1181](https://github.com/m2ux/workflow-server/issues/1181); the review pull request [#1555](https://github.com/m2ux/workflow-server/pull/1555) gains the Skill Check Gate area and its reference.
- **Debt.**
  One item, fixed in the pull request: once the GitNexus CLI change reached the base, `skills/gitnexus` reported no finding and the exclusion job failed, so `EXCLUDED` is empty and every skill is in scope. No debt was deferred and no issue arose.
