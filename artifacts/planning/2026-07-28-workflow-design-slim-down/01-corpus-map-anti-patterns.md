**Corpus root:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design/`
Below, **`AP`** = `<root>/resources/anti-patterns.md` (1710 lines, 129 AP entries + 4 MR entries), **`DP`** = `<root>/resources/design-principles.md` (30 principles).

---

# 0. Ground facts the redesign has to survive

| Fact | Cite |
|---|---|
| The catalogue forbids citing its own entry count and bare historic numbers — cite by kebab **name** | `AP:25` "Cross-references use the name in backticks … Do not cite bare historic numbers, and do not cite the catalog's entry count (it drifts)." |
| 9 activity YAMLs, 1926 lines total | `<root>/activities/` (`01,03,04,05,06,08,09,10,11`) |
| **Largest activity today already has 27 technique-binding steps / 530 lines** | `activities/08-quality-review.yaml` |
| Second largest: **29 technique binds / 247 lines** | `activities/10-post-update-review.yaml` |
| 20 `#### artifact` declarations across 39 technique files → 17 distinct bare filenames | `grep -c '#### artifact' techniques/` |
| 7 of those 17 are audit-findings satellites, already sharing **one** creation guide with a `**Pass:**` discriminator | `resources/findings-satellite.md:12`, `:20`; map row `resources/README.md:58` |
| 63 workflow variables, of which 7 are `*_findings_path` | `workflow.yaml:153–179` |
| 9 separate `write-artifact` binds in one activity | `activities/08-quality-review.yaml` (`manage-artifacts::write-artifact` ×9) |

---

# PART A — The 21 named entries, confirmed and quoted

## (a) Activity structure and activity rules

### AP-69. `no-activity-prose-rules` — `AP:918–928`
Exemplar: ``rules: ["Manual diff review is FIRST", "all reviews must complete before validate"]`` (`AP:920`)
- **Detect:** "Any activity-level `rules:` entry. Activity is pure mechanics — constraints live in `steps[]` order, `when`/`condition`, transitions, decisions, checkpoints, loops — not prose."
- **Do not flag:** "N/A — activity `rules:` should be empty; behavioral guidance belongs on bound techniques."
- **Fix:** "(a) restates structure already enforced → **delete**; (b) technique-behavioral constraint → **migrate** to the owning technique (`single-rule-authority`); (c) genuine unenforced constraint → **encode** as `when`/`condition`, transition, decision, checkpoint, or `required: false` (hard gates use `when`/`condition`; step `required` is a worker hint only). End state: no activity `rules:` block."

> This is a **zero-tolerance** entry with a literally empty carve-out. It is the single hardest constraint on activity merging: every ordering constraint that today lives across an *activity boundary* must land in `steps[]`/`when`/`condition` after the merge — it may not become prose.

### AP-38. `no-duplicate-technique-steps` — `AP:542–552`
Exemplar: ``steps: - id: map-findings / technique: compare-finding-sets …` (×N)`` (`AP:544`)
- **Detect:** "Two or more step definitions in one activity bind the same technique reference. Classify: (a) **redundant re-execution** — differ only by which already-produced output to surface → collapse to one step; (b) **unrolled iteration** — same op on N collection items → one `forEach` with one binding; (c) **monolith-masking** — distinguished only by a sub-mode input → split into a group with one named op per mode (`no-monolith-masking-steps`)."
- **Do not flag:** "Fixed roster of distinct static targets with different structured inputs (not a clean iterable); mutually exclusive `when` branches (only one fires); distinct-purpose invocations at different pipeline points (initial vs final commit); same op as distinct phases inside one loop iteration."
- **Fix:** "Apply collapse / loop / split per classification; leave the exceptions above."

> **This is the entry the merge actually trips.** Scope is *"in one activity"* — merging activities concatenates their duplicate-bind rosters. `08-quality-review.yaml` already binds `write-artifact` 9× and survives only on the "fixed roster of distinct static targets" carve-out. Merge `08` + `10` (5 more binds) and the roster becomes 14 pass→filename pairs — i.e. a *clean iterable*, so classification (b) fires and the carve-out evaporates.

### AP-34. `no-valueless-control-set` — `AP:494–504`
Exemplar: "control step `set` with `target` + `description`, no `value:`" (`AP:496`)
- **Detect:** "A control step (no `technique`) has value-LESS `set`s (`target` + `description`, no `value:`) whose descriptions carry sourcing/derivation HOW for a domain payload."
- **Do not flag:** "Value-BEARING control `set`s for orchestration/flow state; bound-step `set` of technique product (`no-set-of-technique-output`)."
- **Fix:** "Bind a technique whose outputs/protocol own the derivation; delete the value-LESS activity sets."

### AP-52. `brace-declared-ids` — `AP:714–724`
- **Detect:** "(a) bare declared id as plain words; (b) orphan enum/index value not tied to its input ("index 23"); (c) disguised id in backticks or `<angles>` without braces. Spelling must match the declared id exactly (`### problem_statement` → `{problem_statement}`). Forms: `{input_id}` / `{output_id}` / `{output_id}.field` / `{$local}`."
- **Do not flag:** "Ordinary English that only coincides with an id; backticked literals that are not declared ids (shell commands, filenames, tool params)."
- **Fix:** "Brace as `{declared_id}`; for orphan values write "when `{declared_id}` is 23"; replace disguise wrappers with braces. Brace only when the token is used as a reference to that value."

## (b) Artifact creation and creation-guides

### AP-116. `no-template-creation-guide` — `AP:1502–1512`
- **Detect:** "A technique persists a session planning artifact by bare filename and either (a) no workflow resource owns that filename with a `## Template` (or named template anchor) section, or (b) Protocol embeds a competing full section/table recipe for the file body rather than citing the guide's template. **Shared satellites may share one guide; every persisted bare filename must still map to a guide.**"
- **Do not flag:** "Non-planning outputs (variables, PRs, commits); citing an existing Template with short when/which bullets only; `no-guide-wrapper-ceremony` (too much wrapper around a template — opposite pole); fill content that lives correctly in the resource Template while Protocol only orders persist."
- **Fix:** "Author or extend a creation-guide resource with `## Template` + `## Rules`; map the bare filename in the resources index; replace Protocol layout essays with a cite to `#template`."

> Read the direction: the obligation is **filename → guide**, not guide → filename. **Dropping artifacts cannot trip AP-116**; it only reduces the mapping burden. Backed by `DP:127` (§28): "Shared shapes may share one guide; every bare filename still maps to a guide."

### AP-97. `link-named-artifacts` — `AP:1266–1276`
- **Detect:** "A user-presented checkpoint or action `message` names or implies a durable file artifact without `[label]({path_variable})`, or the link hard-codes a numeric `NN-` prefix."
- **Do not flag:** "Pure in-chat subjects (no durable file); internal `set`/`log` diagnostics that are not user-presented artifact references."
- **Fix:** "Declare a path output on the producing technique; persist before the message when needed; interpolate `[label]({path_variable})`. Never hard-code `NN-` … On checkpoints the message stays a statement."

> Bidirectional constraint on artifact-dropping: **drop the artifact and you must also drop it from every checkpoint message**, otherwise the message names a file with no `{path_variable}` to link.

## (c) Technique granularity, orchestration placement, facades

### AP-114. `pass-orchestration-in-technique` — `AP:1478–1488`
Exemplar (verbatim, and it is *this* workflow): "``run-audit-passes`: Apply audit-expressiveness…" / "`publish-workflow-pr`: Apply push-branch, then create-pr…`" (`AP:1480`)
- **Detect:** "Technique Capability or Protocol applies, invokes, or runs another technique/operation for work via Protocol `Apply [technique]` / `::` op invocation (one or many). Signals: numbered phases that are each "Apply […]"; Capability that names a multi-pass audit/pipeline or a façade over shared ops; Outputs that only re-export children. Test: if moving each invoked op to its own activity `steps[]` entry (keeping any local value-assembly technique separate) preserves behavior, flag it."
- **Do not flag:** "Citing resources (including creation-guide Templates); non-invoking technique hyperlinks used as documentation/canonical reference; loader `Initial`/`Final` wrap and container I/O merge; activity `steps[]` technique binds; activity borrow/bind/include of reusable orchestration patterns; tools; **a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag) with no Protocol Apply/`::` work invoke**; stage/gate locus without an op inventory."
- **Fix:** "Delete the façade or strip Apply/`::` work invokes from the Protocol; bind each sibling or shared operation as its own activity step in the order required; keep only distinct local value assembly (if any) as a separate atomic technique."

> **The decisive entry for #321.** A "collapse 6 audit techniques into 1" move is a named exemplar of this smell — unless the merged technique is a *single load→derive→persist produce path over resources* (the bolded carve-out). Enforced by `DP:113` (§25) and `DP:117` (§26): "Technique→technique work calls remain forbidden — techniques stay atomic over tools and resources."

### AP-110. `duplicate-shared-capability` — `AP:1430–1440`
- **Detect:** "A non-meta technique's Protocol embeds a harness recipe (git push, `gh pr create`, `gh pr ready`, commit/stage, issue mutate, …) for a capability that already exists as a meta or cross-workflow shared op. Also flag local re-teaching of concurrent `Task` / spawn-concurrent / dispatch-then-merge pipelines when [`orchestration-patterns`] or a borrowable [`meta/activities/patterns/`] activity already covers the shape. Test: the local novelty is only parameters or caller-specific composition …; the verb/recipe is already owned elsewhere. **Near-misses count** — an existing shared op that almost fits but lacks an input, optional flag, or output still owns the capability."
- **Do not flag:** "Parameterization or minor refactor of the shared/meta op itself to accommodate a new caller's diversity (new optional inputs, defaults, outputs, or small protocol branches) while preserving existing callers; adding a new shared op when no shared capability exists yet; a local technique that only assembles caller-specific values … while the activity binds the shared op as its own step; session-level `dispatch-activity`."
- **Fix:** "Delete the local harness recipe; bind the shared/meta op from the activity (or borrow an activity that already binds it); keep only caller-specific value assembly in a local technique if needed."

### AP-68. `technique-stage-agnostic` — `AP:906–916`
- **Detect:** "Technique Capability/Protocol/Rules (a) mention stage/activity (named or "calling/consuming/producing activity"), checkpoint, loop/iteration, transition/decision routing, or position/timing in the activity flow ("after each task", "before user confirmation", "before the next step"), or (b) prescribe user confirmation, approval, or choice … as if the technique itself owns that gate. Test: if the sentence answers *where/when in the workflow?*, *which checkpoint surrounds me?*, or *how does the user decide?*, flag it."
- **Do not flag:** "Purpose-phrased work with no orchestration locus ("final validation", "no separate commit step follows"); values the technique emits for the activity to route (counts, paths, severity, recommended option id); inventoring decisions *into* an artifact the activity will gate on; bare present/surface-to-user with no stage or gate named."
- **Fix:** "Migrate user-facing decisions to activity `kind: checkpoint` steps gated on technique outputs; migrate other orchestration to activity transitions/`when`/loops. Rewrite the technique to produce the durable evidence (artifact section, count, path) without naming the gate."

> **This is the entry that makes activity merging *cheap* and technique merging *expensive*.** Because techniques are already stage-blind by mandate, moving them between activities is free — no technique text changes when 9 activities become 4. Conversely `audit-anti-patterns.md:42` currently says "Persist … via **the calling activity's** bound `manage-artifacts::write-artifact` step" — that is already an AP-68(a) hit ("calling … activity") and it will need rewriting whichever way #321 goes.

## (d) Rule hygiene and duplication

### AP-19. `no-rule-protocol-restatement` — `AP:310–320`
- **Detect:** "A technique/activity/workflow rule restates a protocol bullet or phase without adding an invariant the steps do not already convey."
- **Do not flag:** "Rules that state cross-cutting constraints the protocol does not encode."
- **Fix:** "Delete the redundant rule; keep protocol as the procedural source."

### AP-22. `single-rule-authority` — `AP:346–356`
- **Detect:** "The same *orchestrator-only* rule (variable management, transitions, commit policy, mode handling) — or a rule that does not need worker reach — appears at multiple levels (workflow → activity → technique). Cross-level copies drift."
- **Do not flag:** "Worker-directed behavioural rules that must stay reachable on activity/technique surfaces — see `worker-rule-reach`."
- **Fix:** "Keep one authoritative home at the level where the rule is enforced; delete the duplicates."

### AP-24. `no-contradictory-rules` — `AP:370–380`
- **Detect:** "Two rules in the same technique (or same rules bucket) prescribe mutually exclusive behaviours."
- **Do not flag:** "Rules disambiguated by group keys for different contexts (`rule-group-disambiguation`)."
- **Fix:** "Identify the stale rule and remove or rewrite it so the set is logically consistent."

> Note the scope widening in the Detect: *"or same rules bucket"*. Merging activities merges their rule buckets — two rules that were consistent in separate activities become co-listed siblings. This is the one rule-hygiene entry a merge can trip *without any text being edited*.

### AP-25. `no-one-step-rules` — `AP:382–392`
- **Detect:** "A `## Rules` entry constrains a single protocol step/phase rather than a cross-cutting invariant."
- **Do not flag:** "Cross-cutting rules that span multiple phases; step-local caveats already filed as `>` notes (`constraint-as-blockquote`)."
- **Fix:** "Move the guidance into that step's protocol prose (or a `>` caveat) and delete the rule."

### AP-74. `no-duplicated-guidance` — `AP:982–992`
- **Detect:** "Identical or near-identical behavioural instructions appear in multiple techniques and/or tool descriptions (including harness HOW restated outside meta engine/conduct/bootstrap …)."
- **Do not flag:** "A single authoritative home with pointers elsewhere; meta surfaces whose domain is tool usage."
- **Fix:** "Keep one authoritative location; replace duplicates with references to it."

### AP-121. `rule-as-protocol-step` — `AP:1562–1572`
- **Detect:** "A Protocol phase, bootstrap-instruction bullet, or similarly sequenced HOW list states only a standing invariant, prohibition, or "follow X rules throughout" duty — no distinct produce/transform/persist outcome for that step. Test: if removing the step leaves the work sequence intact and the sentence still belongs as a durable constraint on the whole op/session, flag it. Inverse of `no-one-step-rules`."
- **Do not flag:** "Work phases that *cite* a Rule or resource policy while doing work (`Apply … per [Status transition policy]`); step-local `>` caveats; true one-step guidance wrongly filed as a Rule; Rules that restate Protocol."
- **Fix:** "Move the invariant into `## Rules` … Keep Protocol as sequenced work outcomes only."

### AP-129. `stale-restatement-after-change` — `AP:1700–1710`
- **Detect:** "When a change alters a behavioural claim — a gate, precondition, default, or ordering — take the pre-change phrasing as the search key and sweep the whole definition tree: every README tier, activity `description`, technique `## Capability`, `outcome[]`, and resource body. Flag each surviving occurrence that still asserts the pre-change behaviour. **The test is occurrence count against the tree, not against the change's file list**: a manifest naming one file for a claim that appears in three is the same defect."
- **Do not flag:** "Restatements already accurate and unaffected by the change; planning-folder artifacts that record the before state deliberately; a claim held once in a single authoritative home."
- **Fix:** "Update every occurrence in one edit and record the count in the change's file manifest so the sweep is auditable. Where the claim needs only one home, delete the restatements instead of updating them."

> **The #321 tax entry.** Dropping 12 artifacts and 5 activities changes an ordering claim in: `resources/README.md:39–58` (guide map), `resources/README.md:12–35` (index), `resources/findings-satellite.md:12` (bare-filename roster), `techniques/compile-report.md:11–19` (optional `*_findings_path` inputs), `workflow.yaml:153–179` (7 path variables), `activities/README.md`, `<root>/README.md`. AP-129 requires all of them in **one edit** with a **counted manifest**.

## (e) Resource shape and delivery

### AP-42. `io-agnostic-contract` — `AP:594–604`
- **Detect:** "An input/output entry names or links a workflow-internal producer/consumer — another technique ("from [analyze-failure]", "produced by build-function-registry"), activity ("from the elicitation activity"), step, checkpoint, loop, or workflow/activity file. Describe what the value IS (meaning, shape, allowed values), never its position in a particular workflow."
- **Do not flag:** "Protocol/Capability utilisation ("use technique X", "go through cargo-operations::fmt-fix"); intrinsic/external origin ("git diff output", "the user's request", "provided by the server"); I/O links to a resource/template section (shape of the value)."
- **Fix:** "Rewrite the entry generically; drop workflow-internal source/destination naming."

### AP-55. `hoist-shared-inputs` — `AP:750–760`
- **Detect:** "The same input is re-declared on many techniques instead of once on the smallest common container (group or workflow-root `TECHNIQUE.md`; `composeLoaded` merges container I/O/Rules into descendants). Related smell: path-flavored id (`planning-folder-path`) … Synonym drift for one concept across leaves."
- **Do not flag:** "Niche inputs shared by only two or three techniques — do not push those to the root just to dedup."
- **Fix:** "Hoist the shared input to the container under one canonical id; delete per-technique declarations; reference `{id}` via inheritance. Hoist genuinely workflow-wide contextual inputs (artifact location, target path) even if some leaves never reference them. Producer/consumer values still hoist: shared input on ancestor + producing technique also declares it as output (input∩output …)."

## (f) Checkpoints and gates

### AP-98. `no-next-step-narration` — `AP:1278–1288`
- **Detect:** "Checkpoint/action `message` or option `description` narrates next-step routing or auto-advance timing that the schema already owns (`transitions`, `autoAdvanceMs`, `defaultOption`, option labels)."
- **Do not flag:** "Pure factual status clauses with no routing/timing narration."
- **Fix:** "Delete the narration; keep timing/routing in `autoAdvanceMs`, `defaultOption`, `transitions`, and option labels only."

> Merge-relevant: when an activity boundary disappears, any checkpoint message that said "Continuing to <next activity>" is now narrating an *intra*-activity step — still AP-98, and now with no `transitions` entry to own it.

## (g) Control/set steps and variable declaration

### AP-126. `variable-description-one-line` — `AP:1666–1674`
- **Rule (verbatim):** "A workflow `variables[].description` is a single line defining what the value *is* (optional short enum or shape hint)."
- **Detect:** "`description` is more than one sentence, essay-length multi-clause prose, or includes producer/consumer/gate/layout tails ("Set by…", "Drives…", "Read by…", "Gates…", "Interpolated into…", install-path catalogs, loop/checkpoint wiring, restatement of `defaultValue`)."
- **Do not flag:** "A single short phrase or one sentence with a compact enum/shape (`simple|moderate|complex`, `{ id, statement }`). Longer contracts belong on the producing technique's `## Outputs`."
- **Fix:** "Rewrite to one line naming the value; delete producer, consumer, gate, and layout tails."

> Live hits already present: `workflow.yaml:63` "Count of expressiveness findings **from audit-expressiveness**", `:71` "**from audit-rule-hygiene**", `:79` "**from audit-principles**" — producer tails. These three variables also become homeless if the audit dimensions merge.

---

# PART B — Other entries in the same families (verbatim key clauses)

## (a) Activity structure — additional
| Entry | Line | Operative Detect clause | Fix direction |
|---|---|---|---|
| AP-09 `checkpoint-not-prose` | `AP:186` | "tells the agent to ask/confirm/choose without a `kind: checkpoint` at that `steps[]` position" | add `kind: checkpoint` |
| AP-10 `loop-not-prose` | `AP:198` | "says to repeat/iterate/for-each without a `kind: loop` (`loopType`, `over`, nested `steps[]`)" | `kind: loop` step |
| AP-11 `decision-not-prose` | `AP:210` | "Prose describes branching to different activities/paths without an activity-level `decision` with `branches`/`conditions`" | declare activity `decision` |
| AP-14 `mode-as-state` | `AP:246` | "Mode-specific skip/branch behaviour appears only as rules or prose rather than a mode state variable … plus `when`/`transitions[].condition` (**and `skipActivities` where needed**)" | one authoritative mode variable |
| AP-17 `bound-step-no-description` | `AP:282` | "A `kind: technique` or `kind: action` step that binds an op still carries `description` or `name`. Bound steps allow only `kind`, `id`, `technique` …, plus structural `actions` / `when` / `required: false`" | strip prose; "Resulting bound step = `id` + `technique` + structural fields only" |
| AP-18 `no-monolith-masking-steps` | `AP:294` | "Several steps bind the same technique and differ only by `description` … with no distinguishing `when` / `actions` / input-output deviation" | "(1) **Reuse** … (2) **Collapse** … (3) **Split** … New techniques are last resort." |
| AP-31 `no-hand-authored-artifacts` | `AP:458` | "Activity YAML declares `artifacts[]`. Artifact contract is synthesized by the server from bound techniques' `## Outputs`" | delete block; add `#### artifact` "never back onto the activity" |
| AP-36 `techniques-list-disjoint` | `AP:518` | "An entry in activity-level `techniques[]` is also bound by any step … Lists must be DISJOINT" | remove overlap |
| AP-37 `rule-audience-bucket` | `AP:530` | "Classify each rule by who must act: orchestrator (`get_workflow` only), worker (`get_activity` inject), or both identically" | move to actor's bucket |
| AP-39 `hoist-universal-techniques` | `AP:554` | "A strategy technique appears on (nearly) every activity's `techniques[]` … Coverage discriminator: nearly-all → hoist; only some → stay activity-local" | `workflow.techniques.activity` |
| AP-23 `worker-rule-reach` | `AP:358` | "A behavioural rule workers must read is present only under `rules.workflow` (workers never receive `workflow.yaml`)" | keep on activity/technique; "duplication across techniques is correct for reach" |
| AP-82 `work-through-activities` | `AP:1082` | "Results are combined, advanced, or closed outside the workflow's defined activities/transitions" | route through declared steps |
| AP-107 `bind-site-is-orchestration-truth` | `AP:1390` | "Prose outside activity YAML enumerates an ordered or complete list of activities, steps, or technique passes, and that list is not generated from the authoritative bind sites" | delete the third checklist |
| AP-01 `no-inline-content` | `AP:82` | "An activity, technique, or resource body is inlined into a parent YAML/markdown file" | extract to own file |
| AP-02 `schema-is-constraint` | `AP:94` | "A change proposes altering workflow/activity/technique schema (or inventing fields) so existing content validates" | rewrite content, not schema |

## (b) Artifact creation — additional
| Entry | Line | Operative Detect clause |
|---|---|---|
| AP-12 `artifact-not-buried` | `AP:222` | "claims to produce a file/report only in `description` … without a `#### artifact` on the producing technique's `## Outputs`" |
| AP-84 `single-closeout-artifact` | `AP:1110` | "**More than one terminal artifact** (or README footer) re-states delivered items, decisions, validation, follow-ups, or lessons." Do-not-flag: "**A single close-out artifact with retrospective as a section**; engine session summary presented but not persisted as a second artifact." Fix: "**Collapse to one close-out document**" |
| AP-93 `canonical-fact-home` | `AP:1218` | "**Several templates in one workflow each mandate a full section for the same fact category** … Structural duplication." Fix: "**Declare a canonical-home map (fact category → exactly ONE home template)**; other templates use a one-line link slot to the home; back with a conformance gate" |
| AP-85 `link-dont-copy-sections` | `AP:1122` | "A template lays out sections to fill with content whose canonical home is another artifact, instead of instructing a link" |
| AP-94 `link-only-input-slots` | `AP:1230` | "A section is shaped to hold a summary/copy of a different document — even when adjacent prose says "link, don't copy", the slot shape defeats the rule" |
| AP-87 `omit-null-sections` | `AP:1146` | "Artifacts include "None"/"N/A" headed sections or empty tables, or checkpoints ask the user to confirm a null result." Fix: "Omit empty sections (mark templates `[Omit if none]`); log nulls in one line and proceed — **no null-confirmation checkpoint**" |
| AP-86 `exception-only-verdict-tables` | `AP:1134` | "Template requires a verdict/status table where the expected steady state is all-pass … All-green tables carry one bit in N rows". Do-not-flag: "**Vocabularies downstream steps parse (severity counts, README progress-tracker statuses) — data, not ceremony**" |
| AP-91 `lifecycle-row-update` | `AP:1194` | "A tracked item gets a new section (or appended block) at each lifecycle stage instead of one row updated in place. **Aggregate scorecards are persisted in the log rather than presented in-session.**" Fix: "One row per item, updated in place across stages; **present aggregate scorecards in-session, not persisted**" |
| AP-96 `artifact-audience-declared` | `AP:1254` | "Output declaration carries only a filename; agent-state artifacts (lifecycle logs, indexes, ledgers only downstream steps re-read) default to the same prose-markdown shape as human-facing documents." Fix: "**human → prose; agent state → structured one-row-per-item data**" |
| AP-95 `enforce-output-discipline` | `AP:1242` | "An output-discipline ruleset exists only as prose with no verify operation at a workflow boundary". Fix: "Pair every output-discipline ruleset with a verify operation at a workflow boundary … gate verifies and fixes in place **with no checkpoint, loop, or routing variable**" |
| AP-32 `outcome-names-value` | `AP:470` | "Outcome names the mechanical act, not the VALUE delivered. Forbidden shapes: "`<file>` written/created" … Test: outcome must still read true/useful if the file or variable were renamed" |
| AP-43 / AP-44 / AP-45 | `AP:606/618/630` | filename in Protocol vs I/O declaration; opaque `*-paths` arrays |
| AP-90 `no-guide-wrapper-ceremony` | `AP:1182` | "Agent-facing resource pads a template with tutorial ceremony … Runtime load taxes context; keep TEMPLATE plus operative rules" |

## (c) Technique granularity / facades — additional
| Entry | Line | Operative Detect clause |
|---|---|---|
| AP-70 `capability-group-placement` | `AP:930` | "A technique's directory or name encodes the wrong locus for its shape-origin … Also flag **a group folder whose ops are the workflow's entire operation set** (`<group>::` only restates the workflow). **Discriminator is shape-origin, not consumer count.**" Do-not-flag: "**inventing a group for a hypothetical second cluster (YAGNI)**" |
| AP-105 `no-shadow-audit-pass` | `AP:1366` | "An audit technique embeds a compressed copy of a catalog/resource's Detect criteria while another technique already walks that same home." Do-not-flag: "**A thin scoped walker that loads a named section and applies each entry as written without restating Detect**; distinct passes with distinct homes." Fix: "**keep at most one walker per home**" |
| AP-104 `operative-criteria-need-a-home` | `AP:1354` | "Reusable Detect / Do not flag / Fix criteria … exist only inside a technique protocol, with no resource or anti-pattern home". Fix: "leave the technique as a **walker (load home → apply → present)**" |
| AP-102 `no-technique-resource-dual-home` | `AP:1326` | "A technique that loads or links a resource also embeds operative criteria that must be applied from that resource" |
| AP-113 `session-interaction-in-technique` | `AP:1466` | "instructs presenting, surfacing, showing, narrating … rather than only producing bindable `{id}` outputs. **Techniques are session-blind: inputs → process → outputs**" |
| AP-108 `numbered-protocol-phases` | `AP:1406` | "a numbered `### N. Title` whose body holds two or more bullets … that are distinct sequential phases". Do-not-flag: "Multiple bullets that elaborate a single phase … **loop body over one entry**" |
| AP-124 `alternate-ops-as-protocol-sequence` | `AP:1598` | "alternate modes of the same op surface that a caller selects exactly one of … Test: if renumbering the phases would not change runtime behavior because only one phase applies per call, flag it" |
| AP-111 `contract-not-procedure` | `AP:1442` | "Protocol (a) restates derivation, recognition, or decision-tree criteria for a declared Output … or (b) has a numbered phase whose sole job is to assign a pure projection of another output" |
| AP-120 `procedure-in-capability` | `AP:1550` | "Capability … (a) contains procedural instruction … (b) contains markdown hyperlinks … (c) contains brace-declared designators" |
| AP-123 `capability-as-op-inventory` | `AP:1586` | "Capability is a comma/em-dash inventory of child techniques, protocol facets, or folder ops" |
| AP-115 `platform-semantics-in-capability` | `AP:1490` | container Capability teaching `composeLoaded` merge / `Initial`/`Final` wrap |
| AP-15 `procedure-in-protocol` | `AP:258` | "Step `description` holds HOW … `description` is a one-line WHAT summary only" |
| AP-51 `canonical-technique-reference` | `AP:702` | "Protocol names a raw harness/MCP tool for a capability that another technique wraps" |

## (d) Rule hygiene — additional
AP-20 `rule-group-disambiguation` (`AP:322`), AP-21 `grouped-rule-keys` (`AP:334`), AP-53 `dotted-rule-address` (`AP:726`; "Mnemonic: `::` invokes, `.` names"), AP-59 `constraint-as-blockquote` (`AP:798`; "The protocol parser's step regex strips leading whitespace, so that line becomes a disconnected *peer* step"), AP-60 `local-rule-as-note` (`AP:810`), AP-67 `rule-slug-shape` (`AP:894`), AP-79 `structure-backed-constraints` (`AP:1046`; "can be violated by ignoring the text and has no structural backing (checkpoint, condition, validate action, or decision)"), AP-100 `runtime-rules-only` (`AP:1302`; "A rule … governs how to *write* workflows … rather than current-session runtime conduct"), AP-117 `no-engine-mechanics-as-rules` (`AP:1514`), AP-106 `canon-layer-cites-not-restates` (`AP:1378`), AP-122 `prompt-restates-owned-mechanics` (`AP:1574`).

## (e) Resource shape / delivery — additional
| Entry | Line | Operative Detect clause |
|---|---|---|
| AP-92 `resource-fills-not-does` | `AP:1206` | "A resource section is shaped like technique Protocol or session orchestration — imperative cadence … Discriminators: **vocabulary / labels / probe lists** a TEMPLATE consumes stay; **behavioral cadence and gate routing** that OPERATIONS apply move to the technique." Fix includes "**dissolve the resource when nothing template-shaped remains**" |
| AP-46 `no-resource-caller-backlink` | `AP:642` | "A resource … names/links host callers or bind/gate topology … `"produced by the X technique"`… **and** orchestration essays … residual gates (`{has_open_assumptions}`…)". Test: "if deleting the passage would still leave a usable template/vocab/guide, and the deleted text named who binds/produces/gates this resource → flag" |
| AP-40 `readme-orients-not-transcribes` | `AP:566` | "README enumerates in prose or tables: activity `steps[]` … or states **inventory counts ("N resources/techniques/activities")** or loader/path HOW … Test: if the block must be edited when those YAML fields or folder contents change, it is transcribing" |
| AP-49 `no-delivery-mechanism-narration` | `AP:678` | "Prose explains how the server delivers the technique, resources, or bundle" |
| AP-50 `no-tool-usage-prescription` | `AP:690` | "prose prescribes how to invoke a harness/MCP tool" |
| AP-71 `no-false-resource-delivery` | `AP:946` | "describes a tool's return value, delivery shape, or payload inaccurately versus the actual harness behaviour" |
| AP-103 `cited-home-owns-claim` | `AP:1342` | "attributes an operative fact to a linked home … but that fact is absent from X. Test: open the cited home; if the claim cannot be applied from X alone, the citation is false" |
| DP §30 | `DP:133` | "**No consumer loads the whole resource to read one category** … a resource's sections are its delivery units" — a merged register guide must be section-addressable (`get_resource { resource_id: "<resource>#<anchor>" }`) |

## (f) Checkpoints and gates — additional
| Entry | Line | Operative Detect clause |
|---|---|---|
| AP-05 `atomic-checkpoints` | `AP:134` | "Two or more distinct user decisions are packed into a single checkpoint (or one checkpoint is skipped by bundling its decision into another)" |
| AP-88 `one-decision-one-checkpoint` | `AP:1158` | "Two declared checkpoints share one decision: the second's answer space is subsumed by the first's options. **Distinct from `atomic-checkpoints` … here the definition itself splits one decision across two prompts.**" Fix: "Merge into one checkpoint whose options cover the full decision space plus an escape hatch …; **delete variables whose only consumer was the removed checkpoint's condition**" |
| AP-89 `checkpoint-requires-decision` | `AP:1170` | "Every option leads to the same next step, sets no variable, and exists only so the user can acknowledge guidance. **Discriminator is recorded effect**" |
| AP-99 `statement-not-question` | `AP:1290` | "Checkpoint `message` has a trailing `?`, or confirm/interrogative openers" |
| AP-101 `no-caption-only-message` | `AP:1314` | "After a present-then-checkpoint step, `message` restates "what I just showed" with no durable subject and no decision-relevant fact" |
| AP-13 `variable-for-approval` | `AP:234` | "Prose instructs remembering/tracking approval or similar state without a `variable` wired through checkpoint `effects`" |
| AP-06/07/08 | `AP:146/158/170` | assumption-execution, scope re-verify, one-question-per-message |

## (g) Control/set steps and variable declaration — additional
| Entry | Line | Operative Detect clause |
|---|---|---|
| AP-33 `no-set-of-technique-output` | `AP:482` | "Step has `technique` and a `set` whose `target` is a value the bound technique computes". Do-not-flag: "(a) cross-iteration accumulator / scatter-gather gather over a `forEach`; (b) caller-specific derivation from a generic tool-wrapper op; (c) value-BEARING `set` on a pure control step recording orchestration/flow state" |
| AP-35 `no-intra-step-input-set` | `AP:506` | "A bound step's `technique.inputs` interpolates a variable that the SAME step's `set` actions write. Inputs resolve at invocation … → ordering hazard / self-reference" |
| AP-112 `no-derived-state-shadow` | `AP:1454` | "two or more variables where one is a pure projection of another … Test: if a legal write can leave the shadow disagreeing with the source, flag it" |
| AP-127 `bag-value-as-literal` | `AP:1676` | "Flag a verbatim value — path root, branch or remote name, identifier, **count**, enum member, host — where a declared slot carries that same meaning and `{name}` belongs. **Two signals must coincide**" (exemplar: "the audit covers all eight design dimensions") |
| AP-128 `unproduced-value-read` | `AP:1688` | "For each step gated by `when` or `condition` that is the sole producer of a variable … trace every later reader … Flag when a reader is reachable on a path where the producer is skipped and the variable declares no `defaultValue`." Fix: "Use `operator: exists` or `notExists` … add the complementary producer arm so the gates are exhaustive. **Do not substitute a `defaultValue` a reader cannot distinguish from a produced value.**" |
| AP-118 `no-bind-mechanics-as-prose` | `AP:1526` | "prose … tells the agent how to obtain, satisfy, fall back, remap, or otherwise resolve a declared input/output". Fix: "**Delete unused I/O.**" |
| AP-119 `procedure-in-io-contract` | `AP:1538` | "An Input or Output description holds HOW instead of the bind contract … Applies symmetrically to Inputs and Outputs" |
| AP-125 `technique-ref-in-io-contract` | `AP:1610` | "An Input or Output description hyperlinks or otherwise associates the bind slot with a **technique**" — exemplar `"from [challenge]"` is exactly `compile-report.md:11–19`'s satellite-path input shape |
| AP-58/64/65/66 | `AP:786/858/870/882` | snake_case symbols; affirmative boolean predicates; plural collection nouns; no direction/representation encoding |
| AP-61 `factor-repeated-paths` | `AP:822` | "A filesystem path appears more than once … or a step hard-codes a path when a declared variable already exists" |
| AP-62 `bind-protocol-locals` | `AP:834` | "(a) **Unbound local** … (b) **Dead binding** — `{$name}` never read" |

---

# PART C — What the NEW shape trips, and the shape that avoids it

## C1. Direct answer: does any entry forbid a large multi-step activity?

**No. Not one entry in 129 sets a step-count, line-count, or complexity ceiling on an activity.** The catalogue's pressure runs the *other* way:

- **AP-114 Fix** (`AP:1488`): "bind each sibling or shared operation as its own activity step in the order required" — `steps[]` is the mandated destination for multi-op work.
- **DP §25** (`DP:113`): "**All** multi-technique work lives in activity `steps[]` (and checkpoints/loops)."
- **DP §26** (`DP:117`): "**Activities are the composition layer** … Activity→activity composition is allowed: borrow, bind, or include activities."
- **AP-70 Do-not-flag** (`AP:938`): "multiple distinct capability groups composed by one activity" is explicitly not a smell.
- **Empirical**: `activities/08-quality-review.yaml` is already 27 technique binds / 530 lines and `10-post-update-review.yaml` 29 binds — both pass the current audit.

What *is* constrained is **how the steps differ, not how many there are**:
1. **AP-38** — scoped *"in one activity"*. This is the only entry that gets *harder* purely by concatenation. Merging `08`+`10` puts ~14 `write-artifact` binds in one `steps[]`; at that density the "fixed roster of distinct static targets" carve-out (`AP:550`) no longer holds because the roster **is** a clean iterable → classification (b) "unrolled iteration → one `forEach` with one binding" fires.
2. **AP-69** — every cross-activity ordering constraint that today lives in a `transitions`/`decisions` graph must land in `when`/`condition`/step order, never in prose. Zero carve-out.
3. **AP-128** — the sharpest *silent* risk. Merging activities converts activity-boundary gates into intra-activity `when`. Every `*_findings_path` and `*_findings_count` producer sitting behind `when: operation_type == review` must be re-traced against readers on the non-review path; readers must switch to `operator: exists`/`notExists` or gain a complementary producer arm.
4. **AP-05 / AP-88 / AP-89** — merging must not merge *checkpoints*. AP-05 forbids agents bundling; AP-88 forbids the definition splitting one decision. Collapsing 7 checkpoints in `06-scope-and-draft.yaml` down is legal only where answer spaces are genuinely subsumed.

**Shape that avoids tripping:** 4 activities, each a long flat `steps[]`, where every repeated persist is **one** `write-artifact` bind inside a `forEach` over a declared collection (kills AP-38(b) and AP-18); zero `rules:` blocks (AP-69); all former transition conditions rewritten as step `when` with `exists`/`notExists` on definedness questions (AP-128); checkpoint count preserved 1:1 unless answer spaces provably overlap (AP-88).

## C2. Direct answer: does any entry forbid one findings register covering several audit dimensions?

**No — and four entries actively demand it.** The current 7-satellite fan-out is the smell; the register is the fix.

- **AP-93 Fix** (`AP:1228`): "Declare a canonical-home map (fact category → **exactly ONE** home template); other templates use a one-line link slot to the home; back with a conformance gate."
- **AP-84 Fix** (`AP:1120`): "**Collapse to one close-out document**"; Do-not-flag (`AP:1118`) blesses "A single close-out artifact with retrospective as a section."
- **AP-116 Detect** (`AP:1508`): "**Shared satellites may share one guide**; every persisted bare filename must still map to a guide." One register = one filename = one guide. Strictly less obligation than seven.
- **AP-91 Fix** (`AP:1204`): "One row per item, updated in place across stages; present aggregate scorecards **in-session, not persisted**." A per-finding register with in-place rows is the sanctioned shape; per-pass scorecards should not be persisted at all.
- **`resources/findings-satellite.md:20`** already carries `**Pass:** {expressiveness | conformance | rule-hygiene | enforcement | principles | anti-patterns | verified}` in its Template — the discriminated-register shape is already anticipated by the canon.

**The constraints ON the merged register** (all satisfiable):
- **AP-87** (`AP:1156`): no per-dimension headed section that can read "None." → the register must be **one table with a Dimension column**, not 6 (or 7) headings. Templates mark `[Omit if none]`.
- **AP-86** (`AP:1140`): no all-green per-dimension verdict table → "one-line all-pass form plus a divergences-only table." Its Do-not-flag (`AP:1142`) preserves parseable severity counts.
- **AP-96** (`AP:1264`): the register is agent-state (only downstream steps re-read it) → "structured one-row-per-item data", audience recorded in the output declaration description.
- **AP-85 / AP-94**: the rolled-up human report links register anchors; it must not copy rows.
- **AP-95** (`AP:1252`): pair the register's discipline rules with a verify op at a workflow boundary, "with no checkpoint, loop, or routing variable."
- **DP §30** (`DP:133`): give the register guide per-dimension anchors so a renderer fetches `findings-register#anti-patterns` and the consolidator fetches only the skeleton section.

## C3. The one merge that **does** trip a High — and it is the technique merge, not the activity or artifact merge

Issue #321 collapses activities and artifacts. If it also collapses the 6 audit **techniques** (`audit-expressiveness`, `audit-conformance`, `audit-principles`, `audit-anti-patterns`, `audit-rule-hygiene`, `audit-rule-enforcement`) into one "run all audits" op, that op is **AP-114's verbatim exemplar** — `AP:1480` literally reads "``run-audit-passes`: Apply audit-expressiveness…`". Compounding entries: **AP-123** (Capability becomes an op inventory), **AP-105** (one merged pass shadowing the catalog homes another walker already walks), **AP-104** (criteria pulled into a technique with no home).

The only legal single-technique shape is the AP-114 Do-not-flag carve-out at `AP:1486`: "**a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag) with no Protocol Apply/`::` work invoke**." That is achievable exactly *because* the criteria already live in resources, not techniques: one `audit-workflow-content` technique with `1. Load homes` (anti-patterns + design-principles + convention-conformance + schema-construct-inventory) → `2. Apply every entry` → `3. Emit {audit_findings}` rows tagged by dimension. It is a **thin walker over N homes**, which AP-105's Do-not-flag (`AP:1374`) explicitly permits: "A thin scoped walker that loads a named section and applies each entry as written without restating Detect." `techniques/audit-anti-patterns.md:35–38` is already written exactly this way ("Do not restate, summarize, or number catalog entries in this technique; follow each entry as written").

**This is the mechanism behind the token asymmetry in your brief.** The bare two-agent sweep beat the 12-dispatch pass 8 Highs to 3 at 29% of the cost because the criteria homes are self-sufficient — `AP:29` mandates it ("Audit techniques load this resource and apply each subsection **in place** — they must not restate per-pattern detect/fix logic"). The 6 techniques add dispatch overhead and 6 artifact round-trips over zero unique criteria. Consolidation is canon-aligned, not a canon exception.

## C4. Concrete existing defects the redesign must clear in the same pass

| Defect | Site | Entry |
|---|---|---|
| "Persist … via **the calling activity's** bound `manage-artifacts::write-artifact` step" — names the calling activity from inside a technique | `techniques/audit-anti-patterns.md:42` | **AP-68**(a); also **AP-114** boundary |
| "Count of expressiveness findings **from audit-expressiveness**" (×3) — producer tails on variable descriptions | `workflow.yaml:63, :71, :79` | **AP-126** |
| Optional `*_findings_path` inputs described as "when the principles audit ran" — sequencing/conditional duty in a bind slot | `techniques/compile-report.md:11–19` | **AP-119**, **AP-125** |
| 9 `write-artifact` binds in one activity, 5 more in another | `activities/08-quality-review.yaml`, `10-post-update-review.yaml` | **AP-38**(b) once merged |
| 7 `*_findings_path` variables + 3 `*_findings_count` variables stranded when satellites collapse | `workflow.yaml:153–179` | **AP-118** Fix "Delete unused I/O"; **AP-128** |
| 7 bare filenames asserted in the guide roster and the README map | `resources/findings-satellite.md:12`, `resources/README.md:58` | **AP-129** (sweep whole tree, counted manifest) |
| `audit-anti-patterns` Protocol phase 3 persists *and* the activity binds `write-artifact` for the same file | `techniques/audit-anti-patterns.md:40–42` vs `activities/08-quality-review.yaml` | **AP-74**, **AP-102** |

## C5. Two gaps in the catalogue this redesign will expose

1. **No entry fires on an orphaned creation guide.** AP-116 is unidirectional (filename → guide). After 12 artifacts are dropped, guides like `resources/expressiveness-*`-equivalents and the 7-filename roster in `findings-satellite.md:12` have no producer. The nearest coverage is AP-92's Fix clause "dissolve the resource when nothing template-shaped remains" (`AP:1216`) and AP-129 for the stale roster line — neither has a Detect that names *"resource whose mapped filename is no longer persisted by any technique."*
2. **No entry constrains the artifact-count-per-activity or the total count.** AP-84 covers only *terminal/close-out* artifacts ("More than one terminal artifact", `AP:1116`); AP-93 covers only *fact duplication across templates*. Reducing 17 artifacts to 5 is therefore permitted but not *directed* by any Detect — the case for it rests on **DP §12 Output Economy** (`DP:61`) and AP-91's "present in-session, not persisted", not on a catalogue entry. If #321 wants an auditable rule, that rule does not exist yet and would need authoring under the Creation Rules at `AP:15–73` (specifically `Resist over-fit`, `AP:47–61` — the Detect must be a structural test that transfers to a foreign workflow, so it would have to be shaped as "persisted artifact no later step or user gate reads", not "more than N artifacts").
