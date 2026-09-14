# Setup — Docker / HTTP

Transport-specific steps for running the server over HTTP — the published GHCR image, or an image built from a checkout.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install

Fetches helper scripts, places a corpus checkout (default: the `workflows`
branch at `$INSTALL/workflows`), ensures a projects root (default `~/projects/dev`),
creates `state/` (HMAC key), writes `$INSTALL/env`. `--corpus-branch`,
`--repo-url` / `--corpus-url`, and `--workflows-dir` / `--corpus-dir` select
the corpus; those values are recorded in `env` for `start.sh` and
`update-workflows.sh`:

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

## 2. Start

```bash
~/.local/share/workflow-server/start.sh -d
```

Binds `$HOST_PROJECTS_ROOT` (default `~/projects/dev`) and `$INSTALL/state`. Planning
for a `start_session` that carries `working_directory` is under
`$HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning/<slug>/` on the host
when `HOST_PROJECTS_ROOT` is set. The server derives `owner/repo` from that checkout's origin.

Compose alternative: [`docker-compose.yml`](docker-compose.yml) (same bind names as `.env.example`). `HOST_PORT` selects the published port.

### Second instance from a checkout

`start.sh --name` and `--host-port` address one container. The install instance keeps the default name `workflow-server` and host port 3000. A second process uses a different name and port so the two do not replace each other.

`--build` builds the image from a directory that contains this repo's `Dockerfile` (the current directory when DIR is omitted), tags it `workflow-server:local` unless `--image` names another tag, and skips the GHCR pull. `--host-port=0` with `-d` lets Docker pick a free host port; the script prints the MCP URL after start.

```bash
./scripts/start.sh -d --build --name=workflow-server-trial --host-port=0 --no-update-workflows
./scripts/stop.sh --name=workflow-server-trial
```

The sidecar uses the same install binds (projects root, HMAC state) as the first instance. `--workflows-dir` selects the corpus for that container. Cursor's MCP URL is whatever `.mcp.json` names; point it at the printed URL to talk to the sidecar.

### Reload an experiment sidecar on a stable port

`scripts/reload-exp-sidecar.sh` stops one named container, rebuilds (or reuses) its image from a checkout, and starts it again on the same host port with `--workflows-dir`. It refuses the install container name `workflow-server` and host port 3000.

`--name` and `--workflows-dir` are required. `--image` defaults to `workflow-server:local` (pass a distinct tag per experiment). `--build` defaults to the checkout that contains the script; pass a directory when the engine lives in another worktree. `--host-port` defaults to the port that container already publishes, and is required when none is running.

```bash
./scripts/reload-exp-sidecar.sh \
  --name=workflow-server-exp \
  --image=workflow-server:exp-ttd \
  --build=.worktrees/feat/time-to-dispatch-experiment \
  --workflows-dir=.worktrees/feat/time-to-dispatch-meta \
  --host-port=32772
```

`--no-build` reuses `--image`. Point the experiment MCP server at the printed URL. Leave `workflow-server` on :3000.

## 3. Verify

| Check | How                                                        |
|-------|------------------------------------------------------------|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `status: ok`      |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready`  |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |

**Expected cues**

- `/health` → JSON with `"status":"ok"` (or equivalent ok payload).
- `/ready` → ready payload with **`sessionKeyWritable: true`**.

A green `/health` without `sessionKeyWritable: true` means sessions cannot start.

Adjust host/port if you changed `--host-port` (or read the URL `start.sh` prints when the host port is 0). Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `/ready` fails or `sessionKeyWritable` is false | Host `$INSTALL/state` bind and `WORKFLOW_SERVER_KEY_DIR` — see `start.sh` and [workflow-fidelity](docs/workflow-fidelity.md) |
| OAuth / `.well-known` 404 or bare `GET /mcp` 400 in logs | Expected without application auth — see §3 above |
| Image/container crash loop | `docker logs workflow-server`; confirm the `state` bind and image pull |

Shared install sequence (deploy, checkout, Cursor workspace, update workflows): [setup.md](setup.md).
