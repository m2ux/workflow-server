# Unified Protocol Schema — Design Proposal Evaluation

**Scope:** Evaluation of the proposed unified protocol schema for workflow orchestration entities (workflows, activities, skills)
**Date:** 2026-04-01

---

## Executive Summary

This report presents findings from a structural evaluation of the design proposal to unify the protocol schemas for workflows, activities, and skills into a single shared schema with variant constraints.

**Finding counts by severity:**

| Severity | Count |
|----------|-------|
| High     | 4     |
| Medium   | 5     |
| Low      | 1     |
| **Total**| **10**|

The proposal's central premise — that all three entity types "fundamentally express the same thing" — is asserted without proof and is contradicted by the existence of operations (such as checkpoint coordination) that inherently span two entities in a hierarchical relationship. The proposal occupies an unstable intermediate position between two coherent alternatives: full semantic unification (one entity type, varying granularity as a parameter) and principled separation (three types with deliberately different capabilities serving as complexity boundaries). The unified schema attempts to simplify the authoring model while preserving interpreter simplicity, but these goals are in tension: reducing the number of schemas an author must learn shifts complexity into the runtime, which must then resolve scope, capability, and cross-entity constraints dynamically.

---

## Core Finding

**CF-01: The authoring model and the interpretation model are inversely coupled through the composition boundary.**

For this hierarchically composed protocol system, the complexity of the authoring model and the complexity of the interpretation model cannot be simultaneously simplified:

- A **simple authoring model** (entities are self-contained, independently valid, one shared schema) requires a **complex interpreter** — the runtime must resolve scope dynamically, validate cross-entity constraints at composition time, and handle the mismatch between uniform entities and non-uniform runtime requirements.

- A **simple interpreter** (entity type determines capability, scope is statically known, variant constraints pre-resolve dispatch) requires a **complex authoring model** — authors must learn multiple schemas or constraint sets, manage scope declarations, and understand cross-entity dependencies during development.

The unified protocol proposal attempts to simplify the authoring model (one schema instead of three) while preserving interpreter simplicity (the runtime knows what to expect from each entity type via variant constraints). This intermediate position is under pressure to collapse toward one of two outcomes:

**(a) Cosmetic simplification.** The unified schema retains enough type-level information through variant constraints, scope declarations, or required metadata that authors must still effectively learn three distinct configurations — the base schema plus three different constraint sets. The authoring simplification is nominal; the actual cognitive load is comparable to the current system. The benefit reduces to shared tooling infrastructure (one parser, one validator skeleton), which is a real but more modest gain than the proposal implies.

**(b) Genuine unification.** The unified schema truly eliminates type-level distinctions, forcing the runtime interpreter to become significantly more complex. The interpreter must handle entities whose capabilities are no longer statically known from their type, requiring dynamic capability detection, contextual scope inference, and runtime validation that the current three-type dispatch avoids.

### Testable Prediction

If the unified protocol is implemented, measure:
1. **Effective authoring complexity** — the number of distinct valid entity configurations an author must understand (schema rules × constraint combinations × scope rules)
2. **Interpreter dispatch complexity** — the number of runtime type/capability checks and dynamic dispatch paths in the protocol interpreter

The product of these two quantities is expected to remain in the same order of magnitude as under the current three-schema system. If the proposal reduces effective authoring complexity by truly eliminating distinctions, interpreter dispatch complexity should increase to compensate. If interpreter complexity remains low, the authoring simplification is likely cosmetic.

*This prediction is a design heuristic, not a proven invariant. Specific design techniques — well-chosen defaults, layered validation, progressive disclosure of advanced constructs — may genuinely reduce the product, but the current proposal does not contain a mechanism that would achieve this.*

### Governing Constraint

The workflow orchestration domain requires BOTH uniform semantics (all entities express operations with conditions and iteration) AND hierarchical scope enforcement (not all entities may exercise all capabilities at all levels of the composition hierarchy). Any single-mechanism design that satisfies one requirement undermines the other:

- Uniform semantics demands a shared schema → erodes scope enforcement
- Scope enforcement demands capability differentiation → erodes uniformity
- Static scope declaration approximates both → but misrepresents scope's relational nature
- Dynamic scope inference requires composition context → breaks independent authoring

Scope is a relational property — it depends on the composition hierarchy, not just the entity in isolation. A skill has "instruction" scope when composed into an activity, but if composed directly into a workflow, it may need "execution" scope. Any design that encodes scope as a fixed property of the entity (whether through type, field, or trait) treats a relational property as an intrinsic one.

---

## Findings

### High Severity

#### F-01: Skill control flow has no governance mechanism

**Location:** Variant Constraints — Skill Protocol

Skills gain formal loops, conditions, and decisions through the unified protocol, but no mechanism limits their use. A skill with three nested loops and five conditionals is schema-valid but has functionally become an activity. The variant constraints (skills add `tools`, `inputs`, `outputs`, `errors`, `resources`) constrain what *metadata* skills carry, not what *control flow* they express. The proposal adds control flow to skills without adding control flow governance for skills.

**Fixability:** Fixable — add construct-depth or construct-availability constraints to the skill variant. However, this reintroduces authoring complexity: authors must learn which constructs are permitted at which level, partially reversing the simplification the unified schema provides.

---

#### F-02: Unrestricted composition depth with no cycle detection

**Location:** Core Idea, item 5 (Composition)

"Each operation can reference a sub-protocol" enables unrestricted nesting. A skill operation referencing another skill's sub-protocol referencing another creates unbounded composition depth with no cycle detection or depth constraint specified in the proposal.

**Fixability:** Fixable — add max-depth and acyclicity constraints. However, depth constraints reintroduce level-awareness (permissible depth depends on what level the entity operates at), partially recreating the granularity distinctions the unified schema aims to dissolve.

---

#### F-03: Checkpoint delegation creates cross-level coupling

**Location:** Skill schema — checkpoint references in prose (e.g., "present summary for checkpoint")

Skills referencing activity-level checkpoint state create an implicit upward dependency. The unified protocol has no mechanism for declaring cross-level state dependencies. A skill that says "present summary for checkpoint" will silently fail if composed into an activity without a matching checkpoint. Formalizing the checkpoint hint into a declaration does not eliminate the runtime dependency — it makes it explicit in a way that creates a new failure mode: the declared checkpoint does not exist in the containing activity.

This is a manifestation of the relational nature of scope. Checkpoint coordination between an activity and a skill is not expressible within a single entity's protocol — it inherently spans two entities in a hierarchical relationship. This is not "do X then Y"; it is "do X then signal my parent to do Y."

**Fixability:** Structural — fixing requires either explicit dependency declarations (increasing authoring complexity) or runtime dependency resolution (increasing interpreter complexity).

---

#### F-04: TOON nesting compatibility is unverified

**Location:** Design Constraint 5 (TOON Compatibility)

The proposal states: "The protocol must be expressible in TOON syntax, which has its own constraints on nested structure representation." The proposal does not analyze whether TOON's nesting limitations are compatible with the proposed nested operations + conditions + loops. If TOON cannot represent deeply nested protocol structures, the formal unification may be expressible in JSON Schema but not in the authoring format, creating a specification-implementation gap.

**Fixability:** Fixable — requires TOON format analysis not present in the proposal. If TOON nesting is insufficient, the unified schema must either extend TOON or accept that some valid unified-protocol documents cannot be authored in TOON, creating a format bifurcation.

---

### Medium Severity

#### F-05: The semantic equivalence claim is unsubstantiated

**Location:** Heterogeneity Problem §4; Core Idea premise

The proposal's central premise — "all three entities fundamentally express the same thing: do X, then Y, and if Z then W" — is asserted without formal proof. The proposal itself acknowledges this through its open questions. A counterexample exists: checkpoint coordination between an activity and a skill is not expressible within a single entity's protocol. It inherently spans two entities in a hierarchical relationship, meaning the three entities do not "fundamentally express the same thing."

More broadly, the proposal conflates syntactic unification with semantic unification. "Same base schema" is treated as equivalent to "same fundamental nature," but these serve different purposes. Syntactic unification is a tooling concern (one parser, one validator). Semantic unification is an architectural claim (these entities are the same kind of thing at different granularities). The proposal uses syntactic unification as evidence for semantic equivalence without establishing the equivalence independently.

**Fixability:** Structural — the semantic equivalence claim has a demonstrated boundary at operations requiring hierarchical coordination.

---

#### F-06: Rules format unification breaks access-pattern semantics

**Location:** Rules Format Inconsistency (Heterogeneity Problem §1)

Skill rules use named key-value pairs (`rules: { isolation: "...", model-selection: "..." }`) enabling key-based lookup. Activity and workflow rules use ordered string arrays (`rules: ["directive 1", "directive 2"]`) where ordering encodes priority. Unifying to either format silently loses the other's semantics:

- Unified to arrays → skills lose key-based lookup
- Unified to objects → activities and workflows lose priority ordering (object key order is not guaranteed in the JSON specification)

**Fixability:** Fixable — choose one format and provide migration tooling.

---

#### F-07: No migration strategy is specified

**Location:** Design Constraint 1 (Backward Compatibility) and Open Questions §4

"Existing TOON files must remain valid or have a clear migration path" is stated as a constraint, but no migration strategy is proposed or sketched. Given that skill rules change format and skill protocol changes from phase-map to operation-sequence, migration is non-trivial. Without a strategy, the unified protocol requires one of: (a) a big-bang migration, (b) indefinite dual-format support, or (c) application only to new entities, creating a fourth format variant alongside the three legacy formats.

**Fixability:** Fixable — a migration strategy can be designed. The migration complexity itself reveals the actual distance between the current and proposed schemas, which may be larger than the "semantic equivalence" framing suggests.

---

#### F-08: Workflows gain control flow, altering their architectural role

**Location:** Variant Constraints — Workflow Protocol

Workflows currently delegate all control flow to activities ("no direct steps, loops, or decisions at the workflow level"). The unified protocol gives workflows access to these constructs. A workflow with inline loops and conditions rather than activity delegation changes the architectural role of workflows from orchestrators to executors.

**Fixability:** Fixable — workflow variant constraints could prohibit inline control flow. However, this reintroduces the same syntactic limitation the proposal removes from skills, creating a consistency concern within the unified design.

---

#### F-09: Skill-level interaction semantics are undefined

**Location:** Core Idea, item 4 (Messaging/Interaction) vs. Variant Constraints — Skill Protocol

The proposal's core idea includes "formalized interaction points (replacing implicit checkpoint references in skill prose)," but the variant constraints for skills list `tools`, `inputs`, `outputs`, `errors`, `resources` — not interaction or checkpoint semantics. Activity checkpoints have `options`, `effect`, `blocking`, `autoAdvanceMs`. What subset applies at skill level is unspecified, creating a gap between the stated core idea and the variant specification.

**Fixability:** Fixable — define skill-level interaction semantics. This forces a decision about whether skill-level interactions are delegated upward to the containing activity (current model) or handled locally within the skill (new capability with coordination overhead).

---

### Low Severity

#### F-10: Formal control flow value for LLM consumers is conditional and untested

**Location:** Implicit throughout the proposal

The proposal's argument for keeping skills prose-based rests partly on the assumption that formal control flow syntax is unnecessary for skill-level consumers (LLM agents). IF formal structure improves LLM compliance with skill instructions, the tradeoff favors unification at the skill level more strongly than the proposal acknowledges. Conversely, IF LLMs gain nothing from formal structure, the ergonomic argument for prose-only skills is stronger. The proposal does not frame this as conditional on empirical evidence.

**PROVISIONAL:** The correct design decision at the skill level depends on empirical evidence about LLM consumer behavior with formal versus prose-based instructions. This evidence is not available in the proposal and should be gathered before committing to either direction.

**Fixability:** Structural (epistemic gap) — the right response is to make the design decision explicitly conditional on empirical assessment of consumer behavior.

---

## Recommendations

1. **Validate the semantic equivalence claim before proceeding.** The proposal's central premise is unsubstantiated. Before investing in unified schema design, formally demonstrate that the three entity types share sufficient semantic structure to justify unification, or identify the precise boundaries where equivalence breaks down (F-05).

2. **Add governance constraints for skill-level control flow.** If unification proceeds, define explicit limits on what control flow constructs skills may use — for example, maximum nesting depth or construct availability constraints on the skill variant. Accept that this partially offsets the authoring simplification (F-01).

3. **Define composition constraints.** Specify maximum composition depth, acyclicity requirements, and which granularity levels may compose which others. Without these, the three-level hierarchy degrades into an unconstrained graph (F-02).

4. **Design a cross-level dependency declaration mechanism.** Checkpoint references in skills create implicit upward dependencies that the unified protocol does not model. Either formalize these dependencies (with the attendant authoring cost) or explicitly document that checkpoint coordination remains prose-level and is not covered by the protocol schema (F-03).

5. **Analyze TOON nesting capacity.** Before finalizing the unified schema, verify that TOON syntax can represent the required nesting depth. If it cannot, decide whether to extend TOON or accept format bifurcation (F-04).

6. **Develop a migration strategy.** Specify how existing TOON files transition to the unified format. Include tooling for automated conversion and a timeline for deprecating legacy formats (F-07).

7. **Gather empirical data on formal structure and LLM compliance.** The design decision at the skill level should be evidence-based. Run controlled evaluations comparing LLM agent performance with formally-structured versus prose-based skill definitions before committing to either approach (F-10).

8. **Acknowledge the authoring-interpretation tradeoff explicitly.** The proposal should state which side of the tradeoff it optimizes for and what compensating mechanisms it provides for the other side. The current presentation implies both authoring and interpretation are simplified, which is structurally unlikely (CF-01).

---

## Traceability

| Report ID | Source Artifact | Original ID | Severity |
|-----------|----------------|-------------|----------|
| CF-01 | `prism/verified-corrected.md` | Sections 11, 13, 16 | Structural |
| F-01 | `prism/verified-corrected.md` | Issue #1 | High |
| F-02 | `prism/verified-corrected.md` | Issue #2 | High |
| F-03 | `prism/verified-corrected.md` | Issue #3 | High |
| F-04 | `prism/verified-corrected.md` | Issue #6 | High |
| F-05 | `prism/verified-corrected.md` | Issue #4, Section 4 | Medium |
| F-06 | `prism/verified-corrected.md` | Issue #5 | Medium |
| F-07 | `prism/verified-corrected.md` | Issue #7 | Medium |
| F-08 | `prism/verified-corrected.md` | Issue #8 | Medium |
| F-09 | `prism/verified-corrected.md` | Issue #9 | Medium |
| F-10 | `prism/verified-corrected.md` | Issue #10 | Low |

All source artifact paths are relative to: `/home/mike/dev/workflow-server/.engineering/artifacts/planning/2026-04-01-optimize-skill-delivery/`
