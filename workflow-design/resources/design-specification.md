---
name: design-specification
description: Guidelines for creating the design-specification planning artifact (purpose + dimension deltas).
metadata:
  version: 1.1.0
  order: 14
---

# Design Specification Guide

Confirmed design surface for create/update. Answers: what stays the same, and what changes per design dimension? Persisted after elicitation/synthesis; mid-flow `spec-confirmed` is a soft gate. Stakeholder attestation of the specification is part of Gate 2 (`approve-to-commit`). Canonical home for purpose and dimension deltas ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

## Template

```markdown
# Design Specification — {short title}

**Workflow:** `{workflow-id}` v{version}
**Mode:** Create | Update
**Date:** YYYY-MM-DD
**Change categories:** [from update-mode-guide when update]
**Change request:** [one line]
**Baseline:** [link structural inventory when update]

---

## Purpose

[2–4 sentences: outcome that stays; what this session changes. Not a product essay.]

| Goal | Meaning |
|------|---------|
| … | … |

**Out of scope:** [bullets]

**Also see:** [assumptions log](NN-assumptions-log.md) · [impact](NN-impact-analysis.md) when update

---

## Activity list

[Create: proposed activities. Update: "No activities added/removed/reordered" + short role table if helpful.]

| Activity | Role in this change |
|----------|---------------------|
| `{id}` | … |

---

## Checkpoints

[What gate messages / links change — not a full checkpoint inventory unless create.]

| Gate family | Change |
|-------------|--------|
| … | … |

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| … | … |

---

## Rules

| Rule / principle | Application |
|------------------|---------------|
| … | … |

---

## Confirmation ask

[One line: what approving this spec means.]
```

## Rules

- **Purpose + dimension deltas only.** Omit encyclopedia restatement of unchanged dimensions.
- **Tables over narrative.** Unchanged mode branches get one line, not a reprint of the workflow.
- **Own facts only.** Assumptions, impact, inventory, and scope live in their homes — link, do not restate ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **Single-source:** README Problem/Solution and Design Decisions link here; do not restate the body in README or COMPLETE.
- **Line budget:** ~120 lines for update; create may run longer but still delta-shaped.
