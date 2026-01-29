---
id: web-research
version: 1.0.0
---

# Web Research Guide

**Purpose:** Guidelines for conducting web research during work package planning to discover current information, documentation, and best practices from external sources.

---

## Overview

After completing knowledge base research, conduct web research to supplement findings with:
- **Current Documentation** - Official docs for libraries, frameworks, APIs
- **Community Best Practices** - Blog posts, tutorials, Stack Overflow answers
- **Recent Developments** - New versions, deprecations, security advisories
- **Alternative Approaches** - Solutions not covered in the knowledge base

> **Key Insight:** Web research complements KB research by providing current, external perspectives. KB research provides institutional knowledge; web research provides broader industry context.

---

## When to Apply This Guide

**Always research when:**
- Using external libraries or frameworks
- Implementing integrations with third-party services
- Work package involves unfamiliar technology
- KB research didn't surface sufficient guidance

**Lightweight research acceptable when:**
- Technology is well-established and stable
- KB research provided comprehensive guidance
- Simple change with clear implementation path

---

## Research Approach

Use the WebSearch tool to query external sources, focusing on authoritative and recent content.

### Step 1: Identify Knowledge Gaps

From KB research findings, identify:
- Questions not answered by internal documentation
- Technologies or patterns needing current documentation
- Areas where external validation would be valuable

### Step 2: Search Authoritative Sources

Prioritize searches that target:
- Official documentation sites
- Established technical blogs
- GitHub repositories and discussions
- Stack Overflow accepted answers

**Search Tips:**
- Include version numbers when relevant
- Add current year for recent information
- Use site-specific searches for authoritative sources (e.g., "site:docs.rust-lang.org")

### Step 3: Validate Findings

For each finding, assess:
- **Recency** - Is the information current?
- **Authority** - Is the source reputable?
- **Relevance** - Does it apply to our context?
- **Consistency** - Does it align with other findings?

### Step 4: Cross-Reference with KB Research

Connect web findings to KB research:
- Do external sources confirm internal patterns?
- Are there contradictions to resolve?
- What additional context do external sources provide?

### Step 5: Document Findings

Record findings in the research document alongside KB research findings.

---

## Research Checklist

- [ ] Knowledge gaps identified from KB research
- [ ] Authoritative sources searched
- [ ] Official documentation consulted for external dependencies
- [ ] Findings validated for recency and relevance
- [ ] Cross-referenced with KB research findings
- [ ] Contradictions or gaps noted for resolution
- [ ] Findings documented with source URLs

---

## Planning Artifact

Add web research findings to the existing research document:

**Template (append to kb-research.md):**

```markdown
---

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| [query 1] | [sources] | [summary] |
| [query 2] | [sources] | [summary] |

---

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| [Official docs] | [URL] | [Insights] | HIGH/MEDIUM/LOW |
| [Blog/Tutorial] | [URL] | [Insights] | HIGH/MEDIUM/LOW |

---

### Community Practices

| Practice | Source | Application |
|----------|--------|-------------|
| [Practice] | [URL] | [How it applies] |

---

### Version/Compatibility Notes

| Dependency | Current Version | Notes |
|------------|-----------------|-------|
| [Library] | [Version] | [Compatibility notes] |

---

### Alignment with KB Research

| KB Finding | Web Validation | Notes |
|------------|----------------|-------|
| [Pattern from KB] | Confirmed/Contradicted/Extended | [Details] |

---
```

---

## Quality Indicators

### Good Web Research

- ✅ Official documentation consulted
- ✅ Multiple sources cross-referenced
- ✅ Recent sources prioritized
- ✅ Findings include specific URLs
- ✅ Clear connection to work package needs

### Insufficient Web Research

- ❌ Single source only
- ❌ Outdated information (> 2 years for fast-moving tech)
- ❌ No official documentation consulted
- ❌ Generic advice without specifics
- ❌ No URLs or citations

---

## Examples

### Good Web Research Finding

```markdown
### React Server Components Patterns
**Source:** React Official Docs (https://react.dev/reference/rsc/server-components)
**Relevance:** Work package involves migrating to App Router
**Key Insight:** "Server Components can directly access backend resources 
without exposing credentials to the client. Use 'use server' directive for 
server actions that mutate data."

**Application:** Our API routes can be simplified by using Server Components 
for data fetching, reducing client bundle size by ~40% based on similar 
migrations documented in the React blog.
```

### Poor Web Research Finding

```markdown
### React
Found some articles about React. It's a popular framework.
```

---

## Integration with Workflow

This guide supports the web research step of the research activity:

1. **After KB research** → Begin web research
2. **Search external sources** → Focus on gaps from KB research
3. **Document findings** → Append to research document
4. **Present checkpoint** → Get user confirmation
5. **Proceed to planning** → Use combined findings

---

## Related Guides

- [Knowledge Base Research Guide](07-knowledge-base-research.md)
- [Design Framework Guide](09-design-framework.md)
- [Implementation Analysis Guide](06-implementation-analysis.md)
