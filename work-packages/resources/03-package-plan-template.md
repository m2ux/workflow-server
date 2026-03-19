---
id: package-plan-template
version: 1.0.0
---

# Package Plan Template

**Purpose:** Template for individual work package plan documents created during the package-planning loop.

---

## File Naming

```
NN-{package-name}-plan.md
```

Where `NN` is a zero-padded sequence number matching the work package's position in the identified list (e.g., `03-auth-service-plan.md`).

---

## Template

```markdown
# {Package Name} — Plan

**Package #:** {NN} of {total}
**Initiative:** {initiative_name}
**Date:** {YYYY-MM-DD}

---

## Scope

### In Scope
- [Specific deliverable or change]
- [Specific deliverable or change]

### Out of Scope
- [Item explicitly excluded] — Reason: [why excluded]

---

## Dependencies

### Depends On (blockers)
- [ ] {Other package name or external factor} — {what is needed}

### Depended On By
- {Package that depends on this one} — {what they need from this}

### External Dependencies
- {External system, team, or resource} — {what is needed}

---

## Effort Estimate

| Dimension | Estimate |
|-----------|----------|
| **Complexity** | Low / Medium / High |
| **Agentic Time** | X-Y hours |
| **Review Time** | X-Y hours |
| **Calendar Time** | X-Y days |

### Effort Rationale
[Brief justification for the estimate, noting key complexity drivers]

---

## Success Criteria

- [ ] {Measurable criterion 1}
- [ ] {Measurable criterion 2}
- [ ] {Measurable criterion 3}

### How to Verify
[How each criterion will be validated — tests, review, demonstration]
```

---

## Guidelines

### Scope Definition
- Be specific about what is in scope — vague scope leads to scope creep
- List out-of-scope items with reasons to prevent revisiting decisions
- If scope depends on another package, note the dependency explicitly

### Dependency Documentation
- Distinguish between hard blockers (must complete first) and soft dependencies (helpful but not required)
- Note external dependencies that are outside the team's control
- Flag circular dependencies — they indicate a decomposition problem

### Effort Estimation
- Use ranges rather than point estimates
- Separate agentic time (agent working) from review time (human reviewing)
- Calendar time accounts for waiting, context switching, and review cycles
- Note complexity drivers: unfamiliar code, complex logic, integration points

### Success Criteria
- Every criterion must be objectively verifiable
- Prefer automated verification (tests passing, build succeeding) over subjective assessment
- Include both functional criteria (what it does) and quality criteria (how well it does it)
