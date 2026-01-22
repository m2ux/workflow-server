# Workflow Server Schemas

This directory contains JSON Schema definitions for the workflow server. These schemas are automatically generated from TypeScript/Zod source definitions and provide validation for workflow definitions, conditions, and execution state.

## Schema Files

| Schema | Purpose | Source |
|--------|---------|--------|
| [workflow.schema.json](workflow.schema.json) | Workflow definition structure | `src/schema/workflow.schema.ts` |
| [condition.schema.json](condition.schema.json) | Conditional expression logic | `src/schema/condition.schema.ts` |
| [state.schema.json](state.schema.json) | Workflow execution state | `src/schema/state.schema.ts` |

## Generation

Schemas are generated from Zod TypeScript definitions using `zod-to-json-schema`:

```bash
npm run build:schemas
```

This runs `scripts/generate-schemas.ts` which outputs JSON Schema files to this directory.

> **Note**: Do not edit the JSON files directly. Modify the TypeScript source in `src/schema/` and regenerate.

---

## Workflow Schema

The workflow schema (`workflow.schema.json`) defines the complete structure for workflow definitions. Workflows consist of phases containing steps, checkpoints, decisions, and loops.

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique workflow identifier |
| `version` | string | Semantic version (e.g., `1.0.0`) |
| `title` | string | Human-readable workflow title |
| `initialPhase` | string | ID of the starting phase |
| `phases` | Phase[] | Array of workflow phases (min: 1) |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `$schema` | string | JSON Schema reference for IDE support |
| `description` | string | Detailed workflow description |
| `author` | string | Workflow author |
| `tags` | string[] | Categorization tags |
| `rules` | string[] | Associated rule file paths |
| `variables` | VariableDefinition[] | Workflow variable definitions |

### Phase Structure

Phases are the primary organizational unit within a workflow:

```json
{
  "id": "implementation",
  "name": "Implementation Phase",
  "description": "Implement the feature according to the design",
  "required": true,
  "estimatedTime": "2-4h",
  "steps": [...],
  "checkpoints": [...],
  "decisions": [...],
  "transitions": [...]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique phase identifier |
| `name` | string | Yes | Human-readable phase name |
| `description` | string | No | Detailed description |
| `required` | boolean | No | Whether phase can be skipped (default: `true`) |
| `estimatedTime` | string | No | Time estimate (e.g., `30m`, `2-4h`, `1d`) |
| `guide` | GuideReference | No | Reference to guide documentation |
| `entryActions` | Action[] | No | Actions to run when entering phase |
| `exitActions` | Action[] | No | Actions to run when exiting phase |
| `steps` | Step[] | No | Ordered steps within the phase |
| `checkpoints` | Checkpoint[] | No | User decision points |
| `decisions` | Decision[] | No | Conditional branching points |
| `loops` | Loop[] | No | Iteration constructs |
| `transitions` | Transition[] | No | Rules for moving to next phase |

### Step Structure

Steps represent individual tasks within a phase:

```json
{
  "id": "write-tests",
  "name": "Write Unit Tests",
  "description": "Create tests for the new functionality",
  "required": true,
  "guide": {
    "path": "guides/testing.md",
    "section": "unit-tests"
  }
}
```

### Checkpoint Structure

Checkpoints pause workflow execution to collect user input:

```json
{
  "id": "review-checkpoint",
  "name": "Code Review Decision",
  "message": "How should we proceed with the code review?",
  "options": [
    {
      "id": "self-review",
      "label": "Self Review",
      "description": "Perform self-review and continue"
    },
    {
      "id": "peer-review",
      "label": "Request Peer Review",
      "effect": {
        "setVariable": { "reviewType": "peer" },
        "transitionTo": "peer-review-phase"
      }
    }
  ],
  "blocking": true
}
```

### Decision Structure

Decisions enable conditional branching based on workflow variables:

```json
{
  "id": "complexity-decision",
  "name": "Complexity Check",
  "branches": [
    {
      "id": "simple-path",
      "label": "Simple Implementation",
      "condition": {
        "type": "simple",
        "variable": "complexity",
        "operator": "==",
        "value": "low"
      },
      "transitionTo": "quick-implementation"
    },
    {
      "id": "complex-path",
      "label": "Complex Implementation",
      "isDefault": true,
      "transitionTo": "detailed-implementation"
    }
  ]
}
```

### Loop Structure

Loops allow repeated execution over items or while conditions are met:

```json
{
  "id": "file-loop",
  "name": "Process Each File",
  "type": "forEach",
  "variable": "currentFile",
  "over": "filesToProcess",
  "maxIterations": 50,
  "steps": [
    {
      "id": "process-file",
      "name": "Process File"
    }
  ]
}
```

| Loop Type | Description |
|-----------|-------------|
| `forEach` | Iterates over an array variable |
| `while` | Continues while condition is true |
| `doWhile` | Executes at least once, then continues while condition is true |

### Variable Definition

Variables can be declared at the workflow level:

```json
{
  "name": "taskCount",
  "type": "number",
  "description": "Number of tasks to process",
  "defaultValue": 0,
  "required": false
}
```

Supported types: `string`, `number`, `boolean`, `array`, `object`

### Complete Workflow Example

```json
{
  "$schema": "../schemas/workflow.schema.json",
  "id": "feature-development",
  "version": "1.0.0",
  "title": "Feature Development Workflow",
  "description": "Standard workflow for implementing new features",
  "author": "team",
  "tags": ["development", "feature"],
  "variables": [
    {
      "name": "featureName",
      "type": "string",
      "required": true
    },
    {
      "name": "complexity",
      "type": "string",
      "defaultValue": "medium"
    }
  ],
  "initialPhase": "planning",
  "phases": [
    {
      "id": "planning",
      "name": "Planning Phase",
      "description": "Define requirements and approach",
      "steps": [
        {
          "id": "gather-requirements",
          "name": "Gather Requirements"
        },
        {
          "id": "create-design",
          "name": "Create Design Document"
        }
      ],
      "checkpoints": [
        {
          "id": "design-approval",
          "name": "Design Approval",
          "message": "Is the design ready for implementation?",
          "options": [
            {
              "id": "approved",
              "label": "Approved - Proceed"
            },
            {
              "id": "needs-revision",
              "label": "Needs Revision",
              "effect": {
                "transitionTo": "planning"
              }
            }
          ]
        }
      ],
      "transitions": [
        {
          "to": "implementation",
          "isDefault": true
        }
      ]
    },
    {
      "id": "implementation",
      "name": "Implementation Phase",
      "steps": [
        {
          "id": "write-code",
          "name": "Write Implementation Code"
        },
        {
          "id": "write-tests",
          "name": "Write Tests"
        }
      ],
      "transitions": [
        {
          "to": "review"
        }
      ]
    },
    {
      "id": "review",
      "name": "Review Phase",
      "steps": [
        {
          "id": "code-review",
          "name": "Perform Code Review"
        },
        {
          "id": "merge",
          "name": "Merge Changes"
        }
      ]
    }
  ]
}
```

---

## Condition Schema

The condition schema (`condition.schema.json`) defines expressions for conditional logic in decisions, transitions, and loops.

### Condition Types

| Type | Description |
|------|-------------|
| `simple` | Direct variable comparison |
| `and` | All conditions must be true |
| `or` | At least one condition must be true |
| `not` | Negates a condition |

### Simple Condition

Compare a variable against a value:

```json
{
  "type": "simple",
  "variable": "status",
  "operator": "==",
  "value": "approved"
}
```

### Operators

| Operator | Description | Value Required |
|----------|-------------|----------------|
| `==` | Equal to | Yes |
| `!=` | Not equal to | Yes |
| `>` | Greater than | Yes (numeric) |
| `<` | Less than | Yes (numeric) |
| `>=` | Greater than or equal | Yes (numeric) |
| `<=` | Less than or equal | Yes (numeric) |
| `exists` | Variable is defined and not null | No |
| `notExists` | Variable is undefined or null | No |

### Nested Variable Access

Variables support dot notation for accessing nested properties:

```json
{
  "type": "simple",
  "variable": "config.settings.enabled",
  "operator": "==",
  "value": true
}
```

### Compound Conditions

Combine multiple conditions with logical operators:

**AND Condition** (all must be true):

```json
{
  "type": "and",
  "conditions": [
    {
      "type": "simple",
      "variable": "isReady",
      "operator": "==",
      "value": true
    },
    {
      "type": "simple",
      "variable": "errorCount",
      "operator": "==",
      "value": 0
    }
  ]
}
```

**OR Condition** (at least one must be true):

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

**NOT Condition** (negation):

```json
{
  "type": "not",
  "condition": {
    "type": "simple",
    "variable": "isBlocked",
    "operator": "==",
    "value": true
  }
}
```

### Complex Nested Example

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
          "type": "and",
          "conditions": [
            {
              "type": "simple",
              "variable": "role",
              "operator": "==",
              "value": "user"
            },
            {
              "type": "simple",
              "variable": "permissions.canEdit",
              "operator": "==",
              "value": true
            }
          ]
        }
      ]
    }
  ]
}
```

---

## State Schema

The state schema (`state.schema.json`) defines the structure for tracking workflow execution progress.

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `workflowId` | string | ID of the executing workflow |
| `workflowVersion` | string | Version of the workflow |
| `startedAt` | datetime | When execution started |
| `updatedAt` | datetime | Last state update time |
| `currentPhase` | string | Currently active phase ID |

### Tracking Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `stateVersion` | integer | `1` | Increments on each state change |
| `completedAt` | datetime | - | When workflow completed |
| `currentStep` | string | - | Currently active step ID |
| `completedPhases` | string[] | `[]` | IDs of completed phases |
| `skippedPhases` | string[] | `[]` | IDs of skipped phases |
| `completedSteps` | object | `{}` | Map of phase ID to completed step IDs |
| `status` | enum | `"running"` | Current workflow status |

### Status Values

| Status | Description |
|--------|-------------|
| `running` | Workflow is actively executing |
| `paused` | Workflow is paused awaiting input |
| `completed` | Workflow finished successfully |
| `aborted` | Workflow was cancelled |
| `error` | Workflow encountered an error |

### Checkpoint Responses

Records user responses to checkpoints:

```json
{
  "checkpointResponses": {
    "design-approval": {
      "checkpointId": "design-approval",
      "optionId": "approved",
      "respondedAt": "2026-01-22T10:30:00Z",
      "effects": {
        "variablesSet": { "designApproved": true }
      }
    }
  }
}
```

### Decision Outcomes

Records the result of decision evaluations:

```json
{
  "decisionOutcomes": {
    "complexity-decision": {
      "decisionId": "complexity-decision",
      "branchId": "simple-path",
      "decidedAt": "2026-01-22T10:35:00Z",
      "transitionedTo": "quick-implementation"
    }
  }
}
```

### Loop State

Tracks active loop iterations:

```json
{
  "activeLoops": [
    {
      "loopId": "file-loop",
      "currentIteration": 3,
      "totalItems": 10,
      "currentItem": "src/utils.ts",
      "startedAt": "2026-01-22T10:40:00Z"
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
      "timestamp": "2026-01-22T10:00:00Z",
      "type": "workflow_started",
      "phase": "planning",
      "data": { "initialVariables": { "featureName": "dark-mode" } }
    },
    {
      "timestamp": "2026-01-22T10:15:00Z",
      "type": "step_completed",
      "phase": "planning",
      "step": "gather-requirements"
    },
    {
      "timestamp": "2026-01-22T10:30:00Z",
      "type": "checkpoint_response",
      "phase": "planning",
      "checkpoint": "design-approval",
      "data": { "optionId": "approved" }
    }
  ]
}
```

### Event Types

| Event Type | Description |
|------------|-------------|
| `workflow_started` | Workflow execution began |
| `workflow_completed` | Workflow finished successfully |
| `workflow_aborted` | Workflow was cancelled |
| `phase_entered` | Entered a new phase |
| `phase_exited` | Exited a phase |
| `phase_skipped` | Phase was skipped |
| `step_started` | Started a step |
| `step_completed` | Completed a step |
| `checkpoint_reached` | Arrived at a checkpoint |
| `checkpoint_response` | User responded to checkpoint |
| `decision_reached` | Arrived at a decision |
| `decision_branch_taken` | Decision branch was selected |
| `loop_started` | Loop began |
| `loop_iteration` | Loop iteration completed |
| `loop_completed` | Loop finished |
| `loop_break` | Loop exited early |
| `variable_set` | Variable value changed |
| `error` | Error occurred |

### Complete State Example

```json
{
  "workflowId": "feature-development",
  "workflowVersion": "1.0.0",
  "stateVersion": 15,
  "startedAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T11:45:00Z",
  "currentPhase": "implementation",
  "currentStep": "write-tests",
  "completedPhases": ["planning"],
  "skippedPhases": [],
  "completedSteps": {
    "planning": ["gather-requirements", "create-design"],
    "implementation": ["write-code"]
  },
  "checkpointResponses": {
    "design-approval": {
      "checkpointId": "design-approval",
      "optionId": "approved",
      "respondedAt": "2026-01-22T10:30:00Z"
    }
  },
  "decisionOutcomes": {},
  "activeLoops": [],
  "variables": {
    "featureName": "dark-mode",
    "complexity": "medium",
    "designApproved": true
  },
  "status": "running",
  "history": [
    {
      "timestamp": "2026-01-22T10:00:00Z",
      "type": "workflow_started",
      "phase": "planning"
    }
  ]
}
```

---

## Validation

### Using JSON Schema in IDEs

Reference the schema in your workflow files for IDE validation and autocomplete:

```json
{
  "$schema": "./schemas/workflow.schema.json",
  "id": "my-workflow",
  ...
}
```

### Programmatic Validation (TypeScript)

```typescript
import { validateWorkflow, safeValidateWorkflow } from './src/schema/workflow.schema';
import { validateCondition } from './src/schema/condition.schema';
import { validateState } from './src/schema/state.schema';

// Throws on invalid data
const workflow = validateWorkflow(data);

// Returns { success: boolean, data?, error? }
const result = safeValidateWorkflow(data);
if (result.success) {
  console.log('Valid workflow:', result.data);
} else {
  console.error('Validation errors:', result.error.issues);
}
```

### CLI Validation

```bash
npx tsx scripts/validate-workflow.ts path/to/workflow.json
```

---

## Related Documentation

- [API Reference](../docs/api-reference.md) - MCP tool documentation
- [Development Guide](../docs/development.md) - Contributing and development setup
- [Main README](../README.md) - Project overview
