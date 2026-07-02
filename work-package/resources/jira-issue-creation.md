---
name: jira-issue-creation
description: Reference material for creating Jira issues. Provides terminology, templates, and MCP tool reference.
metadata:
  version: 2.1.0
  order: 4
  legacy_id: 4
---

# Jira Issue Creation Guide

Reference material for Jira issue creation. Flow and checkpoints are defined in the [Issue Management Activity](../activities/01-issue-management.yaml). Issues define problems, not solutions: describe *what* needs to be solved and *why*, leaving *how* for subsequent design work.

## Jira vs GitHub Terminology

| Jira Term | GitHub Equivalent | Notes |
|-----------|-------------------|-------|
| Issue | Issue | Generic term |
| Story | Issue (feature) | User-facing capability |
| Bug | Issue (bug) | Defect report |
| Task | Issue (chore) | Technical work |
| Epic | Milestone or Project | Large feature grouping |
| Subtask | Checklist item | Breakdown of parent |
| Summary | Title | Short description |
| Description | Body | Detailed content |
| Components | Labels | Categorization |
| Labels | Labels | Tags |

## Issue Types

Selection order: defect in existing functionality → **Bug**; user-facing with clear user value → **Story**; technical work or internal improvement → **Task**; spans multiple deliverables → **Epic**; breakdown of a Story/Task → **Subtask**.

| Type | When to Use | Example |
|------|-------------|---------|
| **Epic** | Large feature spanning multiple stories/tasks | "User Authentication System" |
| **Story** | User-facing capability with clear value | "Users can reset their password" |
| **Task** | Technical work not directly user-facing | "Migrate database to new schema" |
| **Bug** | Defect in existing functionality | "Login fails with special characters" |
| **Subtask** | Breakdown of a Story or Task | "Implement email validation" |

## Issue Structure

### Summary (Title)

- 50-80 characters ideal
- Describe the problem or capability, not the solution ("Users cannot search by diagram content", not "Implement new visuals table with CLIP embeddings" or "Fix the search thing")
- Use active voice when possible

### Description Template

```markdown
# [Issue Title]

## Summary

[Concise problem-focused title for Jira]

## Description

### Problem Statement

[Describe the gap between current and desired state. Be specific about impact. Must be clear to a reader without context — no assumed knowledge of prior discussions or internal shorthand.]

**Current state:**
- [What happens now]
- [Observable problems or limitations]

**Desired state:**
- [What should happen instead]
- [Observable improvements]

### Goal

[One sentence capturing the core objective. Should not mention implementation.]

### Scope

**In Scope:**
- [Specific aspects this issue addresses]

**Out of Scope:**
- [Related but excluded aspects, and why]

## Acceptance Criteria

- [ ] [Observable, testable criterion 1]
- [ ] [Observable, testable criterion 2]

## User Stories

### US-1: [Story Title]
> As a [persona], I want [capability] so that [benefit].

## Success Metrics

[Omit this section if not measurable]

| Metric | Target |
|--------|--------|
| [Metric 1] | [Target value] |

## Constraints

[Omit this section if none: performance, compatibility, security requirements]

## References

[Omit this section if none: relevant external documentation, related issues or discussions]
```

### Jira Markdown Notes

The `createJiraIssue` MCP tool accepts markdown format and handles conversion. Native Jira syntax, if needed:

| Element | Jira Syntax | Standard Markdown |
|---------|-------------|-------------------|
| Heading 2 | `h2. Text` | `## Text` |
| Heading 3 | `h3. Text` | `### Text` |
| Bold | `*bold*` | `**bold**` |
| Italic | `_italic_` | `*italic*` |
| Bullet list | `* item` | `- item` |
| Numbered list | `# item` | `1. item` |
| Quote | `{quote}text{quote}` | `> text` |
| Code | `{code}text{code}` | `` `text` `` |
| Table | `||header||` / `|cell|` | `|header|` / `|cell|` |
| Link | `[text|url]` | `[text](url)` |

### Priority

| Priority | When to Use |
|----------|-------------|
| Highest | System down, data loss, security vulnerability |
| High | Major functionality broken, many users affected |
| Medium | Important but workaround exists |
| Low | Minor issue, few users affected |
| Lowest | Nice to have, cosmetic |

### Labels and Components

- **Components:** Architectural areas (e.g., "backend", "api", "search")
- **Labels:** Cross-cutting concerns (e.g., "performance", "security", "ux")

## Anti-Patterns

| Anti-Pattern | Description | Solution |
|--------------|-------------|----------|
| **Solution as Summary** | "Add caching layer" | Describe the problem: "Search response time exceeds 5 seconds" |
| **Vague Description** | "Fix the bug" | Include reproduction steps, expected vs actual |
| **Wrong Issue Type** | Using Task for user-facing work | Use Story for user value, Task for technical work |
| **Missing Acceptance Criteria** | No way to verify completion | Add observable, testable criteria |
| **Implementation Details** | "Modify SearchService.ts line 42" | Describe the problem, not the fix |
