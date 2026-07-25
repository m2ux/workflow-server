# Setup

Install Workflow Server and prepare a target repository so an IDE agent can run workflows.

**Outcome:** server reachable over your chosen transport, target repo registered, bootstrap rule in place, and a verified first session.

## 1. Choose a transport

Complete the transport guide’s install, then return here for §2–§4.

| Path                              | When | Guide |
|-----------------------------------|------|--------|
| **Docker / HTTP**                 | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio (soon to be deprecated)** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

## 2. Initialise a target repo

Two steps per project. **2a** changes the **product repo**. **2b** registers it for sessions under `HOST_PROJECTS_ROOT`.

### 2a. Deploy engineering into the project (required first)

From the **root of the target project repo** (not the workflow-server checkout), run [`scripts/deploy.sh`](scripts/deploy.sh):

```bash
# inside the target project
curl -fsSL -o deploy.sh \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

Layouts (same-repo orphan, shared engineering monorepo, in-branch): [docs/engineering-storage.md](docs/engineering-storage.md). Flags: `./deploy.sh --help`.

### 2b. Register the project with the install

After deploy, register `owner/repo` so the server can resolve planning for
`start_session({ repo: "owner/repo" })`:

```bash
~/.local/share/workflow-server/init-repo.sh owner/repo
# optional: pin the source checkout branch (default = remote default, usually main)
~/.local/share/workflow-server/init-repo.sh --branch=develop owner/repo
```

Product checkouts and feature worktrees live under **`HOST_PROJECTS_ROOT`**
(from `$INSTALL/env`, e.g. `~/projects/dev`) — not under `$INSTALL`:

```text
checkout    = $HOST_PROJECTS_ROOT / <repo>          # basename, e.g. workflow-server
planning    = checkout / .engineering / …
target_path = checkout / .worktrees / <slug>
```

`$INSTALL` holds helper scripts, `state/` (HMAC key), and `workflows/` (definitions).
Full layout: [docs/install-projects-worktrees.md](docs/install-projects-worktrees.md).

`init-repo.sh` does **not** init product `workflows` submodules by default (server
defs live in `$INSTALL/workflows`). Repeat **2a → 2b** for each product repo.

## 3. Setup Cursor workspace

**Recommended path:** copy and open [examples/cursor-workspace/](examples/cursor-workspace/) (see its [README](examples/cursor-workspace/README.md)). That template mirrors `~/.local/share/cursor/workspaces/workflow-server` and already includes:

- `.cursor/mcp.json` (workflow-server via `mcp-remote`)
- always-applied bootstrap rules
- one-line `AGENTS.md` for `repo: "owner/repo"`
- multi-root `.code-workspace` (workspace, project, workflows, planning, work trees)

After the workspace is open, ask the agent to start a workflow.

## 4. Update Workflows

When workflow definitions (or managed checkouts under `HOST_PROJECTS_ROOT`) change
remotely, refresh locally:

```bash
$INSTALL/update-workflows.sh
```

This fast-forwards `$INSTALL/workflows` and, when present, project checkouts under
`HOST_PROJECTS_ROOT` (including nested `.engineering` when it is a git checkout).
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
| Repo / planning path errors | Skipped deploy or init-repo | Complete §2a then §2b |
| stdio exits at startup | No workspace or repo binding | [stdio.md](stdio.md) — `--workspace` or `--repo` required |

