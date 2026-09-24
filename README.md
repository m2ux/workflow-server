# Workspace

The `workspace` branch is an exemplar of an agentic workspace. Another repository forks this branch, commits the components it adds, and updates from upstream to take changes to the rules, skills, and scripts.

The committed tree holds the kickoff and three Cursor folders: this directory, `.engineering/artifacts/planning`, and `.worktrees`. It holds no project worktrees. Those are added in the fork.

```text
./
├── AGENTS.md
├── CLAUDE.md
├── .mcp.json
├── .cursor/
├── .claude/
├── .agents/
├── rules/
├── skills/
├── config/
├── docs/
├── scripts/
│   ├── deploy-workspace.sh        # checkout the tempalte workspace
│   ├── deploy-engineering.sh      # deploy engineering
│   ├── add-component.sh           # add a project component
│   └── bump-project.sh            # fast-forward project worktrees
├── <name>>.code-workspace         # workspace root, planning, work trees
├── .project/<component-name>/     # project component primary worktree
├── .engineering/                  # engineering deployment
└── .worktrees/<slug>/             # feature worktrees
```
## Setup

1. Navigate to the directory that should contain the checkout

2. To checkout the template workspace, run:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/workspace/scripts/deploy-workspace.sh <workspace-name> | bash
   ```

3. From that checkout, deploy the engineering branch with:

   ```bash
   ./scripts/deploy-engineering.sh
   ```
> This creates the `.engineering` submodule at the checkout root.

4. Add project components to the workspace with:

   ```bash
   ./scripts/add-component.sh <repo-path> <branch> <name> [display-name]
   ```
> Creates `.project/<name>` as a worktree of `<branch>` and adds that folder to the workspace file.

5. Fast-forward every worktree under `.project/` with:

   ```bash
   ./scripts/bump-project.sh
   ```
