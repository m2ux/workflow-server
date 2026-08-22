# Technique & Resource Resolution Architecture

LLM context windows are precious. Loading an entire workflow's worth of instructions, rules, and system prompts into an agent's context window on bootstrap leads to context degradation, high latency, and increased costs.

The Workflow Server solves this via a **lazy-loading resource architecture** layered on top of a **technique model** in which all behaviour is composed from techniques.

## 1. Canonical IDs (Slugs)

Techniques and resources are stored on disk as markdown files whose **slug** is the canonical id. A standalone technique is `techniques/{slug}.md`; a grouped technique is a folder `techniques/{group}/TECHNIQUE.md` plus one `{sub}.md` per nested technique; a resource is `resources/{slug}.md`. The slug equals the filename (and the frontmatter `name:`).

* File: `techniques/workflow-engine.md`
* Canonical ID: `workflow-engine`

Agents reference techniques and resources by their canonical slugs.

## 2. Techniques

There is one kind of technique. A technique is a markdown file (standalone) or a grouped folder whose `TECHNIQUE.md` index contains nested techniques as sibling `{sub}.md` files. A **nested technique is itself a technique** — it has the same shape and is delivered the same way.

A technique's published shape is:

* **`id`**, **`version`**, **`capability`** — the identity and the capability statement.
* **`inputs`** (optional) — an array of entries, each with `id`, `description`, `required`, `default`, and optional `components` (named sub-members).
* **`outputs`** (optional) — an array of entries, each with `id`, `description`, optional `components`, and an optional `artifact` carrying a `name` (the filename produced when the output is persisted).
* **`protocol`** — an ordered list of blocks `{title?, steps[]}`. Steps are imperative bullets; failure handling is expressed inline within the relevant steps.
* **`rules`** — named behavioural invariants that apply across the technique. Each key is a rule name (or a group prefix); each value is a single rule string or an array of related rules.

The `tools` map keys an MCP server name (e.g. `workflow-server`, `atlassian`, `gitnexus`) or one of the reserved keys `shell` / `harness`.

## 3. Technique & Rule References

Activities and workflows compose behaviour by listing technique references. A reference is a `::`-delimited path:

```
[workflow::]technique[::nested…]
```

```yaml
techniques:
  primary: workflow-engine::dispatch-activity
  supporting:
    - workflow-engine::evaluate-transition
    - agent-conduct::checkpoint-discipline
    - meta::agent-conduct::file-sensitivity     # workflow-prefixed
```

A same-workflow reference omits the workflow segment; the current workflow is filled in at resolution. Include a leading workflow segment only to reach another workflow. A `workflow/technique` slash form is normalized to the `::` form.

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

## 4. Resolution

Each reference resolves as follows:

1. **Locate the technique.** If the reference carries a workflow segment, load from that workflow's `techniques/` folder. Otherwise resolve **current-workflow-first, then the `meta` shared layer** — the current workflow's technique shadows a same-named `meta` one.
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

## 5. Protocol Composition

When a technique is delivered, an ancestor container's `Initial` and `Final` protocol blocks wrap the descendant's protocol recursively. Every ancestor along the path — the workflow-root `TECHNIQUE.md` and each containing group's `TECHNIQUE.md` — contributes its `Initial` blocks (before) and `Final` blocks (after) the technique's own protocol. The server renumbers the combined sequence for display. Any other ancestor block is parent-only: it appears solely when that ancestor is referenced directly.

## 6. Delivery at Workflow / Activity Granularity

The server resolves an activity's `techniques[]` and bundles them into the `techniques`, `rules`, and `unresolved` buckets, so agents never chain resolution calls themselves at runtime.

### `get_workflow` — orchestrator bundle

The response is the union of the workflow's declared technique references and the core orchestrator technique references the server auto-includes (`CORE_ORCHESTRATOR_TECHNIQUES` in `src/loaders/core-ops.ts`): the engine traversal, checkpoint flow, state-persistence, sub-agent dispatch, and orchestrator-discipline references every orchestrator needs. Duplicates are deduplicated.

### `get_activity` — worker bundle

The response is the union of the activity's declared technique references and the core worker technique references the server auto-includes (`CORE_WORKER_TECHNIQUES` in `src/loaders/core-ops.ts`): the worker role itself, the yield/resume checkpoint, finalize-activity, and worker-side `agent-conduct` rule references every worker needs. The role is in that set because every worker stub names it and only the meta workflow declares it, so a client worker would otherwise be told to apply a technique its bundle never carried.

### Core technique reference sets (`src/loaders/core-ops.ts`)

| Set | Technique references |
|-----|----------------------|
| `CORE_ORCHESTRATOR_TECHNIQUES` | `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `handle-sub-workflow`, `compose-prompt`, `present-checkpoint-to-user`, `respond-checkpoint`; `version-control::commit-submodule`, `commit-regular-files`; `harness-compat::spawn-agent`, `continue-agent`; `agent-conduct::orchestrator`, `checkpoint-discipline`, `operational-discipline` |
| `CORE_WORKER_TECHNIQUES` | `workflow-engine::activity-worker`, `yield-checkpoint`, `resume-from-checkpoint`, `finalize-activity`; `agent-conduct::checkpoint-discipline`, `operational-discipline`, `file-sensitivity`, `code-commentary` |

## 7. Shared-Layer Technique Resolution

Standard agent behaviours (workflow engine procedures, agent conduct rules, etc.) live once in the `meta` shared layer, so a workflow need not redefine them.

When resolving a technique, the server uses a two-step path:

1. **Workflow-local scope:** look in the current workflow's technique folder (e.g. `workflows/work-package/techniques/`).
2. **Meta shared layer:** if not found locally, fall back to `workflows/meta/techniques/`.

This lets workflows inherit standard meta capability techniques (`workflow-engine`, `agent-conduct`, `atlassian-operations`, …) while still being able to override them — a workflow-local technique of the same id shadows the meta one.

## 8. Workflow-Level Techniques

A workflow declares techniques partitioned by audience (mirroring `rules`): `techniques.workflow` for the orchestrator and `techniques.activity` for techniques inherited by every activity. The composed body of the first `techniques.workflow` entry is returned by `get_technique` (before any activity); those orchestrator techniques are also covered by the `get_workflow` technique bundle rather than appearing as a separate preamble. The `techniques.activity` references are injected into every `get_activity` technique bundle ahead of the activity's own `techniques[]`, so a technique common to all activities (e.g. variable-binding) is declared once at the workflow level instead of duplicated per activity. Workflows compose behaviour by referencing capability techniques rather than maintaining a monolithic technique.

## 9. Resources

Even with techniques tightly scoped, large reference material (Git CLI tutorials, API guides, templates) does not belong inline. A technique references a resource by id through a normal markdown hyperlink in its content (for example, a template linked from an Input or Output). When the server projects a technique for delivery, it **rewrites those resource hyperlinks into `get_resource`-callable refs** — the bare id form `{id}[#section]`, or the cross-workflow form `{workflow}/{id}[#section]`. Technique links are left untouched.

Server responses do not bundle resource bodies. The agent loads a resource only when it actually needs it.

## 10. Lazy Loading via `get_resource`

When the agent encounters a resource reference it needs, it calls:

```javascript
get_resource({ session_index, resource_id: "meta/activity-worker-prompt" })
```

The server resolves the reference:

* **Bare slugs** (e.g. `"review-mode"`) resolve within the session's workflow.
* **Prefixed references** (e.g. `"meta/activity-worker-prompt"`) resolve from the named workflow.

An optional `#section` anchor (a GitHub-style heading slug) narrows the result to that section and its body — used to fetch just the template a technique references without the whole file. The content is loaded from `workflows/{workflow}/resources/{slug}.md` and returned alongside the resource `id` and `version`.

Under `context_mode: "persistent"`, a byte-identical refetch of the same exact `resource_id` (including any `#section`) returns a short `{ delivery: "unchanged", content_hash }` marker instead of the body — the same reference-delivery contract as `get_technique` (see [Reference Delivery](#11-reference-delivery)). Bare and sectioned ids are independent ledger keys. Pass `full: true` to force the full body when the calling context no longer holds the earlier delivery. Fresh/default sessions always receive the full resource body. Each call still appends a `resource_fetched` history event (observability only), including when the answer is an unchanged marker.

### Benefits

* **Context Economy:** Agents load only the exact Markdown guides they need for the technique they are currently performing; persistent sessions avoid re-paying unchanged templates on later fetches.
* **Modularity:** Reference guides (PR formatting, Git CLI usage, etc.) live in single markdown files and are referenced from many techniques across many workflows without duplication.
* **Cross-workflow sharing:** The `{workflow}/{slug}` prefix lets techniques in any workflow pull from a shared resource library in the `meta` workflow.

## 11. Reference Delivery

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

`get_technique` and `get_resource` collapse under either `bundle: "reference"` or a session-wide `context_mode: "persistent"`. Fresh and default sessions always receive full bodies.

### Blocks inside a technique

Collapsing can go finer than a whole technique. Techniques sharing a workflow contract share blocks: the contract-inherited `inherited_inputs` and `inherited_outputs`, and the merged `rules`. Each is hashed on its own, under `technique:<block>:<hash>`.

So when a technique is new to the context but one of its shared blocks already arrived with a sibling technique, that block becomes a marker in place while the technique-specific core arrives in full. This happens both on the `get_technique` full-delivery path and inside each eagerly inlined `get_activity` `step_techniques` entry.

Inside one `get_activity` response this pass runs **in every delivery mode**, because composition merges each ancestor group's rules into every technique that group covers: a response bundling ten techniques of one group would otherwise carry that group's rules ten times. The marker points at the sibling entry in the same payload, so it is readable by a worker holding nothing from before. Widening it to the ledger — collapsing against what arrived on an *earlier call* — is what reference delivery adds.

Two steps bound to the same technique in one activity collapse the same way: the second entry is a marker naming the first.

Hashing the content is what keeps this from going stale: a block annotated with binding-seam provenance hashes differently, so it correctly arrives in full.

### Forcing full delivery

`get_activity { bundle: "full" }`, `get_technique { full: true }` and `get_resource { full: true }` each force the full payload, every block included. Reach for them when the calling context no longer holds the earlier payload — after it was summarized away, for instance.

### What gets measured

**Every dispatch is counted.** Each `get_activity` records an `activity_dispatched` history event carrying `{ agentId, dispatch: "fresh" | "resume", chars }`, and echoes the discriminator on `_meta.dispatch`. The server derives fresh-versus-resume from whether it has met that scope at all, so the orchestrator does not have to declare it, and the two values name the two states the ledger has: an empty ledger taking full delivery, and prior deliveries to collapse. A worker dispatched out of band, which never calls `get_activity`, records the same event on its first `get_technique` or `get_resource`. Where `activity_usage` counts activity exits, this counts dispatches.

**A second copy of one activity is visible.** When an activity is delivered whole to a context that has not received it, in a session where another context already took it, the server also records `activity_redelivered` carrying `{ agentId, priorAgentId, chars }`. That is either a replaced worker or a resume that arrived under a fresh identity, and it leaves no other trace — a second full delivery reads like a first one at every other instrument.

**Sizes are summable.** `technique_fetched`, `technique_bundled` and `resource_fetched` each carry `chars` — always the full payload size, on both paths — and `delivery: "full" | "unchanged"`. Characters delivered and characters saved are therefore both totals you can add up from the ledger.

**Benchmarks.** `npm run bench:token` compares delivery cost per session mode over a fixed `work-package` walk, against the committed baseline ([`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts); `vsReference.deliveryCostIndex` reports baseline = 100, lower is better). The Verify workflow gates on it at 1%, so a definition change that adds delivery is priced at merge — see [development.md](development.md#the-gate-runs-on-every-pull-request). `npm run bench:dispatch` measures the other axis — a fresh worker dispatch against the same worker resumed ([`scripts/run-dispatch-benchmark.ts`](../scripts/run-dispatch-benchmark.ts)). See [development.md](development.md#token-delivery-benchmark).

## 12. Hybrid Technique Bundling

`get_activity` inlines the composed content of an activity's small step techniques under a `step_techniques` map, so those steps run without a fetch round-trip. This is automatic and corpus-wide — there is no per-activity opt-in. What sizes the bundle is the worker's REQUIRED `context_tokens`.

### The budget

One cumulative character budget per activity:

```
context_tokens × headroomFraction × charsPerToken
```

`headroomFraction` (default 0.80) and `charsPerToken` (default 4) are server config, overridable with `BUNDLE_HEADROOM_FRACTION` and `BUNDLE_CHARS_PER_TOKEN`.

That budget governs everything inlined eagerly, so the worker technique bundle opens the tally at what it costs this response. Step technique bodies draw on the remainder, in document order; eagerly bundled resource bodies then draw on the same counter. Each loop stops at the first entry that would overflow what remains, and the rest stay lazy. Unchanged-reference markers cost almost nothing and never draw it down.

`spent_chars` on the delivery cost line is that whole tally, against `eager_budget_chars`; `worker_bundle_chars` reports the invariant part on its own.

This is how `context_tokens` comes to bound the eager bundle, which is the budget policy's stated purpose in [`src/config.ts`](../src/config.ts).

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

**Sent in neither mode:** a single oversized resource (per-resource cap 80 000 chars by default), and anything past the cumulative budget. Their ids join `resource_refs`, so nothing linked ever becomes unreachable.

### What the response looks like

Bundled techniques arrive under `step_techniques`, keyed by step id. Each entry opens with a discrete `▼ STEP <step_id> · technique <name>` arrival marker, then the step's full composition — identical to what a step-bound `get_technique` fetch returns.

`step_techniques_note` states the stepping contract and points at `resources_note`, which is the single authority on how *this* response delivered the linked resources: bodies under `resources`, or ids under `resource_refs`. `_meta.bundled_steps`, `_meta.bundled_resources` and `_meta.resource_refs` mirror the three id lists.

### Stepping stays deliberate

Calling `get_technique` is itself a beat — *I now turn to this step*. Inlining removes the call, so the worker supplies the beat instead: it processes inlined `step_techniques` strictly in step order and, on reaching each one, EMITs a one-line `▶ step <step_id>` marker before executing it.

That emitted line carries the intentional act, and it **is** the stepwise observability trace for bundled steps. The worker does not ping the server per bundled step — the `technique_bundled` events recorded at delivery time already record coverage.

### Ledger interplay

Bundled entries share the `technique:<resolvedId>` key with `get_technique`. So in a persistent-context session a bundled delivery collapses a later step-bound refetch to an unchanged reference; and a reference-mode re-delivery of the activity collapses already-delivered bundled entries to markers, with the `▼ STEP` marker riding along. `bundle: "full"` re-delivers everything.

### Fidelity

Each bundled step records a `technique_bundled` history event, and that counts as delivery coverage for `next_activity`'s manifest fidelity check — see [Workflow Fidelity](workflow-fidelity.md).
