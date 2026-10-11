# Requirements Refinement Techniques

> Part of the [Requirements Refinement Workflow](../README.md)

The procedures the activities apply. [`TECHNIQUE.md`](TECHNIQUE.md) holds the shared inputs
(`planning_folder_path`, `source_paths`, `target_doc_path`, `correction_iteration`) and the
specification-fidelity rules.

| Technique | Capability |
|-----------|-----------|
| [intake-sources](intake-sources.md) | Record the source paths, whether every source is readable, each source's type, and whether the specification is being augmented or created |
| [analyze-source](analyze-source.md) | Produce a structured analysis of the requirement changes the source documents imply, with a source-coverage matrix and the heading of each contributing passage |
| [update-specification](update-specification.md) | Apply the analysis, correction findings, or requested revisions to a complete updated specification |
| [validate-specification](validate-specification.md) | Validate the updated specification and categorize each issue |
| [finalize-specification](finalize-specification.md) | Assemble the final specification and change summary |
| [report-failure](report-failure.md) | Compile a failure report when refinement stops with unresolved critical issues |

Completeness is a comparison of the documents in hand: every normative statement in `{source_paths}`
reaches a requirement in the specification at `{target_doc_path}`.
