# Workflows

This orphan branch contains workflow definitions, activities, techniques, and resources for the MCP Workflow Server.

Authoring — named roots, adding a workflow, and the technique file contract — lives in [`docs/`](docs/README.md).

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (YAML definitions) ← You are here

## Named roots

```
<branch root>
├── corpus/                         # product workflows; id is the directory name
│   └── {workflow-id}/
│       ├── README.md
│       ├── workflow.yaml
│       ├── activities/
│       ├── techniques/
│       └── resources/
├── ledgers/                        # triage verdicts on this corpus
├── walks/                          # snapshots, stamp, option-coverage ratchet
├── specimens/                      # corpus-only test workflows
│   └── fan-conformance/
├── docs/                           # authoring contracts for this branch
├── LICENSE
├── README.md
└── .github/                        # verify-corpus.yml
```

### Precedence: workflow-local → `meta`

Technique resolution is workflow-local first, then `meta`. The
`meta` workflow's `techniques/` and `resources/` carry double duty — they are
both the local content for the meta workflow itself AND the cross-workflow
shared layer for every other workflow. The
[workflow-canonical](./corpus/meta/resources/workflow-canonical.md) resource
defines the ontology and section conventions that every technique follows.

## Available Workflows

| Workflow | Description |
|----------|-------------|
| [`work-package`](corpus/work-package/) | Single work package implementation (issue → PR → merge) |
| [`work-packages`](corpus/work-packages/) | Multi-package planning for large initiatives |
| [`substrate-node-security-audit`](corpus/substrate-node-security-audit/) | Fully automated multi-phase AI security audit for Substrate-based node codebases |
| [`cicd-pipeline-security-audit`](corpus/cicd-pipeline-security-audit/) | Fully automated CI/CD pipeline security audit detecting source-to-sink injection vulnerabilities in GitHub Actions |
| [`prism`](corpus/prism/) | Structural analysis through cognitive lenses — 46 prisms across 11 families, 4 pipeline modes |
| [`prism-update`](corpus/prism-update/) | Sync the prism workflow's resources and routing with upstream agi-in-md changes |
| [`prism-evaluate`](corpus/prism-evaluate/) | Multi-dimensional evaluation of proposals, documents, or codebases through configurable analytical dimensions mapped to prism lenses |
| [`workflow-authoring`](corpus/workflow-authoring/) | Create, update, or audit workflow definitions — guided elicitation, one criteria walk per target, and structural gates on removals and commit |
| [`workflow-design`](corpus/workflow-design/) | **Deprecated** — start `workflow-authoring` instead. Retained only until the sessions already in flight against it finish |

## Universal Techniques ([corpus/meta/techniques/](corpus/meta/techniques/))

Available for any workflow session, resolved via the workflow-local → `meta` fallback chain.

Techniques are referenced by canonical ID (the file/folder slug). Standalone techniques live at `corpus/meta/techniques/<slug>.md`; container techniques live at `corpus/meta/techniques/<group>/TECHNIQUE.md` with one `<sub>.md` per nested technique.

| Technique | Description |
|-----------|-------------|
| [`workflow-engine`](corpus/meta/techniques/workflow-engine/TECHNIQUE.md) | Protocol and rules for workflow execution: session lifecycle (resume or create), activity dispatch, transition evaluation, checkpoint protocol. State persistence is server-managed (atomic `session.json` + `.session-token` seal write on every authenticated call). |
| [`agent-conduct`](corpus/meta/techniques/agent-conduct.md) | Cross-cutting behavioural boundaries every agent is held to: file sensitivity, communication tone, attribution prohibition, interaction, operational discipline, checkpoint discipline |
| [`orchestrator-conduct`](corpus/meta/techniques/orchestrator-conduct.md) | Boundaries only an orchestrator can honour: no domain work, one level of indirection, dispatch on resume, commit scope, automatic transitions, no ad-hoc interaction |
| [`version-control`](corpus/meta/techniques/version-control/TECHNIQUE.md) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows |
| [`github-cli-protocol`](corpus/meta/techniques/github-cli-protocol/TECHNIQUE.md) | GitHub PR and issue tasks; sole home of REST `gh api` recipes |
| [`knowledge-base-search`](corpus/meta/techniques/knowledge-base-search/TECHNIQUE.md) | Optimised concept-rag searches via pre-indexed domain maps |
| [`atlassian-operations`](corpus/meta/techniques/atlassian-operations/TECHNIQUE.md) | Atlassian Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus-operations`](corpus/meta/techniques/gitnexus-operations/TECHNIQUE.md) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor |
| [`harness-compat`](corpus/meta/techniques/harness-compat/TECHNIQUE.md) | Harness-independent operations (spawn-agent, continue-agent, spawn-concurrent) abstracting cross-tool dispatch |

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflows workflows
```

## Adding Content

See [`docs/README.md`](docs/README.md).

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
