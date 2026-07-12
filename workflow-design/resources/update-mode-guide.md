---
name: update-mode-guide
description: Guidance for modifying existing workflows.
metadata:
  order: 3
---

# Update Mode Guide

Guidance for modifying existing workflows. Update mode activates when the user references an existing workflow by name or ID with a change request; `intake-classification` classifies the operation and sets `operation_type` to `update` with the corresponding mode flag.

---

## Key Differences from Create Mode

| Aspect | Create Mode | Update Mode |
|---|---|---|
| Pattern analysis | Required — extract patterns from reference workflows | Skipped — the existing workflow is the reference |
| Impact analysis | Skipped | Required — enumerate affected files and side-effects |
| Scope | All files are new | Mix of modified, added, and removed files |
| Content drafting | Write from scratch | Modify existing content with preservation checks |
| README | Generate new | Update existing to reflect changes |

## Impact Analysis and Content Preservation

The impact-analysis procedure — enumerate files, classify impact, check transition / reference / variable integrity, and flag removals — and the content-preservation rules that require every removal to be surfaced and confirmed are owned by the [impact-analysis](../techniques/impact-analysis.md) technique. Follow that technique's protocol and rules; this guide does not duplicate them.

---

## Related Guides

- [Design Principles](design-principles.md)
- [Review Mode Guide](review-mode-guide.md)
