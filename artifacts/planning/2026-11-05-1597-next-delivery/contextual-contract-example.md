# Hot-fix Number Example

A source issue's hot-fix number and labels, ready for its body rewrite.

## Prerequisites

Read these files first.

- [Issue](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/issue.md)
- [Repository Labels](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/repository-labels.md)
- [Hot-fix Body](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/hotfix-body.md)
- [Hot-fix](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/hotfix.md)
- [Placement](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/placement.md)

## Operations

### Open Hot-fix Issue

Prepares a source issue for its hot-fix body rewrite.

#### 1. Select Hot-fix Number

Apply [Select Tracker Number](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/issue.md#select-tracker-number "ƒ") in the [Repository](#repository "○"), using the hot-fix prefix letter, to select a number for the source issue identified by [Hot-fix Identity](#hot-fix-identity "○").

#### 2. Ensure Required Labels

Apply [Ensure Repository Labels](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/repository-labels.md#ensure-repository-labels "ƒ") with the labels hot-fix [Titles](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/hotfix-body.md#titles) name.

#### 3. Provide Selected Number

- Provide the [Hot-fix Number](#hot-fix-number "●") for rewriting and saving the issue's body, title and labels.
- After that rewrite is saved, the requesting procedure applies [Settle Hot-fix Board Status](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/hotfix.md#settle-hot-fix-board-status "ƒ") as its [placement](https://github.com/m2ux/workflow-server/blob/fbce2c7535b1518dd3ebb4dbe845b67576186d94/skills/work-planner/artifacts/placement.md#disposition-conditions) orders.

## Fields

### Repository

The supplied repository owner and name.

### Hot-fix Identity

The source issue's repository, number and URL.

### Hot-fix Number

The selected hot-fix number for the source issue.
