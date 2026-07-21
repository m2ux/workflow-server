# Architecture Summary

> architecture-summary · Phase 1 agent-managed worktree architecture · issue skipped · 2026-07-21 · activity-worker

## Executive Summary

Operators and agents bind the workflow server to a required worktree root at startup. Agents create Git worktrees and initialise `.engineering` under that root; the server derives planning paths, validates containment, and writes artifacts. This keeps the container thin and isolates planning per project.

## System Context

```mermaid
---
title: System Context - Agent-Managed Worktrees
---
flowchart LR
    Agent([MCP Agent])
    Op([Operator])
    Server[Workflow Server<br/>MCP + HTTP]
    WT[(Worktree root<br/>host volume)]
    Plan[(Planning folders<br/>under root)]

    Op -->|start with --workspace / WORKTREE_ROOT| Server
    Agent -->|git worktree add + init .engineering| WT
    Agent -->|start_session slug hint| Server
    Server -->|validate + write| Plan
    WT --> Plan

    style Server fill:#e1f5fe,stroke:#01579b
    style WT fill:#f5f5f5,stroke:#9e9e9e
    style Plan fill:#c8e6c9,stroke:#2e7d32
```

## Package Structure

```mermaid
---
title: Package Diagram - Worktree Bind
---
flowchart TB
    subgraph Server [workflow-server]
        Config[config.ts<br/>WORKTREE_ROOT + PLANNING_SLUG]
        Create[server.ts<br/>setPlanningRelativeDir]
        Store[session/store.ts<br/>planningRoot]
        Val[worktree-validator.ts<br/>assertPathInsideRoot]
        Http[transports/http.ts<br/>/ready]
    end

    Config --> Create
    Config --> Store
    Create --> Store
    Store --> Val
    Http --> Config

    style Val fill:#c8e6c9,stroke:#2e7d32
    style Config fill:#e3f2fd,stroke:#1976d2
```

## Key Flows

```mermaid
---
title: Sequence - Startup bind and planning write
---
sequenceDiagram
    actor Op as Operator
    actor Agent as MCP Agent
    participant Cfg as loadConfig
    participant Srv as createServer
    participant Store as ensurePlanningFolder
    participant Val as assertPathInsideRoot

    Op->>Cfg: --workspace or WORKTREE_ROOT
    Cfg->>Srv: workspaceDir + planningRelativeDir
    Srv->>Store: setPlanningRelativeDir
    Agent->>Store: start_session slug
    Store->>Val: assert paths inside root
    Val-->>Store: absolute path
    Store-->>Agent: planning_folder_path
```

## What Changed

### Components Added/Modified

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `src/worktree-validator.ts` | Added | Path containment for write paths |
| `src/config.ts` | Modified | `WORKTREE_ROOT` alias; `PLANNING_SLUG` |
| `src/utils/session/store.ts` | Modified | Injectable planning relative dir; containment on ensure |
| `src/server.ts` | Modified | Apply planning slug at createServer |
| `src/transports/http.ts` | Modified | Document `/ready` root semantics |
| Docker / docs | Added/Modified | Container bind + SETUP agent lifecycle + MCP examples |

### Key Changes

- **Required root:** Server starts only with a worktree root; `/ready` checks that path
- **Configurable planning slug:** Default monorepo path; override via `PLANNING_SLUG` without changing `planningRoot` call sites
- **Workflows bind:** `--workflow-dir` / `WORKFLOW_DIR` (default `./workflows`)
- **Agent lifecycle:** Agents create worktrees; server validates and writes

## Impact

### Who Is Affected

| Stakeholder | Impact | Notes |
|-------------|--------|-------|
| MCP agents | High | Must create worktrees and init `.engineering` before writes |
| Operators | High | Must supply `--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT` |
| Maintainers | Medium | `planningRoot` signature stable (CRITICAL blast radius contained) |

## Risks & Mitigations

Planning risks: [plan](06-work-package-plan.md#dependencies--risks).

## Related Documents

- [Requirements](03-requirements-elicitation.md)
- [Work package plan](06-work-package-plan.md)
- [Design philosophy](02-design-philosophy.md)
- [Code review](09-code-review.md)
- PR [#267](https://github.com/m2ux/workflow-server/pull/267)
