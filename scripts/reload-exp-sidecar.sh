#!/usr/bin/env bash
# Reload an experiment HTTP sidecar on a stable host port.
#
# Stops one named container, rebuilds (or reuses) its image from a checkout,
# and starts it again on the same host port with a chosen corpus. Refuses the
# install instance name `workflow-server` and host port 3000.
#
# Host port and corpus default to what the named container already runs, so a
# rebuild of the pairing under test is `--name` alone.
set -euo pipefail

INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die() { echo "error: $*" >&2; exit 1; }

usage() {
  cat <<EOF
Reload an experiment HTTP sidecar on a stable host port.

Stops the named container, rebuilds (or reuses) its image from a checkout,
and starts it again on the same host port and corpus. Refuses the install
instance name workflow-server and host port 3000.

  scripts/reload-exp-sidecar.sh --name=NAME [options]
  scripts/reload-exp-sidecar.sh --name=NAME --workflows-dir=CORPUS [options]

Required:
  --name=NAME              Container name (not workflow-server).

Options:
  --workflows-dir=CORPUS   Corpus checkout (directory that contains corpus/).
                           Defaults to the corpus the running container binds.
                           Required when none is running.
  --projects-root=DIR      Host projects root bound RW. Defaults to the root
                           the running container binds, then to the install
                           root. Planning lands at DIR/<repo>/.engineering/
                           artifacts/planning, so a root of its own keeps an
                           experiment's walks out of the live planning tree.
  --image=IMAGE            Image tag (default: workflow-server:local).
  --build[=DIR]            Checkout whose Dockerfile is built (default: this
                           repo root). DIR is an engine worktree for a branch
                           that is not this checkout.
  --host-port=N            Host port. Defaults to the port the running
                           container publishes. Required when none is running.
  --log-dir=DIR            Where the outgoing container's log is kept
                           (default: INSTALL/logs). One file per reload,
                           holding the audit line the server writes per tool
                           call for the run being replaced.
  --no-build               Reuse --image; do not rebuild.
  --no-preflight           Skip the corpus guard sweep. The sweep runs before
                           the container stops: a corpus nothing can be
                           measured on refuses and leaves the sidecar up, and
                           guard findings warn and start.

Environment (overridden by flags):
  EXP_NAME  EXP_IMAGE  EXP_CORPUS  EXP_ENGINE  EXP_HOST_PORT
  EXP_PROJECTS_ROOT  EXP_LOG_DIR
  WORKFLOW_SERVER_START  WORKFLOW_SERVER_STOP

Example (time-to-dispatch sidecar from its engine worktree):

  scripts/reload-exp-sidecar.sh \\
    --name=workflow-server-exp \\
    --image=workflow-server:exp-ttd \\
    --workflows-dir=../time-to-dispatch-meta
EOF
}

# Where start.sh binds the corpus inside the container. Reading the bind back names the corpus a
# running sidecar serves.
CONTAINER_WORKFLOW_DIR="${CONTAINER_WORKFLOW_DIR:-/app/workflows}"
CONTAINER_PROJECTS_ROOT="${CONTAINER_PROJECTS_ROOT:-/var/lib/workflow-server/projects}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"

NAME="${EXP_NAME:-}"
IMAGE="${EXP_IMAGE:-workflow-server:local}"
CORPUS="${EXP_CORPUS:-}"
ENGINE="${EXP_ENGINE:-}"
PROJECTS="${EXP_PROJECTS_ROOT:-}"
PORT="${EXP_HOST_PORT:-}"
LOG_DIR="${EXP_LOG_DIR:-${INSTALL_DIR}/logs}"
BUILD=1
PREFLIGHT=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name=*) NAME="${1#*=}"; shift ;;
    --name) NAME="${2:?}"; shift 2 ;;
    --image=*) IMAGE="${1#*=}"; shift ;;
    --image) IMAGE="${2:?}"; shift 2 ;;
    --workflows-dir=*) CORPUS="${1#*=}"; shift ;;
    --workflows-dir) CORPUS="${2:?}"; shift 2 ;;
    --projects-root=*) PROJECTS="${1#*=}"; shift ;;
    --projects-root) PROJECTS="${2:?}"; shift 2 ;;
    --build=*) BUILD=1; ENGINE="${1#*=}"; shift ;;
    --build)
      BUILD=1
      if [[ $# -ge 2 && "$2" != -* ]]; then
        ENGINE="$2"
        shift 2
      else
        shift
      fi
      ;;
    --host-port=*) PORT="${1#*=}"; shift ;;
    --host-port) PORT="${2:?}"; shift 2 ;;
    --log-dir=*) LOG_DIR="${1#*=}"; shift ;;
    --log-dir) LOG_DIR="${2:?}"; shift 2 ;;
    --no-build) BUILD=0; shift ;;
    --no-preflight) PREFLIGHT=0; shift ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

resolve_helper() {
  local override="$1" install_path="$2" checkout_path="$3"
  if [[ -n "$override" ]]; then
    printf '%s\n' "$override"
    return
  fi
  if [[ -x "$install_path" ]]; then
    printf '%s\n' "$install_path"
    return
  fi
  printf '%s\n' "$checkout_path"
}

# Keep the outgoing container's log on the host, under a name carrying the container and the hour.
#
# The server writes one JSON line per tool call — the tool, its duration and its outcome — which is
# the run's own record of what an agent did. A reload removes the container, and the log lives in
# the container, so the record of the run being compared against goes with it. Best-effort: a
# directory that cannot be written warns and the reload continues.
capture_log() {
  docker container inspect "$NAME" >/dev/null 2>&1 || return 0
  if ! mkdir -p "$LOG_DIR" 2>/dev/null; then
    echo "warning: cannot create ${LOG_DIR}; the outgoing container's log goes unkept" >&2
    return 0
  fi
  local file="${LOG_DIR}/${NAME}-$(date -u +%Y%m%dT%H%M%SZ).log"
  if docker logs "$NAME" > "$file" 2>&1; then
    echo "  log    : ${file}"
  else
    rm -f "$file"
    echo "warning: cannot read the log of ${NAME}; it goes unkept" >&2
  fi
}

# The commit a checkout stands at, carrying a dirty marker when the tree holds uncommitted edits.
# A directory git does not track reports `unknown`, so a pin is always a value a label can hold.
git_pin() {
  local dir="$1" commit dirty=""
  commit="$(git -C "$dir" rev-parse --short HEAD 2>/dev/null || true)"
  [[ -n "$commit" ]] || { printf 'unknown\n'; return; }
  [[ -z "$(git -C "$dir" status --porcelain 2>/dev/null)" ]] || dirty="-dirty"
  printf '%s%s\n' "$commit" "$dirty"
}

# The host directory a container binds at CONTAINER_TARGET, empty when it binds none.
container_bind_source() {
  local container="$1" target="$2"
  docker inspect "$container" \
    --format "{{range .Mounts}}{{if eq .Destination \"${target}\"}}{{.Source}}{{end}}{{end}}" \
    2>/dev/null || true
}

# The host port a container publishes CONTAINER_PORT on, empty when it publishes none.
#
# `docker port` answers for a running container only, while the binding it reports is recorded on
# the container itself and survives a stop. Reading the record keeps a reload working on a sidecar
# a reboot left exited, which is the state the port is least likely to be remembered in.
container_host_port() {
  local container="$1" port="$2" spec
  spec="$(docker port "$container" "${port}/tcp" 2>/dev/null | head -n1 || true)"
  if [[ -n "$spec" ]]; then
    printf '%s\n' "${spec##*:}"
    return
  fi
  docker inspect "$container" \
    --format "{{(index (index .HostConfig.PortBindings \"${port}/tcp\") 0).HostPort}}" \
    2>/dev/null || true
}

[[ -n "$NAME" ]] || die "pass --name (see --help)"
[[ "$NAME" != "workflow-server" ]] || die "refusing to operate on the install container name"

if [[ -z "$ENGINE" ]]; then
  ENGINE="$(cd "${SCRIPT_DIR}/.." && pwd)"
else
  [[ -d "$ENGINE" ]] || die "engine checkout is not a directory: ${ENGINE}"
  ENGINE="$(cd "$ENGINE" && pwd)"
fi

# Port and corpus both default to what the named container already carries, so reloading a sidecar
# with a fresh build is `--name` alone and the pairing under test survives the reload by default.
# Either is required when no container of that name exists, there being nothing to read them from.
if [[ -z "$PORT" ]] && command -v docker >/dev/null 2>&1; then
  PORT="$(container_host_port "$NAME" "$CONTAINER_PORT")"
fi
[[ -n "$PORT" ]] || die "pass --host-port (no published port on ${NAME})"
[[ "$PORT" =~ ^[0-9]+$ ]] || die "host port must be numeric, got: ${PORT}"
[[ "$PORT" != "3000" ]] || die "refusing to bind an experiment sidecar on :3000 (install instance)"

if [[ -z "$CORPUS" ]] && command -v docker >/dev/null 2>&1; then
  CORPUS="$(container_bind_source "$NAME" "$CONTAINER_WORKFLOW_DIR")"
fi
[[ -n "$CORPUS" ]] || die "pass --workflows-dir (no corpus bind on ${NAME}; see --help)"
[[ -d "$CORPUS" ]] || die "corpus checkout is not a directory: ${CORPUS}"
CORPUS="$(cd "$CORPUS" && pwd)"
[[ -d "${CORPUS}/corpus" ]] || die "corpus not found (expected ${CORPUS}/corpus)"

# A projects root of its own gives an experiment its own planning tree, since planning resolves at
# <projects-root>/<repo>/.engineering/artifacts/planning and a walk writes a folder there per run.
# Empty leaves start.sh on the install root, which the install instance also writes to.
if [[ -z "$PROJECTS" ]] && command -v docker >/dev/null 2>&1; then
  PROJECTS="$(container_bind_source "$NAME" "$CONTAINER_PROJECTS_ROOT")"
fi
if [[ -n "$PROJECTS" ]]; then
  [[ -d "$PROJECTS" ]] || die "projects root is not a directory: ${PROJECTS}"
  PROJECTS="$(cd "$PROJECTS" && pwd)"
fi

START="$(resolve_helper "${WORKFLOW_SERVER_START:-}" "${INSTALL_DIR}/start.sh" "${ENGINE}/scripts/start.sh")"
STOP="$(resolve_helper "${WORKFLOW_SERVER_STOP:-}" "${INSTALL_DIR}/stop.sh" "${ENGINE}/scripts/stop.sh")"

[[ -x "$START" ]] || die "start.sh not found or not executable: ${START}"
[[ -x "$STOP" ]] || die "stop.sh not found or not executable: ${STOP}"
if [[ "$BUILD" -eq 1 ]]; then
  [[ -f "${ENGINE}/Dockerfile" ]] || die "no Dockerfile in engine checkout: ${ENGINE}"
fi

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"
command -v curl >/dev/null 2>&1 || die "curl not found on PATH"

# Put the corpus through its own guard suite before an agent walks it, reading the sweep's three
# outcomes as they are defined: clean, findings, or nothing measurable. A tree nothing could be
# measured on is the state a sidecar cannot serve, and is the one that refuses. Findings are a
# warning — an experiment branch carries them by nature, and which guard failed is the signal, so
# a load-level failure reads differently from corpus debt. The sweep runs before the running
# container is stopped, so a refusal leaves the current sidecar up.
preflight_corpus() {
  if [[ ! -f "${ENGINE}/guards/check-all.ts" ]]; then
    echo "note: no guard suite under ${ENGINE}; skipping corpus preflight" >&2
    return 0
  fi
  if ! (cd "$ENGINE" && npx tsx --version >/dev/null 2>&1); then
    echo "note: tsx does not resolve from ${ENGINE}; skipping corpus preflight" >&2
    return 0
  fi

  local out status
  set +e
  out="$(cd "$ENGINE" && npx tsx guards/check-all.ts --root "$CORPUS" --corpus-only 2>&1)"
  status=$?
  set -e

  case "$status" in
    0)
      echo "Preflight: corpus guards clean"
      ;;
    1)
      printf '%s\n' "$out" | grep -E '^[[:space:]]*\[(FAIL|UNMEASURED)\]|guard\(s\) in' >&2 || true
      echo "warning: corpus guards report findings on ${CORPUS} — starting anyway" >&2
      ;;
    *)
      printf '%s\n' "$out" | tail -n 20 >&2
      die "corpus at ${CORPUS} could not be measured (guard sweep exit ${status}).
  Nothing there is servable, so the running sidecar is left up.
  Pass --no-preflight to start on it regardless."
      ;;
  esac
}

if [[ "$PREFLIGHT" -eq 1 ]]; then
  preflight_corpus
fi

ENGINE_PIN="$(git_pin "$ENGINE")"
CORPUS_PIN="$(git_pin "$CORPUS")"

echo "Reloading ${NAME} on 127.0.0.1:${PORT}"
echo "  engine : ${ENGINE} @ ${ENGINE_PIN}"
echo "  corpus : ${CORPUS} @ ${CORPUS_PIN}"
echo "  image  : ${IMAGE}"
if [[ -n "$PROJECTS" ]]; then
  echo "  projects : ${PROJECTS}"
fi

capture_log
"$STOP" --name="$NAME" || true

START_ARGS=(
  -d
  --name="$NAME"
  --image="$IMAGE"
  --host-port="$PORT"
  --no-update-workflows
  --workflows-dir="$CORPUS"
)
if [[ -n "$PROJECTS" ]]; then
  START_ARGS+=(--projects-root="$PROJECTS")
fi
if [[ "$BUILD" -eq 1 ]]; then
  START_ARGS+=(--build="$ENGINE")
else
  START_ARGS+=(--no-pull)
fi

# Provenance the container carries itself, so a walk record cites one `docker inspect` rather than
# a pin typed from memory. The engine pair is present when this reload built the image; a reused
# image was built from a checkout this run knows nothing about, and stays unclaimed.
LABEL_ARGS=(
  --label "workflow-server.image=${IMAGE}"
  --label "workflow-server.corpus.dir=${CORPUS}"
  --label "workflow-server.corpus.pin=${CORPUS_PIN}"
)
if [[ -n "$PROJECTS" ]]; then
  LABEL_ARGS+=(--label "workflow-server.projects.dir=${PROJECTS}")
fi
if [[ "$BUILD" -eq 1 ]]; then
  LABEL_ARGS+=(--label "workflow-server.engine.dir=${ENGINE}")
  LABEL_ARGS+=(--label "workflow-server.engine.pin=${ENGINE_PIN}")
fi

"$START" "${START_ARGS[@]}" -- "${LABEL_ARGS[@]}"

for _ in 1 2 3 4 5 6 7 8 9 10 12 15 18 21 24 30; do
  if curl -fsS "http://127.0.0.1:${PORT}/ready" >/dev/null 2>&1; then
    echo "Ready:   http://127.0.0.1:${PORT}/ready"
    echo "MCP URL: http://127.0.0.1:${PORT}/mcp"
    echo "Pins:    docker inspect ${NAME} --format '{{json .Config.Labels}}'"
    echo "Cursor:  point the experiment MCP server at that URL (leave workflow-server on :3000)"
    exit 0
  fi
  sleep 1
done

die "sidecar started but http://127.0.0.1:${PORT}/ready did not become ready"
