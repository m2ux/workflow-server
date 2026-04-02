# Workflows

This orphan branch contains workflow definitions, activities, skills, and resources for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (TOON definitions) ← You are here

## Directory Structure

```
workflows/                    # Worktree checkout
├── meta/                     # Skill and resource repository (excluded from list_workflows)
│   ├── README.md             # Meta documentation with Mermaid diagrams
│   ├── workflow.toon         # Meta definition (activities for lifecycle management)
│   ├── activities/           # All activities (indexed)
│   │   └── {NN}-{id}.toon    # 01-start-workflow, 02-resume-workflow, etc.
│   └── skills/               # Universal skills (indexed, auto-included on first get_skills)
│       └── {NN}-{id}.toon    # 00-session-protocol, 01-agent-conduct, etc.
├── {workflow-id}/            # Each workflow folder
│   ├── README.md             # Workflow documentation with Mermaid diagrams
│   ├── workflow.toon         # Workflow definition
│   ├── activities/           # Activity subdirectory (indexed)
│   │   └── {NN}-{id}.toon    # Activities for this workflow
│   ├── resources/            # Resource subdirectory (indexed)
│   │   └── {NN}-{name}.md    # Guidance resources
│   └── skills/               # Workflow-specific skills (indexed)
│       └── {NN}-{id}.toon    # Skills for this workflow
```

## Available Workflows

| Workflow | Description |
|----------|-------------|
| [`work-package`](work-package/) | Single work package implementation (issue → PR → merge) |
| [`work-packages`](work-packages/) | Multi-package planning for large initiatives |
| [`substrate-node-security-audit`](substrate-node-security-audit/) | Fully automated multi-phase AI security audit for Substrate-based node codebases |
| [`cicd-pipeline-security-audit`](cicd-pipeline-security-audit/) | Fully automated CI/CD pipeline security audit detecting source-to-sink injection vulnerabilities in GitHub Actions |
| [`prism`](prism/) | Structural analysis through cognitive lenses — 46 prisms across 11 families, 4 pipeline modes |
| [`prism-update`](prism-update/) | Sync the prism workflow's resources and routing with upstream agi-in-md changes |
| [`prism-evaluate`](prism-evaluate/) | Multi-dimensional evaluation of proposals, documents, or codebases through configurable analytical dimensions mapped to prism lenses |
| [`workflow-design`](workflow-design/) | Create or update workflow definitions with guided elicitation, schema expressiveness enforcement, and convention conformance |

## Universal Skills ([meta/skills/](meta/skills/))

Available for any workflow session.

| Skill | Description |
|-------|-------------|
| [`00-session-protocol`](meta/skills/00-session-protocol.toon) | Session lifecycle protocol: bootstrap sequence (start_session → get_skills → get_workflow → next_activity), token handling, step manifests, resource loading via get_resource |
| [`01-agent-conduct`](meta/skills/01-agent-conduct.toon) | Agent behavioral boundaries: file sensitivity, communication tone, resource loading discipline |
| [`02-execute-activity`](meta/skills/02-execute-activity.toon) | Bootstrap and execute a single workflow activity using get_step_skill for step-level skill loading |
| [`03-state-management`](meta/skills/03-state-management.toon) | Manage workflow state across sessions via save_state/restore_state |
| [`04-artifact-management`](meta/skills/04-artifact-management.toon) | Manage planning artifact folder structure and commit workflows |
| [`05-version-control-protocol`](meta/skills/05-version-control-protocol.toon) | Conventional commits, branch management, destructive operation guardrails |
| [`06-github-cli-protocol`](meta/skills/06-github-cli-protocol.toon) | GitHub CLI usage: GraphQL deprecation workarounds, REST API for mutations |
| [`07-knowledge-base-search`](meta/skills/07-knowledge-base-search.toon) | Optimise knowledge base searches via pre-indexed domain map |
| [`08-atlassian-operations`](meta/skills/08-atlassian-operations.toon) | Perform Atlassian Jira and Confluence operations via MCP |
| [`09-gitnexus-operations`](meta/skills/09-gitnexus-operations.toon) | Query codebases via knowledge graph for impact analysis, debugging, refactoring |
| [`10-orchestrator-management`](meta/skills/10-orchestrator-management.toon) | Consolidated orchestrator skill: workflow coordination, state management, worker dispatch, checkpoint presentation |
| [`11-worker-management`](meta/skills/11-worker-management.toon) | Consolidated worker skill: activity execution, step-level skill loading, checkpoint yielding, artifact production |

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflows workflows
```

## Adding Content

**New Workflow:**
1. Create `{workflow-id}/` directory
2. Add `workflow.toon` workflow definition
3. Add `README.md` with Mermaid diagrams documenting the workflow
4. Add `activities/`, `resources/`, `skills/` subdirectories as needed
5. Commit to this branch

**Activities:**
1. Create `{NN}-{activity-id}.toon` in `{workflow-id}/activities/`
2. Prefix with two-digit index (01, 02, 03, etc.)
3. For meta activities, include `recognition[]` patterns for intent matching
4. Commit to this branch

**Resources:**
1. Create `{NN}-{name}.md` in `{workflow-id}/resources/`
2. Prefix with two-digit index (00, 01, 02, etc.)
3. Commit to this branch

**Skills:**
1. Create `{NN}-{skill-id}.toon` with two-digit index
2. Universal: Create in `meta/skills/` (e.g., `00-session-protocol.toon`)
3. Workflow-specific: Create in `{workflow-id}/skills/`
4. Commit to this branch

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
