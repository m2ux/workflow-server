# Requirements Refinement Techniques

> Part of the [Requirements Refinement Workflow](../README.md)

The procedures the activities apply. [`TECHNIQUE.md`](TECHNIQUE.md) is the workflow-root base contract:
it declares the inputs shared across techniques (`planning_folder_path`, `source_path`,
`target_doc_path`, `correction_iteration`, `max_correction_iterations`) and the
specification-fidelity rules every technique inherits.

| Technique | Capability |
|-----------|-----------|
| [analyze-source](analyze-source.md) | Parse the source document against the current specification into a structured analysis report |
| [update-specification](update-specification.md) | Apply the analysis or correction findings to a complete updated specification |
| [validate-specification](validate-specification.md) | Validate the updated specification and categorize each issue |
| [finalize-specification](finalize-specification.md) | Assemble the final specification and change summary for promotion |
| [report-failure](report-failure.md) | Compile a failure report when refinement cannot complete automatically |
