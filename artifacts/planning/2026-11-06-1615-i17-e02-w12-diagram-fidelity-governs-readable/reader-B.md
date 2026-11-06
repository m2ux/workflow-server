## Structure

The twelve measured sections form one containment tree. The excerpt splits at the measured Refresh and Validate and Merge or Hand Off sections: the summary shows Procedure's four direct sections; the details show the two branches with children. Nesting denotes CONTAINS, not execution order. Green marks changed sections; grey marks supplied untouched context.

```mermaid
---
title: Sections — Epic Integration summary
---
flowchart TB
    subgraph N7["Epic Integration"]
        subgraph N11["Procedure"]
            N0["1. Prepare the Evidence"]
            N1["2. Refresh and Validate"]
            N2["3. Merge or Hand Off"]
            N3["4. Confirm the Result"]
        end
    end
    style N7 fill:#c8e6c9,stroke:#2e7d32
    style N11 fill:#c8e6c9,stroke:#2e7d32
    style N0 fill:#c8e6c9,stroke:#2e7d32
    style N1 fill:#f5f5f5,stroke:#9e9e9e
    style N2 fill:#c8e6c9,stroke:#2e7d32
    style N3 fill:#c8e6c9,stroke:#2e7d32
```

Six measured elements, five containment relations. The numbers are source names; their visual arrangement asserts no production execution order.

```mermaid
---
title: Sections — Refresh and Validate
---
flowchart TB
    subgraph N1["2. Refresh and Validate"]
        N4["Changed Branch Content"]
        N6["Current Review Handoff"]
    end
    style N1 fill:#f5f5f5,stroke:#9e9e9e
    style N4 fill:#f5f5f5,stroke:#9e9e9e
    style N6 fill:#f5f5f5,stroke:#9e9e9e
```

Three measured elements, two containment relations.

```mermaid
---
title: Sections — Merge or Hand Off
---
flowchart TB
    subgraph N2["3. Merge or Hand Off"]
        N10["Human Handoff"]
        N9["Harness Denial"]
        N8["GitHub Refusal"]
        N5["Confirmed Merge"]
    end
    style N2 fill:#c8e6c9,stroke:#2e7d32
    style N10 fill:#c8e6c9,stroke:#2e7d32
    style N9 fill:#c8e6c9,stroke:#2e7d32
    style N8 fill:#c8e6c9,stroke:#2e7d32
    style N5 fill:#c8e6c9,stroke:#2e7d32
```

Five measured elements, four containment relations. The two detail parents repeat their summary names and fills to locate each detail; no new measured element or relation is asserted. Together these views preserve all twelve unique supplied sections and eleven containment relations.

### Source Sections

- **[1. Prepare the Evidence](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L9).**
  Measured section N0; changed.
- **[2. Refresh and Validate](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L20).**
  Measured section N1; untouched context.
- **[3. Merge or Hand Off](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L48).**
  Measured section N2; changed.
- **[4. Confirm the Result](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L74).**
  Measured section N3; changed.
- **[Changed Branch Content](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L27).**
  Measured section N4; untouched context.
- **[Confirmed Merge](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L70).**
  Measured section N5; changed.
- **[Current Review Handoff](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L33).**
  Measured section N6; untouched context.
- **[Epic Integration](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L1).**
  Measured section N7; changed.
- **[GitHub Refusal](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L62).**
  Measured section N8; changed.
- **[Harness Denial](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L58).**
  Measured section N9; changed.
- **[Human Handoff](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L54).**
  Measured section N10; changed.
- **[Procedure](https://github.com/m2ux/workflow-server/blob/ff94f4a28ee0134a10f46ba571a9795f5e6841f1/skills/work-planner/protocols/epic-integration.md#L7).**
  Measured section N11; changed.

This is a bounded section-containment excerpt. The supplied evidence does not establish a production component dependency graph or a functional sequence.
