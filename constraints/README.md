# Constraints

Formal semantic constraints for workflow definition files, expressed in [Alloy](https://alloytools.org/) notation.

## Files

| File | Covers | Format |
|------|--------|--------|
| `activity.als` | Provenance, symbol uniqueness, flow structure, loop behavior, decision validation, terminal semantics, variable scoping | [Alloy](https://alloytools.org/about.html) |

## Relationship to Other Artifacts

- **`grammar/`** — EBNF grammar defining the syntax these constraints operate over
- **`schemas/`** — JSON Schema files for runtime validation of the same structures
- **`.engineering/artifacts/planning/2026-02-10-toon-v3-schema-specification/`** — Full design specification with rationale, examples, and design decisions

## Constraint Categories

| Category | Rule IDs | Purpose |
|----------|----------|---------|
| Provenance | PROV-001, PROV-002 | Skill inputs resolve from the scoping chain |
| Symbol Uniqueness | SYM-001 to SYM-004 | IDs are unique within their scope |
| Flow Structure | FLOW-001 to FLOW-003 | Every activity has a main flow; no orphan flows |
| Loop Validation | LOOP-001 to LOOP-003 | Loop flows exist; break is scoped correctly |
| Decision Validation | DEC-001 to DEC-004 | Form correctness, default branches, retry termination |
| Terminal Semantics | TERM-001, TERM-002 | Break exits loop; activity transition exits activity |
| Variable Scoping | SCOPE-001, SCOPE-002 | Resolution order and boolean expression validity |

## Severity Levels

| Level | Meaning |
|-------|---------|
| ERROR | Validation fails — must be fixed before execution |
| WARN | Potential issue — flagged during authoring, does not block execution |
| INFO | Documentation — clarifies expected behavior |
