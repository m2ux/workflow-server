"""Render the coordinator's source-derived principle dispositions and proposals."""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
record = here.parents[1]
inventory = json.loads((record / 'inventory.json').read_text())
index = {entry['id']: entry for entry in inventory['entries']}

# Each row records the actual qualitative judgment, not a generated conformance verdict.
rows = [
 (1, 'clear', 'Repeated or externally established procedures.', 'Show the accepted procedure and its graph; portability is visible in references.', 'DP-42 locates a reusable application in a routine.', 'Novel work is explicitly outside the graph or a design update.', 'The metaphor is followed by a concrete source and construct distinction.', [], ['DP-42']),
 (2, 'clear', 'Preparation before authoring.', 'Receipt of construct, schema and local convention context is observable.', 'Supports DP-05 and DP-07 without replacing their checks.', 'No extra exception is needed for this preparation duty.', 'The body says read; it does not require proving an internal mental state.', [], ['DP-05','DP-07']),
 (3, 'finding', 'File scope before execution and at closeout.', 'A manifest is observable; discovery between those two checks lacks a transition rule.', 'Contract closure can reveal files after the initial list.', 'No treatment of newly discovered dependencies is stated.', 'Complete before starting leaves the discovery boundary unclear.', ['PD-01'], []),
 (4, 'finding', 'Requests with materially different interpretations.', 'A question can be observed, but its answer is not required by the literal body.', 'The title promises clarification before assumption.', 'Independent investigation and prior explicit answers are unspecified.', 'Ask before acting leaves an ask-then-assume loophole.', ['PD-02'], ['DP-08']),
 (5, 'clear', 'Representation supported by the schema.', 'Compare intended semantics with available native constructs and repeated prose.', 'DP-09 addresses enforcement; this addresses representation.', 'A construct must provide the intended semantics to be the most specific match.', 'Concrete construct/prose distinction supports the broad preference.', [], ['DP-09']),
 (6, 'improvement', 'Ownership of operative facts across delivered surfaces.', 'Find one editable owner and trace delivered projections.', 'DP-29/33/36 and AP-23/74 need one explicit delivery interpretation.', 'Delivery copies are expressly permitted if they are not independent edit homes.', 'The copy exception needs provenance and maintenance semantics.', ['PD-03'], ['DP-29','DP-33','DP-36','AP-23','AP-74']),
 (7, 'clear', 'Introducing a naming or structural pattern.', 'Record the search and compare the proposed pattern with existing examples.', 'AP-04 adds its specific approval test.', 'An existing convention supplies the default.', 'Search before introducing is a directly observable action.', [], ['AP-04']),
 (8, 'improvement', 'Changes with irreversible or partial reversal costs.', 'Record impact and explicit authority for the particular effect.', 'DP-10 has the more specific removal condition.', 'Existing authority and the meaning of semi-reversible are unstated.', 'The risk boundary benefits from operational examples.', ['PD-04'], ['DP-10']),
 (9, 'finding', 'Critical constraints affecting execution.', 'Inspect whether rejection prevents the prohibited path, not merely whether a field exists.', 'AP-79 concerns structural backing.', 'Human judgments can be represented by a recorded checkpoint decision.', 'Critical and is a checkpoint do not define effective enforcement.', ['PD-05'], ['AP-79']),
 (10, 'improvement', 'Removing existing material.', 'Compare content and match each removal to informed approval.', 'DP-08 covers impact; DP-38 preserves relocation outcomes.', 'Prior approval already naming the removal should be distinguished from new scope.', 'Approval is observable, but the renewal boundary is unstated.', ['PD-04'], ['DP-08','DP-38']),
 (11, 'clear', 'Workflow roots and construct folders readers open.', 'Enumerate folders and their own or parent file-grain orientation.', 'AP-159 supplies the targeted folder test and fixture exception.', 'A parent README can supply the orientation explicitly.', 'Purpose and a file-grain index are inspectable.', [], ['AP-159']),
 (12, 'finding', 'Artifacts and checkpoints for a declared audience.', 'An artifact can coherently own several new facts; one fact has no defined grain.', 'AP-84 expressly allows a closeout document with retrospective sections.', 'Links preserve other owners without requiring one file per scalar.', 'Fact, record and decision are conflated.', ['PD-06'], ['AP-84','AP-88']),
 (13, 'clear', 'Technique value contracts versus work procedure.', 'Classify a sentence as meaning/shape/recognition or as instructions for producing/using a value.', 'AP-111 and AP-119 distinguish recognition from procedural work.', 'Output recognition is explicitly allowed.', 'The how/what distinction is supported by examples and placement rules.', [], ['AP-111','AP-119']),
 (14, 'clear', 'Authoritative session state.', 'Find independent variables representing the same fact and possible divergent writes.', 'AP-112 distinguishes state shadows from declared output projections.', 'Correlated facts are separate facts.', 'The state ownership invariant is concrete.', [], ['AP-112']),
 (15, 'clear', 'Sequential Protocol phases.', 'Identify an outcome, prerequisite order and elaborating bullets.', 'DP-39 owns heading wording; AP-108 owns collapsed phases.', 'Facets of one outcome stay in the same phase.', 'Outcome and dependency provide a qualitative test.', [], ['DP-39','AP-108']),
 (16, 'finding', 'Protocol designators and technique argument notation.', 'Reference forms are inspectable, but the invocation form conflicts with the current composition policy.', 'DP-25 and AP-114 prohibit the Protocol work calls this notation assumes.', 'A spelling requirement does not by itself authorize an invocation.', 'The supported surface for technique arguments needs a single home.', ['PD-07'], ['DP-25','AP-51','AP-56','AP-114']),
 (17, 'clear', 'Enumerated definition prose and README orientation.', 'Read whether it states the present design rather than a change history.', 'The scope excludes issue and PR narratives.', 'Examples quoted for analysis are not definition assertions.', 'The tense and subject are inspectable.', [], []),
 (18, 'improvement', 'Shared capability and caller-specific divergence.', 'Compare the needed behavior with the shared contract and supported bindings.', 'AP-110 and DP-47 need a documented extension boundary.', 'Cannot absorb diversity lacks a recorded contract-gap test.', 'The preference is sound; its local-recipe exception needs evidence.', ['PD-08'], ['AP-110','DP-47']),
 (19, 'improvement', 'Semantic naming plus several spelling and type conventions.', 'Individual naming tests are observable.', 'AP-58/64/65/66/67 already own specific spelling defects.', 'The rule-slug clause expressly prefers clarity over forced negation removal.', 'Independent policies occupy one supposedly single-invariant heading.', ['PD-09'], ['AP-58','AP-64','AP-65','AP-66','AP-67','DP-45']),
 (20, 'clear', 'Activity flow versus technique work.', 'Find stage/checkpoint/transition references and identify the owning execution layer.', 'DP-24/25 further constrain interaction and composition.', 'Producing a value later used by a gate does not itself own the gate.', 'The owner distinction is concrete.', [], ['DP-24','DP-25']),
 (21, 'clear', 'Tool names, response shapes, bootstrap and documentation.', 'Compare against the pinned harness contract and measured responses.', 'DP-41 addresses response-derived interpretation.', 'One authoritative behavior home can be cited from consumers.', 'Explicit subjects and comparison sources make this observable.', [], ['DP-41']),
 (22, 'improvement', 'Separately authored definition constructs.', 'Compare file ownership with the construct model.', 'AP-01 explicitly permits schema-required inline literals.', 'The unqualified word construct can also describe required inline actions.', 'The principle needs the same inline boundary as its covering AP.', ['PD-10'], ['AP-01']),
 (23, 'clear', 'Requests whose scope includes implementation.', 'A recommendation has an executed action or an explicit stop.', 'It does not grant authority beyond the request.', 'Implementation outside scope is already excluded.', 'The follow-through condition is directly observable.', [], []),
 (24, 'improvement', 'Session/operator interaction versus domain tool work.', 'Identify who receives the product and which construct owns delivery.', 'AP-113 permits delivery operations whose domain owns the channel.', 'External domain delivery needs an explicit distinction from operator chat.', 'Person and session are not interchangeable scopes.', ['PD-11'], ['AP-113']),
 (25, 'finding', 'Composing sibling/shared technique work.', 'Inspect binding-site steps and distinguish them from Protocol work invokes.', 'DP-42 and AP-114 expressly permit routine composition.', 'The activity-only wording leaves authoring versus expanded execution unclear.', 'State activity-or-routine ownership and retire obsolete Protocol invocation guidance.', ['PD-07'], ['DP-16','DP-42','AP-51','AP-114']),
 (26, 'improvement', 'Contribution of a technique beyond a native tool/step.', 'Name the interpretation, bounded question, derivation or recovery contributed.', 'AP-158 permits a wrapper fixing arguments for one named question.', 'Fixed-argument wrappers and pure composition need consistent treatment.', 'Reading, anatomy and leaflet obscure the acceptance predicate.', ['PD-12'], ['AP-158','DP-42']),
 (27, 'clear', 'Container technique contract contribution.', 'Compare named shared Inputs/Outputs/Rules/domain invariants with the actual container.', 'The canonical loader home owns composition semantics.', 'Container Protocol is expressly local.', 'Specific sections and a linked semantic owner bound the statement.', [], ['AP-115']),
 (28, 'improvement', 'Planning documents persisted by a workflow.', 'Map each authored document to a template and filling constraints.', 'AP-116 narrows to planning outputs but does not distinguish captured raw evidence.', 'Logs, snapshots and schema-validated machine data need a stated boundary.', 'Artifact and generated document are broader than a fillable planning document.', ['PD-13'], ['AP-116']),
 (29, 'improvement', 'Resource-owned policy used by Protocol.', 'Resolve the cited section and check that it contains the needed policy.', 'DP-36 can be read as requiring the same fact inline.', 'Delivered resource content should count as reader-held context.', 'The rule is clear in isolation; its cross-rule delivery relation needs clarification.', ['PD-03'], ['DP-06','DP-36']),
 (30, 'clear', 'Reusable resource bodies and per-run bindings.', 'Separate template placeholders/domain roles from actual session-bound values.', 'DP-44 governs section delivery.', 'Examples and template skeletons remain part of the abstraction.', 'The kind-versus-instance distinction is concrete.', [], ['DP-44']),
 (31, 'clear', 'Conditional detail inside one Protocol step.', 'Inspect note syntax and whether a condition instead selects a structural path.', 'DP-09 explicitly owns step/activity/path selection.', 'A lone caveat can be note prose; multiple items are note bullets.', 'The structural boundary prevents the apparent prose-branch conflict.', [], ['DP-09']),
 (32, 'finding', 'Resource citation and delivered context.', 'Trace required sections and prerequisites; most of the body has no chosen measurement.', 'DP-44 locates shared framing without requiring every entry path to retrieve it.', 'Whole-body consumption is a clear exception; most-body consumption is not.', 'The cited unit and its necessary context need one closed delivery set.', ['PD-14'], ['DP-44','AP-134']),
 (33, 'clear', 'Instruction surfaces before references resolve.', 'Strike references and test whether the remaining instruction is executable.', 'It supplies the explicit bounded exception to DP-06.', 'Later canonical names can remain labels, not required resolution paths.', 'The counterfactual test is concrete.', [], ['DP-06','AP-145']),
 (34, 'clear', 'Coupling caused solely by duplicated owned facts.', 'Change an owner fact and identify consumers requiring synchronization only.', 'DP-06 provides the ownership premise.', 'Consumers whose actual behavior changes are not merely restated copies.', 'The only-to-keep-agreeing qualifier bounds the broad opening.', [], ['DP-06']),
 (35, 'improvement', 'Competing paths covered by a prohibition.', 'Compare capability, preconditions, authority and lifecycle before treating paths as duplicates.', 'DP-34 supports one owner for duplicate policy.', 'Intentional alternatives can be distinct capabilities despite a shared verb.', 'Means two constructs do one job overstates the inference.', ['PD-15'], ['DP-34']),
 (36, 'finding', 'Names and facts available to a technique reader.', 'Prove delivery or explicit prerequisite retrieval, not merely a qualified spelling.', 'DP-29 allows resource policy citation; AP-53 distinguishes spelling from delivery.', 'A full other-library address alone does not demonstrate availability.', 'Own text or stated plainly leaves delivered resources and qualified external rules ambiguous.', ['PD-03'], ['DP-06','DP-29','AP-53','AP-157']),
 (37, 'clear', 'Technique I/O contract value meaning.', 'Identify caller/activity/workflow provenance leaking into a value definition.', 'AP-42 supplies the specific coupling smell.', 'Contract shape may name semantic roles without naming a caller.', 'The what-versus-who distinction is explicit.', [], ['AP-42']),
 (38, 'clear', 'Restructuring a gate, exit, technique or rule.', 'Compare the preserved outcome/binding/audience and its observing check.', 'AP-160 tests the cross-file relocation consequence.', 'An intentional retirement is a separate declared removal.', 'The preservation witness is concrete.', [], ['AP-160']),
 (39, 'finding', 'Phase heading wording and length.', 'Count words and identify the outcome; four words receives inconsistent guidance.', 'DP-15 owns phase semantics.', 'No title/proper-name exception or fourth-word rule is stated.', 'Two-or-three and past-four establish different boundaries.', ['PD-16'], ['DP-15']),
 (40, 'clear', 'Worker/activity fan-out versus one-worker work units.', 'Trace the graph destinations, gather activity and within-worker loop.', 'DP-42 can own reusable sequences containing that structural work.', 'The scope distinguishes execution layers rather than choosing by task size alone.', 'The second sentence makes the opening layer claim operational.', [], ['DP-42']),
 (41, 'improvement', 'Protocol interpretation of tool responses.', 'Tie a response assumption to a captured observation and scope its evidence.', 'AP-161 preserves declared but unevidenced values.', 'Rare or unsafe-to-trigger branches need a stated contract/fixture evidence class.', 'Real-subject observation does not cover every legitimate error branch.', ['PD-17'], ['DP-21','AP-161']),
 (42, 'improvement', 'Codified reusable paths versus local technique judgments.', 'Identify fixed structural sequence and the residual interpretation.', 'DP-01 gives sources; DP-26 gives the technique boundary.', 'Accepted and consistent need recorded evidence rather than an arbitrary repetition count.', 'Free-form and reading benefit from observable examples.', ['PD-12'], ['DP-01','DP-26']),
 (43, 'finding', 'Reuse of activities and pattern library capabilities.', 'May borrow describes permission; no conforming/nonconforming design distinction follows.', 'DP-18 already expresses a shared-capability preference.', 'Permitted borrow/bind/include mechanics belong in the construct reference.', 'The body is a feature statement rather than an invariant.', ['PD-18'], ['DP-18']),
 (44, 'finding', 'Independent delivery of sections and shared framing.', 'For each entry section, enumerate prerequisites and prove they reach its reader.', 'DP-32 selects units; heading placement alone supplies no delivery edge.', 'Whole-document readers already receive the shared section.', 'Can deliver is weaker than requires and actually delivers.', ['PD-14'], ['DP-32']),
 (45, 'clear', 'Atomic Rules entries.', 'Split parts that can be independently cited and edited.', 'It exposes the naming bundle in DP-19 only through the principles overview as well.', 'A genuinely dependent conditional consequence can remain one invariant.', 'The independent-edit/citation test is concrete.', [], ['DP-19']),
 (46, 'improvement', 'Substitutability behind a shared contract.', 'Compare accepted inputs, promised results, relevant effects and failure behavior.', 'Merely declaring a contract does not demonstrate satisfying it.', 'Contract-specific preconditions and guarantees need explicit treatment.', 'Usable wherever is broader than the evidence rule provided.', ['PD-19'], []),
 (47, 'improvement', 'Extending a calibrated surface for a consumer.', 'Separate caller-specific adaptation from changing the shared contract itself.', 'DP-34 keeps corrections in the owning home.', 'Owner defects and intentional shared redesign require renewed validation.', 'The wrapping preference needs a boundary for owner changes.', ['PD-20'], ['DP-18','DP-34']),
]

findings = []
def add(number, kind, priority, ids, problem, witness, fix, check):
    evidence = []
    for identifier in ids:
        item = index[identifier]
        lines = (record / item['source']).read_text().splitlines()
        evidence.append({'entry': identifier, 'start': item['start'], 'end': item['end'],
                         'quote': '\n'.join(lines[item['start']-1:item['end']]).strip()})
    findings.append({'id': 'PD-' + str(number).zfill(2), 'kind': kind, 'priority': priority,
        'entries': ids, 'evidence': evidence, 'problem': problem, 'witness': witness,
        'proposed_fix': fix, 'observing_check': check})

add(1, 'ambiguous-scope', 'P2', ['DP-03'],
    'The initial/final manifest checks leave newly discovered dependencies during execution unspecified.',
    'An output-contract edit reveals an unchanged consumer after the initial list. The text neither authorizes scope expansion nor defines when that consumer enters the manifest.',
    'List the intended files and edit root before dependent edits. Add discovered contract dependencies to the manifest before changing them; resolve any material scope or authority change before proceeding. Reconcile the final changed and affected files before claiming completion.',
    'A discovered consumer added before its edit passes; silently editing an unlisted consumer fails. Discovery itself remains allowed.')
add(2, 'missing-decision-gate', 'P1', ['DP-04'],
    'The literal body requires asking but does not require receiving the answer before dependent action.',
    'Ask which materially different behavior is intended, then implement a default before the user replies. Asking occurred before acting, but clarification did not.',
    'When unresolved interpretations change the outcome, scope, authority or acceptance test, ask one question and wait for the answer before work that depends on it. Use already explicit instructions as answers; independent investigation may continue.',
    'An unanswered choice cannot authorize the dependent edit. An earlier explicit answer and independent source inspection do not trigger another interview.')
add(3, 'delivery-boundary', 'P2', ['DP-06','DP-29','DP-36'],
    'One editable home, resource policy citations and reader-held facts lack a shared definition of delivered context and copy provenance.',
    'A technique needs policy in an automatically delivered resource section. DP-29 directs citation; a literal own-text reading of DP-36 demands inline policy. Separately, a full other-library rule address names content without demonstrating delivery.',
    'Define reader-held context as the technique, merged contracts and explicitly delivered or prerequisite-fetched resource sections. A symbol must resolve within that context. Qualified spelling identifies an owner and does not establish delivery. Any necessary delivery projection names its single editable source and regeneration/update mechanism.',
    'An anchored delivered policy passes without inline duplication. A qualified but unavailable rule fails. Two independently editable copies fail ownership even if their current strings match.')
add(4, 'improvement', 'P2', ['DP-08','DP-10'],
    'Semi-reversible is undefined, and the text does not say whether informed approval already covering the exact removal/effect remains effective.',
    'The user explicitly requests removal of a named obsolete file. A reader may demand a second identical approval; another may treat a costly external effect as reversible because some compensation exists.',
    'Require explicit authority describing the target and material impact when reversal cannot restore the prior state, requires another party, or incurs material loss. Existing explicit approval covering that effect remains valid; a changed effect needs a new decision. For removals, identify the material removed and its approved scope.',
    'Previously approved named removal proceeds; a newly discovered removal or different external effect waits. Record the reversal assumption and impact used.')
add(5, 'unobservable-enforcement', 'P1', ['DP-09'],
    'Critical is not bounded, and presence of a checkpoint/condition/validate field does not establish that it enforces the constraint.',
    'A validate action computes false but the next transition still reaches the forbidden operation. A literal construct-presence check passes.',
    'A constraint that determines whether work may start, commit an effect, or complete is represented by a condition, validate result or recorded checkpoint decision whose failure prevents the prohibited path. State the tested predicate and failure route; retain the semantic rule in its owner.',
    'Exercise pass, reject and missing-decision cases. Rejection and missing evidence must not reach the gated operation.')
add(6, 'ambiguous-grain', 'P2', ['DP-12','AP-84'],
    'One fact is too narrow or too elastic to distinguish a coherent report from duplication. The catalog permits one closeout document with several kinds of facts.',
    'One closeout artifact owns delivered items, decisions and newly observed lessons for one audience. Counting scalar facts violates DP-12; treating the whole session as one fact makes the test arbitrary.',
    'Each artifact has one declared audience and one coherent purpose. It owns the facts produced for that purpose and links facts owned elsewhere. A checkpoint asks for one decision and supplies the context required for it.',
    'A report with distinct newly produced findings passes; copied facts with another owner fail. Two independent decisions at one checkpoint fail regardless of report length.')
add(7, 'composition-scope', 'P1', ['DP-16','DP-25','DP-42','AP-51','AP-114'],
    'Protocol invocation notation and activity-only composition wording do not align with the current routine/binding-site composition policy.',
    'AP-51 repairs a raw tool mention by invoking another technique in Protocol, which AP-114 then flags. A reusable two-technique routine is explicitly allowed by DP-42, while DP-25 only names activity steps; runtime splicing does not settle authoring ownership.',
    'State that sibling/shared work is bound as steps in the activity or routine that owns the sequence. Retain Protocol designators for values, but move technique-invocation spelling to the supported binding/reference surface. Update AP-51/56 and affected Apply remedies together so fixes place work at that binding site.',
    'A routine containing two properly bound sibling techniques passes. A Protocol Apply invocation fails. Repairing AP-51 must pass AP-114 without undoing the repair.')
add(8, 'improvement', 'P2', ['DP-18','AP-110'],
    'Cannot absorb the caller diversity is not tied to an explicit capability or contract gap.',
    'Two authors disagree whether one missing optional input requires a local recipe, even though AP-110 says the shared operation still owns the capability.',
    'Before a local recipe, record the behavior or contract requirement the shared capability cannot provide through its supported parameters, composition or justified shared extension. Reuse the shared owner where those mechanisms satisfy the requirement.',
    'A changed constant or missing optional flag alone does not justify duplication. A recorded incompatible semantic requirement is independently reviewable.')
add(9, 'improvement', 'P3', ['DP-19'],
    'Affirmative meaning, noun order, case, boolean shape, collection plurality, I/O direction and rule negation are independently editable policies under one invariant heading.',
    'A plural collection can have the wrong case, while a correctly cased boolean can fail predicate naming. One check of the heading does not settle its independent clauses.',
    'Keep a semantic naming principle and cite the conventions/AP entries owning spelling and type-specific forms. Alternatively give independently applicable clauses stable sub-identifiers and record each result, without repeating their wording across homes.',
    'A naming review records each applicable predicate. Changing the case convention updates one owner rather than several copied statements.')
add(10, 'improvement', 'P2', ['DP-22','AP-01'],
    'Construct is broad enough to include schema-required inline actions and literals, but the covering AP explicitly exempts them.',
    'An inline action map required by an activity schema can be called a construct; extracting it into an unsupported file would satisfy a literal DP-22 reading and break the schema.',
    'Separately referenceable workflow definitions, activities, techniques, routines and resources have their own files. Schema-owned inline fields and actions remain in their required parent.',
    'A separately authored activity body embedded in a parent fails; an inline schema action passes.')
add(11, 'improvement', 'P2', ['DP-24','AP-113'],
    'Person and session delivery can encompass domain operations such as sending a notification, whereas AP-113 distinguishes domain-owned delivery channels.',
    'A notification technique calls its domain tool and returns delivery evidence. That reaches a person, but is not the workflow operator checkpoint/message operation.',
    'Activities own workflow-operator messages, approvals and checkpoint presentation. A technique may execute a declared domain delivery operation through its owning tool and return its result; the binding activity owns when that domain operation runs.',
    'A technique narrating findings into operator chat fails; a bound notification operation with a declared result is assessed as domain work.')
add(12, 'improvement', 'P2', ['DP-26','DP-42','AP-158'],
    'Reading, anatomy, leaflet, free-form, accepted and consistent leave the technique/routine boundary dependent on metaphor.',
    'A wrapper fixes arguments for one bounded question without post-processing. AP-158 permits it, while a literal only-calls-the-tool reading can retire it.',
    'Name the technique contribution: a bounded question/argument choice, interpretation, derivation, qualification or recovery that the native construct does not supply. A fixed sequence/branch/loop/gate with an accepted input-output contract belongs in a routine; retain only those named contributions in its techniques.',
    'An alias that merely renames a raw return fails. A fixed-argument wrapper with a documented semantic question and the catalog exception passes. A reusable structural sequence has a routine owner.')
add(13, 'improvement', 'P3', ['DP-28','AP-116'],
    'Planning artifact and generated document do not distinguish authored decision documents from raw captures or machine-validated evidence.',
    'A workflow stores a byte-exact tool log or JSON capture in its planning record. A fill-template requirement risks altering the evidence or duplicating its schema.',
    'Require a creation guide for planning documents whose sections a technique authors or fills. A byte-exact capture or machine-generated artifact names its producer and schema/format contract; it does not require a competing prose template. Keep the destination and identity explicit for both.',
    'A hand-authored decision report needs Template and Rules. An immutable source capture with recorded hash and producer uses its actual byte/format contract.')
add(14, 'missing-context-closure', 'P1', ['DP-32','DP-44','AP-134'],
    'Most of the body is not a defined selection rule, and placing shared obligations in a heading does not ensure a section reader receives them.',
    'A consumer loads only Template. Shared Rules are under another deliverable heading but no path requires them. Both headings exist, yet the consumer lacks required constraints.',
    'A delivered section declares or links every required shared context unit before its instructions. Every supported entry path receives those prerequisites once. Cite the minimal complete set; a whole-body citation means the consumer needs the whole body. If a broader delivery optimization remains, define its measured criterion and budget explicitly.',
    'Start a fresh reader at each supported anchor and verify prerequisite receipt. A heading that is merely available but never required fails. Record actual extra bytes separately from required context.')
add(15, 'improvement', 'P3', ['DP-35'],
    'A warning does not establish that two paths are semantically redundant.',
    'Preview and effectful execution share a verb but have different authority and side effects. Removing either solely because a warning distinguishes them loses behavior.',
    'When paths have the same capability, preconditions, authority and lifecycle, select one owner and retire duplicate implementations. Where differences are intentional, keep the boundary explicit and cite the owner of each behavior.',
    'Equivalent competing implementations have one owner. A documented preview/effect distinction remains valid and testable.')
add(16, 'inconsistent-boundary', 'P2', ['DP-39'],
    'The first sentence permits two or three words; past four only criticizes five or more, leaving the four-word audit boundary unclear.',
    'A four-word heading names one outcome. One reviewer rejects its count; another treats it as below the stated detail threshold.',
    'Choose one count policy in the owning convention. The minimal textual repair to the existing two-or-three rule is to replace Past four words with More than three words, then state any necessary proper-name exception. Keep outcome clarity as the principle and reference that convention.',
    'Exercise one-, two-, three-, four- and five-word headings plus a necessary domain name. Each has one documented disposition.')
add(17, 'improvement', 'P2', ['DP-41','AP-161'],
    'Real-subject observations and declared-but-unevidenced values need explicit evidence classes for rare or unsafe-to-trigger branches.',
    'A documented error response has a controlled fixture but has never appeared in a live subject. Erasing its recovery path to satisfy observed-only wording would reduce correctness.',
    'Bind response interpretations to a captured live observation or an authoritative response contract with a representative fixture. Mark live-unobserved branches as such; neither a fixture nor absence of an observed value proves its live frequency or impossibility.',
    'A fabricated empty-result meaning fails. A contract-backed rare error fixture can validate recovery while its live-evidence status remains unmeasured.')
add(18, 'non-discriminating-principle', 'P2', ['DP-43','DP-18'],
    'May borrow/bind/include states an available feature and has no violating alternative.',
    'Both a needless duplicate activity and reuse of its existing equivalent satisfy the permissive sentence.',
    'Either place the permitted composition forms in the construct reference and let DP-18 own reuse, or state: Reuse an existing activity when its inputs, outputs and phase boundary satisfy the consumer; a local activity records the unmet requirement. Keep one authoritative reuse rule.',
    'Duplicating an activity with a matching required contract needs a recorded reason; an incompatible phase boundary supplies an inspectable exception.')
add(19, 'improvement', 'P2', ['DP-46'],
    'Declaring a shared contract is conflated with satisfying it; usable wherever has no stated substitutability test.',
    'Two definitions declare the same output name, but one requires stronger inputs or omits promised failure behavior. Nominal identity alone does not make the substitution valid.',
    'A definition bound through a shared contract accepts the contract inputs without stronger preconditions and meets its output, failure and relevant-effect guarantees. Consumers rely on that contract; contract conformance is demonstrated on representative valid and invalid inputs.',
    'Substitute two implementations against the same contract tests, including missing input, invalid input, error result and relevant side effects.')
add(20, 'improvement', 'P2', ['DP-47','DP-34'],
    'Wrapping a consumer extension needs a boundary from correcting or intentionally evolving the shared owner.',
    'A calibrated schema contains an incorrect shared requirement. A wrapper cannot make the authoritative schema correct; retaining its identity also preserves stale validation assumptions.',
    'Put consumer-specific adaptation around a calibrated contract when that contract remains valid. A defect or intentional shared contract change is corrected at its owner and renews dependent calibration/validation before acceptance.',
    'A caller-only formatting preference wraps without changing the owner. A shared schema correction changes the owner and invalidates old dependent evidence.')

entries = []
for number, disposition, scope, observable, consistency, exceptions, expression, ids, related in rows:
    entries.append({'id': 'DP-' + str(number).zfill(2), 'disposition': disposition,
        'checks': {'scope': scope, 'observable': observable, 'consistency': consistency,
                   'exceptions': exceptions, 'fix': 'Positive design stance supplies the remedy; any proposed correction is named in finding_ids.', 'expression': expression},
        'rationale': observable + ' ' + consistency, 'finding_ids': ids, 'related_ids': related})
assert {entry['id'] for entry in entries} == set(inventory['assignments']['principles']['entries'])

def batches(name, values, maximum_items):
    group, part = [], 1
    for value in values:
        candidate = {'reviewer': '/root', name: group + [value]}
        if group and (len(group) >= maximum_items or len((json.dumps(candidate, indent=2) + '\n').encode()) > 16000):
            output = json.dumps({'reviewer': '/root', name: group}, indent=2) + '\n'
            assert len(output.encode()) <= 16000
            (here / (name + '-' + str(part).zfill(2) + '.json')).write_text(output)
            part, group = part + 1, []
        group.append(value)
    if group:
        output = json.dumps({'reviewer': '/root', name: group}, indent=2) + '\n'
        assert len(output.encode()) <= 16000
        (here / (name + '-' + str(part).zfill(2) + '.json')).write_text(output)

batches('entries', entries, 8)
batches('findings', findings, 4)
print(json.dumps({'reviewed': len(entries), 'proposals': len(findings),
    'dispositions': {value: sum(entry['disposition'] == value for entry in entries) for value in ('clear','finding','improvement')}}))
