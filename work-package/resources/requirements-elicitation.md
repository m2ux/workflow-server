---
name: requirements-elicitation
description: Reference material for requirements elicitation methodology, including question domains, anti-patterns, and the document template.
metadata:
  version: 2.2.1
  order: 5
  legacy_id: 5
---


# Requirements Elicitation Guide

Requirements elicitation discovers **what** the user needs before planning **how** to implement it — a dialogue, not a checklist.

Goals: discover what the user actually needs (which may differ from the initial ask), clarify ambiguities before they become implementation assumptions, establish scope boundaries, define measurable success criteria.

The document this guide produces is the [canonical home](./canonical-home-map.md#map) for the problem statement, scope, and success criteria — downstream artifacts (plan, philosophy, test plan, close-out) link here and never restate them.

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

## Question Discipline

- Questions are open-ended, so the answer carries the stakeholder's framing rather than the asker's.
- A vague answer is probed for specifics; recorded as given, it becomes an assumption.
- Every pass defines what is in scope and what is out, which is what holds the scope still.
- Understanding is confirmed back to the stakeholder before it informs a requirement.
- "What" stays separate from "how" — a requirement that names a solution has already narrowed the design.
- The first answer is followed by "why" and "what else", which is where the deeper need surfaces.
- Who is affected is identified before the requirements are written, so no perspective is missing from them.

## Minimum Viable Elicitation

For simpler features, at minimum capture: a one-sentence problem statement, the primary user/stakeholder, 3-5 in-scope items, 2-3 explicit exclusions, and 2-3 success criteria.

Elicitation is complete when four questions are confidently answerable: what problem are we solving, for whom, what is included and excluded, and how we will know it is done.

## Rules

- **Line budget:** ~150 lines. Elicited requirements are the payload; the Elicitation Log holds one row per question and no transcript.
