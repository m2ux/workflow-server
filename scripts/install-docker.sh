#!/usr/bin/env bash
# workflow-server — one-shot GHCR install + run (no server checkout)
#
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
#
# Or download and run with options:
#   curl -fsSL -o install-workflow-server.sh \
#     https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh
#   bash install-workflow-server.sh --install-dir=/opt/workflow-server
#
# Needs: docker, git, curl
set -euo pipefail

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_REPO_URL="https://github.com/m2ux/workflow-server.git"
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
DEFAULT_REF="main"
DEFAULT_RUNNER_NAME="run-workflow-server.sh"

INSTALL_DIR="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
REPO_URL="${WORKFLOW_SERVER_REPO_URL:-$DEFAULT_REPO_URL}"
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
REF="${WORKFLOW_SERVER_REF:-$DEFAULT_REF}"
START=1
DETACH=1
RUNNER_ARGS=()

usage() {
  cat <<EOF
Install workflow-server under a local data dir, fetch the runner, clone
workflows data, and start the container.

USAGE
  install-docker.sh [options] [-- runner-args...]

OPTIONS
  --install-dir=PATH   Install root (default: ${DEFAULT_INSTALL_DIR})
  --repo-url=URL       Git remote for workflows branch (default: GitHub m2ux)
  --ref=REF            Branch/tag for runner script raw URL (default: ${DEFAULT_REF})
  --no-start           Install only; do not run the container
  --foreground         Start attached (default: detached -d)
  -h, --help

  Extra args after -- are passed to the runner, e.g.:
    install-docker.sh -- --tag=latest --host-port=3001

LAYOUT
  \$INSTALL/
    ${DEFAULT_RUNNER_NAME}
    workflows/     # git clone -b workflows
    worktrees/     # created on first run

AFTER INSTALL
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
    --no-start)
      START=0
      shift
      ;;
    --foreground)
      DETACH=0
      shift
      ;;
    --)
      shift
      RUNNER_ARGS+=("$@")
      break
      ;;
    *)
      die "unknown option: $1 (see --help)"
      ;;
  esac
done

need curl
need git
need docker

INSTALL_DIR=$(abs_path "$INSTALL_DIR")
RUNNER_PATH="${INSTALL_DIR}/${DEFAULT_RUNNER_NAME}"
WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
RUNNER_URL="${RAW_BASE}/${REF}/scripts/run-docker.sh"

echo "Install dir: ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"

echo "Fetching runner → ${RUNNER_PATH}"
curl -fsSL -o "$RUNNER_PATH" "$RUNNER_URL"
chmod +x "$RUNNER_PATH"

if [[ -d "${WORKFLOWS_DIR}/.git" ]]; then
  echo "Workflows already present: ${WORKFLOWS_DIR}"
elif [[ -e "$WORKFLOWS_DIR" ]]; then
  die "${WORKFLOWS_DIR} exists but is not a git checkout"
else
  echo "Cloning workflows branch → ${WORKFLOWS_DIR}"
  git clone -b workflows --single-branch "$REPO_URL" "$WORKFLOWS_DIR"
fi

if [[ "$START" -eq 0 ]]; then
  echo "Install complete (not started). Run:"
  echo "  ${RUNNER_PATH} -d"
  exit 0
fi

CMD=("$RUNNER_PATH" --install-dir="$INSTALL_DIR")
if [[ "$DETACH" -eq 1 ]]; then
  CMD+=(-d)
fi
if [[ ${#RUNNER_ARGS[@]} -gt 0 ]]; then
  CMD+=("${RUNNER_ARGS[@]}")
fi

echo "Starting: ${CMD[*]}"
exec "${CMD[@]}"
