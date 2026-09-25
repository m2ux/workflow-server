# Delivery model

[Resolution](resource-resolution-model.md) says which file a name reaches. This document says what then travels to an agent: how a role's contract is assembled, how much of it one context may hold, and what each delivery costs.

Three budgets run through it, all measured in characters and each protecting something different. One bounds what a single activity may spend on content the worker did not ask for. One bounds what a worker may accumulate across a run of activities. One bounds what a single tool result may carry. They are set independently because they answer different questions, and the sections below take each in turn.

## What a role receives

The server resolves an activity's declared references and bundles them into the buckets [resolution](resource-resolution-model.md#how-a-reference-resolves) produces, so an agent never chains resolution calls of its own at runtime.

<a id="the-orchestrator-bundle"></a>

### The orchestrator bundle

The response is the union of two sets, deduplicated: the technique references the workflow declares, and the core orchestrator references the server always includes (`CORE_ORCHESTRATOR_TECHNIQUES` in `src/loaders/core-ops.ts`) — engine traversal, state persistence, sub-agent dispatch and orchestrator discipline.

Every operation in that union arrives with its body: its capability, its interface, its procedure, and the rules that technique itself declares. Rules and inputs a scope shares with every technique under it arrive once under `contracts`, and each body names those scopes in `inherits`.

#### Where a rule lives

A rule a technique declares governs that operation. So it rides the body that states it, where a reader meets it beside the procedure it constrains. A rule a workflow or group contract shares with every technique under that scope arrives once under `contracts`, and the body names that scope in `inherits`. The response's `rules` list carries what is left: the role's own rules, declared standalone and referenced by the workflow, which govern the agent rather than any one operation. The three sets are disjoint, so no rule is read twice, and an activity whose every rule belongs to an operation or a scope sends no list at all. The body wins ties against the flat list, because it can say which operation a rule binds and a flat list cannot.

Below the separator rides the workflow metadata, whole. It carries what an orchestrator drives a run from: the rules, the variable roster, the graph and the activities. The roster gives every name the run holds with its type, its value set and its starting value, because the orchestrator has to recognise a name a worker reports back and read a value out of the session by it.

What the metadata never carries, at any size, is the prose explaining what each variable is *for*. That absence is the contract rather than a limit being reached. Nothing the orchestrator decides turns on that prose, and the activity that produces a value and the activity that consumes it each carry it in their own definition, delivered whole to the worker dispatched there.

<a id="the-worker-bundle"></a>

### The worker bundle

The response is the union of the activity's declared technique references and the core worker references the server auto-includes (`CORE_WORKER_TECHNIQUES` in `src/loaders/core-ops.ts`): the worker role itself, finalize-activity, and the conduct every worker is held to. The role is in that set because every worker stub names it and only the meta workflow declares it, so a client worker would otherwise be told to apply a technique its bundle never carried.

### What arrives only where it can be reached

Three things are added by the delivery rather than carried in a core list, because each is decidable from definitions the server has already loaded and each is dead weight where the answer is no.

| Content | Delivered when |
|---------|----------------|
| `ORCHESTRATOR_CHECKPOINT_TECHNIQUES` — `present-checkpoint-to-user`, `respond-checkpoint` | any activity of the run declares a `kind: checkpoint` step |
| `WORKER_CHECKPOINT_TECHNIQUES` — `yield-checkpoint`, `resume-from-checkpoint` | the same reading, over the same roster |
| `FAN_DISPATCH_TECHNIQUES`, and the rules named in `FAN_ONLY_RULES` | the graph fans an exit |

Each reading is over the **whole workflow**, not the activity in hand. That is load-bearing rather than approximate. A bundle's rules are keyed as one set, so a technique set that varied activity by activity would re-deliver the entire rules list at every activity whose set differed — which costs several times what the narrower reading saves.

What is held back stays reachable. A worker may raise a decision its activity never declared, and an orchestrator then has to present and resolve it, so both checkpoint pairs are servable by `get_technique { technique_id }` from any session. That is what makes the omission safe rather than merely cheap.

<a id="asking-for-one-by-name"></a>

#### Asking for one by name

`get_technique` takes `step_id` or `technique_id`, never both. They answer different questions:

| Parameter | Names |
|-----------|-------|
| `step_id` | The technique a step binds |
| `technique_id` | An operation of the caller's role contract — one it has reached but was not sent, such as the checkpoint pair above, or one whose delivery its context no longer holds |

Only operations this session's definitions name are servable. Passing `activity_id` alongside makes a step id that resolves against a moved activity pointer fail, rather than quietly returning a technique from the wrong activity.

### What the two core sets contain

Both sets are declared in [`src/loaders/core-ops.ts`](../src/loaders/core-ops.ts), which is the list to read. What each covers:

| Set | Covers |
|-----|--------|
| `CORE_ORCHESTRATOR_TECHNIQUES` | Engine traversal and transition evaluation, state persistence and committing, sub-workflow handling, prompt composition, the Git operations a commit needs, and the harness adapters that spawn and resume a sub-agent |
| `CORE_WORKER_TECHNIQUES` | The worker role itself, and finalizing an activity |

Both also name **conduct**, which is the engine's baseline rather than a workflow's choice, so no workflow declares it. The rules binding every agent appear in both sets. The rules specialising one role appear only in that role's set.

## The three budgets

### The window budget

This one bounds a single `get_activity`. It asks how much of its own context a worker may spend on content it did not ask for: a step whose gate may still turn out false, a resource its technique merely links.

```
window budget    context_tokens × headroomFraction × charsPerToken
```

`headroomFraction` (default 0.80) and `charsPerToken` (default 4) are server config, overridable with `BUNDLE_HEADROOM_FRACTION` and `BUNDLE_CHARS_PER_TOKEN`.

What the activity walks unconditionally — the definition, the role's `rules`, the operations of its contract — rides whatever the budget says, because it is not speculative. An unchanged-reference marker draws the budget down by nothing, the context it goes to holding that content already.

What the budget is spent on, each stage stopping at the first entry that would overflow what remains:

| Order | Content | Left to |
|---|---|---|
| 1 | step technique bodies, in document order | `get_technique { step_id }` at the step |
| 2 | eagerly bundled resource bodies | `resource_refs`, fetched with `get_resource` |

A body the budget leaves out is recorded as delivered to nobody: a ledger entry for it would collapse a later delivery to a marker for bytes the worker never received.

### The batch budget

This one bounds a **run** of activities. One dispatch may carry several rather than exactly one, and the worker walks them under a single `agent_id`, so it pays the harness's context establishment — system prompt, project instructions, tool schemas — once for the run rather than once per activity. That saving is the point of batching; it is larger than anything the delivered content saves by collapsing.

The run pauses at every activity boundary, because the orchestrator owns the commit that boundary requires, and at every gate, because the orchestrator owns the answer. It **resumes in place** across both, under the identity its dispatch bound, so a pause costs a round trip rather than a respawn. [Dispatch](dispatch-model.md) covers the topology.

#### The server bounds the run

A batch is not declared. It is the run of activities one delivery scope takes delivery of, so the server sees it with no orchestrator cooperation, and a worker that omits a parameter does not escape it. The scope is the caller's `agent_id`, which is not authenticated, so this bounds a cooperating topology rather than an adversarial one. Two limits apply, both read off the session history:

| Limit | Derivation | Default |
|-------|------------|---------|
| Cumulative delivered characters | `context_tokens × BATCH_HEADROOM_FRACTION × BUNDLE_CHARS_PER_TOKEN` | fraction `0.35` |
| Distinct activities | `BATCH_MAX_ACTIVITIES` | `3` |

The fraction is its own rather than the window budget's, because the two answer different questions. Set this one as high as the window budget and a whole long workflow would fit in a single context, which is what the activity cap exists to prevent.

The activity cap covers what a character count cannot see: the context the harness establishes and the server never delivers, the code the worker reads, the artifacts it drafts, and the degradation that comes with a long walk.

#### Which limit binds

At a large window the activity cap binds first, because the characters run out later than the count does. A worker declaring a smaller window is bounded proportionally, and below some point the character budget takes over instead.

Measure rather than assume: `npm run bench:batch` reports the figures for the corpus in front of you. It counts eager activity payloads only and never a lazy fetch, so its number is a floor — what a batch really accumulates includes everything the worker goes back for, and that half is usually larger.

Admission is checked *before* a delivery rather than after, so the admitted activity can carry a batch past the budget by up to one heavy activity. Refusing after composing would pay the composition and still not un-deliver it.

#### Revising either value

The cap covers context the server never delivers. So a revision rests on `batch_refused` counts and per-activity usage rows over real runs, not on a benchmark that only sees payloads.

#### Counting each delivery once

A dispatch's recorded size is the whole activity response, so anything bundled eagerly is already inside that figure; what counts on top is only what the worker went back for. Counting a bundled entry both ways would overstate every activity that bundles anything, and compound across a run.

`get_activity` reports where a context stands in `_meta.batch` — `activities_delivered`, `max_activities`, `delivered_chars`, `budget_chars`, `may_continue` — so the ordinary end of a batch is the worker stopping. The count is of activities **delivered** to that context. That is the only count the session can answer, a delivery being the sole record that an activity reached a context, and the only one both limits are about, since each protects what a context is holding.

Asking past the bound is refused with the payload undelivered, and a `batch_refused` history event names the limit. It is recorded once per scope, activity and limit, so the tally counts how often a limit bound rather than how often a worker retried.

`may_continue` is answered as of that delivery. The worker then fetches techniques and resources lazily while it runs the activity, drawing down the same budget, so a batch reported as having room can still be refused at the next boundary. `next_activity` answers the same question at the boundary instead: pass the exiting worker's `agent_id` and `context_tokens`, and its `_meta.batch` counts those lazy fetches. That is the reading a continue-or-respawn decision wants.

A refusal is an expected outcome rather than an error. The orchestrator releases the identity and dispatches a replacement, which must carry a **new** `agent_id` — the bound is keyed on the identity, and a fresh context under a used one would receive markers for content it does not hold.

Three carve-outs keep the bound aimed at what it is for:

- **A context that has taken no activity is always admitted its first.** Lazy reads draw down the same budget, so a scope that read past it before taking any activity would otherwise be refused the work it was spawned to do.
- **An activity the context already holds is always served.** That is a worker resuming after a gate and asking for the payload it is sitting on, which is the ordinary shape of any activity carrying a checkpoint.
- **The session's own agent is unbounded.** A scope equal to `session.agentId` owns the whole walk by construction, which is what `contextMode: "persistent"` describes; its run is the session, not a batch. `agentId` is caller-set — `dispatch_child` defaults it to `"worker"`, and a resume rebinds it to the resuming caller's `agent_id` — so a dispatched worker passing the session's own identity is unbounded, and the exemption can move across a resume. Minting one identity per dispatch, which the corpus already requires, keeps it where it belongs.

#### A refusal pins the session version

The refusal is a history event, and loading a session validates every event against a strict list. An older server meeting an event it does not know fails that validation, which surfaces as `SEAL_MISMATCH` — the error usually read as tampering or a rotated key. Downgrading therefore means stripping those events or retiring the session. Reading an older session on this server is unaffected.

#### A failed resume costs one activity

The worker reports each activity as it completes, so the session cursor tracks the run. A replacement picks up the current activity, takes full delivery, and re-crosses already-answered gates silently: checkpoint responses are keyed `activityId-checkpointId` with no agent component, so `yield_checkpoint` replays them for any worker.

#### Cost keeps per-activity resolution

`record_usage` records one `activity_usage` row per activity a dispatch covered, sharing an `agent_id`, rather than one figure per dispatch attributed to whichever activity the orchestrator names. Without that, a batch size cannot be calibrated from real runs.

### What one tool result may carry

`MAX_RESPONSE_CHARS` (default 60,000) is measured over the whole result: the response text, plus the protocol metadata a client weighs beside it — the artifact contract, the exit destinations, the gate readings and the delivery cost. An orchestrator's delivery is measured against the same figure as a worker's, because both open a role's work.

It decides nothing about what a delivery holds. A delivery past it goes out whole, and the server logs that it did. Nothing gives way, because nothing can give way without discarding what the response exists to carry.

That log line is the signal that the work has outgrown a single handover. For an activity, the answer is to divide the activity. For an orchestrator bundle, it is a workflow that has outgrown one orchestrator, and sub-workflows and fans are in the corpus for exactly that. What the largest deliveries cost a client that caps a tool result — a round trip that pages the result to a file, against the fetches a shed would have required — is [#836](https://github.com/m2ux/workflow-server/issues/836).

`spent_chars` on the delivery cost line is the window tally, against `eager_budget_chars`; `response_spent_chars` is what the delivery text came to, against `response_bound_chars` (what one tool result may carry) and `fixed_chars` (the part that does not vary with the bundle — the definition, the rules, the header). `worker_bundle_chars` reports the role contract's share on its own. The same figures ride on `_meta.delivery_cost` and as one `activity_delivered` history event, so a caller reads them from the response or the session rather than from the log.

## Eager technique bundling

`get_activity` inlines the composed content of an activity's small step techniques under a `step_techniques` map, so those steps run without a fetch round-trip. This is automatic and corpus-wide — there is no per-activity opt-in. What sizes the bundle is the worker's required `context_tokens`, through the window budget above.

### Which steps get inlined

Each technique-kind step whose gate answers **true**, in document order, until the budget runs out. A step with no gate answers true.

The server holds the variable bag and the reference gate evaluators, so it can take that answer itself. A gate has an answer for the whole activity when every variable it compares is already bound *and* no step of this activity produces one of them. Otherwise it is **unanswered**, and the step stays lazy:

| Gate reads | Answer | Delivery |
|---|---|---|
| variables bound before the activity opened, none of them written inside it | `true` | inlined — the worker certainly reaches this step |
| the same, evaluating false | `false` | lazy, and nothing is shipped for a step the run will not execute |
| a variable this activity produces | unanswered, `pending` | lazy |
| a variable absent from the bag | unanswered, `unbound` | lazy — both evaluators return false for an unbound read, which is not the same as a negative one |
| an expression that does not parse | unanswered, `unparsed` | lazy; the malformed expression is the corpus guards' business |

A gate this activity produces is checked before a gate that is merely absent, so an activity's own production is reported as `pending` whether or not the variable happens to be in the bag already.

An enclosing loop's gate narrows its body, so a step is inlined only where every gate above it also answers true. A body inlined under a gated loop is the protocol for **every** iteration — engage it once per pass from the copy already held, rather than re-fetching it each time.

Whatever the executing agent evaluates when it reaches the step is still what decides execution. This answer decides only how the content travels.

`lazy_gate_false` on the delivery cost line counts the steps the false reading left behind, and `lazy_gate_pending` / `lazy_gate_unbound` / `lazy_gate_unparsed` count the unanswered ones by reason. The three are separate because they call for different responses: `pending` is this activity's own production arriving during the run and is expected on a healthy activity, whereas `unbound` says nothing the run has done so far binds that gate. Where any of them is non-zero the same tally rides on the response as `_meta.lazy_gates`, so a caller can assert on it without reading the log.

An activity may also set `bundleTechniques: { maxChars: <n> }`, a per-technique size cap layered on the budget: any single technique larger than `maxChars` stays lazy. `maxChars: 0` opts the activity out of eager bundling altogether. Anything not inlined stays a `get_technique { step_id }` fetch.

### Resources: bodies only under reference delivery

Once the step techniques are chosen, `get_activity` collects the unique `resource_id`s they link. What happens next depends on the delivery mode, because the map only pays for itself when a repeat delivery can collapse it.

#### Under reference delivery

(`context_mode: "persistent"` or `bundle: "reference"`), bodies arrive in a sibling ops `resources` map, keyed by exact `resource_id` including any `#section`, deduped across steps. These entries share the `resource:<id>` ledger with `get_resource`, so a later delivery of the same body collapses to a marker. Bodies are never nested inside `step_techniques`, which would duplicate them once per technique. `_meta.bundled_resources` lists what was delivered, and each id records a `resource_fetched` history event.

#### Under full delivery

the default a dispatched worker's first activity takes — no bodies are sent. That call lands in a context with nothing to collapse against, so an inlined body would ship in full again in every activity that links it, which measurably grew `get_activity` ([#322](https://github.com/m2ux/workflow-server/issues/322)). The ids arrive under `resource_refs` instead, and the worker fetches the ones it reads via `get_resource`. No `resource:<id>` key is written, since nothing could ever read it. The later activities of a batch ask for reference delivery instead, having a ledger to collapse against.

#### Sent in neither mode

a single oversized resource (per-resource cap 80,000 characters by default), and anything past the window budget. Their ids join `resource_refs`, so nothing linked ever becomes unreachable.

### What the response looks like

Bundled techniques arrive under `step_techniques`, keyed by step id. Each entry opens with a discrete `▼ STEP <step_id> · technique <name>` arrival marker, then the step's full composition — identical to what a step-bound `get_technique` fetch returns.

`step_techniques_note` states the stepping contract and points at `resources_note`, which is the single authority on how *this* response delivered the linked resources: bodies under `resources`, or ids under `resource_refs`. `_meta.bundled_steps`, `_meta.bundled_resources` and `_meta.resource_refs` mirror the three id lists.

### Stepping stays deliberate

Calling `get_technique` is itself a beat — *I now turn to this step*. Inlining removes the call, so the worker supplies the beat instead: it processes inlined `step_techniques` strictly in step order and, on reaching each one, emits a one-line `▶ step <step_id>` marker before executing it.

That emitted line carries the intentional act, and it **is** the stepwise observability trace for bundled steps. The worker does not ping the server per bundled step — the `technique_bundled` events recorded at delivery time already record coverage.

## Reference delivery

By default the server sends every payload in full, every time. A freshly spawned worker starts with an empty context, so that repetition is what gives it the content at all.

An agent that already holds a payload can ask for **reference delivery** instead. The server replaces that payload with a short marker — `{ delivery: "unchanged", content_hash }` — and the agent reuses what it has.

### What counts as "already holds"

Reference delivery belongs to the **agent context**, not to the session:

- A solo walk is one context for the whole walk.
- A dispatched worker is one context from the moment it spawns until it finishes, including any harness resume along the way.
- Two workers sharing one `session_index` are two contexts.

A marker is only ever valid for the context that received the bytes it stands for.

What establishes that a context holds a payload is **its own ledger**. A scope the server has already delivered an activity to is that same context arriving again — the orchestrator mints one `agent_id` per dispatch and reuses it verbatim for as long as that worker carries its batch. So the **invariant blocks** (the worker technique bundle, its `rules`, and the inherited `activity_rules`) collapse for a returning identity in *every* delivery mode, not only under `persistent`. A replacement worker arrives under a new `agent_id`, reads an empty ledger, and takes them in full.

#### A marker stands for a whole item

one composed technique, one rules list, one note, one resource. No marker names a field of a body, because a body missing one of its fields is a fragment, and a reader holding a fragment has no call that returns the part it lacks.

Resuming with `context_mode: "fresh"` drops that scope's ledger entries, because the caller is stating this identity retains nothing it was sent. The next delivery to it is therefore full. `bundle: "full"` does the same for one call without touching the ledger.

### Turning it on

| How | Applies to |
|---|---|
| `start_session { context_mode: "persistent" }` | the whole session — also accepted by `dispatch_child` for the child session |
| `bundle: "reference"` on `get_activity`, `get_technique`, `get_resource` | that one call |
| `full: true` on `get_technique` / `get_resource` | overrides a per-call opt-in and forces the body |

### What the server remembers

The server hashes each payload it delivers and records it in `session.json#deliveredContent`. It records in every mode, so a call that opts in with `bundle: "reference"` can still refer back to content that arrived under the default full mode.

Keys are namespaced by delivery channel — `bundle:*`, `technique:*`, `activity_rules:*`, `workflow_bundle:*`, `resource:*` — so a marker only ever points at content delivered through that same channel.

The ledger is keyed on the **delivery scope**: the per-call `agent_id` when one is supplied, otherwise the session's recorded `agentId`. This matters because a dispatched worker authenticates against the orchestrator's `session_index`, and several workers can hold that index at once — the scope names the agent context a payload went to, rather than the session they share.

The orchestrator mints an `agent_id` per dispatch and reuses it verbatim for as long as that worker lives: when it resumes it after a gate, and when it advances it to the next activity of [its batch](#the-batch-budget). So a fresh spawn reads an empty ledger and takes full delivery, that same context reads its own entries and gets markers, and a sibling worker is unaffected either way. Starting a session under a different `agent_id` likewise begins from an empty ledger.

### What collapses, call by call

- **`get_activity`** — under reference delivery the response carries `bundle_mode: reference`. Any bundled technique whose composed content is byte-identical to an earlier delivery collapses to a marker, as do the `rules`, `activity_rules`, and `contracts` blocks. Techniques new to the activity, or whose content changed, arrive in full. The activity body itself is always delivered. In the default mode the invariant blocks still collapse for a returning identity, so a `bundle_note` accompanies any response that can carry a marker, in either mode.
- **`get_technique`** — a byte-identical refetch returns `delivery: unchanged` and a `content_hash` instead of the composed technique. Step-bound provenance annotations (`source:` / `destination:`) are part of that content. They are fixed for a given corpus and step, so refetching the same step collapses; fetching the same operation from a *different* step re-delivers in full rather than handing back a stale reference.
- **`get_resource`** — a byte-identical refetch of the same `resource_id` returns `delivery: unchanged` and a `content_hash` instead of the body. The key is the caller's exact `resource_id`, anchor included, so `pr-description` and `pr-description#templates` occupy independent slots.
- **`get_workflow`** — under `context_mode: "persistent"` the orchestrator ops bundle (everything above the `---` separator) is keyed under `workflow_bundle:<hash>`. On a resume where the agent already holds it, the whole bundle collapses to a single marker, while the workflow summary below the separator stays full.
- **the delivery notes** — `bundle_note`, `step_techniques_note` and `resources_note` are the most invariant blocks a response carries, so they pass through the same ledger under `note:<id>:<hash>`. A context that holds one receives a marker in its place; `get_activity { bundle: "full" }` restores them with everything else it restores. Keyed by content, so an edited note delivers whole under a key of its own.

`get_technique` and `get_resource` collapse under either `bundle: "reference"` or a session-wide `context_mode: "persistent"`. Fresh and default sessions always receive full bodies.

### What composition repeats in memory

Composition merges each ancestor group's contract into the in-memory technique, so guards and provenance see one fully composed value. Role-facing delivery does not copy that merge onto every body. A response bundling ten techniques of one group carries that group's rules and shared inputs once under `contracts`, and each body names the group in `inherits`. An agent reading one operation reads that operation's own fields, then the named contracts on the same response.

Two steps bound to the same technique in one activity are the one case that collapses inside a response: the second entry is a marker naming the same whole technique the first delivered.

Hashing the content is what keeps a marker from going stale: a technique annotated with binding-seam provenance hashes differently, so it correctly arrives in full.

### Forcing full delivery

`get_technique { full: true }` and `get_resource { full: true }` each force the full payload of the item asked for. Reach for them when the calling context no longer holds the earlier payload — after it was summarized away, for instance.

`get_activity { bundle: "full" }` does the same for a whole delivery: a context that lost a payload gets everything that delivery would have sent it.

### Ledger interplay with bundling

Bundled entries share the `technique:<resolvedId>` key with `get_technique`, hashing the same operation body (own fields plus `inherits`). So in a persistent-context session a bundled delivery collapses a later step-bound refetch to an unchanged reference; and a reference-mode re-delivery of the activity collapses already-delivered bundled entries to markers, with the `▼ STEP` marker riding along. `bundle: "full"` re-delivers them all, and `get_technique { step_id, full: true }` reaches any one of them. Scope contracts share `bundle:contract:<scopeId>` across `get_activity` and `get_technique`.

## What gets measured

### Every dispatch is counted

Each `get_activity` records an `activity_dispatched` history event carrying `{ agentId, dispatch: "fresh" | "resume", chars }`, and echoes the discriminator on `_meta.dispatch`.

The server derives fresh-versus-resume from whether it has met that scope at all, so the orchestrator does not have to declare it. The two values name the two states the ledger has: an empty ledger taking full delivery, and prior deliveries to collapse.

A worker dispatched out of band, which never calls `get_activity`, records the same event on its first `get_technique` or `get_resource`. Where `activity_usage` counts activity exits, this counts dispatches.

### A second copy of one activity is visible

When an activity is delivered whole to a context that has not received it, in a session where another context already took it, the server also records `activity_redelivered` carrying `{ agentId, priorAgentId, chars }`.

That is either a replaced worker or a resume that arrived under a fresh identity, and it leaves no other trace — a second full delivery reads like a first one at every other instrument.

### Sizes are summable

`technique_fetched`, `technique_bundled` and `resource_fetched` each carry `chars` — always the full payload size, on both paths — and `delivery: "full" | "unchanged"`. Characters delivered and characters saved are therefore both totals you can add up from the ledger.

<a id="token-usage-is-reported-not-derived"></a>

### Token usage is reported, not derived

The server cannot see what a turn cost the harness, so an agent reports it with `record_usage`, one row per completed activity. `basis` says whether the figure is that activity's own spend or a running total for the agent, because the two sum differently and a reader adding them without knowing which would double-count. Read the rows back through `inspect_session` with `view: usage`.

### Coverage reaches fidelity

Each bundled step records a `technique_bundled` history event, and that counts as delivery coverage for `next_activity`'s manifest check — see [workflow fidelity](workflow-fidelity.md#layer-5-the-step-manifest).

### Benchmarks

`npm run bench:token` prices a session mode, `npm run bench:dispatch` prices a re-dispatch, and `npm run bench:batch` prices a run of activities. All three, and the gate that runs on every pull request, are in [benchmarks.md](benchmarks.md).
