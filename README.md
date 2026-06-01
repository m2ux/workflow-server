# Workflows

This orphan branch contains workflow definitions, activities, skills, and resources for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (TOON definitions) ← You are here

## Directory Structure

```
workflows/                    # Worktree checkout
├── meta/                     # Lifecycle workflow + cross-workflow shared layer
│   ├── README.md             # Meta documentation with Mermaid diagrams
│   ├── workflow.toon         # Meta definition (activities for lifecycle management)
│   ├── activities/           # Lifecycle activities (indexed)
│   │   └── {NN}-{id}.toon    # 00-discover-session, 01-initialize-session, ...
│   ├── techniques/           # Markdown techniques (canonical source of truth)
│   │   └── {slug}/SKILL.md   #   workflow-engine, agent-conduct, harness-compat, ...
│   │                         #   + sibling <op>.md files for op-as-child-files techniques
│   ├── resources/            # Markdown resources
│   │   └── {slug}/SKILL.md   #   bootstrap-protocol, activity-worker-prompt, workflow-canonical, ...
│   └── skills/               # LEGACY TOON skills (removed in Phase C of #125)
│       └── {NN}-{id}.toon
├── {workflow-id}/            # Each workflow folder
│   ├── README.md             # Workflow documentation with Mermaid diagrams
│   ├── workflow.toon         # Workflow definition
│   ├── activities/           # Activity subdirectory (indexed)
│   │   └── {NN}-{id}.toon    # Activities for this workflow
│   ├── techniques/           # Workflow-local markdown techniques
│   │   └── {slug}/SKILL.md   #   workflow-local technique (overrides any meta technique of the same name)
│   ├── resources/            # Workflow-local markdown resources
│   │   └── {slug}/SKILL.md
│   └── skills/               # LEGACY TOON skills (removed in Phase C of #125)
│       └── {NN}-{id}.toon
```

### Precedence: workflow-local → `meta`

Skill / technique resolution is workflow-local first, then `meta` ([ADR forthcoming under #125](https://github.com/m2ux/workflow-server/issues/125)). The
`meta` workflow's `techniques/` and `resources/` carry double duty — they are
both the local content for the meta workflow itself AND the cross-workflow
shared layer for every other workflow. The
[workflow-canonical](./meta/resources/workflow-canonical.md) resource
defines the ontology and section conventions that every `SKILL.md` follows.

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
| [`workflow-engine`](meta/skills/00-workflow-engine.toon) | Operations and rules for workflow execution: session lifecycle (resume or create), activity dispatch, transition evaluation, checkpoint protocol. State persistence is server-managed (atomic `session.json` + `.session-token` seal write on every authenticated call). |
| [`agent-conduct`](meta/skills/01-agent-conduct.toon) | Cross-cutting behavioural boundaries: file sensitivity, communication tone, attribution prohibition, operational discipline, checkpoint discipline, orchestrator discipline |
| [`version-control`](meta/skills/02-version-control.toon) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows |
| [`github-cli-protocol`](meta/skills/03-github-cli-protocol.toon) | GitHub CLI usage: GraphQL-deprecation workarounds, REST API for mutations |
| [`knowledge-base-search`](meta/skills/04-knowledge-base-search.toon) | Optimised concept-rag searches via pre-indexed domain maps |
| [`atlassian-operations`](meta/skills/05-atlassian-operations.toon) | Atlassian Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus-operations`](meta/skills/06-gitnexus-operations.toon) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor |
| [`harness-compat`](meta/skills/07-harness-compat.toon) | Harness-independent operations (spawn-agent, continue-agent, spawn-concurrent) abstracting cross-tool dispatch |

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

**Techniques (markdown source of truth):**
1. Create `{workflow-id}/techniques/{slug}/SKILL.md` (or `meta/techniques/{slug}/SKILL.md` for the cross-workflow shared layer)
2. Follow the canonical sections defined in [meta/resources/workflow-canonical/SKILL.md](./meta/resources/workflow-canonical.md)
3. For flat operation libraries (`cargo-operations`, `gitnexus-operations`, ...), add sibling `{op}.md` children (no frontmatter) — the loader materialises them into the technique's `operations` map keyed by op basename
4. Commit to this branch

**Skills (legacy TOON, removed in Phase C of #125):**
1. The `{workflow-id}/skills/{NN}-{skill-id}.toon` and `meta/skills/{NN}-{skill-id}.toon` files predate the markdown migration and remain in place during the transition window only
2. Authoring new content here is discouraged — use the markdown technique shape above instead

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
