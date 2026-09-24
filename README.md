# Workspace

The `workspace` branch is an exemplar of an agentic workspace. Another repository forks this branch, commits the components it adds, and updates from upstream to take changes to the rules, skills, and scripts.

The committed tree holds the kickoff and four Cursor folders: this directory, `.project`, `.engineering/artifacts/planning`, and `.worktrees`. `.project` shows every component checkout. The exemplar holds none. Those are added in the fork.

```text
./
├── AGENTS.md                      # workspace instructions for agents
├── CLAUDE.md                      # workspace instructions for Claude
├── .mcp.json                      # MCP servers
├── .cursor/                       # Cursor project configuration
├── .claude/                       # Claude Code project configuration
├── .agents/                       # agent skills
├── rules/                         # always-applied agent rules
├── skills/                        # agent skills
├── config/                        # hook allowlists
├── hooks/                         # Claude hook scripts
├── docs/                          # workspace documentation
├── scripts/
│   ├── deploy-workspace.sh        # checkout the tempalte workspace
│   ├── fork-workspace.sh          # create a fork from this checkout
│   ├── deploy-engineering.sh      # deploy engineering
│   ├── add-component.sh           # add a project component
│   ├── bump-project.sh            # fast-forward project worktrees
│   ├── update-workspace.sh        # merge template updates into this checkout
│   ├── submit-upstream.sh         # pull request fork commits to upstream
│   └── raise-pr.sh                # pull request a feature worktree
├── cursor.code-workspace          # Cursor multi-root workspace
├── .project/                      # project component checkouts
├── .engineering/                  # engineering artifacts
└── .worktrees/                    # feature worktrees
```
## Setup

1. Navigate to the directory that should contain the checkout

2. To checkout the template workspace, run:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/workspace/scripts/deploy-workspace.sh | bash -s -- <workspace-name>
   ```

3. From that checkout, create a fork with:

   ```bash
   ./scripts/fork-workspace.sh <repo>
   ```
> Creates a fork of this checkout at `<repo>`. `<repo>` is owner/name or a git URL. The branch is the name given to deploy-workspace. The local branch takes that name, and the commits are pushed there. The template remote becomes upstream.

4. From that checkout, deploy the engineering branch with:

   ```bash
   ./scripts/deploy-engineering.sh
   ```
> This creates the `.engineering` submodule at the checkout root.

5. Add project components to the workspace with:

   ```bash
   ./scripts/add-component.sh <repo> <branch> [name]
   ```
> `<repo>` is owner/name or a git URL. The worktree at `.project/<name>` is the local checkout of `<branch>`. `<name>` defaults to `<branch>`. The project folder in the workspace file shows it.

6. Fast-forward every worktree under `.project/` with:

   ```bash
   ./scripts/bump-project.sh
   ```

7. Merge upstream template updates into this checkout with:

```bash
./scripts/update-workspace.sh
```
> Fetches branch `workspace` from the `upstream` remote and merges it into the current branch.

8. Open a pull request for this fork's commits against upstream `workspace` with:

```bash
./scripts/submit-upstream.sh
```
> Pushes the current branch to `origin` and opens a pull request on the `upstream` repository. The base is branch `workspace`. When that pull request is already open, the script prints its URL.

9. Open a pull request for a feature worktree with:

```bash
./scripts/raise-pr.sh <slug> [--body=TEXT]
```
> `<slug>` is the directory under `.worktrees/`. The script finds the component under `.project/` that owns that worktree. The base is the branch checked out there. The head is the worktree branch. Without `--body`, the body is the commit list from the git log. When `<slug>` is a checkout under `.project/`, that checkout's changes move to `.worktrees/<slug>` and the checkout returns to its upstream branch.
