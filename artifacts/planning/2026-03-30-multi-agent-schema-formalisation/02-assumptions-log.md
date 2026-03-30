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

## Open Assumptions

These assumptions require human judgment. They are ordered by decision impact. For each, the alternatives are presented before the agent's position, following the judgement augmentation format.

### A-01: Scope limited to definition schemas (not state or session)

**Decision impact:** HIGH — determines work package size and deliverables  
**Reversibility:** HIGH (additive; state/session changes can follow as a separate work package)  

**Alternatives:**  
(a) **Definition schemas only** — extend workflow.schema and activity.schema with execution model constructs. State and session schemas are unchanged. Runtime tracking of which agent is executing what is a follow-up concern.  
(b) **End-to-end** — also extend state.schema (agent tracking in workflow state), session.ts (agent identity in tokens), and trace.ts (agent identity in trace events). Delivers complete multi-agent support in one work package.  

**Agent position:** (a) Definition schemas only.  
**Rationale:** The definition side (what does the workflow require) is the prerequisite for everything else. Runtime tracking depends on having definitions first. Keeping scope narrow reduces risk and delivers value sooner. State/session/trace changes involve runtime behavior changes, not just metadata — they warrant their own design cycle.

### A-02: Execution model at workflow level with activity-level overrides

**Decision impact:** HIGH — determines schema structure and where authors declare execution models  
**Reversibility:** HIGH (additive; can expand to activity-level later if omitted initially)  

**Alternatives:**  
(a) **Workflow-level only** — declare execution model once in the workflow definition. All activities inherit it.  
(b) **Workflow-level with activity-level overrides** — declare default model at workflow level; activities can override or constrain (e.g., "this activity the orchestrator handles directly").  
(c) **Activity-level only** — each activity independently declares its execution model. No workflow-level declaration.  

**Agent position:** (b) Workflow-level with activity-level overrides.  
**Rationale:** Follows the proven ModeSchema pattern. Execution model is typically a workflow-wide concern (all three discovered patterns — persistent worker, disposable workers, named agents — are workflow-level decisions). Activity-level overrides handle exceptions (e.g., "the orchestrator can handle this lightweight activity directly without dispatching a worker"). Option (c) creates unnecessary repetition.

### A-03: Agent role representation — enum vs. freeform

**Decision impact:** MODERATE — affects validation granularity and extensibility  
**Reversibility:** MODERATE (enum → string is backward compatible; adding new enum values requires schema version bump)  

**Alternatives:**  
(a) **Strict enum** — predefined roles: `orchestrator`, `worker`, `verifier`, `merger`, `scanner`. New roles require schema updates.  
(b) **Freeform strings** — any string value for roles. Maximum flexibility, no validation.  
(c) **Enum with extensible escape hatch** — well-known roles as enum values plus a `custom` type with a freeform `description` field. Validation for known roles, flexibility for new ones.  

**Agent position:** (c) Enum with extensible escape hatch.  
**Rationale:** The codebase analysis revealed both generic roles (orchestrator, worker) and domain-specific roles (scanner, verifier, merger, analyst). An enum provides validation for the common cases; the escape hatch accommodates domain-specific roles without requiring schema updates. This matches how TOON schemas handle similar extensibility elsewhere (e.g., action types in ActionSchema use a strict enum).

### A-04: Worker persistence as a schema property

**Decision impact:** MODERATE — affects whether the schema distinguishes persistent vs. disposable workers  
**Reversibility:** HIGH (adding a field later is purely additive)  

**Alternatives:**  
(a) **Include persistence** — add a `persistence` field (enum: `persistent`, `disposable`) to the worker role definition. This captures the critical behavioral difference between work-package (resume workers) and prism (fresh workers).  
(b) **Omit persistence** — leave persistence as an orchestration concern described in prose rules. The schema defines roles but not how workers are managed.  

**Agent position:** (a) Include persistence.  
**Rationale:** The three discovered execution model patterns (CR-05) differ primarily on worker persistence. This is not an orchestration detail — it fundamentally affects how activities are structured (checkpoint-yielding for persistent, output-capturing for disposable). Without this, the schema can't distinguish work-package-style and prism-style execution.

### A-05: Schema should support but not mandate multi-agent execution

**Decision impact:** LOW (likely consensus)  
**Reversibility:** LOW concern (optional → required is a breaking change, but very unlikely to be needed)  

**Alternatives:**  
(a) **Optional** — workflows without an execution model field remain valid. Implicit default: single-agent inline execution.  
(b) **Required** — all workflows must declare an execution model. Existing workflows need migration.  

**Agent position:** (a) Optional.  
**Rationale:** 2 out of 10 workflows have no multi-agent rules. Requiring the field would break backward compatibility for no benefit. The implicit default (single-agent inline) is well-understood.

### A-06: Descriptive first, prescriptive later

**Decision impact:** HIGH — determines whether server code changes (enforcement) are in scope  
**Reversibility:** HIGH (descriptive → prescriptive is purely additive)  

**Alternatives:**  
(a) **Descriptive only** — schema constructs are metadata. The server stores and serves them. It does not validate agent behavior against them. Agents and IDE rules interpret the metadata to inform execution.  
(b) **Descriptive + prescriptive** — schema constructs are metadata AND the server uses them at runtime: validating session tokens against declared roles, rejecting tool calls from incorrect agent types, enforcing orchestrator discipline.  

**Agent position:** (a) Descriptive only (this work package).  
**Rationale:** This work package establishes the vocabulary (#84). Enforcement is a separate concern (#65). Coupling them would double the scope, require runtime behavior changes, and delay delivery. The schema must exist before enforcement can reference it. Enforcement is additive once constructs are in place.
