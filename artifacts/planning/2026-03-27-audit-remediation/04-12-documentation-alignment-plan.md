# WP-12: Documentation Alignment

## Scope

**In scope:**
- QC-063: README says checkpoint `blocking` is "Always true"; schema supports non-blocking
- QC-064: README Action enum lists 4 values; schema defines 5 (including `message`)

**Out of scope:**
- Schema changes (addressed in WP-02, WP-03)
- Full README rewrite

**Files:** `schemas/README.md`

## Dependencies

- **All other WPs** — documentation should reflect final schema and code state

## Effort

2 findings, 1 file. Small scope.

## Success Criteria

- README accurately documents non-blocking checkpoint support (`autoAdvanceMs`, `defaultOption`)
- README Action enum lists all 5 values including `message`
- No contradictions between README and schema definitions
