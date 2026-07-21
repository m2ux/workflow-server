# Change Block Index

> feat/phase-1-agent-managed-worktree vs main · 14 files · 31 hunks · est. review ~16 minutes (30 sec/change)

## Instructions

Review changes in your side-by-side diff tool using this index for reference.
Click any row number to jump to its rationale paragraph for context on why the change was made.
Report row numbers for files with issues (e.g., "3, 7, 12") or "none" if all looks good.

| Row | Path | File |
|-----|------|------|
| [1](#block-1) | ./ | Dockerfile |
| [2](#block-2) | ./ | README.md |
| [3](#block-3) | ./ | SETUP.md |
| [4](#block-4) | ./ | docker-compose.yml |
| [5](#block-5) | docs/ | agent-managed-worktrees.md |
| [6](#block-6) | src/ | config.ts |
| [7](#block-7) | src/ | server.ts |
| [8](#block-8) | src/transports/ | http.ts |
| [9](#block-9) | src/utils/session/ | store.ts |
| [10](#block-10) | src/ | worktree-validator.ts |
| [11](#block-11) | tests/ | config.test.ts |
| [12](#block-12) | tests/ | http-transport.test.ts |
| [13](#block-13) | tests/ | session-store.test.ts |
| [14](#block-14) | tests/ | worktree-validator.test.ts |

## Block Rationale

### Block 1

Adds a Node 20 multi-stage image that builds and runs the MCP server over HTTP. Sets `WORKTREE_ROOT=/worktrees` (optional `PLANNING_SLUG`) so the container starts bound to the configured worktree root and writes planning artifacts under that root. Satisfies SC-5/SC-6 and gap G4 for the Phase 1 container contract.

### Block 2

Updates the root README MCP client example to pass `--workspace=/path/to/your/project` on `args` (matching the live `.cursor/mcp.json` pattern) and points readers to the agent-managed worktrees runbook. Surrounding prose names the three equivalent root binds (`--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`) and `PLANNING_SLUG`. Complements SETUP for SC-5/SC-6 migration visibility.

### Block 3

Documents operator migration for the required worktree root (`--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`), default planning slug, and `PLANNING_SLUG` override. Cursor and Claude Desktop MCP examples pass `--workspace` on `args` with `WORKFLOW_DIR` in `env`. States that agents create worktrees and initialise `.engineering` before the server writes artifacts, with session planning bind on `start_session` slug hints under the configured root. Closes the G5 documentation gap.

### Block 4

Introduces Compose with a RW bind of the host worktree root and RO mounts for workflows/schemas where appropriate. Planning paths derive under the RW-bound worktree root. Supports containerised Phase 1 layout and notes UID/GID alignment for agent-created trees.

### Block 5

New agent lifecycle runbook: identify repo → `git worktree add` under root → init `.engineering` → start server with required root → `start_session` with planning slug. Agents create worktrees and initialise `.engineering`; the server validates containment and writes artifacts (DP-1 / SC-5). Gives reviewers a single place to verify the architecture adaptation of the cloud brief.

### Block 6

Extends `loadConfig` with `WORKTREE_ROOT` as a third-precedence alias into the existing required `workspaceDir` bind, and resolves `PLANNING_SLUG` into `planningRelativeDir`. Updates `WorkspaceConfigError` messaging so operators see all three sources. Chosen over renaming `workspaceDir` to limit blast radius while meeting SC-1 and SC-3.

### Block 7

Calls `setPlanningRelativeDir` once in `createServer` so `planningRoot(workspaceDir)` keeps its one-argument signature for CRITICAL callers (`ensurePlanningFolder`, `findPlanningFolderBySlug`, `resolveSessionLocation`, and RegisterResourceTools / RenderToolsRegion flows). Dual apply with `loadConfig` covers both CLI and programmatic entry points.

### Block 8

Documents that `/ready`'s `checks.workspaceDir` is the configured worktree root; the JSON key stays `workspaceDir` for existing HTTP consumers. Makes SC-2 semantics explicit for operators. Behaviour of the existence gate is unchanged; messaging and tests confirm `WORKTREE_ROOT`-only startup still gates readiness.

### Block 9

Introduces module-level `activePlanningRelativeDir` + `setPlanningRelativeDir`, and wires `assertPathInsideRoot` into `ensurePlanningFolder` before mkdir. `planningRoot` still takes only `workspaceDir` (GitNexus: callers include `resolveSessionLocation`, `findPlanningFolderBySlug`, `ensurePlanningFolder`; processes RegisterResourceTools → PlanningRoot). Asserts derived planning paths stay inside the configured root before mkdir (SC-4).

### Block 10

Greenfield path-containment helper: separator-aware prefix check plus realpath canonicalisation for write-path helpers. Throws actionable `PathContainmentError` messages that name the root and guide agents to initialise `.engineering` under it. Matches the plan’s Task 1 containment boundary and post-audit always-realpath shape.

### Block 11

Covers `WORKTREE_ROOT` alone, CLI/`WORKFLOW_WORKSPACE`/`WORKTREE_ROOT` precedence, missing-root throw, and `PLANNING_SLUG` default/override/empty fallback. Locks SC-1 and SC-3 so brief naming cannot regress into cwd defaults or silent slug replacement. Expanded in the lean-audit pass to assert via public config/store behaviour rather than test-only getters.

### Block 12

Adds readiness coverage for a server started with `WORKTREE_ROOT` only (200 when root exists, 503 when not). Confirms the alias path participates in the same `/ready` gate as `--workspace` / `WORKFLOW_WORKSPACE`. Keeps JSON `workspaceDir` check semantics stable for consumers.

### Block 13

Regression tests that the default planning root is unchanged and that a startup slug override changes `planningRoot` output without altering its arity. Guards the CRITICAL `planningRoot` adaptation path after lean removal of `getPlanningRelativeDir`. Complements config tests for SC-3 end-to-end under the store.

### Block 14

Exercises traversal (`..`), sibling-prefix (`/uploads` vs `/uploads-evil`), and symlink-escape cases for `assertPathInsideRoot`. Establishes the SC-4 / G3 / G7 safety net for the new module. Trimmed in lean audit (removed unused alias/options branches and sep-sanity smoke) while retaining behavioural containment coverage.
