#!/usr/bin/env bash
# workflow-server — install local layout (does not start the container)
#
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
#
#   bash <(curl -fsSL …/install.sh) --worktree-root=~/projects/work
#
# Writes $INSTALL/env so start.sh needs no path args. Creates source/ and
# worktrees/ under the install root (per-repo checkouts via init-repo.sh).
#
# Then:
#   ~/.local/share/workflow-server/start.sh -d
#   ~/.local/share/workflow-server/stop.sh
#   ~/.local/share/workflow-server/init-repo.sh owner/repo
#
# Needs: curl, git
set -euo pipefail

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_REPO_URL="https://github.com/m2ux/workflow-server.git"
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
DEFAULT_REF="main"
DEFAULT_START_NAME="start.sh"
DEFAULT_STOP_NAME="stop.sh"
DEFAULT_UPDATE_NAME="update-workflows.sh"
DEFAULT_INIT_REPO_NAME="init-repo.sh"
DEFAULT_ENV_NAME="env"
DEFAULT_CONTAINER_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
# Legacy names from earlier releases — removed on upgrade when present.
LEGACY_NAMES=(
  "run-workflow-server.sh"
  "run-docker.sh"
  "stop-docker.sh"
  "install-docker.sh"
)

INSTALL_DIR="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
# Optional override; when unset, defaults to $INSTALL/worktrees after abs_path.
HOST_WORKTREE_ROOT="${HOST_WORKTREE_ROOT:-${WORKFLOW_WORKSPACE:-}}"
HOST_SOURCE_ROOT="${HOST_SOURCE_ROOT:-}"
REPO_URL="${WORKFLOW_SERVER_REPO_URL:-$DEFAULT_REPO_URL}"
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
REF="${WORKFLOW_SERVER_REF:-$DEFAULT_REF}"
CONTAINER_NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_CONTAINER_NAME}"
HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"

usage() {
  cat <<EOF
Install workflow-server under a local data dir: fetch helper scripts, clone
workflows data, create source/ + worktrees/ roots, and write a persistent
env file. Does not start Docker.

USAGE
  install.sh [options]

OPTIONS
  --install-dir=PATH       Install root (default: ${DEFAULT_INSTALL_DIR})
  --worktree-root=PATH     Feature worktree parent root
                           (default: \$INSTALL/worktrees)
                           Persisted to \$INSTALL/${DEFAULT_ENV_NAME} for start.sh
  --source-root=PATH       Per-repo main checkout root
                           (default: \$INSTALL/source)
  --repo-url=URL           Git remote for workflows branch (default: GitHub m2ux)
  --ref=REF                Branch/tag for helper scripts raw URL (default: ${DEFAULT_REF})
  --name=NAME              Container name persisted for start/stop (default: ${DEFAULT_CONTAINER_NAME})
  --host-port=N            Host port persisted for start (default: ${DEFAULT_HOST_PORT})
  -h, --help

LAYOUT
  \$INSTALL/
    ${DEFAULT_START_NAME}
    ${DEFAULT_STOP_NAME}
    ${DEFAULT_UPDATE_NAME}
    ${DEFAULT_INIT_REPO_NAME}
    ${DEFAULT_ENV_NAME}               # persistent paths / ports for start + stop
    workflows/               # git clone -b workflows (server definitions)
    source/                  # per-repo main checkouts (init-repo.sh)
      <owner>/<repo>/        #   app @ default branch
      <owner>/<repo>/.engineering/  # eng submodule / materialised planning
    worktrees/               # per-repo feature worktree parents (init-repo.sh)
    state/                   # durable HMAC key (mounted by start.sh)

  Per-repo paths are created by init-repo.sh owner/repo.

AFTER INSTALL
  \$INSTALL/${DEFAULT_START_NAME} -d
  \$INSTALL/${DEFAULT_STOP_NAME}
  \$INSTALL/${DEFAULT_UPDATE_NAME}
  \$INSTALL/${DEFAULT_INIT_REPO_NAME} owner/repo
  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${DEFAULT_HOST_PORT}/mcp
  curl -fsS http://127.0.0.1:${DEFAULT_HOST_PORT}/health
  curl -fsS http://127.0.0.1:${DEFAULT_HOST_PORT}/ready   # sessionKeyWritable: true
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

ensure_dir() {
  local path="$1" label="$2"
  if [[ ! -d "$path" ]]; then
    echo "Creating ${label} → ${path}"
    mkdir -p "$path" || die "failed to create ${label}: ${path}"
  else
    echo "${label} already present: ${path}"
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
    --source-root=*)
      HOST_SOURCE_ROOT="${1#*=}"
      shift
      ;;
    --source-root)
      HOST_SOURCE_ROOT="${2:?}"
      shift 2
      ;;
    # Legacy flag — map to source multi-root (eng lives under source/<o>/<r>/.engineering)
    --engineering-root=*)
      echo "warning: --engineering-root is ignored; engineering is source/<owner>/<repo>/.engineering" >&2
      shift
      ;;
    --engineering-root)
      echo "warning: --engineering-root is ignored; engineering is source/<owner>/<repo>/.engineering" >&2
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
if [[ -z "$HOST_WORKTREE_ROOT" ]]; then
  # Prefer worktrees/; accept legacy workspace/ if already present and worktrees missing
  if [[ -d "${INSTALL_DIR}/worktrees" ]]; then
    HOST_WORKTREE_ROOT="${INSTALL_DIR}/worktrees"
  elif [[ -d "${INSTALL_DIR}/workspace" && ! -e "${INSTALL_DIR}/worktrees" ]]; then
    echo "Migrating workspace/ → worktrees/"
    mv "${INSTALL_DIR}/workspace" "${INSTALL_DIR}/worktrees"
    HOST_WORKTREE_ROOT="${INSTALL_DIR}/worktrees"
  else
    HOST_WORKTREE_ROOT="${INSTALL_DIR}/worktrees"
  fi
fi
if [[ -z "$HOST_SOURCE_ROOT" ]]; then
  HOST_SOURCE_ROOT="${INSTALL_DIR}/source"
fi
HOST_WORKTREE_ROOT=$(abs_path "$HOST_WORKTREE_ROOT")
HOST_SOURCE_ROOT=$(abs_path "$HOST_SOURCE_ROOT")

START_PATH="${INSTALL_DIR}/${DEFAULT_START_NAME}"
STOP_PATH="${INSTALL_DIR}/${DEFAULT_STOP_NAME}"
UPDATE_PATH="${INSTALL_DIR}/${DEFAULT_UPDATE_NAME}"
INIT_REPO_PATH="${INSTALL_DIR}/${DEFAULT_INIT_REPO_NAME}"
ENV_PATH="${INSTALL_DIR}/${DEFAULT_ENV_NAME}"
WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
START_URL="${RAW_BASE}/${REF}/scripts/start.sh"
STOP_URL="${RAW_BASE}/${REF}/scripts/stop.sh"
UPDATE_URL="${RAW_BASE}/${REF}/scripts/update-workflows.sh"
INIT_REPO_URL="${RAW_BASE}/${REF}/scripts/init-repo.sh"

echo "Install dir: ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
STATE_DIR="${INSTALL_DIR}/state"
ensure_dir "$STATE_DIR" "state dir (HMAC key)"

ensure_dir "$HOST_WORKTREE_ROOT" "worktrees root"
ensure_dir "$HOST_SOURCE_ROOT" "source root"

fetch_script "$START_PATH" "$START_URL" "start"
fetch_script "$STOP_PATH" "$STOP_URL" "stop"
fetch_script "$UPDATE_PATH" "$UPDATE_URL" "update-workflows"
fetch_script "$INIT_REPO_PATH" "$INIT_REPO_URL" "init-repo"

for legacy in "${LEGACY_NAMES[@]}"; do
  legacy_path="${INSTALL_DIR}/${legacy}"
  if [[ -e "$legacy_path" ]]; then
    echo "Removing legacy script → ${legacy_path}"
    rm -f "$legacy_path"
  fi
done

if [[ -d "${WORKFLOWS_DIR}/.git" ]] || [[ -f "${WORKFLOWS_DIR}/.git" ]]; then
  echo "Workflows already present: ${WORKFLOWS_DIR}"
elif [[ -e "$WORKFLOWS_DIR" ]]; then
  die "${WORKFLOWS_DIR} exists but is not a git checkout"
else
  echo "Cloning workflows branch → ${WORKFLOWS_DIR}"
  git clone -b workflows --single-branch "$REPO_URL" "$WORKFLOWS_DIR"
fi

# Persistent config for start.sh / stop.sh (no path args needed at runtime).
# Engineering multi-root is $HOST_SOURCE_ROOT (per-repo eng under
# source/<owner>/<repo>/.engineering).
cat >"$ENV_PATH" <<EOF
# Generated by install.sh — used by start.sh / stop.sh
# Edit and re-run start, or re-run install with new flags.
HOST_WORKTREE_ROOT=${HOST_WORKTREE_ROOT}
HOST_SOURCE_ROOT=${HOST_SOURCE_ROOT}
HOST_ENGINEERING_ROOT=${HOST_SOURCE_ROOT}
HOST_PORT=${HOST_PORT}
WORKFLOW_SERVER_CONTAINER_NAME=${CONTAINER_NAME}
WORKFLOW_SERVER_INSTALL_DIR=${INSTALL_DIR}
EOF
echo "Wrote env → ${ENV_PATH}"

echo
echo "Install complete."
echo "  Install dir  : ${INSTALL_DIR}"
echo "  Workflows    : ${WORKFLOWS_DIR}"
echo "  Source       : ${HOST_SOURCE_ROOT}  (per-repo main + .engineering)"
echo "  Worktrees    : ${HOST_WORKTREE_ROOT}"
echo "  State        : ${STATE_DIR}  (HMAC key; mounted by start.sh)"
echo "  Env          : ${ENV_PATH}"
echo
echo "Start / stop (paths come from env — no flags required):"
echo "  ${START_PATH} -d"
echo "  ${STOP_PATH}"
echo
echo "Init a repo (source main + .engineering + worktrees parent):"
echo "  ${INIT_REPO_PATH} owner/repo"
echo
echo "Update workflows + source checkouts later with:"
echo "  ${UPDATE_PATH}"
echo
echo "Then:"
echo "  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${HOST_PORT}/mcp"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/health"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/ready   # must include sessionKeyWritable: true"
