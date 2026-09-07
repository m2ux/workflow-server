# Interpreting a routine before there is a runner

Companion to [README.md](README.md), for [#531 W3](https://github.com/m2ux/workflow-server/issues/531)
and the originating [#520](https://github.com/m2ux/workflow-server/issues/520). The consumer of a
materialised routine is a language model reading YAML. This records what that agent does for itself,
where the proposal's specification stops short of it, and the two acceptance criteria and one open
question that follow.

## Who interprets a step

There is no runner. `get_activity` delivers `readActivityRaw` — the activity file's own YAML text —
with two textual injections applied over it (`src/tools/workflow-tools.ts:1046-1058`). The
interpreter is prose: `meta/techniques/workflow-engine/activity-worker.md:45-54` directs the worker
to execute each step in document order, load a bound operation on reach, honour `when:` against the
variable bag, and apply `yield-checkpoint` when a step reaches a gate. The schema says the same for
the activity boundary — an exit's `when` is "evaluated agent-side against the variable bag".

So every guarantee that rests on the server and the worker agreeing about a generated identifier
rests on the worker **composing that identifier correctly from what the text shows it**. That is the
surface this file is about, and it is distinct from the surface the proposal covers.

**What the proposal already carries.** The two-representations section names the raw-text path as the
largest cost in the design and specifies a differential test over the whole corpus; a prototype
splicer round-trips a routine step nested inside a loop body, the hardest position the corpus has;
and [conversion-rerun.md](conversion-rerun.md) lists the text path first among what it did not test.
The *structure* an agent receives is accounted for. The agent's own composition duties are not.

## 1. The worker composes a checkpoint instance id

`yield-checkpoint.md:24` assigns the work to the worker, and grants latitude in how:

> for loop-body gates that need a distinct user decision per iteration, use `<baseId>#<instance>`
> (base id before `#`, plus a stable per-iteration discriminator — expand a declared `#{...}`
> template, or use the loop item's id/slug)

A per-iteration key is therefore assembled by a model, from a template it reads in the delivered
text, and it may also choose the discriminator itself. Under a routine both halves of the key change
shape, and they carry different prefixes. The base takes the reference site's dotted prefix, step
ids being scoped per activity: `reconcile-assumptions.interview.decision`. The template interpolates
the internal's materialised name, which carries the host activity as well as the reference site,
because a variable name shares one flat namespace across the workflow:
`#{implement_reconcile_assumptions_current_assumption.id}`. So the worker reads a mangled bag name it
did not author, takes `.id` from it, and composes the result onto a base prefixed by a different
rule — which is where the identifier-length item's 105-character step id and 124-character response
key come from.

**This is the correctness half of the identifier-length question**, and the identifier-length item in
[decisions.md](decisions.md) carries both halves. Length is a legibility matter for a runtime that
emits the key it generated: the generated names are JSON keys in the session record and arguments to
`get_technique`, never filenames, so nothing truncates or rejects them. A worker composing the key by
hand has a different exposure. `checkpointBaseId` splits on the first `#`
(`src/loaders/workflow-loader.ts:449-453`), so a mis-composed instance does not fail — it records a
new checkpoint and asks a question whose answer already exists, which is the failure the prefixing
rule exists to prevent, reached through the party that has to apply the rule. A key assembled by
string work over a mangled variable name is that exposure for exactly as long as the worker is the
interpreter, which is the whole of the interval this design ships into.

**The two identifiers this mechanism generates fail in opposite ways, and only the fail-silent one is
left to the worker.** A step id is consumed by `get_technique`, which finds it by exact match and
throws with the full list of available ids when it misses (`src/tools/resource-tools.ts:695-703`), so
a mistyped prefixed step id is a loud failure carrying its own remedy. A checkpoint instance id is
consumed by `checkpointBaseId`, which splits on the first `#` and therefore accepts anything: the
server records a new checkpoint and asks a question whose answer already exists. Both identifiers
come from the same prefixing rule and are read by the same agent out of the same delivered text.
That asymmetry is the sharpest form of the argument below — the id the worker composes is the one
with no failure signal, and the id the server composes already has one.

Two answers are available and both are larger than a wording change, which is why this is recorded
rather than settled here:

- **The server composes the instance id and the worker echoes it.** The gate is already delivered
  through the server, so the composed id can travel with it and `yield-checkpoint` can lose the
  expand-a-template clause. This removes the latitude as well as the arithmetic.
- **Internals are scope-resolved rather than name-mangled** — the scoped-names item in
  [decisions.md](decisions.md), arriving here from a fourth direction. A routine's internal needs no
  prefix if the loader records the scope, after which the template interpolates a short name and both
  numbers in the identifier-length item collapse.

## 2. A third textual injector, and the order among the three

`injectResolvedStepIds` (`src/schema/activity.schema.ts:234`) rewrites the delivered YAML with a
regex: for any `- technique:` list item carrying no `id:` line, it inserts one derived from the
technique reference's last `::` segment, preserving indentation, so the worker sees the id the server
resolves. It knows nothing about a routine prefix. The delivery chain today is that injector, then
`injectCheckpointFragmentBodies` (`src/tools/workflow-tools.ts:1049-1058`).

Routine expansion is a third stage over the same text, and its position in that chain decides
whether a spliced technique step with no authored id arrives carrying an **unprefixed** id in the
text while the object path holds a prefixed one. That is the divergence the proposal names as the
thing to test hardest — a worker reading a step the server does not believe exists — reached by a
route the differential test cannot see, because both representations parse and the test compares
parses.

**Acceptance criterion.** The textual splicer emits an explicit `id:` line, already prefixed, for
every step it splices, including every step of a nested body. The regex then has nothing to match
inside a materialised routine, and the ordering among the three stages stops being load-bearing.

[investigation.md](investigation.md) documents `injectCheckpointFragmentBodies` and its
`scanCheckpointRefLines` pre-scan; `injectResolvedStepIds` belongs in the same inventory.

## 3. The differential test compares a parse; the worker reads the text

The specified test parses what the text path produced and compares the resulting object field for
field against the object path's, which "ignores layout, indentation and comment placement — the
things the text path preserves on purpose". That tolerance is right for structure and wrong for the
consumer: a quote style that changes how a template reads, a folded block scalar re-indented, a
comment landing inside a step block, or a substituted message whose braces moved all parse
identically and read differently to an agent.

**Acceptance criterion.** For the fields a worker acts on directly out of the text — a checkpoint's
`message` and `id`, an option's `label` and `effect`, a step's `when`, a loop's `over` and
`continueWhile` — the two paths are compared as **text**, not only as parsed fields. Everything else
keeps the field-for-field comparison.

## 4. No loop protocol reaches the worker

`activity-worker.md` §3 covers document order, `kind: technique` steps, `when:` gates and
checkpoints. It names no loop construct. Across the corpus `loopType` appears only in authoring canon
— the schema construct inventory and the anti-pattern catalogue — and in activity files themselves;
no worker-facing instruction names it, `continueWhile`, or `maxIterations`. The worker infers
iteration from field names, and the continuation-field change landed without the worker prose
naming the field it introduced.

This is not a defect a routine creates, and it is not this proposal's to fix. It matters here because
the conversion the proposal leads with puts a loop **with a per-iteration gate** inside a routine at
seven sites, which lands the construct's most-exercised path on the least-specified part of the agent
protocol — and because finding 1 above is a consequence of that gap rather than an independent one.

## The audience for a routine in `get_workflow`

Discovery gives a routine its own place in `get_workflow`. `activity-worker.md`'s
`worker-control-plane-ban` forbids a worker calling `get_workflow` at all, so that exposure serves
the orchestrator and the author. Worth saying which, since UC7 promises the worker never receives a
reference, and a reader meeting both statements has no way to tell they do not conflict.

## What this adds to the plan

| | Lands as | Where |
|---|---|---|
| Prefixed `id:` on every spliced step, in the text | Acceptance criterion on stage 3 | Finding 2 |
| Text-level comparison for worker-read fields | Acceptance criterion on stage 3 | Finding 3 |
| Identifier length is a correctness question while the worker composes keys | Reclassification of the identifier-length item | Finding 1 |
| A step id fails loudly and a checkpoint instance id fails silently | Evidence under the scoped-names item | Finding 1 |
| Server-composed instance ids, or scope-resolved internals | Weighed under the scoped-names item | Finding 1 |
| `injectResolvedStepIds` in the delivery-path inventory | One entry | Finding 2 |

None of it blocks the construct. Findings 2 and 3 are cheap to specify now and expensive to discover
at a live gate, which is the argument for writing them down before stage 3 rather than after it.
