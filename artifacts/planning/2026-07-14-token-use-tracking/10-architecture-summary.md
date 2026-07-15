# Architecture Summary — Token Use Tracking (#232)

> Stakeholder-facing overview · PR #233 · Issue #232

## Impact

Adds optional token-usage capture and cost estimation to the workflow-server without changing existing caller contracts. Workflows that omit the `usage` param behave identically to today. The change touches the session persistence model, one MCP tool (`next_activity`), config, and read projections — not the workflow corpus (corpus changes for populating `usage` and rendering completion artifacts remain separate).

**Stakeholder note:** Token **metrics** are harness-agnostic (generic counts relayed by any orchestrator). **Cost estimation** currently defaults to an Anthropic-seeded price table — a deployment concern, not a metrics constraint.

## System Context

```mermaid
flowchart TB
  subgraph External
    Harness[Agent Harness / LLM Provider]
    Orchestrator[Workflow Orchestrator]
  end

  subgraph WorkflowServer[workflow-server MCP]
    NA[next_activity handler]
    UsageUtils[usage.ts helpers]
    Session[(session.json)]
    Config[config price table]
  end

  subgraph Completion
    AgentRenderer[Agent corpus technique]
    Artifact[NN-token-usage.md]
  end

  Harness -->|native usage figures| Orchestrator
  Orchestrator -->|usage param optional| NA
  NA --> UsageUtils
  Config --> UsageUtils
  UsageUtils --> Session
  Session -->|inspect_session / get_workflow_status| AgentRenderer
  AgentRenderer --> Artifact
```

## Package View

```mermaid
flowchart LR
  subgraph Tools
    WT[workflow-tools.ts]
  end
  subgraph Schema
    SS[session.schema.ts]
    ST[state.schema.ts]
  end
  subgraph Utils
    U[usage.ts]
    Store[session/store.ts]
  end
  subgraph Config
    C[config.ts]
  end

  WT --> U
  WT --> SS
  U --> C
  U --> SS
  Store --> SS
```

## Key Flow — Usage Capture at Activity Transition

```mermaid
sequenceDiagram
  participant Orch as Orchestrator
  participant NA as next_activity
  participant U as usage.ts
  participant S as session.json

  Orch->>NA: activity_id + optional usage
  Note over NA: Exit prior activity
  alt usage provided
    NA->>U: recordActivityUsage(exitedActivity, usage)
    U->>U: estimateCost (optional, model-keyed)
    U->>S: perActivity + workflowTotal + usage_recorded event
  end
  NA->>S: activity_exited / activity_entered
  alt terminal transition
    NA->>U: finalizeUsageTree (child-inclusive)
    U->>S: workflowTotal with child roll-up
  end
```

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Wrong relayed usage corrupts durable record | Medium | Zod validation; no server fabrication; provenance stamp (`model`, `priceTableVersion`) |
| Anthropic-centric cost defaults | Low (design) | Metrics independent; cost degrades to `null`; operator can extend price table |
| Attribution to exited activity only | Low | Accepted v1; workflow total arithmetically correct |

## Scope Statement

Server-side v1 delivers durable token metrics + optional cost estimate in `session.json`. Human-facing artifact rendering and orchestrator populate instructions are corpus-side companions documented in the implementation analysis (IA-1, IA-2).
