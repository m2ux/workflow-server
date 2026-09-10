# Critique: the fan smoke test as a corpus liability

**Verdict: the design's engineering is strong and its central placement decision is wrong.** The coverage matrix, the exercise-site triage, and the guard-by-guard legality pass are better than most of what lands in this repo. But the whole thing rests on one claim — Q6's "the alternative is `tests/fixtures/`, which forfeits the automatic 33-guard sweep and the auto-discovered walk — the entire prize" — and I measured that claim. It is false. Once it falls, `fan-conformance` is a synthetic workflow in production definitions bought for nothing.

---

## 1. The central justification collapses under measurement

I built a scratch alternative root (`/tmp/fanroot`: `meta` + one real workflow) and ran the real sweep and the real walker against it.

**The guard sweep, `npx tsx scripts/check-all.ts --root /tmp/fanroot --corpus-only`: 28 of 33 corpus guards pass.** The 5 that don't fail for reasons that have nothing to do with the workflow under test:

| Guard | Why it fails on an alternative root | Cost to fix |
|---|---|---|
| `review-mode-gating` | `UNMEASURED` — `collectReviewGatingViolations` (`scripts/check-review-mode-gating.ts:191`) skips workflows not declaring `is_review_mode`, then `assertScanned(scanned, …)` throws at zero | **Zero. Self-resolves** — the fan fixture declares `is_review_mode` anyway, for G11 |
| `section-framing` | Its triage file is already root-relative (`<root>/section-framing-triage.json`); the corpus copy carries entries for absent workflows, reported stale | **Zero. Self-resolves** — the fixture root ships its own pruned triage file, no `main` coupling |
| `prism-lens-reachability` | **Crashes** with an unhandled `ENOENT: scandir '/tmp/fanroot/prism/resources'` at `scripts/check-prism-lens-reachability.ts:102` | ~3 lines: `existsSync` → exit 2 |
| `stealth-isolation` | Reports a *finding* (`workflow 'remediate-vuln' failed to load`) instead of not-applicable | ~3 lines: absent target → exit 2 |
| `binding-fidelity` | `TRIAGE` is a module constant, not root-relative, so all 72 entries off-root read as `stale-triage` | ~2 lines: `resolveWorkflowsRootWithOrigin` **already returns `origin`** — suppress stale when origin ≠ `'default'` |

Three small fixes, ~8 lines, all against an API that already exists — and all three are **pre-existing latent bugs**. A guard that crashes on a partial root is a guard that will crash in `check:delta`'s throwaway worktree or a half-provisioned submodule. Fixing them is work the repo wants regardless.

**The walk, verified end to end.** `createHarness({ workflowDir })` serves any root and `walker.ts` never touches `corpusRoot()`. I ran the real walker against the alternative root:

```
alt-root workflows: [ 'meta', 'prism-update' ]
[prism-update] running | steps=5 | unresolved=[] | loadErrors=[]
   path: discover-changes -> review-changes -> apply-updates -> verify -> commit-and-submit
```

Zero unresolved, zero load errors, `meta` shared-layer techniques resolving. **The "auto-discovered walk" is ~15 lines of test code pointed at any directory** — `readdirSync(root).filter(has workflow.yaml)` in a loop, which is literally all `tests/e2e/all-workflows-walk.test.ts:53-67` is.

So the prize is: one CI line (`check:all -- --root tests/fixtures/parallel-activities/corpus`), one 15-line walk test, and three bug fixes. That is what the design proposes to buy by putting a test fixture into the body of definitions that real runs use.

---

## 2. What every future corpus change now has to carry

### 2.1 The hostage coupling — the sharpest liability

`verify-corpus.yml` on the `workflows` branch hardcodes `ref: main` for its tooling and grades the corpus branch **tip**. It is not pinned to a commit. Therefore, permanently after the pointer bump:

> **Every unrelated corpus-branch pull request — someone fixing a `work-package` technique — is graded by `main`'s live fan implementation against a corpus containing `fan-conformance`.**

Any regression in the fan loader, the arrival-intersection operator in `src/utils/activity-variables.ts`, or the `fan-artifact-collision` family turns an unrelated corpus PR red, in a job that runs guards only and reports the failure against `fan-conformance`'s files. The corpus author has no way to pin older tooling — the `ref: main` is not parameterised.

A fixture root has exactly the inverse property: it lives on `main`, beside the code that reads it, and moves in the same commit. The design's §7 sequencing is careful about the *one-time* cross-branch dance and silent about the *permanent* coupling it installs.

### 2.2 It enters the selection menu

`list_workflows` is registered as *"List available workflows (id, title, version, tags)"* (`src/tools/workflow-tools.ts:581`) — a menu presented to every agent at bootstrap. `fan-conformance`'s stated description is *"Sweeps a repository's independent surfaces concurrently and combines them into one reconnaissance report."* That reads as a plausible, attractive recon workflow. There is no `hidden` flag, no tag the server filters, nothing.

So the cost is not only maintenance. It is **misrouting**: an agent asked to survey a repository can now select an engine test harness and run it for real. The design's honest dual-purpose README does not help — the README is not what `list_workflows` returns.

### 2.3 The baselines it joins forever

Adding 7 activities and 10 graph edges permanently changes the figures every future "zero corpus movement" criterion is written against — the delivery plan already pins *"17 workflows, 109 activities bound in graphs, 207 graph edges, 18 of them terminal"* (`delivery-plan.md:115`), and stages 3, 4, 5 each demand **byte-identical corpus guard output** (`:134`, `:143`). Those criteria are the plan's main protection for a silent hard-zero guard. After 6b, every one of them carries a synthetic definition whose findings a reviewer must mentally subtract. A fixture root is measured separately and subtracts itself.

### 2.4 Nothing stops its deletion, and its documentation cannot describe it

`coverage-roster.test.ts` only requires that a workflow *present* in the corpus be listed. Delete `workflows/fan-conformance/` and remove one `WALKED` entry and the suite is green. Nothing asserts it exists.

Worse, the one place its purpose could live is bounded against saying it. AP-40 `readme-orients-not-transcribes` forbids a workflow README from enumerating steps, exits, graph, bindings, variables or inventory counts. So the README may say "this carries the fan forms" but may not say **which forms, on which edges** — which is precisely the information a maintainer needs to know that flattening `survey`'s two exits, or dropping the `revisit` edge, destroys coverage. The coverage table in §2 of this design is the actual documentation, and it lives in a planning artifact that will be stale within two quarters.

In six months someone tidying the corpus sees a recon workflow nobody has ever run, with an oddly redundant two-exit branch and a cycle that goes nowhere, and simplifies it. Every guard stays green. The coverage is gone silently.

---

## 3. Concrete defects in the proposed definition

### 3.1 The `revisit` cycle does not terminate

`reconcile-review`'s checkpoint option `revisit-dependencies` sets `revisit_dependencies: true`. The exit `revisit` is gated `revisit_dependencies == true` and routes to `combine-sweep`. **Nothing anywhere writes `revisit_dependencies` back to false.** Second time through `reconcile-review`, the gate is still true, so `revisit` fires again. Forever.

The spec's own guidance for LF24 says the iteration ceiling *"is ordinary state — a round counter the join writes and an exit predicate over it."* The proposal takes the cycle and omits the counter. No guard in the 37 checks termination, so this ships green — a live non-terminating loop in production definitions, which is the §2 liability argument made concrete on the first attempt at authoring.

### 3.2 The corpus-wide walk never traverses the two edges that justify the cycle

`walker.ts:739` — under `autoAdvance`, when the chosen destination has been visited, `advanceToUnvisited` steers elsewhere. And under `defaultPolicy`, `reconcile-review`'s `revisit` exit is gated on an unset variable, so `pickExit` takes `settled` → `__terminal__`.

**The `revisit` edge is never taken by `all-workflows-walk`.** So LF24 (second entry resets the container) and LF27 (arrival intersection) get *nothing* from living in the corpus — they are exercised only by the hand-written smoke test, which could drive a fixture identically. Two of the design's headline corpus-only justifications are inert. The same reasoning weakens LF20: `nothing-to-sweep` is only reached with `has_probe_targets == false`, which the auto-walk does not seed.

Conversely, the coverage enumerator *does* explore the checkpoint option, so every enumerated path through it loops until `maxVisits` — inflating exactly the `WF_DRY_WALKS` plateau the design already flags as needing re-measurement.

### 3.3 G11's corpus arm proves nothing

The design correctly identifies that `review-mode-gating`'s failure mode without the graph flatten is a **silent under-report**, and correctly demands the fixture assert *the contents of the reachability set*. It then lists `fan-conformance` as the corpus arm on the strength of "zero findings." Zero findings is exactly what a silently under-reporting guard returns. The corpus arm contributes no discriminating power.

This generalises: **for every guard family whose corpus arm is "zero findings on `fan-conformance`", the corpus workflow adds nothing a clean fixture root does not already add.** That is G3-neg, G5a, G6-neg, G8-neg, G9/G10-vacuous, and G11 — six of the design's stated corpus justifications.

### 3.4 The fixture-root split is justified by a false premise

§3.8: *"A root with findings cannot also prove zero findings, so the split is structural."* It is not. These guards return a finding **list with sites**; asserting the list equals exactly the expected set on one root is both cheaper and strictly stronger than two roots, because it catches over-reporting as well as under-reporting. As written the design provisions 5 fixture roots and ~23 fixture workflows, each root needing its own `meta` stub and (per my measurement) its own `section-framing-triage.json` if swept. Consolidate to one root and assert exact finding sets.

### 3.5 One correction in the design's favour

I verified `gathered_results` **is** a declared output of `meta/techniques/orchestration-patterns/gather-results.md`, and that the coverage walk uses `Promise.all` (`tests/e2e/option-coverage.test.ts:131`) so the "wall clock is the slowest walk, not the sum" claim is right. Also note `DEFAULT_BATCH_MAX_ACTIVITIES = 3` (`src/config.ts:165`), so the 5-branch fan genuinely exceeds the batch bound and D10 is load-bearing, as claimed.

---

## 4. Where this smoke test passes and the feature is broken anyway

Three named failure modes, in ascending severity.

### 4.1 The agent-led premise is never tested

The feature's defining property is *"Execution is agent-led: an orchestrator emits several dispatches in one turn. There is no mechanical runner."* The smoke test is a scripted sequence of `next_activity` / `get_activity` calls issued by a test process that already knows every branch id, every instance index and every agent identity.

It asserts N1 (distinct identities per branch) **by supplying distinct identities**. It asserts N5 (a worker executes what it was dispatched for) by passing the correct `activity_id`. It asserts N3/N4 (pre-spawn commit, convergence persist) from the call sequence the test itself made.

So: the server can be perfectly correct and the feature entirely unusable — `dispatch-fan.md`'s Protocol could be unfollowable, the delivered `_meta.fan.branches` could be in a shape no orchestrator can act on, the barrier reading could be invisible in the rendered response — and this test is green. **Everything the feature actually depends on an agent doing is asserted by the test doing it instead.** The design half-admits this only under D4.

### 4.2 The list-fan misroute is unrefusable and unasserted

The design states it under D4 and then moves on: for a list fan the membership test admits every branch, so a worker whose prompt names a sibling's activity **is served that sibling's body**, and nothing refuses it. In a real five-worker fan with real agents, a worker reading the wrong brief is the single most likely defect. The smoke test passes the right `activity_id` every time, so it cannot see it. This is a design gap being recorded as a test limitation.

### 4.3 The sharpest one: two final retirements in flight, and N8 colliding with T3b

This is the concrete failure mode I would bet on.

Retirement is `next_activity`, and `next_activity` is a **writer** doing read-whole-file / modify / compare-and-swap (`persistSessionFile`, `src/utils/session/store.ts:369-398`). Measured behaviour today for two concurrent `next_activity` calls: one wins, one gets `STALE_WRITE`.

Now take a five-branch fan with two branches retiring simultaneously as the last two. Both read a frontier of length 2. Both compose a write removing themselves. One persists; the other is refused. Per **N8** the orchestrator repeats the refused call with the same arguments. On the repeat the frontier holds only that branch — fine, it retires, the frontier empties, the join is entered once. Correct.

But per **T3b as the design specifies it**, a repeated retirement is refused *because it holds no open branch*. If the implementation cannot distinguish "my write was lost to CAS, retry me" from "I already retired, refuse me", then either:

- it treats the retry as a duplicate and refuses → **the last branch can never retire and the join is never entered**; or
- it treats a genuine duplicate as a retry → **the join is entered twice**, violating D1.

The design's own two assertions sit on opposite sides of this and never meet: §3.6 T3b asserts *a repeated retirement is refused*, §3.7 asserts *each repeat succeeds* — but §3.7 only ever puts **`get_activity`** calls in flight, never `next_activity`. Step 6 of the smoke run retires all five **sequentially**. So the one interleaving that can double-enter the join or deadlock the barrier is the one interleaving nothing exercises.

**Fix:** §3.7 must put two *retirements* in flight, and specifically the final two, and assert exactly one `activity_entered` event for the join plus a successful retry. Add a permutation sweep over retirement orders (5 branches = 120; even 10 sampled orderings is worth more than the single hand-picked one), because D1's "order of return does not matter" is asserted today by trying two orders.

---

## 5. Is the plan executable in sequence?

Mostly yes, and the branch analysis is the strongest part of the document. Three problems:

1. **A `check:*` npm script for the second root breaks the suite.** `tests/guard-registry.test.ts:59-62` asserts every `check:*` script in `package.json` has a registry entry, exempting only `check:all` and `check:delta`. Invoke the fan-root sweep as `npm run check:all -- --root …` from CI, or name it outside the `check:` namespace. This bites either shape of the deliverable and is unmentioned.
2. **Q1 is correctly identified as blocking and is under-weighted.** `binding-fidelity` today has no producer model for the fan parameter or the derived container. Q1 says the minimum fix is extending the producer model. That is stage-4 scope work the delivery plan does not carry, and until it lands `fan-conformance` needs three-plus triage entries on `main` — a ledger recording a tooling gap as accepted debt, in the guard with the repo's largest ledger. **This should be promoted from an open question to a stage-4 blocking dependency**, because the corpus workflow cannot be green without it while a fixture can simply not be swept by that guard.
3. **Q8 is a real risk being deferred to authoring time.** Fine as a method, but it is the second time the `revisit` edge causes trouble (see §3.1, §3.2). Drop the edge.

---

## 6. What replaces it

Keep §§2–5 of the design almost entirely — the coverage matrix, the exercise-site triage, the D-table assertion strategy, the §3.9 smoke sequence. Change only *where the legal-form specimen lives*.

**Land one committed, swept, walked fan corpus at `tests/fixtures/parallel-activities/corpus/`.** Not "a fixture the guards never see" — a **second first-class corpus root**, holding `fan-conformance` verbatim as designed plus a `meta` stub and the illegal/guard-finding workflows in sibling roots.

1. **Three guard robustness fixes** (~8 lines total), landed at stage 1 as their own commit: `check-prism-lens-reachability.ts:102` exits 2 on an absent prism catalog; `check-stealth-isolation.ts` exits 2 when its target workflow is not in the root; `check-binding-fidelity.ts` suppresses `stale-triage` when `resolveWorkflowsRootWithOrigin` reports an origin other than `'default'`. Each is a latent-bug fix with independent value.
2. **One CI step in `verify.yml`**: `npm run check:all -- --root tests/fixtures/parallel-activities/corpus --corpus-only`. All 33 guards, automatic, nothing to remember — the design's prize, obtained.
3. **One 15-line walk test**, `tests/e2e/fan-corpus-walk.test.ts`, scanning that root for `workflow.yaml` and driving each through `walk(h, wf, defaultPolicy, { mode: 'graph', autoAdvance: true })` — verified working above. Auto-discovery, obtained.
4. **Consolidate the fixture roots** from 5 to 2 (one legal+clean, one findings), asserting **exact finding sets** rather than presence on one root and absence on another.
5. **Fix the definition**: drop the `revisit` edge and its unreset variable; move LF24 and LF27 to a dedicated fixture workflow where the smoke test drives the cycle deliberately with a round counter, since the auto-walk never traverses it anyway.
6. **Strengthen the smoke run** with the §4.3 concurrency case: two final retirements in flight, one `activity_entered` for the join, a successful retry; plus sampled retirement permutations.
7. **Stage 7 keeps the real corpus fan** — `cicd-pipeline-security-audit`, an existing workflow doing real work, adopting a fan because it genuinely wants one. That is where the corpus earns a fan.

What this gives up: nothing measurable. The delivery plan's stage-6 criterion is satisfied more strongly than "a fixture fan" (a *guard-swept, walked* fixture corpus), the sequencing collapses from four cross-branch steps to one `main` PR, `verify-corpus.yml` never grades unrelated corpus PRs against fan machinery, no synthetic definition enters `list_workflows`, and no baseline count moves.

**The one question that survives.** If a maintainer's answer to Q6 is "I want a fan in the corpus so that corpus authors read one and copy it", that is a legitimate reason — but it is a *documentation* reason, and it is answered by stage 7's `cicd-pipeline-security-audit` adoption, not by a specimen. If it is "I want the corpus-wide sweep and walk to cover a fan automatically", that is answered by the three-fix, two-line-of-CI alternative above, and `fan-conformance` should not be created.
