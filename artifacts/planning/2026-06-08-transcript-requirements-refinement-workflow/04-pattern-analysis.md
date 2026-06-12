# 04 — Pattern Analysis

**Activity:** pattern-analysis · **Status:** ✅ Complete · decision: **adopt all** (with 2 confirmed divergences).

## Reference workflows
- **work-package** — primary structural analog: sequential orchestrator+worker pipeline, validation gating, bounded correction loop, planning-folder artifacts, conditional-transition loop-backs.
- **prism** — modular `techniques/`+`resources/`+per-folder `README.md` organization style.

## Adopted structural patterns
- File layout: `workflow.toon` + `activities/NN-<kebab>.toon` + `techniques/<id>.md` + root `techniques/TECHNIQUE.md` + `resources/<id>.md` + `README.md` at root and each subfolder.
- Activity filenames zero-padded ordinal = pipeline order (`01-intake-sources` … `06-report-failure`).
- Sequential `initialActivity` + ordered conditional `transitions`; loop-back via condition + counter.
- `artifactLocations.planning = {planning_folder_path}`; bare artifact names prefixed at write time; `{n}`-token versioned series for working-spec / validation-report.
- `exitActions.message` "README PROGRESS: update planning README" per activity.
- `context_to_preserve` enumerates key variables per activity.

## Adopted content patterns
- Workflow/activity `rules[]` = imperative string array; technique `## Rules` = named kebab-case positive assertions.
- Checkpoints `id/name/message/options[]` with `effect.setVariable` / `transitionTo`.
- Conditions `simple` + `and`/`or`; affirmative-predicate boolean variables.
- Technique markdown `Capability/Inputs/Protocol/Output/Rules`; shared inputs hoisted to root `TECHNIQUE.md` (AP-52).
- `executionModel` roles orchestrator + worker; behavioural constraints expressed in `rules`.
- Resources describe what they are; no caller back-coupling (AP-44).

## Confirmed divergences
1. **Transition-based correction loop** (validate→update with `correction_iteration` counter) instead of an in-activity `doWhile` loop — follows the confirmed separate update/validate activity split.
2. **No git/commit terminal** — `finalize-specification` stages artifacts in the planning folder for human promotion; the workflow performs no branch/commit/PR and does not edit the canonical doc in place.

`adopted_patterns` = all-with-two-divergences; `reference_workflows` = [work-package, prism].
