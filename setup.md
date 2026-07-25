# Setup

Install Workflow Server and prepare a target repository so an IDE agent can run workflows.

**Outcome:** server reachable over your chosen transport, target repo registered, bootstrap rule in place, and a verified first session.

Transport install, MCP client config, and transport verify steps live only in:

- [http.md](http.md) — Docker / HTTP  
- [stdio.md](stdio.md) — local stdio  

This page owns the **shared** sequence both transports finish with.

## Three different operations

Do not treat these as synonyms:

| Operation | Script | What it does |
|-----------|--------|----------------|
| **Install the server host** | [`scripts/install.sh`](scripts/install.sh) | Creates the install directory, helper scripts, workflows clone, and default layout under `$INSTALL` (see table below). |
| **Deploy into a product repo** | [`scripts/deploy.sh`](scripts/deploy.sh) | Runs **inside the target project**. Makes that repo workflow-compatible (engineering layout / branch or submodule). |
| **Register the repo with the install** | [`scripts/init-repo.sh`](scripts/init-repo.sh) | Runs against `$INSTALL`. Materialises checkouts and planning paths for `owner/repo`. Does **not** replace deploy. |

Typical order for a new product repo: **install host (once) → deploy in the repo → init-repo → IDE rule → verify**.

Engineering layout patterns: [docs/engineering-storage.md](docs/engineering-storage.md).

## 1. Choose a transport

| Path | When | Guide |
|------|------|--------|
| **Docker / HTTP** | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

Complete the transport guide’s install, start (HTTP), and MCP client sections first, then return here for §2–§4.

### Installed root paths

Canonical path table (do not maintain a second full copy elsewhere):

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Helper scripts, `env`, workflows clone |
| **Projects** | `$INSTALL/projects` | Per-repo main/default-branch checkouts (`projects/<owner>/<repo>/`) |
| **Engineering** | `$INSTALL/projects/<owner>/<repo>/.engineering` | Planning / sessions (submodule or materialised eng) |
| **Worktrees** | `$INSTALL/worktrees` | Per-repo feature worktree parents |
| **Workflows** | `$INSTALL/workflows` | Workflow definitions (`workflows` branch) |

> Full layout and migration notes: [docs/install-projects-worktrees.md](docs/install-projects-worktrees.md).  
> Override roots with `--install-dir`, `--worktree-root`, `--projects-root` (see `install.sh --help`).

## 2. Init a target repo

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

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests and passes `session_index` / `repo` correctly.

### Example Cursor workspace

Copy-ready multi-root workspace (MCP config, rules, `AGENTS.md` repo hint):

**[examples/cursor-workspace/](examples/cursor-workspace/)** — [README](examples/cursor-workspace/README.md).

## 4. Update Workflows {#day-two}

When workflow definitions or managed project checkouts change remotely, refresh locally:

```bash
$INSTALL/update-workflows.sh
```

This fast-forwards `$INSTALL/workflows` and every `$INSTALL/projects/<owner>/<repo>` (plus `.engineering` when it is a git checkout). Restart the HTTP server afterward if it is running.

The anchor `#day-two` is kept for existing links (same section).

## Verify (after transport + §2–§3)

Transport-specific health checks: [http.md §4](http.md#4-verify) or [stdio.md §3](stdio.md#3-verify).

**MCP smoke (both transports):**

1. Agent calls **`discover`**.
2. Agent calls **`start_session`** with at least `workflow_id` (default `meta`), `agent_id`, and **`repo: "owner/repo"`**.
3. You get a **`session_index`** back.

`list_workflows` alone is not a full smoke test.

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Sessions fail while HTTP is up | `/ready` not fully ready | Require `sessionKeyWritable: true` — [http.md](http.md) |
| Agent skips `discover` | Bootstrap rule missing | [docs/ide-setup.md](docs/ide-setup.md) |
| Repo / planning path errors | Skipped deploy or init-repo | Complete §2a then §2b |
| stdio exits at startup | No workspace or repo binding | [stdio.md](stdio.md) — `--workspace` or `--repo` required |
| OAuth discovery 404s in logs | Unauthenticated local HTTP | Expected noise — [http.md](http.md) |

## More detail

| Topic | Where |
|-------|--------|
| Install layout plan | [docs/install-projects-worktrees.md](docs/install-projects-worktrees.md) |
| HTTP / Docker only | [http.md](http.md) |
| stdio / local checkout only | [stdio.md](stdio.md) |
| Install script | [`scripts/install.sh`](scripts/install.sh) |
| Deploy into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Engineering storage patterns | [docs/engineering-storage.md](docs/engineering-storage.md) |
| Init install paths | [`scripts/init-repo.sh`](scripts/init-repo.sh) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) |
| IDE rule | [docs/ide-setup.md](docs/ide-setup.md) |
| Example Cursor workspace | [examples/cursor-workspace/](examples/cursor-workspace/) |
| HTTP API routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
