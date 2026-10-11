---
name: design-principles
description: Positive design-time prefer/before stance for workflow authoring. One invariant per heading.
metadata:
  order: 0
  legacy_id: 0
---

# Overview

Fundamental design principles for workflow design-time authoring. Each heading is one invariant: a *prefer / before / only after* stance. A citation of the heading is a citation of that invariant. A heading's Fires-on line follows the [Fires-on line](./anti-patterns.md#fires-on-line) rule.

A principle is broader than any one defect. Specific bad instances are catalogued in [anti-patterns](./anti-patterns.md). Together with that catalog and the schema construct inventory, these are the **workflow-design canon** for design-time authoring.

Ordinals are stable. A new invariant is appended.

---

## 1. Workflows Ossify Patterns

A repeated procedure is a durable graph of activities. A circumstance has its own graph and rules; techniques and routines stay portable across graphs. The graph comes from repeated success in this practice, or from an external procedure already held as such. Novelty is a design update, or work outside the graph. Which construct holds one application is [A Routine Holds the Codified Path](#42-a-routine-holds-the-codified-path).

**Fires on:** `workflow`, `activity`, `technique`, `routine`

## 2. Internalize Before Producing

Read the construct model — Goal, Workflow, Activity, Technique, Routine — the schema boundary, and the conventions already in the tree before writing content.

**Fires on:** `*`

## 3. Define Complete Scope Before Execution

List the intended files to create, modify, or remove, including the session edit root at `{target_path}`, before their dependent edits. A dependency discovered later joins that list before it is changed, within the approved scope. A material scope or authority change resolves before dependent work, and the list is reconciled before the work is claimed done.

**Fires on:** `*`

## 4. Clarify Before Assuming

When unresolved interpretations materially change the outcome, scope, authority, or acceptance test, ask one question and wait for its answer before dependent action. An existing explicit instruction resolves the choices it covers, and independent investigation continues meanwhile.

**Fires on:** `*`

## 5. Maximize Schema Expressiveness

Use the most specific construct the schema provides. A prose field (`description`, `outcome`, and their equivalents) states what the construct is, and does not restate structure the schema already holds.

**Fires on:** `workflow`, `activity`, `technique`, `routine`

## 6. One Authoritative Home

Each operative fact has one statement. Resources hold fill and consult: templates, vocabularies, criteria, policy. Protocol holds cadence and how. Other layers cite that statement. A repeated copy exists only where delivery would not carry the statement; it has an identifiable canonical source, is updated from that source, and is not a second text to edit.

**Fires on:** `*`

## 7. Convention Over Invention

Search existing naming, field order, and structure before introducing a pattern.

**Fires on:** `*`

## 8. Confirm Before Irreversible Changes

A change whose reversal cannot restore the prior state, requires another party, or incurs material loss has explicit approval covering its target and impact before execution. That approval stays effective for the same target and impact; a material change to either takes a new decision.

**Fires on:** `*`

## 9. Encode Constraints as Structure

A constraint designated as a required execution or acceptance boundary is enforced by a checkpoint, a condition, a validate action, or an exit `when`, so that a rejection or missing required evidence cannot reach the prohibited operation or accepted completion. The predicate and its failure route are identified in the structure that owns them. Rule text does not enforce it.

**Fires on:** `activity.steps`, `activity.exits`, `workflow.rules`, `activity.rules`, `technique.rules`

## 10. Non-Destructive Updates

Compare new content with what is there. Identify the removed material and verify that explicit approval covers that removal. A move that must keep an outcome is [A Relocation Records the Outcome It Keeps](#38-a-relocation-records-the-outcome-it-keeps).

**Fires on:** `*`

## 11. Complete Documentation Structure

A workflow root, and each construct folder a reader can open, has a README that orients: purpose, flow, value, structure, and links. A parent README that already names that folder's files at file grain is that orientation.

**Fires on:** `readme`

## 12. Output Economy

An artifact has one declared audience and one coherent purpose: it owns the facts produced for that purpose and links the facts owned elsewhere. A checkpoint presents one decision subject with the context needed to decide it.

**Fires on:** `technique.outputs`, `activity.steps`, `resource`

## 13. Separate Contract from Procedure

On a technique, Inputs and Outputs state what the bound value is: meaning, shape, and allowed values. An Output may state how the value is recognised. Protocol states when and how, and refers to `{id}`. How attached to a value — a constraint, an order, a fallback, a side duty — is a Protocol step, or a Rule when it cuts across steps. A phase whose only work is projecting another output is not a phase.

**Fires on:** `technique.inputs`, `technique.outputs`, `technique.protocol`, `technique.rules`

## 14. Single Source of Truth

Each fact of session state has one variable. Gates and technique inputs read that variable.

**Fires on:** `workflow.variables`, `activity.steps`, `technique.inputs`

## 15. Phase by Sequenced Outcome

A Protocol phase is one outcome that finishes before the next begins, written as a `### N. Title` section with the work in bullets under it. Facets of that same outcome stay bullets. A partition that can be reordered or dropped without changing the sequence is not its own phase. What the heading is made of is [A Phase Heading Names the Outcome](#39-a-phase-heading-names-the-outcome).

**Fires on:** `technique.protocol`

## 16. Distinguish Designators from Parameters

In Protocol, a declared value is `{id}`. Argument names stay out of braces and backticks; a binding site names them in the schema the bind uses.

**Fires on:** `technique.protocol`

## 17. Document in Positive Present

Definition prose — `description`, `outcome`, option text, and README orientation for the defined workflow — states what the system is or does, in declarative present tense.

**Fires on:** `workflow.description`, `activity.description`, `activity.outcome`, `activity.steps[].options`, `readme`

## 18. Prefer Shared Capability

When a shared technique already owns a capability, the activity binds that technique, or borrows an activity that already binds it. Compare the caller's required inputs, outputs and guarantees with that contract, identifying the requirement in the existing design evidence: a missing configurable value is closed at the shared owner, while a genuinely incompatible capability or contract keeps a local recipe with a truthful boundary. Where the work runs is [Fan-Out Lives at the Layer That Runs the Work](#40-fan-out-lives-at-the-layer-that-runs-the-work).

**Fires on:** `activity.steps`, `activity.techniques`, `workflow.techniques`, `technique`

## 19. Name Symbols Affirmatively

A symbol id identifies its value affirmatively, and the type-specific forms make that meaning explicit: a boolean is a predicate, a collection is a plural, and an I/O id carries neither direction nor representation. Exact case, plurality, and spelling are `snake-case-symbols` and `io-id-shape`. A rule slug states a positive invariant when that is clearer than a negation.

**Fires on:** `technique.inputs`, `technique.outputs`, `technique.rules`, `workflow.variables`, `activity.variables`

## 20. Keep Orchestration in Structure

An activity owns its stage, checkpoints, and exits, and the workflow graph binds each exit to what runs next. A technique produces values and durable evidence, and does not name the activity flow or the gates that consume its outputs.

**Fires on:** `activity.steps`, `activity.exits`, `workflow.graph`, `technique.capability`, `technique.protocol`, `technique.rules`

## 21. Match the Harness Surface

Tool names, return shapes, and bootstrap paths in techniques and docs match the harness. Guidance about a tool's behaviour has one home. What a phase may claim about a response is [A Phase States Answers the Tool Has Returned](#41-a-phase-states-answers-the-tool-has-returned).

**Fires on:** `technique`, `resource`, `readme`

## 22. Modular Over Inline

A separately referenceable definition lives in its own file, and its parent references it. The fields and steps the schema owns inline remain on that parent.

**Fires on:** `workflow`, `activity`, `technique`, `resource`, `routine`

## 23. Close the Loop

When implementation is in scope, a recommendation is followed by the action, or by an explicit stop.

**Fires on:** `*`

## 24. Keep Session Interaction in Activities

A technique takes inputs, works over tools and resources, and emits outputs. Activities own in-session presentation and operator decisions: `action: message`, checkpoint `message` and `options`, and artifact links. A bound technique may perform a domain delivery operation through its owning tool, and the activity owns when that operation runs.

**Fires on:** `technique`, `activity.steps`

## 25. Bind Sibling Techniques as Steps

Sibling and shared techniques are bound as steps in the activity or routine that owns their sequence, each its own step among the checkpoints and loops. A technique Protocol applies tools and resources. Container I/O and rule merge is composition the loader performs.

**Fires on:** `activity.steps`, `technique.protocol`

## 26. A Technique Is a Reading

A technique is the judgement a loop, branch, or gate cannot hold: how to orient a tool for this anatomy, how to read what came back, and how to recover when that is not what was expected. The tool schema owns the remaining parameters. The inputs name the situation the path applies to. A path that only calls the tool is the tool's own leaflet. A judgement that already has an endpoint or a step kind lives in that construct.

**Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `activity.steps`

## 27. State Contract Contribution

Capability on a container `TECHNIQUE.md` names the shared Inputs, Outputs, Rules, or domain invariants the contract contributes. Its Protocol, where it has one, is its own and reaches no descendant. Loader composition lives in [Base-contract inheritance](/meta/resources/workflow-canonical.md#base-contract-inheritance).

**Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `technique.outputs`, `technique.rules`

## 28. Creation Guide for Generated Documents

A planning document whose content a technique authors or fills has a creation-guide resource with a `## Template` section and operative `## Rules` for filling it, which the persisting technique cites. A byte-exact capture or producer-defined evidence format cites its producer or format contract and preserves its bytes, needing no competing layout template. Structured authored planning data still has operative filling criteria, even where a schema validates its shape. A shared shape may share one guide, and every bare filename still maps to a guide.

**Fires on:** `resource`, `technique.protocol`

## 29. Cite Resource Policy; Do Not Restate It

A resource owns vocabulary, criteria, and how fields are represented or matched. Protocol operates on the semantic fields and cites the section: link text is the section title, and the URL includes the `#` anchor. Representation of a consult surface can change without a Protocol change when the fields are unchanged.

**Fires on:** `resource`, `technique.protocol`

## 30. Resources Stay Abstract

A resource names a kind of artifact, the role a variable plays, and a template skeleton with placeholders. Concrete filenames, variable bindings, and per-run instances belong to the technique and the activity that binds them. How a resource is split for delivery is [A Resource Splits for Section Delivery](#44-a-resource-splits-for-section-delivery).

**Fires on:** `resource`, `technique`, `activity`

## 31. Isolate Conditional Branches as Notes

Inside a Protocol step, the unconditional instruction is the bullet, and each *when* / *if* / *otherwise* branch is a `>` note under it. A note with two or more items gives each a bullet, written `  > - When …`. A lone caveat is the note's prose. A line opening with `>` is not a step. A condition that selects a step, an activity, or a path is [Encode Constraints as Structure](#9-encode-constraints-as-structure).

**Fires on:** `technique.protocol`

## 32. Cite Resources at Section Grain

A citation names the narrowest section that carries what the prose needs. The path after `resources/`, with `.md` stripped and any `#anchor` kept, is the unit loaded. The bare resource is the citation when the consumer reads the whole body. Every distinct citation is delivered, so a bare citation beside anchored ones sends the file and the sections. Where several sections are needed, cite each anchor. Where the set is most of the body, cite the resource once.

**Fires on:** `technique`, `activity`, `resource`, `readme`

## 33. Pre-Session Prose Stands Alone

Prose delivered before references can be resolved is executable from its own text. Every instruction is complete there, and every value it names is supplied there or obtained by a call the text spells out. A canonical name may label a home the reader reaches later. On this surface that label is not the only place the instruction lives. Elsewhere, citing the home is [One Authoritative Home](#6-one-authoritative-home).

**Fires on:** `resource`

## 34. Edit the Owner

Name every file a later extension of a contract would force an edit to. A file that must change only to keep agreeing — a restated count, a duplicated field list, a copied criteria set — is coupled to content it does not own. The citation is what remains when the copy is removed.

**Fires on:** `*`

## 35. Prefer Removing the Thing That Needs a Prohibition

Where a prohibition distinguishes paths that serve the same required capability under the same preconditions, authority, and lifecycle, two constructs do one job: choose one owner and retire the duplicate, and the warning, the validation, and the carve-outs that policed the overlap go with it. Preserve an intentional difference, and let the prohibition name the owner of each behaviour.

**Fires on:** `*`

## 36. A Technique Names Only What Its Reader Holds

A technique arrives as its own text and its inherited rules. A name in that text — a technique, or a rule slug — is a name the delivery carries: the technique's own rules, every container it sits beneath, and the contracts of the scopes a role's bundle names. A rule from another library is named at its full dotted address; a qualified address identifies its owner, and the reader must also receive the operative fact. A required fact is in the technique, in its delivered contracts, or in a resource section delivered or fetched before use. A choice between two techniques belongs to the container that holds both, phrased so it needs no reference.

**Fires on:** `technique`

## 37. An I/O Contract Names the Value

An Input or Output describes what the value is. It does not name which caller, activity, or workflow produces or consumes it.

**Fires on:** `technique.inputs`, `technique.outputs`

## 38. A Relocation Records the Outcome It Keeps

A restructuring that removes a gate, re-routes an exit, relocates a technique, or collapses a rule into another home names the outcome, option, input, or audience that still holds, and the check that confirms it.

**Fires on:** `activity.steps`, `activity.exits`, `technique`, `workflow.rules`, `activity.rules`, `technique.rules`

## 39. A Phase Heading Names the Outcome

A phase heading is two or three words in Title Case, with the articles dropped. It names the outcome. More than three words carries detail that belongs in the bullet. A heading that only repeats its bullet is a phase with no outcome of its own.

**Fires on:** `technique.protocol`

## 40. Fan-Out Lives at the Layer That Runs the Work

Fan-out belongs to the layer that runs the work. Several workers, or one activity over a collection, is a graph destination that names them, gathered at the activity they converge on. Work units inside one worker are a `forEach` loop step, with the meta [`orchestration-patterns`](/meta/techniques/orchestration-patterns/TECHNIQUE.md) techniques for the split and the gather.

**Fires on:** `workflow.graph`, `activity.steps`, `technique`

## 41. A Phase States Answers the Tool Has Returned

A schema settles the call. What a Protocol does with a response — the branch it takes, the emptiness it reads as absence, the name it expects to resolve — identifies its evidence: a captured live response, or an authoritative response contract with a representative fixture. A claim that the tool has returned a response takes observation; contract-backed but unobserved recovery is labelled as such.

**Fires on:** `technique.protocol`

## 42. A Routine Holds the Codified Path

Where an application is still free-form, it is a technique. Where the path is accepted and consistent, it is a routine: a named run of those produce paths, spliced into the activity that binds it, and the home for a sequence, an iteration, a branch, or a gate that several sites share. Its sources are the two in [Workflows Ossify Patterns](#1-workflows-ossify-patterns). The Protocol that remains is the reading that routine cannot hold ([A Technique Is a Reading](#26-a-technique-is-a-reading)).

**Fires on:** `routine`, `technique`, `activity`

## 43. A Workflow Borrows Activities

A workflow borrows another workflow's activity file, including the meta pattern library under [`meta/activities/patterns/`](/meta/activities/patterns/README.md) (supervisor, plan-and-execute, lead-researcher). The preference it serves is [Prefer Shared Capability](#18-prefer-shared-capability), and the reference form is the one the [construct inventory](./schema-construct-inventory.md#compose-or-reuse-activities) states.

**Fires on:** `workflow.activities`

## 44. A Resource Splits for Section Delivery

A multi-part resource splits into per-category sections, each holding the fragment for one category, with the whole-document skeleton in its own section. Shared fragments — scales, mappings, reference tables — sit in one shared section. Operative framing, shared keys, and obligations a section reader needs live under a `##` heading an anchor can deliver. Before applying a section, the consumer receives that section and every shared definition, rule, or template fragment it requires, named at the consumption site or as a fetched prerequisite. Loading a broader body is an optimisation that may not omit required context.

**Fires on:** `resource`

## 45. A Rule States One Invariant

A `## Rules` entry states one constraint. A part that can be cited and edited on its own is its own entry.

**Fires on:** `technique.rules`

## 46. A Consumer Binds the Contract

A definition advertising a shared contract accepts every input that contract admits, without stronger preconditions, and preserves its promised outputs, failure behaviour, and relevant effects. Consumers bind against those promises.

**Fires on:** `technique`, `activity`, `workflow`

## 47. A Calibrated Surface Extends by Wrapping

A surface other work is calibrated or validated against — a schema, a measured prompt — gains a consumer's need through the construct that wraps it.

**Fires on:** `technique`, `resource`
