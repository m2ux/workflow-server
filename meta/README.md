# Meta Workflow

> Bootstrap workflow for the workflow-server. Provides self-contained activities for workflow lifecycle management (start, resume, end). Each activity is an independent entry point matched via recognition patterns.

## Overview

The Meta workflow is the **entrypoint for all workflow operations**. Unlike other workflows with sequential activity flows, the Meta workflow provides three independent activities that are matched directly via user intent recognition patterns.

**Key characteristics:**
- Each activity is an independent entry point
- Activities are matched via recognition patterns (not sequential flow)
- Skills in this workflow are universal and apply to all workflows

## Workflow Structure

```mermaid
graph TD
    subgraph meta[Meta Workflow - Independent Entry Points]
        Start([User Intent])
        
        Start -->|"start/begin/execute workflow"| SW[start-workflow]
        Start -->|"resume/continue workflow"| RW[resume-workflow]
        Start -->|"end/finish/complete workflow"| EW[end-workflow]
        
        SW --> WF([Workflow Loaded])
        RW --> WF
        EW --> Done([Workflow Complete])
    end
    
    style SW fill:#e1f5fe
    style RW fill:#e1f5fe
    style EW fill:#e1f5fe
```

## Activities

### 1. Start Workflow

**Purpose:** Begin executing a new workflow from the beginning.

**Primary Skill:** `workflow-execution`  
**Supporting Skills:** `activity-resolution`, `state-management`

```mermaid
graph TD
    subgraph start-workflow[Start Workflow]
        s1([Select workflow])
        s2([Load workflow])
        s3([Initialize state])
        s4([Apply rules])
        s5([Detect execution model])
        s6([Discover target])
        s7([Read submodules])
        s8([Discover resources])
        s9([Load start resource])
        s10([Get initial activity])
        s11([Present activity])
        s12([Prepare checkpoints])
        
        s1 --> s2 --> s3 --> s4 --> s5 --> s6 --> s7 --> s8 --> s9 --> s10 --> s11 --> s12
    end
    
    skill1((workflow-execution))
    skill2((activity-resolution))
    skill3((state-management))
    
    s1 -.-> skill2
    s3 -.-> skill3
    s10 -.-> skill1
```

| Step | Description |
|------|-------------|
| Select workflow | Identify target workflow from user request or present available workflows |
| Load workflow | Load the selected workflow definition and extract metadata |
| Initialize state | Initialize workflow state with variable defaults |
| Apply rules | Internalize workflow-level rules for enforcement |
| Detect execution model | Check for EXECUTION MODEL rule; load orchestrate-workflow skill if present |
| Discover target | Check for .gitmodules to determine repository type and resolve target_path |
| Read submodules | Parse .gitmodules for submodule selection (only when is_monorepo is true) |
| Discover resources | Load the workflow resource index for reference |
| Load start resource | Load the index-00 start resource if available |
| Get initial activity | Load the activity at initialActivity to begin execution |
| Present activity | Present first activity to user with steps and entry actions |
| Prepare checkpoints | Identify blocking checkpoints for presentation when reached |

**Outcome:**
- Workflow is selected and loaded
- Initial state is created with correct initial activity
- First activity is entered
- Agent is ready to guide user through workflow

---

### 2. Resume Workflow

**Purpose:** Continue a workflow that was previously started.

**Primary Skill:** `workflow-execution`  
**Supporting Skills:** `activity-resolution`, `state-management`

```mermaid
graph TD
    subgraph resume-workflow[Resume Workflow]
        r1([Identify workflow])
        r2([Load workflow])
        r3([Discover resources])
        r4([Reconstruct state])
        r5([Build state object])
        r6([Get current activity])
        r7([Load activity guidance resource])
        r8([Present status])
        r9([Resume execution])
        
        r1 --> r2 --> r3 --> r4 --> r5 --> r6 --> r7 --> r8 --> r9
    end
    
    skill1((workflow-execution))
    skill3((state-management))
    
    r4 -.-> skill3
    r9 -.-> skill1
```

| Step | Description |
|------|-------------|
| Identify workflow | Ask user to identify the workflow being resumed |
| Load workflow | Call `get_workflow` to load workflow definition |
| Discover resources | Call `list_workflow_resources` to discover available resources |
| Reconstruct state | Ask user: Which activity? What's completed? Key decisions? |
| Build state object | Build state object per state-management skill |
| Get current activity | Call `get_activity` for current activity |
| Load activity guidance resource | Call `get_resource` for activity-specific guidance resource if available |
| Present status | Present current activity status |
| Resume execution | Resume execution from current position |

**Outcome:**
- Previous state is restored or reconstructed
- Current activity is identified
- Remaining work is presented
- Agent is ready to continue guiding user

---

### 3. End Workflow

**Purpose:** Complete and finalize a workflow execution.

**Primary Skill:** `workflow-execution`  
**Supporting Skills:** `state-management`

```mermaid
graph TD
    subgraph end-workflow[End Workflow]
        e1([Verify completion])
        e2([Check checkpoints])
        e3([Execute exit actions])
        e4([Update state])
        e5([Present summary])
        e6([Cleanup])
        
        e1 --> e2 --> e3 --> e4 --> e5 --> e6
    end
    
    skill1((workflow-execution))
    skill3((state-management))
    
    e1 -.-> skill1
    e4 -.-> skill3
```

| Step | Description |
|------|-------------|
| Verify completion | Verify all required activities are complete |
| Check checkpoints | Ensure all blocking checkpoints have responses |
| Execute exit actions | Execute any exit actions from final activity |
| Update state | Set workflow status to 'completed' with timestamp |
| Present summary | Present completion summary to user |
| Cleanup | Clear workflow context if appropriate |

**Outcome:**
- Workflow is marked as complete
- Final state is recorded
- User is informed of completion

---

## Skills Summary

The Meta workflow defines universal skills used by all workflows:

| Skill | Capability | Description |
|-------|------------|-------------|
| `activity-resolution` | Resolve user goals to activities | Maps user intent to appropriate activities and skills |
| `workflow-execution` | Execute workflows | Follows schema patterns for workflow execution |
| `state-management` | Manage workflow state | Handles state across sessions |
| `artifact-management` | Manage planning artifacts | Ensures artifacts are created in correct folder structure |
| `orchestrate-workflow` | Orchestrate workflow execution | Coordinates orchestrator/worker pattern with persistent sub-agent |
| `execute-activity` | Execute a single activity | Self-bootstraps and executes activity steps as a worker |
| `knowledge-base-search` | Optimise knowledge base searches | Pre-indexes domain maps before querying concept-rag |
| `atlassian-operations` | Atlassian Jira and Confluence operations | Guides correct tool call sequences for the Atlassian MCP server |
| `gitnexus-operations` | Query codebases via knowledge graph | GitNexus MCP tools for impact analysis, debugging, refactoring |

---

## Recognition Patterns

Activities are matched via these patterns:

| Pattern | Activity |
|---------|----------|
| start a workflow, begin workflow, execute workflow, run workflow | `start-workflow` |
| resume workflow, continue workflow, pick up where I left off | `resume-workflow` |
| end workflow, finish workflow, complete workflow, we're done | `end-workflow` |
