# Runner execution protocol — design record

Work package for [#523](https://github.com/m2ux/workflow-server/issues/523). The issue body carries the
proposal in plain language; this folder carries the evidence and the citations. Measured on 2026-08-28
against the server at `c99d9da2` and the `workflows` branch at `0cebc48f`.

Read alongside [#520](https://github.com/m2ux/workflow-server/issues/520), which names a run of steps
and gives it a home. The proposal here walks the step tree that one produces, so the two fit together
without either depending on the other.

## What this is about

A workflow definition describes a structure. An activity holds an ordered list of steps; a step may
carry a condition deciding whether it runs at all; some steps repeat a body over a collection; and an
activity ends by naming one of several outcomes, which the workflow's routing table turns into a
destination. None of that is prose — it is structure, and it has exactly one correct reading.

Today an agent does that reading. The server hands over the activity's definition text along with
instructions on how to interpret it, the agent decides which steps run and in what order, and afterwards
reports back what it did. The server then checks the report for consistency.

This record proposes moving the structural reading to a program, and sets out how that program would
talk to the server on one side and to agents on the other. Some vocabulary recurs throughout, so it is
worth fixing up front:

- **The session bag** is the store of named values a run carries from step to step. Every condition in a
  workflow is a question asked of it.
- **A gate** is a condition attached to a step, deciding whether that step runs.
- **A dispatch** is handing an activity to an agent context. It is expensive, because a fresh context
  must be established before any workflow content reaches it.
- **Eager bundling** is the server including a step's full instructions in the delivery rather than
  making the agent fetch them separately later.
- **The runner** is the proposed program: it walks the steps, decides the gates, drives the repetition,
  and asks an agent to carry out one technique at a time.

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

A fourth investigation, which would have designed the interaction protocol directly, produced nothing
before the same limit stopped it. Sections 4 to 6 are therefore worked out from the completed
investigations rather than independently checked, and say so where it matters.

## 1. What is actually true today

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
outside world rather than about the run. There is none. Walking all 17 workflows through the loader
turns up 500 places a condition is attached:

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

A step's results reach the session only when its whole activity finishes. The parameter that carries
them is declared on the activity-transition call alone (`src/tools/workflow-tools.ts:694`) and applied at
`:796-802`. So for the duration of an activity, the session values are frozen at what they were when it
started.

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

## 2. How the three parties would talk to each other

There are three links, and they want opposite treatments.

The expensive one is talking to an agent. One exchange with an agent costs roughly what 18,800
characters of fresh content cost — the reasoning is in [cost-model.md](cost-model.md). A call from the
runner to the server, by contrast, is one local process addressing another, and costs almost nothing. So
the fine-grained back-and-forth belongs on the cheap link and the coarse-grained work on the expensive
one. That is the difference between this proposal and a design where the agent itself asks the server for
one step at a time, which the measurements rule out.

| Link | How often | Cost |
|---|---|---|
| harness starts the runner | once per session | negligible |
| runner ↔ server | as often as it likes | local |
| runner ↔ agent | once per technique | ~18,800 characters equivalent |

### Only the runner writes to the session

If the runner is the single client touching the session, agents become pure functions: they receive a
prompt and return values, with no access to the server at all. Three problems that would otherwise need
solving simply stop existing.

The first is a lock. The session holds one slot for an outstanding user decision
(`src/schema/session.schema.ts:211`), and while it is filled, five tools refuse to serve anyone —
`get_workflow` at `workflow-tools.ts:588`, `get_activity` at `:1015`, `get_trace` at `:2079`,
`get_technique` at `resource-tools.ts:651` and `get_resource` at `:881`, all through the check at
`src/utils/session/params.ts:62-70`. That lock exists to stop other agent contexts making progress
while a question is outstanding. With one client, there are no other contexts to stop.

The second is a race. Saving the session writes the whole file, last writer winning, and although a
token for detecting a concurrent change is captured every time the file is loaded, nothing reads it
(`src/utils/session/store.ts`). One writer, no race.

The third is trust. An agent that never receives the structure cannot depart from it, cannot address the
wrong step, and has no channel on which to report something it did not do. Fidelity stops being
something the server checks after the fact and becomes a property of the arrangement.

## 3. Getting a prompt that can be given to one or more agents

The runner hands out a set of prompts rather than a step.

```ts
type DispatchSet = {
  units: PromptUnit[]                    // one, or several when provably independent
  affinity: 'reuse' | 'fresh' | 'parallel'
}

type PromptUnit = {
  id: string                             // for the runner to match a reply to a request
  prose: string                          // protocol, rules and resources, fully written out
  inputs: Record<string, unknown>        // resolved values, not references
  expect: {
    outputs: { id: string; type?: string; audience: 'human' | 'agent' }[]
    artifacts: { output: string; path: string }[]   // filename already worked out
  }
}
```

### Whether two prompts can go out at once can be worked out, not declared

Two pieces of work can run at the same time when neither one reads a value the other writes. The code
needed to establish that already exists for other purposes. `deriveActivityContract`
(`src/utils/activity-variables.ts:339-431`) works out what each step reads and writes, using the same
name-matching rule that decides where a technique's inputs come from. `buildProducerIndex`
(`src/utils/binding-provenance.ts:125,155`) works out which step produces each value, and `resolveBagName`
at `:259-262` separates producers that come before a given position from those that come after.

So the runner can calculate the independence relation rather than asking an author to assert it. Today,
work that runs in parallel is written that way by hand and nothing checks the claim.

### How wide to fan out is bounded by what a fresh agent costs

Establishing a new agent context costs between 23,000 and 42,000 tokens before any workflow content
arrives — worth five to nine exchanges with an existing one. So splitting work across several agents pays
only when each branch is substantial enough to earn that back. The server already records the sizes
needed to judge it, at `workflow-tools.ts:1507-1535`, consumed by `src/utils/batch.ts:98-123`.

### A question for the user is not a prompt for an agent

Only the orchestrator can reach a person, so when the runner arrives at a decision point it returns the
question to the harness rather than dispatching it. The tool that renders a decision for presentation
survives, since it already works out what each option leads to
(`workflow-tools.ts:1867-1876`). The two tools that park a decision and pick it up again can go: their
purpose is freezing a session while other contexts wait, and there are no other contexts.
`resume_checkpoint` in particular changes nothing but the sequence number (`:1803`).

One narrow case survives. An agent may raise a decision the definition never anticipated, by supplying
its own question and options — `:1637` and `:1643-1647`. That is the only channel in the whole surface an
agent can open itself, and it cannot be produced from any definition, so it stays as a small dedicated
call.

*Not independently verified: the independence calculation is reasoned from reading those functions rather
than from running them over the corpus. How many steps are genuinely independent in practice is unknown,
and worth measuring before designing for parallelism.*

## 4. Giving the agent prose and never structure

Today the server sends the activity's definition text itself. It reads the file
(`workflow-tools.ts:1046-1048`), inserts the step identifiers an author did not write (`:1049`), and
fills in any shared decision bodies. The agent then reads that text and interprets it.

Under the runner, each part goes one of three ways:

| Sent today | Becomes |
|---|---|
| The activity definition text | Runner-internal; never sent |
| Inserted step identifiers (`activity.schema.ts:220-229`) | Removed — the insertion exists to make the text readable to an agent |
| Filled-in decision bodies (`fragment-resolver.ts:170-221`) | Removed — decisions never reach an agent |
| Inherited rules | Sent, as prose |
| Technique content | Sent, as prose, one at a time |
| Artifact obligations | Becomes `expect.artifacts`, with the filename already worked out |
| Notes telling the agent what it must do (`workflow-tools.ts:1453-1461`) | Removed — the runner now does those things |
| Notes telling the agent where a value came from (`technique.schema.ts:9,72`) | Removed — they exist to describe wiring the runner performs |

### Filling in placeholders becomes the runner's job

A definition can contain a placeholder in braces, to be replaced with a value at run time. Nothing in the
server does that replacement today: the pattern at `src/utils/activity-variables.ts:182` only collects
the names, and the helper at `src/utils/variable-seed.ts:35` exists purely so an unreplaced placeholder
is not rejected for having the wrong type. There are 377 placeholders in the corpus definitions and 3,471
more in technique prose:

| Where it appears | Count | Runner fills it in? |
|---|---|---|
| A message shown to a user | 264 | Yes |
| A value supplied to a technique | 63 | Yes |
| Descriptive prose | 28 | No — delivered as written |
| A step identifier | 11 | Internal only |
| A value set by an action | 6 | Depends on the action decision below |
| A value set by a decision option | 5 | Yes |
| **A condition** | **0** | Nothing to fill in |

That last row matters: no condition anywhere in the corpus contains a placeholder, so deciding conditions
needs no substitution at all.

Of the 149 outputs that declare a file to write, 15 contain a placeholder, and several of those are
notation rather than a value to look up — `{$page_slug}`, `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md`,
`strategic-review-{n}.md`, `NNNN-{decision_title}.md`. Those must be left alone.

Step identifiers never reach an agent under this design, which removes the one objection that made
substitution awkward. They are also used to check what an agent ran and to recognise a decision already
answered, and both of those become internal to the runner.

### The one genuinely hard constraint: not repeating content already sent

The server avoids re-sending content by recognising that it has sent the identical bytes before. That
works only because a technique's delivered payload depends on the definitions alone and never on the
state of the run. `src/utils/binding-provenance.ts:11-15` states the rule directly: classification is
purely static, so identical refetches stay byte-identical. Accordingly `resolveInputSource` returns a
*description* of where a value comes from, never the value — at `:296` it returns a string naming the
source.

A prose-only prompt carries actual values, which do depend on the run. Put them inside the technique
text and every payload becomes unique to one session, the record of what has already been sent never
matches, and the saving disappears — a direct loss on the largest cost in the system. So the prompt needs
two separate parts:

- **The body** — protocol, rules and resources. Depends only on the definitions, so it is still
  recognisable as content already sent.
- **The values** — `inputs` and `expect`. Never recorded as sent. Small: a map of values, not prose.

The practical rule is that `inputs` must sit beside `prose` as its own field, and never be substituted
into it.

### What checking-after-the-fact stops being needed for

Around 179 lines of code exist to check an agent's report against what it was given:
`validateStepManifest` (`src/utils/validation.ts:95-159`, 65 lines), `validateReportedExit` (`:237`, 16),
`immediateExitCut` (`:74-93`, 20), `validateActivityManifest` (`:260`, 24) and
`validateTechniqueFetches` (54). The parameters that carry the report go with them.

So does a large part of what is sent. Roughly 33,000 characters of every delivery are rules and
techniques whose only subject is how to drive a workflow. One of them,
`workflows/meta/techniques/variable-binding.md`, is a six-step description of an execution engine written
as instructions for an agent to follow — resolve the signature, bind each input by a stated order of
precedence, tell a rename from a literal from a placeholder, carry out the operation, put each result
under its declared name, and read values back by path. Five of those six steps become runner code, and
the server already has everything they need: `composeActivityTechnique`, `resolveInputSource`, the
path-walking helper at `src/schema/when-expression.ts:287-294`, and `applyVariableWrites`. Only "carry
out the operation" is the agent's.

## 5. A clean boundary between an activity and the techniques it uses

The boundary is the technique's declared signature, which already exists and is already typed.

**Going in**, values are resolved in the order the binding description already specifies: a literal given
at the step, then a rename given at the step, then a value of the same name in the session, then the
technique's own declared default — and if none of those supply it, the runner refuses to dispatch. That
refusal is the cleanliness. Today an unresolved input is delivered to an agent marked as unresolved, and
the agent improvises.

**Coming back**, the runner can check the shape of a reply and must take the content on trust:

| The runner can check | The runner must trust |
|---|---|
| That the returned names are exactly the declared outputs — none missing, none extra | That a value is correct |
| That renamed outputs land where the step said they would | That an artifact's prose is any good |
| That values match their declared types | That the judgement exercised was sound |
| That a declared file exists where expected | That the protocol was followed at all |
| That its name matches the required pattern | |
| That a machine-read output parses as JSON | |

None of that shape is checked today. A step's report is a single free-text string checked only for being
non-empty, and values arrive in an unconstrained map at activity granularity, so nothing connects "this
step declares an output called X" to "the session gained X".

Two details in the current code force decisions here. A value whose type disagrees with its declaration
is recorded as a warning and then stored anyway (`src/utils/variable-seed.ts:72-78`). And equality is
exact while ordering comparisons convert to numbers first (`src/schema/when-expression.ts:304-308`) —
tested directly, `review_findings_count == 0` against the value `'0'` as text is false, while
`remediation_round > 0` against `'2'` as text is true. The corpus contains 81 equality and 56 inequality
comparisons in structured conditions alone. A runner that acts on those answers must reject a type
mismatch rather than warn, or a number arriving as text will silently flip every equality comparison that
mentions it.

The existing write path survives, but as the only one rather than one of two.

### Three points at which this becomes checkable

| When | What is established | New? |
|---|---|---|
| When definitions load | That every value a step reads is produced by something before it, checked step by step rather than activity by activity | Yes — possible only once step order is authoritative rather than reported |
| When a prompt is built | That the prompt is determined entirely by the definitions plus the resolved values, so it can be fingerprinted and a divergence noticed | Yes |
| When a reply arrives | That the shape matches the declaration, and that the server can independently reach the same transition | Yes |

The first is worth spelling out. There is already a check that no step reads a value nothing has produced
— `unreachableReads` at `src/utils/activity-variables.ts:539-636`. It works by asking, for each activity,
which values are guaranteed to exist however the run arrived there, which means taking only what every
incoming route supplies. It works at the level of whole activities, skips any activity the run cannot
reach (`:565-574`), and ignores names outside the declared set entirely (`:345`, `:355`). Once the runner
makes step order authoritative, the same reasoning can run step by step, which is a real increase in what
can be established before anything runs.

### The limit on how clean this can get

A request to an agent is all-or-nothing. Of the 2,459 protocol instructions across 480 technique files,
436 begin with a conditional or a repetition — 167 with "if", 154 with "for", 115 with "when". Control
flow lives inside technique bodies as well as above them. The runner can establish that a technique ran
and returned what it declared; it cannot establish which branch was taken inside, and cannot pick one up
half-finished.

A sharper problem for the boundary: 137 places across 75 technique files invoke another technique from
inside their prose, and the loader does not resolve any of them. `src/loaders/core-ops.ts:24-26` already
works around this by hand. Under one request per technique, those become invocations the runner cannot
see, whose results arrive inside the caller's reply with no indication of where they came from, and which
keep the producer analysis crediting the wrong step. The most-invoked target appears 21 times and is the
same mechanical file-writing routine each time, which is the argument for turning those into real steps —
exactly what [#520](https://github.com/m2ux/workflow-server/issues/520) provides.

### Writing files

The technique that writes an artifact declares the numeric prefix ordering its output as
"server-provided", and the server does compute it, from the activity's filename
(`src/loaders/filename-utils.ts:6-10`, assigned at `src/loaders/workflow-loader.ts:84`). What the
technique's prose then describes is a mechanical routine: look for an existing file of that name, create
it if absent, prefer the lowest-numbered one on a conflict, and re-check just before creating in case
another writer got there first.

So the agent could return content alone, and the runner could work out the name, apply the prefix,
resolve the find-or-create, write the file and return the path as the output value. That removes 21
duplicated invocations, one technique file, and the entire class of defect where an agent writes an
artifact under the wrong name. The cost is that full artifact text then travels back through a reply, and
that should be priced on the existing token benchmark before it is committed to.

## 6. What is added and what is removed

**Removed**

| Retired | Where |
|---|---|
| ~179 lines that check an agent's report | `src/utils/validation.ts` |
| The report parameters on the activity-transition call | `next_activity` |
| The two tools that park and resume a user decision | `workflow-tools.ts` |
| The insertion of step identifiers and decision bodies into delivered text | `activity.schema.ts:220`, `fragment-resolver.ts:170-221` |
| The notes describing where each value came from | `technique.schema.ts:9,72` |
| An early-exit field on loops — declared, and **used at none of the corpus's 46 loops** | `activity.schema.ts:146`, read at `activity-variables.ts:369` |
| The rule against opening an activity with a user decision, and the guard enforcing it | `scripts/check-checkpoint-entry.ts` |
| ~33,000 characters per delivery of instructions on how to drive a workflow | `workflows/meta/techniques/workflow-engine/`, `variable-binding.md` |
| Five separate implementations of "which names does this condition read", behind one | `when-expression.ts:261`, `gate-liveness.ts:10,30,92,113`, `activity-variables.ts:205,210`, `check-decision-order.ts:60,77` |

That guard's own opening paragraph explains why it can go. It exists because an activity beginning with a
question forces a whole agent context to be established purely to ask it, which it calls the most
expensive way to ask a question. A runner settles the question before any agent context exists, so the
reason disappears and the 113 decisions positioned to avoid it may move back to the activities that own
them.

**Added**

- The runner itself, sharing the evaluators and loaders with the server so the two cannot diverge.
- Step results reaching the session when the step finishes: a third write source on
  `applyVariableWrites` (`src/utils/variable-seed.ts:62`), and a history entry per step.
- A durable record of position, with an entry per enclosing repetition. Much of this is already drafted:
  the shape for tracking a repetition exists at `src/schema/state.schema.ts:106-114`, is already exported
  to JSON schema, and is imported by nothing but the generator; the history entry already carries unused
  slots for a step and a loop; and the event list already reserves six names for starting, iterating,
  completing and breaking a loop and for reaching and taking a decision, none of which any code writes.
- Something to carry out the repetition — the one responsibility with no existing implementation.
- A small dedicated call for an agent to raise an unanticipated decision.

On balance this removes more than it adds, provided the step results and the position record land
together.

## 7. Suggested order of work

Each layer is worth doing on its own and assumes nothing that comes after it.

**First, correct the record and widen the nets.** Fix the four documentation sites that claim the server
never decides a condition. Widen the guard that checks condition expressions: it walks only the steps
list (`scripts/check-when-expression.ts:44-51`), reads activity directories without descending
(`:63`, so the five files under `workflows/meta/activities/patterns/` are never opened), and never checks
that validation instructions parse — three of the four places conditions live. It passes today because
the corpus happens to be clean, not because it is covering the ground. Then move the parse check into the
loader so an unparseable condition fails at load: the corpus stands at zero failures across 500 sites,
and `snapshot.test.ts:187-203` already asserts that, so it is free to adopt now and dearer every month it
waits. Delete the unused early-exit field.

**Second, let the server answer rather than mark.** When an agent reports that a conditional decision did
not apply, the server checks only that the decision *has* a condition, never that the condition is
actually false — `workflow-tools.ts:1969-1976`, even though the evaluator is imported nearby and the
values are in hand at `:1981`. So any agent can dismiss any conditional decision, across 98 of them. One
call fixes it. Then have the server work out an activity's outcome from the declared conditions and
compare it with the reported one.

*One correction, found by a reviewer:* the existing outcome check runs at `workflow-tools.ts:738-740`
against a view of the session built at `:725`, while the finishing activity's results are not applied
until `:797`. The very values that decide which outcome holds are not there yet. The comparison has to
move after the write.

Together these establish that a server verdict can overrule an agent's claim, which is the actual
conceptual step.

**Third, step results reaching the session when the step finishes.** The decision everything else waits
on.

**Fourth, the durable position record and the loop driver.**

**Fifth, the runner and the prompt-set protocol.**

## 8. What has to be decided

Ordered by what blocks what. The first three constrain the schema or the session file.

1. **Do a step's declared results enter the session when the step finishes?** 274 of 500 conditions
   depend on the answer, and nothing else can be settled first.
2. **Do step identifiers become unique across a whole activity, or does the position record carry a
   path?** Identifiers are unique only within their own scope: `populateStepIds`
   (`activity.schema.ts:180-206`) starts a fresh set for each loop body and says so at `:201`. One tool
   already resolves a collision to the wrong step without complaint, taking the first match in document
   order (`resource-tools.ts:694-695`). Making them unique is the better answer and is exactly the
   prefixing discipline #520 adopts, simply never applied to loop bodies.
3. **Where does a repeat-until loop keep its continuation condition?** All 19 such loops carry a
   structured condition that the schema describes as deciding whether the step is entered, and both
   mechanical readers treat it that way. The unused early-exit field is of exactly the right shape, so
   this is a rename rather than an addition. The corpus holds 27 loops over a collection (all naming one,
   one of them a field of an object: `implementation_plan.tasks`), 10 repeat-while and 9 repeat-until.
4. **Does equality convert to numbers the way ordering already does, or does the write path enforce the
   declared type and stop warning?** Choosing neither leaves a number arriving as text able to flip 81
   equality comparisons.
5. **Are action steps rewritten as technique outputs?** Of 84 value-setting actions, 28 carry a literal,
   6 carry a placeholder needing substitution, and 50 deliberately carry nothing because an agent
   supplies the value. `activity.schema.ts:27` already records that the construct is due for removal.
   Rewriting them is the only route by which the whole step kind can be deleted.
6. **Does the server write artifacts?** Removes one technique and 21 call sites; sends full artifact text
   back through replies. Price it first.
7. **What happens to the 137 techniques invoked from inside other techniques' prose?** Accept them as
   invocations the runner cannot see, or turn them into steps.

## 9. What this does not fix

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

## Companion records

- [cost-model.md](cost-model.md) — what the measurements say about how much work to hand over at a time.
- [attestation.md](attestation.md) — why the runner carries no signature.
