---
name: schema-construct-inventory
description: Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents.
metadata:
  order: 1
  legacy_id: 1
---

# Schema Construct Inventory

Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents. Every piece of prose must be checked against this inventory — if a formal construct exists, it must be used.

**Authoritative schema sources:**

| Schema | Path | Documentation |
|--------|------|---------------|
| Workflow | `schemas/workflow.schema.json` | `schemas/README.md — Workflow Schema` |
| Activity | `schemas/activity.schema.json` | `schemas/README.md — Activity Schema` |
| Technique | `schemas/technique.schema.json` | `schemas/README.md — Technique Schema` |
| Condition | `schemas/condition.schema.json` | `schemas/README.md — Condition Schema` |
| State | `schemas/state.schema.json` | `schemas/README.md — State Schema` |

The MCP resource `workflow-server://schemas` returns all five schemas as a single JSON object. The `schemas/README.md` file (45KB) contains the full ontology with entity relationships, field tables, examples, and validation guidance.

---

## Activity-Level Constructs (activity.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "Do X, then do Y, then do Z" | **Steps** | `steps[].id`, `.name`, `.description`, `.technique`, `.actions` |
| "Ask the user whether to proceed" | **Checkpoint** | `checkpoints[].id`, `.name`, `.message`, `.options[]` with `.effect` |
| "If X then do A, otherwise do B" (automated) | **Decision** | `decisions[].branches[]` with `.condition` and `.transitionTo` |
| "Repeat for each item" / "do until done" | **Loop** | `loops[].type` (forEach/while/doWhile), `.variable`, `.over`, `.condition` |
| "Then move on to the next phase" | **Transition** | `transitions[].to`, `.condition`, `.isDefault` |
| "This triggers the X workflow" | **Trigger** | `triggers.workflow`, `.description`, `.passContext` |
| "When entering/finishing, log/validate/set" | **Leading/trailing control step** | a first/last `steps[]` entry with `actions[]` (`log`/`validate`/`set`/`emit`/`message`) — there is no activity-level entry/exit hook; lifecycle actions are ordinary control steps at the start/end of the step sequence |
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

## Technique-Level Constructs (technique.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "First do A, then do B" (procedure) | **Protocol** | `protocol[]` — ordered blocks `{ title?, steps[] }`; titled blocks `Initial`/`Final` on a container wrap descendants (server renumbers) |
| "Needs a checklist path as input" | **Inputs** | `inputs[].id`, `.description`, `.required`, `.default`, `.components` (composite members as `####` sub-sections) |
| "Produces an audit report" | **Output** | `output[].id`, `.description`, `.components` (`####` sub-sections), `.artifact.name` (`#### artifact`) |
| "Never modify the schema" | **Rules** | `rules.{rule-name}` — flat name-value pairs |
| "Use get_workflow to load data" | **Tools** | `tools.{name}.when`, `.params`, `.returns`, `.next` |
| "If X fails, recover by Y" (failure handling) | **Protocol step** | written inline in the protocol step that gives rise to the failure |
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
