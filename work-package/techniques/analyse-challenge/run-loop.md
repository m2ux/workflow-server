---
metadata:
  version: 1.0.0
---

## Capability

Drive the parameterized analyse → challenge → combine loop until the bound `{convergence_flag}` is false. Each iteration deepens agent-resolvable concerns; the loop exits when only irreducible residue remains (or the open set is empty).

## Inputs

### concern_kind

Domain of the open set (e.g. `assumptions`, `open_questions`).

### analyse

Technique path to invoke for the analyse phase each iteration (supplied via `step.technique.inputs`).

### challenge_perspectives

Perspectives (or lens names) passed to [challenge](./challenge.md) for the parallel adversarial pass.

### convergence_flag

Bag name of the boolean that is true while another iteration is needed. Defaults to reading `has_resolvable_assumptions` when `concern_kind` is `assumptions`, or `needs_comprehension` when `concern_kind` is `open_questions`, unless an explicit name is bound.

### residue_flag

Bag name of the boolean set true iff irreducible opens remain after convergence. Defaults to `has_open_assumptions` or `has_open_questions` by `concern_kind` unless overridden.

### residue_collection

*(optional)* Bag name for the residual open collection (e.g. `open_assumptions`).

### assumptions_log

*(optional)* Assumptions log when `concern_kind` is `assumptions` — forwarded to the bound `analyse` technique.

### target_path

*(optional)* Reference codebase root forwarded to analyse / challenge when they require it.

### comprehension_artifact

*(optional)* Comprehension artifact forwarded when analyse or challenge augments it.

### iteration_mode

*(optional)* `until_converged` (default) — repeat analyse → challenge → combine while `{convergence_flag}` is true. `once` — run a single analyse → challenge → combine pass and return (for activities that wrap this op in their own `while` with a soft gate).

## Outputs

### convergence_flag

The bound convergence variable after exit — always false when the loop completes normally.

### residue_flag

The bound residue variable after [combine](./combine.md).

### residue_collection

*(optional)* Residual open items when a collection name was supplied.

## Protocol

### 1. Resolve Binding Defaults

- Resolve `{convergence_flag}` and `{residue_flag}` bag names from explicit inputs or from `{concern_kind}` defaults above
- Confirm `{analyse}` is a callable technique path; surface a binding gap if missing

### 2. Iterate (or Single Pass)

- When `{iteration_mode}` is `once`, run one analyse → challenge → combine cycle and proceed to handoff.
- When `{iteration_mode}` is `until_converged` (default), repeat while the bag variable named by `{convergence_flag}` is true (or on the first pass when the flag is unset and open concerns exist):
  1. **Analyse** — invoke the bound `{analyse}` technique with forwarded context (`{assumptions_log}`, `{target_path}`, `{comprehension_artifact}` as applicable). When `{concern_kind}` is `open_questions` and `{analyse}` is `codebase-comprehension::deep-dive`, follow with [revise-questions](../codebase-comprehension/revise-questions.md) so Open Questions and `{needs_comprehension}` / `{has_open_questions}` stay current. Analyse updates the concern set and may set the convergence flag true when more agent-resolvable work remains.
  2. **Challenge** — invoke [challenge](./challenge.md) with `{challenge_perspectives}` and the current concern set / log. Challenge fans out adversarially via scatter-gather and returns per-perspective findings without writing shared bag flags itself.
  3. **Combine** — invoke [combine](./combine.md) to merge challenge findings into the concern set, resolve or reclassify items, and set `{convergence_flag}` / `{residue_flag}` (and `{residue_collection}` when bound).
- Exit when `{convergence_flag}` is false after combine (`until_converged`), or after the single pass (`once`). An empty open set yields `{residue_flag}` false.

### 3. Hand Off Residue

- Emit the bound flag values for the activity. Residual interview/batch is **not** performed here — the activity gates those steps on `{residue_flag}`.

## Rules

### no-user-interaction

The loop runs autonomously. User checkpoints belong to the binding activity after residue is known.

### one-gather-contract

Challenge uses scatter-gather isolation-then-combine; per-perspective outputs never clobber shared flags — only [combine](./combine.md) mutates convergence/residue state.

### max-iterations-safety

If the binding activity wraps this op in a `while`, honour that loop's `maxIterations`. When this op owns iteration internally, stop after a sane ceiling (default 10) and leave remaining opens as residue with a note that convergence was iteration-capped.
