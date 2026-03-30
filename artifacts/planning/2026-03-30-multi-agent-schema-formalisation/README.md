# Multi-Agent Schema Formalisation — March 2026

**Created:** 2026-03-30
**Status:** Planning
**Type:** Enhancement

---

## Executive Summary

Extend the workflow-server schemas to support structured definitions for multi-agent execution models. The current schema vocabulary has no constructs for agent identifiers, roles (orchestrator, worker, reviewer), execution model declarations, worker lifecycle management, or inter-agent context passing. These requirements can only be expressed as prose in rules arrays, making them invisible to the server and inconsistently interpreted by agents.

---

## Problem Overview

The workflow orchestration server uses structured schemas to define how AI agents execute workflows — specifying activities, steps, checkpoints, and transitions. However, when a workflow requires multiple agents to work together (for example, one agent coordinating while another performs the actual work), there is no way to express this in the schema. Instead, these multi-agent requirements are written as plain-text rules that agents must read and interpret on their own. The server has no awareness of whether a workflow needs one agent or several, what roles those agents should play, or how they should coordinate.

This gap means agents frequently misinterpret or ignore multi-agent requirements, leading to broken checkpoint interactions, context overload in a single agent, and inconsistent execution across different workflow runs. The server cannot validate that the right agent configuration is in place before a workflow starts, cannot adapt its tooling or session management to multi-agent scenarios, and cannot enforce the separation of responsibilities between orchestrator and worker agents. Until the schemas can express multi-agent execution as structured data rather than prose, any enforcement or tooling improvements are blocked.

---

## Progress

| # | Item | Description | Status |
|---|------|-------------|--------|
| 01 | Planning README | Work package initialisation | ✅ Complete |
| 02 | Requirements | Problem analysis and scope definition | ⬜ Not started |
| 03 | Design | Schema design and integration approach | ⬜ Not started |
| 04 | Implementation | Schema changes, loader updates, tests | ⬜ Not started |
| 05 | Review | Code review and documentation | ⬜ Not started |

---

## Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#84](https://github.com/m2ux/workflow-server/issues/84) |
| Draft PR | [#85](https://github.com/m2ux/workflow-server/pull/85) |
| Related Issue | [#65](https://github.com/m2ux/workflow-server/issues/65) — Orchestrator/worker rules lack structural enforcement |
