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

`scripts/reload-exp-sidecar.sh` stops one named container, compiles the engine checkout on the host, and starts it again on the same host port and corpus with that `dist` (and the engine `schemas`) bound read-only. The process is still `node dist/index.js` on the image's production `node_modules`. The image itself rebuilds when `package.json`, `package-lock.json` or the Dockerfile drifted, or when `--rebuild-image` is passed. When the engine checkout's `start.sh` does not accept `--dist-dir`, the copy next to this reload script is used so the bind still lands. It refuses the install container name `workflow-server` and host port 3000.

`--name` is the only required flag. Host port, corpus, engine checkout, image and projects root each default to what the named container records, running or exited, so reloading the pairing under test is `--name` alone and a sidecar a reboot left stopped reloads on the port it had; each is required when no container of that name exists. `--image` defaults to the image the named container records; when none exists it is `workflow-server:local`. `--build` defaults to the engine checkout the named container records; when none exists it is the checkout that contains the script. Pass a directory when naming a pairing whose engine lives in another worktree.

```bash
# First reload of a new experiment: name the pairing.
./scripts/reload-exp-sidecar.sh \
  --name=workflow-server-exp \
  --image=workflow-server:exp-ttd \
  --build=.worktrees/feat/time-to-dispatch-experiment \
  --workflows-dir=.worktrees/feat/time-to-dispatch-meta \
  --host-port=32772

# Every reload after it: compile the same pairing on the host.
./scripts/reload-exp-sidecar.sh --name=workflow-server-exp
```

`--no-build` reuses the image the named container records and does not compile on the host. `--rebuild-image` rebuilds the image, skips host compile, and serves the image-baked `dist`. Point the experiment MCP server at the printed URL. Leave `workflow-server` on :3000. A recreate drops in-memory MCP sessions; the next walk calls `discover` on the sidecar again.

**Before the swap.** The corpus is held to the guards that decide whether a server can serve it — the definitions load, resolve and parse (`guards/check-all.ts --serving-only`, under a second) — before anything is stopped. A corpus that fails the guards refuses and leaves the container as it found it, because an agent walking them meets the same failure several minutes in. Host `tsc` runs next; a failed compile refuses without stopping the container. `--no-preflight` skips the corpus check.

The convention guards are not part of this, and that is the point: they measure the corpus this repository ships, so a corpus written to exercise one construct fails them for holding no bootstrap protocol and no harness map — true of every such corpus, and silent on whether it serves. Run `npx tsx guards/check-all.ts --root DIR --corpus-only` when the full picture is what you want. The outgoing container's log is written to `$INSTALL/logs` (or `--log-dir`) before it is removed — that file holds the JSON audit line the server writes per tool call, which is the record of the run being compared against. A reload that never reaches ready prints the probe's own payload, so the check holding it back is named rather than guessed at.

**Reading an instance back.** `/ready` names the corpus an instance serves: `corpus.hostDir` is the tree behind the mount, so two sidecars are told apart by the endpoint itself, over the same port a client already talks to. The container also carries the corpus path, both checkouts' commits and a dirty marker as labels, which add the commits and need a Docker socket:

```bash
docker inspect workflow-server-exp --format '{{json .Config.Labels}}'
curl -fsS http://127.0.0.1:32772/ready
```

**Cite the pin, not the path.** A corpus is usually served from a worktree under `.worktrees/`, which exists to be removed — a host path names where the tree stood on one machine at one time, and names nothing once the worktree is gone. `corpus.pin` is a commit, and stays resolvable from the repository for as long as the branch holding it does, so it is the handle a record of a run should carry. Whenever a mounted tree stops holding a workflow, readiness reports `corpusServes: false` instead of the server answering every request with a miss.

**Keeping a walk out of live planning.** Planning resolves at `<projects-root>/<repo>/.engineering/artifacts/planning`, so a sidecar sharing the install projects root writes a dated folder beside real work on every run. `--projects-root=DIR` gives an experiment a root of its own, holding its own checkout of the target repo, and the whole run can then be thrown away.

## 3. Verify

| Check | How                                                        |
|-------|------------------------------------------------------------|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `status: ok`      |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready`  |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |

**Expected cues**

- `/health` → JSON with `"status":"ok"` (or equivalent ok payload).
- `/ready` → ready payload with **`sessionKeyWritable: true`** and **`corpusServes: true`**, beside a `corpus` object naming the mounted tree and counting the workflows in it.

A green `/health` without `sessionKeyWritable: true` means sessions cannot start. `corpusServes: false` means the mounted tree holds no workflow, so every tool call misses — check the corpus bind against `corpus.dir`.

Adjust host/port if you changed `--host-port` (or read the URL `start.sh` prints when the host port is 0). Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `/ready` fails or `sessionKeyWritable` is false | Host `$INSTALL/state` bind and `WORKFLOW_SERVER_KEY_DIR` — see `start.sh` and [workflow-fidelity](docs/workflow-fidelity.md) |
| `corpusServes` is false | The corpus bind — compare `corpus.dir` in the payload with `--workflows-dir` |
| OAuth / `.well-known` 404 or bare `GET /mcp` 400 in logs | Expected without application auth — see §3 above |
| Image/container crash loop | `docker logs workflow-server`; confirm the `state` bind and image pull |

Shared install sequence (deploy, checkout, Cursor workspace, update workflows): [setup.md](setup.md).
