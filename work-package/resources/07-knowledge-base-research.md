---
id: knowledge-base-research
version: 1.0.0
---

# Knowledge Base Research Guide

**Purpose:** Guidelines for researching the knowledge base during work package planning to discover relevant concepts, design patterns, and best practices.

---

## Overview

Before designing a solution, research the knowledge base using concept-rag MCP tools. This surfaces:
- **Best Practices** - Industry-standard approaches
- **Design Patterns** - Proven solutions applicable to the work package
- **Architectural Choices** - Guidance on system structure
- **Documentation Style** - Conventions for inline docs and ADRs
- **Testing Strategies** - Approaches to testing similar functionality

> **Key Insight:** Informed design decisions come from understanding what patterns and practices already exist in your knowledge base. Skip this step, and you risk reinventing the wheel or missing proven approaches.

---

## When to Apply This Guide

**Always research when:**
- Work package involves architectural decisions
- Multiple implementation approaches are possible
- Domain is unfamiliar or complex
- Performance or reliability requirements exist

**Lightweight research acceptable when:**
- Simple, well-understood change
- Following existing established patterns
- Minor bug fix with clear solution

---

## Research Approach

Use concept-rag MCP tools to query the knowledge base, following the Activity → Skill → Tool model.

---

## Research Checklist

- [ ] `concept-rag://activities` fetched at start of session (MANDATORY)
- [ ] Activity matched to research goal
- [ ] Skill workflow followed for selected activity
- [ ] Key concepts identified and noted
- [ ] Relevant documents discovered
- [ ] Specific guidance extracted from sources
- [ ] Findings mapped to work package requirements
- [ ] Applicable patterns identified
- [ ] Best practices documented
- [ ] Risks and anti-patterns noted
- [ ] Answers synthesized with citations (no search narration)

---

## Planning Artifact

Store research findings in a discrete planning document:


**Template:**

```markdown
# Knowledge Base Research - [Work Package Name]

**Date:** [Date]  
**Work Package:** [Name]  
**Status:** [Draft/Complete]

---

## Research Approach

| Activity | Skill Used | Results Summary |
|----------|------------|-----------------|
| [activity used] | [skill followed] | [Brief findings] |

---

## Relevant Concepts Discovered

### [Concept 1]
**Source:** [Document name/path]  
**Relevance:** [How it applies to work package]  
**Key Insight:** [Main takeaway]

### [Concept 2]
**Source:** [Document name/path]  
**Relevance:** [How it applies to work package]  
**Key Insight:** [Main takeaway]

---

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| [Pattern name] | [Document] | [Application to work package] | HIGH/MEDIUM/LOW |
| [Pattern name] | [Document] | [Application to work package] | HIGH/MEDIUM/LOW |

---

## Best Practices Found

### [Practice 1]
**Source:** [Document name/path]  
**Description:** [What the practice recommends]  
**Application:** [How to apply in this work package]

### [Practice 2]
**Source:** [Document name/path]  
**Description:** [What the practice recommends]  
**Application:** [How to apply in this work package]

---

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| [Issue] | [Document] | [How to avoid] |

---

## Recommended Approach

Based on research findings:

1. **Primary Pattern:** [Pattern to follow]
   - Rationale: [Why this pattern fits]

2. **Key Practices to Apply:**
   - [Practice 1]
   - [Practice 2]

3. **Risks to Monitor:**
   - [Risk 1] - [Mitigation]

---

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| [Document 1] | [Why relevant] | [Specific sections] |
| [Document 2] | [Why relevant] | [Specific sections] |

---

**Status:** Ready for plan-prepare activity
```

---

## Quality Indicators

### Good Research

- ✅ Multiple sources consulted
- ✅ Patterns validated across documents
- ✅ Direct quotes or specific references included
- ✅ Clear mapping to work package needs
- ✅ Risks and anti-patterns identified

### Insufficient Research

- ❌ Single source only
- ❌ Vague or generic findings
- ❌ No specific pattern recommendations
- ❌ Missing risk assessment
- ❌ No clear connection to requirements

---

## Examples

### Good Research Finding

```markdown
### Caching Strategy
- **Source:** System Design Patterns, Chapter 7
- **Relevance:** Work package requires improving API response times
- **Key Insight:** "Write-through caching provides consistency at the cost of 
write latency; write-behind improves write performance but risks data loss 
on failure. For read-heavy workloads with tolerance for eventual consistency, 
write-behind with periodic flush is recommended."

**Application:** Our API is 90% reads, 10% writes. Write-behind with 5-second 
flush interval balances performance and durability for our use case.
```

### Poor Research Finding

```markdown
### Caching
We should probably use caching to make things faster.
```

---

## Related Guides

- [Work Package Implementation Workflow](../work-package.md)
- [Implementation Analysis Guide](06-implementation-analysis.md)
- [Architecture Review Guide](15-architecture-review.md)
