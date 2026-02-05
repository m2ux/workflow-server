# Test Plan: Global Agent Rules

**Issue:** [#17](https://github.com/m2ux/workflow-server/issues/17)  
**PR:** [#18](https://github.com/m2ux/workflow-server/pull/18)

---

## Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Rules Loader Unit Tests | 7 | ✅ Pass |
| get_rules Integration Tests | 3 | ✅ Pass |
| Existing Tests (regression) | 86 | ✅ Pass |
| **Total** | **96** | ✅ Pass |

---

## Test Cases

### Rules Loader Tests (`tests/rules-loader.test.ts`)

| ID | Test | Source |
|----|------|--------|
| RL-01 | Should load global rules from meta/rules.toon | [L9-17](../../../tests/rules-loader.test.ts#L9-L17) |
| RL-02 | Should have sections array with rule categories | [L19-26](../../../tests/rules-loader.test.ts#L19-L26) |
| RL-03 | Should include code-modification section | [L28-37](../../../tests/rules-loader.test.ts#L28-L37) |
| RL-04 | Should include version-control section with GitHub CLI guidance | [L39-47](../../../tests/rules-loader.test.ts#L39-L47) |
| RL-05 | Should include precedence statement | [L49-55](../../../tests/rules-loader.test.ts#L49-L55) |
| RL-06 | Should return error when rules file not found | [L57-63](../../../tests/rules-loader.test.ts#L57-L63) |
| RL-07 | Should return raw TOON content | [L67-73](../../../tests/rules-loader.test.ts#L67-L73) |

### Integration Tests (`tests/mcp-server.test.ts`)

| ID | Test | Source |
|----|------|--------|
| IT-01 | get_activities should include next_action instructing to call get_rules | [L195-202](../../../tests/mcp-server.test.ts#L195-L202) |
| IT-02 | get_rules should return global agent rules | [L205-214](../../../tests/mcp-server.test.ts#L205-L214) |
| IT-03 | get_rules should include code modification boundaries | [L216-224](../../../tests/mcp-server.test.ts#L216-L224) |
| IT-04 | get_rules should include precedence statement | [L226-232](../../../tests/mcp-server.test.ts#L226-L232) |

---

## Running Tests

```bash
# Run all tests
npm test

# Run rules loader tests only
npx vitest run tests/rules-loader.test.ts

# Run with coverage
npx vitest run --coverage
```

---

## Validation Checklist

- [x] All new tests pass
- [x] All existing tests pass (no regression)
- [x] Build succeeds
- [x] No linter errors
