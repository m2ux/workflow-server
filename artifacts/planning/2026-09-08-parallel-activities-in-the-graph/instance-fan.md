# Instance fan: running one activity once per work unit, decided in the graph

**Date:** 2026-09-08
**Corpus:** `workflows` at `f3733709801215501a90bd93d4e4a91e1d6f80ea`. **Server:** `main` at `9f1605d34ec60ead78f2417f94860bf9d8082e41`.
**Extends:** [the parallel-activities specification](./README.md) and supersedes [the branch-index amendment](./amendment-branch-index.md).
**Owner decisions this was designed to:** instances differ by one parameter, all else equal; migration of existing fan-out sites is a recorded consideration, out of scope for the plan here.
**Prerequisite:** [#655](https://github.com/m2ux/workflow-server/issues/655).

> **Both judge panels recommend merging this into the base specification rather than keeping two documents.** The extension is co-extensive with the base — 38-44 files against 43-48 — and its stages 1, 2, 4 and 5 must land in the same commits as their base counterparts. Read the two together until that merge happens.

**Recovery note:** the synthesising agent's return was clipped to its final 9,787 characters. This document is the full 162,980-character text recovered from that agent's transcript, unedited.

Nothing here changes a definition.

---

## What this document is, and how it sits against the specification it extends

This is a companion to *Parallel activities in the graph*, the specification that designs a graph destination naming several **different** activities and derives their meeting point from where their own exits converge. That document is the ground; this one extends it to the case it cannot express — running **one** activity several times at once, once per unit of work.

Three terms are used throughout and are worth fixing before anything else.

- A **work unit** is one element of a collection of things the same operation is to be done to: one adversarial perspective to argue from, one submodule to scan, one crate to review.
- An **instance** is one live run of one activity against one work unit. Three instances of a research activity are three separate workers, running the same steps, each handed a different topic.
- The **frontier** is the list the session record keeps of what is in flight — one entry on an ordinary walk, one per branch while several run together.
- A **branch key** is the name in the shared variable bag that a branch's reported outputs land under, derived from the activity's own id so that nothing has to be told it.

**Sections of the specification this amends.** §1 (what ships dormant — the claim is false of this form, and this document is the amendment). §4.1 (the destination schema gains a third form). §4.4 (rule L2 is re-aimed rather than withdrawn; L5, L9 and L10 gain a clause or a message; four rules are added). §5.2 (what the exit call names, its refusal texts, and four refusals at the moment a fan is entered). §5.3 (what the worker's activity parameter carries, and one worker rule that becomes effective). §5.5 (one input renamed on the fan-dispatch operation, one rule clause). §6.1 and §6.3 (the shape below the branch key, and the write context that lands into it). §6.5 (the container's declared type, and the member-grain read test). §6.6 (where the destination flattening goes, and why it must de-duplicate afterwards). §7 (the enforcement table gains rows). §9 (the stages extend stage-for-stage). §10 (three refusals amended, with the quotation and the reason). §11 (the residuals sharpen).

**Sections inherited unchanged, and the first is the important one.** §5.1 — the frontier stays `z.array(z.string())` and the resolver that reads it is not touched. Also §2, §3, §4.2, §4.3, §5.4, §5.6, §5.7 (its shape; its description gains one clause), §6.2, §6.4 and §8.

**One honest correction to the framing, before the summary.** This is not a small follow-on to a merged capability. Counting the files each names before adoption, the specification's own stages touch about forty-three; this extension's touch about thirty-eight, and on *marginal* server source files — files this change edits beyond what the specification already edits at the same site — the count is seven against the specification's twelve. The staged plan below says why: four of its seven stages must land in the same commits as their counterparts, because each touches the same declaration, the same projection or the same handler branch, and a half-landed union is a parse error waiting for an author. So the two documents should merge into one specification with one refusals section, one staged plan and one cost section. Written as a companion because that is what was asked for; recorded here as co-extensive because that is what it is.

---

## 1. Summary

**What it adds.** A graph destination gains a third form: an object naming one activity, the collection in the variable bag to run it once per element of, the name each instance reads its own element at, and the widest fan the author admits. Three routing facts and no data — the graph names the collection, never its members. Each instance is one worker with its own identity; each is handed exactly one value; each lands its outputs in its own slot under the activity's branch key; and the run enters the single activity all of that activity's exits name, once, after the last instance returns.

**What it costs, and the number is worse than the distinct-activity form.** The alternative to an instance fan is not a batched walk of several different activities. It is one activity whose loop body runs N times inside one worker, which is what the corpus does today, and that costs one delivery — a loop body's technique is bundled once and reused every pass. So an instance fan's premium is the activity's whole payload, N−1 times over, plus N−1 fresh harness establishments. Using the only measured figures in the tree and saying plainly that the per-activity payload is a substitution: a fan of three costs between 253,580 and 332,512 characters more than the sequential loop, which is 63,395 to 83,128 tokens, or between 290% and 381% of what the whole sequential run costs. Each extra instance costs between 145% and 190% of the entire sequential run. The distinct-activity fan's premium, measured against *its* alternative, is +53% to +89%. **Per unit of work an instance fan is between 4.3 and 5.5 times worse than a distinct-activity fan** — not, as a plain character comparison suggests, twice. A fan of three costs more in premium alone than a whole three-activity batched walk costs in total.

**What it buys that a character count cannot see.** The batch budget counts characters delivered, never characters generated, so nothing bounds how much reasoning accumulates inside one worker. An in-context loop of N units piles all N passes into one context, and at the corpus's own convergence loops that is up to ten passes times the unit count in a single worker. An instance fan converts unbounded growth in one context into N bounded contexts. That is the corpus's own isolate-then-combine discipline buying correctness rather than latency, and it is the honest counterweight to the token number rather than a way around it.

**What it needs first.** Issue #655, unchanged in form from the specification's requirement: a compare-and-swap on the session record's sequence number with retry, never a per-session write lock. Instances make both halves of that stronger. All the appends must survive, and N instances of one activity append history events whose activity field is identical, so a lost append is indistinguishable from a correct single-instance run. And a lock would serialise N compositions of the *same* hundred-thousand-character payload behind one another, when wall clock is the only thing a fan buys.

**Does it serve the demand.** Fifteen bindings of the fan-out operation sit across seven definition files, and every one of them is inside an activity executed by a dispatched worker, which holds no agent-dispatch tool — so both branches of that operation are unreachable at all fifteen. Per site: **served** at the orchestrator-workers pattern, the isolated-fan-out pattern (for context isolation only), the lead-researcher pattern's two fans, and the continuous-integration pipeline scan; **served in three chained pieces rather than one turn** at the substrate node security audit's primary batch, because its roster mixes three different activities and one fan runs one; **not served, and never wanted a fan**, at the supervisor pattern, whose concurrency is one over a one-element collection and which wants an ordinary edge, and at the substrate audit's reconnaissance, which is a chain of two activities with a file-verification step between them. So five of the seven files get what they were written for, two want plain graph edges, and the aggregate answer is yes with two subtractions stated rather than counted as demand.

**And the capability does not ship dormant.** The specification's §1 says no workflow in the pinned corpus is fan-ready and the obvious candidate is not adoptable as it stands. That is true of the distinct-activity form and false of this one. The continuous-integration pipeline scan is a day-one caller: it is free of decision gates, it already binds the ordered-collection gather this design's meeting point needs, it already declares a per-instance artifact whose filename carries a token and whose guide-map row already resolves, it touches no checkout and no shared register, and its per-unit work is a whole submodule scan — long enough that an extra payload buys real wall clock and real context isolation. It already parameterises its worker count from a session variable, which is exactly what a fan's width is, so migrating it **deletes** that variable rather than adding one. The corpus also already tells authors to do this: the depth rule that makes the fan-out vocabulary unreachable ends by instructing an author to hoist a pass to the orchestrator when its fan-out is worth an orchestrator-owned step, and offers no construct for doing so. This is that construct.

---

## 2. What the distinct-activity fan cannot express, and why the gap matters

The specification's fan is a list of activity ids. It runs research, then codebase comprehension, then implementation analysis, all at once, and meets them where their exits converge. Everything it derives, it derives from each branch's own id: the bag key its outputs land under, the destination it points at, the identity it is dispatched under.

The motivating shape is different in one way that breaks every one of those derivations. Several research passes run at once, one per topic — identical steps, identical techniques, one value different per pass. There is one activity and several units of work. So there are no distinct ids to derive from.

Three things follow, and each is a hard stop rather than an inconvenience.

**Everything that resolves what is in flight keys on the name being unique.** The specification's resolver answers "the entry it names when the frontier holds it, or the sole entry when a call names none and only one is in flight — undefined otherwise, and the caller refuses rather than guessing." Put one activity's name in that list three times and a call naming it matches all three, so the handler cannot tell which instance returned, which outputs it is holding, or which slot they belong in.

**The worker's own tool takes no activity parameter, deliberately.** Its description says so, and its handler reads the single current activity out of the session record. Two workers running two instances therefore ask an identical question, so neither can be handed its own work unit through the surface as it stands.

**The graph carries no data.** A destination that named one activity three times would say run it three times and nothing at all about what differs — and there is no way for the instances to work it out for themselves. There is no indirection anywhere in the tree: the placeholder grammar admits literal path segments only, so a nested placeholder is unmatchable; the bag-name grammar admits literal segments only; the structured condition compares a literal name against a literal value; and the gate dialect tokenises a literal path. So a design in which an instance is handed a position and projects its own element out of a shared collection does not run. Handing an instance a number buys it nothing, because it cannot spell its own read.

The specification also names a fourth thing and leaves it open, and this document closes it: two instances run the same techniques, whose artifact declarations resolve the same filenames, so they collide by construction.

Why the gap matters is the whole demand behind issue #657. The corpus has a complete fan-out vocabulary — a scatter-gather operation with a parallel mode, a dispatch-workers operation, five borrowable pattern activities — and none of it executes, because every binding site is an activity, and an activity's steps run in a worker that holds no agent-dispatch tool. Seven definition files bind an operation whose parallel branch is unreachable from where it sits. Every one of them is the same shape: N units, one operation, all else equal. That is an instance fan, and only the orchestrator can run one.

---

## 3. The capability: one activity, N units

An exit binding gains a third form. Read plainly, it says: when this activity finishes on this exit, start one worker per element of that collection, each running that activity, each handed its own element at that name, and no more than this many.

```yaml
graph:
  reconcile-assumptions:
    converged:
      activity: challenge-pass
      over: challenge_perspectives
      variable: challenge_perspective
      maxInstances: 4
  challenge-pass:
    challenged: combine-challenges
  combine-challenges:
    resolvable: reconcile-assumptions
    settled: assumptions-review
```

Worked through, with a collection holding three perspectives.

1. The reconcile activity returns on its `converged` exit. The transition call names that exit and names the destination as the graph gives it. The server reads the collection out of the bag, finds three elements, derives an id for each, refuses if anything is wrong, materialises the output container with three empty slots in the collection's order, puts three entries on the frontier — `challenge-pass#0`, `challenge-pass#1`, `challenge-pass#2` — and hands the orchestrator that branch list.
2. The orchestrator mints three identities, composes three prompts, and spawns the batch in one turn.
3. Each worker loads its activity by naming its own entry. Each is served the same activity body and a small server-computed block carrying the one value it is working on, bound at the name the destination gave. Instance one reads `challenge_perspective` as `rejected-paths`; instance two reads it as `evidence-strength`.
4. Each worker finishes and reports. Its transition call names its own entry, so the server knows which slot to write. Its reported values land whole inside that slot, under the activity's branch key, never at bare names.
5. The first two returns retire their entry and enter nothing; each is told the meeting point and which instances are still out. The third return retires the last entry, which empties the frontier, so that call — and only that call — enters the combine activity.
6. The combine activity reads the container whole and hands it to the ordered-collection gather, with the fan's own collection as the list of ids it expects. It writes one document, and its exits route either onward or back to the reconcile activity — a convergence loop as a graph cycle.

Nothing in the graph names an individual instance. Nothing in the activity file says it is fanned. The worker never learns the width, and the orchestrator never computes it.

**And it is not a loop step wearing a graph's clothes.** It borrows the loop's vocabulary deliberately — the loop's own header states its division of labour as the collection and the item — but the tell is that a loop step *contains* its body as a list of steps, and a destination *names* an activity the graph already contains and already routes. There is no continuation test, no early exit, no nesting, no body. And it cannot be a loop step: a loop body runs inside one worker, and a worker holds no dispatch tool, which is precisely why the corpus's whole fan-out vocabulary is unreachable at all fifteen of its bindings. The construct that runs N workers has to sit where the run's routing is decided.

---

## 4. Where the work units come from

### The schema, exactly

One file, `src/schema/workflow.schema.ts`, beside the existing graph declaration.

```ts
/**
 * A destination that runs one activity once per element of a collection: an instance fan.
 * `activity` is the activity every instance runs; `over` names the collection in the variable bag,
 * whose length when the fan is entered is the fan's width; `variable` is the name each instance
 * reads its own element at; `maxInstances` is the widest fan this destination admits, so a longer
 * collection refuses the fan-enter rather than spending its dispatches. The graph carries the
 * collection's NAME and not its members, so nothing about a work unit enters the routing file.
 * The key the instances' outputs land under is derived from the activity id, so a reader of the
 * graph, the server and the guards spell it the same way and a worker is never told it.
 */
export const InstanceFanSchema = z.object({
  activity: z.string().describe(
    'The activity every instance of this fan runs. One activity: its instances differ by the element each is handed and by nothing else.',
  ),
  over: z.string().describe(
    'The collection in the variable bag this destination runs the activity once per element of, by name or by a dotted path into a named value (`work_units`, `execution_plan.steps`). Read when the fan is entered, so its length is the fan\'s width.',
  ),
  variable: VariableNameSchema.describe(
    'The name each instance reads its own element at. The activity this fan runs declares it among the names it needs its workflow to supply; name it as the consuming operation\'s own input id so no step needs a rename.',
  ),
  maxInstances: z.number().int().min(
    2,
    'a fan admits at least two instances; an exit that leads to one run of one activity names that activity',
  ).describe(
    'The widest fan this destination admits. A longer collection refuses the fan-enter, naming this number and the collection\'s length. Each instance beyond the first costs a whole extra delivery of this activity, so keep it near what the work needs.',
  ),
}).strict();
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

export const DestinationSchema = z.union(
  [
    z.string(),
    z.array(z.string()).min(
      2,
      'a fan names at least two activities; an exit that leads to one activity names that activity, and an exit that runs one activity over a collection names the activity with that collection',
    ),
    InstanceFanSchema,
  ],
  {
    errorMap: () => ({
      message:
        'a destination is an activity id, `__terminal__`, a list of at least two activity ids, or an object naming `activity`, the `over` collection it runs once per element of, the `variable` each instance reads its element at, and `maxInstances`',
    }),
  },
);
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The activities one binding can send the run to — one for a plain destination or an instance fan, several for a list. */
export const destinationTargets = (destination: Destination): string[] =>
  Array.isArray(destination) ? destination
  : typeof destination === 'string' ? [destination]
  : [destination.activity];

/** Whether a destination runs several workers together, in either form. */
export const isFan = (destination: Destination): destination is string[] | InstanceFan =>
  typeof destination !== 'string';

/** The instance fan a destination is, or undefined for a plain destination or a list. */
export const instanceFan = (destination: Destination): InstanceFan | undefined =>
  typeof destination === 'object' && !Array.isArray(destination) ? destination : undefined;

/**
 * The bag key an activity's outputs land under when the graph runs it as a branch of a fan: its id
 * in snake case with `_outputs` appended. Derived from the id alone.
 */
export const branchKey = (activityId: string): string => `${activityId.split('-').join('_')}_outputs`;
```

`over` is deliberately not regex-constrained: rule L12 does the stronger check, and a grammar constant here would be a second home for a grammar the variable-binding operation already states. `variable` is typed rather than checked, which makes a bare-word parameter a parse error and removes the need for a grammar rule of its own.

`maxInstances` is **required**, and that is a deliberate departure from the loop field it is named after. A loop's iteration bound is optional and enforced by the executing agent because a loop's cost is one worker's passes, stoppable mid-flight. A fan's width is spent as N irreversible dispatches inside one turn, so an unbounded fan is unauthorable rather than merely discouraged. `min(2)` carries the specification's own reasoning across: a destination whose ceiling is one is a plain edge spelled a second way.

### The messages, probed rather than guessed

The two judge panels left the union's error behaviour open. Probed against the repo's own zod:

| Authored | Rendered |
|---|---|
| `converged: [challenge-pass]` | the array member's own message — the error map does not suppress it |
| `converged: []` | the same message |
| `converged: 42` | the union error-map message |
| `converged: [[a, b]]` | the union error-map message |
| `converged: { activity: x, over: y }` | the union error-map message — **which is why the map enumerates all four required fields**; a partial object matches no branch far enough to surface a field error |
| `converged: { activity: x, over: y, variable: z, maxInstances: 1 }` | the `maxInstances` field message, because that branch matched furthest |
| `converged: { …, unit: q }` | `Unrecognized key(s) in object: 'unit'` — which is what tells an author the output key is derived rather than authored |

### The graph field's description

This is the one piece of text that reaches every reader — the orchestrator's workflow summary, the generated JSON schema and the published site — so it is written out rather than left to the implementer.

```ts
  graph: GraphSchema.optional().describe("The workflow's shape: for each activity, where each of its exits leads. This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. A destination naming one activity sends the run there, and `__terminal__` ends the run. A destination naming several activities runs them together, one worker to each. A destination naming one activity together with the collection to run it over runs one worker per element of that collection, each handed its own element at the name the destination gives; the graph names the collection, so the width is that collection's length when the fan is entered, bounded by `maxInstances`. Either fan lands each branch's outputs in its own slot under the branch's own derived key, and the run enters the single activity all of the branches' own exits name, once, after the last of them returns. Omitted only by a workflow whose activities declare no exits."),
```

### The generated JSON, from `npm run build:schemas`

```json
"graph": {
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "additionalProperties": {
      "anyOf": [
        { "type": "string" },
        { "type": "array", "items": { "type": "string" }, "minItems": 2 },
        {
          "type": "object",
          "properties": {
            "activity": { "type": "string", "description": "The activity every instance of this fan runs. ..." },
            "over": { "type": "string", "description": "The collection in the variable bag this destination runs the activity once per element of ..." },
            "variable": {
              "anyOf": [
                { "type": "string", "pattern": "<QUALIFIED_DATA_ID_PATTERN>" },
                { "type": "string", "enum": ["<EXEMPT_DATA_IDS>"] }
              ],
              "description": "The name each instance reads its own element at. ..."
            },
            "maxInstances": { "type": "integer", "minimum": 2, "description": "The widest fan this destination admits. ..." }
          },
          "required": ["activity", "over", "variable", "maxInstances"],
          "additionalProperties": false
        }
      ]
    }
  },
  "description": "<the describe text above>"
}
```

Both the array's item schema and the object's properties are non-empty, so the generated-schemas test that fails on an empty subschema under an items key stays green. The site's schema renderer never recurses into an `additionalProperties` subschema, so the site needs no work beyond picking up the description.

**Corpus impact of the widening: none.** Re-measured at the pinned corpus commit: 17 workflows, 109 activities bound in graphs, 207 graph edges, 18 of them terminal, 0 list-valued and 0 object-valued. A union accepts every existing string, no load rule keys off a destination's JavaScript type, and every instance rule is vacuous until a fan is authored.

### Where the parameter name is declared, and where it is not

The name lives in exactly two places and one rule keeps them in agreement.

- **The destination declares it**, because the fan is the thing that supplies it.
- **The activity the fan runs declares it** among the names it needs its workflow to supply, which is that activity's ordinary contract on its including workflow. Rule L11 is the agreement check.

It is **not** declared in the workflow file's own variable list. Declaring it there would put it in the set the guard treats as workflow-owned, which is both skipped by the unwritten-read check and seeded into the availability lattice — so a read of the parameter *anywhere else in the workflow* would be silently satisfied, and closing that hole would need a new guard family. Instead the guard treats the parameter the way it already treats server-supplied names: available to the activity the fan runs, and unwritten for every other activity. The existing unwritten-read check then reports a stray reader natively, with a fan-specific detail string, and no new family name is needed.

### Why the parameter is authored rather than derived from the activity id

A derived name — the activity's id with a suffix — is one home instead of two and needs no agreement rule, which is genuinely the cheaper structure. It is rejected on two counts, one from each direction.

**No operation's own input id will ever be an activity's name with a suffix.** The binding contract makes same-name binding the zero-data path and a rename the exception, and it says in terms that a name mismatch is resolved by aligning the caller's variable to the operation's canonical input id, not by bending the operation to the call site, so that implicit same-name binding is maximised rather than eroded. A derived name that can never match any canonical input id erodes it by construction, at every consuming step, forever. It also makes the activity fan-only: outside a fan nothing writes a name derived from the activity's own id, so the guard reports the read and the activity cannot be reused sequentially.

**And it forces a rename at both day-one adopters, on files that are green today.** The two security-audit workflows each already declare a per-instance artifact whose filename is a token — one keyed on an agent designator, one on a scanner designator — and each already has a guide-map row that resolves. With an authored parameter those names are simply used as the fan's parameter, and both templates and both guide rows migrate untouched. With a derived parameter each template, each input block and each guide row is edited: three file edits per adopter, on the exact files whose greenness is the evidence that the artifact question is already solved.

The agreement rule that pays for the authored name is one load rule, and it is the only policing: a second fan of the same activity handing the element at a different name fails L11, because the activity declares one read for its element. No separate cross-fan comparison is added.

### The construct inventory row

```
| "Run this one activity once per work unit — one worker each, then combine" | **Instance fan** (graph) | `graph.<activity>.<exit>` set to `{ activity, over, variable, maxInstances }`: the activity runs once per element of the `over` collection, one worker to each, each handed its own element at `variable`. The graph names the collection, not its members, so the width is that collection's length when the fan is entered, bounded by `maxInstances`. Each instance lands its outputs in its own slot under the activity's derived branch key (its id in snake case with `_outputs`), and the run enters the single destination all of that activity's exits name, once, after the last instance returns. The activity that combines them reads the container whole and binds `orchestration-patterns::gather-results` with the fan's own collection as `expected_ids`. A fan over a collection this workflow declares nowhere, a parameter the fanned activity does not read, a fanned activity declaring a decision gate, and a fanned activity that mutates the checkout each fail the load; an over-long, empty, non-array or duplicate-id collection refuses the fan-enter. Distinct from the **Graph fan** row above (several *different* activities) and from the within-activity fan-out row (work units inside one worker, which needs no fan). |
```

The existing Graph row is amended in the same edit to cover all three destination forms, and the within-activity fan-out row is amended to say which layer it now covers — see the stale-restatement sweep in the staged plan.

---

## 5. How an instance knows which it is

### The frontier entry: a bare string that gains an instance segment

The specification's declaration stands **unamended**:

> ```ts
>   frontier: z.array(z.string()).default([]),
> ```
> and, in its refusals section: "The frontier is a list of activity ids."

An entry for one instance of a fan is `challenge-pass#1`. The specification's next sentence — "Nothing else goes on an entry" — holds literally: the entry is still one string, and nothing is added beside it. All three things that sentence refuses stay refused, and the reasoning behind each survives. A meeting point on the entry would still be a copy of a graph fact the handler already loads, and now for a second reason: all instances of one activity share that activity's exit bindings, which the graph reads keyed by activity id, so N instances have one meeting point by construction. A timestamp on the entry would still be a copy of the entry event already in the history. And a worker identity on the entry is still refused, for the reason given below.

**The corpus already owns this spelling, and it was introduced for exactly this shape.** A checkpoint inside a loop body is defined once and reached N times, so the loader yields it as a base id, a separator and an instance discriminator, and resolves an instance-qualified id back to its base definition. One definition reached N times, discriminated the same way, resolved by base. The separator's home generalises to serve both populations, in `src/loaders/workflow-loader.ts`:

```ts
/**
 * The separator between a base id and its per-instance discriminator. One definition reached
 * several times — a checkpoint inside a loop body, an activity the graph fans over a collection —
 * is named `<baseId>#<instance>` so that each reach is a distinct id: a distinct checkpoint
 * response key, a distinct frontier entry, a distinct history event, a distinct usage row. The
 * base is what matches the single definition.
 */
export const INSTANCE_SEPARATOR = '#';

/** The base id — the portion before the per-instance discriminator, if any. */
export function baseId(qualifiedId: string): string {
  const i = qualifiedId.indexOf(INSTANCE_SEPARATOR);
  return i === -1 ? qualifiedId : qualifiedId.slice(0, i);
}

/** A fan instance's index, where the discriminator is one. */
export function instanceIndex(qualifiedId: string): number | undefined {
  const i = qualifiedId.indexOf(INSTANCE_SEPARATOR);
  if (i === -1) return undefined;
  const raw = qualifiedId.slice(i + 1);
  return /^\d+$/.test(raw) ? Number(raw) : undefined;
}
```

The existing checkpoint base helper retires into `baseId` — three call sites in the loader and the validation module, plus one test import, all enumerated in the staged plan. No compatibility alias.

**Why the index and not the work unit's own id as the discriminator.** The unit's id is what the corpus's loop-body checkpoints use, and it is the more readable string. It loses on three counts. Uniqueness: a runtime collection with two elements sharing an id would produce two identical frontier entries, reintroducing the exact ambiguity this design removes and discovering it mid-run — the index needs no duplicate refusal for the frontier's sake. Order: the slot is the collection's own position, so the gathered collection is in work-unit order with nothing sorting it. And range: an author's index in a combine activity's expression can be compared against the fan's declared ceiling at load, which a runtime id cannot. The unit's id is still derived and still used — it names the container slot, the gather's manifest row and the artifact filename — but as a datum inside the slot, not as the designator of it. The entry designates a slot; the projection carries the parameter.

### What the composite entry buys, and it is why it beats an object entry

An object entry carrying an activity and an index would make every stale reader a compile error, which is a real benefit and the reason to consider it. It is rejected on cost, and the cost is concentrated exactly where the risk is.

**The specification's resolver is not amended at all.** Its rule — the entry it names when the frontier holds it, or the sole entry when a call names none and only one is in flight, undefined otherwise and the caller refuses rather than guessing — reads over a list of distinct strings unchanged. A call naming the bare activity matches nothing; a call naming `challenge-pass#1` matches exactly one entry. **Blocker 1 dissolves rather than being answered.** An object entry would force a new resolver signature and a change at every caller for no gain.

**Six files take no marginal edit.** The session schema, the resolver, the record store's canonical key ordering, the legacy converter, the resource tools and the logging module are all untouched beyond what the specification already changes — and those are the files where the tree's sixty-six references to the retired single-current-activity field live, inside the one stage that is gated on #655.

**No new tool parameter anywhere.** The instance rides the value of parameters the specification already introduces. Where an object entry needs three new scalars — an instance index on the worker's load call, one on the transition call, and one on the usage call — this needs none. The usage call is the clearest: its activity parameter is already described as the activity a figure is attributed to whether or not the session is still on it, and it is stored verbatim with no validation, so an instance-qualified id satisfies the declaration as written.

**Six existing per-activity projections become instance-correct with no code change**, because every history event's activity field is a plain string and the composite lands in it. Wall-clock spans are keyed per instance rather than collapsed into the fan's span. The activities-with-no-usage-figure diff compares the usage set against the completed list, and with composites on both sides a missing instance figure is reported — keyed on the base id, one figure would satisfy N instances and N−1 missing figures would be invisible. The batch activity count reads one per instance scope either way. The technique-fetch validator scopes a visit to the last entry event for the named activity and already filters on the agent identity, so with the composite the activity half agrees with the agent half and one instance's fetches cannot credit another's manifest. The redelivery detector — which exists because the same activity delivered whole twice in one session reads as an ordinary first delivery from every angle except that one — fires exactly on a genuine replacement or a duplicated claim; keyed on the base id a *correct* fan of N fires it N−1 times and buries the one event that matters in noise generated by construction. And the history milestones carry the instance.

**The cost, and how it is paid.** The protection is tests, not types. Composite ids reach five validators and one header, and two of them fail *silently* rather than noisily: the reported-exit validator and the transition validator each look the destination up in the graph, miss, find an empty binding list and return no finding — the check is disabled, not wrong. Two fail noisily and are recoverable in review: the step-manifest validator returns "cannot validate manifest: activity not found", and the activity-manifest validator warns that a manifest references an unknown activity on every instance return, which is how an orchestrator learns to stop reading the validation block. And the routing block in the worker's header would come back empty, leaving the worker unable to report its exit.

Two edits close all six, and both mirror a base-fallback convention already sitting one screen away in the same file:

```ts
/**
 * Get an activity from a workflow by ID. An exact id match wins; otherwise an instance-qualified
 * id (`<baseId>#<instance>`) resolves to its base definition, so N instances of one fanned activity
 * share one definition while being recorded, validated and accounted for distinctly.
 */
export function getActivity(workflow: Workflow, activityId: string): Activity | undefined {
  return workflow.activities?.find(a => a.id === activityId)
    ?? workflow.activities?.find(a => a.id === baseId(activityId));
}
```

and, in the exit-bindings reader, the graph lookup takes the base. The activity-manifest validator's explicit membership test base-normalises in place, one call. The technique-fetch validator keeps the composite for its history scoping, deliberately. **Stage 5's acceptance list carries one test per reader, with the two silent ones called out as such**: a fan-instance transition whose reported exit is not bound must be *refused*, which proves the reported-exit check is live rather than merely returning nothing.

### The worker's route to its own work

The worker's load call takes the activity parameter the specification already adds, and its value carries the instance:

```ts
      activity_id: z.string().optional().describe('Optional. The activity you were dispatched for, instance-qualified (`challenge-pass#1`) where the graph runs that activity once per element of a collection. Omit while one activity is in flight; required while several are, and refused when the session is not on the activity you name.'),
```

**Blocker 2 closes with no second discriminator anywhere, and one existing worker rule becomes effective.** The specification declines to strengthen the check a worker makes against its own stub, and says why: a membership test admits every branch of a running fan, so a worker whose prompt names a sibling's activity is served that sibling's body. That stays true of a distinct fan. It becomes false of an instance fan, in the safe direction, because the frontier holds distinct strings — so the response reports the instance-qualified id back, and the worker's own comparison of the id its stub bound against the id it was served now catches a mis-composed prompt. Had the response reported the bare activity id, that comparison would pass for a worker composed for instance zero and served instance two — a wrong answer with a complete-looking audit trail. Composing one string buys that.

Three refusals, verbatim:

```
get_activity: this session is on 'challenge-pass#1', not the 'challenge-pass#2' you were dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.

get_activity: 3 activities are in flight (challenge-pass#0, challenge-pass#1, challenge-pass#2). Pass activity_id naming the one you were dispatched for, activity and instance together.

No activity in flight. Call next_activity first.
```

The prompt composition operation needs no new input: it already requires an activity id among its substitutions for an activity worker, and this changes only the **value** of a substitution it already declares. One clause on that line — instance-qualified where the graph runs that activity over a collection — and its emit step is unchanged.

### How the one value reaches the instance

The shared variable bag is one flat record for the whole session, and writes assign flat entries, so N instances cannot read different values at one bare bag name. The three routes out, priced:

- **Write each unit under its own indexed bag name before dispatch.** Mechanically available at the same single write site the container already occupies, but the read address then carries the index, and the activity body is one file every instance shares. An indexed read is authored, not per-instance. Dead on the grammar proof in §2.
- **Ride the composed prompt.** Forbidden by name: prior-activity context reaches a worker as state, not as prose in the stub, and a fact the worker needs that no variable carries is a missing declaration rather than a licence to inline. It also leaves the activity body unbound — the body's placeholders and gates resolve through the binding precedence, in which the prompt appears nowhere.
- **Hand the instance the collection and its position, and let it project.** Does not run, per the grammar proof.

So: **one bare name whose value differs per instance, delivered as a server-computed projection on the activity-load response.** That response already carries exactly this class of value for exactly this reason. The artifact prefix is there because it is computed from the activity's filename and is not in the raw definition; the routing block is there because the routing a worker is asked to report is unresolvable from the body alone. The fan parameter is the third member of that set — derived server-side, unreachable from the body, needed by one context only. There is already a precedent for a step binding a server-supplied value that is not a bag entry: the artifact-writing operation's prefix input is documented as server-provided and is bound as an ordinary input.

The header gains one block, mirrored on the response metadata:

```
session_index: 3
artifact_prefix: 07
fan_instance:
  variable: challenge_perspective
  instance: 1
  value: rejected-paths
exit_destinations:
  challenged: combine-challenges
```

`value` is the element **whole**, so a structured element reaches the instance as one value and the body projects fields off it by ordinary dotted read — exactly what a loop body already does with its current item. So owner input 1 is honoured precisely: one value at one name, without forbidding structure. No count is reported: it has no structural reader and a worker that reasons about the width is reasoning about something that is not its business.

`workflows/meta/techniques/variable-binding.md` gains one sentence in its input precedence, between the step's own deviations and the bag: an activity the graph runs as one instance of a fan resolves that fan's parameter from the block its own delivery carried.

**One line inside the load handler that must not be missed.** The eager-bundling decision reads the bag as it stands at the moment of delivery. The projection must be overlaid there, or a step gated on the parameter has no answer and stays lazily fetched. Unoverlaid it degrades rather than breaks — a slower fan, not a wrong one.

**Not the session-inspection or status tools.** Both serve one shape to both roles, neither takes an activity or an instance, and the orchestrator must see the un-projected bag because its state for prompt substitutions cannot be per-instance. **The asymmetry, stated rather than hidden:** an instance re-reading the bag through the inspection tool finds the *collection*, not its own element — which is the truth about where the value lives. The projection names itself on the response it arrives with, so the asymmetry is visible rather than silent.

**Nothing writes the parameter.** The reported-values channel stays the only write path a branch has. This design adds a read channel and no write channel.

### Retiring one instance, and the four refusals at the fan enter

The transition call's parameters take the instance dialect and gain nothing:

```ts
      activity_id: z.union([z.string(), z.array(z.string()).min(2), InstanceFanSchema]).describe(
        'Where the run goes next: an activity id, `__terminal__`, or — where the graph fans the exit taken — the destination exactly as the graph names it, which for one activity run over a collection is that object. Returning a branch of a running fan, this is the activity the fan converges on: the server enters it once, when the last branch returns.',
      ),
      from_activity: z.string().optional().describe(
        'The activity this call is exiting — the one `exit`, `step_manifest`, `variables_changed` and `artifacts_produced` belong to, instance-qualified (`challenge-pass#1`) where the graph runs that activity once per element of a collection. Omit while one activity is in flight; required while a fan is running, so the call names which branch returned.',
      ),
```

**The specification's five-step resolution rule needs no amendment.** Its first step — named and in the frontier, that one; named and absent, refuse — is an exact string comparison over a list of distinct strings. That is how the retire step finds the one entry: not by scanning for a matching activity and disambiguating, but because the id it names is unique in the frontier by construction.

Refusal texts, replacing the specification's:

```
Cannot exit 'challenge-pass': the session is on three instances of it. In flight: challenge-pass#0, challenge-pass#1, challenge-pass#2. Pass from_activity naming the instance this call is returning, activity and instance together.

Cannot exit 'challenge-pass#4': the session is not on it. In flight: challenge-pass#1, challenge-pass#2. An instance index comes from the branch list the fan-enter returned; report the mismatch rather than retrying with another index.
```

On the call that **enters** a fan, the server holds the graph and the bag, so it derives everything and refuses before spending anything. Five refusals, each closing a silent failure:

```
Cannot fan 'reconcile-assumptions.converged' to 'challenge-pass': 'challenge_perspectives' holds 24 elements and this destination admits maxInstances: 4. Cap the collection where it is produced — `decompose-work-units` takes `effort_cap` — or raise maxInstances on this destination, knowing each instance costs a whole extra delivery of 'challenge-pass'.

Cannot fan 'reconcile-assumptions.converged' to 'challenge-pass': 'challenge_perspectives' is empty. A fan of no instances would empty the frontier at the moment of entering it, so 'combine-challenges' would be entered with an activity the graph says runs never having run. Route past the fan with a `when` predicate on the exit where there may be nothing to fan.

Cannot fan 'reconcile-assumptions.converged' to 'challenge-pass': 'challenge_perspectives' holds a string, not an array. A fan runs one worker per element, so its collection is an array of work units.

Cannot fan 'reconcile-assumptions.converged' to 'challenge-pass': element 2 of 'challenge_perspectives' is an object with no 'id'. An element's id names its slot in 'challenge_pass_outputs', its row in the gather's dispatch manifest, and its artifact filename, so each element is a slug string or an object carrying a string 'id'.

Cannot fan 'reconcile-assumptions.converged' to 'challenge-pass': elements 1 and 3 of 'challenge_perspectives' both have id 'rejected-paths'. One id per unit: it names one container slot, one manifest row and one artifact filename, so two units sharing one id would overwrite each other in all three.
```

The upstream contract the first message names already exists — the work-unit decomposition operation takes an effort cap, declared at its group level as a positive integer bounding how many workers a pattern may spawn for one invocation. The refusal is what makes that contract enforced rather than merely honoured. **Truncating to the cap is refused**, because it silently drops declared work and would let the meeting point's gather report completeness over a set that was never the collection — the exact false completeness the isolate-then-combine rule exists to prevent. **Successive waves are refused**, because a wave boundary empties the frontier mid-fan, destroying the one property the barrier rests on.

The last refusal is worth its own line: **one refusal closes three collisions** — the artifact filename, the container slot, and the ambiguity in the gather's expectation list — at the single point where the values are in hand.

### `_meta.fan`, and the one operation input that changes

The fan-enter response carries the derivation the orchestrator would otherwise have to compute:

```json
"fan": {
  "activity": "challenge-pass",
  "variable": "challenge_perspective",
  "over": "challenge_perspectives",
  "branches": ["challenge-pass#0", "challenge-pass#1", "challenge-pass#2"]
}
```

**The fan-dispatch operation needs no instance mode, and this design adds no second dispatch operation.** Walk its protocol against an instance fan: publish the in-progress marks once for all branches; enter the fan with one call; mint one identity per branch; compose one prompt per branch; spawn the batch; retire the branches in input order; hand back the destination. Every step is identical. The only thing that changes is what identifies a branch. So its input is renamed to the destination as the graph names it, and steps three through six iterate the branch list the enter call returned — so the orchestrator never computes a width from a collection it would otherwise have to read for that purpose alone. The operation never learns which graph construct produced the branches.

Rules on that operation needing one clause each rather than rewriting: *a branch takes one activity* becomes "a branch carries exactly one activity, and where the graph runs that activity over a collection, exactly one instance of it". *One identity per branch* is unchanged in wording and now load-bearing twice over, since an instance fan's siblings share an activity id and only the identity tells the delivery ledger and the batch bound them apart. *Replace one branch* works **unchanged**.

### How the barrier property survives

Untouched, and the specification's own sentence still reads true verbatim: "There is no separate barrier-met call and no separate join-enter call, so entering the join early is not refused — it is unrepresentable, because the only call that can enter the join is the one that empties the frontier." Retire the resolved entry; remove it; enter the destination if and only if the frontier is then empty. The third instance's return enters the combine activity; the first two enter nothing and are told what is outstanding:

```
_meta.barrier = { destination: "combine-challenges", pending: ["challenge-pass#2"], met: false }
```

A crashed and resumed orchestrator re-derives the same barrier from the session record with no extra state, because the frontier holds slot names rather than worker identities.

**And the free-replacement property survives *because* the entry names the slot rather than the worker.** The specification refuses a worker identity on the entry on the ground that such an identity forces a distinct call outcome for a replacement worker, which its replacement rule gets for free without one: the replacement names the same activity, which the frontier still holds, so it needs no re-binding call. Under an instance-qualified entry the replacement names the same *slot*, which the frontier still holds — the property is preserved exactly, and the replacement rule needs no wording change. Under a base-keyed frontier it would not hold in the way the specification means: an abandoned instance's late report would resolve against "an entry holding this activity" and could retire a different slot, landing one instance's outputs under another's key. The composite converts that into the behaviour the specification's residual already describes — whichever report arrives first retires the branch and the second is refused as holding no open branch — now per instance.

**What changes inside the handler.** The resolved composite becomes the exiting activity, so the exit event, the completed-activities append, the step-completed events and the trace stamp all carry it. The reported-values wrap lands at the branch key, slot index, taken from the entry. The recorded exit field holds the last instance's exit, which is exactly that field's stated meaning after a fan. The usage rule gains one clause naming an instance, and nothing else: its operative unit is what a dispatch covered, and each instance is a separate dispatch with its own harness establishment — one figure for the base id would make the number unattributable and under-report by N−1 establishments.

---

## 6. How instances stay separate

### The container: a dense array, materialised at the fan enter, written positionally

The branch key's derivation is unchanged: an activity's id in snake case with an outputs suffix, derived rather than declared for the specification's three reasons and suffixed for its reason — a variable name is a qualified snake-case phrase of at least two words, so a single-word activity id would otherwise need an exemption entry of its own.

What changes is the shape below it. An instance fan's container holds **one slot per instance, in collection order**, each slot carrying the unit's id and that instance's reported values; a slot no instance filled carries no result.

```
challenge_pass_outputs:
  - { id: "stakeholder-gap",   result: { perspective_findings: [...] } }
  - { id: "rejected-paths",    result: null }
  - { id: "evidence-strength", result: { perspective_findings: [...] } }
```

The index is **uniform** — always present, including slot zero for a distinct-activity fan's single branch. That closes the amendment's open decision in favour of its first option, on the amendment's own ground: with the alternative, a combine activity's read form would depend on the fan's shape, so an activity borrowed into two workflows would need different reads in each, which is the failure the derived key was chosen to avoid.

**Dense, and pre-filled at the fan enter. Getting this wrong corrupts the session record, and that is verified by execution rather than inspection.** A *sparse* array — which is what a positional write at slot two into a fresh empty array produces when instances retire out of order — canonicalises with each hole rendered as an empty string between commas, and reparsing that output fails with an unexpected-token error. That is invalid JSON, sealed and written by the atomic writer, unreadable on reload. An *object with numeric keys* avoids that and loses order, because the canonicaliser sorts keys lexicographically at any depth other than the top, so an eleven-instance fan persists as zero, one, ten, two — breaking the corpus rule that a gathered collection is in work-unit order so the combine step is deterministic. A *dense array* preserves index order through canonicalisation.

So the container is materialised at the fan enter as N slots each carrying its unit's id and no result. That buys four things at once.

1. Order survives the seal, and an out-of-order retirement is a positional write into an existing slot rather than a hole.
2. A slot no instance filled reads as **absent** to both dotted-path evaluators — verified: a not-exists gate is true for an empty slot, true for a member of an empty slot, and true for an out-of-range index; an exists gate is true for a present member.
3. **A second visit to the same fan resets the container rather than appending into the previous visit's slots.** That closes the case the specification names — two fans containing one activity share its branch key — which an index would otherwise make worse, and it states the branch key's semantics positively: a branch key holds one slot per instance the fan entered, in collection order; a slot no instance filled holds no result; entering a fan materialises the container afresh.
4. It is **already the shape the ordered-collection gather declares** for its input: an array of id-and-result pairs in input order, with missing ids appearing with no result. So the meeting point binds that operation with no adaptation.

The pre-fill goes through the existing variable-write path as one call, one event, with a fourth write-source value — a fan enter — so the history distinguishes the server's own materialisation from a worker's report. It assigns the container whole, so it is not a merge, and the specification's rule that the transition call is the only write path a branch has is untouched: the materialisation is not a branch's write.

**Both read walkers handle a numeric segment with no change, verified by execution.** Each splits a literal path and bracket-indexes after a type guard an array satisfies. The gate tokeniser starts an identifier on a letter or underscore and continues on letters, digits, underscores and dots, so a numeric segment is consumed inside the identifier and never reaches the numeric-literal branch. Parsed against the real modules: an indexed comparison parses to one node carrying the full indexed path; the path extractor returns full indexed paths including two-digit indices; evaluation is true at the filled slots and false at the empty one and out of range. And the path extractor feeds the guard's read collector through a head-taking helper, so the guard already resolves an indexed reference to its container.

### The write context, and the one specification decision this changes

The variable-write function in `src/utils/variable-seed.ts` gains one optional context field carrying the branch key, the slot index and the unit's id. Its per-name validation loop runs **unchanged** against the declarations its caller supplies — which is the specification's own decision and load-bearing here: the handler's merged declaration map would leave every member unvalidated, so the members are validated against the retiring branch activity's own declared writes, read at the moment of the wrap. That is what keeps a value set like a three-valued scope enumeration checked. Only the commit changes: instead of assigning a flat entry, one assignment of the whole reported map into the slot's result, with the write event naming the key, the index and the member so the history says which instance a value landed in.

The specification's declaration merge is amended in one word:

> "**The merge adds the container; it does not replace the members.** `mergeActivityVariables` takes the set of activity ids the graph fans in this workflow, and for each one contributes one further declaration — `{ name: branchKey(id), type: 'object', description: '…' }` — **in addition to** that activity's own write declarations."

Adding rather than substituting is preserved exactly, for all three of the reasons given there. **The declared type becomes an array** for an activity the graph runs as an instance fan, and carries no starting value. Three mechanisms make that necessary rather than cosmetic: the merge's contradiction check compares the declared type first, so a wrong type is what a second declaring site would be measured against; the variable-write function warns against anything written at a name whose declared type disagrees; and the rendered variable set is what an author reads before writing an indexed read, so the wrong type would make that rendering lie. No starting value, or the variable-model guard's rule about gating a defaulted variable on existence makes every existence gate on the container constant.

### The artifact decision, resolved

The amendment leaves this open twice — its table's last row, and its closing sentence that same-activity fan-out depends on an artifact-naming decision it does not make. Here is the decision, in two halves, both of which are already authored, working corpus shapes needing no server change, no schema change and no change to the artifact writer.

**The rule: a fan branch declares no artifact.** Per-instance results land in the branch container and the meeting point writes the document. Nothing breaks, because no branch is a writer: the guide map, the audience declaration, the find-or-update discipline, the citation convention and every filename-reading guard see exactly one writer at one filename, which is what they see today. The collision check becomes **vacuous** rather than failing open. And it is the corpus's own isolate-then-combine discipline raised to graph grain — per-instance outputs are never auto-bound into the parent bag by scalar name, which would race and clobber; combination happens exclusively in the combine phase. A per-instance *file* is a per-instance output by another route, and the same rule reaches it.

**Verified against the corpus's strongest shape match: the rule is already satisfied there.** The adversarial-challenge operation declares no artifact at all — it declares an ordered collection of per-perspective findings, isolated until combine, which is a value and not a file. Its combine operation declares four outputs and no artifact either. The file write is a separate step whose own operation declares the assumptions log, and that step stays in the source or the meeting point. **So the amendment's blocking artifact decision does not block the site that motivates the capability.**

**The sanctioned deviation: the unit in the filename.** Where a branch genuinely must persist a document of its own, its artifact name carries the fan's parameter as a token — the parameter itself where the elements are id strings, a dotted projection onto the element's id where they are objects — and the filename gains one row in the producing workflow's guide map, spelled with the token verbatim. The mechanism exists and is sanctioned in all three places that would otherwise reject it: the artifact-name pattern admits token placeholders wherever literal text would stand, and its rejection message says so; the anti-pattern catalogue's filename entry explicitly does not flag a token template whose placeholder resolves at run time, calling a placeholder standing where literal text would part of the name rather than prose; and the artifact writer already declares the semantics that make it *safe* — token-templated names are an intentional series, each interpolated name its own logical artifact, created and not matched against siblings. So the find-or-update keyed on a bare filename never sees two instances as one artifact, and the mint-attempt guard is not asked to arbitrate a race it cannot win. That is what removes the specification's safety-floor data-loss case at its source rather than detecting it. Guide resolution takes the declared string, template included, matching by exact string after splitting the filename column on commas and stripping backticks.

**Two live precedents, green today, and they are the strongest single piece of evidence in this document.** The substrate node security audit declares a per-agent JSON artifact whose name is a token on the agent designator, with an agent audience, guide-mapped in its own resources README. The continuous-integration pipeline audit declares the same shape on a scanner designator, guide-mapped in its own README. Both pass the audience guard and the artifact-guide guard as they stand. The work-package workflow carries four more token-templated guide rows. So the deviation ships with live precedents and no new machinery — and, because the fan's parameter is authored, both of those templates and both of those guide rows migrate **untouched**.

**Two alternatives refused rather than merely not chosen.** A per-instance subfolder is refused twice over: the artifact-name pattern admits no path separator and its message says an artifact name is a single filename of one path segment, so a subfolder is not expressible in the declaration at all; and the conduct rule for artifact location forbids composing or reconstructing the planning-folder path. Beyond the rules, three surfaces break — the link audit enumerates the folder's markdown files, a Progress row's link targets the minted bare filename and a seeded link cannot predict a subfolder segment, and the publish-before-linking discipline then publishes links into a shape the seed did not anticipate. A single file the instances append to under a lock is refused too: there is no lock primitive anywhere in the corpus, the nearest thing being optimistic retry before every push, so a lock means inventing one at the very layer the prerequisite rejects a lock; and it contradicts the writer's whole-file find-or-update, since the write is a full rewrite from a value the branch holds, so two branches serialised by a lock still lose the first's content unless each re-reads inside the critical section, which no operation does. That is the prohibition-adding shape the canon's *prefer removing the thing that needs a prohibition* names, inverted.

**Progress rows.** The fanned activity keeps its single row; instance artifacts get none; the meeting point's artifact is what the row links. Three reasons this is the answer rather than a shortfall: row ownership is keyed by the activity's two-digit prefix with item labels authored in the workflow's readme seed, and a runtime-sized instance set cannot be seeded into it; a row absent from the map is unselectable, so an unseeded instance row would be inert anyway; and the precedent is already stated — an agent-audience artifact gets no row, while the activity producing it still owns one. This is also what makes the specification's planning-readme amendment satisfiable rather than merely stated: one row and one link slot per fanned activity, so no two instances contend for a cell.

**Two named failure modes, one per half of the decision.** The rule's: the meeting point becomes the context bottleneck. It takes a fresh delivery scope and re-pays whatever the branches collectively held, and a wide fan of document-shaped instances hands it every instance's payload to write one document — the failure being a silently truncated or elided document, because no refusal fires (the batch bound exempts a scope with no activity yet, and the writer validates nothing about completeness). The author's declared ceiling is what stands against it. The deviation's: a templated instance artifact is never updated in place, so a second visit to the same fan re-resolves the same template and creates rather than updates.

### The guard changes

Two files, and the split is the specification's: the shared analysis module, so the server and the guards cannot drift, and the corpus check script.

**The read side strips two segments past the head.** A dotted read whose head is a fan container is tested by dropping a leading all-digits segment and then a literal result segment, then comparing the remainder to the member set. That refines the amendment's row, which says the member test moves one segment right and skips a numeric segment — correct in direction, two segments rather than one, because the container's slot carries an id beside the result.

**The write side is index-free.** For a fanned activity the declared-write set becomes the container plus one entry per member spelled as the container and the member — and *not* with an index, because the width is a run-time value and a static check cannot enumerate instances.

**Three diagnostics under existing family names.** An unwritten read at member grain, reading past the index and the result segment. An unread write at member grain, **carrying forward the self-consumed exemption the reader collector already gives** — without it the family fires on the order of thirty-five times on one correct fan, because most of a branch's declared writes are working values it consumes itself. And the amendment's one new diagnostic: a read that omits the index is reported, naming the instance form, because with a uniform index a bare container-and-member read addresses nothing and the flat walker would never find it.

**The fan's collection acquires a reader that is not an activity, and this is a genuinely valuable new check.** A fan's collection is read by the *graph*. So the guard contributes the head of that collection expression as a synthetic read attributed to the **branch** activity, never the source — and the placement matters, because the availability lattice computes an activity's outgoing name set as its incoming set plus its own writes, and the finding tests a read against the *incoming* set. The source may write the collection itself, which is the flagship shape (the work-unit decomposition operation emits its units in the source activity, whose exit then fans), so attributing the read to the source reports falsely on a correct fan. Attributed to the branch, the incoming set is the intersection over arrivals and the source's arrival contributes its writes — which is exactly the wanted claim: **the collection must be available on entry to the branch.** So a fan entered on a path where its collection was never written is now reported statically, which is unproduced-value-read at graph grain, and a fan over a collection nothing writes is reported too. Without it, the run-time fan-enter refusal is the only detector and it fires on a live session.

**The synthetic read needs three injections, not two.** The reachability map and the unwritten-read loop both iterate the activity's declared reads, so the name must enter that set. But the unused-declaration check then tests every declared read against the reads the activity's own steps, gates, loops and transitions mention — and none of them mentions the fan's collection, because the graph reads it. Injecting into declared reads alone therefore produces a spurious finding on every fanned activity, in a hard-zero guard. So the synthetic read enters the derived-reads set as well, or synthetic graph-contributed reads are exempted from unused-declaration explicitly. A fixture proves a correct instance fan produces zero findings, including no unused declaration on the branch.

**The parameter is ambient to its branch, threaded per activity.** The set of ambient names the guard already skips is global and is seeded flat into the availability lattice, so a per-activity ambience needs a per-activity map threaded through three consumers — the unwritten-read skip, the undeclared-crossing skip and the availability seed — plus one parameter on the reachability function. That function is already being changed to take the fan groups, so the parameter lands in the same edit at no extra file cost. Two fixtures: the branch's own read of the parameter is **not** reported; a non-branch activity's read of it **is**.

**The artifact check gains its instance arm, under the existing family name**, so no new registry entry and the safety-floor status is unchanged for the reason the specification gives: two concurrent branches both re-scan, both create, and the run thereafter resolves the lowest-numbered instance for the rest of the walk — data loss, not hygiene. Detect: for an activity an instance fan runs, every artifact name on every composed step signature must contain a token whose head is that fan's parameter. Decidable from what the guard already reads, plus the graph object. It lives in the guard rather than the loader for the specification's stated home split: it needs composed technique signatures, which the loader does not compose and must not start composing on the per-call load path.

```
Activity 'submodule-scan' is fanned by 'reconnaissance.classified' over 'scan_units' and writes
artifact 'scan-findings.json'. Every instance resolves that one filename to one file, so either the
name carries the unit — '{scan_unit}-scan-findings.json' — or the branch declares no artifact and
the activity the fan converges on writes the document.
```

The message states both arms, because both are legal and the author chooses.

**New family names: zero.** The registry stays at 36 entries — 32 corpus-scope and 4 repo-scope — and the variables entry's stated claim is not stretched beyond what the specification already authorised.

### The reachability analysis: trivial for instances, with two traps

The specification's change is to intersect over *arrivals* rather than predecessors, a completed fan being one arrival contributing the union of its branches' outgoing sets. Instances are trivial there, for three verified reasons.

1. **The walk's graph collapses a fan of N identical instances to one node.** The graph builder already de-duplicates its destination list, and the one-line flatten must be written so the de-duplication happens **after** flattening. An instance fan's target list is one activity, so the forward search, the predecessor index, the cycle pass and the re-entry family all see exactly the graph one visit would produce. **An instance fan creates no cycle.**
2. **The union arrival is idempotent over instances.** For N instances of one activity the union over branches of their outgoing sets is one branch's outgoing set. The intersection's behaviour for an instance fan is indistinguishable from a plain sequential edge and does not depend on the width in any way.
3. **The set of names a fan makes available is width-independent** — the property the specification already identifies as what the namespacing buys: a branch contributes exactly one flat bag name whatever object landed under it. The index lives inside the value, so the lattice does not grow, termination is unaffected, and **an unbounded run-time width cannot break the walk because the walk never sees a count.**

Two traps specific to a repeated destination, each of which would make the change do nothing. The arrival split must remove **all** duplicate predecessor entries, because the predecessor index pushes a source once per entry of its target list — so an un-deduplicated flatten pushes the source N times, and missing any one entry lets the intersection wipe the union straight back out, which is the first of the three ways the specification says the change can be applied and have no effect. De-duplicating inside the graph builder is trap-free by construction and is the recommendation. And the arrival must be built over distinct branch ids: the union is idempotent so a naive iteration is harmless for correctness, but any per-branch bookkeeping keyed on the activity is written N times over one slot, and a diagnostic naming the arrival's contributors names one activity N times.

**What the analysis cannot see, answered rather than checked.** The lattice proves a read is satisfied on every arrival at **container** grain. Whether slot *k* was filled is a run-time question: the load can compare an authored index against the declared ceiling (rule L13, below), and nothing proves the collection was that long. So the positive answer is that a meeting point does not author indices at all, and that becomes a rule in the scatter-gather technique where the specification already amends:

> `a-join-gathers-the-container-not-an-index` — A join reads a fan's container whole and hands it to `orchestration-patterns::gather-results` with the fan's own collection as `expected_ids`. The container's order carries the correspondence the join needs, and the gather's manifest names each unit by its id.

**One other graph reader, unchanged in kind by instances.** The review-mode gating check declares the graph's shape itself and parses raw YAML, so the fan rules cannot protect it: it imports the destination type and flattens every form. Unflattened, its activity lookup on an object is undefined and every activity beyond a fan drops out of its reachability set.

### The meeting point, and the operation that finally has a caller

A distinct fan's meeting point spells N literal reads because N is authored. An instance fan's width is a run-time collection length, and there is no indirection in the placeholder grammar and no dialect anywhere expressing "for each member of this container". **So the meeting point cannot spell its reads and must hand the whole container to an operation that walks it.** That operation exists, declares the contract exactly, and has never had an executing caller, because every one of its callers' dispatch halves is unreachable:

```yaml
      - kind: technique
        id: gather-perspective-findings
        technique:
          name: orchestration-patterns::gather-results
          inputs:
            dispatched_results: challenge_pass_outputs
            expected_ids: challenge_perspectives
      - kind: technique
        id: combine-challenges
        technique:
          name: analyse-challenge::combine
          inputs:
            challenge_findings: "{gathered_results.items}"
            concern_document: assumptions_log
          outputs:
            concern_document: assumptions_log
            concerns_agent_resolvable: has_resolvable_assumptions
            residual_opens_remain: has_open_assumptions
            residual_opens: open_assumptions
```

Two renames and one dotted projection — the three sanctioned deviation forms, no new construct, no new operation.

- **The expectation list binds the fan's own collection, unchanged.** Its declaration already reads that each entry is either a string id or an object carrying an id field, and that objects contribute their id. The fan's collection **is** that list by construction. So **no derived bag name carries the expectation list to the meeting point** — the graph names the collection, the meeting point reads the collection, one home. This design adds no derived bag name beyond the branch key the specification already derives.
- **The results input binds the container with the operation's declared shape satisfied**, which is why a slot carries an id beside the result. The operation's own step indexes by id; an unfilled slot has an id and no result, so its expected id surfaces as missing with no result — precisely what the operation documents. One sentence on that input admits a fan's branch container beside a dispatch step's output; nothing else in the operation moves. Binding a second, near-identical gather would be duplicate shared capability against the rule that already forbids it — one gather contract, two scatter modes, which the specification already extends with the graph fan as a third.
- **Order is preserved by construction**, the slot being the collection's own position.
- **The manifest has one live reading**: an instance that returned with no writes lands an empty result and is marked empty — real, and particularly worth having for a replaced instance.
- **Completeness is structurally constant at the meeting point, and the specification should say so** rather than advertise a detection it cannot make. The destination is entered only on the call that empties the frontier, so no expected id can be missing there. The specification already states the consequence: the gather either has every key it names or it does not run.

The work-unit decomposition operation also gains a caller, unchanged, at the fan's **source**: its units are id-and-brief records with a stable slug id, which is exactly a fan's collection, and its effort cap is the authored upstream half of the width bound. The worker-brief composition operation is **displaced** at this layer rather than served: it builds a per-unit prompt carrying the unit's brief, and under a graph fan the prompt is the standard composition's, where putting the work in the prompt is what the state-not-prose rule forbids. It survives only for in-activity fan-out.

### The serialising side effects, and what they constrain

The timing fact that decides all of them: **a branch worker writes its files during its own run, inside the concurrent turn, before any transition.** The fan-dispatch operation spawns the batch and then retires the branches in input order, so the *retires* are serialised and the *writes* are not. Persisting the fan before any branch returns answers the commit, not the write.

1. **One feature worktree, one git index — and this is the one hazard that fails hard rather than silently, so it becomes a load rule.** The worktree operation materialises one working tree per session at a single session variable's path. Git serialises index mutation with its own lock file, so two concurrent staging commands do not corrupt the index — the second dies saying it cannot create the lock. The commit operation retries a failed *push* once; nothing retries a failed staging, so a lock collision surfaces inside a branch as an unhandled command failure. And even fully serialised the attribution is wrong: the commit operation derives its paths from the working tree's status, which cannot attribute a change to a branch. For instances the specification's residual is strictly *worse*, because its fallback of attributing by activity id is unavailable — N instances share one id. The corpus has no serialisation primitive to reach for; its nearest analogue is optimistic rebase-and-retry against sibling sessions racing on one engineering branch. So: **a fanned activity binds no operation of the git or version-control groups and does not bind the commit-and-persist operation.** Decidable from the flattened step list plus each step's bound operation name, with no composed signatures, so it is a **load rule** rather than a guard finding — which also keeps the variables guard's registry claim honest.
2. **Two shared unprefixed registers — a criterion, not a rule.** The deferred-item and follow-up register operations declare literal, unprefixed filenames by their group's own rule (a register is created when its first row arrives, so any activity may create it and neither carries an activity's prefix), and each write is a read-modify-write of the whole file. Two instances write the same path and one instance's rows vanish with no trace. Not hypothetical: the assumptions-review, strategic-review and post-implementation-review activities bind these today.
3. **The provenance log's completion-order contract — a criterion.** Its row-appending operation declares one file and appends one row per completed task, and the guide's own rule is append-only in completion order. Concurrent appends lose rows, and even serialised the order becomes the nondeterministic order N instances happened to finish in, which is a property a reader compares rows against. Bound at the implement activity today.
4. **The Progress table — answered by existing rules plus one row consequence.** Two instances share one activity prefix, so the status-sync operation's row selection resolves to the *same* rows. Two in-progress marks on one row are idempotent; two completion marks are not, because the completion step repoints the item's link at the delivered artifact and N instances landing N files fight over one link slot. The specification's existing rules suffice — one commit of all marks before the spawn, one persist at convergence, the not-applicable marker being one value per persist — with the row consequence from the artifact decision added.
5. **The artifact writer** — removed at source by the artifact decision rather than detected.

Items 2 and 3 stay criteria and are deliberately **not** mechanised. Prose warning "do not also bind X" is what the canon's *prefer removing the thing that needs a prohibition* tells you to design out, and the removal here is upstream: the activity that writes a shared register is not the one you fan. A guard policing it would enforce a judgement an author makes once at design time.

### What a fannable activity is: nine conditions

1. **Gate-free** — no decision checkpoint anywhere in its flattened steps, fragment references included.
2. **Not self-routing** — no exit of it binds back to it.
3. **At least one exit, and every exit binding to one destination.** For an instance fan the cross-branch half of that is free — every branch is the same activity, so its exit bindings trivially agree — and this is the single largest simplification instances buy over the distinct form, where convergence is *the* binding constraint. What survives is that an activity with no exits at all cannot be a branch.
4. **Artifact-safe** — declares no artifact, or every artifact name is templated on the fan's parameter and carries a guide-map row.
5. **Touches no checkout** — now a load rule.
6. **Writes no shared unprefixed register and no append-ordered log.**
7. **No bare downstream reader** — every declared write of it is read only through its branch key by the meeting point, because namespacing removes it from every bare write set.
8. **Its per-instance parameter is one value.**
9. **Its collection is written on every path reaching the fan's source** — now proved statically by the synthetic read.

Measured against condition 1 alone: of the 15 work-package activities, the counts of declared checkpoint steps are start-work-package 10, submit-for-review 7, research 4, post-implementation review 4, design-philosophy 3, requirements-elicitation 3, assumptions-review 3, strategic-review 3, implement 3, implementation-analysis 2, lean-coding-audit 2, plan-prepare 1, complete 1, codebase-comprehension 1, and **validate 0** — the only gate-free one, and it is a sequential verification pass with nothing to scatter over. Corpus-wide, 66 of 122 activity files declare no checkpoint. **So no existing activity is fannable as it stands, and every adopter is a carved activity** — which is materially *cheaper* than the adoption the specification prices, because a carved branch satisfies the gate ban by construction and no gate has to be removed, so none of the non-destructive-update burden or the decision-inventory diff transfers.

---

## 7. What is enforced, and where

**Schema** is carried by the zod type and surfaces as a parse error. **Load** is a failure from the exit-binding validator, which runs after fragment materialisation and the variable merge and fails the load on a non-empty return. **Tool** is a server refusal at the boundary. **Derived** means unrepresentable, so nothing needs checking. **Guard** is a hard-zero finding inside the existing variables registry entry. **Not structural** rows are contracts an actor honours, listed so no reader mistakes them for enforcement.

| # | Invariant | Where | What it reports |
|---|---|---|---|
| I1 | A destination is an activity id, a list of at least two, or the four-field fan object | schema | The union error-map message, for a number, a non-string list member, a nested list, a partial object and an object with an unknown key |
| I2 | A fan admits at least two instances | schema | The `maxInstances` field message. Carries the specification's own reasoning: a ceiling of one is a plain edge spelled twice |
| I3 | A fan's parameter is a legal variable name | schema | The qualified-name message, so a bare-word parameter fails the parse and no load rule is needed for it |
| I4 | A fan carries no field outside its four | schema | Strict-object rejection, and `additionalProperties: false` in the generated JSON — which is what tells an author the output key is derived |
| I5 | The fanned activity exists in this workflow | load | L1, over the flattening helper |
| I6 | A **list** destination names no activity twice | load | **L2, re-aimed rather than withdrawn**: `Workflow graph fans 'reconcile-assumptions.converged' to 'challenge-pass' twice. A list destination runs each of its activities once; to run one activity once per work unit, name the activity with the collection it runs over — { activity: challenge-pass, over: <collection>, variable: <name>, maxInstances: <ceiling> }.` |
| I7 | The fanned activity is not the terminal sentinel | load | L3 |
| I8 | The fanned activity binds at least one exit | load | L4 |
| I9 | The fanned activity's own exits do not fan again, in either form | load | L5, widened — also rejects a fan whose branch is its own source |
| I10 | The fanned activity routes no exit back onto itself | load | L6 — also rejects a meeting point that is its own branch |
| I11 | Every exit of the fanned activity names one and the same destination | load | L7, unchanged. Its cross-branch half is vacuous for an instance fan; its multi-exit half still bites |
| I12 | The meeting point is an activity, not the sentinel | load | L8 |
| I13 | The fanned activity declares no decision gate | load | L9, with one clause replacing one of its three remedies: `… Move the gate to the activity before the fan or to the activity it converges on. Every instance of a fanned activity runs the same definition, so there is no instance to take out of the fan.` The check itself is already instance-safe: it walks the flattened steps post-materialisation and keys on the branch activity, so testing it once is necessary and sufficient |
| I14 | The branch key is a legal, unique variable name | load | L10, unchanged |
| I15 | The fanned activity declares the fan's parameter among its reads | load | **L11** — `Workflow graph fans 'reconcile-assumptions.converged' to 'challenge-pass' over 'challenge_perspectives', handing each instance its element at 'challenge_perspective', which 'challenge-pass' does not declare among the names it needs its workflow to supply.` Two fans of one activity disagreeing about the name fail here, so no separate cross-fan rule exists |
| I16 | The fan's collection head is a name this workflow's merged variable set contains | load | **L12** — `… over 'challenge_perspectives', which this workflow declares nowhere. A fan reads its collection out of the variable bag, so the collection is a variable some activity in this graph writes.` Checked at the head, so a dotted collection expression is checked correctly |
| I17 | An authored index into a fan's container is below that fan's ceiling | load | **L13** — `Activity 'combine-challenges' reads 'challenge_pass_outputs.7.result.perspective_findings'. The fan at 'reconcile-assumptions.converged' admits maxInstances: 4, so slot 7 is never filled. Hand the container whole to a gather rather than addressing a slot the fan cannot reach.` One-sided, so it cannot report falsely; see the residual beside it |
| I18 | A fanned activity mutates no checkout | load | **L14** — `Activity 'challenge-pass' is fanned by 'reconcile-assumptions.converged' and binds 'workflow-engine::commit-and-persist'. A fan's instances share one working tree and one git index, and a commit derives its paths from that tree's status, so no instance can stage or attribute its own change. Move the commit to the activity before the fan or to the activity it converges on.` Decidable from the flattened steps and each step's bound operation name, with no composed signatures |
| I19 | A fan's collection is a non-empty array of at most the declared width whose elements carry distinct derivable ids | tool | The five fan-enter refusals. The last closes three collisions at once — the artifact filename, the container slot and the expectation list |
| I20 | A call exits an instance the session is actually on | tool | The two branch-return refusals. Subsumes the second-advance hazard the one-advance rule names |
| I21 | A worker is served the instance it was dispatched for, never guessed at | tool | The three load-call refusals. The membership test stops being vacuous because the frontier holds distinct strings — and the response reports the instance-qualified id back, which is what makes the worker's own stub comparison effective |
| I22 | **The meeting point is entered once, after the last instance returns** | derived | Nothing to report. The rule is unamended: the only call that can enter it is the one that empties the frontier |
| I23 | **No instance writes into another instance's slot** | derived | Nothing to report. The slot is the container at the resolved entry's index, and the wrap is server-side from the graph the handler already loaded |
| I24 | A slot no instance filled is legible as absent | derived | The pre-fill lands the id with no result, and both dotted-path evaluators answer absent for an empty slot, a member of one, and an out-of-range index — verified by execution |
| I25 | The container's order is the collection's order | derived | A dense array, pre-filled in collection order, positionally written. Verified: the canonicaliser preserves array order at every depth, an object with numeric keys sorts lexicographically below the top level, and a sparsely written array canonicalises to invalid JSON |
| I26 | A second entry of the same fan does not append into the previous entry's slots | derived | The materialisation replaces the container whole |
| I27 | **A fan's width is not bounded by the batch bound** — stated so no reader wonders | derived | The batch state exempts a scope with no activity yet and refuses only an activity the scope already holds. An instance scope is fresh and asks for its first activity, so it is admitted whatever the width, and on the retire call the batch reading reports one activity. The declared ceiling is the whole bound |
| I28 | Every member of an instance's reported map matches its declared type and value set | tool, warn-only | Today's wording unchanged, validated against the branch activity's own declared writes read at the wrap, so a three-valued scope enumeration keeps its warning. The per-name loop runs unchanged; only the commit changes |
| I29 | The container is declared as what it holds | load (merge) | The merge contributes an array-typed declaration with no starting value. A wrong type is what a second declaring site would be measured against, would warn on any write at the container name, and would make the rendered variable set lie to the author writing an indexed read |
| I30 | Nothing reads an instance's output by its bare name | guard | Unwritten read: the bare member is written by nothing once the write side is re-keyed |
| I31 | Every member a gather names is one its branch produces | guard | Unwritten read at member grain, reading past the index and the result segment |
| I32 | Every member a branch produces is gathered somewhere | guard | Unread write at member grain, with the self-consumed exemption carried forward |
| I33 | A read that omits the index is reported | guard | The amendment's one new diagnostic, under unwritten read, naming the instance form |
| I34 | A read at the meeting point is satisfied on every arrival | guard | Unreachable read with the specification's arrival intersection. Instance-trivial: one graph node, an idempotent union, a width-independent lattice |
| I35 | A fan entered on a path where its collection was never written is reported | guard | Unreachable read, from the synthetic collection read attributed to the **branch** — `'challenge-pass' is fanned over 'challenge_perspectives' on a path that reaches the fan before anything writes it` |
| I36 | A fan over a collection nothing writes is reported | guard | Unwritten read at fan grain, from the same synthetic read |
| I37 | The fan's parameter is read only by the activity the fan runs | guard | Unwritten read with a fan-specific detail string, from the per-activity ambient model. **No new family name** |
| I38 | No instance of a fan writes an artifact another instance also writes | guard | The collision family's **instance arm** — every artifact name on the fanned activity's composed signatures interpolates the fan's parameter. **Safety floor**, and it decides the instance case rather than failing open on it |
| I39 | A gate reachable only through a fan is still audited for a review-mode auto-advance | guard | Unchanged from the specification; without the flatten the whole subtree beyond a fan drops out |
| I40 | Each instance runs under its own identity | fan-dispatch rule | **Not structural**, unchanged, and load-bearing twice over: an instance fan's siblings share an activity id, so only the identity tells the delivery ledger and the batch bound them apart |
| I41 | Every instance carries exactly one usage figure | usage rule | **Not structural.** An instance with no figure appears in the activities-with-no-usage list, correctly, because both sides of that diff carry the composite |
| I42 | An instance writes no shared unprefixed register and no append-ordered log | fannability criteria | **Not structural, and deliberately not mechanised.** Both surfaces lose data silently under concurrency, and neither is a rule to police — it is a criterion for which activity you fan |
| I43 | A meeting point gathers the container rather than naming a slot | scatter-gather rule | **Not structural** beyond L13's one-sided half, and it cannot be: the ceiling is authored and the width is a run-time length |
| I44 | A worker executes the instance it was dispatched for | worker rule | **Effective for an instance fan**, unlike the distinct form, because the response reports the instance-qualified id. See I21 |

**Base rules that change:** L2 (re-aimed at the list spelling, with its message pointing at the object form — which is the point of this design and the one place the amendment's "the rule is withdrawn" is corrected: the *capability* arrives, the *list* spelling stays closed, because a repeated literal carries no data and cannot produce differing work), L5 and L9 and L10 (one clause or one message each), the container declaration's type, the member-grain read test, and the destination flatten's placement.

**Base rules that hold unchanged:** L1, L3, L4, L6, L7, L8; the frontier declaration and its resolver; the five-step exit resolution; the barrier's unrepresentability; the yield refusal and the child-dispatch refusal (both keyed on the frontier being non-singleton, which an instance fan satisfies); the exit being mandatory on a fan enter; entering a fan retiring its source once; at most one fan open; a branch not taking a second activity; and the requirement that the fan rules have exactly one home.

---

## 8. The prerequisite

Issue #655, and what this design needs from it is the specification's requirement unchanged in form: **all the appends must survive, through a compare-and-swap on the record's sequence number with retry, not a per-session write lock.** Instances make both halves stronger.

*All the appends must survive.* N instances of one activity append history events whose activity field is identical up to the instance segment, and their transition calls arrive within the same turn. A last-writer-wins loss of one instance's exit event leaves a session whose frontier still holds that entry, whose container still holds an empty slot, and whose history looks exactly like a correct run of one fewer instance — where a distinct fan's loss at least leaves a gap under a nameable activity.

*Compare-and-swap rather than a lock.* An instance fan's per-branch payload is the **same** activity's payload N times over. A lock serialises N compositions of one roughly-ninety-thousand-character delivery behind one another, and wall clock is the only thing a fan buys. The specification's own sentence is exact: a lock would erode the only benefit a fan buys.

Stage 5 below is gated on it and is the only stage that is.

---

## 9. Staged plan

Seven stages, each an **extension of the same-numbered specification stage** rather than a parallel track, so the two land as one sequence and no stage of either is bypassed. The specification's spanning rule extends with them: for the duration of stages 1 to 5 the exit-binding validator rejects any list *or* object destination outright with a message naming the stage that lands the runner — one line, deleted by stage 6, which is what makes every intermediate stage's zero-corpus-movement criterion provable, because the corpus cannot carry a fan at all.

### Stage 1 — the schema and the load rules (extends stage 1)

`src/schema/workflow.schema.ts`: the fan schema, the three-member union with both messages and the error map, the widened graph description, and the flattening, fan-test, fan-extraction and branch-key helpers. `src/loaders/workflow-loader.ts`: the instance separator generalised with its base and index helpers, the checkpoint base helper retired at its three call sites and one test import, the base fallback in the activity lookup, the base lookup in the exit-bindings reader, the fan-group helpers widened to carry the instance form (still reading the graph object and nothing else), the widened binding record, the flattening reachable-activities helper, the widened destination-existence loop, and L1 through L14 with L2, L5, L9 re-worded. `npm run build:schemas` and `npm run build:site`, both committed. `tests/workflow-loader.test.ts`: one case per rule, plus a well-formed fan accepted, plus the binding record carrying an object, plus the base helpers over both populations.

*Acceptance.* Everything green with **zero corpus movement** — 17 workflows, 109 activities, 207 edges, 0 list-valued, 0 object-valued, so a union accepts every existing string and every fan rule is vacuous. The regenerated JSON carries the three-member alternative with the minimum-two array, the strict object and its four required properties; the generated-schemas test stays green. Each of L1–L14 fails the load with its stated message against a fixture, and the union's seven authored-form cases render the probed messages.

*Guard obligations.* The workflow-YAML validator re-runs first, since the schema widens; the reference, audience, artifact-guide, stealth-isolation and variables guards all load workflows and inherit the result. **Note and fix in this stage: `session-contract` is not a registered guard.** A check script for it exists on disk with no registry entry and no package script, which is the fourth instance of exactly the class the registry's own header says it fixed for three other scripts. Either register it with a proves line as a 37th entry or delete it, in its own commit — so that this design's claim that the registry stays at 36 means what it says.

### Stage 2 — every graph reader made instance-aware (extends stage 2)

`src/utils/activity-variables.ts`: the graph builder's flatten written so the de-duplication happens after flattening — the trap-free placement. `scripts/check-review-mode-gating.ts`: the destination type imported and every form flattened. `tests/e2e/walker.ts` and `scripts/smoke/smoke-orchestrator.ts`: the type imported rather than re-declared, and a fan-bound exit yielding N branch visits from a seeded collection, the walk entering each instance and then the meeting point once. `src/utils/validation.ts`: the reported-exit validator satisfied when the requested activity is among the destination's targets and compared set-wise on a fan enter; the transition validator flattened; the activity-manifest validator's membership test base-normalised; the step-manifest validator resolving through the base fallback. `src/tools/workflow-tools.ts`: the routing header and metadata map projecting a fanning exit as a **list** — its members for a list fan, the one fanned activity for an instance fan — the checkpoint consequence, the exit payload, and the immediate-exit message template, none of which the compiler catches because an array stringifies happily.

*Acceptance.* No corpus movement. A fixture fan walks end to end. No rendered message anywhere interpolates a destination directly. One test per stale reader from §5, with the two silent-disable readers proved live rather than returning nothing.

**The envelope decision, stated here because it is this stage's contract.** The instance fan adds **no new envelope field and no new drive-loop gate**, and the specification's plural destinations field is **preserved**. The routing header renders a string for a plain exit and a list for any fanning exit, so list-ness *is* the fan signal and the width is never the worker's business. The plural field gains one clause: for an instance fan it holds the one activity the fan runs, so the field's presence is the fan signal and the width stays the server's to expand from the collection. The transition tool's parameters and the drive loop's advance-to-fan gate and branch control name are untouched. The fan-dispatch operation's enter step gains one sentence: it names the destination as the graph names it — the sole member where the destination is one activity, the whole list otherwise — so the list parameter never sees a one-element list.

A boolean "this exit fans" field was considered and **declined**: it is a projection of another declared value's shape, which the catalogue names by name for a parallel boolean projection of a mode, and it would make the drive loop's branch control name a boolean asserting a collection.

**The wart, named.** The graph forbids a one-element list, and this header renders one. The two surfaces differ for a stateable reason — the graph's spelling must be unique because an author writes it, while the header's list-ness is a derived signal carrying no width — and the load tool's description says the block is derived and that list-ness is the fan signal, so a reader who knows the graph rule does not read the header as authorable.

### Stage 3 — the arrival intersection (folds into stage 3)

No new code beyond the specification's. What this extension adds is **two fixtures, and it deliberately cuts a third.** Kept: the arrival split removes *all* duplicate predecessor entries; and a fan whose collection is written on only one path reaching it produces an unreachable read. Cut: the fixture proving an instance fan's intersection is indistinguishable from a plain edge — that is what the proof in §6 establishes, and the graph builder's de-duplication placement is what makes it structural.

*Acceptance.* Corpus guard output byte-identical. The fixed point terminates on a fan of eleven. A fan entered before its collection is written **is** reported; a fan whose source writes the collection is **not**.

### Stage 4 — the indexed container, statically (extends stage 4)

`src/utils/activity-variables.ts`: the container declaration contributed as an array with no starting value; the single-grammar read function; the branch-key re-keying of productions and of the landing site; the synthetic collection read attributed to the branch and injected into **both** the declared-read set and the derived-read set; the per-activity ambient map. `scripts/check-activity-variables.ts`: the index-free declared-write re-keying, the member-grain read test stripping a leading all-digits segment and the literal result segment, the three diagnostics under existing family names with the self-consumed exemption, the fan-parameter detail string, and the collision family's instance arm. `workflows/meta/techniques/variable-binding.md`: the branch-scoped indexed landing, the derivation rule, and the projection's place in the input precedence. `workflows/meta/techniques/scatter-gather.md`: the graph-fan application of isolate-then-combine, the third scatter mode over one gather contract, and the gather-the-container rule.

*Acceptance.* Corpus guard output byte-identical. On fixtures: one correct instance fan with a gather-bound meeting point produces **zero** findings, including no unused declaration on the branch; a gather naming a member no branch produces is reported once; an ungathered member once; a bare read of a fanned output once; a read omitting the index once; a fanned activity writing a literal artifact name once; a fanned activity whose template carries the parameter **not** reported; the parameter read by a non-branch activity reported once; the branch's own read of it **not** reported; a branch that writes a working value and reads it back within its own steps **not** reported. The binding-fidelity, variable-model and anchor guards join the acceptance set.

### Stage 5 — the runner. **Gated on #655 before it is enabled on a real run.**

`src/tools/workflow-tools.ts`: the instance-qualified values on the two existing parameters with their descriptions; the three load-call refusals and the two branch-return refusals; the fan-enter's collection read, five refusals, id derivation, dense materialisation through the variable-write path with the fan-enter write source, and the fan metadata; the per-instance barrier reading; the projection block in the load header and in the response metadata, overlaid onto the bag reading the eager-bundling decision uses; the indexed wrap in the mutator; the composite on the exit, entry, step-completed, variable-set and trace events; the frontier rendering on the status, identity, activity and inspection projections. `src/utils/variable-seed.ts`: the write context carrying the key, index and id, the slot commit, the event name, the fourth write source.

*Acceptance.* The whole existing unit and end-to-end suite green with a one-entry frontier — every ordinary session takes the identical path and no test is rewritten for behaviour. A session recorded before this stage migrates and resumes. One test per row I19 to I28: each of the five fan-enter refusals; both branch-return refusals; all three load-call refusals; a three-instance fan executing end to end against real sessions under three distinct identities; the container landing dense and in collection order with an indexed read resolving through it; an instance that never returns leaving an empty slot both evaluators read as absent; a second entry of the same fan **resetting** the container; a member disagreeing with its declaration warning with today's wording; three usage figures for a three-instance fan, and one missing figure reported.

### Stage 6 — the definitions that make an instance fan execute (extends stage 6)

The fan-dispatch operation's input renamed to the destination as the graph names it, with its steps iterating the branch list the enter call returned; the branch-takes-one-activity rule's clause; the state-not-prose rule added to its citations; and its identity, replacement, liveness, gate and persistence rules unchanged in wording. The prompt-composition operation's activity-id substitution gaining the instance-qualified clause. The usage rule's instance clause. The planning-readme's row consequence. The artifact writer's series carve-out stated as the invariant that makes a per-instance template safe. `schema-construct-inventory.md`: the amended Graph row and the new instance-fan row.

**The stale-restatement sweep runs against the tree by grep key rather than against this change's file list, with each occurrence count recorded in the change manifest.** Two keys, not one.

- The specification's own key — a destination described as one activity per exit — **31 sites across 18 files**, all equally stale under either fan form, carried unchanged.
- **A second key this extension owes**: the phrasings that route fan-out to the pattern activities and the orchestration operations. Two canon sites are named explicitly and amended in the same commit, because both currently route an author to an operation whose parallel branch is unreachable at all fifteen of its bindings: the shared-capability principle's sentence preferring the orchestration operations and the borrowable pattern activities for mid-phase multi-agent fan-out, and the construct inventory's within-activity fan-out row prescribing the decompose-compose-dispatch-gather-synthesise chain as consecutive activity steps. Each is amended to name the layer it now covers — work units inside one worker for the operations, the graph instance fan for one activity over N work units. The pattern directory's README claim that its activities cover in-activity fan-out only becomes accurate in the same edit. Occurrence counts recorded beside the 31.

*Acceptance.* Everything green including every new anchor resolving, every new rule placed in an audience bucket, the fragment check, and the workflow-YAML validator loading the amended meta workflow. Version bumps on every edited definition. A smoke run drives a three-instance fixture fan: three workers spawn in one turn, each is served its own element, three slots land in collection order, the gather reports complete, the marks publish in one commit before the spawn and resolve in one persist at convergence, and no barrier refusal appears in any log.

### Stage 7 — first adoption, its own commit in the workflows submodule, and it does not gate the merge

One site — the continuous-integration pipeline scan, for the reasons in §10 — with the coverage baseline re-recorded and the dry-walk budget re-measured from its current value in the same commit, and one live run. **And the specification's §1 claim that no workflow in the pinned corpus is fan-ready is amended here**, because it is false of this form.

### Ordering against the specification's stages

Stages 1, 2, 4 and 5 each **extend** their counterpart and must land in the same commit as it, because each touches the same declaration, the same projection or the same handler branch. Stage 3 folds in as two fixtures. Stage 6 extends its counterpart with three edits and one new inventory row. Stage 7 is independent of the specification's stage 7 and **cheaper**, and should precede it: the specification's adoption must remove seven gates with a decision-inventory diff, while every instance-fan adopter is gate-free by construction.

The one ordering that is not negotiable: **the walker precedes any corpus fan.** Unflattened, the walk sends an object where a string is required, the tool's type rejects it, the walk throws, and the coverage job's no-walk-errored assertion fails.

---

## 10. The first adopter, and the migration surface

### The per-bind verdict

Fifteen bindings across seven definition files. Every one sits in an activity executed by a dispatched worker, so both branches of the operation are unreachable at all fifteen today, and this design does not move the primitive — it serves the shape at the layer where the primitive is.

**1. The orchestrator-workers pattern.** The whole pipeline — decompose, compose briefs, dispatch, gather, synthesise — over a **run-time decomposed** unit collection. **Served fully**, and it is the site this design is shaped for. It becomes three graph nodes: source (decompose), fan, meeting point (gather and synthesise). The gather's binding carries across **unedited**, because the decomposition's units are id-and-brief records with a stable slug id, which is exactly what the expectation list normalises and what the container's slot id derives from. Named changes: the activity declares **no exits** and appears in no graph edge, so a fannable per-unit activity must declare one; and the brief-composition step is displaced, because the brief travels as the projection. What is lost is its identity as a **borrowable activity** — a graph shape cannot be borrowed, so a consumer authors three graph entries instead of one activity line, and the pattern's home moves from the file to the inventory row.

**2. The supervisor pattern**, with concurrency one over a one-element collection. **Served but pointless**, and this bind is not demand for this capability. The construct that serves it is a plain graph edge to the lane activity, which the ordinary dispatch operation already executes. Verdict: its dispatch step is unexecutable today and the fix is an ordinary destination.

**3. The isolated-fan-out pattern**, with an isolation mode and a require-complete validation. **Partly served.** Context isolation is exactly what a fan gives — each instance is a fresh worker context under its own identity. **Worktree isolation is not served**: the branches share one working tree, and the rule that workers must create or use their worktree before mutating files is precisely what a graph fan cannot honour. Gate-free and optional. Same missing-exit gap. And the require-complete validation becomes **structurally satisfied**, which is worth stating rather than advertising as a detection.

**4. The lead-researcher pattern, both binds.** The first fan is direct and **served**. The follow-up fan sits inside a bounded while loop; **served at a stated cost**, because the loop must become a **graph cycle** — the meeting point assesses gaps and its exit routes back to the source. Legal: the self-routing rule forbids a *branch* routing onto itself, not a meeting point routing back to a source, and the corpus already carries such cycles. The container's **reset** materialisation puts round two's outputs in fresh slots rather than appending into round one's. What is lost is the declared iteration ceiling: a graph cycle has none. The replacement is ordinary state — a round counter the meeting point writes and an exit predicate — which the gate dialect already expresses.

**5. The substrate audit's reconnaissance, both binds.** Two sequential single-agent dispatches with a file-verification step between them, the second's briefs composed only after the first's files land. **Not served, and does not want to be.** That is a chain of two activities. The fix is two graph edges.

**6. The substrate audit's primary batch.** The whole roster in one simultaneous batch, with ten expected output files named in its verification step and the ten-agent roster named again as a workflow rule. **Partly served, and it is the widest real fan in the corpus.** Three named blockers, all real. The roster is **mixed** — seven of one review activity, one static-analysis, two toolkit-review — and one instance fan runs one activity, so the site migrates as a fan of seven, an ordinary edge, and a fan of two: **three turns rather than one**, forfeiting the single-simultaneous-batch rule. That is the cost of refusing a mixed fan, stated rather than hidden. Roster entries key on an agent designator rather than a plain id, so the fan enter's id derivation refuses them and the gather's own normalisation would find nothing — the roster-assignment operation must emit an id beside the designator. And the six sub-activities are gate-free and optional but declare **no exits** and sit in no graph edge, so each needs one exit bound to the meeting point, which newly subjects their reads to the reachability and review-mode checks — a real acceptance consequence rather than a blocker. Everything else is already right: the per-instance parameter is one value whose input description already says it also names the persisted output file; the per-instance artifact is the token-templated JSON of the artifact decision's sanctioned deviation, already authored, already guide-mapped, already green; no sub-activity binds a git or register operation; and the ordered gather is **already bound** with an expectation list. The three tail single-agent dispatches become ordinary activities.

**7. The continuous-integration pipeline scan.** Worker count read from a session variable holding the number of per-submodule scanners assigned during reconnaissance. **Served, and this site corroborates the design directly**, because it already parameterises its width at run time from a variable — which is what a fan's width is. The migration **removes** a variable rather than adding one: the width becomes the collection's length, so that count stops being a second home for it. Gate-free. The ordered gather already bound with an expectation list. Per-instance artifact token-templated on a scanner designator, guide-mapped, green today. Named changes: the fan's collection names the work units rather than the composed briefs, because a brief carries a prompt and the prompt is the composition operation's; the per-submodule scan needs an activity of its own, carved from the audit-execution step; and the single exit gates on two flags written by *dispatched* workers, so those writes move to the meeting point. The three tail dispatches are single sequential workers.

### The first adopter

**The continuous-integration pipeline scan, with the substrate audit's crate-review group second.** Both are gate-free, both already bind the ordered gather, both already declare a token-templated per-instance artifact that is guide-mapped and green, neither touches a checkout or a shared register, and both have per-unit work long enough — a whole submodule or crate — that an extra payload buys real wall clock and real context isolation. The pipeline scan goes first because its width is genuinely run-time and its fan is the only dispatch in the activity that fans at all.

### The corpus's one authored fan-out, weighed properly

The adversarial-challenge operation is an instance fan authored as a technique. Its own protocol builds one work unit per entry in a perspectives collection, dispatches through scatter-gather where the mode available to that context follows the depth rule — the sentence that says why only the sequential mode runs — and hands each unit only the concern set plus its perspective name, never another unit's findings. One value differing per instance, all else equal: owner input 1, authored, in the corpus, today. Its output is already an ordered collection of per-perspective findings keyed by perspective name, isolated until combine, which is the container this design lands.

**Seven bindings**, at the design-philosophy, research, implementation-analysis, plan-prepare, assumptions-review, implement and codebase-comprehension activities. Six bind three perspectives — stakeholder gap, rejected paths, evidence strength — and the seventh binds two.

**Two checked facts make it the strongest shape match.** Neither the challenge operation nor its combine declares an artifact, and the file write is a separate step that stays in the source or the meeting point — so **the amendment's blocking artifact decision does not block this site at all; it is the artifact rule's default arm natively.** And the challenge-and-combine pair sits in a loop body containing **no decision checkpoint** at every one of the seven sites, so a carved challenge activity satisfies the gate ban by construction and **no gate is removed.**

**And it is the weakest cost match, which is why it is not first.** Three named changes. The challenge operation splits its scatter out: its scatter and gather phases are deleted, its input becomes the singular perspective, its output one perspective's findings, and the plural collection moves to the meeting point as the gather's expectation list. The step-level convergence loop — a do-while with a ceiling of ten passes — becomes a graph cycle at each adopting site, losing that ceiling to an authored round counter. And because a graph keys exit bindings by activity id, one shared challenge activity cannot converge on seven different combine activities, so seven sites means seven near-identical activity triples, seven graph cycles and seven sets of Progress rows — to replace seven three-line loop bodies that **run today** because sequential scatter-gather is an in-context loop needing no dispatch primitive.

**The arithmetic disqualifies it, and the corpus states the governing rule itself:** where genuine parallel fan-out is not needed, sequential mode is the correct default. Against a two-to-three-wide fan whose per-instance work is one reasoning pass over a log, run up to ten times, the migration costs (N−1) whole payloads per pass and is a **cost regression at every one of the seven sites** unless the per-perspective pass grows. One thing it buys in its own right, independent of any fan: promoting six identical bind-site literals of the perspectives list to one declared collection, which retires a live catalogue finding about a bag value carried as a literal.

### The migration surface, named and sized

**Out of scope for the staged plan; recorded because it decides whether this capability has a day-one caller — and it does.** The reader needs to know which position this capability is in, so it is stated plainly: **this is not a capability whose every caller requires a refactor.** Two of the fifteen bindings sit in workflows whose per-instance artifact naming, gather binding and gate-freedom are already in place; their migration is one exit declaration, two graph entries, a carved meeting point and one deleted variable — changes worth making independently, because splitting an activity that runs four dispatch groups into distinct graph activities gives each its own exits, artifacts commit, usage figure and Progress row, which is exactly what the specification names as the price in-activity fan-out pays.

Four tiers, sized.

1. **The fifteen fan-out bindings across seven files.** Verdicts above. Five files served, two wanting plain edges. Cost: one exit per fannable activity, two or three graph entries per site, one carved meeting point per site, one roster field added at the substrate site, and three turns instead of one at that site. Retires: five unexecutable dispatch steps and, at the pipeline site, one shadow width variable.
2. **The corpus's one authored fan-out**, at seven activities. The strongest shape match, disqualified by the arithmetic. Cost: an operation split, seven graph cycles with authored round bounds, twenty-one activity files where seven now stand. Retires: six duplicate literals of the perspectives list, and — if adopted — the unbounded accumulation of up to ten reasoning passes in one worker.
3. **The fan-outs written out by hand.** The clearest is the prism workflow's dispute analysis, which declares two lens outputs of one operation — an instance fan of two, enumerated by hand, with the per-instance artifact naming already solved by literal duplication. Establishing this tier is one survey, and it should precede any wider adoption rather than be assumed.
4. **The superseded vocabulary, and a decision rather than an inheritance.** Once a graph instance fan owns the shape, the parallel selection on the dispatch-workers operation is a second construct doing one job of which only one runs — which is the shape the canon's *prefer removing the thing that needs a prohibition* names, and prose explaining that one path does not run is its tell. **The decision: the parallel selection is retired and the operation states its in-activity sequential contract positively; the fan-out halves of the four pattern activities that bind it are retired, the plan-and-execute pattern (which binds no dispatch) is kept, and the pattern directory's README is rewritten to describe only what remains.** Five files' worth of unexecutable vocabulary removed in the same change that makes the vocabulary expressible elsewhere — deletion counted as progress. Scheduled in this tier, not in the staged plan, and stated here so it is decided rather than inherited.

---

## 11. What this does not add

Each with what would trigger it.

**No instance named in the graph.** The graph carries a reference to a collection and a ceiling; it never names an individual instance. A fan whose destination listed unit keys was designed and rejected: it makes the width authored, so it cannot serve a run-time-decomposed unit list at all, which is more than half the demand. *Trigger:* none foreseen; the object form contains the static case.

**No position in the read path, and no way for an instance to project its own element.** Proved, not preferred: there is no indirection operator in the placeholder grammar, the bag-name grammar, the structured condition or the gate dialect, so a design in which an instance spells its own read does not run. *Trigger:* an indirection operator, which is its own change across four evaluators.

**No object frontier entry.** The entry is a string. An object entry would convert six silent readers into compile errors, which is real, and it costs six marginal source files inside the prerequisite-gated stage plus three new tool parameters. Paid for instead with two base-resolution edits and one test per reader, with the two silent-disable readers proved live. *Trigger:* a third population of instance-qualified ids, which would make the parse convention load-bearing in a place tests do not reach.

**No new tool parameter anywhere.** The instance rides the value of parameters the specification already introduces, and the usage tool is untouched.

**No worker identity on the frontier entry, and no dispatch-identity parameter on the transition tool.** Refused for the specification's stated reason, and the exposure they would close is carried at full strength as a residual rather than argued away. The cheap half is already taken twice: the response reports the instance-qualified id, which makes the worker's own stub comparison effective; and the delivery scopes being distinct makes the redelivery event fire exactly when two contexts claim one slot. *Trigger:* an observed duplicate claim. The upgrade shape, if wanted, is a slot **claimed on the first load call** and released when its claimant returns a non-conforming result — not an identity arriving in advance, which is the objection.

**No server-wide fan ceiling in configuration.** The specification refuses a width cap on the ground that it would be a policy number with no derivation and no configuration home. The configuration half is answerable and the derivation half is not, so the whole thing is declined and the author's declared ceiling is the only bound — one home, at the site, in the loop's own idiom, with the run-time refusal enforcing it. A deployment-wide number would be a second home for the same bound, underived, and the specification's objection would land on it unanswered. *Trigger:* a deployment that must admit less than what its corpus authors, which is one constant and one load rule when it arrives.

**No truncation to the ceiling, and no successive waves.** Truncating silently drops declared work and would let the gather report completeness over a set that was never the collection. Waves need a scheduler and new state, and a wave boundary empties the frontier mid-fan, destroying the one property the barrier rests on.

**No mixed fan — a list destination whose members may themselves be fans.** One exit, one destination, and a destination is one of three forms. The demand is one site: the substrate primary batch's ten-agent roster across three activities, dispatched as one batch by that workflow's own rule. Refusing it costs that site three turns rather than one. Adding it costs a heterogeneous barrier, per-member parameters, per-member ceilings, and a fan-group helper that returns a mixture. *Trigger:* a second site wanting one turn for members of different activities, which would make the single-batch rule general rather than one workflow's.

**No per-instance context beyond one value.** The element is the parameter, whole. A structured element needs nothing — the body projects fields by ordinary dotted read, exactly as a loop body already does. *Trigger:* a fanned activity that provably needs two independent per-instance values, which needs a second projected name and a second declaration.

**No count on the projection block.** It has no structural reader, and a worker reasoning about the width is reasoning about something that is not its business.

**No merge policy, no conflict guard, no partial combine, no degraded convergence.** Two instances cannot collide, so there is nothing to arbitrate. The specification's refusal stands verbatim and instances **strengthen** it: proceeding on two slots of three would hand the gather a value no instance produced, and completeness is structurally constant at the meeting point precisely because the barrier only releases when every slot is retired. Describing what a missing instance means *is* a merge policy.

**No decision gate in a fanned activity, and no per-instance outstanding-decision slot.** The rule is unchanged, because none of its three grounds mentions branch distinctness, and instances make it *more* binding: every instance reaches the same checkpoint step, so a gate inside a fanned activity deadlocks with **certainty** rather than by luck of routing, and the outstanding-decision assertion gates every other tool call. Only its message changes, losing one of its three remedies.

**No nested fan, no self-looping branch, no child session per instance, no fan mode on the ordinary dispatch operation, no branch-results output, no new tool, no new source module, no member field on the variable definition schema, no change to the trace token grammar.** Every one stays refused for the specification's reason, and instances strengthen four of them.

**No new envelope field, no new drive-loop gate, no change to the transition tool's parameters, and no change to the drive loop's bind site.** The header's list-ness is the fan signal for both forms, so an instance fan is invisible to the worker's envelope. This is the one place the extension makes the specification's surface *smaller* than a naive reading would.

**No 37th guard registry entry, and no new family name.** One new arm on the existing artifact-collision family and detail strings on existing families, all inside the existing variables entry. The registry stays at 36 — 32 corpus-scope and 4 repo-scope — and separately, the unregistered session-contract script is raised in its own commit rather than counted.

**No check on the two shared-register surfaces or the append-ordered log.** An activity that writes an unprefixed shared register or appends to the provenance log is not fannable, and that is a criterion applied once at design time. *Trigger:* an observed fan that landed one of them, which would make it a load rule over the flattened steps and each step's bound operation — decidable without composed signatures, so cheap when justified.

**No repair of the dispatch-workers operation, and no worktree isolation for a fanned activity.** The first stays unexecutable at every one of its bindings for the depth rule's reason; the retirement of its parallel selection is the decision recorded in the migration surface, not a repair. The second is not served: a fan's branches share one working tree, and the write-boundary rule is what a graph fan cannot honour. Context isolation is served natively. *Trigger for the second:* a per-instance worktree, which is a change to the one-tree-per-session model and not to the fan.

**No resolution of the pre-existing contradiction about where a loop item is declared** — one place says a loop variable is iteration state and is not declared among an activity's writes, another lists loop items among what that declaration covers, and the corpus declares them. Named so the fan's choice of home does not read as arbitrary: the contradiction does not reach the fan's parameter, because that parameter is unambiguously not iteration state — it crosses an activity boundary, the graph naming it in one file and a different file's activity reading it, which is the definition of the contract namespace. *Trigger:* its own commit, with a sweep over the corpus's fourteen item-loop sites.

---

## 12. Residual risks and open decisions

- **A join that names a slot by index is only half-checkable.** The load rule bounds an authored index against the declared ceiling, which cannot report falsely and which catches the authored typo. It cannot catch the commoner case — an index within the ceiling but beyond the collection's actual length — because the width is a run-time value the load cannot see and the guard's lattice is a name set carrying no length. The positive answer is the rule that a meeting point gathers the container whole, whose own remedy is real: the gather walks the container and the expectation list is the same collection. It is nonetheless a contract an author honours, and it is the sharpest half-enforced thing in the design.
- **An instance fan trusts the orchestrator's index arithmetic for slot assignment.** The worker's own stub comparison now catches a mis-composed prompt, because the response reports the instance-qualified id — which is a real strengthening over the distinct form. What survives is an orchestrator that composes for one slot and dispatches with another: the load call is refused only if the named entry is not in the frontier, so an index that is wrong-but-present is served. The consequences are duplicated work, one silently uncovered unit, and a gather manifest reporting neither. What stands against it: distinct delivery scopes make the redelivery event fire exactly when two contexts claim one slot — visible after the fact, not refused. *Trigger:* one observed wrong index.
- **The mixed roster is the one demand shape refused outright.** One site dispatches ten agents across three activities as one batch, stated as that workflow's own rule. It migrates as three chained nodes: three turns rather than one, so the wall-clock purchase the fan exists to make is a third of what that site intends. Right call at one site of demand; wrong call at two.
- **Concurrent instance contexts share one working tree, and the specification's fallback attribution is unavailable.** The load rule keeps a fanned activity from committing, but nothing enforces that its branches are read-only on the source tree, and the specification's residual about a commit that cannot attribute a change to a branch is strictly *worse* for instances, because attributing by activity id fails when N instances share one id. A concurrent staging command also fails hard rather than silently, with nothing retrying it.
- **Two shared writers lose data with no trace and no check.** The deferred-item and follow-up registers are literal unprefixed filenames written as whole-file read-modify-writes, so two instances write one path and one instance's rows vanish. The provenance log loses rows the same way, and even serialised its row order becomes the order N instances happened to finish in, which its own guide states as a property a reader compares rows against. Stated as fannability criteria; not mechanised.
- **The artifact check is template-only, in two directions.** It sees a technique that declares an artifact; a technique that writes a file without declaring one is invisible to it. And it cannot see two *elements* interpolating to the same filename — the fan-enter duplicate-id refusal closes that at run time, which is the answer, but a template that interpolates something other than the fan's parameter and still collides is outside both.
- **A templated instance artifact is never updated in place.** Each interpolated name is its own logical artifact, created and not matched against siblings, so a second visit to the same fan re-resolves the same template and creates rather than updates. Where that is wrong, the branch declares no artifact and the meeting point writes.
- **The meeting point re-pays full delivery, and a wide document-shaped fan makes it the bottleneck.** Every instance is a fresh delivery scope, so nothing collapses to a reference marker, and the meeting point takes a fresh context that re-pays whatever the instances collectively held. Nothing refuses it — the batch bound exempts a scope with no activity yet and the writer validates nothing about completeness — so the failure mode is a silently truncated document. The declared ceiling is the only thing an author has against it.
- **The delivered-token figures are a substitution and they are a floor.** There is no measured figure in the tree for a *fanned* activity's payload, so the arithmetic substitutes the standalone mean of the only three measured activities. Every figure counts eager payloads only and never a lazy fetch, for the reason the benchmark's own figure is a floor. Re-derive against a fresh benchmark run before any specification prose quotes it, and expect the true premium to be higher.
- **A projection not overlaid onto the eager-bundling reading degrades silently.** A step gated on the fan parameter has no answer at delivery and stays lazily fetched. It degrades rather than breaks, so a missing overlay is invisible except as a slower fan.
- **The bag an instance re-reads does not hold its parameter.** The inspection tool serves the un-projected bag, so an instance re-reading it finds the collection. That is the truth about where the value lives and the projection names itself on the response it arrives with, so the asymmetry is visible — but a worker that reasons from the bag rather than from its own header reasons about the wrong thing.
- **Trace segments are per session, not per delivery scope.** A fan of N produces one plus N segments partitioning an interleaved event stream at arbitrary points. Stamping the retiring instance on the payload fixes the mislabelling — better than the distinct form, where nothing prevented two segments carrying one activity's id — but the interleaving is not separable from the boundaries.
- **An instance that cannot proceed without a decision still has no conforming way to say so.** The completion contract defines two envelopes and the partial-result rule accepts only those two, and the gate ban is what makes the gap reachable. Instances neither create nor close it. What they add is that the best available report — a completion on a blocked or abort exit the activity declares — is **shared** by all N, since they run one definition: either every instance can report blocked or none can.
- **Everything in stages 3 and 4 lands in a hard-zero guard with no ledger to diff.** A bug in the arrival intersection, in the two-segment-stripping read test, in the synthetic read's three injections or in the artifact family's instance arm is silent, and fixtures are the whole protection. Instances make the intersection trivially correct, which shrinks the risk without removing it from the other three.
- **The dry-walk budget may not clear after adoption, and a short streak reports as unreached options.** The coverage plateau is a property of the graph and must be re-measured whenever the graph grows; a fan seeded from a collection multiplies the branch orderings the enumerator produces by more than an authored-width fan does. Re-measure in the adoption commit, or a definitions defect is reported where the cause is the budget.
- **The one-element list in the worker's routing header is a form the graph forbids.** The two surfaces differ for a stateable reason and the tool description says the block is derived, but a reader who knows the graph rule and not the description may still read it as authorable.
- **Open decision, owner's to make: the ceiling's guidance number.** `maxInstances` is required and unbounded above by anything but the author. The arithmetic says a fan of three already spends more in premium than a whole three-activity batched walk spends in total, and a fan of sixteen spends between 1,901,850 and 2,493,840 characters — between 475,463 and 623,460 tokens — across fifteen fresh contexts. Whether the specification carries a *recommended* ceiling near three or four alongside the field, or leaves it entirely to the author with the arithmetic stated in the field's description, is a judgement about how much guidance belongs in a schema description. The description as written carries the cost sentence and no number.

---

## 13. Evidence

Grouped by claim. Server paths are relative to the repo root at `main`; corpus paths are relative to `workflows/` at `f3733709`.

**The corpus census, re-measured at the pinned commit.** 17 workflows, 109 activities bound in graphs, 207 graph edges, 18 terminal, 0 list-valued destinations, 0 object-valued destinations. Re-derived in the adoption commit alongside the coverage baseline.

**The destination and graph schema.** `src/schema/workflow.schema.ts:45-52` (graph declaration), `:51` (the record-of-record-of-string shape), `:64` (what the workflow's own variable list holds), `:67` (the graph field's description). Generated output at `schemas/workflow.schema.json:384-393`, generated by `scripts/generate-schemas.ts:25`; the empty-subschema assertion at `tests/generated-schemas.test.ts:44-49`; the site renderer's non-recursion at `scripts/generate-site-data.ts:498-517`. Variable-name schema at `src/schema/variable.schema.ts:6-9`, required type at `:13`, default seeding at `:16`, the loop-variable sentence at `:64`, the reads-are-a-contract sentence at `:63`. Qualified-name pattern at `src/schema/identifiers.ts:16`.

**The load rules and their host.** `src/loaders/workflow-loader.ts:520-572` (the exit-binding validator), `:366-367` (its call site and failure), `:333` (fragment materialisation), `:350` (variable merge), `:496-503` (exit bindings read keyed by activity id), `:499` (the graph lookup), `:565-567` (destination existence). Checkpoint helpers: `:441-449` (the separator and its doc comment), `:451-455` (base id), `:457-475` (the base fallback), with existing call sites at `:473`, `:474` and `src/utils/validation.ts:89`, and the test import at `tests/workflow-loader.test.ts:13,243-246`. Activity lookup at `:436-439`; filename-derived ids at `src/loaders/filename-utils.ts:6-10`; raw activity read at `:606`. Flattened steps at `src/schema/activity.schema.ts:318-332`.

**The frontier, the resolver and the transition handler.** Specification quotations from `.engineering/artifacts/planning/2026-09-08-parallel-activities-in-the-graph/README.md:222-233` (the frontier declaration and the three refusals), `:240-246` (the resolver), `:257-259` (the exit parameter), `:264-268` (the five-step rule), `:272` (the barrier), `:279-281` (the refusal texts), `:286` (the barrier metadata), `:292` (the validation-block failure mode), `:296-300` (the load-call parameter), `:323` (the yield refusal), `:360-362` (identity per branch, replace one branch), `:374` (the depth rule's consequence), `:434-436` (the fan's two moments, the batch bound), `:446-448` (the branch key's derivation and suffix), `:515-517` (the artifact collision's floor status), `:577` (the wanted usage reading), `:635` (the frontier renderings), `:672-706` (the refusals), `:712-720` (the residuals), `:748` (the census). Amendment quotations from `amendment-branch-index.md:46` and its §3 and §4.

**The transition, load and usage handlers.** `src/tools/workflow-tools.ts:120-167` (activity artifact composition, dedupe at `:161-163`), `:180-182` (the inspection views), `:207` (the identity projection's current activity), `:359-379` (wall-clock spans keyed on the event's activity), `:474-475` (the activities-with-no-usage diff), `:508` and `:531` and `:2235` (the flat bag served to both roles), `:720` (the handler loading the workflow), `:761` (the merged declaration map), `:769-774` (the exiting activity, the exit event, the completed append), `:804-810` (the variable wrap), `:812-825` (step-completed events), `:842` (the recorded exit), `:959-973` (the batch reading), `:982` (the trace stamp), `:1007` (the load tool's no-activity-id description), `:1016-1019` (its parameters), `:1027-1030` (the current-activity read and its refusal), `:1032` (the delivery scope), `:1205` (the bag at open), `:1222-1226` (the lazily-unanswered path), `:1406` (the loop-body bundling rule), `:1438-1441` and `:1443-1456` (the artifact prefix and routing blocks and their reasons), `:1526-1534` (the redelivery event), `:1616` (the metadata mirror), `:1787` (the usage activity parameter), `:1813-1823` (its verbatim storage), `:2197` and `:2231` (the status tool's current activity). Technique tool's activity parameter and mismatch guard at `src/tools/resource-tools.ts:644,658-665`.

**The variable write path and the session record.** `src/utils/variable-seed.ts:15` (default seeding), `:45` (the write-source enum), `:68-108` (the write function), `:75-92` (the per-name validation loop), `:80-84` (the declared-type warning), `:93` (the flat commit), `:99` (the event name). Canonicalisation and sealing: `src/utils/session/store.ts:121` (canonical key ordering), `:145-187` (the canonicaliser), `:151-157` (lexicographic key sorting below the top level), `:171-175` (the array branch). Legacy conversion at `src/utils/session/migration.ts:182,243`. History entry shape at `src/schema/state.schema.ts:83-91`. Outstanding-decision gating at `src/utils/session/params.ts:56-76`, with the gate list at `:62-70`.

**The read walkers, verified by execution.** `src/schema/condition.schema.ts:15-21` (the structured condition's literal name and value), `:40-49` (its split-and-index walk). `src/schema/when-expression.ts:4-6` (the grammar comment), `:23-29` (the token shapes), `:122-133` (the numeric-literal branch), `:134-144` (the identifier tokeniser), `:287-294` (the path walk). Gate dialect declared at `src/schema/activity.schema.ts:75`. Placeholder grammar at `src/utils/activity-variables.ts:213` over `src/utils/binding-provenance.ts:36`; the ambient set at `:33`.

**The analysis module and the guard script.** `src/utils/activity-variables.ts:62-75` (declaration disagreement, type first), `:112-149` (the declaration merge), `:216-218` (the head-taking helper), `:236-238` (gate reads), `:309-320` (signature reading, including artifact names), `:402-404` (a loop's collection as a read and its item as a write), `:540-546` (the graph builder and its de-duplication), `:574-673` (the reachability function), `:577` (its available-at-entry parameter), `:595-600` (the predecessor index), `:604-611` (the forward search), `:616-627` (the seeding and the outgoing computation), `:629-646` (the fixed point and the intersection), `:648-653` (the entry finding), `:657-672` (the re-entry family), `:679-716` (the cycle pass). `scripts/check-activity-variables.ts:94` and `:102-105` (the owned set), `:158` (the undeclared-crossing skip), `:170-177` (unused declaration), `:178-185` (unused write declaration), `:188-206` (writer and reader collection, with the self-consumed exemption at `:197-206`), `:208-215` (unwritten read, with the ambient skip at `:210`), `:216-223` (unread write), `:226-231` (the availability seed), `:236-243` (the routing-read map and its filter), `:244` (the policy set). Registry at `scripts/guards.ts`, 36 entries, variables entry at `:37-44`, loop-shape at `:244-251`; unregistered script at `scripts/check-session-contract.ts`, which reads the completed list at `:119`. Variable-model checks at `scripts/check-variable-model.ts:9-12,13-15`. Artifact-guide resolution at `scripts/check-artifact-guides.ts:14-21,126-135,148-154,166-172,178-186`. Audience JSON test at `scripts/check-audience.ts:56-58`. Template pattern application at `scripts/check-technique-template.ts:175`. The raw-YAML graph reader at `scripts/check-review-mode-gating.ts`.

**Delivery, batching and the arithmetic.** `src/utils/delivery.ts:53-55` (the marker sentence), `:63-65` and `:68-70` (the scope keying). `src/utils/dispatch.ts:34-40` (dispatch presence), `:62-77` (the prior-scope helper and its reason), `:82` (the replacement comment). `src/utils/batch.ts:72-86` (distinct activities per scope), `:98-123` (delivered characters), `:154` (the no-activity-yet exemption), `:176` (the already-held case). `src/config.ts:156` (characters per token), `:164-165` (the batch constants and their measurement pointer). `docs/dispatch-model.md:68` (the respawn ratio), `:76-78` (what the activity cap covers), `:84` (the floor caveat), `:86` (the measured figures: 85,775 + 106,893 + 30,182 = 222,505 batched; 261,971 standalone; mean 87,324).

**The activity and technique schemas.** `src/schema/activity.schema.ts:65` (reads as a contract), `:149-151` (the loop's division of labour), `:152-164` (the loop step, strict, with `variable` at `:158`, `over` at `:159`, `maxIterations` at `:161`, the common-field spread at `:163`), `:262-263` and `:302-303` (activities name outcomes), `:268` (exit predicates), `:277-311` (the activity object), `:310` (the prefix inferred from the filename). `src/schema/technique.schema.ts:47-52` (the artifact-name description), `:54-55` and `:61` (the pattern), `:57-58` (its rejection message).

**Corpus rules and operations.** `meta/techniques/scatter-gather.md:12-13` (the two modes), `:22-24` (one gather contract, two scatter modes), `:30-32` (isolate then combine), `:34-36` (order preserved), `:38-40` (parallelism is optimisation). `meta/techniques/variable-binding.md:13-18` (input precedence and the bag-name grammar at `:18`), `:20-21` (nested values and the structured walk), `:29-31` (deviations only, and the three sanctioned forms), `:41-43` (generic not overfit). `meta/techniques/workflow-engine/TECHNIQUE.md:40-44` (agent id scopes delivery). `meta/techniques/workflow-engine/compose-prompt.md:16-18` (required substitutions), `:35-56` (the stub), `:39-40` (the emit), `:59-61` (context travels as state). `meta/techniques/workflow-engine/commit-and-persist.md:26,31` (working-tree paths; one push retry). `meta/techniques/workflow-engine/dispatch-activity.md:53` (one trace token per transition), `:70-72` (account every activity), `:100-102` (delivery keys on agent context), `:104-106` (the server bounds the batch), `:108-110` (partial results refused). `meta/techniques/workflow-engine/
finalize-activity.md:30-36` (the two envelopes). `meta/techniques/harness-compat/spawn-agent.md:44-46` (depth-1-only, and the sentence instructing an author to hoist a pass to the orchestrator). `meta/techniques/agent-conduct.md:46` (write only under the server-returned planning folder). `meta/techniques/activity-worker.md:82-84` (verify the dispatched activity). `meta/techniques/read-session.md:22` (the variables view). `meta/techniques/orchestration-patterns/TECHNIQUE.md:24-26` (the group-level effort cap), `:56-58` (the worktree write boundary). `meta/techniques/orchestration-patterns/decompose-work-units.md:16-18` (the effort cap), `:22-24` (the work units and the stable slug id). `meta/techniques/orchestration-patterns/compose-worker-briefs.md:34-38` (the per-unit prompt). `meta/techniques/orchestration-patterns/gather-results.md:12-14` (the results input's declared array shape), `:16-18` (the expectation list and object normalisation), `:26-36` (items aligned to expectation order, missing ids with no result, the dispatch manifest), `:40-44` (the normalisation step and the completeness verdict). `meta/resources/planning-readme.md` (the row-ownership map keyed by prefix; a row absent from the map is unselectable; an artifact may exist without a row; an agent-audience artifact gets no row; the item link targets the minted filename). `meta/techniques/workflow-engine/sync-progress-status.md:28-30` (the item-match input), `:42-48` (the protocol's prefix resolution, row selection and link repoint).

**Work-package operations and guides.** `work-package/techniques/manage-artifacts/write-artifact.md:12-14` (the server-provided prefix input), `:24-30` (the target directory input), `:41-48` (find-or-update and the mint-attempt guard at `:46`), `:50` (the token-templated series carve-out). `work-package/techniques/manage-artifacts/TECHNIQUE.md:43-49` (hyperlink conventions), `:88-90` (push before linking). `work-package/techniques/manage-artifacts/verify-artifact-links.md:26` (the folder enumeration). `work-package/techniques/manage-git/artifact-commits.md:38-40` (pull-rebase before every push, one retry). `work-package/techniques/manage-git/create-worktree.md:33-39` (one worktree per session). `work-package/techniques/manage-registers/TECHNIQUE.md` (created lazily and unprefixed; one row per item, updated in place). `work-package/techniques/manage-registers/append-deferred-item.md:26-32` and `append-follow-up.md:22-28` (the two literal filenames). `work-package/techniques/dco-provenance/append-task-row.md:54-60,64-65` (the provenance log artifact and its append). `work-package/resources/provenance-log.md` (the append-only completion-order contract). `work-package/techniques/analyse-challenge/TECHNIQUE.md:12-14` (the perspectives collection). `work-package/techniques/analyse-challenge/challenge.md:16-20` (the findings output, keyed by perspective, isolated until combine), `:26-28` (one work unit per perspective; the mode follows the depth rule; each unit receives only the concern set plus its perspective name), `:42-44` (its own isolate-then-combine rule). `work-package/techniques/analyse-challenge/combine.md:12-14` (the ordered findings input). `work-package/techniques/review-assumptions/record.md:18-28` (the assumptions log artifact). `work-package/resources/README.md:64,66-68,70` (four token-templated guide rows). `work-package/resources/readme-seed.md:68-88` (the seeded item labels).

**The challenge bind sites and their loops.** Bindings at `work-package/activities/02-design-philosophy.yaml:194`, `04-research.yaml:154`, `05-implementation-analysis.yaml:100`, `06-plan-prepare.yaml:132`, `07-assumptions-review.yaml:91`, `08-implement.yaml:176`, `15-codebase-comprehension.yaml:98`. The perspectives literal at `02:196`, `04:156`, `05:102`, `06:134`, `07:93`, `08:178` (three perspectives each) and `15:100` (two). The convergence loops at `02:180-186`, `04:137-146`, `05:86-92`, `06:118-124`, `07:77-83`, `08:162-168` (do-while, ten iterations) and `15:82-88` (while). The checkpoint-free loop bodies holding the challenge and combine steps at `02:187-207`, `04:147-168`, `05:93-113`, `06:125-145`, `07:84-105`, `08:169-189`, `15:95-111`, with `04`'s gates at `:105-124`, `:190-221`, `:222-224`, `:241-243` and `15`'s deep-dive gate at `:127-157`. Register binds at `07:142-144`, `12-strategic-review.yaml:207`, `10-post-impl-review.yaml:121`; the provenance bind at `08:114`. The scope value set at `04:32-39`; the item-loop declarations at `04:44-46,233-235`; the comprehension directory at `15:33-35,56-60,73`.

**The fifteen fan-out bindings.** `meta/activities/patterns/01-orchestrator-workers.yaml:34-52` (the pipeline; dispatch at `:43`, gather at `:49`; units declared at `:16-18`; no exits), `02-supervisor.yaml:20-22,48,50` (the one-element collection, the dispatch, concurrency one), `04-isolated-fan-out.yaml:44,47,54-59` (isolation mode, dispatch, require-complete; no exits), `05-lead-researcher.yaml:47,59-88` (first dispatch; the bounded while loop with its ceiling at `:64` and the second dispatch at `:76`), `03-plan-and-execute.yaml:53` (a dotted loop collection; binds no dispatch), `patterns/README.md:7` (the in-activity-only claim). `substrate-node-security-audit/activities/02-reconnaissance.yaml:37-46,49-55,60-61` (the two chained dispatches, the verification between them, the roster assignment), `03-primary-audit.yaml:48,49-54,66-69,69,75,81,87` (the batch dispatch, the bound gather with its expectation list, the ten expected files, the roster, the three tail dispatches), `workflow.yaml:19,65-80` (the single-batch rule; the six sub-activities off-graph), `10-sub-crate-review.yaml` through `15-sub-structured-merge.yaml` (gate-free, optional, no exits), `techniques/dispatch-sub-agents/TECHNIQUE.md:12-14` (roster entries keyed on the agent designator), `techniques/execute-sub-agent.md:12-14,26-32` (the designator input and the token-templated artifact), `resources/README.md:35` (its guide row). `cicd-pipeline-security-audit/activities/02-reconnaissance.yaml:10-13` (the scanner count variable), `03-primary-scan.yaml:9,26-29,30-35,50,56,62,72-74` (the width read, the dispatch, the bound gather, the three tail dispatches, the exit predicate), `techniques/execute-sub-agent.md:22-28` (the token-templated artifact), `resources/README.md:34` (its guide row).

**Hand-written fan-outs and item-loop conventions.** `prism/techniques/dispute-analysis.md` (two lens artifacts as two outputs of one operation). `prism/activities/02-adversarial-pass.yaml:13-15,23-25,32,38` (the declared item, the loop's collection and item and ceiling, the dotted item read, the item-gated step). `meta/activities/02-resolve-target.yaml:58-60` and `workflow-design/activities/03-requirements-refinement.yaml:86-88` (further item loops).

**The canon.** `workflow-design/resources/design-principles.md` — 35 numbered principles, with the shared-capability sentence at `:87` (amended in stage 6), Document in Positive Present at §17, Distinguish Designators from Parameters at §16, and Prefer Removing the Thing That Needs a Prohibition at §35. `anti-patterns.md` — 11 creation rules, 151 catalogue entries and 4 authoring-guidance entries across 12 sections, all of `bag-value-as-literal`, `unproduced-value-read`, `stale-restatement-after-change`, `artifact-name-is-filename` (its do-not-flag at `:1723` and `:1735`), `output-without-destination`, `declared-input-never-read`, `no-derived-state-shadow`, `boolean-id-shape`, `duplicate-shared-capability`, `engine-internals-narrated` and `cited-home-owns-claim` sitting under the authoring-guidance heading at `:1625`. `schema-construct-inventory.md` — six tables of 21, 7, 10, 5, 2 and 5 rows, with the within-activity fan-out row at `:38` (amended in stage 6), the loop-step row at `:47`, the artifact-name row at `:50`, the loop-item declaration sentence at `:56`, and the Graph row at `:65` (amended in stage 6). `convention-conformance.md` — 6 reference conventions.

**Figures carried in the cost section.** Per-activity payload substitution P = 87,324 characters (261,971 standalone across three activities, divided by three). Harness establishment E between 39,466 and 78,932 character-equivalents (two to four times the 39,466 the content collapsing saves). Premium at three instances = 2 × (P + E) = 253,580 to 332,512 characters = 63,395 to 83,128 tokens at four characters per token; as a fraction of the 87,324-character sequential baseline, 290% to 381%. Per extra instance, P + E = 126,790 to 166,256 characters = 145% to 190% of the whole sequential run. The distinct-activity fan's premium of 118,000 to 197,000 characters against its own 222,505-character baseline = 53% to 89%; the ratio of the two, 4.3 to 5.5. At sixteen instances, 15 × (P + E) = 1,901,850 to 2,493,840 characters = 475,463 to 623,460 tokens. The batched three-activity total of 222,505 characters, which a three-instance fan's premium alone exceeds.

**Guard and file counts.** 36 registry entries (32 corpus-scope, 4 repo-scope) plus one unregistered script. 122 corpus activity files, 56 declaring a checkpoint, 66 gate-free. 15 work-package activities with checkpoint counts 10, 7, 4, 4, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1 and 0. 15 fan-out bindings across 7 definition files. 7 challenge bindings. 31 stale-restatement sites across 18 files under the specification's own sweep key. Pre-adoption file counts: the specification's stages touch about 43 files (12 server source, 4 guard scripts, 3 test files, 2 generated schemas, 2 site data files, 4 docs, 16 corpus files); this extension's touch about 38, of which 7 are marginal server source files against the specification's 12. 66 references in the tree to the single-current-activity field the specification retires.