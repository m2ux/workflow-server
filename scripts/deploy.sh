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
#   --history-repo <url>       Custom history repo (default: m2ux/ai-metadata)
#   --skip-history             Skip private history submodule
#   --keep                     Don't self-destruct after deployment
#   --help                     Show this help

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

DEFAULT_HISTORY_REPO="https://github.com/m2ux/ai-metadata.git"
NETWORK_TIMEOUT=30

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="$(basename "$REPO_ROOT")"
ENGINEERING_DIR="$REPO_ROOT/.engineering"

# Sanitize PROJECT_NAME to alphanumeric, hyphen, underscore, dot
PROJECT_NAME="$(printf '%s' "$PROJECT_NAME" | tr -cd 'a-zA-Z0-9._-')"
if [[ -z "$PROJECT_NAME" ]]; then
    echo "[FAIL] Could not determine a valid project name"
    exit 2
fi

# =============================================================================
# Cleanup
# =============================================================================

TEMP_DIRS_TO_CLEAN=()

cleanup() {
    for dir in "${TEMP_DIRS_TO_CLEAN[@]}"; do
        if [[ -d "$dir" ]]; then
            rm -rf "$dir"
        fi
    done
}

trap cleanup EXIT

# =============================================================================
# Network helpers
# =============================================================================

timed_git() {
    timeout "$NETWORK_TIMEOUT" git "$@"
}

verify_push_access() {
    local remote_url="$1"
    local branch="$2"
    if ! timeout "$NETWORK_TIMEOUT" git push --dry-run "$remote_url" "$branch" >/dev/null 2>&1; then
        echo "[FAIL] No push access to $remote_url (branch: $branch)"
        return 1
    fi
    return 0
}

# =============================================================================
# Argument Parsing
# =============================================================================

# Modes: "orphan" (default) or "in-branch"
# ORPHAN_REPO: empty = local repo, non-empty = external repo URL
DEPLOY_MODE=""
ORPHAN_REPO=""
HISTORY_REPO="$DEFAULT_HISTORY_REPO"
SKIP_HISTORY=false
KEEP_SCRIPT=true
INTERACTIVE=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --orphan)
            DEPLOY_MODE="orphan"
            INTERACTIVE=false
            shift
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
        --history-repo)
            HISTORY_REPO="$2"
            shift 2
            ;;
        --skip-history)
            SKIP_HISTORY=true
            shift
            ;;
        --keep)
            KEEP_SCRIPT=true
            shift
            ;;
        --no-keep)
            KEEP_SCRIPT=false
            shift
            ;;
        --help|-h)
            head -28 "$0" | tail -24
            exit 0
            ;;
        *)
            echo "[FAIL] Unknown option: $1"
            exit 2
            ;;
    esac
done

# =============================================================================
# Helper Functions
# =============================================================================

create_engineering_structure() {
    local target_dir="$1"
    
    echo "  Creating directory structure..."
    
    mkdir -p "$target_dir/artifacts/adr"
    mkdir -p "$target_dir/artifacts/planning"
    mkdir -p "$target_dir/artifacts/reviews"
    mkdir -p "$target_dir/artifacts/templates"
    mkdir -p "$target_dir/scripts"
    
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
    git pull origin workflows --quiet && echo "[PASS] workflows: $(git rev-parse --short HEAD)"
fi
if [ "$UPDATE_HISTORY" = true ] && [ -d "$ENGINEERING_ROOT/history" ]; then
    echo "=== Updating history ===" && cd "$ENGINEERING_ROOT/history"
    git fetch origin "$PROJECT_NAME" && git checkout "$PROJECT_NAME" 2>/dev/null || true
    git pull origin "$PROJECT_NAME" && echo "[PASS] history: $(git rev-parse --short HEAD)"
fi
EOF
        chmod +x "$target_dir/scripts/update.sh"
    fi
    
    echo "  [PASS] Structure verified"
}

ensure_history_branch() {
    local repo_url="$1"
    local branch_name="$2"
    
    if timed_git ls-remote --heads "$repo_url" "$branch_name" 2>/dev/null | grep -q "$branch_name"; then
        echo "  [PASS] History branch '$branch_name' exists"
        return 0
    fi
    
    echo "  Creating orphan branch '$branch_name' in history repo..."
    
    local temp_dir
    temp_dir=$(mktemp -d)
    TEMP_DIRS_TO_CLEAN+=("$temp_dir")
    
    timed_git clone --depth 1 "$repo_url" "$temp_dir" 2>/dev/null || {
        cd "$temp_dir"
        git init
        git remote add origin "$repo_url"
    }
    
    cd "$temp_dir"
    git checkout --orphan "$branch_name"
    git rm -rf . 2>/dev/null || true
    
    cat > README.md << EOF
# $branch_name

Project history and AI conversation artifacts.
EOF
    
    git add README.md
    git commit -m "docs: initialize $branch_name history branch"
    
    if ! verify_push_access "$repo_url" "$branch_name"; then
        echo "  [WARN] Cannot push to $repo_url — check repo permissions"
        cd "$REPO_ROOT"
        return 1
    fi
    
    if timed_git push -u origin "$branch_name" 2>/dev/null; then
        echo "  [PASS] Created and pushed branch '$branch_name'"
    else
        echo "  [WARN] Failed to push branch '$branch_name' — check repo permissions"
        cd "$REPO_ROOT"
        return 1
    fi
    
    cd "$REPO_ROOT"
    return 0
}

# =============================================================================
# Interactive Setup
# =============================================================================

cd "$REPO_ROOT"

echo "=== Engineering Branch Deployment ==="
echo "Project: $PROJECT_NAME"
echo ""

if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "[FAIL] Not in a git repository"
    exit 2
fi

if [ "$INTERACTIVE" = true ]; then
    echo "How should engineering artifacts be managed?"
    echo ""
    echo "  [1] Orphan Branch - Local (default)"
    echo "      -> Creates 'engineering' branch in this repo"
    echo "      -> Adds .engineering as submodule tracking that branch"
    echo ""
    echo "  [2] Orphan Branch - External"
    echo "      -> Creates '$PROJECT_NAME' branch in external repo"
    echo "      -> Adds .engineering as submodule tracking that branch"
    echo ""
    echo "  [3] In-Branch"
    echo "      -> .engineering/ as regular files in current branch"
    echo "      -> Engineering artifacts committed with code"
    echo ""
    read -p "Choice [1/2/3, Enter -> Local Orphan]: " CHOICE
    
    case "$CHOICE" in
        1|"")
            DEPLOY_MODE="orphan"
            ;;
        2)
            DEPLOY_MODE="orphan"
            read -p "External repo URL: " ORPHAN_REPO
            if [ -z "$ORPHAN_REPO" ]; then
                echo "[FAIL] External repo URL is required"
                exit 2
            fi
            ;;
        3)
            DEPLOY_MODE="in-branch"
            ;;
        *)
            echo "[FAIL] Invalid choice"
            exit 2
            ;;
    esac
    echo ""
else
    [ -z "$DEPLOY_MODE" ] && DEPLOY_MODE="orphan"
fi

# =============================================================================
# Main
# =============================================================================

MIGRATION_BACKUP=""
if [ -d "$ENGINEERING_DIR" ]; then
    if [ -d "$ENGINEERING_DIR/artifacts" ] && [ -n "$(find "$ENGINEERING_DIR/artifacts" -type f 2>/dev/null | head -1)" ]; then
        MIGRATION_BACKUP="${ENGINEERING_DIR}_migration_$$"
        echo "Found existing artifacts to migrate..."
        echo "  Backing up to: $MIGRATION_BACKUP"
        cp -r "$ENGINEERING_DIR" "$MIGRATION_BACKUP"
        TEMP_DIRS_TO_CLEAN+=("$MIGRATION_BACKUP")
        echo "  [PASS] Backup complete ($(find "$MIGRATION_BACKUP/artifacts" -type f 2>/dev/null | wc -l) files)"
    fi
    echo "Removing existing .engineering/..."
    rm -rf "$ENGINEERING_DIR"
fi

migrate_existing_data() {
    local target_dir="$1"
    
    if [ -z "$MIGRATION_BACKUP" ] || [ ! -d "$MIGRATION_BACKUP" ]; then
        return 0
    fi
    
    echo ""
    echo "Migrating existing artifacts..."
    
    if [ -d "$MIGRATION_BACKUP/artifacts" ]; then
        cp -r "$MIGRATION_BACKUP/artifacts"/* "$target_dir/artifacts/" 2>/dev/null || true
        echo "  [PASS] Migrated artifacts"
    fi
    
    if [ -d "$MIGRATION_BACKUP/resources" ] && [ ! -d "$target_dir/resources" ]; then
        cp -r "$MIGRATION_BACKUP/resources" "$target_dir/" 2>/dev/null || true
        echo "  [PASS] Migrated resources"
    fi
    
    cd "$target_dir"
    if [ -d .git ] || [ -f .git ]; then
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            git add -A
            git commit -m "docs: migrate existing engineering artifacts" 2>/dev/null || true
            echo "  [PASS] Committed migrated data"
            
            if timed_git push origin HEAD 2>/dev/null; then
                echo "  [PASS] Pushed migrated data to remote"
            else
                echo "  [WARN] Push failed or timed out — run 'git push' manually in .engineering/"
            fi
        fi
    fi
    
    echo "  [PASS] Cleaned up migration backup"
}

if [ "$DEPLOY_MODE" = "in-branch" ]; then
    # ==========================================================================
    # In-Branch Mode (Regular Files)
    # ==========================================================================
    echo "Using in-branch mode (regular files)"
    echo ""
    
    echo "Creating .engineering/ structure..."
    create_engineering_structure "$ENGINEERING_DIR"
    
    echo ""
    echo "Setting up submodule repos..."
    cd "$ENGINEERING_DIR"
    
    if [ ! -d "workflows/.git" ]; then
        rm -rf workflows 2>/dev/null || true
        if timed_git clone -b workflows "https://github.com/m2ux/workflow-server.git" workflows 2>/dev/null; then
            echo "[PASS] workflows (workflows branch)"
        else
            echo "[WARN] workflows skipped"
        fi
    else
        echo "[PASS] workflows exists"
    fi
    
    if [ "$SKIP_HISTORY" = false ]; then
        if [ ! -d "history/.git" ]; then
            rm -rf history 2>/dev/null || true
            ensure_history_branch "$HISTORY_REPO" "$PROJECT_NAME"
            if timed_git clone --single-branch --branch "$PROJECT_NAME" "$HISTORY_REPO" history 2>/dev/null; then
                echo "[PASS] history (branch: $PROJECT_NAME)"
            else
                echo "[WARN] history skipped (private or branch not found)"
            fi
        else
            echo "[PASS] history exists"
        fi
    fi
    
    cd "$REPO_ROOT"
    
    echo ""
    echo "[PASS] Created .engineering/ structure"
    
    migrate_existing_data "$ENGINEERING_DIR"
    
    echo ""
    echo "Note: .engineering/ is ready for use."
    echo "      Add to .gitignore if you don't want to track artifacts."
    echo "      Or commit to include engineering files in your branch."
    
else
    # ==========================================================================
    # Orphan Branch Mode (Default)
    # ==========================================================================
    
    if [ -n "$ORPHAN_REPO" ]; then
        TARGET_REPO="$ORPHAN_REPO"
        TARGET_BRANCH="$PROJECT_NAME"
        echo "Using orphan branch mode (external repo)"
        echo "Repo: $TARGET_REPO"
        echo "Branch: $TARGET_BRANCH"
    else
        TARGET_REPO="$(git remote get-url origin 2>/dev/null || echo "")"
        TARGET_BRANCH="engineering"
        echo "Using orphan branch mode (local)"
        echo "Branch: $TARGET_BRANCH"
        
        if [ -z "$TARGET_REPO" ]; then
            echo "[FAIL] Could not determine remote URL"
            exit 1
        fi
    fi
    echo ""
    
    if timed_git ls-remote --heads "$TARGET_REPO" "$TARGET_BRANCH" 2>/dev/null | grep -q "$TARGET_BRANCH"; then
        echo "[PASS] Branch '$TARGET_BRANCH' found"
    else
        echo "Branch '$TARGET_BRANCH' not found. Creating..."
        echo ""
        
        if [ -n "$ORPHAN_REPO" ]; then
            TEMP_DIR=$(mktemp -d)
            TEMP_DIRS_TO_CLEAN+=("$TEMP_DIR")
            timed_git clone --depth 1 "$TARGET_REPO" "$TEMP_DIR" 2>/dev/null || {
                cd "$TEMP_DIR"
                git init
                git remote add origin "$TARGET_REPO"
            }
            cd "$TEMP_DIR"
        else
            WORKTREE_DIR="${REPO_ROOT}_engineering_tmp"
            TEMP_DIRS_TO_CLEAN+=("$WORKTREE_DIR")
            git worktree add --detach "$WORKTREE_DIR" 2>/dev/null || true
            cd "$WORKTREE_DIR"
        fi
        
        git checkout --orphan "$TARGET_BRANCH"
        git rm -rf . 2>/dev/null || true
        
        create_engineering_structure "."
        
        timed_git submodule add -b workflows "https://github.com/m2ux/workflow-server.git" workflows 2>/dev/null || true
        if [ -d "workflows" ]; then
            cd workflows
            git checkout workflows 2>/dev/null || true
            cd ..
        fi
        
        if [ "$SKIP_HISTORY" = false ]; then
            ensure_history_branch "$HISTORY_REPO" "$PROJECT_NAME"
            timed_git submodule add -b "$PROJECT_NAME" "$HISTORY_REPO" history 2>/dev/null || true
            if [ -d "history" ]; then
                cd history
                git checkout "$PROJECT_NAME" 2>/dev/null || true
                cd ..
            fi
        fi
        
        git add .
        git commit -m "docs: initialize $TARGET_BRANCH engineering branch"
        
        if ! verify_push_access "$TARGET_REPO" "$TARGET_BRANCH"; then
            echo "[FAIL] Cannot push to $TARGET_REPO"
            exit 1
        fi
        
        timed_git push -u origin "$TARGET_BRANCH"
        
        echo "[PASS] Created and pushed branch '$TARGET_BRANCH'"
        
        cd "$REPO_ROOT"
        if [ -n "$ORPHAN_REPO" ]; then
            : # cleanup handled by trap
        else
            git worktree remove "$WORKTREE_DIR" 2>/dev/null || true
        fi
    fi
    
    echo ""
    echo "Adding .engineering submodule..."
    cd "$REPO_ROOT"
    git submodule add -b "$TARGET_BRANCH" "$TARGET_REPO" .engineering
    echo "[PASS] Added .engineering submodule (branch: $TARGET_BRANCH)"
    
    echo ""
    echo "Initializing nested submodules..."
    cd "$ENGINEERING_DIR"
    
    if [ -f .gitmodules ]; then
        if timed_git submodule update --init workflows 2>/dev/null; then
            echo "[PASS] workflows"
        else
            echo "[WARN] workflows skipped"
        fi
        
        if [ "$SKIP_HISTORY" = false ]; then
            if timed_git submodule update --init history 2>/dev/null; then
                cd history
                git checkout "$PROJECT_NAME" 2>/dev/null || true
                cd ..
                echo "[PASS] history (branch: $PROJECT_NAME)"
            else
                echo "[WARN] history skipped (private or branch not found)"
            fi
        fi
    fi
    
    cd "$REPO_ROOT"
    
    migrate_existing_data "$ENGINEERING_DIR"
    
    echo ""
    echo "Note: .engineering submodule added. Run 'git commit' to save."
fi

cd "$REPO_ROOT"

if [ "$KEEP_SCRIPT" = false ]; then
    rm -f "$SCRIPT_PATH"
    echo ""
    echo "[PASS] Removed deploy script"
fi

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Engineering: .engineering/"
echo ""
