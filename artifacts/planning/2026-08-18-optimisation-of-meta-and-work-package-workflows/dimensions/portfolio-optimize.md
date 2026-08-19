---
Target: /home/mike1/projects/dev/workflow-server — workflows/meta/** and workflows/work-package/**, with src/tools/, src/loaders/, src/utils/ and scripts/ as the implementation surface
Evaluation Date: 2026-08-18
Lens: optimize (20) — "What code COSTS"
Dimension: Delivery Economy
---

# Portfolio Optimize — Delivery Economy After the Remediation

Lens 20 asks what code costs. On a definition server the currency is characters into an agent context and milliseconds of server time, and the erased datum is the fact of a payload having already arrived. Every figure below is measured, not estimated: the walk numbers come from `npm run bench:token -- --context-mode=fresh` re-run at `workflows@2e8b6297`, read out of the server's own `logInfo` stream; the composition numbers come from driving `loadWorkflow`, `resolveTechniques`, `formatTechniqueBundle`, `composeActivityTechnique`, `projectTechnique`, `dedupTechniqueBlocks` and `loadResourceDelivery` directly over all 20 activities of the two trees; the timings come from a warm-cache loop around the same functions.

The re-run reproduces the committed fixture exactly — `deliveryCostIndex 100.0`, `get_activity 520,075`, `get_resource 527,683`, `get_technique 146,205`, `get_workflow 108,356`, 242 tool calls. No figure in the brief is disputed.

## What the remediation closed

Four of the prior report's Context Economy findings are now measurably shut, and this report does not re-price them.

| Prior finding | Evidence it is closed |
|---|---|
| CTX-01 — invariant worker bundle re-ships per activity | `worker_bundle_chars` across the 12 walked activities is **65,253**, against 12 × 35,204–40,069 ≈ 422,448 before. After activity 3 the bundle collapses to **543–620 characters**. `mayReferBack` at `src/tools/workflow-tools.ts:877` honours the `bundle:` ledger keys for any scope the server has already met, not only in persistent mode. |
| CTX-02 — group contracts re-attached per operation | `dedupTechniqueBlocks` now runs unconditionally, with `ledgerLookup` set to `referenceMode` rather than the whole pass (`workflow-tools.ts:1061-1063`). Measured over all 199 technique steps of the 20 activities: **303,406 of 1,087,656 characters, 27.9%**, collapse response-locally. |
| CTX-07 — resource ids qualified against the wrong workflow | `workflow-tools.ts:1072` qualifies against `techniqueWorkflowId`, returned by `composeActivityTechnique` at line 1017. |
| TOP-01 / TOP-05 — gated steps never bundled; batch reading taken early | 66 of 146 technique steps encountered bundle, 4 stay lazy on a gate reading false, 76 on a gate with no reading. The batch stand is taken from the post-delivery session at `workflow-tools.ts:1332` and re-read on `next_activity` at line 745. |

The batch bound and the eager-delivery budget are untouched. So is every path in `get_resource` and `get_technique`.

---

## Step 1 — Search for Opacity

Six boundaries still erase the datum that would let delivery cost less.

### O1. `referenceMode` was flattened for `get_activity` and left standing for the other two delivery tools

`get_activity` reads its ledger through `mayReferBack`:

```ts
// src/tools/workflow-tools.ts:877
const mayReferBack = bundle !== 'full' && (referenceMode || hasDispatch(state, scope));
```

`get_technique` and `get_resource` read theirs through the unmodified predicate:

```ts
// src/tools/resource-tools.ts:801, 940
const referenceMode = full !== true
  && (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';
```

`context_mode: "persistent"` is what the definitions forbid — `meta/techniques/workflow-engine/TECHNIQUE.md:22` and `dispatch-activity.md:93` both say so, and `create-session.md:46` and `start-session.md:56` instruct the orchestrator to omit it. So on every worker in the production topology those two branches are dead, and the benchmark records it: **`unchangedResourceAnswers: 0`, `unchangedTechniqueAnswers: 0`, against 77 `resource:*` ledger keys and 265 delivered-content keys.**

The erased datum is retention. The same session file holds the hash; the same scope holds the bytes; one conjunct refuses to look.

The sharpest part is that the definitions already claim the collapsed behaviour. `dispatch-activity.md:93` states that a worker context "collapses what it already received, whether it is resumed on the activity it holds or advanced to the next activity of its batch." That contract now holds for the activity bundle and for nothing else: 12 of the walk's 242 calls and 39.9% of its characters. The 186 calls to `get_technique` and `get_resource`, carrying **673,888 characters — 51.7% of the run** — sit outside it.

### O2. A section's ledger key can never resolve against its own file

`resource:<resource_id>` is keyed on the exact caller id, anchor included (`resource-tools.ts:938`). `review-mode` and `review-mode#review-comment-template` are two keys. The second is 14,342 characters of the first's 21,239. Nothing relates them.

The only containment logic in the server is `coveredByItsFile` at `workflow-tools.ts:1106`, and it is three ways short: it lives inside the `if (referenceMode)` eager-resource branch that never runs, it compares ids by string prefix within one response, and it never consults the ledger. A `get_resource` arriving after a whole file was delivered to the same scope cannot see the file.

Measured on the walk: **73,290 characters over 59 round trips are section bodies whose containing whole file also reached the same scope.** Twelve distinct sections across eight files, largest `review-mode#review-comment-template` at 14,342.

### O3. The eager resource map ships only in reference mode, and full mode loads the bodies anyway

`workflow-tools.ts:1094` gates the whole sibling `resources` map on `referenceMode`. Every activity in the walk logs `bundled_resources: 0`. Full mode pushes ids into `resource_refs` (line 1166) — and then, at lines 1170-1181, loads every one of those resources a second time purely to emit an unresolvable-ref warning, discarding the body it just read and hashed.

`DEFAULT_MAX_EAGER_RESOURCE_CHARS = 80,000` in `src/utils/resource-delivery.ts:6` guards a comparison inside the dead branch. The largest resource in either tree is `review-mode.md` at 21,574 bytes, 21,239 on the wire — **3.8× under a cap in a branch that does not execute.** The brief locates the eager budget and per-activity caps in `delivery.ts` and `resource-delivery.ts`; `delivery.ts` holds no budget at all, and the live budget arithmetic is at `workflow-tools.ts:957`.

### O4. The budget and the per-technique cap assert bounds no corpus can reach

`eagerBudgetChars = context_tokens × 0.8 × 4` — 640,000 at a 200,000-token window. The largest `spent_chars` in the walk is **91,516** on `start-work-package`: **14.3% of budget, 7.0× slack**. Twelve of twelve activities sit under a fifth of it.

`bundleTechniques` appears **zero times** across the 20 activity documents and both `workflow.yaml` files. So `optedOut` (line 951) is never true and `perTechniqueCap` (line 952) is always `Infinity`. The schema field at `src/schema/activity.schema.ts:287` carries a 340-character description for a construct neither tree uses, and `src/schema/state.schema.ts:24` documents an event shape conditioned on it.

`context_tokens` is a required parameter of `get_activity` feeding three comparisons — the stop-and-break at line 1054, the resource overflow at line 1148, and the `budgetChars` limb of `src/utils/batch.ts:137` — of which only the third ever fires, and it fires on a different arithmetic.

### O5. Every tool call re-reads and re-parses a corpus pinned for the life of the session

There is no cache anywhere in `src/loaders/`. `resolveTechniques` builds a `touchedSkills` map per call (`technique-loader.ts:267`); `buildProducerIndex` builds an `ownOutputsCache` per call (`binding-provenance.ts:127`); `readResourceStructured` reads and re-parses from disk every time. Both are correct per call and neither survives it.

One walk, counted from the log stream:

| Work | Events | Distinct | Amplification |
|---|---|---|---|
| `Workflow loaded` | **216** | 2 | 108× |
| `Technique loaded` (all four resolution paths) | **5,602** | **136** | 41.2× |
| `Resource loaded (raw)` | **257** | **30** | 8.6× |
| `buildProducerIndex` | 36 (one per `get_activity` and `get_technique`) | 1 | 36× |

`loadWorkflow('work-package')` parses `workflow.yaml` (28,289 bytes) plus 15 activity files (98,593 bytes) — **126,882 bytes of YAML per load, 27.4 MB per walk**. `buildProducerIndex` reads **146** uncomposed technique files to answer a question that does not vary with the activity being delivered. `analyse-challenge::run-loop` is loaded 257 times; `pr-description.md` is read 54 times and `review-mode.md` 37, to serve 12 and 12 deliveries.

Warm-cache timings, same process, after warm-up:

```
loadWorkflow(work-package)                  30.00 ms/iter
loadWorkflowWithDiagnostics(work-package)   26.80 ms/iter
buildProducerIndex(work-package)            21.43 ms/iter   (146 technique files)
resolveTechniques(core worker set)           4.15 ms/iter
composeActivityTechnique(write-artifact)     1.10 ms/iter
readResourceStructured(review-mode)          0.12 ms/iter
loadWorkflow(meta)                           4.82 ms/iter
buildProducerIndex(meta)                     2.08 ms/iter   (23 technique files)
```

Against the walk's own audit-log durations:

```
get_resource        n=162  total=5,056 ms  mean=31.2 ms
get_technique       n= 24  total=1,399 ms  mean=58.3 ms
get_activity        n= 12  total=1,052 ms  mean=87.7 ms
next_activity       n= 12  total=  408 ms  mean=34.0 ms
resume_checkpoint   n= 10  total=   36 ms  mean= 3.6 ms
                    ---------------------------------
                    242 calls, 8,828 ms total
```

`resume_checkpoint` is the control: it is the one delivery-adjacent call that loads no workflow, and it costs 3.6 ms. Every other call carries a 27–30 ms floor that is entirely YAML parse and schema validation.

The extreme case is `get_resource`. `resource-tools.ts:899` calls `loadWorkflow` solely to compute a `validateWorkflowVersion` field. Reading the resource costs **0.12 ms of the call's 31.2 ms — 0.4%.** The other 99.6% re-parses a workflow definition the response does not contain.

### O6. The residual block repetition is concentrated in the tree no benchmark walks

`projectTechnique` (`technique-loader.ts:33`) still inlines the merged `rules` record into every technique; `formatTechniqueBundle` (line 652) still hoists it. The response-local pass now collapses whichever merged records happen to be byte-identical, and that captured most of the rules win. What survives is the set-versus-blob problem the prior report named as CTX-03: a merged record is `group ∪ own`, so two operations of one group are near-identical and never equal.

Driving the real `projectTechnique` and `contentHash` over all 199 technique steps of the 20 activities, and taking the better of whole-block and per-entry collapse for each block:

| strategy | delivered chars | saved | % |
|---|---|---|---|
| every projected technique in full | 1,087,656 | 0 | 0.0% |
| **whole-block response-local (today)** | **784,250** | **303,406** | **27.9%** |
| per-block best of whole and per-entry | 681,493 | 406,163 | 37.3% |

**102,757 characters remain addressable, 13.1% of what the `step_techniques` path delivers today** — and **78,009 of them, 75.9%, are in meta's five activities**, which carry 23 technique steps against work-package's 176.

| activity | today | per-block best | saving |
|---|---|---|---|
| `meta/dispatch-client-workflow` | 79,830 | 39,933 | **39,897 (50.0%)** |
| `meta/discover-session` | 38,168 | 23,657 | 14,511 (38.0%) |
| `meta/end-workflow` | 40,007 | 16,406 | 23,601 (59.0%) |
| all 15 work-package activities | 493,605 → 475,189 on the 12 walked | — | 24,748 across all 15 |

`meta/discover-session`'s rules blocks are 60,726 of its 76,016-character raw projection — **79.9% rules**. And `scripts/run-token-benchmark.ts:384` defaults `--workflow` to `work-package`, with its own docstring recording that "the robot policy is work-package-shaped, so another workflow needs a policy that can drive it." **The delivery-cost gate has no reading on 5 of the 20 activities in scope, and those five hold three quarters of the remaining block repetition.**

---

## Step 2 — Trace the Blind Workarounds

### W1. Blocked: answer a refetch with a 254-character marker. Instead: re-ship the body.

A `get_resource` unchanged answer is `session_index` plus a four-field stub — **254 characters**, measured through `stringifyForResponse`. The walk issues 146 successful resource fetches against 77 distinct keys, so **69 of them are second-or-later deliveries of a payload whose hash is already in `deliveredContent[scope]`**, and every one of them ships in full.

| resource | wire chars | deliveries | total | repeat |
|---|---|---|---|---|
| `review-mode` | 21,239 | 12 | **254,868** | 233,629 |
| `pr-description` | 6,475 | 12 | 77,700 | 71,225 |
| `pr-description#link-row-forms` | 1,348 | 13 | 17,524 | 16,176 |
| `pr-description#template-final` | 1,347 | 13 | 17,511 | 16,164 |
| `pr-description#template-initial` | 970 | 13 | 12,610 | 11,640 |
| `review-mode#review-type-selection` | 363 | 12 | 4,356 | 3,993 |
| all 77 ids | — | 146 | **526,574** | **352,827** |

The union of distinct payloads is 173,747 characters. The walk spends **3.03× the union**. `review-mode` alone is **19.6% of the entire run's 1,302,319 characters.**

State the honesty caveat plainly: all 69 repeats come from the benchmark's `HOT_RESOURCES` probe (`run-token-benchmark.ts:160-168`), which re-fetches seven ids on every `get_activity` by design, while the harness's `seenResource` set suppresses every link-derived refetch. The benchmark therefore models an agent that never forgets a linked resource and always forgets the hot set. A real agent sits between the two. What is not modelled and not disputed is the mechanism: the ledger holds the key, the scope holds the bytes, and the collapse does not fire.

`get_technique` shows the same shape with no probe involved. The 24 lazy fetches resolve to 20 distinct techniques:

```
update-pr::render                7,661 × 4 = 30,644   (22,983 repeat)
manage-artifacts::write-artifact 12,031 × 2 = 24,062  (12,031 repeat)
18 others                        × 1 each
                                 ------------------
                                 24 calls, 145,653 chars, 35,014 repeat
```

Four round trips return a body the receiving context received minutes earlier under the same `agent_id`.

### W2. Blocked: recognise that a section is inside a file already sent. Instead: ship the section.

After W1's repeats are collapsed, twelve first-deliveries of contained sections survive — **25,317 characters over 12 round trips**:

```
review-mode#review-comment-template  14,342   inside review-mode      (21,239)
wp-plan#template                      2,158   inside wp-plan
pr-description#rules                  1,892   inside pr-description   (6,475)
pr-description#link-row-forms         1,348
pr-description#template-final         1,347
pr-description#template-initial         970
pr-description#lifecycle-tense          822
session-trace#template                  688
pr-description#mandated-sections…       572
deferred-items#template                 410
follow-ups#template                     405
review-mode#review-type-selection       363
```

`extractMarkdownSection` (`src/utils/resource-ref.ts:33-63`) is heading-depth aware and correct. The gap is one level up: nothing asks whether the file the anchor names is already in the ledger.

### W3. Blocked: refuse a third activity for the right reason. Instead: refuse it for the wrong one, one activity early.

`batchBound` (`batch.ts:129`) gives a worker declaring 200,000 tokens `budgetChars = 200,000 × 0.35 × 4 = 280,000` and `maxActivities = 3`. `deliveredChars` (`batch.ts:98`) counts the activity payload plus every lazy technique and unbundled resource fetch charged to that scope. Replaying the walk's delivery events in order:

| activity | cumulative chars at the `mayContinue` read | verdict |
|---|---|---|
| 1 `start-work-package` | 0 | continue |
| 2 `design-philosophy` | 198,747 | continue |
| 3 `codebase-comprehension` | **303,293** | **refused — `delivery_budget`** |

**A worker takes two activities, not three.** The `activity_cap` of 3 is never the binding limb in the fresh-mode topology, so `BATCH_MAX_ACTIVITIES` is inert config and `BATCH_HEADROOM_FRACTION` is the only live dial. This corrects the prior report's W5, which read the eager-only figure of 147,610 for three consecutive activities and concluded "`activity_cap` (3) is the only limb that ever binds". Counting what `deliveredChars` actually counts, the budget binds first and binds early. A 12-activity walk therefore needs **six** worker contexts, not four.

Re-run the same replay with W1's repeats collapsed to 254-character markers and the third activity fits:

| | cumulative to one scope | activities per worker | contexts for 12 activities |
|---|---|---|---|
| today | 1,192,302 | 2 | 6 |
| repeats collapsed | **826,404** | **3** | **4** |

One condition change removes **365,898 characters** from what one scope accumulates and **two whole worker context establishments** from the walk — and it does so by making the cap the binding limb, which is what the policy comment in `src/config.ts:158-165` says the cap is for.

### W4. Blocked: read the corpus once. Instead: parse 27.4 MB of YAML per walk.

Per walk, on a submodule pinned at one commit for the session's whole life:

| recomputation | count | unit cost | total |
|---|---|---|---|
| `loadWorkflow` / `…WithDiagnostics` | 216 | 30.00 / 26.80 ms | **≈ 6,480 ms** |
| `buildProducerIndex` | 36 | 21.43 ms | **771 ms** |
| duplicate `composeActivityTechnique` within one activity | 30 | 1.10 ms | 33 ms |
| | | measured tool time | **8,828 ms** |

**73% of the server's wall-clock across one walk is spent re-parsing definitions, and 82% counting the producer index.** The duplicate compositions are the small term but they name the pattern precisely: work-package's 176 technique steps bind 146 distinct techniques per activity, so 30 compositions per pass rebuild a payload the response-local dedup then collapses to a marker. The bytes are saved; the work is done twice.

### W5. Blocked: nothing. The budget cannot fire, and the cap has no users.

`eagerBudgetChars` is 640,000. The twelve activities spend 91,516 / 62,216 / 59,556 / 44,375 / 18,247 / 49,776 / 10,262 / 46,676 / 543 / 51,267 / 543 / 38,987. The stop-and-break at line 1054 requires a declared window below **28,600 tokens** to fire on the largest. Zero activities declare `bundleTechniques`, so the per-technique cap has been dead since it shipped, in both trees.

### W6. Blocked: fetch a resource that exists. Instead: 404 twelve times.

Sixteen of 162 `get_resource` calls — **9.9% of the largest call bucket** — return an error and deliver nothing:

```
×12  review-mode#consolidated-review-format
×1   writing-register
×1   debt-ledger#template
×1   debt-ledger#rules
×1   l12
```

`review-mode#consolidated-review-format` is a `HOT_RESOURCES` member at `run-token-benchmark.ts:166`, and `review-mode.md` has no heading that slugifies to it. The gate's own baseline carries twelve failed round trips per run, worth roughly 375 ms of the measured 5,056 ms `get_resource` total. The other four are ids the harness extracts and fetches unqualified — a harness artifact, not the server defect CTX-07 named, which line 1072 has closed.

### W7. Blocked: send the harness prose the run needs. Instead: send all four.

`get_workflow` is 108,356 characters in one call. The orchestrator bundle is **79,312 of them (73.2%)** — 41,861 of technique bodies and 34,654 of hoisted rules. Four harness variants ship together because nothing binds `{harness_kind}` server-side (`src/loaders/core-ops.ts:54-59`):

```
harness-compat::claude-code  1,060
harness-compat::cursor       1,055
harness-compat::generic      1,050
harness-compat::cline        1,048
                             -----
                             4,213, of which 3,153 are for harnesses this run is not
```

Its collapse is narrower than `get_activity`'s in two ways: gated on `state.contextMode === 'persistent'` alone (`workflow-tools.ts:447`), and scoped to `state.agentId` rather than the calling context (line 450).

---

## Step 3 — Name the Conservation Law

**The boundary that destroys most is still `referenceMode`, and it is now half-flattened.** `get_activity` was taught that a scope the server has already met is holding what it was sent; `get_technique` and `get_resource` were not. The two unflattened tools carry 186 of the walk's 242 calls and 673,888 of its 1,302,319 characters.

Flattening the remaining half exposes exactly what the flattened half already exposes, and the definitions already promise it. What it breaks is worth stating: `hasDispatch` reads a scope's *arrival*, not its *retention*. A context that was compacted, or an `agent_id` reused by a genuinely new context, receives a 254-character marker for 21,239 characters it does not hold — silently, since nothing distinguishes the two. `get_activity` has carried that exposure since the remediation; extending it to resources and techniques triples the surface. The escape already exists and both tools already accept it: `full: true`, plus the `force-full-after-summarization` rule the corpus already states.

| Boundary | Erased Data | Blocked Optimization | Blind Workaround | Concrete Cost | Flattening Breaks |
|---|---|---|---|---|---|
| `referenceMode` on `get_resource` / `get_technique` (`resource-tools.ts:801, 940`) versus `mayReferBack` on `get_activity` (`workflow-tools.ts:877`) | that this scope was sent these bytes and is holding them | ledger collapse to a 254-char marker | re-ship 69 resource bodies and 4 technique compositions in full | **369,297 chars**, 28.4% of the run; and one worker's cumulative from 1,192,302 to 826,404, taking a 12-activity walk from 6 contexts to 4 | a compacted or reused `agent_id` gets a marker for bytes it lost; escaped by `full: true` |
| `resource:<id>#<section>` keyed independently of `resource:<id>` (`resource-tools.ts:938`) | that a section is a substring of a file already delivered | containment-aware ledger lookup | ship 14,342 chars of `review-mode` a second time under a different key | 73,290 chars over 59 round trips gross; **25,317 over 12** after the repeat collapse | the ledger must record extents, not just hashes; a file edited between the two fetches makes the section stale |
| whole-block ledger keys for `rules` and `inherited_*.items` (`delivery.ts:98, 173`) | that a merged rules record and an inherited-items list are *sets* | per-entry collapse | re-ship a whole block to carry the entries that differ | **102,757 chars corpus-wide, 13.1%** of the `step_techniques` path — **78,009 of it in meta's five activities** | `deliveredContent` grows from 265 keys to low thousands inside the sealed session file |
| no memo between `loadWorkflow` calls (`src/loaders/*`, no cache anywhere) | that the corpus is a submodule pinned for the session | read once per revision | 216 workflow loads, 5,602 technique loads for 136 files, 257 resource reads for 30 | **≈ 6,480 ms of 8,828 ms measured tool time**; 27.4 MB of YAML re-parsed per walk | an authoring session editing the corpus under a live server needs an mtime or revision key, and the guards' walk-the-corpus scripts must bypass it |
| `if (referenceMode)` around the eager resource map (`workflow-tools.ts:1094`) | that the bundle already knows every resource the bundled steps link | one delivery instead of a manifest plus N fetches | ids under `resource_refs`, then load every body again at line 1172 for a warning and discard it | 78 round trips at ~31 ms; 30 distinct files read 257 times | bundling bodies a worker will not read regresses `get_activity` (measured at +24.5% under #322); the win is round trips, not bytes |
| `context_tokens` → `eagerBudgetChars` (`workflow-tools.ts:957`) and `bundleTechniques` (`activity.schema.ts:287`) | nothing — they assert bounds no corpus reaches | deleting ~80 LOC, one schema construct and three comparisons | three unreachable branches and a 340-char schema description maintained and tested | 0 chars, ever. 91,516 peak against 640,000; **0 of 20** activities declare `bundleTechniques` | a genuinely small-window client loses its only per-activity protection; `batch.ts`'s `budgetChars` limb must stay, since it is the one that binds |

---

## Opportunities, with saving and the measurement that confirms each

Ordered by characters saved per unit of build. The delivery gate's resolution floor is **1% of 1,302,319 = 13,023 characters**; each entry states where it sits against that.

**OPT-1 — Give `get_resource` and `get_technique` the predicate `get_activity` already has.** Replace `referenceMode` at `resource-tools.ts:805` and `:942` with the `mayReferBack` form: `full !== true && (referenceMode || hasDispatch(state, scope))`. The ledger write, the marker shape, the `full: true` override and the `resource_fetched` / `technique_fetched` events all stay.
*Saves:* **369,297 characters, 28.4% of the run** — 335,301 on `get_resource` (352,827 repeat less 69 × 254 markers) and 33,974 on `get_technique`. It also takes one scope's cumulative from 1,192,302 to 826,404, so a worker takes 3 activities instead of 2 and a 12-activity walk needs 4 contexts instead of 6 — roughly 174 seconds of spawn wall-clock at the report's measured 87-second mean.
*Costs:* two lines. Plus one decision that is not a line: `hasDispatch` proves arrival, not retention, so state the exposure in `docs/resource_resolution_model.md` beside the identical claim already made for `get_activity`.
*Confirmed by:* `unchangedResourceAnswers` 0 → 69 and `unchangedTechniqueAnswers` 0 → 4 in `bench:token`, both already gated as `better: 'higher'` (`run-token-benchmark.ts:269-278`); `getResourceChars` 527,683 → ≈ 174,000. **28× the gate floor.**

**OPT-2 — Memoise the corpus on its revision.** One module-level map keyed on `(workflowDir, workflowId, corpusRev)` in front of `loadWorkflow`, `readTechnique` and `readResourceStructured`, invalidated on the submodule HEAD or on mtime. `buildProducerIndex`'s result keys on the same tuple.
*Saves:* **≈ 6,480 ms of the 8,828 ms** a walk spends in tool handlers, plus 771 ms of producer-index rebuild. 216 workflow loads → 2; 5,602 technique loads → 136; 257 resource reads → 30; 27.4 MB of YAML parse → 127 KB. Per-call means fall to roughly the `resume_checkpoint` floor of 3.6 ms.
*Costs:* about 60 lines and one invalidation decision. The guards and `scripts/validate-*.ts` walk the corpus deliberately and must bypass it. This is the one entry that saves no characters at all.
*Confirmed by:* the audit log already carries `duration_ms` per call. Sum it per walk and add the total to the benchmark's metrics object beside `chars` — the instrument is one field short of existing.

**OPT-3 — Per-entry ledger keys for `rules` and `inherited_*.items`, taking the better of whole-block and per-entry per block.** Extend `stageField` (`delivery.ts:109`) to hash each rule entry and each inherited item, mirroring the `note`/`items` split already at line 159, and keep the whole-block key as the cheaper alternative rather than replacing it.
*Saves:* **102,757 characters corpus-wide, 13.1%** of what the `step_techniques` path delivers today — **78,009 of it in meta**, where `dispatch-client-workflow` alone drops 39,897 (50.0%) and `end-workflow` 23,601 (59.0%). On the 12 walked work-package activities the figure across all their technique steps is 18,416.
*Costs:* `deliveredContent` grows from 265 keys to low thousands inside the sealed session file — measure seal and serialise cost first, and prefer a per-scope hash *set* to a key-per-entry map. Note that whole-block collapse already beats naive per-entry on five of 20 activities, so the implementation must take the minimum, not switch.
*Confirmed by:* `getActivityChars` on a work-package walk (1.4× the floor), and on a meta walk — which needs OPT-4 first.

**OPT-4 — Give the benchmark a meta arm.** `run-token-benchmark.ts` already takes `--workflow`; what it lacks is a policy the robot walker can drive meta with (`tests/e2e/policies.ts`). Record a second fixture and gate both.
*Saves:* no characters. It ends the state where **5 of the 20 activities in scope, holding 75.9% of the remaining block repetition, are invisible to the only instrument that prices delivery.**
*Costs:* one policy and one fixture. Cross-workflow comparison is already refused by `workflowMatched` (`run-token-benchmark.ts:207`), so a second fixture is the supported shape.
*Confirmed by:* the gate producing a non-zero `deliveryCostIndex` for `--workflow=meta`.

**OPT-5 — Resolve a section against its own file in the ledger.** On a `get_resource` for `<file>#<section>`, check `resource:<file>` first; if that hash is held by the scope, answer with a marker naming the file and the anchor.
*Saves:* 73,290 characters over 59 round trips before OPT-1; **25,317 over 12 round trips after it**. Largest single win 14,342 on `review-mode#review-comment-template`. The same rule lets `coveredByItsFile` consult the ledger rather than the current response.
*Costs:* about 40 lines, plus a marker variant that says "inside a file you hold" rather than "byte-identical". The section is not byte-identical to the file, so this is a genuinely new marker shape and needs its own note.
*Confirmed by:* `resource_fetched` count and `getResourceChars`. **1.9× the floor after OPT-1.**

**OPT-6 — Bundle resource bodies in full mode, behind a coverage rule.** Move the `resources` map out from under `if (referenceMode)` (line 1094) and drop the duplicate resolvability loop at lines 1170-1181, which loads and discards every body a second time.
*Saves:* up to **78 round trips** at a measured 31.2 ms each — roughly 2.4 seconds of server time and 78 agent turn boundaries.
*Costs:* the honest one. Full-mode resource bundling was measured at +24.5% on `get_activity` under #322, because a body bundled is a body paid for whether or not the worker reads it. Take this only with OPT-1 landed, so a second activity linking the same resource collapses, and gate it on a coverage rule rather than shipping every id.
*Confirmed by:* `getResourceCalls` 162 → ≈ 84 against `getActivityChars`. Watch both; this is the one entry that can regress the metric it is meant to improve.

**OPT-7 — Retire the eager budget and the per-activity cap; keep the batch budget.** Delete `eagerBudgetChars`, the stop-and-break at line 1054, the resource overflow at line 1148, `bundleTechniques` from `activity.schema.ts:287`, `optedOut`, `perTechniqueCap`, and `DEFAULT_MAX_EAGER_RESOURCE_CHARS`. Make `context_tokens` optional on `get_activity`; `batch.ts` still needs it.
*Saves:* zero characters, ever. It removes roughly 80 lines of `workflow-tools.ts`, one schema construct with **0 users in 20 activities**, one constant that is 3.8× the largest resource in either tree, and two response fields reporting a bound with 7.0× slack.
*Costs:* a small-window client loses its per-activity protection. Gate the deletion on a floor, or accept that `batch.ts`'s `budgetChars` — which does bind, at activity 3 — is the real protection.
*Confirmed by:* `deliveryChars` not moving. This is the entry that must *not* register.

**OPT-8 — Fix the benchmark's dead hot-resource id and widen `mayReferBack`'s reach on `get_workflow`.** `review-mode#consolidated-review-format` names no heading in `review-mode.md`; either add the heading or replace the id. Separately, `get_workflow`'s collapse (line 447) reads `state.contextMode` and `state.agentId` rather than the caller's scope.
*Saves:* 12 failed round trips per walk, ≈ 375 ms. On `get_workflow`, 3,153 characters of unused harness prose is a definition-side edit worth naming but **below the gate floor at 0.24%** — do not gate it.
*Costs:* one line in the fixture, two in the handler.
*Confirmed by:* `get_resource` call count 162 → 150 with `resource_fetched` unchanged at 146.

### What the portfolio adds up to

| lever | chars | round trips | server ms |
|---|---|---|---|
| OPT-1 collapse repeat resource deliveries | 335,301 | 69 shrink to 254 chars | — |
| OPT-1 collapse repeat technique deliveries | 33,974 | 4 shrink | — |
| OPT-5 sections inside a delivered file | 22,269 | 12 shrink | — |
| OPT-3 per-entry blocks, realised on the walked activities | ≤ 18,416 | — | — |
| OPT-8 harness variants and the dead probe id | 3,153 | 12 removed | 375 |
| OPT-6 resource bundling | ≈ 0 (net) | 78 removed | 2,400 |
| OPT-2 corpus memo | 0 | 0 | **6,480** |
| **total** | **≈ 413,113 (31.7%)** | **90 removed, 85 collapsed** | **≈ 7,330** |

The server-time column does not sum: OPT-6's 2,400 ms of removed round trips is inside OPT-2's 6,480 ms of workflow re-parse, so the two overlap rather than add. Taking both, measured tool time falls from 8,828 ms to roughly 1,500 ms.

One walk falls from **1,302,319 to ≈ 889,000 characters** — a further 31.7% on top of the 26.8% the remediation already took, and 34.4% below the July reference of 1,355,532. Server time falls from 8,828 ms to roughly 1,500 ms. Worker contexts for a 12-activity walk fall from six to four.

Three observations order the work. First, **OPT-1 is two lines and 28× the gate's resolution floor**; nothing else in this dimension is within an order of magnitude of that ratio, and it is the only entry that shortens both the byte bill and the context bill. Second, **the block-dedup lever is largely spent** — the remediation's unconditional response-local pass took 303,406 of the 406,163 available, and the 102,757 that remain are three quarters inside the tree the gate never walks, so OPT-4 precedes OPT-3. Third, **the largest cost in this system is no longer bytes.** After OPT-1, 73% of the server's per-walk wall clock is re-parsing a git submodule that has not changed since the session opened, and no instrument in the repository reports it: four benchmarks and a usage recorder all price delivery, and the one number that would price recomputation — `duration_ms`, already in every audit-log line — is never summed.
