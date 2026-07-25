# Setup — Docker / HTTP

Transport-specific steps for running the **GHCR image** over HTTP.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install

Fetches helper scripts, clones the `workflows` branch, creates `state/` (HMAC key), writes `$INSTALL/env`:

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

## 2. Start

```bash
~/.local/share/workflow-server/start.sh -d
```

Stop:

```bash
~/.local/share/workflow-server/stop.sh
```

Compose alternative: [`docker-compose.yml`](docker-compose.yml) (same bind names as `.env.example`).

## 3. Verify

| Check | How |
|-------|-----|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `{"status":"ok"}` |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready` including **`sessionKeyWritable: true`** (plus workflow/schemas/workspace, and `engineeringDir` when split) |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |

**Expected cues**

- `/health` → JSON with `"status":"ok"` (or equivalent ok payload).
- `/ready` → ready payload with **`sessionKeyWritable: true`**.

A green `/health` without `sessionKeyWritable: true` means sessions cannot start.

Adjust host/port if you changed `--host-port`. Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

Then finish shared steps in [setup.md](setup.md) (**§2** deploy + init-repo, **§3** example workspace / IDE, **§4** Update Workflows).

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `/ready` fails or `sessionKeyWritable` is false | Host `$INSTALL/state` bind and `WORKFLOW_SERVER_KEY_DIR` — see `start.sh` and [workflow-fidelity](docs/workflow-fidelity.md) |
| OAuth / `.well-known` 404 or bare `GET /mcp` 400 in logs | Expected without application auth — see §3 above |
| Image/container crash loop | `docker logs workflow-server`; confirm the `state` bind and image pull |

Shared install, deploy, and init-repo: [setup.md](setup.md).

## HTTP-only references

| Topic | Where |
|-------|--------|
| Start / stop / binds | [`scripts/start.sh`](scripts/start.sh), [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose | [`docker-compose.yml`](docker-compose.yml) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| HMAC key location | [docs/workflow-fidelity.md](docs/workflow-fidelity.md) (`WORKFLOW_SERVER_KEY_DIR`) |
| HTTP routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Example Cursor workspace | [examples/cursor-workspace/](examples/cursor-workspace/) |
| Shared setup | [setup.md](setup.md) |
| stdio transport | [stdio.md](stdio.md) |
