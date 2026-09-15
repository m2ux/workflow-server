# Requirements Refinement Activities

> Part of the [Requirements Refinement Workflow](../README.md)

The sequential activities of the pipeline.

| # | Activity | Role |
|---|----------|------|
| 01 | [intake-and-analyze](01-intake-and-analyze.yaml) | Establish classified, readable sources and a confirmed analysis of the changes they imply |
| 03 | [update-specification](03-update-specification.yaml) | Apply the analysis, a pass's findings, or requested revisions to a working specification |
| 04 | [validate-specification](04-validate-specification.yaml) | Judge conformance and source coverage, and categorize what remains |
| 05 | [finalize-specification](05-finalize-specification.yaml) | Stage the accepted result |
| 06 | [report-failure](06-report-failure.yaml) | Account for what blocked refinement and what it needs by hand |

Each activity declares its own outcomes, and the workflow graph binds where each one leads.
