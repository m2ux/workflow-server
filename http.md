# Setup — Docker / HTTP

Transport-specific steps for running the **GHCR image** over HTTP.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install

Fetches helper scripts, clones the `workflows` branch, creates `state/` (HMAC key), writes `$INSTALL/env`:

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

## 2. Start

```bash
~/.local/share/workflow-server/start.sh -d
```

Defaults:

- Image: `ghcr.io/m2ux/workflow-server:main`
- Publish: `http://127.0.0.1:3000`
- Binds:
  - host `$INSTALL/state` → `/var/lib/workflow-server/state` (HMAC signing key)
- Container env: `WORKTREE_ROOT` / `WORKFLOW_WORKSPACE`, `WORKFLOW_SERVER_ENGINEERING_DIR`,
  `WORKFLOW_SERVER_INSTALL_DIR`, `WORKFLOW_SERVER_KEY_DIR` (see `start.sh`)
- Per-repo planning is selected at **session** time via `start_session({ repo: "owner/repo" })`
  (after `init-repo.sh owner/repo`). Path:
  `$INSTALL/projects/owner/repo/.engineering/artifacts/planning/<slug>/`.
- Runs as your host uid:gid; key path does **not** depend on `HOME` (non-root
  containers often have `HOME=/`)

Stop:

```bash
~/.local/share/workflow-server/stop.sh
```

Compose alternative: [`docker-compose.yml`](docker-compose.yml) (same bind names as `.env.example`).

## 3. MCP client (HTTP)

### Recommended — example Cursor workspace

Do **not** hand-roll MCP config as the primary path. Copy and open the example multi-root workspace; it already includes `.cursor/mcp.json`, always-applied rules, and `AGENTS.md`:

**[examples/cursor-workspace/](examples/cursor-workspace/)** — [README](examples/cursor-workspace/README.md)

That template mirrors the live layout under `~/.local/share/cursor/workspaces/workflow-server` (workspace + project + workflows + planning + work trees). After you open it in Cursor, ask the agent to start a workflow.

Shared install / init-repo steps: [setup.md](setup.md). IDE detail: [docs/ide-setup.md](docs/ide-setup.md).

### Optional — raw `mcp-remote` snippet

Only if you cannot use the example workspace. Cursor expands `${env:…}` from the **IDE process** environment; an unset variable breaks `mcp-remote`. For a fixed local port, hard-code:

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

### Expected log noise from `mcp-remote`

On connect, local unauthenticated HTTP may request OAuth discovery paths
(`.well-known/oauth-*`) and occasionally `GET /mcp` without a session.
Those return 404/400 and are **expected** without OAuth; successful MCP init
still follows. They appear as ordinary request logs (`type: info`), not
`type: error`. Real failures are application errors on tools (e.g. `start_session`).

## 4. Verify

| Check | How |
|-------|-----|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `{"status":"ok"}` |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready` including **`sessionKeyWritable: true`** (plus workflow/schemas/workspace, and `engineeringDir` when split) |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |
| MCP smoke | From the example workspace: `discover`, then `start_session` with `workflow_id` (e.g. `meta`), `agent_id`, and **`repo: "owner/repo"`** — listing workflows alone is not enough |

**Expected cues**

- `/health` → JSON with `"status":"ok"` (or equivalent ok payload).
- `/ready` → ready payload with **`sessionKeyWritable: true`**.
- `start_session` → response includes a six-character **`session_index`**.

A green `/health` without `sessionKeyWritable: true` means sessions cannot start.

Adjust host/port if you changed `--host-port`. Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

Then finish shared steps in [setup.md](setup.md) (**§2** deploy + init-repo, **§3** example workspace / IDE, **§4** Update Workflows).

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `/ready` fails or `sessionKeyWritable` is false | Host `$INSTALL/state` bind and `WORKFLOW_SERVER_KEY_DIR` — see `start.sh` and [workflow-fidelity](docs/workflow-fidelity.md) |
| MCP client cannot reach the server | URL must be `http://127.0.0.1:<port>/mcp`; prefer the example workspace’s `.cursor/mcp.json` |
| OAuth / `.well-known` 404 or bare `GET /mcp` 400 in logs | Expected without application auth — see §3 above |
| `start_session` rejects or cannot find planning | Run [setup.md §2](setup.md#2-initialise-a-target-repo) (`deploy` then `init-repo`); always pass `repo` |
| Image/container crash loop | `docker logs workflow-server`; confirm the `state` bind and image pull |

Shared install, deploy, and init-repo: [setup.md](setup.md).

## HTTP-only references

| Topic | Where |
|-------|--------|
| Start / stop / binds | [`scripts/start.sh`](scripts/start.sh), [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose | [`docker-compose.yml`](docker-compose.yml) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| HMAC key location | [docs/workflow-fidelity.md](docs/workflow-fidelity.md) (`WORKFLOW_SERVER_KEY_DIR`) |
| HTTP routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Example Cursor workspace | [examples/cursor-workspace/](examples/cursor-workspace/) |
| Shared setup | [setup.md](setup.md) |
| stdio transport | [stdio.md](stdio.md) |
