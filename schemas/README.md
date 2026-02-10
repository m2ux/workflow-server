# Workflow Schema System

This folder contains JSON Schema definitions for the workflow server. These schemas define the structure for workflow definitions, conditional logic, and runtime state tracking.

## Overview

The workflow server uses five interconnected schemas:

| Schema | Purpose | Use Case |
|--------|---------|----------|
| `workflow.schema.json` | Defines workflow structure | Creating new workflows with activities, steps, checkpoints |
| `condition.schema.json` | Defines conditional expressions | Controlling transitions and decisions |
| `state.schema.json` | Tracks runtime execution state | Persisting workflow progress |
| `skill.schema.json` | Defines agent skill capabilities | Describing tool orchestration patterns and execution guidance |
| `activity.schema.json` | Defines unified activities | Combining intent matching with workflow execution stages |

## Schema Relationships

The schemas work together to define workflows (design-time) and track their execution (runtime). The diagrams below illustrate these relationships.

### Workflow Structure

A workflow consists of activities connected by transitions. Each activity can contain steps (individual tasks), checkpoints (user decision points), decisions (automated branching), loops (iteration constructs), and optionally trigger other workflows. The `initialActivity` property determines where sequential workflows begin; workflows with all independent activities (no transitions) don't require `initialActivity`.

```mermaid
stateDiagram-v2
    direction LR
    
    state "Workflow Definition" as WD {
        [*] --> Activity1: initialActivity
        Activity1 --> Activity2: transition
        Activity2 --> Activity3: transition (with condition)
        Activity3 --> [*]: complete
        
        state Activity1 {
            Steps
            Checkpoints
        }
        state Activity2 {
            Steps
            Decisions
        }
        state Activity3 {
            Loops
            Triggers
        }
    }
    
    note right of WD
        workflow.schema.json
        Defines structure
    end note
```

### Schema Dependencies

The second diagram shows how the schema files depend on each other:

- **workflow.schema.json** defines the overall structure and references `activity.schema.json` for activities
- **activity.schema.json** defines unified activities with steps, checkpoints, decisions, loops, transitions, and triggers
- **condition.schema.json** provides reusable condition expressions (simple comparisons, AND/OR/NOT combinators)
- **state.schema.json** tracks runtime execution state, linking back to the workflow definition

At design-time, you work with `workflow.schema.json` and `activity.schema.json`. At runtime, `state.schema.json` captures progress through the workflow.

```mermaid
flowchart TB
    subgraph Workflow["workflow.schema.json"]
        W[Workflow] --> A[Activities]
    end
    
    subgraph Activity["activity.schema.json"]
        A --> S[Steps]
        A --> C[Checkpoints]
        A --> D[Decisions]
        A --> L[Loops]
        A --> T[Transitions]
        A --> TR[Triggers]
    end
    
    subgraph Condition["condition.schema.json"]
        T --> COND[Conditions]
        D --> COND
        L --> COND
        COND --> Simple["Simple: variable op value"]
        COND --> And["AND: conditions[]"]
        COND --> Or["OR: conditions[]"]
        COND --> Not["NOT: condition"]
    end
    
    subgraph State["state.schema.json"]
        W -.->|"runtime"| ST[Workflow State]
        ST --> CA[currentActivity]
        ST --> CS[completedSteps]
        ST --> CR[checkpointResponses]
        ST --> PW[parentWorkflow]
        ST --> TW[triggeredWorkflows]
    end
```

---

## Schema Ontology

This section defines the key concepts, their fields, and relationships within the schema system.

### Entity Relationships

```mermaid
erDiagram
    Workflow ||--o{ Activity : contains
    Workflow ||--o{ Variable : defines
    
    Activity ||--o{ Step : contains
    Activity ||--o{ Checkpoint : contains
    Activity ||--o{ Decision : contains
    Activity ||--o{ Loop : contains
    Activity ||--o{ Transition : contains
    Activity |o--o| WorkflowTrigger : triggers
    Activity ||--o{ Action : "entry/exit"
    
    Step ||--o{ Action : performs
    
    Checkpoint ||--|{ CheckpointOption : has
    CheckpointOption ||--o| Effect : triggers
    
    Decision ||--|{ DecisionBranch : has
    DecisionBranch |o--o| Condition : "evaluated by"
    
    Loop |o--o| Condition : "controlled by"
    Loop |o--o| Condition : "break on"
    Loop ||--o{ Step : iterates
    
    Transition |o--o| Condition : "guarded by"

    Workflow {
        string id PK
        string version
        string title
        string description
        string initialActivity FK
    }
    
    Activity {
        string id PK
        string version
        string name
        string problem
        array recognition
        boolean required
        string estimatedTime
    }
    
    Step {
        string id PK
        string name
        string description
        boolean required
    }
    
    Checkpoint {
        string id PK
        string name
        string message
        boolean blocking
    }
    
    CheckpointOption {
        string id PK
        string label
        string description
    }
    
    Decision {
        string id PK
        string name
        string description
    }
    
    DecisionBranch {
        string id PK
        string label
        string transitionTo FK
        boolean isDefault
    }
    
    Transition {
        string to FK
        boolean isDefault
    }
    
    Loop {
        string id PK
        string name
        enum type
        string variable
        integer maxIterations
    }
    
    Variable {
        string name PK
        enum type
        string description
        any defaultValue
        boolean required
    }
    
    WorkflowTrigger {
        string workflow FK
        string description
        array passContext
    }
    
    Action {
        enum action
        string target
        string message
        any value
    }
    
    Condition {
        enum type
        string variable
        string operator
        any value
    }
    
    Effect {
        object setVariable
        string transitionTo
        array skipActivities
    }
```

### Core Concepts

#### Workflow (Root Entity)

A workflow is the top-level container representing a complete process definition. Workflows can have **sequential activities** (connected by transitions, requiring `initialActivity`) or **independent activities** (self-contained entry points matched via recognition patterns).

| Field             | Type       | Purpose                                                    |
| ----------------- | ---------- | ---------------------------------------------------------- |
| `id`              | string     | Unique identifier for the workflow                         |
| `version`         | string     | Semantic version (X.Y.Z)                                   |
| `title`           | string     | Human-readable display name                                |
| `description`     | string     | Detailed description                                       |
| `author`          | string     | Creator of the workflow                                    |
| `tags`            | string[]   | Categorization labels                                      |
| `rules`           | string[]   | Execution guidelines                                       |
| `variables`       | Variable[] | State variables                                            |
| `initialActivity` | string     | Starting activity ID (required for sequential workflows)   |
| `activitiesDir`   | string     | Directory containing external activity files               |
| `activities`      | Activity[] | Inline activity definitions (or loaded from activitiesDir) |

**Activity Models:**
- **Sequential**: Activities have `transitions`, require `initialActivity` (e.g., work-package)
- **Independent**: Activities have no `transitions`, matched via `recognition` (e.g., meta)

#### Activity

A unified activity combines intent matching (problem, recognition) with workflow execution (steps, checkpoints, decisions, loops, transitions). Activities can also trigger other workflows.

| Field             | Type              | Purpose                                    |
| ----------------- | ----------------- | ------------------------------------------ |
| `id`              | string            | Unique identifier within workflow          |
| `version`         | string            | Semantic version (X.Y.Z)                   |
| `name`            | string            | Display name                               |
| `description`     | string            | What this activity accomplishes            |
| `problem`         | string            | User problem this activity addresses       |
| `recognition`     | string[]          | Patterns to match user intent              |
| `skills`          | SkillsReference   | Primary and supporting skill references    |
| `steps`           | Step[]            | Individual tasks                           |
| `checkpoints`     | Checkpoint[]      | User decision points                       |
| `decisions`       | Decision[]        | Automated branching points                 |
| `loops`           | Loop[]            | Iteration constructs                       |
| `transitions`     | Transition[]      | Activity navigation rules                  |
| `triggers`        | WorkflowTrigger   | Workflow to trigger from this activity     |
| `entryActions`    | Action[]          | Actions on entering activity               |
| `exitActions`     | Action[]          | Actions on exiting activity                |
| `outcome`         | string[]          | Expected outcomes on completion            |
| `context_to_preserve` | string[]      | Context items to preserve                  |
| `required`        | boolean           | Whether activity must be completed         |
| `estimatedTime`   | string            | Time estimate (e.g., "10-15m")             |

#### Step

A step represents an individual task within an activity.

| Field         | Type     | Purpose                           |
| ------------- | -------- | --------------------------------- |
| `id`          | string   | Unique identifier within activity |
| `name`        | string   | Task name                         |
| `description` | string   | What this step accomplishes       |
| `skill`       | string   | Skill ID to apply for this step   |
| `required`    | boolean  | Whether step must be completed    |
| `actions`     | Action[] | Actions to perform                |

#### Checkpoint

A checkpoint is a blocking decision point requiring user input.

| Field      | Type               | Purpose                                     |
| ---------- | ------------------ | ------------------------------------------- |
| `id`       | string             | Unique identifier within activity           |
| `name`     | string             | Checkpoint name                             |
| `message`  | string             | Question to present to user                 |
| `options`  | CheckpointOption[] | Available choices                           |
| `required` | boolean            | Whether checkpoint must be answered         |
| `blocking` | boolean            | Always true - checkpoints block progress    |

#### Decision

A decision is an automated branching point based on variable conditions.

| Field         | Type             | Purpose                           |
| ------------- | ---------------- | --------------------------------- |
| `id`          | string           | Unique identifier within activity |
| `name`        | string           | Decision name                     |
| `description` | string           | What is being decided             |
| `branches`    | DecisionBranch[] | Conditional paths (min 2)         |

#### Transition

A transition defines navigation from one activity to another.

| Field       | Type      | Purpose                         |
| ----------- | --------- | ------------------------------- |
| `to`        | string    | Target activity ID              |
| `condition` | Condition | When this transition applies    |
| `isDefault` | boolean   | Fallback if no conditions match |

#### WorkflowTrigger

A workflow trigger allows an activity to invoke another workflow. Used for composing workflows (e.g., work-packages triggering work-package for each planned package).

| Field         | Type     | Purpose                                    |
| ------------- | -------- | ------------------------------------------ |
| `workflow`    | string   | ID of the workflow to trigger              |
| `description` | string   | When/why this workflow is triggered        |
| `passContext` | string[] | Context variables to pass to child workflow|

#### Loop

A loop enables iteration over collections or while conditions hold.

| Field            | Type      | Purpose                             |
| ---------------- | --------- | ----------------------------------- |
| `id`             | string    | Unique identifier within activity   |
| `name`           | string    | Loop name                           |
| `type`           | enum      | "forEach", "while", or "doWhile"    |
| `variable`       | string    | Iteration variable name             |
| `over`           | string    | Collection to iterate (forEach)     |
| `condition`      | Condition | Continue condition (while/doWhile)  |
| `maxIterations`  | integer   | Safety limit                        |
| `breakCondition` | Condition | Early exit condition                |
| `steps`          | Step[]    | Steps to execute per iteration      |
| `activities`     | string[]  | Activity IDs to execute in loop     |

### Supporting Types

#### SkillsReference

References to skills used by an activity.

| Field        | Type     | Purpose                              |
| ------------ | -------- | ------------------------------------ |
| `primary`    | string   | Primary skill ID for this activity   |
| `supporting` | string[] | Supporting skill IDs                 |

#### Action

An action performed during workflow execution.

| Field     | Type   | Purpose                             |
| --------- | ------ | ----------------------------------- |
| `action`  | enum   | "log", "validate", "set", or "emit" |
| `target`  | string | Target of the action                |
| `message` | string | Message content                     |
| `value`   | any    | Value for set/emit actions          |

#### Variable

A workflow variable definition.

| Field          | Type    | Purpose                                          |
| -------------- | ------- | ------------------------------------------------ |
| `name`         | string  | Variable name                                    |
| `type`         | enum    | "string", "number", "boolean", "array", "object" |
| `description`  | string  | Variable purpose                                 |
| `defaultValue` | any     | Initial value                                    |
| `required`     | boolean | Whether variable must be set                     |

#### Condition

A conditional expression for control flow. Defined in `condition.schema.json`.

| Type     | Structure                 | Purpose                   |
| -------- | ------------------------- | ------------------------- |
| `simple` | variable, operator, value | Basic comparison          |
| `and`    | conditions[]              | All must be true          |
| `or`     | conditions[]              | At least one must be true |
| `not`    | condition                 | Negation                  |

### Field Naming Conventions

#### Consistent Patterns

| Pattern       | Usage                     | Examples                                |
| ------------- | ------------------------- | --------------------------------------- |
| `id`          | Unique identifier         | phase.id, step.id, checkpoint.id        |
| `name`        | Display name for entities | phase.name, step.name, loop.name        |
| `description` | Detailed explanation      | workflow.description, phase.description |
| `required`    | Mandatory flag            | variable.required, step.required        |

#### Distinct Concepts

| Field   | Context            | Meaning                 |
| ------- | ------------------ | ----------------------- |
| `title` | Workflow only      | Top-level display name  |
| `name`  | All other entities | Entity display name     |
| `label` | Options/branches   | User-facing choice text |

---

## Workflow Schema

The workflow schema (`workflow.schema.json`) defines the complete structure of a workflow, including metadata, variables, and activities. Workflows can use inline activities or reference external activity files via `activitiesDir`.

### Top-Level Structure

```json
{
  "$schema": "../../schemas/workflow.schema.json",
  "id": "my-workflow",
  "version": "1.0.0",
  "title": "My Workflow",
  "description": "A sample workflow",
  "author": "author-name",
  "tags": ["sample", "documentation"],
  "rules": ["Rule 1", "Rule 2"],
  "variables": [],
  "initialActivity": "first-activity",
  "activitiesDir": "activities"
}
```

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique workflow identifier |
| `version` | string | Semantic version (e.g., `1.0.0`) |
| `title` | string | Human-readable title |
| `activities` | array | Array of activity definitions (or loaded from activitiesDir) |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `$schema` | string | Path to schema file for validation |
| `description` | string | Workflow description |
| `author` | string | Author name |
| `tags` | string[] | Categorization tags |
| `rules` | string[] | Execution rules/guidelines |
| `variables` | array | Variable definitions with types and defaults |
| `initialActivity` | string | ID of first activity (required for sequential workflows) |
| `activitiesDir` | string | Directory containing external activity TOON files |

### Variables

Variables store state that persists across phases. Define them at the workflow level:

```json
{
  "variables": [
    {
      "name": "user_confirmed",
      "type": "boolean",
      "description": "Whether user confirmed the action",
      "defaultValue": false,
      "required": false
    },
    {
      "name": "selected_option",
      "type": "string",
      "description": "User's selected option",
      "required": false
    }
  ]
}
```

**Variable Types:** `string`, `number`, `boolean`, `array`, `object`

### Activities

Activities are the execution units of a workflow. Each activity contains steps, checkpoints, and transitions. Activities can be **sequential** (with transitions) or **independent** (matched via recognition patterns).

```json
{
  "activities": [
    {
      "id": "first-activity",
      "version": "1.0.0",
      "name": "Initial Activity",
      "description": "The first activity of the workflow",
      "skills": { "primary": "workflow-execution" },
      "steps": [],
      "checkpoints": [],
      "transitions": []
    }
  ]
}
```

**Activity Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique activity identifier |
| `version` | string | Semantic version (X.Y.Z) |
| `name` | string | Human-readable activity name |
| `description` | string | Activity description |
| `problem` | string | User problem this activity addresses (for intent matching) |
| `recognition` | string[] | Patterns to match user intent (for independent activities) |
| `skills` | object | Primary and supporting skill references |
| `required` | boolean | Whether activity is required (default: true) |
| `estimatedTime` | string | Time estimate (e.g., `10-15m`, `1h`, `2-3h`) |
| `steps` | array | Steps within the activity |
| `checkpoints` | array | User decision points |
| `decisions` | array | Automated branching points |
| `loops` | array | Iteration constructs |
| `transitions` | array | Activity transition rules |
| `triggers` | object | Workflow to trigger from this activity |
| `entryActions` | array | Actions on entering activity |
| `exitActions` | array | Actions on exiting activity |
| `outcome` | string[] | Expected outcomes on completion |
| `context_to_preserve` | string[] | Context items to preserve |

### Steps

Steps are individual tasks within an activity:

```json
{
  "steps": [
    {
      "id": "step-1-1",
      "name": "Verify prerequisites",
      "description": "Check that all requirements are met",
      "required": true
    }
  ]
}
```

### Checkpoints

Checkpoints pause execution and require user input:

```json
{
  "checkpoints": [
    {
      "id": "checkpoint-1",
      "name": "Confirmation Checkpoint",
      "message": "Do you want to proceed?",
      "required": true,
      "blocking": true,
      "options": [
        {
          "id": "proceed",
          "label": "Yes, proceed",
          "description": "Continue to the next phase",
          "effect": {
            "setVariable": { "user_confirmed": true }
          }
        },
        {
          "id": "cancel",
          "label": "No, cancel",
          "effect": {
            "transitionTo": "phase-cancelled"
          }
        }
      ]
    }
  ]
}
```

**Checkpoint Option Effects:**
- `setVariable` - Set workflow variables
- `transitionTo` - Jump to a specific activity
- `skipActivities` - Skip specified activities

### Decisions

Decisions are automated branching points based on conditions:

```json
{
  "decisions": [
    {
      "id": "decision-1",
      "name": "Path Selection",
      "description": "Choose path based on variable",
      "branches": [
        {
          "id": "branch-a",
          "label": "Path A",
          "condition": {
            "type": "simple",
            "variable": "option",
            "operator": "==",
            "value": "a"
          },
          "transitionTo": "activity-a"
        },
        {
          "id": "branch-default",
          "label": "Default Path",
          "transitionTo": "activity-default",
          "isDefault": true
        }
      ]
    }
  ]
}
```

### Loops

Loops enable iteration over collections or while conditions:

```json
{
  "loops": [
    {
      "id": "loop-1",
      "name": "Task Loop",
      "type": "forEach",
      "variable": "current_task",
      "over": "tasks",
      "maxIterations": 100,
      "steps": [
        {
          "id": "step-loop-1",
          "name": "Process task"
        }
      ]
    }
  ]
}
```

**Loop Types:** `forEach`, `while`, `doWhile`

### Transitions

Transitions define how to move between activities:

```json
{
  "transitions": [
    {
      "to": "next-activity",
      "condition": {
        "type": "simple",
        "variable": "user_confirmed",
        "operator": "==",
        "value": true
      }
    },
    {
      "to": "fallback-activity",
      "isDefault": true
    }
  ]
}
```

### Triggers

Triggers allow an activity to invoke another workflow:

```json
{
  "triggers": {
    "workflow": "work-package",
    "description": "Execute work-package workflow for each planned package",
    "passContext": ["current_package", "priority_order"]
  }
}
```

---

## Condition Schema

The condition schema (`condition.schema.json`) defines expressions for controlling transitions, decisions, and loops.

### Simple Conditions

Compare a variable to a value:

```json
{
  "type": "simple",
  "variable": "status",
  "operator": "==",
  "value": "approved"
}
```

**Operators:**

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal | `"status" == "active"` |
| `!=` | Not equal | `"count" != 0` |
| `>` | Greater than | `"score" > 80` |
| `<` | Less than | `"attempts" < 3` |
| `>=` | Greater or equal | `"level" >= 5` |
| `<=` | Less or equal | `"errors" <= 10` |
| `exists` | Variable is defined | `"user_id" exists` |
| `notExists` | Variable is undefined | `"error" notExists` |

### Composite Conditions

Combine conditions with logical operators:

**AND - All conditions must be true:**

```json
{
  "type": "and",
  "conditions": [
    {
      "type": "simple",
      "variable": "status",
      "operator": "==",
      "value": "ready"
    },
    {
      "type": "simple",
      "variable": "count",
      "operator": ">",
      "value": 0
    }
  ]
}
```

**OR - At least one condition must be true:**

```json
{
  "type": "or",
  "conditions": [
    {
      "type": "simple",
      "variable": "role",
      "operator": "==",
      "value": "admin"
    },
    {
      "type": "simple",
      "variable": "role",
      "operator": "==",
      "value": "moderator"
    }
  ]
}
```

**NOT - Condition must be false:**

```json
{
  "type": "not",
  "condition": {
    "type": "simple",
    "variable": "blocked",
    "operator": "==",
    "value": true
  }
}
```

### Nested Conditions

Conditions can be nested for complex logic:

```json
{
  "type": "and",
  "conditions": [
    {
      "type": "simple",
      "variable": "authenticated",
      "operator": "==",
      "value": true
    },
    {
      "type": "or",
      "conditions": [
        {
          "type": "simple",
          "variable": "role",
          "operator": "==",
          "value": "admin"
        },
        {
          "type": "simple",
          "variable": "permissions",
          "operator": "exists"
        }
      ]
    }
  ]
}
```

---

## State Schema

The state schema (`state.schema.json`) tracks runtime execution of a workflow using activity IDs for navigation.

### State Fields

| Field                 | Type                      | Purpose                                                        |
| --------------------- | ------------------------- | -------------------------------------------------------------- |
| `workflowId`          | string                    | Workflow being executed                                        |
| `workflowVersion`     | string                    | Version of workflow                                            |
| `stateVersion`        | integer                   | State schema version                                           |
| `currentActivity`     | string                    | Current activity ID                                            |
| `currentStep`         | integer                   | Current step index within activity (1-based)                   |
| `completedActivities` | string[]                  | Completed activity IDs                                         |
| `skippedActivities`   | string[]                  | Skipped activity IDs                                           |
| `completedSteps`      | Record<string, integer[]> | Steps completed per activity                                   |
| `checkpointResponses` | Record<string, Response>  | Checkpoint answers (key: "activity-checkpoint")                |
| `decisionOutcomes`    | Record<string, Outcome>   | Decision results (key: "activity-decision")                    |
| `activeLoops`         | LoopState[]               | Currently executing loops                                      |
| `variables`           | Record<string, any>       | Runtime variable values                                        |
| `history`             | HistoryEntry[]            | Execution event log                                            |
| `status`              | enum                      | "running", "paused", "suspended", "completed", "aborted", "error" |
| `parentWorkflow`      | ParentWorkflowRef         | Reference to parent workflow (if triggered)                    |
| `triggeredWorkflows`  | TriggeredWorkflowRef[]    | Child workflows triggered from this one                        |

### State Structure

```json
{
  "workflowId": "my-workflow",
  "workflowVersion": "1.0.0",
  "stateVersion": 1,
  "startedAt": "2026-01-22T10:00:00.000Z",
  "updatedAt": "2026-01-22T10:05:00.000Z",
  "currentActivity": "second-activity",
  "currentStep": 1,
  "completedActivities": ["first-activity"],
  "skippedActivities": [],
  "completedSteps": {
    "first-activity": [1, 2]
  },
  "checkpointResponses": {},
  "decisionOutcomes": {},
  "activeLoops": [],
  "variables": {
    "user_confirmed": true
  },
  "history": [],
  "status": "running",
  "parentWorkflow": null,
  "triggeredWorkflows": []
}
```

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `workflowId` | string | ID of the workflow being executed |
| `workflowVersion` | string | Version of the workflow |
| `startedAt` | datetime | When execution started |
| `updatedAt` | datetime | Last state update |
| `currentActivity` | string | Currently active activity ID |

### Status Values

| Status | Description |
|--------|-------------|
| `running` | Workflow is actively executing |
| `paused` | Execution paused (awaiting user input) |
| `suspended` | Waiting for triggered child workflow to complete |
| `completed` | Workflow finished successfully |
| `aborted` | Workflow was cancelled |
| `error` | Workflow encountered an error |

### Nested Workflow Support

When an activity triggers another workflow, the state tracks the relationship:

**Parent Workflow Reference:**
```json
{
  "parentWorkflow": {
    "workflowId": "work-packages",
    "activityId": "implementation",
    "passedContext": { "current_package": "feature-auth" },
    "returnTo": { "activityId": "implementation", "stepIndex": 4 }
  }
}
```

**Triggered Workflows:**
```json
{
  "triggeredWorkflows": [
    {
      "workflowId": "work-package",
      "triggeredAt": "2026-01-22T10:00:00.000Z",
      "triggeredFrom": { "activityId": "implementation", "stepIndex": 2 },
      "status": "completed",
      "returnedContext": { "pr_number": "123" }
    }
  ]
}
```

### History Events

The `history` array tracks all workflow events:

```json
{
  "history": [
    {
      "timestamp": "2026-01-22T10:00:00.000Z",
      "type": "workflow_started",
      "activity": "first-activity"
    },
    {
      "timestamp": "2026-01-22T10:01:00.000Z",
      "type": "step_completed",
      "activity": "first-activity",
      "step": 1
    },
    {
      "timestamp": "2026-01-22T10:02:00.000Z",
      "type": "workflow_triggered",
      "activity": "implementation",
      "data": { "targetWorkflow": "work-package" }
    }
  ]
}
```

**Event Types:**
- `workflow_started`, `workflow_completed`, `workflow_aborted`, `workflow_triggered`, `workflow_returned`, `workflow_suspended`
- `activity_entered`, `activity_exited`, `activity_skipped`
- `step_started`, `step_completed`
- `checkpoint_reached`, `checkpoint_response`
- `decision_reached`, `decision_branch_taken`
- `loop_started`, `loop_iteration`, `loop_completed`, `loop_break`
- `variable_set`, `error`

---

## Complete Example

Here's a minimal valid workflow that demonstrates all key concepts:

```json
{
  "$schema": "../../schemas/workflow.schema.json",
  "id": "example-workflow",
  "version": "1.0.0",
  "title": "Example Workflow",
  "description": "A minimal workflow demonstrating key schema features",
  "variables": [
    {
      "name": "approved",
      "type": "boolean",
      "defaultValue": false
    }
  ],
  "initialActivity": "review",
  "activities": [
    {
      "id": "review",
      "version": "1.0.0",
      "name": "Review",
      "description": "Initial review and approval",
      "skills": { "primary": "workflow-execution" },
      "estimatedTime": "5-10m",
      "steps": [
        {
          "id": "step-gather",
          "name": "Gather information"
        }
      ],
      "checkpoints": [
        {
          "id": "checkpoint-approve",
          "name": "Approval Checkpoint",
          "message": "Do you approve this item?",
          "blocking": true,
          "options": [
            {
              "id": "approve",
              "label": "Approve",
              "effect": {
                "setVariable": { "approved": true }
              }
            },
            {
              "id": "reject",
              "label": "Reject",
              "effect": {
                "setVariable": { "approved": false }
              }
            }
          ]
        }
      ],
      "transitions": [
        {
          "to": "process",
          "condition": {
            "type": "simple",
            "variable": "approved",
            "operator": "==",
            "value": true
          }
        },
        {
          "to": "rejected",
          "isDefault": true
        }
      ]
    },
    {
      "id": "process",
      "version": "1.0.0",
      "name": "Processing",
      "skills": { "primary": "workflow-execution" },
      "steps": [
        {
          "id": "step-process",
          "name": "Process the approved item"
        }
      ]
    },
    {
      "id": "rejected",
      "version": "1.0.0",
      "name": "Rejection",
      "skills": { "primary": "workflow-execution" },
      "steps": [
        {
          "id": "step-notify",
          "name": "Notify of rejection"
        }
      ]
    }
  ]
}
```

---

## Validation

### Using the Validation Script

Validate a workflow file:

```bash
npx tsx scripts/validate-workflow.ts path/to/workflow.json
```

### Programmatic Validation

```typescript
import { validateWorkflow, safeValidateWorkflow } from './src/schema/workflow.schema';

// Throws on invalid
const workflow = validateWorkflow(data);

// Returns { success: true, data } or { success: false, error }
const result = safeValidateWorkflow(data);
if (result.success) {
  console.log('Valid workflow:', result.data);
} else {
  console.error('Validation errors:', result.error);
}
```

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Missing required property | `id`, `version`, `title`, or `activities` not provided | Add the required property |
| Invalid version format | Version doesn't match `X.Y.Z` pattern | Use semantic versioning |
| Invalid activity reference | `initialActivity` or transition `to` references non-existent activity | Check activity IDs match |
| Checkpoint missing options | Checkpoint defined without any options | Add at least one option |
| Decision needs branches | Decision defined with fewer than 2 branches | Add at least 2 branches |

---

## Activity Schema

The activity schema (`activity.schema.json`) defines unified activities that combine intent matching (problem, recognition) with workflow execution (steps, checkpoints, decisions, loops, transitions, triggers). Activities are used both as standalone entry points and as workflow stages.

### Top-Level Structure

```json
{
  "id": "start-workflow",
  "version": "3.0.0",
  "name": "Start Workflow",
  "problem": "The user wants to begin executing a new workflow from the beginning.",
  "recognition": ["Start a workflow", "Begin workflow", "Execute workflow"],
  "skills": {
    "primary": "workflow-execution",
    "supporting": ["activity-resolution", "state-management"]
  },
  "steps": [
    { "id": "select", "name": "Select workflow" },
    { "id": "load", "name": "Load workflow definition" }
  ],
  "outcome": ["Workflow is selected and loaded", "Initial state is created"],
  "context_to_preserve": ["workflowId", "currentActivity", "rules"]
}
```

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique activity identifier |
| `version` | string | Semantic version (e.g., `3.0.0`) |
| `name` | string | Human-readable activity name |
| `skills` | object | Primary and supporting skill references |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `description` | string | Detailed description |
| `problem` | string | User problem this activity addresses (for intent matching) |
| `recognition` | string[] | Patterns to match user intent (for independent activities) |
| `steps` | Step[] | Ordered execution steps |
| `checkpoints` | Checkpoint[] | User decision points |
| `decisions` | Decision[] | Automated branching points |
| `loops` | Loop[] | Iteration constructs |
| `transitions` | Transition[] | Navigation to other activities |
| `triggers` | WorkflowTrigger | Workflow to trigger from this activity |
| `entryActions` | Action[] | Actions on entering activity |
| `exitActions` | Action[] | Actions on exiting activity |
| `outcome` | string[] | Expected outcomes when activity completes |
| `context_to_preserve` | string[] | Context items to preserve |
| `required` | boolean | Whether activity is required (default: true) |
| `estimatedTime` | string | Time estimate (e.g., "10-15m") |
| `notes` | string[] | Additional notes or caveats |

### Activity Types

**Independent Activities** (e.g., meta workflow):
- Have `recognition` patterns for intent matching
- No `transitions` to other activities
- Matched via `get_activities` tool

**Sequential Activities** (e.g., work-package workflow):
- Have `transitions` connecting them
- Form a workflow flow
- Require `initialActivity` on parent workflow

### Complete Example

A complete activity definition with workflow trigger:

```json
{
  "id": "implementation",
  "version": "1.1.0",
  "name": "Implementation",
  "description": "Execute each planned work package by triggering the work-package workflow",
  "problem": "Planned work packages need to be implemented one at a time",
  "skills": {
    "primary": "workflow-execution"
  },
  "triggers": {
    "workflow": "work-package",
    "description": "Each iteration starts the work-package workflow for one planned package",
    "passContext": ["current_package", "priority_order"]
  },
  "steps": [
    { "id": "select", "name": "Select next work package" },
    { "id": "trigger", "name": "Trigger work-package workflow" },
    { "id": "update", "name": "Update roadmap status" }
  ],
  "loops": [
    {
      "id": "package-iteration",
      "name": "Package Iteration",
      "type": "forEach",
      "variable": "current_package",
      "over": "remaining_packages"
    }
  ],
  "outcome": [
    "All planned work packages implemented",
    "Roadmap status reflects completion"
  ],
  "context_to_preserve": [
    "current_package",
    "completed_packages",
    "remaining_packages",
    "parent_workflow"
  ]
}
```

---

## Skill Schema

The skill schema (`skill.schema.json`) defines agent capabilities for workflow execution. Skills describe tool orchestration patterns, execution guidance, and error handling strategies.

### Top-Level Structure

```json
{
  "id": "workflow-execution",
  "version": "2.0.0",
  "capability": "Execute workflows from start to completion with consistent tool usage",
  "execution_pattern": {},
  "tools": {},
  "state": {},
  "errors": {}
}
```

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique skill identifier |
| `version` | string | Semantic version (e.g., `2.0.0`) |
| `capability` | string | What this skill enables agents to do |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `description` | string | Detailed skill description |
| `architecture` | object | Architectural principles and layers |
| `execution_pattern` | object | Tool call sequences for different stages |
| `tools` | object | Tool definitions and usage patterns |
| `flow` | string[] | Ordered execution steps |
| `matching` | object | Goal-to-activity matching strategies |
| `state` | object | State structure and update patterns |
| `interpretation` | object | How to interpret workflow constructs |
| `rules` | string[] | Skill-level rules and constraints agents must follow when executing this skill |
| `errors` | object | Error definitions and recovery strategies |

### Execution Pattern

Defines the sequence of tool calls for different execution stages:

```json
{
  "execution_pattern": {
    "start": ["list_workflows", "get_workflow", "list_workflow_resources"],
    "per_activity": ["get_workflow_activity", "get_checkpoint", "get_resource"],
    "transitions": ["validate_transition"]
  }
}
```

| Field | Purpose |
|-------|---------|
| `start` | Tools to call at workflow start |
| `bootstrap` | Initial bootstrap tools |
| `per_activity` | Tools to call for each activity |
| `skill_loading` | Tools for loading skills |
| `discovery` | Tools for resource discovery |
| `transitions` | Tools for activity transitions |

### Tool Definitions

Describe how and when to use each tool:

```json
{
  "tools": {
    "get_workflow": {
      "when": "Loading workflow for execution",
      "params": "workflow_id",
      "returns": "Complete workflow definition",
      "preserve": ["id", "initialPhase", "variables", "rules", "phases"]
    },
    "get_phase": {
      "when": "Entering a new phase",
      "params": "workflow_id, phase_id",
      "returns": "Phase details with steps, checkpoints, decisions",
      "preserve": ["steps", "checkpoints", "decisions", "transitions"]
    }
  }
}
```

| Field | Purpose |
|-------|---------|
| `when` | Conditions or triggers for using this tool |
| `params` | Parameters the tool accepts |
| `returns` | What the tool returns |
| `next` | Suggested next tool to call |
| `action` | Action to take with the result |
| `usage` | How to use the tool effectively |
| `preserve` | Fields to preserve from the result |

### Architecture

For skills that define architectural patterns:

```json
{
  "architecture": {
    "principle": "Goals resolve to activities; activities resolve to skills",
    "layers": [
      "User Goal (problem domain) → Activity",
      "Activity → Skill(s) (solution domain)",
      "Skill → Tools (execution domain)"
    ],
    "gap_detection": "If a goal matches a skill but no activity exists, create one"
  }
}
```

### Matching

For skills that involve goal resolution:

```json
{
  "matching": {
    "quick_match": "Use exact or fuzzy match against quick_match keys",
    "fallback": "If no quick_match, compare user goal to activity.problem",
    "ambiguous": "If multiple activities match, ask user to clarify",
    "never": "NEVER skip activity matching to use a skill directly"
  }
}
```

### Error Definitions

Define error conditions and recovery strategies:

```json
{
  "errors": {
    "workflow_not_found": {
      "cause": "Invalid workflow_id parameter",
      "recovery": "Call list_workflows to discover valid IDs"
    },
    "no_matching_activity": {
      "cause": "User goal doesn't match any existing activity",
      "detection": "Goal could be served by existing skill but no activity maps to it",
      "resolution": [
        "1. Identify which skill(s) would serve this goal",
        "2. Create a new activity that maps goal to skill",
        "3. Add activity to prompts/intents/ with recognition patterns"
      ],
      "note": "This is a design gap, not a user error"
    }
  }
}
```

### Complete Example

A minimal skill demonstrating key concepts:

```json
{
  "id": "example-skill",
  "version": "1.0.0",
  "capability": "Demonstrate skill schema structure",
  "description": "A minimal skill showing required and optional fields",
  "execution_pattern": {
    "start": ["discover_resources"],
    "per_task": ["execute_task", "validate_result"]
  },
  "tools": {
    "discover_resources": {
      "when": "Beginning a new task",
      "params": "none",
      "returns": "List of available resources"
    },
    "execute_task": {
      "when": "Ready to perform work",
      "params": "task_id, options",
      "returns": "Execution result",
      "next": "validate_result"
    },
    "validate_result": {
      "when": "After task execution",
      "params": "result",
      "returns": "Validation status"
    }
  },
  "flow": [
    "1. Call discover_resources to understand context",
    "2. Match task to available resources",
    "3. Call execute_task with appropriate parameters",
    "4. Call validate_result to confirm success"
  ],
  "errors": {
    "resource_not_found": {
      "cause": "Requested resource does not exist",
      "recovery": "Call discover_resources to see available options"
    }
  }
}
```

---

## Related Documentation

- [API Reference](../docs/api-reference.md) - MCP server tools and endpoints
- [Development Guide](../docs/development.md) - Building and testing the server
