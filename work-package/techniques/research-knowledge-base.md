---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Research knowledge base and external sources to discover best practices, patterns, and resources

## Protocol

### 1. Load Resources

- Use attached [knowledge-base-research](../resources/knowledge-base-research.md) and [web-research](../resources/web-research.md) for guidance
- Review `{requirements}` and `{problem_statement}` for research focus

### 2. Search Knowledge Base

- Fetch `concept-rag://activities` resource to load activity index
- Match research goal to an available activity from the index
- Follow the matched activity's technique workflow and tool sequence
- Identify key concepts, patterns, and specific guidance from results
- Map findings to work package requirements
- If the knowledge base has no relevant content, rely on web research and note the gap in findings

### 3. Perform Web Research

- Use `WebSearch` for current information and documentation
- Cross-reference multiple sources for robustness
- Note publication dates and source freshness
- Web results may be outdated; cross-reference multiple sources and note dates in the artifact

### 4. Synthesize Findings

- Connect kb and web findings to work package requirements
- Map applicable patterns to specific needs
- Document assumptions about pattern applicability

### 5. Create Research Artifact

- Create the `{research_document}` artifact in `{planning_folder_path}`
- Include kb_findings, web_findings, synthesis, applicable_patterns, risks

## Outputs

### research_document

Knowledge base and web research [synthesis](../resources/knowledge-base-research.md#planning-artifact) for the work package

#### artifact

`kb-research.md`

## Rules

### multiple-sources

Multiple sources should be consulted for robust findings

### validate-patterns

Patterns should be validated across documents

### no-narration

Never narrate the search process to the user. Synthesize answers directly and cite sources.
