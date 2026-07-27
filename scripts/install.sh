#!/usr/bin/env bash
# workflow-server — install local layout (does not start the container)
#
#   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
#
#   bash <(curl -fsSL …/install.sh) --worktree-root=~/projects/work
#
# Writes $INSTALL/env so start.sh needs no path args. Creates a projects root
# (default ~/projects/dev, or --projects-root / HOST_PROJECTS_ROOT). Feature
# worktrees live under each checkout's .worktrees/ (gitignored).
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
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
DEFAULT_REF="main"
DEFAULT_START_NAME="start.sh"
DEFAULT_STOP_NAME="stop.sh"
DEFAULT_UPDATE_NAME="update-workflows.sh"
DEFAULT_DEPLOY_CURSOR_NAME="deploy-cursor-workspace.sh"
DEFAULT_ENV_NAME="env"
DEFAULT_CONTAINER_NAME="workflow-server"
DEFAULT_HOST_PORT="3000"
DEFAULT_CURSOR_TEMPLATE_REL="examples/cursor-workspace"
DEFAULT_CLAUDE_SCRIPTS_REL="scripts/claude"
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
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
REF="${WORKFLOW_SERVER_REF:-$DEFAULT_REF}"
CONTAINER_NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_CONTAINER_NAME}"
HOST_PORT="${HOST_PORT:-$DEFAULT_HOST_PORT}"

usage() {
  cat <<EOF
Install workflow-server under a local data dir: fetch helper scripts, clone
workflows data, ensure a projects root, and write a persistent env file.
Does not start Docker.

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
    ${DEFAULT_DEPLOY_CURSOR_NAME}
    ${DEFAULT_CURSOR_TEMPLATE_REL}/  # template for deploy-cursor-workspace
    ${DEFAULT_CLAUDE_SCRIPTS_REL}/   # Claude hooks + sbx for Cursor workspace deploy
    ${DEFAULT_ENV_NAME}               # HOST_PROJECTS_ROOT + port / name
    workflows/               # git clone -b workflows (server definitions)
    state/                   # durable HMAC key (mounted by start.sh)

  \$HOST_PROJECTS_ROOT/               # from env; not necessarily under \$INSTALL
    <repo>/                          # YOU manage these checkouts (basename)
      .engineering/                  # after deploy.sh in that project
      .worktrees/<slug>/             # feature worktrees only (gitignored)

  Product repos are not cloned by install. Place basename checkouts under
  \$HOST_PROJECTS_ROOT yourself and run deploy.sh in each project.

AFTER INSTALL
  \$INSTALL/${DEFAULT_START_NAME} -d
  \$INSTALL/${DEFAULT_STOP_NAME}
  \$INSTALL/${DEFAULT_UPDATE_NAME}
  \$INSTALL/${DEFAULT_DEPLOY_CURSOR_NAME} REPO_NAME
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

# Install examples/cursor-workspace and scripts/claude next to deploy-cursor-workspace.sh.
# Prefer GitHub codeload tarball when using the default raw base; else sparse clone.
fetch_cursor_workspace_assets() {
  local cursor_dest="$1"
  local claude_dest="$2"
  local tmp tarball_ok=0 cursor_src="" claude_src=""
  tmp="$(mktemp -d "${TMPDIR:-/tmp}/wf-cursor-tmpl.XXXXXX")"

  echo "Fetching Cursor workspace template → ${cursor_dest}"
  echo "Fetching Claude hooks scripts → ${claude_dest}"

  if [[ "$RAW_BASE" == https://raw.githubusercontent.com/m2ux/workflow-server ]]; then
    if curl -fsSL "https://codeload.github.com/m2ux/workflow-server/tar.gz/${REF}" \
      -o "${tmp}/src.tgz" \
      && tar -xzf "${tmp}/src.tgz" -C "$tmp" 2>/dev/null; then
      cursor_src="$(find "$tmp" -type d -path '*/examples/cursor-workspace' 2>/dev/null | head -n 1 || true)"
      claude_src="$(find "$tmp" -type d -path '*/scripts/claude' 2>/dev/null | head -n 1 || true)"
      if [[ -n "$cursor_src" && -d "$cursor_src" ]]; then
        tarball_ok=1
        rm -rf "$cursor_dest"
        mkdir -p "$(dirname "$cursor_dest")"
        cp -a "$cursor_src" "$cursor_dest"
        if [[ -n "$claude_src" && -d "$claude_src" ]]; then
          rm -rf "$claude_dest"
          mkdir -p "$(dirname "$claude_dest")"
          cp -a "$claude_src" "$claude_dest"
        fi
      fi
    fi
  fi

  if [[ "$tarball_ok" -ne 1 ]]; then
    echo "  (falling back to git sparse checkout from ${REPO_URL} @ ${REF})"
    git clone -b "$REF" --depth 1 --filter=blob:none --sparse "$REPO_URL" "${tmp}/repo" \
      || { rm -rf "$tmp"; die "failed to clone for Cursor template"; }
    git -C "${tmp}/repo" sparse-checkout set examples/cursor-workspace scripts/claude \
      || { rm -rf "$tmp"; die "failed sparse-checkout cursor/claude assets"; }
    [[ -d "${tmp}/repo/examples/cursor-workspace" ]] \
      || { rm -rf "$tmp"; die "examples/cursor-workspace missing after sparse checkout"; }
    rm -rf "$cursor_dest"
    mkdir -p "$(dirname "$cursor_dest")"
    cp -a "${tmp}/repo/examples/cursor-workspace" "$cursor_dest"
    if [[ -d "${tmp}/repo/scripts/claude" ]]; then
      rm -rf "$claude_dest"
      mkdir -p "$(dirname "$claude_dest")"
      cp -a "${tmp}/repo/scripts/claude" "$claude_dest"
    fi
  fi

  rm -rf "$tmp"
  [[ -d "$cursor_dest" ]] || die "Cursor workspace template not installed: ${cursor_dest}"
  if [[ ! -d "$claude_dest" ]]; then
    echo "warning: scripts/claude not present at ${REF} (Claude hooks deploy will be skipped)" >&2
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
CURSOR_TEMPLATE_DIR="${INSTALL_DIR}/${DEFAULT_CURSOR_TEMPLATE_REL}"
CLAUDE_SCRIPTS_DIR="${INSTALL_DIR}/${DEFAULT_CLAUDE_SCRIPTS_REL}"
ENV_PATH="${INSTALL_DIR}/${DEFAULT_ENV_NAME}"
WORKFLOWS_DIR="${INSTALL_DIR}/workflows"
START_URL="${RAW_BASE}/${REF}/scripts/start.sh"
STOP_URL="${RAW_BASE}/${REF}/scripts/stop.sh"
UPDATE_URL="${RAW_BASE}/${REF}/scripts/update-workflows.sh"
DEPLOY_CURSOR_URL="${RAW_BASE}/${REF}/scripts/deploy-cursor-workspace.sh"

echo "Install dir: ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
STATE_DIR="${INSTALL_DIR}/state"
ensure_dir "$STATE_DIR" "state dir (HMAC key)"

ensure_dir "$HOST_PROJECTS_ROOT" "projects root"
if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
  ensure_dir "$HOST_WORKTREE_ROOT" "worktrees root"
fi

fetch_script "$START_PATH" "$START_URL" "start"
fetch_script "$STOP_PATH" "$STOP_URL" "stop"
fetch_script "$UPDATE_PATH" "$UPDATE_URL" "update-workflows"
fetch_script "$DEPLOY_CURSOR_PATH" "$DEPLOY_CURSOR_URL" "deploy-cursor-workspace"
fetch_cursor_workspace_assets "$CURSOR_TEMPLATE_DIR" "$CLAUDE_SCRIPTS_DIR"

for legacy in "${LEGACY_NAMES[@]}"; do
  legacy_path="${INSTALL_DIR}/${legacy}"
  if [[ -e "$legacy_path" ]]; then
    echo "Removing old script → ${legacy_path}"
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
# Feature trees: $HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/
# HOST_WORKTREE_ROOT is only written when explicitly set.
{
  cat <<EOF
# Generated by install.sh — used by start.sh / stop.sh
# Edit and re-run start, or re-run install with new flags.
# Feature worktrees: \$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/
HOST_PROJECTS_ROOT=${HOST_PROJECTS_ROOT}
HOST_PORT=${HOST_PORT}
WORKFLOW_SERVER_CONTAINER_NAME=${CONTAINER_NAME}
WORKFLOW_SERVER_INSTALL_DIR=${INSTALL_DIR}
EOF
  if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
    echo "HOST_WORKTREE_ROOT=${HOST_WORKTREE_ROOT}"
  fi
} >"$ENV_PATH"
echo "Wrote env → ${ENV_PATH}"

echo
echo "Install complete."
echo "  Install dir  : ${INSTALL_DIR}"
echo "  Workflows    : ${WORKFLOWS_DIR}"
echo "  Projects     : ${HOST_PROJECTS_ROOT}  (you manage <repo>/ checkouts here)"
if [[ -n "$HOST_WORKTREE_ROOT" ]]; then
  echo "  Worktrees    : ${HOST_WORKTREE_ROOT}"
else
  echo "  Worktrees    : nested under each checkout (.worktrees/)"
fi
echo "  State        : ${STATE_DIR}  (HMAC key; mounted by start.sh)"
echo "  Env          : ${ENV_PATH}"
echo
echo "Place product checkouts yourself under HOST_PROJECTS_ROOT (basename <repo>/)."
echo "Run deploy.sh inside each project for .engineering/."
echo
echo "Start / stop (paths come from env — no flags required):"
echo "  ${START_PATH} -d"
echo "  ${STOP_PATH}"
echo
echo "Update workflows later with:"
echo "  ${UPDATE_PATH}"
echo
echo "Deploy Cursor multi-root workspace (after a product checkout exists):"
echo "  ${DEPLOY_CURSOR_PATH} REPO_NAME"
echo "  Template: ${CURSOR_TEMPLATE_DIR}"
echo
echo "Then:"
echo "  export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:${HOST_PORT}/mcp"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/health"
echo "  curl -fsS http://127.0.0.1:${HOST_PORT}/ready   # must include sessionKeyWritable: true"
