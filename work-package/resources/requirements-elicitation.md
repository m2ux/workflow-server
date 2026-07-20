---
name: requirements-elicitation
description: Reference material for requirements elicitation methodology, including question domains, anti-patterns, and the document template.
metadata:
  version: 2.2.1
  order: 5
  legacy_id: 5
---


# Requirements Elicitation Guide

Requirements elicitation discovers **what** the user needs before planning **how** to implement it — a dialogue, not a checklist. Use for new features and major enhancements only; skip for bug fixes, refactors, chores, and minor updates.

Goals: discover what the user actually needs (which may differ from the initial ask), clarify ambiguities before they become implementation assumptions, establish scope boundaries, define measurable success criteria.

The document this guide produces is the [canonical home](../techniques/manage-artifacts/TECHNIQUE.md#canonical-home-map) for the problem statement, scope, and success criteria — downstream artifacts (plan, philosophy, test plan, close-out) link here and never restate them.

## Question Domain Reference

The five domains cover the complete requirements space.

### 1. Problem Exploration

Understand the core problem and its impact:
- What problem are we trying to solve? What's not working well today?
- What triggers the need for this now? What happens if we don't address it?
- Have you tried any workarounds? How long has this been a problem?

**Red flags to probe:** vague problem statements ("it's just not good enough"), solutions disguised as problems ("we need a caching layer"), symptoms rather than root causes.

### 2. Stakeholder Identification

Understand who is affected and their specific needs:
- Who will use this feature? Are there different user types with different needs?
- Who else is affected? Who makes decisions about this area? Any external parties?

**User story format:** As a **[user type]**, I want **[capability]** so that **[benefit]**.

### 3. Context & Environment

Understand the operating environment and constraints:
- What systems or components does this interact with? Dependencies on external services?
- Expected usage volume/frequency? Technology constraints?
- Timeline or deadline? Regulatory or compliance requirements?

### 4. Scope Definition

Establish boundaries to prevent scope creep:
- What should definitely be included? What explicitly NOT?
- What's the minimum viable version? What can be deferred?
- Any constraints on complexity?

Capture as three explicit lists: **In scope** / **Out of scope** / **Deferred**.

### 5. Success Criteria

Define measurable outcomes that indicate completion:
- How will we know this is working correctly? What does success look like?
- Any performance targets? What would make this a failure? How will it be tested/validated?

Criteria must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound.

## Document Template

```markdown
# Requirements Elicitation: [Work Package Name]

> [date] · Confirmed | Pending Confirmation

## Problem Statement

[2-3 sentences describing the core problem being solved]

## Goal

[What success looks like - the desired end state]

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| [Type] | [Needs] | As a [type], I want [X] so that [Y] |

### Secondary Stakeholders
[Omit this section if none]
- [Stakeholder 1] - [Their interest]

## Context

### Integration Points
- [System/component 1] - [How it interacts]

### Dependencies
[Omit this section if none]
- [External dependency 1]

### Constraints
- **Technical:** [Constraints]
- **Timeline:** [Constraints]
- **Resources:** [Constraints]

## Scope

### In Scope

1. [Must-have 1]
2. [Must-have 2]

### Out of Scope

1. [Exclusion 1] - [Why excluded]

### Deferred
[Omit this section if none. One line: Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.]

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | [Criterion 1] | [How to verify] |
| SC-2 | [Criterion 2] | [How to verify] |

## Assumptions

[One line: Assumptions surfaced during elicitation: [assumptions log](assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria), not here.]

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | [Question] | [Key points from response] |

### Clarifications Made
[Omit this section if none]
- [Clarification 1]: [Resolution]

### Open Questions Resolved
[Omit this section if none]
- [Question]: [Resolution]

## Confirmation

**Confirmed by:** [User]
**Date:** YYYY-MM-DD
**Notes:** [Omit if none]
```

## Anti-Patterns to Avoid

| Don't | Why | Do Instead |
|-------|-----|------------|
| Ask leading questions | Biases responses | Ask open-ended questions |
| Accept vague answers | Creates assumptions | Probe for specifics |
| Skip scope boundaries | Leads to scope creep | Always define in/out |
| Assume you understand | Hidden misunderstandings | Confirm understanding |
| Mix requirements and solutions | Constrains design options | Keep "what" separate from "how" |
| Accept the first answer | May miss deeper needs | Ask "why" and "what else" |
| Skip stakeholder identification | Miss important perspectives | Always identify who's affected |

## Minimum Viable Elicitation

For simpler features, at minimum capture: a one-sentence problem statement, the primary user/stakeholder, 3-5 in-scope items, 2-3 explicit exclusions, and 2-3 success criteria.

**Stop eliciting** when you can confidently answer: What problem are we solving? For whom? What's included and excluded? How will we know it's done?
