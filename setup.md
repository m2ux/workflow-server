# Setup

Install workflow-server and prepare a target repo. Transport install, MCP client, and verify steps are in [http.md](http.md) or [stdio.md](stdio.md).

## 1. Choose a transport

| Path | When | Guide |
|------|------|--------|
| **Docker / HTTP** | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

### Installed root paths

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Helper scripts, `env`, workflows clone |
| **Projects** | `$HOST_PROJECTS_ROOT` (default `~/projects/dev`) | **Your** basename checkouts (`$HOST_PROJECTS_ROOT/<repo>/`) |
| **Engineering** | `$HOST_PROJECTS_ROOT/<repo>/.engineering` | Planning / sessions (after `deploy.sh` in that project) |
| **Worktrees** | `$HOST_PROJECTS_ROOT/<repo>/.worktrees` | Feature worktrees (nested; `$INSTALL/worktrees` deprecated) |
| **Workflows** | `$INSTALL/workflows` | Workflow definitions (`workflows` branch) |

> Full layout and migration notes: [docs/install-projects-worktrees.md](docs/install-projects-worktrees.md).  
> Override roots with `--install-dir`, `--worktree-root`, `--projects-root` (see `install.sh --help`).  
> **`init-repo.sh` is deprecated** — product repos are managed by you, external to workflow-server.

## 2. Init a target repo

Two steps per project: the first (a) touches the **repo** to make it workflow-server-compatible. The second (b) ensures the checkout sits under the projects root the server binds.

### 2a. Deploy engineering into the project (required first)

From the **root of the target project repo** (not the workflow-server checkout), run [`scripts/deploy.sh`](scripts/deploy.sh). This sets the repo up for workflow-server compatibility (`.engineering/` layout, engineering branch/submodule, planning structure).

```bash
# inside the target project
curl -fsSL -o deploy.sh \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

Layouts (same-repo orphan, shared engineering monorepo, in-branch): [docs/engineering-storage.md](docs/engineering-storage.md). Flags: `./deploy.sh --help`.

### 2b. Materialise install-root paths

After the project has been deployed, place (or keep) the checkout under the projects root as a **basename** directory. workflow-server does **not** clone product repos (`init-repo.sh` is a deprecated stub):

```bash
# example — default HOST_PROJECTS_ROOT is ~/projects/dev
git clone https://github.com/owner/my-app.git "$HOST_PROJECTS_ROOT/my-app"
# or: move/link an existing clone to $HOST_PROJECTS_ROOT/<repo>/
```

That yields:

- `$HOST_PROJECTS_ROOT/<repo>/` — app checkout (you own this tree)
- `$HOST_PROJECTS_ROOT/<repo>/.engineering/` — after **2a**
- `$HOST_PROJECTS_ROOT/<repo>/.worktrees/` — parent directory for feature worktrees (gitignored)

At session time, pass `repo: "owner/repo"` on `start_session`. Planning lands under  
`$HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning/`. Repeat **2a → 2b** for each product repo.

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

### Example Cursor workspace

A ready-to-copy multi-root Cursor workspace (MCP config, always-on rules, `AGENTS.md` repo hint, and `.code-workspace` mounts for projects + nested worktrees) lives at:

**[examples/cursor-workspace/](examples/cursor-workspace/)** — layout and copy steps in [examples/cursor-workspace/README.md](examples/cursor-workspace/README.md).

## 4. Update Workflows

If the workflows definitions are updated remotely, refresh locally:

```bash
$INSTALL/update-workflows.sh
```

This ff-updates `$INSTALL/workflows` only. Product checkouts under `$HOST_PROJECTS_ROOT` are yours to update. Restart the HTTP server afterward if it is running.

## More detail

| Topic | Where |
|-------|--------|
| Install layout plan | [docs/install-projects-worktrees.md](docs/install-projects-worktrees.md) |
| HTTP / Docker only | [http.md](http.md) |
| stdio / local checkout only | [stdio.md](stdio.md) |
| Install script | [`scripts/install.sh`](scripts/install.sh) |
| Deploy into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Engineering storage patterns | [docs/engineering-storage.md](docs/engineering-storage.md) |
| Init install paths | [`scripts/init-repo.sh`](scripts/init-repo.sh) (deprecated stub) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) |
| IDE rule | [docs/ide-setup.md](docs/ide-setup.md) |
| Example Cursor workspace | [examples/cursor-workspace/](examples/cursor-workspace/) |
| HTTP API routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
