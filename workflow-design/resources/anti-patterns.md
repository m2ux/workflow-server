---
name: anti-patterns
description: Specific smell instances in authored workflow content — Detect / Do not flag / Fix. Covering stance lives in design-principles.
metadata:
  order: 2
  legacy_id: 2
---

# Overview

This catalogue lists **smells**: specific instances of bad patterns already present in authored workflow content. Each entry is a Detect / Do not flag / Fix test an auditor applies after the fact.

[Design principles](./design-principles.md) hold the broader *prefer / before* stance that avoids these smells and related failures. One principle may cover many entries (and smells not yet catalogued). This file does not host positive authoring primers.

## Creation Rules

Rules for authoring and maintaining entries in this catalogue.

### Smell not stance

An entry names and detects one observable defect instance. Do not encode prefer/before stance, style primers, or family-wide essays here — those belong in [design-principles](./design-principles.md) (or a convention resource). Fix may cite the covering principle; Detect must not be the sole home of the positive form. Entry **name** identifies the smell (`avoidance-voice-in-definitions`), not the stance (`documentation-voice-positive`, `prefer-…`).

### Entry identity

Each entry is a subsection titled `### AP-XX. name` — monotonic **AP-XX** designator (file order, zero-padded) plus kebab-case smell **name**. Cross-references use the name in backticks (e.g. `bound-step-no-description`) — stable if the list is reordered. Do not cite bare historic numbers, and do not cite the catalog's entry count (it drifts).

### Audit technique boundary

Audit techniques load this resource and apply each subsection in place — they must not restate per-pattern detect/fix logic.

### Entry prose audience

Write for an audit agent scanning under scrutiny, not for case-law.

### Entry intro

Each entry opens with exactly two lines: (1) a quoted anti-pattern exemplar; (2) one framing sentence naming the failure mode (include any detail that would otherwise need a gloss). No parenthetical glosses on the exemplar line and no `>` notes under it. A blank line separates the intro from the Detect triad.

### Detect triad

Every entry has **Detect** / **Do not flag** / **Fix**, each on its own block, separated by blank lines. Detect states the structural mismatch; Fix states portable remediation (and may link a principle for the target stance).

### Keep audit signals

Keep observable Detect signals, false-positive carve-outs, and branched Fix order.

### Resist over-fit

Detect must state a **structural test** that transfers to a foreign workflow on the same schema — not the originating incident’s nouns, paths, tool roster, or paraphrase list. Concrete names belong on the exemplar line (and at most one illustrative example inside Detect); they must not be required matches.

Ban these Detect/Fix shapes:

- **Incident freeze** — phrase blacklists, filename/noun whitelists, or command/tool rosters that stand in for the test (“durable file subject without a path link”, not a planning-folder vocabulary).
- **Host coupling** — instructions that only apply to this catalogue’s authoring loop or a named host workflow (e.g. “when auditing workflow-design…”, Fix paths that name one repo’s canon files). Scope and remediation stay portable; the audit technique owns walk scope.
- **Taxonomy-as-Detect** — mini-frameworks or placement essays the auditor must re-derive. One observable mismatch per entry; longer taxonomies live in a convention resource and are cited.
- **Umbrella restatement** — re-teaching sibling Detect bodies. Point once; do not multiply findings for one bad sentence.
- **Smuggled rules** — a second prohibition buried under an unrelated `name` (split or delete).

Fix states the portable remediation (delete, migrate, encode, rename). Repo-specific destinations are examples, not the rule.

Before adding or expanding an entry, ask: would this still fire correctly on a different workflow that never saw the originating bug? If not, rewrite the test.

### Cut provenance ballast

Cut provenance and narrative ballast: audited counts, session-trace asides, historical supersession notes, mnemonics-as-essays, and cross-sermons that restate sibling entries.

### Sibling cross-references

Cross-references name the sibling (e.g. see also `io-agnostic-contract`) without re-teaching it.

### Delete-if-no-loss

If deleting a sentence loses no Detect, carve-out, or Fix step, delete it.


# Catalog

## Structural Anti-Patterns

File and packaging smells: inlined content, schema workarounds, partial scope, invented naming.

### AP-01. no-inline-content

"Let me just inline that"

Content is embedded in a parent file instead of living in its own file.

**Detect:** An activity, technique, or resource body is inlined into a parent YAML/markdown file (or a new construct is authored inline rather than as a sibling file).

**Do not flag:** Short inline literals that the schema requires on the parent (e.g. a one-line `description:` field); hyperlinks to separate files.

**Fix:** Extract into its own file under the correct directory; replace the inline body with a reference/bind the schema expects. See [Modular Over Inline](./design-principles.md#21-modular-over-inline).

### AP-02. schema-is-constraint

"Let me adjust the schema to match"

The schema is bent to fit content instead of content being fixed to the schema.

**Detect:** A change proposes altering workflow/activity/technique schema (or inventing fields) so existing content validates.

**Do not flag:** Legitimate schema evolution requested explicitly by the user as a separate task.

**Fix:** Rewrite content to conform to the current schema; never patch the schema to match a one-off authoring choice.

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

## Interaction Anti-Patterns

Session-conduct smells: combined checkpoints, assumed intent, skipped scope re-verify, multi-question turns. Runtime `rules:` hosting design-time canon is `runtime-rules-only`; checkpoint message form smells are under Output Economy.

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

## Schema Expressiveness Anti-Patterns

Prose standing in for a formal construct: checkpoint, loop, decision, artifact, variable, mode-as-state, or pure technique binding.

### AP-09. checkpoint-not-prose

"Ask the user whether to proceed"

A user decision is written as prose instead of a `kind: checkpoint` step.

**Detect:** Step/activity description (or protocol prose) tells the agent to ask/confirm/choose without a `kind: checkpoint` at that `steps[]` position.

**Do not flag:** Non-blocking informational messages (`action: message`) with no decision; decisions already modeled as checkpoints.

**Fix:** Add a `kind: checkpoint` with `message`, `options`, and `effects` at the decision point in `steps[]`.

### AP-10. loop-not-prose

"Repeat this for each item"

Iteration is written as prose instead of a `kind: loop` step.

**Detect:** Description/protocol says to repeat/iterate/for-each without a `kind: loop` (`loopType`, `over`, nested `steps[]`).

**Do not flag:** Truly one-shot steps; loops already declared in `steps[]`.

**Fix:** Replace the prose with a `kind: loop` step and move repeated work into the loop body.

### AP-11. decision-not-prose

"If X then do A, otherwise B"

Cross-activity routing is written as prose instead of an activity-level `decision`.

**Detect:** Prose describes branching to different activities/paths without an activity-level `decision` with `branches`/`conditions`.

**Do not flag:** In-step `when`/`condition` on steps; checkpoints that set variables consumed by declared decisions.

**Fix:** Declare an activity-level `decision` with branches/conditions; remove the prose branch recipe.

### AP-12. artifact-not-buried

"This produces a report"

Artifact production is buried in description instead of declared on technique Outputs.

**Detect:** A technique/activity claims to produce a file/report only in `description` (or similar prose) without a `#### artifact` on the producing technique's `## Outputs`.

**Do not flag:** Non-artifact outputs (variables, structured data) correctly declared as non-artifact outputs.

**Fix:** Declare `#### artifact` on the producing technique Outputs; do not hand-author activity `artifacts[]` (`no-hand-authored-artifacts`).

### AP-13. variable-for-approval

"Track whether the user approved"

Approval or mode-like state is tracked in prose instead of a typed variable.

**Detect:** Prose instructs remembering/tracking approval or similar state without a `variable` wired through checkpoint `effects`.

**Do not flag:** Ephemeral in-message acknowledgements that do not gate later steps.

**Fix:** Add a `variable` with `type`/`defaultValue` and set it from checkpoint effects; gate later steps on it.

### AP-14. mode-as-state

"In fast mode, skip the research steps"

Mode behaviour is written as rule/description text instead of ordinary state.

**Detect:** Mode-specific skip/branch behaviour appears only as rules or prose rather than a mode state variable (enum or boolean) plus `when`/`transitions[].condition` (and `skipActivities` where needed). Parallel boolean projections of an enum mode are `no-derived-state-shadow`.

**Do not flag:** One-off `when` conditions unrelated to a named mode.

**Fix:** Detect/set one authoritative mode variable early; express skips/branches as conditions on that state.

### AP-15. procedure-in-protocol

"First load the workflow, then get the activity"

HOW lives in the step description instead of the technique protocol.

**Detect:** Step `description` holds HOW — numbered audit criteria, sequenced procedure, or per-item iteration logic. HOW belongs in the assigned technique's `protocol` as numbered phases (`numbered-protocol-phases`); `description` is a one-line WHAT summary only.

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

**Detect:** A `kind: technique` or `kind: action` step that binds an op still carries `description` or `name`. Bound steps allow only `kind`, `id`, `technique` (string or `{ name, inputs, outputs }`), plus structural `actions` / `when` / `required: false`. WHAT/HOW live in the bound op's `## Capability` / `## Protocol`. Unbound procedure-in-description is `procedure-in-protocol`; once bound, description is removed entirely.

**Do not flag:** `kind: loop` may have `name` plus loop fields and nested `steps[]`. `kind: checkpoint` uses inline `message`/`options` and a stable `id` (not `name`/`description`). Checkpoints/loops are inline in `steps[]` — never `step.checkpoint` or separate `checkpoints[]`/`loops[]` arrays.

**Fix:** Bind an existing meta/workflow-local op when one fits and delete the description; otherwise enrich the op's `## Capability` / `## Protocol` and strip step prose. Even a one-line non-procedural WHAT is removed from the step. Resulting bound step = `id` + `technique` + structural fields only. For N steps that differ only by description, see `no-monolith-masking-steps`.

### AP-18. no-monolith-masking-steps

"N steps bind one technique and differ only by `description`"

Multiple steps bind the same op and differ only by description.

**Detect:** Several steps bind the same technique and differ only by `description` (or equivalent prose), with no distinguishing `when` / `actions` / input-output deviation.

**Do not flag:** Distinct structural attach points already expressed (checkpoint/`when` between phases); mutually exclusive `when` branches; distinct-purpose invocations at different pipeline points — see also `no-duplicate-technique-steps`.

**Fix:** (1) **Reuse** — bind an existing op and delete descriptions. (2) **Collapse** — consecutive same-technique steps with no intervening checkpoint and no structural deviation → one step. (3) **Split** — distinct phases → group with one op per phase; bind `technique: <group>::<op>`; delete descriptions. New techniques are last resort. Field purity on each resulting step is `bound-step-no-description`.

## Rule Hygiene Anti-Patterns

Rule smells: protocol restatement, audience mis-bucket, contradiction, one-step guidance, duplicated authority.

### AP-19. no-rule-protocol-restatement

"The rule restates the protocol"

A rule verbatim copies a protocol phase and adds no novel constraint.

**Detect:** A technique/activity/workflow rule restates a protocol bullet or phase without adding an invariant the steps do not already convey.

**Do not flag:** Rules that state cross-cutting constraints the protocol does not encode.

**Fix:** Delete the redundant rule; keep protocol as the procedural source.

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

"This rule appears in the technique AND the activity AND the workflow"

The same rule is duplicated across technique/activity/workflow levels.

**Detect:** The same *orchestrator-only* rule (variable management, transitions, commit policy, mode handling) — or a rule that does not need worker reach — appears at multiple levels (workflow → activity → technique). Cross-level copies drift.

**Do not flag:** Worker-directed behavioural rules that must stay reachable on activity/technique surfaces — see `worker-rule-reach`.

**Fix:** Keep one authoritative home at the level where the rule is enforced; delete the duplicates.

### AP-23. worker-rule-reach

"prefer gitnexus over grep" lifted to `workflow.yaml` / duplicated across techniques for worker visibility

A worker-directed rule is mis-placed where workers never receive it.

**Detect:** A behavioural rule workers must read is present only under `rules.workflow` (workers never receive `workflow.yaml`), or an audit flags per-technique copies of a worker-directed rule as hygiene violations.

**Do not flag:** Orchestrator-only rules (those belong under `single-rule-authority`). Correct placement: worker → `rules.activity` / technique `## Rules`; same directive for both actors → `rules.universal` (`rule-audience-bucket`).

**Fix:** Keep worker-directed rules on activity/technique (duplication across techniques is correct for reach). Do not lift them to workflow root. Consolidate only into a shared technique that every affected activity loads.

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

## Description Hygiene Anti-Patterns

Definition-prose smells: rationale, sequence narration, avoidance/comparative framing, mechanics, or vessel-named outcomes.

### AP-26. no-rationale-in-description

"Let me explain why this is here"

Description fields carry rationale, process narration, or structural restatement.

**Detect:** `description`, `message`, option/action descriptions, or procedure bullets explain why a construct exists, what consumes it, compare to prior impls, or restate facts already encoded by adjacent structure (`steps[]` order, `when`, effects, transitions, defaults).

**Do not flag:** One-line WHAT summaries that state what the construct does; structural fields themselves.

**Fix:** Delete rationale/narration/restatement; keep only WHAT that would lose a fact if removed. Put rationale in commits/ADRs/planning docs.

### AP-27. validate-message-economy

"Without X, Y will happen"

A validate message justifies consequences instead of stating cause + fix only.

**Detect:** A validate-action message includes trailing consequence essays after the failure cause and fix command.

**Do not flag:** Messages that are exactly `<what's wrong>. Run '<command>'.` (or equivalent minimal cause + fix).

**Fix:** Strip consequence paragraphs; keep cause and fix command only.

### AP-28. no-sequence-in-description

"Workflow X first does A, then B, then C"

Activity/step sequence is restated in description prose.

**Detect:** `description:` on workflow/activity/technique enumerates the sequence of activities, phases, modes, or steps already canonical in `activities[]`/`transitions[]`/`steps[]` (or the on-disk layout).

**Do not flag:** Purpose/value orientation that does not enumerate sequence; README orientation under `readme-orients-not-transcribes`.

**Fix:** Remove the sequence prose from description; rely on the canonical declaration.

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

**Fix:** Move role constraints into `rules:` on the owning construct (or drop if already present); leave description as WHAT.

### AP-31. no-hand-authored-artifacts

"`artifacts: - id: evaluation-report / name: EVALUATION-REPORT.md / location: evaluation`"

Activity artifacts[] is hand-authored instead of synthesized from techniques.

**Detect:** Activity YAML declares `artifacts[]`. Artifact contract is synthesized by the server from bound techniques' `## Outputs` (`#### artifact` filenames, activity-group-shorthand resolution). Hand-authored lists duplicate/drift from the single source of truth (`artifact-name-in-io`) and re-encode provenance the server already traces.

**Do not flag:** Non-file side effects (commit, PR) — not artifacts; simply not declared.

**Fix:** Delete the activity `artifacts[]` block. If a produced file is missing from the synthesized contract, add `#### artifact` (bare filename, `{token}` template, or discriminator-keyed note per `artifact-name-in-io`) on the producing technique's `## Outputs` — never back onto the activity.

### AP-32. outcome-names-value

"`EVALUATION-REPORT.md written with per-dimension findings…`" / "`Output directory created`" / "`dimension_plan … populated`"

An outcome names the vessel (file/variable) instead of delivered value.

**Detect:** Outcome names the mechanical act, not the VALUE delivered. Forbidden shapes: "`<file>` written/created" (artifact contract already encodes existence); re-listing artifact contents ("with findings…"); "`<var>` populated/set" (encoded by step `set`/`actions`). Test: outcome must still read true/useful if the file or variable were renamed — it names the value, not the vessel.

**Do not flag:** A mechanical name used only in service of the value it carries.

**Fix:** Rewrite as delivered value ("cross-dimensional risks evaluated and prioritised for go/no-go", not "EVALUATION-REPORT.md written…"); delete or fold pure-plumbing outcomes ("directory created", "variable populated").

### AP-33. no-set-of-technique-output

"`technique: …` + `set` of the technique's own product"

An activity set duplicates a bound technique's output.

**Detect:** Step has `technique` and a `set` whose `target` is a value the bound technique computes (assessment, classification, derived structure, artifact path). Bound-technique outputs already land via `variable-binding`; the `set` re-encodes them on the activity.

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

**Detect:** A bound step's `technique.inputs` interpolates a variable that the SAME step's `set` actions write. Inputs resolve at invocation; `set`s are side-effects with no before-input contract → ordering hazard / self-reference (input-side counterpart of `no-set-of-technique-output`).

**Do not flag:** A `set` whose `target` is NOT interpolated by that step's `technique.inputs` — scatter-gather gather (`no-set-of-technique-output` excl. a), value for a later step, or pure control-step orchestration.

**Fix:** Hoist the derivation to where its source is first established (or declare it as an earlier producing technique's output per `no-set-of-technique-output`); delete the `set` from the consuming step, leaving a pure binding.

### AP-36. techniques-list-disjoint

"`techniques: - workflow-engine::list-workflows …` with matching `step.technique`"

Activity techniques[] overlaps step technique binds.

**Detect:** An entry in activity-level `techniques[]` is also bound by any step (top-level or loop) via `step.technique`. Activity `techniques[]` is for cross-cutting STRATEGY/capability techniques (`variable-binding`, `scatter-gather`) spanning the whole activity — not per-step operations. Lists must be DISJOINT (see also `bound-step-no-description`).

**Do not flag:** Strategy techniques listed at activity level that no step binds. (Inverse smell — binding a cross-cutting strategy as a step operation — is separate; THIS fix always removes the activity-level duplicate.)

**Fix:** Remove every overlapping entry from activity `techniques[]`; keep only cross-cutting strategies; delete the block if none remain.

### AP-37. rule-audience-bucket

"`rules: workflow: - \"WORKER PERMISSIONS: Workers MUST write all artifacts directly …\"`"

A rule sits in the wrong rules.* audience bucket.

**Detect:** Classify each rule by who must act: orchestrator (`get_workflow` only), worker (`get_activity` inject), or both identically. Flag worker directives (write-immediately, no-permission-questions, blocker-surfacing, artifact-verification, lens-loading-by-worker) under `rules.workflow`. Flag orchestration directives (dispatch isolation, output forwarding, checkpoint cadence, orchestrator handoff) under `rules.activity`.

**Do not flag:** Correct placements — orchestrator → `rules.workflow`, worker → `rules.activity`, same directive for both → `rules.universal`.

**Fix:** Move to the bucket for the actor commanded. If one prose rule commands the two actors differently, split into two rules (orchestrator handoff vs worker load).

### AP-38. no-duplicate-technique-steps

"`steps: - id: map-findings / technique: compare-finding-sets …` (×N)"

N steps bind one technique without structural reason to split.

**Detect:** Two or more step definitions in one activity bind the same technique reference. Classify: (a) **redundant re-execution** — differ only by which already-produced output to surface → collapse to one step; (b) **unrolled iteration** — same op on N collection items → one `forEach` with one binding; (c) **monolith-masking** — distinguished only by a sub-mode input → split into a group with one named op per mode (`no-monolith-masking-steps`).

**Do not flag:** Fixed roster of distinct static targets with different structured inputs (not a clean iterable); mutually exclusive `when` branches (only one fires); distinct-purpose invocations at different pipeline points (initial vs final commit); same op as distinct phases inside one loop iteration.

**Fix:** Apply collapse / loop / split per classification; leave the exceptions above.

### AP-39. hoist-universal-techniques

"every activity carries `techniques: - variable-binding`"

A universal technique is not hoisted to workflow.techniques.activity.

**Detect:** A strategy technique appears on (nearly) every activity's `techniques[]`. Audience split mirrors rules (`rule-audience-bucket`): `techniques.workflow` = orchestrator (`get_workflow`); `techniques.activity` = inherited by every activity (`get_activity` inject). No `universal` bucket for techniques. Coverage discriminator: nearly-all → hoist; only some (e.g. `scatter-gather` on fan-out activities) → stay activity-local. Composes with `techniques-list-disjoint` (step-binding duplicates leave first).

**Do not flag:** Activity-specific strategy techniques used by only some activities.

**Fix:** Declare once under `workflow.techniques.activity`; delete from every activity `techniques[]`; drop emptied activity blocks.

### AP-40. readme-orients-not-transcribes

"README `### NN. Activity` + `Steps:**` / checkpoints table / transitions / `## Variables` / `## Rules` / estimated times"**

README transcribes YAML structure instead of orienting.

**Detect:** README enumerates in prose or tables: activity `steps[]` (including inline checkpoint options/`effect`/`autoAdvanceMs` and loops), `decisions[]`/`transitions[]`, per-step technique bindings, workflow `variables`, `rules`, or per-activity estimated times. Authoritative definition is `workflow.yaml` / `activities/NN-<id>.yaml`. Test: if the block must be edited when those YAML fields change, it is transcribing.

**Do not flag:** Mermaid/ASCII flow diagrams (activity- or step-flow); orientation the YAML lacks — PURPOSE, at-a-glance activity sequence (name + one-line role + connections), outcomes/value, file structure, techniques overview, links to authoritative YAMLs. A third checklist of which audit/technique passes run (drifting from activity binds) is `bind-site-is-orchestration-truth`.

**Fix:** Delete prose/table enumerations of steps/checkpoints/loops/decisions/transitions/bindings and Variables/Rules/estimated-time sections; KEEP diagrams and orientation. Readers open the YAML definition for the rest. See [Complete Documentation Structure](./design-principles.md#10-complete-documentation-structure).

### AP-41. avoidance-voice-in-definitions

"`Does not use inline content`" / "`Rather than X, the workflow now…`" / "`Never skip the checkpoint`"

Definition prose uses avoidance or comparative voice.

**Detect:** In workflow/activity/technique/resource *definition* prose (`description`, `outcome`, option/action descriptions, README orientation for the defined workflow — not planning artifacts), a passage states what the system avoids or how it differs from a prior/alternative design. Comparative/avoidance framing that must be edited when the "old way" is forgotten is the signal — not every English negation.

**Do not flag:** Planning artifacts under `artifacts/planning/` (evolution by design); true runtime constraints in `rules.*` / technique `## Rules` ("must not write secrets"); schema/condition operators; negative examples inside this catalogue; `validate` messages that name a misconfiguration and fix command (`validate-message-economy`).

**Fix:** Rewrite to current behaviour. See [Document in Positive Present](./design-principles.md#16-document-in-positive-present).

## Coupling Anti-Patterns

Contract and reference smells: caller-coupled I/O, wrong designator forms, delivery/tool narration, stage encoding in techniques.

### AP-42. io-agnostic-contract

"`fix_strategy` from [analyze-failure]"

An I/O id or description names a specific caller.

**Detect:** An input/output entry names or links a workflow-internal producer/consumer — another technique ("from [analyze-failure]", "produced by build-function-registry"), activity ("from the elicitation activity"), step, checkpoint, loop, or workflow/activity file. Describe what the value IS (meaning, shape, allowed values), never its position in a particular workflow.

**Do not flag:** Protocol/Capability utilisation ("use technique X", "go through cargo-operations::fmt-fix"); intrinsic/external origin ("git diff output", "the user's request", "provided by the server"); I/O links to a resource/template section (shape of the value).

**Fix:** Rewrite the entry generically; drop workflow-internal source/destination naming. See [Maximize Schema Expressiveness](./design-principles.md#4-maximize-schema-expressiveness) (portable I/O).

### AP-43. canonical-artifact-ids

"Read all open assumptions from `assumptions-log.md`"

Protocol cites a filename/path instead of a canonical I/O id.

**Detect:** Protocol references data via literal artifact filename/path, or I/O ids are path-flavored proxies (`assumptions-log-path` vs `assumptions-log`).

**Do not flag:** Filename literals correctly placed on `#### artifact` declarations (`artifact-name-in-io`); hyperlinked template nouns to resource sections.

**Fix:** Rename to canonical ids; cite `{id}` in Protocol; hyperlink artifact nouns to template sections without tool recipes (`no-tool-usage-prescription`).

### AP-44. artifact-name-in-io

"Create `NN-{package}-plan.md`"

A filename lives in Protocol instead of the I/O declaration.

**Detect:** Protocol prose names a concrete artifact filename (literal, or ad-hoc path) instead of a canonical Input/Output id. Fixed names belong as `#### artifact` literals; dynamic names as token-templates (`{package_name}-plan.md`); conditional names as discriminator-keyed notes on the I/O declaration.

**Do not flag:** Protocol references that already use `{canonical_id}` only. Opaque multi-file path arrays — see `no-opaque-artifact-path-array`.

**Fix:** Move the filename (literal, token-template, or discriminator-keyed note) into the I/O declaration; reference identifiers only in Protocol.

### AP-45. no-opaque-artifact-path-array

"`all-artifact-paths` / `*-paths` input holding many files"

An opaque path array stands in for named artifact inputs.

**Detect:** A technique consumes several artifacts via a single opaque `*-paths` (or similar) array that forces Protocol to name the files.

**Do not flag:** A single artifact with a token-template or discriminator-keyed name on one Input (`artifact-name-in-io`).

**Fix:** Split into individually named Inputs with canonical ids; Protocol references those ids only.

### AP-46. no-resource-caller-backlink

"Composed by [generate-summary]" / "produced by the X technique"

A resource backlinks or names its caller.

**Detect:** A resource (template, schema, guide, prompt, reference) names/links its host callers — techniques, activities, checkpoints, loops, or passes that produce, consume, enforce, or walk it. Signals: `"produced by the X technique"`, `"Composed by [X]"`, `"Used by…"`, "Used By"/"Referenced By" columns, technique/activity FILE PATHS as link targets / role-to-file tables, or bare host ids in Enforcement / "gated by" / "bound by" prose (`intake-and-context`, `expressiveness-confirmed`, `quality-review` anti-pattern pass). Reverse caller coupling breaks reuse (see also `io-agnostic-contract`, `bind-site-is-orchestration-truth`).

**Do not flag:** Forward dependency — the resource tells ITS READER to run a technique (prompt/instruction applying workflow-engine / agent-conduct); "see also" to another technique's content; generic technique-model/ontology prose (Goal → Activity → Technique); citations of sibling resources or catalog entry **names**. Test: producer/consumer/enforcer/caller of this resource → remove; technique the reader should run → keep.

**Fix:** Describe the resource by what it IS (Rule, template, vocabulary); drop caller/backlink/Enforcement inventories; move role→file and gate maps into the owning activity YAML or rendering technique. See [Maximize Schema Expressiveness](./design-principles.md#4-maximize-schema-expressiveness) (portable contracts).

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

**Detect:** Capability, Protocol, Rules, or non-engine resource prose prescribes how to invoke a harness/MCP tool — call name + "via"/"call"/"after", argument/param shape, or sequencing of tool calls (`get_resource`, `get_technique`, `get_activity`, `get_workflow`, `start_session`, `next_activity`, `list_workflows`, …). Agents already have independent tool/bootstrap guidance; restating it in techniques duplicates and drifts (`no-duplicated-guidance`).

**Do not flag:** `meta` workflow-engine / harness-compat / agent-conduct / bootstrap and orchestrator/worker prompt resources whose domain IS tool usage; an operation that wraps a raw tool may name that tool (`canonical-technique-reference` carve-out). Naming WHAT to consult via a markdown/`::` hyperlink without a tool recipe is correct.

**Fix:** Delete the tool recipe; keep the imperative and the canonical hyperlink or `{id}` ("Load [anti-patterns](path)"; "Apply the bound step's technique"). Role boundaries stay as role prose ("workers source definitions from orchestrator-provided context") — not as "do not call `get_workflow`".

### AP-51. canonical-technique-reference

"Use `gitnexus_context` on the symbol"

A raw harness tool name is used where a wrapping op exists.

**Detect:** Protocol names a raw harness/MCP tool for a capability that another technique wraps. Must use the canonical hyperlink (`[op](path)` or `[group](path)::[op](path)`), resolved by the server to `::`. Raw names couple to a harness and bypass the navigable reference model (also `consistent-tool-names`).

**Do not flag:** The operation that wraps the primitive — naming the raw tool IS that technique's purpose.

**Fix:** Replace the raw tool name with the canonical hyperlinked wrapping op; preserve arguments.

### AP-52. brace-declared-ids

"Examine target_path" / "for synthesis pass (index 23)" / "`reference_path`" / "`<files>`"

A declared id is used unbraced where a designator is required.

**Detect:** (a) bare declared id as plain words; (b) orphan enum/index value not tied to its input ("index 23"); (c) disguised id in backticks or `<angles>` without braces. Spelling must match the declared id exactly (`### problem_statement` → `{problem_statement}`). Forms: `{input_id}` / `{output_id}` / `{output_id}.field` / `{$local}`.

**Do not flag:** Ordinary English that only coincides with an id; backticked literals that are not declared ids (shell commands, filenames, tool params).

**Fix:** Brace as `{declared_id}`; for orphan values write "when `{declared_id}` is 23"; replace disguise wrappers with braces. Brace only when the token is used as a reference to that value.

### AP-53. dotted-rule-address

"per the gitnexus-operations index-freshness rule"

A rule is cited in prose instead of its dotted symbol address.

**Detect:** A protocol step cites/relies on a rule as prose ("per the X rule", "following the X rule") or with `::` (invokes a technique, does not name a rule). Also: prose citation of a rule that is not declared anywhere (dangling).

**Do not flag:** Correct dotted ancestry address — `[<workflow>.]<technique>.<rule-name>` (e.g. `meta.gitnexus-operations.index-freshness-first`). Shorten when in ancestry: omit workflow for same-workflow; bare rule name when inherited from self/group/workflow root. Full path only for rules outside current ancestry.

**Fix:** Replace prose/`::` with the dotted symbol address (shortened per ancestry). For dangling citations, point at the real inline content — never invent a rule. Mnemonic: `::` invokes, `.` names.

### AP-54. anchored-protocol-references

"Apply design framework to structure the approach"

A protocol reference has no resolvable target.

**Detect:** A protocol phrase refers to a declared I/O, rule, technique/op, or resource but does not use that kind's resolvable form (`{id}`, dotted rule symbol, canonical `::`/hyperlink, or resource hyperlink). Apply sibling form rules on the same walk (`brace-declared-ids`, `brace-output-references`, `canonical-artifact-ids`, `dotted-rule-address`, `canonical-technique-reference`, `bind-protocol-locals`) — do not re-teach them here.

**Do not flag:** Ordinary domain prose naming no formal artifact; anaphora for a noun already linked once in the same step.

**Fix:** Anchor the reference with the matching form, or reword. A reference with no real target is dangling — fix the target or drop it; never invent a link.

### AP-55. hoist-shared-inputs

"`### planning-folder` declared on every technique"

The same shared input is redeclared instead of hoisted.

**Detect:** The same input is re-declared on many techniques instead of once on the smallest common container (group or workflow-root `TECHNIQUE.md`; `composeLoaded` merges container I/O/Rules into descendants). Related smell: path-flavored id (`planning-folder-path`) — canonical id is the noun the value IS (`canonical-artifact-ids`). Synonym drift for one concept across leaves.

**Do not flag:** Niche inputs shared by only two or three techniques — do not push those to the root just to dedup.

**Fix:** Hoist the shared input to the container under one canonical id; delete per-technique declarations; reference `{id}` via inheritance. Hoist genuinely workflow-wide contextual inputs (artifact location, target path) even if some leaves never reference them. Producer/consumer values still hoist: shared input on ancestor + producing technique also declares it as output (input∩output, `snake-case-symbols`).

### AP-56. paren-invocation-args

"`gitnexus-operations::context {name: <symbol>}`" / "with target_dir in backticks beside a braced value"

Invocation argument names or lists use the wrong typographic namespace.

**Detect:** (a) A technique/operation invocation passes its argument list in braces (`::op {arg: value}`) instead of parentheses on the op reference. (b) An operation argument *name* appears bare or backticked (sharing the designator/code-token form) rather than italic. Test: the token names a parameter slot of the applied op, not a declared `{id}` value and not a literal path/command.

**Do not flag:** Brace objects that are not invocation arg lists (query/template/JSON payloads, raw tool-doc object shapes); italic emphasis that is ordinary English, not an op parameter name; correctly braced/backticked argument *values* (`backtick-code-tokens`, `brace-declared-ids`).

**Fix:** Align with [Distinguish Designators from Parameters](./design-principles.md#15-distinguish-designators-from-parameters).

### AP-57. escape-literal-dollar

"costs $0.05 per call" / "the $schema field"

A literal $ is unescaped in rendered prose.

**Detect:** Unescaped `$` in **rendered prose** outside fenced code blocks and inline code spans — prices (`$0.05`), `$schema`, shell `${VAR}` shown in text. GFM treats `$…$` as inline math; two unescaped `$` in one paragraph (or even one) can mis-render. Protocol variables are backticked (`backtick-code-tokens`), so their `$` is already math-exempt (do not use `{\$name}` outside code).

**Do not flag:** `$` inside a fence or inline code span (`` `${{ github.event… }}` ``, `` `git -C {$component_git_dir}` ``) — escaping would corrupt the code.

**Fix:** Backslash-escape every literal `$` in rendered prose (`\$0.05`); leave code spans/fences untouched. Displayed output stays `$`.

### AP-58. snake-case-symbols

"`check_status` output, `scope` input (case marks direction)" / "kebab symbol id that won't bind"

Symbol ids use the wrong case convention.

**Detect:** Symbol ids (inputs, outputs, sub-fields, `{$locals}`) in kebab/camel — they must be `snake_case` to bind to activity/condition/session state. Case used to encode input vs output direction. Rule/technique/resource/file/`::` targets wrongly snaked.

**Do not flag:** Tool/MCP/CLI param mirrors keeping the tool's exact spelling (`session_index`, `cloudId`). NAME class stays `kebab-case`: technique/operation/resource identities, hyperlink/`::` targets, and rule names (cited by dotted address, never evaluated). One snake symbol declared in both Inputs and Outputs when the value is input∩output (hoistable per `hoist-shared-inputs`).

**Fix:** Snake every symbol id; keep tool-param mirrors; keep kebab for names/rules; never encode direction in case — direction is the Inputs/Output section.

### AP-59. constraint-as-blockquote

"`  - If the PR has not merged, wait`"

A caveat is a protocol sub-bullet instead of a blockquote note.

**Detect:** A constraint that qualifies a SINGLE primary instruction — conditional caveat, fallback, error-path, or prohibition — is an indented sub-bullet (`  - …`). The protocol parser's step regex strips leading whitespace, so that line becomes a disconnected *peer* step.

**Do not flag:** Genuine enumerations or sequential sub-steps (per-harness branch tables, ordered sub-actions). Global/cross-step constraints belong in `## Rules` (`structure-backed-constraints`, `no-rule-protocol-restatement`). Single-block Rules misfiled as global — see `local-rule-as-note`. Distinct from `no-one-step-rules`.

**Fix:** Convert to a `>` note under the primary instruction (two trailing spaces on the primary bullet, then `> ` on the next line). A `>` line is not a step — it folds into the parent.

### AP-60. local-rule-as-note

"`## Rules` entry that scopes to only one protocol block"

A local caveat is filed as a global-looking rule.

**Detect:** A `## Rules` entry applies to only one protocol block/step rather than spanning the technique.

**Do not flag:** True cross-cutting technique rules; step-scoped caveats already under the instruction as `>` (`constraint-as-blockquote`). Distinct from `no-one-step-rules` (misfiled guidance → protocol prose, not necessarily a `>` note).

**Fix:** Demote the entry to a `>` note under the block it qualifies; leave workflow-wide constraints in Rules.

### AP-61. factor-repeated-paths

"`.engineering/artifacts/adr/` repeated four times"

A repeated path literal is not factored into a designator.

**Detect:** A filesystem path appears more than once in a technique (or across techniques) as a repeated literal, or a step hard-codes a path when a declared variable already exists.

**Do not flag:** Genuinely single-use literals; the one canonical literal at its definition site (input `#### default`, producer, or location rule); distinct values that merely look similar.

**Fix:** Factor repeated/shared paths into a defaulted input (or `{$local}` when derived); reference the designator; keep the literal only at its canonical definition. If the literal contradicts an existing location variable, correct the usage — do not mint a second path variable for the wrong location.

### AP-62. bind-protocol-locals

"`git -C {$component_git_dir} …` with no bind" / "`Maintain {$resolution_counts}` never read"

A {$local} is dead or unbound at the consumer.

**Detect:** (a) **Unbound local** — bare `{name}` that is not a declared I/O (nor ambient activity input such as `{target_path}` / `{branch_name}`) and has no `{$name}` bind in the protocol. (b) **Dead binding** — `{$name}` never read as `{name}`. Declare-once: `{$name}` only at the producing step; reads are bare `{name}` (backticked per `backtick-code-tokens`); bind textually before every read.

**Do not flag:** `{$name}` in each mutually exclusive producing branch (one runtime path). A `{name}` that is a declared I/O or ambient activity input — if it wore `$`, strip `$` (mis-marked local), do not add a bind.

**Fix:** (a) Name the value at the producer — `` `{$name}` `` inline (no "and bind it to…" narration). (b) Make the consumer read `{name}`, or drop a vestigial bind.

### AP-63. backtick-code-tokens

"`set worktree_created = true`" / "run 'git -C …'" / "fetch concept-rag://…"

A code token appears bare without backticks.

**Detect:** Bare-in-prose designators (`{id}`, `{$name}`, dotted rule addresses), CLI/shell (including 'single-quoted' commands), MCP tool calls, resource URIs (`scheme://…`), literal paths/filenames — outside an existing code span and not a markdown/`::` link target.

**Do not flag:** Tokens already inside a code span/fence; descriptive prose nouns ("the planning folder"); hyperlink/`::` targets; invocation argument *names* (wrong form is `paren-invocation-args`, not this entry). Fragmented spans (`` `git -C` `{x}` ``) are defects — must be one span. Backticks without braces still fail `brace-declared-ids` mode (c).

**Fix:** Wrap each bare code token in one backtick span (designators inside the same span as surrounding command text); convert 'single-quoted' commands; de-escape `{\$name}` to `` `{$name}` `` (math-exempt inside code; see `escape-literal-dollar`).

### AP-64. boolean-id-shape

"`…_flag` / `not_ready` / ambiguous boolean nouns"

A boolean id is not an affirmative predicate.

**Detect:** Boolean symbol ids use non-affirmative stems (`not_ready`, `no_merge`), generic-noun burials (`…_flag` / `…_status` / `…_check`), or ambiguous nouns. Shape ≠ meaning: inverted meaning still fails even if prefixed. Examples of conforming shapes: `squash_merge_supported`, `index_fresh`, `worktree_created`, `*_confirmed`.

**Do not flag:** Conformant unprefixed affirmatives; `is_`/`has_`/`can_`/`should_` only when the prefix sharpens an already-affirmative stem.

**Fix:** Rename to an affirmative predicate shape. See also [Name Symbols Affirmatively](./design-principles.md#18-name-symbols-affirmatively).

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

**Fix:** Rename; hoist one concept to one shared id (`hoist-shared-inputs`); drop representation/direction encoding from I/O ids. See also [Name Symbols Affirmatively](./design-principles.md#18-name-symbols-affirmatively).

### AP-67. rule-slug-shape

"`do-not-review-unresolved` / process-narration rule slugs"

A rule slug is negation or narration instead of a positive invariant.

**Detect:** Rule slugs that are bare negation, process-narration, or prohibited-state names when a positive invariant is at least as clear. Keep clear negations (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`). Rule slugs stay kebab (`snake-case-symbols`).

**Do not flag:** Clear intentional negations; NAME-class kebab identities that are not symbol ids.

**Fix:** Rename toward a positive invariant when clearer; keep kebab. See also [Name Symbols Affirmatively](./design-principles.md#18-name-symbols-affirmatively).

### AP-68. technique-stage-agnostic

"return to the planning stage" / "at the validate activity" / "present the … checkpoint" / "after each task, before confirmation" / "flag every removal for explicit confirmation with a diff-style view"

A technique encodes workflow stage, graph position, or a decision gate it cannot own.

**Detect:** Technique Capability/Protocol/Rules (a) mention stage/activity (named or "calling/consuming/producing activity"), checkpoint, loop/iteration, transition/decision routing, or position/timing in the activity flow ("after each task", "before user confirmation", "before the next step"), or (b) prescribe user confirmation, approval, or choice ("confirm with the user", "explicit confirmation", "require the user to…") as if the technique itself owns that gate. Test: if the sentence answers *where/when in the workflow?*, *which checkpoint surrounds me?*, or *how does the user decide?*, flag it. Techniques answer only *what value do I produce?* — gateable outputs and durable artifacts; activities own checkpoints that link those artifacts (`structure-backed-constraints`, `link-named-artifacts`).

**Do not flag:** Purpose-phrased work with no orchestration locus ("final validation", "no separate commit step follows"); values the technique emits for the activity to route (counts, paths, severity, recommended option id); inventoring decisions *into* an artifact the activity will gate on; bare present/surface-to-user with no stage or gate named (`session-interaction-in-technique`).

**Fix:** Migrate user-facing decisions to activity `kind: checkpoint` steps gated on technique outputs; migrate other orchestration to activity transitions/`when`/loops. Rewrite the technique to produce the durable evidence (artifact section, count, path) without naming the gate. See [Keep Orchestration in Structure](./design-principles.md#19-keep-orchestration-in-structure); also `no-activity-prose-rules`, `session-interaction-in-technique`.

### AP-69. no-activity-prose-rules

`rules: ["Manual diff review is FIRST", "all reviews must complete before validate"]` (prose rules at the activity level)

An activity carries prose rules: instead of pure mechanics.

**Detect:** Any activity-level `rules:` entry. Activity is pure mechanics — constraints live in `steps[]` order, `when`/`condition`, transitions, decisions, checkpoints, loops — not prose.

**Do not flag:** N/A — activity `rules:` should be empty; behavioral guidance belongs on bound techniques.

**Fix:** (a) restates structure already enforced → **delete**; (b) technique-behavioral constraint → **migrate** to the owning technique (`single-rule-authority`); (c) genuine unenforced constraint → **encode** as `when`/`condition`, transition, decision, checkpoint, or `required: false` (hard gates use `when`/`condition`; step `required` is a worker hint only). End state: no activity `rules:` block. See [Keep Orchestration in Structure](./design-principles.md#19-keep-orchestration-in-structure).

### AP-70. capability-group-placement

"Reusable primitive trapped in a client workflow" / "cross-consumer capability buried under one activity name"

Technique folder/name disagrees with shape-origin (reuse boundary vs activity seam).

**Detect:** A technique's directory or name encodes the wrong locus for its shape-origin: a reusable harness/capability primitive lives under a client workflow; a cross-activity intrinsic capability is named for one activity; or an activity-seam-only set is named as if it were a standalone capability. Also flag a group folder whose ops are the workflow's entire operation set (`<group>::` only restates the workflow). Discriminator is shape-origin, not consumer count.

**Do not flag:** Activity-named group used only to organize seam-driven ops (protocols inside stay stage-agnostic — `technique-stage-agnostic`); multiple distinct capability groups composed by one activity; inventing a group for a hypothetical second cluster (YAGNI).

**Fix:** Reusable primitive → meta, capability-named; intrinsic/cross-consumer → workflow root (or meta if cross-workflow), capability-named; activity-seam 1:1 → activity-named group. Use a group folder only to bound a subset against other top-level techniques; otherwise standalone `techniques/<op>.md` with shared contract in workflow-root `TECHNIQUE.md`.

## Tool-Technique-Doc Consistency Anti-Patterns

Harness-surface mismatch smells: false return claims, incomplete bootstrap paths, stale tool names, duplicated guidance. Apply by comparing authored claims to the actual tool surface — not a prose-only skim.

### AP-71. no-false-resource-delivery

"Resources are in the response"

A surface claims a tool return shape that is not accurate.

**Detect:** A technique, bootstrap/meta resource, or workflow doc/README describes a tool's return value, delivery shape, or payload inaccurately versus the actual harness behaviour (e.g. claims full resource bodies when the tool returns lightweight refs).

**Do not flag:** Accurate descriptions; non-engine surfaces that correctly avoid tool recipes (`no-tool-usage-prescription`).

**Fix:** Align the claim with actual tool behaviour, or delete the claim if the surface should not describe tools. See [Match the Harness Surface](./design-principles.md#20-match-the-harness-surface).

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

**Detect:** Identical or near-identical behavioural instructions appear in multiple techniques and/or tool descriptions (including harness HOW restated outside meta engine/conduct/bootstrap — see `no-tool-usage-prescription`).

**Do not flag:** A single authoritative home with pointers elsewhere; meta surfaces whose domain is tool usage.

**Fix:** Keep one authoritative location; replace duplicates with references to it. See [One Authoritative Home](./design-principles.md#5-one-authoritative-home); harness claims also under [Match the Harness Surface](./design-principles.md#20-match-the-harness-surface).

### AP-75. describe-tool-value

"Returns: Activity definition"

A tool description undersells the value of the real return.

**Detect:** On surfaces that legitimately describe tools (meta engine/bootstrap/tool docs), a description states mechanics or a partial return and omits the value the agent actually receives (e.g. "transitions to the next activity" without the full activity definition payload).

**Do not flag:** Non-engine techniques that do not describe tools at all (`no-tool-usage-prescription`).

**Fix:** Describe the value of the real return; drop underselling mechanics-only blurbs.

### AP-76. no-redundant-tools

"Also call get_activities for transitions"

A tool is redundant because its output is a strict subset of another tool's return.

**Detect:** Authored guidance or the harness surface exposes/recommends a tool whose output is a strict subset of another tool already required (e.g. transitions-only helper after `next_activity`).

**Do not flag:** Tools that return non-subset value; distinct audiences/permissions.

**Fix:** Remove or stop recommending the redundant tool; document the surviving tool's return fully (`describe-tool-value`).

## Execution Anti-Patterns

Authoring-session smells: impl before confirmed approach, abandoned recommendations, text-only critical constraints, destructive README edits, skipped format literacy, work outside the activity graph.

### AP-77. impl-before-confirmed-approach

"I'll just start implementing"

Implementation starts before the approach is confirmed.

**Detect:** File/workflow modifications begin before the user has confirmed the proposed approach for the change.

**Do not flag:** Trivial typos/formatting the user already authorized; continuing an explicitly approved plan.

**Fix:** Present the approach; wait for confirmation; then modify. See [Confirm Before Irreversible Changes](./design-principles.md#7-confirm-before-irreversible-changes).

### AP-78. follow-through-on-recommend

"Here's what I recommend..."

A recommendation is presented without follow-through implementation.

**Detect:** The agent emits recommendations/analysis as the deliverable and stops without implementing the approved next action when implementation is in scope.

**Do not flag:** Pure advisory requests where the user asked for analysis only.

**Fix:** After recommending, implement (or explicitly checkpoint the implement-or-stop decision). See [Close the Loop](./design-principles.md#22-close-the-loop).

### AP-79. structure-backed-constraints

"The agent must never do X"

A critical constraint is text-only with no structural enforcement.

**Detect:** A critical rule in `rules[]` (workflow / activity) or technique `## Rules` can be violated by ignoring the text and has no structural backing (checkpoint, condition, validate action, or decision).

**Do not flag:** Explicitly guidance-only / non-critical rules; rules already backed by structure on the same construct or a parent the actor always receives.

**Fix:** Add structural enforcement (checkpoint, condition, validate, decision), or reclassify as non-critical guidance if structural backing is inappropriate. See [Encode Constraints as Structure](./design-principles.md#8-encode-constraints-as-structure).

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

**Detect:** Results are combined, advanced, or closed outside the workflow's defined activities/transitions.

**Do not flag:** In-activity orchestration that still goes through declared steps/checkpoints.

**Fix:** Route work through the defined activities; do not informally merge outside the graph. See [Keep Orchestration in Structure](./design-principles.md#19-keep-orchestration-in-structure).

### AP-83. accept-correction

"That correction seems wrong — keeping my version"

A user correction is pushed back without evidence, or output is not re-examined.

**Detect:** The agent disputes a user correction without citing evidence, or fails to re-examine the output after a correction.

**Do not flag:** Evidence-backed clarification questions about the correction.

**Fix:** Re-examine the output; accept the correction or present evidence — never dismiss without evidence.

## Output Economy Anti-Patterns

Artifact and checkpoint smells: multi-home facts, all-green ceremony, null sections, split or decisionless checkpoints, caption-only messages.

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

**Fix:** Rewrite the section as a link instruction to the canonical home; do not copy.

### AP-86. exception-only-verdict-tables

"| Criterion | Target | Actual | Status |" with every row "✅ Met"

A verdict table lists all-green rows instead of exceptions only.

**Detect:** Template requires a verdict/status table where the expected steady state is all-pass (every row "✅ Met" / "✅ Done" / "✓"). All-green tables carry one bit in N rows and bury the divergence rows that are the payload.

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

**Detect:** Two declared checkpoints share one decision: the second's answer space is subsumed by the first's options. Distinct from `atomic-checkpoints` (agents must not combine declared checkpoints): here the definition itself splits one decision across two prompts.

**Do not flag:** Distinct decisions with non-overlapping answer spaces.

**Fix:** Merge into one checkpoint whose options cover the full decision space plus an escape hatch for the subsumed judgement; move recording side-effects to the survivor; delete variables whose only consumer was the removed checkpoint's condition.

### AP-89. checkpoint-requires-decision

"`merge-strategy-reminder` — options: [Understood]"

A checkpoint has no real decision in its options.

**Detect:** Every option leads to the same next step, sets no variable, and exists only so the user can acknowledge guidance. Discriminator is recorded effect: acknowledgment/`autoAdvanceMs` that changes nothing is ceremony.

**Do not flag:** Attestation gates (DCO sign-off) that record a certification with identity/timestamp — genuine decisions.

**Fix:** Convert to an `action: message` step; reserve checkpoints for genuine gates. A checkpoint always answered with its default is also a merge (`one-decision-one-checkpoint`) or demote (`checkpoint-requires-decision`) candidate.

### AP-90. no-guide-wrapper-ceremony

"Purpose:** … / ## Overview / > **Key Insight:** … / Good–Bad pairs / ## Quality Checklist / ## Relationship to Other Documents"**

A guide is wrapper ceremony around a template.

**Detect:** Agent-facing resource pads a template with tutorial ceremony — Purpose/Overview restating the title, Good/Bad pairs, Quality Checklists restating the body, relationship/related-guides tables. Runtime load taxes context; keep TEMPLATE plus operative rules (decision criteria, thresholds, format rules, classification vocabularies).

**Do not flag:** Behavioral reference documents (mode mappings, review criteria) that are mostly operative — cut ceremony, keep every mapping.

**Fix:** Rewrite as template + rules; fold each Good/Bad lesson into one rule bullet; drop wrapper sections; verify referenced heading anchors survive.

### AP-91. lifecycle-row-update

"### Assumptions Surfaced → ### User Response → ### Outcome → Final Review scorecards"

Lifecycle rows are append-only instead of updated in place.

**Detect:** A tracked item gets a new section (or appended block) at each lifecycle stage instead of one row updated in place. Aggregate scorecards are persisted in the log rather than presented in-session.

**Do not flag:** A full per-item block while the item is still OPEN (deleted on resolution; outcome lives in the row).

**Fix:** One row per item, updated in place across stages; present aggregate scorecards in-session, not persisted. Rewrite stage techniques as row updates, not appends.

### AP-92. resource-fills-not-does

"## File Index Generation / 1. Ensure the branch is current…"

A resource owns DOES procedure instead of fill/consult content.

**Detect:** A resource section is shaped like procedure, rules list, or decision criteria — technique work in the wrong file. Costs: invisible to guards (unparsed `{token}` reads); unaddressable (no dotted rule symbol); dual-homing drift with a paired technique. Discriminators: vocabulary stays a resource when only a TEMPLATE consumes it; becomes a technique rule when OPERATIONS apply it behaviorally. Methodology consumed by a different technique than the filename suggests stays a resource for its real consumer — ownership, not name.

**Do not flag:** Artifact templates/anchors, format skeletons, vocabularies a template consumes, reference lexicons, calibration benchmarks — what the agent FILLS or CONSULTS.

**Fix:** Move does-sections to the owning technique as protocol phases or named rules; replace with a one-line pointer; dissolve the resource when nothing template-shaped remains. Retarget stranded heading anchors; ensure every moved `{token}` resolves under guard coverage (declared id / `{$local}` / workflow variable). See [One Authoritative Home](./design-principles.md#5-one-authoritative-home).

### AP-93. canonical-fact-home

"### Problem Statement in wp-plan / requirements-elicitation / design-framework"

A fact is multi-homed across templates.

**Detect:** Several templates in one workflow each mandate a full section for the same fact category (problem statement, success criteria, assumptions/decisions/risks, …). Structural duplication — even a rule-compliant worker restates across documents.

**Do not flag:** Distinct fact categories with genuinely different homes.

**Fix:** Declare a canonical-home map (fact category → exactly ONE home template); other templates use a one-line link slot to the home; back with a conformance gate (`enforce-output-discipline`).

### AP-94. link-only-input-slots

"### Key Findings Summary — From KB Research: [key concept discovered]…"

An input slot restates another artifact's content.

**Detect:** A section is shaped to hold a summary/copy of a different document — even when adjacent prose says "link, don't copy", the slot shape defeats the rule.

**Do not flag:** Sections that record decisions/outcomes of the consuming document itself.

**Fix:** Replace with a link-only inputs list — one line per consumed artifact linking the section that shaped the work (anchors permitted), never its content; the consuming document records only what it DECIDED.

### AP-95. enforce-output-discipline

"state-once-per-artifact / single-source-and-link / exception-only-reporting … declared in a TECHNIQUE.md nobody re-checks"

Output-discipline rules exist without a verify gate.

**Detect:** An output-discipline ruleset exists only as prose with no verify operation at a workflow boundary — style decays per-worker with nothing detecting drift (duplicated homes, null sections, restated slots).

**Do not flag:** Rules already paired with a bound verify/fix-in-place gate (verify-readme-conforms pattern).

**Fix:** Pair every output-discipline ruleset with a verify operation at a workflow boundary — mechanical checks for structural rules, declared line budgets otherwise; gate verifies and fixes in place with no checkpoint, loop, or routing variable.

### AP-96. artifact-audience-declared

"assumptions-log / change-block-index / provenance-log / debt-ledger — dense ID-bearing tables as prose markdown between human documents"

An artifact's primary audience is undeclared.

**Detect:** Output declaration carries only a filename; agent-state artifacts (lifecycle logs, indexes, ledgers only downstream steps re-read) default to the same prose-markdown shape as human-facing documents.

**Do not flag:** Human-primary documents that should stay prose.

**Fix:** Decide each artifact's primary audience (human | agent) at design time — human → prose; agent state → structured one-row-per-item data. Record audience in the output declaration's description until the technique protocol carries a first-class audience attribute.

### AP-97. link-named-artifacts

"`spec-confirmed` — message: Full specification across the elicited dimensions`" / "`findings in the report are the change specification.`"

A durable artifact is named in a message but not linked.

**Detect:** A user-presented checkpoint or action `message` names or implies a durable file artifact without `[label]({path_variable})`, or the link hard-codes a numeric `NN-` prefix.

**Do not flag:** Pure in-chat subjects (no durable file); internal `set`/`log` diagnostics that are not user-presented artifact references.

**Fix:** Declare a path output on the producing technique; persist before the message when needed; interpolate `[label]({path_variable})`. Never hard-code `NN-` (the write op assigns it). On checkpoints the message stays a statement (`checkpoint-requires-decision`: options carry the decision).

### AP-98. no-next-step-narration

"`Impact analysis complete — no removals. Continuing to scope…`" / "`… Accepting in 30s unless you intervene`" / "`(default — auto-accepts after 30s)`"

A message narrates the next step or auto-advance.

**Detect:** Checkpoint/action `message` or option `description` narrates next-step routing or auto-advance timing that the schema already owns (`transitions`, `autoAdvanceMs`, `defaultOption`, option labels).

**Do not flag:** Pure factual status clauses with no routing/timing narration.

**Fix:** Delete the narration; keep timing/routing in `autoAdvanceMs`, `defaultOption`, `transitions`, and option labels only.

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

**Fix:** (1) Remove from `rules.*` / technique `## Rules`. (2) Migrate into the workflow's design-time canon (principles, this catalogue, construct inventory, or an existing covering entry). (3) Enforce at authoring time via the workflow's quality/structural audit — do not re-inject into runtime `rules.*`.

### AP-101. no-caption-only-message

`Structural patterns from existing workflows, with proposed structure shown alongside.`

A checkpoint message is only a caption of the prior present step.

**Detect:** After a present-then-checkpoint step, `message` restates "what I just showed" with no durable subject and no decision-relevant fact.

**Do not flag:** Messages that link a persisted artifact (`link-named-artifacts`), state a decision-relevant fact, or name a loop discriminator options lack.

**Fix:** Persist then link (`[label]({path})`), or reduce to the minimal subject the options decide — never a caption paraphrase.

### AP-102. no-technique-resource-dual-home

"`audit-anti-patterns` protocol lists per-entry Flag/Skip/Fix…` while `anti-patterns.md` already defines those criteria" / technique restates a linked resource's checklist, vocabulary, or detect rules"

Operative criteria are dual-homed in technique and resource.

**Detect:** A technique that loads or links a resource also embeds operative criteria that must be applied from that resource (parallel detect/fix lists, vocabularies, or compressed checklists). Both files hold the same facts — distinct from `resource-fills-not-does` and `no-resource-caller-backlink`.

**Do not flag:** A one-line pointer to the resource; technique-owned HOW the resource does not define; scan-scope paraphrase without repeating criteria. See also `operative-criteria-need-a-home`, `cited-home-owns-claim`, `no-shadow-audit-pass`.

**Fix:** Choose one home (usually the resource for reusable criteria, the technique for procedure); delete the duplicate. Migrate unique technique-only criteria into the resource before deleting them from the technique. See [One Authoritative Home](./design-principles.md#5-one-authoritative-home).

## Canon Hygiene Anti-Patterns

Canon smells: false citations, homeless criteria, shadow audit Detect, upper layers restating Detect, pass inventories drifting from YAML binds.

### AP-103. cited-home-owns-claim

"Select the set from [guide]"

A citation attributes a fact to a home that lacks it.

**Detect:** A technique, resource, or guide attributes an operative fact to a linked home ("from X", "per X", "defined in X", "select … from X") but that fact is absent from X — it lives only in the citer, or nowhere. Test: open the cited home; if the claim cannot be applied from X alone, the citation is false.

**Do not flag:** Citations that correctly point at content in X; technique-owned orchestration that does not claim X owns it; aspirational "see also" without asserting ownership.

**Fix:** Move the fact into the cited home, or stop attributing it to X and own it explicitly in the citer (one home only — see `operative-criteria-need-a-home` / `no-technique-resource-dual-home`).

### AP-104. operative-criteria-need-a-home

"Flag every divergence matching: naming, field order, voice markers…"

Reusable criteria live only in a technique with no catalog/resource home.

**Detect:** Reusable Detect / Do not flag / Fix criteria (or an equivalent multi-item checklist agents must reapply across sessions) exist only inside a technique protocol, with no resource or anti-pattern home. Signals: long criterion lists; classification vocabularies; "scan for these markers" tables that are not orchestration-only.

**Do not flag:** One-off orchestration (order of steps, which files to open, how to present findings); thin walkers that only name a home and apply it (`no-technique-resource-dual-home` carve-out); criteria already homed in a resource/catalog even if the technique is still fat (that is dual-home, not missing-home).

**Fix:** Migrate the criteria into a resource or this catalogue; leave the technique as a walker (load home → apply → present). Prefer a catalog entry when the criterion is a prohibited pattern; prefer a resource when it is a positive checklist/convention. See [One Authoritative Home](./design-principles.md#5-one-authoritative-home).

### AP-105. no-shadow-audit-pass

"`audit-consistency` restates Tool-Technique-Doc Detect while `audit-anti-patterns` already walks that section"

An audit pass shadows another walker's Detect criteria.

**Detect:** An audit technique embeds a compressed copy of a catalog/resource's Detect criteria while another technique already walks that same home (full or scoped).

**Do not flag:** A thin scoped walker that loads a named section and applies each entry as written without restating Detect; distinct passes with distinct homes (e.g. inventory walk vs full catalog walk); non-audit techniques.

**Fix:** Delete the shadow Detect; keep at most one walker per home (or a scoped thin walker that does not re-author criteria). Fold unique surface-check *method* into the catalog entries or into the surviving walker's HOW — not a parallel criterion list.

### AP-106. canon-layer-cites-not-restates

"Principle 4 prose embeds the full Schema Expressiveness / Description Hygiene Detect body already in the catalogue"

An upper canon layer restates Detect/Fix already owned below.

**Detect:** An upper canon layer (design principles, mode guides, README orientation) re-embeds multi-sentence Detect / Fix bodies that a lower layer already owns (this catalogue, construct inventory, convention resource). Signals: principle/guide paragraphs that could be replaced by a named entry citation without losing an enforceable test; duplicated marker lists or rewrite recipes.

**Do not flag:** Short Rule statements plus named citations; Enforcement pointers to activities/checkpoints; a single clarifying sentence that does not repeat Detect steps; layers that are themselves the sole home (`operative-criteria-need-a-home`).

**Fix:** Keep the upper layer as short principle stance prose; delete restated Detect, Detect-routing blocks, and host Enforcement inventories (`no-resource-caller-backlink`). If the upper layer held unique criteria, migrate them down before deleting. See [One Authoritative Home](./design-principles.md#5-one-authoritative-home).

### AP-107. bind-site-is-orchestration-truth

"Review mode runs: expressiveness, conformance, rule-to-structure…"

A pass inventory disagrees with authoritative YAML bind sites.

**Detect:** Prose outside activity YAML enumerates an ordered or complete list of activities, steps, or technique passes, and that list is not generated from the authoritative bind sites (`steps[]` / loop bodies / `technique:`, plus `initialActivity` / transitions). Test: the prose must change when a bind changes, but the YAML was not the source of the list.

**Do not flag:** Purpose/value orientation without a pass inventory; pointers to the YAML; at-a-glance activity names with one-line roles (`readme-orients-not-transcribes`); a technique that only applies a sibling without listing a parallel set.

**Fix:** Delete the third checklist, or replace it with a pointer to the binding activity/technique. If a summary is required, generate it from the YAML binds. See [One Authoritative Home](./design-principles.md#5-one-authoritative-home).

## Technique Protocol Anti-Patterns

Protocol indexing, I/O declaration, and composition smells on technique markdown.

### AP-108. numbered-protocol-phases

"### 1. Apply Fixes" with edit / re-validate / record as bullets under one heading

Discrete sequential protocol phases are collapsed into one numbered step.

**Detect:** A technique `## Protocol` has a numbered `### N. Title` whose body holds two or more bullets (or imperative sentences) that are distinct sequential phases — each produces a different outcome or must complete before the next (edit then validate then record; load then assemble; assemble then persist). Test: reordering or dropping a bullet changes the phase sequence, not merely the elaboration of one phase.

**Do not flag:** Multiple bullets that elaborate a single phase (how-to for one write, constraints on one apply, loop body over one entry, mode branches of one action); `>` caveats under a primary instruction; a single-bullet step.

**Fix:** Split into consecutive numbered `### N. Title` steps — one phase per heading. Keep elaborating bullets only under the phase they refine. See also [Phase by Sequenced Outcome](./design-principles.md#14-phase-by-sequenced-outcome).

### AP-109. technique-outputs-declared

"Assemble the per-file drafting plan…" with no `## Outputs` entry

Capability or Protocol produces a value that is not declared on Outputs.

**Detect:** Technique Capability or Protocol assembles, derives, or returns a durable or gateable value (plan, findings, summary, classification, path, count, structured assessment) that has no matching `### <id>` under `## Outputs`. Test: a later step, checkpoint, or consumer could bind or cite the value — if so, it must be a declared output (files also need `#### artifact` per `artifact-not-buried`).

**Do not flag:** Pure side-effects with no bindable product (push, open PR, mark ready) when no path/number is captured; values already declared on Outputs; input-only gaps (`technique-inputs-declared`); Protocol that only presents/surfaces a value to a user without declaring it (`session-interaction-in-technique` — and still declare the output if it is gateable).

**Fix:** Declare `### <id>` under `## Outputs` naming what the value IS; reference `{id}` in Protocol when assembling. Add `#### artifact` when the value is a file. Do not add a Present phase — the activity surfaces `{id}` (`session-interaction-in-technique`).

### AP-110. duplicate-shared-capability

"`publish-workflow-pr` re-teaches `gh pr create` / `gh pr ready` / `git push` already covered by meta ops"

A workflow-local technique re-implements a capability a meta or shared-workflow technique already offers.

**Detect:** A non-meta technique's Protocol embeds a harness recipe (git push, `gh pr create`, `gh pr ready`, commit/stage, issue mutate, …) for a capability that already exists as a meta or cross-workflow shared op. Test: the local novelty is only parameters or caller-specific composition (title/body/path wiring); the verb/recipe is already owned elsewhere. Near-misses count — an existing shared op that almost fits but lacks an input, optional flag, or output still owns the capability.

**Do not flag:** Local composition that *applies* the shared op via canonical hyperlink/`::` bind and keeps only caller-specific value assembly; parameterization or minor refactor of the shared/meta op itself to accommodate a new caller's diversity (new optional inputs, defaults, outputs, or small protocol branches) while preserving existing callers; adding a new shared op when no shared capability exists yet.

**Fix:** Replace the local harness recipe with a bind or canonical hyperlink; keep only caller-specific value assembly (`canonical-technique-reference`, `no-duplicated-guidance`). Remediation order under [Prefer Shared Capability](./design-principles.md#17-prefer-shared-capability).

### AP-111. contract-not-procedure

"### 7. Set Operation Flags" restating create/update/review recognition criteria already (or better) owned by Outputs

Protocol carries identity criteria or a trailing "Set …" phase that belongs on the Output contract.

**Detect:** A technique `## Protocol` (a) restates derivation, recognition, or decision-tree criteria for a declared Output (the bullets answer *what is this value?* rather than *what work do I do now?*), or (b) has a numbered phase whose sole job is to assign a pure projection of another output already produced earlier (e.g. boolean flags that are `true` iff `{operation_type}` is a given enum). Test: if deleting the Protocol copy leaves the Output description as the sole complete definition — or the phase only types derived fields — flag it.

**Do not flag:** Protocol that determines or emits `{id}` by reference to Output criteria without restating the tree ("classify `{operation_type}` per the Output criteria"); emitting a count or path in the same phase that already produced the bag/artifact; mode branches that *use* an already-bound value; missing Outputs entirely (`technique-outputs-declared`).

**Fix:** Move identity criteria onto the owning Output; collapse pure projections to one-line Output descriptions; keep Protocol as work phases that emit `{id}`. See [Separate Contract from Procedure](./design-principles.md#12-separate-contract-from-procedure). Workflow-variable shadows are `no-derived-state-shadow`.

### AP-112. no-derived-state-shadow

"`is_update_mode` / `is_review_mode` alongside `operation_type`"

A derived shadow variable duplicates an authoritative state variable.

**Detect:** A workflow declares two or more variables where one is a pure projection of another (booleans that are true iff a primary enum/string equals a constant; mirrored counts of the same bag). Gates, technique inputs, or `setVariable` effects write or read the shadow instead of — or in addition to — the source. Test: if a legal write can leave the shadow disagreeing with the source, flag it.

**Do not flag:** Distinct facts that merely correlate; Output prose that defines a projection without declaring a second workflow variable (`contract-not-procedure`); mode encoded only as rules/prose with no state variable (`mode-as-state`).

**Fix:** Keep the authoritative variable; rewrite conditions, technique inputs, and effects to compare it directly; delete the shadow declarations and every write to them. See also [Single Source of Truth](./design-principles.md#13-single-source-of-truth).

### AP-113. session-interaction-in-technique

"Present `{drafting_plan}`" / "Present findings to the user" / "surface the summary in chat"

A technique performs or prescribes human/session interaction.

**Detect:** Technique Capability, Protocol, or Rules instructs presenting, surfacing, showing, narrating, or otherwise delivering content to a user, session, or chat — or otherwise encodes how a human should be interacted with — rather than only producing bindable `{id}` outputs (and tool/op side-effects). Test: if the imperative requires a human audience or session channel to succeed, and no tool/op owns that channel, flag it. Techniques are session-blind: inputs → process → outputs; activities own `action: message`, checkpoint `message`/`options`, and artifact links.

**Do not flag:** Assembling or persisting a declared output the activity will surface; applying a tool/op whose domain is external delivery (push, open PR, send) when the technique only binds that op; naming "the user's request" as an input origin (`io-agnostic-contract`); stage/gate locus smells (`technique-stage-agnostic`).

**Fix:** Delete Present/surface/show-to-user phases; keep assemble/derive/persist that emit `{id}`. Put human-facing delivery on the binding activity (`action: message` and/or checkpoint message linking `{id}` / path). See [Keep Session Interaction in Activities](./design-principles.md#23-keep-session-interaction-in-activities).
