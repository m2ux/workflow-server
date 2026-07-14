# Portfolio Analysis — Rejected-Paths Lens

> Target: technique-output-audience-pipeline.md · #224 · 2026-07-14

The rejected-paths lens surfaces the design alternatives the pipeline implicitly forecloses, and the ones this WP must consciously choose or reject.

## Alternatives the existing design already rejected (and why that matters for `audience`)

- **Activity-declared `artifacts[]` (rejected, AP-43/65).** The server synthesizes the artifacts contract from technique outputs instead. *Consequence for `audience`:* there is no second authoring surface to keep in sync — `audience` has exactly one home (the technique output). A path that tried to let an activity override an artifact's audience would fight this decision.
- **A frontmatter-carried attribute (rejected by the parser's shape).** `parseFrontmatter` reads only `metadata.version`; per-output metadata lives in `####` sub-sections. Putting `audience` in frontmatter would require widening the frontmatter reader AND would divorce the attribute from the output it describes. Rejected.
- **Full markdown library (rejected).** The loader is a hand-written section reader. Any `audience` parsing must extend the existing `splitSections`/`parseEntrySubsections` machinery, not introduce a parser dependency.

## Live design forks this WP must decide (each a rejected path for the other)

1. **Entry-level `audience` vs. artifact-nested `audience`.**
   - *Entry-level* (`OutputItemDefinition.audience`): audience is orthogonal to persistence; an agent-audience output need not carry a filename. Rejects the ability to type-enforce "agent ⇒ JSON file" (a lint must do it).
   - *Artifact-nested* (`OutputArtifact.audience`): ties audience to persisted files. Rejects audience for artifact-less outputs and overloads the `#### artifact` sub-section body (currently a bare filename). **Recommended rejection: nested placement** — it is the more constrained, more awkward path.

2. **Second reserved key vs. generalized reserved set in `parseEntrySubsections`.**
   - The function takes a single `reserved` string. Adding `audience` forces either a second parameter/call or generalizing to a set. Rejecting the quick "add an if for audience" hack in favor of generalizing (`reserved: string[]`) keeps the reserved-metadata concept coherent. Minor, but a fork.

3. **Extend `check-binding-fidelity` vs. new `check-audience.ts`.**
   - Extending reuses the existing per-op `OutputMeta` parsing but risks a `binding-fidelity-baseline.json` regen and mixing concerns.
   - A standalone guard matches the one-guard-per-concern pattern (13+ `check-*.ts`) and isolates any baseline. Neither is clearly wrong; the WP should pick and record the rejection.

## Path this WP must NOT take

- **Adopting `audience` across the corpus in this PR.** Explicitly rejected by the constraints (RC4 is downstream). This PR is the *enabler*; corpus adoption is a separate path. Threading a required (non-optional) `audience` would be the same mistake — it must be optional to preserve backward compatibility (the field-propagation lifecycle's "safe addition" path).
- **Touching projection code.** Because projection is opaque, editing `projectTechnique`/`projectTechniqueBody` to "handle audience" is a rejected path — it would be dead code. The transparency is the feature.
