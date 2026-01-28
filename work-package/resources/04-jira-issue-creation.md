---
id: jira-issue-creation
version: 2.0.0
---

# Jira Issue Creation Guide

**Purpose:** Reference material for creating Jira issues. Provides terminology, templates, and MCP tool reference. Flow and checkpoints are defined in the activity.

---

## Overview

This guide provides reference material for Jira issue creation. For the creation flow, see the [Issue Management Activity](../activities/01-issue-management.toon).

> **Key Principle:** Issues define problems, not solutions. Describe *what* needs to be solved and *why*, leaving *how* for subsequent design work.

---

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

---

## Issue Types

### When to Use Each Type

| Type | When to Use | Example |
|------|-------------|---------|
| **Epic** | Large feature spanning multiple stories/tasks | "User Authentication System" |
| **Story** | User-facing capability with clear value | "Users can reset their password" |
| **Task** | Technical work not directly user-facing | "Migrate database to new schema" |
| **Bug** | Defect in existing functionality | "Login fails with special characters" |
| **Subtask** | Breakdown of a Story or Task | "Implement email validation" |

### Issue Type Selection Guide

```
Is it a defect in existing functionality?
    └─ Yes → Bug
    └─ No ↓

Is it user-facing with clear user value?
    └─ Yes → Story
    └─ No ↓

Is it technical work or internal improvement?
    └─ Yes → Task
    └─ No ↓

Does it span multiple deliverables?
    └─ Yes → Epic
```

---

## Issue Structure

### Summary (Title)

The summary is the issue title. Keep it concise and problem-focused.

**Good:**
- "Users cannot search by diagram content"
- "Login fails with special characters in password"
- "Add support for PDF document ingestion"

**Bad:**
- "Fix the search thing"
- "Implement new visuals table with CLIP embeddings"
- "Bug"

**Rules:**
- 50-80 characters ideal
- Describe the problem or capability, not the solution
- Use active voice when possible

### Description

The description uses Jira's markdown format (similar to standard markdown with some differences).

**Template:**

```markdown
# [Issue Title]

## Summary

[Concise problem-focused title for Jira]

## Description

### Problem Statement

[Describe the gap between current and desired state. Be specific about impact.]

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

---

## Acceptance Criteria

- [ ] [Observable, testable criterion 1]
- [ ] [Observable, testable criterion 2]
- [ ] [Observable, testable criterion 3]

---

## User Stories

### US-1: [Story Title]
> As a [persona], I want [capability] so that [benefit].

### US-2: [Story Title]
> As a [persona], I want [capability] so that [benefit].

---

## Success Metrics

| Metric | Target |
|--------|--------|
| [Metric 1] | [Target value] |
| [Metric 2] | [Target value] |

## Constraints

- Performance: [requirements]
- Compatibility: [requirements]
- Security: [requirements]

## References

- [Relevant external documentation]
- [Related issues or discussions]
```

### Jira Markdown Notes

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

> **Note:** The `createJiraIssue` MCP tool accepts markdown format and handles conversion.

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

---

## Anti-Patterns to Avoid

| Anti-Pattern | Description | Solution |
|--------------|-------------|----------|
| **Solution as Summary** | "Add caching layer" | Describe the problem: "Search response time exceeds 5 seconds" |
| **Vague Description** | "Fix the bug" | Include reproduction steps, expected vs actual |
| **Wrong Issue Type** | Using Task for user-facing work | Use Story for user value, Task for technical work |
| **Missing Acceptance Criteria** | No way to verify completion | Add observable, testable criteria |
| **Implementation Details** | "Modify SearchService.ts line 42" | Describe the problem, not the fix |

---

## Checklist

Before creating a Jira issue, verify:

- [ ] **Issue type** matches the nature of the work
- [ ] **Summary** describes problem, not solution (50-80 chars)
- [ ] **Description** follows appropriate template
- [ ] **Problem statement** is clear to someone without context
- [ ] **Scope** has explicit in/out boundaries
- [ ] **Acceptance criteria** are observable and testable
- [ ] **No implementation details** in the issue

---

## Related Guides

- [GitHub Issue Creation Guide](03-github-issue-creation.md) - For GitHub-hosted projects
- [Architecture Review Guide](14-architecture-review.md) - For documenting design decisions
- [PR Description Guide](11-pr-description.md) - For describing implementations
