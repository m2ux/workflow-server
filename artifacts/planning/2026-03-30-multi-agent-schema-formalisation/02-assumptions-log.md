# Assumptions Log — Multi-Agent Schema Formalisation

**Activity:** design-philosophy (v1.4.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)  

---

## Code-Resolved Assumptions

These assumptions were resolved through targeted codebase analysis during the reconciliation step.

### CR-01: `aid` in SessionPayload is not available for agent identification

**Assumption:** The `aid` field in `SessionPayload` could be repurposed for agent identification.  
**Resolution:** REJECTED  
**Evidence:** `aid` is initialized as empty string in `createSessionToken()` (session.ts L82), populated from `token.aid` in trace events (logging.ts L74, trace.ts L43), and used alongside `wf` and `act` in `TraceEvent`. It tracks activity identity in traces — repurposing it would break trace semantics. A new field is needed for agent identification.  
**Impact:** Agent identity in sessions/traces will require new fields, not reuse of `aid`.

### CR-02: Optional Zod fields are backward-compatible with existing TOON files

**Assumption:** Adding optional fields to Zod schemas might break parsing of existing TOON files.  
**Resolution:** CONFIRMED SAFE  
**Evidence:** Zod `.optional()` fields validate successfully when absent. JSON Schema files use `additionalProperties: false` but new properties only need to be added to the `properties` object — not to `required`. Existing TOON files without the new fields continue to validate.  
**Impact:** Schema changes are safely additive. No migration of existing TOON files required.

### CR-03: Both Zod and JSON Schema files must be updated in sync

**Assumption:** Only Zod schemas need updating.  
**Resolution:** REJECTED — both require updates  
**Evidence:** Five JSON Schema files exist in `schemas/` (workflow, activity, skill, condition, state). All use `additionalProperties: false`. The audit remediation work (#67, WPs 02-04) established the synchronization pattern. Any Zod addition must be mirrored in the corresponding JSON Schema file.  
**Impact:** Implementation scope includes JSON Schema changes (mechanical but required).

### CR-04: ModeSchema provides a valid structural pattern

**Assumption:** The `ModeSchema` pattern (workflow-level definition, activity-level overrides) is appropriate for execution model constructs.  
**Resolution:** CONFIRMED  
**Evidence:** `ModeSchema` is defined at workflow level (`modes: z.array(ModeSchema).optional()` in workflow.schema.ts L51). Activities reference modes via `modeOverrides: z.record(ModeOverrideSchema).optional()` (activity.schema.ts L176). This two-level pattern cleanly separates declaration from per-activity customization. An execution model construct can follow the same approach.  
**Impact:** Schema design can use the Mode pattern as a structural template, reducing design risk.

### CR-05: Multi-agent execution is pervasive across workflows

**Assumption:** Only work-package uses multi-agent execution patterns.  
**Resolution:** REJECTED — 8 out of 10 workflows define multi-agent rules  
**Evidence:** Grep across all workflow TOON files reveals three distinct execution model patterns:  
- **Persistent worker** (work-package): Single worker sub-agent resumed across activities. Worker yields checkpoints to orchestrator. Orchestrator runs inline at top level.  
- **Disposable workers** (prism, prism-audit, prism-evaluate, prism-update): Fresh sub-agent per pass/activity. Context isolation between workers. Output forwarding between passes.  
- **Named multi-agent** (substrate-node-security-audit, cicd-pipeline-security-audit): Multiple named sub-agents with specific designators (R, S, A1-A7, B, D1, D2, V, M). Concurrent execution. Verification gates and merge agents.  
**Impact:** CRITICAL — the schema must be expressive enough to capture all three patterns, not just orchestrator/worker. This increases design complexity but confirms the value of formalisation.

### CR-06: Prose rules can coexist with schema constructs during migration

**Assumption:** Existing prose rules about execution models must be removed when schema constructs are added.  
**Resolution:** Both can coexist  
**Evidence:** Rules are served as flat strings via `get_workflow` (workflow-tools.ts L92). The server does not parse or interpret rule content. Schema constructs and prose rules can coexist: constructs provide machine-readable data, prose provides agent-readable guidance. Removing prose rules is a separate follow-up migration step.  
**Impact:** No workflow migration required as part of this work package. Adoption is organic.

---

## Resolved Assumptions

All assumptions reviewed and resolved by the user on 2026-03-30.

### A-01: Scope limited to definition schemas (not state or session)

**Decision impact:** HIGH — determines work package size and deliverables  
**Reversibility:** HIGH (additive; state/session changes can follow as a separate work package)  
**Resolution:** **(a) Definition schemas only** ✅  

**Alternatives presented:**  
(a) **Definition schemas only** — extend workflow.schema with execution model constructs. State and session schemas are unchanged.  
(b) **End-to-end** — also extend state.schema, session.ts, and trace.ts for runtime agent tracking.  

**User decision:** (a) Definition schemas only. Runtime integration (state, session, trace) follows as a separate work package.  
**Agent position was:** (a) — aligned with user decision.

### A-02: Execution model placement

**Decision impact:** HIGH — determines schema structure and where authors declare execution models  
**Reversibility:** HIGH (additive; can expand to activity-level later)  
**Resolution:** **(a) Workflow-level only** ✅  

**Alternatives presented:**  
(a) **Workflow-level only** — declare execution model once in the workflow definition. All activities inherit it.  
(b) **Workflow-level with activity-level overrides** — declare default at workflow level; activities can override.  
(c) **Activity-level only** — each activity independently declares its execution model.  

**User decision:** (a) Workflow-level only. No activity-level overrides in this iteration.  
**Agent position was:** (b) — user chose a simpler starting point. Activity-level overrides can be added later.

### A-03: Agent role representation

**Decision impact:** MODERATE — affects validation granularity and extensibility  
**Reversibility:** MODERATE  
**Resolution:** **CUSTOM — per-workflow declared role vocabulary** ✅  

**Alternatives presented:**  
(a) **Strict enum** — predefined global roles. New roles require schema updates.  
(b) **Freeform strings** — any string value for roles.  
(c) **Enum with extensible escape hatch** — well-known roles plus a custom type.  

**User decision:** NONE OF THE ABOVE. The user wants a per-workflow declared enum: each workflow defines its own set of valid roles (a "workforce"). Role references within the workflow are validated against that declared set. This is not a global enum shared across workflows, and not freeform strings — it's a locally-scoped vocabulary defined by the workflow author.  
**Agent position was:** (c) — user's approach is fundamentally different. The agent proposed a global type system; the user wants per-workflow type declarations. This is a stronger design that provides validation without requiring cross-workflow consensus on role names.  
**Design implications:** The schema needs a role declaration section in the execution model (defining valid roles for this workflow) and a validation mechanism to ensure role references elsewhere in the workflow match the declared set.

### A-04: Worker persistence as a schema property

**Decision impact:** MODERATE — affects whether the schema distinguishes persistent vs. disposable workers  
**Reversibility:** HIGH (adding a field later is purely additive)  
**Resolution:** **(b) Omit persistence** ✅  

**Alternatives presented:**  
(a) **Include persistence** — add a `persistence` field to the worker role definition.  
(b) **Omit persistence** — leave persistence as an orchestration concern described in prose rules.  

**User decision:** (b) Omit. Leave persistence as a prose/orchestration concern.  
**Agent position was:** (a) — user disagrees. Persistence remains a behavioral concern for prose rules and orchestration skills, not schema metadata.

### A-05: Optional vs. required execution model declaration

**Decision impact:** HIGH (revised from LOW — user chose breaking change direction)  
**Reversibility:** N/A (chosen direction is the less reversible option)  
**Resolution:** **(b) Required** ✅  

**Alternatives presented:**  
(a) **Optional** — workflows without an execution model field remain valid.  
(b) **Required** — all workflows must declare an execution model. Existing workflows need migration.  

**User decision:** (b) Required. ALL workflows must explicitly declare their execution model.  
**Agent position was:** (a) — user overrode. This means existing TOON files that lack the execution model field will fail validation after this change. All 10 workflows in the worktree need migration. The 2 workflows without multi-agent rules will need an explicit single-agent/inline declaration.  
**Migration implications:** This is a breaking schema change. A minor version bump is needed. All existing workflow TOON files must be updated before or alongside the schema release. JSON Schema `required` arrays must include the new field.

### A-06: Descriptive vs. prescriptive approach

**Decision impact:** HIGH — determines whether server code changes (enforcement) are in scope  
**Reversibility:** HIGH (descriptive → prescriptive is purely additive)  
**Resolution:** **(a) Descriptive only** ✅  

**Alternatives presented:**  
(a) **Descriptive only** — schema constructs are metadata. The server stores and serves them but does not enforce.  
(b) **Descriptive + prescriptive** — schema constructs are metadata AND the server enforces them at runtime.  

**User decision:** (a) Descriptive only. Enforcement follows separately as #65.  
**Agent position was:** (a) — aligned with user decision.

---

## Decision Summary

| ID | Topic | User Choice | Agrees with Agent? |
|----|-------|------------|-------------------|
| A-01 | Scope | Definition schemas only | ✅ Yes |
| A-02 | Placement | Workflow-level only (no overrides) | ❌ Simpler than proposed |
| A-03 | Roles | Per-workflow declared vocabulary | ❌ Different approach entirely |
| A-04 | Persistence | Omit from schema | ❌ Opposite of proposed |
| A-05 | Optional/Required | Required (breaking change) | ❌ Opposite of proposed |
| A-06 | Approach | Descriptive only | ✅ Yes |

**Net effect:** The user's decisions produce a narrower but more opinionated design than proposed. The execution model is workflow-level only (simpler), with per-workflow role vocabulary (more expressive than a global enum), required for all workflows (stronger contract, requires migration), without persistence metadata (leaner). The schema defines what roles exist in a workflow's workforce — not how they behave at runtime.

---

## Elicitation-Phase Assumptions

Assumptions identified during the requirements-elicitation activity (2026-03-30). All resolved through elicitation or code analysis.

### EA-01: Roster-only design is sufficient for agent interpretation

**Assumption:** Agents can correctly interpret multi-agent execution requirements with only role declarations in the schema, relying on prose rules for behavioral constraints.  
**Resolution:** ACCEPTED (user decision Q1)  
**Evidence:** The user explicitly chose roster-only. Prose rules remain the authoritative source for behavioral constraints. The execution model provides machine-readable "who participates" while prose rules provide "how they behave."  
**Impact:** The schema addition is minimal — only `executionModel.roles[]`. No behavioral metadata fields.

### EA-02: Static role declarations are adequate for dynamic workforces

**Assumption:** Workflows with variable agent counts (substrate-audit A1-A7, cicd-audit S1-Sn) can use representative role types instead of individual agent instances.  
**Resolution:** ACCEPTED (user decision Q2)  
**Evidence:** The user confirmed that cardinality is an orchestration concern, not a schema concern. The schema declares role types (e.g., "auditor"); the orchestrator decides how many instances to spawn.  
**Impact:** No cardinality field needed. Simplifies schema design.

### EA-03: The field name `executionModel` has no conflicts

**Assumption:** The chosen field name `executionModel` doesn't conflict with any existing schema field or internal identifier.  
**Resolution:** CONFIRMED via code analysis  
**Evidence:** Grep across `src/` for `executionModel` returns zero matches. Existing WorkflowSchema fields are: `$schema`, `id`, `version`, `title`, `description`, `author`, `tags`, `rules`, `variables`, `modes`, `artifactLocations`, `initialActivity`, `activities`. No collision.  
**Impact:** None — safe to proceed.

### EA-04: All 10 workflow TOON files can be migrated synchronously

**Assumption:** Every workflow in the `workflows/` worktree can have a valid `executionModel` block added, including the 3 workflows without multi-agent prose rules.  
**Resolution:** CONFIRMED via code analysis  
**Evidence:** 7 workflows have explicit multi-agent rules with clear role patterns. 3 workflows (meta, workflow-design, work-packages) have zero multi-agent rules — they will receive a single-role `executionModel` declaring one `agent` role. All TOON files are writable in the workflows worktree.  
**Impact:** Migration covers 7 multi-agent + 3 single-agent workflows. All 10 accounted for.

### EA-05: No ModeOverrideSchema changes are needed

**Assumption:** The decision for no mode-execution model interaction (Q5) means ModeOverrideSchema is unchanged.  
**Resolution:** CONFIRMED  
**Evidence:** User explicitly chose `no-interaction`. Modes and execution model are independent. ModeOverrideSchema's existing fields (description, rules, steps, skipSteps, skipCheckpoints, checkpoints, transitionOverride, context_to_preserve) are unaffected.  
**Impact:** Zero changes to activity.schema.ts ModeOverrideSchema.

### EA-06: Workflow summary mode must include executionModel

**Assumption:** The `get_workflow` tool's summary mode currently returns a hand-picked subset of fields. The `executionModel` field needs to be included in this subset for agents to discover it without loading the full workflow.  
**Resolution:** CONFIRMED — requires a one-line code change  
**Evidence:** `workflow-tools.ts` L87-96 builds the summary object manually: `{ id, version, title, description, rules, variables, initialActivity, activities }`. The `executionModel` field must be added to this object. This is a minor code change, not a schema change.  
**Impact:** One line added to `workflow-tools.ts`. Contradicts NFR-03 ("no tool changes") — this is a minor exception. The tool handler code isn't changing behavior, just including an additional field in the summary projection.

---

## Research-Phase Assumptions

Assumptions identified during the research activity (2026-03-30). All resolved through industry comparison.

### RA-01: Minimal id+description is a valid starting point

**Assumption:** The `id` + `description` role definition is sufficient despite industry frameworks using 3+ identity fields (role, goal, backstory).  
**Resolution:** CONFIRMED  
**Evidence:** Our `id` maps to the "role" component and `description` combines "goal" and "backstory" from the industry-standard RGB (Role-Goal-Backstory) pattern established by CrewAI. Goal and backstory are optional enrichments for runtime agent configuration, not prerequisites for role declaration. Our schema declares role types, not agent instances.  
**Impact:** None — design proceeds as specified.

### RA-02: Strict schema diverges from industry norms

**Assumption:** Using `additionalProperties: false` on the execution model is safe despite most frameworks being permissive.  
**Resolution:** ACKNOWLEDGED TRADE-OFF  
**Evidence:** CrewAI, AutoGen, and LangGraph all support open/extensible agent definitions. Our choice is consistent with the workflow-server's own workflow.schema.json policy (strict everywhere). Trade-off: new properties require schema version bumps, which provides controlled evolution but slower iteration.  
**Impact:** Future extensions require schema updates. This is the intended behavior per user decision Q8.

### RA-03: Extension pressure is likely

**Assumption:** Industry trend toward richer role definitions (tools, constraints, handoffs) suggests our schema will need extension sooner than typical for a new construct.  
**Resolution:** MITIGATED  
**Evidence:** All surveyed frameworks attach behavioral metadata to roles. Our out-of-scope table (03-requirements-elicitation.md §6) documents 7 future extension paths: activity-level overrides, persistence, enforcement, state/session tracking, mode interaction, cardinality, and structured constraints. Strict schema provides a controlled evolution mechanism.  
**Impact:** Extension paths are documented and ready for future work packages when needed.
