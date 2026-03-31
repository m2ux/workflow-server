# Workflow Server Schemas — Comprehension Artifact

> **Last updated**: 2026-03-30  
> **Work packages**: [Multi-Agent Schema Formalisation (#84)](../planning/2026-03-30-multi-agent-schema-formalisation/README.md), [Mandatory Phase Bypass (#86)](../planning/2026-03-30-mandatory-phase-bypass/README.md)  
> **Coverage**: Schema definition system (Zod + JSON Schema), field propagation lifecycle, validation boundaries, extension surface analysis, workflow-level skills, get_skills API, and skill-loader dead code  
> **Related artifacts**: [workflow-server.md](workflow-server.md), [zod-schemas.md](zod-schemas.md), [json-schemas.md](json-schemas.md)

## 1. Schema System Architecture

### 1.1 Dual-Schema Design

The server maintains two parallel schema systems:

| System | Location | Purpose | Validates When |
|--------|----------|---------|----------------|
| **Zod** | `src/schema/*.ts` | Runtime validation in Node.js | Workflow loaded by server (`safeValidateWorkflow`) |
| **JSON Schema** | `schemas/*.json` | IDE tooling, documentation, TOON file authoring | TOON file opened in IDE (if `$schema` declared) |

The two systems must stay synchronized but serve different audiences:
- **Zod** validates the **assembled runtime object** (workflow with inline activities array)
- **JSON Schema** validates **individual TOON files** (workflow.toon without activities; activity.toon separately)

This explains why `workflow.schema.json` has no `activities` property — activities are separate files loaded by `loadActivitiesFromDir()` and injected into the workflow object at runtime.

### 1.2 Schema File Inventory

```
src/schema/                          schemas/
├── common.ts (SemanticVersionSchema)
├── condition.schema.ts    ←→    condition.schema.json
├── activity.schema.ts     ←→    activity.schema.json
├── workflow.schema.ts     ←→    workflow.schema.json
├── skill.schema.ts        ←→    skill.schema.json
├── resource.schema.ts     (no JSON Schema counterpart)
├── state.schema.ts        ←→    state.schema.json
└── rules.schema.ts        (no JSON Schema counterpart)
```

### 1.3 Import Chain

```
common.ts (SemanticVersionSchema)
    ↓
condition.schema.ts  →  activity.schema.ts  →  workflow.schema.ts
                                                    ↑ imports ActivitySchema

skill.schema.ts     (standalone — imports common.ts only)
state.schema.ts     (standalone)
resource.schema.ts  (standalone, minimal)
rules.schema.ts     (standalone, minimal)
```

---

## 2. Field Propagation Lifecycle

### 2.1 How a Schema Field Reaches an Agent

Tracing a field from definition to consumption:

```
1. DEFINE       workflow.schema.ts      → z.object({ myField: z.string() })
2. MIRROR       workflow.schema.json    → { "myField": { "type": "string" } }
3. AUTHOR       workflow.toon           → myField: "some value"
4. LOAD         workflow-loader.ts      → decodeToonRaw(content)  // TOON → JS object
5. VALIDATE     workflow-loader.ts      → safeValidateWorkflow(raw)  // Zod parse
6. SERVE        workflow-tools.ts       → JSON.stringify(result.value)
7. CONSUME      Agent reads response    → field available in workflow data
```

### 2.2 Critical Path: Adding a REQUIRED Field

When a Zod field is **required** (no `.optional()`, no `.default()`):

1. `safeValidateWorkflow(raw)` returns `{ success: false }` for any TOON file missing the field
2. `loadWorkflow()` returns `err(new WorkflowValidationError(workflowId, issues))`
3. `get_workflow` tool throws the error → MCP SDK returns error to agent
4. The workflow becomes **invisible** — `listWorkflows()` still shows its manifest (read from TOON header), but `loadWorkflow()` fails

**Migration requirement**: All existing workflow TOON files must include the new field BEFORE the schema change is deployed. For 10 workflows in the worktree, this is a coordinated migration.

### 2.3 Optional Fields: Safe Addition

When a Zod field uses `.optional()`:

1. Existing TOON files without the field pass validation (field is `undefined`)
2. `JSON.stringify()` omits `undefined` values — agents don't see the field
3. No migration needed — adoption is organic

### 2.4 Required Field with Default: Hybrid

When a Zod field uses `.default(value)`:

1. Existing TOON files without the field pass validation — Zod injects the default
2. The assembled object includes the default value
3. Agents see the field with its default value
4. **This enables "required" semantics without breaking existing TOON files** — the schema can require the field while defaulting absent values to a sensible baseline

---

## 3. additionalProperties Policy

### 3.1 Per-Schema Summary

| Schema | Zod Behavior | JSON Schema | Effect |
|--------|-------------|-------------|--------|
| **Workflow** | Default (strips unknown) | `false` | **Strict** — unknown properties rejected by JSON Schema, stripped by Zod |
| **Activity** | Default (strips unknown) | Root: `true`, sub-defs: `false` | **Permissive root** — activity can have unknown top-level keys |
| **Skill** | `.strict()` | Root and most sub-defs: `true` | **Strict Zod, permissive JSON** — inconsistency |
| **Condition** | Default (strips unknown) | `false` on all branches | **Strict** |
| **State** | Default (strips unknown) | `false` | **Strict** |

### 3.2 Impact on Schema Extension

For **workflow.schema.json** (`additionalProperties: false`):
- New properties MUST be added to the `properties` object
- If required: also added to the `required` array
- Without the JSON Schema update, IDEs with `$schema` validation will flag unknown properties
- Only `work-package/workflow.toon` declares `$schema` — other workflows skip IDE validation

For **Zod WorkflowSchema** (default behavior — strips unknowns):
- New fields are silently dropped if not declared in the schema
- This is SAFE — adding the Zod field first, then updating TOON files later, causes no errors
- The Zod schema is authoritative for runtime behavior

---

## 4. The Mode Pattern — Template for Execution Model

### 4.1 Mode: Workflow-Level Declaration

```typescript
// workflow.schema.ts L29-39
export const ModeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  activationVariable: z.string(),
  recognition: z.array(z.string()).optional(),
  skipActivities: z.array(z.string()).optional(),
  defaults: z.record(z.unknown()).optional(),
  resource: z.string().optional(),
});
```

Declared on WorkflowSchema as: `modes: z.array(ModeSchema).optional()`

### 4.2 Mode: Activity-Level Override

```typescript
// activity.schema.ts L123-133
export const ModeOverrideSchema = z.object({
  description: z.string().optional(),
  rules: z.array(z.string()).optional(),
  steps: z.array(StepSchema).optional(),
  skipSteps: z.array(z.string()).optional(),
  skipCheckpoints: z.array(z.string()).optional(),
  checkpoints: z.array(CheckpointSchema).optional(),
  transitionOverride: z.string().optional(),
  context_to_preserve: z.array(z.string()).optional(),
});
```

Referenced on ActivitySchema as: `modeOverrides: z.record(ModeOverrideSchema).optional()`

### 4.3 Differences from Execution Model

The user chose **workflow-level only** (no activity-level overrides). This simplifies the pattern:

| Aspect | Mode Pattern | Execution Model Pattern |
|--------|-------------|------------------------|
| Workflow level | `modes: z.array(ModeSchema).optional()` | `executionModel: ExecutionModelSchema` (required) |
| Activity level | `modeOverrides: z.record(ModeOverrideSchema)` | **None** (user decision A-02) |
| Required? | Optional | **Required** (user decision A-05) |
| Cross-ref validation | None (mode IDs not validated) | **Yes** — role references validated against declared roles (user decision A-03) |

### 4.4 Novel Pattern: Per-Workflow Role Vocabulary

The user wants each workflow to define its own set of valid roles ("workforce"). This is a pattern that does NOT exist in the current schema system. No existing construct provides:
- A declaration section that defines a vocabulary
- Validation that references elsewhere in the schema match the declared vocabulary

The closest analogy is `modes[]` defining mode IDs, then `modeOverrides` keying by mode ID — but there is NO validation that modeOverride keys match declared mode IDs. The execution model should do better.

**Implementation approach**: Zod `.refine()` or `.superRefine()` on the workflow schema can cross-validate internal consistency. State schema already uses this pattern:

```typescript
// state.schema.ts L115-118
WorkflowStateBaseSchema.refine(
  (state) => !ActiveStatuses.includes(state.status) || state.currentActivity != null,
  { message: 'currentActivity is required when...', path: ['currentActivity'] },
);
```

For execution model: a refinement can verify that any role references within the execution model's `rules` or `constraints` array reference roles declared in the `roles` array.

Since A-02 chose workflow-level only (no activity-level overrides), cross-file validation (activities referencing roles) is NOT needed in this iteration. The refinement is purely intra-object.

---

## 5. Validation System

### 5.1 Validation Layers

```
Layer 1: JSON Schema (IDE)     → Validates TOON file syntax during authoring
Layer 2: Zod (runtime)         → Validates assembled object during loading
Layer 3: Session validation    → Validates tool call consistency (transition, skill association)
```

Layer 1 is optional (only if `$schema` declared). Layer 2 is mandatory. Layer 3 is informational (warnings in `_meta`, never rejection).

### 5.2 Error Reporting for Missing Required Fields

When Zod encounters a missing required field:

```
ZodError: [
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: ['executionModel'],
    message: 'Required'
  }
]
```

This flows through `safeValidateWorkflow()` → `WorkflowValidationError` → tool error response. The error message includes the path and a generic "Required" message. Workflow authors will see this as a server error when loading the workflow.

### 5.3 Schema Preamble

At startup, the server builds a **schema preamble** (`buildSchemaPreamble()` in `schema-preamble.ts`):
1. Reads `schemas/schema-header.md` for human-readable introduction
2. Reads all 5 JSON Schema files from `schemas/`
3. Concatenates into a single string
4. Stored on `ServerConfig.schemaPreamble`
5. Prepended to every `get_workflow` response

This means agents receive the full JSON Schema definitions alongside workflow data. Adding new constructs to JSON Schema files automatically makes them visible to agents through this preamble.

---

## 6. TOON Format Considerations

### 6.1 TOON Capabilities

TOON is the file format for workflow definitions. Key characteristics relevant to schema extension:

- Supports objects, arrays, strings, numbers, booleans
- Arrays use `fieldName[count]:` syntax followed by indented items
- Nested objects are naturally supported
- Strings with special characters use quotes
- The `@toon-format/toon` library handles encode/decode
- `decodeToonRaw()` returns `unknown` — no type information

### 6.2 Example: Mode in TOON

```toon
modes[1]:
  - id: review
    name: Review Mode
    description: "Review existing PRs..."
    activationVariable: is_review_mode
    recognition[3]:
      - start review work package
      - review pr
      - review existing implementation
    skipActivities[2]:
      - requirements-elicitation
      - implement
    defaults:
      needs_elicitation: false
    resource: resources/24-review-mode.md
```

An execution model construct would follow a similar structure in TOON:

```toon
executionModel:
  type: orchestrator-workers
  description: "Orchestrator coordinates, workers execute activities"
  roles[2]:
    - id: orchestrator
      description: "Coordinates workflow, manages transitions, presents checkpoints"
    - id: worker
      description: "Executes activity steps, produces artifacts"
  rules[3]:
    - "Orchestrator MUST NOT execute activity steps"
    - "Workers yield checkpoints to orchestrator"
    - "Only one level of sub-agent indirection"
```

---

## 7. Test Surface

### 7.1 Test Files Relevant to Schema Changes

| Test File | Tests | Needs Update? |
|-----------|-------|--------------|
| `schema-validation.test.ts` | Zod schema parsing (conditions, activities, workflows) | YES — add execution model validation tests |
| `validation.test.ts` | Validation utilities (transitions, manifests, consistency) | NO — unless adding execution model validation logic |
| `workflow-loader.test.ts` | Workflow loading integration | YES — test workflows must include execution model |
| `activity-loader.test.ts` | Activity loading | NO — execution model is workflow-level only |
| `schema-loader.test.ts` | JSON Schema file loading | NO — unless JSON Schema file names change |

### 7.2 Test Helper Pattern

Tests use factory functions for test data:

```typescript
function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: 'test-wf',
    version: '1.0.0',
    title: 'Test Workflow',
    activities: [/* minimal activities */],
    ...overrides,
  };
}
```

Since the execution model field is **required**, the `makeWorkflow` helper must be updated to include a default execution model. This affects all existing tests that use the helper.

---

## 8. Implementation Surface Analysis

### 8.1 Files That Must Change

| File | Change Type | Description |
|------|-------------|-------------|
| `src/schema/workflow.schema.ts` | **Schema addition** | Add `ExecutionModelSchema`, `AgentRoleSchema`; add `executionModel` field to `WorkflowSchema` |
| `schemas/workflow.schema.json` | **JSON Schema addition** | Mirror new constructs; add to `properties` and `required` |
| `tests/schema-validation.test.ts` | **Test addition** | Execution model validation tests |
| `tests/validation.test.ts` | **Test update** | `makeWorkflow` helper needs execution model |
| `tests/workflow-loader.test.ts` | **Test update** | Test workflows need execution model |
| All 10 workflow TOON files | **Migration** | Add execution model declarations |

### 8.2 Files That Should NOT Change

| File | Reason |
|------|--------|
| `src/loaders/workflow-loader.ts` | Loads and validates via Zod — new fields pass through automatically |
| `src/tools/workflow-tools.ts` | Serves workflow data via `JSON.stringify()` — new fields included automatically |
| `src/schema/activity.schema.ts` | No activity-level execution model (A-02 decision) |
| `src/schema/state.schema.ts` | State/session out of scope (A-01 decision) |
| `src/utils/session.ts` | Session out of scope (A-01 decision) |
| `schemas/activity.schema.json` | No activity-level changes |

### 8.3 Key Design Constraint

The execution model is **required with a sensible default** strategy:

- **Zod**: Use `.default()` to provide an inline/single-agent default for workflows that don't declare one
- **JSON Schema**: Add to `properties` (not `required`?) or add to `required` with a clear description
- **Migration**: Existing TOON files can rely on the Zod default for runtime, but should be explicitly updated for clarity

This resolves the tension between A-05 (required) and backward compatibility: Zod defaults make the field always present in the runtime object, while TOON files can be migrated incrementally.

**Alternative**: If the user truly wants hard failure for missing execution models, skip `.default()` and require synchronous migration of all 10 TOON files.

---

## Open Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | How do missing required fields manifest to workflow authors? | ✅ Resolved | Zod returns `ZodError` with path and "Required" message. Workflow becomes invisible to agents via `loadWorkflow()` failure. See §5.2. |
| 2 | Can Zod `.refine()` validate cross-field references within the execution model? | ✅ Resolved | Yes — `state.schema.ts` already uses `.refine()` for cross-field validation. Pattern is established. See §4.4. |
| 3 | How does `additionalProperties: false` in JSON Schema interact with schema updates? | ✅ Resolved | New properties must be declared in JSON Schema `properties`. Only `work-package` declares `$schema`; runtime validation is Zod-only. See §3.2. |
| 4 | Does JSON Schema validate individual TOON files or the assembled workflow? | ✅ Resolved | JSON Schema validates individual TOON files (no `activities` property). Zod validates the assembled runtime object. See §1.1. |
| 5 | Should the required field use `.default()` or hard-fail on missing values? | ⬜ Open | This is a design decision for the implementation phase. `.default()` enables incremental TOON migration; hard-fail requires synchronous migration. See §8.3. |
| 6 | How does `get_skills` resolve skill IDs and can it work without `activity_id`? | ✅ Resolved | `get_skills` extracts IDs from `activity.skills`, calls `readSkill()` for each. Making `activity_id` optional requires branching to load `workflow.skills` instead. See §9.1. |
| 7 | What functions in skill-loader.ts are dead code? | ✅ Resolved | `listUniversalSkills`, `listWorkflowSkills`, `listSkills`, `readSkillIndex`, `SkillIndex`, `SkillEntry` — none imported outside skill-loader.ts. See §9.3. |
| 8 | What is the `findWorkflowsWithSkills` function's status? | ✅ Resolved | Used by `readSkill()` for cross-workflow fallback — NOT dead code. Must be preserved. See §9.3. |

---

## Deep-Dive 2: Workflow-Level Skills and get_skills API (#86)

### 9.1 get_skills Tool Handler Anatomy

The `get_skills` handler (`src/tools/resource-tools.ts:84-139`) follows this flow:

```
1. Decode session token
2. Load workflow via loadWorkflow()
3. Get activity via getActivity(workflow, activity_id)
4. Extract skillIds = [activity.skills.primary, ...activity.skills.supporting]
5. For each skillId: readSkill(sid, workflowDir, workflow_id)
6. For each loaded skill: loadSkillResources(workflowDir, workflow_id, skill)
7. Return { activity_id, skills, resources }
```

**Extension point**: Step 3-4 extracts skill IDs from the activity. When `activity_id` is omitted, step 3-4 should extract from `workflow.skills` instead:

```
3'. If no activity_id: skillIds = workflow.skills ?? []
4'. Throw if skillIds is empty
```

The Zod parameter schema changes from `z.string()` to `z.string().optional()`. The handler must branch on presence of `activity_id`. Token advancement: when `activity_id` is omitted, `advanceToken` should receive `act: ''` (workflow-level context).

### 9.2 Workflow Schema Extension

Following the optional field addition pattern from §2.3:

**Zod** (`src/schema/workflow.schema.ts`): add `skills: z.array(z.string()).optional()` after `executionModel` and before `initialActivity`.

**JSON Schema** (`schemas/workflow.schema.json`): add `skills` to `properties` (not to `required`). Per §3.2, `additionalProperties: false` requires the property to be declared.

**TOON declaration** (`workflows/work-package/workflow.toon`): add `skills[2]: [orchestrate-workflow, execute-activity]` after `executionModel` (line 257) and before `initialActivity` (line 258).

**Design note (user correction):** Workflow-level skills have no semantic constraint — they are NOT limited to "execution protocol" or "how to run" concerns. They use the same skill schema and have the same flexibility as activity-level skills. The only difference is scope: workflow-level skills apply across all activities, while activity-level skills apply to a specific activity. This is analogous to workflow-level `rules` (apply everywhere) vs activity-level rules (apply to one activity).

### 9.5 executionModel Deprecation Consideration

The `executionModel` field (added by ADR-0002, #84/#85) currently declares agent roles:

```typescript
executionModel: ExecutionModelSchema  // required
// where ExecutionModelSchema = { roles: [{ id, description }] }
```

With workflow-level `skills`, the behavioral specification for each role moves into the skills themselves (`orchestrate-workflow` defines the orchestrator's protocol; `execute-activity` defines the worker's protocol). The `executionModel.roles` declaration becomes redundant — the roles are implicit in the skills.

**Current consumers of executionModel:**
- `workflow.schema.ts:66` — required field on WorkflowSchema
- `workflow.schema.ts:71-76` — `.refine()` for unique role IDs
- `schemas/workflow.schema.json:203-205` — in `required` array
- All 10 workflow TOON files — must declare it (required field)
- `schemas/README.md` — documented

**Options:**
1. **Remove executionModel** — delete the field, schema, migration, refine. Clean but breaking. All 10 TOON files need migration.
2. **Make executionModel optional** — change from required to optional. Non-breaking. Workflows that declare skills don't need it.
3. **Defer** — keep executionModel as-is, track removal separately. Avoids scope creep on #86.

**Scope assessment:** Removing `executionModel` is a separate concern from fixing the discoverability gap (#86). It should be tracked as a follow-up issue rather than included in this work package. However, making `executionModel` optional (option 2) could be done as a low-risk cleanup within #86 if desired.

### 9.3 Skill-Loader Dead Code Map

```
skill-loader.ts (315 lines)
├── KEEP: findSkillFile()           L24-38    helper for tryLoadSkill
├── KEEP: getUniversalSkillDir()    L41-43    used by readSkill
├── KEEP: getWorkflowSkillDir()     L46-48    used by readSkill
├── KEEP: findWorkflowsWithSkills() L51-72    used by readSkill (cross-workflow fallback)
├── KEEP: tryLoadSkill()            L75-92    used by readSkill
├── KEEP: readSkill()               L101-135  ONLY EXPORT USED BY SERVER
├── REMOVE: listUniversalSkills()   L140-160  only used by dead functions
├── REMOVE: listWorkflowSkills()    L165-186  only used by dead functions
├── REMOVE: listSkills()            L191-215  not imported outside this file
├── REMOVE: SkillIndex (type)       L217-236  not imported outside this file
├── REMOVE: readSkillIndex()        L243-314  not imported outside this file
└── REMOVE: SkillEntry (interface)  L15-21    not imported outside this file
```

**Import analysis**: `src/tools/resource-tools.ts:9` imports only `readSkill`. No other `src/` file imports from skill-loader.

**Test impact**: Remove `listUniversalSkills` (2 tests), `listSkills` (1 test), `readSkillIndex` (4 tests). Keep `readSkill` (7 tests), `malformed TOON handling` (4 tests).

### 9.4 Meta Skill Update Points

**orchestrate-workflow** (`04-orchestrate-workflow.toon`): Update `dispatch-activity` bullet 3 (L30) to prepend `get_skills(workflow_id)` as first bootstrap step before `next_activity()`.

**execute-activity** (`05-execute-activity.toon`): Update `bootstrap-rules` (L16-17) to add `get_skills(workflow_id)` as the mechanism for discovering the execute-activity skill itself.

**meta/rules.toon** (L190): Update rule 3 to reference workflow-level skill loading before activity-level bootstrap.

### 9.6 Corrections Log

**Correction 1 (user, architecture-confirmed checkpoint):** Workflow-level skills are NOT semantically constrained to "execution protocol" or "how to run." They use the same schema as activity-level skills and have the same flexibility. The only difference is scope (workflow-wide vs single activity). The prior characterization of "workflow-level = how to run, activity-level = what to do" was a false dichotomy introduced by the agent. See updated §9.2 design note.

**Correction 2 (user, architecture-confirmed checkpoint):** The `executionModel` infrastructure may become unnecessary after workflow-level skills are added. The behavioral specification for orchestrator/worker roles is already encoded in the skills themselves — the structural `executionModel.roles` declaration is redundant. See §9.5 for deprecation analysis. Tracked as potential follow-up, not in scope for #86.

---

*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
