---
name: design-framework
description: TRIZICS solution-design methodology (conventional-first, inventive principles, synthesis) and the design-philosophy artifact template.
metadata:
  version: 1.3.1
  order: 9
  legacy_id: 9
---

# Design Framework Guide

Systematic solution design: explore the solution space conventional-before-inventive and record trade-offs with rationale.

## Design Framework: TRIZICS Approach

Uses the **TRIZICS Software Design** methodology, adapted from systematic innovation principles. Five areas:

1. **Identify & Define Problem** — Problem statement, system understanding, impact, constraints, root cause
2. **Classify Problem Type** — Specific problem (cause known/unknown) vs. inventive goal (improvement/prevention)
3. **Conventional Solutions** — Design patterns, best practices, existing solutions, constraint analysis
4. **Inventive Solutions** — Contradictions, inventive principles, ideal solution thinking (only if conventional solutions inadequate)
5. **Solution Synthesis** — Architecture design, trade-offs, implementation roadmap, success metrics

## Problem Definition Checklist

A problem statement holds every box below, and where the available context cannot fill one, the statement records which it leaves unfilled rather than papering over the gap.

| Box | Holds |
|---|---|
| Problem statement | Clear, specific, quantified — "the /users endpoint P95 latency exceeds 500ms above 100 RPS", not "the API is slow" |
| System understanding | The components, their relationships, and the context they sit in |
| Impact assessment | Severity, frequency, and business impact |
| Success criteria | Measurable outcomes that define solved |
| Constraints | Time, resources, technical limitations |
| Root cause | The underlying cause as distinct from its symptoms, where one applies |

The statement reads without prior context.

## Problem Classification

### Type

Walk the tree: is something currently broken or failing? Where it is, the problem is **specific** — root cause known gives cause-known and a direct fix, root cause unknown gives cause-unknown and an investigation first. Where nothing is broken, the work is an **inventive goal** — improving an existing capability gives improvement, preventing future problems gives prevention.

A specific problem is fix-or-restore work; an inventive goal is enhance-or-optimize work.

### Complexity

| Complexity | Holds |
|---|---|
| `simple` | A clear problem with a known solution or an existing pattern — a minor fix completable inside half an hour |
| `moderate` | Some uncertainty in the approach |
| `complex` | Architectural decisions, several viable approaches, trade-offs or contradictions between requirements, an unfamiliar problem or domain, or performance, reliability and scalability requirements |

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

The synthesis lands in the homes the [canonical-home map](./canonical-home-map.md#map) names: the approach, its alternatives and the trade-offs between them in the [work package plan](./wp-plan.md#template); the success criteria in [requirements elicitation](./requirements-elicitation.md#document-template). This guide supplies the method that reaches them.

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

[2-4 sentences derived from the ticket: what problem exists, why it matters, impact of not solving it. Line budget — this document precedes requirements elicitation, whose document becomes the canonical refined statement; keep this to the ticket-derived essentials and do not elaborate here.]

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

[One line: Success criteria: [requirements](requirements-elicitation.md#success-criteria) once elicited. Only when the workflow path skips elicitation does this section carry the criteria table (Criterion | Measurement | Target).]

## Notes

[Omit this section if none. Additional context, open questions, or considerations for subsequent phases]
```
