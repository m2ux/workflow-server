#!/usr/bin/env bash
# workflow-server — refresh install data: workflows defs + all source checkouts
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
SOURCE_ROOT=""
BRANCH="${WORKFLOW_SERVER_WORKFLOWS_BRANCH:-$DEFAULT_BRANCH}"
REMOTE="$DEFAULT_REMOTE"
FORCE=0
SKIP_SOURCE=0

usage() {
  cat <<EOF
Update the local workflows definitions checkout and every per-repo source
checkout under \$INSTALL/source (default branch + .engineering when present).

USAGE
  update-workflows.sh [options]

OPTIONS
  --install-dir=PATH    Install root (default: ${DEFAULT_INSTALL_DIR})
                        workflows dir = \$INSTALL/workflows unless overridden
  --workflows-dir=PATH  Explicit workflows git checkout
  --source-root=PATH    Per-repo source root (default: \$INSTALL/source)
  --branch=NAME         Workflows branch to track (default: ${DEFAULT_BRANCH})
  --remote=NAME         Remote name (default: ${DEFAULT_REMOTE})
  --force               Discard local changes (git reset --hard + clean -fd)
  --skip-source         Only update workflows definitions
  -h, --help

Default paths:
  ${DEFAULT_INSTALL_DIR}/workflows
  ${DEFAULT_INSTALL_DIR}/source/<owner>/<repo>
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

default_branch_for() {
  local dest="$1"
  local ref
  ref="$(git -C "$dest" symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null || true)"
  if [[ -n "$ref" ]]; then
    printf '%s\n' "${ref#refs/remotes/origin/}"
    return 0
  fi
  if git -C "$dest" show-ref --verify --quiet refs/remotes/origin/main; then
    echo main
    return 0
  fi
  if git -C "$dest" show-ref --verify --quiet refs/remotes/origin/master; then
    echo master
    return 0
  fi
  echo main
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

update_engineering_under_source() {
  local source_dir="$1"
  local eng="${source_dir}/.engineering"
  [[ -e "$eng" ]] || return 0
  if ! is_git_checkout "$eng"; then
    echo "  Engineering at ${eng} is not a git checkout (skip)"
    return 0
  fi
  local br="engineering"
  # Prefer .gitmodules branch when parent has it
  if [[ -f "${source_dir}/.gitmodules" ]]; then
    local b
    b="$(git config -f "${source_dir}/.gitmodules" --get-regexp 'submodule\..*\.path' 2>/dev/null \
      | while read -r key path; do
          [[ "$path" == ".engineering" ]] || continue
          name="${key#submodule.}"
          name="${name%.path}"
          git config -f "${source_dir}/.gitmodules" --get "submodule.${name}.branch" 2>/dev/null || true
          break
        done)"
    [[ -n "$b" ]] && br="$b"
  fi
  # Detached submodule pin: try to stay on tracking branch if remote has it
  if git -C "$eng" show-ref --verify --quiet "refs/remotes/origin/${br}"; then
    ff_checkout "$eng" "$br" "Engineering"
  else
    echo "  Engineering: fetch only (no origin/${br})"
    git -C "$eng" fetch "$REMOTE" 2>/dev/null || true
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
    --source-root=*)
      SOURCE_ROOT="${1#*=}"
      shift
      ;;
    --source-root)
      SOURCE_ROOT="${2:?}"
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
    --skip-source)
      SKIP_SOURCE=1
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
if [[ -z "$SOURCE_ROOT" ]]; then
  SOURCE_ROOT="${INSTALL_DIR}/source"
fi
SOURCE_ROOT=$(abs_path "$SOURCE_ROOT")

[[ -d "$WORKFLOWS_DIR" ]] || die "workflows dir not found: ${WORKFLOWS_DIR}
  Run install first:
    curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash"

is_git_checkout "$WORKFLOWS_DIR" || die "not a git checkout: ${WORKFLOWS_DIR}"

ff_checkout "$WORKFLOWS_DIR" "$BRANCH" "Workflows"

if [[ "$SKIP_SOURCE" -eq 0 && -d "$SOURCE_ROOT" ]]; then
  echo
  echo "Refreshing source checkouts under ${SOURCE_ROOT}"
  shopt -s nullglob
  for owner_dir in "${SOURCE_ROOT}"/*; do
    [[ -d "$owner_dir" ]] || continue
    owner="$(basename "$owner_dir")"
    [[ "$owner" == .* ]] && continue
    for repo_dir in "${owner_dir}"/*; do
      [[ -d "$repo_dir" ]] || continue
      is_git_checkout "$repo_dir" || continue
      def_br="$(default_branch_for "$repo_dir")"
      ff_checkout "$repo_dir" "$def_br" "Source ${owner}/$(basename "$repo_dir")"
      update_engineering_under_source "$repo_dir"
    done
  done
  shopt -u nullglob
elif [[ "$SKIP_SOURCE" -eq 0 ]]; then
  echo
  echo "No source root at ${SOURCE_ROOT} (skip); run init-repo.sh owner/repo first"
fi

echo
echo "If the server is running, restart it to reload definitions:"
echo "  ${INSTALL_DIR}/start.sh -d"
