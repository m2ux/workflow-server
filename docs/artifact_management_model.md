# Artifact & Workspace Isolation

The Workflow Server operates with strict boundaries between **orchestration metadata** (the engine, the workflows, the planning state) and the **domain codebase** (the user's actual project).

## 1. Directory Structure Isolation

Agents are explicitly instructed to respect two distinct directory scopes:

1. **`target_path`:** The user's actual codebase. All domain-specific execution (writing code, running tests, refactoring, building) must occur strictly within this directory.
2. **`.engineering/`:** The orchestration workspace. This is where workflow definitions, traces, plans, and session states are managed.

## 2. The Planning Folder

When a workflow session begins, a "planning folder" is established (e.g., `.engineering/artifacts/work-packages/xyz`). This folder acts as the isolated "brain" for the session.

It contains:
* `README.md`: The central progress tracker.
* `session.json`: The persisted variable and session state, server-managed and validated against `schemas/session-file.schema.json`. The companion `.session-token` is an HMAC-signed seal binding `session.json` to the workspace.
* `workflow-trace.json`: The semantic and mechanical logs of everything the agents have done.

### Mandatory Progress Tracking

Before an Activity Worker can yield an `activity_complete` result, its `finalize` protocol strictly mandates updating the `README.md` inside the planning folder. The worker must check off items in the Progress Table, update the descriptive status, and ensure the artifact list is accurate. This ensures human operators can always look at the README to instantly understand the workflow's state without parsing logs.

## 3. Artifact Naming Conventions

To ensure artifacts are generated predictably and don't clash, activities define an `artifactPrefix` (e.g., `08`). The server automatically infers this prefix from the activity filename (e.g., `02-design-philosophy.toon` → prefix `02`).

When an Activity Worker produces an artifact (e.g., a code review document), it is instructed to prepend this prefix to the filename.
* **Intended File:** `design-philosophy.md`
* **Artifact Prefix:** `02`
* **Final Written Artifact:** `02-design-philosophy.md`

Each activity also exposes an `artifacts` array — a server-computed contract synthesized by `get_activity` from the `## Outputs` of the techniques the activity's steps bind. Each entry carries the producing technique output's `id` and `name`; activities do not author this list themselves.

These artifacts are written strictly into the planning folder, separating planning/review documentation from the user's actual `target_path` source code.

## 4. Git & Submodule Protocol

Because the `.engineering/workflows` directory is often maintained as a Git submodule or an orphan worktree, agents are provided with strict instructions on how to handle commits.

When the Workflow Orchestrator hits its `commit-artifacts` phase (after an activity is fully complete), it must:
1. `cd` into the submodule/worktree.
2. Stage and commit the `.engineering` files.
3. Push the submodule.
4. `cd` back to the parent repo.
5. Commit the updated submodule reference.

This ensures that the orchestration engine's state is version-controlled independently from the user's domain commits.
