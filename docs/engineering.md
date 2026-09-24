# Engineering Artifacts

Any project accumulates engineering content — plans, decision records, session state — and where that content lives is a choice worth making deliberately. These patterns hold for every project. What suits a single repository owning its own history is not what suits an organisation running a dozen of them, and neither suits an experiment.

`[scripts/deploy-engineering.sh](../scripts/deploy-engineering.sh)` sets this up, run from the workspace checkout.

## Patterns

`scripts/deploy-engineering.sh` supports three layouts. Pick one per project, or per organisation convention:


| Pattern                         | Command                                                                         | Where engineering history lives                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Same-repo orphan** (default)  | `./scripts/deploy-engineering.sh` or `./scripts/deploy-engineering.sh --orphan` | Orphan branch `engineering` on **this** project's remote; the project tracks it via a `.engineering` submodule                                                                                                               |
| **Shared engineering monorepo** | `./scripts/deploy-engineering.sh --orphan <engineering-remote-url>`             | **External** engineering remote; one **project-named branch** per project (branch name = project directory basename). Many projects share one engineering remote; each keeps planning and decision records on its own branch |
| **In-branch**                   | `./scripts/deploy-engineering.sh --in-branch`                                   | `.engineering/` as ordinary files on the current project branch                                                                                                                                                              |




### Same-repo orphan (default)

Best when a single project owns its engineering history.

1. Keep the project checkout at its own directory.
2. Run `./scripts/deploy-engineering.sh` (or `./scripts/deploy-engineering.sh --orphan`) from the workspace checkout. This creates orphan branch `engineering` on the project remote and adds `.engineering` as a submodule on the default branch.
3. Planning lives under `<project>/.engineering/`.



### Shared engineering monorepo

Best when several projects share one engineering remote and each product default branch stays free of that history.

- One private (or internal) git remote holds engineering for several projects.
- Deploy with the external URL:

```bash
./scripts/deploy-engineering.sh --orphan git@host:org/shared-engineering.git
```

  The URL is yours.

- The script creates or uses branch `<project-name>` on that remote (basename of the project directory) and wires the project's `.engineering` submodule to it.
- Each further project repeats deploy with the same engineering remote and receives its own branch.
- After deploy, open the `.engineering` submodule in the checkout (`git submodule update --init -- .engineering`), including an external remote.



### In-branch

Best for a simple or experimental project.

1. Run `./scripts/deploy-engineering.sh --in-branch`.
2. `.engineering/` lives as ordinary files on the current project branch.
3. Planning uses the in-tree `.engineering/` under the checkout.



## Deploy entry point

From the workspace checkout:

```bash
./scripts/deploy-engineering.sh   # or --orphan / --orphan <url> / --in-branch
```

Full flags: `./scripts/deploy-engineering.sh --help`.

## After deploy

The checkout holds `.engineering/` at its root. Planning, decision records, reviews, and templates live in that tree.