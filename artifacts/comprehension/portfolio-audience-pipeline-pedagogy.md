# Portfolio Analysis — Pedagogy Lens

> Target: technique-output-audience-pipeline.md · #224 · 2026-07-14

The pedagogy lens surfaces the concepts a reader must already hold to understand the pipeline, and where the design teaches (or hides) them.

## Prerequisite concepts (what you must know first)

1. **Structural direction, not spelling.** A symbol's direction (input vs output) comes from the *section it sits under* (`## Inputs` / `## Outputs`), never its name. `audience` is meaningful only because it lives on an *output* entry. A reader who assumes naming conventions carry direction will misplace the attribute.
2. **Reserved sub-sections vs components.** `#### artifact` and `#### default` are *reserved* (lifted to entry metadata); every other `####` is a *component*. The single function `parseEntrySubsections(body, reserved)` encodes this rule with one `reserved` parameter — understanding that parameter is the key to knowing how `audience` would be recognized.
3. **`.strict()` as a teaching device.** The technique schema rejecting unknown keys is what forces parser and schema to move together. A learner who does not internalize `.strict()` will expect a parser-only change to "just work" and be surprised by a silent `null` technique + logged warning.
4. **Projection is opaque.** Outputs are emitted as whole objects, so the learner must understand that *most* of the pipeline (compose, project, get_technique, get_activity bundle) needs no change — the mental model "six surfaces, six edits" is wrong; it is "two coupled edits (parse+schema), one carry-through edit (artifacts contract), plus docs+lint."

## Where the design teaches well

- **Delivery-only fields are self-documenting.** `source`, `destination`, `provenance_note` each carry a `.describe()` saying "populated by the server … never authored." A reader learns the authored/delivered boundary from the schema itself. `audience` should follow this idiom with a clear `.describe()` stating it IS authored (unlike the delivery-only trio).
- **The synthesized artifacts contract** teaches single-source-of-truth by construction: because it is derived, a learner sees there is exactly one authoring home for artifact identity.

## Where the design hides prerequisites

- **The hand-maintained JSON pair** is a silent trap: nothing in `technique.schema.ts` signals that `technique.schema.json` is NOT regenerated. A learner running `generate-schemas.ts` and expecting the JSON to update will be wrong. This prerequisite lives only in the comprehension corpus, not the code.
- **The double surfacing of the artifacts contract** (body block + `_meta`) is not obvious from either site alone; a learner editing only the body block would leave `_meta.artifacts` stale if the two ever diverged (they don't today because both read one value — but the coupling is implicit).

## Teaching-order recommendation for the implementer

Parse rule → `.strict()` coupling → schema field → (verify projection is transparent) → artifacts-contract carry-through → docs → lint. The middle "verify transparent" beat is the one most likely to be skipped and the one that most reduces effort.
