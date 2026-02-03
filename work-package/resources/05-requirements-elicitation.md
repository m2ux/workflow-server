---
id: requirements-elicitation
version: 2.0.0
applicability: "New features and major enhancements only. Skip for bug fixes, refactors, chores, and minor updates."
---

# Requirements Elicitation Guide

**Purpose:** Reference material for requirements elicitation methodology. This guide provides context, anti-patterns, and templates. Flow and question sequencing are defined in the activity.

---

## Overview

Requirements elicitation discovers **what** the user needs before planning **how** to implement it. This is a dialogue, not a checklist.

**When to use:** New features and major enhancements only. Skip for bug fixes, refactors, chores, and minor updates.

**Goals:**
- **Discover** what the user actually needs (which may differ from what they initially ask for)
- **Clarify** ambiguities before they become implementation assumptions
- **Establish** clear scope boundaries to prevent scope creep
- **Define** measurable success criteria

---

## Question Domain Reference

The five domains below cover the complete requirements space. Ask **one question at a time** and adapt based on responses.

### 1. Problem Exploration

**Goal:** Understand the core problem and its impact.

**Questions:**
- What problem are we trying to solve?
- What's not working well today?
- What triggers the need for this now?
- What would happen if we didn't address this?
- Have you tried any workarounds?
- How long has this been a problem?

**Red flags to probe:**
- Vague problem statements ("it's just not good enough")
- Solutions disguised as problems ("we need a caching layer")
- Symptoms rather than root causes

### 2. Stakeholder Identification

**Goal:** Understand who is affected and their specific needs.

**Questions:**
- Who will use this feature?
- Are there different user types with different needs?
- Who else is affected by this change?
- Who makes decisions about this area?
- Are there any external parties involved?

**User story format:**
> As a **[user type]**, I want **[capability]** so that **[benefit]**.

### 3. Context & Environment

**Goal:** Understand the operating environment and constraints.

**Questions:**
- What systems or components does this interact with?
- Are there any dependencies on external services?
- What's the expected usage volume/frequency?
- Are there any technology constraints?
- What's the timeline or deadline?
- Are there any regulatory or compliance requirements?

### 4. Scope Definition

**Goal:** Establish clear boundaries to prevent scope creep.

**Questions:**
- What should definitely be included?
- What should explicitly NOT be included?
- What's the minimum viable version?
- What can be deferred to a later phase?
- Are there any constraints on complexity?

**Scope boundary format:**
- ✅ **In scope:** [Explicit inclusions]
- ❌ **Out of scope:** [Explicit exclusions]
- ⏳ **Deferred:** [Future considerations]

### 5. Success Criteria

**Goal:** Define measurable outcomes that indicate completion.

**Questions:**
- How will we know this is working correctly?
- What would a successful outcome look like?
- Are there any performance targets?
- What would make this a failure?
- How will this be tested/validated?

**SMART criteria format:**
- **S**pecific: Clear and unambiguous
- **M**easurable: Quantifiable or observable
- **A**chievable: Realistic given constraints
- **R**elevant: Aligned with the problem
- **T**ime-bound: Has a clear timeline

---

## Document Template

```markdown
# Requirements Elicitation: [Work Package Name]

**Date:** YYYY-MM-DD
**Status:** ✅ Confirmed | 🔄 Pending Confirmation

---

## Problem Statement

[2-3 sentences describing the core problem being solved]

## Goal

[What success looks like - the desired end state]

---

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| [Type] | [Needs] | As a [type], I want [X] so that [Y] |

### Secondary Stakeholders

- [Stakeholder 1] - [Their interest]
- [Stakeholder 2] - [Their interest]

---

## Context

### Integration Points
- [System/component 1] - [How it interacts]
- [System/component 2] - [How it interacts]

### Dependencies
- [External dependency 1]
- [External dependency 2]

### Constraints
- **Technical:** [Constraints]
- **Timeline:** [Constraints]
- **Resources:** [Constraints]

---

## Scope

### ✅ In Scope

1. [Must-have 1]
2. [Must-have 2]
3. [Must-have 3]

### ❌ Out of Scope

1. [Exclusion 1] - [Why excluded]
2. [Exclusion 2] - [Why excluded]

### ⏳ Deferred

1. [Future item 1] - [When to revisit]

---

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | [Criterion 1] | [How to verify] |
| SC-2 | [Criterion 2] | [How to verify] |
| SC-3 | [Criterion 3] | [How to verify] |

---

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | [Question] | [Key points from response] |
| Scope | [Question] | [Key points from response] |

### Clarifications Made

- [Clarification 1]: [Resolution]
- [Clarification 2]: [Resolution]

### Open Questions Resolved

- [Question]: [Resolution]

---

## Confirmation

**Confirmed by:** [User]
**Date:** YYYY-MM-DD
**Notes:** [Any additional notes from confirmation]
```

---

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

---

## Quick Reference

### Minimum Viable Elicitation

For simpler features, at minimum capture:
- [ ] One-sentence problem statement
- [ ] Primary user/stakeholder
- [ ] 3-5 in-scope items
- [ ] 2-3 explicit exclusions
- [ ] 2-3 success criteria

### When to Stop Eliciting

Stop when you can confidently answer:
1. What problem are we solving? ✅
2. For whom? ✅
3. What's included and excluded? ✅
4. How will we know it's done? ✅
