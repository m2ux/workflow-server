#!/usr/bin/env bash
# Update agent submodules (workflows and/or metadata)
#
# Usage: ./agent/resources/scripts/update.sh [options]
#   or:  cd agent/resources && ./scripts/update.sh [options]
#
# Options:
#   --workflows     Update only agent/workflows
#   --metadata      Update only agent/metadata
#   --project NAME  Project name for metadata sparse checkout (default: parent repo name)
#   --help          Show this help
#
# With no options, updates both workflows and metadata.

set -e

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESOURCES_DIR="$(dirname "$SCRIPT_DIR")"
AGENT_DIR="$(dirname "$RESOURCES_DIR")"
ENGINEERING_ROOT="$(dirname "$AGENT_DIR")"

WORKFLOWS_DIR="$AGENT_DIR/workflows"
METADATA_DIR="$AGENT_DIR/metadata"

# =============================================================================
# Argument Parsing
# =============================================================================

UPDATE_WORKFLOWS=false
UPDATE_METADATA=false
PROJECT_NAME=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --workflows)
            UPDATE_WORKFLOWS=true
            shift
            ;;
        --metadata)
            UPDATE_METADATA=true
            shift
            ;;
        --project)
            PROJECT_NAME="$2"
            shift 2
            ;;
        --help|-h)
            head -14 "$0" | tail -12
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Default: update both if no specific option given
if [ "$UPDATE_WORKFLOWS" = false ] && [ "$UPDATE_METADATA" = false ]; then
    UPDATE_WORKFLOWS=true
    UPDATE_METADATA=true
fi

# Default project name from parent directory
if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME="$(basename "$(dirname "$ENGINEERING_ROOT")")"
fi

# =============================================================================
# Update Functions
# =============================================================================

WORKFLOWS_COMMIT=""
METADATA_COMMIT=""

update_workflows() {
    echo "=== Updating agent/workflows ==="
    
    if [ ! -d "$WORKFLOWS_DIR" ]; then
        echo "⚠ Workflows directory not found at $WORKFLOWS_DIR"
        echo "  Skipping workflows update"
        return 1
    fi
    
    cd "$WORKFLOWS_DIR"
    
    echo "Fetching latest changes..."
    git fetch origin --quiet 2>/dev/null || true
    
    echo "Checking out workflows branch..."
    git checkout workflows --quiet 2>/dev/null || true
    
    echo "Pulling latest changes..."
    if git pull origin workflows --quiet; then
        WORKFLOWS_COMMIT=$(git rev-parse --short HEAD)
        echo "✓ Updated to $WORKFLOWS_COMMIT"
        
        cd "$ENGINEERING_ROOT"
        if [ -d .git ] || [ -f .git ]; then
            git add agent/workflows 2>/dev/null || true
        fi
        return 0
    else
        echo "⚠ Failed to pull workflows"
        return 1
    fi
}

update_metadata() {
    echo "=== Updating agent/metadata ==="
    
    cd "$ENGINEERING_ROOT"
    
    # Initialize submodule if not already done
    if [ ! -d "$METADATA_DIR/.git" ] && [ ! -f "$METADATA_DIR/.git" ]; then
        echo "Initializing submodule..."
        if ! git submodule update --init agent/metadata 2>&1; then
            echo "⚠ Failed to initialize agent/metadata submodule"
            echo "  This is expected if you don't have access to the private repository."
            return 1
        fi
    fi
    
    cd "$METADATA_DIR"
    
    # Setup sparse checkout if not already configured
    GIT_DIR=$(git rev-parse --git-dir)
    if [ ! -f "$GIT_DIR/info/sparse-checkout" ]; then
        echo "Configuring sparse checkout for projects/$PROJECT_NAME..."
        git sparse-checkout init --cone
        git sparse-checkout set "projects/$PROJECT_NAME"
    fi
    
    echo "Fetching latest from master..."
    git fetch origin master
    
    echo "Checking out master..."
    git checkout master 2>/dev/null || git checkout -b master origin/master
    
    echo "Pulling latest changes..."
    if git pull origin master; then
        METADATA_COMMIT=$(git rev-parse --short HEAD)
        echo "✓ Updated to $METADATA_COMMIT (sparse: projects/$PROJECT_NAME)"
        
        cd "$ENGINEERING_ROOT"
        git add agent/metadata 2>/dev/null || true
        return 0
    else
        echo "⚠ Failed to pull metadata"
        return 1
    fi
}

# =============================================================================
# Main
# =============================================================================

echo "Project: $PROJECT_NAME"
echo ""

UPDATED=()

if [ "$UPDATE_WORKFLOWS" = true ]; then
    if update_workflows; then
        UPDATED+=("workflows@$WORKFLOWS_COMMIT")
    fi
    echo ""
fi

if [ "$UPDATE_METADATA" = true ]; then
    if update_metadata; then
        UPDATED+=("metadata@$METADATA_COMMIT")
    fi
    echo ""
fi

# Summary
if [ ${#UPDATED[@]} -gt 0 ]; then
    echo "=== Summary ==="
    for item in "${UPDATED[@]}"; do
        echo "  ✓ $item"
    done
    echo ""
    
    # Build commit message
    if [ ${#UPDATED[@]} -eq 1 ]; then
        COMMIT_MSG="chore: update ${UPDATED[0]}"
    else
        COMMIT_MSG="chore: update $(IFS=', '; echo "${UPDATED[*]}")"
    fi
    
    echo "Run the following to commit:"
    echo "  git commit -m \"$COMMIT_MSG\""
else
    echo "No updates applied."
fi
