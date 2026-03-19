# Schema Construct Inventory

Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents. During quality review, every piece of prose must be checked against this inventory — if a formal construct exists, it must be used.

---

## Activity-Level Constructs (activity.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "Do X, then do Y, then do Z" | **Steps** | `steps[].id`, `.name`, `.description`, `.skill`, `.actions` |
| "Ask the user whether to proceed" | **Checkpoint** | `checkpoints[].id`, `.name`, `.message`, `.options[]` with `.effect` |
| "If X then do A, otherwise do B" (automated) | **Decision** | `decisions[].branches[]` with `.condition` and `.transitionTo` |
| "Repeat for each item" / "do until done" | **Loop** | `loops[].type` (forEach/while/doWhile), `.variable`, `.over`, `.condition` |
| "Then move on to the next phase" | **Transition** | `transitions[].to`, `.condition`, `.isDefault` |
| "This triggers the X workflow" | **Trigger** | `triggers.workflow`, `.description`, `.passContext` |
| "When entering, log a message" | **Entry/exit actions** | `entryActions[]`/`exitActions[]` with `.action` (log/validate/set/emit/message) |
| "This produces a report file" | **Artifact** | `artifacts[].id`, `.name`, `.location`, `.description`, `.action` |
| "The expected result is X" | **Outcome** | `outcome[]` (string array) |
| "Only run when X is true" | **Step condition** | `steps[].condition` (references condition.schema.json) |
| "In fast mode, skip steps 2 and 3" | **Mode overrides** | `modeOverrides.{mode}.skipSteps[]`, `.steps[]`, `.checkpoints[]` |
| "The agent must follow these constraints" | **Activity rules** | `rules[]` (string array) |

## Workflow-Level Constructs (workflow.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "Track whether the user confirmed" | **Variable** | `variables[].name`, `.type`, `.description`, `.defaultValue` |
| "Can run in fast or thorough mode" | **Mode** | `modes[].id`, `.name`, `.activationVariable`, `.skipActivities` |
| "The agent must always do X" | **Workflow rules** | `rules[]` (string array) |
| "Artifacts go in the planning folder" | **Artifact location** | `artifactLocations.{key}.path`, `.description` |
| "Start with the first activity" | **Initial activity** | `initialActivity` (activity ID) |

## Skill-Level Constructs (skill.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "First do A, then do B" (procedure) | **Protocol** | `protocol.{step-id}[]` — arrays of imperative bullets |
| "Needs a checklist path as input" | **Inputs** | `inputs[].id`, `.description`, `.required`, `.default` |
| "Produces an audit report" | **Output** | `output[].id`, `.description`, `.components`, `.artifact.name` |
| "Never modify the schema" | **Rules** | `rules.{rule-name}` — flat name-value pairs |
| "Use get_workflow to load data" | **Tools** | `tools.{name}.when`, `.params`, `.returns`, `.next` |
| "If not found, list available ones" | **Errors** | `errors.{name}.cause`, `.recovery` |
| "How to interpret checkpoints" | **Interpretation** | `interpretation.checkpoints`, `.transitions`, `.decisions` |
| "How to resume after restart" | **Resumption** | `resumption.description`, `.steps[]` |

## Condition Constructs (condition.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "If status equals approved" | **Simple** | `type: "simple"`, `variable`, `operator`, `value` |
| "If the variable is defined" | **Existence** | `operator: "exists"` or `"notExists"` |
| "If A and B are both true" | **AND** | `type: "and"`, `conditions[]` |
| "If either A or B is true" | **OR** | `type: "or"`, `conditions[]` |
| "If X is not the case" | **NOT** | `type: "not"`, `condition` |

## Checkpoint Effects

Always wire checkpoint option consequences to formal effects:

| Effect | Purpose | Example |
|---|---|---|
| `setVariable` | Set variables based on user choice | `{ "setVariable": { "approved": true } }` |
| `transitionTo` | Jump to a specific activity | `{ "transitionTo": "rejected" }` |
| `skipActivities` | Skip downstream activities | `{ "skipActivities": ["research"] }` |

## Action Types

Use entry/exit/step actions for lifecycle hooks:

| Action | Purpose |
|---|---|
| `log` | Record to execution history |
| `validate` | Check pre-condition, fail if not met |
| `set` | Assign a variable value |
| `emit` | Signal an event |
| `message` | Display markdown content to user |
