---
target: /home/mike1/projects/dev/workflow-server (server tree at 1297e655; `workflows` submodule checkout at 2e8b6297, superproject pin 72db28ae — `git rev-parse` returns tree `d00cfe27` for both)
subject: the `meta` and `work-package` definition trees, evaluated for the time and token cost of one run
analysis_date: 2026-08-18
lens: L12 synthesis
analysis_focus: Remediation Effect — server PRs #467/#471 and definition PRs #468/#470, merged 2026-08-17/18
inputs: remediation-effect/structural-analysis.md (ANALYSIS 1); remediation-effect/adversarial-analysis.md (ANALYSIS 2)
gitnexus: unavailable for this target; every disputed figure re-derived by execution against the tree
---

# Remediation Effect — Synthesis

Every point on which the two analyses disagree is settled below by running the code rather than by
preferring an author. Four measurements decide most of it: an independent gate census written against
`buildProducerIndex`, `variablesWrittenIn` and `gateAnswer`; the one-line counterfactual to
`gate-liveness.ts`, applied, measured and reverted (`git status src/` clean); a position-aware veto
census that neither analysis ran; and the same benchmark walk executed under two agent-identity
topologies, which neither analysis ran and which turns out to decide the disagreement itself.

## What both analyses got right, confirmed here

The delivery baseline reproduces to the character. `npm run bench:token -- --context-mode=fresh
--gate` returns 520,075 / 108,356 / 527,683 / 146,205 = **1,302,319** delivery characters over **242**
tool calls (1 `start_session`, 1 `get_workflow`, 12 `next_activity`, 12 `get_activity`, 24
`get_technique`, 162 `get_resource`, 10 yield/respond/resume triples), `deliveryCostIndex` 100,
regression 0.0%, gate PASS, every one of the fixture's compared metrics at delta 0. The per-activity
`Activity delivery cost` lines sum to `worker_bundle_chars` **65,253** (35,204 / 24,311 / 620 ×4 /
543 ×6), `bundled_steps` **66**, `lazy_gate_unanswered` **76**, `lazy_gate_false` **4**, maximum
`spent_chars` **91,516** against `eager_budget_chars` **640,000** (200,000 × 0.8 × 4 —
`config.ts:155-156`), 7.0× slack.

The four pull requests measure 36 files / 1,558 insertions / 244 deletions on the server
(`5e627648..1297e655`) and 12 / 141 / 70 on the corpus (`34cd5429..2e8b6297`) — **48 / 1,699 / 314**
combined, against the brief's 42 / 1,861 / 297. `git ls-tree 5e627648 workflows` returns `1921a6e5`
and `git ls-tree ab810342 workflows` returns `34cd5429`, so the corpus bump rides inside the server
commit exactly as the adversarial analysis reports.

The disposition of the prior report's 52 findings — **6 CLOSED / 15 PARTLY ADDRESSED / 31 UNTOUCHED**,
HIGH 4/4/7, MEDIUM 2/7/18, LOW 0/4/6 — stands. Both analyses reach it independently and every closed
verdict's artefact is present at its cited location. Nothing here moves a disposition.

## Corrections to both analyses, established by measurement

| # | Claim | Held by | Verdict here | Evidence |
|---|---|---|---|---|
| C1 | work-package: 34 vetoed / 57 answerable | ANALYSIS 1 | **WRONG** | Independent census: **57 vetoed / 34 answerable**. Per-activity vetoed 21+0+1+4+3+0+6+3+3+4+3+1+4+1+3 = 57. Every other cell reproduces, including 1/3/87 and the whole meta column. |
| C2 | Round trips cannot fall from the server half alone | ANALYSIS 1 | **FALSIFIED** | Replacing `gate-liveness.ts:159-163` with `if (unboundPositiveReads(when, condition, variables).length > 0) return undefined;` moves `technique_bundled` 66 → **78**, `get_technique` 24 → **12**, total delivery 1,302,319 → **1,283,711** (−18,608, −1.43%), calls 242 → **230**. |
| C3 | `gatesReadUnbound`'s 20 entries are walker artifacts because technique outputs are absent from `decidedLater` | ANALYSIS 1 | **WRONG MECHANISM** | Both variables are checkpoint-set: `issue_platform` at `01-start-work-package.yaml:230, 236`, `is_review_mode` at `:54, 61, 110`. `platform-selection` carries `condition: needs_issue_creation == true` (`:217-221`) and `issue-verification` sets that false on the walked path, so the deciding checkpoint never fires. |
| C4 | `check:all` fails 27 of 28 on stray probe files | ANALYSIS 1 | **WITHDRAWN** | 28 guards, **28 pass, 0 fail, 0 unmeasured** in 1.8s. None of the named probe files exists. |
| C5 | `gate-liveness.ts:99-100` collects `cmp` paths regardless of operator | ANALYSIS 1 | **CITES THE OPPOSITE** | `:99-100` is `case 'cmp': if (ast.op !== '!=') paths.add(ast.path);` inside `unboundPositiveReads` — the line that *excludes* `!=`. The operator-blind collector is `collectWhenPaths` at `:14-17`. |
| C6 | The vitest suite passes | ANALYSIS 1 | **WRONG in this checkout** | `npx vitest run` at HEAD: **1 failed / 1,034 passed / 14 skipped**. The failure is `tests/e2e/snapshot.test.ts:37`, the corpus-stamp assertion, against trees that are byte-identical. |
| C7 | The widened predicate "passes the module's existing test suite unchanged" | ANALYSIS 2 | **INCOMPLETE** | The 16 tests in `tests/gate-liveness.test.ts` do pass. `tests/e2e/batched-dispatch.test.ts:270` does not: `expected 82816 to be less than 78128`. |
| C8 | The step ordinal makes the granularity split "a line of code" | ANALYSIS 2 | **TRUE IN MECHANISM, BOUNDED IN VALUE** | A position-aware veto lifts **7 of 57** work-package vetoes and **1 of 11** meta ones. 50 of 57 are vetoed by a producer that genuinely precedes the reader. |
| C9 | The relay is worth one step on the walked path | ANALYSIS 2 | **CONFIRMED, and sharpened** | Under a fully relayed create-path bag: 17 true / 17 false / 57 unanswered. 16 steps flip to true; 13 are the negative-form set no relay reaches for; 2 turn on `problem_complexity`, which is a *checkpoint* effect (`02-design-philosophy.yaml:38, 47, 56, 65`) and already relayed. One step depends on `variables_changed` alone, and it is the correctness bug. |

C1 is the load-bearing correction. Every downstream number in the structural analysis that cites 57
as the recoverable population — the ledger rows R1/R2, the Claim, the Rounding Law's "specific number
in this corpus" and all three of its predictions — inverts.

---

## Refined conservation law

### What the structural analysis proposed

**THE UNRELAYED-READING LAW.** *Readings are produced in one agent's turn and consumed in another's.
Bytes can be freed on either side independently; readings cannot be created or destroyed by either
side alone, only re-homed — and an unrelayed reading is paid for exactly once, as a round trip.*

### Why it does not survive

The law's prohibition is testable and false. Twelve round trips came out of the server half alone,
from a function the same commit shipped and never called, with no corpus file touched and no reading
re-homed. The three gates that account for it — `is_review_mode != true`, `stealth_mode != true`,
`problem_complexity != 'complex'` — are *satisfied by absence*. The server was declining to evaluate
a total predicate it already holds both evaluators for.

The adversarial analysis's residue — *readings whose gate needs a positive value cannot be answered
from the server half alone; readings satisfied by absence can* — is correct but is a classification
of gates, not a conservation. It names what moves. It does not name what is conserved.

### The corrected law

**THE UNOBSERVED-FACT LAW.** *Every delivery decision this system takes rests on a fact no party in
the exchange reports: whether a context still holds what it was sent, whether a step will run, and
how much window a worker has left. For each, the server substitutes a proxy computed from state it
already owns. A change that sharpens a proxy without adding an observation channel conserves the
count of unobserved facts — it moves the error between over-delivery and wrong-delivery, and the
direction is chosen by whichever way the one instrument in the repository can see. Only an added
observation channel reduces the count. This remediation added exactly one, `context_tokens` on
`next_activity`, and no call site supplies it.*

The three proxies, each verified in the tree:

| Unobserved fact | Proxy | Site | Exact when | Error the sharpening introduced |
|---|---|---|---|---|
| Does this context still hold what it was sent? | `hasDispatch(state, scope)` — has this scope ever been dispatched? | `workflow-tools.ts:877`; `dispatch.ts:35-40` | one identity spans the whole run and never compacts | markers for bytes a compacted context no longer holds (B3), and `recordFirstArrival` at `resource-tools.ts:792, 921` seeds the same flag from `get_technique` / `get_resource` |
| Will this step run? | `gateAnswer` over the bag as it stood at activity open | `gate-liveness.ts:138-168`; `workflow-tools.ts:988-1006` | no step of the run writes a gated variable | a `false` the run answers `true` (B2), reproduced: the server records `lazy_gate_false` for `gitnexus_indexed == true` at `post-impl-review` while `01-start-work-package.yaml:165-168` sets it true |
| How much window has this worker left? | `deliveredChars(state, scope)` — what the server sent it | `batch.ts:149-159` | the scope is not the session's own agent | `const exempt = scope === state.agentId \|\| activities.length === 0;` (`batch.ts:154`) — on the solo topology every measurement in all three analyses uses, the bound is not computed at all |

The remediation's own inventory confirms the law's arithmetic. `gate-liveness.ts` reads existing
state. `mayReferBack` reads existing history. `versionDrift` reads existing state.
`check-decision-order` reads files. `gatesReadUnbound` reads a simulated walk. The single new
observation channel is `context_tokens` on `next_activity` (`workflow-tools.ts:529-531`), feeding
`_meta.batch` (`:743-757`) — and `dispatch-activity.md:50` sends `{ session_index, activity_id,
step_manifest }` while `continue-batch.md:46` adds only `agent_id`. Zero call sites. The count of
unobserved facts is unchanged at three.

### Why the correction holds where the original did not

The original law forbade something the code does on one line. The corrected law forbids something no
line in this tree achieves: reducing the number of facts the delivery layer guesses at. Each of the
remediation's flagship changes is a sharper guess, and each bought its byte saving by moving error
into a direction the instrument does not price:

- **CTX-01** replaced "always send the invariant bundle" with "collapse it for an identity the server
  has met". Measured saving on the walk: 65,253 against the prior report's 422,448, and against
  **446,773** on today's corpus — the uncollapsed figure measured directly below. Error introduced:
  a live-but-compacted context receives markers for bytes it no longer holds.
- **TOP-01** replaced "every gated step is lazy" with "answer the gate from the bag at open". Measured
  effect on the walk: **+2 bundled steps of 82 gated, one fewer `get_technique` call**. Error
  introduced: `lazy_gate_false` fires twice in `post-impl-review`, and one of those two is wrong about
  the run.
- **CTX-08** fixed the *reported* spend (`spentChars` opens at `workerBundleChars`,
  `workflow-tools.ts:967`) and left the budget unable to bind — 91,516 against 640,000.

The law also predicts which corrections cannot land, and the prediction is checkable. The adversarial
analysis proposes honouring the corpus's `holds_prior_deliveries` signal instead of guessing from
`hasDispatch` — "roughly ten lines". Measured cost of that correction on the gated walk: the
benchmark passes no `bundle` parameter (`walker.ts:295-304`, `run-token-benchmark.ts:480-483`), so
requiring an explicit signal restores the uncollapsed bundle, **+381,520 characters, +29.3%** against
a 1% gate. The ten-line fix is unmergeable under the programme's own ratchet — not because it is
wrong, but because removing a proxy's error registers on the instrument as pure regression.

---

## Refined meta-law

### What the structural analysis proposed

**THE ROUNDING LAW.** *Delivery cost and decision accuracy are read at two different time
granularities — the activity and the step — and every mechanism must round one to the other. The
saving from any bundling change is bounded above by the number of gated steps whose deciding write
lands in a different activity from their read: a static, countable property no server change can
alter, and one the corpus's own correctness guard drives toward zero.*

Its stated structural invariant: *there is only one granularity both parties share — the activity.*

### What survives each challenge

The adversarial analysis refutes the invariant on evidence. `ProducerSite.ordinal` exists
(`binding-provenance.ts:66`, "Document-order position across the whole workflow"), is assigned on
every delivery (`:125, 155, 160`), and is already used for exactly this kind of question at `:261-262`
(`sites.filter((p) => p.ordinal < ctx.position)`). `variablesWrittenIn` (`gate-liveness.ts:67-76`)
discards it and returns a bare `Set<string>`. The granularity is shared; the delivery layer throws it
away one function before use. That is correct, and it makes B24 fixable.

But the adversarial analysis does not measure what the fix recovers. Vetoing only when a producer
*precedes* the reader — the sound rule, since a producer positioned after the reader has not run when
the reader is reached:

| | meta | work-package |
|---|---|---|
| gated technique steps | 12 | 91 |
| vetoed today | 11 | 57 |
| veto survives a position-aware rule | 10 | **50** |
| veto lifted (every same-activity producer follows the reader) | **1** | **7** |
| of the lifted, answerable from the defaults-only bag | 1 | 7 |

The seven are `post-impl-review::apply-fixes`, `submit-for-review::rerender-body`,
`submit-for-review::verify-body`, `complete::remove-worktree`,
`codebase-comprehension::analyse-challenge-pass`, `::update-artifact`, `::record-log`; the one meta
step is `end-workflow::revise-session-metrics`.

So the structural analysis is wrong about *why* the 57 are unanswerable and right that they are.
The 50 that survive are not a granularity mismatch at all — they are the correct consequence of the
single fact both analyses walk past: **delivery takes one reading of the bag, and it takes it before
any step of the activity has run.**

### The corrected meta-law

**THE OPEN-TIME READING LAW.** *A delivery is one reading of the session bag, taken at activity open.
Everything the activity itself will write is, at that moment, unwritten. So the population a bundling
change can reach is exactly two disjoint sets — gates satisfied by the absence of a value, and gates
whose every same-activity producer is positioned after them — and both are static, countable
properties of the corpus. Measured today: **13 + 7 = 20 of 91 gated work-package technique steps, and
0 + 1 = 1 of 12 in meta. 21 of 103, 20.4%.** Relaying writes into the bag does not enlarge that set,
because a relay changes what the reading contains, not when it is taken.*

The law is precise about the residue. The other 82 gated steps are not withheld by a defect. They are
withheld because the answer does not exist yet at the only moment delivery can ask.

### The three predictions, retested

**Prediction 1 — "relaying `variables_changed` will move `technique_bundled` from 66 toward the low
90s and `get_technique` from 24 toward the mid-teens; no amount of further work on `gate-liveness.ts`
will do this." REFUTED on both halves.** Further work on `gate-liveness.ts` alone reaches
`technique_bundled` 78 and `get_technique` 12 — past the mid-teens the prediction reserved for the
relay. And the relay's own marginal value, measured against a fully relayed create-path bag: 16 gated
steps flip to `true`, 13 of them are the negative-form set the operator-aware predicate already
answers with no relay, 2 turn on `problem_complexity`, which is produced by a checkpoint effect and
therefore already travels through `respond_checkpoint`. **Exactly one gated step in the corpus has a
bundling answer that depends on `variables_changed` alone —
`post-impl-review::gitnexus-detect-changes-preflight` — and there the relay buys a correct answer,
not a new bundle.**

**Prediction 2 — "each further decision-order fix reduces the bundling ceiling by the number of
in-activity readers it moves the checkpoint above." FALSE TODAY, TRUE UNDER THE FIX ITS CRITIC
PROPOSES.** `variablesWrittenIn` is position-blind, so moving `platform-selection` above twelve
readers of `issue_platform` cannot change the veto set: `start-work-package` has 21 of 21 gated
technique steps vetoed and 0 answerable both before and after PR #470. The prediction is
untestable while the veto is position-blind. Make the veto position-aware — the adversarial
analysis's own B24 fix — and the prediction becomes exactly true, because moving a checkpoint above
its readers converts "producer follows reader" into "producer precedes reader". The correctness guard
and the bundling predicate are not in opposition today. They would be after the fix.

**Prediction 3 — "the delivery gate will never fail on any of it." TRUE, BUT NOT FOR THE STATED
REASON.** The instrument is not blind: it resolves the 1.43% movement comfortably, on a walk
deterministic to the character. The gate is *one-sided*. `run-token-benchmark.ts` computes
`const passed = regressionPct <= maxRegressionPct;`, so an improvement of any magnitude passes and no
improvement of any magnitude is an event. What the gate cannot fail on is not the change's size — it
is the change's sign.

---

## Structural vs fixable — definitive

`F` = fixable at the site where it appears. `S` = the Unobserved-Fact Law predicts the defect returns
in another form, because closing it at the site does not add an observation. Severity is final.
"A1" / "A2" name the classification each prior analysis gave.

| # | Site | Defect | Sev | A1 | A2 | Final | Resolution |
|---|---|---|---|---|---|---|---|
| **1** | `gate-liveness.ts:159-163` | `gateAnswer` withholds on any absent compared value, including `!=` forms that absence answers. The module's own `unboundPositiveReads` makes the distinction and has zero `src/` callers. | HIGH | B7 M/F | A1 H/F | **F** | Confirmed by execution: one line, −12 calls, −18,608 chars, 16 module tests pass. Fix: call `unboundPositiveReads` in place of the value-path loop. Carries finding 26. |
| **2** | `workflow-tools.ts:993-999` + `workflow.yaml:540-543` + `01-start-work-package.yaml:165-168` | `gateAnswer` returns `false` for `gitnexus_indexed == true` where the run returns `true`. A wrong answer, not a conservative one. | HIGH | B2 H/F | A3 H/F | **F** | Confirmed at all three sites and in the server's own `lazy_gate_false` count for `post-impl-review`. Fix: treat a name with an `action`-class producer site as unanswerable at delivery — the producer index already records `via: 'action'`. |
| **3** | `workflow-tools.ts:877` + `compose-prompt.md:25, 45` | `mayReferBack = bundle !== 'full' && (referenceMode \|\| hasDispatch(state, scope))` collapses the worker bundle on identity alone in every mode, overriding a corpus signal expressed as an omitted parameter. | HIGH | B3 H/**S** | A4 H/**F** | **S** | Both are half right. The corpus does transmit `holds_prior_deliveries` (`dispatch-activity.md:53`, `continue-batch.md:51`, `resume-worker.md:46, 55`) and honouring it is ~10 lines — but the corpus binds it `true` for *any* continuation of a live worker, so the compaction hazard survives the fix. Swapping proxies is not adding an observation. Measured cost of the swap on the gated walk: **+381,520 chars, +29.3%**. |
| **4** | `workflow-tools.ts:1184` | The wire note enumerates only reasons a step may be *absent*, and forbids a per-step server ping. A present gated entry the worker evaluates false leaves no beat, no fetch and no event. | MED | B4 H/F | A7 M/F | **F** | Severity resolved to MEDIUM on evidence: `gate-liveness.ts:156-158` vetoes any gate reading an in-activity write, so a `true` answer is stable within the activity by construction, and the step's own YAML travels in the payload. The residual cost is the observability loss, not a wrong execution. |
| **5** | `workflow-tools.ts:743-757` + `activity-worker.md:38, 54, 84` + `dispatch-activity.md:97` | `_meta.batch` at the activity boundary is produced and read by nothing; `context_tokens` is passed by no call site; the corpus consumes the stale open-time reading and its prose asserts that reading is correct. | MED | B5 M/S | A9 M/S | **S** | Agreed and confirmed. The server can compute what a context was *delivered*; the fact needed is what it *holds*. Filling the field in adds no observation — it removes the only signal that the field is unread. |
| **6** | `workflow-tools.ts:1347-1360` | `lazy_gate_unanswered` / `lazy_gate_false` / `worker_bundle_chars` reach `logInfo` only — absent from `_meta`, history, benchmark metrics and every test. | MED | B6 M/F | A10 M/F | **F** | Confirmed: obtaining all three required parsing harness stderr again. Fix: promote the three counters onto the delivery metrics the benchmark already records. |
| **7** | `check-decision-order.ts:187-194` | `steps.forEach` over top-level `def?.steps` with `steps.slice(0, index)`. No recursion into `kind: loop` (15 in work-package, 2 in meta); single-activity. Reports OK. | MED | B8 M/F | A11 M/F | **F** | Confirmed verbatim at the cited lines. |
| **8** | `check-decision-order.ts:159-171, 191` | The `defaultValue` exemption re-admits RED-03: default `false`, reader gated on `true`, the earlier read is skipped and the later answer changes nothing. | MED | B9 M/S | A12 M/S | **S** | Agreed. Deciding whether reading the default is *equivalent* to reading the decision is a semantic fact about the workflow that no file reader observes. |
| **9** | `walker.ts:342-357` | `activityDecidedVariables` collects every checkpoint option's `setVariable` without regard to whether that checkpoint is reachable on the path walked, so 20 committed `gatesReadUnbound` entries record variables whose deciding checkpoint never ran. | MED | B10 M/**S** | A8 M/**F** | **F** | Mechanism settled against A1: both variables are checkpoint-set, and `platform-selection` carries an unmet entry condition. A1's proposed fix would remove none of the 20 and add more. Fix: filter on reachability. Residue: the filter makes the instrument path-dependent, which is finding 25's problem. |
| **10** | `resource-tools.ts:277-315` | Version drift is detected, seeded and re-stamped silently: no warning, no `validation` entry, no history event; the response reports only the new version. | MED | B11 M/F | A13 M/F | **F** | Confirmed. A `console.warn` exists for a workflow carrying *no* version; drift itself is silent. |
| **11** | `resource-tools.ts` (`resume_checkpoint`, `dispatch_child`) | Only `start_session` compares versions. A worker resuming after a gate and a child under a drifted parent take no late seed. | MED | B12 M/F | A14 M/F | **F** | Confirmed: `workflowVersion` appears at `:280, 304, 342, 555, 599`; the last two are creation paths. |
| **12** | `resource-tools.ts:281-286` | The late seed filters on `state.variables?.[name] === undefined`, so a variable whose declared default changed keeps the old value — indistinguishably from a preserved decision. | LOW | B13 L/**S** | — | **F** | Reclassified. The distinction *is* observable: `applyVariableWrites` appends a `variable_set` history event with `source` for every decision (`variable-seed.ts`), and `seedDefaults` writes into the bag with no event. A name with no `variable_set` event is a seeded default. The adversarial analysis drops this finding; it is fixable in a few lines. |
| **13** | `run-token-benchmark.ts:384` + `verify.yml:82-83` | The CI gate walks work-package only. `meta` — 5 activities, 23 technique steps, 291 KB — is ungated, and the invocation passes no `--workflow`. | MED | B14 M/F | A15 M/F | **F** | Confirmed: `arg('workflow', 'work-package')`; the CI line is `npm run --silent bench:token -- --label=ci --context-mode=fresh --gate`. |
| **14** | `run-token-benchmark.ts:173, 352` | The 1% threshold admits 13,023 characters of unreported growth per merge on a walk deterministic to the character. | MED | B15 M/F | A16 L/F | **F, MED** | A2's demotion rests on the gate resolving 1.43% — but resolution is not enforcement, and the gate is one-sided (finding 27). The slack is real in the only direction the gate acts. U1's +23,596 of corpus growth rode into main unmeasured, which is the failure this threshold is meant to prevent. |
| **15** | `run-token-benchmark.ts:323-335, 550-553` | The corpus-mismatch check is report-only **and** compares commit ids where the guarantee is a property of trees, so it fires against a merge commit whose tree is identical to the reference. | MED | B16 L/F | A17 M/F | **F, MED** | Promoted, and confirmed harder than either states: `git rev-parse` returns tree `d00cfe27` for both `72db28ae` and `2e8b6297`. Fix: compare `HEAD^{tree}`. See finding 24 — the same comparison is *enforced* elsewhere and fails. |
| **16** | `docs/resource_resolution_model.md:256` | The table row claims a `false`-gated step ships "nothing". The step's YAML body still travels in the activity payload; only the technique protocol is withheld. | LOW | B17 L/F | A18 L/F | **F** | Confirmed at the exact line; the correct rule is at `:263`. |
| **17** | `sync-progress-status.md:32, 54` | `delivered_artifact` has no producer: two references corpus-wide, both inside the declaring file. 28 guards pass. | MED | B18 M/S | A19 M/S | **S** | Agreed and confirmed. No schema construct declares a consumer for a produced value, so no file reader can see the gap. |
| **18** | `workflow.yaml:196-202` + `11-validate.yaml:46, 60` | The declared scalar `validation_passed` has zero reads and zero writes; the gates read `validation_results.validation_passed`, a path under an object with no default and no writer, which `readPath` (`gate-liveness.ts:54-61`) can never answer. Plus `has_open_questions`, `skip_architecture_summary`, `stealth_mode` (22 reads) with no producer site. | MED | B19 M/F | A20 M/F | **F** | Confirmed exactly: the only occurrences of the bare name are the declaration and a README diagram. The gate at `:46` and the loop condition at `:59-62` both read the nested path. This site is also finding 22's. |
| **19** | `binding-fidelity-triage.json` | 70 of 70 verdicts `"harmless"`; 0 fix-later, 0 live-bug. The stamp note reports 183 corpus commits of drift against verdicts recorded at `corpusSha` `3569e937`. | LOW | B20 L/S | A21 L/S | **S** | Agreed and confirmed by parsing the register. A verdict set with one value has stopped distinguishing, and no file reader can tell an accepted defect from an unexamined one. |
| **20** | `config.ts:158-165` | The 40-line comment recording the measurements behind `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35` and `DEFAULT_BATCH_MAX_ACTIVITIES = 3` was replaced by a four-line pointer, and ECO-06's re-measurement was not performed. | LOW | B21 L/F | A22 L/F | **F** | Confirmed by diffing `5e627648:src/config.ts` against the current file; the constants stand unchanged at `:164-165`. |
| **21** | `batch.ts:154` | `const exempt = scope === state.agentId \|\| activities.length === 0;` — on the solo topology every measurement in all three analyses uses, the batch bound is not computed at all. | LOW | B22 L/S | A23 L/S | **S** | Agreed and confirmed verbatim. This is the third proxy in the conservation law, and finding 25 shows it is exempt in precisely the configuration the gate runs. |
| **22** | `01-start-work-package.yaml:294`; `11-validate.yaml:47`; `13-submit-for-review.yaml:41, 360`; `prism/activities/00-select-mode.yaml:11` | Five `actions: []` steps; no guard rejects an empty action list. Each carries a gate and cannot act. | LOW | B23 L/F | A24 L/F | **F** | Confirmed at every cited line. `11-validate.yaml:47` is gated on the permanently unanswerable `validation_results.validation_passed` of finding 18 — an empty step behind an unanswerable gate. |
| **23** | `workflow-tools.ts:988-1006` vs `gate-liveness.ts:67-76` vs `binding-provenance.ts:66` | `variablesWrittenIn` collapses a step-granular producer index to an activity-granular `Set`, discarding the `ordinal` the index already computes. | MED | B24 H/**S** | A5 H/**F** | **F, MED** | A2 wins on class: the ordinal exists and the fix is ~15 lines across two functions. A1 wins on magnitude: the fix lifts **7 of 57** work-package vetoes and **1 of 11** meta ones, all of them answerable on defaults. Demoted from HIGH accordingly. The 50 that remain are not this defect — they are the open-time reading. |
| **24** | `tests/e2e/snapshot.test.ts:37` | The corpus-stamp assertion compares commit ids, not trees, and **fails the whole vitest suite** in this checkout: `expected '72db28ae…' to be '2e8b6297…'`, against trees that are byte-identical. | MED | — | — | **F, new** | `npx vitest run` at HEAD: 1 failed / 1,034 passed / 14 skipped. A1 lists "the vitest suite passes" among its falsifiability tests; it does not. The alarm the repository built to catch corpus drift is firing on a corpus that has not drifted. Fix is the same one line as finding 15. |
| **25** | `walker.ts:295-304, 616-624` + `run-token-benchmark.ts:480-483` + `dispatch-activity.md:53, 93` | The gated walk runs one agent identity across all twelve activities and passes no `bundle`. The corpus's own `delivery-keys-on-agent-context` mandates one identity per dispatch, released when the batch is spent, with a retry taking full delivery again. | HIGH | — | — | **S, new** | Measured by running the same walk under both topologies. See below. The instrument's topology is the one configuration in which all three proxies are exact. |
| **26** | `tests/e2e/batched-dispatch.test.ts:270` | `expect(rawText(second).length).toBeLessThan(firstChars)` encodes "a continuation always delivers less" as an invariant. A continuation that bundles more steps delivers more. | LOW | — | — | **F, new** | Applying finding 1's one-line change turns this green assertion red (`expected 82816 to be less than 78128`) without any defect being introduced. A2's claim that the change "passes the module's existing test suite unchanged" is true of the module and false of the repository. |
| **27** | `run-token-benchmark.ts` gate evaluation | `const passed = regressionPct <= maxRegressionPct;` — the gate is one-sided. An improvement of any magnitude passes silently and requires a voluntary re-record to be noticed. | MED | — | — | **F, new** | The 1.43% improvement of finding 1 registers on the instrument and is a non-event for the gate. What the gate cannot fail on is the change's sign, not its size. |
| — | environment | B25 — `check:all` fails on `source-encoding` from stray probe files | — | B25 L/F | withdrawn | **WITHDRAWN** | 28 guards, 28 pass, 0 fail, 0 unmeasured; none of the six named files exists. A2's withdrawal is correct. |

**Fixable: 21. Structural: 7. Withdrawn: 1.**

The structural analysis reported 16 fixable / 9 structural. The adversarial analysis reported 18 / 5.
The definitive set is 21 / 7, and the seven are findings 3, 5, 8, 17, 19, 21 and 25. Three of the
structural analysis's nine (B10, B13, B24) reclassify to fixable on evidence — B10 and B24 as the
adversarial analysis argued, B13 on evidence neither analysis found. One of the adversarial analysis's
five reclassifications (B3 → fixable) reverts to structural, because the corpus signal it relies on
does not report the fact the proxy is wrong about. And the structural set gains finding 25, which is
the deepest of them.

What unites the seven is not the two-granularity split the Rounding Law names, and not "the verifiers
read files" that the adversarial analysis substitutes for it. Every one is a place where the system
substitutes something it can compute for something no party reports: what a context holds (3, 5, 21,
25), whether an absence is acceptance or omission (8, 19), and whether a produced value has a consumer
(17).

---

## Deepest finding

The two analyses reach opposite verdicts on where this system's capability is missing.

> **ANALYSIS 1:** "this system's two halves — a server that owns state and a corpus that owns protocol
> — each hold exactly half of every capability, and nothing in the build can fail when only one half
> lands."

> **ANALYSIS 2:** "The corpus half is not where the capability is missing. It is where the *blame* is
> cheapest to place, because the corpus is the half no server test can fail on."

Both are supported by correct measurements of the same walk. That is the anomaly worth explaining,
and the explanation is not that one of them made an error. Running the identical walk under the two
agent-identity topologies the system supports:

| | benchmark topology (one identity, whole run) | corpus topology (one identity per dispatch) |
|---|---|---|
| `get_activity` calls | 12 | **22** |
| `get_activity` characters | 520,075 | **1,177,328** |
| worker bundle, full deliveries | 65,253 across 12 | **446,773 across 12** (35,204 ×7, 40,069 ×5) |
| worker bundle, collapsed deliveries | — | 5,584 across 10 gate refetches |
| `hasDispatch` as a liveness oracle | exact — one context, never replaced | wrong at every dispatch |
| `batchState` | exempt (`scope === state.agentId`) | binding |
| the bag during an activity | never changes — the robot executes no technique | changes at every technique step |

Same server, same corpus, same policy, one flag. `dispatch-activity.md:53` mints an identity per
dispatch; `delivery-keys-on-agent-context` (`dispatch-activity.md:93`) states that "a retry that
spawns a NEW worker for the same activity is a new context, taking full delivery again";
`compose-prompt.md:45` tells that worker to omit `bundle` "because a fresh context needs the bytes".
The gated walk does none of this. `walk(harness, workflowId, skipOptionalPolicy, { agentId, mode:
'robot' })` passes no `workerIdentity`, so `getActivity` sends neither `agent_id` nor `bundle`, and
every call falls back to the session's own scope.

**The property neither analysis alone can find: the repository's single instrument is a fixed point
of every proxy the delivery layer uses.** In the benchmark's topology `hasDispatch` is an exact
liveness oracle, the open-time bag is an exact predictor because nothing writes to it, and the batch
bound is exempt by name. In that configuration the server genuinely does hold every fact it needs —
which is precisely what the adversarial analysis measured and concluded. In the topology the corpus
specifies, all three proxies degrade at once, and the corpus half becomes load-bearing — which is
precisely what the structural analysis inferred and could not measure, because the instrument that
would have shown it is the instrument whose topology hides it.

So the disagreement between the two analyses is not an error in either. **It is a measurement of the
gap between the instrument's topology and the corpus's, taken by two readers who each assumed the
instrument's topology was the system's.** The structural analysis accepted the instrument's frame and
attributed the shortfall to the corpus. The adversarial analysis used the instrument to refute the
structural analysis and attributed the capability to the server. Neither could see that the frame is
the finding.

Three consequences, each checkable in this tree:

1. **The flagship saving is topology-conditional.** CTX-01 is credited with 357,195 characters,
   74.7% of the whole fall. Measured on today's corpus the collapse is worth 381,520 characters on the
   benchmark's topology and **zero** on the corpus's, where every dispatch is a new context taking
   full delivery. The programme's largest recorded win is a property of the meter.

2. **Correcting a proxy reads as regression.** Honouring `holds_prior_deliveries` — the fix the
   adversarial analysis prices at ten lines — costs +381,520 characters, +29.3%, against a gate that
   fails at 1%. The ratchet the remediation installed to prevent unexamined growth now also prevents
   the removal of an unexamined guess.

3. **The one remaining observation channel is the one nobody supplies.** `context_tokens` on
   `next_activity` is the only new observation the remediation added, and it is the only parameter
   that would let the server stop guessing at the third fact. It is optional
   (`workflow-tools.ts:529-531`), absent from both call sites, and its absence is indistinguishable
   from a terminal activity's.

The remediation is real: 477,973 characters, −26.85%, reproduced to the character, in one commit.
The number is a true measurement of one topology, and the system runs in another — and the repository
contains no instrument which runs in the second, so nothing in the build can report the difference.
