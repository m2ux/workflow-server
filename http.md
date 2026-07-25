# Setup — Docker / HTTP

Transport-specific steps for running the **GHCR image** over HTTP.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install

Fetches helper scripts, clones the `workflows` branch, ensures a projects root
(default `~/projects/dev`), creates `state/` (HMAC key), writes `$INSTALL/env`:

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

## 2. Start

```bash
~/.local/share/workflow-server/start.sh -d
```

Binds `$HOST_PROJECTS_ROOT` (default `~/projects/dev`) and `$INSTALL/state`. Planning
for `start_session({ repo: "owner/repo" })` is under
`$HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning/<slug>/` on the host
when `HOST_PROJECTS_ROOT` is set.

Compose alternative: [`docker-compose.yml`](docker-compose.yml) (same bind names as `.env.example`).

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

Adjust host/port if you changed `--host-port`. Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `/ready` fails or `sessionKeyWritable` is false | Host `$INSTALL/state` bind and `WORKFLOW_SERVER_KEY_DIR` — see `start.sh` and [workflow-fidelity](docs/workflow-fidelity.md) |
| OAuth / `.well-known` 404 or bare `GET /mcp` 400 in logs | Expected without application auth — see §3 above |
| Image/container crash loop | `docker logs workflow-server`; confirm the `state` bind and image pull |

Shared install, deploy, and checkout: [setup.md](setup.md).
