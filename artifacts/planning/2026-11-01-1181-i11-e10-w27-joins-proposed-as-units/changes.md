# Change list

## Applied

- **W27 and W28 delivered.** [#1570](https://github.com/m2ux/workflow-server/pull/1570) merged into `i11/e10/workspace` at `707c1bb24`. Both rows link it and are done; AC42–AC47 are ticked on [#1181](https://github.com/m2ux/workflow-server/issues/1181).
- **Review pull request.** [#1555](https://github.com/m2ux/workflow-server/pull/1555) carries a Joins and Candidate Units entry under Changes and R17 under References.
- **Work items.** W27 and W28 declare `workspace:skills/work-planner/scripts/deps.py`, and their file-change declarations add `skills/work-planner/artifacts/work-item.md`, which states that a component is one file.

## Debt fixed

- **W20 and W29 components carried no branch.** Their work items declared `skills/scripts/check_skill_files.py`, which the check reads as a component other than `workspace:skills/scripts/check_skill_files.py` and which Task Branches cannot place on a base. Both now declare the branch-qualified path, and the E10 run groups them with the other rows extending that file.

## Held

- **#1530 left open.** Its five criteria are delivered by W27 and W28; it is linked to no pull request, as the session's auto-close decision states, and closing it is left to the user.
