---
name: knowledge-base-research
description: Guidelines for researching the knowledge base during work package planning to discover relevant concepts, design patterns, and best practices.
metadata:
  version: 1.1.1
  order: 7
  legacy_id: 7
---


# Knowledge Base Research Guide

Before designing a solution, research the knowledge base to surface best practices, design patterns, architectural guidance, documentation conventions, and testing strategies — informed design reuses proven approaches instead of reinventing them. Research findings fill the artifact template below.

**Full research** when the work package involves architectural decisions, multiple possible implementation approaches, an unfamiliar or complex domain, or performance/reliability requirements. **Lightweight research** acceptable for simple well-understood changes, work following established patterns, or minor bug fixes with clear solutions.

## Planning Artifact

Store research findings in a discrete planning document:

**Template:**

```markdown
# Knowledge Base Research - [Work Package Name]

> [work package] · [date] · [Draft/Complete]

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|------------|-----------------|
| [activity used] | [technique followed] | [Brief findings] |

## Relevant Concepts Discovered

### [Concept 1]
**Source:** [Document name/path]  
**Relevance:** [How it applies to work package]  
**Key Insight:** [Main takeaway]

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| [Pattern name] | [Document] | [Application to work package] | HIGH/MEDIUM/LOW |

## Best Practices Found

### [Practice 1]
**Source:** [Document name/path]  
**Description:** [What the practice recommends]  
**Application:** [How to apply in this work package]

## Risks and Anti-Patterns
[Omit this section if none found]

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| [Issue] | [Document] | [How to avoid] |

## Recommended Approach

Based on research findings:

1. **Primary Pattern:** [Pattern to follow]
   - Rationale: [Why this pattern fits]

2. **Key Practices to Apply:**
   - [Practice 1]

3. **Risks to Monitor:** [Omit if none]
   - [Risk 1] - [Mitigation]

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| [Document 1] | [Why relevant] | [Specific sections] |

**Status:** [Draft / Complete]
```

## Rules

- Each finding names its source and states how it applies to this work package (e.g. "API is 90% reads → write-behind cache with periodic flush"), not generic advice ("we should probably use caching").
- Quote the specific recommendation, not a paraphrase, when the wording carries the decision criteria.
- Record confidence (HIGH/MEDIUM/LOW) for each pattern recommendation.
