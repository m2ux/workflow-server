#!/usr/bin/env bash
# workflow-server — pull latest workflows branch into the install layout
#
# After install:
#   ~/.local/share/workflow-server/update-workflows.sh
#
# Or curl once:
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/update-workflows.sh | bash
#
# Needs: git
set -euo pipefail

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_BRANCH="workflows"
DEFAULT_REMOTE="origin"

INSTALL_DIR="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
WORKFLOWS_DIR=""
BRANCH="${WORKFLOW_SERVER_WORKFLOWS_BRANCH:-$DEFAULT_BRANCH}"
REMOTE="$DEFAULT_REMOTE"
FORCE=0

usage() {
  cat <<EOF
Update the local workflows checkout to the latest tip of the workflows branch.

USAGE
  update-workflows.sh [options]

OPTIONS
  --install-dir=PATH    Install root (default: ${DEFAULT_INSTALL_DIR})
                        workflows dir = \$INSTALL/workflows unless overridden
  --workflows-dir=PATH  Explicit workflows git checkout
  --branch=NAME         Branch to track (default: ${DEFAULT_BRANCH})
  --remote=NAME         Remote name (default: ${DEFAULT_REMOTE})
  --force               Discard local changes (git reset --hard + clean -fd)
  -h, --help

Default path:
  ${DEFAULT_INSTALL_DIR}/workflows
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
    --workflows-dir=*)
      WORKFLOWS_DIR="${1#*=}"
      shift
      ;;
    --workflows-dir)
      WORKFLOWS_DIR="${2:?}"
      shift 2
      ;;
    --branch=*)
      BRANCH="${1#*=}"
      shift
      ;;
    --branch)
      BRANCH="${2:?}"
      shift 2
      ;;
    --remote=*)
      REMOTE="${1#*=}"
      shift
      ;;
    --remote)
      REMOTE="${2:?}"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    *)
      die "unknown option: $1 (see --help)"
      ;;
  esac
done

need git

INSTALL_DIR=$(abs_path "$INSTALL_DIR")
if [[ -z "$WORKFLOWS_DIR" ]]; then
  WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
fi
WORKFLOWS_DIR=$(abs_path "$WORKFLOWS_DIR")

[[ -d "$WORKFLOWS_DIR" ]] || die "workflows dir not found: ${WORKFLOWS_DIR}
  Run install first:
    curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash"

[[ -d "${WORKFLOWS_DIR}/.git" ]] || die "not a git checkout: ${WORKFLOWS_DIR}"

cd "$WORKFLOWS_DIR"

echo "Workflows: ${WORKFLOWS_DIR}"
BEFORE=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "Fetching ${REMOTE} ${BRANCH} ..."
git fetch "$REMOTE" "$BRANCH"

if [[ "$FORCE" -eq 1 ]]; then
  echo "Hard reset to ${REMOTE}/${BRANCH} (--force)"
  git checkout -B "$BRANCH" "${REMOTE}/${BRANCH}"
  git reset --hard "${REMOTE}/${BRANCH}"
  git clean -fd
else
  if ! git diff --quiet || ! git diff --cached --quiet; then
    die "local changes in ${WORKFLOWS_DIR}
  Commit/stash them, or re-run with --force to discard"
  fi
  # Detached HEAD or wrong branch: move onto tracking branch at remote tip
  current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")
  if [[ "$current_branch" != "$BRANCH" ]]; then
    git checkout -B "$BRANCH" "${REMOTE}/${BRANCH}"
  else
    git merge --ff-only "${REMOTE}/${BRANCH}"
  fi
fi

AFTER=$(git rev-parse --short HEAD)
SUBJECT=$(git log -1 --pretty=format:'%s')

if [[ "$BEFORE" == "$AFTER" ]]; then
  echo "Already up to date at ${AFTER} — ${SUBJECT}"
else
  echo "Updated ${BEFORE} → ${AFTER} — ${SUBJECT}"
fi

echo
echo "If the server is running, restart it to reload definitions:"
echo "  ${INSTALL_DIR}/start.sh -d"
