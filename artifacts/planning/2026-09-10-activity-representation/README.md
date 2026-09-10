# Activity step grammar — decision record

> Planning · Created 2026-09-10 · **Status:** Proposed, not implemented.

## What this covers

The step grammar carries two fields that a reader of the file can already work out
from the step itself: the `kind` discriminator, and — for most technique steps — the
`id`. This record settles what to do about them, and why the alternatives considered
alongside were set aside.

A third item, the per-activity `version`, rides along because it is the same edit to
the same files.

The variables block is a larger prize and a separate decision — see
[03-variables-deferred.md](03-variables-deferred.md).

## Chosen design

**The step's own fields decide its kind.** A step carrying `technique` is a technique
step; `loopType`, a loop; `message`, `options` or `ref`, a checkpoint; anything else,
an action. The `kind` field is retired from the schema, so no step declares it.

**A technique step's id is derived unless the derivation collides.** `populateStepIds`
already derives the id from the last `::` segment of the technique reference and fails
the load on a duplicate within a scope, telling the author to name the colliding step.
That rule stands as the whole rule. An activity declares a step id only where the
derived name would collide, or where the derived name genuinely misnames the step.

**The activity file drops `version`.** The workflow file carries the version that a
consumer acts on.

### Why the id derivation does not work today

`injectResolvedStepIds` puts the derived id back into the YAML that `get_activity`
delivers, so a worker can name the step for `get_technique { step_id }` and for the
step manifest. It matches `^(\s*)- technique:` — a step whose *first* key is
`technique`. Because `kind` is required, it is always the first key, and the corpus has
672 steps written `- kind: technique` against **zero** written `- technique:`. The
injection never fires. Omitting an id today therefore produces a delivered activity
with no id line while the server resolves one internally, and the worker cannot name
the step. The function has no test coverage.

Retiring `kind` makes `- technique: group::op` the leading form, which is what the
injector already matches. The two changes are one change: the first is what makes the
second safe.

## Where a step id is used

The inventory that constrains any change to how ids are formed.

| Use | Site |
|---|---|
| Worker names a step to fetch its technique | `get_technique { step_id }` — `src/tools/resource-tools.ts:630,683` |
| Worker reports what it ran | `next_activity { completed_steps: [{step_id, output}] }` — `src/tools/workflow-tools.ts:72-74` |
| Worker emits a per-step begin-beat | `▶ step <step_id>` — `src/tools/workflow-tools.ts:1761` |
| Server names the steps it inlined | `bundled_steps` — `src/tools/workflow-tools.ts:1980` |
| Recovery text on a bad id | `Available steps: [...]` — `src/tools/resource-tools.ts:691` |
| **Checkpoint response replay key** | `"activityId-checkpointId"` — `src/schema/state.schema.ts:94` |
| **Delivery ledger rows** | `technique_fetched` / `technique_bundled` `data.stepId` — `src/schema/state.schema.ts:16,25` |
| **Step engagement events** | idempotent per `(activity, stepId, agentId)` — `src/utils/step-events.ts:5` |
| Manifest fidelity check | joins reported ids against those rows — `src/utils/validation.ts:199-235` |
| Provenance diagnostics | unresolved-input errors, producer chains — `src/utils/binding-provenance.ts:244,386` |

The bolded rows are persisted in sealed session state. The first three require the
model to reproduce the token exactly.

## Rejected alternatives

### Hash the step id from the step's remaining fields

A digest over the step's other fields would give uniqueness with no authoring at all.
Set aside on two independent grounds, both drawn from the inventory above.

*Stability.* Three of the recorded uses are durable keys in sealed session state. A
content hash changes whenever any hashed field changes, so correcting a typo in a
checkpoint message re-keys its saved responses and orphans them in every session
already holding one. The delivery ledger fails the same way and more quietly: an edit
to a `when` expression stops the ledger matching, and reference-mode delivery silently
re-sends content the agent already has. An identity used as a durable key must not be
content-addressed.

*Transcription.* The worker types the id back on `get_technique`, reports it in
`completed_steps`, and emits it as a begin-beat. A name like `severity-crosscheck` is
read off the YAML reliably; `a3f9c2e1` is the shape a model transcribes wrong. The
recovery message that lists available steps becomes unusable, and every provenance
diagnostic and guard finding that quotes a step id turns opaque — against the
plain-language mandate the repo holds its own output to.

The derivation already in `populateStepIds` gets the same uniqueness guarantee while
keeping the name legible and stable under content edits: it keys on the binding, not
the body, so it changes only when the step's technique changes.

### Let `::` imply the technique kind

The proposal was to read a value containing `::` as a technique reference and drop the
discriminator on that basis. The corpus rules it out: **260 of 642** technique steps —
40% — carry no `::` at all, because a bare operation reference is a legal and common
form (`verify-artifact-conforms`, `ingest`, `write-artifact`).

| Binding form | Qualified with `::` | Bare |
|---|---:|---:|
| String | 213 | 206 |
| Structured (`{ name, inputs }`) | 169 | 54 |

The discriminator was never the separator — it is the **field name**. `technique:`
present is what identifies the step, and that holds for all 642 regardless of how the
reference is spelled. The conclusion (retire `kind`) survives; the reasoning does not.

### Positional disambiguation for colliding ids

Suffixing a collision by its ordinal (`write-artifact`, `write-artifact@2`) would make
the id derivable for 100% of technique steps rather than 86%. Set aside: inserting a
further use of the same technique renumbers the ones after it, which moves a persisted
replay key for a step nobody edited. An explicit name on the 87 colliding steps costs
less and never moves.

## Scope

- **Schema** — `kind` retired from the four step objects; the discriminated union is
  replaced by shape-based resolution. `version` retired from the activity object.
- **Loader** — `populateStepIds` unchanged. `injectResolvedStepIds` gains the test it
  never had, and its match is verified against the post-migration corpus form.
- **Corpus** — a mechanical rewrite of 117 activity files: drop 966 `kind` lines, drop
  555 derivable `id` lines, keep the 87 that collide, drop 117 `version` lines.
- **Guards** — no new guard. The step-shape resolution is total, so a malformed step
  fails schema validation as it does today.

## Measured effect

| | Removed from each activity delivery | Removed from the corpus |
|---|---:|---:|
| `kind` lines | 19,428 B | 19,428 B |
| Derivable `id` lines | 0 — re-injected for the worker | 16,723 B |
| `version` lines | 1,777 B | 1,777 B |
| **Total** | **21,205 B (4.7%)** | **37,928 B (8.4%)** |

The id lines earn their removal on drift rather than tokens: 555 hand-maintained names
that can fall out of step with the bindings they shadow, against a derivation that
cannot.

## Detail

- [01-corpus-survey.md](01-corpus-survey.md) — the full measurement, method, and scripts.
- [03-variables-deferred.md](03-variables-deferred.md) — the variables block, deferred.
