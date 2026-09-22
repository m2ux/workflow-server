# Support libraries

A **library** is a namespace of shared operations that declares no workflow of its own. It belongs to no single product and to every product that reaches it, which is what puts it here at the corpus root.

`support/` is a grouping folder: it appears in no reference. Each library is reached by its own directory name — `git::commit-regular-files` in a step binding, [`/git/techniques/commit-regular-files.md`](git/techniques/commit-regular-files.md) in a prose link, and `git.explicit-commit` for a rule the library's root index declares. Moving a library to another parent changes none of those.

| Library | Capability |
|---------|------------|
| [`git`](git/techniques/TECHNIQUE.md) | Host-repository derivation from git, worktrees and the paths they stand at, conventional commits, regular-versus-submodule commit workflows, branch push and merge, three-dot change surface |
| [`github`](github/techniques/TECHNIQUE.md) | GitHub pull-request and issue tasks; sole home of REST `gh api` recipes |
| [`atlassian`](atlassian/techniques/TECHNIQUE.md) | Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus`](gitnexus/techniques/TECHNIQUE.md) | Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, graph operations |
| [`cargo`](cargo/techniques/TECHNIQUE.md) | Cargo subcommands, each carrying the resource budget that holds a compile inside its host |
| [`concept-rag`](concept-rag/techniques/TECHNIQUE.md) | Knowledge-base search over pre-indexed domain maps, via the concept-rag MCP server |
| [`conformance`](conformance/README.md) | The case-report shape a specimen holds one library run to, under a positive and a negative binding |

## A library directory

`<namespace>/techniques/TECHNIQUE.md` is the namespace root index, holding the inputs a library's operations share and the rules the whole library is held to. Each `<op>.md` beside it is one operation, addressed `<namespace>::<op>`. How a base contract reaches the operations beneath it is defined in [workflow-canonical](/meta/resources/workflow-canonical.md#base-contract-inheritance). A `routines/` directory beside `techniques/` holds named runs of those operations, addressed `<namespace>::<name>`. The grain between an operation and a run is [Atomic Techniques; Compose at Activities](/canon/resources/design-principles.md#26-atomic-techniques-compose-at-activities).

A library declares no `workflow.yaml`, so discovery offers none of these to an operator and no coverage walk enters one. What measures them is the reference guards — an operation nothing binds, an input nothing produces, a rule cited in prose — and the drift walk over every workflow that binds them.
