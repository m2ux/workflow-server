#!/usr/bin/env bash
# workflow-server — install GHCR layout only (does not start the container)
#
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
#
#   bash <(curl -fsSL …/install-docker.sh) --worktree-root=~/projects/work
#
# Writes $INSTALL/env so start.sh needs no path args.
#
# Then:
#   ~/.local/share/workflow-server/start.sh -d
#   ~/.local/share/workflow-server/stop.sh
#
# Needs: curl, git
set -euo pipefail

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_HOST_WORKTREE_ROOT="${HOME}/worktrees"
DEFAULT_REPO_URL="https://github.com/m2ux/workflow-server.git"
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
DEFAULT_REF="main"
DEFAULT_START_NAME="start.sh"
DEFAULT_STOP_NAME="stop.sh"
DEFAULT_UPDATE_NAME="update-workflows.sh"
DEFAULT_ENV_NAME="env"
DEFAULT_CONTAINER_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
# Legacy install name from earlier releases — removed on upgrade when present.
LEGACY_RUNNER_NAME="run-workflow-server.sh"

INSTALL_DIR="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
HOST_WORKTREE_ROOT="${HOST_WORKTREE_ROOT:-${WORKFLOW_WORKSPACE:-$DEFAULT_HOST_WORKTREE_ROOT}}"
REPO_URL="${WORKFLOW_SERVER_REPO_URL:-$DEFAULT_REPO_URL}"
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
REF="${WORKFLOW_SERVER_REF:-$DEFAULT_REF}"
CONTAINER_NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_CONTAINER_NAME}"
HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"

usage() {
  cat <<EOF
Install workflow-server under a local data dir: fetch helper scripts, clone
workflows data, and write a persistent env file. Does not start Docker.

USAGE
  install-docker.sh [options]

OPTIONS
  --install-dir=PATH     Install root (default: ${DEFAULT_INSTALL_DIR})
  --worktree-root=PATH   Agent worktree root (default: ${DEFAULT_HOST_WORKTREE_ROOT})
                         Persisted to \$INSTALL/${DEFAULT_ENV_NAME} for start.sh
  --repo-url=URL         Git remote for workflows branch (default: GitHub m2ux)
  --ref=REF              Branch/tag for helper scripts raw URL (default: ${DEFAULT_REF})
  --name=NAME            Container name persisted for start/stop (default: ${DEFAULT_CONTAINER_NAME})
  --host-port=N          Host port persisted for start (default: ${DEFAULT_HOST_PORT})
  -h, --help

LAYOUT
  \$INSTALL/
    ${DEFAULT_START_NAME}           # from scripts/run-docker.sh
    ${DEFAULT_STOP_NAME}            # from scripts/stop-docker.sh
    ${DEFAULT_UPDATE_NAME}
    ${DEFAULT_ENV_NAME}             # persistent paths / ports for start + stop
    workflows/             # git clone -b workflows

  Worktree root (default ${DEFAULT_HOST_WORKTREE_ROOT}) is created if missing
  and is not under \$INSTALL.

AFTER INSTALL
  \$INSTALL/${DEFAULT_START_NAME} -d
  \$INSTALL/${DEFAULT_STOP_NAME}
  \$INSTALL/${DEFAULT_UPDATE_NAME}
  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${DEFAULT_HOST_PORT}/mcp
  curl -fsS http://127.0.0.1:${DEFAULT_HOST_PORT}/health
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

need() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

abs_path() {
  local p="$1"
  [[ "$p" == ~* ]] && p="${p/#\~/$HOME}"
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$p"
  else
    (cd "$(dirname "$p")" 2>/dev/null && echo "$(pwd)/$(basename "$p")") || echo "$p"
  fi
}

fetch_script() {
  local dest="$1" url="$2" label="$3"
  echo "Fetching ${label} → ${dest}"
  curl -fsSL -o "$dest" "$url"
  chmod +x "$dest"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --install-dir=*)
      INSTALL_DIR="${1#*=}"
      shift
      ;;
    --install-dir)
      INSTALL_DIR="${2:?}"
      shift 2
      ;;
    --worktree-root=*)
      HOST_WORKTREE_ROOT="${1#*=}"
      shift
      ;;
    --worktree-root)
      HOST_WORKTREE_ROOT="${2:?}"
      shift 2
      ;;
    --repo-url=*)
      REPO_URL="${1#*=}"
      shift
      ;;
    --repo-url)
      REPO_URL="${2:?}"
      shift 2
      ;;
    --ref=*)
      REF="${1#*=}"
      shift
      ;;
    --ref)
      REF="${2:?}"
      shift 2
      ;;
    --name=*)
      CONTAINER_NAME="${1#*=}"
      shift
      ;;
    --name)
      CONTAINER_NAME="${2:?}"
      shift 2
      ;;
    --host-port=*)
      HOST_PORT="${1#*=}"
      shift
      ;;
    --host-port)
      HOST_PORT="${2:?}"
      shift 2
      ;;
    *)
      die "unknown option: $1 (see --help)"
      ;;
  esac
done

need curl
need git

INSTALL_DIR=$(abs_path "$INSTALL_DIR")
HOST_WORKTREE_ROOT=$(abs_path "$HOST_WORKTREE_ROOT")
START_PATH="${INSTALL_DIR}/${DEFAULT_START_NAME}"
STOP_PATH="${INSTALL_DIR}/${DEFAULT_STOP_NAME}"
UPDATE_PATH="${INSTALL_DIR}/${DEFAULT_UPDATE_NAME}"
ENV_PATH="${INSTALL_DIR}/${DEFAULT_ENV_NAME}"
LEGACY_PATH="${INSTALL_DIR}/${LEGACY_RUNNER_NAME}"
WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
START_URL="${RAW_BASE}/${REF}/scripts/run-docker.sh"
STOP_URL="${RAW_BASE}/${REF}/scripts/stop-docker.sh"
UPDATE_URL="${RAW_BASE}/${REF}/scripts/update-workflows.sh"

echo "Install dir: ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"

if [[ ! -d "$HOST_WORKTREE_ROOT" ]]; then
  echo "Creating worktree root → ${HOST_WORKTREE_ROOT}"
  mkdir -p "$HOST_WORKTREE_ROOT" || die "failed to create worktree root: ${HOST_WORKTREE_ROOT}"
else
  echo "Worktree root already present: ${HOST_WORKTREE_ROOT}"
fi

fetch_script "$START_PATH" "$START_URL" "start"
fetch_script "$STOP_PATH" "$STOP_URL" "stop"
fetch_script "$UPDATE_PATH" "$UPDATE_URL" "update-workflows"

if [[ -e "$LEGACY_PATH" ]]; then
  echo "Removing legacy runner → ${LEGACY_PATH}"
  rm -f "$LEGACY_PATH"
fi

if [[ -d "${WORKFLOWS_DIR}/.git" ]]; then
  echo "Workflows already present: ${WORKFLOWS_DIR}"
elif [[ -e "$WORKFLOWS_DIR" ]]; then
  die "${WORKFLOWS_DIR} exists but is not a git checkout"
else
  echo "Cloning workflows branch → ${WORKFLOWS_DIR}"
  git clone -b workflows --single-branch "$REPO_URL" "$WORKFLOWS_DIR"
fi

# Persistent config for start.sh / stop.sh (no path args needed at runtime).
cat >"$ENV_PATH" <<EOF
# Generated by install-docker.sh — used by start.sh / stop.sh
# Edit and re-run start, or re-run install with new flags.
WORKFLOW_SERVER_INSTALL_DIR=${INSTALL_DIR}
HOST_WORKTREE_ROOT=${HOST_WORKTREE_ROOT}
HOST_WORKFLOWS_DIR=${WORKFLOWS_DIR}
WORKFLOW_WORKSPACE=${HOST_WORKTREE_ROOT}
WORKFLOW_DIR=${WORKFLOWS_DIR}
WORKFLOW_SERVER_CONTAINER_NAME=${CONTAINER_NAME}
HOST_PORT=${HOST_PORT}
EOF
echo "Wrote env → ${ENV_PATH}"

echo
echo "Install complete."
echo "  Install dir : ${INSTALL_DIR}"
echo "  Workflows   : ${WORKFLOWS_DIR}"
echo "  Worktrees   : ${HOST_WORKTREE_ROOT}"
echo "  Env         : ${ENV_PATH}"
echo
echo "Start / stop (paths come from env — no flags required):"
echo "  ${START_PATH} -d"
echo "  ${STOP_PATH}"
echo
echo "Update workflows later with:"
echo "  ${UPDATE_PATH}"
echo
echo "Then:"
echo "  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${HOST_PORT}/mcp"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/health"
