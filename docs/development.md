# Development Guide

Setting up, building and testing the workflow server.

## What you need

Node.js 18 or later, npm, and Git.

## Getting a working checkout

The workflow definitions live on the `workflows` branch. Cloning the server on its own leaves `.worktrees/workflows` absent: `typecheck` and `test:ci` still pass (live-corpus tests skip), and every corpus guard has nothing to measure. Take both:

```bash
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
git worktree add .worktrees/workflows workflows
npm install
```

A linked worktree needs the same two things and starts with neither. `npm run worktree:provision` supplies them — see [running guards in a worktree](#running-guards-in-a-worktree).

## Commands

```bash
npm run typecheck     # type check: server source, then guards + tests + scripts
npm run build         # production build
npm run dev           # hot reload via tsx, stdio transport
npm run dev:http      # hot reload over HTTP
npm run start:http    # production HTTP entry point
```

## Project structure

The directories, and what each one owns:

| Path | Contents |
|------|----------|
| `src/index.ts` | Entry point: read config, then hand off to the transport it selects |
| `src/server.ts` | MCP server creation, and the registration of every tool and resource |
| `src/config.ts` | `ServerConfig` — the resolved roots, transport, port, and the delivery-budget settings |
| `src/transports/` | One module per transport, each owning its own connect, listen and shutdown lifecycle |
| `src/middleware/` | Request id, per-request logging and the shared JSON error body — HTTP only, no footprint on the stdio path |
| `src/schema/` | The Zod schemas everything is validated against, plus the identifier rules and the `when` expression evaluator |
| `src/loaders/` | Filesystem to validated object: workflows, techniques, resources, schemas, and the `::` reference resolver |
| `src/tools/` | The MCP tool implementations, split between `workflow-tools.ts` and `resource-tools.ts` |
| `src/utils/` | Session storage and sealing under `session/`, plus delivery accounting, batching, validation and variable seeding |
| `src/trace.ts` | The trace store and the encoding of trace tokens |
| `schemas/` | JSON Schemas for editor tooling. Six are generated from their Zod sources by `npm run build:schemas`; `technique.schema.json` is hand-authored, and `check:schemas` holds both facts |
| `scripts/` | Install and container helpers, schema generation, and the benchmarks |
| `guards/` | Check programs, the guard registry, and corpus-root resolution. Overview: [`guards/README.md`](../guards/README.md). |
| `tests/` | The test suite, with the end-to-end walks under `tests/e2e/` and fixture corpora under `tests/fixtures/` |
| `workflows/` | A worktree of the `workflows` branch. Product definitions live under `corpus/`; discovery walks that grouping and does not search sibling folders. A `workflow.yaml` at any depth under `corpus/` is a workflow; grouping folders organise the tree and name nothing. A workflow's id is its directory name. Layout authoring lives at `workflows/docs/`. |
| `docs/` | This documentation |

For anything finer-grained than a directory, read the directory — a file list in prose goes stale the first time someone splits a module.

## Environment variables

Root binding (one of workspace path **or** `--repo` is required at startup):

| Variable / flag | Default | Description |
|-----------------|---------|-------------|
| `--workspace=PATH` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT` | — | Explicit workspace / worktree root (legacy single-root: planning under this path) |
| `--repo=owner/repo` / `WORKFLOW_SERVER_REPO` | — | Bind `$HOST_PROJECTS_ROOT/<repo>/.worktrees` and `$HOST_PROJECTS_ROOT/<repo>/.engineering` |
| `--install-dir=PATH` / `WORKFLOW_SERVER_INSTALL_DIR` | `~/.local/share/workflow-server` (or `$XDG_DATA_HOME/workflow-server`) | Install root used with `--repo` |
| `WORKFLOW_SERVER_ENGINEERING_DIR` | equals workspace when unbound; multi-root Docker: `$HOST_PROJECTS_ROOT` | Engineering multi-root or single eng checkout used for planning / session files |
| `PLANNING_SLUG` | `.engineering/artifacts/planning` (legacy) or `artifacts/planning` (repo / engineering-root mode) | Relative planning dir under the engineering root |

Other process config:

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_DIR` | `.worktrees/workflows` of the primary checkout | Path to workflow directories (`--workflow-dir` takes precedence) |
| `SCHEMAS_DIR` | `./schemas` | Path to JSON Schema files |
| `SERVER_NAME` | `workflow-server` | Server name in health check |
| `SERVER_VERSION` | `2.1.0` | Server version in health check |
| `TRANSPORT` | `stdio` | Transport to start (`stdio` or `http`); `--transport` takes precedence |
| `PORT` | `3000` | Port the HTTP transport listens on; ignored under stdio; `--port` takes precedence |
| `HOST` | `localhost` | Host the HTTP transport binds to; ignored under stdio; `--host` takes precedence |
| `BUNDLE_HEADROOM_FRACTION` | `0.8` | Eager step-technique bundling headroom on `get_activity` |
| `BUNDLE_CHARS_PER_TOKEN` | `4` | Token→character factor for bundling budget |

Examples:

```bash
# Legacy single-root (workspace == engineering for planning)
node dist/index.js --workspace=~/work --workflow-dir=.worktrees/workflows

# Per-repo layout (after install.sh + checkout under HOST_PROJECTS_ROOT + deploy.sh)
node dist/index.js --repo=m2ux/workflow-server --transport=http

# HTTP defaults from npm
npm run start:http   # or: node dist/index.js --transport=http --port=3000 --host=localhost
```

The install sequence these settings fit into is in [setup.md](../setup.md), and what differs between the two transports is covered in [http.md](../http.md) and [stdio.md](../stdio.md).

## Testing

### Running tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once (no watch)
npm test -- --run

# Run specific test file
npm test -- --run tests/mcp-server.test.ts

# Run one directory
npm test -- --run tests/e2e
```

Coverage needs `@vitest/coverage-v8`, which is not a dependency of this repository — install it before passing `--coverage`.

### Test suites

The suite is large enough that naming its files here would go stale faster than it helps. `tests/` holds the unit and integration suites, `tests/e2e/` holds the end-to-end walks through the workflow corpus, and `npm test -- --run` prints the live inventory with the pass and fail counts.

Two things about the suite are worth knowing before changing anything in it. Several corpus guards run as Vitest tests as well as under `check:all`, so a guard finding fails `npm test` too when a live corpus is present. Live-corpus tests skip when `workflows/` is missing. The end-to-end walks are snapshotted against a specific corpus commit under `walks/` of that tree, which is why a re-baseline and a stamp belong in the same change on the `workflows` branch — see [Corpus-coupled baselines](#corpus-coupled-baselines) below.

### Test infrastructure

- **Framework:** [Vitest](https://vitest.dev/)
- **MCP Testing:** Uses `InMemoryTransport` for integration tests
- **Schema Validation:** Tests all Zod schemas with valid/invalid inputs

### Dispatch overhead benchmark

[`scripts/run-dispatch-benchmark.ts`](../scripts/run-dispatch-benchmark.ts) (`npm run bench:dispatch`) prices a **re-dispatch**, where `bench:token` prices a session mode. For each sampled activity it runs two passes against the same worker `agent_id` — a fresh spawn (full delivery) and the same context resumed (`bundle: "reference"`) — fetching the activity payload plus every step-bound technique in both, so the pair is what a second cold dispatch would pay against what reusing the context pays. Figures come from the server's own `activity_dispatched` / `technique_fetched` / `technique_bundled` / `resource_fetched` events, so `chars` is the server's accounting and not the script's estimate.

Stdout is one JSON object with per-activity fresh/resume characters and the aggregate `savingPct`; stderr carries a one-line summary and names any activity that failed to record a fresh/resume dispatch pair. `--gate --min-saving-pct=<n>` turns the saving into an exit-3 gate.

### Token delivery benchmark

[`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts) measures payload-char and history/ledger cost for a fixed headless walk (the e2e `skip-optional` policy), comparing `context_mode: fresh` vs `persistent` and resource reference delivery. It reuses the e2e harness/walker and probes `get_resource` for linked + hot templates (the robot walker does not call `get_resource` on its own).

By default each run compares against the committed baseline in
[`tests/fixtures/token-benchmark-baseline.json`](../tests/fixtures/token-benchmark-baseline.json).
Engine CI walks `delivery-fixture` under `tests/fixtures/token-bench`. The fixture records its own
context mode and recording date, so read the provenance there rather than from this page. Stderr prints a
compact scorecard; stdout JSON includes `vsReference` with absolute and percent deltas
and a **deliveryCostIndex** (baseline = 100, lower is better — the sum of activity,
workflow, resource and technique characters).

#### What the fixture is shaped to separate

A delivery carries two things: the role contract, identical whichever activity a worker is
dispatched for, and the activity's own body and step techniques, which vary. A walk of
similarly-sized activities reports one number for both, so a change that moves only the fixed
share is indistinguishable from one that moves only the variable share.

`delivery-fixture` therefore holds one activity at each end of the scale — `minimal`, one step
binding one small operation, and `large`, four steps binding a group of four. Each `get_activity`
is recorded under `activityDeliveries` as `roleContract` (the server's own `worker_bundle_chars`,
echoed on `_meta.delivery_cost`) and `activityBody` (the remainder), and the two are summed into
`roleContractChars` and `activityBodyChars`, which the scorecard prints under `get_activity chars`.
The contract arrives whole on the first delivery and collapses to markers on the second, so the
two rows read as the fixed share and the variable share in turn.

#### The contract the fixture is priced against is derived, not checked in

The client workflow is authored under `tests/fixtures/token-bench/`. The `meta` namespace it
resolves its role contract from is built by
[`tests/token-bench-corpus.ts`](../tests/token-bench-corpus.ts), which `--fixture-corpus`
materialises into a temp root: a technique at every ref the lists in
[`src/loaders/core-ops.ts`](../src/loaders/core-ops.ts) name, under a root contract the operations
inherit and a contract per group.

A checked-in namespace owing that is a mirror of an engine constant — kept true by hand, and by a
test whose only job is to police the copy. Deriving it removes both: a ref added to `core-ops.ts`
reaches the gate with no fixture to edit, and the two cannot disagree. What the stand-ins say is
deliberately not the corpus's own prose, because a reading taken here prices how the engine
*delivers* a contract rather than what any contract says; uniform bodies measure that at least as
honestly as varied ones, and they are reproducible, which a recorded baseline requires.

#### The gate runs on every pull request

The [Verify](../.github/workflows/verify.yml) workflow runs `--gate` at the 1% default
against `delivery-fixture` under `tests/fixtures/token-bench`. No guard can measure this, because
delivery cost is a property of a walk rather than of a file.

**A change that adds delivery on that fixture fails the gate, and that is the gate working.**
When the increase is wanted:

1. Confirm it — a new activity or a widened contract legitimately costs characters.
2. Re-record the fixture from a `--no-compare` run on the same walk, in the
   same commit as the change.
3. Say in the fixture's `description` what the walk gained for the characters.

A fixture recorded against a different workflow makes ordinary authoring read as a
regression, which is how a gate stops being run at all.

#### A persistent-only comparison is not a valid ship gate

The fixture records a **context mode** (`contextMode`) and the comparison records
whether the run matched it (`vsReference.modeMatched`). A cross-mode comparison —
fresh reference against a persistent run — still reports, but is banner-warned and
can never pass `--gate`, because the delta conflates the mode switch with the code
change: the July 2026 gate attributed −40.2% to the mode switch alone in its own
ablation, and a +24.5% `get_activity` regression on the only mode production uses
was invisible to it ([#322](https://github.com/m2ux/workflow-server/issues/322)).

**Every delivery-path change must be gated on a fresh-mode arm**: run the same
`--context-mode=fresh` walk before and after, against the same corpus, and gate on
the total-delivery-chars delta. A persistent-mode run is a supplementary
measurement of the reference-delivery win, never the gate.

```bash
# Fresh-mode ship gate (the required arm). Fails with exit 3 above the threshold.
npm run --silent bench:token -- \
  --workflow=delivery-fixture --fixture-corpus --label=AFTER --context-mode=fresh --gate --max-regression-pct=1

# Re-record the baseline (same walk as the change that moved it)
npm run --silent bench:token -- \
  --workflow=delivery-fixture --fixture-corpus --label=baseline --context-mode=fresh --no-compare

# Supplementary: the reference-delivery win. Banner-warned as cross-mode, not a gate.
npm run --silent bench:token -- --label=opt --context-mode=persistent

# Absolute metrics only
npm run --silent bench:token -- --label=raw --context-mode=persistent --no-compare
```

Pin `WORKFLOWS_DIR` to the tree the fixture walked for a gate run
— a delta measured against a different workflow is not attributable to server code,
and the scorecard warns when the two disagree.

Stderr: compact scorecard, plus a `gate: PASS|FAIL` line under `--gate`. Stdout: one JSON object (`getActivityChars`, `getResourceChars`, unchanged-marker counts, ledger keys, tool-call totals, optional `vsReference` and `gate`). Exit `2` if the walk does not complete, `3` on gate failure. See [Reference delivery](resource-resolution-model.md#reference-delivery) for the contract under test.

### Run profiler

[`scripts/run-profile.ts`](../scripts/run-profile.ts) (`npm run profile:run`) profiles a **real run already on disk**, where the two benchmarks above price the server's delivery on a synthetic walk. It reads a session transcript and the worker transcripts stored beside it, places the startup milestones on a timeline, and reports token usage split between the orchestrator's main context and each worker's context.

```bash
npm run profile:run -- --session=03e43af3
npm run profile:run -- --session=03e43af3 --session=f5783c2a --json
npm run profile:run -- --transcript=~/.claude/projects/<slug>/<session-id>.jsonl --window=full
```

`--session` resolves an id or id-prefix under `--projects-dir` (default `~/.claude/projects`); `--transcript` takes a path. Both are repeatable. `--window=startup` (the default) runs from the first record to the point the client workflow's opening activity is reported done. `--json` puts the whole profile on stdout in place of the text report.

Which activity that is comes off the session the graph leads to, not a flag: a session index that never carries a meta activity belongs to the client workflow, and by the `next_activity` contract the first call against it names that workflow's `initialActivity`. Every client workflow in the corpus opens on a different id, so the profiler discovers the opener — and reports it — rather than being told it. The rule also holds on a run that abandons one meta session and starts another before dispatching.

The two token columns are scoped differently, on purpose. Main-context figures cover the orchestrator turns inside the window. A worker joins on its **dispatch** time, and its whole ledger comes with it — a dispatch made to do startup work costs what it costs, even when its last turn lands after the milestone. Worker turns are read from the `subagents/` directory beside the transcript; when a transcript instead carries them inline and has no such directory, the profile sets `workerTurnsUnread` and the report says the worker figures are unread rather than zero.

#### A usage figure belongs to a response

The harness writes one transcript record per content block of a response and repeats the same usage object on every one of them, so `requestId` — not the record — is the unit a figure attaches to. The profiler reduces each field across a response's records: the maximum, which is the shared value for the cache and input counters and the terminal count for `output_tokens`, whose earlier streaming partials report single digits.

Every total is reported beside `recordSummed`, what a summation over records yields for the same span, and their `ratio`. A figure quoted from a per-record count can then be reconciled against a profile rather than merely contradicted by it — over the whole 27 July 2026 run, main and worker context together reconcile at 2.09×, and the worker column across that run's startup window at 2.42× ([#409](https://github.com/m2ux/workflow-server/issues/409)).

## Validating workflows

### One sweep, one registry

```bash
npm run check:all              # every guard, one table, ~1.5s
npm run check:all -- --verbose # plus each guard's own output
npm run check:all -- --corpus-only
npm run check:all -- --only binding-fidelity,refs
npm run check:all -- --root /path/to/worktree/workflows
```

The set of guards is [`guards/guards.ts`](../guards/guards.ts). Adding an entry there enforces the
guard in `check:all` and `check:delta`. Corpus CI (`verify-corpus.yml`) runs the sweep; engine CI
does not. Each guard is still
runnable on its own (`npm run check:binding`, `npm run check:refs`, …) and reports through one
protocol ([`guards/guard-protocol.ts`](../guards/guard-protocol.ts)):

| Exit | Meaning |
|------|---------|
| `0` | clean |
| `1` | findings — printed as `[check] site / detail`, or as JSON under `--json` |
| `2` | **could not measure** — the corpus root was missing, empty, or unreachable |

Exit 2 exists because a guard aimed at a corpus it cannot reach used to walk nothing and report
success. Every corpus guard resolves its root through `requireWorkflowsRoot` (`--root` >
`WORKFLOWS_DIR` > default) and asserts it inspected something before reporting clean.

### Did *my* change cause this?

```bash
npm run check:delta                       # vs the merge-base with origin/main
npm run check:delta -- --base upstream/main
npm run check:delta -- --only binding-fidelity --verbose
```

`check:delta` resolves the merge-base, materialises that engine tree in a throwaway worktree, and
runs the registry against both engine trees pointed at the same `.worktrees/workflows` dest. Nothing is
stored, so nothing drifts. Base results are cached under `.guard-cache/` keyed by (base commit,
corpus HEAD), so the doubled runtime is paid once per rebase.

Guards that speak `--json` give a precise per-finding delta; the rest are compared by exit code and
by new output lines. That is the reason to move a guard onto the finding protocol when its output
starts mattering.

### Corpus debt

`check:binding` reports the corpus's pre-existing binding debt, triaged once per finding in
`ledgers/binding-fidelity-triage.json` of the pointed tree:

| Verdict | Guard behaviour |
|---------|-----------------|
| `harmless` | correct by design — suppressed |
| `fix-later` | real debt — suppressed, but counted in the summary line |
| `live-bug` | **reported**, so the guard stays red until it is fixed |

A finding absent from the file is *untriaged* and reported; an entry matching nothing is *stale* and
reported. There is no `--update-baseline`: a verdict is a human judgement, which is exactly what the
retired baselines let a regenerate flag skip. `npx tsx guards/check-binding-fidelity.ts
--emit-untriaged` prints the findings still needing one.

A ledger is the exception, not the shape a new guard starts from. `check:activity-variables` has
none: each of its findings named a definition defect, and the corpus was fixed rather than
classified.

`check:review-mode` follows the same shape with a smaller list —
`ACCEPTED_HEADLESS_AUTO_ADVANCE` in [`guards/check-review-mode-gating.ts`](../guards/check-review-mode-gating.ts),
one reason per accepted checkpoint.

### Running guards in a worktree

A fresh worktree has no `workflows/` checkout and no `node_modules`, so the guards and the suite cannot
measure the edits that live there:

```bash
npm run worktree:provision            # this worktree
npm run worktree:provision -- <path>  # another one
```

It adds a `workflows` worktree and makes `node_modules` resolvable. Idempotent.

### Enforcement

[`.github/workflows/verify.yml`](../.github/workflows/verify.yml) runs `npm run typecheck`,
`npm run test:ci`, and the fixture delivery gate on every pull request. Live-corpus tests skip when
`workflows/` is absent.
A guard with a Vitest wrapper fails `npm test` as well as its own `check:` script, when a live
corpus is present. The wrappers are the tests under `tests/` that import from `guards/`, which
`grep -rl "from '../guards/" tests/*.test.ts` enumerates; the set grows with the suite, so it is
read rather than listed here.

### Corpus-coupled baselines

The walk snapshots under `walks/` of a corpus checkout describe a path through the definitions, so
they are only meaningful against the corpus that produced them. They live in that corpus, beside the
definitions they record, so the two travel together: a commit that changes a walk re-baselines it in
that commit or the corpus branch's own gate goes red. Re-baseline on the `workflows` branch:

```bash
npm run test:ci -- -u      # re-baseline the walk
```

The same holds for `walks/option-coverage.json`, which records the options no walk is required to
reach. It is read against the definitions beside it, so a definition change that moves an option
updates it in the commit that moves it.

How little a corpus edit has to change to move a walk is worth knowing. Replacing `value: true` with
a description on the action that binds `gitnexus_indexed` left every gate expression in the corpus
untouched and still retired `gitnexus-detect-changes-preflight` from all six walks, because the
walker binds a `set` action only when it carries an explicit value (#479).

The binding-fidelity triage carries the same coupling: its 69 verdicts are judgements about
definitions as they stood at `corpusSha`. The guard prints how far the corpus has moved since,
without failing on it — a verdict usually survives edits elsewhere, and an entry whose finding no
longer occurs is already reported by name as stale.

### Sessions in flight

A definition edit reaches the runs already walking that workflow. Their variable bags were seeded
from the declarations on disk when they opened, so a declaration added since is absent until they
resume: on resume the server seeds what the bag lacks and re-stamps the recorded version. What that
does *not* cover is a run part-way through an activity whose steps changed under it.

Count them before landing:

```bash
npm run sessions:census -- --workflow <id> --status running --list
```

Zero means the edit reaches nothing in flight. A non-zero count is the set of runs that will pick it
up, and the `--list` output names each one's folder, recorded version and current activity.

## The two branches

Server code lives on `main`. The workflow definitions — the YAML, the techniques and the resources — live on `workflows`, an orphan branch with a history of its own. Check that branch out with `git worktree add .worktrees/workflows workflows`.

### Working on the definitions

Edit the definitions in the worktree and commit them on that branch:

```bash
git worktree add .worktrees/workflows workflows   # first time
cd workflows
git pull origin workflows
# edit definitions
git add -A
git commit -m "Describe the definition change"
git push origin workflows
```

A definition change lands on the `workflows` branch. The guards and the end-to-end walks read that checkout — [corpus-coupled baselines](#corpus-coupled-baselines) covers what happens when the snapshots and the definitions separate.

## Authoring definitions

How to add a workflow, resource or technique, and how definition files link, live on the
`workflows` branch under [`docs/`](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md).
In a checkout that holds a `workflows` worktree they are at `workflows/docs/`. The technique file contract
and the schema the server loads stay in this tree: [`technique-protocol-specification.md`](technique-protocol-specification.md),
[`schemas/README.md`](../schemas/README.md).
