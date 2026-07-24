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
| **Workspace** | `$INSTALL/workspace` | Per-repo feature worktrees |
| **Engineering** | `$INSTALL/engineering` | Per-repo engineering checkouts (planning / sessions) |
| **Workflows** | `$INSTALL/workflows` | Workflow definitions (`workflows` branch) |

> Override roots with `--install-dir`, `--worktree-root`, `--engineering-root` (see `install.sh --help`).

## 2. Init a target repo

Two steps per project: the first (a) touches the **repo** to make it workflow-server-compatible. The second (b) initialises the *local* workflow-server workspace for operating on that repo.

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

After the project has been deployed, register it under the workflow-server install layout:

```bash
~/.local/share/workflow-server/init-repo.sh owner/repo
```

That creates:

- `$INSTALL/engineering/<owner>/<repo>/` — engineering checkout (planning / session state)
- `$INSTALL/workspace/<owner>/<repo>/` — feature worktrees

`init-repo.sh` follows the app’s engineering source (submodule, branch, or in-tree), including external remotes. Repeat **2a → 2b** for each product repo.

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

### Example Cursor workspace

A ready-to-copy multi-root Cursor workspace (MCP config, always-on rules, `AGENTS.md` repo hint, and `.code-workspace` mounts for install-root engineering + workspace) lives at:

**[examples/cursor-workspace/](examples/cursor-workspace/)** — layout and copy steps in [examples/cursor-workspace/README.md](examples/cursor-workspace/README.md).

## 4. Update Workflows

If the workflows are updated remotely, they can be refreshed locally using the following command:

```bash
$INSTALL/update-workflows.sh
```

Restart the HTTP server afterward if it is running.

## More detail

| Topic | Where |
|-------|--------|
| HTTP / Docker only | [http.md](http.md) |
| stdio / local checkout only | [stdio.md](stdio.md) |
| Install script | [`scripts/install.sh`](scripts/install.sh) |
| Deploy into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Engineering storage patterns | [docs/engineering-storage.md](docs/engineering-storage.md) |
| Init install paths | [`scripts/init-repo.sh`](scripts/init-repo.sh) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) |
| IDE rule | [docs/ide-setup.md](docs/ide-setup.md) |
| Example Cursor workspace | [examples/cursor-workspace/](examples/cursor-workspace/) |
| HTTP API routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
