# Agentic Workspace

An exemplar agentic workspace layer on top of any project. It aggregates all workspace-level config, hooks, rules, scripts etc such that multiple working environments for agentic and standard engineering can be supported simultaneously without cluttering the root of any given project. It includes helper scripts to check-out, fork and setup individual project component(s) held in external repos for the agents to work on. It is designed to be forked so that the workspace shape and config can be re-used and easily updated from upstream as it evolves.

```text
./
├── AGENTS.md                      # Workspace instructions for agents (Source)
├── CLAUDE.md                      # workspace instructions for agents (Claude shaped)
├── .mcp.json                      # MCP servers (Claude shaped)
├── .cursor/                       # Cursor project configuration
├── .claude/                       # Claude project configuration
├── .agents/                       # Agent config (Codex shaped)
├── rules/                         # Agent rules source
├── skills/                        # Agent skills source
├── config/                        # Reusable config (various IDEs)
├── hooks/                         # Hook scripts (Claude shaped for now. TBD: needs generalising)
├── docs/                          # Workspace documentation
├── scripts/
│   ├── deploy-workspace.sh        # checkout the template workspace
│   ├── fork-workspace.sh          # Create a fork from this checkout
│   ├── deploy-engineering.sh      # Deploy engineering worktree
│   ├── add-component.sh           # Add a project component from an external repo
│   ├── bump-project.sh            # Fast-forward project worktrees
│   ├── update-workspace.sh        # Merge upstream workspace tempate updates into this checkout
│   ├── submit-upstream.sh         # Raise a pull request to contribute local workspace changes to upstream
│   └── raise-pr.sh                # Raise a pull request against a local feature worktree
├── cursor.code-workspace          # Cursor multi-root workspace
├── .project/                      # Project component worktree root
├── .engineering/                  # Engineering artifacts worktree
└── .worktrees/                    # Feature worktrees
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
> This checks out the `engineering` branch as a worktree at `.engineering/`.

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
> `<slug>` is the directory under `.worktrees/`. The script finds the component under `.project/` that owns that worktree. The base is the branch checked out there. The head is the worktree branch. Without `--body`, the body is the commit list from the git log. When `<slug>` is a checkout under `.project/`, that checkout's changes move to `.worktrees/<slug>-<datetime>` and the checkout returns to its upstream branch.
