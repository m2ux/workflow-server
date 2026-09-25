# Benchmarks

These programs measure how much text the server sends an agent while it works through a workflow, and what a finished run cost in tokens. The contract under test is [reference delivery](../docs/delivery.md#reference-delivery).

- Three benchmarks drive the server over an in-memory transport and change one thing at a time to isolate cause.
- The profiler reads a run that already happened.

Pick the tool that changes the thing you changed: a number from another tool cannot be blamed on your edit.


| Tool                                                     | Command                  | What it varies                                                           |
| -------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| [Token delivery benchmark](run-token-benchmark.ts)       | `npm run bench:token`    | the session mode, over one solo walk                                     |
| [Dispatch overhead benchmark](run-dispatch-benchmark.ts) | `npm run bench:dispatch` | one re-dispatch: a spawn pass against a resume pass of the same activity |
| [Batch benchmark](run-batch-benchmark.ts)                | `npm run bench:batch`    | the batch: the same run walked per activity, then as one context         |
| [Run profiler](../scripts/run-profile.ts)                | `npm run profile:run`    | nothing; it reads a real run off disk                                    |




## Token delivery benchmark

Records payload characters and ledger cost for one walk, under `context_mode: fresh` and `persistent`. It probes `get_resource` for linked and hot templates, because the robot walker does not call `get_resource` on its own.

Each run compares against [fixtures/token-benchmark-baseline.json](fixtures/token-benchmark-baseline.json). Engine CI walks `delivery-fixture` under `tests/fixtures/token-bench`. Context mode and recording date live on the fixture.

- Stderr is a scorecard.
- Stdout is one JSON object: `getActivityChars`, `getResourceChars`, unchanged-marker counts, ledger keys, tool-call totals, and `vsReference` (absolute and percent deltas, and `deliveryCostIndex` — baseline 100, lower is better, the sum of activity, workflow, resource and technique characters).
- Exit `2` when the walk does not complete, `3` on gate failure.


### What the fixture separates

A delivery is a role contract, the same for every activity, plus that activity's body and step techniques. `delivery-fixture` holds one activity at each end of the scale:

- `minimal` — one step, one small operation.
- `large` — four steps, a group of four.

Each `get_activity` is stored under `activityDeliveries` as `roleContract` (`worker_bundle_chars`, echoed on `_meta.delivery_cost`) and `activityBody` (the remainder). Those sum to `roleContractChars` and `activityBodyChars`. The contract arrives whole on the first delivery and collapses to markers on the second, so the two rows are the fixed share and the variable share.

### The priced contract is derived

The client workflow is authored under `tests/fixtures/token-bench/`. [token-bench-corpus.ts](token-bench-corpus.ts), under `--fixture-corpus`, writes a temporary `meta` namespace:

- a technique at every reference [core-ops.ts](../src/loaders/core-ops.ts) names
- a root contract the operations inherit
- a contract per group

A reference added to `core-ops.ts` reaches the gate with no fixture to edit. The stand-in bodies are uniform, so a reading prices how the engine delivers a contract, and a recorded baseline can be reproduced.

### The gate runs on every pull request

[Verify](../.github/workflows/verify.yml) runs `--gate` at the 1% default against `delivery-fixture`. Delivery cost is a property of a walk, so no guard measures it.

When an increase is wanted:

1. Confirm it. A new activity or a widened contract costs characters.
2. Re-record from a `--no-compare` run of the same walk, in the same commit.
3. Say in `description` what the walk gained.

- Pin `WORKFLOWS_DIR` to the tree the fixture walked. The scorecard warns when the run and the reference disagree on workflow.
- The gate compares two fresh-mode walks of that same workflow.
- A persistent-mode run measures the reference-delivery win.
- A cross-mode comparison reports, is banner-warned, and `--gate` refuses it (`vsReference.modeMatched`).

```bash
# Fresh-mode ship gate. Fails with exit 3 above the threshold.
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=AFTER --context-mode=fresh --gate --max-regression-pct=1

# Re-record the baseline, in the same commit as the change that moved it.
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=baseline --context-mode=fresh --no-compare

# The reference-delivery win. Banner-warned as cross-mode.
npm run --silent bench:token -- --label=opt --context-mode=persistent

# Absolute metrics only.
npm run --silent bench:token -- --label=raw --context-mode=persistent --no-compare
```



## Dispatch overhead benchmark

[run-dispatch-benchmark.ts](run-dispatch-benchmark.ts) prices a re-dispatch. For each sampled activity it runs two passes on the same worker `agent_id`, and both fetch the activity payload and every step-bound technique:

- a fresh spawn at full delivery
- the same context resumed under `bundle: "reference"`

What the run reports:

- Characters come from `activity_dispatched`, `technique_fetched`, `technique_bundled`, and `resource_fetched`.
- Stdout is one JSON object: per-activity fresh and resume characters, and `savingPct`.
- Stderr names any activity that missed a pair.
- `--gate --min-saving-pct=<n>` exits `3` below the saving.



## Batch benchmark

[run-batch-benchmark.ts](run-batch-benchmark.ts) walks one run twice. Characters use the same `deliveredChars` rule as [the batch bound](../docs/delivery.md#the-batch-budget).

- a fresh worker context per activity, at full delivery
- one context, with reference delivery after the first activity, which is what the bound admits

Server-side elapsed time lands within a few percent either way. Reference delivery composes every payload and then hashes it, so a batch does slightly more server work to put fewer bytes on the wire. The saving is the bytes and the dispatches.

The harness cost a fresh worker pays is not visible headless:

- system prompt
- project instructions
- tool schemas

The script reports the dispatches a batch avoids and prices them with `--spawn-seconds=<n>`. The default is the mean of the dispatches on a profiled run. Pass a figure measured with [the profiler](#run-profiler).

## Run profiler

[run-profile.ts](../scripts/run-profile.ts) reads a session transcript and the worker transcripts beside it, places startup milestones on a timeline, and splits token usage between the orchestrator's main context and each worker.

```bash
npm run profile:run -- --session=03e43af3
npm run profile:run -- --session=03e43af3 --session=f5783c2a --json
npm run profile:run -- --transcript=~/.claude/projects/<slug>/<session-id>.jsonl --window=full
```

- `--session` resolves an id or prefix under `--projects-dir` (default `~/.claude/projects`). Repeatable.
- `--transcript` takes a path. Repeatable.
- `--window=startup`, the default, runs from the first record until the client workflow's opening activity is reported done.
- `--json` writes the profile to stdout.

The opener is the `initialActivity` of the session the graph leads to. A session index with no meta activity belongs to the client workflow, and the first `next_activity` against it names that opener. The profiler reports the id it found. The same rule holds when a run abandons one meta session and starts another before dispatching.

- Main-context figures are the orchestrator turns inside the window.
- A worker joins at its dispatch, and its whole ledger comes with it.
- Worker turns are read from `subagents/` beside the transcript. When the transcript carries them inline and that directory is absent, the profile sets `workerTurnsUnread` and the report says the worker figures are unread.

The harness writes one transcript record per content block and repeats the same usage object on each. `requestId` is the unit a figure attaches to. Each field is the maximum across the response's records:

- the shared value for cache and input
- the terminal count for `output_tokens`

Every total is reported beside `recordSummed`, the sum over records for the same span, and their `ratio`.