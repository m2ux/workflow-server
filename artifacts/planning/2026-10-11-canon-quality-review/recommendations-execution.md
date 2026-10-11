# Reconciled AE recommendations

These are review suggestions at the captured revision. The independent disposition and wording below govern the recommendation; the original candidate remains available for comparison. No corpus change is implied. P1 concerns lost obligations, evidence or incompatible repairs; P2 clarifies a material boundary; P3 improves consistency or expression.

## AE-01

**Confirmed · correction · P1**

Scope: [AP-69 · no-activity-prose-rules](sources/anti-patterns.md#ap-69-no-activity-prose-rules), [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [AP-37 · rule-audience-bucket](sources/anti-patterns.md#ap-37-rule-audience-bucket).

**Assessment.** Activity-file guidance is a permitted repair in one entry and always a violation in another. The technique/shared-delivery solution satisfies both objectives.

**Witness.** A worker-wide evidence constraint is placed on an activity binding several techniques. AP-23's Fix accepts that placement; AP-69 flags it even when it reaches the correct actor.

**Suggested wording.** Keep AP-69's structural-only activity policy. Replace AP-23's first Fix sentence with: 'Keep a worker-directed rule on the owning technique or on a container contract delivered to every affected technique.' Clarify in AP-37 that workflow rules.activity is an audience bucket, distinct from rules authored on an activity file.

**Observing check.** Positive: An activity-file behavioural rule moves to a delivered technique contract. Negative: A worker rule in workflow rules.activity is judged by its delivery bucket, without treating that field as activity-file prose.

Evidence addresses: AP-69 lines 904–906; AP-23 lines 348–348.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-04.json).

## AE-02

**Confirmed · correction · P2**

Scope: [AP-70 · capability-group-placement](sources/anti-patterns.md#ap-70-capability-group-placement).

**Assessment.** Detect explicitly rejects consumer count as the classifier, but the remedy uses the number of consuming workflows. Locate ownership by the source of the contract.

**Witness.** A reusable git primitive has one workflow consumer. Detect calls its client-workflow location wrong; the one-workflow branch of Fix directs it to that workflow's root.

**Suggested wording.** Replace the classification with: 'Classify by what determines the contract: external tool or harness semantics belong to that capability's namespace; workflow-domain vocabulary shared across its activities belongs at the workflow root; a contract defined by one activity's input/output seam belongs to an activity-named group. Record the contract dependency establishing the class. Consumer count alone does not change it.' Retain the proper-subset test for group folders.

**Observing check.** Positive: A client-local primitive determined wholly by a shared tool contract moves to that capability's namespace. Negative: Two callers of an activity-specific domain contract do not automatically turn it into an external library.

Evidence addresses: AP-70 lines 916–916; AP-70 lines 920–920.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-03

**Confirmed · correction · P1**

Scope: [AP-74 · no-duplicated-guidance](sources/anti-patterns.md#ap-74-no-duplicated-guidance), [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [DP-06 · One Authoritative Home](sources/design-principles.md#6-one-authoritative-home).

**Assessment.** Confirmed on the isolated-worker witness: flagging necessary copies is itself flagged by worker-rule-reach. Resolve the local audit prescription by proving delivery from one editable owner.

**Witness.** Two isolated workers each receive one non-meta leaf technique. Both must receive the same behavioural constraint; neither receives a common owning text. Repeated wording meets AP-74 Detect, while flagging these required copies meets AP-23 Detect. The meta exception does not apply.

**Suggested wording.** Add AP-74 Do not flag: 'Copies required for isolated readers to receive a rule, provided they are delivered from one authoritative statement rather than independently maintained.' Replace Fix with: 'Hoist or deliver the authoritative statement to every affected reader, then remove independently maintained duplicates. A pointer replaces text only after its reader can resolve it before acting.' Align AP-23 with the same one-edit-home condition.

**Observing check.** Positive: Two independently maintained copies received by the same worker consolidate into their delivered owner. Negative: One canonical rule injected into two isolated worker contexts is accepted despite repeated delivered wording.

Evidence addresses: AP-74 lines 968–968; AP-23 lines 344–344; AP-23 lines 348–348; DP-06 lines 41–41.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-04

**Confirmed · improvement · P3**

Scope: [AP-72 · complete-bootstrap-path](sources/anti-patterns.md#ap-72-complete-bootstrap-path).

**Assessment.** A declared initial activity and its first-step prerequisites provide a reproducible bootstrap endpoint without executing domain work.

**Witness.** One reviewer stops at a session id; another requires the initial activity and its first-step prerequisites. The same path can receive opposite completeness verdicts.

**Suggested wording.** Replace 'reach the first meaningful action' with 'resolve and load the declared initial activity with the identifiers, authorization and inputs its first step requires'. Add: 'Record the selected start state and the returned field supplying each subsequent call argument.'

**Observing check.** Positive: A session id with no discoverable initial activity id exposes a missing hop. Negative: A path loading the declared initial activity and resolving first-step prerequisites passes without executing domain work.

Evidence addresses: AP-72 lines 944–944.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-05

**Narrowed · improvement · P2**

Scope: [AP-75 · describe-tool-value](sources/anti-patterns.md#ap-75-describe-tool-value).

**Assessment.** The existing value requirement need not imply exhaustive field documentation. Name the omitted capability and the caller decision it enables; unused telemetry is not a counterexample requiring documentation.

**Witness.** A description identifies the returned activity and usable cursor but omits elapsed milliseconds. Nothing in the test shows why that missing field should or should not count.

**Suggested wording.** Replace Detect with: 'A legitimate tool description omits a returned capability or field needed to choose the call, bind its result, or perform the next declared action. Name the omitted value and the decision or binding it enables.' Add Do not flag: 'Incidental response metadata with no role in that usage contract.'

**Observing check.** Positive: A next-activity description hides the returned next definition and causes a prescribed redundant fetch; flag that omission. Negative: Telemetry unused by the caller's declared work may be omitted.

Evidence addresses: AP-75 lines 980–980.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-06

**Confirmed · correction · P1**

Scope: [AP-76 · no-redundant-tools](sources/anti-patterns.md#ap-76-no-redundant-tools).

**Assessment.** Return-set inclusion does not account for state transition, ordering, freshness or effects. A preview cannot be replaced by a later mutating superset call.

**Witness.** A read-current-activity call returns a definition; a required later advance call returns that definition plus a cursor and changes the pointer. The read-only pre-advance observation cannot be replaced by advancing early, but the strict-subset test flags it.

**Suggested wording.** Replace Detect with: 'At the point of the extra call, another required call has already supplied the needed values for the same subject and state, with sufficient freshness; the extra call contributes no required effect, failure check or permitted observation.' Exempt distinct transitions, preconditions, freshness and failure semantics. Retire a tool only after checking its whole supported contract and consumers.

**Observing check.** Positive: A routing fetch repeats fields just returned for the same activity with no new observation or effect; remove it. Negative: A read-only preview remains valid when a later mutating call returns a superset.

Evidence addresses: AP-76 lines 992–992; AP-76 lines 994–994.

[Original candidate](reviews/ap_execution/findings-02.json) · [Independent disposition](reconciliation/ap-05.json).

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

## AE-09

**Confirmed · improvement · P3**

Scope: [AP-81 · verify-format-literacy](sources/anti-patterns.md#ap-81-verify-format-literacy).

**Assessment.** Pre-draft literacy and validation of committed bytes have independent evidence and failure cases. Separate identities make partial closure visible.

**Witness.** One author reads the schema but commits without checks; another validates a draft produced without first reading the convention. These defects occur at different boundaries.

**Suggested wording.** Split into two entries. Keep verify-format-literacy for 'Drafting begins before the author reads the applicable construct format and conventions'. Add a validation entry for 'A commit includes authored constructs without the required checks recorded for those bytes'. Give each the corresponding exception and Fix.

**Observing check.** Positive: Missing pre-commit validation remains open after format literacy is established. Negative: A documented pre-draft read and required checks on the committed content close the independent obligations.

Evidence addresses: AP-81 lines 1056–1056.

[Original candidate](reviews/ap_execution/findings-02.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-10

**Narrowed · correction · P2**

Scope: [AP-84 · single-closeout-artifact](sources/anti-patterns.md#ap-84-single-closeout-artifact), [AP-93 · canonical-fact-home](sources/anti-patterns.md#ap-93-canonical-fact-home).

**Assessment.** The fact-category detector can collapse different scoped facts. The closeout entry already targets restatement; refining its audience/purpose boundary is optional rather than proof all distinct terminal artifacts are banned.

**Witness.** A project plan owns project-wide risks and a component plan owns that component's risks. Both have Risks sections, so AP-93 flags them despite no repeated fact. A machine attestation and a human lessons report likewise need not duplicate one another.

**Suggested wording.** For AP-93 use: 'Several templates require independently maintained statements of the same operative fact about the same subject and revision.' Key the home map by that scoped fact. For AP-84 flag repeated close-out facts for the same audience and purpose; preserve distinct mandated products and link common facts to their owner.

**Observing check.** Positive: Two close-out reports independently maintain the same release verdict for the same audience; consolidate that fact. Negative: Project and component registers containing different scoped risks remain separate homes.

Evidence addresses: AP-84 lines 1096–1096; AP-93 lines 1204–1204.

[Original candidate](reviews/ap_execution/findings-02.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-11

**Confirmed · correction · P1**

Scope: [AP-86 · exception-only-verdict-tables](sources/anti-patterns.md#ap-86-exception-only-verdict-tables).

**Assessment.** An all-pass per-item evidence ledger can establish coverage even without a parser. Its necessary observations must survive presentation compression.

**Witness.** An acceptance matrix contains a passing observation and evidence link per requirement, without a downstream parser. Replacing it with one line removes which requirements were exercised and how each was proved.

**Suggested wording.** Replace Detect with: 'A verdict table repeats a common status without recording distinct scope, observation, evidence or required traceability.' Add Do not flag: 'Per-item evidence or coverage needed to establish the verdict, even when all results pass.' A one-line verdict may link a complete retained evidence ledger.

**Observing check.** Positive: A prefilled all-green table adds no observation beyond a supported aggregate verdict; condense it. Negative: An all-pass matrix with distinct evidence per requirement stays intact or linked as its canonical ledger.

Evidence addresses: AP-86 lines 1120–1120; AP-86 lines 1124–1124.

[Original candidate](reviews/ap_execution/findings-03.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-12

**Confirmed · improvement · P2**

Scope: [AP-87 · omit-null-sections](sources/anti-patterns.md#ap-87-omit-null-sections).

**Assessment.** Required empty representations and an evidenced zero result differ from decorative empty headings. Preserve actual consumer contracts.

**Witness.** An externally consumed report requires a Findings section with an explicit empty result. Omitting it violates the consumer contract or becomes indistinguishable from a skipped review.

**Suggested wording.** Add Do not flag: 'An explicit empty value or heading required by the artifact's consumer contract, or a zero-result observation with its scope and evidence.' Qualify Fix: 'Omit optional decorative sections; preserve required null representations and necessary evidence in their canonical home.'

**Observing check.** Positive: An optional empty frustrations table without contractual or evidential purpose is omitted. Negative: A required findings field records zero findings and inspection scope without asking the user to confirm absence.

Evidence addresses: AP-87 lines 1136–1136.

[Original candidate](reviews/ap_execution/findings-03.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-13

**Narrowed · correction · P1**

Scope: [AP-88 · one-decision-one-checkpoint](sources/anti-patterns.md#ap-88-one-decision-one-checkpoint), [AP-89 · checkpoint-requires-decision](sources/anti-patterns.md#ap-89-checkpoint-requires-decision).

**Assessment.** Shared option labels alone do not show shared decision meaning. The entry title already supplies one-decision intent, but its answer-space test and default-frequency claim need semantic scope, authority, timing and effects.

**Witness.** Target-set approval and spending-limit approval each have Yes/No options; neither answer determines the other. A second approval after changed evidence likewise need not be redundant.

**Suggested wording.** Replace AP-88's test with: 'For every reachable path, the first checkpoint's recorded decision and unchanged evidence determine the second's answer and effects; the second adds no distinct subject, authority, timing or information.' Delete AP-89's default-frequency sentence; refer to AP-88 only when semantic redundancy is proved.

**Observing check.** Positive: A second confirmation repeats approval on unchanged evidence with identical effects; merge it. Negative: Two Yes/No decisions about distinct subjects remain separate even when both usually select Yes.

Evidence addresses: AP-88 lines 1144–1144; AP-89 lines 1160–1160.

[Original candidate](reviews/ap_execution/findings-03.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-14

**Narrowed · improvement · P3**

Scope: [AP-90 · no-guide-wrapper-ceremony](sources/anti-patterns.md#ap-90-no-guide-wrapper-ceremony).

**Assessment.** Ceremony is the stated subject, so a useful contrast is not automatically a contradiction. Qualify the Good/Bad branch to retain examples that convey a necessary distinction.

**Witness.** Two compact JSON examples distinguish an absent field from explicit null. They add a contract distinction, but the unqualified Good/Bad branch treats any pair as padding.

**Suggested wording.** Change the branch to 'a Good/Bad pair that adds no operative distinction beyond the stated rule'. Add: 'Keep a minimal worked contrast that demonstrates a necessary boundary; give the rule one authoritative statement and avoid duplicate explanation.'

**Observing check.** Positive: A contrast repeats an unambiguous preference and adds no diagnostic case; remove it. Negative: An absent-versus-null example disambiguating a consumer contract stays.

Evidence addresses: AP-90 lines 1168–1168.

[Original candidate](reviews/ap_execution/findings-03.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-15

**Confirmed · correction · P1**

Scope: [AP-91 · lifecycle-row-update](sources/anti-patterns.md#ap-91-lifecycle-row-update).

**Assessment.** The universal in-place update rule omits immutable event evidence. Separate one authoritative current-state view from distinct historical observations and approvals.

**Witness.** An append-only log records a proposal, approval and later revocation. These are distinct historical facts. Keeping only the final row loses the earlier authority and rationale.

**Suggested wording.** Scope Detect to 'independently maintained copies of the same current item state'. Add Do not flag: 'An append-only event history whose consumer requires sequence, actor or prior evidence; derived snapshots with explicit provenance.' Update the current view in place while retaining required events and durable aggregate evidence at their declared home.

**Observing check.** Positive: Three sections each claim the current status and can disagree; retain one current row. Negative: An immutable history of distinct decisions remains alongside its derived current-state view.

Evidence addresses: AP-91 lines 1184–1184.

[Original candidate](reviews/ap_execution/findings-03.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-16

**Confirmed · correction · P1**

Scope: [AP-92 · resource-fills-not-does](sources/anti-patterns.md#ap-92-resource-fills-not-does), [AP-104 · operative-criteria-need-a-home](sources/anti-patterns.md#ap-104-operative-criteria-need-a-home), [AP-68 · technique-stage-agnostic](sources/anti-patterns.md#ap-68-technique-stage-agnostic), [AP-113 · session-interaction-in-technique](sources/anti-patterns.md#ap-113-session-interaction-in-technique).

**Assessment.** Session gates and routing moved into technique Protocol violate the owning activity boundary. Presentation should be performed by the activity; the technique emits its declared evidence.

**Witness.** A resource says 'after review, confirm at the checkpoint, then proceed to validation'. AP-92 moves it to Protocol, where AP-68 flags it. AP-104's 'present' instruction similarly creates the presentation phase AP-113 removes.

**Suggested wording.** Replace AP-92 Fix with: 'Move domain work to technique Protocol. Move checkpoints, session cadence and routing to activity structure. Keep fill criteria and vocabularies in resources; reconnect moved values and anchors.' Replace AP-104's walker sentence with: 'The technique loads criteria, applies them and emits declared findings; the activity owns their presentation.'

**Observing check.** Positive: Resource-owned gate routing becomes activity checkpoints and exits, with findings bound as inputs. Negative: Portable risk vocabulary stays in a resource; a technique derives classification without prescribing user interaction.

Evidence addresses: AP-92 lines 1192–1192; AP-92 lines 1196–1196; AP-104 lines 1344–1344; AP-68 lines 896–896; AP-113 lines 1456–1456.

[Original candidate](reviews/ap_execution/findings-04.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-17

**Confirmed · correction · P1**

Scope: [AP-95 · enforce-output-discipline](sources/anti-patterns.md#ap-95-enforce-output-discipline), [AP-79 · structure-backed-constraints](sources/anti-patterns.md#ap-79-structure-backed-constraints).

**Assessment.** A line budget cannot establish fact ownership or semantic validity. Apply evidence-specific checks, and make an unresolved required invariant block completion.

**Witness.** A two-line summary duplicates another artifact's authoritative verdict but meets its line budget. A longer necessary evidence ledger exceeds it. The proxy accepts the defect and rejects valid content.

**Suggested wording.** Replace Fix with: 'Bind a verifier that checks each invariant against named evidence. Use mechanical checks for structural properties and explicit qualitative predicates for semantic ones. Repair within authorized scope, recheck, and make unresolved violations block completion. Use line budgets only when length itself is the invariant.' Keep user checkpoints limited to actual decisions.

**Observing check.** Positive: A copied verdict below the line budget still fails an ownership check and blocks completion until resolved. Negative: A necessary evidence ledger passes semantic ownership and coverage checks unless a separate size contract applies.

Evidence addresses: AP-95 lines 1232–1232.

[Original candidate](reviews/ap_execution/findings-04.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-18

**Confirmed · correction · P2**

Scope: [AP-96 · artifact-audience-declared](sources/anti-patterns.md#ap-96-artifact-audience-declared).

**Assessment.** Audience alone does not determine a required serialization. This suggested policy repair also needs coordinated updates to check-audience and any corresponding schema/consumer tests; changing prose alone would be insufficient.

**Witness.** A workflow emits OpenAPI YAML and links it for review. Human classification requires prose; agent classification mandates JSON. Either rule can destroy the required YAML consumer contract.

**Suggested wording.** Replace the format part of Fix with: 'Declare the primary audience and honor the artifact's required consumer format. Agent lifecycle state defaults to structured JSON when no stronger format contract applies. Human review links do not change serialization. A human report may present prose and tables over retained machine evidence.'

**Observing check.** Positive: An unconstrained agent lifecycle ledger uses structured JSON and declares its audience. Negative: A human-reviewed YAML or CSV artifact retains its required consumer format.

Evidence addresses: AP-96 lines 1244–1244; AP-96 lines 1244–1244.

[Original candidate](reviews/ap_execution/findings-04.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-19

**Confirmed · improvement · P3**

Scope: [AP-97 · link-named-artifacts](sources/anti-patterns.md#ap-97-link-named-artifacts).

**Assessment.** The artifact-link requirement does not justify changing every consumer-required filename to a numeric-prefix form.

**Witness.** A checkpoint links a generated package.json or schema file. The path should be produced and linked, but a numeric prefix can make the file unusable.

**Suggested wording.** Replace the prefix sentence with: 'The producing technique resolves the path under the artifact's naming contract.' Keep variable-based links; use numeric prefixes only where that contract requires them.

**Observing check.** Positive: A numbered planning report is linked through its produced path rather than a hard-coded prefix. Negative: A stable consumer filename stays stable and remains linked through its produced path.

Evidence addresses: AP-97 lines 1256–1256.

[Original candidate](reviews/ap_execution/findings-04.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-20

**Confirmed · improvement · P2**

Scope: [AP-98 · no-next-step-narration](sources/anti-patterns.md#ap-98-no-next-step-narration).

**Assessment.** The witness is conditional on the actual presentation channel. Verify rendered notice before removing prose; no missing notice in the current client is asserted by this static review.

**Witness.** Constructed case: a text-only checkpoint renders message and option labels but not autoAdvanceMs. Removing its sole timing notice hides the pending default action. This is a missing delivery premise, not a claim about the current client.

**Suggested wording.** Qualify Fix: 'Keep one structural source for timing, defaults and routing. Remove manually maintained narration when the delivered checkpoint already renders decision-relevant timing and consequences; otherwise render the notice from the same fields.' Check the actual checkpoint delivery channel.

**Observing check.** Positive: A client already renders its countdown and default; duplicate prose is removed. Negative: A channel lacking those displays receives notice derived from the same structural fields.

Evidence addresses: AP-98 lines 1268–1268.

[Original candidate](reviews/ap_execution/findings-04.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-21

**Narrowed · improvement · P2**

Scope: [AP-100 · runtime-rules-only](sources/anti-patterns.md#ap-100-runtime-rules-only).

**Assessment.** The current-session distinction can already cover an authoring run. Explicitly allow applying a cited authoring contract while continuing to forbid copied global criteria; do not classify all authoring obligations as misplaced.

**Witness.** An authoring technique requires every emitted definition to conform to a cited schema. This constrains its current output, but the write-workflows signal classifies it as misplaced design-time policy.

**Suggested wording.** Replace Detect with: 'A runtime rule independently restates general authoring criteria already owned by the canon, rather than imposing a current-work obligation by reference.' Add Do not flag: 'An authoring or audit run's obligation to apply the cited canon to its inputs or outputs, with the criteria remaining at their home.'

**Observing check.** Positive: A Rules block recopies the general checkpoint-writing checklist; remove the duplicated criteria. Negative: A technique requires its emitted definitions to satisfy the referenced schema without restating it.

Evidence addresses: AP-100 lines 1288–1288; AP-100 lines 1288–1288.

[Original candidate](reviews/ap_execution/findings-05.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-22

**Narrowed · improvement · P3**

Scope: [AP-105 · no-shadow-audit-pass](sources/anti-patterns.md#ap-105-no-shadow-audit-pass), [AP-102 · no-technique-resource-dual-home](sources/anti-patterns.md#ap-102-no-technique-resource-dual-home).

**Assessment.** The copied-criteria cases overlap. Thin scoped walkers are already explicitly exempted, so independent review is not inherently prohibited; clarify that exception and consolidate the duplicate criterion.

**Witness.** A technique copies criteria from its linked catalog and another pass walks that catalog. Both entries report the same copied paragraph and prescribe deletion.

**Suggested wording.** Fold AP-105's unique audit example into AP-102 and retire the redundant entry, repointing citations. Keep: 'Several passes may apply one authoritative home for distinct scopes or independent verification; each reads the criteria instead of maintaining a copy.' Shared criteria alone do not prove redundant work.

**Observing check.** Positive: A copied audit checklist produces one ownership finding with one canonical remedy. Negative: Independent reviewers applying the same catalog without copied Detect prose remain legitimate.

Evidence addresses: AP-105 lines 1352–1352; AP-102 lines 1312–1312.

[Original candidate](reviews/ap_execution/findings-05.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-23

**Narrowed · improvement · P2**

Scope: [AP-108 · numbered-protocol-phases](sources/anti-patterns.md#ap-108-numbered-protocol-phases), [DP-15 · Phase by Sequenced Outcome](sources/design-principles.md#15-phase-by-sequenced-outcome).

**Assessment.** The one-write exception already excludes the directory/write witness. Clarify its precedence over order-sensitivity; do not claim the full rule necessarily demands micro-phases.

**Witness.** Creating a directory before writing its report must occur in order, yet both elaborate Persist Report. The reorder test flags them while the one-write exception excuses them.

**Suggested wording.** Replace the test with: 'Name the distinct outcome established at each proposed boundary and consumed by later work. Split when the next phase begins a different outcome; ordered sub-actions jointly producing one outcome remain bullets. Reordering sensitivity is supporting evidence, not sufficient by itself.' Add the directory/write example.

**Observing check.** Positive: Editing definitions, establishing validation results and recording accepted changes have distinct outcomes and phases. Negative: Ensuring a directory and writing the report remain subordinate actions of one persistence phase.

Evidence addresses: AP-108 lines 1392–1392; AP-108 lines 1394–1394.

[Original candidate](reviews/ap_execution/findings-05.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-24

**Confirmed · correction · P2**

Scope: [AP-109 · technique-outputs-declared](sources/anti-patterns.md#ap-109-technique-outputs-declared), [AP-138 · output-without-destination](sources/anti-patterns.md#ap-138-output-without-destination).

**Assessment.** Potential future consumption is too broad to distinguish a local intermediate from a public output. Name the actual promised product or consumer before requiring a declaration.

**Witness.** A local technique derives candidate_names solely to compute its declared selected_name. A later consumer could bind the candidates, so AP-109 requests an Output. No actual reader exists, so AP-138 deletes it. The external-library exception does not apply.

**Suggested wording.** Replace AP-109's test with: 'The technique promises the value to a caller, persists it as an artifact, or has a named external consumer that needs to bind it.' Add Do not flag: 'Intermediate values consumed entirely within one application; use protocol locals when needed.' Preserve AP-138's external-caller exception for public library contracts.

**Observing check.** Positive: A later checkpoint needs an undeclared verdict; declare it and name the consumer. Negative: A candidate collection consumed only inside its producing technique stays local.

Evidence addresses: AP-109 lines 1404–1404; AP-138 lines 1804–1804; AP-138 lines 1808–1808.

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

## AE-28

**Confirmed · correction · P2**

Scope: [AP-121 · rule-as-protocol-step](sources/anti-patterns.md#ap-121-rule-as-protocol-step), [AP-143 · inherited-rules-re-enumerated](sources/anti-patterns.md#ap-143-inherited-rules-re-enumerated).

**Assessment.** The example explicitly follows rules already delivered. Moving that roster to Rules preserves a redundant obligation; delete that case before relocating unique invariants.

**Witness.** A Protocol phase says to follow already delivered conduct rules throughout, with no work outcome. Moving it verbatim to Rules follows AP-121 but fails AP-143 because it adds no invariant.

**Suggested wording.** Replace Fix with: 'Delete a standing duty already supplied by inherited or delivered rules. Move a unique cross-cutting invariant to its owning Rules surface, preserving every affected reader's reach. Keep work phases in Protocol.' Cite AP-143 for the redundant-citation branch.

**Observing check.** Positive: A redundant follow-the-bundle phase is deleted without creating a Rules copy. Negative: A unique domain invariant written as a phase moves to the proper Rules entry and remains delivered.

Evidence addresses: AP-121 lines 1552–1552; AP-143 lines 1864–1864; AP-143 lines 1868–1868.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).
