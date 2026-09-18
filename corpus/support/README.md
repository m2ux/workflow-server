# Support libraries

A **library** is a namespace of shared operations that declares no workflow of its own. It belongs to no single product and to every product that reaches it, so it sits here rather than inside one workflow's technique folder.

`support/` is a grouping folder: it appears in no reference. Each library is reached by its own directory name — `git::commit-regular-files` in a step binding, [`/git/techniques/commit-regular-files.md`](git/techniques/commit-regular-files.md) in a prose link, and `git.explicit-commit` for a rule the library's root index declares. Moving a library to another parent changes none of those.

| Library | Capability |
|---------|------------|
| [`git`](git/techniques/TECHNIQUE.md) | Host-repository derivation from git, worktrees, conventional commits, regular-versus-submodule commit workflows, branch push and merge |
| [`github`](github/techniques/TECHNIQUE.md) | GitHub pull-request and issue tasks; sole home of REST `gh api` recipes |
| [`atlassian`](atlassian/techniques/TECHNIQUE.md) | Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus`](gitnexus/techniques/TECHNIQUE.md) | Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, graph operations |

## A library directory

`<namespace>/techniques/TECHNIQUE.md` is the namespace root index. Its Inputs and Rules merge into every operation beneath it, so a shared input is declared once and a rule the whole library is held to lives in one place. Each `<op>.md` beside it is one operation, addressed `<namespace>::<op>`.

A library declares no `workflow.yaml`, so discovery offers none of these to an operator and no coverage walk enters one. What measures them is the reference guards — an operation nothing binds, an input nothing produces, a rule cited in prose — and the drift walk over every workflow that binds them.
