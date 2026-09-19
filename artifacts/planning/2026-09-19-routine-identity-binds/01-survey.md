# Identity-map census

Corpus root: `.worktrees/workflows`. A pair is an identity map when the key equals the string value (`coverage_gaps: coverage_gaps`). Templates, literals, and renames are deviations and are out of this count.

## Routines (28 files)

Technique-step `inputs` / `outputs`:

- **109** identity maps
- **24** of 28 files carry at least one
- **38** steps are all-identity and collapse to the bare `technique: group::op` string
- **18** steps mix identity with a deviation (31 identity pairs still drop; the object stays for the remaining keys)

Nested-routine `outputs`: **5** further identity pairs (`repo_name: repo_name`, `index_stale: index_stale`). Same default; same elision.

GitNexus library (`corpus/support/gitnexus/routines/`, 21 files): **88** of the 109 technique identity maps, across **20** files; **35** fully collapsible steps.

### Technique identity maps by file

| File | Identity maps |
|------|---------------|
| meta/routines/activity-loop.yaml | 13 |
| support/gitnexus/routines/group-refresh.yaml | 12 |
| support/gitnexus/routines/change-risk-assessment.yaml | 9 |
| support/gitnexus/routines/guarded-rename.yaml | 9 |
| work-package/routines/challenge-concerns.yaml | 6 |
| support/gitnexus/routines/diff-coverage-map.yaml | 6 |
| support/gitnexus/routines/index-refresh.yaml | 6 |
| support/gitnexus/routines/package-diagram-source.yaml | 5 |
| support/gitnexus/routines/public-api-enum.yaml | 5 |
| support/gitnexus/routines/scope-discipline-check.yaml | 5 |
| support/gitnexus/routines/area-comprehension.yaml | 4 |
| support/gitnexus/routines/graph-for-tree.yaml | 4 |
| support/gitnexus/routines/group-concept-search.yaml | 4 |
| support/gitnexus/routines/orphan-scan.yaml | 4 |
| support/gitnexus/routines/restructure-surface.yaml | 3 |
| support/gitnexus/routines/api-change-gate.yaml | 2 |
| support/gitnexus/routines/api-surface-review.yaml | 2 |
| support/gitnexus/routines/doc-heading-lookup.yaml | 2 |
| support/gitnexus/routines/pre-edit-impact-gate.yaml | 2 |
| support/gitnexus/routines/symptom-trace.yaml | 2 |
| prism/routines/per-unit-pass.yaml | 1 |
| meta/routines/dispatch-round.yaml | 1 |
| support/gitnexus/routines/sequence-diagram-source.yaml | 1 |
| support/gitnexus/routines/tool-surface.yaml | 1 |

Four routine files carry none: `converge-assumptions`, `residual-assumption-interview`, `measured-pass`, `doc-reference-surface` (the last still has a nested-routine identity output).

## Activities (146 files)

Same schema, much less of the form:

- **20** identity maps across **12** files
- **4** steps collapse to the bare string
- **12** mixed steps (16 identity pairs still drop)

## What the schema already says

`TechniqueBindingSchema`: a step with no deviations uses the bare-string form. `inputs` carries only what differs from same-name binding or a declared default. `outputs` carries a remap only when the landing name differs from the output id.

No guard flags the identity form. `check-binding-fidelity` reads either spelling and treats them as equivalent.

## Not counted here

Routine `inputs` / `outputs` / `internals` signature lists — those name which bag slots enter, leave, or stay inside, and stay.

Technique `## Inputs` / `## Outputs` — those are the op contract Protocol `{id}` uses, and stay.

Cloned descriptions (`coverage_gaps` restated word-for-word on the routine and the technique). Routine schema requires a description, so that thinning is a later schema change.
