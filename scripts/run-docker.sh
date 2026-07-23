#!/usr/bin/env bash
# Pull the published workflow-server image from GHCR and run it with host binds.
#
# Required (flags or env):
#   --worktree-root / HOST_WORKTREE_ROOT   host dir bound RW as the worktree root
#   --workflows-dir / HOST_WORKFLOWS_DIR   host dir of workflow definitions (RO)
#
# Optional:
#   --schemas-dir     host schemas dir (RO); omit to use schemas baked into the image
#   --image / --tag   image ref (default ghcr.io/m2ux/workflow-server:main)
#   --host-port       published host port (default 3000)
#   --name            container name (default workflow-server)
#   --env KEY=VAL     extra -e for the container (repeatable)
#   --env-file PATH   docker --env-file (in addition to script-set vars)
#   --pull / --no-pull
#   --detach / -d     run in background
#   --rm              remove container on exit (default on when not --detach)
#   --user UID:GID    run as user (default: current host uid:gid)
#   --dry-run         print docker commands only
#
# Examples:
#   ./scripts/run-docker.sh \
#     --worktree-root=/home/mike1/projects/work \
#     --workflows-dir=/home/mike1/projects/main/workflow-server/workflows
#
#   HOST_WORKTREE_ROOT=... HOST_WORKFLOWS_DIR=... ./scripts/run-docker.sh --detach
set -euo pipefail

DEFAULT_IMAGE="ghcr.io/m2ux/workflow-server"
DEFAULT_TAG="main"
DEFAULT_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
DEFAULT_CONTAINER_PORT="3000"
DEFAULT_WORKTREE_TARGET="/worktrees"
DEFAULT_WORKFLOWS_TARGET="/app/workflows"
DEFAULT_SCHEMAS_TARGET="/app/schemas"

IMAGE="${WORKFLOW_SERVER_IMAGE:-$DEFAULT_IMAGE}"
TAG="${WORKFLOW_SERVER_TAG:-$DEFAULT_TAG}"
# Full ref overrides image+tag when set via --image=repo:tag
IMAGE_REF=""

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
TRANSPORT="${TRANSPORT:-http}"
BIND_HOST="${HOST:-0.0.0.0}"

PULL=1
DETACH=0
RM=1
DRY_RUN=0
USER_SPEC="${DOCKER_USER:-$(id -u):$(id -g)}"
ENV_FILE=""
EXTRA_ENVS=()
DOCKER_ARGS=()

usage() {
  cat <<'EOF'
Usage: run-docker.sh --worktree-root=PATH --workflows-dir=PATH [options]

Required:
  --worktree-root=PATH   Host worktree root (RW bind → CONTAINER_WORKTREE_ROOT)
  --workflows-dir=PATH   Host workflows directory (RO bind → CONTAINER_WORKFLOW_DIR)

  Env aliases: HOST_WORKTREE_ROOT / WORKFLOW_WORKSPACE,
               HOST_WORKFLOWS_DIR / WORKFLOW_DIR

Options:
  --schemas-dir=PATH     Host schemas directory (RO). If omitted, image schemas are used.
  --image=REF            Full image ref (e.g. ghcr.io/m2ux/workflow-server:main)
  --tag=TAG              Tag when using default image repo (default: main)
  --host-port=N          Host port (default: 3000)
  --port=N               In-container listen port / PORT env (default: 3000)
  --name=NAME            Container name (default: workflow-server)
  --planning-slug=PATH   PLANNING_SLUG inside the container
  --env KEY=VAL          Extra container env (repeatable)
  --env-file=PATH        Passed to docker run --env-file
  --user=UID:GID         Container user (default: current uid:gid)
  --pull                 docker pull before run (default)
  --no-pull              Skip pull
  --detach, -d           Run detached
  --rm / --no-rm         Remove container on exit (default: rm unless -d)
  --dry-run              Print commands only
  -h, --help             Show help

Also accepts passthrough docker flags after -- :
  ./scripts/run-docker.sh --worktree-root=... --workflows-dir=... -- --network=host
EOF
}

die() { echo "error: $*" >&2; exit 1; }

abs_dir() {
  local p="$1"
  [[ -n "$p" ]] || return 1
  [[ -d "$p" ]] || die "not a directory: $p"
  # realpath if available; else cd
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
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"

[[ -n "$HOST_WORKTREE_ROOT" ]] || die "required: --worktree-root=PATH (or HOST_WORKTREE_ROOT / WORKFLOW_WORKSPACE)"
[[ -n "$HOST_WORKFLOWS_DIR" ]] || die "required: --workflows-dir=PATH (or HOST_WORKFLOWS_DIR / WORKFLOW_DIR)"

HOST_WORKTREE_ROOT="$(abs_dir "$HOST_WORKTREE_ROOT")"
HOST_WORKFLOWS_DIR="$(abs_dir "$HOST_WORKFLOWS_DIR")"
if [[ -n "$HOST_SCHEMAS_DIR" ]]; then
  HOST_SCHEMAS_DIR="$(abs_dir "$HOST_SCHEMAS_DIR")"
fi

if [[ -n "$IMAGE_REF" ]]; then
  FULL_IMAGE="$IMAGE_REF"
else
  FULL_IMAGE="${IMAGE}:${TAG}"
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
  run docker pull "$FULL_IMAGE"
fi

# Replace existing container with the same name when re-running.
if [[ "$DRY_RUN" -eq 0 ]] && docker container inspect "$NAME" >/dev/null 2>&1; then
  echo "Removing existing container '${NAME}' ..."
  docker rm -f "$NAME" >/dev/null
elif [[ "$DRY_RUN" -eq 1 ]]; then
  echo "+ docker rm -f ${NAME}   # if exists"
fi

DOCKER_RUN=(docker run)
[[ "$DETACH" -eq 1 ]] && DOCKER_RUN+=(-d) || DOCKER_RUN+=(-it)
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
