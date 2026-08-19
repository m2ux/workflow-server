---
target: /home/mike1/projects/dev/workflow-server
date: 2026-08-18
lens: counterfactual (54)
dimension: Orchestration Topology and Critical Path
---

# Counterfactual Re-measurement: Orchestration Topology and Critical Path

Two numbers govern how many sub-agents a work-package run spawns. `BATCH_MAX_ACTIVITIES` is 3 and `BATCH_HEADROOM_FRACTION` is 0.35, both at `src/config.ts:164-165`. They were set when one 12-activity walk delivered 1,780,292 characters. The same walk delivers **1,302,319** today — 26.8% less — and neither number moved.

This document re-derives what those two dials buy at today's delivery sizes. Every counterfactual is arithmetic over per-activity figures measured this session against the current build, with the model stated and the confirming measurement named.

---

## 1. Method, and what is measured versus modelled

### 1.1 The instrument

`deliveredChars` (`src/utils/batch.ts:98-123`) is the server's own charging rule and the only one that matters, because it is what the bound reads. It charges three event types and nothing else:

- `activity_dispatched` — the whole `get_activity` response, so eagerly bundled techniques and resources are already inside it
- `technique_fetched` — a lazy `get_technique`
- `resource_fetched` where `bundled !== true` — a lazy `get_resource`

Events carrying `delivery: "unchanged"` are skipped. `get_workflow` produces no history event of any charged type, so it is charged to nobody. That is measured, not inferred: the 12-activity walk emits 14 distinct history event types and none of them is a workflow fetch.

The bound itself (`src/utils/batch.ts:129-139`):

```
budgetChars   = floor(contextTokens × headroomFraction × charsPerToken)
maxActivities = max(1, floor(maxActivities))
```

At the shipped defaults and a 200,000-token declared window that is `floor(200000 × 0.35 × 4) = 280,000` characters and 3 activities.

Admission (`src/utils/batch.ts:149-183`) is checked **before** composition, against the scope's accumulated history:

```
admit  ⟺  scope == session.agentId
       ∨  activities.length == 0
       ∨  activities.includes(activityId)
       ∨  (activities.length < maxActivities ∧ chars <= budgetChars)
```

Three consequences follow directly and drive everything below. The comparison is `chars <= budgetChars` on the tally *before* the new payload, so an admitted activity can carry a scope past the budget by up to one whole activity. The zero-activity carve-out means a context is always given its first activity however large. And the already-held carve-out means a gate never costs a batch slot.

### 1.2 Two measured curves, and why two are enough

The dimension's central question is what a *batch* costs, and a batch's second and later activities take reference delivery. Rather than patch the harness, both endpoints were measured with the two context modes the server already ships, walking the recorded 12-activity work-package path with the robot walker under `skipOptionalPolicy`:

- **`context_mode: fresh`** — no collapsing at all (`unchangedResourceAnswers` 0, `unchangedTechniqueAnswers` 0). Each activity costs what a scope that holds no prior delivery pays. This is the **full-delivery curve**, and it is exactly what a scope's *first* activity costs.
- **`context_mode: persistent`** — reference delivery on, one scope for the whole walk. This is the **reference curve**, what a scope's *second and later* activities cost.

The fresh walk reproduces `scripts/fixtures/token-benchmark-baseline.json` character for character: `get_activity` 520,075 / 12 calls, `get_resource` 527,683 / 162 calls, `get_technique` 146,205 / 24 calls, `get_workflow` 108,356 / 1 call, total **1,302,319** over **242** tool calls with **10** yield/respond/resume triples. The instrument is bit-reproducible against the committed baseline, so every figure below rests on the same walk the CI gate rests on.

### 1.3 The measured per-activity distribution

`get_activity` delivers 520,075 characters over 12 calls. The mean, 43,340, is the wrong sizing input twice over: it ignores the lazy half of delivery, and the bound binds on the largest, not the average.

Charged characters per activity (MEASURED, `deliveredChars` rule, grouped by the activity each event was recorded under):

| # | Activity | Full delivery | of which lazy | Reference delivery | Collapse |
|---:|---|---:|---:|---:|---:|
| 1 | start-work-package | 198,747 | 90,443 | 194,696 | 2.0% |
| 2 | design-philosophy | 104,546 | 40,348 | 74,820 | 28.4% |
| 3 | codebase-comprehension | 134,273 | 88,845 | 106,966 | 20.3% |
| 4 | plan-prepare | 99,002 | 52,113 | 71,041 | 28.2% |
| 5 | assumptions-review | 58,984 | 31,742 | 22,496 | 61.9% |
| 6 | implement | 96,506 | 46,394 | 55,357 | 42.6% |
| 7 | lean-coding-audit | 53,671 | 38,668 | 23,945 | 55.4% |
| 8 | post-impl-review | 114,659 | 64,203 | 86,477 | 24.6% |
| 9 | validate | 36,047 | 31,742 | 4,328 | 88.0% |
| 10 | strategic-review | 102,295 | 52,203 | 66,268 | 35.2% |
| 11 | submit-for-review | 101,939 | 84,770 | 70,220 | 31.1% |
| 12 | complete | 91,633 | 50,756 | 59,346 | 35.2% |
| | **total** | **1,192,302** | **672,227** | **835,960** | **29.9%** |

Three readings the mean hides:

**The eager payload is the minority of delivery.** 520,075 of the 1,192,302 charged characters — **43.6%** — arrive inside `get_activity`. The other **56.4%** is fetched lazily afterwards and charged to the same budget. Every calibration figure computed from `bench:batch` is computed on the 43.6%.

**The distribution is front-loaded and wide.** The largest activity, `start-work-package` at 198,747, is **5.5×** the smallest (`validate`, 36,047) and **2.0×** the mean. It alone is 71.0% of the 280,000-character budget, and 24.8% of a 200,000-token window at four characters to the token.

**Reference delivery does not collapse uniformly.** It ranges from 2.0% on the first activity (nothing to collapse against) to 88.0% on `validate`. A model that applies one collapse ratio is wrong by a factor of 44 at the extremes.

### 1.4 The model used for every counterfactual below

MODELLED. A batch scope takes its first activity at full delivery and each subsequent activity at reference delivery, admitted by the rule at `src/utils/batch.ts:158`:

```
scope head:        cost = full(k)
subsequent:        cost = ref(k),  admitted iff members < cap ∧ cumulative <= budget
```

One known bias, stated so it is not silently absorbed: `ref(k)` was measured against a ledger accumulated from activity 1, so for a scope starting mid-walk it is a **lower bound** on the real cost. Every dispatch count below is therefore a floor, and every character total for a multi-scope topology is a floor. The single-scope row is measured outright and carries no such bias.

---

## 2. Step 1 — The three decisions that shaped the topology

### D1. The run is bounded by the server at delivery, not planned by the orchestrator at dispatch

**Chosen.** "A batch is not declared: it IS the run of activities one delivery scope takes delivery of, derived from session history, so the server needs no cooperation to see one" (`src/utils/batch.ts:11-13`). The orchestrator never states how many activities a worker will walk. It dispatches, the worker asks, and the server refuses when the run is spent.

**Not chosen.** The orchestrator plans the run at dispatch time — "this worker gets activities 4, 5, 6" — and the server validates the plan against a budget it can compute up front.

**Evidence it was deliberate.** The refusal message (`src/utils/batch.ts:186-197`) is 400 characters of instruction to a caller who did not know the bound existed, telling it to mint a new `agent_id` and stop. A validated plan would need no such message. The three carve-outs (`src/utils/batch.ts:11-15`) each exist to repair a failure mode that only arises because the batch is inferred rather than declared. And `recordBatchRefusal` (`src/utils/batch.ts:206-229`) writes a history event whose stated purpose is that "the runs that hit each limit are countable and the settings can be revised from them" — telemetry a declared plan would not need, because the plan would be the record.

### D2. Cost is denominated in delivered characters against a caller-declared window, with a second, undenominated activity cap alongside

**Chosen.** Two limits in two units. The character budget scales with whatever the caller passes as `context_tokens`; the cap is a bare integer that scales with nothing.

**Not chosen.** One limit. Either characters alone, or activities alone, or a single limit expressed in the worker's own reported remaining context.

**Evidence it was deliberate.** `src/config.ts:106-114` argues the cap's existence at length: it "backs the character budget, which is blind to the context establishment the server never delivers, the code a worker reads, the artifacts it drafts, and degradation across a long walk." And `src/config.ts:96-105` argues that the batch fraction must be its own setting rather than reusing `BUNDLE_HEADROOM_FRACTION`, "because it answers a different question." Both values are separately env-overridable and separately clamped (`src/config.ts:606-607`). This is a considered pair, not a pair by accident.

### D3. Delivery is pulled by the worker, one item per call, de-duplicated on a caller-supplied identity

**Chosen.** `get_resource` takes exactly one `resource_id` (`src/tools/resource-tools.ts:865-875`). `get_technique` takes one technique. Repeats collapse only when the caller passes the same `agent_id` and reference delivery is in force.

**Not chosen.** Push everything an activity's steps can reach with the activity, or accept a list of ids in one call.

**Evidence it was deliberate.** Eager bundling exists and is budgeted separately at 0.80 of the window (`src/config.ts:155`), so pushing content *was* built — and then deliberately bounded, with the residue left to be pulled. The `bundled` flag on `resource_fetched` exists solely to stop the charging rule counting a pushed body twice (`src/utils/batch.ts:114-117`). The design knows both modes and chose to keep the pull path as the fallback.

---

## 3. Step 2 — The alternatives constructed

### CF-1. Raise the cap. What actually fits in one worker context now?

MODELLED from the measured curves, admission rule applied literally.

| Cap | Window | Headroom | Budget | Dispatches | Charged chars | Worst terminal | % of window |
|---:|---:|---:|---:|---:|---:|---:|---:|
| **3** | 200k | **0.35** | 280,000 | **4** | **933,725** | 380,533 | 47.6% |
| 4 | 200k | 0.35 | 280,000 | 4 | 928,441 | 380,533 | 47.6% |
| 6 | 200k | 0.35 | 280,000 | **3** | 899,691 | 380,533 | 47.6% |
| 100 | 200k | 0.35 | 280,000 | 3 | 899,691 | 380,533 | 47.6% |
| 100 | 200k | 0.50 | 400,000 | **2** | 876,499 | 451,574 | 56.4% |
| 100 | 200k | 0.80 | 640,000 | 2 | 876,038 | 644,177 | 80.5% |
| 3 | 1M | 0.35 | 1,400,000 | 4 | 933,725 | 380,533 | 9.5% |
| **12** | 1M | 0.35 | 1,400,000 | **1** | **840,011** | 840,011 | 21.0% |
| 1 | 200k | 0.35 | 280,000 | 12 | 1,192,302 | 198,747 | 24.8% |

The scope composition at the shipped defaults, 200,000-token window:

```
[1,2,3]     = 380,533   ended by activity_cap  (the budget refuses the 4th too)
[4,5,6]     = 176,855   ended by activity_cap  (63% of budget unused)
[7,8,9]     = 144,476   ended by activity_cap  (48% of budget unused)
[10,11,12]  = 231,861   run ends
```

**The answer to "how many activities fit in one worker context at current delivery sizes" is three at the head of the walk and eight at the tail.** Scope 1 is genuinely full — 380,533 charged characters against a 280,000 budget, already past it. Scopes 2 and 3 stop at 63% and 48% of budget unused, held back by the cap alone.

**What raising the cap buys, on a 200,000-token worker: one dispatch and 34,034 characters.** Cap 3 → 6 takes the walk from 4 scopes to 3 and from 933,725 to 899,691 charged characters, −3.6%. Cap 4 buys nothing at all — it moves scope 1's refusal from `activity_cap` to `delivery_budget` at the same boundary and re-partitions the tail into the same four scopes. Cap 100 is identical to cap 6, because the budget takes over at both remaining boundaries.

**On a 1,000,000-token worker it buys three dispatches and 93,714 characters.** At that window the budget is 1,400,000 and never binds: the entire walk's 840,011 charged characters clear it with 40% to spare. The cap of 3 is the *only* thing forcing 4 dispatches. Raising it to 12 collapses the walk to a single context, saving 93,714 characters (−10.0%) and three spawns. At the measured 87-second per-dispatch spawn cost (`scripts/run-batch-benchmark.ts:83`, the mean of 77, 65, 42 and 165 seconds over the profiled 27 July run) that is **261 seconds of run duration**.

**None of the 10 yield/respond/resume triples is eliminated by any of these settings.** That is measured, and it is structural. The triple count is 10 in every row of the table above, because a gate resumes in place and `batchRefusal` (`src/utils/batch.ts:176`) returns `undefined` for an activity the scope already holds — the carve-out exists precisely so a gate never spends a batch slot. What varies with the cap is spawns and scope-head full deliveries, nothing else. The `get_activity` and `next_activity` counts are likewise invariant at 12 apiece.

**Where the new binding constraint sits.** Raise the cap on a 200,000-token worker and the budget takes over at the next boundary — scope 1 refuses its fourth at 380,533 against 280,000, and the merged scope [4..8] refuses its sixth at 287,277. Raise the cap on a 1,000,000-token worker and *nothing in the server binds*. The constraint moves entirely outside the server, to the two things the cap was written to proxy for (`src/config.ts:109-112`): the worker's own undelivered consumption — the code it reads, the artifacts it drafts, the harness establishment the server never sees — and degradation across a long walk. Neither is instrumented. `record_usage` is the named instrument for the first, and the prior report's ledger shows 13 usage rows against 19 dispatch events across the two evaluation sessions, **68.4% coverage**.

**Confirming measurement.** Wire `batchMaxActivities` and `batchHeadroomFraction` into `tests/e2e/harness.ts`, then run `bench:batch` over the recorded 12-activity path at cap ∈ {1, 3, 4, 6, 12} × window ∈ {100k, 200k, 500k, 1M}, reading `dispatches` and `deliveredChars` off each pass. **Refuting measurement:** any cell where the measured dispatch count exceeds the table, which would mean `ref(k)` understates a mid-walk scope's cost by more than the slack in that partition.

### CF-2. The documented calibration is computed on the eager floor, and it inverts

This is the counterfactual that matters most, because it is not hypothetical — it is the calibration in force.

`docs/dispatch_model.md` states three things about the shipped settings:

> "At a 200,000-token window, giving a 280,000-character budget, **the cap binds first on measured content**." … "Reaching the budget takes **roughly seven activities** of that weight" … "the budget takes over below **roughly 114,000 declared tokens** on this workload."

All three come from `bench:batch`'s three-activity mid-walk run, and that run measures activity payloads only — it never fetches a technique or resource lazily. Re-measured today, that run is unchanged by the remediation: per-activity 233,073 characters over 3 contexts, batched 159,212 over 1, 31.7% saved, 2 dispatches avoided. The doc was written against 232,954 and 159,093, so the eager floor drifted by 119 characters, 0.07%.

Reproducing the doc's arithmetic from that figure confirms the provenance exactly. The batched marginal is `(159,212 − 78,128) / 2 = 40,542` characters per subsequent activity, giving `1 + (280,000 − 78,128) / 40,542 = 6.0` activities to the budget — the doc's "roughly seven". And `159,600 / 1.4 = 114,000` declared tokens — the doc's crossover, to the character.

Now the same three questions on the measured curve, with the lazy 56.4% included:

| Claim | Documented | Re-measured | Error |
|---|---:|---:|---:|
| Activities to reach the 280,000 budget | ~7 | **3** | 2.3× |
| Declared tokens where the budget takes over | ~114,000 | **195,405** | +71.4% |
| Which limit binds first at 200k | activity cap | **both, at the same boundary** | — |

At the head of the walk the cumulative is 198,747 after one activity and 273,567 after two. The third is admitted with 6,433 characters of headroom left — **2.3% margin** — and the fourth is refused by both limits simultaneously. The near-balance at 200,000 tokens is a coincidence of that 2.3%, not a calibration: drop the declared window to 195,000 and the budget binds at two activities; the doc's stated safety margin of 114,000 tokens is short by 81,405.

**Confirming measurement.** Add a lazy-fetch arm to `bench:batch` — probe the technique-linked resources the way `run-token-benchmark.ts:452-474` already does — and re-read the cap-versus-budget crossover off the batched pass. **Refuting measurement:** a crossover below 150,000 declared tokens, which would mean the lazy half is largely ledger-collapsible inside a single scope in a way the persistent-mode walk did not show.

### CF-3. The overshoot: a fraction labelled 0.35 delivers 0.48

Because admission is tested before composition, a scope terminates at up to `budget + one activity`. This is documented and intentional — "refusing after composing would pay the composition and still not un-deliver it" — but its magnitude is not.

MEASURED worst terminal in the shipped topology: scope 1 at **380,533** characters. That is 95,133 tokens, **47.6%** of the declared 200,000-token window, against a nominal 35%. The realised fraction is **1.36×** the configured one.

MODELLED ceiling: `280,000 + max(full) = 280,000 + 198,747 = 478,747` characters, 119,687 tokens, **59.8%** of the window. A setting named 0.35 admits a worst case of 0.60.

The exposure is exactly the size of the largest scope-head activity, and `start-work-package` at 198,747 characters is that activity. Halving it halves the overshoot without touching either dial.

**Confirming measurement.** Record `context_tokens` on the `activity_dispatched` event — it is passed to `get_activity` and used to compute the bound, and then discarded (`src/utils/dispatch.ts:46-60` records `agentId`, `dispatch` and `chars`, and nothing else). Only `batch_refused` preserves `budgetChars`, and only on a refusal. With `context_tokens` in the history, the realised terminal-as-fraction-of-window is computable for every real run instead of modelled.

### CF-4. `get_workflow` not fetched at all

MEASURED: 108,356 characters, one call, 77.2 ms of server time. It is **8.3%** of the fresh walk's delivery and **12.2%** of the persistent walk's — the second-largest single payload in the run after `start-work-package`'s activity response.

It is charged to nobody. `deliveredChars` recognises three event types and a workflow fetch is none of them, and the walk emits no workflow-fetch history event at all. So the 108,356 characters — **27,089 tokens, 13.5% of a 200,000-token window** — are invisible to the bound. An orchestrator that also takes an activity carries them past the bound's first reading for free.

Its content (`src/tools/workflow-tools.ts:436-473`) is the orchestrator technique bundle above a `---` separator, then workflow metadata, rules, variables, `initialActivity` and activity stubs. The bundle is the bulk; the stubs and `initialActivity` are what the orchestrator's next call actually consumes.

**What removing it buys, and does not.** It buys 27,089 tokens of orchestrator context and nothing in the bound, because the bound never saw them. It is therefore not a batching lever at all — it is the largest single item in the run that no dispatch-topology change can touch. Its correct home is the delivery-economy dimension; it appears here only to record that the topology levers cannot reach it.

**Confirming measurement.** Instrument the response to report the pre-separator bundle length against the post-separator metadata length, then re-run `bench:token` with the bundle collapsed to a reference and confirm delivery falls to the metadata-only figure with the walk still completing.

### CF-5. Resources delivered by section only

MEASURED decomposition of the 526,574 charged resource characters:

| Cut | Distinct ids | Fetches | Charged chars | Share |
|---|---:|---:|---:|---:|
| Anchored (`#section`) | 69 | — | 168,795 | 32.1% |
| Whole-file | 8 | — | 357,779 | 67.9% |
| — of which benchmark hot-set | 2 | 24 | 332,568 | 63.2% |
| — of which corpus-driven | 6 | — | 25,211 | 4.8% |

**Section-grain delivery is already done on the corpus side.** 69 of 77 distinct keys carry an anchor. Every corpus-driven fetch in the walk — 71 fetches, 142,005 characters — is a singleton, fetched exactly once. The whole-file corpus residue is 25,211 characters, **1.9%** of the run. There is no meaningful section-grain counterfactual left against the definitions.

**The remaining whole-file cost is the benchmark's own construction.** `scripts/run-token-benchmark.ts:160-168` hardcodes a seven-id `HOT_RESOURCES` list re-probed on every `get_activity`, and every repeated resource in the entire walk is a member of it — 6 distinct ids, 75 fetches, 384,569 characters, **29.5% of the whole run**. Two of them carry it: `review-mode` fetched 12 times for 254,868 characters (19.6% of the run) and `pr-description` 12 times for 77,700. The corpus links `review-mode.md` unanchored exactly twice and anchored at least fourteen times, so the 12 whole-file fetches per walk model a repeat tax rather than reproducing one.

That construction gives the CI delivery gate a **12:1 lever on two files**. Adding 1,000 characters to `review-mode.md` moves the measured walk by 12,000 characters — **0.92% of 1,302,319**, consuming 92% of the gate's 1% threshold, from a one-kilobyte edit. The same 1,000 characters added to any of the other 337 definition files moves it by 1,000, or 0.08%. The gate resolves changes to two files twelve times more sharply than changes to everything else, in both directions: it will fail on a benign edit to `review-mode.md` and pass a twelve-fold larger regression spread across the corpus.

MEASURED, and worth fixing on sight: **16 of the 162 `get_resource` calls in the gate baseline return errors.** Twelve of them request `review-mode#consolidated-review-format`, an anchor that does not exist — `review-mode.md` carries 40 headings and none matches. The other four are `writing-register`, `l12`, `debt-ledger#template` and `debt-ledger#rules`. The hot-set probe has been requesting a dead anchor on every activity of every gated run.

**Confirming measurement.** Re-record the fixture with `HOT_RESOURCES` reduced to anchors the corpus actually links, then measure the gate's sensitivity directly: append 1,000 characters to `review-mode.md` and to `codebase-comprehension.md` in turn and read the two deltas. Equal deltas confirm the lever is gone.

### CF-6. Checkpoints batched

MEASURED: 10 round trips, 30 tool calls, 6,828 characters, 756.0 ms of server time, distributed across 6 of the 12 activities:

| Activity | Gates fired | Declared checkpoint steps |
|---|---:|---:|
| start-work-package | 2 | 10 |
| design-philosophy | 1 | 2 |
| plan-prepare | 1 | 1 |
| lean-coding-audit | 1 | 1 |
| post-impl-review | 2 | 3 |
| submit-for-review | 3 | 9 |
| six others | 0 | 10 |
| **total** | **10** | **36** |

The path declares 36 checkpoint steps; 26 (72.2%) are gated out by `when` before they fire. Batching the survivors within an activity — presenting an activity's gates in one round trip instead of one apiece — takes 10 triples to **6**. That removes 4 triples, 12 tool calls (5.0% of 242) and 2,731 characters.

**It removes no dispatch,** for the reason given in CF-1: gates resume in place under the identity the dispatch bound. So this is a round-trip saving only, and the round trip is the cheap unit. Ranked against the dispatch lever on the one axis both can be measured on — server-side wall clock — one avoided spawn at 87 seconds is worth **1,150 avoided checkpoint round trips** at their measured 75.6 ms apiece. The agent-side cost of a round trip is the term that matters and it is unmeasured.

**Confirming measurement.** Record wall-clock between `yield_checkpoint` and its matching `resume_checkpoint` on a real run. The server sees 75.6 ms; the run sees an orchestrator turn, and the ratio between those two is the whole case for or against batching gates.

### CF-7. A larger or smaller worker window

The budget is linear in the declared window: `budget = 1.4 × contextTokens` characters at the shipped headroom. The measured cumulative curve turns that into thresholds:

| Declared window | Budget | Activities at head | Dispatches | Charged chars | Binding limit |
|---:|---:|---:|---:|---:|---|
| ≤ 141,962 | ≤ 198,746 | **1** | 12 | 1,192,302 | budget, on the first boundary |
| 141,963 – 195,404 | 198,748 – 273,565 | 2 | 5 | 972,473 | budget |
| 195,405 – 271,809 | 273,567 – 380,532 | 3 | 4 | 933,725 | cap and budget together |
| ≥ 557,618 | ≥ 780,665 | 12 | 4 | 933,725 | **cap alone** |

Two thresholds are worth naming. Below **141,963** declared tokens the bound degenerates to no batching at all: the second activity is refused everywhere, so every context takes exactly one and the topology is 12 dispatches for 1,192,302 characters — 27.7% more delivery than the shipped topology and 41.9% more than a single context. And the first activity is delivered anyway under the zero-activity carve-out, at 198,747 characters, **49.7% of a 100,000-token window** in one payload.

Above **557,618** declared tokens the budget can no longer bind anywhere on this walk, and the cap of 3 becomes the sole determinant of dispatch count. Every worker declaring a modern large window is in this regime. The cap is doing 100% of the work and it is the value with no measurement behind it.

**Confirming measurement.** The same harness change as CF-1, sweeping the window. **Refuting measurement:** a measured 12-dispatch walk costing materially less than 1,192,302 charged characters, which would mean cross-scope ledger reuse exists somewhere the fresh-mode walk did not exercise.

### CF-8. The instrument gap, which subsumes the rest

Not one of CF-1 through CF-7 can be confirmed by anything the repository ships today.

`BATCH_MAX_ACTIVITIES` and `BATCH_HEADROOM_FRACTION` reach the server only through `loadConfig` (`src/config.ts:606-607`), which reads `process.env`. Every measurement path — `bench:batch`, `bench:token`, the whole e2e suite — builds its config as a literal in `tests/e2e/harness.ts:36-43`, and that literal omits both fields. They fall through to the in-code defaults at `src/tools/workflow-tools.ts:823-825`.

MEASURED, by attempting it: exporting `BATCH_MAX_ACTIVITIES=100` and `BATCH_HEADROOM_FRACTION=1` and re-running `bench:batch` over the 12-activity path still refused the fourth activity, naming "the cap of 3 per worker context". The env overrides are unreachable from any benchmark. The only place they are exercised is `tests/config.test.ts:204-237`, which asserts that `loadConfig` parses and clamps them — never that the server honours them.

`scripts/run-batch-benchmark.ts:80` compounds it: `DEFAULT_RUN` is exactly three activities, which is the cap. The shipped batch benchmark cannot observe a refusal even in principle.

The documentation is explicit that revising these values "needs evidence a byte count cannot supply — `batch_refused` counts and per-activity usage rows over real runs." Both evidence streams are thin. `batch_refused` events require a refusal to occur under a topology that already avoids them by construction. And the usage rows show 68.4% coverage across the prior evaluation's 19 dispatches, with `context_tokens` — the one input the budget is computed from — recorded nowhere durable.

**This is why the settings have not moved through a 26.8% fall in delivery.** Not inattention: no instrument.

---

## 4. Step 3 — Gains, sacrifices, and the conservation law for each pair

### D1 pair — server-derived bound versus orchestrator-planned run

**The alternative gains** a bound computed before the spawn rather than discovered after it. The refusal at `src/tools/workflow-tools.ts:827-836` costs a wasted dispatch: a worker is spawned, establishes context, asks, and is told to stop — and the replacement must carry a *new* `agent_id`, so the establishment is paid twice for one activity. A planned run never pays it. It also makes the topology legible before it runs: the orchestrator could report "12 activities, 4 workers" up front, which is exactly the number this analysis had to reconstruct from two benchmark passes.

**The alternative sacrifices** the property the chosen design is built on — that a worker which omits `agent_id` or `context_tokens` cannot escape the bound. A plan is a claim, and a claim needs validating against the same history the derived bound reads, so the alternative carries the derived machinery *plus* a plan to reconcile against it.

**Bugs that disappear.** The identity-reuse hazard goes with it. Today a resume rebinds `agentId` to the resuming caller (`docs/dispatch_model.md`), so a dispatched worker that passes the session's own identity is silently unbounded and "which context holds the exemption can move across a resume". A declared envelope is keyed on the envelope, not on a caller-settable string, and cannot move.

**Bugs the alternative introduces.** Plan drift. `when`-gating removed 26 of the path's 36 checkpoint steps at run time, and the walked path itself is policy-dependent. A plan made at dispatch is a prediction about branches not yet evaluated, and a stale plan is worse than no plan: it commits a worker to activities the run will not reach.

**Conservation law.** *The information needed to bound a run is conserved; only its timing moves.* Both designs must know cumulative delivery and activity count for a scope. The chosen design reads it from history after the fact and pays with a wasted dispatch on refusal. The alternative predicts it before the fact and pays with drift. Neither can bound a run without that pair of numbers, and neither can obtain it earlier than the run produces it.

### D2 pair — two limits versus one

**The alternative gains** a single dial with a single meaning, and it removes the failure this analysis found: a documented calibration claiming the cap binds first, computed on 43.6% of the delivery, on a workload where at 200,000 tokens the two limits are within 2.3% of each other and inverted below 195,405. Two limits in two units cannot be checked against one measurement, so they were checked against the one that was easy to measure.

**The alternative sacrifices** exactly what `src/config.ts:109-112` names: the character budget is blind to context establishment, the code the worker reads, the artifacts it drafts, and degradation across a long walk. A character-only bound at a large window is no bound at all — CF-7 measures the regime where it stops binding entirely at 557,618 declared tokens, and every worker above that walks all 12 activities with the server having no opinion.

**Bugs that disappear.** The 1.36× overshoot of CF-3 becomes legible: with one limit the realised fraction is `budget + max_activity`, computable from the curve. With two, the effective ceiling depends on which limit fires and on the size of the activity that fired it, and the reported figure (`_meta.batch.budget_chars`) describes only one of them.

**Bugs the alternative introduces.** A cap-only bound ignores size and lets three heavy activities in — scope 1's 380,533 characters would be admitted at any window. A budget-only bound ignores everything the server does not deliver, which on the profiled runs is the majority of what fills a worker's context.

**Conservation law.** *Total worker context is conserved; only its attribution moves between what the server delivers and what the worker acquires.* A window holds a fixed number of tokens. The server can meter its own contribution precisely and the worker's not at all. Any single limit must therefore either over-bound the metered part to leave room for the unmetered, or under-bound and overflow. Two limits do not repeal this — they split the estimate in two, and CF-2 shows the split was validated on the metered half only.

### D3 pair — pull-per-item versus push-everything

**The alternative gains** the round trips. 162 `get_resource` calls are 66.9% of the walk's 242 tool calls and 58.4% of its 9,264 ms of server time. A batched fetch taking a list of ids collapses them to at most 12 — one per activity — removing 150 turn boundaries, 62.0% of all tool calls. Pushing them into `get_activity` removes all 162.

**The alternative sacrifices** the budget's granularity. Today a worker pays for what it reads; under push it pays for what its steps *could* read. `start-work-package` already delivers 198,747 charged characters with 90,443 of them pulled; pushing every reachable resource makes the largest activity larger, and the largest activity is what sets the overshoot ceiling of CF-3.

**Bugs that disappear.** The double-charging hazard the `bundled` flag exists to prevent (`src/utils/batch.ts:114-117`) — miscounted, it "inflated one activity by 48% and a run of three by 70%, which made a nominal 280,000-character budget bind at 164,540" — has no analogue when there is one delivery. So do the 16 error calls of CF-5, since a push resolves refs at composition time where a dead anchor fails once, loudly, at authoring time rather than 12 times per run, silently.

**Bugs the alternative introduces.** Push makes eager bundling's budget the whole budget, and the two headroom fractions collapse into one — which is the coupling Step 4 turns on.

**Conservation law.** *Bytes delivered plus bytes speculatively delivered is conserved against round trips.* Pull pays a round trip per item to deliver only what is needed. Push pays one round trip to deliver a superset. The product of the two is set by the corpus's fan-out — measured by `bench:batch` on the three-activity run as 28 operations reaching 293 inherited I/O items, `inheritedIoReachPct` 14.7 — and no delivery mechanism changes it. Only the corpus's own reference structure does.

---

## 5. Step 4 — The maximally-different system

Take the opposite of all three: **the orchestrator declares the run at dispatch; one limit bounds it, expressed in the worker's declared window; and everything that run can reach is composed and pushed in one delivery.**

Concretely, a single call replaces four:

```
open_run(session_index, agent_id, activities: [...], context_tokens)
  → one composed payload for the whole run: every activity body, every step
    technique, every reachable resource, resolved once and de-duplicated across
    the run, with a manifest of what was included and what was dropped for size
```

No `get_activity` per activity. No `get_technique`. No `get_resource`. The server refuses the *run* at open time if the composed payload exceeds `contextTokens × fraction × charsPerToken`, and it can say so before a worker is spawned, naming which activities fit.

**Is it coherent? Yes — and the measurements say it is the better system on every axis this dimension measures, at one price.**

Sized on the measured curves: the reference curve's 840,011 characters is the de-duplicated cost of all 12 activities to one context, and cross-run de-duplication would go further than the walk's own ledger did, because a single composition sees every reference at once instead of discovering them in walk order. Against the shipped topology's 933,725 charged characters over 4 dispatches and 242 tool calls, the alternative is one dispatch, ~14 tool calls, and no yield/respond/resume dependency on re-delivery at all. Three spawns at 87 seconds and 228 round trips disappear.

The price is that 840,011 characters is 210,003 tokens — it does not fit a 200,000-token worker, and a partial fit must be decided before anything is delivered. The alternative therefore *forces* the run-splitting decision to the front, where the chosen design defers it to a refusal. That is the honest trade: the alternative cannot be lazy about sizing, and the chosen design cannot be early about it.

Where the alternative genuinely breaks is elsewhere, and it is worth naming precisely. Pushing everything at open time means resolving every `when` before any step has run — and 26 of the path's 36 checkpoint steps are removed by `when` evaluation that depends on answers the run has not yet produced. A run-level push must either deliver all 36 (paying for 26 that will never fire) or re-open when a branch resolves (which is the pull path, readmitted under a different name). This is the one place the three opposites do not compose cleanly, and it is a property of the corpus's conditional structure, not of the delivery mechanism.

### The pair that is secretly coupled

**D2 and D3.** Changing the delivery mechanism forces the bound's shape, and the coupling is already visible in the shipped code.

Two headroom fractions exist because two delivery mechanisms exist. `BUNDLE_HEADROOM_FRACTION` is 0.80 and bounds what one activity's *push* may spend; `BATCH_HEADROOM_FRACTION` is 0.35 and bounds what a run's *pull plus push* may accumulate. `src/config.ts:96-105` states the dependency outright: the batch fraction is its own setting "because it answers a different question from `bundleHeadroomFraction`: that one asks how much of a window one activity may spend on inlined step techniques, and at 0.80 the arithmetic admits thirteen of the main workflow's fifteen activities into a single context."

Go to full push (D3's opposite) and the two questions become one question, because there is no pull left to accumulate — the eager budget *is* the run budget, and 0.35 and 0.80 must reconcile into one number. CF-1 measures what that number would have to be: at 0.80 with the cap lifted, scope 1 terminates at 644,177 characters, **80.5% of a 200,000-token window**, leaving nothing for the worker's reasoning, code reads and drafts. Full push is only coherent at the *batch* fraction, which means eager bundling's 0.80 must fall to something near 0.35 — a 56% cut to the setting that currently governs how much of an activity may be inlined.

The reverse holds too. Go to a single limit (D2's opposite) while keeping pull, and the cap disappears; CF-7 shows the character budget then stops binding above 557,618 declared tokens, so the single limit must be expressed in something the server can meter across a whole run. The only such quantity is total delivery — which is the push design's natural unit and the pull design's awkward one, since pull discovers its own size as it goes.

So: **you cannot choose the delivery mechanism and the bound's shape independently.** Push forces one limit denominated in composed bytes and forces the two headroom fractions to merge. Pull forces two limits, because the second one has to stand in for everything the incremental fetches have not yet revealed. The shipped system is the coherent pull corner of that pair. Its weakness is not that it chose wrong — it is that the two fractions the corner requires were calibrated against a benchmark that measures only the push half, and CF-2 measures how far that put them out.

---

## 6. What to measure next, in order

1. **Wire the two batch settings into `tests/e2e/harness.ts:36-43`.** Nothing else on this list is measurable until this lands, and it is a four-line change to a config literal. Everything in CF-1, CF-2 and CF-7 is currently modelled solely because of this omission.
2. **Add a lazy-fetch arm to `bench:batch`.** It measures 43.6% of charged delivery and the calibration in `docs/dispatch_model.md` rests on it. Reusing `run-token-benchmark.ts:452-474`'s probe logic makes the batch benchmark measure what the bound charges.
3. **Record `context_tokens` on `activity_dispatched`.** One field at `src/utils/dispatch.ts:52-59`. It makes the realised-fraction-of-window of CF-3 computable on every real run, and it puts the budget's sole input into the evidence base the docs say a revision needs.
4. **Fix the dead anchor and re-record the fixture.** 12 of 162 resource calls per gated run request `review-mode#consolidated-review-format`, which does not exist. Then reduce `HOT_RESOURCES` to anchors the corpus links, and re-measure the gate's per-file sensitivity to remove the 12:1 lever.
5. **Then, and only then, move the cap.** The measurements say the value is worth one dispatch at 200,000 declared tokens and three at 1,000,000 — but which of those the fleet is in is not currently knowable, because the window each worker declares is not recorded anywhere.

---

## Appendix — measured figures, this session

Both walks: work-package, `skipOptionalPolicy`, robot walker, 12-activity recorded path, single scope `bench-solo`.

| | `context_mode: fresh` | `context_mode: persistent` |
|---|---:|---:|
| Tool calls | 242 | 203 |
| `get_activity` | 12 calls / 520,075 chars | 12 / 623,884 |
| `get_resource` | 162 / 527,683 | 123 / 91,591 |
| `get_technique` | 24 / 146,205 | 24 / 67,608 |
| `get_workflow` | 1 / 108,356 | 1 / 108,356 |
| Total delivery | **1,302,319** | **891,439** |
| Charged by `deliveredChars` | **1,192,302** | **835,960** |
| yield / respond / resume | 10 / 10 / 10 | 10 / 10 / 10 |
| Unchanged answers | 0 resource, 0 technique | — |
| Distinct resource ledger keys | 77 | — |

Server-side wall clock, fresh walk, 9,264.2 ms total: `get_resource` 5,410.8 (162 calls, 33.4 ms each), `get_technique` 1,401.3 (24, 58.4), `get_activity` 1,088.5 (12, 90.7), `next_activity` 441.0, `respond_checkpoint` 358.2, `yield_checkpoint` 344.3, `start_session` 89.4, `get_workflow` 77.2, `resume_checkpoint` 53.5. One dispatch at the measured 87-second spawn cost is **9.4× the entire server-side cost of the whole 12-activity walk**. The critical path is spawns and agent turns; delivery composition is not on it.

`bench:batch`, default three-activity run, today: per-activity 233,073 chars / 3 contexts / 412.5 ms; batched 159,212 / 1 context / 341.6 ms; 31.7% saved; 2 dispatches avoided. Fan-out on that run: 28 operations, 72 rule entries, 293 inherited I/O items, `ruleReachPct` 8.3, `inheritedIoReachPct` 14.7.

Resource repeats, fresh walk — every repeated id is a `HOT_RESOURCES` member: `review-mode` 12 fetches / 254,868 chars, `pr-description` 12 / 77,700, `pr-description#link-row-forms` 13 / 17,524, `pr-description#template-final` 13 / 17,511, `pr-description#template-initial` 13 / 12,610, `review-mode#review-type-selection` 12 / 4,356. All 71 corpus-driven fetches are singletons totalling 142,005 chars.
