# Harness session validation

## Objective

Validate every executable harness component against real session conditions,
distinguishing direct adapter tests from hooks invoked by the Codex runtime.
Keep implementation and regression tests on workspace-harness-support, PR #934.

## Sequence

- [x] Inspect installed runtime, active workspace configuration, hook registration,
  trust, and the session's command and working-directory shapes.
- [x] Add behavioral coverage for shared classifiers, protocol failure handling,
  Claude/Cursor and Codex adapters, rendering, trust setup, and deployment wiring.
- [x] Exercise the installed runtime and sandbox with harmless operations; record
  which checks prove live dispatch and which only replay hook input.
- [x] Fix verified defects, run the complete suite, and update documentation and
  the PR with evidence and any activation requirements.
- [ ] Observe native hook execution in a session opened in the PR worktree after
  the client discovers the registrations and the user reviews their trust.

## Validation boundaries

Tests never execute destructive command fixtures or mutate remote services.
Settings and deployment tests use temporary homes and workspaces. Hook trust
requires the user's review; tests do not disable or manufacture it. A running
session without the PR's registered hooks cannot prove live policy enforcement.

## Coverage matrix

| Area | Required evidence |
| --- | --- |
| Shared policy | Positive/negative cases for every classifier; deny/ask/allow precedence; working-directory and path boundaries |
| Protocol/runtime | Actual normalized shell payloads, unknown tools/events, invalid JSON/types, settings failures, correct response event |
| Claude/Cursor | Event aliases, local grants, malformed settings, shell/web dispatch |
| Codex | Pre-tool denials, native approval grant/deny/delegation, MCP grant boundaries, generated matchers |
| Rendering | All permission categories, placeholders, rule selection/order, escaping, MCP preservation, stale output |
| Deployment/trust | Wiring, existing settings, repeated trust registration, quoted paths, invalid input |
| Session | Runtime version and loaded configuration; hook registration/trust; rules and skill discovery; safe shell and sandbox execution |

## Findings and results

Validation date: 2026-09-27. Branch: workspace-harness-support, PR #934.
Implementation commits: 8f15a92c (tests and fixes), 05b09c16 (runtime diagnostic).

- **41 tests pass** across six independently executed suites. The 24 added tests
  cover all shared executable modules and both harness integrations. Seventeen
  command cases run through each of Claude pre-tool, Codex pre-tool, and Codex
  approval handlers: 51 generated-entry-point classifications, plus web, MCP,
  malformed approval payloads, and working-directory overrides.
- The suite verifies all 169 shared permission grants, rule order and expansion,
  configuration drift, quoted and Unicode paths, repeated deployment from an
  isolated local checkout, and preservation of trusted settings.
- Real linked-worktree fixtures verify script location and symlink boundaries.
  A real bubblewrap subprocess permits project writes, blocks sibling writes
  and symlink escapes, blocks a host loopback listener, and permits an explicit
  additional writable root. The full suite runs from the host because this
  containment test starts its own sandbox.
- Tests exposed and fixed: trust setup reporting success for an explicitly
  untrusted project; appending to invalid TOML; deployment rewriting an embedded
  /home/ path component; and JSON surrogate escapes invalid in TOML for Unicode
  characters outside the Basic Multilingual Plane.
- Generated configuration drift, deployment shell syntax, and Git whitespace
  checks pass.

## Runtime evidence and outstanding gate

- This session's running process uses the Cursor extension binary, Codex
  0.154.0-alpha.6.2. The standalone installation reported 0.155.1 initially and
  0.157.1 at the final check. These were queried
  through initialize, hooks/list, and config/read, without starting model turns.
- The active workspace on branch workspace has no .codex/hooks.json. It has not
  received the PR's code or hook registrations. No enforcement claim is made for
  this conversation's existing tool calls.
- In the PR worktree, the generated instructions match the native runtime's
  effective configuration and the Codex skill link resolves. However, hooks/list
  returns an empty inventory for all tested versions, with no warnings or
  errors. Enabling the hooks feature explicitly does not change that result.
  The cause of this discovery failure is unresolved; it is not a passing check
  and cannot yet be attributed solely to hook trust.
- .codex/scripts/check_runtime.py reproduces the readiness check, returns exit 1
  for this state, and explicitly reports live_enforcement_verified=false.
- The user has been asked to inspect /hooks with the PR worktree selected and
  review the two workspace hook definitions if they appear. Native dispatch,
  native approval routing, and live denial verification remain pending. Claude
  and Cursor integration tests exercise their event contracts, not live clients.
- Configuration and hook trust were not changed in the active workspace or the
  user's Codex settings. No dangerous command fixture or remote mutation ran.
