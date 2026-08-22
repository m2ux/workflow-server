# Artifact & Workspace Isolation

The Workflow Server operates with strict boundaries between **orchestration metadata** (the engine, the workflows, the planning state) and the **domain codebase** (the user's actual project).

## 1. Directory Structure Isolation

Four directory scopes, and an agent stays inside whichever one its current work belongs to:

1. **`target_path` / feature worktree:** The user's actual codebase under the **worktree root** (`ServerConfig.workspaceDir`). All domain-specific execution (writing code, running tests, refactoring, building) must occur strictly within this directory. With `--repo=owner/repo`, feature trees live under `$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/`.
2. **Engineering root:** Orchestration metadata — plans, session state, traces, ADRs. Bound as `ServerConfig.engineeringDir`:
   - **Repo layout** (`--repo` / multi-root session): `$HOST_PROJECTS_ROOT/<repo>/.engineering/` (eng submodule or materialised tree inside the main checkout).
   - **Legacy single-root** (`--workspace` only): the same path as the workspace, with planning under a nested `.engineering/` tree.
3. **Workflow definitions:** Served from `WORKFLOW_DIR` / `$INSTALL/workflows` (the `workflows` orphan branch), not from the engineering checkout.
4. **`repo_root` (projects checkout):** `$HOST_PROJECTS_ROOT/<repo>/` — main/default-branch clone used for comprehension, GitNexus, and `git worktree add`.

Install layout (HTTP/Docker): [`scripts/install.sh`](../scripts/install.sh) creates `$INSTALL/{workflows,state}` and writes `$INSTALL/env` with `HOST_PROJECTS_ROOT` (default `~/projects/dev`). Product checkouts live under that root; engineering via [`scripts/deploy.sh`](../scripts/deploy.sh). Paths: [install-projects-worktrees.md](install-projects-worktrees.md).

## 2. The Planning Folder

When a workflow session begins, a "planning folder" is established under the engineering root. Defaults:

| Mode | Planning folder |
|------|-----------------|
| Repo / engineering checkout | `<engineering>/artifacts/planning/<slug>/` |
| Legacy single-root workspace | `<workspace>/.engineering/artifacts/planning/<slug>/` |

(`PLANNING_SLUG` overrides the relative segment.) This folder acts as the isolated "brain" for the session.

It contains:
* `README.md`: the index a person opens to see what this work is and where it stands.
* `session.json`: the session and variable state, server-managed and validated against `schemas/session-file.schema.json`. Its history array carries the mechanical record of what the agents did.
* `.session-token`: an HMAC-signed seal binding `session.json` to the engineering root.
* The artifacts each activity produces, named under the prefix rule below.

The server writes the first two files itself, and only those two. There is no separate trace file: the mechanical log lives in `session.json#history`, and [workflow fidelity](workflow-fidelity.md) covers how it is recorded and read back.

### Progress tracking

The planning `README.md` carries a Progress table, and its Status cells are the quickest read on where a run has got to. Writing them is the orchestrator's job, not the worker's — a worker reports the artifacts it produced in its `activity_complete` result and nothing more. The orchestrator marks a row in progress before it dispatches, and complete once the activity's work is committed, so the table advances even when a worker is lost and replaced.

## 3. Artifact Naming Conventions

To ensure artifacts are generated predictably and don't clash, activities define an `artifactPrefix` (e.g., `08`). The server automatically infers this prefix from the activity filename (e.g., `02-design-philosophy.yaml` → prefix `02`).

When an Activity Worker produces an artifact (e.g., a code review document), it is instructed to prepend this prefix to the filename.
* **Intended File:** `design-philosophy.md`
* **Artifact Prefix:** `02`
* **Final Written Artifact:** `02-design-philosophy.md`

Each activity also exposes an `artifacts` array — a server-computed contract synthesized by `get_activity` from the `## Outputs` of the techniques the activity's steps bind. Each entry carries the producing technique output's `id` and `name`; activities do not author this list themselves.

These artifacts are written strictly into the planning folder, separating planning/review documentation from the user's actual `target_path` source code.

## 4. Git & Submodule Protocol

Engineering content is version-controlled independently from domain commits. Common layouts are documented in [engineering-storage.md](engineering-storage.md) (same-repo orphan, shared engineering monorepo, in-branch). Workflow definitions live on a separate `workflows` orphan branch under `$INSTALL/workflows` (or a checkout worktree).

When the Workflow Orchestrator hits its `commit-artifacts` phase (after an activity is fully complete), it must:
1. `cd` into the engineering checkout (or nested submodule/worktree as applicable).
2. Stage and commit planning / artifact files under that tree.
3. Push the engineering remote (or submodule).
4. If the app repo tracks engineering as a submodule pointer, return to the app checkout and commit the updated gitlink.

This keeps orchestration state version-controlled independently from the user's domain commits under the workspace / `target_path`.
