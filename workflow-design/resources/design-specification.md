---
name: design-specification
description: Guidelines for creating the design-specification planning artifact (purpose + dimension deltas).
metadata:
  order: 14
---

# Design Specification Guide

Confirmed design surface for create/update. Answers: what stays the same, and what changes per design dimension? Primary human gate at `spec-confirmed`.

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
- **Single-source:** README Design Decisions links here; do not restate the body in README or COMPLETE.
- **Line budget:** ~120 lines for update; create may run longer but still delta-shaped.
