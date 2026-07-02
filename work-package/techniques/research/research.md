---
metadata:
  version: 1.1.0
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

Best practices, patterns, concepts, and specific guidance discovered from the knowledge base (concept-rag index), each tied to the source it came from. Empty with a noted gap when the knowledge base has no relevant content.

### web_findings

Best practices, documentation, and resources gathered from web research, each carrying its source and publication date / freshness note for cross-referencing.

## Protocol

### 1. Load Resources

- Use attached [knowledge-base-research](../../resources/knowledge-base-research.md) for guidance; capture web findings so they can fill the [web research findings template](../../resources/web-research.md#planning-artifact)
- Review `{requirements}` and `{problem_statement}` for research focus

### 2. Search Knowledge Base

- Fetch `concept-rag://activities` resource to load its index
- Match research goal to an available entry from the index
- Follow the matched entry's technique workflow and tool sequence
- Identify key concepts, patterns, and specific guidance from results
- Map findings to work package requirements
- If the knowledge base has no relevant content, rely on web research and note the gap in findings

### 3. Perform Web Research

- Identify knowledge gaps from the knowledge base pass: questions internal documentation didn't answer, technologies needing current docs, areas where external validation adds value
- Use `WebSearch` to fill the gaps with current external information: official documentation for libraries/frameworks/APIs, community best practices, recent developments (new versions, deprecations, security advisories), and alternative approaches not covered internally — knowledge base research provides institutional knowledge; web research provides current industry context
- Search authoritative sources first: official documentation sites, established technical blogs, GitHub repositories/discussions, Stack Overflow accepted answers; include version numbers when relevant, add the current year for recent information, and use site-specific searches (e.g. `site:docs.rust-lang.org`)
- Validate each finding per [source-validation](#source-validation) before it enters `{web_findings}`
- Cross-reference `{web_findings}` with `{kb_findings}`: do external sources confirm internal patterns? Note contradictions for resolution, any additional context, and each source's publication date and freshness

## Rules

### research-depth

Full web research when using external libraries or frameworks, integrating third-party services, working with unfamiliar technology, or when knowledge base research didn't surface sufficient guidance. Lightweight research is acceptable when the technology is well-established and stable, knowledge base research was comprehensive, or the change is simple with a clear implementation path.

### source-validation

Validate every web finding on four axes: recency (current for the technology's pace of change — see [staleness-threshold](#staleness-threshold)), authority (reputable source?), relevance (applies to our context?), and consistency (aligns with other findings?).

### staleness-threshold

Prioritize recent sources; flag anything older than ~2 years as suspect for fast-moving technology.

### official-docs-per-dependency

Consult official documentation for every external dependency; community sources supplement it but never substitute (the group multiple-sources rule applies — a single source is insufficient).

### url-per-finding

Every finding carries a specific URL and states its application to this work package (e.g. "Server Components fetch data server-side → removes our client API routes"), not generic observations ("React is a popular framework").
