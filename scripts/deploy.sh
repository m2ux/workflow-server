#!/usr/bin/env bash
# Engineering Branch Deploy Script
#
# Deploys engineering infrastructure to this project. Supports two modes:
#   - Orphan Branch (default): Creates orphan branch, adds .engineering as submodule
#     - No URL: 'engineering' branch in this repo
#     - With URL: project-named branch in external repo
#   - In-Branch: Manages .engineering/ as regular files in current branch
#
# Usage:
#   ./deploy.sh [options]
#
# Options:
#   --orphan [url]             Use orphan branch mode (default if no args)
#                              No URL: local 'engineering' branch
#                              With URL: external repo, project-named branch
#   --in-branch                Use in-branch mode (regular files)
#   --metadata-repo <url>      Custom metadata repo (default: m2ux/ai-metadata)
#   --skip-metadata            Skip private history submodule
#   --keep                     Don't self-destruct after deployment
#   --help                     Show this help

set -e

# =============================================================================
# Configuration
# =============================================================================

DEFAULT_METADATA_REPO="https://github.com/m2ux/ai-metadata.git"

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="$(basename "$REPO_ROOT")"
ENGINEERING_DIR="$REPO_ROOT/.engineering"

# =============================================================================
# Argument Parsing
# =============================================================================

# Modes: "orphan" (default) or "in-branch"
# ORPHAN_REPO: empty = local repo, non-empty = external repo URL
DEPLOY_MODE=""
ORPHAN_REPO=""
METADATA_REPO="$DEFAULT_METADATA_REPO"
SKIP_METADATA=false
KEEP_SCRIPT=false
INTERACTIVE=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --orphan)
            DEPLOY_MODE="orphan"
            INTERACTIVE=false
            shift
            # Check if next arg is a URL (not another flag)
            if [[ $# -gt 0 && ! "$1" =~ ^-- ]]; then
                ORPHAN_REPO="$1"
                shift
            fi
            ;;
        --in-branch)
            DEPLOY_MODE="in-branch"
            INTERACTIVE=false
            shift
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
            head -28 "$0" | tail -24
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

create_engineering_structure() {
    local target_dir="$1"
    
    echo "  Creating directory structure..."
    
    # Create all directories (mkdir -p is idempotent)
    mkdir -p "$target_dir/artifacts/adr"
    mkdir -p "$target_dir/artifacts/planning"
    mkdir -p "$target_dir/artifacts/reviews"
    mkdir -p "$target_dir/artifacts/templates"
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
├── workflows/                # Workflow definitions (submodule)
├── history/                  # Project history (orphan branch submodule)
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
- `workflows/` - Workflow definitions (submodule)
- `history/` - Project history (orphan branch submodule)
- `scripts/` - Utility scripts
EOF
    fi

    if [ ! -f "$target_dir/scripts/update.sh" ]; then
        cat > "$target_dir/scripts/update.sh" << 'EOF'
#!/usr/bin/env bash
# Update submodules (workflows and/or history)
# Usage: ./scripts/update.sh [--workflows] [--history] [--project NAME]
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENGINEERING_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="${PROJECT_NAME:-$(basename "$(dirname "$ENGINEERING_ROOT")")}"
UPDATE_WORKFLOWS=false; UPDATE_HISTORY=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --workflows) UPDATE_WORKFLOWS=true; shift ;;
        --history) UPDATE_HISTORY=true; shift ;;
        --project) PROJECT_NAME="$2"; shift 2 ;;
        *) shift ;;
    esac
done
[ "$UPDATE_WORKFLOWS" = false ] && [ "$UPDATE_HISTORY" = false ] && { UPDATE_WORKFLOWS=true; UPDATE_HISTORY=true; }
if [ "$UPDATE_WORKFLOWS" = true ] && [ -d "$ENGINEERING_ROOT/workflows" ]; then
    echo "=== Updating workflows ===" && cd "$ENGINEERING_ROOT/workflows"
    git fetch origin --quiet 2>/dev/null || true
    git checkout workflows --quiet 2>/dev/null || true
    git pull origin workflows --quiet && echo "✓ workflows: $(git rev-parse --short HEAD)"
fi
if [ "$UPDATE_HISTORY" = true ] && [ -d "$ENGINEERING_ROOT/history" ]; then
    echo "=== Updating history ===" && cd "$ENGINEERING_ROOT/history"
    git fetch origin "$PROJECT_NAME" && git checkout "$PROJECT_NAME" 2>/dev/null || true
    git pull origin "$PROJECT_NAME" && echo "✓ history: $(git rev-parse --short HEAD)"
fi
EOF
        chmod +x "$target_dir/scripts/update.sh"
    fi
    
    echo "  ✓ Structure verified"
}

# Create orphan branch for project history if it doesn't exist
ensure_history_branch() {
    local repo_url="$1"
    local branch_name="$2"
    
    # Check if branch exists
    if git ls-remote --heads "$repo_url" "$branch_name" 2>/dev/null | grep -q "$branch_name"; then
        echo "  ✓ History branch '$branch_name' exists"
        return 0
    fi
    
    echo "  Creating orphan branch '$branch_name' in metadata repo..."
    
    local temp_dir=$(mktemp -d)
    git clone --depth 1 "$repo_url" "$temp_dir" 2>/dev/null || {
        # If clone fails (empty repo), init fresh
        cd "$temp_dir"
        git init
        git remote add origin "$repo_url"
    }
    
    cd "$temp_dir"
    git checkout --orphan "$branch_name"
    git rm -rf . 2>/dev/null || true
    
    # Create minimal README
    cat > README.md << EOF
# $branch_name

Project history and AI conversation artifacts.
EOF
    
    git add README.md
    git commit -m "docs: initialize $branch_name history branch"
    
    if git push -u origin "$branch_name" 2>/dev/null; then
        echo "  ✓ Created and pushed branch '$branch_name'"
    else
        echo "  ⚠ Failed to push branch '$branch_name' - check repo permissions"
        cd "$REPO_ROOT"
        rm -rf "$temp_dir"
        return 1
    fi
    
    cd "$REPO_ROOT"
    rm -rf "$temp_dir"
    return 0
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
    echo "How should engineering artifacts be managed?"
    echo ""
    echo "  [1] Orphan Branch (default)"
    echo "      → Adds .engineering as submodule tracking an orphan branch"
    echo "      → Engineering history separate from code history"
    echo ""
    echo "  [2] In-Branch"
    echo "      → .engineering/ as regular files in current branch"
    echo "      → Engineering artifacts committed with code"
    echo ""
    read -p "Choice [1/2, Enter → Orphan Branch]: " CHOICE
    
    case "$CHOICE" in
        1|"")
            DEPLOY_MODE="orphan"
            echo ""
            echo "Orphan branch location:"
            echo "  - Press Enter for local 'engineering' branch in this repo"
            echo "  - Or enter URL for external repo (uses '$PROJECT_NAME' branch)"
            echo ""
            read -p "External repo URL (or Enter for local): " ORPHAN_REPO
            ;;
        2)
            DEPLOY_MODE="in-branch"
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
    echo ""
else
    # Default to orphan if not specified
    [ -z "$DEPLOY_MODE" ] && DEPLOY_MODE="orphan"
fi

# =============================================================================
# Main
# =============================================================================

# Note: For orphan modes, .engineering is added as a submodule (tracked by parent repo)
# For in-branch mode, user decides whether to commit or gitignore

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

if [ "$DEPLOY_MODE" = "in-branch" ]; then
    # ==========================================================================
    # In-Branch Mode (Regular Files)
    # ==========================================================================
    echo "Using in-branch mode (regular files)"
    echo ""
    
    # Create engineering structure directly
    echo "Creating .engineering/ structure..."
    create_engineering_structure "$ENGINEERING_DIR"
    
    # Clone workflows as standalone repo
    echo ""
    echo "Setting up submodule repos..."
    cd "$ENGINEERING_DIR"
    
    if [ ! -d "workflows/.git" ]; then
        rm -rf workflows 2>/dev/null || true
        if git clone -b workflows "https://github.com/m2ux/workflow-server.git" workflows 2>/dev/null; then
            echo "✓ workflows (workflows branch)"
        else
            echo "⚠ workflows skipped"
        fi
    else
        echo "✓ workflows exists"
    fi
    
    # Clone history from project-specific orphan branch
    if [ "$SKIP_METADATA" = false ]; then
        if [ ! -d "history/.git" ]; then
            rm -rf history 2>/dev/null || true
            # Ensure orphan branch exists for this project
            ensure_history_branch "$METADATA_REPO" "$PROJECT_NAME"
            if git clone --single-branch --branch "$PROJECT_NAME" "$METADATA_REPO" history 2>/dev/null; then
                echo "✓ history (branch: $PROJECT_NAME)"
            else
                echo "⚠ history skipped (private or branch not found)"
            fi
        else
            echo "✓ history exists"
        fi
    fi
    
    cd "$REPO_ROOT"
    
    echo ""
    echo "✓ Created .engineering/ structure"
    
    # Migrate existing data if backup exists
    migrate_existing_data "$ENGINEERING_DIR"
    
    # Note: In-branch mode - user should commit .engineering/ to their branch
    echo ""
    echo "Note: .engineering/ is ready for use."
    echo "      Add to .gitignore if you don't want to track artifacts."
    echo "      Or commit to include engineering files in your branch."
    
else
    # ==========================================================================
    # Orphan Branch Mode (Default)
    # ==========================================================================
    
    # Determine repo and branch based on ORPHAN_REPO
    if [ -n "$ORPHAN_REPO" ]; then
        # External repo mode: use project-named branch
        TARGET_REPO="$ORPHAN_REPO"
        TARGET_BRANCH="$PROJECT_NAME"
        echo "Using orphan branch mode (external repo)"
        echo "Repo: $TARGET_REPO"
        echo "Branch: $TARGET_BRANCH"
    else
        # Local repo mode: use 'engineering' branch
        TARGET_REPO="$(git remote get-url origin 2>/dev/null || echo "")"
        TARGET_BRANCH="engineering"
        echo "Using orphan branch mode (local)"
        echo "Branch: $TARGET_BRANCH"
        
        if [ -z "$TARGET_REPO" ]; then
            echo "Error: Could not determine remote URL"
            exit 1
        fi
    fi
    echo ""
    
    # Check if target branch exists
    if git ls-remote --heads "$TARGET_REPO" "$TARGET_BRANCH" 2>/dev/null | grep -q "$TARGET_BRANCH"; then
        echo "✓ Branch '$TARGET_BRANCH' found"
    else
        echo "Branch '$TARGET_BRANCH' not found. Creating..."
        echo ""
        
        if [ -n "$ORPHAN_REPO" ]; then
            # External repo: clone to temp dir
            TEMP_DIR=$(mktemp -d)
            git clone --depth 1 "$TARGET_REPO" "$TEMP_DIR" 2>/dev/null || {
                # If clone fails (empty repo), init fresh
                cd "$TEMP_DIR"
                git init
                git remote add origin "$TARGET_REPO"
            }
            cd "$TEMP_DIR"
        else
            # Local repo: use worktree
            WORKTREE_DIR="${REPO_ROOT}_engineering_tmp"
            git worktree add --detach "$WORKTREE_DIR" 2>/dev/null || true
            cd "$WORKTREE_DIR"
        fi
        
        git checkout --orphan "$TARGET_BRANCH"
        git rm -rf . 2>/dev/null || true
        
        create_engineering_structure "."
        
        # Add submodules
        git submodule add -b workflows "https://github.com/m2ux/workflow-server.git" workflows 2>/dev/null || true
        if [ -d "workflows" ]; then
            cd workflows
            git checkout workflows 2>/dev/null || true
            cd ..
        fi
        
        if [ "$SKIP_METADATA" = false ]; then
            ensure_history_branch "$METADATA_REPO" "$PROJECT_NAME"
            git submodule add -b "$PROJECT_NAME" "$METADATA_REPO" history 2>/dev/null || true
            if [ -d "history" ]; then
                cd history
                git checkout "$PROJECT_NAME" 2>/dev/null || true
                cd ..
            fi
        fi
        
        git add .
        git commit -m "docs: initialize $TARGET_BRANCH engineering branch"
        git push -u origin "$TARGET_BRANCH"
        
        echo "✓ Created and pushed branch '$TARGET_BRANCH'"
        
        cd "$REPO_ROOT"
        if [ -n "$ORPHAN_REPO" ]; then
            rm -rf "$TEMP_DIR"
        else
            git worktree remove "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
        fi
    fi
    
    # Add .engineering as submodule
    echo ""
    echo "Adding .engineering submodule..."
    cd "$REPO_ROOT"
    git submodule add -b "$TARGET_BRANCH" "$TARGET_REPO" .engineering
    echo "✓ Added .engineering submodule (branch: $TARGET_BRANCH)"
    
    # Initialize nested submodules
    echo ""
    echo "Initializing nested submodules..."
    cd "$ENGINEERING_DIR"
    
    if [ -f .gitmodules ]; then
        if git submodule update --init workflows 2>/dev/null; then
            echo "✓ workflows"
        else
            echo "⚠ workflows skipped"
        fi
        
        if [ "$SKIP_METADATA" = false ]; then
            if git submodule update --init history 2>/dev/null; then
                cd history
                git checkout "$PROJECT_NAME" 2>/dev/null || true
                cd ..
                echo "✓ history (branch: $PROJECT_NAME)"
            else
                echo "⚠ history skipped (private or branch not found)"
            fi
        fi
    fi
    
    cd "$REPO_ROOT"
    
    # Migrate existing data if backup exists
    migrate_existing_data "$ENGINEERING_DIR"
    
    echo ""
    echo "Note: .engineering submodule added. Run 'git commit' to save."
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
