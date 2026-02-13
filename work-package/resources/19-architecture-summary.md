---
id: architecture-summary
version: 1.0.0
---

# Architecture Summary Guide

**Purpose:** Create an architecture summary document at the end of implementation that allows management-level stakeholders with superficial system familiarity to understand the changes made. Uses Mermaid diagrams to visualize how changes relate to the existing system.

---

## Overview

The architecture summary is a high-level visual document that answers:

1. **What changed?** - Summary of the implementation in non-technical terms
2. **Where does it fit?** - How the changes relate to the broader system
3. **Why does it matter?** - Business impact and value delivered
4. **What's next?** - Dependencies, follow-up work, or considerations

This document uses **UML-style diagrams** at a high level of abstraction—showing the system as a whole, its users, and external dependencies. This is the appropriate level for stakeholders who need to understand impact without implementation details.

---

## Target Audience

| Audience | What They Need |
|----------|----------------|
| Engineering Managers | Impact on team, dependencies, risks |
| Product Managers | Feature delivery, user impact |
| Technical Directors | Architectural direction, system evolution |
| Non-technical Stakeholders | Business value, timeline, status |

**Writing Principle:** If someone unfamiliar with the codebase can't understand the document in 5 minutes, it's too technical.

---

## When to Create

Create an architecture summary when:

- Implementation involves changes to system boundaries or integrations
- Multiple components or services are affected
- The change has business-visible impact
- Stakeholders need to understand what was delivered

Skip for:

- Bug fixes with no architectural impact
- Internal refactoring invisible to stakeholders
- Documentation-only changes

---

## UML Diagram Types

For architecture summaries, we use three primary diagram types:

### Component Diagram (System Context)

Shows the system at its highest level of abstraction:

| Element | Description | Example |
|---------|-------------|---------|
| **Actor** | Users of the system | "End User", "Administrator" |
| **Component** | The system being changed | "Midnight Node" |
| **External System** | Systems that interact | "Cardano Mainchain", "Indexer" |
| **Relationship** | How elements communicate | "Submits transactions", "Queries state" |

### Package Diagram (Module Organization)

Shows logical groupings and dependencies between subsystems or modules:

| Element | Description | Example |
|---------|-------------|---------|
| **Package** | Logical grouping of related elements | "Runtime", "Pallets", "RPC" |
| **Dependency** | How packages depend on each other | "Runtime uses Pallets" |
| **Nesting** | Hierarchical organization | "Pallets contains Midnight, Governance" |

Use package diagrams when:
- Changes affect multiple subsystems or modules
- You need to show the organizational structure of the codebase
- Dependencies between packages are architecturally significant

### Container Diagram (Deployment View)

Shows runtime containers, services, and their interactions when infrastructure context is needed.

**Key Principle:** Show the forest, not the trees. Management doesn't need to see individual functions or modules.

---

## Mermaid Diagram Syntax

### System Context Diagram

Use a flowchart to show actors, the main system, and external systems:

```mermaid
---
title: System Context - [Feature Name]
---
flowchart LR
    User([👤 End User])
    
    Main[Main System]
    External[(External System)]
    
    User -->|Uses| Main
    Main -->|Calls API| External
    
    style Main fill:#e1f5fe,stroke:#01579b
    style External fill:#f5f5f5,stroke:#9e9e9e
```

**Node shapes:**
- `([text])` - Stadium/pill shape for actors
- `[text]` - Rectangle for internal systems
- `[(text)]` - Cylinder for databases
- `[[text]]` - Subroutine for external services

### Package Diagram (Module Organization)

Use subgraphs to show logical groupings and dependencies between modules:

```mermaid
---
title: Package Diagram - [Feature Name]
---
flowchart TB
    subgraph Node [Midnight Node]
        subgraph Runtime [Runtime]
            Pallets[Pallets]
            Primitives[Primitives]
        end
        
        subgraph Pallets_Detail [Pallets]
            Midnight[midnight]
            Governance[federated-authority]
            Observation[cnight-observation]
        end
        
        RPC[RPC Layer]
    end
    
    Runtime --> Pallets_Detail
    RPC --> Runtime
    
    style Node fill:#fafafa,stroke:#424242
    style Runtime fill:#e3f2fd,stroke:#1976d2
    style Pallets_Detail fill:#e8f5e9,stroke:#2e7d32
```

**When to use:** Changes that affect module organization, cross-cutting concerns, or introduce new packages/crates.

### Container Diagram (Deployment View)

Use subgraphs to show runtime containers and services:

```mermaid
---
title: Container View - [Feature Name]
---
flowchart LR
    User([👤 User])
    
    subgraph System [Main System]
        API[API<br/>Rust]
        DB[(Database<br/>PostgreSQL)]
    end
    
    User -->|HTTP/REST| API
    API -->|Reads/Writes| DB
    
    style System fill:#e3f2fd,stroke:#1976d2
    style API fill:#e1f5fe,stroke:#01579b
    style DB fill:#fff3e0,stroke:#ef6c00
```

**When to use:** Changes that affect deployment topology, infrastructure, or service boundaries.

### Before/After Comparison

For changes that modify existing architecture, show both states:

```mermaid
---
title: "BEFORE: [Description]"
---
flowchart LR
    User([👤 User])
    Sys[System<br/>Original state]
    
    User -->|Direct connection| Sys
    
    style Sys fill:#f5f5f5,stroke:#9e9e9e
```

```mermaid
---
title: "AFTER: [Description]"
---
flowchart LR
    User([👤 User])
    Sys[System<br/>Modified state]
    New[New Component<br/>Added by this work]
    
    User --> Sys
    Sys -->|Delegates to| New
    
    style Sys fill:#f5f5f5,stroke:#9e9e9e
    style New fill:#c8e6c9,stroke:#2e7d32
```

---

## Document Structure

### Required Sections

1. **Executive Summary** - 2-3 sentences on what was done and why
2. **System Context Diagram** - Visual showing where changes fit
3. **What Changed** - Bullet points of key changes
4. **Impact** - Who/what is affected

### Optional Sections

- **Package Diagram** - If changes affect module organization or dependencies
- **Before/After Diagrams** - If the change modifies existing flows
- **Dependencies** - Upstream/downstream systems affected
- **Risks & Mitigations** - Key risks and how they're addressed
- **Future Considerations** - Known follow-up work

---

## Writing Guidelines

### Do

- ✅ Use business language, not code terminology
- ✅ Keep diagrams simple (5-10 elements maximum)
- ✅ Show relationships between systems, not internal details
- ✅ Include a clear "why" for the changes
- ✅ Use consistent naming across diagrams

### Don't

- ❌ Include file paths, function names, or code
- ❌ Use technical jargon without explanation
- ❌ Create overly complex diagrams
- ❌ Focus on "how" instead of "what" and "why"
- ❌ Assume reader knows the codebase

---

## Architecture Summary Artifact Template

Create `architecture-summary-{n}.md` in the planning folder using this template (the activity's `artifactPrefix` is prepended at write time; n increments on successive versions):

```markdown
# Architecture Summary

**Work Package:** [Name]
**Issue:** #[number] - [Title]
**Date:** YYYY-MM-DD
**Author:** [Name/Agent]

---

## Executive Summary

[2-3 sentences describing what was implemented and why it matters. Write for someone unfamiliar with the codebase.]

---

## System Context

[Brief description of the system and its environment]

```mermaid
---
title: System Context - [Feature/Change Name]
---
flowchart LR
    User([👤 User Role])
    
    Main[System Name<br/>Core system]
    Ext1[(External System)]
    
    User -->|Action/Interaction| Main
    Main -->|Integration type| Ext1
    
    style Main fill:#e1f5fe,stroke:#01579b
    style Ext1 fill:#f5f5f5,stroke:#9e9e9e
```

*[Optional: Add note explaining the diagram if needed]*

---

## Package Structure

*[Include this section if changes affect module organization or dependencies]*

```mermaid
---
title: Package Diagram - [Feature/Change Name]
---
flowchart TB
    subgraph System [System Name]
        subgraph Package1 [Package 1]
            Module1[Module A]
            Module2[Module B]
        end
        
        subgraph Package2 [Package 2]
            Module3[Module C]
        end
    end
    
    Package1 --> Package2
    
    style System fill:#fafafa,stroke:#424242
    style Package1 fill:#e3f2fd,stroke:#1976d2
    style Package2 fill:#c8e6c9,stroke:#2e7d32
```

*[Highlight new or modified packages with distinct colors]*

---

## What Changed

### Components Added/Modified

| Component | Change Type | Description |
|-----------|-------------|-------------|
| [Name] | Added/Modified/Removed | [Brief description] |
| [Name] | Added/Modified/Removed | [Brief description] |

### Key Changes

- **[Change 1]:** [Description in business terms]
- **[Change 2]:** [Description in business terms]
- **[Change 3]:** [Description in business terms]

---

## Before & After

*[Include this section if the change modifies existing architecture]*

### Before

```mermaid
---
title: "Before: [Description]"
---
flowchart LR
    %% Show original state
    Actor([👤 Actor])
    System[System]
    
    Actor --> System
    
    style System fill:#f5f5f5,stroke:#9e9e9e
```

### After

```mermaid
---
title: "After: [Description]"
---
flowchart LR
    %% Show new state with changes highlighted
    Actor([👤 Actor])
    System[System]
    NewComponent[New Component]
    
    Actor --> System
    System --> NewComponent
    
    style System fill:#f5f5f5,stroke:#9e9e9e
    style NewComponent fill:#c8e6c9,stroke:#2e7d32
```

---

## Impact

### Who Is Affected

| Stakeholder | Impact | Notes |
|-------------|--------|-------|
| [Role/Team] | [High/Medium/Low] | [Brief description] |
| [Role/Team] | [High/Medium/Low] | [Brief description] |

### System Dependencies

| System | Relationship | Impact |
|--------|--------------|--------|
| [System] | Upstream/Downstream | [Description] |
| [System] | Upstream/Downstream | [Description] |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk description] | Low/Medium/High | Low/Medium/High | [How addressed] |

---

## Future Considerations

- [Known follow-up work or enhancements]
- [Technical debt introduced]
- [Potential future improvements]

---

## Related Documents

- [Link to ADR if created]
- [Link to work package plan]
- [Link to relevant documentation]
```

---

## Examples

### Good Executive Summary

> "This implementation adds payment processing support to the Order Service, enabling automatic invoice generation when orders are confirmed. This is required for the upcoming e-commerce launch where customer billing will be automated."

### Good System Context Description

> "The Order Service is a microservice that handles order lifecycle management and integrates with the Payment Gateway and Inventory System. This change affects the order confirmation flow and adds a new integration with the Billing Service."

### Good What Changed Entry

| Component | Change Type | Description |
|-----------|-------------|-------------|
| Order Service | Modified | Order confirmation now triggers invoice generation |
| Billing Integration | Added | New integration with external billing provider |

---

## Diagram Best Practices

### Keep It Simple

- **5-10 elements** per diagram maximum
- **One concept** per diagram
- **Clear labels** that don't require code knowledge

### Use Color Strategically

- **Highlight changes** with distinct colors
- **Grey out** unchanged components for context
- **Use consistent colors** across diagrams

### Show Relationships Clearly

- **Label all arrows** with the type of interaction
- **Direction matters** - show data/control flow direction
- **Avoid crossing lines** where possible

---

## Checklist

Before completing the architecture summary:

- [ ] Executive summary is understandable by non-technical stakeholders
- [ ] System context diagram shows where changes fit
- [ ] Package diagram included if module structure is affected
- [ ] Each diagram has ≤10 elements
- [ ] All relationships are labeled
- [ ] Changes are highlighted visually
- [ ] No code, file paths, or function names
- [ ] Impact on stakeholders is documented
- [ ] Document can be understood in 5 minutes

---

## Related Guides

- [Architecture Review Guide](15-architecture-review.md) - For ADRs documenting decisions
- [Strategic Review Guide](18-strategic-review.md) - For reviewing implementation focus
- [Design Framework Guide](09-design-framework.md) - For design approach
