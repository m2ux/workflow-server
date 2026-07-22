# Workflows

This orphan branch contains workflow definitions, activities, techniques, and resources for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (YAML definitions) ← You are here

## Directory Structure

```
workflows/                        # Worktree checkout
├── meta/                         # Lifecycle workflow + cross-workflow shared layer
│   ├── README.md                 # Meta documentation with Mermaid diagrams
│   ├── workflow.yaml             # Meta definition (activities for lifecycle management)
│   ├── activities/               # Lifecycle activities (indexed)
│   │   └── {NN}-{id}.yaml        # 00-discover-session, 01-initialize-session, ...
│   ├── techniques/               # Markdown techniques (canonical source of truth)
│   │   ├── TECHNIQUE.md          #   shared Inputs/Outputs/Rules for techniques here
│   │   ├── {slug}.md             #   standalone technique (agent-conduct, version-control, ...)
│   │   └── {group}/              #   container technique (workflow-engine, harness-compat, ...)
│   │       ├── TECHNIQUE.md      #     container technique / base contract
│   │       └── {sub}.md          #     one file per nested technique, addressed {group}::{sub}
│   └── resources/                # Markdown resources
│       └── {slug}.md             #   bootstrap-protocol, planning-readme, workflow-canonical, ...
├── {workflow-id}/                # Each workflow folder
│   ├── README.md                 # Workflow documentation with Mermaid diagrams
│   ├── workflow.yaml             # Workflow definition
│   ├── activities/               # Activity subdirectory (indexed)
│   │   └── {NN}-{id}.yaml        # Activities for this workflow
│   ├── techniques/               # Workflow-local markdown techniques
│   │   ├── TECHNIQUE.md          #   root base contract for this workflow
│   │   ├── {slug}.md             #   standalone technique (workflow-local takes precedence over a meta technique of the same name)
│   │   └── {group}/
│   │       ├── TECHNIQUE.md
│   │       └── {sub}.md
│   └── resources/                # Workflow-local markdown resources
│       └── {slug}.md
```

### Precedence: workflow-local → `meta`

Technique resolution is workflow-local first, then `meta`. The
`meta` workflow's `techniques/` and `resources/` carry double duty — they are
both the local content for the meta workflow itself AND the cross-workflow
shared layer for every other workflow. The
[workflow-canonical](./meta/resources/workflow-canonical.md) resource
defines the ontology and section conventions that every technique follows.

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

## Universal Techniques ([meta/techniques/](meta/techniques/))

Available for any workflow session, resolved via the workflow-local → `meta` fallback chain.

Techniques are referenced by canonical ID (the file/folder slug). Standalone techniques live at `meta/techniques/<slug>.md`; container techniques live at `meta/techniques/<group>/TECHNIQUE.md` with one `<sub>.md` per nested technique.

| Technique | Description |
|-----------|-------------|
| [`workflow-engine`](meta/techniques/workflow-engine/TECHNIQUE.md) | Protocol and rules for workflow execution: session lifecycle (resume or create), activity dispatch, transition evaluation, checkpoint protocol. State persistence is server-managed (atomic `session.json` + `.session-token` seal write on every authenticated call). |
| [`agent-conduct`](meta/techniques/agent-conduct.md) | Cross-cutting behavioural boundaries: file sensitivity, communication tone, attribution prohibition, operational discipline, checkpoint discipline, orchestrator discipline |
| [`version-control`](meta/techniques/version-control/TECHNIQUE.md) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows |
| [`github-cli-protocol`](meta/techniques/github-cli-protocol/TECHNIQUE.md) | GitHub CLI usage: GraphQL-deprecation workarounds, REST API for mutations |
| [`knowledge-base-search`](meta/techniques/knowledge-base-search/TECHNIQUE.md) | Optimised concept-rag searches via pre-indexed domain maps |
| [`atlassian-operations`](meta/techniques/atlassian-operations/TECHNIQUE.md) | Atlassian Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus-operations`](meta/techniques/gitnexus-operations/TECHNIQUE.md) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor |
| [`harness-compat`](meta/techniques/harness-compat/TECHNIQUE.md) | Harness-independent operations (spawn-agent, continue-agent, spawn-concurrent) abstracting cross-tool dispatch |

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflows workflows
```

## Adding Content

**New Workflow:**
1. Create `{workflow-id}/` directory
2. Add `workflow.yaml` workflow definition
3. Add `README.md` with Mermaid diagrams documenting the workflow
4. Add `activities/`, `resources/`, `techniques/` subdirectories as needed
5. Commit to this branch

**Activities:**
1. Create `{NN}-{activity-id}.yaml` in `{workflow-id}/activities/`
2. Prefix with two-digit index (01, 02, 03, etc.)
3. Connect activities with `transitions`; set the workflow's `initialActivity`
4. Commit to this branch

**Resources:**
1. Create `{NN}-{name}.md` in `{workflow-id}/resources/`
2. Prefix with two-digit index (00, 01, 02, etc.)
3. Commit to this branch

**Techniques (markdown source of truth):**
1. For a standalone technique, create `{workflow-id}/techniques/{slug}.md` (or `meta/techniques/{slug}.md` for the cross-workflow shared layer) with frontmatter (`metadata.version`), a required `## Capability` section, and optional `## Inputs` / `## Outputs` / `## Protocol` / `## Rules` sections.
2. For a container technique (such as `gitnexus-operations`), create `{group}/TECHNIQUE.md` as the container technique/base contract plus one `{group}/{sub}.md` per nested technique. Each nested technique file carries `metadata.version` frontmatter and a `## Capability` section. Nested techniques are addressed `{group}::{sub}`.
3. Optionally add a per-workflow root `TECHNIQUE.md` at `{workflow-id}/techniques/TECHNIQUE.md` for shared Inputs / Outputs / Rules / Protocol (loader composition is defined in [meta/resources/workflow-canonical.md](./meta/resources/workflow-canonical.md)).
4. Follow the canonical sections defined in that same resource
5. Commit to this branch

Cross-reference links between techniques and resources are file-relative and end in the target's real filename (`<slug>.md`, `<group>/TECHNIQUE.md`, or `<group>/<sub>.md`).

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
