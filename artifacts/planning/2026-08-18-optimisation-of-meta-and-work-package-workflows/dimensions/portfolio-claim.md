---
target: /home/mike1/projects/dev/workflow-server
date: 2026-08-18
lens: claim (07)
dimension: Change Economics
---

# Change Economics — the claims the programme rests on

## Summary

The remaining optimisation programme is priced on eight empirical claims about measurement,
causation, cost and safety. This artifact states each one, tests it against the scripts, the
continuous-integration configuration, the schemas, the tests and the git history, and returns a
verdict with the experiment that would settle it.

Three claims hold. Three hold in part and are priced wrongly as a result. Two fail.

The single most consequential result is that the delivery-cost instrument and the delivery-cost
gate have been treated as one thing, and they are not. Three consecutive walks recorded
1,302,319 characters with zero variance between them — the instrument resolves one character.
The gate ignores everything under 13,023 characters and, being one-sided, never fires on a
saving at all. Every statement in the prior report of the form "this saving is below the
instrument's resolution" is a statement about a threshold constant, not about a measurement
limit, and the constant is a flag.

The second is that the ordering advice in the prior report was derived from a cost model for
definition edits that measurement does not support. A definition-only landing costs five files
in the superproject, always the same five, three of them machine-regenerated. It was measured
twice, and both times it was the same five files and roughly thirty lines.

## What was measured, and how

Everything below is measured on the tree at `1297e655` with the corpus at the pinned
`72db28ae` gitlink. Where a figure comes from a run rather than a file, the run is named.

| Instrument | Invocation | Result |
|---|---|---|
| Delivery-cost benchmark, run 1 | `bench:token --label=probe1 --context-mode=fresh` | 1,302,319 characters, 242 calls |
| Delivery-cost benchmark, run 2 | same | 1,302,319 characters, 242 calls |
| Delivery-cost gate | `bench:token --label=timing --context-mode=fresh --gate` | PASS at 0%, 10.4 s wall |
| Guard sweep | `npm run check:all` | 28 guards, 1.7 s |
| Test suite | `npm run test:ci` | 1,049 tests, 1,034 pass, 1 fail, 37.5 s |
| Typecheck | `npm run typecheck` | clean, 1.7 s |
| Session census | `sessions:census --workflow meta` / `--workflow work-package` | 59 meta, 24 work-package; 55 and 9 still `running` |

The single test failure is `tests/e2e/snapshot.test.ts:37`, and it is itself evidence — see
claim C6.

## C1 — The 26.8% delivery fall was caused by the remediation

**The claim.** Delivery moved 1,355,532 (July) → 1,780,292 (pre-remediation) → 1,302,319 (now),
and the 26.8% fall between the last two is attributable to the work merged 2026-08-17/18 rather
than to a change in how the number is taken, a change in what is walked, or churn in the
definitions being walked.

**Evidence for.** The instrument did not change in any way that moves a number. The benchmark
script was touched in both remediation commits and both diffs are inert:
`ab810342` changed the default reference path constant
(`scripts/run-token-benchmark.ts:170`), a scorecard label and a doc block; `64085235` replaced
five lines of doc comment with a pointer. The probe logic — `HOT_RESOURCES`
(`scripts/run-token-benchmark.ts:160-168`), `bundledResourceIdsFromOps` (:364-372), the
`extractResourceIds` sweep on every `get_technique` and `get_activity` (:452-474) — is byte-for-byte
what it was before the remediation.

The workload did not change either. Both fixtures record the same twelve-activity path and the
same terminal status, and the tool-call profile moved only where the definitions were
deliberately edited: `yield_checkpoint` 11 → 10, `get_technique` 23 → 24.

The fall is also concentrated exactly where the remediation acted. Taking the components:

| Call | July A0 | Pre-remediation | First post-remediation | Today |
|---|---:|---:|---:|---:|
| `get_activity` | 687,936 | 987,370 | 518,185 | 520,075 |
| `get_workflow` | 59,455 | ~108,280 | 108,280 | 108,356 |
| `get_resource` | 448,084 | ~527,683 | 527,683 | 527,683 |
| `get_technique` | 160,057 | ~156,959 | 141,991 | 146,205 |
| **Total** | **1,355,532** | **1,780,292** | **1,296,139** | **1,302,319** |

The pre-remediation column carries a tilde on three rows because only the total and
`get_activity` were recorded at the time; the other three are derived from the total, and the
`get_technique` figure is the residual. The July and post-remediation columns are committed
fixtures.

`get_activity` accounts for 467,295 of the 477,973-character fall — **97.8%**. The other three
calls together moved 14,968 characters. A regression concentrated in one response type, removed
by a change that acts on that response type, is a strong causal signal.

**Evidence against.** Three qualifications, and the third is material.

First, the fall is not the fall the plan states. `ab810342` recorded 1,296,139 and the commit
message claims 27.2%. Two subsequent corpus adoptions put 6,180 characters back — `+621` at
`cf4d0774` and `+5,559` at `72db28ae`. So the correct decomposition is a 27.2% server-side fall
followed by 0.47% of definition-side regrowth in twenty-four hours. Both adoption commits
re-recorded the fixture and both said in its `description` what the corpus bought, which is the
gate behaving as designed — but the composite figure 26.8% is not a single event and should
never be quoted as one.

Second, attribution *within* the remediation does not survive. `ab810342` changed
`src/loaders/technique-loader.ts`, `src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`,
`src/utils/delivery.ts`, added `src/utils/gate-liveness.ts`, and bumped the corpus gitlink to
`34cd5429` — all in one commit, with no ablation recorded. The fixtures cannot separate them.
What they can bound is the gate-liveness contribution: `technique_bundled` moved 62 → 66 and
`technique_fetched` 26 → 24 across the entire July-to-now period. Moving a step from lazy to
bundled relocates its bytes into `get_activity` rather than removing them, so a four-step
increase in bundling cannot produce a 467,295-character fall in `get_activity`. The fall is
deduplication. Gate-liveness is not visible in this instrument at all.

Third, and most important for what remains: the July regression was never fully repaired.
`get_workflow` rose 59,455 → 108,356 (**+82.2%**) and the remediation moved it by 76 characters.
`get_resource` rose 448,084 → 527,683 (**+17.8%**) and the remediation moved it by zero.
Together those two carry 128,500 characters of unremediated July-to-August growth, 9.9% of
today's delivery, and one of them is a single response at session open costing 108,356
characters.

**Verdict: partly holds.** The fall is real, the instrument is comparable across the pair, and
the causal direction is right. The number is a composite of a 27.2% fall and 0.47% regrowth,
no ablation exists inside the remediation commit, and the claim that the July regression was
addressed is false for two of the four response types.

**What would settle it.** Three `--no-compare` runs at the merge base, with
`src/utils/gate-liveness.ts` neutralised, and with the response-local deduplication pass
disabled, all against `WORKFLOWS_DIR` pinned to `34cd5429`. That is three benchmark runs,
about 35 seconds, and it converts one composite number into a per-change ledger. Nothing in the
repository currently records which change bought which characters.

## C2 — Delivery characters are the right proxy for cost, and cost is what makes the workflows feel slow

**The claim.** Four instruments price this system; all four price delivery. The programme is
therefore ordered by characters saved. The user's complaint is that the workflows are slow and
expensive, and character count is taken to answer both halves.

**Evidence for the cost half.** Delivered characters convert directly to billed input tokens at
the server's own four-characters-per-token constant (`DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4`,
`src/config.ts:156`). One walk at 1,302,319 characters is roughly 325,600 input tokens, and a
real run delivers more than the synthetic walk does. Character count is a good proxy for money.

**Evidence against the speed half.** The whole 242-call walk takes **9.08 seconds** of server
wall-clock, of which 8.53 s is inside tool handlers, measured from the audit records of the
probe run:

| Tool | Calls | Total | Mean |
|---|---:|---:|---:|
| `get_resource` | 162 | 4,832 ms | 29.8 ms |
| `get_technique` | 24 | 1,348 ms | 56.2 ms |
| `get_activity` | 12 | 1,074 ms | 89.5 ms |
| `next_activity` | 12 | 399 ms | 33.3 ms |
| `yield_checkpoint` | 10 | 334 ms | 33.4 ms |
| `respond_checkpoint` | 10 | 329 ms | 32.9 ms |
| all 242 | 242 | 8,527 ms | 35.2 ms |

The same work takes hours in production. The repository already holds the decomposition, in
`.engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs/README.md`: the 5 August
run's request-to-first-review-worker span was 902 seconds, of which **59% was worker model
time, 3% human wait, and 38% orchestrator handoff with nothing executing** — eight transitions
averaging 27 seconds plus two 120-second stalls. Delivery into those four setup contexts was
238,649 characters, about 60,000 tokens. Even at a pessimistic thousand tokens per second of
prefill, that is 60 seconds of a 902-second span: **6.6%**, and the true figure is lower.

The same record holds the largest single wall-clock event anywhere in this repository's
measurements: a container restart mid-run cost a **196.8-minute stall**, plus a wasted
84,441-character delivery. No byte count sees it.

So the two halves of the complaint have different drivers. Characters drive spend. Turn count,
per-turn generation and dead handoff drive elapsed time, and a saving that removes bytes
without removing a turn moves the bill and not the clock.

The claim that all four instruments price delivery is also not quite true.
`scripts/run-profile.ts` places five milestones on a timeline, sums checkpoint wait as the span
from question to answer, and excludes it from active duration. It is a wall-clock instrument.
It is in `package.json` as `profile:run`, in no job, no guard registry and no test — the same
shape the prior report named for `bench:token`, still true of the one instrument that measures
the half of the complaint the byte counters cannot reach.

**Verdict: partly holds.** Right for expensive, wrong for slow, and the repository already owns
the instrument that would price slow.

**What would settle it.** Run `npm run profile:run` against the two most recent real sessions
and publish the milestone table beside the delivery table. Then order the remaining programme
by which column each item moves. An item that removes a round trip and an item that removes
20,000 characters are currently priced in the same units and are not the same purchase.

## C3 — The continuous-integration cost gate can resolve the savings being proposed

**The claim.** `.github/workflows/verify.yml:83` runs
`bench:token --label=ci --context-mode=fresh --gate` at the 1% default, and a proposed saving
either clears its noise floor or does not.

**Evidence.** The claim contains two distinct propositions and they have opposite answers.

*The instrument has no noise floor.* Three independent invocations — two probe runs and the
timed gate run — each returned exactly 1,302,319 characters, and every subsidiary metric matched
to the unit: `getActivityChars` 520,075, `getWorkflowChars` 108,356, `getResourceChars` 527,683,
`getTechniqueChars` 146,205, `deliveredContentKeys` 265, `resourceLedgerKeys` 77, and an
identical tool-call profile. Run-to-run variance is **zero characters**. The walk is fully
deterministic: `skipOptionalPolicy` in robot mode takes fixed branches, and the only random
element in the harness is a `mkdtempSync` suffix of constant length
(`tests/e2e/harness.ts:32`). The instrument resolves one character in 1.3 million, which is
0.00008%.

*The gate is a one-sided dead-band, not a measurement.* `evaluateGate` reduces to
`passed = regressionPct <= maxRegressionPct` (`scripts/run-token-benchmark.ts:352`), with
`DEFAULT_MAX_REGRESSION_PCT = 1` (:173). Against today's baseline that is a **13,023-character**
trip point in the positive direction only. A saving of any magnitude — one character or four
hundred thousand — passes identically. The gate cannot resolve a saving because it is not
asked to; it is a ratchet against growth.

Two consequences follow that the programme has not priced.

First, **the ratchet does not tighten.** Nothing re-records the fixture on an improvement.
`grep` over `tests/`, `.github/` and `scripts/guards.ts` finds exactly two references to
`scripts/fixtures/token-benchmark-baseline.json`: the CI step and prose in `docs/development.md`.
No test asserts the fixture matches a fresh run. So if the four server-side delivery changes
land and save, say, 300,000 characters without a re-record, the gate thereafter permits **23% of
silent regrowth** before it says a word. That is the exact failure this gate was built to
prevent, reintroduced by success.

Second, the resolution language in the prior report is a category error. ECO-03's
"13,555-character resolution floor" is 1% of the July baseline, restated as though it were a
property of the measuring device. It is a constant in one file, overridable per invocation with
`--max-regression-pct`. A run at `--max-regression-pct=0.05` trips at 651 characters and costs
the same 10.4 seconds.

Re-pricing the prior report's savings against today's 1,302,319 baseline and today's
13,023-character trip point:

| Item | Saving as priced | Share of today's walk | Above the 1% dead-band |
|---|---:|---:|---|
| CTX-01 worker bundle once per context | 281,632 | 21.6% | yes (landed) |
| CTX-02 response-local deduplication | 100,123 | 7.7% | yes (landed) |
| CTX-02 hoist group rules | 76,359 | 5.9% | yes |
| CTX-03 per-entry ledger keys | 71,216 | 5.5% | yes |
| RED-02 validation activity | ~57,000 | 4.4% | yes |
| CTX-04 language-conditional resources | 34,568 | 2.7% | yes |
| TOP-04 dead step bytes | 22,262 | 1.7% | yes |
| CTX-06 delivery-mechanics prose | 20,056 | 1.5% | yes |
| RED-06 duplicated verification | 8,800 | 0.68% | no |
| CTX-05 anchor-aware containment | 7,496 | 0.58% | no |
| CTX-09 forwarder techniques | 6,500 | 0.50% | no |
| MECH-11 six total functions | 1,620–2,200 | 0.12–0.17% | no |

Eight of twelve clear the dead-band as priced; four do not. But every one of the twelve is
resolved by the instrument to the character, so all twelve are measurable, attributable to one
commit, and reportable in the scorecard `deltaPct` column
(`scripts/run-token-benchmark.ts:302-317`). "Unfalsifiable" was never true of any of them.

**Verdict: fails as stated, and in the programme's favour.** The instrument resolves every
proposed saving exactly. The gate does not resolve savings at all, in either direction, and no
threshold change would make it — a ratchet is the wrong shape for measuring an improvement.

**What would settle it.** Nothing further; three zero-variance runs settle the measurement
question. The open decision is a design one: add a lower bound to the gate so a landing that
saves more than 1% and does not re-record the fixture fails, which turns the ratchet into a
two-sided band and closes the regrowth hole for four lines in `evaluateGate`.

## C4 — Saved sessions holding an older definition shape stay compatible

**The claim.** The remediation closed the workflow-version drift the prior report named as its
largest risk (ECO-04), so a definition edit is now safe against sessions already running.

**Evidence for.** The remedy landed and is real. `src/tools/resource-tools.ts:279-286` computes
`versionDrift` by comparing the loaded workflow version against the recorded one, and on drift
seeds the declared defaults the bag lacks:

```
const versionDrift = effectiveWorkflowVersion !== ''
  && state.workflowVersion !== effectiveWorkflowVersion;
const lateSeed = versionDrift && wfPreLoad.success
  ? Object.fromEntries(
    Object.entries(seedDefaults(wfPreLoad.value.variables))
      .filter(([name]) => state.variables?.[name] === undefined),
  )
  : {};
```

A value already written is left alone (:284), the version is re-stamped (:304), and the whole
thing persists in one write (:326-329). `tests/variable-seeding.test.ts` grew 76 lines in the
same commit. The session schema is additive-safe by construction: every optional field in
`SessionFileBaseSchema` carries a `.default()` (`src/schema/session.schema.ts:82-120`), and zod's
non-strict default strips rather than rejects unknown keys, so adding a defaulted field to
`SessionFile` cannot break a saved session.

**Evidence against.** The remedy's trigger is a version bump, and version bumps are neither
automatic nor guarded.

`workflowVersion` comes from the `version` key of `workflow.yaml`
(`src/loaders/workflow-loader.ts:358`, `src/tools/resource-tools.ts:240-241`), and nothing
enforces that a definition change bumps it. Measured over the corpus since 16 July:

- 118 non-merge commits touched `work-package/`; **32** touched `work-package/workflow.yaml`.
- Of those 32, **18 bumped `version`**. Fourteen edited the manifest that declares the variables
  and left the version where it was.
- 123 non-merge commits touched `meta/`; 22 touched `meta/workflow.yaml`.

None of the 28 guards in `scripts/guards.ts` checks a version bump. So for 86 of 118
work-package definition commits, a resumed session sees `versionDrift === false`, the late seed
never runs, and the resume is exactly as silent as it was before the remedy. The remedy is
correct and its trigger is discretionary.

Two further limits. The late seed fills variables that are `undefined`; it does not reconcile a
variable whose *default changed*, which is defensible but undocumented at the call site. And
`seedDefaults` reads `defaultValue` (`src/utils/variable-seed.ts:11-17`), which 103 of
work-package's 140 declared variables carry and 11 of meta's 27 — so 37 work-package variables
are outside the mechanism entirely because they declare no default to seed.

On the other side of the risk, the exposure is real but smaller than the prior report implied.
The census over this repository's planning root reports 55 meta and 9 work-package states still
marked `running`, against 4 and 14 completed. Sixty-four states would meet a definition edit
mid-flight, and the status field cannot distinguish an abandoned run from a resumable one.

**Verdict: partly holds.** The mechanism is present, tested and correct. Its trigger fired on 18
of the 118 work-package definition commits this corpus produced since 16 July — **15%** — and
nothing reports the other 85%.

**What would settle it.** A guard, roughly 40 lines by the registry's own precedent, that fails
when a commit changes any file under a workflow tree without bumping that tree's `version`. Add
it to `scripts/guards.ts` and it is enforced in `check:all`, `check:delta` and CI without
touching `verify.yml`. Until it exists, every "safe against running sessions" statement in the
programme is conditional on author discipline that measurement says is 56% reliable on the file
that matters.

## C5 — Definition edits are cheap and server changes are expensive

**The claim.** The programme sequences work on an implicit model in which a definition edit is
the cheap surface and a server change the dear one, and the prior report inverts it for one
purpose (ECO-05, batch the definition edits) while leaving it standing elsewhere.

**Evidence.** Measured per surface:

| | Definition edit | Server change |
|---|---|---|
| Authoring-time enforcement | 25 corpus-scoped guards | 3 repo-scoped guards |
| Test coverage | e2e walk snapshots, definition-lint, corpus-sha stamp | 1,049 tests, 18,955 LOC |
| Superproject artifacts to update | 5 files (see C6) | 0, unless delivery moves |
| Landings required | 2 (corpus branch, then adoption) | 1 |
| Typecheck | not applicable | 1.7 s |
| Feedback latency locally | 1.7 s guard sweep | 37.5 s test suite |

The guard registry is 25 corpus-scoped entries against 3 repo-scoped
(`scripts/guards.ts:28-251`), so definitions are the *more* heavily policed surface at authoring
time, not the less. Conversely the server carries 18,955 lines of test against 12,628 lines of
source, and its feedback loop is twenty-two times slower locally.

The decisive asymmetry is neither of those. It is that a server change lands in one commit and a
definition change lands in two, in two branches, with a machine-regenerated tail — and that the
tail is triggered by delivery movement, not by surface. `ab810342` is a server change and it had
to re-record the walk snapshots, the corpus stamp and the delivery fixture, exactly as the two
definition adoptions did, because it moved delivery. So the ceremony tracks *what a change does
to the walk*, not *which tree it lives in*.

That reframes the cost model usefully. The expensive category is not "definition" and not
"server"; it is "anything that moves the delivered payload", and that category spans both trees.
A definition edit that adds a rule to a technique body pays the full ceremony. A server change
to error text pays none of it.

**Verdict: fails.** The surface taxonomy does not predict cost. Delivery movement does.

**What would settle it.** Nothing further to measure; it is settled. The sequencing consequence
is that the programme should batch by *delivery impact*, not by tree: one landing for everything
that moves the walk, whichever tree it lives in, and free landings for everything that does not.
That is a strictly stronger version of ECO-05's advice and it reaches server changes too.

## C6 — The submodule boundary costs what a paired change costs

**The claim.** Definitions land in the `workflows` submodule, server changes in the superproject,
and a paired change needs both. The prior report priced this as "a submodule commit, a pointer
bump, six committed walk snapshots across six policies, a corpus stamp, an empty
unresolved-reference baseline and a re-stamp".

**Evidence.** Both submodules are branches of this same repository behind an SSH URL
(`.gitmodules`), which is why `verify.yml:41-52` resolves the gitlink with
`git rev-parse HEAD:workflows` and does a second `actions/checkout` of that SHA rather than
initialising a submodule.

The measured price of adopting a corpus change is identical across the two most recent
instances:

```
22e0cfaf  Adopt the corpus that decides before it reads
  docs/development.md                             |  2 +-
  scripts/fixtures/token-benchmark-baseline.json  | 14 ++--
  tests/e2e/__snapshots__/corpus-sha.json         |  2 +-
  tests/e2e/__snapshots__/snapshot.test.ts.snap   | 47 +++-----
  workflows                                       |  2 +-

15ba859e  Adopt the corpus that gives both platform paths a producer
  (the same five files, 18 insertions, 13 deletions)
```

Five files, both times, roughly thirty lines. Three of the four non-gitlink files are
machine-regenerated: the snapshot by `npm run test:ci -- -u`, the stamp by
`npm run baseline:stamp` (`scripts/stamp-corpus-baseline.ts`), the fixture by a `--no-compare`
benchmark run. The remaining edit is one hand-maintained sentence in `docs/development.md:218`
naming the fixture's corpus revision — a duplicate of the fixture's own `workflowsRev` field
that `tests/docs-drift.test.ts` does not cover, so it can drift silently.

The boundary is genuinely load-bearing on frequency: since 16 July, 63 non-merge commits touched
`src/`, 79 touched the gitlink, and **25 touched both**. So 21% of changes are paired, and the
other 79% pay only one side.

The boundary's sharpest cost is not the file count. It is that the corpus stamp compares SHAs
rather than trees. The working tree currently carries the submodule at `2e8b6297`, one commit
ahead of the pinned `72db28ae` — and that commit is an empty merge. `git diff 72db28ae 2e8b6297`
produces nothing. The benchmark returns byte-identical delivery. And `npm run test:ci` fails:

```
tests/e2e/snapshot.test.ts:37
- 2e8b62970eea3f0351d50d2bd8cbcc747cee4777
+ 72db28ae99348b9a7b9b595be7396baf5a1a48d2
```

One of 1,049 tests, failing on a commit that changed no bytes. The benchmark's own corpus check
has the same shape: `resolveCorpusRev` compares short SHAs (`scripts/run-token-benchmark.ts:323-333,
:550-553`) and emitted a "Corpus mismatch" banner on all three of my runs, against a corpus whose
content is identical to the reference. Two of the ceremony's checks cost a re-record for a
tree-identical merge.

**Verdict: holds, and is cheaper than priced.** The paired change is real and its cost is fixed
per landing, which is the load-bearing half of ECO-05. But the price is five files and thirty
lines, not six snapshot policies and two baselines, and three of the four files regenerate from
a command.

**What would settle it.** Nothing; it is measured. The cheap improvement is to compare the
corpus *tree* hash rather than the commit SHA in both places, which removes a class of
re-records that buy nothing. That is roughly ten lines across
`tests/corpus-stamp.ts` and `scripts/run-token-benchmark.ts:323`.

## C7 — The remaining opportunities are worth what the prior report priced them at

**The claim.** The prior report's per-item savings can be carried forward into this run's
sequencing.

**Evidence.** They cannot be carried forward unadjusted, for two independent reasons.

*Denominator change.* Every percentage in the prior report is against 1,780,292. Today's walk is
1,302,319. A saving quoted at 5.6% of the old walk is 7.7% of the new one, and the ordering
between items and the 1% dead-band shifts accordingly. The table in C3 restates them.

*Interaction with what landed.* Several remaining items were priced on a corpus where the
machinery they interact with was switched off. CTX-03's 71,216 characters were measured with the
collapse path disabled and whole-block ledger keys; response-local deduplication now runs
unconditionally, so an unknown share of that 71,216 has already been collected by a different
mechanism, and the item's remaining value is an upper bound of unknown tightness. The same
caution applies to CTX-05's 3,325 and 4,171, and to CTX-09's 6,500, all of which are collapse-
adjacent.

Conversely two items are now worth *more* than priced, because the remediation did not touch
them and their share of a smaller walk is larger. `get_workflow` is 108,356 characters in one
response at session open, 8.3% of the walk and up 82.2% on July. `get_resource` is 527,683 over
162 calls, 40.5% of the walk and up 17.8% on July. Together they are 48.8% of today's delivery
and neither moved by more than 76 characters in the remediation. The largest remaining delivery
opportunity in this system is the two response types nobody has yet worked on.

**Verdict: fails.** Carrying the prior prices forward would misorder the programme, understate
the two largest remaining targets and overstate at least three collapse-adjacent items.

**What would settle it.** One ablation run per candidate against today's tree, at 10.4 seconds
each. Twelve candidates is about two minutes of machine time and it replaces every inherited
estimate with a measured one. This is the cheapest single action available to this dimension.

## C8 — The batch bound is a free dial

**The claim.** `BATCH_MAX_ACTIVITIES` and `BATCH_HEADROOM_FRACTION` are environment-settable
(`src/config.ts:102-112, :164-165`), so raising them is zero build cost and potentially the
largest wall-clock win in the report.

**Evidence for.** The dial is genuinely free to turn, and the headroom is now larger than when it
was set. `docs/dispatch_model.md:93` records that the benchmark's three activities cost 159,093
characters batched against a 280,000-character budget — **57% of budget** — so the activity cap
of 3 binds first and roughly seven activities of that weight would fit. The 26.8% delivery fall
widened that gap further after the figure was taken.

**Evidence against.** Three costs that are not zero.

The dial has never bound in production. The 2026-08-06 measurement record establishes that on the
5 August run `_meta.batch` was absent from every `get_activity` response for the whole session,
no worker could read `may_continue`, and there was no `batch_refused` event anywhere in either
session — "nothing was refused because no continuation was ever attempted". Four setup
identities were spawned for four setup activities and thirteen client identities for twelve
client activities.

The reading is conditional on caller-supplied arguments. `may_continue` is emitted on
`get_activity` (`src/tools/workflow-tools.ts:756`) and, since the remediation, at the activity
boundary on `next_activity` (:1329-1338) — the latter only "when given its `agent_id` and
window". Across both workflow trees, `context_tokens` appears in exactly one file,
`meta/techniques/workflow-engine/compose-prompt.md:45`, and it instructs the arguments for
`get_activity` only. No definition passes `agent_id` and `context_tokens` to `next_activity`, so
the boundary-accurate reading the remediation built has no caller in the corpus. That is the
"mechanism exists and nothing invokes it" pattern reproduced by the remediation itself, four
days old.

And the dial's own documentation states the reason it was turned back: the character budget is
"blind to the context establishment the server never delivers, the code a worker reads, the
artifacts it drafts, and degradation across a long walk" (`src/config.ts:106-113`). The
evidence that would justify raising it is not a byte count.

**Verdict: partly holds.** Free to change, not free to justify, and inert until the reading
reaches the orchestrator on the path that matters.

**What would settle it.** In order: confirm `_meta.batch` now arrives on a real run (one profile
run against the most recent session); bind `agent_id` and `context_tokens` into the corpus's
`next_activity` instruction, which is a one-line definition edit in one file; then re-run
`bench:dispatch` and `profile:run` at 3 and at 6. The measurement costs minutes. The definition
edit is the prerequisite nobody has priced.

## Three inversions

Each design below assumes one claim is false and follows the consequence to a concrete result.

### Inversion 1 — assume the gate resolves nothing, and make the fixture the ratchet

Assume C3's gate framing is wrong in both directions: the threshold is not a floor and the
one-sided band is not a gate. Replace it with a **two-sided band and a mandatory re-record**.
`evaluateGate` gains a lower bound: a run whose delivery falls more than 1% below the fixture
also exits 3, with the reason "delivery improved by N characters and the fixture was not
re-recorded". Four lines.

Concrete result on the current tree: `ab810342` would have failed CI at −27.2% until its author
re-recorded the fixture, which that commit did anyway. The two adoption commits would have passed.
The difference appears on the *next* large saving: the four server-side delivery changes cannot
land 300,000 characters of improvement and leave 23% of silent regrowth headroom behind them.

What the inversion reveals: the gate as built assumes improvement is self-reporting. It is not —
the same PASS line is printed at 0% and at −27%, and nothing distinguishes "we changed nothing"
from "we changed everything and forgot to write it down". The hidden assumption is that the only
adversary is regression.

### Inversion 2 — assume characters do not predict elapsed time, and gate the turn count

Assume C2's speed half is false, as the measurements say it is. Add a second gate on the same
walk, over a quantity the fixture already records and the gate ignores: **`toolCalls` and the
yield/respond/resume triple count**. The fixture holds `get_resource: 162`, `get_technique: 24`,
`get_activity: 12`, `next_activity: 12`, and ten checkpoint triples. Gating those at zero
tolerance costs no new measurement — they are in the JSON already — and roughly fifteen lines in
`buildVsReference` and `evaluateGate`.

Concrete result: the remediation's real effect on turn count becomes visible. Across July to now
the round-trip profile moved from 128 resource fetches and 12 checkpoint triples to 162 and 10 —
that is, the walk got *more* chatty on resources while getting 26.8% cheaper in bytes. Under a
turn gate that PR reports both numbers and a reviewer prices them separately. Under the current
gate it reports one, and the one it reports is the one that does not track the clock.

What the inversion reveals: the fixture already carries the wall-clock proxy. It is recorded,
compared in the scorecard, and excluded from the gate — `deliveryChars` is the only metric
`evaluateGate` reads (`scripts/run-token-benchmark.ts:348`). The hidden assumption is that one
scalar can order a two-dimensional complaint.

### Inversion 3 — assume the version bump never happens, and key drift on content

Assume C4's trigger is unreliable, as 14 of 32 manifest commits say it is. Replace the version
comparison with a **content fingerprint**: hash the declared variable names and their
`defaultValue`s at load, store it beside `workflowVersion`, and drive `lateSeed` off a
fingerprint mismatch. Roughly twenty lines beside the four drift checks already at
`src/tools/resource-tools.ts:271-291`, and it subsumes the version check rather than replacing it.

Concrete result: the 86 work-package definition commits since 16 July that did not touch
`workflow.yaml` correctly produce no drift, because they changed no declaration. The 14 that
edited the manifest without bumping the version now produce drift and seed correctly. Author
discipline stops being load-bearing, and the version bump reverts to being a human-facing label
rather than a safety mechanism carrying weight it was not designed for.

What the inversion reveals: the remedy borrowed an identifier maintained for one purpose
(release labelling) and made a correctness property depend on it. That is the same shape as the
delivered-content ledger keying on a payload hash rather than an identifier — a decision the same
codebase already got right, one file away.

## The core impossibility

The artifact this dimension is really about — the optimisation programme itself — is trying to
optimise a quantity it can measure exactly against a complaint it cannot measure at all, using an
instrument that reports on a walk nobody takes.

Every layer is defensible on its own. `bench:token` walks `work-package` under
`skipOptionalPolicy` in robot mode with a synthetic resource amplifier that re-probes seven hot
templates on every `get_activity` (`scripts/run-token-benchmark.ts:160-168, :464-470`). That
makes it reproducible to the character, which is exactly what a gate needs. It also makes it a
walk with no agent, no judgement, no branch variance, no worker spawn, no human wait and no
model turn — none of the things a real run spends its time on. The 9.08 seconds it takes stands
in for a span the repository's own records put at hours.

So the programme optimises the one quantity that survives the abstraction. Characters survive.
Turns partly survive. Everything the 2026-08-06 record identifies as the actual expense — 59%
worker model time, 38% dead handoff, a 196.8-minute restart stall — does not survive at all, and
therefore does not appear in any ordering.

The impossibility is not that the byte count is wrong. It is accurate, cheap, deterministic and
attributable, which is why it has become the only thing anyone measures. The impossibility is
that a programme cannot be ordered by a metric that is orthogonal to half its objective, and no
amount of precision in that metric closes the gap. Precision here is actively misleading: three
runs agreeing to the character reads as rigour, and it is rigour about the wrong axis.

## The slowest, most invisible failure

Among the false and partly-false claims, the one whose failure is slowest and least visible is
**C3's second limb: the gate does not ratchet down.**

Rank them by how long a wrong answer survives undetected:

- C7's stale pricing is caught the first time anyone re-measures a candidate, which the programme
  must do anyway. Days.
- C5's surface taxonomy is caught the first time a definition-only edit is found to have paid the
  full ceremony. One landing.
- C1's missing ablation is caught the moment anyone asks which change bought which characters,
  and the answer is thirty-five seconds of machine time away.
- C4's version-bump trigger fails loudly *eventually*: a resumed session runs a gate on an
  unbound variable, takes a wrong branch, and something downstream is visibly wrong. Weeks, and
  it produces a symptom.
- C8's inert dial is already known to be inert, and the next profile run says so again.

C3's ratchet hole produces no symptom at any point. The sequence is: a large saving lands, the
gate prints PASS, the fixture is not re-recorded because nothing requires it and the number
moved in the good direction, and the baseline is now 300,000 characters above the truth. Every
subsequent pull request is measured against a stale ceiling. Delivery regrows — one technique
body at a time, one rule block at a time, each increment far under 13,023 characters — and every
one of them passes, correctly, against a baseline that no longer describes the system. The gate
is green throughout. The scorecard prints a negative `deltaPct` the whole way, which reads as
"still better than baseline" and is true and useless.

This is not hypothetical: it is what already happened once. Delivery rose 31.3% in 32 days with
a working benchmark sitting in `package.json`, and the reason it went unreported was not that the
instrument was absent but that nothing compelled anyone to consult it. The remediation compelled
consultation on regressions. It did not compel re-recording on improvements, so the same
mechanism — an authoritative number that stops describing the system while continuing to be
consulted — is reconstructed one level up.

The tell to watch for is a scorecard whose `deliveryCostIndex` sits below 100 for more than one
landing. On a healthy ratchet that number returns to 100 after every merge, because the fixture
is re-recorded whenever it moves. A persistent reading of 85 or 78 is the baseline having become
a historical artifact rather than a control.

## Sequencing consequence

The claims above reorder the remaining programme against what the prior report recommended.

**Take first, because they make everything after them measurable, and cost minutes:**

1. Twelve ablation runs, one per remaining candidate, against today's tree (C7). About two
   minutes of machine time; replaces every inherited estimate.
2. Close the ratchet: a lower bound in `evaluateGate` plus the re-record requirement (C3). Four
   lines, and it is the only defence against the slowest invisible failure in the set.
3. Compare corpus *trees* rather than SHAs in the stamp test and the benchmark's corpus note
   (C6). Ten lines; removes a class of re-records that buy nothing and one recurring red test.
4. One `profile:run` against the two most recent real sessions (C2). Establishes the wall-clock
   column the programme currently has no numbers for.

**Take next, because they are prerequisites the programme has not priced:**

5. A version-bump guard, or the content fingerprint that makes it unnecessary (C4). Until one
   exists, "safe against running sessions" is an assertion about author discipline that
   measurement puts at 56% on the file that matters.
6. Bind `agent_id` and `context_tokens` into the corpus's `next_activity` instruction (C8). One
   line in one file, and without it the batch reading the remediation built has no caller.

**Then the delivery work, re-ordered by where the bytes actually are (C1, C7):**

7. `get_resource` — 527,683 characters over 162 calls, 40.5% of the walk, up 17.8% on July,
   untouched by the remediation.
8. `get_workflow` — 108,356 characters in one response at session open, 8.3% of the walk, up
   82.2% on July, moved 76 characters by the remediation.

Those two carry 48.8% of today's delivery between them and neither appears in the prior report's
short-term list, because the prior report was written when `get_activity` was 55% of the walk.
It is now 39.9%.

**And batch the landings by delivery impact rather than by tree (C5).** One landing for
everything that moves the walk, whichever tree it lives in, because the ceremony is triggered by
delivery movement and is fixed per landing at five files. Everything that does not move the walk
lands freely and needs no batching at all.

## Verdicts

| Claim | Verdict |
|---|---|
| C1 — the 26.8% fall was caused by the remediation | partly holds |
| C2 — delivery characters proxy for cost, and cost is what feels slow | partly holds |
| C3 — the CI gate can resolve the proposed savings | fails |
| C4 — saved sessions stay compatible across each proposed change | partly holds |
| C5 — definition edits are cheap and server changes expensive | fails |
| C6 — the submodule boundary costs a paired change | holds, cheaper than priced |
| C7 — remaining opportunities are worth their prior prices | fails |
| C8 — the batch bound is a free dial | partly holds |
