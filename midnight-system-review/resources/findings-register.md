---
name: findings-register
description: Creation guide for bare filename `findings-register.md` — the adjudicated record of every graded candidate, its disposition against the accepted-issue threshold, and the grade tuple behind it.
metadata:
  order: 6
---

# Findings Register Guide

Creation guide for bare filename `findings-register.md`. The register holds the whole adjudication trail: what was accepted, what stands as an observation, what the evidence contradicted, and the grade tuple behind each call. The accepted subset is what the verdict rests on; the rest is the trail behind it.

## Template

```markdown
# Findings Register

**Candidates:** {n} · **Accepted:** {n} · **Observations:** {n} · **Dismissed:** {n}

| ID | Area | Tuple | Disposition |
|----|------|-------|-------------|
| F1 | area name | severity/confidence/anchor summary | accepted \| observation \| dismissed |

## F1 — {one-line title}

**Tuple:** {full grade tuple}
**Anchor:** {locus link}
**Rationale:** {why the tuple grades this way, and why the disposition follows}
```

## Rules

- **Every candidate is a row.** A candidate absent from the disposition table is a candidate nobody adjudicated.
- **Every row has a detail section.** The row is the index; the section carries the full tuple, the anchor, and the rationale. A dismissed candidate records the contradicting anchor there.
- **The tuple is complete before the register is finished.** An incomplete tuple is what the grade-tuple completeness gate looks for, so a row with a partial tuple is unfinished work rather than a finding.
- **Disposition comes from the threshold.** Accepted, observation, and dismissed are assigned per the [accepted-issue threshold](./grading-rubric.md#accepted-issue-threshold); this template records the assignment and its rationale.
- **Line budget:** ~15 lines per finding section and ~200 lines for the register, and the summary line replaces any count table. A register at the ceiling with candidates left to record means the sections are carrying evidence the probe artifacts own.
