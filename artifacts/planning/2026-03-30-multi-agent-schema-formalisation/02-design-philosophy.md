# Design Philosophy — Multi-Agent Schema Formalisation

**Activity:** design-philosophy (v1.4.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)  

---

## 1. Problem Statement

The workflow-server's schema vocabulary has no constructs for multi-agent execution patterns. When a workflow requires an orchestrator/worker model — where one agent coordinates while another executes activity steps — these requirements can only be expressed as prose in `rules` arrays. The server cannot discover, validate, or reason about execution model requirements because they are opaque strings indistinguishable from any other rule.

**System understanding:**
- Workflow schemas (`workflow.schema.ts`) define `rules: z.array(z.string())` — flat text
- Activity schemas (`activity.schema.ts`) define `rules: z.array(z.string())` — flat text
- Skill schemas (`skill.schema.ts`) define `rules: z.record(z.string())` — named text pairs
- Rules TOON files (`rules.schema.ts`) define sections with `rules: string[]`
- Session tokens track workflow/activity/version but contain no agent identity
- Trace events record `aid` (activity ID), not agent identity
- State model tracks workflow progression but not which agent performs what
- The `ModeSchema` pattern (workflow-level definition, activity-level overrides) provides a proven structural model for cross-cutting concerns

**Impact:**
- Agents cannot determine from schema data that multi-agent execution is required
- The server cannot validate agent configuration before execution begins
- Each workflow author writes execution model rules differently
- IDE rules, session management, and workflow tools cannot adapt to execution models
- Structural enforcement of execution models (#65) is blocked without schema representation

**Success criteria:**
- Schemas can express multi-agent execution models as structured data
- Existing workflows without execution model declarations remain valid (backward compatible)
- The server can programmatically determine whether a workflow requires multi-agent execution
- Workflow authors have a consistent vocabulary for declaring agent roles and execution patterns

**Constraints:**
- No breaking changes to existing TOON parsing or workflow validation
- Both Zod schemas (`src/schema/`) and JSON Schema files (`schemas/`) must be updated in sync
- `additionalProperties: false` in JSON Schema means all new properties must be explicitly declared
- New fields must be optional to preserve backward compatibility

---

## 2. Problem Classification

**Type:** INVENTIVE GOAL (improvement)  
**Category:** Schema extension — adding new vocabulary to an existing type system  

**Rationale:** This is not a bug fix (nothing is broken) nor a refactoring (we're not restructuring existing constructs). We are extending the schema's expressive power to cover a domain concept (multi-agent execution) that currently has no representation. The problem is well-defined — we know exactly what's missing — but the design space has meaningful choices about construct shapes, placement, and granularity.

---

## 3. Complexity Assessment

**Overall: MODERATE**

| Dimension | Assessment | Rationale |
|-----------|-----------|-----------|
| Schema design | Moderate | New type definitions needed (ExecutionModel, AgentRole). Must balance expressiveness with simplicity. Mode pattern provides a structural template. |
| Implementation | Low | Adding optional Zod fields and JSON Schema properties. Loaders pass new fields through without changes. |
| Backward compatibility | Low risk | All new fields are optional. Existing TOON files validate without changes. |
| Test coverage | Low-Moderate | New schema types need validation tests. Existing tests unaffected (no behavior changes). |
| Loader impact | Minimal | Loaders validate through Zod; optional fields are absent-safe. No loader logic changes needed. |
| Tool impact | Low | `get_workflow` and `next_activity` return schema data automatically. Session token changes are out of scope for this phase. |
| JSON Schema sync | Low | Mechanical — mirror Zod additions in JSON Schema files. Audit remediation (#67) already established the sync pattern. |
| Documentation | Low | Schema README and API docs need minor updates. |

**Complexity drivers:**
1. Getting the abstraction right — the execution model construct must be general enough for future patterns (parallel workers, reviewers, pipelines) but specific enough to be useful for the immediate orchestrator/worker case
2. Deciding the right level of granularity — workflow-level declaration vs. activity-level overrides vs. step-level agent assignment

---

## 4. Design Approach

### 4.1 Structural Pattern: Follow Mode

The `ModeSchema` provides a proven pattern for cross-cutting workflow concerns:
- **Workflow level:** `modes: z.array(ModeSchema).optional()` — declares available modes
- **Activity level:** `modeOverrides: z.record(ModeOverrideSchema).optional()` — customizes per activity

An execution model construct should follow this same two-level approach:
- **Workflow level:** Declare the execution model (agent roles, default execution pattern)
- **Activity level:** Override or constrain execution model per activity (e.g., this activity requires the worker, this one the orchestrator can handle directly)

### 4.2 Descriptive First, Prescriptive Later

The schema should be **descriptive** — defining WHAT the execution model is, not HOW the server enforces it. Enforcement is a separate concern addressed by #65. This separation:
- Keeps this work package focused and deliverable
- Allows enforcement to evolve independently of the schema vocabulary
- Avoids coupling schema design to server runtime behavior

### 4.3 Additive, Non-Breaking

Every addition is an optional field. No existing behavior changes. The migration path is:
1. Add schema constructs (this work package)
2. Workflow authors adopt constructs in their TOON files (organic adoption)
3. Server-side enforcement can read constructs to validate agent behavior (#65, future)
4. Prose rules that duplicate schema constructs can be removed (follow-up)

---

## 5. Workflow Path Assessment

**Recommended path: skip-optional** (skip elicitation and research)

| Activity | Recommendation | Rationale |
|----------|---------------|-----------|
| Elicitation | **Skip** | Problem is well-understood from issue #84, #65, compliance review, and codebase analysis. No ambiguity about what's missing. |
| Research | **Skip** | Internal schema extension. No external standards, libraries, or competing approaches to evaluate. The domain is the existing codebase. |
| Context analysis | **Perform** | Should analyze existing workflow TOON files to extract concrete multi-agent rule patterns. These patterns inform the schema design. |
| Design | **Perform** | Core activity — define new schema types, placement, and interfaces. |
| Implementation | **Perform** | Schema changes, JSON Schema sync, tests. |
| Review | **Perform** | Verify backward compatibility and schema consistency. |

---

## 6. Key Codebase Findings

### 6.1 Session Token — No Agent Identity

The `SessionPayload` tracks `{ wf, act, skill, cond, v, seq, ts, sid, aid }`. The `aid` field is "activity ID" used in trace events — not "agent ID". It cannot be repurposed without breaking trace semantics. Agent identification in sessions would require a new field, but that is out of scope for this schema-definition work package.

### 6.2 JSON Schema Requires Explicit Property Declarations

All five JSON Schema files in `schemas/` use `additionalProperties: false`. New fields MUST be declared in both Zod AND JSON Schema. The audit remediation work (#67, WPs 02-04) established the synchronization pattern between the two.

### 6.3 State Schema — No Agent Tracking

`WorkflowState` tracks activities, steps, checkpoints, decisions, and loops but has no concept of which agent performed what. Adding agent tracking to state/session schemas is a follow-up concern — this work package focuses on the definition side (what does the workflow REQUIRE), not the runtime side (who is currently executing).
