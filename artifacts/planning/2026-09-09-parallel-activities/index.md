# Parallel activities: index of planning and implementation artifacts

A graph destination can name several activities, or name one activity together with a collection to run it over. Each named branch runs in its own worker, and the run enters a single join activity once the last branch returns. These are the documents to build that from.

## Build from these

| Artifact | What it holds | Use it for |
|---|---|---|
| [The specification](README.md) | What a fan does, how it is structured, how it runs, what is enforced and where, and how it meets the session record, the guards, the dispatch model and the observability surfaces | The design itself. Every rule an implementation owes is named here, by identifier |
| [The delivery plan](delivery-plan.md) | Seven stages, each with its files, its guard obligations and its acceptance criteria; the stale-restatement sweep; and the migration surface | Sequencing the work, and knowing when a stage is finished |
| [The smoke-test plan](../2026-09-09-fan-smoke-test/README.md) | The corpus workflow with its graph verbatim, every illegal form assigned to a named test file, guard legality per guard, sequencing, the known holes and thirteen decisions of which eight are settled | Proving the implementation. Read the open decisions in its section 9 before starting stage 4 |
| [What the fan makes obsolete](../2026-09-09-fan-supersession/README.md) | Four clusters of construct the fan supersedes, each removal sequenced against the seven stages, plus what merely narrows and what looks superseded and is not | Knowing what comes out, and when. **Read its opening section before stage 5** — it names two things the design should not ship, one of which invalidates a claim the specification makes |

## Measurements the work rests on

Read from the code rather than from the design, so each holds until the code moves.

| Artifact | What it establishes | Use it for |
|---|---|---|
| [Permutation matrix](../2026-09-09-fan-smoke-test/ground-truth/permutation-matrix.md) | Every legal form of the destination, every refusal the design defines, and where each one can be provoked — a legal workflow, a malformed fixture, a bad tool call, a seeded bag, or a guard run | The coverage surface. Any claim that the feature is tested is measured against this |
| [Guard obligations](../2026-09-09-fan-smoke-test/ground-truth/guard-obligations.md) | Every guard a new workflow answers to, what each demands, whether it can be exempted and how, the coverage walk's cost, and the cross-branch CI mechanics | Knowing which guards need changing rather than merely leaving green |
| [Test harness](../2026-09-09-fan-smoke-test/ground-truth/test-harness.md) | What the walker drives, how a refusal and a load failure are each asserted, whether the variable bag can be seeded, and whether concurrent workers can be simulated | Writing the tests, and knowing which properties the harness cannot reach |
| [Corpus conventions](../2026-09-09-fan-smoke-test/ground-truth/corpus-conventions.md) | The floor for a legal, guard-passing, walkable workflow — the minimum a workflow, an activity and a step can be | Authoring the corpus workflow the smoke test needs |

## Before deleting anything

A removal is only safe if its blast radius is right. In each of these, every candidate was re-derived from the repository by an agent instructed to refute it, and the references were measured rather than inferred — so a surviving verdict carries a radius you can act on, and a withdrawn one is recorded rather than dropped.

| Surface | What it settles |
|---|---|
| [Server code](../2026-09-09-fan-supersession/verification/server-code.md) | Which of the session record's position readers die with the scalar cursor, which validators now duplicate a refusal, and which helpers the fan's own derivations replace |
| [The corpus vocabulary](../2026-09-09-fan-supersession/verification/corpus-vocabulary.md) | What becomes of the scatter-gather primitive, the operation that selects a dispatch mode, and the borrowable pattern activities — including which bindings the staged plan can migrate and which it cannot |
| [Rules and canon](../2026-09-09-fan-supersession/verification/canon-rules.md) | Which rules the fan subsumes, which will contradict it once it lands, and which canon rows route an author to a construct that is going away |
| [Documentation](../2026-09-09-fan-supersession/verification/docs-and-site.md) | Every doc and generated page whose claims the fan falsifies, each one a stale statement that reads as current fact |
| [The design itself](../2026-09-09-fan-supersession/verification/design-itself.md) | Where the specification adds a second path, a fallback or a prohibition that removing something would obviate. These are edits to the design, not to the code |

## When a decision is questioned

Consult these when an implementation is tempted to do something differently; they are the only home for the alternatives each decision rejected, and they are long.

| Artifact | Covers |
|---|---|
| [List-fan design record](../2026-09-08-parallel-activities-in-the-graph/design-record.md) | The destination form, the derived join, the frontier, the branch key, and the container's shape |
| [Instance-fan design record](../2026-09-08-parallel-activities-in-the-graph/instance-fan-design-record.md) | Running one activity over a collection, the per-instance parameter, instance identity, and the mixed form |

## Not listed

Three sessions in this window investigated the neighbouring grains and the demand for them, and none of their conclusions bears on building this: work units inside a single activity, whole workflows dispatched as children, and an inventory of where the corpus runs things one at a time. Several documents in the sessions above are superseded by the ones listed here — the first designs of the list fan and the instance fan, whose material is in the specification now; the smoke test's own draft and critiques, resolved in its plan; and the supersession sweeps as they stood before refutation, which sit beside the verified outcomes under `sweeps/`. They remain on disk.
