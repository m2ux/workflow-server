# Artifact and Workspace Isolation

An agent working a task produces two unrelated kinds of output: changes to the user's code, and the plans, reviews and session state it accumulates while working out what those changes should be. Committed together, the second buries the first — a reviewer reads past planning notes to reach the diff, and the product's history carries the process that produced it. So the two live in separate trees and are committed separately, and an agent stays inside whichever one its current work belongs to.

## The four directory scopes

1. **The feature worktree** holds the user's code, under the worktree root. Every domain action — writing code, running tests, refactoring, building — happens strictly inside it. Under `--repo=owner/repo`, feature trees sit at `$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/`.
2. **The engineering root** holds the orchestration metadata: plans, session state, traces and decision records. Under `--repo`, that is `$HOST_PROJECTS_ROOT/<repo>/.engineering/`, either an engineering submodule or a materialised tree inside the main checkout. Under a legacy single-root `--workspace`, it is the workspace path itself, with planning in a nested `.engineering/` tree.
3. **The workflow definitions** are served from the install's own `workflows` directory — the definitions branch — rather than from the engineering checkout.
4. **The projects checkout** at `$HOST_PROJECTS_ROOT/<repo>/` is the main-branch clone, used for reading the codebase, for code intelligence, and as the tree new worktrees are added from.

[`scripts/install.sh`](../scripts/install.sh) creates the host layout for the HTTP and Docker install, writing the projects root into the install environment; [`scripts/deploy.sh`](../scripts/deploy.sh) wires up engineering storage. The paths themselves are laid out in [install-projects-worktrees.md](install-projects-worktrees.md).

## The planning folder

A session opens a planning folder under the engineering root, and that folder is where everything the run thinks lives.

| Mode | Planning folder |
|------|-----------------|
| Repo or engineering checkout | `<engineering>/artifacts/planning/<slug>/` |
| Legacy single-root workspace | `<workspace>/.engineering/artifacts/planning/<slug>/` |

`PLANNING_SLUG` overrides the relative segment.

The folder holds a `README.md`, which is the index a person opens to see what the work is and where it stands; `session.json`, the session and variable state, which the server manages and validates and whose history array is the mechanical record of what the agents did; `.session-token`, the seal binding that state to the engineering root; and the artifacts each activity produces.

The server writes the first two files and only those two. There is no separate trace file — the mechanical log lives in the session history, and [workflow fidelity](workflow-fidelity.md) covers how it is recorded and read back.

### Progress tracking

The planning `README.md` carries a Progress table, and its Status cells are the quickest read on where a run has got to. Writing them is the orchestrator's job rather than the worker's: a worker reports the artifacts it produced in its result and nothing more. The orchestrator marks a row in progress before it dispatches and complete once the activity's work is committed, which is why the table keeps advancing even when a worker is lost and replaced.

## How artifacts are named

Each activity carries a two-digit prefix, which the server infers from the activity's own filename — an activity defined in `02-design-philosophy.yaml` carries the prefix `02`. A worker producing an artifact prepends that prefix to the filename, so a code review from that activity lands as `02-design-philosophy.md`. Ordering artifacts by name then orders them by the activity that wrote them, and two activities cannot collide over one filename.

Each activity also exposes the artifacts it is expected to produce. The server computes that list from the outputs of the techniques the activity's steps bind, and each entry carries the producing output's id and filename; activities do not author the list themselves.

Artifacts are written strictly into the planning folder, which is what keeps planning and review documents out of the user's source tree.

## Committing engineering content

Engineering content is version-controlled independently of the domain commits. The layouts a product repository can choose between — a same-repo orphan branch, a shared engineering monorepo, or plain in-branch files — are covered in [engineering-storage.md](engineering-storage.md). Workflow definitions live on their own separate branch.

When the orchestrator reaches the point after an activity where its artifacts are committed, it works in the engineering checkout rather than in the app checkout: it stages and commits the planning files under that tree, pushes the engineering remote, and then, where the app repository tracks engineering as a submodule, returns to the app checkout and commits the updated pointer.

That sequence is what keeps orchestration state version-controlled independently of the user's own commits in the feature worktree.
