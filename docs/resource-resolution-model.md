# Technique and Resource Resolution

A workflow's full set of instructions runs to tens of thousands of characters. Hand all of it to an agent when the run opens and most of it is irrelevant to whatever that agent is doing at any given moment: the part that matters is crowded out by the part that does not, responses slow, and every later call carries the whole of it again.

So the server hands over one piece at a time. Behaviour is broken into techniques — a technique being a markdown definition of a single capability — and an activity names the ones it needs. The server composes those on demand and delivers what the current step calls for, leaving the bulkier reference material behind until something asks for it.

## How a technique or resource is named

Techniques and resources are markdown files on disk, and each one's filename is its id. A standalone technique is `techniques/{slug}.md`; a grouped technique is a folder holding a `TECHNIQUE.md` index plus one `{sub}.md` per nested technique; a resource is `resources/{slug}.md`. The id matches the filename, and the frontmatter repeats it.

So the file `techniques/workflow-engine.md` is the technique `workflow-engine`, and that is the name an agent asks for it by.

## What a technique is

There is one kind of technique. It is either a single markdown file, or a folder whose `TECHNIQUE.md` index carries nested techniques as sibling files. A nested technique is itself a technique: same shape, same delivery.

A technique publishes:

* **`id`**, **`version`**, **`capability`** — the identity and the capability statement.
* **`inputs`** (optional) — an array of entries, each with `id`, `description`, `required`, `default`, and optional `components` (named sub-members).
* **`outputs`** (optional) — an array of entries, each with `id`, `description`, optional `components`, and an optional `artifact` carrying a `name` (the filename produced when the output is persisted).
* **`protocol`** — an ordered list of blocks `{title?, steps[]}`. Steps are imperative bullets; failure handling is expressed inline within the relevant steps.
* **`rules`** — named behavioural invariants that apply across the technique. Each key is a rule name (or a group prefix); each value is a single rule string or an array of related rules.

The `tools` map keys an MCP server name (e.g. `workflow-server`, `atlassian`, `gitnexus`) or one of the reserved keys `shell` / `harness`.

## Referring to a technique or a rule

Activities and workflows compose behaviour by listing technique references. A reference is a `::`-delimited path:

```
[namespace::]technique[::nested…]
```

```yaml
techniques:
  primary: workflow-engine::dispatch-activity
  supporting:
    - workflow-engine::evaluate-transition
    - agent-conduct::checkpoint-discipline
    - meta::agent-conduct::file-sensitivity      # namespace-prefixed
    - support::gitnexus::analyze                 # a namespace named by its path
```

A same-namespace reference omits the prefix; the current workflow is filled in at resolution. Include a leading prefix only to reach another namespace — the longest leading run that names one is the prefix, and everything after it is a path inside that namespace's `techniques/`. A `namespace/technique` slash form spells a single-segment prefix.

### What a namespace is

A namespace is a directory offering artifacts to references. It earns that by holding a `techniques/`, `resources/` or `routines/` directory, or by holding a `workflow.yaml` — and a directory holding a definition is a **workflow** as well, the thing an operator can run. The two are usually one directory: a workflow keeping its own library beside its definition is addressable with nothing done to it.

`activities/` earns nothing. An activity declares exits, and the destinations those exits lead to live in a definition's `graph`, so an activity in a directory holding no definition could never be routed. Activities belong to workflows; the three library kinds are what a namespace offers.

A namespace answers to two names: its directory name, and the slash-joined path from the corpus root that reaches it. The name is what a reference ordinarily carries, so a folder can be re-grouped without rewriting what points at it; the path is what a reference carries where a name is claimed twice, or where an author would rather be explicit. `support/gitnexus/techniques/analyze.md` answers to `gitnexus::analyze` and to `support::gitnexus::analyze` alike.

Two consequences are worth stating. A namespace holding no definition never reaches `list_workflows`, because the listing reads definitions rather than a list of names to exclude — so a shared library sits in the corpus without appearing as a product. And where a namespace at `a/b` and a directory `a/techniques/b/` both exist, one reference names two files: `indexCorpus` reports the collision and the reference is refused naming both, rather than one reading being picked and the other left unreachable.

A reference addresses one of two things:

* **A technique** — a standalone `{technique}.md`, a grouped `{group}/TECHNIQUE.md` index, or a nested `{group}/{sub}.md` file (addressed `{group}::{sub}`). A nested technique is a technique.
* **A rule** — when the trailing segment matches a rule name on the addressed technique. A bare group reference `{technique}::{group}` expands to every rule named `{group}-*` on that technique.

Inline technique invocations also appear inside step descriptions:

```yaml
steps:
  - id: dispatch-worker
    description: "workflow-engine::dispatch-activity(activity_id: {next}, agent_id: 'worker')"
```

The inline form points at the same technique body. Agents read the technique from the bundled response rather than re-fetching it.

## How a reference resolves

Each reference resolves as follows:

1. **Locate the technique.** If the reference carries a namespace prefix, load from that namespace's `techniques/` folder and nowhere else — a prefix says where the technique lives, so a fallback would deliver a different file under the same reference. Otherwise resolve **current-workflow-first, then the `meta` shared layer** — the current workflow's technique shadows a same-named `meta` one.
2. **Whole-technique reference** (no nested segment) — deliver the technique's own body (capability, flow, inputs, protocol, outputs) and auto-include its rules.
3. **Nested reference** — try a `{group}/{sub}.md` nested technique first (current-workflow-first, then `meta`); deliver its body and auto-include its rules.
4. **Rule reference** — if no nested technique matches, match the trailing segment against the technique's rules. A direct name match resolves to that rule. A group prefix `{group}` expands to every `{group}-*` rule.
5. **Unresolved** — a reference that matches none of the above surfaces explicitly; it is never silently dropped.

**Auto-inclusion of technique rules.** When a technique is resolved, its remaining rules (those not already explicitly requested) are appended as rule entries. This lets an activity reference a single technique and still receive the technique's invariants without enumerating every rule.

The result of resolving a list of references is a bundle grouped into three buckets:

* **`techniques`** — keyed by full path (`{workflow}/{technique}` or `{technique}`, with `::{sub}` appended for a nested technique) → technique body.
* **`rules`** — a flat array of `[rule-name, rule-line]` tuples (one tuple per line).
* **`unresolved`** — references that did not resolve.

Empty buckets are omitted. The lookup is structural and requires no session token; most clients receive it indirectly through the bundles that `get_workflow` and `get_activity` produce.

## How an ancestor's protocol wraps a descendant's

When a technique is delivered, an ancestor container's `Initial` and `Final` protocol blocks wrap the descendant's protocol recursively. Every ancestor along the path — the workflow-root `TECHNIQUE.md` and each containing group's `TECHNIQUE.md` — contributes its `Initial` blocks (before) and `Final` blocks (after) the technique's own protocol. The server renumbers the combined sequence for display. Any other ancestor block is parent-only: it appears solely when that ancestor is referenced directly.

## What arrives with a workflow and with an activity

The server resolves an activity's declared references and bundles them into the same three buckets, so an agent never chains resolution calls of its own at runtime.

### The orchestrator bundle

The response is the union of the workflow's declared technique references and the core orchestrator technique references the server auto-includes (`CORE_ORCHESTRATOR_TECHNIQUES` in `src/loaders/core-ops.ts`): the engine traversal, state-persistence, sub-agent dispatch, and orchestrator-discipline references every orchestrator needs. Duplicates are deduplicated.

The assembled bundle is then held to what one tool result may carry (`MAX_RESPONSE_CHARS`, default 60,000 — the same bound a worker's delivery answers to, because one harness refuses both, and measured over the whole result: the response text and the protocol metadata a harness weighs beside it). Operation bodies ride the response in list order and stop at the first that would overflow; the remainder are named under `operation_refs`, with `operations_note` saying how to get them. The role's `rules` list is never bounded — those rules are the contract an orchestrator is held to from its first call, while a procedure it has not reached yet is one it fetches with `get_technique { technique_id }` when it does.

The workflow metadata below the separator answers to the same bound, after the bundle and never instead of it. Procedure gives way first. Where every operation body is already an id and the response is still over, what gives way next is the prose explaining a variable — in two stages, so the least is given that makes the response fit:

| Stage | What the declarations carry |
|-------|------------------------------|
| full | Every declaration with the prose explaining it. |
| policy | Prose for the variables the workflow file itself declares. |
| declarations | Names, types, value sets and starting values, and no prose. |

A workflow-file declaration is policy for the whole run — the mode it operates in, the paths it works against — so the orchestrator is who decides on it. Every other name is one activity's product and another's input, declared in the file of the activity that writes it, which arrives whole with the `get_activity` that dispatches a worker there. So the prose that gives way first is the prose that reaches its reader by another route.

What no stage reaches is the roster, the graph and the declared namespace: an orchestrator recognises a name a worker reports and reads a value out of the bag by it, so a declaration the response dropped is a run it cannot follow. A response that sheds carries `variables_note`, naming what it left out and where that is. Where even the last stage leaves the response over the bound it goes out over it with no procedure aboard, and the server logs that it did.

### The worker bundle

The response is the union of the activity's declared technique references and the core worker technique references the server auto-includes (`CORE_WORKER_TECHNIQUES` in `src/loaders/core-ops.ts`): the worker role itself, finalize-activity, and the conduct every worker is held to. The role is in that set because every worker stub names it and only the meta workflow declares it, so a client worker would otherwise be told to apply a technique its bundle never carried.

### What arrives only where it can be reached

Three things are added by the delivery rather than carried in a core list, because each is decidable from definitions the server has already loaded and each is dead weight where the answer is no.

| Content | Delivered when |
|---------|----------------|
| `ORCHESTRATOR_CHECKPOINT_TECHNIQUES` — `present-checkpoint-to-user`, `respond-checkpoint` | any activity of the run declares a `kind: checkpoint` step |
| `WORKER_CHECKPOINT_TECHNIQUES` — `yield-checkpoint`, `resume-from-checkpoint` | the same reading, over the same roster |
| `FAN_DISPATCH_TECHNIQUES`, and the rules named in `FAN_ONLY_RULES` | the graph fans an exit |

Each reading is over the **whole workflow**, not the activity in hand, and that is load-bearing rather than approximate: a bundle's rules are keyed as one set, so a technique set that varied activity by activity would re-deliver the entire rules list at every activity whose set differed — measured at twenty thousand characters against the four and a half thousand the narrower reading saves.

What is held back stays reachable. A worker may raise a decision its activity never declared, and an orchestrator then has to present and resolve it, so both checkpoint pairs are servable by `get_technique { technique_id }` from any session. That is what makes the omission safe rather than merely cheap.

### What the two core sets contain

| Set | Technique references |
|-----|----------------------|
| `CORE_ORCHESTRATOR_TECHNIQUES` | `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `handle-sub-workflow`, `compose-prompt`, `sync-progress-status`; `git::commit-submodule`, `commit-regular-files`; `harness-compat::spawn-agent`, `continue-agent`, `resolve-harness-operation`, `claude-code`, `cursor`, `cline`, `generic`; `agent-conduct`, `orchestrator-conduct` |
| `CORE_WORKER_TECHNIQUES` | `workflow-engine::activity-worker`, `finalize-activity`; `agent-conduct`, `worker-conduct` |

Conduct is the engine's baseline rather than a workflow's choice, so both lists name it and no workflow declares it. `agent-conduct` binds every agent and is in both; `orchestrator-conduct` and `worker-conduct` specialise it for one role each and appear in that role's list alone.

## The shared meta layer

The behaviours every workflow needs — how the engine advances, how agents are expected to conduct themselves — are written once in a shared workflow called `meta`, so no other workflow has to restate them.

Resolution therefore looks in two places, in order: the current workflow's own technique folder first, and the shared layer second. A workflow that defines a technique under a name the shared layer also uses shadows the shared one, which is how a workflow overrides a standard behaviour without the shared copy having to know about it.

## Techniques declared at the workflow level

A workflow declares techniques partitioned by audience (mirroring `rules`): `techniques.workflow` for the orchestrator and `techniques.activity` for techniques inherited by every activity. The composed body of the first `techniques.workflow` entry is returned by `get_technique` (before any activity); those orchestrator techniques are also covered by the `get_workflow` technique bundle rather than appearing as a separate preamble. The `techniques.activity` references are injected into every `get_activity` technique bundle ahead of the activity's own `techniques[]`, so a technique common to all activities (e.g. variable-binding) is declared once at the workflow level instead of duplicated per activity. Workflows compose behaviour by referencing capability techniques rather than maintaining a monolithic technique.

## Resources

Even with techniques tightly scoped, large reference material (Git CLI tutorials, API guides, templates) does not belong inline. A technique references a resource by id through a normal markdown hyperlink in its content (for example, a template linked from an Input or Output). When the server projects a technique for delivery, it **rewrites those resource hyperlinks into `get_resource`-callable refs** — the bare id form `{id}[#section]`, or the cross-workflow form `{workflow}/{id}[#section]`. Technique links are left untouched.

Server responses do not bundle resource bodies. The agent loads a resource only when it actually needs it.

## Loading a resource when it is needed

When an agent reaches a resource reference it needs, it asks for it:

```javascript
get_resource({ session_index, resource_id: "meta/activity-worker-prompt" })
```

The server resolves the reference:

* **Bare slugs** (e.g. `"review-mode"`) resolve within the session's workflow.
* **Prefixed references** (e.g. `"meta/activity-worker-prompt"`) resolve from the named namespace. The prefix is the longest leading run of segments naming one, so `"support/gitnexus/index-reading"` reads the namespace `support/gitnexus` and the slug `index-reading`.

An optional `#section` anchor (a GitHub-style heading slug) narrows the result to that section and its body — used to fetch just the template a technique references without the whole file. The content is loaded from the named workflow's own `resources/{slug}.md` and returned alongside the resource `id` and `version`.

Under `context_mode: "persistent"`, a byte-identical refetch of the same exact `resource_id` (including any `#section`) returns a short `{ delivery: "unchanged", content_hash }` marker instead of the body — the same reference-delivery contract as `get_technique` (see [Reference delivery](#reference-delivery)). Bare and sectioned ids are independent ledger keys. Pass `full: true` to force the full body when the calling context no longer holds the earlier delivery. Fresh/default sessions always receive the full resource body. Each call still appends a `resource_fetched` history event (observability only), including when the answer is an unchanged marker.

Three things follow from loading resources this way. An agent carries only the guides the technique in front of it actually cites, and under reference delivery it does not pay a second time for one that has not changed. A guide with several callers — how to format a pull request, how to drive the Git command line — is written once and linked from every technique that needs it, across any number of workflows. And the prefixed form lets a technique in one workflow reach the shared library in `meta`, so a resource is reused rather than copied.

## Reference delivery

By default the server sends every payload in full, every time. A freshly spawned worker starts with an empty context, so that repetition is what gives it the content at all.

An agent that already holds a payload can ask for **reference delivery** instead. The server replaces that payload with a short marker — `{ delivery: "unchanged", content_hash }` — and the agent reuses what it has.

### What counts as "already holds"

Reference delivery belongs to the **agent context**, not to the session:

- A solo walk is one context for the whole walk.
- A dispatched worker is one context from the moment it spawns until it finishes, including any harness resume along the way.
- Two workers sharing one `session_index` are two contexts.

A marker is only ever valid for the context that received the bytes it stands for.

Two things establish that a context holds a payload, and they are independent:

- **Its own ledger.** A scope the server has already delivered an activity to is that same context arriving again — the orchestrator mints one `agent_id` per dispatch and reuses it verbatim for as long as that worker carries its batch. So the **invariant blocks** (the worker technique bundle, its `rules`, and the inherited `activity_rules`) collapse for a returning identity in *every* delivery mode, not only under `persistent`. A replacement worker arrives under a new `agent_id`, reads an empty ledger, and takes them in full.
- **The response itself.** A marker may instead point at a byte-identical copy earlier in the *same* response. That needs no ledger and no mode: the copy travels in the payload the marker travels in, so any recipient that can read the marker can read the copy. See [Blocks inside a technique](#blocks-inside-a-technique).

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

The orchestrator mints an `agent_id` per dispatch and reuses it verbatim for as long as that worker lives — when it resumes it after a gate, and when it advances it to the next activity of its batch (see how a worker [carries a run of activities](dispatch-model.md#batching-a-run-of-activities)). So a fresh spawn reads an empty ledger and takes full delivery, that same context reads its own entries and gets markers, and a sibling worker is unaffected either way. Starting a session under a different `agent_id` likewise begins from an empty ledger.

### What collapses, call by call

- **`get_activity`** — under reference delivery the response carries `bundle_mode: reference`. Any bundled technique whose composed content is byte-identical to an earlier delivery collapses to a marker, as do the `rules` and `activity_rules` blocks. Techniques new to the activity, or whose content changed, arrive in full. The activity body itself is always delivered. In the default mode the invariant blocks still collapse for a returning identity, and shared blocks still collapse within the response — so a `bundle_note` accompanies any response that carries a marker, in either mode, naming which referents that response can produce.
- **`get_technique`** — a byte-identical refetch returns `delivery: unchanged` and a `content_hash` instead of the composed technique. Step-bound provenance annotations (`source:` / `destination:`) are part of that content. They are fixed for a given corpus and step, so refetching the same step collapses; fetching the same operation from a *different* step re-delivers in full rather than handing back a stale reference.
- **`get_resource`** — a byte-identical refetch of the same `resource_id` returns `delivery: unchanged` and a `content_hash` instead of the body. The key is the caller's exact `resource_id`, anchor included, so `pr-description` and `pr-description#templates` occupy independent slots.
- **`get_workflow`** — under `context_mode: "persistent"` the orchestrator ops bundle (everything above the `---` separator) is keyed under `workflow_bundle:<hash>`. On a resume where the agent already holds it, the whole bundle collapses to a single marker, while the workflow summary below the separator stays full.

- **the delivery notes** — `bundle_note`, `step_techniques_note` and `resources_note` are the most invariant blocks a response carries, so they pass through the same ledger under `note:<id>:<hash>`. A context that holds one receives a marker in its place; `get_activity { bundle: "full" }` restores them with everything else it restores. Keyed by content, so an edited note delivers whole under a key of its own.

`get_technique` and `get_resource` collapse under either `bundle: "reference"` or a session-wide `context_mode: "persistent"`. Fresh and default sessions always receive full bodies.

### Blocks inside a technique

Collapsing can go finer than a whole technique. Techniques sharing a workflow contract share blocks: the contract-inherited `inherited_inputs` and `inherited_outputs`, and the merged `rules`. Each is hashed on its own, under `technique:<block>:<hash>`.

So when a technique is new to the context but one of its shared blocks already arrived with a sibling technique, that block becomes a marker in place while the technique-specific core arrives in full. This happens on the `get_technique` full-delivery path, inside each eagerly inlined `get_activity` `step_techniques` entry, and across the operations bundle of both `get_activity` and `get_workflow`, where most entries inherit one meta contract.

Across an operations bundle the pass is response-local and the per-entry ledger key stays hashed on the technique's **full** composed body, not on the bytes the response emitted. Those two go together: what a later call compares against must not depend on which entry happened to carry a shared block this time, or a technique would re-deliver whenever the bundle around it changed. A collapsed entry is therefore found by its key — the same `techniques.<ref>` slot it occupied before — and its `content_hash` identifies the technique's content rather than the emitted form.

One rule arrives once per response too. A technique inherits its ancestor group's rules, and the bundle hoists that same group's rules into the response's own `rules` list, so an inlined step would otherwise restate what the payload already carries: an entry keeps only the rules that list does not state, and an entry left with nothing carries no `rules` block at all.

Inside one `get_activity` response this pass runs **in every delivery mode**, because composition merges each ancestor group's rules into every technique that group covers: a response bundling ten techniques of one group would otherwise carry that group's rules ten times. The marker points at the sibling entry in the same payload, so it is readable by a worker holding nothing from before. Widening it to the ledger — collapsing against what arrived on an *earlier call* — is what reference delivery adds.

Two steps bound to the same technique in one activity collapse the same way: the second entry is a marker naming the first.

Hashing the content is what keeps this from going stale: a block annotated with binding-seam provenance hashes differently, so it correctly arrives in full.

### Forcing full delivery

`get_technique { full: true }` and `get_resource { full: true }` each force the full payload of the item asked for, every block included. Reach for them when the calling context no longer holds the earlier payload — after it was summarized away, for instance.

`get_activity { bundle: "full" }` does the same for a whole delivery, and is held to what one tool result may carry like every other delivery: it suppresses the markers, not the bound. So a context that lost a payload gets back what a response can carry, and asks for the rest one item at a time — which is what the per-item forms above are for.

### What gets measured

**Every dispatch is counted.** Each `get_activity` records an `activity_dispatched` history event carrying `{ agentId, dispatch: "fresh" | "resume", chars }`, and echoes the discriminator on `_meta.dispatch`. The server derives fresh-versus-resume from whether it has met that scope at all, so the orchestrator does not have to declare it, and the two values name the two states the ledger has: an empty ledger taking full delivery, and prior deliveries to collapse. A worker dispatched out of band, which never calls `get_activity`, records the same event on its first `get_technique` or `get_resource`. Where `activity_usage` counts activity exits, this counts dispatches.

**A second copy of one activity is visible.** When an activity is delivered whole to a context that has not received it, in a session where another context already took it, the server also records `activity_redelivered` carrying `{ agentId, priorAgentId, chars }`. That is either a replaced worker or a resume that arrived under a fresh identity, and it leaves no other trace — a second full delivery reads like a first one at every other instrument.

**Sizes are summable.** `technique_fetched`, `technique_bundled` and `resource_fetched` each carry `chars` — always the full payload size, on both paths — and `delivery: "full" | "unchanged"`. Characters delivered and characters saved are therefore both totals you can add up from the ledger.

**Benchmarks.** `npm run bench:token` compares delivery cost per session mode over a fixed `work-package` walk, against the committed baseline ([`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts); `vsReference.deliveryCostIndex` reports baseline = 100, lower is better). The Verify workflow gates on it at 1%, so a definition change that adds delivery is priced at merge — see [development.md](development.md#the-gate-runs-on-every-pull-request). `npm run bench:dispatch` measures the other axis — a fresh worker dispatch against the same worker resumed ([`scripts/run-dispatch-benchmark.ts`](../scripts/run-dispatch-benchmark.ts)). See [development.md](development.md#token-delivery-benchmark).

## Hybrid technique bundling

`get_activity` inlines the composed content of an activity's small step techniques under a `step_techniques` map, so those steps run without a fetch round-trip. This is automatic and corpus-wide — there is no per-activity opt-in. What sizes the bundle is the worker's REQUIRED `context_tokens` together with what one tool result may carry, whichever the delivery reaches first.

### The budgets

Two limits, asking different questions, and a delivery stops at whichever it reaches first:

```
window budget    context_tokens × headroomFraction × charsPerToken
response bound   MAX_RESPONSE_CHARS − what the response already owes
```

`headroomFraction` (default 0.80) and `charsPerToken` (default 4) are server config, overridable with `BUNDLE_HEADROOM_FRACTION` and `BUNDLE_CHARS_PER_TOKEN`.

The window budget asks how much of its own context a worker may spend on inlined content. The response bound asks what one tool result may hold at all, and is the limit a harness enforces. What the response already owes is the part no bound can move: the activity definition with its artifact contract, the workflow's inherited `activity_rules`, the header, the batch reading, the notes that say how to read a bundle, and the protocol metadata beside the text.

They also count differently, which is why they are two tallies rather than one figure. An unchanged-reference marker adds nothing to the window tally — the context it goes to holds that content already — but it adds its own bytes to the response tally, because a harness weighs what it is sent and cannot know what the reader holds. Each entry is priced at the size it is written in, nested under the map it rides in.

What is left is spent in priority order, each stage stopping at the first entry that would overflow what remains:

| Priority | Content | Deferred to |
|---|---|---|
| 1 | the role contract's operation bodies, in list order | `operation_refs`, fetched with `get_technique { technique_id }` |
| 2 | step technique bodies, in document order | `get_technique { step_id }` at the step |
| 3 | eagerly bundled resource bodies | `resource_refs`, fetched with `get_resource` |

The bound governs the whole tool result. A harness weighs the protocol metadata beside the text — one to two thousand characters of artifact contract, exit destinations, gate readings and the delivery cost — so the response owes that too. What its shape settles before the budget runs is reserved at its widest; the ids of what a delivery defers or bundles are charged as the response commits to them, so a reservation never stands in for something the delivery turns out not to carry.

The role's `rules` list is never bounded — a bound moves procedures and never boundaries. A body a bound leaves out is recorded as delivered to nobody: a ledger entry for it would collapse a later delivery to a marker for bytes the worker never received. That is also why a second delivery to the same context can carry what the first deferred — the contract it holds collapses to markers, and the room that frees goes to the procedures still owed.

`spent_chars` on the delivery cost line is the window tally, against `eager_budget_chars`; `response_spent_chars` is the response tally, against `response_bound_chars` (what one tool result may carry) and `fixed_chars` (what the response owed before the bundle spent anything). `worker_bundle_chars` reports the invariant part on its own, and `deferred_operations` counts the contract bodies served by id instead. The same figures ride on `_meta.delivery_cost` and as one `activity_delivered` history event, so a caller reads them from the response or the session rather than from the log.

An activity whose definition and rules fill a response on their own leaves nothing for any of the three stages. The delivery still goes out — a worker cannot do an activity it was not sent — and the server logs that it went out over the bound, which is the signal that the definition has outgrown a single delivery.

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

A gate this activity produces is checked before a gate that is merely absent, so an activity's own
production is reported as `pending` whether or not the variable happens to be in the bag already.

An enclosing loop's gate narrows its body, so a step is inlined only where every gate above it also answers true. A body inlined under a gated loop is the protocol for **every** iteration — engage it once per pass from the copy already held, rather than re-fetching it each time.

Whatever the executing agent evaluates when it reaches the step is still what decides execution. This answer decides only how the content travels.

`lazy_gate_false` on the delivery cost line counts the steps the false reading left behind, and
`lazy_gate_pending` / `lazy_gate_unbound` / `lazy_gate_unparsed` count the unanswered ones by reason.
The three are separate because they call for different responses: `pending` is this activity's own
production arriving during the run and is expected on a healthy activity, whereas `unbound` says
nothing the run has done so far binds that gate. Where any of them is non-zero the same tally rides
on the response as `_meta.lazy_gates`, so a caller can assert on it without reading the log.

An activity may also set `bundleTechniques: { maxChars: <n> }`, a per-technique size cap layered on the budget: any single technique larger than `maxChars` stays lazy. `maxChars: 0` opts the activity out of eager bundling altogether. Anything not inlined stays a `get_technique { step_id }` fetch.

### Resources: bodies only under reference delivery

Once the step techniques are chosen, `get_activity` collects the unique `resource_id`s they link. What happens next depends on the delivery mode, because the map only pays for itself when a repeat delivery can collapse it.

**Under reference delivery** (`context_mode: "persistent"` or `bundle: "reference"`), bodies arrive in a sibling ops `resources` map, keyed by exact `resource_id` including any `#section`, deduped across steps. These entries share the `resource:<id>` ledger with `get_resource`, so a later delivery of the same body collapses to a marker. Bodies are never nested inside `step_techniques`, which would duplicate them once per technique. `_meta.bundled_resources` lists what was delivered, and each id records a `resource_fetched` history event.

**Under full delivery** — the default a dispatched worker's first activity takes — no bodies are sent. That call lands in a context with nothing to collapse against, so an inlined body would ship in full again in every activity that links it: measured at +24.5% on `get_activity` ([#322](https://github.com/m2ux/workflow-server/issues/322)). The ids arrive under `resource_refs` instead, and the worker fetches the ones it reads via `get_resource`. No `resource:<id>` key is written, since nothing could ever read it. The later activities of a batch ask for reference delivery instead, having a ledger to collapse against.

**Sent in neither mode:** a single oversized resource (per-resource cap 80 000 chars by default), and anything past either budget — the worker's window or what one tool result may carry. Their ids join `resource_refs`, so nothing linked ever becomes unreachable.

### What the response looks like

Bundled techniques arrive under `step_techniques`, keyed by step id. Each entry opens with a discrete `▼ STEP <step_id> · technique <name>` arrival marker, then the step's full composition — identical to what a step-bound `get_technique` fetch returns.

`step_techniques_note` states the stepping contract and points at `resources_note`, which is the single authority on how *this* response delivered the linked resources: bodies under `resources`, or ids under `resource_refs`. `_meta.bundled_steps`, `_meta.bundled_resources` and `_meta.resource_refs` mirror the three id lists.

### Stepping stays deliberate

Calling `get_technique` is itself a beat — *I now turn to this step*. Inlining removes the call, so the worker supplies the beat instead: it processes inlined `step_techniques` strictly in step order and, on reaching each one, EMITs a one-line `▶ step <step_id>` marker before executing it.

That emitted line carries the intentional act, and it **is** the stepwise observability trace for bundled steps. The worker does not ping the server per bundled step — the `technique_bundled` events recorded at delivery time already record coverage.

### Ledger interplay

Bundled entries share the `technique:<resolvedId>` key with `get_technique`. So in a persistent-context session a bundled delivery collapses a later step-bound refetch to an unchanged reference; and a reference-mode re-delivery of the activity collapses already-delivered bundled entries to markers, with the `▼ STEP` marker riding along. `bundle: "full"` re-delivers what a response can carry, and `get_technique { step_id, full: true }` reaches any one entry it could not.

### Fidelity

Each bundled step records a `technique_bundled` history event, and that counts as delivery coverage for `next_activity`'s manifest fidelity check — see [Workflow Fidelity](workflow-fidelity.md).
