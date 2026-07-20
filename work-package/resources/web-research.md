---
name: web-research
description: Web research findings template appended to the research document.
metadata:
  version: 1.2.1
  order: 8
  legacy_id: 8
---


# Web Research Guide

Format skeleton for web research findings.

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
