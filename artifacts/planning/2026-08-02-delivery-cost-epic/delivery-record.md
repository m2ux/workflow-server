# Delivery cost epic — what was delivered, and what waits on a sample

Recorded 6 August 2026. Companion to [implementation-plan.md](./implementation-plan.md), which holds
the sequencing decision and the baselines; this file records the result and the method for the two
reads that cannot be taken yet.

## Five pull requests

| PR | Base | Work items | State |
|---|---|---|---|
| [#439](https://github.com/m2ux/workflow-server/pull/439) | `workflows` | W4 (definitions), W5 | open |
| [#440](https://github.com/m2ux/workflow-server/pull/440) | `main` | W1, W2, W6, W4 (budget) | open |
| [#441](https://github.com/m2ux/workflow-server/pull/441) | #440 | W7, W9, W8 (server) | open |
| [#442](https://github.com/m2ux/workflow-server/pull/442) | #441 | W10 | open |
| [#443](https://github.com/m2ux/workflow-server/pull/443) | #439 | W3, W8 (corpus), the W2 extension | open |

Merge order is the table order. #440 carries the corpus pointer for #439, so #439 lands first; #443
describes behaviour #440 and #441 add, so it lands after them.

## Measured before and after

Every figure below is from the branch that produced it, on the same corpus.

| Figure | Before | After | Where |
|---|---:|---:|---|
| Bootstrap fixed content | 137,758 | 100,273 | #439 + #440, budget 110,000 |
| Resolve passes per delivery | one a step | one a request | #440 |
| Full delivery, three activities of the main workflow | 225,617 | 213,476 | #441 |
| Reference walk collapse over thirteen gates | 69.9% | 83.7% | #442 |
| Characters re-requested on that walk | 271,411 | 140,014 | #442 |
| Container-rule reach | — | 8.3% of 72 entries | #440, warn-only |
| Inherited-I/O reach | — | 1.4% of 215 items | #440, warn-only |

### A withdrawn comparison, and the like-for-like one that replaces it

A first pass compared the meta setup ceremony's per-activity deliveries on the top of the stack against
the figures measured before any change, and read three activities as growing 2.8 to 3.4 per cent.
**Those figures are an artefact and should not be quoted.** The two measurements ran against different
corpora — the before figures on the corpus main pinned, the after figures on a corpus 3,685 characters
larger in the orchestrator bundle alone. The corpus difference, not the code, is most of what they
showed. It is the same fault the startup-cost record withdrew a delivery-growth figure for, and it is
worth not repeating twice.

Measured like for like, corpus held at `e47942b6`, code before and after the delivery changes:

| Activity | Before | After | Δ |
|---|---:|---:|---:|
| discover-session | 63,111 | 55,781 | −7,330 |
| initialize-session | 40,188 | 40,302 | +114 |
| resolve-target | 38,159 | 38,273 | +114 |
| dispatch-client-workflow | 32,810 | 32,924 | +114 |
| end-workflow | 53,887 | 52,149 | −1,738 |

The 114 characters are the `batch:` block, which is content these deliveries did not previously carry.
Where an activity bundles two or more techniques the collapse of their repeated blocks more than covers
it; where it bundles one or none there is nothing to collapse and the block is the whole difference.
That trade is deliberate: a limit no worker can read is a limit that cannot bind, and 114 characters is
what the reading costs. The block carries the five numbers and no instruction — what to do with
`may_continue` is owned by the worker role technique every activity bundle already delivers, so the
block carries no instruction of its own.

The epic body quotes 65.4% for the walk's collapse figure. That reading predates the batched-dispatch
merge, which added the `activity-worker` role technique to every activity delivery; the same test at
this work's branch point reports 69.9%, and 83.5% is read against that.

## W8's second half — the read to take on the next real run

The field arrives now, in the response text as well as in `_meta`. Whether a run then *forms* is a
property of a live session, and no test can stand in for it.

**Trigger.** The first completed work-package session on a server build carrying #441.

**Method.** From that session's `session.json`:

- Group `activity_dispatched` events by `data.agentId`. A scope holding two or more distinct
  activities is a run that formed. The 5 August baseline is four setup activities under four
  identities and twelve client activities under thirteen — no scope with two.
- Count `batch_refused` events. On the same run there were none, and that was the finding rather than
  a pass: nothing was refused because no continuation was attempted. A refusal now means a worker read
  the standing and asked anyway, which is the bound working.
- Where no run forms, the question to answer is whether the orchestrator composed a continuation at
  all — `continue-batch` leaves no server-side trace of its own, so the evidence is a second
  `activity_dispatched` under one identity or nothing.

**Where it does not belong.** Re-running the walk test. It already passes and measures how much a
resumed context receives, not how many activities one context takes.

## W11 — gated, and the gate is not met

W11 asks whether re-delivered characters have fallen on production runs since the delivery-identity
fix (#408, merged 5 August 2026 as #410 and #411). Its own trigger is around ten completed
gate-crossing sessions.

**Sessions available on 6 August 2026:** two planning folders postdate the fix —
`2026-08-05-review-midnight-node-pr-1938` and `2026-08-06-workflow-retrospective-review` — and the
first of those straddles the build, since the container serving the run's first seven hours started
before the merge and cannot be identified. So the usable sample is at most one session, against an
original measurement that drew on twelve session records across nine profiled runs.

**The read is not attempted.** One or two sessions would not distinguish a fix from a quiet run, which
is the reason the trigger exists.

**Baselines to read against when it is met**, unchanged from the capture: re-delivery events expected
at zero, with the two identities on any occurrence distinguishing a replaced worker from the fault
returning; identity changes at gates against twelve of thirty-eight crossings taken over by a
different identity, nine re-receiving a full payload; and 677,132 characters re-delivered on identity
changes plus 1,109,551 on same-identity resumes that re-delivered a byte-identical payload.

**One thing #442 changes about it.** The capture says the total will not reach zero until W10 lands.
W10 is #442, so once that merges the residual is no longer explained by the activity body — the walk
records 83.5% collapse with the body included in the collapsible set.

## #269's four stages, dispositioned

The epic's fourth acceptance criterion asks for each stage of the subsumed provenance-caching item to
be delivered or explicitly declined. All four are delivered, and one carries a scope note.

| Stage | Disposition |
|---|---|
| 1 — cache technique output ids once per request | Delivered in #440. `buildProducerIndex` holds the scan for a request; `provenanceContextFor` reads each step's position out of it. |
| 2 — build provenance once per `get_activity` | Delivered in #440, by the same split. The eager-bundling loop builds one index before it starts and decorates every step from it. |
| 3 — agent and protocol guidance | Delivered in #443. Its four points map to: reference bundles after the first full delivery (`agent-id-on-delivery-calls`, already in place); `full` only after summarization (`force-full-after-summarization`, already in place); use the bundled resources map and stop probing spellings (`resource-loading-via-tool`, extended); and what a lazy fetch costs (`fetch-costs-what-it-delivers`, new). |
| 4 — observability | Delivered in #440, on four calls rather than the one the stage names: `get_activity`, `get_technique`, `get_resource`, and `get_workflow`. |

**Scope note on stages 1 and 2.** The cache is per request, not per process. A cross-request cache
would need invalidation against corpus edits, and the stage asks for "once per request" — a corpus
edit between two calls is visible to the second with no invalidation logic at all. Nothing is declined.

## The intra-response duplication that stays, and why

The eighth criterion asks whether a full delivery can drop content it has already sent once, and takes
either the duplication going or the reason it has to stay. Both apply, to different halves:

- **Within one response** — gone. #441 collapses the second and later copies of a shared block, because
  the bytes are above the marker in the same payload.
- **Across calls, on a full delivery** — stays. A full delivery is what a context that holds nothing
  receives, and a marker pointing at an earlier call is unreadable to it. The exception is a repeat
  fetch to a named context, where the ledger is evidence the bytes arrived, which is what #441's
  second half does.

## W5's audit, and what it found

The ceremony's commit cadence is changed in #439. The delivered-weight half of W5 was measured rather
than assumed, and the measurement is why the change is a cadence change alone.

Per-activity delivery for the meta setup ceremony, measured through the server over the same corpus
the 5 August run used — and reproducing that run's sealed figures exactly, which is what makes the
method trustworthy:

| Activity | Delivered | Its own bundled steps | Definition body | The rest |
|---|---:|---:|---:|---:|
| discover-session | 62,291 | 29,858 | 4,789 | 27,644 |
| initialize-session | 39,368 | 9,725 | 1,993 | 27,650 |
| resolve-target | 37,339 | 6,237 | 3,460 | 27,642 |
| dispatch-client-workflow | 31,990 | 0 | 4,388 | 27,602 |
| end-workflow | 53,067 | 23,296 | 2,132 | 27,639 |

Three findings:

- **No setup activity declares an activity-level technique**, so none delivers a technique its steps
  never exercise. `check:activity-tech` covers the class and passes.
- **No setup activity eager-bundles a resource at all**, so there is no resource delivered whole where
  a section would do. Every `planning-readme` reference in the corpus already carries a `#section`
  anchor; the whole-file fetches in the 5 August run were the agent's choice, which is what W3's
  guidance addresses.
- **The weight is the fixed activity bundle**, 27,600 characters on every activity of every workflow —
  the inherited `techniques.activity` set plus the core worker techniques plus the rules blocks. That
  is not a ceremony-specific concern and trimming it is a corpus-wide decision, so it is named here
  rather than done under W5. #441 takes about 4,000 characters off it by dropping the repeats inside
  one response.

So W5 delivers the single commit, and records that the per-activity trim it was scoped to find has
nothing in the setup activities' own declarations to take.

**Against the criterion as written.** It asks that each setup activity deliver less content than its
July baseline. The 27 July profile records a `get_activity` figure per setup activity, so the comparison
is possible — and after the checkpoint-reach change (#444) it comes out as:

| Setup activity | 27 July | Now | Holds a gate? |
|---|---:|---:|---|
| initialize-session | 42,547 | **36,242** | no |
| dispatch-client-workflow | 23,388 | 28,864 | no |
| resolve-target | 27,383 | 38,273 | yes |
| discover-session | 2,288 | 55,781 | yes |

One of four is under its baseline. The other three are not, for the same reason in each case: eager
bundling reached these activities after July, so the July figure counts the activity text plus whatever
was inlined *then*, while today's counts step techniques that were being fetched lazily.
`discover-session` is the extreme — 2,288 characters in July because almost nothing was inlined, against
29,858 characters of four step techniques today, which the record's own lazy-fetch column shows it was
paying for separately.

So the clause is met for one activity, and for the rest it compares an eager-only figure against an
all-in one. Meeting it as written would mean un-bundling those steps, which reverses a measured
improvement. The lever that would meet it honestly is the 27,600-character fixed activity bundle every
activity of every workflow receives, which is a corpus-wide decision rather than a ceremony one.

## What measurement showed was reachable after the gap analysis

The gap analysis reported W5's delivery clause and W8's real-session clause as unmet. Part of each turned
out to be reachable, and #444 carries both.

**The checkpoint protocols now reach only the activities that can reach a checkpoint.** A yield requires
a `kind: checkpoint` step and a resume follows a yield, so an activity holding no checkpoint step reaches
neither — its own role technique guards both behind branches it cannot take. Derived from the definition
by the same scan the enforcement notes run. **4,060 characters off every checkpoint-free activity**: the
two protocols compose to 13,052 between them, but their shared blocks collapse against their siblings
either way, so what comes off is their own cores. Four activities across the two live workflows qualify —
the meta workflow's `initialize-session` and `dispatch-client-workflow`, the main workflow's `validate`
and `complete`.

**A run forms at the window a real dispatch declares.** The batched-dispatch suite proved a run of three
in one context and a batch surviving a real gate, both at a 2,000,000-token window chosen so only the
activity cap could bind. That left the production question unanswered. It is now asserted: at 200,000
tokens the run of three spends 151,931 of its 280,000-character budget, leaving 128,069 — more than the
74,109 median all-in cost of one activity read off 112 worker contexts. So the server admits the run with
headroom for a median activity's lazy fetches.

That changes what W8 is waiting for. Its criterion offers a real session showing a context walking more
than one activity, *or* the reason a run cannot form. Neither branch is satisfiable from here, and the
precise statement is: a run **can** form, so the second branch has no true statement behind it on the
server side, and what remains unobserved is the orchestrator composing a continuation on a live run.
Everything the server contributes is proven.

## What a gap analysis of this work found, and what changed because of it

Run against the epic's twelve acceptance criteria and the canon's binding units, after all five pull
requests were open. Seven findings, all fixed on their branches.

| Finding | Where | Fix |
|---|---|---|
| `get_workflow` emitted no cost line, though the criterion says every delivery call does — and it is the largest fixed payload of a session | #440 | Reports on the same channel as the other three |
| The resolution model asserted twice that a fresh or default session always receives full bodies, and once that the activity body is always delivered | #441, #442 | Three grounds for a marker, tabulated; the definition's parts described |
| The ledger's documented namespace list omitted the definition channel | #442 | `activity:*` listed |
| The batch block restated what the worker role technique already owns, on a third surface, for 148 characters a delivery | #441 | Numbers only |
| A rule cited protocol phases by ordinal, twice, which addresses whichever phase later holds that index | #439, #443 | The acts named instead |
| The dispatch announcement was both a protocol phase and a rule — a standing duty encoded as a work outcome | #443 | One home, under Rules, instructing the reader |
| The rule describing the ledger implied a repeat fetch needs the reference opt-in | #443 | Says which call each ground governs |
| Two of the new rules stated the reader's own duty in the third person | #439, #443 | Imperative |

The catalogue entries these key on, by name: `stale-restatement-after-change`, `no-duplicated-guidance`,
`phase-cited-by-ordinal`, `rule-as-protocol-step`, `instruction-narrates-an-actor`. Two entries were
checked and found not to fire: `overlapping-rule-scopes`, because each new rule names the entry it
excepts and that naming is the ordering, and `runtime-rules-only`, because every new rule governs
session conduct rather than how to author a definition.

## A second pass, over what the first one did not reach

The first pass ran before #444 existed, walked the rule-hygiene and coupling units, and swept the docs.
It did not re-read the code it had just changed, and it did not walk the canon-hygiene or
technique-protocol units. Four more findings, all fixed.

| Finding | Keys on | Fixed in |
|---|---|---|
| Seven activities across five workflows carry a `decisions:` block between `steps` and `transitions`. Holding the unkeyed text as one leading blob moved it ahead of the step list, so the definition a worker read was not in the authored order — valid YAML, and silent | correctness | #442 |
| The repeat-fetch collapse treated any named identity as evidence of one context. `dispatch_child` defaults `agent_id` to `"worker"`, which is the session's own identity, so two siblings can each pass it | correctness | #441 |
| `discover` emitted no cost line, and it is a content-delivering call — the first of a session, and fixed | AC2 | #440 |
| The fetch rule restated when a marker comes back, which the ledger-scoping rule owns, and what an in-response marker stands for, which the response's own notes own — against the stance its own sibling states | `prompt-restates-owned-mechanics` | #443 |

**The round-trip finding is the one worth learning from.** Nothing caught it: 1,014 tests passed, 24
guards passed, and the reorder produced valid YAML that no assertion compared against the file. The fix
carries the check that would have found it — a test that round-trips all 112 activities of the corpus —
so the class is closed rather than the instance.

Units walked on this pass and found not to fire, recorded as evidenced negatives: `cited-home-owns-claim`
(every new citation's target owns its claim), `operative-criteria-need-a-home` (the announcement content
is orchestration of one act, which the entry carves out), `bind-site-is-orchestration-truth` (the setup
boundary is described by where it ends rather than enumerated, so it survives a new activity),
`tool-contract-restated-in-protocol` (nothing new describes an argument's shape).
`no-shadow-audit-pass` and `canon-layer-cites-not-restates` are `not-applicable`: no audit technique or
upper canon layer is on the change surface.

The I/O-contract closure the first pass asserted is now verified: the corpus diff against `origin/workflows`
adds and removes no `## Inputs`, `## Outputs` or declared-id heading, so no referencer joins the change
surface and the consumer set stays empty.

## A third pass, over the delivery accounting and the metric itself

Three more findings. Two are defects in this epic's own instruments — the figure W2 reports and the
figure W6 reports — which is the class the first two passes had no reason to look at, having taken both
as the measuring apparatus rather than as code under review.

| Finding | Keys on | Fixed in |
|---|---|---|
| The eager budget was charged the uncollapsed composed size while the response carried the collapsed one, so it spent budget on characters no response sends and would displace later steps into lazy fetches to pay for them. `spent_chars` on the cost line reported the same inflated figure | correctness | #444 |
| The fan-out metric composed only step-bound operations, missing the activity-level bundle — where `workflow-engine`'s and `agent-conduct`'s container rules reach every worker of every workflow | W6 coverage | #444 |
| A rule on a container carried a measured range from one historical run: not actionable by its reader, dated, and delivered to every worker — the fan-out the same metric counts | Output Economy | #443 |

### What the budget was charging

Measured over five activities of the two live workflows, charged against what the bundle delivered:

| Activity | Charged | Delivered | Over |
|---|---:|---:|---:|
| discover-session | 27,710 | 19,906 | **39.2%** |
| start-work-package | 53,199 | 39,767 | 33.8% |
| plan-prepare | 42,499 | 35,404 | 20.0% |
| implementation-analysis | 34,186 | 28,736 | 19.0% |
| end-workflow | 21,414 | 19,178 | 11.7% |

No step is displaced today, because the budget is 640,000 characters at a 200,000-token window and the
heaviest of these spends 53,199. It binds on a narrow window, which is a case the suite and
`bench:batch --context-tokens` both reach. The over-charge predates this epic for reference deliveries,
where blocks already collapsed; W7 widened it to every delivery, which is why the fix rides with this
work rather than being left as found.

Block hashes now stage onto a copy, so a budget break discards them with the entry they belong to. A
hash recorded for content never sent would collapse a later fetch to a marker the worker cannot read —
the failure the whole ledger scheme exists to avoid, reachable through the fix if it were written
carelessly.

### What the fan-out metric was missing

The first implementation composed each walked activity's step-bound operations. It never composed the
activity-level bundle, so the container rules with the widest reach in the corpus — `workflow-engine`'s
and `agent-conduct`'s, delivered with every activity of every workflow — were absent from a metric whose
whole subject is reach.

Over the default three-activity run: **16,504 characters across 72 rule entries → 41,596 across 135**,
and the reach ratio 8.3% → 6.7%. Scaled to a full fifteen-activity walk the entry count reaches the
order the SOLID review measured over one walk, 618, and the ratio sits near its 8.9%. The step-bound-only
version could not offer that corroboration, and its agreement with the review's figure was coincidence.

### How the third pass found them

By treating W2's and W6's own output as claims to check rather than as instruments to read. The budget
finding came from asking what `spent_chars` is measured against; the metric finding came from noticing
that editing a `workflow-engine` container rule moved no reported figure, which it should have.
