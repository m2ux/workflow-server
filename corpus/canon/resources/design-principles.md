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

**Fires on:** `workflow`, `activity`, `technique`, `routine`

A repeated procedure is a durable graph of activities. A circumstance has its own graph and rules; techniques and routines stay portable across graphs. The graph comes from repeated success in this practice, or from an external procedure already held as such. Novelty is a design update, or work outside the graph. Which construct holds one application is [A Routine Holds the Codified Path](#42-a-routine-holds-the-codified-path).

## 2. Internalize Before Producing

**Fires on:** `*`

Read the construct model — Goal, Workflow, Activity, Technique, Routine — the schema boundary, and the conventions already in the tree before writing content.

## 3. Define Complete Scope Before Execution

**Fires on:** `*`

List every file to create, modify, or remove, including the session edit root at `{target_path}`, before starting, and check that list again before claiming the work done.

## 4. Clarify Before Assuming

**Fires on:** `*`

When the request admits materially different interpretations, ask one question before acting.

## 5. Maximize Schema Expressiveness

**Fires on:** `workflow`, `activity`, `technique`, `routine`

Use the most specific construct the schema provides. A prose field (`description`, `outcome`, and their equivalents) states what the construct is, and does not restate structure the schema already holds.

## 6. One Authoritative Home

**Fires on:** `*`

Each operative fact has one statement. Resources hold fill and consult: templates, vocabularies, criteria, policy. Protocol holds cadence and how. Other layers cite that statement. A repeated copy exists only where delivery would not carry the statement, and that copy is not a second text to edit.

## 7. Convention Over Invention

**Fires on:** `*`

Search existing naming, field order, and structure before introducing a pattern.

## 8. Confirm Before Irreversible Changes

**Fires on:** `*`

A semi-reversible or irreversible change waits for explicit confirmation that includes the impact.

## 9. Encode Constraints as Structure

**Fires on:** `activity.steps`, `activity.exits`, `workflow.rules`, `activity.rules`, `technique.rules`

A critical constraint is a checkpoint, a condition, a validate action, or an exit `when`. Rule text does not enforce it.

## 10. Non-Destructive Updates

**Fires on:** `*`

Compare new content with what is there. A change that removes material names the removal and waits for explicit approval. A move that must keep an outcome is [A Relocation Records the Outcome It Keeps](#38-a-relocation-records-the-outcome-it-keeps).

## 11. Complete Documentation Structure

**Fires on:** `readme`

A workflow root, and each construct folder a reader can open, has a README that orients: purpose, flow, value, structure, and links. A parent README that already names that folder's files at file grain is that orientation.

## 12. Output Economy

**Fires on:** `technique.outputs`, `activity.steps`, `resource`

An artifact or a checkpoint states one fact for one declared audience, and links the home of every other fact.

## 13. Separate Contract from Procedure

**Fires on:** `technique.inputs`, `technique.outputs`, `technique.protocol`, `technique.rules`

On a technique, Inputs and Outputs state what the bound value is: meaning, shape, and allowed values. An Output may state how the value is recognised. Protocol states when and how, and refers to `{id}`. How attached to a value — a constraint, an order, a fallback, a side duty — is a Protocol step, or a Rule when it cuts across steps. A phase whose only work is projecting another output is not a phase.

## 14. Single Source of Truth

**Fires on:** `workflow.variables`, `activity.steps`, `technique.inputs`

Each fact of session state has one variable. Gates and technique inputs read that variable.

## 15. Phase by Sequenced Outcome

**Fires on:** `technique.protocol`

A Protocol phase is one outcome that finishes before the next begins, written as a `### N. Title` section with the work in bullets under it. Facets of that same outcome stay bullets. A partition that can be reordered or dropped without changing the sequence is not its own phase. What the heading is made of is [A Phase Heading Names the Outcome](#39-a-phase-heading-names-the-outcome).

## 16. Distinguish Designators from Parameters

**Fires on:** `technique.protocol`

In Protocol, a declared value is `{id}`, a technique argument name is italic, and the argument list sits in parentheses on the technique reference. Argument names stay out of braces and backticks.

## 17. Document in Positive Present

**Fires on:** `workflow.description`, `activity.description`, `activity.outcome`, `activity.steps[].options`, `readme`

Definition prose — `description`, `outcome`, option text, and README orientation for the defined workflow — states what the system is or does, in declarative present tense.

## 18. Prefer Shared Capability

**Fires on:** `activity.steps`, `activity.techniques`, `workflow.techniques`, `technique`

When a shared technique already owns a capability, the activity binds that technique, or borrows an activity that already binds it. A local recipe exists when the shared surface cannot absorb the caller's diversity. Where the work runs is [Fan-Out Lives at the Layer That Runs the Work](#40-fan-out-lives-at-the-layer-that-runs-the-work).

## 19. Name Symbols Affirmatively

**Fires on:** `technique.inputs`, `technique.outputs`, `technique.rules`, `workflow.variables`, `activity.variables`

A symbol id states what the value is: affirmative, head noun last, `snake_case`. A boolean is a predicate, a collection is a plural, and an I/O id carries neither direction nor representation. A rule slug states a positive invariant when that is clearer than a negation.

## 20. Keep Orchestration in Structure

**Fires on:** `activity.steps`, `activity.exits`, `workflow.graph`, `technique.capability`, `technique.protocol`, `technique.rules`

An activity owns its stage, checkpoints, and exits, and the workflow graph binds each exit to what runs next. A technique produces values and durable evidence, and does not name the activity flow or the gates that consume its outputs.

## 21. Match the Harness Surface

**Fires on:** `technique`, `resource`, `readme`

Tool names, return shapes, and bootstrap paths in techniques and docs match the harness. Guidance about a tool's behaviour has one home. What a phase may claim about a response is [A Phase States Answers the Tool Has Returned](#41-a-phase-states-answers-the-tool-has-returned).

## 22. Modular Over Inline

**Fires on:** `workflow`, `activity`, `technique`, `resource`, `routine`

A construct lives in its own file. A parent references that file.

## 23. Close the Loop

**Fires on:** `*`

When implementation is in scope, a recommendation is followed by the action, or by an explicit stop.

## 24. Keep Session Interaction in Activities

**Fires on:** `technique`, `activity.steps`

A technique takes inputs, works over tools and resources, and emits outputs. An activity owns when and how those products reach a person: `action: message`, checkpoint `message` and `options`, and artifact links.

## 25. Bind Sibling Techniques as Steps

**Fires on:** `activity.steps`, `technique.protocol`

Multi-technique work lives in activity `steps[]`, checkpoints, and loops. Each sibling or shared technique is its own step. A technique Protocol applies tools and resources. Container I/O and rule merge is composition the loader performs.

## 26. A Technique Is a Reading

**Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `activity.steps`

A technique is the judgement a loop, branch, or gate cannot hold: how to orient a tool for this anatomy, how to read what came back, and how to recover when that is not what was expected. The tool schema owns the remaining parameters. The inputs name the situation the path applies to. A path that only calls the tool is the tool's own leaflet. A judgement that already has an endpoint or a step kind lives in that construct.

## 27. State Contract Contribution

**Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `technique.outputs`, `technique.rules`

Capability on a container `TECHNIQUE.md` names the shared Inputs, Outputs, Rules, or domain invariants the contract contributes. Its Protocol, where it has one, is its own and reaches no descendant. Loader composition lives in [Base-contract inheritance](/meta/resources/workflow-canonical.md#base-contract-inheritance).

## 28. Creation Guide for Generated Documents

**Fires on:** `resource`, `technique.protocol`

Every planning artifact a workflow persists has a creation-guide resource with a `## Template` section and operative `## Rules` for filling it. The persisting technique cites that template. A shared shape may share one guide. Every bare filename still maps to a guide.

## 29. Cite Resource Policy; Do Not Restate It

**Fires on:** `resource`, `technique.protocol`

A resource owns vocabulary, criteria, and how fields are represented or matched. Protocol operates on the semantic fields and cites the section: link text is the section title, and the URL includes the `#` anchor. Representation of a consult surface can change without a Protocol change when the fields are unchanged.

## 30. Resources Stay Abstract

**Fires on:** `resource`, `technique`, `activity`

A resource names a kind of artifact, the role a variable plays, and a template skeleton with placeholders. Concrete filenames, variable bindings, and per-run instances belong to the technique and the activity that binds them. How a resource is split for delivery is [A Resource Splits for Section Delivery](#44-a-resource-splits-for-section-delivery).

## 31. Isolate Conditional Branches as Notes

**Fires on:** `technique.protocol`

Inside a Protocol step, the unconditional instruction is the bullet, and each *when* / *if* / *otherwise* branch is a `>` note under it. A note with two or more items gives each a bullet, written `  > - When …`. A lone caveat is the note's prose. A line opening with `>` is not a step. A condition that selects a step, an activity, or a path is [Encode Constraints as Structure](#9-encode-constraints-as-structure).

## 32. Cite Resources at Section Grain

**Fires on:** `technique`, `activity`, `resource`, `readme`

A citation names the narrowest section that carries what the prose needs. The path after `resources/`, with `.md` stripped and any `#anchor` kept, is the unit loaded. The bare resource is the citation when the consumer reads the whole body. Every distinct citation is delivered, so a bare citation beside anchored ones sends the file and the sections. Where several sections are needed, cite each anchor. Where the set is most of the body, cite the resource once.

## 33. Pre-Session Prose Stands Alone

**Fires on:** `resource`

Prose delivered before references can be resolved is executable from its own text. Every instruction is complete there, and every value it names is supplied there or obtained by a call the text spells out. A canonical name may label a home the reader reaches later. On this surface that label is not the only place the instruction lives. Elsewhere, citing the home is [One Authoritative Home](#6-one-authoritative-home).

## 34. Edit the Owner

**Fires on:** `*`

Name every file a later extension of a contract would force an edit to. A file that must change only to keep agreeing — a restated count, a duplicated field list, a copied criteria set — is coupled to content it does not own. The citation is what remains when the copy is removed.

## 35. Prefer Removing the Thing That Needs a Prohibition

**Fires on:** `*`

A warning against a second path means two constructs do one job. Retire one, and the warning, the validation, and the carve-outs that policed the overlap go with it. Where both paths remain, the prohibition names the home that owns the surviving behaviour.

## 36. A Technique Names Only What Its Reader Holds

**Fires on:** `technique`

A technique arrives as its own text and its inherited rules. A name in that text — a technique, or a rule slug — is a name the delivery carries: the technique's own rules, every container it sits beneath, and the contracts of the scopes a role's bundle names. A rule from another library is named at its full dotted address. A fact the technique needs is in its own text, or stated plainly. A choice between two techniques belongs to the container that holds both, phrased so it needs no reference.

## 37. An I/O Contract Names the Value

**Fires on:** `technique.inputs`, `technique.outputs`

An Input or Output describes what the value is. It does not name which caller, activity, or workflow produces or consumes it.

## 38. A Relocation Records the Outcome It Keeps

**Fires on:** `activity.steps`, `activity.exits`, `technique`, `workflow.rules`, `activity.rules`, `technique.rules`

A restructuring that removes a gate, re-routes an exit, relocates a technique, or collapses a rule into another home names the outcome, option, input, or audience that still holds, and the check that confirms it.

## 39. A Phase Heading Names the Outcome

**Fires on:** `technique.protocol`

A phase heading is two or three words in Title Case, with the articles dropped. It names the outcome. Past four words it carries the bullet's detail. A heading that only repeats its bullet is a phase with no outcome of its own.

## 40. Fan-Out Lives at the Layer That Runs the Work

**Fires on:** `workflow.graph`, `activity.steps`, `technique`

Fan-out belongs to the layer that runs the work. Several workers, or one activity over a collection, is a graph destination that names them, gathered at the activity they converge on. Work units inside one worker are a `forEach` loop step, with the meta [`orchestration-patterns`](/meta/techniques/orchestration-patterns/TECHNIQUE.md) techniques for the split and the gather.

## 41. A Phase States Answers the Tool Has Returned

**Fires on:** `technique.protocol`

A schema settles the call. What a Protocol does with a response — the branch it takes, the emptiness it reads as absence, the name it expects to resolve — states answers the tool has returned on a real subject.

## 42. A Routine Holds the Codified Path

**Fires on:** `routine`, `technique`, `activity`

Where an application is still free-form, it is a technique. Where the path is accepted and consistent, it is a routine: a named run of those produce paths, spliced into the activity that binds it, and the home for a sequence, an iteration, a branch, or a gate that several sites share. Its sources are the two in [Workflows Ossify Patterns](#1-workflows-ossify-patterns). The Protocol that remains is the reading that routine cannot hold ([A Technique Is a Reading](#26-a-technique-is-a-reading)).

## 43. A Workflow Borrows Activities

**Fires on:** `workflow.activities`

A workflow borrows another workflow's activity file, including the meta pattern library under [`meta/activities/patterns/`](/meta/activities/patterns/README.md) (supervisor, plan-and-execute, lead-researcher). The reference form is the one the [construct inventory](./schema-construct-inventory.md#compose-or-reuse-activities) states.

## 44. A Resource Splits for Section Delivery

**Fires on:** `resource`

A multi-part resource splits into per-category sections, each holding the fragment for one category, with the whole-document skeleton in its own section. Shared fragments — scales, mappings, reference tables — sit in one shared section. Operative framing, shared keys, and obligations a section reader needs live under a `##` heading an anchor can deliver. The consumer fetches the section it renders.

## 45. A Rule States One Invariant

**Fires on:** `technique.rules`

A `## Rules` entry states one constraint. A part that can be cited and edited on its own is its own entry.

## 46. A Consumer Binds the Contract

**Fires on:** `technique`, `activity`, `workflow`

A definition that declares a shared contract is usable wherever that contract is expected. The consumer binds the contract.

## 47. A Calibrated Surface Extends by Wrapping

**Fires on:** `technique`, `resource`

A surface other work is calibrated or validated against — a schema, a measured prompt — gains a consumer's need through the construct that wraps it.
