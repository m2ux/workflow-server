---
name: change-surface
description: Creation guide for bare filename `change-surface.md` — the authoritative changed-file inventory a review is measured against, with its target identity, refs, per-file change kinds, and the preliminary path-to-crate mapping that seeds area derivation.
metadata:
  order: 8
---

# Change Surface Guide

Creation guide for bare filename `change-surface.md`. The review's answer to "what is in scope". Everything downstream — area derivation, probe targeting, the findings a verdict can rest on — is bounded by this inventory, so it records the refs it was resolved against rather than leaving them implied.

## Template

```markdown
# Change Surface — {target identity}

| Field | Value |
|-------|-------|
| PR | #{n}, or none for a local diff |
| Base ref | {ref} |
| Base branch | {branch, when the surface is a PR} |
| Base SHA | {sha, when known} |
| Head SHA | {sha} |
| Files | {n} |

| File | Change | +/- | Crate or pallet |
|------|--------|-----|-----------------|
| `path` | added \| modified \| deleted | +12 / -3 | crate name |
```

## Rules

- **Every changed path is a row.** The table is the authored surface; a path missing from it is a path no finding can be attributed to.
- **Refs are recorded, never implied.** Base ref and head SHA fix what the inventory was resolved against, so a later reader can tell whether it still describes the branch.
- **Line counts appear when the producing leaf emitted them.** Absent counts leave the cell empty rather than guessing or recomputing.
- **The crate mapping is preliminary.** It seeds area derivation and is not a finding about ownership; area derivation refines it.
- **An empty surface is recorded, not inferred.** An explicit empty authored surface with a head SHA is a valid inventory; a missing surface is a stop, because a review against a guessed surface is worse than no review.
- **Line budget:** one row per changed file, and no prose outside the two tables.
