# Schema System

The JSON Schema definitions live in [schemas/](../schemas/). They define the structure for workflow definitions, conditional logic, and the on-disk session record.

The server exposes every one of these schemas except the routine schema as [MCP resources](api.md#mcp-resources).

## Overview

The workflow server uses six schemas:


| Schema                                                  | Purpose                    |
| ------------------------------------------------------- | -------------------------- |
| [workflow.schema.json](../schemas/workflow.schema.json#L7)         | Defines workflow structure |
| [activity.schema.json](../schemas/activity.schema.json#L7)         | Defines an activity        |
| [routine.schema.json](../schemas/routine.schema.json#L7)           | Defines a routine          |
| [technique.schema.json](../schemas/technique.schema.json#L7)       | Defines a technique        |
| [condition.schema.json](../schemas/condition.schema.json#L7)       | Defines a condition        |
| [session-file.schema.json](../schemas/session-file.schema.json#L7) | The on-disk session file   |


## Enforcement Model

The server enforces structure at load time plus a runtime core; the executing agents carry out the fields no server path reads. `get_activity` delivers the activity YAML as authored, with each step's resolved id filled in and each routine reference replaced by the routine's steps, so every authored field reaches the agent. Each field has an owner and a strictness.

- **Owner** — `Engine` when server behavior or a check depends on the field. `Agent` when the field is delivered and no server path reads it.
- **Strictness** — `enforced` when a check on the field blocks, at load or at run time. `advisory` when every check on it only renders or warns.

## Generation

A definition the server validates is a Zod schema in [src/schema/](../src/schema/). The generator lists the six and renders each one to JSON Schema. `npm run build:schemas` writes that rendering to the file of the same name in [schemas/](../schemas/), and writes the owner and strictness of each annotated field to [enforcement.json](../schemas/enforcement.json). [check:schemas](../guards/check-generated-schemas.ts#L38) fails when a file on disk differs from that rendering.
