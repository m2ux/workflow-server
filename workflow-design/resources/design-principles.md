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

## 2. Activities Coordinate; Techniques Endow

The abstraction model for authored content:

| Layer | Owns |
|-------|------|
| **Activity** (including borrowable pattern activities) | Mechanical coordination: step order, loops, concurrency as structure, wait-all before the next step, checkpoints, transitions, bag seeding, and aggregation of bound products. Reusable mid-phase coordination shapes live under [`meta/activities/patterns/`](../../meta/activities/patterns/README.md) (or a local activity that mirrors that spine). |
| **Technique** | Atomic capability: inputs → tools and resources → outputs. Endows what a bound step or dispatched worker *can produce*. May cite peer ops for documentation or single-capability work; multi-unit coordination and multi-op façades prefer activity composition. |
| **Resource** | Shared vocabulary, policy, unit-kind maps, and templates — consult, not dispatch. |
| **Workflow graph** | Which activities exist and how they connect at session scope; not mid-phase fan-out internals. |

**Placement test:** if deleting the prose or structure would break *who runs when*, *how many at once*, or *when results merge*, it belongs on an **activity** (or pattern activity). If it only changes *how one capability produces its product bag*, it belongs on a **technique**. If many authors need the same *names, criteria, or maps* without runtime order, it belongs on a **resource**.

Fan-out and worker dispatch — single or parallel — prefer activity coordination. Borrow or mirror a pattern activity before inventing a strategy technique whose Capability is scatter / wait-all / gather. Avoids `coordination-in-technique`, `pass-orchestration-in-technique`, `prose-based-dispatch-patterns`, and `technique-stage-agnostic`.

## 3. Internalize Before Producing

Demonstrate understanding of the conceptual model (Goal → Activity → operation), the layer map in [Activities Coordinate; Techniques Endow](#2-activities-coordinate-techniques-endow) (activity coordinates; technique endows; resource consults), schema-vs-runtime boundaries, inline-vs-modular distinctions, and existing conventions before producing any content. For any fan-out or worker dispatch, name the pattern activity or activity step spine before drafting technique Protocol.

## 4. Define Complete Scope Before Execution

Enumerate every file to create, modify, or remove before starting. Include the dedicated session edit root at `{target_path}`. Re-verify after completion.

## 5. Clarify Before Assuming

When user intent admits materially different interpretations, ask one clarifying question before acting.

## 6. Maximize Schema Expressiveness

Prefer the most specific formal construct the schema provides. Prose is only for `description` / `outcome` (and equivalent) fields that state WHAT without restating structure. Workflow `variables[].description` is one line only ([variable-description-one-line](./anti-patterns.md#ap-126-variable-description-one-line)). I/O contracts stay portable — describe what a value *is*, not which caller, activity, or workflow produces or consumes it.

## 7. One Authoritative Home

Operative criteria, reusable facts, and fill/consult content have exactly one home. Resources hold fill/consult (templates, vocabularies, criteria, policy tables); does (protocol, behavioural rules) lives outside resources — “does” means operational cadence and HOW, not normative criteria / vocabulary / policy matrices (those remain resource consult even when a technique Applies them). Other layers cite or walk the home — they do not re-author Detect, duplicate guidance, or invent pass inventories that drift from activity bind sites.

## 8. Convention Over Invention

Search for existing conventions before introducing new patterns. Use established naming, field ordering, and structural patterns.

## 9. Confirm Before Irreversible Changes

Classify changes by reversibility. Semi-reversible and irreversible changes require explicit confirmation with impact analysis.

## 10. Encode Constraints as Structure

Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not rule text alone.

## 11. Non-Destructive Updates

Compare new content against existing content. Flag any material being removed. Content-reducing updates require explicit user approval.

## 12. Complete Documentation Structure

Every workflow includes a README.md at the root and in each construct subfolder. READMEs orient (purpose, flow, value, structure, links). A completeness verdict over them names the enumeration that grounds it, not the instances inspected.

## 13. Output Economy

Design artifact contracts and checkpoints for the reader who must act on them — one canonical home per fact, declared human vs agent audience, exception-only status, lean templates, one close-out document, one decision per checkpoint, statement-form messages with artifact links where named.

## 14. Separate Contract from Procedure

On techniques, Inputs and Outputs are **bind contracts** — each declares *what* the bound value is (meaning, shape, allowed values; Outputs may include derivation/recognition criteria). Protocol orders *when* and *how* work runs and references `{id}`; it does not restate identity tables, and I/O descriptions do not carry HOW. Any how associated with an input or output — constraints, sequencing, fallbacks, side duties — migrates to a dedicated Protocol step (or a true cross-cutting Rule), not the I/O entry. Protocol also does not host trailing "Set …" phases for pure projections of another output.

## 15. Single Source of Truth

Each fact of session state has exactly one authoritative variable. Compare that source directly in gates and technique inputs rather than maintaining parallel derived shadows.

## 16. Phase by Sequenced Outcome

A Protocol index marks a distinct outcome that must complete before the next begins. Co-aspects of the same act — facets of one survey, constraints on one write, mode branches of one apply — stay as elaborating bullets under that phase. Topic partitions that can be reordered or dropped without changing the phase sequence do not get their own numbers.

## 17. Distinguish Designators from Parameters

In technique Protocol, declared values use braced designators (`{id}`); operation argument names are italicised (*arg*); argument lists attach in parentheses on the op reference. Keep argument names out of the brace and backtick namespaces reserved for values and code tokens.

## 18. Document in Positive Present

Definition prose (`description`, `outcome`, option text, README orientation for the defined workflow) states what the system *is* or *does* in positive declarative present tense — not avoidance or comparative framing against a prior design. Where a technique must bound its scope, prefer a bare negation of excluded verbs; a peer cite is allowed when it clarifies a real capability boundary without turning the body into activity-graph narration.

## 19. Prefer Shared Capability

When a meta or shared-workflow technique already owns a capability, reuse it by binding that op from an activity (or borrowing an activity that already binds it). Invent a parallel local recipe only after the shared surface cannot absorb the caller's diversity. For mid-phase fan-out and consolidate — agent workers or same-context process units — prefer borrowable [`meta/activities/patterns/`](../../meta/activities/patterns/README.md) first; those activities bind the capability ops. Local spawn / merge recipes only after the pattern library cannot absorb the caller's diversity. See [Activities Coordinate; Techniques Endow](#2-activities-coordinate-techniques-endow).

## 20. Name Symbols Affirmatively

Symbol ids state what the value *is* in affirmative, head-noun-last `snake_case`: booleans as predicates, collections as plural item nouns, I/O without direction or representation encoding. Rule slugs state a positive invariant when clearer than bare negation.

## 21. Keep Orchestration in Structure

Activities own stage, checkpoints, transitions, graph progress, and multi-unit coordination. Techniques stay stage-agnostic and **activity-blind**: they take inputs, process over tools and resources, and emit outputs — they do not name activities, "binding activity", sibling steps, or the gates that consume their outputs. Composition of techniques lives only in activity structure (`steps[]`, `when`, loops, transitions). See [Activities Coordinate; Techniques Endow](#2-activities-coordinate-techniques-endow). Avoids `technique-stage-agnostic`.

## 22. Match the Harness Surface

Tool names, return shapes, and bootstrap paths in techniques and docs match the actual harness surface. Behavioural guidance about tools lives in one authoritative place; do not invent parallel recipes or incomplete hop chains.

## 23. Modular Over Inline

Constructs live in their own files. Parents reference siblings; they do not embed activity, technique, or resource bodies inline.

## 24. Close the Loop

When implementation is in scope, a recommendation is followed by action or an explicit stop gate — analysis alone is not the terminal deliverable.

## 25. Keep Session Interaction in Activities

Techniques are session-blind: take inputs, process over tools and resources, and emit outputs. They do not know about user sessions or how to interact with humans. Activities are session-aware — they own when and how technique products reach the user (`action: message`, checkpoint `message` / `options`, artifact links).

## 26. Bind Sibling Operations as Steps

All multi-technique **composition for work** lives in activity `steps[]` (and checkpoints/loops) when the edge is a multi-op façade or multi-unit coordination. Bind each already-defined sibling or shared operation as its own activity step rather than a Protocol Apply chain that only sequences peers. A technique owns one capability's produce path; it may cite peer ops for documentation or single-capability work (`canonical-technique-reference`). Loader ancestor wrap (`Initial`/`Final`) and container I/O merge are platform composition. Prefer activity binds over Protocol Apply façades (`pass-orchestration-in-technique`).

## 27. Atomic Techniques; Compose at Activities

Techniques are small, relatively atomic capabilities: a short produce path over tools and resources, without complex conditional/branching orchestration and without multi-op Protocol façades that only sequence peers for work. Activities are the preferred composition layer — they bind techniques (and checkpoints/loops) into useful work. Activity→activity composition is allowed: borrow, bind, or include activities to reuse standalone orchestration patterns — including the meta pattern library under [`meta/activities/patterns/`](../../meta/activities/patterns/README.md). Technique→technique cites (documentation, single-capability invoke the server will resolve) are permitted; multi-unit dispatch, wait-all, or gather of peers still prefers **activity coordination** — borrow or mirror a pattern rather than mint a fan-out technique. Reuse a shared capability by binding it from an activity (or borrowing that activity) when the edge is composition; a leaf may still name the wrapping op it uses. See [Activities Coordinate; Techniques Endow](#2-activities-coordinate-techniques-endow). Avoids `pass-orchestration-in-technique`, `coordination-in-technique`.

## 28. State Contract Contribution

Capability on a container `TECHNIQUE.md` (workflow-root or group) names what shared Inputs, Outputs, Rules, or domain invariants the contract contributes. Shared Rules speak in domain predicates every inheritor can apply; they do not name, link, or carve out descendant ops that already inherit this contract — leaf Protocol owns leaf-only duty. Loader composition — inheritance merge, `Initial`/`Final` wrap, renumbering, folder-implied membership — lives in workflow-canonical and the schema construct inventory, not in the contract's Capability. Avoids `container-names-inheriting-ops`, `capability-as-op-inventory`, `platform-semantics-in-capability`.

## 29. Creation Guide for Generated Documents

Every planning artifact a workflow persists has an associated creation-guide resource with a `## Template` section (and operative `## Rules` for how to fill it). Persist techniques cite that template; they do not invent layout in protocol prose. Shared shapes may share one guide; every bare filename still maps to a guide.

## 30. Cite Resource Policy; Do Not Restate It

Resources own vocabularies, criteria/policy, and how fields are represented or matched on consult surfaces. Technique Protocol operates on **semantic fields** and cites those sections in house style — e.g. `per [Section Title](../resources/example.md#section-title)` (link text is the section title; the URL includes the `#` anchor) — it does not re-author the vocabulary, policy matrix, or representation/matching rules. **Separation test:** representation or layout of a consult surface may change without Protocol change when the underlying fields are unchanged. This is the cite-don't-restate half of technique↔resource policy; it complements [One Authoritative Home](#7-one-authoritative-home) and [Creation Guide for Generated Documents](#29-creation-guide-for-generated-documents) without replacing either.

## 31. Resources at the Abstract Level; Split for Section Delivery

A resource treats artifact names and variables at the abstract level — the *kind* of artifact, the *role* a variable plays, the template skeleton with placeholders. Concrete artifact filenames, variable bindings, and the per-run instances of both are owned by the technique (and the activity that binds the variables). The resource describes the shape; the technique instantiates it. A resource does not name the concrete artifact files or variables a specific technique produces or consumes — that coupling belongs to the technique's I/O contract and Protocol. This is the abstraction-level half of [One Authoritative Home](#7-one-authoritative-home) and [Cite Resource Policy; Do Not Restate It](#30-cite-resource-policy-do-not-restate-it).

Split a multi-part resource into per-category sections, each carrying the fragment pertinent to one category (its table fragment, population rules, prefix), with any whole-document skeleton (header, per-category placeholders, footer) in its own section. The technique that renders one category fetches only its section (`get_resource { resource_id: "<resource>#<category-anchor>" }`); the consolidating step fetches only the skeleton section. No consumer loads the whole resource to read one category. Group shared fragments — scales, mappings, reference tables consulted across categories — under a single shared section, so a consumer fetches them as one unit rather than section-by-section. **Content a section-scoped reader depends on lives in a section** — operative framing, shared keys, and obligations the section consumer still needs sit under a `##` heading a `#anchor` can deliver (or move into the technique that depends on them), not only in a leading H1 span or in prose before any heading. This is the structural half of the section-or-whole economy — a resource's sections are its delivery units — and [Cite Resources at Section Grain](#33-cite-resources-at-section-grain) is the citation half that spends them.

## 32. Isolate Conditional Branches as Notes

Prose that applies on one path only is set apart from prose that always applies. Within a Protocol step, the unconditional instruction is the bullet and each *when* / *if* / *otherwise* branch is its own `>` note beneath it — one note per branch. A reader scanning the step then sees the shape of the work without evaluating every clause to learn which parts apply to their run, and the branch stays visually attached to the instruction it qualifies instead of reading as another thing to do.

Reach for structure first: a condition selecting a step, an activity, or a whole path is a `when`, a `condition`, or a declared decision, and belongs in the YAML. This stance governs only what legitimately remains in prose — a branch qualifying a single instruction, with no structural home. Prefer the note over a sibling bullet, and over an inline "if X then Y, otherwise Z" clause that buries the branch mid-sentence. Avoids `constraint-as-blockquote`; the structural alternatives are `checkpoint-not-prose`, `loop-not-prose`, and `decision-not-prose`.

## 33. Cite Resources at Section Grain

A citation is a delivery instruction. What it resolves to — the path after `resources/` with `.md` stripped and any `#anchor` kept — is the unit the server loads into the consumer's context, so `example.md#section-title` delivers one section where `example.md` delivers the file. A citation therefore names the narrowest section carrying what the citing prose needs. The bare resource is the citation for a consumer that reads the whole body: a filler working a `## Template` together with the `## Rules` that populate it, an audit walking every entry.

Grain is a property of the resource across the whole technique, not of one link. Every distinct citation is delivered, so a bare citation standing beside anchored ones sends the file *and* those sections, and the file's size counts against the eager budget that decides what else arrives. Where a technique needs several sections, cite each by anchor; where the set approaches the whole body, cite the resource once and drop the anchors. A section citation delivers only that heading's span, so any dependency the section reader still needs — including operative framing and shared keys — is authored inside a section per [Resources at the Abstract Level; Split for Section Delivery](#31-resources-at-the-abstract-level-split-for-section-delivery). This is the citation half of the section-or-whole economy, whose structural half is that principle — a resource is split so its sections are deliverable, and cited at the grain it was split for. Avoids `whole-resource-for-one-section` and `framing-outside-any-section`.

## 34. Prefer Parallel Independent Work via Formal Fan-Out

Prefer parallelising independent work where feasible, using **formal activity coordination** — borrow or mirror a pattern under [`meta/activities/patterns/`](../../meta/activities/patterns/README.md), or an equivalent local activity step spine — before inventing a free concurrent recipe in technique Protocol or Rules, and only after independence, shared-mutation safety, and host capacity are clear.

Coordination homes (unit-kind split):

| Unit kind | Coordination home (primary) | Capability leaves (bound by the activity) |
|-----------|----------------------------|---------------------------------------------|
| Agent instances / lens workers | Borrow or mirror [`01-orchestrator-workers`](../../meta/activities/patterns/01-orchestrator-workers.yaml) … [`05-lead-researcher`](../../meta/activities/patterns/05-lead-researcher.yaml) (see [patterns README](../../meta/activities/patterns/README.md)) | Atomic lens or domain ops; dispatch/gather capability ops only as **steps the activity owns** |
| Same-context process, shell, or tool units | Borrow or mirror [`06-process-unit-fan-out`](../../meta/activities/patterns/06-process-unit-fan-out.yaml) (see [patterns README](../../meta/activities/patterns/README.md)), or compose the same spine locally (unit roster → coordinate suite → pure combine) | Single-invocation process/tool ops; pure combine techniques over already-gathered unit results |

Serial execution remains correct when units depend on each other, share mutable state that concurrency would race, or the host cannot absorb concurrent load — not as the default when independence is already clear. Domain envelopes (resource budgets, backoff, product-specific composition) are step inputs and adjacent steps on the activity that coordinates the suite; the **activity** owns ordered scatter, wait-all, and ordered gather. Technique definition prose stays activity-blind ([Keep Orchestration in Structure](#21-keep-orchestration-in-structure); `technique-stage-agnostic`). Fan-out prefers an activity home ([Activities Coordinate; Techniques Endow](#2-activities-coordinate-techniques-endow); `coordination-in-technique`). Peer technique cites remain allowed for documentation and single-capability work.

Avoids `prose-based-dispatch-patterns`, `coordination-in-technique`, `pass-orchestration-in-technique`, and `technique-stage-agnostic`. Complements [Prefer Shared Capability](#19-prefer-shared-capability) and [Maximize Schema Expressiveness](#6-maximize-schema-expressiveness).
