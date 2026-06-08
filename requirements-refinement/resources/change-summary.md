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

## Conventions

- List every new, updated, and deprecated requirement by identifier.
- State the validation outcome, including the number of correction passes when more than zero.
- Name the staged path and the canonical target path so promotion is unambiguous.
