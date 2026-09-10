---
metadata:
  version: 2.0.0
---

## Capability

Maps a step's bound operation onto the workflow variable bag by the operation's declared `inputs[]`/`outputs[]` signature.

## Protocol

1. Resolve the contract. Load the composed `inputs[]`/`outputs[]` of the bound operation (the `::`-path signature merged with ancestor `TECHNIQUE.md` declarations — `get_technique` returns it fully composed).
2. Bind each declared input id `I` into the concrete input map, in this precedence:
   1. If `I` appears in `step.technique.inputs`, resolve its source-expression (literal / rename / template, per the deviation forms below) and bind that value.
   2. Else if this activity runs as one instance of a graph fan and `I` is that fan's per-instance parameter, bind the value the block on this delivery carries. The projection is server-computed and reaches this context alone; the shared bag holds the collection, not this instance's element.
   3. Else if the variable bag holds a variable named `I`, bind its value — the implicit same-name bind, which carries zero per-step data.
   4. Else if the input declares a `default`, use it.
   5. Else the input is unsatisfied — surface it as a binding gap (the call-site must supply it via a `step.technique.inputs` deviation, or the signature must declare a `default`).
3. Resolve a string deviation by the disambiguation rule: a string that matches the bag-name grammar (`^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$`) AND resolves in the variable bag is a rename reference (bind the named variable's value); otherwise it is a literal; a string containing `{…}` is always a template (interpolate `{path}` against the bag, walking dotted paths into nested objects, then substitute and bind the result).
4. Invoke the bound operation with the concrete input map.
5. Land outputs. For each declared output id `O`, take the produced value and commit it to the variable bag under `O` (or under the remapped bag name when `step.technique.outputs` maps `O` to a different name). Nested-object outputs land whole, so a dotted-path read downstream resolves against the landed object.
6. Read downstream by name or path. A later `when`/`condition`/`transition` reads `{O}` or `{O}.field.subfield` directly; the structured-condition evaluator walks the dotted path, so no flattening step is needed.

## Rules

### signature-is-the-contract

A step's consumed and produced data is exactly the bound operation's composed `inputs[]`/`outputs[]`. Keep signatures complete: every `{name}` an operation's protocol reads is a declared input (or carries a `default`), and every value it emits is a declared output. An incomplete signature is a binding gap, not an implicit convention.

### binding-carries-only-deviations

The structured `step.technique` object carries ONLY what differs from the defaults; a step with no deviation uses the bare-string form (`technique: group::operation`) instead. `inputs` lists ONLY inputs whose value differs from same-name binding or a declared `default` — an input equal to its default, or already in the bag under its own id, is omitted. The three input-deviation forms are: a literal (`inputs: { scope: '--workspace' }`), a rename naming another bag variable (`inputs: { check_id: failed_check_id }`), and a `{var}` template including dotted projection (`inputs: { scope: '-p {current_task.crate}' }`). `outputs` lists ONLY outputs whose landed bag name differs from the output's own id (`outputs: { session_index: client_session_index }`); an output that lands under its own name is omitted.

### outputs-by-name-and-path

Downstream `when`/`condition`/`transition` reference an operation's output by its declared name or a dotted path into it (`validation_results.validation_passed`) — never via a redundant flattened flag or a prose glue step that only re-expresses a field. A nested-object output lands whole and resolves by path directly.

### a-branch-lands-under-its-own-derived-key

Where the graph runs this activity as a branch of a fan, its whole reported map lands in a slot of its own under a key derived from the activity id — the id in snake case with `_outputs` appended, so `research-pass` lands under `research_pass_outputs`. The server derives the key from the graph it has already loaded and no caller supplies it, so two branches cannot collide by writing the same name. Report outputs at their bare names, unchanged: nothing about position in the graph reaches the envelope. Inside the branch names stay bare too — a later step reads an earlier step's output directly, never through the key.

Downstream, a member is read at `{<key>.<instance>.result.<member>}`; the index is always present, including slot zero, so a read form does not depend on the fan's shape and an activity borrowed into two workflows reads its inputs the same way in each. A meeting point that needs the members combined gathers the container whole rather than addressing a slot — see [scatter-gather](./scatter-gather.md)::a-join-gathers-the-container-not-an-index.

### outputs-mutate-state-only-via-sanctioned-path

Outputs land in the bag through the `variables-changed` channel of the worker's `activity_complete` result — one of the two sanctioned variable-mutation sources — never through ad-hoc reasoning. This honours the engine's `variable-mutation-source` rule.

### generic-not-overfit

Bind against the operation's intrinsic, reusable signature; resolve a name mismatch by aligning the caller's bag variable to the operation's canonical input id (or, failing that, a single `step.technique.inputs` rename), not by bending the operation to the call-site. This is the generic-not-overfit principle governing which side of a mismatch moves, so that implicit same-name binding is maximised rather than eroded by per-caller overfitting.

### activity-group-shorthand

When an activity's operations are collected into a group named after the activity, a step names its operation by the bare op id alone: `technique: classify` inside the `intake` activity resolves to `intake::classify`. Resolution tries the activity-named group FIRST, so a bare op takes precedence over a same-named standalone or group base, and an op that shares its group's name resolves to the op (`technique: research` → `research::research`, not the `research` group base). If no group named after the activity holds the op, the bare id falls back to standalone / group-base resolution, then fails. Operations from any OTHER group — including the shared `meta` layer — are always written qualified (`gitnexus-operations::analyze`, `review-assumptions::reconcile`). The shorthand keeps an activity's own operations terse while every foreign reference stays explicit.
