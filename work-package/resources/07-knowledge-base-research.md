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

Use concept-rag MCP tools to query the knowledge base, guided by the intent-based system.

### ⚠️ MANDATORY: Fetch Guidance Resource First

**At the start of any knowledge base research session, fetch the `concept-rag://guidance` resource before making tool calls.**

The guidance resource provides:
- **Intent matching** — Match your research goal to the appropriate intent
- **Skill selection** — Each intent maps to skills that define tool workflows
- **Efficient searching** — Aim for 4-6 tool calls maximum per research session
- **Proper answer synthesis** — How to combine results into coherent findings

> **Note:** Fetch the guidance resource once per research session. The guidance applies for the duration of the session.

**Communication rule:** Never narrate your search process to the user. Instead, synthesize answers directly and cite sources. The user wants findings, not a play-by-play of tool calls.

### Intent-Based Research

Match your research goal to an intent, then follow the skill workflow:

| Research Goal | Intent | Primary Skill |
|--------------|--------|---------------|
| Learn what the KB says about a topic | `understand-topic` | `deep-research` |
| Find design patterns for a problem | `identify-patterns` | `pattern-research` |
| Find best practices for a domain | `identify-best-practices` | `practice-research` |
| Track where a concept appears | `explore-concept` | `concept-exploration` |
| Understand a category's concepts | `explore-category` | `category-exploration` |

> **Reference:** See `concept-rag://intents` for the full intent index and `concept-rag://skills` for skill workflows.

---

## Research Strategy

### Step 0: Fetch Guidance (MANDATORY)

**Always start by fetching `concept-rag://guidance`** to receive the intent-based research system:

```
Resource: concept-rag://guidance
```

This returns the intent matching rules and skill workflows. Follow the guidance throughout your research session.

### Step 1: Match Intent

Identify which intent matches your research goal:

| If researching... | Use intent |
|-------------------|------------|
| Best practices for a domain | `identify-best-practices` |
| Design patterns for a problem | `identify-patterns` |
| General topic understanding | `understand-topic` |
| Where a concept is discussed | `explore-concept` |
| Concepts in a category | `explore-category` |

### Step 2: Follow Skill Workflow

Each intent maps to a skill with a defined tool workflow. The skill documentation shows:
- Which tools to use
- The order/iteration pattern
- What context to preserve between calls

**Example:** For `identify-patterns` → use `pattern-research` skill:
1. Find pattern concepts in the KB
2. Get authoritative sources
3. Extract pattern details (iterate as needed)

### Step 3: Identify Key Concepts

From results, note:
- Recurring terminology
- Referenced design patterns
- Mentioned best practices
- Cited sources or documents

### Step 4: Extract Specific Guidance

Use the skill's tools to find:
- Implementation recommendations
- Trade-off discussions
- Warning signs or anti-patterns
- Configuration guidelines

### Step 5: Map to Work Package

Connect findings to requirements:
- Which patterns apply directly?
- What modifications are needed?
- What risks do sources mention?
- What success metrics are suggested?

---

## Research Checklist

- [ ] `concept-rag://guidance` fetched at start of session (MANDATORY)
- [ ] Intent matched to research goal
- [ ] Skill workflow followed for selected intent
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

**Location:** `.engineering/artifacts/planning/YYYY-MM-DD-work-package-name/02-kb-research.md`

**Template:**

```markdown
# Knowledge Base Research - [Work Package Name]

**Date:** [Date]
**Work Package:** [Name]
**Status:** [Draft/Complete]

---

## Research Approach

| Intent | Skill Used | Results Summary |
|--------|------------|-----------------|
| [intent used] | [skill followed] | [Brief findings] |

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

**Status:** Ready for design phase
```

---

## Checkpoint Template

After completing research, present findings to the user for confirmation:

```markdown
# 🛑 Checkpoint: [Checkpoint Name]

## Summary

[Brief summary of what was completed and key findings/outcomes]

---

## Key Points

### Completed
- [What was accomplished]
- [Key deliverables produced]

### Findings
- [Key finding 1]
- [Key finding 2]

### Decisions Made
- [Decision 1] - [Rationale]
- [Decision 2] - [Rationale]

---

## Status

[Current status and any blockers or concerns]

---

## Next Steps

[What happens next if confirmed]

---

**Confirmation Required:**

1. **Confirmed** - Proceed to next phase
2. **Need clarification** - Discuss further before proceeding
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
**Source:** System Design Patterns, Chapter 7
**Relevance:** Work package requires improving API response times
**Key Insight:** "Write-through caching provides consistency at the cost of 
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

## Integration with Workflow

This guide supports knowledge base research:

1. **After requirements confirmed** → Begin KB research
2. **Complete research** → Store in `02-kb-research.md`
3. **Present checkpoint** → Get user confirmation
4. **Proceed to analysis** → Use findings to inform implementation analysis

---

## Related Guides

- [Work Package Implementation Workflow](../work-package.md)
- [Implementation Analysis Guide](06-implementation-analysis.md)
- [Architecture Review Guide](14-architecture-review.md)
