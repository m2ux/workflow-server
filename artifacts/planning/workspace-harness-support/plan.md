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

## Validation evidence

- Fourteen standard-library tests pass, including command decision fixtures,
  imported Cursor events, Codex native approval delegation, and rendering drift.
- All 169 permission grants match the original Claude template after normalizing
  its equivalent shell pattern spellings.
- Deployment Bash syntax and Git whitespace checks pass.
- Installed Codex CLI 0.155.1 reports hooks enabled and its app-server starts with
  strict configuration validation against the generated worktree configuration.
- Hook invocation tests exercise the registered dispatcher from a different
  working directory. Live hook activation requires Codex's user trust review.

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
