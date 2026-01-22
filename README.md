# Workflows

This orphan branch contains workflow definitions, activities, skills, guides, and templates for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (TOON definitions) ← You are here

## Directory Structure

```
workflows/                    # Worktree checkout
├── meta/                     # Bootstrap workflow (manages other workflows)
│   ├── meta.toon             # Meta workflow definition
│   ├── intents/              # All activities (indexed, no separate index file)
│   │   └── {NN}-{id}.toon    # Individual activities (01-start-workflow, etc.)
│   └── skills/               # Universal skills (indexed)
│       └── {NN}-{id}.toon    # 00-activity-resolution, 01-workflow-execution
├── {workflow-id}/            # Each workflow folder
│   ├── {workflow-id}.toon    # Workflow definition
│   ├── guides/               # Guide subdirectory
│   │   └── {NN}-{name}.toon  # Guides (indexed)
│   ├── templates/            # Template subdirectory
│   │   └── {NN}-{name}.md    # Templates (indexed)
│   └── skills/               # Workflow-specific skills (indexed)
│       └── {NN}-{id}.toon    # Skills for this workflow
```

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflows workflows
```

## Adding Content

**New Workflow:**
1. Create `{workflow-id}/` directory
2. Add `{workflow-id}.toon` workflow definition
3. Add `guides/`, `templates/`, `skills/` subdirectories as needed
4. Commit to this branch

**Activities (meta only):**
1. Create `{NN}-{activity-id}.toon` in `meta/intents/`
2. Prefix with two-digit index (01, 02, 03, etc.)
3. Include `recognition[]` patterns for quick_match
4. Commit to this branch

**Guides:**
1. Create `{NN}-{name}.toon` in `{workflow-id}/guides/`
2. Prefix with two-digit index (00, 01, 02, etc.)
3. Commit to this branch

**Templates:**
1. Create `{NN}-{name}.md` in `{workflow-id}/templates/`
2. Prefix with two-digit index (01, 02, 03, etc.)
3. Commit to this branch

**Skills:**
1. Create `{NN}-{skill-id}.toon` with two-digit index
2. Universal: Create in `meta/skills/` (e.g., `00-activity-resolution.toon`)
3. Workflow-specific: Create in `{workflow-id}/skills/`
4. Commit to this branch

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
