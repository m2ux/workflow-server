# Hot-fix Body

Populates one hot-fix issue body.

## Operations

### Populate Hot-fix Body

One hot-fix issue body from its confirmed defect evidence.

#### 1. Populate Hot-fix Template

- Populate the standalone [Template](standalone-body.md#template) for [Hot-fix Identity](#hot-fix-identity) at the destination in [Output Body](#output-body).
- The work must meet [Definition](#definition).
- The title must meet the shared [Titles](issue-body.md#titles) conditions and the hot-fix [Titles](#titles).
- Name the confirmed [Target](#target) in the Overview.
- Populate the Problem and Proposal from [Defect Evidence](#defect-evidence), meeting [Problem and Proposal](issue-body.md#problem-and-proposal).
- All populated fields must meet [Fields](#fields).

- A hot-fix belongs to no initiative or epic, and names no Depends on or Joins.
- It sits on its theme's board.
- Its priority 10, which its [Titles](#titles) label carries, ranks it nowhere: the queue places it by its [Board Status](hotfix.md#board-status), outside the [Priority Sets](work-priority.md#priority-sets).

#### 2. Provide Populated Hot-fix Body

Provide the populated [Output Body](#output-body) for publication.

## Fields

### Target

- The Overview names the target in one line of its own, `Target:` and the branch in a code span: ``Target: `workspace` ``.
- The target is a long-lived branch its project declares, as [Branches](delivery-branches.md#branches) states, confirmed with the hot-fix's placement: the declared long-lived branch the defect evidence places the defect on, or the repository's default branch where it is declared and the evidence names no other.

### Titles

- The title is `[F00] Name: Subtitle`. The `[F00]` prefix is what makes an issue a hot-fix.
- The labels are `type:hot-fix`, the `theme:*` label of the board it sits on, and the [priority label](work-priority.md#priority-label) for priority 10.
- `F` is the hot-fix number. Hot-fixes count from `00`.

### Sections

- A hot-fix has the [standalone body](standalone-body.md)'s sections.

### Defect Evidence

The confirmed problem, design and criteria for this hot-fix.

### Hot-fix Identity

The supplied hot-fix number and theme label.

### Output Body

The supplied local destination for the complete hot-fix body.

## Guidance

### Definition

- A hot-fix fixes a defect in one long-lived branch outside the initiative, epic and task branch structure, as that branch stands, such as `main` or `workspace`. That branch is its target.
- Work that needs an open initiative, epic or task is not a hot-fix.
