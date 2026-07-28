# Canon and Platform Facts — the authoring reference

Consult this while authoring `workflow-design`'s new YAML, techniques and resources. It exists so the author neither trips a catalogue entry nor assumes a platform behaviour that does not hold.

**Citation roots**

| Short form | Absolute root |
|---|---|
| `AP:<line>` | `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design/resources/anti-patterns.md` |
| `DP:<line>` | `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design/resources/design-principles.md` |
| `WD/…` | `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design/` |
| `SRV/…` | `/home/mike1/projects/dev/workflow-server/` |

**Line-number drift warning.** Every `SRV/` citation in §5 and §6 below was read against the live server tree during this pass. The corpus maps (`01-corpus-map-schemas.md`) and `04-implementation-plan.md` cite `SRV/src/tools/workflow-tools.ts` line numbers that are **stale by roughly 35–40 lines in the checkpoint region** (they say `1167-1192` where the code is at `1204-1229`) and by 2–4 lines in the bundling region. Trust the numbers in this file; re-read before quoting any number taken from the maps.

---

## 1. Read this first: the catalogue's own trap

`anti-patterns.md` has **13** `##` sections. Four entries — **AP-126, AP-127, AP-128, AP-129** — do **not** live in an anti-pattern family section. They sit inside `## Authoring Guidance (MR)` (`AP:1622`) alongside MR-1…MR-4, at `AP:1666` / `AP:1676` / `AP:1688` / `AP:1700`.

**Consequence:** any walk that enumerates sections matching `## *Anti-Patterns` **silently drops all four**, including `AP-128 unproduced-value-read` and `AP-129 stale-restatement-after-change` — the two entries this build most depends on. There is no error, no warning, and no coverage signal. The failure is invisible.

**Walk this anchor list, not a pattern match.** Thirteen items, in file order:

1. `#creation-rules` — `AP:15`
2. `#structural-anti-patterns` — `AP:78`
3. `#interaction-anti-patterns` — `AP:130`
4. `#schema-expressiveness-anti-patterns` — `AP:182`
5. `#rule-hygiene-anti-patterns` — `AP:306`
6. `#description-hygiene-anti-patterns` — `AP:394`
7. `#coupling-anti-patterns` — `AP:590`
8. `#tool-technique-doc-consistency-anti-patterns` — `AP:942`
9. `#execution-anti-patterns` — `AP:1018`
10. `#output-economy-anti-patterns` — `AP:1106`
11. `#canon-hygiene-anti-patterns` — `AP:1338`
12. `#technique-protocol-anti-patterns` — `AP:1402`
13. **`#authoring-guidance-mr` — `AP:1622`** ← the one a family-pattern walk drops

**Do not fix this by re-sectioning `anti-patterns.md`.** That edits a §6 authoritative home, drags §10's removal-inventory obligation over the canon itself, puts a structural edit into a 1711-line / 128,341-byte file that is the sole criteria home for three walkers, and buys identical coverage. Enumerate the anchor instead. `extractMarkdownSection` slices at any heading level and stops at the next same-or-higher heading (`SRV/src/utils/resource-ref.ts:54-64`), so the MR anchor carries all four entries in one slice.

Two related constraints on how the walk is *reported*:

- **Never cite the catalogue's entry count.** `AP:25`: "Cross-references use the name in backticks … Do not cite bare historic numbers, and do not cite the catalog's entry count (it drifts)." A coverage ledger therefore keys on **section titles**, never counts. Restating a count is also `AP-40 readme-orients-not-transcribes` (`AP:566`) and `AP-127 bag-value-as-literal` (`AP:1676`).
- **Cite by kebab name in backticks**, e.g. `` `unproduced-value-read` ``, not "AP-128". The `AP-NN` form used throughout this file is a working index for the author, not an authoring convention to emit.

---

## 2. The four corrections the judge panel made to the corpus map

These are places the corpus map's **paraphrase was wrong**. The corrected reading governs. Each was established by reading the catalogue, not the map.

| # | Corrected reading | Why the map was wrong | Cite |
|---|---|---|---|
| **C1** | **AP-114's do-not-flag is conditioned on there being NO Protocol `Apply`/`::` work invoke.** The carve-out reads "a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag) **with no Protocol Apply/`::` work invoke**". A walker that names `meta::workflow-engine::list-workflows` inside its Protocol has forfeited the carve-out, however single-produce-path the rest of it is — a `::` op invoke is named in Detect outright. | The map presented the carve-out as a property of the *shape* (one produce path), omitting that the condition is a *prohibition*. Under the map's reading, a merged walker could keep a `::` invoke. It cannot. | Detect `AP:1482`; carve-out `AP:1486`; Fix `AP:1488` |
| **C2** | **AP-07's Detect names `commit` explicitly:** "A done/complete claim, **commit**, or close-out proceeds without verifying each scope-manifest item is addressed." Scope re-verification must precede the commit itself, not merely the close-out. The do-not-flag is narrow: "An interim status update that does not claim completion." Boundary count is irrelevant — a design that puts the commit two activity boundaries before scope re-verification still trips it. | The map treated AP-07 as a close-out ordering entry, which licenses moving the commit earlier. It does not. | `AP:158`, `:164`, `:166` |
| **C3** | **AP-88 FORBIDS rather than licenses merging two non-subsumed decisions.** Its do-not-flag is "Distinct decisions with non-overlapping answer spaces" — i.e. distinct non-overlapping decisions are precisely what AP-88 does *not* reach. AP-88 fires only when the second checkpoint's answer space is **subsumed** by the first's options. Merge two decisions whose answer spaces do not overlap and you get **no AP-88 licence and an AP-05 hit** (`atomic-checkpoints`, `AP:134`). A three-option set spanning two axes does not repair it. | The map's paraphrase of AP-88's Fix ("Merge into one checkpoint whose options cover the full decision space") read as a general merge licence. It is conditional on subsumption. | do-not-flag `AP:1158`; AP-05 `AP:134` |
| **C4** | **Four entries hide outside the anti-pattern families** — see §1. AP-126/127/128/129 are inside `## Authoring Guidance (MR)`. | The map enumerated anti-pattern families and presented that enumeration as the catalogue. It is not; it is 12 of 13 sections. | `AP:1622` vs `:1666`, `:1676`, `:1688`, `:1700` |

**Two further live catalogue hits the judges verified by read**, both of which the build must clear rather than inherit:

- `WD/techniques/audit-conformance.md:37` — "Survey similar-type reference workflows via [list-workflows]" is a live AP-114-class `::` work invoke sitting inside a technique Protocol. It must become a bound activity step, not be carried into a merged walker.
- `WD/techniques/audit-schema-validation.md:24,:30,:34` — three validator-script phases. Duplicating these inside a walker is AP-51 (`AP:702`, raw tool recipe where a wrapping op exists), AP-110 (`AP:1430`, "near-misses count") and AP-74 (`AP:982`) in one Protocol.

---

## 3. The anti-pattern entries that bind this build

Carve-out column states whether the do-not-flag is **available** to this build and on what condition. Where it reads *none*, the entry has no usable escape.

### 3.1 Activity structure and orchestration placement

| Entry | Name | Detect, in one line | Carve-out | The author must |
|---|---|---|---|---|
| **AP-69** `AP:918` | `no-activity-prose-rules` | Any activity-level `rules:` entry at all — activity is pure mechanics. | **None.** Literally "N/A — activity `rules:` should be empty" (`AP:924`). Zero tolerance, the only such entry in the catalogue. | Write **zero** `rules:` blocks in every activity file. Every ordering guarantee a deleted activity boundary carried must land in `steps[]` order, `when`, `condition`, a transition condition, a decision, a checkpoint, or `required: false` — and be *shown* to land there, row by row, not asserted in a paragraph. Two platform facts make prose the worst available option anyway (§5.10). |
| **AP-38** `AP:542` | `no-duplicate-technique-steps` | Two or more steps **in one activity** bind the same technique. Classify: (a) redundant re-execution → collapse; (b) unrolled iteration over N collection items → one `forEach`, one binding; (c) monolith-masking, distinguished only by a sub-mode input → split into a group with one op per mode. | **Available, conditionally:** fixed roster of distinct static targets with different structured inputs (not a clean iterable); mutually exclusive `when` branches; distinct-purpose invocations at different pipeline points (initial vs final commit); same op as distinct phases inside one loop iteration (`AP:550`). | This is the **only entry that gets harder purely by concatenation** — merging activities concatenates their duplicate-bind rosters. Keep per-activity `write-artifact` binds low enough that the roster stays a fixed roster of distinct static targets. Once the roster becomes a clean pass→filename iterable (~14 binds, as a naive `08`+`10` merge produces), the carve-out evaporates and classification (b) fires. |
| **AP-107** `AP:1390` | `bind-site-is-orchestration-truth` | Prose outside activity YAML enumerates an ordered or complete list of activities, steps, or technique passes, and that list is not generated from the authoritative bind sites. Test: the prose must change when a bind changes, but the YAML was not the source. | **Available:** purpose/value orientation without a pass inventory; pointers to the YAML; at-a-glance activity names with one-line roles; a technique that only applies a sibling without listing a parallel set (`AP:1398`). | Never let design prose assert a pass structure the bind sites do not declare. If the design says "the register accumulates per-target sections inside the loop", a `forEach` over that collection must actually exist in `steps[]`. Delete gate enumerations from `workflow.yaml` rules and step-id lists from techniques. |
| **AP-33** `AP:482` | `no-set-of-technique-output` | A step has both `technique` and a `set` whose `target` is a value the bound technique computes. | **Available:** (a) cross-iteration accumulator / scatter-gather gather over a `forEach`; (b) caller-specific derivation from a generic tool-wrapper op; (c) value-BEARING `set` on a pure control step recording orchestration/flow state (`AP:492`). | Do not `set` what a bound technique already declares as an Output. Where a counter or accumulator is genuinely orchestration state, keep it on a **pure control step** under carve-out (c) — and read §5.2 first, because a `set` does not reach the session variable bag the way authors assume. |
| **AP-34** `AP:494` | `no-valueless-control-set` | A control step (no `technique`) has value-**LESS** `set`s (`target` + `description`, no `value:`) whose descriptions carry sourcing/derivation HOW for a domain payload. | **Available:** value-**BEARING** control `set`s for orchestration/flow state (`AP:498`). | Every surviving `set` must carry a literal `value:`. A `target` + `description` pair with no `value:` is the defect; its description is derivation HOW that belongs in a technique's Outputs. Fix direction is verbatim "Bind a technique whose outputs/protocol own the derivation; delete the value-LESS activity sets" (`AP:504`). |

### 3.2 Technique granularity and facades

| Entry | Name | Detect, in one line | Carve-out | The author must |
|---|---|---|---|---|
| **AP-114** `AP:1478` | `pass-orchestration-in-technique` | Technique Capability or Protocol applies, invokes or runs another technique/operation for work, via `Apply [technique]` or a `::` op invocation — **one or many**. Signals: numbered phases each reading "Apply […]"; a Capability naming a multi-pass audit or a façade over shared ops; Outputs that only re-export children. Test: if moving each invoked op to its own activity `steps[]` entry preserves behaviour, flag it. | **Available but conditional — see correction C1.** "A single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag) **with no Protocol Apply/`::` work invoke**" (`AP:1486`). The condition is a prohibition, not a description. | The merged walker's Protocol must contain **no `Apply` and no `::`**. Every foreign op it needs — `meta::workflow-engine::list-workflows`, `audit-schema-validation`, `verify-high-findings` — is bound as **its own activity step**, which is the Fix verbatim (`AP:1488`). State the Detect-test-in-reverse in the design doc: moving those ops into the Protocol *would* preserve behaviour, which is exactly why none of them is there. The entry's own exemplar at `AP:1480` is this workflow's `run-audit-passes`. |
| **AP-68** `AP:906` | `technique-stage-agnostic` | Technique Capability/Protocol/Rules (a) mention stage/activity — including "calling/consuming/producing activity" — checkpoint, loop/iteration, transition routing, or position/timing ("after each task", "before user confirmation"); or (b) prescribe user confirmation, approval or choice as if the technique owned the gate. Test: if the sentence answers *where/when in the workflow?*, *which checkpoint surrounds me?* or *how does the user decide?*, flag it. | **Available:** purpose-phrased work with no orchestration locus; values the technique emits for the activity to route (counts, paths, severity, recommended option id); inventorying decisions *into* an artifact the activity will gate on; bare present/surface-to-user with no stage or gate named (`AP:912`). | Fix three live hits in this pass: `audit-anti-patterns.md:42`, `verify-high-findings.md:41` and `impact-analysis.md:57` all read "via **the calling activity's** bound `manage-artifacts::write-artifact` step" — Detect(a) verbatim. Replacement form: the technique declares `#### artifact <name>.md` on its Outputs and cites the guide's `#template`; the activity owns the persist. Delete `commit-verification.md:18`'s hard-coded step ids. **AP-68 is also why the merge is cheap** — techniques are stage-blind by mandate, so redistributing them across four activities instead of nine changes no technique text about position. |
| **AP-51** `AP:702` | `canonical-technique-reference` | Protocol names a raw harness/MCP tool for a capability another technique wraps. Must use the canonical hyperlink (`[op](path)` or `[group](path)::[op](path)`), which the server resolves to `::`. | **Available but narrow:** "The operation that wraps the primitive — naming the raw tool IS that technique's purpose" (`AP:710`). A *walker* is not a wrapper, so the carve-out does not cover a walker that re-teaches a script recipe. | Do not pull `audit-schema-validation`'s three validator-script phases (`:24,:30,:34`) into any walker. Keep them in their own wrapper op and bind it as a step. |
| **AP-110** `AP:1430` | `duplicate-shared-capability` | A non-meta technique's Protocol embeds a harness recipe (git push, `gh pr create`, commit/stage, issue mutate) for a capability that already exists as a meta or cross-workflow shared op. Also flags local re-teaching of concurrent `Task` / spawn-concurrent / dispatch-then-merge pipelines when `orchestration-patterns` or a borrowable `meta/activities/patterns/` activity covers the shape. **Near-misses count** — a shared op that almost fits but lacks an input, flag or output still owns the capability. | **Available:** parameterising or minorly refactoring the shared/meta op itself to absorb a new caller (new optional inputs, defaults, outputs, small protocol branches) while preserving existing callers; adding a new shared op where no shared capability exists; a local technique that only assembles caller-specific values while the activity binds the shared op as its own step; session-level `dispatch-activity` (`AP:1436`). | Bind shared ops by `::` path from activities; invent no local harness recipe. If a shared op almost fits, extend **it** — do not fork a local near-copy. |
| **AP-74** `AP:982` | `no-duplicated-guidance` | Identical or near-identical behavioural instructions appear in multiple techniques and/or tool descriptions, including harness HOW restated outside the meta engine/conduct/bootstrap surfaces. | **Available:** a single authoritative home with pointers elsewhere; meta surfaces whose domain *is* tool usage (`AP:988`). | Collapse the six near-identical audit→persist→clean/flagged triads to one walker. Delete a duplicated publish tail rather than relocating it. Where two activities persist the same filename with the same content and gate, keep one. |

### 3.3 Rule hygiene

| Entry | Name | Detect, in one line | Carve-out | The author must |
|---|---|---|---|---|
| **AP-19** `AP:310` | `no-rule-protocol-restatement` | A technique/activity/workflow rule restates a protocol bullet or phase without adding an invariant the steps do not already convey. | **Available:** rules that state cross-cutting constraints the protocol does not encode (`AP:316`). | Give every authored Rule an invariant no phase encodes. Delete the rest; Protocol is the procedural source. |
| **AP-22** `AP:346` | `single-rule-authority` | The same **orchestrator-only** rule (variable management, transitions, commit policy, mode handling) — or a rule needing no worker reach — appears at multiple levels (workflow → activity → technique). Cross-level copies drift. | **Available:** worker-directed behavioural rules that must stay reachable on activity/technique surfaces (`worker-rule-reach`, `AP:358`, since workers never receive `workflow.yaml`). | Keep headless semantics, commit policy and mode handling in exactly one home at the level where enforced. With zero activity `rules:` blocks (AP-69), cross-level duplication is structurally impossible for that tier. |
| **AP-24** `AP:370` | `no-contradictory-rules` | Two rules in the same technique **or the same rules bucket** prescribe mutually exclusive behaviours. | **Available:** rules disambiguated by group keys for different contexts (`rule-group-disambiguation`, `AP:322`). | Note the scope widening — *"or same rules bucket"*. **This is the one rule-hygiene entry a merge can trip with no text edited**, because merging activities merges their rule buckets and two previously-separated consistent rules become co-listed siblings. With zero activity rule buckets there is nothing to merge; keep it that way. Any authored Rule set must be mutually orthogonal. |
| **AP-25** `AP:382` | `no-one-step-rules` | A `## Rules` entry constrains a single protocol step/phase rather than a cross-cutting invariant. | **Available:** cross-cutting rules spanning multiple phases; step-local caveats already filed as `>` notes (`constraint-as-blockquote`, `AP:798`) (`AP:388`). | For every Rule authored, name the ≥2 Protocol phases it binds plus at least one consumer. If it binds one phase, move it into that phase's prose or a `>` caveat and delete the Rule. |
| **AP-121** `AP:1562` | `rule-as-protocol-step` | A Protocol phase (or bootstrap bullet, or similarly sequenced HOW list) states **only** a standing invariant, prohibition, or "follow X throughout" duty — no distinct produce/transform/persist outcome. Test: if removing the step leaves the work sequence intact and the sentence still belongs as a durable constraint on the whole op, flag it. Inverse of AP-25. | **Available:** work phases that *cite* a Rule or resource policy while doing work ("Apply … per [Status transition policy]"); step-local `>` caveats; true one-step guidance wrongly filed as a Rule; Rules that restate Protocol (`AP:1568`). | Every Protocol phase must have a distinct produce outcome such that removing it breaks the sequence. No phase says "follow the catalogue throughout". **AP-25 and AP-121 are a vice** — run each cross-cutting property through the placement test in §4 before choosing Rules / Outputs / structure. |

### 3.4 Checkpoints and gates

| Entry | Name | Detect, in one line | Carve-out | The author must |
|---|---|---|---|---|
| **AP-05** `AP:140` | `atomic-checkpoints` | Two or more distinct user decisions are packed into a single checkpoint (or one checkpoint is skipped by bundling its decision into another). | **Available only for:** "A single decision whose options naturally cover one atomic choice" (`AP:142`). | **Judge-flagged against the winning proposal.** Keep removal approval and scope approval as **separate** gates. Their answer spaces do not overlap, so per correction C3 AP-88 grants no merge licence and AP-05 fires on the merge. A three-option set spanning two axes does not repair it. Fix is "Restore one checkpoint per atomic decision; split combined options into separate gates" (`AP:144`). |
| **AP-07** `AP:164` | `scope-reverify-completion` | A done/complete claim, **commit**, or close-out proceeds without verifying each scope-manifest item is addressed. | **Narrow:** "An interim status update that does not claim completion" (`AP:166`). | **Judge-flagged as a fatal against one proposal.** Order the land stage `verify-scope-manifest` → `approve-to-commit` → `stage-and-commit`. Per correction C2 the Detect keys on the **commit**, not on activity-boundary count; "two boundaries apart" is not a defence. The status quo ordering (`09:80` → `09:145` → `09:170`) is correct and must be preserved. |
| **AP-88** `AP:1158` | `one-decision-one-checkpoint` | Two declared checkpoints share one decision: the second's answer space is **subsumed** by the first's options. Distinct from `atomic-checkpoints` — here the definition itself splits one decision across two prompts. | **Decisive:** "Distinct decisions with non-overlapping answer spaces" (`AP:1158`). See correction C3 — this carve-out makes AP-88 a **prohibition** on merging non-subsumed decisions. | Merge two checkpoints only where one answer space is provably subsumed by the other's options. Where you do merge, the Fix also directs deleting variables whose only consumer was the removed checkpoint's condition — but check AP-128 first, because a reader on another path may still need that variable. |
| **AP-98** `AP:1284` | `no-next-step-narration` | Checkpoint/action `message` or option `description` narrates next-step routing or auto-advance timing that the schema already owns (`transitions`, `autoAdvanceMs`, `defaultOption`, option labels). | **Available:** pure factual status clauses with no routing/timing narration (`AP:1286`). | Delete "Continuing to <next activity>" from every message. **Merge-relevant:** when an activity boundary disappears, such a clause is now narrating an *intra*-activity step and has no `transitions` entry to own it — still AP-98, and now unfixable by relocation. Timing and routing live only in `autoAdvanceMs`, `defaultOption`, `transitions` and option labels. |
| **AP-97** `AP:1272` | `link-named-artifacts` | A user-presented checkpoint or action `message` names or implies a durable file artifact without `[label]({path_variable})`, or the link hard-codes a numeric `NN-` prefix. | **Available:** pure in-chat subjects with no durable file; internal `set`/`log` diagnostics that are not user-presented artifact references (`AP:1274`). | Honour the obligation **in both directions**: every surviving message naming a file links its path variable, and every message naming a **deleted** artifact is deleted with it. No `NN-` literal anywhere. On checkpoints the message stays a statement (AP-99, `AP:1290`). Watch for the linearisation hazard: a message interpolating a path variable that is `""` on the new path is both AP-97 and AP-128. |
| **AP-91** `AP:1194` | `lifecycle-row-update` | A tracked item gets a new section (or appended block) at each lifecycle stage instead of one row updated in place. Aggregate scorecards are persisted in the log rather than presented in-session. | Do-not-flag text **not captured in this pass** — see §7. | One row per item, updated in place across stages. Present aggregate scorecards **in-session**, never persisted (`AP:1204`). Register rows update across remediation rounds; per-round scorecards go in the gate message. |
| **AP-96** `AP:1254` | `artifact-audience-declared` | An output declaration carries only a filename; agent-state artifacts (lifecycle logs, indexes, ledgers only downstream steps re-read) default to the same prose-markdown shape as human-facing documents. | Do-not-flag text **not captured in this pass** — see §7. | Declare audience on every output. Human → prose; agent state → structured one-row-per-item data. A findings register that only downstream steps re-read is agent state and must be tabular, with the audience recorded in the output declaration's description. |

### 3.5 I/O contracts, variables and resources

| Entry | Name | Detect, in one line | Carve-out | The author must |
|---|---|---|---|---|
| **AP-42** `AP:600` | `io-agnostic-contract` | An input/output entry names or links a workflow-internal producer/consumer — another technique ("from [analyze-failure]"), activity ("from the elicitation activity"), step, checkpoint, loop, or workflow/activity file. Describe what the value IS, never its position in a workflow. | **Available:** Protocol/Capability utilisation ("use technique X"); intrinsic/external origin ("git diff output", "the user's request", "provided by the server"); I/O links to a resource/template **section** (shape of the value) (`AP:602`). | No I/O entry names a producer, consumer, activity or technique. Paired with AP-125 (`AP:1610`), whose exemplar `"from [challenge]"` is exactly `compile-report.md:11-19`'s satellite-path input shape. |
| **AP-119** `AP:1544` | `procedure-in-io-contract` | An Input or Output description contains procedural instruction — imperatives, do/don't constraints, multi-step population, sequencing ("final phase", "gates steps N"), conditional duties ("when absent, then…"), checkpoint duties, recovery recipes. Test: if the sentence answers *how is this produced / what should the agent do around it?* rather than *what is this value?*, flag it. **Applies symmetrically to Inputs and Outputs.** | **Available, and load-bearing here:** "Output derivation/recognition criteria that define the value without narrating work steps"; meaning/shape/allowed-value identity including brief shape examples; declared `default`/optional/required markers (`AP:1546`). | Rewrite `compile-report.md:11-19`'s "when the principles audit ran" inputs into declared values stating meaning and shape only. A coverage ledger's **derivation criteria may legitimately live in `## Outputs`** — §13 licenses it explicitly (`DP:65`) and the AP-119 carve-out names it. That placement dodges AP-121 and AP-25 simultaneously. |
| **AP-55** `AP:756` | `hoist-shared-inputs` | The same input is re-declared on many techniques instead of once on the smallest common container (group or workflow-root `TECHNIQUE.md`; `composeLoaded` merges container I/O and Rules into descendants). Related: path-flavoured ids; synonym drift for one concept across leaves. | **Available:** "Niche inputs shared by only two or three techniques — do not push those to the root just to dedup" (`AP:758`). | Hoist genuinely workflow-wide contextual inputs (artifact location, target path) to `techniques/TECHNIQUE.md` even where some leaves never reference them. Leave 2–3-site inputs declared locally under the carve-out. Use one canonical id per concept — synonym drift is the same defect. |
| **AP-126** `AP:1666` | `variable-description-one-line` | A `variables[].description` is more than one sentence, essay-length multi-clause prose, or includes producer/consumer/gate/layout tails ("Set by…", "Drives…", "Read by…", "Gates…", "Interpolated into…"), install-path catalogs, loop/checkpoint wiring, or a restatement of `defaultValue`. | **Available:** a single short phrase or one sentence with a compact enum or shape hint (`simple\|moderate\|complex`, `{ id, statement }`). Longer contracts belong on the producing technique's `## Outputs` (`AP:1672`). | Author every variable description as one line naming the value, with an enum or shape hint where useful. Three live hits die with their variables (`workflow.yaml:63`, `:71`, `:79` all carry "…from audit-<pass>" producer tails); two more (`:51`, `:87`) need rewriting rather than deleting. **Lives inside `## Authoring Guidance (MR)` — see §1.** |
| **AP-128** `AP:1688` | `unproduced-value-read` | For each step gated by `when` or `condition` that is the **sole producer** of a variable, trace every later reader. Flag when a reader is reachable on a path where the producer is skipped and the variable declares no `defaultValue`. | **Available:** use `operator: exists` / `notExists`, or add the complementary producer arm so the gates are exhaustive. **Explicitly NOT available:** "Do not substitute a `defaultValue` a reader cannot distinguish from a produced value" (`AP:1694`). | **The sharpest silent risk in this build.** Merging activities converts activity-boundary gates into intra-activity `when`, so every producer previously behind a boundary must be re-traced against readers on the newly-reachable paths. Switch definedness questions to `exists`/`notExists` or add the complementary arm. A message interpolating a path variable that is `""` on the create path is the exact defect. **Lives inside `## Authoring Guidance (MR)` — see §1.** |
| **AP-129** `AP:1700` | `stale-restatement-after-change` | When a change alters a behavioural claim — a gate, precondition, default, or ordering — take the pre-change phrasing as the search key and sweep the whole definition tree: every README tier, activity `description`, technique `## Capability`, `outcome[]`, and resource body. Flag each surviving occurrence asserting the pre-change behaviour. **The test is occurrence count against the tree, not against the change's file list** — a manifest naming one file for a claim appearing in three is the same defect. | **Available:** restatements already accurate and unaffected; planning-folder artifacts recording the before state deliberately; a claim held once in a single authoritative home (`AP:1706`). | **The tax entry for this build.** Every altered ordering claim must be updated in **one edit** with a **counted manifest**. Known site families: `resources/README.md` index and guide map, `resources/findings-satellite.md` bare-filename roster, `techniques/compile-report.md` optional inputs, `workflow.yaml` path variables, `activities/README.md`, root `README.md`. Where a claim needs only one home, **delete** the restatements rather than updating them. **Lives inside `## Authoring Guidance (MR)` — see §1.** |
| **AP-116** `AP:1508` | `no-template-creation-guide` | A technique persists a session planning artifact by bare filename and either (a) no workflow resource owns that filename with a `## Template` section, or (b) Protocol embeds a competing full section/table recipe for the file body rather than citing the guide's template. | **Available:** "Shared satellites may share one guide; every persisted bare filename must still map to a guide" (`AP:1508`); non-planning outputs (variables, PRs, commits); citing an existing Template with short when/which bullets only; fill content living correctly in the resource Template while Protocol only orders persist (`AP:1510`). | Read the direction: the obligation is **filename → guide**, never guide → filename. **Dropping artifacts cannot trip AP-116** — it only reduces the mapping burden. Every surviving bare filename maps to a guide with `## Template` + operative `## Rules` and no tutorial ceremony (AP-90, `AP:1182`). **Named catalogue gap:** no entry Detects an *orphaned* guide whose mapped filename is no longer persisted by anything. Nearest coverage is AP-92's "dissolve the resource when nothing template-shaped remains" (`AP:1216`) plus AP-129 for the stale roster line. Retired guides therefore go by hand, in the same commit as their producers. |

---

## 4. The design principles that bind

| Principle | Claim | What it requires of this build |
|---|---|---|
| **§6 One Authoritative Home** `DP:37` | Operative criteria, reusable facts and fill/consult content have exactly one home. Resources hold fill/consult (templates, vocabularies, criteria, policy tables); "does" lives outside resources. Other layers **cite or walk** the home — they do not re-author Detect, duplicate guidance, or invent pass inventories that drift from activity bind sites. | Detect criteria stay in `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md` — **none of the four is edited**. The merged walker walks and cites; it never restates. `audit-anti-patterns.md:29` already mandates "Do not restate, summarize, or number catalog entries in this technique; follow each entry as written" — keep that clause. Enforced downstream by AP-105 `no-shadow-audit-pass` (`AP:1366`): "keep at most one walker per home (or a scoped thin walker that does not re-author criteria)". Today's shape is six walkers over four homes, three on one home. |
| **§12 Output Economy** `DP:61` | Design artifact contracts and checkpoints for the reader who must act — one canonical home per fact, declared human vs agent audience, exception-only status, lean templates, one close-out document, one decision per checkpoint, statement-form messages with artifact links where named. | Cut filenames hard. Delete all-green announce steps: an entire conditional step whose payload is "Schema expressiveness review complete — 0 findings" carries one bit in ~19 YAML lines and a 3-clause gate (AP-86 `AP:1134`, AP-87 `AP:1146`). One close-out document with retrospective as a section (AP-84 `AP:1110`). One decision per checkpoint — collapse only byte-identical-effect option sets. |
| **§13 Separate Contract from Procedure** `DP:65` | Technique Inputs/Outputs are **bind contracts** stating *what* the value is (meaning, shape, allowed values; **"Outputs may include derivation/recognition criteria"**). Protocol orders *when/how* and references `{id}`. Any HOW attached to an I/O entry migrates to a Protocol step or a true cross-cutting Rule. Protocol hosts no trailing "Set …" phases for pure projections. | The explicit licence for putting a coverage ledger's derivation criteria in `## Outputs`. Counts and boolean flags are declared **Outputs** of the producing technique, not Protocol assignments (AP-111 `AP:1442`). No I/O entry carries sequencing or conditional duty. |
| **§15 Phase by Sequenced Outcome** `DP:73` | A Protocol index marks a distinct outcome that must complete before the next begins. Co-aspects of the same act — facets of one survey, constraints on one write, mode branches of one apply — stay as elaborating bullets. Topic partitions reorderable or droppable without changing the phase sequence get no number. | The canon's only stated criterion for when a distinct node is earned, and the test that licenses the activity merge: two mutually reorderable surveys feeding the same downstream write are co-aspects of one phase and neither earns a node. Also governs Protocol authoring — each phase a distinct sequenced outcome, not a topic partition (AP-108 `AP:1406`). Corroborating: activity prefixes run `01,03,04,05,06,08,09,10,11` — `02` and `07` are absent, so the corpus has applied this test twice already, without renumbering. |
| **§18 Prefer Shared Capability** `DP:85` | When a meta or shared-workflow technique already owns a capability, reuse it by binding that op from an activity **or borrowing an activity that already binds it**. Invent a parallel local recipe only after the shared surface cannot absorb the caller's diversity. For mid-phase multi-agent fan-out/consolidate, prefer the meta `orchestration-patterns` ops and borrowable `activities/patterns/` over local spawn-concurrent recipes. | Bind cross-workflow ops by `::` path from activities; invent no local harness recipe (AP-110). §18's fan-out preference **only engages if the design has fan-out** — with no fan-out, declining the borrowable `04-isolated-fan-out.yaml` is not a §18 violation. If a pattern activity *is* borrowed, see §5.13: the borrow is loader-only, invisible to both schemas, and `04-isolated-fan-out.yaml` declares no `transitions:`, so it must be wrapped in a thin local activity that owns them or every transition out of it becomes legal and unwarned. |
| **§20 Keep Orchestration in Structure** `DP:93` | Activities own stage, checkpoints, transitions and graph progress. Techniques stay stage-agnostic: they produce values and durable evidence — they do not name the surrounding activity flow or the gates that consume their outputs. | **Forbids the cheap version of the merge.** The activity count may not come down by making each surviving activity bind one fat technique that internally sequences what used to be an activity's steps. The count comes down by **deleting** files, steps and artifacts. Enforced by AP-68 and AP-114. |
| **§25 Bind Sibling Operations as Steps** `DP:113` | **All** multi-technique work lives in activity `steps[]` (and checkpoints/loops). Bind each already-defined sibling or shared operation as its own activity step. A technique owns one capability's produce path — its Protocol does not `Apply` sibling or meta ops for work. Loader ancestor wrap (`Initial`/`Final`) and container I/O merge are platform composition, not technique→technique work calls. | **Reframes the metric: step count is not the target.** Nothing in the catalogue sets a step-count, line-count or complexity ceiling on an activity — the pressure runs the other way, and `08-quality-review.yaml` already passes audit at 27 technique binds / 530 lines. The legitimately reducible units are **activities, artifacts, walkers, variables and dispatches**. Any consolidation must be *within* one home-walking capability, never *across* capabilities. |
| **§26 Atomic Techniques; Compose at Activities** `DP:117` | Techniques are small atomic capabilities: a short produce path over tools and resources, without complex conditional/branching orchestration and without invoking other techniques to do work. Activities are the composition layer. **Activity→activity composition is allowed: borrow, bind, or include activities** — including the meta pattern library. Technique→technique work calls remain forbidden. | Every new technique is one produce path, no branching orchestration, no technique→technique work call. **Create-vs-update composition is two techniques, not one** — AP-124 (`AP:1598`) names "create vs update" as its verbatim exemplar, and its test (renumbering the phases changes no runtime behaviour because only one applies per call) fires on a fused op. Invent no group container: AP-70's YAGNI do-not-flag (`AP:938`) covers "inventing a group for a hypothetical second cluster", and inventing one drags in §27, AP-115 and AP-123. |
| **§29 Cite Resource Policy; Do Not Restate It** `DP:129` | Resources own vocabularies, criteria/policy and how fields are represented or matched. Technique Protocol operates on **semantic fields** and cites those sections in house style — `per [Section Title](../resources/example.md#section-title)`, link text is the section title, the URL includes the `#` anchor. **Separation test:** representation or layout of a consult surface may change without Protocol change when the underlying fields are unchanged. | **This is what makes the walker merge lossless.** Because the retired techniques *cite* rather than author, merging citers changes no criterion — walker count is decoupled from criteria count. Also fixes the citation form: section title as link text, `#anchor` in the URL. |
| **§30 Resources at the Abstract Level; Split for Section Delivery** `DP:133` | A resource treats artifact names and variables at the **abstract** level — the kind of artifact, the role a variable plays, the skeleton with placeholders. Concrete filenames and variable bindings belong to the technique. Split a multi-part resource into per-category sections, each carrying the fragment pertinent to one category, with any whole-document skeleton in its own section; a renderer fetches only its section via `get_resource { resource_id: "<resource>#<anchor>" }`. **No consumer loads the whole resource to read one category.** Group shared fragments (scales, mappings, reference tables consulted across categories) under a single shared section. | Two applications. **(a)** A section-delivered register guide — `## Template` (skeleton), a shared `## Findings` section (row shape + severity scale), `## Coverage`, `## Known`, `## Rules` — replaces N satellite *files* at no loss of per-dimension isolation. **(b)** Fetching `anti-patterns.md` **by section is mandatory, not an optimisation**: the file is 128,341 bytes against an 80,000-char per-resource eager cap, so a whole-file link can never be bundled (§5.11). Neither new resource may name a concrete artifact filename or a variable belonging to a specific technique. |

### 4.1 Where principles pull against each other, and how the settled design resolves it

| Tension | The pull | Resolution |
|---|---|---|
| **§15 (merge reorderable nodes) vs §9 Encode Constraints as Structure (`DP:49`)** | §15 licenses dissolving activity boundaries; but an activity boundary *is* a structural gate, and deleting five boundaries deletes five ordering guarantees. | Every dissolved boundary is discharged **row by row** into a named structural carrier — step order, `when`, `condition`, a transition condition, or a checkpoint. AP-69's carve-out is literally empty, so a boundary that degrades to prose is self-flagging: `audit-rule-enforcement.md:32` names AP-79 `structure-backed-constraints` (`AP:1046`) as its sole criterion. Ship the discharge table as an artifact of the change, not a paragraph asserting the re-encoding. |
| **§12 Output Economy ("one decision per checkpoint", fewer gates) vs AP-05 / AP-88 (correction C3)** | Economy reads as a licence to merge gates; AP-88's carve-out makes merging non-subsumed decisions a violation. | Economy comes from **deleting zero-effect checkpoints** (AP-89 `AP:1170`, whose discriminator is *recorded effect*) and announce-only steps — **not** from merging decisions. Collapse two option sets only when their effects are byte-identical. Keep removal approval separate from scope approval. |
| **§25 (bind every sibling op as its own step) vs §6/§29 (at most one walker per home)** | §25 pushes toward more binds; §6 pushes toward fewer walkers. | They resolve cleanly because they operate on different axes: consolidate **within** one home-walking capability (six citers of four homes → one walker), and bind **every foreign op** — `list-workflows`, schema validation, verification — as its own step. That is simultaneously §25's Fix and AP-114's Fix. |
| **§25 ("step count is not the metric") vs the token budget that motivates the build** | The delivery-cost argument wants fewer bytes per dispatch; §25 forbids getting there by moving sequencing into techniques. | Take the bytes from artifacts, walkers, variables, announce steps and **dispatch count** — plus the two zero-behaviour-change levers in §5.11 (collapse structured `condition:` blocks to `when:` one-liners; add `#section` anchors to fat resource links). None of these touches step semantics. |
| **§18/§26 (borrow activities) vs AP-107 and schema invisibility** | §26's third sentence and §18 both license activity→activity borrow; AP-110's Detect flags local re-teaching where a borrowable pattern exists. | The borrow is available and **declined** here, because the design has no fan-out so §18's preference does not engage. If it were taken, §5.13 applies: wrap it in a thin local activity that owns `transitions`, or the borrowed node legalises every target unwarned. Never assert a per-target loop in prose that the bind sites do not declare (AP-107). |
| **§30 (fetch one section) vs §5.11 (full mode ships no resource bodies)** | §30 reads as an in-context-delivery optimisation. | It is not — in `full` delivery mode the worker receives resource **ids only** and fetches what it reads. Section anchors are what make that fetch cheap and what keep a 128 KB home reachable at all. Author the anchors because the worker *will* be calling `get_resource`. |

---

## 5. Platform facts that change authored YAML

All citations read against the live server tree during this pass.

### 5.1 `effect.transitionTo` is recorded, not engine-applied — CONFIRMED

`SRV/src/schema/activity.schema.ts:50` states it verbatim: "Activity ID the orchestrator transitions to next via next_activity. **Recorded and returned, not engine-applied**: selecting the option does not itself move the session." At runtime it is read only into the on-disk record — `SRV/src/tools/workflow-tools.ts:1251` (`const transitionedTo = effectObj?.transitionTo;`), stored at `:1262`, echoed back at `:1314`. The **only** write to `currentActivity` is in `next_activity` (`:497`).

`effect.skipActivities` (`activity.schema.ts:51`) is likewise bookkeeping only: `workflow-tools.ts:1282-1294` pushes each id into `draft.skippedActivities` and emits an `activity_skipped` history event. Nothing routes on it.

**Authoring consequence:** an option's `transitionTo` is a *record of intent* the orchestrator is expected to honour, plus an entry in the warn-only legality graph (`SRV/src/loaders/workflow-loader.ts:473`, `:511-513`). It is not a routing primitive. A design that relies on an option "sending" the session somewhere is relying on agent compliance.

### 5.2 `action` verbs have no server interpreter, and `set` is slated for removal — CONFIRMED

`SRV/src/schema/activity.schema.ts:26` declares the enum `['log','validate','set','emit','message']` and, verbatim: "Action verb, interpreted by the executing agent. **The server has no action interpreter**: executing `set` is the worker's job, and its value reaches the session variable bag when the worker reports it in the **`variables_changed`** its orchestrator relays on next_activity. **`set` is slated for removal at the next workflow-schema major (#166 B7/B12).**"

Corroborated at `SRV/schemas/README.md:422` ("In particular, `set` does not write the session variable bag … #166 B7 decided retire; B12 executes it"), `SRV/schemas/README.md:32`, and mirrored in `SRV/schemas/activity.schema.json:118` and `SRV/schemas/workflow.schema.json:535`.

Exhaustive runtime reads of `actions` are **two, neither of which executes anything**:
- `SRV/src/utils/binding-provenance.ts:160-161` — `if (action.action === 'set' && action.target) push(action.target, 'action');` — a `set` target counts as a *declared* variable for provenance classification.
- `SRV/src/tools/workflow-tools.ts:913-915` — emits an enforcement note stating the server records the step but applies no action verb and sets no session variable from one.

**The relay channel:** `variables_changed` is a parameter of **`next_activity` only** — schema `SRV/src/tools/workflow-tools.ts:53-58`, wired `:421`, destructured `:423`, applied at `:490-496` via `applyVariableWrites(..., source: 'variables_changed')`, warn-only logging `:512-513`, folded into `_meta.validation` `:522`. The write-source type is `SRV/src/utils/variable-seed.ts:44`.

**Authoring consequences — this is the most load-bearing fact in this section.**

1. A counter bumped by `action: set` **does not reach the session variable bag inside the activity that bumps it.** It arrives only when the orchestrator relays it on `next_activity`, i.e. at the activity boundary.
2. Therefore an **instance-qualified checkpoint id whose qualifier is a counter must not depend on an intra-activity `action: set`**. The only engine-applied write is a checkpoint option's `effect.setVariable` (§5.4). A design that bumps `remediation_round` with a `set` step and then interpolates `gate#{remediation_round}` later in the *same* activity is reading a stale value.
3. Prefer the cross-activity shape: the counter is written by `effect.setVariable` on a checkpoint option, or relayed on `next_activity` at a genuine boundary, and the qualified gate lives in the *next* activity. Back-edge cycles that cross a node boundary get this for free.
4. Do not author new reliance on `set`. It is on a removal path. Where a value must be authoritative, make it a declared **Output** of a bound technique (which is also AP-34's Fix) or a checkpoint `effect.setVariable`.

### 5.3 `auto_advance` throws when `defaultOption` or `autoAdvanceMs` is missing — CONFIRMED

`SRV/src/tools/workflow-tools.ts:1204-1209`:

```
} else if (auto_advance) {
  if (!checkpoint.defaultOption || !checkpoint.autoAdvanceMs) {
    throw new Error(`Cannot auto-advance checkpoint '${checkpoint_id}': missing defaultOption or autoAdvanceMs.`)
```

Two further gates follow: the full-timer check at `:1211-1216` (auto-advance also throws if `elapsed < ceil(autoAdvanceMs/1000)`) and a missing default-option-object check at `:1218-1220`.

**`blocking: true` is agent-honoured only** — declared at `SRV/src/schema/activity.schema.ts:111` and `:129`: "Agent-honored — the server's auto-advance gate checks only defaultOption + autoAdvanceMs, not this field." Its only other occurrences are copy-through in `SRV/src/loaders/fragment-resolver.ts:98,136,211` and note text at `workflow-tools.ts:919`. The gate never reads `checkpoint.blocking`.

**Authoring consequence:** a checkpoint authored with `blocking: true` and **no** `defaultOption` / `autoAdvanceMs` makes the timer path **structurally unavailable** — the server throws on any attempt to auto-advance it. That is the real mechanism behind "BLOCKING"; `blocking: true` alone is advisory decoration. Conversely, a checkpoint that *does* carry `defaultOption` + `autoAdvanceMs` will auto-advance unattended regardless of `blocking`, so a soft gate's default must carry a recorded effect the design is willing to accept silently (AP-89's discriminator is recorded effect, `AP:1170`).

### 5.4 A structured `condition:` is what makes `condition_not_met` legal — CONFIRMED

`SRV/src/tools/workflow-tools.ts:1223-1229`:

```
} else if (condition_not_met) {
  if (!checkpoint.condition) {
    throw new Error(`Cannot dismiss checkpoint '${checkpoint_id}': it has no condition field. …`)
```

Dismissal records the sentinel option id `__condition_not_met__` (`:1245`) and sets `responseData['dismissed'] = true` (`:1315`).

**Authoring consequence:** this is the **only** place a structured `condition:` is load-bearing rather than interchangeable with `when:`. A checkpoint that the orchestrator must be able to dismiss as inapplicable needs a structured `condition:`; everywhere else, `condition:` and `when:` gate identically (for the agent, for manifest validation at `SRV/src/utils/validation.ts:79-82`, and for bundling eligibility at `workflow-tools.ts:718`) while `condition:` costs many more bytes on every dispatch. `condition` is marked LEGACY on non-checkpoint kinds (`SRV/src/schema/activity.schema.ts:75`).

**`effect.setVariable` is the one engine-applied effect** — written to the session bag, with declared-type mismatch warn-only (`workflow-tools.ts` checkpoint-response region, ~`:1275`; declared `activity.schema.ts:49`).

**The replay trap** (map-sourced, **not re-verified this pass** — see §7): on re-entry, `yield_checkpoint` finds `checkpointResponses[\`${activityId}-${checkpointId}\`]` and silently replays the stored option without prompting; re-prompting requires an instance-qualified id (`base#{var}`) resolved back to the base definition by `checkpointBaseId` (`SRV/src/loaders/workflow-loader.ts:438-464`). Instance-qualify every gate sitting downstream of a back edge, and read §5.2 about which channel may supply the qualifier.

### 5.5 `collectUngated` — the exact eager-bundling predicate — CONFIRMED verbatim

`SRV/src/tools/workflow-tools.ts:715-723`:

```ts
const eligible: Array<Step & { kind: 'technique' }> = [];
const collectUngated = (steps: Step[] | undefined): void => {
  for (const s of steps ?? []) {
    if (s.when !== undefined || s.condition !== undefined) continue;
    if (s.kind === 'loop') { collectUngated(s.steps as Step[]); continue; }
    if (s.kind === 'technique' && s.id) eligible.push(s);
  }
};
collectUngated((activity as Activity).steps);
```

Three precise readings:

1. **Any gate kills eligibility** — `when` **or** `condition`, at `:718`, tested *before* the loop branch.
2. **The push predicate is exactly `s.kind === 'technique' && s.id`** (`:720`). An id-less technique step is dropped, and `kind: action`, `kind: checkpoint` and `kind: loop` are never pushed.
3. **A loop container recurses into `s.steps` and `continue`s without being pushed** (`:719`) — so an **ungated** loop keeps its body eligible, and children are evaluated individually. `breakCondition` and `maxIterations` are not in `stepCommonFields` (`SRV/src/schema/activity.schema.ts:73-77`), so putting the iteration test in `breakCondition` rather than `condition` keeps the body bundle-eligible.

**Divergence to be aware of:** the schema comment at `SRV/src/schema/activity.schema.ts:17-18` claims an enclosing loop keeps its steps lazy. The code does not do that. Trust the code.

**Authoring consequence:** eager delivery is an on/off switch controlled by where gates sit. `08-quality-review.yaml`'s 27 technique steps yield **zero** eager-eligible steps today purely because every top-level step carries an `and(...)` gate and both loops are `condition`-gated. Hoisting mode gates from every step up to the enclosing structure (or to activity granularity) flips a column of lazy fetches into one budgeted eager batch, with no semantic change.

### 5.6 Transition legality is warn-only, and `__terminal__` is legal from anywhere — CONFIRMED

`validateActivityTransition` (`SRV/src/utils/validation.ts:32-51`) returns a **string warning or null**, folded into `_meta.validation`. Four escape hatches:

| # | Hatch | Line |
|---|---|---|
| 1 | No current activity → `null`, unless it mismatches `initialActivity` | `:33-38` |
| 2 | `if (view.act === activityId) return null;` — **self-transition always legal** | `:39` |
| 3 | `if (activityId === TERMINAL_SENTINEL) return null;` — **`'__terminal__'` legal from anywhere**; sentinel defined `SRV/src/loaders/workflow-loader.ts:548` | `:42` |
| 4 | `if (valid.length === 0) return null;` — an activity declaring **no** transitions, decisions or checkpoint `transitionTo` **legalises every target** | `:45` |

`getValidTransitions` (`SRV/src/loaders/workflow-loader.ts:467-475`) returns `[]` for an unknown activity or one with no transitions/decisions/checkpoint-transitions. Ordering is decisive: the session view is snapshotted at `SRV/src/tools/workflow-tools.ts:442`, mutated `:474-509`, **persisted `:510`**, and only then is the validation built at `:516-517`. The warning arrives after the move.

**Authoring consequences:** (a) the transition graph is documentation plus a warning, never a barrier — no constraint may rest on transition legality; (b) an activity-level self-loop is fully legal and **has no bound of any kind** in schema or server, unlike a loop step which at least declares `maxIterations`; (c) hatch 4 is a real hazard — a node with no declared `transitions` is a hole in the graph on which every target is legal and unwarned. Never ship one.

### 5.7 `readActivityRaw` matches the filename-derived id with no fallback — CONFIRMED

`SRV/src/loaders/workflow-loader.ts:569-570`:

```ts
const parsed = parseActivityFilename(file);
if (!parsed || parsed.id !== activityId) continue;
```

The cross-workflow borrowed fallback is also filename-derived (`:597-598`). A miss produces `ActivityNotFoundError` (~`:611`) and `get_activity` throws at `SRV/src/tools/workflow-tools.ts:610`: `Activity not found: ${activity_id}`. **The YAML-declared `id` is never consulted for lookup.**

**Authoring consequence:** the filename's id segment **must equal** the declared `id`. If `08-quality-review.yaml` declares `id: audit`, `loadWorkflow` lists the activity as `audit` (it matches the YAML `id` at `workflow-loader.ts:426-428`) while `get_activity` throws `Activity not found` — and no validator compares the two. Renaming an activity id therefore means renaming the file. Corollary for migration: `get_workflow_status` keeps reporting a dead id as healthy, so a stale session id fails only at the point of `get_activity`.

### 5.8 `artifactPrefix` is server-computed from the filename and orders activities — CONFIRMED

| Fact | Cite |
|---|---|
| Regex: `const match = filename.match(/^(\d+)-(.+)\.ya?ml$/);` | `SRV/src/loaders/filename-utils.ts:7` |
| Assigned from the parsed index | `SRV/src/loaders/workflow-loader.ts:83` (local), `:168` (borrowed) |
| **Activity sort key**: `activities.sort((a,b) => (a.artifactPrefix ?? '').localeCompare(b.artifactPrefix ?? ''))` | `SRV/src/loaders/workflow-loader.ts:91-93` |
| Non-authorable: "Server-computed — do not set in definition files" | `SRV/src/schema/activity.schema.ts:301`; mirror `SRV/schemas/activity.schema.json:588-590` |
| A file whose name does not match the regex is **silently skipped entirely** — `if (!parsed) continue;` with no `logWarn` and no `errors[]` entry (contrast `:77-79`, which does record validation failures) | `SRV/src/loaders/workflow-loader.ts:68-69` |

**Authoring consequences:** (a) the prefix is not authorable, but it is also **not schema-rejected** — an authored value is accepted and then overwritten, so authoring one is silently misleading; (b) it names artifacts `{artifactPrefix}-{bare_filename}` and is surfaced in the `get_activity` header and `_meta.artifact_prefix`; (c) it is the sort order `get_workflow` returns activity stubs in, and `localeCompare` on sparse values ('01' < '06' < '08' < '09') is well-defined, so **sparse prefixes are safe and gaps are already sanctioned** (`activities/README.md:9` declares `02`/`07` intentional); (d) renumbering changes artifact filenames and any downstream row selected by prefix, which is why keeping sparse prefixes is the cheap choice.

### 5.9 Activity `rules[]` is plain strings, fragment-ineligible, and unread by the server — CONFIRMED

- **(a) String-only, no `{ref}` variant.** `SRV/src/schema/activity.schema.ts:300` — `rules: z.array(z.string()).optional()`; JSON mirror `SRV/schemas/activity.schema.json:581-586`. Contrast `RuleEntrySchema`, a union **with** a ref variant, at `SRV/src/schema/workflow.schema.ts:38-44` (`ref` at `:41`). So activity-level rules **cannot be de-duplicated via fragments at all**.
- **(b) No server code reads it.** `get_activity` injects only workflow-level rules: `SRV/src/tools/workflow-tools.ts:929-930` reads `rules.activity` and `rules.universal`, emitted at `:939` and `_meta.activity_rules` at `:979`. A grep of `.rules` across `src` yields only workflow-, technique- and fragment-level reads.

**Authoring consequence:** an activity `rules:` block is **inert bytes redelivered verbatim on every dispatch** — it reaches the worker only as raw YAML text inside the delivered body (`:612`/`:977`), with no projection, no ledger key and no dedup. Combined with AP-69's empty carve-out, prose in activity rules is both forbidden and the worst-performing option available. Corpus usage: exactly one activity in the entire library uses it.

### 5.10 The eager-resource loop: per-resource cap, silent skips — and two map claims corrected

`SRV/src/tools/workflow-tools.ts:795-857`.

**CONFIRMED — per-resource cap.** `SRV/src/utils/resource-delivery.ts:6` — `export const DEFAULT_MAX_EAGER_RESOURCE_CHARS = 80_000;`, bound at `workflow-tools.ts:809`, enforced `:831-834`. An oversized body never bundles; skipping one does **not** stop the loop (a later small resource still bundles) and the id joins `resource_refs` so nothing becomes unreachable. The cap is a hard-coded constant — not config- or env-overridable.

**CONFIRMED — unresolvable refs are skipped with a bare `continue` and no warning.** `workflow-tools.ts:815` — `if (!loaded.success) continue;`. The id is **not** added to `resourceRefIds`, and no warning is produced anywhere: `bundlingWarnings` is fed only by `provenanceWarnings` (`:792`) before being folded into validation (`:874`). **An unreadable or missing resource ref vanishes from the response entirely.** The technique-side skip at `:737` is likewise silent. Authoring consequence: a typo'd resource link or a stale `#anchor` produces **no diagnostic at delivery** — CI (`SRV/scripts/check-resource-anchors.ts`) is the only place it surfaces, so treat that check as load-bearing.

**CORRECTION 1 — resource bodies DO draw down the cumulative budget.** The corpus map and `04-implementation-plan.md` §3.4 both assert "the eager-resource loop has no cumulative budget — only the 80,000-char per-resource cap" and that the `context_tokens × 0.8 × 4` budget "measures technique bodies only". **Both are refuted by the current code.** `workflow-tools.ts:835-843`:

```
// #323 T2: resource bodies draw down the SAME cumulative `spentChars` counter as
// techniques, so `context_tokens` actually bounds the eager bundle. …
if (spentChars + content.length > eagerBudgetChars) {
  resourceRefIds.push(...linkedIds.slice(i));
  break;
}
spentChars += content.length;
```

The in-code comment at `:754-756` still says budget accounting measures the technique body only; **that comment is stale** and contradicted by `:835-843`. Do not plan capacity on the "no cumulative budget" premise.

**CORRECTION 2 — in `full` delivery mode no resource bodies are bundled at all.** The whole eager-resource block is inside `if (referenceMode) { … }` (`:808`); the `else` arm is `:853-857`:

```
// No map is delivered, so no `resource:<id>` ledger writes either …
resourceRefIds.push(...linkedIds);
```

Mode selection is `:637` — `const referenceMode = (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';` — and the tool description at `:589-591` is explicit: reference mode is "ONLY valid when THIS agent received the earlier payloads … Use `bundle: "full"` after summarization or for disposable workers (**never `bundle: "reference"` on fresh workers**)."

**Authoring consequence, and it is significant.** A **fresh dispatched worker runs in `full` mode and receives resource *ids only*** under `resource_refs` — no bodies. The plan's §3.4 claim that "the whole sweep pipeline plus 4 criteria homes arrive in one `get_activity` payload, with **zero** `get_resource` calls" **does not hold for a fresh worker.** Author on the assumption that the worker will call `get_resource` for every criteria home. That makes §30's per-section anchors the primary cost lever rather than a refinement: the worker fetches `anti-patterns.md#authoring-guidance-mr` rather than 128,341 bytes. (The `+24.5%` measurement noted at `:804` concerns the previously-considered alternative of shipping bodies in full mode.)

### 5.11 Delivery-cost levers that change no behaviour

| Lever | Mechanism | Cite |
|---|---|---|
| Collapse structured `condition:` blocks to `when:` one-liners | Both gate identically for the agent, for manifest validation, and for bundling eligibility. `condition` is load-bearing **only** on a checkpoint needing `condition_not_met` dismissal (§5.4). Structured condition blocks are ~36% of the raw activity YAML corpus-wide and ~53% of `08-quality-review.yaml`, redelivered verbatim every dispatch. | `SRV/src/utils/validation.ts:79-82`; `workflow-tools.ts:718`; `SRV/src/schema/activity.schema.ts:75` |
| Add `#section` anchors to fat resource links | `parseResourceRef` + `extractMarkdownSection` slice to the named section on **both** delivery paths; `extractResourceIds` preserves the anchor. `extractMarkdownSection` slices at any heading level and stops at the next same-or-higher heading. | `SRV/src/utils/resource-delivery.ts:38-47`; `SRV/src/tools/resource-tools.ts:779-786`; `SRV/src/utils/resource-ref.ts:54-64`, `:80-91` |
| Move gates off individual steps and onto the enclosing structure | Gating is the on/off switch for eager technique delivery (§5.5). | `workflow-tools.ts:718` |
| Reduce dispatch count | `CORE_WORKER_TECHNIQUES` (7 ops, `SRV/src/loaders/core-ops.ts:52-62`) plus inherited `techniques.activity` ride **every** `get_activity` in full mode — roughly 16 KB of raw source before composition, per dispatch, and reference-mode collapse is invalid for fresh workers. | `workflow-tools.ts:645-650`, `:589-591` |
| **Not a cost lever** | `fragments.*` — materialised to full text before delivery (§6.4). Nor does moving techniques to workflow-level `techniques.activity`: deduped by a `Set` union but still delivered in full to every activity. | §6.4; `workflow-tools.ts:648` |

### 5.12 The loader's resource-link projection captures an optional `<workflow>/` segment — CONFIRMED

`SRV/src/loaders/markdown-technique-loader.ts:228`, inside `rewriteResourceLinks` (`:226-232`):

```
/\[([^\]]+)\]\((?:\.\.?\/)+(?:([A-Za-z0-9_-]+)\/)?resources\/([A-Za-z0-9_-]+)\.md(#[A-Za-z0-9_-]+)?\)/g,
```

Emission at `:229-230`: `` `[${label}](${workflow ? `${workflow}/` : ''}${id}${anchor ?? ''})` ``.

| Authored link | Group 2 | Projected to | Resolves against |
|---|---|---|---|
| `[x](../resources/x.md)` | unmatched | `[x](x)` — bare id | the **session's** workflow (`SRV/src/utils/resource-ref.ts:21-25`) |
| `[x](../../other-workflow/resources/x.md#anchor)` | `other-workflow` | `[x](other-workflow/x#anchor)` | that workflow (`resource-ref.ts:22-23` → `resource-delivery.ts:30-32`) |

**Two authoring traps.** (a) The optional group is a **single path segment**, so `../../a/b/resources/x.md` does **not** match at all and is left as a raw relative link — it never becomes a resolvable resource id. (b) The fallback id extractor at `SRV/src/utils/resource-ref.ts:84-86` (`href.lastIndexOf('resources/')` then slice) silently **drops any workflow prefix** if it ever sees an un-rewritten path, so a cross-workflow link that escaped rewriting resolves against the wrong workflow with no error. Write cross-workflow resource links as exactly one segment before `resources/`.

### 5.13 Whole-activity borrowing works but is invisible to both schemas

A `workflow.yaml` `activities:` entry may be a **string file reference**, local or cross-workflow, resolved by `resolveActivityReference` (`SRV/src/loaders/workflow-loader.ts:126-178`, dispatched `:267-289`), with a matching fallback in `readActivityRaw` (`:585-613`). Borrowed activities keep their **source** workflow as the scope for bare technique and fragment refs (`:171-173`). Live precedent: `remediate-vuln/workflow.yaml:322-330`.

But **neither schema admits the string form**: `WorkflowSchema.activities` is `z.array(ActivitySchema)` (`SRV/src/schema/workflow.schema.ts:88`, with the comment at `:83-88` conceding strings exist only in the intermediate raw schema), and `SRV/schemas/workflow.schema.json:422+` declares items as objects with `additionalProperties: false`. Likewise `activitiesDir` is a non-schema property the loader deletes before validation (`workflow-loader.ts:295-298`).

**Compounding hazard:** `meta/activities/patterns/04-isolated-fan-out.yaml` declares no `transitions:`, so `getValidTransitions` returns `[]` and escape hatch 4 (§5.6) fires — **every** target from that node is legal and unwarned. `meta/activities/patterns/README.md:29-37` prescribes the remedy: "Wire your own `transitions` in a thin local wrapper". Do not land a bare borrow of that file.

### 5.14 Sub-activity reuse: no mechanism at all

`WorkflowFragmentsSchema` is `.strict()` with only `rules` and `checkpoints` (`SRV/src/schema/workflow.schema.ts:64-67`). There is no `fragments.steps`, no `include`, and no step-level `ref` — `ref` exists **only** on `kind: checkpoint` (`SRV/src/schema/activity.schema.ts:124`). Cross-activity reuse below activity granularity happens only by both activities binding the same `group::operation` technique. **The reuse unit is the technique, not the step**, so duplication of gates and persist steps is unavoidable by construction — which is exactly the duplication visible in today's six near-identical audit→persist→announce triplets.

---

## 6. Schema shapes

### 6.1 The four step kinds

`StepSchema` is a `discriminatedUnion('kind', …)` of four **closed** (`.strict()`) objects — `SRV/src/schema/activity.schema.ts:151-156`. A field outside a kind's declared set is a **load error**.

Common to all four (`stepCommonFields`, `:73-77`):

| Field | Semantics |
|---|---|
| `when?` | string, **agent-evaluated — the server never evaluates it** (`:74`) |
| `condition?` | structured; **LEGACY except on checkpoints** (`:75`) |
| `required?` | `literal(false)` **only** — `required: true` is *rejected* (`:76`); it is a worker hint, not a gate |

| kind | Required | Optional | JSON mirror |
|---|---|---|---|
| `technique` | `kind`, `technique` | `id` (derived from the last `::` segment if absent), `actions[]`, + common | `SRV/schemas/activity.schema.json:255-259` |
| `action` | `kind`, `id` | `actions[]` (may be **empty** — a marker step), + common | `:290-293` |
| `checkpoint` | `kind`, `id` | `ref` XOR (`message` + `options`), `defaultOption`, `autoAdvanceMs`, `blocking`, + common | `:385-388` |
| `loop` | `kind`, `id`, `loopType`, `steps` | `name` (the only kind carrying one), `variable`, `over`, `breakCondition`, `maxIterations`, + common | `:450-455` |

- **Only a `technique` step may omit `id`**; any other kind without one is a load error (`SRV/src/schema/activity.schema.ts:184-188`). Note §5.5: an id-less technique step is silently excluded from eager bundling.
- Duplicate resolved ids are an error **per scope** — the top-level list and each loop body are independent scopes (`:191-202`), so a loop body may legally reuse a top-level id.
- The `technique` binding is a bare string or `{name, inputs?, outputs?}` (`:63-67`) — `inputs` are input deviations, `outputs` are output remaps.
- **Loops bound nothing structurally.** `maxIterations` is "enforced by the executing agent" (`:145`); `breakCondition` is "evaluated by the executing agent each iteration" (`:144`); `loopType` semantics (`forEach | while | doWhile`) are agent-owned. `over`, `variable`, `breakCondition` and `maxIterations` are **all optional**, `steps` has no `.min(1)` — so `loopType: while` with no break condition and no max, a `forEach` with no `over`, and an empty body all validate. `SRV/schemas/README.md:34`: "iteration is executed and bounded **entirely by the agent**." There is **no dedicated loop-continue field**; putting the per-iteration test in `condition:` mis-uses the step gate and kills bundling eligibility for the whole body (§5.5).
- **Checkpoint fields:** `id`, `ref`, `message`, `options[]{id,label,description,effect{setVariable,transitionTo,skipActivities}}`, `defaultOption`, `autoAdvanceMs`, `blocking`, plus common (`:121-131`, `:44-53`). Server-acted: `id` as the replay key, `options[].id` (hard-validated — an unknown id throws), `effect.setVariable`, the `defaultOption`+`autoAdvanceMs` timer, the presence of `condition`, and a minimum 3s between yield and an `option_id` response. Recorded-not-enacted: `effect.transitionTo`, `effect.skipActivities`. Agent-honoured only: `blocking`, `message`, option `label`/`description`, `when`.
- **The one genuinely server-enforced gate in the system** is a *yielded* checkpoint: `yield_checkpoint` sets `state.activeCheckpoint` and every other tool then throws (`SRV/src/utils/session/params.ts:38-46`; throw sites in `get_workflow`, `get_activity`, `get_trace`, `get_technique`, `get_resource`, `next_activity`). Only **one** checkpoint may be active at a time — a second `yield_checkpoint` throws. So gates must be strictly sequential, and *reaching* a gate remains agent-honoured (step-manifest order is a warn-only subsequence check, `SRV/src/utils/validation.ts:104-115`).

### 6.2 `decisions` — declarative only

`DecisionSchema` (`SRV/src/schema/activity.schema.ts:253-258`): `id`, `name`, `description?`, `branches` (**min 2**). Each branch: `id`, `label`, `condition?`, `transitionTo?` (omit ⇒ terminal), `isDefault` (default `false`) (`:243-249`).

**What a branch can do:** widen the legal-transition set, and nothing else. **No server code evaluates a branch.** Corpus-wide, `decisions` is read in exactly two places, both of which only widen legality: `getValidTransitions` (`SRV/src/loaders/workflow-loader.ts:472`) and `getTransitionList` (`:500-507`). No selection, no `isDefault` tiebreak, no condition evaluation. `SRV/schemas/README.md:31` classes it as advisory ("stringified for warn-only transition matching").

**What a branch cannot do:** route, gate, or bound anything. A branch may `transitionTo` its own activity — legal, unbounded and not even warned (`SRV/src/utils/validation.ts:39`) — and unlike a loop step it declares no `maxIterations`, so an activity-level self-loop has **no bound of any kind** anywhere in the system.

**Authoring consequence:** a "blocker gate" expressed as a `decisions` block enforces nothing. It is precisely the defect `audit-rule-enforcement.md:32` exists to catch via AP-79 `structure-backed-constraints` (`AP:1046`). Encode a blocker as a checkpoint with a recorded effect plus a transition condition.

### 6.3 `transitions`

`TransitionSchema`: `to` (required), `condition?`, `isDefault` (`SRV/src/schema/activity.schema.ts:262-266`). The schema states legality is validated **warn-only** at `next_activity` (`:294`) — see §5.6 for the four escape hatches and the after-the-fact ordering. `validateTransitionCondition` (`SRV/src/utils/validation.ts:193-213`) is exact-string matching against the stringified condition and runs only when the orchestrator volunteers `transition_condition`.

### 6.4 `fragments.rules` and `fragments.checkpoints` — authoring de-dup, not wire de-dup

`WorkflowFragmentsSchema` is `.strict()` with **exactly two** keys (`SRV/src/schema/workflow.schema.ts:64-67`):

| Key | Shape | De-dup available |
|---|---|---|
| `rules` | `Record<string, string \| string[]>` — a list value expands to that many rules at the referencing slot | workflow-level rule buckets only |
| `checkpoints` | `Record<string, CheckpointFragmentBody>` — `message` + `options` required, plus optional `defaultOption` / `autoAdvanceMs` / `blocking` / `condition` (`SRV/src/schema/activity.schema.ts:106-113`) | checkpoint bodies reused across activities/workflows |

- **Addressing:** `workflow::name` (that workflow only) or bare `name` (declaring workflow, with a `meta` fallback) — `SRV/src/loaders/fragment-resolver.ts:11-13`.
- **Fragments cannot nest** — "a fragment cannot itself contain a reference — so resolution never recurses" (`:16-17`).
- **A ref step contributes only `id` + site gates** (`when`, `required`, and `condition` *only if the fragment declares none*); any local body field alongside `ref` is an error (`:101-105`).
- **What they cannot de-duplicate:** activity-level `rules[]` (string-only, no `{ref}` variant — §5.9) and **steps** (no `fragments.steps`, no step-level `ref` — §5.14).
- **They do not reduce delivery cost.** `materializeRuleEntries` splices refs to plain strings at load (`:80-82`), and `injectCheckpointFragmentBodies` expands the fragment body into the delivered raw YAML at its own indentation (`:164-170`, called at `SRV/src/tools/workflow-tools.ts:617-622`). A referenced checkpoint costs the same bytes on the wire as an inline one.
- **Enforcement** (`SRV/scripts/check-fragments.ts`) has 9 hard-zero violation classes, including `inline-duplicate-of-fragment`; `duplicate-checkpoint` (identical body at **≥2 sites, even within one workflow** — `:307-312`); `duplicate-rule` (only across **≥2 distinct workflows** — `:300-306`); `unused-fragment`; and `undeclared-effect-variable` (a referencing workflow must declare every variable the fragment's `setVariable` writes — `:239-246`).
- **Corpus state:** `WD/workflow.yaml` has **no `fragments:` block at all**. Five other workflows do (`prism`, `prism-audit`, `work-package`, `work-packages`, `substrate-node-security-audit`). Introducing one here means satisfying all nine checks from a standing start.

### 6.5 `bundleTechniques.maxChars`

`BundleTechniquesSchema` = `{ maxChars: nonneg int }`, `.strict()` (`SRV/src/schema/activity.schema.ts:19-21`).

| Value | Meaning | Cite |
|---|---|---|
| absent | no per-technique cap; only the cumulative budget applies | `workflow-tools.ts:706-708` |
| `> 0` | **per-technique** character cap — a single technique whose projected text exceeds it is skipped outright and the loop continues | `:708`, enforced `:759` (`if (text.length > perTechniqueCap) continue;`) |
| `0` | **opt-out sentinel** — disables eager technique bundling **and** the sibling eager-resource map, since both live inside `if (!optedOut …)`. Result: no `step_techniques`, no `resources`, no `resource_refs` | `:707`, `:714`, `:795-857` |

- **Cumulative budget:** `eagerBudgetChars = context_tokens × headroomFraction × charsPerToken` (`:713`), defaulting to `0.8` and `4` from `SRV/src/config.ts:135-136` (env-overridable, wired `:562-563`).
- **Stop-and-break, not best-fit:** the first technique that would overflow terminates the loop (`:775`), preserving a contiguous document-order prefix rather than skipping a large technique to fit a later small one.
- **Resource bodies draw down the same counter** (`:839-843`) — see §5.10, Correction 1.
- **Unchanged-reference markers cost effectively nothing** and never draw down the budget (`:766-768`, `:819-824`) — but reference mode is invalid on fresh workers (`:589-591`).
- **Corpus state:** `bundleTechniques` is used **nowhere** in the corpus — the lever is entirely unexercised. Setting `maxChars: 0` *shifts* cost to `get_technique` rather than removing it; it is only right where most steps are skipped at runtime.

---

## 7. What could not be verified in this pass

Stated as gaps rather than asserted as facts.

1. **The checkpoint replay trap's exact line range and `checkpointBaseId`.** Cited in §5.4 from `01-corpus-map-schemas.md` (`workflow-tools.ts:978-1022`; `workflow-loader.ts:438-464`) and **not re-read here**. Given the confirmed ~35–40-line drift in the checkpoint region of `workflow-tools.ts`, treat the replay-trap line number as approximate. **The behaviour itself is corroborated independently** by the checkpoint-response code read in §5.3–5.4 and by two judges; only the citation is unverified.
2. **Where `#{qualifier}` interpolation in a checkpoint id is resolved.** The map's account implies the orchestrator supplies the concrete id (`gate#2`) and the server strips at `#` to find the base definition — i.e. interpolation is agent-side. Not re-verified. This matters for §5.2's conclusion: if the qualifier is agent-supplied, the binding constraint is what the *orchestrator* believes the counter to be, which is fed by the session bag. The recommendation in §5.2 (drive qualifiers from `effect.setVariable` or a `next_activity` relay, never an intra-activity `set`) holds under either reading, but the mechanism should be confirmed before it is relied on in prose.
3. **Do-not-flag text for AP-91 `lifecycle-row-update` and AP-96 `artifact-audience-declared`.** Their Detect and Fix clauses are quoted from `01-corpus-map-anti-patterns.md`; the carve-out lines were not read. Read `AP:1194-1204` and `AP:1254-1264` before relying on a carve-out for either.
4. **Whether the `#323 T2` cumulative-budget change is present in the worktree the canon lives in.** §5.10's Correction 1 was verified against `/home/mike1/projects/dev/workflow-server` (the live server). If the build ships against a different server revision, re-check `workflow-tools.ts:835-843`.
5. **The stale in-code comment at `workflow-tools.ts:754-756`** ("Budget accounting measures the TECHNIQUE BODY only … Resource bodies are eager-bundled separately") contradicts `:835-843`. Verified as a contradiction; **which one the maintainers intend** is unknown. §5.10 follows the code.
6. **Artifact/variable counts.** Every "N artifacts / N variables / N techniques" figure in the corpus maps and the plan was taken on trust and not recounted. Per `AP:25` and AP-40, do not restate any of them in authored content regardless.
