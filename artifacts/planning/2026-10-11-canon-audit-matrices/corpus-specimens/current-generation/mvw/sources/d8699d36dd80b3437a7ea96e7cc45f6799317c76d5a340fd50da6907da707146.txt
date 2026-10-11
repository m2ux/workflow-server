---
name: change-brief
description: Creation guide for the change-brief planning artifact — purpose, dimension captures or deltas, and open design judgements.
metadata:
  version: 1.1.0
  order: 10
---

# Change Brief Guide

The confirmed design surface for a create or update run. Answers: what outcome is intended, what changes per design dimension, and which judgements are still open. Canonical home for purpose, change goals and open judgements ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

## Template

```markdown
# Change Brief — {short title}

**Workflow:** `{workflow-id}` v{version}
**Mode:** Create | Update
**Date:** YYYY-MM-DD
**Change categories:** [update runs only]
**Change request:** [one line]
**Baseline:** [link the baseline surface on an update run]

---

## Purpose

[2–4 sentences: the outcome a run produces, and what this session changes about it.]

| Goal | Meaning |
|------|---------|
| … | … |

**Out of scope:** [bullets]

---

## Dimensions

[Create: one section per dimension in the create set. Update: only the dimensions that change — an unchanged dimension is absent, not reprinted.]

| Dimension | This run's shape |
|-----------|------------------|
| … | … |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way | Outcome |
|---|-----------|----------------|------------------------------|---------|
| 1 | … | … | … | … |

[Omit the section when nothing is open.]

---

## Confirmation ask

[One line: what approving this brief commits to.]
```

## Rules

- **Purpose and deltas only.** An update brief carries the dimensions that change; it does not reprint the ones that do not.
- **Tables over narrative.** A dimension gets a row, not an essay.
- **Own facts only.** Impact classification, the file manifest and findings live in their own homes — link them, never restate their bodies ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **Every open judgement carries an outcome.** A row's `Outcome` records what the operator decided about it — settled as the brief proposes, or carried open into the close-out as a limitation the run did not resolve. A row still reading `…` after the disposition gate is a judgement whose answer went unrecorded, which is what leaves a run closing with questions nobody answered.
- **Name every gap.** A question the run could not settle is a row in Open judgements, not a silently chosen default.
- **Line budget:** ~120 lines for an update; a create brief may run longer but stays delta-shaped per dimension.
