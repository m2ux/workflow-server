# Reconciled AC recommendations

These are review suggestions at the captured revision. The independent disposition and wording below govern the recommendation; the original candidate remains available for comparison. No corpus change is implied. P1 concerns lost obligations, evidence or incompatible repairs; P2 clarifies a material boundary; P3 improves consistency or expression.

## AC-01

**Confirmed · correction · P1**

Scope: [AP-124 · alternate-ops-as-protocol-sequence](sources/anti-patterns.md#ap-124-alternate-ops-as-protocol-sequence).

**Assessment.** Executable alternate slices sent to Rules violate the work/constraint boundary. Separating standing policy from executable alternatives makes the repair coherent.

**Witness.** A technique has mutually exclusive Spawn and Resume phases, each containing calls and response handling. Moving those whole slices into operation_kind Rules follows AP-124 but leaves work instructions that AP-19 moves back to Protocol. A standing depth limit is legitimately a Rule; the spawn procedure is not. This is a repair conflict, not a claim that all alternate operations are impossible to represent.

**Suggested wording.** Replace Fix with: "Keep standing host policy in Rules. Express alternate work inside one outcome phase with conditional notes when it is one operation; give distinct operations separate techniques and select them at the binding site. Keep ordered outcomes in Protocol." Remove the standing-policy branch from Detect and cross-reference rule-as-protocol-step for that separate defect. Remove "A caller Applies the selected rule section."

**Observing check.** Positive: Flag Spawn and Resume as consecutive phases when exactly one runs; repair them as separate bound operations or branches of one invocation. Negative: Do not flag a cross-cutting maximum-depth Rule or one Dispatch phase with alternate argument choices and shared response handling.

Evidence addresses: AP-124 lines 1584–1588; AP-19 lines 296–300; AP-25 lines 368–372.

[Original candidate](reviews/ap_contracts/findings-01.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-02

**Confirmed · correction · P1**

Scope: [AP-125 · technique-ref-in-io-contract](sources/anti-patterns.md#ap-125-technique-ref-in-io-contract), [AP-140 · declared-input-never-read](sources/anti-patterns.md#ap-140-declared-input-never-read), [AP-141 · apply-omits-declared-input](sources/anti-patterns.md#ap-141-apply-omits-declared-input).

**Assessment.** The catalog both preserves and repairs Protocol Apply sites that pass-orchestration-in-technique removes. The supported bind site is the coherent common remedy.

**Witness.** Technique A has an I/O entry "via [B]" and B requires project_id. AP-125 offers moving the Apply relationship into A Protocol; AP-141 then directs adding project_id to that Apply line. AP-114 flags exactly that invocation and moves B into steps[]. A separate binding-site solution exists, so this is an inconsistent repair path rather than an unsatisfiable canon.

**Suggested wording.** AP-125 Fix: "Keep I/O descriptions about meaning and shape. Put producer/consumer sequencing at activity or routine binds; put any technique-owned value assembly in its own Protocol." Remove its Protocol/Rules Apply carve-out. AP-140: remove the applied-op exemption and the final Apply-site repair sentence. Retire AP-141 as a Protocol-Apply repair, or replace its scope with: "For each supported activity or routine technique bind, prove that every required effective input is supplied by an explicit bind, a same-name available value, or its declared default." Route Protocol Apply sites directly to pass-orchestration-in-technique.

**Observing check.** Positive: Flag a required project_id missing from an actual technique bind; supply the value at that bind with a reachable producer. Negative: Do not flag an optional/defaulted input or a same-name value proved available at the bind. Do not repair a prohibited Protocol Apply by adding more arguments to it.

Evidence addresses: AP-125 lines 1598–1600; AP-140 lines 1830–1832; AP-141 lines 1840–1844; AP-114 lines 1464–1468.

[Original candidate](reviews/ap_contracts/findings-01.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-03

**Narrowed · correction · P1**

Scope: [AP-136 · phase-cited-by-ordinal](sources/anti-patterns.md#ap-136-phase-cited-by-ordinal), [AP-144 · reference-without-provenance](sources/anti-patterns.md#ap-144-reference-without-provenance).

**Assessment.** A source name or heading is not delivered evidence. The witness is restricted to operative references whose required text or value is unavailable; orientation and locally delivered references remain valid.

**Witness.** A leaf Protocol says "step 3 in resolver guarantees the selected root." AP-136 permits replacing this with a link to resolver.md#3-selected-root; AP-144 permits naming resolver as the guarantee. The reference invokes nothing and needs undelivered text, which AP-157 flags.

**Suggested wording.** AP-136 Fix: "For a reference within the delivered Protocol, identify the outcome by its heading. Put cross-technique sequencing at the bind site. A consumer of an earlier result declares that value or checkable precondition; it does not link to an undelivered phase." AP-144 Do not flag: replace the other-technique guarantee with "A declared precondition whose evidence this reader receives and can check." Fix: "Name a supplied value or local producer, or declare the missing contract and arrange its binding. A supplier name alone does not supply the value."

**Observing check.** Positive: Flag an undeclared "already resolved root" supported only by a link to another technique; introduce a bound selected_root with its required evidence. Negative: Do not flag a declared selected_root or a local earlier phase that produces it. An orientation README may still link to the resolver phase.

Evidence addresses: AP-136 lines 1780–1784; AP-144 lines 1876–1880; AP-157 lines 2032–2036.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-04

**Narrowed · improvement · P2**

Scope: [AP-127 · bag-value-as-literal](sources/anti-patterns.md#ap-127-bag-value-as-literal).

**Assessment.** The phrase where the placeholder belongs can already exclude a comparison constant. Make that boundary explicit; this is a false-positive prevention improvement, not proof that all literal predicates violate the rule.

**Witness.** operation_type describes the selected operation and admits review/update. In "when {operation_type} is review", review is an operative enum literal and a declared slot carries operation-kind meaning. Replacing review with {operation_type} makes a self-comparison. AP-52 explicitly prescribes relating a literal to its input, and AP-112 requires gates to compare the authoritative variable directly.

**Suggested wording.** Add to Detect: "The literal substitutes for the current value of that slot; it is not an independently meaningful comparison operand or pattern." Add to Do not flag: "Enum members and fixed constants used to test, classify, or select the declared value, such as when {operation_type} is review." Retain the replacement rule only for copied bound values. Where the consumer is a resource, put caller-specific bindings on the technique or activity and keep the resource parameter abstract.

**Observing check.** Positive: Flag "push to workflows" when target_branch is the bound destination and may name another branch. Negative: Do not flag "when {operation_type} is review" or "retry when {attempts} is below 3" when 3 is the authoritative declared policy constant.

Evidence addresses: AP-127 lines 1672–1676; AP-52 lines 704–704; AP-112 lines 1444–1444.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-05

**Confirmed · correction · P1**

Scope: [AP-128 · unproduced-value-read](sources/anti-patterns.md#ap-128-unproduced-value-read).

**Assessment.** The same expression evaluated before and after a write can have different truth values. The exemption is insufficient to prove a producer dominates a read. A definedness repair must retain the domain predicate.

**Witness.** enabled starts false. Step A produces result only when enabled. Step B sets enabled true. Step C reads result when enabled. A and C have the same expression, so the exemption excuses C even though this execution reaches C without result. Separately, an unseeded intent_detected gating its own sole producer cannot establish the first value.

**Suggested wording.** Replace the same-expression carve-out with: "Every path reaching the reader includes a producer or a valid seed; equivalent gates establish this only when the values they test cannot change between evaluations." Include conditions evaluated before a producer among readers. Fix: "Add a definedness precondition while retaining any required domain predicate, or provide an exhaustive producer/seed whose meaning the consumer can distinguish."

**Observing check.** Positive: Flag the false-to-true enabled path and an unseeded output used in its own producer gate. Negative: Do not flag matching gates with unchanged predicate inputs and a guaranteed producer before every read; a meaningful declared seed can also establish availability.

Evidence addresses: AP-128 lines 1680–1688.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-06

**Confirmed · improvement · P3**

Scope: [AP-131 · resource-id-names-its-content](sources/anti-patterns.md#ap-131-resource-id-names-its-content).

**Assessment.** A sibling suffix alone does not establish the applicable naming family, and the broad content-name exemption overlaps the detector.

**Witness.** findings.md is a report template beside review-policy.md and decision-guide.md. It names its content, but one sibling carries -guide, so the Detect and the broad exemption support different dispositions.

**Suggested wording.** Replace the suffix clause with: "Within a documented family of the same resource kind, flag an id that omits that family established kind suffix and is ambiguous without opening the body." Do not flag: "An unambiguous content noun, or a resource of another kind; a sibling suffix alone does not establish a convention." Keep verb-headed consult-resource detection.

**Observing check.** Positive: Flag complete-wp for a close-out template, and an ambiguous outlier within a documented family of template names. Negative: Do not flag risk-vocabulary because a neighboring file is a decision-guide, or review-format merely because review can also be a verb.

Evidence addresses: AP-131 lines 1720–1724.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-07

**Narrowed · improvement · P3**

Scope: [AP-133 · overlapping-rule-scopes](sources/anti-patterns.md#ap-133-overlapping-rule-scopes).

**Assessment.** The existing final Detect test already requires undetermined behavior, so compatible cumulative rules do not reproduce a defect when the full test is applied. The useful change clarifies that grouping alone does not provide precedence.

**Witness.** "Every finding cites evidence" and "High findings name an owner" both apply to a High finding without conflict or required order. Keys general and high do not, by themselves, settle two different default-owner choices.

**Suggested wording.** Retain the current undetermined-behavior test. Add to Do not flag: Compatible cumulative constraints. Replace the group-key exemption with grouping that makes scopes disjoint or explicitly establishes precedence; a label alone is insufficient.

**Observing check.** Positive: Flag two applicable fallback-selection rules whose chosen output depends on an unspecified precedence. Negative: Do not flag evidence-for-all plus owner-for-High, since both obligations are simultaneously and unambiguously satisfiable.

Evidence addresses: AP-133 lines 1744–1748; AP-20 lines 308–312.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-08

**Confirmed · correction · P2**

Scope: [AP-134 · whole-resource-for-one-section](sources/anti-patterns.md#ap-134-whole-resource-for-one-section).

**Assessment.** The bare-introduction exception and the whole-plus-section detector admit opposing dispositions for one delivered citation pair.

**Witness.** A Protocol first says "Consult `[guide](guide.md)`" as an introduction, then "Apply `[Rules](guide.md#rules)`". Detect flags both delivered units; the bare-introduction exemption allows the first. DP-32 states every distinct citation is delivered.

**Suggested wording.** Delete "A bare citation that introduces the resource" from Do not flag. Replace with: "A bare citation is appropriate when this application consumes the whole body; use that single citation and avoid additional delivered section citations. Orientation outside a delivered technique may introduce a resource with a bare link."

**Observing check.** Positive: Flag a delivered bare introduction plus an anchored citation when only the section is consumed. Negative: Do not flag a single bare citation for an audit of every entry, or only anchored citations for a narrow section consumer.

Evidence addresses: AP-134 lines 1756–1760; DP-32 lines 145–145.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-09

**Narrowed · correction · P2**

Scope: [AP-135 · tool-contract-restated-in-protocol](sources/anti-patterns.md#ap-135-tool-contract-restated-in-protocol).

**Assessment.** Keeping every reason is broader than retaining an operative constraint or fact. The fix should preserve necessary meaning and remove explanation that adds no obligation; this is a repair wording conflict, not a ban on useful context.

**Witness.** After deleting a duplicated tool argument shape, AP-135 keeps "Relay the map verbatim because the server performs the merge." The server-mechanism clause adds no constraint and AP-26 deletes it. This is a conflict in the prescribed retained prose, not in the caller obligation.

**Suggested wording.** Replace Fix with: "Keep the caller obligation and every fact needed to apply it. Drop argument shape the tool schema already declares. Put explanatory rationale in its design record; cite a canonical contract when the caller needs that contract."

**Observing check.** Positive: Flag a prose field/type roster already supplied by the tool schema, and remove a rationale-only tail. Negative: Do not flag "Pass the map verbatim" or a state-dependent obligation the tool schema cannot express; those constrain the call.

Evidence addresses: AP-135 lines 1768–1772; AP-26 lines 384–388.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-10

**Narrowed · correction · P2**

Scope: [AP-137 · unowned-harness-capability](sources/anti-patterns.md#ap-137-unowned-harness-capability), [AP-158 · produce-path-without-a-reading](sources/anti-patterns.md#ap-158-produce-path-without-a-reading).

**Assessment.** Repeated use of the same capability alone does not prove a useful shared technique contribution. The conflict occurs when extraction yields only a raw-return alias; different capabilities and a fixed-question wrapper are already exceptions. Do not claim every extraction cycles.

**Witness.** Two substantive techniques call the same generic query tool with caller-supplied arguments and use its raw response locally for different derivations. No technique exposes that raw response as an output. AP-137 creates a generic call-and-return wrapper; AP-158 flags that wrapper because it adds no reading or fixed argument shape. This is a repair cycle unless the criterion first establishes useful shared work.

**Suggested wording.** AP-137 Detect: "Two or more techniques duplicate the same tool-facing interpretation, recovery policy, or argument selection for one named question, and no technique owns that shared product." Do not flag: "Independent use of a raw primitive exactly as its tool contract defines, with distinct caller-owned interpretation." Fix: "Extract the proven shared contribution; preserve direct primitive use where there is no such contribution." Cross-reference produce-path-without-a-reading as a precondition for the extraction.

**Observing check.** Positive: Flag duplicated pagination interpretation and identical absence handling for the same domain query; one shared technique can own those decisions. Negative: Do not flag two domain techniques that use the same raw query primitive but ask different questions and interpret results differently.

Evidence addresses: AP-137 lines 1792–1796; AP-158 lines 2044–2048; DP-26 lines 121–121.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-11

**Narrowed · improvement · P2**

Scope: [AP-138 · output-without-destination](sources/anti-patterns.md#ap-138-output-without-destination).

**Assessment.** The entry already exempts external library callers and asks for a reader. Strengthen its name-search procedure to prove an actual route; do not treat a lack of visible external callers as unused.

**Witness.** A local output selected_item is remapped to unused_item, while an unrelated unbound technique declares selected_item. A name-only search can count the unrelated input as a destination even though the producing output has no reader.

**Suggested wording.** Add: "Trace each output through actual reachable binds, remaps, artifact construction, and messages to a consumer in the declared review boundary. A same-name declaration without that route is not a reader. Record unknown external consumption separately from a proved unused local output." Align technique-outputs-declared with this distinction: internal locals stay locals; externally consumable products have declared Outputs.

**Observing check.** Positive: Flag a local output whose only remap leads to a never-read variable, despite an unrelated matching input name. Negative: Do not flag an output consumed through a reachable remap or a sibling artifact template, or a public library contract whose external consumers are outside the review boundary.

Evidence addresses: AP-138 lines 1804–1808; AP-109 lines 1404–1406.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-12

**Confirmed · correction · P1**

Scope: [AP-140 · declared-input-never-read](sources/anti-patterns.md#ap-140-declared-input-never-read).

**Assessment.** The explicit Protocol-and-Rules lexical search misses input consumption in permitted Output recognition and artifact filename templates. Adding a bare mention is not a semantic repair.

**Witness.** package_name is consumed only by artifact template {package_name}-plan.md, and the Protocol persists {plan}. Or confidence_floor is used by a declared Output recognition criterion while Protocol emits that Output by reference. Both inputs affect the result but AP-140 finds no occurrence in Protocol/Rules.

**Suggested wording.** Detect: "Resolve the effective contract and identify semantic reads in Protocol, Rules, Output recognition or construction, artifact templates, and supported binding/default expressions. Flag an input with no such use. A bare mention without consumption is not evidence of use." Fix: "Delete a proved unused input, or wire it to the actual consumer; do not add prose solely to satisfy a text search."

**Observing check.** Positive: Flag an input that appears only in its own description, or is named in a comment without affecting an operation or output. Negative: Do not flag package_name used by a declared filename template or confidence_floor used in Output recognition criteria referenced by the producing phase.

Evidence addresses: AP-140 lines 1828–1832; AP-111 lines 1428–1432; AP-130 lines 1710–1710.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-13

**Confirmed · improvement · P2**

Scope: [AP-143 · inherited-rules-re-enumerated](sources/anti-patterns.md#ap-143-inherited-rules-re-enumerated).

**Assessment.** The exemption should cover a container-owned invariant, not every container entry including redundant rosters. Confirm actual inherited delivery before removing a roster.

**Witness.** A root contract declares alpha and beta, and a nested group Rules entry says "Honor alpha, beta". Both root and group rules reach each leaf. The Detect finds a behavior-free repeated roster, but the blanket container exemption can excuse it.

**Suggested wording.** Replace the container exemption with: "A container entry that owns an invariant the loader delivers to descendants; being a container does not exempt a redundant enumeration of already-delivered rules." Require the evidence to name the actual delivery route; an uncertain bundle is not proof that the rule already arrives.

**Observing check.** Positive: Flag the nested honor-alpha-and-beta roster after confirming both original invariants arrive at its readers. Negative: Do not flag the root definitions of alpha and beta, or a group-specific scope qualification that changes what its readers must do.

Evidence addresses: AP-143 lines 1864–1868.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-14

**Narrowed · improvement · P3**

Scope: [AP-146 · instruction-narrates-an-actor](sources/anti-patterns.md#ap-146-instruction-narrates-an-actor).

**Assessment.** The existing duty and deletion tests limit the detector, but its inclusion of README orientation invites an overly literal imperative rewrite. Clarify the instruction-versus-description boundary; ordinary present-tense orientation is not inherently a violation.

**Witness.** README orientation says "The worker produces the review report." As orientation this describes the system; if the third-person reader-duty test is applied literally after identifying workers among the audience, the suggested rewrite is "Produce the review report." The latter changes the purpose of the passage.

**Suggested wording.** Scope Detect: "On an instruction surface, flag a required duty attributed to the reader only through third-person narration, or an account of another actor that supplies neither an actionable obligation nor checkable evidence." Add to Do not flag: "Declarative purpose and behavior orientation on descriptions, Capability, and README surfaces, where it is not prescribing an extra duty." Keep the actor-reach and observability test for actual instructions.

**Observing check.** Positive: Flag a worker instruction that narrates an orchestrator-only internal step and leaves the worker unable to act or verify a precondition. Negative: Do not flag a present-tense README explanation of who produces a report, or a checkable precondition drawn from the reader own tool response.

Evidence addresses: AP-146 lines 1900–1904; DP-17 lines 85–85.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-15

**Narrowed · correction · P1**

Scope: [AP-148 · inherited-input-re-declared](sources/anti-patterns.md#ap-148-inherited-input-re-declared).

**Assessment.** The incompatible case requires the leaf to advertise or be substitutable for the same shared contract. Mere inheritance does not by itself prove that promise. Under that promise an optional-to-required override rejects valid callers.

**Witness.** The shared contract admits an absent filter. A leaf redeclares filter as required, then advertises the same shared contract. AP-148 exempts the change, but a consumer that legally binds the shared contract without filter cannot use that leaf.

**Suggested wording.** Qualify the optionality exemption: When the leaf advertises a shared contract, its effective input preconditions and output guarantees preserve that contract. A leaf-specific stricter contract is explicitly distinct. Delete only redundant declarations; evaluate supported overrides against the effective contract and its callers.

**Observing check.** Positive: Flag an optional-to-required override that breaks an otherwise valid shared-contract call. Negative: Do not flag deletion of duplicated wording, a permitted default within the same semantic contract, or an override that weakens an input precondition while preserving guarantees.

Evidence addresses: AP-148 lines 1924–1928; DP-46 lines 201–201.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-16

**Confirmed · improvement · P3**

Scope: [AP-149 · schema-semantics-restated](sources/anti-patterns.md#ap-149-schema-semantics-restated).

**Assessment.** The schema-extension branch lies outside this detector and contradicts its exception for schema-inexpressible engine facts. Separately scope schema evolution.

**Witness.** A duplicate operator roster can simply be deleted or linked. An actor-specific permission that the schema cannot state is instead protected by the exception; trying to put it in the schema is not the same repair and AP-02 separately constrains schema changes.

**Suggested wording.** Replace the final schema-extension sentence with: "A fact the schema does not express is not a restatement under this entry; keep it at its operative contract home. A proposed schema capability change is separately scoped schema work." Retain deletion/citation for facts the schema already owns.

**Observing check.** Positive: Flag a copied operator roster whose authoritative field schema contains the same choices. Negative: Do not flag an engine-owned rule about which actor resolves a gate merely because the schema cannot encode that actor duty.

Evidence addresses: AP-149 lines 1936–1940; AP-02 lines 80–84.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-17

**Confirmed · improvement · P2**

Scope: [AP-154 · call-omits-required-argument](sources/anti-patterns.md#ap-154-call-omits-required-argument), [AP-155 · call-names-an-undeclared-argument](sources/anti-patterns.md#ap-155-call-names-an-undeclared-argument).

**Assessment.** This is a proposed scope improvement, not an internal contradiction. External tools can be explicitly excluded; a correctness claim must then disclose that boundary rather than treating an exclusion as a pass.

**Witness.** A workflow wraps an external harness tool whose visible schema requires repo_id. The signature omits repo_id, but the current nonregistered-tool exemption skips it. If the external schema is unavailable, the same call cannot honestly receive a correctness verdict.

**Suggested wording.** Replace the registration exemption with: "Apply when the tool authoritative schema is available at the reviewed revision, including an external harness contract. Where it is unavailable, record the call unevaluated with the missing source; do not invent a parameter contract." If scope is intentionally only server-registered tools, state that in Detect and report excluded external calls as outside coverage.

**Observing check.** Positive: Check and flag an omitted required argument on an external tool whose schema is supplied in the review context. Negative: Do not assert failure or success for an external tool with no available authoritative contract; record the coverage limit.

Evidence addresses: AP-154 lines 1996–2000; AP-155 lines 2008–2012; DP-21 lines 101–101.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-18

**Confirmed · correction · P2**

Scope: [AP-155 · call-names-an-undeclared-argument](sources/anti-patterns.md#ap-155-call-names-an-undeclared-argument).

**Assessment.** A declared open map can admit keys without listing each property. Compare against effective schema admissibility before deleting a dynamic key.

**Witness.** A registered tool declares labels as an object map from arbitrary string keys to strings. A signature passes labels: {owner: "team-a"}. owner is not an explicitly named property, but it is admitted by that map contract. Deleting it discards valid data.

**Suggested wording.** Detect: "Flag a supplied argument or nested key only when the effective schema excludes it at that position. Resolve object maps, admitted additional keys, key patterns, and applicable alternatives before comparing explicit property names." Do not flag: "Keys admitted by an open map or pattern contract, provided their values conform." Keep renamed or withdrawn closed-object parameters as failures.

**Observing check.** Positive: Flag session_index on a closed start_session argument object that admits no such field, including misspelled nested closed-object keys. Negative: Do not flag owner inside a labels map that explicitly admits arbitrary string keys, or a field admitted by the selected valid argument alternative.

Evidence addresses: AP-155 lines 2008–2012.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-19

**Confirmed · correction · P1**

Scope: [AP-160 · relocation-without-a-preserved-outcome](sources/anti-patterns.md#ap-160-relocation-without-a-preserved-outcome).

**Assessment.** An identical gate or output at a new site does not prove preserved paths or audience. The exemption needs the outcome comparison and confirming check required by the principle.

**Witness.** An approval gate is relocated beneath a condition that skips it on one path. The receiving gate still names the same variable and options, satisfying the current exemption, but an action can now be reached without approval. A file-name match likewise cannot prove its former audience still receives it.

**Suggested wording.** Detect: "For a relocation, identify the preserved observable outcome and compare its producer, paths, consumers, options, and audience before and after. Flag a missing preservation claim or a missing check that supports it." Do not flag: "An intentional removal recorded in the change scope, or preservation supported by a path/contract comparison or test; a matching declaration alone is insufficient." Fix: "Record the claim and evidence in the change review or planning record; express the surviving runtime contract at its owner. Record intentional retirement in the change record."

**Observing check.** Positive: Flag the relocated approval gate when an action becomes reachable through a path that skips it, even though the new gate text matches. Negative: Do not flag a move whose before/after path check preserves every required option and audience, with the evidence recorded beside the change.

Evidence addresses: AP-160 lines 2068–2072; DP-38 lines 169–169; DP-17 lines 85–85.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-20

**Confirmed · correction · P1**

Scope: [AP-161 · unproducible-declared-value](sources/anti-patterns.md#ap-161-unproducible-declared-value).

**Assessment.** Removing a promised value can mask an incomplete producer. Preserve required semantic distinctions by repairing the producing path, or explicitly scope a contract change.

**Witness.** An output contract distinguishes cancelled from completed, but no branch records user cancellation. Deleting cancelled and folding it into completed makes the enum producible while falsely reporting work completed. In the provided unanswerable/none shape, the distinction may likewise be a required negative result.

**Suggested wording.** Fix: "Where the value is required by the intended contract, add or repair a reachable producer and preserve it through later assignments. Where the value is unintended, remove it only with its consumer and semantic changes accounted for. Keep an unexercised but reachable value as unevidenced, not defective." Test: "For each feasible input class, trace assignments to the terminal state; flag a promised value that no feasible path leaves as the final value."

**Observing check.** Positive: Flag cancelled if cancellation is an admitted input event but every terminal path records completed; repair the missing branch. Negative: Do not flag a reachable, preserved rare status merely because available fixtures have not exercised it. Removing an accidental unused status is valid when it changes no required distinction.

Evidence addresses: AP-161 lines 2080–2084; DP-38 lines 169–169.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-21

**Narrowed · improvement · P3**

Scope: [MR-01 · cut-comment-jsdoc-verbosity](sources/anti-patterns.md#mr-1-cut-comment-jsdoc-verbosity).

**Assessment.** The Detect test already targets information redundancy. Remove pressure from the one-line remedy and exception; the constructed necessary multi-line invariant is not inherently redundant.

**Witness.** A surprising invariant has two independent nonlocal conditions and neither is encoded in the type system. A two-line explanation preserves both facts. A rule that requires one why-line creates pressure to omit a condition although the comment is not narration.

**Suggested wording.** Do not flag: "The shortest clear statement of a non-obvious invariant, rationale, coupling, or public contract the code and types do not express." Fix: "Delete redundant narration. Preserve every operative fact; condense or improve naming/structure when that communicates the same information more clearly."

**Observing check.** Positive: Flag "increments count" beside count += 1 when it adds no information. Negative: Do not flag a concise multi-line safety invariant whose conditions are absent from the code and types.

Evidence addresses: MR-01 lines 1612–1616.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-22

**Confirmed · improvement · P2**

Scope: [AP-129 · stale-restatement-after-change](sources/anti-patterns.md#ap-129-stale-restatement-after-change).

**Assessment.** Exact phrase searches are discovery aids. Semantic paraphrases and operative Protocol/Rules statements need coverage in a change-surface review.

**Witness.** A gate changes from unconditional resume to explicit resume intent. README contains the old exact phrase, while a Rule paraphrases it as "all saved sessions resume automatically". Searching only the old phrase and listed description surfaces can miss the operative Rule.

**Suggested wording.** Detect: "Enumerate the surfaces that state or consume the changed contract, including Protocol and Rules. Search old terms and related symbols to locate candidates, then compare each surviving claim with the current behavior. A phrase search alone is not the completeness proof." Fix: "Update or remove each semantically stale claim and record the reviewed surface; retain permitted orientation without duplicating operative ownership."

**Observing check.** Positive: Flag an old-behavior paraphrase in Rules even if its words differ from the edited README. Negative: Do not flag a historical planning record clearly describing the before-state, or an unaffected current claim.

Evidence addresses: AP-129 lines 1696–1700.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-23

**Confirmed · correction · P1**

Scope: [AP-139 · framing-outside-any-section](sources/anti-patterns.md#ap-139-framing-outside-any-section).

**Assessment.** Short operative framing can be missed by the length heuristic, and a new heading alone does not supply existing consumers. The remedy must update and verify prerequisite delivery.

**Witness.** An H1 introduction says only "Counts include retries." before the first H2. A consumer loads an H2 table and computes counts. The missing sentence is operative and short, so the substantial-framing heuristic may miss it. Adding an H2 General Rules without changing the consumer still leaves the same missing rule.

**Suggested wording.** Detect: "For each section-delivered resource, identify operative facts outside the delivered sections that the consumer needs. Flag any missing fact regardless of length; length may prioritize inspection but cannot decide applicability." Fix: "Move unique operative framing to an addressable section and update every dependent consumer to receive it, or place the fact within the consumed section. Verify the actual section delivery contains the needed obligation."

**Observing check.** Positive: Flag the short retries-counting rule when a table consumer does not receive it; adding an unrequested heading alone does not close the finding. Negative: Do not flag a long orientation paragraph no section consumer needs, or a shared obligation explicitly loaded alongside each dependent section.

Evidence addresses: AP-139 lines 1816–1820; DP-44 lines 193–193.

[Original candidate](reviews/ap_contracts/findings-07.json) · [Independent disposition](reconciliation/ap-02.json).
