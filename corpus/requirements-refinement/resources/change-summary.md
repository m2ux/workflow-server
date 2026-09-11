---
name: change-summary
description: Structure for the change summary accompanying a finalized specification.
metadata:
  order: 4
---

# Change Summary

The structure for the human-readable summary that accompanies a finalized specification, so a reviewer
can see what changed before promoting it to the canonical location.

## Template

```markdown
# Change Summary — [specification name]

**Source**: SRC-MTG### — [meeting title / date]  ·  or  SRC-DOC### — [document title] (Author Name)
**Validation**: [passed | passed after N correction passes]

## New Requirements
- [REQ-ID]: [one-line title]

## Updated Requirements
- [REQ-ID]: [what changed]

## Deprecated Requirements
- [REQ-ID]: [reason]

## Sources Added
- SRC-MTG###: [meeting title]  ·  or  SRC-DOC###: [document title] — Author Name

## Promotion
Final specification staged at: [path]
Promote to: [canonical target path]
```

## Rules

- **Every change is listed by identifier.** List each new, updated, and deprecated requirement by its identifier.
- **The validation outcome carries its pass count.** State the outcome, including the number of correction passes when more than zero.
- **Both paths are named.** Name the staged path and the canonical target path so promotion is unambiguous.
- **Line budget:** ~40 lines. The summary says what changed; the specification says what the requirements are.
