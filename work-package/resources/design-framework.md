---
name: design-framework
description: TRIZICS solution-design methodology (conventional-first, inventive principles, synthesis) applied at plan time, and the design-philosophy artifact template. Problem definition and classification live on the design-philosophy technique operations.
metadata:
  version: 1.2.0
  order: 9
  legacy_id: 9
---

# Design Framework Guide

Systematic solution design: explore the solution space conventional-before-inventive and record trade-offs with rationale. Problem definition, classification, and path selection are owned by the [design-philosophy operations](../techniques/design-philosophy/TECHNIQUE.md) (define, classify, determine-path); this framework's solution-space areas are applied by plan-prepare, scoped to the assessed complexity (simple: definition + conventional + synthesis; moderate: add classification; complex: include inventive solutions).

## Design Framework: TRIZICS Approach

Uses the **TRIZICS Software Design** methodology, adapted from systematic innovation principles. Five areas:

1. **Identify & Define Problem** — Problem statement, system understanding, impact, constraints, root cause ([define](../techniques/design-philosophy/define.md))
2. **Classify Problem Type** — Specific problem (cause known/unknown) vs. inventive goal (improvement/prevention) ([classify](../techniques/design-philosophy/classify.md))
3. **Conventional Solutions** — Design patterns, best practices, existing solutions, constraint analysis
4. **Inventive Solutions** — Contradictions, inventive principles, ideal solution thinking (only if conventional solutions inadequate)
5. **Solution Synthesis** — Architecture design, trade-offs, implementation roadmap, success metrics

## Conventional Solutions

**Always start here.** Most problems have known solutions.

Sources to check: design patterns, industry best practices, similar solutions in the codebase, the knowledge base, framework/library documentation.

Questions to answer:
- Has this been solved before in our codebase?
- What do established design patterns suggest?
- What do the framework/library docs recommend?
- What constraints limit conventional approaches?

Move to inventive solutions only if:
- Conventional solutions don't meet requirements
- Trade-offs of conventional solutions are unacceptable
- Contradictions exist that conventional solutions can't resolve

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

Ask: "What would the ideal solution look like if there were no constraints?" Then work backward to find practical approximations.

## Solution Synthesis & Design

Document the design:

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

Design validation questions:

- [ ] Does the solution address the root cause, not just symptoms?
- [ ] Are trade-offs acceptable and documented?
- [ ] Can success be measured objectively?
- [ ] Is the solution maintainable long-term?
- [ ] Does it align with existing architecture and patterns?

## Design Philosophy Artifact Template

Create `design-philosophy.md` in the planning folder using this template:

```markdown
# Design Philosophy

> design-philosophy · [Work Package Name] · #[issue-number] [issue title] · YYYY-MM-DD

## Problem Statement

[Clear, specific description of the problem being solved]

### System Context

[Components, relationships, and context relevant to this problem]

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | [Critical/High/Medium/Low] |
| Scope | [Users/components affected] |
| Business Impact | [What happens if not addressed] |

## Problem Classification

**Type:** [Specific Problem / Inventive Goal]

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [ ] Improvement goal
- [ ] Prevention goal

**Complexity:** [Simple / Moderate / Complex]

**Rationale:** [Why this classification]

## Workflow Path Decision

**Selected Path:** [Full workflow / Elicitation only / Research only / Direct to planning]

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [ ] Implementation Analysis
- [ ] Plan & Prepare

**Rationale:** [Why this path was chosen]

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | [Timeline constraints] |
| Technical | [Technical limitations] |
| Dependencies | [External dependencies] |
| Resources | [Resource constraints] |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| [What success looks like] | [How to measure] | [Specific target] |

## Design Decisions (if applicable at this stage)

[Omit this section if none yet]

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| [Decision point] | [Option A, Option B] | [Chosen option] | [Why] |

## Notes

[Omit this section if none. Additional context, open questions, or considerations for subsequent phases]
```
