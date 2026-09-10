# Parallel activities: a graph destination that names several activities, and the dispatch that runs them

**Date:** 2026-09-08
**Corpus:** `workflows` at `f3733709801215501a90bd93d4e4a91e1d6f80ea`. **Server:** `main` at `9f1605d34ec60ead78f2417f94860bf9d8082e41`.
**Decided by the owner, fixed inputs to the design:** a fan destination is a list and the join is derived from convergence; branch writes are namespaced per branch and gathered explicitly.
**Amendment:** [branch instances and the index](./amendment-branch-index.md) — refines the branch-key rule after the design ran. Read it with section 6.
**Prerequisite:** [#655](https://github.com/m2ux/workflow-server/issues/655).
**Companions:** [parallelisation](../2026-09-08-work-package-parallelisation/README.md) (in-activity), [workflow granularity](../2026-09-08-work-package-workflow-granularity/README.md) (child workflows).

Nothing here changes a definition.

---

## 1. Summary

A workflow's graph says, for each activity, where each of its outcomes leads. Today one outcome leads to exactly one activity, so a workflow that has three independent pieces of analysis to do must do them one after another even though none of them reads the others' output. This specification adds one thing to the graph: a destination may name **several** activities instead of one. Naming several is a **fan** — the activities run together, one worker to each. They rejoin at whatever destination their own outcomes already point to, and the run enters that shared destination once, after the last of them returns. That rejoining point is the **join**, and nothing declares it: it is read back off the bindings the graph already carries, and a fan whose members point at different destinations fails to load.

Each member of a fan lands its whole set of outputs as one object under a key of its own — a **branch key**, derived from the member's activity id — so two members cannot overwrite each other's values by writing the same name. That is a **namespaced write**: the value goes into the shared variable bag under an address that belongs to one member alone. An activity downstream that needs the members' values combined binds a step that reads them by name and produces the combined value. This is the corpus's own `isolation-then-combine` rule from `scatter-gather` raised from work units inside one activity to activities inside one graph.

**What it costs, measured, not estimated.** The benchmark's three activities cost 222,505 characters delivered when one worker walks them as a batch — 85,775, then 106,893, then 30,182 — and 261,971 when each is dispatched on its own. Running them as a fan pays the standalone figure, so the delivered-content premium is **39,466 characters, 17.7%**, and that is a floor because the benchmark measures eager payloads only and never counts a lazy fetch. On top of it a fan establishes three harness contexts where a batch establishes one, and the dispatch model rates skipping two respawns at two to four times what the content collapsing saves — **78,932 to 157,864 further character-equivalents**. Total premium: roughly **118,000 to 197,000 characters, 30,000 to 49,000 tokens** at four characters per token. The join is not an extra fan cost: the activity cap per worker context is three, so a batched walk of the same three activities is already at the cap and the destination is a fresh dispatch in both shapes.

**So the net on tokens is negative and the specification says so plainly.** What a fan buys is wall clock: three long reasoning passes run inside one response turn instead of three sequential dispatch round trips, and the wait is free because a turn does not resume until every tool result returns. It is a latency purchase, not an efficiency one. It is worth building anyway for three reasons that outlive the arithmetic. First, the graph is the one authoritative home for routing, and "these activities are independent" is a routing fact the schema currently cannot carry, so authors express it as prose or as an activity-internal fan-out that the workflow's own structure then contradicts — Maximize Schema Expressiveness. Second, the corpus already owns the isolation rule that makes concurrent writes safe; raising it to graph grain reuses a shared capability instead of adding a second one — Prefer Shared Capability. Third, a fan is the only construct that keeps parallelism in the graph rather than inside a technique, which is what Keep Orchestration in Structure requires.

**What it needs first.** Issue #655: the session store must serialise each session's read-modify-write. What this design needs from that fix, in one line: **a compare-and-swap on the record's sequence number with retry, not a per-session write lock**, so that concurrent history appends from several branch contexts all survive — a lock would serialise the branch workers' own delivery calls behind it and erode the only benefit the fan buys.

**What ships dormant.** No workflow in the pinned corpus is fan-ready today, and the obvious candidate is not adoptable as it stands: the three analysis activities declare seven gates between them, none of their outcomes converge, seven activities bind the operation that writes the shared assumptions log, and the activity the example fans away from reads two values the fanned members write. The capability lands complete and inert; adoption is the last stage and it does not gate the merge.

---

## 2. What the graph does today, and what that forecloses

The graph is an object keyed by activity id, whose value is an object keyed by exit id, whose value is a single string: an activity id, or the sentinel that ends the run. Every exit every activity declares must be bound, or the workflow does not load — which is what lets one workflow borrow another's activity and route it differently, because the borrower binds the exits itself. That completeness rule is the graph's best property and this change does not touch it.

The consequence of the single string is that concurrency has nowhere to live in the routing. A workflow with three independent analysis passes writes them as a chain, and the chain's order is then a fact the definition asserts without meaning it. Authors who want the parallelism reach for the one place it is expressible — fan-out over work units inside a single activity, through the scatter-gather pattern — which is a different thing at a different grain, and it costs the parallel work its own activity identity: no separate exits, no separate artifacts commit, no separate usage row, no separate entry in the plan's progress table.

A destination typed as a bare string also means a list is not merely unsupported, it is rejected at parse time with a message about the wrong thing. Authored today, `done: [research, codebase-comprehension]` fails validation with `graph.plan-prepare.done: Expected string, received array`, and if the type alone were widened the next check along would report the whole list as one unknown activity id. Both are closed failures, and both are incomprehensible.

Nothing about the runner is ready either. The session record holds one current activity as a single string; the tool that hands a worker its activity body takes no activity parameter and reads that one string; the orchestrator's drive loop carries one activity and one worker identity and gates its branches on whether an identity is held; and the analysis that proves every variable read has a writer walks the graph assuming one destination per exit — so a widened type with that walk left alone does not merely mis-analyse a fan, it silently stops analysing it.

Everything from here on describes the system as it is with the capability in place.

---

## 3. The capability

A destination in the graph is either one activity id, the terminal sentinel, or a list of at least two activity ids. A list is a fan. When the run takes an exit whose destination is a list, every activity in that list runs, each in its own worker, all dispatched in one turn.

Each member of the fan is a **branch**. A branch runs exactly one activity. Its own exits are bound in the graph like any other activity's, and they all bind to the same single destination — that is the rule the whole design rests on, because it is what lets the runner know where the fan is going without anything declaring it. That shared destination is the **join**. The run enters the join once, when the last branch returns.

Worked example, as it appears in a workflow file:

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension, implementation-analysis]
  research:
    done: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  implementation-analysis:
    done: assumptions-review
  assumptions-review:
    approved: implement
```

Read plainly: finishing `plan-prepare` starts all three of `research`, `codebase-comprehension` and `implementation-analysis`. Each of the three, when it finishes, points at `assumptions-review`. The runner reads those three bindings, sees they agree, and takes `assumptions-review` as the join. It enters `assumptions-review` when the third branch returns and not before.

Three things follow from that shape, and each removes a mechanism the design would otherwise need. There is no join node, because the join is the destination the branches already name. There is no join keyword, because a keyword would be a second home for that same fact, able to disagree with the bindings. And there is no barrier bookkeeping in the graph, because the barrier is a predicate over what the session holds in flight.

A branch does not gate. A gate is a question put to the operator, and a session holds one outstanding question at a time — the record has one slot for it, and while it is held every other tool call in the session is refused. So one branch that gated would stop its siblings from fetching their own techniques and resources mid-activity, which is how most branches work. Worse, the orchestrator could not answer the question even if it wanted to: all branches spawn in one turn, and the turn does not resume until every one of them has returned or failed, so a mid-branch gate cannot be presented until the fan is already over. The specification therefore makes a fan branch gate-free and enforces it in two places — the load rejects a branch that declares a gate, and the yield tool refuses a branch that reaches for one it never declared. This is Prefer Removing the Thing That Needs a Prohibition applied to the operator question: with the rule at load there is no arbitration policy to write and no waiting policy to police.

Each branch's outputs land under its branch key, and the join binds a step that gathers what it needs. Nothing merges. Section 6 sets out the rule.

---

## 4. The schema change

### 4.1 The zod declaration

One file: `src/schema/workflow.schema.ts`. The destination becomes a union declared beside the graph type, together with the three derivations that are decidable from a destination alone. There is no new module — the terminal sentinel stays where it is in `src/loaders/workflow-loader.ts`, and the fan derivation that needs it lives in that same file, so nothing has to move and no import cycle is created.

```ts
/**
 * Exit bindings: activity id → exit id → destination. A destination names one activity, or lists
 * several. A list is a fan: its activities run together, one worker to each, and the run enters the
 * single activity all of their own exits name once the last of them returns — so the barrier is read
 * off the bindings the graph already carries and nothing declares it separately. A destination of
 * TERMINAL_SENTINEL ends the run without landing on an activity. Every exit every activity in the
 * workflow declares is bound here; an unbound exit, an unknown exit and an unknown destination each
 * fail the load, so the graph and the activities cannot drift apart.
 */
export const DestinationSchema = z.union(
  [
    z.string(),
    z.array(z.string()).min(
      2,
      'a fan names at least two activities; an exit that leads to one activity names that activity',
    ),
  ],
  {
    errorMap: () => ({
      message: 'a destination is an activity id, `__terminal__`, or a list of at least two activity ids',
    }),
  },
);
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The activities one binding can send the run to — one for a plain destination, several for a fan. */
export const destinationTargets = (destination: Destination): string[] =>
  Array.isArray(destination) ? destination : [destination];

/** Whether a destination runs several activities together. */
export const isFan = (destination: Destination): destination is string[] => Array.isArray(destination);

/**
 * The bag key an activity's outputs land under when the graph runs it as a branch of a fan: its id in
 * snake case with `_outputs` appended. Derived from the id alone, so the server, the guards and a
 * reader of the graph spell it the same way and a worker is never told it.
 */
export const branchKey = (activityId: string): string => `${activityId.split('-').join('_')}_outputs`;
```

Both messages are load-bearing and both were verified against the real parser. The arity message on the array member is what surfaces for a one-element list and for an empty list. The union error map is what surfaces for a number, for a list with a non-string member, and for a nested list — without it every one of those renders as `Invalid input`. The two do not fight: the array member's own message wins where the parser matches the array branch, and the error map covers the rest. Keeping the arity in the schema rather than restating it in the loader is Encode Constraints as Structure; a one-element list is a plain destination spelled a second way, which One Authoritative Home forbids.

The graph field's description is the one piece of text that reaches every reader — the orchestrator's workflow summary, the generated JSON schema, and the published site — so the semantics belong there:

```ts
  graph: GraphSchema.optional().describe('The workflow\'s shape: for each activity, where each of its exits leads. This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. A destination naming one activity sends the run there, and `__terminal__` ends the run. A destination naming several activities runs them together, one worker to each; each lands its outputs under its own branch key, and the run enters the single activity all of their own exits name, once, after the last of them returns. Omitted only by a workflow whose activities declare no exits.'),
```

### 4.2 The generated JSON schema

`schemas/workflow.schema.json` is generated by `npm run build:schemas` and is never hand-edited. Under the reference strategy the workflow schema is generated with, the nested destination becomes:

```json
"graph": {
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "additionalProperties": {
      "anyOf": [
        { "type": "string" },
        { "type": "array", "items": { "type": "string" }, "minItems": 2 }
      ]
    }
  },
  "description": "<the describe text above>"
}
```

The array's `items` is a non-empty subschema, so the generated-schema test that fails on an empty subschema at an `items` key stays green. The site's schema page picks the new description up through `npm run build:site`; the row renderer never recurses into `additionalProperties`, so the nested destination type is not rendered there and needs no further work.

Corpus impact of the widening: none. The pinned corpus at `5f92dc06` holds **17 workflows, 109 activities bound in graphs, 207 graph edges, 18 of them terminal and 0 of them list-valued**. A union accepts every existing string, no other load rule keys off the destination's JavaScript type, and the arity rule cannot break an edge that is not an array. Every existing workflow loads byte-identically, and the fan rules below are vacuous until a fan is authored.

### 4.3 The fan derivation

`src/loaders/workflow-loader.ts` gains the single derivation of a fan's shape, beside the function that already validates the graph against the activities:

```ts
export interface FanGroup {
  /** The activity whose exit fans. */
  from: string;
  /** That exit. */
  exit: string;
  /** The activities it runs together, in graph order. */
  branches: string[];
  /**
   * The activity every branch's own exits name — the derived join. Undefined where the branches
   * disagree, name more than one each, or name none. The load rejects an undefined join, so every
   * reader downstream takes it as a string on the load's authority.
   */
  join: string | undefined;
}

/** Every fan the graph declares, with the destination its branches converge on. */
export function fanGroups(graph: Graph | undefined): FanGroup[];

/** For each activity that is a branch of some fan, that fan. */
export function fanMemberIndex(graph: Graph | undefined): Map<string, FanGroup>;
```

`fanGroups` reads the graph object and nothing else — no activity lookup, no file access — so the loader keeps sole ownership of agreement with the activities, and the join has exactly one derivation. The load validates against it, the reachability analysis is handed its output, and the transition handler routes on it. Two derivations could disagree about a graph the loader had already accepted, which is the failure One Authoritative Home exists to prevent.

Two standing lines widen with it. The exit-binding record's destination field becomes `string | string[]`, and the helper that returns every activity reachable from an activity flattens through `destinationTargets` so it keeps returning a flat list — its callers read it as the set of activities this activity can reach, which for a fan is every branch.

### 4.4 The load-time checks

All of them join `validateExitBindings` in `src/loaders/workflow-loader.ts`, as a third loop after the per-activity loop that collects declared exits, inside the same error list. That function runs after fragment materialisation and the variable merge, and a non-empty return fails the load — which is the file's own stated reason for failing rather than warning: a session cannot be walked through a graph with a hole in it. Putting the fan rules there and only there is what lets every reader downstream assume a well-formed fan, and it is why no new guard is added for them.

The existing destination-existence check is the one edit to standing code: it iterates `destinationTargets(destination)` and keeps its message per target.

Ten rules. Each message names the fan by `<source>.<exit>` and names the offending branch, so the author's fix site is in the message.

| # | Rule | Message |
|---|---|---|
| L1 | Every branch is an activity this workflow contains | `Workflow graph sends 'plan-prepare.done' to 'reserch', which this workflow does not contain.` |
| L2 | No branch is named twice | `Workflow graph fans 'plan-prepare.done' to 'research' twice; a fan runs each of its activities once.` |
| L3 | No branch is the terminal sentinel | `Workflow graph fans 'plan-prepare.done' to '__terminal__'. Every branch of a fan returns to one destination, and an activity that ends the run never returns, so the fan would have no last branch to release its destination.` |
| L4 | Every branch binds at least one exit | `Activity 'research' is a branch of the fan at 'plan-prepare.done' and binds no exit, so the fan has no destination to converge on. Give it an exit bound to the activity its siblings name.` |
| L5 | No branch's own destination is itself a list | `Activity 'research' is a branch of the fan at 'plan-prepare.done', and its exit 'done' fans to 'deep-dive, survey'. A branch runs in one worker and returns to the join, so each of its exits names one destination.` |
| L6 | No branch routes an exit back onto itself | `Activity 'research' is a branch of the fan at 'plan-prepare.done' and its exit 'insufficient' returns to 'research'. A branch runs once and returns to the join, so a retry belongs inside the branch as a loop step.` |
| L7 | Every exit of every branch names one and the same activity — **the join** | `The fan at 'plan-prepare.done' converges nowhere: 'research' and 'codebase-comprehension' send their exits to 'assumptions-review', and 'implementation-analysis' sends its to 'plan-prepare'. Bind every exit of every branch to the one activity the fan converges on, which is what the run enters when the last branch returns.` |
| L8 | The join is an activity, not the terminal sentinel | `The fan at 'plan-prepare.done' converges on '__terminal__'. A fan converges on an activity, because the destination is entered once after the last branch returns and there is nothing to enter at the end of the run.` |
| L9 | No branch declares a checkpoint step | `Activity 'research' is a branch of the fan at 'plan-prepare.done' and declares checkpoint 'research-convergence'. A session holds one outstanding decision at a time, and every tool call is gated while it is held, so a gate inside a fan stops its sibling branches. Move the gate to the activity before the fan or to the activity it converges on, or take this activity out of the fan.` |
| L10 | Every branch's derived key is a legal variable name, and unique in the workflow | `Activity '2nd-pass' is a branch of the fan at 'plan-prepare.done', and its branch key '2nd_pass_outputs' is not a legal variable name. A branch lands its outputs under a key derived from its activity id, so an activity that runs in a fan carries an id beginning with a lowercase letter.` |

Three rules that a reader may expect are deliberately absent because another rule already rejects the case, and the specification says which: **a branch that is the fan's own source** is rejected by L5, since that activity's exit is the list itself; **a join that is one of its own branches** is rejected by L6, since that branch's exits would have to name itself; and **a branch declaring a starting value for one of its writes** needs no rule at all, because the merge in section 6 keeps the member declarations and their seeds intact.

L9 uses the existing checkpoint-collection helper, already imported and used a few lines above in the same function. It walks flattened activity steps, so a gate inside a loop body counts, and it runs after fragment materialisation, so a gate reached by reference counts. L10 is cheap insurance rather than a certainty: no schema constrains an activity id to begin with a lowercase letter, so the derived key is checked against the variable-name schema rather than assumed legal.

---

## 5. How a fan executes

### 5.1 The session record: one field replaces one field

`src/schema/session.schema.ts` replaces the single current-activity string with the set of activities in flight:

```ts
  /**
   * The activities in flight. One entry on an ordinary walk; one per branch while a graph fan runs.
   * A destination the graph fans is entered once, after the last of its branches returns, so this
   * holds either a single activity or the branches of exactly one fan — every exit of a branch binds
   * to its fan's join, so a branch cannot open a fan of its own. Empty between the last branch
   * retiring and the join being entered, and after the run completes.
   */
  frontier: z.array(z.string()).default([]),
```

Nothing else goes on an entry. A per-entry join is a copy of a graph fact the handler already loads; a per-entry timestamp is a copy of the entry event already in the history; a per-entry worker identity forces a distinct call outcome for a replacement worker, which section 5.4 gets for free without one. The single-slot outstanding-decision field is untouched, and the session-level exit field is untouched — its stated meaning is the exit the last completed activity took, and after three branch returns it holds the last branch's, which is that.

The old field is removed rather than kept alongside: the repo forbids compatibility layers, and a scalar kept beside the list is a second home for the run's position, which is the shadow the catalog names. The change reaches four places beyond the schema and every one of them is in the staged plan: the resolver in `src/utils/session/resolver.ts`, the canonical key ordering in `src/utils/session/store.ts` (which feeds the seal), the legacy converter in `src/utils/session/migration.ts`, and every reader in `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts` and `src/logging.ts`.

One resolver, one home, added beside the existing session view:

```ts
/**
 * The activity a call belongs to: the one it names when the frontier holds it, or the sole entry
 * when a call names none and only one is in flight — every ordinary walk, so a session with no fan
 * open never reaches the named case. Undefined otherwise: the caller refuses rather than guessing,
 * because a guess serves one branch another branch's activity.
 */
export function heldActivity(state: SessionFile, named: string | undefined): string | undefined;
```

### 5.2 The transition tool: one rule, three behaviours

`next_activity` in `src/tools/workflow-tools.ts` takes one widened parameter and one new one:

```ts
      activity_id: z.union([z.string(), z.array(z.string()).min(2)]).describe(
        'Where the run goes next: an activity id, `__terminal__`, or — where the graph fans the exit taken — the whole list of activities to run together, exactly as the graph names them. Returning a branch of a running fan, this is the activity the fan converges on: the server enters it once, when the last branch returns.',
      ),
      from_activity: z.string().optional().describe(
        'The activity this call is exiting — the one `exit`, `step_manifest`, `variables_changed` and `artifacts_produced` belong to. Omit while one activity is in flight; required while a fan is running, so the call names which branch returned.',
      ),
```

The handler resolves in one rule, and the three behaviours fall out of it rather than being cases:

1. **Resolve the retiring activity.** Named and in the frontier: that one. Named and absent: refuse. Unnamed with at most one entry: the sole entry, or none on the first call of a session. Unnamed with several: refuse.
2. **Retire it.** Record the exit event, add it to the completed set, set the session exit, apply its reported variable writes under its branch key where the graph fans it, emit one step-completed event per manifest entry, record the activity outcome — all attributed to the retiring activity, exactly as the exiting activity is attributed today.
3. **Remove it from the frontier.**
4. **Enter `activity_id` if and only if the frontier is now empty.** A list pushes every member and emits one entry event each. A string pushes one and runs the terminal check. The terminal sentinel retires and does not push: the completed status is the record.
5. **Otherwise enter nothing** and report the barrier reading.

On an ordinary walk the frontier holds one entry, so step 4 always fires and behaviour is identical to today. On a fan enter the source is the sole entry, so it retires and the list is pushed. On a branch return with siblings still live the frontier stays non-empty and nothing is entered. On the last branch return the frontier empties and the join is entered by the same call.

**That is the whole barrier.** There is no separate barrier-met call and no separate join-enter call, so entering the join early is not refused — it is unrepresentable, because the only call that can enter the join is the one that empties the frontier. Single entry after the last return is therefore a property of the store rather than of an orchestrator remembering to wait, and a crashed and resumed orchestrator re-derives it from the session file with no extra state. This is Encode Constraints as Structure taken as far as it goes here, and it is the strongest available realisation of implicit convergence.

The same rule subsumes a hazard that today needs its own prohibition: a second advance off an activity already retired names an activity the frontier no longer holds, and is refused. The `one-advance-per-activity` rule in `continue-batch` states the consequence and points at the tool.

Refusals, verbatim:

```
Cannot exit 'research': the session is not on it. In flight: codebase-comprehension, implementation-analysis. Pass from_activity naming the branch this call is returning.

Cannot advance: 3 activities are in flight (research, codebase-comprehension, implementation-analysis). Pass from_activity naming the branch this call is returning; the destination is entered once, when the last one does.

Activity 'plan-prepare' binds exit 'done' to a fan, so 'exit' is required on this transition to say which destination it takes.
```

The barrier reading rides every fan-related response in one shape: `_meta.barrier = { destination: 'assumptions-review', pending: ['implementation-analysis'], met: false }`, and `met: true` with an empty pending list on the call that enters the join.

Four sites in the same handler follow the resolved retiring activity rather than the removed field, and all four are gated on it being present today, so leaving them unrepointed would silently disable them for every branch return: step-manifest validation, technique-fetch fidelity validation, the missing-manifest advisory, and the reported-exit check. Two more sites in the same file resolve the exiting activity for the batch reading and stamp the trace segment — and the trace payload stamps the **retiring branch**, not the target, or all three branch segments would carry the join's id.

Two payload sites in the same file render a destination and must stop interpolating it directly: a checkpoint option's stated consequence, and the immediate-exit message. The compiler catches neither, because an array stringifies happily into `whose next target is 'research,codebase-comprehension,implementation-analysis'`.

The reported-exit check in `src/utils/validation.ts` satisfies a reported exit when the requested activity is among the destination's targets, and compares set-wise on a fan enter. The transition-order check in the same file flattens. Both are advisory, so leaving them unwidened produces a spurious warning on every single fan transition, which is how an orchestrator learns to stop reading that channel.

### 5.3 The worker's view

`get_activity` in `src/tools/workflow-tools.ts` gains the parameter that `get_technique` in `src/tools/resource-tools.ts` already has, so this is Convention Over Invention rather than invention:

```ts
      activity_id: z.string().optional().describe('Optional. The activity you were dispatched for. Omit while one activity is in flight; required while several are, and refused when the session is not on the activity you name.'),
```

Refusals:

```
get_activity: this session is on 'codebase-comprehension', not the 'research' you were dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.

get_activity: 3 activities are in flight (research, codebase-comprehension, implementation-analysis). Pass activity_id naming the one you were dispatched for.

No activity in flight. Call next_activity first.
```

`get_technique`'s existing mismatch guard becomes the same membership test, and every read of the removed field in `src/tools/resource-tools.ts` — resource provenance, child dispatch attribution, technique scope resolution and step lookup — resolves the same way.

Delivery scoping is untouched: it keys on the calling context's identity, which each branch carries, so each branch takes full delivery correctly however its activity is resolved.

One rule is **not** strengthened by this, and the specification says so rather than claiming otherwise: `verify-dispatched-activity` in `activity-worker` stays a worker rule, unamended. A worker whose composed prompt names a sibling's activity is served that sibling's body, because a membership test admits every branch of a running fan. That check has to stay where it is; section 11 carries the residual risk and the trigger for adding a per-branch identity if a mis-composed prompt is ever observed.

### 5.4 The gate refusal, and the one shared ambiguity guard

Two tools write one activity id into the record and cannot be answered while several are in flight. One helper beside the existing outstanding-decision assertion in `src/utils/session/params.ts` serves both:

```
Cannot yield checkpoint 'research-convergence': 3 activities are in flight (research, codebase-comprehension, implementation-analysis), and a session holds one outstanding decision at a time — every tool call is gated while it is held, so a gate here stops your sibling branches. Finish this activity without the gate, or report the outcome one of its own exits provides.

Cannot dispatch a child workflow: 3 activities are in flight (research, codebase-comprehension, implementation-analysis).
```

The yield refusal is not redundant with the load rule. The load rule keys on declared checkpoint steps; the yield tool also admits a decision no definition mentions, whenever a call carries a message and at least two options, and no static check can see that. Different populations, both closed. The refusal is also what keeps one branch's gate from blocking its siblings' technique and resource fetches, which is what turns a mid-branch gate from a delay into a deadlock.

The three checkpoint-resolution tools key on the outstanding decision's own activity, not on the frontier, and are unreachable during a fan. No change.

### 5.5 The concurrent dispatch operation

A new operation, `workflows/meta/techniques/workflow-engine/dispatch-fan.md`. Not a mode on `dispatch-activity`: a mode would make one operation carry two procedures a caller selects exactly one of, force its rules into "when the destination is a list, do X instead", and pluralise outputs that the drive loop reads through condition gates whose dialect has no list test. Atomic Techniques; Compose at Activities, and Modular Over Inline for keeping the procedure out of the activity file.

> **Capability** — Run the activities one exit fans to as concurrent workers in a single turn, and hand back the destination they converge on.
>
> **Inputs**
> - `branch_activities` — The activities this fan runs together, in graph order.
> - `exiting_result` — The completion envelope of the activity whose exit fans: its exit, step manifest, variable writes and artifacts travel on the fan-enter call.
> - `session_index` — Session index of the session whose fan is being dispatched.
> - `agent_technique` — Canonical agent technique for each branch worker. Default `workflow-engine::activity-worker`.
> - `state` — Current variable state for prompt substitution.
> - `planning_folder_path` — *(optional)* Path to the planning folder whose progress surface is updated. Unset until the folder exists.
>
> **Outputs**
> - `join_activity` — The activity the fan converges on, as the barrier reported it when the last branch retired.
> - `trace_tokens` — The opaque signed trace tokens this fan accumulated, one per transition call that returned one.
>
> **Protocol**
> 1. **Publish the in-progress marks, once.** Apply `sync-progress-status` for the dispatch moment once per branch, then apply `version-control::commit-regular-files` **once**, naming the planning README alone, with a message stating which activities are entering progress. Every branch spawns in the same turn, so one commit publishes every mark inside the window `dispatch-mark-reaches-the-remote` fixes. Skip when the planning folder path is unset.
> 2. **Enter the fan.** Call `next_activity` with `activity_id` set to the whole `branch_activities` list, and with the exiting activity's report from `exiting_result`. One call: the source retires once, and every branch opens. Accumulate the returned trace token.
> 3. **Mint identities.** Mint one worker identity per branch, distinct from each other and from the session's own agent identity.
> 4. **Compose one prompt per branch.** Apply `compose-prompt` per branch with `agent_technique`, `holds_prior_deliveries: false`, and `state` plus that branch's activity id and its minted identity.
> 5. **Spawn the batch.** Apply `harness-compat::spawn-concurrent` with the composed prompts as one batch, and await every envelope.
> 6. **Retire the branches, in input order.** Per branch: reject a non-envelope per `reject-partial-worker-result`; apply `commit-and-persist` for that branch; call `next_activity` naming the join as the target and that branch as `from_activity`, carrying that branch's exit, manifest, writes and artifacts and its own identity; accumulate the trace token; account for that branch. The barrier reading names the branches still outstanding, and on the last it reports the destination it entered.
> 7. **Hand back the destination** the barrier reported.
>
> **Rules**
> - `one-identity-per-branch` — Each branch is a fresh context under an identity of its own, distinct from every sibling's and from the session's own agent identity. The delivery ledger and the batch bound are both keyed on the identity, and a scope equal to the session's own agent is exempt from the bound, so a shared or session-equal identity puts the whole fan outside it and delivers a reference marker to a context that never received the bytes.
> - `a-branch-takes-one-activity` — A branch carries exactly one activity. Its only exit target is the join, which the barrier owns, so a branch's reported next activity is not this operation's to act on. The join is a fresh dispatch through `dispatch-activity`, which is the second of the two paths `one-advance-per-activity` already names.
> - `replace-one-branch` — A branch whose result is not an accepted envelope is replaced alone: mint a new identity, compose with `holds_prior_deliveries: false`, and apply `spawn-agent` — one agent, so not `spawn-concurrent`. The replacement names the same activity, which the frontier still holds, so it needs no re-binding call. The returned siblings are untouched: their work is committed and their outputs landed on their own returns, so a failure costs one branch. One replacement per branch; then apply `sync-progress-status` for the blocked moment on that branch's rows and advance nothing. The frontier keeps the live entry, so a later resume derives the same barrier.
> - `liveness-is-tested-per-branch` — Every branch has returned something by the time a concurrent turn resumes, so the `dispatch-activity` recovery ladder's live-worker test is made per branch against the returned batch rather than against one awaited agent. Where the harness keeps a returned agent addressable, a branch still owing an envelope is continued under its own identity.
> - `no-gate-in-a-branch` — A branch reaches no gate. The load rejects a fan whose branches declare one and the yield tool refuses one they do not, so a fan needs no gate arbitration and no waiting policy.
> - `persist-the-fan-before-any-branch-returns` — The fan's engineering artifacts and status are committed and pushed once, naming every branch, before the first branch's transition, so `commit-after-activity` holds for all of them. The branches write one working tree in one turn, so changes there are indistinguishable by author and a per-branch commit attributes one branch's in-flight edits to another.
> - `say-what-a-fan-is-doing` — `say-what-a-dispatch-is-doing` governs at fan grain: before the turn that spawns them, name every branch about to run and say that no gate will arrive.
>
> Cites, and does not restate: `account-every-activity`, `delivery-keys-on-agent-context`, `reject-partial-worker-result`, `batch-is-bounded-by-the-server`, the trace-accumulation half of `dispatch-activity`, and `resolve-trace-at-close-out`.

**Why the wait is free.** The harness rule `concurrent` in `harness-compat/claude-code.md` says to emit several agent calls in a single response turn, that the harness runs them in parallel, and to wait until every one yields or completes before treating the batch as finished. `foreground-always` makes the blocking-equivalent wait a contract rather than an option, and `spawn-concurrent` collects results in input order. A turn does not resume until every tool result returns, so joining the envelopes is a fact of the turn: nothing polls, nothing times out, nothing is scheduled. The barrier in the store is the other half, because orchestrator discipline is not enforcement.

### 5.6 The bind site

`workflows/meta/activities/03-dispatch-client-workflow.yaml`, and only there. It is the one activity in the corpus whose steps the top-level agent executes inline — which is why it can already bind `dispatch-activity`, whose protocol spawns. `depth-1-only` in `spawn-agent` states the reason and sanctions this design by name: a spawned agent has no dispatch primitive, parallel scatter is available only where the primitive is, and a pass whose fan-out is worth an orchestrator-owned step should be hoisted there. That is also why `orchestration-patterns::dispatch-workers` is left alone: every one of its binding sites is a client activity executed by a dispatched worker, so neither of its concurrency branches is executable there — a standing defect this change neither fixes nor worsens.

The condition dialect for step gates admits equality, comparison, bare truthiness, negation, conjunction, disjunction and parentheses. It has no list test, no length and no indexing, so the loop keeps carrying one in-flight thing and the fan's plurality lives inside one step of one iteration. Three new steps, two gate edits, one loop-condition edit; the checkpoint trio, the artifact commit and the identity release are untouched.

```yaml
    continueWhile:
      type: or
      conditions:
        - { type: simple, variable: current_activity, operator: "!=", value: null }
        - { type: simple, variable: current_branches, operator: "!=", value: null }
    steps:
      # continue-batched-worker unchanged: no worker identity is held on a fan iteration
      - kind: technique
        id: dispatch-fan
        when: current_branches != null
        technique:
          name: workflow-engine::dispatch-fan
          inputs:
            branch_activities: current_branches
            exiting_result: worker_result
            session_index: client_session_index
          outputs:
            join_activity: current_activity
      - kind: action
        id: close-fan
        when: current_branches != null
        actions:
          - { action: set, target: current_branches, value: null }
          - { action: set, target: worker_result, value: null }
      - kind: technique
        id: dispatch-activity
        when: "!worker_agent_id && current_activity != null"
        # body unchanged
      # checkpoint trio and commit-activity-artifacts unchanged
      - kind: action
        id: advance-activity
        when: worker_result.result_type == "activity_complete" && !worker_result.next_activity_ids
        # body unchanged
      - kind: action
        id: advance-to-fan
        when: worker_result.result_type == "activity_complete" && worker_result.next_activity_ids
        actions:
          - { action: set, target: current_branches, value: "{worker_result.next_activity_ids}" }
          - { action: set, target: current_activity, value: null }
      # release-spent-worker unchanged
```

The destination arrives through an output remap rather than a copying assignment, which is the sanctioned deviation form. Clearing the previous iteration's worker result is what leaves every gate keyed on it false during a fan iteration with nothing re-authored — the precedent is in the same file, where the spent-worker step already nulls the identity for exactly that reason. The two advance steps are disjoint and each fully determines both control names, so no path leaves either undefined; they are not a shadow of one another, because they are the two shapes a destination takes and exactly one is ever populated. Both control names are produced and consumed inside this one activity, so they need no declaration for the same reason the current-activity name needs none today.

### 5.7 Envelope and routing

`finalize-activity` gains one output beside the singular next activity:

> #### next_activity_ids
> The activities the exit taken fans to, where the graph names several. Exactly one of this and `next_activity_id` is present on every successful completion: the destination is either one activity or a fan, and the envelope reports whichever this context read.

`evaluate-transition` is the single home for reading where an exit sends the run, so the one-or-many shape is read there and nowhere else: its destinations input states that a destination may name several activities, and its protocol reports the singular field for one activity and the plural field for a fan.

Delivery, without which the bind is inert: `src/loaders/core-ops.ts` gains `harness-compat::spawn-concurrent` and `workflow-engine::dispatch-fan`, and `workflows/meta/workflow.yaml` gains `dispatch-fan` in its workflow technique roster. The comment in that loader file states the mechanism: an operation named inside another operation's protocol has no other delivery path, so an orchestrator without the entry reaches the step with nothing to apply and improvises the invocation.

Rule amendments, so that no surviving description of a single-worker topology reads as current fact: `dispatch-topology` in `dispatch-activity` names the fan route beside the batched walk and notes that a fan's branches are fresh contexts each taking full delivery; `no-domain-work` in `orchestrator-conduct` names `dispatch-fan` as a delegation route beside `dispatch-activity`, and `one-level-of-indirection` states its invariant positively — every agent touching a run is one the orchestrator placed there, whatever the width of a dispatch, because width is not depth; `activity-worker` gains a rule that a branch of a fan reaches no gate and what to report instead; `one-advance-per-activity` in `continue-batch` states that a call naming an activity the frontier no longer holds is refused; `commit-after-activity` in `commit-and-persist` states that a fan persists once, at convergence, naming every branch, before the first branch's transition; the progress call-site table in `planning-readme` gains the fan's two moments and states that the not-applicable marker is one value per persist, so no two branches may set it; and the orientation paragraph in `workflows/meta/activities/README.md` states that the drive loop carries either one activity or a fan of branches rejoining one destination.

The batch module is not changed. A branch cannot be continued, because the fan operation writes neither a worker result nor a worker identity, so the continue gate in the drive loop is structurally false, and the frontier's retiring-activity refusal is the backstop. The bound could not refuse a branch anyway: a scope with no activity yet is exempt, and a branch scope has exactly one activity, so its first delivery is always admitted. A fan's width is therefore not bounded by the batch bound, and section 10 says why it is not bounded anywhere.

---

## 6. How branch outputs stay separate

### 6.1 The branch key

Take the activity's id, replace every hyphen with an underscore, append `_outputs`. `research` becomes `research_outputs`; `codebase-comprehension` becomes `codebase_comprehension_outputs`; `implementation-analysis` becomes `implementation_analysis_outputs`. It lives once, as `branchKey` in `src/schema/workflow.schema.ts`.

Derived rather than declared in the graph, for three structural reasons. A declared key would be a second name for the branch that has to be kept in agreement with the activity id, and two fans could spell one activity's key differently — One Authoritative Home. It would be unknowable to a worker, because the control-plane ban keeps a worker out of the workflow summary, so it would have to travel as per-dispatch data the envelope contract does not carry, and the server, the orchestrator and the guard would each need the graph in hand to spell it. And it would be forgeable: a derived key cannot be mistyped, so the agreement between a fan and its join's declared reads is mechanical rather than authored — Encode Constraints as Structure.

The suffix is what makes the derivation total. A variable name must be a snake-case noun phrase of at least two words, or a listed bare-word exemption. `codebase_comprehension` passes on its own; `research` is one word and would need an exemption entry for every single-word fanned activity id in the corpus. One uniform suffix removes that list, and a plural item-noun collection name is the shape the catalog already sanctions. Hyphens are excluded because the bag-name grammar excludes them and because any symbol that binds to session state is snake-case.

A branch key belongs to the activity, not to the fan, so two fans containing one activity write the same key and the second visit replaces the object whole — variable writes assign, they never merge, which is the only behaviour consistent with there being no merge policy. Stated positively: **a branch key holds the outputs of the most recent visit to its activity; a join that needs an earlier visit's values gathers them into a name of its own at that visit.**

### 6.2 Where the wrapping happens

In the server, inside the branch-return transition call, immediately before the variable writes are applied. The worker reports bare names, unchanged, exactly as `finalize-activity` already specifies. The orchestrator relays that map on the call that retires the branch. The handler already loads the workflow, so it derives the fan from the graph, and lands the branch's whole reported map as one object under the key.

```ts
        // A branch's outputs land whole under a key of its own, so two branches cannot collide by
        // construction. The key is derived from the graph this handler already loaded — never
        // supplied by a caller — which is what makes the namespace the only route a branch's values
        // have into the bag. Corpus rule: meta/techniques/scatter-gather.md#isolation-then-combine.
```

Not the worker. An operation's outputs are a bind contract stating what a value *is*, never which caller or graph position produced it — Separate Contract from Procedure, and the rule that a binding carries only deviations. A worker that namespaced its own outputs would rename every landed output by call site, and the contract derivation reads writes off the composed operation signature and the step remap target and knows nothing about graph position, so every fanned activity's derived contract would disagree with its declaration.

Not the orchestrator. It can see the fan, since the workflow summary returns the graph verbatim, so it could wrap on relay. But then "no branch writes a bare name" is a habit rather than a structure, and a relay that forgets to wrap lands bare names in total silence: the write path skips both the declared-type check and the value-set check when a name has no declaration, so an unwrapped shared name from two branches simply clobbers, warning-free.

The other two write paths out of an activity are not wrappable and are closed rather than namespaced. The yield tool applies its reported writes at bare names, and the checkpoint-response tool applies an option's variable effect at bare names, both keyed on the single outstanding-decision slot. The gate ban closes both, so the transition call is the only write path a branch has and it is wrapped — Prefer Removing the Thing That Needs a Prohibition, rather than a second wrapping rule for the checkpoint channel.

Inside a branch, names stay bare: a branch's later steps read its earlier outputs as internal reads, never through the key.

### 6.3 The mechanism, and why members stay validated

`applyVariableWrites` in `src/utils/variable-seed.ts` gains one optional context field, `under?: string`. Its per-name validation loop runs **unchanged** against the declaration map its caller supplies; only the commit changes, from one assignment per name to one assignment of the whole map under the key, with the variable-set event carrying `key.member` as the name so the event stream says where each value landed.

The declarations the members are validated against come from the retiring branch activity's **own** declared writes, read at the moment of the wrap. That is the important detail and it is what makes the change safe: validation does not depend on what the declaration merge does, so every member keeps its declared-type and value-set warning exactly as today — including the three-value set on the research activity's context-scope output. Without this, namespacing would *remove* the only check on the one agent-supplied record the server does not type, for precisely the activities a fan runs.

The flat assignment underneath is exactly right for a key holding a nested object, which is what a dotted read requires. Nothing else in that module moves.

### 6.4 The read form, and the gather step

A join reads `{research_outputs.open_assumptions}`. The `variable-binding` technique already lands nested-object outputs whole so that a dotted path resolves against the landed object, and already has a later gate, condition, transition or template read a dotted path with the structured evaluator walking it. A flat key literally named `research_outputs.open_assumptions` would never be found by that walker, which is why a branch's whole map lands as one object under one key.

The gather is an ordinary technique step in the join activity, using the two deviation forms already sanctioned — the dotted-projection template and the output remap. No new construct:

```yaml
      - kind: technique
        id: gather-branch-assumptions
        technique:
          name: review-assumptions::reconcile
          inputs:
            research_assumptions: "{research_outputs.open_assumptions}"
            comprehension_questions: "{codebase_comprehension_outputs.open_questions}"
            analysis_assumptions: "{implementation_analysis_outputs.open_assumptions}"
          outputs:
            reconciled_assumptions: open_assumptions
```

The join declares the three branch keys among its reads, which is what puts them in the guard's namespace. There is no implicit way to read a branch member, because the bare name no longer lands — so "a join that needs a combined value declares a step that gathers it" is structural rather than a rule an author must remember. That is the payoff of the second fixed decision, and it is `isolation-then-combine` at graph grain: per-unit outputs are never auto-bound into the parent bag by scalar name, and combination happens exclusively in the combine phase. `scatter-gather` gains that application, and `one-gather-contract-two-scatter-modes` gains the graph fan as a third scatter mode over the same combine contract — otherwise the rule reads as covering only in-activity fan-out and the graph fan looks like a duplicate shared capability.

### 6.5 The declaration merge, and what the guard sees

Two files: `src/utils/activity-variables.ts`, the module the server and the guards share so they cannot drift, and `scripts/check-activity-variables.ts`.

**The merge adds the container; it does not replace the members.** `mergeActivityVariables` takes the set of activity ids the graph fans in this workflow, and for each one contributes one further declaration — `{ name: branchKey(id), type: 'object', description: '…' }` — **in addition to** that activity's own write declarations. Adding rather than substituting is the decision that keeps three things working. The members keep their declared types and value sets in the merged set. The members keep their starting values, so a branch's seeded defaults still reach the bag — substituting would drop eight of them from the research activity alone, and one of those seeds a gate in that activity's own steps, so the loss would be a silent runtime behaviour change made for the guard's benefit. And the merge's own contradiction check, which reports two activities declaring one name with disagreeing type or starting value, keeps running over the members.

Contribution stays per workflow, which is required rather than incidental: the same activity keeps contributing flat in a workflow whose graph does not fan it.

**The guard re-keys the write side.** In `scripts/check-activity-variables.ts`, for an activity the graph fans, the declared-write set becomes the single container plus one entry per member spelled `container.member`, and **not** the bare member names. That is the read-side enforcement of no-bare-writes: any activity still declaring a bare read of a fanned activity's output is reported, because nothing writes that name any more. It is also what stops the container's presence in the merged set from blessing a bare read.

Four further changes, each against a named failure:

1. **One grammar, one home.** The read collectors return the full dotted reference instead of pre-splitting it, and the read function does the split — taking the head for the namespace test and recording the full reference in a new `pathReads` set on the derived contract. Today the tail is discarded before any check runs, so member grain is not visible at all. Four lines.
2. **Re-key the productions.** The contract derivation takes an optional branch key; when set, every bare production is recorded as a member of that key and the key is the write. The landing site takes the key in place of the bare name for artifact writes and persisted productions too, or the artifact-write exemption stops applying and every artifact-valued branch output becomes an unread write.
3. **Member-grain reporting, under the existing family names**, so no new ledger and no new registry entry. A dotted read whose head is a branch key must name a member that branch produces: `reads 'research_outputs.open_assumtions', which 'research' does not produce; it lands assumptions_log, open_assumptions, research_document`. And a member no join gathers: `writes 'research_outputs.challenge_findings', which nothing in this workflow gathers`. The second must carry forward the exemption the flat check already has — an activity that writes a working value and reads it back within its own steps is not reported — or the family fires on the order of 35 times on one correct fan, because most of a branch's declared writes are intra-activity working values such as loop items and step gates.
4. **One new finding family, `fan-artifact-collision`**: two activities of one fan whose composed technique signatures resolve the same artifact filename. `The fan at 'plan-prepare.done' has 'research' and 'implementation-analysis' both writing artifact 'assumptions-log.md'. Two activities running together resolve one filename to one file, so one branch's writes land in the other's document.` It lives in the guard rather than the loader because it needs composed technique signatures, which the loader does not compose and must not start composing on the per-call load path. That is the home split: shape rules decidable from the graph object go in the loader; rules needing composed signatures go in the guard. It is decidable only for literal filenames; templated names fail closed.

**This is the one new check on the safety floor.** The artifact writer is keyed on a bare filename with a find-or-update and a re-scan mint guard, so two concurrent branches both re-scan, both create, and the run thereafter resolves the lowest-numbered instance for the rest of the walk — data loss, not hygiene. Every other new family here is a definition-hygiene check. A later trim may take those; it must not take this one.

### 6.6 The reachability analysis

`unreachableReads` in `src/utils/activity-variables.ts` runs two traversals and the change lands on both, differently. (A correction to the ground the brief carried: there is no `computeUnavailableReads` anywhere in the tree — the function is `unreachableReads`, fed by `activityGraph` and called from the guard script; and it is not one forward walk but a forward reachability search that decides scope followed by a backward definite-assignment fixed point that decides availability.)

**The traversal.** `activityGraph` gains a one-line flatten through `destinationTargets`. Without it the map holds arrays where branch heads belong, the membership test that enqueues a successor is false for every branch, and no branch head is ever reachable — so every read in every branch stops being checked; and the predecessor index never records a branch's predecessor, so the fixed point short-circuits and the branch's available set stays at the universe of every declared name. The definite-assignment check is not wrong for a branch, it is **disabled** for it, in a guard the registry describes as hard zero with no ledger to diff. The graph type itself does not change and the two other traversals over it — the cycle grouping and the self-loop test — are untouched.

**The meet.** The existing meet is intersection over predecessors, which is the right model for the convergences the corpus already has: nine edges converge on one report activity and six on one plan activity by *alternative* routes, exactly one of which carried control. A barrier is the other thing. All branches ran, so the join's entry state is the **union** of what they leave. Left as an intersection, a name only one branch writes drops out at the join and a correct declared read becomes a false finding an author would "fix" by moving declarations.

So arrivals meet, not predecessors. An *arrival* is one way control can reach a node: a completed fan is **one** arrival contributing the union of its live branches' outgoing sets; an ordinary predecessor is its own arrival. Control still comes by exactly one arrival, so arrivals intersect.

`unreachableReads` takes one new argument, the fan groups, supplied by the guard script from the loader's single `fanGroups` derivation — so the grouping has one home and the graph type stays a flat reachability map. Three ways to apply this and have it do nothing, all three of which must be got right:

- **A branch must be removed from the plain predecessor index for its join.** Otherwise the branches appear both as one union arrival and as several intersecting ones, and the intersection wipes the union straight back out.
- **The candidate seed moves** from the first predecessor's outgoing set to the first arrival's, or a union arrival's extra names are never candidates.
- **A branch head's own predecessor is ordinary.** The fan source's post-state is where each branch starts; nothing special.

Termination is unaffected: the analysis descends from the universe to a fixed point over the powerset lattice ordered by superset, each outgoing set is non-increasing across iterations, and both a union and an intersection of non-increasing sets are non-increasing. The change is the meet operator, not the lattice — and the lattice does not need to change *because* branch writes are namespaced: a branch contributes exactly one flat bag name whatever object landed under it, so the head-taking read resolves a downstream dotted read to it. Had branches written bare shared names, the join would have needed a per-name provenance lattice instead of a set of names, and this would be a rewrite rather than a meet-operator change.

**One other graph reader.** `scripts/check-review-mode-gating.ts` declares the graph's shape itself and parses raw YAML rather than loading, so the fan rules cannot protect it. It imports the destination type from the schema module and flattens list destinations before walking. Unflattened, its activity lookup on an array is undefined and every activity beyond a fan drops out of its reachability set — a silent under-report of exactly the class the guard exists for, which for a fan sitting between the initial activity and the rest of the graph is most of the workflow. The walker in `tests/e2e/walker.ts` declares the same shape and is imported by `scripts/smoke/smoke-orchestrator.ts`; both import the type instead of re-declaring it.

---

## 7. What is enforced, and where

One row per invariant. **schema** is carried by the zod type and surfaces as a parse error. **load** is a failure from `validateExitBindings`. **tool** is a server refusal at the boundary. **derived** means unrepresentable, so nothing needs checking. **guard** is a hard-zero finding of the existing `activity-variables` registry entry. Rows marked **not structural** are contracts an actor honours; they are listed so no reader mistakes them for enforcement.

| # | Invariant | Where | What it reports |
|---|---|---|---|
| 1 | A fan names at least two activities | schema | `graph.plan-prepare.done: a fan names at least two activities; an exit that leads to one activity names that activity` — also for an empty list |
| 2 | A destination is a string or a list of strings | schema | `graph.plan-prepare.done: a destination is an activity id, `__terminal__`, or a list of at least two activity ids` — for a number, a non-string member, or a nested list |
| 3 | Every branch is an activity this workflow contains | load | L1 |
| 4 | No branch is named twice | load | L2 |
| 5 | No branch is the terminal sentinel | load | L3 |
| 6 | Every branch binds at least one exit | load | L4 |
| 7 | No branch fans again | load | L5 — also rejects a branch that is the fan's own source |
| 8 | No branch routes an exit back onto itself | load | L6 — also rejects a join that is one of its own branches |
| 9 | Every exit of every branch names one and the same activity — **the join** | load | L7. This is the barrier derivation; every reader downstream takes the join as a string on the load's authority |
| 10 | The join is an activity | load | L8 |
| 11 | No branch declares a gate | load | L9 |
| 12 | Every branch key is a legal, unique variable name | load | L10 |
| 13 | No undeclared gate is yielded from a fan | tool | The yield refusal in section 5.4. Not redundant with row 11: the tool admits a decision no definition mentions |
| 14 | A tool that writes one activity id into the record is unambiguous | tool | The child-dispatch refusal in section 5.4, from the same helper |
| 15 | A call exits an activity the session is actually on | tool | The two transition refusals in section 5.2. Also subsumes the second-advance hazard `one-advance-per-activity` names |
| 16 | A transition off an activity whose exit fans says which exit it took | tool | The exit-required refusal in section 5.2 |
| 17 | A worker is served an activity the session is on, and never guessed at | tool | The three `get_activity` refusals in section 5.3, and the same membership test on `get_technique` |
| 18 | **The join is entered once, after the last branch returns** | derived | Nothing to report. The only call that can enter the join is the one that empties the frontier, so early entry is unrepresentable and the barrier reading is a reading rather than a refusal |
| 19 | Entering a fan retires its source exactly once | derived | One call enters every branch, so there is no second retirement to prevent — the corruption `one-advance-per-activity` names cannot arise |
| 20 | At most one fan is open, so the frontier needs no fan identity | derived | Rows 7, 8 and 9 together: a branch's exits all name one non-list destination, so no branch can open a fan |
| 21 | A branch cannot take a second activity | derived | The fan operation writes neither a worker result nor a worker identity, so the drive loop's continue gate is false. Row 15 is the backstop |
| 22 | **No branch writes a bare shared name** | derived | Nothing to report. The transition call is a branch's only write path once rows 11 and 13 close the checkpoint channel, and that path is wrapped from the graph the handler already loaded |
| 23 | Every member of a branch's map matches its declared type and value set | tool, warn-only | Today's wording, unchanged: `variables_changed 'context_scope': value "everything" is outside the declared value set […]; stored as written.` Validated against the branch activity's own declared writes |
| 24 | Nothing reads a branch output by its bare name | guard | `unwritten-read`: reads a name no activity writes and the workflow file does not own |
| 25 | Every member a gather names is one its branch produces | guard | `unwritten-read` at member grain. The only detector of a mistyped member; a mistyped **key** is caught by `unused-declaration` on the join's own declared read |
| 26 | Every member a branch produces is gathered somewhere | guard | `unread-write` at member grain, with the self-consumed exemption carried forward |
| 27 | A read at the join is satisfied on every arrival | guard | `unreachable-read`. Left as a predecessor intersection this reports false findings on a correct fan; left unflattened it reports nothing at all |
| 28 | A gate reachable only through a fan is still audited for a review-mode auto-advance | guard (`review-mode-gating`) | Without the flatten the whole subtree beyond a fan drops out of the reachability set |
| 29 | No two branches of one fan write one artifact filename | guard | `fan-artifact-collision`. **Safety floor**, and literal filenames only |
| 30 | Each branch runs under its own identity, distinct from its siblings' and from the session's own | `dispatch-fan` rule | **Not structural.** The bound exempts a scope equal to the session's agent, and a scope with no activity yet, so nothing refuses a shared identity. Visible after the fact in the batch reading |
| 31 | Every branch carries exactly one usage entry | `account-every-activity`, cited by the fan operation | **Not structural.** A branch with no entry appears in the activities-without-usage list, which is the wanted reading — an activity whose harness reported nothing, never one that cost zero |
| 32 | The in-progress mark for every branch reaches the remote before the spawn | `dispatch-fan` protocol, one commit for all branches | **Not structural**, and no more so than for a single dispatch today |
| 33 | One persist at convergence, naming every branch | `persist-the-fan-before-any-branch-returns` | **Not structural.** The commit operation derives its paths from the working tree, which cannot tell two branches' changes apart |
| 34 | A worker executes the activity it was dispatched for | `verify-dispatched-activity`, a worker rule | **Not structural**, and not strengthened by this change. A prompt naming a sibling's activity is served that sibling's body. See section 11 |
| 35 | The fan rules have exactly one home | — | No 37th entry joins the **36** in the guard registry. A malformed fan cannot be walked at all, which is why the load fails rather than warns; a guard would let a session start on a graph the guard rejects. The workflow-YAML guard already fails the corpus on any load error, and six other guards load and inherit it |

---

## 8. The prerequisite

Issue #655. Every mutating handler rewrites the whole session file from a snapshot taken at load, with no staleness check, no version, no compare-and-swap and no lock anywhere. Two workers advancing one session concurrently silently lose one of them. That is assumed fixed and is not designed here or designed around.

**What this design needs from the fix, in one line:** each session's read-modify-write must be serialised as a compare-and-swap on the record's sequence number with retry, so that the concurrent history appends several branch contexts make — activity dispatched, technique bundled, step started, resource fetched — all survive rather than the last writer winning.

Two clauses of that sentence are load-bearing. **All the appends must survive**, because the batch bound, the delivered-character tally and the fresh-versus-resume reading are every one of them derived from exactly those events, and the delivery tool's own comment says its reload-before-save narrows the window without closing it. **Compare-and-swap rather than a lock**, because a per-session write lock would serialise the branch workers' delivery calls behind one another — each of which composes an activity payload of roughly a hundred thousand characters and then canonicalises, seals and atomically writes — and wall clock is the only thing a fan buys.

---

## 9. Staged plan

Seven stages. Stages 1 through 5 are independently mergeable in order and none of them can execute a fan, so each lands with the capability inert. Stage 6 is gated on #655. Stage 7 is the corpus and does not gate the merge.

**One rule spanning stages 1 to 5.** For the duration of the window in which the schema accepts a fan and the runner cannot execute one, `validateExitBindings` rejects any list destination outright with a message naming the stage that lands the runner. One line, deleted by stage 6. That turns the ceiling into a load failure rather than a stage note, and it makes every intermediate stage's "no corpus movement" acceptance criterion provable rather than argued, because the corpus cannot then carry a fan at all.

### Stage 1 — the schema and the load gate

`src/schema/workflow.schema.ts`: the union with both messages, the widened description, the three derivations. `src/loaders/workflow-loader.ts`: `fanGroups` and `fanMemberIndex`, the widened destination field, the flattening reachable-activities helper, the widened destination-existence loop, and the ten fan rules. `npm run build:schemas` and `npm run build:site`, both committed. `tests/workflow-loader.test.ts`: one case per rule L1 to L10, plus a well-formed fan accepted, plus the binding record carrying a list and the reachable-activities helper returning every branch head.

*Acceptance.* `npm run check:all` green with zero corpus movement — 17 workflows, 109 activities bound, 207 edges, none of them a list, so a union accepts every existing string and the fan rules are vacuous. The regenerated JSON carries the `anyOf` with `minItems: 2` and the generated-schema test stays green. The site test stays green. Each of L1 to L10 fails the load with its stated message against a fixture.

*Guard obligations.* `workflow-yaml` is the guard that currently rejects a fan and the first to re-run. `refs`, `audience`, `artifact-guides`, `stealth-isolation`, `session-contract` and `activity-variables` all load workflows and inherit the load result.

### Stage 2 — every graph reader made fan-aware

`src/utils/activity-variables.ts`: the one-line flatten in `activityGraph`. `scripts/check-review-mode-gating.ts`: the destination type imported and list destinations flattened. `tests/e2e/walker.ts` and `scripts/smoke/smoke-orchestrator.ts`: the type imported, a fan-bound exit yielding the branch set, the walk entering each branch and then the join once, and the visit bookkeeping keyed on activity ids. `src/utils/validation.ts`: the flattened allow-list and the set-wise reported-exit comparison. `src/tools/workflow-tools.ts`: the exit-destinations header and metadata map, the checkpoint consequence, the exit payload, and the immediate-exit message template that the compiler cannot catch. `workflows/meta/techniques/workflow-engine/evaluate-transition.md` and `finalize-activity.md`: the plural destinations field.

*Acceptance.* No corpus movement; `check:all` green. A fixture fan walks end to end in the walker. No rendered message anywhere interpolates a destination directly.

*Why the walker must precede any corpus fan.* Unflattened, the walk sends an array where a single activity id is required, the tool's string type rejects it, the walk throws, and the coverage job's assertion that no walk errored fails.

### Stage 3 — the analysis meet

`src/utils/activity-variables.ts`: the fan-groups argument on `unreachableReads`, the split predecessor index, the arrival-intersection meet with the union arrival, and the moved candidate seed. `scripts/check-activity-variables.ts`: the fan groups passed in from the loader's derivation. Own unit tests over a synthetic fan fixture.

*Acceptance.* Corpus guard output byte-identical, because no fan exists — this stage proves no regression, and the new behaviour is proved by fixtures. On a fixture fan: a join's declared read of a name only one branch writes produces **no** finding (the union arrival); a genuinely unwritten read inside a branch **is** reported as an entry finding (the traversal fix); the fixed point terminates.

*Risk note carried into the plan.* This is a new operator in a hard-zero guard with no ledger to diff, so a bug in it is silent, and each of the three ways to apply it and have it do nothing is caught only by a fixture test. The declined cheaper route — declaring the branch keys on the workflow file, which puts them in the entry-available set and suppresses the false findings at no code cost — is rejected because it also suppresses the true ones and re-declares a derived name, which is a second home for it.

### Stage 4 — namespacing, statically

`src/utils/activity-variables.ts`: the container declaration added by the merge, the single-grammar read function with `pathReads`, the branch-key re-keying of productions and of the landing site. `scripts/check-activity-variables.ts`: the declared-write re-keying, the member-grain reporting under the existing family names with the self-consumed exemption, and `fan-artifact-collision`. `workflows/meta/techniques/variable-binding.md`: the branch-scoped landing and the derivation rule. `workflows/meta/techniques/scatter-gather.md`: the graph-fan application of `isolation-then-combine`, and the third scatter mode over one combine contract.

*Acceptance.* Corpus guard output byte-identical. On fixtures: one correct fan with a gather produces **zero** findings; a gather naming a member no branch produces is reported once; an ungathered member is reported once; a bare read of a fanned activity's output is reported once; two branches writing one artifact filename are reported once; a branch that writes a working value and reads it back within its own steps is **not** reported.

*Guard obligations.* Add `binding-fidelity` and `variable-model` to the acceptance set: the first is what mechanises a declared input with no reader and a read with no producer, the second is what mechanises defaults, gates and variable effects staying coherent with the seeded model. Neither is named by any prior survey of this change.

### Stage 5 — the frontier and the runner. Gated on #655 before it is enabled on a real run.

`src/schema/session.schema.ts`: the frontier replaces the single current activity. `src/utils/session/resolver.ts`: `heldActivity`, and the session view taking the named activity. `src/utils/session/store.ts`: the canonical key ordering. `src/utils/session/migration.ts`: a recorded single activity converts to a one-entry frontier. `src/tools/workflow-tools.ts`: the widened target parameter and the new exiting-activity parameter, the one resolution rule with its five steps, the barrier reading, the four repointed validation gates, the batch reading's exiting activity, the trace stamp on the retiring branch, the target lookup and the response's activity name, the yield refusal, the shared ambiguity helper, and the in-flight rendering on status, identity projection, activity projection and session inspection. `src/tools/resource-tools.ts`: the activity parameter on the activity delivery tool, the membership test on the technique tool, and every other read of the removed field. `src/logging.ts`: the same.

*Acceptance.* The whole existing unit and end-to-end suite green with a frontier of length one — every ordinary session takes the identical path, and no test is rewritten for behaviour, only for the field name. A session recorded before this stage migrates and resumes. Rows 13 to 23 of the enforcement table each have a test: the yield refusal from a branch; the transition refusal with the exiting activity omitted while three are in flight; a branch return with siblings live entering nothing; the last branch return entering the join; a two-branch fan executing end to end against real sessions; a branch's writes landing under its key with a dotted read resolving through it; two branches reporting the same bare name and both values readable afterwards; a member whose value disagrees with its declaration warning with today's wording.

### Stage 6 — the definitions that make a fan execute

`workflows/meta/techniques/workflow-engine/dispatch-fan.md`, new. `workflows/meta/activities/03-dispatch-client-workflow.yaml`: the three new steps, two gate edits and the loop-condition edit. `src/loaders/core-ops.ts` and `workflows/meta/workflow.yaml`: the two delivery entries. The rule amendments to `dispatch-activity`, `orchestrator-conduct`, `activity-worker`, `continue-batch`, `commit-and-persist` and `planning-readme`. `workflows/meta/activities/README.md`. `docs/dispatch-model.md`: the fan section, with the frontier as the cursor, the two barrier points, the corrected arithmetic from section 1 re-derived against a fresh `npm run bench:batch` run, and the fact that the per-scope bound does not limit a fan's width. The mint-attempt guard in `write-artifact` stated as an invariant — a re-scan narrows a stale-listing window and does not serialise two concurrent writers — rather than as a race it handles. The Graph row and the new fan row in `schema-construct-inventory.md`, plus the activity-level exit row. The load-rule line from the stages-1-to-5 rule deleted.

The inventory row, written out, and voiced so it cannot be confused with the within-activity fan-out row that already sits in the same file:

```
| "These three activities are independent — run them together" | **Graph fan** | `graph.<activity>.<exit>` naming two or more activities instead of one. They run together, one worker to each; each lands its outputs under its own branch key (its activity id in snake case with `_outputs`), and the run enters the single destination all of their own exits name, once, after the last of them returns — the barrier is those bindings, so nothing declares it. A fan whose branches name different destinations, a branch that declares a checkpoint, a branch that fans again, a branch that returns to itself, and a fan converging on `__terminal__` each fail the load. An activity that needs a combined value binds a step that gathers the branch keys. |
```

*Acceptance.* `check:all` green including `refs` resolving every new anchor, `audience` placing every new rule, `fragments`, and the workflow-YAML validator loading the amended meta workflow. Version bumps on every edited definition. A smoke run drives a two-branch fixture fan: the three new steps fire in order, the checkpoint trio and the artifact commit stay silent on the fan iteration, and the destination arrives through the output remap.

**The stale-restatement sweep, with its site count.** A sweep for the load-bearing phrasings — *destination activity*, *where each of its exits leads*, *exit id → destination*, *the activity the workflow graph binds*, *the activity each declared exit leads to*, *read its destination from the graph*, *activity ID to dispatch next* — finds **28 authored statements across 15 files, plus 3 generated files carrying the same sentence: 31 sites across 18 files.** Authored: `src/schema/workflow.schema.ts` (2), `src/loaders/workflow-loader.ts` (2), `src/tools/workflow-tools.ts` (3), `src/utils/activity-variables.ts` (1), `scripts/check-review-mode-gating.ts` (1), `scripts/generate-site-data.ts` (2), `tests/e2e/walker.ts` (2), `docs/api-reference.md` (1), `docs/state-management-model.md` (1), `docs/workflow-fidelity.md` (3), `schemas/README.md` (2), `evaluate-transition.md` (3), `finalize-activity.md` (2), `workflows/meta/activities/README.md` (1), `schema-construct-inventory.md` (2). Generated: `schemas/workflow.schema.json`, `site/api/schemas.html`, `site/api/tools.html`. **Seven of the authored statements, across five files, appear in none of the surveys this specification draws on** — the tool description that names the exit-destinations block, the API reference row that states its return shape, the state-management walkthrough, the three fidelity-document statements, and the activities README paragraph — so the sweep is run against the tree by grep key rather than against the change's own file list, and the occurrence count is recorded in the change manifest. The API reference and fidelity misses are Match the Harness Surface's business specifically: the exit-destinations return shape changes and those files state it.

### Stage 7 — corpus adoption, its own commit in the workflows submodule

**This is a definition redesign, not a graph edit, and the specification does not pretend otherwise.** The example fan is not adoptable as the corpus stands, for four reasons:

1. **Seven gates.** The three candidate activities declare **4, 2 and 1** checkpoint steps. Every one must go, or its activity leaves the fan. The assumption interview and its recording bindings are duplicated in the assumptions-review activity, which already runs that interview over the same open-assumptions value, so those removals are removals rather than workarounds — but the comprehension activity's sufficiency gate has no second home and its deep-dive loop needs a non-gate continuation.
2. **Nothing converges.** The comprehension activity binds four exits to four different destinations; the research activity points at the analysis activity; the analysis activity points at the plan activity. Every exit of all three must be re-bound to one shared destination.
3. **The shared artifact.** Seven activities bind the operation that writes the assumptions log, and the technique group's own rule makes that log the record of truth that grows as the work progresses. Two concurrent branches appending to one growing record violate a corpus rule that no filename check expresses, so the resolution is which activity owns the log — not which filename each writes.
4. **The data flow inverts, and no prior survey noticed.** The plan activity reads two values the research and analysis activities write. Fanning them *after* the plan activity puts the plan before its inputs; and once namespaced they stop writing those bare names at all, so every downstream reader must be repointed. Across the work-package activities, five of the values a fanned branch writes are contributed by seven activities each and read by five or six — namespacing removes a fanned activity from every one of those write sets.

*Commit shape.* One commit in the workflows submodule plus the pointer bump in the server repo, in the same pull request. The coverage baseline re-recorded and stamped in the same commit, and the dry-walk budget re-measured from its current value of 50 — the coverage test's own comment says the plateau is a property of the graph and has to be re-measured whenever the graph grows, a fan multiplies the branch orderings the enumerator produces, and a short streak is reported as *unreached options*, that is as a definitions defect, when the cause is the budget. A workflows-branch sweep runs the server's main tooling and stays red until the paired server change merges, so verify locally and re-run the sweep by hand afterwards.

*Acceptance.* The workflow loads with the fan and every load rule satisfied. `check:all` green on both sides with the pointer bumped. The coverage walk green with no stale, newly-uncovered or newly-covered entries and the stamp fresh. One live run in which the branches spawn in one turn, each lands its outputs under its own key, the join gathers all of them, the progress marks publish in one commit before the spawn and resolve in one persist at convergence, and the barrier refusal appears in no log.

**Non-negotiable sequencing for the removals.** Removing a gate removes a decision, and Non-Destructive Updates requires naming the check that confirms the behaviour survived. The check is mechanical and it exists: each removed checkpoint's variable effects name variables, and after removal any downstream reader whose only writer was the removed gate is reported by `check:activity-variables` at hard zero as an unwritten or unreachable read. That, plus `check:variable-model`, is the stated acceptance criterion, and the pull request body carries a decision-inventory diff — one row per removed gate naming the decision it made, the surviving gate that makes it, and the variable that carries it. The review-mode-gating guard cannot serve here: removing gates shrinks its finding set, so it goes greener as decisions are lost.

---

## 10. What this does not add

**No new node type, no join keyword, no sentinel exit target.** The join is read off the branches' own bindings and the load rejects a fan whose branches disagree. A declared join would be a second home for a fact the branches already state.

**No per-branch metadata in the graph.** A fan destination is a list of activity ids and nothing else. Everything else a branch needs is derived: its key from its id, its destination from its own bindings, its identity at dispatch.

**No declared branch key.** Derived, for the three reasons in section 6.1. A single container keyed by branch was also considered and declined: two branches writing sibling members of one bag entry is a merge into a shared entry, and writes assign entries whole, so it needs either a merge policy or a server-side assembly that is a merge policy under another name.

**No merge policy, no conflict guard, no partial combine, no degraded convergence.** Two branches cannot collide, so there is nothing to arbitrate. Proceeding on two branch keys of three would hand the gather a value no branch produced; the gather either has every key it names or it does not run, which is exactly the property `isolation-then-combine` buys. Describing what a missing branch means *is* a merge policy.

**No nested fans, no self-looping branch.** Both are load failures, and each removes a whole runtime path: no inner-join ambiguity, and no re-enter-self advance to carve out of `one-advance-per-activity`. A retry belongs inside the branch as a loop step. *Upgrade trigger:* a branch that genuinely must re-enter itself between exits.

**No gate in a branch, and no per-branch outstanding-decision slot.** The tempting server change buys nothing: the binding constraint is not the single slot but the turn boundary, so a richer slot would still deadlock, and it would have to thread through four checkpoint tools, the response keying and the universal gate assertion. Forbidding the gate at the load is smaller and total.

**No new session field beyond the one that replaces the old one, and no per-entry worker identity.** The frontier is a list of activity ids. A per-entry join copies a graph fact the handler already loads; a per-entry timestamp copies an event already in the history; a per-entry identity forces a distinct call outcome for a replacement worker, which activity-keyed resolution gets for free. *Upgrade trigger:* an observed mis-composed worker prompt (section 11).

**No new tool, and no dispatch-identity parameter on the transition tool.** The transition tool gains one widened parameter mirroring the graph destination and one optional scalar naming the exiting activity. A separate tool would be a second control-plane entry point for one operation.

**No change to the batch module.** A branch cannot be continued, for the two independent reasons in section 5.7 — the drive loop's gate is structurally false, and the frontier refusal is the backstop. A carve-out answering that a branch may not continue would change a value nothing reads. *Upgrade trigger:* a fan branch that must legitimately take a second activity.

**No new source module.** The destination's derivations sit beside the graph type in the schema file; the fan derivation sits beside the load validation that owns it. The module cycle the alternatives cite is created by placing the derivation elsewhere, not by the requirement: the analysis module needs only the flattening helper, which the schema file supplies and which imports nothing.

**No 37th guard registry entry.** The fan's shape rules are load failures, for the reason the load function itself gives. The four new families land inside the existing `activity-variables` entry, and two of them reuse existing family names so no new ledger is created. That entry's registry claim — every read has a writer on every path — survives the change unedited.

**No fan width cap.** The per-scope batch bound does not limit width, and a cap would be a policy number with no derivation behind it and no configuration home. The premium is documented once in `docs/dispatch-model.md`, beside the figures it is derived from, and the author sees the whole fan in one place. *Upgrade trigger:* a measured run that exhausts the orchestrator's context on a wide fan.

**No `branch_results` output on the fan operation.** Its protocol consumes each envelope internally at persist, transition and account, so the value has no reader outside — the drive loop reads only the destination. A declared output with no reader is not a bind contract.

**No fan mode on `dispatch-activity`.** One operation carrying two procedures a caller selects exactly one of; and its outputs would have to pluralise for consumers whose gates cannot test a list.

**No child session per branch.** A child session has its own outstanding-decision slot, but also its own workflow id, graph and planning folder — strictly more mechanism, and it breaks implicit convergence, under which branches rejoin a destination in the *same* graph.

**No change to `orchestration-patterns::dispatch-workers`.** Its concurrency selection remains unexecutable at every one of its binding sites. Fixing that means hoisting those sites to the orchestrator, which is separate work.

**No member field on the variable definition schema, and no per-member runtime validation beyond what exists.** The members stay ordinary declarations in the merged set and are validated at the wrap from the branch activity's own declared writes. Making members authorable would generate a new field into the JSON schema and create a second home able to disagree with the derivation.

**No change to the provenance token grammar.** The dotted-tail gap in `src/utils/binding-provenance.ts` is pre-existing — a dotted projection in the corpus already exercises it — and a mistyped gather key is caught by `unused-declaration` on the join's own declared read, so the fan does not make it load-bearing. Land it as its own commit if it is wanted, with its own byte-identical acceptance criterion.

---

## 11. Residual risks and open decisions

**A mis-composed worker prompt is not caught by the server.** A membership test admits every branch of a running fan, so a worker whose prompt names a sibling's activity is served that sibling's body. `verify-dispatched-activity` stays a worker rule and is the only protection; the specification does not claim it moved. *Trigger:* if a mis-composed prompt is ever observed, add a dispatch-identity parameter and a per-entry identity, and refuse a branch call whose identity does not match the one the branch was dispatched to.

**The arrival meet is a new operator in a hard-zero guard with no ledger.** A bug in it is silent, and each of the three ways to apply it and have it do nothing is caught only by a fixture. Stage 3's fixtures are the whole protection.

**A branch that cannot proceed without a decision has no conforming way to say so.** The finalisation operation defines two envelopes, the partial-result rule accepts only those two, and the recovery ladder refers to a blocked signal no envelope carries. The best available report is a completion on a blocked or abort exit the activity declares; failing that the branch returns a non-envelope, takes its one replacement, and the fan surfaces blocked. This is a pre-existing gap the design makes load-bearing rather than one it creates, and the gate ban is what makes it reachable.

**A replaced branch can have its work discarded silently.** The failed identity still holds the activity in the frontier, so if the abandoned worker returns after the replacement, whichever envelope arrives first retires the branch and the second is refused as holding no open branch. The wanted behaviour, but only the trace says which was discarded.

**Trace segments are per session, not per delivery scope.** A fan of three produces four segments that partition an interleaved multi-branch event stream at arbitrary points. Stamping the retiring branch fixes the mislabelling; the interleaving is not separable from the segment boundaries.

**Three concurrent branch contexts share one working tree.** The commit operation derives its paths from the working tree, which cannot attribute a change to a branch, so `persist-the-fan-before-any-branch-returns` answers it with one commit naming every branch. That is correct only while a fan's branches are read-only on the source tree — which the analysis activities a fan is for should be, and which nothing enforces and no guard can see.

**The artifact-collision check is guard-only and literal-names-only.** A templated filename is an intentional series and out of scope, so two branches whose templates can interpolate to one name are not caught, and a fan run without the guard can mint duplicate numbered instances that the artifact writer then resolves to the lowest-numbered file for the rest of the run.

**The join re-pays full delivery.** Every branch is a fresh delivery scope, so nothing collapses to a reference marker, and the join takes a fresh context that re-pays whatever the branches collectively held. The premium in section 1 is a floor for the same reason the benchmark's figure is: it counts eager payloads only.

**The rendered variable set names a container the members do not replace.** A fanned activity's outputs appear in the workflow's rendered variable set under both their own names and the container's, which is honest about the declarations and slightly redundant. An orchestrator reading the list sees both; the graph in the same payload shows the fan, and `variable-binding` states the derivation.

**Two fans containing one activity share its branch key**, and the second visit replaces the object whole. The routing case is reported by the re-entry finding family; a non-routing stale read is not detected. The rule stated positively is in section 6.1.

**The dry-walk budget may no longer clear after adoption**, and a short streak is reported as unreached options rather than as a budget shortfall.

**No corpus instance until stage 7.** The capability ships dormant, so its first real use finds the remaining rough edges, and until then the only evidence the runtime works is fixtures and one smoke run.

**Open decisions, both deliberately left to the implementer with the evidence in hand.** Whether the comprehension activity joins the first fan at all, given its sufficiency gate has no second home — the honest alternative is a two-branch fan. And whether the assumptions log's ownership moves to the assumptions-review activity or the fan sheds one of its two writers; the technique group's record-of-truth rule decides it, not the filename check.

---

## 12. Evidence

**The destination is typed as a bare string, and the JSON schema is generated.** `src/schema/workflow.schema.ts:51` — `export const GraphSchema = z.record(z.record(z.string()))`; doc comment `:45-50`; description `:67`. Generated by `scripts/generate-schemas.ts:25` with the root reference strategy, output at `schemas/workflow.schema.json:384-393`. The empty-subschema assertion is `tests/generated-schemas.test.ts:44-49`. Site page rendered from the description by `scripts/generate-site-data.ts:690-720` to `site/api/schemas.html:277`; the row renderer at `:498-517` never recurses into `additionalProperties`.

**Parse-time rendering.** `safeValidateWorkflow` at `src/loaders/workflow-loader.ts:299`; `formatZodIssues` at `:42`; `WorkflowValidationError` at `:301`. The union messages in section 4.1 were probed against the repo's own zod: an array member's `.min(2, msg)` surfaces for a one-element and an empty list; a union `errorMap` surfaces for a number, a non-string member and a nested list; without the error map those three render `Invalid input`; the two do not suppress one another.

**Exit-binding completeness and the load gate.** `validateExitBindings` at `src/loaders/workflow-loader.ts:520-572`; completeness `:528-535`; destination existence `:561-568`; called at `:366` after fragment materialisation `:333` and the variable merge `:350`, failing the load at `:367`; the stated reason at `:513-516`. `activityCheckpoints` imported and used at `:544`; it walks `flattenActivitySteps`, `src/schema/activity.schema.ts:322-332`. `TERMINAL_SENTINEL` at `:584`. `getExitBindings` `:496-503` with `ExitBinding.to` at `:481` and its funnel comment `:492-494`; `exitDestinations` `:506-508`.

**Corpus census, measured at submodule `5f92dc06`.** 17 workflows, 109 activities bound in graphs, 207 graph edges, 18 terminal, 0 list-valued.

**Guard registry.** 36 entries in `scripts/guards.ts`. `activity-variables` at `:38-44`, hard zero declared at `scripts/check-activity-variables.ts:25`; `review-mode-gating` at `:76-82`; `workflow-yaml` at `:267-274`.

**The reachability analysis.** `unreachableReads` at `src/utils/activity-variables.ts:574-671`; `ActivityGraph` `:532`; `activityGraph` `:540-546`; forward search `:602-609`; predecessor index `:595-598`; lattice seed `:614-620`; fixed point `:627-644`; the meet and its candidate seed `:632-637`; cycle grouping `:691`; self-loop test `:708`; re-entry family `:653-669`. Its sole caller `scripts/check-activity-variables.ts:232-245`. `bagName` `:216-218`; dotted token pattern `:213`; read narrowing `:374-380`; write narrowing `:385-389`; landing site `:432-440`; composed signatures `:310-320`; contract derivation `:352-484`; action condition read `:459`; bare binding read `:422`. There is no `computeUnavailableReads` in `src/`, `scripts/` or `tests/`.

**The declaration merge and the guard's namespace.** `mergeActivityVariables` at `src/utils/activity-variables.ts:112-149`, contradiction path `:126-138`, per-activity contribution `:141`; module header `:14-24`. Guard namespace assembled from `workflow.variables` plus every activity's declared **reads**, `scripts/check-activity-variables.ts:102-105`; `declaredAnywhere` `:110-113`; `writersOf` from `record.declaredWrites.keys()` `:184-191`; `readersOf` from declared reads **and** `derived.consumes` for every record including the writer `:199-206`; `unused-declaration` `:170-177`; `unwritten-read` skipping `owned` and `writersOf` `:208-215`; `unread-write` with the artifact and engine-input exemptions `:216-223`; `availableAtEntry` from `owned` plus merged declarations carrying a starting value `:226-231`; `policy: owned` `:244`.

**Variable writes.** `variablesChangedSchema = z.record(z.unknown()).optional()` at `src/tools/workflow-tools.ts:85`; applied at `:804-810`. `applyVariableWrites(draft, values, declarations, ctx)` at `src/utils/variable-seed.ts:68-108`, with the declared-type check `:80`, the value-set check `:86`, both skipped when a name has no declaration `:76-92`, and the flat assignment `:93`. Nested outputs landing whole and the dotted read resolving against them: `workflows/meta/techniques/variable-binding.md:20-21`; the bag-name grammar `:18`; the three sanctioned deviation forms `:31`; the generic-not-overfit rule `:43`; the sanctioned write path `:37-39`. Variable-name grammar `src/schema/variable.schema.ts:6-9` over `QUALIFIED_DATA_ID_PATTERN` at `src/schema/identifiers.ts:16`, with exemptions `:30-46`. Dotted condition targets addressing inside a value: `scripts/check-variable-model.ts:24-26`.

**The isolation rule.** `workflows/meta/techniques/scatter-gather.md:30-32` — per-instance outputs are never auto-bound into the parent bag by scalar name, which would race and clobber across instances, and combination happens exclusively in the combine phase; `one-gather-contract-two-scatter-modes` `:22-24`.

**The session record and its readers.** `currentActivity` at `src/schema/session.schema.ts:99`, type `:208`; `exit` `:102`; `activeCheckpoint` `:105` with its schema `:44-63` and type `:211`; the seeded-variables event shape `:327-331`. Canonical key ordering `src/utils/session/store.ts:105-126`; legacy conversion `src/utils/session/migration.ts:182,243`. `sessionView` `src/utils/session/resolver.ts:96-102`; `advanceSession` `:164-181`. The separate workflow-state record and its refinement `src/schema/state.schema.ts:163,183-186`; `HistoryEntry.data` as `z.record(z.unknown()).optional()` `:89`.

**The transition handler.** `next_activity` `src/tools/workflow-tools.ts:695-1005`; outstanding-decision throw `:723-728`; target resolution `:729-731`; manifest validation `:735-741`; missing-manifest advisory `:742-744`; reported-exit check `:746-748`; mutator `:765-864` with the exit event and completed set `:769-775`, variable writes `:804-810`, step-completed events `:812-825`, cursor and entry event `:841-844`, terminal check `:860-863`; response fields `:995-999`; batch reading `:959-973`; trace mint and payload `:975-993`. Parameter descriptions `:698-699`. `get_activity` `:1021-1030` with its tool description `:1013` and exit-destinations block `:1450-1456`, `:1616`. `yield_checkpoint` `:1642-1679`, second-yield refusal `:1647-1649`, its writes `:1739-1744`. `present_checkpoint` consequence `:1920-1931`; `respond_checkpoint` exit payload `:2101-2111`, its option effects `:2071-2077`, the immediate-exit template `:2110`. Workflow summary returning the graph verbatim `:663`. Usage projection `:435`, `:457-458`, `:462`, activities without usage `:475`; activity projection `:238-265`; identity projection `:207`; status `:2231`. The last-writer-wins comment `:1513-1516` and the reload-then-save `:1517-1561`. The universal outstanding-decision gate `src/utils/session/params.ts:62-70`.

**Delivery and the bound.** `deliveryScope` `src/utils/delivery.ts:63-65`. `batchState` `src/utils/batch.ts:149-160` with the exemption for the session's own agent **and for a scope with no activity yet** `:154`; `batchRefusal` `:168-183` with the already-held carve-out `:176-177`; derivations `:72-123`; the model comment `:9-16`. `dispatchKind` `src/utils/dispatch.ts:30-32`; the dispatch event's timing `:14-16`.

**Technique and resource delivery.** `get_technique` `src/tools/resource-tools.ts:644-716`, its optional activity parameter and mismatch guard `:653-661` — "a step id resolves against the session pointer, which any context in the session can move" — and its cursor reads `:668-716`; resource provenance `:401`; child dispatch attribution `:566`, `:610`. Core orchestrator techniques and the delivery mechanism `src/loaders/core-ops.ts:23-71`, mechanism comment `:47-65`.

**Validation helpers.** `validateActivityTransition` `src/utils/validation.ts:33-52`; `validateReportedExit` `:239-254` with the inequality at `:250` and the message `:251`; `validateStepManifest` `:95-161`; `validateTechniqueFetches` `:178-231`, already scope-filtered `:198-216`; warn-only assembly `:287-296`.

**Cost figures, all from `docs/dispatch-model.md:86`** and produced by `npm run bench:batch` against submodule `5f92dc06`: three activities cost 222,505 characters batched — 85,775, then 106,893, then 30,182 — and 261,971 standalone, so batching saves 15%; the establishment ratio at `:68`; the eager-only floor at `:84`; the two limits and the activity cap of 3 at `:76-78`. `DEFAULT_BATCH_MAX_ACTIVITIES = 3` and `DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4` at `src/config.ts:165,156`.

**Dispatch canon.** `dispatch-activity.md`: protocol `:48-62`, mint `:54`, replacement ladder `:56-57`, blocked signal `:61`, narration `:84-86`, `dispatch-mark-reaches-the-remote` `:66-68`, `account-every-activity` `:70-72`, `dispatch-topology` `:88-90`, `delivery-keys-on-agent-context` `:100-102` with its reason `:52-55`, `batch-is-bounded-by-the-server` `:104-106`, `reject-partial-worker-result` `:108-110`, trace accumulation `:53`, `resolve-trace-at-close-out` `:78-80`. `activity-worker.md`: dispatch binding `:20-22`, `worker-control-plane-ban` `:62-64`, `outlive-dispatched-children` `:74-76`, `verify-dispatched-activity` `:82-84`, `progressive-step-technique-load` `:86-88`, `batch-ends-where-the-server-says` `:90-92`. `continue-batch.md`: scope `:8`, mint discipline `:60`, `one-advance-per-activity` `:68-72`. `resume-worker.md:55`. `finalize-activity.md`: outputs `:58-61`, protocol `:73`, reported writes `:72`, `may_continue` `:24-26`, `no-readme-persist-on-worker` `:78-80`. `evaluate-transition.md:16-18,30-32,43`. `orchestrator-conduct.md`: `no-domain-work` `:12-14`, `one-level-of-indirection` `:16-18`, `automatic-transitions` `:28-30`, `no-ad-hoc-interaction` `:32-34`. `spawn-agent.md`: `depth-1-only` `:44-46`. `harness-compat/claude-code.md`: addressability `:19`, `concurrent` `:24-27`. `harness-compat/TECHNIQUE.md`: `foreground-always` `:23-30`. `spawn-concurrent.md:34`. `resolve-harness-operation.md:38`. `commit-and-persist.md`: retry-once `:31`, path derivation step 4 `:26`, `commit-after-activity` `:36-41`, the not-applicable marker `:22`. `sync-progress-status.md`: inputs `:16-22`, row ownership `:42-49`, `preserve-unrelated-rows` `:54-56`. `planning-readme.md`: call sites `:165-180`. `write-artifact.md`: mint-attempt guard `:36-41`. `review-assumptions/TECHNIQUE.md`: `assumptions-log-is-the-record` `:28,42`; `record.md:24` writes `assumptions-log.md`; bound by **7** activities — 02, 03, 04, 05, 06, 07 and 08 of the work-package activities.

**The drive loop.** `workflows/meta/activities/03-dispatch-client-workflow.yaml`: loop and condition `:31-39`, `continue-batched-worker` `:42-52`, `dispatch-activity` `:53-62`, checkpoint trio `:65,72,80`, artifact commit `:89-95`, `advance-activity` `:96-102`, `release-spent-worker` `:103-109`, completion `:110-116`, exit `:117-119`. Condition dialect `src/schema/activity.schema.ts:74-75`; structured conditions `src/schema/condition.schema.ts:3-5,24-28,35`. `workflows/meta/activities/README.md:39`; `workflows/meta/workflow.yaml:12-18`; `workflows/meta/resources/bootstrap-protocol.md:23-42`.

**Corpus adoption evidence.** Checkpoint step counts, measured: `04-research.yaml` **4**, `05-implementation-analysis.yaml` **2**, `15-codebase-comprehension.yaml` **1**. Research gate sites `:106`, `:190`, `:222`, `:242`; its recording bindings `:135`, `:226`, `:245`; its convergence loop `:137-167`; its 8 starting values including the context-scope default `:39` and its three-value set `:32-39`, with a step gate reading `context_scope_uncertain` at `:186`. Analysis gate sites `:124`, `:143`; bindings `:82`, `:129`, `:148`; loop `:83-114`. Comprehension gate `:127-157`. `06-plan-prepare.yaml:6,10` reads `assumption_outcome` and `has_resolvable_assumptions`. `07-assumptions-review.yaml:71-105,111-112,128-130,139-141` runs the same interview. Graph `work-package/workflow.yaml:174-223`, with the comprehension activity's four exits `:219-223` and the present chain `:184-189`. A dotted projection already in use: `08-implement.yaml:102`.

**Test tooling.** `tests/workflow-loader.test.ts:329-397`, fixture helper `:333-335`. `tests/e2e/walker.ts`: graph type `:52-53`, exit choice `:254-268`, next `:271-273`, advance `:293-306`, transition `:363-378`, graph read `:637`, loop guard `:661-663`, target set `:727-744`, enumeration `:816-909`, error recording `:887`, forks `:899-905`. `tests/e2e/option-coverage.test.ts`: skip condition `:93`, dry-walk budget and its re-measurement note `:40-57`, stamp freshness `:98-104`, staleness and movement `:187-202`, walk-error assertion `:168`. `tests/e2e/coverage.ts:66-97` with its load throw `:73`. `scripts/smoke/smoke-orchestrator.ts:29,241,375-391`. `scripts/coverage-scope.ts:90-91`.

**Canon cited by name in this document.** `workflows/workflow-design/resources/design-principles.md` — Maximize Schema Expressiveness, One Authoritative Home, Encode Constraints as Structure, Separate Contract from Procedure, Prefer Shared Capability, Keep Orchestration in Structure, Modular Over Inline, Keep Session Interaction in Activities, Bind Sibling Operations as Steps, Atomic Techniques; Compose at Activities, Convention Over Invention, Match the Harness Surface, Non-Destructive Updates, SOLID at the Definition Layer, Prefer Removing the Thing That Needs a Prohibition. `workflows/workflow-design/resources/anti-patterns.md` — `no-inline-content`, `schema-is-constraint`, `no-partial-implementation`, `snake-case-symbols`, `collection-id-shape`, `readme-orients-not-transcribes`, `technique-stage-agnostic`, `no-duplicated-guidance`, `canonical-fact-home`, `canon-layer-cites-not-restates`, `bind-site-is-orchestration-truth`, `duplicate-shared-capability`, `contract-not-procedure`, `no-derived-state-shadow`, `alternate-ops-as-protocol-sequence`, `unproduced-value-read`, `stale-restatement-after-change`, `output-without-destination`. `workflows/workflow-design/resources/schema-construct-inventory.md` — Workflow-Level Constructs, the Graph row, the activity-level exit row, the orchestration-patterns fan-out row, and the universal obligation to check prose against the inventory. `workflows/workflow-design/resources/convention-conformance.md`. `workflows/ponytail/resources/the-ladder.md` and `honesty-boundary.md` — the safety floor that is never simplified away, and the prohibition on stating a fabricated per-repo figure.