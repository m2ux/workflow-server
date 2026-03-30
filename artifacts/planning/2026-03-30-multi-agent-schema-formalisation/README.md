# Multi-Agent Schema Formalisation — March 2026

**Created:** 2026-03-30
**Status:** In Progress
**Type:** Enhancement

---

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Extend the workflow-server schemas to support structured definitions for multi-agent execution models. The current schema vocabulary has no constructs for agent identifiers, roles (orchestrator, worker, reviewer), execution model declarations, worker lifecycle management, or inter-agent context passing. These requirements can only be expressed as prose in rules arrays, making them invisible to the server and inconsistently interpreted by agents.

---

## Problem Overview

The workflow orchestration server uses structured schemas to define how AI agents execute workflows — specifying activities, steps, checkpoints, and transitions. However, when a workflow requires multiple agents to work together (for example, one agent coordinating while another performs the actual work), there is no way to express this in the schema. Instead, these multi-agent requirements are written as plain-text rules that agents must read and interpret on their own. The server has no awareness of whether a workflow needs one agent or several, what roles those agents should play, or how they should coordinate.

This gap means agents frequently misinterpret or ignore multi-agent requirements, leading to broken checkpoint interactions, context overload in a single agent, and inconsistent execution across different workflow runs. The server cannot validate that the right agent configuration is in place before a workflow starts, cannot adapt its tooling or session management to multi-agent scenarios, and cannot enforce the separation of responsibilities between orchestrator and worker agents. Until the schemas can express multi-agent execution as structured data rather than prose, any enforcement or tooling improvements are blocked.

---

## Solution Overview

Add a required `executionModel` field to the workflow schema that declares the agent roles participating in workflow execution. Each workflow defines its own role vocabulary — a set of named roles (id + description) that describe the agents involved. The server validates that role IDs are unique within each workflow. This provides machine-readable discoverability: agents and tooling can determine from structured schema data whether a workflow requires multiple agents and what roles they play, without parsing prose rules.

The change is purely additive and descriptive. Behavioral rules (what each role must or must not do) remain as prose in the existing `rules` array. The execution model declares "who participates," while prose rules describe "how they behave." All 10 existing workflows are migrated to include explicit execution model declarations — 7 with multi-agent roles reflecting their current orchestrator/worker patterns, and 3 with a single-agent role for workflows that don't use multi-agent execution.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | ongoing | ✅ Complete |
| 03 | [Requirements elicitation](03-requirements-elicitation.md) | 8 design questions, functional/non-functional requirements | 20-30m | ✅ Complete |
| 04 | [Research](04-kb-research.md) | Industry framework comparison, pattern validation | 15-20m | ✅ Complete |
| 05 | [Implementation analysis](05-implementation-analysis.md) | Integration points, baselines, exact schema design | 20-30m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | 26 tasks, dependencies, estimates (~2.5h) | 20-30m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | 13 new test cases, coverage matrix | 15-20m | ✅ Complete |
| 14 | [Schema comprehension](../../comprehension/workflow-server-schemas.md) | Schema system architecture, field propagation lifecycle | 30-45m | ✅ Complete |
| — | Implementation | Schema + JSON Schema + TOON migration + tests | ~2.5h | ⬜ Not started |
| — | Review | Code review, test review, strategic review | 30-60m | ⬜ Not started |
| — | Validation | Build, test, lint verification | 15-30m | ⬜ Not started |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#84](https://github.com/m2ux/workflow-server/issues/84) |
| Draft PR | [#85](https://github.com/m2ux/workflow-server/pull/85) |
| Related Issue | [#65](https://github.com/m2ux/workflow-server/issues/65) — Orchestrator/worker rules lack structural enforcement |

---

**Status:** Ready — planning complete, ready for implementation
