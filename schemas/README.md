# Schema System

This folder contains JSON Schema definitions for the workflow server. These schemas define the structure for workflow definitions, conditional logic, and the on-disk session record.

The server exposes these schemas as [MCP resources](../docs/api.md#mcp-resources).

## Overview

The workflow server uses six schemas:


| Schema                                                  | Purpose                    |
| ------------------------------------------------------- | -------------------------- |
| [workflow.schema.json](workflow.schema.json#L7)         | Defines workflow structure |
| [activity.schema.json](activity.schema.json#L7)         | Defines an activity        |
| [routine.schema.json](routine.schema.json#L7)           | Defines a routine          |
| [technique.schema.json](technique.schema.json#L7)       | Defines a technique        |
| [condition.schema.json](condition.schema.json#L7)       | Defines a condition        |
| [session-file.schema.json](session-file.schema.json#L7) | The on-disk session file   |




## Enforcement Model

The server enforces structure at load time plus a small runtime core; most schema semantics are carried out by the executing agents. `get_activity` delivers the raw activity YAML verbatim, so every authored field reaches the agent — the classification below states what the **server** does with each field:

- **Engine-enforced** — server behavior or blocking validation depends on the field.
- **Advisory** — rendered to agents and/or checked warn-only; compliance is never enforced.
- **Agent-interpreted** — delivered in the payload, but no server code path reads it; the executing agent carries its semantics.



### Workflow


| Field                                        | Class             | What the server does                                                                                                                       |
| -------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                         | Engine-enforced   | Resolves the workflow file.                                                                                                                |
| `techniques.workflow`, `techniques.activity` | Engine-enforced   | Compose the bundle.                                                                                                                        |
| `activities`, `activitiesDir`                | Engine-enforced   | Assemble the activities.                                                                                                                   |
| `variables[].defaultValue`                   | Engine-enforced   | Seeded into the session variable bag at session creation, and recorded as a `variables_seeded` history event.                              |
| `version`                                    | Advisory          | A mid-session drift warns.                                                                                                                 |
| `title`, `description`, `tags`               | Advisory          | Rendered.                                                                                                                                  |
| `rules.*`                                    | Advisory          | Rendered.                                                                                                                                  |
| `variables[]`                                | Advisory          | The file's own declarations, plus every `variables.writes` declaration the activities in its graph contribute, rendered in `get_workflow`. |
| `initialActivity`                            | Advisory          | A wrong first activity warns.                                                                                                              |
| `variables[].type`, `variables[].values`     | Advisory          | Checkpoint `setVariable` values are validated warn-only. A mismatch is stored as written.                                                  |
| `author`                                     | Agent-interpreted | Authoring metadata. Never checked.                                                                                                         |
| `variables[].required`                       | Agent-interpreted | Authoring metadata. Never checked.                                                                                                         |




### Activity


| Field                                        | Class             | What the server does                                                                                                                                           |
| -------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variables.writes[]`                         | Engine-enforced   | Contributed to the including workflow's variable set at load. Two declarations of one name that disagree on `type`, `defaultValue`, or `values` fail the load. |
| `id`                                         | Engine-enforced   | The navigation key.                                                                                                                                            |
| `artifactPrefix`                             | Engine-enforced   | Computed from the filename, and orders the activities.                                                                                                         |
| Composed artifact contract                   | Engine-enforced   | Synthesized from the bound techniques' outputs.                                                                                                                |
| `techniques[]`                               | Engine-enforced   | The bundle.                                                                                                                                                    |
| `bundleTechniques`                           | Engine-enforced   | Hybrid step-technique bundling in `get_activity`.                                                                                                              |
| `variables.reads[]`                          | Advisory          | The names the activity needs the workflow to supply. `check:activity-variables` holds the graph to them.                                                       |
| `name`, `description`, `required`, `rules[]` | Advisory          | Rendered.                                                                                                                                                      |
| `exits[]`                                    | Advisory          | Every exit is bound in the workflow's `graph`, or the load fails. The destination reached warns only. `next_activity` moves anywhere.                          |
| `triggers[]`, `passContext`                  | Agent-interpreted | `dispatch_child` takes an explicit `workflow_id`. A child session's bag starts from the child workflow's own declared defaults.                                |
| `outcome[]`                                  | Agent-interpreted | Never reconciled against manifests.                                                                                                                            |




### Step

These fields are on every step kind.


| Field           | Class             | What the server does                                                                                                                                                                                                        |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | Engine-enforced   | Selects the closed contract for that kind.                                                                                                                                                                                  |
| `id`            | Engine-enforced   | A duplicate id is a load error. The id is the key for manifests and for a step-bound `get_technique`.                                                                                                                       |
| `step_manifest` | Advisory          | Absence of a gated step is accepted. An ungated omission warns.                                                                                                                                                             |
| `when`          | Agent-interpreted | A gate on every step kind. The server never evaluates it.                                                                                                                                                                   |
| `condition`     | Agent-interpreted | A gate on the technique, action, and checkpoint kinds. A loop states its continuation test in `continueWhile`. On a checkpoint step, only `condition` enables `condition_not_met` dismissal. The server never evaluates it. |
| `required`      | Agent-interpreted | A hint to the worker.                                                                                                                                                                                                       |
| `actions[]`     | Agent-interpreted | No verb has a server interpreter. `set` does not write the variable bag. Removal is scheduled for the next schema major (#166).                                                                                             |




### Checkpoint step


| Field                            | Class           | What the server does                                                                                                                                                         |
| -------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options[]`                      | Engine-enforced | `option_id` is hard-validated.                                                                                                                                               |
| `effect.setVariable`             | Engine-enforced | Applied to the session variable bag. This is the one engine-applied effect.                                                                                                  |
| `defaultOption`, `autoAdvanceMs` | Engine-enforced | The server enforces the full timer before `auto_advance`.                                                                                                                    |
| `effect.exit`                    | Advisory        | Checked at load against the activity's `exits`. The destination is read from the workflow graph, recorded, and returned. The orchestrator enacts it through `next_activity`. |




### Loop step


| Field              | Class             | What the server does                                                                        |
| ------------------ | ----------------- | ------------------------------------------------------------------------------------------- |
| `steps[]`          | Engine-enforced   | Ids are unique in the body. The body is flattened for lookups and for artifact composition. |
| `step_manifest`    | Advisory          | A loop-body step id is accepted, and never required.                                        |
| `loopType`         | Agent-interpreted | The agent executes the iteration and bounds it.                                             |
| `continueWhile`    | Agent-interpreted | The test the agent uses to decide whether the body runs again.                              |
| `variable`, `over` | Agent-interpreted | The agent executes the iteration and bounds it.                                             |
| `breakCondition`   | Agent-interpreted | The agent executes the iteration and bounds it.                                             |
| `maxIterations`    | Agent-interpreted | The agent executes the iteration and bounds it.                                             |




### Technique


| Field                                   | Class             | What the server does                                                                                                      |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `id`                                    | Engine-enforced   | Resolves the technique.                                                                                                   |
| Rule address                            | Engine-enforced   | `tech::rule` and a group prefix both address a rule.                                                                      |
| `inputs[].id`, `outputs[].id`           | Engine-enforced   | The merge keys for composition.                                                                                           |
| `outputs[].artifact.name`               | Engine-enforced   | Drives the composed artifact contract.                                                                                    |
| `version`, `capability`                 | Advisory          | Rendered.                                                                                                                 |
| `inputs[].required`, `inputs[].default` | Advisory          | Rendered. The server does not check that a required input was supplied, and does not apply a default.                     |
| Protocol                                | Advisory          | Rendered.                                                                                                                 |
| Input bindings, output remaps           | Agent-interpreted | Name matching is the agent's convention. A step-bound `get_technique` annotates that resolution, and does not perform it. |




### Condition


| Field          | Class             | What the server does                                                                    |
| -------------- | ----------------- | --------------------------------------------------------------------------------------- |
| Condition text | Advisory          | Rendered for a warn-only `transition_condition` match, by exact string equality.        |
| Evaluation     | Agent-interpreted | The agent evaluates `simple`, `and`, `or`, `not`, and `exists`, including a null value. |


What writes the session bag is [state](../docs/state.md).

## Fields

The field lists live in the schema files linked above. All six are generated from the Zod sources ([generate-schemas.ts](../scripts/generate-schemas.ts#L37)).

A step's shape is the `kind` branch in [activity.schema.json](activity.schema.json#L185): [technique](activity.schema.json#L185), [action](activity.schema.json#L393), [checkpoint](activity.schema.json#L428), [loop](activity.schema.json#L510), [routine](activity.schema.json#L578). The same branches are inlined in [workflow.schema.json](workflow.schema.json#L343) and [routine.schema.json](routine.schema.json#L220).