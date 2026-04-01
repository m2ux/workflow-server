# Architecture Summary — Optimize Skill Delivery

**PR:** [#97](https://github.com/m2ux/workflow-server/pull/97)  
**Date:** 2026-04-01

---

## System Context

The workflow server is an MCP server that provides structured workflow definitions to AI agents. Agents discover workflows, start sessions, navigate activities, and load skills for each step they execute.

```
┌─────────────────┐         ┌──────────────────────┐
│  AI Agent        │ ──MCP──▶│  Workflow Server      │
│  (Orchestrator   │         │                      │
│   or Worker)     │◀────────│  Tools:              │
│                  │         │   start_session      │
│                  │         │   next_activity      │
│                  │         │   get_skill(step_id) │
│                  │         │   get_skills          │
└─────────────────┘         └───────┬──────────────┘
                                    │
                            ┌───────▼──────────────┐
                            │  Workflow Data        │
                            │  (TOON files)         │
                            │                      │
                            │  workflows/           │
                            │   ├── meta/skills/    │
                            │   └── work-package/   │
                            │       ├── activities/ │
                            │       ├── skills/     │
                            │       └── resources/  │
                            └──────────────────────┘
```

## Key Change: Step-Scoped Skill Resolution

### Before (skill_id)

```
Agent                          Server
  │                              │
  │  next_activity(activity_id)  │
  │─────────────────────────────▶│
  │  ◀── activity definition ───│
  │                              │
  │  [agent reads step.skill     │
  │   from activity definition]  │
  │                              │
  │  get_skill(skill_id)         │
  │─────────────────────────────▶│
  │  ◀── skill + resources ─────│
```

### After (step_id)

```
Agent                          Server
  │                              │
  │  next_activity(activity_id)  │
  │─────────────────────────────▶│
  │  ◀── activity definition ───│
  │                              │
  │  get_skill(step_id)          │
  │─────────────────────────────▶│
  │     ┌──────────────────┐     │
  │     │ token.act → activity│   │
  │     │ step_id → step      │   │
  │     │ step.skill → skillId│   │
  │     │ readSkill(skillId)  │   │
  │     └──────────────────┘     │
  │  ◀── skill + resources ─────│
```

The agent no longer needs to extract the skill ID from the activity definition. It passes the step ID and the server handles the resolution.

## Management Skill Consolidation

### Before: 5 Individual Skills

```
workflow.toon skills[5]:
  ├── session-protocol      (meta/00)  ─── Both roles
  ├── agent-conduct         (meta/01)  ─── Both roles
  ├── execute-activity      (meta/02)  ─── Worker only
  ├── state-management      (meta/03)  ─── Orchestrator only
  └── orchestrate-workflow  (meta/10)  ─── Orchestrator only
```

### After: 2 Role-Based Skills

```
workflow.toon skills[2]:
  ├── orchestrator-management (meta/10)
  │     Merges: orchestrate-workflow + session-protocol
  │             + state-management + agent-conduct
  │
  └── worker-management (meta/11)
        Merges: execute-activity + session-protocol
                + agent-conduct
```

Each role loads a single management skill at bootstrap instead of 3-5.

---

## Impact Assessment

| Dimension | Before | After |
|-----------|--------|-------|
| Agent skill requests per step | 1 (agent-directed by skill_id) | 1 (server-directed by step_id) |
| Agent parsing of activity definition for skill ID | Required | Not required |
| Management skill loads at bootstrap | 5 | 2 |
| Total management skill content | ~285 lines across 5 files | ~300 lines across 2 files (some consolidation overhead) |
| Backward compatibility | — | `get_skill(skill_id)` preserved via `get_step_skill` alias |

---

**Status:** Complete
