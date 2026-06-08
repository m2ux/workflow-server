# Requirements Refinement Activities

> Part of the [Requirements Refinement Workflow](../README.md)

The six sequential activities of the pipeline. The numeric prefix is the execution order and supplies
each activity's artifact prefix.

| # | Activity | Produces | Transitions to |
|---|----------|----------|----------------|
| 01 | [intake-sources](01-intake-sources.toon) | `intake.md` | analyze-source |
| 02 | [analyze-source](02-analyze-source.toon) | `requirements-analysis.md` | update-specification |
| 03 | [update-specification](03-update-specification.toon) | `working-spec-{n}.md` | validate-specification |
| 04 | [validate-specification](04-validate-specification.toon) | `validation-report-{n}.md` | finalize-specification · update-specification · report-failure |
| 05 | [finalize-specification](05-finalize-specification.toon) | `final-spec.md`, `change-summary.md` | — (complete) |
| 06 | [report-failure](06-report-failure.toon) | `failure-report.md` | — (complete) |

The correction loop is the conditional edge from `validate-specification` back to `update-specification`,
guarded by the correctable-issue flags and the `correction_iteration` counter.
