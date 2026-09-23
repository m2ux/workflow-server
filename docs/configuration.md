# Configuration reference

Every flag and environment variable the server reads at startup. The install sequence these settings fit into is [setup.md](../setup.md); what differs between the two transports is [http.md](../http.md) and [stdio.md](../stdio.md).

Where a flag and a variable name the same setting, the flag wins.

## Root binding

One of a workspace path **or** `--repo` is required at startup. The table names where each resulting directory sits.

| Variable or flag | Default | Description |
|------------------|---------|-------------|
| `--workspace=PATH` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT` | — | Explicit workspace or worktree root. Legacy single root: planning sits under this path |
| `--repo=owner/repo` / `WORKFLOW_SERVER_REPO` | — | Bind `$HOST_PROJECTS_ROOT/<repo>/.worktrees` and `$HOST_PROJECTS_ROOT/<repo>/.engineering` |
| `--install-dir=PATH` / `WORKFLOW_SERVER_INSTALL_DIR` | `~/.local/share/workflow-server`, or `$XDG_DATA_HOME/workflow-server` | Install root, used with `--repo` |
| `WORKFLOW_SERVER_ENGINEERING_DIR` | equals the workspace when unbound; `$HOST_PROJECTS_ROOT` under multi-root Docker | Engineering multi-root, or the single engineering checkout used for planning and session files |
| `PLANNING_SLUG` | `.engineering/artifacts/planning` (legacy), or `artifacts/planning` (repo and engineering-root modes) | Planning directory, relative to the engineering root |

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

Three budgets bound what reaches an agent, each protecting something different. [The delivery model](delivery-model.md#the-three-budgets) explains what each one is for and how it was calibrated.

| Variable | Default | Description |
|----------|---------|-------------|
| `BUNDLE_HEADROOM_FRACTION` | `0.8` | Share of a worker's declared window that eager step-technique bundling may spend ([window budget](delivery-model.md#the-window-budget)) |
| `BUNDLE_CHARS_PER_TOKEN` | `4` | Token to character factor, used by both window and batch budgets |
| `MAX_RESPONSE_CHARS` | `60000` | What one tool result may carry, measured over response text and protocol metadata together. Reports; never truncates ([response bound](delivery-model.md#what-one-tool-result-may-carry)) |
| `BATCH_HEADROOM_FRACTION` | `0.35` | Share of a worker's window one dispatch may accumulate across a run of activities; clamped to [0, 1] ([batch budget](delivery-model.md#the-batch-budget)) |
| `BATCH_MAX_ACTIVITIES` | `3` | Distinct activities one delivery scope may take; clamped to [1, 100] ([batch budget](delivery-model.md#the-batch-budget)) |
| `FAN_MAX_BRANCHES` | `4` | Branches one fanned exit may open, unless the destination declares a tighter `maxInstances`; clamped to [2, 100] ([fanning](dispatch-model.md#fanning-an-exit-across-several-branches)) |

## Signing key

The key that seals session state lives in a file named `secret`. The server looks for its directory in `WORKFLOW_SERVER_KEY_DIR` first, then `WORKFLOW_SERVER_STATE_DIR`, falling back to `~/.workflow-server`. Docker's `start.sh` sets it explicitly, because non-root containers often run with `HOME=/` and the key would otherwise land somewhere unwritable. What the seal proves is in [workflow fidelity](workflow-fidelity.md#layer-1-session-integrity).

## Examples

```bash
# Legacy single root — workspace doubles as the engineering root for planning
node dist/index.js --workspace=~/work --workflow-dir=.worktrees/workflows

# Per-repo layout, after install.sh and a checkout under HOST_PROJECTS_ROOT
node dist/index.js --repo=m2ux/workflow-server --transport=http

# HTTP defaults from npm
npm run start:http   # or: node dist/index.js --transport=http --port=3000 --host=localhost
```
