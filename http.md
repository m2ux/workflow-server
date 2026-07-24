# Setup (Docker / HTTP)

Run a Dockerised workflow server and connect your IDE over HTTP.

For a local checkout over stdio instead, see [stdio.md](stdio.md).

## Layout

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Scripts, workflows clone, durable server state |
| **State dir** | `$INSTALL/state` | HMAC signing key (`secret`); mounted into the container |
| **Worktree root** | `~/worktrees` | Agent-shared workspace (planning lives under each repo here) |

**Canonical Docker layout (no separate engineering bind):**

- Worktrees: host `~/worktrees` → container `/worktrees` (RW)
- Workflows: `$INSTALL/workflows` → `/app/workflows` (RO)
- State / HMAC key: `$INSTALL/state` → `/var/lib/workflow-server` (RW)
- Planning artifacts: under  
  `$WORKTREE_ROOT/<owner>/<repo>/.engineering/artifacts/planning/`  
  (created by workflows / `deploy.sh` in the **target project**, not under `$INSTALL`)

Older installs that still mount a host `engineering/` tree are obsolete for the
HTTP path — remove that bind and use the worktree layout above.

## 1. Install

Needs git and curl. Fetches helper scripts, clones the `workflows` branch into
the install dir, creates `~/worktrees` and `$INSTALL/state` if missing, and
writes a persistent `env` file so `start.sh` needs no path args.

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
```

> Options: `…/install-docker.sh` (`--help`, `--install-dir`, `--worktree-root`, …)

## 2. Start the server

Needs [Docker](https://docs.docker.com/get-docker/).

```bash
~/.local/share/workflow-server/start.sh -d
```

Defaults:

- Image: `ghcr.io/m2ux/workflow-server:main`
- Publish: `http://127.0.0.1:3000`
- Runs as your host uid:gid with a writable state mount (HMAC key survives recreate)

Stop:

```bash
~/.local/share/workflow-server/stop.sh
```

## 3. Check health and readiness

```bash
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3000/ready
```

Expect health `{"status":"ok"}` and ready with all checks true, including
`sessionKeyWritable: true`. If that flag is false, `start_session` will fail —
do not treat a green `/health` alone as “ready to run workflows.”

## 4. Smoke: start a meta session

After the IDE is connected (step 5), or via any MCP client:

1. `discover`
2. `start_session` with `{ "workflow_id": "meta", "agent_id": "orchestrator" }`
3. Confirm a planning folder appears under the worktree root (transient or
   promoted under `.engineering/artifacts/planning/`)

Listing workflows or a green health check is **not** enough — `start_session`
is the real bootstrap gate.

## 5. Update workflows

Pull the latest `workflows` branch into the install dir (not the agent worktree root).

```bash
~/.local/share/workflow-server/update-workflows.sh
```

> Restart the server afterward if it is already running.

## 6. Connect the MCP client

### Recommended for local Docker (hard-coded URL)

Cursor only expands `${env:…}` from the **IDE process** environment. If that
variable is unset, `mcp-remote` gets a broken URL. For a fixed local port, hard-code:

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://127.0.0.1:3000/mcp"]
    }
  }
}
```

### Optional: env interpolation

If you launch Cursor from a shell that exports the variable:

```bash
export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp
```

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${env:WORKFLOW_SERVER_MCP_URL}"]
    }
  }
}
```

Restart the IDE, then run the smoke in step 4 (`discover` + `start_session`),
not only “list workflows.”

### Expected log noise from `mcp-remote`

On connect, local unauthenticated HTTP may log 404s for OAuth discovery:

- `GET /.well-known/oauth-protected-resource/...`
- `GET /.well-known/oauth-authorization-server`

and occasional `GET /mcp` → 400 during the streamable-HTTP handshake. These are
**expected** when no OAuth is configured; successful MCP init still follows.
Real failures are application errors on tools (e.g. `start_session`), not these probes.

## 7. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent
calls `discover` on workflow requests.

## Multi-root Cursor workspaces

Point the agent at the **project worktree** under `~/worktrees` (or your
`--worktree-root`), not an empty `sessions/` folder and not a historical
standalone `engineering/` tree unless that tree is the bound worktree root.

Init a target repo with [`scripts/deploy.sh`](scripts/deploy.sh) or your project’s
init path so `.engineering/` exists **inside** that repo under the worktree root.

---

## More detail

| Topic | Where |
|-------|--------|
| Install script | [`scripts/install-docker.sh`](scripts/install-docker.sh) |
| Start | [`scripts/start.sh`](scripts/start.sh) |
| Stop | [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose / binds | [`docker-compose.yml`](docker-compose.yml) (worktree + state mounts) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| Stdio / local checkout | [stdio.md](stdio.md) |
| Develop from source | [docs/development.md](docs/development.md) |
| HTTP API / endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| HMAC key location | [docs/workflow-fidelity.md](docs/workflow-fidelity.md) (`WORKFLOW_SERVER_KEY_DIR`) |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
