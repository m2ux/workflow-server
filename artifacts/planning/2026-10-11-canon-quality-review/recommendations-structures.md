# Reconciled AS recommendations

These are review suggestions at the captured revision. The independent disposition and wording below govern the recommendation; the original candidate remains available for comparison. No corpus change is implied. P1 concerns lost obligations, evidence or incompatible repairs; P2 clarifies a material boundary; P3 improves consistency or expression.

## AS-01

**Confirmed · correction · P2**

Scope: [AP-01 · no-inline-content](sources/anti-patterns.md#ap-01-no-inline-content), [AP-17 · bound-step-no-description](sources/anti-patterns.md#ap-17-bound-step-no-description), [DP-22 · Modular Over Inline](sources/design-principles.md#22-modular-over-inline).

**Assessment.** The open-ended construct clause and short-literal exception do not accurately bound schema-owned inline checkpoints and loops. This is a scope ambiguity, not a globally unsatisfiable file rule.

**Witness.** A newly authored inline checkpoint with message, options, and effects is a 'new construct ... authored inline' under AP-01, while AP-17 expressly says a checkpoint is inline in steps[]. The narrow reading limited to activity/technique/resource bodies avoids the conflict, so this is a scope ambiguity, not a proved contradiction under every reading.

**Suggested wording.** Replace Detect with: 'An activity, technique, or resource definition is embedded as a body in a parent where the schema represents that definition by a file reference.' Replace Do not flag with: 'Schema-owned inline forms, including checkpoint and loop steps, conditions, effects, and literal fields; references to separate definitions.' Remove the open-ended 'new construct' parenthesis. Align the scope of DP-22 with the same file-bearing construct boundary.

**Observing check.** Positive: An activity body pasted into a workflow field that expects an activity reference is flagged and extracted. Negative: A checkpoint with inline message/options and a loop with nested steps remain inline and are not flagged.

Evidence addresses: AP-01 lines 68–72; AP-17 lines 270–270; DP-22 lines 105–105.

[Original candidate](reviews/ap_structures/findings-01.json) · [Independent disposition](reconciliation/ap-02.json).

## AS-02

**Confirmed · improvement · P3**

Scope: [AP-02 · schema-is-constraint](sources/anti-patterns.md#ap-02-schema-is-constraint), [AP-118 · no-bind-mechanics-as-prose](sources/anti-patterns.md#ap-118-no-bind-mechanics-as-prose).

**Assessment.** Explicitly approved schema-and-consumer work can be one task. Clarify authorization rather than infer that schema expansion is allowed whenever convenient.

**Witness.** A user explicitly requests one change that adds a supported binding construct and its first workflow consumer. The schema change is authorized, but AP-02's literal separate-task exception does not cover it. This is a suggested policy clarification, not evidence that schema changes should be automatic.

**Suggested wording.** Replace Do not flag with: 'Schema evolution explicitly included in the approved change scope, with the schema contract and its affected consumers reviewed together.' Add to Fix: 'When current structure cannot express the authorized requirement, identify the missing capability and resolve its scope before changing the schema.' Keep the prohibition on inventing fields merely to silence validation.

**Observing check.** Positive: An author invents an undeclared field to make an unapproved content shape validate: flag it. Negative: An approved schema-and-consumer change is not flagged solely because the work is tracked in one task.

Evidence addresses: AP-02 lines 80–84; AP-118 lines 1516–1516.

[Original candidate](reviews/ap_structures/findings-01.json) · [Independent disposition](reconciliation/ap-03.json).

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

## AS-06

**Confirmed · correction · P2**

Scope: [AP-15 · procedure-in-protocol](sources/anti-patterns.md#ap-15-procedure-in-protocol), [AP-10 · loop-not-prose](sources/anti-patterns.md#ap-10-loop-not-prose), [AP-104 · operative-criteria-need-a-home](sources/anti-patterns.md#ap-104-operative-criteria-need-a-home).

**Assessment.** The detector includes numbered criteria and iteration but the remedy always chooses Protocol. Reusable criteria and structural session loops need their existing owners.

**Witness.** A step description contains a reusable numbered list of audit criteria. AP-15 says to move the imperative bullets into Protocol; AP-104 then flags those reusable criteria for living only in Protocol. A description repeating several bound steps for each session item similarly needs AP-10's loop, not a prose loop in the technique.

**Suggested wording.** Replace Detect with: 'A step description carries work instructions or reusable criteria whose owning construct is elsewhere.' Replace Fix with: 'Classify the content first: encode session sequencing, iteration, and gates in steps; place one technique's procedure in its Protocol; place reusable criteria in their resource and cite it from Protocol. Leave only an unbound step's one-line purpose, or remove description from a bound step.' Keep ownership references rather than repeating their detailed tests.

**Observing check.** Positive: A reusable criterion list in a step description moves to a criteria resource, with the technique applying its section. Negative: A one-application procedure moves to Protocol; an activity loop remains a loop and is not converted to local prose.

Evidence addresses: AP-15 lines 244–248; AP-10 lines 184–188; AP-104 lines 1340–1344.

[Original candidate](reviews/ap_structures/findings-02.json) · [Independent disposition](reconciliation/ap-03.json).

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

## AS-10

**Confirmed · correction · P1**

Scope: [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [AP-30 · role-rules-not-description](sources/anti-patterns.md#ap-30-role-rules-not-description), [AP-69 · no-activity-prose-rules](sources/anti-patterns.md#ap-69-no-activity-prose-rules), [AP-37 · rule-audience-bucket](sources/anti-patterns.md#ap-37-rule-audience-bucket).

**Assessment.** The activity-file Rules repair is categorically prohibited by no-activity-prose-rules. Distinguish a workflow audience bucket from an activity definition.

**Witness.** An activity description says workers must persist evidence immediately. Following AP-30 literally moves that constraint into rules: on the owning activity, and AP-23's Fix appears to endorse the placement. AP-69 then flags the entire activity-level rules entry with no exception. If AP-23 intended workflow rules.activity delivery, it does not say that.

**Suggested wording.** AP-23 Fix: 'Place worker guidance in the owning technique or shared technique contract that its delivery includes; where a workflow audience bucket is intended, name workflow.rules.activity explicitly. Activity definition files carry structural constraints, not rules entries.' AP-30 Fix: 'Move runtime role constraints to the owning technique/shared contract or the appropriate workflow rules audience bucket. Encode activity-local sequencing and gates structurally. Remove duplicate description prose.'

**Observing check.** Positive: A role prescription in an activity description is detected; its repair lands in a worker-delivered technique contract or declared workflow audience bucket. Negative: The repair does not create activity.yaml rules:, and a purpose-only description stays in place.

Evidence addresses: AP-23 lines 348–348; AP-30 lines 432–436; AP-69 lines 904–908; AP-37 lines 516–520.

[Original candidate](reviews/ap_structures/findings-03.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-11

**Confirmed · improvement · P3**

Scope: [AP-25 · no-one-step-rules](sources/anti-patterns.md#ap-25-no-one-step-rules), [AP-60 · local-rule-as-note](sources/anti-patterns.md#ap-60-local-rule-as-note), [AP-59 · constraint-as-blockquote](sources/anti-patterns.md#ap-59-constraint-as-blockquote).

**Assessment.** The local-rule detectors and remedies overlap. Consolidation can remove duplicate findings while retaining note formatting at its separate owner.

**Witness.** A rule 'When this lookup times out, emit unresolved' applies only to the lookup phase. Both Detects match; both fixes demote it to the same local note. This is redundant coverage, not a logical contradiction.

**Suggested wording.** Keep one step-local-rule entry with Detect: 'A Rules entry constrains only one Protocol instruction or phase.' Fix: 'Move a conditional caveat to a note under that instruction; move work into Protocol; retain genuinely cross-cutting invariants in Rules.' Retire the other entry and repoint its citations. Let AP-59 own the note's formatting, without restating that format in both entries.

**Observing check.** Positive: One local timeout caveat produces one finding and moves to its instruction. Negative: An invariant applied across lookup, interpretation, and persistence stays under Rules.

Evidence addresses: AP-25 lines 368–372; AP-60 lines 796–800; AP-59 lines 784–788.

[Original candidate](reviews/ap_structures/findings-03.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-12

**Narrowed · improvement · P2**

Scope: [AP-26 · no-rationale-in-description](sources/anti-patterns.md#ap-26-no-rationale-in-description), [AP-135 · tool-contract-restated-in-protocol](sources/anti-patterns.md#ap-135-tool-contract-restated-in-protocol), [AP-152 · one-invariant-per-rule](sources/anti-patterns.md#ap-152-one-invariant-per-rule).

**Assessment.** The existing Fix already protects facts lost on deletion. Clarify the applicability/interpretation/failure-recognition test so rationale cleanup preserves those facts; avoid treating every explanatory clause as necessary.

**Witness.** 'Only use marker bytes this context received; an unreadable marker cannot authenticate the action.' The imperative survives deletion of the second clause, but the clause supplies the failure condition the reader must recognize. The current tests can classify it either as removable rationale or as a retained operative fact. This is exception ambiguity, not a proved conflict about every explanatory clause.

**Suggested wording.** AP-26 Detect: 'A clause repeats structure or supplies historical/design rationale without changing the reader's applicability decision, required action, interpretation, or failure recognition.' Do not flag: 'A current constraint, failure mode, or non-local dependency the reader needs to apply the instruction correctly.' Fix: 'Remove only clauses that fail that operational test; place historical rationale in the appropriate design record.' Align the short exceptions in AP-135 and AP-152 by reference.

**Observing check.** Positive: 'This phase replaced the older manual approach' is removed when it changes no present decision or obligation. Negative: A failure condition needed to distinguish safe retry from duplicate creation remains with the instruction that uses it.

Evidence addresses: AP-26 lines 384–388; AP-135 lines 1772–1772; AP-152 lines 1974–1974.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-13

**Confirmed · improvement · P3**

Scope: [AP-29 · no-user-env-mutation](sources/anti-patterns.md#ap-29-no-user-env-mutation), [DP-08 · Confirm Before Irreversible Changes](sources/design-principles.md#8-confirm-before-irreversible-changes).

**Assessment.** This is an optional product-scope choice, not a contradiction and not authorization to mutate a user environment. No maintenance exception is adopted in this review.

**Witness.** A user explicitly requests repair of their global Git identity. A workflow executing that request remains prohibited by AP-29, even after the requested impact confirmation. This is not a logical contradiction: confirmation is a prerequisite, not permission. It exposes a boundary the canon should either affirm or scope.

**Suggested wording.** Recommended if environment-maintenance workflows are supported: Detect 'Workflow prose directs mutation of user-owned environment state outside the declared and authorized work scope.' Exception 'Explicitly scoped environment maintenance with the target and impact confirmed.' Otherwise keep the absolute prohibition and state 'These workflows diagnose user-owned environment state; environment maintenance is outside their supported task scope.'

**Observing check.** Positive: An authoring workflow unexpectedly orders a global Git configuration change: flag it. Negative: A diagnostic-only instruction passes. If the scoped-maintenance exception is adopted, a separately authorized environment repair also passes; otherwise the workflow declares that task unsupported.

Evidence addresses: AP-29 lines 420–424; DP-08 lines 49–49.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-14

**Confirmed · correction · P1**

Scope: [AP-31 · no-hand-authored-artifacts](sources/anti-patterns.md#ap-31-no-hand-authored-artifacts), [AP-44 · artifact-name-in-io](sources/anti-patterns.md#ap-44-artifact-name-in-io), [AP-130 · artifact-name-is-filename](sources/anti-patterns.md#ap-130-artifact-name-is-filename).

**Assessment.** The artifact repair expressly permits a discriminator-keyed note while the filename contract rejects mode/condition text. Use the filename grammar consistently.

**Witness.** To replace an activity artifacts block, an author follows AP-31 and declares the filename as 'full-report.md (full mode) or brief-report.md (brief mode)'. AP-31's discriminator-keyed-note branch offers this conditional declaration, while AP-130 rejects a mode/condition and multiple names in the artifact body.

**Suggested wording.** Replace AP-31 Fix with: 'Delete activity artifacts[]. Declare each produced file on its producing technique's output using one literal filename or token-template under #### artifact. Where a mode selects distinct file contracts, use the mode-specific producing operations described by artifact-name-is-filename.' Remove 'discriminator-keyed note' and cite AP-130 for filename grammar rather than attributing that grammar to AP-44.

**Observing check.** Positive: A conditional multi-name artifact body is flagged once and split into valid declared file contracts. Negative: A single report.md or {package_name}-report.md declaration passes, and deleting activity artifacts[] does not introduce a conditional note.

Evidence addresses: AP-31 lines 448–448; AP-44 lines 604–608; AP-130 lines 1708–1712.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-15

**Confirmed · correction · P2**

Scope: [AP-32 · outcome-names-value](sources/anti-patterns.md#ap-32-outcome-names-value).

**Assessment.** Rename invariance holds for both the desired value claim and the prohibited directory-created claim, so the stated Test cannot distinguish them.

**Witness.** 'Evidence establishes the proposed merge is safe' survives a report filename change, as does 'Output directory created'. The former describes delivered value and the latter is an explicit bad class. Therefore rename invariance alone cannot separate the classes; treating the stated test as a positive Detect signal also reverses its intended polarity.

**Suggested wording.** Replace Detect with: 'An outcome asserts only that storage or a variable exists, was written, or was populated, without naming what the user or next consumer can now know or do. A filename or id substitution alone must not change the claimed delivered value.' Retain the allowance for a mechanical name that supports a value statement. Make the positive failure predicate explicit rather than labeling the desired property as an unqualified Test.

**Observing check.** Positive: 'Output directory created' and 'assessment variable populated' are flagged when they assert no further delivered result. Negative: 'Conflicting obligations identified with the evidence needed to choose a repair' is accepted whether its report filename changes or stays the same.

Evidence addresses: AP-32 lines 454–460.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-16

**Confirmed · correction · P2**

Scope: [AP-39 · hoist-universal-techniques](sources/anti-patterns.md#ap-39-hoist-universal-techniques).

**Assessment.** Nine of ten activities is both nearly every and only some. Applicability to the tenth, not a percentage, determines whether hoisting is sound.

**Witness.** Nine processing activities use a strategy; the tenth performs a terminal acknowledgment and does not use it. This is both 'nearly every' and 'only some'. Detect recommends hoisting while the exception recommends retaining local placement. No percentage threshold would establish applicability to the tenth activity.

**Suggested wording.** Replace Detect with: 'A strategy's contract applies to every activity, but its declaration is repeated on individual activities rather than workflow.techniques.activity.' Do not flag: 'A strategy whose behavior applies to a proper subset, regardless of how large the subset is.' Fix: 'Verify applicability to every activity, then hoist and remove local copies; otherwise keep it on the activities that use it.'

**Observing check.** Positive: Every activity requires the same strategy and duplicates its declaration: hoist it. Negative: A strategy applying to nine of ten activities stays local when the tenth has no such duty.

Evidence addresses: AP-39 lines 540–544.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-17

**Confirmed · improvement · P3**

Scope: [AP-43 · canonical-artifact-ids](sources/anti-patterns.md#ap-43-canonical-artifact-ids), [AP-44 · artifact-name-in-io](sources/anti-patterns.md#ap-44-artifact-name-in-io), [AP-66 · io-id-shape](sources/anti-patterns.md#ap-66-io-id-shape).

**Assessment.** Literal artifact-reference defects and identifier-shape defects have overlapping homes. Consolidate ownership without merging separate semantic defects.

**Witness.** 'Read assumptions-log.md' in Protocol triggers both AP-43 and AP-44 and has one repair. An assumptions_log_path id can also trigger AP-43 and AP-66. The overlap is observable; it is not contradictory.

**Suggested wording.** Let one entry own artifact references in Protocol: 'A Protocol artifact reference uses a concrete filename/path rather than the declared I/O designator.' Let AP-66 own identifier shape. Retire or narrow the duplicate entry and update all citations, preserving the filename declaration exception and the opaque-collection distinction.

**Observing check.** Positive: One literal report filename in Protocol produces one finding with a declared-id repair. Negative: The same filename under #### artifact is accepted; an independent identifier-shape defect can be reported separately.

Evidence addresses: AP-43 lines 592–596; AP-44 lines 604–608; AP-66 lines 868–872.

[Original candidate](reviews/ap_structures/findings-05.json) · [Independent disposition](reconciliation/ap-04.json).

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

## AS-20

**Confirmed · improvement · P2**

Scope: [AP-55 · hoist-shared-inputs](sources/anti-patterns.md#ap-55-hoist-shared-inputs), [AP-148 · inherited-input-re-declared](sources/anti-patterns.md#ap-148-inherited-input-re-declared).

**Assessment.** The leaf-count exception and workflow-wide contextual-input remedy need explicit precedence. Scope ownership is more informative than how many sites share a spelling.

**Witness.** Three leaves share a workflow-wide location input and no ancestor declares it. The leaf-count exception excuses them, while the Fix explicitly says workflow-wide contextual inputs hoist even when some leaves do not reference them. The exception and the workflow-wide case need an explicit order.

**Suggested wording.** Prefer a scope test: 'Hoist an input when a common container owns that shared semantic contract; leaf-specific inputs stay at their leaves. Workflow-wide context belongs to the root contract regardless of use count.' If the two/three-leaf exception is intentional, state its limit and its precedence explicitly: 'For non-workflow-wide inputs, a duplicate declaration on at most three leaves may remain when their common ancestor has no other shared inputs.' Keep AP-148 as the separate inherited-duplicate check.

**Observing check.** Positive: A workflow-wide planning location has one root declaration even when only three leaves consume it. Negative: Three unrelated leaf-specific values sharing a spelling are not merged merely to meet a count rule.

Evidence addresses: AP-55 lines 736–740; AP-148 lines 1924–1928.

[Original candidate](reviews/ap_structures/findings-06.json) · [Independent disposition](reconciliation/ap-04.json).

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

## AS-23

**Confirmed · improvement · P2**

Scope: [AP-04 · no-invented-naming](sources/anti-patterns.md#ap-04-no-invented-naming), [AP-06 · no-assumption-execution](sources/anti-patterns.md#ap-06-no-assumption-execution), [AP-07 · scope-reverify-completion](sources/anti-patterns.md#ap-07-scope-reverify-completion).

**Assessment.** Source snapshots do not establish historical approval, questioning or search. Explicit evidence classes and an unevidenced disposition prevent both invented failures and unsupported passes.

**Witness.** A well-formed name in a captured file provides no evidence that the author skipped convention search, just as a done statement alone does not show whether verification occurred. Treating absent history as a violation would be unsupported; treating the snapshot as a pass would also be unsupported.

**Suggested wording.** Add a short evidence convention to the catalog: 'A conduct test names its required record: request/approval, scope manifest, session trace, or recorded check. A source snapshot proves only source properties. When the required conduct record is unavailable, report the criterion as unevidenced and state what record would settle it.' Attach that evidence requirement to AP-04, AP-06, AP-07, and the other conduct entries during a coordinated update.

**Observing check.** Positive: A trace explicitly records choosing among two material intents and executing without a question: AP-06 can be decided and flagged. Negative: A source-only snapshot with no conversation trace is marked unevidenced for clarification conduct; an observed user-established default is accepted.

Evidence addresses: AP-04 lines 104–104; AP-06 lines 132–134; AP-07 lines 144–146.

[Original candidate](reviews/ap_structures/findings-06.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-24

**Confirmed · improvement · P3**

Scope: [AP-48 · brace-output-references](sources/anti-patterns.md#ap-48-brace-output-references), [AP-54 · anchored-protocol-references](sources/anti-patterns.md#ap-54-anchored-protocol-references), [AP-144 · reference-without-provenance](sources/anti-patterns.md#ap-144-reference-without-provenance).

**Assessment.** The stricter output-reference style can coexist with general anaphora exceptions. Choose a semantic uniqueness or machine-format rationale explicitly; this is not a contradiction.

**Witness.** 'Assemble {audit_report}. Persist the report.' has one output referent in the instruction. AP-48 prescribes repeating the designator; the general reference entries accept the anaphora. This is optional consistency and expression work, not a demonstrated logical contradiction between an entry and an exception on a different entry.

**Suggested wording.** Choose and state one policy. Recommended Detect: 'An output reference cannot be resolved to exactly one declared output or field from the current instruction and its already anchored noun.' Do not flag: 'Same-instruction anaphora with a unique anchored output.' If every output mention must instead be a designator for machine processing, retain the stricter test and state that concrete requirement rather than calling every noun vague.

**Observing check.** Positive: With two candidate outputs, 'persist the result' is flagged until the intended output is named. Negative: With one immediately anchored output, unambiguous anaphora passes under the recommended policy; the alternative machine-processing policy explicitly requires repetition.

Evidence addresses: AP-48 lines 652–656; AP-54 lines 726–726; AP-144 lines 1878–1878.

[Original candidate](reviews/ap_structures/findings-07.json) · [Independent disposition](reconciliation/ap-04.json).
