# Headless Slack Workflow Runner - March 2026

**Created:** 2026-03-05
**Status:** In Progress
**Type:** Feature
**Target:** workflow-server (`feat/headless-slack-runner` branch)

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## Executive Summary

Add a headless workflow runner to the workflow-server project that enables Slack-driven, parallel workflow execution using Cursor's Agent Client Protocol (ACP). Each workflow run gets an isolated git worktree and its own `agent acp` process. Workflow checkpoints are bridged to Slack interactive messages, allowing users to trigger and interact with workflows without an IDE.

---

## Problem Overview

The workflow-server currently runs inside a Cursor IDE session. Each active workflow occupies one IDE window, and the git working tree, agent context, and checkpoint interactions are all bound to that window. This means only one workflow can execute at a time per IDE instance, and running a second workflow requires opening another window, manually configuring the workspace, and switching between sessions to respond to checkpoints.

This serialization bottleneck slows down work that could otherwise run in parallel — for example, two independent work packages targeting different submodules. It also ties workflow execution to the developer's desktop: workflows cannot be started, monitored, or interacted with from a phone, from Slack, or by a teammate. If the IDE window is closed or the laptop sleeps, the workflow stops.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, approach | 15-30m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Architecture, implementation tasks, design decisions | 20-45m | ✅ Complete |
| — | Implementation | `src/runner/` module (7 files), deps, config | 2-4h | ✅ Complete |
| — | Tests | ACP client, checkpoint bridge, worktree manager (19 tests) | 30-60m | ✅ Complete |
| — | Validation | Type-check clean, all new tests passing | 15-30m | ✅ Complete |
| — | Live validation | Test against real Slack + Cursor ACP | 30-60m | ⬚ Pending |
| — | PR | Submit for review | 15-30m | ⬚ Pending |

---

## Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#48](https://github.com/m2ux/workflow-server/issues/48) |
| PR | [#49](https://github.com/m2ux/workflow-server/pull/49) (draft) |
| Engineering Artifacts | [planning/2026-03-05-headless-slack-runner](https://github.com/shieldedtech/midnight-agent-eng/tree/main/.engineering/artifacts/planning/2026-03-05-headless-slack-runner) |

---

**Branch:** `feat/headless-slack-runner` in `m2ux/workflow-server`
**Commit:** `6c054ff` feat: add headless Slack workflow runner via Cursor ACP
