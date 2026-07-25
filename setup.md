# Setup

Install Workflow Server and prepare a target repository so an IDE agent can run workflows.

**Outcome:** server reachable over your chosen transport, target repo registered, bootstrap rule in place, and a verified first session.

## 1. Choose a transport

Complete the transport guide’s install, then return here for §2–§4.

| Path | When | Guide |
|------|------|--------|
| **Docker / HTTP** | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

## 2. Initialise a target repo

Two steps per project. **2a** changes the **product repo**. **2b** sets up **local install paths** for that repo.

### 2a. Deploy engineering into the project (required first)

From the **root of the target project repo** (not the workflow-server checkout), run [`scripts/deploy.sh`](scripts/deploy.sh):

```bash
# inside the target project
curl -fsSL -o deploy.sh \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

Layouts (same-repo orphan, shared engineering monorepo, in-branch): [docs/engineering-storage.md](docs/engineering-storage.md). Flags: `./deploy.sh --help`.

### 2b. Materialise install-root paths

After deploy, register the project under the install layout:

```bash
~/.local/share/workflow-server/init-repo.sh owner/repo
# optional: pin the source checkout branch (default = remote default, usually main)
~/.local/share/workflow-server/init-repo.sh --branch=develop owner/repo
```

That creates:

- `$INSTALL/projects/<owner>/<repo>/` — app checkout on `--branch` or the remote default
- `$INSTALL/projects/<owner>/<repo>/.engineering/` — engineering submodule or materialised planning tree
- `$INSTALL/worktrees/<owner>/<repo>/` — parent directory for feature worktrees

`init-repo.sh` does **not** init product `workflows` submodules by default (server defs live in `$INSTALL/workflows`). Repeat **2a → 2b** for each product repo.

## 3. Adopt the example Cursor workspace

**Recommended path:** copy and open [examples/cursor-workspace/](examples/cursor-workspace/) (see its [README](examples/cursor-workspace/README.md)). That template mirrors `~/.local/share/cursor/workspaces/workflow-server` and already includes:

- `.cursor/mcp.json` (workflow-server via `mcp-remote`)
- always-applied bootstrap rules
- one-line `AGENTS.md` for `repo: "owner/repo"`
- multi-root `.code-workspace` (workspace, project, workflows, planning, work trees)

Do **not** treat hand-rolled MCP JSON or pasting bootstrap rules as the primary onboarding path. After the workspace is open, ask the agent to start a workflow.

Detail and verify steps: [docs/ide-setup.md](docs/ide-setup.md).

## 4. Update Workflows

When workflow definitions or managed project checkouts change remotely, refresh locally:

```bash
$INSTALL/update-workflows.sh
```

This fast-forwards `$INSTALL/workflows` and every `$INSTALL/projects/<owner>/<repo>` (plus `.engineering` when it is a git checkout). Restart the HTTP server afterward if it is running.

The anchor `#day-two` is kept for existing links (same section).

## 5. Verify

Transport-specific health checks: [http.md §4](http.md#4-verify) or [stdio.md §3](stdio.md#3-verify).

**MCP smoke (both transports):**

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

