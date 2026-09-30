# Requirements Refinement Techniques

> Part of the [Requirements Refinement Workflow](../README.md)

The procedures the activities apply. [`TECHNIQUE.md`](TECHNIQUE.md) holds the inputs and rules every technique shares.

| Technique | Capability |
|-----------|-----------|
| [resolve-inputs](resolve-inputs.md) | Read which source documents and which target specification a run is for, from the request and any correction the user typed |
| [intake-sources](intake-sources.md) | Record whether every source document is readable and what type each one is |
| [store-sources](store-sources.md) | Hold each source document in the repository under its own file name |
| [redact-transcripts](redact-transcripts.md) | Redact the personal and off-topic conversation in each stored meeting transcript, keeping every heading |
| [record-intake](record-intake.md) | Settle the target specification — where it is, and whether it is augmented or created — and record the intake |
| [analyze-source](analyze-source.md) | Produce a structured analysis of the requirement changes the source documents imply, with a source-coverage matrix and the heading of each contributing passage |
| [update-specification](update-specification.md) | Apply the analysis, correction findings, or requested revisions to a complete updated specification |
| [validate-specification](validate-specification.md) | Validate the updated specification and categorize each issue |
| [finalize-specification](finalize-specification.md) | Assemble the final specification and change summary |
| [report-failure](report-failure.md) | Compile a failure report when refinement stops with unresolved issues |

Completeness is a comparison of the documents in hand: every normative statement in `{classified_sources}`
reaches a requirement in the specification at `{target_doc_path}`.
