## Verdict

**The workflow as designed does not pass.** Measured, not inferred: I authored §1.5/§1.6/§1.7/§1.8 verbatim into a full corpus copy at `/tmp/fc-corpus/fan-conformance/`, substituted a sequential placeholder graph so it loads under today's unwidened `GraphSchema`, then ran the real 34-guard corpus sweep, `tests/e2e/all-workflows-walk.test.ts`, and `enumeratePaths`. Separately I simulated `activityGraph` / `unreachableReads` / `reviewSuccessors` against the design's literal §1.3 fan graph.

Three defects fail the load or the walk. Six are authoring slips. After repairing all nine, **19 findings remain across two guards, and no authoring can clear them.**

Registry note: `scripts/guards.ts` holds **38** guards, 34 corpus-scoped — `canonical-home-map` is registered (and passes). §8.4's "37, and the fan adds none" is stale.

---

## BLOCKERS

### B1 — `reconcile-review` never loads, and the entire guard sweep says nothing
**Rule:** `assertSoftnessPaired`, `src/loaders/fragment-resolver.ts:78`. §1.5's checkpoint declares `defaultOption: accept-report` with no `autoAdvanceMs`; §6 states that choice deliberately ("gating is structural (`defaultOption`, no `autoAdvanceMs`)"). That exact half-pair is prohibited:

```
Activity 'reconcile-review': checkpoint 'confirm-report' declares defaultOption without
autoAdvanceMs. A soft gate declares both; a gate that waits for an explicit selection declares neither.
```

The loader **excludes the activity** and logs at warn level: `"Excluding activity with unresolvable fragments"`, `activityCount: 6`. `workflow-yaml` PASS. `activities` PASS (124/124). All 34 guards blind. Then:

```
tests/e2e/all-workflows-walk.test.ts > [fan-conformance]
  → next_activity(reconcile-review) failed: Activity not found: reconcile-review
```

That test runs in `test:ci` with no opt-out. **A `test:ci` failure invisible to the whole guard suite.** It also silently changed a second finding: with `reconcile-review` dropped, `sweep_plan` reads as `unread-write` because its only reader is gone.

**Fix:** add `autoAdvanceMs`, or drop `defaultOption`. Either keeps `review-mode-gating` green — `hasConsequentialDefault` fires only when the *default* option carries an `effect`.

### B2 — `01-survey.yaml`'s `continueWhile` is not a `Condition`
```
[FAIL] activities      - fan-conformance/01-survey.yaml
                          - steps.1.continueWhile: Invalid input
[FAIL] workflow-yaml   workflow-yaml: 1 file(s) failed across 18 workflow(s).
```
Two causes: `ConditionSchema` requires `type: simple`, and `ComparisonOperatorSchema` is `['==','!=','>','<','>=','<=','exists','notExists']` — `operator: equals` is not a member. **Fix:** `type: simple` + `operator: '=='` (+ `maxIterations`, per every corpus loop).

### B3 — no client workflow may bind `workflow-engine::commit-and-persist`
```
[orphan-input] fan-conformance :: meta::workflow-engine::commit-and-persist
   own input 'activity_id' has no producer in workflow 'fan-conformance'
   (no step-binding entry, workflow variable, step output, or default)
```
`commit-and-persist` declares own inputs `activity_id` (required) and `mark_progress_na` (optional). The only corpus bind site — `meta/activities/03-dispatch-client-workflow.yaml:93` — supplies `activity_id: current_activity`, meta's own variable. Grep confirms no client corpus workflow binds any commit/persist engine op. §1.5 binds it bare at `combine-sweep` step 3 and `reconcile-review` step 4 and calls it "the single persist at convergence (N4)".

**Fix:** delete both steps. The orchestrator's post-activity hook already runs it, so N4 must be asserted from the orchestrator's call sequence — which §9 Q10 already concedes.

---

## AUTHORING SLIPS (repairable)

### A1 — `survey`'s own loop variable is an undeclared read
```
[undeclared-use] fan-conformance :: survey
   reads 'survey_sufficient' without declaring it under variables.reads
```
`deriveActivityContract` walks `flattenActivitySteps`, so the loop step's `continueWhile` is read **before** its body's technique writes it — it lands in `reads`, not `internalReads`. Declaring the read alone trades this for `unreachable-read`. The corpus idiom (`ponytail/activities/02-apply-ladder.yaml`, `work-package/activities/06-plan-prepare.yaml`) is `defaultValue: false` on the write declaration; the guard seeds `availableAtEntry` from every merged declaration carrying a default. **Fix:** declare the read *and* the default. §1.5's claim that both `survey_depth` and `survey_sufficient` are "the self-consumed exemption's corpus arm" is right only for `survey_depth`.

### A2 — the checkpoint's `setVariable` key is an undeclared write
```
[undeclared-use] fan-conformance :: reconcile-review
   writes 'revisit_dependencies' without declaring it under variables.writes
```
`write()` fires on every checkpoint option `setVariable` key. **Fix:** declare it (or see F3 below, which removes it).

### A3 — three declared reads no step consults
```
[unused-declaration] fan-conformance :: probe-unit   ... read of 'planning_folder_path'
[unused-declaration] fan-conformance :: probe-unit   ... read of 'recon_scope'
[unused-declaration] fan-conformance :: unit-review  ... read of 'planning_folder_path'
```
`AMBIENT_CONTEXT_IDS` is only `{target_symbol, impact_report, model_id}` — `planning_folder_path` is **not** ambient. It becomes a derived read only where a bound op's composed signature declares it, and §1.7 gives `probe-surface.md` / `assess-unit.md` no such input. §1.5's reads lists and §1.7's I/O table contradict each other. **Fix:** drop the reads, or add the inputs (both then resolve — they are workflow variables).

---

## STRUCTURAL RESIDUE — 19 findings that survive every repair

Measured after applying B1–B3 and A1–A3: `activity-variables` 14, `binding-fidelity` 5. Every other guard PASS.

### F1 — the derived branch container is a producer nothing knows about (10 findings; **no plan stage names it**)
```
[unwritten-read]   combine-sweep      reads 'survey_outputs' / 'dependency_review_outputs' /
                                      'probe_unit_outputs', which no activity in this workflow
                                      writes and the workflow file does not own
[unwritten-read]   reconcile-review   reads 'unit_review_outputs', ... (same)
[unreachable-read] × the same four     ... on a path that reaches it before anything writes it
[read-resolution]  04-combine-sweep.yaml:36  {survey_outputs.0.result.survey_findings} has no producer
[read-resolution]  04-combine-sweep.yaml:37  {dependency_review_outputs.0.result.dependency_findings} …
```
The `unwritten-read` half is **graph-independent** — `writersOf` is built from declared writes alone, so it fires with the fan graph or without.

Closing it requires the container registered as a **write of each branch activity**, not merely added to the merged variable set: `unwritten-read` consults `writersOf`, and `unreachableReads` consults the per-activity `writes` map. §1.6's "stage 4's merge contributes them" is insufficient — a merged declaration with no `defaultValue` appears in neither. The plan's stage 3 is arrival-intersection and stage 4 is *a synthetic read of the fan's collection*; neither is a synthetic **write of the container at the branch**. §9 Q1 covers only `binding-fidelity`. §6's "Every declared read has a writer and every declared write a reader — closed in §1.5/§1.7" is false here.

### F2 — the fan parameter (6 findings; anticipated by §9 Q1 and §3.8 G8, contradicted by §6)
`unwritten-read` ×2 (`probe_unit`, `review_unit`), `unreachable-read` ×2 on the same, `orphan-input` ×2 (`fan-conformance :: probe-surface`, `:: assess-unit`). §6's table claims activity-variables passes because these "live in exactly two homes"; they produce four findings there.

### F3 — a member gathered whole is a write nothing reads (2 findings) — and it lands on LF31
```
[unread-write] fan-conformance :: survey             writes 'survey_findings', which nothing in this workflow reads
[unread-write] fan-conformance :: dependency-review  writes 'dependency_findings', ... (same)
```
`tokenReads` takes the **head** of `{survey_outputs.0.result.survey_findings}`, so the member is never seen as read. `probe_findings` and `unit_verdict` escape only via the `artifactWrites` exemption (`#### artifact`). So the *exact* shape §2 assigns to the corpus as LF31 — "branch declares no artifact, the join writes the document" — is the failing one, and §9 Q5's answer is that member grain must match a **dotted segment**, not a head.

### F4 — 6 of the 14 activity-variables findings are *uncovered* by stage 3, not fixed by it
Simulated against the design's literal §1.3 graph, `activityGraph` yields:
```
scope-sweep   -> ["__terminal__", ["survey","dependency-review",{activity:"probe-unit",…}]]
combine-sweep -> [{activity:"unit-review", over:"sweep_plan.units", …}]
unreachable-read findings under the FAN graph: []
```
The BFS enqueues `next` only where `graph.has(next)`, so `reachable` collapses to `{scope-sweep}`. The same string read sits in `check-review-mode-gating.ts`'s `reviewSuccessors` (`const to = bound[exit.id]`, pushed unconditionally), so the whole subtree beyond the fan leaves `reachableInReview` and the one checkpoint is never audited. §6's "review-mode-gating: `is_review_mode` is declared … for G11's corpus arm" describes an arm that measures nothing until stage 2/3 land — and the moment they do, six reachability findings appear on the corpus workflow.

### F5 — the `revisit` cycle cannot terminate, and the obvious fix breaks `review-mode-gating`
`revisit_dependencies` is set true by the option and reset by nothing. Exit order is `revisit` (when true) then `settled` (default), so once taken the run re-enters `combine-sweep → unit-review → reconcile-review` forever and can never reach `settled`. `enumeratePaths` masks it via `maxVisits: 3`; §3.9's "third describe drives the revisit cycle" cannot complete. §2 LF24 requires "a round counter the join writes and an exit predicate over it" — the design has neither.

Repair traps: making `accept-report` set `revisit_dependencies: false` gives the *default* option a `setVariable` effect, so `hasConsequentialDefault` fires → `review-mode-gating` finding needing an `ACCEPTED_HEADLESS_AUTO_ADVANCE` entry on `main`. A counter is worse — `self-composed-set` refuses `value: "{revisit_round} + 1"`. **Clean fix:** drop `revisit_dependencies` and put `effect: { exit: revisit }` on the `revisit-dependencies` option. The exit is then chosen by the option, `defaultOption` stays effect-free, and A2 disappears with it.

---

## What the design got right (verified, not assumed)

- **audience** PASS. `isJsonArtifactName` accepts a `{token}`-templated name whose literal tail is `.json`; both human artifacts declare `human`.
- **artifact-guides** PASS. All four rows matched. `mapRowFor` splits `cells[1]` on commas and strips backticks, so §1.8's "token templates spelled verbatim" is load-bearing. Undocumented extra requirement it happens to satisfy: `mapRowTargetsResolve` requires the linked guide file to exist.
- **section-framing / citation-grain / resource-anchors** PASS. `artifact-shapes.md` opening directly on `## Probe findings` is load-bearing exactly as §1.8 says; the four slugs resolve.
- **stealth-isolation** out of scope — `workflowId = argOf('--workflow') ?? 'remediate-vuln'`, and the sweep passes no `--workflow`.
- **inherited-inputs** out of scope — omitting `techniques/TECHNIQUE.md` works, and bare-slug workflow-local techniques resolve without it.
- **Option coverage:** `enumeratePaths({maxVisits:3, maxWalks:120, maxDryWalks:50})` covers **both** `confirm-report` options and **every** transition edge (`scope-sweep:next=__terminal__` included). `option-coverage.json` needs no entries. §9 Q7's `WALKED` recommendation holds.
- **Files needed beyond §1.2:** none. No fragments, no `activities/README.md`, no root technique contract. `artifact-guides` does require `resources/README.md` + a linked guide resource, both already in §1.8. Nothing enforces the workflow README or the `workflows/README.md` row.
- Also PASS: `technique-template`, `identifier-qualification`, `description-hygiene`, `checkpoint-entry`, `checkpoint-presentation`, `decision-order`, `set-action-values`, `variable-model`, `fragments`, `when-expression`, `loop-shape`, `branch-as-step`, `activity-technique-overlap`, `self-provisioned-input`, `self-composed-set`, `launched-workflows`, `refs`, `canonical-home-map`, `pinned-corpus-paths`, `harness-adapter-set`, `bootstrap-self-contained`, `prism-lens-reachability`.

Artifacts: `/tmp/fc-corpus/fan-conformance/` (workflow as measured, repairs applied), `/tmp/fc-sweep.txt` … `/tmp/fc-sweep4.txt` (sweeps), `/tmp/fc-debug.mts`, `/tmp/fc-fangraph.mts`, `/tmp/fc-enum.mts`.
