# Web Research: TOON Format for Workflows

**Date:** 2026-01-20  
**Work Package:** Use TOON format for workflows (#4)  
**Sources:** [TOON GitHub](https://github.com/toon-format/toon), [TOON Spec](https://github.com/toon-format/spec)

---

## Executive Summary

TOON (Token-Oriented Object Notation) is a mature, well-documented format with:
- **Spec version:** 3.0 (2025-11-24)
- **TypeScript SDK:** `@toon-format/toon` (npm)
- **File extension:** `.toon`
- **Media type:** `text/toon`
- **Token savings:** 30-60% depending on data structure
- **Round-trip safe:** JSON → TOON → JSON preserves all values

---

## Key Findings

### 1. TypeScript API

```typescript
import { encode, decode } from '@toon-format/toon'

// Encode JS object to TOON string
const toonString = encode(data)

// Decode TOON string back to JS object
const jsObject = decode(toonString)

// Streaming for large datasets
import { encodeLines, decodeFromLines } from '@toon-format/toon'
```

**Critical:** `decode()` returns a **plain JavaScript object** — identical to what `JSON.parse()` returns. This means **Zod validation works unchanged**.

### 2. Token Savings by Data Structure

| Structure Type | TOON vs JSON | Notes |
|----------------|--------------|-------|
| Uniform arrays of objects | 35-60% fewer | Optimal case (tabular format) |
| Nested/mixed structures | 20-35% fewer | Still significant savings |
| Deeply nested configs | 30% fewer | Less optimal but still better |
| Semi-uniform (50% tabular) | 15-20% fewer | Diminishing returns |

**Our workflow files:**
- `work-package.json` has **phases array** with uniform structure → should see ~40-50% savings
- Intent/skill files have nested objects → expect ~25-35% savings

### 3. Format Syntax Examples

**Object (nested):**
```toon
context:
  task: Our favorite hikes together
  location: Boulder
```

**Primitive array (inline):**
```toon
tags[3]: admin,ops,dev
```

**Array of objects (tabular - optimal):**
```toon
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

**Mixed/non-uniform arrays:**
```toon
items[3]:
  - 1
  - a: 1
  - text
```

### 4. Encoding Rules

- **Strings are quoted only when required:** containing delimiter, colon, brackets, control chars
- **Numbers:** canonical decimal form (no exponent, no leading zeros, no trailing zeros)
- **Booleans/null:** `true`, `false`, `null` (unquoted)
- **Indentation:** 2 spaces per level (configurable)
- **Line endings:** LF only (U+000A)

### 5. Decoder Options

```typescript
decode(toonString, {
  indent: 2,        // Spaces per level (default: 2)
  strict: true      // Enforce counts, indentation (default: true)
})
```

**Strict mode enforces:**
- Array count matches declared `[N]`
- Tabular row width matches field count
- Indentation is exact multiple of indent size
- No tabs in indentation

### 6. Special Cases & Edge Cases

| Case | Handling |
|------|----------|
| Empty string | `""` (quoted) |
| Empty array | `key[0]:` |
| Empty object | Blank line under `key:` |
| Unicode/emoji | Safe unquoted unless other rules apply |
| Strings with colons | Must be quoted |
| Strings starting with `-` | Must be quoted |
| `NaN`, `Infinity` | Normalized to `null` |
| `-0` | Normalized to `0` |

### 7. Benchmark Results (from TOON repo)

**LLM Comprehension Accuracy:**
- TOON: 73.9%
- JSON: 69.7%
- YAML: 69.0%
- XML: 67.1%

**Efficiency (accuracy per 1K tokens):**
- TOON: 26.9 acc%/1K tok
- JSON compact: 22.9 acc%/1K tok
- YAML: 18.6 acc%/1K tok

---

## Implementation Considerations

### What Changes

1. **Add dependency:** `npm install @toon-format/toon`

2. **Update loaders:** Replace `JSON.parse()` with `decode()`
   ```typescript
   // Before
   const data = JSON.parse(content)
   
   // After
   import { decode } from '@toon-format/toon'
   const data = decode(content)
   ```

3. **Update file extensions:** `.json` → `.toon`

4. **Update file filters:** `f.endsWith('.json')` → `f.endsWith('.toon')`

### What Stays the Same

- **Zod schemas:** No changes needed (validates JS objects, not format)
- **Type definitions:** No changes (same data structures)
- **MCP tool interfaces:** No changes (return same data)
- **Test structure:** Same tests, just loading `.toon` files

### Schema Files Consideration

JSON Schema files (`schemas/*.json`) are a special case:
- They're used for validation, not LLM context
- TOON doesn't have a schema specification equivalent
- **Recommendation:** Keep schema files as JSON, convert only data files

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TOON decode produces different structure | Low | SDK is mature, spec v3.0 stable |
| Edge cases in workflow data | Medium | Test with actual workflow files |
| Performance regression | Low | TOON decode is optimized |
| Breaking tests | Medium | Run full test suite after conversion |

---

## Decision

**Proceed with TOON implementation:**
- ✅ Mature SDK (`@toon-format/toon`)
- ✅ Comprehensive spec (v3.0)
- ✅ Proven token savings (30-60%)
- ✅ Zod compatibility confirmed
- ✅ Round-trip safe

**Scope refinement:**
- Convert: `workflow-data/workflows/*.json`, `prompts/intents/*.json`, `prompts/skills/*.json`
- Keep as JSON: `schemas/*.json` (validation schemas, not LLM context)

---

## References

- [TOON Format Specification v3.0](https://github.com/toon-format/spec/blob/main/SPEC.md)
- [TypeScript SDK README](https://github.com/toon-format/toon/blob/main/packages/toon/README.md)
- [API Reference](https://toonformat.dev/reference/api)
- [Format Overview](https://toonformat.dev/guide/format-overview)
