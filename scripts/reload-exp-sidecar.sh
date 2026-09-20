#!/usr/bin/env bash
# Reload an experiment HTTP sidecar on a stable host port.
#
# Stops one named container, compiles the engine checkout on the host when that
# install matches the lockfile, rebuilds the image only when package.json,
# package-lock.json or the Dockerfile drifted (or --rebuild-image), and starts
# it again on the same host port and corpus with dist and schemas bound from the
# engine checkout. Refuses the install instance name `workflow-server` and host
# port 3000.
#
# Host port and corpus default to what the named container records, running or
# exited, so a reload of the pairing under test is `--name` alone.
set -euo pipefail

INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die() { echo "error: $*" >&2; exit 1; }

usage() {
  cat <<EOF
Reload an experiment HTTP sidecar on a stable host port.

Stops the named container, compiles the engine checkout on the host when that
install matches the lockfile, and starts it again on the same host port and
corpus with a dist bind of that compile and a schemas bind of the engine
checkout. The image rebuilds when package.json, package-lock.json or the
Dockerfile drifted (lockfile-triggered image rebuild), or when --rebuild-image
is passed. Refuses the install instance name workflow-server and host port 3000.

  scripts/reload-exp-sidecar.sh --name=NAME [options]
  scripts/reload-exp-sidecar.sh --name=NAME --workflows-dir=CORPUS [options]

Required:
  --name=NAME              Container name (not workflow-server).

Options:
  --workflows-dir=CORPUS   Corpus checkout (directory that contains corpus/).
                           Defaults to the corpus the named container binds,
                           running or exited. Required when none exists.
  --projects-root=DIR      Host projects root bound RW. Defaults to the root
                           the named container binds, then to the install
                           root. Planning lands at DIR/<repo>/.engineering/
                           artifacts/planning, so a root of its own keeps an
                           experiment's walks out of the live planning tree.
  --image=IMAGE            Image tag (default: workflow-server:local).
  --build[=DIR]            Engine checkout (default: this repo root). DIR is a
                           worktree for a branch that is not this checkout.
                           Host compile and image rebuilds use this tree; its
                           start.sh/stop.sh run the container, so a branch
                           changing the server and the launcher together is
                           exercised as a pair; --no-build uses the installed
                           copies. When that start.sh does not accept
                           --dist-dir, this script's start.sh is used so a
                           host compile still binds.
  --host-port=N            Host port. Defaults to the binding the named
                           container records, running or exited. Required when
                           none exists.
  --log-dir=DIR            Where the outgoing container's log is kept
                           (default: INSTALL/logs). One file per reload,
                           holding the audit line the server writes per tool
                           call for the run being replaced.
  --rebuild-image          Rebuild the image even when inputs-sha matches.
                           Skips host compile and serves the image-baked dist.
  --no-build               Reuse --image; do not compile on the host and do
                           not rebuild the image. Recreates the container.
                           Dist and schemas binds are inherited from the
                           named container when it has them.
  --no-preflight           Skip the corpus check. It runs the guards that
                           decide whether a server can serve the definitions —
                           they load, resolve and parse — and not those that
                           measure the corpus this repo ships, which a corpus
                           written for one construct never satisfies. It runs
                           before the container stops, so a refusal leaves the
                           sidecar up.

Environment (overridden by flags):
  EXP_NAME  EXP_IMAGE  EXP_CORPUS  EXP_ENGINE  EXP_HOST_PORT
  EXP_PROJECTS_ROOT  EXP_LOG_DIR
  WORKFLOW_SERVER_START  WORKFLOW_SERVER_STOP

Container-side paths, shared with start.sh so a lookup matches what it binds:
  PORT  CONTAINER_INSTALL_DIR  CONTAINER_WORKFLOW_DIR  CONTAINER_PROJECTS_ROOT
  CONTAINER_SCHEMAS_DIR  CONTAINER_DIST_DIR

Example — name a pairing once, then reload it by name:

  scripts/reload-exp-sidecar.sh \\
    --name=workflow-server-exp \\
    --image=workflow-server:exp-ttd \\
    --build=.worktrees/feat/time-to-dispatch-experiment \\
    --workflows-dir=.worktrees/feat/time-to-dispatch-meta \\
    --host-port=32772

  scripts/reload-exp-sidecar.sh --name=workflow-server-exp --image=workflow-server:exp-ttd
EOF
}

# Where start.sh puts things inside the container, read from the variables start.sh reads and
# derived the way start.sh derives them. A lookup keyed on anything else finds nothing the moment an
# operator moves one of them, and reports it as a container that binds or publishes nothing.
CONTAINER_INSTALL_DIR="${CONTAINER_INSTALL_DIR:-/var/lib/workflow-server}"
CONTAINER_WORKFLOW_DIR="${CONTAINER_WORKFLOW_DIR:-/app/workflows}"
CONTAINER_PROJECTS_ROOT="${CONTAINER_PROJECTS_ROOT:-${CONTAINER_INSTALL_DIR}/projects}"
CONTAINER_SCHEMAS_DIR="${CONTAINER_SCHEMAS_DIR:-/app/schemas}"
CONTAINER_DIST_DIR="${CONTAINER_DIST_DIR:-/app/dist}"
CONTAINER_PORT="${PORT:-3000}"
IMAGE_INPUTS_LABEL="workflow-server.inputs-sha"

NAME="${EXP_NAME:-}"
IMAGE="${EXP_IMAGE:-workflow-server:local}"
CORPUS="${EXP_CORPUS:-}"
ENGINE="${EXP_ENGINE:-}"
PROJECTS="${EXP_PROJECTS_ROOT:-}"
PORT="${EXP_HOST_PORT:-}"
LOG_DIR="${EXP_LOG_DIR:-${INSTALL_DIR}/logs}"
BUILD=1
REBUILD_IMAGE=0
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
    --rebuild-image) REBUILD_IMAGE=1; shift ;;
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

[[ "$BUILD" -eq 1 || "$REBUILD_IMAGE" -eq 0 ]] \
  || die "--no-build and --rebuild-image cannot be combined"

# An explicit override, else the preferred copy when it is executable, else the other one. Which
# copy is preferred depends on where the image came from; see the START/STOP resolution below.
resolve_helper() {
  local override="$1" preferred="$2" fallback="$3"
  if [[ -n "$override" ]]; then
    printf '%s\n' "$override"
    return
  fi
  if [[ -x "$preferred" ]]; then
    printf '%s\n' "$preferred"
    return
  fi
  printf '%s\n' "$fallback"
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
    echo "  log      : ${file}"
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

# Hash of the files that determine the image's node_modules and Dockerfile. Src edits sit outside
# this hash so a host compile plus dist bind covers them without a docker build.
inputs_sha() {
  local dir="$1"
  (cd "$dir" && cat package.json package-lock.json Dockerfile) | sha256sum | awk '{print $1}'
}

image_exists() {
  docker image inspect "$IMAGE" >/dev/null 2>&1
}

image_inputs_sha() {
  docker image inspect "$IMAGE" \
    --format "{{index .Config.Labels \"${IMAGE_INPUTS_LABEL}\"}}" \
    2>/dev/null || true
}

# Whether the node_modules that host tsc would load were installed from this checkout's lockfile.
# Nested worktrees often symlink node_modules to the primary checkout; a drifted lockfile there
# would emit JS against the wrong types while the image carries a different runtime graph.
host_lockfile_matches_install() {
  local engine="$1"
  local lock="${engine}/package-lock.json"
  [[ -f "$lock" ]] || return 1
  local nm="${engine}/node_modules"
  local install_root=""
  if [[ -L "$nm" ]]; then
    local target
    target="$(readlink -f "$nm" 2>/dev/null || true)"
    [[ -n "$target" && -d "$target" ]] || return 1
    install_root="$(dirname "$target")"
  elif [[ -d "$nm" ]]; then
    install_root="$engine"
  else
    return 1
  fi
  cmp -s "$lock" "${install_root}/package-lock.json"
}

accepts_dist_dir() {
  local script="$1"
  [[ -n "$script" && -x "$script" ]] && grep -q -- '--dist-dir' "$script"
}

# A dist bind needs a launcher that accepts --dist-dir. The engine checkout under test
# often predates the flag. This reload script's sibling start.sh is the copy that added it.
pick_start_for_dist_bind() {
  [[ -n "$BIND_DIST" ]] || return 0
  if accepts_dist_dir "$START"; then
    return 0
  fi
  local sibling="${SCRIPT_DIR}/start.sh"
  if accepts_dist_dir "$sibling"; then
    START="$sibling"
    return 0
  fi
  echo "warning: start.sh does not accept --dist-dir; serving the image-baked dist" >&2
  BIND_DIST=""
}

require_dist_index() {
  local dir="$1"
  [[ -n "$dir" && -f "${dir}/index.js" ]] || return 1
  return 0
}

compile_engine() {
  local engine="$1"
  echo "Compiling ${engine}"
  # Wipe dist so incremental tsc cannot leave a deleted module on the bind.
  rm -rf "${engine}/dist"
  if ! (cd "$engine" && npm run build); then
    die "host compile failed at ${engine}.
  Nothing has been stopped. Fix the TypeScript. To skip host compile and bake
  dist into the image, pass --rebuild-image."
  fi
  require_dist_index "${engine}/dist" \
    || die "host compile at ${engine} produced no dist/index.js.
  Nothing has been stopped."
}

rebuild_image() {
  local engine="$1" sha="$2"
  [[ -f "${engine}/Dockerfile" ]] || die "no Dockerfile in engine checkout: ${engine}"
  echo "Building ${IMAGE} from ${engine}"
  docker build -t "$IMAGE" --label "${IMAGE_INPUTS_LABEL}=${sha}" "$engine"
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
# with a fresh compile is `--name` alone and the pairing under test survives the reload by default.
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

# An image and the script that launches it are one pair. An engine cycle takes both from the
# checkout it compiles, so a branch changing the server and the launcher together is exercised as
# a whole — the launcher passes what that server reads, including --dist-dir. Taking the launcher
# from the install instead pairs a branch's image with a release's script, and a variable the
# branch added simply never arrives, which the server cannot distinguish from an operator not
# setting it. A --no-build run reuses an image this checkout did not produce, so there the
# installed copies are the better default. Either way `WORKFLOW_SERVER_START` / `_STOP` win, and
# a checkout's start.sh still reads the install env, so the operator's paths and signing key
# follow it.
if [[ "$BUILD" -eq 1 ]]; then
  START="$(resolve_helper "${WORKFLOW_SERVER_START:-}" "${ENGINE}/scripts/start.sh" "${INSTALL_DIR}/start.sh")"
  STOP="$(resolve_helper "${WORKFLOW_SERVER_STOP:-}" "${ENGINE}/scripts/stop.sh" "${INSTALL_DIR}/stop.sh")"
else
  START="$(resolve_helper "${WORKFLOW_SERVER_START:-}" "${INSTALL_DIR}/start.sh" "${ENGINE}/scripts/start.sh")"
  STOP="$(resolve_helper "${WORKFLOW_SERVER_STOP:-}" "${INSTALL_DIR}/stop.sh" "${ENGINE}/scripts/stop.sh")"
fi

[[ -x "$START" ]] || die "start.sh not found or not executable: ${START}"
[[ -x "$STOP" ]] || die "stop.sh not found or not executable: ${STOP}"

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"
command -v curl >/dev/null 2>&1 || die "curl not found on PATH"

# Hold the corpus to the guards that decide whether a server can serve it — the definitions load,
# resolve and parse — and to nothing else. Both refusals then mean one thing: this corpus will not
# serve, so an agent walking it meets the failure several minutes in.
#
# The convention guards are excluded because they measure the corpus this repository ships. Pointed
# at a corpus authored to exercise one construct they find no bootstrap protocol and no harness map,
# report that they inspected nothing, and that verdict is true of every such corpus while saying
# nothing about whether it serves. Gating on them refused the case this script exists for, which
# made --no-preflight the ordinary way to run rather than the exception, and a gate everyone skips
# reports nothing on the run where it would have mattered.
#
# The sweep runs before anything is stopped, so a refusal leaves the container it was aimed at
# exactly as it found it.
preflight_corpus() {
  if [[ ! -f "${ENGINE}/guards/check-all.ts" ]]; then
    echo "note: no guard suite under ${ENGINE}; skipping corpus preflight" >&2
    return 0
  fi
  if ! (cd "$ENGINE" && npx tsx --version >/dev/null 2>&1); then
    echo "note: tsx does not resolve from ${ENGINE}; skipping corpus preflight" >&2
    return 0
  fi

  # The sweep's exit code is the reading, so the run sits in a condition where a non-zero status is
  # an answer rather than a failure. Toggling `set -e` around it would answer the same question by
  # turning the shell's own guarantee off and on again.
  local out status
  if out="$(cd "$ENGINE" && npx tsx guards/check-all.ts --root "$CORPUS" --serving-only 2>&1)"; then
    status=0
  else
    status=$?
  fi

  case "$status" in
    0)
      echo "Preflight: definitions load, resolve and parse"
      ;;
    1)
      printf '%s\n' "$out" | grep -E '^[[:space:]]*\[(FAIL|UNMEASURED)\]|guard\(s\) in' >&2 || true
      die "definitions at ${CORPUS} do not load (serving guards report findings).
  An agent walking them meets the same failure several minutes in, so nothing
  has been stopped. Run the sweep for the detail:
    npx tsx guards/check-all.ts --root ${CORPUS} --serving-only --verbose
  Pass --no-preflight to start on them regardless."
      ;;
    *)
      printf '%s\n' "$out" | tail -n 20 >&2
      die "corpus at ${CORPUS} could not be measured (guard sweep exit ${status}).
  Nothing there is servable, and nothing has been stopped.
  Pass --no-preflight to start on it regardless."
      ;;
  esac
}

if [[ "$PREFLIGHT" -eq 1 ]]; then
  preflight_corpus
fi

BIND_DIST=""
BIND_SCHEMAS=""
NEED_IMAGE=0
HOST_COMPILE=0
INPUTS=""

if [[ "$BUILD" -eq 1 ]]; then
  [[ -f "${ENGINE}/package.json" && -f "${ENGINE}/package-lock.json" && -f "${ENGINE}/Dockerfile" ]] \
    || die "engine checkout is missing package.json, package-lock.json or Dockerfile: ${ENGINE}"
  INPUTS="$(inputs_sha "$ENGINE")"
  if [[ "$REBUILD_IMAGE" -eq 1 ]]; then
    NEED_IMAGE=1
  elif ! image_exists; then
    NEED_IMAGE=1
  elif [[ "$(image_inputs_sha)" != "$INPUTS" ]]; then
    NEED_IMAGE=1
  fi

  if [[ "$REBUILD_IMAGE" -eq 1 ]]; then
    NEED_IMAGE=1
    echo "note: --rebuild-image skips host compile; serving the image-baked dist" >&2
  elif host_lockfile_matches_install "$ENGINE"; then
    HOST_COMPILE=1
    BIND_DIST="${ENGINE}/dist"
  else
    NEED_IMAGE=1
    echo "note: node_modules under ${ENGINE} were not installed from this lockfile.
  Serving the image-baked dist this run. Run 'npm ci' in the engine checkout
  (or provision the worktree) to restore host compile and the dist bind." >&2
  fi

  if [[ -d "${ENGINE}/schemas" ]]; then
    BIND_SCHEMAS="${ENGINE}/schemas"
  fi

  if [[ "$HOST_COMPILE" -eq 1 ]]; then
    compile_engine "$ENGINE"
  fi
  if [[ "$NEED_IMAGE" -eq 1 ]]; then
    rebuild_image "$ENGINE" "$INPUTS"
  fi
else
  BIND_DIST="$(container_bind_source "$NAME" "$CONTAINER_DIST_DIR")"
  BIND_SCHEMAS="$(container_bind_source "$NAME" "$CONTAINER_SCHEMAS_DIR")"
  if [[ -n "$BIND_DIST" ]] && ! require_dist_index "$BIND_DIST"; then
    echo "warning: inherited dist bind ${BIND_DIST} has no index.js; serving the image-baked dist" >&2
    BIND_DIST=""
  fi
fi

pick_start_for_dist_bind

# An engine pin is taken only where it is claimed — a --no-build run reuses an image built
# elsewhere, and pinning the checkout this run happens to sit in would name a tree that compiled
# nothing.
ENGINE_PIN=""
if [[ "$BUILD" -eq 1 ]]; then
  ENGINE_PIN="$(git_pin "$ENGINE")"
fi
CORPUS_PIN="$(git_pin "$CORPUS")"

echo "Reloading ${NAME} on 127.0.0.1:${PORT}"
# The engine line is printed on the terms the labels are stamped on: an engine cycle claims the
# checkout it compiled from, a reused image names the tag and leaves the checkout unclaimed.
if [[ "$BUILD" -eq 1 ]]; then
  echo "  engine   : ${ENGINE} @ ${ENGINE_PIN}"
  if [[ "$HOST_COMPILE" -eq 1 ]]; then
    echo "  compile  : host tsc"
  else
    echo "  compile  : image dist"
  fi
  if [[ "$NEED_IMAGE" -eq 1 ]]; then
    echo "  image    : rebuilt ${IMAGE}"
  else
    echo "  image    : reuse ${IMAGE}"
  fi
else
  echo "  engine   : whatever built ${IMAGE}"
  echo "  image    : ${IMAGE}"
fi
echo "  corpus   : ${CORPUS} @ ${CORPUS_PIN}"
# The launcher passes the environment the served image reads, so which copy ran is part of what
# this reload is. A mismatch is otherwise visible only as a variable that never arrives.
echo "  launcher : ${START}"
if [[ -n "$PROJECTS" ]]; then
  echo "  projects : ${PROJECTS}"
fi
if [[ -n "$BIND_DIST" ]]; then
  echo "  dist     : ${BIND_DIST}"
fi
if [[ -n "$BIND_SCHEMAS" ]]; then
  echo "  schemas  : ${BIND_SCHEMAS}"
fi

capture_log
"$STOP" --name="$NAME" || true

START_ARGS=(
  -d
  --name="$NAME"
  --image="$IMAGE"
  --host-port="$PORT"
  --no-update-workflows
  --no-pull
  --workflows-dir="$CORPUS"
)
if [[ -n "$PROJECTS" ]]; then
  START_ARGS+=(--projects-root="$PROJECTS")
fi
if [[ -n "$BIND_DIST" ]]; then
  START_ARGS+=(--dist-dir="$BIND_DIST")
fi
if [[ -n "$BIND_SCHEMAS" ]]; then
  START_ARGS+=(--schemas-dir="$BIND_SCHEMAS")
fi

# Provenance the container carries itself, so a walk record cites one `docker inspect` rather than
# a pin typed from memory. The engine pair is present when this reload compiled that checkout; a
# reused image was built from a checkout this run knows nothing about, and stays unclaimed.
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

for _ in $(seq 1 80); do
  if curl -fsS "http://127.0.0.1:${PORT}/ready" >/dev/null 2>&1; then
    echo "Ready:   http://127.0.0.1:${PORT}/ready"
    echo "MCP URL: http://127.0.0.1:${PORT}/mcp"
    echo "Pins:    docker inspect ${NAME} --format '{{json .Config.Labels}}'"
    echo "Cursor:  point the experiment MCP server at that URL (leave workflow-server on :3000)"
    exit 0
  fi
  sleep 0.2
done

# The probe answers which check is holding the container back, and the poll above discards that
# answer because it gates on the status code. Ask once more without the gate, so the failure names
# the false check — a corpus bind that resolves to nothing looks exactly like a container still
# booting until the payload is read.
echo "Last probe of http://127.0.0.1:${PORT}/ready:" >&2
curl -sS "http://127.0.0.1:${PORT}/ready" >&2 || echo "  (no response)" >&2
echo >&2
echo "Container log: docker logs ${NAME}" >&2
die "sidecar started but http://127.0.0.1:${PORT}/ready did not become ready"
