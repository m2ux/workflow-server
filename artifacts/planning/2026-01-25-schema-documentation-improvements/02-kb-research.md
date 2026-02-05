# Research Findings

**Work Package:** Schema Expression Improvements  
**Date:** 2026-01-25  
**Issue:** [#24](https://github.com/m2ux/workflow-server/issues/24)

---

## JSON Schema Best Practices Research

### Sources

- [JSON Schema - Modular Combination](https://json-schema.org/understanding-json-schema/structuring)
- [JSON Schema - Combining Subschemas](https://tour.json-schema.org/content/06-Combining-Subschemas/01-Reusing-and-Referencing-with-defs-and-ref)
- Stack Overflow: Cross-file references in JSON Schema

---

## Key Findings

### 1. Using `definitions` for Reusable Types (Draft-07)

In JSON Schema Draft-07, the `definitions` keyword provides a standardized location for reusable subschemas:

```json
{
  "definitions": {
    "action": {
      "type": "object",
      "properties": {
        "action": { "type": "string", "enum": ["log", "validate", "set", "emit"] },
        "target": { "type": "string" },
        "message": { "type": "string" },
        "value": {}
      },
      "required": ["action"],
      "additionalProperties": false
    }
  }
}
```

Reference with: `{ "$ref": "#/definitions/action" }`

### 2. Cross-File References

For referencing external schema files:

| Approach | Description | When to Use |
|----------|-------------|-------------|
| **Bundling** | Embed external schemas in `definitions` | Distribution, single-file requirements |
| **External $ref** | Reference by relative path | Development, separation of concerns |

**Syntax for external references:**
```json
{ "$ref": "condition.schema.json" }
```

### 3. Best Practices

1. **DRY Principle** - Define each type once, reference everywhere
2. **Separation of Concerns** - Keep logically distinct schemas in separate files
3. **Consistent Naming** - Use clear, descriptive names in definitions
4. **Documentation** - Add descriptions to definitions for clarity

---

## Application to This Work Package

### Refactoring Strategy

**Step 1: Factor Internal Definitions**

Create reusable definitions in `workflow.schema.json`:

| Definition | Current Duplications | Lines Saved |
|------------|---------------------|-------------|
| `action` | 4× (entryActions, exitActions, step.actions, loop.step.actions) | ~81 |
| `guide` | 5× (phase, step, checkpoint, decision, loop.step) | ~68 |
| `step` | 2× (phase.steps, loops.steps) | ~70 |

**Step 2: External Reference for Conditions**

Replace inline condition definitions with external reference:

```json
// Before (repeated 4 times, ~95 lines each)
"condition": {
  "anyOf": [
    { "type": "object", "properties": { "type": { "const": "simple" }, ... } },
    { "type": "object", "properties": { "type": { "const": "and" }, ... } },
    ...
  ]
}

// After (single line, repeated 4 times)
"condition": { "$ref": "condition.schema.json" }
```

**Expected Impact:**
- Lines saved: ~570
- `workflow.schema.json`: 948 → ~400 lines (58% reduction)

---

## Documentation Improvements

### Schema Relationships Section

Add descriptive context before each diagram:

1. **State Diagram** - Explain this shows the hierarchical structure of a workflow definition
2. **Flowchart** - Explain this shows how the three schemas relate at runtime vs definition-time

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| External $ref may not work with all validators | Test with project's validation setup |
| TypeScript types may need updates | Review and update `src/schema/*.ts` files |
| Breaking changes to workflow definitions | Validate existing workflows still pass |
