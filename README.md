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
│   ├── activities/           # Lifecycle activities (indexed)
│   │   └── {NN}-{id}.toon    # 00-discover-session, 01-initialize-session, ...
│   ├── resources/            # Reference material (indexed)
│   │   └── {NN}-{name}.md    # 00-bootstrap-protocol, 01-activity-worker-prompt, ...
│   └── skills/               # Universal skills (indexed, auto-resolved across workflows)
│       └── {NN}-{id}.toon    # 00-session-protocol, 01-agent-conduct, ...
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

Skills are referenced by canonical ID (the filename minus the `NN-` prefix). The numeric prefix orders the files for humans; the loader strips it.

| Skill | Description |
|-------|-------------|
| [`session-protocol`](meta/skills/00-session-protocol.toon) | Session lifecycle protocol: token mechanics, checkpoint-handle discipline, step manifests, resource-loading conventions |
| [`agent-conduct`](meta/skills/01-agent-conduct.toon) | Cross-cutting behavioural boundaries: file sensitivity, communication tone, attribution prohibition, operational discipline, checkpoint discipline, orchestrator discipline |
| [`state-management`](meta/skills/02-state-management.toon) | Concept reference for variable mutation, persist-after-activity, and adopted/recovered token semantics (state I/O via save_state/restore_state MCP tools) |
| [`version-control`](meta/skills/03-version-control.toon) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows |
| [`github-cli-protocol`](meta/skills/04-github-cli-protocol.toon) | GitHub CLI usage: GraphQL-deprecation workarounds, REST API for mutations |
| [`knowledge-base-search`](meta/skills/05-knowledge-base-search.toon) | Optimised concept-rag searches via pre-indexed domain maps |
| [`atlassian-operations`](meta/skills/06-atlassian-operations.toon) | Atlassian Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus-operations`](meta/skills/07-gitnexus-operations.toon) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor |
| [`meta-orchestrator`](meta/skills/08-meta-orchestrator.toon) | Inline meta-workflow role: checkpoint mediation, sub-agent dispatch, meta-level errors |
| [`activity-worker`](meta/skills/09-activity-worker.toon) | Engine logic for the activity-worker role: bootstrap, step iteration, checkpoint yielding, artifact production |
| [`workflow-orchestrator`](meta/skills/10-workflow-orchestrator.toon) | Engine logic for driving an arbitrary client workflow: doWhile-over-activities, transitions, persist hooks |
| [`harness-compat`](meta/skills/11-harness-compat.toon) | Harness-independent operations (spawn-agent, continue-agent, spawn-concurrent) abstracting cross-tool dispatch |

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
