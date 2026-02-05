# Work Package Plan: Documentation Review & Fixes

## Summary

Fix 6 documentation issues identified during implementation analysis. All fixes are documentation-only changes.

## Tasks

### Task 1: Remove Template Tools from API Reference
**File:** `docs/api-reference.md`
**Action:** Remove the "Template Tools" section (lines ~38-43)
**Priority:** Critical

### Task 2: Add Rules Tools to API Reference  
**File:** `docs/api-reference.md`
**Action:** Add new "Rules Tools" section documenting `get_rules` tool
**Priority:** Critical

### Task 3: Fix Development Guide Project Structure
**File:** `docs/development.md`
**Action:** Remove `template-loader.ts` from the project structure diagram
**Priority:** Critical

### Task 4: Remove Template Instructions from Development Guide
**File:** `docs/development.md`
**Action:** Remove "Adding New Templates" section
**Priority:** Moderate

### Task 5: Update README IDE Rule
**File:** `README.md`
**Action:** Update IDE rule to match `docs/ide-setup.md` multi-step version
**Priority:** Moderate

### Task 6: Update SETUP IDE Rule
**File:** `SETUP.md`
**Action:** Update IDE rule to match `docs/ide-setup.md` multi-step version
**Priority:** Moderate

## Execution Order

1. Task 1 + Task 2 (API reference fixes)
2. Task 3 + Task 4 (Development guide fixes)
3. Task 5 + Task 6 (IDE rule consistency)

## Success Criteria

- [ ] No references to template tools in docs
- [ ] `get_rules` tool is documented in API reference
- [ ] Project structure diagram matches actual files
- [ ] IDE rule is consistent across README, SETUP, and ide-setup

## Out of Scope

- Implementing template tools
- Changes to source code
- Schema documentation (template references there are conceptual)

---

*Created: 2026-02-05*
*Work Package: #43*
