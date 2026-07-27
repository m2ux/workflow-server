# Drafting Plan — Requirements-Refinement Canon Conformance

**Mode:** update · **Target:** `requirements-refinement` · Last file: `activities/README.md`

Drafted in the tier order set by the [scope manifest](06-scope-manifest.md#drafting-order). Every delta is framed against committed content; nothing is drafted from scratch.

| # | File | Delta |
|---|------|-------|
| 1 | `workflow.yaml` | Removes the `max_correction_iterations` declaration; version to 1.2.0. The remaining 13 variables and all `rules` stay |
| 2 | `activities/01-intake-and-analyze.yaml` | Two announcements and both gate messages become declarative statements linking `{intake_record_path}` / `{requirements_analysis_path}`; version to 1.1.0. Transition arm, both `revise` options, and both `setVariable` effects stay at baseline |
| 3 | `activities/03-update-specification.yaml` | Announcement states the pass and links `{working_specification_path}`; version to 1.3.0 |
| 4 | `activities/04-validate-specification.yaml` | Gains the announcement linking `{validation_report_path}`; version to 1.4.0. The `correction_iteration < 3` literal stays, now the cap's sole home |
| 5 | `activities/05-finalize-specification.yaml` | Announcement and gate message link both staged artifacts; version to 1.3.0. `accepted` keeps its effect; `revise` stays effect-less pending A-7 |
| 6 | `activities/06-report-failure.yaml` | Announcement and gate message become linked statements; version to 1.3.0. The single-option gate stays whole pending A-5 |
| 7 | `techniques/TECHNIQUE.md` | Drops the shared `max_correction_iterations` input and its default; version to 1.1.0. `correction_iteration` and its `0` default stay |
| 8 | `techniques/intake-sources.md` | Declares `intake_record_path`, captured in Protocol 6; version to 1.1.0. Container-declared inputs are not redeclared (F-2) |
| 9 | `techniques/analyze-source.md` | Declares `requirements_analysis_path`, captured in Protocol 5; version to 1.2.0 |
| 10 | `techniques/update-specification.md` | Declares `working_specification_path` and `correction_iteration`; Protocol 1 "Register Correction Pass" goes, phases renumber 1–4, phase 4 emits both values; gains `## Rules` with the pass-count invariant; version to 1.3.0 |
| 11 | `techniques/validate-specification.md` | Four verdict Output descriptions state meaning rather than the setting act; declares `validation_report_path`; version to 1.3.0. Protocol 5 stays (F-4) |
| 12 | `techniques/finalize-specification.md` | Protocol 3 "Present for Promotion" goes; declares `final_specification_path` and `change_summary_path`; version to 1.1.0. The `promotion-is-the-users-action` rule carries the invariant |
| 13 | `techniques/report-failure.md` | Protocol 4 "Present Failure Report" goes; the `of {max_correction_iterations}` phrase goes; declares `failure_report_path`; version to 1.1.0 |
| 14 | `techniques/README.md` | Inherited-input list drops the removed variable; the surrounding sentence and the technique table stay |
| 15 | `README.md` | Cap stated as its literal; artifact-location clause dropped; banner to v1.2.0. Flow diagram and Overview stay |
| 16 | `activities/README.md` | Produces column names artifacts by identifier, so no unprefixed literal filename contradicts the server-computed name the announcements now link |
