# Development Guide

This guide covers development setup, commands, and testing for the MCP Workflow Server.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git (for worktree setup)

## Setup

```bash
# Clone the repository
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server

# Install dependencies
npm install

# Set up workflow data (worktree for orphan branch)
git worktree add ./workflows workflows
```

## Development Commands

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build for production
npm run build

# Run in development mode (with hot reload via tsx) — stdio default
npm run dev

# Run over HTTP (development / production entry points)
npm run dev:http
npm run start:http
```

## Project Structure

```
workflow-server/
├── src/
│   ├── index.ts              # Entry point: config → dispatch to the transport it selects
│   ├── server.ts             # MCP server creation and tool/resource registration (shared by every transport)
│   ├── config.ts             # ServerConfig: workflowDir, schemasDir, workspaceDir, engineeringDir, repo, installDir, planningRelativeDir, transport, port, host, …
│   ├── transports/           # One module per transport, each owning that transport's connect/listen/shutdown lifecycle
│   │   ├── stdio.ts          # Default transport — unchanged behavior from before dual-transport support
│   │   └── http.ts           # Opt-in transport: Express app, /health + /ready, /mcp (StreamableHTTPServerTransport), graceful shutdown
│   ├── middleware/            # HTTP-only cross-cutting concerns, no footprint on the stdio path
│   │   ├── request-id.ts     # Correlation id generation/propagation
│   │   ├── logging.ts        # Structured per-request log line
│   │   └── error-handler.ts  # Shared { error, message, requestId, timestamp } JSON error body
│   ├── errors.ts             # Custom error classes (WorkflowNotFoundError, etc.)
│   ├── result.ts             # Result<T, E> monad for typed error handling
│   ├── logging.ts            # Structured JSON logging + audit event wrapper (withAuditLog)
│   ├── trace.ts              # TraceStore, TraceEvent, trace token encode/decode
│   ├── schema/               # Zod runtime schemas for validation
│   │   ├── workflow.schema.ts
│   │   ├── activity.schema.ts
│   │   ├── technique.schema.ts
│   │   ├── condition.schema.ts
│   │   ├── state.schema.ts
│   │   ├── resource.schema.ts
│   │   └── common.ts
│   ├── types/                # Re-export layer (types + schemas)
│   ├── loaders/              # File loaders (filesystem → validated objects)
│   │   ├── workflow-loader.ts
│   │   ├── activity-loader.ts
│   │   ├── technique-loader.ts          # Includes resolveTechniques (resolves techniques via :: paths)
│   │   ├── markdown-technique-loader.ts # Parses markdown technique files into Technique objects
│   │   ├── resource-loader.ts
│   │   ├── core-ops.ts       # CORE_ORCHESTRATOR_TECHNIQUES / CORE_WORKER_TECHNIQUES (core technique refs bundled into get_workflow / get_activity)
│   │   ├── schema-loader.ts
│   │   ├── filename-utils.ts
│   │   └── index.ts          # Barrel exports
│   ├── tools/                # MCP tool implementations
│   │   ├── workflow-tools.ts # discover, list_workflows, get_workflow, next_activity, get_activity, yield_checkpoint, resume_checkpoint, present_checkpoint, respond_checkpoint, get_trace, health_check, get_workflow_status
│   │   ├── resource-tools.ts # start_session, dispatch_child, get_technique, get_resource
│   │   └── index.ts          # Tool registration entry point
│   ├── resources/            # MCP resource registration
│   │   └── schema-resources.ts # workflow-server://schemas
│   └── utils/                # Utility functions
│       ├── yaml.ts           # YAML format parser wrapper
│       ├── session.ts        # Session token create/decode/advance (HMAC-SHA256)
│       ├── validation.ts     # Transition, manifest, and activity validation
│       ├── crypto.ts         # AES-256-GCM encryption, HMAC signing
│       └── index.ts          # Barrel exports
├── schemas/                  # JSON Schema files for IDE tooling
│   ├── workflow.schema.json
│   ├── activity.schema.json
│   ├── technique.schema.json
│   ├── condition.schema.json
│   └── state.schema.json
├── scripts/                  # Build, corpus guards, install helpers, benchmarks
│   ├── install.sh            # Local install layout (helpers, workflows, projects/, worktrees/, env)
│   ├── start.sh / stop.sh    # GHCR container runner (loads $INSTALL/env)
│   ├── update-workflows.sh
│   ├── generate-schemas.ts
│   ├── validate-workflow-yaml.ts
│   ├── run-token-benchmark.ts    # Delivery cost per session mode
│   ├── run-dispatch-benchmark.ts # What a re-dispatch costs
│   └── run-profile.ts            # Profiles a real run from its session transcript
├── tests/                    # Test suites
├── workflows/                # Worktree (workflows branch)
│   ├── meta/                 # Bootstrap workflow
│   │   ├── workflow.yaml
│   │   ├── activities/
│   │   └── techniques/
│   └── {workflow-id}/        # Each workflow folder
│       ├── workflow.yaml
│       ├── activities/
│       ├── resources/
│       └── techniques/
└── docs/                     # Documentation
```

## Environment Variables

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

See also [setup.md](../setup.md), [http.md](../http.md), and [stdio.md](../stdio.md).

## Testing

### Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once (no watch)
npm test -- --run

# Run specific test file
npm test -- --run tests/mcp-server.test.ts

# Run with coverage
npm test -- --run --coverage
```

### Test Suites

| Test Suite | Coverage |
|------------|----------|
| `workflow-loader.test.ts` | Workflow loading, transitions, validation |
| `schema-validation.test.ts` | All Zod schemas |
| `schema-loader.test.ts` | JSON Schema loading and serving |
| `mcp-server.test.ts` | All MCP tools, trace lifecycle, activity manifest, technique bundles |
| `activity-loader.test.ts` | Activity loading and dynamic index |
| `technique-loader.test.ts` | Technique loading, dynamic index, technique resolution |
| `session.test.ts` | Token create/decode/advance, sid, aid, parent context |
| `trace.test.ts` | TraceStore, trace token encode/decode |
| `validation.test.ts` | Transition, manifest, condition validation |
| `dispatch.test.ts` | Workflow dispatch, status, parent-child trace correlation |

Run `npm test -- --run` for the live count and pass/fail summary.

### Test Infrastructure

- **Framework:** [Vitest](https://vitest.dev/)
- **MCP Testing:** Uses `InMemoryTransport` for integration tests
- **Schema Validation:** Tests all Zod schemas with valid/invalid inputs

### Dispatch overhead benchmark

[`scripts/run-dispatch-benchmark.ts`](../scripts/run-dispatch-benchmark.ts) (`npm run bench:dispatch`) prices a **re-dispatch**, where `bench:token` prices a session mode. For each sampled activity it runs two passes against the same worker `agent_id` — a fresh spawn (full delivery) and the same context resumed (`bundle: "reference"`) — fetching the activity payload plus every step-bound technique in both, so the pair is what a second cold dispatch would pay against what reusing the context pays. Figures come from the server's own `activity_dispatched` / `technique_fetched` / `technique_bundled` / `resource_fetched` events, so `chars` is the server's accounting and not the script's estimate.

Stdout is one JSON object with per-activity fresh/resume characters and the aggregate `savingPct`; stderr carries a one-line summary and names any activity that failed to record a fresh/resume dispatch pair. `--gate --min-saving-pct=<n>` turns the saving into an exit-3 gate.

### Token delivery benchmark

[`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts) measures payload-char and history/ledger cost for a fixed headless walk (`work-package` / e2e `skip-optional`), comparing `context_mode: fresh` vs `persistent` and resource reference delivery. It reuses the e2e harness/walker and probes `get_resource` for linked + hot templates (the robot walker does not call `get_resource` on its own).

By default each run compares against the frozen pre-optimisation reference
[`scripts/fixtures/token-benchmark-a0-reference.json`](../scripts/fixtures/token-benchmark-a0-reference.json)
(A0: fresh, recorded 2026-07-16 against `workflows@a1409d5b`). Stderr prints a
compact scorecard; stdout JSON includes `vsReference` with absolute/percent deltas
and a **deliveryCostIndex** (A0 = 100, lower is better — sum of activity + workflow
+ resource + technique chars).

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

# Baseline (full redelivery) — expect deliveryCostIndex ≈ 100
npm run --silent bench:token -- --label=A0 --context-mode=fresh

# Supplementary: the reference-delivery win. Banner-warned as cross-mode, not a gate.
npm run --silent bench:token -- --label=opt --context-mode=persistent

# Absolute metrics only
npm run --silent bench:token -- --label=raw --context-mode=persistent --no-compare
```

Pin `WORKFLOWS_DIR` to the corpus the fixture names (`workflowsRev`) for a gate run
— a delta measured against a different corpus is not attributable to server code,
and the scorecard warns when the two disagree.

Stderr: compact scorecard, plus a `gate: PASS|FAIL` line under `--gate`. Stdout: one JSON object (`getActivityChars`, `getResourceChars`, unchanged-marker counts, ledger keys, tool-call totals, optional `vsReference` and `gate`). Exit `2` if the walk does not complete, `3` on gate failure. See [Reference Delivery](resource_resolution_model.md#11-reference-delivery) for the contract under test.

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

## Validating Workflows

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

`check:binding` reports the corpus's pre-existing binding debt, triaged once per finding in
[`scripts/binding-fidelity-triage.json`](../scripts/binding-fidelity-triage.json):

| Verdict | Guard behaviour |
|---------|-----------------|
| `harmless` | correct by design — suppressed |
| `fix-later` | real debt — suppressed, but counted in the summary line |
| `live-bug` | **reported**, so the guard stays red until it is fixed |

A finding absent from the file is *untriaged* and reported; an entry matching nothing is *stale* and
reported. There is no `--update-baseline`: a verdict is a human judgement, which is exactly what the
retired baselines let a regenerate flag skip. `npx tsx scripts/check-binding-fidelity.ts
--emit-untriaged` prints the findings still needing one.

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
under review pins. Guards that also run as Vitest tests (`tests/binding-fidelity.test.ts`,
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

## Branch Structure

| Branch | Content | Purpose |
|--------|---------|---------|
| `main` | TypeScript server code | Implementation |
| `workflows` | YAML workflows + resources | Data (orphan branch) |

### Working with the Workflows Branch

The `workflows` branch is an orphan branch with separate history. Access it via worktree:

```bash
# Add worktree (one-time setup)
git worktree add ./workflows workflows

# Update workflow data
cd workflows
git pull origin workflows

# Commit workflow changes
cd workflows
git add -A
git commit -m "feat: update workflow"
git push origin workflows
```

## Adding New Workflows

1. Create a new directory in `workflows/{workflow-id}/`
2. Create `workflow.yaml` workflow definition in that directory
3. Validate with: `npx tsx scripts/validate-workflow-yaml.ts <path>`, then run `npx tsx scripts/check-all-refs.ts` and `npm run check:binding` to confirm references resolve and no binding drift
4. Commit to the `workflows` branch

## Adding New Resources

Resources are stored in a `resources/` subdirectory within each workflow as slug-named markdown files:

1. Create `{slug}.md` in `workflows/{workflow-id}/resources/`
2. The filename slug is the resource id (the frontmatter `name:` should match)
3. Resources are auto-discovered - no manifest update needed
4. Access via: `get_resource` with the resource slug (referenced from a technique); cross-workflow refs use `{workflow}/{slug}`
5. Commit to the `workflows` branch

Note: For backwards compatibility, the loader also checks the `guides/` folder if `resources/` doesn't exist.

## Adding New Techniques

Techniques are markdown files. They can be **universal** (apply to all workflows, stored in `meta`) or **workflow-specific**. A technique lives at `techniques/{slug}.md`. A technique can contain nested techniques in its folder; a nested technique is itself a technique, addressed by appending its slug to the parent's path.

### Technique File Format

A technique file has:

- **YAML frontmatter** carrying `metadata.version`.
- **`## Capability`** — what the technique does.
- **`## Inputs`** / **`## Outputs`** (optional) — each `### entry` may carry `####` sub-section components, plus the reserved `#### artifact` (output persistence filename) and `#### default` (input default).
- **`## Protocol`** — ordered blocks `### N. Title` with step bullets, or a flat list. Failure handling is written inline in the protocol step that gives rise to it.
- **`## Rules`** — constraints the technique enforces.

### Universal Techniques

Universal techniques are stored in the `meta` workflow's `techniques/` subdirectory:

1. Create `techniques/{slug}.md` under `workflows/meta/`
2. Access via: `get_technique` (workflow- or activity-level first declared technique, optionally a step's technique via `step_id`)
3. Commit to the `workflows` branch

### Workflow-Specific Techniques

Workflow-specific techniques are stored in each workflow's `techniques/` subdirectory:

1. Create `techniques/{slug}.md` in `workflows/{workflow-id}/`
2. Techniques are auto-discovered - no manifest update needed
3. Access via: `get_technique { session_index, step_id: "{step-id}" }` (when referenced by a step)
4. Commit to the `workflows` branch

### Technique Resolution

Techniques are addressed by `::`-delimited paths: `[workflow::]technique[::nested…]`. A same-workflow reference omits the workflow prefix. A `{workflow}/{technique}` slash form is normalized to the `::` form.

When loading a technique, the workflow is determined from the session's `session.json` (resolved via `session_index`):
1. First checks the session's workflow (current-workflow-first)
2. Falls back to the `meta` layer (universal)
