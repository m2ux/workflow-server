---
id: prioritization-framework
version: 1.0.0
---

# Prioritization Framework

**Purpose:** Framework for evaluating and ordering work packages by dependencies, value, risk, and effort.

---

## Step 1: Dependency Graph

Build a directed acyclic graph (DAG) where edges represent "must complete before" relationships.

```
Package A ──→ Package C ──→ Package E
Package B ──→ Package C
Package D (independent)
```

**Rules:**
- If A depends on B, B must be scheduled before A
- Independent packages can be scheduled in any position
- Circular dependencies indicate a decomposition problem — resolve before prioritizing

### Topological Sort

Perform a topological sort on the DAG to identify valid orderings. The dependency graph constrains but does not fully determine the order — packages at the same level can be ordered by other criteria.

---

## Step 2: Evaluation Criteria

For each package, assess three dimensions:

| Criterion | Scale | Definition |
|-----------|-------|-----------|
| **Business Value** | High / Medium / Low | Impact on users, revenue, or strategic goals |
| **Risk** | High / Medium / Low | Likelihood of complications, unknowns, or failure |
| **Effort** | High / Medium / Low | Time and complexity to complete |

### Scoring Guidance

**Business Value:**
- **High:** Directly enables a key capability or unblocks other teams
- **Medium:** Improves existing functionality or addresses a known pain point
- **Low:** Nice-to-have improvement or internal cleanup

**Risk:**
- **High:** Unfamiliar domain, complex integration, many unknowns
- **Medium:** Some unknowns but generally understood approach
- **Low:** Well-understood change with clear path

**Effort:**
- **High:** >8 hours agentic time, multiple files, complex logic
- **Medium:** 3-8 hours agentic time, moderate complexity
- **Low:** <3 hours agentic time, straightforward change

---

## Step 3: Priority Ordering

Apply criteria within dependency constraints:

1. **Dependency-first:** Packages that unblock others are scheduled early
2. **High value, low effort:** Quick wins are scheduled early for momentum
3. **High risk early:** Risky packages are scheduled early to surface problems before they cascade
4. **Low value, high effort:** Deferred unless blocking other packages

### Priority Table

```markdown
| Priority | Package | Value | Risk | Effort | Rationale |
|----------|---------|-------|------|--------|-----------|
| 1 | {Name} | High | Low | Low | Quick win, unblocks C |
| 2 | {Name} | High | High | Medium | Risky, better to learn early |
| 3 | {Name} | Medium | Low | Medium | Depends on #1 |
```

---

## Step 4: Present to User

Present the proposed order with:
- Dependency graph (text or mermaid diagram)
- Priority table with rationale
- Alternative orderings if multiple valid sequences exist
- Any packages that could be parallelized

The user controls the final priority order — present recommendations but defer to user judgment.
