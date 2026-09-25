# Measurement

Each tool prices a different thing, and using the wrong one gives a number that cannot be attributed to the change you made.

| Tool | Command | What it varies |
|------|---------|----------------|
| Token delivery benchmark | `npm run bench:token` | the **session mode**, over one solo walk |
| Dispatch overhead benchmark | `npm run bench:dispatch` | one **re-dispatch** — a spawn pass against a resume pass of the same activity |
| Batch benchmark | `npm run bench:batch` | the **batch** — the same run of activities walked per-activity, then as one context |
| Run profiler | `npm run profile:run` | nothing; it reads a **real run** off disk |

The three benchmarks drive the real server over an in-memory transport, and count characters using the server's own accounting rather than their own estimate. All three measure eager activity payloads and never fetch a technique or resource lazily, so each figure is a **floor**. On real runs the lazy half is usually the larger one.

The contract under test throughout is [reference delivery](delivery.md#reference-delivery).

## Token delivery benchmark

[`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts) measures payload characters and history or ledger cost for a fixed headless walk, comparing `context_mode: fresh` against `persistent`, and resource reference delivery. It reuses the end-to-end harness and walker, and probes `get_resource` for linked and hot templates, because the robot walker does not call `get_resource` on its own.

Each run compares against the committed baseline in [`tests/fixtures/token-benchmark-baseline.json`](../tests/fixtures/token-benchmark-baseline.json). Engine CI walks `delivery-fixture` under `tests/fixtures/token-bench`. The fixture records its own context mode and recording date, so read the provenance there rather than from this page.

Stderr prints a compact scorecard. Stdout is one JSON object carrying `getActivityChars`, `getResourceChars`, unchanged-marker counts, ledger keys and tool-call totals, plus `vsReference` with absolute and percent deltas and a **deliveryCostIndex** — baseline 100, lower is better, summing activity, workflow, resource and technique characters. Exit `2` if the walk does not complete, `3` on gate failure.

### What the fixture is shaped to separate

A delivery carries two things: the role contract, identical whichever activity a worker is dispatched for, and the activity's own body and step techniques, which vary. A walk of similarly sized activities reports one number for both, so a change that moves only the fixed share is indistinguishable from one that moves only the variable share.

`delivery-fixture` therefore holds one activity at each end of the scale — `minimal`, one step binding one small operation, and `large`, four steps binding a group of four. Each `get_activity` is recorded under `activityDeliveries` as `roleContract` (the server's own `worker_bundle_chars`, echoed on `_meta.delivery_cost`) and `activityBody` (the remainder). The two are summed into `roleContractChars` and `activityBodyChars`, which the scorecard prints under `get_activity chars`. The contract arrives whole on the first delivery and collapses to markers on the second, so the two rows read as the fixed share and the variable share in turn.

### The contract it is priced against is derived, not checked in

The client workflow is authored under `tests/fixtures/token-bench/`. The `meta` namespace it resolves its role contract from is built by [`tests/token-bench-corpus.ts`](../tests/token-bench-corpus.ts), which `--fixture-corpus` materialises into a temporary root: a technique at every reference the lists in [`src/loaders/core-ops.ts`](../src/loaders/core-ops.ts) name, under a root contract the operations inherit and a contract per group.

A checked-in namespace would be a mirror of an engine constant, kept true by hand and by a test whose only job is to police the copy. Deriving it removes both: a reference added to `core-ops.ts` reaches the gate with no fixture to edit, and the two cannot disagree.

What the stand-ins say is deliberately not the corpus's own prose. A reading taken here prices how the engine *delivers* a contract rather than what any contract says. Uniform bodies measure that at least as honestly as varied ones, and they are reproducible, which a recorded baseline requires.

### The gate runs on every pull request

The [Verify](../.github/workflows/verify.yml) workflow runs `--gate` at the 1% default against `delivery-fixture`. No guard can measure this, because delivery cost is a property of a walk rather than of a file.

#### When the gate fails

When the increase is wanted:

1. Confirm it. A new activity or a widened contract legitimately costs characters.
2. Re-record the fixture from a `--no-compare` run on the same walk, in the same commit as the change.
3. Say in the fixture's `description` what the walk gained for the characters.

A fixture recorded against a different workflow makes ordinary authoring read as a regression, which is how a gate stops being run at all. Pin `WORKFLOWS_DIR` to the tree the fixture walked: a delta measured against a different workflow is not attributable to server code, and the scorecard warns when the two disagree.

### A persistent-only comparison is not a valid ship gate

The fixture records a context mode (`contextMode`), and the comparison records whether the run matched it (`vsReference.modeMatched`). A cross-mode comparison — a fresh reference against a persistent run — still reports, but is banner-warned and can never pass `--gate`.

The reason is that the delta conflates the mode switch with the code change. An earlier gate's own ablation attributed most of its apparent improvement to the mode switch alone, and a real `get_activity` regression on the only mode production uses was invisible to it ([#322](https://github.com/m2ux/workflow-server/issues/322)).

#### Gate on a fresh-mode arm

Run the same `--context-mode=fresh` walk before and after, against the same corpus, and gate on the total-delivery-characters delta. A persistent-mode run is a supplementary measurement of the reference-delivery win, never the gate.

```bash
# Fresh-mode ship gate — the required arm. Fails with exit 3 above the threshold.
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=AFTER --context-mode=fresh --gate --max-regression-pct=1

# Re-record the baseline, in the same commit as the change that moved it
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=baseline --context-mode=fresh --no-compare

# Supplementary: the reference-delivery win. Banner-warned as cross-mode, not a gate.
npm run --silent bench:token -- --label=opt --context-mode=persistent

# Absolute metrics only
npm run --silent bench:token -- --label=raw --context-mode=persistent --no-compare
```

## Dispatch overhead benchmark

[`scripts/run-dispatch-benchmark.ts`](../scripts/run-dispatch-benchmark.ts) prices a **re-dispatch**. For each sampled activity it runs two passes against the same worker `agent_id` — a fresh spawn taking full delivery, and the same context resumed under `bundle: "reference"` — fetching the activity payload plus every step-bound technique in both. The pair is what a second cold dispatch would pay, against what reusing the context pays.

Figures come from the server's own `activity_dispatched`, `technique_fetched`, `technique_bundled` and `resource_fetched` events, so `chars` is the server's accounting.

Stdout is one JSON object with per-activity fresh and resume characters plus the aggregate `savingPct`. Stderr carries a one-line summary and names any activity that failed to record a fresh and resume pair. `--gate --min-saving-pct=<n>` turns the saving into an exit-3 gate.

## Batch benchmark

[`scripts/run-batch-benchmark.ts`](../scripts/run-batch-benchmark.ts) walks one run of activities twice: once with a fresh worker context per activity taking full delivery, and once as a single context taking reference delivery after the first activity — which is what [the batch bound](delivery.md#the-batch-budget) admits. Delivered characters are counted by the same `deliveredChars` rule the bound applies, so the script cannot report a saving the bound disagrees with.

### Elapsed time is a wash, and that is the finding

Server-side elapsed time lands within a few percent either way of the per-activity pass, noise-dominated at this scale. Reference delivery composes every payload in full and then hashes it to decide what may collapse, so a batch does slightly *more* server work to put fewer bytes on the wire. The saving is the bytes and the dispatches, not the server's time.

### Pricing what headless cannot see

The run-duration saving is the harness's context establishment — the system prompt, project instructions and tool schemas a freshly spawned worker rebuilds before it reads a line of workflow content. Nothing headless can observe that, because there is no agent here to spawn. So the script reports the dispatches a batch avoids and prices them from a per-dispatch spawn cost supplied as a flag rather than an invented one: `--spawn-seconds=<n>`. Its default is the mean of the dispatches on a profiled run; pass your own, measured with [the profiler](#run-profiler), rather than trusting it.

## Run profiler

[`scripts/run-profile.ts`](../scripts/run-profile.ts) profiles a **real run already on disk**, where the three benchmarks price the server's delivery on a synthetic walk. It reads a session transcript and the worker transcripts stored beside it, places the startup milestones on a timeline, and reports token usage split between the orchestrator's main context and each worker's context.

```bash
npm run profile:run -- --session=03e43af3
npm run profile:run -- --session=03e43af3 --session=f5783c2a --json
npm run profile:run -- --transcript=~/.claude/projects/<slug>/<session-id>.jsonl --window=full
```

### Selecting a run and a window

`--session` resolves an id or id prefix under `--projects-dir`, default `~/.claude/projects`; `--transcript` takes a path. Both are repeatable. `--window=startup`, the default, runs from the first record to the point the client workflow's opening activity is reported done. `--json` puts the whole profile on stdout in place of the text report.

### How the opening activity is discovered

Which activity that is comes off the session the graph leads to, not a flag. A session index that never carries a meta activity belongs to the client workflow, and by the `next_activity` contract the first call against it names that workflow's `initialActivity`.

Every client workflow in the corpus opens on a different id, so the profiler discovers the opener and reports it rather than being told it. The rule also holds on a run that abandons one meta session and starts another before dispatching.

### How the two token columns are scoped

Main-context figures cover the orchestrator turns inside the window. A worker joins on its **dispatch** time, and its whole ledger comes with it — a dispatch made to do startup work costs what it costs, even when its last turn lands after the milestone.

Worker turns are read from the `subagents/` directory beside the transcript. Where a transcript carries them inline and has no such directory, the profile sets `workerTurnsUnread`, and the report says the worker figures are unread rather than zero.

### A usage figure belongs to a response

The harness writes one transcript record per content block of a response, and repeats the same usage object on every one of them. So `requestId`, not the record, is the unit a figure attaches to. The profiler reduces each field across a response's records by taking the maximum: the shared value for the cache and input counters, and the terminal count for `output_tokens`, whose earlier streaming partials report single digits.

Every total is reported beside `recordSummed` — what a summation over records yields for the same span — and their `ratio`. A figure quoted from a per-record count can then be reconciled against a profile rather than merely contradicted by it, which is the whole point of reporting both ([#409](https://github.com/m2ux/workflow-server/issues/409)).
