---
name: design-trade-offs
description: Creation guide for bare filename `DESIGN-TRADE-OFFS.md` — the trade-off catalogue, cross-domain interaction map, and design decision register distilled from the conservation laws the findings contract records.
---

# Design Trade-Offs Guide

Creation guide for bare filename `DESIGN-TRADE-OFFS.md`. Three parts, in order. The source is the conservation-laws section of the findings contract, where every law has already survived or been refined by the adversarial pass — rejected laws are absent before this document starts.

## Template

```markdown
# Design Trade-Offs — {target}

## Trade-Off Catalogue

### {domain name}

**Constraint:** {the falsifiable statement of what is conserved}
**Operating point:** {where the code sits today, citing finding IDs as evidence}
**Shift prediction:** {what moves if the operating point changes}
**Design questions:** {what someone has to decide}

## Cross-Domain Interactions

| Trade-off | Compounds with | How |
|-----------|----------------|-----|
| domain constraint | domain constraint | one line |

## Design Decision Register

| Implicit decision | Current choice | Alternative | Governing trade-off | Documented |
|-------------------|----------------|-------------|---------------------|------------|
| one line | one line | one line | domain | yes \| no |
```

## Rules

- **The constraint is falsifiable.** A law nobody could disprove is not a constraint; state it so a counter-example would settle it.
- **The operating point cites finding IDs.** Code-level evidence means the IDs from the findings contract, not a restatement of the finding text.
- **Shift predictions are concrete.** What moves, in which direction, and what would show it.
- **Design questions are actionable.** A question a reader cannot act on belongs in the analysis, not the register.
- **Rejected laws stay absent.** The contract already excluded what the adversarial pass refuted; reintroducing a law here contradicts that pass.
- **Line budget:** ~30 lines per catalogue entry, and the two tables one row per item.
