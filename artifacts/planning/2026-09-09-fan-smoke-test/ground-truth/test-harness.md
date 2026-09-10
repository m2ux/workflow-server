# What the test harness can drive today

## The end-to-end walker

**`/home/mike1/projects/dev/workflow-server/tests/e2e/walker.ts`** (908 lines) is a *helper*, not a test — it has no `.test.ts` suffix and asserts nothing. It exports `walk(harness, workflowId, policy, opts)` returning a `WalkResult`, plus `enumeratePaths(harness, workflowId, opts)` returning a `PathSet`; the calling test does all the asserting.

**How it drives a session.** Over the real MCP client (see `drivingASession`): `start_session { workflow_id, agent_id: 'e2e-walker' }` → `get_workflow` (from which it takes `initialActivity` and the whole `graph`) → then one `while (current)` loop that per activity does `next_activity { activity_id, step_manifest? }` → `get_activity { context_tokens: 200_000, agent_id?, bundle? }` → executes/resolves checkpoints → picks the next id → repeats, and finishes with `next_activity { activity_id: '__terminal__' }` when the graph binds an exit to the sentinel. Final status is read off disk from `<workspace>/.engineering/artifacts/planning/<slug>/session.json`.

Two modes (`opts.mode`): `'robot'` (default, "Layer 3c") walks `act.steps` in document order, fires each `kind: checkpoint` step through the real `yield_checkpoint` → `respond_checkpoint` → `resume_checkpoint` cycle, calls `get_technique { step_id }` per technique step, writes artifact stubs to the planning folder, and builds the `step_manifest` carried on the next transition. `'graph'` resolves checkpoints in array order with no step execution — lighter, and what `all-workflows-walk` uses. Other knobs: `autoAdvance` (optimistically satisfies a forward exit's `when` toward an unvisited activity, and records rather than throws on an activity that will not load), `workerIdentity` (one `agentId` per dispatch, re-requesting the activity after each gate and recording `gateRefetches`), `maxVisits` (loop guard; throws `Loop guard tripped: "<id>" entered N×`), `decide` / `localCheckpoints` (used only by `enumeratePaths`).

**Yes, it can be pointed at one named workflow** — `workflowId` is a plain parameter. `tests/e2e/snapshot.test.ts:78` walks only `'work-package'` (six policies); `tests/e2e/worker-identity-walk.test.ts:33` only `'work-package'`; `tests/e2e/step-execution-walk.test.ts:48,60` only `'plain-language'` and `'prism'`. `tests/e2e/all-workflows-walk.test.ts:53` is the one that iterates the whole corpus, and its roster comes from `readdirSync(corpusRoot())`, deliberately not a hand list.

**Two facts the plan has to price.**
1. **It re-declares the graph type.** `tests/e2e/walker.ts:53`: `export type Graph = Record<string, Record<string, string>>`, consumed by `pickExit` / `pickNext` / `advanceToUnvisited` as `const to = bound[e.id]` — a bare string. A list or an instance-fan object arrives here as a non-string and is handed straight to `next_activity`'s `z.string()` param, so the walk throws. The delivery plan already flags this as the stage-2 ordering constraint.
2. **It has no frontier.** `let current: string | null = initialActivity; while (current) { … current = next }` with a single `visits: Map<string, number>` and a single `pendingManifest`. There is no fork point, no `Promise.all`, and `steps.push({ … nextActivity: next })` records exactly one successor per activity. A fan needs a work queue of pending branches, per-branch manifests, and convergence bookkeeping — none of which exists.

**What tests assert off it:** `r.path` (activity sequence), `r.finalStatus === 'completed'`, `r.orchestratorUnresolved`/`s.unresolved` empty, `r.loadErrors` empty, `r.steps.flatMap(s => s.stepsExecuted)` membership, `r.gateRefetches`, and a full `toMatchSnapshot()` of a projected shape via `tests/e2e/snapshot.ts`.

## Driving a session from a test

**Tests go through the MCP tool layer, not through handlers directly.** `/home/mike1/projects/dev/workflow-server/tests/e2e/harness.ts` `createHarness(opts)` builds the genuine server (`createServer(config)` from `src/server.ts`) and an SDK `Client`, joined by `InMemoryTransport.createLinkedPair()`. Everything else is `client.callTool({ name, arguments })`. Options: `workspaceDir` (defaults to a fresh `mkdtempSync`), **`workflowDir`** (serve a fixture corpus instead of `corpusRoot()`), `engineeringDir`, `installDir`. Config pins `minCheckpointResponseSeconds: 0` so gate-timing does not slow tests.

The 18 registered tools are asserted as a closed set in `tests/mcp-server.test.ts:212-223`.

**The canonical hand-driven sequence** (e.g. `tests/variable-seeding.test.ts:91-97`):
```ts
const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
await call('yield_checkpoint', { session_index: sessionIndex, checkpoint_id: 'type-check' });
```
then `respond_checkpoint { option_id }`, `resume_checkpoint`, and `next_activity` again. `session_index` comes back both in the JSON body and on `_meta.session_index`. Passing `planning_folder` explicitly is what lets a test read the session file back — several tests do exactly `JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'))`.

**A shared shim exists:** `/home/mike1/projects/dev/workflow-server/tests/session-ops.ts` — `sessionOps(h, workflowId)` gives `.start(slug, agentId, contextMode?)`, `.enter(sessionIndex, activityId)`, `.folder(slug)`, `.history(slug)`, and `planningFolderPath(workspaceDir, slug)`. Used by `tests/exit-destinations.test.ts`, `tests/variable-seeding.test.ts`, `tests/session-concurrency.test.ts`.

**Parsers in `tests/e2e/harness.ts`:** `parseToolResponse` (JSON → YAML → header+YAML split), `parseWorkflowResponse` (strips the bundle before `\n\n---\n\n` and returns the definition body), `parseBundle` (the bundle *before* that separator — where `unresolved` lives), `rawText`, `isError`.

**Tests also call internals directly, where that is the cheaper question.** `loadWorkflow(dir, id)` / `loadWorkflowWithDiagnostics` / `validateExitBindings` / `getExitBindings` / `exitDestinations` / `getCheckpoint` / `checkpointBaseId` from `src/loaders/workflow-loader.ts` (`tests/workflow-loader.test.ts`); `mergeActivityVariables`, `unreachableReads` from `src/utils/activity-variables.ts`; `loadSessionForTool` / `saveSessionForTool` / `writeSessionFile` / `advanceSession` / `verifySeal` / `ensurePlanningFolder` / `computeSessionIndex` from `src/utils/session/index.js` (`tests/session-concurrency.test.ts`); and each guard's exported `collectFindings(root)` from `scripts/check-*.ts`. So the L1–L14 load rules can be tested purely at `validateExitBindings` level with no server and no session at all — that is the cheapest home for them.

**A third driver exists outside vitest:** `scripts/smoke/smoke-orchestrator.ts`, run as `npx tsx scripts/smoke/smoke-orchestrator.ts --workflow=<id> [--activities=N] [--choices=cp:opt] [--full]`. It uses the same `createHarness` client as orchestrator and spawns real headless `claude -p` workers per activity via `execFileSync`. Strictly serial (see `concurrency`).

## Asserting a refusal

**Every handler refusal is a plain `throw new Error(...)`.** There is no error-result type in `src/tools/workflow-tools.ts` — the MCP SDK converts the throw into `{ isError: true, content: [{ type: 'text', text: <message> }] }`. `withSessionStoreErrors` (workflow-tools.ts:105-118) is the one wrapper: it re-throws a `SessionStoreError` as `new Error(describeSessionStoreError(err))`. So the assertion is always "isError, and the text says the right thing".

**Pattern 1 — flag plus message text.** `tests/mcp-server.test.ts:290-298`:
```ts
const result = await client.callTool({ name: 'get_activity', arguments: { session_index: sessionToken, context_tokens: 200_000 } });
expect(result.isError).toBe(true);
const errorText = (result.content[0] as { type: string; text: string }).text;
expect(errorText).toContain('No current activity');
```
Bare-flag form at `tests/mcp-server.test.ts:239-245` (`activity_id: 'non-existent'` → `expect(result.isError).toBe(true)`).

**Pattern 2 — capture the refusal in a driver, then assert the text *and* the history event it wrote.** This is the closest existing model for a run-time refusal and is what a fan-enter refusal should copy. `tests/e2e/batched-dispatch.test.ts:69-76` inside `walkBatch`:
```ts
if (isError(taken)) { walk.refusedWith = rawText(taken); walk.refusedAt = activityId; break; }
```
then at 115-137:
```ts
expect(walk.refusedAt).toBe('implement');
expect(walk.refusedWith).toContain('Batch full');
expect(walk.refusedWith).toContain('cap of 3');
// Refused means undelivered: the fourth activity has no dispatch event for this context.
const refusals = walk.history.filter(e => e.type === 'batch_refused');
expect(refusals).toHaveLength(1);
expect(refusals[0]!.data as Record<string, unknown>).toMatchObject({ limit: 'activity_cap', activities: 3, maxActivities: 3 });
```

**Pattern 3 — a named helper that asserts the refusal is actionable.** `tests/session-concurrency.test.ts:172-178`:
```ts
function refusalText(result: ToolResult): string {
  const text = (result.content as { text: string }[])[0]?.text ?? '';
  expect(text).toContain('stale write refused');
  expect(text).toContain('CALL THIS TOOL AGAIN');
  expect(text).toContain('Nothing was written');
  return text;
}
```

**Pattern 4 — below the wire, on the function.** `tests/session-concurrency.test.ts:78-79`:
```ts
await expect(saveSessionForTool(second, mark(second.state, 'second')))
  .rejects.toMatchObject({ name: 'SessionStoreError', code: 'STALE_WRITE' });
```

**Constraint for the plan:** the walker cannot express a refusal. `tests/e2e/walker.ts:372-375` turns any tool error into `throw new Error('next_activity(<id>) failed: ' + text)`, and `getActivity`/`resolveCheckpoint` do the same. Every refusal test must therefore drive `client.callTool` directly (or `sessionOps`), the way `batched-dispatch` does. Also note today's `next_activity` refuses only on an *active checkpoint* (`Cannot transition to '<id>': Active checkpoint …`, workflow-tools.ts:723-728) and an *unknown* activity (`Activity not found: <id>`, :731) — it does **not** check that the target is a legal destination from the current activity. `validateReportedExit` (`src/utils/validation.ts:239-254`) only ever returns a warn-only string. So "the transition is graph-illegal" is not a refusal today; a fan-enter refusal is new behaviour, not a widening of an existing check.

## Asserting a load failure

Four layers, cheapest first.

**1. Zod, on an in-memory object.** `tests/schema-validation.test.ts` — `expect(safeValidateWorkflow(workflow).success).toBe(false)`, `expect(StepSchema.safeParse(step).success).toBe(false)`, `expect(ExitSchema.safeParse({ id: 'converged', to: 'next-activity' }).success).toBe(false)`. Imports come from `src/schema/workflow.schema.ts` and `src/schema/activity.schema.ts`. No filesystem.

**2. `validateExitBindings`, on a hand-built `Workflow` object — the exact home for the graph rules.** `tests/workflow-loader.test.ts:329-397` builds tiny objects with local `activity()` / `wf()` factories and a `known = new Set(['thing', 'next', 'other'])`, then asserts on the returned `string[]`:
```ts
it('reports an exit the graph leaves unbound', () => {
  const errors = validateExitBindings(wf({ thing: { done: 'next' } }, [{ id: 'done' }, { id: 'escalate', isDefault: true }]), known);
  expect(errors.join(' ')).toContain("exit 'escalate' is unbound");
});
it('reports a destination the workflow does not contain', () => {
  const errors = validateExitBindings(wf({ thing: { done: 'elsewhere' } }, [{ id: 'done' }]), known);
  expect(errors.join(' ')).toContain("to 'elsewhere', which this workflow does not contain");
});
```
Accept-cases assert `.toEqual([])`. `loadWorkflowWithDiagnostics` fails the whole load on any non-empty result: `src/loaders/workflow-loader.ts:366-367` — `const bindingErrors = validateExitBindings(workflow, knownActivityIds); if (bindingErrors.length > 0) return err(new WorkflowValidationError(workflowId, bindingErrors));`. So one test per L-rule here needs no corpus, no fixture directory, and no server.

**3. `loadWorkflow` against a throwaway corpus on disk — Result-type assertion.** `tests/activity-variables.test.ts:87-99`:
```ts
it('refuses to load a workflow whose declarations contradict', async () => {
  const root = corpusWith('  writes:\n    - name: plan_approved\n      type: string\n',
                          'variables:\n  - name: plan_approved\n    type: boolean\n');
  try {
    const loaded = await loadWorkflow(root, 'wf');
    expect(loaded.success).toBe(false);
    expect(loaded.success ? '' : loaded.error.message).toContain("workflow.yaml and thing declared 'boolean' and 'string'");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
```
The `WorkflowNotFoundError` variant reads `expect(result.error.name).toBe('WorkflowNotFoundError')` (`tests/workflow-loader.test.ts:43-50`).

**4. Partial failure — the activity is excluded and the error surfaced.** `tests/workflow-loader.test.ts:130-148` asserts `result.success === true` while `result.value.workflow.activities?.map(a => a.id)` is `['good-activity']` and `result.value.activityLoadErrors` has two entries keyed by `file`, `activity_id`, `error`. This asymmetry matters: a malformed *activity* degrades, a malformed *graph binding* fails the whole load.

**5. Guard-level, via each script's exported `collectFindings(root)`.** `tests/loop-shape-guard.test.ts:36` — `const checks = (loop) => collectFindings(rootWithLoop(loop)).map(f => f.check)` then `expect(checks(bare)).toEqual(['repeat-loop-without-continuation'])`; site-level form `expect(collectFindings(root).map(f => f.site)).toEqual(['demo/activities/01-demo.yaml[inner-cycle]'])`. Any new guard must also be registered in `scripts/guards.ts` or `tests/guard-registry.test.ts` fails it as an unaccounted script on disk.

Regenerated JSON Schema is separately guarded by `tests/generated-schemas.test.ts`, which fails on an empty subschema at any `items` key — relevant because the fan's array member is exactly such a position.

## Where invalid definitions live

**Two conventions, and the split is the answer to the tension in the goal.**

**(a) Fault fixtures are built at run time in a temp dir and never committed.** Every deliberately-broken definition in the suite is written with `mkdtempSync(join(tmpdir(), '<prefix>-'))` + `mkdirSync(..., { recursive: true })` + `writeFileSync` of a `[...].join('\n')` YAML string, and torn down in `afterAll`/`finally` with `rmSync(root, { recursive: true, force: true })`. Live examples:
- `/home/mike1/projects/dev/workflow-server/tests/workflow-loader.test.ts:101-128` — prefix `workflow-loader-diagnostics-`; three broken workflows in one root: `broken-activities-wf` (one valid, one schema-invalid `id: invalid-activity\n`, one unparsable `id: [unclosed\n  nonsense: {`), `unparsable-wf`, `missing-fields-wf`.
- `tests/loop-shape-guard.test.ts:22-34` — prefix `loop-shape-`; `rootWithLoop(loop)` composes one activity around a faulty loop declaration.
- `tests/activity-variables.test.ts:62-74` — prefix `wf-avars-`; `corpusWith(activityVariables, workflowVariables)` builds a two-file corpus.
- `tests/exit-destinations.test.ts:26-77` — prefix `wf-exitdest-corpus-`; builds a *complete valid* corpus (`workflow.yaml` with a `graph`, two activities, a `techniques/work.md`) and then serves it with `createHarness({ workflowDir })`. This is the template for a fan fixture corpus.
- `tests/variable-seeding.test.ts:524-534` — `cpSync` of a committed fixture corpus into a tmpdir so the definition can be *edited under a live session*.

**(b) Committed fixture corpora under `tests/fixtures/` are valid, with one exception.** Layout is `tests/fixtures/<set>/<workflow-id>/workflow.yaml` plus `activities/NN-<id>.yaml`:
- `tests/fixtures/variable-model/` — `seed-fixture` (2 activities), `child-fixture`, `bare-fixture`, `meta`. Served by `createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model') })` in `tests/variable-seeding.test.ts:100` and `tests/session-concurrency.test.ts:144`.
- `tests/fixtures/fragments/{alpha,beta,gamma}-fixture/`, `tests/fixtures/message-binding/binding-fixture/`.
- The exception: **`tests/fixtures/markdown-techniques/work-package/techniques/malformed-ops/`** — `broken.md` has no `## Protocol` and its own `TECHNIQUE.md` front matter says *"Op child files missing the required Procedure section — should fail to load."* Asserted at `tests/technique-loader.test.ts:159-166` (`expect(resolved[0]!.type).toBe('not-found')`). So a committed invalid artefact is precedented.

**Why an illegal fan can live in either place without breaking anything.** Nothing that enumerates workflows ever reaches `tests/fixtures/`:
- `scripts/workflows-root.ts requireWorkflowsRoot` resolves `--root` > `WORKFLOWS_DIR` > `../workflows`, and refuses an empty root. Every corpus guard in `scripts/guards.ts` goes through it, so `npm run check:all` / `check:delta` never see `tests/fixtures`.
- `tests/corpus-root.ts corpusRoot()` resolves `WORKFLOWS_DIR` > `resolve(import.meta.dirname, '../workflows')` and likewise refuses an empty corpus.
- `tests/e2e/all-workflows-walk.test.ts:34-39` and `tests/e2e/coverage-roster.test.ts:17-19` both enumerate with `readdirSync(corpusRoot()).filter(d => existsSync(join(root, d, 'workflow.yaml')))`.

**The corollary the plan needs:** anything added to `workflows/` is walked by `all-workflows-walk`, must be listed in `WALKED` or `NOT_WALKED` in `tests/e2e/walked-workflows.ts` (or `coverage-roster` fails), enters the `option-coverage.json` denominator, and is swept by all ~40 corpus guards. So the legal-fan permutations belong in a real `workflows/` workflow and the illegal ones belong in tmpdir/`tests/fixtures/` — which is exactly the division the goal's tension asks for.

**One gap:** no test has ever pointed the *walker* at a fixture corpus. Every `walk()` / `enumeratePaths()` call site uses bare `createHarness()` against the live corpus. `createHarness({ workflowDir })` + `walk(h, 'fan-fixture', policy)` requires no code change, but it is a new combination and worth a smoke assertion of its own.

## Seeding the variable bag

**Yes — four routes, and this removes the need for a faulty corpus workflow to provoke run-time data refusals.**

**1. Write the session file directly (strongest; arbitrary values, arrays of objects included).** `tests/session-concurrency.test.ts:49-59` is the template:
```ts
workspace = await mkdtemp(join(tmpdir(), 'sx-cas-'));
folder = await ensurePlanningFolder(workspace, '2026-09-08-cas');
sessionIndex = await computeSessionIndex(folder);
await writeSessionFile(folder, createInitialSessionFile({ sessionIndex, workflowId: 'work-package', workflowVersion: '1.0.0', agentId: 'orchestrator' }));
```
`createInitialSessionFile` takes `variables?: Record<string, unknown>` (`src/schema/session.schema.ts:305`, seeded at :321 and recorded as one `variables_seeded` event), so any bag is expressible. `writeSessionFile` goes through `persistSessionFile`, which recomputes the HMAC seal — the file stays loadable by the server, no seal-mismatch. **Mid-session** mutation uses the same `advanceSession` + `saveSessionForTool` pair the tools use (`tests/session-concurrency.test.ts:66-69, 76`):
```ts
const mark = (state, activity) => advanceSession(state, (draft) => { draft.history.push({ … }); });
const first = await loadSessionForTool(workspace, sessionIndex, loadOpts);
await saveSessionForTool(first, mark(first.state, 'first'));
```
Substituting `draft.variables['work_items'] = <whatever>` seeds the bag at any point between two transitions.

**2. Over the wire, no fixture edit, warn-only — the route that makes bad data reachable.** `next_activity { variables_changed }` and `yield_checkpoint { variables_changed }` both write the bag and both **store a type-mismatched value as written**. `tests/variable-seeding.test.ts:250-269`:
```ts
const result = await call('next_activity', { session_index, activity_id: 'followup-activity', variables_changed: { review_needed: 'yes' } });
const validation = (result._meta as { validation: { status: string; warnings: string[] } }).validation;
expect(validation.status).toBe('warning');
expect(validation.warnings.join('\n')).toMatch(/variables_changed.*review_needed.*string.*declared boolean/);
expect(stored.variables.review_needed).toBe('yes');
```
That is decisive for the fan: a variable declared `type: array` can be handed a string, an empty array, or an array of id-less elements through a perfectly legal corpus workflow, and the value lands in the bag. Every run-time fan refusal the plan names — over-long collection, empty collection, non-array collection, element with no derivable id, two elements sharing an id — is provokable this way. Also `yield_checkpoint { variables_changed }` returns `variables_published: ['reference_note', 'retry_count']` in its body (:133-134), so publication is observable.

**3. Declared defaults.** `variables[].defaultValue` is `z.unknown()` (`src/schema/variable.schema.ts:16`), so a fixture workflow may declare a collection literal and `start_session` seeds it (`tests/variable-seeding.test.ts:106-115`). This is the *only* route that seeds before the walker's first `next_activity`, because `walk()` always opens its own session. Caveat: `check:variable-model` forbids gating a defaulted variable with `exists`/`notExists`.

**4. `start_session { user_request }`** seeds `user_request` alongside the declared defaults (`tests/variable-seeding.test.ts:401-408`), and `dispatch_child` hands it down.

**Not a route — a trap worth stating in the plan.** `Policy.initialVariables` (`tests/e2e/policies.ts:99`, `reviewModePolicy`) feeds only the walker's **local** bag: `tests/e2e/walker.ts:642` — `const variables = { ...defaultVariables(wf), ...(policy.initialVariables ?? {}) }` — and the walker's own doc comment says it "tracks variables locally only to CHOOSE an exit; the server remains the source of truth". Nothing writes it to the session. So a policy cannot seed the collection an instance fan's `over` reads; only routes 1–3 can. Likewise `simulate` (per-activity agent-outcome variables) is local-only.

**Conclusion:** no deliberate fault in a corpus workflow is needed for run-time data refusals. A legal corpus workflow that fans over a declared `array` variable, plus a `variables_changed` relay (or a direct `draft.variables` write) carrying the pathological value, provokes all of them at the wire with the existing harness.

## Simulating concurrent workers

**Partly, and the gaps are real. The harness does not serialise — the *store refuses* — and neither of the two workflow drivers can fan at all.**

**What exists today: overlapping tool calls against one session.** `tests/session-concurrency.test.ts` puts two calls in flight before either handler returns:
```ts
const results = await Promise.all([
  callTool('record_usage', usageArgs(sessionIndex, 'first')),
  callTool('record_usage', usageArgs(sessionIndex, 'second')),
]);
```
and does the same for two `dispatch_child` calls (:215-218), two `start_session` resumes (:245-246), and a parent/child pair writing the same file (:266-269). Nothing in `createHarness` or `InMemoryTransport` queues these — there is no per-session lock or mutex anywhere in `src/`.

**But the store is compare-and-swap, not serialising.** `src/utils/session/store.ts:382-398` — `persistSessionFile` compares the on-disk bytes against `expectedBytes` in the same synchronous step as the swap and throws:
```
stale write refused for <folder>: session.json changed since it was read
```
as `SessionStoreError(…, 'STALE_WRITE')`, discarding the staged files. No retry, no queue. Consequently the existing tests can only assert the *disjunction*: `expect(succeeded.length).toBeGreaterThanOrEqual(1)`, every refusal carries the actionable text (`refusalText`), and "whatever was admitted is in the file" — `expect(events(stored, 'activity_usage')).toHaveLength(succeeded.length)`. **No test today asserts that N simultaneous writes all land**, because under this store they cannot.

**Neither workflow driver can fan.**
- `tests/e2e/walker.ts:655-768` — one `current` pointer, one `while` loop, one `visits: Map<string, number>`, one `pendingManifest`. Strictly serial by construction. Adding a frontier is new code, not a flag.
- `scripts/smoke/smoke-orchestrator.ts` — workers run through `execFileSync(CLAUDE_BIN, a, { … timeout: 600_000 })` (:117) inside `while (current && count < MAX_ACTIVITIES)` (:254) and an inner turn loop. One worker turn at a time, blocking. The delivery plan's criterion "three workers spawn in one turn" is not expressible against it as written.
- The only concurrent-walk precedent is `Promise.all(scoped.map(async (id) => … enumeratePaths(h, id, …)))` in `tests/e2e/option-coverage.test.ts:131` — fourteen **separate** sessions, so no shared file and no CAS contention. Its own comment records that the win is a ninth of the wall clock because all walks share one event loop.

**Gaps the plan must name.**
1. **A frontier in `tests/e2e/walker.ts`** — a queue of pending branches, per-branch `step_manifest`, per-branch `agent_id`, and convergence bookkeeping keyed on activity ids (the plan's own acceptance criterion 127 asks for exactly this).
2. **Decide what N concurrent branch returns are *supposed* to do.** Under today's store, N-1 of N simultaneous `next_activity` calls against one session are refused with `STALE_WRITE`. The delivery plan already half-anticipates this ("a repeated call after a `STALE_WRITE` is not a barrier refusal and does not fail this criterion"), which means the harness needs a **retry-on-STALE_WRITE helper** before any test can assert "three slots land in collection order" — otherwise the assertion is flaky by design. That helper does not exist; `tests/session-concurrency.test.ts:87-99` demonstrates the manual re-read-and-retry shape it would wrap.
3. **No ordering assertion exists.** Nothing in the suite asserts a dense-array slot landed at a given index. The nearest is `expect(rows.map(r => r['activity'])).toEqual(RUN.slice(0, 3))` (`tests/e2e/batched-dispatch.test.ts:392`) over history rows.
4. **The real-agent concurrency claim ("several dispatches in one turn") is measurable by nothing today** — the smoke script is the only real-agent driver and it is `execFileSync`. Either it grows a parallel spawn path or the claim stays untested outside a deterministic walk.

## Test file layout

**Layout.** One vitest config, `/home/mike1/projects/dev/workflow-server/vitest.config.ts`, with `include: ['tests/**/*.test.ts']`, `globals: true`, `environment: 'node'`, and `testTimeout: 60_000` (the comment explains it: the e2e walks replay full multi-activity sessions and a GitHub runner is ~4× slower than local).

- **Unit + integration:** flat in `tests/` — ~85 `*.test.ts` files, one per subject, kebab-case after the thing tested (`workflow-loader.test.ts`, `variable-seeding.test.ts`, `exit-destinations.test.ts`, `session-concurrency.test.ts`, `schema-validation.test.ts`). Guard tests are named `<guard>-guard.test.ts` (`loop-shape-guard.test.ts`, `branch-as-step-guard.test.ts`) and import `collectFindings` from the matching `scripts/check-*.ts`.
- **End-to-end:** `tests/e2e/` — `all-workflows-walk.test.ts`, `snapshot.test.ts`, `step-execution-walk.test.ts`, `worker-identity-walk.test.ts`, `batched-dispatch.test.ts`, `batch-duration-smoke.test.ts`, `resume-delivery-identity.test.ts`, `option-coverage.test.ts`, `coverage-roster.test.ts`.
- **Helpers carry no `.test.ts`, so vitest ignores them:** `tests/e2e/harness.ts`, `walker.ts`, `policies.ts`, `coverage.ts`, `snapshot.ts`, `walked-workflows.ts`; `tests/corpus-root.ts`, `session-ops.ts`, `corpus-stamp.ts`, `stamp-freshness.ts`. A new fan helper belongs here, not in a `.test.ts`.
- **Data:** `tests/fixtures/` (fixture corpora), `tests/e2e/__snapshots__/snapshot.test.ts.snap` + `corpus-sha.json`, `tests/e2e/option-coverage.json` (the committed uncovered-options expectation, grouped by reason).
- Imports are ESM with `.js` extensions on `.ts` sources (`from './harness.js'`, `from '../../src/loaders/workflow-loader.js'`).

**Running.**
- Whole suite: `npm test` (vitest **watch** — do not use in CI or a script) / `npm run test:ci` (`vitest run`).
- **One file:** `npx vitest run tests/e2e/all-workflows-walk.test.ts`, or `node_modules/.bin/vitest run <path>` to skip the npx registry lookup. Under this machine's rules, prefix with `/home/mike1/.claude/bin/sbx` and `cd` to the repo (or worktree) first.
- One test by name: add `-t "substring"`. Vitest's own per-test timeout overrides the global, written inline as `}, 300_000);` (`tests/e2e/step-execution-walk.test.ts:57`) or `}, 120_000);`.
- **Opt-in jobs.** The coverage walk is `describe.skipIf(process.env.WF_OPTION_COVERAGE !== '1')` (`tests/e2e/option-coverage.test.ts:93`) with its own script `npm run test:coverage-walk` (`WF_OPTION_COVERAGE=1 vitest run tests/e2e/option-coverage.test.ts`), narrowable with `WF_COVERAGE_SCOPE=<ids>` and `WF_DRY_WALKS=<n>`. A plain `vitest run` therefore *skips* it — a known trap: a routing change passes locally and fails the separate `.github/workflows/coverage.yml` job later.
- **Corpus redirection:** `WORKFLOWS_DIR=<path>` moves both `tests/corpus-root.ts` and `scripts/workflows-root.ts`, so the whole suite and the whole guard sweep can be aimed at one tree — the mechanism that makes a worktree measure itself.
- **CI:** `.github/workflows/verify.yml` runs `npm run typecheck`, `npm run test:ci`, `npm run check:all` on every pull request; the corpus is checked out by `./.github/actions/workflows-corpus`, which also compares the gitlink against the recorded baselines. Guards are enrolled via `scripts/guards.ts`, and `tests/guard-registry.test.ts` fails any guard script on disk that the registry does not name.
- **Repo convention** (AGENTS.md): `npm run typecheck` and `npm test` after code or schema changes; `npm run check:all` (or `check:delta`) after corpus changes; a corpus adoption also moves the walk baseline and the stamp (`npm run baseline:stamp`) in the same commit.

