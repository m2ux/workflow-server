# State management and deterministic transitions

Ask a model what to do next and it will answer, but not always the same way twice. Two runs of the same workflow over the same facts can then take different paths, and neither is reproducible or auditable. So the server does not ask. Every branch is a structured condition evaluated against a bag of declared variables, and the first condition that holds decides the next activity.

## Where variables come from

### Declared where it is owned

`workflow.yaml` holds the facts a session starts with and the policy that spans its activities. Everything an activity produces is declared by that activity, under `variables.writes`, beside the reads it needs.

```yaml
variables:
  - name: needs_migration
    type: boolean
    defaultValue: false
  - name: planning_folder_path
    type: string
    required: true
```

### How the two lists become one

Including an activity in a workflow's graph contributes its write declarations to that workflow. The two lists are therefore one variable set by the time the workflow loads, and an activity that two workflows run states its needs once, in the file that holds it.

Two declarations of one name that disagree about type, starting value or value set describe two different variables under one name. The workflow does not load, and the disagreement is named.

#### Silence is no opinion

A declaration saying nothing about a starting value agrees with one that names it, and the named value is what the session seeds. So a variable gains its starting value at the one site that owns the policy, without every other site having to repeat it.

### Seeding at session creation

The server seeds every declared default from the combined set into the session's variable bag when the session opens: at `start_session` for a top-level session, and at `dispatch_child` for an embedded child, which seeds from the child workflow's own declarations. The seeded map is recorded as a single `variables_seeded` event.

Seeding at creation keeps the orchestrator's copy of the state and the server's bag in agreement from the first call, so `get_workflow_status` returns the seeded values rather than an empty map.

### Absence carries meaning

A variable with no declared default stays absent, and that absence is what an `exists` or `notExists` gate tests. Gating a defaulted variable that way asks a question with only one possible answer, so `check:variable-model` reports it.

### What the server does not check

A declared type is one of `string`, `number`, `boolean`, `array` or `object`, and types are advisory. A write that disagrees with one is stored as written and surfaced in `_meta.validation`. Marking a variable `required` is authoring metadata the server does not act on.

## The two ways state changes

After seeding, exactly two things write to the bag, and both go through the same server routine. The bag is therefore the union of what the user decided and what the workers found.

### An answer at a checkpoint

A worker that reaches a gate — confirming a detected fact about the target, say — pauses there, and the question travels up to the user-facing agent, the only one that can ask a person. The [dispatch model](dispatch-model.md) covers that chain. The option the user picks may carry an effect:

```json
"effect": {
  "setVariable": { "needs_migration": true }
}
```

The user-facing agent passes the update down to the orchestrator, which applies it to its own copy of the state before passing it on to the worker.

### A worker's outputs

A worker that completes an activity returns a structured result naming the variables its work settled — that the tests found critical bugs, for instance. The orchestrator relays that map verbatim as `next_activity`'s `variables_changed`, and the server writes it into the bag on the transition, recording one `variable_set` event per name against the activity being left.

Because those outputs land in the bag rather than in a prompt, `get_workflow_status` and `inspect_session` report the state the run actually reached, and an orchestrator that has lost its context window recovers that state from the server.

An action step is carried out by the worker rather than by the engine, so the way its result reaches the bag is the worker reporting it among these outputs.

<a id="choosing-the-next-activity"></a>

## Choosing the next activity

### Two halves, in two files

An activity that is complete names the outcome it reached, from the outcomes it declares:

```yaml
exits:
  - id: migration
    when: needs_migration == true
  - id: standard
    isDefault: true
```

The workflow that runs the activity says where each outcome leads:

```yaml
graph:
  detect-layout:
    migration: migrate-layout
    standard: analyse-sources
```

### How the orchestrator decides

The orchestrator evaluates the exits in order against the current state and takes the first whose
`when` holds, falling to the default when none does. A checkpoint option may name an exit instead,
and that selection wins.

It then reads the destination from the graph and calls `next_activity` with that id, reporting the
exit it took as the `exit` parameter. It asks neither the user nor the model, which is what the
declared form is for.

An exit's `when` is the same inline expression a step gate uses: comparisons with `==`, `!=`, `>`,
`<`, `>=` and `<=`, bare identifier truthiness, unary `!`, and `&&` / `||` with parentheses.

### Each audience gets the half it acts on

`get_workflow` gives the orchestrator the whole graph. `get_activity` gives the worker its own
activity's row of it, as `exit_destinations` — the destination each declared exit leads to, exactly
as the graph names it: an activity id, `__terminal__`, a list of members, or one activity together
with the collection it runs over.

So a worker selects its exit from the predicates in front of it and reports that destination unread,
rather than reaching for a tool its role does not hold. A checkpoint option may name an exit too, and
`present_checkpoint` resolves it through the same graph, which is how the orchestrator states each
option's consequence before the user chooses.

### What the split buys

Splitting the two halves lets one activity sit in two workflows. A workflow that reuses another's
activities binds their exits in its own file, so it can place them in a different order without
editing files it does not own.

It also lets an outcome end the run: a graph may send an exit to `__terminal__`, which completes the
session without landing on an activity.

### Leaving an activity early

An exit may be declared `immediate`. Selecting one at a checkpoint ends the activity's step sequence
there, so a user who aborts does not then watch the remaining steps run. The step-manifest check
reads the recorded exit and accounts for the steps it skipped.

## Varying the path

A workflow varies its path through ordinary state rather than through a mechanism of its own. A boolean set early, by a detection step or by a checkpoint, marks the variant, and exit predicates and step gates branch on it to skip or redirect activities. Because the variable lives in the single bag, the variant persists across activities without anything carrying it. A review mode, an update mode, a dry run — each is built this way rather than by a mode switch the engine knows about.

<a id="opening-a-session"></a>

## Opening a session

`start_session` opens a top-level session, defaulting to the `meta` workflow. Pass `working_directory` as the checkout under work: the server derives `owner/repo` from that checkout's origin, even when the folder is named for a branch. `repo` is optional, and must equal the derived origin when supplied.

A named `planning_folder` resumes an existing session. Where a derived dated slug already holds one, the server opens the next free numbered folder rather than joining it. `user_request` seeds the opening request into the variable bag, and children inherit it.

### What comes back instead of a session

Not every call returns a session index.

| Response | When |
|----------|------|
| `client` beside the session | A unique catalog match, with no resume phrasing in the request |
| A `decision`, and no `session_index` | A durable meta start that cannot uniquely open a client. The decision is `workflow-selection` or `resume-session` |

Every response carries `execution_path`: `agent` where a caller walks the definition, `runner` where the server does.

<a id="persistence"></a>

## Persistence

### The two files

The server owns the canonical session state and writes it to disk atomically on every authenticated call. Agents hold a six-character `session_index`, derived deterministically from the planning slug, and nothing else. They neither read nor write the state themselves.

Session files live under the engineering root rather than under the feature worktree. Which root that is, and where the planning folder sits inside it, are in [artifact and workspace isolation](artifact-management-model.md#the-planning-folder). Each session folder holds two files:

* **`session.json`** carries the state as plaintext, validated against [`schemas/session-file.schema.json`](../schemas/session-file.schema.json). It holds where the run has got to, what it decided, and what it did — the workflow and version it started against, the variable bag, the activities completed and skipped, the checkpoint responses, the history, any launched children, and for a child, a snapshot of its parent. A person can read it, and it is reproducible from the workflow definition. Read the schema for the field-by-field shape rather than a list here, which would drift from it.
* **`.session-token`** is a sealed envelope binding those exact bytes to the engineering root and to the server's signing key. The server verifies it on every read, and a disagreement raises `SealMismatchError`. What the seal does and does not prove is in [workflow fidelity](workflow-fidelity.md#layer-1-session-integrity).

### Two calls against one session

Writes are atomic and ordered — the state file first, then the seal — and a read verifies the seal before returning anything.

A write also carries the bytes its call read. The state file is replaced only while it still holds them. A call whose file has moved on since is refused with `STALE_WRITE`, and nothing is written, so two calls in flight against one session end with one refused rather than one silently discarded.

That pairing is ordinary rather than exotic, because a parent and its launched children live in a single file with the child's state inside its parent's. A parent recording a figure while one of its children advances is two writes against the same bytes.

#### A refusal is the caller's to retry

The server does not retry on the caller's behalf, because the change a call composed is the caller's, and re-deriving it is a call rather than a write.

The error text tells the agent to make the same call again, and states that nothing was written. That is the fact deciding whether an agent retries or stalls: it can tell that repeating records once rather than twice. The repeat reads the state as it then stands. An orchestrator keeping one call in flight per session never meets this.

### Pause, stop, resume

Because the state lives in the file rather than in an agent's context, a session can pause, stop or resume without losing its place in the state machine.

Resume is a single call, `start_session({ agent_id, planning_folder })`: the server loads the file, verifies the seal, and returns the same index. A server restart is transparent, and there is no adoption or recovery step for an agent to perform.

The install script on the `docker` branch creates the host layout, and product checkouts live under `HOST_PROJECTS_ROOT`, for which [setup.md](setup.md) has the sequence.
