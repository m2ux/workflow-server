# Requirements Elicitation: Headless Slack Workflow Runner

**Date:** 2026-03-05
**Status:** Confirmed
**Issue:** [#48](https://github.com/m2ux/workflow-server/issues/48)

---

## Problem Statement

The workflow-server currently requires one Cursor IDE window per active workflow, creating a serialization bottleneck for parallel work and tying execution to the developer's desktop. A headless runner module is needed to enable Slack-driven, parallel workflow execution using Cursor ACP with git worktree isolation.

## Goal

Merge a production-ready headless workflow runner that can execute one full work-package workflow end-to-end via Slack, with persistent session state, structured logging, and graceful error handling.

---

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Developer (self) | Trigger and monitor workflows from Slack without opening an IDE | As a developer, I want to start workflows from Slack so I can run them headlessly and in parallel |

### Secondary Stakeholders

- Future team members who may use the runner for their own workflow execution

---

## Context

### Integration Points
- **Cursor ACP** — Headless agent runtime via `cursor agent acp` over stdio (JSON-RPC 2.0)
- **Slack** — Bolt SDK with Socket Mode for slash commands and interactive messages
- **Git** — Worktree management for per-run filesystem isolation
- **MCP Servers** — Configured per-worktree via `.cursor/mcp.json`

### Dependencies
- Cursor CLI (`agent` binary) on the execution host
- Slack App (Bot Token, App-Level Token, slash command, interactivity)
- `CURSOR_API_KEY` environment variable

### Constraints
- **Runtime:** Dev machine (not containerized for initial merge)
- **Startup:** Manual (`npm run runner`)
- **Users:** Single-user operation
- **Repos:** Single base repo via `REPO_PATH`

---

## Scope

### In Scope

1. Live validation against real Slack workspace + Cursor ACP runtime
2. Verification of ACP protocol assumptions (#1, #2, #3 from assumptions log)
3. State persistence via SQLite (sessions survive runner restarts)
4. Structured logging with rotating log file output
5. Graceful agent crash handling (error posted to Slack thread, worktree cleaned up)
6. Single-repo, single-user operation

### Out of Scope

1. Error recovery / automatic agent restart — deferred to follow-up
2. Claude Code adapter — deferred to follow-up
3. Multi-repo support — deferred to follow-up
4. Rate limiting / session caps — deferred to follow-up
5. Slack App setup guide — deferred to follow-up documentation
6. Multi-user concurrent operation — deferred
7. Metrics dashboards / alerting — deferred

### Deferred

1. Slack App configuration guide — follow-up documentation task
2. Production hardening (error recovery, rate limiting, multi-user) — future work package
3. Alternative agent runtimes (Claude Code) — future work package

---

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | One full work-package workflow completes end-to-end via Slack | Manual: trigger `/workflow start work-package <target>` and verify completion |
| SC-2 | ACP assumptions #1-3 verified through live execution | Observe correct checkpoint bridging, session creation, and question handling |
| SC-3 | Sessions persist across runner restart | Stop runner, restart, verify session records survive in SQLite |
| SC-4 | Agent crash produces error in Slack thread and cleans up worktree | Kill agent process mid-run, verify Slack error message and worktree removal |
| SC-5 | Log output written to rotating log file | Verify log file exists with structured JSON entries after a workflow run |

---

## Elicitation Log

### Domain 1: Merge Criteria

| Question | Response Summary |
|----------|------------------|
| What must be validated before merge? Live validation required or unit tests sufficient? | Live validation of both Slack and Cursor ACP is required before merge |
| Should 3 unverified ACP assumptions be resolved before merge? | Yes, must be verified through live testing before merge |
| Is Slack App setup guide required for this PR? | Deferred to follow-up |

### Domain 2: Scope Boundaries

| Question | Response Summary |
|----------|------------------|
| Which of the 6 production gaps should be addressed for merge? | State persistence and observability. Other 4 deferred. |
| Is single-repo sufficient? | Yes |
| Is in-memory state acceptable for initial merge? | No — persistence needed, sessions must survive restart |
| Single-user or multi-user? | Single-user sufficient |

### Domain 3: Deployment & Operations

| Question | Response Summary |
|----------|------------------|
| Where does the runner run? | Dev machine. Requires Cursor CLI but not IDE. |
| Storage for state persistence? | SQLite |
| Observability level? | Log file output with rotating file appender |
| How should the runner start? | Manual: `npm run runner` |

### Domain 4: Success Criteria

| Question | Response Summary |
|----------|------------------|
| Performance expectations? | None for initial merge |
| What constitutes successful live validation? | One full work-package workflow end-to-end via Slack |
| Error handling requirements? | Runner must handle agent crash gracefully: post error to Slack, clean up worktree |

---

## Consolidated Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| REQ-MC-1 | Live validation against real Slack + real Cursor ACP must pass | Domain 1 |
| REQ-MC-2 | ACP assumptions #1-3 must be verified through live testing | Domain 1 |
| REQ-MC-3 | Slack App setup guide deferred to follow-up | Domain 1 |
| REQ-SB-1 | State persistence (SQLite) must be implemented | Domain 2+3 |
| REQ-SB-2 | Basic observability (log file with rotation) must be implemented | Domain 2+3 |
| REQ-SB-3 | Single-repo config sufficient | Domain 2 |
| REQ-SB-4 | Single-user operation sufficient | Domain 2 |
| REQ-DO-1 | Runs on dev machine, requires Cursor CLI but not IDE | Domain 3 |
| REQ-DO-2 | Manual start (`npm run runner`) | Domain 3 |
| REQ-SC-1 | Live validation = one full work-package workflow end-to-end via Slack | Domain 4 |
| REQ-SC-2 | Graceful agent crash handling (error to Slack, worktree cleanup) | Domain 4 |

---

## Confirmation

**Confirmed by:** User (sole stakeholder)
**Date:** 2026-03-05
