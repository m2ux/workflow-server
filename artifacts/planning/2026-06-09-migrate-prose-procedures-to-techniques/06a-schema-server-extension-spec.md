# 06a — Binding & Scatter-Gather Design (technique-shaped)

**Session:** 6GRWGT · **Activity:** `scope-and-structure` · **Date:** 2026-06-10
**Status:** DRAFT for `scope-and-structure-confirmed` (revised). This is **Work item (A)** — the design core consumed by the work-package migration (Work item B, [`06-scope-and-structure.md`](./06-scope-and-structure.md)).

> **Direction pivot (2026-06-10, this revision).** The earlier draft of this doc framed Work item A as a **schema + server extension** (new `step.with`/`step.produces`/`step.note` fields, nine validator checks, edits to `schemas/*.json` + `src/schema/*.ts` + `src/loaders|tools/*.ts`). That framing is **withdrawn**. The settled design is **technique-shaped and stays entirely within `workflow-design`'s remit**: the binding HOW lives in a canonical **`variable-binding`** technique (authored in `meta`); scatter/gather lives in a canonical **`scatter-gather`** technique (authored in `meta`); per-instance wiring rides the **existing** `step.technique` + `step.technique_args` fields. **No mandatory schema change.** The only conceivable server touchpoint — widening `technique_args` value types — is OPTIONAL and DEFERRED (Appendix A); it is not a prerequisite for anything in Work item B. This honours `workflow-design`'s own rule *"Never modify schemas during workflow creation"* directly, rather than carving the schema work out to a separate package.

> **No sibling work-package any longer.** Because there is no mandatory schema/server change, there is **no separate "Spec A work package"** sequenced ahead of the migration. The two canonical `meta` techniques are authored as the FIRST step of the migration itself (Work item B, §B.5). A and B are now one coherent effort inside `workflow-design`'s output.

---

## 0. Design model recap (settled with the user)

The binding model is settled. This spec authors the **techniques and conventions** that realize it; it does not re-open it.

| ID | Decision |
|----|----------|
| **D1** | **Bind-by-name** against a SINGLE workflow-scoped variable bag. A technique/operation declares its `inputs[]`/`output[]` signature ONCE — that signature is the contract. A step binds inputs by matching name from the bag; it wires explicitly ONLY (a) call-site-specific literals and (b) renames. **This HOW is supplied by the canonical `variable-binding` technique, not by new schema.** |
| **D2** | An operation's `output[]` lands in the bag under its DECLARED name; downstream `when`/`condition`/`transition` read it BY NAME/PATH (e.g. `validation_results.validation_passed`). Prose glue steps and redundant derived flags (`has_failures`) are ELIMINATED — conditions read the output path directly. |
| **D3** | **Canonical qualified naming** aligns state-variable names to technique input/output ids to maximize implicit binding (AP-55/AP-60). Same-name bindings need ZERO per-step data; an explicit remap escape-hatch in `technique_args` covers genuine deviations. |
| **D4** | A step names its operation via the EXISTING `step.technique` field holding `group::operation` (e.g. `cargo-operations::run-suite`). Single-file techniques use the bare id (e.g. `reconcile-assumptions`). The loader already splits `::`. |
| **D5** | The EXISTING `step.technique_args` map carries ONLY deviations (literals, renames). Inputs not listed bind implicitly by same name or use the technique's declared `default`. |
| **D6** | **One operation per step.** Compound multi-operation steps MUST be split. |
| **D7** | Technique inputs carry `default` so the common call is argument-free. (Already supported by `technique.schema.json` `inputItemDefinition.default`.) |
| **D8** | **Action/control steps are exempt** from the every-step-binds-a-technique rule: a step that only `set`/`log`/`emit`/`message`/gates via `when` need not bind a technique. |

**What changed from the prior draft:** D1's "implicit bind-by-name" and D5's "deviation map" are realized by the `variable-binding` **technique** + the EXISTING `step.technique_args` field, NOT by a new `step.with` field. D4 reuses `step.technique` verbatim. The settled model is a strictly smaller change to the platform.

---

## 1. The binding model — HYBRID (technique + per-step specifics + naming convention)

Binding is decomposed into three layers, each owning exactly what it can know:

| Layer | Owns | Where it lives | Why it lives there |
|-------|------|----------------|--------------------|
| **(1) The HOW (universal protocol)** | The bind-by-name algorithm: read declared inputs from the bag by name; consult per-step deviations; read outputs by declared name/path. | The canonical **`variable-binding`** technique (authored in `meta` → resolves universally). Referenced as an activity **supporting** technique so `get_activity` bundles it into the worker's context. | The algorithm is identical for every step in every workflow. Authoring it ONCE as a universal technique is the DRY win. |
| **(2) The per-instance wiring** | THIS step's operation + THIS call-site's deviations (literals, renames). | `step.technique` (= `group::operation`) + the EXISTING `step.technique_args` (deviation map). | A generic technique CANNOT know per-instance wiring — that is exactly why these step-level fields exist and remain. |
| **(3) The leverage (zero-data default)** | Same-name bindings resolve with NO per-step data at all. | The **canonical naming convention** (D3 / AP-55 / AP-60). | When the bag variable and the technique input share a name, layers (1)+(3) resolve the binding; only genuine deviations carry data in `technique_args`. |

**The payoff.** For the common case (a step whose inputs are already in the bag under matching names), the step carries `technique: group::operation` and **nothing else** — `variable-binding` + the naming convention do the rest. Only deviations cost data:

```toon
# Common case — zero binding data; variable-binding + naming convention resolve it:
- id: preflight
  technique: cargo-operations::preflight

# Deviation case — only the non-default carries data:
- id: run-suite
  technique: cargo-operations::run-suite
  technique_args: { scope: '--workspace' }     # literal deviation from the -p <crate> default

# Rename case — input id ≠ bag id:
- id: analyze-failure
  technique: validate-build::analyze-failure
  technique_args: { check_id: failed_check_id }   # rename: bind input check_id from bag var failed_check_id
```

This is the same de-cluttering the prior draft achieved with `step.with`, realized with the field that **already exists** (`technique_args`) plus a technique that supplies the resolution protocol.

### 1.1 Deviation kinds carried by `step.technique_args`

`technique_args` is a map of `input-id → source-expression`. Three source-expression forms, resolved against the single bag (the `variable-binding` protocol, §2, defines the resolution precisely):

| Form | Example | Meaning |
|------|---------|---------|
| **Literal** | `{ scope: '--workspace' }`, `{ template: 'final' }` | Bind the literal value verbatim. |
| **Rename** (bare identifier naming another bag variable) | `{ reference_path: monorepo_root }` | Read the named bag variable; bind its value (pure rename when input id ≠ bag id). |
| **Template** (string containing `{…}`) | `{ scope: '-p {current_task.crate}' }` | Interpolate `{path}` against the bag (dotted paths walk nested objects), substitute, bind the result. |

> **String ambiguity (rename vs literal).** A `technique_args` string is a **rename reference** iff it matches the bag-name grammar (`^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$`) AND resolves in the bag; otherwise it is a **literal**. A `{var}` template (braces) is always interpolation. This disambiguation is a RULE in the `variable-binding` technique's protocol (agent-side), not a server check. Authors force a literal by declaring it as the input's `default` (preferred) or wrapping in a brace template against a constant.

### 1.2 The output side (D2) — auto-bind by declared name

When a step's bound operation declares `output[]`, each output's value lands in the bag under its **declared output id**. This is the `variable-binding` protocol's output half: the worker reports each produced output id→value via its existing `activity_complete` `variables-changed` channel; the orchestrator commits it to the bag exactly as it commits any `set` effect. **No new field, no new carrier** — the sanctioned variable-mutation path already exists.

Downstream `when`/`condition`/`transition` read the output **by name or dotted path**. This needs no engine change: the structured-`condition` evaluator (`getVariableValue`, `src/schema/condition.schema.ts` ~line 49) ALREADY resolves dotted paths by walking nested objects (`path.split('.')`). So `condition: { variable: "validation_results.validation_passed", operator: "==", value: false }` resolves the moment `validation_results` lands as a nested object — which `cargo-operations::run-suite` already emits. **The redundant `has_failures` flag and the `evaluate-results` glue step that only flatten that field are pure waste under D2; their removal is a content edit in Work item B (§B.4 worked example).**

> **Renames on the output side.** Genuine output renames are rare. When needed, the `variable-binding` protocol covers them via a `produces`-style entry in `technique_args` under a reserved convention (output-id → bag-name), OR — preferred — the technique's declared output id is simply aligned to the canonical bag name (D3). No dedicated `step.produces` field is introduced; the few real cases ride the same `technique_args` channel or are resolved by naming.

---

## 2. The `variable-binding` technique (canonical, authored in `meta`)

**Location:** `workflows/meta/techniques/variable-binding.md` (single-file technique; bare-id reference). Authored in `meta` so it resolves UNIVERSALLY — any workflow's activity may reference it as a supporting technique via the universal-technique fallback (no copy).

**Reference style:** listed in an activity's `techniques.supporting[]` so `get_activity` bundles it into the spawned worker's context. It is a STRATEGY technique (the binding protocol the worker applies to every bound step in that activity), which is precisely what `supporting[]` is reserved for under the refined model (§6, rule A3).

### 2.1 Capability

> Bind a step's bound operation to the workflow-scoped variable bag: resolve the operation's declared inputs by name (with per-step deviations), and land its declared outputs back into the bag by name. The single source of truth for what a step consumes/produces is the bound operation's declared `inputs[]`/`output[]` signature.

### 2.2 Inputs / Output (technique signature)

This is a *strategy* technique applied by the worker, so its "inputs" are the materials it operates over rather than scalar data:

- **`bound_operation`** — the step's `step.technique` (`group::operation` or bare id); its composed `inputs[]`/`output[]` is the binding contract.
- **`step_deviations`** — the step's `step.technique_args` map (may be empty).
- **`variable_bag`** — the workflow-scoped variable bag (ambient; the worker's current state).
- **Output: `bound_inputs`** — the concrete `input-id → value` map handed to the operation; and **`landed_outputs`** — the `bag-name → value` map committed via `variables-changed`.

### 2.3 Protocol (the bind-by-name / deviation / output-by-path algorithm)

1. **Resolve the contract.** Load the composed `inputs[]`/`output[]` of `{bound_operation}` (the `::`-path signature merged with ancestor `TECHNIQUE.md` declarations — the server's existing technique composition; `get_technique` returns it fully composed).
2. **Bind inputs.** For each declared input id `I`:
   1. If `I` appears in `{step_deviations}`, resolve its source-expression (literal / rename / template per §1.1) and bind that value.
   2. Else if a bag variable named `I` exists, bind its value (implicit same-name bind — the zero-data default).
   3. Else if the input declares a `default`, use it.
   4. Else the input is unsatisfied — surface it (a binding gap; the step's call-site must supply it via `technique_args` or the signature must declare a `default`).
3. **Apply the string-ambiguity rule** (§1.1) when resolving string deviations: bag-name-grammar + resolves-in-bag ⇒ rename; else literal; braces ⇒ template.
4. **Invoke** the operation with `{bound_inputs}`.
5. **Land outputs.** For each declared output id `O`, take the produced value and commit it to the bag under `O` (or under the remapped name if a reserved output-remap entry is present in `{step_deviations}`) via the `activity_complete` `variables-changed` channel. Nested-object outputs land whole, so dotted-path reads downstream resolve.
6. **Read-by-path downstream.** Document that `when`/`condition`/`transition` may read `O.field.subfield`; the structured-condition evaluator already walks the path. No flattening step is needed.

### 2.4 Rules (technique-level)

- **The signature is the contract.** A step's consumed/produced data is exactly the bound operation's composed `inputs[]`/`output[]`. Authors keep signatures complete (Work item B's signature-backfill pass, §B.3, closes the gaps the audit found).
- **Deviations only.** `technique_args` carries ONLY what differs from same-name binding or from a declared `default`. An argument equal to a default is omitted.
- **Outputs mutate state only via the sanctioned path.** Outputs land through `variables-changed` (the `activity_complete` result), never ad-hoc — honouring the existing `variable-mutation-source` rule.

> **Why a technique and not schema.** The bind-by-name algorithm is behavioural — it is *applied by the worker agent* over each step. Encoding it as a universal technique (a) makes it reusable across every workflow with zero per-workflow duplication, (b) keeps the schema a minimal skeleton, and (c) lets the protocol evolve (new deviation forms, new disambiguation rules) without a schema/engine release. This is the techniques-first principle (A4) in action.

---

## 3. The `gather` technique — collection-building (canonical, authored in `meta`)

**Location:** `workflows/meta/techniques/scatter-gather.md` (single-file technique; bare-id reference). Authored in `meta` for universal resolution; referenced as an activity **supporting** technique wherever a collection is built across iterations.

> **Framing (settled with the user, 2026-06-10).** This is a general **gather** capability — *collection-building* — NOT a parallel-only technique. An operation invoked repeatedly (once per work unit) emits a scalar output PER invocation; gather accumulates each into an ORDERED collection (input/iteration order) under ONE contract, then delegates a COMBINE operation over that collection. It has **two scatter modes** that differ only in HOW the per-unit invocations are dispatched — sequentially in a loop, or concurrently in a fan-out batch — and share ONE gather contract and ONE combine step. The file id stays `scatter-gather` (the scatter+gather pair); the *capability* is gather.

### 3.0 The convergence — sequential loop accumulation and parallel fan-out are the SAME primitive

State this explicitly: **sequential-loop accumulation and parallel fan-out are one primitive.** A `forEach` loop that runs an operation per item and accumulates each scalar output into an ordered collection IS a gather; a `spawn-concurrent` fan-out that runs the operation across N instances and collects their outputs into an ordered collection IS the same gather. They produce the identical shape — an ordered array (input/iteration order) with an OPTIONAL key. **Parallel mode is just the degenerate-symmetric extension of sequential mode: it adds concurrency + instance isolation; nothing else differs.** Equivalently, **sequential mode is the `concurrency = 1` case of parallel mode.** One gather contract, one combine step, two dispatch modes.

### 3.1 Capability

> Build an ORDERED collection (input/iteration order) by accumulating one scalar output per work unit, optionally keyed by an iteration variable, then delegate a COMBINE operation to merge/aggregate the collection. Work units are dispatched in one of two scatter modes — **sequential** (an operation invoked inside a `forEach` loop, one output accumulated per iteration; the degenerate `concurrency = 1` case) or **parallel** (`harness-compat::spawn-concurrent` fan-out across N instances). Both modes yield the same ordered keyed collection and feed the same combine. In parallel mode, per-instance outputs are ISOLATED — never auto-merged into the parent variable bag by scalar name.

### 3.2 The two scatter modes (one gather contract, one combine)

| Mode | Dispatch | Per-unit emission | Accumulation | Isolation |
|------|----------|-------------------|--------------|-----------|
| **Sequential** | An operation invoked inside a `forEach` loop, one iteration per work unit. | The bound operation emits a scalar output per iteration (e.g. `task_implementation` per task). | Each iteration's scalar is appended to the ordered collection, in iteration order, under the OPTIONAL key (the iteration variable). | Trivial — iterations don't run concurrently; the gather just prevents overwrite (append, don't clobber). |
| **Parallel** | `harness-compat::spawn-concurrent` fan-out — all instances dispatched in one batch. | Each instance emits its output. | `spawn-concurrent` collects results "in input order"; gather assembles them into the ordered collection under the OPTIONAL key. | Per-instance outputs are isolated — NEVER auto-bound into the parent bag by scalar name (would race/clobber). Combined only through the delegated op. |

Both rows produce the **same** `gathered_results` shape (ordered array + optional key) and feed the **same** `combine_operation`. The only delta parallel adds over sequential is **concurrency + isolation**.

### 3.3 Composition

`gather` is a COMPOSING technique. The combine sub-capability is delegated in both modes; the scatter sub-capability differs only by mode:

| Phase | Sequential mode | Parallel mode |
|-------|-----------------|---------------|
| **Scatter** | Bound operation invoked inside a `forEach` loop (one iteration per work unit). | `harness-compat::spawn-concurrent` (existing meta operation) dispatches all instances in one batch; already collects results "in input order" into its `results` output. |
| **Gather** | Append each iteration's scalar output to the ordered collection under the optional iteration key. | Assemble `spawn-concurrent.results` into the ordered collection under the optional iteration key (e.g. submodule path or check id) so the combine step can address instances. Record dispatch completeness (dispatched/returned counts) so a missing instance is detectable. |
| **Combine** | a DELEGATED combine operation (named by the caller) — same in both modes. | a DELEGATED combine operation (named by the caller) — same in both modes. |

The combine phase is identical across modes: the caller supplies WHICH combine operation (e.g. a `merge-findings`-style op, or an activity-level aggregate); `gather` defines the *contract* of the combine call (it receives the gathered ordered collection), not the merge logic.

### 3.4 Inputs / Output (one contract, both modes)

- **`fan_out_items`** — the ordered list of work units. In sequential mode this is the `forEach` `over` collection (e.g. `plan.tasks`); in parallel mode each entry yields an instance prompt for `spawn-concurrent`.
- **`scatter_mode`** (optional, default `sequential`) — `sequential` (forEach loop; `concurrency = 1`) or `parallel` (`spawn-concurrent` fan-out). Selects HOW units are dispatched; does NOT change the gather contract or combine.
- **`iteration_key`** (optional) — the per-unit key under which gathered outputs are addressed (e.g. `submodule_path`, `check_id`, the loop's iteration variable).
- **`combine_operation`** — the delegated operation that merges the gathered collection (a `group::operation` ref the caller supplies).
- **Output: `gathered_results`** — the ordered collection (input/iteration order) of per-unit outputs, optionally keyed by `iteration_key`; and **`combined_result`** — the output of `combine_operation` over `gathered_results`.

### 3.5 Protocol

1. **Scatter (by mode).**
   - *Sequential:* iterate `{fan_out_items}` in a `forEach` loop; invoke the bound operation once per unit; it emits one scalar output per iteration.
   - *Parallel:* build one instance prompt per `{fan_out_items}` entry; dispatch all at once via `harness-compat::spawn-concurrent` (single batch); block until all instances yield/complete.
2. **Gather (ordered + keyed).** Accumulate each unit's output into `{gathered_results}` in **input/iteration order**. Attach `{iteration_key}` to each entry if supplied. In parallel mode, record dispatch completeness (dispatched/returned counts) so a missing instance is detectable, and **do NOT merge any instance's scalar outputs into the parent bag by name** — instance outputs are isolated until combined. In sequential mode, accumulation appends rather than overwrites (the gather is what prevents a per-iteration scalar from clobbering the prior one).
3. **Combine.** Invoke `{combine_operation}` with `{gathered_results}` as its input; its output is `{combined_result}`, which lands in the bag under the combine operation's declared output name (per `variable-binding`, §2).

### 3.6 Rules (the safety invariant)

- **One gather contract, two scatter modes.** Sequential-loop accumulation and parallel fan-out are the same primitive (§3.0). The contract (`gathered_results` = ordered array + optional key) and the combine step are mode-independent; `scatter_mode` selects only the dispatch mechanism. Parallel mode is sequential mode plus concurrency + isolation; sequential mode is the `concurrency = 1` case.
- **Accumulate, never overwrite.** A scalar emitted per unit (per iteration or per instance) is APPENDED to the ordered collection — it must never overwrite the prior unit's value. (This is exactly the per-iteration accumulation a `forEach` loop needs so a scalar-per-task output gathers into an activity-level plural collection rather than clobbering it; see the binding-difficulty taxonomy, Class 5, §4.)
- **Isolation, then combine (parallel mode).** Parallel instance outputs are gathered into an isolated ordered collection and merged ONLY through the delegated `combine_operation`. They are NEVER auto-bound into the parent bag by scalar name (which would race/clobber across instances). This is the rule the per-workflow duplicates encode informally and the canonical technique makes explicit.
- **Order is preserved.** `gathered_results` is in `fan_out_items` / iteration order (in parallel mode inherited from `spawn-concurrent`'s in-input-order collection), so the combine step and any downstream report are deterministic.
- **Parallelism is optimisation.** Sequential mode is always valid for correctness (per `spawn-concurrent`'s own `parallelism-is-optimisation` rule); parallel mode is an optimisation that adds isolation.

### 3.7 DRY plan — collapse the per-workflow duplicates (FOLLOW-UP, not edited now)

The pattern already exists, duplicated, in three places. Each is an instance of the `gather` capability (the two audit workflows in parallel mode; the validate aggregate in sequential mode):

| Workflow | Scatter technique | Combine technique | What it does |
|----------|-------------------|-------------------|--------------|
| `cicd-pipeline-security-audit` | `techniques/dispatch-scanners.md` | `techniques/merge-scan-findings.md` | Dispatches per-submodule scanners via `spawn-concurrent`, collects in order, verifies completeness, dispatches a merge agent. |
| `substrate-node-security-audit` | `techniques/dispatch-sub-agents.md` | `techniques/merge-findings.md` | Same shape over sub-agents. |
| `work-package` (validate) | — | `techniques/validate-build/aggregate-results.md` | Aggregates per-check validation results. |

**Plan:** in a LATER pass, these collapse onto the canonical `gather` (caller supplies `fan_out_items` + the workflow-specific `combine_operation` such as `merge-scan-findings`, and `scatter_mode` — `parallel` for the two audit workflows, `sequential` for the validate aggregate). This is noted as a **follow-up**; **do NOT edit these files in this migration.** (Recording it here satisfies the requirement to recognise the duplication without acting on it now.)

> **Grounding.** `dispatch-scanners.md` literally composes `harness-compat::spawn-concurrent` (its protocol step 2), collects results, verifies a dispatch manifest, then dispatches a downstream merge agent — confirming the parallel-mode decomposition (scatter → gather-with-completeness → combine) is faithful to the existing, working instances. The sequential-mode counterpart is the per-iteration accumulation a `forEach` loop performs (e.g. `08-implement`'s task loop emitting `task_implementation` per task into a `completed_tasks` collection) — the same gather contract at `concurrency = 1`.

---

## 4. Binding-difficulty taxonomy — empirical feasibility finding (6 classes)

An audit of real `work-package` call-sites (grounded in the source `.toon` files, not hypotheticals) surfaces every way a step-to-technique binding can be non-trivial. They fall into **six classes**, each with a settled disposition. The point of cataloguing them is the **feasibility conclusion** (end of section): implicit bind-by-name carries the steady-state majority, and the model explicitly owns a small, bounded set of escape-hatches for the rest.

> **Read this as evidence the model is sufficient.** None of the six classes needs a schema field beyond the existing `step.technique` + `step.technique_args`. Three are absorbed by `technique_args` (the escape-hatch), one by a one-time signature backfill, two by the unified `gather` primitive (§3). The naming principle (§5 / rule A5) governs how Classes 1 and 6 are resolved.

| Class | What it is | Grounding example | Disposition |
|-------|-----------|-------------------|-------------|
| **1 — name mismatch** | A generic technique input id ≠ the contextual caller variable name. | `validate-build::analyze-failure` declares `check_id` / `diagnostics`; the validate loop passes `failed_check_id` / `failed_check_diagnostics`. | Align the **CALLER's** state variable to the technique's generic name, OR an explicit remap in `technique_args` (`{ check_id: failed_check_id }`). **Never rename the technique to the caller's name** — see §5 / A5. |
| **2 — call-site value, never bindable** | An argument that is a supplied literal value, not any state variable. | `run-suite(scope: '--workspace')` for the workspace pass vs `test(scope: '-p {current_task.crate}')` for the per-crate pass — `scope` is a call-site value, never a bag var. | Always **explicit in `technique_args`** as a literal. (There is no bag variable to bind by name; the value is intrinsic to the call-site.) |
| **3 — computed / templated arg over a composite field** | An argument built by projecting a sub-field of a composite bag variable and string-building. | `scope: '-p {current_task.crate}'` — projects `current_task.crate` and interpolates into a flag string. | Explicit **templated value** in `technique_args` — `{var}` templates, including dotted projection (`{current_task.crate}`), resolved by the `variable-binding` protocol (§1.1). (The OPTIONAL `technique_args` object/array value-type widening — Appendix A — is the only part deferred; a string template covers this case today.) |
| **4 — undeclared signature** | The operation reads `{name}`s in its protocol but declares no (or incomplete) `## Inputs`, so there is nothing to bind against. | `run-suite` uses `{scope}` / `{features}` but declares no own `## Inputs` (inherits from the group root); `analyze-failure` reads `{target_path}` but omits it from its signature. | **One-time signature backfill** (Work item B, §B.3) — additive `inputs[]` declarations + `default`s so the contract is complete. Additive, so no removal-approval gate, but it must precede the bindings that depend on it. |
| **5 — per-iteration accumulation** | An operation invoked in a `forEach` loop emits a scalar PER iteration; the activity must accumulate these into a plural collection, not overwrite. | [`08-implement.toon:39-43`] runs `implement-task` `forEach` over `plan.tasks`, emitting `task_implementation` per task; the activity preserves `completed_tasks` / `commits` (plurals, lines 189/191). | The **unified `gather` primitive (§3, Addition 1)** in sequential mode: each iteration's scalar appends to an activity-level ordered collection under the iteration key — never clobbers. This is the `concurrency = 1` case of the same gather that parallel fan-out uses. |
| **6 — envelope vs decomposed activity IO** | The technique emits ONE composite envelope output; the activity preserves several decomposed scalar vars that re-express fields of it (and the envelope itself isn't a declared var). | `run-suite` emits one `validation_results` envelope; `10-validate.toon` preserves `test_results` / `build_status` / `validation_passed` (lines 105-107), and `validation_results` is not itself a declared state var. | **Align the activity to the technique's canonical envelope:** read `validation_results.test_status` (etc.) by dotted path, **declare `validation_results` as a state var**, and **DROP** the redundant renamed scalars (`test_results` / `build_status`). This is a de-overfit toward the canonical shape (§5 / A5) — and a content change within `work-package` (variable declarations realigned). |

**Feasibility conclusion (state explicitly).** **Implicit bind-by-name covers the steady-state majority.** Names are already largely canonical, and op-to-op chaining within an activity works by name today (e.g. `analyze-failure` emits `fix_strategy`, `apply-fix` consumes `fix_strategy` — a clean same-name hand-off, no `technique_args` needed). The model then explicitly OWNS the residual difficulty through three bounded mechanisms, each mapped to specific classes:
- the **`technique_args` escape-hatch** — Classes 1 (remap), 2 (literal), 3 (templated/projected value);
- the **one-time signature backfill** — Class 4 (declare the contract);
- the **unified `gather` primitive** (§3) — Classes 5 (sequential per-iteration accumulation) and 6 (the envelope is the canonical collected/aggregate shape; align to it).

So the binding model is empirically sufficient: a small, named, bounded toolkit handles every non-trivial case the real library exhibits, and the common case stays zero-data.

## 5. Generic-not-overfit naming principle (governance rule A5)

This is a NEW governance rule (**A5**) added to `workflows/workflow-design/workflow.toon` `rules[]` (the exact text is also reproduced in Work item C, §C). It refines R3 / the canonical-naming convention (D3) by stating WHICH side of a name mismatch moves.

> **A5 — generic-not-overfit (exact `rules[]` text):**
> *Technique input/output names, shapes, and structures are defined for the technique's INTRINSIC, GENERIC, REUSABLE semantics — never overfit to a specific caller's local variable name or a single usage instance. Resolve a step-vs-technique name mismatch by aligning the CALLER's state variable to the technique's canonical signature (or an explicit `technique_args` remap), NOT by bending the technique to the call-site. Signatures MAY be renamed/reshaped to integrate with the binding system, but only toward a better GENERIC form.*

**Worked illustration (grounded).**
- **Do NOT** rename `validate-build::analyze-failure`'s input `check_id` → `failed_check_id` to match the validate loop's local variable. `check_id` is the operation's intrinsic, reusable name; `failed_check_id` is overfit to one call-site (the fix-revalidate loop). Keep `check_id` generic; align the caller (rename the bag variable, or remap once via `technique_args: { check_id: failed_check_id }`). This is Class 1's disposition (§4).
- **Conversely**, `validation_results` IS the canonical envelope shape — generic and reusable (it is exactly what `cargo-operations::run-suite` intrinsically emits). So the alignment runs the OTHER way: **align the validate activity to it** — declare `validation_results`, read `validation_results.test_status` by path, and **drop** the overfit scalars `test_results` / `build_status`. This is Class 6's disposition (§4). The rule is symmetric: move whichever side is the overfit one; keep whichever side is the generic one.

**What A5 licenses (note this in Work item B / the signature-backfill pass).** Because the generic form is authoritative, A5 explicitly permits:
1. **Backfilling / realigning technique signatures toward generic canonical forms** — renaming or reshaping an input/output id where the change yields a better GENERIC contract (not to chase a single caller). This rides the same signature-backfill pass as Class 4 (§8.4 / §B.3).
2. **Renaming / declaring work-package STATE variables to match those canonical signatures** — a content change within `work-package` (e.g. declare `validation_results`; rename a bag var to a technique's canonical input id) that maximizes implicit (zero-`technique_args`) binding. Content-reducing parts (dropping `test_results` / `build_status`) sit behind the usual removal-approval gate.

A5 is the governance complement to the binding-difficulty taxonomy (§4): the taxonomy says *which* mismatches exist; A5 says *which direction* to resolve each one (toward the generic technique signature), so that implicit bind-by-name is maximized rather than eroded by per-caller overfitting.

## 6. Refined activity-technique model

The migration tightens what each technique slot means. This is the conceptual backbone for the governance rules (Work item C, §C) and for how the two canonical techniques attach.

| Slot | Holds | Rule |
|------|-------|------|
| **`techniques.primary`** | The activity's **DOMAIN capability** technique (e.g. `validate-build`, `analyze-implementation`). | One per activity. |
| **`techniques.supporting[]`** | Activity-wide **STRATEGY / capability** techniques: `variable-binding`, `scatter-gather`, and similar cross-cutting protocols. | RESERVED for strategy. Must **NOT** contain per-step operations. (This *refines* `supporting[]` — it is not eliminated.) |
| **`step.technique`** | The per-step **OPERATION** (`group::operation` or bare id). | One operation per step (D6). |

**Key correction vs the prior draft.** The earlier draft proposed **eliminating `supporting[]` entirely** ("activities declare `techniques.primary` only"). The settled model **keeps `supporting[]`** but **reserves it for strategy** — because that is exactly where the universal `variable-binding` and `scatter-gather` techniques attach so `get_activity` delivers them to the worker. Per-step OPERATIONS still move out of `supporting[]` down to `step.technique` (the prior draft's correct half); what stays in `supporting[]` is the strategic layer.

The activity-techniques schema already supports this with **no change**: `TechniquesReferenceSchema` declares `primary` (optional string) and `supporting` (optional string array) — both present today (`src/schema/activity.schema.ts` ~lines 9–10). The refinement is a *usage discipline* enforced by the governance rules and agent-side review, not a structural change.

---

## 7. Schema / server posture — NO mandatory change

This is the crux of the pivot. Walking the surfaces the prior draft wanted to change, and why each is now untouched:

| Surface | Prior-draft change | Settled posture |
|---------|-------------------|-----------------|
| `step.technique` | "Redefine; widen description; new grammar." | **Unchanged.** The field already holds `group::operation`; the loader already splits `::` (3 sites). The grammar is enforced *agent-side* via `variable-binding` (D4), not by schema. |
| `step.with` (new field) | Add to `activity.schema.json` + Zod `StepSchema`. | **Not introduced.** The deviation map is the EXISTING `step.technique_args`. |
| `step.produces` (new field) | Add output-remap field. | **Not introduced.** Output auto-bind is the `variable-binding` protocol over the existing `variables-changed` channel; rare renames ride `technique_args` or naming. |
| `step.note` (new field) | Add call-site caveat field. | **Not introduced as schema.** Call-site caveats go to a **disposition slot** governed by rule A1 (Work item C) — see §8. |
| Nine validator checks in `src/utils/validation.ts` + `scripts/validate-workflow-toon.ts` | Hard-enforce binding rules in code. | **Not required.** Validation is **mostly agent-side** (the `variable-binding` protocol + the advisory governance rules A1–A5). A handful of checks COULD be added later as non-blocking advisories (§7.1) but they gate nothing. |
| `getVariableValue` dotted-path read | (already works) | **Unchanged** — confirmed: it walks `path.split('.')` already (D2). |
| `technique_args` value types | Superseded by `step.with` (wider union). | **OPTIONAL, DEFERRED widening** (Appendix A) — string\|number\|boolean today covers virtually every case because templates are strings. |

**Net:** the whole effort stays inside `workflow-design`'s remit (authoring `meta` techniques + `workflows/work-package/**` edits + one additive `workflow-design` rules edit). It honours *"never modify schema"* by **not modifying schema**.

### 7.1 Optional, non-blocking validator advisories (NOT a prerequisite)

If — and only if — the team later wants structural backstops for the governance rules, these could be added as **advisory** (`_meta.validation`) checks. They gate nothing and are explicitly out of this migration's critical path:

- (advisory) `step.technique` resolves via the technique-loader (catches a dangling binding before a worker hits it).
- (advisory) `techniques.supporting[]` contains no entry that resolves to a `group::operation` *operation* (the A3 reservation — strategy only).
- (advisory) a step is either bound (`step.technique`) or action/control-only (the D8/A2 exemption).

These are noted for completeness as a possible future hardening; **Work item B does not depend on any of them.**

---

## 8. Residual gaps + disposition

### 8.1 Call-site behavioural/contract prose on a SHARED technique

**Problem (unchanged from prior analysis).** Some `step.description` prose is not an ordered procedure but a **call-site-specific behavioural caveat**: idempotency, environment ("monorepo root"), sequencing ("after the worktree exists"), applicability ("no-op for standalone"). When the bound operation is SHARED across many call-sites, this cannot fold into the shared technique without polluting it for other callers.

**Disposition — 3-way classification (settled):**

| Class | Test | Home |
|-------|------|------|
| **(i) Universally-true of the operation** | Holds for EVERY call-site. | Fold into the technique as a `## Rules` entry or a `> ` protocol note (part of the operation's contract). |
| **(ii) Pure gating** | "Only run when X" / "skip for standalone". | Encode as `step.when` — control flow, not prose. |
| **(iii) Genuinely call-site-specific & non-gating** | A fact/caveat true at THIS call-site only. | The **disposition slot** — per rule A1, a single non-procedural caveat (NOT an ordered procedure, NOT gating). |

**Settled home for class (iii): the disposition slot, governed by A1 — NOT a new schema field.** The prior draft proposed a new `step.note` field. Under the no-schema-change posture, class-(iii) caveats live in a disposition slot that rule A1 (Work item C) explicitly carves out from its prose prohibition: a **single declarative call-site caveat** is allowed, an ordered procedure is forbidden. The audit surfaces only a handful of class-(iii) cases; A1's text accommodates them without a structural field. (If the count and the desire for structure later justify a dedicated field, it is a clean additive follow-up — but it is NOT a prerequisite and NOT in scope here.)

### 8.2 Multi-operation steps (D6 split)

Steps that invoke two ops in one `description` (e.g. `12(loop):rerender-and-verify` → `update-pr::render` + `update-pr::verify-body`) violate one-operation-per-step. **Disposition:** Work item B splits each into N steps, one `step.technique` per step, preserving order. No schema affordance needed — splitting is a content edit.

### 8.3 Action-step exemption (D8)

The ~12 Class-D trivial steps that only `set`/`log`/gate are exempt (rule A2). **Disposition:** B leaves them as `actions[]`/`when` steps without a `step.technique`. Where D2 lets a glue step be deleted entirely (`evaluate-results`, whose only job is to flatten `validation_results.validation_passed` into `has_failures`), B DELETES it rather than exempting it.

### 8.4 Signature backfill

Because inputs/output are the binding contract (D1), every bound operation's signature MUST be complete. The audit found concrete gaps (e.g. `validate-build::analyze-failure` reads `{target_path}` but does not declare it; `cargo-operations::run-suite` reads `{scope}`/`{features}` inherited from the group root — an inheritance subtlety the contract model states explicitly). **Disposition:** a one-time **signature-backfill** pass in Work item B (§B.3) — additive declarations + `default`s, gated to land before the bindings that depend on them. Backfill is additive (not content-reducing), so it does not need the removal-approval gate, but it must precede the bindings.

---

## 9. Acceptance criteria for Work item A

- **A-AC1:** A canonical **`variable-binding`** technique exists at `workflows/meta/techniques/variable-binding.md` with the capability, inputs/output, the bind-by-name/deviation/output-by-path protocol (§2.3), and the contract/deviation/sanctioned-mutation rules (§2.4).
- **A-AC2:** A canonical **`gather`** (collection-building) technique exists at `workflows/meta/techniques/scatter-gather.md` with ONE gather contract (ordered array + optional key) and ONE delegated combine over TWO scatter modes — **sequential** (`forEach`-loop accumulation; `concurrency = 1`) and **parallel** (`harness-compat::spawn-concurrent` fan-out) — stating the convergence (sequential accumulation and parallel fan-out are the same primitive; §3.0), with the accumulate-never-overwrite and isolation-then-combine safety rules (§3.6).
- **A-AC3:** The refined activity-technique model (§6) is documented: `primary` = domain; `supporting[]` = strategy (incl. the two canonical techniques); `step.technique` = per-step operation.
- **A-AC4:** **No mandatory schema/server change** is required; the design is realized with existing fields (`step.technique`, `step.technique_args`) + the two `meta` techniques + the naming convention. The optional `technique_args` widening is documented as a DEFERRED appendix (Appendix A), not a prerequisite.
- **A-AC5:** The DRY follow-up (collapse the three per-workflow scatter/gather duplicates onto `scatter-gather`) is recorded as a non-blocking follow-up; the duplicate files are NOT edited in this migration.
- **A-AC6:** Dotted-path reads (`validation_results.validation_passed`) are confirmed to resolve in structured `condition`/`transition.condition` with NO evaluator change (grounded against existing `getVariableValue`).

---

## Appendix A — OPTIONAL, DEFERRED: widening `step.technique_args` value types

> **Status: optional appendix, NOT a prerequisite for Work item B.** Recorded for completeness; deferrable indefinitely.

`step.technique_args` is today `z.record(z.union([z.string(), z.number(), z.boolean()]))` (`src/schema/activity.schema.ts` ~line 49) — values are string | number | boolean. The `variable-binding` model's deviation forms (literal / rename / template) are **all expressible as strings** (a template is a string; a rename is a bare-identifier string; a scalar literal is a string/number/boolean). So virtually every real deviation already validates against the current type.

The ONLY case the current types cannot carry is a deviation whose **literal value is itself an object or array** (e.g. `technique_args: { config: { retries: 3, mode: 'fast' } }`). The audit surfaces no such case in the migration. IF one arises, the OPTIONAL change is:

- `src/schema/activity.schema.ts` — widen to `z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.unknown()), z.record(z.unknown())]))`.
- `schemas/activity.schema.json` — mirror: `additionalProperties.type: ["string","number","boolean","object","array"]`.

This is a **non-breaking widening** (strictly more values accepted) and could land independently at any time. Treat as a future convenience, **not a gate.** Until then, an object/array deviation is expressed by declaring it as the input's `default` in the technique (D7), or by passing a `{var}` template that references a bag variable holding the object.

---

## 10. Cross-links

- **Consumed by:** [`06-scope-and-structure.md`](./06-scope-and-structure.md) — Work item B (the migration that authors these two techniques first, then binds steps) and Work item C (governance rules A1–A5).
- **Grounded in:** [`03-requirements-specification.md`](./03-requirements-specification.md) (R1–R6), [`05-impact-analysis.md`](./05-impact-analysis.md) (audit inventory + 2026-06-10 direction note).
- **Live source grounding:** `step.technique`/`technique_args` and the `::` split (`src/loaders/technique-loader.ts`, `src/schema/activity.schema.ts`); `getVariableValue` dotted-path walk (`src/schema/condition.schema.ts`); `harness-compat::spawn-concurrent` (`workflows/meta/techniques/harness-compat/spawn-concurrent.md`); the scatter/gather duplicates (`cicd-pipeline-security-audit/techniques/{dispatch-scanners,merge-scan-findings}.md`, `substrate-node-security-audit/techniques/{dispatch-sub-agents,merge-findings}.md`, `work-package/techniques/validate-build/aggregate-results.md`).
