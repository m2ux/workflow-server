---
name: jira-issue-creation
description: What Jira adds to issue creation — terminology mapping, issue types, field arrangement, native markup, and the priority and label vocabularies.
metadata:
  version: 3.0.0
  order: 4
  legacy_id: 4
---

# Jira Issue Creation Guide

What Jira adds to issue creation. The issue's content is the [Issue Template](issue-creation.md#issue-template), and the [Anti-Patterns](issue-creation.md#anti-patterns) and [Section Rules](issue-creation.md#section-rules) there govern it; this guide states the Jira terminology, the type selection, where the content sits in Jira's fields, and the vocabularies Jira asks for.

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

### Field Arrangement

The Description field carries the [Issue Template](issue-creation.md#issue-template) body, arranged for Jira's fields:

- A `## Summary` section opens the Description, holding the problem-focused title Jira's Summary field also carries.
- Problem Statement, Goal and Scope sit beneath a `## Description` heading, at `###` level.
- Acceptance Criteria is its own `##` section rather than a per-story block, because Jira tracks completion against the issue rather than against a story within it. The User Stories section then carries the story statements alone.
- Success Metrics, Constraints and References follow at `##` level, omitted when they do not apply.

### Jira Markdown Notes

Issue bodies are authored in markdown; the creating operation converts them. Native Jira syntax, where a body needs it:

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

The [shared anti-patterns](issue-creation.md#anti-patterns) apply to the body. One is Jira's own:

- **Wrong issue type** — user-facing value is a Story and technical work is a Task, per [Issue Types](#issue-types).
