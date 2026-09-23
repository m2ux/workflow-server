#!/usr/bin/env bash
# workflow-server — install local layout (does not start the container)
#
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/workspace/scripts/install.sh | bash
#
# Checks out branch workspace as ./workflow-server in the directory the script
# is started from. That checkout carries the kickoff: rules, skills, scripts,
# config, and the tool links. Install leaves those files in place. It renders
# .claude/settings.json and .codex/config.toml, which hold this machine's
# paths, and adds the main, workflows, and engineering worktrees when those
# paths are absent.
#
# Writes $INSTALL/env so start.sh needs no path args. Creates a projects root
# (default ~/projects/dev, or --projects-root / HOST_PROJECTS_ROOT). Feature
# worktrees live under the workspace checkout's .worktrees/ (gitignored).
#
# Then:
#   ~/.local/share/workflow-server/start.sh -d
#   ~/.local/share/workflow-server/stop.sh
#
# Needs: curl, git
set -euo pipefail

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_HOST_PROJECTS_ROOT="${HOME}/projects/dev"
DEFAULT_REPO_URL="https://github.com/m2ux/workflow-server.git"
DEFAULT_CORPUS_BRANCH="workflows"
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
DEFAULT_REF="main"
DEFAULT_WORKSPACE_BRANCH="workspace"
DEFAULT_CHECKOUT_NAME="workflow-server"
DEFAULT_START_NAME="start.sh"
DEFAULT_STOP_NAME="stop.sh"
DEFAULT_UPDATE_NAME="update-workflows.sh"
DEFAULT_DEPLOY_CURSOR_NAME="deploy-cursor-workspace.sh"
DEFAULT_ENV_NAME="env"
DEFAULT_CONTAINER_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
# Older helper script names — removed on upgrade when present.
LEGACY_NAMES=(
  "run-workflow-server.sh"
  "run-docker.sh"
  "stop-docker.sh"
  "install-docker.sh"
  "init-repo.sh"
)

INSTALL_DIR="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
# Optional separate worktree root. Prefer nested {checkout}/.worktrees/ under HOST_PROJECTS_ROOT.
# When unset, env omits HOST_WORKTREE_ROOT and start.sh binds projects root only.
HOST_WORKTREE_ROOT="${HOST_WORKTREE_ROOT:-${WORKFLOW_WORKSPACE:-}}"
HOST_PROJECTS_ROOT="${HOST_PROJECTS_ROOT:-}"
REPO_URL="${WORKFLOW_SERVER_REPO_URL:-$DEFAULT_REPO_URL}"
CORPUS_BRANCH="${WORKFLOW_SERVER_WORKFLOWS_BRANCH:-$DEFAULT_CORPUS_BRANCH}"
CORPUS_BRANCH_SET=0
if [[ -n "${WORKFLOW_SERVER_WORKFLOWS_BRANCH:-}" ]]; then
  CORPUS_BRANCH_SET=1
fi
HOST_WORKFLOWS_DIR="${HOST_WORKFLOWS_DIR:-${WORKFLOW_DIR:-}}"
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
REF="${WORKFLOW_SERVER_REF:-$DEFAULT_REF}"
CONTAINER_NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_CONTAINER_NAME}"
HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"

usage() {
  cat <<EOF
Install workflow-server under a local data dir: fetch helper scripts, place a
corpus checkout, ensure a projects root, and write a persistent env file.
Does not start Docker. This script records the corpus path and branch that
start.sh mounts and refreshes.

USAGE
  install.sh [options]

OPTIONS
  --install-dir=PATH       Install root (default: ${DEFAULT_INSTALL_DIR})
  --projects-root=PATH     Project checkouts root
                           (default: ${DEFAULT_HOST_PROJECTS_ROOT})
                           Checkouts are \$HOST_PROJECTS_ROOT/<repo>/ with nested
                           .engineering/ and .worktrees/<slug>/
  --worktree-root=PATH     Optional separate feature-tree root. Prefer nested
                           .worktrees/ under each checkout. When unset, omitted
                           from env (start.sh mounts projects root only).
  --workflows-dir=PATH     Corpus checkout (default: \$INSTALL/workflows).
                           An existing tree is used as-is; otherwise cloned.
  --corpus-dir=PATH        Same as --workflows-dir
  --repo-url=URL           Git remote for the corpus (default: GitHub m2ux)
  --corpus-url=URL         Same as --repo-url
  --corpus-branch=NAME     Branch to clone and refresh (default: ${DEFAULT_CORPUS_BRANCH})
  --workflows-branch=NAME  Same as --corpus-branch
  --ref=REF                Branch/tag for start/stop/update raw URLs (default: ${DEFAULT_REF})
  --name=NAME              Container name persisted for start/stop (default: ${DEFAULT_CONTAINER_NAME})
  --host-port=N            Host port persisted for start (default: ${DEFAULT_HOST_PORT})
  -h, --help

LAYOUT
  \$INSTALL/
    ${DEFAULT_START_NAME}
    ${DEFAULT_STOP_NAME}
    ${DEFAULT_UPDATE_NAME}
    ${DEFAULT_DEPLOY_CURSOR_NAME}    # copied from the workspace checkout
    ${DEFAULT_ENV_NAME}               # HOST_PROJECTS_ROOT + corpus path / branch
    workflows/               # default corpus checkout
    state/                   # durable HMAC key (mounted by start.sh)

  ./workflow-server/                  # branch workspace, in the current directory
    rules/ skills/ scripts/ config/   # committed kickoff
    .cursor/rules/*.mdc               # committed links at ../../rules/<name>.md
    components/main/                  # worktree of main
    components/workflows/             # worktree of workflows
    engineering/                      # worktree of engineering
    .worktrees/<slug>/                # feature worktrees (gitignored)

  The kickoff links are part of the branch. Install renders
  .claude/settings.json and .codex/config.toml into that checkout.

AFTER INSTALL
  \$INSTALL/${DEFAULT_START_NAME} -d
  \$INSTALL/${DEFAULT_STOP_NAME}
  \$INSTALL/${DEFAULT_UPDATE_NAME}
  \$INSTALL/${DEFAULT_DEPLOY_CURSOR_NAME} REPO_NAME
  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${DEFAULT_HOST_PORT}/mcp
  curl -fsS http://127.0.0.1:${DEFAULT_HOST_PORT}/health
  curl -fsS http://127.0.0.1:${DEFAULT_HOST_PORT}/ready   # sessionKeyWritable + corpusServes: true
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

is_git_checkout() {
  local dest="$1"
  { [[ -d "${dest}/.git" ]] || [[ -f "${dest}/.git" ]]; } \
    && git -C "${dest}" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

fetch_script() {
  local dest="$1" url="$2" label="$3"
  echo "Fetching ${label} → ${dest}"
  curl -fsSL -o "$dest" "$url"
  chmod +x "$dest"
}

# Branch workspace is the kickoff. Clone it as ./workflow-server in the
# directory this script was started from. A directory that is some other
# branch stops the script.
ensure_workspace_checkout() {
  local branch
  if is_git_checkout "$CHECKOUT_DIR"; then
    branch="$(git -C "$CHECKOUT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo detached)"
    [[ "$branch" == "$DEFAULT_WORKSPACE_BRANCH" ]] \
      || die "${CHECKOUT_DIR} is ${branch}, not ${DEFAULT_WORKSPACE_BRANCH}"
    echo "Workspace checkout already present: ${CHECKOUT_DIR}"
  elif [[ -e "$CHECKOUT_DIR" ]]; then
    die "${CHECKOUT_DIR} exists and is not a git checkout"
  else
    echo "Cloning ${REPO_URL} (${DEFAULT_WORKSPACE_BRANCH}) → ${CHECKOUT_DIR}"
    git clone -b "$DEFAULT_WORKSPACE_BRANCH" "$REPO_URL" "$CHECKOUT_DIR" \
      || die "failed to clone ${DEFAULT_WORKSPACE_BRANCH}"
  fi
}

# main, workflows, and engineering are worktrees. They are not files in the
# workspace commit. Add each one when its path is absent.
ensure_worktree() {
  local branch="$1" dest="$2"
  if is_git_checkout "$dest"; then
    echo "Worktree already present: ${dest}"
    return
  fi
  if [[ -e "$dest" ]]; then
    die "${dest} exists and is not a git checkout"
  fi
  echo "Adding worktree ${branch} → ${dest}"
  git -C "$CHECKOUT_DIR" worktree add -b "$branch" "$dest" "origin/${branch}" \
    || die "failed to add worktree ${branch}"
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
    --projects-root=*)
      HOST_PROJECTS_ROOT="${1#*=}"
      shift
      ;;
    --projects-root)
      HOST_PROJECTS_ROOT="${2:?}"
      shift 2
      ;;
    --repo-url=*|--corpus-url=*)
      REPO_URL="${1#*=}"
      shift
      ;;
    --repo-url|--corpus-url)
      REPO_URL="${2:?}"
      shift 2
      ;;
    --workflows-dir=*|--corpus-dir=*)
      HOST_WORKFLOWS_DIR="${1#*=}"
      shift
      ;;
    --workflows-dir|--corpus-dir)
      HOST_WORKFLOWS_DIR="${2:?}"
      shift 2
      ;;
    --corpus-branch=*|--workflows-branch=*)
      CORPUS_BRANCH="${1#*=}"
      CORPUS_BRANCH_SET=1
      shift
      ;;
    --corpus-branch|--workflows-branch)
      CORPUS_BRANCH="${2:?}"
      CORPUS_BRANCH_SET=1
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
if [[ -z "$HOST_PROJECTS_ROOT" ]]; then
  HOST_PROJECTS_ROOT="${DEFAULT_HOST_PROJECTS_ROOT}"
fi
HOST_PROJECTS_ROOT=$(abs_path "$HOST_PROJECTS_ROOT")
# When explicitly set, keep a separate global worktree root.
# Nested .worktrees/ under HOST_PROJECTS_ROOT is the preferred model.
if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
  HOST_WORKTREE_ROOT=$(abs_path "$HOST_WORKTREE_ROOT")
fi

START_PATH="${INSTALL_DIR}/${DEFAULT_START_NAME}"
STOP_PATH="${INSTALL_DIR}/${DEFAULT_STOP_NAME}"
UPDATE_PATH="${INSTALL_DIR}/${DEFAULT_UPDATE_NAME}"
DEPLOY_CURSOR_PATH="${INSTALL_DIR}/${DEFAULT_DEPLOY_CURSOR_NAME}"
ENV_PATH="${INSTALL_DIR}/${DEFAULT_ENV_NAME}"
if [[ -z "$HOST_WORKFLOWS_DIR" ]]; then
  HOST_WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
fi
HOST_WORKFLOWS_DIR=$(abs_path "$HOST_WORKFLOWS_DIR")
WORKFLOWS_DIR="$HOST_WORKFLOWS_DIR"
START_URL="${RAW_BASE}/${REF}/scripts/start.sh"
STOP_URL="${RAW_BASE}/${REF}/scripts/stop.sh"
UPDATE_URL="${RAW_BASE}/${REF}/scripts/update-workflows.sh"

# ./workflow-server is relative to the directory the script is started from.
RUN_ROOT="$(pwd)"
CHECKOUT_DIR="${RUN_ROOT}/${DEFAULT_CHECKOUT_NAME}"

echo "Install dir: ${INSTALL_DIR}"
echo "Workspace checkout: ${CHECKOUT_DIR}"
mkdir -p "$INSTALL_DIR"
STATE_DIR="${INSTALL_DIR}/state"
ensure_dir "$STATE_DIR" "state dir (HMAC key)"

ensure_dir "$HOST_PROJECTS_ROOT" "projects root"
if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
  ensure_dir "$HOST_WORKTREE_ROOT" "worktrees root"
fi

ensure_workspace_checkout
mkdir -p "${CHECKOUT_DIR}/components"
ensure_worktree main "${CHECKOUT_DIR}/components/main"
ensure_worktree workflows "${CHECKOUT_DIR}/components/workflows"
ensure_worktree engineering "${CHECKOUT_DIR}/engineering"
if [[ ! -d "${CHECKOUT_DIR}/.worktrees" ]]; then
  echo "Creating feature worktrees dir → ${CHECKOUT_DIR}/.worktrees"
  mkdir -p "${CHECKOUT_DIR}/.worktrees"
fi
[[ -f "${CHECKOUT_DIR}/scripts/bump.sh" ]] \
  || die "bump.sh missing: ${CHECKOUT_DIR}/scripts/bump.sh"
echo "Making bump.sh executable → ${CHECKOUT_DIR}/scripts/bump.sh"
chmod +x "${CHECKOUT_DIR}/scripts/bump.sh"

fetch_script "$START_PATH" "$START_URL" "start"
fetch_script "$STOP_PATH" "$STOP_URL" "stop"
fetch_script "$UPDATE_PATH" "$UPDATE_URL" "update-workflows"
echo "Copying deploy-cursor-workspace from the checkout → ${DEPLOY_CURSOR_PATH}"
cp -a "${CHECKOUT_DIR}/scripts/deploy-cursor-workspace.sh" "$DEPLOY_CURSOR_PATH"
chmod +x "$DEPLOY_CURSOR_PATH"
if [[ -d "${INSTALL_DIR}/scripts/claude" ]]; then
  echo "Removing ${INSTALL_DIR}/scripts/claude"
  rm -rf "${INSTALL_DIR}/scripts/claude"
fi

# Committed kickoff links stay. This writes .claude/settings.json and
# .codex/config.toml into the checkout.
echo "Rendering machine-local Claude settings and Codex config"
"${CHECKOUT_DIR}/scripts/deploy-cursor-workspace.sh" workflow-server

for legacy in "${LEGACY_NAMES[@]}"; do
  legacy_path="${INSTALL_DIR}/${legacy}"
  if [[ -e "$legacy_path" ]]; then
    echo "Removing old script → ${legacy_path}"
    rm -f "$legacy_path"
  fi
done

if is_git_checkout "$WORKFLOWS_DIR"; then
  current_branch=$(git -C "$WORKFLOWS_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo detached)
  if [[ "$CORPUS_BRANCH_SET" -eq 0 && "$current_branch" != "HEAD" && "$current_branch" != "detached" ]]; then
    CORPUS_BRANCH="$current_branch"
  fi
  echo "Corpus already present: ${WORKFLOWS_DIR} (${current_branch})"
elif [[ -d "$WORKFLOWS_DIR" ]]; then
  echo "Corpus directory (not a git checkout): ${WORKFLOWS_DIR}"
elif [[ -e "$WORKFLOWS_DIR" ]]; then
  die "${WORKFLOWS_DIR} exists and is not a directory"
else
  echo "Cloning corpus ${REPO_URL} (${CORPUS_BRANCH}) → ${WORKFLOWS_DIR}"
  git clone -b "$CORPUS_BRANCH" --single-branch "$REPO_URL" "$WORKFLOWS_DIR"
fi

# Persistent config for start.sh / stop.sh (no path args needed at runtime).
# Feature trees: $HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/
# HOST_WORKTREE_ROOT is only written when explicitly set.
{
  cat <<EOF
# Generated by install.sh — used by start.sh / stop.sh
# Edit and re-run start, or re-run install with new flags.
# Feature worktrees: \$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/
HOST_PROJECTS_ROOT=${HOST_PROJECTS_ROOT}
HOST_WORKFLOWS_DIR=${HOST_WORKFLOWS_DIR}
HOST_PORT=${HOST_PORT}
WORKFLOW_SERVER_CONTAINER_NAME=${CONTAINER_NAME}
WORKFLOW_SERVER_INSTALL_DIR=${INSTALL_DIR}
WORKFLOW_SERVER_REPO_URL=${REPO_URL}
WORKFLOW_SERVER_WORKFLOWS_BRANCH=${CORPUS_BRANCH}
EOF
  if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
    echo "HOST_WORKTREE_ROOT=${HOST_WORKTREE_ROOT}"
  fi
} >"$ENV_PATH"
echo "Wrote env → ${ENV_PATH}"

echo
echo "Install complete."
echo "  Install dir  : ${INSTALL_DIR}"
echo "  Corpus       : ${WORKFLOWS_DIR}  (branch ${CORPUS_BRANCH})"
echo "  Workspace    : ${CHECKOUT_DIR}  (branch ${DEFAULT_WORKSPACE_BRANCH})"
echo "  Projects     : ${HOST_PROJECTS_ROOT}"
if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
  echo "  Worktrees    : ${HOST_WORKTREE_ROOT}"
else
  echo "  Worktrees    : ${CHECKOUT_DIR}/.worktrees/"
fi
echo "  State        : ${STATE_DIR}  (HMAC key; mounted by start.sh)"
echo "  Env          : ${ENV_PATH}"
echo
echo "Kickoff files and tool links come from the workspace branch."
echo "Machine-local files are .claude/settings.json and .codex/config.toml in the checkout."
echo
echo "Start / stop (paths come from env — no flags required):"
echo "  ${START_PATH} -d"
echo "  ${STOP_PATH}"
echo
echo "Update workflows later with:"
echo "  ${UPDATE_PATH}"
echo
echo "Other product repos still render a kickoff with:"
echo "  ${DEPLOY_CURSOR_PATH} REPO_NAME"
echo
echo "Then:"
echo "  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${HOST_PORT}/mcp"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/health"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/ready   # must include sessionKeyWritable and corpusServes: true"
