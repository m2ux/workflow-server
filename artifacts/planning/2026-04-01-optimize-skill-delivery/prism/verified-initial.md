# L12 Meta-Conservation Law Analysis: Unified Protocol Schema Proposal

**Target**: Design Proposal — Unified Protocol Schema for Workflow Orchestration Entities
**Target type**: General (design proposal evaluation)
**Lens**: Structure First, Level 12 (Meta-Conservation Law)
**Date**: 2026-04-01

---

## 1. Initial Claim

**Specific, falsifiable claim about the deepest structural problem:**

The proposal misidentifies the problem. It frames the issue as *syntactic heterogeneity* — three schemas with divergent representations for equivalent semantics — and prescribes *syntactic unification* as the solution. But the divergence is not syntactic; it is *consumer-driven semantic divergence*. The three entity types (workflow, activity, skill) serve fundamentally different consumers with fundamentally different interpretation models: workflows are consumed by an orchestration scheduler, activities are consumed by a state-machine engine, and skills are consumed by LLM agents reading sequential prose. The schema heterogeneity directly encodes these consumer differences. Unifying the schemas without unifying the consumers will recreate the heterogeneity at the interpretation layer.

**Falsification condition**: Demonstrate a unified protocol schema that is consumed identically by all three interpretation models (scheduler, state-machine engine, LLM agent) without level-specific interpretation logic.

---

## 2. Three-Expert Adversarial Test

### Expert A (Defender)

The claim is correct. Examine the evidence:

- **Skills** use `protocol: { phase-name: string[] }` — a flat map of phase names to prose bullet lists. This is because the consumer is an LLM agent that processes natural language instructions sequentially. The format is optimized for readability and direct execution by a language model. Formal loops and conditions would add syntax the LLM doesn't need.
- **Activities** use `steps[]` with `condition`, `loops[]` with three types, `decisions[]` with branches, and `checkpoints[]` with blocking options. This is because the consumer is a state-machine engine that needs explicit transition tables, iteration bounds, and decision points to manage execution state across multiple agent turns.
- **Workflows** have `activities[]` references, `variables[]`, and `modes[]`. This is because the consumer is an orchestration scheduler that sequences coarse-grained units and manages global state — it doesn't need step-level control flow because it delegates that to activities.

Each schema is optimized for its consumer. The proposal calls this a "problem" and names it "heterogeneity," but it's actually a design pattern: *schema-consumer alignment*. The proposal's "Semantic Equivalence Despite Syntactic Divergence" claim (Section 4) asserts all three "fundamentally express the same thing: do X, then Y, and if Z then W." But this is reductive: a workflow does not "do X then Y" — it *schedules* X then Y. An activity does not "do X" — it *manages state transitions* through X. A skill does not "do X" — it *instructs an agent* to do X. Same verbs, different semantics.

### Expert B (Attacker)

The claim exaggerates the difference. The proposal explicitly addresses the consumer distinction through its "Variant Constraints" section:

- *"Workflow Protocol: Operations are coarse-grained (activity-level)"*
- *"Activity Protocol: Operations are medium-grained (step-level)"*
- *"Skill Protocol: Operations are fine-grained (instruction-level)"*

The proposal isn't claiming the consumers are identical — it's claiming there exists a *shared abstract syntax* for ordered operations with optional conditions and loops, which each level specializes. This is standard type-theoretic design: a supertype with subtypes. The attacker would point out that the skill schema already contains implicit control flow:

- `"For Rust projects, reference TDD best practices from resource 23"` — this IS a conditional, just expressed as prose.
- `"Identify all test files... related to changed code"` — this IMPLIES iteration over a file list.
- `"Summarize coverage gaps and critical issues for checkpoint"` — this REFERENCES a checkpoint interaction.

Formalizing these implicit constructs doesn't change the consumer model — the LLM still reads instructions sequentially. It just makes the intent machine-parseable, enabling static analysis, validation, and visualization. The defender's argument that "LLMs don't need formal syntax" conflates the consumption interface with the authoring interface.

### Expert C (Assumption Prober)

Both experts take the three-level decomposition as given. The defender says "each schema is optimized for its consumer" — but who decided there should be exactly three consumers? The attacker says "the proposal addresses this with variant constraints" — but why must there be exactly three variants?

The proposal itself provides evidence the three-level decomposition may be wrong:

1. **Workflows are nearly empty.** They have `activities[]` references, `variables[]`, and `modes[]`. There's no protocol-level logic. A workflow is essentially configuration — it declares which activities to run and in what mode. It's not clear this warrants its own entity type with its own schema.
2. **Skills already bleed upward.** The `review-test-suite` example references activity-level checkpoints ("for checkpoint") and conditional logic ("for Rust projects"). Skills are already trying to express constructs the schema won't let them formalize.
3. **Activities might be two things.** An activity with `loops`, `decisions`, `checkpoints`, `transitions`, and `steps` is simultaneously a state machine (decisions, transitions, checkpoints) and a procedure (steps, loops). These might be better separated.

The real question isn't "should we unify three schemas?" — it's "are three levels the right decomposition?" Both the defender and attacker accept the decomposition and argue about representation. The proposal itself never questions whether workflow/activity/skill is the correct factoring.

### Claim Transformation

**Original claim**: Syntactic unification misidentifies the problem because runtime consumers differ fundamentally.

**Transformed claim**: The proposal's framing of "syntactic heterogeneity as problem, syntactic unification as solution" operates entirely within the three-level decomposition without questioning whether that decomposition is correct. The schema divergence may be signaling that the level boundaries are wrong, not that the schemas need harmonizing.

**The diagnostic gap**: My original claim protected the existing architecture (three levels are right, unification is wrong). Expert C revealed I was defending the status quo while criticizing the proposal — accepting the decomposition while rejecting its evolution. The transformed claim questions the decomposition itself: the heterogeneity might be a symptom of misdrawn boundaries, not misaligned schemas.

---

## 3. Concealment Mechanism

**Name: Level Reification**

The proposal treats the workflow/activity/skill decomposition as an axiomatic fact about the problem domain and directs all analytical energy at the representation layer (how the levels are encoded in JSON Schema). This conceals the architectural question: are these the right levels?

**How it operates**: The proposal's "Current State" section presents three schemas as *given* — "Activity Schema (Most Expressive)," "Skill Schema (Least Expressive)," "Workflow Schema (Intermediate)." By labeling them descriptively rather than interrogating them, the proposal positions them as immutable features of the landscape. The "Heterogeneity Problem" section then lists four concrete issues (rules format, control flow gap, execution step representation, semantic equivalence), all of which accept the three-level decomposition and argue about intra-level representation.

The concealment is effective because it offers a plausible alternative narrative: "these three entity types exist; their schemas should be consistent." This narrative has enough truth (the rules format inconsistency IS an accidental difference) to make the deeper question ("should these three entity types exist in this form?") feel out of scope.

**Application to the target**: The concealment mechanism is present throughout:

- "At present, workflows, activities, and skills have ostensibly identical internal semantics" — stated as premise, not interrogated.
- "The proposal is to optimise workflows by defining a new 'protocol' schema that is shared by workflow, activity, and skill alike" — the decomposition is taken as input; only the schema is output.
- "Variant Constraints" — each entity type extends the base with its own constraints, solidifying the three-level structure as architectural fact.

---

## 4. Improvement That Deepens Concealment

**The Protocol Adapter Layer**

Instead of a single unified schema, introduce a base protocol interface with three adapters:

```
protocol.schema.json (base interface):
  operations: Operation[]
  each Operation: { id, name, condition?, loop?, compose? }

workflow-protocol.adapter.json:
  extends: protocol.schema.json
  constrains: operations to activity-references only
  adds: variables, modes, initialActivity, executionModel

activity-protocol.adapter.json:
  extends: protocol.schema.json  
  constrains: operations to step-level granularity
  adds: checkpoints, transitions, entryActions, exitActions

skill-protocol.adapter.json:
  extends: protocol.schema.json
  constrains: operations to instruction-level
  adds: tools, inputs, outputs, errors, resources
```

**Why it would pass review**: This is a recognized design pattern (adapter/strategy). It appears to address both camps — the "unification" camp gets a shared base protocol; the "preserve level semantics" camp gets level-specific adapters. A reviewer would see architectural rigor: interface segregation, extension without modification, clean separation of concerns.

**Why it deepens the concealment**: The adapter pattern *further reifies* the three-level decomposition by creating dedicated infrastructure for each level. Now there's not just three schemas — there's a base schema, three adapter schemas, and the relationship between them. The question "should we have three levels?" becomes even harder to ask because there's now an adapter architecture invested in the answer being yes. The pattern also makes the base protocol look architecturally significant when it's actually trivially thin (just "a list of things with optional conditions").

---

## 5. Three Properties Visible Only Through Strengthening

### Property 1: The Base Protocol Is Vacuous

By trying to define what's "common" across all three levels, the adapter pattern reveals that the commonality is trivially thin — just "an ordered sequence of things, some of which may have conditions." This was always true but concealed by the proposal's prose, which describes the commonality in rich language ("fundamental condition and iteration semantics") that makes it sound substantive. The adapter pattern forces the commonality into a schema, exposing its thinness. A base type that says only `{ operations: Operation[] }` adds no constraint beyond "this thing has parts."

### Property 2: The Adapters Recreate the Heterogeneity

Each adapter adds the level-specific constructs that constitute 90% of the schema's semantic content. The "unified" base contributes the remaining 10% — an abstract sequence concept. The adapter pattern makes this ratio structurally visible: looking at each adapter file, you'd see that the `extends: protocol.schema.json` line contributes almost nothing, while the `adds:` section contains everything that matters. The heterogeneity hasn't been eliminated; it's been moved from "three independent schemas" to "three adapters of a vacuous base."

### Property 3: The Boundary Decisions Are the Real Design

The adapter pattern forces explicit decisions about what goes in the base versus what goes in adapters. Should `condition` be base-level? The proposal says yes, but skills currently express conditions as prose — promoting conditions to formal syntax changes the authoring experience for skill authors. Should `loop` be base-level? Activities use three loop types; workflows use none; skills use none formally but imply iteration in prose. Every base-vs-adapter decision is actually a decision about whether a feature is *fundamental* or *level-specific* — and there's no principled criterion for making this decision. The adapter pattern exposes that "unification" is actually "promotion decisions," and there's no theory guiding which features to promote.

---

## 6. Diagnostic Applied to the Improvement

**What the improvement conceals**: The adapter pattern conceals that the adapters are doing all the meaningful work while the base protocol contributes nothing useful. The architecture *looks* like a principled decomposition (shared core + specialized extensions), but the core is so thin that the "sharing" is nominal. The pattern conceals this by giving the base its own schema file, its own name, and a structural position at the top of the inheritance hierarchy — all the markers of importance, with none of the substance.

**Property of the original problem recreated**: The original problem was that three entity types with different semantics were forced into a representational framework that either homogenized them (losing consumer-specific optimization) or kept them separate (losing compositional benefits). The adapter pattern recreates exactly this dilemma: the base protocol homogenizes (losing level-specific meaning) while the adapters specialize (recreating the heterogeneity). The structural relationship is isomorphic to the original; only the abstraction layer has shifted. The proposal's problem is now the adapter pattern's problem: three things that look like they should unify but resist it because their consumers need different things.

---

## 7. Second Improvement

**Trait Composition Model**

Eliminate the vacuous base. Instead of a base protocol with adapters, define independent orthogonal traits that can be composed:

- **Sequenceable** — has ordered operations
- **Conditional** — operations support `condition` predicates
- **Iterable** — supports loop constructs (forEach, while, doWhile)
- **Interactive** — supports checkpoints and user interaction points
- **Composable** — operations can reference sub-protocols
- **Tooled** — declares available tool integrations

Each entity type composes the traits it needs:
- Workflow = Sequenceable + Composable
- Activity = Sequenceable + Conditional + Iterable + Interactive + Composable
- Skill = Sequenceable + (optionally Conditional) + Tooled

This addresses the recreated property: there's no vacuous base. Each trait provides genuine capability. A skill that doesn't need iteration doesn't include `Iterable`. An activity that needs all features composes all traits. The composition is explicit and meaningful.

**Diagnostic applied**: The trait composition model conceals a new version of the same problem. The decision of *which traits exist* encodes assumptions about what the "fundamental operations" are. Why is `Conditional` separate from `Sequenceable`? Because the current skill schema doesn't have formal conditions. Why is `Interactive` its own trait? Because skills currently delegate checkpoints to activities. The trait boundaries are drawn by examining the *current system's* differences — they encode the status quo as if it were a principled taxonomy.

**The recreated property**: We've replaced three entity types with six traits. The boundary decisions are still arbitrary, still driven by the current implementation rather than by a theory of workflow orchestration. Instead of "why these three levels?" we now ask "why these six traits?" — a proliferated version of the same question.

---

## 8. Structural Invariant

**The Taxonomic Reification Invariant**: Any attempt to restructure the representation of workflow/activity/skill entities will produce a new taxonomy (base+adapters, traits, levels, facets, or any other decomposition scheme) that reifies the current system's empirically-evolved structure as if it were a principled architectural decision.

This invariant persists because the three entity types were not designed from first principles — they evolved to serve different consumers (orchestration scheduler, state-machine engine, LLM agent). Any unification scheme must map onto these consumers, and since the consumers genuinely differ, the mapping will always produce categories that mirror the consumer differences. The categories may be called "adapters," "traits," "variants," or "constraints," but they will partition along the same consumer-driven boundaries.

The invariant is a property of the *problem space* (three genuinely different consumers), not the *implementation* (three schemas). Changing the implementation changes the names of the categories but not the fact that categories will emerge along consumer boundaries.

---

## 9. Invariant Inversion

**Design where taxonomic reification becomes trivially satisfiable:**

A single, fully dynamic protocol entity with no predetermined taxonomy:

```
Protocol:
  granularity: string           // user-defined, not schema-enforced
  capabilities: Capability[]    // dynamically composed at authoring time
  operations: Operation[]       // uniform operation format

Capability:
  kind: string                  // "loop" | "checkpoint" | "transition" | ...
  config: Record<string, any>   // capability-specific parameters

Operation:
  id: string
  instruction: string           // the actual content
  capabilities: string[]        // references to declared capabilities
```

In this design, there are no "workflow," "activity," or "skill" entity types. There is only `Protocol`. A protocol declares whatever capabilities it needs. There's no base-vs-adapter decision, no trait selection, no level classification. The taxonomy is trivially satisfiable because there is no taxonomy — every protocol defines its own shape.

---

## 10. New Impossibility

**The Loss of Constraint Impossibility**: If any protocol can declare any capabilities, the schema provides no guidance about what capabilities are appropriate at what granularity. Nothing prevents:

- A fine-grained "skill-like" protocol from declaring checkpoints, transitions, and state management — turning it into an activity.
- A coarse-grained "workflow-like" protocol from inlining instruction-level prose — collapsing the orchestration layer into the execution layer.
- A medium-grained protocol from declaring tool integrations alongside transition tables — mixing concerns freely.

The original system's heterogeneous schemas encoded *useful constraints*: skills CANNOT declare checkpoints (preventing upward coupling), workflows DO NOT have instruction-level steps (maintaining orchestration abstraction), activities CANNOT declare tool interfaces (preserving the delegation model). The fully dynamic protocol eliminates all of these constraints. Maximum expressiveness, zero guidance.

The loss is not hypothetical. In the current system, when a skill author writes `"Summarize coverage gaps and critical issues for checkpoint"`, the fact that skills have no formal checkpoint construct means the author is forced to express this as a *hint* to the activity layer, maintaining the separation. In the dynamic protocol, the author would declare a checkpoint capability directly, bypassing the activity layer and potentially creating unmanageable coupling between protocol instances.

---

## 11. The Conservation Law

**The Constraint-Expressiveness Conservation Law**: In a multi-level workflow orchestration system, the product of *expressiveness* (ability to represent arbitrary control flow at any level) and *constraint* (restriction of what each level can express) is conserved across representational changes.

- Unifying the schemas increases expressiveness at lower levels (skills can now formally express conditions, loops, and interactions) but decreases constraint by exactly the same amount (skills can now express things they shouldn't).
- Splitting the schemas increases constraint (each level can only express what's appropriate) but decreases expressiveness (skills can't formally express the conditions they already implicitly use).
- The current heterogeneous schemas sit at a specific point on this tradeoff: high constraint at the skill level (simple prose), high expressiveness at the activity level (full control flow), minimal expressiveness at the workflow level (orchestration only).

The "heterogeneity" the proposal identifies as a problem is the system *paying for constraint* — and the proposal's unification is a proposal to *spend that constraint budget on expressiveness*. Whether this is a good trade depends on whether the constraint was valuable. The conservation law says you can't get the expressiveness for free; it will cost exactly as much constraint as it buys.

---

## 12. Diagnostic Applied to the Conservation Law

### What the Conservation Law Conceals

The law presents the expressiveness-constraint tradeoff as *symmetric* — as if every point on the tradeoff curve is equally valid, and the choice is merely preferential. But the tradeoff is asymmetric in this system:

- **At the skill level, constraint is more valuable than expressiveness.** Skills are consumed by LLM agents that process sequential prose. Adding formal loop syntax to skills doesn't help the LLM (it can interpret "for each file" just fine) but it does impose authoring overhead on skill writers and parsing overhead on the server. The constraint that skills are "just prose bullets" is load-bearing: it keeps skills lightweight, easy to author, and directly interpretable.

- **At the activity level, expressiveness is more valuable than constraint.** Activities model complex state machines with branching, iteration, and user interaction. Constraining activities to simpler representations would force complex logic into prose, reducing machine interpretability. The expressiveness that activities have is load-bearing.

- **At the workflow level, constraint is again more valuable.** Workflows should remain thin orchestration layers. Adding control flow to workflows would duplicate activity-level logic at a higher granularity.

The conservation law hides this asymmetry by treating "constraint" and "expressiveness" as uniform quantities. In reality, each level has a *different* optimal point on the tradeoff curve, and that's exactly why the schemas diverged in the first place.

### Structural Invariant of the Law

**Asymmetric Consumer Needs**: The conservation law must eventually acknowledge that the "right" tradeoff point is different for each level, because each level's consumer has different needs. This acknowledgment reintroduces level-specific treatment, undermining the law's claim to universality. The invariant is: any attempt to articulate the tradeoff must fragment into level-specific tradeoff analyses, recreating the taxonomic decomposition.

### Invariant Inversion

Design where consumer asymmetry becomes trivially satisfiable: **Consumer-Indexed Schemas.** Instead of defining entity types by their structural level (workflow/activity/skill), define them by their consumer:

```
schema-for-orchestrator.json    // consumed by the scheduling engine
schema-for-state-machine.json   // consumed by the state-machine executor  
schema-for-llm-agent.json       // consumed by LLM agents as instructions
```

Each schema is optimized for its consumer's interpretation model. There's no pretense of unification because the schemas are explicitly different *by design*. Consumer asymmetry is trivially satisfiable because the schemas acknowledge it as a feature, not a bug.

**New impossibility this creates**: The consumer-indexed model makes it impossible to refactor between levels. If a skill grows complex enough to need state-machine semantics, it can't simply adopt activity constructs — it must be rewritten for a different consumer. The current system's "promote skill to activity" refactoring path (however informal) is eliminated because the schemas are explicitly incompatible by design.

---

## 13. The Meta-Law

**The Consumer-Schema Entanglement Meta-Law**: In this specific system, the representational schema cannot be decoupled from the consumer's interpretation model without either creating dead schema weight (constructs that exist in the schema but are never used by the consumer) or creating interpretation ambiguity (constructs that the schema permits but the consumer interprets differently than intended).

### What the Conservation Law Conceals

The conservation law frames the problem as a quantitative tradeoff (more expressiveness = less constraint, and vice versa). This conceals the *qualitative* nature of the problem: "constraint" is not a scalar quantity. What constrains an LLM agent (strict sequential bullets with no formal branching) *liberates* a state-machine engine (which needs exactly that formal branching to function). The conservation law treats constraint as fungible across levels, but it's not — it's consumer-specific. Spending constraint budget at the skill level doesn't buy the same thing as spending it at the activity level.

### The Meta-Law's Specific Prediction

The meta-law predicts a concrete, testable consequence for this system:

**If the unified protocol schema is implemented, it will produce one of exactly two outcomes within the first adoption cycle:**

**(A) Dead schema weight in skills.** Skill authors will largely ignore the formal control flow constructs (loops, conditions, decisions) because LLM agents interpret prose conditionals (`"If the project uses Rust..."`) equally well or better than formal condition predicates. The unified schema will have loop and condition constructs that are syntactically valid in skill definitions but semantically inert — the LLM consumer doesn't process them differently than prose equivalents. Metric: >80% of skill definitions will use 0 formal loop or condition constructs within 6 months of adoption.

**(B) Convenience layer recreation.** The team will create "skill templates," "simplified skill authoring mode," or authoring guidelines that effectively say "for skills, just write prose bullets in the `operations` array and ignore the condition/loop/decision fields." This convenience layer will be functionally identical to the current `protocol: { phase: string[] }` format — proving that the current skill schema was already optimized for its consumer and that the unified protocol's additional constructs are overhead. Metric: a convenience layer or template system will emerge within 6 months.

Both outcomes demonstrate the meta-law: the schema and its consumer are entangled. You can change the schema, but the consumer's interpretation model will either ignore the changes (outcome A) or the team will add a translation layer that undoes the changes (outcome B).

**The meta-law does NOT generalize** to "all schemas are entangled with their consumers." It is specific to this system: the entanglement exists because one consumer (LLM agents) processes natural language natively and gains nothing from formal control flow syntax, while another consumer (state-machine engines) requires formal control flow syntax to function. This specific asymmetry — one consumer for whom formalization is neutral-to-harmful, another for whom it's essential — is what makes unification structurally unstable in this case.

---

## 14. Concrete Findings: Bugs, Edge Cases, and Silent Failures

### Finding 1: Rules Format Migration Will Silently Break Lookup Semantics

- **Location**: Section "Rules Format Inconsistency" (Heterogeneity Problem §1)
- **What breaks**: Skill rules use named key-value pairs (`rules: { isolation: "...", model-selection: "..." }`) enabling key-based lookup. Activity/workflow rules use ordered string arrays (`rules: ["directive 1", "directive 2"]`) where ordering encodes priority. Unifying to either format silently loses the other's semantics. If unified to arrays: skills lose key-based lookup. If unified to objects: activities/workflows lose priority ordering (object key order is not guaranteed in JSON).
- **Severity**: Medium
- **Conservation law prediction**: **Structural.** The format difference encodes consumer-specific access patterns. Skill consumers look up rules by name ("what's the isolation rule?"); activity consumers process rules in order ("apply rules top-to-bottom"). No single format serves both patterns without information loss.

### Finding 2: Checkpoint Delegation Creates Impossible Coupling

- **Location**: Skill schema section — `"Summarize coverage gaps and critical issues for checkpoint"` and the note: "the skill has no formal way to declare this dependency"
- **What breaks**: If the unified protocol allows skills to formally declare checkpoints, skills must know about activity-level state (what checkpoint options are available, what state transitions they trigger). This creates upward coupling: a skill references constructs that only make sense in its containing activity. If the containing activity changes its checkpoints, the skill silently references nonexistent interaction points.
- **Severity**: High
- **Conservation law prediction**: **Structural.** The delegation model (skills hint, activities own checkpoints) exists because skills are executed within activity contexts. Formalizing the hint into a declaration doesn't change the runtime dependency — it just makes it explicit in a way that creates a new failure mode (declared checkpoint doesn't exist in the containing activity).

### Finding 3: Cross-Granularity Composition Enables Abstraction Collapse

- **Location**: Core Idea §5 — "Each operation can reference a sub-protocol (enabling nesting/composition)"
- **What breaks**: Nothing in the proposal constrains which granularity levels can compose which others. A workflow operation could reference a skill protocol directly (bypassing the activity layer). A skill could compose another skill. A skill could reference an activity protocol. Without granularity constraints, the three-level hierarchy becomes a graph, and the benefits of hierarchical decomposition (clear abstraction boundaries, predictable execution order, isolated state management) are lost.
- **Severity**: Medium
- **Conservation law prediction**: **Structural.** Granularity constraints are consumer-driven. The orchestrator expects to schedule activities, not instruction-level operations. The state-machine engine expects to manage steps, not other state machines. Removing these constraints doesn't change the consumers — it just creates compositions the consumers can't correctly interpret.

### Finding 4: TOON Nesting Limitations May Block the Unified Protocol

- **Location**: Design Constraints §5 — "The protocol must be expressible in TOON syntax, which has its own constraints on nested structure representation"
- **What breaks**: The unified protocol requires nested structures: operations containing conditions containing sub-operations containing loops. The proposal acknowledges TOON has "constraints on nested structure representation" but doesn't analyze whether the protocol's nesting depth exceeds TOON's capacity. If it does, the protocol is syntactically valid in JSON Schema but unrepresentable in the authoring format, creating a specification-implementation gap.
- **Severity**: High
- **Conservation law prediction**: **Fixable.** This is an implementation constraint (TOON format limitations), not a consumer-driven semantic issue. The TOON format could be extended, or an alternative serialization could be used for deeply nested protocols.

### Finding 5: Migration Strategy Absence Is a Project-Scale Risk

- **Location**: Design Constraints §1 and Open Questions §4
- **What breaks**: "Existing TOON files must remain valid or have a clear migration path" is stated as a constraint, but no migration strategy is proposed or even sketched. The system likely contains dozens of existing TOON definitions. Without a migration strategy, the unified protocol either (a) requires a big-bang migration (high risk, high effort), (b) requires indefinite dual-format support (ongoing maintenance cost), or (c) applies only to new entities (creating a fourth format: legacy-activity, legacy-skill, legacy-workflow, plus unified-protocol).
- **Severity**: High
- **Conservation law prediction**: **Fixable.** Migration is an operational concern, not a structural one. The conservation law doesn't constrain migration strategy — it constrains the destination format.

### Finding 6: Skill Complexity Creep Has No Mitigation Mechanism

- **Location**: Open Questions §5 — "Does formal control flow in skills create a 'skill complexity creep' problem?"
- **What breaks**: The proposal identifies this risk but provides no mitigation. With a unified protocol, nothing prevents gradual migration of activity-level logic (loops, decisions, checkpoints, transitions) into skills. Over time, skills would absorb activity responsibilities, turning "lightweight instruction lists" into "mini-activities." The three-level hierarchy would flatten to two levels (workflow + complex-skills), losing the benefits of the current decomposition.
- **Severity**: Medium
- **Conservation law prediction**: **Structural.** The conservation law directly predicts this: increasing skill expressiveness costs exactly as much constraint. Skill complexity creep IS the constraint cost — it's what happens when you spend the constraint budget on expressiveness. No mitigation can prevent it without reintroducing constraint, which returns the system to the current state.

### Finding 7: Loop Type Semantics Are Consumer-Irrelevant at Skill Level

- **Location**: Open Questions §1 — "Should the unified protocol support all three loop types at all levels?"
- **What breaks**: `forEach`, `while`, and `doWhile` are meaningful distinctions for a state-machine engine (they have different termination semantics and state management requirements). For an LLM agent consuming skill instructions, these distinctions are irrelevant — the agent interprets all three as "repeat this until done." Including all three loop types in skill definitions adds schema complexity without semantic benefit.
- **Severity**: Low
- **Conservation law prediction**: **Structural.** Loop type semantics are consumer-specific. The state-machine consumer needs the distinction; the LLM consumer doesn't. The unified protocol would include loop types that are meaningful at one level and meaningless at another — dead schema weight at the skill level.

### Finding 8: "Semantic Equivalence" Assertion Is Unfalsified and Likely False

- **Location**: Heterogeneity Problem §4 — "All three entities fundamentally express the same thing"
- **What breaks**: The proposal's central premise — that workflows, activities, and skills are semantically equivalent — is asserted without proof and is likely false. A workflow *coordinates* (selecting and sequencing activities); an activity *manages state* (tracking progress through steps with transitions and checkpoints); a skill *instructs* (providing sequential guidance to an agent). "Coordinate," "manage state," and "instruct" are different operations. Reducing all three to "do X, then Y, if Z then W" loses the operational semantics that distinguish them.
- **Severity**: High
- **Conservation law prediction**: **Structural.** The conservation law exists precisely because the three operations are NOT semantically equivalent. If they were, unification would be costless — there would be no constraint to conserve. The fact that unification has a constraint cost IS evidence that the semantic equivalence claim is wrong.

### Finding 9: Shared Tooling Argument Is Circular

- **Location**: Heterogeneity Problem §4, bullet 2 — "Apply the same tooling (validators, visualizers, static analysis)"
- **What breaks**: The proposal argues unified schemas enable shared tooling. But if the unified schema requires level-specific interpretation (as the Variant Constraints section implies), the tooling must be level-aware anyway. A validator for skill protocols must enforce different constraints than a validator for activity protocols. A visualizer for workflows must render differently than a visualizer for skills. The "shared tooling" is shared only at the parsing layer (reading the common base schema), not at the semantic layer (interpreting what the parsed structure means). Parsing is the trivial part; interpretation is the hard part.
- **Severity**: Medium
- **Conservation law prediction**: **Structural.** The conservation law predicts that syntactic unity doesn't eliminate semantic diversity. Shared tooling that operates on the unified syntax will need consumer-specific interpretation logic, reproducing the heterogeneity at the tool level rather than the schema level.
