---
target: /home/mike1/projects/dev/workflow-server (server tree at 1297e655; `workflows` submodule checkout at 2e8b6297, superproject pin 72db28ae — identical trees)
subject: the `meta` and `work-package` definition trees, evaluated for the time and token cost of one run
analysis_date: 2026-08-18
lens: L12 complement adversarial
analysis_focus: Challenge to the structural analysis of the Remediation Effect — server PRs #467/#471 and definition PRs #468/#470
prior_artifact: remediation-effect/structural-analysis.md (ANALYSIS 1)
gitnexus: unavailable for this target; graph-verification skipped, every claim tested by direct execution
---

# Adversarial Analysis: Remediation Effect

## Method

Every load-bearing number in the structural analysis was re-derived by running something, not by
reading something. Four benchmark walks were executed across a 2×2 of server revision and corpus
revision, using temporary `git worktree` checkouts of both repositories, so that server effect and
corpus effect could be separated for the first time. An independent gate census was written against
the server's own `buildProducerIndex`, `variablesWrittenIn` and `gateAnswer` rather than against the
prior report's arithmetic. One counterfactual — a one-line change to `gate-liveness.ts` — was
implemented, measured, and reverted; the tree is byte-clean of it.

The structural analysis is largely right on evidence and substantially wrong on arithmetic. Its
central quantitative claim is transposed, and its central falsifiable prediction is refuted by a
measurement it did not take.

---

## Wrong Predictions

### W1 — The 34/57 split is transposed, and it inverts the analysis's main result

**The claim.** "gated and vetoed by a same-activity write (unanswerable whatever the bag holds):
meta 11, work-package **34** … gated and answerable if the bag held a value: meta 1, work-package
**57**." Restated four more times: "34 of 176 and 11 of 23 are permanently lazy by construction, and
57 and 1 are conditionally recoverable"; "57 of 91 work-package gated technique steps are answerable
*iff* R1/R2 are cleared"; "The static count today is **57 in work-package and 1 in meta**"; "34 of
the 91 are vetoed regardless of the bag."

**What actually happens.** Running the server's own `variablesWrittenIn` and `gateAnswer` over every
activity of both trees with a bag holding only the declared defaults, recursing into `kind: loop`
bodies and carrying enclosing loop gates:

| | meta | work-package |
|---|---|---|
| technique steps | 23 | 176 |
| ungated | 11 | 85 |
| gated | 12 | 91 |
| gated and vetoed by a same-activity write | 11 | **57** |
| gated and answerable if the bag held a value | 1 | **34** |
| answered on defaults alone: true / false / unanswered | 1 / 0 / 11 | 1 / 3 / 87 |

Every other cell in that table reproduces the structural analysis exactly, including the
default-only answer row (1 / 3 / 87) and the whole of the meta column. Only the work-package
veto/answerable pair is swapped. Two independent checks confirm the direction:

- The per-activity sum of vetoed steps is 21 + 0 + 1 + 4 + 3 + 0 + 6 + 3 + 3 + 4 + 3 + 1 + 4 + 1 + 3
  = **57**; the answerable column sums to **34**.
- The structural analysis's own sub-count agrees with mine where it states one: "of its 32 technique
  steps, 11 are ungated, **21 are self-write-vetoed**, and 0 are answerable-if-bound" for
  `start-work-package`. My census returns 32 / 11 ungated / 21 gated / 21 vetoed / 0 answerable. The
  activity it uses as proof is counted correctly; the total it rolls that activity into is not.

**What breaks.** The corrected reading is the opposite of the reported one: **57 of 91 gated
work-package technique steps are permanently lazy by construction — 62.6%, not 37.4% — and 34 are
conditionally recoverable.** This propagates into the conservation-law ledger (rows R1 and R2), into
the Claim, into the Meta-Law's "specific number in this corpus", and into all three of the Rounding
Law's falsifiable predictions.

### W2 — The pre-remediation recording was not taken at corpus `1921a6e5`

**The claim.** The delivery-trajectory table pins the 1,780,292-character pre-remediation row to
corpus `1921a6e5`.

**What actually happens.** Re-running the pre-remediation server (`5e627648`) against a worktree of
corpus `1921a6e5` returns **1,747,277** characters (`get_activity` 972,868 / `get_workflow` 108,280 /
`get_resource` 521,246 / `get_technique` 144,883) over 242 calls. Re-running the same server against
corpus `34cd5429` returns **987,370 / 108,280 / 527,683 / 156,959 = 1,780,292** over 246 calls —
every cell of the analysis's pre-remediation row, to the character. The recording was taken at corpus
`34cd5429`, three corpus pull requests ahead of the pin the row names. `git ls-tree 5e627648
workflows` confirms the superproject pinned `1921a6e5` at that moment, so the prior evaluation walked
a submodule checkout ahead of its own pin — precisely the condition `run-token-benchmark.ts:550-553`
reports and declines to enforce.

**What breaks.** Nothing in the headline: because both the before and after recordings sit at
`34cd5429`, the −484,153 the analysis attributes to server commit `ab810342` is a clean server-only
delta, and I confirm it below. What breaks is the analysis's *corpus* accounting — see U1.

### W3 — "No amount of further work on `gate-liveness.ts` will do this" is false

**The claim** (Rounding Law, prediction 1). "**Relaying `variables_changed` on `next_activity` — a
two-word edit to `dispatch-activity.md:50` and `continue-batch.md:46`, no server change — will move
`technique_bundled` on the benchmark walk from 66 toward the low 90s and `get_technique` calls from
24 toward the mid-teens.** No amount of further work on `gate-liveness.ts` will do this."

**What actually happens.** I replaced five lines of `gateAnswer` (`gate-liveness.ts:159-163`) with one
line calling the module's own zero-caller export:

```ts
if (unboundPositiveReads(when, condition, variables).length > 0) return undefined;
```

The same-activity veto at `:156-158` is untouched; only the withhold-on-absent-value rule narrows to
withhold on absent *positive* reads. All 16 committed tests in `tests/gate-liveness.test.ts` pass
unchanged. The walk then reports:

| | committed | one-line change | delta |
|---|---|---|---|
| `technique_bundled` | 66 | **78** | +12 |
| `get_technique` calls | 24 | **12** | −12 |
| `get_activity` chars | 520,075 | 569,398 | +49,323 |
| `get_technique` chars | 146,205 | 78,274 | −67,931 |
| total delivery chars | 1,302,319 | **1,283,711** | **−18,608 (−1.43%)** |
| total tool calls | 242 | **230** | **−12 (−4.96%)** |

Further work on `gate-liveness.ts`, with no corpus edit whatsoever, reaches `get_technique` = 12 —
*below* the mid-teens the analysis reserved for the corpus relay, and past it. The change is reverted;
`git status` shows `src/` clean.

### W4 — "The delivery gate will never fail on any of it" is false

**The claim** (Rounding Law, prediction 3). "A change that alters 57 gate answers moves bytes only if
those steps' techniques enter the bundle, and on the gated walk they cannot, because their inputs are
never relayed. **The instrument that guards the programme is structurally blind to the programme's
largest remaining item.**"

**What actually happens.** The one-line change above moves 18,608 characters — 1.43%, against a gate
threshold of 1% (13,023 characters). The instrument resolves it comfortably. The gate is not blind to
the largest remaining bundling item; the analysis merely priced that item as corpus-blocked and never
measured it.

### W5 — The conservation law's central prohibition is falsified

**The claim.** "Bytes can be freed on either side independently; **readings cannot be created or
destroyed by either side alone, only re-homed**." And, in the transformed claim: "Delivered bytes can
be reduced from the server half alone; **round trips cannot** — every round trip exists because a
reading was taken at one moment and needed at another, and the moments are named in the corpus."

**What actually happens.** Twelve round trips were destroyed by the server half alone, from 242 to
230. No corpus file changed. No reading was re-homed: the gates in question (`is_review_mode != true`,
`stealth_mode != true`, `problem_complexity != 'complex'`) are satisfied by *absence*, and the server
was declining to evaluate a total predicate it already holds the evaluator for. The law is stated as
a conservation principle; it is an implementation choice at `gate-liveness.ts:161-163`, and the module
ships the alternative implementation two functions above.

### W6 — B10's mechanism is refuted by the walker and the snapshot

**The claim.** "`gatesReadUnbound` (`tests/e2e/walker.ts:440-448`) records a gate only when the
variable is in `decidedLater` — the set of names the activity's *checkpoints and `set` actions* bind.
**Technique outputs are not in that set**, and the walker executes no technique, so the committed
snapshot records 20 entries for `start-work-package` … that are walker artifacts."

**What actually happens.** The count is exactly right: 20 entries, 12 × `issue_platform`, 8 ×
`is_review_mode` (`snapshot.test.ts.snap:50-71`). The mechanism is wrong. Neither variable is a
technique output. Both are **checkpoint-decided**, which is precisely why they are in `decidedLater`:
`activityDecidedVariables` (`walker.ts:342-357`) collects every `option.effect.setVariable` key and
every `action: set` target in the activity. The real cause is visible in the same snapshot's
checkpoint list — `start-work-package` fires only two checkpoints on the default walk,
`issue-verification` (setting `needs_issue_creation: false`) and `pr-creation`. `platform-selection`
carries an entry requirement on `needs_issue_creation`, so it never fires and `issue_platform` is
never bound; the review-mode checkpoint likewise never fires. The instrument's defect is that
`activityDecidedVariables` ignores whether the deciding checkpoint is *reachable on the path being
walked*, not that it ignores technique outputs.

This matters because the analysis's diagnosis implies a fix — add technique outputs to `decidedLater`
— that would not remove a single one of the 20 entries, and would add more.

### W7 — B25 is not reproducible; the guard sweep passes 28 of 28

**The claim.** "`npm run check:all` fails locally on `source-encoding` because of untracked probe
files left in the checkout root (`.probe-blocks.ts`, `.probe-delivery.ts`, `.probe-timing.ts`,
`scratch-lens14.ts`, `scratch-reach.ts`, `scripts/tmp-gate-census.ts`)", and, in the Claim section,
"`npm run check:all` passes 27 of 28".

**What actually happens.** `npm run check:all` today reports **28 guards, 28 pass, 0 fail, 0
unmeasured** in 1.7 seconds, with nine untracked files present including two inside `scripts/`.
`check-source-encoding` returns OK. Four of the six files the analysis names do not exist in this
checkout. B25 was a property of the structural pass's own working copy at the moment it ran, not of
the repository, and the "27 of 28" that appears in the Claim's falsifiability list is not a fact
about this tree.

### W8 — The `gate-liveness.ts:99-100` citation states the opposite of what those lines do

**The claim.** "`gateAnswer` returns `undefined` for any `!=` comparison whose variable is absent
(`gate-liveness.ts:99-100` collects `cmp` paths regardless of operator; `:161-163` withholds on any
absent value)."

**What actually happens.** Lines 99-100 sit inside `unboundPositiveReads` and read:

```ts
      case 'cmp':
        if (ast.op !== '!=') paths.add(ast.path);
```

They *exclude* `!=` — the single line in the module that makes W3's fix possible. The
operator-blind collection `gateAnswer` actually uses is `collectWhenPaths` at lines 14-17. The
substantive claim is correct; the evidence cited for it is the code that refutes it. This is not
pedantry: the analysis reaches for `unboundPositiveReads` two paragraphs later as "the helper that
would widen the predicate", so it read the right function and cited it as the cause of the problem
the same function solves.

### W9 — "85 of the 146 fetches are repeats" mixes denominators

162 `get_resource` calls, 146 recorded `resource_fetched` events, 77 distinct ledger keys. The
repeats are either **85 of the 162 calls** or **69 of the 146 fetches**. The sentence pairs the first
numerator with the second denominator.

### W10 — The gate-liveness effect on `get_technique` is understated by one call

**The claim.** "`technique_bundled` rose from 64 (the ungated set on today's corpus) to 66;
`get_technique` calls fell from 25 to 24."

**What actually happens.** That comparison holds the corpus at two different revisions. At a fixed
corpus (`34cd5429`), the server change moves `technique_bundled` 64 → 66 and `get_technique` **25 →
23** — two fewer calls, not one. The 24 measured today is 23 plus one that PR #470 added back, which
the baseline fixture's own description explains ("The detector's second delivery is a full
4,054-character fetch rather than a ledger hit"). The same +2 / −2 pattern reproduces at corpus
`1921a6e5` (63 → 65 bundled, 24 → 22 fetched), so it is the mechanism's signature rather than a
corpus coincidence.

---

## Confirmed, with the evidence

Where the analysis is right it is right on evidence that survives independent execution. Recording
these plainly, because a pass that only reports disagreement is as useless as one that reports none.

| Claim | Verdict | Evidence from this pass |
|---|---|---|
| Benchmark reproduces the committed baseline bit-exactly | **CONFIRMED** | `bench:token --context-mode=fresh --gate` re-run: 1,302,319 chars, index 100, regression 0.0%, gate PASS, every one of the fixture's 22 compared metrics at delta 0. Call profile 242 = 1 + 1 + 12 + 12 + 24 + 162 + 3×10. |
| The 1% threshold is deliberate slack, not a noise floor | **CONFIRMED** | Two full walks on different days returned identical character totals in all four channels. The instrument's resolution is one character; 1% of 1,302,319 is 13,023. |
| The whole fall is server commit `ab810342`, −484,153 (−27.20%) | **CONFIRMED, and strengthened** | The analysis quoted the commit message. Measured at a fixed corpus `34cd5429`: server `5e627648` → 1,780,292; server `1297e655` → 1,296,139. Exactly −484,153, −27.20%. The later server commits (`64085235`, `45b434b4`, `a0a34947`, `2e502519`) move delivery by zero. |
| Definition PRs #468/#470 are net +6,180 | **CONFIRMED** | Same server, corpus `34cd5429` → `2e8b6297`: 1,296,139 → 1,302,319. |
| `get_resource` moved zero characters | **CONFIRMED** | 527,683 at corpus `34cd5429` and at `2e8b6297`, under both the pre-remediation and the current server. Four measurements, one number. |
| Neither `next_activity` call site passes `variables_changed` | **CONFIRMED, and the omission is against an explicit instruction** | `dispatch-activity.md:50` sends `{ session_index, activity_id, step_manifest }`; `continue-batch.md:46` adds only `agent_id`. Corpus-wide, `variables_changed` appears in four prose lines and no call. The parameter exists (`workflow-tools.ts:524, 533`) and its own description reads "relay the worker's `activity_complete` `variables_changed` map verbatim" (`:82`) — which the analysis's "attacker" voice, arguing the withholding may be deliberate distrust, does not account for. |
| `unboundPositiveReads` has zero `src/` callers | **CONFIRMED** | Only `tests/gate-liveness.test.ts:7` and `tests/e2e/walker.ts:20, 446`. |
| The CI gate runs at `verify.yml:82-83` and walks work-package only | **CONFIRMED** | Line 83 is `npm run --silent bench:token -- --label=ci --context-mode=fresh --gate`; no `--workflow`; `run-token-benchmark.ts:384` defaults to `work-package`. The corpus is checked out at the pinned gitlink first (lines 41-52). |
| Gate answers on the measured walk: 2 true / 4 false / 76 unanswered of 82 | **CONFIRMED** | Summed from the twelve `Activity delivery cost` lines of my own run: `lazy_gate_unanswered` 21+1+3+1+6+3+3+4+8+4+15+7 = 76; `lazy_gate_false` 0+…+2+…+2+…= 4; `bundled_steps` = 66 against 64 ungated. |
| Worker bundle 65,253 on the walk, against 422,448 before | **CONFIRMED** | Per-activity `worker_bundle_chars`: 35,204 / 24,311 / 620 ×4 / 543 ×6 = 65,253. The 422,448 is 35,204 × 12 exactly. |
| Budget slack 7.0× | **CONFIRMED** | Maximum `spent_chars` 91,516 against `eager_budget_chars` 640,000. |
| 13 steps undecided solely because a `!=` read is absent | **CONFIRMED, exactly** | My census returns 13, and all eight the analysis names are in the list. The five it does not name are `submit-for-review::mark-ready`, `::process-review-comments`, `::analyze-review-outcome`, `complete::finalize-test-plan` and `complete::ensure-docs`. |
| meta ceiling: 12 gated, 11 vetoed, 1 answerable | **CONFIRMED** | The one answerable step is `initialize-session::derive-planning-slug` (`is_resuming == false`). |
| `start-work-package`: 32 technique steps, 11 ungated, 21 vetoed, 0 answerable | **CONFIRMED** | Reproduced exactly. |
| B2 — `gateAnswer` returns a wrong `false` for `gitnexus_indexed == true` | **CONFIRMED, independently reproduced** | `01-start-work-package.yaml` sets it true through an ungated `action: set`; `workflow.yaml:540-543` declares `defaultValue: false`; `10-post-impl-review.yaml:22` gates on `== true`. My census returns `FALSE` for that step, and the server's own log records `lazy_gate_false` in `post-impl-review`. |
| B3 — `mayReferBack` extends marker collapse to fresh mode | **CONFIRMED** | `git show 5e627648:src/tools/workflow-tools.ts` has no `mayReferBack`; every collapse there is gated on `referenceMode`, which is false in fresh mode. Today's walk is `--context-mode=fresh` and collapses the worker bundle from 35,204 to 620 on its third activity. |
| B4 — the wire note enumerates only reasons for absence | **CONFIRMED as text** | `workflow-tools.ts:1184`. `docs/resource_resolution_model.md:263` states the correct rule; the worker never receives that file. Severity disputed — see O2. |
| B8 — `check-decision-order` scans top-level steps only | **CONFIRMED** | `steps.forEach` at :187 over `def?.steps`, `steps.slice(0, index)` at :192. No loop recursion, single-activity. The guard reports OK. |
| B9 — the `defaultValue` exemption | **CONFIRMED** | `defaultedVariables` at :159-171, `if (defaulted.has(name)) continue;` at :191. |
| B16 — the corpus-mismatch check is report-only | **CONFIRMED, and worse** | My run emitted the banner at stderr line 6,722 and passed. See U6. |
| B22 — `batchState` exempts the session's own agent | **CONFIRMED** | `batch.ts:154`: `const exempt = scope === state.agentId \|\| activities.length === 0;` |
| B23 — four empty `actions: []` in work-package plus one in prism | **CONFIRMED, exactly at the cited lines** | `01-start-work-package.yaml:294`, `11-validate.yaml:47`, `13-submit-for-review.yaml:41` and `:360`, `prism/activities/00-select-mode.yaml:11`. |
| Corpus shape table | **CONFIRMED, every cell** | meta 5 activities / 171 files / 297,551 bytes / 23 technique / 14 action / 5 checkpoint / 2 loop. work-package 15 / 168 / 634,102 / 176 / 31 / 44 / 15. 49 checkpoints across both trees. |
| ECO-06, ECO-10, MECH-02, CTX-04, CTX-06, RED-04 evidence | **CONFIRMED** | `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35` / `DEFAULT_BATCH_MAX_ACTIVITIES = 3` at `config.ts:164-165` behind a five-line pointer; 70 triage verdicts, 70 `"harmless"`; `delivered_artifact` twice, both in `sync-progress-status.md:32, 54`; the Rust link at `implement-task.md:50` and `review-test-suite.md:71`; `workflow-engine/TECHNIQUE.md` 8,286 bytes; 150 and 112 technique files. |

### The disposition of the prior report's 52 findings stands

**6 CLOSED / 15 PARTLY ADDRESSED / 31 UNTOUCHED, and HIGH 4/4/7, MEDIUM 2/7/18, LOW 0/4/6 — unchanged
by this pass.** Nothing is wrongly closed and nothing is wrongly left open. I audited all six CLOSED
verdicts against the current build (below) and twenty of the remaining forty-six against the cited
evidence: MECH-01, MECH-02, CTX-02, CTX-03, CTX-04, CTX-06, CTX-08, TOP-01, TOP-02, TOP-04, TOP-05,
TOP-08, TOP-09, TOP-11, RED-02, RED-03, RED-04, RED-09, RED-10, ECO-06, ECO-10. Every cited artefact
exists at the cited location with the cited content. Two verdicts are sharpened rather than changed:
RED-03/RED-05's `validation_passed` case is worse than reported (U4), and TOP-01's measured effect is
understated by one call (W10).

Where this pass departs from the structural analysis is not in *which* findings remain open but in
*how much* the open ones are worth. The gate-liveness ceiling arithmetic behind TOP-01, and the relay
prescription behind the Rounding Law, are both wrong by a factor that reverses their ranking.

### The six CLOSED dispositions, audited

All six survive. This is the analysis's most consequential claim and it holds.

- **MECH-03** — `naming-conventions.md` v1.1.0, five-row total table with `epic` → `feat` at line 51,
  `{$branch_type_prefix}` set at step 2 and read at step 4, and an explicit stop-and-report when
  `issue_type` is unset. Closed.
- **CTX-01** — `mayReferBack` at `workflow-tools.ts:877`; the measured bundle is 65,253 against
  35,204 × 12. Closed, at the price of B3.
- **CTX-07** — `readTechniqueWithSource` / `composeTechniqueWithSource` at
  `technique-loader.ts:110, 599`; `workflow-tools.ts:1017, 1072` qualify against
  `techniqueWorkflowId`; `tests/borrowed-technique-resolution.test.ts` exists (+35 lines in this
  remediation). Closed.
- **TOP-06** — `platform-selection` now sits at `01-start-work-package.yaml:217`, above every reader
  of `issue_platform` (first at :264); the signing hard-fail precedes `analyze-repo-with-gitnexus`;
  PR #470 added the `project_type == rust-substrate` clause to the build-artifact gate
  (`13-submit-for-review.yaml:275-278`), which is what drops the walk from 11 checkpoint triples to
  10; `check-decision-order` reports OK. Closed. One caveat: the reorder is real but the walk still
  records 12 `issue_platform` reads as unbound, because `platform-selection`'s own entry requirement
  is not met on that path — see W6. That is not a TOP-06 regression, but it means the guard the fix
  installed cannot see the condition that remains.
- **RED-01** — `verify.yml:82-83`, baseline re-recorded 2026-08-17, gate passes at 0.0%. Closed.
- **ECO-02** — `audit-schema-validation.md` v1.2.0; both guards take `--root` (lines 30, 35) with the
  resolution order spelled out; no occurrence of `--update-baseline` remains. Closed.

---

## Overclaims

### O1 — B24 is classified structural; it is fixable, and the field it needs already exists

**The claim.** B24, HIGH, **S**: "`variablesWrittenIn` is activity-granular: a variable written
anywhere in the activity vetoes every gate reading it, at any position." Reinforced as the Meta-Law's
structural invariant: "any accounting that treats the corpus and the server as two accounts of one
resource must pick a time granularity, and **there is only one granularity both parties share — the
activity**. The server delivers per activity; the corpus decides per step."

**Why it is fixable.** `ProducerSite` (`src/utils/binding-provenance.ts:58-67`) already carries:

```ts
  /** Document-order position across the whole workflow (activities in declared order, steps flattened). */
  ordinal: number;
```

The producer index is step-granular. `variablesWrittenIn` (`gate-liveness.ts:67-76`) discards the
ordinal and returns a bare `Set<string>`. The fix is to return `Map<string, number>` of the *earliest*
producing ordinal per name, pass the reading step's own ordinal into `gateAnswer`, and veto only when
a producer precedes the reader. That is roughly fifteen lines across two functions and one call site,
with no schema change, no corpus change, and no new data.

The Meta-Law's structural invariant is therefore false as stated: the two parties do share a step
granularity, the server computes it on every delivery, and the delivery layer throws it away one
function before it is used. The "rounding" is a line of code, not a property of the problem space.

### O2 — B4 is rated HIGH on a hazard the predicate forecloses

**The claim.** B4, HIGH, **F**: a present `step_techniques` entry "may now carry a gate that has since
answered differently".

**Why it is overstated.** `gateAnswer` returns `undefined` for any gate reading a variable the
activity itself produces (`gate-liveness.ts:156-158`, against a producer scan that covers technique
outputs, remaps, checkpoint effects, `action: set` targets and loop items). A `true` answer therefore
certifies that no in-activity write can move it. Within the activity being delivered the answer is
stable by construction. Both measured `true` steps confirm it: `architecture-summary`
(`skip_architecture_summary != true`, a seeded default with no work-package writer) and
`structural-analysis-inline` (`problem_complexity != 'complex'`, bound by a checkpoint in a *prior*
activity). The residual exposure is confined to writes the producer scan cannot see — an undeclared
technique output, or a write inside a technique body — a class the analysis never names. And the
step's own YAML, gate included, travels in the same payload, so the worker holds the authority the
note omits.

MEDIUM, and a documentation defect rather than a delivery one.

### O3 — B3 is classified structural; the corpus already sends the signal the server ignores

**The claim.** B3, HIGH, **S**: fresh-mode collapse on identity alone, "the corpus mitigates by
convention".

**Why it is fixable, and why the framing is backwards.** The corpus does not merely mitigate by
convention — it already computes and transmits the exact fact the server is guessing at.
`compose-prompt.md:25` declares `holds_prior_deliveries` as a first-class input;
`dispatch-activity.md:53` binds it `false` for a minted identity, `continue-batch.md:51` and
`resume-worker.md:46` bind it `true`, and `resume-worker.md:55` binds it `false` for a replacement.
`compose-prompt.md:45` then instructs the worker to "Add `bundle: \"reference\"` to that call when
`{holds_prior_deliveries}`, so what the context already holds arrives as unchanged markers; **omit it
otherwise, because a fresh context needs the bytes**."

A worker told `holds_prior_deliveries: false` therefore *omits* `bundle`. And
`mayReferBack = bundle !== 'full' && (referenceMode || hasDispatch(state, scope))` treats an omitted
`bundle` as permission. The server does not lack a liveness signal; it overrides one the corpus is
already sending, because the corpus expresses "I hold nothing" as an absence and the predicate reads
absence as consent. The fix is one optional boolean on `get_activity` — or, cheaper, reading `bundle:
'full'` out of the corpus's "omit it otherwise" instruction. Roughly ten lines plus one corpus
sentence.

This also sharpens the analysis's own concealment mechanism: "an optional parameter is a silent
half-landing" is exactly what `bundle` is here, and the analysis applied the diagnosis to
`context_tokens` while missing it on the parameter its own HIGH-severity regression turns on.

Reclassify **F**, HIGH.

### O4 — The Unrelayed-Reading Law is an implementation choice

Named as a conservation law with a falsifiable prohibition (round trips cannot fall from the server
half alone). W5 falsifies it: 12 round trips, server half only, one line. The alternative design that
violates the "law" is not hypothetical — it is `unboundPositiveReads`, present in the same 175-line
module, exported, covered by six of the module's sixteen tests, and called by nothing that ships.

What survives the falsification is weaker and still worth keeping: *readings whose gate needs a
positive value* cannot be answered from the server half alone. Readings whose gate is satisfied by
absence can. The corpus spells "not in that mode" the second way in 13 of its 34 recoverable gated
steps, and the server declines to read its own spelling.

### O5 — "97.8% of the fall is `get_activity`" is a mixed-corpus figure

Under a corpus-matched comparison (both walks at `34cd5429`) the server-only fall of 484,153
decomposes as `get_activity` −469,185 (96.9%), `get_technique` −14,968 (3.1%), `get_resource` 0,
`get_workflow` 0. The analysis's 97.8% / 2.2% split silently folds in PR #470's +4,214 of
`get_technique`. The conclusion is unaffected; the number is not the one it claims to be.

### O6 — ECO-03's "sharper" reading is sharper in the wrong direction

"The 1% threshold is 13,023 characters of deliberate slack, larger than the whole measured
gate-liveness saving and more than twice the largest mechanisation candidate" is true of the *measured*
saving, which is bundling-neutral in bytes. It is false of the saving *available from the same module*:
18,608 characters, above the threshold, resolvable by the gate as it stands. The instrument's
resolution is not the binding constraint on the largest remaining delivery item.

---

## Underclaims

### U1 — The corpus cost the window +29,776 characters and +2 round trips, not +6,180 and −3

The four-corner measurement the analysis never took:

| | corpus `1921a6e5` | corpus `34cd5429` | corpus `2e8b6297` |
|---|---|---|---|
| **server `5e627648`** (pre) | 1,747,277 / 242 calls | **1,780,292 / 246** | — |
| **server `1297e655`** (today) | **1,272,543 / 240** | 1,296,139 / 244 | **1,302,319 / 242** |

Reading it two ways:

- **Server effect, corpus fixed.** At `34cd5429`: −484,153 chars, −2 calls. At `1921a6e5`: −474,734
  chars, −2 calls. Consistent, and the analysis's headline number is exactly right.
- **Corpus effect, server fixed at today's.** `1921a6e5` → `34cd5429`: **+23,596 chars, +4 calls**
  (+3 `get_resource`, +1 `get_technique`). `34cd5429` → `2e8b6297`: +6,180 chars, −2 calls (+1
  `get_technique`, −1 checkpoint triple). **Net over the window: +29,776 characters and +2 round
  trips.**

The +23,596 is invisible in the analysis because `ab810342` bumps the submodule gitlink from
`1921a6e5` to `34cd5429` in the same commit as the server change (`git ls-tree ab810342 workflows`).
Corpus PRs #463, #464 and #465 — landed the same day — therefore ride into main inside the server
commit's diff and are credited to it. The analysis's per-commit attribution is faithful to `git`; its
per-*half* attribution is not.

**The counterfactual this exposes.** Today's server on the pre-remediation corpus delivers
**1,272,543 characters over 240 calls** — 29,776 characters and two round trips better than what
actually shipped. The lowest call count in the entire 2×2 is the corpus the remediation replaced. The
analysis's transformed claim ("round trips stay flat while bytes fall") is true but generous: over
the same window the corpus half moved round trips in the wrong direction.

### U2 — The relay is worth one step on the walked path, not fifty-seven

Correcting W1 gives 34 answerable-if-bound work-package steps. Evaluating those 34 under a fully
relayed create-path bag (`is_review_mode: false`, `stealth_mode: false`, `project_type: 'other'`,
`run_local_validation: false`, `gitnexus_indexed: true`, `problem_complexity: 'moderate'`):

- **17 answer `true`** — the only ones that convert a lazy fetch into a bundled block.
- **17 answer `false`** — 12 of them `is_review_mode == true`, 2 `stealth_mode == true`, 2
  `project_type == 'rust-substrate'`, 1 `problem_complexity == 'complex'`. A `false` answer converts
  **zero** round trips: the worker skips the step whether or not the technique was withheld.

Of the 17 that would answer true, one (`architecture-summary`) is already bundled today and one
(`structural-analysis-inline`) is already answered at runtime from a checkpoint effect. So the
ceiling on new bundling from a complete relay is **15 steps**.

And 13 of those 15 need no relay at all — they are the `!=`-absent set W3 measures. The corpus relay's
own marginal contribution on the benchmark path is:

| step | gate | needs |
|---|---|---|
| `post-impl-review::gitnexus-detect-changes-preflight` | `gitnexus_indexed == true` | the `action: set` relayed (this is B2) |
| `complete::create-adr` | `is_review_mode != true && (problem_complexity == "moderate" \|\| "complex")` | predicate widening for the `!=`, then a value already relayed by checkpoint |
| `complete::update-adr-status` | same | same |

**One step**, and it is the correctness bug B2 rather than a bundling win. The analysis's cheapest
recommended action is its least valuable one, and its dismissed one is its most valuable.

### U3 — The largest remaining delivery item is a one-line server change, and the analysis priced it MEDIUM

B7 names `unboundPositiveReads`, counts its 13 steps, and rates it MEDIUM/F behind a HIGH B1 relay
worth one step. Measured, B7 is worth 12 round trips and 18,608 characters — three times the entire
round-trip movement of the whole remediation (4 calls of 246, 1.6%) and 6× its measured bundling
effect (2 steps). It requires no corpus edit, no schema change, no re-baseline of anything but the
delivery fixture, and it passes the module's existing test suite unchanged. It should be the top HIGH
item in the table.

### U4 — `validation_passed` is not the variable the gate reads

RED-03's disposition names "`validation_passed` (2 reads)". The declared scalar
`work-package/workflow.yaml:196-199` (`defaultValue: false`) has **zero reads and zero writes**
anywhere in the activities. The two sites the analysis counts —`11-validate.yaml:46` and `:60` — read
`validation_results.validation_passed`, a nested path under `validation_results`, an `object`
variable declared at `:200-202` with no default and no writer. So the safety floor RED-05 named is
live in a sharper form than reported: a guard-visible declaration and the path actually read are
different names, and the read one can never be answered. `readPath` (`gate-liveness.ts:54-61`) walks
into `undefined` and returns `undefined`, so every `validation_results.*` gate is permanently
unanswerable regardless of any relay — a fifth category the ceiling arithmetic does not have a column
for.

### U5 — The corpus-mismatch banner this repository emits is itself wrong

`resolveCorpusRev` (`run-token-benchmark.ts:323-335`) compares `git rev-parse HEAD` of the workflows
directory against the fixture's `workflowsRev`. The fixture records `72db28ae`; the checked-out
submodule is at `2e8b6297`, the merge commit whose *tree is identical* (`git diff 72db28ae 2e8b6297`
is empty). Every local run therefore prints "Corpus mismatch: reference recorded at
workflows@72db28ae, this walk ran workflows@2e8b6297" against a corpus that is byte-for-byte the
reference corpus. B16 says the check is report-only; the deeper problem is that the report it
declines to enforce is a false positive by construction, because it compares commit ids where the
attribution guarantee is a property of trees. It is a third instance of the analysis's own
concealment mechanism — an alarm indistinguishable from a real one — sitting inside the instrument
built to end that class.

### U6 — Presence in `step_techniques` now also erases the only observability signal

`step_techniques_note` instructs: "EMIT a one-line \"▶ step <step_id>\" begin-beat before executing
it … do NOT ping the server per bundled step; delivery-time `technique_bundled` events already record
coverage." Under the old predicate, presence implied ungated, so a missing beat was a defect. Under
the new one, a present entry whose gate the worker evaluates false produces no beat, no fetch, and no
server event — and is indistinguishable from a worker that skipped a step it should have run. The
remediation did not merely leave the note stale; it removed the only cross-turn evidence that a
bundled step ran. This is B4's real cost and it is an observability regression, not a wording one.

### U7 — `hasDispatch` governs two further sites the analysis does not reach

`resource-tools.ts:792` and `:921` use `hasDispatch(state, scope)` in `recordFirstArrival` on
`get_technique` and `get_resource`, so an unseen scope's first call to either tool records an
`activity_dispatched` event. A worker that fetches a technique before its activity — or an
out-of-band context that only reads resources — thereby makes `hasDispatch` true for itself, which is
what `mayReferBack` later reads as "this context retains what it was sent". The identity heuristic is
seeded by three tools, not one.

### U8 — The Rounding Law's second prediction is untestable as stated, and its example is already false

Prediction 2 says each further decision-order fix "reduces the bundling ceiling by the number of
in-activity readers it moves the checkpoint above", citing PR #470 moving `platform-selection` above
12 readers of `issue_platform`. But `start-work-package` had **zero** answerable-if-bound steps before
that move as well as after: all 21 of its gated technique steps read at least one variable the
activity itself produces, and 12 of them read `issue_platform`, which `platform-selection` writes
*wherever it sits in the file*. `variablesWrittenIn` is position-blind (O1) — that is the whole of
B24 — so moving a checkpoint cannot change the veto set. The prediction's own worked example
demonstrates the opposite of what it claims: the ceiling did not fall, because it was already zero.

---

## Revised Findings Table

`F` = fixable at the site where it appears. `S` = structural under the corrected reading. Severity is
mine. "Prior" is the structural analysis's classification.

| # | Location | What breaks | Severity | Prior | Mine | Why the change |
|---|---|---|---|---|---|---|
| A1 | `src/utils/gate-liveness.ts:159-163` | `gateAnswer` withholds on any absent compared value, including `!=` forms that absence answers. Measured cost: 12 round trips and 18,608 characters per walk. The module's own `unboundPositiveReads` makes the distinction and is called by nothing under `src/`. | **HIGH** | B7 MEDIUM/F | **HIGH / F** | Promoted. Measured at 6× the whole remediation's round-trip movement; one line; all 16 committed tests pass unchanged. |
| A2 | structural analysis §"Corpus-wide ceiling" | The veto and answerable counts for work-package are transposed. 57 of 91 gated steps are permanently lazy, 34 recoverable — not the reverse. | **HIGH** | — | **new** | Independently measured with the server's own index and predicate; the analysis's own `start-work-package` sub-count agrees with the corrected total. |
| A3 | `src/tools/workflow-tools.ts:993-999` + `work-package/workflow.yaml:540-543` + `01-start-work-package.yaml:164-168` | `gateAnswer` answers `false` for `gitnexus_indexed == true` where the run answers `true`. A wrong answer, not a conservative one. Harmless today; fatal under TOP-04 pruning. | HIGH | B2 HIGH/F | **HIGH / F** | Confirmed and independently reproduced. Unchanged. |
| A4 | `src/tools/workflow-tools.ts:877` + `meta/techniques/workflow-engine/compose-prompt.md:25, 45` | `mayReferBack` collapses the worker bundle on `agent_id` alone in every mode, overriding the corpus's `holds_prior_deliveries` signal, which is expressed as an *omitted* `bundle` parameter the predicate reads as consent. | HIGH | B3 HIGH/S | **HIGH / F** | Reclassified. The protocol half exists and is transmitted; the server declines to honour it. Ten lines. |
| A5 | `src/tools/workflow-tools.ts:964-1010` vs `src/utils/gate-liveness.ts:67-76` vs `src/utils/binding-provenance.ts:58-67` | `variablesWrittenIn` collapses a step-granular producer index to an activity-granular `Set`, discarding the `ordinal` field the index already computes. 57 of 91 gated work-package steps are vetoed as a result. | HIGH | B24 HIGH/S | **HIGH / F** | Reclassified. The granularity the Meta-Law calls unshared is computed on every delivery and thrown away one function later. ~15 lines. |
| A6 | `meta/techniques/workflow-engine/dispatch-activity.md:50`; `continue-batch.md:46` | Neither `next_activity` call site passes `variables_changed`, so no technique output and no `action: set` write reaches the bag. Real, but worth **one** additional bundled step on the walked path once A1 lands — and that one is A3. | **MEDIUM** | B1 HIGH/F | **MEDIUM / F** | Demoted. Its 57-step justification was the transposed figure; the measured marginal value is one step. Its remaining value is correctness (A3), not delivery. |
| A7 | `src/tools/workflow-tools.ts:1184` | The wire note enumerates only reasons a step may be *absent*, and instructs "do NOT ping the server per bundled step". A present gated entry the worker evaluates false now produces no beat, no fetch and no event — indistinguishable from a skipped step. | **MEDIUM** | B4 HIGH/F | **MEDIUM / F** | Demoted in severity (the `true` answer is stable within the activity by construction), sharpened in kind: it is an observability regression, not a correctness one. |
| A8 | `tests/e2e/walker.ts:342-357` | `activityDecidedVariables` collects every checkpoint option's `setVariable` regardless of whether that checkpoint is reachable on the path walked. `start-work-package` fires 2 of its checkpoints on the default walk, so 20 committed `gatesReadUnbound` entries record variables whose deciding checkpoint never ran. | MEDIUM | B10 MEDIUM/S | **MEDIUM / F** | Mechanism corrected (W6) and reclassified: the fix is a reachability filter, not a redesign. The analysis's stated fix would remove none of the 20. |
| A9 | `src/tools/workflow-tools.ts:744-757` + `activity-worker.md:38, 54, 84` + `dispatch-activity.md:97` | `_meta.batch` at the activity boundary is produced and read by nothing; `context_tokens` is passed by no call site; the corpus still consumes the stale open-time reading and its prose asserts that reading is correct. | MEDIUM | B5 MEDIUM/S | **MEDIUM / S** | Unchanged. Confirmed: `context_tokens` and the `_meta.batch` block are both new in this remediation (`workflow-tools.ts:529-531, 743-757`) and both unread. |
| A10 | `src/tools/workflow-tools.ts:1352-1354` | `lazy_gate_unanswered` / `lazy_gate_false` / `worker_bundle_chars` reach `logInfo` only — absent from `_meta`, history, benchmark metrics and every test. Obtaining them required grepping harness stderr, as it did for the structural pass. | MEDIUM | B6 MEDIUM/F | **MEDIUM / F** | Unchanged. Confirmed by having to do the same thing. |
| A11 | `scripts/check-decision-order.ts:187-194` | Top-level `steps` only, no recursion into `kind: loop` (15 in work-package, 2 in meta); single-activity. Reports OK. | MEDIUM | B8 MEDIUM/F | **MEDIUM / F** | Unchanged. |
| A12 | `scripts/check-decision-order.ts:159-171, 191` | The `defaultValue` exemption re-admits RED-03: default `false`, reader gated on `true`, earlier read skipped, later answer changes nothing. 103 declared variables carry defaults. | MEDIUM | B9 MEDIUM/S | **MEDIUM / S** | Unchanged. |
| A13 | `src/tools/resource-tools.ts:277-315` | Version drift is detected, seeded and re-stamped silently: no warning, no `validation` entry, no history event; the response reports only the new version. | MEDIUM | B11 MEDIUM/F | **MEDIUM / F** | Confirmed at the cited lines. |
| A14 | `src/tools/resource-tools.ts` (`resume_checkpoint`, `dispatch_child`) | Only `start_session` compares versions. A worker resuming after a gate and a child under a drifted parent take no late seed. | MEDIUM | B12 MEDIUM/F | **MEDIUM / F** | Unchanged. |
| A15 | `scripts/run-token-benchmark.ts:384` + `.github/workflows/verify.yml:83` | The CI gate walks work-package only. `meta` — 5 activities, 23 technique steps, 291 KB — is ungated, and the invocation passes no `--workflow`. | MEDIUM | B14 MEDIUM/F | **MEDIUM / F** | Confirmed. |
| A16 | `scripts/run-token-benchmark.ts:173, 352` | The 1% threshold admits 13,023 characters per merge on a walk deterministic to the character. | **LOW** | B15 MEDIUM/F | **LOW / F** | Demoted. Real, but A1 demonstrates the gate resolving a 1.43% movement, so it is not the binding constraint on the largest remaining item, which was the reason B15 was rated MEDIUM. |
| A17 | `scripts/run-token-benchmark.ts:323-335, 550-553` | The corpus-mismatch check is report-only **and** compares commit ids rather than trees, so it fires against a merge commit whose tree is identical to the reference. Every local run in this checkout emits a false alarm. | MEDIUM | B16 LOW/F | **MEDIUM / F** | Promoted. A report-only check that is also wrong trains readers to ignore it. |
| A18 | `docs/resource_resolution_model.md:256` | "nothing is shipped for a step the run will not execute" — the step's YAML body still travels in the activity payload; only the technique protocol is withheld. | LOW | B17 LOW/F | **LOW / F** | Confirmed at the exact line. |
| A19 | `meta/techniques/workflow-engine/sync-progress-status.md:32, 54` | `delivered_artifact` has no producer: two references corpus-wide, both inside the declaring file. 28 guards pass. | MEDIUM | B18 MEDIUM/S | **MEDIUM / S** | Confirmed exactly. |
| A20 | `work-package/workflow.yaml:196-202` + `11-validate.yaml:46, 60` | The declared scalar `validation_passed` has zero reads and zero writes; the gates read `validation_results.validation_passed`, a nested path under an object with no default and no writer, which `readPath` can never answer. Plus `has_open_questions`, `skip_architecture_summary`, `stealth_mode` (22 reads) with no producer site. | MEDIUM | B19 MEDIUM/F | **MEDIUM / F** | Sharpened (U4). The named variable and the read path are different names. |
| A21 | `scripts/binding-fidelity-triage.json` | 70 of 70 verdicts "harmless"; 0 fix-later, 0 live-bug. The stamp note reports 183 corpus commits of drift against those verdicts. | LOW | B20 LOW/S | **LOW / S** | Confirmed: 70 verdicts, 70 `"harmless"`. |
| A22 | `src/config.ts:158-165` | The 40-line comment recording the measurements behind 0.35 and 3 was replaced by a six-line pointer to `docs/dispatch_model.md`; ECO-06's re-measurement was not performed. | LOW | B21 LOW/F | **LOW / F** | Confirmed: the constants stand at `:164-165`. |
| A23 | `src/utils/batch.ts:154` | `batchState` exempts `scope === state.agentId` from both limits, so on the solo topology every measurement in both reports uses, the bound is not computed at all. | LOW | B22 LOW/S | **LOW / S** | Confirmed verbatim. |
| A24 | `01-start-work-package.yaml:294`; `11-validate.yaml:47`; `13-submit-for-review.yaml:41, 360`; `prism/activities/00-select-mode.yaml:11` | Four work-package `actions: []` steps plus one in prism; no guard rejects an empty action list. | LOW | B23 LOW/F | **LOW / F** | Confirmed at every cited line. |
| — | environment | B25 (`check:all` fails on `source-encoding`) | — | B25 LOW/F | **WITHDRAWN** | `check:all` reports 28 pass / 0 fail / 0 unmeasured in this tree with nine untracked files present, including two in `scripts/`. Four of the six files named do not exist. |

**Fixable: 18. Structural: 5.** The structural set is A9, A12, A19, A21, A23. Three of the analysis's
nine structural findings (B3, B10, B24) are reclassified fixable on evidence, and one (B25) is
withdrawn. What remains structural is not the two-granularity split the Rounding Law names — the
server holds both granularities — but the narrower fact that this repository's verifiers read files
and its costs are relations across turns.

---

## Where the analysis's claim lands, restated

The structural analysis's transformed claim was: *delivered bytes can be reduced from the server half
alone; round trips cannot.* Measured, the second half is false — twelve round trips came out of the
server half alone, from a helper the same commit shipped and never called. The corrected claim is
narrower and, I think, harder:

> This system's server already holds every fact it needs to answer 13 of its gated work-package steps
> outright, and it holds the step-granular ordinals that would let it revisit the 57 it vetoes
> wholesale. It discards each of those facts one function before the point of use — the operator on a
> comparison, the ordinal on a producer, the `holds_prior_deliveries` flag the corpus already
> transmits. The corpus half is not where the capability is missing. It is where the *blame* is
> cheapest to place, because the corpus is the half no server test can fail on.

Three falsifiable consequences, all checkable in this tree:

- If the corpus half were the constraint, the largest available bundling win would need a corpus edit.
  It needs one line in `src/utils/gate-liveness.ts` and is worth 12 round trips and 18,608 characters.
- If the granularity split were structural, the step ordinal would not exist. It is
  `ProducerSite.ordinal`, documented as "document-order position across the whole workflow", computed
  on every delivery.
- If the corpus were withholding a signal, `holds_prior_deliveries` would not appear in five meta
  technique files with an explicit instruction on how the worker is to transmit it.

The remediation's own evidence base still has the property it was built to remove — but the fact it
conceals is not that a capability half-landed. It is that the half that landed was under-read by its
own predicate.
