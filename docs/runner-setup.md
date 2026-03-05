# Headless Slack Workflow Runner — Setup Guide

This guide covers how to create the Slack app, configure the runner, start it, and execute a workflow.

---

## Prerequisites

- **Node.js >= 22.5.0** (the runner uses `node:sqlite` which requires v22.5.0+; tested on v24.2.0)
- **Cursor CLI** — the `agent` binary must be on your PATH. Install Cursor, then verify:
  ```bash
  agent --version
  ```
  If the binary is elsewhere, set `CURSOR_AGENT_BINARY` to the full path.
- **A Cursor API key** — required for `agent acp` mode. Available from your Cursor account settings.
- **A git repository** with submodules you want to target for workflow execution.

---

## 1. Create the Slack App

### 1.1 Create the app

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App**
2. Choose **From scratch**
3. Name it (e.g. `Workflow Runner`) and select your workspace
4. Click **Create App**

### 1.2 Enable Socket Mode

Socket Mode lets the bot connect via outbound WebSocket — no public URL needed.

1. In the app settings, go to **Socket Mode** (left sidebar)
2. Toggle **Enable Socket Mode** to On
3. You'll be prompted to create an **App-Level Token**:
   - Name it `socket-mode`
   - Add the scope `connections:write`
   - Click **Generate**
4. Copy the token (`xapp-...`) — this is your `SLACK_APP_TOKEN`

### 1.3 Add a slash command

1. Go to **Slash Commands** (left sidebar)
2. Click **Create New Command**
3. Fill in:
   - **Command:** `/workflow`
   - **Short Description:** `Start and manage workflow sessions`
   - **Usage Hint:** `start <workflow-id> <target> [issue-ref] | list | help`
4. Click **Save**

### 1.4 Enable Interactivity

Interactivity is required for checkpoint buttons (the agent asks questions via Slack buttons).

1. Go to **Interactivity & Shortcuts** (left sidebar)
2. Toggle **Interactivity** to On
3. No Request URL is needed when using Socket Mode
4. Click **Save Changes**

### 1.5 Set Bot Token Scopes

1. Go to **OAuth & Permissions** (left sidebar)
2. Under **Scopes → Bot Token Scopes**, add:
   - `chat:write` — post messages and replies in threads
   - `commands` — receive slash commands
3. Click **Save Changes**

### 1.6 Install to workspace

1. Go to **Install App** (left sidebar)
2. Click **Install to Workspace** and authorize
3. Copy the **Bot User OAuth Token** (`xoxb-...`) — this is your `SLACK_BOT_TOKEN`

### 1.7 Get the Signing Secret

1. Go to **Basic Information** (left sidebar)
2. Under **App Credentials**, copy the **Signing Secret** — this is your `SLACK_SIGNING_SECRET`

---

## 2. Configure the Runner

### 2.1 Create a `.env` file

In the workflow-server root, copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Slack App (from steps above)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-level-token

# Cursor CLI
CURSOR_API_KEY=key_your-cursor-api-key
CURSOR_AGENT_BINARY=agent                  # or full path to the binary

# Repository — the repo whose submodules you want to target
REPO_PATH=/home/you/projects/midnight-agent-eng
WORKTREE_BASE_DIR=/home/you/worktrees     # optional, defaults to ~/worktrees

# Log level (optional, default: info)
LOG_LEVEL=info

# Database path (optional, default: data/runner.db)
DB_PATH=data/runner.db
```

### 2.2 MCP servers (optional)

To pass MCP server configurations to agent sessions, set `MCP_SERVERS_JSON` as a JSON object. Each key is a server name, and the value has `command`, `args`, and optionally `env`:

```bash
MCP_SERVERS_JSON='{"workflow-server":{"command":"npx","args":["tsx","src/index.ts"],"env":{"NODE_ENV":"production"}}}'
```

These are written to `.cursor/mcp.json` in each worktree so the Cursor agent discovers them.

### 2.3 Install dependencies

```bash
cd /path/to/workflow-server
npm install
```

---

## 3. Start the Runner

```bash
npm run runner
```

On startup the runner:
1. Validates configuration (Zod schema checks token prefixes, required fields)
2. Opens the SQLite database at `data/runner.db` (created automatically)
3. Sweeps any orphaned worktrees from previous crashes (`wf-runner-*` prefix)
4. Connects to Slack via Socket Mode

You should see:

```
{"level":30,"msg":"Runner config loaded","repo":"/home/you/projects/midnight-agent-eng",...}
{"level":30,"msg":"Workflow Runner is listening (Socket Mode)"}
```

Logs are written to `logs/runner.YYYY-MM-DD.log` with daily rotation and 14-file retention.

### Stopping

Press `Ctrl+C` (SIGINT) or send SIGTERM. The runner will:
1. Clean up all active agent sessions (kill ACP processes)
2. Remove associated worktrees
3. Close the SQLite database
4. Disconnect from Slack

---

## 4. Execute a Workflow

### Start a workflow

In any Slack channel where the bot is present, type:

```
/workflow start <workflow-id> <target-submodule> [issue-ref]
```

**Parameters:**

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `workflow-id` | Yes | The workflow definition to execute | `work-package` |
| `target-submodule` | Yes | Submodule or directory within the repo to target | `midnight-node` |
| `issue-ref` | No | Issue reference for traceability | `PM-12345` |

**Example:**

```
/workflow start work-package midnight-node PM-22119
```

This will:
1. Post an initial message in the channel and create a thread
2. Create a git worktree (`wf-runner-<session-id>`) branching from `main`
3. Initialize the target submodule in the worktree
4. Spawn a Cursor ACP agent process pointing at the worktree
5. Send the workflow prompt to the agent
6. Stream agent status updates to the Slack thread every 5 seconds

### Respond to checkpoints

When the agent reaches a checkpoint (e.g., asking a question), it appears as **interactive buttons** in the Slack thread. Click the appropriate button to respond. The agent resumes automatically.

### List active sessions

```
/workflow list
```

Shows all currently running workflow sessions with their workflow ID, target, status, and elapsed time.

### Show help

```
/workflow help
```

---

## 5. Monitoring

### Logs

Structured JSON logs are written to `logs/`:

```bash
# Tail the current log file
tail -f logs/runner.$(date +%Y-%m-%d).log

# Pretty-print with pino-pretty (install separately)
tail -f logs/runner.$(date +%Y-%m-%d).log | npx pino-pretty
```

Each log entry includes `level`, `time`, `msg`, and contextual fields like `sessionId` and `workflowId`.

### Session database

Session state is persisted in SQLite at `data/runner.db`:

```bash
sqlite3 data/runner.db "SELECT id, workflow_id, target_submodule, status, created_at FROM sessions ORDER BY created_at DESC;"
```

Sessions survive runner restarts. On startup, any sessions left in a non-terminal state (`creating`, `running`, `awaiting_checkpoint`) are marked as `error` with a stale session diagnostic.

### Worktrees

Active worktrees live under `WORKTREE_BASE_DIR` (default `~/worktrees`), named `wf-runner-<session-id>`. On startup, any orphaned `wf-runner-*` worktrees are automatically cleaned up.

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Required environment variable X is not set` | Missing `.env` entry | Add the variable to `.env` |
| `SLACK_BOT_TOKEN must start with xoxb-` | Wrong token type | Use the Bot User OAuth Token, not the User Token |
| `SLACK_APP_TOKEN must start with xapp-` | Wrong token type | Use the App-Level Token from Socket Mode settings |
| `agent: command not found` | Cursor CLI not on PATH | Set `CURSOR_AGENT_BINARY` to the full path |
| Runner starts but `/workflow` does nothing | Bot not in channel | Invite the bot to the channel with `/invite @WorkflowRunner` |
| Checkpoint buttons don't respond | Interactivity not enabled | Enable Interactivity in the Slack app settings |
| `MCP_SERVERS_JSON is not valid JSON` | Malformed JSON string | Validate the JSON with `echo $MCP_SERVERS_JSON | jq .` |
| Orphaned worktrees accumulating | Runner crashed without cleanup | Restart the runner — it sweeps `wf-runner-*` on startup |
