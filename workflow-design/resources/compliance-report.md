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
(per-principle Pass / Partial / Violation with file, field, and line references)

## Anti-Pattern Findings
(per-entry **name** matches with locations — includes Schema Expressiveness, Rule Hygiene, `structure-backed-constraints`, Tool-Technique-Doc Consistency, Output Economy, and the rest of the catalog; note harness-surface mismatches where those entries require them)

## Schema Validation Results
(per-file pass/fail)

## Recommended Fixes
(prioritized list of changes, grouped by severity)
```
