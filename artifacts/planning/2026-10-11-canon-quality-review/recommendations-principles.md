# Reconciled PD recommendations

These are review suggestions at the captured revision. The independent disposition and wording below govern the recommendation; the original candidate remains available for comparison. No corpus change is implied. P1 concerns lost obligations, evidence or incompatible repairs; P2 clarifies a material boundary; P3 improves consistency or expression.

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
