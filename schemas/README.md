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

The server enforces structure at load time plus a small runtime core; most schema semantics are carried out by the executing agents. `get_activity` delivers the raw activity YAML verbatim, so every authored field reaches the agent. Each field has an owner and a strictness.

- **Owner** — `Engine` when server behavior or a check depends on the field. `Agent` when the field is delivered and no server path reads it.
- **Strictness** — `enforced` when a failed check blocks. `advisory` when the field is rendered or checked warn-only, and compliance does not block.

## Generation

A definition the server validates is a Zod schema in [src/schema/](../src/schema/). The generator lists the six and renders each one to JSON Schema. `npm run build:schemas` writes that rendering to the file of the same name in this folder, and writes the owner and strictness of each annotated field to [enforcement.json](enforcement.json). [check:schemas](../guards/check-generated-schemas.ts#L38) fails when a file on disk differs from that rendering.
