---
id: design-framework
version: 1.0.0
---

# Design Framework Guide

**Purpose:** Guidelines for structuring problem-solving and solution design during work package planning, using systematic approaches to identify optimal solutions.

---

## Overview

Before designing a solution, apply a structured design framework to:
- **Define the problem clearly** - Ensure the problem is well-understood before jumping to solutions
- **Classify the problem type** - Different problem types require different approaches
- **Explore solution space systematically** - Consider conventional and innovative solutions
- **Make informed trade-offs** - Balance competing constraints with clear rationale

> **Key Insight:** Rushing to implementation without structured problem analysis leads to suboptimal solutions, scope creep, and rework. A small upfront investment in structured thinking pays dividends throughout implementation.

---

## When to Apply This Guide

**Always apply when:**
- Work package involves architectural decisions
- Multiple implementation approaches are possible
- Trade-offs or contradictions exist between requirements
- Problem is complex or unfamiliar
- Performance, reliability, or scalability requirements exist

**Lightweight application acceptable when:**
- Simple, well-understood change
- Following existing established patterns
- Minor bug fix with clear solution
- Change can be completed in <30 minutes

---

## Design Framework: TRIZICS Approach

This guide uses the **TRIZICS Software Design** methodology, adapted from systematic innovation principles.

### Design Considerations

The framework addresses five key areas:

1. **Identify & Define Problem** — Problem statement, system understanding, impact, constraints, root cause
2. **Classify Problem Type** — Specific problem (cause known/unknown) vs. inventive goal (improvement/prevention)
3. **Conventional Solutions** — Design patterns, best practices, existing solutions, constraint analysis
4. **Inventive Solutions** — Contradictions, inventive principles, ideal solution thinking (only if conventional solutions inadequate)
5. **Solution Synthesis** — Architecture design, trade-offs, implementation roadmap, success metrics

---

## Identify & Define Problem

### Problem Definition Checklist

- [ ] **Problem Statement**: Clear, specific description of the issue
- [ ] **System Understanding**: Know the components, relationships, and context
- [ ] **Impact Assessment**: Severity, frequency, and business impact
- [ ] **Success Criteria**: Measurable outcomes that define "solved"
- [ ] **Constraints**: Time, resources, technical limitations
- [ ] **Root Cause**: Underlying cause vs. symptoms (if applicable)

### Effective Problem Statements

| ❌ Poor | ✅ Better |
|---------|-----------|
| "The API is slow" | "The /users endpoint P95 latency exceeds 500ms under load >100 RPS" |
| "Users are confused" | "30% of users fail to complete onboarding within 5 minutes" |
| "The code is messy" | "Adding new payment providers requires modifying 5+ files and takes 3+ days" |

---

## Classify Problem Type

### Specific Problem vs. Inventive Goal

| Specific Problem | Inventive Goal |
|------------------|----------------|
| Something is broken or not working | Want to improve or prevent future issues |
| Focus: Fix or restore | Focus: Enhance or optimize |
| Cause may be known or unknown | Proactive improvement |

### Problem Type Decision Tree

```
Is something currently broken or failing?
├─ YES → SPECIFIC PROBLEM
│   ├─ Do you know the root cause?
│   │   ├─ YES → Cause Known (direct fix)
│   │   └─ NO → Cause Unknown (investigate first)
│   │
└─ NO → INVENTIVE GOAL
    ├─ Are you improving existing capability?
    │   └─ YES → Improvement goal
    └─ Are you preventing future problems?
        └─ YES → Prevention goal
```

---

## Conventional Solutions

**Always start here.** Most problems have known solutions.

### Solution Sources to Check

1. **Design Patterns** - Established architectural patterns
2. **Best Practices** - Industry-standard approaches
3. **Existing Code** - Similar solutions in the codebase
4. **Knowledge Base** - Documented patterns and decisions
5. **Documentation** - Framework/library solutions

### Questions to Answer

- Has this been solved before in our codebase?
- What do established design patterns suggest?
- What do the framework/library docs recommend?
- What constraints limit conventional approaches?

### When to Consider Inventive Solutions

Move to inventive solutions only if:
- Conventional solutions don't meet requirements
- Trade-offs of conventional solutions are unacceptable
- Contradictions exist that conventional solutions can't resolve

---

## Inventive Solutions

Apply when conventional solutions are inadequate.

### Identify Contradictions

A contradiction exists when improving one parameter degrades another:

| Improving... | Degrades... | Example |
|--------------|-------------|---------|
| Performance | Memory usage | Caching speeds access but uses more RAM |
| Flexibility | Simplicity | More options increase configuration complexity |
| Security | Usability | Stronger auth adds friction |

### Inventive Principles (Selected)

| Principle | Description | Software Example |
|-----------|-------------|------------------|
| **Segmentation** | Divide into independent parts | Microservices, modules |
| **Extraction** | Remove/separate problematic part | Extract interface, separate concerns |
| **Local Quality** | Optimize each part differently | Hot path optimization |
| **Asymmetry** | Break symmetry for benefit | Read replicas, CQRS |
| **Merging** | Combine related operations | Batch processing, connection pooling |
| **Universality** | One thing serves multiple purposes | Generic abstractions |
| **Nesting** | Place one thing inside another | Decorator pattern, middleware |
| **Counterweight** | Compensate with opposing action | Circuit breakers, rate limiting |
| **Preliminary Action** | Prepare in advance | Precomputation, lazy initialization |
| **Copying** | Use cheap copies | Caching, snapshots, immutability |

### Ideal Solution Thinking

Ask: "What would the ideal solution look like if there were no constraints?"

Then work backward to find practical approximations.

---

## Solution Synthesis & Design

### Document the Design

```markdown
## Design Summary

**Problem:** [Clear problem statement]

**Approach:** [Chosen solution summary]

**Key Design Decisions:**
1. [Decision 1] - [Rationale]
2. [Decision 2] - [Rationale]

**Alternatives Considered:**
- [Option A] - [Why not chosen]
- [Option B] - [Why not chosen]

**Trade-offs:**
- Pro: [Benefit]
- Con: [Limitation]

**Success Criteria:**
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
```

### Design Validation Questions

- [ ] Does the solution address the root cause, not just symptoms?
- [ ] Are trade-offs acceptable and documented?
- [ ] Can success be measured objectively?
- [ ] Is the solution maintainable long-term?
- [ ] Does it align with existing architecture and patterns?

---

## Quick Reference

### When to Use Full Framework

| Complexity | Approach |
|------------|----------|
| **Simple** (clear problem, known solution) | Problem definition, conventional solutions, synthesis |
| **Moderate** (some uncertainty) | Add problem classification |
| **Complex** (trade-offs, contradictions) | Include inventive solutions |

### Common Pitfalls

| Pitfall | Remedy |
|---------|--------|
| Jumping to solutions | Complete problem definition first |
| Only considering one approach | Explore conventional alternatives |
| Ignoring contradictions | Apply inventive principles |
| Vague success criteria | Define measurable outcomes |
| Over-engineering | Apply appropriate complexity level |

---

## Related Guides

- [Knowledge Base Research Guide](07-knowledge-base-research.md) — Research before design
- [Implementation Analysis Guide](06-implementation-analysis.md) — Understand existing state
- [Work Package Plan](10-wp-plan.md) — Document the design
