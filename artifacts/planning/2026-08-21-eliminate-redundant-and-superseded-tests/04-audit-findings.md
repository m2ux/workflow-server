# Audit Findings — workflow-server tree, test suite first

**Audited:** commit `00d15428` on `refactor/lean-test-suite` · 69 test files, 19,266 lines · corpus `7f37a2bd` · **Intensity:** ultra · **Scope:** repo

LC-1 shrink 11 hand-rolled `createServer` + `InMemoryTransport.createLinkedPair` + `new Client` boots, ~18 lines each, differing only in a `serverName` literal no test asserts and in which directory holds the corpus. Call the existing `createHarness`, adding one optional `workflowDir` to it for the five fixture-corpus callers. [tests/mcp-server.test.ts:122, tests/fetch-observability.test.ts:28, tests/reference-delivery.test.ts:117 and :713, tests/hybrid-bundling.test.ts:195, tests/context-window-smoke.test.ts:137, tests/multi-root-bootstrap.test.ts:23, tests/variable-seeding.test.ts:100 and :442, tests/enforcement-notes.test.ts:86, tests/workflow-authoring-delivery.test.ts:100 → tests/e2e/harness.ts:31] **-160**

LC-2 delete a 148-line analyzer invoked by no npm script, no CI job, no guard-registry entry and no test, whose own header states it is deliberately not a gate. Delete the file. [scripts/analyze-io-protocol-refs.ts] **-148**

LC-3 shrink `startSession` at three sites and `enterActivity` at four, byte-identical but for one `workflow_id` literal, plus `planningFolder` written out at seven sites and `sessionHistory` at three. One shared module exporting the four, `startSession` taking the workflow id. [tests/context-window-smoke.test.ts:163, tests/fetch-observability.test.ts:57, tests/hybrid-bundling.test.ts:219, tests/reference-delivery.test.ts:146, tests/enforcement-notes.test.ts:112, tests/mcp-server.test.ts:120, tests/variable-seeding.test.ts:81] **-60**

LC-4 shrink `parseToolResponse` and `parseWorkflowResponse` reimplemented statement-for-statement against the harness pair whose own docstring says it mirrors them. Import both from `tests/e2e/harness.ts`. [tests/mcp-server.test.ts:11-57, tests/multi-root-bootstrap.test.ts:11-22] **-59**

LC-5 delete a 48-line file gated on `WF_PATH_COVERAGE=1`, which no npm script and no CI job sets, so its 12 tests are skipped in every run of both jobs; its per-path drift assertions are made over the same corpus by the shared six-walk matrix and the all-workflows walk, and its hand-listed 12-workflow roster is the second-home drift its two sibling files each carry a docstring against. Delete the file and the README entry offering it. [tests/e2e/all-paths-walk.test.ts, tests/e2e/README.md:127] **-48**

LC-6 delete the second full `walk(h, 'work-package', fullWorkflowPolicy)` in robot mode — the identical call the shared `beforeAll` matrix already makes and holds in `walks`. Read that map, which is the fold the change deferred pending a third caller that `worker-identity-walk.test.ts` already is. [tests/e2e/robot-execution.test.ts:43 → tests/e2e/snapshot.test.ts:62] **-45, -7.3s**

LC-7 yagni `coverageMode`, `maxPaths`, `capped`, `distinctPaths`, `branchesKnown`, `branchesCovered` and `knownBranches` in `enumeratePaths`: both callers pass `coverageMode: true`, neither passes `maxPaths` (dead behind `maxWalks: 120`), and the only reader of the other five is the file LC-5 deletes. Drop the flag, the `known` set that feeds it, and the eight-line comment explaining the branch that no longer forks. [tests/e2e/walker.ts:739-882] **-34**

LC-8 delete the `corpus strict-parse` block, which re-runs inside vitest what the `activities` and `workflow-yaml` guards prove word-for-word ("every activity file validates against the activity schema") in the same verify job. Delete both tests; the guards keep the claim. [tests/schema-validation.test.ts:367-403 → scripts/guards.ts:212-227] **-32**

LC-9 shrink four tests asserting that an unregistered tool name errors, spread across two describe blocks, which is the SDK's dispatch behaviour rather than the server's. One `client.listTools()` assertion pinning the registered tool set, which also fails on a tool added without one. [tests/mcp-server.test.ts:280-301 and :2271-2279] **-32**

LC-10 delete the calibration test asserting the fixture's four padded techniques sit within 5% of each other and inside an 8k-13k band, plus its `BUNDLE_DEBUG` print — it measures the fixture, not the server, and a fixture that drifts out of band already fails the three tier tests below it. [tests/context-window-smoke.test.ts:199-230] **-32**

LC-11 shrink the batch smoke test to its two real checks — dispatches 3 to 1, and char saving above 20%. Drop the eight-line `process.stderr.write`, the `elapsedMs < perActivity × 1.6` wall-clock ratio whose tolerance its own comment calls noise-dominated, and `expect(DEFAULT_SPAWN_SECONDS).toBe(87)`, which pins an imported constant to itself. [tests/e2e/batch-duration-smoke.test.ts] **-30, -1.9s**

LC-12 shrink `loader schema integration` from three tests to one: the corpus-wide claim of the third is the `activities` guard's, and the second differs from the first only in which workflow it loads. Keep one, asserting the composed object the loader emits validates. [tests/schema-validation.test.ts:405-435] **-30**

LC-13 native `supertest` and `@types/supertest` for 13 `request(app)` calls in one file. `app.listen(0, '127.0.0.1')` — which the same file already does at :230 — plus global `fetch`, in a four-line helper. [tests/http-transport.test.ts, package.json:62-63] **-30, -2 deps**

LC-14 shrink the same eight-line `buildSessionScope({...})` config literal repeated at six call sites. One base object and a per-test override spread. [tests/session-scope.test.ts:27, :89, :106, :124, :143, :160] **-26**

LC-15 yagni a 20-line module, 12 of them a doc block, exporting one constant read at one call site; three of the four walk hooks already use literal timeouts, so the "moves every hook together" premise it states no longer holds. Inline `45_000`. [tests/e2e/budgets.ts → tests/e2e/robot-execution.test.ts:44] **-20, -1 file**

LC-16 delete `BASELINE_UNBOUND_CHECKPOINTS: string[] = []` and the 11-line comment narrating six situational checkpoints the corpus no longer declares. Assert `toEqual([])` inline. [tests/e2e/robot-execution.test.ts:108-124] **-12**

LC-17 delete the first of two `describe('tool: get_workflow')` blocks in one file: its single test asserts `id` and `version`, both asserted by the second block's `returns lightweight metadata` test. [tests/mcp-server.test.ts:305-316] **-12**

LC-18 yagni `WalkOptions.agentId`, an option no caller passes, resolved internally to a literal default. Drop the field and use the literal. [tests/e2e/walker.ts:181, :580] **-3**

net: -813 lines, -2 deps possible.
