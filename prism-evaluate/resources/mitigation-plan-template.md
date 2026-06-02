---
name: mitigation-plan-template
description: Template for the mitigation plan produced by the resolve-findings technique.
metadata:
  order: 4
  legacy_id: 4
---

# Mitigation Plan Template

Template for the mitigation plan produced by the resolve-findings technique. The plan records the
disposition of every finding from the evaluation report after one-by-one dialogue with the user, with
the full proposed text for each accepted mitigation so the plan is self-contained. The sections below
mirror the technique's compile-plan protocol step. Findings are classified into tiers: T1 (direct
correction), T2 (reframing & caveating), T3 (novel mitigation), T4 (structural / immovable).

## Mitigation Plan Template

```markdown
# Mitigation Plan: {target name}

## Summary Table

| ID | Severity | Tier | Decision |
|----|----------|------|----------|
| {PREFIX-01} | {CRITICAL | HIGH | MEDIUM | LOW} | {T1 | T2 | T3 | T4} | {accept | modify | skip} |

## Detailed Changes

### T1 — Direct Corrections

**{PREFIX-01} — {title}** ({severity}, {decision})
- **Location:** {section / claim in the target}
- **Critique:** {what the evaluation found}
- **Incorrect text:** {the text to replace}
- **Corrected text:** {the replacement}
- **Source:** {citation supporting the correction}

### T2 — Reframing & Caveating

**{PREFIX-02} — {title}** ({severity}, {decision})
- **Location:** {section / claim in the target}
- **Why qualification is needed:** {explanation}
- **Before:** {original claim in context}
- **After:** {replacement preserving intent with honest scoping}

### T3 — Novel Mitigations

**{PREFIX-03} — {title}** ({severity}, {decision})
- **Location:** {section / claim in the target}
- **Critique:** {the finding's critique, read deeply}
- **Proposed mechanism:** {the novel mechanism, architectural addition, or content section}
- **How it resolves the finding:** {why the proposal addresses the critique without striking the claim}
- **Proposed new text:** {the full new text to add}

### T4 — Structural / Immovable

**{PREFIX-04} — {title}** ({severity}, {decision})
- **Constraint:** {why no mitigation can resolve this within the target}
- **Acknowledgement language:** {honest statement of the constraint and how the target relates to it}

> Findings where no mitigation can address the critique without removing the claim entirely are flagged
> as non-feasible with an explicit explanation.

## Implementation Priority

1. {T1 changes — Critical first, then High, Medium, Low}
2. {T2 changes — in severity order}
3. {T3 changes — in severity order}
4. {T4 acknowledgements}
```

**What good looks like:** every finding from the report has a corresponding entry (accepted, modified,
or skipped); accepted mitigations include their full proposed text so the plan is self-contained;
changes are ordered T1 → T2 → T3 → T4 and within each tier by severity.
