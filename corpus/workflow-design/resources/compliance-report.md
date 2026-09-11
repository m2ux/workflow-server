---
name: compliance-report
description: Guidelines for creating rolled-up compliance-review and post-update-review planning artifacts.
metadata:
  order: 4
  legacy_id: 4
---

# Compliance Report Guide

Rolled-up audit decision surface. Answers: how many findings, at what severity, and what to fix first? Human primary link at review disposition / post-update gates.

**Bare filenames:** `compliance-review.md` when `{operation_type}` is `review`; `post-update-review.md` otherwise. Same template; title and filename differ.

## Template

```markdown
# {Compliance Review | Post-Update Review}: {workflow-id}

**Date:** YYYY-MM-DD
**Workflow:** {workflow-id} v{version}
**Files audited:** {count}
**Mode:** review | post-update

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

(Detail in the principle-findings satellite; this table is the decision surface.)

## Anti-Pattern Findings

| Severity | Entry | Location | Fix |
|----------|-------|----------|-----|
| … | catalog **name** | file / field | … |

(Detail in the anti-pattern-findings satellite.)

## Schema Validation Results

| File | Result |
|------|--------|
| … | pass / fail |

## Other pass summaries

| Pass | Count | Satellite |
|------|------:|-----------|
| Expressiveness | N | [link or —] |
| Conformance | N | … |
| Rule hygiene | N | … |
| Enforcement | N | … |

(Omit rows for passes not run in this mode.)

## Recommended Fixes

Prioritized by severity. Link satellites when a fix needs more than one row.
```

## Rules

- **Finding tables + satellite links** — do not embed full principle or anti-pattern prose.
- **Clean pass:** executive summary zeros and a one-line "No findings" under Recommended Fixes; omit empty finding tables or leave a single dash row.
- **Post-update:** same shape; note new-vs-pre-existing only when it changes the decision.
- **Line budget:** ~80 lines plus finding rows.
