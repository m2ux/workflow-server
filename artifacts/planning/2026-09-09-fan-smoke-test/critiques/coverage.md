## Verdict

The design's coverage claim does not hold. The matrix's 36 legal forms and 61 refusal cases are largely accounted for, but **three of the 24 claimed corpus attributions are wrong or vacuous**, **four of the twelve unrepresentable substitutes prove less than they state**, **the corpus workflow itself carries two defects that make its own assertions unreachable**, and **at least eleven interaction permutations neither the matrix nor the design considers** are legal, reachable, and unexercised — several of them missing load rules rather than missing tests.

Verified against the repo: `DEFAULT_BATCH_MAX_ACTIVITIES = 3` (`src/config.ts:165`), the variable `type` enum carries `array` and `object` as distinct values (`src/schema/variable.schema.ts:13`), `variable-seed.ts:27` derives `'array'` for arrays, `validateActivityTransition` returns a **warning string** not a refusal (`src/utils/validation.ts:49`), `collectReviewGatingViolations` short-circuits per workflow on `is_review_mode` being declared (`scripts/check-review-mode-gating.ts:191`), the existing checkpoint instance discriminator is **non-numeric** (`assumption-decision#RE-1`, `workflow-loader.ts:444`), and `ARTIFACT_NAME_PATTERN` does admit `{review_unit.id}` (`technique.schema.ts:54`).

---

## A. Matrix entries the design does not actually cover

### A1 — The last branch can enter something other than the join, and no test tries it (severity: highest)

D1's substitute asserts the join is not entered **early**: shrinking `pending`, `met` flipping once, one `activity_entered` event on the *correct* call sequence. It never asserts the join is entered **at all rather than bypassed**.

Step 4 of the resolution rule is "Enter `activity_id` if and only if the frontier is now empty." Nothing in the spec checks `activity_id` against the derived join. The only thing that looks at a destination today is `validateActivityTransition`, which is advisory — confirmed, it returns a string that lands in `_meta.validation.warnings`.

So on the fifth retirement the orchestrator can pass `__terminal__` and complete the run with the join never executed, or pass `reconcile-review` and skip `combine-sweep` entirely. And mid-fan (retirements 1–4) a wrong `activity_id` is **silently discarded**, because step 4 does not fire — so an orchestrator can disagree with the graph four times with no signal at all.

Exercising fragment, on the corpus fan:

```
# retirements 1..4 — assert the disagreement is refused, not discarded
next_activity { from_activity: 'probe-unit#0', exit: 'probed', activity_id: 'reconcile-review' }

# retirement 5 — assert the join is entered, or the call refused
next_activity { from_activity: 'probe-unit#2', exit: 'probed', activity_id: '__terminal__' }
  → assert isError, or assert frontier === ['combine-sweep'] and status !== 'completed'
```

This is the single largest hole. D1 as written is satisfied by an implementation that enters whatever the caller names.

### A2 — LF6 is attributed to the wrong form

The design maps LF6 (instance fan, `maxInstances` omitted) to "the fan member of `scope-sweep.scoped`". That is a **list member**, reached through `instanceFans(destination)`. LF6's form is a **whole destination**, reached through `instanceFan(destination)` — a different helper in the spec's own block (`workflow.schema.ts` derivations). The corpus's only whole-destination fan, `combine-sweep.swept`, declares `maxInstances: 3`.

Consequence: the corpus never exercises default-ceiling resolution through the whole-destination path, and T1b (the configured-default refusal message) is asserted only through the member path. Fix is one edit — drop `maxInstances: 3` from `combine-sweep.swept` and move LF7's declared tighter ceiling onto the `probe-unit` member of `scope-sweep.scoped`, where the reason comment reads just as well.

### A3 — LF16's boundary is tested against the wrong ceiling, and the discriminating case is absent

LF16 seeds `probe_targets` of length 4 against the default of 4 — the member path, no declared ceiling. T1a seeds 5 against `maxInstances: 3`, which exceeds the declared bound (3) **and** the default (4). So **nothing in the design proves the declared bound is read rather than the default**. An implementation that always reads `DEFAULT_FAN_MAX_INSTANCES` passes every ceiling test in the design.

Two missing cases, both on `combine-sweep.swept`:

```
sweep_plan.units of length 3  → must ENTER   (inclusive at the declared bound)
sweep_plan.units of length 4  → must REFUSE, naming 3 and "the maxInstances this destination declares"
                                (over the declared bound, at-or-under the default)
```

The width-4 case is the only one that distinguishes the two ceiling sources.

### A4 — LF31 has no instance-fan arm anywhere, in corpus or fixture

"A fan branch declares no artifact, and the activity the fan converges on writes the document" is the spec's artifact **rule** (README:2070) and the shape that makes G9/G10 *vacuous* rather than failing open. The design covers it only for the two bare list members (`survey`, `dependency-review`). Both instance-fanned activities — `probe-unit` and `unit-review` — declare token-templated artifacts, i.e. LF32, the *sanctioned deviation*.

The design's own Q1 concedes LF31 "is unreachable for an instance fan" without a `dead-output` extension. That is a coverage hole presented as an open question: the rule's shape is untested for the form the rule was written for, and G10's vacuity is asserted only where the fan is a list.

Fragment — drop `assess-unit.md`'s artifact entirely and let `reconcile-review` be the sole writer:

```yaml
# techniques/assess-unit.md — Outputs: unit_verdict, NO #### artifact block
# activities/06-reconcile-review.yaml writes recon-report.md, the only writer
```

Then G10 is asserted **vacuous** for `unit-review` and asserted **non-vacuous** for `probe-unit` (which keeps `{probe_unit}-probe-findings.json`). Both arms of the artifact decision land on the corpus, and Q1's blocker becomes a two-site question instead of a four-site one.

---

## B. Unrepresentable substitutes that prove less than they state

### B1 — U2's container-type assertion is unsatisfiable, and cements a spec contradiction

The design asserts "The container's declared type matches what it holds — an object for a list fan, an array for an instance fan."

The spec says both of these:
- README:515 / 1963 — a list-fan container's contributed declaration is an **object**;
- README:747 / 756 — the container is a **dense array**, index uniform, "including slot zero for a fan of distinct activities"; and LF34's read is `{survey_outputs.0.result.survey_findings}`.

So `survey_outputs` is declared `object` and materialised as a one-slot dense array. `array` and `object` are distinct declared types (verified), and the write path derives `'array'` for an array (verified) — so **every list-fan enter emits a declared-type warning**, and the design's own U2 test either fails or is written to match the declaration and thereby hides it.

The mixed list on `scope-sweep.scoped` is precisely where this bites, and it is the design's flagship edge. Add:

```
at the fan enter, assert _meta.validation.warnings === []
and assert declaredType('survey_outputs') === valueType(bag.survey_outputs)
```

and resolve the spec first. This belongs in the design's §8 contradictions list; it is not there.

### B2 — D6 and D8 are proved only under serialised retirement

The design's T7 test fires five concurrent `get_activity` calls. But `get_activity` writes delivery records; **`next_activity` writes the container**. The race that can cross slots or lose order is concurrent *retirement*, and the design never issues one. D6 ("no instance writes into another instance's slot"), D8 ("order is the collection's order") and D1 ("entered once") are all asserted against out-of-order-but-sequential returns.

Fragment:

```ts
await Promise.all([0,1,2].map(k => call('next_activity', {
  session_index, from_activity: `unit-review#${k}`, exit: 'reviewed',
  activity_id: 'reconcile-review', variables_changed: { unit_verdict: { slot: k } },
})));
// 1 admitted + 2 STALE_WRITE; repeat each refusal;
// then assert: each slot's result is its own k, slot order === sweep_plan.units order,
// exactly one activity_entered for reconcile-review, no slot overwritten
```

### B3 — D4's honest limit is stated but the *effective* half is not asserted

The design correctly records that N5 is ineffective for a list fan. It does not assert the effective half for an instance fan beyond "the response reports the instance-qualified id back". The load-bearing assertion is the **redelivery detector**: spec README:2142 says keyed on a base id "a *correct* fan of N fires it N−1 times and buries the one event that matters". So:

```
correct 3-instance fan → assert ZERO activity_redelivered events
two get_activity for 'unit-review#1' under two distinct agent_ids → assert EXACTLY ONE
```

The detector exists (`src/utils/dispatch.ts`, `src/utils/batch.ts` — verified). Neither assertion is in the design.

### B4 — D7's unfilled slot is provoked artificially, never through replacement

The design leaves an instance unretired. The spec's actual path to an unfilled slot is **branch replacement** (README:1104): "a replacement names the same entry, which the frontier still holds, so it needs no re-binding call, and whichever report arrives first retires the entry while the second is refused as holding no open branch." T3b covers the second-report refusal. Nothing covers a *second worker taking the same entry under a new identity and returning first*, which is the only realistic producer of the `Unfilled` state in the container's own lifecycle diagram (README:778).

---

## C. Defects in the corpus workflow that make its own assertions unreachable

### C1 — `fan-conformance` livelocks on the `revisit-dependencies` option

`reconcile-review`'s exits are ordered `revisit` (when `revisit_dependencies == true`) before `settled` (default). The checkpoint sets `revisit_dependencies: true`. **Nothing ever clears it** — `combine-sweep` does not write it, and no step is gated on it (the design says so explicitly, to satisfy `decision-order`). So once that option is taken the run cycles `combine-sweep → unit-review×N → reconcile-review → combine-sweep` forever.

Consequences the design does not see:
- `all-workflows-walk` passes, because `defaultPolicy` takes `defaultOption: accept-report`. The defect is invisible to the guard-and-walk sweep the design's §6 relies on.
- The option-coverage enumerator explores `revisit-dependencies` and never terminates that path, hitting `maxVisits`. That surfaces as **unreached options** — a definitions defect — which is exactly the failure mode the design's §7 dry-walk paragraph attributes to the budget. The design's Q7 recommendation (`WALKED`) walks straight into it.
- The design's third smoke `describe` (LF24, the revisit cycle) cannot reach a completed session, so LF24's D9 assertion has no terminating run to make it on.

Fix: `combine-sweep` clears `revisit_dependencies`, or the `revisit` exit is gated on a round counter the join writes. Either way it is a real edit, and until it lands LF24 and LF27 are both unexercised.

### C2 — The `revisit` edge does not do what its option says, so LF24 exercises nothing

The option is labelled "Revisit dependencies" and routes to `combine-sweep`. `dependency-review` is a fan-1 branch, **upstream** of `combine-sweep`, and is not re-run. No step in `combine-sweep` or `unit-review` is gated on `revisit_dependencies`. So the second pass is byte-identical to the first: the same `sweep_plan`, the same fan-2 width, the same container. LF24's stated purpose — "the second entry materialises the container afresh, so a round-two collection of two elements leaves a two-slot container with no residue" — cannot be observed, because round two's collection is round one's.

To exercise D9 the second entry must produce a *different* collection. Fragment: route `revisit` to `scope-sweep` (re-scoping, so `probe_targets` and then `sweep_plan.units` genuinely change) and gate the escape on a round counter — which also fixes C1.

### C3 — Fan 2 has no route past an empty collection, violating the spec's own remedy

`combine-sweep` declares exactly one exit, `swept`, bound to the instance fan over `sweep_plan.units`. `sweep_plan` is written by `combine-sweep`'s own `combine-surfaces` step. A sweep that finds nothing to review yields `units: []`, T1c refuses the fan enter, and there is **no sibling exit** to take. The run is stuck at an activity whose only exit cannot be taken.

The spec's prescribed remedy is "Route past the fan with a `when` predicate on the exit where there may be nothing to fan" (README:1798). The design applies it to fan 1 (`nothing-to-sweep`) and not to fan 2. Fragment:

```yaml
# activities/04-combine-sweep.yaml
exits:
  - id: nothing-to-review
    when: has_review_units == false
  - id: swept
    isDefault: true
# workflow.yaml
  combine-sweep:
    nothing-to-review: reconcile-review
    swept: { activity: unit-review, over: sweep_plan.units, variable: review_unit, maxInstances: 3 }
```

This also gives LF20 a second instance, and gives T2 a second, sharper fixture (a source with one fanning and one non-fanning exit at the *second* fan, where the destination is a whole-destination object rather than a list).

### C4 — N4 is asserted at a site where it cannot hold

Spec README:2126: the convergence persist is "**One** persist, naming every branch, **before the first branch's transition**." That is the orchestrator's, inside `dispatch-fan`'s protocol. The design puts `persist-the-sweep` as the last step of `combine-sweep` — the join, which is entered only *after* the last branch retires.

So the design's smoke step 13 ("one persist at convergence naming every branch (N3, N4)") measures a step that runs at the wrong moment, and on a real run there will be **two** persists per fan: the orchestrator's pre-first-transition one and the join's own step. Either the assertion fails on the count, or it passes by measuring the wrong event. Same for `reconcile-review`'s `persist-the-report`.

### C5 — The usage count is wrong

Step 12 asserts "eight figures". The run dispatches eleven activities: `scope-sweep`, five fan-1 branches, `combine-sweep`, three fan-2 branches, `reconcile-review`. Trivial arithmetic, but it is the acceptance number for N2 and for the activities-without-usage diff.

### C6 — `expected_ids` is bound two different ways in one workflow, unremarked

`combine-sweep` binds `expected_ids: probe_targets` (bare rename); `reconcile-review` binds `expected_ids: "{sweep_plan.units}"` (braced projection). `gather-results` documents the braced form (`{work_units}`, verified in `workflows/meta/techniques/orchestration-patterns/gather-results.md`); the spec's own examples use the bare form. `binding-fidelity`'s arg-conformance resolves a rename and an interpolation through different producer paths, so the two sites exercise different code — which is fine if deliberate and asserted, and a latent inconsistency if not. Nothing in the design mentions it.

### C7 — The G11 fixture will pass vacuously as specified

`collectReviewGatingViolations` skips any workflow whose `workflow.yaml` `variables[]` omits `is_review_mode` (verified, line 191). The design's fixture `review-mode/gate-beyond-a-fan/` is described as "raw YAML" with no mention of declaring it. Without the declaration the guard never looks at the workflow, the finding does not fire, and the *negative* half the design correctly insists on — "assert the reachability **set's** contents, not merely that some finding appeared" — measures an empty set. Add the declaration explicitly to the fixture spec; this is the exact silent-under-report class the guard exists for.

---

## D. Permutations neither the matrix nor the design considers

Each is legal under S1–S5 and L1–L14 as written, reachable, and unexercised.

### D1 — A fanned activity may launch a child workflow, and every instance is then refused at run time

L14 covers the git and version-control groups and the persist operation. **Nothing forbids `workflow-engine::handle-sub-workflow` in a branch.** T6 refuses `dispatch_child` whenever several activities are in flight. So such a definition loads clean through all fourteen rules *and* `launched-workflows`, and is unexecutable.

```yaml
# activities/03-probe-unit.yaml — a fan branch
triggers: [remediate-vuln]
steps:
  - kind: technique
    id: run-child
    technique: workflow-engine::handle-sub-workflow
```

This is the same shape as the gate ban: an instruction reaching a role that cannot act on it, "settled at load rather than left for a worker to discover" (README:539). It wants a fifteenth load rule, and the design's U1 assertion "the rule count is fourteen" would enshrine the gap instead.

### D2 — A branch whose single exit is `when`-gated deadlocks the session, and nothing refuses it

`isDefault` is mandatory only with two or more exits. A branch with one gated exit whose gate is false has no exit to report, so its frontier entry never retires and the barrier never releases. Sequentially this stalls one cursor; in a fan it stalls the whole session, because every sibling's return enters nothing.

```yaml
# activities/03-probe-unit.yaml
exits:
  - id: probed
    when: probe_findings_present == true
```

Candidate rule: a branch declares at least one ungated exit. No matrix row, no test, no mention.

### D3 — A fan whose join **is** its own source

```yaml
graph:
  scope-sweep:
    scoped: [survey, dependency-review]
  survey:            { thorough: scope-sweep }
  dependency-review: { reviewed: scope-sweep }
```

Not L5 (branches do not fan), not L6 (no branch routes onto itself), L7 satisfied (both name one activity), L8 satisfied (it is an activity). Legal. Spec README:527 forbids "a branch the activity the fan comes from" and "the join one of its own branches" — **never join == source**. It re-enters the fan on every convergence, resets the container each round, and terminates only through a predicated escape exit on the source. Both L5b and L6b are asserted to fail "with no rule of its own"; this third variant has no rule at all and no test.

### D4 — Two distinct fans converging on one join

```yaml
graph:
  scope-sweep: { scoped: [survey, dependency-review] }
  triage:      { triaged: { activity: probe-unit, over: probe_targets, variable: probe_unit } }
  survey:            { thorough: combine-sweep }
  dependency-review: { reviewed: combine-sweep }
  probe-unit:        { probed: combine-sweep }
  combine-sweep:     { swept: __terminal__ }
```

`combine-sweep` now has **two fan arrivals**. The spec's meet ("a completed fan is one arrival contributing the union of its branches") is written for one. Two union arrivals intersect, so `combine-sweep` can only declare reads that *both* fans satisfy — a read of `probe_unit_outputs` is satisfied on fan B's arrival only and is reported by G5. That is a real design consequence nobody has written down, and the intersection-of-two-unions path is a code path the design's G5a fixture (one fan + one ordinary arrival, LF27's shape) never reaches.

### D5 — One activity fanned from two positions, which is also where LF29's fixture placement forfeits real coverage

Because exit bindings are per-activity, a second fan of one activity necessarily converges on the *same* join, and that join must not be the second fan's source (else L6b). The only legal shape is two non-join sources. In `fan-conformance` that is one edit — replace `reconcile-review.revisit: combine-sweep` with a second fan of `probe-unit`:

```yaml
  reconcile-review:
    revisit:
      activity: probe-unit
      over: retry_targets
      variable: probe_unit      # the SAME parameter name — L11 agreement
    settled: __terminal__
```

This puts LF29 on the corpus **and** hands the arrival analysis two fan arrivals of the *same* activity at one join — the "an arrival is built over distinct branch ids; the union is idempotent so a naive iteration is harmless for correctness, but per-branch bookkeeping keyed on the activity writes N times over one slot" trap the spec names at README:2022. No fixture in the design reaches it. The design dismisses LF29 as "needs a second source exit for no guard gain"; the guard gain is exactly this.

### D6 — A fan over a previous fan's container is legal and produces a false guard finding

```yaml
  combine-sweep:
    swept:
      activity: unit-review
      over: probe_unit_outputs      # the container fan 1's branch filled
      variable: review_unit
```

L12's head check passes: the merge contributes `probe_unit_outputs` to the merged variable set. Elements are `{id, result}` records, so ids are derivable and unique by construction — T1e and T1f can never fire. But the synthetic collection read is attributed to the **branch** as a read of `probe_unit_outputs`, a bare container name, and the spec is explicit that "the container's presence in the merged set does not bless a bare read, because the read test resolves against members" (README:1912). So a legal graph manufactures a G1/G2 finding inside a hard-zero guard. Nothing covers it in either direction.

### D7 — `variable` colliding with `over`, or with the fanned activity's own declared write

L11 requires only that the parameter be among the activity's *reads*.

```yaml
      activity: probe-unit
      over: probe_targets
      variable: probe_targets        # projection shadows the collection at one bag name
```

The projection is overlaid onto the bag the eager-bundling decision reads (README:1154), so the instance's own view of its collection is replaced by its element. And:

```yaml
# activities/03-probe-unit.yaml
variables:
  reads:  [probe_findings]
  writes: [{ name: probe_findings, type: object }]   # reads its element at a name it also writes
```

The wrap then lands `probe_unit_outputs.probe_findings` at a name the activity reads as a read-only projection, against the spec's "Nothing writes the parameter." Neither collision is checked or tested.

### D8 — Both instance-id populations never coexist in one session

Verified: the existing loop-body checkpoint discriminator is **non-numeric** (`assumption-decision#RE-1`), while a fan's is `/^\d+$/`. `baseId` is shared; `instanceIndex` returns `undefined` for the checkpoint form; the wrap takes "the slot index from the entry". `fan-conformance` has no loop-body checkpoint — L9 forbids one in a branch, and `reconcile-review`'s checkpoint is not in a loop — so no session ever holds both. `tests/fan-instance-ids.test.ts` covers the helpers over both populations in isolation, which is not the same as a session carrying both.

```yaml
# activities/06-reconcile-review.yaml — the join
steps:
  - kind: technique
    id: gather-unit-verdicts
    technique: { name: orchestration-patterns::gather-results, inputs: {...} }
  - kind: loop
    id: confirm-each-unit
    loopType: forEach
    over: sweep_plan.units
    variable: confirm_unit
    steps:
      - kind: checkpoint
        id: confirm-report
        ...
```

The session then holds `confirm-report#docs` as a checkpoint response key while its history carries `unit-review#0` as a frontier entry. Assert the checkpoint resolves to its base definition and that nothing treats `#docs` as a slot index.

### D9 — A checkpoint option whose `effect.exit` names the fanning exit

```yaml
# activities/00-scope-sweep.yaml
steps:
  - kind: action
    id: announce-start
  - kind: checkpoint
    id: confirm-scope
    options:
      - id: sweep-now
        effect: { exit: scoped }              # exits onto the fan
      - id: skip
        effect: { exit: nothing-to-sweep }
    defaultOption: sweep-now
```

Two untested interactions at once. Does a checkpoint-driven exit satisfy T2's "`exit` is required on this transition"? And `review-mode-gating` fires on a `defaultOption` carrying an `exit` effect — so this is the one shape where opening a fan is itself the consequential default, in a workflow that deliberately declares `is_review_mode`. Neither the matrix nor the design considers a gate *choosing* to fan.

### D10 — A fan's width can never be chosen at a gate, and the spec does not say so

A checkpoint `setVariable` writes a scalar literal validated against the target's declared `values` set, so **no gate can produce an array**. Combined with LF20, the only user-facing control over a fan is whether it opens — never how wide. That is a real limit belonging in "What no check reaches", and it can be asserted negatively: a `setVariable` targeting a fan's collection is rejected by `variable-model`'s declared-type check.

### D11 — Per-instance technique-fetch crediting, and the README link slot

Two spec claims with no assertion:

- README:2141 — the technique-fetch validator "scopes a visit to the last entry event for the named activity and already filters on the agent identity, so … one instance's fetches cannot credit another's manifest." Three instances fetching the same technique is the case; the design asserts only the membership test for `get_technique` (T4a).
- README:2121 — "two completion marks are not [idempotent], because the completion step repoints an item's link at the delivered artifact and N instances landing N files would fight over one link slot", and instance artifacts get no row. The design writes three `{probe_unit}-probe-findings.json` files and asserts only their existence. Nothing asserts the fanned activity's single row's link after convergence, nor that the completion step runs once rather than per instance.

### D12 — A mixed list has no total-branch bound at all

The design's Q3 raises a *list's* unbounded arity. It misses the compound case: a mixed list's total width is `(bare members) + Σ(per-member collection lengths)`, and only the fan members are bounded. A three-member list with two fans at the default ceiling opens up to 9 workers with no single check seeing the total. `scope-sweep.scoped` at four probe targets already opens 6 — above `DEFAULT_BATCH_MAX_ACTIVITIES = 3`, which incidentally means **D10 is free on the corpus** and the design puts it in a fixture.

---

## E. What to change, ranked

1. Add the destination-disagreement tests (A1). Refusing a last-return that names something other than the derived join is either new behaviour or an accepted hole; either way it must be a decision, not an omission.
2. Fix C1/C2/C3 in the workflow before writing any test against it — the livelock, the inert `revisit` edge, and fan 2's missing route past an empty collection. LF20, LF24 and LF27 are all unexercised until then.
3. Resolve the container-type contradiction (B1) and add it to §8. The design currently asserts something the spec makes false, on its own flagship edge.
4. Move LF31's instance arm onto the corpus by dropping `assess-unit`'s artifact (A4). This shrinks Q1's blast radius from four sites to two and gives G10 both a vacuous and a non-vacuous arm.
5. Re-attribute LF6 and add the two missing ceiling boundaries (A2, A3). One graph edit plus two seeded widths.
6. Add concurrent retirement (B2), the redelivery-silence pair (B3) and one replacement scenario (B4).
7. Decide D1 and D2 as load rules — a fanned activity binding a child-workflow launch, and a branch with no ungated exit — before U1's "the rule count is fourteen" is asserted anywhere.
8. Take D5's one-line edit: it buys LF29 on the corpus plus the same-activity two-arrival trap, at the cost of the edge C2 shows is doing nothing anyway.
9. Add the G11 fixture's `is_review_mode` declaration (C7), or the positive arm is vacuous.
10. Fix the usage count (C5) and settle the `expected_ids` binding form (C6).
