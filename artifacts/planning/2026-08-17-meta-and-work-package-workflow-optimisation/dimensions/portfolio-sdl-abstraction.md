# Context Economy — Abstraction Leak lens

Lens `15` / `sdl-abstraction` ("Abstraction Leak", SDL-4), serving the **Context Economy** dimension, applied to `workflows/meta/**` and `workflows/work-package/**` with `src/**` and `scripts/**` as implementation surface.

Every figure below was measured on 2026-08-17 against `/home/mike1/projects/dev/workflow-server` by composing each activity's deliverable payload through the server's own loaders (`composeActivityTechnique`, `projectTechnique`, `projectTechniqueToYaml`, `formatTechniqueBundle`, `loadResourceDelivery`, `extractMarkdownSection`) and measuring the composed wire text. Character counts are wire characters after `stringifyForResponse`; token figures use the server's own `DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4` (`src/config.ts:156`). "Full mode" means `bundle` unset on a session whose `contextMode` is not `persistent` — which is what a freshly dispatched worker gets, by the corpus's own instruction (`dispatch-activity.md#delivery-keys-on-agent-context`: "A first dispatch is a fresh context holding no prior deliveries, so it takes full delivery").

---

## Step 1 — Name the abstraction layers, and what crosses them

Four layers, three boundaries.

| Layer | Claims to hide | File |
| --- | --- | --- |
| **A. Definition corpus** | how a step's instructions reach a context | `workflows/meta/**`, `workflows/work-package/**` |
| **B. Composition** | contract inheritance — a leaf need not redeclare an ancestor's inputs or rules | `src/loaders/technique-loader.ts:499-565` (`composeLoaded`) |
| **C. Delivery** | how many bytes travel, and when a repeat collapses | `src/utils/delivery.ts`, `src/utils/resource-delivery.ts`, `get_activity` at `src/tools/workflow-tools.ts:770-1305` |
| **D. Agent contract** | nothing — it is where C's internals are re-documented for agents to obey | `workflows/meta/techniques/workflow-engine/TECHNIQUE.md` |

### A1 — B's concealment is asymmetric: it hides inheritance from the author and re-exposes it on the wire, once per technique

`composeLoaded` merges each ancestor's `rules`, `inputs` and `outputs` into the technique **value**, then partitions inputs/outputs by winning-definition provenance into `inherited_inputs` / `inherited_outputs`. The merged rules are not partitioned at all — they land in `rules` as if the technique had written them. So the group contract is delivered as many times as the response carries techniques from that group.

`workflows/meta/techniques/workflow-engine/TECHNIQUE.md` is 8,242 characters, 12 rules, and is the ancestor of all 30 techniques in that group. `get_activity` for `meta/activities/00-discover-session.yaml` bundles 5 ungated technique steps; four of them resolve to workflow-engine operations:

| Step | Technique | Composed chars | of which `rules` |
| --- | --- | --- | --- |
| `name-initiative` | `workflow-engine::derive-initiative-name` | 10,384 | 8,200 |
| `extract-context` | `workflow-engine::extract-identifying-context` | 9,987 | 8,125 |
| `detect-resume-intent` | `workflow-engine::detect-resume-intent` | 9,450 | 8,125 |
| `list-available-workflows` | `workflow-engine::list-workflows` | 9,185 | 8,125 |
| `resolve-host-repo` | `version-control::resolve-host-repo` | 6,626 | 3,467 |

**36,042 of the 45,632-character step-technique bundle (79%) is inherited group contract, and 16,250 characters of it is byte-identical repetition inside one response.** The step-specific protocol — the reason each step exists — is under 9,600 characters of the 45,632.

The abstraction that collapses it: **deliver the contract by name, not by value.** One `contracts: { "workflow-engine": {…} }` block per response, and `contract: workflow-engine` on each step technique. The projection already has the seam — `dedupTechniqueBlocks` (`src/utils/delivery.ts:138`) does exactly this — but see B1 for why it does not run.

### A2 — Corpus-wide, 30.1% of the eager step-technique bundle is byte-identical intra-response repetition

Composing all 20 activities of the two workflows through the server's own eligibility rule (`collectUngated`, `src/tools/workflow-tools.ts:939-945`) gives 64 bundled steps and 333,039 characters of composed technique bodies. Of those, **100,123 characters (30.1%, ≈ 25,030 tokens) repeat byte-for-byte inside the same `get_activity` response**:

| Repeated block | Chars | Where it comes from |
| --- | --- | --- |
| `inherited_inputs` (note + items) | 37,178 | `composeLoaded` partition, `technique-loader.ts:550` |
| merged `rules` | 24,010 | `composeLoaded` merge, `technique-loader.ts:531` |
| `PROVENANCE_NOTE` (349 chars/step) | 17,568 | `src/utils/binding-provenance.ts:51` |
| `INHERITED_SOURCE_POLICY` (343 chars/step) | 16,464 | `src/utils/binding-provenance.ts:352` |
| `inherited_outputs` | 4,903 | `technique-loader.ts:552` |

Worst offenders by share of their own bundle:

| Activity | Bundled steps | Composed chars | Repeated | Share |
| --- | --- | --- | --- | --- |
| `meta/00-discover-session` | 5 | 45,632 | 22,142 | **48.5%** |
| `work-package/01-start-work-package` | 8 | 27,923 | 13,049 | **46.7%** (8,086 of it `inherited_inputs` alone) |
| `work-package/02-design-philosophy` | 4 | 15,345 | 6,856 | 44.7% |
| `work-package/03-requirements-elicitation` | 6 | 29,472 | 10,216 | 34.7% |
| `work-package/04-research` | 5 | 21,727 | 7,404 | 34.1% |
| `work-package/12-strategic-review` | 6 | 33,834 | 11,284 | 33.4% |

`PROVENANCE_NOTE` and `INHERITED_SOURCE_POLICY` are invariant strings compiled into the server. They are appended per step by `decorateTechniqueProvenance` (`src/utils/binding-provenance.ts:398-408`) and shipped once per bundled step. On `work-package/01-start-work-package` that is 8 copies of the same 692 characters.

### A3 — The activity-level worker bundle is invariant, and it is 47% of the median activity's measured delivery

`get_activity` unions the workflow's `techniques.activity` with the activity's own and with `CORE_WORKER_TECHNIQUES` (`src/loaders/core-ops.ts:72-86`), composes them, and ships the result on **every** call. Measured across all 20 activities there are exactly **three distinct values**:

| Bundle | Chars | of which merged `rules` | Activities |
| --- | --- | --- | --- |
| meta | 34,619 | 18,965 | all 5 |
| work-package (5 techniques) | 35,204 | 18,965 | 8 |
| work-package (6 techniques, adds `variable-binding`) | 40,069 | 20,657 | 7 |

Delivered once per activity across both workflows that is **735,210 characters for at most 40,069 characters of distinct content**. Against the repo's own measurement — "one activity costs a median 74,109 characters once its lazy fetches are counted" over 112 sealed worker contexts (`src/config.ts:170`) — **the invariant bundle is 35,204 / 74,109 = 47% of a median activity's whole delivery cost**, paid before a single step is read. With `DEFAULT_BATCH_MAX_ACTIVITIES = 3` and the budget binding after two heavy activities (`src/config.ts:180-182`), a 15-activity work-package run needs at least five fresh worker contexts: **≥ 177,000 characters of bundle for ≤ 40,069 distinct, ≈ 137,000 characters (34,000 tokens) of pure repetition per run.**

### A4 — A resource cited in a group contract is linked by every technique in the group

`extractResourceIds` (`src/utils/resource-ref.ts:72`) runs over the **composed** technique text, which includes the inherited group rules. So a resource cited once in a `TECHNIQUE.md` becomes a link on every leaf beneath it, and the eager bundler ships its body for any bundled step in that group.

| Group contract | Resources it cites | Chars | Leaves that inherit the link |
| --- | --- | --- | --- |
| `work-package/techniques/manage-artifacts/TECHNIQUE.md` | `deferred-items` (1,953), `follow-ups` (1,304), `session-trace` (2,332), `meta/writing-register` (1,907) | 7,496 | 2 |
| `work-package/techniques/codebase-comprehension/TECHNIQUE.md` | `codebase-comprehension#corpus-artifact-template` (4,443), `#comprehension-log-template` (1,243) | 5,686 | 3 |
| `work-package/techniques/strategic-review/TECHNIQUE.md` | `architecture-summary#architecture-summary-artifact-template` (3,908), `strategic-review#strategic-review-artifact-template` (1,150) | 5,058 | 7 |

`work-package/activities/15-codebase-comprehension.yaml` bundles three steps (`build-comprehension`, `initial-deep-dive`, `revise-initial-questions`), all in that group, and its linked-resource set totals **16,988 characters against 19,969 characters of technique body** — 5,686 of the resource total is group-contract fan-out, linked identically by all three steps.

The abstraction: **resource links belong to the step that reads them, not to the contract that mentions them.** A `resources:` list on the step binding, or a group-contract link marked non-inheriting, removes the fan-out entirely.

---

## Step 2 — Abstraction inversions: the interface reveals a choice that should be hidden

### B1 — `bundle: "reference" | "full"` is the caller driving the server's dedup path, and it is why A2 exists

`src/tools/workflow-tools.ts:1005-1007`:

```ts
const projected = referenceMode
  ? dedupTechniqueBlocks(projectTechnique(technique), state, newDeliveries, scope)
  : projectTechnique(technique);
```

Every collapse in the delivery layer is behind this one boolean: per-technique bundle dedup (`:871`), rules-bundle dedup (`:885`), inherited-rules dedup (`:1201`), and the whole eager-resource map (`:1036`). A freshly dispatched worker does not set it — the corpus tells it not to — so **the entire 100,123 characters of A2 ships in full to exactly the contexts least able to afford it.**

This is an inversion because the flag encodes a fact the server already holds. `deliveryScope` (`src/utils/delivery.ts:60`) resolves to the per-call `agent_id`, and a fresh `agent_id` reads an empty `deliveredContent[scope]` — so reference mode is *unconditionally safe for a fresh context*: there is nothing in the ledger to collapse against, and every emitted marker is therefore a marker for bytes the context does hold. Worse, **intra-response dedup needs no ledger at all**: a marker for a block that appears two entries above it in the same payload is readable by construction, whatever the mode. The flag's one genuine caller-only case — content evicted by summarization — is already served by `full: true` (`resource-tools.ts:761`).

The cost of the inversion is not only bytes. It is the six rules in `workflow-engine/TECHNIQUE.md` that exist solely to teach agents to drive it:

| Rule | Chars |
| --- | --- |
| `resource-section-or-whole` | 1,028 |
| `agent-id-scopes-delivery` | 1,065 |
| `fetch-costs-what-it-delivers` | 720 |
| `resource-loading-via-tool` | 715 |
| `progressive-step-technique-load` | 559 |
| `force-full-after-summarization` | 310 |
| **total** | **4,397 of 8,242 (53%)** |

Those 4,397 characters describe the ledger's key scheme, its scoping rule, and its failure mode. They merge into all 30 workflow-engine techniques — **131,910 characters of potential delivery** — and are restated again in the response itself: `bundle_note` (452 chars, `:1146`), `step_techniques_note` (1,127 chars, `:1127`), two `resources_note` variants (462 / 268 chars, `:1132-1133`), `enforcement_notes` (621 chars over two entries, `:1180-1185`). The same contract is stated in four places and enforced in none.

### B2 — `resource-section-or-whole` makes the agent predict its own future reads, and the corpus gets it wrong

The rule tells an agent to "choose bare vs `#section` `resource_id` by how much of the resource this agent context will need", and then explains that "bare and `#section` ids are distinct delivery keys". That is the ledger's key scheme surfaced as an authoring decision. Measured outcome, per resource:

| Resource | Whole file | Anchors cited | Anchor chars summed | Redundant chars | Ledger keys |
| --- | --- | --- | --- | --- | --- |
| `work-package/resources/review-mode.md` | 21,480 | 13 | **24,805 (115%)** | 5,781 shipped twice | 13 vs 1 |
| `meta/resources/planning-readme.md` | 15,547 | 9 | **19,718 (127%)** | 5,627 shipped twice or thrice | 9 vs 1 |
| `work-package/resources/codebase-comprehension.md` | 18,450 | 5 | 16,988 (92%) | — | 5 vs 1 |
| `work-package/resources/test-suite-review.md` | 8,724 | 5 | 8,151 (93%) | — | 5 vs 1 |
| `work-package/resources/findings-report.md` | 6,393 | 6 | 5,640 (88%) | — | 6 vs 1 |

`work-package/techniques/review-summary.md` alone cites `review-mode.md#review-comment-template` (14,238 chars) **and** five of its own subsections — `#header-fields` (3,943), `#reference-dont-restate` (938), `#caveat-form` (427), `#review-type-selection` (261), `#prose-register` (212). Those 5,781 characters are inside the template it also asks for. `planning-readme.md` is worse: `dispatch-activity.md` and `sync-progress-status.md` between them cite `#rules` (6,089), `#progress-table` (4,669, a subsection of `#rules`) and `#row-ownership-map` (958, a subsection of `#progress-table`) — the innermost 958 characters ship three times.

Delivering each of those two files **whole, once** costs 21,480 and 15,547 characters against 24,805 and 19,718 — **3,325 and 4,171 characters cheaper, with 12 and 8 fewer ledger keys.** The rule's advice is exactly inverted for both.

### B3 — The bundler's containment check understands file ⊃ section but not section ⊃ subsection

`src/tools/workflow-tools.ts:1045-1051` sorts bare ids ahead of anchored ones and skips an anchor whose *file* is already in the bundle:

```ts
const coveredByItsFile = (rid: string) => {
  const anchorAt = rid.indexOf('#');
  return anchorAt > 0 && deliveredWhole.has(rid.slice(0, anchorAt));
};
```

Because containment is decided by a string index rather than by the heading tree, every overlap in B2 is invisible to it. `extractMarkdownSection` (`src/utils/resource-ref.ts:33-65`) already walks headings and already knows each section's depth — the nesting relation is available and unused.

### B4 — Gating is inverted the other way: the server holds the evaluator and the variable bag, and refuses to look

`src/schema/when-expression.ts:301` exports `evaluateWhenExpression`. **Nothing under `src/` imports it.** Its only callers in the repo are `tests/when-expression.test.ts`, `tests/batch-loop-walk.test.ts:186`, `tests/batch-loop-gates.test.ts:37-41`, `tests/e2e/walker.ts` and `scripts/check-stealth-isolation.ts:122` — tests, a harness, and a CI guard.

Meanwhile the corpus hands the grammar to every worker. `workflows/meta/techniques/workflow-engine/activity-worker.md:52`:

> Honor `when:` gates against the variable bag — operators `==`/`!=`/`>`/`<`/`>=`/`<=`, bare truthiness, unary `!`, `&&`, `||`, parentheses; C-style precedence (`()` > `!` > comparisons > `&&` > `||`); mixed `&&`/`||` at one depth requires parentheses; match the reference evaluator in `src/schema/when-expression.ts` (invalid expressions do not run the step)

A definition file names a server source path and asks the agent to reimplement it. The consequence in bytes: `collectUngated` treats any gate as undecidable and excludes the step from bundling, so **59 gated technique steps carrying 291,414 composed characters are permanently lazy — 59 `get_technique` round trips.** The extreme cases:

| Activity | Gated technique steps | Gated chars | Ungated | Gate variables |
| --- | --- | --- | --- | --- |
| `work-package/13-submit-for-review` | 14 | **71,375** | **0** | `is_review_mode`, `stealth_mode`, `review_posted` |
| `work-package/11-validate` | 3 | 15,449 | **0** | `is_review_mode`, `project_type`, `run_local_validation` |
| `work-package/10-post-impl-review` | 6 | 32,206 | 3 | `has_flagged_blocks`, `problem_complexity`, `gitnexus_indexed` |
| `work-package/01-start-work-package` | 7 | 31,524 | 8 | `issue_platform`, `is_review_mode`, `use_existing_pr` |
| `meta/00-discover-session` | 2 | 20,033 | 5 | `resume_intent_requested` |

`13-submit-for-review` is the pure case: its `get_activity` bundles **no step content whatsoever**, and all 19 of its gates turn on `is_review_mode` and `stealth_mode`, both bound long before that activity runs.

### B5 — Untaken branches of the activity YAML ship whole

The activity body is delivered verbatim (`injectResolvedStepIds` at `:820`, plus checkpoint fragment materialisation). Bytes spanned by gates that a given run can never satisfy:

| Activity | Total YAML | Gate-spanned | Share | Largest dead branch |
| --- | --- | --- | --- | --- |
| `meta/03-dispatch-client-workflow` | 4,110 | 2,457 | **60%** | five mutually exclusive `worker_result.result_type` branches |
| `work-package/11-validate` | 2,877 | 1,094 | 38% | 445 on `is_review_mode == true` |
| `work-package/14-complete` | 3,312 | 1,177 | 36% | 420 on `is_review_mode == true` |
| `meta/01-initialize-session` | 1,715 | 456 | 27% | 255 / 201, an `is_resuming` pair |
| `work-package/07-assumptions-review` | 5,508 | 1,259 | 23% | four `is_review_mode != true` branches |
| `work-package/13-submit-for-review` | 15,053 | 3,011 | 20% | 1,195 on `is_review_mode != true && stealth_mode != true` |
| `work-package/01-start-work-package` | 21,213 | 3,599 | 17% | 517 / 458 / 246 / 195 on `issue_platform` |

On an implementation run, `13-submit-for-review`'s 778 + 412 = 1,190 review-mode characters are dead; on a review run, its 1,195 + 238 + 101 implementation characters are.

---

## Step 3 — Abstraction leak bugs: couplings that break silently

### C1 — `qualifyResourceId` keys off the activity's workflow, not the technique's — one activity's resources are unreachable today

`src/tools/workflow-tools.ts:1014`:

```ts
linkedResourceIds.add(qualifyResourceId(rawId, sourceWorkflowId, workflow_id));
```

`sourceWorkflowId` comes from `readActivityRaw` (`:819`) — it is the workflow the **activity file** was authored in. But `rawId` was extracted from a **technique** body, and a borrowed technique can live in a third workflow. `qualifyResourceId` (`src/utils/resource-ref.ts:102-114`) returns the id unchanged when the two workflow ids match, so a bare id from a foreign technique resolves against the wrong `resources/` tree.

**Verified failure.** `work-package/activities/09-lean-coding-audit.yaml` step `harvest-debt` binds `ponytail/harvest-debt`, whose Protocol cites `debt-ledger#template` and its `#rules`. Both qualify to bare `debt-ledger#template` / `debt-ledger#rules` (activity workflow `work-package` equals delivery workflow `work-package`), and resolve against `workflows/work-package/resources/`, which has no `debt-ledger.md`:

```
Resource not found: debt-ledger in workflow work-package
```

Two `Unresolvable resource ref` warnings on every `get_activity` for that activity (`:1061`), and the worker is instructed to write a ledger whose 1,953-character template it never receives. `workflows/ponytail/resources/debt-ledger.md` exists. The sibling links in the same technique survive only because they are spelled `../../ponytail/resources/…` and arrive pre-qualified.

### C2 — `DEDUP_BLOCKS` is a shared contract that nothing shares

`src/utils/delivery.ts:95`:

```ts
export const DEDUP_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'rules', 'provenance_note'] as const;
```

Its own comment says "These mirror `projectTechnique`'s key strings, so renaming those keys must update this list." It is exported, and **called by nothing.** The single reference in the repo is `tests/mcp-server.test.ts:990`, which asserts that a doc comment mentions the identifier. The actual dedup uses a separate private `INHERITED_SPLIT_BLOCKS` (`:98`) plus inline `'rules'` and `'provenance_note'` literals at `:147`, `:173`, `:178`. Renaming a projection key breaks dedup silently, and the constant written to prevent that keeps compiling.

### C3 — Four raw `'#'` parses in the delivery layer duplicate the id grammar

`src/utils/resource-ref.ts:15` owns the resource-ref grammar. The bundler re-derives it at `src/tools/workflow-tools.ts:1046`, `:1049`, `:1076` and `:1103` (`includes('#')`, `indexOf('#')`). This is the mechanism of B3: a containment check written against a character offset cannot know about heading depth, so no amount of tuning the sort order will make it see that `#header-fields` is inside `#review-comment-template`.

### C4 — Conditional resource reads live in prose, so the bundler ships them unconditionally

`work-package/techniques/review-test-suite.md:71` and `work-package/techniques/implement-task.md:50` both read:

> For Rust projects, ... from [tdd-concepts-rust](../resources/tdd-concepts-rust.md)

No anchor, so the whole 13,740-character file. `extractResourceIds` sees an unconditional markdown link; `project_type` is in the session bag and never consulted. Reference-mode `get_activity` for `08-implement` and `10-post-impl-review` therefore ships **13,740 × 2 = 27,480 characters on every non-Rust run.** On `10-post-impl-review` the linked-resource set is 35,704 characters against 21,617 characters of technique body — tdd-concepts-rust is 38% of the resource weight, for three bundled steps.

### C5 — 22 forwarder techniques pay the group contract twice and buy nothing

Techniques whose Protocol is ≤ 4 content lines and ≥ 50% `Apply` — 22 files, 16,644 bytes on disk:

| Forwarder | Bytes | Forwards to | Bytes |
| --- | --- | --- | --- |
| `work-package/techniques/update-pr/mark-ready.md` | 556 | `meta/techniques/github-cli-protocol/mark-ready.md` | 560 |
| `meta/techniques/github-cli-protocol/update-pr-title.md` | 342 | `gh` REST call | — |
| `meta/techniques/atlassian-operations/resolve-cloud-id.md` | 657 | one MCP call | — |
| `work-package/techniques/finalize-documentation/revise-session-metrics.md` | 1,195 | `meta/techniques/workflow-engine/revise-session-metrics.md` | 3,058 |

On the wire a forward is not free. `update-pr` inherits 3,790 characters per technique; `github-cli-protocol` inherits 1,573. A two-line `mark-ready` forward therefore costs roughly **6,500 characters and two round trips** to reach a 560-byte operation.

Two of them have also **forked**, which is the leak becoming a defect: `work-package/techniques/manage-git/push-commits.md` (676 B) declares `push_remote`, which stealth mode relies on to keep commits off a public remote; `work-package/techniques/update-pr/push-commits.md` (500 B) does not declare it, and adds a rebase-on-divergence step the other lacks. Same name, same capability sentence, divergent contracts, nothing marking which governs.

### C6 — Behaviour documented in prose that no type or schema encodes

Beyond B1's 4,397 characters: `run-status-shape` (1,623 chars in `workflow-engine/TECHNIQUE.md`) is orchestrator-facing emission format, and inherits into all 30 workflow-engine techniques including every worker-facing one. `dispatch-activity.md#batch-is-bounded-by-the-server` (1,038 chars) and `activity-worker.md#batch-ends-where-the-server-says` (614 chars) both narrate the same `batchBound` / `batchRefusal` mechanism the server enforces at `workflow-tools.ts:800-814`, from two sides. `enforcement_notes` (`:1176-1190`) exists precisely because "the enforcement model (schemas/README) lives in docs that never ride the wire" — the comment concedes the layering failure and patches it with 621 characters of delivery-time prose rather than a typed field.

Two operational asides, neither an agent-context cost: `deliveredContent` and `history` grow unbounded — no pruning exists anywhere in `src/utils/session/` — while every tool call loads and seals the whole session file (141 KB in the current planning folder); and `buildProducerIndex` is rebuilt on **every** `get_technique` call (`src/tools/resource-tools.ts:691`) where `get_activity` builds it once for the whole bundle (`:949`).

---

## The leak law

**The widest blast radius is `composeLoaded` (`src/loaders/technique-loader.ts:499-565`) merging the ancestor contract into the technique value instead of delivering the technique against a named contract.**

It is called by both delivery paths — `composeTechnique` for `get_technique` and `resolveTechniques` for the bundle — so all **262 technique files** across the two trees are downstream of it, and so is every consumer that reads its output: `projectTechnique`, `projectTechniqueToYaml`, the eager bundler, `extractResourceIds`, `dedupTechniqueBlocks`, and the ledger's whole key namespace (`technique:<block>:<hash>`, `technique:inherited_inputs.note:<hash>`, `technique:provenance_note:<hash>` — seven key shapes that exist only to undo this merge after the fact). One change at that seam — emit `contract: <group-ref>` plus the technique's own fields, and each distinct contract once per response — removes A1, A2, A4 and C2 outright, and half of C6 with them.

Second-widest: **`extractResourceIds` deriving links from composed text rather than from a declared, step-scoped list.** That is what makes A4's fan-out structural, C4's conditional read invisible, and B3 unfixable without also fixing the ids' provenance (C1 lives in the same three lines).

---

## Opportunity enumeration

Ordered by saving per unit of build cost. "Saving" is measured characters across one pass of both workflows unless stated.

| # | Opportunity | Saving | Implementation surface | Build cost |
| --- | --- | --- | --- | --- |
| **1** | **Make block dedup response-local and unconditional.** Run `dedupTechniqueBlocks` against a per-response `seen` map regardless of `referenceMode` — a marker for a block earlier in the *same* payload is readable by construction. | **100,123 chars / 25,030 tokens** corpus-wide; 22,142 (48.5%) on `meta/00-discover-session`, 13,049 (46.7%) on `01-start-work-package` | edit `src/tools/workflow-tools.ts:1005-1007`; add a response-local accumulator beside `newDeliveries` in `src/utils/delivery.ts` | **Small.** ~40 LOC. The function exists; only its gate and its lookup source change. Needs one response note explaining a same-payload marker. |
| **2** | **Deliver the group contract by name.** `contracts: { <group>: {rules, inherited_inputs, inherited_outputs} }` once per response; `contract: <group>` on each step technique. Subsumes #1 and also collapses the first copy across `get_technique` fetches within an activity. | On `meta/00-discover-session` the rules weight drops from 32,575 to 8,200 chars — **24,375 chars off one response**. Retires 7 of the ledger's key shapes. | `src/loaders/technique-loader.ts:548-554`, `projectTechnique` (`:33`), `src/utils/delivery.ts` (retire `dedupTechniqueBlocks`, `DEDUP_BLOCKS`), `schemas/technique.schema.json` | **Medium.** Wire-shape change with an agent-facing contract; `scripts/check-inherited-inputs.ts` and `scripts/check-technique-template.ts` need re-pointing. |
| **3** | **Evaluate gates at delivery.** Call `evaluateWhenExpression` in `collectUngated` against `sessionView(state)`; bundle steps whose gate is decidably true, omit false-gated step bodies from the delivered YAML, leave genuinely undecidable gates lazy as today. | Converts 59 lazy round trips (**291,414 chars** of `get_technique`) into eager bundling for the taken branch — `13-submit-for-review` goes from 0 bundled steps to its live branch. Removes 2,457 dead chars from `meta/03-dispatch-client-workflow` (60%), 1,177 from `14-complete`, 1,094 from `11-validate`, 3,011 from `13-submit-for-review`. Retires `activity-worker.md:52`, ~430 chars × 30 techniques. | `src/tools/workflow-tools.ts:939-945`; a pruning pass over `activityBody` beside `injectResolvedStepIds` | **Medium-high.** Needs a three-valued answer (true / false / not-yet-bound) for variables set mid-activity. `scripts/check-stealth-isolation.ts:122` already demonstrates the evaluation harness against the corpus. |
| **4** | **Anchor-aware resource containment.** Replace the four raw `'#'` parses with `parseResourceRef`, and build a heading-nesting index so a bundled ancestor section covers its descendants and a bundled file covers all of them. | `review-mode.md` 24,805 → 21,480 whole-file (**3,325 chars, 13 keys → 1**); `planning-readme.md` 19,718 → 15,547 (**4,171 chars, 9 keys → 1**); `codebase-comprehension.md` 5 keys → 1. Removes 5,781 + 5,627 chars of double-shipping. | `src/utils/resource-ref.ts` (new `sectionContains` helper — `extractMarkdownSection` already tracks depth); `src/tools/workflow-tools.ts:1045-1051` | **Small-medium.** ~60 LOC plus a decision rule for when the union of anchors is cheaper than the file. |
| **5** | **Declare resource links on the step, with an optional gate.** Move links out of prose into a `resources:` list on the technique or step binding, and allow `when:`. | 27,480 chars on every non-Rust run (`tdd-concepts-rust` × 2 activities); the group-contract fan-out of A4 — 5,686 chars × 3 steps on `15-codebase-comprehension`, 5,058 × 7 leaves in `strategic-review`, 7,496 in `manage-artifacts` | `schemas/technique.schema.json`, `src/schema/technique.schema.ts`, `extractResourceIds`; extend `scripts/check-resource-anchors.ts` | **Medium.** Schema + loader + a corpus migration of the prose links (~40 sites). |
| **6** | **Fix `qualifyResourceId`'s workflow source.** Thread the resolved technique's workflow out of `composeActivityTechnique` and qualify against that, not the activity's. | Correctness: 2 warnings and one missing 1,953-char template body on `09-lean-coding-audit`, on every delivery. Prevents the same class for every future borrowed technique. | `src/tools/workflow-tools.ts:1014`; `composeActivityTechnique` return shape (`src/loaders/technique-loader.ts:64`); new assertion in `scripts/check-all-refs.ts` | **Small.** One signature field, one call-site change, one guard. |
| **7** | **Add a delivery-repetition guard.** Compose every activity's eager bundle, hash each block, fail when byte-identical intra-response repetition exceeds a threshold. | Prevents regression of #1/#2. Today's baseline: 30.1% corpus-wide, 48.5% worst activity. | new `scripts/check-delivery-repetition.ts` — `scripts/run-token-benchmark.ts` already walks the corpus, `scripts/guard-protocol.ts` gives the finding shape | **Small.** ~120 LOC; joins the 26 existing `check-*.ts` guards and `npm run check:all`. |
| **8** | **Retire the forwarder layer, and reconcile the forked `push-commits` pair.** | ~6,500 chars and one round trip per forwarded call, × 22 forwarders. Closes the stealth-mode contract fork (`push_remote` present in one copy, absent in the other). | delete/inline 22 technique files; guard in `scripts/check-activity-technique-overlap.ts` | **Small per file, 22 files.** Each has call sites to re-point. |
| **9** | **Move delivery-mechanics prose out of the agent contract** once #1–#4 land. `fetch-costs-what-it-delivers`, `resource-section-or-whole`, `agent-id-scopes-delivery`, `progressive-step-technique-load` reduce to one sentence each when the server decides. | ~3,400 chars × 30 workflow-engine techniques ≈ **102,000 chars** of potential delivery; ~13,600 chars off `meta/00-discover-session`'s 45,632-char bundle | definition edit: `workflows/meta/techniques/workflow-engine/TECHNIQUE.md`; trim the four response notes at `workflow-tools.ts:1127-1146` | **Small,** but strictly gated on #1–#4. |
| **10** | **Price the invariant worker bundle.** 34,619 / 35,204 / 40,069 chars — three distinct values across 20 activities, 47% of the median activity's 74,109-char delivery. Options: move the 18,965–20,657-char merged `rules` block into the dispatch stub the orchestrator already composes via `compose-prompt`, or content-key it at session scope. | ≈ **137,000 chars (34,000 tokens) per 15-activity work-package run** at `batchMaxActivities = 3` | `src/loaders/core-ops.ts:72-86`; `get_activity` bundle assembly (`:856-890`); `workflows/meta/techniques/workflow-engine/compose-prompt.md` | **High.** Changes the dispatch contract, and a fresh worker genuinely needs the rules — the saving is only real if they arrive by another route. Measure with `npm run bench:dispatch` before committing. |

Combined, #1–#4 and #6 are ~340 LOC of server change and no definition migration, and they remove **100,123 chars of intra-response repetition, ~7,500 chars of resource over-delivery on the two worst files, and 291,414 chars of avoidable lazy round trips** while fixing one live unresolvable-resource defect.
