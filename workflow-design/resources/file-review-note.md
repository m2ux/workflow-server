---
name: file-review-note
description: Guidelines for creating the file-review-note planning artifact (per-file attestation delta).
metadata:
  order: 19
---

# File Review Note Guide

Per-file review surface after drafting. Answers: what landed, and is any update-mode removal unflagged? Updated in place each iteration.

## Template

```markdown
# File Review Note — {short title}

**Mode:** create | update · **Target:** `{workflow-id}`

| File | Status | Delta / attestation | Removals (update) |
|------|--------|---------------------|-------------------|
| `path` | drafted | one-line intentional delta | none \| listed; flagged vs unflagged |
```

## Rules

- **Attestation, not essay** — one line per file on what landed and why it is intentional.
- **Update mode:** note removals vs committed content; set unflagged when impact inventory missed them.
- **Line budget:** ~40 lines; update in place across the loop.
