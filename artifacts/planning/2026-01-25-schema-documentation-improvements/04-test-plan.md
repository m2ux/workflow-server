# Test Plan: Schema Expression Improvements

**Issue:** [#24](https://github.com/m2ux/workflow-server/issues/24)  
**PR:** [#25](https://github.com/m2ux/workflow-server/pull/25)

---

## Overview

This test plan validates the schema refactoring and state optimization changes:

1. **workflow.schema.json** - Factored definitions, external $ref for conditions
2. **state.schema.json** - Numeric references, removed redundant fields
3. **Documentation** - Schema Relationships context added

---

## Planned Test Cases

### Schema Validation Tests

| Test ID | Objective | Type |
|---------|-----------|------|
| PR25-TC-01 | Verify workflow.schema.json validates existing work-package workflow | Integration |
| PR25-TC-02 | Verify external $ref to condition.schema.json resolves correctly | Unit |
| PR25-TC-03 | Verify internal $ref to definitions (action, guide, step) works | Unit |
| PR25-TC-04 | Verify state.schema.json accepts numeric phase/step values | Unit |
| PR25-TC-05 | Verify state.schema.json rejects old string-prefixed format | Unit |

### Runtime Tests

| Test ID | Objective | Type |
|---------|-----------|------|
| PR25-TC-06 | Verify workflow loading with refactored schema | Integration |
| PR25-TC-07 | Verify state tracking uses numeric format | Unit |
| PR25-TC-08 | Verify checkpoint responses recorded without redundant checkpointId | Unit |
| PR25-TC-09 | Verify decision outcomes recorded without redundant decisionId | Unit |
| PR25-TC-10 | Verify history events use numeric phase/step references | Unit |

### Regression Tests

| Test ID | Objective | Type |
|---------|-----------|------|
| PR25-TC-11 | All existing unit tests pass | Unit |
| PR25-TC-12 | All existing integration tests pass | Integration |
| PR25-TC-13 | Build succeeds without errors | Build |

---

## Validation Strategy

### Before Implementation
- Record current test pass rate: `npm test`
- Record workflow.schema.json line count: `wc -l schemas/workflow.schema.json`

### After Implementation
- All tests pass: `npm test`
- Line count reduced: `wc -l schemas/workflow.schema.json` < 450
- Manual validation of work-package workflow in workflows branch

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific schema tests
npm test -- --grep "schema"

# Validate workflow against schema
npx tsx scripts/validate-workflow.ts workflows/work-package/work-package.json
```

*Detailed steps, expected results, and source links will be added after implementation.*
