---
name: findings-satellite
description: Shared guidelines for audit finding satellite planning artifacts (expressiveness, conformance, hygiene, enforcement, principles, anti-patterns, verified).
metadata:
  order: 21
---

# Findings Satellite Guide

Agent/detail home for audit pass findings. The rolled-up [compliance report](./compliance-report.md) (or post-update review) is the human decision surface; satellites hold rows the report links.

**Bare filenames:** `expressiveness-findings.md`, `conformance-findings.md`, `rule-hygiene-findings.md`, `enforcement-findings.md`, `principle-findings.md`, `anti-pattern-findings.md`, `verified-findings.md`.

## Template

```markdown
# {Pass name} Findings — `{workflow-id}`

**Mode:** create | update | review · **Date:** YYYY-MM-DD
**Pass:** {expressiveness | conformance | rule-hygiene | enforcement | principles | anti-patterns | verified}
**Target:** `{workflow-id}` v{version}

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Critical \| High \| Medium \| Low | short name / statement | file / field | one-line fix |

**Finding count:** N

## Notes

- [Optional: only pass-specific method notes — e.g. verified-findings re-derivation. Omit when empty.]
```

## Rules

- **Write only when count > 0** for pass satellites gated that way; `verified-findings` may record a clean zero-row set when the verify step always persists.
- **Tables are the record** — no full principle or anti-pattern prose dumps (those live in catalog resources).
- **Severity order** Critical → High → Medium → Low in the table when mixed.
- **Link from the rolled-up report** — do not stack every satellite on the disposition checkpoint.
- **Line budget:** ~60 lines unless the finding count forces more rows.
