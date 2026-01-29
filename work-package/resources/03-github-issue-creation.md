---
id: github-issue-creation
version: 2.0.0
---

# GitHub Issue Creation Guide

**Purpose:** Reference material for creating GitHub issues. Provides templates, anti-patterns, and guidelines. Flow and checkpoints are defined in the [Issue Management Activity](../activities/01-issue-management.toon).

---

## Overview

A well-written issue defines a problem clearly enough that multiple implementation approaches could be evaluated. Issues should focus on *what* needs to be solved and *why*, leaving *how* for subsequent design work.

> **Key Insight:** Issues that prescribe solutions prematurely constrain design options and may miss better alternatives. Define the problem well, and good solutions will follow.

### Issues Define Problems, Not Solutions

**Issues document requirements, not implementation.** An issue should describe the problem space—what's broken, missing, or suboptimal—without dictating the technical approach.

| Issue Should Include | Issue Should NOT Include |
|---------------------|-------------------------|
| Problem statement and impact | Technical approach or architecture |
| Current vs desired state | Schema changes or data structures |
| User stories and acceptance criteria | Code snippets or API designs |
| Success metrics | File paths or module names |
| Scope boundaries | Implementation timeline |

When the problem is well-defined:
- ✅ "Users cannot search for documents based on diagram content"
- ❌ "Add a `visuals` table with `image_path` and `description` columns"

The issue specifies *requirements*; design work determines *implementation*.

#### ⚠️ CRITICAL: Forbidden Content in Issues

**DO NOT include these sections or content types in issues:**

| ❌ Forbidden | Example | Where It Belongs |
|-------------|---------|------------------|
| "Solution" section | "Solution: Use gap detection algorithm" | Planning docs, ADRs |
| "Implementation Approach" | "Create filterByScoreGap() utility" | Planning docs, PRs |
| "Technical Approach" | "Modify scoring-strategies.ts" | Planning docs, PRs |
| Algorithms or patterns | "Use elbow method to find clusters" | ADRs, planning docs |
| File/code locations | "Update conceptual_catalog_search.ts:80" | PRs, commit messages |
| Schema or data structures | "Add `gap_threshold` column" | ADRs |

**Rationale:** Solutions in issues:
- Constrain design options before research is done
- Conflate problem definition with implementation
- Skip the planning activity where alternatives are evaluated
- May miss better approaches discovered during analysis

**Where solutions belong:**
- Planning artifacts (gitignored)
- ADRs for architectural decisions
- PR descriptions for implementation details

---

## When to Write an Issue

**Write an issue when:**
- A feature is missing or incomplete
- A bug affects user experience or system reliability
- Performance doesn't meet user expectations
- Technical debt impacts development velocity
- A user request reveals an unmet need

**Skip formal issues for:**
- Trivial fixes (typos, formatting)
- Internal refactoring with no user-visible impact
- Changes already covered by existing issues

---

## Issue Anti-Patterns to Avoid

| Anti-Pattern | Description | Symptoms | Solution |
|--------------|-------------|----------|----------|
| **Solution Masquerading as Problem** | Describing implementation rather than need | "Add X table" instead of "Users can't find X" | Reframe: What user need does this solve? |
| **Vague Problem Statement** | Problem unclear or too broad | "Improve search" with no specifics | Add concrete examples of current failures |
| **Missing Acceptance Criteria** | No way to know when it's done | Endless scope creep, "one more thing" | Define checkboxes that mark completion |
| **Kitchen Sink Scope** | Too many unrelated problems in one issue | Touches every part of the system | Split into focused, independent issues |
| **Assumed Context** | Reader must already know the problem | "Fix the thing we discussed" | Write as if reader has no prior context |

> **Key Insight:** If you can't explain the problem without mentioning a specific solution, you may not fully understand the problem yet.

---

## Issue Structure

### Required Sections

- **Problem Statement** - Gap between current and desired state
- **Goal** - One sentence core objective (no implementation)
- **Scope** - In scope and out of scope items
- **User Stories** - As a [persona], I want [capability] so that [benefit]

### Optional Sections

- **Success Metrics** - How will we measure improvement?
- **Context & Background** - Additional information
- **Constraints** - Non-functional requirements
- **References** - Links to related resources

**Template:**

```markdown
# [Issue Title]

## Problem Statement

[Describe the gap between current and desired state. Be specific about impact.]

**Current state:**
- [What happens now]
- [Observable problems or limitations]

**Desired state:**
- [What should happen instead]
- [Observable improvements]

## Goal

[One sentence capturing the core objective. Should not mention implementation.]

## Scope

### In Scope
- [Specific aspects this issue addresses]

### Out of Scope
- [Related but excluded aspects, and why]

## User Stories

### US-1: [Story Title]
> As a [persona], I want [capability] so that [benefit].

**Acceptance Criteria:**
- [ ] [Observable, testable criterion]
- [ ] [Another criterion]

### US-2: [Story Title]
> As a [persona], I want [capability] so that [benefit].

**Acceptance Criteria:**
- [ ] [Observable, testable criterion]
- [ ] [Another criterion]

---

## Success Metrics

[How will we measure improvement?]

| Metric | Target |
|--------|--------|
| [Metric 1] | [Target value] |
| [Metric 2] | [Target value] |

## Constraints

[Non-functional requirements that bound the solution space]
- Performance: [requirements]
- Compatibility: [requirements]
- Security: [requirements]

## References

[Links to related resources]
- [Relevant external documentation]
- [Related issues or discussions]
```

---

## Section Guidelines

### Problem Statement

The problem statement is the most critical section. It should pass the "5 Whys" test—dig deep enough that the root problem is clear.

**Good:**
```markdown
## Problem Statement

The system currently processes PDF and EPUB documents to extract text-based 
chunks and concepts. However, many technical documents contain valuable visual 
content (diagrams, flowcharts, charts) that conveys information not captured 
in text. This visual information is currently lost during ingestion.

**Current state:**
- Documents are chunked as text segments only
- Diagrams are either ignored or produce garbled OCR artifacts
- Search results cannot surface or leverage visual content
- Users cannot find documents based on diagram content

**Desired state:**
- Diagrams and visual content are detected and preserved during ingestion
- Visual content is searchable alongside text
- Search results can include relevant diagrams
- Visual information enriches concept discovery
```

**Bad:**
```markdown
## Problem Statement

We need to add diagram support using PyMuPDF and store images in a new 
visuals table.
```

The bad example describes a solution, not a problem. Ask: "What user problem does this solve?"

---

### Goal

The goal should be a single sentence that captures the essence of what success looks like—without prescribing how to achieve it.

**Good:**
```markdown
## Goal

Enable users to discover and leverage visual content (diagrams, charts, figures) 
alongside text when searching their document library.
```

**Bad:**
```markdown
## Goal

Add a visuals table with LLM-generated descriptions and CLIP embeddings.
```

**Tips:**
- Use verbs like "enable", "allow", "improve", "reduce"
- Focus on user capability or outcome
- Avoid technical terms unless describing constraints

---

### Scope

Clear scope boundaries prevent scope creep and enable focused implementation.

**Good:**
```markdown
## Scope

### In Scope
- Flowcharts, UML diagrams, architecture diagrams
- Charts and graphs (bar, line, pie, etc.)
- Figures with captions, photos, illustrations
- Tables (as visual content)

### Out of Scope
- Mathematical equations (already handled via `has_math` flag)
- Video content extraction
- Real-time diagram editing
```

**Tips:**
- Be specific about what's included
- Explain *why* items are out of scope (deferred, already solved, different feature)
- Out of scope items may become future issues

---

### User Stories

User stories describe the problem from the user's perspective. Each story should be independently valuable.

**Format:**
```markdown
### US-N: [Descriptive Title]
> As a [persona], I want [capability] so that [benefit].

**Acceptance Criteria:**
- [ ] [Observable outcome 1]
- [ ] [Observable outcome 2]
```

**Good:**
```markdown
### US-1: Diagram Discovery
> As a researcher, I want to find diagrams related to my search query 
> so that I can quickly locate visual explanations of concepts.

**Acceptance Criteria:**
- [ ] Search results include relevant diagrams when available
- [ ] Diagrams show source document and page number
- [ ] Diagrams can be filtered by type (flowchart, chart, figure)
```

**Bad:**
```markdown
### US-1: Add Diagram Table
> As a developer, I want a visuals table so that I can store images.

**Acceptance Criteria:**
- [ ] Table has image_path column
- [ ] Table has vector column
```

**Tips:**
- Use personas that represent real users (researcher, developer, librarian)
- Acceptance criteria should be testable without knowing the implementation
- Avoid criteria that specify technical approach

---

### Success Metrics

Quantifiable metrics help evaluate whether the solution actually solves the problem.

**Good:**
```markdown
## Success Metrics

- **Diagram recall**: >80% of diagrams in test corpus are discoverable via search
- **User satisfaction**: Diagram results rated "helpful" in >75% of cases
- **Search coverage**: Documents with diagrams return visual results for relevant queries
```

**Bad:**
```markdown
## Success Metrics

- Visuals table is created
- All images are stored
```

**Tips:**
- Metrics should measure problem resolution, not implementation completion
- Include baselines when available
- Consider both quantitative and qualitative measures

---

## Checklist

Before submitting an issue, verify:

- [ ] **Problem is clear**: Someone unfamiliar with context can understand what's wrong
- [ ] **No solutions prescribed**: Issue describes *what* not *how*
- [ ] **Scope is bounded**: Clear in/out scope with rationale
- [ ] **User stories focus on users**: Not "as a developer, I want a table"
- [ ] **Acceptance criteria are testable**: Can verify without knowing implementation
- [ ] **Success metrics measure outcomes**: Not implementation milestones
- [ ] **Goal is solution-agnostic**: Multiple approaches could satisfy it

---

## Quick Reference

| Section | Focus | Anti-Pattern |
|---------|-------|--------------|
| Problem Statement | Gap between current and desired state | Describing a solution |
| Goal | User-centric outcome | Technical objective |
| Scope | What's included/excluded | Unbounded or vague |
| User Stories | User capability and benefit | Developer tasks |
| Acceptance Criteria | Observable outcomes | Implementation details |
| Success Metrics | Problem resolution measures | Completion checkboxes |

---

## Related Guides

- [Architecture Review Guide](14-architecture-review.md) - For documenting design decisions (comes after issue)
- [PR Description Guide](11-pr-description.md) - For describing implementations (comes after design)
- [Implementation Analysis Guide](06-implementation-analysis.md) - For planning implementation approach
