# Ponytail Techniques

> Part of the [Ponytail Lean-Coding Workflow](../README.md)

The technique library for the ponytail workflow. Each operation is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in the per-operation `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

---

## The `ponytail-operations` Group

`ponytail-operations` is an operation-group: a `ponytail-operations/` directory holding a [`TECHNIQUE.md`](ponytail-operations/TECHNIQUE.md) base contract plus one `<op>.md` file per operation. The base contract owns the shared inputs (`task_description`, `target_path`, `lazy_intensity`, `pass_scope`) and the shared rules (`output-discipline`, `take-higher-rung`, `deletion-over-addition`); every operation inherits them.

| Operation | Capability | Artifact |
|-----------|------------|----------|
| [`scope-intake`](ponytail-operations/scope-intake.md) | Capture the task and target, fix intensity and scope, and trace the real end-to-end flow before a rung is chosen | `lean-brief.md` |
| [`apply-ladder`](ponytail-operations/apply-ladder.md) | Climb to the minimal solution, mark every deliberate simplification, and leave one runnable check | `lean-change.md` |
| [`review-over-engineering`](ponytail-operations/review-over-engineering.md) | Tag the change's over-engineering one line per finding and close with a net-lines scoreboard | `review-findings.md` |
| [`audit-repo`](ponytail-operations/audit-repo.md) | Hunt repo-wide over-engineering biggest-cut-first and close with a net lines-and-deps scoreboard | `audit-findings.md` |
| [`harvest-debt`](ponytail-operations/harvest-debt.md) | Harvest every ponytail marker into a debt ledger and flag any marker missing an upgrade trigger | `debt-ledger.md` |
| [`report-gain`](ponytail-operations/report-gain.md) | Append an honesty-bounded gain scoreboard to the foot of the debt ledger | *(appends to `debt-ledger.md`)* |

---

## Reference Convention

`ponytail-operations` is named for its capability, not for any single activity, so its operations are always written **qualified** — `ponytail-operations::<op>` — wherever a step binds one (for example `ponytail-operations::apply-ladder`). The activity-group shorthand (a bare op id) does not apply here, because no group is named after an activity.

---

## Cross-Workflow Techniques

These meta techniques are inherited or bound cross-workflow, not authored here:

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared once at the workflow level (`techniques.activity`) and inherited by every activity — binds each step's operation to the workflow-scoped variable bag |
| [`gitnexus-operations::query`](../../meta/techniques/gitnexus-operations/query.md) / [`::context`](../../meta/techniques/gitnexus-operations/context.md) | Bound within `scope-intake` for concept-driven flow discovery and symbol-level caller/callee inspection when the codebase is indexed |

For the full technique-to-activity picture with capability summaries, see the [workflow README](../README.md#techniques).
