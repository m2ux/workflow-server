# Re-audit surface — pre-existing findings fix round

- **Corpus tree:** `/home/mike1/projects/dev/workflow-server/.worktrees/workflow/requirements-refinement-hygiene` (branch `workflow/requirements-refinement-hygiene`, HEAD `34067ffc`)
- **Base ref:** `0193e9bb` (PR #998 head; this branch is stacked on it)
- **Scope:** the fix round's change surface only. Findings in files off this surface are out of scope.
- **Guards at HEAD:** 236 of 236 pass.
- **Fixes landed:** F6, A4, A5, A6, P9, A8, B9, B10, B11, B12 of [canon-audit.md](canon-audit.md) (A7 was fixed on #998).

## Touched (10), under `corpus/requirements-refinement/`

`activities/01-intake.yaml`, `workflow.yaml`, `techniques/{analyze-source,intake-sources,resolve-inputs,update-specification}.md`, `resources/{change-summary,failure-report,requirements-analysis-report,specification-protocol}.md`

## I/O contract changes

None declared: no Input or Output heading changed. `intake-sources` now reads its inherited `{classified_sources}` in Protocol (declared on `techniques/TECHNIQUE.md`; bound in activity 01's reads). `specification-protocol.md` gained `## Template`, and the section 2.4 lines moved from § Section Structure into it.

## Closure (3)

Referencers of the changed resource sections:
- `techniques/TECHNIQUE.md` — rule `specification-protocol-preserved` cites `#section-structure`.
- `resources/validation-rubric.md` — § Structure cites `#section-structure` ("each section the run adds holds what that structure gives it").
- `resources/README.md` — the planning-artifact guide map sends the specification files to `specification-protocol`.

## Consumers

None outside the workflow.
