# Activity step kind — design record

Design for [#520](https://github.com/m2ux/workflow-server/issues/520): a step that calls a nested
activity and returns. Nothing is implemented; this folder settles the decisions the issue says must
be settled before its schema lands, so the implementing pull request starts from a design rather
than from a question.

Raised from [#519](https://github.com/m2ux/workflow-server/issues/519), whose last open acceptance
criterion depends on this construct. The rule half of that issue landed in
[#521](https://github.com/m2ux/workflow-server/pull/521) and
[#522](https://github.com/m2ux/workflow-server/pull/522); the verdict and the per-fragment
disposition are recorded in [2026-08-27-rule-homes-and-shared-bodies](../2026-08-27-rule-homes-and-shared-bodies/).

## What the construct is for

Four activities of `work-package` — research, implementation-analysis, assumptions-review and
implement — each carry the same mid-flow sequence: gate the residual open assumptions, record the
batch answer, then loop the individual interview. Sharing it today means lifting the two gate bodies
to `fragments.checkpoints` at workflow scope, where they name six variables the activities own:
`is_review_mode`, `has_open_assumptions`, `assumption_review_presentation`,
`has_deferred_assumptions`, `needs_individual_interview` and `current_assumption`. That is the
inverse of the layering the graph exists to provide.

The alternative available today is routing through the graph, which cannot return: the callee's exit
names one destination and the three other callers each have their own remaining work.

## Stage 5 — the delivery model

**A called activity inlines into the caller's dispatch.**

The loop step is the precedent: it already nests an ordered step list inside one activity with no
second dispatch, so the recursion and the flattening that lookups and artifact composition need are
in place. A call costing a dispatch of its own would pay the re-dispatch overhead that was about 31%
of the 4.1M-token run the issue cites, for a sequence whose whole point is to be reached mid-flow.

This is the load-bearing decision, and it is why the schema can be a compound step rather than
anything the session has to track: the session records one current activity, with no stack, and an
inlined call needs none.

## How the resolved body reaches the worker

`get_activity` hands the worker the raw text of the activity file, with two textual transforms
already applied — resolved step ids, and checkpoint fragment bodies spliced in at the indentation of
the `ref:` line they replace. So a third transform is not a new kind of thing. Three forms were
considered.

### Considered: flatten the call away

Expand the callee's steps into the caller's list and delete the call step, so the worker cannot tell
a call happened. Mechanically possible, and the fragment injector is the precedent — one shape
harder, because it replaces one list item with several rather than one key with a block.

Rejected on three counts:

- **The site gate loses its home.** The call step's `when` would have to be conjoined onto each
  spliced top-level step's own gate. Steps carry two gate dialects — `when` (inline string) and
  `condition` (structured, legacy) — and there is no conjunction across them, so a site gate would
  have to be forbidden wherever a callee step carries `condition`.
- **Provenance leaves the payload.** Nothing in the delivered body would say the sequence came from
  elsewhere, which decides stage 6 by omission: `get_activity` emits one `artifact_prefix` derived
  from the activity's filename position, and a flat body cannot say a subset of its steps belongs to
  another activity.
- **Two shapes to keep honest.** The loaded model has to stay compound whatever the payload does, so
  that a guard attributes a finding to the file that must change; flattening only the payload means
  the step manifest is derived from one shape while every guard reads the other.

### Considered: a separate keyed block

Leave the call step in the raw body and ship the resolved steps as a sibling block keyed by the call
step's id, the way step-bound techniques already arrive. Rejected as the primary form: it adds a
second place the worker must look for steps it is expected to execute in sequence, which is a new
lookup semantic for no structural gain.

It buys one thing the inline form cannot: **dedup**. A content-keyed block collapses to an
unchanged-marker when a second activity in the same worker's batch calls the same callee, whereas an
activity body is delivered whole every time — the delivery ledger has keys for the technique bundle,
the inherited rules block, techniques and resources, and none for an activity body. For the corpus
case that is the shared assumption sequence arriving up to four times in one run, on the order of 2k
characters per repeat.

### Chosen: the resolved body, inline under the step

Keep the `kind: activity` step and serialize its resolved `steps:` beneath it, exactly as a
`kind: loop` step already carries its nested list. The worker reads one document in one shape it
already understands; the step stays the home for the site gate, for the provenance, and for the
artifact-prefix question; and the payload matches the object model, so there is one shape rather than
two.

The dedup cost above is accepted. #404's concern is the fixed block an orchestrator reads before its
first decision, not per-activity bodies, and one document is worth more than 2k characters.

## The other stages, as they fall out

**Stage 1 — the step kind.** `kind: activity` carries `id`, `activity` (the callee's id) and the site
gates every step kind carries. `steps` is server-resolved, the way `artifactPrefix` already is, and
is not authored. Resolution happens at load, after fragment materialization, so everything
downstream — `flattenActivitySteps`, checkpoint synthesis, the step manifest, the guards — reaches
the callee's steps through the traversal that already exists. Nested calls resolve recursively; a
cycle fails the load.

**Stage 2 — return.** Not needed, and not built. **A called activity declares no exits and takes no
graph entry**: its outcome is what it writes to the bag, which is what the caller already branches on
with the gates it has. The corpus confirms it — neither shared gate's options carry `effect.exit`;
both only write variables. Making a callee's exits readable as a caller-side outcome would add a
rewrite path with no use site, and it would mean a graph destination and a shared sequence were the
same shape when they are two roles: the graph binds the units a session advances through, and a call
names a sequence run inside one of them.

This is a deliberate departure from the issue's acceptance criterion "a called activity's exits are
readable by the caller as an outcome, and it takes no graph entry". The second half holds; the first
is answered by removing the need rather than meeting it.

**Stage 3 — identity of a called activity's decisions.** Discharged by qualification at resolution:
each spliced step id becomes the call step's id joined to the callee step's id, so two call sites of
one callee record their checkpoint responses under different keys and neither replays into the other.
The loop-body discriminator is the precedent for a qualified gate id.

**Stage 4 — the variable contract across the call.** The callee's declared reads and writes resolve
in the calling session's bag, and its writes contribute to the including workflow's variable set as
an activity's writes already do.

**Stage 6 — artifacts.** A called activity is a file under `activities/`, so it has a prefix from its
filename position already. What has to be decided is whether its artifacts land under that prefix or
the caller's; the step form above keeps the question answerable, because the delivered body still
names the callee. Open.

**Stage 7 — what it retires.** The two shared checkpoint bodies leave workflow scope for the activity
that owns their state, and the three activities reproducing that activity's tail call it instead. The
shared sequence extracts as its own called activity — gate, record the batch answer, loop the
individual interview — rather than the four callers calling `assumptions-review`, whose own head
(collect, then the analyse-challenge loop) each caller already performs itself.

## The real cost, and why this is its own pull request

Not the schema. `check-activity-variables` derives each activity's contract and holds every declared
read to a writer on every path *through the graph*, reporting five finding families including
reachability at entry and on a cycle. A called activity is not in the graph, so its contract has to
be discharged at its call sites and reachability computed through calls. Several other guards walk
steps and special-case the one compound kind they know about — decision-order, description-hygiene,
stealth-isolation — and each needs the second one.

That rework is why this did not ride along with the rule-home work: a step kind half-landed in the
schema is worse than none, and the corpus migration cannot be verified until the guards can read it.
