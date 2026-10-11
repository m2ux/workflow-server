"""Build the bounded quality-review return from explicit reviewer judgments."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
inventory = json.loads((ROOT / "inventory.json").read_text())
by_id = {entry["id"]: entry for entry in inventory["entries"]}
sources = {name: (ROOT / name).read_text().splitlines() for name in ("sources/anti-patterns.md", "sources/design-principles.md")}
findings = []
ledger = []


def finding(number, kind, priority, entries, evidence, problem, witness, proposed_fix, positive, negative):
    findings.append({
        "id": f"AS-{number:02d}", "kind": kind, "priority": priority, "entries": entries,
        "evidence": [{"entry": entry, "start": first, "end": last,
                      "quote": "\n".join(sources[by_id[entry]["source"]][first - 1:last])}
                     for entry, first, last in evidence],
        "problem": problem, "witness": witness, "proposed_fix": proposed_fix,
        "observing_check": {"positive": positive, "negative": negative},
    })


def entry(number, disposition, checks, rationale, finding_numbers=(), related_ids=()):
    assert len(checks) == 6
    ledger.append({
        "id": f"AP-{number:02d}", "disposition": disposition,
        "checks": dict(zip(("scope", "observable", "consistency", "exceptions", "fix", "expression"), checks)),
        "rationale": rationale, "finding_ids": [f"AS-{n:02d}" for n in finding_numbers],
        "related_ids": list(related_ids),
    })


finding(1, "scope-ambiguity", "medium", ["AP-01", "AP-17", "DP-22"],
        [("AP-01", 68, 72), ("AP-17", 270, 270), ("DP-22", 105, 105)],
        "The parenthetical 'a new construct' extends a file-separation rule beyond the three named file bodies. Its exception covers short literals, although checkpoints and loops are required inline constructs. A literal reading produces a false positive on the schema's intended packaging.",
        "A newly authored inline checkpoint with message, options, and effects is a 'new construct ... authored inline' under AP-01, while AP-17 expressly says a checkpoint is inline in steps[]. The narrow reading limited to activity/technique/resource bodies avoids the conflict, so this is a scope ambiguity, not a proved contradiction under every reading.",
        "Replace Detect with: 'An activity, technique, or resource definition is embedded as a body in a parent where the schema represents that definition by a file reference.' Replace Do not flag with: 'Schema-owned inline forms, including checkpoint and loop steps, conditions, effects, and literal fields; references to separate definitions.' Remove the open-ended 'new construct' parenthesis. Align the scope of DP-22 with the same file-bearing construct boundary.",
        "An activity body pasted into a workflow field that expects an activity reference is flagged and extracted.",
        "A checkpoint with inline message/options and a loop with nested steps remain inline and are not flagged.")

finding(2, "optional-scope-improvement", "low", ["AP-02", "AP-118"],
        [("AP-02", 80, 84), ("AP-118", 1516, 1516)],
        "Requiring schema evolution to be a 'separate task' makes task packaging stand in for authorization. AP-118 can prescribe a schema extension as part of closing a binding gap. The catalog does not say whether a single explicitly authorized engine-and-definition change is legitimate.",
        "A user explicitly requests one change that adds a supported binding construct and its first workflow consumer. The schema change is authorized, but AP-02's literal separate-task exception does not cover it. This is a suggested policy clarification, not evidence that schema changes should be automatic.",
        "Replace Do not flag with: 'Schema evolution explicitly included in the approved change scope, with the schema contract and its affected consumers reviewed together.' Add to Fix: 'When current structure cannot express the authorized requirement, identify the missing capability and resolve its scope before changing the schema.' Keep the prohibition on inventing fields merely to silence validation.",
        "An author invents an undeclared field to make an unapproved content shape validate: flag it.",
        "An approved schema-and-consumer change is not flagged solely because the work is tracked in one task.")

finding(3, "overbroad-completion-scope", "medium", ["AP-03", "AP-07", "AP-81", "DP-03"],
        [("AP-03", 90, 96), ("AP-07", 142, 148), ("AP-81", 1056, 1060), ("DP-03", 29, 29)],
        "Both completion checks include every commit. AP-03 consequently demands that the whole scope be complete before an incremental commit; AP-07's Fix speaks only about claiming done. Commit-time validation and completion-time scope closure are different observable events.",
        "An approved two-part change records a validated first part in an interim commit and keeps the second part openly in progress. No handoff or done claim occurs. AP-03 flags unfinished scope and requires completion before committing; AP-07 flags the commit despite its completion-focused title and Fix.",
        "AP-03 Detect: 'A deliverable is handed off or represented as complete while approved scope items remain unaddressed or are deferred without approval.' Do not flag: 'An explicitly partial deliverable, or an interim commit that keeps remaining scope open and makes no completion claim.' Fix: 'Complete the agreed deliverable or obtain and record a scope change before its completion claim.' AP-07 Detect: 'A completion claim or final handoff lacks item-by-item verification against the current scope manifest.' Keep AP-81 as the commit-validation check.",
        "A final 'done' report omits an agreed resource edit with no scope approval: both unfinished-work and missing-verification evidence can be recorded distinctly.",
        "A validated interim commit with the unfinished item still in progress is not treated as a completed deliverable.")

finding(4, "detect-fix-mismatch", "medium", ["AP-04", "DP-07"],
        [("AP-04", 102, 108), ("DP-07", 45, 45)],
        "Detect uses 'without checking ... and without user approval', so either search or approval alone makes the conjunction false. Fix requires search and, when no convention fits, approval. It also switches between a new identifier and a new convention, which are not the same event.",
        "An author searches, finds no suitable convention, and adopts a new naming scheme without approval. Detect is false because search occurred, although Fix says the new convention needs approval. Conversely, a fresh id following established snake_case is not a new naming convention.",
        "Replace Detect with: 'A naming convention is adopted without checking whether an existing convention fits; or, after no existing convention fits, a new convention is adopted without the required approval.' Do not flag: 'New identifiers that follow an established convention; a genuinely new convention with its search and approval recorded.' Retain the existing Fix sequence.",
        "A search with no fit followed by an unapproved new filename scheme is flagged.",
        "A new task_results id using the established identifier convention is not flagged merely because the id is new.")

finding(5, "decision-scope-ambiguity", "medium", ["AP-09", "AP-11", "DP-26", "DP-31"],
        [("AP-09", 170, 176), ("AP-11", 194, 200), ("DP-26", 121, 121), ("DP-31", 141, 141)],
        "AP-09's Detect broadens 'user decision' to the verbs ask/confirm/choose; AP-11 broadens cross-activity routing to unspecified 'paths'. Those words also describe legitimate local judgment within one technique. The subject headings supply intent but the operational tests do not preserve the boundary.",
        "A technique says 'Choose the candidate whose returned evidence satisfies the criteria; if none does, return unresolved.' It makes a local output judgment, not a human decision or activity transition. Verb-based AP-09 and the unqualified 'paths' in AP-11 can nevertheless route it into checkpoints or graph branches.",
        "AP-09 Detect: 'Definition prose requires a person to decide, authorize, or confirm progress, but the activity has no checkpoint at that decision point.' AP-11 Detect: 'Prose selects the next activity or graph destination, but no declared activity decision or exit predicate represents that routing.' Add to both exceptions: 'A technique's local evidence interpretation or output selection that neither asks a person nor selects an activity/step.'",        "'Ask the user to approve publication before the publishing activity' without a checkpoint is flagged; prose selecting a next activity without declared routing is flagged.",
        "A local evidence branch producing one declared classification remains in the technique; an existing step condition remains structural.")

finding(6, "repair-conflict", "medium", ["AP-15", "AP-10", "AP-104"],
        [("AP-15", 244, 248), ("AP-10", 184, 188), ("AP-104", 1340, 1344)],
        "AP-15 groups numbered audit criteria, procedural phases, and per-item iteration under one relocation to Protocol. The catalog assigns reusable criteria to resources and session iteration to loop structure. Applying the generic Fix can create a second canon defect.",
        "A step description contains a reusable numbered list of audit criteria. AP-15 says to move the imperative bullets into Protocol; AP-104 then flags those reusable criteria for living only in Protocol. A description repeating several bound steps for each session item similarly needs AP-10's loop, not a prose loop in the technique.",
        "Replace Detect with: 'A step description carries work instructions or reusable criteria whose owning construct is elsewhere.' Replace Fix with: 'Classify the content first: encode session sequencing, iteration, and gates in steps; place one technique's procedure in its Protocol; place reusable criteria in their resource and cite it from Protocol. Leave only an unbound step's one-line purpose, or remove description from a bound step.' Keep ownership references rather than repeating their detailed tests.",
        "A reusable criterion list in a step description moves to a criteria resource, with the technique applying its section.",
        "A one-application procedure moves to Protocol; an activity loop remains a loop and is not converted to local prose.")

finding(7, "contract-representation-ambiguity", "medium", ["AP-16", "AP-62", "AP-148", "DP-13"],
        [("AP-16", 254, 260), ("AP-62", 820, 824), ("AP-148", 1924, 1928), ("DP-13", 69, 69)],
        "AP-16 prescribes an inputs[] declaration with id/description, while the later canon describes authored technique inputs as headings under ## Inputs and includes merged contracts. AP-62 separately accepts ambient activity inputs. The reader is left to infer both the representation and whether an ambient value counts as declared.",
        "A Markdown technique has a correct ### target_path under ## Inputs, or receives that slot from its container. AP-16's literal Fix points the author at inputs[] rather than that representation. A leaf using ambient target_path without any local or merged entry is excused by AP-62 but appears missing under AP-16.",
        "AP-16 Detect: 'Technique prose consumes an externally supplied value absent from its effective input contract: its own ## Inputs, merged container Inputs, and explicitly documented ambient inputs.' Fix: 'Declare ### <id> under the owning ## Inputs section, or use the established ambient contract, then reference {id} in Protocol.' AP-62 should identify the authoritative ambient-input contract rather than imply an open-ended exception from two example names. Verify the exact supported ambient contract before adopting this wording.",
        "An undeclared repository value with no merged or documented ambient supplier is flagged.",
        "A correctly declared or inherited input is accepted; a documented ambient input is accepted consistently by both rules.")

finding(8, "effective-scope-gap", "medium", ["AP-20", "AP-24", "AP-133", "DP-27"],
        [("AP-20", 308, 312), ("AP-24", 356, 360), ("AP-133", 1744, 1748), ("DP-27", 125, 125)],
        "The conflict tests are bounded to one technique/bucket and allow group keys to disambiguate by themselves. The catalog also merges container rules. Conflicting obligations can therefore reach one reader from different files or buckets, and a descriptive group label does not establish disjoint applicability.",
        "A container requires publication of raw records for every report; a leaf forbids publication of those same records for every report. Each local file/bucket is internally consistent, but the leaf's effective contract cannot satisfy both. Renaming the groups 'reporting' and 'privacy' leaves the same input subject to both rules.",
        "AP-24 Detect: 'Two rules in the effective delivered rule set apply to the same subject and state and require mutually exclusive behavior. Name that subject/state and both consequences.' Exception: 'Explicitly disjoint trigger conditions, or a named precedence/exception that makes the required behavior unique.' AP-20 Detect: 'Rules target different contexts but the text omits the distinction needed to decide applicability.' Fix: 'State the distinct subject or trigger in the rule or group key; verify the case cannot require both incompatible actions.' Extend AP-133's comparison to the same effective set.",
        "The inherited publication requirement and local publication prohibition are flagged with a shared report as the witness.",
        "A public-data rule and a private-data rule with explicit disjoint predicates are not flagged; labels alone do not count as those predicates.")

finding(9, "same-scope-repair-conflict", "high", ["AP-22", "AP-23", "AP-74", "DP-06"],
        [("AP-22", 332, 336), ("AP-23", 344, 348), ("AP-74", 968, 972), ("DP-06", 41, 41)],
        "Necessary worker-facing rule copies are explicitly exempted by AP-22 and prescribed as reach by AP-23. AP-74 detects the same copies in two ordinary technique bodies and orders their removal in favor of references, with no delivery exception. The fixed delivery context therefore receives opposing remediation.",
        "Two separately delivered leaf techniques carry the same worker safety invariant because neither receives the other's text or a shared rule home. AP-23 treats each copy as required reach and says an audit must not flag it as hygiene. AP-74 flags the identical behavioral instructions and says to keep one location plus pointers. A pointer alone does not give the second worker the bytes it needs. The contradiction is in what the two rules prescribe for this exact delivery state.",
        "Make delivery and authorship separate checks. AP-23 Fix: 'Put the invariant in a shared contract delivered to every affected worker. If delivery requires a materialized copy, derive it from that home; record its source so it is not independently edited. Preserve the currently delivered obligation until the replacement delivery is verified.' AP-74 Do not flag: 'A mechanically derived copy needed for a reader that cannot receive the authoritative home; a plain reference alone does not establish reach.' AP-22 should point to this delivery exception. Verify each worker's effective text after consolidation.",
        "Two independently editable copies that both workers can replace with the same delivered shared contract are flagged and consolidated.",
        "A generated copy required for an isolated worker is not deleted merely because its bytes also exist at the owner; the observer confirms that worker still receives the invariant.")

finding(10, "rule-placement-repair-conflict", "medium", ["AP-23", "AP-30", "AP-69", "AP-37"],
        [("AP-23", 348, 348), ("AP-30", 432, 436), ("AP-69", 904, 908), ("AP-37", 516, 520)],
        "'Keep ... on the activity' in AP-23 and 'rules: on the owning construct' in AP-30 can direct a reader to author activity-level rules. AP-69 forbids every such entry. The canon also has a distinct workflow rules.activity audience bucket, so 'activity' is not precise enough to locate the home.",
        "An activity description says workers must persist evidence immediately. Following AP-30 literally moves that constraint into rules: on the owning activity, and AP-23's Fix appears to endorse the placement. AP-69 then flags the entire activity-level rules entry with no exception. If AP-23 intended workflow rules.activity delivery, it does not say that.",
        "AP-23 Fix: 'Place worker guidance in the owning technique or shared technique contract that its delivery includes; where a workflow audience bucket is intended, name workflow.rules.activity explicitly. Activity definition files carry structural constraints, not rules entries.' AP-30 Fix: 'Move runtime role constraints to the owning technique/shared contract or the appropriate workflow rules audience bucket. Encode activity-local sequencing and gates structurally. Remove duplicate description prose.'",        "A role prescription in an activity description is detected; its repair lands in a worker-delivered technique contract or declared workflow audience bucket.",
        "The repair does not create activity.yaml rules:, and a purpose-only description stays in place.")

finding(11, "consolidation-opportunity", "low", ["AP-25", "AP-60", "AP-59"],
        [("AP-25", 368, 372), ("AP-60", 796, 800), ("AP-59", 784, 788)],
        "AP-25 and AP-60 both detect a Rules entry that constrains only one Protocol step and move it to that step, usually as a note. Their cross-references do not define disjoint triggers. Keeping both creates duplicate judgments and two places to maintain the same boundary.",
        "A rule 'When this lookup times out, emit unresolved' applies only to the lookup phase. Both Detects match; both fixes demote it to the same local note. This is redundant coverage, not a logical contradiction.",
        "Keep one step-local-rule entry with Detect: 'A Rules entry constrains only one Protocol instruction or phase.' Fix: 'Move a conditional caveat to a note under that instruction; move work into Protocol; retain genuinely cross-cutting invariants in Rules.' Retire the other entry and repoint its citations. Let AP-59 own the note's formatting, without restating that format in both entries.",
        "One local timeout caveat produces one finding and moves to its instruction.",
        "An invariant applied across lookup, interpretation, and persistence stays under Rules.")

finding(12, "operative-explanation-boundary", "low", ["AP-26", "AP-135", "AP-152"],
        [("AP-26", 384, 388), ("AP-135", 1772, 1772), ("AP-152", 1974, 1974)],
        "AP-26's deletion test equates a surviving prohibition with dispensable rationale, while its Fix keeps any clause whose deletion loses a fact. AP-135 says to keep an obligation's reason; AP-152 exempts a constraint's failure mode. Those clauses need a shared operational boundary rather than a blanket 'why' test.",
        "'Only use marker bytes this context received; an unreadable marker cannot authenticate the action.' The imperative survives deletion of the second clause, but the clause supplies the failure condition the reader must recognize. The current tests can classify it either as removable rationale or as a retained operative fact. This is exception ambiguity, not a proved conflict about every explanatory clause.",
        "AP-26 Detect: 'A clause repeats structure or supplies historical/design rationale without changing the reader's applicability decision, required action, interpretation, or failure recognition.' Do not flag: 'A current constraint, failure mode, or non-local dependency the reader needs to apply the instruction correctly.' Fix: 'Remove only clauses that fail that operational test; place historical rationale in the appropriate design record.' Align the short exceptions in AP-135 and AP-152 by reference.",
        "'This phase replaced the older manual approach' is removed when it changes no present decision or obligation.",
        "A failure condition needed to distinguish safe retry from duplicate creation remains with the instruction that uses it.")

finding(13, "optional-authorization-boundary", "low", ["AP-29", "DP-08"],
        [("AP-29", 420, 424), ("DP-08", 49, 49)],
        "The environment-mutation rule is an absolute boundary, including explicitly requested environment maintenance. That can be intentional, but the catalog does not name that product restriction; readers may infer that approval permits a scoped setup change from the confirmation principle. The suggested change is a policy decision, not an automatic relaxation.",
        "A user explicitly requests repair of their global Git identity. A workflow executing that request remains prohibited by AP-29, even after the requested impact confirmation. This is not a logical contradiction: confirmation is a prerequisite, not permission. It exposes a boundary the canon should either affirm or scope.",
        "Recommended if environment-maintenance workflows are supported: Detect 'Workflow prose directs mutation of user-owned environment state outside the declared and authorized work scope.' Exception 'Explicitly scoped environment maintenance with the target and impact confirmed.' Otherwise keep the absolute prohibition and state 'These workflows diagnose user-owned environment state; environment maintenance is outside their supported task scope.'",        "An authoring workflow unexpectedly orders a global Git configuration change: flag it.",
        "A diagnostic-only instruction passes. If the scoped-maintenance exception is adopted, a separately authorized environment repair also passes; otherwise the workflow declares that task unsupported.")

finding(14, "same-scope-repair-conflict", "high", ["AP-31", "AP-44", "AP-130"],
        [("AP-31", 448, 448), ("AP-44", 604, 608), ("AP-130", 1708, 1712)],
        "AP-31 explicitly permits adding a discriminator-keyed note in an artifact declaration. Its cited AP-44 does not define that form, and AP-130 flags condition/mode text in the same declaration and requires one filename. The prescribed artifact repair can immediately violate the filename contract.",
        "To replace an activity artifacts block, an author follows AP-31 and declares the filename as 'full-report.md (full mode) or brief-report.md (brief mode)'. AP-31's discriminator-keyed-note branch offers this conditional declaration, while AP-130 rejects a mode/condition and multiple names in the artifact body.",
        "Replace AP-31 Fix with: 'Delete activity artifacts[]. Declare each produced file on its producing technique's output using one literal filename or token-template under #### artifact. Where a mode selects distinct file contracts, use the mode-specific producing operations described by artifact-name-is-filename.' Remove 'discriminator-keyed note' and cite AP-130 for filename grammar rather than attributing that grammar to AP-44.",
        "A conditional multi-name artifact body is flagged once and split into valid declared file contracts.",
        "A single report.md or {package_name}-report.md declaration passes, and deleting activity artifacts[] does not introduce a conditional note.")

finding(15, "ambiguous-test-polarity", "medium", ["AP-32"],
        [("AP-32", 454, 460)],
        "The entry detects vessel-focused outcomes but its Test says the outcome 'still reads true if the file or variable is renamed'. That is normally the desired property of a value-focused outcome. The polarity is unstated, and a generic 'directory created' also survives renaming despite being expressly unwanted.",
        "'Evidence establishes the proposed merge is safe' survives a report filename change, as does 'Output directory created'. The former describes delivered value and the latter is an explicit bad class. Therefore rename invariance alone cannot separate the classes; treating the stated test as a positive Detect signal also reverses its intended polarity.",
        "Replace Detect with: 'An outcome asserts only that storage or a variable exists, was written, or was populated, without naming what the user or next consumer can now know or do. A filename or id substitution alone must not change the claimed delivered value.' Retain the allowance for a mechanical name that supports a value statement. Make the positive failure predicate explicit rather than labeling the desired property as an unqualified Test.",
        "'Output directory created' and 'assessment variable populated' are flagged when they assert no further delivered result.",
        "'Conflicting obligations identified with the evidence needed to choose a repair' is accepted whether its report filename changes or stays the same.")

finding(16, "detect-exception-collision", "medium", ["AP-39"],
        [("AP-39", 540, 544)],
        "Detect says 'nearly every activity', but the same paragraph and the Do-not-flag block say a strategy used by only some activities stays local. A strategy on nine of ten activities satisfies both descriptions. Hoisting it changes the tenth activity's delivered guidance without first establishing that the strategy belongs there.",
        "Nine processing activities use a strategy; the tenth performs a terminal acknowledgment and does not use it. This is both 'nearly every' and 'only some'. Detect recommends hoisting while the exception recommends retaining local placement. No percentage threshold would establish applicability to the tenth activity.",
        "Replace Detect with: 'A strategy's contract applies to every activity, but its declaration is repeated on individual activities rather than workflow.techniques.activity.' Do not flag: 'A strategy whose behavior applies to a proper subset, regardless of how large the subset is.' Fix: 'Verify applicability to every activity, then hoist and remove local copies; otherwise keep it on the activities that use it.'",        "Every activity requires the same strategy and duplicates its declaration: hoist it.",
        "A strategy applying to nine of ten activities stays local when the tenth has no such duty.")

finding(17, "consolidation-opportunity", "low", ["AP-43", "AP-44", "AP-66"],
        [("AP-43", 592, 596), ("AP-44", 604, 608), ("AP-66", 868, 872)],
        "AP-43 and AP-44 both detect a literal artifact filename/path in Protocol and repair it by declaring an I/O id and using its designator. AP-43's additional path-flavored-id case also appears in AP-66. The divisions are not disjoint and create duplicate findings for one construct.",
        "'Read assumptions-log.md' in Protocol triggers both AP-43 and AP-44 and has one repair. An assumptions_log_path id can also trigger AP-43 and AP-66. The overlap is observable; it is not contradictory.",
        "Let one entry own artifact references in Protocol: 'A Protocol artifact reference uses a concrete filename/path rather than the declared I/O designator.' Let AP-66 own identifier shape. Retire or narrow the duplicate entry and update all citations, preserving the filename declaration exception and the opaque-collection distinction.",
        "One literal report filename in Protocol produces one finding with a declared-id repair.",
        "The same filename under #### artifact is accepted; an independent identifier-shape defect can be reported separately.")

finding(18, "same-scope-repair-conflict", "high", ["AP-51", "AP-114", "AP-157", "DP-25"],
        [("AP-51", 688, 692), ("AP-114", 1464, 1468), ("AP-157", 2032, 2036), ("DP-25", 117, 117)],
        "AP-51 replaces a raw tool call in a technique Protocol with a wrapping-technique invocation and preserves the arguments. AP-114 explicitly forbids invoking even one other technique from that Protocol and moves the work to the activity/routine. A non-invoking replacement link also risks AP-157's unreachable reference.",
        "A local analysis technique says 'Use gitnexus_context on the symbol', and a shared context technique owns that capability. AP-51's Fix becomes 'Apply [context](...) (name: {symbol})' in the same Protocol. That exact call is an Apply of another technique for work and satisfies AP-114's Detect. Removing Apply but leaving a consult link invokes AP-157's separate availability check.",
        "Replace AP-51 Fix with: 'Bind the owning shared technique at the activity or routine and pass its product to the local technique. Remove the local raw-call recipe. Where the local step is an explicitly permitted unaided recovery path, retain its raw tool call under the existing exception.' Clarify that canonical link syntax applies only on surfaces allowed to reference that technique; it does not authorize a Protocol-to-Protocol invocation. Reconcile invocation-format and missing-argument entries against this same allowed-surface boundary.",
        "A local reimplementation of a shared call is replaced by a shared activity/routine bind and a declared input for the local consumer.",
        "The wrapper's own primitive call and an explicitly allowed unaided remedy remain valid; no Apply of a sibling is introduced into an ordinary technique Protocol.")

finding(19, "address-versus-delivery-ambiguity", "medium", ["AP-53", "DP-36", "AP-145"],
        [("AP-53", 712, 716), ("DP-36", 161, 161), ("AP-145", 1892, 1892)],
        "AP-53 combines address spelling, inherited/bundled visibility, and limits of a static audit in one paragraph. Its exception describes bare names by ancestry while Detect also includes role-bundled contracts. It gives no explicit outcome when the tree cannot establish the bundle, and a full dotted address alone does not prove delivery.",
        "A rule is on a same-library sibling contract that a role may or may not bundle with the citing leaf. The static files establish neither actual delivery nor a unique bare address. One reviewer may accept a bare slug because a route may exist; another may require owner.slug because it is outside ancestry. Neither has observed the effective bundle.",
        "Split the entry's checks in prose: 'Spelling: use a bare slug for a uniquely resolved rule in the reader's delivered local/inherited contract; otherwise use the owning contract's dotted address, qualified by namespace where required. Reach: name the delivery or inheritance path that makes the rule available. If a static walk cannot establish the role bundle, record reach as unverified, not compliant or defective from possibility alone.' Preserve the explicit pre-session override in AP-145. Confirm the exact resolver's supported addressing before changing accepted syntax.",
        "A bare rule slug declared only in another library, with no delivered contract, is flagged with its missing owner and delivery path.",
        "A uniquely resolved inherited rule is accepted; unknown role-bundle delivery remains an explicit evidence gap rather than a guessed verdict.")

finding(20, "optional-quantifier-clarification", "low", ["AP-55", "AP-148"],
        [("AP-55", 736, 740), ("AP-148", 1924, 1928)],
        "'Many techniques' is not a named population, while the exception counts two or three leaves and the Fix separately requires hoisting genuinely workflow-wide context. Readers can infer a four-leaf threshold, but cannot tell whether that is the intended cost policy or a shorthand for contract ownership.",
        "Three leaves share a workflow-wide location input and no ancestor declares it. The leaf-count exception excuses them, while the Fix explicitly says workflow-wide contextual inputs hoist even when some leaves do not reference them. The exception and the workflow-wide case need an explicit order.",
        "Prefer a scope test: 'Hoist an input when a common container owns that shared semantic contract; leaf-specific inputs stay at their leaves. Workflow-wide context belongs to the root contract regardless of use count.' If the two/three-leaf exception is intentional, state its limit and its precedence explicitly: 'For non-workflow-wide inputs, a duplicate declaration on at most three leaves may remain when their common ancestor has no other shared inputs.' Keep AP-148 as the separate inherited-duplicate check.",
        "A workflow-wide planning location has one root declaration even when only three leaves consume it.",
        "Three unrelated leaf-specific values sharing a spelling are not merged merely to meet a count rule.")

finding(21, "conditional-note-scope-ambiguity", "medium", ["AP-59", "DP-31", "AP-108"],
        [("AP-59", 784, 788), ("DP-31", 141, 141), ("AP-108", 1394, 1394)],
        "AP-59 explains that indentation is stripped and a conditional sub-bullet becomes a peer step, but exempts an If/Else-if/Otherwise ladder 'at any indent'. DP-31 requires conditional branches inside a Protocol step to be notes. The exception does not distinguish a primary choice instruction from a caveat qualifying another instruction.",
        "Under 'Resolve the endpoint', an indented If/Else-if/Otherwise ladder describes fallback cases of that instruction. It is a conditional caveat inside one step under DP-31, yet AP-59's 'at any indent' exemption appears to allow the sub-bullets whose flattening the Detect warns about. This is an exception boundary conflict, not a claim that every ordered ladder is prohibited.",
        "Replace the ladder exception with: 'An ordered sub-action or precedence ladder that is itself the work instruction, rather than a conditional caveat on another instruction.' Add: 'Fallback branches qualifying one instruction use the same note form even when written as If/Else-if/Otherwise.' Keep the condition-to-structure distinction for branches that select whole steps or activities.",
        "An indented fallback ladder qualifying one lookup is flagged until represented as a note under that lookup.",
        "A primary ordered work sequence remains ordered work; a proper conditional note and an activity-level structural branch both pass.")

finding(22, "internal-exception-mismatch", "medium", ["AP-68", "AP-10", "DP-20"],
        [("AP-68", 892, 896), ("AP-10", 186, 186), ("DP-20", 97, 97)],
        "The explicit safe example 'no separate commit step follows' states the technique's position in the surrounding run, exactly what AP-68's Detect and test prohibit. The opening list also says 'a loop or iteration' without qualifying activity-level scope, although AP-10 permits local per-item work.",
        "A technique says 'No separate commit step follows.' Its truth depends on what the binding run does after this technique, so it answers where/when in workflow flow; the same string is expressly placed under Do not flag. By contrast, 'final validation' can name a product without making a graph claim.",
        "Remove 'no separate commit step follows' from Do not flag. Retain purpose examples such as 'final validation' only when they do not assert surrounding graph structure. Qualify Detect's loop language as 'an activity-level loop or iteration position'; explicitly retain a technique's internal iteration over its own input/output under AP-10's boundary.",
        "'No separate commit step follows' is flagged and the owning activity carries the sequencing fact.",
        "'Validate each finding in the declared input and emit the assessment' remains local technique work, and 'final validation' alone is not flagged.")

finding(23, "evidence-surface-addition", "low", ["AP-04", "AP-06", "AP-07"],
        [("AP-04", 104, 104), ("AP-06", 132, 134), ("AP-07", 144, 146)],
        "Several early entries test historical conduct: whether search, clarification, approval, or scope verification happened. A definition snapshot alone cannot decide those facts. The catalog does not identify the required observation or the result when that observation is absent.",
        "A well-formed name in a captured file provides no evidence that the author skipped convention search, just as a done statement alone does not show whether verification occurred. Treating absent history as a violation would be unsupported; treating the snapshot as a pass would also be unsupported.",
        "Add a short evidence convention to the catalog: 'A conduct test names its required record: request/approval, scope manifest, session trace, or recorded check. A source snapshot proves only source properties. When the required conduct record is unavailable, report the criterion as unevidenced and state what record would settle it.' Attach that evidence requirement to AP-04, AP-06, AP-07, and the other conduct entries during a coordinated update.",
        "A trace explicitly records choosing among two material intents and executing without a question: AP-06 can be decided and flagged.",
        "A source-only snapshot with no conversation trace is marked unevidenced for clarification conduct; an observed user-established default is accepted.")

finding(24, "optional-reference-economy", "low", ["AP-48", "AP-54", "AP-144"],
        [("AP-48", 652, 656), ("AP-54", 726, 726), ("AP-144", 1878, 1878)],
        "AP-48 treats generic output nouns as vague by form, whereas AP-54 and AP-144 allow same-step anaphora after an anchored noun. These entries can coexist as stricter output-specific style, but that policy is not stated; a unique, immediately anchored output may not be semantically vague at all.",
        "'Assemble {audit_report}. Persist the report.' has one output referent in the instruction. AP-48 prescribes repeating the designator; the general reference entries accept the anaphora. This is optional consistency and expression work, not a demonstrated logical contradiction between an entry and an exception on a different entry.",
        "Choose and state one policy. Recommended Detect: 'An output reference cannot be resolved to exactly one declared output or field from the current instruction and its already anchored noun.' Do not flag: 'Same-instruction anaphora with a unique anchored output.' If every output mention must instead be a designator for machine processing, retain the stricter test and state that concrete requirement rather than calling every noun vague.",
        "With two candidate outputs, 'persist the result' is flagged until the intended output is named.",
        "With one immediately anchored output, unambiguous anaphora passes under the recommended policy; the alternative machine-processing policy explicitly requires repetition.")

entry(1, "finding", (
    "Named file bodies are clear; 'new construct' extends past that boundary.",
    "Inlining is observable, but classification of schema-owned inline forms is unresolved.",
    "AP-17 requires inline checkpoints/loops while the broad parenthesis can catch them.",
    "Short literals do not explicitly cover composite checkpoint/loop forms.",
    "Extraction is sound only for a construct whose schema supports external reference.",
    "Restrict 'construct' to the intended file-bearing definitions."),
    "The file-separation goal is useful; the parenthetical and carve-out need the same scope.", (1,), ("AP-17", "DP-22"))

entry(2, "improvement", (
    "The boundary protects content authoring from unauthorized schema changes.",
    "Compare proposed schema changes with approved scope and validation purpose.",
    "AP-118 can prescribe an extension, so integrated authorization needs treatment.",
    "'Separate task' excludes a deliberately approved combined schema/consumer change.",
    "Conforming content is the default repair; a genuine capability gap needs a scoped decision.",
    "Use authorized change scope rather than task packaging as the qualifier."),
    "No contradiction is proved; clarify whether a combined approved task can legitimately evolve the schema.", (2,), ("AP-118", "DP-47"))

entry(3, "finding", (
    "Detect includes every commit although the failure is incomplete delivery.",
    "Scope manifest and declared completion/commit status distinguish the events.",
    "The broad commit trigger exceeds DP-03's check before claiming work done.",
    "Approved partial delivery is covered; ordinary interim commits are not.",
    "Completing every scope item before any commit blocks incremental recording.",
    "Name completion claims and final handoff rather than a bare commit."),
    "The completion invariant should remain strict while validated in-progress commits retain open scope.", (3,), ("AP-07", "AP-81", "DP-03"))

entry(4, "finding", (
    "A new identifier and a new convention need separate classification.",
    "Search and approval require historical records, not only the authored name.",
    "Detect's conjunction accepts a search-only adoption that Fix disallows.",
    "Reuse should explicitly include a fresh id following an existing convention.",
    "Search then approve genuine invention is coherent once Detect matches it.",
    "Use separate missing-search and missing-new-convention-approval predicates."),
    "Repair the Boolean condition and the identifier/convention distinction; record missing conduct evidence explicitly.", (4,23), ("DP-07",))

entry(5, "clear", (
    "The subject is independent user decisions combined in one checkpoint.",
    "Name each decision and show its independently selectable answer.",
    "AP-88 addresses the converse: splitting one decision across gates.",
    "One atomic choice with several options is explicitly exempt.",
    "Separate gates preserve independent choices and their effects.",
    "The independence predicate is qualitative but can be demonstrated with answer combinations."),
    "A checkpoint selecting both a deployment target and an unrelated license choice can be distinguished from one checkpoint selecting a target.", (), ("AP-88", "AP-08"))

entry(6, "improvement", (
    "Materially different interpretations of the actual request bound the rule.",
    "A request and execution trace can show the two interpretations and omitted question.",
    "Matches DP-04 and does not require clarification of unambiguous routine detail.",
    "Existing in-session defaults are expressly allowed.",
    "Ask before the ambiguous action while independent work can remain separate.",
    "State the evidence source so absent conversation history is not a guessed verdict."),
    "The substantive rule is coherent and observable; add an unevidenced outcome for a source-only audit.", (23,), ("DP-04", "AP-08"))

entry(7, "finding", (
    "Completion claims are clear, but the additional bare commit trigger broadens scope.",
    "Manifest verification needs check records and the claimed deliverable boundary.",
    "Fix discusses claiming done while Detect includes interim commits.",
    "Interim status is exempt; equivalent interim commits need the same distinction.",
    "Rechecking the current scope before completion directly closes the defect.",
    "Separate the observation of completion from the mechanics of committing."),
    "Use the completion boundary and identify the evidence needed to establish verification.", (3,23), ("AP-03", "AP-81", "DP-03"))

entry(8, "clear", (
    "User-facing messages and independent answer demands are explicitly named.",
    "Count distinct requested answers, not question marks or option labels.",
    "Consistent with AP-05's one atomic decision and DP-04's clarification stance.",
    "Clarifying context and options of one question are expressly excluded.",
    "Serial questions with an answer between them remove stacked demands.",
    "The semantic unit 'requires an answer' makes the wording actionable."),
    "A target question plus a deadline question is two demands; one target question with three choices remains one.", (), ("AP-05", "DP-04"))

entry(9, "finding", (
    "The intro names user decisions; Detect's verbs also catch local technical choices.",
    "Observe whether a person must answer before work progresses.",
    "DP-26 allows technique judgment that needs no human checkpoint.",
    "Messages and existing checkpoints are covered; local output selection needs explicit exclusion.",
    "Checkpoint structure closes a human decision gap only.",
    "Keep the word 'person' or 'user' in the operational predicate."),
    "Require a checkpoint for human decision dependence, not any imperative containing choose or confirm.", (5,), ("AP-11", "AP-89", "DP-26"))

entry(10, "clear", (
    "Session-level collection/condition repetition is distinguished from one application.",
    "Trace repeated steps, carried state, and the declared loop body.",
    "The local iteration exception fits DP-26 and structural fan-out in DP-40.",
    "Per-input-item work and refinement of the technique's own output are explicit.",
    "Move session repetition to nested loop steps while preserving local work.",
    "The two declared loop families and their field names make the test concrete."),
    "The entry already supplies a useful scope boundary; a full activity pass repeated until approval differs from refining one output within a technique.", (), ("DP-40", "AP-38", "AP-68"))

entry(11, "finding", (
    "Cross-activity routing is the intended scope; unspecified paths broaden it.",
    "A graph destination can be named and compared with declared routing.",
    "Local conditional interpretation allowed by DP-31 must stay outside this test.",
    "Step conditions and checkpoint-fed exits are expressly exempt.",
    "Activity decisions repair cross-activity movement, not every local branch.",
    "Replace activities/paths with next activities or graph destinations."),
    "The branch target must determine whether structure is missing.", (5,), ("AP-09", "DP-31"))

entry(12, "clear", (
    "A claimed file/report product is the subject; ordinary data outputs are separate.",
    "Compare the claimed durable file with the producer's Outputs artifact declaration.",
    "Complements AP-109's missing-value declaration and AP-31's synthesis rule.",
    "Non-artifact data correctly declared as data is excluded.",
    "Adding the file declaration to the producing output exposes the contract.",
    "The named heading and producer location make this actionable."),
    "A report promised only in a description is distinguishable from a declared file output and from a structured in-memory result.", (), ("AP-31", "AP-109"))

entry(13, "clear", (
    "Approval state that gates later work is the relevant state lifetime.",
    "Trace checkpoint effects to the typed variable and downstream predicates.",
    "Fits DP-14's single state home and AP-14's mode representation.",
    "A transient acknowledgment with no later gate is explicitly exempt.",
    "Declare and set the variable, then read it from the gate.",
    "The control-flow use, rather than the mere word approval, determines applicability."),
    "Remember approval in prose is a gap when a later step needs it; a one-message acknowledgment is not that gap.", (), ("AP-14", "DP-14"))

entry(14, "clear", (
    "Named modes that change skip or branch behavior are identified.",
    "Compare the mode variable and the actual step/exit predicates.",
    "AP-112 owns redundant Boolean projections, keeping one authoritative mode.",
    "Unrelated one-off conditions are outside the mode test.",
    "Set one mode early and express every mode-controlled branch structurally.",
    "The state-plus-condition requirement is concrete without prescribing all mode names."),
    "A prose fast-mode skip is a detectable gap; direct predicates on one declared mode satisfy the invariant.", (), ("AP-112", "DP-14"))

entry(15, "finding", (
    "The step-description scope combines reusable criteria, procedure, and iteration.",
    "Classify the misplaced content by the decision or work it owns.",
    "The generic move-to-Protocol repair conflicts with AP-104 and can bypass AP-10.",
    "Bound steps must lose description, but that does not select the destination of every clause.",
    "Choose resource, structural step, or Protocol before deleting source prose.",
    "Numbered criteria are not inherently procedural steps."),
    "The location smell is valid; its repair needs the correct destination for each content class.", (6,), ("AP-10", "AP-17", "AP-104"))

entry(16, "finding", (
    "Externally supplied values must be distinguished from locals and outputs.",
    "Resolve own, inherited, and documented ambient inputs before declaring a gap.",
    "inputs[] spelling differs from later Markdown input contracts and AP-62's ambient exception.",
    "Already-declared inputs need an explicit effective-contract interpretation.",
    "The missing input should be declared at the owning Markdown contract.",
    "Use the same authored representation as AP-148 rather than unexplained array syntax."),
    "The requirement is sound, but field spelling and ambient/inherited scope need a single model.", (7,), ("AP-62", "AP-148", "DP-13"))

entry(17, "clear", (
    "Technique-bound action/technique steps are the subject.",
    "Presence of description or name on the bound step is directly inspectable.",
    "Complements AP-15's unbound procedure and AP-18's repeated bindings.",
    "Checkpoint and loop inline fields are explicitly distinguished.",
    "Home the operative content in the technique, then remove bound-step prose.",
    "The allowed structural fields and distinct inline forms make the boundary usable."),
    "The field-purity test is deterministic. Its inline checkpoint/loop exception is evidence for tightening AP-01, not a defect in AP-17.", (), ("AP-01", "AP-15", "AP-18"))

entry(18, "clear", (
    "Several bindings of one technique differing only in prose are targeted.",
    "Compare bindings, gates, actions, and input/output deviations.",
    "AP-38 handles other duplicate-binding shapes; AP-17 handles prose on each step.",
    "Structural attach points and distinct pipeline uses are explicitly allowed.",
    "Reuse, collapse, or split according to whether one or several work products exist.",
    "The branch list is concise enough to distinguish redundant execution from distinct phases."),
    "Two adjacent identical bindings with only different captions are detectable; distinct structural purposes are not collapsed indiscriminately.", (), ("AP-17", "AP-38"))

entry(19, "clear", (
    "Rules that carry work rather than constraints are distinguished from invariants.",
    "Compare the rule with Protocol and show whether it adds a residual constraint.",
    "Inverse placement is addressed by AP-121; local constraints by AP-25.",
    "Positive outcome invariants and owner-citing prohibitions are explicitly retained.",
    "Delete duplicated work or move genuinely unstated work into its procedure.",
    "The distinction is semantic but the entry supplies positive and negative forms."),
    "'Write the report' is work; 'Every finding carries evidence' is an outcome constraint. No numeric threshold is needed to apply that distinction.", (), ("AP-25", "AP-121", "DP-13"))

entry(20, "finding", (
    "Apparently conflicting co-listed rules lack a precise applicability test.",
    "Name the different subjects or trigger conditions to demonstrate mere ambiguity.",
    "Group labels alone cannot exempt a true same-state contradiction under AP-24.",
    "The true-conflict exception is sensible but requires an effective-set comparison.",
    "Grouping repairs missing context only when the group actually states that context.",
    "Replace 'read as conflicting' with a subject/trigger distinction the reader can test."),
    "Grouping is presentation; explicit scope is what makes the obligations compatible.", (8,), ("AP-24", "AP-133", "DP-27"))

entry(21, "clear", (
    "Flat related rule families are the stated packaging subject.",
    "Identify the shared semantic prefix/family and the enclosing rule representation.",
    "Grouping need not merge independent constraints into one invariant.",
    "Unrelated rules and a lone rule are explicitly outside scope.",
    "The schema's string-or-array form preserves the separate rule texts in a group.",
    "Read shared prefix with the unrelated-rule exception; a stylistic prefix alone is insufficient."),
    "A repeated domain family can be grouped without conflating its distinct constraints; unrelated no-* names do not form a semantic family solely by prefix.", (), ("AP-20", "DP-45"))

entry(22, "finding", (
    "Duplicate invariant ownership is tested within and across levels.",
    "Compare trigger/consequence and verify whether separate edits could change behavior.",
    "The worker-reach exception is contradicted by AP-74's unconditional duplicate repair.",
    "Necessary worker copies are explicit here and need the same treatment in sibling checks.",
    "One authoring home is sound only if the reader's replacement delivery is preserved.",
    "Distinguish independently editable duplicates from generated delivery copies."),
    "The ownership rule is coherent locally; the catalog needs one shared delivery exception across duplicate-guidance checks.", (9,), ("AP-23", "AP-74", "DP-06"))

entry(23, "finding", (
    "Worker-directed behavioral rules are scoped by what their readers receive.",
    "Inspect the effective worker delivery rather than assuming workflow.yaml arrives.",
    "AP-74 removes the copies this rule preserves; AP-69 forbids literal activity rules.",
    "Orchestrator-only guidance is correctly excluded.",
    "A shared delivered contract is a valid consolidation; an unreachable pointer is not.",
    "'On the activity' must distinguish an activity definition from a workflow audience bucket."),
    "Preserve reach while choosing one authoring home and an exact permitted placement.", (9,10), ("AP-22", "AP-30", "AP-37", "AP-69", "AP-74", "DP-06"))

entry(24, "finding", (
    "Same technique or bucket is narrower than the effective rule set delivered to one reader.",
    "A witness needs one subject/state and two mutually exclusive requirements.",
    "Inherited and universal/local rules can conflict across the stated source boundary.",
    "Group keys excuse only genuinely disjoint conditions, not conflicting obligations with labels.",
    "Resolve the ownership or precedence before removing a rule; staleness is not always established.",
    "Name the effective set and common applicability rather than relying on sibling placement."),
    "Extend the check across merged contracts and require an explicit same-state witness.", (8,), ("AP-20", "AP-133", "DP-27"))

entry(25, "improvement", (
    "Single-Protocol-step constraints are the relevant local scope.",
    "Trace the rule's predicate and consequences to the phases it actually constrains.",
    "Its trigger and repair duplicate AP-60 without a stable division.",
    "Cross-cutting invariants and existing local notes are adequately excluded.",
    "Move local caveats to their instruction, preserving the constraint.",
    "One local-scope entry can own this rule and cite AP-59 for formatting."),
    "The criterion is useful and observable; consolidation would remove duplicate judgments and maintenance.", (11,), ("AP-60", "AP-59", "AP-121"))

entry(26, "improvement", (
    "The listed prose surfaces are explicit and include procedure/rule text.",
    "Deletion is observable, but keeping the invariant alone does not prove that a failure explanation is dispensable.",
    "AP-135 keeps reasons and AP-152 permits a live failure mode, requiring a shared boundary.",
    "Actor boundaries and owner citations are covered; operative explanations need equivalent treatment.",
    "The Fix's keep-a-fact instruction can preserve useful clauses but is broader than Detect's deletion test.",
    "Distinguish historical/redundant rationale from explanation that changes present interpretation."),
    "Treat the suggested change as an operational clarity improvement, not a ban on concise explanatory facts.", (12,), ("AP-135", "AP-152", "DP-17"))

entry(27, "clear", (
    "The subject is a validate-action failure message after cause and remedy are already stated.",
    "Remove the trailing explanation and check whether the failure and required action stay complete.",
    "Fits output economy and AP-26's removal of dispensable rationale.",
    "Equivalent minimal cause-plus-fix wording is allowed, not only one exact sentence template.",
    "Deleting trailing consequence paragraphs directly removes the targeted excess.",
    "'Essays' is informal, but cause-and-action completeness supplies a usable qualitative test."),
    "A blocked user can identify what failed and what action resolves it without a second explanation of already-known consequences.", (), ("AP-26", "DP-12"))

entry(28, "clear", (
    "Definition descriptions that duplicate a canonical sequence are identified.",
    "Compare the prose sequence with the actual graph/steps or explicitly represented layout.",
    "README orientation is deliberately handled separately by AP-40.",
    "Purpose and value without a reproduced sequence remain allowed.",
    "Remove the duplicate sequence while preserving the purpose statement.",
    "The authoritative structural sequence is the essential precondition, not merely several nouns in prose."),
    "A description reciting A then B then C when those steps are declared is distinct from a statement of the workflow's purpose.", (), ("AP-40", "AP-107", "DP-05"))

entry(29, "improvement", (
    "User-owned environment state outside the tree is an explicit boundary.",
    "A directed command and its mutation target establish applicability.",
    "No contradiction with confirmation is proved; confirmation does not itself authorize a prohibited task.",
    "Diagnostics and in-repository edits are clear; authorized environment maintenance is not addressed.",
    "Diagnostic-only remediation preserves the stated strict product boundary.",
    "State whether that boundary is absolute product scope or unauthorized-scope protection."),
    "An explicit policy choice would prevent readers from guessing whether the rule applies to a directly requested environment-repair workflow.", (13,), ("DP-08",))

entry(30, "finding", (
    "Role prescriptions in descriptive fields are clearly distinguished from purpose.",
    "Identify the commanded actor and the behavior the description requires.",
    "Moving to rules on an owning activity conflicts with AP-69's no-exception ban.",
    "Existing constraints and non-prescriptive summaries are appropriately excluded.",
    "Name an allowed technique/shared or workflow audience home, not any owning construct's rules field.",
    "The destination phrase needs precise construct and audience names."),
    "The placement smell is valid, but the current generic relocation can create forbidden activity prose rules.", (10,), ("AP-23", "AP-37", "AP-69"))

entry(31, "finding", (
    "Hand-authored activity artifacts arrays are unambiguously targeted.",
    "Inspect the activity field and each producing technique's declared file outputs.",
    "The discriminator-keyed note repair disagrees with AP-130's one-filename body.",
    "Non-file side effects are distinguished from the synthesized file contract.",
    "Delete activity artifacts and declare valid file output bodies at their producers.",
    "Remove the unsupported conditional-note branch and cite the entry that owns filename grammar."),
    "Synthesis has a clear source of truth; its repair instruction must use the same artifact grammar as the rest of the canon.", (14,), ("AP-12", "AP-44", "AP-130"))

entry(32, "finding", (
    "Outcomes that assert only file/variable production are the intended bad class.",
    "Rename invariance alone does not distinguish delivered value from generic storage acts.",
    "The stated Test reads like a desired property, with no explicit failure polarity.",
    "A mechanical name supporting a real value statement is properly retained.",
    "Rewrite around what a consumer can know or do, not just a produced container.",
    "State the positive failure predicate and qualify the rename thought experiment."),
    "A clear value-versus-vessel distinction remains, but the current test can reverse or fail to decide it.", (15,), ("DP-12", "AP-109"))

entry(33, "clear", (
    "A bound step's set duplicating its technique's own computed output is the target.",
    "Compare the set target, producer Protocol, Outputs, and binding.",
    "AP-34 distinguishes control derivations and AP-35 input timing.",
    "Accumulators, caller-specific derivation, and value-bearing control state have explicit exceptions.",
    "Declare the product at the technique and remove its duplicate activity assignment.",
    "The exceptions prevent a generic ban on all activity sets."),
    "A second assignment of the technique's assessment is redundant; orchestration accumulation or a later derived state has a different role.", (), ("AP-34", "AP-35", "AP-42"))

entry(34, "clear", (
    "A control step with no bound technique and a value-less domain derivation is explicit.",
    "Inspect value presence and whether description is the only derivation procedure.",
    "Complements AP-33 and keeps domain production in techniques.",
    "Value-bearing orchestration state and the separate bound-output defect are distinguished.",
    "Bind the producer and declare its output rather than leave a prose assignment.",
    "Although capitalization is emphatic, the control/value/domain predicates are concrete."),
    "A target-only set that explains how to build a domain assessment has no value contract; a literal control-state assignment does.", (), ("AP-33", "DP-05"))

entry(35, "clear", (
    "A same-step set feeding its own technique input is the precise timing hazard.",
    "Match the interpolation to a target written by the same step.",
    "The stated invocation-before-side-effect boundary explains the defect without conflicting with output binding.",
    "Sets for later consumers and independent accumulator/control state are excluded.",
    "Produce the value earlier at its source, then keep the consuming binding pure.",
    "The producer/consumer ordering is explicit enough to reproduce the failure."),
    "An input that depends on an assignment with no before-input contract is invalid regardless of the assignment's intended prose order.", (), ("AP-33", "AP-128"))

entry(36, "clear", (
    "Overlap between activity strategy listings and actual step bindings is targeted.",
    "Resolve technique identities in top-level and nested loop binds and compare the sets.",
    "Distinct strategy delivery and per-step execution fit AP-39's inheritance rule.",
    "A strategy with no step bind is explicitly retained.",
    "Delete overlapping listings without deleting the actual step bind.",
    "The locations and matching key are concrete."),
    "The same op in both places is detectable; a cross-cutting strategy appearing only in the strategy list remains valid.", (), ("AP-39",))

entry(37, "clear", (
    "Workflow rule audience buckets are classified by the actor commanded.",
    "Compare delivery through get_workflow/get_activity with who can perform the duty.",
    "The explicit rules.workflow versus rules.activity distinction helps resolve AP-23's ambiguous placement.",
    "Same duty for both actors belongs in universal; actor narration is handled separately.",
    "Move to the right bucket and split instructions that command actors differently.",
    "Specific actor and delivery names make the classification observable."),
    "An orchestrator dispatch duty and a worker persistence duty have different recipients; moving a bucket does not itself repair actor narration.", (), ("AP-23", "AP-69", "AP-146"))

entry(38, "clear", (
    "Repeated same-technique bindings within an activity are classified by their structural purpose.",
    "Inspect outputs, collection inputs, sub-mode distinctions, gates, and pipeline positions.",
    "AP-18 covers description-only monolith masking; this entry adds redundant execution and unrolled collections.",
    "Static targets, exclusive branches, and distinct pipeline uses prevent blanket deduplication.",
    "Collapse, loop, or split only after matching one of the listed shapes.",
    "The classifications supply concrete evidence rather than judging repetitions by count alone."),
    "The same op can legitimately occur twice; only the stated redundant, iterative, or masking shapes trigger repair.", (), ("AP-18", "AP-10"))

entry(39, "finding", (
    "Universality is the intended scope; near-universality is a different property.",
    "Applicability to each activity is observable; the fraction of declarations does not establish it.",
    "Detect and Do not flag both apply to a strategy used by nine of ten activities.",
    "Subset-only strategies are properly retained locally but collide with 'nearly every'.",
    "Hoist only after establishing every activity's duty, not merely widespread use.",
    "Replace the vague quantifier with semantic applicability, not a percentage."),
    "A precise contract boundary resolves this without inventing a numerical threshold.", (16,), ("AP-36",))

entry(40, "clear", (
    "README transcriptions of authoritative details are distinguished from orientation.",
    "Match each duplicated field/list to YAML or folder inventory and apply the explicit exceptions.",
    "DP-11 and AP-159 still require useful orientation; AP-107 owns duplicate pass inventories.",
    "Diagrams, concise roles, file indexes, and purpose are deliberately allowed despite change coupling.",
    "Delete detailed duplication while retaining navigational and purpose information.",
    "The broad edit-coupling test is correctly limited by named orientation exceptions."),
    "The rule does not demand that READMEs be independent of every structural change; it draws an explicit detail-versus-orientation boundary.", (), ("DP-11", "AP-107", "AP-159"))

entry(41, "clear", (
    "Definition prose is separated from planning history and runtime constraints.",
    "Ask whether the clause describes current behavior or requires remembering an alternative design.",
    "Matches DP-17 without banning every English negation.",
    "Runtime prohibitions, schema operators, catalog examples, and validation errors are explicitly retained.",
    "Rewrite around the current behavior while preserving live constraints.",
    "The edit-when-old-way-is-forgotten signal makes the stylistic goal operational."),
    "'The workflow now avoids the old manual path' differs from a current invariant such as 'Secrets stay out of artifacts'.", (), ("DP-17", "AP-26"))

entry(42, "clear", (
    "I/O descriptions naming workflow-internal producers or consumers are the subject.",
    "Inspect the named/link target and whether it identifies a particular workflow position.",
    "Consistent with DP-37; AP-125 adds the broader technique-link form.",
    "Intrinsic/external origins and resource links describing shape remain useful contract facts.",
    "State meaning, shape, and allowed values without the caller's topology.",
    "The boundary between a value's nature and one caller's source is well illustrated."),
    "'Findings from the assessment activity' couples a contract; 'Findings with severity and source evidence' defines the value.", (), ("DP-37", "AP-125", "AP-119"))

entry(43, "improvement", (
    "Literal artifact references and path-flavored ids are both named.",
    "Compare the Protocol reference with declared I/O and artifact metadata.",
    "The literal-file case duplicates AP-44; identifier shape is also owned by AP-66.",
    "Artifact declaration literals and resource-template nouns are expressly allowed.",
    "Use the declared designator and preserve filename metadata at its declaration.",
    "Separating reference syntax from id shape would give each invariant one home."),
    "The checks are observable; consolidate duplicated ownership rather than label the overlap a contradiction.", (17,), ("AP-44", "AP-66"))

entry(44, "improvement", (
    "Concrete artifact filenames inside Protocol are a precise target.",
    "A literal filename can be compared directly with its declared artifact/input id.",
    "The same case and remedy appear in AP-43; AP-130 owns the declaration grammar.",
    "Canonical designators are excluded and opaque arrays have their own check.",
    "Move the filename to the declaration and use the identifier in work instructions.",
    "Keep one Protocol-filename entry and point to the filename grammar owner."),
    "The individual rule is usable, but one construct need not yield both AP-43 and AP-44 findings.", (17,), ("AP-43", "AP-45", "AP-130"))

entry(45, "clear", (
    "An opaque array replacing distinct semantic artifact inputs is the target.",
    "Show that Protocol must recover file identities the input contract does not name.",
    "Fits AP-43/AP-44's declaration ownership without banning every collection.",
    "A single named artifact is explicit; a meaningful structured collection does not satisfy the opaque/forced-filename Detect.",
    "Give fixed semantic artifact roles their own declared inputs.",
    "The forced-Protocol-filenames condition keeps the rule narrower than a ban on path arrays by name alone."),
    "An unordered list of specification/review paths that the procedure must identify by filename differs from a declared collection whose entries already carry semantic roles.", (), ("AP-43", "AP-44"))

entry(46, "clear", (
    "Ordinary resources naming host callers, destinations, or binding topology are explicit.",
    "Delete the host narrative and verify that template/vocabulary/guide use remains complete.",
    "The prompt-domain exception accommodates resources whose subject is running the engine.",
    "Creation-guide artifact names, template filenames, shape headings, and appropriate resource references are retained.",
    "Move actual orchestration into its owning activity or technique and preserve usable fill material.",
    "Examples are numerous but the host-coupling predicate and exceptions provide a coherent decision."),
    "'Used by activity X at gate Y' is incidental to a general template; a creation guide's subject filename is not that incidental backlink.", (), ("DP-30", "AP-92", "AP-116"))

entry(47, "clear", (
    "Immediate textual repetition before a same-name hyperlink is precisely scoped.",
    "Normalize case, hyphen, and underscore and compare the two labels.",
    "No broader reference or contract rule requires the redundant wrapper.",
    "A distinct preceding role label is explicitly preserved.",
    "A single hyperlink preserves both the name and navigation.",
    "The concrete text pattern and normalization rule are sufficient."),
    "deep_scan followed by a same-name parenthetical link is redundant; a role word followed by a different resource id is informative.", (), ())

entry(48, "improvement", (
    "References to declared outputs are the scope, not all descriptive nouns.",
    "Named output slots make ambiguity testable, but the current noun list treats unique anaphora as vague.",
    "General reference entries allow same-step anaphora; output-specific strictness could be intentional.",
    "Existing designators and non-output prose are excluded; unique anchored anaphora is unstated.",
    "Substitute the id when needed to identify the output; decide whether machine processing needs every repetition.",
    "Distinguish ambiguity from a stricter formatting requirement."),
    "State a consistent reference policy; no contradiction is claimed solely from a narrower style rule.", (24,), ("AP-54", "AP-144"))

entry(49, "clear", (
    "Protocol narration of server delivery mechanics is the named surface.",
    "Identify whether the clause tells the reader an action or merely describes packaging.",
    "AP-50 owns invocation recipes and AP-150 owns irrelevant engine internals.",
    "An engine technique whose domain is delivery behavior is explicitly allowed.",
    "Delete packaging narration while retaining the imperative and applicable resource reference.",
    "The delivery examples and domain exception make the scope concrete."),
    "An ordinary analysis technique need not teach where its resources appear in a tool response; an engine delivery technique may need that operational fact.", (), ("AP-50", "AP-150"))

entry(50, "clear", (
    "Harness/MCP call recipes outside the owning tool-use surface are the target.",
    "Locate the call name, arguments, or sequence and classify the technique's domain.",
    "Tool wrappers and engine/conduct entry surfaces are explicitly distinguished from ordinary resource consultation.",
    "The primitive wrapper may name its own tool; plain applicable references carry no recipe.",
    "Remove a foreign tool recipe while preserving the reader's obligation or owned call.",
    "The domain-based exception is substantive, not just a file-name whitelist."),
    "The entry supplies a workable ownership boundary; AP-51's replacement instruction needs separate reconciliation with the no-invocation rule.", (), ("AP-49", "AP-51", "AP-114", "AP-150"))

entry(51, "finding", (
    "A raw tool call with an existing shared owner is clearly identified.",
    "Resolve the wrapping capability and inspect the local Protocol call.",
    "Its proposed in-Protocol wrapper invocation triggers AP-114; a consult-only technique link can trigger AP-157.",
    "The wrapper's own raw call and unaided sibling recovery have express exceptions.",
    "Move shared execution to an activity/routine bind and pass the product to local work.",
    "Canonical spelling must be separated from permission to invoke another technique here."),
    "The shared-capability goal is valid, but its current repair creates a forbidden Protocol-to-Protocol call.", (18,), ("AP-114", "AP-157", "DP-25"))

entry(52, "clear", (
    "Uses of formal declared values, not coincidental English or declaration headings, are targeted.",
    "Resolve the token to its declaration and compare exact spelling and designator form.",
    "AP-62 distinguishes local bind sites from reads; AP-63 owns code-span formatting.",
    "Ordinary language and unrelated literal parameters are expressly excluded.",
    "Use the declared designator and tie orphan enum/index values to their controlling input.",
    "The token-kind distinctions are concrete despite the variety of examples."),
    "An actual target_path reference requires its designator; a prose word merely coinciding with a symbol does not.", (), ("AP-62", "AP-63", "DP-16"))

entry(53, "finding", (
    "Rule-address spelling and delivered rule visibility are combined in one scope.",
    "A static tree can prove declarations but may not prove a dynamic role bundle.",
    "Bare-name ancestry wording and bundled-contract reach need one resolution model.",
    "Resource/README links and the pre-session override are recognized but unknown bundle evidence is not.",
    "Correct the address and establish delivery independently; one does not prove the other.",
    "Separate grammar, lookup context, and audit evidence instead of 'shorter than the rules'."),
    "The difficult case is unavailable delivery evidence, not lack of a numerical metric; record that limit explicitly.", (19,), ("DP-36", "AP-145", "AP-143"))

entry(54, "clear", (
    "References to formal I/O, rule, technique, or resource targets are explicitly classified.",
    "Resolve the target kind and check its specified reference form.",
    "It explicitly defers forbidden technique invocation/reference cases to AP-114/AP-157.",
    "Domain prose and already-anchored same-step anaphora are clearly allowed.",
    "Anchor a valid target or remove a genuinely dangling reference.",
    "The precedence sentences prevent a link-only repair from laundering a forbidden technique reference."),
    "This entry has a useful distinction between malformed references and references that should not exist on the surface at all.", (), ("AP-48", "AP-51", "AP-114", "AP-157"))

entry(55, "improvement", (
    "Repeated input contracts and synonym drift are identifiable; workflow-wide context is a special scope.",
    "Resolve the common ancestor and semantic identity, not just repeated spelling.",
    "The two/three-leaf exception overlaps the unconditional workflow-wide hoist instruction.",
    "The leaf-count carve-out correctly does not excuse inherited redeclarations under AP-148.",
    "Hoist to the contract owner and remove duplicates, retaining producer outputs where required.",
    "Replace 'many' with a stated ownership test or an explicitly limited count policy."),
    "The central reuse rule works; make the workflow-wide case's precedence over the small-leaf carve-out explicit.", (20,), ("AP-148", "AP-58", "DP-27"))

entry(56, "clear", (
    "Argument slot names and argument lists are distinguished from values and literals.",
    "Check whether a token names the invoked operation's parameter or a declared bound value.",
    "Matches DP-16; the rule formats an otherwise permitted invocation rather than authorizing one.",
    "JSON/query payloads, ordinary emphasis, and correctly marked values are expressly exempt.",
    "The cited principle provides the exact parentheses-and-italic form.",
    "The repeated 'technique/technique' phrase is a minor copy-edit, with no substantive ambiguity in the parameter test."),
    "A parameter slot and its value occupy different typographic forms; apply the no-invocation checks before this formatting check.", (), ("DP-16", "AP-114", "AP-52", "AP-63"))

entry(57, "clear", (
    "Literal dollar characters in rendered prose are the intended subject.",
    "Classify prose versus code and distinguish a literal character from intended math markup.",
    "AP-63 places protocol variable syntax in code spans, avoiding accidental escaping.",
    "Code spans and fences are explicitly protected from escaping that corrupts code.",
    "Escape a literal prose dollar while retaining code bytes.",
    "Read the literal qualifier across the entry; no new verdict about the current renderer was inferred."),
    "The literal-versus-code rule is inspectable. This review does not independently validate the source's renderer-specific GFM claim.", (), ("AP-63",))

entry(58, "clear", (
    "Evaluated symbol ids are separated from technique/resource/rule names.",
    "Inspect the declared symbol class and its spelling.",
    "DP-19 supplies the same naming stance; input/output identity is permitted for a real shared value.",
    "External tool parameter spellings and kebab-case name identities are explicitly retained.",
    "Rename symbol ids while preserving exact external parameter mirrors.",
    "The two identifier classes and their exceptions make the rule deterministic."),
    "snake_case for values and kebab-case for named definitions are distinct conventions; an external cloudId parameter mirror is not an invented local symbol spelling.", (), ("DP-19", "AP-55", "AP-66"))

entry(59, "finding", (
    "A caveat on one instruction is distinguished from the instruction itself.",
    "The parser's treatment of indentation provides a concrete consequence to verify.",
    "The any-indent conditional-ladder exception is broader than DP-31's note requirement.",
    "Primary ordered work should be exempt; fallback ladders qualifying one instruction need a narrower exception.",
    "Move local branches into notes; keep whole-step/activity selection in structure.",
    "Replace 'at any indent' with a semantic distinction between work and qualifying caveat."),
    "The note rule has a clear purpose, but its ladder exception can admit the very flattened branches it detects.", (21,), ("DP-31", "AP-108", "AP-25", "AP-60"))

entry(60, "improvement", (
    "A local rule applying to only one Protocol block is well scoped.",
    "Trace the predicate to the single instruction/block it qualifies.",
    "The same trigger and note/prose repair are already in AP-25.",
    "Cross-cutting rules and existing local notes are appropriately excluded.",
    "Demotion to the qualifying instruction retains the actual constraint.",
    "The cross-reference to AP-25 does not establish a disjoint boundary."),
    "Consolidate this duplicate local-scope criterion while leaving AP-59 to own note syntax.", (11,), ("AP-25", "AP-59"))

entry(61, "clear", (
    "Repeated literals and hard-coded uses of an already declared path are the subjects.",
    "Match semantic path identity and inspect existing input/default/local definitions.",
    "Fits AP-127's declared-value use and AP-55's shared contract placement.",
    "Single-use values, the canonical definition, and similar-looking distinct paths are expressly excluded.",
    "Factor one semantic location and correct wrong-location uses without inventing a shadow variable.",
    "The semantic-identity exception prevents mechanical string deduplication of unrelated paths."),
    "Repeated references to the same artifact root can share a designator; two coincidentally similar paths with different roles need not.", (), ("AP-55", "AP-127"))

entry(62, "improvement", (
    "Local binding sites, local reads, and declared/ambient inputs are distinguished.",
    "The bind/read spellings and textual producer position can be inspected; path reachability is a separate check.",
    "Its ambient-input exemption needs the same effective-contract model as AP-16.",
    "Mutually exclusive producers and declared inputs are expressly permitted.",
    "Bind a real local once at its producer, read its name, or remove a dead binding.",
    "Name the source of ambient inputs rather than implying an open set from examples."),
    "The local-use criterion is clear; align the ambient exception with declared-input quality checks. Textual order alone is not a claim of path-total production.", (7,), ("AP-16", "AP-128", "AP-52"))

entry(63, "clear", (
    "Code tokens are separated from descriptive prose and navigable link targets.",
    "Inspect Markdown spans/fences and the declared token class.",
    "Braces remain required by AP-52; invocation argument names use AP-56's different form.",
    "Already protected code, ordinary nouns, links, and parameter labels are explicit exceptions.",
    "Wrap the full token/command in one span and preserve its actual code content.",
    "Fragmented spans and escaped local markers receive specific unambiguous repairs."),
    "Formatting a whole command as one code span preserves both readability and its embedded designators.", (), ("AP-52", "AP-56", "AP-57"))

entry(64, "clear", (
    "Boolean value identifiers are the subject, not arbitrary state or enum names.",
    "Compare the identifier with the proposition for which the Boolean is true.",
    "Implements DP-19's affirmative predicate stance without forcing one prefix.",
    "Clear unprefixed predicates and meaningful is/has/can/should forms are retained.",
    "Rename to a predicate that preserves the actual truth condition.",
    "The true-value meaning, not a token-count rule, determines whether the stem is affirmative."),
    "A generic status_flag conceals the true condition; ready or has_findings identifies it. Any rename must preserve that condition across consumers.", (), ("DP-19", "AP-58"))

entry(65, "clear", (
    "Iterated collections and key-addressed maps have distinct named shapes.",
    "Observe the value's iteration or key-lookup use, then compare the id's noun shape.",
    "Fits DP-19's value naming and AP-66's avoidance of representation suffixes.",
    "Plural collection nouns and discriminator heads are explicitly retained.",
    "Use plural item names for collections and a meaningful mapping name for keyed maps.",
    "The collection-versus-map distinction makes the convention more precise than a blanket plural rule."),
    "tasks describes a collection; domain_to_range describes a keyed map. An array implementation alone need not appear in the identifier.", (), ("DP-19", "AP-66"))

entry(66, "clear", (
    "I/O identifiers encode semantic values rather than direction or representation.",
    "Check declared ids, true input/output pass-through, and the enumerated generic-name cases.",
    "AP-43's path-id subcase overlaps here, but the rule's own naming checks remain coherent.",
    "External spellings, plural collections, and qualified head-noun phrases are expressly retained.",
    "Rename and unify a shared concept at its owning contract rather than copy caller-specific names.",
    "The explicit examples make this a house naming convention, not a claim that every one-word noun is inherently ambiguous."),
    "The criterion is decidable as a stated convention; consolidation with AP-43 is reported under the duplicate owner rather than recasting the convention as a logical error.", (), ("AP-43", "AP-55", "AP-65", "DP-19"))

entry(67, "clear", (
    "Rule slugs are evaluated for an available equally clear affirmative invariant.",
    "Compare candidate names against the rule's actual trigger and obligation.",
    "DP-19 explicitly makes positive rule names a clarity preference, not an absolute prohibition.",
    "Intentional clear negations are retained rather than mechanically renamed.",
    "Rename only when the affirmative form preserves or improves clarity.",
    "A qualitative comparison is appropriate here; a numeric name-length threshold would not settle it."),
    "This is a preference with an explicit clarity exception. never-resume may be clearer than an invented positive euphemism and need not be changed.", (), ("DP-19", "AP-58"))

entry(68, "finding", (
    "Technique claims about activity flow and human gates are the intended boundary.",
    "Ask whether truth depends on the surrounding graph or on one local application.",
    "The 'no separate commit step follows' safe example asserts exactly the surrounding sequence being prohibited.",
    "Local input iteration should also be explicit so AP-10's valid case survives.",
    "Move actual routing/approval to activity structure and keep emitted evidence local.",
    "Remove the graph-position example and qualify loop/iteration as activity-level."),
    "Purpose words can be stage-neutral; a claim about which step follows the technique cannot be.", (22,), ("AP-10", "AP-113", "DP-20"))


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def batches(prefix, records):
    groups = []
    current = []
    for item in records:
        if current and (len(current) == 8 or len(encoded(current + [item])) > 16000):
            groups.append(current)
            current = []
        current.append(item)
        assert len(encoded(current)) <= 16000, (prefix, item["id"])
    if current:
        groups.append(current)
    result = []
    for index, group in enumerate(groups, 1):
        name = f"{prefix}-{index:02d}.json"
        payload = encoded(group)
        (OUT / name).write_bytes(payload)
        result.append({"path": name, "entries": [item["id"] for item in group], "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()})
    return result


expected = inventory["assignments"]["ap_structures"]["entries"]
assert [item["id"] for item in ledger] == expected
assert len({item["id"] for item in ledger}) == 68
finding_ids = {item["id"] for item in findings}
assert len(finding_ids) == len(findings)
for item in ledger:
    assert item["disposition"] in {"clear", "finding", "improvement"}
    assert all(len(reason) >= 20 for reason in item["checks"].values())
    assert set(item["finding_ids"]) <= finding_ids
    assert all(key in by_id for key in item["related_ids"])
    assert (item["disposition"] == "clear") == (not item["finding_ids"])
for item in findings:
    assert set(item["entries"]) <= set(by_id)
    assert any(key in expected for key in item["entries"])
    assert item["observing_check"]["positive"] and item["observing_check"]["negative"]
    for evidence in item["evidence"]:
        owner = by_id[evidence["entry"]]
        assert owner["start"] <= evidence["start"] <= evidence["end"] <= owner["end"], evidence
        assert evidence["quote"] == "\n".join(sources[owner["source"]][evidence["start"] - 1:evidence["end"]])

read_log = [json.loads(line) for line in (OUT / "read-log.jsonl").read_text().splitlines()]
read_coverage = []
for source in inventory["sources"]:
    raw = (ROOT / source["capture"]).read_bytes()
    assert len(raw) == source["bytes"]
    assert hashlib.sha256(raw).hexdigest() == source["sha256"]
    records = [item for item in read_log if item["source"] == source["capture"]]
    covered = {line for item in records for line in range(item["range"][0], item["range"][1] + 1)}
    assert covered == set(range(1, source["lines"] + 1))
    assert all(item["source_sha256"] == source["sha256"] for item in records)
    read_coverage.append({"source": source["capture"], "sha256": source["sha256"], "bytes": len(raw), "lines": len(covered), "ranges": [item["range"] for item in records], "outcome": "Complete; all instrumented ranges returned without tool truncation."})

ledger_files = batches("ledger", ledger)
finding_files = batches("findings", findings)
finished = datetime.now(timezone.utc)
started = datetime.fromisoformat(read_log[0]["utc"])
counts = {key: sum(item["disposition"] == key for item in ledger) for key in ("clear", "finding", "improvement")}
priorities = {key: sum(item["priority"] == key for item in findings) for key in ("high", "medium", "low")}
coverage = {
    "assignment": "ap_structures", "primary_ids": expected,
    "scope": "Canon criterion quality only; suggestions; no definition-conformance verdict and no corpus edits.",
    "revision": inventory["revision"], "revision_provenance": "Coordinator supplied revision; captured source SHA-256 identities independently checked against inventory. No Git or network access used.",
    "primary_source_bytes": inventory["assignments"]["ap_structures"]["primary_bytes"],
    "source_reads": read_coverage, "unique_source_bytes": sum(item["bytes"] for item in read_coverage),
    "instrumented_emitted_source_bytes": sum(item["selected_bytes"] for item in read_log),
    "instrumented_read_count": len(read_log), "instrumented_read_io_seconds": sum(item["read_elapsed_seconds"] for item in read_log),
    "measured_interval_start_utc": started.isoformat(), "measured_interval_end_utc": finished.isoformat(),
    "measured_interval_elapsed_seconds": (finished - started).total_seconds(),
    "timing_scope": "Wall time from first instrumented full-source read through artifact validation, including reasoning and writing; excludes preliminary instruction discovery and the first truncated combined read.",
    "ledger_dispositions": counts, "finding_record_priorities": priorities,
    "ledger_files": ledger_files, "finding_files": finding_files,
    "validation": {"primary_ids_exactly_once": True, "six_reasoned_checks_per_primary": True, "all_evidence_ranges_within_entry": True, "quotes_match_captured_sources": True, "whole_sources_read_without_final_gaps": True, "max_entries_per_json_batch": 8, "max_utf8_bytes_per_json_batch": 16000},
    "limits": ["No application schema or loader execution was independently inspected; proposed syntax involving ambient inputs and dotted address resolution needs implementation confirmation before adoption.", "AP-57's renderer-specific factual claim was not independently verified; the disposition covers the wording's literal-versus-code boundary.", "Cross-entry review is a source-grounded qualitative check, not a formal proof of natural-language consistency.", "Initial combined inventory/skill and principles outputs were truncated; every captured-source byte was subsequently reread in the complete instrumented ranges listed here."]
}
(OUT / "coverage.json").write_bytes(encoded(coverage))

record_to_file = {key: item["path"] for item in finding_files for key in item["entries"]}
rows = ["| Record | Kind | Priority | Primary entries with this disposition |", "| --- | --- | --- | --- |"]
for item in findings:
    primary = ", ".join(row["id"] for row in ledger if item["id"] in row["finding_ids"])
    rows.append(f"| [{item['id']}]({record_to_file[item['id']]}) | {item['kind']} | {item['priority']} | {primary} |")
summary = f"""# AP-01–AP-68 quality review

Reviewed all 68 assigned anti-patterns against the complete captured catalog and all 47 principles at `{inventory['revision']}`. This is a review of the canon's criteria, not a conformance audit of workflow definitions. No corpus files were edited.

- Dispositions: **{counts['clear']} clear**, **{counts['finding']} with findings**, **{counts['improvement']} with optional improvements**. Every primary entry has six reasoned checks in the [ledger batches](coverage.json).
- Read coverage: **176,058 unique source bytes**, both complete captured files, in **{len(read_log)} bounded reads**. Hashes match the inventory. [Read log](read-log.jsonl); [coverage, elapsed time, limits, and batch identities](coverage.json); [preliminary reads and truncation recovery](preliminary-read-log.md).
- Records: **{priorities['high']} high**, **{priorities['medium']} medium**, **{priorities['low']} low**. Each record supplies exact source lines and quotes, a witness, replacement wording or a structural edit, and positive/negative observing examples.

## First repairs to reconcile

- [AS-09]({record_to_file['AS-09']}): worker-rule copies are required for reach by AP-23 and removed as duplicates by AP-74. Establish one authoring home and verify delivery before deleting copies.
- [AS-14]({record_to_file['AS-14']}): AP-31's conditional artifact-note repair conflicts with AP-130's one-filename contract. Use the filename grammar owned by AP-130.
- [AS-18]({record_to_file['AS-18']}): AP-51's wrapper-call repair introduces an invocation AP-114 forbids. Put shared work in activity/routine binds and pass its product to local work.

Other defects concern completion versus interim commits; naming-search Boolean logic; human, local, and graph decision scopes; misplaced criteria repair; effective inherited rule sets; inconsistent declaration language; universal versus near-universal strategies; and stage-position exceptions. These are kept distinct from mere overlap and optional policy choices.

## Useful structural improvements

- Consolidate AP-25/AP-60 and the literal-filename portion of AP-43/AP-44. Duplicate findings are overlap, not contradiction.
- Give conduct criteria a required evidence surface and an explicit unevidenced outcome. A definition snapshot cannot prove whether clarification or approval occurred.
- State the effective input/rule contract used by a static review, including inherited and ambient values. Do not guess dynamic delivery.
- Use semantic applicability instead of 'nearly every', and make any small-leaf exception's precedence explicit. Qualitative evidence is sufficient where it identifies the subject, trigger, and consequence.

## Record index

{chr(10).join(rows)}

## Validation and limits

The builder validates all 68 primary ids exactly once, every evidence range within its named entry, verbatim captured quotes, complete source-line coverage, all finding references, and JSON batches of at most eight records and 16,000 UTF-8 bytes. The [builder](build_review.py) and [bounded reader](read_source.py) preserve the procedure. The reported wall interval begins at the first instrumented source read; preliminary setup time is excluded.

Root review should independently confirm the three high-priority repair conflicts, reconcile cross-slice observations, and decide the optional authorization and reference-style policies. Ambient-input and dotted-address replacements require checking the corresponding implementation contract before editing canon. No global consistency proof or live behavior verification is claimed.
"""
(OUT / "summary.md").write_text(summary)
print(json.dumps({"primary_entries": len(ledger), "dispositions": counts, "findings": len(findings), "priorities": priorities, "ledger_batches": len(ledger_files), "finding_batches": len(finding_files), "largest_json_batch_bytes": max(item["bytes"] for item in ledger_files + finding_files), "source_bytes_read": coverage["unique_source_bytes"], "elapsed_seconds": coverage["measured_interval_elapsed_seconds"]}, indent=2))
