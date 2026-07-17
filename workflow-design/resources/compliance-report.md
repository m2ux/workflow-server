---
name: compliance-report
description: Template for the review-mode compliance report.
metadata:
  order: 4
  legacy_id: 4
---

# Compliance Report Template

Review mode produces a compliance report without modifying the target workflow(s). Create/update drafting uses per-pass checkpoints instead.

```markdown
# Compliance Review: {workflow-id}

**Date:** YYYY-MM-DD
**Workflow:** {workflow-id} v{version}
**Files audited:** {count}

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | N |
| High     | N |
| Medium   | N |
| Low      | N |
| Pass     | N |

## Principle Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| … | … | file / field | … |

(Detail and full principle prose live in the principle-findings satellite; this table is the decision surface.)

## Anti-Pattern Findings

| Severity | Entry | Location | Fix |
|----------|-------|----------|-----|
| … | catalog **name** | file / field | … |

(Detail lives in the anti-pattern-findings satellite.)

## Schema Validation Results

| File | Result |
|------|--------|
| … | pass / fail |

## Recommended Fixes

Prioritized list by severity. Link satellites when a fix needs more context than one row.
```
