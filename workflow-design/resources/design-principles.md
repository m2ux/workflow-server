---
name: design-principles
description: Positive design-time prefer/before stance for workflow authoring. Detect/Fix lives in anti-patterns.
metadata:
  order: 0
  legacy_id: 0
---

# Overview

Positive framing for workflow design-time authoring. Each principle states a *prefer / before / only after* stance — what to author toward. A principle is broader than any one defect: it is the stance that avoids a family of smells (and related failures not yet catalogued).

Principles do **not** carry Detect / Do not flag / Fix. Specific bad instances are catalogued in [anti-patterns](./anti-patterns.md). Together with that catalog and the schema construct inventory, these are the **workflow-design canon** for design-time authoring.

---

## 1. Workflows Ossify Patterns

Workflows are an ossification vector: they make available for reuse fixed, well-understood patterns, at the expense of dynamic, on-the-fly novelty. The durable workflow graph is how those patterns stay shareable across runs; novelty enters by design update or outside the graph.

## 2. Internalize Before Producing

Demonstrate understanding of the conceptual model (Goal → Activity → operation), schema-vs-runtime boundaries, inline-vs-modular distinctions, and existing conventions before producing any content.

## 3. Define Complete Scope Before Execution

Enumerate every file to create, modify, or remove before starting. Include the dedicated session edit root at `{target_path}`. Re-verify after completion.

## 4. Clarify Before Assuming

When user intent admits materially different interpretations, ask one clarifying question before acting.

## 5. Maximize Schema Expressiveness

Prefer the most specific formal construct the schema provides. Prose is only for `description` / `outcome` (and equivalent) fields that state WHAT without restating structure. I/O contracts stay portable — describe what a value *is*, not which caller, activity, or workflow produces or consumes it.

## 6. One Authoritative Home

Operative criteria, reusable facts, and fill/consult content have exactly one home. Resources hold fill/consult (templates, vocabularies, criteria); does (protocol, behavioural rules) lives outside resources. Other layers cite or walk the home — they do not re-author Detect, duplicate guidance, or invent pass inventories that drift from activity bind sites.

## 7. Convention Over Invention

Search for existing conventions before introducing new patterns. Use established naming, field ordering, and structural patterns.

## 8. Confirm Before Irreversible Changes

Classify changes by reversibility. Semi-reversible and irreversible changes require explicit confirmation with impact analysis.

## 9. Encode Constraints as Structure

Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not rule text alone.

## 10. Non-Destructive Updates

Compare new content against existing content. Flag any material being removed. Content-reducing updates require explicit user approval.

## 11. Complete Documentation Structure

Every workflow includes a README.md at the root and in each construct subfolder. READMEs orient (purpose, flow, value, structure, links).

## 12. Output Economy

Design artifact contracts and checkpoints for the reader who must act on them — one canonical home per fact, declared human vs agent audience, exception-only status, lean templates, one close-out document, one decision per checkpoint, statement-form messages with artifact links where named.

## 13. Separate Contract from Procedure

On techniques, Outputs declare *what* each bindable value is — including derivation and recognition criteria. Protocol orders *when* and *how* those values are produced and references `{id}`; it does not restate identity tables or host trailing "Set …" phases for pure projections of another output.

## 14. Single Source of Truth

Each fact of session state has exactly one authoritative variable. Compare that source directly in gates and technique inputs rather than maintaining parallel derived shadows.

## 15. Phase by Sequenced Outcome

A Protocol index marks a distinct outcome that must complete before the next begins. Co-aspects of the same act — facets of one survey, constraints on one write, mode branches of one apply — stay as elaborating bullets under that phase. Topic partitions that can be reordered or dropped without changing the phase sequence do not get their own numbers.

## 16. Distinguish Designators from Parameters

In technique Protocol, declared values use braced designators (`{id}`); operation argument names are italicised (*arg*); argument lists attach in parentheses on the op reference. Keep argument names out of the brace and backtick namespaces reserved for values and code tokens.

## 17. Document in Positive Present

Definition prose (`description`, `outcome`, option text, README orientation for the defined workflow) states what the system *is* or *does* in positive declarative present tense — not avoidance or comparative framing against a prior design.

## 18. Prefer Shared Capability

When a meta or shared-workflow technique already owns a capability, reuse it by binding that op from an activity (or borrowing an activity that already binds it). Invent a parallel local recipe only after the shared surface cannot absorb the caller's diversity. For mid-phase multi-agent fan-out and consolidate, prefer the meta [`orchestration-patterns`](../../meta/techniques/orchestration-patterns/TECHNIQUE.md) ops and borrowable [`activities/patterns/`](../../meta/activities/patterns/README.md) before local spawn-concurrent / merge recipes.

## 19. Name Symbols Affirmatively

Symbol ids state what the value *is* in affirmative, head-noun-last `snake_case`: booleans as predicates, collections as plural item nouns, I/O without direction or representation encoding. Rule slugs state a positive invariant when clearer than bare negation.

## 20. Keep Orchestration in Structure

Activities own stage, checkpoints, transitions, and graph progress. Techniques stay stage-agnostic: they produce values and durable evidence — they do not name the surrounding activity flow or the gates that consume their outputs.

## 21. Match the Harness Surface

Tool names, return shapes, and bootstrap paths in techniques and docs match the actual harness surface. Behavioural guidance about tools lives in one authoritative place; do not invent parallel recipes or incomplete hop chains.

## 22. Modular Over Inline

Constructs live in their own files. Parents reference siblings; they do not embed activity, technique, or resource bodies inline.

## 23. Close the Loop

When implementation is in scope, a recommendation is followed by action or an explicit stop gate — analysis alone is not the terminal deliverable.

## 24. Keep Session Interaction in Activities

Techniques are session-blind: take inputs, process over tools and resources, and emit outputs. They do not know about user sessions or how to interact with humans. Activities are session-aware — they own when and how technique products reach the user (`action: message`, checkpoint `message` / `options`, artifact links).

## 25. Bind Sibling Operations as Steps

All multi-technique work lives in activity `steps[]` (and checkpoints/loops). Bind each already-defined sibling or shared operation as its own activity step. A technique owns one capability's produce path — its Protocol does not `Apply` sibling or meta ops for work. Loader ancestor wrap (`Initial`/`Final`) and container I/O merge are platform composition, not technique→technique work calls.

## 26. Atomic Techniques; Compose at Activities

Techniques are small, relatively atomic capabilities: a short produce path over tools and resources, without complex conditional/branching orchestration and without invoking other techniques to do work. Activities are the composition layer — they bind techniques (and checkpoints/loops) into useful work. Activity→activity composition is allowed: borrow, bind, or include activities to reuse standalone orchestration patterns — including the meta pattern library under [`meta/activities/patterns/`](../../meta/activities/patterns/README.md) (orchestrator-workers, supervisor, plan-and-execute, isolated-fan-out, lead-researcher). Technique→technique work calls remain forbidden — techniques stay atomic over tools and resources. Reuse a shared capability by binding it from an activity (or borrowing that activity), not by `Apply [other-technique]` inside a Protocol.

## 27. State Contract Contribution

Capability on a container `TECHNIQUE.md` (workflow-root or group) names what shared Inputs, Outputs, Rules, or domain invariants the contract contributes. Loader composition — inheritance merge, `Initial`/`Final` wrap, renumbering, folder-implied membership — lives in workflow-canonical and the schema construct inventory, not in the contract's Capability.

## 28. Creation Guide for Generated Documents

Every planning artifact a workflow persists has an associated creation-guide resource with a `## Template` section (and operative `## Rules` for how to fill it). Persist techniques cite that template; they do not invent layout in protocol prose. Shared shapes may share one guide; every bare filename still maps to a guide.
