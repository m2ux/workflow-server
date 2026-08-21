---
name: mitigation-plan-template
description: Template for the mitigation plan.
metadata:
  order: 4
  legacy_id: 4
---

# Mitigation Plan Template

## Mitigation Tiers

A finding's tier states how far the target has to move to answer it.

| Tier | Name | A finding is this tier when |
|------|------|----------------------------|
| `T1` | Direct correction | A stated fact is wrong and the correct one is available |
| `T2` | Reframing & caveating | The claim overreaches what supports it, but holds under a narrower scope |
| `T3` | Novel mitigation | The critique stands and nothing already in the target answers it |
| `T4` | Structural / immovable | The constraint the finding names sits outside the target's reach |

## Mitigation Plan Template

```markdown
# Mitigation Plan: {target name}

## Summary Table

| ID | Severity | Tier | Decision |
|----|----------|------|----------|
| {PREFIX-01} | {CRITICAL | HIGH | MEDIUM | LOW} | {T1 | T2 | T3 | T4} | {accept | modify | skip | unsettled} |

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

## Implementation Priority

1. {T1 changes — Critical first, then High, Medium, Low}
2. {T2 changes — in severity order}
3. {T3 changes — in severity order}
4. {T4 acknowledgements}
```

## Rules

- **Every finding gets a row.** The summary table carries accepted, modified, skipped and unsettled findings alike; a finding absent from the table reads as one nobody looked at.
- **An accepted mitigation carries its full text.** The plan is applied from itself, so a change specified only by reference cannot be made.
- **A removed claim is stated as one.** Where a `T4` mitigation strikes a claim, its entry says so and says why no other tier answered it.
- **Line budget:** ~100 lines. One entry per mitigation; the finding it answers is cited, not restated.
