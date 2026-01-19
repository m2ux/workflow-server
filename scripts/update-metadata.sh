#!/usr/bin/env bash
set -e
echo "Pulling latest changes..."
cd "$(dirname "$0")/.."
git pull origin HEAD
echo "Updated to latest"
