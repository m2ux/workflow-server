#!/usr/bin/env bash
set -e
VERSION="${1:-}"
cd "$(dirname "$0")/../agent/resources"
git fetch --tags --quiet 2>/dev/null || true
[ -z "$VERSION" ] && { echo "Usage: $0 <version>"; git tag -l 'v*' | sort -V; exit 1; }
git checkout "$VERSION" --quiet
echo "Updated to $VERSION"
