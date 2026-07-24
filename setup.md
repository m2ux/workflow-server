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

From the **root of the target project repo** (not the workflow-server checkout), run [`scripts/deploy.sh`](scripts/deploy.sh). This is the initial step that sets the repo up for workflow-server compatibility (`.engineering/` layout, engineering branch/submodule, planning structure).

```bash
# inside the target project
curl -fsSL -o deploy.sh \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

#### Engineering storage patterns

`deploy.sh` supports three layouts. Pick one per project (or per org convention):

| Pattern | Command | Where engineering history lives |
|---------|---------|----------------------------------|
| **Same-repo orphan** (default) | `./deploy.sh` or `./deploy.sh --orphan` | Orphan branch `engineering` on **this** app remote; app tracks it via a `.engineering` submodule |
| **Shared engineering monorepo** | `./deploy.sh --orphan <engineering-remote-url>` | **External** engineering remote; one **project-named branch** per app (branch name = project directory basename). Many product repos share one engineering remote; each keeps planning/ADRs on its own branch |
| **In-branch** | `./deploy.sh --in-branch` | `.engineering/` as ordinary files on the current app branch (no orphan/submodule) |

**Shared engineering monorepo** (multi-app / monorepo org):

- One private (or internal) git remote holds engineering for several product repos.
- Deploy with the external URL: `./deploy.sh --orphan git@host:org/shared-engineering.git` (URL is yours; not a fixed public repo).
- The script creates or uses branch `<project-name>` on that remote and wires the app’s `.engineering` submodule to it.
- Sibling apps repeat deploy with the **same** engineering remote; each gets its own branch. History stays out of product default branches.
- Optional history submodule can use the same project-named branch convention (`--history-repo`, `--skip-history`).

> Full flags: `./deploy.sh --help`.

### 2b. Materialise install-root paths

After the project has been deployed, register it under the workflow-server install layout:

```bash
~/.local/share/workflow-server/init-repo.sh owner/repo
```

`init-repo.sh` resolves engineering from the app’s default branch (`.engineering` submodule URL/branch, in-repo `engineering` branch, or in-tree `.engineering/`), including **external** submodule remotes used by the shared-engineering monorepo pattern.

That creates:

- `$INSTALL/engineering/<owner>/<repo>/` — engineering checkout (planning / session state)
- `$INSTALL/workspace/<owner>/<repo>/` — feature worktrees

Repeat **2a → 2b** for each product repo you care about.

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

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
| Init install paths | [`scripts/init-repo.sh`](scripts/init-repo.sh) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) |
| IDE rule | [docs/ide-setup.md](docs/ide-setup.md) |
| HTTP API routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
