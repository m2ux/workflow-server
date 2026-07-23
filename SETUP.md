# Setup

Get a running workflow server and connect your IDE. Default path: **GHCR image** (no source checkout).

## 1. Run the server

Needs Docker.

```bash
INSTALL=~/.local/share/workflow-server
mkdir -p "$INSTALL"
curl -fsSL -o "$INSTALL/run-workflow-server.sh" \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/run-docker.sh
chmod +x "$INSTALL/run-workflow-server.sh"
git clone -b workflows --single-branch \
  https://github.com/m2ux/workflow-server.git "$INSTALL/workflows"
"$INSTALL/run-workflow-server.sh" -d
```

Check: `curl -fsS http://127.0.0.1:3000/health`

Options (`--install-dir`, binds, tags): `"$INSTALL/run-workflow-server.sh" --help`

## 2. Connect the MCP client

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

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

---

## More detail

| Topic | Where |
|-------|--------|
| Develop from source | [docs/development.md](docs/development.md) |
| HTTP API / endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| Compose / container binds | [`docker-compose.yml`](docker-compose.yml), [`scripts/run-docker.sh`](scripts/run-docker.sh) `--help` |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
