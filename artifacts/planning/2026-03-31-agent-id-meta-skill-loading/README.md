# Agent-ID Meta-Skill Loading — March 2026

**Created:** 2026-03-31  
**Status:** In Progress  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## Executive Summary

Workers in the orchestrator/worker execution model never receive meta/universal skills (session-protocol, agent-conduct, execute-activity, etc.) because `get_skills` only returns activity-declared skills when an activity is entered. Additionally, cross-workflow resource references using `meta:NN` prefix notation silently fail because the resource loader doesn't parse the prefix. This work package adds agent-id based detection of first worker calls and cross-workflow resource resolution.

---

## Problem Overview

The workflow server uses an orchestrator/worker pattern where the orchestrator manages transitions and a persistent worker sub-agent executes activity steps. When the worker bootstraps, it calls `get_skills` to load its behavioral protocols. However, the server only returns the activity's primary and supporting skills — meta skills that govern agent conduct, artifact management, git operations, and state management are excluded.

This means workers operate without foundational protocols. The gap went unnoticed because workers were receiving these protocols through other channels (prompt injection, prior context), but the server's skill loading contract is broken. Separately, skills that reference resources from other workflows via `meta:05` notation get silently empty responses — the resource loader treats the entire string as an index and finds no match.

---

## Solution Overview

The fix teaches the workflow server to recognize when a new worker agent calls in for the first time. When the server detects a new worker, it sends back the full set of foundational behavioral protocols alongside the task-specific skills the worker needs. On follow-up calls from the same worker, it skips the foundational protocols since the worker already has them — keeping responses lean. Workers that do not identify themselves continue to work exactly as before, so nothing breaks for existing setups.

For the resource referencing problem, the server now understands that a reference like `meta/05` means "look in the meta workflow's resources folder for item 05" rather than treating the whole string as a filename. Plain references like `05` still work as they always did — they look in the current workflow's folder. Additionally, each skill's reference materials are now bundled directly with that skill rather than in a separate flat list, making it straightforward for consumers to find the resources that belong to a specific skill.

---

## Links

| Item | Link |
|------|------|
| Issue | [#92](https://github.com/m2ux/workflow-server/issues/92) |
| PR | [#93](https://github.com/m2ux/workflow-server/pull/93) |
| Branch | `feat/92-agent-id-meta-skill-loading` |
| Engineering | `.engineering/artifacts/planning/2026-03-31-agent-id-meta-skill-loading/` |

---

## Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy, acceptance matrix | 10-15m | ✅ Complete |
| 1 | Implement cross-workflow resource prefix in `loadSkillResources` | 15m + 5m review | ✅ Complete |
| 2 | Add `agent_id` parameter to `get_skills` tool | 20m + 5m review | ✅ Complete |
| 3 | Per-skill resource nesting (`bundleSkillWithResources`) | 10m + 5m review | ✅ Complete |
| 4 | Update `get_skills` tool description | 5m + 2m review | ✅ Complete |
| 5 | Add tests for agent-id meta-skill loading (4 cases) | 20m + 5m review | ✅ Complete |
| 6 | Add tests for cross-workflow resource resolution (2 cases) | 15m + 5m review | ✅ Complete |
| 7 | Add tests for nested resource structure (6 cases) | 10m + 5m review | ✅ Complete |
| 09 | [Change block index](09-change-block-index.md) | File index for manual diff review | 5m | ✅ Complete |
| 09 | [Code review](09-code-review.md) | Code quality findings (4 findings, all low/info) | 15m | ✅ Complete |
| 09 | [Structural findings](09-structural-findings.md) | Conservation law, meta-law, bug table | 10m | ✅ Complete |
| 09 | [Test suite review](09-test-suite-review.md) | Test quality, coverage gaps, recommendations | 10m | ✅ Complete |

**Total estimate:** ~1h35m agentic + ~30m review
