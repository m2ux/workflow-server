# Grammar

Formal EBNF grammars defining the syntax of workflow definition files.

## About EBNF

Extended Backus-Naur Form (EBNF) is a notation for formally describing the syntax of languages. Originally developed by Niklaus Wirth as an extension of BNF (Backus-Naur Form, used to define ALGOL 60 in the 1960s), EBNF adds constructs for optionality (`?`), repetition (`+`, `*`), and grouping — making grammars more concise and readable than plain BNF. It is standardized as [ISO/IEC 14977](https://www.iso.org/standard/26153.html) and is the conventional format for defining programming language grammars, data formats, and protocol syntaxes. EBNF grammars are declarative: they specify what constitutes a valid document without prescribing how to parse it, making them suitable as both human-readable specifications and inputs to parser generators.

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
