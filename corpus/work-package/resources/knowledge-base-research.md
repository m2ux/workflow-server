---
name: knowledge-base-research
description: Research findings template and citation rules — knowledge-base and web findings in one list, each linked to its source.
metadata:
  version: 2.0.0
  order: 7
  legacy_id: 7
---


# Knowledge Base Research Guide

Before designing a solution, research the knowledge base and the web to surface best practices, design patterns, architectural guidance, documentation conventions, and testing strategies — informed design reuses proven approaches instead of reinventing them. Research findings fill the artifact template below.

**Full research** when the work package involves architectural decisions, multiple possible implementation approaches, an unfamiliar or complex domain, or performance/reliability requirements. **Lightweight research** acceptable for simple well-understood changes, work following established patterns, or minor bug fixes with clear solutions.

## Planning Artifact

**Template:**

```markdown
# Research — [Work Package Name]

> [work package] · [date] · [Draft/Complete]

## Recommended Approach

[Two to four sentences: the pattern to follow, why it fits this work package, and the practices it brings with it.]

## Findings

- **[What the source recommends, in a phrase]** — [how it applies to this work package, with the source linked in the sentence]. Confidence: HIGH/MEDIUM/LOW.

## Risks

[Omit this section if none found]

- **[Risk or anti-pattern]** — [how the approach avoids it, with the source linked in the sentence].

## Compatibility

[Omit this section if no dependency version constrains the approach]

| Dependency | Version | Constraint |
|------------|---------|------------|
| [library] | [version] | [what the version rules in or out] |
```

## Rules

- **A finding links its source in its own sentence**, per [Links](/meta/resources/writing-register.md#links), and states how it applies to this work package ("API is 90% reads → write-behind cache with periodic flush"), not generic advice ("we should probably use caching").
- **Knowledge-base and web findings share one list.** A web source that confirms a knowledge-base finding adds its link to that finding; one that contradicts or extends it says so on that finding.
- **Quote the specific recommendation**, not a paraphrase, when the wording carries the decision criteria.
- **Every finding carries a confidence** — HIGH, MEDIUM or LOW.
- **Line budget:** ~60 lines. A quoted passage longer than the finding it supports is over budget.
