# Setup — stdio

The IDE spawns the server over stdio, the default transport. Shared steps are [setup](setup.md).

## Prerequisites

Node.js, Git, and an MCP client.

## 1. Build

```bash
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
npm install
git worktree add .worktrees/workflows workflows
npm run build
```

That worktree is the corpus the server serves when `--workflow-dir` is omitted.

## 2. MCP client

The IDE starts the process. Startup requires `--workspace=PATH` or `--repo=owner/repo`. `--install-dir` alone exits.

### One workspace

Planning sits at `.engineering/artifacts/planning` under that path.

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--workspace=/path/to/your/checkout"
      ]
    }
  }
}
```

A separate engineering checkout uses `WORKFLOW_SERVER_ENGINEERING_DIR`. Planning is then `artifacts/planning` under that directory.

### Several checkouts

`--workspace` is a directory named `projects`, or `$INSTALL/projects`. Each session lands at `<root>/<repo>/.engineering/artifacts/planning/<slug>`. The repo is chosen on `start_session`, from `working_directory`.

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--workspace=/home/you/projects"
      ]
    }
  }
}
```

`--repo=owner/repo` pins one checkout under the install root: `$INSTALL/projects/<repo>/.worktrees`, with planning at `$INSTALL/projects/<repo>/.engineering/artifacts/planning`.

`--transport=stdio` is the default. Other flags are in [configuration](configuration.md#process).

## 3. Verify

There is no HTTP listener. The IDE owns the process.

| Check | How |
| ----- | --- |
| Build | `npm run typecheck`, and `npm run build` when `dist/` is stale |
| Binding | `--workspace` or `--repo`, and a readable corpus |
| MCP | Reload MCP. The entry is connected, with no spawn error |
| Smoke | `discover`, then `start_session` with `workflow_id`, `agent_id`, and `working_directory` |

`start_session` returns a six-character `session_index`. A spawn failure is on stderr of `node …/dist/index.js`.

Then [initialise the workspace](setup.md#2-initialise-workspace) and [verify](setup.md#3-verify).

## Troubleshooting

| Symptom | What to check |
| ------- | ------------- |
| Exits immediately | `--workspace` or `--repo`. `--install-dir` alone is not a binding |
| Cannot find `dist/index.js` | `npm run build`, and an absolute path to that file |
| Workflows not found | `--workflow-dir` or the default `.worktrees/workflows`. A tree with `corpus/` is walked there. `docs/` on that tree is not a workflow |
| Planning or repo errors | `working_directory` on `start_session` is the checkout under work. The server derives `owner/repo` from its origin |
| Agent never calls `discover` | The [verify](setup.md#3-verify) step |
