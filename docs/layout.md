# Project layout

A workspace holds the long-lived checkout of each project, that project's engineering artifacts, and the feature worktrees for work in progress. The same three places apply to every project.

```text
./
├── .project/<component>/                         # long-lived checkout of a project
├── .engineering/                                 # engineering artifacts
│   └── artifacts/planning/
└── .worktrees/<slug>/                            # feature worktree
```

| Path | Role |
|------|------|
| `.project/<component>/` | The project's long-lived checkout. `scripts/add-component.sh` clones it here. |
| `.engineering/` | Plans, decision records, reviews, and templates. `scripts/deploy-engineering.sh` creates it. |
| `.worktrees/<slug>/` | A feature worktree of one component. |

`.project/`, `.engineering/`, and `.worktrees/` are gitignored on the workspace checkout. Each component under `.project/` is its own git checkout. A feature worktree shares that checkout's git directory and lives under `.worktrees/`.

## Adding a component

From the workspace checkout:

```bash
./scripts/add-component.sh <repo> <branch> [name]
```

`<repo>` is owner/name or a git URL. The checkout at `.project/<name>` is `<branch>`. `<name>` defaults to `<branch>`. The project folder in `cursor.code-workspace` shows every component under `.project/`.

## A feature worktree

From the workspace checkout:

```bash
./scripts/raise-pr.sh <slug> [--body=TEXT]
```

`<slug>` names a directory under `.worktrees/`. The script finds the component under `.project/` that owns that worktree and opens a pull request against the branch checked out there.

When `<slug>` is itself a component directory, the changes in `.project/<slug>` move to `.worktrees/<slug>-<datetime>` and `.project/<slug>` returns to its upstream branch. The pull request is opened from that worktree.

## Cursor roots

`cursor.code-workspace` opens four roots:

```text
./                                 # workspace
./.project                         # project
./.engineering/artifacts/planning  # planning
./.worktrees                       # work trees
```
