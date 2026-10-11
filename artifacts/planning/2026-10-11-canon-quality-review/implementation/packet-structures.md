# Drafting packet: structures

Source revision: e70b44778f71d9d699f746f78a16b892531c82d3

## Owned source entries

Review address: AP-01

### AP-01. no-inline-content

"Let me just inline that"

Content is embedded in a parent file instead of living in its own file.

**Detect:** An activity, technique, or resource body is inlined into a parent YAML/markdown file (or a new construct is authored inline rather than as a sibling file).

**Do not flag:** Short inline literals that the schema requires on the parent (e.g. a one-line `description:` field); hyperlinks to separate files.

**Fix:** Extract into its own file under the correct directory; replace the inline body with a reference/bind the schema expects. See [Modular Over Inline](./design-principles.md#22-modular-over-inline).

Review address: AP-02

### AP-02. schema-is-constraint

"Let me adjust the schema to match"

The schema is bent to fit content instead of content being fixed to the schema.

**Detect:** A change proposes altering workflow/activity/technique schema (or inventing fields) so existing content validates.

**Do not flag:** Legitimate schema evolution requested explicitly by the user as a separate task.

**Fix:** Rewrite the content to conform to the current schema.

Review address: AP-03

### AP-03. no-partial-implementation

"I'll fix the rest later"

Scope is left partially implemented before commit or close-out.

**Detect:** A commit, handoff, or "done" claim leaves items in the scope manifest unaddressed or explicitly deferred without user approval.

**Do not flag:** An explicitly scoped partial deliverable the user approved (remaining items stay open in the manifest).

**Fix:** Complete every scope-manifest item, or get approval to shrink scope and update the manifest before committing.

Review address: AP-04

### AP-04. no-invented-naming

"I'll name it [new_thing]"

A new naming convention is invented without search and user approval.

**Detect:** A new id, filename pattern, rule slug, or vocabulary term is introduced without checking existing conventions and without user approval.

**Do not flag:** Reuse of an already-established convention found in-repo or in this catalogue.

**Fix:** Search for an existing name/pattern; if none fits, propose the new convention and get approval before adopting it.

Review address: AP-05

### AP-05. atomic-checkpoints

"Skip/combine these checkpoints"

Multiple independent decisions are collapsed into one checkpoint.

**Detect:** Two or more distinct user decisions are packed into a single checkpoint (or one checkpoint is skipped by bundling its decision into another).

**Do not flag:** A single decision whose options naturally cover one atomic choice (`one-decision-one-checkpoint`).

**Fix:** Restore one checkpoint per atomic decision; split combined options into separate gates.

Review address: AP-06

### AP-06. no-assumption-execution

"The user probably means..."

Execution proceeds on assumed intent instead of asking when uncertain.

**Detect:** The agent chooses among materially different interpretations of user intent without asking, then executes.

**Do not flag:** Unambiguous instructions; routine defaults the user already established in-session.

**Fix:** Ask a single clarifying question (`one-question-per-message`) before acting on the ambiguous point.

Review address: AP-07

### AP-07. scope-reverify-completion

"Done!"

Completion is claimed without re-checking every item in the scope manifest.

**Detect:** A done/complete claim, commit, or close-out proceeds without verifying each scope-manifest item is addressed.

**Do not flag:** An interim status update that does not claim completion.

**Fix:** Walk the scope manifest item-by-item and resolve gaps before claiming done.

Review address: AP-08

### AP-08. one-question-per-message

"Here are three questions..."

More than one question is asked in a single user-facing message.

**Detect:** A user-facing message contains two or more distinct questions (or stacked prompts that each require an answer).

**Do not flag:** A single question with clarifying context that is not itself a second question; option lists on one checkpoint.

**Fix:** Ask one question per message; wait for the answer before the next.

Review address: AP-09

### AP-09. checkpoint-not-prose

"Ask the user whether to proceed"

A user decision is written as prose instead of a `kind: checkpoint` step.

**Detect:** Step/activity description (or protocol prose) tells the agent to ask/confirm/choose without a `kind: checkpoint` at that `steps[]` position.

**Do not flag:** Non-blocking informational messages (`action: message`) with no decision; decisions already modeled as checkpoints.

**Fix:** Add a `kind: checkpoint` with `message`, `options`, and `effects` at the decision point in `steps[]`.

Review address: AP-10

### AP-10. loop-not-prose

"Repeat this for each item" / "keep revising until it passes"

Iteration is written as prose instead of a `kind: loop` step.

**Detect:** Description or protocol says to repeat work with no `kind: loop` at that `steps[]` position. Two shapes: walking a collection the session carries between steps, whose declared form is `loopType: forEach` with `over` and `variable`; and repeating until a stated condition clears, whose declared form is `loopType: while` or `doWhile` with `continueWhile`. In both the repeated work is the loop's nested `steps[]`.

**Do not flag:** A one-shot step. A loop already declared in `steps[]`. Per-item work inside a technique `## Protocol`, where the technique is applied once and the phase states what one application does to each entry of its declared input. A protocol phase that refines its own output until it settles.

**Fix:** Replace the prose with a `kind: loop` step and move repeated work into the loop body.

Review address: AP-11

### AP-11. decision-not-prose

"If X then do A, otherwise B"

Cross-activity routing is written as prose instead of an activity-level `decision`.

**Detect:** Prose describes branching to different activities/paths without an activity-level `decision` with `branches`/`conditions`.

**Do not flag:** In-step `when`/`condition` on steps; checkpoints that set variables consumed by declared exit predicates.

**Fix:** Declare an activity-level `decision` with branches/conditions; remove the prose branch recipe.

Review address: AP-12

### AP-12. artifact-not-buried

"This produces a report"

Artifact production is buried in description instead of declared on technique Outputs.

**Detect:** A technique/activity claims to produce a file/report only in `description` (or similar prose) without a `#### artifact` on the producing technique's `## Outputs`.

**Do not flag:** Non-artifact outputs (variables, structured data) correctly declared as non-artifact outputs.

**Fix:** Declare `#### artifact` on the producing technique's Outputs (`no-hand-authored-artifacts`).

Review address: AP-13

### AP-13. variable-for-approval

"Track whether the user approved"

Approval or mode-like state is tracked in prose instead of a typed variable.

**Detect:** Prose instructs remembering/tracking approval or similar state without a `variable` wired through checkpoint `effects`.

**Do not flag:** Ephemeral in-message acknowledgements that do not gate later steps.

**Fix:** Add a `variable` with `type`/`defaultValue` and set it from checkpoint effects; gate later steps on it.

Review address: AP-14

### AP-14. mode-as-state

"In fast mode, skip the research steps"

Mode behaviour is written as rule/description text instead of ordinary state.

**Detect:** Mode-specific skip/branch behaviour appears only as rules or prose rather than a mode state variable (enum or boolean) plus `when` / `exits[].when`. Parallel boolean projections of an enum mode are `no-derived-state-shadow`.

**Do not flag:** One-off `when` conditions unrelated to a named mode.

**Fix:** Detect/set one authoritative mode variable early; express skips/branches as conditions on that state.

Review address: AP-15

### AP-15. procedure-in-protocol

"First load the workflow, then get the activity"

HOW lives in the step description instead of the technique protocol.

**Detect:** A step `description` holds the procedure — numbered audit criteria, a sequenced procedure, or per-item iteration logic (`numbered-protocol-phases`).

**Do not flag:** Once a step BINDS a technique, absence of description is correct — `bound-step-no-description` requires removing `description` entirely (not merely de-proceduralizing) and homing content in the bound op.

**Fix:** Move imperative bullets into the technique protocol; leave a one-line WHAT in unbound `description`, or delete `description` entirely when the step is bound (`bound-step-no-description`).

Review address: AP-16

### AP-16. technique-inputs-declared

"This technique needs a file path"

Required inputs are named in description instead of `inputs[]`.

**Detect:** Technique prose names a needed value (path, id, artifact) that is not declared in `inputs[]` with `id`/`description`.

**Do not flag:** Inputs already declared; pure outputs or locals. Produced values missing from Outputs are `technique-outputs-declared`.

**Fix:** Declare the input on `inputs[]` and reference `{id}` in Protocol.

Review address: AP-17

### AP-17. bound-step-no-description

"`kind: technique` / `description` / `name` on a bound step"

A bound step still carries description/name prose.

**Detect:** A `kind: technique` or `kind: action` step that binds a technique still carries `description` or `name`. A bound step allows `kind`, `id`, `technique` (a string or `{ name, inputs, outputs }`), and structural `actions`, `when`, `condition`, or `required: false`. Unbound procedure in a description is `procedure-in-protocol`.

**Do not flag:** `kind: loop` may have `name`, loop fields, and nested `steps[]`. `kind: checkpoint` uses inline `message` and `options` and a stable `id`. A checkpoint or a loop is inline in `steps[]`, never `step.checkpoint` or a separate `checkpoints[]` or `loops[]` array.

**Fix:** Bind an existing technique when one fits and delete the description; otherwise enrich that technique's `## Capability` or `## Protocol` and strip the step prose. A one-line non-procedural summary is removed from the step too. N steps that differ only by description are `no-monolith-masking-steps`.

Review address: AP-18

### AP-18. no-monolith-masking-steps

"N steps bind one technique and differ only by `description`"

Multiple steps bind the same op and differ only by description.

**Detect:** Several steps bind the same technique and differ only by `description` (or equivalent prose), with no distinguishing `when` / `actions` / input-output deviation.

**Do not flag:** Distinct structural attach points already expressed (checkpoint/`when` between phases); mutually exclusive `when` branches; distinct-purpose invocations at different pipeline points — see also `no-duplicate-technique-steps`.

**Fix:** (1) **Reuse** — bind an existing op and delete descriptions. (2) **Collapse** — consecutive same-technique steps with no intervening checkpoint and no structural deviation → one step. (3) **Split** — distinct phases → group with one op per phase; bind `technique: <group>::<op>`; delete descriptions. New techniques are last resort. Field purity on each resulting step is `bound-step-no-description`.

Review address: AP-19

### AP-19. no-rule-protocol-restatement

"The rule restates the protocol" / "a rule instructing work that no Protocol phase states"

A rule carries procedure — copied from a protocol phase, or work no phase states yet.

**Detect:** A technique, activity, or workflow rule restates a protocol bullet or phase without an invariant the steps do not already convey, or instructs work rather than constraining it. Test: the sentence could stand as a numbered Protocol phase unaltered. A prohibition is a constraint, and so is an invariant on a result. An imperative that names a step's work is not, including when no phase states that work yet.

**Do not flag:** A cross-cutting constraint the protocol does not encode, including a positively framed invariant on an outcome (`every finding carries evidence`). A prohibition citing the home that owns the behaviour it forbids.

**Fix:** Delete the rule where a phase already carries the work. Where the work is genuinely unstated, move it into `## Protocol` as a phase rather than leaving it in Rules — protocol is the procedural source either way. Keep any residual invariant the phases cannot express.

Review address: AP-20

### AP-20. rule-group-disambiguation

"Explain why / Avoid attribution"

Apparently contradictory rules lack a disambiguating group key.

**Detect:** Two rules read as conflicting when co-listed, and they are not separated by grouped rule keys that supply context.

**Do not flag:** Rules that are truly contradictory (`no-contradictory-rules`); already-grouped arrays with clear keys.

**Fix:** Place each rule under a descriptive group key that supplies the missing context (e.g. `code-commentary` vs `attribution-prohibition`).

Review address: AP-21

### AP-21. grouped-rule-keys

"code-foo, code-bar, code-baz"

Shared-prefix rules sprawl as flat keys instead of a grouped array.

**Detect:** Multiple rules share a naming prefix (or obvious family) but remain flat strings/keys instead of a grouped array under one descriptive key.

**Do not flag:** Unrelated rules; a single rule with no family.

**Fix:** Collapse into a grouped array under a key that replaces the prefix; use the schema's string|array rule union.

Review address: AP-22

### AP-22. single-rule-authority

"This rule appears in the technique AND the activity AND the workflow" / "two entries in one `## Rules` block, bridged by `(same stance as …)`"

The same rule has more than one home — across levels, or twice within one rules block.

**Detect:** One invariant, two homes. Across levels: the same orchestrator-only rule (variable management, routing, commit policy, mode handling), or a rule that does not need worker reach, appears at workflow, activity, and technique. Within one rules block: two entries whose trigger and consequence coincide, so applying either yields the same behaviour and neither can be edited alone. The tell is a bridge — `(same stance as X)`, `as X already says`, `mirrors X` — a cross-reference that reconciles two homes.

**Do not flag:** Worker-directed behavioural rules that must stay reachable on activity/technique surfaces — see `worker-rule-reach`.

**Fix:** Keep one authoritative home at the level where the rule is enforced; delete the duplicates. Within a block, keep the statement with the wider consumer set, fold in any rationale or extra tier the other carried, drop the bridge, and repoint every citation of the deleted entry.

Review address: AP-23

### AP-23. worker-rule-reach

"prefer gitnexus over grep" lifted to `workflow.yaml` / duplicated across techniques for worker visibility

A worker-directed rule is mis-placed where workers never receive it.

**Detect:** A behavioural rule workers must read is present only under `rules.workflow` (workers never receive `workflow.yaml`), or an audit flags per-technique copies of a worker-directed rule as hygiene violations.

**Do not flag:** An orchestrator-only rule (`single-rule-authority`). Placement by audience is `rule-audience-bucket`.

**Fix:** Keep a worker-directed rule on the activity or the technique. A copy on each technique that must reach the worker is that reach. Consolidate only into a shared technique that every affected activity loads.

Review address: AP-24

### AP-24. no-contradictory-rules

"status-proposed" AND "status-accepted-directly"

Sibling rules in the same technique contradict each other.

**Detect:** Two rules in the same technique (or same rules bucket) prescribe mutually exclusive behaviours.

**Do not flag:** Rules disambiguated by group keys for different contexts (`rule-group-disambiguation`).

**Fix:** Identify the stale rule and remove or rewrite it so the set is logically consistent.

Review address: AP-25

### AP-25. no-one-step-rules

"persist-output" rule on a technique with a "write-artifact" step

A technique rule applies to only one protocol step.

**Detect:** A `## Rules` entry constrains a single protocol step/phase rather than a cross-cutting invariant.

**Do not flag:** Cross-cutting rules that span multiple phases; step-local caveats already filed as `>` notes (`constraint-as-blockquote`).

**Fix:** Move the guidance into that step's protocol prose (or a `>` caveat) and delete the rule.

Review address: AP-26

### AP-26. no-rationale-in-description

"Let me explain why this is here"

Description fields carry rationale, process narration, or structural restatement.

**Detect:** A `description`, `message`, option or action description, procedure bullet, technique `## Rules` entry, or `rules.*` string explains why a construct exists, what consumes it, or whose remit it falls under, compares it to a prior implementation, or restates a fact adjacent structure already encodes (`steps[]` order, `when`, effects, exits, the workflow graph, a default). Test: delete the clause; if the prohibition or invariant still says what is constrained, the clause was rationale.

**Do not flag:** A one-line summary of what the construct does. A structural field itself. A prohibition citing the home that owns the behaviour it forbids (`no-rule-protocol-restatement`). A rule whose subject is the boundary between actors.

**Fix:** Delete the rationale, narration, or restatement. Keep a clause whose deletion would lose a fact. Where a reader needs another actor's contract, link that contract's home. Put rationale in a commit, an ADR, or a planning doc.

Review address: AP-27

### AP-27. validate-message-economy

"Without X, Y will happen"

A validate message justifies consequences instead of stating cause + fix only.

**Detect:** A validate-action message includes trailing consequence essays after the failure cause and fix command.

**Do not flag:** Messages that are exactly `<what's wrong>. Run '<command>'.` (or equivalent minimal cause + fix).

**Fix:** Strip the consequence paragraphs.

Review address: AP-28

### AP-28. no-sequence-in-description

"Workflow X first does A, then B, then C"

Activity/step sequence is restated in description prose.

**Detect:** `description:` on workflow/activity/technique enumerates the sequence of activities, phases, modes, or steps already canonical in `activities[]`/`graph`/`steps[]` (or the on-disk layout).

**Do not flag:** Purpose/value orientation that does not enumerate sequence; README orientation under `readme-orients-not-transcribes`.

**Fix:** Remove the sequence prose from `description`.

Review address: AP-29

### AP-29. no-user-env-mutation

"Run 'git config --global ...'"

Workflow prose directs mutation of user-owned environment state.

**Detect:** Descriptions, validate messages, procedure bullets, or options direct the user or agent to mutate user-owned environment state outside the working tree (e.g. global git/gh/gpg config, package installs).

**Do not flag:** Diagnostics that report misconfiguration without directing the mutating fix; in-repo file edits.

**Fix:** Surface the diagnostic only; leave the fix scope to the user. Declare the boundary in workflow rules if needed.

Review address: AP-30

### AP-30. role-rules-not-description

"The orchestrator coordinates only"

Role/behaviour constraints sit in description instead of rules.

**Detect:** Description (including variable descriptions) prescribes orchestrator/worker/sub-agent behaviour ("MUST", "coordinates only", "do not call") rather than saying what the construct is.

**Do not flag:** WHAT summaries with no role prescription; equivalent constraints already in `rules:` (drop the description duplicate).

**Fix:** Move the role constraint into `rules:` on the owning construct, or drop it when that rule is already there.

Review address: AP-31

### AP-31. no-hand-authored-artifacts

"`artifacts: - id: evaluation-report / name: EVALUATION-REPORT.md / location: evaluation`"

Activity artifacts[] is hand-authored instead of synthesized from techniques.

**Detect:** Activity YAML declares `artifacts[]`. The server synthesizes that contract from the bound techniques' `## Outputs` — `#### artifact` filenames and activity-group shorthand.

**Do not flag:** Non-file side effects (commit, PR) — not artifacts; simply not declared.

**Fix:** Delete the activity `artifacts[]` block. If a produced file is missing from the synthesized contract, add `#### artifact` (bare filename, `{token}` template, or discriminator-keyed note per `artifact-name-in-io`) on the producing technique's `## Outputs` — never back onto the activity.

Review address: AP-32

### AP-32. outcome-names-value

"`EVALUATION-REPORT.md written with per-dimension findings…`" / "`Output directory created`" / "`dimension_plan … populated`"

An outcome names the vessel (file/variable) instead of delivered value.

**Detect:** An outcome names the act of writing a file, re-lists that file's contents, or says a variable was populated or set. Test: the outcome still reads true if the file or variable is renamed.

**Do not flag:** A mechanical name used only in service of the value it carries.

**Fix:** Rewrite the outcome as the value delivered. Delete or fold an outcome whose only content is that a directory was created or a variable was populated.

Review address: AP-33

### AP-33. no-set-of-technique-output

"`technique: …` + `set` of the technique's own product"

An activity set duplicates a bound technique's output.

**Detect:** A step has `technique` and a `set` whose `target` is a value the bound technique computes (an assessment, a classification, a derived structure, an artifact path). That output already lands via `variable-binding`.

**Do not flag:** (a) cross-iteration accumulator / scatter-gather gather over a `forEach`; (b) caller-specific derivation from a generic tool-wrapper op (keep on activity — `io-agnostic-contract`); (c) value-BEARING `set` on a pure control step recording orchestration/flow state. Value-LESS procedural control sets — see `no-valueless-control-set`.

**Fix:** Declare `### <target>` on the bound technique's `## Outputs` (same id), fold the `set` description into `## Protocol`, delete the activity `set`.

Review address: AP-34

### AP-34. no-valueless-control-set

"control step `set` with `target` + `description`, no `value:`"

Control sets carry no derived value.

**Detect:** A control step (no `technique`) has value-LESS `set`s (`target` + `description`, no `value:`) whose descriptions carry sourcing/derivation HOW for a domain payload.

**Do not flag:** Value-BEARING control `set`s for orchestration/flow state; bound-step `set` of technique product (`no-set-of-technique-output`).

**Fix:** Bind a technique whose outputs/protocol own the derivation; delete the value-LESS activity sets.

Review address: AP-35

### AP-35. no-intra-step-input-set

"`commit_message: "docs({target_name}): …"` + same-step `set` of `target_name`"

A step set feeds that same step's own inputs.

**Detect:** A bound step's `technique.inputs` interpolates a variable that the same step's `set` writes. Inputs resolve at invocation; a `set` is a side-effect with no before-input contract. The output-side counterpart is `no-set-of-technique-output`.

**Do not flag:** A `set` whose `target` is NOT interpolated by that step's `technique.inputs` — scatter-gather gather (`no-set-of-technique-output` excl. a), value for a later step, or pure control-step orchestration.

**Fix:** Hoist the derivation to where its source is first established (or declare it as an earlier producing technique's output per `no-set-of-technique-output`); delete the `set` from the consuming step, leaving a pure binding.

Review address: AP-36

### AP-36. techniques-list-disjoint

"`techniques: - workflow-engine::list-workflows …` with matching `step.technique`"

Activity techniques[] overlaps step technique binds.

**Detect:** An entry in activity-level `techniques[]` is also bound by a step, top-level or inside a loop, via `step.technique`. Activity `techniques[]` holds a cross-cutting strategy (`variable-binding`, `scatter-gather`), not a per-step technique.

**Do not flag:** A strategy technique listed at activity level that no step binds.

**Fix:** Remove every overlapping entry from activity `techniques[]`; keep only cross-cutting strategies; delete the block if none remain.

Review address: AP-37

### AP-37. rule-audience-bucket

"`rules: workflow: - \"WORKER PERMISSIONS: Workers MUST write all artifacts directly …\"`"

A rule sits in the wrong rules.* audience bucket.

**Detect:** Classify each rule by who must act: orchestrator (`get_workflow` only), worker (`get_activity` inject), or both identically. Flag worker directives (write-immediately, no-permission-questions, blocker-surfacing, artifact-verification, lens-loading-by-worker) under `rules.workflow`. Flag orchestration directives (dispatch isolation, output forwarding, checkpoint cadence, orchestrator handoff) under `rules.activity`.

**Do not flag:** Orchestrator directives in `rules.workflow`, worker directives in `rules.activity`, and the same directive for both in `rules.universal`. A rule that describes the other actor's mechanics (`instruction-narrates-an-actor`). Moving a mis-filed rule does not strike a narrating clause.

**Fix:** Move to the bucket for the actor commanded. If one prose rule commands the two actors differently, split into two rules (orchestrator handoff vs worker load).

Review address: AP-38

### AP-38. no-duplicate-technique-steps

"`steps: - id: map-findings / technique: compare-finding-sets …` (×N)"

N steps bind one technique without structural reason to split.

**Detect:** Two or more steps in one activity bind the same technique. (a) Redundant re-execution — they differ only by which already-produced output to surface — collapses to one step. (b) Unrolled iteration — the same technique on N collection items — is one `forEach` with one binding. (c) Monolith-masking — distinguished only by a sub-mode input — splits into a group with one named technique per mode (`no-monolith-masking-steps`).

**Do not flag:** A fixed roster of distinct static targets with different structured inputs. Mutually exclusive `when` branches. Distinct-purpose invocations at different pipeline points. The same technique as distinct phases inside one loop iteration.

**Fix:** Collapse, loop, or split per that classification.

Review address: AP-39

### AP-39. hoist-universal-techniques

"every activity carries `techniques: - variable-binding`"

A universal technique is not hoisted to workflow.techniques.activity.

**Detect:** A strategy technique appears on nearly every activity's `techniques[]`. `techniques.workflow` reaches the orchestrator (`get_workflow`). `techniques.activity` is inherited by every activity (`get_activity`). There is no `universal` bucket for techniques. A technique only some activities use stays on those activities. A step-binding duplicate is `techniques-list-disjoint`.

**Do not flag:** Activity-specific strategy techniques used by only some activities.

**Fix:** Declare once under `workflow.techniques.activity`; delete from every activity `techniques[]`; drop emptied activity blocks.

Review address: AP-40

### AP-40. readme-orients-not-transcribes

"README `### NN. Activity` + `Steps:**` / checkpoints table / routing / `## Variables` / `## Rules` / estimated times" / "The workflow includes 27 resources… Each resource lives as `resources/<id>.md`"

README transcribes YAML structure, inventory counts, or loader packaging instead of orienting.

**Detect:** A README enumerates, in prose or tables, activity `steps[]` (including inline checkpoint options, `effect`, `autoAdvanceMs`, and loops), `exits[]` or the graph, per-step technique bindings, workflow `variables`, `rules`, or per-activity estimated times. Also flag an inventory count ("N resources") or loader path HOW (`resources/<id>.md`, "loaded by resource id", "sole load key"). Test: the block must be edited when those YAML fields or folder contents change.

**Do not flag:** A Mermaid or ASCII flow diagram. Orientation the YAML lacks: purpose, an at-a-glance activity sequence (name, one-line role, connections), outcomes, a file-structure overview without counts, a techniques overview, links to the YAML, a purpose sentence plus an index table of ids. A third checklist of which passes run (`bind-site-is-orchestration-truth`).

**Fix:** Delete the enumerations of steps, checkpoints, loops, exits, the graph, bindings, Variables, Rules, estimated times, inventory counts, and loader HOW. Keep diagrams and purpose orientation. See [Complete Documentation Structure](./design-principles.md#11-complete-documentation-structure).

Review address: AP-41

### AP-41. avoidance-voice-in-definitions

"`Does not use inline content`" / "`Rather than X, the workflow now…`" / "`Never skip the checkpoint`"

Definition prose uses avoidance or comparative voice.

**Detect:** In workflow/activity/technique/resource *definition* prose (`description`, `outcome`, option/action descriptions, README orientation for the defined workflow — not planning artifacts), a passage states what the system avoids or how it differs from a prior/alternative design. Comparative/avoidance framing that must be edited when the "old way" is forgotten is the signal — not every English negation.

**Do not flag:** Planning artifacts under `artifacts/planning/` (evolution by design); true runtime constraints in `rules.*` / technique `## Rules` ("must not write secrets"); schema/condition operators; negative examples inside this catalogue; `validate` messages that name a misconfiguration and fix command (`validate-message-economy`).

**Fix:** Rewrite to current behaviour. See [Document in Positive Present](./design-principles.md#17-document-in-positive-present).

Review address: AP-42

### AP-42. io-agnostic-contract

"`fix_strategy` from [analyze-failure]"

An I/O id or description names a specific caller.

**Detect:** An input/output entry names or links a workflow-internal producer/consumer — another technique ("from [analyze-failure]", "produced by build-function-registry"), activity ("from the elicitation activity"), step, checkpoint, loop, or workflow/activity file. Describe what the value IS (meaning, shape, allowed values), never its position in a particular workflow.

**Do not flag:** Protocol/Capability utilisation ("use technique X", "go through cargo::fmt-fix"); intrinsic/external origin ("git diff output", "the user's request", "provided by the server"); I/O links to a resource/template section (shape of the value).

**Fix:** Rewrite the entry generically; drop workflow-internal source/destination naming. See [An I/O Contract Names the Value](./design-principles.md#37-an-io-contract-names-the-value).

Review address: AP-43

### AP-43. canonical-artifact-ids

"Read all open assumptions from `assumptions-log.md`"

Protocol cites a filename/path instead of a canonical I/O id.

**Detect:** Protocol references data via literal artifact filename/path, or I/O ids are path-flavored proxies (`assumptions-log-path` vs `assumptions-log`).

**Do not flag:** Filename literals correctly placed on `#### artifact` declarations (`artifact-name-in-io`); hyperlinked template nouns to resource sections.

**Fix:** Rename to canonical ids; cite `{id}` in Protocol; hyperlink artifact nouns to template sections without tool recipes (`no-tool-usage-prescription`).

Review address: AP-44

### AP-44. artifact-name-in-io

"Create `NN-{package}-plan.md`"

A filename lives in Protocol instead of the I/O declaration.

**Detect:** Protocol prose names a concrete artifact filename, a literal or an ad-hoc path, instead of a canonical Input or Output id. A name selected by a mode is one literal per technique (`artifact-name-is-filename`).

**Do not flag:** Protocol references that already use `{canonical_id}` only. Opaque multi-file path arrays — see `no-opaque-artifact-path-array`.

**Fix:** Move the filename (literal or token-template) into the I/O declaration; reference identifiers only in Protocol.

Review address: AP-45

### AP-45. no-opaque-artifact-path-array

"`all-artifact-paths` / `*-paths` input holding many files"

An opaque path array stands in for named artifact inputs.

**Detect:** A technique consumes several artifacts via a single opaque `*-paths` (or similar) array that forces Protocol to name the files.

**Do not flag:** A single artifact with a literal or token-template name on one Input (`artifact-name-in-io`).

**Fix:** Split into individually named Inputs with canonical ids; Protocol references those ids only.

Review address: AP-46

### AP-46. no-resource-caller-backlink

"Composed by [generate-summary]" / "activities bind [analyse-challenge]… via [interview]" / "live on the producing technique: [research]" / "Outputs: the Manual Diff Review section written into `code-review.md`"

A resource backlinks its callers, names where its content lands, or narrates host orchestration.

**Detect:** A resource other than an engine or conduct prompt names a host caller, a destination, or bind/gate topology. Caller: "produced by", "live on", "Composed by", "Used by", a role-to-file table, a technique or activity path as a link target, a bare host id under Enforcement, "gated by", or "bound by". Destination: an `Outputs:` header, or prose placing the content in a named file ("written into", "a section of"). Orchestration: "activities bind", an `analyse:` or `::` recipe, a residual gate (`{has_open_assumptions}`, `{has_open_questions}`), "via [interview]", checkpoint or batch routing. Test: deleting the passage leaves a usable template, vocabulary, or guide, and the deleted text named who binds, produces, or gates the resource, or where its output goes.

**Do not flag:** A meta, bootstrap, agent-conduct, or workflow-engine prompt whose domain is telling the reader to run engine techniques. A sibling resource citation or a catalog entry name. One "see also" to a format rule the filler applies (line breaks, a canonical-home map). Ontology with no host ids (Goal → Activity → Technique). A creation guide naming the artifact it is the guide for (`no-template-creation-guide`), and filenames inside a Template body. Heading level as shape (`an ##-level section`).

**Fix:** State what the resource is. Drop the caller, Enforcement, and bind essays. Move role-to-file and orchestration into the owning activity or technique Protocol. See [Resources Stay Abstract](./design-principles.md#30-resources-stay-abstract).

Review address: AP-47

### AP-47. no-redundant-link-label

`deep_scan ([deep-scan](link))`

A hyperlink repeats the plain-text word immediately before it.

**Detect:** A pattern `word ([link-text](url))` where `word` and `link-text` are the same name (modulo case/hyphen/underscore).

**Do not flag:** Preceding words that name a distinct role (`structural ([l12](link))`).

**Fix:** Collapse to a single `[link-text](url)` hyperlink.

Review address: AP-48

### AP-48. brace-output-references

"Structure the output"

Protocol refers to "the output" without naming which output id.

**Detect:** Protocol uses vague nouns ("the output", "the result", "the artifact", "the analysis") instead of `{output_id}` or `{output_id}.field`.

**Do not flag:** References that already cite canonical output ids; non-output prose.

**Fix:** Substitute the declared output id (and sub-field when needed) for every vague reference.

Review address: AP-49

### AP-49. no-delivery-mechanism-narration

"Resources are attached to technique responses (loaded via get_technique)"

Prose narrates delivery mechanism instead of the imperative + link.

**Detect:** Protocol explains how the server delivers the technique, resources, or bundle — "Resources are attached to technique responses", "available in `_resources`", "loaded via `get_technique`", "in the technique response", "worker self-bootstraps via `get_activity`".

**Do not flag:** workflow-engine techniques whose domain IS tool/delivery behaviour.

**Fix:** Delete mechanism narration; keep the imperative action and the canonical resource/technique hyperlink ("Load the lens prompt for `{declared_id}`"). Tool-call recipes ("via `get_resource`", param shapes) are `no-tool-usage-prescription`.

Review address: AP-50

### AP-50. no-tool-usage-prescription

"Load [anti-patterns] via `get_resource`" / "call `get_technique { session_index, step_id }`"

Prose prescribes a harness/MCP tool-call recipe.

**Detect:** Capability, Protocol, Rules, or non-engine resource prose prescribes how to invoke a harness or MCP tool — a call name with "via", "call", or "after", an argument shape, or a sequence of session tools (`get_resource`, `get_technique`, `get_activity`, `get_workflow`, `start_session`, `next_activity`, `list_workflows`).

**Do not flag:** A `meta` workflow-engine, harness-compat, conduct, bootstrap, or agent-entry technique ([activity-worker](/meta/techniques/workflow-engine/activity-worker.md), [workflow-orchestrator](/meta/techniques/workflow-engine/workflow-orchestrator.md), [compose-prompt](/meta/techniques/workflow-engine/compose-prompt.md)) whose domain is the calls its reader makes (`engine-internals-narrated`). A technique that wraps a raw tool and names that tool (`canonical-technique-reference`). A markdown or `::` hyperlink that names what to consult, with no tool recipe.

**Fix:** Delete the tool recipe. Keep the imperative and the canonical hyperlink or `{id}`. A role boundary stays role prose ("workers source definitions from orchestrator-provided context"), not "do not call `get_workflow`".

Review address: AP-51

### AP-51. canonical-technique-reference

"Use `gitnexus_context` on the symbol"

A raw harness tool name is used where a wrapping op exists.

**Detect:** Protocol names a raw harness or MCP tool for a capability that another technique wraps. The canonical form is `[op](path)` or `[group](path)::[op](path)`, which the server resolves to `::`. A stale or inconsistent name is `consistent-tool-names`.

**Do not flag:** The technique that wraps the primitive — naming the raw tool IS that technique's purpose. A remedy step whose wrapping op is a sibling of the technique holding it, which the step must perform unaided (`unreachable-operation-reference`).

**Fix:** Replace the raw tool name with the canonical hyperlinked wrapping op; preserve arguments.

Review address: AP-52

### AP-52. brace-declared-ids

"Examine target_path" / "for synthesis pass (index 23)" / "`repo_root`" / "`<files>`"

A declared id is used unbraced where a designator is required.

**Detect:** (a) bare declared id as plain words; (b) orphan enum/index value not tied to its input ("index 23"); (c) disguised id in backticks or `<angles>` without braces. Spelling must match the declared id exactly (`### problem_statement` → `{problem_statement}`). Forms: `{input_id}` / `{output_id}` / `{output_id}.field` / `{$local}`.

**Do not flag:** Ordinary English that only coincides with an id; backticked literals that are not declared ids (shell commands, filenames, tool params).

**Fix:** Brace as `{declared_id}`. For an orphan value write "when `{declared_id}` is 23". Replace a disguise wrapper with braces.

Review address: AP-53

### AP-53. dotted-rule-address

"per the gitnexus index-freshness rule"

A rule is cited in prose instead of its dotted symbol address.

**Detect:** A Protocol step cites a rule as prose ("per the X rule"), with `::`, or as a hyperlink to the rule's heading. Also flag a citation of a rule declared nowhere. Also flag an address shorter than the rules that arrive with the citer: its own, every container it sits beneath, and the contracts of the scopes its role's bundle names. A bare slug declared only outside that set names nothing delivered. Roles are not readable from the tree, so a static walk proves the library: inside one library a rule may arrive by a route the walk cannot see, and from another library it never does. Checking link spelling alone settles neither length.

**Do not flag:** A dotted address at the length the citer already holds. Inherited from self, group, or namespace root: the bare name. Outside that ancestry: `<owner>.<rule-name>`, the container named by its folder (`gitnexus.index-freshness-first` for a namespace root). Carry the namespace only where two namespaces hold the same technique id. A hyperlink from a resource or a README. Test: a technique cites in dotted form.

**Fix:** Replace the prose, `::`, or heading link with the dotted address at that length. A dangling citation points at the inline content. `::` invokes; `.` names.

Review address: AP-54

### AP-54. anchored-protocol-references

"Apply design framework to structure the approach"

A protocol reference has no resolvable target.

**Detect:** A protocol phrase refers to a declared I/O, rule, technique, or resource and does not use that kind's resolvable form (`{id}`, a dotted rule symbol, a canonical `::` or hyperlink, or a resource hyperlink). Sibling form rules on the same walk are `brace-declared-ids`, `brace-output-references`, `canonical-artifact-ids`, `dotted-rule-address`, `canonical-technique-reference`, and `bind-protocol-locals`.

**Do not flag:** Domain prose that names no formal artifact. Anaphora for a noun already linked once in the same step. A reference to another technique, whose disposal is removal: `pass-orchestration-in-technique` where it invokes work, `unreachable-operation-reference` where it does not. Those two take precedence.

**Fix:** Anchor the reference with the matching form, or reword it. A reference with no target is dangling: fix the target or drop the reference.

Review address: AP-55

### AP-55. hoist-shared-inputs

"`### planning-folder` declared on every technique"

The same shared input is redeclared instead of hoisted.

**Detect:** The same input is re-declared on many techniques instead of once on the smallest common container (group or workflow-root `TECHNIQUE.md`). A path-flavored id (`planning-folder-path`) is the related shape; the canonical id is the noun the value is (`canonical-artifact-ids`). Also flag synonym drift for one concept across leaves.

**Do not flag:** An input shared by only two or three techniques whose common ancestor declares none of them. That carve-out counts leaves, so it never covers a leaf declaration beside an ancestor's (`inherited-input-re-declared`).

**Fix:** Hoist the shared input to the container under one canonical id, delete the per-technique declarations, and reference `{id}`. Hoist a genuinely workflow-wide contextual input (artifact location, target path) even when some leaves never reference it. A producer/consumer value still hoists: the shared input on the ancestor, and the producing technique also declares it as an output (`snake-case-symbols`). A hoist that leaves the leaf declarations in place is `inherited-input-re-declared`.

Review address: AP-56

### AP-56. paren-invocation-args

"`gitnexus::context {name: <symbol>}`" / "with target_dir in backticks beside a braced value"

Invocation argument names or lists use the wrong typographic namespace.

**Detect:** (a) A technique/technique invocation passes its argument list in braces (`::op {arg: value}`) instead of parentheses on the op reference. (b) A technique argument *name* appears bare or backticked (sharing the designator/code-token form) rather than italic. Test: the token names a parameter slot of the applied op, not a declared `{id}` value and not a literal path/command.

**Do not flag:** Brace objects that are not invocation arg lists (query/template/JSON payloads, raw tool-doc object shapes); italic emphasis that is ordinary English, not an op parameter name; correctly braced/backticked argument *values* (`backtick-code-tokens`, `brace-declared-ids`).

**Fix:** Align with [Distinguish Designators from Parameters](./design-principles.md#16-distinguish-designators-from-parameters).

Review address: AP-57

### AP-57. escape-literal-dollar

"costs \$0.05 per call" / "the \$schema field"

A literal \$ is unescaped in rendered prose.

**Detect:** Unescaped `$` in rendered prose, outside a fenced block or an inline code span — a price (`$0.05`), `$schema`, or a shell `${VAR}` shown in text. GFM treats `$…$` as inline math, so an unescaped `$` can mis-render. A protocol variable is already inside a code span (`backtick-code-tokens`).

**Do not flag:** `$` inside a fence or inline code span (`` `${{ github.event… }}` ``, `` `git -C {$component_git_dir}` ``) — escaping would corrupt the code.

**Fix:** Backslash-escape every literal `$` in rendered prose (`\$0.05`); leave code spans/fences untouched. Displayed output stays `$`.

Review address: AP-58

### AP-58. snake-case-symbols

"`check_status` output, `scope` input (case marks direction)" / "kebab symbol id that won't bind"

Symbol ids use the wrong case convention.

**Detect:** Symbol ids (inputs, outputs, sub-fields, `{$locals}`) in kebab/camel — they must be `snake_case` to bind to activity/condition/session state. Case used to encode input vs output direction. Rule/technique/resource/file/`::` targets wrongly snaked.

**Do not flag:** Tool/MCP/CLI param mirrors keeping the tool's exact spelling (`session_index`, `cloudId`). NAME class stays `kebab-case`: technique/technique/resource identities, hyperlink/`::` targets, and rule names (cited by dotted address, never evaluated). One snake symbol declared in both Inputs and Outputs when the value is input∩output (hoistable per `hoist-shared-inputs`).

**Fix:** Snake every symbol id. Keep a tool-parameter mirror. Keep kebab for a name or a rule.

Review address: AP-59

### AP-59. constraint-as-blockquote

"`  - If the PR has not merged, wait`" / "`Compose {status} = {…}. When passed is false, surface the offending entries.`"

A caveat qualifying one instruction sits outside the blockquote note that carries it.

**Detect:** A caveat on one instruction — a condition, a fallback, an error path, or a prohibition — is an indented sub-bullet (`  - …`) or a *when* / *if* / *otherwise* clause inside the step sentence. The step regex strips indent, so the sub-bullet becomes a peer step. Two clauses of one predicate (`when {passed} is false` beside `if the run emitted warnings`) read as two branches.

**Do not flag:** An ordered sub-action or a precedence ladder. An If / Else if / Otherwise ladder over one choice, at any indent. A constraint that spans steps (`structure-backed-constraints`, `no-rule-protocol-restatement`). A one-step rule filed as global (`local-rule-as-note`, `no-one-step-rules`).

**Fix:** Put the caveat in a `>` note under the instruction. One caveat is the note's prose (`  > If the PR has not merged, wait`); two or more are bullets (`  > - When …`). Two clauses of one predicate become one note. A line opening with `>` folds into the parent. See [Isolate Conditional Branches as Notes](./design-principles.md#31-isolate-conditional-branches-as-notes).

Review address: AP-60

### AP-60. local-rule-as-note

"`## Rules` entry that scopes to only one protocol block"

A local caveat is filed as a global-looking rule.

**Detect:** A `## Rules` entry applies to only one protocol block/step rather than spanning the technique.

**Do not flag:** A cross-cutting technique rule. A step-scoped caveat already under the instruction as `>` (`constraint-as-blockquote`). Guidance that belongs in protocol prose is `no-one-step-rules`.

**Fix:** Demote the entry to a `>` note under the block it qualifies; leave workflow-wide constraints in Rules.

Review address: AP-61

### AP-61. factor-repeated-paths

"`.engineering/artifacts/adr/` repeated four times"

A repeated path literal is not factored into a designator.

**Detect:** A filesystem path appears more than once in a technique (or across techniques) as a repeated literal, or a step hard-codes a path when a declared variable already exists.

**Do not flag:** Genuinely single-use literals; the one canonical literal at its definition site (input `#### default`, producer, or location rule); distinct values that merely look similar.

**Fix:** Factor repeated/shared paths into a defaulted input (or `{$local}` when derived); reference the designator; keep the literal only at its canonical definition. If the literal contradicts an existing location variable, correct the usage — do not mint a second path variable for the wrong location.

Review address: AP-62

### AP-62. bind-protocol-locals

"`git -C {$component_git_dir} …` with no bind" / "`Maintain {$resolution_counts}` never read"

A `{$local}` is dead or unbound at the consumer.

**Detect:** (a) An unbound local: a bare `{name}` that is not a declared I/O or an ambient activity input (`{target_path}`, `{branch_name}`) and has no `{$name}` bind in the protocol. (b) A dead binding: `{$name}` is never read as `{name}`. `{$name}` appears only at the producing step; reads are bare `{name}`, and the bind is textually before every read (`backtick-code-tokens`).

**Do not flag:** `{$name}` in each mutually exclusive producing branch. A `{name}` that is a declared I/O or an ambient activity input. If that one wore `$`, strip `$`.

**Fix:** (a) Name the value at the producer as `` `{$name}` ``. (b) Make the consumer read `{name}`, or drop a vestigial bind.

Review address: AP-63

### AP-63. backtick-code-tokens

"`set worktree_created = true`" / "run 'git -C …'" / "fetch concept-rag://…"

A code token appears bare without backticks.

**Detect:** A bare designator (`{id}`, `{$name}`, a dotted rule address), a CLI or shell command including a single-quoted command, an MCP tool call, a resource URI (`scheme://…`), or a literal path or filename, outside a code span and not a markdown or `::` link target.

**Do not flag:** A token already inside a code span or fence. A descriptive prose noun ("the planning folder"). A hyperlink or `::` target. An invocation argument name (`paren-invocation-args`). A fragmented span (`` `git -C` `{x}` ``) is this fault: one span. Backticks without braces still fail `brace-declared-ids`.

**Fix:** Wrap each bare code token in one backtick span, designators inside the same span as the surrounding command. Convert a single-quoted command. De-escape `{\$name}` to `` `{$name}` `` (`escape-literal-dollar`).

Review address: AP-64

### AP-64. boolean-id-shape

"`…_flag` / `not_ready` / ambiguous boolean nouns"

A boolean id is not an affirmative predicate.

**Detect:** Boolean symbol ids use a non-affirmative stem (`not_ready`, `no_merge`), a generic-noun burial (`…_flag`, `…_status`, `…_check`), or an ambiguous noun. Inverted meaning still fails when the id is prefixed.

**Do not flag:** Conformant unprefixed affirmatives; `is_`/`has_`/`can_`/`should_` only when the prefix sharpens an already-affirmative stem.

**Fix:** Rename to an affirmative predicate shape. See also [Name Symbols Affirmatively](./design-principles.md#19-name-symbols-affirmatively).

Review address: AP-65

### AP-65. collection-id-shape

"`assumption_list` / singular id holding a collection"

A collection/map id has the wrong noun shape.

**Detect:** Collection/map ids use `*_list`/`*_array`/`*_collection`/`*_set` suffixes, or a singular id holding an iterated collection. Collections: plural item noun (`tasks`, `failures`). Key-addressed maps: singular mapping name (`domain_to_range`).

**Do not flag:** Bare plural collection item-nouns (correct); `_mode`/`_type`/`kind` discriminators (suffix is the head).

**Fix:** Rename to plural item noun (collection) or singular mapping name (map).

Review address: AP-66

### AP-66. io-id-shape

"`summary` / `planning-folder-path` / direction-encoded I/O ids"

An I/O id encodes representation or direction.

**Detect:** I/O ids that are direction-encoded; representation proxies (`-path`/`-list`, see `canonical-artifact-ids` / `hoist-shared-inputs`); synonym drift for one concept; bare single-word generics (`summary`, `artifact`, `coverage`, `state`, `result`, `prompt`); Inputs/Output heading name collisions within one technique (except true input∩output pass-through).

**Do not flag:** External tool/schema field spellings; bare plural collection item-nouns (`collection-id-shape`); head-noun-last qualified phrases (`reconciled_assumptions`, `completion_summary`).

**Fix:** Rename; hoist one concept to one shared id (`hoist-shared-inputs`). See [Name Symbols Affirmatively](./design-principles.md#19-name-symbols-affirmatively).

Review address: AP-67

### AP-67. rule-slug-shape

"`do-not-review-unresolved` / process-narration rule slugs"

A rule slug is negation or narration instead of a positive invariant.

**Detect:** A rule slug is a bare negation, process narration, or a prohibited-state name when a positive invariant is at least as clear.

**Do not flag:** A clear intentional negation (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`). A kebab identity that is not a symbol id (`snake-case-symbols`).

**Fix:** Rename toward a positive invariant when that name is at least as clear. See [Name Symbols Affirmatively](./design-principles.md#19-name-symbols-affirmatively).

Review address: AP-68

### AP-68. technique-stage-agnostic

"return to the planning stage" / "at the validate activity" / "present the … checkpoint" / "after each task, before confirmation" / "flag every removal for explicit confirmation with a diff-style view"

A technique encodes workflow stage, graph position, or a decision gate it cannot own.

**Detect:** Technique Capability, Protocol, or Rules (a) mention a stage or activity (named, or "calling/consuming/producing activity"), a checkpoint, a loop or iteration, a transition or decision route, or a position in the activity flow ("after each task", "before user confirmation", "before the next step"), or (b) prescribe user confirmation, approval, or choice as if the technique owns that gate. Test: the sentence answers where or when in the workflow, which checkpoint surrounds the work, or how the user decides.

**Do not flag:** Purpose-phrased work with no orchestration locus ("final validation", "no separate commit step follows"); values the technique emits for the activity to route (counts, paths, severity, recommended option id); inventoring decisions *into* an artifact the activity will gate on; bare present/surface-to-user with no stage or gate named (`session-interaction-in-technique`).

**Fix:** Migrate user-facing decisions to activity `kind: checkpoint` steps gated on technique outputs; migrate other orchestration to activity exits, `when` gates and loops. Rewrite the technique to produce the durable evidence (artifact section, count, path) without naming the gate. See [Keep Orchestration in Structure](./design-principles.md#20-keep-orchestration-in-structure); also `no-activity-prose-rules`, `session-interaction-in-technique`.

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

## AE-01

**Confirmed · correction · P1**

Scope: [AP-69 · no-activity-prose-rules](sources/anti-patterns.md#ap-69-no-activity-prose-rules), [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [AP-37 · rule-audience-bucket](sources/anti-patterns.md#ap-37-rule-audience-bucket).

**Assessment.** Activity-file guidance is a permitted repair in one entry and always a violation in another. The technique/shared-delivery solution satisfies both objectives.

**Witness.** A worker-wide evidence constraint is placed on an activity binding several techniques. AP-23's Fix accepts that placement; AP-69 flags it even when it reaches the correct actor.

**Suggested wording.** Keep AP-69's structural-only activity policy. Replace AP-23's first Fix sentence with: 'Keep a worker-directed rule on the owning technique or on a container contract delivered to every affected technique.' Clarify in AP-37 that workflow rules.activity is an audience bucket, distinct from rules authored on an activity file.

**Observing check.** Positive: An activity-file behavioural rule moves to a delivered technique contract. Negative: A worker rule in workflow rules.activity is judged by its delivery bucket, without treating that field as activity-file prose.

Evidence addresses: AP-69 lines 904–906; AP-23 lines 348–348.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-04.json).

## AE-03

**Confirmed · correction · P1**

Scope: [AP-74 · no-duplicated-guidance](sources/anti-patterns.md#ap-74-no-duplicated-guidance), [AP-23 · worker-rule-reach](sources/anti-patterns.md#ap-23-worker-rule-reach), [DP-06 · One Authoritative Home](sources/design-principles.md#6-one-authoritative-home).

**Assessment.** Confirmed on the isolated-worker witness: flagging necessary copies is itself flagged by worker-rule-reach. Resolve the local audit prescription by proving delivery from one editable owner.

**Witness.** Two isolated workers each receive one non-meta leaf technique. Both must receive the same behavioural constraint; neither receives a common owning text. Repeated wording meets AP-74 Detect, while flagging these required copies meets AP-23 Detect. The meta exception does not apply.

**Suggested wording.** Add AP-74 Do not flag: 'Copies required for isolated readers to receive a rule, provided they are delivered from one authoritative statement rather than independently maintained.' Replace Fix with: 'Hoist or deliver the authoritative statement to every affected reader, then remove independently maintained duplicates. A pointer replaces text only after its reader can resolve it before acting.' Align AP-23 with the same one-edit-home condition.

**Observing check.** Positive: Two independently maintained copies received by the same worker consolidate into their delivered owner. Negative: One canonical rule injected into two isolated worker contexts is accepted despite repeated delivered wording.

Evidence addresses: AP-74 lines 968–968; AP-23 lines 344–344; AP-23 lines 348–348; DP-06 lines 41–41.

[Original candidate](reviews/ap_execution/findings-01.json) · [Independent disposition](reconciliation/ap-05.json).

## AE-16

**Confirmed · correction · P1**

Scope: [AP-92 · resource-fills-not-does](sources/anti-patterns.md#ap-92-resource-fills-not-does), [AP-104 · operative-criteria-need-a-home](sources/anti-patterns.md#ap-104-operative-criteria-need-a-home), [AP-68 · technique-stage-agnostic](sources/anti-patterns.md#ap-68-technique-stage-agnostic), [AP-113 · session-interaction-in-technique](sources/anti-patterns.md#ap-113-session-interaction-in-technique).

**Assessment.** Session gates and routing moved into technique Protocol violate the owning activity boundary. Presentation should be performed by the activity; the technique emits its declared evidence.

**Witness.** A resource says 'after review, confirm at the checkpoint, then proceed to validation'. AP-92 moves it to Protocol, where AP-68 flags it. AP-104's 'present' instruction similarly creates the presentation phase AP-113 removes.

**Suggested wording.** Replace AP-92 Fix with: 'Move domain work to technique Protocol. Move checkpoints, session cadence and routing to activity structure. Keep fill criteria and vocabularies in resources; reconnect moved values and anchors.' Replace AP-104's walker sentence with: 'The technique loads criteria, applies them and emits declared findings; the activity owns their presentation.'

**Observing check.** Positive: Resource-owned gate routing becomes activity checkpoints and exits, with findings bound as inputs. Negative: Portable risk vocabulary stays in a resource; a technique derives classification without prescribing user interaction.

Evidence addresses: AP-92 lines 1192–1192; AP-92 lines 1196–1196; AP-104 lines 1344–1344; AP-68 lines 896–896; AP-113 lines 1456–1456.

[Original candidate](reviews/ap_execution/findings-04.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-26

**Narrowed · correction · P1**

Scope: [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique), [AP-107 · bind-site-is-orchestration-truth](sources/anti-patterns.md#ap-107-bind-site-is-orchestration-truth), [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-141 · apply-omits-declared-input](sources/anti-patterns.md#ap-141-apply-omits-declared-input), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps).

**Assessment.** The Protocol-invocation repair conflict is confirmed. The exception in bind-site-is-orchestration-truth only excludes that entry and is not global permission to invoke; removing or cross-referencing it is a consistency cleanup, not another contradiction.

**Witness.** A local Protocol calls a raw tool with an existing shared wrapper. AP-51 prescribes replacement by a hyperlinked wrapping op with arguments; AP-114 immediately flags that work invocation. Repairing its omitted inputs under AP-141 leaves the AP-114 defect.

**Suggested wording.** Adopt DP-25 for ordinary techniques: AP-51 binds the wrapper as an activity/routine step; AP-141 checks required inputs at those binding sites; AP-107 removes its sibling-Apply exception. Retire dependent Protocol-invocation guidance unless a specifically named engine-entry case cannot be represented at a run binding site; any such exception must match across affected entries.

**Observing check.** Positive: A local wrapper call moves to a run step with complete bindings and no residual Protocol Apply. Negative: A primitive-owning technique invokes its raw tool and performs the reading without invoking another technique.

Evidence addresses: AP-114 lines 1464–1464; AP-51 lines 692–692; AP-141 lines 1844–1844; AP-107 lines 1378–1378; DP-25 lines 117–117.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).

## PD-07

**Narrowed · correction · P2**

Scope: [DP-16 · Distinguish Designators from Parameters](sources/design-principles.md#16-distinguish-designators-from-parameters), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps), [DP-42 · A Routine Holds the Codified Path](sources/design-principles.md#42-a-routine-holds-the-codified-path), [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique).

**Assessment.** The AP-51-to-AP-114 repair conflict is reproducible. DP-16 typography, however, does not by itself authorize a prohibited invocation, and DP-42 explicitly splices routines into activities, so DP-25 activity wording is compatible with expanded execution. Retain the stale-surface and authoring-ownership clarification without claiming these sentences form a formal contradiction.

**Retained issue.** Unify supported work binding and remove repair advice that creates a prohibited Protocol call.

**Suggested wording.** DP-25: "Sibling and shared techniques are bound as steps in the activity or routine that owns their sequence." DP-16: retain braced value references and remove the Protocol technique-invocation argument rule if no supported Protocol invocation remains. Do not transplant italic/parenthesized Markdown argument syntax into YAML; use the actual binding schema. AP-51/56 and Apply repairs should route work to supported binds.

**Observing check.** Positive: Replacing a raw tool call in a leaf Protocol with Apply another-technique still fails AP-114 and is not a complete repair. Negative: A reusable routine with sibling technique binds is valid composition, as is its expansion into the binding activity.

Evidence addresses: DP-16 lines 79–82; DP-25 lines 115–118; DP-42 lines 183–186; AP-51 lines 682–693; AP-114 lines 1458–1469.

[Original candidate](reviews/principles/findings-02.json) · [Independent disposition](reviews/principles/independent-review-02.json).

## PD-10

**Confirmed · correction · P2**

Scope: [DP-22 · Modular Over Inline](sources/design-principles.md#22-modular-over-inline), [AP-01 · no-inline-content](sources/anti-patterns.md#ap-01-no-inline-content).

**Assessment.** Construct is unqualified in DP-22 while the catalog and schema-first principle distinguish separately authored definitions from inline schema structures. The proposal improves scope; it should not be described as an AP exemption granting universal permission.

**Retained issue.** Restrict own-file guidance to constructs the schema supports as separately referenced definitions.

**Suggested wording.** Use: "A separately referenceable definition lives in its own file and its parent references it. Fields and steps that the schema owns inline remain on that parent." This avoids implying that any future or unsupported construct gains a file-reference form by analogy.

**Observing check.** Positive: Embedding a separately referenceable activity body inside a parent is the modularity defect. Negative: An inline checkpoint or action required by the schema stays inline; extracting it to an unsupported referenced file is not a valid repair.

Evidence addresses: DP-22 lines 103–106; AP-01 lines 62–73.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-03.json).
