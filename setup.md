# Setup

Install Workflow Server and prepare a target repository so an IDE agent can run workflows.

**Outcome:** server reachable over your chosen transport, target repo registered, bootstrap rule in place, and a verified first session.

## 1. Choose a transport

Complete the transport guide’s install, then return here for §2–§4.

| Path                              | When | Guide |
|-----------------------------------|------|--------|
| **Docker / HTTP**                 | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

## 2. Initialise a target repo

Two steps per project. **2a** deploys engineering into the product repo. **2b** checks that project out under `HOST_PROJECTS_ROOT`.

### 2a. Deploy engineering

Only for a presently *undeployed* (no .engineering submodule) project; from the **root of the target project repo** (not the workflow-server checkout), run [`scripts/deploy.sh`](scripts/deploy.sh):

```bash
# inside the target project
curl -fsSL -o deploy.sh \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

Layouts (same-repo orphan, shared engineering monorepo, in-branch): [docs/engineering-storage.md](docs/engineering-storage.md). Flags: `./deploy.sh --help`.

### 2b. Checkout the project

After deploy, clone or check out the project into the canonical location under
`HOST_PROJECTS_ROOT` (default `~/projects/dev`):

```bash
# HOST_PROJECTS_ROOT from $INSTALL/env (default: ~/projects/dev)
git clone https://github.com/owner/repo.git "$HOST_PROJECTS_ROOT/<repo>"
mkdir -p "$HOST_PROJECTS_ROOT/<repo>/.worktrees"
```

Repeat **2a → 2b** for each product repo.

## 3. Setup Cursor workspace

**Recommended path:** deploy the [examples/cursor-workspace/](examples/cursor-workspace/) template with [`scripts/deploy-cursor-workspace.sh`](scripts/deploy-cursor-workspace.sh). That writes absolute `/home/$USER/…` multi-root paths (no `HOST_PROJECTS_ROOT` required when opening Cursor) and mirrors `~/.local/share/cursor/workspaces/workflow-server`:

```bash
# from a workflow-server checkout ($USER must be set; needs python3)
./scripts/deploy-cursor-workspace.sh --github=m2ux/workflow-server
# refresh an existing kickoff dir (keeps extra MCP servers):
./scripts/deploy-cursor-workspace.sh --github=m2ux/workflow-server --force
# preview:
./scripts/deploy-cursor-workspace.sh --dry-run --github=m2ux/workflow-server
cursor ~/.local/share/cursor/workspaces/workflow-server/workflow-server.code-workspace
```

| Flag | Purpose |
|------|---------|
| `--github=owner/repo` | `AGENTS.md` identity; implies repo basename if `--repo` omitted |
| `--repo=NAME` / positional | Checkout under projects root (default `workflow-server`) |
| `--user=NAME` | Build paths as `/home/NAME/…` (default `$USER`) |
| `--projects-root=PATH` | Default `$HOST_PROJECTS_ROOT` or `/home/$USER/projects/dev` |
| `--force` | Refresh managed files; merge `mcp.json` without dropping other servers |
| `--dry-run` / `--open` / `--help` | Preview, launch Cursor, full flag list |

Full CLI table and behaviour: [examples/cursor-workspace/README.md](examples/cursor-workspace/README.md#use-it-recommended-deploy-script) · `./scripts/deploy-cursor-workspace.sh --help`.

The template already includes MCP (`workflow-server` via `mcp-remote`), always-applied bootstrap rules, and one-line `AGENTS.md` for `repo: "owner/repo"`. Manual copy + `${env:HOST_PROJECTS_ROOT}` roots remain documented in the [example README](examples/cursor-workspace/README.md#manual-copy-optional).

## 4. Update Workflows

When workflow definitions change remotely, refresh locally:

```bash
$INSTALL/update-workflows.sh
```

This fast-forwards `$INSTALL/workflows` only. Product checkouts under
`HOST_PROJECTS_ROOT` are yours to update.
Restart the HTTP server afterward if it is running.

## 5. Verify

1. Agent calls **`discover`**.
2. Agent calls **`start_session`** with at least `workflow_id` (default `meta`), `agent_id`, and **`repo: "owner/repo"`**.
3. You get a **`session_index`** back.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Sessions fail while HTTP is up | `/ready` not fully ready | Require `sessionKeyWritable: true` — [http.md](http.md) |
| Agent skips `discover` | Bootstrap rule missing | [docs/ide-setup.md](docs/ide-setup.md) |
| Repo / planning path errors | Missing deploy or checkout under `HOST_PROJECTS_ROOT` | Complete §2a then §2b |
| stdio exits at startup | No workspace or repo binding | [stdio.md](stdio.md) — `--workspace` or `--repo` required |

