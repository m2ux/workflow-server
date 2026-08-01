# Architecture Summary

> architecture-summary · when expressions parentheses and precedence · #379 when expressions: \|\|, parentheses, and precedence before OR step-gate migration · 2026-08-01 · post-impl-review worker

## Executive Summary

Workflow authors can now write nested boolean step gates (`&&`, `||`, parentheses) in the same inline `when:` dialect used for simple comparisons. A single shared evaluator backs tests and guards so OR-shaped gates no longer need the older structured form for the four production keep-sites. Agents still decide gates in production; mechanical nets fail closed on invalid expressions.

## System Context

Authors, the workflow-server product, and automated checks all share one expression meaning.

```mermaid
---
title: System Context - when expression dialect
---
flowchart LR
    Author([Workflow author])
    Agent([Executing agent])
    Server[Workflow server<br/>definitions and schema]
    Mech[Mechanical nets<br/>e2e walker and guards]

    Author -->|writes when gates| Server
    Agent -->|evaluates gates in session| Server
    Mech -->|parses and evaluates same dialect| Server

    style Server fill:#e1f5fe,stroke:#01579b
    style Mech fill:#c8e6c9,stroke:#2e7d32
    style Author fill:#fff8e1,stroke:#f9a825
    style Agent fill:#fff8e1,stroke:#f9a825
```

## Package Structure

```mermaid
---
title: Package Diagram - shared when module
---
flowchart TB
    subgraph Schema [Schema layer]
        WhenMod[when expression module]
        ActSchema[Activity schema grammar card]
    end
    subgraph Tests [Test and guard layer]
        Unit[Unit truth tables]
        Walker[e2e walker]
        Guard[check when corpus guard]
        Stealth[stealth isolation guard]
    end
    subgraph Corpus [Workflow corpus]
        Sites[Four OR keep-site gates]
    end

    ActSchema --> WhenMod
    Unit --> WhenMod
    Walker --> WhenMod
    Guard --> WhenMod
    Stealth --> WhenMod
    Sites -.->|parenthesized when| WhenMod

    style WhenMod fill:#c8e6c9,stroke:#2e7d32
    style Sites fill:#e3f2fd,stroke:#1976d2
```

## Key Flows

```mermaid
---
title: Sequence - evaluate a step when gate
---
sequenceDiagram
    participant W as Mechanical net or authoring check
    participant M as when expression module
    participant B as Variable bag

    W->>M: expression string
    M->>M: tokenize and parse
    alt parse fails
        M-->>W: fail closed false or authoring error
    else parse ok
        M->>B: resolve dotted paths
        B-->>M: values
        M-->>W: boolean result
    end
```

## What Changed

### Components Added/Modified

| Component | Change Type | Description |
|-----------|-------------|-------------|
| when expression module | Added | Shared parse, evaluate, and authoring rules |
| e2e walker | Modified | Uses shared evaluator; invalid gates skip the step |
| Corpus guard | Added | Fails CI when `when:` strings are invalid or mix operators without parentheses |
| Stealth isolation guard | Modified | Uses shared parse/eval; stays conservative on parse failure |
| Four workflow keep-sites | Modified | Nested OR gates expressed as parenthesized `when:` |
| Activity schema text | Modified | Documents full grammar and fail-closed mechanical behaviour |

### Key Changes

- **One dialect:** Parentheses and operator precedence are defined once and reused.
- **Safer OR migration:** Nested OR keep-sites match prior structured trees under the same bag states.
- **Authoring guardrails:** Mixed `&&` and `||` without parentheses are rejected before merge.

## Before & After

### Before

```mermaid
---
title: "Before: split gate dialects"
---
flowchart LR
    Simple[Simple and flat AND when]
    Nested[Nested OR gates]
    Struct[Structured condition form]
    WalkerOld[Walker AND-only helper]

    Simple --> WalkerOld
    Nested --> Struct

    style Nested fill:#ffebee,stroke:#c62828
    style Struct fill:#f5f5f5,stroke:#9e9e9e
```

### After

```mermaid
---
title: "After: shared when dialect"
---
flowchart LR
    AllGates[Simple AND and nested OR when]
    Shared[Shared when module]
    Nets[Walker and guards]

    AllGates --> Shared
    Shared --> Nets

    style Shared fill:#c8e6c9,stroke:#2e7d32
    style AllGates fill:#e3f2fd,stroke:#1976d2
```

## Impact

### Who Is Affected

| Stakeholder | Impact | Notes |
|-------------|--------|-------|
| Workflow authors | Medium | Can write nested boolean `when:` gates with parentheses |
| Agent operators | Low | Production evaluation remains agent-side; grammar card aligns docs |
| Maintainers / CI | Medium | New corpus check and unit suite lock the dialect |

## Risks & Mitigations

Planning risks: [plan](06-work-package-plan.md). No net-new post-implementation risks beyond the intentional fail-closed change for mechanical nets (invalid expressions skip rather than pass through).

## Future Considerations

Follow-ups: [deferred-items register](deferred-items.md). Broader structured-condition migration and multi-agent harness authority remain out of this package.

## Related Documents

- [Design philosophy](02-design-philosophy.md)
- [Work package plan](06-work-package-plan.md)
- [Test plan](06-test-plan.md)
- [Code review](09-code-review.md)
- Issue [#379](https://github.com/m2ux/workflow-server/issues/379) · PR [#383](https://github.com/m2ux/workflow-server/pull/383)
