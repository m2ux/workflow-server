---
target: /home/mike1/projects/dev/workflow-server
date: 2026-08-18
lens: blindspot (52)
dimension: Mechanisation Potential
---

# Mechanisation Potential — Blindspot

The prior evaluation enumerated twelve mechanisation candidates and priced each one. This lens does
not re-enumerate. It characterises the shape of that enumeration, then names what the shape
structurally excludes, and points at the specific thing occupying each exclusion.

## Step 1: The operations the prior analysis performs

Every finding in `EVALUATION-REPORT.md` is produced by one of these eleven operations, and all
eleven read artifacts at rest:

1. **Counts files and bytes** — 262 technique files, 909 KB, 5,443-byte largest candidate.
2. **Walks the reference graph** — 12 activities, 242 tool calls, 1,302,319 delivered characters.
3. **Traces a variable to its producer** — eighteen consumed-with-no-producer names.
4. **Tests a gate for decidability** — 44 of 89 lazy steps decidable at activity entry.
5. **Classifies a step as deterministic or judgement-bound** — the twelve candidates.
6. **Diffs two artifacts that should agree** — 1,414 unchecked synchronised pairs.
7. **Prices a build in lines of code** — "roughly 150 to 200 lines in `src/tools/`".
8. **Ranks candidates against an instrument's resolution** — eleven of twelve below 13,555 characters.
9. **Orders implementation surfaces by presence at execution** — server, corpus, checkout.
10. **Detects a mechanism that exists and is not invoked** — six independent instances.
11. **Projects a saving onto one walk** — every saving is expressed as characters off one walk.

Each operation takes a static artifact as input and returns a number or a classification. None takes
a run, a person, a duration, or a failure as input.

## Step 2: The absent operations

### 2.1 It never counts what the run produces, only what the run is sent

`deliveryChars()` in `scripts/run-token-benchmark.ts` sums exactly four terms — `get_activity`,
`get_workflow`, `get_resource`, `get_technique`. That sum is the number `--gate` compares, and the
last step of `.github/workflows/verify.yml` runs it at a 1% threshold. Against the committed
`scripts/fixtures/token-benchmark-baseline.json` at 1,302,319 characters, the gate resolves 13,023
characters.

The instrument's own artifact-production limb is `writeArtifactStubs` at `tests/e2e/walker.ts:494`.
It reads `act.artifacts`. No activity in the corpus declares `artifacts:` — the count across all 21
workflow trees is zero. The limb therefore writes nothing on every walk, and `artifactsWritten` is
`[]` for all twelve activities.

One real, incomplete work-package run —
`.engineering/artifacts/planning/2026-08-15-handling-inline-techniques/` — produced 162,294
characters of markdown across seven artifacts and a 191,020-byte session file, having reached only
activities 02, 03, 04 and 15. It never got to the plan, the review, or the pull request.

Mechanisation moves a procedure's *execution* from an agent to code. The gate measures the delivery
of the *instruction*. A candidate that halves the work of executing a step and adds forty bytes of
prose describing the new call registers as a regression.

### 2.2 It never runs a loop more than once

`tests/e2e/walker.ts:452` walks a `kind: loop` body in a single deterministic pass, and the comment
above it says so. `tests/e2e/policies.ts:22-31` hard-codes seven convergence variables —
`needs_comprehension: false`, `has_open_questions: false`, `elicitation_complete: true`,
`needs_plan_revision: false`, `needs_further_discussion: false`, `has_deferred_assumptions: false`,
`review_passed: true` — under a docstring that names them "the agent completed this activity and its
loops successfully".

The definitions disagree with that model in writing. `08-implement.yaml` declares
`maxIterations: 20`. `10-post-impl-review.yaml` declares 50 and 3. `11-validate.yaml` and
`04-research.yaml` declare 10 and 20. `meta/activities/03-dispatch-client-workflow.yaml` declares
200. The corpus author has stated the ceiling; the instrument takes one.

The `await-review-loop` at `13-submit-for-review.yaml:347` declares no ceiling at all. Its
`review-received` gate carries no `defaultOption`, so `defaultChoice` at `tests/e2e/policies.ts:9`
returns `options[0]` — `yes-review`. The instrument's model of a human review wait is: review arrives
on the first ask, every time.

Above four visits the walker throws (`tests/e2e/walker.ts:565`, `maxVisits ?? 4`). Re-work past the
fourth iteration is not merely unmeasured; it aborts the measurement.

### 2.3 It never fails

Every non-happy branch in the walker raises: `get_activity` (line 306), `next_activity` (line 327),
`get_technique` (line 432), and each of `yield_checkpoint`, `respond_checkpoint` and
`resume_checkpoint` (lines 526, 543, 547). `run-token-benchmark.ts:565` sets exit code 2 unless
`finalStatus === 'completed'`.

The census disagrees with that as the modal case. Against
`.engineering/artifacts/planning`, `scripts/count-workflow-sessions.ts` reports 24 work-package
sessions of which 14 completed, and 59 meta sessions of which 4 completed. Sixty-five of 83 runs —
78.3% — never reached a terminal activity. The single path the gate measures is the minority
outcome, and every other outcome is classified by the instrument as a broken measurement rather than
as a cheaper or dearer run.

The failure surface exists in the corpus and is entirely prose. Work-package's techniques carry 42
occurrences of "retry" and its activities carry 12 of "re-run". `implement-task.md:55` reads "If the
code changes do not compile, review the error messages, fix the issues, and retry" — the largest
re-work class in any implementation workflow, one sentence, zero iterations measured.
`manage-git/artifact-commits.md:40` bounds its retry at once; `manage-git/sync-branch.md:19` says
"resolve the conflicts interactively, then retry", which is unbounded and human-held.

### 2.4 Twenty-three deterministic preconditions are not in the candidate set

`src/schema/activity.schema.ts:26` declares five action verbs — `log`, `validate`, `set`, `emit`,
`message` — and states that they are "interpreted by the executing agent. The server has no action
interpreter". The corpus uses 77 of them across the two workflows: 28 `set`, 23 `validate`, 18
`message`, 8 `log`.

The 23 `validate` actions are the missed candidate class. They are not technique prose, so a survey
of 262 technique files does not see them. They cost almost nothing to deliver, so the byte gate
cannot see them. And their targets are already written in the server's own reference dialect:

```
gh.auth.status == 0
planning_folder_path.writable == true
gpg.agent.reachable == true
signing.configured == true
missing_prerequisites.length == 0
on_feature_branch != false
push_remote_verified != false
commits_signed != false
```

Parsed against `src/schema/when-expression.ts`, 18 of 20 targets parse cleanly. Two do not:
`broken_artifact_links == []` (`14-complete.yaml:45`) and `summary_budget_overruns == []`
(`13-submit-for-review.yaml:36`) both fail tokenisation on `[`, and `evaluateWhenExpression` fails
closed to `false`. Three more `validate` actions in `meta/activities/02-resolve-target.yaml` carry no
`target` at all and are pure prose.

`check-when-expression` proves "every `when:` gate parses under the reference dialect". Its
`checkStep` at `scripts/check-when-expression.ts:25` reads `step.when` and nothing else. Twenty-three
expressions in the same dialect, in the same files, under a sibling key, sit outside it — including
the two that do not parse.

These are preconditions. Their entire value is on the failure path, and the robot walker executes
`set` actions only (`tests/e2e/walker.ts:456`), so all 23 pass as no-ops in every measured walk.

### 2.5 The human is configured out of the measurement, twice

`src/tools/workflow-tools.ts:1586` sets `MIN_RESPONSE_SECONDS` to 3 — the one mechanism in the system
that models a person taking time to decide. `tests/e2e/harness.ts:42` sets
`minCheckpointResponseSeconds: 0`. The first act of configuring the measurement apparatus is to zero
out the human.

`scripts/run-profile.ts` is the only instrument that measures human wall-clock. It sums
`AskUserQuestion` call-to-result spans into `checkpointWaitMin` and reports it in minutes
(lines 364-372, 496, 535). It is not in `.github/workflows/verify.yml`, not in `scripts/guards.ts`,
and its input is `~/.claude/projects` — a path that exists on an operator's own machine and nowhere
in CI. Its default window is `startup`: t0 to the opening activity done, one activity of fifteen.

The human decision surface of the two workflows is 49 checkpoints, 109 options, and at least 14,443
characters of message plus option label plus option description — a floor, because seven
fragment-referenced gates resolve their bodies at load. Against a 1,302,319-character walk that is
1.1%. The gate's 13,023-character resolution floor is 90% of the entire human-facing decision surface
of both workflows. You could delete every checkpoint message in the corpus and clear the gate.

The reference walk fires 10 of those 49 gates and selects 10 of those 109 options. The walked path
declares 36. Thirty-four of the 44 work-package gates never fire.

### 2.6 A decision taken by a timer is recorded as a decision

Fifteen checkpoints in the two workflows' top-level activities carry `autoAdvanceMs` (sixteen
counting `meta/activities/patterns/03-plan-and-execute.yaml`), all but one at 30,000 ms. Thirty-four
of the 49 carry no `defaultOption` and cannot auto-advance at all.

`respond_checkpoint` writes one record per gate: `{ optionId, respondedAt, effects }`
(`src/tools/workflow-tools.ts` around line 1690), and one `checkpoint_response` history event
carrying `{ optionId }`. The `condition_not_met` path gets a provenance sentinel,
`__condition_not_met__`. The `auto_advance` path gets none — `resolvedOptionId` is set to
`checkpoint.defaultOption` and stored exactly as a human selection would be. On disk, a gate the
operator deliberated over and a gate a timer answered are the same row.

Work-package's own rules escalate this. `workflow.yaml` declares
`review-mode-headless-auto-advance`: "Once `is_review_mode == true` the run is headless. Every
review-reachable checkpoint that carries `defaultOption` + `autoAdvanceMs` is resolved by calling
`respond_checkpoint` with `auto_advance:true`". Review mode is 85 references across 11 of 15
activities. There is a whole run mode in which every eligible decision is taken by a clock and
nothing in the session file says so.

### 2.7 The cost of a wrong answer is asymmetric, and the corpus says so in prose

`13-submit-for-review.yaml:134` and `:158` are the two push gates. Both are `blocking: true`, both
carry no `defaultOption`, and both are conditioned on `stealth_mode == true` — which
`skipOptionalPolicy` never sets. The two most consequential decisions in the workflow are outside the
measured path entirely, along with the three stealth-mode `validate` actions that guard them.

Were they to fire under the instrument, `defaultChoice` would return `options[0]`: `confirmed` at
the FINAL ISOLATION CHECK, `confirm` at the push gate. The modelled human always takes the first
option offered.

The corpus names the asymmetry twice, in prose, and no instrument prices it:
`naming-conventions.md:55` and `issue-type-detection.md:31` both state that the branch prefix "is
expensive to change once a pull request is open". The prior report's MECH-03 quotes that sentence and
then prices the remedy at "about ten lines across the outputs and two steps" — the cost of the edit,
not the cost of the wrong branch name.

### 2.8 The instrument's model of re-reading is seven hand-picked strings, one of which is dead

`run-token-benchmark.ts:160-168` declares `HOT_RESOURCES`, seven resource ids re-probed on every
`get_activity` to price the "cross-activity resource repeat tax". Everything else is fetched once
ever: `seenResource` at line 406 is a `Set` that never forgets across the whole walk, across activity
boundaries, across worker identities.

One of the seven no longer exists. `review-mode#consolidated-review-format` resolves to `null`
through `extractMarkdownSection` — the heading was renamed and `review-mode.md` now carries
`## Review Comment Template`. `get_resource` throws for a missing section
(`src/tools/resource-tools.ts:893`), and `fetchResource` adds the error text to
`chars.get_resource` before checking `isError`. That error text is inside `getResourceChars`, which is
one of the four terms the CI gate compares, once per activity.

Zero corpus links use that anchor, so `check-resource-anchors` — which proves "every relative
`.md#anchor` link resolves to a rendered heading" — has nothing to flag. The guard suite validates
the corpus. The instrument is code. Nothing validates the instrument's references into the corpus.

The one field that would expose real re-reading is computed and discarded. `repeatedResources` is
built at `run-token-benchmark.ts:524`, printed to stdout, absent from the `ReferenceFixture`
interface at lines 89-112, absent from the committed fixture, and never compared by
`buildVsReference`. The fixture instead records `resource_fetched: 146` against
`resourceLedgerKeys: 77` and `unchangedResourceAnswers: 0` — 69 repeat fetches under one identity,
none collapsed, and no named list of which ones.

### 2.9 There is no variance, because there is nothing stochastic left

`tests/e2e/walker.ts:372` describes robot mode as "Mechanical only — no LLM — so it is
reproducible." The gate runs one walk, once, per CI job. There is no repetition, no distribution, no
empirical noise floor. The 1% threshold at `DEFAULT_MAX_REGRESSION_PCT` is asserted, not derived.

The system's real variance is acknowledged elsewhere and never folded in. `tests/e2e/budgets.ts:8`
records that a six-walk hook "measures ~30s locally and exceeded 120s in CI", a runner roughly four
times slower. `run-batch-benchmark.ts` states that server-side elapsed "lands within a few percent
either way of the per-activity pass, noise-dominated at this scale" and that the real saving is
harness context establishment, which it does not measure.

A mechanisation candidate's honest value is a distribution over runs — how often the step is reached,
how often the agent gets it wrong, how much the wrong answer costs. The instrument returns one
number from one path with no dispersion at all, so every candidate is compared on its mean under the
one scenario in which nothing goes wrong.

### 2.10 Nine of eighteen tools are never called

The committed fixture's `toolCalls` names nine: `start_session`, `get_workflow`, `next_activity`,
`get_activity`, `get_technique`, `get_resource`, `yield_checkpoint`, `respond_checkpoint`,
`resume_checkpoint`. The server registers eighteen.

Absent, and therefore priced at zero by every instrument: `present_checkpoint`, the tool that puts the
question to the person; `dispatch_child`, the fan-out primitive seven of fifteen activities declare;
`record_usage`, which is the only tool in the entire system that can attribute token cost to an
activity and is described in its own schema as taking a "harness-reported token DELTA"; plus
`inspect_session`, `get_trace`, `get_workflow_status`, `health_check`, `discover` and
`list_workflows`.

Forty-two of the walk's 242 calls (17.4%) are `next_activity` and the three checkpoint tools. Their
response characters are recorded into `chars` and then excluded from `deliveryChars()`.

## Step 3: The structural exclusion

The absences are not oversights. They follow from one property: **every instrument in this repository
takes the corpus as its input, and the corpus is a set of files.**

All 28 `proves` strings in `scripts/guards.ts` are properties of files at rest — "step bindings
resolve", "every technique I/O id is a qualified noun phrase", "every `when:` gate parses". Not one
names a run, a session, a person, a duration, a retry, a token, or a failure. All four benchmarks
price delivery, and `run-batch-benchmark.ts` says so about itself in its own header. The one
instrument that reads a real run, `run-profile.ts`, needs a client transcript and cannot exist in CI.

Determinism is what buys this. A file-shaped instrument is fast (1.8 seconds for the whole guard
sweep), reproducible, attributable to one commit, and gateable at merge. The moment an instrument
takes a run as input it inherits the run's non-determinism, needs repetition to say anything, cannot
attribute a delta to a commit, and cannot gate a pull request.

So the framework buys attributability and pays for it with everything that only exists during
execution. To include the absent operations it would have to give up the merge gate — accept a
statistical instrument that says "this change costs 8% more, plus or minus 5%, over twenty runs"
instead of "this change costs 31.3% more, attributable to this commit".

This is also why "mechanisation" is framed as a choice between three code surfaces — server, corpus,
checkout. All three are places to put a script. The framing omits the surfaces that remove the
procedure instead of relocating it:

- **A schema construct the server interprets.** The construct exists. `action` has five verbs and no
  interpreter, and the schema states that `set` — the only verb with computational content — "is
  slated for removal at the next workflow-schema major". The declarative limb of the schema is being
  retired, which raises the price of every future candidate, and no finding in the prior report
  notices.
- **An expression the existing evaluator reads.** `evaluateWhenExpression` already runs in the same
  process as the bag. Eighteen of the 23 `validate` targets already parse under it.
- **A closed option set at a gate.** Turning a free-text judgement into 3 enumerated options
  mechanises the *decision* without mechanising a computation. The corpus already carries 109 such
  options.
- **A declared default.** A value seeded at session creation is a derivation that never runs.
- **An authoring-time guard.** Moving a run-time check into `check:all` deletes the run-time step
  rather than reimplementing it. The prior report treats the 26 guards as a target surface to
  *invoke* and never as a surface that makes a step unnecessary.
- **Deletion.** A step nobody executes costs nothing to mechanise.

## Step 4: The conservation law

**Attributability × Realism = constant.**

An instrument that can attribute a delta to one commit must hold everything else fixed — one path,
one iteration per loop, zero seconds of human deliberation, no failures, no retries, no artifacts
written, one sample. An instrument that admits any of those loses the attribution, because the delta
is no longer the commit's.

This framework always finds: **byte-shaped costs on the single completed path**. Redundant delivery,
oversized bundles, dead step bytes, duplicate bindings, unreferenced files. Everything the prior
report's four largest wins are made of is exactly this shape, and the report is right about all of
them.

This framework always misses: **every cost that is a function of how the run goes**. Iteration count,
failure rate, retry depth, human deliberation time, the price of a wrong answer at a gate, the
distinction between a decision and a timeout, the characters an agent writes rather than reads, and
the 78.3% of runs that stop somewhere in the middle.

The prior report's own testable prediction sits precisely on this line. It predicts that all twelve
definition-side mechanisation edits will move the gate less than 1%, and concludes that eleven of the
twelve are "simultaneously real and unfalsifiable". That conclusion is correct about the instrument
and wrong about the candidates. They are unfalsifiable *by this instrument*, which cannot represent
the quantity they change. Reading their flatness as smallness is the framework mistaking its own
aperture for the size of the world.

## The blindspots, and what occupies each

| # | Blindspot | The specific thing in it |
|---|---|---|
| 1 | Cost the agent incurs producing output | 162,294 characters of artifact from one incomplete run; `writeArtifactStubs` (`tests/e2e/walker.ts:494`) writes nothing because zero activities declare `artifacts:` |
| 2 | Iteration | `tests/e2e/walker.ts:452` walks each loop once; `tests/e2e/policies.ts:22-31` hard-codes seven convergence flags; declared `maxIterations` reach 50 in `10-post-impl-review.yaml` and 200 in meta's dispatch loop |
| 3 | Failure and retry | Six `throw` sites abort the walk; exit 2 unless `finalStatus === 'completed'`; 42 "retry" occurrences in work-package techniques, none reached |
| 4 | Deterministic preconditions outside technique prose | 23 `action: validate` steps; 18 of 20 targets parse under `when-expression.ts`; `broken_artifact_links == []` and `summary_budget_overruns == []` do not parse and fail closed |
| 5 | Human time and attention | `tests/e2e/harness.ts:42` sets `minCheckpointResponseSeconds: 0` against a production default of 3; 14,443 characters of decision text against a 13,023-character gate floor; `run-profile.ts` measures the wait and runs nowhere automated |
| 6 | Decision provenance | `respond_checkpoint` records `{ optionId }` with a sentinel for `condition_not_met` and none for `auto_advance`; 15 gates carry a 30-second timer; review mode declares the whole run headless |
| 7 | Asymmetric cost of a wrong gate answer | The two push gates at `13-submit-for-review.yaml:134` and `:158` never fire under `skipOptionalPolicy`; `defaultChoice` would answer both `confirmed`; the corpus states the asymmetry in prose at `naming-conventions.md:55` |
| 8 | Re-reading a correct but hard-to-use definition | `HOT_RESOURCES` is seven hand-picked ids, one of them (`review-mode#consolidated-review-format`) resolving to `null` and billing its error text to the gated total; `repeatedResources` is computed and never compared; 69 of 146 resource fetches repeat and none collapses |
| 9 | Variance | One walk, one sample, no repetition; the 1% threshold is asserted; `tests/e2e/budgets.ts:8` records a 4× local-to-CI spread that no measurement carries |
| 10 | Nine of eighteen tools | `present_checkpoint`, `dispatch_child` and `record_usage` are never called by any benchmark; 42 of 242 calls have their response characters excluded from `deliveryChars()` |
| 11 | Mechanisation surfaces that are not code | `src/schema/activity.schema.ts:26` — no action interpreter, and `set` is slated for removal, retiring the corpus's one declarative limb |
