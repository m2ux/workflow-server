# Development guide

Setting up, building and testing the workflow server. Settings the server reads at startup are in [configuration.md](configuration.md); the guard suite is documented beside the guards in [`guards/README.md`](../guards/README.md); the benchmarks and the profiler are in [benchmark/README.md](../benchmark/README.md).

## What you need

Node.js 20, npm, and Git. Continuous integration runs on Node 20.

## Getting a working checkout

The workflow definitions live on the `workflows` branch. Cloning the server on its own leaves `.worktrees/workflows` absent: `typecheck` and `test:ci` still pass, live-corpus tests skipping, and every corpus guard has nothing to measure. Take both:

```bash
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
git worktree add .worktrees/workflows workflows
npm ci
```

A linked worktree needs the corpus checkout and a resolvable `node_modules`, and starts with neither. `npm run worktree:provision` supplies them — see [running guards in a worktree](../guards/README.md#running-guards-in-a-worktree).

## Commands

```bash
npm ci                # install from the lockfile
npm run typecheck     # type check: server source, then guards + tests + scripts
npm run build         # production build
npm start             # production, stdio
npm run start:http    # production HTTP entry point
npm run dev           # hot reload via tsx, stdio transport
npm run dev:http      # hot reload over HTTP
npm test              # watch mode
npm run test:ci       # once
npm run check:all     # every guard
npm run check:delta   # guards against the merge-base
npm run worktree:provision
```

`typecheck` is two compilations and fails on either: `tsconfig.json` over `src/` under the full house style, `tsconfig.tools.json` over guards, tests and scripts under the same strictness with `noPropertyAccessFromIndexSignature` relaxed.

## Dependencies

Installs resolve from the lockfile. CI runs `npm ci`; use it locally too, and `npm install` only when deliberately changing a dependency. When a worktree cannot resolve `node_modules`, provision tells you to run `npm ci` in the primary checkout.

- **New direct dependencies take an exact version.**
- **Known-bad versions** sit in `scripts/known-bad-versions.json`, are held out of resolution by `overrides` in `package.json`, and fail `npm run check:lockfile`. That file says how to refresh it.
- **No blanket `ignore-scripts`** without an allowlist and a green build behind it; native addons need their install hooks.

## Project structure

The directories, and what each one owns:

| Path | Contents |
|------|----------|
| `src/index.ts` | Entry point: read config, then hand off to the transport it selects |
| `src/server.ts` | MCP server creation, and the registration of every tool and resource |
| `src/config.ts` | `ServerConfig` — the resolved roots, transport, port, and the delivery budgets |
| `src/transports/` | One module per transport, each owning its own connect, listen and shutdown lifecycle |
| `src/middleware/` | Request id, per-request logging and the shared JSON error body — HTTP only, no footprint on the stdio path |
| `src/resources/` | MCP resources the server exposes, including `workflow-server://schemas` |
| `src/schema/` | The Zod schemas everything is validated against, plus the identifier rules and the `when` expression evaluator |
| `src/loaders/` | Filesystem to validated object: workflows, techniques, resources, schemas, and the `::` reference resolver |
| `src/tools/` | The tool implementations, split between `workflow-tools.ts` and `resource-tools.ts` |
| `src/utils/` | Session storage and sealing under `session/`, plus delivery accounting, batching, validation and variable seeding |
| `src/trace.ts` | The trace store and the encoding of trace tokens |
| `schemas/` | JSON Schemas for editor tooling. Most are generated from their Zod sources by `npm run build:schemas`; `technique.schema.json` is hand-authored, and `check:schemas` holds both facts |
| `scripts/` | Install and container helpers, and schema generation |
| `benchmark/` | The three headless benchmarks |
| `guards/` | Check programs, the guard registry, and corpus-root resolution — documented in [`guards/README.md`](../guards/README.md) |
| `tests/` | The test suite, with the end-to-end walks under `tests/e2e/` and fixture corpora under `tests/fixtures/` |
| `.worktrees/workflows/` | A worktree of the `workflows` branch — the corpus the server serves |
| `docs/` | This documentation |
| `site/` | The hand-authored documentation site |

For anything finer-grained than a directory, read the directory — a file list in prose goes stale the first time someone splits a module.

Inside the corpus worktree, product definitions live under `corpus/`, and discovery walks that grouping without searching sibling folders. Named roots beside it are `ledgers/`, `walks/`, and `docs/` for layout authoring, at `.worktrees/workflows/docs/`. What makes a directory a namespace, and where the walk stops, is in [resolution](resolution.md#what-a-namespace-is).

## Testing

```bash
npm test                                  # watch mode
npm test -- --run                         # once
npm test -- --run tests/mcp-server.test.ts
npm test -- --run tests/e2e               # one directory
```

Coverage needs `@vitest/coverage-v8`, which is not a dependency of this repository. Install it before passing `--coverage`.

The suite is large enough that naming its files here would go stale faster than it helps. `tests/` holds the unit and integration suites, `tests/e2e/` holds the end-to-end walks through the workflow corpus, and `npm run test:ci` prints the live inventory with the pass and fail counts. Integration tests drive the server over `InMemoryTransport`, and the schema tests exercise every Zod schema with valid and invalid input.

Several corpus guards run as Vitest tests as well as under `check:all`, so a guard finding fails `npm test` too when a live corpus is present. Live-corpus tests skip when `.worktrees/workflows` is missing. The walks record a path through the definitions beside them, which is what the next section is about.

## Corpus-coupled baselines

The walk snapshots under `walks/` of a corpus checkout describe a path through the definitions, so they are only meaningful against the corpus that produced them. They live in that corpus, beside the definitions they record, so the two travel together: a commit that changes a walk re-baselines it in that commit, or the corpus branch's own gate goes red.

```bash
npm run test:ci -- -u      # re-baseline the walk, on the workflows branch
```

The same holds for `walks/option-coverage.json`, which records the options no walk is required to reach. It is read against the definitions beside it, so a definition change that moves an option updates it in the commit that moves it.

How little a definition edit has to change to move a walk is worth knowing. The walker binds a `set` action only when it carries an explicit value, so replacing a `value:` with a description leaves every gate expression untouched and still drops the steps that read it out of the recorded path.

## Sessions in flight

A definition edit reaches the runs already walking that workflow. Their variable bags were seeded from the declarations on disk when they opened, so a declaration added since is absent until they resume — on resume the server seeds what the bag lacks and re-stamps the recorded version. What that does *not* cover is a run part-way through an activity whose steps changed under it.

Count them before landing:

```bash
npm run sessions:census -- --workflow <id> --status running --list
```

Zero means the edit reaches nothing in flight. A non-zero count is the set of runs that will pick it up, and the `--list` output names each one's folder, nesting depth, recorded version, status and current activity.

## What runs on a pull request

[`.github/workflows/verify.yml`](../.github/workflows/verify.yml) checks the `workflows` branch out at `workflows/`, then runs `npm run typecheck`, `npm run check:schemas`, `guards/check-tool-call-shape.ts` against that checkout, `npm run test:ci` with `WORKFLOWS_DIR` set to it, and the [fixture delivery gate](../benchmark/README.md#appendix). Live-corpus tests skip when that checkout is absent. The guard sweep runs on corpus CI rather than engine CI — see [`guards/README.md`](../guards/README.md#one-sweep-one-registry).

## The two branches

Server code lives on `main`. The workflow definitions — the YAML, the techniques and the resources — live on `workflows`, an orphan branch with a history of its own.

```bash
git worktree add .worktrees/workflows workflows   # first time
cd .worktrees/workflows
git pull origin workflows
# edit definitions
git add -A
git commit -m "Describe the definition change"
git push origin workflows
```

The guards and the end-to-end walks read that checkout, so [corpus-coupled baselines](#corpus-coupled-baselines) covers what happens when the snapshots and the definitions separate.

## Authoring definitions

How to add a workflow is the [authoring guide](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md). The file contract is the [technique protocol](technique.md). The schema the server loads stays in this tree: [schemas/README.md](../schemas/README.md).
