---
id: architecture-review
version: 1.0.0
---

# Architecture Review Guide

**Purpose:** Guidelines for conducting architecture reviews that evaluate design decisions against quality attributes, constraints, and trade-offs. This process produces an **Architecture Decision Record (ADR)** as its primary work product.

---

## Overview

Architecture review is a structured process for evaluating significant design decisions before or during implementation. The review examines context, constraints, alternatives, and trade-offs to ensure decisions are well-reasoned and properly documented.

The architecture review process produces an **Architecture Decision Record (ADR)**—a lightweight text document that captures the decision along with its context, rationale, and consequences. ADRs bridge the gap between architecture and agile development by treating decisions as first-class artifacts.

> **Key Insight:** ADRs appeal to agile teams because they are lightweight, focused on single decisions, and treat decisions as artifacts that the team writes down. (Source: "Love Unrequited" - Michael Keeling, IEEE Software 2022)

### ADRs Precede Design

**ADRs document decisions, not design.** An ADR records *what* was decided and *why*—the design work that determines *how* to implement comes afterward.

| ADR Should Include | ADR Should NOT Include |
|--------------------|------------------------|
| The decision and rationale | File paths or module names |
| Requirements and constraints | Code snippets or API signatures |
| Trade-offs between options | Implementation steps |
| Expected consequences | Testing strategies |

When referencing tickets or requirements documents:
- ✅ "TICKET-1234 requires that X be abstracted behind a configurable provider"
- ❌ "TICKET-1234 introduces a `FooProvider` trait in `src/foo.ts`"

Tickets specify *requirements*; design work determines *implementation*.

---

## Architectural Significance

### What Makes a Decision Architecturally Significant?

A decision is **architecturally significant** when it:

1. **Affects system-wide quality attributes** - Performance, security, scalability, maintainability
2. **Establishes a precedent** - Other decisions will follow this pattern
3. **Involves significant trade-offs** - Choosing between competing quality attributes
4. **Is difficult or costly to reverse** - Would require substantial rework to change
5. **Crosses component boundaries** - Affects multiple modules or services
6. **Introduces new constraints** - Limits future design options

> "Architectural decisions are those that you wish you could get right early because they're hard to change later." — Martin Fowler

### Architectural Significance Checklist

Use this checklist to determine if a decision warrants an ADR:

| Criterion | Yes → ADR Likely | No → ADR Unlikely |
|-----------|------------------|-------------------|
| Affects multiple components? | ✅ | ❌ |
| Involves quality attribute trade-offs? | ✅ | ❌ |
| Establishes a pattern others will follow? | ✅ | ❌ |
| Would be costly to reverse? | ✅ | ❌ |
| Future developers need to understand why? | ✅ | ❌ |
| Changes core abstractions or data models? | ✅ | ❌ |

**Threshold:** If 3+ criteria are "Yes", create an ADR.

---

## When to Write an ADR

**Write an ADR when:**
- Making an architecturally significant decision (see checklist above)
- Choosing between multiple valid approaches with different trade-offs
- Introducing a new pattern, library, or framework
- Changing existing architecture or conventions
- The decision affects **system-wide quality attributes** (performance, security, scalability)
- The decision establishes a **precedent** that other decisions will follow
- The decision involves **significant trade-offs** between competing quality attributes

**Skip an ADR when:**
- The decision is trivial or easily reversible
- Standard patterns are being followed without deviation
- The change is purely cosmetic or stylistic
- Bug fixes (including complex multi-file fixes)
- Refactoring (internal improvements without behavior changes)
- Minor features (small enhancements, additional options, UI tweaks)
- Performance optimizations (unless architecturally significant)

---

## When to Create an ADR (Timing)

**ADRs should be created AFTER implementation is complete, not before.**

### Rationale

Architectural decisions are not finalized until implementation is complete. During implementation, constraints are encountered that often require design changes:

- Unexpected technical limitations
- Performance characteristics that differ from expectations
- Integration challenges with existing systems
- Edge cases that require different approaches

Creating an ADR before implementation risks documenting decisions that will change, leading to:
- ADRs that don't reflect actual architecture
- Confusion about whether the ADR or code is authoritative
- Wasted effort updating ADRs during implementation

### Workflow Integration

ADRs are created after all implementation tasks are complete:

1. Complete all implementation tasks
2. Validate tests pass and build succeeds
3. **Verify architectural significance** using the checklist above
4. If significant: Create ADR documenting the **actual** architectural decisions made
5. Set status to **Accepted** (since implementation is already complete)
6. Commit ADR and proceed to validation phase

### Status for New ADRs

Since ADRs are created after implementation:
- **Accepted** is the typical initial status (implementation validates the decision)
- **Proposed** is only used when additional review/approval is needed before merging
- **RFC** is used when seeking broader input before finalizing

---

## ADR Anti-Patterns to Avoid

From "Fundamentals of Software Architecture" (Ford & Richards):

These three anti-patterns follow a **progressive flow**: overcoming Covering Your Assets leads to Groundhog Day, and overcoming Groundhog Day leads to Email-Driven Architecture. Making effective architecture decisions requires avoiding all three.

| Anti-Pattern | Description | Symptoms | Solution |
|--------------|-------------|----------|----------|
| **Covering Your Assets** | Avoiding or deferring decisions out of fear of being wrong | Vague language, hedging, no clear commitments | Be specific; state the decision clearly with rationale |
| **Groundhog Day** | Not documenting decisions, causing repeated discussions | Same debates recurring; "didn't we already decide this?" | Write it down once, reference it forever |
| **Email-Driven Architecture** | Decisions scattered across emails, Slack, meetings | People forget, miss, or can't find decisions | Centralize decisions in ADRs; email is for communication, not documentation |

> **Key Insight:** "Email is a great tool for communication, but it makes a poor document repository system." — Fundamentals of Software Architecture

---

## ADR Structure

### Required Sections

```markdown
# ADR: [Descriptive Title]

## Status
[Proposed | RFC | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context
[Describe the forces at play - technical, business, operational]

## Decision Drivers
[List the key factors influencing this decision]

## Considered Options
[List alternatives with pros/cons]

## Decision
[State the decision and key design choices]

## Consequences
[Document the expected outcomes - positive, negative, and neutral]
```

### Optional Sections

```markdown
## Related Decisions
[Links to related (non-superseding) ADRs]

## Confirmation
[How will we validate the decision was correct?]

## Compliance
[How will we ensure the decision is followed?]

## Notes
[Additional context, caveats, or links that don't fit elsewhere]

## References
[Hyperlinked references to related ADRs, documentation, external resources]
```

---

## Section Guidelines

### Status

Use one of these statuses:
- **Accepted** - Decision is final and implementation is complete (typical initial status)
- **Proposed** - Requires additional review/approval before PR merge (rare)
- **RFC** - Request for Comments; seeking input from broader team before finalizing
- **Deprecated** - No longer recommended but may still exist in codebase
- **Superseded by ADR-XXXX** - Replaced by a newer decision

#### Status Lifecycle

```
RFC ──► Accepted ──┬──► Superseded by ADR-XXXX
                   │
                   └──► Deprecated
```

**Flow:**
1. New ADRs typically start as **Accepted** (since implementation is already complete when ADR is written)
2. Use **RFC** when seeking broader team input before implementation
3. Use **Proposed** if additional governance review is required before PR merge
4. If a future decision changes this one, status becomes **Superseded**
5. Deprecated decisions remain for historical reference

> **Note:** Since ADRs are created after implementation, the typical starting status is **Accepted**. The code itself validates the decision.

#### Superseding ADRs

When one ADR supersedes another, **bidirectional linking** is required:

**In the NEW (superseding) ADR:**
```markdown
## Status

Accepted

Supersedes: [ADR: Old Decision](adr-old-decision.md)
```

**In the OLD (superseded) ADR:**
```markdown
## Status

Superseded by [ADR: New Decision](adr-new-decision.md)
```

> **Why bidirectional linking?** Anyone finding the old ADR immediately knows it's obsolete and where to find the current decision. Anyone reading the new ADR can trace the history. (Source: Head First Software Architecture)

### Context

Describe the circumstances that directly influence the decision. Separate into force types:

```markdown
## Context

[Brief overview of the problem/situation]

### Technical Forces
- [Technical constraints, existing systems, dependencies]

### Business Forces
- [User needs, stakeholder requirements, timelines]

### Operational Forces
- [Deployment concerns, maintenance, scaling]
```

#### Quality Attribute Requirements (Optional)

When architectural characteristics drive the decision, use quality attribute scenarios to make requirements concrete and testable:

```markdown
### Quality Attribute Requirements

| Attribute | Scenario | Measure |
|-----------|----------|---------|
| Performance | When 1000 concurrent users submit forms | Response < 200ms (95th percentile) |
| Availability | When primary database fails | Failover < 30 seconds |
| Scalability | When load doubles during peak hours | Auto-scale within 2 minutes |
```

**Tips:**
- Focus on facts, not opinions
- Include measurable baseline metrics when available
- Describe the current state objectively

### Decision Drivers

List the key factors that will determine the best option:

```markdown
## Decision Drivers

1. **[Driver 1]** - [Why this matters]
2. **[Driver 2]** - [Why this matters]
3. **[Driver 3]** - [Why this matters]
```

**Common decision drivers:**
- Performance requirements
- Development velocity
- Maintainability
- Cost (development, operational, licensing)
- Team expertise
- Time constraints
- Risk tolerance
- **Identified risks** and their severity
- **Risk mitigation** requirements

### Considered Options

Present alternatives with balanced trade-offs:

```markdown
## Considered Options

### Option 1: [Name] (Selected)

[Brief description]

- ✅ [Advantage 1]
- ✅ [Advantage 2]
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

### Option 2: [Name]

[Brief description]

- ✅ [Advantage 1]
- ❌ [Disadvantage 1]
- ❌ [Why not selected]
```

**Tips:**
- Include at least 2-3 options
- Be fair to rejected options
- Clearly mark the selected option
- Explain why rejected options weren't chosen
- **Describe the paths not taken**: For each rejected option, explicitly state the blocking factor or unacceptable trade-off that eliminated it
- Consider using a **decision matrix** for complex decisions with multiple criteria

#### Decision Matrix (Optional)

For complex decisions with multiple weighted criteria:

```markdown
### Decision Matrix

| Criterion | Weight | Option 1 | Option 2 | Option 3 |
|-----------|--------|----------|----------|----------|
| Performance | 30% | 4 (1.2) | 3 (0.9) | 5 (1.5) |
| Maintainability | 25% | 5 (1.25) | 4 (1.0) | 3 (0.75) |
| Cost | 20% | 3 (0.6) | 5 (1.0) | 2 (0.4) |
| Team expertise | 15% | 4 (0.6) | 3 (0.45) | 2 (0.3) |
| Time to implement | 10% | 3 (0.3) | 4 (0.4) | 2 (0.2) |
| **Total** | | **3.95** | **3.75** | **3.15** |

*Scores: 1-5 (1=poor, 5=excellent). Weighted scores in parentheses.*
```

### Decision

State the decision clearly and concisely:

```markdown
## Decision

Implement **Option N: [Name]** because [primary rationale].

Key constraints:
- [Constraint or boundary that shapes how this will be implemented]
- [Non-functional requirement that must be respected]
```

**Tips:**
- Lead with the decision, not the explanation
- Keep the rationale brief (detailed reasoning is in Context/Options)
- Include constraints that bound the solution space, not implementation details

### Consequences (Recommended)

Document the expected outcomes of implementing this decision:

```markdown
## Consequences

### Positive
- [Expected benefit 1]
- [Expected benefit 2]

### Negative
- [Trade-off or risk accepted 1]
- [Trade-off or risk accepted 2]

### Neutral
- [Side effect that is neither positive nor negative]
```

**Why this matters:**
- Makes trade-offs explicit and traceable
- Helps future readers understand what was knowingly accepted
- Aligns with the original Nygard ADR format
- Provides a record for validating the decision later

### Related Decisions (Optional)

For decisions that relate to but don't supersede other ADRs:

```markdown
## Related Decisions

- [ADR: Related Decision 1](adr-related-decision-1.md) - [Brief explanation of relationship]
- [ADR: Related Decision 2](adr-related-decision-2.md) - [Brief explanation of relationship]
```

**When to include:**
- Decisions that build upon prior decisions
- Decisions that address adjacent concerns
- Decisions that share constraints or context

### Confirmation (Optional but Recommended)

Describe how you'll validate the decision:

```markdown
## Confirmation

The decision will be validated through:

1. **[Validation method 1]**: [Description]
2. **[Validation method 2]**: [Description]

**Success criteria:**
- [Measurable criterion 1]
- [Measurable criterion 2]
```

**Validation methods:**
- Code review verification
- Performance benchmarks
- Proof of concept experiments
- Integration testing results
- Monitoring and observability data

### Compliance (Optional)

For decisions that require ongoing enforcement, describe how compliance will be ensured:

```markdown
## Compliance

**Governance level:**
- [ ] Project-level (this team only)
- [ ] Team-level (affects multiple projects)
- [ ] Organization-level (requires ARB review)

**Enforcement mechanisms:**
- [ ] Automated lint rule: [Rule name/description]
- [ ] ArchUnit test or similar structural test
- [ ] Fitness function: [Description]
- [ ] Code review checklist item
- [ ] CI/CD gate

**Monitoring:**
- [How violations will be detected]

**Exceptions:**
- [Process for requesting exceptions]
```

**When to include Compliance:**
- Standards or conventions that affect multiple teams
- Security-related decisions
- Decisions that require ongoing adherence (not just one-time implementation)

### Notes (Optional)

For additional context that doesn't fit in other sections:

```markdown
## Notes

- [Historical context or background information]
- [Links to discussions, RFCs, or meeting notes]
- [Caveats or edge cases to be aware of]
- [Future considerations not yet decided]
```

---

## ADR Template

**Template:**

```markdown
# ADR: [Descriptive Title]

## Status
[Proposed | RFC | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context
[Describe the forces at play - technical, business, operational]

## Decision Drivers
[List the key factors influencing this decision]

## Considered Options
[List alternatives with pros/cons]

| Option | Pros | Cons |
|--------|------|------|
| Option A | Pro 1, Pro 2 | Con 1, Con 2 |
| Option B | Pro 1, Pro 2 | Con 1, Con 2 |

## Decision
[State the decision and key design choices]

## Consequences
[Document the expected outcomes - positive, negative, and neutral]

**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative:**
- [Tradeoff 1]
- [Tradeoff 2]

**Neutral:**
- [Observation 1]

---

## Related Decisions
[Links to related (non-superseding) ADRs]

## Confirmation
[How will we validate the decision was correct?]

## Compliance
[How will we ensure the decision is followed?]

## Notes
[Additional context, caveats, or links that don't fit elsewhere]

## References
[Hyperlinked references to related ADRs, documentation, external resources]
```

---

## Naming and Storage

### File Naming

```
adr-descriptive-name.md
```

- Use `NNNN-` prefix (sequential number) followed by kebab-case descriptive name
- Keep names concise but meaningful
- Examples: `0001-typescript-nodejs-runtime.md`, `0002-vector-storage.md`

### Version Control

- ADRs are committed to the repository
- Changes to accepted ADRs should be new ADRs (superseding the old)
- Link ADRs in PR descriptions when relevant

---

## ADR Scope

ADRs can operate at different scopes depending on the decision's impact:

| Scope | Description | Storage | Example |
|-------|-------------|---------|---------|
| **Project** | Affects only this codebase | ADR folder | Choice of ORM library |
| **Team** | Affects multiple projects owned by one team | Shared team docs repo | API versioning strategy |
| **Organization** | Affects all teams | Central architecture docs | Authentication standard |

> "ADRs can be as narrow or as broad as you'd like them to be. Some ADRs are project-specific, affecting only one team. Other ADRs affect many or all teams in an organization." — Head First Software Architecture

**Guidelines:**
- Start at project scope; escalate if the decision affects others
- Reference organization-wide ADRs from project ADRs when applicable
- Keep project ADRs in the project repository for discoverability

---

## Tooling

### When to Adopt Tooling

Start with plain Markdown files. Adopt tooling when:
- You have 20+ ADRs and need better navigation
- Multiple teams need to coordinate ADRs
- You want automated status tracking or templates

### Available Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **ADR-tools** | CLI for creating/managing ADRs | Standardized templates, quick creation |
| **Log4brains** | ADR management with web UI | Team collaboration, searchable history |
| **Markdown + Git** | No tooling | Small teams, simple needs |

> "Get a sense of what works best for your team. Then, as your needs grow, go find a tool that fits those needs." — Head First Software Architecture

**Recommendation:** For most projects, plain Markdown files in the ADR folder with consistent naming are sufficient.

---

## Writing Style

### Do

- ✅ Use clear, technical language
- ✅ Be specific about trade-offs
- ✅ Include measurable criteria
- ✅ Focus on the "why" not just the "what"
- ✅ Keep it concise (aim for 1-2 pages)
- ✅ Describe the paths not taken explicitly

### Don't

- ❌ Use vague language ("might be better", "could help")
- ❌ Hide negative consequences
- ❌ Include implementation details (file paths, code snippets, API signatures)
- ❌ Confuse requirements with implementation ("ticket introduces trait X" vs "ticket requires X")
- ❌ Reference gitignored planning artifacts
- ❌ Add process attribution ("per user request", "AI suggested")

---

## Examples

### Good Context Section

```markdown
## Context

The seeding process currently holds LLM results in memory until database write.
If any downstream stage fails, all processing work is lost.

### Technical Forces

- LLM extraction takes 2-10 seconds per document
- Memory usage grows linearly with batch size
- LanceDB writes are atomic but can fail on schema issues

### Business Forces

- 212 documents processed over 2h 22m represents significant time investment
- Re-processing after failure doubles costs and delays

### Operational Forces

- Production seeding runs are scheduled overnight
- Failures require manual intervention to resume
```

### Good Decision Drivers

```markdown
## Decision Drivers

1. **Zero data loss** - LLM results must survive any downstream failure
2. **Fast resume** - Re-running should skip already-processed documents
3. **Minimal complexity** - Solution should be simple to implement and maintain
4. **No external dependencies** - Avoid adding new infrastructure requirements
5. **Risk mitigation** - Must handle edge cases identified in production
```

### Good Consequences Section

```markdown
## Consequences

### Positive
- LLM results are persisted immediately after extraction
- Resume capability reduces re-processing time from hours to minutes
- Simple file-based approach requires no new infrastructure

### Negative
- Additional disk I/O for checkpoint writes (estimated <5% overhead)
- Checkpoint files must be managed (cleanup after successful runs)
- Adds ~200 lines of code to maintain

### Neutral
- Changes the seeding workflow from single-phase to multi-phase
- Existing monitoring dashboards remain unchanged
```

---

## Checklist

Before submitting an ADR, verify:

### Architectural Significance
- [ ] Decision meets 3+ criteria from the Architectural Significance Checklist
- [ ] Decision is not a bug fix, refactoring, or minor feature

### Required Elements
- [ ] Title clearly describes the decision
- [ ] Status is set correctly (Proposed/RFC/Accepted/Deprecated/Superseded)
- [ ] Context describes forces (technical, business, operational)
- [ ] Decision drivers are explicit
- [ ] At least 2 alternatives were considered
- [ ] Selected option is clearly marked
- [ ] Trade-offs (✅/❌) are balanced and fair
- [ ] Decision statement is clear and concise
- [ ] **Consequences documented** (positive, negative, neutral)

### Paths Not Taken
- [ ] Each rejected option has a clear blocking factor stated
- [ ] Rejection reasons are specific, not vague

### If Superseding Another ADR
- [ ] New ADR includes "Supersedes: [ADR: name]" link
- [ ] Old ADR updated to "Superseded by [ADR: name]" status
- [ ] Bidirectional links are correct

### Format & Compliance
- [ ] File follows naming convention (`adr-name.md`)
- [ ] No references to gitignored planning artifacts
- [ ] Success criteria are measurable (if Confirmation section included)
- [ ] Compliance mechanisms defined (if decision requires ongoing enforcement)

### No Implementation Details
- [ ] No file paths or module names
- [ ] No code snippets or API signatures
- [ ] No implementation steps or testing strategies
- [ ] Ticket references describe requirements, not implementation

### References
- [ ] All references are hyperlinked (internal ADRs use relative paths)
- [ ] External resources include full URLs

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Test Plan Creation Guide](16-test-plan.md)
- [Design Framework Guide](17-design-framework.md)
