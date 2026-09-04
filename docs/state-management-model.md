# State Management and Deterministic Transitions

Ask a model what to do next and it will answer, but not always the same way twice. Two runs of the same workflow over the same facts can then take different paths, and neither is reproducible or auditable. So the server does not ask. Every branch is a structured condition evaluated against a bag of declared variables, and the first condition that holds decides the next activity.

## Where variables come from

A variable is declared where it is owned. `workflow.yaml` holds the facts a session starts with and the policy that spans its activities; everything an activity produces is declared by that activity, under `variables.writes` beside the reads it needs. Including an activity in a workflow's graph contributes its write declarations to that workflow, so the two lists are one variable set by the time the workflow loads — and an activity two workflows run states its needs once, in the file that holds it. Two declarations of one name that each name a different type, starting value or value set describe two different variables under one name, so the workflow does not load and the disagreement is named. Silence is no opinion: a declaration that says nothing about a starting value agrees with one that names it, and the named value is what the session seeds — so a variable gains a starting value at the one site that owns the policy, without every other site having to repeat it.

The server seeds every declared default from that combined set into the session's variable bag when the session opens — at `start_session` for a top-level session, at `dispatch_child` for an embedded child, which seeds from the child workflow's own declarations. The seeded map is recorded as a single `variables_seeded` event.

Seeding at creation is what keeps the orchestrator's copy of the state and the server's bag in agreement from the first call, so `get_workflow_status` returns the seeded values rather than an empty map.

A variable with no declared default stays absent, and that absence carries meaning: it is what an `exists` or `notExists` gate tests. Gating a defaulted variable that way asks a question with only one possible answer, so `check:variable-model` reports it.

Declared types are advisory. A write that disagrees with one is stored as written and surfaced in `_meta.validation`. Marking a variable required is authoring metadata that the server does not check.

Example declarations:

```yaml
variables:
  - name: is_monorepo
    type: boolean
    defaultValue: false
  - name: review_mode
    type: boolean
    defaultValue: false
  - name: planning_folder_path
    type: string
    required: true
```

A declared type is one of `string`, `number`, `boolean`, `array` or `object`.

## The two ways state changes

After seeding, exactly two things write to the bag, and both go through the same server routine. The bag is therefore the union of what the user decided and what the workers found.

### An answer at a checkpoint

A worker that reaches a gate — confirming that a repository is a monorepo, say — pauses there, and the question travels up to the user-facing agent, the only one that can ask a person. The [dispatch model](dispatch-model.md) covers that chain. The option the user picks may carry an effect:

```json
"effect": {
  "setVariable": { "is_monorepo": true }
}
```

The user-facing agent passes the update down to the orchestrator, which applies it to its own copy of the state before passing it on to the worker.

### A worker's outputs

A worker that completes an activity returns a structured result naming the variables its work settled — that the tests found critical bugs, for instance. The orchestrator relays that map verbatim as `next_activity`'s `variables_changed`, and the server writes it into the bag on the transition, recording one `variable_set` event per name against the activity being left.

Because those outputs land in the bag rather than in a prompt, `get_workflow_status` and `inspect_session` report the state the run actually reached, and an orchestrator that has lost its context window recovers that state from the server.

An action step is carried out by the worker rather than by the engine, so the way its result reaches the bag is the worker reporting it among these outputs.

## Choosing the next activity

The choice is made in two halves, in two files. An activity that is complete names the outcome it
reached, from the outcomes it declares:

```yaml
exits:
  - id: monorepo
    when: is_monorepo == true
  - id: single-repo
    isDefault: true
```

The workflow that runs the activity says where each outcome leads:

```yaml
graph:
  detect-repository:
    monorepo: select-submodule
    single-repo: analyze-codebase
```

The orchestrator evaluates the exits in order against the current state and takes the first whose
`when` holds, falling to the default when none does; a checkpoint option may name an exit instead,
and that selection wins. It then reads the destination from the graph and calls `next_activity` with
that id, reporting the exit it took as the `exit` parameter. It asks neither the user nor the model,
which is what the declared form is for.

An exit's `when` is the same inline expression a step gate uses: comparisons with `==`, `!=`, `>`,
`<`, `>=` and `<=`, bare identifier truthiness, unary `!`, and `&&` / `||` with parentheses.

Splitting the two halves is what lets one activity sit in two workflows. `remediate-vuln` runs
fourteen of `work-package`'s activities and binds their exits in its own file, so it can place them
in a different order without editing files it does not own. It is also what lets an outcome end the
run: a graph may send an exit to `__terminal__`, which completes the session without landing on an
activity.

An exit may be declared `immediate`. Selecting one at a checkpoint ends the activity's step sequence
there, so a user who aborts does not then watch the remaining steps run; the step-manifest check
reads the recorded exit and accounts for the steps it skipped.

## Varying the path

A workflow varies its path through ordinary state rather than through a mechanism of its own. A boolean set early, by a detection step or by a checkpoint, marks the variant, and exit predicates and step gates branch on it to skip or redirect activities. Because the variable lives in the single bag, the variant persists across activities without anything carrying it. Work-package's review mode, and workflow-design's update and review modes, are all built this way.

## Persistence

The server owns the canonical session state and writes it to disk atomically on every authenticated call. Agents hold a six-character `session_index` and nothing else; they neither read nor write the state themselves.

Session files live under the engineering root rather than under the feature worktree:

| Binding | Engineering root | Default planning path |
|---------|------------------|------------------------|
| `--workspace=PATH` (legacy single-root) | same as workspace | `<root>/.engineering/artifacts/planning/<slug>/` |
| `--repo=owner/repo` (or an explicit engineering directory) | `$HOST_PROJECTS_ROOT/<repo>/.engineering` | `<engineering>/artifacts/planning/<slug>/` |

`PLANNING_SLUG` overrides the relative segment.

Each session folder holds two files.

* **`session.json`** carries the state as plaintext, validated against `schemas/session-file.schema.json`: the session index, the workflow and the version it started against, the agent, the sequence number, the current activity and technique, any active checkpoint, the variable bag, the activities completed and skipped, the checkpoint responses, the history, any triggered workflows, and — for a child workflow — a snapshot of its parent. A person can read it, and it is reproducible from the workflow definition.
* **`.session-token`** is a sealed envelope binding those exact bytes to the engineering root and to the server's signing key. The server verifies it on every read, and a disagreement raises `SealMismatchError`. What the seal is for, and what it does and does not prove, is in [workflow fidelity](workflow-fidelity.md).

Writes are atomic and ordered — the state file first, then the seal — and a read verifies the seal before returning anything.

The `session_index` is derived deterministically from the planning slug. For the exact field-by-field shape, read [the JSON Schema](../schemas/session-file.schema.json) rather than a list that would drift from it.

This is what lets a session pause, stop or resume without losing its place in the state machine. Resume is a single call, `start_session({ agent_id, planning_folder })`: the server loads the file, verifies the seal, and returns the same index. Because the state lives in the file rather than in an agent's context, a server restart is transparent, and there is no adoption or recovery step for an agent to perform.

[`scripts/install.sh`](../scripts/install.sh) creates the host layout, and product checkouts live under `HOST_PROJECTS_ROOT`, for which [setup.md](../setup.md) has the sequence.
