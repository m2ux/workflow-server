---
name: web-research
description: Guidelines for conducting web research during work package planning to discover current information, documentation, and best practices from external sources.
metadata:
  version: 1.1.0
  order: 8
  legacy_id: 8
---


# Web Research Guide

After knowledge base research, use the WebSearch tool to supplement findings with current external information: official documentation for libraries/frameworks/APIs, community best practices, recent developments (new versions, deprecations, security advisories), and alternative approaches not covered internally. KB research provides institutional knowledge; web research provides current industry context.

**Full research** when using external libraries or frameworks, integrating third-party services, working with unfamiliar technology, or when KB research didn't surface sufficient guidance. **Lightweight research** acceptable when the technology is well-established and stable, KB research was comprehensive, or the change is simple with a clear implementation path.

## Research Protocol

1. **Identify knowledge gaps** from KB research: questions internal documentation didn't answer, technologies needing current docs, areas where external validation adds value.
2. **Search authoritative sources** — prioritize official documentation sites, established technical blogs, GitHub repositories/discussions, Stack Overflow accepted answers. Include version numbers when relevant; add the current year for recent information; use site-specific searches for authoritative sources (e.g. `site:docs.rust-lang.org`).
3. **Validate each finding** for recency (current? sources over ~2 years old are suspect for fast-moving tech), authority (reputable source?), relevance (applies to our context?), and consistency (aligns with other findings?).
4. **Cross-reference with KB research** — do external sources confirm internal patterns? Note contradictions for resolution and any additional context.
5. **Document findings** in the existing research document alongside KB findings, with source URLs.

## Planning Artifact

Append web research findings to the existing research document (kb-research.md):

**Template:**

```markdown
## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| [query 1] | [sources] | [summary] |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| [Official docs] | [URL] | [Insights] | HIGH/MEDIUM/LOW |

### Community Practices
[Omit this section if none]

| Practice | Source | Application |
|----------|--------|-------------|
| [Practice] | [URL] | [How it applies] |

### Version/Compatibility Notes
[Omit this section if none]

| Dependency | Current Version | Notes |
|------------|-----------------|-------|
| [Library] | [Version] | [Compatibility notes] |

### Alignment with KB Research

[Exception-only: if all KB findings were confirmed, state "All N KB findings confirmed by external sources." in one line; add rows only for contradicted or extended findings]

| KB Finding | Web Validation | Notes |
|------------|----------------|-------|
| [Pattern from KB] | Contradicted/Extended | [Details] |
```

## Rules

- Consult official documentation for every external dependency; a single source is insufficient.
- Every finding carries a specific URL and states its application to this work package (e.g. "Server Components fetch data server-side → removes our client API routes"), not generic observations ("React is a popular framework").
- Prioritize recent sources; flag anything older than ~2 years for fast-moving technology.
