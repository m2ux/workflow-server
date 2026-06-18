# Work Packages Workflow

> Plan and coordinate multiple related work packages, then execute each in turn by triggering the work-package workflow. Use when you have multiple related features, a roadmap spanning several weeks/months, or features with shared context.

## Overview

The Work Packages workflow handles **planning and prioritization** of multiple related work items. Once planned, it triggers the `work-package` workflow for each package in priority order.

**Use this workflow when:**
- You have multiple features to implement
- Planning a roadmap spanning several weeks/months
- Features share context and need coordination

**Key characteristics:**
- Sequential flow with clear progression
- Creates planning folder with documentation
- Loops through packages for planning and implementation
- Triggers `work-package` workflow for each package

## Workflow Flow

```mermaid
graph TD
    Start([Start]) --> SA[scope-assessment]
    SA --> FS[folder-setup]
    FS --> AN[analysis]
    AN --> PP[package-planning]
    PP --> PR[prioritization]
    PR --> FR[finalize-roadmap]
    FR --> IM[implementation]
    
    PP -.->|forEach package| PP
    IM -.->|forEach package| WP([work-package workflow])
    WP -.-> IM
    
    IM --> Done([All Packages Complete])
    
    style SA fill:#e3f2fd
    style FS fill:#e3f2fd
    style AN fill:#e3f2fd
    style PP fill:#e3f2fd
    style PR fill:#e3f2fd
    style FR fill:#e3f2fd
    style IM fill:#e3f2fd
```

## Activities

The seven activities run as a sequential chain (see the flow diagram above). Each links to its authoritative definition — steps, checkpoints, decisions, loops, and transitions live in the activity TOON and are served by `get_activity`.

### 1. [Scope Assessment](activities/01-scope-assessment.toon)

Confirms this is a genuine multi-package initiative and produces an agreed inventory of distinct work packages, so planning can proceed package-by-package without scope drift. Ends at a user checkpoint before moving on to folder setup.

```mermaid
graph TD
    subgraph scope-assessment[Scope Assessment]
        s1([assess-scope → assess-initiative-scope])
        cp1{Scope confirmed?}
        
        s1 --> cp1
        cp1 -->|proceed| Next([→ folder-setup])
        cp1 -->|refine| s1
    end
```

### 2. [Folder Setup](activities/02-folder-setup.toon)

Creates the planning folder and its initial documentation skeletons (START-HERE.md and README.md), giving the initiative a canonical home before analysis begins.

```mermaid
graph TD
    subgraph folder-setup[Planning Folder Setup]
        f1([create-folder → version-control::initialize-folder])
        f2([setup-planning-folder → setup-planning-folder])
        cp1{Folder setup complete?}
        
        f1 --> f2 --> cp1
        cp1 -->|proceed| Next([→ analysis])
        cp1 -->|adjust| f1
    end
```

### 3. [Analysis](activities/03-analysis.toon)

Establishes a validated understanding of the initiative's starting point — either completion analysis of existing progress when continuing previous work, or context analysis for a fresh start. The path is chosen at a user checkpoint so later planning rests on confirmed context.

```mermaid
graph TD
    subgraph analysis[Analysis]
        cpType{Analysis type?}
        d1{analysis_type?}
        a1([analyze-context → analyze-initiative-context])
        cp1{Analysis confirmed?}
        
        cpType -->|continuing| d1
        cpType -->|new initiative| d1
        d1 -->|completion| a1
        d1 -->|context| a1
        a1 --> cp1
        cp1 -->|proceed| Next([→ package-planning])
        cp1 -->|revise| cpType
    end
```

### 4. [Package Planning](activities/04-package-planning.toon)

Defines scope, dependencies, effort, and success criteria for each package, fanning out over the identified work packages so every one is detailed enough to be prioritized and executed independently.

```mermaid
graph TD
    subgraph package-planning[Work Package Planning]
        p1([present-planning-overview → plan-work-package-scope::present-overview])
        loop[[forEach: work_packages]]
        p2([plan-package → plan-work-package-scope::plan-package])
        cp1{Plans created?}
        
        p1 --> loop
        loop --> p2
        p2 --> loop
        loop -->|done| cp1
        cp1 -->|proceed| Next([→ prioritization])
        cp1 -->|revise| p1
    end
```

### 5. [Prioritization](activities/05-prioritization.toon)

Orders the packages by dependencies, value, risk, and effort, producing a priority ranking the user accepts (or sends back to planning) before the roadmap is finalized.

```mermaid
graph TD
    subgraph prioritization[Prioritization]
        r1([prioritize → prioritize-packages])
        cp1{Priority confirmed?}
        
        r1 --> cp1
        cp1 -->|accept| Next([→ finalize-roadmap])
        cp1 -->|adjust| r1
        cp1 -->|revisit plans| Back([→ package-planning])
    end
```

### 6. [Finalize Roadmap](activities/06-finalize-roadmap.toon)

Completes the roadmap documentation — timeline, navigation, and success criteria — so the initiative has a single source of truth before implementation begins.

```mermaid
graph TD
    subgraph finalize-roadmap[Finalize Roadmap]
        fr1([finalize-roadmap-docs → document-roadmap])
        cp1{Roadmap complete?}
        
        fr1 --> cp1
        cp1 -->|begin| Next([→ implementation])
        cp1 -->|refine| fr1
    end
```

### 7. [Implementation](activities/07-implementation.toon)

Executes each planned package in priority order, triggering the `work-package` workflow for each one in turn and tracking progress until the whole initiative is delivered as merged, reviewed work.

```mermaid
graph TD
    subgraph implementation[Implementation]
        i0([initialize-iteration → orchestrate-package-execution::initialize-iteration])
        loop[[forEach: remaining_packages]]
        i1([execute-package → orchestrate-package-execution::execute-package])
        
        i0 --> loop
        loop --> i1
        i1 --> loop
        loop -->|done| Done([All Complete])
    end
    
    trigger([work-package workflow])
    i1 -.->|triggers| trigger
    trigger -.-> i1
```

## Artifacts

The workflow produces planning documentation under the planning folder: START-HERE.md and README.md skeletons (created at setup, finalized at roadmap), a completion or context analysis document, a plan per work package, a priority ranking, and progress tracking updated as packages complete. See the activity TOONs for the precise artifact each activity reads or writes.

## Techniques Summary

Workflow-specific techniques live under `techniques/`. Two are **operation groups** (a `TECHNIQUE.md` contract plus one file per operation, referenced as `<group>::<op>`); the rest are standalone techniques. All share the base contract in `techniques/TECHNIQUE.md`.

| Technique / Operation | Type | Capability | Used By |
|-----------------------|------|------------|---------|
| `assess-initiative-scope` | Standalone | Identify and categorize work packages | Scope Assessment |
| `setup-planning-folder` | Standalone | Create START-HERE.md and README.md skeletons | Folder Setup |
| `analyze-initiative-context` | Standalone | Completion or context analysis | Analysis |
| `plan-work-package-scope` | Group | Scope, dependencies, effort, success criteria per package | Package Planning |
| `plan-work-package-scope::present-overview` | Group op | Present packages and the per-package planning approach | Package Planning |
| `plan-work-package-scope::plan-package` | Group op | Plan and document one package (scope, deps, effort, success) | Package Planning (loop) |
| `prioritize-packages` | Standalone | Evaluate and order packages | Prioritization |
| `document-roadmap` | Standalone | Produce finalized roadmap documentation | Finalize Roadmap |
| `orchestrate-package-execution` | Group | Trigger and manage work-package workflow instances | Implementation |
| `orchestrate-package-execution::initialize-iteration` | Group op | Build the remaining-packages list and progress indicator | Implementation |
| `orchestrate-package-execution::execute-package` | Group op | Execute one package via the work-package workflow, update status | Implementation (loop) |
| `version-control::initialize-folder` | Meta | Derive the canonical planning-folder slug | Folder Setup |
| `variable-binding` | Meta | Bind step operations to the workflow variable bag | Inherited by every activity (declared at `workflow.techniques.activity`) |
| `scatter-gather` | Meta | Fan out and aggregate forEach iterations | Package Planning, Implementation (supporting) |

## Resources

| # | Resource | Purpose |
|---|----------|---------|
| 00 | Planning Folder Template | Templates for START-HERE.md and README.md skeletons |
| 01 | Completion Analysis Guide | Procedure for analyzing continuing initiatives |
| 02 | Context Analysis Guide | Procedure for analyzing new initiatives |
| 03 | Package Plan Template | Template for individual work package plans |
| 04 | Prioritization Framework | Framework for evaluating and ordering packages |
| 05 | Roadmap Template | Templates for finalized roadmap documentation |
| 06 | Workflow Triggering Protocol | How to trigger and manage work-package workflow instances |

---

## File Structure

```
work-packages/
├── workflow.toon
├── README.md
├── activities/
│   ├── README.md
│   ├── 01-scope-assessment.toon
│   ├── 02-folder-setup.toon
│   ├── 03-analysis.toon
│   ├── 04-package-planning.toon
│   ├── 05-prioritization.toon
│   ├── 06-finalize-roadmap.toon
│   └── 07-implementation.toon
├── techniques/
│   ├── TECHNIQUE.md
│   ├── assess-initiative-scope.md
│   ├── setup-planning-folder.md
│   ├── analyze-initiative-context.md
│   ├── prioritize-packages.md
│   ├── document-roadmap.md
│   ├── plan-work-package-scope/
│   │   ├── TECHNIQUE.md
│   │   ├── present-overview.md
│   │   └── plan-package.md
│   └── orchestrate-package-execution/
│       ├── TECHNIQUE.md
│       ├── initialize-iteration.md
│       └── execute-package.md
└── resources/
    ├── README.md
    ├── planning-folder-template.md
    ├── completion-analysis-guide.md
    ├── context-analysis-guide.md
    ├── package-plan-template.md
    ├── prioritization-framework.md
    ├── roadmap-template.md
    └── workflow-triggering-protocol.md
```
