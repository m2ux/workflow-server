# Orchestra DSL — Remaining Primitives

Work package: Define Orchestra grammar and constraints for workflow, skill, condition, and state primitives.

- **Issue:** https://github.com/m2ux/workflow-server/issues/45
- **Branch:** `feat/orchestra-dsl-remaining-primitives`
- **Date:** 2026-02-14

## Scope

| Primitive | Schema | Description |
|-----------|--------|-------------|
| Workflow | `workflow.schema.json` | Top-level container: metadata, variables, modes, activity sequencing, artifact locations |
| Skill | `skill.schema.json` | Agent capability: inputs, outputs, rules, protocol, tools, execution patterns |
| Condition | `condition.schema.json` | Boolean logic for transitions/decisions: simple comparisons, and/or/not composition |
| State | `state.schema.json` | Runtime execution state: position tracking, checkpoint responses, variable values, history, loops, workflow nesting |

## Status

Planning initialized. Implementation not started.
