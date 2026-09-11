---
metadata:
  version: 1.2.0
---

## Capability

Establish the starting context for a fresh initiative: the domain and stack it lands in, the concerns cutting across it, and the external constraints around it

## Outputs

### analysis_document

[Context analysis](../../resources/context-analysis-guide.md#5-document-findings) of the initiative's fresh-start context.

#### artifact

`02-CONTEXT-ANALYSIS.md`

#### audience

`human`

## Protocol

### 1. Establish Context

- Apply the [context analysis](../../resources/context-analysis-guide.md#analysis-steps) procedure
- Understand the domain, codebase, and technology stack
- Identify cross-cutting concerns: shared dependencies, common infrastructure, ordering constraints
- Ground the shared-dependency and common-infrastructure rows in the graph rather than in the packages' descriptions of themselves. Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[resolve-graph](../../../meta/techniques/gitnexus-operations/resolve-graph.md)(tree_path: the initiative's codebase) for the `{repo_name}` the reads below address, then [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md)(query: each package's concept as keywords, repo_name: `{repo_name}`) and read its `{query_report}` for the execution flows the package lands in — two packages whose reports name the same flow share infrastructure whether or not either says so
- Where a flow is common to two packages, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../../meta/techniques/gitnexus-operations/impact.md)(target: the shared symbol, direction: `upstream`, repo_name: `{repo_name}`) and read its `{impact_report}` as the ordering constraint between them — the package that changes the symbol precedes the package that reads it
  > - An empty `{repo_name}` means the initiative's codebase carries no index; the rows then come from reading and grep, and the analysis says so rather than recording an unmeasured negative
- Assess external context: related issues, documentation, deadlines

### 2. Document Analysis

- Write `{analysis_document}` to `{planning_folder_path}` using the [context analysis findings](../../resources/context-analysis-guide.md#5-document-findings) section
- Distil the documented findings into `{key_findings}` and the suggested approach into `{planning_recommendation}`
