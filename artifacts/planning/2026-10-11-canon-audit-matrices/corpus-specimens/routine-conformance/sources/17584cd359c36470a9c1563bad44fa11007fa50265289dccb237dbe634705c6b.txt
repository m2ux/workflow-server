---
name: issue-creation
description: Reference material for creating a tracker issue on any platform. Provides the body template, anti-patterns, and section rules.
metadata:
  version: 3.0.0
  order: 3
  legacy_id: 3
---

# Issue Creation Guide

Reference material for creating a tracker issue. The body template below is the issue's content on any platform; a platform guide states only where that content sits in its own fields — [jira-issue-creation](jira-issue-creation.md) for Jira.

**Issues define problems, not solutions.** Describe *what* is broken, missing, or suboptimal and *why* it matters; leave *how* for design work. Solutions in issues constrain design options before research is done, conflate problem definition with implementation, skip the planning activity where alternatives are evaluated, and may miss better approaches. If you can't explain the problem without mentioning a specific solution, you may not fully understand the problem yet.

| Issue Should Include | Forbidden in Issues (belongs in) |
|---------------------|----------------------------------|
| Problem statement and impact | "Solution"/"Implementation Approach"/"Technical Approach" sections (planning docs, ADRs, PRs) |
| Current vs desired state | Algorithms or patterns (ADRs, planning docs) |
| User stories and acceptance criteria | File/code locations (PRs, commit messages) |
| Success metrics | Schema or data structures (ADRs) |
| Scope boundaries | Code snippets, API designs, implementation timeline |

## When to Write an Issue

Write an issue when: a feature is missing or incomplete; a bug affects user experience or system reliability; performance doesn't meet user expectations; technical debt impacts development velocity; a user request reveals an unmet need.

Skip formal issues for: trivial fixes (typos, formatting); internal refactoring with no user-visible impact; changes already covered by existing issues.

## Anti-Patterns

Each is checkable against a draft:

- **Solution masquerading as problem** — a title naming a construct ("Add X table") states the need instead ("Users can't find X"). The tell is a draft that reads as a fix.
- **Vague problem statement** — "Improve search" carries concrete examples of what currently fails.
- **Missing acceptance criteria** — every issue defines the checkboxes that mark it done; without them the scope keeps growing.
- **Kitchen-sink scope** — an issue touching every part of the system splits into focused, independent issues.
- **Assumed context** — "Fix the thing we discussed" is written for a reader with no prior context.

## Issue Template

Required sections: Problem Statement, Goal, Scope, User Stories. Optional: Success Metrics, Context & Background, Constraints, References.

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

## Success Metrics

[Omit this section if not measurable. How will we measure improvement?]

| Metric | Target |
|--------|--------|
| [Metric 1] | [Target value] |

## Constraints

[Omit this section if none. Non-functional requirements that bound the solution space: performance, compatibility, security.]

## References

[Omit this section if none. Relevant external documentation, related issues or discussions.]
```

## Section Rules

- **Problem Statement** — the most critical section; must pass the "5 Whys" test so the root problem is clear. If a draft reads like a solution ("We need to add X using library Y"), ask "what user problem does this solve?" and rewrite.
- **Goal** — one sentence, user capability or outcome; use verbs like "enable", "allow", "improve", "reduce"; avoid technical terms unless describing constraints; multiple approaches should be able to satisfy it.
- **Scope** — be specific about what's included; explain *why* items are out of scope (deferred, already solved, different feature); out-of-scope items may become future issues. An issue raised from a deferred item carries its [register](deferred-items.md) row ID, and the register row gains the issue link.
- **User Stories** — each independently valuable; personas represent real users (researcher, developer, librarian), never "as a developer, I want a table"; acceptance criteria are observable outcomes testable without knowing the implementation.
- **Success Metrics** — measure problem resolution, not implementation completion (not "table is created"); include baselines when available; consider both quantitative and qualitative measures.
