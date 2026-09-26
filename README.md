# Agentic Workspace

An exemplar agentic workspace layer on top of any project. It aggregates all workspace-level config, hooks, rules, scripts etc such that multiple working environments for agentic and standard engineering can be supported simultaneously without cluttering the root of any given project. It includes helper scripts to check-out, fork and setup individual project component(s) held in external repos for the agents to work on. It is designed to be forked so that the workspace shape and config can be re-used and easily updated from upstream as it evolves.

Claude Code, Cursor, and Codex use common rules, skills, and command policy. Harness adapters and generated configuration connect these sources to each environment. See [harness setup and behavior](docs/harnesses.md).

```text
./
├── AGENTS.md                      # Workspace instructions for agents (Source)
├── CLAUDE.md                      # workspace instructions for agents (Claude shaped)
├── .mcp.json                      # MCP servers (Claude shaped)
├── .cursor/                       # Cursor project configuration
├── .claude/                       # Claude hooks, configuration adapters, and shared-source links
│   ├── hooks/
│   │   ├── adapter.py             # Claude and imported Cursor events; local settings lookup
│   │   ├── shared -> ../../hooks
│   │   └── test_adapter.py        # Claude and Cursor event tests
│   ├── scripts/
│   │   ├── render.py              # Render Claude settings and hook registration
│   │   ├── shared -> ../../scripts
│   │   └── test_config.py         # Settings and registered hook tests
│   ├── settings.template.json     # Claude-specific settings
│   └── settings.json              # Generated local settings (gitignored)
├── .agents/                       # Shared skill discovery for Codex
│   └── skills -> ../skills
├── .codex/                        # Codex adapters and generated local configuration
│   ├── hooks/
│   │   ├── adapter.py             # Codex events and native approval delegation
│   │   ├── shared -> ../../hooks
│   │   └── test_adapter.py        # Codex event and approval tests
│   ├── scripts/
│   │   ├── render.py              # Render Codex configuration and hook registration
│   │   ├── shared -> ../../scripts
│   │   ├── test_config.py         # Configuration and registered hook tests
│   │   └── trust.py               # Register project trust during deployment
│   ├── config.toml                # Generated local configuration (gitignored)
│   └── hooks.json                 # Generated hook registration (gitignored)
├── rules/                         # Agent rules source
├── skills/                        # Agent skills source
├── config/                        # Configuration data: permissions and URL policy
│   ├── compound-bash.json         # Additional grants for compound commands
│   ├── curl-allow.json            # Curl host and path grants
│   ├── permissions.json           # Shared command, file, web, MCP, and skill grants
│   └── webfetch-allow.json        # WebFetch host and path grants
├── hooks/                         # Shared classifiers, event protocol, and policy runtime
│   ├── block_dynamic_shell.py     # Detect dynamic shell constructs
│   ├── compound_bash_allow.py     # Evaluate compound command grants
│   ├── contracts.py               # Request and decision types
│   ├── curl_read_allow.py         # Evaluate read-only curl requests
│   ├── gate_gh_api_hazards.py      # Identify GitHub operations requiring confirmation
│   ├── permissions.py             # Load and expand shared permission data
│   ├── policy.py                  # Compose classifiers and decision precedence
│   ├── project_scripts.py         # Resolve project scripts and sandbox roots
│   ├── protocol.py                # Decode events and encode hook responses
│   ├── redirect_fs_mutation.py    # Check filesystem mutation sandboxing
│   ├── redirect_inline_eval.py    # Check interpreter sandboxing
│   ├── runtime.py                 # Run the hook request and decision pipeline
│   ├── test_policy.py             # Shared policy tests
│   └── webfetch_allow.py          # Evaluate web URL grants
├── docs/                          # Workspace documentation
│   └── harnesses.md               # Harness setup, behavior, and validation
├── scripts/
│   ├── deploy-workspace.sh        # checkout the template workspace
│   ├── render-harnesses.py        # Render local harness configuration
│   ├── rendering.py              # Shared rule-text and configuration rendering helpers
│   ├── sbx                       # Filesystem and network sandbox launcher
│   ├── test-harnesses.py          # Run shared and harness-owned test suites
│   ├── test_render_harnesses.py   # Rendering drift and shared-link tests
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
## Maintenance

### Merge upstream template updates into this checkout
Fetches branch `workspace` from the `upstream` remote and merges it into the current branch.
```bash
./scripts/update-workspace.sh
```
### Open a pull request for this fork's commits against upstream `workspace`
Pushes the current branch to `origin` and opens a pull request on the `upstream` repository. The base is branch `workspace`. When that pull request is already open, the script prints its URL.

```bash
./scripts/submit-upstream.sh
```
### Open a pull request for a feature worktree

* `<slug>` is the directory under `.worktrees/`. The script finds the component under `.project/` that owns that worktree. The base is the branch checked out there. The head is the worktree branch. Without `--body`, the body is the commit list from the git log.
* When `<slug>` is a checkout under `.project/`, that checkout's changes move to `.worktrees/<slug>-<datetime>` and the checkout returns to its upstream branch.

```bash
./scripts/raise-pr.sh <slug> [--body=TEXT]
```
