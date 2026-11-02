# W04 Change List

Plan changes the W04 delivery session applied or held, under the allowance its delivery brief names.

## Applied

None. The session recorded W04's delivery on [I17:E00](https://github.com/m2ux/workflow-server/issues/1598) (row link to #1607, Done, AC8), relinking the row after a parallel body save restored its reservation link, and added #1607 to the review pull request #1604; none is a plan change.

## Held

- **Migration — W04 work item Component.** The implementation extends `artifacts/pull-request.md` and adds `scripts/linked-pull-requests.py`, which the Fetch Linked Pull Requests command runs, while the work item declares the pull request artifact alone, which [Component](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/artifacts/work-item.md#component) would split by file. Recommended: keep the declared component, since the row is delivered and the script is that command's implementation.

Validation found no technical debt and no arising issue.
