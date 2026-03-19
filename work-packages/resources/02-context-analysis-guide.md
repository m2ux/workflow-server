---
id: context-analysis-guide
version: 1.0.0
---

# Context Analysis Guide

**Purpose:** How to assess context for a new multi-package initiative.

---

## When to Use

Use context analysis when the user indicates this is a **new initiative** — no existing planning documents or prior work on this set of packages.

## Analysis Steps

### 1. Understand the Domain

- Identify the codebase, repository, or system being modified
- Review existing architecture documentation if available
- Note technology stack, conventions, and constraints

### 2. Survey the Scope

- List all work packages the user has identified
- For each, capture a one-sentence description
- Identify any obvious groupings or themes

### 3. Identify Cross-Cutting Concerns

| Concern | Questions to Answer |
|---------|-------------------|
| **Shared dependencies** | Do packages depend on each other? |
| **Common infrastructure** | Do packages share code, APIs, or data? |
| **Ordering constraints** | Must some packages complete before others? |
| **Risk concentration** | Are multiple packages affected by the same risk? |
| **Skill requirements** | Do packages require different expertise? |

### 4. Assess External Context

- Check for related issues in GitHub/Jira
- Review any existing documentation or ADRs
- Note deadlines, milestones, or external dependencies

### 5. Document Findings

Create `02-CONTEXT-ANALYSIS.md` with:

```markdown
# Context Analysis

**Initiative:** {initiative_name}
**Analysis Date:** {YYYY-MM-DD}

## Domain Context

[System overview, technology stack, key constraints]

## Work Packages Identified

| # | Package | Description | Theme |
|---|---------|-------------|-------|
| 1 | [Name] | [One sentence] | [Grouping] |

## Cross-Cutting Concerns

### Shared Dependencies
[Dependencies between packages]

### Common Infrastructure
[Shared code, APIs, data stores]

### Ordering Constraints
[Packages that must precede others]

### Risk Factors
[Shared risks across packages]

## External Context

[Related issues, documentation, deadlines]

## Recommendation

[Suggested approach to planning and prioritization]
```
