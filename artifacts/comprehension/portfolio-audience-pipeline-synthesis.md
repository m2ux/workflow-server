# Portfolio Analysis — Cross-Lens Synthesis

> Target: technique-output-audience-pipeline.md · #224 · 2026-07-14 · Lenses: pedagogy, rejected-paths

## Convergent findings (both lenses)

| Finding | Pedagogy framing | Rejected-paths framing |
|---------|------------------|------------------------|
| **Projection is opaque — do not touch it** | The "six edits" mental model is wrong; verify-transparent is the skippable beat that saves effort | Editing `projectTechnique` to "handle audience" is a rejected path — it would be dead code |
| **Entry-level `audience`, not artifact-nested** | Audience is orthogonal to persistence — a prerequisite concept | Nested placement is the more-constrained, more-awkward path to reject |
| **Optional, backward-compatible** | The safe-addition lifecycle path is what a learner must trust | A required `audience` is a rejected path (breaks existing declarations) |

The strong convergence: **the real change is narrow (parse+schema coupled edit, one carry-through, docs+lint), not broad.** Both lenses independently reach this from opposite directions.

## Unique findings

**Pedagogy only:**
- The **hand-maintained `technique.schema.json`** is a silent prerequisite trap — `generate-schemas.ts` won't update it, and nothing in the code says so.
- The **double surfacing** of the artifacts contract (body block + `_meta.artifacts`) is an implicit coupling a single-site editor could miss.
- `audience` should carry a `.describe()` that states it IS authored, distinguishing it from the delivery-only `source`/`destination`/`provenance_note` trio.

**Rejected-paths only:**
- **AP-43/65** (synthesized artifacts contract) already forecloses a second authoring surface — a stabilizing constraint, not a fork.
- The **`parseEntrySubsections` single-`reserved`-parameter** fork: quick `if` hack vs. generalizing to a reserved set.
- The **lint host** fork: extend `check-binding-fidelity` (baseline-regen risk) vs. standalone `check-audience.ts` (concern isolation).

## Summary table

| # | Finding | Lens(es) | Type |
|---|---------|----------|------|
| 1 | Projection transparent — leave untouched | both | convergent |
| 2 | Entry-level placement over artifact-nested | both | convergent |
| 3 | Optional field, backward-compatible | both | convergent |
| 4 | Hand-maintained JSON pair is a silent trap | pedagogy | unique |
| 5 | Artifacts contract surfaces twice (body + _meta) | pedagogy | unique |
| 6 | `audience` is authored (unlike delivery-only trio) | pedagogy | unique |
| 7 | AP-43/65 forecloses a 2nd authoring surface | rejected-paths | unique |
| 8 | `parseEntrySubsections` reserved-key generalization fork | rejected-paths | unique |
| 9 | Lint-host fork (extend vs. standalone) | rejected-paths | unique |

The value of the pair: pedagogy caught the two *implicit-coupling traps* (JSON pair, double surfacing) that could cause an incomplete edit; rejected-paths caught the *design forks* (placement, reserved-set, lint host) that plan-prepare must consciously decide. Neither overlaps on those — exactly the non-redundant coverage portfolio analysis is for.
