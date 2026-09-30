# Re-audit surface — commit `9049523a` (PR #1003)

- **Corpus tree:** `/home/mike1/projects/dev/workflow-server/.worktrees/workflow/requirements-refinement-hygiene` (branch `workflow/requirements-refinement-hygiene`, HEAD `9049523a`)
- **Base ref:** `07a3daf0`
- **Scope:** this commit's change surface only. Findings in files off it are out of scope.
- **Guards at HEAD:** 236 of 236 pass. Engine suite: 2200 pass.
- **Fixes landed:** R-A2, R-A7, R-A8, R-A9 of [reaudit.md](reaudit.md).

## Touched (7), under `corpus/requirements-refinement/`

`activities/{01-intake,05-finalize-specification,06-report-failure}.yaml`, `techniques/{analyze-source,record-intake,report-failure,update-specification}.md`

## I/O contract changes

- `record-intake`: Output `spec_basename` removed; `intake_record` description no longer names it.
- `report-failure`: Input `spec_basename` removed; Protocol names the specification by `{target_doc_path}` (inherited from `techniques/TECHNIQUE.md`).
- Activity 01 no longer writes `spec_basename`; activities 05 and 06 no longer read it; the activity 05 checkpoint message drops `{spec_basename}`.

## Closure (4)

- `resources/intake-record.md` — Template heading `# Intake — {spec basename}`, filled by record-intake.
- `resources/failure-report.md` — Template heading `# Failure Report — {spec basename}`, filled by report-failure.
- `resources/requirements-analysis-report.md` — § Rules, now cited by analyze-source for identifier reuse and one reference per source.
- `resources/specification-protocol.md` — § Identifier Schemes and § Status Conventions, now cited by update-specification for new identifiers and status.

## Consumers

`grep -rn "spec_basename"` over the corpus, ledgers and walks: none remain.
