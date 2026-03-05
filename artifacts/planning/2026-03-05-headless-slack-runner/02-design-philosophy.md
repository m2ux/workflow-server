# Design Philosophy - Headless Slack Workflow Runner

**Created:** 2026-03-05
**Issue:** [#48](https://github.com/m2ux/workflow-server/issues/48) — feat: headless Slack workflow runner via Cursor ACP
**Complexity:** Moderate
**Type:** Feature (new module in workflow-server)

---

## Problem Statement

The current workflow execution model requires one Cursor IDE window per active workflow. This creates a serialization bottleneck: only one workflow can run at a time because the IDE window, git working tree, and agent context are all shared.

The root cause is architectural coupling between the workflow execution engine (the LLM agent + MCP servers) and the IDE presentation layer (Cursor's UI for checkpoints, status, and tool approval).

**Nature:** Infrastructure / developer tooling
**Risk:** Low — new module alongside existing code, no changes to existing workflow-server functionality

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — limits throughput, not a correctness issue |
| Scope | All workflow users; affects every concurrent work package scenario |
| Business Impact | Developer productivity bottleneck; workflows serialize when they could parallelize |

---

## Problem Classification

**Type:** Inventive Goal — Improvement

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** Nothing is broken — the system works correctly within its single-window constraint. The goal is to add a new capability (parallel headless execution) by decoupling the execution engine from the IDE. Complexity is moderate: the module has clear boundaries and low risk to existing code, but integrates three external systems (Cursor ACP, Slack Bolt SDK, git worktrees) and bridges between two interaction models (ACP JSON-RPC and Slack interactive messages).

---

## Design Rationale

### Why Cursor ACP (not a custom agent loop)

Cursor CLI exposes `agent acp` -- a headless agent runtime over stdio using JSON-RPC 2.0. This provides the full Cursor agent (file editing, shell, grep, semantic search) with MCP server support, eliminating the need to build a custom agent loop or manage LLM API calls directly. The `cursor/ask_question` extension method maps directly to the workflow checkpoint mechanism.

### Why Slack (not a custom web UI)

Slack provides built-in interactive messages (buttons, selects), threading, notifications, and mobile access. For checkpoint-based interaction, Slack's interactive components are a natural fit. Socket Mode eliminates the need for a public URL or ingress configuration.

### Why git worktrees (not containers)

Git worktrees provide filesystem isolation (independent branch, working tree, submodule state) without the overhead of containerization. Each workflow run gets its own worktree created from the base repo. For the PoC this is sufficient; containers can be added later for stronger isolation.

---

## Approach

Add a `src/runner/` module to the workflow-server project. The runner is a Slack bot (Bolt SDK, Socket Mode) that:

1. Accepts `/workflow start <workflow-id> <target> [issue]` slash commands
2. Creates a git worktree for isolation
3. Spawns a headless `agent acp` process pointed at the worktree
4. Bridges ACP `cursor/ask_question` requests to Slack interactive messages
5. Streams agent progress to a Slack thread
6. Cleans up worktree on completion

Multiple concurrent slash commands spawn independent agent processes, enabling parallel workflow execution.

---

## Workflow Path Decision

**Selected Path:** Full workflow (elicitation + research + comprehension)

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [x] Codebase Comprehension (mandatory)
- [x] Plan & Prepare

**Rationale:** Although the PoC implementation is complete, the full workflow path ensures thorough validation of the design against requirements, research into ACP protocol specifics and Slack SDK patterns, and formal codebase comprehension before finalizing the plan. This is appropriate for a moderate-complexity feature with multiple external integration points and several unverified assumptions.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Runtime | Requires Cursor CLI (`agent` binary) on the execution host |
| Infrastructure | Requires a configured Slack App (Bot Token, App-Level Token, slash command, interactivity) |
| Network | Slack Socket Mode — outbound WebSocket only, no public URL or ingress required |
| State | In-memory state for PoC; production requires persistent storage (SQLite or Redis) |
| API Stability | Cursor ACP is pre-1.0; protocol details may change |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Parallel execution | Concurrent workflows run independently | 2+ workflows simultaneously without interference |
| Headless operation | No IDE window required | Workflow completes end-to-end via Slack |
| Checkpoint fidelity | Slack interactions match IDE checkpoint behavior | All checkpoint types (single-select, multi-select) supported |
| Isolation | Worktree separation prevents cross-contamination | No shared state between concurrent runs |
| Cleanup | Resources released after completion | Worktrees removed, processes terminated on finish or error |
