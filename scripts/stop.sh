#!/usr/bin/env bash
# workflow-server — stop the GHCR container started by start.sh
#
# After install:
#   ~/.local/share/workflow-server/stop.sh
#
# Loads $INSTALL/env for the container name when present.
#
# Needs: docker
set -euo pipefail

DEFAULT_NAME="workflow-server"
DEFAULT_ENV_NAME="env"
DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

load_install_env() {
  local f
  for f in \
    "${WORKFLOW_SERVER_ENV_FILE:-}" \
    "${SCRIPT_DIR}/${DEFAULT_ENV_NAME}" \
    "${DEFAULT_INSTALL_DIR}/${DEFAULT_ENV_NAME}"
  do
    [[ -n "$f" && -f "$f" ]] || continue
    # shellcheck disable=SC1090
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
    return 0
  done
}

load_install_env

NAME="${WORKFLOW_SERVER_CONTAINER_NAME:-$DEFAULT_NAME}"
DRY_RUN=0
FORCE=1

usage() {
  cat <<EOF
Stop (and remove) the workflow-server Docker container.

USAGE
  stop.sh [options]

OPTIONS
  --name=NAME   Container name (default from install env, else ${DEFAULT_NAME})
  --dry-run     Print docker commands only
  -h, --help
EOF
}

die() { echo "error: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --name=*) NAME="${1#*=}"; shift ;;
    --name) NAME="${2:?}"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --no-rm) FORCE=0; shift ;;
    -*) die "unknown option: $1 (see --help)" ;;
    *) die "unexpected argument: $1 (see --help)" ;;
  esac
done

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"

if [[ "$DRY_RUN" -eq 1 ]]; then
  if [[ "$FORCE" -eq 1 ]]; then
    echo "+ docker rm -f ${NAME}   # if exists"
  else
    echo "+ docker stop ${NAME}   # if running"
  fi
  exit 0
fi

if ! docker container inspect "$NAME" >/dev/null 2>&1; then
  echo "No container named '${NAME}'."
  exit 0
fi

if [[ "$FORCE" -eq 1 ]]; then
  echo "Stopping and removing '${NAME}' ..."
  docker rm -f "$NAME" >/dev/null
  echo "Stopped '${NAME}'."
else
  echo "Stopping '${NAME}' ..."
  docker stop "$NAME" >/dev/null
  echo "Stopped '${NAME}' (container left in place; use default stop to remove)."
fi
