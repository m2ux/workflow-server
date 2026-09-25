---
name: anti-patterns
description: Specific smell instances in authored workflow content — Detect / Do not flag / Fix. Covering stance lives in design-principles.
metadata:
  order: 2
  legacy_id: 2
---

# Overview

This catalogue lists **smells**: specific instances of bad patterns already present in authored workflow content. Each titled entry is one invariant, stated as a Detect / Do not flag / Fix test an auditor applies after the fact.

[Design principles](./design-principles.md) hold the broader *prefer / before* stance that avoids these smells and related failures. One principle may cover many entries. This file does not host positive authoring primers.

## Creation Rules

An add or an edit lands only after [Succinctness](#succinctness).

### Smell not stance

An entry detects one observable defect. The name is the smell (`avoidance-voice-in-definitions`). The prefer/before stance stays in [design-principles](./design-principles.md). Fix may cite that one principle.

### Entry identity

Title: `### AP-XX. name`. **AP-XX** is file order, zero-padded. Cite the kebab name in backticks. Do not cite the number or the entry count.

### Audit technique boundary

An audit technique loads the subsection and applies it. It does not restate the detect or the fix.

### Entry intro

Two lines, then a blank line: a quoted exemplar, then one sentence naming the failure. No gloss on the quote and no `>` note under it.

### Detect triad

**Detect**, **Do not flag**, and **Fix**, each its own block. Detect is the structural mismatch and its test. Do not flag is each carve-out. Fix is the remediation in application order.

### Keep audit signals

A cut keeps every Detect signal, carve-out, and Fix branch.

### Resist over-fit

The test fires on a foreign workflow on the same schema. A concrete name sits on the exemplar, and at most once inside Detect. It is not a required match.

Banned shapes: a blacklist standing in for the test; a step that applies only to this catalogue or one repo's files; a framework the auditor must re-derive; a sibling Detect restated; a second prohibition under one name.

Fix is delete, migrate, encode, or rename. A repo path in Fix is an example.

### Succinctness

Say each part once. Delete a sentence that repeats a part, a sibling, or the covering principle, including a count, a session trace, a supersession note, or a mnemonic. A cross-reference names the sibling and stops. If the deletion loses no signal, carve-out, or Fix step, the sentence goes.


# Catalog

## Structural

File and packaging smells.

### AP-01. no-inline-content

"Let me just inline that"

Content is embedded in a parent file instead of living in its own file.

**Detect:** An activity, technique, or resource body is inlined into a parent YAML/markdown file (or a new construct is authored inline rather than as a sibling file).

**Do not flag:** Short inline literals that the schema requires on the parent (e.g. a one-line `description:` field); hyperlinks to separate files.

**Fix:** Extract into its own file under the correct directory; replace the inline body with a reference/bind the schema expects. See [Modular Over Inline](./design-principles.md#22-modular-over-inline).

### AP-02. schema-is-constraint

"Let me adjust the schema to match"

The schema is bent to fit content instead of content being fixed to the schema.

**Detect:** A change proposes altering workflow/activity/technique schema (or inventing fields) so existing content validates.

**Do not flag:** Legitimate schema evolution requested explicitly by the user as a separate task.

**Fix:** Rewrite the content to conform to the current schema.

### AP-03. no-partial-implementation

"I'll fix the rest later"

Scope is left partially implemented before commit or close-out.

**Detect:** A commit, handoff, or "done" claim leaves items in the scope manifest unaddressed or explicitly deferred without user approval.

**Do not flag:** An explicitly scoped partial deliverable the user approved (remaining items stay open in the manifest).

**Fix:** Complete every scope-manifest item, or get approval to shrink scope and update the manifest before committing.

### AP-04. no-invented-naming

"I'll name it [new_thing]"

A new naming convention is invented without search and user approval.

**Detect:** A new id, filename pattern, rule slug, or vocabulary term is introduced without checking existing conventions and without user approval.

**Do not flag:** Reuse of an already-established convention found in-repo or in this catalogue.

**Fix:** Search for an existing name/pattern; if none fits, propose the new convention and get approval before adopting it.

## Interaction

Session-conduct smells.

### AP-05. atomic-checkpoints

"Skip/combine these checkpoints"

Multiple independent decisions are collapsed into one checkpoint.

**Detect:** Two or more distinct user decisions are packed into a single checkpoint (or one checkpoint is skipped by bundling its decision into another).

**Do not flag:** A single decision whose options naturally cover one atomic choice (`one-decision-one-checkpoint`).

**Fix:** Restore one checkpoint per atomic decision; split combined options into separate gates.

### AP-06. no-assumption-execution

"The user probably means..."

Execution proceeds on assumed intent instead of asking when uncertain.

**Detect:** The agent chooses among materially different interpretations of user intent without asking, then executes.

**Do not flag:** Unambiguous instructions; routine defaults the user already established in-session.

**Fix:** Ask a single clarifying question (`one-question-per-message`) before acting on the ambiguous point.

### AP-07. scope-reverify-completion

"Done!"

Completion is claimed without re-checking every item in the scope manifest.

**Detect:** A done/complete claim, commit, or close-out proceeds without verifying each scope-manifest item is addressed.

**Do not flag:** An interim status update that does not claim completion.

**Fix:** Walk the scope manifest item-by-item and resolve gaps before claiming done.

### AP-08. one-question-per-message

"Here are three questions..."

More than one question is asked in a single user-facing message.

**Detect:** A user-facing message contains two or more distinct questions (or stacked prompts that each require an answer).

**Do not flag:** A single question with clarifying context that is not itself a second question; option lists on one checkpoint.

**Fix:** Ask one question per message; wait for the answer before the next.

## Schema Expressiveness

Prose standing in for a formal construct.

### AP-09. checkpoint-not-prose

"Ask the user whether to proceed"

A user decision is written as prose instead of a `kind: checkpoint` step.

**Detect:** Step/activity description (or protocol prose) tells the agent to ask/confirm/choose without a `kind: checkpoint` at that `steps[]` position.

**Do not flag:** Non-blocking informational messages (`action: message`) with no decision; decisions already modeled as checkpoints.

**Fix:** Add a `kind: checkpoint` with `message`, `options`, and `effects` at the decision point in `steps[]`.

### AP-10. loop-not-prose

"Repeat this for each item" / "keep revising until it passes"

Iteration is written as prose instead of a `kind: loop` step.

**Detect:** Description or protocol says to repeat work with no `kind: loop` at that `steps[]` position. Two shapes: walking a collection the session carries between steps, whose declared form is `loopType: forEach` with `over` and `variable`; and repeating until a stated condition clears, whose declared form is `loopType: while` or `doWhile` with `continueWhile`. In both the repeated work is the loop's nested `steps[]`.

**Do not flag:** A one-shot step. A loop already declared in `steps[]`. Per-item work inside a technique `## Protocol`, where the technique is applied once and the phase states what one application does to each entry of its declared input. A protocol phase that refines its own output until it settles.

**Fix:** Replace the prose with a `kind: loop` step and move repeated work into the loop body.

### AP-11. decision-not-prose

"If X then do A, otherwise B"

Cross-activity routing is written as prose instead of an activity-level `decision`.

**Detect:** Prose describes branching to different activities/paths without an activity-level `decision` with `branches`/`conditions`.

**Do not flag:** In-step `when`/`condition` on steps; checkpoints that set variables consumed by declared exit predicates.

**Fix:** Declare an activity-level `decision` with branches/conditions; remove the prose branch recipe.

### AP-12. artifact-not-buried

"This produces a report"

Artifact production is buried in description instead of declared on technique Outputs.

**Detect:** A technique/activity claims to produce a file/report only in `description` (or similar prose) without a `#### artifact` on the producing technique's `## Outputs`.

**Do not flag:** Non-artifact outputs (variables, structured data) correctly declared as non-artifact outputs.

**Fix:** Declare `#### artifact` on the producing technique's Outputs (`no-hand-authored-artifacts`).

### AP-13. variable-for-approval

"Track whether the user approved"

Approval or mode-like state is tracked in prose instead of a typed variable.

**Detect:** Prose instructs remembering/tracking approval or similar state without a `variable` wired through checkpoint `effects`.

**Do not flag:** Ephemeral in-message acknowledgements that do not gate later steps.

**Fix:** Add a `variable` with `type`/`defaultValue` and set it from checkpoint effects; gate later steps on it.

### AP-14. mode-as-state

"In fast mode, skip the research steps"

Mode behaviour is written as rule/description text instead of ordinary state.

**Detect:** Mode-specific skip/branch behaviour appears only as rules or prose rather than a mode state variable (enum or boolean) plus `when` / `exits[].when`. Parallel boolean projections of an enum mode are `no-derived-state-shadow`.

**Do not flag:** One-off `when` conditions unrelated to a named mode.

**Fix:** Detect/set one authoritative mode variable early; express skips/branches as conditions on that state.

### AP-15. procedure-in-protocol

"First load the workflow, then get the activity"

HOW lives in the step description instead of the technique protocol.

**Detect:** A step `description` holds the procedure — numbered audit criteria, a sequenced procedure, or per-item iteration logic (`numbered-protocol-phases`).

**Do not flag:** Once a step BINDS a technique, absence of description is correct — `bound-step-no-description` requires removing `description` entirely (not merely de-proceduralizing) and homing content in the bound op.

**Fix:** Move imperative bullets into the technique protocol; leave a one-line WHAT in unbound `description`, or delete `description` entirely when the step is bound (`bound-step-no-description`).

### AP-16. technique-inputs-declared

"This technique needs a file path"

Required inputs are named in description instead of `inputs[]`.

**Detect:** Technique prose names a needed value (path, id, artifact) that is not declared in `inputs[]` with `id`/`description`.

**Do not flag:** Inputs already declared; pure outputs or locals. Produced values missing from Outputs are `technique-outputs-declared`.

**Fix:** Declare the input on `inputs[]` and reference `{id}` in Protocol.

### AP-17. bound-step-no-description

"`kind: technique` / `description` / `name` on a bound step"

A bound step still carries description/name prose.

**Detect:** A `kind: technique` or `kind: action` step that binds a technique still carries `description` or `name`. A bound step allows `kind`, `id`, `technique` (a string or `{ name, inputs, outputs }`), and structural `actions`, `when`, `condition`, or `required: false`. Unbound procedure in a description is `procedure-in-protocol`.

**Do not flag:** `kind: loop` may have `name`, loop fields, and nested `steps[]`. `kind: checkpoint` uses inline `message` and `options` and a stable `id`. A checkpoint or a loop is inline in `steps[]`, never `step.checkpoint` or a separate `checkpoints[]` or `loops[]` array.

**Fix:** Bind an existing technique when one fits and delete the description; otherwise enrich that technique's `## Capability` or `## Protocol` and strip the step prose. A one-line non-procedural summary is removed from the step too. N steps that differ only by description are `no-monolith-masking-steps`.

### AP-18. no-monolith-masking-steps

"N steps bind one technique and differ only by `description`"

Multiple steps bind the same op and differ only by description.

**Detect:** Several steps bind the same technique and differ only by `description` (or equivalent prose), with no distinguishing `when` / `actions` / input-output deviation.

**Do not flag:** Distinct structural attach points already expressed (checkpoint/`when` between phases); mutually exclusive `when` branches; distinct-purpose invocations at different pipeline points — see also `no-duplicate-technique-steps`.

**Fix:** (1) **Reuse** — bind an existing op and delete descriptions. (2) **Collapse** — consecutive same-technique steps with no intervening checkpoint and no structural deviation → one step. (3) **Split** — distinct phases → group with one op per phase; bind `technique: <group>::<op>`; delete descriptions. New techniques are last resort. Field purity on each resulting step is `bound-step-no-description`.

## Rule Hygiene

Rule smells.

### AP-19. no-rule-protocol-restatement

"The rule restates the protocol" / "a rule instructing work that no Protocol phase states"

A rule carries procedure — copied from a protocol phase, or work no phase states yet.

**Detect:** A technique, activity, or workflow rule restates a protocol bullet or phase without an invariant the steps do not already convey, or instructs work rather than constraining it. Test: the sentence could stand as a numbered Protocol phase unaltered. A prohibition is a constraint, and so is an invariant on a result. An imperative that names a step's work is not, including when no phase states that work yet.

**Do not flag:** A cross-cutting constraint the protocol does not encode, including a positively framed invariant on an outcome (`every finding carries evidence`). A prohibition citing the home that owns the behaviour it forbids.

**Fix:** Delete the rule where a phase already carries the work. Where the work is genuinely unstated, move it into `## Protocol` as a phase rather than leaving it in Rules — protocol is the procedural source either way. Keep any residual invariant the phases cannot express.

### AP-20. rule-group-disambiguation

"Explain why / Avoid attribution"

Apparently contradictory rules lack a disambiguating group key.

**Detect:** Two rules read as conflicting when co-listed, and they are not separated by grouped rule keys that supply context.

**Do not flag:** Rules that are truly contradictory (`no-contradictory-rules`); already-grouped arrays with clear keys.

**Fix:** Place each rule under a descriptive group key that supplies the missing context (e.g. `code-commentary` vs `attribution-prohibition`).

### AP-21. grouped-rule-keys

"code-foo, code-bar, code-baz"

Shared-prefix rules sprawl as flat keys instead of a grouped array.

**Detect:** Multiple rules share a naming prefix (or obvious family) but remain flat strings/keys instead of a grouped array under one descriptive key.

**Do not flag:** Unrelated rules; a single rule with no family.

**Fix:** Collapse into a grouped array under a key that replaces the prefix; use the schema's string|array rule union.

### AP-22. single-rule-authority

"This rule appears in the technique AND the activity AND the workflow" / "two entries in one `## Rules` block, bridged by `(same stance as …)`"

The same rule has more than one home — across levels, or twice within one rules block.

**Detect:** One invariant, two homes. Across levels: the same orchestrator-only rule (variable management, routing, commit policy, mode handling), or a rule that does not need worker reach, appears at workflow, activity, and technique. Within one rules block: two entries whose trigger and consequence coincide, so applying either yields the same behaviour and neither can be edited alone. The tell is a bridge — `(same stance as X)`, `as X already says`, `mirrors X` — a cross-reference that reconciles two homes.

**Do not flag:** Worker-directed behavioural rules that must stay reachable on activity/technique surfaces — see `worker-rule-reach`.

**Fix:** Keep one authoritative home at the level where the rule is enforced; delete the duplicates. Within a block, keep the statement with the wider consumer set, fold in any rationale or extra tier the other carried, drop the bridge, and repoint every citation of the deleted entry.

### AP-23. worker-rule-reach

"prefer gitnexus over grep" lifted to `workflow.yaml` / duplicated across techniques for worker visibility

A worker-directed rule is mis-placed where workers never receive it.

**Detect:** A behavioural rule workers must read is present only under `rules.workflow` (workers never receive `workflow.yaml`), or an audit flags per-technique copies of a worker-directed rule as hygiene violations.

**Do not flag:** An orchestrator-only rule (`single-rule-authority`). Placement by audience is `rule-audience-bucket`.

**Fix:** Keep a worker-directed rule on the activity or the technique. A copy on each technique that must reach the worker is that reach. Consolidate only into a shared technique that every affected activity loads.

### AP-24. no-contradictory-rules

"status-proposed" AND "status-accepted-directly"

Sibling rules in the same technique contradict each other.

**Detect:** Two rules in the same technique (or same rules bucket) prescribe mutually exclusive behaviours.

**Do not flag:** Rules disambiguated by group keys for different contexts (`rule-group-disambiguation`).

**Fix:** Identify the stale rule and remove or rewrite it so the set is logically consistent.

### AP-25. no-one-step-rules

"persist-output" rule on a technique with a "write-artifact" step

A technique rule applies to only one protocol step.

**Detect:** A `## Rules` entry constrains a single protocol step/phase rather than a cross-cutting invariant.

**Do not flag:** Cross-cutting rules that span multiple phases; step-local caveats already filed as `>` notes (`constraint-as-blockquote`).

**Fix:** Move the guidance into that step's protocol prose (or a `>` caveat) and delete the rule.

## Description Hygiene

Definition-prose smells.

### AP-26. no-rationale-in-description

"Let me explain why this is here"

Description fields carry rationale, process narration, or structural restatement.

**Detect:** A `description`, `message`, option or action description, procedure bullet, technique `## Rules` entry, or `rules.*` string explains why a construct exists, what consumes it, or whose remit it falls under, compares it to a prior implementation, or restates a fact adjacent structure already encodes (`steps[]` order, `when`, effects, exits, the workflow graph, a default). Test: delete the clause; if the prohibition or invariant still says what is constrained, the clause was rationale.

**Do not flag:** A one-line summary of what the construct does. A structural field itself. A prohibition citing the home that owns the behaviour it forbids (`no-rule-protocol-restatement`). A rule whose subject is the boundary between actors.

**Fix:** Delete the rationale, narration, or restatement. Keep a clause whose deletion would lose a fact. Where a reader needs another actor's contract, link that contract's home. Put rationale in a commit, an ADR, or a planning doc.

### AP-27. validate-message-economy

"Without X, Y will happen"

A validate message justifies consequences instead of stating cause + fix only.

**Detect:** A validate-action message includes trailing consequence essays after the failure cause and fix command.

**Do not flag:** Messages that are exactly `<what's wrong>. Run '<command>'.` (or equivalent minimal cause + fix).

**Fix:** Strip the consequence paragraphs.

### AP-28. no-sequence-in-description

"Workflow X first does A, then B, then C"

Activity/step sequence is restated in description prose.

**Detect:** `description:` on workflow/activity/technique enumerates the sequence of activities, phases, modes, or steps already canonical in `activities[]`/`graph`/`steps[]` (or the on-disk layout).

**Do not flag:** Purpose/value orientation that does not enumerate sequence; README orientation under `readme-orients-not-transcribes`.

**Fix:** Remove the sequence prose from `description`.

### AP-29. no-user-env-mutation

"Run 'git config --global ...'"

Workflow prose directs mutation of user-owned environment state.

**Detect:** Descriptions, validate messages, procedure bullets, or options direct the user or agent to mutate user-owned environment state outside the working tree (e.g. global git/gh/gpg config, package installs).

**Do not flag:** Diagnostics that report misconfiguration without directing the mutating fix; in-repo file edits.

**Fix:** Surface the diagnostic only; leave the fix scope to the user. Declare the boundary in workflow rules if needed.

### AP-30. role-rules-not-description

"The orchestrator coordinates only"

Role/behaviour constraints sit in description instead of rules.

**Detect:** Description (including variable descriptions) prescribes orchestrator/worker/sub-agent behaviour ("MUST", "coordinates only", "do not call") rather than saying what the construct is.

**Do not flag:** WHAT summaries with no role prescription; equivalent constraints already in `rules:` (drop the description duplicate).

**Fix:** Move the role constraint into `rules:` on the owning construct, or drop it when that rule is already there.

### AP-31. no-hand-authored-artifacts

"`artifacts: - id: evaluation-report / name: EVALUATION-REPORT.md / location: evaluation`"

Activity artifacts[] is hand-authored instead of synthesized from techniques.

**Detect:** Activity YAML declares `artifacts[]`. The server synthesizes that contract from the bound techniques' `## Outputs` — `#### artifact` filenames and activity-group shorthand.

**Do not flag:** Non-file side effects (commit, PR) — not artifacts; simply not declared.

**Fix:** Delete the activity `artifacts[]` block. If a produced file is missing from the synthesized contract, add `#### artifact` (bare filename, `{token}` template, or discriminator-keyed note per `artifact-name-in-io`) on the producing technique's `## Outputs` — never back onto the activity.

### AP-32. outcome-names-value

"`EVALUATION-REPORT.md written with per-dimension findings…`" / "`Output directory created`" / "`dimension_plan … populated`"

An outcome names the vessel (file/variable) instead of delivered value.

**Detect:** An outcome names the act of writing a file, re-lists that file's contents, or says a variable was populated or set. Test: the outcome still reads true if the file or variable is renamed.

**Do not flag:** A mechanical name used only in service of the value it carries.

**Fix:** Rewrite the outcome as the value delivered. Delete or fold an outcome whose only content is that a directory was created or a variable was populated.

### AP-33. no-set-of-technique-output

"`technique: …` + `set` of the technique's own product"

An activity set duplicates a bound technique's output.

**Detect:** A step has `technique` and a `set` whose `target` is a value the bound technique computes (an assessment, a classification, a derived structure, an artifact path). That output already lands via `variable-binding`.

**Do not flag:** (a) cross-iteration accumulator / scatter-gather gather over a `forEach`; (b) caller-specific derivation from a generic tool-wrapper op (keep on activity — `io-agnostic-contract`); (c) value-BEARING `set` on a pure control step recording orchestration/flow state. Value-LESS procedural control sets — see `no-valueless-control-set`.

**Fix:** Declare `### <target>` on the bound technique's `## Outputs` (same id), fold the `set` description into `## Protocol`, delete the activity `set`.

### AP-34. no-valueless-control-set

"control step `set` with `target` + `description`, no `value:`"

Control sets carry no derived value.

**Detect:** A control step (no `technique`) has value-LESS `set`s (`target` + `description`, no `value:`) whose descriptions carry sourcing/derivation HOW for a domain payload.

**Do not flag:** Value-BEARING control `set`s for orchestration/flow state; bound-step `set` of technique product (`no-set-of-technique-output`).

**Fix:** Bind a technique whose outputs/protocol own the derivation; delete the value-LESS activity sets.

### AP-35. no-intra-step-input-set

"`commit_message: "docs({target_name}): …"` + same-step `set` of `target_name`"

A step set feeds that same step's own inputs.

**Detect:** A bound step's `technique.inputs` interpolates a variable that the same step's `set` writes. Inputs resolve at invocation; a `set` is a side-effect with no before-input contract. The output-side counterpart is `no-set-of-technique-output`.

**Do not flag:** A `set` whose `target` is NOT interpolated by that step's `technique.inputs` — scatter-gather gather (`no-set-of-technique-output` excl. a), value for a later step, or pure control-step orchestration.

**Fix:** Hoist the derivation to where its source is first established (or declare it as an earlier producing technique's output per `no-set-of-technique-output`); delete the `set` from the consuming step, leaving a pure binding.

### AP-36. techniques-list-disjoint

"`techniques: - workflow-engine::list-workflows …` with matching `step.technique`"

Activity techniques[] overlaps step technique binds.

**Detect:** An entry in activity-level `techniques[]` is also bound by a step, top-level or inside a loop, via `step.technique`. Activity `techniques[]` holds a cross-cutting strategy (`variable-binding`, `scatter-gather`), not a per-step technique.

**Do not flag:** A strategy technique listed at activity level that no step binds.

**Fix:** Remove every overlapping entry from activity `techniques[]`; keep only cross-cutting strategies; delete the block if none remain.

### AP-37. rule-audience-bucket

"`rules: workflow: - \"WORKER PERMISSIONS: Workers MUST write all artifacts directly …\"`"

A rule sits in the wrong rules.* audience bucket.

**Detect:** Classify each rule by who must act: orchestrator (`get_workflow` only), worker (`get_activity` inject), or both identically. Flag worker directives (write-immediately, no-permission-questions, blocker-surfacing, artifact-verification, lens-loading-by-worker) under `rules.workflow`. Flag orchestration directives (dispatch isolation, output forwarding, checkpoint cadence, orchestrator handoff) under `rules.activity`.

**Do not flag:** Orchestrator directives in `rules.workflow`, worker directives in `rules.activity`, and the same directive for both in `rules.universal`. A rule that describes the other actor's mechanics (`instruction-narrates-an-actor`). Moving a mis-filed rule does not strike a narrating clause.

**Fix:** Move to the bucket for the actor commanded. If one prose rule commands the two actors differently, split into two rules (orchestrator handoff vs worker load).

### AP-38. no-duplicate-technique-steps

"`steps: - id: map-findings / technique: compare-finding-sets …` (×N)"

N steps bind one technique without structural reason to split.

**Detect:** Two or more steps in one activity bind the same technique. (a) Redundant re-execution — they differ only by which already-produced output to surface — collapses to one step. (b) Unrolled iteration — the same technique on N collection items — is one `forEach` with one binding. (c) Monolith-masking — distinguished only by a sub-mode input — splits into a group with one named technique per mode (`no-monolith-masking-steps`).

**Do not flag:** A fixed roster of distinct static targets with different structured inputs. Mutually exclusive `when` branches. Distinct-purpose invocations at different pipeline points. The same technique as distinct phases inside one loop iteration.

**Fix:** Collapse, loop, or split per that classification.

### AP-39. hoist-universal-techniques

"every activity carries `techniques: - variable-binding`"

A universal technique is not hoisted to workflow.techniques.activity.

**Detect:** A strategy technique appears on nearly every activity's `techniques[]`. `techniques.workflow` reaches the orchestrator (`get_workflow`). `techniques.activity` is inherited by every activity (`get_activity`). There is no `universal` bucket for techniques. A technique only some activities use stays on those activities. A step-binding duplicate is `techniques-list-disjoint`.

**Do not flag:** Activity-specific strategy techniques used by only some activities.

**Fix:** Declare once under `workflow.techniques.activity`; delete from every activity `techniques[]`; drop emptied activity blocks.

### AP-40. readme-orients-not-transcribes

"README `### NN. Activity` + `Steps:**` / checkpoints table / routing / `## Variables` / `## Rules` / estimated times" / "The workflow includes 27 resources… Each resource lives as `resources/<id>.md`"

README transcribes YAML structure, inventory counts, or loader packaging instead of orienting.

**Detect:** A README enumerates, in prose or tables, activity `steps[]` (including inline checkpoint options, `effect`, `autoAdvanceMs`, and loops), `exits[]` or the graph, per-step technique bindings, workflow `variables`, `rules`, or per-activity estimated times. Also flag an inventory count ("N resources") or loader path HOW (`resources/<id>.md`, "loaded by resource id", "sole load key"). Test: the block must be edited when those YAML fields or folder contents change.

**Do not flag:** A Mermaid or ASCII flow diagram. Orientation the YAML lacks: purpose, an at-a-glance activity sequence (name, one-line role, connections), outcomes, a file-structure overview without counts, a techniques overview, links to the YAML, a purpose sentence plus an index table of ids. A third checklist of which passes run (`bind-site-is-orchestration-truth`).

**Fix:** Delete the enumerations of steps, checkpoints, loops, exits, the graph, bindings, Variables, Rules, estimated times, inventory counts, and loader HOW. Keep diagrams and purpose orientation. See [Complete Documentation Structure](./design-principles.md#11-complete-documentation-structure).

### AP-41. avoidance-voice-in-definitions

"`Does not use inline content`" / "`Rather than X, the workflow now…`" / "`Never skip the checkpoint`"

Definition prose uses avoidance or comparative voice.

**Detect:** In workflow/activity/technique/resource *definition* prose (`description`, `outcome`, option/action descriptions, README orientation for the defined workflow — not planning artifacts), a passage states what the system avoids or how it differs from a prior/alternative design. Comparative/avoidance framing that must be edited when the "old way" is forgotten is the signal — not every English negation.

**Do not flag:** Planning artifacts under `artifacts/planning/` (evolution by design); true runtime constraints in `rules.*` / technique `## Rules` ("must not write secrets"); schema/condition operators; negative examples inside this catalogue; `validate` messages that name a misconfiguration and fix command (`validate-message-economy`).

**Fix:** Rewrite to current behaviour. See [Document in Positive Present](./design-principles.md#17-document-in-positive-present).

## Coupling

Contract and reference smells.

### AP-42. io-agnostic-contract

"`fix_strategy` from [analyze-failure]"

An I/O id or description names a specific caller.

**Detect:** An input/output entry names or links a workflow-internal producer/consumer — another technique ("from [analyze-failure]", "produced by build-function-registry"), activity ("from the elicitation activity"), step, checkpoint, loop, or workflow/activity file. Describe what the value IS (meaning, shape, allowed values), never its position in a particular workflow.

**Do not flag:** Protocol/Capability utilisation ("use technique X", "go through cargo::fmt-fix"); intrinsic/external origin ("git diff output", "the user's request", "provided by the server"); I/O links to a resource/template section (shape of the value).

**Fix:** Rewrite the entry generically; drop workflow-internal source/destination naming. See [An I/O Contract Names the Value](./design-principles.md#37-an-io-contract-names-the-value).

### AP-43. canonical-artifact-ids

"Read all open assumptions from `assumptions-log.md`"

Protocol cites a filename/path instead of a canonical I/O id.

**Detect:** Protocol references data via literal artifact filename/path, or I/O ids are path-flavored proxies (`assumptions-log-path` vs `assumptions-log`).

**Do not flag:** Filename literals correctly placed on `#### artifact` declarations (`artifact-name-in-io`); hyperlinked template nouns to resource sections.

**Fix:** Rename to canonical ids; cite `{id}` in Protocol; hyperlink artifact nouns to template sections without tool recipes (`no-tool-usage-prescription`).

### AP-44. artifact-name-in-io

"Create `NN-{package}-plan.md`"

A filename lives in Protocol instead of the I/O declaration.

**Detect:** Protocol prose names a concrete artifact filename, a literal or an ad-hoc path, instead of a canonical Input or Output id. A name selected by a mode is one literal per technique (`artifact-name-is-filename`).

**Do not flag:** Protocol references that already use `{canonical_id}` only. Opaque multi-file path arrays — see `no-opaque-artifact-path-array`.

**Fix:** Move the filename (literal or token-template) into the I/O declaration; reference identifiers only in Protocol.

### AP-45. no-opaque-artifact-path-array

"`all-artifact-paths` / `*-paths` input holding many files"

An opaque path array stands in for named artifact inputs.

**Detect:** A technique consumes several artifacts via a single opaque `*-paths` (or similar) array that forces Protocol to name the files.

**Do not flag:** A single artifact with a literal or token-template name on one Input (`artifact-name-in-io`).

**Fix:** Split into individually named Inputs with canonical ids; Protocol references those ids only.

### AP-46. no-resource-caller-backlink

"Composed by [generate-summary]" / "activities bind [analyse-challenge]… via [interview]" / "live on the producing technique: [research]" / "Outputs: the Manual Diff Review section written into `code-review.md`"

A resource backlinks its callers, names where its content lands, or narrates host orchestration.

**Detect:** A resource other than an engine or conduct prompt names a host caller, a destination, or bind/gate topology. Caller: "produced by", "live on", "Composed by", "Used by", a role-to-file table, a technique or activity path as a link target, a bare host id under Enforcement, "gated by", or "bound by". Destination: an `Outputs:` header, or prose placing the content in a named file ("written into", "a section of"). Orchestration: "activities bind", an `analyse:` or `::` recipe, a residual gate (`{has_open_assumptions}`, `{has_open_questions}`), "via [interview]", checkpoint or batch routing. Test: deleting the passage leaves a usable template, vocabulary, or guide, and the deleted text named who binds, produces, or gates the resource, or where its output goes.

**Do not flag:** A meta, bootstrap, agent-conduct, or workflow-engine prompt whose domain is telling the reader to run engine techniques. A sibling resource citation or a catalog entry name. One "see also" to a format rule the filler applies (line breaks, a canonical-home map). Ontology with no host ids (Goal → Activity → Technique). A creation guide naming the artifact it is the guide for (`no-template-creation-guide`), and filenames inside a Template body. Heading level as shape (`an ##-level section`).

**Fix:** State what the resource is. Drop the caller, Enforcement, and bind essays. Move role-to-file and orchestration into the owning activity or technique Protocol. See [Resources Stay Abstract](./design-principles.md#30-resources-stay-abstract).

### AP-47. no-redundant-link-label

`deep_scan ([deep-scan](link))`

A hyperlink repeats the plain-text word immediately before it.

**Detect:** A pattern `word ([link-text](url))` where `word` and `link-text` are the same name (modulo case/hyphen/underscore).

**Do not flag:** Preceding words that name a distinct role (`structural ([l12](link))`).

**Fix:** Collapse to a single `[link-text](url)` hyperlink.

### AP-48. brace-output-references

"Structure the output"

Protocol refers to "the output" without naming which output id.

**Detect:** Protocol uses vague nouns ("the output", "the result", "the artifact", "the analysis") instead of `{output_id}` or `{output_id}.field`.

**Do not flag:** References that already cite canonical output ids; non-output prose.

**Fix:** Substitute the declared output id (and sub-field when needed) for every vague reference.

### AP-49. no-delivery-mechanism-narration

"Resources are attached to technique responses (loaded via get_technique)"

Prose narrates delivery mechanism instead of the imperative + link.

**Detect:** Protocol explains how the server delivers the technique, resources, or bundle — "Resources are attached to technique responses", "available in `_resources`", "loaded via `get_technique`", "in the technique response", "worker self-bootstraps via `get_activity`".

**Do not flag:** workflow-engine techniques whose domain IS tool/delivery behaviour.

**Fix:** Delete mechanism narration; keep the imperative action and the canonical resource/technique hyperlink ("Load the lens prompt for `{declared_id}`"). Tool-call recipes ("via `get_resource`", param shapes) are `no-tool-usage-prescription`.

### AP-50. no-tool-usage-prescription

"Load [anti-patterns] via `get_resource`" / "call `get_technique { session_index, step_id }`"

Prose prescribes a harness/MCP tool-call recipe.

**Detect:** Capability, Protocol, Rules, or non-engine resource prose prescribes how to invoke a harness or MCP tool — a call name with "via", "call", or "after", an argument shape, or a sequence of session tools (`get_resource`, `get_technique`, `get_activity`, `get_workflow`, `start_session`, `next_activity`, `list_workflows`).

**Do not flag:** A `meta` workflow-engine, harness-compat, conduct, bootstrap, or agent-entry technique ([activity-worker](/meta/techniques/workflow-engine/activity-worker.md), [workflow-orchestrator](/meta/techniques/workflow-engine/workflow-orchestrator.md), [compose-prompt](/meta/techniques/workflow-engine/compose-prompt.md)) whose domain is the calls its reader makes (`engine-internals-narrated`). A technique that wraps a raw tool and names that tool (`canonical-technique-reference`). A markdown or `::` hyperlink that names what to consult, with no tool recipe.

**Fix:** Delete the tool recipe. Keep the imperative and the canonical hyperlink or `{id}`. A role boundary stays role prose ("workers source definitions from orchestrator-provided context"), not "do not call `get_workflow`".

### AP-51. canonical-technique-reference

"Use `gitnexus_context` on the symbol"

A raw harness tool name is used where a wrapping op exists.

**Detect:** Protocol names a raw harness or MCP tool for a capability that another technique wraps. The canonical form is `[op](path)` or `[group](path)::[op](path)`, which the server resolves to `::`. A stale or inconsistent name is `consistent-tool-names`.

**Do not flag:** The technique that wraps the primitive — naming the raw tool IS that technique's purpose. A remedy step whose wrapping op is a sibling of the technique holding it, which the step must perform unaided (`unreachable-operation-reference`).

**Fix:** Replace the raw tool name with the canonical hyperlinked wrapping op; preserve arguments.

### AP-52. brace-declared-ids

"Examine target_path" / "for synthesis pass (index 23)" / "`repo_root`" / "`<files>`"

A declared id is used unbraced where a designator is required.

**Detect:** (a) bare declared id as plain words; (b) orphan enum/index value not tied to its input ("index 23"); (c) disguised id in backticks or `<angles>` without braces. Spelling must match the declared id exactly (`### problem_statement` → `{problem_statement}`). Forms: `{input_id}` / `{output_id}` / `{output_id}.field` / `{$local}`.

**Do not flag:** Ordinary English that only coincides with an id; backticked literals that are not declared ids (shell commands, filenames, tool params).

**Fix:** Brace as `{declared_id}`. For an orphan value write "when `{declared_id}` is 23". Replace a disguise wrapper with braces.

### AP-53. dotted-rule-address

"per the gitnexus index-freshness rule"

A rule is cited in prose instead of its dotted symbol address.

**Detect:** A Protocol step cites a rule as prose ("per the X rule"), with `::`, or as a hyperlink to the rule's heading. Also flag a citation of a rule declared nowhere. Also flag an address shorter than the rules that arrive with the citer: its own, every container it sits beneath, and the contracts of the scopes its role's bundle names. A bare slug declared only outside that set names nothing delivered. Roles are not readable from the tree, so a static walk proves the library: inside one library a rule may arrive by a route the walk cannot see, and from another library it never does. Checking link spelling alone settles neither length.

**Do not flag:** A dotted address at the length the citer already holds. Inherited from self, group, or namespace root: the bare name. Outside that ancestry: `<owner>.<rule-name>`, the container named by its folder (`gitnexus.index-freshness-first` for a namespace root). Carry the namespace only where two namespaces hold the same technique id. A hyperlink from a resource or a README. Test: a technique cites in dotted form.

**Fix:** Replace the prose, `::`, or heading link with the dotted address at that length. A dangling citation points at the inline content. `::` invokes; `.` names.

### AP-54. anchored-protocol-references

"Apply design framework to structure the approach"

A protocol reference has no resolvable target.

**Detect:** A protocol phrase refers to a declared I/O, rule, technique, or resource and does not use that kind's resolvable form (`{id}`, a dotted rule symbol, a canonical `::` or hyperlink, or a resource hyperlink). Sibling form rules on the same walk are `brace-declared-ids`, `brace-output-references`, `canonical-artifact-ids`, `dotted-rule-address`, `canonical-technique-reference`, and `bind-protocol-locals`.

**Do not flag:** Domain prose that names no formal artifact. Anaphora for a noun already linked once in the same step. A reference to another technique, whose disposal is removal: `pass-orchestration-in-technique` where it invokes work, `unreachable-operation-reference` where it does not. Those two take precedence.

**Fix:** Anchor the reference with the matching form, or reword it. A reference with no target is dangling: fix the target or drop the reference.

### AP-55. hoist-shared-inputs

"`### planning-folder` declared on every technique"

The same shared input is redeclared instead of hoisted.

**Detect:** The same input is re-declared on many techniques instead of once on the smallest common container (group or workflow-root `TECHNIQUE.md`). A path-flavored id (`planning-folder-path`) is the related shape; the canonical id is the noun the value is (`canonical-artifact-ids`). Also flag synonym drift for one concept across leaves.

**Do not flag:** An input shared by only two or three techniques whose common ancestor declares none of them. That carve-out counts leaves, so it never covers a leaf declaration beside an ancestor's (`inherited-input-re-declared`).

**Fix:** Hoist the shared input to the container under one canonical id, delete the per-technique declarations, and reference `{id}`. Hoist a genuinely workflow-wide contextual input (artifact location, target path) even when some leaves never reference it. A producer/consumer value still hoists: the shared input on the ancestor, and the producing technique also declares it as an output (`snake-case-symbols`). A hoist that leaves the leaf declarations in place is `inherited-input-re-declared`.

### AP-56. paren-invocation-args

"`gitnexus::context {name: <symbol>}`" / "with target_dir in backticks beside a braced value"

Invocation argument names or lists use the wrong typographic namespace.

**Detect:** (a) A technique/technique invocation passes its argument list in braces (`::op {arg: value}`) instead of parentheses on the op reference. (b) A technique argument *name* appears bare or backticked (sharing the designator/code-token form) rather than italic. Test: the token names a parameter slot of the applied op, not a declared `{id}` value and not a literal path/command.

**Do not flag:** Brace objects that are not invocation arg lists (query/template/JSON payloads, raw tool-doc object shapes); italic emphasis that is ordinary English, not an op parameter name; correctly braced/backticked argument *values* (`backtick-code-tokens`, `brace-declared-ids`).

**Fix:** Align with [Distinguish Designators from Parameters](./design-principles.md#16-distinguish-designators-from-parameters).

### AP-57. escape-literal-dollar

"costs \$0.05 per call" / "the \$schema field"

A literal \$ is unescaped in rendered prose.

**Detect:** Unescaped `$` in rendered prose, outside a fenced block or an inline code span — a price (`$0.05`), `$schema`, or a shell `${VAR}` shown in text. GFM treats `$…$` as inline math, so an unescaped `$` can mis-render. A protocol variable is already inside a code span (`backtick-code-tokens`).

**Do not flag:** `$` inside a fence or inline code span (`` `${{ github.event… }}` ``, `` `git -C {$component_git_dir}` ``) — escaping would corrupt the code.

**Fix:** Backslash-escape every literal `$` in rendered prose (`\$0.05`); leave code spans/fences untouched. Displayed output stays `$`.

### AP-58. snake-case-symbols

"`check_status` output, `scope` input (case marks direction)" / "kebab symbol id that won't bind"

Symbol ids use the wrong case convention.

**Detect:** Symbol ids (inputs, outputs, sub-fields, `{$locals}`) in kebab/camel — they must be `snake_case` to bind to activity/condition/session state. Case used to encode input vs output direction. Rule/technique/resource/file/`::` targets wrongly snaked.

**Do not flag:** Tool/MCP/CLI param mirrors keeping the tool's exact spelling (`session_index`, `cloudId`). NAME class stays `kebab-case`: technique/technique/resource identities, hyperlink/`::` targets, and rule names (cited by dotted address, never evaluated). One snake symbol declared in both Inputs and Outputs when the value is input∩output (hoistable per `hoist-shared-inputs`).

**Fix:** Snake every symbol id. Keep a tool-parameter mirror. Keep kebab for a name or a rule.

### AP-59. constraint-as-blockquote

"`  - If the PR has not merged, wait`" / "`Compose {status} = {…}. When passed is false, surface the offending entries.`"

A caveat qualifying one instruction sits outside the blockquote note that carries it.

**Detect:** A caveat on one instruction — a condition, a fallback, an error path, or a prohibition — is an indented sub-bullet (`  - …`) or a *when* / *if* / *otherwise* clause inside the step sentence. The step regex strips indent, so the sub-bullet becomes a peer step. Two clauses of one predicate (`when {passed} is false` beside `if the run emitted warnings`) read as two branches.

**Do not flag:** An ordered sub-action or a precedence ladder. An If / Else if / Otherwise ladder over one choice, at any indent. A constraint that spans steps (`structure-backed-constraints`, `no-rule-protocol-restatement`). A one-step rule filed as global (`local-rule-as-note`, `no-one-step-rules`).

**Fix:** Put the caveat in a `>` note under the instruction. One caveat is the note's prose (`  > If the PR has not merged, wait`); two or more are bullets (`  > - When …`). Two clauses of one predicate become one note. A line opening with `>` folds into the parent. See [Isolate Conditional Branches as Notes](./design-principles.md#31-isolate-conditional-branches-as-notes).

### AP-60. local-rule-as-note

"`## Rules` entry that scopes to only one protocol block"

A local caveat is filed as a global-looking rule.

**Detect:** A `## Rules` entry applies to only one protocol block/step rather than spanning the technique.

**Do not flag:** A cross-cutting technique rule. A step-scoped caveat already under the instruction as `>` (`constraint-as-blockquote`). Guidance that belongs in protocol prose is `no-one-step-rules`.

**Fix:** Demote the entry to a `>` note under the block it qualifies; leave workflow-wide constraints in Rules.

### AP-61. factor-repeated-paths

"`.engineering/artifacts/adr/` repeated four times"

A repeated path literal is not factored into a designator.

**Detect:** A filesystem path appears more than once in a technique (or across techniques) as a repeated literal, or a step hard-codes a path when a declared variable already exists.

**Do not flag:** Genuinely single-use literals; the one canonical literal at its definition site (input `#### default`, producer, or location rule); distinct values that merely look similar.

**Fix:** Factor repeated/shared paths into a defaulted input (or `{$local}` when derived); reference the designator; keep the literal only at its canonical definition. If the literal contradicts an existing location variable, correct the usage — do not mint a second path variable for the wrong location.

### AP-62. bind-protocol-locals

"`git -C {$component_git_dir} …` with no bind" / "`Maintain {$resolution_counts}` never read"

A `{$local}` is dead or unbound at the consumer.

**Detect:** (a) An unbound local: a bare `{name}` that is not a declared I/O or an ambient activity input (`{target_path}`, `{branch_name}`) and has no `{$name}` bind in the protocol. (b) A dead binding: `{$name}` is never read as `{name}`. `{$name}` appears only at the producing step; reads are bare `{name}`, and the bind is textually before every read (`backtick-code-tokens`).

**Do not flag:** `{$name}` in each mutually exclusive producing branch. A `{name}` that is a declared I/O or an ambient activity input. If that one wore `$`, strip `$`.

**Fix:** (a) Name the value at the producer as `` `{$name}` ``. (b) Make the consumer read `{name}`, or drop a vestigial bind.

### AP-63. backtick-code-tokens

"`set worktree_created = true`" / "run 'git -C …'" / "fetch concept-rag://…"

A code token appears bare without backticks.

**Detect:** A bare designator (`{id}`, `{$name}`, a dotted rule address), a CLI or shell command including a single-quoted command, an MCP tool call, a resource URI (`scheme://…`), or a literal path or filename, outside a code span and not a markdown or `::` link target.

**Do not flag:** A token already inside a code span or fence. A descriptive prose noun ("the planning folder"). A hyperlink or `::` target. An invocation argument name (`paren-invocation-args`). A fragmented span (`` `git -C` `{x}` ``) is this fault: one span. Backticks without braces still fail `brace-declared-ids`.

**Fix:** Wrap each bare code token in one backtick span, designators inside the same span as the surrounding command. Convert a single-quoted command. De-escape `{\$name}` to `` `{$name}` `` (`escape-literal-dollar`).

### AP-64. boolean-id-shape

"`…_flag` / `not_ready` / ambiguous boolean nouns"

A boolean id is not an affirmative predicate.

**Detect:** Boolean symbol ids use a non-affirmative stem (`not_ready`, `no_merge`), a generic-noun burial (`…_flag`, `…_status`, `…_check`), or an ambiguous noun. Inverted meaning still fails when the id is prefixed.

**Do not flag:** Conformant unprefixed affirmatives; `is_`/`has_`/`can_`/`should_` only when the prefix sharpens an already-affirmative stem.

**Fix:** Rename to an affirmative predicate shape. See also [Name Symbols Affirmatively](./design-principles.md#19-name-symbols-affirmatively).

### AP-65. collection-id-shape

"`assumption_list` / singular id holding a collection"

A collection/map id has the wrong noun shape.

**Detect:** Collection/map ids use `*_list`/`*_array`/`*_collection`/`*_set` suffixes, or a singular id holding an iterated collection. Collections: plural item noun (`tasks`, `failures`). Key-addressed maps: singular mapping name (`domain_to_range`).

**Do not flag:** Bare plural collection item-nouns (correct); `_mode`/`_type`/`kind` discriminators (suffix is the head).

**Fix:** Rename to plural item noun (collection) or singular mapping name (map).

### AP-66. io-id-shape

"`summary` / `planning-folder-path` / direction-encoded I/O ids"

An I/O id encodes representation or direction.

**Detect:** I/O ids that are direction-encoded; representation proxies (`-path`/`-list`, see `canonical-artifact-ids` / `hoist-shared-inputs`); synonym drift for one concept; bare single-word generics (`summary`, `artifact`, `coverage`, `state`, `result`, `prompt`); Inputs/Output heading name collisions within one technique (except true input∩output pass-through).

**Do not flag:** External tool/schema field spellings; bare plural collection item-nouns (`collection-id-shape`); head-noun-last qualified phrases (`reconciled_assumptions`, `completion_summary`).

**Fix:** Rename; hoist one concept to one shared id (`hoist-shared-inputs`). See [Name Symbols Affirmatively](./design-principles.md#19-name-symbols-affirmatively).

### AP-67. rule-slug-shape

"`do-not-review-unresolved` / process-narration rule slugs"

A rule slug is negation or narration instead of a positive invariant.

**Detect:** A rule slug is a bare negation, process narration, or a prohibited-state name when a positive invariant is at least as clear.

**Do not flag:** A clear intentional negation (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`). A kebab identity that is not a symbol id (`snake-case-symbols`).

**Fix:** Rename toward a positive invariant when that name is at least as clear. See [Name Symbols Affirmatively](./design-principles.md#19-name-symbols-affirmatively).

### AP-68. technique-stage-agnostic

"return to the planning stage" / "at the validate activity" / "present the … checkpoint" / "after each task, before confirmation" / "flag every removal for explicit confirmation with a diff-style view"

A technique encodes workflow stage, graph position, or a decision gate it cannot own.

**Detect:** Technique Capability, Protocol, or Rules (a) mention a stage or activity (named, or "calling/consuming/producing activity"), a checkpoint, a loop or iteration, a transition or decision route, or a position in the activity flow ("after each task", "before user confirmation", "before the next step"), or (b) prescribe user confirmation, approval, or choice as if the technique owns that gate. Test: the sentence answers where or when in the workflow, which checkpoint surrounds the work, or how the user decides.

**Do not flag:** Purpose-phrased work with no orchestration locus ("final validation", "no separate commit step follows"); values the technique emits for the activity to route (counts, paths, severity, recommended option id); inventoring decisions *into* an artifact the activity will gate on; bare present/surface-to-user with no stage or gate named (`session-interaction-in-technique`).

**Fix:** Migrate user-facing decisions to activity `kind: checkpoint` steps gated on technique outputs; migrate other orchestration to activity exits, `when` gates and loops. Rewrite the technique to produce the durable evidence (artifact section, count, path) without naming the gate. See [Keep Orchestration in Structure](./design-principles.md#20-keep-orchestration-in-structure); also `no-activity-prose-rules`, `session-interaction-in-technique`.

### AP-69. no-activity-prose-rules

`rules: ["Manual diff review is FIRST", "all reviews must complete before validate"]` (prose rules at the activity level)

An activity carries prose rules: instead of pure mechanics.

**Detect:** Any activity-level `rules:` entry.

**Do not flag:** None. Behavioural guidance belongs on the bound technique.

**Fix:** Delete an entry that restates structure the activity already enforces. Migrate a technique constraint to the owning technique (`single-rule-authority`). Encode an unenforced constraint as `when` or `condition`, a transition, a decision, a checkpoint, or `required: false`. A hard gate is `when` or `condition`. Step `required` is a worker hint. See [Keep Orchestration in Structure](./design-principles.md#20-keep-orchestration-in-structure).

### AP-70. capability-group-placement

"Reusable primitive trapped in a client workflow" / "cross-consumer capability buried under one activity name"

Technique folder/name disagrees with shape-origin (reuse boundary, activity seam, or shared namespace).

**Detect:** A technique's directory or name encodes the wrong locus for its shape-origin: a reusable harness/capability primitive lives under a client workflow; a cross-activity intrinsic capability is named for one activity; or an activity-seam-only set is named as if it were a standalone capability. Also flag a group folder whose ops are the workflow's entire technique set (`<group>::` only restates the workflow). Discriminator is shape-origin, not consumer count.

**Do not flag:** Activity-named group used only to organize seam-driven ops (protocols inside stay stage-agnostic — `technique-stage-agnostic`); multiple distinct capability groups composed by one activity; inventing a group for a hypothetical second cluster (YAGNI).

**Fix:** Place the group at its reuse boundary: an activity-seam 1:1 set → activity-named group; a set one workflow's activities share → that workflow's root, capability-named; a set many workflows share → a namespace of its own, capability-named. A shared namespace driving a system outside the server is a library; one describing how a run itself proceeds belongs to the workflow whose subject that is. Use a group folder only to bound a subset against other top-level techniques; otherwise standalone `techniques/<op>.md` with shared contract in the namespace-root `TECHNIQUE.md`.

## Tool-Technique-Doc Consistency

Harness-surface mismatch smells. Apply by comparing authored claims to the actual tool surface — not a prose-only skim.

### AP-71. no-false-resource-delivery

"Resources are in the response"

A surface claims a tool return shape that is not accurate.

**Detect:** A technique, bootstrap/meta resource, or workflow doc/README describes a tool's return value, delivery shape, or payload inaccurately versus the actual harness behaviour (e.g. claims full resource bodies when the tool returns lightweight refs).

**Do not flag:** Accurate descriptions; non-engine surfaces that correctly avoid tool recipes (`no-tool-usage-prescription`).

**Fix:** Align the claim with actual tool behaviour, or delete the claim if the surface should not describe tools. See [Match the Harness Surface](./design-principles.md#21-match-the-harness-surface).

### AP-72. complete-bootstrap-path

"Call start_session, then call next_activity"

The bootstrap path has a discoverability gap between hops.

**Detect:** An authoritative bootstrap sequence (meta bootstrap / engine technique / orchestrator prompt) omits a tool or step required to reach the first meaningful action, given what the prior tools actually return (e.g. no `initialActivity` and no `get_workflow`).

**Do not flag:** Non-engine techniques that correctly omit tool recipes (`no-tool-usage-prescription`).

**Fix:** Complete the path on the authoritative bootstrap surface so every hop is discoverable from the prior tool's real return.

### AP-73. consistent-tool-names

"`get_step_technique`" / invented or stale tool name

The same harness action is named inconsistently or with a stale name.

**Detect:** (1) The same harness action is named differently across techniques, bootstrap resources, or docs. (2) A cited tool name does not exist on the actual harness tool surface. Canonical name for loading a step technique is `get_technique`.

**Do not flag:** Historical names only inside supersession notes that are being deleted; wrapped raw-tool names inside the op that owns that primitive (`canonical-technique-reference` carve-out).

**Fix:** Use one canonical name everywhere; replace or delete names absent from the harness surface.

### AP-74. no-duplicated-guidance

"Pass token to all calls"

The same behavioural guidance is multi-homed across techniques and tool docs.

**Detect:** Identical or near-identical behavioural instructions appear in more than one technique or tool description. Harness mechanics restated outside the engine, conduct, or bootstrap surface are `no-tool-usage-prescription`.

**Do not flag:** One home with pointers elsewhere. A meta surface whose domain is tool usage.

**Fix:** Keep one location and replace each duplicate with a reference to it. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-75. describe-tool-value

"Returns: Activity definition"

A tool description undersells the value of the real return.

**Detect:** On surfaces that legitimately describe tools (meta engine/bootstrap/tool docs), a description states mechanics or a partial return and omits the value the agent actually receives (e.g. "moves to the next activity" without the full activity definition payload).

**Do not flag:** Non-engine techniques that do not describe tools at all (`no-tool-usage-prescription`).

**Fix:** Describe the value of the real return.

### AP-76. no-redundant-tools

"Also call get_activities for the routing"

A tool is redundant because its output is a strict subset of another tool's return.

**Detect:** Authored guidance or the harness surface exposes/recommends a tool whose output is a strict subset of another tool already required (e.g. a routing-only helper after `next_activity`).

**Do not flag:** Tools that return non-subset value; distinct audiences/permissions.

**Fix:** Remove or stop recommending the redundant tool; document the surviving tool's return fully (`describe-tool-value`).

## Execution

Authoring-session smells.

### AP-77. impl-before-confirmed-approach

"I'll just start implementing"

Implementation starts before the approach is confirmed.

**Detect:** File/workflow modifications begin before the user has confirmed the proposed approach for the change.

**Do not flag:** Trivial typos/formatting the user already authorized; continuing an explicitly approved plan.

**Fix:** Present the approach; wait for confirmation; then modify. See [Confirm Before Irreversible Changes](./design-principles.md#8-confirm-before-irreversible-changes).

### AP-78. follow-through-on-recommend

"Here's what I recommend..."

A recommendation is presented without follow-through implementation.

**Detect:** The agent emits recommendations/analysis as the deliverable and stops without implementing the approved next action when implementation is in scope.

**Do not flag:** Pure advisory requests where the user asked for analysis only.

**Fix:** After recommending, implement (or explicitly checkpoint the implement-or-stop decision). See [Close the Loop](./design-principles.md#23-close-the-loop).

### AP-79. structure-backed-constraints

"The agent must never do X"

A critical constraint is text-only with no structural enforcement.

**Detect:** A critical rule in `rules[]` (workflow / activity) or technique `## Rules` can be violated by ignoring the text and has no structural backing (checkpoint, condition, validate action, or decision).

**Do not flag:** Explicitly guidance-only / non-critical rules; rules already backed by structure on the same construct or a parent the actor always receives.

**Fix:** Add structural enforcement (checkpoint, condition, validate, decision), or reclassify as non-critical guidance if structural backing is inappropriate. See [Encode Constraints as Structure](./design-principles.md#9-encode-constraints-as-structure).

### AP-80. preserve-readme-content

"Updated README"

A README update reduces content without a preservation audit and confirmation.

**Detect:** A README edit removes or shrinks substantive content without listing what was preserved/removed and getting user confirmation.

**Do not flag:** Additive clarifications; deletions the user explicitly requested.

**Fix:** Audit preservations/removals, confirm with the user, then apply (`readme-orients-not-transcribes` still applies to shape).

### AP-81. verify-format-literacy

"Draft first, validate later"

Drafting proceeds without format literacy, or commit skips validation.

**Detect:** New workflow/technique/resource files are drafted without checking the relevant format/schema conventions, or commits proceed without validating the touched files.

**Do not flag:** Edits that only touch already-validated identical shapes with no format risk.

**Fix:** Verify format literacy before drafting; validate all touched files before commit.

### AP-82. work-through-activities

"I'll just merge the worker outputs here"

Work bypasses defined activities via informal combination of results.

**Detect:** Results are combined, advanced, or closed outside the workflow's defined activities and graph.

**Do not flag:** In-activity orchestration that still goes through declared steps/checkpoints.

**Fix:** Route the work through the defined activities. See [Keep Orchestration in Structure](./design-principles.md#20-keep-orchestration-in-structure).

### AP-83. accept-correction

"That correction seems wrong — keeping my version"

A user correction is pushed back without evidence, or output is not re-examined.

**Detect:** The agent disputes a user correction without citing evidence, or fails to re-examine the output after a correction.

**Do not flag:** Evidence-backed clarification questions about the correction.

**Fix:** Re-examine the output; accept the correction or present evidence — never dismiss without evidence.

## Output Economy

Artifact and checkpoint smells.

### AP-84. single-closeout-artifact

`COMPLETE.md` + `workflow-retrospective.md` + `close-out-summary.md` + a README footer narrative

Multiple close-out documents re-narrate the same session.

**Detect:** More than one terminal artifact (or README footer) re-states delivered items, decisions, validation, follow-ups, or lessons.

**Do not flag:** A single close-out artifact with retrospective as a section; engine session summary presented but not persisted as a second artifact.

**Fix:** Collapse to one close-out document; retarget retrospective writes to it; keep README as an index line only.

### AP-85. link-dont-copy-sections

"### Test Results" / "### Files Changed" / "*Recorded from the [validation report]*"

A template section forces copying content owned by another artifact.

**Detect:** A template lays out sections to fill with content whose canonical home is another artifact, instead of instructing a link.

**Do not flag:** Sections that are the canonical home for newly produced content; link-only slots already correct (`link-only-input-slots`).

**Fix:** Rewrite the section as a link instruction to the canonical home.

### AP-86. exception-only-verdict-tables

"| Criterion | Target | Actual | Status |" with every row "✅ Met"

A verdict table lists all-green rows instead of exceptions only.

**Detect:** A template requires a verdict or status table whose expected steady state is all-pass (every row "✅ Met", "✅ Done", or "✓").

**Do not flag:** Vocabularies downstream steps parse (severity counts, README progress-tracker statuses) — data, not ceremony.

**Fix:** Replace with a one-line all-pass form plus a divergences-only table.

### AP-87. omit-null-sections

"Deferred Decisions: None." / empty "### Frustration Signals" table / "confirm no assumptions were made"

Null/empty results get headed sections or confirmation ceremony.

**Detect:** Artifacts include "None"/"N/A" headed sections or empty tables, or checkpoints ask the user to confirm a null result.

**Do not flag:** Sections with real content; a one-line logged null without a headed empty section.

**Fix:** Omit empty sections (mark templates `[Omit if none]`); log nulls in one line and proceed — no null-confirmation checkpoint.

### AP-88. one-decision-one-checkpoint

"`classification-confirmed` immediately followed by `workflow-path-selected`" / "`rationale-amendment` re-asking what prior options already captured"

One decision is split across multiple checkpoints.

**Detect:** Two declared checkpoints share one decision: the second's answer space is subsumed by the first's options. An agent combining checkpoints the definition already separated is `atomic-checkpoints`.

**Do not flag:** Distinct decisions with non-overlapping answer spaces.

**Fix:** Merge into one checkpoint whose options cover the full decision space plus an escape hatch for the subsumed judgement; move recording side-effects to the survivor; delete variables whose only consumer was the removed checkpoint's condition.

### AP-89. checkpoint-requires-decision

"`merge-strategy-reminder` — options: [Understood]"

A checkpoint has no real decision in its options.

**Detect:** Every option leads to the same next step, sets no variable, and exists only so the user can acknowledge guidance. An `autoAdvanceMs` that changes nothing is the same fault.

**Do not flag:** Attestation gates (DCO sign-off) that record a certification with identity/timestamp — genuine decisions.

**Fix:** Convert it to an `action: message` step. A checkpoint always answered with its default is `one-decision-one-checkpoint`.

### AP-90. no-guide-wrapper-ceremony

"Purpose:** … / ## Overview / > **Key Insight:** … / Good–Bad pairs / ## Quality Checklist / ## Relationship to Other Documents"**

A guide is wrapper ceremony around a template.

**Detect:** An agent-facing resource pads a template with ceremony — a Purpose or Overview that restates the title, a Good/Bad pair, a Quality Checklist that restates the body, or a relationship table. What stays is the template plus the operative rules: decision criteria, thresholds, format rules, classification vocabularies.

**Do not flag:** Behavioral reference documents (mode mappings, review criteria) that are mostly operative — cut ceremony, keep every mapping.

**Fix:** Rewrite as template + rules; fold each Good/Bad lesson into one rule bullet; drop wrapper sections; verify referenced heading anchors survive.

### AP-91. lifecycle-row-update

"### Assumptions Surfaced → ### User Response → ### Outcome → Final Review scorecards"

Lifecycle rows are append-only instead of updated in place.

**Detect:** A tracked item gets a new section (or appended block) at each lifecycle stage instead of one row updated in place. Aggregate scorecards are persisted in the log rather than presented in-session.

**Do not flag:** A full per-item block while the item is still OPEN (deleted on resolution; outcome lives in the row).

**Fix:** One row per item, updated in place across stages; present aggregate scorecards in-session, not persisted. Rewrite stage techniques as row updates, not appends.

### AP-92. resource-fills-not-does

"## Surfacing Assumptions / Ask after each phase/task…" / "## Research Protocol / 1. Ensure…"

A resource owns DOES procedure (session cadence or operational HOW) instead of fill/consult content.

**Detect:** A resource section is shaped like technique Protocol or session orchestration — imperative cadence ("after each phase/task", "Ask after…", "surface… then classify…"), numbered operational steps, or behavioural routing ("validate before proceeding", "confirm at checkpoint", "proceed to interview/batch"). Vocabulary, labels, and probe lists a template consumes stay. Behavioural cadence and gate routing that a technique applies move to the technique. Methodology a different technique consumes than the filename suggests stays, for that consumer. Bind-topology essays are also `no-resource-caller-backlink`.

**Do not flag:** Artifact templates/anchors, format skeletons, category/risk/status **labels**, probe lists framed as fill vocabulary (not "Ask after each…"), reference lexicons, calibration benchmarks, and fill Rules that constrain row/section **shape** (null-row format, one-row-per-item) without prescribing when to interview or which activity runs next.

**Fix:** Move does-sections to the owning technique as protocol phases or named rules; leave templates + consult vocabulary; dissolve the resource when nothing template-shaped remains. Retarget stranded heading anchors; ensure every moved `{token}` resolves under guard coverage (declared id / `{$local}` / workflow variable). See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-93. canonical-fact-home

"### Problem Statement in wp-plan / requirements-elicitation / design-framework"

A fact is multi-homed across templates.

**Detect:** Several templates in one workflow each mandate a full section for the same fact category (problem statement, success criteria, assumptions, decisions, risks).

**Do not flag:** Distinct fact categories with genuinely different homes.

**Fix:** Declare a canonical-home map (fact category → exactly ONE home template); other templates use a one-line link slot to the home; back with a conformance gate (`enforce-output-discipline`).

### AP-94. link-only-input-slots

"### Key Findings Summary — From KB Research: [key concept discovered]…"

An input slot restates another artifact's content.

**Detect:** A section is shaped to hold a summary/copy of a different document — even when adjacent prose says "link, don't copy", the slot shape defeats the rule.

**Do not flag:** Sections that record decisions/outcomes of the consuming document itself.

**Fix:** Replace with a link-only inputs list — one line per consumed artifact, linking the section that shaped the work. Anchors are permitted.

### AP-95. enforce-output-discipline

"state-once-per-artifact / single-source-and-link / exception-only-reporting … declared in a TECHNIQUE.md nobody re-checks"

Output-discipline rules exist without a verify gate.

**Detect:** An output-discipline ruleset exists only as prose with no verify technique at a workflow boundary — style decays per-worker with nothing detecting drift (duplicated homes, null sections, restated slots).

**Do not flag:** Rules already paired with a bound verify/fix-in-place gate (verify-readme-conforms pattern).

**Fix:** Pair every output-discipline ruleset with a verify technique at a workflow boundary — mechanical checks for structural rules, declared line budgets otherwise; gate verifies and fixes in place with no checkpoint, loop, or routing variable.

### AP-96. artifact-audience-declared

"`#### artifact` / `debt-ledger.md`" — a filename with no `#### audience` beneath it

An artifact's primary audience is undeclared.

**Detect:** An output declaring `#### artifact` carries no `#### audience`. Absence reads as `human`, so an agent-state artifact — a lifecycle log, index, or ledger only later steps re-read — keeps the prose shape a human document has.

**Do not flag:** An output with no `#### artifact`. Audience is a property of a file on disk.

**Fix:** Declare the audience. `human` is prose. `agent` is structured one-entry-per-item data, serialized as JSON (`check-audience` enforces the format; `audience-declared` enforces the presence). Where a person is pointed at the artifact — a progress-inventory row, a gate message linking it — that reader is the one the format serves.

### AP-97. link-named-artifacts

"`spec-confirmed` — message: Full specification across the elicited dimensions`" / "`findings in the report are the change specification.`"

A durable artifact is named in a message but not linked.

**Detect:** A user-presented checkpoint or action `message` names or implies a durable file artifact without `[label]({path_variable})`, or the link hard-codes a numeric `NN-` prefix.

**Do not flag:** Pure in-chat subjects (no durable file); internal `set`/`log` diagnostics that are not user-presented artifact references.

**Fix:** Declare a path output on the producing technique. Persist before the message when the file does not exist yet. Interpolate `[label]({path_variable})`. The write technique assigns a numeric prefix. On a checkpoint the message stays a statement (`checkpoint-requires-decision`).

### AP-98. no-next-step-narration

"`Impact analysis complete — no removals. Continuing to scope…`" / "`… Accepting in 30s unless you intervene`" / "`(default — auto-accepts after 30s)`"

A message narrates the next step or auto-advance.

**Detect:** Checkpoint/action `message` or option `description` narrates next-step routing or auto-advance timing that the schema already owns (`exits`, the workflow `graph`, `autoAdvanceMs`, `defaultOption`, option labels).

**Do not flag:** Pure factual status clauses with no routing/timing narration.

**Fix:** Delete the narration; keep timing in `autoAdvanceMs` and `defaultOption`, routing in `exits` and the workflow `graph`, and the rest in option labels only.

### AP-99. statement-not-question

"`Here is the full specification. Is it accurate and complete?`" / "`Confirm this target set?`"

A checkpoint message is phrased as a question.

**Detect:** Checkpoint `message` has a trailing `?`, or confirm/interrogative openers ("confirm…", "is this…", "does this…", "would you like…", "which … should").

**Do not flag:** `?` inside interpolated content that is not asking the user.

**Fix:** Rewrite `message` as a statement of the subject (optionally with a `link-named-artifacts` path link); put the decision in `options[]` labels.

### AP-100. runtime-rules-only

"`Never use prose where a formal schema construct exists`" / "`Modular over inline`" / checkpoint-message or README authoring standards in `rules.*` or technique `## Rules`

A design-time authoring standard is filed as a runtime rule.

**Detect:** A rule in `rules.*` or technique `## Rules` governs how to *write* workflows (content shape of YAML/technique/resource files, authoring standards) rather than current-session runtime conduct. Signals: restates a design principle or anti-pattern; would apply in an unrelated authoring session.

**Do not flag:** Runtime keepers — progress-tracker updates, corrections-must-persist, isolation/orchestration models, write-immediately, domain safety floors, worker permissions.

**Fix:** Remove it from `rules.*` or technique `## Rules`. Migrate it into the design-time canon — a principle, this catalogue, the construct inventory, or an existing covering entry. Enforce it in the authoring audit.

### AP-101. no-caption-only-message

`Structural patterns from existing workflows, with proposed structure shown alongside.`

A checkpoint message is only a caption of the prior present step.

**Detect:** After a present-then-checkpoint step, `message` restates "what I just showed" with no durable subject and no decision-relevant fact.

**Do not flag:** Messages that link a persisted artifact (`link-named-artifacts`), state a decision-relevant fact, or name a loop discriminator options lack.

**Fix:** Persist, then link (`[label]({path})`), or reduce the message to the subject the options decide.

### AP-102. no-technique-resource-dual-home

"`audit-anti-patterns` protocol lists per-entry Flag/Skip/Fix…` while `anti-patterns.md` already defines those criteria" / technique restates a linked resource's checklist, vocabulary, or detect rules"

Operative criteria are dual-homed in technique and resource.

**Detect:** A technique that loads or links a resource also embeds operative criteria that must be applied from that resource (parallel detect/fix lists, vocabularies, or compressed checklists). Both files hold the same facts — distinct from `resource-fills-not-does` and `no-resource-caller-backlink`.

**Do not flag:** A one-line pointer to the resource; technique-owned HOW the resource does not define; scan-scope paraphrase without repeating criteria. See also `operative-criteria-need-a-home`, `cited-home-owns-claim`, `no-shadow-audit-pass`.

**Fix:** Choose one home (usually the resource for reusable criteria, the technique for procedure); delete the duplicate. Migrate unique technique-only criteria into the resource before deleting them from the technique. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

## Canon Hygiene

Canon smells.

### AP-103. cited-home-owns-claim

"Select the set from [guide]"

A citation attributes a fact to a home that lacks it.

**Detect:** A technique, resource, or guide attributes an operative fact to a linked home ("from X", "per X", "defined in X", "select … from X") and that fact is absent from X. It lives only in the citer, or nowhere. Test: the claim cannot be applied from X alone.

**Do not flag:** A citation that points at content in X. Orchestration that does not claim X owns it. An aspirational "see also" that asserts no ownership.

**Fix:** Move the fact into the cited home, or stop attributing it to X and own it in the citer (`operative-criteria-need-a-home`, `no-technique-resource-dual-home`).

### AP-104. operative-criteria-need-a-home

"Flag every divergence matching: naming, field order, voice markers…"

Reusable criteria live only in a technique with no catalog/resource home.

**Detect:** Reusable Detect, Do not flag, and Fix criteria — or an equivalent checklist an agent reapplies across sessions — exist only inside a technique protocol, with no resource or catalogue home. Signals: a long criterion list, a classification vocabulary, a "scan for these markers" table.

**Do not flag:** One-off orchestration (step order, which files to open, how to present findings). A thin walker that names a home and applies it (`no-technique-resource-dual-home`). Criteria already homed in a resource or the catalogue while the technique is still fat.

**Fix:** Migrate the criteria into a resource or this catalogue. Leave the technique as a walker: load the home, apply it, present. A prohibited pattern belongs in the catalogue. A positive checklist belongs in a resource. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-105. no-shadow-audit-pass

"`audit-consistency` restates Tool-Technique-Doc Detect while `audit-anti-patterns` already walks that section"

An audit pass shadows another walker's Detect criteria.

**Detect:** An audit technique embeds a compressed copy of a catalog/resource's Detect criteria while another technique already walks that same home (full or scoped).

**Do not flag:** A thin scoped walker that loads a named section and applies each entry as written without restating Detect; distinct passes with distinct homes (e.g. inventory walk vs full catalog walk); non-audit techniques.

**Fix:** Delete the shadow Detect. Keep one walker per home, or a scoped walker that does not re-author the criteria. Fold a unique surface-check method into the catalogue entry or into the surviving walker's procedure.

### AP-106. canon-layer-cites-not-restates

"Principle 4 prose embeds the full Schema Expressiveness / Description Hygiene Detect body already in the catalogue"

An upper canon layer restates Detect/Fix already owned below.

**Detect:** An upper canon layer — a design principle, a mode guide, README orientation — re-embeds a multi-sentence Detect or Fix body a lower layer already owns: this catalogue, the construct inventory, or a convention resource. Test: a named citation replaces the paragraph without losing an enforceable test. Also flag a duplicated marker list or rewrite recipe.

**Do not flag:** A short Rule statement plus a named citation. An Enforcement pointer to an activity or checkpoint. One clarifying sentence that does not repeat Detect steps. A layer that is itself the sole home (`operative-criteria-need-a-home`).

**Fix:** Keep the upper layer as the stance. Delete the restated Detect, the Detect-routing block, and a host Enforcement inventory (`no-resource-caller-backlink`). Migrate unique criteria down before deleting them. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-107. bind-site-is-orchestration-truth

"Review mode runs: expressiveness, conformance, rule-to-structure…"

A pass inventory disagrees with authoritative YAML bind sites.

**Detect:** Prose outside activity YAML enumerates an ordered or complete list of activities, steps, or technique passes, and that list is not generated from the authoritative bind sites (`steps[]` / loop bodies / `technique:`, plus `initialActivity` / the workflow `graph`). Test: the prose must change when a bind changes, but the YAML was not the source of the list.

**Do not flag:** Purpose/value orientation without a pass inventory; pointers to the YAML; at-a-glance activity names with one-line roles (`readme-orients-not-transcribes`); a technique that only applies a sibling without listing a parallel set.

**Fix:** Delete the third checklist, or replace it with a pointer to the binding activity/technique. If a summary is required, generate it from the YAML binds. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

## Technique Protocol

Smells on technique markdown.

### AP-108. numbered-protocol-phases

"### 1. Apply Fixes" with edit / re-validate / record as bullets under one heading

Discrete sequential protocol phases are collapsed into one numbered step.

**Detect:** A technique `## Protocol` has a numbered `### N. Title` whose body holds two or more bullets, or imperative sentences, that are distinct sequential phases. Each produces a different outcome, or must complete before the next. Test: reordering or dropping a bullet changes the phase sequence.

**Do not flag:** Bullets that elaborate one phase — how-to for one write, constraints on one apply, a loop body over one entry, mode branches of one action. A `>` caveat under a primary instruction. A single-bullet step.

**Fix:** Split into consecutive `### N. Title` steps, one phase per heading. Keep an elaborating bullet under the phase it refines. See [Phase by Sequenced Outcome](./design-principles.md#15-phase-by-sequenced-outcome).

### AP-109. technique-outputs-declared

"Assemble the per-file drafting plan…" with no `## Outputs` entry

Capability or Protocol produces a value that is not declared on Outputs.

**Detect:** Technique Capability or Protocol assembles, derives, or returns a durable or gateable value — a plan, findings, a summary, a classification, a path, a count, a structured assessment — with no matching `### <id>` under `## Outputs`. Test: a later step, checkpoint, or consumer could bind or cite the value. A file also needs `#### artifact` (`artifact-not-buried`).

**Do not flag:** A pure side-effect with no bindable product (push, open a PR, mark ready) when no path or number is captured. A value already declared on Outputs. An input-only gap (`technique-inputs-declared`). Protocol that only presents a value to a user (`session-interaction-in-technique`); still declare the output when it is gateable.

**Fix:** Declare `### <id>` under `## Outputs` naming what the value is, and reference `{id}` where Protocol assembles it. Add `#### artifact` when the value is a file. The activity surfaces `{id}` (`session-interaction-in-technique`).

### AP-110. duplicate-shared-capability

"`publish-workflow-pr` re-teaches `gh pr create` / `gh pr ready` / `git push` already covered by the `github` and `git` namespaces"

A workflow-local technique re-implements a capability a shared namespace already offers.

**Detect:** A workflow-local technique embeds a harness recipe in its Protocol for a capability a shared namespace already holds a technique for. Also flag a local re-teaching of a concurrent fan-out — `Task`, spawn-concurrent, or dispatch-then-merge — when [`orchestration-patterns`](/meta/techniques/orchestration-patterns/TECHNIQUE.md) or a borrowable [`meta/activities/patterns/`](/meta/activities/patterns/README.md) activity already covers the shape. Test: the local novelty is only parameters or caller-specific composition; the verb is already owned elsewhere. A shared op that almost fits, missing an input, optional flag, or output, still owns the capability.

**Do not flag:** A change to the shared op itself that keeps existing callers working — a new optional input, default, output, or small protocol branch. A new shared op when no shared capability exists yet. A local technique that only assembles caller-specific values while the activity binds the shared op. Session-level `dispatch-activity`.

**Fix:** Delete the local harness recipe. Bind the shared op from the activity, or borrow an activity that already binds it. Keep caller-specific value assembly in a local technique when the activity needs it (`canonical-technique-reference`, `no-duplicated-guidance`, `pass-orchestration-in-technique`). See [Prefer Shared Capability](./design-principles.md#18-prefer-shared-capability) and [Bind Sibling Techniques as Steps](./design-principles.md#25-bind-sibling-techniques-as-steps).

### AP-111. contract-not-procedure

"### 7. Set Technique Flags" restating create/update/review recognition criteria already (or better) owned by Outputs

Protocol carries identity criteria or a trailing "Set …" phase that belongs on the Output contract.

**Detect:** A technique `## Protocol` (a) restates derivation, recognition, or decision-tree criteria for a declared Output, or (b) has a numbered phase whose sole job is to assign a pure projection of another output already produced (boolean flags that are `true` iff `{operation_type}` is a given enum). Test: deleting the Protocol copy leaves the Output description as the sole complete definition, or the phase only types derived fields.

**Do not flag:** Protocol that emits `{id}` by reference to Output criteria without restating the tree. A count or path emitted in the same phase that produced the bag or artifact. A mode branch that uses an already-bound value. Missing Outputs (`technique-outputs-declared`).

**Fix:** Move identity criteria onto the owning Output. Collapse a pure projection to a one-line Output description. Keep Protocol as work phases that emit `{id}`. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure). A workflow-variable shadow is `no-derived-state-shadow`.

### AP-112. no-derived-state-shadow

"`is_update_mode` / `is_review_mode` alongside `operation_type`"

A derived shadow variable duplicates an authoritative state variable.

**Detect:** A workflow declares two or more variables where one is a pure projection of another — a boolean that is true iff a primary enum or string equals a constant, or a mirrored count of the same bag. A gate, a technique input, or a `setVariable` effect writes or reads the shadow. Test: a legal write can leave the shadow disagreeing with the source.

**Do not flag:** Distinct facts that merely correlate; Output prose that defines a projection without declaring a second workflow variable (`contract-not-procedure`); mode encoded only as rules/prose with no state variable (`mode-as-state`).

**Fix:** Keep the authoritative variable; rewrite conditions, technique inputs, and effects to compare it directly; delete the shadow declarations and every write to them. See also [Single Source of Truth](./design-principles.md#14-single-source-of-truth).

### AP-113. session-interaction-in-technique

"Present `{drafting_plan}`" / "Present findings to the user" / "surface the summary in chat"

A technique performs or prescribes human/session interaction.

**Detect:** Technique Capability, Protocol, or Rules instructs presenting, surfacing, showing, narrating, or otherwise delivering content to a user, session, or chat. Test: the imperative needs a human audience or session channel to succeed, and no tool or technique owns that channel.

**Do not flag:** Assembling or persisting a declared output the activity will surface. An activity binding a tool or technique whose domain is external delivery (push, open a PR, send). Naming "the user's request" as an input origin (`io-agnostic-contract`). A stage or gate locus (`technique-stage-agnostic`).

**Fix:** Delete present, surface, and show-to-user phases. Keep assemble, derive, and persist that emit `{id}`. Put human-facing delivery on the binding activity (`action: message`, or a checkpoint message linking `{id}` or a path). See [Keep Session Interaction in Activities](./design-principles.md#24-keep-session-interaction-in-activities).

### AP-114. pass-orchestration-in-technique

"`run-audit-passes`: Apply audit-expressiveness…" / "`publish-workflow-pr`: Apply push-branch, then create-pr…"

A technique's Protocol invokes other techniques to do work — sequencing sibling or shared techniques the binding site should carry as consecutive steps.

**Detect:** Technique Capability or Protocol applies, invokes, or runs another technique for work, by `Apply [technique]` or a `::` invocation, one or many. Signals: numbered phases that are each "Apply […]"; Capability that names a multi-pass pipeline or a façade over shared ops; Outputs that only re-export children. Test: moving each invoked op to its own `steps[]` entry at the binding site, with any local value-assembly technique kept separate, preserves behaviour.

**Do not flag:** A reference that invokes nothing (`unreachable-operation-reference`). Citing resources, including creation-guide Templates. Container I/O and rule merge. Activity `steps[]` and routine technique binds. Activity borrow, bind, or include of a reusable orchestration pattern. Tools. One produce path over tools and resources (load, derive, persist one product) with no Apply or `::` work invoke. Stage or gate locus without an op inventory (`technique-stage-agnostic`).

**Fix:** Delete the façade, or strip Apply and `::` work invokes from the Protocol. Bind each sibling or shared technique as its own step of the run that needs both, in the order required. Keep distinct local value assembly as a separate technique. See [Bind Sibling Techniques as Steps](./design-principles.md#25-bind-sibling-techniques-as-steps) and [A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading); also `bind-site-is-orchestration-truth`, `no-monolith-masking-steps`, `duplicate-shared-capability`.

### AP-115. platform-semantics-in-capability

"Shared base contract… Inputs… are inherited by every technique… Techniques inherit the Rules below…"

Capability (or a techniques-folder README) teaches loader composition instead of naming what the contract contributes.

**Detect:** Capability on a container `TECHNIQUE.md` (workflow root or group), or orientation prose for that container, explains how the loader applies the contract: Inputs, Outputs, or Rules inherited or merged into descendants; a technique set implied by folder contents; a standalone-versus-group placement lecture; or a trailing "Techniques inherit the … below" clause. Test: the sentence teaches how composition works rather than what shared contract exists.

**Do not flag:** A platform home — [schema-construct-inventory](./schema-construct-inventory.md), [workflow-canonical](/meta/resources/workflow-canonical.md), design-principles, this catalogue, or a meta harness or engine resource whose domain is the platform. A one-line contribution statement with no merge lecture. A README note that `techniques.activity` strategy techniques apply to every activity. A delivery or tool recipe (`no-delivery-mechanism-narration`, `no-tool-usage-prescription`).

**Fix:** Delete composition, placement, and inherit-trailer prose. Leave what shared I/O, rules, or invariants this contract holds. See [State Contract Contribution](./design-principles.md#27-state-contract-contribution).

### AP-116. no-template-creation-guide

"Persist a decision-facing report: classification summary… integrity verdicts… removals inventory — via write-artifact … bare filename `impact-analysis.md`" (full layout recipe in Protocol; no creation-guide Template)

A planning artifact is persisted without a creation-guide Template, or the technique invents the layout in Protocol instead of citing one.

**Detect:** A technique persists a session planning artifact by bare filename and either no workflow resource owns that filename with a `## Template` (or named template anchor), or Protocol embeds a competing section or table recipe rather than citing the guide. Shared satellites may share one guide.

**Do not flag:** A non-planning output (a variable, a PR, a commit). A cite of an existing Template with short when/which bullets. Wrapper ceremony around a template (`no-guide-wrapper-ceremony`). Fill content that lives in the resource Template while Protocol only orders persist.

**Fix:** Author or extend a creation-guide resource with `## Template` and `## Rules`. Map the bare filename in the resources index. Replace the Protocol layout with a cite to `#template`. See [Creation Guide for Generated Documents](./design-principles.md#28-creation-guide-for-generated-documents); also `resource-fills-not-does`, `no-technique-resource-dual-home`.

### AP-117. no-engine-mechanics-as-rules

"ambient-bag-variables-changed — Declared outputs appear in the activity's `variables_changed`"

A leaf Rule (or a Protocol phase whose only job is the same restatement) re-encodes engine or binding mechanics that already have an authoritative home.

**Detect:** A technique, activity, or workflow `## Rules` or `rules[]` entry — or a Protocol phase that only restates bag, envelope, binding, or dispatch mechanics — repeats a contract owned by workflow-engine, variable-binding, finalize-activity, or schema composition. Examples: declared outputs land via `variables_changed`; mutations use the sanctioned channel; loops and conditions are structural. The entry adds no domain invariant those homes do not already encode.

**Do not flag:** A domain constraint the engine does not enforce. An engine or conduct surface whose domain is that contract. An activity `set` that duplicates a technique output (`no-set-of-technique-output`). A tool or delivery recipe (`no-tool-usage-prescription`, `no-delivery-mechanism-narration`). A rule that restates its own technique's Protocol (`no-rule-protocol-restatement`). A worker or orchestrator prompt that only sequences entry tools and cites homes (`prompt-restates-owned-mechanics`).

**Fix:** Delete the leaf restatement. Keep declared Outputs and rely on the engine home. Where that home is incomplete, fix it once there. See also `no-one-step-rules`, `platform-semantics-in-capability`, `prompt-restates-owned-mechanics`.

### AP-118. no-bind-mechanics-as-prose

"When unbound, use `{worker_result.artifacts_produced}` from the orchestrator bag after dispatch."

Prose substitutes for a bind decision that structure already owns.

**Detect:** Definition prose outside the bind home — an I/O description, Capability, a Protocol aside, a Rule, README orientation, option or action text — tells the agent how to obtain, satisfy, fall back, remap, or otherwise resolve a declared input or output. That resolution belongs in [variable-binding](/meta/techniques/variable-binding.md), in call-site `step.technique.inputs` or `outputs` deviations, or in a declared `default`. Test: deleting the sentence leaves a binding gap that structure should close, or the sentence only teaches how to get the value into the technique.

**Do not flag:** The variable-binding technique and any surface whose domain is bind resolution. A declared `default` or an optional or required marker. Meaning, shape, and allowed values. Protocol that consumes an already-bound `{id}`. Engine mechanics restated as Rules (`no-engine-mechanics-as-rules`). Naming a specific producer or consumer (`io-agnostic-contract`).

**Fix:** Delete the bind prose. Close the gap with a same-name bag binding, a declared `default`, or a call-site input or output deviation. Delete unused I/O. Where structure cannot express the resolution, extend variable-binding or the schema once. See also `io-agnostic-contract`.

### AP-119. procedure-in-io-contract

"`applied_fixes` — the selected findings implemented in `{target_path}`, verified to compile with tests passing, then staged and committed on `{branch_name}` — final phase, no separate commit step follows" / "Branch to push to (typically the current branch — do NOT create a new branch in the parent repo)" / "`needs_issue_creation` — false when step 1 verified an existing issue; Gates steps 2 and 3"

An Input or Output description holds how the value is produced or used.

**Detect:** An `## Inputs` or `## Outputs` description carries an imperative, a do/don't, a multi-step population, sequencing ("final phase", "gates steps N"), a conditional duty ("when absent, then…"), a checkpoint duty, or a recovery recipe. An Output may still state how the value is recognised. Test: the sentence answers how the value is produced, or what to do with it, rather than what it is.

**Do not flag:** Meaning, shape, or allowed values, including a brief shape example. Output recognition criteria that do not narrate work steps. A declared `default`, or optional/required. Bind-resolution prose (`no-bind-mechanics-as-prose`). HOW already in Protocol or a cross-cutting Rule. Identity criteria sitting in Protocol (`contract-not-procedure`). A producer or consumer named with no duty (`io-agnostic-contract`). A technique hyperlink (`technique-ref-in-io-contract`).

**Fix:** Leave the bind contract on the entry. Move the how into a Protocol step that references `{id}`, or into a Rule when it cuts across steps. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure).

### AP-120. procedure-in-capability

"Create README.md … populating its header fields … applying mode-aware Progress Status … (seed-time exclusion uses the cancelled/N/A value)" / "via meta [create-pr](…)" / "Applied-fix record (`{fixes_applied}`)"

`## Capability` holds how, a hyperlink, or a `{id}`.

**Detect:** Capability carries an imperative past naming the product, sequencing, a mode branch, or a seed/fallback; or a markdown link to another file; or a brace designator (`{fixes_applied}`). Test: the sentence answers how to perform it, where else to look, or which bag id it is.

**Do not flag:** A product statement with no link and no `{id}` (a bare name may name the product). A container naming its shared contribution (`platform-semantics-in-capability`). HOW, `{id}`, and cites already in Protocol, Rules, or I/O. Bind-resolution prose (`procedure-in-io-contract`, `no-bind-mechanics-as-prose`, `brace-declared-ids`).

**Fix:** Leave the insight. Move how, designators, and cites into Protocol, Rules, or I/O. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure).

### AP-121. rule-as-protocol-step

"4. Follow the rules in the techniques bundle throughout — agent-conduct, workflow-engine…"

A standalone / cross-cutting rule is encoded as a numbered Protocol (or bootstrap-instruction) step instead of living under `## Rules`.

**Detect:** A Protocol phase, bootstrap-instruction bullet, or sequenced list states only a standing invariant, prohibition, or "follow X rules throughout" duty, with no produce, transform, or persist outcome for that step. Test: removing the step leaves the work sequence intact, and the sentence still belongs as a constraint on the whole technique or session. The inverse is `no-one-step-rules`.

**Do not flag:** A work phase that cites a Rule or resource policy while doing work. A step-local `>` caveat (`constraint-as-blockquote`). One-step guidance filed as a Rule (`no-one-step-rules`). A Rule that restates Protocol (`no-rule-protocol-restatement`).

**Fix:** Move the invariant into `## Rules` — the technique, the prompt resource, or the container `TECHNIQUE.md`. Keep Protocol as sequenced work outcomes. On a prompt or bootstrap surface, a standing duty belongs under that resource's Rules.

### AP-122. prompt-restates-owned-mechanics

"Exception — inlined `step_techniques`: … EMIT a one-line `▶ step <step_id>` begin-beat… Resource bodies are never nested inside…"

A worker/orchestrator spawn stub or agent-entry technique restates delivery, bind, checkpoint, or engine HOW that already has an authoritative home.

**Detect:** Stub or agent-entry prose explains a bundling budget, a begin-beat, `step_techniques` engagement, sibling `resources` map reuse, bind precedence, yield or replay branching, or another contract owned by a technique's Protocol or Rules — [variable-binding](/meta/techniques/variable-binding.md), [yield-checkpoint](/meta/techniques/workflow-engine/yield-checkpoint.md), [workflow-engine](/meta/techniques/workflow-engine/TECHNIQUE.md) — or by the tool response itself (`step_techniques_note`, `resources_note`, a reference-mode note). Test: deleting the paragraph and leaving a cite to that home preserves fidelity.

**Do not flag:** A minimal [compose-prompt](/meta/techniques/workflow-engine/compose-prompt.md) stub (entry tools plus Apply `{agent_technique}`). A novel duty with no other home — hoist it into engine or conduct once, then cite it. A one-line cite to the home. A role-boundary Rule; an account of what the other role does is `instruction-narrates-an-actor`.

**Fix:** Delete the restatement. Keep the imperative entry sequence and cite the home. Hoist a unique duty that still has no home into workflow-engine or the owning technique once. See also `no-delivery-mechanism-narration`, `no-engine-mechanics-as-rules`, `no-duplicated-guidance`.

### AP-123. capability-as-op-inventory

"Techniques and rules for executing a workflow's structured flow — session lifecycle (list/match/scan/create/start), activity dispatch (dispatch-activity), agent entry techniques (activity-worker, workflow-orchestrator) composed via compose-prompt, …"

`## Capability` (especially a container `TECHNIQUE.md`) enumerates nested ops, facets, or folder contents instead of stating a succinct contribution overview.

**Detect:** Capability is a comma or em-dash inventory of child techniques, protocol facets, or folder techniques, often with a hyperlink to each, rather than what the contract or group contributes. Test: the sentence must be edited whenever a nested technique is added, renamed, or removed, and a reader could get the same list from the folder or index.

**Do not flag:** A one- or two-clause purpose statement that names the domain without listing children. Leaf Capability that names the single product (`procedure-in-capability`). A container contribution statement for shared I/O or rules (`platform-semantics-in-capability`). README orientation that points at an index table (`readme-orients-not-transcribes`).

**Fix:** Rewrite Capability as the shared domain. Leave the technique catalogue to the folder, the techniques index, or the YAML binds. See [State Contract Contribution](./design-principles.md#27-state-contract-contribution); also `platform-semantics-in-capability`, `procedure-in-capability`.

### AP-124. alternate-ops-as-protocol-sequence

"### 1. Spawn … ### 2. Resume … ### 3. Concurrent" (or unnumbered `### spawn` / `### resume` / `### concurrent` under `## Protocol`)

Mutually exclusive technique variants — or standing host-invoke policy — are encoded as Protocol phases as if they were a sequenced procedure.

**Detect:** A technique `## Protocol` lists alternate modes of the same technique that a caller selects exactly one of (spawn versus resume versus concurrent; create versus update) and never walks in order. Also flag a Protocol bullet whose only job is standing host policy (blocking-equivalent wait, depth-1, index-in-prompt, prefer or omit flags) with no produce, transform, or persist outcome for that step. Test: renumbering the phases would not change runtime behaviour, because only one phase applies per call.

**Do not flag:** Sequential phases ([Phase by Sequenced Outcome](./design-principles.md#15-phase-by-sequenced-outcome), `numbered-protocol-phases`). One Protocol phase whose bullets are mode branches of one invoke. A Rules catalogue for a host or compat file. A generic technique whose Protocol is resolve, then dispatch, then await ([spawn-agent](/meta/techniques/harness-compat/spawn-agent.md)).

**Fix:** Move alternate slices and standing host policy into `## Rules`, naming slices by `operation_kind` when a resolver selects them. Keep `## Protocol` for ordered outcomes. A caller Applies the selected rule section. See also `rule-as-protocol-step`, `no-one-step-rules`.

### AP-125. technique-ref-in-io-contract

"`challenge_findings` — Ordered per-perspective findings from [challenge](./challenge.md)" / "`applied_fixes` … via [manage-git](…)::[commit-paths](…)" / "`concurrency` … parallel fan-out via [spawn-concurrent](…)"

An Input or Output description hyperlinks or otherwise associates the bind slot with a **technique** (sibling op, group, or cross-workflow technique), as if the agent should Apply or consult that technique to understand the value.

**Detect:** A technique `## Inputs` or `## Outputs` entry description contains a markdown hyperlink to a technique file (`**/techniques/**/*.md`, group `TECHNIQUE.md`, or equivalent `::` technique citation), or prose that names another technique as the producer/consumer/executor of the value ("from [challenge]", "via [commit-paths]", "ready for [dispatch-workers]", "folded by [run-suite]"). Inputs/Outputs are bind contracts — what the value *is* — not an invitation to execute another op. Test: if following the link would take the agent into another technique's Protocol/Rules to interpret the slot, flag it.

**Do not flag:** Resource hyperlinks (templates, guides, policy sections under `**/resources/**`) that clarify value shape or vocabulary — e.g. "one question is posed from it per [requirements-elicitation](…/resources/requirements-elicitation.md)"; bare technique *id strings* when the slot's value *is* a technique id (`agent_technique`, `harness_technique`) without a navigable technique hyperlink; Protocol/Rules that correctly Apply or cite techniques; I/O HOW without a technique association (`procedure-in-io-contract`).

**Fix:** Rewrite the I/O description as bind-contract meaning/shape only (no technique hyperlink). Move producer/consumer/Apply relationships into Protocol (or activity `steps[]` binds). See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure); also `procedure-in-io-contract`, `io-agnostic-contract`, `canonical-technique-reference` (Protocol-side).

## Draft Hygiene

Smells in draft prose. The `MR-` designator is stable.

### MR-1. cut-comment-jsdoc-verbosity

"This function iterates the list and returns the count"

A comment narrates what the next line already says.

**Detect:** Comments or JSDoc whose removal leaves the code equally clear; multi-line blocks that paraphrase identifiers; "what" narration without a non-obvious "why".

**Do not flag:** One-line rationale for a surprising constraint, safety invariant, or non-local coupling; license headers; public API contracts that the language cannot express.

**Fix:** Delete or collapse to a single why-line. Prefer renaming and structure over commentary.

### MR-2. no-dense-prose-after-config-examples

"The `timeout` field above sets the timeout"

Prose after a complete example restates fields the example already shows.

**Detect:** After a complete example fence, a paragraph (or more) that only re-explains keys already shown; duplicate "how to fill" essays beside a Template.

**Do not flag:** One sentence that adds a non-obvious constraint the example cannot show; a Rules list that constrains use without restating the fence.

**Fix:** Keep the example; cut the restatement. Point to the Template/Rules for fill constraints.

### MR-3. worktree-root-placeholders

"`/home/someone/projects/dev/workflow-server/.worktrees/workflows`"

A literal checkout root stands where a portable placeholder belongs.

**Detect:** Literal home directories, machine-specific worktree roots, or copied absolute paths where `{target_path}`, `{planning_folder_path}`, or a relative-from-worktree placeholder belongs.

**Do not flag:** Schema examples that intentionally show a shape with braced placeholders; planning-folder artifacts that record a resolved path for one session.

**Fix:** Use worktree-root or bag placeholders (`{target_path}`, `{planning_folder_path}`, `{workflow_id}/…`) so content is portable across checkouts.

### MR-4. no-parallel-runbook-when-setup-covers-it

"Clone the repo, npm install, npm start"

A second how-to restates install and run steps a setup document already owns.

**Detect:** Parallel runbooks that restate clone/install/build/start already in SETUP; technique Protocol that teaches environment bootstrap the setup doc owns.

**Do not flag:** Workflow-specific orientation that links to SETUP; deltas unique to this workflow that SETUP does not cover.

**Fix:** Link to SETUP once; keep only the workflow-specific delta here.

### AP-126. variable-description-one-line

"`Set by the checkpoint. Drives the gate. Read by later steps.`"

A workflow `variables[].description` carries more than what the value is.

**Detect:** `description` is more than one sentence, essay-length multi-clause prose, or includes producer/consumer/gate/layout tails ("Set by…", "Drives…", "Read by…", "Gates…", "Interpolated into…", install-path catalogs, loop/checkpoint wiring, restatement of `defaultValue`).

**Do not flag:** A single short phrase or one sentence with a compact shape hint (`{ id, statement }`). A value set belongs in the declaration's `values` (`value-set-in-prose`). Longer contracts belong on the producing technique's `## Outputs`.

**Fix:** Rewrite to one line naming the value; delete producer, consumer, gate, and layout tails.

### AP-127. bag-value-as-literal

"push the branch to `workflows`" / "the audit covers all eight design dimensions"

A concrete value is written out where a declared variable or technique input already holds it.

**Detect:** Cross-reference literals in workflow, activity, technique, and resource content against the workflow's `variables[]` and the enclosing technique's `## Inputs` and `## Outputs`. Flag a verbatim value — path root, branch or remote name, identifier, count, enum member, host — where a declared slot carries that meaning and `{name}` belongs. Both must hold: the slot's `description` names what the literal denotes, and the literal is the operative value rather than a shape illustration.

**Do not flag:** The declaration itself (`defaultValue`, or an enum or shape hint inside the slot's own `description`). A Template or example fence that shows a resolved shape. A planning-folder artifact recording one session's resolved values. An exemplar line in a catalogue entry. A literal with no declared slot: a path repeated across sites (`factor-repeated-paths`), a host absolute path or checkout root (`worktree-root-placeholders`), state tracked in prose with no variable (`variable-for-approval`), a literal of state a declared variable already derives (`no-derived-state-shadow`).

**Fix:** Replace the literal with `{name}` for the declared slot. Leave exactly one home for the value — the declaration.

### AP-128. unproduced-value-read

"`when: intent_detected == true` on the sole producer" / "`variable: matched_item`, `operator: ==`, `value: null` on the reader's gate"

A reader can reach a variable on a path that skips its only producer.

**Detect:** The sole producer (step output, remap, or `set`) is gated by `when` or `condition`, or sits in a `while` body whose `continueWhile` decides the first pass. A later reader — an input, a `when`, `condition`, `continueWhile`, `breakCondition`, or `{token}` — is reachable where that producer is skipped, and the variable has no `defaultValue`. Two shapes: a reader gated by equality or a relational operator, and an ungated reader with no producer arm for the gate's negation.

**Do not flag:** A `defaultValue` seeded at session creation. A reader gated by the same expression as its producer. A checkpoint `setVariable` that applies on every option. A projection of state another variable already carries (`no-derived-state-shadow`).

**Fix:** Ask definedness with `operator: exists` or `notExists`. Where the excluded path needs the value, add the producer arm so the gates are exhaustive. A `defaultValue` a reader cannot tell from a produced value is not that arm.

### AP-129. stale-restatement-after-change

"`identifies the target and any saved session` surviving in one README tier after the sibling tier gained `when the request states resume intent`"

A change leaves a restatement asserting the behaviour it altered.

**Detect:** A change alters a gate, precondition, default, or ordering. Search the pre-change phrasing across every README tier, activity `description`, `## Capability`, `outcome[]`, and resource body. Flag each hit that still asserts the old behaviour. Count occurrences in the tree: a manifest naming one file for a claim that appears in three is the same defect.

**Do not flag:** A restatement the change did not affect. A planning artifact that records the before state. A claim held once. A restated Detect body (`canon-layer-cites-not-restates`). A stale clause about another actor (`instruction-narrates-an-actor`).

**Fix:** Update every occurrence in one edit and record the count in the file manifest. Where the claim has one home, delete the restatements. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-130. artifact-name-is-filename

"`COMPLETE.md` (implementation) or planning-folder session `README.md` section (review mode)" / "`stage-1.md` (fast stage) / `stage-2.md` (deep stage)"

An `#### artifact` body is not one filename.

**Detect:** Read the body as the filename created under the artifact prefix. Flag more than one path segment: names joined by `/`, `and`, or `or`; a parenthesised mode or condition; a declaration key written as text (`name: <file>`); a sentence naming a section of another technique's document; a path separator.

**Do not flag:** One literal (`01-audit-report.md`). A `{placeholder}` template (`{package_name}-plan.md`).

**Fix:** Several files: one `###` output each, with its own `#### artifact`. A mode-selected name: one op per mode, gated at the bind (`no-monolith-masking-steps`). A section of another technique's file: no artifact here. A sibling's files: declare them on the sibling (`canonical-fact-home`).

### AP-131. resource-id-names-its-content

"`complete-wp` on the resource holding the close-out template"

A consult resource's id is a verb phrase.

**Detect:** Read each id under `**/resources/**` with the body closed. For a template, guide, vocabulary, criteria, or policy, flag a verb head or an imperative. Also flag a noun that omits the kind word its siblings carry (`-guide`, `-template`, `-forms`, `-seed`) while the file holds a `## Template`.

**Do not flag:** A prompt the agent executes (a lens, bootstrap, or agent-conduct prompt). An id that already names its content. A bare noun where no sibling carries a kind word. A noun-modifier that only looks verbal (`review-format`, `update-mode-guide`). A technique or activity id.

**Fix:** Rename to the content plus its kind, and update `name:`, the resources index, and every relative and `::` reference in one edit. Where the verb names a technique, move the content into a technique. See [Convention Over Invention](./design-principles.md#7-convention-over-invention).

### AP-132. deployment-path-in-capability

"Shared contract for planning-folder artifacts under `.engineering/artifacts/planning/`"

`## Capability` names one deployment's directory.

**Detect:** Capability contains a repo-relative directory, a checkout root, or an absolute path. Test: a workflow storing the same artifacts under another root cannot adopt the op with this Capability unchanged.

**Do not flag:** A path in Protocol, Rules, or an I/O `#### default` (`factor-repeated-paths`, `worktree-root-placeholders`). An artifact kind or bare filename (`COMPLETE.md`). A path that is the op's subject.

**Fix:** Name the artifact class and the contribution. Where a consumer needs the location, declare an input with a `default` and reference it from Protocol. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure).

### AP-133. overlapping-rule-scopes

"a rule for every artifact and a second for large artifacts, each prescribing different handling"

Two rules' triggers intersect and their handling differs, with no order between them.

**Detect:** In one bucket (`## Rules`, a `rules.*` array, or fill rules), an input satisfies both triggers, the handling differs, and neither entry orders them: a broad rule beside a narrower one that does not name itself the exception, two thresholds on one measure, or two criteria on one field. Test: one input in the intersection, read alone, does not determine the behaviour.

**Do not flag:** Triggers that cannot both hold. A pair already ordered, by a precedence clause or a group key (`rule-group-disambiguation`). One invariant stated twice (`single-rule-authority`). Mutually exclusive prescriptions (`no-contradictory-rules`). A carve-out that names the entry it excepts.

**Fix:** One entry, the narrower case as a condition inside it. Where both remain, the narrower names what it overrides (`dotted-rule-address`). Splitting the triggers is valid where the split is a real distinction.

### AP-134. whole-resource-for-one-section

"per the [Review Comment Template](../resources/review-mode.md)"

A citation delivers a whole resource where the prose reads one section.

**Detect:** A technique cites a multi-section resource with no `#anchor` while the link text, or the phrase beside it, matches one heading. Also flag a bare citation beside an anchored citation of the same resource: both are delivered.

**Do not flag:** A consumer that reads the body: a filler using `## Template` with its `## Rules`, an audit of every entry, or a technique whose sections are most of the file. A single-section resource. A bare citation that introduces the resource.

**Fix:** Cite `../resources/example.md#section-title`, link text the section title, one citation per section. A bare citation beside anchored ones is anchored or dropped. A large resource no section covers is a split under [A Resource Splits for Section Delivery](./design-principles.md#44-a-resource-splits-for-section-delivery). See [Cite Resources at Section Grain](./design-principles.md#32-cite-resources-at-section-grain).

### AP-135. tool-contract-restated-in-protocol

"Each entry is an object with two string fields: `step_id` … and `output` … ; do not pass an empty array"

Protocol restates a tool argument's shape.

**Detect:** Protocol or a rule spells out field names, types, cardinality, required-versus-optional, permitted values, or omit-versus-empty for a tool whose schema the harness shows the caller. The bullet says what the argument is.

**Do not flag:** A call signature naming which arguments a step passes. What the caller does with the response. A constraint on a value, such as relaying a map verbatim. An obligation the schema cannot express, such as which dispatches must pass the argument.

**Fix:** Keep the obligation and the reason. Drop the shape. See [Match the Harness Surface](./design-principles.md#21-match-the-harness-surface).

### AP-136. phase-cited-by-ordinal

"the primitive step 5 resolves for the layout" / "[render](./render.md) step 3 owns that resolution"

A reference names a Protocol phase by its ordinal.

**Detect:** A rule, I/O description, Capability, resource, README, or another technique's Protocol says "step N", "phase N", or "the Nth step". Numbering belongs to the loader ([workflow-canonical](/meta/resources/workflow-canonical.md#protocol)). Test: insert one phase above the cited one; the sentence now names the wrong work.

**Do not flag:** An ordinal inside the `## Protocol` that owns the numbering. A link to the phase heading. A dotted rule address (`dotted-rule-address`). An ordinal that is a declared id, heading text, or quoted output.

**Fix:** Name the technique or op that holds the phase. Anchor the heading where that one phase is required. Where the pointer only explains the cited work, delete it. See also `anchored-protocol-references`.

### AP-137. unowned-harness-capability

"capture session history via `inspect_session` (same stance as [generate-summary] / [verify-outcomes])"

No technique owns a harness capability that several techniques call.

**Detect:** One tool is named for the same capability in two or more technique bodies, and no technique declares that product on `## Outputs`. Signals: permitted argument values listed at more than one site; a citation of another consumer (`single-rule-authority`). Test: no file answers which technique a caller would bind.

**Do not flag:** One call site (`duplicate-shared-capability`). A site that already binds a wrapping op, and the wrapper (`canonical-technique-reference`). An engine, conduct, bootstrap, or agent-entry surface. Distinct capabilities of one tool.

**Fix:** Author the technique, declare the product, bind it as an activity step, and let consumers declare that product as an input. Repoint sideways citations at the owner. See also `pass-orchestration-in-technique`.

### AP-138. output-without-destination

"`dependency_graph` and `prioritization_rationale` declared beside the ranking document whose sections they are"

A declared output has no reader.

**Detect:** For each `### <id>` under `## Outputs`, name where it lands: an `#### artifact` on the entry; a binding, remap, gate, `validate` target, or same-named input in a workflow that can bind the op; or `{id}` in the binding activity's message or checkpoint. Flag an entry with none, including one mentioned only as "return `{id}`", and one whose `variables[]` slot nothing reads. Test: the only reader is the worker's own report.

**Do not flag:** A library op, or one bound cross-workflow, whose callers sit outside the tree. An output consumed by a sibling `#### artifact` template on the same technique. A terminal product the binding activity actually surfaces.

**Fix:** A file takes `#### artifact` (`artifact-not-buried`, `artifact-name-is-filename`). A field of a sibling document is a `####` of that output. A later step binds it and declares the input. A human sees `{id}` from the binding activity (`session-interaction-in-technique`). Otherwise delete the declaration and the variable that shadowed it. The inverse is `technique-outputs-declared`.

### AP-139. framing-outside-any-section

"# Overview — operative prose a section citation never returns… [body before the first `##`]"

A resource carries operative prose in a span no `##` anchor reaches, while techniques cite that resource by section.

**Detect:** After stripping frontmatter and ignoring fenced blocks, the resource has at least one anchored citer, and either (a) the leading H1 carries substantial framing (roughly 100+ characters of body before the first `##`) whose only reachable anchor spans the whole file, or (b) prose sits before any heading. Mechanical: measure prose before the first `##` against the span of the leading H1 and against every `##` span. A section-scoped `get_resource` returns only the matched heading's span, so that framing is silently absent for every section consumer.

**Do not flag:** Orientation-only framing a section consumer does not need (record the verdict). Single-section resources with no anchored citers. Framing already under a named `##` that citers can request. Whole-resource citations where the consumer loads the full file (`whole-resource-for-one-section` Do-not-flag carve-outs).

**Fix:** Classify the framing — delete when it duplicates the citing technique; mint a `##` section (or move the obligation into the technique) when it is operative and unique; leave when it is orientation only. Cross-section deixis becomes an anchored link. See [A Resource Splits for Section Delivery](./design-principles.md#44-a-resource-splits-for-section-delivery) and [Cite Resources at Section Grain](./design-principles.md#32-cite-resources-at-section-grain). Related: `whole-resource-for-one-section`.

### AP-140. declared-input-never-read

"`### activity_id` and `### session_index` declared, with no phase naming either"

A technique declares an input its own Protocol and Rules never reach, so the bind contract promises a value the technique cannot spend.

**Detect:** For each `### <id>` under a technique's `## Inputs`, search that technique's `## Protocol` and `## Rules` for the id — braced as `{id}`, as `{id}.field`, or named bare inside a tool-call signature a phase passes. Flag an entry with no occurrence. Test: the only phase that spends the value is the declaration itself.

**Do not flag:** An input on a container `TECHNIQUE.md` that a descendant references after the merge. An input handed whole to an applied op as a substitution map or pass-through, where a phase references the map. An agent-entry technique's identity bindings — ids a spawn or continuation stub emits and the entry tools consume. An output no consumer reads (`output-without-destination`).

**Fix:** Reference `{id}` from the phase that spends it, or delete the declaration. Where the value belongs to an op this technique applies, pass it at the Apply site (`apply-omits-declared-input`).

### AP-141. apply-omits-declared-input

"Apply [continue-agent] with the composed prompt"

A Protocol Apply passes some of the applied technique's declared inputs and omits others, so the applied op runs on whatever the bag happens to hold.

**Detect:** For each Protocol `Apply` or `::` invocation, resolve the target's `## Inputs`, including any merged from its container. Flag a required input the Apply site neither passes nor covers by a declared `default`, and that no same-name slot on the applying technique makes ambient. Test: a required slot of the target is absent from the Apply line and from the applying technique's own contract.

**Do not flag:** An input the target marks optional or backs with a `#### default`. An input the applying technique declares under the same id. A container-merged input the whole group shares. An activity `steps[]` bind. An agent-entry technique naming the techniques of a loop whose activity YAML is the bind site (`prompt-restates-owned-mechanics`).

**Fix:** Name the omitted input at the Apply site. Where the value has no home on the applying technique, declare it there first, then pass it. A slot declared and never passed on is `declared-input-never-read`.

### AP-142. branch-on-undeclared-threshold

"When the worker does not return within the expected time"

A Protocol branch conditions on a magnitude nothing declares, so the agent cannot evaluate it and either supplies its own limit or never takes the branch.

**Detect:** A Protocol branch, `>` note, gate, or rule conditions on a duration, size, count, or limit — "within the expected time", "if it takes too long", "when the payload is large", "after enough retries" — that no declared input, `#### default`, workflow variable, policy resource row, or tool-surface field supplies. Test: nothing in the contract or the harness surface holds the value the agent compares against.

**Do not flag:** Thresholds the harness or server owns and reports (`autoAdvanceMs`, a budget returned on a response). A branch on a declared input's value. Qualitative branches carrying no magnitude — "fewer steps than the activity defines" is countable from the definition the agent already holds.

**Fix:** Declare the threshold and compare it by designator — a technique input with a `#### default`, a workflow variable, or a row in the owning policy resource. Where no owner can supply it, delete the branch and rebuild any behaviour it guarded on a condition the agent can observe. See [Encode Constraints as Structure](./design-principles.md#9-encode-constraints-as-structure).

### AP-143. inherited-rules-re-enumerated

"Honor no-get-activity-from-orchestrator, no-pre-load-techniques, delivery-keys-on-agent-context, …"

A rules entry cites rules another file owns and the reader already receives, so it tracks a section it does not own.

**Detect:** A `## Rules` entry (or `rules.*` string) whose body is a citation, or a list of citations, to rules declared elsewhere, and the reader already receives those rules — by container merge, by the techniques bundle, or by a sibling entry that commands following that set. Compare the list with the cited home's roster. Flag when the home holds a rule the list omits; when the entry states nothing the cited rule does not; when the entry is a subset of an obligation a sibling already states; or when the entry reuses the cited rule's name or a near-variant, so the shortened dotted address is ambiguous. Test: adding a rule to the cited home leaves this entry incomplete, or removing the entry changes no behaviour.

**Do not flag:** A pointer that narrows or qualifies the cited rule — a scope restriction, a threshold, an exception the cited rule does not state. Container `TECHNIQUE.md` Rules the loader merges into descendants. A prohibition citing the home that owns the behaviour it forbids (`no-rule-protocol-restatement`). README index tables (`readme-orients-not-transcribes`). Capability op inventories (`capability-as-op-inventory`).

**Fix:** Delete the enumeration and rely on the entry that already commands the inherited or bundled set. Where one rule needs reach across a group boundary, hoist that invariant to the smallest common container so the loader delivers it. Carry over any clause the deleted entry held that no other surface states. The Inputs-side fault is `inherited-input-re-declared`. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-144. reference-without-provenance

"the activity `id` already returned by `get_activity`" / "the commit for that activity has already landed"

A reference does not resolve to one source, so the reader cannot tell which value is meant or whether producing it is their job.

**Detect:** For each prose reference to a value, a tool result, or a completed action, name the construct that supplies it — a declared input or output on this technique, a workflow variable, an earlier phase of this Protocol, a resolvable link, or a field a named call returns. Flag when nothing supplies it, and when the named kind is one the context holds several of. Passive wording is the tell: "already returned by", "as returned", "has already landed", or "carry it to X" where no phase applies X.

**Do not flag:** A reference whose target is declared but wears the wrong form (`anchored-protocol-references`). A needed value absent from `inputs[]` (`technique-inputs-declared`). A vague noun for a declared output (`brace-output-references`). Magnitudes (`branch-on-undeclared-threshold`). Anaphora for a noun already anchored once in the same step. A precondition another technique guarantees, where the step names that technique.

**Fix:** Name the supplier — the phase that produces the value, the call that returns it, or the technique that guarantees the action — or declare it and reference the designator. Where nothing supplies it, delete the reference. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-145. pre-session-prose-defers-to-the-framework

"Derive the repository by applying [resolve-host-repo](…)" in the bootstrap procedure / `resolve-host-repo.prose-sources-are-fallback-only`

Bootstrap prose sends the reader somewhere they have no way to go.

**Detect:** On a surface delivered before a session exists — the `discover` bootstrap procedure — a relative corpus link, a dotted rule address, or an instruction to apply a technique, where the substance is not also in the text. Without a session index there is no `get_resource` and no `get_activity`. Test: strike every reference; an instruction that stops being executable was never executable.

**Do not flag:** An MCP resource URI the text tells the client to fetch directly. A canonical name carried as a label for the home a rule keeps later, where the text says the reference is for after the framework arrives and nothing depends on following it now. Prose that restates a contract owned elsewhere (`prompt-restates-owned-mechanics`).

**Fix:** Inline the instruction's substance and keep the name only as a forward label. On this surface that overrides `dotted-rule-address`. See [Pre-Session Prose Stands Alone](./design-principles.md#33-pre-session-prose-stands-alone).

### AP-146. instruction-narrates-an-actor

"The next activity reaches this context only as a continuation stub the orchestrator sends after continue-batch has advanced the pointer" / "The orchestrator applies commit-and-persist for the activity just finished before reaching this technique"

A rule, Protocol step, or I/O description describes an actor instead of instructing its reader.

**Detect:** For each rule, Protocol step, I/O description, Capability sentence, README orientation line, and option or action text, name the actor the surface is delivered to. Where a surface reaches more than one — a container `TECHNIQUE.md` merged into its descendants, or `rules.universal` — flag a clause only some of those actors can act on. Flag a clause that narrates a second actor's behaviour, state, techniques, or limitations, which the reader can neither observe nor act on, and a clause that states the reader's own duty in the third person. Test: strike the clause. Where it named a second actor, flag it if the instruction is still complete. Where it named the reader in the third person, flag it if what remains no longer tells the reader to do the thing. A clause already addressed to the reader that repeats an imperative is not this fault.

**Do not flag:** A duty stated as outside the reader's, with no account of who holds it. A value the reader takes from its own tool responses. A precondition the reader can check. The contract the reader itself applies, on the surface that owns it. An actor role carried as data a stub or manifest binds. Prose restating a contract owned elsewhere (`prompt-restates-owned-mechanics`). A rule whose only defect is its bucket (`rule-audience-bucket`). One that is mis-filed and narrating is both.

**Fix:** Address the reader. Where the clause carried a duty of the reader's, restate it as an imperative. Where it described another actor, restate the reason from the reader's own position or delete it. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-147. rule-binds-beyond-its-operation

"`sync-progress-status` is the only writer of Progress status — not a per-activity YAML step, not a client-workflow activity rule, not a worker duty" on a persistence technique's `## Rules`

A technique's rule states policy over a subject the technique does not own, so it binds readers who never apply it.

**Detect:** For each `## Rules` entry, name the subject it constrains and ask whether the technique performs or produces that subject. Flag an entry whose subject outlives it — a sole writer, owner, or home named for something the technique only contributes to, or a duty assigned to an actor the entry is not delivered to. Test: strike the technique from the sentence; where the claim still binds somebody, it is policy, and its home is the surface that owns the subject.

**Do not flag:** A prohibition or conformance statement addressed to the reader — a worker rule barring a worker's own call, an adapter rule naming the only conforming form of its own dispatch. An invariant on the technique's own cadence, outputs, or the composition of what it writes. A one-line pointer to the surface that owns the policy. The same claim held in both places (`no-technique-resource-dual-home`). Operational cadence filed in a resource (`resource-fills-not-does`).

**Fix:** Move the claim to the surface that owns the subject, widen that statement to cover whatever the rule uniquely carried, and delete the rule where nothing operation-specific remains. Cite the owning surface from the phase that needs it. Where no surface owns the subject yet, `operative-criteria-need-a-home` names the migration. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-148. inherited-input-re-declared

"`### planning_folder_path` on a leaf whose workflow-root `TECHNIQUE.md` declares it already"

A leaf redeclares an input a container contract merges into it, so one bind slot carries two descriptions and each is edited without the other.

**Detect:** For each `### <id>` under a technique's `## Inputs`, resolve the contracts the loader merges into that file — its group `TECHNIQUE.md` and the workflow-root `TECHNIQUE.md` — and flag an id an ancestor already declares. The merge supplies the slot before the leaf is read. Where the leaf's wording narrows the value to that one technique, a caller binds against the ancestor's contract while a reader takes the leaf's, and neither is marked as the one that governs.

**Do not flag:** A leaf entry that changes the bind contract — a differing `#### default`, or an optionality the technique needs. An id an ancestor carries only under `## Outputs`. Container `TECHNIQUE.md` files, whose declarations exist to be inherited. An input several leaves share that no common ancestor declares (`hoist-shared-inputs`).

**Fix:** Delete the leaf declaration and let the merge deliver it; Protocol goes on referencing `{id}`. Where the leaf's wording held something the ancestor's lacks, widen the ancestor once, then delete. The Rules-side counterpart is `inherited-rules-re-enumerated`. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-149. schema-semantics-restated

"A `when` gate takes the operators `==`, `!=`, `>`, `<`, `>=`, `<=`, with `()` binding tighter than `!`"

Definition prose restates what a schema field means, so the schema and the prose each state the contract.

**Detect:** Technique Rules, Capability, or resource prose states a field's semantics rather than using the field: an operator or value roster the schema enumerates, a field's default or optionality, a co-declaration requirement ("a soft gate declares both"), a validation outcome ("a mismatch is stored as written"), or a mapping from a construct to the fields that express it. Test: the sentence would need editing by whoever edits the schema, and a reader could read the same fact off the schema resource the server serves.

**Do not flag:** A definition that uses a field and names it in passing ("gated on `is_review_mode`"). Prose whose subject is the schema — the schema resource, the construct inventory, an authoring guide teaching the constructs. An engine technique that states a contract the schema does not carry, such as which agent may resolve a gate. A rule that constrains an authoring choice among valid shapes (`overlapping-rule-scopes`).

**Fix:** Delete the restatement and let the field carry it; where prose needs the fact, cite the schema resource once. Where the schema cannot express the fact, declare it in the schema first, then delete the prose (`value-set-in-prose`). See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

### AP-150. engine-internals-narrated

"The server writes `session.json` and its `.session-token` seal atomically on every authenticated call"

An engine technique describes where the server keeps its state or how it does its work, delivered to an agent whose only reach is the tool surface, so the passage cannot be acted on and drifts from the implementation unread.

**Detect:** An engine or agent-entry technique names a server-internal — a file the server owns, a storage layout, a seal or hash scheme, an internal function or module, a persistence or caching step — where the reader's action is unchanged by knowing it. Test: delete the passage; if every call the reader makes and every value it passes stays the same, flag it. The engine carve-outs (`no-tool-usage-prescription`, `no-engine-mechanics-as-rules`) license naming the *calls* a reader makes, not the internals behind them.

**Do not flag:** A fact the reader acts on, even when it names an internal — a path the agent must write to, a field it must pass back, a failure it must recognise. An invariant that binds the reader's own behaviour ("a marker is unreadable to a context that never received the bytes"). Server-side source comments and `docs/`. A tool's declared parameters and returns.

**Fix:** Delete the narration; keep the call, the value and the obligation. Where the mechanism explains a constraint the reader must honour, state the constraint as the invariant and drop the machinery. See [Document in Positive Present](./design-principles.md#17-document-in-positive-present).

### AP-151. value-set-in-prose

"`analysis_type`: 'completion' (continuing previous work) or 'context' (new initiative)"

A variable's admitted values are enumerated in a description while the declaration leaves them open, so the set's only home is a copy of whichever producer's option ids the author had in front of them.

**Detect:** A `variables[].description`, a technique I/O description, or resource prose enumerates the values a declared variable takes — a pipe-separated roster, a quoted list, an "either … or", or option ids glossed one by one — and the declaration carries no `values`. Test: if adding an option to the producing gate would leave the prose wrong and nothing would fail, flag it.

**Do not flag:** A declaration that carries `values`, whose description names what the variable holds without repeating the members. A shape hint that is not a value set (`{ id, statement }`). A set the schema cannot hold — a non-string variable, or values a run computes rather than an author enumerates. Prose whose subject is the set, such as the gate options themselves.

**Fix:** Declare the set as `values` on the variable and cut it from the prose. Leave a description of what the value holds and what its absence means. Where two declarations of the name disagree on the set, the load refuses them. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home); also `variable-description-one-line`.

### AP-152. one-invariant-per-rule

"Each instance materialises its own checkout … **It is declared per member and it is uniform within one.** … Reach for it only where per-unit attribution is the point."

One `## Rules` entry states several constraints, so no part of it can be cited or edited without carrying the rest.

**Detect:** A `## Rules` entry whose body divides into parts that each state a constraint citable on its own and editable without the others. Signals: a bolded sentence-lede opening a paragraph inside the body; a length far outside the other entries in the same file; consecutive paragraphs whose subjects differ. Test: the invariant takes several sentences and none entails the others. One entry is one finding, however many constraints it holds.

**Do not flag:** A single constraint stated with the failure mode that makes it matter. Paragraphs or bullets elaborating one constraint across the cases it covers, each case subordinate to the named invariant. Length alone settles nothing. A rule scoped to one protocol step (`no-one-step-rules`). One invariant with two homes (`single-rule-authority`). Two entries whose triggers intersect (`overlapping-rule-scopes`).

**Fix:** Give each constraint its own entry, named for the invariant it states. Demote cost guidance and hazards to a `>` caveat on the rule they qualify (`constraint-as-blockquote`). Delete any part whose claim another surface already owns — a schema field's description, a load-time refusal, another technique's rule (`schema-semantics-restated`, `rule-binds-beyond-its-operation`). See [A Rule States One Invariant](./design-principles.md#45-a-rule-states-one-invariant).

### AP-153. call-omits-conditionally-required-argument

"`next_activity { session_index, activity_id, step_manifest }`, against a tool that refuses the call whenever the session holds an open activity"

A Protocol writes a call signature without an argument its schema marks optional and its server demands in the state that Protocol arrives in, so the call is refused at run time and the caller improvises a repair the definition never specified.

**Detect:** For each tool call a Protocol phase or Rule writes as a signature, read the tool's description and its refusal text for a state in which an optional argument becomes required. Name the state the technique is in when it reaches that call. Flag a signature the tool refuses from that state. A schema check settles nothing: both the executable call and the refused one satisfy it.

**Do not flag:** An argument the schema requires outright (`call-omits-required-argument`). A signature the text marks as partial — an ellipsis, a spread, or one argument named because it is the argument under discussion. An argument the tool accepts either way in every state the technique reaches. The conditional obligation itself, in the signature or in a phrase naming which calls must pass it (`tool-contract-restated-in-protocol`).

**Fix:** Name the argument in the signature, and declare the value as an input where the technique takes it from its caller. Where the technique reaches the call in both states, mark that input optional and state the state that leaves it unset. The operation-to-operation form is `apply-omits-declared-input`.

### AP-154. call-omits-required-argument

"`record_usage { session_index, activity, usage }`, against a tool declaring a fourth parameter as required"

A Protocol writes a whole call signature without an argument the tool's schema declares required, so the technique describes a step no run can take.

**Detect:** For each tool call a Protocol phase or Rule writes as a whole signature, compare the arguments it names against the parameters that tool declares required. Flag every required parameter the signature does not name. A signature is whole unless its own text marks it partial. Test: the call the signature stands for is one the tool refuses before its handler runs.

**Do not flag:** A signature the text marks as partial — an ellipsis, a spread, or one argument named because it is the argument under discussion. A call to a tool the corpus does not register. An argument required only in a state the schema cannot express (`call-omits-conditionally-required-argument`).

**Fix:** Name the argument in the signature, and declare the value as an input where the technique takes it from its caller. Where the omission traces to a parameter the tool gained after the technique was written, sweep every call the corpus describes to that tool (`stale-restatement-after-change`).

### AP-155. call-names-an-undeclared-argument

"`start_session { session_index, agent_id }`, against a tool declaring no session parameter"

A Protocol writes a call signature naming an argument the tool does not declare, so the call is refused where that schema rejects unknown keys and the value is dropped in silence where it does not.

**Detect:** Compare every argument a described signature names against the parameters the tool declares, whole signature or partial alike. Flag each name the tool does not carry. Where the argument sits on a nested object the tool declares, read the name at that level. A renamed or withdrawn parameter and a name that was never one fail the same way.

**Do not flag:** A call to a tool the corpus does not register. A response field the prose names alongside the call.

**Fix:** Delete the argument, or correct it to the name the tool declares. Where it names a parameter the tool once carried, sweep every call the corpus describes to that tool (`stale-restatement-after-change`).

### AP-156. protocol-phase-as-list-item

"`1. **Engineering commit + push:** Commit ALL changes under .engineering/…`"

A Protocol phase is an entry in a flat numbered list, so it has a number and no section of its own.

**Detect:** A technique `## Protocol` holds its phases as `N. …` list entries rather than `### N. Title` sub-sections. A bold lead such as `**Engineering commit + push:**` is the same fault: it names the outcome and leaves the phase with no heading, so nothing can anchor to it and the name renders as emphasis. A file mixing the two spellings is flagged the same way. Test: a citation of this one phase has only the whole technique to link to.

**Do not flag:** Bullets, notes, and sub-bullets under a phase. A `## Rules` entry. Ordered sub-steps inside one phase's body.

**Fix:** Give each phase a `### N. Title` heading naming its outcome, and move its work to bullets beneath. A bold label already present is the title. A phase whose outcome cannot be named is `rule-as-protocol-step` or `constraint-as-blockquote`. Heading length and composition are [A Phase Heading Names the Outcome](./design-principles.md#39-a-phase-heading-names-the-outcome).

### AP-157. unreachable-operation-reference

"never [continue-agent](../harness-compat/continue-agent.md) on a prior worker" in a rule / "the commit it was built at sits in the inventory [resolve-graph](./resolve-graph.md) reads" as a Protocol aside

A technique names another technique without invoking it, sending its reader somewhere that reader cannot go.

**Detect:** A technique file names another technique or technique — in Capability, Protocol, or `## Rules` — by a markdown link to a technique file or by a `::` address, and no work is invoked: a rule naming the instrument for a question or forbidding one, a Protocol aside citing where a fact lives, a documentation or canonical-form reference. Test: what the reader does with the name needs a file the delivery did not carry.

**Do not flag:** A reference that invokes work (`pass-orchestration-in-technique`). A technique reference in an I/O contract (`technique-ref-in-io-contract`). READMEs and other orientation surfaces that run no protocol. Resource citations, which travel with the technique citing them. A bare technique id where the slot's value is a technique id, with no navigable link. A raw tool name a remedy step must run unaided (`canonical-technique-reference`).

**Fix:** State the fact the reference stood for, without naming the technique. Where it carried a standing choice of instrument, move it to the container technique that holds both techniques, phrased so it needs no reference. Where it carried sequencing, the run binding both techniques owns it. See [A Technique Names Only What Its Reader Holds](./design-principles.md#36-a-technique-names-only-what-its-reader-holds); also `pass-orchestration-in-technique`, `anchored-protocol-references`.

### AP-158. produce-path-without-a-reading

"1. Call `<tool> { … }` and record the `{report}`." as the whole Protocol

A technique's Protocol is the tool's own call and nothing else, so the technique contributes no reading the raw response does not already give.

**Detect:** A technique `## Protocol` whose phases reduce to invoking one tool, or reading one resource, and recording the response under a declared id, with no phase that interprets, bounds, or qualifies the answer: no statement of what the response omits or caps, no derivation, no verdict, no recovery for an unexpected answer. Test: what a reader gains beyond the tool's own schema is only a variable name.

**Do not flag:** A reading that lives in a declared Output description or a `## Rules` entry. A wrapper whose contribution is the argument shape it fixes for one named question. A compose step that assembles a value another step consumes. A Protocol that carries the tool's argument structure (`tool-contract-restated-in-protocol`).

**Fix:** Add the phase that reads the answer — what it caps, what it omits, what an empty result means, what the recovery is. Where no such reading exists, retire the technique and bind the tool at the run that needed it. See [A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading).

### AP-159. construct-folder-without-a-readme

"`<workflow>/techniques/<group>/` holding four technique files and no `README.md`"

A construct subfolder carries definitions and no README, so nothing orients a reader who arrives at the folder rather than at one of its files.

**Detect:** A folder holding construct files — a workflow's `activities/`, `techniques/`, `resources/`, `routines/`, or a group folder beneath one — with no `README.md` beside them. A completeness verdict names the folder list it measured.

**Do not flag:** A folder holding only a README. A specimen, fixture, or conformance tree whose purpose is to exercise one construct. A folder whose parent README already enumerates its contents at file grain (`readme-orients-not-transcribes`).

**Fix:** Add a README stating the folder's purpose, what its members have in common, and where a reader goes next. The index points at the files and does not restate them. See [Complete Documentation Structure](./design-principles.md#11-complete-documentation-structure).

### AP-160. relocation-without-a-preserved-outcome

"a re-probe duty moved out of a technique's prose into a gated activity step, with nothing writing the flag its consumers read"

A duty moves to another home and neither home names the outcome the move had to keep, so the behaviour is gone while every file still reads correctly on its own.

**Detect:** On a change surface, a gate, an exit, a bound technique, or a rule that the base ref carried at a site is absent there, and an equivalent construct appears elsewhere. Flag where neither site states the outcome, option, input, or audience the move preserves, nor the check that confirms it. Test: what the move had to keep, and where that is recorded, exists only in the reviewer's head. A relocation reads clean file by file, so a per-file walk never reaches it.

**Do not flag:** A removal the change states as a removal. A receiving site that declares the same output, gate, or artifact the losing site did. Surviving prose still asserting the old behaviour (`stale-restatement-after-change`).

**Fix:** At the receiving site, state the outcome that still has to hold and the check confirming it — a declared output the consumers read, a gate on the same variable, an artifact at the same path. Where the move retires the behaviour, say so where the behaviour was. See [A Relocation Records the Outcome It Keeps](./design-principles.md#38-a-relocation-records-the-outcome-it-keeps).

### AP-161. unproducible-declared-value

"`unanswerable` where the member has neither instrument to ask" on an output, under a phase setting that same field to `none` wherever neither instrument found anything

An output's contract admits a value no Protocol path leaves standing, so the vocabulary promises a reading the technique cannot give.

**Detect:** For each value a technique's `## Outputs` enumerates — on an entry, a component, or a nested field — name the phase that leaves it standing when the run ends. Flag a value whose assigning phase is followed by a phase that reassigns the same field over a population that includes those subjects, and a value no phase assigns. Test: as the last phase completes, a later phase's own criteria settle that subject's field. Each phase can be correct alone; only their order is wrong.

**Do not flag:** A value a later phase's criteria exclude, by a condition naming the subjects the earlier phase settled. A value the tool supplies in its own response. A value the contract admits and no available fixture exercises — record it unevidenced and leave the declaration. A value set whose only home is prose (`value-set-in-prose`).

**Fix:** Scope the settling phase to the subjects it judges, so a value an earlier phase recorded survives. Where no path can produce the value, delete it and fold what it distinguished into a value that has a path. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure); a whole output with no home is `output-without-destination`.
