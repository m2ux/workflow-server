# Agent-ID Meta-Skill Loading — March 2026

**Created:** 2026-03-31  
**Status:** Planning  
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

Two coordinated changes:

1. **Agent-id parameter for `get_skills`**: Add optional `agent_id`. Compare against `token.aid` — new agent gets meta skills + activity skills; returning agent gets activity skills only. Token field `aid` already exists but is unused.

2. **Cross-workflow resource prefix**: Parse `workflow:index` notation in `loadSkillResources` — route `meta:05` to `meta/resources/`, bare `05` to current workflow (backward compatible).

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

| # | Task | Est. | Status | Artifact |
|---|------|------|--------|----------|
| 1 | Implement cross-workflow resource prefix in `loadSkillResources` | 15m + 5m review | Not Started | `src/tools/resource-tools.ts` |
| 2 | Add `agent_id` parameter to `get_skills` tool | 20m + 5m review | Not Started | `src/tools/resource-tools.ts` |
| 3 | Wire `aid` field updates in session token | 10m + 5m review | Not Started | `src/utils/session.ts` |
| 4 | Update `get_skills` tool description | 5m + 2m review | Not Started | `src/tools/resource-tools.ts` |
| 5 | Add tests for agent-id meta-skill loading | 20m + 5m review | Not Started | `tests/mcp-server.test.ts` |
| 6 | Add tests for cross-workflow resource resolution | 15m + 5m review | Not Started | `tests/mcp-server.test.ts` |
| 7 | Update worker-prompt-template to pass agent_id | 10m + 5m review | Not Started | `workflows/meta/resources/05-worker-prompt-template.md` |

**Total estimate:** ~1h35m agentic + ~30m review
