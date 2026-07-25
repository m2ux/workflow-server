#!/usr/bin/env bash
# Create or refresh a local `.env` with absolute paths for this checkout.
# Safe to re-run: preserves unknown keys; overwrites known path keys with
# values derived from the install layout (and optional flags).
#
# Defaults match scripts/install.sh + start.sh:
#   $HOST_PROJECTS_ROOT/<repo>/ + nested .engineering + .worktrees
#   $INSTALL/{state,workflows}
#   container targets under /var/lib/workflow-server/...
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
EXAMPLE="${ROOT}/.env.example"

DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
INSTALL_DEFAULT="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
WORKTREE_DEFAULT="${HOST_WORKTREE_ROOT:-${WORKFLOW_WORKSPACE:-${WORKTREE_ROOT:-}}}"
PROJECTS_DEFAULT="${HOST_PROJECTS_ROOT:-${WORKFLOW_SERVER_ENGINEERING_DIR:-}}"
REPO_DEFAULT="${WORKFLOW_SERVER_REPO:-}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

  --install-dir=PATH     Install root (default: ${DEFAULT_INSTALL_DIR})
  --worktree-root=PATH   Optional separate worktrees root (default: same as
                         projects root — nested <repo>/.worktrees/)
  --projects-root=PATH   Projects multi-root (default: \$HOST_PROJECTS_ROOT
                         or ~/projects/dev). Checkouts are <repo>/ basename.
  --repo=owner/repo      Optional WORKFLOW_SERVER_REPO for a pinned checkout
  --force                Overwrite an existing .env from .env.example first
  -h, --help             Show this help

Writes ${ENV_FILE} with absolute paths for the HTTP server, mcp-remote URL, and docker compose.
EOF
}

FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --install-dir=*) INSTALL_DEFAULT="${1#*=}"; shift ;;
    --install-dir) INSTALL_DEFAULT="${2:?}"; shift 2 ;;
    --worktree-root=*) WORKTREE_DEFAULT="${1#*=}"; shift ;;
    --worktree-root) WORKTREE_DEFAULT="${2:?}"; shift 2 ;;
    --projects-root=*) PROJECTS_DEFAULT="${1#*=}"; shift ;;
    --projects-root) PROJECTS_DEFAULT="${2:?}"; shift 2 ;;
    --repo=*) REPO_DEFAULT="${1#*=}"; shift ;;
    --repo) REPO_DEFAULT="${2:?}"; shift 2 ;;
    --force) FORCE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ ! -f "${EXAMPLE}" ]]; then
  echo "Missing ${EXAMPLE}" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" || "${FORCE}" -eq 1 ]]; then
  cp "${EXAMPLE}" "${ENV_FILE}"
  echo "Seeded ${ENV_FILE} from .env.example"
fi

# Upsert KEY=value in .env (replace existing assignment or append).
upsert() {
  local key="$1" value="$2"
  local tmp
  tmp="$(mktemp)"
  if grep -qE "^${key}=" "${ENV_FILE}"; then
    # shellcheck disable=SC2016
    awk -v k="${key}" -v v="${value}" '
      BEGIN { done=0 }
      $0 ~ "^" k "=" { print k "=" v; done=1; next }
      { print }
      END { if (!done) print k "=" v }
    ' "${ENV_FILE}" >"${tmp}"
  else
    cat "${ENV_FILE}" >"${tmp}"
    printf '%s=%s\n' "${key}" "${value}" >>"${tmp}"
  fi
  mv "${tmp}" "${ENV_FILE}"
}

expand_path() {
  local p="$1"
  p="${p/#\~/$HOME}"
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$p"
  else
    echo "$p"
  fi
}

ensure_dir() {
  local path="$1" label="$2"
  if [[ ! -d "$path" ]]; then
    echo "Creating ${label}: ${path}"
    mkdir -p "$path"
  fi
}

INSTALL_DEFAULT="$(expand_path "$INSTALL_DEFAULT")"
if [[ -z "$PROJECTS_DEFAULT" ]]; then
  PROJECTS_DEFAULT="${HOME}/projects/dev"
fi
PROJECTS_DEFAULT="$(expand_path "$PROJECTS_DEFAULT")"
# Nested .worktrees under projects root; do not default to $INSTALL/worktrees.
if [[ -z "$WORKTREE_DEFAULT" ]]; then
  WORKTREE_DEFAULT="${PROJECTS_DEFAULT}"
fi
WORKTREE_DEFAULT="$(expand_path "$WORKTREE_DEFAULT")"
STATE_DIR="${INSTALL_DEFAULT}/state"

# Prefer checkout workflows/schemas when present (dev compose from repo root).
if [[ -d "${ROOT}/workflows" ]]; then
  WORKFLOWS_ABS="${ROOT}/workflows"
else
  WORKFLOWS_ABS="${INSTALL_DEFAULT}/workflows"
fi
if [[ -d "${ROOT}/schemas" ]]; then
  SCHEMAS_ABS="${ROOT}/schemas"
else
  SCHEMAS_ABS="${ROOT}/schemas"
fi

ensure_dir "$INSTALL_DEFAULT" "install dir"
ensure_dir "$PROJECTS_DEFAULT" "projects root"
if [[ "$WORKTREE_DEFAULT" != "$PROJECTS_DEFAULT" ]]; then
  ensure_dir "$WORKTREE_DEFAULT" "worktrees root"
fi
ensure_dir "$STATE_DIR" "state dir (HMAC key)"

upsert WORKFLOW_SERVER_MCP_URL "http://127.0.0.1:3000/mcp"
upsert WORKFLOW_SERVER_INSTALL_DIR "${INSTALL_DEFAULT}"
upsert WORKFLOW_WORKSPACE "${WORKTREE_DEFAULT}"
upsert WORKTREE_ROOT "${WORKTREE_DEFAULT}"
upsert WORKFLOW_SERVER_ENGINEERING_DIR "${PROJECTS_DEFAULT}"
upsert WORKFLOW_DIR "${WORKFLOWS_ABS}"
upsert SCHEMAS_DIR "${SCHEMAS_ABS}"
upsert HOST_PROJECTS_ROOT "${PROJECTS_DEFAULT}"
if [[ "$WORKTREE_DEFAULT" != "$PROJECTS_DEFAULT" ]]; then
  upsert HOST_WORKTREE_ROOT "${WORKTREE_DEFAULT}"
fi
upsert HOST_STATE_DIR "${STATE_DIR}"
upsert HOST_WORKFLOWS_DIR "${WORKFLOWS_ABS}"
upsert HOST_SCHEMAS_DIR "${SCHEMAS_ABS}"
upsert HOST_PORT "3000"
upsert CONTAINER_INSTALL_DIR "/var/lib/workflow-server"
# Nested model: workspace multi-root coincides with projects multi-root
if [[ "$WORKTREE_DEFAULT" == "$PROJECTS_DEFAULT" ]]; then
  upsert CONTAINER_WORKTREE_ROOT "/var/lib/workflow-server/projects"
else
  upsert CONTAINER_WORKTREE_ROOT "/var/lib/workflow-server/worktrees"
  upsert HOST_WORKTREE_ROOT "${WORKTREE_DEFAULT}"
fi
upsert CONTAINER_PROJECTS_ROOT "/var/lib/workflow-server/projects"
upsert CONTAINER_ENGINEERING_ROOT "/var/lib/workflow-server/projects"
upsert CONTAINER_STATE_DIR "/var/lib/workflow-server/state"
upsert CONTAINER_WORKFLOW_DIR "/app/workflows"
upsert CONTAINER_SCHEMAS_DIR "/app/schemas"
upsert WORKFLOW_SERVER_KEY_DIR "/var/lib/workflow-server/state"
upsert TRANSPORT "http"
upsert HOST "0.0.0.0"
upsert PORT "3000"

if [[ -n "$REPO_DEFAULT" ]]; then
  upsert WORKFLOW_SERVER_REPO "${REPO_DEFAULT}"
fi

# Optional concept-rag defaults if the conventional paths exist.
if [[ -z "${CONCEPT_RAG_ENTRY:-}" && -f "${HOME}/projects/main/concept-rag/dist/conceptual_index.js" ]]; then
  upsert CONCEPT_RAG_ENTRY "${HOME}/projects/main/concept-rag/dist/conceptual_index.js"
fi
if [[ -z "${CONCEPT_RAG_INDEX:-}" && -d "${HOME}/.concept_rag" ]]; then
  upsert CONCEPT_RAG_INDEX "${HOME}/.concept_rag"
fi

echo "Wrote local env → ${ENV_FILE}"
echo "  WORKFLOW_SERVER_INSTALL_DIR=${INSTALL_DEFAULT}"
echo "  HOST_PROJECTS_ROOT=${PROJECTS_DEFAULT}"
if [[ "$WORKTREE_DEFAULT" == "$PROJECTS_DEFAULT" ]]; then
  echo "  worktrees: nested under HOST_PROJECTS_ROOT/<repo>/.worktrees/"
else
  echo "  HOST_WORKTREE_ROOT=${WORKTREE_DEFAULT}"
fi
echo "  HOST_STATE_DIR=${STATE_DIR}"
echo "  WORKFLOW_DIR=${WORKFLOWS_ABS}"
if [[ -n "$REPO_DEFAULT" ]]; then
  echo "  WORKFLOW_SERVER_REPO=${REPO_DEFAULT}"
fi
echo
echo "Next:"
echo "  1. set -a && source .env && set +a"
echo "  2. docker compose up --build   # or ~/.local/share/workflow-server/start.sh -d"
echo "  3. curl -fsS http://127.0.0.1:3000/ready   # sessionKeyWritable: true"
echo "  4. Restart Cursor / reload MCP; smoke with discover + start_session"
