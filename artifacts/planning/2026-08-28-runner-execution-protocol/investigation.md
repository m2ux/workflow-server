# What the investigation found

Companion to [README.md](README.md), for [#523](https://github.com/m2ux/workflow-server/issues/523).
This is the current-state analysis behind the proposal: what the code and the corpus actually do today,
how that was measured, and which of the proposal's problems remain unsolved by it. The README states the
proposal; this file states the ground it stands on.

Measured on 2026-08-28 against the server at `c99d9da2` and the `workflows` branch at `0cebc48f`.

**Read [protocol-verification.md](protocol-verification.md) alongside this.** Several figures below were
overturned by the protocol review and are marked in place; that file carries the full list of withdrawn
claims.

## How the evidence was gathered, and where it is thin

Twenty-five separate investigations were run across the code and the corpus, and each one was then
handed to an independent reviewer instructed to refute it against the source rather than agree with it.
Every figure below was taken by walking the definitions through the real loader — `loadWorkflow` together
with `buildProducerIndex` — rather than by searching text, so a condition spread over several lines is
attributed to the list item that owns it rather than counted twice or missed.

Three of those investigations were cut short when an account spending limit was reached, and their work
is missing. Two were the reviews of the **gate evaluation** findings and the **cost** findings, so
everything in those two areas rests on a single unreviewed pass. It reproduces against the lines cited,
but two numbers in particular decide how much work the runner hands over at a time, and they should be
measured again before anyone builds against them: what one exchange with an agent costs, and what
establishing a fresh agent context costs.

A fourth investigation designed the interaction protocol directly, three ways, each checked by an
independent reviewer. **It has since completed, and it overturns several things stated below.** Its
findings and the full list of withdrawn claims are in
[protocol-verification.md](protocol-verification.md), and where that file disagrees with this one, it is
right. The corrections are marked in place, but the most important are that the count of 500 condition
sites does not reproduce, that values already reach the session mid-activity by one route, and that the
corpus's real fan-out is a technique bound at 22 sites rather than anything to do with loops.

## What is actually true today

Two things widely believed about this system turn out to be false against the current code.

### The server already decides gates

It is commonly stated, including in the schema's own documentation, that the server never evaluates a
condition and leaves every such decision to the agent. That is not what the code does. When the server
delivers an activity it evaluates every step's gate against the current session values, and uses the
answer to decide which steps to include in full — `src/tools/workflow-tools.ts:1204` calls
`bothGates(outer, gateAnswer({ when, condition, variables: bagAtOpen, writtenInActivity }))` with the live
values taken at `:1197`, and `gateAnswer` at `src/utils/gate-liveness.ts:194-196` runs the same two
evaluators the guards and the test harness use.

So the capability is not missing and does not need building. What differs is only what the answer is
used for: today it shapes delivery, and the proposal is that it should also decide execution. Four
documentation sites assert the opposite and are simply out of date —
`src/schema/activity.schema.ts:75`, `:77`, `:146`, `:254`, and `schemas/README.md:32`, `:324`, `:711`.
They need correcting whether or not any of the rest of this happens.

### Nothing repeats a loop

A workflow can declare that a body of steps repeats over a collection, or until a condition holds. No
code anywhere carries that out. The end-to-end test harness walks a loop body exactly once —
`tests/e2e/walker.ts:496` is `if (step.kind === 'loop') { await walk(step.steps); continue; }`, and the
comment at `:482-484` says a body is walked once deliberately. The fields that describe the repetition
are never read there: the iteration type appears only where it is declared at `:83`, and the collection,
the item variable, the early-exit condition and the iteration limit do not appear at all. On the server
side, two of those fields are read when working out which values an activity consumes
(`src/utils/activity-variables.ts:368-369`) and the item variable is registered as a producer
(`src/utils/binding-provenance.ts:187`), but nothing iterates. Repetition is the one thing the runner
would have to write from scratch.

### Every condition in the corpus can be answered mechanically

There was reason to expect a residue of conditions no program could decide — ones asking about the
outside world rather than about the run. There is none.

**The counts in this section are withdrawn.** An independent parse of 122 activity files gives 231 inline
step conditions, 97 structured step conditions and 54 outcome conditions — **382**, not 500 — plus 11 on
action steps and one early-exit condition. The direction and the magnitude hold: a few hundred sites, all
parseable, none reading the environment. The specific figures below do not reproduce and are kept only to
show what was withdrawn. See [protocol-verification.md](protocol-verification.md).

Walking all 17 workflows through the loader was reported as turning up 500 places a condition is
attached:

| Where the condition sits | Count |
|---|---|
| On a step, as an inline expression | 296 |
| On an activity's named outcome | 70 |
| On a step, as a structured condition block | 134 |
| **Total** | **500** |

Every one of them parses, and every one can be answered:

| Can it be answered from the session values? | Count |
|---|---|
| Yes, directly | 482 |
| Yes, by reading a field of an object an earlier step produced | 18 |
| No — it asks the environment, not the run | **0** |
| No, for some other reason | **0** |

There are no parsing failures and no authoring-rule failures anywhere in the corpus. Across all 500
sites there are 108 distinct names read, six of them reaching into a field of an object.

The questions that genuinely ask the outside world do exist, but they are not conditions on steps. All
five sit in validation instructions, which are already understood as work for an agent: whether the
GitHub command-line tool is authenticated (`workflows/work-package/activities/06-plan-prepare.yaml:70`),
whether the signing agent is reachable (`:78`), whether a working tree is present (`:58`), and whether
commit signing is configured (`work-package/activities/01-start-work-package.yaml:329` and
`remediate-vuln/activities/01-start.yaml:91`). Four further validation instructions are not expressions
at all and do not parse: `13-submit-for-review.yaml` steps/4 carries `summary_budget_overruns == []` and
`summary_completeness_findings == []`, `14-complete.yaml` steps/11 carries `broken_artifact_links == []`,
and `remediate-vuln/activities/01-start.yaml` steps/4 carries `target_path exists`.

The set of environment prefixes at `src/utils/activity-variables.ts:180` exists to serve that validation
surface rather than the condition surface, and it is copied rather than shared —
`scripts/check-binding-fidelity.ts:285` holds an independent duplicate that could drift.

### The real obstacle is when values arrive, not whether conditions can be answered

A step's results reach the session, in the main, only when its whole activity finishes. The parameter
that carries them is declared on the activity-transition call alone (`src/tools/workflow-tools.ts:694`)
and applied at `:796-802`.

**Corrected:** there is a second route. Answering a decision also lands values, mid-activity, without
moving the activity pointer (`src/tools/workflow-tools.ts:2019`). So a partial per-step write path already
exists, restricted to decision effects, and the work is to generalise it rather than to invent it — which
is cheaper than the rest of this section implies. What follows is otherwise accurate: outside that one
route, the session values are frozen at what they were when the activity started.

That would not matter if conditions only asked about earlier activities. They do not:

| The condition reads a value produced by | Sites |
|---|---|
| An earlier activity | 194 |
| An earlier step of the same activity | **274** |
| A later step | 22 |
| The same step | 10 |

More than half of every condition in the corpus asks about something produced inside the activity it sits
in, and the answer is therefore unavailable while that activity runs.

This is already recorded rather than predicted. The committed baseline at
`tests/e2e/__snapshots__/snapshot.test.ts.snap` holds 79 activity deliveries and tallies, across them,
**313 conditions the server could not yet answer and 168 whose values nothing had produced**, with none
failing to parse. Not one of the 79 deliveries could answer every condition it carried. The code already
has a name for this case, at `src/utils/gate-liveness.ts:136-143`.

**Two corrections to how those two numbers should be read.** The end-to-end harness never sends its values
back — its transition call passes only the session index, the activity and the steps it ran
(`tests/e2e/walker.ts:363-370`) — and it satisfies conditions by changing a set of values the server never
sees (`:306-317`). So the tallies conflate the server's freeze with the harness's silence, and the second
number in particular should not be read as a defect in the corpus. Separately, the check that produces the
first number tests whether a name is written anywhere in the activity *before* it looks at the value
(`src/utils/gate-liveness.ts:184-186`), so a value genuinely present via the decision route above is still
counted as unanswerable. Both numbers need re-measuring once the harness writes back.

**Everything else in this record depends on fixing that.** Without step results reaching the session when
the step finishes, a runner can decide only the 194 conditions fed by earlier activities, and the 274 fed
by earlier steps of the same activity remain as unanswerable to it as they are today.

### Where the run has got to cannot be recovered

The session file records what has happened but not where the run is. It carries no step field at all
(`src/schema/session.schema.ts:199-224`). The only field of that kind anywhere is at
`src/schema/state.schema.ts:164`, on a schema whose sole importer is the JSON-schema generator.

Nor can position be worked out from the history, because when the server delivers an activity it marks
every included step as started at the same instant: `src/tools/workflow-tools.ts:1514` takes one
timestamp and the loop at `:1515-1525` applies it to all of them, while the uniqueness key at
`src/utils/step-events.ts:12-17` records nothing about order. So a durable record of position is
something the runner must add, not something it can derive.

## What a runner does not fix

**The cost of establishing agent contexts.** Around 31% of a measured 4.1 million token run went on
establishing fresh contexts, and the server has no influence over it: it never starts a context, the
orchestrator uses the harness's own facility for that, and the protocol only lets a client call the
server rather than the other way round. On the measured run, seven of eight user decisions arrived in the
middle of an activity, with 26, 14, 14, 11, 10, 3 and 1 steps still to go, and the existing guard covers
only the first step of an activity. Reducing that figure is a matter of where decisions sit in the
corpus, and a guard covering mid-activity decisions with many steps behind them would attack it directly
without any of this work.

**Repetition written as prose.** One technique whose name says it runs a loop is invoked as an ordinary
step at four sites — `04-research.yaml:122-132`, `05-implementation-analysis.yaml:70-80`,
`07-assumptions-review.yaml:58-68` and `08-implement.yaml:126-136` — with inputs naming a convergence
flag, a residue flag and a residue collection. A runner that drives declared loops still cannot see the
iteration that matters most here.

**A step already being silently skipped.** One repeat-until loop
(`09-lean-coding-audit.yaml:67-76`, gated on a simplification flag) never runs in any of the six recorded
walks, and the committed snapshot records its steps as absent. That class of failure persists until the
continuation condition has an unambiguous home.

**Unknown session fields disappearing without complaint.** The session schema is an ordinary object
schema (`session.schema.ts:72`), so anything it does not declare is quietly dropped. A server build that
does not know about the position record would therefore erase one and leave a valid signature behind,
which `src/utils/session/resolver.ts:148-156` would later report as a signature mismatch — that is, as
suspected tampering rather than a version difference. Seven existing optional fields are already exposed
to this. A missing position record on a running session has to be a hard refusal with a documented way
back.

**The cost of finding a session.** Every authenticated call walks the planning directory and parses every
session file it finds — 73 files totalling 4,884,336 bytes here, the largest 392,155 — with no index, no
cache, and no early exit once a match is found, because detecting a collision means aggregating all of
them (`src/utils/session/store.ts:436-525`). A runner calling once per step rather than once per activity
multiplies that directly, which is the strongest argument for the runner holding the walk locally and
saving to the server only at boundaries.

**Nothing checks the generated JSON schemas against their source.** The build script has no verifying
variant, and the test file covering them is 60 lines with two assertions. A forgotten regeneration passes
continuous integration while authors see spurious errors on valid definitions.
