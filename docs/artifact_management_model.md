# Artifact & Workspace Isolation

The Workflow Server operates with strict boundaries between **orchestration metadata** (the engine, the workflows, the planning state) and the **domain codebase** (the user's actual project).

## 1. Directory Structure Isolation

Agents are explicitly instructed to respect distinct directory scopes:

1. **`target_path` / feature worktree:** The user's actual codebase under the **workspace** root (`ServerConfig.workspaceDir`). All domain-specific execution (writing code, running tests, refactoring, building) must occur strictly within this directory. With `--repo=owner/repo`, worktrees live under `$INSTALL/workspace/<owner>/<repo>/`.
2. **Engineering root:** Orchestration metadata — plans, session state, traces, ADRs. Bound as `ServerConfig.engineeringDir`:
   - **Repo layout** (`--repo` / `init-repo.sh`): `$INSTALL/engineering/<owner>/<repo>/` (the engineering-branch checkout itself).
   - **Legacy single-root** (`--workspace` only): the same path as the workspace, with planning under a nested `.engineering/` tree.
3. **Workflow definitions:** Served from `WORKFLOW_DIR` / `$INSTALL/workflows` (the `workflows` orphan branch), not from the engineering checkout.

Install layout (HTTP/Docker): [`scripts/install.sh`](../scripts/install.sh) creates `$INSTALL/{engineering,workspace,workflows}` and writes `$INSTALL/env`. Per-repo materialisation: [`scripts/init-repo.sh`](../scripts/init-repo.sh).

## 2. The Planning Folder

When a workflow session begins, a "planning folder" is established under the engineering root. Defaults:

| Mode | Planning folder |
|------|-----------------|
| Repo / engineering checkout | `<engineering>/artifacts/planning/<slug>/` |
| Legacy single-root workspace | `<workspace>/.engineering/artifacts/planning/<slug>/` |

(`PLANNING_SLUG` overrides the relative segment.) This folder acts as the isolated "brain" for the session.

It contains:
* `README.md`: The central progress tracker.
* `session.json`: The persisted variable and session state, server-managed and validated against `schemas/session-file.schema.json`. The companion `.session-token` is an HMAC-signed seal binding `session.json` to the engineering root.
* `workflow-trace.json`: The semantic and mechanical logs of everything the agents have done.

### Mandatory Progress Tracking

Before an Activity Worker can yield an `activity_complete` result, its `finalize` protocol strictly mandates updating the `README.md` inside the planning folder. The worker must check off items in the Progress Table, update the descriptive status, and ensure the artifact list is accurate. This ensures human operators can always look at the README to instantly understand the workflow's state without parsing logs.

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
