---
Lens: 20 optimize ("What code COSTS")
Dimension: Context Economy
Target: workflow-server — workflows/meta/** and workflows/work-package/**, with src/utils/delivery.ts, src/utils/resource-delivery.ts, src/tools/, src/loaders/ and scripts/ as the implementation surface
Evaluation Date: 2026-08-17
---

# Portfolio Optimize — Context Economy of Definition Delivery

Lens 20 `optimize` asks what code costs. Applied to a definition server, the currency is characters on the wire into an agent context, and the "erased performance data" is the fact of a payload having already arrived. Every measurement below was produced by driving the server's own composition path — `composeActivityTechnique`, `projectTechnique`, `dedupTechniqueBlocks`, `loadResourceDelivery`, `formatTechniqueBundle`, `resolveTechniques` — over all 20 activities of the two workflows. Nothing is estimated from file sizes except where a raw size is deliberately contrasted with a wire size.

**The single correction that reframes the brief.** The brief prices bodies by file size: `dispatch-activity.md` 10.0 KB, `workflow-engine/TECHNIQUE.md` 8.3 KB, `review-summary.md` 9.6 KB. File size *understates* wire cost, because composition re-attaches the group's `Rules` section to every operation in the group:

| technique | raw file | composed wire | ratio | of which `rules` |
|---|---|---|---|---|
| `manage-artifacts::write-artifact` | 2,587 | **10,956** | 4.24× | 7,189 (66%) |
| `workflow-engine::activity-worker` | 5,845 | **14,895** | 2.55× | 10,860 (73%) |
| `workflow-engine::dispatch-activity` | 10,044 | **18,753** | 1.87× | 13,213 (70%) |
| `review-assumptions::reconcile` | 9,347 | **11,706** | 1.25× | 4,405 (38%) |
| `review-diff` | 6,665 | **8,204** | 1.23× | 636 (8%) |
| `review-summary` | 9,619 | **10,996** | 1.14× | 627 (6%) |

`workflow-engine/TECHNIQUE.md` is not a file a step reads. It is 8,286 bytes that becomes a 5,014–13,213-char `rules` block inside *every other file in its folder*. The brief's 8.3 KB is not one delivery; it is the multiplier on nine.

---

## Step 1 — Search for Opacity

Six boundaries erase the one datum that would let delivery cost less: **whether this exact payload is already in the receiving context.**

### O1. `projectTechnique` versus `formatTechniqueBundle` — two projections of one technique, one of which hoists

`src/loaders/technique-loader.ts:624` (`formatTechniqueBundle`) walks resolved techniques and *hoists* every rule into a flat sibling `rules` array — one entry per distinct rule, keyed `[name, line]`. `src/loaders/technique-loader.ts:33` (`projectTechnique`), which serves the `step_techniques` map in `get_activity` and the whole of `get_technique`, *inlines* the merged rules record into each technique record.

The same technique therefore has two prices depending on which door it comes through:

- `workflow-engine::dispatch-activity` in the `get_workflow` orchestrator bundle: **5,612 chars** (rules hoisted out).
- `workflow-engine::dispatch-activity` through `projectTechnique`: **18,753 chars** (rules inlined).

A **3.34× spread on byte-identical content**, decided by which of two functions in the same file built the response. The erased datum is that the rules of a group are a property of the group, not of the operation — `formatTechniqueBundle` knows this and `projectTechnique` does not.

### O2. `referenceMode` is a session-scoped flag gating a response-local fact

`src/tools/workflow-tools.ts:847`:

```
const referenceMode = (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';
```

Everything downstream — the per-technique ledger check at line 985, `dedupTechniqueBlocks` at line 1006, the whole eager `resources` map at line 1036 — is behind that one boolean. And `dedupTechniqueBlocks` handles two genuinely different cases with one switch:

1. *Cross-context*: has some earlier call to this `agent_id` delivered these bytes? Needs the ledger; needs the agent-scoping argument `src/utils/delivery.ts:60` makes correctly.
2. *Response-local*: has **this response, already assembled above**, delivered these bytes? Needs nothing. The full copy is fifty lines up in the same payload. It is safe in every mode, for every agent, unconditionally.

Case 2 is switched off with case 1. The erased datum is the distinction itself.

### O3. The eager-delivery budget measures a term it does not include

`src/tools/workflow-tools.ts:926` derives `eagerBudgetChars = context_tokens × 0.8 × 4`, and `spentChars` (line 936) accumulates only `step_techniques` bodies and eager `resources`. It does not include the worker technique bundle assembled at lines 859–889 from `CORE_WORKER_TECHNIQUES` + `techniques.activity`, which is:

- **meta: 28,423 chars** (4 techniques + a 15,676-char rules array)
- **work-package: 35,204 chars** (5 techniques + an 18,965-char rules array)

shipped on **every** `get_activity`, byte-identical across all 15 work-package activities save the six that add one entry of their own. The cost line at line 1282 reports `spent_chars` against `eager_budget_chars` while omitting the largest invariant term in the response — on a typical work-package activity, an understatement of roughly 2×.

### O4. `agent_id` scoping erases intra-batch identity for the *first* activity, correctly, and then keeps erasing it

`src/utils/delivery.ts:44-59` documents the scoping decision precisely and the decision is right: a marker is unreadable to a context that never received the bytes. But the definitions then close the only other door. `workflows/meta/techniques/workflow-engine/TECHNIQUE.md:22` and `dispatch-activity.md:93` both instruct: *"Do not set `context_mode: "persistent"` on worker-dispatched sessions"*, and `create-session.md:46` / `start-session.md:56` say *"Omit `context_mode` (or pass `"fresh"`)"*. So in the production topology `referenceMode` is false for the first `get_activity` of every worker, which is the only `get_activity` a 1-activity batch ever makes.

The frozen benchmark confirms the consequence. `scripts/fixtures/token-benchmark-a0-reference.json`, a 12-activity work-package walk in `fresh` mode:

```
resourceLedgerKeys: 0    unchangedResourceAnswers: 0    unchangedTechniqueAnswers: 0
chars: get_activity 687,936  get_resource 448,084  get_technique 160,057  get_workflow 59,455
```

**1,355,532 chars — roughly 339,000 tokens — of definition delivery for one walk, with the collapse machinery having fired zero times.**

### O5. `extractResourceIds` slices at `resources/` and discards the workflow segment; `qualifyResourceId` is then handed the wrong workflow

`src/utils/resource-ref.ts:82-87` takes `href.lastIndexOf('resources/')` and keeps the tail. `src/loaders/markdown-technique-loader.ts:226` rewrites `[x](../../ponytail/resources/y.md#z)` → `ponytail/y#z` (workflow segment present) but `[x](../resources/y.md)` → `y` (bare, correct only within the authoring workflow). `src/tools/workflow-tools.ts:1014` then calls `qualifyResourceId(rawId, sourceWorkflowId, workflow_id)` where `sourceWorkflowId` is the workflow the **activity** was authored in — never the workflow the **technique** was authored in.

A technique borrowed across workflows therefore mis-qualifies its own same-workflow resource links. Reproduced against the server's own loaders:

| link site | rewritten id | resolved against | outcome |
|---|---|---|---|
| `meta/techniques/verify-artifact-conforms.md:53` → borrowed by `work-package/strategic-review` | `writing-register` | `work-package/resources/` | unresolved; 2,155-char body never ships |
| `ponytail/techniques/harvest-debt.md:36` → bound by `work-package/lean-coding-audit` | `debt-ledger#template`, `debt-ledger#rules` | `work-package/resources/` | unresolved; 3,476-char file never ships |

Three bundling warnings on every `get_activity` for those two activities, and the erased datum is that the resource exists at all — the step executes with no template.

### O6. Conditional relevance lives in prose, where the delivery layer cannot read it

`work-package/techniques/implement-task.md:50` — *"For Rust projects, follow TDD best practices from [tdd-concepts-rust]"*. `review-test-suite.md:71` — same shape. The condition is a sentence; the link is a link. `extractResourceIds` sees only the link, so **13,533 chars of Rust TDD material eager-bundles into `implement` and again into `post-impl-review` on every work package in any language**. Add the four `rust-substrate-code-review` sections (7,502 chars) that `review-code.md` and `review-diff.md` use as the *generic* code-review report template, and a non-Rust walk carries **34,568 chars** it cannot use.

---

## Step 2 — Trace the Blind Workarounds

### W1. Blocked: hoist the group rules once. Instead: re-ship them per operation, in the same response.

Measured per-rule-entry, over every ungated technique step of every activity:

| activity | eager techniques | rules chars re-shipped in one response | inherited-block chars re-shipped |
|---|---|---|---|
| `meta/discover-session` | 6 | **32,088** | 3,905 |
| `meta/end-workflow` | 3 | **16,044** | 1,562 |
| `work-package/codebase-comprehension` | 6 | **15,636** | 8,439 |
| `work-package/strategic-review` | 8 | 3,786 | 10,473 |
| `work-package/start-work-package` | 11 | 1,436 | **14,002** |
| `work-package/implement` | 9 | 648 | 11,684 |
| … all 20 activities | 96 | **76,359** | **114,923** |

The three worst individual repeats are all in `workflow-engine/TECHNIQUE.md`, delivered five times inside one `get_activity` for `meta/discover-session`: `run-status-shape` (6,568 redundant chars), `agent-id-scopes-delivery` (4,372), `resource-section-or-whole` (4,220).

Concrete cost, `meta/discover-session`: **55,983 chars of step techniques of which 35,993 (64%) is a second-through-sixth copy of content already in the same response.** Round trips saved by the duplication: zero. It is not a cache; the reader had it on the previous page.

### W2. Blocked: reference the same technique twice. Instead: compose and ship it three times.

`work-package/codebase-comprehension` binds `manage-artifacts::write-artifact` to three ungated steps (`create-comprehension-artifact`, `record-log-initial`, `update-artifact-initial`). In full mode line 985's `alreadyDelivered` is `false` by construction, so the 10,956-char composition ships three times: **21,912 redundant chars in one response**, plus three redundant passes through `composeActivityTechnique` and `decorateTechniqueProvenance`.

### W3. Blocked: collapse to a marker. Instead: `resource_refs` and a fetch per section.

In full mode line 1108 ships **ids only**; the worker must call `get_resource` for each. Measured against the A0 path:

| | chars |
|---|---|
| sum of every activity's resource manifest (what a reference-mode bundle would carry) | 159,463 |
| union of distinct resource ids on the path (65 ids) | 113,527 |
| cross-activity repeat tax inside the manifests | **45,936 (28.8%)** |
| what the A0 walk actually spent on `get_resource`, 128 calls | **448,084 (3.95× the union)** |

The worst repeats: `tdd-concepts-rust` 13,533 × 2 = 13,533 redundant; `assumptions-review#assumptions-log-template` 2,654 × 4 = 7,962; `design-framework#design-philosophy-artifact-template` 2,039 × 3 = 4,078; `assumptions-review#classification-vocabulary` 1,159 × 4 = 3,477; `assumptions-review#probe-vocabulary` 1,038 × 4 = 3,114; `deferred-items#template` 316 × 5 = 1,264.

And the section/whole split defeats itself in one place the bundler cannot reach. `work-package/codebase-comprehension` links **five** sections of `codebase-comprehension.md` — `#comprehension-techniques` (8,543), `#corpus-artifact-template` (4,443), `#rules` (1,822), `#comprehension-log-template` (1,243), `#promotion` (937) — totalling 16,988 of the file's 18,182 wire chars, **93% of the file delivered as five separately-ledgered payloads**. The `coveredByItsFile` precedence at line 1048 exists exactly for this and never fires, because no technique links the bare id. This is the case `resource-section-or-whole` tells the agent to avoid, in a delivery the agent does not control.

### W4. Blocked: send the invariant worker bundle once per context. Instead: once per activity.

35,204 chars × 15 work-package activities = **528,060 chars**, of which 492,856 is repetition. On the 12-activity A0 path: 422,448 chars, **387,244 of it repeat** — which is 56% of the fixture's entire 687,936-char `get_activity` spend. Under the realistic dispatch topology (`DEFAULT_BATCH_MAX_ACTIVITIES = 3`, four workers), the addressable share is 4 × 2 × 35,204 = **281,632 chars**.

### W5. Blocked: nothing. The budget that would block it cannot fire.

`eagerBudgetChars` for a worker declaring 200,000 context tokens is **640,000 chars**. The largest eager bundle in either tree is `work-package/codebase-comprehension` at **77,161 chars — 12.1% of budget**. For a 1M-token worker, 2.4%. **Zero of 20 activities exceed the budget at any declared window a current model reports.**

- The stop-and-break at line 998 requires a declared window below **24,113 tokens** to fire on the largest activity.
- The `delivery_budget` refusal in `src/utils/batch.ts:182` requires below **46,128 tokens**, since the three largest consecutive A0 activities deliver 147,610 chars against a 640,000 budget — 4.3× slack. `activity_cap` (3) is the only limb that ever binds.
- `resourceRefIds.push(...orderedIds.slice(i)…)` at line 1091 is the budget-overflow path for resources. Unreachable for the same reason.

`context_tokens` is a **required** parameter of `get_activity` feeding a comparison that has never been true, and roughly 80 lines of `workflow-tools.ts` plus the `budgetChars` limb of `batch.ts` exist to enforce it.

### W6. Blocked: read the tool schema you already hold. Instead: restate it in every technique body.

Of `workflow-engine/TECHNIQUE.md`'s 8,286 bytes, **5,014 (60.5%)** is prose about how to call the server, not about the workflow engine's domain:

| rule | chars | already stated in |
|---|---|---|
| `agent-id-scopes-delivery` | 1,090 | the `agent_id` `.describe()` on `get_resource` / `get_technique` / `get_activity` |
| `resource-section-or-whole` | 1,054 | `resource_id` describe + `resources_note` (line 1132) |
| `fetch-costs-what-it-delivers` | 749 | `resources_note`, `bundle_note` (line 1146) |
| `resource-loading-via-tool` | 741 | `resources_note` (line 1132–1133) |
| `progressive-step-technique-load` | 591 | `step_techniques_note` (line 1127) |
| `force-full-after-summarization` | 341 | the `full` / `bundle` describes on all three tools |
| `session-index-passes-on-each-call` | 336 | `session_index` describe: *"pass on every authenticated call"* |
| `validation-warnings` | 112 | the `validation` field of every `_meta` |

The MCP tool schema is delivered once per session by the client and stays resident. This block is paid again, per composed technique, per activity. Add `dispatch-topology` (542) and it is 5,556 chars — **67% of the group file**.

The same pattern one level up: `src/loaders/core-ops.ts:54-56` explains that all four harness files ship *"because nothing binds `{harness_kind}` server-side"*. `claude-code` 1,113 + `cursor` 1,103 + `generic` 1,099 + `cline` 1,095 = 4,410 chars per `get_workflow`, of which **3,297 is always wrong**.

### W7. What the three collapse strategies actually cost, simulated

Driving the server's real `dedupTechniqueBlocks` and `contentHash` over all 96 eager technique deliveries, against a hypothetical response-local per-entry ledger:

| strategy | delivered chars | saved | % |
|---|---|---|---|
| full mode (today's default, and what a fresh worker gets) | 528,405 | 0 | 0.0% |
| reference mode as implemented (`dedupTechniqueBlocks`, whole-block keys) | 420,273 | 108,132 | 20.5% |
| **response-local per-entry dedup, unconditional** | **349,057** | **179,348** | **33.9%** |

Reference mode leaves 71,216 chars (~17,800 tokens) on the table **even when it runs**, because its keys are whole-block: `technique:rules:<hash>` collapses only when a technique's *entire merged* rules record is byte-identical to one already sent. Since each operation's record is `group rules ∪ own rules`, it never is. Same for `inherited_inputs.items`: `src/loaders/technique-loader.ts:544` filters the inherited set per technique by `ownInputIds`, so the items list differs by exactly the entries the technique declares itself — and the whole list re-ships to carry the difference. Only `inherited_inputs.note` (`INHERITED_SCOPE_NOTE`, 141 chars, split out at line 157) collapses reliably. The split at `INHERITED_SPLIT_BLOCKS` was the right instinct applied one level too shallow.

---

## Step 3 — Name the Conservation Law

**The boundary that destroys most is `referenceMode`** — one session-scoped boolean at `src/tools/workflow-tools.ts:847` standing in for two independent questions. Flattening it exposes the response-local answer (safe unconditionally: the full copy is in the same payload) without touching the cross-context answer (which genuinely needs the agent-scoped ledger `src/utils/delivery.ts:60` builds correctly).

What flattening breaks: a marker becomes readable only by reading the *rest of the same response*, so a client that splits `get_activity` output and forwards fragments — the `---` split at line 1150, which tests and clients rely on — must keep the parts together, or markers must be back-references resolvable within a part. The `step_techniques_note` contract that a bundled entry *"is identical to a `get_technique { step_id }` fetch"* also weakens: it becomes identical-after-resolving-response-local-references.

| Boundary | Erased Data | Blocked Optimization | Blind Workaround | Concrete Cost | Flattening Breaks |
|---|---|---|---|---|---|
| `referenceMode` (workflow-tools.ts:847) collapses "already in this response" into "already in this context" | that a payload appears twice in the payload being assembled | response-local dedup, valid in every mode | ship every copy in full whenever `contextMode !== 'persistent'` | 179,348 chars / ~44,800 tokens over one pass of both trees; 33.9% of technique delivery | byte-identity of a `step_techniques` entry with a `get_technique` fetch; clients that split the response and forward fragments |
| `projectTechnique` inlines group rules; `formatTechniqueBundle` hoists them | that rules belong to the group, not the operation | hoist rules to one sibling array on the `step_techniques` path | re-attach the full merged record to every operation | 3.34× on `dispatch-activity` (5,612 → 18,753); 76,359 chars of intra-response rules repeat | `get_technique`'s single-payload self-containment — a step's rules would live one level up |
| whole-block ledger keys (`technique:rules:<hash>`, `…items:<hash>`) | that a rules record and an inherited-items list are *sets*, not blobs | per-entry collapse | re-ship the whole block to carry one differing entry | 71,216 chars reference mode cannot reach; 114,923 chars of inherited-block repeat | set-semantics ledger keys grow the ledger from ~73 keys (A0) to thousands; `deliveredContent` sits inside the sealed session file |
| worker bundle assembled outside `spentChars` (lines 859-889 vs 936) | that 35,204 chars of the response are activity-invariant | deliver the invariant bundle once per worker context | rebuild and re-ship per activity | 528,060 chars over a 15-activity walk; 387,244 on the A0 path; 56% of A0 `get_activity` bytes | a worker resumed on a *different* activity would need the bundle re-sent; `bundle:` ledger keys already exist for this and only need full mode to honour them |
| `context_tokens` → `eagerBudgetChars` (line 926) | nothing — it erases no data; it *asserts* a bound that does not exist | removing ~80 LOC and a required parameter | three unreachable guard branches (line 998, 1090, batch.ts:182) maintained and tested | 0 chars saved today; 0 chars ever saved; guards fire below 24,113 / 46,128 declared tokens | the batch `activity_cap` limb must stay; a genuinely small-window client loses its only protection |
| prose links carry conditions (`implement-task.md:50`) and workflow-relative paths (`resource-ref.ts:82`) | that a link is conditional; which workflow a borrowed technique's bare id belongs to | condition-aware and provenance-aware resource resolution | ship Rust material to every language; drop three resources silently | 34,568 chars per non-Rust walk; 5,631 chars never delivered on two activities | link syntax gains a gate; `qualifyResourceId` needs the *technique's* source workflow threaded through `composeActivityTechnique` |

---

## Opportunities, with saving and build cost

Ordered by chars saved per unit of build. Every saving is measured, not projected. Token figures use the server's own 4 chars/token factor (`DEFAULT_BUNDLE_CHARS_PER_TOKEN`).

**OPT-1 — Response-local dedup, mode-independent.** Split `referenceMode` into `referenceMode` (cross-context, unchanged) and an always-on response-local pass. In `src/tools/workflow-tools.ts` line 985, make `alreadyDelivered` fall back to `newDeliveries[ledgerKey] === hash` regardless of mode; at line 1005 call `dedupTechniqueBlocks` unconditionally, passing an empty ledger in full mode so only `newDeliveries` hits match.
*Saves:* 108,132 chars (~27,000 tokens) per pass of both trees, in the mode that is the production default and currently saves nothing. Includes the 21,912-char triplication in `codebase-comprehension` and 32,088 chars in `meta/discover-session`.
*Costs:* ~15 lines in `workflow-tools.ts`; a new `bundle_note` sentence stating that a marker may point at an earlier entry of the same response; tests for the full-mode marker path in `tests/`.

**OPT-2 — Hoist group rules on the `step_techniques` path.** Give `projectTechnique` the option `formatTechniqueBundle` already exercises: emit rules to a sibling `step_rules` array keyed by rule name, referenced from each entry.
*Saves:* 76,359 chars (~19,100 tokens) of intra-response rules repeat, unconditionally. Turns `manage-artifacts::write-artifact` from 10,956 to 3,767 chars and `workflow-engine::activity-worker` from 14,895 to 4,035.
*Costs:* new parameter on `projectTechnique` (`src/loaders/technique-loader.ts:33`) with `projectTechniqueToYaml` unchanged for `get_technique`; the `step_techniques_note` identity claim needs restating; `DEDUP_BLOCKS` in `src/utils/delivery.ts:95` loses its `rules` member.

**OPT-3 — Per-entry ledger keys for `rules` and `inherited_*.items`.** Extend `stageField` (`src/utils/delivery.ts:105`) to hash each rule entry and each inherited item separately, mirroring the `note`/`items` split already at line 157.
*Saves:* the further 71,216 chars (~17,800 tokens) reference mode cannot reach — 33.9% total against 20.5%. Largest single wins: `start-work-package` 14,002 chars of inherited items, `strategic-review` 10,473.
*Costs:* `deliveredContent` grows from 73 keys (A0-measured) to low thousands; that map lives inside the sealed session file, so measure the seal/serialise cost first. Consider a per-scope entry-hash set rather than a key-per-entry map.

**OPT-4 — Deliver the worker bundle once per agent context.** The ledger keys already exist (`bundle:<key>`, `bundle:rules:<hash>`, lines 867–889); only `referenceMode` gates them. Either honour those keys in full mode for a *repeat* `agent_id` (a second `get_activity` under the same id is provably a resumed context, whatever `contextMode` says), or count the bundle into `spentChars` and let `continue-batch` request `bundle: "reference"` as documented policy.
*Saves:* 281,632 chars (~70,400 tokens) on a 12-activity walk at `batchMaxActivities = 3`; 387,244 (~96,800 tokens) for a single-worker walk.
*Costs:* zero new machinery for the first option — a condition change at lines 871 and 885. The second is a definition edit to `workflows/meta/techniques/workflow-engine/continue-batch.md` plus a matching edit at `TECHNIQUE.md:22` and `dispatch-activity.md:93`, which today forbid it.

**OPT-5 — Delete the delivery-mechanics prose from `workflow-engine/TECHNIQUE.md`.** The eight rules tabulated in W6 restate MCP tool descriptions and the delivery notes the server already emits per response.
*Saves:* 5,014 chars (~1,250 tokens) off every composed `workflow-engine` technique — ~20,056 chars across the four meta activities that deliver one, plus the same block once from the `get_workflow` rules array. Compounds multiplicatively with OPT-2 and OPT-3, which shrink whatever survives.
*Costs:* pure definition edit. Guard risk: `scripts/check-technique-template.ts` and `scripts/check-audience.ts` may require a non-empty `Rules` section — verify before cutting. Keep `variable-mutation-source` (216) and `verify-dispatched-activity` (598): those are engine semantics, not tool mechanics.

**OPT-6 — Gate conditional resources in structure, not prose.** Add a `when` to a resource link, or move `tdd-concepts-rust` behind a language-gated step so `collectUngated` (line 939) skips it.
*Saves:* 27,066 chars (~6,800 tokens) of Rust TDD material per non-Rust walk; 34,568 (~8,600 tokens) including the `rust-substrate-code-review` sections. Also correctness: the report template used by every language is named for one.
*Costs:* schema addition if done as link syntax (`src/schema/technique.schema.ts` plus `extractResourceIds`); zero-schema if done as a gated step, at the price of a step per gate. Rename `rust-substrate-code-review.md` → a neutral slug as a separate definition edit with anchor updates.

**OPT-7 — Thread the technique's source workflow into `qualifyResourceId`.** `composeActivityTechnique` (`src/loaders/technique-loader.ts:603`) already knows which workflow it resolved the technique from; return it alongside `techniqueId` and pass it as `techniqueWorkflowId` at `workflow-tools.ts:1014` in place of the activity's `sourceWorkflowId`.
*Saves:* not tokens — 5,631 chars of resource body that currently never arrive, and three bundling warnings per `get_activity` on `lean-coding-audit` and `strategic-review`. Two steps presently execute without their template.
*Costs:* one extra field on the `composeActivityTechnique` result; one argument change at the call site. `scripts/check-resource-anchors.ts` should be extended to resolve *through* the delivery path rather than the filesystem, so this class fails CI rather than at runtime.

**OPT-8 — Retire the eager-delivery character budget; keep the activity cap.** Delete `eagerBudgetChars`, the stop-and-break at line 998, the resource overflow at line 1090, and the `budgetChars` limb of `batch.ts:158`/`182`. Make `context_tokens` optional (it is still useful as a recorded fact).
*Saves:* 0 chars — this is the honest entry. It removes ~80 LOC of `workflow-tools.ts`, one limb of `batch.ts`, their tests, and two response fields (`eager_budget_chars`, `budget_chars`) that report a bound with 8.3× slack at the worst activity.
*Costs:* a small-window client loses its only protection, so gate the deletion on a floor (`context_tokens < 50,000` keeps the old path) or accept the `activity_cap`-only bound. This is the opportunity to *not* build; list it so the report can price maintaining the guard against never firing it.

**OPT-9 — Fix `spentChars` to measure the whole eager delivery.** Add the worker bundle and the activity-rules block to `spentChars` before the cost line at `workflow-tools.ts:1282`.
*Saves:* no tokens; it makes every other measurement here trustworthy. Today `spent_chars` omits 35,204 chars — roughly half of a typical work-package `get_activity`.
*Costs:* three lines. Do this **first**: `scripts/run-token-benchmark.ts` and the `token-benchmark-a0-reference.json` fixture are the acceptance instrument for OPT-1 through OPT-6, and `--gate --max-regression-pct` already exists to hold the gain. Re-stamp the fixture after OPT-9 so later comparisons are against a complete measurement.

**OPT-10 — Whole-file preference for heavily-sectioned resources.** Where one activity's eager manifest covers more than a threshold share of one resource file, deliver the bare id instead of the sections, letting `coveredByItsFile` (line 1048) do the rest.
*Saves:* small on first delivery (`codebase-comprehension`: 18,182 whole versus 16,988 across five sections — a 1,194-char loss) but collapses five ledger keys to one, so every later fetch of any of those five sections becomes a marker instead of a body. Recovers ~7,000 chars per repeat visit and removes five of the 128 `get_resource` calls the A0 walk makes.
*Costs:* a coverage pass over the manifest before the bundling loop in `workflow-tools.ts`; a threshold constant beside `DEFAULT_MAX_EAGER_RESOURCE_CHARS` in `src/utils/resource-delivery.ts`. A new `scripts/check-resource-section-coverage.ts` guard would catch the authoring pattern at CI time instead.

### What the portfolio adds up to

Against the A0 walk's measured 1,355,532 chars (~339,000 tokens) of definition delivery for one 12-activity work-package pass, the addressable duplication is:

| source | chars | tokens |
|---|---|---|
| worker-bundle repeat, 4-worker topology (OPT-4) | 281,632 | 70,400 |
| shared-block dedup on the A0 activities (OPT-1 + OPT-2 + OPT-3) | 98,601 | 24,700 |
| cross-activity resource repeat tax (OPT-4's ledger, applied to resources) | 45,936 | 11,500 |
| language-conditional resources (OPT-6) | 34,568 | 8,600 |
| delivery-mechanics prose (OPT-5) | ~20,056 | 5,000 |
| **total** | **~480,793** | **~120,200** |

**Roughly 35% of one work-package walk's definition delivery is provably redundant** — the same bytes, to the same context, within one response or one batch. None of it requires an authoring change to the 96 techniques that carry it; OPT-1, OPT-2, OPT-4 and OPT-9 are all server-side and together account for ~380,000 of those chars.

The instrumentation to prove each step is already built: `record_usage` + `inspect_session view:usage` for live walks, `scripts/run-token-benchmark.ts` with `--gate --max-regression-pct` against the frozen A0 fixture for CI, and `logInfo('Activity delivery cost')` per response. What is missing is not measurement. It is that the one boolean at `workflow-tools.ts:847` decides both questions, and the definitions have told the orchestrator to answer it "no".
