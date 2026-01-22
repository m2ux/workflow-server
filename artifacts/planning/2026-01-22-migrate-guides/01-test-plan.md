# Test Plan: WP-006 Migrate Guides

**Issue:** [#6](https://github.com/m2ux/workflow-server/issues/6)
**PR:** [#7](https://github.com/m2ux/workflow-server/pull/7)
**Branch:** 6-migrate-work-package-guides

---

## Overview

This test plan validates the migration of work-package guides from agent-resources to the local workflows branch, including TOON conversion, template extraction, and loader implementation.

---

## Test Cases

### Guide Loader Tests

| ID | Objective | Expected Result | Type |
|----|-----------|-----------------|------|
| GL-01 | List guides for work-package workflow | Returns array of ~23 guide entries | Unit |
| GL-02 | Read guide by name | Returns parsed TOON guide content | Unit |
| GL-03 | Read non-existent guide | Returns GuideNotFoundError | Unit |
| GL-04 | Read guide from non-existent workflow | Returns error | Unit |
| GL-05 | Guide contains template URI reference | `template` field contains valid URI | Unit |

### Template Loader Tests

| ID | Objective | Expected Result | Type |
|----|-----------|-----------------|------|
| TL-01 | List templates for work-package workflow | Returns array of ~12 template entries with indices | Unit |
| TL-02 | Read template by index (e.g., "01") | Returns template markdown content | Unit |
| TL-03 | Read template by invalid index | Returns TemplateNotFoundError | Unit |
| TL-04 | Parse template filename | Extracts index and name from `{NN}-{name}.template.md` | Unit |
| TL-05 | Template indices are unique | No duplicate indices in workflow | Unit |

### Resource Tests

| ID | Objective | Expected Result | Type |
|----|-----------|-----------------|------|
| RS-01 | Fetch `workflow://work-package/guides/plan` | Returns plan guide content | Integration |
| RS-02 | Fetch `workflow://work-package/templates/01` | Returns template 01 content | Integration |
| RS-03 | List guides resource | Returns guide manifest | Integration |
| RS-04 | List templates resource | Returns template manifest with indices | Integration |

### Workflow Loader Tests

| ID | Objective | Expected Result | Type |
|----|-----------|-----------------|------|
| WL-01 | Load workflow from subdirectory | Loads `work-package/work-package.toon` | Unit |
| WL-02 | Workflow guide references use URIs | No external URLs in guide.path | Unit |
| WL-03 | Existing workflow tests pass | No regressions | Regression |

### Migration Validation

| ID | Objective | Expected Result | Type |
|----|-----------|-----------------|------|
| MV-01 | All 23 guides present | Count matches expected | Validation |
| MV-02 | All guides parse as valid TOON | No parse errors | Validation |
| MV-03 | All ~12 templates present | Count matches expected | Validation |
| MV-04 | Templates are valid markdown | No syntax errors | Validation |
| MV-05 | No external agent-resources URLs | Grep returns empty | Validation |

---

## Running Tests

```bash
# Run all tests
npm test

# Run guide loader tests
npm test -- guide-loader

# Run template loader tests  
npm test -- template-loader

# Run specific test file
npx vitest run tests/guide-loader.test.ts

# Validate no external URLs remain
grep -r "agent-resources" workflow-data/workflows/work-package/ && echo "FAIL: External URLs found" || echo "PASS: No external URLs"
```

---

## Validation Checklist

### Pre-Implementation
- [ ] Existing tests pass (baseline)
- [ ] Branch synced with main

### Post-Implementation
- [ ] All new tests pass
- [ ] Existing tests still pass
- [ ] No external URL references in migrated content
- [ ] All guides parse without errors
- [ ] All templates accessible via index URI
