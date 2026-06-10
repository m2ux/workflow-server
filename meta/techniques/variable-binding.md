---
metadata:
  version: 1.0.0
---

## Capability

Bind a step's operation to the workflow-scoped variable bag: resolve the operation's declared inputs by name, apply any call-site deviations, invoke the operation, and land its declared outputs back into the bag under their declared names. The single source of truth for what a step consumes and produces is the bound operation's declared `inputs[]`/`output[]` signature; downstream steps and conditions read those outputs by name or dotted path.

## Inputs

### bound_operation

The step's `step.technique` (`group::operation` or a bare single-file id). Its composed `inputs[]`/`output[]` signature is the binding contract.

### step_deviations

The step's `step.technique_args` map (may be empty). Each entry is `input-id → source-expression`, carrying only what differs from same-name binding or from a declared `default`.

### variable_bag

The workflow-scoped variable bag — the ambient state available at this step.

## Output

### bound_inputs

The concrete `input-id → value` map handed to `{bound_operation}`.

### landed_outputs

The `bag-name → value` map committed back to `{variable_bag}` through the sanctioned `variables-changed` channel.

## Protocol

1. Resolve the contract. Load the composed `inputs[]`/`output[]` of `{bound_operation}` (the `::`-path signature merged with ancestor `TECHNIQUE.md` declarations — `get_technique` returns it fully composed).
2. Bind each declared input id `I` into `{bound_inputs}`, in this precedence:
   1. If `I` appears in `{step_deviations}`, resolve its source-expression (literal / rename / template, per the deviation forms below) and bind that value.
   2. Else if `{variable_bag}` holds a variable named `I`, bind its value — the implicit same-name bind, which carries zero per-step data.
   3. Else if the input declares a `default`, use it.
   4. Else the input is unsatisfied — surface it as a binding gap (the call-site must supply it via `{step_deviations}`, or the signature must declare a `default`).
3. Resolve a string deviation by the disambiguation rule: a string that matches the bag-name grammar (`^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$`) AND resolves in `{variable_bag}` is a rename reference (bind the named variable's value); otherwise it is a literal; a string containing `{…}` is always a template (interpolate `{path}` against the bag, walking dotted paths into nested objects, then substitute and bind the result).
4. Invoke `{bound_operation}` with `{bound_inputs}`.
5. Land outputs. For each declared output id `O`, take the produced value and commit it to `{variable_bag}` under `O` (or under the remapped name when a reserved output-remap entry for `O` is present in `{step_deviations}`), forming `{landed_outputs}`. Nested-object outputs land whole, so a dotted-path read downstream resolves against the landed object.
6. Read downstream by name or path. A later `when`/`condition`/`transition` reads `{O}` or `{O}.field.subfield` directly; the structured-condition evaluator walks the dotted path, so no flattening step is needed.

## Rules

### signature-is-the-contract

A step's consumed and produced data is exactly the bound operation's composed `inputs[]`/`output[]`. Keep signatures complete: every `{name}` an operation's protocol reads is a declared input (or carries a `default`), and every value it emits is a declared output. An incomplete signature is a binding gap, not an implicit convention.

### deviations-only-in-technique-args

`step.technique_args` carries ONLY what differs from same-name binding or from a declared `default`. An argument equal to a default, or one whose value is already in the bag under the input's own name, is omitted. The three deviation forms are: a literal (`{ scope: '--workspace' }`), a rename naming another bag variable (`{ check_id: failed_check_id }`), and a `{var}` template including dotted projection (`{ scope: '-p {current_task.crate}' }`).

### outputs-by-name-and-path

Downstream `when`/`condition`/`transition` reference an operation's output by its declared name or a dotted path into it (`validation_results.validation_passed`) — never via a redundant flattened flag or a prose glue step that only re-expresses a field. A nested-object output lands whole and resolves by path directly.

### outputs-mutate-state-only-via-sanctioned-path

Outputs land in the bag through the `variables-changed` channel of the worker's `activity_complete` result — one of the two sanctioned variable-mutation sources — never through ad-hoc reasoning. This honours the engine's `variable-mutation-source` rule.

### generic-not-overfit

Bind against the operation's intrinsic, reusable signature; resolve a name mismatch by aligning the caller's bag variable to the operation's canonical input id (or, failing that, a single `technique_args` rename), not by bending the operation to the call-site. This is the generic-not-overfit principle governing which side of a mismatch moves, so that implicit same-name binding is maximised rather than eroded by per-caller overfitting.
