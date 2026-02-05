#!/usr/bin/env bash
# Engineering Branch Deploy Script
#
# Deploys an engineering branch to this project. If the engineering branch
# doesn't exist, creates it first.
#
# Usage:
#   ./deploy.sh [options]
#
# Options:
#   --external-repo <url>    Use external repo for engineering branch
#   --resources-repo <url>   Custom resources repo (default: m2ux/agent-resources)
#   --metadata-repo <url>    Custom metadata repo (default: m2ux/ai-metadata)
#   --skip-metadata          Skip private metadata submodule
#   --keep                   Don't self-destruct after deployment
#   --help                   Show this help

set -e

# =============================================================================
# Configuration
# =============================================================================

DEFAULT_RESOURCES_REPO="https://github.com/m2ux/agent-resources.git"
DEFAULT_METADATA_REPO="https://github.com/m2ux/ai-metadata.git"
DEFAULT_EXTERNAL_REPO="https://github.com/m2ux/ai-metadata.git"

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="$(basename "$REPO_ROOT")"
ENGINEERING_DIR="$REPO_ROOT/.engineering"

# =============================================================================
# Argument Parsing
# =============================================================================

EXTERNAL_REPO=""
RESOURCES_REPO="$DEFAULT_RESOURCES_REPO"
METADATA_REPO="$DEFAULT_METADATA_REPO"
SKIP_METADATA=false
KEEP_SCRIPT=false
INTERACTIVE=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --external-repo)
            EXTERNAL_REPO="$2"
            INTERACTIVE=false
            shift 2
            ;;
        --internal)
            INTERACTIVE=false
            shift
            ;;
        --resources-repo)
            RESOURCES_REPO="$2"
            shift 2
            ;;
        --metadata-repo)
            METADATA_REPO="$2"
            shift 2
            ;;
        --skip-metadata)
            SKIP_METADATA=true
            shift
            ;;
        --keep)
            KEEP_SCRIPT=true
            shift
            ;;
        --help|-h)
            head -24 "$0" | tail -20
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# Helper Functions
# =============================================================================

get_latest_resources_version() {
    git ls-remote --tags --refs "$RESOURCES_REPO" 2>/dev/null | \
        grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+$' | \
        sort -V | tail -1 || echo "main"
}

create_engineering_structure() {
    local target_dir="$1"
    
    echo "  Creating directory structure..."
    
    # Create all directories (mkdir -p is idempotent)
    mkdir -p "$target_dir/artifacts/adr"
    mkdir -p "$target_dir/artifacts/planning"
    mkdir -p "$target_dir/artifacts/reviews"
    mkdir -p "$target_dir/artifacts/templates"
    mkdir -p "$target_dir/agent"
    mkdir -p "$target_dir/scripts"
    
    # Create files only if they don't exist
    if [ ! -f "$target_dir/README.md" ]; then
        cat > "$target_dir/README.md" << EOF
# Engineering

Engineering artifacts for $PROJECT_NAME.

## Structure

\`\`\`
engineering/
├── README.md                 # This file
├── AGENTS.md                 # AI agent guidelines
├── ARCHITECTURE.md           # Engineering scenarios guide
├── artifacts/                # Output artifacts
│   ├── adr/                  # Architecture Decision Records
│   ├── planning/             # Work package plans
│   ├── reviews/              # Code and architecture reviews
│   └── templates/            # Reusable templates
├── agent/                    # Agent-related content
│   ├── resources/            # Agent resources and guides
│   ├── workflows/            # Workflow definitions
│   └── metadata/             # Private metadata
└── scripts/                  # Utility scripts
\`\`\`
EOF
    fi

    if [ ! -f "$target_dir/AGENTS.md" ]; then
        cat > "$target_dir/AGENTS.md" << 'EOF'
# AI Agent Guidelines

## Code Modification Boundaries

- Do not modify code unless explicitly directed
- Complete ONE task at a time
- Request permission before proceeding

## Communication

- Use professional, technical language
- No process attribution in code comments

## Task Management

- Create todos for complex multi-step tasks
- Mark tasks complete immediately after finishing
- Only ONE task in_progress at a time
EOF
    fi

    if [ ! -f "$target_dir/ARCHITECTURE.md" ]; then
        cat > "$target_dir/ARCHITECTURE.md" << 'EOF'
# Architecture Guide

This document describes the architecture for managing engineering artifacts.

## Overview

Engineering artifacts should be:
- **Version-controlled** — Full history of decisions
- **Co-located** — Accessible alongside code
- **Separated** — Engineering history distinct from code history

## Directory Structure

- `artifacts/adr/` - Architecture Decision Records
- `artifacts/planning/` - Work package plans and specifications
- `artifacts/reviews/` - Code and architecture reviews
- `artifacts/templates/` - Reusable documentation templates
- `agent/resources/` - Agent resources and guides
- `agent/workflows/` - Workflow definitions
- `agent/metadata/` - Private agent metadata
- `scripts/` - Utility scripts
EOF
    fi

    if [ ! -f "$target_dir/scripts/update.sh" ]; then
        cat > "$target_dir/scripts/update.sh" << 'EOF'
#!/usr/bin/env bash
# Update agent submodules (workflows and/or metadata)
# Usage: ./scripts/update.sh [--workflows] [--metadata] [--project NAME]
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")/agent"
ENGINEERING_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="${PROJECT_NAME:-$(basename "$(dirname "$ENGINEERING_ROOT")")}"
UPDATE_WORKFLOWS=false; UPDATE_METADATA=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --workflows) UPDATE_WORKFLOWS=true; shift ;;
        --metadata) UPDATE_METADATA=true; shift ;;
        --project) PROJECT_NAME="$2"; shift 2 ;;
        *) shift ;;
    esac
done
[ "$UPDATE_WORKFLOWS" = false ] && [ "$UPDATE_METADATA" = false ] && { UPDATE_WORKFLOWS=true; UPDATE_METADATA=true; }
if [ "$UPDATE_WORKFLOWS" = true ] && [ -d "$AGENT_DIR/workflows" ]; then
    echo "=== Updating workflows ===" && cd "$AGENT_DIR/workflows"
    git fetch origin --quiet 2>/dev/null || true
    git checkout workflows --quiet 2>/dev/null || true
    git pull origin workflows --quiet && echo "✓ workflows: $(git rev-parse --short HEAD)"
fi
if [ "$UPDATE_METADATA" = true ] && [ -d "$AGENT_DIR/metadata" ]; then
    echo "=== Updating metadata ===" && cd "$AGENT_DIR/metadata"
    git fetch origin master && git checkout master 2>/dev/null || true
    git pull origin master && echo "✓ metadata: $(git rev-parse --short HEAD)"
fi
EOF
        chmod +x "$target_dir/scripts/update.sh"
    fi
    
    echo "  ✓ Structure verified"
}

# =============================================================================
# Interactive Setup
# =============================================================================

cd "$REPO_ROOT"

echo "=== Engineering Branch Deployment ==="
echo "Project: $PROJECT_NAME"
echo ""

# Verify git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Interactive prompt if no flags specified
if [ "$INTERACTIVE" = true ]; then
    echo "Where should the engineering branch be located?"
    echo ""
    echo "  [1] External repo: $DEFAULT_EXTERNAL_REPO"
    echo "      → Creates: engineering/$PROJECT_NAME/"
    echo ""
    echo "  [2] In-repo (creates orphan 'engineering' branch)"
    echo ""
    read -p "Choice [1/2, Enter → in-repo]: " CHOICE
    
    case "$CHOICE" in
        1)
            read -p "External repo URL [$DEFAULT_EXTERNAL_REPO]: " CUSTOM_EXTERNAL
            EXTERNAL_REPO="${CUSTOM_EXTERNAL:-$DEFAULT_EXTERNAL_REPO}"
            ;;
        2|"")
            EXTERNAL_REPO=""
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
    echo ""
fi

# =============================================================================
# Main
# =============================================================================

# Add to local git exclude
EXCLUDE_FILE="$(git rev-parse --git-dir)/info/exclude"
if ! grep -q "^\.engineering/$" "$EXCLUDE_FILE" 2>/dev/null; then
    echo ".engineering/" >> "$EXCLUDE_FILE"
    echo "✓ Added .engineering/ to local git exclude"
fi

# Handle existing .engineering - migrate data if present
MIGRATION_BACKUP=""
if [ -d "$ENGINEERING_DIR" ]; then
    # Check if there's content to migrate (artifacts folder with files)
    if [ -d "$ENGINEERING_DIR/artifacts" ] && [ -n "$(find "$ENGINEERING_DIR/artifacts" -type f 2>/dev/null | head -1)" ]; then
        MIGRATION_BACKUP="${ENGINEERING_DIR}_migration_$$"
        echo "Found existing artifacts to migrate..."
        echo "  Backing up to: $MIGRATION_BACKUP"
        cp -r "$ENGINEERING_DIR" "$MIGRATION_BACKUP"
        echo "  ✓ Backup complete ($(find "$MIGRATION_BACKUP/artifacts" -type f 2>/dev/null | wc -l) files)"
    fi
    echo "Removing existing .engineering/..."
    rm -rf "$ENGINEERING_DIR"
fi

# Function to migrate backed up data into new engineering folder
migrate_existing_data() {
    local target_dir="$1"
    
    if [ -z "$MIGRATION_BACKUP" ] || [ ! -d "$MIGRATION_BACKUP" ]; then
        return 0
    fi
    
    echo ""
    echo "Migrating existing artifacts..."
    
    # Copy artifacts folder (the main content to preserve)
    if [ -d "$MIGRATION_BACKUP/artifacts" ]; then
        cp -r "$MIGRATION_BACKUP/artifacts"/* "$target_dir/artifacts/" 2>/dev/null || true
        echo "  ✓ Migrated artifacts"
    fi
    
    # Copy resources folder if it exists and target doesn't have it
    if [ -d "$MIGRATION_BACKUP/resources" ] && [ ! -d "$target_dir/resources" ]; then
        cp -r "$MIGRATION_BACKUP/resources" "$target_dir/" 2>/dev/null || true
        echo "  ✓ Migrated resources"
    fi
    
    # Commit and push migrated data
    cd "$target_dir"
    if [ -d .git ] || [ -f .git ]; then
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            git add -A
            git commit -m "docs: migrate existing engineering artifacts" 2>/dev/null || true
            echo "  ✓ Committed migrated data"
            
            # Push to remote (with timeout to avoid hanging)
            if timeout 30 git push origin HEAD 2>/dev/null; then
                echo "  ✓ Pushed migrated data to remote"
            else
                echo "  ⚠ Push failed or timed out - run 'git push' manually in .engineering/"
            fi
        fi
    fi
    
    # Clean up backup
    rm -rf "$MIGRATION_BACKUP"
    echo "  ✓ Cleaned up migration backup"
}

if [ -n "$EXTERNAL_REPO" ]; then
    # ==========================================================================
    # External Repo Mode
    # ==========================================================================
    echo "Using external repo: $EXTERNAL_REPO"
    echo "Engineering path: engineering/$PROJECT_NAME/"
    echo ""
    
    # Clone external repo
    TEMP_CLONE=$(mktemp -d)
    echo "Cloning external repo..."
    git clone "$EXTERNAL_REPO" "$TEMP_CLONE"
    
    cd "$TEMP_CLONE"
    
    # Create or update engineering folder for this project
    NEEDS_COMMIT=false
    
    if [ -d "engineering/$PROJECT_NAME" ]; then
        echo "✓ Engineering folder found, checking structure..."
    else
        echo "Creating engineering/$PROJECT_NAME/..."
        mkdir -p "engineering/$PROJECT_NAME"
        NEEDS_COMMIT=true
    fi
    
    # Ensure full structure exists (only creates missing items)
    create_engineering_structure "engineering/$PROJECT_NAME"
    
    # Add submodules if not present (run from repo root with full paths)
    ENG_PATH="engineering/$PROJECT_NAME"
    
    if [ ! -d "$ENG_PATH/agent/resources/.git" ] && [ ! -f "$ENG_PATH/agent/resources/.git" ]; then
        rm -rf "$ENG_PATH/agent/resources" 2>/dev/null || true
        git submodule add "$RESOURCES_REPO" "$ENG_PATH/agent/resources" 2>/dev/null || true
        
        RESOURCES_VERSION=$(get_latest_resources_version)
        if [ -d "$ENG_PATH/agent/resources" ]; then
            cd "$ENG_PATH/agent/resources"
            git fetch --tags 2>/dev/null || true
            git checkout "$RESOURCES_VERSION" 2>/dev/null || true
            cd "$TEMP_CLONE"
            echo "✓ Added agent/resources submodule"
            NEEDS_COMMIT=true
        fi
    else
        echo "✓ agent/resources submodule exists"
    fi
    
    if [ ! -d "$ENG_PATH/agent/workflows/.git" ] && [ ! -f "$ENG_PATH/agent/workflows/.git" ]; then
        rm -rf "$ENG_PATH/agent/workflows" 2>/dev/null || true
        git submodule add -b workflows "https://github.com/m2ux/workflow-server.git" "$ENG_PATH/agent/workflows" 2>/dev/null || true
        if [ -d "$ENG_PATH/agent/workflows" ]; then
            cd "$ENG_PATH/agent/workflows"
            git checkout workflows 2>/dev/null || true
            cd "$TEMP_CLONE"
            echo "✓ Added agent/workflows submodule"
            NEEDS_COMMIT=true
        fi
    else
        echo "✓ agent/workflows submodule exists"
    fi
    
    if [ "$SKIP_METADATA" = false ]; then
        if [ ! -d "$ENG_PATH/agent/metadata/.git" ] && [ ! -f "$ENG_PATH/agent/metadata/.git" ]; then
            rm -rf "$ENG_PATH/agent/metadata" 2>/dev/null || true
            git submodule add "$METADATA_REPO" "$ENG_PATH/agent/metadata" 2>/dev/null || true
            if [ -d "$ENG_PATH/agent/metadata" ]; then
                # Configure sparse checkout for projects/<project-name>/
                cd "$ENG_PATH/agent/metadata"
                git sparse-checkout init --cone 2>/dev/null || true
                git sparse-checkout set "projects/$PROJECT_NAME" 2>/dev/null || true
                git checkout master 2>/dev/null || git checkout main 2>/dev/null || true
                cd "$TEMP_CLONE"
                echo "✓ Added agent/metadata submodule (sparse: projects/$PROJECT_NAME)"
                NEEDS_COMMIT=true
            fi
        else
            echo "✓ agent/metadata submodule exists"
        fi
    fi
    
    # Commit if there are changes
    if [ "$NEEDS_COMMIT" = true ] || [ -n "$(git status --porcelain)" ]; then
        git add "engineering/$PROJECT_NAME"
        git commit -m "docs: update engineering for $PROJECT_NAME" 2>/dev/null || true
        git push origin HEAD 2>/dev/null || true
        echo "✓ Pushed changes to external repo"
    fi
    
    cd "$REPO_ROOT"
    
    # Clean up temp clone
    rm -rf "$TEMP_CLONE"
    
    # Clone with sparse checkout to get only this project's engineering folder
    echo ""
    echo "Setting up .engineering/ with sparse checkout..."
    git clone --no-checkout "$EXTERNAL_REPO" "$ENGINEERING_DIR"
    cd "$ENGINEERING_DIR"
    git sparse-checkout init --cone
    git sparse-checkout set "engineering/$PROJECT_NAME"
    git checkout HEAD
    
    # Move content up so .engineering/ points directly to project folder
    cd "$REPO_ROOT"
    if [ -d "$ENGINEERING_DIR/engineering/$PROJECT_NAME" ]; then
        mv "$ENGINEERING_DIR" "${ENGINEERING_DIR}_tmp"
        mv "${ENGINEERING_DIR}_tmp/engineering/$PROJECT_NAME" "$ENGINEERING_DIR"
        # Preserve the .git directory so .engineering remains a git repo
        mv "${ENGINEERING_DIR}_tmp/.git" "$ENGINEERING_DIR/.git"
        rm -rf "${ENGINEERING_DIR}_tmp"
    fi
    
    # Clone submodules as standalone repos (external mode doesn't use git submodule refs)
    echo ""
    echo "Setting up agent repos..."
    cd "$ENGINEERING_DIR"
    
    # Clone resources
    rm -rf agent/resources 2>/dev/null || true
    mkdir -p agent
    git clone "$RESOURCES_REPO" agent/resources 2>/dev/null || true
    if [ -d "agent/resources" ]; then
        RESOURCES_VERSION=$(get_latest_resources_version)
        cd agent/resources
        git fetch --tags 2>/dev/null || true
        git checkout "$RESOURCES_VERSION" 2>/dev/null || true
        cd "$ENGINEERING_DIR"
        echo "✓ agent/resources ($RESOURCES_VERSION)"
    fi
    
    # Clone workflows (only if not already present)
    if [ ! -d "agent/workflows/.git" ]; then
        rm -rf agent/workflows 2>/dev/null || true
        if git clone -b workflows "https://github.com/m2ux/workflow-server.git" agent/workflows 2>/dev/null; then
            echo "✓ agent/workflows (workflows branch)"
        else
            echo "⚠ agent/workflows skipped"
        fi
    else
        echo "✓ agent/workflows exists"
    fi
    
    # Clone metadata with sparse checkout
    if [ "$SKIP_METADATA" = false ]; then
        rm -rf agent/metadata 2>/dev/null || true
        if git clone --no-checkout "$METADATA_REPO" agent/metadata 2>/dev/null; then
            cd agent/metadata
            git sparse-checkout init --cone 2>/dev/null || true
            git sparse-checkout set "projects/$PROJECT_NAME" 2>/dev/null || true
            git checkout master 2>/dev/null || git checkout main 2>/dev/null || true
            cd "$ENGINEERING_DIR"
            echo "✓ agent/metadata (sparse: projects/$PROJECT_NAME)"
        else
            echo "⚠ agent/metadata skipped (private)"
        fi
    fi
    
    echo "✓ Deployed to .engineering/"
    
    # Migrate existing data if backup exists
    migrate_existing_data "$ENGINEERING_DIR"
    
else
    # ==========================================================================
    # In-Repo Mode (Orphan Branch)
    # ==========================================================================
    
    SOURCE_REPO="$(git remote get-url origin 2>/dev/null || echo "")"
    if [ -z "$SOURCE_REPO" ]; then
        echo "Error: Could not determine remote URL"
        exit 1
    fi
    
    # Check if engineering branch exists
    if git ls-remote --heads "$SOURCE_REPO" engineering 2>/dev/null | grep -q engineering; then
        echo "✓ Engineering branch found"
    else
        echo "Engineering branch not found. Creating..."
        echo ""
        
        WORKTREE_DIR="${REPO_ROOT}_engineering_tmp"
        
        git worktree add --detach "$WORKTREE_DIR" 2>/dev/null || true
        cd "$WORKTREE_DIR"
        
        git checkout --orphan engineering
        git rm -rf . 2>/dev/null || true
        
        create_engineering_structure "."
        
        # Add submodules for in-repo mode
        mkdir -p agent
        git submodule add "$RESOURCES_REPO" agent/resources 2>/dev/null || true
        
        RESOURCES_VERSION=$(get_latest_resources_version)
        if [ -d "agent/resources" ]; then
            cd agent/resources
            git fetch --tags
            git checkout "$RESOURCES_VERSION" 2>/dev/null || true
            cd ../..
        fi
        
        git submodule add -b workflows "https://github.com/m2ux/workflow-server.git" agent/workflows 2>/dev/null || true
        if [ -d "agent/workflows" ]; then
            cd agent/workflows
            git checkout workflows 2>/dev/null || true
            cd ../..
        fi
        
        if [ "$SKIP_METADATA" = false ]; then
            git submodule add "$METADATA_REPO" agent/metadata 2>/dev/null || true
            if [ -d "agent/metadata" ]; then
                cd agent/metadata
                git sparse-checkout init --cone 2>/dev/null || true
                git sparse-checkout set "projects/$PROJECT_NAME" 2>/dev/null || true
                git checkout master 2>/dev/null || git checkout main 2>/dev/null || true
                cd ../..
            fi
        fi
        
        git add .
        git commit -m "docs: initialize engineering branch"
        git push -u origin engineering
        
        echo "✓ Created and pushed engineering branch"
        
        cd "$REPO_ROOT"
        git worktree remove "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
    fi
    
    # Clone engineering branch
    echo ""
    echo "Cloning engineering branch..."
    git clone --single-branch --branch engineering "$SOURCE_REPO" "$ENGINEERING_DIR"
    echo "✓ Cloned to .engineering/"
    
    # Initialize submodules
    echo ""
    echo "Initializing submodules..."
    cd "$ENGINEERING_DIR"
    
    if [ -f .gitmodules ]; then
        git submodule update --init agent/resources 2>/dev/null && echo "✓ agent/resources" || true
        
        if git submodule update --init agent/workflows 2>/dev/null; then
            echo "✓ agent/workflows"
        else
            echo "⚠ agent/workflows skipped"
        fi
        
        if [ "$SKIP_METADATA" = false ]; then
            if git submodule update --init agent/metadata 2>/dev/null; then
                cd agent/metadata
                git sparse-checkout init --cone 2>/dev/null || true
                git sparse-checkout set "projects/$PROJECT_NAME" 2>/dev/null || true
                git checkout master 2>/dev/null || git checkout main 2>/dev/null || true
                cd ../..
                echo "✓ agent/metadata (sparse: projects/$PROJECT_NAME)"
            else
                echo "⚠ agent/metadata skipped (private)"
            fi
        fi
    fi
    
    # Migrate existing data if backup exists (in-repo mode)
    migrate_existing_data "$ENGINEERING_DIR"
fi

cd "$REPO_ROOT"

# Self-destruct unless --keep
if [ "$KEEP_SCRIPT" = false ]; then
    rm -f "$SCRIPT_PATH"
    echo ""
    echo "✓ Removed deploy script"
fi

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Engineering: .engineering/"
echo ""
