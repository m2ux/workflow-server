# Workflows

This orphan branch holds the workflow definitions the MCP Workflow Server loads, and the artifacts that belong to those definitions: judgements about them, recorded walks of them, and the documentation of how this tree is arranged.

Authoring procedure — adding a workflow, resource or technique, and how definition files link — lives in [`docs/`](docs/README.md). What each folder at this root is *for*, and what it holds, is in that folder's own README.

## Named roots

Each folder at this branch's root is a kind of content. A walk that loads the workflows operators run enters `corpus/` and skips the other kind names.

A directory at any depth under `corpus/` that holds `techniques/`, `resources/` or `routines/` is a **namespace**, and every reference reaches it by that directory's name. One that also holds a `workflow.yaml` is a **workflow** — a product an operator starts. One that does not is a **library**: shared operations any workflow binds, with no graph of its own. Grouping folders hold namespaces and name nothing themselves.

```
<branch root>
├── corpus/                         # workflows and libraries — corpus/README.md
│   ├── README.md
│   ├── {workflow-id}/
│   │   ├── README.md
│   │   ├── workflow.yaml
│   │   ├── activities/
│   │   ├── techniques/
│   │   └── resources/
│   ├── specimens/                  # worked examples of a form — specimens/README.md
│   │   └── {specimen-id}/
│   └── support/                    # libraries every workflow binds — support/README.md
│       └── {namespace}/
│           └── techniques/
├── ledgers/                        # debt ledgers — ledgers/README.md
├── walks/                          # recorded walks — walks/README.md
├── docs/                           # how to add to this tree — docs/README.md
├── LICENSE
├── README.md
└── .github/
```

### corpus

Every definition lives here — the workflows an operator starts, and the libraries they bind. A directory's name is the id every reference uses, and a `workflow.yaml` beside it is what makes that directory a product rather than a library. Grouping folders under this root organise the tree and name nothing of their own. Discovery enters this folder when it is pointed at the branch root. Contents: [`corpus/README.md`](corpus/README.md).

### specimens

A specimen is a worked example of a form. An author copies from it when creating a workflow that needs that form, and a test drives it so the form stays loadable and observable. They sit at `corpus/specimens/` so they travel with the other definitions. `specimens/` is a grouping folder: discovery walks it, and each child that holds a `workflow.yaml` is a workflow reached by its directory name. Contents: [`corpus/specimens/README.md`](corpus/specimens/README.md).

### support

A library is a namespace of shared operations that declares no workflow. Libraries sit at `corpus/support/` because each belongs to no single product and to every one that reaches it. `support/` is a grouping folder and appears in no reference — a library is reached by its own directory name, `git::commit-regular-files`. Contents: [`corpus/support/README.md`](corpus/support/README.md).

### ledgers

A check that walks every definition will surface sites that are not all the same kind of problem — a defect to fix now, real debt to keep visible, something correct by design. A **debt ledger** is the file that keeps those judgements separate, so classified debt stays counted and quiet, a live bug stays red, and an unclassified finding is reported. Those files live here, next to the definitions they judge. A check pointed at this branch's root reads this folder. Contents: [`ledgers/README.md`](ledgers/README.md).

### walks

A coverage walk records what it saw: snapshots of delivery, a stamp of which corpus commit was measured, and a ratchet of which checkpoint options were exercised. Those files live here so a later walk compares against this tree. The coverage job and the snapshot walks run on pull requests to this branch. Contents: [`walks/README.md`](walks/README.md).

### docs

Documentation of this tree's layout — how the named roots are arranged, how to add a workflow, resource or technique — lives here. Contents: [`docs/README.md`](docs/README.md).

## Precedence: workflow-local → `meta`

Technique resolution is workflow-local first, then `meta`. The
`meta` workflow's `techniques/` and `resources/` carry double duty — they are
both the local content for the meta workflow itself AND the cross-workflow
shared layer for every other workflow. Open that workflow's directories for
what they currently hold.

## Worktree Setup

```bash
git worktree add ./workflows workflows
```

## Adding Content

See [`docs/README.md`](docs/README.md).

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
