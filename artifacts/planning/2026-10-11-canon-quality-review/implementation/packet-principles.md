# Drafting packet: principles

Source revision: e70b44778f71d9d699f746f78a16b892531c82d3

## Owned source entries

Review address: DP-01

## 1. Workflows Ossify Patterns

A repeated procedure is a durable graph of activities. A circumstance has its own graph and rules; techniques and routines stay portable across graphs. The graph comes from repeated success in this practice, or from an external procedure already held as such. Novelty is a design update, or work outside the graph. Which construct holds one application is [A Routine Holds the Codified Path](#42-a-routine-holds-the-codified-path).

Review address: DP-02

## 2. Internalize Before Producing

Read the construct model — Goal, Workflow, Activity, Technique, Routine — the schema boundary, and the conventions already in the tree before writing content.

Review address: DP-03

## 3. Define Complete Scope Before Execution

List every file to create, modify, or remove, including the session edit root at `{target_path}`, before starting, and check that list again before claiming the work done.

Review address: DP-04

## 4. Clarify Before Assuming

When the request admits materially different interpretations, ask one question before acting.

Review address: DP-05

## 5. Maximize Schema Expressiveness

Use the most specific construct the schema provides. A prose field (`description`, `outcome`, and their equivalents) states what the construct is, and does not restate structure the schema already holds.

Review address: DP-06

## 6. One Authoritative Home

Each operative fact has one statement. Resources hold fill and consult: templates, vocabularies, criteria, policy. Protocol holds cadence and how. Other layers cite that statement. A repeated copy exists only where delivery would not carry the statement, and that copy is not a second text to edit.

Review address: DP-07

## 7. Convention Over Invention

Search existing naming, field order, and structure before introducing a pattern.

Review address: DP-08

## 8. Confirm Before Irreversible Changes

A semi-reversible or irreversible change waits for explicit confirmation that includes the impact.

Review address: DP-09

## 9. Encode Constraints as Structure

A critical constraint is a checkpoint, a condition, or a validate action. Rule text does not enforce it.

Review address: DP-10

## 10. Non-Destructive Updates

Compare new content with what is there. A change that removes material names the removal and waits for explicit approval. A move that must keep an outcome is [A Relocation Records the Outcome It Keeps](#38-a-relocation-records-the-outcome-it-keeps).

Review address: DP-11

## 11. Complete Documentation Structure

A workflow root, and each construct folder a reader can open, has a README that orients: purpose, flow, value, structure, and links. A parent README that already names that folder's files at file grain is that orientation.

Review address: DP-12

## 12. Output Economy

An artifact or a checkpoint states one fact for one declared audience, and links the home of every other fact.

Review address: DP-13

## 13. Separate Contract from Procedure

On a technique, Inputs and Outputs state what the bound value is: meaning, shape, and allowed values. An Output may state how the value is recognised. Protocol states when and how, and refers to `{id}`. How attached to a value — a constraint, an order, a fallback, a side duty — is a Protocol step, or a Rule when it cuts across steps. A phase whose only work is projecting another output is not a phase.

Review address: DP-14

## 14. Single Source of Truth

Each fact of session state has one variable. Gates and technique inputs read that variable.

Review address: DP-15

## 15. Phase by Sequenced Outcome

A Protocol phase is one outcome that finishes before the next begins, written as a `### N. Title` section with the work in bullets under it. Facets of that same outcome stay bullets. A partition that can be reordered or dropped without changing the sequence is not its own phase. What the heading is made of is [A Phase Heading Names the Outcome](#39-a-phase-heading-names-the-outcome).

Review address: DP-16

## 16. Distinguish Designators from Parameters

In Protocol, a declared value is `{id}`, a technique argument name is italic, and the argument list sits in parentheses on the technique reference. Argument names stay out of braces and backticks.

Review address: DP-17

## 17. Document in Positive Present

Definition prose — `description`, `outcome`, option text, and README orientation for the defined workflow — states what the system is or does, in declarative present tense.

Review address: DP-18

## 18. Prefer Shared Capability

When a shared technique already owns a capability, the activity binds that technique, or borrows an activity that already binds it. A local recipe exists when the shared surface cannot absorb the caller's diversity. Where the work runs is [Fan-Out Lives at the Layer That Runs the Work](#40-fan-out-lives-at-the-layer-that-runs-the-work).

Review address: DP-19

## 19. Name Symbols Affirmatively

A symbol id states what the value is: affirmative, head noun last, `snake_case`. A boolean is a predicate, a collection is a plural, and an I/O id carries neither direction nor representation. A rule slug states a positive invariant when that is clearer than a negation.

Review address: DP-20

## 20. Keep Orchestration in Structure

An activity owns stage, checkpoints, transitions, and graph progress. A technique produces values and durable evidence, and does not name the activity flow or the gates that consume its outputs.

Review address: DP-21

## 21. Match the Harness Surface

Tool names, return shapes, and bootstrap paths in techniques and docs match the harness. Guidance about a tool's behaviour has one home. What a phase may claim about a response is [A Phase States Answers the Tool Has Returned](#41-a-phase-states-answers-the-tool-has-returned).

Review address: DP-22

## 22. Modular Over Inline

A construct lives in its own file. A parent references that file.

Review address: DP-23

## 23. Close the Loop

When implementation is in scope, a recommendation is followed by the action, or by an explicit stop.

Review address: DP-24

## 24. Keep Session Interaction in Activities

A technique takes inputs, works over tools and resources, and emits outputs. An activity owns when and how those products reach a person: `action: message`, checkpoint `message` and `options`, and artifact links.

Review address: DP-25

## 25. Bind Sibling Techniques as Steps

Multi-technique work lives in activity `steps[]`, checkpoints, and loops. Each sibling or shared technique is its own step. A technique Protocol applies tools and resources. Container I/O and rule merge is composition the loader performs.

Review address: DP-26

## 26. A Technique Is a Reading

A technique is the judgement a loop, branch, or gate cannot hold: how to orient a tool for this anatomy, how to read what came back, and how to recover when that is not what was expected. The tool schema owns the remaining parameters. The inputs name the situation the path applies to. A path that only calls the tool is the tool's own leaflet. A judgement that already has an endpoint or a step kind lives in that construct.

Review address: DP-27

## 27. State Contract Contribution

Capability on a container `TECHNIQUE.md` names the shared Inputs, Outputs, Rules, or domain invariants the contract contributes. Its Protocol, where it has one, is its own and reaches no descendant. Loader composition lives in [Base-contract inheritance](/meta/resources/workflow-canonical.md#base-contract-inheritance).

Review address: DP-28

## 28. Creation Guide for Generated Documents

Every planning artifact a workflow persists has a creation-guide resource with a `## Template` section and operative `## Rules` for filling it. The persisting technique cites that template. A shared shape may share one guide. Every bare filename still maps to a guide.

Review address: DP-29

## 29. Cite Resource Policy; Do Not Restate It

A resource owns vocabulary, criteria, and how fields are represented or matched. Protocol operates on the semantic fields and cites the section: link text is the section title, and the URL includes the `#` anchor. Representation of a consult surface can change without a Protocol change when the fields are unchanged.

Review address: DP-30

## 30. Resources Stay Abstract

A resource names a kind of artifact, the role a variable plays, and a template skeleton with placeholders. Concrete filenames, variable bindings, and per-run instances belong to the technique and the activity that binds them. How a resource is split for delivery is [A Resource Splits for Section Delivery](#44-a-resource-splits-for-section-delivery).

Review address: DP-31

## 31. Isolate Conditional Branches as Notes

Inside a Protocol step, the unconditional instruction is the bullet, and each *when* / *if* / *otherwise* branch is a `>` note under it. A note with two or more items gives each a bullet, written `  > - When …`. A lone caveat is the note's prose. A line opening with `>` is not a step. A condition that selects a step, an activity, or a path is [Encode Constraints as Structure](#9-encode-constraints-as-structure).

Review address: DP-32

## 32. Cite Resources at Section Grain

A citation names the narrowest section that carries what the prose needs. The path after `resources/`, with `.md` stripped and any `#anchor` kept, is the unit loaded. The bare resource is the citation when the consumer reads the whole body. Every distinct citation is delivered, so a bare citation beside anchored ones sends the file and the sections. Where several sections are needed, cite each anchor. Where the set is most of the body, cite the resource once.

Review address: DP-33

## 33. Pre-Session Prose Stands Alone

Prose delivered before references can be resolved is executable from its own text. Every instruction is complete there, and every value it names is supplied there or obtained by a call the text spells out. A canonical name may label a home the reader reaches later. On this surface that label is not the only place the instruction lives. Elsewhere, citing the home is [One Authoritative Home](#6-one-authoritative-home).

Review address: DP-34

## 34. Edit the Owner

Name every file a later extension of a contract would force an edit to. A file that must change only to keep agreeing — a restated count, a duplicated field list, a copied criteria set — is coupled to content it does not own. The citation is what remains when the copy is removed.

Review address: DP-35

## 35. Prefer Removing the Thing That Needs a Prohibition

A warning against a second path means two constructs do one job. Retire one, and the warning, the validation, and the carve-outs that policed the overlap go with it. Where both paths remain, the prohibition names the home that owns the surviving behaviour.

Review address: DP-36

## 36. A Technique Names Only What Its Reader Holds

A technique arrives as its own text and its inherited rules. A name in that text — a technique, or a rule slug — is a name the delivery carries: the technique's own rules, every container it sits beneath, and the contracts of the scopes a role's bundle names. A rule from another library is named at its full dotted address. A fact the technique needs is in its own text, or stated plainly. A choice between two techniques belongs to the container that holds both, phrased so it needs no reference.

Review address: DP-37

## 37. An I/O Contract Names the Value

An Input or Output describes what the value is. It does not name which caller, activity, or workflow produces or consumes it.

Review address: DP-38

## 38. A Relocation Records the Outcome It Keeps

A restructuring that removes a gate, re-routes an exit, relocates a technique, or collapses a rule into another home names the outcome, option, input, or audience that still holds, and the check that confirms it.

Review address: DP-39

## 39. A Phase Heading Names the Outcome

A phase heading is two or three words in Title Case, with the articles dropped. It names the outcome. Past four words it carries the bullet's detail. A heading that only repeats its bullet is a phase with no outcome of its own.

Review address: DP-40

## 40. Fan-Out Lives at the Layer That Runs the Work

Fan-out belongs to the layer that runs the work. Several workers, or one activity over a collection, is a graph destination that names them, gathered at the activity they converge on. Work units inside one worker are a `forEach` loop step, with the meta [`orchestration-patterns`](/meta/techniques/orchestration-patterns/TECHNIQUE.md) techniques for the split and the gather.

Review address: DP-41

## 41. A Phase States Answers the Tool Has Returned

A schema settles the call. What a Protocol does with a response — the branch it takes, the emptiness it reads as absence, the name it expects to resolve — states answers the tool has returned on a real subject.

Review address: DP-42

## 42. A Routine Holds the Codified Path

Where an application is still free-form, it is a technique. Where the path is accepted and consistent, it is a routine: a named run of those produce paths, spliced into the activity that binds it, and the home for a sequence, an iteration, a branch, or a gate that several sites share. Its sources are the two in [Workflows Ossify Patterns](#1-workflows-ossify-patterns). The Protocol that remains is the reading that routine cannot hold ([A Technique Is a Reading](#26-a-technique-is-a-reading)).

Review address: DP-43

## 43. An Activity Reuses Activities

An activity may borrow, bind, or include another activity, including the meta pattern library under [`meta/activities/patterns/`](/meta/activities/patterns/README.md) (supervisor, plan-and-execute, lead-researcher).

Review address: DP-44

## 44. A Resource Splits for Section Delivery

A multi-part resource splits into per-category sections, each holding the fragment for one category, with the whole-document skeleton in its own section. Shared fragments — scales, mappings, reference tables — sit in one shared section. Operative framing, shared keys, and obligations a section reader needs live under a `##` heading an anchor can deliver. The consumer fetches the section it renders.

Review address: DP-45

## 45. A Rule States One Invariant

A `## Rules` entry states one constraint. A part that can be cited and edited on its own is its own entry.

Review address: DP-46

## 46. A Consumer Binds the Contract

A definition that declares a shared contract is usable wherever that contract is expected. The consumer binds the contract.

Review address: DP-47

## 47. A Calibrated Surface Extends by Wrapping

A surface other work is calibrated or validated against — a schema, a measured prompt — gains a consumer's need through the construct that wraps it.

## Reconciled recommendations affecting these entries

## AS-01

**Confirmed · correction · P2**

Scope: [AP-01 · no-inline-content](sources/anti-patterns.md#ap-01-no-inline-content), [AP-17 · bound-step-no-description](sources/anti-patterns.md#ap-17-bound-step-no-description), [DP-22 · Modular Over Inline](sources/design-principles.md#22-modular-over-inline).

**Assessment.** The open-ended construct clause and short-literal exception do not accurately bound schema-owned inline checkpoints and loops. This is a scope ambiguity, not a globally unsatisfiable file rule.

**Witness.** A newly authored inline checkpoint with message, options, and effects is a 'new construct ... authored inline' under AP-01, while AP-17 expressly says a checkpoint is inline in steps[]. The narrow reading limited to activity/technique/resource bodies avoids the conflict, so this is a scope ambiguity, not a proved contradiction under every reading.

**Suggested wording.** Replace Detect with: 'An activity, technique, or resource definition is embedded as a body in a parent where the schema represents that definition by a file reference.' Replace Do not flag with: 'Schema-owned inline forms, including checkpoint and loop steps, conditions, effects, and literal fields; references to separate definitions.' Remove the open-ended 'new construct' parenthesis. Align the scope of DP-22 with the same file-bearing construct boundary.

**Observing check.** Positive: An activity body pasted into a workflow field that expects an activity reference is flagged and extracted. Negative: A checkpoint with inline message/options and a loop with nested steps remain inline and are not flagged.

Evidence addresses: AP-01 lines 68–72; AP-17 lines 270–270; DP-22 lines 105–105.

[Original candidate](reviews/ap_structures/findings-01.json) · [Independent disposition](reconciliation/ap-02.json).

## AS-03

**Confirmed · correction · P1**

Scope: [AP-03 · no-partial-implementation](sources/anti-patterns.md#ap-03-no-partial-implementation), [AP-07 · scope-reverify-completion](sources/anti-patterns.md#ap-07-scope-reverify-completion), [AP-81 · verify-format-literacy](sources/anti-patterns.md#ap-81-verify-format-literacy), [DP-03 · Define Complete Scope Before Execution](sources/design-principles.md#3-define-complete-scope-before-execution).

**Assessment.** The detector explicitly treats every commit as whole-scope completion. Separate a validated interim checkpoint from delivery acceptance; the user has independently authorized incremental commits in this task.

**Witness.** An approved two-part change records a validated first part in an interim commit and keeps the second part openly in progress. No handoff or done claim occurs. AP-03 flags unfinished scope and requires completion before committing; AP-07 flags the commit despite its completion-focused title and Fix.

**Suggested wording.** AP-03 Detect: 'A deliverable is handed off or represented as complete while approved scope items remain unaddressed or are deferred without approval.' Do not flag: 'An explicitly partial deliverable, or an interim commit that keeps remaining scope open and makes no completion claim.' Fix: 'Complete the agreed deliverable or obtain and record a scope change before its completion claim.' AP-07 Detect: 'A completion claim or final handoff lacks item-by-item verification against the current scope manifest.' Keep AP-81 as the commit-validation check.

**Observing check.** Positive: A final 'done' report omits an agreed resource edit with no scope approval: both unfinished-work and missing-verification evidence can be recorded distinctly. Negative: A validated interim commit with the unfinished item still in progress is not treated as a completed deliverable.

Evidence addresses: AP-03 lines 90–96; AP-07 lines 142–148; AP-81 lines 1056–1060; DP-03 lines 29–29.

[Original candidate](reviews/ap_structures/findings-01.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-04

**Confirmed · correction · P2**

Scope: [AP-04 · no-invented-naming](sources/anti-patterns.md#ap-04-no-invented-naming), [DP-07 · Convention Over Invention](sources/design-principles.md#7-convention-over-invention).

**Assessment.** The conjunction accepts search without the approval demanded by Fix when no convention fits. New identifiers following a convention are not new conventions.

**Witness.** An author searches, finds no suitable convention, and adopts a new naming scheme without approval. Detect is false because search occurred, although Fix says the new convention needs approval. Conversely, a fresh id following established snake_case is not a new naming convention.

**Suggested wording.** Replace Detect with: 'A naming convention is adopted without checking whether an existing convention fits; or, after no existing convention fits, a new convention is adopted without the required approval.' Do not flag: 'New identifiers that follow an established convention; a genuinely new convention with its search and approval recorded.' Retain the existing Fix sequence.

**Observing check.** Positive: A search with no fit followed by an unapproved new filename scheme is flagged. Negative: A new task_results id using the established identifier convention is not flagged merely because the id is new.

Evidence addresses: AP-04 lines 102–108; DP-07 lines 45–45.

[Original candidate](reviews/ap_structures/findings-01.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-05

**Narrowed · improvement · P2**

Scope: [AP-09 · checkpoint-not-prose](sources/anti-patterns.md#ap-09-checkpoint-not-prose), [AP-11 · decision-not-prose](sources/anti-patterns.md#ap-11-decision-not-prose), [DP-26 · A Technique Is a Reading](sources/design-principles.md#26-a-technique-is-a-reading), [DP-31 · Isolate Conditional Branches as Notes](sources/design-principles.md#31-isolate-conditional-branches-as-notes).

**Assessment.** The introductory subjects already say user decision and cross-activity routing. Preserve them explicitly in Detect to prevent verb-only matching; local technique judgment is not intrinsically prohibited.

**Witness.** A technique says 'Choose the candidate whose returned evidence satisfies the criteria; if none does, return unresolved.' It makes a local output judgment, not a human decision or activity transition. Verb-based AP-09 and the unqualified 'paths' in AP-11 can nevertheless route it into checkpoints or graph branches.

**Suggested wording.** AP-09 Detect: 'Definition prose requires a person to decide, authorize, or confirm progress, but the activity has no checkpoint at that decision point.' AP-11 Detect: 'Prose selects the next activity or graph destination, but no declared activity decision or exit predicate represents that routing.' Add to both exceptions: 'A technique's local evidence interpretation or output selection that neither asks a person nor selects an activity/step.'

**Observing check.** Positive: 'Ask the user to approve publication before the publishing activity' without a checkpoint is flagged; prose selecting a next activity without declared routing is flagged. Negative: A local evidence branch producing one declared classification remains in the technique; an existing step condition remains structural.

Evidence addresses: AP-09 lines 170–176; AP-11 lines 194–200; DP-26 lines 121–121; DP-31 lines 141–141.

[Original candidate](reviews/ap_structures/findings-01.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-07

**Narrowed · correction · P2**

Scope: [AP-16 · technique-inputs-declared](sources/anti-patterns.md#ap-16-technique-inputs-declared), [AP-62 · bind-protocol-locals](sources/anti-patterns.md#ap-62-bind-protocol-locals), [AP-148 · inherited-input-re-declared](sources/anti-patterns.md#ap-148-inherited-input-re-declared), [DP-13 · Separate Contract from Procedure](sources/design-principles.md#13-separate-contract-from-procedure).

**Assessment.** Pinned implementation confirms that authored Markdown headings become parsed inputs[] and ancestor inputs compose into the effective signature. Familiar names are not proof of universal runtime supply. Static provenance acceptance and actual value availability remain distinct.

**Witness.** A Markdown technique has a correct ### target_path under ## Inputs, or receives that slot from its container. AP-16's literal Fix points the author at inputs[] rather than that representation. A leaf using ambient target_path without any local or merged entry is excused by AP-62 but appears missing under AP-16.

**Suggested wording.** AP-16: An externally supplied value belongs to the effective input signature or an explicitly documented delivery contract applicable to that technique. Author declarations as ### <id> under the owning ## Inputs; inputs[] is the parsed representation. Reuse inherited declarations. AP-62: distinguish effective I/O and evidenced runtime context before checking local producer/read order. Mark only an actual local producer with the local-binding sigil; an absent external supplier needs a declared contract, not a fictional local. Qualify target_path and branch_name by their actual supplying contract. See the pinned implementation check for precise replacement blocks and supported limits.

**Observing check.** Positive: An undeclared repository value with no merged or documented ambient supplier is flagged. Negative: A correctly declared or inherited input is accepted; a documented ambient input is accepted consistently by both rules.

Evidence addresses: AP-16 lines 254–260; AP-62 lines 820–824; AP-148 lines 1924–1928; DP-13 lines 69–69.

[Original candidate](reviews/ap_structures/findings-02.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-08

**Confirmed · correction · P1**

Scope: [AP-20 · rule-group-disambiguation](sources/anti-patterns.md#ap-20-rule-group-disambiguation), [AP-24 · no-contradictory-rules](sources/anti-patterns.md#ap-24-no-contradictory-rules), [AP-133 · overlapping-rule-scopes](sources/anti-patterns.md#ap-133-overlapping-rule-scopes), [DP-27 · State Contract Contribution](sources/design-principles.md#27-state-contract-contribution).

**Assessment.** Same-file or same-bucket tests miss incompatible inherited obligations that reach one reader. Group names settle the conflict only when they actually define disjoint applicability or precedence.

**Witness.** A container requires publication of raw records for every report; a leaf forbids publication of those same records for every report. Each local file/bucket is internally consistent, but the leaf's effective contract cannot satisfy both. Renaming the groups 'reporting' and 'privacy' leaves the same input subject to both rules.

**Suggested wording.** AP-24 Detect: 'Two rules in the effective delivered rule set apply to the same subject and state and require mutually exclusive behavior. Name that subject/state and both consequences.' Exception: 'Explicitly disjoint trigger conditions, or a named precedence/exception that makes the required behavior unique.' AP-20 Detect: 'Rules target different contexts but the text omits the distinction needed to decide applicability.' Fix: 'State the distinct subject or trigger in the rule or group key; verify the case cannot require both incompatible actions.' Extend AP-133's comparison to the same effective set.

**Observing check.** Positive: The inherited publication requirement and local publication prohibition are flagged with a shared report as the witness. Negative: A public-data rule and a private-data rule with explicit disjoint predicates are not flagged; labels alone do not count as those predicates.

Evidence addresses: AP-20 lines 308–312; AP-24 lines 356–360; AP-133 lines 1744–1748; DP-27 lines 125–125.

[Original candidate](reviews/ap_structures/findings-02.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-09

**Confirmed · correction · P1**

Scope: [AP-22 · single-rule-authority](sources/anti-patterns.md#ap-22-single-rule-authority), [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [AP-74 · no-duplicated-guidance](sources/anti-patterns.md#ap-74-no-duplicated-guidance), [DP-06 · One Authoritative Home](sources/design-principles.md#6-one-authoritative-home).

**Assessment.** Necessary isolated-reader copies are explicitly protected from hygiene findings by worker-rule-reach and flagged by no-duplicated-guidance. This is a bounded opposing audit prescription, not proof the entire corpus is unsatisfiable.

**Witness.** Two separately delivered leaf techniques carry the same worker safety invariant because neither receives the other's text or a shared rule home. AP-23 treats each copy as required reach and says an audit must not flag it as hygiene. AP-74 flags the identical behavioral instructions and says to keep one location plus pointers. A pointer alone does not give the second worker the bytes it needs. The contradiction is in what the two rules prescribe for this exact delivery state.

**Suggested wording.** Make delivery and authorship separate checks. AP-23 Fix: 'Put the invariant in a shared contract delivered to every affected worker. If delivery requires a materialized copy, derive it from that home; record its source so it is not independently edited. Preserve the currently delivered obligation until the replacement delivery is verified.' AP-74 Do not flag: 'A mechanically derived copy needed for a reader that cannot receive the authoritative home; a plain reference alone does not establish reach.' AP-22 should point to this delivery exception. Verify each worker's effective text after consolidation.

**Observing check.** Positive: Two independently editable copies that both workers can replace with the same delivered shared contract are flagged and consolidated. Negative: A generated copy required for an isolated worker is not deleted merely because its bytes also exist at the owner; the observer confirms that worker still receives the invariant.

Evidence addresses: AP-22 lines 332–336; AP-23 lines 344–348; AP-74 lines 968–972; DP-06 lines 41–41.

[Original candidate](reviews/ap_structures/findings-03.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-13

**Confirmed · improvement · P3**

Scope: [AP-29 · no-user-env-mutation](sources/anti-patterns.md#ap-29-no-user-env-mutation), [DP-08 · Confirm Before Irreversible Changes](sources/design-principles.md#8-confirm-before-irreversible-changes).

**Assessment.** This is an optional product-scope choice, not a contradiction and not authorization to mutate a user environment. No maintenance exception is adopted in this review.

**Witness.** A user explicitly requests repair of their global Git identity. A workflow executing that request remains prohibited by AP-29, even after the requested impact confirmation. This is not a logical contradiction: confirmation is a prerequisite, not permission. It exposes a boundary the canon should either affirm or scope.

**Suggested wording.** Recommended if environment-maintenance workflows are supported: Detect 'Workflow prose directs mutation of user-owned environment state outside the declared and authorized work scope.' Exception 'Explicitly scoped environment maintenance with the target and impact confirmed.' Otherwise keep the absolute prohibition and state 'These workflows diagnose user-owned environment state; environment maintenance is outside their supported task scope.'

**Observing check.** Positive: An authoring workflow unexpectedly orders a global Git configuration change: flag it. Negative: A diagnostic-only instruction passes. If the scoped-maintenance exception is adopted, a separately authorized environment repair also passes; otherwise the workflow declares that task unsupported.

Evidence addresses: AP-29 lines 420–424; DP-08 lines 49–49.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-18

**Confirmed · correction · P1**

Scope: [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique), [AP-157 · unreachable-operation-reference](sources/anti-patterns.md#ap-157-unreachable-operation-reference), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps).

**Assessment.** Replacing the raw tool with a wrapping-technique call in the same Protocol introduces the work invocation that pass-orchestration-in-technique removes.

**Witness.** A local analysis technique says 'Use gitnexus_context on the symbol', and a shared context technique owns that capability. AP-51's Fix becomes 'Apply `[context](...)` (name: {symbol})' in the same Protocol. That exact call is an Apply of another technique for work and satisfies AP-114's Detect. Removing Apply but leaving a consult link invokes AP-157's separate availability check.

**Suggested wording.** Replace AP-51 Fix with: 'Bind the owning shared technique at the activity or routine and pass its product to the local technique. Remove the local raw-call recipe. Where the local step is an explicitly permitted unaided recovery path, retain its raw tool call under the existing exception.' Clarify that canonical link syntax applies only on surfaces allowed to reference that technique; it does not authorize a Protocol-to-Protocol invocation. Reconcile invocation-format and missing-argument entries against this same allowed-surface boundary.

**Observing check.** Positive: A local reimplementation of a shared call is replaced by a shared activity/routine bind and a declared input for the local consumer. Negative: The wrapper's own primitive call and an explicitly allowed unaided remedy remain valid; no Apply of a sibling is introduced into an ordinary technique Protocol.

Evidence addresses: AP-51 lines 688–692; AP-114 lines 1464–1468; AP-157 lines 2032–2036; DP-25 lines 117–117.

[Original candidate](reviews/ap_structures/findings-05.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-19

**Narrowed · improvement · P2**

Scope: [AP-53 · dotted-rule-address](sources/anti-patterns.md#ap-53-dotted-rule-address), [DP-36 · A Technique Names Only What Its Reader Holds](sources/design-principles.md#36-a-technique-names-only-what-its-reader-holds), [AP-145 · pre-session-prose-defers-to-the-framework](sources/anti-patterns.md#ap-145-pre-session-prose-defers-to-the-framework).

**Assessment.** The current text already warns that static spelling cannot establish reach. Make unknown delivery explicit and preserve current accepted address syntax until its resolver contract is verified; this review does not propose a new addressing grammar.

**Witness.** A rule is on a same-library sibling contract that a role may or may not bundle with the citing leaf. The static files establish neither actual delivery nor a unique bare address. One reviewer may accept a bare slug because a route may exist; another may require owner.slug because it is outside ancestry. Neither has observed the effective bundle.

**Suggested wording.** Keep the existing address grammar. State separately that a qualified address identifies an owner but does not prove the reader receives its rule. Record the known inheritance or bundle route; when a static review cannot determine that route, leave delivery unverified and name the missing evidence.

**Observing check.** Positive: A bare rule slug declared only in another library, with no delivered contract, is flagged with its missing owner and delivery path. Negative: A uniquely resolved inherited rule is accepted; unknown role-bundle delivery remains an explicit evidence gap rather than a guessed verdict.

Evidence addresses: AP-53 lines 712–716; DP-36 lines 161–161; AP-145 lines 1892–1892.

[Original candidate](reviews/ap_structures/findings-05.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-21

**Narrowed · correction · P2**

Scope: [AP-59 · constraint-as-blockquote](sources/anti-patterns.md#ap-59-constraint-as-blockquote), [DP-31 · Isolate Conditional Branches as Notes](sources/design-principles.md#31-isolate-conditional-branches-as-notes), [AP-108 · numbered-protocol-phases](sources/anti-patterns.md#ap-108-numbered-protocol-phases).

**Assessment.** The exception must distinguish primary choice work from a conditional caveat on another instruction. Do not ban ordered work ladders or infer a renderer defect without implementation evidence.

**Witness.** Under 'Resolve the endpoint', an indented If/Else-if/Otherwise ladder describes fallback cases of that instruction. It is a conditional caveat inside one step under DP-31, yet AP-59's 'at any indent' exemption appears to allow the sub-bullets whose flattening the Detect warns about. This is an exception boundary conflict, not a claim that every ordered ladder is prohibited.

**Suggested wording.** Replace the ladder exception with: 'An ordered sub-action or precedence ladder that is itself the work instruction, rather than a conditional caveat on another instruction.' Add: 'Fallback branches qualifying one instruction use the same note form even when written as If/Else-if/Otherwise.' Keep the condition-to-structure distinction for branches that select whole steps or activities.

**Observing check.** Positive: An indented fallback ladder qualifying one lookup is flagged until represented as a note under that lookup. Negative: A primary ordered work sequence remains ordered work; a proper conditional note and an activity-level structural branch both pass.

Evidence addresses: AP-59 lines 784–788; DP-31 lines 141–141; AP-108 lines 1394–1394.

[Original candidate](reviews/ap_structures/findings-06.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-22

**Confirmed · correction · P2**

Scope: [AP-68 · technique-stage-agnostic](sources/anti-patterns.md#ap-68-technique-stage-agnostic), [AP-10 · loop-not-prose](sources/anti-patterns.md#ap-10-loop-not-prose), [DP-20 · Keep Orchestration in Structure](sources/design-principles.md#20-keep-orchestration-in-structure).

**Assessment.** No separate commit step follows asserts surrounding run position, exactly the subject the entry rejects. Local iteration should remain scoped by the local-versus-session distinction.

**Witness.** A technique says 'No separate commit step follows.' Its truth depends on what the binding run does after this technique, so it answers where/when in workflow flow; the same string is expressly placed under Do not flag. By contrast, 'final validation' can name a product without making a graph claim.

**Suggested wording.** Remove 'no separate commit step follows' from Do not flag. Retain purpose examples such as 'final validation' only when they do not assert surrounding graph structure. Qualify Detect's loop language as 'an activity-level loop or iteration position'; explicitly retain a technique's internal iteration over its own input/output under AP-10's boundary.

**Observing check.** Positive: 'No separate commit step follows' is flagged and the owning activity carries the sequencing fact. Negative: 'Validate each finding in the declared input and emit the assessment' remains local technique work, and 'final validation' alone is not flagged.

Evidence addresses: AP-68 lines 892–896; AP-10 lines 186–186; DP-20 lines 97–97.

[Original candidate](reviews/ap_structures/findings-06.json) · [Independent disposition](reconciliation/ap-04.json).

## AE-03

**Confirmed · correction · P1**

Scope: [AP-74 · no-duplicated-guidance](sources/anti-patterns.md#ap-74-no-duplicated-guidance), [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [DP-06 · One Authoritative Home](sources/design-principles.md#6-one-authoritative-home).

**Assessment.** Confirmed on the isolated-worker witness: flagging necessary copies is itself flagged by worker-rule-reach. Resolve the local audit prescription by proving delivery from one editable owner.

**Witness.** Two isolated workers each receive one non-meta leaf technique. Both must receive the same behavioural constraint; neither receives a common owning text. Repeated wording meets AP-74 Detect, while flagging these required copies meets AP-23 Detect. The meta exception does not apply.

**Suggested wording.** Add AP-74 Do not flag: 'Copies required for isolated readers to receive a rule, provided they are delivered from one authoritative statement rather than independently maintained.' Replace Fix with: 'Hoist or deliver the authoritative statement to every affected reader, then remove independently maintained duplicates. A pointer replaces text only after its reader can resolve it before acting.' Align AP-23 with the same one-edit-home condition.

**Observing check.** Positive: Two independently maintained copies received by the same worker consolidate into their delivered owner. Negative: One canonical rule injected into two isolated worker contexts is accepted despite repeated delivered wording.

Evidence addresses: AP-74 lines 968–968; AP-23 lines 344–344; AP-23 lines 348–348; DP-06 lines 41–41.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-07

**Confirmed · improvement · P2**

Scope: [AP-77 · impl-before-confirmed-approach](sources/anti-patterns.md#ap-77-impl-before-confirmed-approach), [DP-08 · Confirm Before Irreversible Changes](sources/design-principles.md#8-confirm-before-irreversible-changes).

**Assessment.** The approval policy is stronger than the cited irreversible-change principle, which is allowed. Recognizing prior concrete authorization is a proposed policy refinement, not a contradiction.

**Witness.** A user gives exact instructions for a reversible field edit. It is neither a typo nor continuation of a separately presented plan, so the stated exceptions still demand another approach-confirmation exchange.

**Suggested wording.** Recommended replacement: 'A modification begins without authorization covering its scope and material approach choices. A request specifying the concrete change supplies that authorization; a material ambiguity or unapproved impact requires confirmation before dependent work.' Retain DP-08's explicit-impact requirement for semi-reversible and irreversible actions.

**Observing check.** Positive: An unapproved gate removal introduces a material impact; dependent edits await the decision. Negative: An exact, already authorized reversible edit proceeds without repeating the decision.

Evidence addresses: AP-77 lines 1008–1008; DP-08 lines 49–49.

[Original candidate](reviews/ap_execution/findings-02.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-08

**Confirmed · correction · P1**

Scope: [AP-79 · structure-backed-constraints](sources/anti-patterns.md#ap-79-structure-backed-constraints), [DP-09 · Encode Constraints as Structure](sources/design-principles.md#9-encode-constraints-as-structure).

**Assessment.** The repair must not turn an accepted guarantee into guidance merely because enforcement is difficult. Name the requirement owner and require a deliberate scope/guarantee change.

**Witness.** A requirement makes publication depend on approval. Unable to express its predicate, the author reclassifies it as guidance. The written Fix is followed while the required guarantee disappears.

**Suggested wording.** Add: 'A constraint is critical when a named requirement or accepted risk decision makes its breach invalidate the result or permission to proceed. Record that owner and the bypass its enforcement prevents.' Replace reclassification with: 'If the guarantee cannot be enforced, report the blocking gap. Downgrade only when the requirement owner explicitly changes the guarantee.'

**Observing check.** Positive: Publication remains reachable without a required approval; flag missing enforcement. Negative: A declared style preference without an acceptance or authorization guarantee may remain guidance.

Evidence addresses: AP-79 lines 1036–1036; DP-09 lines 53–53.

[Original candidate](reviews/ap_execution/findings-02.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-23

**Narrowed · improvement · P2**

Scope: [AP-108 · numbered-protocol-phases](sources/anti-patterns.md#ap-108-numbered-protocol-phases), [DP-15 · Phase by Sequenced Outcome](sources/design-principles.md#15-phase-by-sequenced-outcome).

**Assessment.** The one-write exception already excludes the directory/write witness. Clarify its precedence over order-sensitivity; do not claim the full rule necessarily demands micro-phases.

**Witness.** Creating a directory before writing its report must occur in order, yet both elaborate Persist Report. The reorder test flags them while the one-write exception excuses them.

**Suggested wording.** Replace the test with: 'Name the distinct outcome established at each proposed boundary and consumed by later work. Split when the next phase begins a different outcome; ordered sub-actions jointly producing one outcome remain bullets. Reordering sensitivity is supporting evidence, not sufficient by itself.' Add the directory/write example.

**Observing check.** Positive: Editing definitions, establishing validation results and recording accepted changes have distinct outcomes and phases. Negative: Ensuring a directory and writing the report remain subordinate actions of one persistence phase.

Evidence addresses: AP-108 lines 1392–1392; AP-108 lines 1394–1394.

[Original candidate](reviews/ap_execution/findings-05.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-25

**Confirmed · correction · P1**

Scope: [AP-110 · duplicate-shared-capability](sources/anti-patterns.md#ap-110-duplicate-shared-capability), [DP-18 · Prefer Shared Capability](sources/design-principles.md#18-prefer-shared-capability).

**Assessment.** An almost-fitting shared contract must satisfy the missing guarantee before the local implementation is deleted. The existing exception permits such owner changes but the prescribed repair omits that step.

**Witness.** A shared lookup lacks a required include-archived input or evidence output. Rebinding without extending its contract loses the required scope or downstream evidence.

**Suggested wording.** Prepend to Fix: 'Compare the caller's required inputs, outputs and guarantees with the shared contract. Close supported gaps at the shared owner and verify existing callers before rebinding and deleting the local recipe. When that surface cannot absorb the semantics, record the concrete incompatibility and keep a distinct capability with a truthful boundary.' Preserve the outcome under DP-38.

**Observing check.** Positive: A reusable missing output is added and consumers verified before local deletion. Negative: Incompatible domain guarantees are not forced through an almost-fitting operation solely because its verb matches.

Evidence addresses: AP-110 lines 1416–1416; AP-110 lines 1420–1420; DP-18 lines 89–89.

[Original candidate](reviews/ap_execution/findings-05.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-26

**Narrowed · correction · P1**

Scope: [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique), [AP-107 · bind-site-is-orchestration-truth](sources/anti-patterns.md#ap-107-bind-site-is-orchestration-truth), [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-141 · apply-omits-declared-input](sources/anti-patterns.md#ap-141-apply-omits-declared-input), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps).

**Assessment.** The Protocol-invocation repair conflict is confirmed. The exception in bind-site-is-orchestration-truth only excludes that entry and is not global permission to invoke; removing or cross-referencing it is a consistency cleanup, not another contradiction.

**Witness.** A local Protocol calls a raw tool with an existing shared wrapper. AP-51 prescribes replacement by a hyperlinked wrapping op with arguments; AP-114 immediately flags that work invocation. Repairing its omitted inputs under AP-141 leaves the AP-114 defect.

**Suggested wording.** Adopt DP-25 for ordinary techniques: AP-51 binds the wrapper as an activity/routine step; AP-141 checks required inputs at those binding sites; AP-107 removes its sibling-Apply exception. Retire dependent Protocol-invocation guidance unless a specifically named engine-entry case cannot be represented at a run binding site; any such exception must match across affected entries.

**Observing check.** Positive: A local wrapper call moves to a run step with complete bindings and no residual Protocol Apply. Negative: A primitive-owning technique invokes its raw tool and performs the reading without invoking another technique.

Evidence addresses: AP-114 lines 1464–1464; AP-51 lines 692–692; AP-141 lines 1844–1844; AP-107 lines 1378–1378; DP-25 lines 117–117.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).

## AE-27

**Confirmed · correction · P2**

Scope: [AP-116 · no-template-creation-guide](sources/anti-patterns.md#ap-116-no-template-creation-guide), [DP-28 · Creation Guide for Generated Documents](sources/design-principles.md#28-creation-guide-for-generated-documents), [AP-130 · artifact-name-is-filename](sources/anti-patterns.md#ap-130-artifact-name-is-filename).

**Assessment.** The bare-filename trigger can miss token-templated authored planning documents. Bound the expansion to authored/fillable documents; raw captures and machine-format artifacts use their actual producer/format contract.

**Witness.** A producer declares artifact {component_name}-review.md and cites its canonical output id in Protocol, without a guide. The principle requires one; the entry's bare-filename predicate does not clearly reach it.

**Suggested wording.** Replace the opening Detect with: 'For each persisted planning artifact, whether its filename is literal, token-templated or resolved from a declared value, resolve the guide its producer cites. Flag a missing Template or operative fill Rules, or a competing Protocol layout.' Map artifact kinds or filename patterns to guides where one shape serves several names.

**Observing check.** Positive: A token-named planning artifact without a guide receives a shape guide. Negative: Several resolved filenames sharing one documented shape do not need separate guides per concrete name.

Evidence addresses: AP-116 lines 1488–1488; DP-28 lines 129–129; AP-130 lines 1710–1710.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).

## PD-01

**Narrowed · improvement · P3**

Scope: [DP-03 · Define Complete Scope Before Execution](sources/design-principles.md#3-define-complete-scope-before-execution).

**Assessment.** DP-03 already gives an observable manifest-before-work and reconciliation duty. A newly discovered dependency does not prove that this broad principle is inconsistent or unmeasurable; it identifies a useful missing update instruction. The proposal must not turn discovery into authority to expand the task.

**Retained issue.** Optional clarification of when a changed worklist becomes authoritative.

**Suggested wording.** Use: "List the intended files and edit root before their dependent edits. Add discovered dependencies to that list before changing them, within the approved scope. Resolve material scope or authority changes before dependent work, and reconcile the list before completion." Do not describe the initial manifest requirement itself as defective.

**Observing check.** Positive: A newly identified consumer is listed and its existing scope authority checked before editing; completion reconciles the actual affected files. Negative: Silently editing an unlisted consumer fails. Merely discovering an additional file does not fail the principle or authorize changing it.

Evidence addresses: DP-03 lines 27–30.

[Original candidate](reviews/principles/findings-01.json) · [Independent disposition](reviews/principles/independent-review-01.json).

## PD-02

**Narrowed · correction · P2**

Scope: [DP-04 · Clarify Before Assuming](sources/design-principles.md#4-clarify-before-assuming).

**Assessment.** The ask-then-assume wording is a real clarification opportunity, but the title and ordinary meaning of clarification already oppose acting on an unresolved choice. AP-08 explicitly waits for an answer before the next question, though it does not itself settle dependent work. Treat this as closing an operational omission, not a reproduced P1 runtime enforcement failure.

**Retained issue.** Say that the answer, not the act of asking, resolves the dependent choice.

**Suggested wording.** Use: "When unresolved interpretations materially change the outcome, scope, authority, or acceptance test, ask one question and wait for its answer before dependent action. Existing explicit instructions resolve covered choices; independent investigation may continue." Classify as clarification of the decision boundary, with no claim that every uncertainty requires a new interview.

**Observing check.** Positive: An unanswered choice between destructive and non-destructive behavior prevents the dependent edit. Negative: Read-only investigation independent of that choice, or action covered by an earlier explicit answer, does not require another decision.

Evidence addresses: DP-04 lines 31–34.

[Original candidate](reviews/principles/findings-01.json) · [Independent disposition](reviews/principles/independent-review-01.json).

## PD-03

**Narrowed · improvement · P2**

Scope: [DP-06 · One Authoritative Home](sources/design-principles.md#6-one-authoritative-home), [DP-29 · Cite Resource Policy; Do Not Restate It](sources/design-principles.md#29-cite-resource-policy-do-not-restate-it), [DP-36 · A Technique Names Only What Its Reader Holds](sources/design-principles.md#36-a-technique-names-only-what-its-reader-holds).

**Assessment.** DP-29 expressly makes resource policy citation valid, and AP-157 explains that resource citations travel with the technique. Therefore the cited resource witness does not prove a same-scope contradiction or a need to inline that policy. The useful issue is DP-36 ambiguous description of available context, plus the difference between a qualified address and received instruction bytes. AP-53 spelling exclusions are not global permission to depend on undelivered text.

**Retained issue.** Clarify delivery reach and single-edit ownership without duplicating resource policy or mandating a new projection framework.

**Suggested wording.** Amend DP-36: "A required fact is in the technique, its delivered contracts, or a resource section delivered or fetched before use. A qualified rule address identifies its owner; the reader must also receive the operative fact." DP-06 may add: "A necessary delivery copy has an identifiable canonical source and is updated from that source." Keep DP-29 unchanged. Do not require every temporary copy to introduce a regeneration system.

**Observing check.** Positive: A required policy is absent from every received section and the only supplied text is an external rule address: the dependency is unresolved. Negative: An anchored resource section actually delivered with the technique supplies the policy without an inline duplicate.

Evidence addresses: DP-06 lines 39–42; DP-29 lines 131–134; DP-36 lines 159–162.

[Original candidate](reviews/principles/findings-01.json) · [Independent disposition](reviews/principles/independent-review-01.json).

## PD-04

**Narrowed · improvement · P2**

Scope: [DP-08 · Confirm Before Irreversible Changes](sources/design-principles.md#8-confirm-before-irreversible-changes), [DP-10 · Non-Destructive Updates](sources/design-principles.md#10-non-destructive-updates).

**Assessment.** Neither DP-08 nor DP-10 requires a fresh duplicate confirmation after an existing informed approval; that claimed failure is an interpretation risk, not a literal requirement. Semi-reversible is the stronger target for clarification. Keep the separate removal rule intact rather than silently exempting reversible material deletion.

**Retained issue.** Explain incomplete reversal and acknowledge authority that already covers the effect.

**Suggested wording.** DP-08: "A change whose reversal cannot restore the prior state, requires another party, or incurs material loss has explicit approval covering its target and impact before execution." DP-10: "Identify removed material and verify that explicit approval covers that removal." Add to the shared confirmation convention: "Approval remains effective for the same target and impact; a material change requires a new decision."

**Observing check.** Positive: A new removal or residual external effect falls outside the recorded approval and requires a decision. Negative: An explicit instruction to remove the named obsolete file already supplies approval for that exact removal; no identical second approval is required.

Evidence addresses: DP-08 lines 47–50; DP-10 lines 55–58.

[Original candidate](reviews/principles/findings-01.json) · [Independent disposition](reviews/principles/independent-review-01.json).

## PD-05

**Narrowed · improvement · P2**

Scope: [DP-09 · Encode Constraints as Structure](sources/design-principles.md#9-encode-constraints-as-structure).

**Assessment.** The principle is not unobservable: it names concrete structural mechanisms and a clear enforcement goal. The counterexample usefully distinguishes a field being present from a path actually being prevented. Do not define every critical constraint solely by start/commit/complete labels or mandate duplicate prose for a predicate already fully expressed by structure.

**Retained issue.** Make enforcement evidence a reachable-path property.

**Suggested wording.** Use: "A constraint designated as a required execution or acceptance boundary is enforced by a checkpoint, condition, or validation result so that rejection or missing required evidence cannot reach the prohibited operation or accepted completion. Identify the predicate and failure route in their owning structure." Retain semantic guidance only where structure does not already state it.

**Observing check.** Positive: A validation result is false or a required decision is absent, yet a feasible path reaches the gated effect: the claimed enforcement fails. Negative: The same failures route away from the effect, with a permitted pass route. A guidance-only rule does not need invented blocking machinery.

Evidence addresses: DP-09 lines 51–54.

[Original candidate](reviews/principles/findings-02.json) · [Independent disposition](reviews/principles/independent-review-02.json).

## PD-06

**Confirmed · correction · P2**

Scope: [DP-12 · Output Economy](sources/design-principles.md#12-output-economy), [AP-84 · single-closeout-artifact](sources/anti-patterns.md#ap-84-single-closeout-artifact).

**Assessment.** One fact lacks a stable useful unit when applied to an artifact containing multiple newly produced findings or decisions. AP-84 is supporting evidence of intended document grain, not global authorization overriding DP-12. This is an ambiguity in the principle own unit of ownership, not a formal contradiction between an AP exclusion and a principle.

**Retained issue.** Separate coherent artifact ownership from one checkpoint decision.

**Suggested wording.** The proposed replacement is sound. Prefer: "Each artifact has one declared audience and one coherent purpose; it owns the facts produced for that purpose and links facts owned elsewhere. A checkpoint presents one decision subject with the context needed to decide it." This avoids suggesting that its message must literally be an interrogative, which AP-99 separately addresses.

**Observing check.** Positive: A close-out report repeats a complete validation section owned elsewhere, or a checkpoint combines two independent choices: flag the relevant ownership/decision problem. Negative: One report owns several distinct newly produced findings for its declared purpose; it does not need one file per scalar assertion.

Evidence addresses: DP-12 lines 63–66; AP-84 lines 1090–1101.

[Original candidate](reviews/principles/findings-02.json) · [Independent disposition](reviews/principles/independent-review-02.json).

## PD-07

**Narrowed · correction · P2**

Scope: [DP-16 · Distinguish Designators from Parameters](sources/design-principles.md#16-distinguish-designators-from-parameters), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps), [DP-42 · A Routine Holds the Codified Path](sources/design-principles.md#42-a-routine-holds-the-codified-path), [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique).

**Assessment.** The AP-51-to-AP-114 repair conflict is reproducible. DP-16 typography, however, does not by itself authorize a prohibited invocation, and DP-42 explicitly splices routines into activities, so DP-25 activity wording is compatible with expanded execution. Retain the stale-surface and authoring-ownership clarification without claiming these sentences form a formal contradiction.

**Retained issue.** Unify supported work binding and remove repair advice that creates a prohibited Protocol call.

**Suggested wording.** DP-25: "Sibling and shared techniques are bound as steps in the activity or routine that owns their sequence." DP-16: retain braced value references and remove the Protocol technique-invocation argument rule if no supported Protocol invocation remains. Do not transplant italic/parenthesized Markdown argument syntax into YAML; use the actual binding schema. AP-51/56 and Apply repairs should route work to supported binds.

**Observing check.** Positive: Replacing a raw tool call in a leaf Protocol with Apply another-technique still fails AP-114 and is not a complete repair. Negative: A reusable routine with sibling technique binds is valid composition, as is its expansion into the binding activity.

Evidence addresses: DP-16 lines 79–82; DP-25 lines 115–118; DP-42 lines 183–186; AP-51 lines 682–693; AP-114 lines 1458–1469.

[Original candidate](reviews/principles/findings-02.json) · [Independent disposition](reviews/principles/independent-review-02.json).

## PD-08

**Confirmed · improvement · P2**

Scope: [DP-18 · Prefer Shared Capability](sources/design-principles.md#18-prefer-shared-capability), [AP-110 · duplicate-shared-capability](sources/anti-patterns.md#ap-110-duplicate-shared-capability).

**Assessment.** This is a useful optional operationalization of cannot absorb diversity. The principle already has a qualitative contract-fit boundary; the improvement names the evidence for the local-recipe exception and agrees with AP-110 near-fit case.

**Retained issue.** Record the actual unsatisfied semantic requirement before duplicating shared work.

**Suggested wording.** Retain the proposed text, reading "record" as identifying the requirement in the existing design evidence, not requiring a new artifact for every choice. The comparison should distinguish a missing configurable value from a genuinely incompatible capability or contract.

**Original wording retained within that adjustment.** Before a local recipe, record the behavior or contract requirement the shared capability cannot provide through its supported parameters, composition or justified shared extension. Reuse the shared owner where those mechanisms satisfy the requirement.

**Observing check.** Positive: A local recipe repeats a shared operation solely to change a parameter the shared owner can support: no demonstrated exception exists. Negative: A documented semantic requirement cannot be supplied by the supported contract, composition, or justified shared extension; the local scope is reviewable.

Evidence addresses: DP-18 lines 87–90; AP-110 lines 1410–1421.

[Original candidate](reviews/principles/findings-02.json) · [Independent disposition](reviews/principles/independent-review-03.json).

## PD-09

**Narrowed · improvement · P3**

Scope: [DP-19 · Name Symbols Affirmatively](sources/design-principles.md#19-name-symbols-affirmatively).

**Assessment.** The individual naming clauses are all observable. Boolean and collection clauses can be read as type-specific cases of meaningful naming, so multiple clauses alone do not prove a defective principle. Case and typography are separable convention details, making single ownership a worthwhile optional cleanup. DP-45 directly governs Rules entries, not every multi-clause principle.

**Retained issue.** Keep the semantic stance concise and locate exact naming conventions once.

**Suggested wording.** Use a principle such as: "Symbol names identify their values affirmatively; type-specific forms make that meaning explicit." Cite the existing convention/AP homes for exact case, plurality, and spelling. Avoid introducing a second parallel list of stable sub-identifiers unless independent citation is actually needed.

**Observing check.** Positive: A change to the spelling convention forces the same normative text to be edited in multiple homes: reduce that duplication. Negative: Several type-specific examples under one semantic naming principle are not unmeasurable merely because their predicates differ.

Evidence addresses: DP-19 lines 91–94.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-03.json).

## PD-10

**Confirmed · correction · P2**

Scope: [DP-22 · Modular Over Inline](sources/design-principles.md#22-modular-over-inline), [AP-01 · no-inline-content](sources/anti-patterns.md#ap-01-no-inline-content).

**Assessment.** Construct is unqualified in DP-22 while the catalog and schema-first principle distinguish separately authored definitions from inline schema structures. The proposal improves scope; it should not be described as an AP exemption granting universal permission.

**Retained issue.** Restrict own-file guidance to constructs the schema supports as separately referenced definitions.

**Suggested wording.** Use: "A separately referenceable definition lives in its own file and its parent references it. Fields and steps that the schema owns inline remain on that parent." This avoids implying that any future or unsupported construct gains a file-reference form by analogy.

**Observing check.** Positive: Embedding a separately referenceable activity body inside a parent is the modularity defect. Negative: An inline checkpoint or action required by the schema stays inline; extracting it to an unsupported referenced file is not a valid repair.

Evidence addresses: DP-22 lines 103–106; AP-01 lines 62–73.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-03.json).

## PD-11

**Narrowed · improvement · P3**

Scope: [DP-24 · Keep Session Interaction in Activities](sources/design-principles.md#24-keep-session-interaction-in-activities), [AP-113 · session-interaction-in-technique](sources/anti-patterns.md#ap-113-session-interaction-in-technique).

**Assessment.** The title already bounds DP-24 to session interaction, and activity ownership of when/how can include binding a domain delivery operation. AP-113 clarifies that boundary rather than contradicting the principle. The body word person is broader than necessary, so a concise wording improvement remains useful.

**Retained issue.** Use operator/session presentation language and distinguish domain effects.

**Suggested wording.** Use: "Activities own in-session presentation and operator decisions. A bound technique may perform a domain delivery operation through its owning tool; the activity owns when that operation runs." Retain any declared delivery evidence without requiring every pure side effect to acquire a new Output.

**Observing check.** Positive: A domain-analysis technique directly narrates its findings into operator chat: move that presentation to the activity. Negative: A bound notification or publication operation performs its domain effect. Its existence does not violate the session-presentation boundary or automatically authorize sending anything.

Evidence addresses: DP-24 lines 111–114; AP-113 lines 1446–1457.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-03.json).

## PD-12

**Rejected · no change**

Scope: [DP-26 · A Technique Is a Reading](sources/design-principles.md#26-a-technique-is-a-reading), [DP-42 · A Routine Holds the Codified Path](sources/design-principles.md#42-a-routine-holds-the-codified-path), [AP-158 · produce-path-without-a-reading](sources/anti-patterns.md#ap-158-produce-path-without-a-reading).

**Assessment.** The broad metaphor complaint does not reproduce a criterion defect. DP-26 immediately explains reading as tool orientation for a situation, response interpretation, and recovery; these are concrete qualitative contributions. A wrapper fixing arguments for a named question performs the stated orientation, so the witness does not establish a conflict. DP-42 names routine sequence/iteration/branch/gate ownership and explicitly retains residual technique reading. AP-158 local exceptions are not global permission, but its fixed-question example also fits DP-26 itself.

**Recommendation.** Retain DP-26 and DP-42. An optional example may illustrate fixed-question argument selection versus a raw alias, but do not replace the criterion or classify a deterministic reading as a routine merely because its own Protocol is stable.

**Observing check.** Positive: A technique merely forwards arbitrary arguments and renames the raw response; no domain question, interpretation, qualification, derivation, or recovery is contributed. Negative: A technique fixes a meaningful domain question or interprets a response and remains a technique even when that judgment is consistent and repeatable. A reusable structural run has a routine owner.

Evidence addresses: DP-26 lines 119–122; DP-42 lines 183–186; AP-158 lines 2038–2049.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-04.json).

## PD-13

**Narrowed · improvement · P3**

Scope: [DP-28 · Creation Guide for Generated Documents](sources/design-principles.md#28-creation-guide-for-generated-documents), [AP-116 · no-template-creation-guide](sources/anti-patterns.md#ap-116-no-template-creation-guide).

**Assessment.** A raw evidence capture is a useful omitted category, but machine-generated or schema-validated alone is not a sound exemption: an agent-authored planning ledger can be JSON and still need filling criteria. A creation guide can also instruct byte preservation, so the current rule does not inherently require altering a capture.

**Retained issue.** Distinguish an authored planning artifact from a preserved external/tool-produced evidence format.

**Suggested wording.** Use: "Planning documents whose content a technique authors or fills have a creation guide. A byte-exact capture or producer-defined evidence format cites its producer/format contract and preserves its bytes; it needs no competing layout template. Structured authored planning data still has operative filling criteria, even when a schema validates its shape."

**Observing check.** Positive: An authored decision report or JSON findings ledger lacks the criteria needed to fill its substantive fields: retain the creation-guide requirement. Negative: A byte-exact tool transcript with source identity and hash preserves its authoritative format without a second prose template.

Evidence addresses: DP-28 lines 127–130; AP-116 lines 1482–1493.

[Original candidate](reviews/principles/findings-04.json) · [Independent disposition](reviews/principles/independent-review-04.json).

## PD-14

**Narrowed · correction · P2**

Scope: [DP-32 · Cite Resources at Section Grain](sources/design-principles.md#32-cite-resources-at-section-grain), [DP-44 · A Resource Splits for Section Delivery](sources/design-principles.md#44-a-resource-splits-for-section-delivery), [AP-134 · whole-resource-for-one-section](sources/anti-patterns.md#ap-134-whole-resource-for-one-section).

**Assessment.** The missing shared-context delivery witness is sound: addressability does not prove receipt. The most-of-body phrase is a broad delivery-economy heuristic, however, and does not need a numeric threshold to be meaningful. The required rule is complete operative context, not a new size-ratio policy or a universal requirement that whole-body loads consume every byte.

**Retained issue.** Ensure that every section consumer receives its required framing and shared constraints.

**Suggested wording.** Amend DP-44: "Before applying a section, the consumer receives that section and every shared definition, rule, or template fragment it requires; the required sections are named at the consumption site or as fetched prerequisites." Keep DP-32 minimal-sufficient citation guidance. State that loading a broader body is an optimization choice that may not omit required context; byte measurement is useful evidence when making a cost claim, not a prerequisite for the principle.

**Observing check.** Positive: A fresh reader receives Template without its required shared Rules, even though Rules has a valid heading: the delivery dependency is incomplete. Negative: The required shared section is actually delivered or fetched before application. A whole-resource read for most needed content is not defective solely because a small unrelated section also arrives.

Evidence addresses: DP-32 lines 143–146; DP-44 lines 191–194; AP-134 lines 1750–1761.

[Original candidate](reviews/principles/findings-04.json) · [Independent disposition](reviews/principles/independent-review-04.json).

## PD-15

**Confirmed · improvement · P3**

Scope: [DP-35 · Prefer Removing the Thing That Needs a Prohibition](sources/design-principles.md#35-prefer-removing-the-thing-that-needs-a-prohibition).

**Assessment.** The opening inference is overbroad: a warning can distinguish intentional capabilities or authorities rather than identify duplicate implementations. The final both-paths clause reduces the risk but does not repair the word means. The proposal supplies a useful semantic-equivalence check without numeric machinery.

**Retained issue.** Treat a warning as a prompt to compare paths, not proof that one path is redundant.

**Suggested wording.** Use: "When a prohibition distinguishes paths that serve the same required capability under the same preconditions, authority, and lifecycle, choose one owner and retire the duplicate. Preserve intentional differences and cite the owner of each behavior." Preserve the existing preference rather than turning it into an absolute ban on alternatives.

**Observing check.** Positive: Two implementations have the same required behavior and differ only in which one an instruction forbids: one authoritative implementation is preferable. Negative: Preview and effectful execution have distinct authority and side effects; a warning distinguishing them does not by itself justify deleting either capability.

Evidence addresses: DP-35 lines 155–158.

[Original candidate](reviews/principles/findings-04.json) · [Independent disposition](reviews/principles/independent-review-05.json).

## PD-16

**Confirmed · correction · P3**

Scope: [DP-39 · A Phase Heading Names the Outcome](sources/design-principles.md#39-a-phase-heading-names-the-outcome).

**Assessment.** The two-or-three requirement and past-four heuristic provide inconsistent audit cues at four words. They are not formally contradictory: the second sentence does not positively permit four words, and the first already excludes them. Treat this as a low-priority expression/boundary correction, not a logical impossibility.

**Retained issue.** Use one word-count boundary if this exact count remains an intended convention.

**Suggested wording.** The smallest repair preserving the stated policy is "More than three words carries detail that belongs in the bullet" in place of "Past four words". Do not silently invent a four-word allowance or proper-name exception; add an exception only if the convention owner intends it. Outcome clarity remains the design purpose.

**Observing check.** Positive: Under the existing strict count policy, four- and five-word headings both require revision; the prose should communicate that same boundary. Negative: A two- or three-word heading that clearly names the outcome satisfies the count convention, though duplicating its bullet may still fail the independent outcome test.

Evidence addresses: DP-39 lines 171–174.

[Original candidate](reviews/principles/findings-04.json) · [Independent disposition](reviews/principles/independent-review-05.json).

## PD-17

**Narrowed · improvement · P2**

Scope: [DP-41 · A Phase States Answers the Tool Has Returned](sources/design-principles.md#41-a-phase-states-answers-the-tool-has-returned), [AP-161 · unproducible-declared-value](sources/anti-patterns.md#ap-161-unproducible-declared-value).

**Assessment.** An explicit evidence policy for rare or unsafe-to-trigger responses is a useful addition. AP-161 concerns output-value reachability, not every tool response interpretation, so its exception cannot override DP-41 or prove a contradiction. A contract-backed fixture demonstrates the intended branch handling but does not establish live harness behavior.

**Retained issue.** Separate observed behavior from contract-backed but live-unobserved recovery logic.

**Suggested wording.** Use: "Response interpretations identify their evidence: a captured live response, or an authoritative response contract with a representative fixture. Claims that the tool has returned a response require observation; contract-backed but unobserved recovery remains labeled as such." Preserve deployment verification limits and avoid implying that absence of a sample proves impossibility.

**Observing check.** Positive: The Protocol invents an empty-result meaning with neither actual observations nor an authoritative semantic contract: the interpretation is unsupported. Negative: A documented rare error has a tested recovery fixture and is explicitly marked live-unobserved; fixture success is not reported as an observed real-subject return.

Evidence addresses: DP-41 lines 179–182; AP-161 lines 2074–2084.

[Original candidate](reviews/principles/findings-05.json) · [Independent disposition](reviews/principles/independent-review-05.json).

## PD-18

**Narrowed · improvement · P3**

Scope: [DP-43 · An Activity Reuses Activities](sources/design-principles.md#43-an-activity-reuses-activities), [DP-18 · Prefer Shared Capability](sources/design-principles.md#18-prefer-shared-capability).

**Assessment.** May borrow/bind/include is a clear capability statement, not vague or impossible to apply. It lacks a prefer/before stance of the kind the principles overview promises, which supports a catalog-placement improvement rather than a missing enforcement rule. Adding another reuse obligation would duplicate DP-18.

**Retained issue.** Place composition capability descriptions at the construct home and retain one reuse preference.

**Suggested wording.** Prefer the first proposed branch: move the supported borrow/bind/include forms and library examples to the construct reference, and let DP-18 own the reuse preference. If a principle entry remains, make it a concise citation to that existing preference rather than a new independently maintained local-activity exception rule.

**Observing check.** Positive: A catalog claiming one prefer/before invariant per heading contains only a permitted-feature inventory at this heading: reorganize the material for that declared purpose. Negative: The same feature statement is useful and clear in a construct reference. Failure to borrow is not itself a violation of the permissive sentence.

Evidence addresses: DP-43 lines 187–190; DP-18 lines 87–90.

[Original candidate](reviews/principles/findings-05.json) · [Independent disposition](reviews/principles/independent-review-05.json).

## PD-19

**Narrowed · improvement · P3**

Scope: [DP-46 · A Consumer Binds the Contract](sources/design-principles.md#46-a-consumer-binds-the-contract).

**Assessment.** DP-46 is already a normative substitutability requirement: a definition advertising the contract must be usable in its place. It does not state that a declaration empirically proves compliance. Making preconditions and guarantees explicit is useful teaching/check guidance, but the allegation of nominal identity being sufficient is not supported. Invalid-input behavior is only a guarantee where the shared contract specifies it.

**Retained issue.** Optional explanation of how to assess the existing substitutability obligation.

**Suggested wording.** Use: "A definition advertising a shared contract accepts every input admitted by that contract without stronger preconditions and preserves its promised outputs, failure behavior, and relevant effects. Consumers bind against those promises." Keep the observing check scoped to defined contract behavior; do not demand arbitrary invalid-input semantics or imply finite tests prove every possible substitution.

**Observing check.** Positive: An implementation makes an inherited optional input required or omits a promised failure result: it violates the existing substitution obligation. Negative: Two implementations accept the same admitted inputs and meet the promised behavior. Unspecified behavior outside the contract preconditions is not an invented conformance obligation.

Evidence addresses: DP-46 lines 199–202.

[Original candidate](reviews/principles/findings-05.json) · [Independent disposition](reviews/principles/independent-review-05.json).

## PD-20

**Rejected · no change**

Scope: [DP-47 · A Calibrated Surface Extends by Wrapping](sources/design-principles.md#47-a-calibrated-surface-extends-by-wrapping), [DP-34 · Edit the Owner](sources/design-principles.md#34-edit-the-owner).

**Assessment.** The proposed witness changes a defective shared requirement, whereas DP-47 scopes itself to gaining a consumer need through a wrapper. It does not prohibit repairing the owner or intentionally changing the shared contract. DP-34 concerns synchronization caused by restated facts, not an assertion that every owner defect must be solved by wrapping. No same-scope conflict or missing boundary is demonstrated.

**Recommendation.** Retain DP-47. If a separate change-validation principle is desired, propose it explicitly as an addition about invalidating dependent calibration after owner changes, rather than as a repair required by this witness.

**Observing check.** Positive: A consumer-only adaptation changes a calibrated shared surface despite an adequate wrapper: this is the actual wrapping-preference case. Negative: An authorized correction to a defective shared contract is outside the consumer-only extension case. It still needs its own scoped validation, but DP-47 does not forbid the correction.

Evidence addresses: DP-47 lines 203–205; DP-34 lines 151–154.

[Original candidate](reviews/principles/findings-05.json) · [Independent disposition](reviews/principles/independent-review-06.json).
