# Artifact audience and plain language — investigation record

This folder is the investigation-detail home for the artifact-audience epic: planning artifacts written for a person read as plain language with lean tables, and artifacts written for a follow-up agent are structured files, with every artifact declaring which reader it serves.

## Contents

| File | What it holds |
|---|---|
| [artifact-format-survey.md](./artifact-format-survey.md) | The full corpus survey: headline counts, per-technique coverage grades with file paths, the grade-C shortlist, the agent-consumed-artifact table, the three tiers of existing style guidance, enforcement coverage, and prior art |
| [audience-classification.md](./audience-classification.md) | The decision behind all 139 audience declarations: the rule they follow, the registers whose substance is agent state, and the artifacts read by both a person and a later step |

## Key numbers carried into the epic

- 118 technique files produce planning artifacts via 139 output declarations naming 104 distinct filenames, across 15 of the 16 workflows.
- About 52 of the 118 cite a resource template; about 50 prescribe shape only inline in protocol prose; 10–16 prescribe no structure at all. Sixteen artifact-producing technique files reference no resource whatsoever.
- The server-side audience attribute (human or agent, agent implying JSON on disk) is fully built — schema, loader, activity-contract carry-through, normative spec, and a repo guard — and zero of the 139 declarations use it, so the guard passes vacuously.
- The strongest plain-language writing spec in the corpus governs exactly one artifact (the work-package review summary). Hard line budgets exist in 20 resources across only 2 workflows. The artifact-conformance verification pass is bound in only 3 of 16 workflows.

## Relationship to prior work

Epic #224 solved this problem for one workflow (work-package): canonical fact homes, a finalize conformance gate, lean templates, and the server-side audience machinery (#227). Its final corpus item — converting agent-read registers to structured data using that machinery — was deferred pending #227 and never picked up. This epic finishes that deferred item and extends the whole approach corpus-wide: one shared writing register, declared audiences everywhere, structured files for agent readers, creation guides for the untemplated tail, and enforcement that reaches every workflow.
