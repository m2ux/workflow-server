#!/usr/bin/env bash
# workflow-server — standalone GHCR runner (no repo checkout required)
#
# Install once (writes $INSTALL/env with paths):
#   curl -fsSL …/install.sh | bash
#   bash <(curl -fsSL …/install.sh) --worktree-root=~/projects/work
#
# Then start / stop with no path args:
#   ~/.local/share/workflow-server/start.sh -d
#   ~/.local/share/workflow-server/stop.sh
#
# start.sh loads $INSTALL/env automatically (or the env next to this script).
# CLI path flags remain as one-off overrides only.
#
# Needs: docker (public image: ghcr.io/m2ux/workflow-server)
set -euo pipefail

DEFAULT_IMAGE_REPO="ghcr.io/m2ux/workflow-server"
DEFAULT_TAG="main"
DEFAULT_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
DEFAULT_CONTAINER_PORT="3000"
# Inside the container the install root is fixed so --repo=owner/repo resolves to
# $CONTAINER_INSTALL/{workspace,engineering}/owner/repo matching the host layout.
DEFAULT_CONTAINER_INSTALL="/var/lib/workflow-server"
DEFAULT_WORKTREE_TARGET="${DEFAULT_CONTAINER_INSTALL}/workspace"
DEFAULT_ENGINEERING_TARGET="${DEFAULT_CONTAINER_INSTALL}/engineering"
DEFAULT_WORKFLOWS_TARGET="/app/workflows"
DEFAULT_SCHEMAS_TARGET="/app/schemas"
DEFAULT_TRANSPORT="http"
DEFAULT_BIND_HOST="0.0.0.0"
DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_HOST_WORKTREE_ROOT="${DEFAULT_INSTALL_DIR}/workspace"
DEFAULT_HOST_ENGINEERING_ROOT="${DEFAULT_INSTALL_DIR}/engineering"
DEFAULT_ENV_NAME="env"

# Directory containing this script (install dir when installed as start.sh).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load install-time env before reading defaults from the process environment.
# Precedence later: CLI flag > process env > install env > built-in default.
load_install_env() {
  local f
  for f in \
    "${WORKFLOW_SERVER_ENV_FILE:-}" \
    "${SCRIPT_DIR}/${DEFAULT_ENV_NAME}" \
    "${DEFAULT_INSTALL_DIR}/${DEFAULT_ENV_NAME}"
  do
    [[ -n "$f" && -f "$f" ]] || continue
    # shellcheck disable=SC1090
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
    LOADED_ENV_FILE="$f"
    return 0
  done
  return 0
}

LOADED_ENV_FILE=""
load_install_env

IMAGE_REPO="${WORKFLOW_SERVER_IMAGE:-$DEFAULT_IMAGE_REPO}"
TAG="${WORKFLOW_SERVER_TAG:-$DEFAULT_TAG}"
IMAGE_REF=""
NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_NAME}"
HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"
CONTAINER_PORT="${PORT:-$DEFAULT_CONTAINER_PORT}"

INSTALL_DIR=""
INSTALL_DIR_SET=0
# Values from install env / process env (do not blank after source).
# Canonical install keys: HOST_WORKTREE_ROOT, HOST_ENGINEERING_ROOT, HOST_PORT,
# WORKFLOW_SERVER_CONTAINER_NAME
# Optional overrides: HOST_WORKFLOWS_DIR, HOST_SCHEMAS_DIR, WORKFLOW_SERVER_INSTALL_DIR
# Legacy aliases still accepted: WORKFLOW_WORKSPACE, WORKFLOW_DIR, SCHEMAS_DIR,
# WORKFLOW_SERVER_ENGINEERING_DIR
HOST_WORKTREE_ROOT="${HOST_WORKTREE_ROOT:-${WORKFLOW_WORKSPACE:-}}"
HOST_ENGINEERING_ROOT="${HOST_ENGINEERING_ROOT:-${WORKFLOW_SERVER_ENGINEERING_DIR:-}}"
HOST_WORKFLOWS_DIR="${HOST_WORKFLOWS_DIR:-${WORKFLOW_DIR:-}}"
HOST_SCHEMAS_DIR="${HOST_SCHEMAS_DIR:-${SCHEMAS_DIR:-}}"
WORKTREE_SET=0
ENGINEERING_SET=0
WORKFLOWS_SET=0
SCHEMAS_SET=0

CONTAINER_INSTALL_DIR="${CONTAINER_INSTALL_DIR:-$DEFAULT_CONTAINER_INSTALL}"
CONTAINER_WORKTREE_ROOT="${CONTAINER_WORKTREE_ROOT:-${CONTAINER_INSTALL_DIR}/workspace}"
CONTAINER_ENGINEERING_ROOT="${CONTAINER_ENGINEERING_ROOT:-${CONTAINER_INSTALL_DIR}/engineering}"
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
  cat <<EOF
workflow-server start — pull GHCR image and run with host binds.

USAGE
  start.sh -d
  start.sh [options]

Paths normally come from install-time \$INSTALL/env (written by install.sh).
After install you only need:  start.sh -d

DEFAULT INSTALL DIR
  ${DEFAULT_INSTALL_DIR}
  (or directory containing this script when installed as start.sh)

DEFAULT WORKSPACE ROOT
  ${DEFAULT_HOST_WORKTREE_ROOT}  (set at install with --worktree-root; persisted in env)

DEFAULT ENGINEERING ROOT
  ${DEFAULT_HOST_ENGINEERING_ROOT}  (set at install with --engineering-root; persisted in env)

OPTIONS (optional overrides — prefer re-running install to change paths)
  --install-dir=PATH        Install root (workflows under \$INSTALL/workflows)
  --worktree-root=PATH      One-off host workspace / worktree root (RW)
  --engineering-root=PATH   One-off host engineering root (RW)
  --workflows-dir=PATH      One-off host workflows directory (RO)
  --schemas-dir=PATH        Host schemas directory (RO); optional
  --image=REF               Full image (default: ${DEFAULT_IMAGE_REPO}:${DEFAULT_TAG})
  --tag=TAG                 Tag for default repo (default: ${DEFAULT_TAG})
  --host-port=N             Host port (default: ${DEFAULT_HOST_PORT})
  --port=N                  Container PORT (default: ${DEFAULT_CONTAINER_PORT})
  --name=NAME               Container name (default: ${DEFAULT_NAME})
  --planning-slug=S         PLANNING_SLUG inside container
  --env KEY=VAL             Extra -e (repeatable)
  --env-file=PATH           docker --env-file
  --user=UID:GID            Container user (default: current uid:gid)
  --pull / --no-pull        Pull image first (default: pull)
  -d, --detach              Background
  --rm / --no-rm            Remove on exit (default: rm unless -d)
  --dry-run                 Print docker commands only
  -h, --help

  Extra docker flags after -- :
    start.sh -d -- --restart=unless-stopped

EXAMPLES
  curl -fsSL …/install.sh | bash
  bash <(curl -fsSL …/install.sh) --worktree-root=~/projects/work
  ~/.local/share/workflow-server/start.sh -d
  ~/.local/share/workflow-server/stop.sh
  ~/.local/share/workflow-server/init-repo.sh owner/repo

MCP URL: http://127.0.0.1:<host-port>/mcp
EOF
}

die() { echo "error: $*" >&2; exit 1; }

abs_path() {
  local p="$1"
  [[ -n "$p" ]] || return 1
  [[ "$p" == ~* ]] && p="${p/#\~/$HOME}"
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$p" 2>/dev/null || realpath "$p"
  elif [[ -d "$p" ]]; then
    (cd "$p" && pwd)
  else
    local parent base
    parent="$(cd "$(dirname "$p")" && pwd)"
    base="$(basename "$p")"
    printf '%s/%s\n' "$parent" "$base"
  fi
}

abs_dir() {
  local p
  p="$(abs_path "$1")"
  [[ -d "$p" ]] || die "not a directory: $p"
  printf '%s\n' "$p"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --install-dir=*) INSTALL_DIR="${1#*=}"; INSTALL_DIR_SET=1; shift ;;
    --install-dir) INSTALL_DIR="${2:?}"; INSTALL_DIR_SET=1; shift 2 ;;
    --data-dir=*) INSTALL_DIR="${1#*=}"; INSTALL_DIR_SET=1; shift ;;
    --data-dir) INSTALL_DIR="${2:?}"; INSTALL_DIR_SET=1; shift 2 ;;
    --worktree-root=*) HOST_WORKTREE_ROOT="${1#*=}"; WORKTREE_SET=1; shift ;;
    --worktree-root) HOST_WORKTREE_ROOT="${2:?}"; WORKTREE_SET=1; shift 2 ;;
    --engineering-root=*) HOST_ENGINEERING_ROOT="${1#*=}"; ENGINEERING_SET=1; shift ;;
    --engineering-root) HOST_ENGINEERING_ROOT="${2:?}"; ENGINEERING_SET=1; shift 2 ;;
    --workflows-dir=*) HOST_WORKFLOWS_DIR="${1#*=}"; WORKFLOWS_SET=1; shift ;;
    --workflows-dir) HOST_WORKFLOWS_DIR="${2:?}"; WORKFLOWS_SET=1; shift 2 ;;
    --schemas-dir=*) HOST_SCHEMAS_DIR="${1#*=}"; SCHEMAS_SET=1; shift ;;
    --schemas-dir) HOST_SCHEMAS_DIR="${2:?}"; SCHEMAS_SET=1; shift 2 ;;
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
    -*) die "unknown option: $1 (see --help)" ;;
    *) POSITIONAL+=("$1"); shift ;;
  esac
done

if [[ ${#POSITIONAL[@]} -ge 1 ]]; then
  HOST_WORKTREE_ROOT="${POSITIONAL[0]}"
  WORKTREE_SET=1
fi
if [[ ${#POSITIONAL[@]} -ge 2 ]]; then
  HOST_WORKFLOWS_DIR="${POSITIONAL[1]}"
  WORKFLOWS_SET=1
fi
if [[ ${#POSITIONAL[@]} -ge 3 ]]; then
  HOST_SCHEMAS_DIR="${POSITIONAL[2]}"
  SCHEMAS_SET=1
fi
if [[ ${#POSITIONAL[@]} -gt 3 ]]; then
  die "too many positional args (expected: [worktree workflows [schemas]])"
fi

if [[ "$INSTALL_DIR_SET" -eq 0 ]]; then
  if [[ -n "${WORKFLOW_SERVER_INSTALL_DIR:-}" ]]; then
    INSTALL_DIR="$WORKFLOW_SERVER_INSTALL_DIR"
  elif [[ -f "${SCRIPT_DIR}/${DEFAULT_ENV_NAME}" || -x "${SCRIPT_DIR}/start.sh" || -f "${SCRIPT_DIR}/workflows/.git" || -d "${SCRIPT_DIR}/workflows/.git" ]]; then
    # Installed next to env / workflows (typical start.sh location).
    INSTALL_DIR="$SCRIPT_DIR"
  else
    INSTALL_DIR="$DEFAULT_INSTALL_DIR"
  fi
fi

INSTALL_DIR="$(abs_path "${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}")"

# If install env lives under the resolved install dir and was not loaded yet, load it.
if [[ -z "$LOADED_ENV_FILE" && -f "${INSTALL_DIR}/${DEFAULT_ENV_NAME}" ]]; then
  # shellcheck disable=SC1090
  set -a
  # shellcheck disable=SC1090
  source "${INSTALL_DIR}/${DEFAULT_ENV_NAME}"
  set +a
  LOADED_ENV_FILE="${INSTALL_DIR}/${DEFAULT_ENV_NAME}"
  # Refresh values that may have been set only after first load attempt.
  NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$NAME}"
  HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"
fi

# Path resolution (CLI > install/process env already in shell > defaults):
if [[ "$WORKTREE_SET" -eq 0 ]]; then
  [[ -z "$HOST_WORKTREE_ROOT" ]] && HOST_WORKTREE_ROOT="${INSTALL_DIR}/workspace"
fi

if [[ "$ENGINEERING_SET" -eq 0 ]]; then
  [[ -z "$HOST_ENGINEERING_ROOT" ]] && HOST_ENGINEERING_ROOT="${INSTALL_DIR}/engineering"
fi

if [[ "$WORKFLOWS_SET" -eq 0 ]]; then
  [[ -z "$HOST_WORKFLOWS_DIR" ]] && HOST_WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
fi

if [[ "$SCHEMAS_SET" -eq 0 ]]; then
  [[ -z "$HOST_SCHEMAS_DIR" && -d "${INSTALL_DIR}/schemas" ]] && HOST_SCHEMAS_DIR="${INSTALL_DIR}/schemas"
fi

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"

# Resolve + create roots before bind-mount (must exist for docker -v).
HOST_WORKTREE_ROOT="$(abs_path "$HOST_WORKTREE_ROOT")"
if [[ ! -d "$HOST_WORKTREE_ROOT" ]]; then
  echo "Creating workspace root: ${HOST_WORKTREE_ROOT}"
  mkdir -p "$HOST_WORKTREE_ROOT" || die "failed to create workspace root: ${HOST_WORKTREE_ROOT}"
fi
[[ -d "$HOST_WORKTREE_ROOT" ]] || die "workspace root is not a directory: ${HOST_WORKTREE_ROOT}"

HOST_ENGINEERING_ROOT="$(abs_path "$HOST_ENGINEERING_ROOT")"
if [[ ! -d "$HOST_ENGINEERING_ROOT" ]]; then
  echo "Creating engineering root: ${HOST_ENGINEERING_ROOT}"
  mkdir -p "$HOST_ENGINEERING_ROOT" || die "failed to create engineering root: ${HOST_ENGINEERING_ROOT}"
fi
[[ -d "$HOST_ENGINEERING_ROOT" ]] || die "engineering root is not a directory: ${HOST_ENGINEERING_ROOT}"

if [[ ! -d "$HOST_WORKFLOWS_DIR" ]]; then
  die "workflows directory not found: ${HOST_WORKFLOWS_DIR}

Clone the workflows orphan branch into the install dir, for example:
  git clone -b workflows --single-branch \\
    https://github.com/m2ux/workflow-server.git \\
    ${INSTALL_DIR}/workflows

Or run install.sh / pass --workflows-dir=PATH / --install-dir=PATH."
fi

HOST_WORKTREE_ROOT="$(abs_dir "$HOST_WORKTREE_ROOT")"
HOST_ENGINEERING_ROOT="$(abs_dir "$HOST_ENGINEERING_ROOT")"
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
  Check network access to ghcr.io, or build from a checkout if the tag is unpublished."
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
DOCKER_RUN+=(-e "WORKFLOW_WORKSPACE=${CONTAINER_WORKTREE_ROOT}")
DOCKER_RUN+=(-e "WORKFLOW_SERVER_ENGINEERING_DIR=${CONTAINER_ENGINEERING_ROOT}")
DOCKER_RUN+=(-e "WORKFLOW_SERVER_INSTALL_DIR=${CONTAINER_INSTALL_DIR}")
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
DOCKER_RUN+=(-v "${HOST_ENGINEERING_ROOT}:${CONTAINER_ENGINEERING_ROOT}")
DOCKER_RUN+=(-v "${HOST_WORKFLOWS_DIR}:${CONTAINER_WORKFLOW_DIR}:ro")
if [[ -n "$HOST_SCHEMAS_DIR" ]]; then
  DOCKER_RUN+=(-v "${HOST_SCHEMAS_DIR}:${CONTAINER_SCHEMAS_DIR}:ro")
fi

DOCKER_RUN+=("${DOCKER_ARGS[@]+"${DOCKER_ARGS[@]}"}")
DOCKER_RUN+=("$FULL_IMAGE")

echo "Install  : ${INSTALL_DIR}"
[[ -n "$LOADED_ENV_FILE" ]] && echo "Env file : ${LOADED_ENV_FILE}"
echo "Starting ${FULL_IMAGE}"
echo "  workspace  : ${HOST_WORKTREE_ROOT} → ${CONTAINER_WORKTREE_ROOT} (rw)"
echo "  engineering: ${HOST_ENGINEERING_ROOT} → ${CONTAINER_ENGINEERING_ROOT} (rw)"
echo "  workflows  : ${HOST_WORKFLOWS_DIR} → ${CONTAINER_WORKFLOW_DIR} (ro)"
if [[ -n "$HOST_SCHEMAS_DIR" ]]; then
  echo "  schemas    : ${HOST_SCHEMAS_DIR} → ${CONTAINER_SCHEMAS_DIR} (ro)"
else
  echo "  schemas    : (image default at ${CONTAINER_SCHEMAS_DIR})"
fi
echo "  publish    : ${HOST_PORT} → ${CONTAINER_PORT}"
echo "  MCP URL    : http://127.0.0.1:${HOST_PORT}/mcp"

run "${DOCKER_RUN[@]}"

if [[ "$DETACH" -eq 1 && "$DRY_RUN" -eq 0 ]]; then
  echo "Detached as '${NAME}'. Logs: docker logs -f ${NAME}"
  echo "Health:  curl -fsS http://127.0.0.1:${HOST_PORT}/health"
  echo "Ready:   curl -fsS http://127.0.0.1:${HOST_PORT}/ready"
fi
