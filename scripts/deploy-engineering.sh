#!/usr/bin/env bash
# Engineering Branch Deploy Script
#
# Deploys engineering infrastructure to this project. Supports two layouts:
#   - Orphan branch (default): 'engineering' branch in this repo, checked out
#     as a worktree at .engineering/
#   - In-branch: .engineering/ as regular files on the current branch
#
# Usage, from the workspace checkout:
#   scripts/deploy-engineering.sh [options]
#
# .engineering/ is created at the checkout root, the parent of scripts/.
#
# Options:
#   --orphan                   Use the orphan engineering branch (default)
#   --in-branch                Use in-branch mode (regular files)
#   --keep                     Don't self-destruct after deployment
#   --help                     Show this help

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

NETWORK_TIMEOUT=30

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="${SCRIPT_DIR}/$(basename "$0")"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
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
    local dir
    for dir in ${TEMP_DIRS_TO_CLEAN[@]+"${TEMP_DIRS_TO_CLEAN[@]}"}; do
        if [[ -d "$dir" ]]; then
            rm -rf "$dir"
        fi
    done
}

# Drop one path from the cleanup list so it survives exit.
unschedule_cleanup() {
    local keep="$1"
    local remaining=()
    local dir
    for dir in ${TEMP_DIRS_TO_CLEAN[@]+"${TEMP_DIRS_TO_CLEAN[@]}"}; do
        [[ "$dir" == "$keep" ]] || remaining+=("$dir")
    done
    TEMP_DIRS_TO_CLEAN=(${remaining[@]+"${remaining[@]}"})
}

trap cleanup EXIT

# =============================================================================
# Network helpers
# =============================================================================

timed_git() {
    timeout "$NETWORK_TIMEOUT" git "$@"
}

# Exact ref match. A substring grep over ls-remote output would treat
# 'engineering-old' as a hit for 'engineering' and skip branch creation.
remote_branch_exists() {
    local repo_url="$1"
    local branch="$2"
    timeout "$NETWORK_TIMEOUT" git ls-remote --exit-code --heads \
        "$repo_url" "refs/heads/$branch" >/dev/null 2>&1
}

verify_push_access() {
    local remote_url="$1"
    local branch="$2"
    local output

    if ! git rev-parse --verify --quiet "refs/heads/$branch" >/dev/null; then
        echo "[FAIL] Local branch '$branch' does not exist in $(pwd)"
        echo "       (the branch was never created, or the script is in the wrong directory)"
        return 1
    fi

    if ! output="$(timeout "$NETWORK_TIMEOUT" git push --dry-run "$remote_url" "$branch" 2>&1)"; then
        echo "[FAIL] No push access to $remote_url (branch: $branch)"
        echo "$output" | sed 's/^/       /'
        return 1
    fi
    return 0
}

# =============================================================================
# Argument Parsing
# =============================================================================

# Modes: "orphan" (default) or "in-branch"
DEPLOY_MODE=""
KEEP_SCRIPT=true
INTERACTIVE=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --orphan)
            DEPLOY_MODE="orphan"
            INTERACTIVE=false
            shift
            ;;
        --in-branch)
            DEPLOY_MODE="in-branch"
            INTERACTIVE=false
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
            sed -n '2,18p' "$0"
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

    local dir
    # .gitkeep is required, not cosmetic: git does not track empty directories,
    # so without it the artifacts tree is absent for every consumer that checks
    # out the branch.
    for dir in artifacts/adr artifacts/planning artifacts/reviews \
               artifacts/templates; do
        mkdir -p "$target_dir/$dir"
        if [ -z "$(ls -A "$target_dir/$dir" 2>/dev/null)" ]; then
            touch "$target_dir/$dir/.gitkeep"
        fi
    done

    if [ ! -f "$target_dir/README.md" ]; then
        cat > "$target_dir/README.md" << EOF
# Engineering

Engineering artifacts for $PROJECT_NAME.

## Structure

\`\`\`
.engineering/
├── README.md                 # This file
├── AGENTS.md                 # AI agent guidelines
├── ARCHITECTURE.md           # Engineering scenarios guide
└── artifacts/                # Output artifacts
    ├── adr/                  # Architecture Decision Records
    ├── planning/             # Work package plans
    ├── reviews/              # Code and architecture reviews
    └── templates/            # Reusable templates
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
EOF
    fi

    echo "  [PASS] Structure verified"
}

# =============================================================================
# Checkout helpers
# =============================================================================

# Clear a submodule registration at PATH so the directory can become a
# worktree: working tree, index gitlink, .gitmodules stanza, .git/config
# stanza, and the cached git directory.
purge_submodule() {
    local path="$1"
    local common_dir

    git submodule deinit -f -- "$path" >/dev/null 2>&1 || true
    git rm -rf --cached -- "$path" >/dev/null 2>&1 || true
    rm -rf "$path"

    git config -f .gitmodules --remove-section "submodule.$path" >/dev/null 2>&1 || true
    git config --remove-section "submodule.$path" >/dev/null 2>&1 || true

    # Submodule git dirs live under the COMMON dir, so this is also correct when
    # called from inside a linked worktree.
    common_dir="$(git rev-parse --git-common-dir)"
    case "$common_dir" in
        /*) ;;
        *) common_dir="$(pwd)/$common_dir" ;;
    esac
    rm -rf "$common_dir/modules/$path"

    # An empty .gitmodules would otherwise get staged as a stray file.
    if [ -f .gitmodules ] && [ ! -s .gitmodules ]; then
        rm -f .gitmodules
        git rm -f --cached .gitmodules >/dev/null 2>&1 || true
    fi
}

# Idempotent linked worktree of BRANCH at PATH in this repository.
# A repeat run that already has PATH checked out on BRANCH is a no-op.
# A submodule registration at PATH is removed first. The caller snapshots
# artifacts before this runs.
ensure_worktree() {
    local path="$1"
    local branch="$2"
    local abs="${REPO_ROOT}/${path}"
    local common_here common_there head

    if [ -e "${abs}/.git" ]; then
        common_here="$(git rev-parse --git-common-dir)"
        case "$common_here" in
            /*) ;;
            *) common_here="$(pwd)/${common_here}" ;;
        esac
        common_there="$(git -C "$abs" rev-parse --git-common-dir 2>/dev/null || echo "")"
        case "$common_there" in
            /*) ;;
            "") ;;
            *) common_there="${abs}/${common_there}" ;;
        esac
        head="$(git -C "$abs" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
        if [ -n "$common_there" ] \
            && [ "$(cd "$common_here" && pwd -P)" = "$(cd "$common_there" && pwd -P)" ] \
            && [ "$head" = "$branch" ]; then
            echo "[PASS] $path already present (worktree: $branch)"
            return 0
        fi
        echo "  Replacing existing checkout at $path"
        if [ -f .gitmodules ] && git config -f .gitmodules --get "submodule.${path}.url" >/dev/null 2>&1; then
            purge_submodule "$path"
        else
            git worktree remove --force "$abs" >/dev/null 2>&1 || true
            rm -rf "$abs"
        fi
    elif [ -d "$abs" ] && [ -n "$(ls -A "$abs" 2>/dev/null)" ]; then
        echo "[FAIL] $path exists and is not a git checkout"
        return 1
    fi

    if ! git show-ref --verify --quiet "refs/heads/${branch}"; then
        if ! timed_git fetch origin "${branch}"; then
            echo "[FAIL] Could not fetch branch '$branch'"
            return 1
        fi
        git branch "${branch}" "origin/${branch}"
    fi

    if ! git worktree add "$abs" "$branch"; then
        echo "[FAIL] Could not add worktree at $path"
        return 1
    fi
    echo "[PASS] $path (worktree: $branch)"
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
    echo "  [1] Orphan branch (default)"
    echo "      -> Creates 'engineering' branch in this repo"
    echo "      -> Checks that branch out as a worktree at .engineering/"
    echo ""
    echo "  [2] In-branch"
    echo "      -> .engineering/ as regular files in current branch"
    echo "      -> Engineering artifacts committed with code"
    echo ""
    read -p "Choice [1/2, Enter -> Orphan branch]: " CHOICE
    
    case "$CHOICE" in
        1|"")
            DEPLOY_MODE="orphan"
            ;;
        2)
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

# Existing artifacts are snapshotted, not deleted. Replacing .engineering/ is
# left to the checkout step, which keeps a matching worktree in place — so a
# repeat run of an already-deployed project touches nothing.
MIGRATION_BACKUP=""
if [ -d "$ENGINEERING_DIR/artifacts" ] && [ -n "$(find "$ENGINEERING_DIR/artifacts" -type f 2>/dev/null | head -1)" ]; then
    MIGRATION_BACKUP="${ENGINEERING_DIR}_migration_$$"
    echo "Found existing artifacts to preserve..."
    echo "  Backing up to: $MIGRATION_BACKUP"
    cp -r "$ENGINEERING_DIR" "$MIGRATION_BACKUP"
    TEMP_DIRS_TO_CLEAN+=("$MIGRATION_BACKUP")
    echo "  [PASS] Backup complete ($(find "$MIGRATION_BACKUP/artifacts" -type f 2>/dev/null | wc -l) files)"
fi

migrate_existing_data() {
    local target_dir="$1"
    local caller_dir
    caller_dir="$(pwd)"

    if [ -z "$MIGRATION_BACKUP" ] || [ ! -d "$MIGRATION_BACKUP" ]; then
        return 0
    fi

    if [ ! -d "$target_dir" ]; then
        echo "[WARN] $target_dir missing — preserved artifacts left at:"
        echo "       $MIGRATION_BACKUP"
        unschedule_cleanup "$MIGRATION_BACKUP"
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
        else
            echo "  [PASS] Nothing to migrate — content already present"
        fi
    fi

    cd "$caller_dir"
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
    
    TARGET_REPO="$(git remote get-url origin 2>/dev/null || echo "")"
    TARGET_BRANCH="engineering"
    echo "Using orphan branch"
    echo "Branch: $TARGET_BRANCH"

    if [ -z "$TARGET_REPO" ]; then
        echo "[FAIL] Could not determine remote URL"
        exit 1
    fi
    echo ""

    if remote_branch_exists "$TARGET_REPO" "$TARGET_BRANCH"; then
        echo "[PASS] Branch '$TARGET_BRANCH' found"
    else
        echo "Branch '$TARGET_BRANCH' not found. Creating..."
        echo ""

        WORKTREE_DIR="${REPO_ROOT}_engineering_tmp"
        TEMP_DIRS_TO_CLEAN+=("$WORKTREE_DIR")
        # Drop any stale registration or directory from a previous aborted
        # run, otherwise 'worktree add' fails and we would fall through onto
        # the live branch.
        git worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true
        rm -rf "$WORKTREE_DIR"
        git worktree prune
        if ! git worktree add --detach "$WORKTREE_DIR"; then
            echo "[FAIL] Could not create temporary worktree at $WORKTREE_DIR"
            exit 1
        fi
        cd "$WORKTREE_DIR"
        
        # The remote branch is absent, but a local one may survive from an
        # aborted run. Reuse it rather than failing on "branch already exists";
        # create_engineering_structure below tops up whatever it is missing.
        if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
            echo "  Reusing existing local branch '$TARGET_BRANCH'"
            git checkout "$TARGET_BRANCH"
        else
            git checkout --orphan "$TARGET_BRANCH"
            git rm -rf . 2>/dev/null || true
        fi

        create_engineering_structure "."

        # Guard against any helper having changed directory out from under us:
        # committing here on the wrong branch would pollute the project branch.
        CURRENT_BRANCH="$(git symbolic-ref --short -q HEAD || echo "")"
        if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
            echo "[FAIL] Expected to be on '$TARGET_BRANCH' in $(pwd), but HEAD is '$CURRENT_BRANCH'"
            echo "       Aborting before committing to the wrong branch."
            exit 1
        fi

        git add .
        if [ -n "$(git status --porcelain)" ]; then
            git commit -m "docs: initialize $TARGET_BRANCH engineering branch"
        else
            echo "  Branch content already up to date — nothing to commit"
        fi

        if ! verify_push_access "$TARGET_REPO" "$TARGET_BRANCH"; then
            echo "[FAIL] Cannot push to $TARGET_REPO"
            exit 1
        fi
        
        timed_git push -u origin "$TARGET_BRANCH"
        
        echo "[PASS] Created and pushed branch '$TARGET_BRANCH'"
        
        cd "$REPO_ROOT"
        git worktree remove "$WORKTREE_DIR" 2>/dev/null || true
    fi

    echo ""
    cd "$REPO_ROOT"
    echo "Checking out .engineering worktree..."
    if ! ensure_worktree ".engineering" "$TARGET_BRANCH"; then
        echo "[FAIL] Could not check out .engineering worktree"
        exit 1
    fi
    echo ""
    echo "Note: .engineering is a worktree of branch '$TARGET_BRANCH'."

    cd "$REPO_ROOT"

    migrate_existing_data "$ENGINEERING_DIR"
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
