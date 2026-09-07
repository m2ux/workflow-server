# The four copies, compared

Companion to [README.md](README.md), for [#531 W3](https://github.com/m2ux/workflow-server/issues/531)
and the originating [#520](https://github.com/m2ux/workflow-server/issues/520).

This is the site-by-site comparison of the run a routine would carry, the corpus-wide search that
found it and everything like it, and the list of differences a migration has to decide about rather
than silently normalise. **Read this before converging the sites**: ten of the differences below are
mechanical, and two are somebody's decision about what a question should ask.

Taken on 2026-09-03 against the `workflows` branch at `131e2942`, by parsing all 122 activity files
and comparing step sequences on kind and binding, with identifiers and site gates ignored.

**Re-checked against `b5e54574` on 2026-09-07.** The run and its four hosts are unchanged; two of
the ten differences have converged in the corpus and two others turn out to be content rather than
mechanism, both marked in place below. The corpus is larger than the figures here — 996 steps and 54
loops against 964 and 46 — so the window search wants re-running before the census is read as
complete. [gap-review.md](gap-review.md) carries the pass.

## How the search was run

Every activity's top-level step list was reduced to a sequence of signatures. A technique step
signs as its operation reference plus any input bindings; a checkpoint step signs as its fragment
reference, or as its inline option ids; a loop step signs as its iteration type, its collection and
its body's own signatures; an action step signs as its verbs and targets. Identifiers, `when` gates,
`condition` blocks, `maxIterations` and prose all sign as nothing.

Every consecutive window of two to eight steps was indexed, and any window appearing in two or more
activity files was kept. Windows contained in a longer shared window over the same file set were
dropped, leaving the maximal ones.

The search sees only top-level sequences, so a run shared *inside* two loop bodies is invisible to
it. That is a known gap and it is small: the corpus nests three deep at most, and the widest sharing
found is at the top level.

## What the search found

Fourteen maximal shared windows. Grouped by what they are:

| Shared run | Steps | Activities | Where |
|---|---|---|---|
| **Assumption reconciliation** | 5 | 2 | work-package: implementation-analysis, implement |
| — its four-step head | 4 | 3 | + assumptions-review |
| — its two-step core | 2 | 4 | + research |
| **Fan-out** — compose briefs, dispatch, gather, synthesise | 4 | 2 | meta: orchestrator-workers, lead-researcher |
| — its dispatch-and-gather pair | 2 | 3 | + isolated-fan-out |
| **Roster fan-out** — compose roster briefs, dispatch | 2 | 2 | substrate-node-security-audit: reconnaissance, primary-audit |
| **Commit and publish** — commit, verify, push, open PR | 4 | 2 | workflow-design: validate-and-commit, post-update-review |
| **Audit and persist** — audit expressiveness, write artifact | 2 | 2 | workflow-design: quality-review, post-update-review |
| **Audit and persist** — audit conformance, write artifact | 2 | 2 | workflow-design: quality-review, post-update-review |

**The two audit-and-persist windows are provisional.** Both audits declare the artifact their caller
writes, persist it in their own protocol, and report its path as an output — finding B6 in
[findings-register.md](findings-register.md), five for five across the family. If the write step is
the redundant half, these two windows are a defect rather than a shared run, and the count of
maximal windows drops to twelve. Settle B6 before treating either as a conversion candidate.

The assumption run is the widest and the longest, which is why it is the migration case. The others
establish that a routine has a constituency beyond it, in three further workflows, and that the
constituency is not confined to gates: the fan-out, commit-and-publish and audit-and-persist runs
contain no user decision at all.

Two further windows are noise the method admits and a reader should discount: a pair of consecutive
`message` actions shared by three activities, and a pair whose only content is the shared
`analyse-challenge::run-loop` binding. Neither is a run worth naming.

## The assumption run, site by site

The run in full is: announce the outcome, gate the batch, record the batch answer, then loop the
residual items — present, gate, record. Four activities carry it. Nothing about the four is held
identical except the two gate bodies the fragment mechanism owns.

### research — `work-package/activities/04-research.yaml`

| | |
|---|---|
| Record pass | **Before** the convergence loop (`update-assumptions-log`, line 123) |
| Announcement | `present-resolved-assumptions`, ungated, message A |
| Contiguity | **Four unrelated steps** intervene between the announcement and the gate: a phase-close action, a context-scope derivation, its announcement, and the context-scope gate |
| Batch gate | `research-assumption-interview`, `ref: assumption-interview`, no site gate |
| Batch record | `record-batch-response`, gated `has_open_assumptions == true && needs_individual_interview != true` |
| Loop | `assumption-interview`, `maxIterations: 20`, gated `needs_individual_interview == true && has_open_assumptions == true` |
| Per-item gate | `research-assumption-decision#{current_assumption.id}`, `ref: assumption-decision` |
| Per-item record | `record-response` |

### implementation-analysis — `work-package/activities/05-implementation-analysis.yaml`

| | |
|---|---|
| Record pass | **Before** the convergence loop (line 72) |
| Announcement | `present-resolved-assumptions`, ungated, message A |
| Contiguity | Contiguous |
| Batch gate | `analysis-assumption-interview`, `ref: assumption-interview`, no site gate |
| Batch record | `record-batch-response`, gated `is_review_mode != true && has_open_assumptions == true && needs_individual_interview != true` |
| Loop | `assumption-interview`, `maxIterations: 20`, gated `is_review_mode != true && needs_individual_interview == true && has_open_assumptions == true` |
| Per-item gate | `analysis-assumption-decision#{current_assumption.id}`, `ref: assumption-decision` |
| Per-item record | `record-response` |

### assumptions-review — `work-package/activities/07-assumptions-review.yaml`

| | |
|---|---|
| Record pass | **After** the loop (line 132) |
| Announcement | `present-residual-assumptions`, **gated** `is_review_mode != true && has_open_assumptions == true`, **no message action** |
| Contiguity | Contiguous |
| Batch gate | `residual-assumption-batch`, `ref: assumption-interview`, no site gate |
| Batch record | `record-batch-decision`, gated `is_review_mode != true && has_open_assumptions == true && needs_individual_interview != true` |
| Loop | `assumption-interview-loop`, **no `maxIterations`**, gated `is_review_mode != true && needs_individual_interview == true && has_open_assumptions == true` |
| Per-item gate | `assumption-decision#{current_assumption.id}`, **inline at the time of this census**, its own `is_review_mode != true` condition, **three options**. Since converged: it references the shared body, which now offers the three |
| Per-item record | `record-decision` |

### implement — `work-package/activities/08-implement.yaml`

| | |
|---|---|
| Record pass | **After** the loop (line 177) |
| Announcement | `present-resolved-assumptions`, ungated, **message B** |
| Contiguity | Contiguous |
| Batch gate | `implementation-assumption-interview`, `ref: assumption-interview`, no site gate |
| Batch record | `record-batch-response`, gated `has_open_assumptions == true && needs_individual_interview != true` |
| Loop | `assumption-interview`, `maxIterations: 20`, gated `needs_individual_interview == true && has_open_assumptions == true` |
| Per-item gate | `implementation-assumption-decision#{current_assumption.id}`, `ref: assumption-decision` |
| Per-item record | `record-response` |

## The differences, and who decides each

Ten differences. Six are mechanical and converge by construction under a routine; two were converged
in the corpus without one; two look like questions about what the run should do and are settled by
tracing the flag they gate on.

**Rows 5 and 6 were first classed mechanical and are not — and the corpus decides them both.** One
gate written once is the mechanism; which conjunct that gate carries is content, and either answer
changes behaviour at a live site. Traced through the dataflow rather than settled by preference:

`needs_individual_interview` has **exactly one writer** in the whole workflow — the
`interview-individually` option of the shared `assumption-interview` body — that body's own
condition already carries `is_review_mode != true`, and all four hosts declare the flag
`defaultValue: false`. So in review mode the gate never fires and the flag stays false.

- **Row 6, the loop gate: the conjunct is redundant.** It tests
  `needs_individual_interview == true`, whose only writer cannot fire in review mode and whose seed
  is false. The loop is already skipped there. It goes, at the two sites carrying it.
- **Row 5, the batch-record gate: the conjunct is required.** It tests
  `needs_individual_interview != true`, which is *true* in review mode for the same reason.
  Combined with `has_open_assumptions == true`, the record step runs in review mode at the two
  sites that omit the conjunct — recording a batch answer nobody was asked for. It stays, and the
  two sites that omit it gain it.

That last is a live defect at `research` and `implement`, independent of routines, recorded as
finding B7 of [findings-register.md](findings-register.md).

**Rows 8 and 9 are settled, in the corpus, the other way.** The shared `assumption-decision` body
carries three options including a correction, and the site that carried three by hand now references
that body like the other three. Row 9 was one of the two rows reserved for a person; the person
answered it against the decision this folder recorded, which is restated in
[decisions.md](decisions.md).

| # | Difference | Sites | Decided by |
|---|---|---|---|
| 1 | Record pass sits before the run at two sites and after the loop at two | 04, 05 vs 07, 08 | **A person** — see below |
| 2 | Announcement message: text A at two sites, text B at one, absent at one | 04, 05 / 08 / 07 | Mechanical — a routine input |
| 3 | Announcement gated at one site, ungated at three | 07 | Mechanical — the routine's own gate |
| 4 | Announcement separated from the gate by four unrelated steps | 04 | Mechanical — the intervening steps stay outside the routine |
| 5 | Batch-record gate carries `is_review_mode != true` at two sites, omits it at two | 05, 07 vs 04, 08 | **Settled by the dataflow** — the conjunct is required; omitting it records an unasked answer |
| 6 | Loop gate carries the same conjunct at the same two sites | 05, 07 vs 04, 08 | **Settled by the dataflow** — the conjunct is redundant and goes |
| 7 | `maxIterations: 20` at three sites, absent at one | 07 | Mechanical — one bound |
| 8 | Per-item gate inline at one site, by reference at three | 07 | **Converged in the corpus** — 07 now references the shared body |
| 9 | Per-item gate offers three options at one site and two at three | 07 vs rest | **Converged in the corpus** — the shared body offers three |
| 10 | Step ids differ by hand-written prefix, and the loop's record step is named twice over | all | Mechanical — the reference site supplies the prefix. The prefixes buy legibility rather than disambiguation: identifiers are scoped per activity, so four gates in four activities cannot collide |

### The ones that needed a person, and what was decided

Four questions, settled on 2026-09-04. Two were on this list; two more surfaced when the conversion
was run. One of the four — what the per-item gate asks — the corpus has since answered the other
way, and it is restated below as the corpus took it. Rows 5 and 6 join the list unanswered.

**Where the record pass belongs — after the interview, and only there.** Two sites record the
assumptions log before the convergence loop and two after the residual interview. They are not one
step at two moments: recording before captures the log as the analysis left it, and recording after
captures the user's decisions. The run's pass records the decisions it just collected, which is the
only thing it is positioned to do, so it sits after the loop. A site's own pre-analysis log step
stays where it is, outside the run, seeding rather than closing.

**What the per-item gate asks — three answers, decided in the corpus.** Three sites offered *resolve
now* and *defer to stakeholder review*, writing `assumption_outcome` as `confirmed` or `deferred`.
One offered *accept*, *reject* and *defer*, writing `confirmed`, **`corrected`** or `deferred`. This
census recommended two answers everywhere, on the measurement that `corrected` is read by no gate,
condition or protocol, and that the design resource documenting the three-term vocabulary should be
corrected to match.

The corpus took the third answer instead. The shared `assumption-decision` body offers *accept*,
*correct* and *defer*; `review-assumptions/record.md` documents the three-term vocabulary as the
outcome set; and all four sites reference that one body. So the outcome value nothing routes on is a
record the assumptions log carries, and the routine materialises the gate the corpus already shares.

**How often the run happens — once per run, at two sites.** Research leads only to
implementation-analysis, which leads only to plan-prepare, which leads only to assumptions-review,
and the two paths that skip research still land there. So research and implementation-analysis are
followed by a definitive reconciliation on every path. Both drop their copies; the run is referenced
from assumptions-review and implement.

**Whether the announcement is guarded — on review mode alone.** Three sites announce
unconditionally; one guards on review mode *and* residual assumptions. The second conjunct reads a
value its own activity produces, so the guard cannot be answered when the activity is handed over
and the announcement's content falls out of the delivered bundle. Guarding on review mode alone
keeps the review protection and the bundling, and the gate that follows carries both conditions
regardless, so a run with no residual assumptions still presents nothing and asks nothing.

## What the migration owes

The acceptance criterion in #531 W3 is that the drifted sites "converge onto one definition, and the
differences that were unintentional are recorded as resolved rather than silently normalised". This
table is the input to that: each row above is either converged with no decision, or carries a
recorded decision naming what the run now does and which site changed.

Three of the rows change behaviour at a live site — row 1 at two sites, and rows 5 and 6 at two
each — so the migration is not behaviour-preserving and should not be described as if it were. Rows
5 and 6 differ from row 1 in that the corpus settles which way they go; row 1 remains a decision.
Row 9 changed behaviour and has already been taken, in the corpus, ahead of the migration.
