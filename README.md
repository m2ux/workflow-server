# Workflows

This orphan branch holds the workflow definitions the MCP Workflow Server loads, and the artifacts that belong to those definitions: judgements about them, recorded walks of them, and the documentation of how this tree is arranged.

Authoring procedure — adding a workflow, resource or technique, and how definition files link — lives in [`docs/`](docs/README.md). What each folder at this root is *for*, and what it holds, is in that folder's own README.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (YAML definitions) ← You are here

## Named roots

Each folder at this branch's root is a kind of content. A walk that loads the workflows operators run enters `corpus/` and skips the other kind names. `specimens` is skipped by name even as a child of `corpus/`, so a product list never includes a specimen. A workflow's id is the directory that holds its `workflow.yaml`.

```
<branch root>
├── corpus/                         # product workflows — corpus/README.md
│   ├── README.md
│   ├── {workflow-id}/
│   │   ├── README.md
│   │   ├── workflow.yaml
│   │   ├── activities/
│   │   ├── techniques/
│   │   └── resources/
│   └── specimens/                  # worked examples of a form — specimens/README.md
│       └── fan-conformance/
├── ledgers/                        # triage verdicts — ledgers/README.md
├── walks/                          # snapshots, stamp, ratchet — walks/README.md
├── docs/                           # how to add to this tree — docs/README.md
├── LICENSE
├── README.md
└── .github/                        # verify-corpus.yml, coverage.yml
```

### corpus

The workflows an operator starts live here: each is a directory that holds a `workflow.yaml`, and that directory's name is the id every reference uses. Grouping folders under this root organise the tree and name nothing of their own, so `corpus/work-package/workflow.yaml` is still the workflow `work-package`. Discovery enters this folder when it is pointed at the branch root. Contents: [`corpus/README.md`](corpus/README.md).

### specimens

A specimen is a worked example of a form. An author copies from it when creating a workflow that needs that form, and a test drives it so the form stays loadable and observable. Specimens are still workflows — they have a definition, activities and techniques — but they are not part of the product list. They sit at `corpus/specimens/` so they travel with the other definitions. Discovery skips any directory named `specimens`, so a walk of `corpus/` does not list them. Pointing `--root` or `--workflow-dir` at `corpus/specimens/` is how a job reaches them. Contents: [`corpus/specimens/README.md`](corpus/specimens/README.md).

### ledgers

A check that walks every definition will surface sites that are not all the same kind of problem — a defect to fix now, real debt to keep visible, something correct by design. A **debt ledger** is the file that keeps those judgements separate, so classified debt stays counted and quiet, a live bug stays red, and an unclassified finding is reported. Those files live here, next to the definitions they judge. Check programs live on `main` under `guards/`; they take `--root` at this branch's root and read this folder. Contents: [`ledgers/README.md`](ledgers/README.md).

### walks

A coverage walk records what it saw: snapshots of delivery, a stamp of which corpus commit was measured, and a ratchet of which checkpoint options were exercised. Those files live here so the engine's test suite can compare a later walk against this tree. The fourteen-workflow coverage job and the snapshot walks run on pull requests to this branch. Contents: [`walks/README.md`](walks/README.md).

### docs

Documentation of this tree's layout — how the named roots are arranged, how to add a workflow, resource or technique — lives here. The technique file contract (anatomy, addressing, composition, delivery) lives on `main` as [`docs/technique-protocol-specification.md`](https://github.com/m2ux/workflow-server/blob/main/docs/technique-protocol-specification.md), because it is an invariant of every corpus the engine loads, not of this one. Contents: [`docs/README.md`](docs/README.md).

## Precedence: workflow-local → `meta`

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
