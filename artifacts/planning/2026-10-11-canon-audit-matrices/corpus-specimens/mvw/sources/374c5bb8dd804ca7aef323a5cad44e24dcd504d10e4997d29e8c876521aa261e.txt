---
name: portfolio-synthesis
description: Creation guide for bare filename `portfolio-synthesis.md` — the cross-lens convergence and divergence summary written after a portfolio run's per-lens artifacts.
metadata:
  order: 68
  type: template
---

# Portfolio Synthesis Guide

Creation guide for bare filename `portfolio-synthesis.md`. A portfolio run applies several lenses to one target and writes one artifact per lens; this document is what those artifacts add up to. Divergence is the point — lenses finding different properties is the reason to run more than one — so the synthesis records where they agreed and where each stood alone.

## Template

```markdown
# Portfolio Synthesis — {target}

**Lenses:** {slugs applied} · **Findings:** {n} ({n} convergent, {n} unique)

| Finding | Lenses | Convergence |
|---------|--------|-------------|
| one line | lens slug, lens slug | convergent \| unique |

## What Converged

{One line per finding more than one lens reached, and what agreement adds to confidence.}

## What Only One Lens Saw

{One line per unique finding, naming the lens and the property it is built to notice.}
```

## Rules

- **Every finding is a row.** The table is the index; a finding in a per-lens artifact and absent here is a finding the synthesis dropped.
- **Divergence is a result, not a defect.** A finding one lens reached alone is recorded as that lens's contribution, never as disagreement to be resolved.
- **Convergence names the lenses.** "Two lenses agreed" says less than which two, because which lenses converged is what makes the agreement informative.
- **No re-analysis.** The synthesis reads the per-lens artifacts and relates them; it does not derive findings of its own.
- **Line budget:** ~50 lines. A longer synthesis is restating the per-lens artifacts it should be citing.
