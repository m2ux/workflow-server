# Canon audit surface — PR #998

- **Corpus tree:** `/home/mike1/projects/dev/workflow-server/.worktrees/workflow/requirements-refinement-conventions` (branch `workflow/requirements-refinement-conventions`, HEAD `6772e1ce`)
- **Base ref:** `4662d88d` (`origin/workflows`)
- **Canon homes:** `corpus/canon/resources/{anti-patterns,design-principles,convention-conformance,schema-construct-inventory}.md` on that tree; guard registry `guards/guards.ts` in `/home/mike1/projects/dev/workflow-server/.project/main/.worktrees/main-check` (main `a59870c7`)
- **Guards:** `check-all --corpus-only` at HEAD: 236 of 236 pass. The change is corpus-only, so the delta against base is none introduced.

## Surface files (28), all under `corpus/requirements-refinement/`

`README.md`, `workflow.yaml`,
`activities/{01-intake,02-analyze-sources,03-update-specification,04-validate-specification,05-finalize-specification,06-report-failure}.yaml`, `activities/README.md`,
`techniques/{TECHNIQUE,README,analyze-source,finalize-specification,intake-sources,record-intake,redact-transcripts,report-failure,resolve-inputs,store-sources,update-specification,validate-specification}.md`,
`resources/{README,change-summary,failure-report,intake-record,requirements-analysis-report,specification-protocol,transcript-redaction,validation-report,validation-rubric}.md`

## Touched (18)

README.md, workflow.yaml, activities/01-intake.yaml, activities/README.md, resources/README.md, resources/intake-record.md, resources/specification-protocol.md, resources/transcript-redaction.md (new), resources/validation-rubric.md, techniques/README.md, techniques/TECHNIQUE.md, techniques/finalize-specification.md, techniques/intake-sources.md, techniques/record-intake.md, techniques/redact-transcripts.md (new), techniques/resolve-inputs.md, techniques/store-sources.md (new), techniques/update-specification.md

## I/O contract changes

- `store-sources` (new): in `classified_sources`, `host_repo_path`, `meetings_dir` (default), `documents_dir` (default); out `classified_sources`.
- `redact-transcripts` (new): in `classified_sources`, `intake_correction` (optional), plus inherited `source_paths`; out `transcript_redactions`.
- `record-intake`: gains input `transcript_redactions`.
- `resolve-inputs`, `intake-sources`: `intake_correction` description widened (redactions).
- `01-intake.yaml`: writes gain `transcript_redactions`; `classified_sources` gains a second producer (store-sources).
- `TECHNIQUE.md`: gains rule `artifact-paths-relative` (merged into every leaf).

## Closure

Every referencer of a contract-changed file is in this workflow: `01-intake.yaml` (touched). `TECHNIQUE.md`'s new rule reaches every leaf technique, so all 12 technique files are on the change surface.

## Consumers

`grep -rn "requirements-refinement/" corpus/ --include=*.md --include=*.yaml` outside the workflow: none. `workflow-design/activities/03-requirements-refinement.yaml` is that workflow's own activity, not a reference into this one.

## Prior residual

No prior findings register for this workflow under `.engineering/artifacts/planning/`.
