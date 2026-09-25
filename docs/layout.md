# Project layout

A workspace holds the long-lived checkout of each project, that project's engineering artifacts, and the feature worktrees for work in progress. The same three places apply to every project. Plans, decision records, and session state accumulate in every project. That history lives on an orphan branch of the project, or as ordinary files on the current branch when the project is an experiment.

```text
./
├── .project/<component>/                         # long-lived checkout of a project
├── .engineering/                                 # engineering artifacts
└── .worktrees/<slug>/                            # feature worktree
```

| Path | Role |
|------|------|
| `.project/<component>/` | The project's long-lived checkout. Workflow definitions are one such component, not part of `.engineering/`. |
| `.engineering/` | Plans, decision records, reviews, and session state. |
| `.worktrees/<slug>/` | A feature worktree of one component. Code changes for a task are made here. |

`.project/`, `.engineering/`, and `.worktrees/` are gitignored on the workspace checkout. Each component under `.project/` is its own git checkout. A feature worktree shares that checkout's git directory and lives under `.worktrees/`.

## Components

From the workspace checkout:

```bash
./scripts/add-component.sh <repo> <branch> [name]
```

`<repo>` is owner/name or a git URL. The checkout at `.project/<name>` is `<branch>`. `<name>` defaults to `<branch>`. The project folder in `cursor.code-workspace` shows every component under `.project/`.

## Engineering

[`scripts/deploy-engineering.sh`](../scripts/deploy-engineering.sh) creates `.engineering/` at the workspace root. Pick one layout per project. Full flags: `./scripts/deploy-engineering.sh --help`.

| Pattern | Command | Where the history lives |
|---------|---------|-------------------------|
| **Same-repo orphan** (default) | `./scripts/deploy-engineering.sh` | Orphan branch `engineering` on this project's remote. The workspace checks that branch out as a worktree at `.engineering/`. |
| **In-branch** | `./scripts/deploy-engineering.sh --in-branch` | Ordinary files on the current branch. |

### Same-repo orphan

A single project owns its engineering history. Run `./scripts/deploy-engineering.sh` from the workspace checkout. The script creates the orphan branch `engineering` on this project's remote and checks that branch out as a worktree at `.engineering/`. The worktree shares this checkout's git directory. `.engineering/` stays gitignored, so the workspace branch does not record an engineering commit.

### In-branch

A simple or experimental project keeps `.engineering/` as ordinary files on the current branch.

```bash
./scripts/deploy-engineering.sh --in-branch
```

## A session's notes

One run of a workflow opens one folder under the engineering root: `.engineering/artifacts/planning/<slug>/`. That folder holds the plans, reviews, and session record for the run. What the folder contains, and how those documents are named, is the server's [artifact management](https://github.com/m2ux/workflow-server/blob/main/docs/artifact-management-model.md#the-planning-folder).

The notes are committed in `.engineering/`. The feature worktree commits only the code change. When an activity's documents are committed, the orchestrator stages the planning files in `.engineering/`, commits them, and pushes that remote. Where the application repository tracks engineering as a submodule, the orchestrator then returns to the application checkout and commits the updated pointer. How `.engineering/` itself is created is [above](#engineering).

## Feature worktrees

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
