# Requirements Refinement Techniques

> Part of the [Requirements Refinement Workflow](../README.md)

The procedures the activities apply. [`TECHNIQUE.md`](TECHNIQUE.md) is the workflow-root base contract:
it declares the inputs shared across techniques (`planning_folder_path`, `source_paths`,
`target_doc_path`, `correction_iteration`) and the specification-fidelity rules every
technique inherits.

| Technique | Capability |
|-----------|-----------|
| [intake-sources](intake-sources.md) | Capture the source paths, record whether every source is readable, classify each source's type, detect augment-vs-create, and record the intake |
| [analyze-source](analyze-source.md) | Parse the source documents against the current specification into a structured analysis report |
| [update-specification](update-specification.md) | Apply the analysis or correction findings to a complete updated specification |
| [validate-specification](validate-specification.md) | Validate the updated specification and categorize each issue |
| [finalize-specification](finalize-specification.md) | Assemble the final specification and change summary for promotion |
| [report-failure](report-failure.md) | Compile a failure report when refinement cannot complete automatically |

## Why the knowledge graph is absent

This library binds no [`gitnexus-operations`](../../meta/techniques/gitnexus-operations/TECHNIQUE.md) operation, and the group's own `subjects-the-index-holds` rule is the reason. Both of this workflow's subjects sit outside every index: `{source_paths}` names meeting transcripts and unstructured documents supplied for this run, and `{target_doc_path}` is a specification the run is in the middle of rewriting. Neither has been walked by an index, so an operation addressed at either reports on whatever tree the graph does hold.

The completeness question the workflow turns on — does every normative statement in every source reach a requirement in the specification — is a comparison of documents in hand, and stays a read of all of them.
