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

### 1. Scope Assessment

**Purpose:** Confirm multi-work-package initiative and identify work packages to be planned.

**Step Technique:** `assess-initiative-scope` (all steps) · **Supporting:** `variable-binding`

```mermaid
graph TD
    subgraph scope-assessment[Scope Assessment]
        s1([Confirm initiative scope])
        s2([Identify work packages])
        s3([Present scope summary])
        cp1{Scope confirmed?}
        
        s1 --> s2 --> s3 --> cp1
        cp1 -->|proceed| Next([→ folder-setup])
        cp1 -->|refine| s1
    end
```

| Step | Description |
|------|-------------|
| Confirm initiative scope | Verify this is a multi-work-package initiative |
| Identify work packages | List all work packages to be planned |
| Present scope summary | Summarize identified work packages for confirmation |

**Checkpoint:** "I've identified N work packages. Proceed with planning?"

---

### 2. Folder Setup

**Purpose:** Create planning folder structure with initial documentation skeletons.

**Step Techniques:** `version-control::initialize-folder` (bind planning folder), `setup-planning-folder` (skeletons) · **Supporting:** `variable-binding`

```mermaid
graph TD
    subgraph folder-setup[Planning Folder Setup]
        f1([Bind planning folder])
        f2([Create START-HERE.md])
        f3([Create README.md])
        f4([Present folder structure])
        cp1{Folder setup complete?}
        
        f1 --> f2 --> f3 --> f4 --> cp1
        cp1 -->|proceed| Next([→ analysis])
        cp1 -->|adjust| f1
    end
```

| Step | Description |
|------|-------------|
| Bind planning folder | Derive the planning slug for the initiative folder |
| Create START-HERE.md | Create initial skeleton with header and placeholders |
| Create README.md | Create skeleton for navigation |
| Present folder structure | Show user the created structure |

**Artifacts:** START-HERE.md (create), README.md (create)

**Checkpoint:** "Planning folder created. Proceed with analysis?"

---

### 3. Analysis

**Purpose:** Perform completion or context analysis depending on whether continuing previous work or starting new.

**Step Technique:** `analyze-initiative-context` (all steps) · **Supporting:** `variable-binding`

```mermaid
graph TD
    subgraph analysis[Analysis]
        a1([Determine analysis type])
        d1{analysis_type?}
        a2a([Completion analysis])
        a2b([Context analysis])
        a3([Document analysis])
        a4([Present findings])
        cp1{Analysis confirmed?}
        
        a1 --> d1
        d1 -->|completion| a2a --> a3
        d1 -->|context| a2b --> a3
        a3 --> a4 --> cp1
        cp1 -->|proceed| Next([→ package-planning])
        cp1 -->|revise| a1
    end
```

| Step | Description |
|------|-------------|
| Perform analysis | Execute completion or context analysis per the selected analysis type |
| Document analysis | Write the analysis document in the planning folder |
| Present findings | Summarize analysis findings for review |

The analysis type is chosen at the **Analysis Type Selection** checkpoint, which routes the **Analysis Method Selection** decision to completion or context analysis.

**Artifacts:** `01-COMPLETION-ANALYSIS.md` / `02-CONTEXT-ANALYSIS.md` (create)

**Checkpoint:** "Analysis complete. Does this context look correct?"

---

### 4. Package Planning

**Purpose:** Define scope, dependencies, effort, and success criteria for each work package.

**Step Technique:** `plan-work-package-scope` (all steps) · **Supporting:** `variable-binding`, `scatter-gather`

```mermaid
graph TD
    subgraph package-planning[Work Package Planning]
        loop[[forEach: work_packages]]
        p1([Present planning overview])
        p2([Define scope])
        p3([Identify dependencies])
        p4([Estimate effort])
        p5([Define success criteria])
        p6([Document plan])
        cp1{Plans created?}
        
        p1 --> loop
        loop --> p2 --> p3 --> p4 --> p5 --> p6
        p6 --> loop
        loop -->|done| cp1
        cp1 -->|proceed| Next([→ prioritization])
        cp1 -->|revise| p1
    end
```

| Step | Description |
|------|-------------|
| Present planning overview | Present the work packages to be planned and the planning approach |
| Define scope | Identify in scope and out of scope |
| Identify dependencies | Document dependencies on other packages or external factors |
| Estimate effort | Provide rough effort estimate |
| Define success criteria | Establish measurable success criteria |
| Document plan | Create `{package_name}-plan.md` |

The define-scope through document-plan steps run inside a `forEach` loop over `work_packages`.

**Artifacts:** `{package_name}-plan.md` (create, per package)

**Checkpoint:** "Work package plans created. Ready for prioritization?"

---

### 5. Prioritization

**Purpose:** Prioritize work packages based on dependencies, value, risk, and effort.

**Step Technique:** `prioritize-packages` (all steps) · **Supporting:** `variable-binding`

```mermaid
graph TD
    subgraph prioritization[Prioritization]
        r1([Analyze dependencies])
        r2([Evaluate criteria])
        r3([Propose priority order])
        r4([Present prioritization])
        cp1{Priority confirmed?}
        
        r1 --> r2 --> r3 --> r4 --> cp1
        cp1 -->|accept| Next([→ finalize-roadmap])
        cp1 -->|adjust| r1
        cp1 -->|revisit plans| Back([→ package-planning])
    end
```

| Step | Description |
|------|-------------|
| Analyze dependencies | Create dependency graph showing blockers |
| Evaluate criteria | Assess each package on: business value, risk, effort |
| Propose priority order | Generate recommended execution order |
| Present prioritization | Show dependency graph and proposed order |

**Artifacts:** priority-ranking.md (create)

**Checkpoint:** "Here's the proposed priority order. Adjust as needed?"

---

### 6. Finalize Roadmap

**Purpose:** Complete roadmap documentation with timeline, navigation, and success criteria.

**Step Technique:** `document-roadmap` (all steps) · **Supporting:** `variable-binding`

```mermaid
graph TD
    subgraph finalize-roadmap[Finalize Roadmap]
        fr1([Update START-HERE.md])
        fr2([Update README.md])
        fr3([Add timeline estimates])
        fr4([Document success criteria])
        fr5([Present final roadmap])
        cp1{Roadmap complete?}
        
        fr1 --> fr2 --> fr3 --> fr4 --> fr5 --> cp1
        cp1 -->|begin| Next([→ implementation])
        cp1 -->|refine| fr1
    end
```

| Step | Description |
|------|-------------|
| Update START-HERE.md | Complete with executive summary, status table, success criteria |
| Update README.md | Add navigation links to all planning documents |
| Add timeline estimates | Include timeline based on effort and dependencies |
| Document success criteria | Define how initiative completion will be measured |
| Present final roadmap | Show completed roadmap for final approval |

**Artifacts:** START-HERE.md (update), README.md (update)

**Checkpoint:** "Roadmap complete. Ready to begin implementation?"

---

### 7. Implementation

**Purpose:** Execute each planned work package in priority order by triggering the work-package workflow.

**Step Technique:** `orchestrate-package-execution` (all steps) · **Supporting:** `variable-binding`, `scatter-gather`

```mermaid
graph TD
    subgraph implementation[Implementation]
        i0([Initialize implementation iteration])
        loop[[forEach: remaining_packages]]
        i1([Select next work package])
        i2([Trigger work-package workflow])
        i5([Update roadmap status])
        i6([Check remaining packages])
        
        i0 --> loop
        loop --> i1 --> i2 --> i5 --> i6
        i6 -->|more| loop
        i6 -->|done| Done([All Complete])
    end
    
    trigger([work-package workflow])
    i2 -.-> trigger
    trigger -.-> i5
```

| Step | Description |
|------|-------------|
| Initialize implementation iteration | Prepare the ordered list of remaining packages from the priority order |
| Select next work package | Choose highest priority unstarted package |
| Trigger work-package workflow | Load `work-package` workflow and start |
| Update roadmap status | Mark completed package, update progress |
| Check remaining packages | Determine if more packages remain |

The select-package through check-remaining steps run inside a `forEach` loop over `remaining_packages`.

**Artifacts:** START-HERE.md (update, progress tracking)

**Outcome:**
- All planned work packages implemented via work-package workflow
- Each package has merged PR
- Roadmap status reflects completion

---

## Techniques Summary

| Technique | Type | Capability | Used By |
|-------|------|------------|---------|
| `assess-initiative-scope` | Workflow-specific | Identify and categorize work packages | Scope Assessment |
| `setup-planning-folder` | Workflow-specific | Create START-HERE.md and README.md skeletons | Folder Setup |
| `analyze-initiative-context` | Workflow-specific | Completion or context analysis | Analysis |
| `plan-work-package-scope` | Workflow-specific | Scope, dependencies, effort, success criteria per package | Package Planning |
| `prioritize-packages` | Workflow-specific | Evaluate and order packages | Prioritization |
| `document-roadmap` | Workflow-specific | Produce finalized roadmap documentation | Finalize Roadmap |
| `orchestrate-package-execution` | Workflow-specific | Trigger and manage work-package workflow instances | Implementation |
| `version-control::initialize-folder` | Meta | Derive the canonical planning-folder slug | Folder Setup |
| `variable-binding` | Meta | Bind step operations to the workflow variable bag | All activities (supporting) |
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

## Context Preserved

The workflow declares its variables in [`workflow.toon`](workflow.toon). Key variables include:

| Variable | Description |
|----------|-------------|
| `initiative_name` | Name of the overall initiative |
| `work_packages` | List of identified work packages |
| `planning_folder_path` | Path to the created planning folder |
| `analysis_type` | Completion or context |
| `package_plans` | List of created plan document paths |
| `priority_order` | Ordered list of work packages |
| `completed_packages` | List of completed work packages |
| `remaining_packages` | List of remaining work packages |
| `overall_progress` | Progress indicator |

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
│   ├── plan-work-package-scope.md
│   ├── prioritize-packages.md
│   ├── document-roadmap.md
│   └── orchestrate-package-execution.md
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
