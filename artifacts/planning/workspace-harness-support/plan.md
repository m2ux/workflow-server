# Shared harness policy

## Scope

The workspace supplies one policy to Claude Code, Cursor, and Codex. Shared
Python functions classify commands; adapters translate harness events and
decisions. Existing shell parsing, URL matching, and the bubblewrap launcher
remain the implementation foundation. Python's standard library is sufficient.

## Assessment

- The root `hooks/`, `rules/`, and `skills/` directories already hold common
  files. Claude and Cursor use links to these sources.
- Hook scripts combine classification with Claude event handling. The command
  allowlist lives in `.claude/settings.template.json`, and compound command
  classification reads Claude's global and project settings.
- Deployment renders Codex instructions and MCP configuration. It does not
  register enforcement hooks. `.agents/skills` already supplies Codex skills.
- Codex CLI 0.155.1 is installed. Its documented hooks normalize shell and
  unified execution to `Bash` with `tool_input.command`. Native hook registration
  is sufficient; an MCP proxy or replacement shell is unnecessary.
- Codex uses `PermissionRequest` for approval grants. A pre-tool `ask` response
  is unsupported and lets execution continue after reporting a hook error.
- Codex prefix rules cannot represent all existing exact and wildcard command
  patterns. The shared evaluator can retain their meaning without broadening
  them into prefixes.
- Hosted Codex web tools do not pass through local hooks. URL policy remains
  enforceable for local curl invocations; hosted web parity is unavailable.
- Codex requires review and trust of each non-managed hook definition. Generated
  configuration alone does not activate new hooks in an existing session.

Sources: [Codex hooks](https://learn.chatgpt.com/docs/hooks) and
[Codex command rules](https://learn.chatgpt.com/docs/agent-configuration/rules).

## Implementation sequence

1. Extract a neutral request and decision contract. Keep classification separate
   from JSON input/output and harness settings lookup. Evaluate prohibitions and
   confirmation requirements before approval grants.
2. Store workspace permission policy in common configuration. Render Claude
   permissions from that source and use it directly for shared classification.
   Keep Claude-specific settings outside the shared policy.
3. Add small Claude and Codex event adapters. Cursor's built-in Claude import
   provides its adapter. Preserve supported native semantics and document each
   unavailable equivalent. Use Codex's documented pre-tool and permission-request
   events for the common evaluator.
4. Connect adapter configuration to workspace deployment and provide a local
   render command. Reuse existing instruction and skill links; generate only
   files whose harness format differs.
5. Verify command decisions, precedence, malformed input, paths, adapter output,
   and deployment using representative fixtures. Check generated configuration
   against available harness schemas and CLI validation.
6. Commit the shared core and integrations as discrete changes, deliver them to
   the workspace branch, and push. Report activation steps and parity limits.

## Decisions

- Codex target surfaces: current environment, CLI, and IDE use the same project
  configuration. This is the working scope in the absence of a narrower request.
- Codex confirmation-only hazards delegate to native approvals, as requested.
  The adapter withholds its automatic grant; Codex determines whether to prompt.
- Cursor imports Claude hooks through its built-in third-party configuration
  support. There is one registration per harness execution path.

## Progress

- [x] Inspect workspace policy and Codex integration contracts.
- [x] Extract common policy and classifiers.
- [x] Connect harness adapters and deployment.
- [x] Validate decisions and generated configuration.
- [x] Commit and push the completed implementation.
- [x] Measure adapter outcomes against the preceding Claude hook pipeline.

## Validation evidence

Observations come from `fe430e51` in a linked worktree of
`workspace-harness-support`, run from a host shell because the containment check
launches its own bubblewrap sandbox.

### Harness suite

`python3 scripts/test-harnesses.py` runs 49 standard-library tests in six
interpreters and reports OK for each: 13 shared classifier and policy tests, 16
workspace tests covering rendering, deployment, containment and the generated
entry points, 7 Claude adapter and edit-guard tests, 4 Codex adapter tests, 2
Claude configuration tests and 7 Codex configuration and trust tests. Command
fixtures are classified as data; no fixture is executed.

### Adapter equivalence

`scripts/test_refactor_equivalence.py` extracts revision `41717141`, the
preceding six-hook Claude pipeline, into a temporary checkout, deploys its
settings template there, and sends one corpus of 55 shell requests and 4 web
requests to both registrations. It compares the effective outcome: the merged
hook verdict, deny over ask over allow, or the allow-list match where every hook
abstains. Every request agrees. The baseline spread is 24 allow, 20 deny, 10
abstain and 4 ask.

Three mutations of the adapter confirm the comparison is sensitive. A grant
dropped from `config/permissions.json` diverges on `npm ci`, allow against
abstain. The same grant respelled `npm ci:*` fails the retired-spelling check,
because `matches_rule` honours a trailing ` *` alone. Hoisting the GitHub API
check above the dynamic-shell denial diverges on
`gh api repos/o/r -X DELETE && echo $HOME`, deny against ask.

A request the adapter cannot read is denied, where the preceding pipeline exited
silently and left the harness to prompt. The suite records that outcome rather
than asserting equivalence for it.

### Permission grant parity

All 169 permission grants match the Claude settings template of revision
`41717141`, under the spelling in which a trailing `:*` and a trailing ` *`
denote the same command pattern. `additionalDirectories` matches. No command
pattern in `config/permissions.json` ends in `:*`.

### Generated configuration

`python3 scripts/render-harnesses.py` writes `.claude/settings.json`,
`.codex/config.toml` and `.codex/hooks.json`, and `--check` then exits
successfully against them. The check reports all three as outdated in a checkout
where they have not been rendered.

### Deployment script

`bash -n scripts/deploy-workspace.sh` reports no syntax error. Git whitespace
checks pass.

### Sandbox containment

The containment test launches a real bubblewrap subprocess and verifies project
writes, blocked sibling and symlink writes, network isolation and explicit extra
roots. Real linked-worktree fixtures verify the script and symlink boundaries.

### Codex plugin discovery

Codex discovers hooks from plugins it has installed, so the workspace carries a
local marketplace of one plugin and `install_plugin.py` registers it during
deployment. The plugin cache keys on version, and the rendered version derives
from the registration's content, so a changed registration installs as a new
version. A machine without Codex skips the step and still deploys the other
harnesses.

### Codex runtime

`python3 .codex/scripts/check_runtime.py --codex ~/.local/bin/codex` starts
standalone CLI 0.157.1 without a model turn. It reports `instructions_match` and
`skill_link_resolves` true, with no warnings and no errors, and
`discovered_hooks` holding `preToolUse` and `permissionRequest`, each enabled.
`ready` is true and the check exits successfully. Both registrations are listed
under `awaiting_trust_review`, which a person clears through `/hooks`.

### Documented paths

Every script path `rules/bash-composition.md` and `docs/harness.md` name is read
out of those documents and resolved against the branch. Seventeen are named and
seventeen resolve, the corpus edit guard at
`skills/workflow-canon/scripts/edit_guard.py` among them, which
`.claude/hooks/edit_guard.py` also hard-codes.

### Live enforcement

No session has been observed applying a workspace hook decision to a tool call,
in any of the three harnesses. Hook trust review and observed live dispatch
remain outstanding, and both need an interactive session, so neither is
reachable from a non-interactive run. The adapter contract tests prove that an
adapter decides correctly when it is called; they establish nothing about
whether a harness calls it.

AC22 and AC23 are deferred on that basis. Codex enforces no local command checks
today, so a registration awaiting its trust review leaves every harness where it
stands and nothing regresses while they are outstanding.

## Delivery

- Workspace commits `b722557b` and `7efca6e3` are on `origin/workspace`.
- Machine-local configuration is rendered in the active workspace and passes
  the renderer's drift check. Its existing MCP server configuration is retained.
- The user reviews the two Codex hook registrations through `/hooks` in a new
  session. Hosted web tools remain outside local hook coverage.

## Harness directory ownership

Harness-specific adapters and renderers live under `.claude/<function>` and
`.codex/<function>`. Root folders contain shared policy, protocol utilities,
and rendering orchestration. Hook directories link explicitly to shared code;
the common rules and skills retain their existing links.

- [x] Separate harness-specific implementation and update links.
- [x] Verify generated entry points and adapter behavior.
- [x] Commit, render active configuration, and push.

Seventeen tests pass across shared policy, renderer orchestration, and the
harness-owned adapter/configuration suites. Generated hook commands execute the
relocated adapters from a different working directory. Shared symlinks resolve
to the root sources. Codex trust setup also belongs to its configuration adapter.
Implementation commit `7a5aee2d` is published on `workspace`; active workspace
configuration is rendered and passes the drift check.
