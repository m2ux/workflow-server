import datetime
import hashlib
import json
import pathlib
import time

started = time.perf_counter()
out = pathlib.Path(__file__).resolve().parent
record = out.parent.parent
inventory = json.loads((record / 'inventory.json').read_text())
revision = inventory['revision']
by_id = {entry['id']: entry for entry in inventory['entries']}
assigned = inventory['assignments']['ap_contracts']['entries']


def evidence(entry, start, end):
    item = by_id[entry]
    lines = (record / item['source']).read_text().splitlines()
    assert item['start'] <= start <= end <= item['end']
    return {'entry': entry, 'source': item['source'], 'start': start, 'end': end,
            'quote': '\n'.join(lines[start - 1:end])}


findings = []


def add(number, kind, priority, entries, refs, problem, witness, proposed_fix, positive, negative):
    findings.append({'id': f'AC-{number:02}', 'kind': kind, 'priority': priority,
                     'entries': entries, 'evidence': [evidence(*ref) for ref in refs],
                     'problem': problem, 'witness': witness, 'proposed_fix': proposed_fix,
                     'observing_check': {'method': 'Apply the quoted criteria to the two constructed cases; these are canon-quality witnesses, not corpus-conformance findings.',
                                         'positive': positive, 'negative': negative}})


add(1, 'repair-conflict', 'medium', ['AP-124'],
    [('AP-124', 1584, 1588), ('AP-19', 296, 300), ('AP-25', 368, 372)],
    'The Fix combines executable alternate procedures with standing host policy and sends both to Rules. AP-19 requires work instructions in Protocol and AP-25 rejects a rule local to one step. The alternate-operation defect and the standing-policy defect also have different repairs.',
    'A technique has mutually exclusive Spawn and Resume phases, each containing calls and response handling. Moving those whole slices into operation_kind Rules follows AP-124 but leaves work instructions that AP-19 moves back to Protocol. A standing depth limit is legitimately a Rule; the spawn procedure is not. This is a repair conflict, not a claim that all alternate operations are impossible to represent.',
    'Replace Fix with: "Keep standing host policy in Rules. Express alternate work inside one outcome phase with conditional notes when it is one operation; give distinct operations separate techniques and select them at the binding site. Keep ordered outcomes in Protocol." Remove the standing-policy branch from Detect and cross-reference rule-as-protocol-step for that separate defect. Remove "A caller Applies the selected rule section."',
    'Flag Spawn and Resume as consecutive phases when exactly one runs; repair them as separate bound operations or branches of one invocation.',
    'Do not flag a cross-cutting maximum-depth Rule or one Dispatch phase with alternate argument choices and shared response handling.')

add(2, 'repair-conflict', 'medium', ['AP-125', 'AP-140', 'AP-141'],
    [('AP-125', 1598, 1600), ('AP-140', 1830, 1832), ('AP-141', 1840, 1844), ('AP-114', 1464, 1468)],
    'These entries endorse, preserve, or repair Protocol Apply sites, while AP-114 removes work-invoking technique references and places them at activity or routine binds. An author can close the local finding while preserving a different catalog violation.',
    'Technique A has an I/O entry "via [B]" and B requires project_id. AP-125 offers moving the Apply relationship into A Protocol; AP-141 then directs adding project_id to that Apply line. AP-114 flags exactly that invocation and moves B into steps[]. A separate binding-site solution exists, so this is an inconsistent repair path rather than an unsatisfiable canon.',
    'AP-125 Fix: "Keep I/O descriptions about meaning and shape. Put producer/consumer sequencing at activity or routine binds; put any technique-owned value assembly in its own Protocol." Remove its Protocol/Rules Apply carve-out. AP-140: remove the applied-op exemption and the final Apply-site repair sentence. Retire AP-141 as a Protocol-Apply repair, or replace its scope with: "For each supported activity or routine technique bind, prove that every required effective input is supplied by an explicit bind, a same-name available value, or its declared default." Route Protocol Apply sites directly to pass-orchestration-in-technique.',
    'Flag a required project_id missing from an actual technique bind; supply the value at that bind with a reachable producer.',
    'Do not flag an optional/defaulted input or a same-name value proved available at the bind. Do not repair a prohibited Protocol Apply by adding more arguments to it.')

add(3, 'repair-conflict', 'medium', ['AP-136', 'AP-144'],
    [('AP-136', 1780, 1784), ('AP-144', 1876, 1880), ('AP-157', 2032, 2036)],
    'A phase-heading link and naming a different technique as a precondition supplier are recommended fixes, yet AP-157 removes non-invoking references to other techniques when delivery does not carry the needed text. Naming a supplier is not proof the reader receives its contract or its value.',
    'A leaf Protocol says "step 3 in resolver guarantees the selected root." AP-136 permits replacing this with a link to resolver.md#3-selected-root; AP-144 permits naming resolver as the guarantee. The reference invokes nothing and needs undelivered text, which AP-157 flags.',
    'AP-136 Fix: "For a reference within the delivered Protocol, identify the outcome by its heading. Put cross-technique sequencing at the bind site. A consumer of an earlier result declares that value or checkable precondition; it does not link to an undelivered phase." AP-144 Do not flag: replace the other-technique guarantee with "A declared precondition whose evidence this reader receives and can check." Fix: "Name a supplied value or local producer, or declare the missing contract and arrange its binding. A supplier name alone does not supply the value."',
    'Flag an undeclared "already resolved root" supported only by a link to another technique; introduce a bound selected_root with its required evidence.',
    'Do not flag a declared selected_root or a local earlier phase that produces it. An orientation README may still link to the resolver phase.')

add(4, 'missing-exception', 'medium', ['AP-127'],
    [('AP-127', 1672, 1676), ('AP-52', 704, 704), ('AP-112', 1444, 1444)],
    'The literal-replacement rule includes enum members but does not distinguish a copied runtime value from a comparison constant. Its general replacement can erase a branch predicate; the expression "where {name} belongs" leaves that distinction to the reviewer.',
    'operation_type describes the selected operation and admits review/update. In "when {operation_type} is review", review is an operative enum literal and a declared slot carries operation-kind meaning. Replacing review with {operation_type} makes a self-comparison. AP-52 explicitly prescribes relating a literal to its input, and AP-112 requires gates to compare the authoritative variable directly.',
    'Add to Detect: "The literal substitutes for the current value of that slot; it is not an independently meaningful comparison operand or pattern." Add to Do not flag: "Enum members and fixed constants used to test, classify, or select the declared value, such as when {operation_type} is review." Retain the replacement rule only for copied bound values. Where the consumer is a resource, put caller-specific bindings on the technique or activity and keep the resource parameter abstract.',
    'Flag "push to workflows" when target_branch is the bound destination and may name another branch.',
    'Do not flag "when {operation_type} is review" or "retry when {attempts} is below 3" when 3 is the authoritative declared policy constant.')

add(5, 'unsound-exemption', 'medium', ['AP-128'],
    [('AP-128', 1680, 1688)],
    'Textually identical producer and reader gates do not prove availability if intervening steps change the gate inputs. The sole-producer/later-reader wording also leaves initial reads in the producer own gate unclear. A definedness test must preserve the original domain condition.',
    'enabled starts false. Step A produces result only when enabled. Step B sets enabled true. Step C reads result when enabled. A and C have the same expression, so the exemption excuses C even though this execution reaches C without result. Separately, an unseeded intent_detected gating its own sole producer cannot establish the first value.',
    'Replace the same-expression carve-out with: "Every path reaching the reader includes a producer or a valid seed; equivalent gates establish this only when the values they test cannot change between evaluations." Include conditions evaluated before a producer among readers. Fix: "Add a definedness precondition while retaining any required domain predicate, or provide an exhaustive producer/seed whose meaning the consumer can distinguish."',
    'Flag the false-to-true enabled path and an unseeded output used in its own producer gate.',
    'Do not flag matching gates with unchanged predicate inputs and a guaranteed producer before every read; a meaningful declared seed can also establish availability.')

add(6, 'improvement', 'low', ['AP-131'],
    [('AP-131', 1720, 1724)],
    'The kind-suffix test uses any sibling, although a resources folder can contain different artifact kinds. Its broad "already names its content" exemption also overlaps the missing-kind detector. This makes an otherwise useful naming check depend on which unrelated neighbor happens to exist.',
    'findings.md is a report template beside review-policy.md and decision-guide.md. It names its content, but one sibling carries -guide, so the Detect and the broad exemption support different dispositions.',
    'Replace the suffix clause with: "Within a documented family of the same resource kind, flag an id that omits that family established kind suffix and is ambiguous without opening the body." Do not flag: "An unambiguous content noun, or a resource of another kind; a sibling suffix alone does not establish a convention." Keep verb-headed consult-resource detection.',
    'Flag complete-wp for a close-out template, and an ambiguous outlier within a documented family of template names.',
    'Do not flag risk-vocabulary because a neighboring file is a decision-guide, or review-format merely because review can also be a verb.')

add(7, 'improvement', 'medium', ['AP-133'],
    [('AP-133', 1744, 1748), ('AP-20', 308, 312)],
    'Different handling in overlapping scopes is not itself ambiguous: independent constraints can apply together. A group key supplies context but does not necessarily order two still-overlapping rules. The present test should identify the missing composition or precedence decision, rather than treating difference as the defect.',
    '"Every finding cites evidence" and "High findings name an owner" both apply to a High finding without conflict or required order. Keys general and high do not, by themselves, settle two different default-owner choices.',
    'Detect: "The triggers overlap and applying both leaves an observable result underdetermined: they compete for one choice, or their order changes the required result, and neither an explicit precedence rule nor disjoint scope settles it." Do not flag: "Compatible cumulative constraints. Grouping that actually makes contexts disjoint; a group label alone does not supply precedence." Keep mutually exclusive obligations under no-contradictory-rules.',
    'Flag two applicable fallback-selection rules whose chosen output depends on an unspecified precedence.',
    'Do not flag evidence-for-all plus owner-for-High, since both obligations are simultaneously and unambiguously satisfiable.')

add(8, 'unsound-exemption', 'medium', ['AP-134'],
    [('AP-134', 1756, 1760), ('DP-32', 145, 145)],
    'The bare-citation introduction exemption permits the exact whole-plus-section pair Detect identifies as redundant delivery. Introducing a resource does not change the documented loading behavior.',
    'A Protocol first says "Consult [guide](guide.md)" as an introduction, then "Apply [Rules](guide.md#rules)". Detect flags both delivered units; the bare-introduction exemption allows the first. DP-32 states every distinct citation is delivered.',
    'Delete "A bare citation that introduces the resource" from Do not flag. Replace with: "A bare citation is appropriate when this application consumes the whole body; use that single citation and avoid additional delivered section citations. Orientation outside a delivered technique may introduce a resource with a bare link."',
    'Flag a delivered bare introduction plus an anchored citation when only the section is consumed.',
    'Do not flag a single bare citation for an audit of every entry, or only anchored citations for a narrow section consumer.')

add(9, 'repair-conflict', 'low', ['AP-135'],
    [('AP-135', 1768, 1772), ('AP-26', 384, 388)],
    '"Keep the obligation and the reason" does not distinguish an operative constraint from explanatory rationale. AP-26 removes rationale whose deletion leaves the obligation intact, including from Protocol and Rules.',
    'After deleting a duplicated tool argument shape, AP-135 keeps "Relay the map verbatim because the server performs the merge." The server-mechanism clause adds no constraint and AP-26 deletes it. This is a conflict in the prescribed retained prose, not in the caller obligation.',
    'Replace Fix with: "Keep the caller obligation and every fact needed to apply it. Drop argument shape the tool schema already declares. Put explanatory rationale in its design record; cite a canonical contract when the caller needs that contract."',
    'Flag a prose field/type roster already supplied by the tool schema, and remove a rationale-only tail.',
    'Do not flag "Pass the map verbatim" or a state-dependent obligation the tool schema cannot express; those constrain the call.')

add(10, 'repair-conflict', 'medium', ['AP-137', 'AP-158'],
    [('AP-137', 1792, 1796), ('AP-158', 2044, 2048), ('DP-26', 121, 121)],
    'AP-137 treats repeated use of one primitive as sufficient reason to author a shared output-producing wrapper. AP-158 retires a wrapper whose only contribution is naming the raw response. Reuse count does not prove there is shared interpretation, policy, or a fixed question to extract.',
    'Two substantive techniques call the same generic query tool with caller-supplied arguments and use its raw response locally for different derivations. No technique exposes that raw response as an output. AP-137 creates a generic call-and-return wrapper; AP-158 flags that wrapper because it adds no reading or fixed argument shape. This is a repair cycle unless the criterion first establishes useful shared work.',
    'AP-137 Detect: "Two or more techniques duplicate the same tool-facing interpretation, recovery policy, or argument selection for one named question, and no technique owns that shared product." Do not flag: "Independent use of a raw primitive exactly as its tool contract defines, with distinct caller-owned interpretation." Fix: "Extract the proven shared contribution; preserve direct primitive use where there is no such contribution." Cross-reference produce-path-without-a-reading as a precondition for the extraction.',
    'Flag duplicated pagination interpretation and identical absence handling for the same domain query; one shared technique can own those decisions.',
    'Do not flag two domain techniques that use the same raw query primitive but ask different questions and interpret results differently.')

add(11, 'improvement', 'medium', ['AP-138'],
    [('AP-138', 1804, 1808), ('AP-109', 1404, 1406)],
    'The destination list mixes actual readers with possible same-name matches and artifact declarations. A name in a workflow that could bind an operation does not prove that it consumes this output. Conversely, a closed-tree no-reader claim needs an explicit consumer boundary.',
    'A local output selected_item is remapped to unused_item, while an unrelated unbound technique declares selected_item. A name-only search can count the unrelated input as a destination even though the producing output has no reader.',
    'Add: "Trace each output through actual reachable binds, remaps, artifact construction, and messages to a consumer in the declared review boundary. A same-name declaration without that route is not a reader. Record unknown external consumption separately from a proved unused local output." Align technique-outputs-declared with this distinction: internal locals stay locals; externally consumable products have declared Outputs.',
    'Flag a local output whose only remap leads to a never-read variable, despite an unrelated matching input name.',
    'Do not flag an output consumed through a reachable remap or a sibling artifact template, or a public library contract whose external consumers are outside the review boundary.')

add(12, 'detection-gap', 'medium', ['AP-140'],
    [('AP-140', 1828, 1832), ('AP-111', 1428, 1432), ('AP-130', 1710, 1710)],
    'Searching only Protocol and Rules mistakes declarative consumers for unused inputs. Output recognition criteria and artifact filename templates are valid readers elsewhere in the canon. Adding a redundant Protocol mention satisfies the lexical test without changing the design.',
    'package_name is consumed only by artifact template {package_name}-plan.md, and the Protocol persists {plan}. Or confidence_floor is used by a declared Output recognition criterion while Protocol emits that Output by reference. Both inputs affect the result but AP-140 finds no occurrence in Protocol/Rules.',
    'Detect: "Resolve the effective contract and identify semantic reads in Protocol, Rules, Output recognition or construction, artifact templates, and supported binding/default expressions. Flag an input with no such use. A bare mention without consumption is not evidence of use." Fix: "Delete a proved unused input, or wire it to the actual consumer; do not add prose solely to satisfy a text search."',
    'Flag an input that appears only in its own description, or is named in a comment without affecting an operation or output.',
    'Do not flag package_name used by a declared filename template or confidence_floor used in Output recognition criteria referenced by the producing phase.')

add(13, 'improvement', 'low', ['AP-143'],
    [('AP-143', 1864, 1868)],
    'The container Rules exemption is broader than the behavior it protects. A container can itself repeat a roster from another already-delivered container, so inheritance of the repeating entry does not make that roster authoritative.',
    'A root contract declares alpha and beta, and a nested group Rules entry says "Honor alpha, beta". Both root and group rules reach each leaf. The Detect finds a behavior-free repeated roster, but the blanket container exemption can excuse it.',
    'Replace the container exemption with: "A container entry that owns an invariant the loader delivers to descendants; being a container does not exempt a redundant enumeration of already-delivered rules." Require the evidence to name the actual delivery route; an uncertain bundle is not proof that the rule already arrives.',
    'Flag the nested honor-alpha-and-beta roster after confirming both original invariants arrive at its readers.',
    'Do not flag the root definitions of alpha and beta, or a group-specific scope qualification that changes what its readers must do.')

add(14, 'improvement', 'medium', ['AP-146'],
    [('AP-146', 1900, 1904), ('DP-17', 85, 85)],
    'The entry applies an imperative-duty test to Capability and README orientation as well as runtime instructions. Those surfaces legitimately describe behavior in declarative present tense under DP-17. "Third person" needs a normative-duty boundary or an author can be told to convert orientation into commands.',
    'README orientation says "The worker produces the review report." As orientation this describes the system; if the third-person reader-duty test is applied literally after identifying workers among the audience, the suggested rewrite is "Produce the review report." The latter changes the purpose of the passage.',
    'Scope Detect: "On an instruction surface, flag a required duty attributed to the reader only through third-person narration, or an account of another actor that supplies neither an actionable obligation nor checkable evidence." Add to Do not flag: "Declarative purpose and behavior orientation on descriptions, Capability, and README surfaces, where it is not prescribing an extra duty." Keep the actor-reach and observability test for actual instructions.',
    'Flag a worker instruction that narrates an orchestrator-only internal step and leaves the worker unable to act or verify a precondition.',
    'Do not flag a present-tense README explanation of who produces a report, or a checkable precondition drawn from the reader own tool response.')

add(15, 'unsound-exemption', 'medium', ['AP-148'],
    [('AP-148', 1924, 1928), ('DP-46', 201, 201)],
    'The exemption allows a leaf to change optionality whenever that technique needs it, without testing the shared contract. Making an inherited optional input required rejects a call the ancestor contract permits, contrary to the substitutability stance in DP-46.',
    'The shared contract admits an absent filter. A leaf redeclares filter as required, then advertises the same shared contract. AP-148 exempts the change, but a consumer that legally binds the shared contract without filter cannot use that leaf.',
    'Do not flag: "A supported default or optionality override that accepts every input the advertised shared contract accepts and preserves its guarantees." Fix: "Delete duplicate prose. If a leaf needs a stricter precondition, represent it through an explicitly different contract or supply the requirement inside a conforming wrapper; do not silently narrow the inherited slot."',
    'Flag an optional-to-required override that breaks an otherwise valid shared-contract call.',
    'Do not flag deletion of duplicated wording, a permitted default within the same semantic contract, or an override that weakens an input precondition while preserving guarantees.')

add(16, 'improvement', 'low', ['AP-149'],
    [('AP-149', 1936, 1940), ('AP-02', 80, 84)],
    'The Fix says to declare a fact in the schema where the schema cannot express it, although Detect is restricted to facts already readable from that schema and the exception protects engine-owned facts the schema does not carry. This branch is either unreachable or broadens a prose cleanup into schema evolution.',
    'A duplicate operator roster can simply be deleted or linked. An actor-specific permission that the schema cannot state is instead protected by the exception; trying to put it in the schema is not the same repair and AP-02 separately constrains schema changes.',
    'Replace the final schema-extension sentence with: "A fact the schema does not express is not a restatement under this entry; keep it at its operative contract home. A proposed schema capability change is separately scoped schema work." Retain deletion/citation for facts the schema already owns.',
    'Flag a copied operator roster whose authoritative field schema contains the same choices.',
    'Do not flag an engine-owned rule about which actor resolves a gate merely because the schema cannot encode that actor duty.')

add(17, 'improvement', 'medium', ['AP-154', 'AP-155'],
    [('AP-154', 1996, 2000), ('AP-155', 2008, 2012), ('DP-21', 101, 101)],
    'A tool not registered by this corpus is categorically exempt even when its authoritative installed schema is available. Conversely, lack of a schema is an evidence gap rather than evidence the call is correct. The text should state its intentional review boundary and preserve unknowns.',
    'A workflow wraps an external harness tool whose visible schema requires repo_id. The signature omits repo_id, but the current nonregistered-tool exemption skips it. If the external schema is unavailable, the same call cannot honestly receive a correctness verdict.',
    'Replace the registration exemption with: "Apply when the tool authoritative schema is available at the reviewed revision, including an external harness contract. Where it is unavailable, record the call unevaluated with the missing source; do not invent a parameter contract." If scope is intentionally only server-registered tools, state that in Detect and report excluded external calls as outside coverage.',
    'Check and flag an omitted required argument on an external tool whose schema is supplied in the review context.',
    'Do not assert failure or success for an external tool with no available authoritative contract; record the coverage limit.')

add(18, 'missing-exception', 'medium', ['AP-155'],
    [('AP-155', 2008, 2012)],
    'Checking each name against an enumerated property list is not sufficient for a schema that intentionally admits dynamic object keys or multiple argument shapes. The nested-object sentence can flag a valid map key as an undeclared argument.',
    'A registered tool declares labels as an object map from arbitrary string keys to strings. A signature passes labels: {owner: "team-a"}. owner is not an explicitly named property, but it is admitted by that map contract. Deleting it discards valid data.',
    'Detect: "Flag a supplied argument or nested key only when the effective schema excludes it at that position. Resolve object maps, admitted additional keys, key patterns, and applicable alternatives before comparing explicit property names." Do not flag: "Keys admitted by an open map or pattern contract, provided their values conform." Keep renamed or withdrawn closed-object parameters as failures.',
    'Flag session_index on a closed start_session argument object that admits no such field, including misspelled nested closed-object keys.',
    'Do not flag owner inside a labels map that explicitly admits arbitrary string keys, or a field admitted by the selected valid argument alternative.')

add(19, 'detection-gap', 'medium', ['AP-160'],
    [('AP-160', 2068, 2072), ('DP-38', 169, 169), ('DP-17', 85, 85)],
    'A matching output, gate, or artifact declaration at the receiving site is exempted without showing that reachability, options, or audience survived. That is weaker than DP-38 requirement to name the preserved outcome and the confirming check. Requiring retirement narration at the old runtime site also blurs change evidence with current definition prose.',
    'An approval gate is relocated beneath a condition that skips it on one path. The receiving gate still names the same variable and options, satisfying the current exemption, but an action can now be reached without approval. A file-name match likewise cannot prove its former audience still receives it.',
    'Detect: "For a relocation, identify the preserved observable outcome and compare its producer, paths, consumers, options, and audience before and after. Flag a missing preservation claim or a missing check that supports it." Do not flag: "An intentional removal recorded in the change scope, or preservation supported by a path/contract comparison or test; a matching declaration alone is insufficient." Fix: "Record the claim and evidence in the change review or planning record; express the surviving runtime contract at its owner. Record intentional retirement in the change record."',
    'Flag the relocated approval gate when an action becomes reachable through a path that skips it, even though the new gate text matches.',
    'Do not flag a move whose before/after path check preserves every required option and audience, with the evidence recorded beside the change.')

add(20, 'repair-gap', 'medium', ['AP-161'],
    [('AP-161', 2080, 2084), ('DP-38', 169, 169)],
    'The Fix for a value with no producing path only deletes/folds the value. A contract may be correct while the producer is incomplete; deleting a semantically distinct required outcome can hide that defect. The test also says "as the last phase completes, a later phase", which obscures the intended last-writer check.',
    'An output contract distinguishes cancelled from completed, but no branch records user cancellation. Deleting cancelled and folding it into completed makes the enum producible while falsely reporting work completed. In the provided unanswerable/none shape, the distinction may likewise be a required negative result.',
    'Fix: "Where the value is required by the intended contract, add or repair a reachable producer and preserve it through later assignments. Where the value is unintended, remove it only with its consumer and semantic changes accounted for. Keep an unexercised but reachable value as unevidenced, not defective." Test: "For each feasible input class, trace assignments to the terminal state; flag a promised value that no feasible path leaves as the final value."',
    'Flag cancelled if cancellation is an admitted input event but every terminal path records completed; repair the missing branch.',
    'Do not flag a reachable, preserved rare status merely because available fixtures have not exercised it. Removing an accidental unused status is valid when it changes no required distinction.')

add(21, 'improvement', 'low', ['MR-01'],
    [('MR-01', 1612, 1616)],
    'The information-redundancy test is useful, but a one-line rationale exception and single why-line repair can compress a necessary multi-part safety or API constraint past usefulness. The operative distinction is information the code already communicates, not line count.',
    'A surprising invariant has two independent nonlocal conditions and neither is encoded in the type system. A two-line explanation preserves both facts. A rule that requires one why-line creates pressure to omit a condition although the comment is not narration.',
    'Do not flag: "The shortest clear statement of a non-obvious invariant, rationale, coupling, or public contract the code and types do not express." Fix: "Delete redundant narration. Preserve every operative fact; condense or improve naming/structure when that communicates the same information more clearly."',
    'Flag "increments count" beside count += 1 when it adds no information.',
    'Do not flag a concise multi-line safety invariant whose conditions are absent from the code and types.')

add(22, 'improvement', 'low', ['AP-129'],
    [('AP-129', 1696, 1700)],
    'Searching the old wording is a good discovery technique but cannot establish that every claim was updated: paraphrases may assert the same old contract, and Protocol/Rules are absent from the named surface list. The rule should separate locating candidates from deciding semantic staleness.',
    'A gate changes from unconditional resume to explicit resume intent. README contains the old exact phrase, while a Rule paraphrases it as "all saved sessions resume automatically". Searching only the old phrase and listed description surfaces can miss the operative Rule.',
    'Detect: "Enumerate the surfaces that state or consume the changed contract, including Protocol and Rules. Search old terms and related symbols to locate candidates, then compare each surviving claim with the current behavior. A phrase search alone is not the completeness proof." Fix: "Update or remove each semantically stale claim and record the reviewed surface; retain permitted orientation without duplicating operative ownership."',
    'Flag an old-behavior paraphrase in Rules even if its words differ from the edited README.',
    'Do not flag a historical planning record clearly describing the before-state, or an unaffected current claim.')

add(23, 'detection-gap', 'medium', ['AP-139'],
    [('AP-139', 1816, 1820), ('DP-44', 193, 193)],
    'A roughly 100-character leading-body threshold can miss a short operative constraint. Moving framing under a new heading makes it addressable but does not itself deliver it to existing section consumers; the Fix needs to close that dependency.',
    'An H1 introduction says only "Counts include retries." before the first H2. A consumer loads an H2 table and computes counts. The missing sentence is operative and short, so the substantial-framing heuristic may miss it. Adding an H2 General Rules without changing the consumer still leaves the same missing rule.',
    'Detect: "For each section-delivered resource, identify operative facts outside the delivered sections that the consumer needs. Flag any missing fact regardless of length; length may prioritize inspection but cannot decide applicability." Fix: "Move unique operative framing to an addressable section and update every dependent consumer to receive it, or place the fact within the consumed section. Verify the actual section delivery contains the needed obligation."',
    'Flag the short retries-counting rule when a table consumer does not receive it; adding an unrequested heading alone does not close the finding.',
    'Do not flag a long orientation paragraph no section consumer needs, or a shared obligation explicitly loaded alongside each dependent section.')


ledger = []


def row(entry, disposition, scope, observable, consistency, exceptions, fix, expression, rationale, finding_ids=(), related_ids=()):
    ledger.append({'id': entry, 'disposition': disposition,
                   'checks': {'scope': scope, 'observable': observable, 'consistency': consistency,
                              'exceptions': exceptions, 'fix': fix, 'expression': expression},
                   'rationale': rationale, 'finding_ids': list(finding_ids), 'related_ids': list(related_ids)})


row('AP-124', 'finding', 'Protocol alternatives and host policy are two different subjects.', 'Exactly-one variant selection can be observed from branches and calls.', 'Procedural slices in Rules collide with AP-19 and AP-25.', 'Single-phase alternatives and standing policy are legitimate but different cases.', 'Separate operations or branch one outcome; keep only invariants in Rules.', 'The compound Detect hides two different repairs.', 'An observable smell is paired with a migration that recreates procedural Rules.', ['AC-01'], ['AP-19', 'AP-25', 'AP-121', 'DP-15'])
row('AP-125', 'finding', 'Technique associations in I/O are clearly delimited.', 'Links and producer/executor wording are directly inspectable.', 'The Protocol Apply repair conflicts with AP-114.', 'Resource links are sound; the Apply exemption needs removal.', 'Keep relationships at supported binds and I/O about meaning/shape.', 'The example resource phrase also illustrates HOW, so examples should avoid conditional duties.', 'Retain the I/O boundary but repair its recommended destination.', ['AC-02'], ['AP-42', 'AP-114', 'AP-119', 'AP-141'])
row('MR-01', 'improvement', 'Comments/JSDoc, with licenses and non-expressible API contracts excepted.', 'Information loss on deletion is observable through the code and types.', 'Its information test agrees with succinctness; a line limit is not necessary.', 'Necessary rationale can require more than one line.', 'Delete redundant narration while retaining every non-obvious operative fact.', 'Single why-line is more restrictive than the stated defect.', 'A small exception/repair change preserves the useful redundancy test.', ['AC-21'], [])
row('MR-02', 'clear', 'Prose adjacent to complete examples and Templates.', 'The detector requires that the paragraph only re-explain shown keys.', 'Template and Rules ownership agree with resource citation principles.', 'Additional constraints fall outside the only-restatement trigger.', 'Delete repeated explanation and cite the actual fill rules.', 'The field/timeout exemplar distinguishes duplication from new information.', 'No necessary numerical density threshold: factual duplication is a usable qualitative test.', [], ['AP-90', 'AP-102', 'DP-06'])
row('MR-03', 'clear', 'Reusable content carrying literal host or worktree roots.', 'A checkout-specific path can be compared with declared placeholders.', 'Portability agrees with AP-61 and AP-127.', 'Resolved paths in planning evidence are explicitly protected.', 'Replace only the machine root with the applicable supplied placeholder.', 'Concrete bad example and portable alternatives make the criterion understandable.', 'The scope separates portable instructions from session evidence.', [], ['AP-61', 'AP-127', 'AP-132'])
row('MR-04', 'clear', 'Parallel install/build/start guidance already owned by setup.', 'Compare runbook steps with the setup home and unique deltas.', 'Single ownership and retained workflow deltas are coherent.', 'Workflow-specific material and orientation links are protected.', 'Use the setup link and retain only additional requirements.', 'The clone/install/start exemplar identifies the repeated content.', 'The rule detects copied operating instructions rather than all secondary documentation.', [], ['AP-74', 'DP-06'])
row('AP-126', 'clear', 'Workflow variable descriptions only.', 'Sentence count and producer/gate/default restatements can be inspected.', 'Meaning and compact shape agree with I/O contract separation.', 'Shape hints remain; value rosters move to structured values.', 'Keep the value definition and remove wiring tails.', 'One-line is best read as one concise definition, not rendered screen width.', 'The structural tails provide an observable test beyond the qualitative word essay-length.', [], ['AP-151', 'AP-42', 'DP-13'])
row('AP-127', 'finding', 'Operative literals across definitions require a reference-versus-constant distinction.', 'Declared-slot meaning is evidence, but does not decide comparison operands.', 'Direct enum comparisons are required by AP-52/AP-112.', 'Missing a constant-in-predicate exception.', 'Replace copied bound values, not meaningful test constants.', 'Where a designator belongs assumes the question the detector must decide.', 'A literal enum member can be correct operative syntax rather than duplicated state.', ['AC-04'], ['AP-52', 'AP-112', 'DP-14', 'DP-30'])
row('AP-128', 'finding', 'Readers of possibly unproduced values, including pre-producer conditions.', 'Control paths and assignments establish availability.', 'Identical predicates are insufficient when their inputs change.', 'Same-expression exemption can admit a skipped producer.', 'Prove dominance/definedness while preserving domain predicates.', 'Sole producer and later reader wording misses some initial-read cases.', 'A concrete false-to-true gate mutation reproduces the unsound exemption.', ['AC-05'], ['AP-112', 'AP-161'])
row('AP-129', 'improvement', 'Changed contracts and claims that describe or consume them.', 'Semantic comparison is stronger than exact old-phrase hits.', 'One-home remediation remains coherent.', 'Historical evidence is correctly exempt.', 'Enumerate relevant claims and then update or remove semantic staleness.', 'Named surface list omits Rules/Protocol and can read as exhaustive.', 'Make search a locating method rather than the entire completeness test.', ['AC-22'], ['AP-103', 'AP-149', 'DP-06'])
row('AP-130', 'clear', 'Artifact declaration bodies as filenames under an assigned prefix.', 'Literal/template filenames versus prose or multiple destinations are distinguishable.', 'Separate outputs and bind-gated modes fit artifact ownership.', 'Token templates are explicitly valid.', 'Split actual files; declare sibling-owned files at the sibling.', 'The one-filename invariant is concrete and examples cover common confusions.', 'Filename selection remains a narrow declaration rule; no current-engine conformance claim is made.', [], ['AP-31', 'AP-44', 'AP-138'])
row('AP-131', 'improvement', 'Consult-resource identities and established naming families.', 'Verb-headed names are observable; unrelated siblings are weak evidence of a suffix convention.', 'Convention search is sound but should compare like resource kinds.', 'Already names content overlaps the missing-kind test.', 'Rename genuinely ambiguous family outliers; preserve unambiguous nouns.', 'Specify which sibling family establishes the kind suffix.', 'Narrowing the suffix branch would reduce inconsistent naming verdicts.', ['AC-06'], ['DP-07'])
row('AP-132', 'clear', 'Deployment locations in Capability.', 'Substitute another artifact root while keeping the capability constant.', 'Locations belong in bound inputs/defaults and Protocol, consistent with DP-13.', 'An operation whose subject is the path is explicitly protected.', 'State the artifact class and declare the needed location.', 'The portability test gives the path detector a semantic boundary.', 'A concrete relocation thought experiment is sufficient qualitative evidence.', [], ['MR-03', 'AP-61', 'DP-13'])
row('AP-133', 'improvement', 'Intersecting triggers with underdetermined composition or precedence.', 'A joint-input witness is available, but different handling alone is not the defect.', 'Contradiction ownership remains AP-24; group labels do not necessarily order rules.', 'Compatible cumulative constraints deserve an explicit exemption.', 'Order genuinely competing choices or make contexts disjoint.', 'Clarify underdetermined behavior before listing threshold examples.', 'The intersection test becomes useful when it distinguishes coexistence from competition.', ['AC-07'], ['AP-20', 'AP-24', 'AP-22'])
row('AP-134', 'finding', 'Delivered technique citations into multi-section resources.', 'Bare-plus-anchor delivery is directly observable under DP-32.', 'The introduction carve-out undermines the duplicate-delivery detector.', 'Whole-body use is valid; introduction alone does not justify delivery.', 'Keep one whole citation or the required anchors, based on consumed content.', 'The introduction exemption needs an explicit nondelivered-surface boundary.', 'The same citation pair can be flagged and excused without a semantic difference.', ['AC-08'], ['DP-32', 'AP-139'])
row('AP-135', 'finding', 'Tool argument shape restated in Protocol or Rules.', 'Compare the prose to the schema the harness actually presents.', 'Keeping all reasons conflicts with AP-26 rationale deletion.', 'Caller obligations outside schema expressiveness are correctly retained.', 'Keep actionable obligations and facts; remove redundant shape and rationale.', 'Reason conflates an operative condition with an explanation.', 'The detection is sound; the retained-text instruction needs precision.', ['AC-09'], ['AP-26', 'AP-153', 'AP-154', 'DP-21'])
row('AP-136', 'finding', 'References to numbered phases from other surfaces.', 'Inserting a phase demonstrates ordinal instability.', 'A recommended cross-technique phase link conflicts with AP-157.', 'Local references and orientation links need separate treatment.', 'Name a supplied outcome/precondition; keep cross-technique sequencing at binds.', 'The heading-link repair silently assumes access to the target text.', 'Stable naming alone does not provide the referenced instruction or value.', ['AC-03'], ['AP-144', 'AP-157', 'DP-36'])
row('AP-137', 'finding', 'Repeated shared capability, not necessarily repeated raw tool use.', 'Duplicate interpretation/policy is evidence of shared work; two call sites alone are insufficient.', 'Required extraction can produce the wrapper AP-158 retires.', 'Add primitive-use exemption when caller readings differ.', 'Extract the shared reading only when one exists.', 'Capability needs a semantic contribution beyond the same tool name.', 'A call-and-return wrapper is not justified by occurrence count alone.', ['AC-10'], ['AP-158', 'AP-110', 'DP-26'])
row('AP-138', 'improvement', 'Local output liveness over a declared consumer boundary.', 'Trace actual binds/remaps to readers; name matches alone are weak evidence.', 'Reconcile actual consumers with AP-109 potentially bindable products.', 'External library consumers are appropriately recognized but evidence limits should be explicit.', 'Remove proved dead outputs, not merely unsearched public contracts.', 'Can bind the op is weaker than does consume this output.', 'A consumer inventory and dataflow check would make no-reader claims reproducible.', ['AC-11'], ['AP-109', 'AP-140', 'AP-161'])
row('AP-139', 'finding', 'Operative framing absent from section delivery.', 'The delivered span and required obligations can be compared directly.', 'DP-44 requires framing reach; a character-count heuristic does not establish it.', 'Orientation-only prose is correctly exempt regardless of length.', 'Update dependent citations as well as introducing the addressable section.', 'Roughly 100 characters is a poor proxy for operative importance.', 'A short rule can be decisive; an unrequested new section remains undelivered.', ['AC-23'], ['AP-134', 'DP-44', 'DP-32'])
row('AP-140', 'finding', 'Semantic consumers of effective inputs.', 'Protocol/Rules text search misses templates and Output recognition criteria.', 'Output-owned recognition is allowed by AP-111; Apply repairs conflict with AP-114.', 'Container reach is valid; applied-op exemption preserves a prohibited path.', 'Wire the real consumer or delete a proved unused slot.', 'Never read is a semantic claim stronger than absent in two sections.', 'The current detector can flag a live input and reward a redundant mention.', ['AC-02', 'AC-12'], ['AP-111', 'AP-114', 'AP-130', 'AP-141'])
row('AP-141', 'finding', 'The subject is a Protocol Apply form AP-114 removes.', 'Required-input comparison is inspectable but belongs at supported bind sites.', 'Adding arguments preserves the separately prohibited invocation.', 'Activity binds are excluded even though they are the canonical invocation surface.', 'Retire the Protocol-Apply repair or restate binding completeness at actual binds.', 'The detailed contract resolution is useful at the correct layer.', 'Move the valuable completeness test to a form the canon endorses.', ['AC-02'], ['AP-114', 'AP-140', 'AP-153', 'DP-25'])
row('AP-142', 'clear', 'Magnitude-based branches lacking an available comparison value.', 'A declared threshold, policy row, or returned budget supplies evidence.', 'Observable qualitative conditions are expressly allowed.', 'Harness-owned thresholds and counts derivable from existing definitions are protected.', 'Declare a real owner or use an observable condition.', 'The example list illustrates missing operands without requiring all principles to be numeric.', 'This is a useful model of an observable criterion with qualitative carve-outs.', [], ['DP-09'])
row('AP-143', 'improvement', 'Already-delivered inherited or bundled rule rosters.', 'Compare actual delivery with the repeating citation list.', 'Container ownership is valid but does not excuse a container copying another roster.', 'Narrow the blanket container exemption.', 'Delete redundant rosters while retaining unique qualifications.', 'Already receives is a meaningful prerequisite that must be proved.', 'A small exception clarification handles duplicate container rosters.', ['AC-13'], ['AP-22', 'AP-53', 'AP-148', 'DP-06'])
row('AP-144', 'finding', 'Provenance and uniqueness of referenced values or completed actions.', 'Name a supplied contract/local producer and distinguish multiple candidates.', 'A technique guarantee by name can conflict with AP-157 delivery requirements.', 'Anchored local references and checkable evidence are sound; a supplier name alone is not.', 'Declare and bind the value/precondition rather than linking an unavailable producer.', 'Name the supplier should not imply naming is sufficient.', 'The provenance test needs evidence delivery as well as an address.', ['AC-03'], ['AP-16', 'AP-54', 'AP-136', 'AP-157'])
row('AP-145', 'clear', 'Bootstrap text before session-backed lookup exists.', 'Remove references and test whether every instruction still has executable substance.', 'DP-33 explicitly permits necessary inline substance at this boundary.', 'Direct resource URIs and forward labels have actionable versus descriptive roles.', 'Inline the required substance and mark future-home labels as nonessential now.', 'The temporal scope and strike-reference test are concrete.', 'AP-122 deletion applies only when citation preserves fidelity; an unresolved pre-session cite cannot meet that premise.', [], ['AP-122', 'AP-53', 'DP-33', 'DP-06'])
row('AP-146', 'improvement', 'Instruction audience and duty reach, with orientation needing a separate boundary.', 'Check whether the reader can act on or verify the described fact.', 'Third-person duty rewriting can compete with DP-17 orientation voice.', 'Checkable preconditions and role data are protected; add descriptive orientation.', 'Address actual duties to the reader while preserving legitimate descriptions.', 'The surface list is broader than the word instruction suggests.', 'Narrow normative duty detection instead of treating all third-person behavior as instruction.', ['AC-14'], ['AP-37', 'AP-147', 'DP-17'])
row('AP-147', 'clear', 'Technique-local rules attempting to own wider subject policy.', 'Compare constrained subject, produced product, and delivered audience.', 'The exceptions distinguish local conformance from wider ownership.', 'Own outputs/cadence and canonical pointers remain valid.', 'Move wider policy to its owner and retain the technique-specific obligation.', 'The subject/reader tests are concrete qualitative checks.', 'Broad policy scope is measurable by who is bound and whether they receive the rule.', [], ['AP-104', 'AP-146', 'DP-06'])
row('AP-148', 'finding', 'Leaf Inputs repeated from merged ancestor contracts.', 'Resolve the effective contract and compare duplicate or changed slots.', 'Unrestricted optionality changes can violate DP-46 substitutability.', 'Contract-changing exemptions need an accepted-input/guarantee test.', 'Remove duplicates; represent stricter needs through a distinct contract or conforming wrapper.', 'Optionality the technique needs is not a sufficient safety condition.', 'A required leaf input can reject a call the advertised ancestor permits.', ['AC-15'], ['AP-55', 'AP-143', 'DP-46'])
row('AP-149', 'improvement', 'Prose repeating facts already readable from schema.', 'Compare the semantic claim to the schema-owned field.', 'The schema-extension Fix exceeds Detect and AP-02 scope.', 'Engine-only facts the schema cannot carry are correctly exempt.', 'Delete/cite owned facts; separately scope new schema capability.', 'Cannot express then declare it in schema is unclear and potentially unexecutable.', 'Remove the repair branch that does not follow from the detector.', ['AC-16'], ['AP-02', 'AP-151', 'DP-06'])
row('AP-150', 'clear', 'Engine internals disclosed to a caller with only tool-level reach.', 'Deletion should leave calls, arguments, and recognizable outcomes unchanged.', 'Actionable constraints remain under DP-17 and tool-contract principles.', 'Paths to write, failure recognition, and behavior invariants are protected.', 'Keep the obligation and tool interaction while removing irrelevant machinery.', 'The changed-action test disambiguates useful detail from narration.', 'This is an observable relevance rule rather than a blanket ban on technical explanation.', [], ['AP-50', 'AP-117', 'DP-17'])
row('AP-151', 'clear', 'Fixed admitted values of declared variables in prose only.', 'Compare enumerated prose with the variable values declaration.', 'Structured enum ownership complements AP-126 and AP-149.', 'Computed sets and non-string forms the schema cannot carry are excepted.', 'Declare the supported set once and leave meaning/absence in prose.', 'The added-option thought experiment exposes the drift risk.', 'A structural source-of-truth test is possible without testing every enum member dynamically.', [], ['AP-126', 'AP-149', 'AP-161', 'DP-06'])
row('AP-152', 'clear', 'Independent constraints bundled into one named Rule.', 'Independently citable/editable parts are the actual test.', 'Single-invariant stance matches DP-45 and duplicate ownership exclusions.', 'Length alone does not decide; subordinate cases remain with their invariant.', 'Split independently owned constraints and retain dependent qualification.', 'Signals are explicitly subordinate to the semantic independence test.', 'The rule correctly avoids replacing clarity with a numeric sentence budget.', [], ['AP-22', 'AP-25', 'AP-133', 'DP-45'])
row('AP-153', 'clear', 'Tool arguments required by reachable runtime states but optional in schema.', 'Use tool description/refusal plus the state the Protocol reaches.', 'Separates state-dependent duties from schema-shape copying in AP-135.', 'Marked partial signatures and state-independent optional arguments are excluded.', 'Pass the needed value and describe when an optional input may be absent.', 'The refusal witness and stated reachable state make the criterion operational.', 'Useful boundary: schema validity alone cannot establish call success in reachable states.', [], ['AP-135', 'AP-154', 'AP-155'])
row('AP-154', 'improvement', 'Whole tool signatures against an authoritative parameter schema.', 'A missing required parameter is directly observable when the schema is available.', 'DP-21 covers the actual harness; registration alone is not its evidence boundary.', 'Partial signatures are legitimate; unavailable contracts need an evidence-gap result.', 'Add missing arguments and sweep equivalent call sites.', 'State whether external harness calls are in scope or unreviewed.', 'The structural test is clear; broaden or explicitly document the tool boundary.', ['AC-17'], ['AP-153', 'AP-155', 'DP-21'])
row('AP-155', 'finding', 'Supplied arguments against the effective argument contract.', 'Explicit-key comparison must include dynamic maps and valid schema alternatives.', 'DP-21 requires actual acceptance semantics, not merely a property-name roster.', 'Open maps and unavailable external contracts need explicit treatment.', 'Delete or rename truly excluded parameters only.', 'At that level does not explain admitted unnamed object keys.', 'Valid dynamic data can be mistaken for an undeclared argument.', ['AC-17', 'AC-18'], ['AP-153', 'AP-154', 'DP-21'])
row('AP-156', 'clear', 'Top-level Protocol phases written as numbered list items.', 'Markdown heading/list structure is mechanically distinguishable.', 'Phase headings agree with DP-15 and DP-39.', 'Ordered substeps inside a real phase remain valid.', 'Create one outcome heading and keep its actual work beneath it.', 'The anchor test explains the structural distinction.', 'No extra phase should be invented solely to house a standing rule or caveat.', [], ['AP-108', 'AP-121', 'DP-15', 'DP-39'])
row('AP-157', 'clear', 'Non-invoking technique references requiring undelivered text.', 'Determine what reference resolution requires and what delivery carries.', 'The delivery premise matches DP-36; related repair conflicts are attributed to their owners.', 'Resources, orientation, technique-id data, and work invokes are distinguished.', 'State the needed fact or place sequencing at its binding owner.', 'The test correctly requires inaccessible content, not just a link-shaped token.', 'As a delivery-boundary invariant this is clear; AP-136/AP-144 recommendations need alignment.', [], ['AP-114', 'AP-125', 'AP-136', 'AP-144', 'DP-36'])
row('AP-158', 'finding', 'Wrappers with no reading beyond raw response naming.', 'Compare added interpretation/fixed-question argument selection with the tool contract.', 'The criterion is useful but AP-137 can require exactly the wrapper it retires.', 'Output/Rules readings and fixed-question wrappers remain legitimate.', 'Retain useful interpretation; avoid creating a wrapper from reuse count alone.', 'No numeric complexity threshold is necessary to show additional judgment.', 'The local criterion is sound; shared-capability extraction must honor it before creating a technique.', ['AC-10'], ['AP-137', 'AP-110', 'DP-26'])
row('AP-159', 'clear', 'Definition-bearing construct subfolders and their orientation.', 'Enumerate folders and inspect local or file-grain parent README coverage.', 'Matches DP-11 with a defined parent-orientation alternative.', 'Fixtures/specimens and already-indexed children are correctly excluded.', 'Add purpose/shared domain/next-link orientation without transcribing contracts.', 'The required folder list makes completeness assessable.', 'The check uses concrete orientation evidence rather than demanding duplicated README content.', [], ['AP-40', 'DP-11'])
row('AP-160', 'finding', 'Relocations whose preserved outcome needs before/after evidence.', 'Compare paths/options/consumers/audiences, not only declaration names.', 'The same-declaration exemption is weaker than DP-38 confirming-check requirement.', 'Intentional removals are valid; matching text alone is not preservation.', 'Record change evidence in planning/review; keep current runtime contracts at their owners.', 'Receiving-site and old-site narration blur live design with change evidence.', 'A move can preserve a gate name while making the gate skippable.', ['AC-19'], ['AP-129', 'DP-38', 'DP-17'])
row('AP-161', 'finding', 'Enumerated output values and terminal assignments over feasible paths.', 'A last-writer path trace can distinguish unreachable values from untested values.', 'A promised value may need implementation rather than deletion.', 'Unevidenced but feasible values are correctly protected.', 'Repair required production paths; remove only unintended distinctions with consumers accounted for.', 'Last phase followed by later phase is an unclear description of terminal overwrite.', 'The value-reachability detector is useful; its missing-path repair must preserve intended semantics.', ['AC-20'], ['AP-128', 'AP-151', 'DP-13', 'DP-38'])

assert set(entry['id'] for entry in ledger) == set(assigned)
assert len(ledger) == len(assigned) == 42
assert len(set(entry['id'] for entry in ledger)) == len(ledger)
order = {entry: number for number, entry in enumerate(assigned)}
ledger.sort(key=lambda entry: order[entry['id']])
known_findings = {entry['id'] for entry in findings}
assert all(set(entry['finding_ids']) <= known_findings for entry in ledger)


def batches(items, key, prefix, count_limit):
    current = []
    written = []
    for item in items:
        candidate = current + [item]
        payload = {'reviewer': 'ap_contracts', 'revision': revision, key: candidate}
        raw = (json.dumps(payload, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
        if current and (len(raw) > 16000 or len(candidate) > count_limit):
            written.append(current)
            current = [item]
        else:
            current = candidate
    if current:
        written.append(current)
    manifests = []
    for number, batch in enumerate(written, 1):
        path = out / f'{prefix}-{number:02}.json'
        raw = (json.dumps({'reviewer': 'ap_contracts', 'revision': revision, key: batch}, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
        assert len(raw) <= 16000
        path.write_bytes(raw)
        manifests.append({'path': path.name, 'entries': len(batch), 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
    return manifests


files = batches(ledger, 'entries', 'ledger', 8) + batches(findings, 'findings', 'findings', 4)
summary = {'revision': revision, 'primary_entries': len(ledger),
           'dispositions': {kind: sum(entry['disposition'] == kind for entry in ledger) for kind in ('clear', 'finding', 'improvement')},
           'findings': len(findings), 'finding_kinds': sorted({entry['kind'] for entry in findings}),
           'files': files, 'write_elapsed_seconds': time.perf_counter() - started,
           'finished_utc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
(out / 'batch-manifest.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
