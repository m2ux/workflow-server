# Requirements Refinement Activities

> Part of the [Requirements Refinement Workflow](../README.md)

The sequential activities of the pipeline. The numeric prefix is the execution order and supplies
each activity's artifact prefix.

| # | Activity | Produces |
|---|----------|----------|
| 01 | [intake-and-analyze](01-intake-and-analyze.yaml) | intake record, requirements analysis |
| 03 | [update-specification](03-update-specification.yaml) | working specification, one per pass |
| 04 | [validate-specification](04-validate-specification.yaml) | validation report, one per pass |
| 05 | [finalize-specification](05-finalize-specification.yaml) | final specification, change summary |
| 06 | [report-failure](06-report-failure.yaml) | failure report |

The pipeline carries a bounded correction loop: a specification that does not pass validation returns
for another revision until it converges or the bound is reached. Each activity declares its own
outcomes, and the workflow graph binds where each one leads.
