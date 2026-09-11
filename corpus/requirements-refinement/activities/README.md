# Requirements Refinement Activities

> Part of the [Requirements Refinement Workflow](../README.md)

The sequential activities of the pipeline. The numeric prefix is the execution order and supplies
each activity's artifact prefix.

| # | Activity | Role |
|---|----------|------|
| 01 | [intake-and-analyze](01-intake-and-analyze.yaml) | Establish classified, readable sources and a user-confirmed analysis of the changes they imply |
| 03 | [update-specification](03-update-specification.yaml) | Apply the analysis, or a pass's findings, to a working specification |
| 04 | [validate-specification](04-validate-specification.yaml) | Judge conformance and source coverage, and categorize what remains |
| 05 | [finalize-specification](05-finalize-specification.yaml) | Stage the accepted result for a human to promote |
| 06 | [report-failure](06-report-failure.yaml) | Account for what blocked refinement and what it needs by hand |

The pipeline carries a bounded correction loop: a specification that does not pass validation returns
for another revision until it converges or the bound is reached. Each activity declares its own
outcomes, and the workflow graph binds where each one leads.
