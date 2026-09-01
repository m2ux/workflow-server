---
name: design-principles
description: Positive design-time prefer/before stance for workflow authoring.
metadata:
  order: 0
  legacy_id: 0
---

# Overview

Fundamental design principles for workflow design-time authoring. Each principle states a *prefer / before / only after* stance — what to author toward. A principle is broader than any one defect: it is the stance that avoids a family of smells (and related failures not yet catalogued).

Specific bad instances are catalogued in [anti-patterns](./anti-patterns.md). Together with that catalog and the schema construct inventory, these are the **workflow-design canon** for design-time authoring.

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

Prefer the most specific formal construct the schema provides. Prose is only for `description` / `outcome` (and equivalent) fields that state WHAT without restating structure. Workflow `variables[].description` is one line only ([variable-description-one-line](./anti-patterns.md#ap-126-variable-description-one-line)). I/O contracts stay portable — describe what a value *is*, not which caller, activity, or workflow produces or consumes it.

## 6. One Authoritative Home

Operative criteria, reusable facts, and fill/consult content have exactly one home. Resources hold fill/consult (templates, vocabularies, criteria, policy tables); does (protocol, behavioural rules) lives outside resources — “does” means operational cadence and HOW, not normative criteria / vocabulary / policy matrices (those remain resource consult even when a technique Applies them). Other layers cite or walk the home — they do not re-author Detect, duplicate guidance, or invent pass inventories that drift from activity bind sites.

## 7. Convention Over Invention

Search for existing conventions before introducing new patterns. Use established naming, field ordering, and structural patterns.

## 8. Confirm Before Irreversible Changes

Classify changes by reversibility. Semi-reversible and irreversible changes require explicit confirmation with impact analysis.

## 9. Encode Constraints as Structure

Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not rule text alone.

## 10. Non-Destructive Updates

Compare new content against existing content. Flag any material being removed. Content-reducing updates require explicit user approval. A restructuring that removes a gate, re-routes an exit, relocates an operation, or collapses a rule into another home names the outcome, option, input or audience that still has to hold, and the check confirming it — content approval is not evidence that behaviour survived.

## 11. Complete Documentation Structure

Every workflow includes a README.md at the root and in each construct subfolder. READMEs orient (purpose, flow, value, structure, links). A completeness verdict over them names the enumeration that grounds it, not the instances inspected.

## 12. Output Economy

Design artifact contracts and checkpoints for the reader who must act on them — one canonical home per fact, declared human vs agent audience, exception-only status, lean templates, one close-out document, one decision per checkpoint, statement-form messages with artifact links where named.

## 13. Separate Contract from Procedure

On techniques, Inputs and Outputs are **bind contracts** — each declares *what* the bound value is (meaning, shape, allowed values; Outputs may include derivation/recognition criteria). Protocol orders *when* and *how* work runs and references `{id}`; it does not restate identity tables, and I/O descriptions do not carry HOW. Any how associated with an input or output — constraints, sequencing, fallbacks, side duties — migrates to a dedicated Protocol step (or a true cross-cutting Rule), not the I/O entry. Protocol also does not host trailing "Set …" phases for pure projections of another output.

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

## 29. Cite Resource Policy; Do Not Restate It

Resources own vocabularies, criteria/policy, and how fields are represented or matched on consult surfaces. Technique Protocol operates on **semantic fields** and cites those sections in house style — e.g. `per [Section Title](../resources/example.md#section-title)` (link text is the section title; the URL includes the `#` anchor) — it does not re-author the vocabulary, policy matrix, or representation/matching rules. **Separation test:** representation or layout of a consult surface may change without Protocol change when the underlying fields are unchanged. This is the cite-don't-restate half of technique↔resource policy; it complements [One Authoritative Home](#6-one-authoritative-home) and [Creation Guide for Generated Documents](#28-creation-guide-for-generated-documents) without replacing either.

## 30. Resources at the Abstract Level; Split for Section Delivery

A resource treats artifact names and variables at the abstract level — the *kind* of artifact, the *role* a variable plays, the template skeleton with placeholders. Concrete artifact filenames, variable bindings, and the per-run instances of both are owned by the technique (and the activity that binds the variables). The resource describes the shape; the technique instantiates it. A resource does not name the concrete artifact files or variables a specific technique produces or consumes — that coupling belongs to the technique's I/O contract and Protocol. This is the abstraction-level half of [One Authoritative Home](#6-one-authoritative-home) and [Cite Resource Policy; Do Not Restate It](#29-cite-resource-policy-do-not-restate-it).

Split a multi-part resource into per-category sections, each carrying the fragment pertinent to one category (its table fragment, population rules, prefix), with any whole-document skeleton (header, per-category placeholders, footer) in its own section. The technique that renders one category fetches only its section (`get_resource { resource_id: "<resource>#<category-anchor>" }`); the consolidating step fetches only the skeleton section. No consumer loads the whole resource to read one category. Group shared fragments — scales, mappings, reference tables consulted across categories — under a single shared section, so a consumer fetches them as one unit rather than section-by-section. **Content a section-scoped reader depends on lives in a section** — operative framing, shared keys, and obligations the section consumer still needs sit under a `##` heading a `#anchor` can deliver (or move into the technique that depends on them), not only in a leading H1 span or in prose before any heading. This is the structural half of the section-or-whole economy — a resource's sections are its delivery units — and [Cite Resources at Section Grain](#32-cite-resources-at-section-grain) is the citation half that spends them.

## 31. Isolate Conditional Branches as Notes

Prose that applies on one path only is set apart from prose that always applies. Within a Protocol step, the unconditional instruction is the bullet and each *when* / *if* / *otherwise* branch is a `>` note beneath it. A note carrying two or more items gives each one a bullet, written `  > - When …`, so they read as the list they are; a lone caveat is the note's own prose, with no list to express. Either shape keeps the block out of the step sequence, because the protocol parser's step regex matches a bullet at any indent and a line opening with `>` fails that match and folds into the instruction above. A reader scanning the step then sees the shape of the work without evaluating every clause to learn which parts apply to their run, and the branch stays visually attached to the instruction it qualifies rather than reading as another thing to do.

Reach for structure first: a condition selecting a step, an activity, or a whole path is a `when`, a `condition`, or a declared decision, and belongs in the YAML. This stance governs only what legitimately remains in prose — a branch qualifying a single instruction, with no structural home. Prefer the note over a sibling bullet, and over an inline "if X then Y, otherwise Z" clause that buries the branch mid-sentence. Avoids `constraint-as-blockquote`; the structural alternatives are `checkpoint-not-prose`, `loop-not-prose`, and `decision-not-prose`.

## 32. Cite Resources at Section Grain

A citation is a delivery instruction. What it resolves to — the path after `resources/` with `.md` stripped and any `#anchor` kept — is the unit the server loads into the consumer's context, so `example.md#section-title` delivers one section where `example.md` delivers the file. A citation therefore names the narrowest section carrying what the citing prose needs. The bare resource is the citation for a consumer that reads the whole body: a filler working a `## Template` together with the `## Rules` that populate it, an audit walking every entry.

Grain is a property of the resource across the whole technique, not of one link. Every distinct citation is delivered, so a bare citation standing beside anchored ones sends the file *and* those sections, and the file's size counts against the eager budget that decides what else arrives. Where a technique needs several sections, cite each by anchor; where the set approaches the whole body, cite the resource once and drop the anchors. A section citation delivers only that heading's span, so any dependency the section reader still needs — including operative framing and shared keys — is authored inside a section per [Resources at the Abstract Level; Split for Section Delivery](#30-resources-at-the-abstract-level-split-for-section-delivery). This is the citation half of the section-or-whole economy, whose structural half is that principle — a resource is split so its sections are deliverable, and cited at the grain it was split for. Avoids `whole-resource-for-one-section` and `framing-outside-any-section`.

## 33. Pre-Session Prose Stands Alone

Prose delivered before the framework that resolves references exists must be executable from itself: every instruction complete in the text, and every value it names either supplied there or obtained by a call the text spells out. A canonical name may appear as a label for a home the reader reaches later, never as the only place an instruction lives. A bounded exception to [One Authoritative Home](#6-one-authoritative-home) — elsewhere citing the home rather than restating it is the right economy, and on this surface the same economy strands the reader. Avoids `pre-session-prose-defers-to-the-framework`.

## 34. SOLID at the Definition Layer

A definition is a contract between constructs, so the five principles that govern code contracts govern it. **Single responsibility** — a construct holds one job and changes for one reason ([One Authoritative Home](#6-one-authoritative-home), [Atomic Techniques; Compose at Activities](#26-atomic-techniques-compose-at-activities)). **Open to extension, closed to modification** — a surface other work is calibrated or validated against, such as a schema or a measured prompt, gains a consumer's need through the construct that wraps it ([Prefer Shared Capability](#18-prefer-shared-capability)). **Substitutability** — a definition that declares a shared contract is usable wherever that contract is expected, so a consumer binds the contract and not the particular definition that satisfied it today. **Interface segregation** — a consumer declares and receives the slice it uses, and no more ([Cite Resources at Section Grain](#32-cite-resources-at-section-grain)). **Dependency inversion** — prose and bindings depend on the home that owns a fact, never on a copy of it ([Cite Resource Policy; Do Not Restate It](#29-cite-resource-policy-do-not-restate-it), [Maximize Schema Expressiveness](#5-maximize-schema-expressiveness)).

The test a change runs against itself: name every file a later extension of this contract would force an edit to. A file that must change only to keep agreeing — a restated count, a duplicated field list, a copied criteria set — is coupled to content it does not own, and the citation is what survives removing the copy.

## 35. Prefer Removing the Thing That Needs a Prohibition

Prose warning against a path — *do not also use X*, *never combine this with Y* — usually means two constructs now do one job. Retire one and the warning has nothing left to say, along with the validation and carve-outs that existed only to police the overlap. Where both paths must survive, the prohibition names the home that owns the surviving behaviour rather than restating it.
