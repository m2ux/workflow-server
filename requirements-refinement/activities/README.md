# Requirements Refinement Activities

> Part of the [Requirements Refinement Workflow](../README.md)

The five sequential activities of the pipeline. The numeric prefix is the execution order and supplies
each activity's artifact prefix.

| # | Activity | Produces | Transitions to |
|---|----------|----------|----------------|
| 01 | [intake-and-analyze](01-intake-and-analyze.toon) | `intake.md`, `requirements-analysis.md` | update-specification |
| 03 | [update-specification](03-update-specification.toon) | `working-spec-{n}.md` | validate-specification |
| 04 | [validate-specification](04-validate-specification.toon) | `validation-report-{n}.md` | finalize-specification · update-specification · report-failure |
| 05 | [finalize-specification](05-finalize-specification.toon) | `final-spec.md`, `change-summary.md` | — (complete) |
| 06 | [report-failure](06-report-failure.toon) | `failure-report.md` | — (complete) |

The conditional edge from `validate-specification` back to `update-specification` is the bounded correction
loop; see each activity's TOON for the routing conditions.
