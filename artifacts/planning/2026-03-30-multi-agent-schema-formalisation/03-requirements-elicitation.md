# Requirements Elicitation — Multi-Agent Schema Formalisation

**Activity:** requirements-elicitation (v2.7.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)  
**Stakeholder input:** Skipped (user elected to proceed without external stakeholder discussion)

---

## 1. Elicitation Questions and Responses

### Q1: Execution Model Contents

**Question:** Beyond role declarations (workforce), what other metadata should the execution model carry — orchestrator discipline constraints, automatic transition policy, checkpoint routing, sub-agent depth limits?  
**Decision:** **Roster-only.** The execution model contains only the workforce (role declarations). All behavioral rules remain as prose in the `rules` array.  
**Rationale:** Keeps the schema addition minimal and focused. Behavioral rules are diverse across workflows and better expressed as prose. The execution model provides the machine-readable "who" while prose rules provide the "how."

### Q2: Dynamic Workforces

**Question:** How should the schema handle workflows with variable agent counts (e.g., substrate-audit with A1-A7 scanners, cicd-audit with S1-Sn)?  
**Decision:** **Static-only.** Each role listed individually. Dynamic counts are an orchestration concern, not a schema concern.  
**Rationale:** The schema declares role types (e.g., "scanner"), not role instances. The orchestrator decides how many scanner agents to spawn at runtime. This keeps the schema declarative without introducing parameterization complexity.

### Q3: Role Metadata

**Question:** What metadata should each role definition carry — id + description? Constraints? Output format? Communication pattern?  
**Decision:** **Minimal.** `id` (string) and `description` (string) only.  
**Rationale:** Role metadata beyond id/description is behavioral — it describes what the role does, not what it is. Behavioral constraints remain in prose rules. This makes the schema addition small and easy to adopt.

### Q4: Migration Strategy

**Question:** Use Zod `.default()` for incremental migration, or update all 10 TOON files synchronously?  
**Decision:** **Synchronous migration.** All 10 workflows updated in this PR. No `.default()` fallback.  
**Rationale:** Explicit is better than implicit. Every workflow should consciously declare its execution model. A `.default()` fallback could mask incomplete migrations. With only 10 files, synchronous migration is tractable.

### Q5: Mode Interaction

**Question:** Should modes be able to modify the execution model?  
**Decision:** **No interaction.** Modes and execution model are independent constructs.  
**Rationale:** Modes modify activity flow (skip activities, override steps). The execution model defines the agent structure. These are orthogonal concerns. Coupling them adds complexity without clear benefit.

### Q6: Field Name

**Question:** What should the field be called — `executionModel`, `agents`, `workforce`, `execution`?  
**Decision:** **`executionModel`.**  
**Rationale:** Most descriptive. Consistent with camelCase convention used across the schema (`initialActivity`, `artifactLocations`, `modeOverrides`). Unambiguous — "agents" could be confused with runtime agent instances.

### Q7: Validation Scope

**Question:** What constitutes a "role reference" that needs validation? Cross-schema references? Internal-only?  
**Decision:** **Self-contained.** Unique role IDs within the execution model only. No cross-schema references.  
**Rationale:** With roster-only contents (Q1) and minimal metadata (Q3), there are no structured constructs that reference roles. Validation ensures the role declarations themselves are consistent (unique IDs). Future iterations can add cross-referencing if structured behavioral fields are introduced.

### Q8: Extensibility

**Question:** Should the execution model have an extensibility escape hatch (metadata field, passthrough)?  
**Decision:** **Strict.** `additionalProperties: false`. No escape hatch.  
**Rationale:** Consistent with workflow schema policy. New properties require schema version bumps. This preserves validation guarantees and prevents schema drift.

---

## 2. Complete Design Summary

All decisions from design-philosophy (assumptions A-01 through A-06) and elicitation (Q1 through Q8) produce this unified schema design:

### ExecutionModel Schema

```
executionModel: {                        // REQUIRED on all workflows
  roles: [                               // REQUIRED, minItems: 1
    {
      id: string,                        // REQUIRED, unique within roles[]
      description: string                // REQUIRED
    }
  ]
}
```

### Properties

| Property | Value | Source |
|----------|-------|--------|
| Field name | `executionModel` | Q6 |
| Placement | Workflow-level only | A-02 |
| Required | Yes (no default, no fallback) | A-05, Q4 |
| Role representation | Per-workflow declared vocabulary | A-03 |
| Role metadata | id + description | Q3 |
| Behavioral fields | None (prose rules) | Q1 |
| Dynamic cardinality | Not in schema | Q2 |
| Mode interaction | None | Q5 |
| Validation | Unique role IDs | Q7 |
| Extensibility | additionalProperties: false | Q8 |
| Worker persistence | Not in schema | A-04 |
| Enforcement | Descriptive only | A-06 |
| Scope | Definition schemas only | A-01 |

---

## 3. Functional Requirements

### FR-01: ExecutionModel Schema Type
The `WorkflowSchema` (Zod) MUST include a required `executionModel` field containing a `roles` array.

### FR-02: AgentRole Schema Type
Each role MUST have `id` (string, required) and `description` (string, required). No additional properties allowed.

### FR-03: Unique Role ID Validation
The `executionModel` MUST validate that all role IDs within the `roles` array are unique. Duplicate IDs MUST cause a validation error.

### FR-04: Non-Empty Roles Array
The `roles` array MUST have at least 1 entry (`minItems: 1`). An empty workforce is invalid.

### FR-05: JSON Schema Synchronization
The `schemas/workflow.schema.json` file MUST mirror the Zod schema additions. The `executionModel` property MUST be added to `properties` and to `required`. New definitions for `executionModel` and `agentRole` MUST be added.

### FR-06: TOON File Migration
All 10 workflow TOON files in the `workflows/` worktree MUST include a valid `executionModel` block. The migration is part of this PR — no workflows may be left without the field.

### FR-07: Workflow Summary Inclusion
The `get_workflow` tool's summary mode (used by default) MUST include `executionModel` in the summary data returned to agents. This enables agents to discover the execution model without loading the full workflow.

---

## 4. Non-Functional Requirements

### NFR-01: Backward Compatibility (TOON Format)
The TOON format representation of `executionModel` MUST follow existing TOON conventions for nested objects and arrays. No custom syntax.

### NFR-02: No Loader Changes
Adding the `executionModel` field MUST NOT require changes to `workflow-loader.ts`, `activity-loader.ts`, or any other loader module. The field passes through the existing `decodeToonRaw → safeValidateWorkflow` pipeline.

### NFR-03: Minimal Tool Changes
The `get_workflow` tool's summary mode (`workflow-tools.ts` L87-96) manually projects a subset of fields. The `executionModel` field MUST be added to this summary projection (one-line change). No other tool handler changes are required — the `JSON.stringify(result.value)` pattern in full mode and `next_activity` automatically includes new fields.

### NFR-04: No Session/State Changes
The `SessionPayload`, `WorkflowState`, and `TraceEvent` types MUST NOT be modified. Runtime agent tracking is a separate work package (per A-01).

### NFR-05: Schema Preamble Automatic Inclusion
The updated `workflow.schema.json` MUST be automatically included in the schema preamble built at server startup (via `buildSchemaPreamble`). No changes to `schema-preamble.ts` needed.

### NFR-06: Test Coverage
New schema types MUST have unit tests for valid inputs, invalid inputs, and edge cases (duplicate IDs, empty roles, missing fields). Existing test helpers (`makeWorkflow`) MUST be updated to include `executionModel`.

### NFR-07: Strict Schema Policy
The `executionModel` and `agentRole` definitions MUST use `additionalProperties: false` in JSON Schema and must NOT use `.passthrough()` in Zod. Consistent with workflow schema strictness policy.

---

## 5. Migration Plan

### Workflow Execution Model Assignments

| Workflow | Execution Model Type | Roles |
|----------|---------------------|-------|
| work-package | orchestrator-worker | orchestrator, worker |
| prism | orchestrator-workers | orchestrator, worker |
| prism-audit | orchestrator-workers | orchestrator, worker |
| prism-evaluate | orchestrator-workers | orchestrator, worker |
| prism-update | orchestrator-workers | orchestrator, worker |
| substrate-node-security-audit | orchestrator-multi-agent | orchestrator, reconnaissance, scope-mapper, auditor, dependency-reviewer, verifier, merger |
| cicd-pipeline-security-audit | orchestrator-multi-agent | orchestrator, scanner, verifier, merger |
| meta | single-agent | agent |
| workflow-design | single-agent | agent |
| work-packages | single-agent | agent |

**Note:** Role IDs are illustrative and will be refined during the design activity based on each workflow's prose rules. The execution model `type` field shown here is NOT part of the schema — it's a categorization for the migration plan. The schema only has `roles[]`.

---

## 6. Out of Scope

The following were explicitly excluded by user decisions:

| Item | Excluded By | Future Work? |
|------|-------------|-------------|
| Activity-level execution model overrides | A-02 | Yes — can add `executionModelOverride` to ActivitySchema later |
| Worker persistence field | A-04 | Yes — can add as optional role metadata later |
| Runtime enforcement | A-06 | Yes — covered by #65 |
| State/session agent tracking | A-01 | Yes — separate work package |
| Mode-execution model interaction | Q5 | Yes — can add `executionModelOverride` to ModeSchema later |
| Dynamic role cardinality | Q2 | Yes — can add optional `cardinality` field later |
| Structured behavioral constraints | Q1/Q3 | Yes — can add optional `constraints` field later |
| Extensibility escape hatch | Q8 | Intentionally excluded — schema version bumps for new fields |
