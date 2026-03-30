# ADR-0002: Add executionModel to Workflow Schema

**Status:** Accepted  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)  
**PR:** [#85](https://github.com/m2ux/workflow-server/pull/85)

## Context

The workflow-server orchestrates AI agent workflows through structured schemas (Zod + JSON Schema). Multi-agent execution patterns — where an orchestrator delegates to workers, scanners, verifiers, or other specialised agents — are used by 8 of 10 workflows. However, the schema vocabulary has no constructs for declaring agent roles or execution models. These requirements exist only as prose in `rules[]` string arrays, invisible to the server and inconsistently interpreted by agents.

Three distinct execution patterns exist across the codebase:
1. **Persistent worker** (work-package): single worker resumed across activities
2. **Disposable workers** (prism family): fresh sub-agent per analytical pass
3. **Named multi-agent** (security audits): 4-13 named agents with specific designators

## Decision

Add a **required** `executionModel` field to `WorkflowSchema` containing a `roles` array. Each role has `id` (string) and `description` (string). The field uses strict validation (`additionalProperties: false` / `.strict()`) and a `.refine()` for unique role ID enforcement.

### Key Design Choices

| Choice | Decision | Alternatives Considered |
|--------|----------|------------------------|
| Scope | Definition schemas only (not state/session/trace) | End-to-end with runtime tracking |
| Placement | Workflow-level only | Workflow + activity-level overrides |
| Role vocabulary | Per-workflow declared set | Global enum, freeform strings, enum with escape hatch |
| Role metadata | id + description only | + constraints, + output format, + communication pattern |
| Worker persistence | Omit (prose concern) | Include as schema property |
| Required vs optional | Required (all workflows must declare) | Optional with implicit default |
| Behavioural fields | None (prose rules) | Auto-transitions, orchestrator discipline, depth limits |
| Dynamic cardinality | Not in schema | Cardinality field, role templates |
| Mode interaction | Independent (no overrides) | Mode can override execution model |
| Extensibility | Strict (additionalProperties: false) | Metadata escape hatch, .passthrough() |

### Rationale

The design prioritises **minimal, opinionated, correct** over comprehensive. The execution model declares "who participates" while prose rules describe "how they behave." This separation keeps the schema addition small (27 source lines) while providing machine-readable discoverability that didn't exist before. Strict validation ensures controlled evolution via schema version bumps.

## Consequences

### Positive
- Agents can programmatically discover whether a workflow requires multi-agent execution
- The server can serve structured execution model data via `get_workflow`
- Per-workflow role vocabulary provides validation without cross-workflow coupling
- Foundation for runtime enforcement (#65) — enforcement can now reference schema constructs

### Negative
- Breaking change: all workflows must include `executionModel` (mitigated by synchronous migration of all 10 files)
- Strict schema slows future evolution (intentional — controlled via version bumps)
- No machine-readable link between role declarations and behavioural rules (semantic gap by design)

### Neutral
- 7 documented extension paths for future work (activity overrides, constraints, cardinality, persistence, mode interaction, enforcement, state tracking)
- Industry comparison validated the design as a sound minimal starting point, though richer than typical for a new construct

## Related
- [#65](https://github.com/m2ux/workflow-server/issues/65) — Enforcement of execution model rules (uses these constructs as foundation)
- [Engineering artifacts](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-03-30-multi-agent-schema-formalisation/README.md)
