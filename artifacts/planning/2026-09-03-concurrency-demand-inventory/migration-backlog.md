# The backlog, in order

Eight ready sites, four blocked ones, and two sites whose concurrency has no contract. This is the
order to work them in, what each costs, and what each depends on.

Estimates are agent hours, on the definitions given in
[#540](https://github.com/m2ux/workflow-server/issues/540).

---

## What everything below depends on

The work item states a dependency on #539's W1 — a written decision naming the fan-out contract.
That dependency does not survive contact with the corpus, and a different one replaces it.

**W1's dependency is discharged for agent fan-out and open for shell fan-out.** The contract W1 was
to name exists: `scatter-gather` with two scatter modes, `harness-compat::spawn-concurrent`
underneath it, `orchestration-patterns::dispatch-workers` selecting between them, and five borrowable
pattern activities packaging the shape. Nothing in the backlog below waits on it. What W1 does still
owe is narrower than its own phrasing: `spawn-concurrent` dispatches agents, and the site that
motivated the item starts four shells in one caller's turn. Only D2 touches that.

**The real gate is where fan-out is allowed to happen.** An activity's steps execute in a spawned
worker, and a worker dispatches none of its own. Until that is settled, a migration from a
sequential loop to a dispatch bind changes the shape of a definition and buys no wall-clock, because
the run-time takes the sequential branch either way. The evidence is in section 2 of the
[README](./README.md#2-where-fan-out-is-available-and-where-the-demand-is).

So the backlog opens with two decisions and no code.

---

## D1 — Decide where fan-out is owned

**Blocking everything else. 4–6 h. No definition changes; the output is a written decision.**

`meta/activities/patterns/README.md` says its activities "cover **in-activity fan-out / consolidate**
only". `orchestrator-conduct`'s `one-level-of-indirection` says "an orchestrator dispatches workers;
a worker dispatches none of its own". Both cannot hold. Six activity definitions across three
workflows — `cicd-pipeline-security-audit`'s primary scan, `substrate-node-security-audit`'s
reconnaissance and primary audit, and the pattern library's orchestrator-workers, isolated-fan-out
and lead-researcher — bind `orchestration-patterns::dispatch-workers` from a step, which is written
against the first and runs under the second.

Three answers are available and the decision has to pick one.

- **Fan-out stays orchestrator-owned.** The pattern library's claim is corrected, every activity-step
  binding of `dispatch_concurrency` above one is retired or documented as the sequential case, and
  in-activity concurrency is closed as a design option. Cheapest, and it makes the whole ready list
  moot except where the units are not agents.
- **An activity may declare a fan-out step the orchestrator executes on its behalf.** The activity
  names the work units and the combine; the orchestrator dispatches. This keeps `one-level-of-indirection`
  intact and makes the ready list real, at the cost of a new construct on the activity schema and a
  new duty in the dispatch loop.
- **Workers may dispatch at depth two.** Simplest to write, and it contradicts a rule stated twice
  and cited five times. Recorded for completeness, not recommended.

The decision belongs in a planning record, in the shape the fan-out item's own epic used: a written
decision before any binding is applied.

## D2 — Name shell concurrency, or state that it stays prose

**2–3 h. Independent of D1.**

The residue of W1. `cargo-operations::run-suite` starts four concurrent shells and waits for all
four; no construct names that, and `spawn-concurrent`'s capability is agents. The four elements the
epic wanted binding guidance for are already written into run-suite's protocol — work-unit shape,
combine hook, wait-for-all, degrade path — so the choice is whether they become a shared contract or
stay one technique's local prose.

The argument for leaving them: one site needs it, `duplicate-shared-capability`'s **Do not flag**
covers adding a shared op only when a shared capability exists to duplicate, and a contract with one
caller is a contract that cannot be validated against diversity. The argument against: it is the
only kind of concurrency the corpus actually performs today.

Either answer closes the criterion. Recording the reason is what makes it closed rather than
forgotten.

---

## Priority 1 — pays regardless of D1

These two do not depend on the fan-out decision, because what they fix is wrong sequentially too.

### P1. Prism's parallelism plan reaches nothing

**3–4 h.**

`plan-analysis` declares `parallelism_plan` — "which units can run concurrently" — and
`analysis-plan.md` reserves a **Concurrent** line for it. `analysis_units`, the machine-readable
output beside it, carries no concurrency field, and no prism activity or workflow file mentions
concurrency at all. The workflow decides which units are independent, writes it into a document for
a human, and walks the units one at a time.

Two outcomes are legitimate. Either the field reaches `analysis_units` as a declared component and
the four pass activities can read it, or the plan stops claiming to produce it. Deciding is cheap;
leaving a declared output that nothing consumes is the thing `technique-outputs-declared` exists to
prevent read from the other direction.

Worth first place because it is the corpus's only *recorded* independence judgement, and it costs
nothing to keep whichever way D1 lands.

### P2. Two targets, three filenames, one folder

**2–3 h.**

`workflow-design/activities/08-quality-review.yaml`'s `multi-target-review-loop` writes
`principle-findings.md`, `anti-pattern-findings.md` and `verified-findings.md` into one
`planning_folder_path` on every iteration. A two-target review keeps only the second target's three
files.

This is a defect today and a concurrency blocker tomorrow, and the fix is the same either way: a
per-target artifact name. Its sibling `workflow-authoring/activities/08-quality-review.yaml` shows
the alternative — accumulate into `register_sections` and write once.

---

## Priority 2 — the ready list, gated on D1

Sequenced by benefit per unit of change. Each entry's shape is the same: replace the loop with
decompose → briefs → dispatch → gather → combine, or borrow
`meta/activities/patterns/01-orchestrator-workers.yaml` outright. Each costs a change to the
activity's step list, its variable contract, and its outcome statement.

| | Site | Units | Why here | Hours |
|---|---|---|---|---|
| P3 | `midnight-system-review` evidence probes (R1) | up to 12 areas | The gather contract is already written into `probe-area`'s output, and `consolidate-evidence` is already the combine. The smallest change for the largest fan | 3–5 |
| P4 | `work-package` post-implementation review (R6) | 3 passes, run twice | Busiest workflow, longest units, and the combine step already exists as `classify-and-route-findings` | 4–6 |
| P5 | `workflow-authoring` target sweep (R2) | up to 20 targets | The definition already states the append contract in its own set-action description | 3–4 |
| P6 | `prism` structural pass (R4) and behavioural synthesis (R5) | up to 100 units | Largest fan in the corpus, and the pair should move together. Depends on P1 having settled where the concurrency plan lives | 5–7 |
| P7 | `work-package` lean-coding audit (R8) | 2 scans | Small fan, trivially independent, and the combine is already placed | 2–3 |
| P8 | `work-packages` package planning (R3) | one per package | Per-package filenames make it safe; package counts are small, so the saving is modest | 2–3 |
| P9 | `codebase-wiki` area ingest (R7) | up to 50 areas | Needs the index-and-log step hoisted into the combine phase, which is a real restructure rather than a mode change | 4–6 |

## Priority 3 — the blocked list

Each needs its decision written before it can be estimated as work rather than as a question. The
fourth blocked site, B3, is not here: its blocker is a filename collision that is already losing
findings sequentially, so it sits at P2 as a correctness fix.

| | Site | Decision required |
|---|---|---|
| P10 | `prism` adversarial and synthesis passes (B1, B2) | Whether a pass is meant to read earlier units' artifacts. Both passes turn on the same answer; take them together |
| P11 | `work-package` task cycle (B4) | Whether per-task worktree isolation is worth its price. Reading plans suggests no — tasks are ordered by construction — but the mechanism exists and the question is real |

## Not scheduled

The seventeen not-a-candidate sites, listed in [site-inventory.md](./site-inventory.md). Twelve are
conversations with the operator, three are the session layer this epic holds out, and two are the
sequential member of a pattern pair. None of them becomes available under any outcome of D1.

`prism`'s behavioural lenses (A2) are omitted from the schedule deliberately: the fix is to bind
`scatter-gather` from `prism/activities/01-structural-pass.yaml` rather than re-describe it in
`independent-lenses.md`, which is P6's change to that same activity. It rides along rather than
standing alone.

---

## The whole thing, totalled

| Band | Items | Hours |
|---|---|---|
| Decisions | D1, D2 | 6–9 |
| Pays regardless | P1, P2 | 5–7 |
| Ready, gated on D1 | P3–P9 | 23–34 |
| Blocked | P10, P11 | not estimable until decided |
| | **Total before the blocked pair** | **34–50 h** |

Roughly four to six effort-days, of which the first day is two decisions and the second buys nothing
in wall-clock — P1 and P2 fix correctness, not speed. That ordering is deliberate: the cheap
correctness fixes are worth doing whatever D1 concludes, and D1 could conclude that the rest is not
worth doing at all.
