# Project layout

A workspace holds the long-lived checkout of each project, that project's engineering artifacts, and the feature worktrees for work in progress. The same three places apply to every project. Plans, decision records, and session state accumulate in every project, and where that history lives is a choice. What suits a single repository owning its own history is not what suits an organisation running a dozen of them, and neither suits an experiment.

```text
./
├── .project/<component>/                         # long-lived checkout of a project
├── .engineering/                                 # engineering artifacts
└── .worktrees/<slug>/                            # feature worktree
```

| Path | Role |
|------|------|
| `.project/<component>/` | The project's long-lived checkout. |
| `.engineering/` | Plans, decision records, reviews, and templates. |
| `.worktrees/<slug>/` | A feature worktree of one component. |

`.project/`, `.engineering/`, and `.worktrees/` are gitignored on the workspace checkout. Each component under `.project/` is its own git checkout. A feature worktree shares that checkout's git directory and lives under `.worktrees/`.

## Components

From the workspace checkout:

```bash
./scripts/add-component.sh <repo> <branch> [name]
```

`<repo>` is owner/name or a git URL. The checkout at `.project/<name>` is `<branch>`. `<name>` defaults to `<branch>`. The project folder in `cursor.code-workspace` shows every component under `.project/`.

## Engineering

[`scripts/deploy-engineering.sh`](../scripts/deploy-engineering.sh) creates `.engineering/` at the workspace root. Pick one layout per project, or follow one organisation convention. Full flags: `./scripts/deploy-engineering.sh --help`.

| Pattern | Command | Where the history lives |
|---------|---------|-------------------------|
| **Same-repo orphan** (default) | `./scripts/deploy-engineering.sh` | Orphan branch `engineering` on this project's remote. The project tracks it with a `.engineering` submodule. |
| **Shared engineering monorepo** | `./scripts/deploy-engineering.sh --orphan <engineering-remote-url>` | One external remote. Each project has a branch named for its directory. |
| **In-branch** | `./scripts/deploy-engineering.sh --in-branch` | Ordinary files on the current branch. |

### Same-repo orphan

A single project owns its engineering history. Run `./scripts/deploy-engineering.sh` from the workspace checkout. The script creates the orphan branch `engineering` on this project's remote and adds `.engineering` as a submodule.

### Shared engineering monorepo

Several projects share one engineering remote. Each keeps its own branch, named for the project directory.

```bash
./scripts/deploy-engineering.sh --orphan git@host:org/shared-engineering.git
```

The URL is yours. A further project repeats that command against the same remote and receives its own branch. Open the submodule with `git submodule update --init -- .engineering`.

### In-branch

A simple or experimental project keeps `.engineering/` as ordinary files on the current branch.

```bash
./scripts/deploy-engineering.sh --in-branch
```

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
