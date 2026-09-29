# Configuration reference

Every flag and environment variable the server reads at startup.

## Root binding

One of a workspace path **or** `--repo` is required at startup. The table names where each resulting directory sits.

| Variable or flag | Default | Description |
|------------------|---------|-------------|
| `--workspace=PATH` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT` | — | Explicit workspace or worktree root. In single-root mode, planning sits under this path |
| `--repo=owner/repo` / `WORKFLOW_SERVER_REPO` | — | Bind `$INSTALL/projects/<name>/.worktrees` and `$INSTALL/projects/<name>/.engineering`, where `<name>` is the last segment of the repository and `$INSTALL` the install root. A workspace path takes precedence |
| `--install-dir=PATH` / `WORKFLOW_SERVER_INSTALL_DIR` | `~/.local/share/workflow-server`, or `$XDG_DATA_HOME/workflow-server` | Install root, used with `--repo` |
| `WORKFLOW_SERVER_ENGINEERING_DIR` | the workspace | Engineering multi-root, or the single engineering checkout used for planning and session files. Read only with a workspace path; Docker's `start.sh` passes the container path of the engineering root it binds |
| `PLANNING_SLUG` | `.engineering/artifacts/planning` (single-root mode), or `artifacts/planning` (repo and engineering-root modes) | Planning directory, relative to the engineering root |

## Host paths

Under Docker the server reads its trees at container paths. These name the host directories bound there, so a path the server returns, and the corpus it reports serving, are the host's.

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST_PROJECTS_ROOT` / `HOST_PROJECTS_DIR` | — | Host directory bound as the projects root; returned paths under it are rewritten to the host path |
| `HOST_WORKTREE_ROOT` / `HOST_WORKTREE_DIR` | — | Host directory bound as the worktree root, rewritten the same way |
| `HOST_WORKFLOWS_DIR` / `HOST_WORKFLOWS_ROOT` | — | Host tree behind the corpus mount, reported as `corpus.hostDir` by `GET /ready` |

## Process

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_DIR` | `.worktrees/workflows` of the primary checkout | Corpus the server serves; `--workflow-dir` takes precedence |
| `SCHEMAS_DIR` | `./schemas` | JSON Schema files |
| `SERVER_NAME` | `workflow-server` | Server name in the health check |
| `SERVER_VERSION` | `2.1.0` | Server version in the health check |
| `TRANSPORT` | `stdio` | Transport to start, `stdio` or `http`; `--transport` takes precedence |
| `PORT` | `3000` | Port the HTTP transport listens on, ignored under stdio; `--port` takes precedence |
| `HOST` | `localhost` | Host the HTTP transport binds to, ignored under stdio; `--host` takes precedence |

## Delivery budgets

[Delivery](delivery.md#delivery-budgets) explains what each one is for and how it was calibrated.

| Variable | Default | Description |
|----------|---------|-------------|
| `BUNDLE_HEADROOM_FRACTION` | `0.8` | Share of a worker's declared window that eager step-technique bundling may spend ([window budget](delivery.md#window-budget)) |
| `BUNDLE_CHARS_PER_TOKEN` | `4` | Token to character factor, used by both window and batch budgets |
| `MAX_RESPONSE_CHARS` | `60000` | What one tool result may carry, measured over response text and protocol metadata together. Reports; never truncates ([response bound](delivery.md#one-tool-result)) |
| `BATCH_HEADROOM_FRACTION` | `0.35` | Share of a worker's window one dispatch may accumulate across a run of activities; clamped to [0, 1] ([batch budget](delivery.md#batch-budget)) |
| `BATCH_MAX_ACTIVITIES` | `3` | Distinct activities one delivery scope may take; clamped to [1, 100] ([batch budget](delivery.md#batch-budget)) |
| `FAN_MAX_BRANCHES` | `4` | Branches one fanned exit may open, unless the destination declares a tighter `maxInstances`; clamped to [2, 100] ([fanning](dispatch.md#fanning-an-exit-across-several-branches)) |

## Signing key

The key that seals session state lives in a file named `secret`. The server looks for its directory in `WORKFLOW_SERVER_KEY_DIR` first, then `WORKFLOW_SERVER_STATE_DIR`, falling back to `~/.workflow-server`. Docker's `start.sh` sets it explicitly, because non-root containers often run with `HOME=/` and the key would otherwise land somewhere unwritable. What the seal proves is in [fidelity](fidelity.md#layer-1-session-integrity).

## Examples

```bash
# Single root — workspace doubles as the engineering root for planning
node dist/index.js --workspace=~/work --workflow-dir=.worktrees/workflows

# Per-repo layout, after install.sh and a checkout under $INSTALL/projects
node dist/index.js --repo=m2ux/workflow-server --transport=http

# HTTP defaults from npm
npm run start:http   # or: node dist/index.js --transport=http --port=3000 --host=localhost
```
