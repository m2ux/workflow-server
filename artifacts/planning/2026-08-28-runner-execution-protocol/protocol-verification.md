# How the three parties would talk, and what checking it found

Companion to [README.md](README.md), for [#523](https://github.com/m2ux/workflow-server/issues/523).
Three independent designs of the interaction protocol, each then checked against the code by a reviewer
told to refute rather than agree. Completed 2026-08-28 against the server at `c99d9da2` and the
`workflows` branch at `0cebc48f`.

This is the pass that [README.md](README.md) originally lacked, and it corrects several figures and two
claims stated there and in the issue. **Where this file and the README disagree, this file is right** —
the README's sections on prose-only delivery and the technique boundary were reasoned rather than
measured, and said so.

## What survived

The central arrangement holds, and holds for reasons found in the code rather than argued from cost.

**The runner walks; the server checks what it is told.** Two of the three reasons stand up. The session
file has no field for a step (`src/schema/session.schema.ts:72-168`), so a position record kept by the
server would be entirely new state while a position kept by the runner is just where it has got to in a
tree it is already walking. And the server already owns every piece needed to *check* a transition —
reproducing a condition (`src/utils/gate-liveness.ts:167-210`), working out which values a step may write
(`src/utils/binding-provenance.ts:111-192`), and landing them (`src/utils/variable-seed.ts:62-87`) —
while owning nothing that drives one.

The third reason was wrong, though the conclusion is not. It was argued that the server cannot walk
because conditions ask about the environment. They do not: searching the corpus for an environment name
in a step condition or an outcome condition returns nothing. All five such expressions are validation
instructions (`workflows/work-package/activities/06-plan-prepare.yaml:58`, `:64`, `:67`, `:70`, `:78`).
The real reason the server cannot walk is that it cannot *carry out* a validation instruction — and that
reason does not favour the runner either, since the runner cannot carry one out without either shelling
out to the host or delegating to an agent. **That is an unresolved question the design did not raise.**

**Splitting the fine and coarse links.** The runner-to-server link becomes chatty, the runner-to-agent
link stays coarse and carries prose. This is the right spine and none of the three reviews disputed it.

**Stripping the provenance notes makes delivery cheaper, not just tidier.** The decoration that tells an
agent where each value came from is a pure add-on (`src/utils/binding-provenance.ts:366-418`) over a
composition step that reads no session and no step (`src/loaders/technique-loader.ts:631-646`). Remove it
and a technique body becomes a pure function of the definitions. That matters because the record of
already-sent content currently keys on the technique id (`src/tools/workflow-tools.ts:1246`) while hashing
the *decorated* text (`:1247`) — and the decoration differs by document position, so the same technique
bound at two positions hashes differently, misses the record at `:1250`, and is delivered twice.
Content-addressing the stripped body fixes an existing waste.

## The corrected call shapes

Three calls between runner and server, and one between runner and agent.

```ts
// Enter an activity. Returns the resolved tree as data, with gate expressions
// rather than gate verdicts — see "the tri-state problem" below.
open_activity({ session_index, activity_id, exit? }): {
  activity: { id, name, description, artifact_prefix?: string };
  tree: Unit[];                        // loops nested, not flattened
  exits: Array<{ id, when?, is_default?, destination }>;
  variables: Record<string, unknown>;
  seq: number;
}

type Unit =
  | { kind: 'work';   unit_id: string; body_ref: BodyRef; binding: Binding;
      when?: string; condition?: Condition }
  | { kind: 'decide'; unit_id: string; message: string; options: Option[] }
  | { kind: 'act';    unit_id: string; actions: Action[] }
  | { kind: 'loop';   unit_id: string; loopType: 'forEach'|'while'|'doWhile';
      over?: string; variable?: string; max: number | null; body: Unit[] };

// The ledgered technique body: composition without the provenance decoration.
// activity_id is required, not optional — composition resolves the activity's
// own technique shorthand first, so the hash must key on all four inputs.
get_unit({ session_index, technique_id, activity_id }): UnitBody

// Report what happened. The server reproduces the condition, works out which
// names this step may write, applies what it reproduces, and returns the delta.
close_unit({ session_index, seq, unit, produced?, artifacts?, decided?, usage? }): {
  seq: number;
  accepted: string[];
  rejected: Array<{ name: string; reason: 'not-in-write-set' | 'type-mismatch' }>;
  gate: { reproduced: boolean; verdict: 'true' | 'false' | 'unbound' | 'unparsed' };
  variables_delta: Record<string, unknown>;
  decision?: DecisionRequest;
}
```

Two corrections to note.

**Address a step by its identifier, not by a path through the tree.** The schema permits two steps in
different loop bodies to share an identifier, because the identifier check starts fresh for each body
(`src/schema/activity.schema.ts:182`). It was assumed the corpus exploits that. It does not: scanning
every activity reachable from every workflow graph — 131 activities, 108 distinct identifiers — finds
**zero** duplicates. So it is a permission nobody uses, and one shared check for the whole activity
removes it in two lines with no definition file touched. That keeps the existing step lookup correct
rather than merely lucky (`src/tools/resource-tools.ts:694-695`), keeps the decision-replay key valid,
and avoids adding a second way of naming things. It also fixes a claim in the other direction: the
producer index keys on activity-plus-step (`src/utils/binding-provenance.ts:195`, last writer winning on
a duplicate at `:157`), so path addressing would have forced a change inside it.

**A reply from an agent needs more than one shape.** The original design had an agent return values and
artifacts and make no server calls at all. Two things in the corpus have nowhere to go under that:

```ts
type CloseUnit =
  | { kind: 'done';     outputs: Record<string, unknown>; artifacts?: string[] }
  | { kind: 'decide';   message: string; options: { id, label, description? }[] }
  | { kind: 'dispatch'; briefs: { id, description, prompt }[]; concurrency?: number }
```

The `decide` arm is for a decision the definition could not have anticipated, which the session schema
already models (`src/schema/session.schema.ts:55-63`) and which exists precisely for work admitted
part-way through a run. The `dispatch` arm is explained next, and it is the largest single finding.

## The corpus already has fan-out, and the runner does not author it

This overturns what [README.md](README.md) section 3 says.

The README treats parallel work as something the runner decides by comparing which values each step
reads and writes. That was already known to be shaky, and it is worse than shaky: measured, there are 231
adjacent step pairs that look independent by that test across 155 groups, and inspection shows them
dominated by serial command-line pipelines whose real dependency is shared state on disk that no
definition declares. A reads-and-writes test would call those parallel-safe and they would corrupt each
other.

But the deeper point is that **fan-out is already a first-class construct, and it is not a loop.**
`workflows/meta/techniques/orchestration-patterns/dispatch-workers.md` takes
`worker_briefs: Array<{id, description, prompt}>` together with `dispatch_concurrency` and returns results
in input order. It is bound as an ordinary technique step at **22 sites across 8 activity files** —
four of them in `workflows/cicd-pipeline-security-audit/activities/03-primary-scan.yaml` alone, at `:26`,
`:50`, `:56` and `:62`.

And every one of those sites is preceded by a step that *composes the prompts at run time*, out of domain
material no runner could derive. So the claim that the runner composes the dispatchable prompt is false
exactly where dispatchable prompts matter most. Either the runner accepts prompts it did not author — the
`dispatch` arm above — or roughly 25 brief-composing techniques across 4 workflows are rewritten.

**This is the answer to requirement 1, and it is not the answer the README gives.** A worker-composed
brief is a first-class prompt with a different author, and the protocol has two prompt sources.

The loop-based fan-out that remains is smaller and needs its own denominators, because there are three
defensible ones: 46 occurrences of a loop declaration in the definition text (27 over a collection, 10
repeat-while, 9 repeat-until); 58 loops reachable through workflow graphs (33 / 11 / 14, one nested); and
41 distinct activity-and-loop pairs (24 / 8 / 9). The README quotes the first. Ratios should be quoted on
distinct definitions and execution cost on reachable sites. Of the 24 distinct collection loops, 10 carry
a decision point in the body, leaving 14 candidates before any further filter, and 5 of those declare no
iteration limit — an uncapped fan-out is an uncapped bill when a fresh agent context is the expensive
unit.

Also: writing a result per iteration under a name like `<name>[instance]` is not expressible. All three
value-path walkers split on dots only and none handles brackets
(`src/schema/when-expression.ts:287-294`, `src/schema/condition.schema.ts:41-49`,
`src/utils/gate-liveness.ts:54-61`). A gather must land one array under one declared name in one call.

## The tri-state problem, and why the README overstates the freeze

Two corrections here, and they pull in opposite directions.

**The bag is not frozen for an activity's duration.** The README says results reach the session only when
an activity finishes. There are in fact two places values land: the activity transition
(`src/tools/workflow-tools.ts:797`) and **answering a decision** (`:2019`), which lands values
mid-activity without moving the activity pointer. So a partial per-step write path already exists,
restricted to decision effects. The work is to generalise it, not to invent it — which is cheaper than
the README implies.

**And the "conditions the server could not answer" tally is already stale.** The check that reports a
condition as not-yet-answerable tests whether the name is written somewhere in this activity *before* it
ever looks at the value (`src/utils/gate-liveness.ts:184-186`). Combined with the decision write path
above, that means a value which is genuinely present is still reported as unanswerable today. The tally
is not purely a description of the freeze.

**Worse for the figures: the recorded baseline does not measure what the README claims.** The end-to-end
harness never sends its values back — its transition call passes only the session index, the activity and
the list of steps it ran (`tests/e2e/walker.ts:363-370`) — and it satisfies conditions by mutating a bag
the server never sees (`:306-317`). So the recorded counts do not separate the server's freeze from the
harness's silence, and the unbound half in particular should not be read as a defect in the corpus until
the harness writes back.

**The verdict is three-valued and the two evaluators disagree.** The delivery-time check answers "no
answer" whenever a compared value is absent (`src/utils/gate-liveness.ts:190-192`), and the comment at
`:188-189` says that is deliberate: both plain evaluators return false for an absent value and for a
genuinely false one, so an absent one "has no answer rather than a negative one". Meanwhile the
end-to-end harness — the runner in prototype — calls the plain evaluators directly
(`tests/e2e/walker.ts:382`, `:493`, `:693`) and gets false. On the same values, the runner skips the step
and the server declines to answer. The protocol must choose:

- Use the plain evaluators and make the three-valued check delivery-only. Simplest, and loses the signal
  that distinguishes "the answer is no" from "nothing produced this".
- Use the three-valued check and treat "no answer" as a refusal naming the missing value. This is the
  verifiable option and turns silent skips into diagnosable events.
- Both, with the three-valued check as the authority.

One reviewer's recommendation, and it is persuasive: have `open_activity` ship the condition expressions
rather than verdicts, and let the runner evaluate against the values it maintains. A runner standing at a
step never has the problem the three-valued check exists to describe. That retires more than the design
claimed — the whole not-yet-answerable and unbound taxonomy, the counters behind them, and the
delivery-time gate metadata.

## Corrections to the gate census

**The 500 figure in the README and the issue does not reproduce.** An independent parse of 122 activity
files gives 231 step conditions as inline expressions, 97 structured step conditions (67 of them on
decision points) and 54 outcome conditions — **382** — plus 11 conditions on action steps and one
early-exit condition. Direction and magnitude hold: the surface is a few hundred sites, all parseable,
with no environment reads. The specific number does not, and it is quoted in the issue body.

By extension the "274 of 500" ordering split is derived from the same census and should be re-measured
before it is quoted again.

## What the protocol cannot deliver as designed

Eight gaps, each with a decision attached.

**No tool returns a resolved tree.** Delivery hands back the definition text
(`src/tools/workflow-tools.ts:1046-1049`, `:1587-1588`) and the loader reads the server's own configured
directory, so "the runner uses the server's loader" is not available to a client. Either a new call
returns the tree after identifiers are filled in and shared bodies materialised, or the runner
re-implements the loader and drifts from it.

**179 action steps have no composable body.** Counted over the loaded corpus: 179 action steps — 55
logging, 47 validation, 81 value-setting, 41 message — 8 of them with no actions at all, plus 58
technique steps that also carry actions. There is no technique to compose, so the prompt builder has
nothing to build. And validation instructions like checking whether a command-line tool is authenticated
need host privileges the runner may not want.

**131 places invoke a technique from inside another technique's prose**, across 68 files, and they die
when the worker loses the ability to fetch a technique. The loader's own comment documents exactly this
failure — a worker "reaches the dispatch step with nothing to apply and improvises the invocation" — and
works around it today by hand-listing nine references (`src/loaders/core-ops.ts:43-62`). The prompt must
therefore carry a resolved closure of inline references, with a depth and cycle policy, which changes the
prompt-size arithmetic.

**The set of names a step may write is wider than the set a guard permits.** The producer index collects
a wide set, and `src/utils/activity-variables.ts:135-144` says plainly that this is deliberate and mostly
activity-local. But `scripts/check-session-contract.ts:99-115` raises a finding for any value written
outside an activity's declared writes. Committing per step trips it on every intermediate — and the
intermediates are exactly the same-activity readings the whole design exists to unblock. Either the
declarations widen across 108 files, or a scratch namespace appears, or the guard changes its basis for
mid-activity writes.

**Artifact bodies travel through the boundary twice.** The content of an artifact is a declared *input*
of the artifact-writing technique, bound from a prior step's output at all 45 sites. So a whole document
comes back from one agent as an output and goes out to another as an input, which breaks the rule that
the value channel stays small. Either those 45 steps retire in favour of producing techniques writing
directly to a declared destination — which also retires 20 output remaps that later steps read — or
artifact bodies round-trip and the small-value-channel claim is false.

**85% of technique input bindings are bare strings**, and they are undecidable: 349 of 412, of which 193
name a value in the session and 156 are literals. Near a coin flip, and both forms appear in a single
binding block (`workflows/plain-language/activities/03-draft.yaml:28-30`). The convention fix — bare
always literal, a reference always in braces — is right, and it is a 193-site migration rather than a
convention note.

**Two token grammars disagree.** The one the resolution precedence uses has no dots
(`src/utils/binding-provenance.ts:275-276`); a sibling module's does
(`src/utils/activity-variables.ts:182`). Measured: 17 bindings carry dotted tokens, 16 of them exact —
`{current_unit.target}` five times, `{current_task.id}`, `{worker_result.steps_completed}` and others —
all inside the very loop bodies proposed for fan-out, and today they report as resolved while naming no
producer. Unify on the dotted grammar before any resolver ships.

**Three arms of the resolution report success with no obtainable value** — a producer positioned after
this step, a declared-but-later producer, and ambient names like `target_symbol` and `model_id`
(`src/utils/binding-provenance.ts:266-271`, `:33`). The runner must reclassify these as refusals, not
merely return values where prose was returned.

## Prose-only: the part that does not work

The README's account of delivering prose rests on an interpolation step, and three of its assumptions
fail.

**923 of 2,603 tokens in technique protocol and rules name a declared output of the same technique** —
a forward reference to a value the worker is about to produce. They have no value at dispatch time and
must stay literal, which means the design's own acceptance test, that no emitted prompt contains an
unexpanded token, fails on 923 sites by construction. A third rendering is needed: a named slot bound to
the prompt's output contract. Whether the bullet reads as substituted text or keeps the brace with the
contract explaining it is a legibility decision across 923 sites and 466 files.

**The placeholder set cannot be used to decide what to expand.** It contains `id`, `name`, `path`,
`type`, `key`, `value` and others (`src/utils/activity-variables.ts:171-174`), and the corpus has 177
occurrences of those as live reads — `name` is a declared input of
`workflows/meta/techniques/gitnexus-operations/context.md`, read three times in its own protocol. Under
the design the load-time check passes it because it is declared and the splicer skips it because it looks
like a placeholder, so the worker receives an unexpanded token *and* loses the note that would have told
it where the value came from. Strictly worse than today.

**Resource bodies are not where the design assumed.** Fetching a technique delivers no resource bodies at
all; eager resource resolution lives only inside the delivery path the design retires
(`src/tools/workflow-tools.ts:1330-1400`). So the body call is composition-minus-decoration *plus* a
resource-resolution path lifted out of the retired one — real work the original design did not count.

**Artifact names can be templated beyond what any code can resolve.** The permitted pattern
(`src/schema/technique.schema.ts:54`) is wider than any interpolator in the server, and three of the 14
templated names are outside the resolver grammar entirely: `{$page_slug}.md`,
`subsystem-{code_subsystem.subsystem_name}.md`, and `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md`.
Narrow the pattern, widen the resolver, or declare an escape.

## Two things nobody had priced

**The orchestration workflow *is* the runner, written as definitions.** `workflows/meta/` has five
activities whose graph is the orchestration procedure — discover a session, initialise it, resolve the
target, dispatch the client workflow, end the workflow, with the last routing back to the fourth as the
driving loop (`workflows/meta/workflow.yaml:29-40`) — and it declares that its own activities are
dispatched to workers (`:24-26`). The runner subsumes all of it. None of the three designs mentions the
workflow, the bootstrap call (`src/tools/workflow-tools.ts:554-570`), the bootstrap resource, or the
guard that keeps it self-contained. **This is the largest unpriced item in the whole proposal.**

**Nobody is assigned the commits or the progress table.** Committing, persisting, syncing progress status
and committing submodules are all in the orchestrator's core technique set
(`src/loaders/core-ops.ts:19-66`) and all do real repository work, and the flag recording that progress
was published is described in the code as the only lasting evidence either way. The design retires the
driver and reassigns none of it.

## Per-step cost is worse than stated

Counted over reachable activities: 758 technique, 179 action and 148 decision units across 131
activities — **1,085 units, 8.3 per activity** — before loop iteration multiplies anything, and one loop
body carries 7 steps over a task list.

Each report pays: a full recursive read and parse of every session file with no short-circuit, because
the resolver keeps walking in order to detect a name collision (`src/utils/session/store.ts:436-525`); a
deep clone via a JSON round-trip (`src/utils/session/resolver.ts:176`); a canonicalise, sign and two
atomic writes against a repository-tracked file (`store.ts:328-338`); and one history entry per name
carrying the **full value** (`src/utils/variable-seed.ts:78-84`).

And the store is last-writer-wins. Delivery already reloads before saving, with a comment saying that
saving the earlier snapshot "would silently revert any concurrent write"
(`src/tools/workflow-tools.ts:1493-1500`), but the activity transition does not (`:857`). At 1,085 calls
rather than 79, that window becomes normal traffic. The runner must serialise its reports and the new
call must adopt the reload.

Separately, only one decision can be outstanding per session — one slot
(`src/schema/session.schema.ts:105`), five tools frozen while it is filled
(`src/utils/session/params.ts:62-66`), and a second refused outright
(`src/tools/workflow-tools.ts:1621-1622`). So two members of a fan-out cannot both raise a decision. That
needs a keyed map, or fan-out members may not escalate.

## Decisions this adds to the README's list

Ordered by what blocks what.

1. **Does the runner author every prompt, or only some?** Twenty-two sites compose briefs as domain work.
   Deciding whether a worker-composed brief is a first-class prompt with a different author, or an opaque
   string the runner relays, shapes the whole protocol. Not previously on the list.
2. **Which gate verdict is authoritative** — the three-valued delivery check or the plain evaluators —
   and does the runner receive expressions or verdicts? Measure how many "no answer" readings survive
   once the runner maintains live values; that is the single most decision-relevant unmeasured number.
3. **What becomes of the orchestration workflow, the bootstrap call and the guard that protects it.**
4. **Who commits and who writes the progress table.**
5. **Sequence the bare-string migration** — 193 sites — ahead of the runner, with a guard, or inbound
   resolution is a coin flip on 85% of bindings.
6. **Unify the two token grammars** on the dotted form. Prerequisite for both inbound resolution and
   artifact naming, and it fixes an existing silent mis-report at 17 sites.
7. **Decide the artifact path**: retire the 45 artifact-writing steps in favour of a declared
   destination, or accept that bodies round-trip.
8. **Reconcile the two treatments of inequality** before making "no answer" an error, because absence is
   how the corpus spells "not in that mode" and one of the two collectors deliberately excludes it
   (`src/utils/gate-liveness.ts:14-16` against `:100`).
9. **Decide whether value-setting actions are in the write-set at all**, given the construct is already
   slated for removal and there are 81 of them. Building on something scheduled for deletion is the kind
   of stopgap the repo rules forbid.
10. **Re-measure the gate census and the loop denominators** before either is quoted again.

## Claims from the README and the issue that are now withdrawn

| Claim | Correction |
|---|---|
| 500 condition sites (296 / 70 / 134) | 382 measured (231 / 97 / 54), plus 11 on action steps and 1 early-exit |
| 274 of 500 read an earlier step of the same activity | Derived from the withdrawn census; re-measure |
| Values reach the session only when an activity ends | Answering a decision already lands values mid-activity (`workflow-tools.ts:2019`) |
| 313 not-yet-answerable and 168 unbound readings show the freeze | The harness never writes its values back, so the figures conflate the freeze with the harness's silence |
| Fan-out independence is derivable from reads and writes | It is not; and the corpus's real fan-out is a technique bound at 22 sites, with prompts composed at run time |
| Step identifiers are unique only per scope, so addressing needs a path | True of the schema, false of the corpus — zero duplicates across 131 activities; one shared check fixes it |
| The decision-instance mechanism only matches base identifiers | It already matches both ways (`workflow-loader.ts:473-491`); what is missing is something to mint the instance |
| 46 loops | Three defensible denominators: 46 in text, 58 reachable, 41 distinct definitions |
