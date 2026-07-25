#!/usr/bin/env bash
# Deprecated name for install.sh — kept so old curl|bash one-liners keep working.
#
#   Prefer:  …/scripts/install.sh
#   Legacy:  …/scripts/install-docker.sh  (this file)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${SCRIPT_DIR}/install.sh" ]]; then
  exec bash "${SCRIPT_DIR}/install.sh" "$@"
fi

# curl|bash path: BASH_SOURCE is often /dev/fd/* with no sibling install.sh.
DEFAULT_RAW_BASE="https://raw.githubusercontent.com/m2ux/workflow-server"
REF="${WORKFLOW_SERVER_REF:-main}"
RAW_BASE="${WORKFLOW_SERVER_RAW_BASE:-$DEFAULT_RAW_BASE}"
echo "note: install-docker.sh is deprecated; forwarding to install.sh" >&2
exec bash <(curl -fsSL "${RAW_BASE}/${REF}/scripts/install.sh") "$@"
