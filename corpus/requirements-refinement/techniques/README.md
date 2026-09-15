# Requirements Refinement Techniques

> Part of the [Requirements Refinement Workflow](../README.md)

The procedures the activities apply. [`TECHNIQUE.md`](TECHNIQUE.md) holds the shared inputs
(`planning_folder_path`, `source_paths`, `target_doc_path`, `correction_iteration`) and the
specification-fidelity rules.

| Technique | Capability |
|-----------|-----------|
| [intake-sources](intake-sources.md) | Capture the source paths, record whether every source is readable, classify each source's type, detect augment-vs-create, and record the intake |
| [analyze-source](analyze-source.md) | Parse the source documents against the current specification into a structured analysis report |
| [update-specification](update-specification.md) | Apply the analysis, correction findings, or requested revisions to a complete updated specification |
| [validate-specification](validate-specification.md) | Validate the updated specification and categorize each issue |
| [finalize-specification](finalize-specification.md) | Assemble the final specification and change summary for promotion |
| [report-failure](report-failure.md) | Compile a failure report when refinement cannot complete automatically |

Completeness is a comparison of the documents in hand: every normative statement in `{source_paths}`
reaches a requirement in the specification at `{target_doc_path}`.
