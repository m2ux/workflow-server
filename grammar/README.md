# Grammar

Formal EBNF grammars defining the syntax of workflow definition files.

## Files

| File | Defines | Format |
|------|---------|--------|
| `activity.ebnf` | Activity file syntax — steps, decisions, loops, flows, boolean algebra | [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) |

## Relationship to Other Artifacts

- **`schemas/`** — JSON Schema files for runtime validation of the same structures
- **`constraints/`** — Alloy semantic constraints that complement the grammar with structural rules (provenance, uniqueness, reachability)
- **`.engineering/artifacts/planning/2026-02-10-toon-v3-schema-specification/`** — Full design specification with rationale, examples, and design decisions

## Reading the Grammar

Productions use standard EBNF notation:

| Syntax | Meaning |
|--------|---------|
| `A ::= B C` | A is defined as B followed by C |
| `A \| B` | A or B |
| `A?` | A is optional |
| `A+` | One or more of A |
| `A*` | Zero or more of A |
| `(* ... *)` | Comment |
