# Instance-fan design record

Three independent designs, two judge panels that split. The specification is synthesised from the winner with grafts from the runner-up; this file is the material behind that choice.

## Instance fan: a graph destination that names one activity and the collection to run it over

### work unit source

## The construct: a third destination member, carrying a reference and not data

The graph is routing's single home, and "run this activity once per element of that collection" is a routing fact. It lands in the routing file. What lands there is the collection's **name**, not its members — the same reference a `forEach` step's `over` carries (`src/schema/activity.schema.ts:159`, "Collection expression iterated by a forEach loop."), asked at graph grain. The members stay in the bag, produced by an activity. That is the answer to blocker 3 ("the graph carries no data") without putting data in the graph: a name is a reference, and the graph already holds nothing but references.

### The zod, in `src/schema/workflow.schema.ts` beside `GraphSchema` (`:45-52`)

```ts
/**
 * A destination naming one activity and the collection to run it over: an instance fan. `over` names
 * the collection in the variable bag, `variable` the name each instance reads its own element at, and
 * `maxInstances` the width this fan admits. The graph carries the collection's NAME; its members are a
 * bag value some activity in this graph writes, so the fan's width is that collection's length at the
 * moment the fan is entered. Its instances run together, one worker to each, and the run enters the
 * single activity all of the fanned activity's own exits name once the last instance returns.
 */
export const InstanceFanSchema = z.object({
  activity: z.string().describe(
    "The activity this fan runs, once per element of `over`. One activity: its instances differ by the element each is handed and by nothing else.",
  ),
  over: z.string().describe(
    "The collection in the variable bag this fan runs one instance per element of, by name or by a dotted path into a named value (`work_units`, `execution_plan.steps`). Read when the fan is entered, so its length is the fan's width.",
  ),
  variable: VariableNameSchema.describe(
    "The name each instance reads its own element at. Declared under this workflow's `variables[]` with a type and no starting value, and declared as a read by the activity this fan runs.",
  ),
  maxInstances: z.number().int().min(
    2,
    "a fan admits at least two instances; an exit that leads to one run of one activity names that activity",
  ).describe(
    "The width this fan admits. A collection longer than this refuses the fan enter rather than truncating it, and a value above the server's own ceiling fails the load.",
  ),
}).strict();
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

export const DestinationSchema = z.union(
  [
    z.string(),
    z.array(z.string()).min(
      2,
      "a fan names at least two activities; an exit that leads to one activity names that activity",
    ),
    InstanceFanSchema,
  ],
  {
    errorMap: () => ({
      message:
        "a destination is an activity id, `__terminal__`, a list of at least two activity ids, or `{ activity, over, variable, maxInstances }` to run one activity once per element of a collection",
    }),
  },
);
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The activities one binding can send the run to — one for a plain destination or an instance fan, several for a list. */
export const destinationTargets = (destination: Destination): string[] =>
  Array.isArray(destination) ? destination
  : typeof destination === "string" ? [destination]
  : [destination.activity];

/** Whether a destination runs several branches together, in either form. */
export const isFan = (destination: Destination): destination is string[] | InstanceFan =>
  typeof destination !== "string";

/** The instance fan a destination is, or undefined for a plain destination or a list. */
export const instanceFan = (destination: Destination): InstanceFan | undefined =>
  typeof destination === "object" && !Array.isArray(destination) ? destination : undefined;

/**
 * The bag key an activity's outputs land under when the graph runs it as a branch: its id in snake
 * case with `_outputs` appended. Derived from the id alone, so the server, the guards and a reader of
 * the graph spell it the same way and a worker is never told it.
 */
export const branchKey = (activityId: string): string => `${activityId.split("-").join("_")}_outputs`;
```

`over` is deliberately not regex-constrained. Load rule **L13** does the stronger check — its head must be a name this workflow's merged variable set contains — and a grammar constant would be a second home for the bag-name grammar `variable-binding.md:18` already states.

`maxInstances` is **required**, and that is a deliberate departure from the field it is named after. `maxIterations` is optional and agent-enforced (`src/schema/activity.schema.ts:161`, "Safety bound on iteration count, enforced by the executing agent") because a loop's cost is one worker's iterations, stoppable mid-flight. A fan's width is spent as N irreversible dispatches inside one turn, so an unbounded fan must be unauthorable rather than merely discouraged — Encode Constraints as Structure. `min(2)` carries §4.1's own reasoning across: declaring a ceiling of one is declaring a plain edge.

### The graph field's description (replacing `src/schema/workflow.schema.ts:67`)

```ts
  graph: GraphSchema.optional().describe("The workflow's shape: for each activity, where each of its exits leads. This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. A destination naming one activity sends the run there, and `__terminal__` ends the run. A destination naming several activities runs them together, one worker to each. A destination naming one activity together with a collection to run it over runs one worker per element of that collection, each handed its own element at the name the destination gives; the collection is a variable this graph's activities write, so the width is its length when the fan is entered. Either fan lands each branch's outputs in its own slot under the branch's own key, and the run enters the single activity all of the branches' own exits name, once, after the last of them returns. Omitted only by a workflow whose activities declare no exits."),
```

### The generated JSON shape (`schemas/workflow.schema.json`, from `npm run build:schemas`)

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
            "activity": { "type": "string", "description": "The activity this fan runs, once per element of `over`. ..." },
            "over": { "type": "string", "description": "The collection in the variable bag this fan runs one instance per element of ..." },
            "variable": {
              "anyOf": [
                { "type": "string", "pattern": "<QUALIFIED_DATA_ID_PATTERN>" },
                { "type": "string", "enum": ["<EXEMPT_DATA_IDS>"] }
              ],
              "description": "Qualified snake_case noun phrase (>=2 words, AP-60), or an enumerated bare-word exemption."
            },
            "maxInstances": { "type": "integer", "minimum": 2, "description": "The width this fan admits. ..." }
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

`.strict()` generates `additionalProperties: false`; `VariableNameSchema` (`src/schema/variable.schema.ts:6-9`) is a union of a regex string and an enum, so it generates `anyOf`. The object member carries no `items` key, so the empty-subschema assertion at `tests/generated-schemas.test.ts:44-49` is untouched. The site's row renderer never recurses into `additionalProperties` (`README.md:154`), so the nested member is not rendered there and needs no site work beyond the description.

**Corpus impact of the widening: none.** 17 workflows, 109 activities bound, 207 graph edges, 18 terminal, 0 list-valued, 0 object-valued (census at submodule `5f92dc06`, `README.md:748`). A union accepts every existing string and no load rule keys off a destination's JavaScript type.

### Authored

```yaml
graph:
  reconcile-assumptions:
    converged:
      activity: challenge-pass
      over: challenge_perspectives
      variable: challenge_perspective
      maxInstances: 6
  challenge-pass:
    challenged: combine-challenges
  combine-challenges:
    resolvable: reconcile-assumptions
    settled: assumptions-review
```

### Why the object destination and not the three alternatives

**Repeat the id in a list** (`converged: [challenge-pass, challenge-pass, challenge-pass]`). Cheapest change on the page: relax L2, add nothing. Dead, because the destination then carries nothing that distinguishes the instances but list position, and **no evaluator in the tree can project a position into a read address.** Verified by execution against the real modules: the `{token}` grammar is `\{(IDENT(\.[a-zA-Z0-9_]+)*)\}` (`src/utils/activity-variables.ts:213` over `IDENTIFIER_PATTERN`, `src/utils/binding-provenance.ts:36`) — literal segments only, a nested token unmatchable; the structured condition compares a literal `variable` string (`src/schema/condition.schema.ts:15-21`, split at `:40-48`); the `when` dialect tokenises a literal path (`src/schema/when-expression.ts:23-29`, split at `:287-294`). So `{challenge_perspectives.{fan_index}}` is not expressible, and handing an instance an ordinal buys nothing because it cannot spell its own read. This spelling stays a **load failure**, and L2's message points at the object form.

**Convention: the runner looks for `<activity>_units`.** Invention against Convention Over Invention, a second home for a name the graph should state, and invisible to a reader of the graph.

**The fan names one activity and the activity declares what it fans over.** Rejected on three counts. §4.1 forbids a one-element list ("a one-element list is a plain destination spelled a second way, which One Authoritative Home forbids"), so the *plain string* destination would have to become the fan trigger, and then every plain destination in the corpus is ambiguous until the destination activity's file is read. It moves a routing fact into the activity file, so the activity states how many workers run it. And it destroys borrowability the way amendment §4's option B does, inverted: one collection name is imposed on every borrower. It also breaks the load property the whole design rests on — §4.3: "`fanGroups` reads the graph object and nothing else — no activity lookup, no file access — so the loader keeps sole ownership of agreement with the activities, and the join has exactly one derivation."

### Does this read as a loop step wearing a graph's clothes?

It shares the loop's vocabulary and nothing else, and the tell is `steps`. `LoopStepSchema` is a closed object of eleven fields (`src/schema/activity.schema.ts:152-164`); the instance fan carries four of them and, decisively, **not `steps`**. A loop step *contains* its body; a destination *names* an activity the graph already contains and already routes. There is no continuation test, no early exit, no nesting, no body. And it cannot be a loop step: a loop body runs inside one worker, and a worker holds no agent-dispatch tool (`depth-1-only`, `spawn-agent.md:44-46`) — which is precisely why the corpus's whole fan-out vocabulary is unreachable at all fifteen of its binding sites. The construct that runs N workers has to sit where the run's routing is decided.

What it does share is deliberate. `over` and `variable` are the loop's own field names, in the loop's own division of labour, stated by the loop's own header (`:149-151`): "`over`/`variable` the collection and the item". Convention Over Invention says to spell an existing idea with the existing words.

### The declaration of the parameter, and the one canon contradiction it walks past

The parameter is declared under the **workflow file's** `variables[]` with a type, a one-line description and **no `defaultValue`** (rules L11, L12). Three homes could have taken it and two cannot:

- The **branch activity's `variables.writes`** cannot: the branch does not produce it. The server does, at delivery. `unused-declaration` would fire on the write side (`scripts/check-activity-variables.ts:178-185`).
- **Derived, contributed by `mergeActivityVariables` from the graph** (as the branch-key container is) cannot: `VariableDefinitionSchema.type` is required (`src/schema/variable.schema.ts:13`) and the element's type is the collection's element type, which no schema carries. A read declares no type.
- The **workflow file** can and does: `workflow.schema.ts:64` says `variables[]` holds "the variables this workflow file owns", the fan is authored in the workflow file, so the parameter is that file's own fact.

No `defaultValue`, for a mechanical reason: a default is seeded into the bag at session creation (`src/utils/variable-seed.ts:15`), so every context would hold one value the fan exists to differ on, and `check:variable-model` already forbids gating a defaulted variable on existence (`src/schema/variable.schema.ts:16`).

**The contradiction I am not resolving, named so no reader thinks the choice was arbitrary.** `src/schema/variable.schema.ts:64` says of `variables.writes` that "a loop variable is iteration state and is not declared here", while `schema-construct-inventory.md:56` lists loop items among what `variables.writes[]` declares, and the corpus declares them (`prism/activities/02-adversarial-pass.yaml:13-15` declares `current_unit`; `work-package/activities/04-research.yaml:44-46` declares `current_assumption`). That contradiction is real and pre-existing. It does not reach the fan's parameter, because the fan's parameter is unambiguously **not** iteration state: it crosses an activity boundary — the graph names it in one file and a different file's activity reads it — which is the definition of the contract namespace. So the choice follows from what the value is, not from picking a side.

### What contradicts the specification, quoted

§10: "**No per-branch metadata in the graph.** A fan destination is a list of activity ids and nothing else. Everything else a branch needs is derived: its key from its id, its destination from its own bindings, its identity at dispatch."

That sentence is true of a fan of *distinct* activities, where every branch carries its own id and every derivation keys on one. An instance fan has no per-branch id, so there is nothing to derive from, and the fan itself must carry what distinguishes its instances. Two things preserve the sentence's reasoning. First, the metadata is per **fan**, not per branch: one collection reference, one parameter name, one width, and **no per-instance entry anywhere in the graph** — the graph never names an instance. Second, all three derivations the sentence protects survive verbatim: the container is still derived from the activity id by `branchKey`, the destination is still the branch's own bindings, the identity is still minted at dispatch. The amendment is therefore narrow and precisely stated: *a fan destination carries the members' ids where they are distinct activities, and a reference to the collection where they are instances of one; nothing in the graph names an individual branch.*


### instance identity

## The frontier entry gains one field: which instance

### The change, and what it replaces

§5.1 as written (`README.md:222-231`) holds `frontier: z.array(z.string()).default([])`, and §5.1's next paragraph (`:233`) says "Nothing else goes on an entry", refusing three specific things: a per-entry join, a per-entry timestamp, a per-entry worker identity. §10 (`:684`) restates it: "The frontier is a list of activity ids."

Two instances put one string in that list twice, so the entry must carry which instance it is:

```ts
/** One branch in flight: the activity, and where the graph fans it, which instance of it. */
export const FrontierEntrySchema = z.object({
  activity: z.string(),
  instance: z.number().int().nonnegative().optional(),
}).strict();
export type FrontierEntry = z.infer<typeof FrontierEntrySchema>;
```

```ts
  /**
   * The branches in flight, one entry each. An entry names the activity and, where the graph fans that
   * activity over a collection, which instance of it — the element that instance was handed and the
   * slot its outputs land in. One entry on an ordinary walk; one per branch while a graph fan runs. A
   * destination the graph fans is entered once, after the last of its branches returns, so this holds
   * either a single activity or the branches of exactly one fan — every exit of a branch binds to its
   * fan's join, so a branch cannot open a fan of its own. Empty between the last branch retiring and
   * the join being entered, and after the run completes.
   */
  frontier: z.array(FrontierEntrySchema).default([]),
```

**All three of §5.1's refusals stand, and the reasoning behind each survives.** A per-entry join still copies a graph fact the handler already loads at `src/tools/workflow-tools.ts:720`, and now for a second reason: every instance of one activity shares that activity's exit bindings, which `getExitBindings` reads keyed by activity id (`src/loaders/workflow-loader.ts:496-503`), so N instances have one join by construction. A per-entry timestamp still copies the `activity_entered` event. A per-entry worker identity is still refused, and the argument **strengthens** — see the barrier section below. The instance index is none of the three: it is not a copy of anything the graph holds (the graph states the collection and the ceiling, never which slot this entry is), not a copy of any event, and not a worker identity. It is the one fact about a branch that nothing else in the session or the definitions carries.

### Why an object entry and not a composite string

The alternative is `challenge-pass#0` in the existing `z.array(z.string())`, borrowing `CHECKPOINT_INSTANCE_SEPARATOR` (`src/loaders/workflow-loader.ts:449-455`). It is genuinely cheaper on paper — the schema, the canonical key ordering (`src/utils/session/store.ts:121`), the legacy converter (`src/utils/session/migration.ts:182,243`) and `heldActivity` are all untouched — and it is rejected on two grounds.

**Distinguish Designators from Parameters.** The entry becomes a compound every reader must parse. There is no type to force that parse, so every reader compiles and quietly does the wrong thing: `getActivity` compares a filename-derived id exactly (`src/loaders/workflow-loader.ts:437-439`), `readActivityRaw` likewise (`:606`), `getExitBindings` misses the graph record and returns `[]` (`:499`), `validateReportedExit` then returns `null` at `src/utils/validation.ts:244` — the check is silently *disabled* rather than wrong — `validateActivityTransition` hits the same miss at `:45`, and `validateActivityManifest` tests `activityIds.includes(entry.activity_id)` against `workflow.activities` (`:270`) and so warns "references unknown activity" on **every instance return**, which is how an orchestrator learns to stop reading `_meta.validation` (the spec's own stated failure mode, `README.md:292`).

**The object entry makes every one of those a type error.** Changing `frontier` from `string[]` to `FrontierEntry[]` cannot be applied half-way: the compiler enumerates the readers §5.1 lists (the resolver, the store's key ordering, the migration converter, and every reader in `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts` and `src/logging.ts`) plus the status, identity, activity-projection and inspection renderings §9 stage 5 already schedules. That is Encode Constraints as Structure applied to the implementation, and it replaces a list of "must remember to base-normalise" hazards with a build failure.

**The cost I take on, and how it is paid.** A composite string would have made six existing per-activity projections instance-aware for free, because every `HistoryEntry.activity` is a plain string (`src/schema/state.schema.ts:83`). With an object entry the event's `activity` field stays a bare id, and the instance rides `HistoryEntry.data` — `z.record(z.unknown()).optional()` (`:88`), so it costs no schema. Walked one projection at a time:

- `activityWallClockMs` (`src/tools/workflow-tools.ts:359-379`) keys first-entry-to-last-exit spans on `e.activity`. Collapsed across instances it reports first-instance-entry to last-instance-exit — which **is** the fan's wall clock, because the instances run inside one turn. That is the wanted reading, not a lie. **No change.**
- `activities_without_usage` (`:474-475`) diffs the usage set against `completedActivities`, which dedups (`:772-774`). Collapsed, one usage row satisfies N instances and **N−1 missing figures are invisible.** This one lies. It is repointed to diff usage pairs `(activity, instance)` against the `activity_exited` events, which are one per instance and carry `data.instance`. One projection change, no schema change, and strictly better: it stops depending on a deduped list.
- `completedActivities` stays `string[]` and appends the activity once. A fan completes the activity; the instance grain lives in the history. **No change.**
- `batchActivities` (`src/utils/batch.ts:72-86`) counts distinct ids per scope. Each instance is its own scope holding one activity, so it reads 1 either way. **No change.**
- `validateTechniqueFetches` (`src/utils/validation.ts:198-216`) scopes a visit to the last `activity_entered` for the named activity and already filters on `data.agentId` (`:213`). Keyed on the activity plus the agent it is already per-instance, because `one-identity-per-branch` makes the identities distinct. **No change.**
- `projectActivities.current` becomes the frontier rendering §9 stage 5 already schedules, showing three distinct in-flight names.

### How a worker learns which instance it is

`get_activity` takes no activity parameter deliberately — its description says so (`src/tools/workflow-tools.ts:1007`), its parameters are `session_index`, `context_tokens`, `agent_id`, `bundle` (`:1016-1019`), and the handler reads `state.currentActivity` (`:1027`). §5.3 already adds `activity_id`, modelled on `get_technique`'s (`src/tools/resource-tools.ts:644`). That is necessary and insufficient: `challenge-pass` is in the frontier three times, so a membership test admits any caller — the vacuity Judge 1 raised as a High finding (`design-record.md:1449`).

**One further optional scalar, beside the one §5.3 adds:**

```ts
      activity_id: z.string().optional().describe("Optional. The activity you were dispatched for. Omit while one activity is in flight; required while several are, and refused when the session is not on the activity you name."),
      instance_index: z.number().int().nonnegative().optional().describe("Optional. Which instance of that activity you were dispatched for, where the graph fans it over a collection. Your composed prompt carries it. Required while several instances of the named activity are in flight, and refused when the session is not on the instance you name."),
```

Refusals:

```
get_activity: this session is on 'combine-challenges', not the 'challenge-pass' you were dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.

get_activity: 3 instances of 'challenge-pass' are in flight. Pass instance_index naming the one you were dispatched for; your composed prompt carries it as instance_index.

get_activity: this session is on instances 1 and 2 of 'challenge-pass', not instance 0. Report the mismatch to your orchestrator rather than retrying with another index.

No activity in flight. Call next_activity first.
```

**And the value reaches the instance on that same response.** `state.variables` is one flat record shared by the whole session (`src/tools/workflow-tools.ts:508`, `:531`, `:2235`), and `applyVariableWrites` assigns flat entries (`src/utils/variable-seed.ts:93`), so N instances cannot read different values at one bare bag name. The routes out, priced:

- **Write the unit under an indexed name before dispatch** — mechanically available at the same single write site the container occupies, but the read address then carries the index, and the activity body is one file every instance shares. `{challenge_perspective_units.0}` is authored, not per-instance. Dead on the grammar proof in the previous section.
- **Ride the composed prompt** — forbidden by name. `compose-prompt.md:59-61`, `context-travels-as-state`: "Prior-activity context reaches a worker as state, not as prose in the stub… **A fact the worker needs and no variable carries is a missing declaration, not a licence to inline.**" And it leaves the activity body unbound: the body's `{challenge_perspective}` tokens and `when:` gates resolve through `variable-binding.md:13-18`'s precedence, in which the prompt appears nowhere.
- **The instance projects its own element from the collection plus its index** — does not run, per the grammar proof.

So: **one bare name whose value differs per instance, delivered as a server-computed projection on the `get_activity` response.** That response already carries exactly this class of value for exactly this reason. `artifact_prefix` is there because "artifactPrefix is server-computed from the activity filename and is NOT in the raw activity definition, so surface it in the header" (`src/tools/workflow-tools.ts:1438-1440`), and `exit_destinations` because "the routing a worker is asked to report is unresolvable from the body alone, and this block is what closes that" (`:1444-1449`), assembled at `:1451-1456`. The fan parameter is the third member of that set and the same shape of fact: derived server-side, unreachable from the body, needed by one context only. Precedent for a server-supplied value a step binds without it being a bag entry is already authored: `write-artifact`'s `artifact_prefix` input is documented "server-provided" (`write-artifact.md:12-14`).

The header gains one block, and `_meta.fan_instance` mirrors it:

```
session_index: 7
artifact_prefix: 04
fan_instance:
  variable: challenge_perspective
  index: 0
  of: 3
  id: stakeholder-gap
  value: stakeholder-gap
exit_destinations:
  challenged: combine-challenges
```

`value` is what the parameter binds — the element whole, so a structured element (`{ id, brief }`) reaches the instance as one value and the body projects fields off it by ordinary dotted read, exactly as `prism/activities/02-adversarial-pass.yaml:32` reads `{current_unit.target}`. `id` is what names the container slot, the dispatch-manifest row and the artifact filename: the element itself when it is a string, `element.id` when it is an object — `gather-results`' own normalisation rule (`gather-results.md:40`), applied once, server-side. So **owner input 1 is honoured exactly: one value at one name**, without forbidding a structured element.

`variable-binding` gains one sentence placing the projection in the input precedence at step 2, between the step's own deviations and the bag: an input whose id is the fan parameter of the fan running this activity binds the projection the response carried.

**One line inside `get_activity` that must not be missed.** The eager-bundling gate reading uses `bagAtOpen = state.variables ?? {}` (`src/tools/workflow-tools.ts:1205`). The projection must be overlaid there, or a step gated on the parameter is unanswerable at delivery and stays lazy (`lazyUnanswered`, `:1226`). Unoverlaid it degrades rather than breaks — a cost, not a defect.

**Not `inspect_session` or `get_workflow_status`.** Both serve one shape to both roles (`:2235`, `:508`), neither takes an activity or an instance, and the orchestrator must see the un-projected bag: its `state` for `compose-prompt` substitutions cannot be per-instance. **The honest asymmetry, stated rather than hidden:** an instance re-reading the bag through `inspect_session { view: "variables" }` (`read-session.md:22`) finds the collection, not the projection — which is the truth. The projection names itself on the response it arrives with, so the asymmetry is visible.

**`variables_changed` stays the only write path.** The projection is read-only and derived. The design adds a read channel and no write channel.

### How one instance retires

§5.2's `from_activity` (`README.md:257-259`) gains one sibling scalar:

```ts
      from_activity: z.string().optional().describe("The activity this call is exiting — the one `exit`, `step_manifest`, `variables_changed` and `artifacts_produced` belong to. Omit while one activity is in flight; required while a fan is running, so the call names which branch returned."),
      from_instance: z.number().int().nonnegative().optional().describe("Which instance of `from_activity` this call is exiting, where the graph fans that activity over a collection. Required while several instances of it are in flight, so the call names which instance returned and which slot its outputs land in."),
```

§5.1's resolver becomes one function with one home, and its rule is unchanged in kind:

```ts
/**
 * The branch a call belongs to: the entry it names when the frontier holds it, or the sole entry when
 * a call names none and only one is in flight — every ordinary walk, so a session with no fan open
 * never reaches the named case. An activity named without an instance resolves when exactly one entry
 * names it, which is every branch of a distinct-activity fan. Undefined otherwise: the caller refuses
 * rather than guessing, because a guess serves one instance another instance's work.
 */
export function heldBranch(
  state: SessionFile,
  named: string | undefined,
  instance: number | undefined,
): FrontierEntry | undefined;
```

§5.2's five-step rule needs **no amendment** — step 1 ("Named and in the frontier: that one. Named and absent: refuse. Unnamed with at most one entry: the sole entry… Unnamed with several: refuse") reads identically over entries instead of strings, and the middle clause of `heldBranch` is what keeps a *distinct-activity* fan's branch return spelled exactly as §5.2 already specifies, with `from_activity` alone.

Refusals, in the instance dialect (extending `README.md:279-281`; `challenge-pass#2` here is a **rendering for a person**, not the stored form):

```
Cannot exit 'challenge-pass': the session is on 3 instances of it. In flight: challenge-pass#0, challenge-pass#1, challenge-pass#2. Pass from_instance naming the instance this call is returning.

Cannot exit instance 4 of 'challenge-pass': the session is not on it. In flight: challenge-pass#1, challenge-pass#2. An instance index comes from the fan the enter call reported; report the mismatch rather than retrying with another index.
```

What changes inside the handler: the mutator's `exitingActivity` (`src/tools/workflow-tools.ts:769`) becomes the resolved entry, so the `activity_exited` event (`:771`), the step-completed events (`:812-825`) and the variable wrap (`:804-810`) all carry `data.instance` where the entry has one. `draft.exit` (`:842`) holds the last instance's exit, which is exactly the field's stated meaning after a fan (`README.md:233`). `record_usage` gains `instance?: number` beside `activity` (`:1787`), recorded verbatim as the handler records the activity today (`:1813-1823`) — `account-every-activity` (`dispatch-activity.md:70-72`) gains one clause naming an instance, because its operative unit is what a dispatch covered and each instance is a separate dispatch with its own harness establishment.

### How the barrier property is preserved

Untouched, and the specification's own sentence still reads true verbatim (`README.md:272`): "There is no separate barrier-met call and no separate join-enter call, so entering the join early is not refused — it is unrepresentable, because the only call that can enter the join is the one that empties the frontier." Retire the resolved entry; remove it; enter `activity_id` iff the frontier is now empty. Instance 3's return enters the join; instances 1 and 2 enter nothing and report the barrier:

```
_meta.barrier = { destination: "combine-challenges", pending: [{ activity: "challenge-pass", instance: 2 }], met: false }
```

**And the free-replacement property survives *because* the entry names the slot rather than the worker.** §5.1 refuses a per-entry identity on the ground that "a per-entry worker identity forces a distinct call outcome for a replacement worker, which section 5.4 gets for free without one", realised as `replace-one-branch`: "The replacement names the same activity, which the frontier still holds, so it needs no re-binding call" (`:362`). Under an indexed entry the replacement names the same `(activity, instance)` pair, which the frontier still holds — the property is preserved exactly, and `replace-one-branch` needs **no wording change**. Under a base-keyed frontier it would not hold in the way the spec means: an abandoned instance-1 worker's late envelope would resolve against "an entry holding `challenge-pass`" and could retire instance 2's slot, landing instance 1's outputs under instance 2's key — a silent cross-attribution §11 does not contemplate. The index converts that into the wanted behaviour §11 already describes (`:718`): "whichever envelope arrives first retires the branch and the second is refused as holding no open branch", now per instance.

**Why an entry-borne `agentId` is still refused, though the exposure it would close is real.** `verify-dispatched-activity` (`activity-worker.md:82-84`) compares the activity id the stub bound against the id `get_activity` returned. Two instances share that id, so for an instance fan that comparison **cannot fire**, and §11's residual (`:712`) sharpens: a worker composed for instance 0 that asks for instance 2 is served instance 2's projection, lands its outputs in instance 2's slot, and the gather aligns them to collection order — a run that reports every unit covered when one was covered twice and one not at all. The instance-index refusal on `get_activity` narrows this from "served a sibling's body" to "an index the orchestrator got wrong", which is a smaller population but not an empty one. Claiming the entry's identity would close it, and it is declined here for the reason §5.1 gives and Judge 2 priced (`design-record.md:1555`, "one extra control-plane round trip per branch to bind an identity the server never needs"): the identity would have to arrive in advance on the enter call, which forfeits free replacement. **The residual is carried at full strength rather than argued away**, with its own upgrade trigger, and with the cheaper half already taken: `one-identity-per-branch` makes the instances' delivery scopes distinct, so `priorDeliveryScope` (`src/utils/dispatch.ts:62-77`) fires `activity_redelivered` (`src/tools/workflow-tools.ts:1526-1534`) exactly when two contexts claim one slot — non-silent, though not refused. That event is only legible because the delivery events key on the pair rather than the base id: keyed on the base, a **correct** fan of N fires it N−1 times and buries the one event that means "a worker was replaced".


### isolation

## The container: one indexed branch key, dense, pre-filled, positionally written

### The key is unchanged; the shape below it is an ordered array

`branchKey(activityId)` is §6.1's, verbatim and unmoved: `challenge-pass` becomes `challenge_pass_outputs`. Derived rather than declared, for §6.1's three reasons (`README.md:446`), and suffixed for §6.1's reason (`:448`) — verified against the real schema: `challenge_pass_outputs` parses, and a bare `perspective` is rejected with "a variable name is a qualified snake_case noun phrase (>=2 words, AP-60)".

What changes is the shape below it, which is the amendment's §1 and §3, applied and made concrete:

```
challenge_pass_outputs: [
  { id: "stakeholder-gap",   result: { challenge_findings: [...] } },
  { id: "rejected-paths",    result: null },
  { id: "evidence-strength", result: { challenge_findings: [...] } }
]
```

**Uniformly an array, index always present, including index 0 for a distinct-activity fan's single-instance branch.** That is amendment option A, and this design closes the amendment's open decision (§4, "the decision is properly the owner's, and it turns on one question: is fanning the same activity over N work units in scope?") in favour of A, because it is in scope. Option B — a bare map when the id appears once, a collection when it repeats — is rejected on the amendment's own ground: "a join's read form would then depend on the fan's shape, so an activity borrowed into two workflows would need different reads in each, which is the failure the derived key was chosen to avoid."

**Dense, and pre-filled at the fan enter.** This is the part the amendment leaves open, and getting it wrong corrupts the session file. Verified by execution against `canonicaliseJson` (`src/utils/session/store.ts:145-187`): a **sparse** array — which is what a positional write at index 2 into a fresh `[]` produces when instances retire out of order — canonicalises to `"[\n,\n,\n    {…}\n]"`, because the array branch at `:171-175` maps over the array (the callback skips holes, the result keeps them) and `join(",\n")` renders each hole as an empty string. Reparsing that output fails with `Unexpected token ','` — **invalid JSON, written by `atomicWrite` and unreadable on reload.** An **object with numeric keys** avoids that and loses order: `sortedKeys` sorts lexicographically at any depth other than 0 (`:151-157`), so an eleven-instance fan persists as "0","1","10","2",… — verified — breaking `order-is-preserved` (`scatter-gather.md:108-110`, the gathered collection is in work-unit order so the combine step is deterministic). A **dense array preserves index order through canonicalisation** — verified.

The pre-fill buys four things at once:

1. Order survives the seal.
2. A slot no instance filled holds `result: null`, which both dotted-path evaluators read as absent. Verified: `notExists` is **true** for a null slot, for a member of a null slot, and for an out-of-range index; `exists` is true for a present member.
3. A second fan over the same activity **resets** the container rather than appending into the previous fan's slots — which closes the case §6.1 and §11 name ("Two fans containing one activity share its branch key") and which an index otherwise makes worse. Stated positively, replacing §6.1's last paragraph: **a branch key holds one slot per instance the fan entered, in collection order; a slot no instance filled holds `result: null`.**
4. The container is **already the shape `gather-results` declares** for `dispatched_results` — "Array of `{ id, result }` … in input order" (`gather-results.md:12-14`), with "Missing ids appear with `result: null`" (`:26-28`) — so the join binds the operation with no adaptation.

The pre-fill goes through `applyVariableWrites` as one call, one `variable_set` event, with a fourth `VariableWriteSource` member (`src/utils/variable-seed.ts:45`): `"fan_enter"`, so the stream distinguishes the server's own pre-fill from a worker's report. It assigns the container whole, so it is not a merge, and §6.2's "the transition call is the only write path a branch has" is untouched — the pre-fill is not a branch's write.

### The one specification decision this changes, quoted

§6.5: "**The merge adds the container; it does not replace the members.** `mergeActivityVariables` takes the set of activity ids the graph fans in this workflow, and for each one contributes one further declaration — `{ name: branchKey(id), type: 'object', description: '…' }` — **in addition to** that activity's own write declarations."

The addition-not-substitution decision is preserved for the three reasons §6.5 gives. **`type: 'object'` becomes `type: 'array'`, and the declaration carries no `defaultValue`.** Three mechanisms make that mandatory rather than cosmetic. `disagreement` compares `type` first (`src/utils/activity-variables.ts:62-75`), so a wrong type is what a second declaring site would be measured against. `applyVariableWrites`' declared-type check (`:80-84`) would warn against anything that ever wrote at the container name. And `get_workflow`'s rendered variable set is what an author reads before writing a read of the container, so `object` would make that set lie to the author writing `{challenge_pass_outputs.0.result.challenge_findings}`. No `defaultValue`, or `check:variable-model`'s exists-on-defaulted rule makes every `exists` gate on the container constant.

### The guard changes

The two files are §6.5's: `src/utils/activity-variables.ts`, the module the server and the guards share, and `scripts/check-activity-variables.ts`.

**The read walkers need no change at all**, and that is verified rather than assumed. Both split a literal path and bracket-index after a `typeof current !== "object"` guard, which an array satisfies (`src/schema/condition.schema.ts:41-49`; `src/schema/when-expression.ts:287-294`). The `when` tokeniser starts an identifier on `/[A-Za-z_]/` and continues on `/[A-Za-z0-9_.]/`, so a numeric segment is consumed inside the identifier and never reaches the numeric-literal branch. Executed against the real modules: `parseWhen("challenge_pass_outputs.0.perspective_name == \"stakeholder-gap\"")` parses to one `cmp` node carrying the full indexed path; `expressionPaths` returns full indexed paths including a two-digit index; evaluation is true at index 0 and 2 and false at the null slot and out of range. `expressionPaths` feeds `whenReads` → `bagName` (`src/utils/activity-variables.ts:236-238, 216-218`), which takes the head, so the guard's read collector already resolves an indexed reference to the container.

**Read side, member grain.** §6.5 item 1's `pathReads` is unchanged in shape: the head is still the container, so the namespace test is identical. The **member test strips two segments the container's own shape interposes** — a leading all-digits segment, then the literal `result` — before comparing the remainder to the member set. That is a refinement of the amendment's §6.5 row ("the member test moves one segment right and skips a numeric segment"): correct in direction, and two segments rather than one, because the container's entry is `{ id, result }` and not the reported map bare.

**Write side, index-free.** The declared-write set for a fanned activity becomes the container plus one entry per member spelled `container.member` — **no index**, because N is a runtime value and a static guard cannot enumerate instances.

**Three families under existing names**, exactly as §6.5 item 3 specifies. `unwritten-read` at member grain, reading past the index and the `result` segment. `unread-write` at member grain, carrying forward the self-consumed exemption `readersOf` already gives (`scripts/check-activity-variables.ts:199-206`) — without it the family fires on the order of 35 times on one correct fan. And the amendment's one new diagnostic: a read that omits the index is reported, naming the instance form, because with a uniform index `{container.member}` addresses nothing and the flat walker would never find it.

**`over` acquires a reader that is not an activity, and this is a genuinely valuable new check.** A fan's collection is read by the *graph*. The guard contributes `bagName(fan.over)` — the head, so a dotted `over` resolves to `execution_plan` — as a synthetic read of the **branch** activity, not the source, for a mechanical reason: `unreachableReads` tests a read against `incoming.get(id)` (`:650-653`), and the source may write the collection itself (`decompose-work-units` emits `work_units` in the source activity), so attributing the read to the source would report it falsely. Attributed to the branch, `incoming(branch)` is the intersection over arrivals and the source's arrival contributes `outgoing(source)` including its writes — which is exactly right: **the collection must be available on entry to the branch.** The synthetic read joins two existing passes: the reachability `reads` map, so *a fan entered on a path where its collection was never written is reported* (`unproduced-value-read` at graph grain), and the `unwritten-read` loop, so *a fan over a collection no activity writes and the workflow file does not own* is reported. Both land inside existing family names with a fan-specific detail string:

```
'challenge-pass' is fanned over 'challenge_perspectives' on a path that reaches the fan before anything writes it
```

Without that first half, the fan-enter refusal is the only detector and it fires at run time on a live session.

**One new family name, and it closes a hole no existing family can see.** Declaring the parameter under `workflow.variables[]` puts it in `owned` (`:94`), which satisfies `unwritten-read` (`:210`) at zero code cost — but `availableAtEntry` also seeds from `owned` (`:228`) and `policy` is `owned` (`:244`), so a read of the parameter **outside its branch** is reported by nothing: an activity elsewhere in the workflow can declare `challenge_perspective` as a read and receive nothing at run time, silently.

```
fan-parameter-read-outside-its-branch
  reads 'challenge_perspective', which the fan at 'reconcile-assumptions.converged' hands to each
  instance of 'challenge-pass' and to nothing else; outside that activity the name holds nothing.
```

Detect: for each instance fan, each activity record other than `fan.activity` whose `declaredReads` or `derived.mentions` holds `fan.variable`. Decidable from the graph object plus declared reads. It lands inside the existing `activity-variables` registry entry alongside §6.5's four, so §10's "No 37th guard registry entry" holds — the registry stays at **36** (`scripts/guards.ts`, `activity-variables` at `:37-44`).

### The reachability treatment: the meet over instances is trivial, and an unbounded runtime N never enters the walk

§6.6's change is the meet: arrivals intersect, and a completed fan is **one** arrival contributing the union of its live branches' outgoing sets. Under instances that is trivial, for three verified reasons.

1. **The walk's graph collapses a fan of N identical instances to one node.** `activityGraph` already dedupes (`src/utils/activity-variables.ts:543`, `[...new Set(Object.values(...))]`), and §6.6's one-line flatten must be written `[...new Set(Object.values(...).flatMap(destinationTargets))]` — deduping *after* flattening. An instance fan's `destinationTargets` returns one target, so the forward BFS (`:604-611`), the predecessor index (`:597-600`) and the strongly-connected pass (`:679-716`) see exactly the graph a single visit produces. **An instance fan creates no cycle**, so the `re-entry` family (`:661-671`) is unaffected.
2. **The union arrival is idempotent over instances.** For N instances of one activity the union over live branches of `outgoing(branch)` is `incoming(a) ∪ writes(a)` — one branch's outgoing set. The meet's behaviour for an instance fan is indistinguishable from a plain sequential edge and does not depend on N.
3. **The set of names a fan makes available is N-independent** — the property §6.6 already identifies as what the namespacing buys: "a branch contributes exactly one flat bag name whatever object landed under it." The index lives inside the value, so the lattice does not grow with N, termination is unaffected, and **an unbounded runtime width cannot break the walk because the walk never sees a count.**

Two traps specific to a repeated destination, both of which would make the change do nothing. §6.6's requirement that "a branch must be removed from the plain predecessor index for its join" must remove *all* duplicate entries: `:598-600` pushes `from` once per entry of `from`'s target list, so an undeduped flatten pushes the source N times and the intersection wipes the union straight back out. Re-deduping inside `activityGraph` (trap-free by construction) is the cheaper fix and is the recommendation. And `FanGroup.branches` is `string[]` "in graph order", so any per-branch bookkeeping keyed on the id must iterate distinct ids.

**What the analysis cannot see, and how it is answered rather than checked.** `unreachableReads` proves a read is satisfied on every arrival at **container** grain. A join reading `{challenge_pass_outputs.2.result.member}` when the collection held two elements reads undefined, and nothing detects it: the member-grain read test checks the *member*, and `availableAtEntry`/`incoming` are name sets carrying no length. An index-range load rule is impossible, because `maxInstances` is a ceiling and the width is a runtime collection length. **So the answer is that a join does not author indices**, and that becomes a rule rather than a residual, in `scatter-gather` where §6.4 already amends:

> `a-join-gathers-the-container-not-an-index` — A join reads a fan's container whole and hands it to `orchestration-patterns::gather-results` with the fan's own collection as `expected_ids`. An instance fan's width is its collection's length when the fan was entered, so a join naming a slot by index reads a position that may not exist and nothing detects it; the container's own order carries the correspondence the join needs.

**One other graph reader, unchanged in kind by instances.** `scripts/check-review-mode-gating.ts` declares the graph shape itself and parses raw YAML, so the fan rules cannot protect it (§6.6). For an instance fan an unflattened destination makes its activity lookup undefined and drops the whole subtree beyond the fan out of the reachability set — the same consequence, the same fix.

### The join, and the operation that finally has a caller

An instance fan **requires** `gather-results` where a distinct fan merely may use it, and the reason is structural. A distinct fan's join names its containers literally — §6.4's three dotted projections into three named keys — because N is authored and the join can spell N reads. An instance fan's N is a runtime collection length, and there is no indirection in the token grammar and no dialect anywhere expressing "for each member of this container". So the join **cannot** spell its reads and must hand the whole container to an operation that walks it. That operation exists, declares the contract, and has never had an executing caller:

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

Two renames and one dotted-projection template — the three sanctioned deviation forms (`variable-binding.md:31`), no new construct, no new operation. `expected_ids` binds unchanged: its declaration already reads "Ordered expectation list. Each entry is either a string id or an object with an `id` field (e.g. `{work_units}` or `{worker_briefs}` bound by name). Objects contribute their `.id`" (`gather-results.md:16-18`), and the fan's `over` collection **is** that list by construction, so **`expected_ids` needs no derived write and the graph needs no copy of the collection** — the graph names the bag name, the join reads the bag name, one home. `dispatched_results` binds unchanged because the container is already `{ id, result }` in input order. `order-is-preserved` holds by construction, the index being the collection's own order. `dispatch_manifest` has one live reading: an instance that returned an envelope with no writes lands `result: {}` and is marked `empty` — real, and particularly worth having for a replaced instance. `completeness` is **structurally constant at the join**, because §5.2 step 4 enters the join only on the call that empties the frontier, so no expected id can be missing there; the specification should say so rather than advertise the manifest as the missing-instance detector.

Taking `gather-results` rather than a near-identical new gather is required, not merely tidy: the only difference would be the entry shape, and a second gather over one combine contract is `duplicate-shared-capability` against the rule that already forbids it (`scatter-gather.md:96-98`, `one-gather-contract-two-scatter-modes`, which §6.4 already extends with the graph fan as a third scatter mode).

**`decompose-work-units` also gains a caller; `compose-worker-briefs` is displaced.** `decompose-work-units` produces `work_units` as `{ id, brief, tools_hint? }` where "`id` is a stable slug" (`decompose-work-units.md:66-68`) — it is exactly the producer of a fan's `over` collection and binds unchanged at the fan's **source** activity, with its `effort_cap` (`:60-62`) the authored half of the width bound. `compose-worker-briefs` builds a per-unit *prompt* carrying the unit's brief; under an instance fan the prompt is `compose-prompt`'s and the brief travels as the projection, so putting the work in the prompt is what `context-travels-as-state` forbids. It is displaced at the graph layer and survives only for in-activity fan-out.

### The cost, honestly, and what a character count cannot see

The alternative to an instance fan is not a batched walk of N different activities. It is **one** activity whose loop body runs N times in one worker, which is what the corpus does today, and it pays one `get_activity` response: the loop-body technique is bundled once and reused per iteration ("An entry for a step inside a loop body is the protocol for EVERY iteration: engage it once per iteration from the copy you hold, and do not re-fetch it per pass", `src/tools/workflow-tools.ts:1406`).

No collapse is available for a fan even in principle. `one-identity-per-branch` requires each instance a distinct identity (`README.md:360`), the delivery ledger keys on it (`src/utils/delivery.ts:63-65`), and a shared identity hands instances 2..N markers for bytes they never received — "a marker is unreadable to a context that never received the bytes" (`:53-55`). N instances take N full deliveries of one activity's payload.

There is no measured figure for a *fanned* activity's payload in the tree, so substituting the standalone mean of **87,324** characters from the only measured figures (`docs/dispatch-model.md:86`, `npm run bench:batch` at submodule `5f92dc06`: 261,971 standalone across three activities), and saying plainly it is a substitution:

- **Instance fan, N=3:** ≈261,972 delivered against ≈87,324 for the sequential loop. Delivered premium ≈**174,648 characters, +200%** — in general **(N−1) × the activity's whole payload**.
- **Plus (N−1) harness establishments**, which `docs/dispatch-model.md:68` rates at two to four times what the content collapsing saves — 78,932 to 157,864 character-equivalents for two.
- **Total ≈253,000 to 332,000 characters, ≈63,000 to 83,000 tokens** at `DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4` (`src/config.ts:156`).
- Against §1's distinct-fan premium of 118,000–197,000 characters, **an instance fan of the same width is about twice as expensive**, for a structural reason worth one line: a distinct fan's sequential alternative pays three activity payloads anyway, so its premium is only the forgone collapse (17.7%); an instance fan's alternative pays one payload for all N units, so its premium is that payload, N−1 times.
- Every figure is a floor, for the reason the benchmark's own is: it counts eager payloads and never a lazy fetch (`:84`). Re-derive against a fresh `bench:batch` before specification prose quotes it.

**And what it buys is not only wall clock.** The activity cap of 3 (`DEFAULT_BATCH_MAX_ACTIVITIES`, `src/config.ts:165`) exists for what a character count cannot see: "the context the harness establishes and the server never delivers, the code the worker reads, the artifacts it drafts, and the degradation that comes with a long walk" (`docs/dispatch-model.md:76-78`). An in-context loop of N units accumulates all N reasoning passes in **one** context, and nothing bounds that, because the batch budget counts delivered characters, not generated ones (`src/utils/batch.ts:98-123`). At the challenge sites that is up to N × 10 passes in one worker — `doWhile`, `maxIterations: 10` (`04-research.yaml:137-146`). An instance fan converts unbounded intra-activity context growth into N bounded contexts, which is `isolation-then-combine` buying correctness rather than latency. That belongs in the cost paragraph beside the negative token number.

### The serialising side effects, and the criteria they impose

The timing fact that decides all of them: **a branch worker writes its files during its own run, inside the concurrent turn, before any transition.** `dispatch-fan` spawns the batch at step 5 and retires branches in input order at step 6, so the *retires* are serialised and the *writes* are not. `persist-the-fan-before-any-branch-returns` answers the commit, not the write.

1. **One feature worktree, one git index.** `create-worktree.md:33-39` materialises one worktree at a single session variable's path. git serialises index mutation with `.git/index.lock`, so two concurrent `git add` invocations do not corrupt the index — the second dies with "Unable to create '.git/index.lock': File exists". `commit-and-persist.md:31` retries a failed *push* once; nothing retries a failed `git add`, so a lock collision surfaces inside a branch as an unhandled command failure. And even fully serialised the attribution is wrong: `commit-and-persist.md:26` derives its paths from `git status --porcelain` over one working tree, which cannot attribute a change to a branch — §11's residual, and the reason `persist-the-fan-before-any-branch-returns` exists. **For instances that residual is strictly worse**, because the spec's fallback of attributing by activity id is unavailable: N instances share one id. The corpus has no serialisation primitive to reach for; its nearest analogue is optimistic retry (`manage-git/artifact-commits.md:38-40`, pull-rebase before every push plus one retry). **So this is a criterion, not a rule to police: a fannable activity binds no `manage-git` or `version-control` operation and does not bind `workflow-engine::commit-and-persist`.**
2. **Append-ordered registers.** `manage-registers/append-deferred-item.md` declares artifact `deferred-items.md` and `append-follow-up.md` declares `follow-ups.md`, both **literal and unprefixed by rule** (`created-lazily-and-unprefixed`: "A register is created when its first row arrives and not before … neither register carries an activity's numeric prefix"), and the write is a read-modify-write of the whole file. Two instances write the same path and one instance's rows vanish with no trace. `07-assumptions-review.yaml:142-144` binds `append-deferred-item` today, so this is not hypothetical. **Criterion: a fannable activity writes no shared unprefixed register.**
3. **The provenance log's completion-order contract.** `dco-provenance/append-task-row.md` declares artifact `provenance-log.md`, and the guide's Rules state "One row per task, appended… no row is edited or removed once written". Two hazards at once: concurrent appends to one file lose rows, and even serialised the row order becomes the nondeterministic order N instances finished in, which the guide states as a property a reader compares rows against. **Criterion: an activity binding `append-task-row` is not fannable.**
4. **The planning README's Progress table.** Two instances share one `artifactPrefix` (server-computed from the activity filename, `src/schema/activity.schema.ts:310`), so `sync-progress-status`' selection resolves to the *same* rows (`sync-progress-status.md:42-46`). Two in-progress marks on one row are idempotent; two **complete** marks are not, because step 7 (`:48`) repoints the Item link at `{delivered_artifact}` and N instances landing N files fight over one link slot. Answered by the spec's existing rules — one commit of all marks before the spawn, one persist at convergence — plus the row consequence in the artifact decision below.
5. **The artifact writer itself** — the safety-floor item, resolved at source in the artifact decision rather than detected.

**Criteria 1 to 3 are criteria and not checks, on purpose.** Prose warning "do not also bind X" is what Prefer Removing the Thing That Needs a Prohibition tells you to design out; here the removal is upstream (the activity that touches a checkout or a shared register is not the one you fan), and a guard policing it would be a fourth new family enforcing a judgement an author makes once at design time. They are stated in the fannability criteria and as residual risks, not mechanised.


### artifact decision

## The collision, resolved: the branch declares no artifact; where it must, the instance is in the filename

The amendment leaves this open twice — §3's last row ("same-activity fan-out needs artifact paths to carry the instance before it is usable") and §4 ("**Same-activity fan-out therefore depends on an artifact-naming decision this amendment does not make.**"). Here is the decision, in two halves, both of which are already-authored corpus shapes rather than new mechanism.

### The rule: a fan branch declares no `#### artifact`

Its outputs land in its container slot and **the join writes the document.** Nothing breaks, because no branch is a writer: the guide map, the audience declaration, `write-artifact`'s find-or-update discipline, the citation rule and every filename-reading guard (`check-artifact-guides`, `check-audience`, `check-technique-template.ts:175`, `composeActivityArtifacts` at `src/tools/workflow-tools.ts:120-167`) see exactly one writer at one filename, which is what they see today. `fan-artifact-collision` becomes **vacuous** rather than fails-open. And it is the corpus's own `isolation-then-combine` raised to graph grain (`scatter-gather.md:104-106`: "Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances. Combination happens exclusively in the combine phase") — the specification's stated framing at §6.4.

**Named failure mode: the join becomes the context bottleneck.** The join takes a fresh delivery scope and re-pays whatever the branches collectively held (§11, "The join re-pays full delivery"), and nothing caps a fan's width at the batch layer (see below). A wide fan of document-shaped instances hands the join every instance's payload to write one document, and the failure is a silently truncated or elided document — no refusal fires, because the batch bound exempts a scope with no activity yet (`src/utils/batch.ts:154`) and the artifact writer validates nothing about completeness. `maxInstances` is what an author has against it.

### The sanctioned deviation: the instance token in the filename

Where a branch must persist a document of its own, **every `#### artifact` on the fanned activity's composed signatures interpolates the fan's `variable` as a `{token}`**, and the filename gains one row in the producing workflow's guide map spelled with the token verbatim.

The mechanism exists and is already sanctioned in both places that would otherwise reject it:

- `ARTIFACT_NAME_PATTERN` is `/^(?:[A-Za-z0-9._-]|\{[A-Za-z0-9._$-]+\})+\.[A-Za-z0-9]+$/` (`src/schema/technique.schema.ts:54`), described as "one path segment ending in an extension, where a `{token}` placeholder stands wherever literal text would" (`:47-52`).
- `AP-130 artifact-name-is-filename`, **Do not flag**: "a token-template whose `{placeholder}` resolves at runtime (`{package_name}-plan.md`, `subsystem-{code_subsystem.subsystem_name}.md`) — a placeholder standing where literal text would is part of the name, not prose."
- `write-artifact.md:50` states the semantics that make it safe: "token-templated names (e.g. `strategic-review-{n}.md`) are an intentional numbered **SERIES** — each interpolated name is its own logical artifact and is created, not matched against siblings." So the find-or-update keyed on a bare filename (`:41-48`) never sees two instances as one artifact, and **the mint-attempt guard at `:46` is not asked to arbitrate a race it cannot win** — which is what removes §6.5's safety-floor data-loss case at its source instead of detecting it.
- Guide resolution takes the declared string, template included: `mapRowFor` matches by exact string after splitting the filename column on commas and stripping backticks (`scripts/check-artifact-guides.ts:126-135`), with the row's guide links required to resolve (`:148-154`).

**The corpus already does exactly this at two sites, both green today.** `substrate-node-security-audit/techniques/execute-sub-agent.md:26-32` declares artifact `{agent_id}.json` with `audience: agent`, its input documented as "Designator for this agent instance … which also names the persisted output file" (`:12-14`), guide-mapped at `substrate-node-security-audit/resources/README.md:35`. `cicd-pipeline-security-audit/techniques/execute-sub-agent.md:22-28` declares `{scanner_id}.json`, guide-mapped at `cicd-pipeline-security-audit/resources/README.md:34`. `work-package/resources/README.md:64,66-68,70` carries four more templated rows (`NNNN-{decision_title}.md`, `strategic-review-{n}.md`, `{codebase_area}.md`, `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md`). So the deviation ships with two live precedents and no new machinery.

Audience is unaffected: audience is a property of the output, not of a file instance, and `isJsonArtifactName` (`scripts/check-audience.ts:56-58`) already accepts a templated name whose literal suffix is `.json`.

**Named failure mode: a templated instance artifact is never updated in place** (`write-artifact.md:50`). The index makes re-entry representable, so a second visit to the same fan re-resolves the same template and **creates** rather than updates. And if two elements ever interpolate to one value — a duplicated roster entry — they collide silently, because the check below is decidable only where the template names the fan's parameter and cannot know two elements share an id.

### The check that converts an open decision into a rule

**The instance arm of `fan-artifact-collision`** — the same family name §6.5 introduces, so no thirty-seventh registry entry and §7 row 29 keeps its safety-floor status for §6.5's own stated reason ("two concurrent branches both re-scan, both create, and the run thereafter resolves the lowest-numbered instance for the rest of the walk — data loss, not hygiene"). The distinct-activity arm is unchanged.

Detect: for an activity an instance fan runs, every `#### artifact` name on every composed step signature must contain a `{token}` whose head is that fan's `variable`. Decidable from what the guard already reads — `readSignature` already tokenises `output.artifact?.name` (`src/utils/activity-variables.ts:309-312`) — plus the graph object. It lives in the guard rather than the loader for §6.5's stated home split: it needs composed technique signatures, which the loader does not compose and must not start composing on the per-call load path.

```
Activity 'submodule-scan' is fanned by 'reconnaissance.classified' over 'scan_units' and writes
artifact 'scan-findings.json'. Every instance resolves that one filename to one file, so either the
name carries the instance — '{scan_unit}-scan-findings.json' — or the branch declares no artifact and
the activity the fan converges on writes the document.
```

The message states both arms of the decision, because both are legal and the author chooses.

**Consequence carried back into the fan-enter refusals.** Making the parameter filename-bearing is why the element's id must be a slug and why the fan enter refuses an element that is neither a string nor an object carrying a string `id`: that id names the container slot, the dispatch-manifest row and the artifact filename, so an element with no derivable id makes three downstream facts undefined at once. And it is why the artifact template interpolates the **id**, not an object element's arbitrary field.

### The two alternatives, and why each is refused rather than merely not chosen

**A per-instance subfolder** (`{planning_folder_path}/{challenge_perspective}/findings.md`). Refused on two independent grounds. `ARTIFACT_NAME_PATTERN` admits no path separator, and the rejection message says so in terms — "an artifact name is a single filename — one path segment ending in an extension" (`src/schema/technique.schema.ts:57-58`) — so a subfolder is not expressible in the declaration at all and would have to arrive through `write-artifact`'s `target_dir` input (`write-artifact.md:24-30`). And `operational-discipline-artifact-location` forbids it: "Write planning artifacts only under the server-returned `{planning_folder_path}` — never compose or reconstruct that path" (`meta/techniques/agent-conduct.md:46`). Beyond the rules, three surfaces break: `verify-artifact-links.md:26` enumerates the folder's `.md` files, so subfoldered instances leave the link audit; a Progress Item link targets the minted filename, prefix plus bare name (`planning-readme.md`, Item cell), so a seeded link cannot predict a subfolder segment; and `push-before-linking` then publishes links into a shape the seed did not anticipate. (`15-codebase-comprehension.yaml:56-60` is not a counter-example: `comprehension_dir` is declared "outside any one session's planning folder" and is a cumulative corpus, not a planning artifact.)

**One file the instances append to under a lock.** Refused. There is no lock primitive anywhere in the corpus — the nearest thing is optimistic retry (`manage-git/artifact-commits.md:38-40`; `commit-and-persist.md:31`) — so "under a lock" means inventing one, at the very layer §8 rejects a lock ("a compare-and-swap on the record's sequence number with retry, not a per-session write lock"). It also contradicts `write-artifact`'s whole-file find-or-update (`:44`, "UPDATE that file in place, writing `{artifact_content}` to it"): the write is a full rewrite from a value the branch holds, not an append, so two branches serialised by a lock still lose the first branch's content unless each re-reads inside the critical section, which no operation does. This is Prefer Removing the Thing That Needs a Prohibition inverted — it adds mechanism precisely to police an overlap the rule above removes.

### Progress rows

The fanned activity **keeps its single row**; instance artifacts get **none**; the join's artifact is what the row links, through `sync-progress-status`' `delivered_artifact`. Three reasons this is the answer rather than a shortfall. Row ownership is keyed by two-digit `artifactPrefix` with Item labels authored in the workflow's readme-seed profile (`planning-readme.md`, Row-ownership map), and a runtime-sized instance set cannot be seeded into it. "A row absent from the map is unselectable — a writer cannot resolve which activity owns it, so its status never advances", so an unseeded instance row would be inert anyway. And the precedent is already stated: an artifact can exist without a row (`planning-readme.md`, "**An agent-audience artifact gets no row.** … The activity that produces it still owns a row, so the work stays visible without linking a file nobody reads") — which also covers the two live templated-artifact sites, both `audience: agent`. This is what makes §6.4's planning-readme amendment satisfiable rather than merely stated: with one row and one link slot per fanned activity, no two instances contend for one cell.


### enforcement

One row per invariant. **schema** is carried by the zod type and surfaces as a parse error. **load** is a failure from `validateExitBindings` (`src/loaders/workflow-loader.ts:520-572`, run at `:366` after fragment materialisation and the variable merge, failing the load at `:367`). **tool** is a server refusal at the boundary. **derived** means unrepresentable, so nothing needs checking. **guard** is a hard-zero finding inside the existing `activity-variables` registry entry. Rows marked **not structural** are contracts an actor honours; they are listed so no reader mistakes them for enforcement. Rows I1–I27 are this extension's; rows carried from §7 unchanged are named at the end rather than repeated.

| # | Invariant | Where checked | What it reports |
|---|---|---|---|
| I1 | A destination is a string, a list of strings, or `{ activity, over, variable, maxInstances }` | schema | `graph.reconcile-assumptions.converged: a destination is an activity id, __terminal__, a list of at least two activity ids, or { activity, over, variable, maxInstances } to run one activity once per element of a collection` — for a number, a non-string list member, a nested list, and an object carrying an unknown or missing field |
| I2 | An instance fan admits at least two instances | schema | `graph.reconcile-assumptions.converged.maxInstances: a fan admits at least two instances; an exit that leads to one run of one activity names that activity` |
| I3 | An instance fan's parameter is a legal variable name | schema | `graph.reconcile-assumptions.converged.variable: a variable name is a qualified snake_case noun phrase (>=2 words, AP-60), e.g. analysis_target` — so a bare-word parameter fails the parse and no load rule is needed for it |
| I4 | An instance fan carries no field outside its four | schema | `.strict()` on `InstanceFanSchema`; `additionalProperties: false` in the generated JSON |
| I5 | The fanned activity is an activity this workflow contains | load | L1, over `destinationTargets` |
| I6 | A list destination names no activity twice | load | **L2, re-aimed not withdrawn.** `Workflow graph fans 'reconcile-assumptions.converged' to 'challenge-pass' twice. A list destination runs each of its activities once; to run one activity once per element of a collection, name that activity with the collection it fans over: { activity: challenge-pass, over: <collection>, variable: <name>, maxInstances: <n> }.` |
| I7 | The fanned activity is not the terminal sentinel | load | L3 |
| I8 | The fanned activity binds at least one exit | load | L4 |
| I9 | The fanned activity's own exits do not fan again, in either form | load | L5, widened: `Activity 'challenge-pass' is a branch of the fan at 'reconcile-assumptions.converged', and its exit 'challenged' fans again. A branch runs in one worker and returns to the join, so each of its exits names one destination.` — also rejects a fan whose branch is its own source |
| I10 | The fanned activity routes no exit back onto itself | load | L6 — also rejects a join that is its own branch |
| I11 | Every exit of the fanned activity names one and the same activity — the join | load | L7, unchanged. Its *cross-branch* half is vacuous for an instance fan (one activity, so agreement is trivial — the single largest simplification instances buy over the distinct form); its *multi-exit* half still bites: `The fan at 'reconcile-assumptions.converged' converges nowhere: 'challenge-pass' sends exit 'challenged' to 'combine-challenges' and exit 'blocked' to 'assumptions-review'. Bind every exit of the fanned activity to the one activity the fan converges on, which is what the run enters when the last instance returns.` |
| I12 | The join is an activity, not the terminal sentinel | load | L8 |
| I13 | The fanned activity declares no gate | load | L9, message gains one clause: `… Move the gate to the activity before the fan or to the activity it converges on. Every instance of a fanned activity runs the same definition, so there is no instance to take out of the fan.` The load check itself is already instance-safe: it uses the existing checkpoint helper over `flattenActivitySteps` (`src/schema/activity.schema.ts:322-332`), which walks loop bodies and runs post-materialisation, and it keys on the branch activity, so testing it once is necessary and sufficient |
| I14 | The branch key is a legal, unique variable name | load | L10 |
| I15 | The fanned activity declares a read of the fan's parameter | load | **L11** — `Workflow graph fans 'reconcile-assumptions.converged' to 'challenge-pass' over 'challenge_perspectives', handing each instance its element at 'challenge_perspective', which 'challenge-pass' does not declare under variables.reads.` |
| I16 | The fan's parameter is declared in this workflow's variable set and carries no starting value | load | **L12**, two messages. Missing: `Workflow graph hands each instance of 'challenge-pass' its element at 'challenge_perspective', which this workflow declares nowhere. Declare it under the workflow's variables[] with a type and no defaultValue: the fan supplies the value per instance.` Defaulted: `… which is declared with defaultValue "stakeholder-gap". A starting value is seeded into every session's bag at creation, so every context would hold one value the fan exists to differ on.` |
| I17 | The fan's collection is a name this workflow's variable set contains | load | **L13** — `Workflow graph fans 'reconcile-assumptions.converged' to 'challenge-pass' over 'challenge_perspectives', which this workflow declares nowhere. A fan reads its collection out of the variable bag, so the collection is a variable some activity in this graph writes or this workflow file owns.` Checks `bagName(over)`, so a dotted `over` is checked at its head |
| I18 | A declared width is within the server's ceiling | load | **L14** — `Workflow graph fans 'reconcile-assumptions.converged' to 'challenge-pass' with maxInstances: 40; this server admits at most 16 (WORKFLOW_FAN_MAX_INSTANCES). A fan spends one dispatch per instance in one turn, so the width a deployment admits is its own limit and a workflow is authored against it.` |
| I19 | Two fans of one activity hand the element at the same name | load | **L15** — `Workflow graph fans 'challenge-pass' from 'reconcile-assumptions.converged' handing each instance its element at 'challenge_perspective', and from 'reconcile-questions.converged' at 'comprehension_lens'. 'challenge-pass' declares one read for its element, so every fan of it hands the element at the same name; the collections may differ.` This **permits** two fans over different collections, which the corpus's two-roster challenge case needs |
| I20 | A fan's collection is a non-empty array whose every element carries a derivable id, within the fan's declared width | tool | Four fan-enter refusals: over-width (names `effort_cap` as the upstream cap and `maxInstances` as the local one), empty (`A fan of no instances would enter its join at once and skip an activity the graph says runs; route past the fan with a 'when' on the exit instead.`), non-array, and `element 2 of 'challenge_perspectives' is an object carrying no 'id'. Each element's id names its container slot, its dispatch-manifest row and its artifact filename, so an element is a string or an object with a string 'id'.` |
| I21 | A call exits an instance the session is actually on | tool | The two branch-return refusals. Subsumes the second-advance hazard `one-advance-per-activity` names, per §5.2 |
| I22 | A worker is served the instance it was dispatched for, never guessed at | tool | The three `get_activity` refusals. The membership test stops being vacuous for the *activity* half only where one instance is in flight; the *instance* half is what closes it for a fan, and it trusts the index the caller supplies — see residual risks |
| I23 | **The join is entered once, after the last instance returns** | derived | Nothing to report. §5.2's rule is unamended: the only call that can enter the join is the one that empties the frontier |
| I24 | **No instance writes into another instance's slot** | derived | Nothing to report. The slot is `container[index]`, the index is the resolved frontier entry's, and the wrap is server-side from the graph the handler already loaded. The transition call is a branch's only write path once the gate ban closes the checkpoint channel (§6.2) |
| I25 | A slot no instance filled is legible as absent | derived | The pre-fill lands `{ id, result: null }`, and both dotted-path evaluators answer `notExists` true for a null slot, a member of one, and an out-of-range index — verified by execution |
| I26 | The container's order is the collection's order | derived | A dense array, pre-filled in collection order, positionally written. Verified: `canonicaliseJson` preserves array order at every depth, while an object with numeric keys sorts lexicographically at depth > 0 and an array written sparsely canonicalises to invalid JSON |
| I27 | A fan's width is not bounded by the batch bound | derived, and stated so no reader wonders | `batchState` exempts a scope with no activity yet (`src/utils/batch.ts:154`) and `batchRefusal` returns undefined for an activity the scope already holds (`:176`). An instance scope is fresh and asks for its first activity, so it is admitted whatever the width, and on the retire call `_meta.batch` reports `activities: 1`. **The F case is vacuous**, exactly as §5.7 states for the distinct form. `maxInstances` and the server ceiling are the whole bound |
| I28 | Every member of an instance's map matches its declared type and value set | tool, warn-only | Today's wording unchanged, validated against the branch activity's own declared writes read at the wrap (§6.3), so `context_scope`'s three-value set keeps its warning. The per-name loop in `applyVariableWrites` (`src/utils/variable-seed.ts:75-92`) runs **unchanged**; only the commit changes, to `draft.variables[key][index].result = values`, with the `variable_set` event naming `key.index.result.member` |
| I29 | The container is declared as what it holds | load (merge) | `mergeActivityVariables` contributes `{ name: branchKey(id), type: 'array', description }` with no `defaultValue`. A wrong type would be what a second declaring site is measured against by `disagreement` (`src/utils/activity-variables.ts:62-75`), would warn in `applyVariableWrites` (`:80-84`), and would make `get_workflow`'s rendered set lie to the author writing an indexed read |
| I30 | Nothing reads an instance's output by its bare name | guard | `unwritten-read`: the bare member is written by nothing once the write side is re-keyed |
| I31 | Every member a gather names is one its branch produces | guard | `unwritten-read` at member grain, reading past the index and the `result` segment |
| I32 | Every member a branch produces is gathered somewhere | guard | `unread-write` at member grain, with the self-consumed exemption carried forward |
| I33 | A read that omits the index is reported | guard | The amendment's one new diagnostic, under `unwritten-read`, naming the instance form |
| I34 | A read at the join is satisfied on every arrival | guard | `unreachable-read` with §6.6's arrival meet. Instance-trivial: the fan is one node, the union is idempotent, the lattice is N-independent |
| I35 | A fan entered on a path where its collection was never written is reported | guard | `unreachable-read`, from the synthetic `bagName(over)` read attributed to the **branch**: `'challenge-pass' is fanned over 'challenge_perspectives' on a path that reaches the fan before anything writes it` |
| I36 | A fan over a collection nothing writes and the workflow file does not own is reported | guard | `unwritten-read` at fan grain, from the same synthetic read |
| I37 | The fan's parameter is read only by the activity the fan runs | guard | **`fan-parameter-read-outside-its-branch`** — the one new family name. Necessary because L12 puts the parameter in `owned`, which seeds `availableAtEntry` (`scripts/check-activity-variables.ts:228`) and is `policy` (`:244`), so `unwritten-read` and `unreachable-read` both skip it |
| I38 | No instance of a fan writes an artifact another instance also writes | guard | **`fan-artifact-collision`, instance arm** — every `#### artifact` on the fanned activity's composed signatures interpolates the fan's `variable`. **Safety floor**, and it decides the instance case rather than failing open on it, which is the distinct arm's stated limit |
| I39 | A gate reachable only through a fan is still audited for a review-mode auto-advance | guard (`review-mode-gating`) | Unchanged from §7 row 28; without the flatten the whole subtree beyond a fan drops out |
| I40 | Each instance runs under its own identity | `dispatch-fan` rule | **Not structural**, unchanged from §7 row 30, and load-bearing twice over: an instance fan's siblings share an activity id, so the delivery ledger and the batch bound can only tell them apart by identity |
| I41 | Every instance carries exactly one usage entry | `account-every-activity`, cited by the fan operation | **Not structural.** An instance with no entry appears in the activities-without-usage list once that projection diffs `(activity, instance)` pairs against the `activity_exited` events — which it must, or N−1 missing figures are invisible |
| I42 | An instance touches no checkout, no shared unprefixed register and no append-ordered log | fannability criteria, and one `dispatch-fan` rule | **Not structural, and deliberately not mechanised.** Three surfaces lose data silently under concurrency (one git index with one `.git/index.lock` and no retry on `git add`; `deferred-items.md` and `follow-ups.md` written whole; `provenance-log.md` appended in completion order), and none is a rule to police — it is a criterion for which activity you fan |
| I43 | A join gathers the container rather than naming a slot by index | `scatter-gather` rule `a-join-gathers-the-container-not-an-index` | **Not structural**, and it cannot be: `maxInstances` is a ceiling and the width is a runtime collection length, so an authored index is unrangeable at load and invisible to the guard's name-set lattice |
| I44 | A worker executes the instance it was dispatched for | `verify-dispatched-activity`, a worker rule | **Not structural, and for an instance fan it cannot fire at all** — two instances share the activity id the rule compares. The `get_activity` instance refusal (I22) is what stands in its place, and it trusts the caller's index. Carried at full strength in residual risks |

**Carried from §7 unchanged, with no instance-specific reading:** rows 13 and 14 (the yield refusal and the child-dispatch refusal, both keyed on the frontier being non-singleton, which an instance fan satisfies), 16 (an exit is required on a fan-enter — which is what makes the destination fully determined by `(from_activity, exit)`), 19 (entering a fan retires its source once), 20 (at most one fan is open), 21 (a branch cannot take a second activity), 31 to 34, and 35 (the fan rules have exactly one home; the registry stays at **36** entries).


### staged plan

Seven stages, each an extension of the same-numbered specification stage rather than a parallel track, so the two land as one sequence and no stage of either is bypassed. §9's spanning rule extends with them: **for the duration of stages 1 to 5, `validateExitBindings` rejects any list *or object* destination outright with a message naming the stage that lands the runner** — one line, deleted by stage 6, which makes every intermediate stage's zero-corpus-movement criterion provable because the corpus cannot carry a fan at all.

### Stage 1 — the schema and the load rules (extends §9 stage 1)

`src/schema/workflow.schema.ts`: `InstanceFanSchema`, the three-member union with both messages and the error map, the widened graph description, and `destinationTargets` / `isFan` / `instanceFan` / `branchKey`. `src/loaders/workflow-loader.ts`: `fanGroups` and `fanMemberIndex` widened to carry the instance form (still reading the graph object and nothing else), the widened `ExitBinding.to`, the flattening reachable-activities helper, the widened destination-existence loop, L1 and L3–L10 over `destinationTargets`, L2 re-aimed, L5 and L9 re-worded, and L11–L15. `src/config.ts`: `DEFAULT_FAN_MAX_INSTANCES = 16`, env-overridable with an in-code fallback, in the same shape and the same home as `DEFAULT_BATCH_MAX_ACTIVITIES` (`:164-165`) whose comment already names `docs/dispatch-model.md` as the home for the measurements behind it. `npm run build:schemas` and `npm run build:site`, both committed. `tests/workflow-loader.test.ts`: one case per rule, plus a well-formed instance fan accepted, plus the binding record carrying an object and the reachable-activities helper returning the branch head.

*Acceptance.* `npm run check:all` green with **zero corpus movement** — 17 workflows, 109 activities bound, 207 edges, 0 list-valued and 0 object-valued, so a union accepts every existing string and every fan rule is vacuous. The regenerated JSON carries the three-member `anyOf` with `minItems: 2` on the array member and `additionalProperties: false` plus `required` on the object member; `tests/generated-schemas.test.ts:44-49` stays green (the object member carries no `items` key). Each of L1–L15 fails the load with its stated message against a fixture. **The ceiling number is stated as policy, with its derivation:** the widest fan-out any corpus site authors is ten (`substrate-node-security-audit/activities/03-primary-audit.yaml:69`, and the ten expected output files at `:66-69`); the challenge sites author three and two. Sixteen clears every authored site with headroom, and it is one config edit rather than a corpus sweep when a measured run says otherwise. This is where §10's objection to a width cap is answered: the **configuration home** half is fully answered (`src/config.ts` already holds two numbers of exactly this kind), and the **derivation** half changes character, because a list fan's width is countable in the file at authoring time while an instance fan's is a runtime collection length, so nothing bounds it unless something is authored.

*Guard obligations.* `workflow-yaml` first; `refs`, `audience`, `artifact-guides`, `stealth-isolation`, `session-contract` and `activity-variables` all load workflows and inherit the result.

### Stage 2 — every graph reader made instance-aware (extends §9 stage 2)

`src/utils/activity-variables.ts`: `activityGraph`'s flatten written as `[...new Set(Object.values(...).flatMap(destinationTargets))]` — deduping **after** flattening, which is the trap-free placement. `scripts/check-review-mode-gating.ts`: the destination type imported and every destination form flattened. `tests/e2e/walker.ts` and `scripts/smoke/smoke-orchestrator.ts`: the type imported, an instance-fan-bound exit yielding N branch visits from a seeded collection, the walk entering each instance and then the join once. `src/utils/validation.ts`: `validateReportedExit` satisfied when the requested activity is among `destinationTargets(binding.to)` and compared set-wise on a fan enter; `validateActivityTransition` flattened; **`validateActivityManifest` left alone** — it tests activity ids and an instance never appears in a manifest as anything but its activity. `src/tools/workflow-tools.ts`: the `exit_destinations` header and metadata map projecting a fanning exit as a **list** (its members for a list fan, the one fanned activity for an instance fan), the checkpoint consequence, the exit payload, and the immediate-exit message template, none of which the compiler catches because an array stringifies happily. `evaluate-transition.md` and `finalize-activity.md`: the destinations field, per the envelope decision below.

*Acceptance.* No corpus movement; `check:all` green. A fixture instance fan walks end to end in the walker. No rendered message anywhere interpolates a destination directly.

**The envelope decision, stated here because it is stage 2's contract.** The instance fan adds **no new envelope field and no new drive-loop gate.** `exit_destinations` renders a **string** for a plain exit and a **list** for any fanning exit — the members for a list fan, the single fanned activity for an instance fan. So list-ness *is* the fan signal, and the width is never the worker's business. §5.7's `next_activity_ids` is therefore unchanged in shape and gains one clause on its description: *for an instance fan this holds the one activity the fan runs, so the field's presence is the fan signal and the width stays the server's to expand from the collection.* §5.2's `activity_id` union and §5.6's `advance-to-fan` gate and `current_branches` control name are **untouched**. `dispatch-fan`'s step 2 gains one sentence: it calls `next_activity` with `activity_id` set to the destination as the graph names it — the sole member where the destination is one activity, the whole list otherwise — so `.min(2)` on `activity_id` never sees a one-element list.

**The wart, named.** §4.1 forbids a one-element list *in the graph* ("a one-element list is a plain destination spelled a second way, which One Authoritative Home forbids"), and the header now renders one. The two surfaces differ for a stateable reason: the graph's spelling must be unique because an author writes it, while the header's list-ness is a derived signal carrying no width. The tool description says the block is derived. I considered §H's alternative — replace `next_activity_ids` with a boolean `next_activity_fans` — and **declined** it: for a list fan the destination genuinely names several activities that the worker's header renders and the orchestrator relays, so a boolean would force the server to expand a *list* destination too, which means `activity_id` becomes optional on a fan enter and a transition acquires two spellings. That is a separate change with its own cost, and the instance fan does not need it.

### Stage 3 — the analysis meet (folds into §9 stage 3)

No new code beyond §9 stage 3's. What this extension adds is **fixtures**: an instance fan is one graph node with one arrival, so its meet is indistinguishable from a plain edge and the fixture proves that rather than assuming it; plus a fixture proving the arrival split removes *all* duplicate predecessor entries; plus a fixture that a fan whose collection is written on only one path reaching it produces an `unreachable-read`.

*Acceptance.* Corpus guard output byte-identical. On fixtures: an instance fan's join reading the container produces no finding; the fixed point terminates; a fan entered before its collection is written **is** reported.

### Stage 4 — the indexed container, statically (extends §9 stage 4)

`src/utils/activity-variables.ts`: the container declaration contributed as `type: 'array'` with no `defaultValue`; the single-grammar read function with `pathReads`; the branch-key re-keying of productions and of the landing site; the synthetic `bagName(over)` read attributed to the branch. `scripts/check-activity-variables.ts`: the index-free declared-write re-keying, the member-grain read test stripping a leading all-digits segment and the literal `result`, the three families under existing names with the self-consumed exemption, `fan-artifact-collision`'s instance arm, and `fan-parameter-read-outside-its-branch`. `workflows/meta/techniques/variable-binding.md`: the branch-scoped indexed landing, the derivation rule, and the per-instance projection's place in the input precedence. `workflows/meta/techniques/scatter-gather.md`: the graph-fan application of `isolation-then-combine`, the third scatter mode over one combine contract, and `a-join-gathers-the-container-not-an-index`.

*Acceptance.* Corpus guard output byte-identical. On fixtures: one correct instance fan with a `gather-results` join produces **zero** findings; a gather naming a member no branch produces is reported once; an ungathered member once; a bare read of a fanned output once; a read omitting the index once; a fanned activity writing a literal artifact name once; a fanned activity whose artifact template carries the parameter **not** reported; the parameter read by a non-branch activity reported once; a branch that writes a working value and reads it back within its own steps **not** reported. `binding-fidelity`, `variable-model` and `anchors` join the acceptance set, per §9 stage 4 and Judge 1's grafted item (c).

### Stage 5 — the frontier, the projection and the runner. **Gated on #655 before it is enabled on a real run.**

`src/schema/session.schema.ts`: `FrontierEntrySchema` and `frontier` replacing the single current activity. `src/utils/session/resolver.ts`: `heldBranch`, and the session view taking the named pair. `src/utils/session/store.ts`: the canonical key ordering. `src/utils/session/migration.ts`: a recorded single activity converts to a one-entry frontier with no instance. `src/tools/workflow-tools.ts`: `from_instance` beside `from_activity`; `instance_index` beside `activity_id` on `get_activity`; the one resolution rule; the fan-enter's collection read, four refusals, id derivation, dense pre-fill through `applyVariableWrites` with `source: 'fan_enter'`, and `_meta.fan`; the per-instance barrier reading; the projection block in the `get_activity` header, in `_meta.fan_instance`, and overlaid onto `bagAtOpen` at `:1205`; the indexed wrap in the mutator; `data.instance` on the exit, entry, step-completed and variable-set events; `instance` on `record_usage`; `activities_without_usage` repointed to diff `(activity, instance)` pairs against the `activity_exited` events; the frontier rendering on status, identity projection, activity projection and session inspection. `src/utils/variable-seed.ts`: `under?: { key: string; index: number }`, the `result` commit, the event name, the fourth `VariableWriteSource`. `src/tools/resource-tools.ts` and `src/logging.ts`: every other reader of the removed field.

*Acceptance.* The whole existing unit and end-to-end suite green with a one-entry frontier carrying no instance — every ordinary session takes the identical path and no test is rewritten for behaviour, only for the field shape. A session recorded before this stage migrates and resumes. One test per row I20 to I28: each of the four fan-enter refusals; both branch-return refusals; all three `get_activity` refusals; a three-instance fan executing end to end against real sessions with three distinct identities; the container landing dense and in collection order with a dotted indexed read resolving through it; an instance that never returns leaving `result: null` that both evaluators read as absent; a second entry of the same fan **resetting** the container; a member whose value disagrees with its declaration warning with today's wording; three usage rows for a three-instance fan, and one missing row reported.

**#655, placed and sharpened.** §8's requirement stands unchanged in form — a compare-and-swap on the record's sequence number with retry, not a per-session write lock — and instances make **both** of its load-bearing clauses stronger. *All the appends must survive*: N instances of one activity append history events whose `activity` field is identical, so a last-writer-wins loss is indistinguishable from a correct single-instance run, where a distinct fan's loss at least leaves a gap under a nameable activity. *Compare-and-swap rather than a lock*: an instance fan's per-branch payload is the **same** activity's payload N times, so a lock serialises N compositions of one hundred thousand characters apiece behind one another, and wall clock is the only thing a fan buys.

### Stage 6 — the definitions that make an instance fan execute (extends §9 stage 6)

`dispatch-fan.md`: `branch_activities` renamed `fan_destination` — "The destination the exit taken fans to, as the graph names it: the activities of a list fan, or the one activity of an instance fan" — with steps 3 to 6 iterating `_meta.fan.branches` from the enter response rather than the input, so **the orchestrator never computes N from a collection it would otherwise have to read for that purpose alone.** `a-branch-takes-one-activity` becomes "A branch carries exactly one activity, and where the graph fans that activity over a collection, exactly one instance of it." `replace-one-branch`, `one-identity-per-branch`, `liveness-is-tested-per-branch`, `no-gate-in-a-branch`, `persist-the-fan-before-any-branch-returns` and `say-what-a-fan-is-doing` are **unchanged in wording**; `context-travels-as-state` joins the Cites list. `compose-prompt.md:16-18`: substitutions gain `instance_index` where the graph fans that activity — a **designator**, per Distinguish Designators from Parameters, with the element's value staying out of the prompt. `03-dispatch-client-workflow.yaml`: **unchanged from §5.6**, because the header's list-ness is the fan signal for both forms. `account-every-activity`: one clause naming an instance. `planning-readme`: the fanned activity keeps its single row, instance artifacts get none, the join's artifact is what the row links. `write-artifact.md:50`: the series carve-out stated as the invariant that makes a per-instance template safe. `schema-construct-inventory.md`: the Graph row, and one new row.

The inventory row, written out and voiced so it cannot be confused with the within-activity fan-out row at `:38` or the list-fan row §9 stage 6 adds:

```
| "Run this one activity once per work unit — one worker each" | **Graph instance fan** | `graph.<activity>.<exit>` set to `{ activity, over, variable, maxInstances }`: the activity runs once per element of the `over` collection, one worker to each, each handed its own element at `variable`. The graph names the collection, not its members, so the width is that collection's length when the fan is entered, bounded by `maxInstances` and by the server's own ceiling. Each instance lands its outputs at its own index under the activity's branch key (its id in snake case with `_outputs`), and the run enters the single destination all of that activity's exits name, once, after the last instance returns. A join reads the container whole and binds `orchestration-patterns::gather-results` with the same collection as `expected_ids`. A fan over a collection this workflow declares nowhere, a parameter the fanned activity does not read or the workflow file does not own, a parameter carrying a starting value, a width above the server ceiling, and a fanned activity declaring a checkpoint each fail the load. |
```

*Acceptance.* `check:all` green including `refs` resolving every new anchor, `audience` placing every new rule, `fragments`, and the workflow-YAML validator loading the amended meta workflow. Version bumps on every edited definition. A smoke run drives a three-instance fixture fan: three workers spawn in one turn, each is served its own element, three slots land in collection order, the join's gather reports `complete`, the marks publish in one commit before the spawn and resolve in one persist at convergence, and no barrier refusal appears in any log. **§9 stage 6's stale-restatement sweep runs unchanged**, by grep key against the tree rather than against this change's file list, with the occurrence count recorded in the manifest — its 31 sites across 18 files all describe a destination as one activity per exit and are equally stale under either fan form.

### Stage 7 — first adoption, its own commit in the workflows submodule, and it does not gate the merge

**And §1's "What ships dormant" is amended here, because it is false of the instance fan.** §1 says "No workflow in the pinned corpus is fan-ready today, and the obvious candidate is not adoptable as it stands." That is true of the distinct-activity fan. The instance fan has a day-one caller whose artifact naming, gather bind and gate-freedom are already in place — see the adoption verdict in `serves_657`. Stage 7 adopts **one** site, with the coverage baseline re-recorded and the dry-walk budget re-measured from its current value of 50 in the same commit, and one live run.

### Relation to the distinct-activity fan's stages

Stages 1, 2, 4 and 5 each **extend** their §9 counterpart and must land in the same commit as it, because each touches the same declaration, the same projection or the same handler branch and a half-landed union is a parse error waiting for an author. Stage 3 folds in as fixtures only. Stage 6 extends §9 stage 6 with two edits (`fan_destination`, `instance_index`) and one new inventory row. Stage 7 is independent of §9 stage 7 and **cheaper**, and should precede it: §9 stage 7 must remove seven gates with a decision-inventory diff, while an instance fan's first adopter is gate-free by construction.

The one ordering that is not negotiable: **the walker (stage 2) precedes any corpus fan**, for §9 stage 2's own reason — unflattened, the walk sends an object where a string is required, the tool's type rejects it, the walk throws, and the coverage job's no-walk-errored assertion fails.


### not adding

Each with what would trigger it.

**No instance named in the graph.** The graph carries a reference to a collection and a ceiling; it never names an individual instance. A fan of instance *keys* in the destination list (`[challenge#stakeholder_gap, challenge#rejected_paths]`) was designed and rejected: it makes the width authored, so it cannot serve `decompose-work-units` → `dispatch-workers` at all, whose unit list is derived during the run and which is half of the demand #657 names. *Trigger:* none foreseen; the object form strictly contains the static case.

**No ordinal in the read path, and no way for an instance to project its own element.** An instance receives its element; it never receives the collection and an index. This is not a preference — it is proven: there is no indirection operator in the `{token}` grammar (`src/utils/activity-variables.ts:213`), the bag-name grammar (`variable-binding.md:18`), the structured condition (`src/schema/condition.schema.ts:15-21`) or the `when` dialect (`src/schema/when-expression.ts:23-29`), so a design in which the instance spells its own read does not run. *Trigger:* an indirection operator, which is its own change with its own blast radius across four evaluators.

**No composite frontier string.** The entry is an object. A `challenge-pass#0` string is cheaper on the schema and buys six projections for free, and it converts a build failure into six silent ones (`getActivity`, `readActivityRaw` and `getExitBindings` compare exactly; `validateReportedExit` and `validateActivityTransition` silently disable; `validateActivityManifest` warns on every instance return). *Trigger:* none; the object entry's cost is one repointed projection, already in stage 5.

**No per-entry worker identity, and no dispatch-identity parameter on the transition tool.** Both are refused for §5.1's stated reason, and the exposure they would close is carried at full strength as a residual instead of argued away. The cheap half is already taken: `one-identity-per-branch` makes the delivery scopes distinct, so `activity_redelivered` fires exactly when two contexts claim one slot. *Trigger:* an observed duplicate claim, or a wrong index producing duplicated work in a real run. The upgrade shape, if wanted, is a slot **claimed on first `get_activity`** rather than bound in advance — which is what keeps free replacement, because the objection §5.1 and Judge 2 both raise is to an identity arriving *in advance* on the enter call.

**No runtime-derived width beyond the collection's length, and no successive waves.** The width is the collection's length at the enter, refused above `maxInstances`. Truncating to the cap silently drops declared work and would let the join's gather report `complete` over a set that was never the collection — the exact false completeness `isolation-then-combine` exists to prevent. Waves need a scheduler and new state, and they destroy the one property §5.2 buys, because a wave boundary empties the frontier mid-fan. *Trigger:* a measured run where a legitimate collection exceeds every reasonable ceiling.

**No mixed fan — a list destination whose members may themselves be instance fans.** One exit, one destination, and a destination is one of the three forms. The demand is one site: the substrate primary audit's roster is seven instances of `sub-crate-review`, one `sub-static-analysis` and two `sub-toolkit-review`, dispatched as one batch by that workflow's own rule (`substrate-node-security-audit/workflow.yaml:19`). Refusing it costs that site the single-batch property — it migrates as a fan of seven, an edge, and a fan of two, three turns rather than one. Adding it costs a heterogeneous barrier, per-member parameters, per-member widths, and a `fanGroups` that returns a mixture. *Trigger:* a second site wanting one turn for members of different activities, which would make the single-batch rule general rather than one workflow's.

**No per-instance context beyond one value.** The element is the parameter, whole. A structured element is fine and needs nothing — the body projects fields by ordinary dotted read, as `{current_unit.target}` already does (`prism/activities/02-adversarial-pass.yaml:32`) — so "exactly one value" is honoured without forbidding structure. *Trigger:* a fanned activity that provably needs two independent per-instance values, which would need a second projected name and a second declaration.

**No merge policy, no conflict guard, no partial combine, no degraded convergence.** Two instances cannot collide, so there is nothing to arbitrate. §10's refusal stands verbatim, and instances **strengthen** it: proceeding on two slots of three would hand the gather a value no instance produced, and `completeness` is structurally constant at the join precisely because the barrier only releases when every slot is retired. Describing what a missing instance means *is* a merge policy.

**No gate in a fanned activity, and no per-instance outstanding-decision slot.** L9 is unchanged as a rule, because none of its three grounds mentions branch distinctness. Instances make it *more* binding, not less: every instance of one activity reaches the same checkpoint step, so a gate inside a fanned activity deadlocks with **certainty** rather than by luck of routing, and `assertNoActiveCheckpoint` gates `get_activity`, `get_technique`, `get_resource`, `get_workflow` and `get_trace` (`src/utils/session/params.ts:56-76`). Only L9's message changes, losing one of its three remedies.

**No nested fan, no self-looping branch, no child session per instance, no fan mode on `dispatch-activity`, no `branch_results` output, no new tool, no new source module, no member field on the variable definition schema, no change to the provenance token grammar.** Every one stays refused for the reason §10 gives, and instances strengthen four of them.

**No new envelope field, no new drive-loop gate, no change to §5.2's parameters and no change to §5.6's bind site.** The header's list-ness is the fan signal for both forms, so an instance fan is invisible to the worker's envelope. This is the one place the extension makes the specification's surface *smaller* than a naive reading would.

**No 37th guard registry entry.** One new family name (`fan-parameter-read-outside-its-branch`) and one new arm on an existing family (`fan-artifact-collision`), both inside the existing `activity-variables` entry — the registry stays at 36.

**No check on the three serialising side effects, and no rule policing them.** An activity that mutates the checkout, writes a shared unprefixed register or appends to the provenance log is not fannable, and that is a criterion applied once at design time, not a prohibition to mechanise. Prose warning "do not also bind X" is what Prefer Removing the Thing That Needs a Prohibition tells you to design out, and the removal here is upstream. *Trigger:* an observed fan that landed one of the three, which would make the criterion a load rule over `flattenActivitySteps` plus `techniqueName` — decidable without composing signatures, so cheap when justified.

**No index-range check on a join's reads.** Impossible: `maxInstances` is a ceiling and the width is a runtime length. Answered by the rule that a join gathers the container rather than naming a slot, not by a check.

**No repair of `orchestration-patterns::dispatch-workers`.** Its concurrency selection stays unexecutable at every one of its fifteen binding sites, for `depth-1-only`'s reason (`spawn-agent.md:44-46`). This design serves the demand those files were written for at the layer where the primitive exists; it does not move the primitive.

**No `worktree` isolation for a fanned activity.** A fan's branches share one working tree; §11 already records that nothing enforces read-only, and `isolation-mode-write-boundary` ("Under `worktree` isolation, workers must create/use their worktree before mutating files", `orchestration-patterns/TECHNIQUE.md:56-58`) is precisely the rule a graph fan cannot honour. `context` isolation is served natively; `worktree` is not. *Trigger:* a per-instance worktree, which is a change to `create-worktree`'s one-tree-per-session model and not to the fan.

**No resolution of the loop-item declaration contradiction** between `src/schema/variable.schema.ts:64` ("a loop variable is iteration state and is not declared here") and `schema-construct-inventory.md:56` (loop items among `variables.writes[]`). Pre-existing, and it does not reach the fan's parameter, which is not iteration state because it crosses an activity boundary. Named so the fan's choice of home does not read as arbitrary. *Trigger:* its own commit, with a corpus sweep over the fourteen `forEach` sites.


### serves 657

Fifteen binds across seven definition files. Every one is an activity executed by a dispatched worker, so **both** of `dispatch-workers`' concurrency branches are unreachable at every one of them today, and this design does not move the primitive — it serves the shape at the layer where the primitive is. Verdicts per bind.

**1. `meta/activities/patterns/01-orchestrator-workers.yaml:43`** — the whole pipeline `decompose-work-units` → `compose-worker-briefs` → `dispatch-workers` → `gather-results` (`expected_ids: work_units`, `:49`) → `synthesise-results`, over a **runtime-decomposed** `work_units` (`:16-18`). **SERVED FULLY**, and it is the site this design is shaped for: `over: work_units`, `variable: current_work_unit`, and the width is the collection's length rather than anything authored. It becomes three graph nodes — source (decompose), fan, join (gather + synthesise) — and `gather-results`' bind carries across **unedited**, because `work_units` entries are `{ id, brief, tools_hint? }` with "`id` is a stable slug" (`decompose-work-units.md:68`), which is exactly what `expected_ids` normalises and what the container's slot id derives from. Named changes: the activity declares **no `exits:`** and appears in no graph edge, so a fannable per-unit activity must declare one (L4); `compose-worker-briefs` (`:40`) is displaced, because the brief travels as the projection and putting it in the prompt is what `context-travels-as-state` forbids. What is lost: its identity as a **borrowable activity** — a graph shape cannot be borrowed, so a consumer authors three graph entries instead of one `activities:` line, and the pattern's home moves from the file to the inventory row. `patterns/README.md`'s "These activities cover in-activity fan-out / consolidate only" becomes the accurate description of what stays behind.

**2. `patterns/02-supervisor.yaml:48`, with `dispatch_concurrency: 1` (`:50`)** — one classified lane, `work_units` declared as "The selected lane as a one-element ordered array" (`:20-22`). **SERVED BUT POINTLESS.** A fan of width 1 over a one-element collection; `maxInstances: 2` would be a lie about the intent. The construct that actually serves this site is a plain graph edge to the lane activity, which `dispatch-activity` already executes. **Verdict: its dispatch step is unexecutable today and the fix is an ordinary destination, not a fan.** This bind is not demand for this capability and the specification should not count it as such.

**3. `patterns/04-isolated-fan-out.yaml:47`**, with `isolation_mode` (`:44`) and the `require-complete` validate (`:54-59`). **PARTLY SERVED.** `context` isolation is exactly what a fan gives — each instance is a fresh worker context under its own identity. **`worktree` isolation is not served**: the branches share one working tree, and `isolation-mode-write-boundary` is the rule a graph fan cannot honour. Gate-free (0 checkpoints, measured) and `required: false`. Same L4 gap: no `exits:`. And the `require-complete` validate becomes **structurally satisfied** — the barrier only releases when every slot is retired, so `gathered_results.completeness` is constant at the join. That is worth stating rather than advertising as a detection the fan makes.

**4. `patterns/05-lead-researcher.yaml:47`** — the first fan, over `work_units` from `plan-research-questions`. **SERVED.** **`patterns/05-lead-researcher.yaml:76`** — the follow-up fan inside `while has_research_gaps, maxIterations: 3` (`:59-88`). **SERVED AT A STATED COST.** The in-activity `while` must become a **graph cycle**: the join assesses gaps and its exit routes back to the fan's source. That is legal — L6 forbids a *branch* routing onto itself, not a join routing back to a source, and the corpus already carries such cycles (`work-package/workflow.yaml:189-191`) — and the container's **reset** pre-fill puts round 2's outputs in fresh slots rather than appending into round 1's, which is the case the index would otherwise make worse. What is lost is `maxIterations: 3` (`:64`): a graph cycle has no declared ceiling. The replacement is ordinary state — a round counter the join writes and an exit predicate (`research_round < 3 && has_research_gaps`) — which the `when` dialect already expresses (`src/schema/activity.schema.ts:75`).

**5. `substrate-node-security-audit/activities/02-reconnaissance.yaml:37` and `:49`** — two sequential single-agent dispatches with a file-verification step between them (`:38-43`, `:50-55`), the second's briefs composed only after the first's files land (`:44-46`). **NOT SERVED, AND DOES NOT WANT TO BE.** That is a chain of two activities, not a fan. The fix is two graph edges.

**6. `substrate-node-security-audit/activities/03-primary-audit.yaml:48`** — `dispatch-all-agents` over the whole `agent_roster`; ten expected output files named at `:66-69`; the roster materialised at run time by `assign-roster` and stated as a workflow rule at `workflow.yaml:19` ("Every assigned primary agent (A1-A7, B, D1, D2) is dispatched in a single simultaneous batch"). **PARTLY SERVED, and this is the widest real fan in the corpus.** Three named blockers, all real:
- The roster is **mixed** — seven `sub-crate-review`, one `sub-static-analysis`, two `sub-toolkit-review` — and one instance fan runs one activity. The site migrates as a fan of seven, an ordinary edge, and a fan of two: **three turns rather than one**, which is the single-simultaneous-batch rule this design cannot honour. That is the cost of refusing a mixed fan, and it is stated rather than hidden.
- Roster entries key on **`agent_id`, not `id`** ("each carrying its `agent_id`, its assigned `activity_id`, context variables…", `dispatch-sub-agents/TECHNIQUE.md:12-14`), so the fan enter's id derivation refuses them (I20) and `gather-results`' own normalisation would return undefined. Named change: `assign-roster` emits `id` beside `agent_id`.
- The six sub-activities (`10-sub-crate-review` through `15-sub-structured-merge`, plus `16-sub-reconnaissance`) are gate-free (0 checkpoints, measured) and `required: false`, but declare **no `exits:`** and sit in no graph edge (`substrate-node-security-audit/workflow.yaml`). Each needs one exit bound to the join, which newly subjects their reads to `unreachable-read` and `review-mode-gating` — a real acceptance consequence, not a blocker.

Everything else is already right, and it is worth recording: the per-instance parameter is one value (`agent_id`, whose input description already says it "also names the persisted output file", `execute-sub-agent.md:12-14`); the per-instance artifact is `{agent_id}.json` / `audience: agent` (`:26-32`) — **the sanctioned deviation of the artifact decision, already authored, already guide-mapped at `resources/README.md:35`, already green under `check-audience` and `check-artifact-guides`**; no sub-activity binds a git or register operation; and `gather-results` is **already bound** with `expected_ids: worker_briefs` (`:52-54`). The three tail single-agent dispatches (`:75` verification, `:81` gap re-dispatch, `:87` merge) are sequential workers and become ordinary activities.

**7. `cicd-pipeline-security-audit/activities/03-primary-scan.yaml:27`, with `dispatch_concurrency: scanners_assigned` (`:29`)** — the count declared `type: number, defaultValue: 0`, "Count of per-submodule scanner agents assigned during reconnaissance" (`02-reconnaissance.yaml:10-13`). **SERVED, AND THIS SITE CORROBORATES THE DESIGN DIRECTLY**: it already parameterises the fan's width at run time from a variable, which is what an instance fan's width is. The migration **removes** a variable rather than adding one — the width becomes the collection's length, so `scanners_assigned` stops being a second home for it (`no-derived-state-shadow`). Gate-free (0 checkpoints, measured). `gather-results` already bound with `expected_ids: worker_briefs` (`:33-35`). Per-instance artifact `{scanner_id}.json` / `audience: agent`, guide-mapped at `resources/README.md:34`, green today. Named changes: the fan's `over` names the **work-unit** collection rather than `worker_briefs`, because a brief carries a `prompt` and the prompt is `compose-prompt`'s; the per-submodule scan needs an activity of its own, carved from `execute-cicd-audit` (this workflow, unlike the substrate one, has no sub-activities); and the exit `scan-verified` gates on `verification_complete == true && merge_complete == true` (`:72-74`), both written by *dispatched* workers, so those writes move to the join. The three tail dispatches (`:50`, `:56`, `:62`) are single sequential workers.

### Aggregate verdict

**The capability serves what those files were written to express wherever the shape is genuinely "N units, one operation": sites 1, 3 (context isolation), 4, 6 (in three chained pieces) and 7.** It does not serve sites 2 and 5, which want ordinary graph edges and never wanted a fan — and saying so matters, because counting them as demand overstates the case by two of seven files. It does not repair `dispatch-workers` and it does not serve `worktree` isolation. Its single hard limitation against the demand is the **mixed** roster at site 6.

### Adoption, and why the capability does not ship dormant

**Day-one caller: `cicd-pipeline-security-audit`'s primary scan, with `substrate-node-security-audit`'s crate-review group second.** Both are gate-free, both bind `gather-results` already, both already declare a per-instance token-templated artifact that is already guide-mapped and already green, neither touches a checkout or a shared register, and both have per-unit work long enough — a whole submodule or crate scan — that (N−1) payloads buy real wall clock and real context isolation. The cicd site is first because its width is genuinely runtime and its fan is the only dispatch in the activity that fans at all.

**The corpus's one authored fan-out, weighed properly.** `analyse-challenge::challenge` is an instance fan authored as a technique: "Build one work unit per entry in `{challenge_perspectives}`" (`challenge.md:44`), dispatched via scatter-gather "the mode available to this context follows `depth-1-only`" (`:45`) — the sentence that says why only the sequential mode runs — and "Each unit receives only the concern set (or a read-only summary) plus its perspective name — not other units' findings" (`:46`). One value differing per instance, all else equal: owner input 1, authored, today. Its output is already "Ordered collection of per-perspective findings (keyed by perspective name)… Isolated until combine" (`:36-38`), which is the container this design lands, and `isolation-then-combine` (`:60-62`) is the corpus rule the branch key raises to graph grain. It is bound at **seven** activities: `02-design-philosophy.yaml:194`, `04-research.yaml:154`, `05-implementation-analysis.yaml:100`, `06-plan-prepare.yaml:132`, `07-assumptions-review.yaml:91`, `08-implement.yaml:176`, `15-codebase-comprehension.yaml:98` — six binding `'["stakeholder-gap", "rejected-paths", "evidence-strength"]'` and site 15 binding `'["pedagogy", "rejected-paths"]'`.

**Two checked facts make it the strongest *shape* match.** Neither `challenge.md` nor `combine.md` declares a `#### artifact` — both declare values, and the file write is a separate step (`review-assumptions::record` → `assumptions-log.md`) that stays in the source or the join — so **the amendment's blocking artifact-naming decision does not block this site at all; it is the artifact decision's default arm natively.** And the challenge/combine pair sits in a loop body that contains **no checkpoint** at every one of the seven sites (verified: `04-research.yaml:147-168`, and the same triple at `02:191-207`, `05:97-113`, `06:128-145`, `07:88-105`, `08:173-189`, `15:95-111`; `15`'s deep-dive gate at `:127-157` sits *after* the challenge steps), so a carved `challenge-pass` activity satisfies L9 by construction. **No gate removal, and therefore none of the Non-Destructive Updates burden §9 stage 7 carries for its own example fan** — a materially cheaper adoption than the one the specification prices.

**And it is the weakest *cost* match, which is why it is not first.** Three named changes, all real. `analyse-challenge::challenge` splits its scatter out — `### 1. Scatter` and `### 3. Gather` are deleted, its input becomes the singular perspective, its output one perspective's findings, and the plural `challenge_perspectives` moves to the join as the gather's expectation list. The step-level `doWhile has_resolvable_assumptions, maxIterations: 10` becomes a **graph cycle** at each adopting site, losing that ceiling to an authored round counter. And because a graph keys exit bindings by activity id, **one shared `challenge-pass` activity cannot converge on seven different combine activities**, so seven sites means seven near-identical activity triples, seven graph cycles and seven sets of Progress rows — to replace seven three-line loop bodies that **run today** because sequential scatter-gather is an in-context loop needing no dispatch primitive (`scatter-gather.md:87`, and `parallelism-is-optimisation` at `:112-114`: "Where genuine parallel fan-out is not needed, sequential mode … is the correct default"). Against the arithmetic — (N−1) whole payloads per pass, up to ten passes, for a 2-to-3-wide fan whose per-instance work is one reasoning pass over a log — **that migration is a cost regression at every one of the seven sites unless the per-perspective pass grows.** One thing it does buy in its own right: the perspectives list is promoted from six identical bind-site literals to one declared collection.

### The migration surface, named as owner input 2 requires

Out of scope for the staged plan; named because it decides whether this capability has a day-one caller, and it does. Three tiers. **The fifteen `dispatch-workers` binds** across seven files, verdicts above. **The corpus's one authored fan-out** — `analyse-challenge::challenge` at seven activities, the strongest shape match and the weakest cost match. **And the fan-outs written out by hand**, of which `prism`'s `dispute-analysis` is the clearest: it declares `dispute-lens-a.md` and `dispute-lens-b.md` as two outputs of one operation, which is an instance fan of two enumerated by hand, with the per-instance artifact naming already solved by literal duplication. Establishing that third tier is one survey, and it should precede any wider adoption rather than be assumed.


### residual risks

- **An instance fan trusts the orchestrator's index arithmetic, and a wrong index is not refused.** `verify-dispatched-activity` compares activity ids (`activity-worker.md:82-84`), and two instances share one — so for an instance fan that worker-side check **cannot fire at all**. The `get_activity` instance refusal admits any index the frontier holds, so a worker composed for instance 0 that asks for instance 2 is served instance 2's element, lands its outputs in instance 2's slot, and the gather aligns them to collection order: **duplicated work, one silently uncovered unit, and a manifest reporting neither.** That is a wrong answer with a complete-looking audit trail, a different class of failure from §11's original. What stands against it: `one-identity-per-branch` makes the delivery scopes distinct, so `priorDeliveryScope` fires `activity_redelivered` (`src/utils/dispatch.ts:62-77`, recorded at `src/tools/workflow-tools.ts:1526-1534`) exactly when two contexts claim one slot — visible after the fact, not refused. *Trigger:* one observed wrong index, or one observed duplicate claim. The upgrade is a slot **claimed on first `get_activity` under a fresh `agent_id`** and released when its claimant returns a non-envelope — which is not the per-entry identity §5.1 refuses, because nothing arrives in advance and free replacement survives.
- **A join that names a slot by index is unrangeable and undetected.** `maxInstances` is a ceiling; the width is a runtime collection length. So `{challenge_pass_outputs.2.result.member}` against a two-element collection reads `undefined`, the load cannot see it (no width to compare against), and the guard cannot (its lattice is a name set carrying no length). Answered by a rule — `a-join-gathers-the-container-not-an-index` — which is a contract an author honours, not enforcement. The rule's own remedy is real (`gather-results` walks the container and `expected_ids` is the same collection), which is why this is a residual rather than a defect, but it is the sharpest unenforced thing in the design.
- **The mixed roster is the one demand shape refused outright.** Site 6 dispatches ten agents across three activities as one batch, stated as that workflow's own rule (`substrate-node-security-audit/workflow.yaml:19`). It migrates as three chained graph nodes: three turns rather than one, so the wall-clock purchase the fan exists to make is a third of what that site currently intends. Refusing mixed fans is the right call at one site of demand; a second such site makes it the wrong call.
- **Three concurrent instance contexts share one working tree, and the specification's fallback attribution is unavailable.** §11 already records that `commit-and-persist` derives its paths from the working tree, which cannot attribute a change to a branch, and answers it with one commit naming every branch. For instances the residual is **worse**, because the fallback of attributing by activity id fails: N instances share one id. And a concurrent `git add` fails hard rather than silently — git's own `.git/index.lock`, with nothing retrying it (`commit-and-persist.md:31` retries a failed *push*). The answer is a criterion (a fanned activity touches no checkout) with no check behind it, and nothing enforces that the fan's branches are read-only on the source tree.
- **Two shared writers lose data with no trace and no check.** `manage-registers::append-deferred-item` and `append-follow-up` write literal unprefixed filenames by rule (`created-lazily-and-unprefixed`), as whole-file read-modify-writes, so two instances write one path and one instance's rows vanish. `dco-provenance::append-task-row` loses rows the same way, and even serialised its row order becomes the nondeterministic order N instances finished in, which its own guide states as a property a reader compares rows against. `07-assumptions-review.yaml:142-144` binds `append-deferred-item` today, so this is not hypothetical for the assumptions area. Stated as a fannability criterion; not mechanised.
- **The artifact check is literal-template-only, in two directions.** It sees a technique that declares an `#### artifact`; a technique that writes a file without declaring one is invisible to it, exactly as §11 already records. And it cannot see two *elements* of one collection interpolating to the same value — a duplicated roster entry gives two instances one filename, and `write-artifact`'s series carve-out means both create rather than update, so the second silently overwrites the first.
- **A templated instance artifact is never updated in place.** `write-artifact.md:50` makes each interpolated name its own logical artifact, created and not matched against siblings. The index makes re-entry representable, so a second visit to the same fan re-resolves the same template and **creates** rather than updates. Where that is wrong the branch should declare no artifact and let the join write.
- **The join re-pays full delivery, and a wide document-shaped fan makes it the bottleneck.** Every instance is a fresh delivery scope, so nothing collapses to a reference marker, and the join takes a fresh context that re-pays whatever the instances collectively held. Nothing refuses it: the batch bound exempts a scope with no activity yet (`src/utils/batch.ts:154`) and the artifact writer validates nothing about completeness, so the failure mode is a silently truncated or elided document. `maxInstances` is the only thing an author has against it.
- **The delivered-token figures are a substitution, and they are a floor.** There is no measured figure in the tree for a *fanned* activity's payload, so the (N−1) × 87,324-character premium substitutes the standalone mean from `docs/dispatch-model.md:86`. Every figure counts eager payloads only and never a lazy fetch, for the reason the benchmark's own figure is a floor (`:84`). Re-derive against a fresh `npm run bench:batch` before specification prose quotes it, and expect the true premium to be higher.
- **A projection not overlaid onto the eager-bundling gate reading degrades silently.** `bagAtOpen = state.variables ?? {}` (`src/tools/workflow-tools.ts:1205`): if the per-instance projection is not overlaid there, a step gated on the fan parameter has no answer at delivery and stays lazy (`lazyUnanswered`, `:1226`). It degrades rather than breaks — the worker fetches the technique — so a missing overlay is invisible except as a slower fan.
- **The bag an instance re-reads does not hold its parameter.** `inspect_session { view: 'variables' }` serves the un-projected bag, so an instance re-reading it finds the collection, not its own element. That is the truth about where the value lives, and the projection names itself on the response it arrives with, so the asymmetry is visible rather than silent — but a worker that reasons from the bag rather than from its own header will reason about the wrong thing.
- **Trace segments are per session, not per delivery scope.** A fan of N produces 1 + N segments that partition an interleaved multi-instance event stream at arbitrary points. Stamping the retiring instance on the payload's `act` field fixes the mislabelling — and does so better than the distinct form, where nothing prevented two segments carrying one activity's id — but the interleaving is not separable from the segment boundaries.
- **An instance that cannot proceed without a decision still has no conforming way to say so.** `finalize-activity` defines two envelopes and `reject-partial-worker-result` accepts only those two, and the gate ban is what makes the gap reachable. Instances neither create nor close it. What instances add is that the best available report — a completion on a blocked or abort exit the activity declares — is **shared** by all N, since they run one definition: either every instance can report blocked or none can.
- **A guard family with no ledger to diff.** Everything in stage 3 and stage 4 lands in a hard-zero guard whose corpus output must stay byte-identical, so a bug in the arrival meet, in the index-and-`result`-stripping read test, or in the artifact family's instance arm is silent, and fixtures are the whole protection. Instances make the meet trivially correct, which shrinks the risk but does not remove it from the read test or the artifact arm.
- **The dry-walk budget may not clear after adoption, and a short streak reports as unreached options.** The coverage test's own comment says the plateau is a property of the graph and must be re-measured whenever the graph grows; an instance fan multiplies the branch orderings the enumerator produces by more than a distinct fan of the same authored width, because the width is seeded rather than counted. Re-measure from 50 in the adoption commit, or a definitions defect is reported where the cause is the budget.
- **The one-element list in the header is a form §4.1 forbids in the graph.** The two surfaces differ for a stateable reason — the graph's spelling must be unique because an author writes it; the header's list-ness is a derived signal carrying no width — and the tool description says the block is derived. A reader who knows §4.1 and not the tool description may still read it as authorable.

## Instance fan: a graph destination that runs one activity once per element of a collection

### work unit source

## The decision in one sentence

A destination gains a third form: a closed object naming **the activity**, **the collection it runs once per element of**, and **the widest fan it admits**. The name each instance reads its own element at, and the key its outputs land under, are **both derived from the activity id** — so nothing per-instance and nothing per-borrower enters the graph.

## Testing the lens first, because it decides the shape

The lens offered was "keep data out of the graph: the fan names one activity; the activity declares what it fans over, the way a loop step declares `over`", with its own two falsification tests. Both fail, and a third failure is fatal.

**Test 1 — the borrowing case.** `ActivityVariablesSchema.reads` is the activity's contract *on its including workflow* (`src/schema/activity.schema.ts:65`: "the names it needs that workflow to supply"). If the activity declares `over: challenge_perspectives`, every borrower must supply a collection at that exact name — which is amendment §4 option B's rejected failure inverted: "an activity borrowed into two workflows would need different reads in each". One activity fanned over `challenge_perspectives` here and `audit_lanes` there is unauthorable.

**Test 2 — Keep Orchestration in Structure.** "This operation runs once per element of that collection" is a *routing* fact of the same kind as "this exit leads there". Moving it into the activity file makes the activity file state how many workers run it — which is what `bind-site-is-orchestration-truth` and the graph's own description ("This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say", `src/schema/workflow.schema.ts:67`) exist to prevent.

**Test 3, fatal — the fan stops being decidable from the graph object.** Specification §4.3: "`fanGroups` reads the graph object and nothing else — no activity lookup, no file access — so the loader keeps sole ownership of agreement with the activities, and the join has exactly one derivation." Under the lens the fan is invisible in the graph, so the loader, the reachability analysis and the transition handler would each have to read activity files to know whether a plain destination fans. Worse: §4.1 already rejects a one-element list ("a one-element list is a plain destination spelled a second way, which One Authoritative Home forbids"), so the *plain string* would have to become the fan trigger — and then every one of the corpus's 207 plain destinations is ambiguous until its destination activity's file is read.

**But the lens is honoured on the half that carries data.** The *item name* is not in the graph — it is derived. The *item value* is not in the graph — it is an element of a bag collection. The graph carries three routing facts and no data: which activity, which collection, how wide at most. The graph names `over` exactly as a `forEach` step does (`src/schema/activity.schema.ts:159`, `'Collection expression iterated by a forEach loop.'`); the difference is that a graph fan **derives** the item name where a loop **declares** it, because a loop's body is inline steps in the same file and a graph fan's body is a borrowable activity in another.

## The exact zod

One file, `src/schema/workflow.schema.ts`. Every message below was probed against the repo's own zod and `zod-to-json-schema`; the rendered results are quoted after the declaration.

```ts
/**
 * A destination that runs one activity once per element of a collection: an instance fan.
 * `activity` is the activity every instance runs; `over` names the collection in the variable bag,
 * whose length is the fan's width; `maxInstances` is the widest fan this destination admits, so a
 * longer collection refuses the fan-enter rather than spending its dispatches. The name each
 * instance reads its own element at, and the key the instances' outputs land under, are derived
 * from the activity id — `unitKey` and `branchKey` — so an activity borrowed into two workflows
 * declares one read whichever collection each borrower fans it over.
 */
export const InstanceFanSchema = z.object({
  activity: z.string().describe('The activity every instance of this fan runs.'),
  over: z.string().describe('The collection in the variable bag this destination runs the activity once per element of. Its length at the moment the fan is entered is the fan\'s width.'),
  maxInstances: z.number().int().positive(
    'a fan admits at least one instance; maxInstances is the longest collection this destination accepts',
  ).describe('The widest fan this destination admits. A collection longer than this refuses the fan-enter, naming this number and the collection\'s length.'),
}).strict();
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

/**
 * Exit bindings: activity id → exit id → destination. A destination names one activity, lists
 * several, or names one activity with the collection it runs once per element of. Either of the
 * latter two is a fan: its activities run together, one worker to each, and the run enters the
 * single activity all of their own exits name once the last of them returns — so the barrier is
 * read off the bindings the graph already carries and nothing declares it. A destination of
 * TERMINAL_SENTINEL ends the run without landing on an activity. Every exit every activity in the
 * workflow declares is bound here; an unbound exit, an unknown exit and an unknown destination
 * each fail the load, so the graph and the activities cannot drift apart.
 */
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
      message: 'a destination is an activity id, `__terminal__`, a list of at least two activity ids, or an object naming `activity`, the `over` collection it runs once per element of, and `maxInstances`',
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

/** Whether a destination runs several workers together. */
export const isFan = (destination: Destination): boolean =>
  Array.isArray(destination) || typeof destination === 'object';

/** Whether a destination runs one activity once per element of a collection. */
export const isInstanceFan = (destination: Destination): destination is InstanceFan =>
  typeof destination === 'object' && !Array.isArray(destination);

/**
 * The bag key an activity's outputs land under when the graph runs it as a branch of a fan: its id
 * in snake case with `_outputs` appended. Derived from the id alone, so the server, the guards and
 * a reader of the graph spell it the same way and a worker is never told it.
 */
export const branchKey = (activityId: string): string => `${activityId.split('-').join('_')}_outputs`;

/**
 * The name one instance of an instance fan reads its own element of the fan's collection at: the
 * activity's id in snake case with `_unit` appended. Derived for the same three reasons the branch
 * key is, and one more that is the instance fan's own: a declared name would have to agree with
 * every borrower's collection, so a fanned activity borrowed twice would need two reads and get
 * one. The suffix is what makes the derivation total, exactly as `_outputs` is: a variable name is
 * a snake-case phrase of at least two words, so a single-word activity id would otherwise need an
 * exemption entry of its own.
 */
export const unitKey = (activityId: string): string => `${activityId.split('-').join('_')}_unit`;
```

**Rendered messages, probed against the repo's zod (`node_modules`, via `tsx`).** These resolve the disagreement the two judges left open (`design-record.md`, judge 2's graft list: "Resolve it empirically before writing the schema"):

| Authored | Rendered |
|---|---|
| `done: [research]` | `a fan names at least two activities; an exit that leads to one activity names that activity, and an exit that runs one activity over a collection names the activity with that collection` (the **array member's own** message wins — the `errorMap` does not suppress it) |
| `done: []` | the same message |
| `done: 42` | the union `errorMap` message |
| `done: [[a, b]]` | the union `errorMap` message |
| `done: { activity: x, over: y }` | the union `errorMap` message — **which is why the error map enumerates the object's three required fields**; a partial object matches no branch far enough to surface a field error |
| `done: { activity: x, over: y, maxInstances: 0 }` | `maxInstances: a fan admits at least one instance; maxInstances is the longest collection this destination accepts` (the object branch's **field** message wins, because that branch matched furthest) |
| `done: { activity: x, over: y, maxInstances: 3, variable: z }` | `Unrecognized key(s) in object: 'variable'` — `.strict()` is what tells an author the parameter name is derived rather than authored |

## The generated JSON shape

`schemas/workflow.schema.json` is generated by `npm run build:schemas` (`scripts/generate-schemas.ts:25`, root reference strategy) and never hand-edited. Generated and verified verbatim:

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
            "activity":     { "type": "string",  "description": "The activity every instance of this fan runs." },
            "over":         { "type": "string",  "description": "The collection in the variable bag this destination runs the activity once per element of. Its length at the moment the fan is entered is the fan's width." },
            "maxInstances": { "type": "integer", "exclusiveMinimum": 0, "description": "The widest fan this destination admits. A collection longer than this refuses the fan-enter, naming this number and the collection's length." }
          },
          "required": ["activity", "over", "maxInstances"],
          "additionalProperties": false
        }
      ]
    },
    "description": "<the graph describe text>"
  }
}
```

Both the array's `items` and the object's `properties` are non-empty subschemas, so `tests/generated-schemas.test.ts:44-49` (fails on an empty subschema at an `items` key) stays green. `scripts/generate-site-data.ts:498-517` never recurses into `additionalProperties`, so the site's schema page needs no work beyond the picked-up description.

**Corpus impact of the widening: none.** 17 workflows, 109 activities bound, 207 edges, 18 terminal, 0 list-valued and 0 object-valued. A union accepts every existing string; no load rule keys off the destination's JavaScript type; the instance rules are vacuous until a fan is authored.

## Authored form, and the two derived names

```yaml
graph:
  reconcile-assumptions:
    done:
      activity: challenge-pass
      over: challenge_perspectives
      maxInstances: 6
  challenge-pass:
    done: combine-challenges
  combine-challenges:
    converged: assumptions-review
    not-converged: reconcile-assumptions
```

Read plainly: finishing `reconcile-assumptions` starts one `challenge-pass` worker per element of `challenge_perspectives`. Each of them, when it finishes, points at `combine-challenges`. The runner takes that as the join and enters it when the last instance returns. `combine-challenges` routes either onward or back to the fan's source — a convergence loop as a graph cycle. **L6 forbids a *branch* routing onto itself; a join routing back to a source is legal**, and a join that *is* the source is legal too (a two-node cycle), which is the loop with no separate combine activity.

Derived, never authored: instance k reads its element at `challenge_pass_unit`; all instances land their outputs in `challenge_pass_outputs`.

## What an instance receives: exactly one value, at one bare name

**Why it cannot be a bag entry.** `state.variables` is one flat record shared by the whole session (`src/tools/workflow-tools.ts:508`, `:2235`) and `applyVariableWrites` assigns flat entries (`src/utils/variable-seed.ts:93`). N instances reading different values at one bare bag name is the clobber `isolation-then-combine` forbids (`workflows/meta/techniques/scatter-gather.md:30-32`).

**Why the instance cannot project its own element from an index.** There is no indirection operator anywhere in the tree, verified at four sites: the `{token}` grammar is `\{(IDENT(\.[a-zA-Z0-9_]+)*)\}` (`src/utils/activity-variables.ts:213` over `IDENTIFIER_PATTERN` at `src/utils/binding-provenance.ts:36`) — literal segments only; the bag-name grammar is `^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$` (`variable-binding.md:19`); the structured condition compares a literal `variable` string against a literal `value` (`src/schema/condition.schema.ts:15-21`, walk at `:40-48`); the `when` dialect tokenises an identifier to `{ kind: 'cmp', path, op, value }` with a literal path (`src/schema/when-expression.ts:23-29`, `getVar` `:287-294`). So `{challenge_perspectives.{fan_index}}` is unexpressible. **Handing an instance an index buys it nothing, because it cannot spell its own read.**

**Why it cannot ride the prompt.** `context-travels-as-state` forbids it by name (`compose-prompt.md:59-61`): "A fact the worker needs and no variable carries is a missing declaration, not a licence to inline." And a prompt-borne value satisfies the worker's reasoning while leaving the activity's declared `{challenge_pass_unit}` tokens and `when:` gates unbound — the prompt appears nowhere in `variable-binding.md`'s input precedence (`:13-17`).

**So: a server-computed per-delivery projection on the `get_activity` response.** The tool's header already carries exactly this class of value for exactly this reason — `artifact_prefix` ("server-computed from the activity filename and is NOT in the raw activity definition, so surface it in the header", `src/tools/workflow-tools.ts:1438-1441`) and `exit_destinations` ("the routing a worker is asked to report is unresolvable from the body alone, and this block is what closes that", `:1443-1449`), assembled at `:1451-1456` and mirrored on `_meta` at `:1616`. `write-artifact.md:12-14` already documents `artifact_prefix` as "server-provided" and an operation binds it as an ordinary input. The fan parameter is the third member of that set.

```
session_index: 3
artifact_prefix: 07
fan_instance:
  unit_variable: challenge_pass_unit
  instance: 1
  of: 3
  value: rejected-paths
exit_destinations:
  done: combine-challenges
```

`variable-binding`'s Protocol step 2 gains one tier, between the step's own deviations and the bag: *an activity the graph runs as an instance of a fan resolves the fan's derived unit name from the `fan_instance` block of its own delivery.* One sentence; nothing else in that operation moves. The worker then binds `{challenge_pass_unit}` exactly as it binds a bag variable — **one bare name, one value, differing per instance because the projection differs per instance.**

Two implementation notes that are easy to miss:
- **Overlay the projection on `bagAtOpen`** at `src/tools/workflow-tools.ts:1205`, or a step gated on the parameter is unanswerable at delivery and stays lazy (`lazyUnanswered`, `:1222`). Unoverlaid it degrades rather than breaks.
- **Do not overlay `inspect_session` or `get_workflow_status`.** Both serve one shape to both roles (`:2235`, `:508`) and neither takes an activity or an instance parameter; the orchestrator's `state` for `compose-prompt` substitutions cannot be per-instance. The honest asymmetry, stated rather than hidden: a worker re-reading the bag through `inspect_session { view: 'variables' }` finds the *collection*, not its element. The projection names itself on the response it arrives with, so the asymmetry is visible.

**Where a structured element is admitted.** The element may be a slug string (`"rejected-paths"`) or an object carrying an `id` (`{ id, brief, tools_hint? }`, which is what `decompose-work-units.md:20-24` already emits). The instance still receives **one** value and projects fields off it by ordinary dotted read — `{challenge_pass_unit.brief}`, exactly what `{current_unit.target}` already does at `prism/activities/02-adversarial-pass.yaml:32`. Owner input 1 is honoured without forbidding a structured element, and `gather-results`' own normalisation ("string as-is; object → `.id`", `gather-results.md:40`) covers both.

## The runtime width, and its two bounds

The width is the collection's length **at the moment the fan is entered** — a runtime value. That is deliberate and it is what makes four of the seven `dispatch-workers` sites servable, because their unit lists are produced during the run. Two bounds, different owners, neither a shadow of the other:

- **`maxInstances`, required, on the destination.** The author's declared ceiling for this fan, at the site, in the loop's own idiom. Required rather than optional so that a fan over a runtime collection with no declared ceiling **fails the parse** — Encode Constraints as Structure, and the same reasoning §4.1 gives for keeping the arity in the schema.
- **`DEFAULT_FAN_MAX_INSTANCES` in `src/config.ts`**, env-overridable with an in-code fallback: the same shape and the same home as `DEFAULT_BATCH_MAX_ACTIVITIES = 3` and `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35` (`src/config.ts:164-165`), whose comment already names `docs/dispatch-model.md § Batching a run of activities` as the home for the measurements behind them. `maxInstances` above the ceiling fails the **load**, so a deployment's limit is authored against rather than discovered mid-run. **Default 16, and this is a policy number — the specification must say so.** Its derivation: the widest fan-out any corpus site authors is the substrate primary batch's roster of ten (`substrate-node-security-audit/activities/03-primary-audit.yaml:69` names ten expected output files); the challenge pass authors three and two. Sixteen clears every authored site with headroom, and it is one config edit rather than a corpus sweep when a measured run says otherwise.

§10's objection to a width cap — "a cap would be a policy number with no derivation behind it and no configuration home" — is fully answered on the configuration half and half-answered on the derivation half. What changes the balance is that a distinct fan's width is countable in the file at authoring time, while an instance fan's width is a runtime collection length, so nothing bounds it unless something is authored.

## The one specification decision this reverses, quoted and answered

> §10: **No per-branch metadata in the graph.** A fan destination is a list of activity ids and nothing else. Everything else a branch needs is derived: its key from its id, its destination from its own bindings, its identity at dispatch.

Three answers.

**First, all three derivations the sentence protects survive intact.** The output key is still derived from the activity id; the input name is *newly* derived from the same id; the destination is still the branch's own bindings; the identity is still minted at dispatch. Nothing per-instance appears in the graph — not a key, not an ordinal, not a name.

**Second, the sentence is true of a fan whose branches carry distinct ids, and an instance fan has none.** With one activity run N times there is nothing to derive *from*: the only alternative discriminators are (a) a repeated literal, which carries no data at all and which finding B(iii-a) shows cannot produce differing work, or (b) list position, which is per-branch metadata too — merely implicit, and unnameable by an author, a guard or a join.

**Third, what the object carries is per-*fan*, not per-branch, and it is routing.** One activity, one collection, one ceiling. The AP-127 `bag-value-as-literal` reading confirms it: its do-not-flag exempts "The declaration itself", and a graph destination *is* the fan's declaration. The literal it replaces is worse than what it becomes — today the same fact sits at seven bind sites as a JSON string in a step's `inputs` (`work-package/activities/02-design-philosophy.yaml:196`, `04-research.yaml:156`, `05-implementation-analysis.yaml:102`, `06-plan-prepare.yaml:134`, `07-assumptions-review.yaml:93`, `08-implement.yaml:178`, `15-codebase-comprehension.yaml:100`), which is six copies of one list. The fan promotes it to one declared collection read by the routing construct that owns it.

## Inventory row (`schema-construct-inventory.md`, Workflow-Level Constructs, beside the Graph row at `:65`)

```
| "Run this one activity once per work unit — one worker each, then combine" | **Instance fan** (graph) | `graph.<activity>.<exit>` naming an object with `activity` (the activity every instance runs), `over` (the bag collection whose length is the width) and `maxInstances` (the widest collection this destination accepts). Each instance reads its own element at the derived name `<activity>_unit`, and all of them land their outputs in the derived array `<activity>_outputs`, one slot per instance in collection order; the run enters the single destination the branch activity's own exits name, once, after the last instance returns. A collection longer than `maxInstances`, an empty collection, a non-array collection, and an element with no derivable id each refuse the fan-enter; a repeated activity id in a *list* destination fails the load and its message names this form. The activity that combines them binds `orchestration-patterns::gather-results` over the container with the fan's own collection as `expected_ids`. Distinct from the **Graph fan** row above (several *different* activities) and from the within-activity fan-out row at `:38` (work units inside one worker). |
```

### instance identity

## The frontier entry: a bare string, gaining an instance segment

The specification's zod stands **unamended**:

> ```ts
>   frontier: z.array(z.string()).default([]),
> ```
> (§5.1, and §10: "The frontier is a list of activity ids.")

An entry for an instance of a fan is `challenge-pass#1`. §5.1's "Nothing else goes on an entry" holds literally — the entry is still one string, and nothing is added beside it.

**The corpus already owns this spelling, introduced for exactly this shape.** `src/loaders/workflow-loader.ts:441-449`:

> The separator between a loop-body checkpoint's base id and its per-iteration instance discriminator. A checkpoint inside a forEach/while loop is defined once but reached N times; yielding it as `<baseId>#<instance>` (e.g. `assumption-decision#RE-1`) gives each iteration a distinct checkpoint id — so the response key (`<activity>-<checkpoint>`) no longer collides and iterations 2..N are recorded/prompted distinctly.
>
> ```ts
> export const CHECKPOINT_INSTANCE_SEPARATOR = '#';
> ```

with `checkpointBaseId` (`:451-455`) and `getCheckpoint`'s base fallback (`:457-475`, "an instance-qualified id resolves to its base definition"). Convention Over Invention: one definition reached N times, discriminated by `#`, resolved by base. The separator's home generalises to serve two populations:

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

/** The instance discriminator, if any. */
export function instanceOf(qualifiedId: string): string | undefined {
  const i = qualifiedId.indexOf(INSTANCE_SEPARATOR);
  return i === -1 ? undefined : qualifiedId.slice(i + 1);
}

/** A fan instance's index, when the discriminator is one. */
export function instanceIndex(qualifiedId: string): number | undefined {
  const raw = instanceOf(qualifiedId);
  if (raw === undefined || !/^\d+$/.test(raw)) return undefined;
  return Number(raw);
}
```

`checkpointBaseId` retires into `baseId` — three source call sites (`workflow-loader.ts:473,474`, `validation.ts:89`) and one test import (`tests/workflow-loader.test.ts:13,243-246`), all enumerated. No compatibility alias.

## Why the index, and not the unit's own id, is the discriminator

An instance discriminator must satisfy five properties at once: distinguish two entries of one activity; stay stable across a replacement worker; select the work unit; address the output slot; be decidable enough for a static check. The unit's own id satisfies all five *only if the fan's keys are authored*, which they are not here — the collection is runtime. Against that, the index wins on three counts and loses on none:

- **Uniqueness by construction.** Two elements of a runtime collection with the same id would produce two identical frontier entries — reintroducing the exact ambiguity this design removes, discovered mid-run. The index needs no duplicate-key refusal, which is Prefer Removing the Thing That Needs a Prohibition.
- **`order-is-preserved` for free** (`scatter-gather.md:34-36`): the slot is the collection's own position, so the gather is deterministic without anything sorting.
- **Statically range-checkable.** `maxInstances` is authored, so an authored index in a join's expression can be compared against it at load (rule L14 below). A runtime id cannot be.

And Principle 16, *Distinguish Designators from Parameters*, comes out the right way round: **the entry is a designator for a slot; the projection is the parameter.** The index never reaches the worker as data it must interpret — it reaches it as the name of the slot it occupies, beside the one value it works on.

## What the composite buys, and it is the reason to prefer it to an object entry

1. **Blocker 1 dissolves rather than being answered.** §5.1's resolver is unamended in body:
   > `heldActivity(state, named)` — "the one it names when the frontier holds it, or the sole entry when a call names none and only one is in flight … Undefined otherwise: the caller refuses rather than guessing."

   The frontier holds N *distinct* strings, so `from_activity: 'challenge-pass'` matches nothing and `from_activity: 'challenge-pass#1'` matches exactly one entry. An exact string comparison over a list of distinct strings is the whole mechanism. An object entry would force `heldBranch(state, { activity, instance })` — a signature change plus a change at every caller, for no gain.

2. **Six existing per-activity projections become instance-aware with no code change**, because `HistoryEntry.activity` is a plain `z.string()` (`src/schema/state.schema.ts:85-91`) and the composite lands in it: `activityWallClockMs` keys spans on `e.activity` (`src/tools/workflow-tools.ts:360-379`); `projectUsage.activities_without_usage` diffs usage rows against `completedActivities` (`:474-475`); `batchActivities` counts distinct ids per scope (`src/utils/batch.ts:72-86`); `validateTechniqueFetches` scopes a visit to the last `activity_entered` for the named activity (`src/utils/validation.ts:198-216`); `hasDispatch` / `priorDeliveryScope` key on the activity id (`src/utils/dispatch.ts:34-40`, `:62-77`); `projectHistory`'s milestones carry it. **Keyed on the base id every one of those silently collapses N instances into one** — `activityWallClockMs` would report the fan's wall clock while claiming to report an activity's, and `activities_without_usage` would be satisfied by one row where N are owed, hiding N−1 missing figures.

3. **`record_usage` needs nothing.** Its `activity` parameter is "Activity this figure is attributed to, whether or not the session is still on it" (`src/tools/workflow-tools.ts:1787`), stored verbatim with no validation. An instance-qualified id satisfies that description as written. `account-every-activity` (`dispatch-activity.md:70-72`) gains one clause naming an instance and nothing else: **N entries, one per instance**, because each instance is a separate dispatch with its own harness establishment, and one entry for the base id would make the figure unattributable and under-report by N−1 establishments.

## Base resolution: one convention, two functions, mirroring `getCheckpoint`

Composite ids reach four validators and one header. Verified behaviour if nothing base-resolves:

| Reader | With `'challenge-pass#1'` |
|---|---|
| `validateStepManifest` (`validation.ts:101`) | `getActivity` misses → returns `["Cannot validate manifest: activity 'challenge-pass#1' not found"]` — a **spurious error on every instance return** |
| `validateActivityManifest` (`:270`) | `activityIds.includes(...)` false → warns `references unknown activity` **on every instance** |
| `validateReportedExit` (`:243-244`) | `getExitBindings` → `[]` → returns `null`: **silently disabled** |
| `validateActivityTransition` (`:45`) | `exitDestinations` → `[]` → returns `null`: **silently disabled** |
| `validateTechniqueFetches` (`:190`) | `getActivity` misses → `[]`: **silently disabled** |
| `exit_destinations` header (`workflow-tools.ts:1449`) | `{}` → the block is omitted and the worker cannot report its routing |

Two edits close all six, and both mirror the base-fallback convention already sitting one screen away in the same file:

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

and in `getExitBindings` (`:499`) the graph lookup takes the base:

```ts
  const bound = workflow.graph?.[baseId(fromActivityId)] ?? {};
```

`validateActivityManifest`'s explicit `activityIds.includes(entry.activity_id)` base-normalises in place (one call). Nothing else changes: `validateTechniqueFetches` keeps filtering history on the **composite** at `:196` and `:211`, which is what stops instance 1's technique fetches crediting instance 2's manifest — the function already filters on `data.agentId` (`:213`), and the composite makes the activity half agree with the agent half.

## How a worker learns which instance it is

`get_activity` takes **the parameter the specification already adds in §5.3, and nothing more** — its value carries the instance:

```ts
      activity_id: z.string().optional().describe('Optional. The activity you were dispatched for, instance-qualified (`challenge-pass#1`) where the graph fans that activity over a collection. Omit while one activity is in flight; required while several are, and refused when the session is not on the activity you name.'),
```

**Blocker 2 closes with no second discriminator anywhere.** Judge 1's High finding against the winning design — "During a fan every branch is in the frontier, so the membership test admits `research`, `codebase-comprehension` and `implementation-analysis` to any caller — the check is vacuous exactly when a fan is running" (`design-record.md:1449`) — is *aimed at the distinct fan and it lands there*. It does not land here: the frontier holds distinct strings, so a worker naming a sibling's instance is refused rather than served the sibling's body.

**And the response reports the instance-qualified id back.** This is the decision that closes the hazard a bare-id response would leave wide open. `verify-dispatched-activity` (`activity-worker.md:82-84`) instructs a worker to "confirm the activity `id` returned by the `get_activity` call your current stub instructed … equals the `{activity_id}` that dispatch or continuation bound. On mismatch, STOP — execute no steps". If the response reported `challenge-pass` for every instance, that comparison would pass for a worker composed for `#0` and served `#2`'s projection — a wrong answer with a complete-looking audit trail. Reporting `challenge-pass#1` makes the worker rule **effective for instances**, which is the strengthening §5.3 declined to claim for the distinct fan:

> §5.3: "One rule is **not** strengthened by this … `verify-dispatched-activity` in `activity-worker` stays a worker rule, unamended. A worker whose composed prompt names a sibling's activity is served that sibling's body, because a membership test admits every branch of a running fan."

That sentence stays true of a distinct fan and becomes false of an instance fan, in the safe direction, at the cost of composing one string. §11's residual narrows accordingly.

**Refusals, verbatim:**

```
get_activity: this session is on 'challenge-pass#1', not the 'challenge-pass#2' you were dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.

get_activity: 3 activities are in flight (challenge-pass#0, challenge-pass#1, challenge-pass#2). Pass activity_id naming the one you were dispatched for, activity and instance together.

No activity in flight. Call next_activity first.
```

`compose-prompt`'s substitutions need no new input: `:16-18` already requires "`activity_id` as well for activity-worker", and this design changes only the **value** of a substitution the operation already declares. One clause on that line — *instance-qualified where the graph fans that activity over a collection* — and step 1's emit (`:39-40`) is unchanged.

**The slot claim, as a reading rather than a refusal.** A second identity claiming a slot already delivered is detected by machinery that already runs on this exact call path: `hasDispatch(state, scope, activity_id)` and `priorDeliveryScope(state, scope, activity_id)` at `src/tools/workflow-tools.ts:1526-1528`, recording `activity_redelivered` at `:1533`, whose own comment reads "A genuine worker replacement records the same event — both are worth seeing" (`src/utils/dispatch.ts:82`). Keyed on the **composite** this event fires exactly on a replacement or a duplicate claim; keyed on the base id a *correct* fan of N fires it N−1 times, burying the one event that means "two contexts claim one slot" in noise generated by construction. **One key change, two failures made legible.** It is a reading, not a refusal, because refusing needs one bit the server does not have — whether the prior claimant is dead — and inventing that bit is new state for a hazard not yet observed. Stated as the upgrade trigger in the residuals.

## How one instance retires, and the barrier preserved verbatim

`next_activity`'s two parameters, with the instance dialect:

```ts
      activity_id: z.union([z.string(), z.array(z.string()).min(2), InstanceFanSchema]).describe(
        'Where the run goes next: an activity id, `__terminal__`, or — where the graph fans the exit taken — the destination exactly as the graph names it, which for one activity run over a collection is that object. Returning a branch of a running fan, this is the activity the fan converges on: the server enters it once, when the last branch returns.',
      ),
      from_activity: z.string().optional().describe(
        'The activity this call is exiting — the one `exit`, `step_manifest`, `variables_changed` and `artifacts_produced` belong to, instance-qualified (`challenge-pass#1`) where the graph fans that activity over a collection. Omit while one activity is in flight; required while a fan is running, so the call names which branch returned.',
      ),
```

**§5.2's five-step rule needs no amendment.** Step 1 — "Named and in the frontier: that one. Named and absent: refuse" — is an exact string comparison over a list of distinct strings, and the load rules guarantee the instance key is unique within its fan. That is how the retire step finds the one entry: not by scanning for a matching activity id and then disambiguating, but because the id it names is unique by construction.

**The barrier property therefore survives verbatim**, and the specification's own sentence still reads true:

> §5.2: "There is no separate barrier-met call and no separate join-enter call, so entering the join early is not refused — it is unrepresentable, because the only call that can enter the join is the one that empties the frontier."

Retire `challenge-pass#1`; remove it; enter `activity_id` iff the frontier is now empty. Instance 2's return enters the join; instances 0 and 1 enter nothing and report `_meta.barrier = { destination: 'combine-challenges', pending: ['challenge-pass#2'], met: false }`. A crashed and resumed orchestrator re-derives the same barrier from the session file with no extra state, because the frontier holds slot names rather than worker identities.

**What changes inside the handler.** `exitingActivity` (`workflow-tools.ts:769`) becomes the resolved composite, so the `activity_exited` event (`:771`), the `completedActivities` append (`:772-774`), the step-completed events (`:812-825`) and the trace stamp (`:982`) all carry it — which is what makes `activities_without_usage` and the wall-clock spans answerable per instance, and what gives the trace segments distinct labels. `draft.exit` (`:842`) holds the last instance's exit, which is exactly the field's stated meaning after a fan (§5.1). The variable wrap (`:804-810`) lands the reported map at `branchKey(base)` slot `index` — see the isolation field.

**Refusal texts, replacing §5.2's:**

```
Cannot exit 'challenge-pass': the session is on three instances of it. In flight: challenge-pass#0, challenge-pass#1, challenge-pass#2. Pass from_activity naming the instance this call is returning, activity and instance together.

Cannot exit 'challenge-pass#4': the session is not on it. In flight: challenge-pass#1, challenge-pass#2. An instance index comes from the fan the graph declares; report the mismatch rather than retrying with another index.

Cannot advance: 3 activities are in flight (challenge-pass#0, challenge-pass#1, challenge-pass#2). Pass from_activity naming the instance this call is returning; the destination is entered once, when the last one does.

Activity 'reconcile-assumptions' binds exit 'done' to a fan, so 'exit' is required on this transition to say which destination it takes.
```

## The fan-enter, and its four refusals

On the call that enters the fan the server holds the graph (`workflow-tools.ts:720`) and the bag, so it derives everything and refuses before spending anything. Four refusals, each closing a silent failure:

```
Cannot fan 'reconcile-assumptions.done' to 'challenge-pass': 'challenge_perspectives' holds 24 elements and this destination admits maxInstances: 6. Cap the collection where it is produced — `decompose-work-units` takes `effort_cap` — or raise maxInstances on this destination.

Cannot fan 'reconcile-assumptions.done' to 'challenge-pass': 'challenge_perspectives' is empty. A fan of no instances would empty the frontier at the moment of entering it, so the destination would be entered with an activity the graph says runs never having run. Route past the fan with an exit predicate on 'reconcile-assumptions' where there may be nothing to fan.

Cannot fan 'reconcile-assumptions.done' to 'challenge-pass': 'challenge_perspectives' holds a string, not an array. A fan runs one worker per element, so its collection is an array of work units.

Cannot fan 'reconcile-assumptions.done' to 'challenge-pass': element 2 of 'challenge_perspectives' is an object with no 'id'. An element's id names its slot in 'challenge_pass_outputs', its row in the gather's dispatch manifest, and its artifact filename, so each element is a slug string or an object carrying an id.
```

The `effort_cap` the first message names already exists as the contract layer that should have prevented it (`decompose-work-units.md:16-18`; group-level declaration at `orchestration-patterns/TECHNIQUE.md:24-26`). The refusal is what makes that contract enforced rather than merely honoured. **Truncating to the cap is rejected**: it silently drops declared work, and the join's gather would then report `complete` over a set that was never the collection — the false completeness `isolation-then-combine` exists to prevent. **Successive waves are rejected**: a wave boundary empties the frontier mid-fan, destroying the one property §5.2 buys.

Width 1 is admitted and needs no rule: the collection is data, one instance enters as `challenge-pass#0`, and the barrier releases on its return. Width 0 is refused, above.

## `_meta.fan`, and the two operation changes

The fan-enter response carries the derivation the orchestrator would otherwise have to compute:

```json
"fan": {
  "activity": "challenge-pass",
  "unit_variable": "challenge_pass_unit",
  "over": "challenge_perspectives",
  "branches": ["challenge-pass#0", "challenge-pass#1", "challenge-pass#2"]
}
```

**`dispatch-fan` (§5.5) needs no instance mode, and this design adds no second dispatch operation.** Walk its protocol against an instance fan: publish the in-progress marks once; enter the fan with one call; mint one identity per branch; compose one prompt per branch; spawn the batch; retire the branches in input order; hand back the destination. Every step is identical. The only thing that changes is what identifies a branch. So its input becomes `fan_destination` — the destination exactly as the graph named it, arriving from the worker's envelope — and step 2's enter call returns `_meta.fan.branches`, which steps 3 through 6 iterate. The operation never learns which graph construct produced them: Separate Contract from Procedure, and the reason §10's rejection of a fan mode on `dispatch-activity` ("one operation carrying two procedures a caller selects exactly one of") does not recur.

Rules needing one clause each rather than rewriting: `a-branch-takes-one-activity` becomes "a branch carries exactly one activity, and where the graph fans that activity over a collection, exactly one instance of it"; `one-identity-per-branch` is unchanged in wording and now load-bearing twice over, since an instance fan's siblings share an activity id and only the identity tells the delivery ledger (`src/utils/delivery.ts:63-65`) and the batch bound (`src/utils/batch.ts:154`) them apart; `replace-one-branch` works **unchanged**, because the replacement names the same instance-qualified entry, which the frontier still holds. That last is the free-replacement property, and it survives *because the entry names the slot rather than the worker* — which is exactly why §5.1's refusal of a per-entry worker identity strengthens here rather than weakening.

**`finalize-activity` and `evaluate-transition`: one field replaces §5.7's plural one.** Quoting the decision changed:

> §5.7: "`finalize-activity` gains one output beside the singular next activity: `next_activity_ids` — The activities the exit taken fans to, where the graph names several. Exactly one of this and `next_activity_id` is present on every successful completion."

An instance fan cannot use it: N is a runtime collection length the worker never sees. But §7 row 16 already requires the missing half — `exit` is mandatory on a fan-enter — and given the retiring activity and the exit, the graph determines the destination completely, and the handler already loads the graph. So a plural field carrying the width is a copy of a graph fact the handler holds, which is the shape One Authoritative Home exists to prevent.

**Amended:** `finalize-activity` reports the destination in **one** field, `next_activity_id`, whose value is the destination as the worker's own `exit_destinations` block gave it — an activity id, a list, or the fan object — plus **one boolean, `next_activity_fans`**, because the drive loop's gate dialect has equality, comparison, bare truthiness, negation, conjunction, disjunction and parentheses and no type or list test (`src/schema/activity.schema.ts:75`). `evaluate-transition` stays the single home for reading where an exit sends the run and reports "one activity, terminal, or fans". §5.6's `advance-to-fan` gates on `worker_result.next_activity_fans` and sets one control name from a boolean instead of copying a list; `advance-activity` gates on its negation. The two remain disjoint and each fully determines both control names, so §5.6's own argument for them not being a shadow of one another is unchanged. **Cost, stated:** §9 stage 2's acceptance criteria change — the plural envelope field is not added. **Conservative alternative:** keep `next_activity_ids` for the list form and add the boolean only for the object form; its cost is two ways for a worker to report a fan, which is the second home the rest of this design spends its effort avoiding.

And `exit_destinations` in the worker's header renders an instance fan faithfully as `{ activity, over }` — the worker reports what it read, and reports nothing it had to derive.

### isolation

## The container: a dense array, materialised at the fan-enter, written positionally

`branchKey(activityId)` is unchanged in derivation (§6.1). Its **value shape** is amended, and this closes the amendment's open item for 6.1/6.3/6.5.

An instance fan's container holds **one slot per instance, in collection order**, each slot `{ id, result }` where `id` is the element's own id (the element when it is a string, its `.id` when it is an object — `gather-results`' own normalisation applied once, server-side) and `result` is that instance's reported `variables_changed` map. A slot no instance filled holds `null`.

```
challenge_pass_outputs:
  - { id: "stakeholder-gap",   result: { perspective_findings: [...] } }
  - null
  - { id: "evidence-strength", result: { perspective_findings: [...] } }
```

Read form: `{challenge_pass_outputs.0.result.perspective_findings}` for an authored index; ordinarily the join hands the whole container to `gather-results` (below).

## Why dense-array-with-nulls, verified by execution against the real canonicaliser

Three candidate shapes, run through `canonicaliseJson` (`src/utils/session/store.ts:145-187`) — the function whose output is HMAC-sealed and written to disk:

- **A sparse array** — which is what a positional write at index 2 into a fresh `[]` produces when instances retire out of order — canonicalises to `"[\n,\n,\n    {…}\n]"`, because `canonicaliseValue`'s array branch at `:171-175` maps over the array (the callback skips holes; the result keeps them) and `join(',\n')` renders each hole as an empty string. **Reparsed: `Unexpected token ','` — invalid JSON, written by `atomicWrite` and unreadable on reload.** This is a corrupted session file, not a cosmetic defect.
- **An object with numeric keys** avoids that but loses order: `sortedKeys` sorts lexicographically at any depth other than 0 (`:151-157`), so an 11-instance fan persists as `"0","1","10","2",…` — verified — breaking `order-is-preserved` (`scatter-gather.md:34-36`, "the gathered collection is in work-unit order so the combine step is deterministic").
- **A dense array pre-filled with `null`** preserves index order through canonicalisation — verified.

So the container is **materialised at the fan-enter**, at the same single write site the wrap already occupies, as `N` explicit `null`s. That pre-fill buys three things at once:

1. Order survives the seal, and an out-of-order retirement is a positional write into an existing slot rather than a hole.
2. A slot no instance filled reads as absent to **both** evaluators — verified by execution: `notExists` is `true` for a null slot, `true` for a member of a null slot, and `true` for an out-of-range index; `exists` is `true` for a present member.
3. **A second visit to the same fan resets the container rather than appending into the previous visit's slots.** That closes §11's "Two fans containing one activity share its branch key", which the index would otherwise make worse, and it states §6.1's rule positively for the instance case: *a branch key holds one slot per instance the fan entered, in collection order; a slot no instance filled holds null; entering a fan materialises the container afresh.*

## Both read walkers handle a numeric segment — verified by execution, not inspection

Confirming amendment §2's claim against the real modules:

- `parseWhen('challenge_pass_outputs.0.result.perspective_name == "stakeholder-gap"')` parses to one node `{ kind: 'cmp', path: 'challenge_pass_outputs.0.result.perspective_name', op: '==', value: 'stakeholder-gap' }`. The tokeniser starts an identifier on `/[A-Za-z_]/` and continues on `/[A-Za-z0-9_.]/`, so a numeric segment is consumed inside the identifier and never reaches the numeric-literal branch.
- `expressionPaths` returns full indexed paths including two-digit indices (`challenge_pass_outputs.10.x`).
- `evaluateWhenExpression` returns `true` for index 0 and index 2, `false` for the null at index 1 and for out-of-range index 5.
- `evaluateCondition`'s walk (`src/schema/condition.schema.ts:40-48`) bracket-indexes after a `typeof current !== 'object'` guard; an array satisfies it and `arr["0"]` returns the element. Its explicit `current === null` guard is what makes a null slot's member read `undefined` rather than throw.

**Neither evaluator is touched.** And `expressionPaths` feeds `whenReads` → `bagName` (`src/utils/activity-variables.ts:216-218`), which takes the head, so the guard's read collector already resolves an indexed reference to its container with no change.

## `applyVariableWrites`: one optional context field, one changed line

`src/utils/variable-seed.ts:68-108` gains `under?: { key: string; index: number }` on `ctx`. Its per-name validation loop (`:75-92`) runs **unchanged** against the declaration map its caller supplies. Only the commit changes:

```ts
    // A branch's outputs land whole in the slot its instance occupies, so two instances cannot
    // collide by construction. The key is derived from the graph the handler already loaded —
    // never supplied by a caller — which is what makes the namespace the only route a branch's
    // values have into the bag. Corpus rule: meta/techniques/scatter-gather.md#isolation-then-combine.
    draft.variables[name] = value;                       // becomes:
    slot.result[name] = value;                           // slot = draft.variables[under.key][under.index]
```

with the `variable_set` event naming `key.index.member`, so the history says which instance a value landed in.

**The declarations the members are validated against come from the retiring branch activity's own declared writes, read at the moment of the wrap** — §6.3's decision, and it is load-bearing here for a reason the specification names: the handler's own `declarations` map is built from `result.value.variables`, the *merged workflow* set (`src/tools/workflow-tools.ts:761`), so a container-only declaration would leave every member unvalidated. Validating against the branch activity's own writes keeps `context_scope`'s three-value set (`work-package/activities/04-research.yaml:32-39`) checked. Judge 1's Critical graft, preserved.

`variables_changed` stays the only *worker* write path. The container materialisation is a server write from the graph, at the same site, on the fan-enter call — not a branch write, and not a merge: no two instances write one slot.

## The one specification decision this changes: the container's declared type

> §6.5: "**The merge adds the container; it does not replace the members.** `mergeActivityVariables` takes the set of activity ids the graph fans in this workflow, and for each one contributes one further declaration — `{ name: branchKey(id), type: 'object', description: '…' }` — **in addition to** that activity's own write declarations."

Adding-rather-than-substituting is preserved exactly, for all three of the reasons §6.5 gives. **`type: 'object'` becomes `type: 'array'`** for an activity the graph fans as an *instance* fan, and stays `'object'` for one it fans as a distinct-activity branch. Three mechanical consequences make this necessary rather than tidy:

- `disagreement` compares `type` first (`src/utils/activity-variables.ts:62-75`), so a wrong declared type is what the merge's own contradiction path would report.
- `applyVariableWrites`' declared-type check (`:80`) would warn against anything that ever wrote at the container name.
- `get_workflow`'s rendered variable set is what an author reads before writing `{key.0.result.member}`; `'object'` would make that rendering lie about the value the server lands.

The container declaration carries **no `defaultValue`**, or `check:variable-model`'s `exists-on-defaulted` makes every `exists` gate on the container constant (`src/schema/variable.schema.ts:16` states the seeding, and the rule).

And the index is **uniform** — always present, including index 0 for a fan of width 1 — which is amendment §4's option A. Its own reason for rejecting option B applies: "a join's read form would then depend on the fan's shape, so an activity borrowed into two workflows would need different reads in each". A container whose read form flips with the width is that failure by another route.

## `gather-results` finally has an executing caller, and the instance fan is what *requires* it

A distinct fan's join spells N literal reads because N is authored (§6.4's three dotted projections). An instance fan's N is a runtime collection length, and the token grammar has no indirection and no dialect anywhere expresses "for each member of this container" — proved above. **So the join cannot spell its reads and must hand the whole container to an operation that walks it.** That operation exists, declares the contract exactly, and has no executing caller today because every one of its callers' dispatch halves is unreachable:

> `gather-results.md:12-18` — `dispatched_results`: "Array of `{ id, result }` from the prior dispatch step (or equivalent), in input order." `expected_ids`: "Ordered expectation list. Each entry is either a string id or an object with an `id` field … Objects contribute their `.id`."

The bind, with the two sanctioned deviation forms and no new construct:

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

Three things worth stating plainly:

- **`expected_ids` binds the fan's own `over` collection, unchanged.** No derived write is needed to carry the expectation list to the join, because the collection is already a declared bag variable the join declares a read of. This is smaller than it could have been: the design adds **no** new derived bag name beyond `unitKey`, and the join's `expected_ids` needs no server support at all.
- **`dispatched_results` binds the container with `gather-results`' declared shape satisfied**, which is why the container's slot is `{ id, result }` rather than a bare map. `gather-results`' step 2 indexes by `id`; a `null` slot has no id, so it is simply absent from the index and its expected id surfaces as `missing` with `result: null` — precisely what `:26-28` documents. One sentence on `dispatched_results` admits a fan's branch container beside a dispatch step's output; nothing else in the operation moves. Binding a *second, near-identical* gather would be `duplicate-shared-capability` against the rule that already forbids it (`scatter-gather.md:22-24`, `one-gather-contract-two-scatter-modes`).
- **`completeness` is structurally constant at the join, and the specification must say so rather than advertise a detection it cannot make.** §5.2 step 4 enters the join only on the call that empties the frontier, so no expected id can be missing there. §10 already states the consequence: "the gather either has every key it names or it does not run". What *is* live is `dispatch_manifest`'s `empty` row: an instance that returned an envelope with no writes lands `result: {}` and is marked `empty` — real, and particularly worth having for a replaced instance.

`decompose-work-units` also gains a caller, unchanged, at the fan's **source** activity: its `work_units` output (`{ id, brief, tools_hint? }`, "`id` is a stable slug") is exactly a fan's `over` collection. `compose-worker-briefs` is displaced at this layer rather than served — it builds a per-unit *prompt* carrying the unit's brief (`:34-38`), and under a graph fan the prompt is `compose-prompt`'s, where putting the work in the prompt is what `context-travels-as-state` forbids.

## The load checks: L2 re-aimed, four new, and L7 trivially satisfied

All of them join `validateExitBindings` (`src/loaders/workflow-loader.ts:520-572`), which runs after fragment materialisation (`:333`) and the variable merge (`:350`) and fails the load on a non-empty return (`:367`). The existing destination-existence check (`:565-567`) iterates `destinationTargets(destination)` and keeps its message per target, so L1 and L3 cover an instance fan's `activity` with no edit beyond the flatten.

**L2 is replaced rather than withdrawn.** The amendment says "The message and the rule are withdrawn"; that is right about the *capability* and wrong about the *list spelling*. A repeated id in a list destination still fails, because a literal repetition carries no data and cannot produce differing work — and its message is now the author's pointer to the form that does:

```
Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' twice. A list destination runs each of its activities once; to run one activity once per work unit, name the activity with the collection it runs over — { activity: challenge-pass, over: <collection>, maxInstances: <ceiling> }.
```

Four new rules, all decidable from the graph object plus the materialised activities `validateExitBindings` already holds:

| # | Rule | Message |
|---|---|---|
| L11 | An instance fan's branch activity declares the fan's derived unit name among its reads | `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' over 'challenge_perspectives', handing each instance its element at 'challenge_pass_unit', which that activity does not declare among its reads. The name is derived from the activity id, so declare it rather than choosing it.` |
| L12 | An instance fan's `over` is a legal bag-name head | `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' over 'Challenge-Perspectives', which is not a variable name. A fan's collection is read from the variable bag, whose names are snake-case phrases of at least two words.` |
| L13 | `maxInstances` is within this deployment's ceiling | `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' with maxInstances: 40, above this server's ceiling of 16 (WORKFLOW_FAN_MAX_INSTANCES). A fan spends one worker per element in one irreversible turn, so the ceiling is authored against rather than discovered at runtime.` |
| L14 | An authored index addressing a fan's container is within that fan's declared width | `Activity 'combine-challenges' reads 'challenge_pass_outputs.7.result.perspective_findings'. The fan at 'reconcile-assumptions.done' admits maxInstances: 6, so slot 7 is never filled. Hand the whole container to a gather rather than addressing a slot the fan cannot reach.` |

**L10 widens by one clause**: both derived names must be legal variable names, so an activity id beginning with a digit is rejected naming `challenge_pass_unit` as well as `challenge_pass_outputs`.

**L7 is satisfied by construction for an instance fan, and this is the single biggest simplification instances buy.** Every instance is the same activity, so `getExitBindings` returns one set for all of them and the branches cannot disagree about their join. For the distinct-activity fan L7 is the binding constraint — §9 stage 7's second adoption blocker is "Nothing converges. The comprehension activity binds four exits to four different destinations". For an instance fan it cannot arise. What survives is L4: an activity with no `exits:` at all cannot be a branch.

**L9 survives unchanged as a rule, and is exactly as strict.** Its grounds — one outstanding decision at a time, `assertNoActiveCheckpoint` gating every other tool call (`src/utils/session/params.ts:56-76`), all branches spawning in one turn — mention no branch distinctness, and instances make it *more* binding: N instances of one activity all reach the same checkpoint step, so a gate inside a fanned activity deadlocks with certainty rather than by luck of routing. Its message loses one of its three remedies, which is a message edit and not a rule edit: for an instance fan "take this activity out of the fan" dissolves the fan rather than narrowing it, so the gate moves to the source or to the join and there is no third option.

## What the guard sees

Two files, `src/utils/activity-variables.ts` (shared by the server and the guards so they cannot drift) and `scripts/check-activity-variables.ts`. Everything lands inside the existing `activity-variables` registry entry (`scripts/guards.ts:38-44`, 36 entries), so §10's "No 37th guard registry entry" holds.

**The write side is index-free.** For a fanned activity the declared-write set becomes the container plus one entry per member spelled `container.member`, and **not** `container.<index>.result.member` — N is a runtime value and a static guard cannot enumerate instances. This refines the amendment's §6.5 row 1 ("the member test moves one segment right and skips a numeric segment"), which is correct for the **read** side only.

**The read side strips two segments past the head.** A dotted read whose head is a fan container is tested by dropping a leading all-digits segment and then a literal `result` segment, and comparing the remainder to the member set. Four lines, deterministic, and it makes the container's shape self-documenting in the read.

Diagnostics, under the existing family names — so no new ledger and, for two of the three, no new family:

1. `unwritten-read` at member grain: `reads 'challenge_pass_outputs.0.result.perspective_findngs', which 'challenge-pass' does not produce; it lands perspective_findings`.
2. `unread-write` at member grain: `writes 'challenge_pass_outputs.perspective_findings', which nothing in this workflow gathers` — **carrying forward the self-consumed exemption `readersOf` already gives** (`scripts/check-activity-variables.ts:197-206`), without which the family fires on the order of 35 times on one correct fan, because most of a branch's declared writes are intra-activity working values.
3. The amendment's one new diagnostic: **a read that omits the index is reported, naming the instance form** — with a uniform index `{key.member}` addresses nothing, and the flat walker would never find it.

**One genuinely new family, and it closes an exposure the fan parameter creates.** `fan-parameter-read-outside-its-branch`: the fan's derived unit name is read only by the activity that fan runs. The parameter is server-supplied per delivery and is **not declared in `workflow.variables`** — which is the right call, and the reason matters. Declaring it there would put it in `owned` (`:94`) and so satisfy `unwritten-read` (`:208-215`), but `availableAtEntry` also seeds from `owned` (`:226-231`), so a read of the parameter *anywhere else in the workflow* would be silently satisfied — an activity elsewhere could declare `challenge_pass_unit` as a read and receive nothing at runtime. Instead the guard models it the way it already models server-supplied names: **ambient to the fanned activity, unwritten for every other activity.** `unwritten-read` already skips `AMBIENT_CONTEXT_IDS` (`:210`), so this is one entry in one map scoped by activity id, the complement is the new family, and the exposure never opens.

**`fan-artifact-collision` gains its instance arm** — see the artifact decision. Same family name, so no new registry entry, and §7 row 29 keeps its safety-floor status.

## The reachability analysis: trivial for instances, with two traps

§6.6's change is to meet over **arrivals** rather than predecessors, a completed fan being one arrival contributing the union of its branches' outgoing sets. Instances are trivial there, for three reasons each verified against `src/utils/activity-variables.ts:574-673`:

1. **The graph the walk runs over collapses a fan of instances to one node.** `activityGraph` (`:540-546`) already does `[...new Set(Object.values(workflow.graph?.[id] ?? {}))]`. §6.6's one-line flatten must be written as `[...new Set(Object.values(...).flatMap(destinationTargets))]`, which dedupes **after** flattening — so an instance fan yields the single successor `challenge-pass`. The forward BFS (`:604-610`), the predecessor index (`:595-597`), the strongly-connected pass (`:657-670`) and the `re-entry` family all see exactly the graph one visit would produce.
2. **The union arrival is idempotent over instances.** The arrival's contribution is the union over branches of `outgoing(branch)`; for N instances of one activity that is one branch's outgoing set. The meet's behaviour for an instance fan is indistinguishable from a plain edge and does not depend on N in any way.
3. **The set of *names* a fan makes available is N-independent** — a branch contributes exactly one flat bag name whatever landed under it, which is the property §6.6 already identifies as what the namespacing buys. So the lattice does not grow with N, termination is unaffected, and **an unbounded runtime width cannot break the walk because the walk never sees a count.**

Two traps specific to a repeated destination, each of which makes the change do nothing or do the wrong thing:

- **The arrival split must remove *all* duplicate predecessor entries.** `:596-597` pushes `from` into `predecessors.get(to)` once per entry of `from`'s target list. Without the re-dedupe in `activityGraph`, the fan source appears N times in the branch's predecessor list, §6.6's requirement that "a branch must be removed from the plain predecessor index for its join" has to remove N entries, and missing any one lets the intersection wipe the union straight back out — the first of the three ways §6.6 says the change can be applied and do nothing. **Re-deduping in `activityGraph` is trap-free by construction and is the fix I recommend.**
- **The arrival must be built over distinct branch ids.** `FanGroup.branches` holds entry ids, so an instance fan's list holds N of them. The union is idempotent so a naive iteration is harmless for correctness, but any per-branch bookkeeping keyed on the activity id is written N times over one slot, and a diagnostic naming the arrival's contributors names one activity N times.

**One genuinely new and valuable check falls out of the fan's own collection.** Today `unread-write` fires on any name nothing declares reading (`:216-223`), and a fan's collection is read by the *graph*. So the guard contributes a read of the fan's `over` head — `bagName` (`:216-218`), which correctly takes `execution_plan` from a dotted `over` — attributed to the fan's **source** activity, and adds the same name to `routingReads` (assembled at `:236-240`) so the definite-assignment pass proves the collection is written on every path reaching the fan source. **A fan entered on a path where its collection was never written is now reported statically**, which is `unproduced-value-read` at graph grain. Without it the runtime fan-enter refusal is the only detector, and it fires on a live session. Two map entries.

**What no static check can see, stated as a residual rather than checked:** whether slot *k* was filled. N is runtime; the definite-assignment lattice proves availability at **container grain only**. L14 bounds an authored index against `maxInstances`; nothing proves the collection was that long.

**One other graph reader, unchanged by instances but worth restating.** `scripts/check-review-mode-gating.ts` declares the graph's shape itself and parses raw YAML, so the fan rules cannot protect it: it imports the destination type and flattens. Unflattened, its activity lookup on an object is undefined and every activity beyond a fan drops out of its reachability set. `tests/e2e/walker.ts` and `scripts/smoke/smoke-orchestrator.ts` import the type instead of re-declaring it.

## Serialising side effects: five surfaces, and what they constrain

The timing fact that decides all five: **a branch worker writes its files during its own run, inside the concurrent turn, before any transition.** `dispatch-fan` spawns the batch at step 5 and retires branches in input order at step 6, so the *retires* are serialised and the *writes* are not. `persist-the-fan-before-any-branch-returns` answers the commit, not the write.

1. **One feature worktree, one git index — needs a rule, and it is the one hard failure.** `create-worktree.md:33-39` materialises one worktree per session at a single session variable. git serialises index mutation with `.git/index.lock`, so two concurrent `git add` calls do not corrupt the index — the second dies with "Unable to create '.git/index.lock'". `commit-and-persist.md:31` retries a failed *push* once; nothing retries a failed `git add`, so a lock collision surfaces inside a branch as an unhandled command failure. And even fully serialised the attribution is wrong: `commit-and-persist.md:26` derives its paths from `git status --porcelain` over one working tree, which cannot attribute a change to a branch. For instances §11's residual is strictly worse, because its fallback of attributing by activity id is unavailable — N instances share one id. **The rule: no branch touches the checkout.** A fanned activity binds no operation of the `manage-git` or `version-control` groups and does not bind `workflow-engine::commit-and-persist`. Decidable from the activity file without composing signatures (`flattenActivitySteps` plus `techniqueName(step.technique)`), so it could be a load rule; I place it in the guard beside `fan-artifact-collision` so that every fan rule needing the technique layer has one home, which is §6.5's stated home split.
2. **The planning README's Progress table — constrains nothing new, but the row set is now *identical* rather than merely overlapping.** `sync-progress-status`'s protocol resolves `{artifact_prefix}` from `{activity_id}` (step 2), loads the Item labels that prefix owns (step 3), and selects every matching row (step 4). `artifactPrefix` is "inferred from the activity filename" (`src/schema/activity.schema.ts:310`), so all N instances share one prefix and one candidate row set. Two in-progress marks on one row are idempotent; two *complete* marks are not, because step 7 repoints the Item link at `{delivered_artifact}` and N instances landing N files fight over one link slot, last write winning. The specification's existing rules suffice — one commit before the spawn, one persist at convergence, and the not-applicable marker being one value per persist — with **one row consequence added**: a fanned activity keeps its single row (`planning-readme.md:77-78`), its instance artifacts get none (the precedent is `:81`, an artifact can exist without a row), and the join's artifact is what the row links. Where per-instance rows *are* wanted they are expressible today with no new construct — `## Matching` (`meta/resources/planning-readme.md:185-188`) further restricts by `item_match` — but only when the instance set is seedable into the row-ownership map, which a runtime-width fan is not.
3. **Append-ordered shared registers — constrain which activities may be fanned.** `manage-registers/append-deferred-item.md` declares `deferred-items.md` and `append-follow-up.md` declares `follow-ups.md`, both literal and unprefixed by the group's own `created-lazily-and-unprefixed` rule, with the write a read-modify-write of the whole file. Two instances writing one path do not even mint different numbers to be resolved later — one instance's rows vanish without trace. Not hypothetical: `07-assumptions-review.yaml:144` binds `manage-registers::append-deferred-item`, `12-strategic-review.yaml:207` the same, `10-post-impl-review.yaml:121` binds `append-follow-up`.
4. **The provenance log's completion-order contract — constrains which activities may be fanned.** `dco-provenance::append-task-row` declares `provenance-log.md` and appends one row per completed task; the guide's own rule is append-only in completion order. Concurrent appends lose rows, and even serialised the order becomes the nondeterministic order N instances happened to finish in, which is a property a reader compares rows against. Bound at `08-implement.yaml:114`.
5. **The artifact writer itself** — the specification's one safety-floor item, resolved at source by the artifact decision rather than detected.

**Summary: none of the five forbids an instance fan.** (1) needs a rule. (3) and (4) are criteria on the fannable set, not rules to police. (2) and (5) are answered by existing rules plus the row and filename decisions.

## What a fannable activity looks like

Nine conditions, and they are worth stating as a list because the corpus survey turns on them.

1. **Gate-free** — no checkpoint anywhere in its flattened steps, fragment refs included (L9).
2. **Not self-routing** — no exit of it binds back to it (L5, L6).
3. **At least one exit, all binding to one destination** (L4; L7 is free for an instance fan).
4. **Artifact-safe** — declares no `#### artifact`, or every one is templated on the fan's unit and carries a guide-map row.
5. **Touches no checkout** — binds no `manage-git`/`version-control` operation and not `commit-and-persist`.
6. **Writes no shared unprefixed register and no append-ordered log.**
7. **No bare downstream reader** — every declared write of it is read only through its branch key by the join, because namespacing removes it from every bare write set.
8. **Its per-instance parameter is one value** (owner input 1).
9. **Its collection is written on every path reaching the fan's source** — now statically proved by the `routingReads` contribution above.

Measured against condition 1 alone, **11-validate is the only gate-free work-package activity of fifteen** (`grep -c 'kind: checkpoint'`: 01→10, 13→7, 04→4, 10→4, 02→3, 03→3, 07→3, 08→3, 12→3, 05→2, 09→2, 06→1, 14→1, 15→1, 11→0), and `validate` has nothing to scatter over. Corpus-wide 66 of 122 activity files declare no checkpoint. **So no existing activity is fannable as it stands, and the adopters are carved activities** — which is a materially cheaper adoption than the one §9 stage 7 prices, because a *carved* branch satisfies L9 by construction and no gate has to be removed. In `04-research.yaml` the four gates sit at `:105`, `:190`, `:222` and `:241`, and the assumption-convergence loop body at `:137-168` that holds the challenge and combine steps contains **none**; the same holds at `07-assumptions-review.yaml:75-105`, `02-design-philosophy.yaml`, `05`, `06` and `08`. So promoting the challenge pass produces a gate-free branch and leaves all seven gates where they are — none of §9 stage 7's Non-Destructive-Updates burden, and none of its decision-inventory diff.

### artifact decision

## The decision

**A fan branch declares no `#### artifact`. Per-instance results land in the branch container and the join writes the document.** Where a branch genuinely must persist a document of its own, its artifact name **carries the fan's derived unit as a `{token}`** and gains one guide-map row. Both halves are already authored, working corpus shapes; neither needs a server change, a schema change, or a change to `write-artifact`.

This resolves what the amendment left open twice — §3's last row ("same-activity fan-out needs artifact paths to carry the instance before it is usable") and §4 ("**Same-activity fan-out therefore depends on an artifact-naming decision this amendment does not make**").

## The rule: the branch declares nothing, the join writes once

Nothing breaks, because no branch declares an artifact. The guide map, the audience declaration, `write-artifact`'s find-or-update discipline, the citation rule and every filename-reading guard — `check-artifact-guides` (`scripts/check-artifact-guides.ts:14-21`, `mapRowFor` `:126-135`, `resourceIsGuideFor` `:178-186`), `check-audience`, `check-technique-template.ts:175`, `composeActivityArtifacts` (`src/tools/workflow-tools.ts:120-167`) — see exactly one writer at one filename, which is what they see today. **`fan-artifact-collision` becomes vacuous rather than failing open.**

And it is the corpus's own `isolation-then-combine` raised to graph grain: "Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances. Combination happens exclusively in the combine phase" (`scatter-gather.md:30-32`). A per-instance *file* is a per-instance output by another route; the same rule reaches it.

**Verified against the strongest corpus candidate: the rule is already satisfied there.** `analyse-challenge::challenge` declares no `#### artifact` — `challenge.md:16-20` declares `challenge_findings` as an "Ordered collection of per-perspective findings (keyed by perspective name) … Isolated until combine", a value and not a file. `combine.md` declares four outputs and no artifact either. The file write is a separate step, `review-assumptions::record`, whose `assumptions_log` output declares `assumptions-log.md` under the group rule `assumptions-log-is-the-record`, and that step stays in the source or the join. **So the amendment's blocking artifact decision does not block the site that motivates the capability.**

**Named failure mode of the rule: the join becomes the context bottleneck.** The join takes a fresh delivery scope and re-pays whatever the branches collectively held (§11, "The join re-pays full delivery"), and nothing caps a fan's *runtime* width below `maxInstances`. A wide fan of document-producing instances hands the join every instance's payload to write one document, and the failure is a silently truncated or elided document — no refusal fires, because the batch bound exempts a scope with no activity yet (`src/utils/batch.ts:154`) and the artifact writer validates nothing about completeness. This is why `maxInstances` is required and why the design says the number is policy.

## The sanctioned deviation: the unit in the filename

The mechanism exists and is already sanctioned in both places that would otherwise reject it:

- **The schema admits it.** `ARTIFACT_NAME_PATTERN = /^(?:[A-Za-z0-9._-]|\{[A-Za-z0-9._$-]+\})+\.[A-Za-z0-9]+$/` (`src/schema/technique.schema.ts:54`), with the rejection message naming the conforming forms: "one path segment ending in an extension, `{token}` placeholders allowed (`01-audit-report.md`, `{package_name}-plan.md`)" (`:57-58`). `check-technique-template.ts:175` applies the same pattern to authored files, and `schema-construct-inventory.md:50` states the same.
- **The anti-pattern catalogue exempts it by name.** AP-130 `artifact-name-is-filename`, **Do not flag**: "a token-template whose `{placeholder}` resolves at runtime (`{package_name}-plan.md`, `subsystem-{code_subsystem.subsystem_name}.md`) — a placeholder standing where literal text would is part of the name, not prose."
- **`write-artifact` already declares the semantics, and this is what makes the deviation *safe* rather than merely legal.** `write-artifact.md:50`: "token-templated names (e.g. `strategic-review-{n}.md`) are an intentional numbered **SERIES** — each interpolated name is its own logical artifact and is created, not matched against siblings." So the find-or-update keyed on a bare filename (`:41-47`) never sees two instances as one artifact, and **the mint-attempt guard at `:46` is never asked to arbitrate a race it cannot win.** The data-loss the specification puts on the safety floor — §6.5 item 4 and §7 row 29, "two concurrent branches both re-scan, both create, and the run thereafter resolves the lowest-numbered instance for the rest of the walk — data loss, not hygiene" — **cannot arise, because no two instances resolve one name.**

So a fanned technique declares `{challenge_pass_unit}-challenge.md`, or `{challenge_pass_unit.id}-challenge.md` where the element is an object, and each instance resolves its own filename from the projection it was handed.

**The corpus already does exactly this at two sites, both green under the relevant guards today:**
- `substrate-node-security-audit/techniques/execute-sub-agent.md:26-32` declares `{agent_id}.json` with `audience: agent`, its input documented at `:12-14` as "Designator for this agent instance … which also names the persisted output file", guide-mapped at `substrate-node-security-audit/resources/README.md:35`.
- `cicd-pipeline-security-audit/techniques/execute-sub-agent.md:22-28` declares `{scanner_id}.json`, guide-mapped at `cicd-pipeline-security-audit/resources/README.md:34`.
- And `prism/resources/README.md:292` already carries a guide-map row grouping `{lens_name}-analysis.md`, `portfolio-{lens_name}.md`, `dispute-lens-a.md`, `dispute-lens-b.md`.

**What the deviation costs, precisely three lines of authoring:** one guide-map row spelled with the token verbatim, because `mapRowFor` is an exact string match after splitting on commas and stripping backticks (`check-artifact-guides.ts:131`); no audience change, because audience is a property of the output rather than of a file instance and `isJsonArtifactName` (`scripts/check-audience.ts:56-58`) already accepts a templated name whose literal suffix is `.json`; and no citation change, because instance files are siblings in `{planning_folder_path}`, so `hyperlink-conventions` resolves them by relative path and `verify-artifact-links.md:26` enumerates them.

**Named failure mode of the deviation: a templated instance artifact is never updated in place.** `write-artifact.md:50` is the reason it is safe and also the reason it is one-shot. A second visit to the same fan re-resolves the same template and **creates** rather than updates; and if two elements' ids ever interpolate to one value, they collide silently, because `fan-artifact-collision` is literal-names-only and this name is not literal. The fan-enter's fourth refusal (an element with no derivable id) narrows this but does not close it — the residual is stated below.

## And it becomes a check, which is what converts an open decision into a rule

`fan-artifact-collision`'s **instance arm**, inside the existing family so no thirty-seventh registry entry is created and §7 row 29 keeps its safety-floor status:

> For an activity the graph runs as an instance fan, every `#### artifact` on the composed signature of every technique that activity binds interpolates that fan's derived unit name.

Decidable from the composed signatures the guard already reads (`src/utils/activity-variables.ts:310-320`) plus the graph object, which is exactly §6.5's stated home split ("shape rules decidable from the graph object go in the loader; rules needing composed signatures go in the guard").

```
Activity 'challenge-pass' is run once per element of 'challenge_perspectives' by the fan at 'reconcile-assumptions.done', and writes artifact 'challenge-findings.md'. Every instance resolves that one filename to one file, so either the name carries the instance — '{challenge_pass_unit}-challenge-findings.md' — or the artifact belongs to the activity the fan converges on, which sees every instance's result.
```

The message states both halves of the decision, in the order the rule prefers them. The distinct-activity arm (two *activities* of one fan resolving one filename) is unchanged.

**This is what §6.5's "one new check on the safety floor" gains.** It was decidable only for literal filenames and "templated names fail closed" (§6.5 item 4, §11). The instance arm turns that fail-closed into a decision: an instance fan whose artifact template does *not* carry the unit collides on every artifact by construction, and that is now the finding — visible statically, before any run.

## Two alternatives, declined with their reasons

**A per-instance subfolder — rejected on two independent grounds.** `ARTIFACT_NAME_PATTERN` admits no path separator (`src/schema/technique.schema.ts:54`, and the message says "one path segment"), so a subfolder is not expressible in the declaration at all — it would have to arrive through `write-artifact`'s `target_dir` (`write-artifact.md:24-30`). And `operational-discipline-artifact-location` forbids it: "Write planning artifacts only under the server-returned `{planning_folder_path}` — never compose or reconstruct that path" (`workflows/meta/techniques/agent-conduct.md:46`). Beyond the rules: `verify-artifact-links.md:26` enumerates the `.md` files in the folder, so subfoldered instances leave the link audit; `planning-readme.md:90` has a Progress artifact link target the minted filename, which a seed cannot predict a subfolder segment for; and `push-before-linking` then publishes links into a shape the seed did not anticipate. `15-codebase-comprehension.yaml:56-60` is not a counter-example — `comprehension_dir` is declared "outside any one session's planning folder" and is a cumulative corpus, not a planning artifact.

**One file the instances append to under a lock — rejected.** There is no lock primitive anywhere in the corpus; the nearest thing is optimistic retry (`manage-git/artifact-commits.md:38-40`, pull-rebase before every push plus one retry; `commit-and-persist.md:31`, retry the push once). So "under a lock" means inventing one, at the very layer §8's prerequisite explicitly rejects a lock at ("a compare-and-swap on the record's sequence number with retry, not a per-session write lock"). It also contradicts `write-artifact`'s whole-file find-or-update (`:44`, "UPDATE that file in place, writing `{artifact_content}` to it") — the write is a full rewrite from a value the branch holds, not an append, so two branches serialised by a lock still lose the first branch's content unless each re-reads inside the critical section, which no operation does. This is Prefer Removing the Thing That Needs a Prohibition inverted: it adds mechanism precisely to police an overlap the rule above removes.

## The rule and the deviation, in one sentence for the specification

*An instance fan's branch declares no artifact, and the activity it converges on writes the document from the branch container; where a branch must persist a document of its own, its artifact name carries the fan's derived unit as a `{token}` and its guide-map row is spelled with that token — a templated name is an intentional series, so no two instances resolve one file and the writer's mint conflict cannot arise.*

### enforcement

One row per invariant. **schema** is carried by the zod type and surfaces as a parse error. **load** is a failure from `validateExitBindings`. **tool** is a server refusal at the boundary. **derived** means unrepresentable, so nothing needs checking. **guard** is a hard-zero finding of the existing `activity-variables` registry entry. Rows marked **not structural** are contracts an actor honours; they are listed so no reader mistakes them for enforcement. Row numbers continue the specification's 35; rows that amend a specification row say so.

| # | Invariant | Where | What it reports |
|---|---|---|---|
| 1a | A destination is a string, a list of ≥2 strings, or an object with `activity`, `over` and `maxInstances` | schema | `graph.reconcile-assumptions.done: a destination is an activity id, ``__terminal__``, a list of at least two activity ids, or an object naming ``activity``, the ``over`` collection it runs once per element of, and ``maxInstances``` — verified for a number, a nested list, and a partial fan object. **Amends spec row 2** |
| 1b | A one-element or empty list is not a fan | schema | The array member's own `.min(2)` message, verified to surface through `formatZodIssues` rather than being suppressed by the union error map. **Spec row 1, verified** |
| 36 | `maxInstances` is a positive integer | schema | `graph.reconcile-assumptions.done.maxInstances: a fan admits at least one instance; maxInstances is the longest collection this destination accepts` — verified: the object branch's field message wins |
| 37 | An instance fan carries no field beyond those three | schema | `Unrecognized key(s) in object: 'variable'` from `.strict()` — the mechanism that tells an author the unit name is derived, not authored |
| 38 | An instance fan's activity is an activity this workflow contains | load | L1, through the widened `destinationTargets` loop at `workflow-loader.ts:565-567`. **Spec row 3, unchanged** |
| 39 | A repeated activity id in a *list* destination fails, and its message names the instance form | load | L2, re-aimed. `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' twice. A list destination runs each of its activities once; to run one activity once per work unit, name the activity with the collection it runs over…` **Amends spec row 4; the amendment's §3 row 1 is honoured in substance while the list spelling stays closed** |
| 40 | The fanned activity declares the fan's derived unit name among its reads | load | L11 |
| 41 | The fan's `over` is a legal bag-name head | load | L12 |
| 42 | `maxInstances` is within this deployment's ceiling | load | L13, against `DEFAULT_FAN_MAX_INSTANCES` |
| 43 | An authored index addressing a fan container is within that fan's declared width | load | L14 — the one instance-grain check that is decidable, and it is decidable only because `maxInstances` is authored |
| 44 | Both derived names are legal variable names | load | L10 widened by one clause: `challenge_pass_unit` as well as `challenge_pass_outputs`. **Amends spec row 12** |
| 45 | An instance fan's branch binds at least one exit | load | L4. **Spec row 6, unchanged** |
| 46 | An instance fan's branch does not fan again, and does not route back onto itself | load | L5, L6. A join routing back to the fan's source is legal, and a join that *is* the source is legal — the convergence loop as a graph cycle. **Spec rows 7 and 8, with the cycle reading stated** |
| 47 | **Every exit of an instance fan's branch names one and the same destination — the join** | derived | Nothing to report. All instances are one activity, so `getExitBindings` returns one set for all of them and they cannot disagree. **The single biggest simplification instances buy over the distinct fan, where spec row 9's L7 is the binding constraint** |
| 48 | An instance fan's branch declares no gate | load | L9, unchanged as a rule; its message loses the "take this activity out of the fan" remedy, which for an instance fan dissolves the fan rather than narrowing it. **Amends spec row 11's message only** |
| 49 | An instance fan's collection is written on every path reaching the fan's source | guard | `unreachable-read`, from the guard contributing the `over` head as a read of the fan source and adding it to `routingReads`. `unproduced-value-read` at graph grain, and the only detector that fires before a live session |
| 50 | The collection is a non-empty array within `maxInstances`, and every element has a derivable id | tool | The four fan-enter refusals in §the runtime width. Each closes a silent failure: N dispatches spent past the ceiling; an activity the graph says runs silently skipped; a fan of one string; three downstream facts (slot, manifest row, filename) undefined at once |
| 51 | A call exits an instance the session is actually on | tool | The three instance-dialect transition refusals. An exact string comparison over distinct strings, so **blocker 1 dissolves rather than being answered** and §5.1's `heldActivity` is unamended in body. **Amends spec row 15's messages** |
| 52 | A worker is served the instance it was dispatched for, and never guessed at | tool | The three `get_activity` refusals, instance-qualified. The membership test **stops being vacuous** — this is judge 1's High finding against the winning design, which lands on the distinct fan and not here |
| 53 | **A worker executes the instance it was dispatched for** | `verify-dispatched-activity`, a worker rule | **Not structural, but now effective.** `get_activity` reports the instance-qualified id back, so a worker composed for `#0` and served `#2` sees a mismatch and stops. **This narrows spec row 34 and §11's residual for the instance case, at the cost of composing one string, and it is the strengthening §5.3 declined to claim** |
| 54 | A second identity claiming a slot already delivered is visible | history event | **Not structural.** `activity_redelivered` (`workflow-tools.ts:1533`), keyed on the composite so it fires exactly on a replacement or a duplicate claim; keyed on the base id a *correct* fan of N fires it N−1 times. **One key change, two failures made legible.** Refusing needs one bit — whether the prior claimant is dead — which is the upgrade trigger |
| 55 | **The join is entered once, after the last instance returns** | derived | Nothing to report. §5.2's five-step rule is unamended: the only call that can enter the join is the one that empties the frontier. **Spec row 18, preserved verbatim** |
| 56 | Entering an instance fan retires its source exactly once | derived | One call enters every instance. **Spec row 19, unchanged** |
| 57 | At most one fan is open, so the frontier needs no fan identity | derived | Rows 46 and 47 together. **Spec row 20, unchanged** |
| 58 | An instance cannot take a second activity | derived | `dispatch-fan` writes neither a worker result nor a worker identity, so the drive loop's continue gate is structurally false; row 51 is the backstop. **Spec row 21, unchanged** |
| 59 | **No instance writes a bare shared name, and no two instances write one slot** | derived | Nothing to report. The transition call is an instance's only write path once rows 48 and spec row 13 close the checkpoint channel, and that path is wrapped from the graph the handler already loaded, into the slot the call's own instance index names |
| 60 | Every member of an instance's map matches its declared type and value set | tool, warn-only | Today's wording, unchanged, validated against the branch activity's **own** declared writes read at the wrap — so `context_scope`'s three-value set stays checked. **Spec row 23, unchanged; judge 1's Critical graft preserved** |
| 61 | The container's declared type describes the value the server lands | load / rendered set | `type: 'array'`, no `defaultValue`. Wrong here and `disagreement` reports it, `applyVariableWrites`' type check warns against every write, and `get_workflow`'s rendered set lies to the author writing an indexed read. **Amends spec row's §6.5 container declaration** |
| 62 | The session file stays valid JSON when instances retire out of order | derived | Nothing to report — the container is materialised dense at fan enter, so a positional write is never a hole. **Verified by execution: a sparse array canonicalises to invalid JSON and an object with numeric keys loses order** |
| 63 | A second visit to a fan resets its container rather than half-overwriting it | derived | Materialising at fan enter is the reset. **Closes spec §11's "Two fans containing one activity share its branch key" for the instance case** |
| 64 | Nothing reads an instance's output by its bare name | guard | `unwritten-read`. **Spec row 24, unchanged** |
| 65 | Every member a gather names is one its branch produces | guard | `unwritten-read` at member grain, read past the index and past `result` |
| 66 | Every member a branch produces is gathered somewhere | guard | `unread-write` at member grain, index-free on the write side, **with the self-consumed exemption carried forward** or the family fires ~35 times on one correct fan |
| 67 | A read that omits the index is reported | guard | `unwritten-read` at member grain, naming the instance form. **The amendment's one new diagnostic** |
| 68 | The fan's derived unit name is read only by the activity the fan runs | guard | `fan-parameter-read-outside-its-branch`, the one genuinely new family. It exists because the parameter is *not* declared in `workflow.variables` — declaring it there would seed `availableAtEntry` and silently satisfy a read anywhere in the workflow |
| 69 | A read at the join is satisfied on every arrival | guard | `unreachable-read`. Instances are trivial for the meet — the graph collapses them to one node and the union arrival is idempotent, so **N never enters the walk**. Two traps: re-dedupe after the flatten, and iterate distinct branch ids. **Spec row 27, with the instance reading added** |
| 70 | A gate reachable only through a fan is still audited for a review-mode auto-advance | guard (`review-mode-gating`) | Unflattened, an activity lookup on the fan object is undefined and the whole subtree beyond the fan drops out. **Spec row 28, unchanged** |
| 71 | **No instance of one fan writes an artifact every sibling also resolves** | guard | `fan-artifact-collision`, instance arm. **Safety floor.** Turns spec §11's "templated names fail closed" into a decision: a fanned activity whose artifact template does not carry the fan's unit collides on every artifact by construction. **Amends spec row 29** |
| 72 | No instance touches the checkout | guard | The fanned activity binds no `manage-git`/`version-control` operation and not `commit-and-persist`. Decidable without composed signatures, placed in the guard so every fan rule needing the technique layer has one home |
| 73 | Each instance runs under its own identity, distinct from its siblings' and from the session's own | `dispatch-fan` rule | **Not structural.** `one-identity-per-branch`, unchanged in wording and now load-bearing twice over, since an instance fan's siblings share an activity id and only the identity tells the delivery ledger and the batch bound apart. **Spec row 30, unchanged** |
| 74 | Every instance carries exactly one usage entry | `account-every-activity`, cited by the fan operation | **Not structural.** N entries, one per instance, keyed on the composite. Keyed on the base id, `completedActivities` dedups to one entry and one row satisfies it — **N−1 missing figures invisible.** `record_usage`'s `activity` parameter admits the composite as written, unvalidated. **Spec row 31, with the grain stated** |
| 75 | A fanned activity keeps one Progress row; its instance artifacts get none | `planning-readme` | **Not structural.** All N instances share one `artifactPrefix`, so their candidate row sets are identical, and two *complete* writes fight over one Item link slot. The join's artifact is what the row links |
| 76 | One persist at convergence, naming every instance | `persist-the-fan-before-any-branch-returns` | **Not structural**, and **strictly worse than for a distinct fan**: the commit derives its paths from one working tree, and the fallback of attributing by activity id is unavailable because N instances share one id. Row 72 is what keeps it correct. **Amends spec row 33's reasoning** |
| 77 | An instance fan's width is bounded | schema + load + tool | Required `maxInstances` (row 36), the deployment ceiling (row 42), and the runtime refusal (row 50). **Amends spec §10's "No fan width cap": the configuration home is answered in full, the derivation half is a policy number and the specification says so.** What changes the balance is that a distinct fan's width is countable in the file and an instance fan's is a runtime collection length |
| 78 | The fan rules have exactly one home | — | **No 37th entry joins the 36 in the guard registry.** Shape rules decidable from the graph object are load failures; rules needing composed signatures or the technique layer land inside the existing `activity-variables` entry, three of them under existing family names. A malformed fan cannot be walked at all, which is why the load fails rather than warns. **Spec row 35, unchanged** |

### staged plan

Seven stages, **I-1 through I-7**, each independently mergeable in order. Every one of I-1 through I-6 lands with the instance capability inert, because the specification's own stage rule covers it (below). I-5 is gated on #655. I-7 is the corpus and does not gate the merge.

**Relation to the distinct-activity fan's seven stages.** Each I-stage extends the specification's same-numbered stage and can either be folded into it or merged after it. Folding is cheaper and I recommend it: I-1 through I-4 touch the same functions the specification's stages 1 through 4 touch, and splitting them means two passes over `validateExitBindings`, two over `activityGraph`, and two over `check-activity-variables.ts`. What must **not** be folded is I-5 into stage 5 — the frontier's composite entries and the base-resolution convention are separable, testable on their own, and land the six projection fixes with value independent of any fan running.

**One rule spanning I-1 to I-5, widening the specification's own.** §9's rule has `validateExitBindings` reject any *list* destination outright for the duration of the window in which the schema accepts a fan and the runner cannot execute one. It widens to reject **any fan destination, of either form**, with a message naming the stage that lands the runner. One line, deleted by I-6. That keeps every intermediate stage's "no corpus movement" acceptance criterion provable rather than argued, because the corpus cannot carry a fan at all.

---

### I-1 — the schema and the load gate

`src/schema/workflow.schema.ts`: `InstanceFanSchema`, the three-member union with both messages, `unitKey`, `isInstanceFan`, `destinationTargets` and `isFan` widened. `src/config.ts`: `DEFAULT_FAN_MAX_INSTANCES = 16` with its env override and the comment pointing at `docs/dispatch-model.md`. `src/loaders/workflow-loader.ts`: `fanGroups`/`fanMemberIndex` gaining the instance case (still reading the graph object and nothing else), the widened destination-existence loop, L2 re-aimed, L10 widened, L11 through L14. `npm run build:schemas` and `npm run build:site`, both committed. `tests/workflow-loader.test.ts`: one case per new and amended rule, plus a well-formed instance fan accepted, plus the binding record carrying an object and the reachable-activities helper returning the branch head.

*Acceptance.* `npm run check:all` green with **zero corpus movement** — 17 workflows, 109 activities bound, 207 edges, none of them a list and none an object, so a union accepts every existing string and the instance rules are vacuous. The regenerated JSON carries the three-member `anyOf` with `minItems: 2` on the array and `required: [activity, over, maxInstances]` plus `additionalProperties: false` on the object; `tests/generated-schemas.test.ts` stays green. Each of the seven rendered messages in the enforcement table's rows 1a, 1b, 36 and 37 is asserted verbatim against a fixture. L2's new message names the object form.

*Guard obligations.* `workflow-yaml` first to re-run; `refs`, `audience`, `artifact-guides`, `stealth-isolation`, `session-contract` and `activity-variables` all load workflows and inherit the load result.

---

### I-2 — instance-qualified ids resolved to their base, and every graph reader made instance-aware

`src/loaders/workflow-loader.ts`: `CHECKPOINT_INSTANCE_SEPARATOR` generalised to `INSTANCE_SEPARATOR` with `baseId`, `instanceOf` and `instanceIndex`; `checkpointBaseId` retired into `baseId` at its three source sites and one test import; `getActivity`'s base fallback mirroring `getCheckpoint` ten lines below it; `getExitBindings`' graph lookup taking the base. `src/utils/validation.ts`: `validateActivityManifest`'s `activityIds.includes` base-normalising. `src/utils/activity-variables.ts`: the flatten in `activityGraph` written as `flatMap(destinationTargets)` **inside** the existing `new Set`, so the re-dedupe is trap-free. `scripts/check-review-mode-gating.ts`, `tests/e2e/walker.ts`, `scripts/smoke/smoke-orchestrator.ts`: the destination type imported, an instance-fan-bound exit yielding one branch head, the walk entering the branch once and then the join.

*Acceptance.* No corpus movement; `check:all` green. Six unit tests, one per reader in the base-resolution table: `validateStepManifest` no longer returns `Cannot validate manifest: activity 'challenge-pass#1' not found`; `validateActivityManifest` no longer warns `references unknown activity`; `validateReportedExit`, `validateActivityTransition` and `validateTechniqueFetches` are **live** rather than silently disabled for a composite id; the `exit_destinations` header is populated for one. `validateTechniqueFetches` still filters history on the **composite**, asserted by a test in which instance 0's fetches do not credit instance 1's manifest. A fixture instance fan walks end to end in the walker.

*Why this must precede any corpus fan.* Unflattened, the walk sends an object where a single activity id is required, the tool's type rejects it, the walk throws, and the coverage job's assertion that no walk errored fails.

---

### I-3 — the analysis, and the fan's collection made a proven read

`src/utils/activity-variables.ts`: the fan-groups argument on `unreachableReads`, the split predecessor index, the arrival-intersection meet with the union arrival iterated over **distinct** branch ids, and the moved candidate seed. `scripts/check-activity-variables.ts`: the fan groups passed in from the loader's single derivation; the `over` head contributed as a read of the fan's **source** activity and added to `routingReads`; the fanned activity's own derived unit name filtered out of its `reads` set before the call, the same way `routingReads` is already filtered at `:236-240`.

*Acceptance.* Corpus guard output **byte-identical**, because no fan exists — this stage proves no regression and the new behaviour is proved by fixtures. On a fixture instance fan: a join's declared read of the container produces **no** finding (the union arrival); a genuinely unwritten read inside the branch **is** reported as an entry finding (the traversal fix); the fan's collection unwritten on one path reaching the source **is** reported; a read of the derived unit name by an activity that is not the branch **is** reported; the fixed point terminates; and the whole set of findings is invariant under changing the fixture fan's `maxInstances` from 2 to 12, which is the mechanical proof that N never enters the walk.

*Risk note carried into the plan.* This is a new operator in a hard-zero guard with no ledger to diff, so a bug in it is silent, and each of the three ways §6.6 names to apply it and have it do nothing — plus the two instance traps — is caught only by a fixture test.

---

### I-4 — the container, statically

`src/utils/activity-variables.ts`: the container declaration typed `array` for an instance fan and `object` for a distinct branch, carrying no `defaultValue`; the single-grammar read function with `pathReads`; the branch-key re-keying of productions and of the landing site. `scripts/check-activity-variables.ts`: the declared-write re-keying **index-free**, the read test stripping a digits segment and then `result`, the member-grain reporting under the existing family names with the self-consumed exemption, the index-omitted diagnostic, `fan-parameter-read-outside-its-branch`, `fan-artifact-collision`'s instance arm, and the no-checkout rule. `workflows/meta/techniques/variable-binding.md`: the branch-scoped landing, the derivation rule, and the one sentence placing the fan projection in the input precedence. `workflows/meta/techniques/scatter-gather.md`: the graph-fan application of `isolation-then-combine`, and the instance fan as a third scatter mode over one combine contract. `workflows/meta/techniques/orchestration-patterns/gather-results.md`: one sentence on `dispatched_results` admitting a fan's branch container.

*Acceptance.* Corpus guard output byte-identical. On fixtures: one correct instance fan with a gather produces **zero** findings; a gather naming a member no branch produces is reported once; an ungathered member is reported once; a read omitting the index is reported once naming the instance form; a bare read of a fanned activity's output is reported once; a read of the derived unit name outside the branch is reported once; a fanned activity whose technique declares a literal artifact is reported once by `fan-artifact-collision`; the same activity with `{<unitKey>}-name.md` is **not** reported; a fanned activity binding `commit-and-persist` is reported once; a branch that writes a working value and reads it back within its own steps is **not** reported.

*Guard obligations.* Add `binding-fidelity` and `variable-model` to the acceptance set — the first mechanises a declared input with no reader and a read with no producer, the second mechanises defaults, gates and variable effects staying coherent with the seeded model. Add `check:anchors` (`resource-anchors`), because I-6's operation edits introduce new anchors across five files.

---

### I-5 — the frontier and the runner. **Gated on #655 before it is enabled on a real run.**

**The prerequisite, restated with what this design needs from it.** Issue #655: every mutating handler rewrites the whole session file from a snapshot taken at load, with no staleness check, no version, no compare-and-swap and no lock. What this design needs, in one line: **a compare-and-swap on the record's sequence number with retry, not a per-session write lock.** Both clauses are load-bearing, and the instance fan makes the second one *more* so than the distinct fan does: an instance fan of N delivers N copies of **one** activity's payload, so a per-session write lock would serialise N identical ~87,000-character compositions behind one another, and wall clock is the only thing a fan buys.

`src/schema/session.schema.ts`: `frontier` replaces the single current activity — **`z.array(z.string())`, the specification's own zod, unamended.** `src/utils/session/resolver.ts`: `heldActivity`, unamended in body, and the session view taking the named activity. `src/utils/session/store.ts`: the canonical key ordering. `src/utils/session/migration.ts`: a recorded single activity converts to a one-entry frontier. `src/utils/variable-seed.ts`: `ctx.under?: { key, index }`, the per-name validation loop untouched, the slot commit, the `key.index.member` event name. `src/tools/workflow-tools.ts`: the widened `activity_id` union admitting the fan object, the instance-dialect `from_activity`, the five-step rule unchanged, the container materialised at fan enter, the four fan-enter refusals, `_meta.fan` and `_meta.barrier`, the `fan_instance` header block and its `_meta` mirror, the `bagAtOpen` overlay at `:1205`, `activity_id` on `get_activity` and the instance-qualified id reported back, the composite reaching `exitingActivity` and thence the exit event, `completedActivities`, the step-completed events and the trace stamp, the four repointed validation gates, the yield refusal, the shared ambiguity helper, and the in-flight rendering on status, identity projection, activity projection and session inspection. `src/tools/resource-tools.ts` and `src/logging.ts`: every other read of the removed field.

*Acceptance.* The whole existing unit and end-to-end suite green with a frontier of length one — every ordinary session takes the identical path and no test is rewritten for behaviour, only for the field name. A session recorded before this stage migrates and resumes. Then, per row of the enforcement table: the transition refusal with `from_activity` omitted while three instances are in flight; a mid-fan return entering nothing and reporting the outstanding instance keys; the last return entering the join; **a three-instance fan executing end to end against real sessions**, with each instance's outputs in its own slot and a dotted read resolving through the index; the four fan-enter refusals; `get_activity` refusing a sibling's instance and reporting its own instance-qualified id back; instances retiring **out of order** and the session file reparsing as valid JSON with slots in collection order — the direct regression test for the sparse-array corruption; a second visit to the same fan resetting the container; a member whose value disagrees with its declaration warning with today's wording; three usage rows for a three-instance fan and `activities_without_usage` naming the one instance whose harness reported nothing; `activity_redelivered` firing **zero** times on a correct three-instance fan and **once** when a second identity claims one slot.

---

### I-6 — the definitions that make an instance fan execute

`workflows/meta/techniques/workflow-engine/dispatch-fan.md`: `fan_destination` in place of `branch_activities`, the branch list taken from the enter call's `_meta.fan`, `a-branch-takes-one-activity`'s one clause. `finalize-activity.md`: one destination field plus the `next_activity_fans` boolean, replacing §5.7's `next_activity_ids`. `evaluate-transition.md`: a destination is one activity, terminal, or fans. `compose-prompt.md`: `activity_id` instance-qualified where the graph fans that activity. `activity-worker.md`: `verify-dispatched-activity` gains one clause naming the instance-qualified comparison, which is the rule this design makes effective. `workflows/meta/activities/03-dispatch-client-workflow.yaml`: `advance-to-fan` and `advance-activity` gating on the boolean and its negation. `src/loaders/core-ops.ts` and `workflows/meta/workflow.yaml`: the two delivery entries. `docs/dispatch-model.md`: the instance-fan section, with **the arithmetic stated honestly** — an instance fan's alternative is one activity whose loop body runs N times in one worker, which pays one delivery and N iterations ("An entry for a step inside a loop body is the protocol for EVERY iteration: engage it once per iteration from the copy you hold", `workflow-tools.ts:1406`), so an instance fan's premium is **(N−1) × the activity's whole payload plus (N−1) harness establishments**, roughly twice the distinct fan's premium at the same width, and for a structural reason: the distinct fan's sequential alternative pays three payloads anyway. Re-derived against a fresh `npm run bench:batch` rather than quoted from §1. And the counterweight, which belongs beside the negative number: an in-context loop of N units accumulates all N reasoning passes in **one** context and **nothing bounds that**, because the batch budget counts delivered characters and not generated ones — at the challenge site up to N × 10 passes in one worker, since the loop is a `doWhile` with `maxIterations: 10`. The instance fan converts unbounded intra-activity context growth into N bounded contexts, which is `isolation-then-combine` buying correctness rather than latency. The inventory row. The load-rule line from the I-1-to-I-5 rule deleted.

*Acceptance.* `check:all` green including `refs` resolving every new anchor, `audience` placing every new rule, `fragments`, and the workflow-YAML validator loading the amended meta workflow. Version bumps on every edited definition. A smoke run drives a three-instance fixture fan: the three drive-loop steps fire in order, the checkpoint trio and the artifact commit stay silent on the fan iteration, the destination arrives through the output remap, and the boolean gate selects `advance-to-fan`.

*The stale-restatement sweep.* Run by grep key against the tree, not against this change's file list, and the occurrence count recorded in the change manifest — AP-129's own test. This design's own keys, beyond the specification's seven: *the current activity definition*, *no activity_id*, *the activity each declared exit leads to*, *a loop variable is iteration state*. Two contradictions must be resolved rather than left: `get_activity`'s tool description at `src/tools/workflow-tools.ts:1007` says "from session state — no activity_id" and is now false in two ways; and `src/schema/activity.schema.ts:65` says of `variables.writes` "a loop variable is iteration state and is not declared here" while `schema-construct-inventory.md:56` lists "loop items" among what `variables.writes[]` declares, and the corpus declares them (`04-research.yaml:44-46`, `prism/02-adversarial-pass.yaml:13-15`). Both spellings pass the guard, because `activity-variables.ts:404` records the name either way. **Left standing, the rule that the fan's derived parameter is *not* declared reads as arbitrary.** Pick one — the schema's, since a per-iteration and a per-instance value are the same category and neither is a bag entry — and fix the inventory row.

---

### I-7 — first adoption, its own commit in the workflows submodule

**The first adopter is `prism`'s dispute pass, and the capability therefore does not ship dormant.** `prism/activities/07-dispute-pass.yaml` is gate-free, declares one exit `done` bound to `generate-report`, and binds one technique whose `## Outputs` declare `dispute-lens-a.md` and `dispute-lens-b.md` — **an instance fan of width 2 written out by hand, with literal per-instance filenames** — plus `dispute-synthesis.md`. Migration: split `dispute-analysis` into a per-lens operation declaring `{dispute_lens_pass_unit}-lens.md` and a synthesis operation keeping `dispute-synthesis.md`; declare `dispute_lenses` on the workflow file with its two-lens `defaultValue`; `select-mode`'s `dispute` exit fans `{ activity: dispute-lens-pass, over: dispute_lenses, maxInstances: 4 }`; the branch's `done` binds to a new `dispute-synthesis-pass` whose `done` binds `generate-report`. Every one of the nine fannable conditions holds: gate-free, not self-routing, one exit, artifact templated (and `prism/resources/README.md:292` already carries a guide-map row grouping the lens artifacts, so it is one row edit), no checkout, no register, no bare downstream reader, one value per instance, and a collection with a `defaultValue` so it is written on every path. **No gate is removed, no loop is promoted, and the per-lens work is a full analysis pass — long enough that one forgone payload buys real wall clock and real context isolation.**

**The second adopter, priced but not in this stage.** `analyse-challenge::challenge`, bound at seven work-package activities and the corpus's one authored instance fan-out: "Build one work unit per entry in `{challenge_perspectives}`… Each unit receives only the concern set (or a read-only summary) **plus its perspective name** — not other units' findings" (`challenge.md:26-28`), which is owner input 1 authored in the corpus today. It is the strongest *shape* match and the weakest *cost* match: each of the seven sites is a step inside a step-level `doWhile` with `maxIterations: 10`, so promoting the pass to an activity means promoting the loop to a graph cycle — legal, but it loses `maxIterations` (replaced by an authored round counter and an exit predicate, which the `when` dialect already expresses) and it replaces a **free** in-context loop with up to 10 × (1 + N + 1) dispatches, since sequential `scatter-gather` needs no dispatch primitive. Its own gains are real and worth recording: the perspectives list is promoted from six identical bind-site literals to one declared collection; the branch is gate-free by construction, so none of §9 stage 7's gate-removal burden applies; and neither `challenge.md` nor `combine.md` declares an artifact, so the artifact rule is satisfied natively.

*Commit shape.* One commit in the workflows submodule plus the pointer bump in the server repo, in the same pull request. The coverage baseline re-recorded and stamped in the same commit, and the dry-walk budget re-measured from its current 50 — a fan multiplies the branch orderings the enumerator produces, and a short streak is reported as *unreached options*, that is as a definitions defect, when the cause is the budget. A workflows-branch sweep runs the server's main tooling and stays red until the paired server change merges, so verify locally and re-run the sweep by hand afterwards.

*Acceptance.* The workflow loads with the fan and every load rule satisfied. `check:all` green on both sides with the pointer bumped. The coverage walk green with no stale, newly-uncovered or newly-covered entries and the stamp fresh. `check:artifact-guides` and `check:audience` green over the templated instance name. One live run in which two instances spawn in one turn, each lands its outputs in its own slot of `dispute_lens_pass_outputs`, the synthesis activity gathers both through `gather-results` with `expected_ids: dispute_lenses`, the two lens artifacts exist under distinct filenames, the progress marks publish in one commit before the spawn and resolve in one persist at convergence, and no fan-enter or transition refusal appears in any log.

### not adding

Each with what would trigger it, in the ponytail marker form the specification's own §10 uses.

**No per-instance entry in the graph — no ordinal, no key list, no unit values.** The graph carries which activity, which collection, and how wide at most. An authored key list was considered and declined: it would make the width static, which forecloses four of the seven `dispatch-workers` sites whose unit lists are produced during the run, and it would put the corpus's `challenge_perspectives` literal in a second home rather than promoting it to one declared collection. *No trigger — the collection reference subsumes it.*

**No declared parameter name.** `unitKey(activityId)` is derived for the three reasons §6.1 gives for `branchKey`, plus one that is the instance fan's own: a declared name would have to agree with every borrower's collection, so an activity borrowed into two workflows would need two reads and receive one — amendment §4 option B's rejected failure by another route. `.strict()` on the destination object is what tells an author the name is derived. *No trigger.*

**No richer per-instance context than one value.** The instance receives one element at one bare name, and projects fields off it by ordinary dotted read where the element is an object. Two *independent* per-instance values would need a second collection and a second derived name, and a join could read them but an instance could not address them generically. *Trigger: a fanned activity that provably needs two per-instance values that cannot be fields of one element.*

**No new frontier field, no object entry, and no per-entry worker identity.** `frontier: z.array(z.string())` is the specification's own zod, unamended; the instance rides in the string. An object entry would force a new resolver signature at every caller and would leave the instance out of `HistoryEntry.activity`, collapsing six existing per-activity projections. A per-entry identity forces a distinct call outcome for a replacement worker, which §5.4 gets for free — and the argument **strengthens** here, because the composite entry names the *slot*, so a replacement names the same entry the frontier still holds. *Trigger: an observed duplicate slot claim that the `activity_redelivered` reading proves insufficient to diagnose.*

**No refusal of a second identity claiming a claimed slot.** Reported, not refused: keyed on the composite, `activity_redelivered` fires exactly on a replacement or a duplicate rather than N−1 times per correct fan. Refusing needs one bit the server does not have — whether the prior claimant is dead — and the honest cheap alternative is that `verify-dispatched-activity` now *can* fire, because the response reports the instance-qualified id. *Trigger: an observed duplicate claim; then record the failed worker's outcome and refuse.*

**No new tool, no new source module, no new session field, no merge policy, no partial combine, no degraded convergence, no gate in a branch, no per-branch outstanding-decision slot, no nested fan, no self-looping branch, no child session per instance, no fan mode on `dispatch-activity`, no `branch_results` output, no member field on the variable definition schema, no change to the provenance token grammar.** Every one stays refused for the reason §10 gives, and instances **strengthen** five of them: the gate ban (N instances of one activity all reach the same checkpoint step, so a gate inside a fanned activity deadlocks with certainty rather than by luck of routing); nesting (a branch's exits all name one non-list, non-object destination, so no instance can open a fan); the merge refusal ("Proceeding on two branch keys of three would hand the gather a value no branch produced" — now "on two slots of three"); the child session (which breaks implicit convergence); and the per-entry identity, above.

**No 37th guard registry entry.** Shape rules decidable from the graph object are load failures. The four instance-grain diagnostics land inside the existing `activity-variables` entry, three of them under existing family names (`unwritten-read`, `unread-write`, `unreachable-read`), so no new ledger is created; `fan-artifact-collision` gains an arm rather than a sibling; and exactly one new family is added, `fan-parameter-read-outside-its-branch`.

**No mixed fan — a list destination whose members are themselves instance fans.** This is the one omission with a **verified caller**, so it gets its own paragraph rather than a clause. `substrate-node-security-audit/activities/03-primary-audit.yaml:48` dispatches, in one batch, seven instances of `sub-crate-review`, one `sub-static-analysis`, and two instances of `sub-toolkit-review` — the roster named literally at `:69` and again as a workflow rule at `workflow.yaml:19` ("Every assigned primary agent (A1-A7, B, D1, D2) is dispatched in a single simultaneous batch"). One destination cannot carry three fans, so this site is served only as three sequential fans, which serialises what runs concurrently today. Admitting it costs one type change — `z.array(DestinationSchema)` plus a load rule rejecting a nested array — and `fanGroups` flattening heterogeneous members. It is declined here for three reasons: the arity rule becomes murky (a one-member list holding an instance fan is a plain instance fan spelled twice, which One Authoritative Home forbids and which would need its own rule and message); it roughly doubles the fan's load-rule population; and the site needs a prior refactor of its own size anyway — its six sub-activities declare **no exits** and appear in no graph edge (`workflow.yaml:65-80`), and its roster entries key on `agent_id` rather than `id` (`dispatch-sub-agents/TECHNIQUE.md:12-14`), so `gather-results`' object normalisation returns undefined for them. *Trigger: the substrate primary batch, once its sub-activities are on the graph — and it is the strongest shape match in the corpus, so the trigger should be expected rather than hypothesised.*

**No relaxation of the batch bound, and no width bound derived from it.** The bound cannot refuse an instance and the specification's position holds identically: `batchState` exempts "a scope with no activity yet" (`src/utils/batch.ts:154`) and `batchRefusal` returns undefined for an activity the scope already holds (`:176`), so an instance scope is fresh, asks for its first activity, and is admitted whatever the width; on the retire call `_meta.batch` reports `activities: 1`. Keying `batchActivities` on the composite keeps each instance at one distinct activity, and keying it on the base would too, so no refusal either way. Say so rather than leaving a reader to wonder whether width is bounded by it — it is not, which is exactly why `maxInstances` is required.

**No per-instance Progress row.** All N instances share one `artifactPrefix`, and a runtime-width instance set is not seedable into the row-ownership map, whose own rule is that a row absent from the map is unselectable. The fanned activity keeps its single row, its instance artifacts get none — `planning-readme.md:81` already establishes that an artifact can exist without a row — and the join's artifact is what the row links. *Trigger: a fan whose width and unit ids are static and whose per-instance progress is worth seeing; `item_match` already expresses the selection with no new construct.*

**No `worktree` isolation for a fanned activity.** `isolation-mode-write-boundary` (`orchestration-patterns/TECHNIQUE.md:56-58`) is a rule a graph fan cannot honour: §11 already records that a fan's branches share one working tree and that nothing enforces read-only. The no-checkout rule is what makes that safe rather than merely hoped for. *Trigger: a worktree-per-branch primitive, which is a separate design.*

**No change to `orchestration-patterns::dispatch-workers`.** Its concurrency selection remains unexecutable at every one of its binding sites, because every one is an activity executed by a dispatched worker holding no dispatch primitive (`depth-1-only`, `spawn-agent.md:44-46`). §10 unchanged. This design does not repair it; it serves the demand those files were written for, at the layer where the primitive is.

### serves 657

## The verdict in one line

**Four of the seven binding sites hold a genuine instance fan this design executes; one needs the mixed form named as the upgrade trigger; two want ordinary graph edges and never wanted a fan.** The capability does not ship dormant — but its day-one caller is not any of the seven, and the honest accounting of why matters more than the count.

**What made the difference, and it is worth naming before the table.** Because the graph names a *collection variable* rather than an authored key list, an instance fan's width is the collection's **runtime length**. Four of these sites decompose their unit list during the run — `01-orchestrator-workers.yaml:4` describes itself as "Runtime-decompose a goal into work units" — so a static-width design would have foreclosed them. This one serves them, bounded by `maxInstances` above and by `decompose-work-units`' own `effort_cap` below.

---

### 1. `meta/activities/patterns/01-orchestrator-workers.yaml:43` — **SERVED, at the cost of its identity as a borrowable activity**

The whole pipeline is `decompose-work-units` → `compose-worker-briefs` → `dispatch-workers` → `gather-results` (with `expected_ids: work_units` already bound at `:48-49`) → `synthesise-results`. Under this design it becomes three graph nodes: `decompose-work-units` in a source activity (which already declares `work_units` as an ordered array of `{ id, brief, tools_hint? }` at `:16-18` — exactly a fan's `over` collection), the per-unit operation in the fanned activity, and `gather-results` + `synthesise-results` in the join. `expected_ids: work_units` binds **unchanged**.

What it loses: you cannot borrow a graph shape. A consumer authors three graph entries instead of one `activities:` line. `compose-worker-briefs` is displaced rather than served — it builds a per-unit *prompt* carrying the unit's brief (`:34-38`), and under a graph fan the prompt is `compose-prompt`'s, where putting the work in the prompt is what `context-travels-as-state` forbids. `patterns/README.md:7`'s "These activities cover **in-activity fan-out / consolidate** only" becomes the accurate description of what stays behind, and the inventory row at `schema-construct-inventory.md:38` gains the graph-fan alternative beside the borrow.

### 2. `meta/activities/patterns/02-supervisor.yaml:48`, with `dispatch_concurrency: 1` at `:50` — **SERVED BUT POINTLESS; not demand**

One classified lane, one worker: `work_units` is declared as "The selected lane as a one-element ordered array" (`:20-22`). An instance fan of width 1 is legal and would run, but the construct that actually serves this site is a **plain graph edge to the lane activity**, which `dispatch-activity` executes today. Its dispatch step is unexecutable now and the fix is an ordinary destination, not a fan. The specification should not count this as demand the fan serves.

### 3. `meta/activities/patterns/04-isolated-fan-out.yaml:47` — **SERVED for `context` isolation; NOT SERVED for `worktree`**

`context` isolation is exactly what a fan gives: each instance is a fresh worker context with its own delivery scope. `isolation_mode` (`:44`) is bound through `compose-worker-briefs`, and under a graph fan the `context` half becomes structural rather than instructed.

`worktree` is not served, and the rule that says so is explicit: `isolation-mode-write-boundary` (`orchestration-patterns/TECHNIQUE.md:56-58`) requires that "Under `worktree` isolation, workers must create/use their worktree before mutating files", while §11 records that a fan's branches share one working tree and nothing enforces read-only. The no-checkout rule (enforcement row 72) makes the shared tree safe by forbidding branch writes to it, which is the opposite of what `worktree` isolation asks for.

The `require-complete` validate at `:54-59` becomes **structurally satisfied**: §5.2 step 4 enters the join only on the call that empties the frontier, so no expected id can be missing there. That is a real gain and also a caution — the specification must not advertise `completeness` as the missing-instance detector, because at a join it is constant. What stays live is `dispatch_manifest`'s `empty` row for an instance that returned an envelope with no writes.

### 4. `meta/activities/patterns/05-lead-researcher.yaml:47` and `:76` — **SERVED, at a stated cost on the second**

`:47` is direct: `plan-research-questions` produces the units, the fan runs one worker per question, the join binds `gather-results` (`expected_ids: work_units`, already at `:52-53`) then `synthesise-results` then `assess-research-gaps`.

`:76` sits inside `while has_research_gaps` with `maxIterations: 3` (`:60-69`). The follow-up round requires that in-activity `while` to become a **graph cycle**: the join assesses gaps and its exit routes back to the fan's source. Legal — L6 forbids a *branch* routing onto itself, not a join routing back to a source — and the container is materialised afresh on each re-entry, so round 2's outputs land in clean slots rather than half-overwriting round 1's. **What is lost is `maxIterations: 3`**: a graph cycle has no declared ceiling. The replacement is ordinary state — a round counter the join writes and an exit predicate `research_round < 3 && has_research_gaps`, which the `when` dialect already expresses (`src/schema/activity.schema.ts:75`). That is a real trade and the migration must state it, because the ceiling moves from a schema field to authored state.

### 5. `substrate-node-security-audit/activities/02-reconnaissance.yaml:37` and `:49` — **NOT SERVED, and does not want to be**

Two sequential single-agent dispatches with a file-verification step between them (`:38-43` verifying `r-crate-map.json`, `r-function-registry.json`, `r-reconnaissance-data.json`; `:50-55` verifying `s-architectural-analysis.json`), and the second's briefs composed only after the first's files land (`:44-46`). That is a **chain of two activities**, not a fan. The fix is two graph edges, which `dispatch-activity` executes today. Counting it as fan demand would be wrong.

### 6. `substrate-node-security-audit/activities/03-primary-audit.yaml:48` (plus `:75`, `:81`, `:87`) — **PARTIALLY SERVED; needs the mixed form this design names as its upgrade trigger**

This is the **widest and strongest-shaped** fan-out in the corpus, and it is the one site this design does not serve as authored. `dispatch-all-agents` runs the whole `agent_roster` in one batch: seven instances of `sub-crate-review`, one `sub-static-analysis`, two instances of `sub-toolkit-review` — the roster named literally at `:69` (ten expected output files) and again as a workflow rule at `workflow.yaml:19`. **One destination cannot carry three fans.** Options: three sequential fans, which serialises what runs concurrently today and is a regression; or a list destination whose members are themselves instance fans, which is declined with its reasons and this site as its named trigger.

Everything else about the site is right, which is what makes the omission worth stating precisely rather than glossing:
- All six sub-activities are gate-free and `required: false`.
- The per-instance parameter is one value, `agent_id`, whose input description already says it "also names the persisted output file" (`execute-sub-agent.md:12-14`).
- The artifact is `{agent_id}.json` with `audience: agent` (`:26-32`) — **this design's sanctioned artifact deviation, already authored, already guide-mapped at `resources/README.md:35`, already green under `check-audience` and `check-artifact-guides`.**
- No sub-activity binds a git or register operation.
- The join's gather contract is **already bound**: `gather-results` with `expected_ids: worker_briefs` at `:52-54`.

Three named changes it needs regardless of the mixed form: the six sub-activities must declare an exit each and enter the graph (today they declare **none** and appear in no graph edge, `workflow.yaml:65-80`), which newly subjects their reads to `unreachable-read` and `review-mode-gating`; the roster entries must gain an `id`, because they key on `agent_id` (`dispatch-sub-agents/TECHNIQUE.md:12-14`) and `gather-results`' object normalisation ("object → `.id`", `:40`) returns undefined for them; and `03-primary-audit` splits into a source (compose), the fan, and a join (gather, verify, collect, verify-files). `:75` (verification), `:81` (gap re-dispatch) and `:87` (merge) are single sequential workers and become ordinary activities.

### 7. `cicd-pipeline-security-audit/activities/03-primary-scan.yaml:27` (plus `:50`, `:56`, `:62`) — **SERVED, and this site corroborates the design directly**

`dispatch_concurrency: scanners_assigned` (`:26-29`), where `scanners_assigned` is declared `type: number, defaultValue: 0` and described as "Count of per-submodule scanner agents assigned during reconnaissance" (`02-reconnaissance.yaml:10-13`) — **the site already parameterises its fan width from a runtime session variable, which is exactly what an instance fan's width is.** It is the strongest independent corroboration that naming a collection rather than an authored key list is the right choice; a static-width design would have failed here on the single most fan-shaped attribute the site has.

`gather-results` is already bound with `expected_ids: worker_briefs` (`:33-35`); the per-instance artifact is `{scanner_id}.json` with `audience: agent` (`cicd-pipeline-security-audit/techniques/execute-sub-agent.md:22-28`), guide-mapped at `resources/README.md:34`; the activity is gate-free. Named changes: `maxInstances` authored as the ceiling; the exit's gates moved to the join, because `scan-verified` gates on `verification_complete == true && merge_complete == true` (`:71-74`) and both are written by **dispatched workers** rather than by this activity; the scanner briefs to carry an `id`. `:50`, `:56` and `:62` are single sequential workers → ordinary activities.

---

## What this does not do, said plainly

**It does not repair `dispatch-workers`.** Every one of its fifteen binding sites remains an activity executed by a dispatched worker holding no dispatch primitive — `depth-1-only` (`spawn-agent.md:44-46`) is why both of its concurrency branches are unreachable from where they sit, and that is unchanged. §10 stands. What this design does is serve the demand those seven files were written for, **at the layer where the primitive exists**: the orchestrator, which is the one agent holding it (`workflows/meta/activities/03-dispatch-client-workflow.yaml`, the one activity whose steps the top-level agent executes inline).

**And it does not leave the vocabulary half-served without saying which half.** `decompose-work-units` gains an executing caller, unchanged, at the fan's source. `gather-results` gains its **first** executing caller and is the construct an instance fan *requires* rather than merely admits, because a runtime width cannot be spelled as N literal reads. `synthesise-results` follows it in the join, unchanged. `compose-worker-briefs` is displaced at this layer by `compose-prompt` and survives only for in-activity fan-out, which still has no executor. `scatter-gather`'s parallel mode likewise stays unexecutable inside an activity; its sequential mode remains correct and free, and `parallelism-is-optimisation` (`scatter-gather.md:38-40`) is the rule that says choosing it is not a defect.

## Establishing the day-one caller, since none of the seven is the cheapest one

The seven sites are the *shape* the capability was asked for. The **first adopter** is `prism/activities/07-dispute-pass.yaml`, which is an instance fan of width 2 already written out by hand: gate-free, one exit, one technique step whose `## Outputs` declare `dispute-lens-a.md` and `dispute-lens-b.md` as two literal per-instance artifacts plus a synthesis, no register, no git, and a guide-map row at `prism/resources/README.md:292` that already groups the lens artifacts. Migrating it removes two hand-written instances in favour of one templated one, needs no gate removed and no loop promoted, and its per-lens work is a full analysis pass — long enough that one forgone payload buys real wall clock and real context isolation.

The **second** is `analyse-challenge::challenge` at seven work-package activities — the corpus's one authored instance fan-out ("Build one work unit per entry in `{challenge_perspectives}`… Each unit receives only the concern set … **plus its perspective name**", `challenge.md:26-28`), gate-free in its loop body at all seven sites, artifact-free, and with its perspectives list currently duplicated as six identical literals. It is the strongest shape match and the weakest cost match: its host construct is a step-level `doWhile` with `maxIterations: 10`, so adoption promotes the loop to a graph cycle and replaces a **free** in-context iteration with up to 10 × (1 + N + 1) dispatches. Worth doing for the declaration cleanup and the bounded contexts; not worth doing first.

### residual risks

- **An instance fan is token-negative against its real alternative, and by roughly twice the distinct fan's margin.** A distinct fan's sequential alternative pays three activity payloads anyway, so its premium is only the forgone collapse — 39,466 characters, 17.7% (docs/dispatch-model.md:86). An instance fan's alternative is ONE activity whose loop body runs N times in one worker, which pays one delivery and reuses the bundled loop-body technique per iteration (`workflow-tools.ts:1406`). So an instance fan's premium is the payload itself, N-1 times, plus N-1 harness establishments the dispatch model rates at two-to-four times the collapsing saving. Substituting the standalone mean of 87,324 characters (there is no measured figure for a fanned activity, and this substitution must be stated as one), a three-instance fan costs roughly 253,000 to 332,000 characters, 63,000 to 83,000 tokens — about twice the distinct fan's stated 118,000-197,000. It is a latency-and-isolation purchase, not an efficiency one, and the counterweight belongs beside the number: an in-context loop of N units accumulates all N reasoning passes in ONE context and nothing bounds that, because the batch budget counts delivered characters and not generated ones. Every figure is a floor for the same reason the benchmark's is, and must be re-derived against a fresh `npm run bench:batch` before any specification prose quotes it.
- **An instance fan trusts the orchestrator's index arithmetic, and the protection is a worker rule plus a history event rather than a refusal.** The server serves the projection for the index the caller names and lands the outputs in the slot the caller names, so a wrong index would produce duplicated work and a silently uncovered unit. Two things narrow it, neither closes it: `get_activity` reports the instance-qualified id back, so `verify-dispatched-activity` compares `challenge-pass#0` against `challenge-pass#2` and stops — which is why this design chose to compose the response id rather than report the base; and `activity_redelivered`, keyed on the composite, fires exactly on a duplicate claim rather than N-1 times per correct fan. But the worker rule is a worker rule, and the event is a reading. *Trigger:* an observed duplicate claim; the fix records the failed worker's outcome so a replacement can be told from a duplicate, and refuses the second identity.
- **A missing instance is unrepresentable at the join, and the gather's completeness verdict is therefore constant there.** §5.2 step 4 enters the join only on the call that empties the frontier, so `gathered_results.completeness` cannot report `incomplete` at a join. That is correct behaviour and a misleading affordance: an author reading `gather-results`' contract will expect the manifest to detect a missing instance and it cannot. What is live is the `empty` row for an instance that returned an envelope with no writes. The specification must say this rather than advertise the manifest as the missing-instance detector, and `04-isolated-fan-out.yaml:54-59`'s `require-complete` validate becomes structurally satisfied rather than protective.
- **Instance-grain availability is not statically decidable, and only the width bound is.** `unreachableReads` proves a read is satisfied on every arrival at CONTAINER grain — a branch contributes one flat bag name whatever landed under it, which is what keeps the lattice N-independent. Whether slot k was filled is a runtime fact: N is a collection length. L14 bounds an authored index against `maxInstances`, which is the only instance-grain check that exists, and it is decidable only because `maxInstances` is authored. A join reading `{challenge_pass_outputs.2.result.x}` when the collection held two elements reads undefined, and nothing detects it. The mitigation is that handing the whole container to `gather-results` is the recommended read form precisely because it needs no authored index.
- **The arrival meet is a new operator in a hard-zero guard with no ledger, and instances add two traps to §6.6's three.** A bug in it is silent. The two new ones: the flatten must re-dedupe (an instance fan pushes its source into the branch's predecessor list once per member, and missing any duplicate lets the intersection wipe the union straight back out), and the union arrival must be iterated over distinct branch ids. Fixture tests are the whole protection, and the one mechanical proof worth insisting on is that the finding set is invariant under changing a fixture fan's `maxInstances` from 2 to 12.
- **A branch that cannot proceed without a decision still has no conforming way to say so, and instances make the gap shared rather than per-branch.** `finalize-activity` defines two envelopes and `reject-partial-worker-result` accepts only those two, while the recovery ladder refers to a blocked signal no envelope carries. Instances neither create nor close this. What they add is that the best available report — a completion on a blocked or abort exit the activity declares — is shared by all N, since they run one definition: either every instance can report blocked or none can. Pre-existing, made load-bearing by the gate ban.
- **Three or more concurrent instance contexts share one working tree, and the specification's fallback attribution is unavailable.** `commit-and-persist` derives its paths from `git status --porcelain` over one tree, which cannot attribute a change to a branch — and for instances §11's fallback of attributing by activity id does not exist, because N instances share one id. `persist-the-fan-before-any-branch-returns` answers the commit with one commit naming every instance; the no-checkout rule (enforcement row 72) is what makes that correct rather than hoped for. What nothing catches is a git command failing INSIDE a branch: git serialises index mutation with `.git/index.lock` so the index is not corrupted, but nothing retries a failed `git add` (only the push is retried, `commit-and-persist.md:31`), so a lock collision surfaces as an unhandled command failure inside one instance.
- **The templated instance artifact is created and never updated, and its collision check is not literal-name-decidable.** `write-artifact.md:50` makes a token-templated name an intentional series — which is what makes the deviation safe from the mint conflict, and also means a second visit to the same fan re-resolves the template and CREATES rather than updates. And if two elements' ids ever interpolate to one value, they collide silently, because `fan-artifact-collision` decides literal names and this name is not literal. The fan-enter's element-id refusal narrows this; it does not close it. §11's own residual on templated names survives in this reduced form.
- **The fan parameter is visible on the delivery that carries it and absent from the bag, and a worker re-reading the bag finds the collection instead.** `inspect_session { view: 'variables' }` is deliberately not overlaid, because both it and `get_workflow_status` serve one shape to both roles and the orchestrator's own `state` for `compose-prompt` substitutions cannot be per-instance. The asymmetry is visible rather than silent — the projection names itself on the response — but it is an asymmetry, and an author reading the rendered variable set sees `challenge_perspectives` and `challenge_pass_outputs` and not `challenge_pass_unit`. `variable-binding`'s one added precedence sentence is the whole documentation of it.
- **A step gated on the fan parameter degrades to lazy fetching unless `bagAtOpen` is overlaid.** The eager-bundling gate reading uses `state.variables ?? {}` at `src/tools/workflow-tools.ts:1205`; unoverlaid, a step gated on the instance's own unit is unanswerable at delivery and stays lazy (`lazyUnanswered`, `:1222`). It degrades rather than breaks — a cost, not a defect — but it is the kind of cost that is invisible until someone measures a fan's delivery and finds it smaller than expected.
- **`maxInstances` is a required policy number and its default is a policy number, and the specification must say so.** §10 declined a width cap on the grounds that it would be 'a policy number with no derivation behind it and no configuration home'. The configuration half is fully answered — `src/config.ts` already holds two numbers of exactly this kind, with `docs/dispatch-model.md` named as the home for their measurements. The derivation half is half-answered: 16 clears the widest authored corpus site (ten) with headroom, and that is a calibration rather than a measurement. What changes the balance is that a distinct fan's width is countable in the file at authoring time while an instance fan's is a runtime collection length, so nothing bounds it unless something is authored.
- **The mixed form has a verified caller and is not built.** The corpus's strongest-shaped fan-out — the substrate primary batch, ten workers over three distinct activities with repeats in one turn — is served by this design only as three sequential fans, which serialises what runs concurrently today. Admitting it costs one type change and one load rule; it is declined for arity-rule cost and because the site needs a prior refactor of its own size. Recording it as a residual rather than only as a not-adding entry, because the trigger should be expected rather than hypothesised.
- **Trace segments stay per session rather than per delivery scope.** A fan of N produces 1 + N segments that partition an interleaved multi-instance event stream at arbitrary points. Stamping the retiring instance fixes the mislabelling — and is strictly better than the distinct fan's stamping, where nothing prevented two segments carrying one activity's id — but the interleaving is not separable from the segment boundaries. §11 unchanged.
- **Promoting an in-activity loop to a graph cycle loses `maxIterations` at every adopting site.** A graph cycle has no declared ceiling; the replacement is an authored round counter plus an exit predicate, which the `when` dialect expresses but which no schema field enforces. This bites `05-lead-researcher.yaml:76` (`maxIterations: 3`) and all seven `analyse-challenge` sites (`maxIterations: 10`). The ceiling moves from a schema field to authored state, and Encode Constraints as Structure loses ground there — worth naming as the one place this design trades structure for capability rather than gaining both.
- **The dry-walk budget may no longer clear after adoption**, and a short streak is reported as unreached options — a definitions defect — rather than as a budget shortfall. The coverage test's own comment says the plateau is a property of the graph and has to be re-measured whenever the graph grows, and a fan multiplies the branch orderings the enumerator produces. Re-measure from the current 50 and stamp it in the adoption commit.

## Instance fan: running one activity once per work unit

### work unit source

## The schema change: a destination form that names one activity and the collection it runs once per element

### What the fan names, and where the names come from

The specification widened a destination from one activity id to a list of at least two (`README.md:92-105`). An instance fan is a **third** destination form: an object naming one activity, the collection in the bag it runs once per element of, the name each instance reads its own element at, and the width it admits. A fan's *activity* is a routing fact and stays in the graph; the fan's *units* are data and stay in the bag; the graph names the collection, not its members.

The four field names are the loop's own. `LoopStepSchema` (`src/schema/activity.schema.ts:152-164`) declares `over` — `'Collection expression iterated by a forEach loop.'` (`:159`) — and `variable` — `'Current-item variable bound each iteration.'` (`:158`) — and the file's own header states the division of labour at `:149-151`: "`over`/`variable` the collection and the item, `maxIterations` the ceiling". A graph-level fan asks the same questions of the same shape, so it spells them the same way. Convention Over Invention (`design-principles.md:41-43`).

### The exact zod, in `src/schema/workflow.schema.ts` beside `GraphSchema` (`:51`)

```ts
/** A unit id: the slug that names one instance. It names a frontier entry, a slot in the fan's
 *  container, and a segment of the artifact filenames that instance writes, so it is admissible
 *  in all three — lowercase, alphanumeric, `_` or `-`, and never carrying the instance separator. */
export const UNIT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

/**
 * A destination that runs one activity once per element of a collection: an instance fan. `over`
 * names the collection in the variable bag, `variable` the name each instance reads its own element
 * at, and `maxInstances` the widest fan this destination admits — the four questions a forEach loop
 * answers, asked at graph grain. The element's own id names the instance: the element itself where
 * it is a string, its `id` field where it is an object — the normalisation
 * `orchestration-patterns::gather-results` already declares, so the fan and the gather that reads it
 * derive one id list by one rule.
 */
export const InstanceFanSchema = z.object({
  activity: z.string().describe('The activity every instance of this fan runs.'),
  over: z.string().describe('The collection this activity runs once per element of. A dotted path reads into a nested object; its head is the bag name the fan\'s source activity produces.'),
  variable: VariableNameSchema.describe('The name each instance reads its own element at. Declared among the branch activity\'s reads, and declared in this workflow\'s `variables[]` with no starting value — a starting value would give every context the one value the fan exists to differ on.'),
  maxInstances: z.number().int().min(2).describe('The widest fan this destination admits. A collection longer than this is refused when the fan is entered, rather than truncated; a ceiling of one is a plain destination spelled a second way.'),
}).strict();
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

/** One member of a destination: an activity id, or an activity with the collection it fans over. */
export type Branch = string | InstanceFan;

/**
 * Exit bindings: activity id → exit id → destination. A destination names one activity, lists
 * several branches, or names one activity and the collection it runs once per element of. A list
 * and an instance fan are both fans: their branches run together, one worker to each, and the run
 * enters the single activity all of their own exits name once the last of them returns — so the
 * barrier is read off the bindings the graph already carries and nothing declares it. A destination
 * of TERMINAL_SENTINEL ends the run without landing on an activity. Every exit every activity in
 * the workflow declares is bound here; an unbound exit, an unknown exit and an unknown destination
 * each fail the load, so the graph and the activities cannot drift apart.
 */
export const DestinationSchema = z.union(
  [
    z.string(),
    z.array(z.union([z.string(), InstanceFanSchema])).min(
      2,
      'a fan names at least two branches; an exit that leads to one activity names that activity, and an exit that runs one activity once per element of a collection names that activity and that collection',
    ),
    InstanceFanSchema,
  ],
  {
    errorMap: () => ({
      message: 'a destination is an activity id, `__terminal__`, a list of at least two branches, or an object naming one activity and the collection it fans over (`{ activity, over, variable, maxInstances }`)',
    }),
  },
);
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The branches one binding runs — one for a plain destination, several for either fan form. */
export const destinationBranches = (d: Destination): Branch[] => (Array.isArray(d) ? d : [d]);

/** The activity a branch runs. */
export const branchActivity = (b: Branch): string => (typeof b === 'string' ? b : b.activity);

/** Whether a branch runs its activity once per element of a collection. */
export const isInstanceFan = (b: Branch): b is InstanceFan => typeof b !== 'string';

/** The activities one binding can send the run to — one for a plain destination, several for a fan. */
export const destinationTargets = (d: Destination): string[] =>
  destinationBranches(d).map(branchActivity);

/** Whether a destination runs several branches together. */
export const isFan = (d: Destination): boolean => Array.isArray(d) || typeof d === 'object';

/**
 * The bag key an activity's outputs land under when the graph runs it as a plain branch of a fan:
 * its id in snake case with `_outputs` appended.
 */
export const branchKey = (activityId: string): string => `${activityId.split('-').join('_')}_outputs`;

/**
 * The bag key an activity's per-instance outputs land under when the graph fans it over a
 * collection: its id in snake case with `_instances` appended. A container distinct from
 * `branchKey`, because its shape is different — one entry per unit, keyed by that unit's id — and
 * one name whose shape depended on how a given workflow fanned the activity would give a borrowed
 * activity a different read form in each workflow that borrowed it.
 */
export const instanceKey = (activityId: string): string => `${activityId.split('-').join('_')}_instances`;

/** The unit id an element of a fan's collection carries: itself where it is a string, its `id`
 *  field where it is an object. `gather-results`' own normalisation, implemented once. */
export const unitId = (element: unknown): string | undefined =>
  typeof element === 'string'
    ? element
    : element !== null && typeof element === 'object' && typeof (element as { id?: unknown }).id === 'string'
      ? (element as { id: string }).id
      : undefined;
```

The `graph` field's `.describe()` (`src/schema/workflow.schema.ts:67`) takes one further sentence, because that text reaches the orchestrator's workflow summary, the generated JSON schema and the published site: *"A destination naming one activity and a collection runs that activity once per element of it, one worker to each instance, each instance landing its outputs in the fan's container under its unit's own id."*

### The generated JSON shape

`schemas/workflow.schema.json` is generated by `npm run build:schemas` and never hand-edited. Under the root reference strategy (`scripts/generate-schemas.ts:25`) the nested destination becomes:

```json
"graph": {
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "additionalProperties": {
      "anyOf": [
        { "type": "string" },
        {
          "type": "array",
          "minItems": 2,
          "items": {
            "anyOf": [
              { "type": "string" },
              { "$ref": "#/definitions/instanceFan" }
            ]
          }
        },
        { "$ref": "#/definitions/instanceFan" }
      ]
    }
  },
  "description": "<the describe text above>"
},
```

```json
"definitions": {
  "instanceFan": {
    "type": "object",
    "additionalProperties": false,
    "required": ["activity", "over", "variable", "maxInstances"],
    "properties": {
      "activity":     { "type": "string", "description": "…" },
      "over":         { "type": "string", "description": "…" },
      "variable":     { "anyOf": [{ "type": "string", "pattern": "^[a-z][a-z0-9]*(_[a-z0-9]+)+$" }, { "enum": ["…"] }], "description": "…" },
      "maxInstances": { "type": "integer", "minimum": 2, "exclusiveMinimum": false, "description": "…" }
    }
  }
}
```

`items` is a non-empty subschema (an `anyOf` of two members), so the generated-schema assertion that fails on an empty subschema at an `items` key (`tests/generated-schemas.test.ts:44-49`) stays green. The site's row renderer never recurses into `additionalProperties` (`scripts/generate-site-data.ts:498-517`), so the nested destination needs no site work beyond the description pickup.

**Corpus impact of the widening: none.** A union accepts every existing string, and the pinned corpus carries 0 list-valued and 0 object-valued edges (`README.md:156`, census at submodule `5f92dc06`).

### How a fan is authored

One activity over one collection:

```yaml
graph:
  reconcile-assumptions:
    done:
      activity: challenge-pass
      over: challenge_perspectives
      variable: challenge_perspective
      maxInstances: 6
  challenge-pass:
    done: combine-challenges
  combine-challenges:
    converged: plan-prepare
    unresolved: reconcile-assumptions
```

A mixed fan — several distinct activities, two of them fanned over collections of their own. This is the shape the corpus's widest authored fan-out needs (`workflows/substrate-node-security-audit/activities/03-primary-audit.yaml:48`, whose roster is A1-A7, B, D1, D2 across three sub-activities, named as a workflow rule at `substrate-node-security-audit/workflow.yaml:19`):

```yaml
  compose-primary-briefs:
    done:
      - activity: sub-crate-review
        over: crate_lanes
        variable: crate_lane
        maxInstances: 12
      - sub-static-analysis
      - activity: sub-toolkit-review
        over: toolkit_lanes
        variable: toolkit_lane
        maxInstances: 4
```

Admitting an instance fan as a *member of a list* is four lines of derivation (`destinationBranches` / `branchActivity` above) and it is what makes that site expressible at all. Without it the corpus's strongest first adopter is inexpressible and the capability ships without a day-one caller — which is the failure this design is judged against. It also improves the site it serves: `agent_roster` entries today carry `activity_id` (`substrate-node-security-audit/techniques/dispatch-sub-agents/TECHNIQUE.md:12-14`), which is routing carried in data; splitting the roster into per-activity lane collections moves that routing into the graph, which is Keep Orchestration in Structure (`design-principles.md:93-95`).

### One specification decision this changes, quoted

> **§10:** "**No per-branch metadata in the graph.** A fan destination is a list of activity ids and nothing else. Everything else a branch needs is derived: its key from its id, its destination from its own bindings, its identity at dispatch." (`README.md:674`)

That sentence is true of a fan of *distinct* activities, where every branch carries its own id and every derivation keys on it. An instance fan has no per-branch id, so there is nothing to derive one from, and the fan itself must carry what tells its instances apart. Three answers.

**First, the metadata is per fan, not per branch.** One collection name, one parameter name, one ceiling — and *no per-instance entry appears in the graph at all*. Every derivation §10's sentence protects survives verbatim: the container from the activity id (`instanceKey`), the destination from the branch's own bindings, the identity at dispatch, and now the instance's own id from the collection element by `gather-results`' declared rule.

**Second, the alternative is metadata too, merely unnameable.** The only other way to spell an instance fan in a list of ids is to repeat one id (`done: [challenge-pass, challenge-pass, challenge-pass]`), whose discriminator is list position. Position is per-branch metadata, implicit, and unnameable by an author, a guard, a join or a refusal message — and it is dead on arrival for a second reason given under `isolation` below: no evaluator in the tree can project an ordinal into a read address, so a positional instance cannot be handed its work unit.

**Third, "run this once per element" is a routing fact and the graph is routing's one home.** Maximize Schema Expressiveness (`design-principles.md:33-35`) asks for the most specific formal construct the schema provides; today the schema cannot carry this fact at all, so authors express it as a step inside an activity — which is why `analyse-challenge::challenge` builds its own work units in prose (`workflows/work-package/techniques/analyse-challenge/challenge.md:26`) and why every `dispatch-workers` bind site sits where the dispatch primitive is not.

### What the instance receives, and why exactly one value

The owner's fixed input is one parameter per instance. The loop already answers this and nothing more: an iteration is bound the current element at the name `variable` declares, with no index, no count and no sibling values. The corpus reads it as a bare name or a dotted projection — `variable: current_unit`, `over: analysis_units`, body binding `target_content: "{current_unit.target}"` and gating `when: current_unit.pipeline_mode == 'full-prism'` (`workflows/prism/activities/02-adversarial-pass.yaml:23-24,32,38`), which works because nested objects land whole and the structured evaluator walks the path (`workflows/meta/techniques/variable-binding.md:29,31`).

So an instance receives **one value at one name**. Where the element is a string the value is the unit id itself; where it is an object (`{ id, brief }` — `orchestration-patterns::decompose-work-units`' declared output, `decompose-work-units.md:20-24`) the instance receives that object and projects fields off it by ordinary dotted read. "Exactly one value" is honoured without forbidding a structured element, and `gather-results`' `expected_ids` normalises both shapes with nothing added (`gather-results.md:16-18,40`).

### instance identity

## The frontier entry, how a worker learns which instance it is, how one retires, and why the barrier is untouched

### The entry stays a bare string; the string gains the unit's id

The specification's frontier, quoted whole (`README.md:222-233`):

> ```ts
>   /**
>    * The activities in flight. One entry on an ordinary walk; one per branch while a graph fan runs.
>    * …
>    */
>   frontier: z.array(z.string()).default([]),
> ```
> "Nothing else goes on an entry. A per-entry join is a copy of a graph fact the handler already loads; a per-entry timestamp is a copy of the entry event already in the history; a per-entry worker identity forces a distinct call outcome for a replacement worker, which section 5.4 gets for free without one."

**That declaration is not amended.** A frontier entry for an instance is the activity id qualified by the unit's own id: `challenge-pass#stakeholder-gap`. Three entries of one fan are three *distinct strings*, so `z.array(z.string())` stands, the canonical key ordering stands beyond the spec's own rename (`src/utils/session/store.ts:113-121`), the legacy converter stands beyond the spec's own change (`src/utils/session/migration.ts:182,243`), and the resolver — "the one it names when the frontier holds it, or the sole entry when a call names none and only one is in flight … Undefined otherwise: the caller refuses rather than guessing" (`README.md:240-246`) — is **not amended at all**. The problem it could not answer dissolves rather than being answered: `from_activity: 'challenge-pass'` matches nothing, and `from_activity: 'challenge-pass#rejected-paths'` matches exactly one entry.

The spelling is the corpus's own. `CHECKPOINT_INSTANCE_SEPARATOR = '#'` exists for precisely this shape, and its comment states the reasoning (`src/loaders/workflow-loader.ts:441-449`): "A checkpoint inside a forEach/while loop is defined once but reached N times; yielding it as `<baseId>#<instance>` (e.g. `assumption-decision#RE-1`) gives each iteration a distinct checkpoint id — so the response key … no longer collides and iterations 2..N are recorded/prompted distinctly." The discriminator there is *the work unit's own id*, not an ordinal, and `checkpointBaseId` splits on the first separator with `indexOf` (`:452-455`).

**The rename this needs, and it is the whole of the change to that module's convention.** `CHECKPOINT_INSTANCE_SEPARATOR` becomes `INSTANCE_SEPARATOR` — one separator, one convention, two grains — and gains two siblings beside `checkpointBaseId`:

```ts
/** The base activity id — the portion before the per-instance discriminator, if any. */
export function activityBaseId(entry: string): string {
  const i = entry.indexOf(INSTANCE_SEPARATOR);
  return i === -1 ? entry : entry.slice(0, i);
}

/** The unit id an instance-qualified frontier entry names, or undefined for a plain entry. */
export function activityInstanceId(entry: string): string | undefined {
  const i = entry.indexOf(INSTANCE_SEPARATOR);
  return i === -1 ? undefined : entry.slice(i + 1);
}
```

Three call sites move with the rename: the import and use in `src/utils/validation.ts:6,89`, the two uses in `getCheckpoint` (`workflow-loader.ts:473-474`), and the test at `tests/workflow-loader.test.ts:13,243-246`.

**Base resolution goes in one function, not at ten call sites.** `getActivity` compares an id exactly (`workflow-loader.ts:437-439`) and is called ten times across `src/` and `scripts/`. It gains a base fallback mirroring `getCheckpoint`'s, twenty-five lines below it in the same file (`:464-475`) — an exact match wins; otherwise an instance-qualified id resolves to its base definition. `readActivityRaw` compares a filename-derived id exactly (`:606`, ids parsed by `src/loaders/filename-utils.ts:6-10`) and takes the same fallback. `getExitBindings` and `exitDestinations` base-normalise their `fromActivityId` (`:496-508`), which is what keeps the graph lookup answering for an instance — a composite key would miss the graph record, and the two advisory validators that read through it would go *silently disabled* rather than wrong (`validateReportedExit` returns `null` on an empty binding list, `src/utils/validation.ts:243-244`; `validateActivityTransition` reads `exitDestinations` at `:45`). One convention, one function each, ten call sites untouched.

### What the composite buys beyond identity

Every history event's `activity` field is a plain optional string (`src/schema/state.schema.ts:81-91`). Writing the composite into it makes six existing per-activity projections instance-aware with no code change at all:

| Projection | Site | Keyed on the base id instead |
|---|---|---|
| `activityWallClockMs` — first entry to last exit | `src/tools/workflow-tools.ts:359-379` | N instances collapse into one span from the first entry to the last exit: a figure describing the fan's wall clock while claiming to describe an activity's |
| `activities_without_usage` | `:474-475` | `completedActivities` dedups to one entry (`:772-774`), one usage row satisfies it, and N−1 missing figures are invisible |
| `batchActivities` — distinct ids per scope | `src/utils/batch.ts:72-86` | unchanged either way; each instance scope holds one activity |
| `validateTechniqueFetches` — visit scoped to the last `activity_entered` | `src/utils/validation.ts:198-216` | instance A's technique fetches credit instance B's manifest; the function already filters on `data.agentId` at `:213`, and the composite makes the activity half agree with the agent half |
| `priorDeliveryScope` / `activity_redelivered` | `src/utils/dispatch.ts:62-77`, recorded at `src/tools/workflow-tools.ts:1526-1534` | a **correct** fan of N fires the replacement signal N−1 times, burying the one event that means "a worker was replaced, or two contexts claim one slot" in noise generated by construction |
| `projectHistory` milestones | `src/tools/workflow-tools.ts:281-288` | milestones name one activity N times |

The last row is worth stating on its own: keyed on the composite, `activity_redelivered` fires exactly for a replacement and for a duplicated instance key. One key change; two failures made legible.

### Re-deriving §5.1's three refusals under instances

- **A per-entry join.** Still refused, and the spec's reason holds verbatim: all instances of one activity share that activity's exit bindings, and `getExitBindings` reads the graph keyed by activity id (`workflow-loader.ts:496-503`), so N instances have one join by construction.
- **A per-entry timestamp.** Still refused, and now doubly: the per-instance span the usage projection needs is derived from the `activity_entered`/`activity_exited` events, whose `activity` field carries the instance. Nothing goes on the entry and nothing new goes on the event.
- **A per-entry worker identity.** Still refused, and the argument *strengthens*. The spec gets a replacement free because "The replacement names the same activity, which the frontier still holds, so it needs no re-binding call" (`README.md:362`). With a composite entry the replacement names the same *unit*, which the frontier still holds — the property is preserved exactly, because **the entry names the slot, not the worker**. An entry-borne `agentId` (Judge 1's graft, `design-record.md:1450`) would record the dead identity and force a rebinding call on every replacement, which is the cost the spec priced and refused.

### How a worker learns which instance it is

`get_activity`'s parameters today are `session_index`, `context_tokens`, `agent_id`, `bundle` (`src/tools/workflow-tools.ts:1015-1019`); it reads `const activity_id = state.currentActivity` (`:1026`) and its description says "no activity_id" (`:1006`). The specification already adds one optional scalar there, modelled on `get_technique`'s existing one (`README.md:296-300`; `src/tools/resource-tools.ts:644`, mismatch guard `:653-661`):

```ts
      activity_id: z.string().optional().describe('Optional. The activity you were dispatched for, instance-qualified (`challenge-pass#stakeholder-gap`) where the graph fans that activity over a collection. Omit while one activity is in flight; required while several are, and refused when the session is not on the one you name.'),
```

**No second parameter.** The composite carries the instance, so there is no `instance_index` beside `activity_id`, no sibling field on every history event to carry it, and no forfeiture of the six free projections above. And the membership test stops being vacuous in the way Judge 1 raised against the winning design (`design-record.md:1449`): the frontier holds distinct strings, so a worker naming a *stale or wrong* unit is refused rather than served a sibling's body.

**The value arrives on the response, in the block that already carries server-computed facts.** `get_activity`'s header holds exactly this class of value for exactly this reason — `artifact_prefix`, because it "is server-computed from the activity filename and is NOT in the raw activity definition, so surface it in the header" (`:1438-1441`), and `exit_destinations`, because "the routing a worker is asked to report is unresolvable from the body alone, and this block is what closes that" (`:1443-1449`), assembled at `:1451-1456` and mirrored on `_meta` at `:1616`. The fan parameter is the third member of that set. The precedent for a step binding a server-supplied value that is not a bag entry is already in the corpus: `write-artifact`'s `artifact_prefix` input is documented "server-provided" (`workflows/work-package/techniques/manage-artifacts/write-artifact.md:10-12`).

The header gains one block, present only for an instance:

```
fan_instance:
  activity_id: challenge-pass#stakeholder-gap
  variable: challenge_perspective
  value: stakeholder-gap
```

`variable-binding`'s input precedence (`variable-binding.md:13-18`) gains one clause placing this projection between the step's own deviations and the bag: *a step's declared input equal to the fan parameter this delivery names binds the value the projection carries.* The worker binds `{challenge_perspective}` exactly as it binds a bag variable — one bare name, one value, differing per instance because the projection differs per instance.

**One line inside `get_activity` must move with it.** The eager-bundling gate reads `const bagAtOpen = state.variables ?? {}` (`:1204`); the projection is overlaid there, or a step gated on the fan parameter is unanswerable at delivery and stays lazy (`lazyUnanswered`, `:1226`). Unoverlaid it degrades rather than breaks.

**Why not overlay `inspect_session` or `get_workflow_status` instead.** Both serve one shape to both roles (`:508`, `:2235`), neither takes an activity parameter, and the orchestrator must see the un-projected bag — its `state` for `compose-prompt` substitutions cannot be per-instance. Overlaying them would make one tool return two different bags depending on who asked. The asymmetry this leaves is stated rather than hidden: a worker re-reading the bag through `inspect_session { view: 'variables' }` finds the *collection*, not its own element, which is the truth; the projection names itself on the response it arrives with.

**Two routes rejected, both by canon rather than by taste.**
- *The unit rides the composed prompt.* Forbidden by name. `context-travels-as-state` (`compose-prompt.md:59-61`): "Prior-activity context reaches a worker as state, not as prose in the stub … **A fact the worker needs and no variable carries is a missing declaration, not a licence to inline.**" It also leaves the activity body unbound: `{challenge_perspective}` tokens and `when:` gates resolve against the input precedence, in which the prompt appears nowhere.
- *The instance reads the whole collection and projects its own by index.* **This route does not run, and proving it is the tightest constraint in the design.** There is no indirection operator anywhere in the tree: the `{token}` grammar is `\{(IDENT(\.[a-zA-Z0-9_]+)*)\}` (`src/utils/activity-variables.ts:213` over `IDENTIFIER_PATTERN`, `src/utils/binding-provenance.ts:36`) — literal segments only; the bag-name grammar is `^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$` (`variable-binding.md:31`) — literal segments only; the structured condition carries `variable: z.string()` split literally (`src/schema/condition.schema.ts:15-21,40-48`); the `when` dialect tokenises an identifier into a literal path split the same way (`src/schema/when-expression.ts:23-29,287-294`, grammar comment `:4-6`). So `{challenge_perspectives.{fan_index}}` is unexpressible, and handing an instance an ordinal buys nothing because it cannot spell its own read. **This is why the discriminator is the unit's id and not an index, and it is also the second reason a repeated activity id in a list cannot be a complete design.**

### How one instance retires — and the barrier is untouched

`from_activity` takes the instance-qualified spelling and its description says so (`README.md:257-259`). The five-step resolution rule needs **no amendment**: step 1 is "Named and in the frontier: that one. Named and absent: refuse" (`:264`) — an exact string comparison over a list of distinct strings. That is how the retire step finds the one entry: not by scanning for a matching activity id and disambiguating, but because the id it names is unique in the frontier by load rule.

The barrier property therefore survives verbatim, and the specification's own sentence still reads true (`README.md:272`): "There is no separate barrier-met call and no separate join-enter call, so entering the join early is not refused — it is **unrepresentable**, because the only call that can enter the join is the one that empties the frontier." Retire `challenge-pass#rejected-paths`; remove it; enter the destination iff the frontier is now empty. Both judges ranked this the winning idea and it is preserved without a line of change.

Inside the handler, `exitingActivity` (`src/tools/workflow-tools.ts:769`) becomes the resolved composite entry, so the `activity_exited` event (`:771`), the `completedActivities` append (`:772-774`), the variable wrap (`:804-810`) and the step-completed events (`:812-825`) all carry it. `draft.exit` (`:842`) holds the last instance's exit, which is exactly that field's stated meaning after a fan (`README.md:233`).

Refusal texts, replacing `README.md:279-281` for the instance case:

```
Cannot exit 'challenge-pass': the session is on three instances of it. In flight:
challenge-pass#stakeholder-gap, challenge-pass#rejected-paths, challenge-pass#evidence-strength.
Pass from_activity naming the instance this call is returning, activity and unit id together.

Cannot exit 'challenge-pass#pedagogy': the session is not on it. In flight:
challenge-pass#rejected-paths, challenge-pass#evidence-strength. A unit id comes from the
collection the fan runs over; report the mismatch rather than retrying with another id.
```

**One advisory validator is worse than disabled and must base-normalise.** `validateActivityManifest` tests `activityIds.includes(entry.activity_id)` against `workflow.activities` (`src/utils/validation.ts:262-285`, membership at `:270`), so an instance-keyed manifest entry warns "references unknown activity" on *every* instance — which is how an orchestrator learns to stop reading `_meta.validation`, the spec's own stated failure mode (`README.md:292`).

### A shrink to the specification: the worker stops reporting a fan's shape

> **§5.2:** `activity_id` widens to "the whole list of activities to run together, exactly as the graph names them" (`README.md:254-256`).
> **§5.7:** `finalize-activity` gains `next_activity_ids`, "The activities the exit taken fans to, where the graph names several." (`README.md:427-428`)

Neither survives contact with an instance fan, and the right correction is smaller than what it replaces. A fan's shape is a graph object the transition handler has already loaded (`src/tools/workflow-tools.ts:720`), and §7 row 16 already makes `exit` **mandatory on a fan enter** (`README.md:562`). Given the retiring activity and the exit, the graph determines the destination completely — so a copy of it on the call is a second home for a fact the handler holds, which is what One Authoritative Home exists to prevent. Carrying an instance fan on the parameter would additionally mean a tool parameter taking a nested object.

**Amendment.** `activity_id` stays `z.string()` and becomes `.optional()`: it names the destination for a plain destination and for the terminal sentinel, and is **omitted where the exit taken fans**, because the server resolves the branches from the graph. Two refusals fall out: `activity_id` omitted where the exit does not fan, and `activity_id` supplied where it does. `finalize-activity` then gains **one boolean** — that the destination the worker resolved fans — instead of a plural field; bare truthiness is already in the gate dialect (`src/schema/activity.schema.ts:74-75`), so §5.6's `advance-to-fan` step sets one control name from a boolean rather than copying a list, and `evaluate-transition` (the single home for reading a destination, `evaluate-transition.md:16-18,43`) reports "one activity, terminal, or fans" rather than a one-or-many shape.

The fan-enter response hands back the branches the orchestrator must dispatch, derived once in the handler that already holds the graph and the bag:

```
_meta.fan = { branches: ['challenge-pass#stakeholder-gap',
                         'challenge-pass#rejected-paths',
                         'challenge-pass#evidence-strength'] }
```

**And `compose-prompt` needs no new input.** Its `substitutions` "Must include `session_index`, `workflow_id`, and `agent_id`, and `activity_id` as well for activity-worker" (`compose-prompt.md:16-18`), and step 1 emits those bindings (`:39-40`). The instance-qualified id *is* the `activity_id` substitution. One clause on that description; no `instance_index`, no second designator, and the unit's value stays out of the prompt per `context-travels-as-state`.

`exit_destinations` in the worker's header renders an instance fan as the single branch activity id, so a worker's view of routing is unchanged in shape. **The instance fan is invisible to the worker's envelope**, where the distinct form needed a new field. That is the shrink.

### isolation

## The indexed branch key, the guard changes, the reachability treatment, and the serialising side effects

### The container: `instanceKey`, keyed by unit id, pre-seeded at the fan enter

An instance's outputs land at `instanceKey(activity)` under its unit's own id. `challenge-pass` writes `challenge_pass_instances.stakeholder-gap`; `sub-crate-review` writes `sub_crate_review_instances.a1-nto`.

**Why a second container name rather than reusing `branchKey`.** The amendment's option B was rejected because "A join's read form would then depend on the fan's shape, so an activity borrowed into two workflows would need different reads in each" (`amendment-branch-index.md:60`). Reusing `<activity>_outputs` for both forms reproduces exactly that failure: one activity that is a plain branch in workflow A and an instance fan in workflow B would have one name holding two shapes. Two derived names, each with a fixed shape, closes it — and the name says which it is: `_outputs` holds one activity's outputs, `_instances` holds one entry per unit. Both are derived from the activity id alone, for the three structural reasons §6.1 gives (`README.md:446`): a declared key would be a second name to keep in agreement, unknowable to a worker under the control-plane ban, and forgeable. Both satisfy `QUALIFIED_DATA_ID_PATTERN` (`src/schema/identifiers.ts:16`) with the suffix doing the same work the spec's does (`README.md:448`), and `_instances` is a plural item-noun collection, the shape Name Symbols Affirmatively sanctions (`design-principles.md:93-95`).

**Why an object keyed by unit id and not an array.** Both alternatives were tested against the real canonicaliser (`src/utils/session/store.ts:145-187`), and both fail:

- A *sparse* array — what a positional write at index 2 into a fresh `[]` produces when instances retire out of order — corrupts the session file. `canonicaliseValue`'s array branch maps over the array and joins with `',\n'` (`:171-175`); `Array.prototype.map` skips holes but the result keeps them, so each hole renders as an empty string and the output is `[\n,\n,\n    {…}\n]` — **invalid JSON**, sealed by `atomicWrite` and unreadable on reload.
- An object keyed by *ordinal* loses order: `sortedKeys` sorts lexicographically at every depth other than 0 (`:151-157`), so an eleven-instance fan persists as `"0","1","10","2",…`, breaking `order-is-preserved` (`workflows/meta/techniques/scatter-gather.md:34-36`).

A dense array pre-filled at the fan enter survives both, but it forces every read to carry an ordinal — and the ordinal is the thing no evaluator can project (see `instance_identity`). **An object keyed by unit id carries no order to lose.** Order lives in `expected_ids`, which is the fan's own `over` collection — the authoritative order, stated once — and `gather-results` aligns `items` to it (`gather-results.md:26-28,40`). `order-is-preserved` therefore holds by construction rather than by a container shape surviving a seal.

**Pre-seeding, and what it buys.** At the fan enter the server writes the container as `{ '<unit-id>': null, … }` for every unit, one write at the single write site §6.2 already owns. Three things follow. A second visit to the same fan **re-seeds** rather than accreting stale keys from a previous visit's unit set, which is §6.1's "most recent visit" semantics stated per unit. An instance that never returns leaves `null`, which both dotted evaluators read as `notExists` rather than as a hole (an array satisfies `typeof x === 'object'` and a null member answers `notExists` true — `src/schema/condition.schema.ts:41-49`, `src/schema/when-expression.ts:287-294`). And it is what makes a **transposed** instance detectable: if two workers both claim `stakeholder-gap`, the uncovered unit's slot stays `null` and `gather-results` reports it `missing` with `completeness: incomplete` (`gather-results.md:30-36`). An indexed container filled in append order would show all N slots filled and report `complete`.

**The declared type changes from §6.5's.** The merge contributes one further declaration per fanned activity, **in addition to** its own write declarations (`README.md:504` — adding rather than substituting, preserved for the three reasons it gives). For an instance fan that declaration is `{ name: instanceKey(id), type: 'object', description: '…' }` with **no `defaultValue`** — a default would make every `exists` gate on the container constant, which `check:variable-model` forbids (`src/schema/variable.schema.ts:16`). `type: 'object'` is correct here where an ordinal container would have needed `type: 'array'`.

### The one read form, and the rule that makes it the only one

**A join reads a fan's outputs only through `orchestration-patterns::gather-results`.** This is the design's sharpest simplification and it is forced rather than chosen.

A distinct fan's join can spell its reads literally — §6.4's three dotted projections into three named branch keys (`README.md:485-496`) — because N is authored and each branch has a name. An instance fan's N is a runtime collection length, and no dialect in the tree expresses "for each member of this container". So the join **cannot** spell its reads and must hand the whole container to an operation that walks it. That operation exists, declares exactly the contract needed, and has no executing caller today:

```yaml
      - kind: technique
        id: gather-perspective-findings
        technique:
          name: orchestration-patterns::gather-results
          inputs:
            dispatched_results: challenge_pass_instances
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

Two renames and one dotted-projection template — the three sanctioned deviation forms (`variable-binding.md:33`), no new construct.

**`expected_ids` binds the fan's own collection, with nothing derived and nothing written.** `gather-results.md:16-18`: "Ordered expectation list. Each entry is either a string id or an object with an `id` field … Objects contribute their `.id`", normalised at `:40`. That is *the same rule* `unitId` implements server-side, so the fan's unit ids and the gather's expectation list are one derivation with one home — the operation's, which already owned it. The join declares `challenge_perspectives` among its reads like any other read. No `<activity>_units` write site is needed, and the collection is provably unmutated between the enter and the join because a branch's only write path is wrapped under its own container (§7 row 22).

**`dispatched_results` takes one clause, and it is the design's one operation edit.** The op declares `Array of { id, result } … in input order` (`gather-results.md:12-14`) and step 2 indexes it by `id` (`:41`). Its description already says "from the prior dispatch step (**or equivalent**)". One sentence admits the map form: *an object keyed by unit id is the same collection — its keys are the ids and its values the results; the ordered form is `items`, aligned to `expected_ids`.* Binding a near-identical second gather instead would be `duplicate-shared-capability` against the rule that already forbids it (`one-gather-contract-two-scatter-modes`, `scatter-gather.md:22-24`), and `scatter-gather` gains the graph instance fan as its third scatter mode over one combine contract.

**And a dotted read into one instance's slot is refused, by a guard finding, on purpose.** `VariableNameSchema` admits no dots (`amendment-branch-index.md:29`), so an authored instance read can only appear in an expression — a `when`, a `{token}`, a condition `variable`. Under a runtime-width fan such a read is *unsound*: the unit may not be in this run's collection. New finding family **`fan-instance-read`**: an expression whose head is an instance container and which projects past that head names an instance the graph cannot guarantee exists; the remedy is the gather. That leaves exactly one way to read a fan's outputs, which is Prefer Removing the Thing That Needs a Prohibition (`design-principles.md:161-163`) rather than a rule warning against the other one.

### The wrap, and why members stay validated

Unchanged from §6.3 in mechanism (`README.md:471-477`). `applyVariableWrites` (`src/utils/variable-seed.ts:68-108`) gains one optional context field, `under?: { key: string; instance?: string }`. Its per-name validation loop (`:75-92`) runs **unchanged** against the declarations its caller supplies — which is what keeps `context_scope`'s three-value set checked (`workflows/work-package/activities/04-research.yaml:32-39`), the load-bearing point of §6.3 and Judge 1's Critical graft (`design-record.md:1457`). Only the commit changes: instead of `draft.variables[name] = value` at `:93`, one assignment of the whole reported map at `draft.variables[key][instance]`, with the `variable_set` event naming `key.instance.member` so the history says which unit a value landed in.

The declarations come from the **retiring branch activity's own declared writes**, read at the wrap — not from the merged set the handler builds today at `src/tools/workflow-tools.ts:763`. Validation then does not depend on what the merge does.

### The guard changes

Two files: `src/utils/activity-variables.ts` (shared by server and guards so they cannot drift) and `scripts/check-activity-variables.ts`. Five changes, each against a named failure, all inside the existing `activity-variables` registry entry (`scripts/guards.ts:38-44`, hard zero at `check-activity-variables.ts:25`) so **no 37th entry joins the 36**.

1. **Re-key the write side.** For an activity an instance fan runs, the declared-write set becomes the container plus one entry per member spelled `container.member` — **instance-free**. N is a runtime value and a static guard cannot enumerate units, so the instance segment appears on the read side only. This refines the amendment's §6.5 row 1, which has the member test "move one segment right and skip a numeric segment": correct for reads, wrong for writes.
2. **Member-grain reads, under the existing family names.** The read collectors return the full dotted reference and the read function splits it: head for the namespace test, and for an instance container the *second* segment is skipped before comparing the remainder to the member set. `unwritten-read` at member grain: `reads 'challenge_pass_instances.stakeholder-gap.challenge_findigns', which 'challenge-pass' does not produce`. `unread-write` at member grain, carrying forward the self-consumed exemption `readersOf` already gives (`check-activity-variables.ts:199-206`) — without it the family fires on the order of 35 times on one correct fan, because most of a branch's declared writes are intra-activity working values (Judge 2, `design-record.md:1600`).
3. **The `over` collection acquires a reader that is not an activity.** `unread-write` fires on any name nothing declares reading (`:216-223`), and a fan's collection is read by the *graph*. So the guard contributes a read of the fan's `over` head — `bagName` (`src/utils/activity-variables.ts:216-218`), which correctly takes `execution_plan` from a dotted `over`, as `activity-variables.ts:402` already does for a loop — attributed to the fan's source activity, **and** adds the same name to `routingReads` (assembled at `check-activity-variables.ts:236-240`) so the definite-assignment pass proves the collection is written on every path reaching the fan source. That second half is a genuinely valuable new check for two map entries: **a fan entered on a path where its collection was never written is now reported**, which is `unproduced-value-read` at graph grain. Without it the runtime refusal is the only detector, and it fires on a live session.
4. **The fan parameter, and the exposure declaring it creates.** Declaring `variable` in `workflow.variables[]` puts it in `owned` (`:102-105`), satisfying `unwritten-read` (`:208-215`) with zero code change on the write side. But `availableAtEntry` also seeds from `owned` (`:226-231`), so a read of the parameter **outside its branch** is not reported — an activity elsewhere can declare `challenge_perspective` as a read and receive nothing, silently. One new family closes it: **`fan-parameter-read-outside-its-branch`** — a fan's `variable` is read only by the activity that fan runs. Decidable from the graph object plus declared reads.
5. **`fan-artifact-collision` gains its instance arm** — see `artifact_decision`.

### The reachability analysis: the meet over instances is trivial, and a runtime N never enters it

`unreachableReads` (`src/utils/activity-variables.ts:574-673`) is a forward reachability BFS that decides scope (`:604-611`) followed by a backward definite-assignment fixed point over the powerset lattice ordered by superset (`:629-646`), whose meet is intersection over predecessors (`:636-639`) seeded from `outgoing(sources[0])`. §6.6's change is to meet over **arrivals** — a completed fan being one arrival contributing the union of its branches' outgoing sets (`README.md:525-533`). Three properties make instances cost nothing further:

1. **The graph the walk runs over collapses instances to one node.** `activityGraph` (`:540-546`) already dedupes: `[...new Set(Object.values(workflow.graph?.[activity.id] ?? {}))]`. §6.6's one-line flatten is written `[...new Set(Object.values(...).flatMap(destinationTargets))]` — deduping *after* flattening — so an instance fan yields the single successor `challenge-pass`. The predecessor index (`:597-600`), the forward BFS, the strongly-connected-component pass (`:679-716`) and the `re-entry` family (`:661-671`) all see exactly the graph a single visit would produce, and an instance fan creates no cycle.
2. **The union arrival is idempotent over instances.** For N instances of one activity the arrival's contribution is `incoming(a) ∪ writes(a)` — exactly one branch's outgoing set. So the meet's behaviour for an instance fan is indistinguishable from a plain sequential edge and does not depend on N in any way.
3. **The set of *names* a fan makes available is N-independent.** This is the property §6.6 already identifies as what the namespacing buys: "a branch contributes exactly one flat bag name whatever object landed under it". The container is one flat name; the instances are inside the value. The lattice does not grow with N, and an unbounded runtime N cannot break the walk because **the walk never sees a count.**

Two traps specific to a repeated activity, both of which make §6.6's change do nothing or do the wrong thing. First, **the arrival split must remove every duplicate predecessor entry**: `:598-600` pushes `from` into `predecessors.get(to)` once per target-list entry, so an un-deduped flatten pushes the source N times and removing one leaves the intersection to wipe the union straight back out — the first of the three ways §6.6 says the change can be applied and do nothing. Re-deduping in `activityGraph` is trap-free by construction and is the cheaper fix. Second, **the arrival must be built over distinct branch activities**: the union is idempotent so a naive iteration is harmless for correctness, but a diagnostic naming the arrival's contributors will name one activity N times.

**What the analysis cannot see, stated rather than checked.** `unreachableReads` proves a read is satisfied on every arrival at **container** grain. Whether a *given unit* ran is a runtime fact, so instance-grain availability is not expressible in the definite-assignment lattice. That gap is closed by design rather than by analysis: `fan-instance-read` forbids the only authored construct that could depend on it, and `gather-results`' `dispatch_manifest` answers it at run time.

**One other graph reader, unchanged by instances but restated.** `scripts/check-review-mode-gating.ts` declares the graph's shape itself and parses raw YAML (`:87`, `:190`), so the fan rules cannot protect it. It imports `Destination` from the schema module and flattens through `destinationTargets`. Unflattened, its activity lookup on a non-string is `undefined` and every activity beyond a fan drops out of its reachability set. Same for `tests/e2e/walker.ts:52-53` and `scripts/smoke/smoke-orchestrator.ts:29`; all three import the type instead of re-declaring it.

### The serialising side effects: five surfaces, and what each does to the fannable set

The timing fact that decides all five: **a branch worker writes its files during its own run, inside the concurrent turn, before any transition.** `dispatch-fan` spawns the batch at step 5 and retires branches in input order at step 6 (`README.md:355-356`), so the *retires* are serialised and the *writes* are not. `persist-the-fan-before-any-branch-returns` answers the commit, not the write.

1. **One feature worktree, one git index** — needs a rule, and it is the one hazard that is a hard failure rather than silent loss. `create-worktree` materialises one worktree at `{target_path}` per session, a single session variable every instance reads. git serialises index mutation with `.git/index.lock`, so two concurrent `git add` calls do not corrupt the index — the second dies with "Unable to create '.git/index.lock'". `commit-and-persist` retries a failed **push** once (`commit-and-persist.md:31`); nothing retries a failed `git add`, so a lock collision surfaces inside a branch as an unhandled command failure. And even fully serialised the attribution is wrong: `commit-and-persist` derives its paths from `git status --porcelain` over one working tree, which cannot attribute a change to a branch. **For instances this residual is strictly worse than §11 records**, because the spec's fallback of attributing by activity id is unavailable — N instances share one id, and a qualified frontier entry is not a git author. **The rule: no instance touches the checkout.** A fanned activity binds no `manage-git` or `version-control` operation and does not bind `workflow-engine::commit-and-persist`. Decidable without composing signatures — `flattenActivitySteps` (`src/schema/activity.schema.ts:318-332`) plus `techniqueName` (`:176`) gives every bound ref — so it could be a load rule; it lives in the guard beside `fan-artifact-collision` so every fan rule needing the technique layer has one home, which is §6.5's stated split.
2. **The planning README's Progress table** — constrains nothing new, but for instances the candidate row set is *identical* rather than merely overlapping. `sync-progress-status` resolves `{artifact_prefix}` from `{activity_id}` (`sync-progress-status.md:44`), loads the Item labels that prefix owns from the row-ownership map (`:45`), and selects every matching row (`:46`). Two instances of one activity share one `artifactPrefix` — "inferred from the activity filename" (`src/schema/activity.schema.ts:310`) — so their candidates are the same rows. Two in-progress marks on one row is idempotent; two *complete* marks are not, because step 7 (`:51`) repoints the Item link at `{delivered_artifact}` and last write wins. The spec already resolves the general case with one commit before the spawn and one persist at convergence, plus its planning-readme amendment making the not-applicable marker one value per persist. What must be **added** is the row consequence: a fanned activity keeps its single row, its per-instance artifacts get none (the precedent is already established — an artifact can exist without a Progress row), and the row links what the join wrote.
3. **Append-ordered shared registers** — this **constrains which activities may be fanned**, and it is the sharpest concrete loss. `manage-registers::append-deferred-item` declares artifact `deferred-items.md` and `append-follow-up` declares `follow-ups.md`, both **literal and unprefixed by rule** (`created-lazily-and-unprefixed`: a register is created when its first row arrives, and any activity may create it, so neither carries an activity's numeric prefix), and `one-row-per-item-updated-in-place` makes the write a read-modify-write of the whole file. Two instances writing `deferred-items.md` do not even mint different numbers to be resolved later — they write the *same path* and one instance's rows vanish with no trace. `07-assumptions-review.yaml:142-144` binds `append-deferred-item` today, so this is not hypothetical.
4. **The provenance log's completion-order contract** — same constraint, second instance. `dco-provenance::append-task-row` declares artifact `provenance-log.md` and appends one row per completed task; the guide's own Rules make the header fixed and the rows append-only in completion order. Concurrent appends lose rows, and even serialised the row order becomes the nondeterministic order N instances finished in, which the guide states as a property a reader compares rows against. An activity binding `append-task-row` is not fannable.
5. **The artifact writer** — covered by `artifact_decision`; the collision is removed at its source rather than detected.

**Summary: none of the five forbids an instance fan.** (1) needs a rule. (3) and (4) are a *criterion* on the fannable set, not a rule to police. (2) and (5) are answered by the spec's existing rules plus the row and filename decisions here.

### artifact decision

## The collision, resolved: the instance goes in the filename, the check is that it does, and the default is that a branch writes no document at all

The amendment leaves this open twice — §3's last row ("Two instances of one activity run the same techniques and resolve the same artifact filenames, so same-activity fan-out needs artifact paths to carry the instance before it is usable") and §4's blocking sentence: "**Same-activity fan-out therefore depends on an artifact-naming decision this amendment does not make.**" (`amendment-branch-index.md:46`). It is made here, in two halves.

### The rule: a fanned activity's branch writes no artifact; the join writes one document from the gather

This is the default because it is the corpus's own `isolation-then-combine` raised to graph grain (`scatter-gather.md:30-32`: per-instance outputs are never auto-bound into the parent bag by scalar name; combination happens exclusively in the combine phase), and because it leaves *nothing* to check: the guide map, the audience declaration, `write-artifact`'s find-or-update discipline, the citation rule, `composeActivityArtifacts` (`src/tools/workflow-tools.ts:120-167`) and every filename-reading guard see exactly one writer at one filename — which is what they see today. `fan-artifact-collision` becomes **vacuous** for such a fan rather than failing open.

It is also what the corpus's motivating site needs anyway: `analyse-challenge::challenge` declares no `#### artifact` at all — its output is "Ordered collection of per-perspective findings (keyed by perspective name) … **Isolated until combine**" (`challenge.md:16-20`), a value not a file — and `combine.md` declares four outputs and no artifact either. The file write is a separate step, `review-assumptions::record`, which stays in the source or the join.

**The named failure mode of the rule: the join becomes the context bottleneck.** The join takes a fresh delivery scope and re-pays whatever the instances collectively held (`README.md:726`), and nothing caps a fan's runtime width below `maxInstances`. A wide fan of document-producing instances hands the join every instance's payload to write one document, and the failure is a silently truncated or elided document — no refusal fires, because the batch bound exempts a scope with no activity yet (`src/utils/batch.ts:154`) and the artifact writer validates nothing about completeness.

### The sanctioned deviation: a token-templated filename carrying the instance, with one guide-map row

Where an instance must persist a document of its own — and the corpus's day-one caller is exactly that case, since a substrate sub-agent's whole product is its own JSON file — the artifact name interpolates the fan's parameter as a `{token}`. Every mechanism this needs already exists and is already sanctioned in both places that would otherwise reject it:

- **The schema admits it.** `ARTIFACT_NAME_PATTERN = /^(?:[A-Za-z0-9._-]|\{[A-Za-z0-9._$-]+\})+\.[A-Za-z0-9]+$/` (`src/schema/technique.schema.ts:54`) — one path segment ending in an extension, "where a `{token}` placeholder stands wherever literal text would" (`:45-47`), with the rejection message naming the conforming forms at `:57-59`. The token class includes `.`, so a dotted projection into an object element is admissible. `scripts/check-technique-template.ts:175` applies the same pattern to authored files.
- **The catalogue sanctions it by name.** AP-130 `artifact-name-is-filename`, **Do not flag** (`anti-patterns.md:1735`): "a token-template whose `{placeholder}` resolves at runtime (`{package_name}-plan.md`, `subsystem-{code_subsystem.subsystem_name}.md`) — a placeholder standing where literal text would is part of the name, not prose." The inventory row says the same (`schema-construct-inventory.md`, technique output artifact row: "one path segment with an extension, `{token}` placeholders allowed").
- **The writer's discipline already exempts it, and that exemption is what removes the collision at its source rather than detecting it.** `write-artifact.md:50`: "token-templated names (e.g. `strategic-review-{n}.md`) are an intentional numbered **SERIES** — each interpolated name is its own logical artifact and is created, not matched against siblings." So the find-or-update keyed on a bare filename (`:41-47`) never sees two instances as one artifact, and the mint-attempt guard at `:46` is never asked to arbitrate a race it cannot win. **This is what makes the deviation safe rather than merely permitted**: the data loss the specification puts on the safety floor — "two concurrent branches both re-scan, both create, and the run thereafter resolves the lowest-numbered instance for the rest of the walk — data loss, not hygiene" (`README.md:517`) — *cannot arise*, because no two instances resolve one name.
- **The guide map matches it.** `mapRowFor` compares the declared filename string exactly, after splitting the column on commas and stripping backticks (`scripts/check-artifact-guides.ts:126-135`), with the row's guide links required to resolve (`:148-154`). The corpus already carries five templated rows: `NNNN-{decision_title}.md`, `strategic-review-{n}.md`, `strategic-review-{n}-method.md`, `{codebase_area}.md`, `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md` (`workflows/work-package/resources/README.md:64,66,67,68,70`). One row per deviating site, spelled with the token verbatim.
- **The corpus already ships two green instances of exactly this shape.** `substrate-node-security-audit/techniques/execute-sub-agent.md:26-32` declares `{agent_id}.json` with `audience: agent`, its input documented at `:10-12` as "Designator for this agent instance … which also names the persisted output file", guide-mapped at `substrate-node-security-audit/resources/README.md:35`. `cicd-pipeline-security-audit/techniques/execute-sub-agent.md:22-28` declares `{scanner_id}.json`, mapped at its own `resources/README.md:34`. Both pass `check:audience` and `check:artifact-guides` today — `isJsonArtifactName` already accepts a templated name whose literal suffix is `.json` (`scripts/check-audience.ts:56-58`).

### The check that turns an open decision into a rule

`fan-artifact-collision` (`README.md:515`, §7 row 29, **safety floor**) gains an **instance arm**, under the same family name so no new registry entry is created and the floor status survives a later trim:

> For an activity an instance fan runs, every `#### artifact` on the composed signature of every technique that activity binds resolves a filename that varies per instance — its template interpolates the fan's `variable`, or a technique input the binding step supplies from that `variable`.

Decidable from data the shared module already computes. `deriveActivityContract` already reads artifact filenames as templates and collects their token names — "An artifact filename is a template the worker interpolates from the bag at write time" (`src/utils/activity-variables.ts:308-311`) — and `bindingOf` (`:260`) already gives the step's `inputs` deviations, so the guard follows exactly **one hop**: an artifact token naming a technique input the step binds from the fan's `variable`, directly or by dotted projection, satisfies the check.

That one hop is what keeps the migration cheap and is not a convenience. At the substrate site the fan's `variable` is `crate_lane` and the technique's artifact is `{agent_id}.json`; the adopting step binds `agent_id: "{crate_lane.id}"` as an ordinary input deviation, and **the artifact declaration and its guide-map row are unchanged**. Without the hop the migration would rename a green artifact and its row for no gain.

Message shape:

```
Activity 'challenge-pass' is fanned by 'reconcile-assumptions.done' over 'challenge_perspectives'
and writes artifact 'challenge-findings.md'. Every instance resolves that one filename to one file,
so the name carries the instance: '{challenge_perspective}-challenge-findings.md', or the step binds
a technique input from 'challenge_perspective' and the name interpolates that input.
```

**This narrows the specification's own residual rather than inheriting it.** §11 records that the collision check "is guard-only and literal-names-only. A templated filename is an intentional series and out of scope" (`README.md:724`). The distinct-activity arm keeps that limitation, correctly — two authored activities resolving one literal name. The **instance arm is total**, because it does not need to compute N: it asks whether the template varies per instance at all, which is decidable from the graph object and the composed signature. The amendment's row — "Widens to two *instances* of one activity, which collide on every artifact by construction unless the filename carries the instance" (`amendment-branch-index.md:44`) — becomes a decision the guard makes rather than a family that fails closed on a template.

### Two alternatives declined, each with the reason it fails rather than the reason it is unappealing

**A per-instance subfolder** (`{planning_folder_path}/{unit_id}/`, bound through `write-artifact`'s `target_dir` input, `write-artifact.md:24-30`). Rejected on two independent grounds. `ARTIFACT_NAME_PATTERN` admits no path separator at all (`technique.schema.ts:54`, message `:57`: "one path segment"), so the subfolder is not expressible in the declaration and would have to arrive as a bound input — putting the artifact's location outside the declaration that owns its identity. And `operational-discipline-artifact-location` forbids it: "Write planning artifacts only under the server-returned `{planning_folder_path}` — never compose or reconstruct that path" (`workflows/meta/techniques/agent-conduct.md:46`). Beyond the rules: `verify-artifact-links` enumerates the `.md` files in the folder, so subfoldered instances leave the link audit; a Progress artifact link targets the minted filename, so a seeded link cannot predict a subfolder segment; and `push-before-linking` then publishes links into a shape the seed did not anticipate.

**One file the instances append to under a lock.** Rejected. There is no lock primitive anywhere in the corpus — the nearest thing is optimistic retry (`manage-git/artifact-commits.md:38-40`, `pull --rebase` before every push plus one retry; `commit-and-persist.md:31`, retry the push once) — so "under a lock" means inventing one, at the layer where the specification's own prerequisite explicitly rejects a lock: "a compare-and-swap on the record's sequence number with retry, **not** a per-session write lock" (`README.md:24`). It also contradicts `write-artifact`'s whole-file find-or-update (`:44`: "UPDATE that file in place, writing `{artifact_content}` to it") — the write is a full rewrite from a value the branch holds, not an append, so two branches serialised by a lock still lose the first's content unless each re-reads inside the critical section, which no operation does. This is Prefer Removing the Thing That Needs a Prohibition inverted: it adds mechanism precisely to police an overlap the rule above removes.

### The named failure mode of the deviation, kept rather than hidden

A token-templated instance artifact is **created, never updated in place** (`write-artifact.md:50`). Re-entering the same fan re-resolves the same template and creates rather than updates — which is correct for a series and wrong for a second pass over the same units, so a graph cycle through a fan of document-writing instances accretes files. And two elements whose ids interpolate to one value collide silently, because the check proves the name *varies* and cannot prove the values are distinct. The fan-enter's duplicate-unit-id refusal closes that for the id itself; a template projecting some *other* field of an object element (`{crate_lane.name}.json`) is not covered, and that is carried in the residual risks. The convention that keeps it out of reach is stated positively: **name the instance by its unit's id.**

### enforcement

One row per invariant. **schema** is carried by the zod type and surfaces as a parse error. **load** is a failure from `validateExitBindings` (`src/loaders/workflow-loader.ts:520-572`), which runs after fragment materialisation and the variable merge and whose non-empty return fails the load. **tool** is a server refusal at the boundary. **derived** means unrepresentable, so nothing needs checking. **guard** is a hard-zero finding of the existing `activity-variables` registry entry (`scripts/guards.ts:38-44`). Rows marked **not structural** are contracts an actor honours, listed so no reader mistakes them for enforcement. Rows are numbered continuing the specification's table (`README.md:545-581`); a specification row this design changes is marked and quoted.

| # | Invariant | Where | What it reports |
|---|---|---|---|
| 1-2 | A fan names at least two branches; a destination is one of the four admitted forms | schema | **Changed from §7 rows 1-2.** `graph.reconcile-assumptions.done: a fan names at least two branches; an exit that leads to one activity names that activity, and an exit that runs one activity once per element of a collection names that activity and that collection` — also for an empty list. And the union error map for a number, a non-string non-object member, a nested list, an instance fan missing a field, or one carrying an undeclared field (`.strict()`) |
| 2a | A fan's `variable` is a legal variable name | schema | `graph.reconcile-assumptions.done.variable: a variable name is a qualified snake_case noun phrase (>=2 words, AP-60), e.g. \`analysis_target\`` — from `VariableNameSchema` (`src/schema/variable.schema.ts:6-9`); this is what makes §4.4's L10 analogue unnecessary for the parameter |
| 2b | A fan declares a width ceiling of at least two | schema | `graph.reconcile-assumptions.done.maxInstances: Number must be greater than or equal to 2`. Required rather than optional, so a fan over a runtime collection with no declared ceiling **fails the load** — Encode Constraints as Structure |
| 3 | Every branch's activity is one this workflow contains | load | **L1, widened over `destinationTargets`.** `Workflow graph sends 'reconcile-assumptions.done' to 'challenge-pas', which this workflow does not contain.` The existing destination-existence loop (`workflow-loader.ts:565`) is the one edit to standing code |
| 4 | No activity appears twice among a destination's branches | load | **L2 re-aimed, not withdrawn.** For a literal repetition: `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' twice. A list destination runs each of its activities once; to run one activity once per element of a collection, name the activity together with the collection it fans over.` For a plain member duplicating an instance fan's activity: `…names 'challenge-pass' both on its own and as an instance fan; one activity has one container per destination.` This keeps `amendment-branch-index.md:39` true in substance while keeping the *list* spelling of it closed |
| 5-10 | No branch is the sentinel; every branch binds at least one exit; no branch fans again; no branch routes back onto itself; every exit of every branch names one and the same activity — **the join**; the join is an activity | load | **L3-L8 unchanged in content, evaluated over `branchActivity(b)`.** L7 is *cheaper* for an instance fan and not vacuous: all instances share one activity's exit bindings, so agreement across siblings holds by construction, and what survives is that the branch activity's own exits all name one destination — the constraint that disqualifies `codebase-comprehension` (four exits, four destinations) and every activity declaring none |
| 11 | No branch declares a gate | load | **L9 unchanged; its remedy clause changes.** The message ends "Move the gate to the activity before the fan or to the activity it converges on, **or take this activity out of the fan**" — the third option is vacuous for an instance fan, where every branch *is* the same activity, so removing it dissolves the fan. One clause, not a rule edit. The check itself is already instance-safe: it uses `activityCheckpoints` over `flattenActivitySteps` (`src/schema/activity.schema.ts:318-332`), keyed on the branch activity, so testing once for a fanned id is necessary and sufficient |
| 12 | Every derived container name is a legal, unique variable name | load | **L10 widened** to both `branchKey` and `instanceKey` |
| 12a | **L11 (new)** — the fan's `variable` is among the branch activity's declared reads | load | `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' over 'challenge_perspectives', handing each instance its element at 'challenge_perspective', which that activity does not declare among its reads.` The loader holds the materialised activities, so a typo on either side is a load failure rather than a guard finding |
| 12b | **L12 (new)** — the fan's `variable` is declared in this workflow's `variables[]` and carries no starting value | load | `…hands each instance its element at 'challenge_perspective', which this workflow declares with a starting value. A starting value is seeded into every session's bag at creation, so it would give every context the one value the fan exists to differ on.` (`src/schema/variable.schema.ts:16`) |
| 12c | **L13 (new)** — the fan's `over` head is a legal bag name, and is neither the fan's own `variable` nor either container of its branch | load | `…fans over 'challenge_perspective', which is the name it hands each instance. The collection and the element are two names.` |
| 12d | **L14 (new)** — a fan's declared width is within the deployment ceiling | load | `Workflow graph fans 'reconcile-assumptions.done' to 'challenge-pass' with maxInstances: 40, above this deployment's ceiling of 16. Lower the fan's width, or raise FAN_MAX_INSTANCES.` A deployment limit is authored against rather than discovered at run time |
| 13-14 | No undeclared gate is yielded from a fan; a tool that writes one activity id into the record is unambiguous | tool | §7 rows 13-14 unchanged. Instances make the gate case *more* binding: N instances of one activity all reach the same checkpoint step, so a gate inside a fanned activity deadlocks with certainty rather than by luck of routing (`assertNoActiveCheckpoint` gates `get_activity`, `get_technique`, `get_resource`, `get_workflow` and `get_trace` — `src/utils/session/params.ts:56-76`) |
| 15 | A call exits an activity the session is actually on | tool | §7 row 15, with the two refusals in the instance dialect. Exact string comparison over distinct entries, so `heldActivity` (`README.md:240-246`) is unamended |
| 16 | A transition off an activity whose exit fans says which exit it took | tool | §7 row 16 unchanged, and now load-bearing twice over: it is what lets the server resolve the fan from the graph, which is why `activity_id` need not carry it |
| 16a | **New** — a fan's shape is not copied onto the transition call | tool | `Activity 'reconcile-assumptions' binds exit 'done' to a fan, so 'activity_id' is omitted on this transition — the server enters the branches the graph names.` and its converse for a non-fanning exit with `activity_id` omitted. **Changes §5.2 and §5.7**, quoted and justified under `instance_identity` |
| 17 | A worker is served an activity the session is on, and never guessed at | tool | §7 row 17, and **materially stronger for instances**: the membership test over distinct qualified strings refuses a worker naming a stale or wrong unit, where a base-keyed frontier would admit any caller. It does *not* refuse a transposition between two live siblings — see row 34 |
| 17a | **New** — a fan's collection is present, non-empty, an array, within the fan's width, and every element carries a unique legal unit id | tool | Five refusals at the fan enter, each closing a silent failure. Over width: `Cannot fan 'reconcile-assumptions.done' to 'challenge-pass': 'challenge_perspectives' holds 24 elements and the fan admits maxInstances: 6. Cap the collection where it is produced — \`decompose-work-units\` takes \`effort_cap\` — or raise maxInstances on this destination.` Empty: `…holds no elements. A fan of no instances would empty the frontier at the moment of entering it, so the join would be entered and 'challenge-pass' silently skipped. Route past the fan with an exit predicate on 'reconcile-assumptions' where there may be nothing to fan.` Absent or non-array; an element with no derivable id (`the unit id names the frontier entry, the container slot and the artifact filename, so an element that carries none leaves three facts undefined`); a duplicate id; an id outside `UNIT_ID_PATTERN`. **Truncation is refused rather than performed**: silently dropping declared work would let the gather report `complete` over a set that was never the collection, which is the false completeness `isolation-then-combine` exists to prevent |
| 18-22 | The join is entered once after the last instance returns; entering a fan retires its source exactly once; at most one fan is open; a branch cannot take a second activity; no branch writes a bare shared name | derived | §7 rows 18-22 **unchanged, and every one of them holds for instances without a line of change** — this is the design's central claim. Row 18 in particular: the only call that can enter the join is the one that empties the frontier, so early entry stays unrepresentable |
| 23 | Every member of an instance's map matches its declared type and value set | tool, warn-only | §7 row 23's wording unchanged, validated against the branch activity's own declared writes read at the wrap |
| 24-28 | Nothing reads a container by a bare member name; every member a gather names is one its branch produces; every member is gathered somewhere; a read at the join is satisfied on every arrival; a gate reachable only through a fan is still audited | guard | §7 rows 24-28, with the member test reading **past the instance segment** for an instance container, the self-consumed exemption carried forward (`check-activity-variables.ts:199-206`), and the arrival meet unchanged in operator because the union over N instances of one activity is idempotent |
| 28a | **New** — a fan's collection is written on every path that reaches the fan's source | guard (`unreachable-read`) | The guard contributes the `over` head as a read of the source activity and adds it to `routingReads`, so `unproduced-value-read` at graph grain is reported statically instead of surfacing as row 17a's runtime refusal on a live session |
| 28b | **New family `fan-instance-read`** — no expression addresses one instance's slot | guard | `reads 'challenge_pass_instances.stakeholder-gap.challenge_findings'. A fan's width is the collection's length at run time, so a named instance is not guaranteed to exist; gather the container with orchestration-patterns::gather-results and read its items.` |
| 28c | **New family `fan-parameter-read-outside-its-branch`** | guard | `declares a read of 'challenge_perspective', which the fan at 'reconcile-assumptions.done' hands only to instances of 'challenge-pass'.` Closes the exposure that declaring the parameter in `workflow.variables[]` opens, since `availableAtEntry` seeds from `owned` (`check-activity-variables.ts:226-231`) |
| 28d | **New** — no instance touches the checkout | guard | `Activity 'sub-crate-review' is fanned by 'compose-primary-briefs.done' and binds 'workflow-engine::commit-and-persist'. A fan's instances share one working tree and one git index in one turn; the operation derives its paths from that tree and cannot tell two instances' changes apart.` |
| 29 | No two branches of one fan write one artifact filename | guard | **§7 row 29, safety floor, with a new instance arm.** The distinct arm is unchanged and literal-names-only. The instance arm is **total** — every `#### artifact` of a fanned activity's composed signatures interpolates the fan's `variable`, or an input the step binds from it. See `artifact_decision` |
| 30-33 | Each instance runs under its own identity; every instance carries exactly one usage entry; the in-progress marks reach the remote before the spawn; one persist at convergence | `dispatch-fan` rules | §7 rows 30-33, **not structural**, unchanged in kind. Row 30 becomes load-bearing twice over for instances: siblings share an activity id, so the delivery ledger (`src/utils/delivery.ts:63-65`) and the batch bound (`src/utils/batch.ts:154`) can only tell them apart by identity. Row 31's entry is per **instance**: `account-every-activity`'s operative unit is what a dispatch covered, and each instance is a separate dispatch with its own harness establishment; one entry for the base id would under-report by N−1 establishments, and `activities_without_usage` keyed on the composite is what makes a missing figure answerable (`src/tools/workflow-tools.ts:474-475`) |
| 34 | A worker executes the instance it was dispatched for | `verify-dispatched-activity`, a worker rule + the gather | **Not structural for a transposition between two live siblings**, and this design does not claim otherwise. `activity-worker.md:82-84` compares the id the stub bound against the id `get_activity` returned; the returned body's `id` is the base, so the rule gains one clause comparing against the `fan_instance.activity_id` the response echoes. That catches a stale unit but not a transposition, because the server serves what the call names. **The detector is the pre-seeded keyed container**: the duplicated unit's slot is overwritten and the uncovered unit's stays `null`, so `gather-results` reports it `missing` with `completeness: incomplete` (`gather-results.md:30-36`). Non-silent, not refused. Upgrade trigger in the residuals |
| 35 | The fan rules have exactly one home | — | §7 row 35 unchanged. **No 37th entry joins the 36** in `scripts/guards.ts`. Shape rules decidable from the graph object go in the loader; rules needing composed technique signatures or the merged variable model go in the existing `activity-variables` entry — the home split §6.5 already states |

### staged plan

Seven stages, numbered **I1-I7**, each independently mergeable in order. I1-I3 land with the capability inert and cannot execute a fan. I4 is where concurrency first runs and is gated on #655. I5 makes it executable. I6 and I7 are corpus and do not gate the merge.

**Relation to the specification's own stages.** These are *not* a parallel plan. Every stage here extends the matching distinct-activity-fan stage in `README.md:601-666`, and each is mergeable either on top of that stage or folded into it. Where a specification stage is unchanged, this plan says so rather than restating it.

**One rule spanning I1 to I3, inherited unchanged.** §9's own single line — "For the duration of the window in which the schema accepts a fan and the runner cannot execute one, `validateExitBindings` rejects any list destination outright with a message naming the stage that lands the runner" (`README.md:599`) — extends to the object destination form with the same one line, and is deleted by I4. That is what makes each intermediate stage's "no corpus movement" acceptance criterion *provable* rather than argued, because the corpus cannot then carry a fan at all.

---

### I1 — the destination form and the load rules · extends specification stage 1

`src/schema/workflow.schema.ts`: `InstanceFanSchema`, the three-member `DestinationSchema` with both messages, `UNIT_ID_PATTERN`, and the six derivations (`destinationBranches`, `branchActivity`, `isInstanceFan`, `destinationTargets`, `isFan`, `unitId`, plus `instanceKey` beside `branchKey`). `src/loaders/workflow-loader.ts`: `INSTANCE_SEPARATOR` with `activityBaseId` and `activityInstanceId` beside `checkpointBaseId`; the base fallback inside `getActivity` and `readActivityRaw`; base normalisation in `getExitBindings` and `exitDestinations`; `fanGroups`/`fanMemberIndex` widened to carry `Branch` descriptors; the widened destination-existence loop; rules L1-L14. `src/config.ts`: `DEFAULT_FAN_MAX_INSTANCES = 16`, env-overridable with an in-code fallback, in the same shape and the same home as `DEFAULT_BATCH_MAX_ACTIVITIES = 3` and `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35` (`src/config.ts:164-165`), whose own comment already names `docs/dispatch-model.md § Batching a run of activities` as the home for the measurements behind them. `npm run build:schemas` and `npm run build:site`, both committed. `tests/workflow-loader.test.ts`: one case per L1-L14, a well-formed instance fan accepted, a well-formed mixed fan accepted, and the rename's three call sites.

*Acceptance.* `npm run check:all` green with **zero corpus movement** — 17 workflows, 109 activities bound, 207 edges, none list-valued and none object-valued, so a union accepts every existing string and every fan rule is vacuous. The regenerated JSON carries the three-member `anyOf` plus `definitions.instanceFan`, and the empty-subschema assertion (`tests/generated-schemas.test.ts:44-49`) stays green because `items` is a non-empty `anyOf`. Each of L1-L14 fails the load with its stated message against a fixture. `activityBaseId('challenge-pass#stakeholder-gap') === 'challenge-pass'`; `getActivity` resolves a qualified id to its base definition and returns `undefined` for a base that matches nothing.

*Guard obligations.* `workflow-yaml` is the guard that currently rejects a fan and the first to re-run; `refs`, `audience`, `artifact-guides`, `stealth-isolation`, `session-contract` and `activity-variables` all load workflows and inherit the load result.

**Why `DEFAULT_FAN_MAX_INSTANCES = 16` and why the specification's objection is only half-answered.** §10 declines a width cap because "a cap would be a policy number with no derivation behind it and no configuration home" (`README.md:694`). The configuration half is now fully answered — `src/config.ts` is the home and already holds two numbers of exactly this kind. The derivation half is not, and this plan says so plainly: 16 clears the widest fan-out any corpus site authors (the substrate roster's ten expected output files, `substrate-node-security-audit/activities/03-primary-audit.yaml:66-69`) with headroom, and it is one config edit rather than a corpus sweep when a measured run says otherwise. What changes the balance against §10 is that a distinct fan's width is countable in the file at authoring time, while an instance fan's width is a runtime collection length — so nothing bounds it unless something is authored. The two layers are not a shadow of one another: `maxInstances` is this fan's declared width, the config value is this deployment's ceiling, and the precedent for that pair is already in the tree (`context_tokens` is the caller's window; `batchMaxActivities` is the server's cap; neither derives the other).

---

### I2 — every graph reader made fan-aware · extends specification stage 2

`src/utils/activity-variables.ts`: `activityGraph`'s flatten written as `[...new Set(Object.values(...).flatMap(destinationTargets))]` — deduping **after** flattening, which is what keeps the predecessor index from recording a source N times and is trap 1 of the reachability work. `scripts/check-review-mode-gating.ts`, `tests/e2e/walker.ts`, `scripts/smoke/smoke-orchestrator.ts`: `Destination` imported from the schema module instead of re-declared, list and object destinations flattened, a fan-bound exit yielding its branch set, the walk entering each branch then the join once. `src/utils/validation.ts`: the flattened allow-list, the set-wise reported-exit comparison, and base normalisation in `validateReportedExit`, `validateActivityTransition` and `validateActivityManifest`. `src/tools/workflow-tools.ts`: the exit-destinations header and metadata map, the checkpoint consequence, the exit payload and the immediate-exit message template — the four sites the compiler cannot catch, because a non-string destination stringifies happily. `evaluate-transition.md` and `finalize-activity.md`: "one activity, terminal, or fans".

*Acceptance.* No corpus movement; `check:all` green. A fixture instance fan and a fixture mixed fan each walk end to end in the walker. `validateActivityManifest` does **not** warn on an instance-keyed entry — the row that is worse than disabled, because a warning on every instance is how an orchestrator learns to stop reading `_meta.validation`. No rendered message anywhere interpolates a destination directly.

*Why this must precede any corpus fan.* Unflattened, the walk sends a non-string where an activity id is required, the tool's type rejects it, the walk throws, and the coverage job's `expect(walkErrors).toEqual([])` fails.

---

### I3 — the container, the guard, and the artifact decision · extends specification stages 3 and 4

`src/utils/activity-variables.ts`: the `instanceKey` container declaration added by the merge as `type: 'object'` with no `defaultValue`; the single-grammar read function with `pathReads`; the container re-keying of productions and of the landing site. `scripts/check-activity-variables.ts`: the instance-free write re-keying; member-grain `unwritten-read` and `unread-write` reading past the instance segment with the self-consumed exemption carried forward; the `over` head contributed as a read of the fan's source **and** into `routingReads`; `fan-instance-read`; `fan-parameter-read-outside-its-branch`; the no-checkout rule; `fan-artifact-collision`'s instance arm with its one-hop input follow. `variable-binding.md`: the instance-scoped landing, the derivation rule, and the fan projection's place in the input precedence. `scatter-gather.md`: the graph instance fan as the third scatter mode over one combine contract.

*Acceptance.* Corpus guard output **byte-identical** — this stage proves no regression, and the new behaviour is proved by fixtures. On fixtures: one correct instance fan with a gather produces **zero** findings; a gather naming a member no branch produces is reported once; an ungathered member once; a bare read of a fanned activity's output once; an expression addressing one instance's slot once; a read of the fan parameter outside its branch once; a fanned activity binding `commit-and-persist` once; a fanned activity whose artifact template does not vary per instance once, **and one whose template interpolates an input the step binds from the fan's variable is not reported**; a branch that writes a working value and reads it back within its own steps is **not** reported; and a fan entered on a path where its collection was never written is reported as an `unreachable-read`.

*Guard obligations.* `binding-fidelity` and `variable-model` join the acceptance set (Judge 1's missing-guard finding, `design-record.md:1549`): the first mechanises a declared input with no reader and a read with no producer, the second mechanises defaults, gates and variable effects staying coherent with the seeded model — which is what proves L12's no-starting-value rule is not merely stated. `artifact-guides` and `audience` join it too, because the artifact deviation adds guide-map rows.

*Risk note carried into the plan.* Two of these families sit in a hard-zero guard with no ledger to diff, so a bug in either is silent. The `over`-into-`routingReads` change is the one with real upside and real risk: it is the only static detector of a fan entered without its collection, and applying it without the dedupe from I2 makes it fire on every path.

---

### I4 — the frontier's instance grain and the runner · extends specification stage 5 · **gated on #655**

`src/tools/workflow-tools.ts`: `activity_id` made optional with the two new refusals; `from_activity` taking the qualified spelling; the resolved retiring entry threaded through the exit event, the completed set, the variable wrap's `under: { key, instance }`, the step-completed events and the trace stamp; the fan-enter's container pre-seed and its five refusals; the `_meta.fan` branch list; the `fan_instance` header block on `get_activity` with the `activity_id` parameter and the `bagAtOpen` overlay; the frontier rendering on status, identity projection, activity projection and session inspection. `src/utils/variable-seed.ts`: `ctx.under`, with the per-name validation loop unchanged and the declarations read from the branch activity's own `variables.writes`. `src/utils/session/resolver.ts`, `store.ts`, `migration.ts`: unchanged beyond the specification's own stage-5 edits, which is the point — `frontier: z.array(z.string())` and `heldActivity` are not amended.

**Where #655 sits, and why it is here and not earlier.** I1-I3 cannot execute anything, so nothing concurrent touches the store. I4 is the first stage where N branch contexts append history to one session, and what this design needs from #655 is unchanged from §8 and stated in one line: **a compare-and-swap on the record's sequence number with retry, not a per-session write lock** (`README.md:589`). For an *instance* fan the lock objection is sharper than for a distinct fan, because N instances of one activity all compose *the same* activity payload — serialising N identical hundred-thousand-character compositions behind one lock erodes the only benefit the fan buys, and there is no delivery collapse available to offset it (`one-identity-per-branch` requires distinct identities and the ledger keys on them, `src/utils/delivery.ts:63-65`). I4 may merge before #655 lands; it may not be **enabled on a real run** before it.

*Acceptance.* The whole existing unit and end-to-end suite green with a frontier of length one — every ordinary session takes the identical path, and no test is rewritten for behaviour, only for the field name. A session recorded before the frontier migrates and resumes. Rows 13-23 and 17a of the enforcement table each have a test: the transition refusal with `from_activity` omitted while three instances are in flight; the refusal naming a unit the fan does not carry; an instance return with siblings live entering nothing; the last instance's return entering the join; each of the five fan-enter refusals; a three-instance fan executing end to end against real sessions; each instance's writes landing under its own unit id with the container pre-seeded to nulls first; a second visit to one fan re-seeding rather than accreting; a member whose value disagrees with its declaration warning with today's wording; and a **mixed** fan of two instance fans and one plain branch executing end to end.

---

### I5 — the definitions that make an instance fan execute · extends specification stage 6

`dispatch-fan.md`: its input becomes `fan_branches` — the ordered qualified branch ids the fan-enter response returned — so the operation never learns which graph construct produced them (Separate Contract from Procedure, and why §10's rejection of a fan mode on `dispatch-activity` does not recur here: there are not two procedures). One clause for width one: a fan of one runtime element spawns one agent through `spawn-agent`, which is the same clause `replace-one-branch` already carries. `a-branch-takes-one-activity` becomes "a branch carries exactly one activity, and where the graph fans that activity over a collection, exactly one instance of it"; `replace-one-branch` works unchanged, because a replacement names the same qualified entry, which the frontier still holds. `gather-results.md`: one sentence on `dispatched_results` admitting the map form. `compose-prompt.md`: one clause on `substitutions.activity_id`. `activity-worker.md`: one clause on `verify-dispatched-activity` comparing against the response's `fan_instance.activity_id`. `finalize-activity.md`: the one boolean, replacing §5.7's plural field. `03-dispatch-client-workflow.yaml`: the gate on that boolean. `src/loaders/core-ops.ts` and `workflows/meta/workflow.yaml`: the delivery entries — an operation named inside another operation's protocol has no other delivery path. `schema-construct-inventory.md`: one new row, voiced so it cannot be confused with the within-activity fan-out row that already sits in the same file at `:38`:

```
| "Run this one activity once per work unit — one worker to each" | **Graph instance fan** | `graph.<activity>.<exit>` set to `{ activity, over, variable, maxInstances }` — or that object as a member of a fan list, beside plain activity ids. The activity runs once per element of `over`, one worker to each instance, and each instance reads its own element at `variable`. The element's own id names the instance: itself where it is a string, its `id` field where it is an object. Each instance lands its outputs in the activity's instance container (its id in snake case with `_instances`) under that unit's id, and the run enters the single destination all of the branch's own exits name, once, after the last instance returns — the barrier is those bindings, so nothing declares it. A join reads the container by binding `orchestration-patterns::gather-results` with the fan's collection as `expected_ids`; addressing one instance directly is reported, because the width is the collection's length at run time. A collection longer than `maxInstances`, empty, or holding an element with no unique legal id is refused when the fan is entered. |
```

`docs/dispatch-model.md`: the instance-fan section, with **the arithmetic derived and its substitution named**. The only measured per-activity figures in the tree are the benchmark's (`docs/dispatch-model.md:86`, from `npm run bench:batch` against submodule `5f92dc06`): three activities cost 222,505 characters batched — 85,775, then 106,893, then 30,182 — and 261,971 standalone. There is no measured figure for a *fanned* activity's payload, so the standalone mean of 87,324 stands in and this document says so rather than presenting it as measured. An instance fan's alternative is **not** a batched walk of N different activities — it is one activity whose loop body runs N times in one worker, paying one `get_activity` response and reusing the bundled loop-body technique per iteration ("An entry for a step inside a loop body is the protocol for EVERY iteration: engage it once per iteration from the copy you hold, and do not re-fetch it per pass", `src/tools/workflow-tools.ts:1406`). So at N=3: ≈261,972 delivered against ≈87,324, a premium of ≈174,648 characters (+200%), or in general **(N−1) × the activity's whole payload** — plus (N−1) harness establishments, which `docs/dispatch-model.md:68` rates at two to four times what the delivered content collapsing saves. Total ≈253,000-332,000 characters, ≈63,000-83,000 tokens at `DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4` (`src/config.ts:156`). Against the distinct fan's stated 118,000-197,000 characters (`README.md:20`), **an instance fan of the same width is about twice as expensive**, for a structural reason worth one line: the distinct fan's sequential alternative pays three activity payloads anyway, so its premium is only the forgone collapse; the instance fan's alternative pays one payload for all N units, so its premium is the payload itself, N−1 times. Every figure is a floor for the same reason the benchmark's is — it counts eager payloads only (`:84`) — and must be re-derived against a fresh `bench:batch` before the specification prose quotes it. **And what it buys is not only wall clock:** the activity cap of 3 exists for what a character count cannot see — "the context the harness establishes and the server never delivers, the code the worker reads, the artifacts it drafts, and the degradation that comes with a long walk" (`:76-78`) — and an in-context loop of N units accumulates all N reasoning passes in one context with nothing bounding it, because the batch budget counts delivered characters, not generated ones (`src/utils/batch.ts:98-123`). At the challenge site that is up to N × 10 passes in one worker (`doWhile`, `maxIterations: 10`, `04-research.yaml:137-146`). An instance fan converts unbounded intra-activity context growth into N bounded contexts, which is `isolation-then-combine` buying correctness rather than latency.

Also in this stage: the load-rule line from the I1-I3 window deleted; the stale-restatement sweep run by grep key against the tree with its occurrence count recorded in the change manifest (§9's own method, `README.md:651`), extended with the phrasings this design changes — *the whole list of activities*, *next_activity_ids*, *no activity_id*.

*Acceptance.* `check:all` green including `refs` resolving every new anchor, `audience` placing every new rule, `fragments`, and the workflow-YAML validator loading the amended meta workflow. Version bumps on every edited definition. A smoke run drives a fixture instance fan: the branch list arrives on `_meta.fan`, each instance's `get_activity` carries its own `fan_instance` block, the checkpoint trio and the artifact commit stay silent on the fan iteration, and the destination arrives through the output remap.

---

### I6 — first adopter: the substrate primary audit · does not gate the merge

One commit in the workflows submodule plus the pointer bump. `03-primary-audit` splits into a compose source, a mixed fan of three instance fans, and a join binding `gather-results` then the verification and merge steps that remain single-worker activities (`:75`, `:81`, `:87`). `dispatch-sub-agents::assign-roster` emits three lane collections instead of one heterogeneous `agent_roster`, which moves the `activity_id` each entry carries (`dispatch-sub-agents/TECHNIQUE.md:12-14`) out of the data and into the graph. Each of `10-sub-crate-review`, `11-sub-static-analysis` and `12-sub-toolkit-review` declares one exit bound to the join — today they declare none and appear in no graph edge (`substrate-node-security-audit/workflow.yaml:65-80`). Each adopting step binds `agent_id: "{crate_lane.id}"`, so `{agent_id}.json` and its guide-map row (`substrate-node-security-audit/resources/README.md:35`) are unchanged.

*Acceptance.* The workflow loads with the mixed fan and every load rule satisfied. `check:all` green on both sides with the pointer bumped. The coverage walk green with no stale, newly-uncovered or newly-covered entries and the stamp fresh, **with the dry-walk budget re-measured** from its current value of 50 — the coverage test's own comment says the plateau is a property of the graph and must be re-measured whenever the graph grows, a fan multiplies the branch orderings the enumerator produces, and a short streak is reported as *unreached options*, that is as a definitions defect, when the cause is the budget. Each re-measure attempt is a full-set walk of roughly nineteen minutes, and this stage is priced with that. One live run in which ten instances spawn in one turn, each lands its JSON under its own unit id, the join's gather reports `complete`, and the barrier refusal appears in no log.

*Why putting six previously off-graph activities into the graph is an acceptance consequence rather than a blocker.* Their reads become subject to `unreachable-read` and `review-mode-gating` for the first time.

---

### I7 — second adopter: the challenge pass · does not gate the merge, and is priced as a regression

Promote the challenge pass to its own activity at each adopting site; the graph fans it over the perspectives; the join binds `gather-results` then `analyse-challenge::combine`; the step-level convergence loop becomes a graph cycle from the join back to the source, bounded by an authored round counter and an exit predicate. `analyse-challenge::challenge` sheds its Scatter and Gather phases (`challenge.md:24-28`, `:35-38`), its input becomes the singular perspective, and the plural `challenge_perspectives` (`analyse-challenge/TECHNIQUE.md:12-14`) moves to the join as the gather's expectation list. The six identical bind-site literals plus the two-entry one become one declared collection per adopting workflow.

*Why it is second and not first, stated rather than glossed.* Seven sites (`02-design-philosophy.yaml:194`, `04-research.yaml:154`, `05-implementation-analysis.yaml:100`, `06-plan-prepare.yaml:132`, `07-assumptions-review.yaml:91`, `08-implement.yaml:176`, `15-codebase-comprehension.yaml:98`), each a step inside a bounded convergence loop, each replaced by 1 + N + 1 dispatches per pass where today the sequential mode is a free in-context iteration needing no dispatch primitive (`scatter-gather.md:13`, and `parallelism-is-optimisation` at `:38-40`). Against I5's arithmetic — (N−1) whole payloads per pass, up to ten passes — this is a token regression at every one of the seven, and the counterpart is bounded per-instance context rather than wall clock, because the per-perspective pass is one reasoning pass over a log. **What it does get free, and it is worth recording:** the challenge pass declares no artifact at all, so the artifact decision does not bind; and the loop body holding the challenge and combine steps contains **no checkpoint** at any of the seven sites, so a carved challenge activity satisfies L9 by construction and none of §9 stage 7's seven gate removals — with their Non-Destructive Updates burden and decision-inventory diff (`README.md:666`) — is incurred.

*Relation to specification stage 7.* Independent. §9 stage 7 adopts the *distinct-activity* fan and its four blockers (seven gates, nothing converging, the shared assumptions log, the inverted data flow) are untouched by this plan. I6 and I7 adopt the *instance* fan and neither depends on stage 7 landing. **And §1's "What ships dormant" needs amending, which is the plan's own conclusion:** "No workflow in the pinned corpus is fan-ready today" (`README.md:26`) is true of the distinct-activity fan and false of the instance fan.

### not adding

Each with the trigger that would change the answer.

**No ordinal, no index, and no new field on the frontier entry.** The entry is still a bare string. An index would satisfy identity and addressing but leave the work unit unnameable without a second lookup, hand the guard `.0`/`.1`/`.2` where names the graph can check belong, force a container whose shape cannot survive canonicalisation (sparse array → invalid JSON; ordinal-keyed object → lexicographic reorder, both verified against `src/utils/session/store.ts:145-187`), and make the composite unavailable to the six projections that read `event.activity`. Decisively, an ordinal cannot be *used*: no evaluator in the tree can project one into a read address, so an indexed instance cannot spell its own work unit. *Trigger:* a collection whose elements genuinely carry no id and cannot be given one.

**No per-entry worker identity, and no per-slot claim.** §5.1's refusal holds and its argument strengthens, because the entry names the *slot*: a replacement names the same qualified id, which the frontier still holds, so it needs no re-binding call (`README.md:362`). A claim-on-first-`get_activity` mechanism was considered and declined: it closes a transposition between two live siblings, but the pre-seeded keyed container already makes that transposition *visible* — the uncovered unit's slot stays `null` and the gather reports it `missing` — so a refusal buys detection the design already has, at the cost of a released-on-failure rule and a fourth call outcome. *Trigger:* an observed transposition whose gather manifest was not read.

**No `instance_index` on `compose-prompt`, and no new substitution at all.** The instance-qualified id *is* the `activity_id` substitution that operation already requires (`compose-prompt.md:16-18`). One clause on a description; no second designator.

**No `next_activity_ids`, and no widened `activity_id` on the transition tool.** This design *removes* the plural envelope field §5.7 adds and *narrows* §5.2's union to an optional string. The fan's shape is a graph object the handler already loads, and `exit` is already mandatory on a fan enter, so a copy on the call is a second home. Quoted and justified under `instance_identity`. *Cost, stated:* §9 stage 2's acceptance criteria change and `evaluate-transition` reports "one activity, terminal, or fans" rather than a one-or-many shape. *Conservative alternative declined:* keep the plural field for the list form and add a boolean for the object form — two ways for a worker to report a fan, which is the second home the rest of this design spends its effort avoiding.

**No dotted read into one instance's slot.** Reported by `fan-instance-read`, so a join has exactly **one** way to read a fan's outputs: bind `gather-results` with the fan's collection as `expected_ids`. Prefer Removing the Thing That Needs a Prohibition rather than a rule warning against the other route. *Trigger:* none available — a named-instance read is unsound under a runtime width by construction.

**No second gather, and no new operation of any kind.** `orchestration-patterns::gather-results` already declares the ordered keyed collection, the `expected_ids` expectation list, the per-id dispatch manifest and the completeness verdict. It gains one sentence admitting the map form on an input whose description already says "or equivalent". A near-identical sibling would be `duplicate-shared-capability` against `one-gather-contract-two-scatter-modes` (`scatter-gather.md:22-24`).

**No per-instance context beyond one value.** The fan's `variable` binds one element. A structured element is projected by ordinary dotted read, which is what `{current_unit.target}` already does (`prism/activities/02-adversarial-pass.yaml:32`). *Trigger:* a fanned activity that provably needs two independent per-instance values, which would need a second derived name the instance could address generically.

**No `compose-worker-briefs` at this layer.** It builds a per-unit *prompt* carrying the unit's brief, and putting the work in the prompt is what `context-travels-as-state` forbids (`compose-prompt.md:59-61`). It is displaced at the graph layer and survives for in-activity fan-out.

**No repeated activity id in a list destination.** L2 is re-aimed rather than withdrawn: the *literal* repetition stays a load failure, with a message pointing at the object form, because a repetition carries no data and its only discriminator is list position. This keeps `amendment-branch-index.md:39` true in substance while keeping that spelling closed.

**No truncation, no successive waves, no width-derived-from-the-graph.** A collection past the fan's width is **refused** at the enter, not trimmed: silently dropping declared work would let the gather report `complete` over a set that was never the collection. Waves would need a scheduler, new state, and would destroy the one property §5.2 buys — a wave boundary empties the frontier mid-fan, so a call other than the last would enter the join.

**No new tool, no new session field, no new source module, no merge policy, no gate in a branch, no nested fan, no child session per instance.** Every one stays refused for the reason §10 gives (`README.md:672-706`), and instances *strengthen* four of them. The gate ban: N instances of one activity all reach the same checkpoint step, so a gate inside a fanned activity deadlocks with certainty rather than by luck of routing. The merge refusal: two instances cannot collide, because the container is keyed by unit id and the id is unique by load rule and by the fan-enter refusal. Nesting: a branch's exits all name one non-list destination, so no instance can open a fan. A child session per instance: strictly more mechanism, and it breaks implicit convergence.

**No 37th guard registry entry.** Shape rules decidable from the graph object are load failures; the five new families land inside the existing `activity-variables` entry (`scripts/guards.ts:38-44`), two of them reusing existing family names so no new ledger is created. `fan-artifact-collision` keeps its **safety floor** mark so a later trim does not take it with the hygiene checks.

**No worktree isolation.** `isolation-mode-write-boundary` (`orchestration-patterns/TECHNIQUE.md`) requires each worker to create and use its own worktree before mutating files, and a graph fan's instances share the session's one `{target_path}`. Not served, and the no-checkout rule is the honest form of that.

**No change to `orchestration-patterns::dispatch-workers`.** Its concurrency selection remains unexecutable at every one of its binding sites, for the reason `depth-1-only` gives. This design serves the demand those files were written for at the layer where the primitive exists; it does not repair the operation.

**No relaxation of `verify-dispatched-activity`.** It stays a worker rule and gains one clause. It becomes *effective* for a stale or wrong unit, because the server's membership test over distinct qualified strings refuses one; it stays ineffective for a transposition between live siblings, and the residuals say so at full strength.

**No claim that `gather-results`' `completeness` detects a missing instance in the ordinary case.** The join is entered only by the call that empties the frontier, so under correct dispatch no expected id can be missing and the verdict is structurally `complete`. Advertising it as the missing-instance detector would be a detection the design cannot make. What it *does* detect is real and named: a transposed dispatch, and an instance that returned an envelope with no writes (`empty`).

### serves 657

Seven definition files bind `orchestration-patterns::dispatch-workers`, fifteen bind lines between them. Five of the seven hold a genuine fan; two want ordinary graph edges and never wanted a fan. Verdict per site, against the recommended shape.

---

**1. `workflows/meta/activities/patterns/01-orchestrator-workers.yaml:43`** (whole pipeline `:34-52`). **SERVED, fully — as three graph nodes rather than one activity.** `orchestration-patterns::decompose-work-units` binds **unchanged** in the source activity and its declared output `work_units` — "Ordered array of `{ id, brief, tools_hint? }`. `id` is a stable slug" (`decompose-work-units.md:20-24`) — *is* the fan's `over` collection, with `unitId` taking `.id` by `gather-results`' own normalisation. The per-unit operation runs in the fanned activity; `gather-results` (already bound at `:44-49` with `expected_ids: work_units`) and `synthesise-results` run at the join. Its `effort_cap` (`:16-18`; group-level at `orchestration-patterns/TECHNIQUE.md:24-26` — "Positive integer bounding how many workers or follow-up rounds a pattern may spawn for one invocation") is the authored half of `maxInstances`, and the fan-enter refusal is what makes that contract *enforced* rather than honoured. **This is the site that proves the design needs a runtime-width fan:** its own `description` calls it "Runtime-decompose a goal into work units", so a design whose width is authored in the graph would not serve it at all. **What it loses:** its identity as a *borrowable activity* — a graph shape cannot be borrowed, so a consumer authors three graph entries instead of one `activities:` line. It also declares no `exits:`, so it needs one. `patterns/README.md:7` — "These activities cover **in-activity fan-out / consolidate** only" — becomes the accurate description of what stays behind, and the pattern's home moves from the file to the inventory row.

**2. `patterns/02-supervisor.yaml:48`, with `dispatch_concurrency: 1` (`:50`).** **NOT SERVED, and never wanted a fan.** One classified lane, one worker: `work_units` is declared "The selected lane as a **one-element** ordered array" (`:22-24`). A fan of one runtime element would run, but the construct that serves this site is a plain graph edge to the lane activity, which `workflow-engine::dispatch-activity` already executes today. Its dispatch step is unexecutable and the fix is an ordinary destination. This design counts it as **not** demand, rather than inflating the tally.

**3. `patterns/04-isolated-fan-out.yaml:47`**, with `isolation_mode` (`:41-44`) and the completeness validate (`:53-58`). **PARTLY SERVED.** `context` isolation is precisely what a fan gives — each instance is a fresh worker context, which is `isolation-then-combine` buying correctness. **`worktree` isolation is not served**: `isolation-mode-write-boundary` requires each worker to create or use its own worktree before mutating files, and a fan's instances share the session's one `{target_path}` — §11 already records that a fan's branches share one working tree and that nothing enforces read-only, and the no-checkout rule is the honest form of it. The `require-complete` validate on `gathered_results.completeness` becomes **structurally satisfied** rather than served: the join is entered only by the call that empties the frontier, so no expected id can be missing there. Say so rather than counting a constant as a check.

**4. `patterns/05-lead-researcher.yaml:47` and `:76`** — the second inside `while has_research_gaps` (`:60-88`). **SERVED, at a stated cost.** The first fan is direct: `plan-research-questions` produces the collection, the fan runs one research activity per question, the join gathers and synthesises. The follow-up round requires the in-activity `while` to become a **graph cycle** — the join assesses gaps and its exit routes back to the fan's source. That is legal as the specification stands: L6 forbids a *branch* routing onto itself, not a join routing back to a source, and the corpus already carries such cycles (`work-package/workflow.yaml:189-191,196`). Re-entry re-seeds the container from the fresh unit set, so round two's outputs land in slots keyed by round two's units. **What is lost is `maxIterations: 3` (`:64`)**: a graph cycle has no declared ceiling. The replacement is ordinary state — a round counter the join writes and an exit predicate (`research_round < 3 && has_research_gaps`), which the `when` dialect already expresses (`src/schema/activity.schema.ts:74-75`). **What is also lost is artifact idempotence across rounds**: a token-templated instance artifact is created, never updated (`write-artifact.md:50`), so a second round over the same unit ids accretes files.

**5. `substrate-node-security-audit/activities/02-reconnaissance.yaml:37` and `:49`.** **NOT SERVED, and does not want to be.** Two sequential single-agent dispatches with a file-verification step between them (`:38-43`, `:50-55`), and the second's briefs are composed only after the first's files land (`:44-46`). That is a chain of two activities, not a fan. The fix is two graph edges.

**6. `substrate-node-security-audit/activities/03-primary-audit.yaml:48`** (gather at `:49-54`), plus the tail dispatches at `:75`, `:81`, `:87`. **SERVED, and this is the day-one caller.** `dispatch-all-agents` runs the whole roster and the verification step names **ten** expected output files (`:66-69`) — a1-nto, a2-midnight-ledger, a3-node-startup, a4-node-consensus, a5-runtime, a6-primitives, a7-governance, b-static-analysis, d1-ledger-helpers, d2-toolkit — across three sub-activities, so it is a **mixed fan**: seven instances of `sub-crate-review`, one plain `sub-static-analysis`, two instances of `sub-toolkit-review`. Its width is authored twice, in the file and as a workflow rule (`substrate-node-security-audit/workflow.yaml:19`: "Every assigned primary agent (A1-A7, B, D1, D2) is dispatched in a single simultaneous batch"), and materialised at run time by `assign-roster`. Every criterion passes: the three sub-activities are gate-free and `required: false`; the per-instance parameter is one value; `gather-results` is **already bound** with `expected_ids: worker_briefs` (`:49-54`), whose `dispatch_manifest` and `completeness` are exactly what N slots need; and the artifact is `{agent_id}.json` with `audience: agent` (`substrate-node-security-audit/techniques/execute-sub-agent.md:26-32`), whose input is documented as the designator "which also names the persisted output file" (`:10-12`), guide-mapped at `resources/README.md:35`, and green under `check:audience` and `check:artifact-guides` today. **Named changes:** each of `10-sub-crate-review`, `11-sub-static-analysis`, `12-sub-toolkit-review` declares one exit bound to the join — today they declare none and appear in no graph edge (`workflow.yaml:65-80`); `assign-roster` emits three lane collections instead of one heterogeneous `agent_roster`, which moves the `activity_id` each entry carries (`dispatch-sub-agents/TECHNIQUE.md:12-14`) out of the data and into the graph; the activity splits into compose / fan / join; the three tail dispatches stay single-worker sequential activities; and each adopting step binds `agent_id: "{crate_lane.id}"`, so **the artifact declaration and its guide-map row are unchanged** — which is what the artifact check's one-hop input follow exists for. **This site is why the destination admits an instance fan as a list member**: it needs the amendment's repeated-activity relaxation *and* the specification's distinct-activity fan in one destination, which is precisely the union this design closes.

**7. `cicd-pipeline-security-audit/activities/03-primary-scan.yaml:27`, with `dispatch_concurrency: scanners_assigned` (`:26-29`)**; gather at `:30-35`. **SERVED — and this site is the one an authored-width design would not serve.** Its width is literally a session variable: `scanners_assigned` is declared `type: number, defaultValue: 0`, "Count of per-submodule scanner agents assigned during reconnaissance" (`02-reconnaissance.yaml:10-13`) — one scanner per submodule *discovered*. Under this design the fan's `over` is the scanner-lane collection `compose-scanner-briefs` produces and `maxInstances` is the authored ceiling, so a discovered width runs and an unbounded one is refused with a message naming `effort_cap`. Everything else is already right: gate-free; `gather-results` already bound with `expected_ids: worker_briefs` (`:30-35`); the per-instance artifact is `{scanner_id}.json` with `audience: agent`, guide-mapped at `cicd-pipeline-security-audit/resources/README.md:34`, and reached by the same one-hop input binding. **Named changes:** the exit `scan-verified` gates on `verification_complete == true && merge_complete == true` (`:69-72`), both written by *dispatched* workers, so those writes move to the join; the three tail dispatches (`:50`, `:56`, `:62`) stay single-worker.

---

### Aggregate verdict

**Five of seven served** — 1, 3 (context isolation only), 4, 6, 7 — **two not served and never wanted a fan** — 2 and 5, which want ordinary graph edges that `dispatch-activity` already executes. Three of the five needed a *runtime-width* fan (1, 4, 7), which is the design decision that earns them.

**What is not repaired, said plainly.** `dispatch-workers` itself is unchanged and stays unexecutable at every one of its binding sites, because every one is an activity executed by a dispatched worker holding no dispatch primitive — `depth-1-only` (`spawn-agent.md:44-46`), and §10's position on it is untouched. This design does not fix the operation; it gives the demand those seven files were written for a call site at the layer where the primitive is, and the operations around it bind **unchanged**: `decompose-work-units` at the source, `gather-results` and `synthesise-results` at the join. `compose-worker-briefs` is displaced here (its per-unit prompt is what `context-travels-as-state` forbids) and survives for in-activity fan-out. `worktree` isolation is not served at all.

**And the capability does not ship dormant.** The corpus holds a day-one caller — the substrate primary batch, ten instances wide, gate-free, its gather already bound, its per-instance artifact already authored and already green — plus a second adopter in the seven `analyse-challenge::challenge` sites, whose shape is exact (one operation, parameterised instances, "Each unit receives only the concern set … **plus its perspective name**", `challenge.md:28`) and whose cost is a regression this plan prices rather than hides. That is the amendment to §1's "What ships dormant": true of the distinct-activity fan, false of the instance fan.

### residual risks

- A transposed instance id between two live siblings is detected, not refused. The server serves the unit the call names, so a worker composed for one unit whose stub carries a sibling's id is served the sibling's projection and both do that unit's work. The pre-seeded keyed container makes it visible — the duplicated unit's slot is overwritten and the uncovered unit's stays null, so `gather-results` reports it `missing` with `completeness: incomplete` (`gather-results.md:30-36`) — but nothing refuses it, and the report is only read if the join binds the gather. `verify-dispatched-activity` cannot close it: it compares the id the response echoes, which is the id the call named. Upgrade trigger: an observed transposition whose manifest was not read — then bind the slot to the identity that first claims it, refuse a second identity naming a claimed slot, and release a slot whose claimant returned a non-envelope. Declined now because it buys a refusal where detection already exists, at the cost of a fourth call outcome and a released-on-failure rule.
- N instances share one working tree and one git index, and this is strictly worse for instances than §11 records for distinct branches. Branch workers write during the concurrent turn, before any transition; git serialises index mutation with `.git/index.lock`, so a second concurrent `git add` dies rather than corrupting, and nothing retries a failed `add` (only the push is retried once, `commit-and-persist.md:31`). Even fully serialised, `commit-and-persist` derives its paths from `git status --porcelain` over one tree and cannot attribute a change to an instance — and the specification's fallback of attributing by activity id is unavailable, because N instances share one id and a qualified frontier entry is not a git author. The no-checkout guard rule is the containment, not a fix, and it is a guard finding rather than a load failure.
- The artifact check proves that a filename varies per instance, not that the values are distinct. `fan-artifact-collision`'s instance arm is total for the shape it checks — the template interpolates the fan's `variable` or an input bound from it — but a template projecting some other field of an object element (`{crate_lane.name}.json`) passes while two elements sharing that field collide silently. The fan-enter's duplicate-unit-id refusal covers the id alone. The convention that keeps it out of reach is stated positively (name the instance by its unit's id) and is not enforced. A technique that writes a file without declaring a `#### artifact` stays invisible to the check, as §11 already records.
- A token-templated instance artifact is created, never updated in place (`write-artifact.md:50`), so a graph cycle through a fan of document-writing instances accretes one file per unit per round. That is correct for a numbered series and wrong for a second pass over the same units, and it is a real cost at the one site that needs a cycle (`patterns/05-lead-researcher.yaml:76`, whose `while` becomes a graph cycle and whose `maxIterations: 3` becomes an authored round counter).
- Instance-grain availability is not statically decidable and is not checked. `unreachableReads` proves a read is satisfied on every arrival at container grain only; whether a given unit ran is a runtime fact the definite-assignment lattice carries no length for. The design closes this by construction rather than by analysis — `fan-instance-read` forbids the only authored construct that could depend on it, and the gather's `dispatch_manifest` answers it at run time — but an author who wants to know statically which instances a fan will run cannot be told.
- The instance fan is token-negative against the construct it replaces, by roughly twice the distinct fan's premium, and one of its figures is a substitution rather than a measurement. An instance fan's alternative is one activity whose loop body runs N times in one worker — one delivery, N iterations — so the premium is (N−1) whole activity payloads plus (N−1) harness establishments, where a distinct fan's premium is only the forgone collapse. There is no measured figure for a fanned activity's payload in the tree, so the benchmark's standalone mean of 87,324 characters stands in and `docs/dispatch-model.md` must say so. Every figure is a floor because `bench:batch` counts eager payloads only (`docs/dispatch-model.md:84`), and all of it must be re-derived against a fresh run before any specification prose quotes it. The counterpart is not only wall clock: an in-context loop of N units accumulates N reasoning passes in one context with nothing bounding it, because the batch budget counts delivered characters and not generated ones (`src/utils/batch.ts:98-123`).
- `DEFAULT_FAN_MAX_INSTANCES = 16` is a policy number whose home is derived and whose value is not. §10's objection to a width cap is answered on the configuration half — `src/config.ts` already holds two numbers of exactly this kind (`:164-165`) — and only half-answered on the derivation half: 16 clears the widest authored site (ten expected output files at `substrate .../03-primary-audit.yaml:66-69`) with headroom, and nothing measured says where it should sit. It is one config edit rather than a corpus sweep when a measured run says otherwise.
- `record_usage` stores its `activity` verbatim with no validation (`src/tools/workflow-tools.ts:1787,1813-1823`), so an instance-qualified id naming no live instance is accepted and lands an unattributable row. `account-every-activity`'s figures are then per instance and correct when reported correctly, and silently wrong when not — which is the same class as the existing gap the rule names ('an activity with no entry is one whose harness reported nothing, never one that cost zero'), now multiplied by N.
- The dry-walk budget after adoption, and the shape of the failure. The coverage plateau is a property of the graph and must be re-measured whenever the graph grows; a fan multiplies the branch orderings the enumerator produces, a runtime-width fan forces the walker to enumerate a synthetic width, each re-measure attempt is a full-set walk of roughly nineteen minutes, and a too-small budget is reported as *unreached options* — that is, as a definitions defect — rather than as a budget shortfall.
- Trace segments are per session, not per delivery scope. A fan of N produces 1 + N segments partitioning an interleaved multi-instance event stream at arbitrary points. Stamping the retiring instance on the payload's `act` field fixes the mislabelling and is strictly better than the distinct fan's stamping, where nothing prevented two segments carrying one activity's id; the interleaving is not separable from the segment boundaries. Unchanged from §11.
- The two new guard behaviours with real upside sit in a hard-zero guard with no ledger to diff, so a bug in either is silent. Contributing the fan's `over` head into `routingReads` is the only static detector of a fan entered without its collection, and applying it without the post-flatten dedupe in `activityGraph` makes it fire on every path; `fan-instance-read` is the only thing keeping the container's read form single, and a bug in its head test would either report nothing or report every gather. Fixtures are the whole protection, as §11 already says of the arrival meet.
- An instance fan carries a fan's collection unmutated from the enter to the join by derivation rather than by enforcement. A branch's only write path is wrapped under its own container (§7 row 22), and the source retires at the enter, so nothing concurrent can change the collection — but a join that writes the collection before reading it would hand `gather-results` an expectation list disagreeing with the container the fan filled, and step order inside the join is not checked.
- `worktree` isolation is not served, and one binding site declares it (`patterns/04-isolated-fan-out.yaml:41-44`). `isolation-mode-write-boundary` requires each worker to create or use its own worktree before mutating files; a graph fan's instances share the session's one `{target_path}`. That half of the site's contract has no executor at this layer and none is proposed.
- Two fans over one activity share its instance container, and the second enter re-seeds it from the fresh unit set. Stated positively: an instance container holds the units of the most recent fan that ran that activity, each under its own id, with null for a unit that returned nothing. The routing case is reported by the re-entry finding family; a non-routing stale read is not detected — the same residual §11 carries for the branch key, narrowed by the re-seed from 'stale keys accumulate' to 'the previous fan's units are gone'.

## Judge 1

**Verdict:** CANON UNITS ENUMERATED AT server 9f1605d3 / corpus f3733709. design-principles.md: 35 numbered principles (§1 Workflows Ossify Patterns through §35 Prefer Removing the Thing That Needs a Prohibition). anti-patterns.md: 11 Creation Rules plus 151 catalog entries AP-01 to AP-151 and 4 authoring-guidance entries MR-1 to MR-4, across 12 `##` sections — note the file's ordering is non-monotonic, since AP-126 to AP-151 and MR-1 to MR-4 all sit under the "Authoring Guidance (MR)" heading at :1625, so a `##`-then-`###` fetch of that one section returns 30 entries and a reader expecting 4 will miss the entries this design most needs (bag-value-as-literal, unproduced-value-read, stale-restatement-after-change, artifact-name-is-filename, output-without-destination, declared-input-never-read, schema-semantics-restated, engine-internals-narrated, value-set-in-prose). schema-construct-inventory.md: six tables — Activity-Level 21 rows, Workflow-Level 7 rows (Graph at :65, loop-step row at :47, orchestration-patterns fan-out at :38), Technique-Level 10, Condition 5, Checkpoint Effects 2, Action Types 5. convention-conformance.md: 6 reference conventions. scripts/guards.ts: 36 registered guards, 32 corpus-scope and 4 repo-scope, plus one unregistered script on disk (check-session-contract.ts) with no npm entry.

CONSTRUCT SPECIFICITY. Both designs pass the "most specific construct" test, and for the same reason: the routing fact "run this activity once per element of that collection" has no home in the Workflow-Level table today, the Graph row at :65 carries only a destination activity or the sentinel, and neither the loop-step row at :47 nor the orchestration-patterns row at :38 can express it — a loop body runs in one worker holding no dispatch primitive, and the ops at :38 are bound only at activities executed by dispatched workers. So this is schema extension for a fact the schema cannot carry, not schema-is-constraint: AP-02's Do-not-flag ("legitimate schema evolution requested explicitly by the user") applies, the corpus has 0 object-valued destinations (re-measured at f3733709), and no existing content is being made to validate. Design 1 names the loop-step disambiguation explicitly and Design 2 does not, which is the one specificity gap between them.

DATA REFERENCE IN THE GRAPH. Both honour One Authoritative Home and Keep Orchestration in Structure, and the reason is worth recording positively: what lands in the routing file is the collection's NAME, which is what a forEach step's `over` already carries; the members stay in the bag, produced by an activity. The graph holds references and nothing else, so its single-home property survives. Both correctly reject the inverse — the activity declaring what it fans over — and Design 2's third test is the decisive one, that the fan would stop being decidable from the graph object and every one of the 207 plain destinations would become ambiguous until its destination activity's file were read. Where the two diverge is the PARAMETER name: Design 1 authors it in the destination (three homes, policed by L11, L12 and L15) and Design 2 derives it from the activity id (two homes, one rule). Prefer Removing the Thing That Needs a Prohibition favours the derivation; the binding contract decides against it, because no technique's canonical input id can ever be <activity>_unit, so generic-not-overfit at variable-binding.md:41-43 is violated at every consuming step forever and implicit same-name binding is eroded by construction.

ENTRIES THAT FIRE. Clean for both: schema-is-constraint (evolution, not bending), loop-not-prose (no prose iteration; Design 2 owes the disambiguation), duplicate-shared-capability on the gather (both bind orchestration-patterns::gather-results rather than inventing a second one, and both cite the rule at scatter-gather.md:22-24 that forbids a second gather over one combine contract), mode-as-state (the fan mode is carried by structure, not by rules — though Design 2's boolean projection re-opens it as no-derived-state-shadow), no-valueless-control-set (Design 1's control sets are value-bearing; Design 2's boolean set is a naming defect, not a valueless one), output-without-destination (neither declares a value with no reader; both keep §10's refusal of branch_results). Firing: unproduced-value-read against Design 2 (Critical — its one new check is inert on one path and false on the other, verified at source); cited-home-owns-claim against Design 1 (High — a dozen citations past end of file in scatter-gather.md, challenge.md and decompose-work-units.md); stale-restatement-after-change against both (Principle 18 at design-principles.md:87 and inventory :38) and additionally against Design 2 (graph field description unauthored, Graph row :65 unamended); no-partial-implementation against Design 2 (six missing sections) and against its guard scoping; io-agnostic-contract against Design 2's derived parameter; no-derived-state-shadow and boolean-id-shape against Design 2's next_activity_fans and current_branches; structure-backed-constraints against Design 1 twice (the join-index check declared impossible when a sound one-sided form exists, and three silent-data-loss surfaces left unchecked though the check is conceded decidable); canonical-fact-home against both on the census pin; engine-internals-narrated against Design 1's new scatter-gather rule; declared-input-never-read against both on the synthetic read's true injection count and Design 2's understated ambient model.

INERT STRUCTURE. Neither design leaves a materially inert field. Design 1's maxInstances is read by L14 (ceiling) and the over-width enter refusal, its `variable` by L11, L12, L15 and the delivery projection, its `over` by the enter read and the synthetic guard read, and FrontierEntry.instance by the resolver, the wrap, the events and record_usage. Design 2's three destination fields are all read by L11 to L14 and the enter refusals. Two small exceptions: the `of` member on both designs' fan_instance block is narration with no structural reader, and Design 2 declares three instance helpers where its named readers use two.

GUARD OBLIGATIONS. Both designs must satisfy the same set, and I make it larger than either states. Directly touched: workflow-yaml (first to re-run, the schema widens), activities, activity-variables (the new families, the arrival meet, the container declaration, the synthetic read), review-mode-gating (must flatten every destination form or the whole subtree beyond a fan drops out), refs (new anchors in the amended variable-binding, scatter-gather and dispatch-fan), resource-anchors (every new .md#anchor must resolve), audience (every new rule placed in an audience bucket; templated artifact names still classified), artifact-guides (a token-template row must map — verified reachable, mapRowFor at scripts/check-artifact-guides.ts:126 matches by exact string after comma-split and backtick-strip), technique-template (the new dispatch-fan and every edited technique against the normative template, artifact bodies included, at check-technique-template.ts:175), binding-fidelity and variable-model (both named by §9 stage 4 and by Judge 1's graft; the no-defaultValue rules and the gather bind are exactly what they mechanise), when-expression (indexed paths must parse — both designs verified this and I confirmed the read walkers need no change), identifier-qualification (Design 1's `variable` is checked at parse time by VariableNameSchema, which removes Design 2's L12 need; Design 2's derived unitKey must satisfy QUALIFIED_DATA_ID_PATTERN), set-action-values (the drive-loop sets), description-hygiene, citation-grain and section-framing (new citations and sections), site-links and svg-layout (build:site regenerated and committed), pinned-corpus-paths (any new corpus path a TS source resolves). Inherited unchanged: inherited-inputs, checkpoint-entry, checkpoint-presentation, decision-order, bootstrap-self-contained, harness-adapter-set, self-provisioned-input, self-composed-set, branch-as-step, activity-technique-overlap, prism-lens-reachability, fragments, stealth-isolation, loop-shape, source-encoding, lockfile-denylist. NEW GUARD: neither design needs a 37th entry for its own families — Design 1's fan-parameter-read-outside-its-branch and the fan-artifact-collision instance arm both sit inside activity-variables, preserving §7 row 35. But Design 2 does need one, or an amended proves line, because it puts a technique-binding check (no manage-git op in a branch) inside an entry whose registry claim is about variables and which §10 asserts survives unedited. Separately, both designs should raise scripts/check-session-contract.ts: it exists with no registry entry and no npm script, so it is the fourth instance of the defect the registry header says it fixed, and Design 1 compounds it by naming session-contract as a guard obligation.

SITE COUNTS, ALL RE-MEASURED AT THE PINNED COMMIT. 17 workflows, 109 activities bound in graphs, 207 graph edges, 18 terminal, 0 list-valued, 0 object-valued — so the widening moves no corpus and every fan rule is vacuous until a fan is authored. 15 orchestration-patterns::dispatch-workers binds across 7 files (patterns/01:43, patterns/02:48, patterns/04:47, patterns/05:47 and :76, substrate 02:37 and :49, substrate 03:48, :75, :81, :87, cicd 03:27, :50, :56, :62) — Design 1's per-bind verdict accounts for all 15 and I confirmed each line. 7 analyse-challenge::challenge binds (02:194, 04:154, 05:100, 06:132, 07:91, 08:176, 15:98) with the perspectives literal at 02:196, 04:156, 05:102, 06:134, 07:93, 08:178, 15:100 — six with three perspectives, one with two. 122 corpus activity files, 56 declaring a checkpoint, so 66 gate-free; within work-package all fifteen counts match Design 2's list exactly and 11-validate is the only gate-free one. patterns/01 and patterns/04 declare no exits at all, confirming Design 1's L4 gap. The 04-research convergence loop at :137-168 is doWhile / maxIterations 10 with no checkpoint in its body, confirming that a carved challenge-pass satisfies L9 by construction and none of §9 stage 7's gate-removal burden transfers.

VERDICT. Design 1 first, Design 2 second, and the gap is narrower than the ranking suggests. Design 1 wins on every construct choice I could adjudicate from source — min(2), the authored parameter, the branch-attributed synthetic read, §5.7 preserved, the graph description authored — and it is the only submission complete against the surfaces this remit judges. Design 2 wins on evidence hygiene, on four specific mechanisms worth grafting (L14, the checkout check, the lens falsification, the base-resolution convention), and on the AP-127 reading neither the specification nor Design 1 names. Neither should ship as written: Design 1's corpus-technique citations must be re-derived before any of its prose enters the specification, its two declined structural checks must be taken, and both designs owe the Principle 18 and inventory :38 amendments, the duplicate-element enter refusal, and a decision on the dead parallel branch of dispatch-workers rather than an inheritance of it.

**Ranking**

- Design 1 — object destination { activity, over, variable, maxInstances }, authored parameter, indexed frontier entry. RANK 1. Canon-correct on every construct choice adjudicable from source: min(2) on maxInstances (quotes and honours §4.1's One Authoritative Home reasoning against a second spelling of a plain edge); an authored parameter name, the only form that preserves implicit same-name binding (variable-binding.md:15) and lets generic-not-overfit (:41-43) work as written; the synthetic `over` read attributed to the BRANCH, which I verified is the only sound placement (src/utils/activity-variables.ts:623-627 computes outgoing = incoming ∪ writes, and the entry finding at :649-653 tests against incoming, which excludes the activity's own writes); §5.7's next_activity_ids preserved rather than replaced by a boolean; the graph field description authored verbatim, which the specification calls the one text reaching every reader. It is also the only submission complete against the canon surfaces in this remit: a §7-extension table (I1–I44) with every row placed at schema/load/tool/derived/guard, a staged plan extending §9 stage-for-stage with the spanning load-refusal preserved, an explicit not-adding list, and §9 stage 6's stale-restatement sweep carried with its 31-sites-across-18-files count plus AP-129's own method (grep key against the tree, count recorded in the manifest). Its corpus survey is measured and exact — all 15 dispatch-workers binds across 7 files, the 7 analyse-challenge::challenge sites, the 0-checkpoint claims and the no-exits claims each verified. Its artifact decision rests on two live, green, guide-mapped token-template precedents I confirmed at substrate-node-security-audit/techniques/execute-sub-agent.md:26 mapped at .../resources/README.md:35 and cicd-pipeline-security-audit/techniques/execute-sub-agent.md:22 mapped at .../resources/README.md:34. What holds it back is evidence hygiene, not design: roughly a dozen citations into corpus technique markdown resolve past end-of-file, and two structural checks it declines are available.
- Design 2 — object destination { activity, over, maxInstances } with the parameter name and container key both derived from the activity id, composite frontier string. RANK 2. Sharper than Design 1 in four places and it should not be discarded: it falsifies the rival lens head-on with three named tests including bind-site-is-orchestration-truth and §4.3; it reuses CHECKPOINT_INSTANCE_SEPARATOR and getCheckpoint's base fallback, which I confirmed present at src/loaders/workflow-loader.ts:449-455 and :464-474, so the composite entry is Convention Over Invention rather than invention; its derived unitKey removes the need for Design 1's L15, which is exactly the prohibition Prefer Removing the Thing That Needs a Prohibition targets; and its L14 is the only sound structural check on an authored join index in either submission. Its citations and measured counts are accurate everywhere I sampled — the 15 work-package checkpoint counts, 122 activity files with 56 declaring a checkpoint hence 66 gate-free, and every scatter-gather, challenge, decompose-work-units, gather-results and write-artifact line reference. It ranks second on three grounds. Its one new guard check is inert on one path and false-positive on the other, verified against the guard's own source. Its derived parameter name forfeits implicit same-name binding permanently and makes a fanned activity fan-only, which is a Liskov failure under SOLID at the Definition Layer. And as received it carries no §7-extension table, no staged plan, no not-adding list, no #657 per-bind verdict, no residual-risk list, and no stale-restatement sweep or site count, so the enforcement placement and guard-count questions this remit asks cannot be answered from it.

### Findings

```json
[
 {
  "design": "Design 2",
  "severity": "Critical",
  "entry": "unproduced-value-read",
  "evidence": "Design 2's one new reachability check \u2014 'the guard contributes a read of the fan's over head, attributed to the fan's SOURCE activity, and adds the same name to routingReads so the definite-assignment pass proves the collection is written on every path reaching the fan source. Two map entries.' \u2014 does nothing on one half and reports falsely on the other. The routingReads half is inert three times over: it is pre-filtered to names the record already declares as reads at scripts/check-activity-variables.ts:239-241, it is consumed only by the re-entry family at src/utils/activity-variables.ts:661-671, and that family continues past any name something writes at :666. The reads half is worse than inert: the entry finding at :649-653 tests reads.get(id) against incoming.get(id), and outgoing at :623-627 is incoming(id) \u222a writes(id), so incoming(source) never contains a name the source itself writes. The flagship shape Design 2 names \u2014 decompose-work-units emitting work_units in the source activity, whose exit then fans \u2014 therefore produces a FALSE unwritten/unreachable finding on a correct fan. Design 1 reaches the opposite placement and states the mechanical reason correctly, citing :650-653. The specification's own \u00a79 stage-3 risk note says this is the worst place for a bug: 'a new operator in a hard-zero guard with no ledger to diff, so a bug in it is silent, and each of the three ways to apply it and have it do nothing is caught only by a fixture.'",
  "fix": "Take Design 1's placement: contribute bagName(fan.over) as a synthetic read of the BRANCH activity, not the source, so incoming(branch) contains outgoing(source) and the collection is proved available on entry to the branch. Drop the routingReads contribution entirely \u2014 it cannot fire \u2014 or, if a re-entry reading is wanted, change the filter at :241 and the written-name skip at :666 deliberately and with its own fixture. Add the stage-3 fixture Design 1 names: a fan entered on a path where its collection was never written IS reported; a fan whose source writes the collection is NOT."
 },
 {
  "design": "Design 1",
  "severity": "High",
  "entry": "cited-home-owns-claim",
  "evidence": "Roughly a dozen path:line citations into corpus technique markdown attribute facts to spans that do not exist. workflows/meta/techniques/scatter-gather.md is 40 lines; Design 1 cites one-gather-contract-two-scatter-modes at :96-98, isolation-then-combine at :104-106, order-is-preserved at :108-110, parallelism-is-optimisation at :112-114 and a depth-1-only remark at :87 \u2014 every one past end of file. The actual homes are :22-24, :30-32, :34-36 and :38-40, which is where Design 2 cites them. workflows/work-package/techniques/analyse-challenge/challenge.md is 48 lines; Design 1 cites 'Build one work unit per entry' at :44 (actual :26), the depth-1-only sentence at :45 (actual :27), 'Each unit receives only the concern set' at :46 (actual :28, and :46 is the evidence-over-rhetoric heading), the challenge_findings declaration at :36-38 (actual :16-20) and isolation-then-combine at :60-62 (past EOF; actual :42-44). workflows/meta/techniques/orchestration-patterns/decompose-work-units.md is 30 lines; Design 1 cites the stable-slug clause at :66-68 (actual :24) and effort_cap at :60-62 (actual :18). AP-103's test applies verbatim: open the cited home and the claim cannot be applied from it. The quoted TEXT is accurate in every case, so this is citation drift rather than fabrication \u2014 but the specification's method required path:line for every claim about existing behaviour, and a reader who follows these lands nowhere. Design 1's citations into src/, scripts/, write-artifact.md, activity-worker.md and spawn-agent.md are exact, which is what makes the corpus-technique cluster diagnosable rather than pervasive.",
  "fix": "Re-derive every citation into workflows/**/*.md by grep before any of this prose enters the specification, and substitute Design 2's verified values: scatter-gather.md:22-24 / :30-32 / :34-36 / :38-40; challenge.md:16-20 / :26-28 / :42-44; decompose-work-units.md:16-18 / :22-24; compose-worker-briefs.md:34-38. Record the sweep in the change manifest the way \u00a79 stage 6 records its own."
 },
 {
  "design": "Both",
  "severity": "High",
  "entry": "stale-restatement-after-change",
  "evidence": "Neither design amends the two canon surfaces that still route an author to the operation this capability supersedes. design-principles.md:87 (Prefer Shared Capability) states: 'For mid-phase multi-agent fan-out and consolidate, prefer the meta orchestration-patterns ops and borrowable activities/patterns/ before local spawn-concurrent / merge recipes.' schema-construct-inventory.md:38 states: 'orchestrator-workers / fan-out then consolidate (mid-phase) \u2192 Borrow or bind orchestration-patterns \u2026 bind orchestration-patterns::decompose-work-units \u2192 compose-worker-briefs \u2192 dispatch-workers \u2192 gather-results \u2192 synthesise-results as consecutive activity steps.' Both sentences are already half-false \u2014 I confirmed all 15 dispatch-workers binds sit in activities executed by dispatched workers, so the parallel branch is unreachable at every one \u2014 and both become fully misleading once a graph instance fan owns the shape. AP-129's own test is 'occurrence count against the tree, not against the change's file list'; Design 1 runs that sweep for one destination per exit (31 sites, 18 files) and does not extend it to the fan-out-vocabulary key, and Design 2 runs no sweep at all. Design 1 gets partial credit for making patterns/README.md's 'in-activity fan-out / consolidate only' accurate; Design 2 is silent on the whole surface.",
  "fix": "Add a second sweep key to stage 6 \u2014 the phrasings that route fan-out to orchestration-patterns / activities/patterns \u2014 and amend design-principles.md:87 and schema-construct-inventory.md:38 so each names the layer it now covers: in-activity work units inside one worker for the ops, and the graph instance fan for one activity over N work units. Record both occurrence counts in the manifest alongside the 31."
 },
 {
  "design": "Design 2",
  "severity": "High",
  "entry": "no-partial-implementation",
  "evidence": "As received, Design 2 carries no \u00a77-extension enforcement table, no staged plan, no not-adding list, no #657 per-bind adoption verdict and no residual-risk list, and it never names the stale-restatement sweep or its site count. It does carry enforcement material inline \u2014 L2 re-aimed, L10 widened, L11\u2013L14, four guard families, nine fannability conditions, five serialising surfaces \u2014 but nothing consolidates it into the schema/load/tool/derived/guard placement the specification's \u00a77 establishes, so no reader can check that every invariant has exactly one home, that no declared structure is inert, or that the guard registry stays at 36. Define Complete Scope Before Execution requires the file enumeration before starting; AP-03's Detect is a 'done' claim that leaves scope-manifest items unaddressed. Design 1 supplies all six sections. I note this may be truncation in transmission rather than in the design; I judge what was submitted and say so.",
  "fix": "Extend \u00a77 row by row as Design 1 does, marking each invariant schema / load / tool / derived / guard / not-structural; extend \u00a79 stage-for-stage rather than as a parallel track, keeping the stages-1-to-5 load-refusal so each intermediate stage's zero-corpus-movement criterion is provable; and enumerate what is not added with a trigger each. If the sections exist, resubmit with them \u2014 the ranking turns partly on their absence."
 },
 {
  "design": "Design 2",
  "severity": "High",
  "entry": "schema-is-constraint",
  "evidence": "InstanceFanSchema declares maxInstances as z.number().int().positive() with the message 'a fan admits at least one instance; maxInstances is the longest collection this destination accepts', and the prose says 'Width 1 is admitted and needs no rule: the collection is data, one instance enters as challenge-pass#0, and the barrier releases on its return.' A destination authored with maxInstances: 1 is a destination that can only ever run one instance of one activity \u2014 which is the specification's \u00a74.1 verdict verbatim: 'a one-element list is a plain destination spelled a second way, which One Authoritative Home forbids.' Design 2 neither quotes \u00a74.1 nor answers it, though the submission elsewhere quotes and answers \u00a710 and \u00a76.5 and \u00a75.7 properly. The distinction Design 2 needs \u2014 runtime width versus authored ceiling \u2014 is real, but it does not reach a declared ceiling of one: that ceiling is authored, and it forecloses every width the fan exists for. Design 1 takes min(2) and carries \u00a74.1's reasoning across explicitly.",
  "fix": "Take min(2) with Design 1's message ('a fan admits at least two instances; an exit that leads to one run of one activity names that activity'), and state in the describe text that the runtime width may still be one when the collection holds one element \u2014 the ceiling is what is authored, the width is what is read."
 },
 {
  "design": "Design 2",
  "severity": "High",
  "entry": "io-agnostic-contract",
  "evidence": "unitKey derives the per-instance parameter name from the activity id \u2014 challenge-pass reads its element at challenge_pass_unit \u2014 and L11 requires the fanned activity to declare that name under variables.reads. Two consequences follow from the corpus's own binding contract. First, no technique's canonical input id will ever be <activity>_unit, so every step inside a fanned activity that consumes the unit must carry a rename deviation forever: variable-binding.md:15 makes same-name binding the zero-data path, :29-31 (binding-carries-only-deviations) makes a deviation the exception, and :41-43 (generic-not-overfit) says a name mismatch is resolved by aligning the CALLER's bag variable to the operation's canonical input id, 'not by bending the operation to the call-site', 'so that implicit same-name binding is maximised rather than eroded by per-caller overfitting'. A derived name that can never match any canonical input id erodes it by construction. Second, an activity's variables.reads is its contract on the including workflow (src/schema/variable.schema.ts:63) and Maximize Schema Expressiveness requires I/O contracts to stay portable, describing what a value is 'not which caller, activity, or workflow produces or consumes it' \u2014 a read named after the reading activity describes the consumer. The symmetry defence is real and worth recording: branchKey is <activity>_outputs and the specification blessed it. But branchKey lands in the JOIN's reads, where it distinguishes one producer from several; unitKey lands in the activity's own reads, where it distinguishes nothing. Substitutability also breaks: outside a fan nothing writes <activity>_unit, so unwritten-read at scripts/check-activity-variables.ts:208-215 fires and the activity is fan-only \u2014 SOLID at the Definition Layer's Liskov clause.",
  "fix": "Take Design 1's authored `variable` on the destination, checked against VariableNameSchema at parse time (which alone removes Design 2's L12), with Design 1's L11 requiring the branch to declare it and L12 requiring the workflow file to own it with no defaultValue. Keep Design 2's L15-removal benefit by making L15 the cheap agreement rule Design 1 already writes, and record in the destination's describe text that an author picks the name to match the consuming operation's canonical input id so no rename deviation is needed."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "no-derived-state-shadow",
  "evidence": "Design 2 reverses \u00a75.7 and replaces next_activity_ids with one destination field plus a boolean next_activity_fans, whose value is true exactly when next_activity_id is not a string. That is a pure projection of another declared value's shape, which is AP-112's Detect ('booleans that are true iff a primary enum/string equals a constant') and AP-14's explicit note ('Parallel boolean projections of an enum mode are no-derived-state-shadow'). The specification's own two-field shape was argued not to be a shadow because 'they are the two shapes a destination takes and exactly one is ever populated'; a field-plus-boolean is the shape that IS one. Compounding it, \u00a75.6's control name current_branches then holds a boolean rather than a destination, so the name asserts a collection and carries a predicate \u2014 AP-64 boolean-id-shape ('generic-noun burials', 'ambiguous nouns', with conforming shapes named as affirmative predicates). Design 2 states the dialect constraint honestly (src/schema/activity.schema.ts stepCommonFields gives equality, comparison, bare truthiness, negation, conjunction, disjunction, parentheses and no list or type test) and offers the conservative alternative itself.",
  "fix": "Preserve \u00a75.7 as Design 1 does: keep next_activity_ids, whose presence is the fan signal and whose bare truthiness the dialect already tests, and add one clause saying that for an instance fan it holds the single fanned activity so the width stays the server's to expand. If the boolean is kept anyway, rename the control name to an affirmative predicate (exit_fans) and delete the second destination spelling so only one field carries the destination."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "structure-backed-constraints",
  "evidence": "Design 1 states 'No index-range check on a join's reads. Impossible: maxInstances is a ceiling and the width is a runtime length', substitutes the rule a-join-gathers-the-container-not-an-index, and then concedes in its own residual list that this is 'the sharpest unenforced thing in the design'. The impossibility claim conflates two different questions. Proving slot k WAS filled is undecidable at load, as Design 1 says. Proving slot k can NEVER be filled is decidable from the authored ceiling alone: an index greater than or equal to maxInstances addresses a position no width the destination admits can reach. Design 2's L14 is exactly that check, with its message written. AP-79's Detect is a critical constraint carried by rule text where structural enforcement is available; here it is available, cheap, and one-sided so it cannot false-positive.",
  "fix": "Graft Design 2's L14 into the load rules and keep the scatter-gather rule as the positive guidance it should be. State the residual honestly and narrowly afterwards: the load bounds an authored index against the ceiling, and nothing proves the runtime collection was that long."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "structure-backed-constraints",
  "evidence": "Design 1 leaves all three serialising side effects as criteria with no check \u2014 one git index with no retry on git add, the two shared unprefixed registers written whole, and the provenance log appended in completion order \u2014 and defends the choice with Prefer Removing the Thing That Needs a Prohibition. Two things weaken the defence. First, Design 1 concedes in the same breath that the check is decidable without composing signatures ('a load rule over flattenActivitySteps plus techniqueName \u2014 decidable without composing signatures, so cheap when justified'), so the removal is available and declined. Second, all three failure modes are silent data loss, which is the same class Design 1 itself protects as safety floor for fan-artifact-collision ('data loss, not hygiene\u2026 A later trim may take those; it must not take this one'). Principle 35's own clause covers the case: 'Where both paths must survive, the prohibition names the home that owns the surviving behaviour rather than restating it' \u2014 it does not license leaving a data-loss constraint unenforced. Design 2 mechanises the git-index one as a guard rule and keeps the other two as criteria, which is the better split.",
  "fix": "Mechanise the hardest one \u2014 a fanned activity binds no manage-git or version-control operation and not workflow-engine::commit-and-persist \u2014 as a load rule over flattenActivitySteps plus techniqueName, since it needs no composed signatures. Keep the two register surfaces and the provenance log as criteria in the fannability list with their trigger stated, and say plainly that they are unenforced."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "bind-site-is-orchestration-truth",
  "evidence": "Stage 1's guard obligations read: 'workflow-yaml first; refs, audience, artifact-guides, stealth-isolation, session-contract and activity-variables all load workflows and inherit the result.' There is no session-contract entry among the 36 in scripts/guards.ts \u2014 I enumerated them: binding-fidelity, activity-variables, inherited-inputs, section-framing, citation-grain, identifier-qualification, review-mode-gating, audience, artifact-guides, description-hygiene, checkpoint-entry, checkpoint-presentation, decision-order, bootstrap-self-contained, set-action-values, harness-adapter-set, self-provisioned-input, self-composed-set, branch-as-step, activity-technique-overlap, prism-lens-reachability, resource-anchors, technique-template, variable-model, fragments, stealth-isolation, when-expression, loop-shape, refs, activities, workflow-yaml, site-links, svg-layout, source-encoding, pinned-corpus-paths, lockfile-denylist. scripts/check-session-contract.ts exists on disk with no registry entry and no npm script \u2014 which is precisely the class the registry's own header says it fixed for check-all-refs, validate-activities and validate-workflow-yaml. The design inherits the error from the specification's \u00a79 stage 1 and propagates it, which is AP-107's test: prose enumerating a pass set that is not generated from the authoritative bind site.",
  "fix": "Drop session-contract from the obligations list, and raise the unregistered script as its own finding with its own commit: either register check-session-contract.ts as a 37th entry with a proves line, or delete it. Either way the design's own claim that the registry stays at 36 then means what it says."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "canonical-fact-home",
  "evidence": "The fan's parameter name lives in three places kept in agreement by three load rules: the graph destination's `variable` field, the branch activity's variables.reads (L11), and the workflow file's variables[] (L12) \u2014 with L15 added to force two fans of one activity to spell it identically. Design 1's justification for the workflow-file home is sound and I verified both eliminations: a derived contribution is impossible because VariableDefinitionSchema.type is required at src/schema/variable.schema.ts:13 and the element's type is the collection's element type; and a branch-side write declaration would trip unused-declaration at scripts/check-activity-variables.ts:178-185. But L15 is the shape Prefer Removing the Thing That Needs a Prohibition names: a rule policing agreement between two authored copies. Design 2's derivation removes the need for it outright, at the cost priced in the io-agnostic finding above.",
  "fix": "Keep the authored name \u2014 the binding argument decides it \u2014 but shrink the policing. L12 already forces one workflow-level declaration per name, so state L15 as a consequence of that single declaration rather than as an independent cross-fan comparison, and say in the destination's describe text that the name is the operation's canonical input id so the author has one obvious choice."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "no-partial-implementation",
  "evidence": "Design 2 places the checkout constraint \u2014 'A fanned activity binds no operation of the manage-git or version-control groups and does not bind workflow-engine::commit-and-persist' \u2014 'in the guard beside fan-artifact-collision so that every fan rule needing the technique layer has one home', which puts a technique-BINDING check inside the activity-variables registry entry whose proves line reads 'every activity declares the variables it reads and writes, and every read has a writer on every path'. The specification's \u00a77 row 35 and \u00a710 both assert that entry's registry claim 'survives the change unedited'. fan-artifact-collision already stretches it, on the specification's own authority; a second non-variable family makes the entry's stated claim false, and a reader triaging a finding by registry line is then misdirected.",
  "fix": "Either amend the activity-variables proves line to name what the entry now covers, in one edit, and say so in the plan; or split the two technique-layer families into a 37th registry entry with its own proves line and drop the no-37th-entry claim. Do not leave the registry line asserting a scope it no longer has."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "stale-restatement-after-change",
  "evidence": "Design 2 authors the DestinationSchema doc comment verbatim but leaves the graph field's own description unwritten, rendering it in the generated JSON as the placeholder '<the graph describe text>'. That field is the single highest-traffic sentence in the change \u2014 the specification's \u00a74.1 says so explicitly ('the one piece of text that reaches every reader \u2014 the orchestrator's workflow summary, the generated JSON schema, and the published site') \u2014 and src/schema/workflow.schema.ts currently states 'for each activity, where each of its exits leads \u2026 Omitted only by a workflow whose activities declare no exits', which is a one-destination-per-exit claim. Design 2 likewise places its new inventory row 'beside the Graph row at :65' without amending that row, whose text still reads 'naming the destination activity, or __terminal__ to end the run' \u2014 I confirmed :65 is the Graph row. Design 1 writes both out.",
  "fix": "Author the graph field description covering all three destination forms, as Design 1 does, and amend the inventory Graph row at schema-construct-inventory.md:65 in the same edit. Add both to the stale-restatement sweep's file manifest."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "declared-input-never-read",
  "evidence": "Design 2 models the fan parameter 'the way it already models server-supplied names: ambient to the fanned activity, unwritten for every other activity. unwritten-read already skips AMBIENT_CONTEXT_IDS (:210), so this is one entry in one map scoped by activity id.' AMBIENT_CONTEXT_IDS is not a per-activity map \u2014 it is a global set with three consumers I confirmed: the unwritten-read skip at scripts/check-activity-variables.ts:210, the undeclared-crossing skip at :158, and availableAtEntry's seed at :228. Adding the parameter to it satisfies the read EVERYWHERE, which opens the exact exposure Design 2's own new family (fan-parameter-read-outside-its-branch) exists to close. Threading a per-activity map instead is a change at three call sites plus the unreachableReads argument shape, not one entry.",
  "fix": "State the change at its true size: a per-activity ambient map threaded through the unwritten-read skip, the undeclared-crossing skip and availableAtEntry, with the global set retained for the names that genuinely are ambient everywhere. Add a fixture proving a non-branch activity's read of the parameter IS reported."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "declared-input-never-read",
  "evidence": "Design 1 says the synthetic collection read 'joins two existing passes: the reachability reads map \u2026 and the unwritten-read loop'. It needs three injections, not two. The reachability map is built from record.declaredReads at scripts/check-activity-variables.ts:236, and unwritten-read iterates record.declaredReads at :209 \u2014 so the name must enter declaredReads. But unused-declaration at :170-177 then tests every declaredReads entry against record.derived.reads, and derived.reads is collected from the activity's own steps, gates, loops and transitions, which never mention the fan's collection: the GRAPH reads it. So injecting into declaredReads alone produces a spurious 'declares a read of challenge_perspectives that no step, gate, loop or transition consults' on every fanned activity, in a hard-zero guard.",
  "fix": "Inject the synthetic read into derived.reads as well as declaredReads, or exempt synthetic graph-contributed reads from unused-declaration explicitly. Add the fixture: a correct instance fan produces zero findings, including no unused-declaration on the branch."
 },
 {
  "design": "Both",
  "severity": "Medium",
  "entry": "duplicate-shared-capability",
  "evidence": "After this change two constructs express one shape and only one runs. orchestration-patterns::dispatch-workers keeps its concurrency selection at all 15 binds across 7 files, unreachable at every one because each bind sits in an activity executed by a dispatched worker (depth-1-only, spawn-agent.md:44-46), and the five borrowable pattern activities under meta/activities/patterns/ keep pointing at it. Design 1 declines the repair explicitly and updates only patterns/README.md's framing; Design 2 does not mention it. Prefer Removing the Thing That Needs a Prohibition names this exactly: prose explaining that one path does not run is the tell that two constructs now do one job, and 'retire one and the warning has nothing left to say'. AP-110's own Detect covers 'local re-teaching of concurrent Task / spawn-concurrent / dispatch-then-merge pipelines' \u2014 the inverse now holds, with the shared op being the dead one.",
  "fix": "Decide it in the specification rather than deferring it: either retire the parallel selection from dispatch-workers and let its Capability state the in-activity sequential contract positively, or state in one place \u2014 the op's own Capability, not five READMEs \u2014 which layer owns which shape. Name the decision in the migration surface with its site count so it is scheduled rather than inherited."
 },
 {
  "design": "Both",
  "severity": "Medium",
  "entry": "structure-backed-constraints",
  "evidence": "Both designs keep fan-artifact-collision as the safety-floor check and both inherit its two blind spots, which instances make load-bearing rather than incidental. It sees only a declared #### artifact, so a technique that writes a file without declaring one is invisible \u2014 \u00a711 already records this \u2014 and it cannot see two ELEMENTS of one collection interpolating to the same id, which write-artifact.md:50's series carve-out then turns into a silent create-and-overwrite rather than an update. Design 1 states both residuals; Design 2's artifact section, as received, ends before it reaches them. The one thing that would close the second half is decidable at run time and neither design refuses it: the fan enter already reads the collection and derives each element's id, so duplicate ids are visible there.",
  "fix": "Add a fifth fan-enter refusal in both designs: a collection whose elements do not derive distinct ids is refused, naming the duplicate. That converts the artifact collision, the container slot collision and the gather's expected_ids ambiguity from three silent failures into one refusal, at the one place the values are in hand."
 },
 {
  "design": "Design 1",
  "severity": "Low",
  "entry": "canonical-fact-home",
  "evidence": "Design 1's stage-2 envelope decision has exit_destinations render 'a list for any fanning exit \u2014 the members for a list fan, the single fanned activity for an instance fan', and names the wart itself: \u00a74.1 forbids a one-element list in the graph. The distinction it draws is stateable and I accept it \u2014 an authored spelling must be unique, a derived signal need not be \u2014 but the rendering site is the handler's own projection at src/tools/workflow-tools.ts:1451-1456, built from getExitBindings(...).map(b => [b.exit, b.to]), so the one-element list is a deliberate transformation of b.to rather than a pass-through, and nothing in the tool description says which. Design 2's header renders the destination object instead, which is closer to pass-through \u2014 though its claim to 'report nothing it had to derive' is also imprecise, since it drops maxInstances.",
  "fix": "State in the get_activity tool description that the exit_destinations block is derived and that list-ness is the fan signal carrying no width, so a reader who knows \u00a74.1 does not read the one-element list as authorable. Assert it in the stage-2 test that no rendered message interpolates a destination directly."
 },
 {
  "design": "Design 1",
  "severity": "Low",
  "entry": "engine-internals-narrated",
  "evidence": "The new scatter-gather rule a-join-gathers-the-container-not-an-index reads: 'An instance fan's width is its collection's length when the fan was entered, so a join naming a slot by index reads a position that may not exist and nothing detects it.' The clause 'and nothing detects it' narrates the guard's inability rather than binding the reader's behaviour, which is AP-150's test \u2014 delete the passage and every call the reader makes stays the same. AP-150's do-not-flag covers an invariant that binds the reader ('a marker is unreadable to a context that never received the bytes'); a statement about what the checker cannot see is not one. Design in Positive Present applies too: the rule should state what a join does, not what the engine fails to notice.",
  "fix": "Rewrite as the positive invariant: 'A join reads a fan's container whole and hands it to orchestration-patterns::gather-results with the fan's own collection as expected_ids; the container's order carries the correspondence.' Move the detection limit to the residual-risk list, where its audience is whoever changes the guard."
 },
 {
  "design": "Design 2",
  "severity": "Low",
  "entry": "loop-not-prose",
  "evidence": "The schema construct inventory's activity-level row for 'Repeat for each item / do until done' is the loop step, with .loopType, .variable, .over and .maxIterations \u2014 the same three field names Design 2 borrows. Maximize Schema Expressiveness and the inventory's universal obligation ('Every piece of prose must be checked against this inventory \u2014 if a formal construct exists, it must be used') require the design to name why the loop step is not the most specific construct available. Design 2 never does: it tests the rival lens thoroughly but not the loop. Design 1 does, and its answer is the right one and worth keeping \u2014 the tell is steps: LoopStepSchema is a closed object that CONTAINS its body, a destination NAMES an activity the graph already routes, and a loop body runs in one worker which holds no dispatch primitive, which is why the corpus's whole fan-out vocabulary is unreachable at all 15 of its binds.",
  "fix": "Add Design 1's loop-step disambiguation to Design 2, and put the same distinction in the new inventory row so an author choosing between constructs reads it in the inventory rather than in a planning artifact."
 },
 {
  "design": "Design 2",
  "severity": "Low",
  "entry": "canonical-fact-home",
  "evidence": "Design 2 declares the fan parameter nowhere \u2014 it is server-computed per delivery and deliberately absent from workflow.variables, for a reason I verified is sound (declaring it there puts it in owned at scripts/check-activity-variables.ts:94, which seeds availableAtEntry at :228 and is policy at :244, so a read of it anywhere else in the workflow would be silently satisfied). The cost is that the name has no rendered home at all: get_workflow's variable set never mentions it, identifier-qualification and variable-model never see it, and an author writing the branch's declared read has nothing to read the name off except the derivation rule. Design 1 pays the exposure and closes it with a new guard family instead, which puts the name in the rendered set where an author finds it. Also minor: three instance helpers are declared (baseId, instanceOf, instanceIndex) where the named readers use only two.",
  "fix": "If the derivation is kept, state where an author learns the name \u2014 the inventory row and the destination's describe text are the two candidates \u2014 and keep the fan-parameter-read-outside-its-branch family, which Design 2 already declares. Drop instanceOf unless a reader is named for it."
 },
 {
  "design": "Both",
  "severity": "Low",
  "entry": "canonical-fact-home",
  "evidence": "Both designs quote the corpus census as 17 workflows, 109 activities bound, 207 graph edges, 18 terminal, 0 list-valued and 0 object-valued. Design 1 attributes it to submodule 5f92dc06 via README.md:748; Design 2 states it bare. The corpus for this design is pinned at f3733709. I re-measured at f3733709 and every figure holds exactly \u2014 17 / 109 / 207 / 18 / 0 / 0 \u2014 so the numbers are right, but a count carried across a pin without restating the pin is the drift AP-129 and the plain-language mandate's keep-the-numbers clause both guard against.",
  "fix": "Restate the census against f3733709 in both designs, with the command that produced it, and re-derive it in the stage-7 adoption commit as \u00a79 stage 7 already requires for the coverage baseline and the dry-walk budget."
 }
]
```

### Grafted

- Design 2's L14 into Design 1, replacing Design 1's impossibility claim: an authored index addressing a fan's container must be below that fan's maxInstances. It is sound, one-sided so it cannot false-positive, decidable from the graph object alone, and it converts what Design 1 itself calls 'the sharpest unenforced thing in the design' into a load failure. Design 1's message form, Design 2's rule.
- Design 1's placement of the synthetic collection read into Design 2, and into the merged design: attribute bagName(fan.over) to the BRANCH activity, never to the source. Verified from source — outgoing = incoming ∪ writes at src/utils/activity-variables.ts:623-627, and the entry finding tests against incoming at :649-653 — so branch attribution proves the collection is available on entry to the branch, and source attribution reports falsely whenever the source writes the collection, which is the flagship shape. Drop the routingReads contribution: it is filtered to declared reads at scripts/check-activity-variables.ts:241 and the re-entry family skips written names at :666, so it cannot fire.
- Design 2's verified citations for every corpus technique reference, replacing Design 1's: scatter-gather.md:22-24 (one-gather-contract-two-scatter-modes), :30-32 (isolation-then-combine), :34-36 (order-is-preserved), :38-40 (parallelism-is-optimisation); challenge.md:16-20 (challenge_findings), :26-28 (the scatter phase), :42-44 (its own isolation-then-combine); decompose-work-units.md:16-18 (effort_cap), :22-24 (work_units and the stable slug); compose-worker-briefs.md:34-38.
- Design 2's three falsification tests for the rival lens — the borrowing case against amendment §4 option B, Keep Orchestration in Structure with bind-site-is-orchestration-truth named, and the fatal one, that the fan stops being decidable from the graph object and every one of the corpus's 207 plain destinations becomes ambiguous until its destination activity's file is read. Sharper than Design 1's three counts and it cites the canon entry by name.
- Design 2's checkout constraint as a check rather than a criterion, into Design 1: a fanned activity binds no manage-git or version-control operation and not workflow-engine::commit-and-persist. Decidable from flattenActivitySteps plus techniqueName with no composed signatures — Design 1 concedes this and declines it for the one surface that fails hard rather than silently. Keep the two shared registers and the provenance log as criteria, with their triggers stated.
- Design 2's AP-127 bag-value-as-literal reading, into Design 1's adoption case. Verified: analyse-challenge/TECHNIQUE.md:12 declares challenge_perspectives, and the operative value sits as a JSON-string literal at seven bind sites — 02:196, 04:156, 05:102, 06:134, 07:93, 08:178 and 15:100, six with the three-perspective list and one with two. The fan retires a live catalog finding by promoting six copies to one declared collection, which is a canon dividend both designs earn and only Design 2 names.
- Design 2's empirical union-message probe table (authored form to rendered message), which closes the item both judge panels left open and shows why the error map must enumerate the object's three required fields: a partial object matches no branch far enough to surface a field error, while maxInstances: 0 surfaces the object branch's own field message and an unknown key surfaces the strict rejection, which is what tells an author a name is derived rather than authored.
- Design 2's naming of getCheckpoint's base-fallback convention as the precedent for instance resolution — CHECKPOINT_INSTANCE_SEPARATOR at src/loaders/workflow-loader.ts:449-455 with checkpointBaseId at :452-455 and the base fallback at :464-474, all confirmed present. Whether or not the composite frontier spelling is taken, this is the existing convention for one definition reached N times, and Convention Over Invention requires the merged design to cite it and say which half it takes.
- Design 2's nine fannability conditions as one enumerated list, into Design 1, whose equivalents are scattered across the isolation, artifact and enforcement sections. A criterion an author applies once at design time needs a single readable home, and the list is what makes the corpus survey's verdicts checkable.
- Design 2's measured gate census, into the merged adoption case: 66 of 122 corpus activity files declare no checkpoint, and 11-validate is the only gate-free work-package activity of fifteen. Both figures verified. They establish the point both designs need — that adopters are carved activities, gate-free by construction, so none of §9 stage 7's gate-removal and decision-inventory-diff burden applies.
- Design 1's whole §7-extension table, staged plan, not-adding list, per-bind #657 verdict and residual-risk list into Design 2 if it is carried forward at all. Without them the enforcement placement, the guard count and the stale-restatement obligation are unjudgeable, and all four of Design 2's genuine improvements can be grafted into Design 1 far more cheaply than the six missing sections can be authored into Design 2.
- Design 1's two verified templated-artifact precedents into the merged artifact decision: substrate-node-security-audit/techniques/execute-sub-agent.md:26 declaring {agent_id}.json, guide-mapped at .../resources/README.md:35, and cicd-pipeline-security-audit/techniques/execute-sub-agent.md:22 declaring {scanner_id}.json, guide-mapped at .../resources/README.md:34 — both confirmed present and green today under check-audience and check-artifact-guides. This is the strongest single piece of evidence in either submission and it closes the amendment's blocking artifact decision with an authored corpus shape rather than new mechanism.
- New, owed by both: a fifth fan-enter refusal for a collection whose elements do not derive distinct ids. The enter call already reads the collection and derives each id, so one refusal closes the artifact-filename collision, the container-slot collision and the gather's expected_ids ambiguity at the one point the values are in hand — and it is the only available answer to the blind spot both designs carry forward from §11.
- New, owed by both: amend design-principles.md:87 and schema-construct-inventory.md:38 in the same commit, and add their phrasings as a second key to §9 stage 6's stale-restatement sweep with the occurrence count recorded beside the existing 31 sites across 18 files. Both surfaces currently route an author to an operation whose parallel branch is unreachable at all 15 of its binds and whose shape the graph fan now owns.
- New, owed by Design 1 specifically: drop session-contract from the stage-1 guard obligations and raise scripts/check-session-contract.ts as its own item — it exists on disk with no entry among the 36 in scripts/guards.ts and no npm script, which is exactly the class the registry's header says it fixed for three other scripts. Register it with a proves line or delete it, so the design's no-37th-entry claim means what it says.

## Judge 2

**Verdict:** Design 2 wins on cost and should be the spine, with four grafts from Design 1. On the file-count test the answer is negative for both and the task's premise needs correcting: the extension is not a fraction of the distinct-activity fan, it is co-extensive with it — 38-44 files against the base's 43-48, and on marginal source files Design 1 is 108% of the base while Design 2 is 58%. Design 1 says why in its own plan: stages 1, 2, 4 and 5 must land in the same commits as their §9 counterparts. So the two should merge into one specification with one §10, and the four base-spec refusals this work reopens should be amended once rather than quoted-and-answered in a second document. Design 2's advantage is concentrated exactly where the risk is: it leaves `frontier: z.array(z.string())` and `heldActivity` untouched, so six session and rendering files take no marginal edit inside the #655-gated stage where 66 `currentActivity` references live, and it adds zero new tool parameters by riding the value of parameters the base spec already introduces — reusing `CHECKPOINT_INSTANCE_SEPARATOR` and `getCheckpoint`'s base-fallback convention, a helper whose doc comment describes the instance fan's problem verbatim. That is ladder rung 2 against Design 1's rung 7. On the demand test both designs serve what those files were written for. Walking `meta/activities/patterns/01-orchestrator-workers.yaml:43` end to end: both split it into source, fan and join, both bind `expected_ids: work_units` unchanged because `decompose-work-units` already emits a stable slug id, both need one exit added because the pattern declares none, and Design 2 needs one fewer authoring obligation per consumer. Walking `cicd-pipeline-security-audit/activities/03-primary-scan.yaml:27`: `05-sub-workflow-scan.yaml` already exists, is checkpoint-free and declares no exits, so both need one exit and two graph entries, a carved join because the exit predicate is written by dispatched workers, and both DELETE `scanners_assigned` because the width becomes the collection's length — but Design 2 must also rename `{scanner_id}.json` and its guide row, three file edits per adopter on files green today, which is why Design 1's authored `variable` must be grafted. On the arithmetic the premium is (N-1) x (P + E) with P = 87,324 and E in [39,466, 78,932], giving 253,580-332,512 characters at N=3 — Design 1's figures are exact — but the per-unit-of-work conclusion should read 4.3x to 5.5x worse than the distinct-activity case, not 'about twice': measured against each shape's own alternative the distinct fan costs +53% to +89% and the instance fan +290% to +381%, because a distinct fan's sequential alternative already pays N payloads while an instance fan's pays one for all N units. Neither design reconciles a ceiling of 16 with that, and at 16 the premium is 1.90M-2.49M characters. It is not speculative: no corpus activity is fannable as it stands, but the first adopter's own required changes — one exit on an existing checkpoint-free activity, two graph entries, a carved join, one variable deleted — are worth making independently, because splitting an activity that runs four dispatch groups into distinct graph activities gives each its own exits, artifacts commit, usage row and progress row, which the base spec's §2 names as precisely what in-activity fan-out costs; and `spawn-agent.md:46` already tells authors to hoist such a pass to the orchestrator while offering no construct for it. The simplest sufficient stage one cuts `maxInstances` and its config ceiling and load rule (two homes for one bound, both derived from the same authoring fact, no corpus site needing a tighter-than-server ceiling), Design 2's L14 (which covers the rare half of an unenforceable hazard), Design 1's L15 (which polices spelling), and Design 1's `fan-parameter-read-outside-its-branch` (which closes a hole its own declaration site opens) — leaving a two-or-three-field destination, four load rules, the runtime fan-enter refusals, the dense pre-filled container, and the artifact decision. The dense container and the artifact decision are safety floor and are never cut: a sparse array canonicalises to invalid JSON and a literal filename shared by N instances is data loss through find-or-update, both verified by execution.

**Ranking**

- Design 2 — Instance fan with derived unit name and a composite frontier entry. WINNER on cost. Its marginal server footprint is 7 files against Design 1's 13 for the same capability, because it leaves `frontier: z.array(z.string())` and `heldActivity` untouched and so takes zero marginal edit in `src/schema/session.schema.ts`, `src/utils/session/resolver.ts`, `src/utils/session/store.ts`, `src/utils/session/migration.ts`, `src/tools/resource-tools.ts` and `src/logging.ts` — the files where 66 of the tree's `currentActivity` references live and where stage 5, the #655-gated stage, does its riskiest work. It adds ZERO new tool parameters where Design 1 adds three. It climbs to rung 2 of the ladder (reuse an in-repo helper) by generalising `CHECKPOINT_INSTANCE_SEPARATOR` / `checkpointBaseId` / `getCheckpoint`'s base-fallback (`src/loaders/workflow-loader.ts:441-475`), a helper written for precisely this shape — 'one definition reached N times, discriminated by #, resolved by base' — and retires `checkpointBaseId` with no compatibility alias. Six per-activity projections become instance-correct for free, verified: `activities_without_usage` (`src/tools/workflow-tools.ts:474-475`) diffs `completedActivities` against usage-event activities and both sides carry the composite. Its corpus citations are accurate. It loses on migration fit and on compiler enforcement, both graftable.
- Design 1 — Instance fan with an authored `variable` and an object frontier entry. Second on cost, FIRST on evidence completeness and on migration fit. It buys real things Design 2 does not: the authored `variable` lets the fan's parameter be named `scanner_id`/`agent_id`, so `{scanner_id}.json` and `{agent_id}.json` and their guide rows migrate untouched at both real adopters; the object frontier entry converts six would-be-silent readers into compile errors; its synthetic `over` read is attributed correctly where Design 2's is inert; its fifteen-bind demand walk is complete and includes two honest NOT-SERVED verdicts that reduce its own claim. But it pays for the type safety with 6 extra source files, 3 new tool parameters, a repointed usage projection, a load rule (L15) that polices nothing, and a guard family (`fan-parameter-read-outside-its-branch`) that closes a hole its own choice of declaration site opens. And every one of its five citations into `scatter-gather.md` points past the end of a 40-line file.

### Findings

```json
[
 {
  "design": "Both",
  "severity": "High",
  "entry": "One Authoritative Home",
  "evidence": "The task's premise was that the extension should be a fraction of the distinct-activity fan's staged-plan count. It is not. Counting the files named in the base spec's \u00a79 stages 1-6: 12 src, 4 scripts, 3 tests, 2 schemas, 2 site, 4 docs, 16 workflows = 43 pre-adoption. Design 1's own staged plan names 14 src, 4 scripts, 4 tests, 2 schemas, 2 site, 1 docs, 11 workflows = 38. Design 2's prose implies ~36. On marginal src files (files the extension edits beyond what the base already edits at the same site) the counts are: base 12, Design 1 13 (108%), Design 2 7 (58%). Design 1 states the reason plainly \u2014 'Stages 1, 2, 4 and 5 each extend their \u00a79 counterpart and must land in the same commit as it, because each touches the same declaration, the same projection or the same handler branch and a half-landed union is a parse error waiting for an author.' That is correct and it settles the ordering question the wrong way: this is not a follow-on to a merged capability, it is a co-extensive widening. The consequence neither design draws: the base spec's \u00a710 refusals are being reopened before the base has merged \u2014 'No per-branch metadata in the graph', 'No fan width cap', 'The frontier is a list of activity ids' (Design 1 only), and 'No new envelope field' inverted (Design 2's `next_activity_fans` replacing `next_activity_ids`). Four to five refusals of an unmerged specification.",
  "fix": "Stop calling it an extension. Merge the two documents into one specification with one \u00a710, one staged plan and one cost section, and amend the four reopened refusals once each rather than quoting-and-answering them in a second document. State that the instance and distinct forms land together, which makes the base spec's own cost estimate understated by the marginal amount rather than making this change cheap."
 },
 {
  "design": "Both",
  "severity": "High",
  "entry": "honesty-boundary (ponytail)",
  "evidence": "The per-unit-of-work arithmetic is understated. Derived from source: the sequential alternative is one activity whose loop body runs N times in one worker, paying ONE `get_activity` delivery \u2014 the loop-body technique is bundled once and reused per iteration (`src/tools/workflow-tools.ts:1406`, 'An entry for a step inside a loop body is the protocol for EVERY iteration: engage it once per iteration from the copy you hold'). So premium = (N-1) x (P + E) where P = 87,324 (261,971/3, `docs/dispatch-model.md:86`) and E in [39,466, 78,932] (the dispatch model rates two skipped respawns at 2-4x the 39,466 the content collapsing saves). At N=3 that is 174,648 delivered + 78,932-157,864 establishment = 253,580-332,512 chars, 63,395-83,128 tokens. Design 1's figures are arithmetically exact and I confirm them. But Design 1 concludes 'an instance fan of the same width is about twice as expensive', which is the ABSOLUTE-characters reading, not the per-unit-of-work reading the task asked for. Relative to the alternative each replaces: the distinct fan's premium is 118,000-197,000 over a baseline of 222,505 = +53% to +89%; the instance fan's is 253,580-332,512 over a baseline of 87,324 = +290% to +381%. Per unit of work the instance fan is 4.3x to 5.5x worse, not 2x. Design 1's structural explanation is nonetheless correct and is the sentence to keep: a distinct fan's sequential alternative already pays N activity payloads so its premium is only the forgone collapse; an instance fan's alternative pays ONE payload for all N units, so its premium is that whole payload N-1 times. General form: each extra instance costs 145%-190% of the entire sequential run.",
  "fix": "State the ratio relative to each shape's own alternative (4.3x-5.5x), not the absolute character ratio (2x). Carry the general form \u2014 (N-1) x (P + E), i.e. 145%-190% of the sequential baseline per extra instance \u2014 into `docs/dispatch-model.md` beside the figures, and re-derive against a fresh `npm run bench:batch` before specification prose quotes any of it, as both designs already say."
 },
 {
  "design": "Both",
  "severity": "High",
  "entry": "Prefer Removing the Thing That Needs a Prohibition",
  "evidence": "`maxInstances` and the server ceiling are two homes for one bound, and only one of them has a caller. Design 1 makes the field required with `.min(2)` plus `DEFAULT_FAN_MAX_INSTANCES = 16` plus load rule L14/L18; Design 2 makes it required with `.positive()` plus `DEFAULT_FAN_MAX_INSTANCES = 16` plus load rule L13. Both derive 16 from the same authoring fact \u2014 the widest roster any corpus site authors is ten, verified at `workflows/substrate-node-security-audit/activities/03-primary-audit.yaml:69`, which names exactly ten expected output files; the challenge sites author three and two. So no corpus site needs a per-site ceiling tighter than a server ceiling of 16, and the authored field is speculative on day one. What actually enforces the width is the runtime fan-enter refusal on the collection's length, which both designs have and which is the only check that can see a runtime value at all. Ladder rung 1: does the field need to exist? Not yet.",
  "fix": "Cut `maxInstances` from stage one. The destination becomes `{ activity, over }` (Design 2) or `{ activity, over, variable }` (Design 1). Keep `DEFAULT_FAN_MAX_INSTANCES` and the fan-enter refusal, whose message already names the server ceiling and the collection's length. That removes one schema field, one generated-JSON property, one load rule, and the two-bounds structure. Reinstate `maxInstances` the day a site needs a ceiling tighter than the deployment's \u2014 which is a one-field widening of a union member that already exists."
 },
 {
  "design": "Both",
  "severity": "High",
  "entry": "honesty-boundary (ponytail)",
  "evidence": "The ceiling of 16 is never reconciled with the designs' own arithmetic. Using the derivation above, a fan of 16 costs 15 x (P + E) = 1,901,850 to 2,493,840 characters, 475,463 to 623,460 tokens, spread across 15 fresh worker contexts. Both designs derive 16 from an authoring fact (the widest roster is ten) and neither from a cost fact, while both spend a whole section establishing that the cost is the design's dominant liability. Design 1 even states the reason a byte count is the wrong instrument for the cap \u2014 quoting `docs/dispatch-model.md:76-78` on what the activity cap of 3 covers \u2014 and then sets a fan ceiling five times that cap on authoring evidence alone. The existing precedent argues the other way: `DEFAULT_BATCH_MAX_ACTIVITIES = 3` (`src/config.ts:165`) is deliberately small and its comment points at the measurement home.",
  "fix": "Either derive the ceiling from the premium \u2014 a defensible first value is the width at which one fan's total premium equals one activity cap's worth of delivery, which lands near 3-4, not 16 \u2014 or state 16 explicitly as an authoring-headroom number with the token consequence quoted beside it so a deployment operator sees what a width-16 fan spends before authorising it."
 },
 {
  "design": "Design 1",
  "severity": "High",
  "entry": "Convention Over Invention",
  "evidence": "Design 1 rejects the composite frontier entry it admits is 'genuinely cheaper on paper' and pays 6 extra source files for compiler enforcement. Verified footprint difference: Design 2 leaves `frontier: z.array(z.string())` and `heldActivity` exactly as the base spec declares them, so `src/schema/session.schema.ts`, `src/utils/session/resolver.ts`, `src/utils/session/store.ts` (canonical key ordering), `src/utils/session/migration.ts`, `src/tools/resource-tools.ts` and `src/logging.ts` take no marginal edit; Design 1 changes all six. The repo already owns the convention Design 2 reuses, written for precisely this shape: `CHECKPOINT_INSTANCE_SEPARATOR` at `src/loaders/workflow-loader.ts:448`, whose doc comment reads 'A checkpoint inside a forEach/while loop is defined once but reached N times; yielding it as <baseId>#<instance> ... gives each iteration a distinct checkpoint id', with `checkpointBaseId` at `:451-455` and `getCheckpoint`'s base fallback at `:463-475`. That is one definition reached N times, discriminated by `#`, resolved by base \u2014 the instance fan's problem statement verbatim. This is ladder rung 2 (reuse an in-repo helper) against rung 7 (write the minimum new structure), and Design 1 takes the lower rung while retiring nothing.",
  "fix": "Take Design 2's composite entry and its generalisation of the separator (`INSTANCE_SEPARATOR`, `baseId`, `instanceOf`, `instanceIndex`, retiring `checkpointBaseId` at its three source call sites and one test import with no compatibility alias). Graft Design 1's enumeration of the six affected readers as the stage-5 test list rather than as an argument for the object entry \u2014 see the silent-disable finding below."
 },
 {
  "design": "Design 1",
  "severity": "High",
  "entry": "Match the Harness Surface",
  "evidence": "Design 1 adds three new tool parameters where Design 2 adds zero: `instance_index` on `get_activity` beside the `activity_id` the base spec already adds, `from_instance` on `next_activity` beside `from_activity`, and `instance` on `record_usage`. Under Design 2 the discriminator rides the VALUE of parameters the base spec already introduces. The third is the clearest waste: `record_usage`'s `activity` parameter is already described as 'Activity this figure is attributed to, whether or not the session is still on it' (`src/tools/workflow-tools.ts:1787`) and is stored verbatim with no validation, so an instance-qualified id satisfies the declaration as written and needs no sibling field. Design 1 also concedes the cost of its choice on the usage projection: with a bare `completedActivities` (`src/tools/workflow-tools.ts:772-774`) the `activities_without_usage` diff at `:474-475` collapses N instances into one and hides N-1 missing figures, so Design 1 must repoint that projection. Under the composite both sides of the diff carry the composite and the projection is correct with no code change \u2014 verified, and `scripts/check-session-contract.ts:119` reads `completedActivities` only for emptiness, so nothing downstream objects to a composite there.",
  "fix": "Drop all three parameters. The instance rides `activity_id` and `from_activity` as `challenge-pass#1`, and `record_usage` is untouched. `account-every-activity` in `dispatch-activity.md` gains one clause naming an instance, which both designs already require."
 },
 {
  "design": "Design 2",
  "severity": "High",
  "entry": "Encode Constraints as Structure",
  "evidence": "Design 2's one advertised new check does nothing in the case it is for. It contributes the fan's collection head as a synthetic read attributed to the fan's SOURCE activity and 'adds the same name to `routingReads` (assembled at `:236-240`) so the definite-assignment pass proves the collection is written on every path reaching the fan source'. Verified false on two counts. First, `routingReads` plays no part in the definite-assignment pass: `unreachableReads` uses `reads` for its `entry` findings (`src/utils/activity-variables.ts:648-653`) and uses `routingReads` only in the re-entry pass over strongly-connected components (`:664-672`), so outside a graph cycle the contribution is inert. Second, the caller filters `routingReads` to names the contract also declares \u2014 'A routing read is only checked where the contract declares it too, so a stale declaration cannot conjure a reachability finding out of nothing' (`scripts/check-activity-variables.ts:239-243`) \u2014 and the fan's source does not declare a read of a collection it writes, so the synthetic name is filtered out before it reaches the walk. Design 1 gets this right and states the reason: it attributes the read to the BRANCH (because 'the source may write the collection itself ... so attributing the read to the source would report it falsely') and adds it to the reachability `reads` map, which does feed the definite-assignment pass.",
  "fix": "Graft Design 1's treatment verbatim: contribute `bagName(fan.over)` as a synthetic read of the BRANCH activity, into the `reads` map passed to `unreachableReads` and into the `unwritten-read` loop. That gives both wanted findings \u2014 a fan entered on a path where its collection was never written, and a fan over a collection nothing writes \u2014 under existing family names, with a fan-specific detail string."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "Prefer Removing the Thing That Needs a Prohibition",
  "evidence": "Design 1's new guard family `fan-parameter-read-outside-its-branch` (its I37) closes a hole its own declaration site opens, and Design 1 says so: because the parameter is declared under `workflow.variables[]` it lands in `owned`, and `unwritten-read` skips `owned` (`scripts/check-activity-variables.ts:210`), `availableAtEntry` seeds from `owned` (`:228`) and `policy` is `owned` (`:244`) \u2014 so a read of the parameter anywhere else in the workflow is satisfied by nothing. That is a self-inflicted exposure paid for with a new family name. Design 2's placement \u2014 ambient to the fanned activity, unwritten for every other activity \u2014 makes the native check fire: `unwritten-read` at `:210` skips only `owned`, `writersOf` and `AMBIENT_CONTEXT_IDS`, so for every non-branch activity the parameter is reported natively as \"reads 'X', which no activity in this workflow writes and the workflow file does not own\". No new family needed, only a better message.",
  "fix": "Model the fan parameter as ambient-to-the-branch rather than workflow-owned, and demote `fan-parameter-read-outside-its-branch` from a new family to a detail string on the existing `unwritten-read` finding. That deletes Design 1's L12 (workflow declares it with no default) along with it, since there is no workflow-file declaration to police."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "Encode Constraints as Structure",
  "evidence": "Design 2's ambient placement has an unnamed cost that partly offsets the win above. `AMBIENT_CONTEXT_IDS` is a global set (`src/utils/binding-provenance.ts:33`, three members) and it is seeded flat into `availableAtEntry` (`scripts/check-activity-variables.ts:228`), which `unreachableReads` takes as a single `ReadonlySet<string>` (`src/utils/activity-variables.ts:577`). So a per-activity ambience needs either the name added globally \u2014 which reopens exactly the hole Design 1 opens \u2014 or a signature extension to `unreachableReads` carrying a per-activity ambient map. Design 2 says 'this is one entry in one map scoped by activity id' and does not name the `availableAtEntry` consequence; without the extension the fanned activity's own legitimate read of its unit is reported by `unreachable-read`.",
  "fix": "Name the signature change. `unreachableReads` is already being changed in the base spec's stage 3 to take `fanGroups`, so a per-activity `ambientPerActivity` parameter lands in the same edit at no extra file cost. State the fixture that proves the branch's own read is not reported and a sibling's is."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "One Authoritative Home",
  "evidence": "Design 1's L15/I19 \u2014 'Two fans of one activity hand the element at the same name' \u2014 is a load rule policing an invariant that has no corpus instance and that a derived name makes unrepresentable. No site in the corpus fans one activity twice; Design 1's own 'Not adding' section says the object form was chosen partly because 'the graph never names an instance', and its serves-#657 walk finds no site wanting two fans of one activity. The rule exists solely because the parameter name is authored rather than derived, and its whole content is 'authors must spell it the same way twice' \u2014 the class of prohibition principle 35 says to design out.",
  "fix": "Cut L15. Keep the authored `variable` field for the migration reason below, but drop the rule: the second fan's disagreement is caught by L11 (the branch declares one read for its element), which fires on whichever fan disagrees with the declaration."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "Non-Destructive Updates",
  "evidence": "Design 2's derived `unitKey(activityId)` forces a rename of two artifact templates that are green, guide-mapped and already the exact shape the design needs \u2014 at both of the two sites that are the day-one callers. Verified: `workflows/substrate-node-security-audit/techniques/execute-sub-agent.md:26` declares artifact `{agent_id}.json` with `audience: agent`, guide-mapped at `workflows/substrate-node-security-audit/resources/README.md:35`; `workflows/cicd-pipeline-security-audit/techniques/execute-sub-agent.md:24` declares `{scanner_id}.json`, guide-mapped at `workflows/cicd-pipeline-security-audit/resources/README.md:34`. Design 2's own artifact rule requires the branch's `#### artifact` to carry 'the fan's derived unit as a {token}', which for a branch carved from `05-sub-workflow-scan` is `sub_workflow_scan_unit` \u2014 so the template must become `{sub_workflow_scan_unit.id}.json` (legal: `ARTIFACT_NAME_PATTERN` at `src/schema/technique.schema.ts:54` admits dots inside braces), which means editing the `#### artifact` declaration, the `#### scanner_id` input block and the guide row, at each site. Design 1's authored `variable` can simply be named `scanner_id` / `agent_id` \u2014 both pass `QUALIFIED_DATA_ID_PATTERN` at `src/schema/identifiers.ts:16` \u2014 and both templates and both guide rows migrate untouched. This is owner input 2's concern exactly, and it is the one place Design 2's leanness buys corpus churn.",
  "fix": "Graft Design 1's authored `variable` field into Design 2 (three graph fields become four, or two become three once `maxInstances` is cut) with L15 dropped and the parameter kept ambient-to-the-branch rather than workflow-owned. That takes Design 1's migration fit without Design 1's guard family or its L12/L15. The alternative \u2014 permitting the artifact template to project `{unit.id}` and stating so in `fan-artifact-collision`'s instance arm \u2014 is cheaper in the schema but still edits three files per adopter."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "One Authoritative Home",
  "evidence": "`maxInstances: z.number().int().positive()` admits a declared ceiling of one, and Design 2 says 'Width 1 is admitted and needs no rule'. That conflates the runtime width (data, legitimately one) with the declared ceiling (authoring, and a ceiling of one is a plain destination spelled a second way). The base spec's \u00a74.1 already reasons this way about a one-element list: 'a one-element list is a plain destination spelled a second way, which One Authoritative Home forbids'. Design 1's `.min(2)` carries that reasoning across correctly and states it.",
  "fix": "If `maxInstances` survives the cut recommended above, use Design 1's `.min(2)` and its message: 'a fan admits at least two instances; an exit that leads to one run of one activity names that activity'. If the field is cut, the finding dissolves."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "Document in Positive Present",
  "evidence": "Every one of Design 1's five citations into `workflows/meta/techniques/scatter-gather.md` points past the end of the file. The file is 40 lines. Design 1 cites `:87` (the sequential mode), `:96-98` (`one-gather-contract-two-scatter-modes`), `:104-106` (`isolation-then-combine`), `:108-110` (`order-is-preserved`) and `:112-114` (`parallelism-is-optimisation`). The correct lines are `:22`, `:30`, `:34` and `:38`; the sequential-mode sentence is inside `:22-24`. Design 2 cites `:22-24`, `:30-32` and `:34-36` \u2014 exact. Design 1's quoted CONTENT is accurate at every site, so the claims are true and only the references are wrong; but the task method says to cite path:line for every claim about existing behaviour, and a specification carrying five dead references into the corpus rule file the whole isolation argument rests on is a defect a reviewer trips on immediately. Design 1's citations into `src/` are, by contrast, essentially all correct \u2014 I spot-verified about thirty of them.",
  "fix": "Repoint the five references. Also give `write-artifact.md` its real path in both designs \u2014 it is `workflows/work-package/techniques/manage-artifacts/write-artifact.md`, not a meta technique, and both designs cite it bare."
 },
 {
  "design": "Both",
  "severity": "Medium",
  "entry": "Prefer Removing the Thing That Needs a Prohibition",
  "evidence": "Neither design states the disposition of the five borrowable pattern activities whose fan-out reason for existing this capability supersedes. `workflows/meta/activities/patterns/01-orchestrator-workers.yaml:43`, `02-supervisor.yaml:48`, `04-isolated-fan-out.yaml:47` and `05-lead-researcher.yaml:47,:76` bind `orchestration-patterns::dispatch-workers` at five sites, and Design 1's own verdict on site 1 is that the pattern loses 'its identity as a borrowable activity \u2014 a graph shape cannot be borrowed ... and the pattern's home moves from the file to the inventory row'. That is a correct diagnosis with no prescription. Under the project's own rule \u2014 no backward compatibility, remove obsolete paths rather than adding compatibility layers, deletion preferred over addition at every rung \u2014 a superseded pattern activity that nothing can execute is a file to retire, not to leave beside its replacement. Design 1 gets as far as noting that `patterns/README.md`'s claim 'becomes the accurate description of what stays behind'.",
  "fix": "Add one row to the staged plan naming each of the five patterns' disposition: retire the fan-out half of `01`, `02`, `04` and `05` in the adoption commit, keep `03-plan-and-execute` (it binds no dispatch), and rewrite `patterns/README.md` to describe only what remains. That is deletion counted as progress, and it removes five files' worth of unexecutable vocabulary in the same change that makes the vocabulary expressible elsewhere."
 },
 {
  "design": "Both",
  "severity": "Medium",
  "entry": "parallelism-is-optimisation (scatter-gather)",
  "evidence": "The challenge site is presented as 'the strongest shape match' and 'the strongest candidate first adopter in the corpus', which invites a reader to adopt it first, while both designs' own arithmetic says it is a cost regression. Verified: the challenge/combine pair sits inside `doWhile has_resolvable_assumptions, maxIterations: 10` (`workflows/work-package/activities/04-research.yaml:137-146`) at seven binding sites \u2014 `02-design-philosophy.yaml:196`, `04-research.yaml:156`, `05-implementation-analysis.yaml:102`, `06-plan-prepare.yaml:134`, `07-assumptions-review.yaml:93`, `08-implement.yaml:178`, `15-codebase-comprehension.yaml:100` \u2014 with three perspectives at six and two at the seventh. So the fan is 2-3 wide, the per-instance work is one reasoning pass over a log, and the premium is (N-1) whole activity payloads per pass for up to ten passes, replacing three-line loop bodies that RUN today because sequential scatter-gather needs no dispatch primitive. The corpus states the governing rule itself: 'Where genuine parallel fan-out is not needed, sequential mode (the concurrency = 1 case) is the correct default' (`workflows/meta/techniques/scatter-gather.md:38-40`). Design 1 reaches the right conclusion and puts cicd first; the framing still oversells the site.",
  "fix": "Recast the challenge site from 'strongest shape match' to 'the shape match that the arithmetic disqualifies', with the (N-1) x 10-passes figure stated in the same paragraph, and record the one thing migration would genuinely buy \u2014 promoting six identical bind-site literals of the perspective list to one declared collection \u2014 as an independent cleanup that needs no fan."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "Encode Constraints as Structure",
  "evidence": "Design 2's base resolution is convention-enforced, not compiler-enforced, and two of the six affected readers fail SILENTLY rather than noisily. Verified: `validateActivityTransition` calls `exitDestinations`, which returns `[]` for a composite id, and then `if (valid.length === 0) return null` (`src/utils/validation.ts:45-47`) \u2014 the check is disabled, not wrong. `validateReportedExit` reaches the same `null` at `:243-244`. The noisy ones are recoverable in review (`validateStepManifest` returns \"Cannot validate manifest: activity 'challenge-pass#1' not found\" at `:101-102`; `validateActivityManifest` warns 'references unknown activity' at `:269-270`), but the two silent ones are exactly the class Design 1's object entry is proposed to eliminate. Design 2's two edits \u2014 a base fallback in `getActivity` (`src/loaders/workflow-loader.ts:436-439`) and a base lookup in `getExitBindings` (`:496`) \u2014 do close all six, and the pattern is already load-bearing for checkpoints and has held. But the protection is tests, not types.",
  "fix": "Graft Design 1's reader enumeration as Design 2's stage-5 acceptance list, one test per reader, with the two silent-disable readers called out as such: a fan-instance transition whose reported exit is NOT bound must be refused, proving `validateReportedExit` is live and not merely returning null. That is one runnable check per hazard \u2014 the safety floor's own requirement \u2014 and it costs a test file, not a schema."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "Prefer Removing the Thing That Needs a Prohibition",
  "evidence": "Design 2's L14 \u2014 'An authored index addressing a fan's container is within that fan's declared width' \u2014 covers the rare half of a hazard and advertises coverage it does not have. `maxInstances` is a ceiling; the width is the collection's length at the fan-enter. So L14 catches `{challenge_pass_outputs.7...}` against `maxInstances: 6` and misses the far commoner `{challenge_pass_outputs.2...}` against a two-element collection, which is undetectable at load (no width to compare) and at guard grain (the lattice is a name set carrying no length). Design 1 declines the rule entirely, states the impossibility, and answers with the rule `a-join-gathers-the-container-not-an-index` \u2014 which is the right instrument, and which Design 2 also states.",
  "fix": "Cut L14. Keep `a-join-gathers-the-container-not-an-index` in `scatter-gather.md` as both designs have it, and record the unenforceability as a residual rather than half-mechanising it. This cut follows for free once `maxInstances` is cut per the earlier finding."
 },
 {
  "design": "Both",
  "severity": "Low",
  "entry": "One runnable assert-based check (safety floor)",
  "evidence": "Stage 3's instance fixtures verify a property the flatten's own dedupe already guarantees. `activityGraph` already dedupes its destination list (`src/utils/activity-variables.ts:543`, `[...new Set(Object.values(...))]`), and both designs prove \u2014 correctly \u2014 that an instance fan collapses to one graph node, that the union arrival is idempotent over instances, and that the lattice is N-independent because a branch contributes one flat bag name whatever landed under it. Given that proof, Design 1 schedules three fixtures (meet-indistinguishable-from-a-plain-edge, all-duplicate-predecessors-removed, collection-written-on-one-path-only). The first is what the proof establishes; the third is the genuinely new check.",
  "fix": "Keep one fixture \u2014 the collection written on only one path reaching the fan is reported \u2014 plus the duplicate-predecessor fixture, which guards the trap both designs correctly identify. Drop the meet-equals-plain-edge fixture and cite the proof instead; the dedupe placement inside `activityGraph` is what makes it structural."
 },
 {
  "design": "Both",
  "severity": "Low",
  "entry": "Convention Over Invention",
  "evidence": "Two small citation slips beyond the scatter-gather block. Design 2 cites the bag-name grammar at `workflows/meta/techniques/variable-binding.md:19`; it is at `:18` (Design 1's `:18` is correct). Both designs cite `write-artifact.md` without a path; the file is at `workflows/work-package/techniques/manage-artifacts/write-artifact.md`, 50 lines, and both designs' content citations into it are accurate (`:12-14` server-provided `artifact_prefix`, `:41-48` find-or-update, `:50` the SERIES note).",
  "fix": "Repoint `variable-binding.md:18` and give `write-artifact.md` its full path at first mention in whichever document survives."
 },
 {
  "design": "Both",
  "severity": "Low",
  "entry": "Maximize Schema Expressiveness",
  "evidence": "A derived unit name stammers on some activity ids and neither design names it. `unitKey('worker-unit')` is `worker_unit_unit`; `unitKey('work-unit-execution')` is `work_unit_execution_unit`. It passes `QUALIFIED_DATA_ID_PATTERN` and it is not wrong, but it reads badly in the one place an author is asked to declare it (the branch's `variables.reads`, per L11). The corpus's likely branch names \u2014 `sub-workflow-scan`, `crate-review`, `challenge-pass` \u2014 are all fine, so the population is narrow.",
  "fix": "Note it in the derived-name doc comment as a naming consideration for a fanned activity's id, one sentence, no mechanism. It is a reason to prefer Design 1's authored `variable` at the margin, and it is subsumed by the migration finding that already recommends grafting it."
 }
]
```

### Grafted

- Design 2's composite frontier entry, whole, including the generalisation of `CHECKPOINT_INSTANCE_SEPARATOR` into `INSTANCE_SEPARATOR` / `baseId` / `instanceOf` / `instanceIndex` and the retirement of `checkpointBaseId` with no compatibility alias (three source call sites at `src/loaders/workflow-loader.ts:473,474` and `src/utils/validation.ts:89`, one test import). This is the single largest cut available: it removes 6 marginal source files, 3 new tool parameters and one repointed usage projection from Design 1's footprint, inside the stage that is gated on #655.
- Design 2's two base-resolution edits — a base fallback in `getActivity` (`src/loaders/workflow-loader.ts:436-439`) mirroring `getCheckpoint`'s at `:463-475`, and a base lookup in `getExitBindings` (`:496`) — plus Design 1's enumeration of the six affected readers repurposed as the stage-5 test list, with the two SILENT-disable readers (`validateReportedExit` at `src/utils/validation.ts:243-244`, `validateActivityTransition` at `:45-47`) each carrying a test that proves the check is live rather than returning null.
- Design 1's authored `variable` field, with its L15 dropped and the parameter kept ambient-to-the-branch rather than declared in `workflow.variables[]`. This is the one thing Design 1 has that Design 2 needs: it lets the fan's parameter be named `scanner_id` / `agent_id` so `{scanner_id}.json` (`workflows/cicd-pipeline-security-audit/techniques/execute-sub-agent.md:24`, guide row `resources/README.md:34`) and `{agent_id}.json` (substrate `:26`, guide row `:35`) migrate untouched and green at both day-one adopters.
- Design 1's synthetic `over` read, attributed to the BRANCH and added to the `reads` map that feeds `unreachableReads`' definite-assignment pass (`src/utils/activity-variables.ts:648-653`) — replacing Design 2's `routingReads` contribution, which is inert outside a cycle and filtered out by `scripts/check-activity-variables.ts:239-243` before it reaches the walk. Design 1's stated reason for the branch attribution (the source may write the collection itself, so attributing there reports falsely) is the correct one.
- Design 1's fifteen-bind demand walk, verbatim, including its two honest NOT-SERVED verdicts (`patterns/02-supervisor.yaml:48`, whose `dispatch_concurrency: 1` over a one-element collection wants a plain edge; `substrate-node-security-audit/activities/02-reconnaissance.yaml:37,:49`, which is a chain of two activities) and the substrate mixed-roster limit at `03-primary-audit.yaml:48`, which migrates as three chained nodes and so forfeits the single-simultaneous-batch rule stated at `substrate-node-security-audit/workflow.yaml:19`. Design 2's serves-#657 field is absent from what I received; this is the field that establishes the capability is not speculative and it must come from Design 1.
- Design 1's "what a character count cannot see" paragraph, as the honest counterweight to the negative arithmetic and the one argument that survives it: `deliveredChars` counts delivered payloads only and never generated ones (`src/utils/batch.ts:98-123`), so nothing bounds intra-activity reasoning-pass accumulation, and a fan converts unbounded growth in one context into N bounded contexts. That is a correctness purchase where the distinct fan's was a latency purchase, and it belongs beside the negative token number rather than after it.
- Both designs' dense, pre-filled, positionally-written container — verified at source and NOT an over-engineering finding. Executed against the real canonicaliser's logic: a sparse array (what an out-of-order retirement into a fresh `[]` produces) renders as `"[\n,\n,\n {…}\n]"` through the array branch at `src/utils/session/store.ts:171-175` and fails to reparse with `Unexpected token ','` — invalid JSON, HMAC-sealed and written by `atomicWrite`, unreadable on reload. An object with numeric keys persists as "0","1","10","2" through `sortedKeys` at `:151-157`, breaking `order-is-preserved` (`workflows/meta/techniques/scatter-gather.md:34-36`). A dense pre-filled array preserves index order. This is a safety-floor item both designs reached independently and correctly; it is never simplified away.
- Design 1's L2 re-aim rather than L2's withdrawal, with its message pointing the author at the object form. The amendment says 'The message and the rule are withdrawn'; both designs correctly keep the rule for the LIST spelling, because a repeated literal in a list carries no data and cannot produce differing work — proved by the token grammar at `src/utils/activity-variables.ts:213`, which admits literal path segments only, so `{collection.{index}}` is unexpressible and an ordinal buys the instance nothing.
- Both designs' fannability criteria for the three serialising side effects — one git index with `.git/index.lock` and no retry on `git add` (`workflows/work-package/techniques/manage-git/../workflow-engine/commit-and-persist.md:31` retries a failed push only), the two shared unprefixed registers written whole (`append-deferred-item`, bound live at `work-package/activities/07-assumptions-review.yaml:142-144`), and the append-ordered provenance log — kept as criteria applied once at design time and deliberately NOT mechanised. Both designs get this right and for the right reason: prose warning 'do not also bind X' is what principle 35 says to design out, and the removal here is upstream in which activity you choose to fan.
- The corroborating sentence neither design quotes, which is the strongest evidence against speculation: `depth-1-only` already instructs authors to 'Hoist a pass there when its fan-out is worth an orchestrator-owned step; otherwise author it sequential and size the work accordingly' (`workflows/meta/techniques/harness-compat/spawn-agent.md:46`). The corpus contains a written instruction to do exactly what this capability makes expressible, and no construct that satisfies it. Put that sentence in the summary.
