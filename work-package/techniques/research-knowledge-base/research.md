---
metadata:
  version: 1.0.0
---

## Capability

Load research guidance, search the knowledge base, and perform web research to gather best practices, patterns, and resources relevant to the work package.

## Inputs

### requirements

Work package requirements that focus the research; read in the protocol to scope kb and web searches and to map findings back to specific needs.

### problem_statement

The work package problem statement; read alongside `{requirements}` to set the research focus.

## Outputs

### kb_findings

Best practices, patterns, concepts, and specific guidance discovered from the knowledge base (concept-rag activity index), each tied to the source it came from. Empty with a noted gap when the knowledge base has no relevant content.

### web_findings

Best practices, documentation, and resources gathered from web research, each carrying its source and publication date / freshness note for cross-referencing.

## Protocol

### 1. Load Resources

- Use attached [knowledge-base-research](../../resources/knowledge-base-research.md) and [web-research](../../resources/web-research.md) for guidance
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
