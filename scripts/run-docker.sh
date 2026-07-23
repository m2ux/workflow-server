#!/usr/bin/env bash
# workflow-server — standalone GHCR runner (no repo checkout required)
#
# One file. Copy it anywhere, or:
#   curl -fsSL -o run-workflow-server.sh \
#     https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/run-docker.sh
#   chmod +x run-workflow-server.sh
#
# Minimal:
#   ./run-workflow-server.sh /path/to/worktrees /path/to/workflows
#
# With options:
#   ./run-workflow-server.sh /path/to/worktrees /path/to/workflows -d
#   ./run-workflow-server.sh --worktree-root=... --workflows-dir=... --detach
#
# Needs: docker, and pull access to ghcr.io/m2ux/workflow-server
#   (private package: docker login ghcr.io)
set -euo pipefail

# ---------------------------------------------------------------------------
# Defaults (override via flags or env; paths are the only required inputs)
# ---------------------------------------------------------------------------
DEFAULT_IMAGE_REPO="ghcr.io/m2ux/workflow-server"
DEFAULT_TAG="main"
DEFAULT_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
DEFAULT_CONTAINER_PORT="3000"
DEFAULT_WORKTREE_TARGET="/worktrees"
DEFAULT_WORKFLOWS_TARGET="/app/workflows"
DEFAULT_SCHEMAS_TARGET="/app/schemas"
DEFAULT_TRANSPORT="http"
DEFAULT_BIND_HOST="0.0.0.0"

IMAGE_REPO="${WORKFLOW_SERVER_IMAGE:-$DEFAULT_IMAGE_REPO}"
TAG="${WORKFLOW_SERVER_TAG:-$DEFAULT_TAG}"
IMAGE_REF="" # full ref from --image=repo:tag

NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_NAME}"
HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"
CONTAINER_PORT="${PORT:-$DEFAULT_CONTAINER_PORT}"

HOST_WORKTREE_ROOT="${HOST_WORKTREE_ROOT:-${WORKFLOW_WORKSPACE:-}}"
HOST_WORKFLOWS_DIR="${HOST_WORKFLOWS_DIR:-${WORKFLOW_DIR:-}}"
HOST_SCHEMAS_DIR="${HOST_SCHEMAS_DIR:-${SCHEMAS_DIR:-}}"

CONTAINER_WORKTREE_ROOT="${CONTAINER_WORKTREE_ROOT:-$DEFAULT_WORKTREE_TARGET}"
CONTAINER_WORKFLOW_DIR="${CONTAINER_WORKFLOW_DIR:-$DEFAULT_WORKFLOWS_TARGET}"
CONTAINER_SCHEMAS_DIR="${CONTAINER_SCHEMAS_DIR:-$DEFAULT_SCHEMAS_TARGET}"

PLANNING_SLUG="${PLANNING_SLUG:-}"
TRANSPORT="${TRANSPORT:-$DEFAULT_TRANSPORT}"
BIND_HOST="${HOST:-$DEFAULT_BIND_HOST}"

PULL=1
DETACH=0
RM=1
DRY_RUN=0
USER_SPEC="${DOCKER_USER:-$(id -u):$(id -g)}"
ENV_FILE=""
EXTRA_ENVS=()
DOCKER_ARGS=()
POSITIONAL=()

usage() {
  cat <<'EOF'
workflow-server standalone runner — pull GHCR image and run with host binds.

USAGE
  run-docker.sh <worktree-root> <workflows-dir> [schemas-dir] [options]
  run-docker.sh --worktree-root=PATH --workflows-dir=PATH [options]

REQUIRED (positional or flags; env aliases also work)
  worktree-root     Host directory bound RW  → /worktrees
                    env: HOST_WORKTREE_ROOT | WORKFLOW_WORKSPACE
  workflows-dir     Host directory bound RO  → /app/workflows
                    env: HOST_WORKFLOWS_DIR | WORKFLOW_DIR

OPTIONAL
  schemas-dir       Host directory bound RO  → /app/schemas
                    If omitted, schemas baked into the image are used.
                    env: HOST_SCHEMAS_DIR | SCHEMAS_DIR

  --image=REF       Full image (default: ghcr.io/m2ux/workflow-server:main)
  --tag=TAG         Tag for default repo (default: main)
  --host-port=N     Publish host port (default: 3000)
  --port=N          Container PORT env (default: 3000)
  --name=NAME       Container name (default: workflow-server)
  --planning-slug=S PLANNING_SLUG inside container
  --env KEY=VAL     Extra -e (repeatable)
  --env-file=PATH   docker --env-file
  --user=UID:GID    Container user (default: current uid:gid)
  --pull            Pull image first (default)
  --no-pull         Do not pull
  -d, --detach      Background
  --rm / --no-rm    Remove on exit (default: rm unless -d)
  --dry-run         Print docker commands only
  -h, --help

  Extra docker run flags after -- :
    run-docker.sh /work /wf -d -- --restart=unless-stopped

EXAMPLES
  # bare paths only
  ./run-docker.sh ~/projects/work ~/workflows -d

  # private GHCR
  docker login ghcr.io
  ./run-docker.sh /var/worktrees /opt/workflows --tag=v1.2.0 -d

  # curl install (after merge to main)
  curl -fsSL -o run-ws.sh \
    https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/run-docker.sh
  chmod +x run-ws.sh
  ./run-ws.sh /path/to/worktrees /path/to/workflows -d

MCP client URL after start:  http://127.0.0.1:<host-port>/mcp
EOF
}

die() { echo "error: $*" >&2; exit 1; }

abs_dir() {
  local p="$1"
  [[ -n "$p" ]] || return 1
  [[ -d "$p" ]] || die "not a directory: $p"
  if command -v realpath >/dev/null 2>&1; then
    realpath "$p"
  else
    (cd "$p" && pwd)
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --worktree-root=*) HOST_WORKTREE_ROOT="${1#*=}"; shift ;;
    --worktree-root) HOST_WORKTREE_ROOT="${2:?}"; shift 2 ;;
    --workflows-dir=*) HOST_WORKFLOWS_DIR="${1#*=}"; shift ;;
    --workflows-dir) HOST_WORKFLOWS_DIR="${2:?}"; shift 2 ;;
    --schemas-dir=*) HOST_SCHEMAS_DIR="${1#*=}"; shift ;;
    --schemas-dir) HOST_SCHEMAS_DIR="${2:?}"; shift 2 ;;
    --image=*) IMAGE_REF="${1#*=}"; shift ;;
    --image) IMAGE_REF="${2:?}"; shift 2 ;;
    --tag=*) TAG="${1#*=}"; shift ;;
    --tag) TAG="${2:?}"; shift 2 ;;
    --host-port=*) HOST_PORT="${1#*=}"; shift ;;
    --host-port) HOST_PORT="${2:?}"; shift 2 ;;
    --port=*) CONTAINER_PORT="${1#*=}"; shift ;;
    --port) CONTAINER_PORT="${2:?}"; shift 2 ;;
    --name=*) NAME="${1#*=}"; shift ;;
    --name) NAME="${2:?}"; shift 2 ;;
    --planning-slug=*) PLANNING_SLUG="${1#*=}"; shift ;;
    --planning-slug) PLANNING_SLUG="${2:?}"; shift 2 ;;
    --env=*) EXTRA_ENVS+=("${1#*=}"); shift ;;
    --env) EXTRA_ENVS+=("${2:?}"); shift 2 ;;
    --env-file=*) ENV_FILE="${1#*=}"; shift ;;
    --env-file) ENV_FILE="${2:?}"; shift 2 ;;
    --user=*) USER_SPEC="${1#*=}"; shift ;;
    --user) USER_SPEC="${2:?}"; shift 2 ;;
    --pull) PULL=1; shift ;;
    --no-pull) PULL=0; shift ;;
    --detach|-d) DETACH=1; RM=0; shift ;;
    --rm) RM=1; shift ;;
    --no-rm) RM=0; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --) shift; DOCKER_ARGS+=("$@"); break ;;
    -*)
      die "unknown option: $1 (see --help)"
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

# Positional: worktree workflows [schemas]
if [[ ${#POSITIONAL[@]} -ge 1 ]]; then
  HOST_WORKTREE_ROOT="${POSITIONAL[0]}"
fi
if [[ ${#POSITIONAL[@]} -ge 2 ]]; then
  HOST_WORKFLOWS_DIR="${POSITIONAL[1]}"
fi
if [[ ${#POSITIONAL[@]} -ge 3 ]]; then
  HOST_SCHEMAS_DIR="${POSITIONAL[2]}"
fi
if [[ ${#POSITIONAL[@]} -gt 3 ]]; then
  die "too many positional args (expected: worktree workflows [schemas])"
fi

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"

[[ -n "$HOST_WORKTREE_ROOT" ]] || die "required: worktree-root path (positional or --worktree-root=)"
[[ -n "$HOST_WORKFLOWS_DIR" ]] || die "required: workflows-dir path (positional or --workflows-dir=)"

HOST_WORKTREE_ROOT="$(abs_dir "$HOST_WORKTREE_ROOT")"
HOST_WORKFLOWS_DIR="$(abs_dir "$HOST_WORKFLOWS_DIR")"
if [[ -n "$HOST_SCHEMAS_DIR" ]]; then
  HOST_SCHEMAS_DIR="$(abs_dir "$HOST_SCHEMAS_DIR")"
fi

if [[ -n "$IMAGE_REF" ]]; then
  FULL_IMAGE="$IMAGE_REF"
else
  FULL_IMAGE="${IMAGE_REPO}:${TAG}"
fi

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf '+'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

if [[ "$PULL" -eq 1 ]]; then
  echo "Pulling ${FULL_IMAGE} ..."
  if ! run docker pull "$FULL_IMAGE"; then
    die "pull failed for ${FULL_IMAGE}
  If the package is private:  docker login ghcr.io
  If unpublished: build from a checkout or wait for CI publish."
  fi
fi

if [[ "$DRY_RUN" -eq 0 ]] && docker container inspect "$NAME" >/dev/null 2>&1; then
  echo "Removing existing container '${NAME}' ..."
  docker rm -f "$NAME" >/dev/null
elif [[ "$DRY_RUN" -eq 1 ]]; then
  echo "+ docker rm -f ${NAME}   # if exists"
fi

DOCKER_RUN=(docker run)
if [[ "$DETACH" -eq 1 ]]; then
  DOCKER_RUN+=(-d)
else
  DOCKER_RUN+=(-it)
fi
[[ "$RM" -eq 1 ]] && DOCKER_RUN+=(--rm)
DOCKER_RUN+=(--name "$NAME")
DOCKER_RUN+=(-p "${HOST_PORT}:${CONTAINER_PORT}")
[[ -n "$USER_SPEC" ]] && DOCKER_RUN+=(--user "$USER_SPEC")

DOCKER_RUN+=(-e "WORKTREE_ROOT=${CONTAINER_WORKTREE_ROOT}")
DOCKER_RUN+=(-e "WORKFLOW_DIR=${CONTAINER_WORKFLOW_DIR}")
DOCKER_RUN+=(-e "SCHEMAS_DIR=${CONTAINER_SCHEMAS_DIR}")
DOCKER_RUN+=(-e "TRANSPORT=${TRANSPORT}")
DOCKER_RUN+=(-e "HOST=${BIND_HOST}")
DOCKER_RUN+=(-e "PORT=${CONTAINER_PORT}")
[[ -n "$PLANNING_SLUG" ]] && DOCKER_RUN+=(-e "PLANNING_SLUG=${PLANNING_SLUG}")

for kv in "${EXTRA_ENVS[@]+"${EXTRA_ENVS[@]}"}"; do
  [[ "$kv" == *=* ]] || die "--env expects KEY=VAL, got: $kv"
  DOCKER_RUN+=(-e "$kv")
done

if [[ -n "$ENV_FILE" ]]; then
  [[ -f "$ENV_FILE" ]] || die "env file not found: $ENV_FILE"
  DOCKER_RUN+=(--env-file "$ENV_FILE")
fi

DOCKER_RUN+=(-v "${HOST_WORKTREE_ROOT}:${CONTAINER_WORKTREE_ROOT}")
DOCKER_RUN+=(-v "${HOST_WORKFLOWS_DIR}:${CONTAINER_WORKFLOW_DIR}:ro")
if [[ -n "$HOST_SCHEMAS_DIR" ]]; then
  DOCKER_RUN+=(-v "${HOST_SCHEMAS_DIR}:${CONTAINER_SCHEMAS_DIR}:ro")
fi

DOCKER_RUN+=("${DOCKER_ARGS[@]+"${DOCKER_ARGS[@]}"}")
DOCKER_RUN+=("$FULL_IMAGE")

echo "Starting ${FULL_IMAGE}"
echo "  worktree : ${HOST_WORKTREE_ROOT} → ${CONTAINER_WORKTREE_ROOT} (rw)"
echo "  workflows: ${HOST_WORKFLOWS_DIR} → ${CONTAINER_WORKFLOW_DIR} (ro)"
if [[ -n "$HOST_SCHEMAS_DIR" ]]; then
  echo "  schemas  : ${HOST_SCHEMAS_DIR} → ${CONTAINER_SCHEMAS_DIR} (ro)"
else
  echo "  schemas  : (image default at ${CONTAINER_SCHEMAS_DIR})"
fi
echo "  publish  : ${HOST_PORT} → ${CONTAINER_PORT}"
echo "  MCP URL  : http://127.0.0.1:${HOST_PORT}/mcp"

run "${DOCKER_RUN[@]}"

if [[ "$DETACH" -eq 1 && "$DRY_RUN" -eq 0 ]]; then
  echo "Detached as '${NAME}'. Logs: docker logs -f ${NAME}"
  echo "Health:  curl -fsS http://127.0.0.1:${HOST_PORT}/health"
  echo "Ready:   curl -fsS http://127.0.0.1:${HOST_PORT}/ready"
fi
