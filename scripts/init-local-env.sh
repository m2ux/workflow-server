#!/usr/bin/env bash
# Create or refresh a local `.env` with absolute paths for this checkout.
# Safe to re-run: preserves unknown keys; overwrites known path keys with
# values derived from the repo root (and optional flags).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
EXAMPLE="${ROOT}/.env.example"

# Default worktree root: parent of the repo if it looks like a work area,
# otherwise the repo itself. Override with --workspace=PATH.
WORKSPACE_DEFAULT="${WORKFLOW_WORKSPACE:-}"
if [[ -z "${WORKSPACE_DEFAULT}" ]]; then
  parent="$(dirname "${ROOT}")"
  if [[ "$(basename "${parent}")" == "main" ]] && [[ -d "$(dirname "${parent}")/work" ]]; then
    WORKSPACE_DEFAULT="$(cd "$(dirname "${parent}")/work" && pwd)"
  else
    WORKSPACE_DEFAULT="${ROOT}"
  fi
fi

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

  --workspace=PATH   Worktree / workspace root (WORKFLOW_WORKSPACE / HOST_WORKTREE_ROOT)
  --force            Overwrite an existing .env from .env.example first
  -h, --help         Show this help

Writes ${ENV_FILE} with absolute paths for MCP stdio and docker compose.
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
echo "  WORKFLOW_WORKSPACE=${WORKSPACE_ABS}"
echo "  WORKFLOW_DIR=${WORKFLOWS_ABS}"
echo "  SCHEMAS_DIR=${SCHEMAS_ABS}"
echo "  HOST_WORKTREE_ROOT=${WORKSPACE_ABS}"
echo
echo "Next:"
echo "  1. npm run build"
echo "  2. Restart Cursor / Claude so MCP reloads envFile"
echo "  3. (optional) docker compose up --build"
echo "  4. Ask the agent to list available workflows"
