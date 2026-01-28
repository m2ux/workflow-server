---
id: task-completion-review
version: 1.0.0
---

# Task Completion Review Guide

**Purpose:** Define the review process performed upon completing each implementation task. This guide covers the verification steps, assumption surfacing, and quality checks that ensure work is ready for user confirmation before proceeding to the next task.

**When to use:** After completing each implementation task.

---

## Overview

**After completing each task, perform a task completion review before requesting user confirmation.** This step catches errors, surfaces assumptions, and ensures all changes are grounded in the actual codebase.

The task completion review has three mandatory components:

1. **Symbol Verification** — Ensure all symbols have provenance in the codebase
2. **Assumption Review** — Surface implicit design decisions for user validation
3. **Quality Checks** — Verify code meets quality standards

---

## 1. Symbol Verification

### What is Symbol Verification?

**Every symbol (type, function, constant, field, etc.) introduced or referenced in code or documentation MUST have provenance in the actual codebase.**

**Provenance means:**
- The symbol exists in the codebase (can be found via grep/search)
- The symbol exists in a declared dependency (verified in Cargo.toml, package.json, etc.)
- The symbol is being newly created by the current task (and is correctly defined)

### ⚠️ CRITICAL: Never Fabricate Symbols

**Fabricating symbols is unacceptable.** This includes:

- Inventing type names, trait names, or struct names that don't exist
- Referencing functions or methods that aren't implemented
- Using field names in documentation that don't match actual code
- Assuming symbol names based on patterns without verification
- Renaming symbols in documentation without corresponding code changes

### Symbol Verification Checklist

For each task, verify:

| Check | How to Verify |
|-------|---------------|
| **New types/structs** | Definition exists in committed code |
| **New functions/methods** | Implementation exists in committed code |
| **New constants/fields** | Declaration exists in committed code |
| **Referenced existing symbols** | `grep` confirms symbol exists in codebase |
| **Symbols from dependencies** | Dependency declared in manifest AND symbol exists in that crate/package |
| **Symbols in documentation** | Every symbol mentioned in docs/ADRs/change files exists in code |

### Verification Commands

```bash
# Verify a symbol exists in the codebase
grep -r "SymbolName" --include="*.rs" .
grep -r "symbol_name" --include="*.rs" .

# Verify a symbol exists in dependencies (Rust)
grep "crate-name" Cargo.toml
# Then check the crate's documentation for the symbol

# Verify a symbol exists in dependencies (TypeScript)
grep "package-name" package.json
# Then check the package's types/documentation

# List all new symbols introduced in this branch
git diff origin/main --name-only -- "*.rs" | xargs grep -h "^pub " | sort -u
```

### Documentation Symbol Verification

**Change files, ADRs, and test plans must only reference symbols that exist in code.**

| Document Type | Symbol Sources |
|---------------|----------------|
| **Change files** (`changes/`) | Symbols from actual code changes in PR |
| **ADRs** (`docs/decisions/`) | Symbols from implemented architecture |
| **Test plans** (`docs/tests/`) | Symbols from actual test implementations |

**Anti-patterns:**
- ❌ Describing a trait that was "planned" but never implemented
- ❌ Mentioning storage items that were "removed" but never existed
- ❌ Referencing extrinsics that don't appear in the pallet
- ❌ Renaming concepts without verifying the new name exists

### When Symbol Verification Fails

If you cannot verify a symbol:

1. **Stop immediately** — Do not proceed with the assumption
2. **Search more thoroughly** — Try alternative search patterns, check git history
3. **Check if it should exist** — Is this something you need to create?
4. **Ask the user** — If uncertain, request clarification before proceeding

---

## 2. Assumption Review

After symbol verification, identify assumptions made during implementation.

### Assumption Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Behavioral** | How the system behaves in specific scenarios | Default values, fallback behavior, edge case handling |
| **Architectural** | Structural decisions about components | Component boundaries, data flow direction, abstraction levels |
| **Interface** | API and contract decisions | Function signatures, return types, error types |
| **Performance** | Trade-offs affecting speed/memory | Lazy vs eager evaluation, caching strategies, algorithm choice |
| **Compatibility** | Backward/forward compatibility | Breaking changes, deprecation handling, migration paths |
| **Scope** | What was included/excluded | Deferred features, intentional limitations |

### Self-Review Questions

After completing a task, review your implementation:

1. **What did I assume about requirements?** — Were there ambiguities I resolved without asking?
2. **What alternatives did I reject?** — Why was this approach chosen over others?
3. **What implicit contracts exist?** — Are there undocumented expectations about inputs, ordering, or state?
4. **What edge cases did I handle (or ignore)?** — How will the code behave in unexpected situations?
5. **What would I do differently with more context?** — Are there decisions I'm uncertain about?

### Why Assumption Review Matters

- Catches misunderstandings before they compound across tasks
- Surfaces design decisions that may conflict with user intent
- Creates opportunities for course correction early
- Documents rationale that would otherwise be lost

---

## 3. Quality Checks

### Code Quality Checklist

- [ ] Follows existing patterns and architecture
- [ ] Type-safe (compiler checks pass)
- [ ] Error handling implemented
- [ ] No hardcoded values (use constants or configuration)
- [ ] Documentation comments on public APIs
- [ ] No debug prints in production code
- [ ] No TODO comments without issue references

### Test Quality Checklist

- [ ] Unit tests written for new code
- [ ] Edge cases covered
- [ ] Error conditions tested
- [ ] All tests passing (unit, integration, e2e)

### Documentation Quality Checklist

- [ ] All symbols in docs exist in code (see Symbol Verification)
- [ ] Change file accurately describes actual changes
- [ ] No fabricated or speculative content
- [ ] Commit messages follow conventional commits

---

## Self-Review Process

### Before Each Task Checkpoint

```
1. SYMBOL VERIFICATION
   ├─ List all new symbols introduced
   ├─ Verify each exists in code or dependencies
   ├─ Check documentation references actual symbols
   └─ If any symbol cannot be verified → STOP

2. ASSUMPTION REVIEW
   ├─ Identify design decisions made
   ├─ Categorize each assumption
   ├─ Document rationale
   └─ Prepare for user review

3. QUALITY CHECKS
   ├─ Run through code quality checklist
   ├─ Run through test quality checklist
   ├─ Run through documentation quality checklist
   └─ Fix any issues before checkpoint

4. CHECKPOINT
   └─ Present findings to user for confirmation
```

### Task Checkpoint Template

Include symbol verification in the task checkpoint:

```markdown
## ✅ Task N Complete

**What was done:**
- [Summary of implementation]
- [Key decisions made]

**Files changed:**
- `src/path/to/module` - [Description]
- `tests/...` - [X tests]

**Test Results:**
- ✅ Unit tests: X/X passing
- ✅ Integration tests: X/X passing
- ✅ Build successful

**Committed:** `abc123` - "feat: [message]"

---

### 🔍 Self-Review

#### Symbol Verification

| Symbol | Type | Provenance |
|--------|------|------------|
| `NewTypeName` | struct | Defined in `src/module.rs:42` |
| `existing_function` | function | Exists in codebase (verified via grep) |
| `DependencyType` | type | From `crate-name` dependency |

**Documentation symbols verified:** ✅ All symbols in change file/docs exist in code

#### Assumptions Made

| Category | Assumption | Rationale |
|----------|------------|-----------|
| [Category] | [Assumption made] | [Why this seemed reasonable] |

#### Open Questions

1. [Any uncertainties that emerged]

---
**Progress:** Task N of M complete
**Next:** Task N+1 - [Name]

**Please review:**
- ✅ Confirm symbols and assumptions are acceptable, OR
- 🔄 Provide corrections before continuing

**Continue to Task N+1?**
```

---

## Updating the Review Log

After user confirmation, update `05-assumptions-log.md` (formerly assumptions log):

```markdown
## Task N: [Task Name]

**Date:** YYYY-MM-DD
**Commit:** `abc123`

### Symbol Verification

| Symbol | Type | Provenance | Status |
|--------|------|------------|--------|
| `NewTypeName` | struct | `src/module.rs:42` | ✅ Verified |
| `existing_fn` | function | Codebase | ✅ Verified |

### Assumptions Surfaced

| ID | Category | Assumption | Rationale |
|----|----------|------------|-----------|
| N.1 | [Category] | [Assumption made] | [Why reasonable] |

### User Response

**Status:** ✅ Confirmed | 🔄 Corrected | ⏸️ Deferred

**Feedback:**
- [User's response]

### Outcome

| ID | Original | Outcome | Changes Made |
|----|----------|---------|--------------|
| N.1 | [Assumption] | ✅ Confirmed | None required |

### Lessons Learned

- [Insights for future tasks]
```

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| **Skip symbol verification** | Fabricated symbols create incorrect documentation, confuse reviewers, and may indicate deeper implementation issues |
| **Assume symbol names from patterns** | Symbol naming varies; always verify with grep |
| **Reference "planned" but unimplemented symbols** | Documentation must reflect actual code, not intentions |
| **Skip self-review after each task** | Hidden errors compound; early detection saves time |
| **Proceed when symbol cannot be verified** | Stop and investigate; the symbol may not exist |
| **Document symbols from memory** | Always verify against actual code |

---

## Quick Reference

### Mandatory Self-Review Steps

1. ✅ **Symbol Verification** — All symbols have provenance
2. ✅ **Assumption Review** — Design decisions documented
3. ✅ **Quality Checks** — Code, tests, docs meet standards
4. ✅ **User Checkpoint** — Confirmation before proceeding

### Key Commands

```bash
# Verify symbol exists
grep -r "SymbolName" --include="*.rs" .

# Check git history for removed symbols
git log --all --oneline -S "SymbolName" -- "*.rs"

# Compare branch to main for new symbols
git diff origin/main -- "*.rs" | grep "^+"

# List files with changes
git diff origin/main --name-only
```

---

## Related Guides

- [Assumptions Guide](12-assumptions-review.md) — Detailed assumption categories and log template
- [Work Package Workflow](11-work-package.md) — Overall implementation workflow
- [Architecture Review Guide](14-architecture-review.md) — Architecture decision records
