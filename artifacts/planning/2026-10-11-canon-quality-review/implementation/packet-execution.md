# Drafting packet: execution

Source revision: e70b44778f71d9d699f746f78a16b892531c82d3

## Owned source entries

Review address: AP-69

### AP-69. no-activity-prose-rules

`rules: ["Manual diff review is FIRST", "all reviews must complete before validate"]` (prose rules at the activity level)

An activity carries prose rules: instead of pure mechanics.

**Detect:** Any activity-level `rules:` entry.

**Do not flag:** None. Behavioural guidance belongs on the bound technique.

**Fix:** Delete an entry that restates structure the activity already enforces. Migrate a technique constraint to the owning technique (`single-rule-authority`). Encode an unenforced constraint as `when` or `condition`, a transition, a decision, a checkpoint, or `required: false`. A hard gate is `when` or `condition`. Step `required` is a worker hint. See [Keep Orchestration in Structure](./design-principles.md#20-keep-orchestration-in-structure).

Review address: AP-70

### AP-70. capability-group-placement

"Reusable primitive trapped in a client workflow" / "cross-consumer capability buried under one activity name"

Technique folder/name disagrees with shape-origin (reuse boundary, activity seam, or shared namespace).

**Detect:** A technique's directory or name encodes the wrong locus for its shape-origin: a reusable harness/capability primitive lives under a client workflow; a cross-activity intrinsic capability is named for one activity; or an activity-seam-only set is named as if it were a standalone capability. Also flag a group folder whose ops are the workflow's entire technique set (`<group>::` only restates the workflow). Discriminator is shape-origin, not consumer count.

**Do not flag:** Activity-named group used only to organize seam-driven ops (protocols inside stay stage-agnostic — `technique-stage-agnostic`); multiple distinct capability groups composed by one activity; inventing a group for a hypothetical second cluster (YAGNI).

**Fix:** Place the group at its reuse boundary: an activity-seam 1:1 set → activity-named group; a set one workflow's activities share → that workflow's root, capability-named; a set many workflows share → a namespace of its own, capability-named. A shared namespace driving a system outside the server is a library; one describing how a run itself proceeds belongs to the workflow whose subject that is. Use a group folder only to bound a subset against other top-level techniques; otherwise standalone `techniques/<op>.md` with shared contract in the namespace-root `TECHNIQUE.md`.

Review address: AP-71

### AP-71. no-false-resource-delivery

"Resources are in the response"

A surface claims a tool return shape that is not accurate.

**Detect:** A technique, bootstrap/meta resource, or workflow doc/README describes a tool's return value, delivery shape, or payload inaccurately versus the actual harness behaviour (e.g. claims full resource bodies when the tool returns lightweight refs).

**Do not flag:** Accurate descriptions; non-engine surfaces that correctly avoid tool recipes (`no-tool-usage-prescription`).

**Fix:** Align the claim with actual tool behaviour, or delete the claim if the surface should not describe tools. See [Match the Harness Surface](./design-principles.md#21-match-the-harness-surface).

Review address: AP-72

### AP-72. complete-bootstrap-path

"Call start_session, then call next_activity"

The bootstrap path has a discoverability gap between hops.

**Detect:** An authoritative bootstrap sequence (meta bootstrap / engine technique / orchestrator prompt) omits a tool or step required to reach the first meaningful action, given what the prior tools actually return (e.g. no `initialActivity` and no `get_workflow`).

**Do not flag:** Non-engine techniques that correctly omit tool recipes (`no-tool-usage-prescription`).

**Fix:** Complete the path on the authoritative bootstrap surface so every hop is discoverable from the prior tool's real return.

Review address: AP-73

### AP-73. consistent-tool-names

"`get_step_technique`" / invented or stale tool name

The same harness action is named inconsistently or with a stale name.

**Detect:** (1) The same harness action is named differently across techniques, bootstrap resources, or docs. (2) A cited tool name does not exist on the actual harness tool surface. Canonical name for loading a step technique is `get_technique`.

**Do not flag:** Historical names only inside supersession notes that are being deleted; wrapped raw-tool names inside the op that owns that primitive (`canonical-technique-reference` carve-out).

**Fix:** Use one canonical name everywhere; replace or delete names absent from the harness surface.

Review address: AP-74

### AP-74. no-duplicated-guidance

"Pass token to all calls"

The same behavioural guidance is multi-homed across techniques and tool docs.

**Detect:** Identical or near-identical behavioural instructions appear in more than one technique or tool description. Harness mechanics restated outside the engine, conduct, or bootstrap surface are `no-tool-usage-prescription`.

**Do not flag:** One home with pointers elsewhere. A meta surface whose domain is tool usage.

**Fix:** Keep one location and replace each duplicate with a reference to it. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-75

### AP-75. describe-tool-value

"Returns: Activity definition"

A tool description undersells the value of the real return.

**Detect:** On surfaces that legitimately describe tools (meta engine/bootstrap/tool docs), a description states mechanics or a partial return and omits the value the agent actually receives (e.g. "moves to the next activity" without the full activity definition payload).

**Do not flag:** Non-engine techniques that do not describe tools at all (`no-tool-usage-prescription`).

**Fix:** Describe the value of the real return.

Review address: AP-76

### AP-76. no-redundant-tools

"Also call get_activities for the routing"

A tool is redundant because its output is a strict subset of another tool's return.

**Detect:** Authored guidance or the harness surface exposes/recommends a tool whose output is a strict subset of another tool already required (e.g. a routing-only helper after `next_activity`).

**Do not flag:** Tools that return non-subset value; distinct audiences/permissions.

**Fix:** Remove or stop recommending the redundant tool; document the surviving tool's return fully (`describe-tool-value`).

Review address: AP-77

### AP-77. impl-before-confirmed-approach

"I'll just start implementing"

Implementation starts before the approach is confirmed.

**Detect:** File/workflow modifications begin before the user has confirmed the proposed approach for the change.

**Do not flag:** Trivial typos/formatting the user already authorized; continuing an explicitly approved plan.

**Fix:** Present the approach; wait for confirmation; then modify. See [Confirm Before Irreversible Changes](./design-principles.md#8-confirm-before-irreversible-changes).

Review address: AP-78

### AP-78. follow-through-on-recommend

"Here's what I recommend..."

A recommendation is presented without follow-through implementation.

**Detect:** The agent emits recommendations/analysis as the deliverable and stops without implementing the approved next action when implementation is in scope.

**Do not flag:** Pure advisory requests where the user asked for analysis only.

**Fix:** After recommending, implement (or explicitly checkpoint the implement-or-stop decision). See [Close the Loop](./design-principles.md#23-close-the-loop).

Review address: AP-79

### AP-79. structure-backed-constraints

"The agent must never do X"

A critical constraint is text-only with no structural enforcement.

**Detect:** A critical rule in `rules[]` (workflow / activity) or technique `## Rules` can be violated by ignoring the text and has no structural backing (checkpoint, condition, validate action, or decision).

**Do not flag:** Explicitly guidance-only / non-critical rules; rules already backed by structure on the same construct or a parent the actor always receives.

**Fix:** Add structural enforcement (checkpoint, condition, validate, decision), or reclassify as non-critical guidance if structural backing is inappropriate. See [Encode Constraints as Structure](./design-principles.md#9-encode-constraints-as-structure).

Review address: AP-80

### AP-80. preserve-readme-content

"Updated README"

A README update reduces content without a preservation audit and confirmation.

**Detect:** A README edit removes or shrinks substantive content without listing what was preserved/removed and getting user confirmation.

**Do not flag:** Additive clarifications; deletions the user explicitly requested.

**Fix:** Audit preservations/removals, confirm with the user, then apply (`readme-orients-not-transcribes` still applies to shape).

Review address: AP-81

### AP-81. verify-format-literacy

"Draft first, validate later"

Drafting proceeds without format literacy, or commit skips validation.

**Detect:** New workflow/technique/resource files are drafted without checking the relevant format/schema conventions, or commits proceed without validating the touched files.

**Do not flag:** Edits that only touch already-validated identical shapes with no format risk.

**Fix:** Verify format literacy before drafting; validate all touched files before commit.

Review address: AP-82

### AP-82. work-through-activities

"I'll just merge the worker outputs here"

Work bypasses defined activities via informal combination of results.

**Detect:** Results are combined, advanced, or closed outside the workflow's defined activities and graph.

**Do not flag:** In-activity orchestration that still goes through declared steps/checkpoints.

**Fix:** Route the work through the defined activities. See [Keep Orchestration in Structure](./design-principles.md#20-keep-orchestration-in-structure).

Review address: AP-83

### AP-83. accept-correction

"That correction seems wrong — keeping my version"

A user correction is pushed back without evidence, or output is not re-examined.

**Detect:** The agent disputes a user correction without citing evidence, or fails to re-examine the output after a correction.

**Do not flag:** Evidence-backed clarification questions about the correction.

**Fix:** Re-examine the output; accept the correction or present evidence — never dismiss without evidence.

Review address: AP-84

### AP-84. single-closeout-artifact

`COMPLETE.md` + `workflow-retrospective.md` + `close-out-summary.md` + a README footer narrative

Multiple close-out documents re-narrate the same session.

**Detect:** More than one terminal artifact (or README footer) re-states delivered items, decisions, validation, follow-ups, or lessons.

**Do not flag:** A single close-out artifact with retrospective as a section; engine session summary presented but not persisted as a second artifact.

**Fix:** Collapse to one close-out document; retarget retrospective writes to it; keep README as an index line only.

Review address: AP-85

### AP-85. link-dont-copy-sections

"### Test Results" / "### Files Changed" / "*Recorded from the [validation report]*"

A template section forces copying content owned by another artifact.

**Detect:** A template lays out sections to fill with content whose canonical home is another artifact, instead of instructing a link.

**Do not flag:** Sections that are the canonical home for newly produced content; link-only slots already correct (`link-only-input-slots`).

**Fix:** Rewrite the section as a link instruction to the canonical home.

Review address: AP-86

### AP-86. exception-only-verdict-tables

"| Criterion | Target | Actual | Status |" with every row "✅ Met"

A verdict table lists all-green rows instead of exceptions only.

**Detect:** A template requires a verdict or status table whose expected steady state is all-pass (every row "✅ Met", "✅ Done", or "✓").

**Do not flag:** Vocabularies downstream steps parse (severity counts, README progress-tracker statuses) — data, not ceremony.

**Fix:** Replace with a one-line all-pass form plus a divergences-only table.

Review address: AP-87

### AP-87. omit-null-sections

"Deferred Decisions: None." / empty "### Frustration Signals" table / "confirm no assumptions were made"

Null/empty results get headed sections or confirmation ceremony.

**Detect:** Artifacts include "None"/"N/A" headed sections or empty tables, or checkpoints ask the user to confirm a null result.

**Do not flag:** Sections with real content; a one-line logged null without a headed empty section.

**Fix:** Omit empty sections (mark templates `[Omit if none]`); log nulls in one line and proceed — no null-confirmation checkpoint.

Review address: AP-88

### AP-88. one-decision-one-checkpoint

"`classification-confirmed` immediately followed by `workflow-path-selected`" / "`rationale-amendment` re-asking what prior options already captured"

One decision is split across multiple checkpoints.

**Detect:** Two declared checkpoints share one decision: the second's answer space is subsumed by the first's options. An agent combining checkpoints the definition already separated is `atomic-checkpoints`.

**Do not flag:** Distinct decisions with non-overlapping answer spaces.

**Fix:** Merge into one checkpoint whose options cover the full decision space plus an escape hatch for the subsumed judgement; move recording side-effects to the survivor; delete variables whose only consumer was the removed checkpoint's condition.

Review address: AP-89

### AP-89. checkpoint-requires-decision

"`merge-strategy-reminder` — options: [Understood]"

A checkpoint has no real decision in its options.

**Detect:** Every option leads to the same next step, sets no variable, and exists only so the user can acknowledge guidance. An `autoAdvanceMs` that changes nothing is the same fault.

**Do not flag:** Attestation gates (DCO sign-off) that record a certification with identity/timestamp — genuine decisions.

**Fix:** Convert it to an `action: message` step. A checkpoint always answered with its default is `one-decision-one-checkpoint`.

Review address: AP-90

### AP-90. no-guide-wrapper-ceremony

"Purpose:** … / ## Overview / > **Key Insight:** … / Good–Bad pairs / ## Quality Checklist / ## Relationship to Other Documents"**

A guide is wrapper ceremony around a template.

**Detect:** An agent-facing resource pads a template with ceremony — a Purpose or Overview that restates the title, a Good/Bad pair, a Quality Checklist that restates the body, or a relationship table. What stays is the template plus the operative rules: decision criteria, thresholds, format rules, classification vocabularies.

**Do not flag:** Behavioral reference documents (mode mappings, review criteria) that are mostly operative — cut ceremony, keep every mapping.

**Fix:** Rewrite as template + rules; fold each Good/Bad lesson into one rule bullet; drop wrapper sections; verify referenced heading anchors survive.

Review address: AP-91

### AP-91. lifecycle-row-update

"### Assumptions Surfaced → ### User Response → ### Outcome → Final Review scorecards"

Lifecycle rows are append-only instead of updated in place.

**Detect:** A tracked item gets a new section (or appended block) at each lifecycle stage instead of one row updated in place. Aggregate scorecards are persisted in the log rather than presented in-session.

**Do not flag:** A full per-item block while the item is still OPEN (deleted on resolution; outcome lives in the row).

**Fix:** One row per item, updated in place across stages; present aggregate scorecards in-session, not persisted. Rewrite stage techniques as row updates, not appends.

Review address: AP-92

### AP-92. resource-fills-not-does

"## Surfacing Assumptions / Ask after each phase/task…" / "## Research Protocol / 1. Ensure…"

A resource owns DOES procedure (session cadence or operational HOW) instead of fill/consult content.

**Detect:** A resource section is shaped like technique Protocol or session orchestration — imperative cadence ("after each phase/task", "Ask after…", "surface… then classify…"), numbered operational steps, or behavioural routing ("validate before proceeding", "confirm at checkpoint", "proceed to interview/batch"). Vocabulary, labels, and probe lists a template consumes stay. Behavioural cadence and gate routing that a technique applies move to the technique. Methodology a different technique consumes than the filename suggests stays, for that consumer. Bind-topology essays are also `no-resource-caller-backlink`.

**Do not flag:** Artifact templates/anchors, format skeletons, category/risk/status **labels**, probe lists framed as fill vocabulary (not "Ask after each…"), reference lexicons, calibration benchmarks, and fill Rules that constrain row/section **shape** (null-row format, one-row-per-item) without prescribing when to interview or which activity runs next.

**Fix:** Move does-sections to the owning technique as protocol phases or named rules; leave templates + consult vocabulary; dissolve the resource when nothing template-shaped remains. Retarget stranded heading anchors; ensure every moved `{token}` resolves under guard coverage (declared id / `{$local}` / workflow variable). See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-93

### AP-93. canonical-fact-home

"### Problem Statement in wp-plan / requirements-elicitation / design-framework"

A fact is multi-homed across templates.

**Detect:** Several templates in one workflow each mandate a full section for the same fact category (problem statement, success criteria, assumptions, decisions, risks).

**Do not flag:** Distinct fact categories with genuinely different homes.

**Fix:** Declare a canonical-home map (fact category → exactly ONE home template); other templates use a one-line link slot to the home; back with a conformance gate (`enforce-output-discipline`).

Review address: AP-94

### AP-94. link-only-input-slots

"### Key Findings Summary — From KB Research: [key concept discovered]…"

An input slot restates another artifact's content.

**Detect:** A section is shaped to hold a summary/copy of a different document — even when adjacent prose says "link, don't copy", the slot shape defeats the rule.

**Do not flag:** Sections that record decisions/outcomes of the consuming document itself.

**Fix:** Replace with a link-only inputs list — one line per consumed artifact, linking the section that shaped the work. Anchors are permitted.

Review address: AP-95

### AP-95. enforce-output-discipline

"state-once-per-artifact / single-source-and-link / exception-only-reporting … declared in a TECHNIQUE.md nobody re-checks"

Output-discipline rules exist without a verify gate.

**Detect:** An output-discipline ruleset exists only as prose with no verify technique at a workflow boundary — style decays per-worker with nothing detecting drift (duplicated homes, null sections, restated slots).

**Do not flag:** Rules already paired with a bound verify/fix-in-place gate (verify-readme-conforms pattern).

**Fix:** Pair every output-discipline ruleset with a verify technique at a workflow boundary — mechanical checks for structural rules, declared line budgets otherwise; gate verifies and fixes in place with no checkpoint, loop, or routing variable.

Review address: AP-96

### AP-96. artifact-audience-declared

"`#### artifact` / `debt-ledger.md`" — a filename with no `#### audience` beneath it

An artifact's primary audience is undeclared.

**Detect:** An output declaring `#### artifact` carries no `#### audience`. Absence reads as `human`, so an agent-state artifact — a lifecycle log, index, or ledger only later steps re-read — keeps the prose shape a human document has.

**Do not flag:** An output with no `#### artifact`. Audience is a property of a file on disk.

**Fix:** Declare the audience. `human` is prose. `agent` is structured one-entry-per-item data, serialized as JSON (`check-audience` enforces the format; `audience-declared` enforces the presence). Where a person is pointed at the artifact — a progress-inventory row, a gate message linking it — that reader is the one the format serves.

Review address: AP-97

### AP-97. link-named-artifacts

"`spec-confirmed` — message: Full specification across the elicited dimensions`" / "`findings in the report are the change specification.`"

A durable artifact is named in a message but not linked.

**Detect:** A user-presented checkpoint or action `message` names or implies a durable file artifact without `[label]({path_variable})`, or the link hard-codes a numeric `NN-` prefix.

**Do not flag:** Pure in-chat subjects (no durable file); internal `set`/`log` diagnostics that are not user-presented artifact references.

**Fix:** Declare a path output on the producing technique. Persist before the message when the file does not exist yet. Interpolate `[label]({path_variable})`. The write technique assigns a numeric prefix. On a checkpoint the message stays a statement (`checkpoint-requires-decision`).

Review address: AP-98

### AP-98. no-next-step-narration

"`Impact analysis complete — no removals. Continuing to scope…`" / "`… Accepting in 30s unless you intervene`" / "`(default — auto-accepts after 30s)`"

A message narrates the next step or auto-advance.

**Detect:** Checkpoint/action `message` or option `description` narrates next-step routing or auto-advance timing that the schema already owns (`exits`, the workflow `graph`, `autoAdvanceMs`, `defaultOption`, option labels).

**Do not flag:** Pure factual status clauses with no routing/timing narration.

**Fix:** Delete the narration; keep timing in `autoAdvanceMs` and `defaultOption`, routing in `exits` and the workflow `graph`, and the rest in option labels only.

Review address: AP-99

### AP-99. statement-not-question

"`Here is the full specification. Is it accurate and complete?`" / "`Confirm this target set?`"

A checkpoint message is phrased as a question.

**Detect:** Checkpoint `message` has a trailing `?`, or confirm/interrogative openers ("confirm…", "is this…", "does this…", "would you like…", "which … should").

**Do not flag:** `?` inside interpolated content that is not asking the user.

**Fix:** Rewrite `message` as a statement of the subject (optionally with a `link-named-artifacts` path link); put the decision in `options[]` labels.

Review address: AP-100

### AP-100. runtime-rules-only

"`Never use prose where a formal schema construct exists`" / "`Modular over inline`" / checkpoint-message or README authoring standards in `rules.*` or technique `## Rules`

A design-time authoring standard is filed as a runtime rule.

**Detect:** A rule in `rules.*` or technique `## Rules` governs how to *write* workflows (content shape of YAML/technique/resource files, authoring standards) rather than current-session runtime conduct. Signals: restates a design principle or anti-pattern; would apply in an unrelated authoring session.

**Do not flag:** Runtime keepers — progress-tracker updates, corrections-must-persist, isolation/orchestration models, write-immediately, domain safety floors, worker permissions.

**Fix:** Remove it from `rules.*` or technique `## Rules`. Migrate it into the design-time canon — a principle, this catalogue, the construct inventory, or an existing covering entry. Enforce it in the authoring audit.

Review address: AP-101

### AP-101. no-caption-only-message

`Structural patterns from existing workflows, with proposed structure shown alongside.`

A checkpoint message is only a caption of the prior present step.

**Detect:** After a present-then-checkpoint step, `message` restates "what I just showed" with no durable subject and no decision-relevant fact.

**Do not flag:** Messages that link a persisted artifact (`link-named-artifacts`), state a decision-relevant fact, or name a loop discriminator options lack.

**Fix:** Persist, then link (`[label]({path})`), or reduce the message to the subject the options decide.

Review address: AP-102

### AP-102. no-technique-resource-dual-home

"`audit-anti-patterns` protocol lists per-entry Flag/Skip/Fix…` while `anti-patterns.md` already defines those criteria" / technique restates a linked resource's checklist, vocabulary, or detect rules"

Operative criteria are dual-homed in technique and resource.

**Detect:** A technique that loads or links a resource also embeds operative criteria that must be applied from that resource (parallel detect/fix lists, vocabularies, or compressed checklists). Both files hold the same facts — distinct from `resource-fills-not-does` and `no-resource-caller-backlink`.

**Do not flag:** A one-line pointer to the resource; technique-owned HOW the resource does not define; scan-scope paraphrase without repeating criteria. See also `operative-criteria-need-a-home`, `cited-home-owns-claim`, `no-shadow-audit-pass`.

**Fix:** Choose one home (usually the resource for reusable criteria, the technique for procedure); delete the duplicate. Migrate unique technique-only criteria into the resource before deleting them from the technique. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-103

### AP-103. cited-home-owns-claim

"Select the set from [guide]"

A citation attributes a fact to a home that lacks it.

**Detect:** A technique, resource, or guide attributes an operative fact to a linked home ("from X", "per X", "defined in X", "select … from X") and that fact is absent from X. It lives only in the citer, or nowhere. Test: the claim cannot be applied from X alone.

**Do not flag:** A citation that points at content in X. Orchestration that does not claim X owns it. An aspirational "see also" that asserts no ownership.

**Fix:** Move the fact into the cited home, or stop attributing it to X and own it in the citer (`operative-criteria-need-a-home`, `no-technique-resource-dual-home`).

Review address: AP-104

### AP-104. operative-criteria-need-a-home

"Flag every divergence matching: naming, field order, voice markers…"

Reusable criteria live only in a technique with no catalog/resource home.

**Detect:** Reusable Detect, Do not flag, and Fix criteria — or an equivalent checklist an agent reapplies across sessions — exist only inside a technique protocol, with no resource or catalogue home. Signals: a long criterion list, a classification vocabulary, a "scan for these markers" table.

**Do not flag:** One-off orchestration (step order, which files to open, how to present findings). A thin walker that names a home and applies it (`no-technique-resource-dual-home`). Criteria already homed in a resource or the catalogue while the technique is still fat.

**Fix:** Migrate the criteria into a resource or this catalogue. Leave the technique as a walker: load the home, apply it, present. A prohibited pattern belongs in the catalogue. A positive checklist belongs in a resource. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-105

### AP-105. no-shadow-audit-pass

"`audit-consistency` restates Tool-Technique-Doc Detect while `audit-anti-patterns` already walks that section"

An audit pass shadows another walker's Detect criteria.

**Detect:** An audit technique embeds a compressed copy of a catalog/resource's Detect criteria while another technique already walks that same home (full or scoped).

**Do not flag:** A thin scoped walker that loads a named section and applies each entry as written without restating Detect; distinct passes with distinct homes (e.g. inventory walk vs full catalog walk); non-audit techniques.

**Fix:** Delete the shadow Detect. Keep one walker per home, or a scoped walker that does not re-author the criteria. Fold a unique surface-check method into the catalogue entry or into the surviving walker's procedure.

Review address: AP-106

### AP-106. canon-layer-cites-not-restates

"Principle 4 prose embeds the full Schema Expressiveness / Description Hygiene Detect body already in the catalogue"

An upper canon layer restates Detect/Fix already owned below.

**Detect:** An upper canon layer — a design principle, a mode guide, README orientation — re-embeds a multi-sentence Detect or Fix body a lower layer already owns: this catalogue, the construct inventory, or a convention resource. Test: a named citation replaces the paragraph without losing an enforceable test. Also flag a duplicated marker list or rewrite recipe.

**Do not flag:** A short Rule statement plus a named citation. An Enforcement pointer to an activity or checkpoint. One clarifying sentence that does not repeat Detect steps. A layer that is itself the sole home (`operative-criteria-need-a-home`).

**Fix:** Keep the upper layer as the stance. Delete the restated Detect, the Detect-routing block, and a host Enforcement inventory (`no-resource-caller-backlink`). Migrate unique criteria down before deleting them. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-107

### AP-107. bind-site-is-orchestration-truth

"Review mode runs: expressiveness, conformance, rule-to-structure…"

A pass inventory disagrees with authoritative YAML bind sites.

**Detect:** Prose outside activity YAML enumerates an ordered or complete list of activities, steps, or technique passes, and that list is not generated from the authoritative bind sites (`steps[]` / loop bodies / `technique:`, plus `initialActivity` / the workflow `graph`). Test: the prose must change when a bind changes, but the YAML was not the source of the list.

**Do not flag:** Purpose/value orientation without a pass inventory; pointers to the YAML; at-a-glance activity names with one-line roles (`readme-orients-not-transcribes`); a technique that only applies a sibling without listing a parallel set.

**Fix:** Delete the third checklist, or replace it with a pointer to the binding activity/technique. If a summary is required, generate it from the YAML binds. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-108

### AP-108. numbered-protocol-phases

"### 1. Apply Fixes" with edit / re-validate / record as bullets under one heading

Discrete sequential protocol phases are collapsed into one numbered step.

**Detect:** A technique `## Protocol` has a numbered `### N. Title` whose body holds two or more bullets, or imperative sentences, that are distinct sequential phases. Each produces a different outcome, or must complete before the next. Test: reordering or dropping a bullet changes the phase sequence.

**Do not flag:** Bullets that elaborate one phase — how-to for one write, constraints on one apply, a loop body over one entry, mode branches of one action. A `>` caveat under a primary instruction. A single-bullet step.

**Fix:** Split into consecutive `### N. Title` steps, one phase per heading. Keep an elaborating bullet under the phase it refines. See [Phase by Sequenced Outcome](./design-principles.md#15-phase-by-sequenced-outcome).

Review address: AP-109

### AP-109. technique-outputs-declared

"Assemble the per-file drafting plan…" with no `## Outputs` entry

Capability or Protocol produces a value that is not declared on Outputs.

**Detect:** Technique Capability or Protocol assembles, derives, or returns a durable or gateable value — a plan, findings, a summary, a classification, a path, a count, a structured assessment — with no matching `### <id>` under `## Outputs`. Test: a later step, checkpoint, or consumer could bind or cite the value. A file also needs `#### artifact` (`artifact-not-buried`).

**Do not flag:** A pure side-effect with no bindable product (push, open a PR, mark ready) when no path or number is captured. A value already declared on Outputs. An input-only gap (`technique-inputs-declared`). Protocol that only presents a value to a user (`session-interaction-in-technique`); still declare the output when it is gateable.

**Fix:** Declare `### <id>` under `## Outputs` naming what the value is, and reference `{id}` where Protocol assembles it. Add `#### artifact` when the value is a file. The activity surfaces `{id}` (`session-interaction-in-technique`).

Review address: AP-110

### AP-110. duplicate-shared-capability

"`publish-workflow-pr` re-teaches `gh pr create` / `gh pr ready` / `git push` already covered by the `github` and `git` namespaces"

A workflow-local technique re-implements a capability a shared namespace already offers.

**Detect:** A workflow-local technique embeds a harness recipe in its Protocol for a capability a shared namespace already holds a technique for. Also flag a local re-teaching of a concurrent fan-out — `Task`, spawn-concurrent, or dispatch-then-merge — when [`orchestration-patterns`](/meta/techniques/orchestration-patterns/TECHNIQUE.md) or a borrowable [`meta/activities/patterns/`](/meta/activities/patterns/README.md) activity already covers the shape. Test: the local novelty is only parameters or caller-specific composition; the verb is already owned elsewhere. A shared op that almost fits, missing an input, optional flag, or output, still owns the capability.

**Do not flag:** A change to the shared op itself that keeps existing callers working — a new optional input, default, output, or small protocol branch. A new shared op when no shared capability exists yet. A local technique that only assembles caller-specific values while the activity binds the shared op. Session-level `dispatch-activity`.

**Fix:** Delete the local harness recipe. Bind the shared op from the activity, or borrow an activity that already binds it. Keep caller-specific value assembly in a local technique when the activity needs it (`canonical-technique-reference`, `no-duplicated-guidance`, `pass-orchestration-in-technique`). See [Prefer Shared Capability](./design-principles.md#18-prefer-shared-capability) and [Bind Sibling Techniques as Steps](./design-principles.md#25-bind-sibling-techniques-as-steps).

Review address: AP-111

### AP-111. contract-not-procedure

"### 7. Set Technique Flags" restating create/update/review recognition criteria already (or better) owned by Outputs

Protocol carries identity criteria or a trailing "Set …" phase that belongs on the Output contract.

**Detect:** A technique `## Protocol` (a) restates derivation, recognition, or decision-tree criteria for a declared Output, or (b) has a numbered phase whose sole job is to assign a pure projection of another output already produced (boolean flags that are `true` iff `{operation_type}` is a given enum). Test: deleting the Protocol copy leaves the Output description as the sole complete definition, or the phase only types derived fields.

**Do not flag:** Protocol that emits `{id}` by reference to Output criteria without restating the tree. A count or path emitted in the same phase that produced the bag or artifact. A mode branch that uses an already-bound value. Missing Outputs (`technique-outputs-declared`).

**Fix:** Move identity criteria onto the owning Output. Collapse a pure projection to a one-line Output description. Keep Protocol as work phases that emit `{id}`. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure). A workflow-variable shadow is `no-derived-state-shadow`.

Review address: AP-112

### AP-112. no-derived-state-shadow

"`is_update_mode` / `is_review_mode` alongside `operation_type`"

A derived shadow variable duplicates an authoritative state variable.

**Detect:** A workflow declares two or more variables where one is a pure projection of another — a boolean that is true iff a primary enum or string equals a constant, or a mirrored count of the same bag. A gate, a technique input, or a `setVariable` effect writes or reads the shadow. Test: a legal write can leave the shadow disagreeing with the source.

**Do not flag:** Distinct facts that merely correlate; Output prose that defines a projection without declaring a second workflow variable (`contract-not-procedure`); mode encoded only as rules/prose with no state variable (`mode-as-state`).

**Fix:** Keep the authoritative variable; rewrite conditions, technique inputs, and effects to compare it directly; delete the shadow declarations and every write to them. See also [Single Source of Truth](./design-principles.md#14-single-source-of-truth).

Review address: AP-113

### AP-113. session-interaction-in-technique

"Present `{drafting_plan}`" / "Present findings to the user" / "surface the summary in chat"

A technique performs or prescribes human/session interaction.

**Detect:** Technique Capability, Protocol, or Rules instructs presenting, surfacing, showing, narrating, or otherwise delivering content to a user, session, or chat. Test: the imperative needs a human audience or session channel to succeed, and no tool or technique owns that channel.

**Do not flag:** Assembling or persisting a declared output the activity will surface. An activity binding a tool or technique whose domain is external delivery (push, open a PR, send). Naming "the user's request" as an input origin (`io-agnostic-contract`). A stage or gate locus (`technique-stage-agnostic`).

**Fix:** Delete present, surface, and show-to-user phases. Keep assemble, derive, and persist that emit `{id}`. Put human-facing delivery on the binding activity (`action: message`, or a checkpoint message linking `{id}` or a path). See [Keep Session Interaction in Activities](./design-principles.md#24-keep-session-interaction-in-activities).

Review address: AP-114

### AP-114. pass-orchestration-in-technique

"`run-audit-passes`: Apply audit-expressiveness…" / "`publish-workflow-pr`: Apply push-branch, then create-pr…"

A technique's Protocol invokes other techniques to do work — sequencing sibling or shared techniques the binding site should carry as consecutive steps.

**Detect:** Technique Capability or Protocol applies, invokes, or runs another technique for work, by `Apply [technique]` or a `::` invocation, one or many. Signals: numbered phases that are each "Apply […]"; Capability that names a multi-pass pipeline or a façade over shared ops; Outputs that only re-export children. Test: moving each invoked op to its own `steps[]` entry at the binding site, with any local value-assembly technique kept separate, preserves behaviour.

**Do not flag:** A reference that invokes nothing (`unreachable-operation-reference`). Citing resources, including creation-guide Templates. Container I/O and rule merge. Activity `steps[]` and routine technique binds. Activity borrow, bind, or include of a reusable orchestration pattern. Tools. One produce path over tools and resources (load, derive, persist one product) with no Apply or `::` work invoke. Stage or gate locus without an op inventory (`technique-stage-agnostic`).

**Fix:** Delete the façade, or strip Apply and `::` work invokes from the Protocol. Bind each sibling or shared technique as its own step of the run that needs both, in the order required. Keep distinct local value assembly as a separate technique. See [Bind Sibling Techniques as Steps](./design-principles.md#25-bind-sibling-techniques-as-steps) and [A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading); also `bind-site-is-orchestration-truth`, `no-monolith-masking-steps`, `duplicate-shared-capability`.

Review address: AP-115

### AP-115. platform-semantics-in-capability

"Shared base contract… Inputs… are inherited by every technique… Techniques inherit the Rules below…"

Capability (or a techniques-folder README) teaches loader composition instead of naming what the contract contributes.

**Detect:** Capability on a container `TECHNIQUE.md` (workflow root or group), or orientation prose for that container, explains how the loader applies the contract: Inputs, Outputs, or Rules inherited or merged into descendants; a technique set implied by folder contents; a standalone-versus-group placement lecture; or a trailing "Techniques inherit the … below" clause. Test: the sentence teaches how composition works rather than what shared contract exists.

**Do not flag:** A platform home — [schema-construct-inventory](./schema-construct-inventory.md), [workflow-canonical](/meta/resources/workflow-canonical.md), design-principles, this catalogue, or a meta harness or engine resource whose domain is the platform. A one-line contribution statement with no merge lecture. A README note that `techniques.activity` strategy techniques apply to every activity. A delivery or tool recipe (`no-delivery-mechanism-narration`, `no-tool-usage-prescription`).

**Fix:** Delete composition, placement, and inherit-trailer prose. Leave what shared I/O, rules, or invariants this contract holds. See [State Contract Contribution](./design-principles.md#27-state-contract-contribution).

Review address: AP-116

### AP-116. no-template-creation-guide

"Persist a decision-facing report: classification summary… integrity verdicts… removals inventory — via write-artifact … bare filename `impact-analysis.md`" (full layout recipe in Protocol; no creation-guide Template)

A planning artifact is persisted without a creation-guide Template, or the technique invents the layout in Protocol instead of citing one.

**Detect:** A technique persists a session planning artifact by bare filename and either no workflow resource owns that filename with a `## Template` (or named template anchor), or Protocol embeds a competing section or table recipe rather than citing the guide. Shared satellites may share one guide.

**Do not flag:** A non-planning output (a variable, a PR, a commit). A cite of an existing Template with short when/which bullets. Wrapper ceremony around a template (`no-guide-wrapper-ceremony`). Fill content that lives in the resource Template while Protocol only orders persist.

**Fix:** Author or extend a creation-guide resource with `## Template` and `## Rules`. Map the bare filename in the resources index. Replace the Protocol layout with a cite to `#template`. See [Creation Guide for Generated Documents](./design-principles.md#28-creation-guide-for-generated-documents); also `resource-fills-not-does`, `no-technique-resource-dual-home`.

Review address: AP-117

### AP-117. no-engine-mechanics-as-rules

"ambient-bag-variables-changed — Declared outputs appear in the activity's `variables_changed`"

A leaf Rule (or a Protocol phase whose only job is the same restatement) re-encodes engine or binding mechanics that already have an authoritative home.

**Detect:** A technique, activity, or workflow `## Rules` or `rules[]` entry — or a Protocol phase that only restates bag, envelope, binding, or dispatch mechanics — repeats a contract owned by workflow-engine, variable-binding, finalize-activity, or schema composition. Examples: declared outputs land via `variables_changed`; mutations use the sanctioned channel; loops and conditions are structural. The entry adds no domain invariant those homes do not already encode.

**Do not flag:** A domain constraint the engine does not enforce. An engine or conduct surface whose domain is that contract. An activity `set` that duplicates a technique output (`no-set-of-technique-output`). A tool or delivery recipe (`no-tool-usage-prescription`, `no-delivery-mechanism-narration`). A rule that restates its own technique's Protocol (`no-rule-protocol-restatement`). A worker or orchestrator prompt that only sequences entry tools and cites homes (`prompt-restates-owned-mechanics`).

**Fix:** Delete the leaf restatement. Keep declared Outputs and rely on the engine home. Where that home is incomplete, fix it once there. See also `no-one-step-rules`, `platform-semantics-in-capability`, `prompt-restates-owned-mechanics`.

Review address: AP-118

### AP-118. no-bind-mechanics-as-prose

"When unbound, use `{worker_result.artifacts_produced}` from the orchestrator bag after dispatch."

Prose substitutes for a bind decision that structure already owns.

**Detect:** Definition prose outside the bind home — an I/O description, Capability, a Protocol aside, a Rule, README orientation, option or action text — tells the agent how to obtain, satisfy, fall back, remap, or otherwise resolve a declared input or output. That resolution belongs in [variable-binding](/meta/techniques/variable-binding.md), in call-site `step.technique.inputs` or `outputs` deviations, or in a declared `default`. Test: deleting the sentence leaves a binding gap that structure should close, or the sentence only teaches how to get the value into the technique.

**Do not flag:** The variable-binding technique and any surface whose domain is bind resolution. A declared `default` or an optional or required marker. Meaning, shape, and allowed values. Protocol that consumes an already-bound `{id}`. Engine mechanics restated as Rules (`no-engine-mechanics-as-rules`). Naming a specific producer or consumer (`io-agnostic-contract`).

**Fix:** Delete the bind prose. Close the gap with a same-name bag binding, a declared `default`, or a call-site input or output deviation. Delete unused I/O. Where structure cannot express the resolution, extend variable-binding or the schema once. See also `io-agnostic-contract`.

Review address: AP-119

### AP-119. procedure-in-io-contract

"`applied_fixes` — the selected findings implemented in `{target_path}`, verified to compile with tests passing, then staged and committed on `{branch_name}` — final phase, no separate commit step follows" / "Branch to push to (typically the current branch — do NOT create a new branch in the parent repo)" / "`needs_issue_creation` — false when step 1 verified an existing issue; Gates steps 2 and 3"

An Input or Output description holds how the value is produced or used.

**Detect:** An `## Inputs` or `## Outputs` description carries an imperative, a do/don't, a multi-step population, sequencing ("final phase", "gates steps N"), a conditional duty ("when absent, then…"), a checkpoint duty, or a recovery recipe. An Output may still state how the value is recognised. Test: the sentence answers how the value is produced, or what to do with it, rather than what it is.

**Do not flag:** Meaning, shape, or allowed values, including a brief shape example. Output recognition criteria that do not narrate work steps. A declared `default`, or optional/required. Bind-resolution prose (`no-bind-mechanics-as-prose`). HOW already in Protocol or a cross-cutting Rule. Identity criteria sitting in Protocol (`contract-not-procedure`). A producer or consumer named with no duty (`io-agnostic-contract`). A technique hyperlink (`technique-ref-in-io-contract`).

**Fix:** Leave the bind contract on the entry. Move the how into a Protocol step that references `{id}`, or into a Rule when it cuts across steps. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure).

Review address: AP-120

### AP-120. procedure-in-capability

"Create README.md … populating its header fields … applying mode-aware Progress Status … (seed-time exclusion uses the cancelled/N/A value)" / "via meta [create-pr](…)" / "Applied-fix record (`{fixes_applied}`)"

`## Capability` holds how, a hyperlink, or a `{id}`.

**Detect:** Capability carries an imperative past naming the product, sequencing, a mode branch, or a seed/fallback; or a markdown link to another file; or a brace designator (`{fixes_applied}`). Test: the sentence answers how to perform it, where else to look, or which bag id it is.

**Do not flag:** A product statement with no link and no `{id}` (a bare name may name the product). A container naming its shared contribution (`platform-semantics-in-capability`). HOW, `{id}`, and cites already in Protocol, Rules, or I/O. Bind-resolution prose (`procedure-in-io-contract`, `no-bind-mechanics-as-prose`, `brace-declared-ids`).

**Fix:** Leave the insight. Move how, designators, and cites into Protocol, Rules, or I/O. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure).

Review address: AP-121

### AP-121. rule-as-protocol-step

"4. Follow the rules in the techniques bundle throughout — agent-conduct, workflow-engine…"

A standalone / cross-cutting rule is encoded as a numbered Protocol (or bootstrap-instruction) step instead of living under `## Rules`.

**Detect:** A Protocol phase, bootstrap-instruction bullet, or sequenced list states only a standing invariant, prohibition, or "follow X rules throughout" duty, with no produce, transform, or persist outcome for that step. Test: removing the step leaves the work sequence intact, and the sentence still belongs as a constraint on the whole technique or session. The inverse is `no-one-step-rules`.

**Do not flag:** A work phase that cites a Rule or resource policy while doing work. A step-local `>` caveat (`constraint-as-blockquote`). One-step guidance filed as a Rule (`no-one-step-rules`). A Rule that restates Protocol (`no-rule-protocol-restatement`).

**Fix:** Move the invariant into `## Rules` — the technique, the prompt resource, or the container `TECHNIQUE.md`. Keep Protocol as sequenced work outcomes. On a prompt or bootstrap surface, a standing duty belongs under that resource's Rules.

Review address: AP-122

### AP-122. prompt-restates-owned-mechanics

"Exception — inlined `step_techniques`: … EMIT a one-line `▶ step <step_id>` begin-beat… Resource bodies are never nested inside…"

A worker/orchestrator spawn stub or agent-entry technique restates delivery, bind, checkpoint, or engine HOW that already has an authoritative home.

**Detect:** Stub or agent-entry prose explains a bundling budget, a begin-beat, `step_techniques` engagement, sibling `resources` map reuse, bind precedence, yield or replay branching, or another contract owned by a technique's Protocol or Rules — [variable-binding](/meta/techniques/variable-binding.md), [yield-checkpoint](/meta/techniques/workflow-engine/yield-checkpoint.md), [workflow-engine](/meta/techniques/workflow-engine/TECHNIQUE.md) — or by the tool response itself (`step_techniques_note`, `resources_note`, a reference-mode note). Test: deleting the paragraph and leaving a cite to that home preserves fidelity.

**Do not flag:** A minimal [compose-prompt](/meta/techniques/workflow-engine/compose-prompt.md) stub (entry tools plus Apply `{agent_technique}`). A novel duty with no other home — hoist it into engine or conduct once, then cite it. A one-line cite to the home. A role-boundary Rule; an account of what the other role does is `instruction-narrates-an-actor`.

**Fix:** Delete the restatement. Keep the imperative entry sequence and cite the home. Hoist a unique duty that still has no home into workflow-engine or the owning technique once. See also `no-delivery-mechanism-narration`, `no-engine-mechanics-as-rules`, `no-duplicated-guidance`.

Review address: AP-123

### AP-123. capability-as-op-inventory

"Techniques and rules for executing a workflow's structured flow — session lifecycle (list/match/scan/create/start), activity dispatch (dispatch-activity), agent entry techniques (activity-worker, workflow-orchestrator) composed via compose-prompt, …"

`## Capability` (especially a container `TECHNIQUE.md`) enumerates nested ops, facets, or folder contents instead of stating a succinct contribution overview.

**Detect:** Capability is a comma or em-dash inventory of child techniques, protocol facets, or folder techniques, often with a hyperlink to each, rather than what the contract or group contributes. Test: the sentence must be edited whenever a nested technique is added, renamed, or removed, and a reader could get the same list from the folder or index.

**Do not flag:** A one- or two-clause purpose statement that names the domain without listing children. Leaf Capability that names the single product (`procedure-in-capability`). A container contribution statement for shared I/O or rules (`platform-semantics-in-capability`). README orientation that points at an index table (`readme-orients-not-transcribes`).

**Fix:** Rewrite Capability as the shared domain. Leave the technique catalogue to the folder, the techniques index, or the YAML binds. See [State Contract Contribution](./design-principles.md#27-state-contract-contribution); also `platform-semantics-in-capability`, `procedure-in-capability`.

## Reconciled recommendations affecting these entries

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

## AS-06

**Confirmed · correction · P2**

Scope: [AP-15 · procedure-in-protocol](sources/anti-patterns.md#ap-15-procedure-in-protocol), [AP-10 · loop-not-prose](sources/anti-patterns.md#ap-10-loop-not-prose), [AP-104 · operative-criteria-need-a-home](sources/anti-patterns.md#ap-104-operative-criteria-need-a-home).

**Assessment.** The detector includes numbered criteria and iteration but the remedy always chooses Protocol. Reusable criteria and structural session loops need their existing owners.

**Witness.** A step description contains a reusable numbered list of audit criteria. AP-15 says to move the imperative bullets into Protocol; AP-104 then flags those reusable criteria for living only in Protocol. A description repeating several bound steps for each session item similarly needs AP-10's loop, not a prose loop in the technique.

**Suggested wording.** Replace Detect with: 'A step description carries work instructions or reusable criteria whose owning construct is elsewhere.' Replace Fix with: 'Classify the content first: encode session sequencing, iteration, and gates in steps; place one technique's procedure in its Protocol; place reusable criteria in their resource and cite it from Protocol. Leave only an unbound step's one-line purpose, or remove description from a bound step.' Keep ownership references rather than repeating their detailed tests.

**Observing check.** Positive: A reusable criterion list in a step description moves to a criteria resource, with the technique applying its section. Negative: A one-application procedure moves to Protocol; an activity loop remains a loop and is not converted to local prose.

Evidence addresses: AP-15 lines 244–248; AP-10 lines 184–188; AP-104 lines 1340–1344.

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

## AS-18

**Confirmed · correction · P1**

Scope: [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique), [AP-157 · unreachable-operation-reference](sources/anti-patterns.md#ap-157-unreachable-operation-reference), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps).

**Assessment.** Replacing the raw tool with a wrapping-technique call in the same Protocol introduces the work invocation that pass-orchestration-in-technique removes.

**Witness.** A local analysis technique says 'Use gitnexus_context on the symbol', and a shared context technique owns that capability. AP-51's Fix becomes 'Apply `[context](...)` (name: {symbol})' in the same Protocol. That exact call is an Apply of another technique for work and satisfies AP-114's Detect. Removing Apply but leaving a consult link invokes AP-157's separate availability check.

**Suggested wording.** Replace AP-51 Fix with: 'Bind the owning shared technique at the activity or routine and pass its product to the local technique. Remove the local raw-call recipe. Where the local step is an explicitly permitted unaided recovery path, retain its raw tool call under the existing exception.' Clarify that canonical link syntax applies only on surfaces allowed to reference that technique; it does not authorize a Protocol-to-Protocol invocation. Reconcile invocation-format and missing-argument entries against this same allowed-surface boundary.

**Observing check.** Positive: A local reimplementation of a shared call is replaced by a shared activity/routine bind and a declared input for the local consumer. Negative: The wrapper's own primitive call and an explicitly allowed unaided remedy remain valid; no Apply of a sibling is introduced into an ordinary technique Protocol.

Evidence addresses: AP-51 lines 688–692; AP-114 lines 1464–1468; AP-157 lines 2032–2036; DP-25 lines 117–117.

[Original candidate](reviews/ap_structures/findings-05.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-21

**Narrowed · correction · P2**

Scope: [AP-59 · constraint-as-blockquote](sources/anti-patterns.md#ap-59-constraint-as-blockquote), [DP-31 · Isolate Conditional Branches as Notes](sources/design-principles.md#31-isolate-conditional-branches-as-notes), [AP-108 · numbered-protocol-phases](sources/anti-patterns.md#ap-108-numbered-protocol-phases).

**Assessment.** The exception must distinguish primary choice work from a conditional caveat on another instruction. Do not ban ordered work ladders or infer a renderer defect without implementation evidence.

**Witness.** Under 'Resolve the endpoint', an indented If/Else-if/Otherwise ladder describes fallback cases of that instruction. It is a conditional caveat inside one step under DP-31, yet AP-59's 'at any indent' exemption appears to allow the sub-bullets whose flattening the Detect warns about. This is an exception boundary conflict, not a claim that every ordered ladder is prohibited.

**Suggested wording.** Replace the ladder exception with: 'An ordered sub-action or precedence ladder that is itself the work instruction, rather than a conditional caveat on another instruction.' Add: 'Fallback branches qualifying one instruction use the same note form even when written as If/Else-if/Otherwise.' Keep the condition-to-structure distinction for branches that select whole steps or activities.

**Observing check.** Positive: An indented fallback ladder qualifying one lookup is flagged until represented as a note under that lookup. Negative: A primary ordered work sequence remains ordered work; a proper conditional note and an activity-level structural branch both pass.

Evidence addresses: AP-59 lines 784–788; DP-31 lines 141–141; AP-108 lines 1394–1394.

[Original candidate](reviews/ap_structures/findings-06.json) · [Independent disposition](reconciliation/ap-04.json).

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

## PD-11

**Narrowed · improvement · P3**

Scope: [DP-24 · Keep Session Interaction in Activities](sources/design-principles.md#24-keep-session-interaction-in-activities), [AP-113 · session-interaction-in-technique](sources/anti-patterns.md#ap-113-session-interaction-in-technique).

**Assessment.** The title already bounds DP-24 to session interaction, and activity ownership of when/how can include binding a domain delivery operation. AP-113 clarifies that boundary rather than contradicting the principle. The body word person is broader than necessary, so a concise wording improvement remains useful.

**Retained issue.** Use operator/session presentation language and distinguish domain effects.

**Suggested wording.** Use: "Activities own in-session presentation and operator decisions. A bound technique may perform a domain delivery operation through its owning tool; the activity owns when that operation runs." Retain any declared delivery evidence without requiring every pure side effect to acquire a new Output.

**Observing check.** Positive: A domain-analysis technique directly narrates its findings into operator chat: move that presentation to the activity. Negative: A bound notification or publication operation performs its domain effect. Its existence does not violate the session-presentation boundary or automatically authorize sending anything.

Evidence addresses: DP-24 lines 111–114; AP-113 lines 1446–1457.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-03.json).

## PD-13

**Narrowed · improvement · P3**

Scope: [DP-28 · Creation Guide for Generated Documents](sources/design-principles.md#28-creation-guide-for-generated-documents), [AP-116 · no-template-creation-guide](sources/anti-patterns.md#ap-116-no-template-creation-guide).

**Assessment.** A raw evidence capture is a useful omitted category, but machine-generated or schema-validated alone is not a sound exemption: an agent-authored planning ledger can be JSON and still need filling criteria. A creation guide can also instruct byte preservation, so the current rule does not inherently require altering a capture.

**Retained issue.** Distinguish an authored planning artifact from a preserved external/tool-produced evidence format.

**Suggested wording.** Use: "Planning documents whose content a technique authors or fills have a creation guide. A byte-exact capture or producer-defined evidence format cites its producer/format contract and preserves its bytes; it needs no competing layout template. Structured authored planning data still has operative filling criteria, even when a schema validates its shape."

**Observing check.** Positive: An authored decision report or JSON findings ledger lacks the criteria needed to fill its substantive fields: retain the creation-guide requirement. Negative: A byte-exact tool transcript with source identity and hash preserves its authoritative format without a second prose template.

Evidence addresses: DP-28 lines 127–130; AP-116 lines 1482–1493.

[Original candidate](reviews/principles/findings-04.json) · [Independent disposition](reviews/principles/independent-review-04.json).
