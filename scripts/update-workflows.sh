#!/usr/bin/env bash
# workflow-server — refresh the local workflows definitions checkout only
#
# Product repos under HOST_PROJECTS_ROOT are managed by you; this script does
# not clone, ff-update, or touch them (init-repo.sh is also deprecated).
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
Update the local workflows definitions checkout (\$INSTALL/workflows).

Product checkouts under \$HOST_PROJECTS_ROOT are not touched — manage those
yourself. init-repo.sh is deprecated.

USAGE
  update-workflows.sh [options]

OPTIONS
  --install-dir=PATH    Install root (default: ${DEFAULT_INSTALL_DIR})
                        workflows dir = \$INSTALL/workflows unless overridden
  --workflows-dir=PATH  Explicit workflows git checkout
  --branch=NAME         Workflows branch to track (default: ${DEFAULT_BRANCH})
  --remote=NAME         Remote name (default: ${DEFAULT_REMOTE})
  --force               Discard local changes (git reset --hard + clean -fd)
  -h, --help

  Deprecated (ignored): --projects-root, --skip-projects

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

is_git_checkout() {
  local dest="$1"
  { [[ -d "${dest}/.git" ]] || [[ -f "${dest}/.git" ]]; } \
    && git -C "${dest}" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

# Update a git worktree onto remote tracking branch tip.
ff_checkout() {
  local dir="$1"
  local track_branch="$2"
  local label="$3"

  echo "${label}: ${dir}"
  local before after subject
  before=$(git -C "$dir" rev-parse --short HEAD 2>/dev/null || echo "unknown")

  echo "  Fetching ${REMOTE} ${track_branch} ..."
  git -C "$dir" fetch "$REMOTE" "$track_branch" 2>/dev/null \
    || git -C "$dir" fetch "$REMOTE"

  if [[ "$FORCE" -eq 1 ]]; then
    echo "  Hard reset to ${REMOTE}/${track_branch} (--force)"
    git -C "$dir" checkout -B "$track_branch" "${REMOTE}/${track_branch}" 2>/dev/null \
      || git -C "$dir" checkout -B "$track_branch" "origin/${track_branch}"
    git -C "$dir" reset --hard "${REMOTE}/${track_branch}" 2>/dev/null \
      || git -C "$dir" reset --hard "origin/${track_branch}"
    git -C "$dir" clean -fd
  else
    if ! git -C "$dir" diff --quiet || ! git -C "$dir" diff --cached --quiet; then
      die "local changes in ${dir}
  Commit/stash them, or re-run with --force to discard"
    fi
    local current_branch
    current_branch=$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")
    if [[ "$current_branch" != "$track_branch" ]]; then
      git -C "$dir" checkout -B "$track_branch" "${REMOTE}/${track_branch}" 2>/dev/null \
        || git -C "$dir" checkout -B "$track_branch" "origin/${track_branch}"
    else
      git -C "$dir" merge --ff-only "${REMOTE}/${track_branch}" 2>/dev/null \
        || git -C "$dir" merge --ff-only "origin/${track_branch}"
    fi
  fi

  after=$(git -C "$dir" rev-parse --short HEAD)
  subject=$(git -C "$dir" log -1 --pretty=format:'%s')
  if [[ "$before" == "$after" ]]; then
    echo "  Already up to date at ${after} — ${subject}"
  else
    echo "  Updated ${before} → ${after} — ${subject}"
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
    --projects-root=*)
      echo "warning: product checkout updates are no longer performed (ignored --projects-root)" >&2
      shift
      ;;
    --projects-root)
      echo "warning: product checkout updates are no longer performed (ignored --projects-root)" >&2
      shift 2
      ;;
    --skip-projects)
      echo "warning: --skip-projects is obsolete (workflows-only update is the default)" >&2
      shift
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

is_git_checkout "$WORKFLOWS_DIR" || die "not a git checkout: ${WORKFLOWS_DIR}"

ff_checkout "$WORKFLOWS_DIR" "$BRANCH" "Workflows"

echo
echo "If the server is running, restart it to reload definitions:"
echo "  ${INSTALL_DIR}/start.sh -d"
