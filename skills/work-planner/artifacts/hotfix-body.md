# Hot-fix Body

Populates one hot-fix issue body.

## Fields

### Target

- The Overview names the target in one line of its own, `Target:` and the branch in a code span: ``Target: `workspace` ``.
- The target is a long-lived branch its project declares, as [Branches](delivery-branches.md#branches) states, confirmed with the hot-fix's placement.

### Titles

- The title is `[F00] Name: Subtitle`. The `[F00]` prefix is what makes an issue a hot-fix.
- The labels are `type:hot-fix`, the `theme:*` label of the board it sits on, and the [priority label](board-queue.md#priority-sets) for priority 10.
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
