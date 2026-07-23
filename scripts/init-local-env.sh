#!/usr/bin/env bash
# Create or refresh a local `.env` with absolute paths for this checkout.
# Safe to re-run: preserves unknown keys; overwrites known path keys with
# values derived from the repo root (and optional flags).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
EXAMPLE="${ROOT}/.env.example"

# Default worktree root is shared with the agent (~/worktrees), not the server
# checkout. Override with --workspace=PATH or WORKFLOW_WORKSPACE.
WORKSPACE_DEFAULT="${WORKFLOW_WORKSPACE:-${HOME}/worktrees}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

  --workspace=PATH   Worktree / workspace root (default: ~/worktrees)
                     Sets WORKFLOW_WORKSPACE / HOST_WORKTREE_ROOT
  --force            Overwrite an existing .env from .env.example first
  -h, --help         Show this help

Writes ${ENV_FILE} with absolute paths for the HTTP server, mcp-remote URL, and docker compose.
EOF
}

FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --workspace=*) WORKSPACE_DEFAULT="${1#*=}"; shift ;;
    --workspace) WORKSPACE_DEFAULT="${2:?}"; shift 2 ;;
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

WORKFLOWS_ABS="${ROOT}/workflows"
SCHEMAS_ABS="${ROOT}/schemas"
WORKSPACE_ABS="$(cd "${WORKSPACE_DEFAULT}" && pwd)"

upsert WORKFLOW_SERVER_MCP_URL "http://127.0.0.1:3000/mcp"
upsert WORKFLOW_WORKSPACE "${WORKSPACE_ABS}"
upsert WORKFLOW_DIR "${WORKFLOWS_ABS}"
upsert SCHEMAS_DIR "${SCHEMAS_ABS}"
upsert HOST_WORKTREE_ROOT "${WORKSPACE_ABS}"
upsert HOST_WORKFLOWS_DIR "${WORKFLOWS_ABS}"
upsert HOST_SCHEMAS_DIR "${SCHEMAS_ABS}"
upsert HOST_PORT "3000"
upsert CONTAINER_WORKTREE_ROOT "/worktrees"
upsert CONTAINER_WORKFLOW_DIR "/app/workflows"
upsert CONTAINER_SCHEMAS_DIR "/app/schemas"
upsert TRANSPORT "http"
upsert HOST "0.0.0.0"
upsert PORT "3000"

# Optional concept-rag defaults if the conventional paths exist.
if [[ -z "${CONCEPT_RAG_ENTRY:-}" && -f "${HOME}/projects/main/concept-rag/dist/conceptual_index.js" ]]; then
  upsert CONCEPT_RAG_ENTRY "${HOME}/projects/main/concept-rag/dist/conceptual_index.js"
fi
if [[ -z "${CONCEPT_RAG_INDEX:-}" && -d "${HOME}/.concept_rag" ]]; then
  upsert CONCEPT_RAG_INDEX "${HOME}/.concept_rag"
fi

echo "Wrote local env → ${ENV_FILE}"
echo "  WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp"
echo "  WORKFLOW_WORKSPACE=${WORKSPACE_ABS}"
echo "  WORKFLOW_DIR=${WORKFLOWS_ABS}"
echo "  SCHEMAS_DIR=${SCHEMAS_ABS}"
echo "  HOST_WORKTREE_ROOT=${WORKSPACE_ABS}"
echo
echo "Next:"
echo "  1. set -a && source .env && set +a   # export into shell / Cursor launch env"
echo "  2. Start HTTP server: docker compose up --build   # or npm run start:http"
echo "  3. Restart Cursor so \${env:WORKFLOW_SERVER_MCP_URL} resolves"
echo "  4. Ask the agent to list available workflows"
