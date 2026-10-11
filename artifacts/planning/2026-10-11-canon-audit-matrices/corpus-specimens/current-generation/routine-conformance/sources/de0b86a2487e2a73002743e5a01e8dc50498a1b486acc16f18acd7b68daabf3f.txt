---
name: draft-attestation
description: Guidelines for creating the draft-attestation planning artifact (block-indexed batch review).
metadata:
  order: 20
---

# Draft Attestation Guide

Batch review surface before quality-review / commit. Answers: is every drafted block understood and intentional?

## Template

```markdown
# Draft Attestation — {short title}

**Mode:** create | update · **Files:** N · **Attestation:** ready for batch review

## Reviewed blocks

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| {construct} | `path` | added \| modified \| unchanged | one line |

**draft_attestation:** [One line: all blocks intentional / flags for revision.]
```

## Rules

- **One row per drafted construct** (activity, technique, resource, workflow metadata).
- **Update mode:** mark added / modified / unchanged against committed target.
- **No unflagged-removal silence** — if review-drafted-file found any, state them here.
- **Line budget:** ~50 lines plus one row per block.
