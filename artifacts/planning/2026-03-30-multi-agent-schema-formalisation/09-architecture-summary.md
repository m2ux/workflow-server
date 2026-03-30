# Architecture Summary — Multi-Agent Schema Formalisation

**Activity:** post-impl-review (v1.7.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)

---

## 1. New Types Introduced

```
AgentRole { id: string, description: string }
    ↑ used by
ExecutionModel { roles: AgentRole[] }
    ↑ required field on
Workflow { ..., executionModel: ExecutionModel, ... }
```

Both `AgentRole` and `ExecutionModel` are **strict** (`.strict()` / `additionalProperties: false`) — no unknown properties allowed. This is a deliberate design choice (user decision Q8) that provides strong validation guarantees at the cost of requiring schema version bumps for extensions.

## 2. Data Flow

The `executionModel` field flows through the existing pipeline unchanged:

```
workflow.toon (authored by workflow designers)
    │
    ▼ readFile() + decodeToonRaw()
    │
    ▼ safeValidateWorkflow() ← Zod validates ExecutionModel + unique role IDs
    │
    ├──▶ get_workflow (summary: true)
    │      └─ summaryData.executionModel ← explicit projection (workflow-tools.ts L94)
    │
    └──▶ get_workflow (summary: false) / next_activity
           └─ JSON.stringify(result.value) ← automatic inclusion
    │
    ▼ Agent receives executionModel in workflow response
```

**No new data flow paths.** No new loaders, tools, or middleware. The field passes through the existing `decodeToon → validate → serialize → serve` pipeline.

## 3. Schema System Impact

### Before

```
WorkflowSchema
├── $schema (optional)
├── id (required)
├── version (required)
├── title (required)
├── description, author, tags (optional)
├── rules (optional)
├── variables → VariableDefinitionSchema[]
├── modes → ModeSchema[]
├── artifactLocations → Record<ArtifactLocation>
├── initialActivity (optional)
└── activities → ActivitySchema[] (required, min 1)
```

### After

```
WorkflowSchema
├── $schema (optional)
├── id (required)
├── version (required)
├── title (required)
├── description, author, tags (optional)
├── rules (optional)
├── variables → VariableDefinitionSchema[]
├── modes → ModeSchema[]
├── artifactLocations → Record<ArtifactLocation>
├── executionModel → ExecutionModelSchema (required)     ← NEW
│   └── roles → AgentRoleSchema[] (min 1)                ← NEW
│       ├── id (required)                                ← NEW
│       └── description (required)                       ← NEW
├── initialActivity (optional)
└── activities → ActivitySchema[] (required, min 1)
+ .refine(): unique role IDs across executionModel.roles  ← NEW
```

### Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| WorkflowSchema fields | 13 | 14 | +1 |
| Required fields | 4 | 5 | +1 |
| Exported types (workflow module) | 4 | 6 | +2 |
| JSON Schema definitions | 3 | 5 | +2 |
| Total tests | 248 | 262 | +14 |

## 4. Cross-Cutting Concerns

| Concern | Impact |
|---------|--------|
| **Schema preamble** | Automatically includes updated workflow.schema.json at server startup — agents see the new definitions |
| **Validation pipeline** | `.refine()` adds a post-parse validation step; all validation warnings/errors flow through existing `_meta.validation` pattern |
| **Session token** | Unchanged — no agent identity in tokens (out of scope, A-01) |
| **Trace events** | Unchanged — no agent tracking in traces (out of scope, A-01) |
| **State persistence** | Unchanged — no execution model in saved state (out of scope, A-01) |

## 5. Extension Points (Future Work)

The architecture supports these documented extension paths without structural changes:

| Extension | Mechanism | Scope |
|-----------|-----------|-------|
| Activity-level role overrides | Add `executionModelOverride` to ActivitySchema | A-02 |
| Role constraints | Add optional `constraints: string[]` to AgentRoleSchema | Q1/Q3 |
| Role cardinality | Add optional `count` to AgentRoleSchema | Q2 |
| Worker persistence | Add optional `persistence` to AgentRoleSchema | A-04 |
| Mode-execution model interaction | Add `executionModelOverride` to ModeOverrideSchema | Q5 |
| Runtime enforcement | Server-side validation using executionModel data | A-06/#65 |
| State/session tracking | Add agent identity to SessionPayload/WorkflowState | A-01 |

All extensions are additive and require schema version bumps due to `.strict()`.
