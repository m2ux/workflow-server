---
name: evidence-log
description: Creation guide for bare filename `evidence-log.md` — the consolidated evidence base carrying per-area probe accounting, every evidence item with its anchor, the failure-class discharge records, and the blocked validations.
metadata:
  order: 10
---

# Evidence Log Guide

Creation guide for bare filename `evidence-log.md`. The evidence every finding later rests on, plus the accounting the final report reconciles against. Adjudication reads entries by ID, so an entry without one is evidence nothing can cite.

## Template

```markdown
# Evidence Log — {target identity}

| Area | Probes planned | Executed | Blocked | Candidates |
|------|---------------:|---------:|--------:|-----------:|
| `area-id` | 3 | 3 | 0 | 2 |

## {Area title}

| ID | Probe | Evidence | Anchor |
|----|-------|----------|--------|
| E1 | P7 | one line on what was observed | {locus link} |

**Failure-class discharge**

| Class | Verdict | Proof |
|-------|---------|-------|
| correlation-contract | confirmed \| refuted \| inconclusive \| blocked | {join-key table or per-caller path anchor} |

**Blocked validations**

| What | Why | Anchor |
|------|-----|--------|
| one line | the gate that was false | {locus link} |
```

## Rules

- **One record per planned area, in order.** A missing or duplicated area is a hard stop, not a gap to note — those probes re-run before consolidating.
- **Every evidence item carries an ID and an anchor.** Adjudication cites the ID and follows the anchor; an item with neither cannot support a finding.
- **A probe overage is recorded, not absorbed.** Exceeding the per-area budget signals a plan or discipline defect rather than extra rigour, so it appears in the accounting.
- **Inconclusive is its own verdict.** A refuted discharge carries its proof — a join-key discharge table for a correlation class, a per-caller path anchor for a propagation or caller-accounting class. An inconclusive result is marked as such and never relabelled refuted.
- **Blocked validations are listed with the gate that failed.** A validation nobody could run is evidence about the toolchain, and the report reconciles against it.
- **Line budget:** one row per evidence item and per blocked validation, with no prose outside the tables.
