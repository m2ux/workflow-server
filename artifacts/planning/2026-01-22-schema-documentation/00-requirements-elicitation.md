# Requirements Elicitation: Schema Documentation

**Work Package:** Schema Documentation  
**Date:** 2026-01-22  
**Issue:** [#9](https://github.com/m2ux/workflow-server/issues/9)  
**PR:** [#10](https://github.com/m2ux/workflow-server/pull/10)

## Problem Statement

Users (both human contributors and AI agents) need to understand how to use the workflow schemas to create and validate new workflows. Currently, the schema files lack explanatory documentation, making it difficult to understand how schema structures translate to runtime workflow behavior.

The `schemas/` folder contains three JSON Schema files:
- `workflow.schema.json` - Defines workflow structure (phases, steps, checkpoints, transitions)
- `condition.schema.json` - Defines condition expressions for transitions and decisions
- `state.schema.json` - Defines runtime workflow state tracking

Without documentation, users must reverse-engineer these schemas to understand their purpose and relationships.

## Stakeholders

| Stakeholder | Role | Needs |
|-------------|------|-------|
| Human Contributors | Primary | Narrative explanation, visual diagrams, practical examples |
| AI Agents | Secondary (future) | Structured, parseable format (TOON) - deferred |

## Scope

### In Scope

- Unified `schemas/README.md` covering all three schema files
- Explanation of how schema structure translates to workflow actions
- Diagram showing schema relationships and workflow execution flow
- Complete, annotated examples for creating valid workflows
- Validation guidance and common patterns

### Out of Scope

- Agent-optimized TOON format alternatives (deferred to future work)
- Separate documentation files per schema
- Changes to the schema files themselves
- API documentation

### Deferred

- TOON format alternatives for agent consumption

## User Stories

1. **As a new contributor**, I want clear documentation of the schema system so that I can create valid workflows without asking questions.

2. **As a workflow author**, I want annotated examples so that I can understand the correct structure for phases, steps, and checkpoints.

3. **As a developer**, I want to understand condition expressions so that I can implement proper phase transitions.

## Success Criteria

- [ ] A new contributor can create a valid workflow without asking questions
- [ ] All documentation examples validate against their respective schemas
- [ ] Schema-to-behavior relationship is clearly documented with diagrams
- [ ] Common patterns and best practices are included

## Elicitation Notes

- Documentation should be human-readable (agent-optimized formats deferred)
- A diagram showing how schemas relate to workflow execution is important
- Unified document preferred over separate files per schema
