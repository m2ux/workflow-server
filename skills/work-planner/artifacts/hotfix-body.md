# Hot-fix Body

Populates one hot-fix issue body.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Standalone Body](standalone-body.md)
- [Board Queue](board-queue.md)
- [Hot-fix](hotfix.md)
- [Delivery Plan](delivery-plan.md)
- [Delivery Branches](delivery-branches.md)

## Operations

### *Populate* Hot-fix Body

One hot-fix body from a confirmed defect.

**Inputs:** Hot-fix number, confirmed target, problem, design, criteria, theme label and output path.

- Populate the body from the standalone [Template](standalone-body.md#template) at the supplied output path.
  - The work must meet [Definition](#definition).
  - The title must meet the shared [Titles](issue-body.md#titles) conditions and the hot-fix [Titles](#titles).
  - The Overview must name the confirmed target as [Target](#target) states.
  - The Problem and Proposal must meet [Problem and Proposal](issue-body.md#problem-and-proposal).
  - All populated fields must meet [Fields](#fields).

## Fields

### Definition

- A hot-fix fixes a defect in one long-lived branch outside the initiative, epic and task branch structure, as that branch stands, such as `main` or `workspace`. That branch is its target.
- Work that needs an open initiative, epic or task is not a hot-fix.

### Target

- The Overview names the target in one line of its own, `Target:` and the branch in a code span: ``Target: `workspace` ``.
- The target is a long-lived branch its project declares, as [Branches](delivery-branches.md#branches) states, confirmed with the hot-fix's placement.

### Titles

- The title is `[F00] Name: Subtitle`. The `[F00]` prefix is what makes an issue a hot-fix.
- The labels are `type:hot-fix`, the `theme:*` label of the board it sits on, and the [priority label](board-queue.md#priority-sets) for priority 10.
- `F` is the hot-fix number. Hot-fixes count from `00`.

### Membership

- A hot-fix belongs to no initiative or epic, and names no Depends on or Joins.
- It sits on its theme's board.
- Its priority 10, which its [Titles](#titles) label carries, ranks it nowhere: the queue places it by its [Board Status](hotfix.md#board-status), outside the priority sets.

### Debt

- A hot-fix fixes the debt its delivery finds as a unit's [Debt](delivery-plan.md#debt) states.

### Sections

- A hot-fix has the [standalone body](standalone-body.md)'s sections.
