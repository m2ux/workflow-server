# Development Guide

Setting up, building and testing the workflow server.

## What you need

Node.js 18 or later, npm, and Git.

## Getting a working checkout

The workflow definitions are a submodule of this repository, so cloning the server on its own leaves `workflows/` empty and every corpus guard with nothing to measure. Take both:

```bash
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
git submodule update --init --recursive
npm install
```

A linked worktree needs the same two things and starts with neither. `npm run worktree:provision` supplies them — see [running guards in a worktree](#running-guards-in-a-worktree).

## Commands

```bash
npm run typecheck     # type check
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
| `schemas/` | JSON Schemas generated from the Zod sources, for editor tooling |
| `scripts/` | Install and container helpers, schema generation, the corpus guards, and the benchmarks |
| `tests/` | The test suite, with the end-to-end walks under `tests/e2e/` |
| `workflows/` | A worktree of the `workflows` branch: one directory per workflow, each with `workflow.yaml`, `activities/`, `techniques/` and `resources/` |
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
| `WORKFLOW_DIR` | `./workflows` | Path to workflow directories (`--workflow-dir` takes precedence) |
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
node dist/index.js --workspace=~/work --workflow-dir=./workflows

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

Two things about the suite are worth knowing before changing anything in it. Several corpus guards run as Vitest tests as well as under `check:all`, so a guard finding fails `npm test` too. And the end-to-end walks are snapshotted against a specific corpus commit, which is why a submodule bump and a re-baseline belong in the same change — see [Corpus-coupled baselines](#corpus-coupled-baselines) below.

### Test infrastructure

- **Framework:** [Vitest](https://vitest.dev/)
- **MCP Testing:** Uses `InMemoryTransport` for integration tests
- **Schema Validation:** Tests all Zod schemas with valid/invalid inputs

### Dispatch overhead benchmark

[`scripts/run-dispatch-benchmark.ts`](../scripts/run-dispatch-benchmark.ts) (`npm run bench:dispatch`) prices a **re-dispatch**, where `bench:token` prices a session mode. For each sampled activity it runs two passes against the same worker `agent_id` — a fresh spawn (full delivery) and the same context resumed (`bundle: "reference"`) — fetching the activity payload plus every step-bound technique in both, so the pair is what a second cold dispatch would pay against what reusing the context pays. Figures come from the server's own `activity_dispatched` / `technique_fetched` / `technique_bundled` / `resource_fetched` events, so `chars` is the server's accounting and not the script's estimate.

Stdout is one JSON object with per-activity fresh/resume characters and the aggregate `savingPct`; stderr carries a one-line summary and names any activity that failed to record a fresh/resume dispatch pair. `--gate --min-saving-pct=<n>` turns the saving into an exit-3 gate.

### Token delivery benchmark

[`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts) measures payload-char and history/ledger cost for a fixed headless walk (`work-package` / e2e `skip-optional`), comparing `context_mode: fresh` vs `persistent` and resource reference delivery. It reuses the e2e harness/walker and probes `get_resource` for linked + hot templates (the robot walker does not call `get_resource` on its own).

By default each run compares against the committed baseline in
[`scripts/fixtures/token-benchmark-baseline.json`](../scripts/fixtures/token-benchmark-baseline.json).
The fixture records its own context mode, corpus revision and recording date, so read the
provenance there rather than from this page. Stderr prints a
compact scorecard; stdout JSON includes `vsReference` with absolute and percent deltas
and a **deliveryCostIndex** (baseline = 100, lower is better — the sum of activity,
workflow, resource and technique characters).

#### The gate runs on every pull request

The [Verify](../.github/workflows/verify.yml) workflow runs `--gate` at the 1% default
against the pinned corpus. No guard can measure this, because delivery cost is a
property of a walk rather than of a file — so until the job existed, delivery rose
31.3% in 32 days with nothing reporting it.

**A definition change that adds delivery fails the gate, and that is the gate working.**
Pricing corpus growth at merge is the point. When the increase is wanted:

1. Confirm it — a new activity or a widened contract legitimately costs characters.
2. Re-record the fixture from a `--no-compare` run on the same corpus commit, in the
   same commit as the change.
3. Say in the fixture's `description` what the corpus gained for the characters.

A fixture recorded against a different corpus makes ordinary authoring read as a
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
WORKFLOWS_DIR=/path/to/workflows npm run --silent bench:token -- \
  --label=AFTER --context-mode=fresh --gate --max-regression-pct=1

# Re-record the baseline (same corpus commit as the change that moved it)
npm run --silent bench:token -- --label=baseline --context-mode=fresh --no-compare

# Supplementary: the reference-delivery win. Banner-warned as cross-mode, not a gate.
npm run --silent bench:token -- --label=opt --context-mode=persistent

# Absolute metrics only
npm run --silent bench:token -- --label=raw --context-mode=persistent --no-compare
```

Pin `WORKFLOWS_DIR` to the corpus the fixture names (`workflowsRev`) for a gate run
— a delta measured against a different corpus is not attributable to server code,
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

Which activity that is comes off the session the transitions name, not a flag: a session index that never carries a meta activity belongs to the client workflow, and by the `next_activity` contract the first call against it names that workflow's `initialActivity`. Every client workflow in the corpus opens on a different id, so the profiler discovers the opener — and reports it — rather than being told it. The rule also holds on a run that abandons one meta session and starts another before dispatching.

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

The set of guards is [`scripts/guards.ts`](../scripts/guards.ts). Adding an entry there enforces the
guard in `check:all`, in `check:delta`, and in CI — nothing else needs editing. Each guard is still
runnable on its own (`npm run check:binding`, `npm run check:refs`, …) and reports through one
protocol ([`scripts/guard-protocol.ts`](../scripts/guard-protocol.ts)):

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

`check:delta` resolves the merge-base, materialises it in a throwaway worktree with the `workflows`
submodule pinned to the commit *that* tree recorded, runs the registry against both trees, and
reports only the difference — including what your change fixed. Nothing is stored, so nothing drifts.
Base results are cached under `.guard-cache/` keyed by (base commit, base corpus commit), so the
doubled runtime is paid once per rebase.

Guards that speak `--json` give a precise per-finding delta; the rest are compared by exit code and
by new output lines. That is the reason to move a guard onto the finding protocol when its output
starts mattering.

### Corpus debt

Two guards report debt the corpus carries from before they existed, triaged once per finding with a
named rationale. [`scripts/triage.ts`](../scripts/triage.ts) holds the verdicts and the reporting
rules; each guard names its own ledger —
[`scripts/binding-fidelity-triage.json`](../scripts/binding-fidelity-triage.json) for `check:binding`,
[`scripts/activity-variable-triage.json`](../scripts/activity-variable-triage.json) for
`check:activity-variables`:

| Verdict | Guard behaviour |
|---------|-----------------|
| `harmless` | correct by design — suppressed |
| `fix-later` | real debt — suppressed, but counted in the summary line |
| `live-bug` | **reported**, so the guard stays red until it is fixed |

A finding absent from the file is *untriaged* and reported; an entry matching nothing is *stale* and
reported. There is no `--update-baseline`: a verdict is a human judgement, which is exactly what the
retired baselines let a regenerate flag skip. `--emit-untriaged` on either guard prints the findings
still needing one.

`check:review-mode` follows the same shape with a smaller list —
`ACCEPTED_HEADLESS_AUTO_ADVANCE` in [`scripts/check-review-mode-gating.ts`](../scripts/check-review-mode-gating.ts),
one reason per accepted checkpoint.

### Running guards in a worktree

A fresh worktree has an empty `workflows/` and no `node_modules`, so the guards and the suite cannot
measure the edits that live there:

```bash
npm run worktree:provision            # this worktree
npm run worktree:provision -- <path>  # another one
```

It checks out the submodules the worktree records and makes `node_modules` resolvable. Idempotent.

### Enforcement

[`.github/workflows/verify.yml`](../.github/workflows/verify.yml) runs `npm run typecheck`,
`npm run test:ci`, and `npm run check:all` on every pull request, against the corpus commit the tree
under review adopts. That tree is the merge of the branch into its base, so the corpus is the base's
whenever the base moved the submodule and the branch did not — and the branch's baselines were then
recorded against a different one.
[`.github/actions/workflows-corpus`](../.github/actions/workflows-corpus/action.yml) checks the two
gitlinks agree before either job measures anything, so that case fails saying to merge and
re-baseline rather than reporting corpus drift as a code regression.
Guards that also run as Vitest tests (`tests/binding-fidelity.test.ts`,
`tests/technique-template.test.ts`, `tests/fragments-guard.test.ts`, `tests/audience-guard.test.ts`,
`tests/review-mode-gating.test.ts`, `tests/identifier-qualification.test.ts`) fail `npm test` too.

### Corpus-coupled baselines

The walk snapshots in `tests/e2e/__snapshots__/` describe a path through the corpus, so they are only
meaningful against the corpus that produced them. `tests/e2e/__snapshots__/corpus-sha.json` records
that commit, and a mismatch fails with both SHAs named — so corpus drift reads as corpus drift rather
than as six unrelated regressions. Bump it in the same commit that bumps the submodule:

```bash
npm run test:ci -- -u      # re-baseline the walk
npm run baseline:stamp     # record the corpus commit it was baselined against
```

The stamp is a file describing the provenance of sibling files, and a merge takes each file from
whichever side last touched it. A branch that leaves both alone therefore inherits its base's stamp
while keeping its own baselines, and the two agree with the base's corpus while describing another —
which is what the gitlink check in CI is for.

How little a corpus bump has to change to move a walk is worth knowing. Replacing `value: true` with
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
npm run sessions:census -- --workflow work-package --status running --list
```

Zero means the edit reaches nothing in flight. A non-zero count is the set of runs that will pick it
up, and the `--list` output names each one's folder, recorded version and current activity.

## The two branches

Server code lives on `main`. The workflow definitions — the YAML, the techniques and the resources — live on `workflows`, an orphan branch with a history of its own, which the main tree carries as a submodule at `workflows/`.

### Working on the definitions

The submodule is a checkout of that branch, so edit the definitions in place and commit them there:

```bash
git submodule update --init --recursive   # first time, and after a pull moves the pointer
cd workflows
git pull origin workflows
# edit definitions
git add -A
git commit -m "Describe the definition change"
git push origin workflows
```

A definition change lands as two commits: one on the `workflows` branch, and one on `main` moving the submodule pointer to it. The guards and the end-to-end walks both read that pointer, so the two belong in the same pull request — [corpus-coupled baselines](#corpus-coupled-baselines) covers what happens when they separate.

## Adding a workflow

Create a directory under `workflows/{workflow-id}/` with a `workflow.yaml` in it, then check it before committing:

```bash
npx tsx scripts/validate-workflow-yaml.ts <path>
npm run check:refs
npm run check:binding
```

The first validates the definition against the schema. The other two confirm that every technique reference resolves and that no binding has drifted.

## Adding a resource

A resource is a slug-named markdown file under a workflow's `resources/` directory, and that slug is the id techniques refer to it by — the frontmatter `name:` matches it. Nothing registers it: the server discovers resources by reading the directory, so creating the file is the whole of the work. A technique in another workflow reaches it through the prefixed form `{workflow}/{slug}`.

## Adding a technique

A technique is a markdown file under a `techniques/` directory. Put it in the `meta` workflow when every workflow should have it, or in one workflow's own directory when only that workflow does — a workflow-local technique shadows a `meta` one of the same name. A technique may hold nested techniques in a folder of its own, and a nested technique is addressed by appending its slug to the parent's path. Like resources, techniques are discovered by reading the directory.

### What a technique file contains

- YAML frontmatter carrying the version.
- **`## Capability`** — what the technique does.
- **`## Inputs`** and **`## Outputs`**, both optional. Each `###` entry may carry `####` sub-sections for its components, plus the reserved `#### artifact`, naming the file an output persists to, and `#### default`, giving an input's default.
- **`## Protocol`** — the ordered procedure, written either as `### N. Title` blocks or as a flat list, with failure handling inline in the step that gives rise to it.
- **`## Rules`** — the constraints the technique enforces.

### How a technique is addressed

Techniques are addressed by `::`-delimited paths — `[workflow::]technique[::nested…]` — and a reference within a single workflow omits the workflow segment. The slash form `{workflow}/{technique}` normalises to the same thing. Resolution reads the workflow from the session, looks in that workflow's own directory first, and falls back to the shared `meta` layer. [Technique and resource resolution](resource-resolution-model.md) has the full rules.
