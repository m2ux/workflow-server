# Ponytail Techniques

> Part of the [Ponytail Lean-Coding Workflow](../README.md)

The technique library for the ponytail workflow. Each operation is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in the per-operation `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

---

## Base Contract and Standalone Techniques

[`TECHNIQUE.md`](TECHNIQUE.md) holds the inputs and rules every technique here inherits.

| Technique | Capability |
|-----------|------------|
| [`scope-intake`](scope-intake.md) | Capture the task and target and trace the real end-to-end flow before a rung is chosen |
| [`apply-ladder`](apply-ladder.md) | Climb to the minimal solution, mark every deliberate simplification, and leave one runnable check |
| [`review-over-engineering`](review-over-engineering.md) | Tag the change's over-engineering one line per finding and close with a net-lines scoreboard |
| [`audit-repo`](audit-repo.md) | Hunt repo-wide over-engineering biggest-cut-first and close with a net lines-and-deps scoreboard |
| [`harvest-debt`](harvest-debt.md) | Harvest every ponytail marker into a debt ledger and flag any marker missing an upgrade trigger |
| [`report-gain`](report-gain.md) | Fill the debt ledger's gain field with an honesty-bounded scoreboard |

---

## Reference Convention

Each technique is a standalone top-level file and is bound **bare** — `<op>` — wherever a step references one (for example `apply-ladder`). A bare reference resolves workflow-local to the matching `techniques/<op>.md`.

---

## Cross-Workflow Techniques

These techniques are inherited or bound from a shared namespace, not authored here:

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](/meta/techniques/variable-binding.md) | Declared once at the workflow level (`techniques.activity`) and inherited by every activity — binds each step's operation to the workflow-scoped variable bag |
| [`gitnexus::query`](/gitnexus/techniques/query.md) / [`::context`](/gitnexus/techniques/context.md) | Bound within `scope-intake` for concept-driven flow discovery and symbol-level caller/callee inspection when the codebase is indexed |
| [`verify-artifact-conforms`](/meta/techniques/verify-artifact-conforms.md) | Bound as a step of `harvest-debt-and-report` — measures each artifact the pass persisted against the creation guide the [resource catalog](../resources/README.md#planning-artifact-to-guide-map) maps its filename to |

For the full technique-to-activity picture with capability summaries, see the [workflow README](../README.md#techniques).
