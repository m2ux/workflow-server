#!/usr/bin/env bash
# workflow-server — install GHCR layout only (does not start the container)
#
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
#
# Installs under ~/.local/share/workflow-server (runner + workflows clone).
# Agent worktrees default to ~/worktrees on run — not under the install dir.
#
# Then start separately:
#   ~/.local/share/workflow-server/run-workflow-server.sh -d
#   ~/.local/share/workflow-server/run-workflow-server.sh --worktree-root=PATH -d
#
# Options:
#   bash <(curl -fsSL …/install-docker.sh) --install-dir=/opt/workflow-server
#
# Needs: curl, git
set -euo pipefail

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_REPO_URL="https://github.com/m2ux/workflow-server.git"
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
DEFAULT_REF="main"
DEFAULT_RUNNER_NAME="run-workflow-server.sh"
DEFAULT_UPDATE_NAME="update-workflows.sh"

INSTALL_DIR="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
REPO_URL="${WORKFLOW_SERVER_REPO_URL:-$DEFAULT_REPO_URL}"
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
REF="${WORKFLOW_SERVER_REF:-$DEFAULT_REF}"

usage() {
  cat <<EOF
Install workflow-server under a local data dir: fetch helper scripts and clone
workflows data. Does not start Docker — run the runner as a separate step.

USAGE
  install-docker.sh [options]

OPTIONS
  --install-dir=PATH   Install root (default: ${DEFAULT_INSTALL_DIR})
  --repo-url=URL       Git remote for workflows branch (default: GitHub m2ux)
  --ref=REF            Branch/tag for helper scripts raw URL (default: ${DEFAULT_REF})
  -h, --help

LAYOUT
  \$INSTALL/
    ${DEFAULT_RUNNER_NAME}
    ${DEFAULT_UPDATE_NAME}
    workflows/     # git clone -b workflows

  Worktree root defaults to ~/worktrees on first run (shared with the agent;
  override with run --worktree-root=PATH). Not stored under \$INSTALL.

AFTER INSTALL
  \$INSTALL/${DEFAULT_RUNNER_NAME} -d
  \$INSTALL/${DEFAULT_UPDATE_NAME}   # later: pull latest workflows branch
  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp
  curl -fsS http://127.0.0.1:3000/health
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
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$p"
  else
    (cd "$(dirname "$p")" 2>/dev/null && echo "$(pwd)/$(basename "$p")") || echo "$p"
  fi
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
    *)
      die "unknown option: $1 (see --help)"
      ;;
  esac
done

need curl
need git

INSTALL_DIR=$(abs_path "$INSTALL_DIR")
RUNNER_PATH="${INSTALL_DIR}/${DEFAULT_RUNNER_NAME}"
UPDATE_PATH="${INSTALL_DIR}/${DEFAULT_UPDATE_NAME}"
WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
RUNNER_URL="${RAW_BASE}/${REF}/scripts/run-docker.sh"
UPDATE_URL="${RAW_BASE}/${REF}/scripts/update-workflows.sh"

echo "Install dir: ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"

echo "Fetching runner → ${RUNNER_PATH}"
curl -fsSL -o "$RUNNER_PATH" "$RUNNER_URL"
chmod +x "$RUNNER_PATH"

echo "Fetching update-workflows → ${UPDATE_PATH}"
curl -fsSL -o "$UPDATE_PATH" "$UPDATE_URL"
chmod +x "$UPDATE_PATH"

if [[ -d "${WORKFLOWS_DIR}/.git" ]]; then
  echo "Workflows already present: ${WORKFLOWS_DIR}"
elif [[ -e "$WORKFLOWS_DIR" ]]; then
  die "${WORKFLOWS_DIR} exists but is not a git checkout"
else
  echo "Cloning workflows branch → ${WORKFLOWS_DIR}"
  git clone -b workflows --single-branch "$REPO_URL" "$WORKFLOWS_DIR"
fi

echo
echo "Install complete."
echo "  Install dir : ${INSTALL_DIR}"
echo "  Workflows   : ${WORKFLOWS_DIR}"
echo "  Worktrees   : ~/worktrees  (default on run; shared with the agent — not under install dir)"
echo
echo "Start the server:"
echo "  ${RUNNER_PATH} -d"
echo
echo "Override worktree root if needed:"
echo "  ${RUNNER_PATH} --worktree-root=PATH -d"
echo
echo "Update workflows later with:"
echo "  ${UPDATE_PATH}"
echo
echo "Then:"
echo "  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp"
echo "  curl -fsS http://127.0.0.1:3000/health"
