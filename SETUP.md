# Setup

Get a running workflow server and connect your IDE. Default path: **GHCR image** (no source checkout).

## 1. Install

Needs git and curl. Installs under `~/.local/share/workflow-server` (runner + `workflows` clone). Does **not** start the container.

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
```

Options: `bash <(curl -fsSL …/install-docker.sh) --help` (`--install-dir`, …)

## 2. Run the server

Needs Docker.

```bash
~/.local/share/workflow-server/run-workflow-server.sh -d
```

Check: `curl -fsS http://127.0.0.1:3000/health`

Runner options: `~/.local/share/workflow-server/run-workflow-server.sh --help`

## 3. Update workflows

Pull the latest `workflows` branch into the install checkout:

```bash
~/.local/share/workflow-server/update-workflows.sh
```

Restart the server afterward if it is already running. Use `--force` only to discard local edits in that checkout.

## 4. Connect the MCP client

Export the endpoint (Cursor reads `${env:…}` from the process environment):

```bash
export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp
```

Project config ([`.cursor/mcp.json`](.cursor/mcp.json)):

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

Claude Desktop: same `npx mcp-remote` entry in  
`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or  
`%APPDATA%\Claude\claude_desktop_config.json` (Windows).

Restart the IDE, then ask it to list available workflows.

## 5. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

---

## More detail

| Topic | Where |
|-------|--------|
| Install / run / update scripts | [`scripts/install-docker.sh`](scripts/install-docker.sh), [`scripts/run-docker.sh`](scripts/run-docker.sh), [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Develop from source | [docs/development.md](docs/development.md) |
| HTTP API / endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| Compose / container binds | [`docker-compose.yml`](docker-compose.yml) |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
